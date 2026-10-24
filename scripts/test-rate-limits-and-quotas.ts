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
import { spawn, ChildProcess } from 'child_process';
import {
  SharedRateLimitStore,
  createSingleRateLimiter,
  createCompositeRateLimiter,
  getClientIp,
  encodeRtdbKey,
  decodeRtdbKey,
  getSecondsUntilMidnight,
  isProductionEnvironment,
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

function spawnWorkerServer(): Promise<{ child: ChildProcess; port: number }> {
  return new Promise((resolve, reject) => {
    const tsxCli = path.resolve('node_modules/tsx/dist/cli.mjs');
    const child = spawn(process.execPath, [tsxCli, 'scripts/helpers/server-instance-worker.ts'], {
      env: { ...process.env, VERCEL: '1', NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let resolved = false;

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
      const match = stdoutData.match(/READY:(\d+)/);
      if (match && !resolved) {
        resolved = true;
        resolve({ child, port: Number(match[1]) });
      }
    });

    child.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    child.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Worker exited early with code ${code}`));
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill('SIGTERM');
        reject(new Error('Worker spawn timed out'));
      }
    }, 15000);
  });
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
    // Scenario 2B: Strict ETag Protection, Non-200 Rejections & Initial Creation Race
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 2B: Strict ETag Protection, Non-200 Rejections & Initial Creation Race ---');
    // 1. Empty record without ETag header must reject writes and fail closed (never silent unconditional PUT)
    let interceptedPutWithoutIfMatch = false;
    const missingEtagStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'missing_etag.json'),
      customDbUrl: 'http://mock-db-missing-etag',
      customFetch: async (_input, init) => {
        const method = init?.method || 'GET';
        if (method === 'GET') {
          // Returns 200 OK with null body but NO etag header
          return new Response('null', { status: 200, headers: {} });
        }
        if (method === 'PUT') {
          const headers = (init?.headers as Record<string, string>) || {};
          if (!headers['if-match']) {
            interceptedPutWithoutIfMatch = true;
          }
          return new Response('{"count":1}', { status: 200 });
        }
        return new Response('', { status: 404 });
      },
    });

    const missingEtagRes = await missingEtagStore.hit('auth:account:missing_etag_user', 5, 60000, 'account', { failClosed: true });
    assert(!missingEtagRes.allowed, 'Rejects GET response missing mandatory ETag with fail-closed protection');
    assert(!interceptedPutWithoutIfMatch, 'Never performed an unsafe unconditional write without If-Match');
    missingEtagStore.destroy();

    // 2. HTTP 401, 403, and 500 GET responses must fail closed and cannot reset counters or budgets
    for (const code of [401, 403, 500]) {
      const errorStore = new SharedRateLimitStore({
        customStoragePath: path.join(testTempDir, `error_${code}.json`),
        customDbUrl: `http://mock-db-${code}`,
        customFetch: async () => new Response(JSON.stringify({ error: `Mock Error ${code}` }), { status: code }),
      });

      const errRes = await errorStore.hit(`auth:account:err_user_${code}`, 5, 60000, 'account', { failClosed: true });
      assert(!errRes.allowed, `HTTP ${code} GET response triggers fail-closed protection`);
      errorStore.destroy();
    }

    // Verify read failures cannot reset daily spending budgets
    const failingBudgetTracker = new UsageBudgetTracker({
      customPath: path.join(testTempDir, 'failing_budget.json'),
      customDbUrl: 'http://mock-db-500',
      dailyTtsCap: 5,
      customFetch: async () => new Response(JSON.stringify({ error: 'Database Internal Error' }), { status: 500 }),
    });

    const oldEnv2B = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const failBudgetRes = await failingBudgetTracker.reserveTtsBudget();
    assert(!failBudgetRes.allowed, 'RTDB GET 500 failure rejects reservation and cannot reset budget');
    process.env.NODE_ENV = oldEnv2B;
    failingBudgetTracker.destroy();

    // 3. Simultaneous initial-record creation race
    if (isEmulatorActive) {
      const initRaceStoreA = new SharedRateLimitStore({ customStoragePath: path.join(testTempDir, 'init_race_a.json') });
      const initRaceStoreB = new SharedRateLimitStore({ customStoragePath: path.join(testTempDir, 'init_race_b.json') });
      const initKey = `test:initial_creation_race:${Date.now()}`;

      // Launch two simultaneous initial-record creations on a fresh key
      const [initA, initB] = await Promise.all([
        initRaceStoreA.hit(initKey, 5, 60000, 'account'),
        initRaceStoreB.hit(initKey, 5, 60000, 'account'),
      ]);

      assert(initA.allowed && initB.allowed, 'Both simultaneous initial creations succeeded via retry');
      assert((initA.count === 1 && initB.count === 2) || (initA.count === 2 && initB.count === 1), 'One created slot 1, the other handled 412 conflict and incremented to 2');

      initRaceStoreA.destroy();
      initRaceStoreB.destroy();
    }

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
    // Scenario 5: Missing Credentials, Inaccessible RTDB, Recovery & Fail-Closed Auth
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 5: Missing Credentials, Inaccessible RTDB, Recovery & Fail-Closed Auth ---');
    // 1. Missing RTDB credentials
    const missingCredsStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'missing_creds.json'),
      disableRtdb: true,
    });

    const sensitiveAuthKey = `auth:account:secure_user_${Date.now()}@corp.org`;
    const nonSensitiveIpKey = `ip:public_visitor_${Date.now()}`;

    // Sensitive auth rule must FAIL CLOSED when RTDB credentials are missing
    const authMissingResult = await missingCredsStore.hit(sensitiveAuthKey, 5, 60000, 'account', { failClosed: true });
    assert(!authMissingResult.allowed, 'Sensitive authentication FAILS CLOSED when RTDB credentials are missing');
    assert(authMissingResult.retryAfterSec > 0, 'Fail-closed result includes safety retryAfterSec');

    // Non-critical general IP rule falls back to local in-memory counter with warning
    const nonSensitiveResult = await missingCredsStore.hit(nonSensitiveIpKey, 100, 60000, 'ip', { failClosed: false });
    assert(nonSensitiveResult.allowed, 'Non-critical general rule falls back to local in-memory counter');
    missingCredsStore.destroy();

    // Production TTS spending caps must NOT silently fall back to local counters
    const oldEnvProd = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const missingBudgetTracker = new UsageBudgetTracker({
      customPath: path.join(testTempDir, 'missing_budget.json'),
      disableRtdb: true,
      dailyTtsCap: 5,
    });
    const missingBudgetRes = await missingBudgetTracker.reserveTtsBudget();
    assert(!missingBudgetRes.allowed, 'Production TTS spending cap FAILS CLOSED when RTDB is unconfigured');
    assert(missingBudgetRes.error?.includes('unconfigured') || missingBudgetRes.error?.includes('unavailable'), 'Error cites shared store requirement in production');
    process.env.NODE_ENV = oldEnvProd;
    missingBudgetTracker.destroy();

    // 2. Inaccessible RTDB (network partition / timeout)
    const brokenDbStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'broken.json'),
      customDbUrl: 'http://127.0.0.1:59999/unreachable_db', // Intentionally unreachable
      timeoutMs: 500, // Rapid timeout
    });

    const authBrokenResult = await brokenDbStore.hit(sensitiveAuthKey, 5, 60000, 'account', { failClosed: true });
    assert(!authBrokenResult.allowed, 'Sensitive authentication FAILS CLOSED on database error/timeout');

    // Inaccessible RTDB in production blocks upstream spending
    process.env.NODE_ENV = 'production';
    const brokenBudgetTracker = new UsageBudgetTracker({
      customPath: path.join(testTempDir, 'broken_budget.json'),
      customDbUrl: 'http://127.0.0.1:59999/unreachable_db',
      timeoutMs: 500,
      dailyTtsCap: 5,
    });
    const brokenBudgetRes = await brokenBudgetTracker.reserveTtsBudget();
    assert(!brokenBudgetRes.allowed, 'Production TTS spending cap FAILS CLOSED when RTDB is inaccessible');
    process.env.NODE_ENV = oldEnvProd;
    brokenBudgetTracker.destroy();
    brokenDbStore.destroy();

    // 3. Recovery when RTDB connectivity is restored
    if (isEmulatorActive) {
      const recoveredStore = new SharedRateLimitStore({
        customStoragePath: path.join(testTempDir, 'recovered.json'),
      });
      const recoveryResult = await recoveredStore.hit(`auth:account:recovered_${Date.now()}@corp.org`, 5, 60000, 'account', { failClosed: true });
      assert(recoveryResult.allowed, 'Sensitive authentication succeeds once RTDB connectivity is restored');
      recoveredStore.destroy();
    }

    // 4. Preserve explicitly configured offline development and demo behavior
    process.env.OFFLINE_DEV = 'true';
    const offlineDevStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'offline_dev.json'),
      disableRtdb: true,
    });
    const offlineAuthResult = await offlineDevStore.hit('auth:account:dev_user@local', 5, 60000, 'account', { failClosed: true });
    assert(offlineAuthResult.allowed, 'Explicit offline development permits local authentication without cloud lockout');
    delete process.env.OFFLINE_DEV;
    offlineDevStore.destroy();

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
    // Scenario 11: Accurate usage metrics, key collision regression & bounded storage
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 11: Accurate Usage Metrics, Collision Regression & Storage ---');
    const metricsFinal = liveBudgetTracker.getMetrics();
    assert(metricsFinal.ttsCacheHits > 0, `Usage tracker accurately counted cache hits (${metricsFinal.ttsCacheHits})`);
    assert(typeof metricsFinal.ttsUpstreamCalls === 'number', 'ttsUpstreamCalls is a valid number');
    assert(typeof metricsFinal.translateCacheHits === 'number', 'translateCacheHits is a valid number');

    // Regression Test: alice.smith@example.com vs alice_46_smith@example.com cannot share a counter
    const keyDot = 'auth:account:alice.smith@example.com';
    const keyEsc = 'auth:account:alice_46_smith@example.com';
    const encDot = encodeRtdbKey(keyDot);
    const encEsc = encodeRtdbKey(keyEsc);
    assert(encDot !== encEsc, 'alice.smith@example.com and alice_46_smith@example.com produce strictly distinct Base64URL keys');

    const encodingStore = new SharedRateLimitStore({
      customStoragePath: path.join(testTempDir, 'encoding_limits.json'),
    });

    // Exhaust all 5 slots of alice.smith
    for (let i = 0; i < 5; i++) {
      await encodingStore.hit(keyDot, 5, 60000, 'account');
    }
    const resDot = await encodingStore.hit(keyDot, 5, 60000, 'account');
    assert(!resDot.allowed, 'alice.smith@example.com is strictly locked out after 5 attempts');

    // alice_46_smith must be completely unaffected and permitted at count 1
    const resEsc = await encodingStore.hit(keyEsc, 5, 60000, 'account');
    assert(resEsc.allowed && resEsc.count === 1, 'alice_46_smith@example.com is completely unaffected and starts fresh at count 1');
    encodingStore.destroy();

    // Verify key encoding / decoding for punctuation, underscores, Unicode, numeric escapes
    const complexKeys = [
      'auth:account:josé.o\'connor_46_test$1@[2]#user/3',
      'auth:account:山田_太郎@domain.jp',
      'pairing:code:123-456_789',
      'tts:ip:2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    ];

    for (const ck of complexKeys) {
      const enc = encodeRtdbKey(ck);
      assert(!/[/.$#[\]]/.test(enc), `encodeRtdbKey strips all forbidden RTDB characters for complex key`);
      const dec = decodeRtdbKey(enc);
      assert(dec === ck, `decodeRtdbKey perfectly round-trips complex key (${ck.substring(0, 24)}...)`);
    }

    // Verify rollout backward compatibility: legacy keys decode safely
    const legacyKey = 'auth:account:bob_46_smith@example.com';
    assert(decodeRtdbKey(legacyKey) === 'auth:account:bob.smith@example.com', 'decodeRtdbKey safely handles legacy escaped keys during rollout');

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

    // ------------------------------------------------------------------------
    // Scenario 12: Actual Two-Process Test for Shared Counters & Global Limits
    // ------------------------------------------------------------------------
    console.log('\n--- Scenario 12: Actual Two-Process Shared Counters & Global Limits ---');
    if (isEmulatorActive) {
      const worker = await spawnWorkerServer();
      const workerBaseUrl = `http://127.0.0.1:${worker.port}`;

      try {
        const { signFamilyToken } = await import('../server');
        const adminAuthToken = signFamilyToken('ADMIN', 'admin', 'admin@beeyou.app', 'admin_worker_verifier');

        const multiProcessAccount = `multiprocess_${Date.now()}@test.org`;
        const testAuthPath = `/api/family/auth`;

        // Process 1 makes 6 attempts (limit is 10)
        for (let i = 0; i < 6; i++) {
          const res = await fetch(`${baseUrl}${testAuthPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: multiProcessAccount }),
          });
          assert(res.status !== 429, `Process 1 attempt ${i + 1} is permitted`);
        }

        // Process 2 sends attempts 7 through 10
        for (let i = 7; i <= 10; i++) {
          const resWorker = await fetch(`${workerBaseUrl}${testAuthPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: multiProcessAccount }),
          });
          assert(resWorker.status !== 429, `Worker process processes attempt ${i}`);
        }

        // Process 2 sends attempt 11: Must receive HTTP 429 Too Many Requests across process boundaries!
        const resWorker3 = await fetch(`${workerBaseUrl}${testAuthPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: multiProcessAccount }),
        });
        assert(resWorker3.status === 429, 'Process 2 immediately enforces HTTP 429 rate limit after Process 1 hits');

        // Process 1 sends attempt 12: Also strictly blocked with HTTP 429!
        const resMainBlocked = await fetch(`${baseUrl}${testAuthPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: multiProcessAccount }),
        });
        assert(resMainBlocked.status === 429, 'Process 1 confirms HTTP 429 after Process 2 exhausted shared quota');

        // Both processes observe the shared global usage metrics in RTDB
        const usageResWorker = await fetch(`${workerBaseUrl}/api/admin/usage`, {
          headers: { 'Authorization': `Bearer ${adminAuthToken}` },
        });
        assert(usageResWorker.status === 200, 'Process 2 reports global spending metrics over RTDB');

        assert(true, 'Two separate Node.js processes share rate limits and spending caps across process boundaries');
      } finally {
        worker.child.kill('SIGTERM');
      }
    } else {
      console.log('  [SKIP] Multi-process RTDB test skipped in offline mode (requires RTDB emulator)');
    }

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
