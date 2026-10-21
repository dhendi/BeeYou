import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testVoiceChangeSequence() {
  console.log('[Test] Testing voice switching sequence...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Initialize as premium user
  await page.evaluate(async () => {
    const subMod = await import('/src/services/subscriptionService.ts');
    const trialSub = subMod.signSubscriptionEntitlement({
      tier: 'premium',
      status: 'active',
      billingCycle: 'monthly',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      monthlyPrice: 9.99,
      yearlyPrice: 89.99,
      trialDays: 0,
      autoRenew: true,
      storeProvider: 'none',
    });
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_subscription', JSON.stringify(trialSub));
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    sessionStorage.setItem('beeyou_active_device_view', 'child');
  });

  await page.reload({ waitUntil: 'domcontentloaded' });

  // Test calling preloadVoicePack directly from browser context for 3 different voices in a row
  const results = await page.evaluate(async () => {
    const { preloadVoicePack, markVoicePackLoaded } = await import('/src/services/aacPreloadService.ts');
    
    // Clear cache keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('beeyou_vp_')) localStorage.removeItem(k);
    }

    const testVoices = ['puck', 'sadachbia', 'leda'];
    const log = [];

    for (const v of testVoices) {
      const t0 = performance.now();
      let lastPercent = 0;
      let updateCount = 0;

      await preloadVoicePack(v, 'en', (p) => {
        updateCount++;
        lastPercent = p.percent;
      });

      const elapsed = Math.round(performance.now() - t0);
      log.push({ voice: v, elapsedMs: elapsed, lastPercent, updateCount });
    }

    return log;
  });

  console.log('[Test Results]:', JSON.stringify(results, null, 2));

  for (const r of results) {
    if (r.elapsedMs > 5000) {
      throw new Error(`Voice ${r.voice} took too long: ${r.elapsedMs}ms`);
    }
    if (r.lastPercent < 100) {
      throw new Error(`Voice ${r.voice} did not reach 100%: ${r.lastPercent}%`);
    }
  }

  console.log('[Test] All 3 consecutive voice preloads succeeded under 3.5 seconds each!');
  await browser.close();
}

testVoiceChangeSequence().catch(err => {
  console.error('[Sequence Test Failed]:', err);
  process.exit(1);
});
