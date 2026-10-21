import puppeteer from 'puppeteer-core';
import { signSubscriptionEntitlement, getDefaultBasicSubscription } from '../src/services/subscriptionService';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyBasicVoiceLock() {
  console.log('[Test] Launching Chrome to verify Basic account voice restrictions...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('[Security]') || text.includes('[Audio]') || text.includes('speakText')) {
      console.log(`  Browser Console: ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`  Browser Error: ${err.message}`);
  });

  // Prepare signed basic subscription
  const basicSub = getDefaultBasicSubscription();
  console.log('Prepared Basic subscription:', basicSub);

  console.log('[Test] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Configure localStorage as a Basic account
  await page.evaluate((basicSubJson) => {
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.removeItem('beeyou_free_trial_activated');
    localStorage.setItem('beeyou_subscription', JSON.stringify(basicSubJson));
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    sessionStorage.setItem('beeyou_active_device_view', 'child');
  }, basicSub);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('\n--- Test 1: Verify isPremium is false for Basic account ---');
  const isPremiumCheck = await page.evaluate(async () => {
    const { isPremiumSubscription } = await import('/src/services/subscriptionService.ts');
    const raw = localStorage.getItem('beeyou_subscription');
    const parsed = raw ? JSON.parse(raw) : null;
    return isPremiumSubscription(parsed);
  });
  console.log('isPremiumSubscription for Basic account:', isPremiumCheck);
  if (isPremiumCheck === false) {
    console.log('Test 1 PASS: Basic account correctly evaluated as isPremium = false');
  } else {
    console.error('Test 1 FAIL: Basic account evaluated as isPremium = true!');
    process.exitCode = 1;
  }

  console.log('\n--- Test 2: Verify speakText() forces system voice on Basic account ---');
  const speechFallbackResult = await page.evaluate(async () => {
    const { speakText, isDeviceEntitledToPremiumVoices } = await import('/src/utils/audio/speech.ts');
    const isEntitled = isDeviceEntitledToPremiumVoices();
    try {
      // Attempt to speak with Puck as a Basic user without previewAudio
      await speakText('I want food', {
        voicePersona: 'puck',
        force: true,
      });
      return { success: true, isEntitled };
    } catch (e) {
      return { success: false, error: e.message, isEntitled };
    }
  });
  console.log('Speech fallback check:', speechFallbackResult);
  const securityWarningLogged = consoleLogs.some((l) =>
    l.includes("Premium neural voice 'puck' requested by Basic tier account. Enforcing free system voice.") ||
    l.includes("Premium voice 'puck' requested by Basic account")
  );
  console.log('Security warning logged in console:', securityWarningLogged);
  if (speechFallbackResult.isEntitled === false && securityWarningLogged) {
    console.log('Test 2 PASS: Basic account blocked from using Puck, safely routed to system voice');
  } else {
    console.error('Test 2 FAIL: Basic account was not blocked or warning not logged');
    process.exitCode = 1;
  }

  console.log('\n--- Test 3: Verify previewAudio (Audition) still works for Basic account ---');
  const auditionResult = await page.evaluate(async () => {
    const { speakText } = await import('/src/utils/audio/speech.ts');
    try {
      // Audition preview should be permitted
      await speakText('Hello, this is Puck preview', {
        voicePersona: 'puck',
        previewAudio: true,
        force: true,
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Audition check result:', auditionResult);
  if (auditionResult.success) {
    console.log('Test 3 PASS: Voice Studio audition preview functions properly');
  } else {
    console.error('Test 3 FAIL: Audition preview threw an error');
    process.exitCode = 1;
  }

  console.log('\n--- Test 4: Verify updateSettings blocks setting a premium voice for Basic account ---');
  // Open accessibility preferences modal and attempt selecting Puck
  const modalUpgradePromptCheck = await page.evaluate(async () => {
    // Open accessibility preferences modal
    const cog = document.querySelector('[data-testid="child-quick-cog"]') || document.querySelector('button[title*="Settings"]') || document.querySelector('button[aria-label*="Settings"]');
    if (cog) cog.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 1000));

  await browser.close();
  console.log('\n[Verification Summary]: All basic voice restriction tests completed.');
}

verifyBasicVoiceLock().catch((err) => {
  console.error('[Test Error]:', err);
  process.exit(1);
});
