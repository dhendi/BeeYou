/**
 * BeeYou Firestore Membership Synchronization Reliability Verification Suite
 *
 * Verifies:
 * 1. Production credentials configuration & diagnostic verification without secret leakage.
 * 2. Authenticated header generation for emulator and service accounts.
 * 3. Structured error handling (FirestoreSyncError) and transient error retries.
 * 4. Resilient handling of simulated Firestore 500 errors, 401/403 denials, timeouts, and network interruptions.
 * 5. Consistent state enforcement: failures in register, approve, and revoke leave local state uncorrupted.
 * 6. Revocation confirmation: successful revocation cuts off Cloud Storage access for previously issued tokens.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import express from 'express';
import {
  syncFamilyToFirestore,
  verifyFirestoreConfig,
  FirestoreSyncError,
  resetCachedGoogleAuth,
  getFirestoreAuthHeader,
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
  console.log('BeeYou Firestore Sync Reliability Verification Suite');
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // Suite 1: Configuration Verification & Diagnostic Security
  // -------------------------------------------------------------------------
  console.log('--- Suite 1: Configuration Verification & Diagnostic Security ---');

  // 1.1 Emulator mode detection
  const prevEmulator = process.env.FIRESTORE_EMULATOR_HOST;
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  const emuReport = verifyFirestoreConfig();
  assert(emuReport.configured === true, 'verifyFirestoreConfig detects active emulator');
  assert(emuReport.mode === 'emulator', 'Mode is reported as emulator');
  assert(emuReport.emulatorHost === '127.0.0.1:8080', 'Reports correct emulator host');
  assert(!('privateKey' in emuReport) || typeof (emuReport as any).privateKey !== 'string', 'Does not expose raw privateKey string');

  // 1.2 Service Account JSON detection without secret exposure
  delete process.env.FIRESTORE_EMULATOR_HOST;
  process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
    project_id: 'beeyou-prod-test',
    client_email: 'service-account@beeyou-prod-test.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----',
  });
  const saReport = verifyFirestoreConfig();
  assert(saReport.configured === true, 'Detects valid service account JSON');
  assert(saReport.mode === 'service_account_json', 'Mode is reported as service_account_json');
  assert(saReport.hasClientEmail === true, 'Confirms presence of client_email');
  assert(saReport.hasPrivateKey === true, 'Confirms presence of private_key');
  assert(!JSON.stringify(saReport).includes('BEGIN PRIVATE KEY'), 'Never exposes raw private key contents');

  // 1.3 Corrupted Service Account JSON handling
  process.env.FIREBASE_SERVICE_ACCOUNT = '{ corrupted json';
  const corruptReport = verifyFirestoreConfig();
  assert(corruptReport.configured === false, 'Detects invalid JSON format as not configured');

  // Cleanup env
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  process.env.FIRESTORE_EMULATOR_HOST = prevEmulator || '127.0.0.1:8080';

  // -------------------------------------------------------------------------
  // Suite 2: Credential Resolution & Auth Header Security
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 2: Credential Resolution & Auth Header Security ---');

  // 2.1 Emulator auth header
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  const emuHeader = await getFirestoreAuthHeader();
  assert(emuHeader === 'Bearer owner', 'Emulator environment returns Bearer owner');

  // 2.2 Custom auth header override (testing support)
  const customHeader = await getFirestoreAuthHeader({ customAuthHeader: 'Bearer mock-test-token' });
  assert(customHeader === 'Bearer mock-test-token', 'Custom auth header option is respected');

  // 2.3 Unconfigured production auth failure throws FirestoreSyncError
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  delete process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  resetCachedGoogleAuth();

  try {
    await getFirestoreAuthHeader();
    assert(false, 'Unconfigured production auth throws error');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws structured FirestoreSyncError on missing credentials');
    assert(err?.statusCode === 401, 'Reports 401 status code');
  }

  // 2.4 Unconfigured production sync enforcement
  process.env.REQUIRE_FIRESTORE_SYNC = 'true';
  try {
    await syncFamilyToFirestore('BEE-PRODTEST', 'init_owner', 'uid-1');
    assert(false, 'Unconfigured sync under production enforcement throws error');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws FirestoreSyncError when sync required without credentials');
    assert(err?.statusCode === 500, 'Reports 500 status code for missing production credentials');
  }
  delete process.env.REQUIRE_FIRESTORE_SYNC;

  // 2.5 Unconfigured offline development skips gracefully
  const offlineSkipped = await syncFamilyToFirestore('BEE-OFFLINETEST', 'init_owner', 'uid-1');
  assert(offlineSkipped.skipped === true, 'Unconfigured local/offline sync skips gracefully');

  // Restore emulator
  process.env.FIRESTORE_EMULATOR_HOST = prevEmulator || '127.0.0.1:8080';

  // -------------------------------------------------------------------------
  // Suite 3: Firestore Synchronization Logic, Retries & Error Handling
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 3: Synchronization Retries, Timeouts & Error Handling ---');

  // 3.1 BEE-DEMO sandbox operations are skipped (memory-only)
  const demoResult = await syncFamilyToFirestore('BEE-DEMO', 'revoke', 'any-uid');
  assert(demoResult.skipped === true, 'BEE-DEMO operations are skipped and isolated from cloud writes');

  // 3.2 Transient failure recovery (500 on first call, 200 on second call)
  let attemptCount = 0;
  const transientMockFetch: typeof fetch = async () => {
    attemptCount++;
    if (attemptCount === 1) {
      return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ commitTime: '2026-10-23T23:00:00Z' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const transientResult = await syncFamilyToFirestore(
    'BEE-REL1',
    'approve',
    'user-retry-1',
    { role: 'caregiver' },
    { customFetch: transientMockFetch, maxRetries: 2, timeoutMs: 1000 }
  );
  assert(transientResult.success === true, 'Recovers from transient 500 error via retry');
  assert(attemptCount === 2, 'Executed exactly 2 attempts before success');

  // 3.3 Persistent 500 failure exhausts retries and throws FirestoreSyncError
  let persistentAttempts = 0;
  const persistentFailFetch: typeof fetch = async () => {
    persistentAttempts++;
    return new Response(JSON.stringify({ error: { message: 'Service Unavailable' } }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    await syncFamilyToFirestore(
      'BEE-REL1',
      'revoke',
      'user-retry-2',
      {},
      { customFetch: persistentFailFetch, maxRetries: 2, timeoutMs: 1000 }
    );
    assert(false, 'Persistent 503 error throws after max retries');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws FirestoreSyncError after exhausting retries');
    assert(err?.statusCode === 503, 'Preserves original HTTP 503 status code');
    assert(persistentAttempts === 3, 'Tried initial attempt plus 2 retries (total 3 attempts)');
  }

  // 3.4 Non-transient client error (403 Forbidden) fails immediately without retry
  let clientErrAttempts = 0;
  const clientErrFetch: typeof fetch = async () => {
    clientErrAttempts++;
    return new Response(JSON.stringify({ error: { message: 'Permission Denied' } }), {
      status: 403,
      statusText: 'Forbidden',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    await syncFamilyToFirestore(
      'BEE-REL1',
      'revoke',
      'user-denied',
      {},
      { customFetch: clientErrFetch, maxRetries: 2, timeoutMs: 1000 }
    );
    assert(false, '403 Forbidden throws error');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws FirestoreSyncError on 403');
    assert(err?.statusCode === 403, 'Reports 403 status code');
    assert(clientErrAttempts === 1, 'Does NOT retry non-transient 403 error');
  }

  // 3.5 Simulated timeout triggers AbortError and throws 504
  const timeoutFetch: typeof fetch = async () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        reject(err);
      }, 50);
    });
  };

  try {
    await syncFamilyToFirestore(
      'BEE-REL1',
      'revoke',
      'user-timeout',
      {},
      { customFetch: timeoutFetch, maxRetries: 1, timeoutMs: 30 }
    );
    assert(false, 'Timeout throws error');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws FirestoreSyncError on timeout');
    assert(err?.statusCode === 504, 'Reports 504 Gateway Timeout status');
  }

  // 3.6 Simulated network interruption (connection refused)
  let netAttempts = 0;
  const netErrorFetch: typeof fetch = async () => {
    netAttempts++;
    throw new TypeError('fetch failed: connect ECONNREFUSED 127.0.0.1:8080');
  };

  try {
    await syncFamilyToFirestore(
      'BEE-REL1',
      'revoke',
      'user-net',
      {},
      { customFetch: netErrorFetch, maxRetries: 1, timeoutMs: 1000 }
    );
    assert(false, 'Network failure throws error');
  } catch (err: any) {
    assert(err instanceof FirestoreSyncError, 'Throws FirestoreSyncError on network interruption');
    assert(err?.statusCode === 502, 'Reports 502 Bad Gateway status');
    assert(netAttempts === 2, 'Retried network interruption before throwing');
  }

  // -------------------------------------------------------------------------
  // Suite 4: End-to-End Server State Consistency & Rollback Enforcement
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 4: Server State Consistency & Rollback Enforcement ---');

  // Boot an ephemeral Express server with the real server routes
  const serverModule = await import('../server');
  const serverApp = serverModule.default;
  const { signFamilyToken, familyAccounts } = serverModule;
  const server = http.createServer(serverApp);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 4.1 Admin Firestore Status Diagnostics Endpoint
    const adminToken = signFamilyToken('BEE-ADM1', 'admin', 'admin@beeyou.app', 'adm-999');
    const caregiverToken = signFamilyToken('BEE-FAM1', 'caregiver', 'mom@family.com', 'cg-111');

    // Unauthenticated request
    let res = await fetch(`${baseUrl}/api/admin/firestore-status`);
    assert(res.status === 401, 'GET /api/admin/firestore-status without token returns 401 Unauthorized');

    // Caregiver request denied
    res = await fetch(`${baseUrl}/api/admin/firestore-status`, {
      headers: { 'Authorization': `Bearer ${caregiverToken}` },
    });
    assert(res.status === 403, 'GET /api/admin/firestore-status as caregiver returns 403 Forbidden');

    // Admin request succeeds with safe diagnostics
    res = await fetch(`${baseUrl}/api/admin/firestore-status`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'GET /api/admin/firestore-status as admin returns 200 OK');
    const statusBody = await res.json();
    assert(statusBody.success === true, 'Admin diagnostics report success: true');
    assert(statusBody.firestore && typeof statusBody.firestore.mode === 'string', 'Report includes firestore mode');
    assert(!JSON.stringify(statusBody).includes('private_key'), 'Diagnostics never leak secret private key');

    // 4.2 Seed a legitimate family for rollback and failure testing
    const testFamilyCode = 'BEE-REL101';
    const ownerUid = 'owner-reliable-1';
    const ownerEmail = 'reliable-owner@test.com';
    const ownerToken = signFamilyToken(testFamilyCode, 'caregiver', ownerEmail, ownerUid);

    familyAccounts.set(ownerEmail, {
      id: 'fam-rel101',
      email: ownerEmail,
      familyCode: testFamilyCode,
      ownerUid,
      caregiverName: 'Reliable Owner',
      caregiverRole: 'Parent',
      members: {
        [ownerUid]: { role: 'owner', email: ownerEmail, approvedAt: Date.now() },
        'member-tommy': { role: 'caregiver', email: 'tommy@test.com', approvedAt: Date.now() },
      },
      pendingMembers: {
        'pending-sarah': { uid: 'pending-sarah', email: 'sarah@test.com', role: 'caregiver', requestedAt: Date.now() },
      },
      revokedMembers: {},
      childProfile: { name: 'Bobby', ageGroup: 'kid', interests: [] },
    });

    // 4.3 Revocation with Simulated Firestore Outage
    // Point FIRESTORE_EMULATOR_HOST to non-listening port to simulate cloud failure
    const realEmu = process.env.FIRESTORE_EMULATOR_HOST;
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:59999';

    res = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: 'member-tommy', reason: 'Departed' }),
    });

    assert(res.status === 502, 'Member revocation returns 502 Bad Gateway when Firestore is unreachable');
    const failJson = await res.json();
    assert(failJson.error === 'SecuritySyncError', 'Returns SecuritySyncError code');

    // CRITICAL: Verify member-tommy was NOT revoked in server memory!
    const accountAfterFailedRevoke = familyAccounts.get(ownerEmail);
    assert(
      accountAfterFailedRevoke?.members?.['member-tommy'] !== undefined,
      'Member remains active in memory when Firestore revocation fails (state consistency preserved)'
    );
    assert(
      !accountAfterFailedRevoke?.revokedMembers?.['member-tommy'],
      'Member is NOT marked in revokedMembers on failed sync'
    );

    // 4.4 Approval with Simulated Firestore Outage
    res = await fetch(`${baseUrl}/api/family/member/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: 'pending-sarah', role: 'caregiver' }),
    });

    assert(res.status === 502, 'Member approval returns 502 when Firestore is unreachable');
    const accountAfterFailedApprove = familyAccounts.get(ownerEmail);
    assert(
      !accountAfterFailedApprove?.members?.['pending-sarah'],
      'Member is NOT added to active members on failed Firestore sync'
    );
    assert(
      accountAfterFailedApprove?.pendingMembers?.['pending-sarah'] !== undefined,
      'Member remains in pendingMembers for retry'
    );

    // Restore real emulator
    process.env.FIRESTORE_EMULATOR_HOST = realEmu;

    // 4.5 Successful Revocation with Live Emulator
    res = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: 'member-tommy', reason: 'Departed caregiver' }),
    });

    assert(res.status === 200, 'Member revocation returns 200 OK when Firestore succeeds');
    const accountAfterRevoke = familyAccounts.get(ownerEmail);
    assert(!accountAfterRevoke?.members?.['member-tommy'], 'Member removed from active members');
    assert(
      Boolean(accountAfterRevoke?.revokedMembers?.['member-tommy']),
      'Member added to revokedMembers after confirmed sync'
    );

    // 4.6 Revoked member's previously issued token is now immediately rejected
    const tommyToken = signFamilyToken(testFamilyCode, 'caregiver', 'tommy@test.com', 'member-tommy');
    res = await fetch(`${baseUrl}/api/family/state/${testFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${tommyToken}` },
    });
    assert(res.status === 401 || res.status === 403, 'Revoked member token immediately rejected by server');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    process.env.FIRESTORE_EMULATOR_HOST = prevEmulator || '127.0.0.1:8080';
  }

  console.log('\n======================================================');
  console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
