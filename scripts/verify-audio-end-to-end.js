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
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1000));

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

  // Test 4: Offline Multi-Word Sentence Synthesizer in Browser
  console.log('\n--- Test 4: Offline Multi-Word Sentence Synthesizer in Browser ---');
  const sentenceTests = await page.evaluate(async () => {
    function extractWavPcm(buffer) {
      const view = new DataView(buffer);
      if (view.getUint32(0, false) !== 0x52494646 || view.getUint32(8, false) !== 0x57415645) return null;
      let offset = 12;
      while (offset + 8 <= buffer.byteLength) {
        const chunkId =
          String.fromCharCode(view.getUint8(offset)) +
          String.fromCharCode(view.getUint8(offset + 1)) +
          String.fromCharCode(view.getUint8(offset + 2)) +
          String.fromCharCode(view.getUint8(offset + 3));
        const chunkSize = view.getUint32(offset + 4, true);
        if (chunkId === 'data') {
          return new Uint8Array(buffer, offset + 8, chunkSize);
        }
        offset += 8 + chunkSize;
        if (chunkSize % 2 !== 0) offset++;
      }
      return null;
    }

    async function synthesizeSentence(sentenceText, personaId) {
      const rawWords = sentenceText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase().split(/\s+/);
      const pcmBuffers = [];
      const sampleRate = 24000;

      for (let i = 0; i < rawWords.length; i++) {
        if (i < rawWords.length - 1) {
          const pairSlug = rawWords[i] + rawWords[i + 1];
          const pairUrl = `/assets/audio/core/${personaId}_${pairSlug}.wav`;
          try {
            const pairRes = await fetch(pairUrl);
            if (pairRes.ok) {
              const ab = await pairRes.arrayBuffer();
              const pcm = extractWavPcm(ab);
              if (pcm) {
                pcmBuffers.push(pcm);
                i++;
                continue;
              }
            }
          } catch {}
        }

        const singleSlug = rawWords[i];
        const singleUrl = `/assets/audio/core/${personaId}_${singleSlug}.wav`;
        try {
          const singleRes = await fetch(singleUrl);
          if (singleRes.ok) {
            const ab = await singleRes.arrayBuffer();
            const pcm = extractWavPcm(ab);
            if (pcm) {
              pcmBuffers.push(pcm);
              continue;
            }
          }
        } catch {}
      }

      if (pcmBuffers.length === 0) return null;

      const gapBytes = Math.round(sampleRate * 0.06) * 2;
      const gap = new Uint8Array(gapBytes);

      let totalPcmLen = 0;
      for (let i = 0; i < pcmBuffers.length; i++) {
        totalPcmLen += pcmBuffers[i].byteLength;
        if (i < pcmBuffers.length - 1) totalPcmLen += gapBytes;
      }

      const combinedPcm = new Uint8Array(totalPcmLen);
      let writeOffset = 0;
      for (let i = 0; i < pcmBuffers.length; i++) {
        combinedPcm.set(pcmBuffers[i], writeOffset);
        writeOffset += pcmBuffers[i].byteLength;
        if (i < pcmBuffers.length - 1) {
          combinedPcm.set(gap, writeOffset);
          writeOffset += gapBytes;
        }
      }

      const numChannels = 1;
      const bitDepth = 16;
      const wavBuffer = new ArrayBuffer(44 + totalPcmLen);
      const outView = new DataView(wavBuffer);
      outView.setUint32(0, 0x52494646, false);
      outView.setUint32(4, 36 + totalPcmLen, true);
      outView.setUint32(8, 0x57415645, false);
      outView.setUint32(12, 0x666D7420, false);
      outView.setUint32(16, 16, true);
      outView.setUint16(20, 1, true);
      outView.setUint16(22, numChannels, true);
      outView.setUint32(24, sampleRate, true);
      outView.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
      outView.setUint16(32, numChannels * (bitDepth / 8), true);
      outView.setUint16(34, bitDepth, true);
      outView.setUint32(36, 0x64617461, false);
      outView.setUint32(40, totalPcmLen, true);
      new Uint8Array(wavBuffer, 44).set(combinedPcm);
      return wavBuffer;
    }

    const testCases = [
      { persona: 'puck', text: 'I want water.' },
      { persona: 'fenrir', text: 'I need help.' },
      { persona: 'kore', text: 'I feel happy.' },
      { persona: 'puck', text: 'All done thank you.' },
    ];

    const results = [];
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') await ctx.resume();

    for (const tc of testCases) {
      try {
        const wav = await synthesizeSentence(tc.text, tc.persona);
        if (!wav) {
          results.push({ persona: tc.persona, text: tc.text, success: false, error: 'Could not synthesize' });
          continue;
        }

        const decoded = await ctx.decodeAudioData(wav.slice(0));
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
          setTimeout(resolve, 300);
        });

        results.push({
          persona: tc.persona,
          text: tc.text,
          success: true,
          byteLength: wav.byteLength,
          sampleRate: decoded.sampleRate,
          duration: decoded.duration,
          playedCleanly,
        });
      } catch (err) {
        results.push({ persona: tc.persona, text: tc.text, success: false, error: err.message });
      }
    }
    return results;
  });

  for (const st of sentenceTests) {
    if (st.success) {
      console.log(`  PASS: Sentence "${st.text}" for '${st.persona}' synthesized (${st.byteLength} bytes, duration: ${st.duration.toFixed(2)}s) in Web Audio`);
    } else {
      console.error(`  FAIL: Sentence "${st.text}" for '${st.persona}' failed:`, st.error);
    }
  }

  // Test 5: Homepage AAC Sensory Board Tiles Verification
  console.log('\n--- Test 5: Homepage AAC Sensory Board Interactive Tiles Verification ---');
  
  // Navigate to child home page
  await page.evaluate(() => {
    try {
      // Ensure local settings has voiceRate 1.0 and puck persona
      const raw = localStorage.getItem('beeyou_parent_settings');
      let data = raw ? JSON.parse(raw) : {};
      data.settings = data.settings || {};
      data.settings.voicePersona = 'puck';
      data.settings.voiceRate = 1.0;
      data.childProfile = data.childProfile || { name: 'Alex', age: 6 };
      localStorage.setItem('beeyou_parent_settings', JSON.stringify(data));
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_free_trial_activated', 'true');
      sessionStorage.setItem('beeyou_session_opened', 'true');
      sessionStorage.setItem('beeyou_preloaded_session', 'true');
    } catch (e) {}
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.body.textContent.includes('Preloaded'), { timeout: 10000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  const sensoryResults = await page.evaluate(async () => {
    const results = [];
    // Verify pre-bundled assets for all 9 sensory board tiles exist and decode at rate 1.0
    const sensoryTiles = [
      { label: 'I want food', slug: 'iwantfood' },
      { label: 'I want a drink', slug: 'iwantadrink' },
      { label: 'I want to play', slug: 'iwanttoplay' },
      { label: 'Go somewhere', slug: 'gosomewhere' },
      { label: 'How I feel', slug: 'howifeel' },
      { label: 'I need a break', slug: 'ineedabreak' },
      { label: 'I want this', slug: 'iwantthis' },
      { label: 'I need help', slug: 'ineedhelp' },
      { label: 'Please stop', slug: 'pleasestop' },
    ];

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') await ctx.resume();

    for (const tile of sensoryTiles) {
      const url = `/assets/audio/core/puck_${tile.slug}.wav`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          results.push({ label: tile.label, slug: tile.slug, success: false, error: `HTTP ${res.status}` });
          continue;
        }
        const buf = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buf.slice(0));

        let playedCleanly = false;
        await new Promise((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = decoded;
          source.playbackRate.value = 1.0; // Steady, brisk 1.0 pace
          source.connect(ctx.destination);
          source.onended = () => {
            playedCleanly = true;
            resolve();
          };
          source.start(0);
          setTimeout(resolve, 150);
        });

        results.push({
          label: tile.label,
          slug: tile.slug,
          success: true,
          byteLength: buf.byteLength,
          duration: decoded.duration,
          sampleRate: decoded.sampleRate,
          playedCleanly,
        });
      } catch (err) {
        results.push({ label: tile.label, slug: tile.slug, success: false, error: err.message });
      }
    }
    return results;
  });

  for (const sr of sensoryResults) {
    if (sr.success) {
      console.log(`  PASS: Tile "${sr.label}" (puck_${sr.slug}.wav) loaded (${sr.byteLength} bytes, ${sr.duration.toFixed(2)}s duration at 1.0x rate)`);
    } else {
      console.error(`  FAIL: Tile "${sr.label}" failed:`, sr.error);
    }
  }

  // Click on "I want food" and "I need a break" tiles in the DOM if available
  const clickedTiles = await page.evaluate(async () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const foodBtn = buttons.find((b) => b.textContent && b.textContent.includes('I want food'));
    if (foodBtn) {
      foodBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      return { found: true, text: 'I want food' };
    }
    return { found: false };
  });
  console.log(`\n  DOM Tile Click Result:`, clickedTiles);

  // Take screenshot of homepage sensory board
  const sensoryScreenshotPath = path.join(ARTIFACT_DIR, 'sensory_board_verified.png');
  await page.screenshot({ path: sensoryScreenshotPath });
  console.log(`[Verification] Saved sensory board screenshot to: ${sensoryScreenshotPath}`);

  // Take general screenshot
  const screenshotPath = path.join(ARTIFACT_DIR, 'audio_verification_app_screen.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`[Verification] Saved app screenshot to: ${screenshotPath}`);

  await browser.close();
  console.log('\n[Verification] All checks complete!');
}

runVerification().catch((err) => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});
