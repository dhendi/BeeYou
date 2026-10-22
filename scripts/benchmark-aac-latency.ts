import puppeteer from 'puppeteer-core';
import path from 'path';
import os from 'os';

async function runLatencyBenchmark() {
  console.log('========================================================================');
  console.log('BEEYOU AAC SPEECH SYSTEM: 8-STAGE LATENCY & COMPREHENSIVE BENCHMARK');
  console.log('========================================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    const text = msg.text();
    console.log('  [BROWSER]', text);
  });
  page.on('pageerror', err => console.error('  [PAGE ERROR]', err));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const benchmarkResults = await page.evaluate(`
    (async () => {
      const { speakText, getLastSpeechLatencyReport, prewarmCoreAudioVocabulary } = await import('/src/utils/audio/speech.ts');
      const { preloadPiperVoice } = await import('/src/services/piperTtsService.ts');

      console.log('--- Step 0: Preload Piper Model (Amy) & Pre-warm Core Vocabulary ---');
      await preloadPiperVoice('amy', 'en');
      await prewarmCoreAudioVocabulary('amy', 'en');
      await new Promise(r => setTimeout(r, 600));

      const results = {};

      // Test 1: Cached Single Word ('Water') -> Target < 100ms (ideal < 10ms)
      console.log('\\n--- Test 1: Cached Single Word ("Water") ---');
      const t1Start = performance.now();
      await speakText('Water', { voicePersona: 'amy', lang: 'en', gestureTime: t1Start });
      results.cachedSingleWord = getLastSpeechLatencyReport();

      // Test 2: Novel / Uncached Single Word ('Computer') -> Target < 250ms
      console.log('\\n--- Test 2: Uncached Single Word ("Computer") ---');
      const t2Start = performance.now();
      await speakText('Computer', { voicePersona: 'amy', lang: 'en', gestureTime: t2Start });
      results.uncachedSingleWord = getLastSpeechLatencyReport();

      // Test 3: New Short Sentence ('I want a drink') -> Target < 500ms
      console.log('\\n--- Test 3: New Short Sentence ("I want a drink") ---');
      const t3Start = performance.now();
      await speakText('I want a drink', { voicePersona: 'amy', lang: 'en', sentenceWords: ['I', 'want', 'a', 'drink'], gestureTime: t3Start });
      results.newShortSentence = getLastSpeechLatencyReport();

      // Test 4: Cached Sentence ('I want a drink') -> Target < 100ms
      console.log('\\n--- Test 4: Cached Sentence ("I want a drink") ---');
      const t4Start = performance.now();
      await speakText('I want a drink', { voicePersona: 'amy', lang: 'en', sentenceWords: ['I', 'want', 'a', 'drink'], gestureTime: t4Start });
      results.cachedSentence = getLastSpeechLatencyReport();

      // Test 5: Rapid Consecutive Taps (10 rapid clicks)
      console.log('\\n--- Test 5: Rapid Consecutive Taps (10 taps) ---');
      const rapidWords = ['I', 'Want', 'Water', 'Please', 'Help', 'More', 'Food', 'Play', 'Stop', 'Happy'];
      const rapidLatencies = [];
      for (const word of rapidWords) {
        const tTap = performance.now();
        await speakText(word, { voicePersona: 'amy', lang: 'en', gestureTime: tTap });
        const rep = getLastSpeechLatencyReport();
        if (rep) rapidLatencies.push(rep.totalToAudibleMs);
      }
      results.rapidConsecutiveTaps = {
        wordsTested: rapidWords.length,
        avgLatencyMs: Math.round(rapidLatencies.reduce((a, b) => a + b, 0) / rapidLatencies.length),
        minLatencyMs: Math.min(...rapidLatencies),
        maxLatencyMs: Math.max(...rapidLatencies),
      };

      // Test 6: Long Sentence (20 Words)
      console.log('\\n--- Test 6: Long Novel Sentence (20 Words) ---');
      const longPhrase = 'Today is a wonderful sunny day and I would really love to go outside to the park with my good friends';
      const t6Start = performance.now();
      await speakText(longPhrase, { voicePersona: 'amy', lang: 'en', sentenceWords: longPhrase.split(' '), gestureTime: t6Start });
      results.longSentence = getLastSpeechLatencyReport();

      // Test 7: Voice Switching (Amy -> Ryan -> Amy)
      console.log('\\n--- Test 7: Voice Switching (Amy -> Ryan) ---');
      await preloadPiperVoice('ryan', 'en');
      const t7Start = performance.now();
      await speakText('Hello friend', { voicePersona: 'ryan', lang: 'en', sentenceWords: ['Hello', 'friend'], gestureTime: t7Start });
      results.voiceSwitchRyan = getLastSpeechLatencyReport();

      const t8Start = performance.now();
      await speakText('Hello friend', { voicePersona: 'amy', lang: 'en', sentenceWords: ['Hello', 'friend'], gestureTime: t8Start });
      results.voiceSwitchBackAmy = getLastSpeechLatencyReport();

      return results;
    })()
  `);

  console.log('\n========================================================================');
  console.log('BENCHMARK SUMMARY REPORT:');
  console.log(JSON.stringify(benchmarkResults, null, 2));
  console.log('========================================================================');

  await browser.close();
}

runLatencyBenchmark().catch(console.error);
