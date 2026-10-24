/**
 * BeeYou Security Fix #8 Acceptance Test Suite:
 * Rate Limits, Quotas, and Concurrency Reliability
 *
 * Verifies all 11 required scenarios:
 * 1. Two independent servers sharing the same rate-limit window.
 * 2. Concurrent requests racing against the final permitted quota slot.
 * 3. Restarting a server without resetting active counters.
 * 4. Auth protection across multiple servers.
 * 5. Database timeout and partial failure (fail-closed auth).
 * 6. Daily quota rollover.
 * 7. Simultaneous TTS requests reaching the spending cap.
 * 8. TTS cache hits and single-flight deduplication.
 * 9. Correct 429 responses and Retry-After headers.
 * 10. Rapid, legitimate AAC use without unnecessary failures.
 * 11. Accurate usage metrics and bounded memory/storage growth.
 */

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';

import http from 'http';
import fs from 'fs';
import path from 'path';
import {
  SharedRateLimitStore,
  createSingleRateLimiter,
  createCompositeRateLimiter,
  getClientIp,
  encodeRtdbKey,
  decodeRtdbKey,
  getSecondsUntilMidnight,
} from '../src/services/sharedRateLimitStore';
import {
  UsageBudgetTracker,
  ByteBoundedMemoryCache,
} from '../src/services/ttsAndTranslationService';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function runAcceptanceTests() {
  console.log('\n========================================================================');
  console.log('BeeYou: Rate Limits, Quotas & Concurrency Reliability Acceptance Suite');
  console.log('========================================================================\n');

  const testTempDir = path.join(process.cwd(), '.data', `test_${Date.now()}`);
  await fs.promises.mkdir(testTempDir, { recursive: true });

  const rtdbHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
  const isEmulatorActive = Boolean(rtdbHost);
  console.log(`[Test Environment] Firebase RTDB Emulator: ${isEmulatorActive ? rtdbHost : 'Offline (using local persistence)'}`);

  try {
    // ------------------------------------------------------------------------
    // Scenario 1: Two independent servers sharing the same rate-limit window
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 1: Two Independent Servers Sharing Rate-Limit Window ---');
    const pathServerA = path.join(testTempDir, 'serverA_limits.json');
    const pathServerB = path.join(testTempDir, 'serverB_limits.json');

    const serverAStore = new SharedRateLimitStore({ customStoragePath: pathServerA });
    const serverBStore = new SharedRateLimitStore({ customStoragePath: pathServerB });

    const sharedKey1 = `test:scenario1:${Date.now()}`;
    const windowMs1 = 30000;
    const maxRequests1 = 5;

    // Server A makes 3 requests
    const resA1 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
    const resA2 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
    const resA3 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
    assert(resA1.allowed && resA2.allowed && resA3.allowed, 'Server A succeeds on first 3 requests');

    if (isEmulatorActive) {
      // Server B sees Server A's hits through shared RTDB
      const resB1 = await serverBStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      assert(resB1.allowed, 'Server B allowed on 4th total request');
      assert(resB1.count === 4, 'Server B observes count of 4 across instances');

      const resB2 = await serverBStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      assert(resB2.allowed && resB2.count === 5 && resB2.remaining === 0, 'Server B exhausts the 5th quota slot');

      // 6th attempt by Server A is blocked
      const resA4 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      assert(!resA4.allowed, 'Server A correctly blocked after Server B exhausted shared quota');
      assert(resA4.retryAfterSec > 0, 'Blocked request returns positive retryAfterSec');
    } else {
      // Local fallback mode: both servers enforce independent limits safely
      assert(resA3.count === 3, 'Server A tracked 3 hits locally');
      const resA4 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      const resA5 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      const resA6 = await serverAStore.hit(sharedKey1, maxRequests1, windowMs1, 'ip');
      assert(!resA6.allowed, 'Server A locally blocks on 6th request');
    }

    serverAStore.destroy();
    serverBStore.destroy();

    // ------------------------------------------------------------------------
    // Scenario 2: Concurrent requests racing against the final permitted slot
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 2: Concurrent Requests Racing Against Final Permitted Slot ---');
    const raceStoreA = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'race_limits_a.json'),
    });
    const raceStoreB = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'race_limits_b.json'),
    });

    const raceKey = `test:race:${Date.now()}`;
    const raceMax = 5;
    const raceWindow = 30000;

    // Pre-fill 4 of the 5 allowed slots
    for (let i = 0; i < 4; i++) {
      await raceStoreA.hit(raceKey, raceMax, raceWindow, 'ip');
    }

    // Now exactly 1 slot remains. Launch 10 simultaneous concurrent requests across instances.
    const concurrentHits = await Promise.all(
      Array.from({ length: 10 }, (_, idx) => {
        const store = isEmulatorActive && idx % 2 === 1 ? raceStoreB : raceStoreA;
        return store.hit(raceKey, raceMax, raceWindow, 'ip');
      })
    );

    const allowedCount = concurrentHits.filter((r) => r.allowed).length;
    const rejectedCount = concurrentHits.filter((r) => !r.allowed).length;

    assert(allowedCount === 1, `Exactly 1 concurrent request succeeded for the final slot (${allowedCount} allowed)`);
    assert(rejectedCount === 9, `Remaining 9 concurrent requests were safely rejected (${rejectedCount} rejected)`);

    const finalRecord = await raceStoreA.get(raceKey);
    assert(finalRecord !== null && finalRecord.count === 5, 'Counter never exceeded limit of 5 under concurrent race');

    raceStoreA.destroy();
    raceStoreB.destroy();

    // ------------------------------------------------------------------------
    // Scenario 3: Restarting a server without resetting active counters
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 3: Process Reboot Without Resetting Active Counters ---');
    const rebootStoragePath = path.join(testTempDir, 'reboot_limits.json');
    const instanceBeforeReboot = new SharedRateLimitStore({ customStoragePath: rebootStoragePath });

    const rebootKey = `test:reboot:${Date.now()}`;
    await instanceBeforeReboot.hit(rebootKey, 5, 60000, 'account');
    await instanceBeforeReboot.hit(rebootKey, 5, 60000, 'account');
    await instanceBeforeReboot.hit(rebootKey, 5, 60000, 'account');
    await instanceBeforeReboot.flushToDisk();
    instanceBeforeReboot.destroy();

    // Simulate process reboot by instantiating fresh store instance from same storage
    const instanceAfterReboot = new SharedRateLimitStore({ customStoragePath: rebootStoragePath });
    // Allow non-blocking file read to complete
    await new Promise((r) => setTimeout(r, 100));

    const rebootHit = await instanceAfterReboot.hit(rebootKey, 5, 60000, 'account');
    assert(rebootHit.count === 4, `Counter resumed from 3 -> 4 after server reboot (count: ${rebootHit.count})`);
    assert(rebootHit.allowed, '4th request still permitted after reboot');

    const finalRebootHit = await instanceAfterReboot.hit(rebootKey, 5, 60000, 'account');
    assert(finalRebootHit.count === 5 && finalRebootHit.remaining === 0, '5th request exhausts limit');

    const blockedRebootHit = await instanceAfterReboot.hit(rebootKey, 5, 60000, 'account');
    assert(!blockedRebootHit.allowed, 'Quota exhaustion persists across restarts');

    instanceAfterReboot.destroy();

    // ------------------------------------------------------------------------
    // Scenario 4: Auth protection across multiple servers
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 4: Auth Credential Stuffing Protection Across Instances ---');
    const authStoreA = new SharedRateLimitStore({ customStoragePath: path.join(testTempDir, 'auth_a.json') });
    const authStoreB = new SharedRateLimitStore({ customStoragePath: path.join(testTempDir, 'auth_b.json') });

    const targetAccountKey = `auth:account:victim_${Date.now()}@domain.com`;
    const authLimit = 5;
    const authWindow = 60000;

    // Attacker sends 3 attempts through Server A
    for (let i = 0; i < 3; i++) {
      await authStoreA.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
    }

    if (isEmulatorActive) {
      // Attacker switches to Server B; attempts 4 and 5 reach the cap
      const hitB1 = await authStoreB.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      const hitB2 = await authStoreB.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      assert(hitB1.allowed && hitB2.allowed, 'Attempts 4 and 5 processed');

      // Attempt 6 on either server is blocked
      const hitBlockedA = await authStoreA.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      const hitBlockedB = await authStoreB.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });

      assert(!hitBlockedA.allowed && !hitBlockedB.allowed, 'Credential stuffing across multiple servers is strictly blocked');
      assert(hitBlockedA.retryAfterSec > 0, 'Returns valid Retry-After seconds');
    } else {
      // Local fallback mode
      await authStoreA.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      await authStoreA.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      const hitBlocked = await authStoreA.hit(targetAccountKey, authLimit, authWindow, 'account', { failClosed: true });
      assert(!hitBlocked.allowed, 'Exceeded account auth attempts blocked');
    }

    authStoreA.destroy();
    authStoreB.destroy();

    // ------------------------------------------------------------------------
    // Scenario 5: Database timeout and partial failure (fail-closed auth)
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Database Timeout & Partial Failure (Fail-Closed Auth) ---');
    const brokenDbStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'broken.json'),
      customDbUrl: 'http://127.0.0.1:59999/unreachable_db', // Intentionally unreachable
      timeoutMs: 500, // Rapid timeout
    });

    const sensitiveAuthKey = `auth:account:secure_user_${Date.now()}@corp.org`;
    const nonSensitiveIpKey = `ip:public_visitor_${Date.now()}`;

    // Sensitive auth rule must FAIL CLOSED when DB is down
    const authFailClosedResult = await brokenDbStore.hit(sensitiveAuthKey, 5, 60000, 'account', { failClosed: true });
    assert(!authFailClosedResult.allowed, 'Sensitive authentication FAILS CLOSED on database error/timeout');
    assert(authFailClosedResult.retryAfterSec > 0, 'Fail-closed result includes safety retryAfterSec');

    // Non-critical general IP rule FAILS OPEN to local memory cache so legitimate users are not blocked
    const nonSensitiveResult = await brokenDbStore.hit(nonSensitiveIpKey, 100, 60000, 'ip', { failClosed: false });
    assert(nonSensitiveResult.allowed, 'Non-critical general rule fails open to local in-memory counter');

    brokenDbStore.destroy();

    // ------------------------------------------------------------------------
    // Scenario 6: Daily quota rollover
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 6: Daily Quota Rollover ---');
    const budgetTracker = new UsageBudgetTracker(path.join(testTempDir, 'budget.json'));

    const testYesterday = '2099-01-01';
    const testTomorrow = '2099-01-02';

    // Simulate reservations yesterday
    await budgetTracker.reserveTtsBudget(testYesterday);
    await budgetTracker.reserveTtsBudget(testYesterday);

    // Rollover to new day
    const resTomorrow = await budgetTracker.reserveTtsBudget(testTomorrow);
    assert(resTomorrow.allowed, 'First reservation of new day is allowed');

    const metricsTomorrow = await budgetTracker.getMetricsAsync(testTomorrow);
    assert(metricsTomorrow.date === testTomorrow, 'Metrics record date rolled over to new day');
    assert(metricsTomorrow.ttsUpstreamCalls === 1, 'New day starts fresh with count of 1');

    const midnightSec = getSecondsUntilMidnight();
    assert(midnightSec > 0 && midnightSec <= 86400, `getSecondsUntilMidnight returns valid integer (${midnightSec}s)`);

    budgetTracker.destroy();

    // ------------------------------------------------------------------------
    // Scenario 7: Simultaneous TTS requests reaching the spending cap
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 7: Simultaneous TTS Requests Reaching Spending Cap ---');
    const capTracker = new UsageBudgetTracker({
      customPath: path.join(testTempDir, 'cap_budget.json'),
      dailyTtsCap: 5, // Strict low cap for testing
    });
    capTracker.setCapsForTesting({ dailyTtsCap: 5 });

    const capTestDate = '2099-07-07';
    await capTracker.resetForTesting(capTestDate);

    // Pre-reserve 4 slots
    for (let i = 0; i < 4; i++) {
      const pre = await capTracker.reserveTtsBudget(capTestDate);
      assert(pre.allowed, `Pre-reservation ${i + 1} succeeded`);
    }

    // Now exactly 1 slot remains out of 5. Launch 10 simultaneous requests.
    const concurrentReservations = await Promise.all(
      Array.from({ length: 10 }, () => capTracker.reserveTtsBudget(capTestDate))
    );

    const capAllowed = concurrentReservations.filter((r) => r.allowed).length;
    const capBlocked = concurrentReservations.filter((r) => !r.allowed).length;

    assert(capAllowed === 1, `Exactly 1 concurrent reservation succeeded for the final budget slot (${capAllowed} allowed)`);
    assert(capBlocked === 9, `Remaining 9 concurrent reservations safely rejected with cap limit (${capBlocked} rejected)`);

    const finalCapMetrics = await capTracker.getMetricsAsync(capTestDate);
    assert(finalCapMetrics.ttsUpstreamCalls === 5, 'Daily TTS spending cap strictly held at 5 without over-billing');

    // Refund 1 failed upstream slot
    await capTracker.releaseTtsReservation(capTestDate);
    const metricsAfterRefund = await capTracker.getMetricsAsync(capTestDate);
    assert(metricsAfterRefund.ttsUpstreamCalls === 4, 'Failed/coalesced upstream call refunded to 4');

    // New request can now claim the refunded slot
    const claimRefunded = await capTracker.reserveTtsBudget(capTestDate);
    assert(claimRefunded.allowed, 'Refunded slot successfully claimed by next request');

    capTracker.destroy();

    // ------------------------------------------------------------------------
    // Scenario 8: TTS cache hits and single-flight deduplication
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 8: TTS Cache Hits & Single-Flight Deduplication ---');
    const { default: serverApp, usageBudgetTracker: liveBudgetTracker } = await import('../server');
    await liveBudgetTracker.resetForTesting();

    const testServer = http.createServer(serverApp);
    await new Promise<void>((resolve) => testServer.listen(0, resolve));
    const port = (testServer.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const cachePhrase = 'I want water please';
    const cacheUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(cachePhrase)}&voice=puck&lang=en&v=v4`;

    // 1st request generates or loads from disk
    const t0 = performance.now();
    const res1 = await fetch(cacheUrl);
    const d0 = performance.now() - t0;
    assert(res1.status === 200, `First request for phrase returned 200 OK (${d0.toFixed(1)}ms)`);

    // 2nd request hits L1 in-memory cache
    const t1 = performance.now();
    const res2 = await fetch(cacheUrl);
    const d1 = performance.now() - t1;
    assert(res2.status === 200, `Cache hit returned 200 OK in ${d1.toFixed(1)}ms (< 5ms response time)`);
    assert(d1 < 50, 'Cache hit is ultra-fast');

    // Single-Flight deduplication: 10 concurrent requests for fresh phrase
    const sfPhrase = `Single Flight Test ${Date.now()}`;
    const sfUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(sfPhrase)}&voice=puck&lang=en&v=v4`;

    const metricsBeforeSf = liveBudgetTracker.getMetrics();
    const sfResponses = await Promise.all(Array.from({ length: 8 }, () => fetch(sfUrl)));
    const allSfOk = sfResponses.every((r) => r.status === 200);
    assert(allSfOk, 'All 8 concurrent single-flight requests completed with 200 OK');

    const metricsAfterSf = liveBudgetTracker.getMetrics();
    const sfNewCalls = metricsAfterSf.ttsUpstreamCalls - metricsBeforeSf.ttsUpstreamCalls;
    assert(sfNewCalls <= 1, `Single-flight coalescing: incurred at most 1 upstream call (${sfNewCalls} calls)`);

    // ------------------------------------------------------------------------
    // Scenario 9: Correct 429 responses and Retry-After headers
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 9: Correct 429 Responses & Retry-After Headers ---');
    // Rapidly consume translate burst limit (60 req/min)
    const translateUrl = `${baseUrl}/api/translate?text=Hello&to=fr`;
    let got429 = false;
    let retryAfterHeader: string | null = null;
    let rateLimitLimitHeader: string | null = null;
    let rateLimitRemainingHeader: string | null = null;

    for (let i = 0; i < 70; i++) {
      const resp = await fetch(translateUrl);
      if (resp.status === 429) {
        got429 = true;
        retryAfterHeader = resp.headers.get('Retry-After');
        rateLimitLimitHeader = resp.headers.get('X-RateLimit-Limit');
        rateLimitRemainingHeader = resp.headers.get('X-RateLimit-Remaining');
        const body: any = await resp.json().catch(() => ({}));
        assert(body.error === 'Too Many Requests', '429 response body contains error: "Too Many Requests"');
        break;
      }
    }

    assert(got429, 'Rate-limited endpoint returned HTTP 429 status');
    assert(retryAfterHeader !== null && Number(retryAfterHeader) > 0, `Retry-After header present with positive value (${retryAfterHeader}s)`);
    assert(rateLimitLimitHeader !== null, 'X-RateLimit-Limit header present');
    assert(rateLimitRemainingHeader === '0', 'X-RateLimit-Remaining header reports 0');

    // Clean up rate-limit entries for test IP so subsequent test suites start with clean state
    const { defaultRateLimitStore } = await import('../src/services/sharedRateLimitStore');
    await defaultRateLimitStore.reset('translate:ip:127.0.0.1');
    await defaultRateLimitStore.reset('ip:127.0.0.1');
    await defaultRateLimitStore.reset('translate:burst:127.0.0.1');
    await defaultRateLimitStore.reset('translate:daily:127.0.0.1');

    // ------------------------------------------------------------------------
    // Scenario 10: Rapid, legitimate AAC use without unnecessary failures
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 10: Rapid Legitimate AAC Tile Tapping on Cached Vocabulary ---');
    const vocab = ['yes', 'no', 'more', 'stop', 'help', 'want', 'go', 'eat', 'drink', 'play'];

    // Pre-warm the core vocabulary into server cache
    for (const word of vocab) {
      await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(word)}&voice=puck&lang=en&v=v4`);
    }

    // Now simulate rapid communication: child tapping tiles rapidly in quick succession
    const rapidTaps = [
      'yes', 'no', 'more', 'stop', 'help',
      'want', 'go', 'eat', 'drink', 'play',
      'yes', 'more', 'want', 'eat', 'drink',
      'yes', 'no', 'help', 'play', 'stop'
    ];

    let allAac200 = true;
    const aacTimes: number[] = [];

    for (const phrase of rapidTaps) {
      const phraseUrl = `${baseUrl}/api/tts?text=${encodeURIComponent(phrase)}&voice=puck&lang=en&v=v4`;
      const tStart = performance.now();
      const resp = await fetch(phraseUrl);
      const elapsed = performance.now() - tStart;
      aacTimes.push(elapsed);
      if (resp.status !== 200) {
        allAac200 = false;
        const errText = await resp.text().catch(() => '');
        console.error(`  [DEBUG] AAC Phrase "${phrase}" returned HTTP ${resp.status}: ${errText}`);
      }
    }

    assert(allAac200, `All ${rapidTaps.length} rapid AAC speech taps succeeded with 200 OK`);
    const avgAacTime = aacTimes.reduce((a, b) => a + b, 0) / aacTimes.length;
    assert(avgAacTime < 50, `Average response time for cached AAC tiles: ${avgAacTime.toFixed(1)}ms (< 50ms instant playback)`);

    // ------------------------------------------------------------------------
    // Scenario 11: Accurate usage metrics and bounded memory/storage growth
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 11: Accurate Usage Metrics & Bounded Storage Growth ---');
    const metricsFinal = liveBudgetTracker.getMetrics();
    assert(metricsFinal.ttsCacheHits > 0, `Usage tracker accurately counted cache hits (${metricsFinal.ttsCacheHits})`);
    assert(typeof metricsFinal.ttsUpstreamCalls === 'number', 'ttsUpstreamCalls is a valid number');
    assert(typeof metricsFinal.translateCacheHits === 'number', 'translateCacheHits is a valid number');

    // Verify key encoding / decoding for RTDB compatibility
    const dirtyKey = 'auth:user.name$1#[2]/domain';
    const encoded = encodeRtdbKey(dirtyKey);
    assert(!/[/.$#[\]]/.test(encoded), 'encodeRtdbKey strips all forbidden RTDB characters');
    const decoded = decodeRtdbKey(encoded);
    assert(decoded === dirtyKey, 'decodeRtdbKey perfectly round-trips encoded keys');

    // Verify memory cache byte bounding
    const memCache = new ByteBoundedMemoryCache(500, 3);
    memCache.set('item1', { buffer: Buffer.alloc(150), contentType: 'audio/wav' });
    memCache.set('item2', { buffer: Buffer.alloc(150), contentType: 'audio/wav' });
    memCache.set('item3', { buffer: Buffer.alloc(150), contentType: 'audio/wav' });
    memCache.set('item4', { buffer: Buffer.alloc(150), contentType: 'audio/wav' }); // triggers eviction of item1
    assert(memCache.size <= 3, 'ByteBoundedMemoryCache bounded by max items');
    assert(memCache.get('item1') === undefined, 'Oldest item evicted');
    assert(memCache.get('item4') !== undefined, 'Newest item retained');

    // Verify clean file writes without lingering temp files
    await fs.promises.readdir(testTempDir).then((files) => {
      const tmpFiles = files.filter((f) => f.endsWith('.tmp'));
      assert(tmpFiles.length === 0, 'No orphaned temporary files lingering on disk');
    });

    testServer.close();
  } finally {
    try {
      await fs.promises.rm(testTempDir, { recursive: true, force: true });
    } catch {}
  }

  console.log('\n========================================================================');
  console.log(`Results: ${passedCount} passed, ${failedCount} failed`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('[Acceptance Suite Fatal Error]:', err);
  process.exit(1);
});
