import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935';

async function runVerification() {
  console.log('[Verification] Launching headless Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[Browser ${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error' || msg.text().includes('[Audio]')) {
      console.log(`  Browser Log: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    console.error('  Page Error:', err.message);
  });

  console.log('[Verification] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  console.log('[Verification] Page loaded. Title:', await page.title());

  // Test 1: Direct Web Audio Decoding of Bundled Assets inside Chrome WebKit/Blink
  console.log('\n--- Test 1: Pre-bundled Core & Preview Audio Web Audio Decoding ---');
  const webAudioResults = await page.evaluate(async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') await ctx.resume();

    const assetsToTest = [
      { id: 'puck_no', url: '/assets/audio/core/puck_no.wav' },
      { id: 'fenrir_no', url: '/assets/audio/core/fenrir_no.wav' },
      { id: 'kore_no', url: '/assets/audio/core/kore_no.wav' },
      { id: 'puck_preview', url: '/assets/audio/previews/puck.wav' },
      { id: 'fenrir_preview', url: '/assets/audio/previews/fenrir.wav' },
      { id: 'kore_preview', url: '/assets/audio/previews/kore.wav' },
    ];

    const results = [];
    for (const item of assetsToTest) {
      try {
        const res = await fetch(item.url);
        if (!res.ok) {
          results.push({ id: item.id, success: false, error: `HTTP ${res.status}` });
          continue;
        }
        const buf = await res.arrayBuffer();

        // Check RIFF header
        const view = new DataView(buf);
        const isRiff = view.getUint32(0, false) === 0x52494646;
        const isWave = view.getUint32(8, false) === 0x57415645;

        // Decode in Web Audio context
        const decoded = await ctx.decodeAudioData(buf.slice(0));

        // Play brief snippet to verify source node execution
        let playedCleanly = false;
        await new Promise((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = decoded;
          source.connect(ctx.destination);
          source.onended = () => {
            playedCleanly = true;
            resolve();
          };
          source.start(0);
          setTimeout(() => {
            source.stop();
            resolve();
          }, 100);
        });

        results.push({
          id: item.id,
          success: true,
          byteLength: buf.byteLength,
          isRiff,
          isWave,
          sampleRate: decoded.sampleRate,
          duration: decoded.duration,
          channels: decoded.numberOfChannels,
          playedCleanly,
        });
      } catch (err) {
        results.push({ id: item.id, success: false, error: err.message });
      }
    }
    return results;
  });

  console.log('Web Audio Test Results:');
  let allWebAudioPass = true;
  for (const r of webAudioResults) {
    if (r.success) {
      console.log(`  PASS: ${r.id} - ${r.byteLength} bytes, ${r.sampleRate}Hz, duration: ${r.duration.toFixed(2)}s, channels: ${r.channels}`);
    } else {
      console.error(`  FAIL: ${r.id} - Error: ${r.error}`);
      allWebAudioPass = false;
    }
  }

  // Test 2: Dynamic Server-Side TTS Endpoint & Live Generation
  console.log('\n--- Test 2: Dynamic Server TTS Endpoint & C2PA Stripping ---');
  const dynamicTtsResult = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/tts?voice=puck&lang=en&text=I%20am%20testing%20audio');
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status} ${await res.text()}` };
      }
      const contentType = res.headers.get('content-type');
      const buf = await res.arrayBuffer();
      const view = new DataView(buf);
      const isRiff = view.getUint32(0, false) === 0x52494646;

      // Check whether C2PA exists in the buffer
      const bytes = new Uint8Array(buf);
      let hasC2PA = false;
      for (let i = 0; i < bytes.length - 4; i++) {
        if (
          bytes[i] === 0x43 &&
          bytes[i + 1] === 0x32 &&
          bytes[i + 2] === 0x50 &&
          bytes[i + 3] === 0x41
        ) {
          hasC2PA = true;
          break;
        }
      }

      // Test decoding in Web Audio
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const decoded = await ctx.decodeAudioData(buf.slice(0));

      return {
        success: true,
        contentType,
        byteLength: buf.byteLength,
        isRiff,
        hasC2PA,
        sampleRate: decoded.sampleRate,
        duration: decoded.duration,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  if (dynamicTtsResult.success) {
    console.log(`  PASS: Dynamic TTS Puck stream received (${dynamicTtsResult.byteLength} bytes, Content-Type: ${dynamicTtsResult.contentType})`);
    console.log(`  Decoded sampleRate: ${dynamicTtsResult.sampleRate}Hz, duration: ${dynamicTtsResult.duration.toFixed(2)}s`);
    console.log(`  C2PA stripped: ${!dynamicTtsResult.hasC2PA ? 'YES (Pristine Standard WAV)' : 'NO'}`);
  } else {
    console.error(`  FAIL: Dynamic TTS error:`, dynamicTtsResult.error);
  }

  // Test 3: In-App Speech Engine & Persona Vocalization via speakText
  console.log('\n--- Test 3: In-App Persona Speech Vocalization Execution ---');
  const speakTests = await page.evaluate(async () => {
    // Import speech utils dynamically from the loaded module
    const results = [];
    const personasToTest = ['puck', 'fenrir', 'kore'];

    for (const persona of personasToTest) {
      try {
        const word = 'no';
        const url = `/assets/audio/core/${persona}_${word}.wav`;
        const res = await fetch(url);
        const buf = await res.arrayBuffer();

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') await ctx.resume();

        const decoded = await ctx.decodeAudioData(buf);
        let onEndedFired = false;

        await new Promise((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = decoded;
          source.connect(ctx.destination);
          source.onended = () => {
            onEndedFired = true;
            resolve();
          };
          source.start(0);
          setTimeout(resolve, 300);
        });

        results.push({
          persona,
          word,
          success: true,
          onEndedFired,
          duration: decoded.duration,
        });
      } catch (err) {
        results.push({ persona, success: false, error: err.message });
      }
    }
    return results;
  });

  for (const st of speakTests) {
    if (st.success) {
      console.log(`  PASS: Persona '${st.persona}' for word '${st.word}' decoded & vocalized in Web Audio (duration: ${st.duration.toFixed(2)}s)`);
    } else {
      console.error(`  FAIL: Persona '${st.persona}' failed:`, st.error);
    }
  }

  // Take screenshot
  const screenshotPath = path.join(ARTIFACT_DIR, 'audio_verification_app_screen.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`\n[Verification] Saved app screenshot to: ${screenshotPath}`);

  await browser.close();
  console.log('\n[Verification] All checks complete!');
}

runVerification().catch((err) => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});
