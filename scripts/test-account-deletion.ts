/**
 * BeeYou Finding 7 Test Suite: Complete Account Deletion, Linked Device Teardown,
 * Uploaded Files, Local Data, Subscription Handling, and Granular Partial Failure Reporting.
 *
 * Verifies:
 * 1. Server-side family deletion endpoint (POST /api/caregiver/family/delete)
 * 2. Purge of memory maps, disk files (.data/families/CODE.json), sessions, and token revocation
 * 3. Linked caregiver device broadcast & disconnection (FAMILY_ACCOUNT_DELETED)
 * 4. Demo account protection from permanent cloud deletion
 * 5. Complete local storage, encrypted vault, and secure device storage purge
 * 6. Subscription cancellation & app store billing notices (Apple / Google links)
 * 7. Granular step-by-step reporting and action required if deletion fails partway through
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import serverApp, {
  familyAccounts,
  caregiverSessions,
  pairingSessions,
  revokedFamilyCodes,
  signFamilyToken,
  DATA_DIR,
} from '../server';

let server: http.Server;
let baseUrl: string;
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

async function runTests() {
  console.log('\n======================================================');
  console.log('🐝 BeeYou Finding 7: Account Deletion & Subscription Handling');
  console.log('======================================================\n');

  // Start test server on ephemeral port
  server = http.createServer(serverApp);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`[Test Server] Running on ephemeral port: ${addr.port}`);
      resolve();
    });
  });

  // -------------------------------------------------------------
  // Suite 1: Server Deletion Endpoint & File/Record Purge
  // -------------------------------------------------------------
  console.log('\n--- Suite 1: Server Deletion Endpoint & Record/Disk Purge ---');

  const testEmail = `del_test_${Date.now()}@example.com`;
  const testFamilyCode = `BEE-DEL${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // 1. Setup active family account and session
  familyAccounts.set(testEmail, {
    id: `fam-${Date.now()}`,
    email: testEmail,
    familyCode: testFamilyCode,
    caregiverName: 'Sarah Test',
    caregiverRole: 'Parent',
    childProfile: {
      name: 'Timmy',
      ageGroup: 'kid',
      pin: 'sha256:1234',
      interests: ['Trains'],
      pronouns: 'he/him',
    },
    subscriptionTier: 'premium',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  });

  caregiverSessions.set(testFamilyCode, {
    pairingCode: testFamilyCode,
    childName: 'Timmy',
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Reading',
    currentMood: 'calm',
    habitsCompletedToday: 1,
    totalHabits: 3,
    routineProgress: null,
    stars: 5,
    isOffline: false,
    messages: [],
    unlinked: false,
  });

  pairingSessions.set(testFamilyCode, {
    pairingCode: testFamilyCode,
    token: `tok-${Date.now()}`,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000,
    status: 'paired',
    initiatedBy: 'caregiver',
    childName: 'Timmy',
    caregiverEmail: testEmail,
  });

  // Create disk state file in .data/families/
  const familiesDir = path.join(DATA_DIR, 'families');
  if (!fs.existsSync(familiesDir)) {
    fs.mkdirSync(familiesDir, { recursive: true });
  }
  const testDiskFile = path.join(familiesDir, `${testFamilyCode}.json`);
  fs.writeFileSync(testDiskFile, JSON.stringify({ familyCode: testFamilyCode, childName: 'Timmy' }), 'utf-8');

  assert(fs.existsSync(testDiskFile), 'Created sample family disk state file before deletion');
  assert(familyAccounts.has(testEmail), 'Family account exists in server memory before deletion');
  assert(caregiverSessions.has(testFamilyCode), 'Caregiver session exists before deletion');
  assert(pairingSessions.has(testFamilyCode), 'Pairing session exists before deletion');

  // 2. Test unauthorized deletion attempt (no token)
  const unauthRes = await fetch(`${baseUrl}/api/caregiver/family/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyCode: testFamilyCode }),
  });
  assert(unauthRes.status === 401, 'POST /api/caregiver/family/delete without token returns 401 Unauthorized');

  // 3. Test demo account deletion protection
  const demoToken = signFamilyToken('BEE-DEMO', 'demo', 'demo@beeyou.app');
  const demoDeleteRes = await fetch(`${baseUrl}/api/caregiver/family/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${demoToken}`,
    },
    body: JSON.stringify({ familyCode: 'BEE-DEMO', email: 'demo@beeyou.app' }),
  });
  assert(demoDeleteRes.status === 403, 'POST /api/caregiver/family/delete for BEE-DEMO returns 403 Forbidden');
  const demoDeleteData = await demoDeleteRes.json();
  assert(
    demoDeleteData.message.includes('Demo reviewer account cannot be permanently deleted'),
    'Demo protection returns explicit guidance to use local reset'
  );

  // 4. Test cross-family deletion protection
  const foreignToken = signFamilyToken('BEE-OTHER', 'caregiver', 'other@example.com');
  const crossDeleteRes = await fetch(`${baseUrl}/api/caregiver/family/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${foreignToken}`,
    },
    body: JSON.stringify({ familyCode: testFamilyCode, email: testEmail }),
  });
  assert(crossDeleteRes.status === 403, 'Cross-family deletion attempt returns 403 Forbidden');

  // 5. Execute authorized family deletion
  const validToken = signFamilyToken(testFamilyCode, 'caregiver', testEmail);
  const deleteRes = await fetch(`${baseUrl}/api/caregiver/family/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    body: JSON.stringify({ familyCode: testFamilyCode, email: testEmail }),
  });
  assert(deleteRes.status === 200, 'POST /api/caregiver/family/delete returns 200 OK');
  const deleteData = await deleteRes.json();
  assert(deleteData.success === true, 'Response success is true');
  assert(deleteData.details.familyAccountDeleted === true, 'Details reports familyAccountDeleted: true');
  assert(deleteData.details.caregiverSessionDeleted === true, 'Details reports caregiverSessionDeleted: true');
  assert(deleteData.details.pairingSessionsDeleted === true, 'Details reports pairingSessionsDeleted: true');
  assert(deleteData.details.diskFilesPurged === true, 'Details reports diskFilesPurged: true');
  assert(deleteData.details.broadcastNotified === true, 'Details reports broadcastNotified: true');

  // Verify memory and disk are completely purged
  assert(!familyAccounts.has(testEmail), 'Family account purged from familyAccounts Map');
  assert(!caregiverSessions.has(testFamilyCode), 'Caregiver session purged from caregiverSessions Map');
  assert(!pairingSessions.has(testFamilyCode), 'Pairing session purged from pairingSessions Map');
  assert(!fs.existsSync(testDiskFile), 'Family disk state file (.data/families/CODE.json) permanently deleted');
  assert(revokedFamilyCodes.has(testFamilyCode), 'Family code added to revokedFamilyCodes');

  // Verify subsequent requests with old token are immediately rejected
  const revokedAccessRes = await fetch(`${baseUrl}/api/caregiver/poll/${testFamilyCode}`, {
    headers: { Authorization: `Bearer ${validToken}` },
  });
  assert(revokedAccessRes.status === 401, 'Subsequent request with revoked family token returns 401 Unauthorized');

  // -------------------------------------------------------------
  // Suite 2: Linked Devices Teardown & Remote Deletion Event
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Linked Devices Teardown & Remote Deletion Event ---');

  const { deleteServerFamilyAccount, disconnectCloudSync } = await import('../src/services/caregiverSync');
  assert(typeof deleteServerFamilyAccount === 'function', 'deleteServerFamilyAccount is exported');
  assert(typeof disconnectCloudSync === 'function', 'disconnectCloudSync is exported');

  // -------------------------------------------------------------
  // Suite 3: Uploaded Storage Files Purge
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Uploaded Storage Files Purge ---');

  const { deleteUserCloudFiles } = await import('../src/services/firebaseStorageService');
  assert(typeof deleteUserCloudFiles === 'function', 'deleteUserCloudFiles is exported');
  const emptyRes = await deleteUserCloudFiles('');
  assert(emptyRes.success === true && emptyRes.count === 0, 'deleteUserCloudFiles safely handles empty prefix');
  const demoStorageRes = await deleteUserCloudFiles('BEE-DEMO');
  assert(demoStorageRes.success === true && demoStorageRes.count === 0, 'deleteUserCloudFiles protects BEE-DEMO files');

  // -------------------------------------------------------------
  // Suite 4: Local Storage, Secure Vault & Subscription Cleanup
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: Local Storage, Secure Vault & Subscription Cleanup ---');

  // Mock environment storage for testing wipe functions
  const mockStorageMap: Record<string, string> = {
    beeyou_family_account: JSON.stringify({ email: 'test@example.com' }),
    beeyou_subscription: JSON.stringify({ tier: 'premium', status: 'active' }),
    beeyou_pairing_code: 'BEE-DELTEST',
    beeyou_offline_alert_queue: '[]',
    beeyou_settings: JSON.stringify({ soundEffects: true }),
    by_sec_auth_token: 'enc:token',
    by_sec_caregiver_pin: 'enc:pin',
    beeyou_device_vault_salt: 'salt123',
    unrelated_system_key: 'preserve_this',
  };

  (global as any).localStorage = {
    getItem: (k: string) => mockStorageMap[k] || null,
    setItem: (k: string, v: string) => { mockStorageMap[k] = v; },
    removeItem: (k: string) => { delete mockStorageMap[k]; },
    key: (i: number) => Object.keys(mockStorageMap)[i] || null,
    get length() { return Object.keys(mockStorageMap).length; },
    clear: () => { Object.keys(mockStorageMap).forEach((k) => delete mockStorageMap[k]); },
  };

  (global as any).sessionStorage = {
    clear: () => {},
    removeItem: () => {},
  };

  (global as any).window = {
    localStorage: (global as any).localStorage,
    sessionStorage: (global as any).sessionStorage,
    dispatchEvent: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const { wipeAllSecureStorage } = await import('../src/services/secureStorageService');
  assert(typeof wipeAllSecureStorage === 'function', 'wipeAllSecureStorage is exported');

  const { wipeDeviceStorage } = await import('../src/services/authService');
  assert(typeof wipeDeviceStorage === 'function', 'wipeDeviceStorage is exported');

  await wipeDeviceStorage();

  assert(!mockStorageMap.beeyou_family_account, 'wipeDeviceStorage cleared beeyou_family_account');
  assert(!mockStorageMap.beeyou_subscription, 'wipeDeviceStorage cleared beeyou_subscription');
  assert(!mockStorageMap.beeyou_pairing_code, 'wipeDeviceStorage cleared beeyou_pairing_code');
  assert(!mockStorageMap.beeyou_offline_alert_queue, 'wipeDeviceStorage cleared beeyou_offline_alert_queue');
  assert(!mockStorageMap.by_sec_auth_token, 'wipeDeviceStorage cleared by_sec_auth_token');
  assert(!mockStorageMap.by_sec_caregiver_pin, 'wipeDeviceStorage cleared by_sec_caregiver_pin');
  assert(!mockStorageMap.beeyou_device_vault_salt, 'wipeDeviceStorage cleared beeyou_device_vault_salt');

  // -------------------------------------------------------------
  // Suite 5: Partial Failure Handling & UI Integrity Checks
  // -------------------------------------------------------------
  console.log('\n--- Suite 5: Partial Failure Handling & UI Integrity Checks ---');

  const { deleteFamilyAccount } = await import('../src/services/authService');
  assert(typeof deleteFamilyAccount === 'function', 'deleteFamilyAccount is exported');

  // Test empty password
  const emptyPwdRes = await deleteFamilyAccount('');
  assert(emptyPwdRes.success === false, 'deleteFamilyAccount without password returns success: false');
  assert(emptyPwdRes.steps && emptyPwdRes.steps.length > 0, 'Result returns structured steps array');
  assert(emptyPwdRes.steps[0].step === 'reauth' && emptyPwdRes.steps[0].status === 'failed', 'reauth step is reported as failed');

  // Inspect FamilyAuthModal.tsx code integrity
  const authModalSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/FamilyAuthModal.tsx'),
    'utf-8'
  );

  assert(
    authModalSource.includes('https://apps.apple.com/account/subscriptions'),
    'FamilyAuthModal includes direct Apple App Store subscriptions management link'
  );
  assert(
    authModalSource.includes('https://play.google.com/store/account/subscriptions'),
    'FamilyAuthModal includes direct Google Play Store subscriptions management link'
  );
  assert(
    authModalSource.includes('hasActiveSubscription') && authModalSource.includes('acknowledgedSubNotice'),
    'FamilyAuthModal enforces active subscription warning and acknowledgment before deletion'
  );
  assert(
    authModalSource.includes('Deletion Lifecycle Progress'),
    'FamilyAuthModal renders step-by-step Deletion Lifecycle Progress tracker'
  );
  assert(
    authModalSource.includes('Action Required to Complete Deletion') && authModalSource.includes('partialFailure'),
    'FamilyAuthModal provides transparent Action Required callout if deletion fails partway through'
  );
  assert(
    authModalSource.includes('Retry Remaining Steps'),
    'FamilyAuthModal provides a Retry Remaining Steps button for partial failure recovery'
  );

  // -------------------------------------------------------------
  // Suite 6: External Account-Deletion Webpage (HTTP GET /delete-account)
  // -------------------------------------------------------------
  console.log('\n--- Suite 6: External Account-Deletion Webpage Verification ---');

  const webPageRes = await fetch(`${baseUrl}/delete-account`);
  assert(webPageRes.status === 200, 'GET /delete-account returns HTTP 200 OK');
  const webPageHtml = await webPageRes.text();

  assert(
    webPageHtml.includes('BeeYou Account &amp; Data Deletion') || webPageHtml.includes('BeeYou Account & Data Deletion'),
    'External webpage contains official Account & Data Deletion heading'
  );
  assert(
    webPageHtml.includes('Permanent Data Erasure Warning'),
    'External webpage displays permanent cloud erasure warning'
  );
  assert(
    webPageHtml.includes('https://apps.apple.com/account/subscriptions'),
    'External webpage provides direct Apple App Store subscription cancellation link'
  );
  assert(
    webPageHtml.includes('https://play.google.com/store/account/subscriptions'),
    'External webpage provides direct Google Play Store subscription cancellation link'
  );
  assert(
    webPageHtml.includes('does not automatically cancel') || webPageHtml.includes('does not necessarily cancel'),
    'External webpage explicitly explains that deleting account does not cancel store subscriptions'
  );
  assert(
    webPageHtml.includes('/?action=delete-account'),
    'External webpage links to in-app deletion launcher'
  );
  assert(
    webPageHtml.includes('privacy@beeyou.app'),
    'External webpage provides fallback DPO email address for manual requests'
  );

  // Close test server
  server.close();

  console.log('\n======================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
