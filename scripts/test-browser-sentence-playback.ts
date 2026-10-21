import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBrowserSentencePlayback() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  const logs: string[] = [];

  page.on('console', (msg) => {
    const txt = msg.text();
    logs.push(txt);
    console.log(`[Browser Console]: ${txt}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[Browser PageError]: ${err.message}`);
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Check current settings and subscription in localStorage
  const storageState = await page.evaluate(() => {
    return {
      settings: localStorage.getItem('beeyou_settings'),
      subscription: localStorage.getItem('beeyou_subscription'),
    };
  });
  console.log('Storage state:', storageState);

  // Trigger speak of "I want a drink."
  console.log('Executing test sentence speak in browser context...');
  const result = await page.evaluate(async () => {
    const { speakText } = await import('/src/utils/audio/speech.ts');
    let persona = 'system';
    try {
      const s = JSON.parse(localStorage.getItem('beeyou_settings') || '{}');
      if (s.voicePersona) persona = s.voicePersona;
    } catch {}
    console.log('Calling speakText with persona:', persona);
    await speakText('I want a drink.', { voicePersona: persona });
    return 'done';
  });

  console.log('Result:', result);
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
}

testBrowserSentencePlayback().catch(console.error);
