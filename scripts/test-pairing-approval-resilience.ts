/**
 * Regression Test Suite: Pairing Approval Resilience & Error Handling
 *
 * Verifies:
 * 1. Successful approval updates local pairing state and returns success
 * 2. Rejected authorization (401/403) returns failure and prevents local paired status
 * 3. Expired pairing code (400) returns failure and prevents local paired status
 * 4. Network failure returns failure and prevents local paired status
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';
process.env.FAMILY_AUTH_SECRET = 'audit-secret-salt-32-chars-long-minimum-entropy';

import http from 'http';

// Provide a mock localStorage for Node.js test environment
const mockStorage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => { mockStorage.set(key, String(val)); },
  removeItem: (key: string) => { mockStorage.delete(key); },
  clear: () => { mockStorage.clear(); },
};
(globalThis as any).localStorage = localStorageMock;

async function runTests() {
  console.log('\n======================================================');
  console.log('BeeYou Pairing Approval Resilience Test Suite');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const app = serverModule.default;
  const { pairingSessions, signFamilyToken } = serverModule;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Ephemeral server active on port ${port}\n`);

  // Intercept relative fetch calls to point to the local ephemeral server
  const nativeFetch = globalThis.fetch;
  let simulateNetworkError = false;

  (globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (simulateNetworkError) {
      throw new TypeError('Failed to fetch (simulated network connection loss)');
    }
    if (typeof input === 'string' && input.startsWith('/')) {
      return nativeFetch(`${baseUrl}${input}`, init);
    }
    return nativeFetch(input, init);
  };

  const caregiverSync = await import('../src/services/caregiverSync');
  const { approvePairingSession } = caregiverSync;

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

  try {
    // -------------------------------------------------------------
    // Test 1: Successful Pairing Approval
    // -------------------------------------------------------------
    console.log('--- Test 1: Successful Pairing Approval ---');

    // 1.1 Create pairing session on server
    let res = await nativeFetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatedBy: 'child_device',
        childName: 'Emma',
        targetFamilyCode: 'BEE-RESIL1',
      }),
    });
    assert(res.status === 200, 'POST /api/caregiver/pairing/create returns 200');
    const createData1 = await res.json();
    const session1 = createData1.session;

    // 1.2 Claim pairing session
    res = await nativeFetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: session1.pairingCode,
        caregiverName: 'Mom',
        claimerRole: 'caregiver',
      }),
    });
    assert(res.status === 200, 'POST /api/caregiver/pairing/claim returns 200');

    // 1.3 Seed local storage as the creator device with session token
    mockStorage.clear();
    mockStorage.set('beeyou_temporary_pairing_session', JSON.stringify({
      pairingCode: session1.pairingCode,
      token: session1.token,
      status: 'awaiting_approval',
    }));

    // 1.4 Call approvePairingSession
    const approveResult1 = await approvePairingSession(session1.pairingCode);
    assert(approveResult1.success === true, 'approvePairingSession returns success: true on 200 OK');
    assert(typeof approveResult1.message === 'string' && approveResult1.message.length > 0, 'Returns confirmation message');

    // 1.5 Verify local storage is marked paired
    const stored1 = JSON.parse(mockStorage.get('beeyou_temporary_pairing_session') || '{}');
    assert(stored1.status === 'paired', 'Local pairing session updated to status: paired');
    assert(stored1.targetFamilyCode === 'BEE-RESIL1', 'Local pairing session stores targetFamilyCode');

    // -------------------------------------------------------------
    // Test 2: Rejected Authorization (401 / 403)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Rejected Authorization Handling ---');

    // 2.1 Create another pairing session
    res = await nativeFetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatedBy: 'child_device',
        childName: 'Noah',
        targetFamilyCode: 'BEE-RESIL2',
      }),
    });
    const createData2 = await res.json();
    const session2 = createData2.session;

    // Claim it
    await nativeFetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: session2.pairingCode,
        caregiverName: 'Dad',
        claimerRole: 'caregiver',
      }),
    });

    // 2.2 Seed local storage with an invalid/unauthorized session token
    mockStorage.clear();
    mockStorage.set('beeyou_temporary_pairing_session', JSON.stringify({
      pairingCode: session2.pairingCode,
      token: 'tok-bogus-attacker-token',
      status: 'awaiting_approval',
    }));

    const approveResult2 = await approvePairingSession(session2.pairingCode);
    assert(approveResult2.success === false, 'approvePairingSession returns success: false on 401/403');
    assert(approveResult2.message.includes('authorization') || approveResult2.message.includes('Unauthorized') || approveResult2.message.includes('Forbidden'), 'Message indicates authorization failure');

    // 2.3 Verify local storage was NOT marked paired
    const stored2 = JSON.parse(mockStorage.get('beeyou_temporary_pairing_session') || '{}');
    assert(stored2.status !== 'paired', 'Local pairing session is NOT marked paired after authorization rejection');
    assert(stored2.status === 'awaiting_approval', 'Local pairing session preserves previous status: awaiting_approval');

    // -------------------------------------------------------------
    // Test 3: Expired Pairing Code (400)
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Expired Pairing Code Handling ---');

    // 3.1 Create and claim pairing session
    res = await nativeFetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatedBy: 'child_device',
        childName: 'Liam',
        targetFamilyCode: 'BEE-RESIL3',
      }),
    });
    const createData3 = await res.json();
    const session3 = createData3.session;

    await nativeFetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: session3.pairingCode,
        caregiverName: 'Mom',
      }),
    });

    // 3.2 Artificially expire the session on the server
    const serverSession3 = pairingSessions.get(session3.pairingCode);
    if (serverSession3) {
      serverSession3.expiresAt = Date.now() - 5000;
      serverSession3.status = 'expired';
    }

    mockStorage.clear();
    mockStorage.set('beeyou_temporary_pairing_session', JSON.stringify({
      pairingCode: session3.pairingCode,
      token: session3.token,
      status: 'awaiting_approval',
    }));

    const approveResult3 = await approvePairingSession(session3.pairingCode);
    assert(approveResult3.success === false, 'approvePairingSession returns success: false on expired code');
    assert(approveResult3.message.toLowerCase().includes('expired'), 'Message indicates code has expired');

    // 3.3 Verify local storage was NOT marked paired
    const stored3 = JSON.parse(mockStorage.get('beeyou_temporary_pairing_session') || '{}');
    assert(stored3.status !== 'paired', 'Local pairing session is NOT marked paired when code is expired');

    // -------------------------------------------------------------
    // Test 4: Network Connection Failure
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Network Failure Handling ---');

    mockStorage.clear();
    mockStorage.set('beeyou_temporary_pairing_session', JSON.stringify({
      pairingCode: 'PAIR-NETFAIL',
      token: 'tok-valid-mock',
      status: 'awaiting_approval',
    }));

    // Turn on simulated network outage
    simulateNetworkError = true;
    const approveResult4 = await approvePairingSession('PAIR-NETFAIL');
    simulateNetworkError = false;

    assert(approveResult4.success === false, 'approvePairingSession returns success: false on network error');
    assert(approveResult4.message.toLowerCase().includes('network') || approveResult4.message.toLowerCase().includes('fetch'), 'Message indicates network error occurred');

    const stored4 = JSON.parse(mockStorage.get('beeyou_temporary_pairing_session') || '{}');
    assert(stored4.status !== 'paired', 'Local pairing session is NOT marked paired on network failure');
    assert(stored4.status === 'awaiting_approval', 'Local pairing session preserves awaiting_approval status');

  } finally {
    globalThis.fetch = nativeFetch;
    server.close();
  }

  console.log('\n======================================================');
  console.log(`Resilience Tests Complete: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during resilience test suite:', err);
  process.exit(1);
});
