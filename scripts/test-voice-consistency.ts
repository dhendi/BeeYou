import puppeteer from 'puppeteer-core';

async function testVoiceConsistency() {
  console.log('====================================================');
  console.log('TESTING AAC VOICE CONSISTENCY: WORD VS SENTENCE');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[AAC Speech]') || text.includes('[Piper TTS]')) {
      console.log('  [APP LOG]', text);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));

  const testReport = await page.evaluate(`
    (async () => {
      const { speakText } = await import('/src/utils/audio/speech.ts');
      const {
        preloadPiperVoice,
        synthesizeWithPiper,
        resolvePiperVoiceId,
        getActivePiperVoiceId,
      } = await import('/src/services/piperTtsService.ts');

      const results = [];

      async function runTest(voicePersona, voiceName) {
        console.log('[TEST] Preparing Voice: ' + voiceName + ' (' + voicePersona + ')');
        const tPreloadStart = performance.now();
        const ready = await preloadPiperVoice(voicePersona, 'en');
        const preloadDuration = Math.round(performance.now() - tPreloadStart);

        const targetPiperId = resolvePiperVoiceId(voicePersona, 'en');
        const activeVoiceId = getActivePiperVoiceId();

        // Test 1: Single Word Speech
        console.log('[TEST] Testing single word speech for ' + voiceName);
        const tSingleStart = performance.now();
        await speakText('Water', {
          voicePersona: voicePersona,
          lang: 'en',
        });
        const singleDuration = Math.round(performance.now() - tSingleStart);

        // Test 2: Full Sentence Speech
        console.log('[TEST] Testing full sentence speech for ' + voiceName);
        const tSentenceStart = performance.now();
        const sentenceText = 'I want cold water please and thank you';
        await speakText(sentenceText, {
          voicePersona: voicePersona,
          lang: 'en',
          sentenceWords: ['I', 'want', 'cold', 'water', 'please', 'and', 'thank', 'you'],
        });
        const sentenceDuration = Math.round(performance.now() - tSentenceStart);

        // Test 3: Raw Piper Synthesis to verify buffer and model
        const tSynthStart = performance.now();
        const rawBuf = await synthesizeWithPiper('Arbitrary test sentence for verification', voicePersona, 'en');
        const synthDuration = Math.round(performance.now() - tSynthStart);

        results.push({
          voicePersona: voicePersona,
          voiceName: voiceName,
          targetPiperId: targetPiperId,
          activeVoiceId: activeVoiceId,
          ready: ready,
          preloadDurationMs: preloadDuration,
          singleDurationMs: singleDuration,
          sentenceDurationMs: sentenceDuration,
          rawBufferSize: rawBuf ? rawBuf.byteLength : 0,
          synthDurationMs: synthDuration,
        });
      }

      // 1. Test Amy
      await runTest('amy', 'Amy');

      // 2. Switch to Ryan and test
      await runTest('ryan', 'Ryan');

      // 3. Switch back to Amy and verify consistency
      await runTest('amy', 'Amy (Switchback)');

      return results;
    })()
  `);

  console.log('\n====================================================');
  console.log('VOICE CONSISTENCY TEST RESULTS:');
  console.log(JSON.stringify(testReport, null, 2));
  console.log('====================================================');

  await browser.close();

  const allPassed = (testReport as any[]).every(
    (r: any) => r.ready && r.rawBufferSize > 1000 && r.activeVoiceId === r.targetPiperId
  );

  if (allPassed) {
    console.log('ALL VOICE CONSISTENCY TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('SOME VOICE CONSISTENCY TESTS FAILED.');
    process.exit(1);
  }
}

testVoiceConsistency().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
