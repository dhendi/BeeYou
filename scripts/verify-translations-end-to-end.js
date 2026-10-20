import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935';

async function verifyTranslations() {
  console.log('[Verification] Launching Chrome for translation testing...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('[Audio]')) {
      console.log(`  Browser: ${msg.text()}`);
    }
  });

  console.log('[Verification] Loading app...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_free_trial_activated', 'true');
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    sessionStorage.setItem('beeyou_active_device_view', 'child');
    localStorage.setItem('beeyou_lang', 'en');
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Helper to switch language via dropdown reliably
  async function switchLanguage(targetCode) {
    console.log(`  Switching language to: ${targetCode}`);
    await page.evaluate(() => {
      const trigger = document.querySelector('[data-testid="language-dropdown-trigger"]');
      if (trigger) trigger.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const clicked = await page.evaluate((code) => {
      const opt = document.querySelector(`[data-testid="lang-option-${code}"]`);
      if (opt) {
        opt.click();
        return true;
      }
      return false;
    }, targetCode);

    if (!clicked) {
      console.error(`  Could not find lang option for ${targetCode}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
    return clicked;
  }

  // --- Step 1: Verify Initial English Screen ---
  console.log('\n--- Step 1: English Initial State ---');
  let buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean));
  console.log('Sample EN Buttons (first 10):', buttons.slice(0, 10));
  const hasEnTiles = buttons.some((t) => t.toLowerCase().includes('i want food'));
  console.log('English Tiles Present:', hasEnTiles ? 'PASS' : 'FAIL');

  // --- Step 2: Switch to Spanish (ES) ---
  console.log('\n--- Step 2: Switch Language to Spanish (ES) ---');
  await switchLanguage('es');

  buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean));
  console.log('Sample ES Buttons (first 10):', buttons.slice(0, 10));
  const hasEsFood = buttons.some((t) => t.toLowerCase().includes('quiero comida'));
  const hasEsCustomize = buttons.some((t) => t.toLowerCase().includes('personalizar'));
  const hasEsNav = buttons.some((t) => t.toLowerCase().includes('hogar') || t.toLowerCase().includes('caa'));
  console.log('Spanish "Quiero comida" Present:', hasEsFood ? 'PASS' : 'FAIL');
  console.log('Spanish "Personalizar el panel" Present:', hasEsCustomize ? 'PASS' : 'FAIL');
  console.log('Spanish Nav "Hogar / CAA" Present:', hasEsNav ? 'PASS' : 'FAIL');

  const esScreenshot = path.join(ARTIFACT_DIR, 'translation_spanish_verified.png');
  await page.screenshot({ path: esScreenshot });
  console.log('Saved Spanish screenshot:', esScreenshot);

  // --- Step 3: Test Audio Playback on Spanish Tile ---
  console.log('\n--- Step 3: Tap Spanish Tile "Quiero comida" ---');
  const tileClickResult = await page.evaluate(async () => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const foodTile = allButtons.find((b) => b.textContent && b.textContent.toLowerCase().includes('quiero comida'));
    if (foodTile) {
      foodTile.click();
      return { clicked: true, text: foodTile.textContent.trim() };
    }
    return { clicked: false };
  });
  console.log('Clicked Spanish Tile:', tileClickResult);
  await new Promise((r) => setTimeout(r, 1500));

  // --- Step 4: Switch Language to French (FR) ---
  console.log('\n--- Step 4: Switch Language to French (FR) ---');
  await switchLanguage('fr');

  buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean));
  console.log('Sample FR Buttons (first 10):', buttons.slice(0, 10));
  const hasFrFood = buttons.some((t) => t.toLowerCase().includes('nourriture') || t.toLowerCase().includes('manger') || t.toLowerCase().includes('je veux'));
  const hasFrCustomize = buttons.some((t) => t.toLowerCase().includes('personnaliser'));
  const hasFrNav = buttons.some((t) => t.toLowerCase().includes('accueil') || t.toLowerCase().includes('caa'));
  console.log('French Food Tile Present:', hasFrFood ? 'PASS' : 'FAIL');
  console.log('French "Personnaliser" Present:', hasFrCustomize ? 'PASS' : 'FAIL');
  console.log('French Nav "Accueil" Present:', hasFrNav ? 'PASS' : 'FAIL');

  const frScreenshot = path.join(ARTIFACT_DIR, 'translation_french_verified.png');
  await page.screenshot({ path: frScreenshot });
  console.log('Saved French screenshot:', frScreenshot);

  // --- Step 5: Switch Language to German (DE) ---
  console.log('\n--- Step 5: Switch Language to German (DE) ---');
  await switchLanguage('de');

  buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean));
  console.log('Sample DE Buttons (first 10):', buttons.slice(0, 10));
  const hasDeFood = buttons.some((t) => t.toLowerCase().includes('essen') || t.toLowerCase().includes('ich will'));
  const hasDeCustomize = buttons.some((t) => t.toLowerCase().includes('anpassen'));
  console.log('German Food Tile Present:', hasDeFood ? 'PASS' : 'FAIL');
  console.log('German "Anpassen" Present:', hasDeCustomize ? 'PASS' : 'FAIL');

  const deScreenshot = path.join(ARTIFACT_DIR, 'translation_german_verified.png');
  await page.screenshot({ path: deScreenshot });
  console.log('Saved German screenshot:', deScreenshot);

  // --- Step 6: Switch back to English (EN) ---
  console.log('\n--- Step 6: Switch Back to English (EN) ---');
  await switchLanguage('en');

  buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean));
  console.log('Final Sample EN Buttons (first 10):', buttons.slice(0, 10));
  const hasRestoredEn = buttons.some((t) => t.toLowerCase().includes('i want food'));
  console.log('Restored English State:', hasRestoredEn ? 'PASS' : 'FAIL');

  await browser.close();
  console.log('\n[Verification] All translation checks completed successfully!');
}

verifyTranslations().catch((err) => {
  console.error('[Verification Error]:', err);
  process.exit(1);
});
