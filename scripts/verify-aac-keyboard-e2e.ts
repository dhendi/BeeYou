import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\dhenp\\.gemini\\antigravity\\brain\\74eea9cb-9d1e-45ad-af1c-852fac63e935';

async function runE2eVerification() {
  console.log('[E2E Test] Starting AAC Keyboard Voice Synchronization verification...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Monitor network requests
  const ttsRequests: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/tts')) {
      ttsRequests.push(url);
      console.log(`  [Network TTS Request]: ${url}`);
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/tts')) {
      console.log(`  [Network TTS Response]: ${res.status()} ${url.substring(0, 90)}...`);
    }
  });

  page.on('console', (msg) => {
    const txt = msg.text();
    if (txt.includes('[Audio') || txt.includes('[Security') || txt.includes('[TTS') || txt.includes('Keyboard')) {
      console.log(`  [Console]: ${txt}`);
    }
  });

  // ---------------------------------------------------------
  // TEST SCENARIO 1: Premium Account with 'puck' Voice Persona
  // ---------------------------------------------------------
  console.log('\n--- Scenario 1: Premium Account with Puck Voice Persona ---');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(async () => {
    const dynImport = new Function('p', 'return import(p)');
    const subMod = await dynImport('/src/services/subscriptionService.ts');
    const trialSub = subMod.signSubscriptionEntitlement({
      tier: 'premium',
      status: 'trial',
      billingCycle: 'monthly',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      monthlyPrice: 9.99,
      yearlyPrice: 89.99,
      trialDays: 15,
      autoRenew: true,
      storeProvider: 'none',
    });

    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_subscription', JSON.stringify(trialSub));
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    sessionStorage.setItem('beeyou_active_device_view', 'child');

    const appState = {
      settings: {
        voicePersona: 'puck',
        voiceRate: 1.05,
        voicePitch: 1.0,
        language: 'en',
        soundEffects: false,
      },
    };
    localStorage.setItem('beeyou_app_state_v1', JSON.stringify(appState));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Navigate to AAC View
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aacNavBtn = buttons.find(
      (b) => b.textContent?.trim() === 'AAC' || b.getAttribute('aria-label')?.includes('AAC')
    );
    if (aacNavBtn) {
      console.log('Clicking AAC nav tab...');
      aacNavBtn.click();
    }
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Open AAC Keyboard
  const openedModal = await page.evaluate(() => {
    const keyboardBtn = document.querySelector('button[aria-label="Open AAC Keyboard"]') ||
                        document.querySelector('button[title*="AAC Keyboard"]') ||
                        Array.from(document.querySelectorAll('button')).find((b) => b.getAttribute('aria-label')?.includes('Keyboard'));
    if (keyboardBtn) {
      console.log('Found Keyboard button, clicking...');
      (keyboardBtn as HTMLElement).click();
      return true;
    }
    return false;
  });

  console.log('Opened AAC Keyboard modal from AAC sentence bar:', openedModal);
  await new Promise((r) => setTimeout(r, 1000));

  // Check the voice badge in the keyboard header
  const headerDetails = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const voiceBadge = spans.find((s) => s.textContent?.includes('Voice:'));
    const title = Array.from(document.querySelectorAll('h2')).find((h) => h.textContent?.includes('AAC Keyboard'));
    return {
      voiceBadgeText: voiceBadge ? voiceBadge.textContent?.trim() : null,
      titleText: title ? title.textContent?.trim() : null,
    };
  });
  console.log('AAC Keyboard Header Details:', headerDetails);

  // Type on the keyboard: click "I want" predictive prompt then click "water"
  console.log('Typing sentence on AAC Keyboard...');
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const iWantPrompt = allButtons.find((b) => b.textContent?.trim() === 'I want');
    if (iWantPrompt) {
      iWantPrompt.click();
    }
  });

  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const waterPrompt = allButtons.find((b) => b.textContent?.trim() === 'water');
    if (waterPrompt) {
      waterPrompt.click();
    }
  });

  await new Promise((r) => setTimeout(r, 600));

  const typedText = await page.evaluate(() => {
    const textP = document.querySelector('.min-h-\\[68px\\] p, .min-h-\\[76px\\] p');
    return textP ? textP.textContent?.trim() : null;
  });
  console.log('Typed sentence in input box:', typedText);

  // Save screenshot of the open keyboard with Puck voice badge and typed text
  const screenshotPath1 = path.join(ARTIFACT_DIR, 'aac_keyboard_puck_verified.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('Saved screenshot 1 to:', screenshotPath1);

  // Click the SPEAK button
  ttsRequests.length = 0;
  console.log('Clicking SPEAK button on AAC Keyboard...');
  const speakClicked = await page.evaluate(() => {
    const speakBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().includes('SPEAK')
    );
    if (speakBtn) {
      speakBtn.click();
      return true;
    }
    return false;
  });
  console.log('Speak button clicked:', speakClicked);

  // Wait for speech synthesis (Gemini neural TTS)
  await new Promise((r) => setTimeout(r, 6000));

  const hasPuckTts = ttsRequests.some((u) => u.includes('voice=puck'));
  console.log('Verified TTS network call with voice=puck:', hasPuckTts);

  // ---------------------------------------------------------
  // TEST SCENARIO 2: Basic Tier Account (Voice Persona Lock)
  // ---------------------------------------------------------
  console.log('\n--- Scenario 2: Basic Tier Account Lock ---');

  await page.evaluate(async () => {
    const dynImport = new Function('p', 'return import(p)');
    const subMod = await dynImport('/src/services/subscriptionService.ts');
    const basicSub = subMod.getDefaultBasicSubscription();
    localStorage.setItem('beeyou_subscription', JSON.stringify(basicSub));
    const appState = {
      settings: {
        voicePersona: 'puck', // Attempting unauthorized puck voice on basic account
        voiceRate: 1.05,
        voicePitch: 1.0,
        language: 'en',
        soundEffects: false,
      },
    };
    localStorage.setItem('beeyou_app_state_v1', JSON.stringify(appState));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  // Navigate to AAC view and open keyboard
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aacNavBtn = buttons.find(
      (b) => b.textContent?.trim() === 'AAC' || b.getAttribute('aria-label')?.includes('AAC')
    );
    if (aacNavBtn) aacNavBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1000));

  await page.evaluate(() => {
    const keyboardBtn = document.querySelector('button[aria-label="Open AAC Keyboard"]');
    if (keyboardBtn) (keyboardBtn as HTMLElement).click();
  });

  await new Promise((r) => setTimeout(r, 1000));

  const basicHeaderDetails = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const voiceBadge = spans.find((s) => s.textContent?.includes('Voice:'));
    return voiceBadge ? voiceBadge.textContent?.trim() : null;
  });
  console.log('Basic Account Header Voice Badge:', basicHeaderDetails);

  const screenshotPath2 = path.join(ARTIFACT_DIR, 'aac_keyboard_basic_locked_verified.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved screenshot 2 to:', screenshotPath2);

  await browser.close();

  console.log('\n========================================');
  console.log('[VERIFICATION AUDIT RESULTS]');
  console.log('1. Premium Voice Persona Header Badge:', headerDetails.voiceBadgeText);
  console.log('2. Typed Sentence:', typedText);
  console.log('3. TTS Requested with voice=puck:', hasPuckTts);
  console.log('4. Basic Tier Locked Header Badge:', basicHeaderDetails);
  console.log('========================================');

  const scenario1Ok = headerDetails.voiceBadgeText === 'Voice: Puck' && headerDetails.titleText === 'AAC Keyboard';
  const scenario2Ok = basicHeaderDetails === 'Voice: System Voice';

  if (scenario1Ok && scenario2Ok) {
    console.log('[ALL TESTS PASSED] AAC Keyboard successfully synchronizes chosen voice persona and locks basic accounts.');
  } else {
    console.error('[TEST FAILED] Badge details mismatch. Expected Voice: Puck and Voice: System Voice, got:', headerDetails.voiceBadgeText, 'and', basicHeaderDetails);
    process.exit(1);
  }
}

runE2eVerification().catch((err) => {
  console.error('[E2E Error]:', err);
  process.exit(1);
});
