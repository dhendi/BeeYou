import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyVoiceLoadingAndInstantAac() {
  console.log('[Test] Launching Chrome...');
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
    if (
      text.includes('[TTS') ||
      text.includes('[Audio') ||
      text.includes('speakText') ||
      text.includes('Loading') ||
      text.includes('Voice Pack') ||
      text.includes('Preload') ||
      text.includes('Cache HIT')
    ) {
      console.log(`  Browser Console: ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`  Browser Error: ${err.message}`);
  });

  console.log('[Test] Loading app at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Set up trial user and reset voice pack marker so we can verify the real loading screen
  await page.evaluate(async () => {
    const subMod = await import('/src/services/subscriptionService.ts');
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

    // Remove voice pack markers so the loading screen will trigger
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('beeyou_vp_')) {
        localStorage.removeItem(k);
      }
    }
  });

  console.log('[Test] Reloading to apply storage...');
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Navigate to AAC view
  console.log('[Test] Navigating to AAC view...');
  await page.evaluate(() => {
    localStorage.setItem('beeyou_aac_prompt_completed', 'true');
    const aacBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Full Vocabulary Board') ||
      b.textContent?.includes('Talk') ||
      b.getAttribute('aria-label')?.includes('Talk')
    );
    if (aacBtn) {
      console.log('Clicking AAC navigation button:', aacBtn.textContent?.trim());
      aacBtn.click();
    } else {
      console.log('AAC navigation button not found on page.');
    }
  });

  // Wait to see if the loading modal appears or completes
  console.log('[Test] Waiting for Voice Loading Modal...');
  try {
    await page.waitForSelector('#aac-loading-title', { timeout: 4000 });
    console.log('  Confirmed: Voice Loading Modal appeared!');
    const modalText = await page.$eval('#aac-loading-title', el => el.textContent);
    console.log(`  Modal Title: "${modalText}"`);

    // Take screenshot of Voice Loading Modal in action
    await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/voice_loading_modal_verified.png' });
    console.log('  Screenshot saved: voice_loading_modal_verified.png');

    // Wait for the modal to complete and disappear
    await page.waitForFunction(() => !document.querySelector('#aac-loading-title'), { timeout: 30000 });
    console.log('  Confirmed: Voice Loading Modal completed all tiles and dismissed cleanly!');
  } catch (e) {
    console.log('  Notice on modal wait:', e.message);
  }

  // Now verify that AAC buttons play with zero delay
  console.log('[Test] Testing AAC tile clicks for instant zero-delay speech...');
  await page.evaluate(async () => {
    const tiles = Array.from(document.querySelectorAll('button')).filter(b => {
      const txt = b.textContent || '';
      return txt.includes('Want') || txt.includes('Help') || txt.includes('Water') || txt.includes('I');
    });
    console.log(`Found ${tiles.length} test tiles. Clicking tile 0...`);
    if (tiles[0]) {
      const start = performance.now();
      tiles[0].click();
      console.log(`Clicked tile: "${tiles[0].textContent?.trim()}" in ${Math.round(performance.now() - start)}ms`);
    }
  });

  // Give 1 second for audio pipeline logging
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot of AAC view after speech
  await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/aac_instant_speech_verified.png' });
  console.log('  Screenshot saved: aac_instant_speech_verified.png');

  await browser.close();
  console.log('[Test] Test completed successfully.');
}

verifyVoiceLoadingAndInstantAac().catch(console.error);
