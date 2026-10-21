import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSpanishUnbaked() {
  console.log('[Test] Testing un-baked Spanish phrase in Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  const testResults = await page.evaluate(`(async () => {
    const speechMod = await import('/src/utils/audio/speech.ts');
    const phrase = 'Quiero una limonada fresca con hielo por favor ' + Date.now();

    function measureTimeToSound(text) {
      return new Promise((resolve) => {
        const t0 = performance.now();
        let unsub;
        unsub = speechMod.subscribeToSpeechState((isSpeaking) => {
          if (isSpeaking) {
            const latency = Math.round(performance.now() - t0);
            if (unsub) unsub();
            resolve(latency);
          }
        });
        speechMod.speakText(text, { preferOfflineOnly: false, lang: 'es' });
      });
    }

    const firstCallLatency = await measureTimeToSound(phrase);
    speechMod.stopSpeaking();
    await new Promise(r => setTimeout(r, 200));

    const secondCallLatency = await measureTimeToSound(phrase);
    speechMod.stopSpeaking();

    return {
      phrase,
      firstCallLatency,
      secondCallLatency,
    };
  })()`);

  console.log('[Spanish Test Results]:', JSON.stringify(testResults, null, 2));

  if (testResults.firstCallLatency > 1500) {
    throw new Error(`Spanish first call was too slow: ${testResults.firstCallLatency}ms`);
  }

  if (testResults.secondCallLatency > 100) {
    throw new Error(`Spanish second call was not cached: ${testResults.secondCallLatency}ms`);
  }

  console.log(`SUCCESS: Spanish un-baked phrase started in ${testResults.firstCallLatency}ms and second call was ${testResults.secondCallLatency}ms!`);
  await browser.close();
}

testSpanishUnbaked().catch(err => {
  console.error('[Spanish Test Failed]:', err);
  process.exit(1);
});
