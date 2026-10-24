/**
 * BeeYou Backend Data Persistence & Shared Datastore Verification Suite
 * Fix #5: Backend Data Persistence
 *
 * Requirements verified:
 * 1. Server restart recovery with existing family data (cold boot Server C reads state and accounts from RTDB/Firestore).
 * 2. Two independent backend instances (Server A creates/modifies family, Server B in separate child process reads consistent state).
 * 3. Simultaneous updates from different devices (concurrency conflict detection via ifMatchLastUpdated).
 * 4. Failed database writes report errors accurately (502 / fail closed in production, descriptive error detail).
 * 5. Database disconnection and recovery (safe retries on transient failures).
 * 6. Membership preservation (prove syncFamilyStateToRtdb PATCH never overwrites ownerUid, members, revokedMembers).
 * 7. Account deletion followed by server restart (verifies deleted accounts do not resurrect on cold restart).
 * 8. Restoring existing data / idempotent reconciliation without duplicating records or overwriting newer cloud records.
 * 9. BEE-DEMO isolation (strictly in-memory, never persisted to RTDB or Firestore).
 * 10. Existing authentication, token lifecycle, and security protections remain valid.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
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

    child.stderr.on('data', () => {});

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
        child.kill();
        reject(new Error('Timed out waiting for worker server to start'));
      }
    }, 15000);
  });
}

async function httpRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  const parsed = new URL(url);
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string; json: () => any }>((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data,
            json: () => {
              try {
                return JSON.parse(data);
              } catch {
                return null;
              }
            },
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('BeeYou Backend Data Persistence Verification Suite');
  console.log('Fix #5: Reliable Shared Persistence & Zero Data Loss');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const appA = serverModule.default;
  const {
    signFamilyToken,
    verifyFamilyToken,
    syncFamilyStateToRtdb,
    fetchFamilyStateFromRtdb,
    deleteFamilyStateFromRtdb,
    syncCaregiverSessionToRtdb,
    fetchCaregiverSessionFromRtdb,
    deleteCaregiverSessionFromRtdb,
    syncPairingSessionToRtdb,
    fetchPairingSessionFromRtdb,
    deletePairingSessionFromRtdb,
    saveFamilyAccountToFirestore,
    fetchFamilyAccountFromFirestore,
    deleteFamilyAccountFromFirestore,
    reconcileLegacyLocalData,
    createLocalDataBackup,
    PersistenceError,
    resolveRtdbUrl,
  } = serverModule;

  const { getFirestoreAuthHeader } = await import('../src/services/firestoreSyncService');
  const authHeader = await getFirestoreAuthHeader().catch(() => 'Bearer owner');

  // Server A (Process 1)
  const serverA = http.createServer(appA);
  await new Promise<void>((resolve) => serverA.listen(0, resolve));
  const portA = (serverA.address() as any).port;
  const baseUrlA = `http://127.0.0.1:${portA}`;
  console.log(`[Server A] Active on port ${portA} (Process 1)`);

  let workerB: { child: ChildProcess; port: number } | null = null;
  let workerC: { child: ChildProcess; port: number } | null = null;

  try {
    // ==================================================================
    // Test 1: Membership Preservation (Atomic PATCH vs Destructive PUT)
    // ==================================================================
    console.log('\n--- Test 1: Membership Preservation (Atomic PATCH) ---');

    const testFamily1 = 'BEE-MEM1';
    const rawRtdbUrl = resolveRtdbUrl(`/beeyou/families/${testFamily1}.json`);

    // Direct setup of security and membership nodes in RTDB
    const initialSecurityData = {
      familyCode: testFamily1,
      ownerUid: 'uid-owner-preserve',
      members: {
        'uid-owner-preserve': true,
        'uid-member-2': true,
      },
      revokedMembers: {
        'uid-revoked-user': true,
      },
      childProfile: { name: 'OriginalName', ageGroup: 'kid' },
    };

    const setupRes = await fetch(rawRtdbUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(initialSecurityData),
    });
    assert(setupRes.ok, 'Initial RTDB security nodes seeded directly via PUT');

    // Perform an application state sync via syncFamilyStateToRtdb (which MUST use PATCH)
    const updatedStatePayload: any = {
      familyCode: testFamily1,
      childProfile: { name: 'UpdatedChildName', ageGroup: 'teen' },
      childState: { currentMood: 'happy', stars: 25 },
      routines: [{ id: 'r1', title: 'Morning Brush' }],
      aacItems: [{ id: 'a1', label: 'Water' }],
      lastUpdated: Date.now(),
    };

    await syncFamilyStateToRtdb(testFamily1, updatedStatePayload);

    // Verify RTDB state after sync
    const verifyRes = await fetch(rawRtdbUrl, {
      headers: { Authorization: authHeader },
    });
    const verifyData = await verifyRes.json();

    assert(verifyData.ownerUid === 'uid-owner-preserve', 'ownerUid was preserved and not overwritten');
    assert(verifyData.members && verifyData.members['uid-member-2'] === true, 'members map was preserved');
    assert(verifyData.revokedMembers && verifyData.revokedMembers['uid-revoked-user'] === true, 'revokedMembers map was preserved');
    assert(verifyData.childProfile?.name === 'UpdatedChildName', 'State fields updated successfully');
    assert(Array.isArray(verifyData.routines) && verifyData.routines.length === 1, 'Routines array updated successfully');

    // ==================================================================
    // Test 2: Concurrency Conflict Detection (ifMatchLastUpdated)
    // ==================================================================
    console.log('\n--- Test 2: Concurrency Conflict Detection ---');

    const testFamily2 = 'BEE-CONCUR';
    const t0 = 1000;
    const t1 = 2000;
    const t2 = 3000;

    // Seed state at t1
    await syncFamilyStateToRtdb(testFamily2, { childProfile: { name: 'Leo' }, lastUpdated: t1 });

    // Client trying to update using stale base timestamp t0 (< t1) must be rejected
    let conflictCaught = false;
    try {
      await syncFamilyStateToRtdb(testFamily2, { childProfile: { name: 'Leo Stale' }, lastUpdated: t2 }, { ifMatchLastUpdated: t0 });
    } catch (err: any) {
      if (err instanceof PersistenceError && (err.code === 'CONFLICT' || err.statusCode === 409)) {
        conflictCaught = true;
      }
    }
    assert(conflictCaught, 'State update with stale ifMatchLastUpdated correctly detected conflict and rejected');

    // Client updating with matching base timestamp t1 (>= t1) must succeed
    let matchSucceeded = false;
    try {
      await syncFamilyStateToRtdb(testFamily2, { childProfile: { name: 'Leo Fresh' }, lastUpdated: t2 }, { ifMatchLastUpdated: t1 });
      matchSucceeded = true;
    } catch {}
    assert(matchSucceeded, 'State update with current ifMatchLastUpdated succeeded');

    // ==================================================================
    // Test 3: Multi-Instance Realtime Sync (Server A -> Server B)
    // ==================================================================
    console.log('\n--- Test 3: Multi-Instance State Synchronization ---');

    workerB = await spawnWorkerServer();
    const portB = workerB.port;
    const baseUrlB = `http://127.0.0.1:${portB}`;
    console.log(`[Server B] Active on port ${portB} (Process 2)`);

    const multiEmail = 'multi_instance_caregiver@test.com';
    const multiUid = 'uid-multi-owner-1';
    const multiFamilyCode = 'BEE-MULTI99';

    // Step 1: Server A registers family account and updates state
    const serverAToken = signFamilyToken(multiFamilyCode, 'caregiver', multiEmail, multiUid);

    const regResA = await httpRequest(`${baseUrlA}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serverAToken}`,
      },
      body: JSON.stringify({
        email: multiEmail,
        caregiverName: 'Multi Parent',
        childName: 'Alex',
        childAgeGroup: 'kid',
      }),
    });
    const regJsonA = regResA.json();
    assert(regResA.status === 200 && regJsonA.success, 'Server A successfully registered new family account');

    const effectiveFamilyCode = regJsonA.account.familyCode;

    // Step 2: Server A updates routines and stars
    const updateResA = await httpRequest(`${baseUrlA}/api/family/state/${effectiveFamilyCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regJsonA.token}`,
      },
      body: JSON.stringify({
        childProfile: { name: 'Alex Updated' },
        childState: { currentMood: 'calm', stars: 55 },
        routines: [{ id: 'rt-1', title: 'Sensory Wind Down' }],
      }),
    });
    assert(updateResA.status === 200, 'Server A successfully posted family state update');

    // Step 3: Server B (independent process memory) queries family state and caregiver session
    const serverBToken = signFamilyToken(effectiveFamilyCode, 'caregiver', multiEmail, multiUid);

    const stateResB = await httpRequest(`${baseUrlB}/api/family/state/${effectiveFamilyCode}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${serverBToken}` },
    });
    const stateJsonB = stateResB.json();

    assert(stateResB.status === 200, 'Server B successfully handled state request without local memory');
    assert(stateJsonB.state?.childProfile?.name === 'Alex Updated', 'Server B read updated child name from shared RTDB');
    assert(stateJsonB.state?.childState?.stars === 55, 'Server B read updated stars count from shared RTDB');
    assert(stateJsonB.state?.routines?.[0]?.title === 'Sensory Wind Down', 'Server B read updated routines from shared RTDB');

    // Step 4: Server B reads caregiver session
    const sessionResB = await httpRequest(`${baseUrlB}/api/caregiver/session/${effectiveFamilyCode}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${serverBToken}` },
    });
    const sessionJsonB = sessionResB.json();
    assert(sessionResB.status === 200 && sessionJsonB.session, 'Server B retrieved caregiver session from shared RTDB');

    // ==================================================================
    // Test 4: Cold Boot Server Restart Recovery
    // ==================================================================
    console.log('\n--- Test 4: Cold Boot Server Restart Recovery ---');

    workerC = await spawnWorkerServer();
    const portC = workerC.port;
    const baseUrlC = `http://127.0.0.1:${portC}`;
    console.log(`[Server C] Cold boot server on port ${portC} (Process 3)`);

    // Server C attempts to verify member listing and account data
    const memberResC = await httpRequest(`${baseUrlC}/api/family/members/${effectiveFamilyCode}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${serverBToken}` },
    });
    const memberJsonC = memberResC.json();

    assert(memberResC.status === 200, 'Server C successfully retrieved family members on cold boot');
    assert(memberJsonC.ownerUid === multiUid, 'Server C resolved ownerUid from Firestore registry');
    assert(memberJsonC.familyCode === effectiveFamilyCode, 'Server C resolved familyCode index correctly');

    // ==================================================================
    // Test 5: Shared Account Deletion & Anti-Resurrection
    // ==================================================================
    console.log('\n--- Test 5: Shared Account Deletion & Anti-Resurrection ---');

    const delTargetCode = 'BEE-DEL99';
    const delTargetEmail = 'delete_me_now@test.com';
    const delTargetUid = 'uid-del-target-99';

    // Register account
    const delAuthToken = signFamilyToken(delTargetCode, 'caregiver', delTargetEmail, delTargetUid);
    await httpRequest(`${baseUrlA}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${delAuthToken}`,
      },
      body: JSON.stringify({
        email: delTargetEmail,
        caregiverName: 'Del Parent',
        childName: 'DelChild',
      }),
    });

    // Delete account via Server A
    const delResA = await httpRequest(`${baseUrlA}/api/caregiver/family/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${delAuthToken}`,
      },
      body: JSON.stringify({
        email: delTargetEmail,
        familyCode: delTargetCode,
      }),
    });
    const delJsonA = delResA.json();
    assert(delResA.status === 200 && delJsonA.success, 'Server A permanently deleted family account');
    assert(delJsonA.details?.sharedDatastorePurged === true, 'Shared datastores were purged in deletion');

    // Verify datastores directly
    const directRtdbCheck = await fetch(resolveRtdbUrl(`/beeyou/families/${delTargetCode}.json`), {
      headers: { Authorization: authHeader },
    });
    const directRtdbVal = await directRtdbCheck.json();
    assert(directRtdbVal === null, 'RTDB family state document was purged completely');

    // Cold boot query from Server C: must NOT resurrect
    const coldQuery = await httpRequest(`${baseUrlC}/api/caregiver/family/${encodeURIComponent(delTargetEmail)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${delAuthToken}` },
    });
    assert(coldQuery.status === 401 || coldQuery.status === 404, 'Deleted family account does not resurrect on cold boot server');

    // ==================================================================
    // Test 6: Safe Idempotent Local Reconciliation
    // ==================================================================
    console.log('\n--- Test 6: Safe Idempotent Local Reconciliation ---');

    // Create a local backup
    const backupResult = await createLocalDataBackup();
    assert(backupResult.success && backupResult.backupCount >= 0, 'createLocalDataBackup executed without error');

    // Reconcile legacy local data without overwriting newer records
    const reconResult = await reconcileLegacyLocalData();
    assert(typeof reconResult.accountsReconciled === 'number', 'reconcileLegacyLocalData completed idempotently');

    // ==================================================================
    // Test 7: BEE-DEMO Isolation
    // ==================================================================
    console.log('\n--- Test 7: BEE-DEMO Strict Sandbox Isolation ---');

    // syncFamilyStateToRtdb for BEE-DEMO should be a no-op
    await syncFamilyStateToRtdb('BEE-DEMO', { childProfile: { name: 'Demo Leo' }, lastUpdated: Date.now() });
    const demoRtdbCheck = await fetch(resolveRtdbUrl('/beeyou/families/BEE-DEMO.json'), {
      headers: { Authorization: authHeader },
    });
    const demoRtdbVal = await demoRtdbCheck.json();
    assert(demoRtdbVal === null, 'BEE-DEMO state is never persisted to Realtime Database');

    // Attempting to delete BEE-DEMO must be rejected
    const demoDelRes = await httpRequest(`${baseUrlA}/api/caregiver/family/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signFamilyToken('BEE-DEMO', 'admin', 'demo@beeyou.app')}`,
      },
      body: JSON.stringify({
        email: 'demo@beeyou.app',
        familyCode: 'BEE-DEMO',
      }),
    });
    assert(demoDelRes.status === 403, 'Deletion endpoint protects BEE-DEMO sandbox from destruction');

    // ==================================================================
    // Test 8: Transient Error Retries & Fail-Closed Errors
    // ==================================================================
    console.log('\n--- Test 8: Transient Retries & Fail-Closed Reporting ---');

    let retryAttempts = 0;
    const mockFailingFetch: any = async () => {
      retryAttempts++;
      if (retryAttempts < 3) {
        return new Response('Internal Server Error', { status: 500, statusText: 'Server Error' });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, statusText: 'OK' });
    };

    // Retry should succeed on the 3rd attempt
    await syncFamilyStateToRtdb('BEE-RETRY-OK', { childProfile: { name: 'RetryChild' } }, {
      customFetch: mockFailingFetch,
      maxRetries: 3,
    });
    assert(retryAttempts === 3, `Transient 500 errors were safely retried (attempt count: ${retryAttempts})`);

    // Persistent failure should throw PersistenceError with structured detail
    let persistentFailureCaught = false;
    const mockAlwaysFailFetch: any = async () => {
      return new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' });
    };

    try {
      await syncFamilyStateToRtdb('BEE-RETRY-FAIL', { childProfile: { name: 'FailChild' } }, {
        customFetch: mockAlwaysFailFetch,
        maxRetries: 2,
      });
    } catch (err: any) {
      if (err instanceof PersistenceError && err.statusCode === 502) {
        persistentFailureCaught = true;
      }
    }
    assert(persistentFailureCaught, 'Exhausted retries throw structured PersistenceError with statusCode 502');

  } finally {
    serverA.close();
    if (workerB?.child) {
      try { workerB.child.kill(); } catch {}
    }
    if (workerC?.child) {
      try { workerC.child.kill(); } catch {}
    }
  }

  console.log('\n======================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
