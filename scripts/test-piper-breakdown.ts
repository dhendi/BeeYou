import puppeteer from 'puppeteer-core';
import path from 'path';
import os from 'os';

async function testPiperBreakdown() {
  console.log('====================================================');
  console.log('MEASURING PIPER INTERNAL LATENCY BREAKDOWN');
  console.log('====================================================');

  const userDataDir = path.join(os.tmpdir(), `puppeteer_test_profile_${Date.now()}`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('  [BROWSER]', msg.text()));
  page.on('pageerror', err => console.error('  [PAGE ERROR]', err));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  const result = await page.evaluate(`
    (async () => {
      const {
        preloadPiperVoice,
        synthesizeWithPiper,
        resolvePiperVoiceId,
        getActivePiperVoiceId,
        getLastPiperTimings,
      } = await import('/src/services/piperTtsService.ts');

      console.log('Ensuring Piper Amy is preloaded...');
      const tPreload0 = performance.now();
      await preloadPiperVoice('amy', 'en');
      const preloadTime = Math.round(performance.now() - tPreload0);
      console.log('Preload complete in ' + preloadTime + 'ms');

      // Test 1: Single Word ('Water')
      const tSingle0 = performance.now();
      const bufSingle = await synthesizeWithPiper('Water', 'amy', 'en');
      const singleMs = Math.round(performance.now() - tSingle0);
      console.log('Single word Water synthesized in ' + singleMs + 'ms', JSON.stringify(getLastPiperTimings()));

      // Test 2: Short Sentence ('I want a drink')
      const tShort0 = performance.now();
      const bufShort = await synthesizeWithPiper('I want a drink', 'amy', 'en');
      const shortMs = Math.round(performance.now() - tShort0);
      console.log('Short sentence synthesized in ' + shortMs + 'ms', JSON.stringify(getLastPiperTimings()));

      // Test 3: Novel 10-word Sentence
      const tMed0 = performance.now();
      const bufMed = await synthesizeWithPiper('I would like to have some cold water right now', 'amy', 'en');
      const medMs = Math.round(performance.now() - tMed0);
      console.log('Medium sentence synthesized in ' + medMs + 'ms', JSON.stringify(getLastPiperTimings()));

      // Test 4: Novel 20-word Sentence
      const tLong0 = performance.now();
      const longText = 'Today is a wonderful sunny day and I would really love to go outside to the park with my good friends';
      const bufLong = await synthesizeWithPiper(longText, 'amy', 'en');
      const longMs = Math.round(performance.now() - tLong0);
      console.log('Long sentence synthesized in ' + longMs + 'ms', JSON.stringify(getLastPiperTimings()));

      return {
        preloadTimeMs: preloadTime,
        singleWordMs: singleMs,
        shortSentenceMs: shortMs,
        mediumSentenceMs: medMs,
        longSentenceMs: longMs,
        singleBytes: bufSingle ? bufSingle.byteLength : 0,
        shortBytes: bufShort ? bufShort.byteLength : 0,
        mediumBytes: bufMed ? bufMed.byteLength : 0,
        longBytes: bufLong ? bufLong.byteLength : 0,
      };
    })()
  `);

  console.log('\n====================================================');
  console.log('PIPER MEASUREMENTS:');
  console.log(JSON.stringify(result, null, 2));
  console.log('====================================================');

  await browser.close();
}

testPiperBreakdown().catch(console.error);
