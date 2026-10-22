/**
 * Comprehensive Automated Verification Suite for Family Authentication,
 * Authorization, Cross-Device Identity, and Firebase Rules.
 *
 * Verifies:
 * 1. Forged and invalid token rejection (RS256 fake sig, HMAC forgery, expired)
 * 2. Email-only login rejection (Finding 2)
 * 3. Second-device login & authoritative family retrieval (Finding 6 & cross-device identity)
 * 4. Cross-family isolation and denial (403 Forbidden)
 * 5. Unauthorized membership change denial (non-owner approval/revocation blocked)
 * 6. Revoked access across both API access and direct database rules
 * 7. Temporary pairing invitation separation (PAIR- vs BEE-)
 * 8. Direct Firebase Realtime Database rules logic
 * 9. Direct Firebase Storage rules logic
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';
process.env.FAMILY_AUTH_SECRET = 'test-secret-salt-32-chars-long-minimum-entropy';

import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('\n======================================================');
  console.log('Lumina Family Authentication & Rules Verification Suite');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const app = serverModule.default;
  const { signFamilyToken, familyAccounts, findFamilyAccount } = serverModule;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Ephemeral server active on port ${port}\n`);

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
    // ---------------------------------------------------------
    // TEST 1: Forged and Invalid Token Rejection
    // ---------------------------------------------------------
    console.log('--- Suite 1: Forged and Invalid Token Rejection ---');

    // 1.1 Bogus token
    let res = await fetch(`${baseUrl}/api/family/state/BEE-TEST1`, {
      headers: { 'Authorization': 'Bearer totally-bogus-token' },
    });
    assert(res.status === 401, 'Bogus token returns 401 Unauthorized', `got ${res.status}`);

    // 1.2 Forged by_tok signature
    const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify({ familyCode: 'BEE-TEST1', role: 'caregiver', email: 'user@test.com' })).toString('base64url');
    const forgedSig = crypto.createHmac('sha256', 'wrong-attacker-secret').update(payloadB64).digest('base64url');
    const forgedToken = `by_tok.${payloadB64}.${forgedSig}`;

    res = await fetch(`${baseUrl}/api/family/state/BEE-TEST1`, {
      headers: { 'Authorization': `Bearer ${forgedToken}` },
    });
    assert(res.status === 401, 'Forged HMAC signature returns 401 Unauthorized', `got ${res.status}`);

    // 1.3 Forged RS256 token (simulating attacker Firebase ID token signed with unknown private key)
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const rsaHeaderB64 = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'fake-attacker-kid' })).toString('base64url');
    const rsaPayloadB64 = Buffer.from(JSON.stringify({
      iss: 'https://securetoken.google.com/beeyou-23d7d',
      aud: 'beeyou-23d7d',
      sub: 'attacker-uid-1234',
      email: 'attacker@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      auth_time: Math.floor(Date.now() / 1000),
    })).toString('base64url');
    const rsaSigner = crypto.createSign('RSA-SHA256');
    rsaSigner.update(`${rsaHeaderB64}.${rsaPayloadB64}`);
    const rsaSigB64 = rsaSigner.sign(privateKey, 'base64url');
    const forgedRsaToken = `${rsaHeaderB64}.${rsaPayloadB64}.${rsaSigB64}`;

    res = await fetch(`${baseUrl}/api/caregiver/family/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${forgedRsaToken}`,
      },
      body: JSON.stringify({ email: 'attacker@example.com' }),
    });
    assert(res.status === 401, 'Forged RS256 Firebase ID token rejected with 401', `got ${res.status}`);

    // ---------------------------------------------------------
    // TEST 2: Email-Only Login Rejection (Finding 2)
    // ---------------------------------------------------------
    console.log('\n--- Suite 2: Email-Only Login Rejection (Finding 2) ---');

    res = await fetch(`${baseUrl}/api/caregiver/family/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'victim@family.com' }),
    });
    assert(res.status === 401, 'POST /api/caregiver/family/login without Bearer token returns 401', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/caregiver/family/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'victim@family.com' }),
    });
    assert(res.status === 401, 'POST /api/caregiver/family/register without Bearer token returns 401', `got ${res.status}`);

    // ---------------------------------------------------------
    // TEST 3: Authoritative Family Account & Second-Device Login
    // ---------------------------------------------------------
    console.log('\n--- Suite 3: Second-Device Login & Authoritative Family Retrieval ---');

    const testFamilyCode = 'BEE-SECURE1';
    const testOwnerEmail = 'owner@securefamily.com';
    const testOwnerUid = 'uid-owner-secure-1';

    // Pre-seed an authoritative account with specific child profile and permanent familyCode
    const existingFamily = {
      id: 'fam-test-1',
      email: testOwnerEmail,
      familyCode: testFamilyCode,
      ownerUid: testOwnerUid,
      members: {
        [testOwnerUid]: { role: 'caregiver', email: testOwnerEmail, approvedAt: Date.now() },
      },
      caregiverName: 'Sarah Jenkins',
      caregiverRole: 'Mother',
      childProfile: {
        name: 'Tommy',
        ageGroup: 'kid',
        pin: '5678',
        interests: ['Dino Kingdom', 'Visual Schedules'],
        pronouns: 'he/him',
      },
      subscriptionTier: 'premium' as const,
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
    familyAccounts.set(testOwnerEmail, existingFamily);

    // Device 1: Authenticates as owner
    const ownerToken = signFamilyToken(testFamilyCode, 'caregiver', testOwnerEmail, testOwnerUid);

    // Device 2: Signs in with the same verified credentials
    res = await fetch(`${baseUrl}/api/caregiver/family/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ email: testOwnerEmail }),
    });
    assert(res.status === 200, 'Device 2 login returns 200 OK', `got ${res.status}`);
    const loginData = await res.json();
    assert(loginData.account.familyCode === testFamilyCode, 'Device 2 retrieves identical familyCode', `got ${loginData.account?.familyCode}`);
    assert(loginData.account.childProfile.name === 'Tommy', 'Device 2 retrieves existing child profile name (Tommy)', `got ${loginData.account?.childProfile?.name}`);
    assert(loginData.account.childProfile.interests.includes('Dino Kingdom'), 'Device 2 preserves child interests', `got ${loginData.account?.childProfile?.interests}`);
    assert(loginData.account.childProfile.pin === undefined, 'Child profile PIN is sanitized from API response', `got ${loginData.account?.childProfile?.pin}`);

    // ---------------------------------------------------------
    // TEST 4: Cross-Family Membership Isolation (403 Forbidden)
    // ---------------------------------------------------------
    console.log('\n--- Suite 4: Cross-Family Membership Isolation (403 Forbidden) ---');

    const tokenAlpha = signFamilyToken('BEE-ALPHA', 'caregiver', 'alpha@example.com', 'uid-alpha');
    const tokenBeta = signFamilyToken('BEE-BETA', 'caregiver', 'beta@example.com', 'uid-beta');

    // Alpha token trying to read Beta state
    res = await fetch(`${baseUrl}/api/family/state/BEE-BETA`, {
      headers: { 'Authorization': `Bearer ${tokenAlpha}` },
    });
    assert(res.status === 403, 'Alpha token accessing Beta state returns 403 Forbidden', `got ${res.status}`);

    // Alpha token trying to post alert to Beta
    res = await fetch(`${baseUrl}/api/family/alert/BEE-BETA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenAlpha}`,
      },
      body: JSON.stringify({ label: 'Unauthorized Alert' }),
    });
    assert(res.status === 403, 'Alpha token triggering alert on Beta returns 403 Forbidden', `got ${res.status}`);

    // Alpha token accessing own family succeeds
    res = await fetch(`${baseUrl}/api/family/state/BEE-ALPHA`, {
      headers: { 'Authorization': `Bearer ${tokenAlpha}` },
    });
    assert(res.status === 200, 'Alpha token accessing own family returns 200 OK', `got ${res.status}`);

    // ---------------------------------------------------------
    // TEST 5: Unauthorized Membership Changes
    // ---------------------------------------------------------
    console.log('\n--- Suite 5: Unauthorized Membership Changes ---');

    // Add a non-owner member to test family
    const memberUid = 'uid-member-normal';
    const memberEmail = 'helper@securefamily.com';
    (existingFamily.members as any)[memberUid] = { role: 'caregiver', email: memberEmail, approvedAt: Date.now() };

    const memberToken = signFamilyToken(testFamilyCode, 'caregiver', memberEmail, memberUid);

    // Non-owner member tries to approve a member
    res = await fetch(`${baseUrl}/api/family/member/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ targetUid: 'uid-intruder' }),
    });
    assert(res.status === 403, 'Non-owner member cannot approve members (403 Forbidden)', `got ${res.status}`);

    // Non-owner member tries to revoke a member
    res = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ targetUid: testOwnerUid }),
    });
    assert(res.status === 403, 'Non-owner member cannot revoke members (403 Forbidden)', `got ${res.status}`);

    // Owner cannot revoke self
    res = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: testOwnerUid }),
    });
    assert(res.status === 400, 'Owner cannot revoke themselves (400 Bad Request)', `got ${res.status}`);

    // ---------------------------------------------------------
    // TEST 6: Revoked Access Across API and Database Rules
    // ---------------------------------------------------------
    console.log('\n--- Suite 6: Revoked Access Enforcement ---');

    // Member can access state prior to revocation
    res = await fetch(`${baseUrl}/api/family/state/${testFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${memberToken}` },
    });
    assert(res.status === 200, 'Active member can access family state prior to revocation', `got ${res.status}`);

    // Owner revokes the member
    res = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: memberUid, reason: 'Caregiver departed' }),
    });
    assert(res.status === 200, 'Owner revokes member successfully (200 OK)', `got ${res.status}`);

    // Member token is immediately denied access
    res = await fetch(`${baseUrl}/api/family/state/${testFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${memberToken}` },
    });
    assert(res.status === 401 || res.status === 403, 'Revoked member token immediately denied access (401/403)', `got ${res.status}`);

    // Revoked member attempting to login is denied
    res = await fetch(`${baseUrl}/api/caregiver/family/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ email: memberEmail }),
    });
    assert(res.status === 403 || res.status === 401, 'Revoked member login rejected with 403 Forbidden', `got ${res.status}`);

    // ---------------------------------------------------------
    // TEST 7: Temporary Pairing Invitations (PAIR-) vs Permanent Family IDs (BEE-)
    // ---------------------------------------------------------
    console.log('\n--- Suite 7: Temporary Pairing vs Permanent Family IDs ---');

    res = await fetch(`${baseUrl}/api/caregiver/pairing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        initiatedBy: 'caregiver',
        caregiverName: 'Sarah Jenkins',
        targetFamilyCode: testFamilyCode,
      }),
    });
    assert(res.status === 200, 'Pairing creation returns 200 OK', `got ${res.status}`);
    const pairingData = await res.json();
    const pairingCode = pairingData.session.pairingCode;
    assert(pairingCode.startsWith('PAIR-'), 'Temporary pairing code starts with PAIR- prefix', `got ${pairingCode}`);
    assert(pairingData.session.targetFamilyCode === testFamilyCode, 'Pairing session records target permanent family code', `got ${pairingData.session.targetFamilyCode}`);
    assert(pairingData.session.expiresAt > Date.now(), 'Pairing session has active TTL', `expires in ${Math.round((pairingData.session.expiresAt - Date.now()) / 1000)}s`);

    // Companion device claims pairing
    res = await fetch(`${baseUrl}/api/caregiver/pairing/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode,
        claimerRole: 'child_device',
        childName: 'Tommy',
      }),
    });
    assert(res.status === 200, 'Companion claims pairing code (awaiting approval)', `got ${res.status}`);

    // Owner approves pairing
    res = await fetch(`${baseUrl}/api/caregiver/pairing/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ pairingCode }),
    });
    assert(res.status === 200, 'Owner approves pairing session', `got ${res.status}`);
    const approvedData = await res.json();
    assert(approvedData.familyCode === testFamilyCode, 'Approved session maps device to permanent family ID (BEE-SECURE1)', `got ${approvedData.familyCode}`);
    assert(approvedData.token && !approvedData.token.includes('PAIR-'), 'Issued auth token is bound to permanent family, not temporary PAIR- code');

    // ---------------------------------------------------------
    // TEST 8: Firebase Realtime Database Rules Logical Validation
    // ---------------------------------------------------------
    console.log('\n--- Suite 8: Firebase Realtime Database Rules Logical Validation ---');

    const rtdbRulesRaw = fs.readFileSync(path.join(process.cwd(), 'database.rules.json'), 'utf-8');
    const rtdbRules = JSON.parse(rtdbRulesRaw);

    // Check Finding 4: users/$uid/familyCode is completely absent from families/sessions/events rules
    const familiesRuleRead = rtdbRules.rules.beeyou.families['$familyCode']['.read'];
    const familiesRuleWrite = rtdbRules.rules.beeyou.families['$familyCode']['.write'];
    const membersRuleWrite = rtdbRules.rules.beeyou.families['$familyCode'].members['.write'];

    assert(!familiesRuleRead.includes('users/'), 'families read rule does NOT trust user-editable users/$uid/familyCode');
    assert(!familiesRuleWrite.includes('users/'), 'families write rule does NOT trust user-editable users/$uid/familyCode');
    assert(familiesRuleRead.includes("members/' + auth.uid") && familiesRuleRead.includes("ownerUid"), 'families read rule requires authoritative membership or ownerUid');
    assert(membersRuleWrite.includes("ownerUid"), 'members write rule strictly requires family ownerUid');

    const sessionsRuleRead = rtdbRules.rules.beeyou.sessions['$familyCode']['.read'];
    const eventsRuleRead = rtdbRules.rules.beeyou.events['$familyCode']['.read'];
    assert(!sessionsRuleRead.includes('users/'), 'sessions read rule does NOT trust user-editable users/$uid/familyCode');
    assert(!eventsRuleRead.includes('users/'), 'events read rule does NOT trust user-editable users/$uid/familyCode');

    // ---------------------------------------------------------
    // TEST 9: Firebase Storage Rules Logical Validation
    // ---------------------------------------------------------
    console.log('\n--- Suite 9: Firebase Storage Rules Logical Validation ---');

    const storageRulesRaw = fs.readFileSync(path.join(process.cwd(), 'storage.rules'), 'utf-8');

    // Check Finding 5: format regex alone is NOT accepted for access
    assert(!storageRulesRaw.includes("familyCode.matches('^BEE-"), 'storage.rules does NOT accept familyCode format regex alone for access');
    assert(storageRulesRaw.includes('request.auth != null'), 'storage.rules enforces authenticated user check');
    assert(storageRulesRaw.includes('request.auth.token.familyCode == familyCode') || storageRulesRaw.includes('resource.metadata.familyCode == familyCode'), 'storage.rules verifies token or resource metadata familyCode');

    // Close ephemeral server
    await new Promise<void>((resolve) => server.close(() => resolve()));

    console.log('\n======================================================');
    console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[Verification Suite Execution Error]:', err);
    try { server.close(); } catch {}
    process.exit(1);
  }
}

runVerification();
