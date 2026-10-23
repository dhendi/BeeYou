/**
 * Automated Security Audit Suite: Family Authentication & Authorization Hardening
 *
 * Verifies:
 * 1. Unauthorized family creation denial (unauthenticated requests cannot spawn families or state files)
 * 2. Predictable PIN / caregiver token harvest denial (cannot exchange code/email/PIN for caregiver tokens)
 * 3. Removal of hardcoded 1234 PIN (new families have no default PIN; existing user PINs preserved)
 * 4. Server-side role enforcement (child token cannot spoof caregiver messages or approve pairings)
 * 5. Pairing approval authorization (unauthenticated and child devices cannot approve pairing)
 * 6. Cross-family token exchange & data isolation denial (403 Forbidden)
 * 7. Legitimate Firebase user registration & caregiver token issuance
 * 8. BEE-DEMO sandbox isolation
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';
process.env.FAMILY_AUTH_SECRET = 'audit-secret-salt-32-chars-long-minimum-entropy';

import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

async function runSecurityAudit() {
  console.log('\n======================================================');
  console.log('BeeYou Family Authentication Security Audit Suite');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const app = serverModule.default;
  const { signFamilyToken, familyAccounts, getOrCreateFamilyState, pairingSessions } = serverModule;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Audit Server] Active on port ${port}\n`);

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
    // -----------------------------------------------------------------
    // Suite 1: Unauthorized Family Creation & State Spawning Denial
    // -----------------------------------------------------------------
    console.log('--- Suite 1: Unauthorized Family Creation Denial ---');

    // 1.1 Unauthenticated POST to /api/family/auth/token cannot create family state
    const fakeCode1 = 'BEE-SPOOF1';
    let res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyCode: fakeCode1,
        email: 'attacker@evil.corp',
      }),
    });
    assert(res.status === 401, 'Unauthenticated /api/family/auth/token returns 401 Unauthorized', `got ${res.status}`);

    // Verify no state was created in memory or on disk
    assert(getOrCreateFamilyState(fakeCode1) === null, 'Spoofed family is NOT spawned by getOrCreateFamilyState');
    const diskPath1 = path.join(process.cwd(), '.data', 'families', `${fakeCode1}.json`);
    assert(!fs.existsSync(diskPath1), 'Spoofed family file does NOT exist on disk');

    // 1.2 Unauthenticated POST to /api/caregiver/family/register is rejected
    res = await fetch(`${baseUrl}/api/caregiver/family/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unauth-reg@example.com',
        caregiverName: 'Attacker',
      }),
    });
    assert(res.status === 401, 'POST /api/caregiver/family/register without Bearer token returns 401', `got ${res.status}`);

    // -----------------------------------------------------------------
    // Suite 2: Default PIN & Token Harvest Denial
    // -----------------------------------------------------------------
    console.log('\n--- Suite 2: Token Harvest & Default PIN Denial ---');

    // Setup an authentic family on the server by registering it legitimately
    const victimFamilyCode = 'BEE-VICTIM1';
    const victimEmail = 'victim@family.com';
    const victimRegBearerToken = signFamilyToken(victimFamilyCode, 'caregiver', victimEmail);

    res = await fetch(`${baseUrl}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${victimRegBearerToken}`,
      },
      body: JSON.stringify({
        email: victimEmail,
        caregiverName: 'Mom',
        childName: 'Lucas',
      }),
    });
    assert(res.status === 200, 'Legitimate family registration returns 200 OK', `got ${res.status}`);
    const victimRegData = await res.json();
    const victimToken = victimRegData.token;
    const effectiveVictimCode = victimRegData.account?.familyCode || victimFamilyCode;

    // Seed victim state
    res = await fetch(`${baseUrl}/api/family/state/${effectiveVictimCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${victimToken}`,
      },
      body: JSON.stringify({
        childProfile: { name: 'Lucas' },
      }),
    });
    assert(res.status === 200, 'Seed legitimate family state returns 200 OK', `got ${res.status}`);

    // Attacker tries guessing family code + default PIN 1234 without credentials
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyCode: effectiveVictimCode,
        pin: '1234',
      }),
    });
    assert(res.status === 401, 'Harvesting caregiver token via PIN 1234 returns 401 Unauthorized', `got ${res.status}`);

    // Attacker tries omitting PIN
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyCode: effectiveVictimCode,
      }),
    });
    assert(res.status === 401, 'Harvesting caregiver token without Bearer token returns 401 Unauthorized', `got ${res.status}`);

    // -----------------------------------------------------------------
    // Suite 3: Hardcoded PIN Removal & Existing PIN Preservation
    // -----------------------------------------------------------------
    console.log('\n--- Suite 3: PIN Security & Sanitization ---');

    // Register a family without specifying a PIN
    const noPinEmail = `nopin_${Date.now()}@test.org`;
    const regToken = signFamilyToken('BEE-NOPIN1', 'caregiver', noPinEmail);
    res = await fetch(`${baseUrl}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${regToken}`,
      },
      body: JSON.stringify({
        email: noPinEmail,
        caregiverName: 'Parent',
        childName: 'ChildWithoutPin',
      }),
    });
    assert(res.status === 200, 'Register family without PIN returns 200 OK', `got ${res.status}`);
    const noPinAccount = familyAccounts.get(noPinEmail);
    assert(noPinAccount?.childProfile?.pin === undefined, 'New family childProfile.pin is undefined (never defaults to 1234)');

    // Existing family with a custom PIN is preserved without silent reset
    const customPinEmail = `custompin_${Date.now()}@test.org`;
    const customPinToken = signFamilyToken('BEE-CUSTOM1', 'caregiver', customPinEmail);
    res = await fetch(`${baseUrl}/api/caregiver/family/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customPinToken}`,
      },
      body: JSON.stringify({
        email: customPinEmail,
        caregiverName: 'Parent',
        childName: 'ChildWithCustomPin',
        pin: '8392',
      }),
    });
    assert(res.status === 200, 'Register family with custom PIN returns 200 OK', `got ${res.status}`);
    const customPinAccount = familyAccounts.get(customPinEmail);
    assert(customPinAccount?.childProfile?.pin === '8392', 'Custom PIN 8392 is stored and preserved');

    // -----------------------------------------------------------------
    // Suite 4: Server-Side Role Enforcement & Message Spoofing Denial
    // -----------------------------------------------------------------
    console.log('\n--- Suite 4: Server-Side Role Enforcement ---');

    const childToken = signFamilyToken(effectiveVictimCode, 'child', 'child@victim.com');

    // Child device sends message claiming to be caregiver
    res = await fetch(`${baseUrl}/api/family/message/${effectiveVictimCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${childToken}`,
      },
      body: JSON.stringify({
        text: 'Time for bed!',
        senderRole: 'caregiver',
        senderName: 'Caregiver',
      }),
    });
    assert(res.status === 200, 'POST message returns 200 OK', `got ${res.status}`);
    const msgData = await res.json();
    assert(msgData.message?.senderRole === 'child', 'Child token cannot spoof caregiver role; server strictly enforces role: child');

    // Caregiver sending message can have caregiver role
    res = await fetch(`${baseUrl}/api/family/message/${effectiveVictimCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${victimToken}`,
      },
      body: JSON.stringify({
        text: 'Dinner is ready!',
        senderRole: 'caregiver',
      }),
    });
    assert(res.status === 200, 'Caregiver message returns 200 OK', `got ${res.status}`);
    const caregiverMsgData = await res.json();
    assert(caregiverMsgData.message?.senderRole === 'caregiver', 'Caregiver token verified role: caregiver');

    // -----------------------------------------------------------------
    // Suite 5: Pairing Approval Security
    // -----------------------------------------------------------------
    console.log('\n--- Suite 5: Pairing Approval Security ---');

    // Child creates pairing session
    res = await fetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiatedBy: 'child_device',
        childName: 'Sammy',
        targetFamilyCode: effectiveVictimCode,
      }),
    });
    assert(res.status === 200, 'Create pairing session returns 200 OK', `got ${res.status}`);
    const pairCreateData = await res.json();
    const pairingSession = pairCreateData.session;
    const pairingCode = pairingSession.pairingCode;

    // Claim pairing session
    res = await fetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode,
        caregiverName: 'Dad',
        claimerRole: 'caregiver',
      }),
    });
    assert(res.status === 200, 'Claim pairing returns 200 OK', `got ${res.status}`);

    // Unauthenticated caller attempts to approve pairing without session token
    res = await fetch(`${baseUrl}/api/caregiver/pairing/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingCode }),
    });
    assert(res.status === 401, 'Unauthenticated pairing approval returns 401 Unauthorized', `got ${res.status}`);

    // Child token attempts to approve pairing
    res = await fetch(`${baseUrl}/api/caregiver/pairing/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${childToken}`,
      },
      body: JSON.stringify({ pairingCode }),
    });
    assert(res.status === 403, 'Child device token attempting to approve pairing returns 403 Forbidden', `got ${res.status}`);

    // Caregiver of victim family approves pairing
    res = await fetch(`${baseUrl}/api/caregiver/pairing/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${victimToken}`,
      },
      body: JSON.stringify({ pairingCode }),
    });
    assert(res.status === 200, 'Authorized caregiver approves pairing returns 200 OK', `got ${res.status}`);
    const approvedData = await res.json();
    assert(approvedData.status === 'paired', 'Pairing session is successfully paired');

    // -----------------------------------------------------------------
    // Suite 6: Cross-Family Access & Token Exchange Denial
    // -----------------------------------------------------------------
    console.log('\n--- Suite 6: Cross-Family Access & Exchange Denial ---');

    const otherFamilyCode = 'BEE-OTHER1';
    const otherToken = signFamilyToken(otherFamilyCode, 'caregiver', 'other@family.com');

    // Other family token attempts to exchange for victim family token
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ familyCode: effectiveVictimCode }),
    });
    assert(res.status === 403, 'Cross-family /api/family/auth/token exchange returns 403 Forbidden', `got ${res.status}`);

    // Other family token attempts to read victim family state
    res = await fetch(`${baseUrl}/api/family/state/${effectiveVictimCode}`, {
      headers: { 'Authorization': `Bearer ${otherToken}` },
    });
    assert(res.status === 403, 'Cross-family GET /api/family/state returns 403 Forbidden', `got ${res.status}`);

    // Other family token attempts to trigger alert on victim family
    res = await fetch(`${baseUrl}/api/family/alert/${effectiveVictimCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherToken}`,
      },
      body: JSON.stringify({
        alertType: 'help',
        note: 'Malicious intrusion test',
      }),
    });
    assert(res.status === 403, 'Cross-family POST /api/family/alert returns 403 Forbidden', `got ${res.status}`);

    // -----------------------------------------------------------------
    // Suite 7: BEE-DEMO Sandbox Boundary & Disk Isolation
    // -----------------------------------------------------------------
    console.log('\n--- Suite 7: BEE-DEMO Sandbox Boundary & Isolation ---');

    // Demo token exchange without demo credentials returns 403
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'BEE-DEMO' }),
    });
    assert(res.status === 403, 'Demo exchange without credentials returns 403 Forbidden', `got ${res.status}`);

    // Demo token exchange with demo credentials succeeds
    res = await fetch(`${baseUrl}/api/family/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyCode: 'BEE-DEMO', email: 'demo@beeyou.app' }),
    });
    assert(res.status === 200, 'Demo exchange with reviewer credentials returns 200 OK', `got ${res.status}`);
    const demoData = await res.json();
    const demoToken = demoData.token;
    assert(demoToken === 'by_demo_reviewer_token_2026', 'Demo exchange returns by_demo_reviewer_token_2026');

    // Demo token accessing real family returns 403
    res = await fetch(`${baseUrl}/api/family/state/${effectiveVictimCode}`, {
      headers: { 'Authorization': `Bearer ${demoToken}` },
    });
    assert(res.status === 403, 'Demo token accessing real family returns 403 Forbidden', `got ${res.status}`);

    // Real family token accessing BEE-DEMO returns 403
    res = await fetch(`${baseUrl}/api/family/state/BEE-DEMO`, {
      headers: { 'Authorization': `Bearer ${victimToken}` },
    });
    assert(res.status === 403, 'Real family token accessing BEE-DEMO returns 403 Forbidden', `got ${res.status}`);

    // BEE-DEMO state mutations never written to disk
    res = await fetch(`${baseUrl}/api/family/state/BEE-DEMO`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        childName: 'DemoSandboxChild',
      }),
    });
    assert(res.status === 200, 'Mutate BEE-DEMO returns 200 OK', `got ${res.status}`);
    const demoDiskPath = path.join(process.cwd(), '.data', 'families', 'BEE-DEMO.json');
    assert(!fs.existsSync(demoDiskPath), 'BEE-DEMO is strictly memory-only; does NOT exist on disk');

  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`Security Audit Complete: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error('Fatal error during security audit:', err);
  process.exit(1);
});
