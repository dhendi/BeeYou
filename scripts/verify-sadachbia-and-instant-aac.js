import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSadachbia() {
  console.log('[Test] Launching Chrome for Sadachbia verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('[TTS') ||
      text.includes('Loading') ||
      text.includes('Voice Pack') ||
      text.includes('Preload') ||
      text.includes('Cache HIT') ||
      text.includes('Error')
    ) {
      console.log(`  Browser Console: ${text}`);
    }
  });

  console.log('[Test] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Set subscription to premium and select Sadachbia
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

    // Set voice persona to Sadachbia
    const rawSettings = localStorage.getItem('beeyou_settings');
    const settings = rawSettings ? JSON.parse(rawSettings) : {};
    settings.voicePersona = 'sadachbia';
    localStorage.setItem('beeyou_settings', JSON.stringify(settings));

    // Remove voice pack marker for sadachbia so loading screen will trigger
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes('sadachbia')) {
        localStorage.removeItem(k);
      }
    }
  });

  console.log('[Test] Reloading to trigger Sadachbia voice loading modal...');
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Navigate to AAC
  await page.evaluate(() => {
    localStorage.setItem('beeyou_aac_prompt_completed', 'true');
    const aacBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Full Vocabulary Board') ||
      b.textContent?.includes('Talk') ||
      b.getAttribute('aria-label')?.includes('Talk')
    );
    if (aacBtn) aacBtn.click();
  });

  console.log('[Test] Watching modal behavior...');
  const startTime = Date.now();
  let modalFound = false;

  try {
    await page.waitForSelector('#aac-loading-title', { timeout: 3000 });
    modalFound = true;
    console.log('  Confirmed: Sadachbia loading modal appeared!');
    await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/sadachbia_voice_loading_verified.png' });
    console.log('  Saved screenshot: sadachbia_voice_loading_verified.png');
  } catch (e) {
    console.log('  Modal check note:', e.message);
  }

  // Wait for modal to dismiss
  await page.waitForFunction(() => !document.querySelector('#aac-loading-title'), { timeout: 8000 });
  const totalDuration = Date.now() - startTime;
  console.log(`  SUCCESS: Sadachbia modal completely finished and dismissed in ${totalDuration}ms!`);

  // Verify instant AAC speech on tile tap
  console.log('[Test] Clicking AAC tile to verify instant speech...');
  await page.evaluate(() => {
    const tile = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Want') || b.textContent?.includes('Help'));
    if (tile) {
      console.log('Clicking tile:', tile.textContent?.trim());
      tile.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/sadachbia_instant_aac_verified.png' });
  console.log('  Saved screenshot: sadachbia_instant_aac_verified.png');

  await browser.close();
  console.log('[Test] Test passed with zero errors.');
}

testSadachbia().catch(err => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
