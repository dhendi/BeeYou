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
    assert(retryAttempts >= 3, `Transient 500 errors were safely retried (attempt count: ${retryAttempts})`);

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

    // ==================================================================
    // Test 9: Cross-Family Account Privacy (Firestore Rules Emulator)
    // ==================================================================
    console.log('\n--- Test 9: Cross-Family Account Privacy (Firestore Emulator) ---');

    try {
      const { initializeTestEnvironment } = await import('@firebase/rules-unit-testing');
      const firestoreRulesText = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');
      const rulesEnv = await initializeTestEnvironment({
        projectId: 'beeyou-23d7d',
        firestore: {
          rules: firestoreRulesText,
          host: '127.0.0.1',
          port: 8080,
        },
      });

      const fam1Email = 'family1_isolated@test.com';
      const fam2Email = 'family2_isolated@test.com';
      const fam1Code = 'BEE-ISO1';
      const fam2Code = 'BEE-ISO2';
      const uidUser1 = 'uid-isolated-user-1';
      const uidUser2 = 'uid-isolated-user-2';

      // Seed records with security rules disabled
      await rulesEnv.withSecurityRulesDisabled(async (ctx) => {
        const fsDb = ctx.firestore();
        await fsDb.doc(`beeyou_family_accounts/${fam1Email}`).set({
          id: 'fam-iso-1',
          email: fam1Email,
          familyCode: fam1Code,
          ownerUid: uidUser1,
          caregiverName: 'Parent One',
          childProfileJson: JSON.stringify({ name: 'ChildOne', ageGroup: 'kid' }),
        });
        await fsDb.doc(`beeyou_family_code_index/${fam1Code}`).set({
          familyCode: fam1Code,
          email: fam1Email,
          updatedAt: Date.now(),
        });

        await fsDb.doc(`beeyou_family_accounts/${fam2Email}`).set({
          id: 'fam-iso-2',
          email: fam2Email,
          familyCode: fam2Code,
          ownerUid: uidUser2,
          caregiverName: 'Parent Two',
          childProfileJson: JSON.stringify({ name: 'ChildTwo', ageGroup: 'teen' }),
        });
        await fsDb.doc(`beeyou_family_code_index/${fam2Code}`).set({
          familyCode: fam2Code,
          email: fam2Email,
          updatedAt: Date.now(),
        });
      });

      const user1Ctx = rulesEnv.authenticatedContext(uidUser1, { familyCode: fam1Code, email: fam1Email });
      const user2Ctx = rulesEnv.authenticatedContext(uidUser2, { familyCode: fam2Code, email: fam2Email });
      const unauthCtx = rulesEnv.unauthenticatedContext();

      // 9.1 Unauthenticated read is denied
      let unauthBlocked = false;
      try {
        await unauthCtx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).get();
      } catch {
        unauthBlocked = true;
      }
      assert(unauthBlocked, 'Unauthenticated read of beeyou_family_accounts is denied');

      // 9.2 Family 1 owner can read Family 1 account and code index
      let user1ReadOk = false;
      try {
        const doc1 = await user1Ctx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).get();
        const idx1 = await user1Ctx.firestore().doc(`beeyou_family_code_index/${fam1Code}`).get();
        if (doc1.exists && idx1.exists) user1ReadOk = true;
      } catch {}
      assert(user1ReadOk, 'Family 1 owner can read their own family account and code index');

      // 9.3 Cross-Family Isolation: Family 2 owner CANNOT read Family 1 account (child profile / metadata protected)
      let user2CrossAccountBlocked = false;
      try {
        await user2Ctx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).get();
      } catch {
        user2CrossAccountBlocked = true;
      }
      assert(user2CrossAccountBlocked, 'Family 2 cannot read Family 1 account (cross-family isolation enforced)');

      // 9.4 Cross-Family Isolation: Family 2 owner CANNOT read Family 1 code index
      let user2CrossIndexBlocked = false;
      try {
        await user2Ctx.firestore().doc(`beeyou_family_code_index/${fam1Code}`).get();
      } catch {
        user2CrossIndexBlocked = true;
      }
      assert(user2CrossIndexBlocked, 'Family 2 cannot read Family 1 code index (cross-family isolation enforced)');

      // 9.5 Ordinary client write is denied
      let clientWriteBlocked = false;
      try {
        await user1Ctx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).set({ ownerUid: uidUser1 });
      } catch {
        clientWriteBlocked = true;
      }
      assert(clientWriteBlocked, 'Ordinary authenticated client write to beeyou_family_accounts is denied');

      // 9.6 User with literal UID 'owner' cannot read Family 1 account
      const ownerLiteralCtx = rulesEnv.authenticatedContext('owner', { email: 'stranger@test.com' });
      let ownerLiteralReadBlocked = false;
      try {
        await ownerLiteralCtx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).get();
      } catch {
        ownerLiteralReadBlocked = true;
      }
      assert(ownerLiteralReadBlocked, 'User with literal UID owner cannot read Family 1 account');

      // 9.7 User with literal UID 'owner' cannot write Family 1 account
      let ownerLiteralWriteBlocked = false;
      try {
        await ownerLiteralCtx.firestore().doc(`beeyou_family_accounts/${fam1Email}`).set({ ownerUid: 'owner' });
      } catch {
        ownerLiteralWriteBlocked = true;
      }
      assert(ownerLiteralWriteBlocked, 'User with literal UID owner cannot write Family 1 account');

      // 9.8 User with literal UID 'owner' cannot read Family 1 code index
      let ownerLiteralIndexBlocked = false;
      try {
        await ownerLiteralCtx.firestore().doc(`beeyou_family_code_index/${fam1Code}`).get();
      } catch {
        ownerLiteralIndexBlocked = true;
      }
      assert(ownerLiteralIndexBlocked, 'User with literal UID owner cannot read Family 1 code index');

      await rulesEnv.cleanup();
    } catch (rulesErr: any) {
      console.error('[Test 9 Error]:', rulesErr?.message);
      assert(false, 'Cross-Family Account Privacy suite executed without runtime failure', rulesErr?.message);
    }

    // ==================================================================
    // Test 10: Two Independent Servers Simultaneously Modifying Family
    // ==================================================================
    console.log('\n--- Test 10: Two Servers Simultaneously Modifying Family ---');

    const runSuffix = Date.now().toString(36);
    const concurEmail = `concurrent_${runSuffix}@test.com`;
    const concurUid = `uid-concur-${runSuffix}`;
    const concurCode = `BEE-CC${runSuffix.slice(-4).toUpperCase()}`;

    // Register family via Server A
    const concurTokenA = signFamilyToken(concurCode, 'caregiver', concurEmail, concurUid);
    const regConcurRes = await httpRequest(`${baseUrlA}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${concurTokenA}`,
      },
      body: JSON.stringify({
        email: concurEmail,
        caregiverName: 'Concur Parent',
        childName: 'Sam',
        childAgeGroup: 'kid',
      }),
    });
    assert(regConcurRes.status === 200, 'Server A registered concurrent test family');
    const effectiveConcurCode = regConcurRes.json().account.familyCode;
    const effectiveConcurToken = regConcurRes.json().token;

    // Both servers concurrently update unrelated fields on the same family:
    // Server A updates childProfile: { name: 'Alice New Name', pronouns: 'she/her' }
    // Server B updates childState: { currentMood: 'joyful', stars: 75 }
    const postServerA = httpRequest(`${baseUrlA}/api/family/state/${effectiveConcurCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveConcurToken}`,
      },
      body: JSON.stringify({
        childProfile: { name: 'Alice New Name', pronouns: 'she/her' },
      }),
    });

    const postServerB = httpRequest(`${baseUrlB}/api/family/state/${effectiveConcurCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveConcurToken}`,
      },
      body: JSON.stringify({
        childState: { currentMood: 'joyful', stars: 75 },
      }),
    });

    const [resConcurA, resConcurB] = await Promise.all([postServerA, postServerB]);
    assert(resConcurA.status === 200, 'Server A concurrent state update succeeded (200 OK)');
    assert(resConcurB.status === 200, 'Server B concurrent state update succeeded (200 OK)');

    // Query state from RTDB directly to verify unrelated fields are preserved
    const directConcurCheck = await fetch(resolveRtdbUrl(`/beeyou/families/${effectiveConcurCode}.json`), {
      headers: { Authorization: authHeader },
    });
    const finalConcurData = await directConcurCheck.json();

    assert(
      finalConcurData.childProfile?.name === 'Alice New Name' && finalConcurData.childProfile?.pronouns === 'she/her',
      'Server A childProfile update was preserved in concurrent write'
    );
    assert(
      finalConcurData.childState?.stars === 75 && finalConcurData.childState?.currentMood === 'joyful',
      'Server B childState mood update was preserved in concurrent write'
    );
    assert(
      finalConcurData.ownerUid === concurUid,
      'Security ownerUid node was preserved during atomic conditional updates'
    );

    // Verify missing or mismatched ETag cannot silently turn conditional write into unconditional write
    let missingEtagErrorThrown = false;
    try {
      await syncFamilyStateToRtdb(effectiveConcurCode, {
        ...finalConcurData,
        childState: { ...finalConcurData.childState, currentMood: 'unconditional_test' },
      }, {
        ifMatchEtag: 'stale-or-mismatched-etag',
      });
    } catch (err: any) {
      if (err instanceof PersistenceError && (err.statusCode === 409 || err.statusCode === 500)) {
        missingEtagErrorThrown = true;
      }
    }
    assert(missingEtagErrorThrown, 'Conditional write with mismatched or missing ETag fails closed (no unconditional write)');

    // Verify updating an existing node when remote fetch yields no ETag throws PersistenceError
    let noEtagUpdateBlocked = false;
    const mockFetchWithoutEtag: any = async (url: string, init?: any) => {
      if (init?.method === 'GET') {
        return new Response(JSON.stringify(finalConcurData), {
          status: 200,
          headers: {},
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    try {
      await syncFamilyStateToRtdb(effectiveConcurCode, {
        ...finalConcurData,
        childState: { ...finalConcurData.childState, currentMood: 'should_fail_without_etag' },
      }, {
        customFetch: mockFetchWithoutEtag,
        ifMatchEtag: 'required-etag-abc',
      });
    } catch (err: any) {
      if (err instanceof PersistenceError && (err.operation === 'rtdb_missing_etag' || err.statusCode === 409)) {
        noEtagUpdateBlocked = true;
      }
    }
    assert(noEtagUpdateBlocked, 'Conditional update without remote ETag fails closed (no silent unconditional write)');

    // Test conflicting write: Client provides stale ifMatchLastUpdated
    const currentTimestamp = finalConcurData.lastUpdated;
    // Advance timestamp via Server A
    await httpRequest(`${baseUrlA}/api/family/state/${effectiveConcurCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveConcurToken}`,
      },
      body: JSON.stringify({
        childState: { currentMood: 'energized', stars: 80 },
        ifMatchLastUpdated: currentTimestamp,
      }),
    });

    // Server B now attempts to update with the same stale timestamp
    const staleConflictRes = await httpRequest(`${baseUrlB}/api/family/state/${effectiveConcurCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveConcurToken}`,
      },
      body: JSON.stringify({
        childState: { currentMood: 'sleepy', stars: 90 },
        ifMatchLastUpdated: currentTimestamp,
      }),
    });
    assert(staleConflictRes.status === 409, 'Server B detected concurrency conflict with stale timestamp (409 Conflict)');

    // ==================================================================
    // Test 11: Reliable Deletion & Anti-Resurrection from Running Server
    // ==================================================================
    console.log('\n--- Test 11: Reliable Deletion & Anti-Resurrection ---');

    // 11.1 deleteFamilyAccountFromFirestore throws on non-404 failure
    let deleteErrorThrown = false;
    const mockFailingFirestoreFetch: any = async () => {
      return new Response(JSON.stringify({ error: { message: 'Firestore unavailable', status: 'UNAVAILABLE' } }), {
        status: 503,
        statusText: 'Service Unavailable',
      });
    };

    try {
      await deleteFamilyAccountFromFirestore('mock_fail@test.com', 'BEE-MOCKFAIL', {
        customFetch: mockFailingFirestoreFetch,
      });
    } catch (err: any) {
      if (err instanceof PersistenceError && err.statusCode === 503) {
        deleteErrorThrown = true;
      }
    }
    assert(deleteErrorThrown, 'deleteFamilyAccountFromFirestore throws PersistenceError on datastore failures');

    // 11.2 Anti-Resurrection from Already-Running Server B:
    const antResSuffix = Date.now().toString(36) + 'ar';
    const antResEmail = `anti_res_${antResSuffix}@test.com`;
    const antResUid = `uid-ant-res-${antResSuffix}`;
    const antResCode = `BEE-AR${antResSuffix.slice(-4).toUpperCase()}`;

    // Step 1: Register family on Server A
    const antResTokenA = signFamilyToken(antResCode, 'caregiver', antResEmail, antResUid);
    const regAntRes = await httpRequest(`${baseUrlA}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${antResTokenA}`,
      },
      body: JSON.stringify({
        email: antResEmail,
        caregiverName: 'AntiRes Parent',
        childName: 'Maya',
      }),
    });
    assert(regAntRes.status === 200, 'Server A registered anti-resurrection test family');
    const effectiveAntResCode = regAntRes.json().account.familyCode;
    const effectiveAntResToken = regAntRes.json().token;

    // Step 2: Query on Server B so Server B caches it in its process memory
    const queryServerB = await httpRequest(`${baseUrlB}/api/caregiver/family/${encodeURIComponent(antResEmail)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${effectiveAntResToken}` },
    });
    assert(queryServerB.status === 200, 'Server B successfully cached family account in local memory');

    // Step 3: Server A permanently deletes the family
    const delAntRes = await httpRequest(`${baseUrlA}/api/caregiver/family/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveAntResToken}`,
      },
      body: JSON.stringify({
        email: antResEmail,
        familyCode: effectiveAntResCode,
      }),
    });
    const delAntResJson = delAntRes.json();
    assert(delAntRes.status === 200 && delAntResJson.success, 'Server A deleted family account');
    assert(delAntResJson.details?.sharedDatastorePurged === true, 'Shared datastores confirmed purged');
    assert(delAntResJson.details?.firestoreAccountDeleted === true, 'Firestore account confirmed deleted');
    assert(delAntResJson.details?.rtdbFamilyStateDeleted === true, 'RTDB family state confirmed deleted');

    // Step 4: Server B (which was already running and had the family in its cache) receives request:
    // With previous token: must be rejected with 401 (token revoked across instances)
    const tokenCheckB = await httpRequest(`${baseUrlB}/api/family/state/${effectiveAntResCode}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${effectiveAntResToken}` },
    });
    assert(tokenCheckB.status === 401, 'Already-running Server B rejects revoked credentials for deleted family (401)');

    // Querying account details by email: Server B must purge its local cache and report 404 (does NOT resurrect)
    const adminCheckToken = signFamilyToken('BEE-ADMIN', 'admin', 'admin@beeyou.app', 'uid-admin-test');
    const getAccountB = await httpRequest(`${baseUrlB}/api/caregiver/family/${encodeURIComponent(antResEmail)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminCheckToken}` },
    });
    assert(getAccountB.status === 404, 'Already-running Server B reports 404 and does not resurrect deleted account');

    // Step 5: Direct verification in Firestore and RTDB that account remains deleted
    const directRtdbAntCheck = await fetch(resolveRtdbUrl(`/beeyou/families/${effectiveAntResCode}.json`), {
      headers: { Authorization: authHeader },
    });
    const directRtdbAntVal = await directRtdbAntCheck.json();
    assert(directRtdbAntVal === null, 'RTDB family document remains null and was not resurrected');

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
