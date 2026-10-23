/**
 * BeeYou Firebase Integration Consistency & Reliability Verification Suite
 *
 * Verifies:
 * 1. Login-created accounts initialize and reconcile authoritative Firestore records.
 * 2. Complete registration and login rollback on Firestore failure (zero orphaned local accounts, sessions, or disk files).
 * 3. Realtime Database HTTP response checking and reliable reconciliation for approval and revocation.
 * 4. Production Google Cloud Application Default Credentials (ADC) detection without false unconfigured reports.
 * 5. State consistency across partial database failures and successful reconciliation passes.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';
import {
  verifyFirestoreConfig,
  FirestoreSyncError,
  resetCachedGoogleAuth,
  syncFamilyToFirestore,
} from '../src/services/firestoreSyncService';

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

async function runTests() {
  console.log('\n======================================================');
  console.log('BeeYou Firebase Integration Consistency Verification');
  console.log('======================================================\n');

  // Dynamic import of server module after setting VERCEL=1
  const serverModule = await import('../server');
  const app = serverModule.default;
  const {
    signFamilyToken,
    familyAccounts,
    caregiverSessions,
    syncMemberToRtdb,
    reconcileFamilyRtdb,
  } = serverModule;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Ephemeral server active on port ${port}\n`);

  const DATA_DIR = path.resolve('.data');
  const FAMILIES_DIR = path.join(DATA_DIR, 'families');
  const ACCOUNTS_FILE = path.join(DATA_DIR, 'family_accounts.json');
  const SESSIONS_FILE = path.join(DATA_DIR, 'caregiver_sessions.json');

  // -------------------------------------------------------------------------
  // Suite 1: Production Application Default Credentials (ADC) Detection
  // -------------------------------------------------------------------------
  console.log('--- Suite 1: Production ADC & Metadata Credentials Detection ---');

  const prevEnv = { ...process.env };

  // Clear static credentials to test ADC
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  resetCachedGoogleAuth();

  // 1.1 GCE Metadata host detection
  process.env.GCE_METADATA_HOST = '169.254.169.254';
  let adcReport = verifyFirestoreConfig();
  assert(adcReport.configured === true, 'GCE_METADATA_HOST detects active ADC');
  assert(adcReport.mode === 'adc', 'GCE_METADATA_HOST reports mode as adc');
  delete process.env.GCE_METADATA_HOST;

  // 1.2 Cloud Run detection (K_SERVICE)
  process.env.K_SERVICE = 'beeyou-cloud-run-production';
  adcReport = verifyFirestoreConfig();
  assert(adcReport.configured === true, 'K_SERVICE detects active Cloud Run ADC');
  assert(adcReport.mode === 'adc', 'K_SERVICE reports mode as adc');
  delete process.env.K_SERVICE;

  // 1.3 Cloud Functions detection (FUNCTION_TARGET)
  process.env.FUNCTION_TARGET = 'beeyou-function';
  adcReport = verifyFirestoreConfig();
  assert(adcReport.configured === true, 'FUNCTION_TARGET detects active GCF ADC');
  assert(adcReport.mode === 'adc', 'FUNCTION_TARGET reports mode as adc');
  delete process.env.FUNCTION_TARGET;

  // 1.4 App Engine detection (GAE_SERVICE)
  process.env.GAE_SERVICE = 'default';
  adcReport = verifyFirestoreConfig();
  assert(adcReport.configured === true, 'GAE_SERVICE detects active App Engine ADC');
  assert(adcReport.mode === 'adc', 'GAE_SERVICE reports mode as adc');
  delete process.env.GAE_SERVICE;

  // 1.5 Explicit ADC flag
  process.env.GOOGLE_APPLICATION_DEFAULT_CREDENTIALS_ENABLED = 'true';
  adcReport = verifyFirestoreConfig();
  assert(adcReport.configured === true, 'GOOGLE_APPLICATION_DEFAULT_CREDENTIALS_ENABLED detects ADC');
  assert(adcReport.mode === 'adc', 'Explicit flag reports mode as adc');
  delete process.env.GOOGLE_APPLICATION_DEFAULT_CREDENTIALS_ENABLED;

  // Restore env
  process.env = { ...prevEnv };

  // -------------------------------------------------------------------------
  // Suite 2: Complete Registration Rollback on Firestore Failure
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 2: Complete Registration Rollback on Cloud Failure ---');

  const rollbackEmail = 'rollback-user@testfamily.com';
  const rollbackUid = 'uid-rollback-999';
  const rollbackFamilyCode = 'BEE-RBACK1';

  // Force sync failure by requiring sync without valid cloud credentials
  process.env.REQUIRE_FIRESTORE_SYNC = 'true';
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  resetCachedGoogleAuth();

  const regToken = signFamilyToken('BEE-TEMP', 'caregiver', rollbackEmail, rollbackUid);

  const regRes = await fetch(`${baseUrl}/api/caregiver/family/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${regToken}`,
    },
    body: JSON.stringify({
      email: rollbackEmail,
      caregiverName: 'Rollback Tester',
      childName: 'Rollback Kid',
    }),
  });

  assert(regRes.status === 500 || regRes.status === 502, 'Registration returns 500/502 when Firestore sync fails', `got ${regRes.status}`);
  const regErrData = await regRes.json();
  assert(regErrData.error === 'SecuritySyncError', 'Returns SecuritySyncError error code');

  // Verify memory cleanup
  assert(!familyAccounts.has(rollbackEmail), 'Failed registration removes local account from memory map');
  assert(!caregiverSessions.has(rollbackFamilyCode), 'Failed registration removes caregiver session from memory map');

  // Verify disk cleanup
  if (fs.existsSync(ACCOUNTS_FILE)) {
    const rawAccounts = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    assert(!rawAccounts.includes(rollbackEmail), 'Failed registration does NOT leave orphaned account in family_accounts.json');
  } else {
    assert(true, 'family_accounts.json does not contain failed registration');
  }

  if (fs.existsSync(SESSIONS_FILE)) {
    const rawSessions = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    assert(!rawSessions.includes(rollbackEmail), 'Failed registration does NOT leave orphaned session in caregiver_sessions.json');
  } else {
    assert(true, 'caregiver_sessions.json does not contain failed registration');
  }

  const perFamilyFile = path.join(FAMILIES_DIR, `${rollbackFamilyCode}.json`);
  assert(!fs.existsSync(perFamilyFile), 'Failed registration does NOT leave orphaned per-family file on disk');

  delete process.env.REQUIRE_FIRESTORE_SYNC;
  if (prevEnv.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = prevEnv.FIRESTORE_EMULATOR_HOST;
  } else {
    delete process.env.FIRESTORE_EMULATOR_HOST;
  }

  // -------------------------------------------------------------------------
  // Suite 3: Login-Created Accounts, Rollback & Authoritative Reconciliation
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 3: Login-Created Accounts & Reconciliation ---');

  // 3.1 Login rollback when Firestore fails on new account creation
  const loginRollbackEmail = 'login-fail-user@testfamily.com';
  const loginRollbackUid = 'uid-login-rollback-888';
  process.env.REQUIRE_FIRESTORE_SYNC = 'true';
  delete process.env.FIRESTORE_EMULATOR_HOST;
  resetCachedGoogleAuth();

  const loginFailToken = signFamilyToken('BEE-TEMP', 'caregiver', loginRollbackEmail, loginRollbackUid);
  const loginFailRes = await fetch(`${baseUrl}/api/caregiver/family/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginFailToken}`,
    },
    body: JSON.stringify({ email: loginRollbackEmail }),
  });

  assert(loginFailRes.status === 500 || loginFailRes.status === 502, 'Login account creation returns error when Firestore fails', `got ${loginFailRes.status}`);
  assert(!familyAccounts.has(loginRollbackEmail), 'Login creation failure rolls back memory account state');

  delete process.env.REQUIRE_FIRESTORE_SYNC;
  if (prevEnv.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = prevEnv.FIRESTORE_EMULATOR_HOST;
  } else {
    delete process.env.FIRESTORE_EMULATOR_HOST;
  }

  // 3.2 Successful login account creation and reconciliation
  const loginSuccessEmail = 'login-success-user@testfamily.com';
  const loginSuccessUid = 'uid-login-success-777';
  const loginSuccessToken = signFamilyToken('BEE-TEMP', 'caregiver', loginSuccessEmail, loginSuccessUid);

  const loginSuccessRes = await fetch(`${baseUrl}/api/caregiver/family/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginSuccessToken}`,
    },
    body: JSON.stringify({ email: loginSuccessEmail }),
  });

  assert(loginSuccessRes.status === 200, 'Login creates new account successfully (200 OK)', `got ${loginSuccessRes.status}`);
  const loginData = await loginSuccessRes.json();
  assert(loginData.account?.ownerUid === loginSuccessUid, 'Login-created account sets verified ownerUid');
  assert(familyAccounts.has(loginSuccessEmail), 'Login-created account is persisted to family accounts');

  // 3.3 Recovering existing account with missing ownerUid
  const recoverEmail = 'recover-user@testfamily.com';
  const recoverUid = 'uid-recover-666';
  const unlinkedAccount = {
    id: 'fam-unlinked-1',
    email: recoverEmail,
    familyCode: 'BEE-REC1',
    caregiverName: 'Unlinked Caregiver',
    caregiverRole: 'Parent',
    childProfile: { name: 'Kid', ageGroup: 'kid', pin: undefined, interests: [], pronouns: 'they/them' },
    subscriptionTier: 'premium' as const,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    // ownerUid is missing
  };
  familyAccounts.set(recoverEmail, unlinkedAccount);

  const recoverToken = signFamilyToken('BEE-REC1', 'caregiver', recoverEmail, recoverUid);
  const recoverRes = await fetch(`${baseUrl}/api/caregiver/family/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${recoverToken}`,
    },
    body: JSON.stringify({ email: recoverEmail }),
  });

  assert(recoverRes.status === 200, 'Recovering unlinked account returns 200 OK');
  const recoveredData = await recoverRes.json();
  assert(recoveredData.account?.ownerUid === recoverUid, 'Account recovery successfully links ownerUid');
  assert(familyAccounts.get(recoverEmail)?.ownerUid === recoverUid, 'Persisted memory account has linked ownerUid');

  // -------------------------------------------------------------------------
  // Suite 4: Realtime Database Verification & Reliable Reconciliation
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 4: RTDB HTTP Checking & Reliable Reconciliation ---');

  const rtdbFamilyCode = 'BEE-RTDB1';
  const rtdbOwnerUid = 'uid-rtdb-owner-1';
  const rtdbOwnerEmail = 'owner-rtdb@testfamily.com';
  const rtdbMemberUid = 'uid-rtdb-member-2';

  const rtdbAccount = {
    id: 'fam-rtdb-1',
    email: rtdbOwnerEmail,
    familyCode: rtdbFamilyCode,
    ownerUid: rtdbOwnerUid,
    members: {
      [rtdbOwnerUid]: { role: 'owner', email: rtdbOwnerEmail, approvedAt: Date.now() },
    },
    pendingMembers: {
      [rtdbMemberUid]: { email: 'helper@testfamily.com', name: 'Helper', requestedAt: Date.now() },
    },
    caregiverName: 'RTDB Owner',
    caregiverRole: 'Parent',
    childProfile: { name: 'Child', ageGroup: 'kid', pin: undefined, interests: [], pronouns: 'they/them' },
    subscriptionTier: 'premium' as const,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  familyAccounts.set(rtdbOwnerEmail, rtdbAccount);

  const rtdbOwnerToken = signFamilyToken(rtdbFamilyCode, 'caregiver', rtdbOwnerEmail, rtdbOwnerUid);

  // 4.1 Direct RTDB HTTP response check: non-2xx throws error
  const failingFetch: typeof fetch = async () => {
    return new Response(JSON.stringify({ error: 'Permission denied' }), {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  let threwRtdb = false;
  try {
    await syncMemberToRtdb(rtdbFamilyCode, 'approve', rtdbMemberUid, {}, {
      customFetch: failingFetch,
      customDbUrl: 'https://mock-db.firebaseio.com',
    });
  } catch (err: any) {
    threwRtdb = true;
    assert(err.message.includes('401'), 'syncMemberToRtdb throws on non-2xx HTTP response');
  }
  assert(threwRtdb, 'syncMemberToRtdb does not silently swallow non-2xx response');

  // 4.2 Member approval with simulated RTDB failure records reconciliation item
  // Mock global fetch to return 500 when calling RTDB URL
  const originalFetch = global.fetch;
  global.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.includes('.firebaseio.com')) {
      return new Response(JSON.stringify({ error: 'Database service unavailable' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };

  const approveRes = await fetch(`${baseUrl}/api/family/member/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rtdbOwnerToken}`,
    },
    body: JSON.stringify({ targetUid: rtdbMemberUid }),
  });

  assert(approveRes.status === 200, 'Member approval succeeds locally even if RTDB temporarily fails');
  const approveData = await approveRes.json();
  assert(approveData.rtdbReconciliationPending === true, 'Returns rtdbReconciliationPending: true on RTDB failure');
  assert(rtdbAccount.pendingRtdbReconciliations?.length === 1, 'Account records pending RTDB reconciliation item');
  assert(rtdbAccount.pendingRtdbReconciliations?.[0]?.action === 'approve', 'Recorded reconciliation item action is approve');
  assert(rtdbAccount.pendingRtdbReconciliations?.[0]?.targetUid === rtdbMemberUid, 'Recorded reconciliation item targetUid matches');

  // 4.3 Reconcile pending RTDB items when database connectivity is restored
  const successfulMockFetch: typeof fetch = async () => {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const reconcileResult = await reconcileFamilyRtdb(rtdbFamilyCode, {
    customFetch: successfulMockFetch,
    customDbUrl: 'https://mock-db.firebaseio.com',
  });

  assert(reconcileResult.success === true, 'reconcileFamilyRtdb returns success: true');
  assert(reconcileResult.reconciledCount === 1, 'reconcileFamilyRtdb reconciled exactly 1 item');
  assert(reconcileResult.remainingCount === 0, 'Zero remaining unreconciled items');
  assert(!rtdbAccount.pendingRtdbReconciliations, 'pendingRtdbReconciliations is cleared after successful reconciliation');

  // Restore global fetch
  global.fetch = originalFetch;

  // -------------------------------------------------------------------------
  // Suite 5: Member Revocation with RTDB Failure & Reconciliation
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 5: Member Revocation RTDB Reconciliation ---');

  // Simulate RTDB failure during revocation
  global.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.includes('.firebaseio.com')) {
      return new Response(JSON.stringify({ error: 'Connection reset' }), {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };

  const revokeRes = await fetch(`${baseUrl}/api/family/member/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rtdbOwnerToken}`,
    },
    body: JSON.stringify({ targetUid: rtdbMemberUid, reason: 'Caregiver departed' }),
  });

  assert(revokeRes.status === 200, 'Member revocation succeeds locally even if RTDB temporarily fails');
  const revokeData = await revokeRes.json();
  assert(revokeData.rtdbReconciliationPending === true, 'Revocation returns rtdbReconciliationPending: true on failure');
  assert(rtdbAccount.pendingRtdbReconciliations?.length === 1, 'Account records pending revocation reconciliation item');
  assert(rtdbAccount.pendingRtdbReconciliations?.[0]?.action === 'revoke', 'Recorded reconciliation item action is revoke');

  // Reconcile revocation
  const revokeReconcileResult = await reconcileFamilyRtdb(rtdbFamilyCode, {
    customFetch: successfulMockFetch,
    customDbUrl: 'https://mock-db.firebaseio.com',
  });

  assert(revokeReconcileResult.reconciledCount === 1, 'Revocation item is successfully reconciled');
  assert(!rtdbAccount.pendingRtdbReconciliations, 'Reconciliation queue is empty after reconciliation');

  global.fetch = originalFetch;
  server.close();

  // Summary
  console.log('\n======================================================');
  console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
