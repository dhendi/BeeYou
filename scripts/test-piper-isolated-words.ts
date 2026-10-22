import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function testPiperWords() {
  console.log('=== TESTING PIPER SINGLE WORDS VS FULL SENTENCE ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[AAC') || text.includes('[Piper')) {
      console.log('  [BROWSER]', text);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  const samples = await page.evaluate(async () => {
    const { synthesizeWithPiper, preloadPiperVoice, resolvePiperVoiceId } = await import('/src/services/piperTtsService.ts');
    
    // Warm up Amy
    await preloadPiperVoice('amy', 'en');

    const testPhrases = [
      { id: 'i_bare', text: 'I' },
      { id: 'i_period', text: 'I.' },
      { id: 'want_bare', text: 'want' },
      { id: 'want_period', text: 'want.' },
      { id: 'my_bare', text: 'my' },
      { id: 'my_period', text: 'my.' },
      { id: 'drink_bare', text: 'drink' },
      { id: 'drink_period', text: 'drink.' },
      { id: 'sentence_full', text: 'I want my drink.' },
    ];

    const results = [];
    for (const item of testPhrases) {
      const t0 = performance.now();
      const buf = await synthesizeWithPiper(item.text, 'amy', 'en');
      const durationMs = Math.round(performance.now() - t0);
      
      let base64 = null;
      if (buf) {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binary);
      }

      results.push({
        id: item.id,
        text: item.text,
        byteLength: buf ? buf.byteLength : 0,
        durationMs,
        base64,
      });
    }

    return results;
  });

  await browser.close();

  // Save generated samples to disk so they can be inspected and listened to
  const outDir = path.resolve('scratch/audio_samples');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('\n--- Audio Generation Results ---');
  for (const s of samples) {
    if (s.base64) {
      const filePath = path.join(outDir, `${s.id}.wav`);
      fs.writeFileSync(filePath, Buffer.from(s.base64, 'base64'));
      console.log(`Saved sample: ${s.id}.wav (${s.byteLength} bytes, took ${s.durationMs}ms) for text "${s.text}"`);
    } else {
      console.error(`Failed to generate: ${s.id}`);
    }
  }

  console.log(`\nSamples saved to: ${outDir}`);
}

testPiperWords().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
