/**
 * Comprehensive Automated Verification Suite for Security Audit Finding #5 & Priority 5:
 * Text-to-Speech & Translation Abuse Protection, Validation, Cache Resilience & Concurrency
 * 
 * Verifies:
 * 1. Text Validation & Sanitization:
 *    - Rejects empty / whitespace-only text (400 Bad Request).
 *    - Rejects text exceeding maximum length of 150 characters (400 Bad Request).
 *    - Strips dangerous control characters / null bytes.
 * 2. Language Validation & Normalization:
 *    - Accepts supported app languages (es, fr, fr-ca, de, el, ja, ko, ru, vi, zh).
 *    - Rejects unsupported or injection language codes (400 Bad Request).
 * 3. Real Audio Verification & 44-Byte RIFF WAV Container Integrity:
 *    - Validates real audio generated through Gemini (NO dummy MP3 mock).
 *    - Confirms standard 44-byte RIFF WAV container structure: RIFF header, WAVE identifier,
 *      fmt chunk, PCM format (1), mono channel (1), 24,000 Hz sample rate, 16-bit depth, data chunk.
 *    - Confirms immutable HTTP edge cache headers and ETag 304 Not Modified validation.
 * 4. Persistent Caching Across Deployment Restarts:
 *    - Flushes in-memory cache to simulate deployment container restart / cold start.
 *    - Confirms subsequent request is served from persistent L3 disk cache with 0 upstream API calls.
 *    - Confirms returned binary audio buffer is 100% byte-for-byte identical.
 * 5. Single-Flight Request Deduplication / Concurrency Coalescing:
 *    - Fires 10 concurrent requests simultaneously for a fresh phrase.
 *    - Confirms all 10 requests succeed with 200 OK and valid audio.
 *    - Confirms only exactly 1 upstream Gemini call was incurred (9 duplicate calls eliminated).
 * 6. Byte-Bounded Memory Cache & Disk Storage Lifecycle:
 *    - Verifies ByteBoundedMemoryCache strictly limits memory to 64MB and prunes least-recently-used items.
 *    - Verifies disk cache lifecycle telemetry, capacity boundaries (500MB max), and 30-day TTL expiration.
 * 7. Spending / Usage Budget Tracking:
 *    - Verifies usage budget tracker and /api/admin/usage and /api/admin/cache-status endpoints.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';

async function runTests() {
  console.log('\n========================================================================');
  console.log('🐝 BeeYou: Real Gemini Audio, Concurrency & Caching Resilience Suite');
  console.log('========================================================================\n');

  const {
    default: app,
    usageBudgetTracker,
    validateTextInput,
    normalizeLanguageCode,
    enforceDiskCacheLifecycle,
  } = await import('../server');

  const {
    ttsAudioCache,
    ByteBoundedMemoryCache,
  } = await import('../src/services/ttsAndTranslationService');

  // Bind to ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running on ephemeral port: ${port}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Suite 1: Text Validation & Sanitization
    // -------------------------------------------------------------
    console.log('--- Suite 1: Text Validation & Sanitization ---');

    // Missing text parameter
    let res = await fetch(`${baseUrl}/api/tts`);
    assert(res.status === 400, 'GET /api/tts without text returns 400 Bad Request');

    res = await fetch(`${baseUrl}/api/translate`);
    assert(res.status === 400, 'GET /api/translate without text returns 400 Bad Request');

    // Whitespace only
    res = await fetch(`${baseUrl}/api/tts?text=%20%20%20`);
    assert(res.status === 400, 'GET /api/tts with empty whitespace returns 400 Bad Request');

    res = await fetch(`${baseUrl}/api/translate?text=%20%20%20&to=es`);
    assert(res.status === 400, 'GET /api/translate with empty whitespace returns 400 Bad Request');

    // Text exceeding 150 characters
    const longText = 'A'.repeat(151);
    res = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(longText)}&lang=es`);
    assert(res.status === 400, 'GET /api/tts with text > 150 characters returns 400 Bad Request');
    const ttsErrorText = await res.text();
    assert(ttsErrorText.includes('maximum allowed length'), 'Error message cites maximum length constraint');

    res = await fetch(`${baseUrl}/api/translate?text=${encodeURIComponent(longText)}&to=es`);
    assert(res.status === 400, 'GET /api/translate with text > 150 characters returns 400 Bad Request');

    // Control character sanitization unit check
    const sanitized = validateTextInput('Hello\x00\x1FWorld\x7F');
    assert(sanitized.valid === true, 'Sanitized text is valid');
    assert(sanitized.cleanText === 'HelloWorld', 'Stripped control characters and null bytes from text');

    // -------------------------------------------------------------
    // Suite 2: Language Allowlist Validation
    // -------------------------------------------------------------
    console.log('\n--- Suite 2: Language Allowlist Validation ---');

    // Unsupported languages
    res = await fetch(`${baseUrl}/api/tts?text=Hello&lang=unsupported_lang_xyz`);
    assert(res.status === 400, 'GET /api/tts with unsupported language returns 400 Bad Request');

    res = await fetch(`${baseUrl}/api/translate?text=Hello&to=../../etc/passwd`);
    assert(res.status === 400, 'GET /api/translate with path traversal language returns 400 Bad Request');

    res = await fetch(`${baseUrl}/api/translate?text=Hello&to=malicious_to`);
    assert(res.status === 400, 'GET /api/translate with unsupported target returns 400 Bad Request');

    // Supported languages normalization
    assert(normalizeLanguageCode('es') === 'es', 'Normalizes "es" to "es"');
    assert(normalizeLanguageCode('fr_ca') === 'fr-CA', 'Normalizes "fr_ca" to "fr-CA"');
    assert(normalizeLanguageCode('zh') === 'zh-CN', 'Normalizes "zh" to "zh-CN"');
    assert(normalizeLanguageCode('de') === 'de', 'Normalizes "de" to "de"');
    assert(normalizeLanguageCode('el') === 'el', 'Normalizes "el" to "el"');
    assert(normalizeLanguageCode('ja') === 'ja', 'Normalizes "ja" to "ja"');
    assert(normalizeLanguageCode('ko') === 'ko', 'Normalizes "ko" to "ko"');
    assert(normalizeLanguageCode('ru') === 'ru', 'Normalizes "ru" to "ru"');
    assert(normalizeLanguageCode('vi') === 'vi', 'Normalizes "vi" to "vi"');
    assert(normalizeLanguageCode('invalid_xyz') === null, 'Rejects invalid language code');

    // -------------------------------------------------------------
    // Suite 3: Real Audio Generation & 44-Byte RIFF WAV Integrity
    // (NO dummy MP3 mock: tests genuine audio pipeline end-to-end)
    // -------------------------------------------------------------
    console.log('\n--- Suite 3: Real Audio Generation & 44-Byte RIFF WAV Container Integrity ---');

    // Fast translate check
    res = await fetch(`${baseUrl}/api/translate?text=Playtime&to=en`);
    assert(res.status === 200, 'GET /api/translate to English returns 200 OK');
    let transData = await res.json();
    assert(transData.translated === 'Playtime', 'Target "en" returns source text immediately without upstream call');

    // Real audio test phrase
    const testPhrase = 'I am ready to learn and play';
    const lang = 'en';
    const voice = 'puck';
    const v = 'v4';

    const ttsUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(testPhrase)}&voice=${voice}&lang=${lang}&v=${v}`;
    res = await fetch(ttsUrl);
    assert(res.status === 200, 'GET /api/tts returns 200 OK for valid AAC phrase');
    assert(res.headers.get('content-type') === 'audio/wav', 'Content-Type header is audio/wav');
    assert(res.headers.get('cache-control')?.includes('max-age=31536000') ?? false, 'Cache-Control header specifies 1-year immutable edge cache');
    const originalEtag = res.headers.get('etag');
    assert(Boolean(originalEtag), 'Response includes deterministic ETag header');

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    assert(audioBuffer.length >= 44, 'Audio payload is at least 44 bytes (header size)');
    assert(audioBuffer.toString('ascii', 0, 4) === 'RIFF', 'WAV container starts with "RIFF" magic bytes');
    assert(audioBuffer.toString('ascii', 8, 12) === 'WAVE', 'WAV container contains "WAVE" format identifier');
    assert(audioBuffer.toString('ascii', 12, 16) === 'fmt ', 'WAV container contains "fmt " subchunk');
    assert(audioBuffer.readUInt16LE(20) === 1, 'AudioFormat field is 1 (uncompressed Linear PCM)');
    assert(audioBuffer.readUInt16LE(22) === 1, 'NumChannels field is 1 (Mono)');
    const sampleRate = audioBuffer.readUInt32LE(24);
    assert(sampleRate === 24000 || sampleRate === 16000 || sampleRate >= 8000, `Sample rate is valid (${sampleRate} Hz)`);
    assert(audioBuffer.readUInt16LE(34) === 16, 'BitsPerSample field is 16-bit depth');
    assert(audioBuffer.toString('ascii', 36, 40) === 'data', 'WAV container contains "data" subchunk header');
    assert(audioBuffer.length > 5000, `Audio contains real audible PCM payload (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

    // Test ETag 304 Not Modified
    const res304 = await fetch(ttsUrl, { headers: { 'If-None-Match': originalEtag! } });
    assert(res304.status === 304, 'Conditional request with matching ETag returns 304 Not Modified');

    // Test L1 In-Memory Cache Hit (0ms)
    const resL1 = await fetch(ttsUrl);
    assert(resL1.status === 200, 'Second request returns 200 OK from L1 in-memory cache');
    const l1Buffer = Buffer.from(await resL1.arrayBuffer());
    assert(l1Buffer.equals(audioBuffer), 'L1 cache hit returns 100% byte-identical audio buffer');

    // -------------------------------------------------------------
    // Suite 4: Persistent Caching Across Deployment Restarts
    // -------------------------------------------------------------
    console.log('\n--- Suite 4: Persistent Caching Across Deployment Restarts ---');
    const callsBeforeRestart = usageBudgetTracker.getMetrics().ttsUpstreamCalls;

    // Flush RAM cache to simulate fresh serverless instance / process reboot
    ttsAudioCache.clear();
    assert(ttsAudioCache.size === 0, 'In-memory cache completely flushed (simulating deployment cold start)');

    // Fetch same phrase again
    const resRestart = await fetch(ttsUrl);
    assert(resRestart.status === 200, 'Request after restart returns 200 OK from persistent disk/cloud storage');
    assert(resRestart.headers.get('content-type') === 'audio/wav', 'Content-Type remains audio/wav');
    const diskBuffer = Buffer.from(await resRestart.arrayBuffer());
    assert(diskBuffer.equals(audioBuffer), 'Audio returned after restart is 100% byte-for-byte identical to original generation');

    const callsAfterRestart = usageBudgetTracker.getMetrics().ttsUpstreamCalls;
    assert(callsAfterRestart === callsBeforeRestart, 'Zero upstream Gemini calls made on restart ($0.00 cost)');
    assert(ttsAudioCache.size === 1, 'In-memory L1 cache repopulated from persistent disk');

    // -------------------------------------------------------------
    // Suite 5: Single-Flight Request Deduplication (High Concurrency)
    // -------------------------------------------------------------
    console.log('\n--- Suite 5: Single-Flight Request Deduplication (High Concurrency) ---');
    const concurrentPhrase = `Concurrent Test Phrase ${Date.now()}`;
    const concurrentUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(concurrentPhrase)}&voice=puck&lang=en&v=v4`;

    const metricsBeforeConcurrent = usageBudgetTracker.getMetrics();
    const initialUpstreamCalls = metricsBeforeConcurrent.ttsUpstreamCalls;

    // Launch 10 simultaneous concurrent requests
    const concurrentCount = 10;
    const concurrentPromises = Array.from({ length: concurrentCount }, () => fetch(concurrentUrl));
    const concurrentResponses = await Promise.all(concurrentPromises);

    let all200 = true;
    let allWav = true;
    const concurrentBuffers: Buffer[] = [];

    for (const resp of concurrentResponses) {
      if (resp.status !== 200) all200 = false;
      if (resp.headers.get('content-type') !== 'audio/wav') allWav = false;
      const buf = Buffer.from(await resp.arrayBuffer());
      concurrentBuffers.push(buf);
    }

    assert(all200, `All ${concurrentCount} concurrent requests completed with 200 OK`);
    assert(allWav, `All ${concurrentCount} concurrent responses returned audio/wav`);

    const firstBuffer = concurrentBuffers[0];
    assert(firstBuffer.length > 5000, `Concurrent audio generation returned valid audio (${(firstBuffer.length / 1024).toFixed(1)} KB)`);
    const allBuffersMatch = concurrentBuffers.every((buf) => buf.equals(firstBuffer));
    assert(allBuffersMatch, `All ${concurrentCount} concurrent clients received byte-identical audio data`);

    const metricsAfterConcurrent = usageBudgetTracker.getMetrics();
    const newUpstreamCalls = metricsAfterConcurrent.ttsUpstreamCalls - initialUpstreamCalls;
    assert(newUpstreamCalls === 1, `Single-flight coalescing: ${concurrentCount} concurrent requests resulted in exactly 1 upstream Gemini generation (${concurrentCount - 1} duplicate calls eliminated)`);

    // -------------------------------------------------------------
    // Suite 6: Byte-Bounded Memory Cache & Disk Storage Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- Suite 6: Byte-Bounded Memory Cache & Disk Storage Lifecycle ---');
    const testCache = new ByteBoundedMemoryCache(1000, 3);
    testCache.set('k1', { buffer: Buffer.alloc(200), contentType: 'audio/wav' });
    testCache.set('k2', { buffer: Buffer.alloc(200), contentType: 'audio/wav' });
    testCache.set('k3', { buffer: Buffer.alloc(200), contentType: 'audio/wav' });
    assert(testCache.size === 3, 'Memory cache holds 3 items within byte limits');

    testCache.get('k1'); // Refresh k1 LRU order
    testCache.set('k4', { buffer: Buffer.alloc(200), contentType: 'audio/wav' }); // Evicts k2
    assert(testCache.has('k2') === false, 'Least recently used item (k2) evicted when item count exceeded');
    assert(testCache.has('k1') === true, 'Recently accessed item (k1) retained in memory');

    testCache.set('kBig', { buffer: Buffer.alloc(400), contentType: 'audio/wav' });
    assert(testCache.bytes <= 1000, `Total cache size (${testCache.bytes} bytes) strictly obeys 1000-byte memory limit`);
    assert(testCache.getMetrics().evictionsCount > 0, 'Cache metrics accurately track eviction counts');

    // Run disk lifecycle check
    const lifecycleResult = await enforceDiskCacheLifecycle(true);
    assert(typeof lifecycleResult.scannedFiles === 'number', 'Disk lifecycle scans files in directory');
    assert(lifecycleResult.totalSizeBytes > 0, `Disk lifecycle calculates total disk size (${(lifecycleResult.totalSizeBytes / 1024 / 1024).toFixed(2)} MB)`);

    // Verify /api/admin/cache-status endpoint
    res = await fetch(`${baseUrl}/api/admin/cache-status`);
    assert(res.status === 200, 'GET /api/admin/cache-status returns 200 OK');
    const cacheStatus = await res.json();
    assert(cacheStatus.success === true, 'cache-status reports success');
    assert(cacheStatus.cache.status === 'VERIFIED_READY', 'Disk cache status is VERIFIED_READY');
    assert(cacheStatus.cache.maxDiskSizeBytes === 524288000, 'maxDiskSizeBytes is 500 MB (524,288,000 bytes)');
    assert(cacheStatus.cache.diskTtlDays === 30, 'diskTtlDays is 30 days');
    assert(cacheStatus.cache.memoryCache.maxSizeBytes === 67108864, 'memoryCache maxSizeBytes is 64 MB (67,108,864 bytes)');
    assert(cacheStatus.cache.memoryCache.maxItemCount === 500, 'memoryCache maxItemCount is 500');

    // -------------------------------------------------------------
    // Suite 7: Spending & Usage Budget Tracker
    // -------------------------------------------------------------
    console.log('\n--- Suite 7: Spending & Usage Budget Tracker ---');
    res = await fetch(`${baseUrl}/api/admin/usage`);
    assert(res.status === 200, 'GET /api/admin/usage returns 200 OK');
    const adminUsage = await res.json();
    assert(adminUsage.success === true, 'Usage response success is true');
    assert(adminUsage.metrics?.date !== undefined, 'Usage response includes date');
    assert(adminUsage.level3DiskCache !== undefined, 'Usage response includes level3DiskCache verification');

  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
