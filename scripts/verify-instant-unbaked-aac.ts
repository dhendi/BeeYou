import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testUnbakedSpeech() {
  console.log('[Test] Launching Chrome for instant unbaked speech test...');
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
    const phrase = 'I would like some cold orange juice please ' + Date.now();

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
        speechMod.speakText(text, { preferOfflineOnly: false });
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

  console.log('[Test Results]:', JSON.stringify(testResults, null, 2));

  if (testResults.firstCallLatency > 1500) {
    throw new Error(`First call latency was too slow: ${testResults.firstCallLatency}ms`);
  }

  if (testResults.secondCallLatency > 100) {
    throw new Error(`Second call latency was not instant: ${testResults.secondCallLatency}ms`);
  }

  console.log(`SUCCESS: First call started sound in ${testResults.firstCallLatency}ms, second call started in ${testResults.secondCallLatency}ms (instant 0ms cache)!`);
  await browser.close();
}

testUnbakedSpeech().catch(err => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
