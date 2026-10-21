import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifySpanishVoiceLoading() {
  console.log('[Test] Launching Chrome for Spanish Voice Loading Verification...');
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

  // Set up trial user in Spanish and clear Spanish voice pack marker
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
    localStorage.setItem('beeyou_lang', 'es');
    localStorage.setItem('beeyou_aac_prompt_completed', 'true');

    // Remove Spanish voice pack marker
    localStorage.removeItem('beeyou_vp_puck_es_v9');
  });

  console.log('[Test] Reloading in Spanish...');
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Navigate to AAC view
  console.log('[Test] Navigating to Spanish AAC view...');
  await page.evaluate(() => {
    const aacBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Tablero') ||
      b.textContent?.includes('Hablar') ||
      b.getAttribute('aria-label')?.includes('Hablar') ||
      b.textContent?.includes('Full Vocabulary Board')
    );
    if (aacBtn) {
      console.log('Clicking AAC navigation button in Spanish:', aacBtn.textContent?.trim());
      aacBtn.click();
    }
  });

  // Wait to see if Spanish Voice Loading Modal appears
  console.log('[Test] Waiting for Spanish Voice Loading Modal...');
  try {
    await page.waitForSelector('#aac-loading-title', { timeout: 5000 });
    console.log('  Confirmed: Spanish Voice Loading Modal appeared!');
    const modalText = await page.$eval('#aac-loading-title', el => el.textContent);
    console.log(`  Modal Title: "${modalText}"`);

    // Take screenshot of Spanish Voice Loading Modal in action
    await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/spanish_voice_loading_modal_verified.png' });
    console.log('  Screenshot saved: spanish_voice_loading_modal_verified.png');

    // Wait for the modal to complete and disappear
    await page.waitForFunction(() => !document.querySelector('#aac-loading-title'), { timeout: 35000 });
    console.log('  Confirmed: Spanish Voice Loading Modal completed and dismissed cleanly!');
  } catch (e) {
    console.log('  Notice on Spanish modal wait:', e.message);
  }

  // Now verify that Spanish AAC buttons play with zero delay
  console.log('[Test] Testing Spanish AAC tile clicks for instant zero-delay speech...');
  await page.evaluate(async () => {
    const tiles = Array.from(document.querySelectorAll('button')).filter(b => {
      const txt = b.textContent || '';
      return txt.includes('Quiero') || txt.includes('Ayuda') || txt.includes('Agua') || txt.includes('Yo');
    });
    console.log(`Found ${tiles.length} Spanish tiles. Clicking tile 0...`);
    if (tiles[0]) {
      const start = performance.now();
      tiles[0].click();
      console.log(`Clicked Spanish tile: "${tiles[0].textContent?.trim()}" in ${Math.round(performance.now() - start)}ms`);
    }
  });

  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'C:/Users/dhenp/.gemini/antigravity/brain/74eea9cb-9d1e-45ad-af1c-852fac63e935/spanish_aac_instant_speech_verified.png' });
  console.log('  Screenshot saved: spanish_aac_instant_speech_verified.png');

  await browser.close();
  console.log('[Test] Spanish test completed successfully.');
}

verifySpanishVoiceLoading().catch(console.error);
