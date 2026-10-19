/**
 * Comprehensive Automated Verification Suite for Priority 3: Family API Authorization
 * Tests:
 * 1. 401 Unauthorized on unauthenticated access
 * 2. 401 Unauthorized on tampered / invalid tokens
 * 3. 403 Forbidden on cross-family state or event access
 * 4. 403 Forbidden on demo reviewer token accessing real family
 * 5. 403 Forbidden on real family token accessing BEE-DEMO
 * 6. 200 OK on authentic family token accessing own family
 * 7. 200 OK on demo reviewer token accessing BEE-DEMO
 * 8. 400 Bad Request on missing / invalid pairing codes
 * 9. Demo Sandbox Isolation: mutations to BEE-DEMO never touch disk (.data/families/BEE-DEMO.json)
 * 10. Pairing claim and token exchange security
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('\n======================================================');
  console.log('🐝 BeeYou Priority 3: Family API Authorization Test Suite');
  console.log('======================================================\n');

  // Dynamic import so process.env.VERCEL='1' prevents automatic listen
  const serverModule = await import('../server');
  const app = serverModule.default;
  const { signFamilyToken } = serverModule;

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
    // 1. Unauthenticated checks (must return 401)
    console.log('--- Suite 1: Unauthenticated Requests (401 Unauthorized) ---');
    
    let res = await fetch(`${baseUrl}/api/family/state/TEST-FAM1`);
    assert(res.status === 401, 'GET /api/family/state/:code without token returns 401', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/poll/TEST-FAM1`);
    assert(res.status === 401, 'GET /api/caregiver/poll/:code without token returns 401', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode: 'TEST-FAM1', childName: 'Kid' }),
    });
    assert(res.status === 401, 'POST /api/caregiver/sync without token returns 401', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode: 'TEST-FAM1', label: 'Help' }),
    });
    assert(res.status === 401, 'POST /api/caregiver/alert without token returns 401', `got ${res.status}`);

    // 2. Tampered / invalid token checks (must return 401)
    console.log('\n--- Suite 2: Tampered & Invalid Tokens (401 Unauthorized) ---');

    res = await fetch(`${baseUrl}/api/family/state/TEST-FAM1`, {
      headers: { 'Authorization': 'Bearer by_tok.invalidpayload.invalidsig' },
    });
    assert(res.status === 401, 'GET with tampered by_tok returns 401', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/family/state/TEST-FAM1`, {
      headers: { 'Authorization': 'Bearer completely-bogus-token' },
    });
    assert(res.status === 401, 'GET with bogus token string returns 401', `got ${res.status}`);

    // 3. Cross-family authorization checks (must return 403)
    console.log('\n--- Suite 3: Cross-Family Membership Isolation (403 Forbidden) ---');

    const tokenFamA = signFamilyToken('FAM-ALPHA', 'caregiver', 'alpha@example.com');
    const tokenFamB = signFamilyToken('FAM-BETA', 'caregiver', 'beta@example.com');

    res = await fetch(`${baseUrl}/api/family/state/FAM-BETA`, {
      headers: { 'Authorization': `Bearer ${tokenFamA}` },
    });
    assert(res.status === 403, 'Family A token accessing Family B state returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFamA}`,
      },
      body: JSON.stringify({ pairingCode: 'FAM-BETA', childName: 'Imposter' }),
    });
    assert(res.status === 403, 'Family A token attempting sync mutation to Family B returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFamA}`,
      },
      body: JSON.stringify({ pairingCode: 'FAM-BETA', label: 'Cross Alert' }),
    });
    assert(res.status === 403, 'Family A token firing alert on Family B returns 403 Forbidden', `got ${res.status}`);

    // 4. Demo Token Boundary Isolation (must return 403 on real families)
    console.log('\n--- Suite 4: Demo Token Boundary Isolation ---');

    const demoReviewerToken = 'by_demo_reviewer_token_2026';

    res = await fetch(`${baseUrl}/api/family/state/FAM-ALPHA`, {
      headers: { 'Authorization': `Bearer ${demoReviewerToken}` },
    });
    assert(res.status === 403, 'Demo reviewer token accessing real family FAM-ALPHA returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/family/state/BEE-DEMO`, {
      headers: { 'Authorization': `Bearer ${tokenFamA}` },
    });
    assert(res.status === 403, 'Real family token accessing BEE-DEMO returns 403 Forbidden', `got ${res.status}`);

    // 5. Authorized Access (must return 200)
    console.log('\n--- Suite 5: Authorized Requests (200 OK) ---');

    res = await fetch(`${baseUrl}/api/family/state/FAM-ALPHA`, {
      headers: { 'Authorization': `Bearer ${tokenFamA}` },
    });
    assert(res.status === 200, 'Valid Family A token accessing Family A state returns 200 OK', `got ${res.status}`);
    const famAData = await res.json();
    assert(famAData?.success && famAData?.state?.familyCode === 'FAM-ALPHA', 'Family A state returned with matching code');

    res = await fetch(`${baseUrl}/api/family/state/BEE-DEMO`, {
      headers: { 'Authorization': `Bearer ${demoReviewerToken}` },
    });
    assert(res.status === 200, 'Demo reviewer token accessing BEE-DEMO returns 200 OK', `got ${res.status}`);
    const demoData = await res.json();
    assert(demoData?.success && demoData?.state?.familyCode === 'BEE-DEMO', 'BEE-DEMO state returned with matching code');

    // Query parameter token support (required for EventSource SSE)
    res = await fetch(`${baseUrl}/api/caregiver/poll/FAM-ALPHA?token=${encodeURIComponent(tokenFamA)}`);
    assert(res.status === 200, 'Query param ?token=... authenticated poll returns 200 OK', `got ${res.status}`);

    // 6. Bad Request on Missing Codes
    console.log('\n--- Suite 6: Missing Code Validation (400 Bad Request) ---');

    res = await fetch(`${baseUrl}/api/caregiver/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFamA}`,
      },
      body: JSON.stringify({ childName: 'No Pairing Code' }),
    });
    assert(res.status === 400, 'POST /api/caregiver/sync without pairingCode returns 400 Bad Request', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenFamA}`,
      },
      body: JSON.stringify({ label: 'No Pairing Code' }),
    });
    assert(res.status === 400, 'POST /api/caregiver/alert without pairingCode returns 400 Bad Request', `got ${res.status}`);

    // 7. Demo Sandbox Memory Isolation (Never writes BEE-DEMO.json to disk)
    console.log('\n--- Suite 7: Demo Sandbox Disk Isolation ---');

    // Mutate BEE-DEMO in sandbox
    res = await fetch(`${baseUrl}/api/family/state/BEE-DEMO`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${demoReviewerToken}`,
      },
      body: JSON.stringify({
        childState: { currentActivity: 'Sandbox Test Active', stars: 999 },
      }),
    });
    assert(res.status === 200, 'Mutating BEE-DEMO sandbox returns 200 OK', `got ${res.status}`);

    // Check disk: BEE-DEMO.json must NOT exist in .data/families/
    const familiesDir = path.resolve(process.cwd(), '.data', 'families');
    const demoDiskPath = path.join(familiesDir, 'BEE-DEMO.json');
    const diskFileExists = fs.existsSync(demoDiskPath);
    assert(!diskFileExists, 'BEE-DEMO.json does NOT exist on disk in .data/families/', `found file at ${demoDiskPath}`);

    // Check master file: shared_families.json must not have BEE-DEMO key
    const masterFile = path.resolve(process.cwd(), '.data', 'shared_families.json');
    if (fs.existsSync(masterFile)) {
      const masterContent = JSON.parse(fs.readFileSync(masterFile, 'utf-8'));
      assert(!masterContent['BEE-DEMO'], 'shared_families.json does NOT contain BEE-DEMO key');
    } else {
      assert(true, 'shared_families.json does not leak BEE-DEMO');
    }

    // 8. Token Exchange Endpoint (/api/family/auth/token)
    console.log('\n--- Suite 8: Token Exchange Endpoint Security ---');

    // Token exchange for BEE-DEMO without credentials returns 403 Forbidden
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'BEE-DEMO' }),
    });
    assert(res.status === 403, 'Exchange for BEE-DEMO without credentials returns 403 Forbidden', `got ${res.status}`);

    // Token exchange for BEE-DEMO with reviewer credentials returns 200 and reviewer token
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'BEE-DEMO', email: 'demo@beeyou.app' }),
    });
    const exchangeDemo = await res.json();
    assert(exchangeDemo?.token === 'by_demo_reviewer_token_2026', 'Exchange for BEE-DEMO with demo credentials returns reviewer token');

    // Token exchange with invalid PIN returns 401
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'FAM-ALPHA', pin: '9999' }),
    });
    assert(res.status === 401, 'Exchange with invalid PIN returns 401 Unauthorized', `got ${res.status}`);

    // Token exchange for missing family without email returns 404
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'FAM-NONEXISTENT' }),
    });
    // 9. Two-Way Expiring Pairing Handshake with Explicit Approval
    console.log('\n--- Suite 9: Expiring Pairing Codes & Explicit Approval Handshake ---');

    // Create pairing session
    res = await fetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatedBy: 'child_device',
        childName: 'Emma',
      }),
    });
    assert(res.status === 200, 'POST /api/caregiver/pairing/create returns 200 OK', `got ${res.status}`);
    const createdRes = await res.json();
    const createdSession = createdRes?.session;
    assert(createdSession?.pairingCode?.startsWith('BEE-'), `Pairing code starts with BEE- (${createdSession?.pairingCode})`);
    assert(createdSession?.pairingCode !== 'BEE-DEMO', 'Pairing code is not BEE-DEMO');
    const ttlMinutes = (createdSession?.expiresAt - Date.now()) / (60 * 1000);
    assert(ttlMinutes >= 14 && ttlMinutes <= 16, `Session TTL is 15 minutes (got ${ttlMinutes.toFixed(1)} min)`);
    assert(createdSession?.status === 'pending', `Initial session status is 'pending' (got ${createdSession?.status})`);

    const codeToPair = createdSession.pairingCode;

    // Disallow pairing claim on BEE-DEMO
    res = await fetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: 'BEE-DEMO',
        caregiverName: 'Mom',
      }),
    });
    assert(res.status === 400 || res.status === 403, 'Claiming BEE-DEMO returns 400/403', `got ${res.status}`);

    // Claim pairing session transitions to awaiting_approval
    res = await fetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: codeToPair,
        caregiverName: 'Mom',
        claimerRole: 'caregiver',
      }),
    });
    assert(res.status === 200, 'Claiming valid code returns 200 OK', `got ${res.status}`);
    const claimResult = await res.json();
    assert(claimResult?.status === 'awaiting_approval', `Claim transitions status to 'awaiting_approval' (got ${claimResult?.status})`);

    // Poll status returns awaiting_approval
    res = await fetch(`${baseUrl}/api/caregiver/pairing/status/${codeToPair}`);
    const polledRes = await res.json();
    const polledStatus = polledRes?.session;
    assert(polledStatus?.status === 'awaiting_approval', `Poll reflects 'awaiting_approval'`);
    assert(polledStatus?.requestingDeviceName === 'Mom', `Poll reflects requestingDeviceName: Mom`);

    // Explicit approval from host device
    res = await fetch(`${baseUrl}/api/caregiver/pairing/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode: codeToPair }),
    });
    assert(res.status === 200, 'POST /api/caregiver/pairing/approve returns 200 OK', `got ${res.status}`);
    const approveResult = await res.json();
    assert(approveResult?.session?.status === 'paired', `Approve transitions session to 'paired'`);

    // Rejection flow verification
    const resRejectCreate = await fetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initiatedBy: 'child_device', childName: 'Leo' }),
    });
    const rejectCreateRes = await resRejectCreate.json();
    const sessionToReject = rejectCreateRes?.session;
    await fetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode: sessionToReject.pairingCode, caregiverName: 'Coach' }),
    });
    const resReject = await fetch(`${baseUrl}/api/caregiver/pairing/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode: sessionToReject.pairingCode }),
    });
    assert(resReject.status === 200, 'POST /api/caregiver/pairing/reject returns 200 OK', `got ${resReject.status}`);
    const rejectData = await resReject.json();
    assert(rejectData?.session?.status === 'rejected', `Reject transitions session to 'rejected'`);

  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
