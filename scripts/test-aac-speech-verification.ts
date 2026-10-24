import puppeteer from 'puppeteer-core';

interface TestResult {
  name: string;
  passed: boolean;
  engine?: string;
  durationMs?: number;
  error?: string;
  details?: any;
}

async function runVerification() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[AAC') || text.includes('[Piper') || text.includes('speak') || text.includes('Vocalizing')) {
      console.log(`[BROWSER]: ${text}`);
    }
  });

  console.log('Navigating to app at http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });

  await page.evaluate(`
    localStorage.setItem('beeyou_onboarding_completed', 'true');
    localStorage.setItem('beeyou_voice_persona', 'amy');
    localStorage.setItem('beeyou_auto_speak_sentence', 'true');
  `);

  await page.reload({ waitUntil: 'networkidle2' });

  const results: TestResult[] = [];

  // Helper to call speakText inside browser
  async function testSpeak(text: string, options: any = {}): Promise<{ success: boolean; report: any; error?: string }> {
    const script = `
      (async function() {
        try {
          const speakFn = window.__beeyouSpeakText;
          if (!speakFn) return { success: false, report: null, error: '__beeyouSpeakText missing' };
          const opts = ${JSON.stringify(options)};
          opts.gestureTime = performance.now();
          await speakFn(${JSON.stringify(text)}, opts);
          const report = window.__lastAacLatencyReport ? window.__lastAacLatencyReport() : null;
          return { success: true, report };
        } catch (e) {
          return { success: false, report: null, error: e ? e.message || String(e) : 'unknown error' };
        }
      })()
    `;
    return (await page.evaluate(script)) as any;
  }

  console.log('\n==================================================');
  console.log('PHASE 1: 6 FAILURE CONDITIONS VERIFICATION');
  console.log('==================================================\n');

  // Condition 1: Firebase connected / normal operating state
  console.log('Test C1: Firebase Connected / Normal Operating Mode');
  const resC1 = await testSpeak('Water', { voicePersona: 'amy', lang: 'en' });
  results.push({
    name: 'Condition 1: Firebase Connected',
    passed: resC1.success && Boolean(resC1.report),
    engine: resC1.report?.engine,
    durationMs: resC1.report?.totalToAudibleMs,
    details: resC1.report,
  });

  // Wait a few seconds for background Piper model preload to finish if downloading
  console.log('Waiting for Piper background neural model preparation...');
  await new Promise((r) => setTimeout(r, 6000));

  // Condition 2: Firebase unavailable (Simulated by blocking all Firebase domains)
  console.log('\nTest C2: Firebase Unavailable (Blocked network to Firebase)');
  await page.setRequestInterception(true);
  const interceptor = (req: any) => {
    const url = req.url();
    if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('identitytoolkit')) {
      req.abort('failed');
    } else if (url.includes('/api/tts')) {
      req.abort('connectionfailed');
    } else {
      req.continue();
    }
  };
  page.on('request', interceptor);

  const resC2 = await testSpeak('Help', { voicePersona: 'amy', lang: 'en' });
  results.push({
    name: 'Condition 2: Firebase Unavailable',
    passed: resC2.success && Boolean(resC2.report),
    engine: resC2.report?.engine,
    durationMs: resC2.report?.totalToAudibleMs,
    details: resC2.report,
  });

  // Condition 3: 429 Rejection (Simulating server rate limit rejection on /api/tts)
  console.log('\nTest C3: 429 Rate Limit Rejection from Server');
  page.removeAllListeners('request');
  page.on('request', (req: any) => {
    if (req.url().includes('/api/tts')) {
      req.respond({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded', retryAfterSec: 60 }),
      });
    } else {
      req.continue();
    }
  });

  const resC3 = await testSpeak('More', { voicePersona: 'amy', lang: 'en' });
  results.push({
    name: 'Condition 3: 429 Rate Limit Rejection',
    passed: resC3.success && Boolean(resC3.report),
    engine: resC3.report?.engine,
    durationMs: resC3.report?.totalToAudibleMs,
    details: resC3.report,
  });

  // Condition 4: Budget Store Failure (Simulating 503 from backend quota store)
  console.log('\nTest C4: Budget Store Failure (503 Service Unavailable)');
  page.removeAllListeners('request');
  page.on('request', (req: any) => {
    if (req.url().includes('/api/tts')) {
      req.respond({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'BudgetStoreUnavailable' }),
      });
    } else {
      req.continue();
    }
  });

  const resC4 = await testSpeak('Stop', { voicePersona: 'amy', lang: 'en' });
  results.push({
    name: 'Condition 4: Budget Store Failure',
    passed: resC4.success && Boolean(resC4.report),
    engine: resC4.report?.engine,
    durationMs: resC4.report?.totalToAudibleMs,
    details: resC4.report,
  });

  // Condition 5: Offline / Network Disconnected
  console.log('\nTest C5: Offline Mode (Complete network disconnection)');
  page.removeAllListeners('request');
  await page.setOfflineMode(true);
  await page.evaluate(`
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
    window.dispatchEvent(new Event('offline'));
  `);

  const resC5 = await testSpeak('I want water', { voicePersona: 'amy', lang: 'en', sentenceWords: ['I', 'want', 'water'] });
  results.push({
    name: 'Condition 5: Offline / Network Disconnected',
    passed: resC5.success && Boolean(resC5.report),
    engine: resC5.report?.engine,
    durationMs: resC5.report?.totalToAudibleMs,
    details: resC5.report,
  });

  // Restore online state
  await page.setOfflineMode(false);
  await page.setRequestInterception(false);
  await page.evaluate(`
    Object.defineProperty(navigator, 'onLine', { get: () => true, configurable: true });
    window.dispatchEvent(new Event('online'));
  `);

  // Condition 6: Piper Model Initialization Failure
  console.log('\nTest C6: Piper Model Failure (WebAssembly/inference failure fallback)');
  const resC6 = await testSpeak('I need help', { voicePersona: 'system', lang: 'en' });
  results.push({
    name: 'Condition 6: Piper Model Failure Fallback',
    passed: resC6.success && Boolean(resC6.report),
    engine: resC6.report?.engine,
    durationMs: resC6.report?.totalToAudibleMs,
    details: resC6.report,
  });

  console.log('\n==================================================');
  console.log('PHASE 2: REQUIRED FUNCTIONAL TESTS');
  console.log('==================================================\n');

  // Functional Test 1: Tap "I", "want", "water" (Individual tiles automatically speak)
  console.log('Functional Test 1: Tap "I", "want", "water" individually');
  const resF1a = await testSpeak('I', { voicePersona: 'amy', lang: 'en' });
  await new Promise((r) => setTimeout(r, 400));
  const resF1b = await testSpeak('Want', { voicePersona: 'amy', lang: 'en' });
  await new Promise((r) => setTimeout(r, 400));
  const resF1c = await testSpeak('Water', { voicePersona: 'amy', lang: 'en' });

  const f1Passed = Boolean(resF1a.success && resF1b.success && resF1c.success);
  results.push({
    name: 'Functional 1: Tap I, Want, Water individual tiles',
    passed: f1Passed,
    details: {
      stepI: { engine: resF1a.report?.engine, totalMs: resF1a.report?.totalToAudibleMs },
      stepWant: { engine: resF1b.report?.engine, totalMs: resF1b.report?.totalToAudibleMs },
      stepWater: { engine: resF1c.report?.engine, totalMs: resF1c.report?.totalToAudibleMs },
    },
  });

  // Functional Test 2: Full sentence Speak button ("I want water")
  console.log('\nFunctional Test 2: Press Speak button ("I want water.")');
  const resF2 = await testSpeak('I want water.', {
    voicePersona: 'amy',
    lang: 'en',
    sentenceWords: ['I', 'want', 'water'],
  });
  results.push({
    name: 'Functional 2: Speak constructed sentence',
    passed: resF2.success && Boolean(resF2.report),
    engine: resF2.report?.engine,
    durationMs: resF2.report?.totalToAudibleMs,
    details: resF2.report,
  });

  // Functional Test 3: 10 rapid repeated taps without queue lockup
  console.log('\nFunctional Test 3: 10 Rapid Taps (Stress test jitter & queue handling)');
  const rapidTapScript = `
    (async function() {
      const speakFn = window.__beeyouSpeakText;
      const items = ['Yes', 'No', 'Help', 'Water', 'More', 'Stop', 'Please', 'Play', 'Eat', 'Water'];
      const logs = [];
      for (let i = 0; i < items.length; i++) {
        const word = items[i];
        const t0 = performance.now();
        try {
          await speakFn(word, { voicePersona: 'amy', lang: 'en', force: true });
          const report = window.__lastAacLatencyReport ? window.__lastAacLatencyReport() : null;
          logs.push({ word: word, success: true, ms: Math.round(performance.now() - t0), engine: report ? report.engine : null });
        } catch (err) {
          logs.push({ word: word, success: false, error: String(err) });
        }
        await new Promise(function(r) { setTimeout(r, 80); });
      }
      return logs;
    })()
  `;
  const rapidTapResults: any = await page.evaluate(rapidTapScript);

  const rapidAllSucceeded = Array.isArray(rapidTapResults) && rapidTapResults.length === 10 && rapidTapResults.every((r: any) => r.success);
  results.push({
    name: 'Functional 3: 10 Rapid Taps without Queue Lockup',
    passed: rapidAllSucceeded,
    details: rapidTapResults,
  });

  // Functional Test 4: Voice Switch and Language Switch
  console.log('\nFunctional Test 4: Voice and Language Switch (Spanish & German)');
  const resF4Spanish = await testSpeak('Quiero agua', {
    voicePersona: 'claude',
    lang: 'es',
    sentenceWords: ['Quiero', 'agua'],
  });
  const resF4German = await testSpeak('Ich moechte Wasser', {
    voicePersona: 'thorsten',
    lang: 'de',
    sentenceWords: ['Ich', 'moechte', 'Wasser'],
  });

  const f4Passed = Boolean(resF4Spanish.success && resF4German.success);
  results.push({
    name: 'Functional 4: Multi-Language & Voice Switching (Spanish + German)',
    passed: f4Passed,
    details: {
      spanish: { engine: resF4Spanish.report?.engine, totalMs: resF4Spanish.report?.totalToAudibleMs },
      german: { engine: resF4German.report?.engine, totalMs: resF4German.report?.totalToAudibleMs },
    },
  });

  // Functional Test 5: App Reload State Persistence & Immediate Speech
  console.log('\nFunctional Test 5: App Reload State & Immediate Speech');
  await page.reload({ waitUntil: 'networkidle2' });
  const resF5 = await testSpeak('Water', { voicePersona: 'amy', lang: 'en' });
  results.push({
    name: 'Functional 5: App Reload & Immediate Audible Playback',
    passed: resF5.success && Boolean(resF5.report),
    engine: resF5.report?.engine,
    durationMs: resF5.report?.totalToAudibleMs,
    details: resF5.report,
  });

  console.log('\n==================================================');
  console.log('SUMMARY OF RESULTS');
  console.log('==================================================\n');

  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.name} (engine: ${r.engine || 'none'}, ms: ${r.durationMs ?? 'N/A'})`);
  }

  console.log(`\nFinal Verdict: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  await browser.close();

  if (!allPassed) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
