import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testTranslatedVoicesAndPuck() {
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
    if (text.includes('[Audio') || text.includes('speakText') || text.includes('CSP') || text.includes('violates') || text.includes('Fetch') || text.includes('Puck')) {
      console.log(`  Browser Console: ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    console.log(`  Browser Error: ${err.message}`);
  });

  console.log('[Test] Loading app at http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_free_trial_activated', 'true');
    sessionStorage.setItem('beeyou_app_session_opened', 'true');
    sessionStorage.setItem('beeyou_active_device_view', 'child');
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('\n--- Step 1: Verify Puck acoustic profile default rate is 1.05 (Fluid & Natural) ---');
  const puckRateCheck = await page.evaluate(async () => {
    const speechMod = await import('/src/utils/audio/speech.ts');
    const profile = speechMod.PERSONA_ACOUSTIC_PROFILES?.puck;
    return profile;
  });
  console.log('Puck acoustic profile:', puckRateCheck);
  const puckRateOk = puckRateCheck && puckRateCheck.rate === 1.05;
  console.log('Puck Rate === 1.05:', puckRateOk ? 'PASS' : 'FAIL');

  console.log('\n--- Step 2: Test Translated Voice Audio in Spanish (Explicit lang: "es") ---');
  const spanishSpeechResult = await page.evaluate(async () => {
    const speechMod = await import('/src/utils/audio/speech.ts');
    const start = Date.now();
    try {
      await speechMod.speakText('Quiero comida', {
        lang: 'es',
        voicePersona: 'puck',
        force: true,
      });
      return { success: true, elapsed: Date.now() - start };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Spanish speech result (explicit):', spanishSpeechResult);

  console.log('\n--- Step 2b: Test Implicit Language Resolution via getLanguage() (Tile Click Simulation) ---');
  const implicitSpanishResult = await page.evaluate(async () => {
    const transMod = await import('/src/services/translator.ts');
    const speechMod = await import('/src/utils/audio/speech.ts');
    transMod.setLanguage('es');
    const start = Date.now();
    try {
      // Simulate button click without passing options.lang
      await speechMod.speakText('Quiero agua', {
        voicePersona: 'puck',
        force: true,
      });
      return { success: true, activeLang: transMod.getLanguage(), elapsed: Date.now() - start };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Implicit Spanish speech result:', implicitSpanishResult);

  console.log('\n--- Step 3: Test Translated Voice Audio in French (Je veux de la nourriture) ---');
  const frenchSpeechResult = await page.evaluate(async () => {
    const speechMod = await import('/src/utils/audio/speech.ts');
    const start = Date.now();
    try {
      await speechMod.speakText('Je veux de la nourriture', {
        lang: 'fr',
        voicePersona: 'puck',
        force: true,
      });
      return { success: true, elapsed: Date.now() - start };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('French speech result:', frenchSpeechResult);

  console.log('\n--- Step 4: Test Translated Voice Audio in German (Ich möchte Essen) ---');
  const germanSpeechResult = await page.evaluate(async () => {
    const speechMod = await import('/src/utils/audio/speech.ts');
    const start = Date.now();
    try {
      await speechMod.speakText('Ich möchte Essen', {
        lang: 'de',
        voicePersona: 'puck',
        force: true,
      });
      return { success: true, elapsed: Date.now() - start };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('German speech result:', germanSpeechResult);

  console.log('\n--- Step 5: Check CSP Violations ---');
  const cspViolations = consoleLogs.filter((log) => log.includes('violates the following Content Security Policy') || log.includes('Refused to connect'));
  console.log('CSP Violations detected:', cspViolations.length);
  if (cspViolations.length > 0) {
    console.log('CSP Violations:', cspViolations);
  } else {
    console.log('Zero CSP Violations: PASS');
  }

  await browser.close();
  console.log('\n[Verification Summary]: All tests completed.');
}

testTranslatedVoicesAndPuck().catch(console.error);
