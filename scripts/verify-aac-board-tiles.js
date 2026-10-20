import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935';

async function runAacBoardVerification() {
  console.log('[AAC Board Test] Launching headless Chrome...');
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
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', (msg) => {
    if (msg.text().includes('[Audio]') || msg.type() === 'error') {
      console.log(`  Browser: ${msg.text()}`);
    }
  });

  console.log('[AAC Board Test] Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Prepare localStorage and sessionStorage so we navigate straight into child AAC view
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('beeyou_parent_settings');
      let data = raw ? JSON.parse(raw) : {};
      data.settings = data.settings || {};
      data.settings.voicePersona = 'puck';
      data.settings.voiceRate = 1.0;
      data.childProfile = data.childProfile || { name: 'Alex', age: 6 };
      localStorage.setItem('beeyou_parent_settings', JSON.stringify(data));
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_free_trial_activated', 'true');
      localStorage.setItem('beeyou_aac_prompt_completed', 'true');
      sessionStorage.setItem('beeyou_app_session_opened', 'true');
      sessionStorage.setItem('beeyou_active_device_view', 'child');
      sessionStorage.setItem('beeyou_child_view', 'aac');
    } catch (e) {}
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Find AAC nav button or click it if not already on AAC
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aacNav = buttons.find((b) => b.textContent && b.textContent.includes('AAC'));
    if (aacNav) aacNav.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Inspect the AAC board DOM
  const boardInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tileLabels = buttons
      .map((b) => b.textContent?.trim())
      .filter((t) => t && t.length > 0 && t.length < 30);
    return {
      totalButtons: buttons.length,
      sampleLabels: tileLabels.slice(0, 15),
    };
  });
  console.log('[AAC Board Test] Loaded board with buttons:', boardInfo.totalButtons);
  console.log('[AAC Board Test] Sample buttons:', boardInfo.sampleLabels);

  // Click single words "I", "want", "water" to add to sentence builder
  const wordsToClick = ['I', 'want', 'water'];
  const clickResults = [];

  for (const word of wordsToClick) {
    const result = await page.evaluate((targetWord) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const found = buttons.find((b) => {
        const aria = b.getAttribute('aria-label')?.toLowerCase() || '';
        const spans = Array.from(b.querySelectorAll('span')).map((s) => s.textContent?.trim().toLowerCase());
        return aria.startsWith(targetWord.toLowerCase()) || spans.includes(targetWord.toLowerCase());
      });
      if (found) {
        found.click();
        return { word: targetWord, found: true, aria: found.getAttribute('aria-label') };
      }
      return { word: targetWord, found: false };
    }, word);

    clickResults.push(result);
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log('[AAC Board Test] Word click results:', clickResults);

  // Now click the SPEAK button on the sentence builder strip
  const speakResult = await page.evaluate(async () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const speakBtn = buttons.find((b) => {
      const text = b.textContent?.trim().toUpperCase() || '';
      const aria = b.getAttribute('aria-label')?.toLowerCase() || '';
      return text.includes('SPEAK') || aria.includes('speak sentence') || aria.includes('speak phrase');
    });
    if (speakBtn) {
      speakBtn.click();
      return { found: true, text: speakBtn.textContent.trim(), aria: speakBtn.getAttribute('aria-label') };
    }
    return { found: false };
  });
  console.log('[AAC Board Test] Sentence Speak button click result:', speakResult);

  await new Promise((r) => setTimeout(r, 2000));

  // Save screenshot of AAC board with sentence built
  const aacScreenshotPath = path.join(ARTIFACT_DIR, 'audio_verification_aac_tiles.png');
  await page.screenshot({ path: aacScreenshotPath });
  console.log('[AAC Board Test] Saved AAC board screenshot to:', aacScreenshotPath);

  await browser.close();
  console.log('[AAC Board Test] Verification complete!');
}

runAacBoardVerification().catch((err) => {
  console.error('[AAC Board Test Error]:', err);
  process.exit(1);
});
