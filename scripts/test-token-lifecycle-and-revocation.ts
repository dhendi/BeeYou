/**
 * BeeYou Token Lifecycle, Expiration, and Revocation Verification Suite
 *
 * Requirements verified:
 * 1. Secure token expiration: role-based expiration, legacy rejection, TTL limits, future-date rejection.
 * 2. Reliable persistent revocation: token, user, and family level revocation surviving server restart.
 * 3. Pairing token security: status enforcement (only 'paired' allowed), pairing expiration enforcement.
 * 4. Authoritative server-side role verification: client claims cannot override server records.
 * 5. Logout and unlinking revocation: immediate persistent invalidation.
 * 6. Client cache validation: automatic purging of expired credentials and safe renewal.
 * 7. Isolated demo sandbox integrity.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  console.log('\n==================================================================');
  console.log('BeeYou Security Fix #4: Token Expiration and Revocation Suite');
  console.log('==================================================================\n');

  // Dynamic import of server module
  const serverModule = await import('../server');
  const app = serverModule.default;
  const {
    signFamilyToken,
    verifyFamilyToken,
    TOKEN_EXPIRATION_POLICIES,
    MAX_TOKEN_TTL_MS,
    revokeToken,
    revokeUserTokens,
    revokeFamilyTokens,
    isTokenRevoked,
    clearAllRevocationsForTesting,
    initTokenRevocationStore,
    familyAccounts,
    pairingSessions,
    saveFamilyAccounts,
    savePairingSessions,
  } = serverModule;

  const authService = await import('../src/services/authService');
  const { isClientTokenValid, getSyncClientAuthToken, saveClientAuthToken, clearClientAuthToken } = authService;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Ephemeral server active on port ${port}\n`);

  try {
    clearAllRevocationsForTesting();

    // ==================================================================
    // Group 1: Token Signing & Expiration Policies
    // ==================================================================
    console.log('--- Group 1: Token Signing & Expiration Policies ---');

    const now = Date.now();
    const parsePayload = (tok: string) => {
      const parts = tok.split('.');
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    };

    // 1.1 Caregiver token expiration default (24h)
    const caregiverTok = signFamilyToken('FAM-TEST1', 'caregiver', 'parent@test.com', 'uid-parent-1');
    const cgPayload = parsePayload(caregiverTok);
    assert(
      Math.abs((cgPayload.exp - cgPayload.iat) - 24 * 60 * 60 * 1000) < 2000,
      'Caregiver token defaults to 24-hour expiration'
    );
    assert(typeof cgPayload.jti === 'string' && cgPayload.jti.startsWith('jti_'), 'Caregiver token contains secure random JTI');

    // 1.2 Admin token default (1h) and max capped at 2h
    const adminTok = signFamilyToken('FAM-TEST1', 'admin', 'admin@test.com', 'uid-admin-1');
    const adminPayload = parsePayload(adminTok);
    assert(
      Math.abs((adminPayload.exp - adminPayload.iat) - 1 * 60 * 60 * 1000) < 2000,
      'Admin token defaults to 1-hour expiration'
    );

    const adminLongTok = signFamilyToken('FAM-TEST1', 'admin', 'admin@test.com', 'uid-admin-1', 10 * 60 * 60 * 1000);
    const adminLongPayload = parsePayload(adminLongTok);
    assert(
      adminLongPayload.exp - adminLongPayload.iat <= 2 * 60 * 60 * 1000,
      'Admin token is strictly capped at maximum 2 hours'
    );

    // 1.3 Child token default (30d)
    const childTok = signFamilyToken('FAM-TEST1', 'child', 'child@test.com', 'uid-child-1');
    const childPayload = parsePayload(childTok);
    assert(
      Math.abs((childPayload.exp - childPayload.iat) - 30 * 24 * 60 * 60 * 1000) < 2000,
      'Child token defaults to 30-day expiration'
    );

    // 1.4 Demo token default (24h)
    const demoTok = signFamilyToken('BEE-DEMO', 'caregiver', 'demo@beeyou.app', 'uid-demo-1');
    const demoPayload = parsePayload(demoTok);
    assert(
      Math.abs((demoPayload.exp - demoPayload.iat) - 24 * 60 * 60 * 1000) < 2000,
      'Demo token defaults to 24-hour expiration'
    );

    // ==================================================================
    // Group 2: Token Verification & Security Rejection
    // ==================================================================
    console.log('\n--- Group 2: Token Verification & Security Rejection ---');

    // 2.1 Valid token succeeds
    const verifiedValid = await verifyFamilyToken(caregiverTok);
    assert(verifiedValid !== null && verifiedValid.familyCode === 'FAM-TEST1', 'Valid caregiver token successfully verified');

    // 2.2 Expired token is rejected
    const expiredTok = signFamilyToken('FAM-TEST1', 'caregiver', 'parent@test.com', 'uid-parent-1', 1000);
    // Simulate expired token by crafting a token with past exp
    const secret = process.env.SERVER_AUTH_SECRET || 'beeyou_dev_secret_key_change_in_production_2026';
    const craftToken = (payload: any) => {
      const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
      return `by_tok.${b64}.${sig}`;
    };

    const pastExpiredTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'caregiver',
      email: 'parent@test.com',
      uid: 'uid-parent-1',
      iat: Date.now() - 7200000,
      exp: Date.now() - 3600000, // Expired 1 hour ago
      jti: 'jti_past_exp',
    });
    const verifiedExpired = await verifyFamilyToken(pastExpiredTok);
    assert(verifiedExpired === null, 'Expired token is rejected by verifyFamilyToken()');

    // 2.3 Legacy token without exp is rejected
    const legacyNoExpTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'caregiver',
      email: 'parent@test.com',
      uid: 'uid-parent-1',
      iat: Date.now(), // Legacy token had iat but no exp
    });
    const verifiedLegacy = await verifyFamilyToken(legacyNoExpTok);
    assert(verifiedLegacy === null, 'Legacy token without expiration (exp) is rejected');

    // 2.4 Token missing iat is rejected
    const noIatTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'caregiver',
      email: 'parent@test.com',
      uid: 'uid-parent-1',
      exp: Date.now() + 3600000,
    });
    const verifiedNoIat = await verifyFamilyToken(noIatTok);
    assert(verifiedNoIat === null, 'Token missing issue timestamp (iat) is rejected');

    // 2.5 Token with future-dated iat is rejected
    const futureIatTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'caregiver',
      email: 'parent@test.com',
      uid: 'uid-parent-1',
      iat: Date.now() + 120000, // 2 minutes in future
      exp: Date.now() + 3600000,
      jti: 'jti_future',
    });
    const verifiedFuture = await verifyFamilyToken(futureIatTok);
    assert(verifiedFuture === null, 'Token with future-dated iat (> 60s) is rejected');

    // 2.6 Excessively long-lived token (> 31 days) is rejected
    const excessiveTtlTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'caregiver',
      email: 'parent@test.com',
      uid: 'uid-parent-1',
      iat: Date.now(),
      exp: Date.now() + (32 * 24 * 60 * 60 * 1000), // 32 days
      jti: 'jti_excessive',
    });
    const verifiedExcessive = await verifyFamilyToken(excessiveTtlTok);
    assert(verifiedExcessive === null, 'Excessively long-lived token (> 31 days) is rejected');

    // 2.7 Forged / tampered signature is rejected
    const forgedTok = `${caregiverTok}tampered`;
    const verifiedForged = await verifyFamilyToken(forgedTok);
    assert(verifiedForged === null, 'Forged signature token is rejected');

    // 2.8 Tampered payload with valid-length signature is rejected
    const tamperedPayloadTok = craftToken({
      familyCode: 'FAM-TEST1',
      role: 'admin', // escalated role without proper server secret
      email: 'hacker@test.com',
      uid: 'uid-hacker',
      iat: Date.now(),
      exp: Date.now() + 3600000,
      jti: 'jti_hacker',
    });
    // Replace signature with dummy signature of same length
    const tamperedParts = tamperedPayloadTok.split('.');
    const fakeSig = crypto.randomBytes(32).toString('base64url');
    const tamperedTok = `by_tok.${tamperedParts[1]}.${fakeSig}`;
    const verifiedTampered = await verifyFamilyToken(tamperedTok);
    assert(verifiedTampered === null, 'Tampered token payload is rejected');

    // ==================================================================
    // Group 3: Token Revocation Lifecycle & Multi-Instance / Restart Persistence
    // ==================================================================
    console.log('\n--- Group 3: Token Revocation Lifecycle & Restart Persistence ---');

    // 3.1 Revoke specific token
    const revokableTok = signFamilyToken('FAM-REV1', 'caregiver', 'rev@test.com', 'uid-rev-1');
    assert(await verifyFamilyToken(revokableTok) !== null, 'Revokable token is initially valid');

    await revokeToken(revokableTok, undefined, 'test_revocation');
    assert(await verifyFamilyToken(revokableTok) === null, 'Token is immediately invalidated upon revocation');

    // 3.2 Persistent store survives simulated restart
    // Clear in-memory maps, re-initialize from disk
    initTokenRevocationStore();
    assert(await verifyFamilyToken(revokableTok) === null, 'Token remains invalidated after reloading revocation store from disk');

    // 3.3 User-level revocation
    const userUid = 'uid-user-multi-device';
    const userTok1 = signFamilyToken('FAM-REV2', 'caregiver', 'user@test.com', userUid);
    assert(await verifyFamilyToken(userTok1) !== null, 'User token 1 is initially valid');

    // Wait 10ms then revoke all tokens for this user
    await new Promise((r) => setTimeout(r, 10));
    await revokeUserTokens(userUid, 'user_security_event');

    assert(await verifyFamilyToken(userTok1) === null, 'User token issued before revocation is rejected');

    // New token issued AFTER revocation succeeds
    await new Promise((r) => setTimeout(r, 10));
    const userTok2 = signFamilyToken('FAM-REV2', 'caregiver', 'user@test.com', userUid);
    assert(await verifyFamilyToken(userTok2) !== null, 'Fresh token issued AFTER user revocation is accepted');

    // 3.4 Family-level revocation
    const famCode = 'FAM-DELETE1';
    const famTok1 = signFamilyToken(famCode, 'caregiver', 'fam@test.com', 'uid-fam-1');
    assert(await verifyFamilyToken(famTok1) !== null, 'Family token is initially valid');

    await new Promise((r) => setTimeout(r, 10));
    await revokeFamilyTokens(famCode, 'family_unlinked');
    assert(await verifyFamilyToken(famTok1) === null, 'Family token is rejected after family-level revocation');

    // ==================================================================
    // Group 4: Endpoints & System Workflows
    // ==================================================================
    console.log('\n--- Group 4: Endpoints & System Workflows ---');

    // 4.1 Client Logout Endpoint (/api/caregiver/logout)
    const logoutTok = signFamilyToken('FAM-LOGOUT', 'caregiver', 'logout@test.com', 'uid-logout-1');
    assert(await verifyFamilyToken(logoutTok) !== null, 'Logout test token is initially valid');

    const logoutRes = await fetch(`${baseUrl}/api/caregiver/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${logoutTok}`,
      },
    });
    assert(logoutRes.ok, '/api/caregiver/logout returns 200 OK');
    assert(await verifyFamilyToken(logoutTok) === null, 'Token passed to /api/caregiver/logout is permanently revoked');

    // 4.2 Member Revocation Endpoint (/api/family/member/revoke)
    const ownerUid = 'uid-family-owner-1';
    const memberUid = 'uid-family-member-1';
    const testFamilyCode = 'FAM-REVMEM';

    familyAccounts.set('owner@test.com', {
      familyCode: testFamilyCode,
      email: 'owner@test.com',
      ownerUid,
      caregiverName: 'Owner',
      createdAt: new Date().toISOString(),
      members: {
        [ownerUid]: { uid: ownerUid, email: 'owner@test.com', role: 'caregiver', addedAt: Date.now() },
        [memberUid]: { uid: memberUid, email: 'member@test.com', role: 'child', addedAt: Date.now() },
      },
    });
    await saveFamilyAccounts();

    const ownerTok = signFamilyToken(testFamilyCode, 'caregiver', 'owner@test.com', ownerUid);
    const memberTok = signFamilyToken(testFamilyCode, 'child', 'member@test.com', memberUid);

    assert(await verifyFamilyToken(memberTok) !== null, 'Member token is valid before revocation');

    const revokeRes = await fetch(`${baseUrl}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerTok}`,
      },
      body: JSON.stringify({ targetUid: memberUid, reason: 'Device returned' }),
    });
    assert(revokeRes.ok, '/api/family/member/revoke returns 200 OK');
    assert(await verifyFamilyToken(memberTok) === null, 'Revoked member token is immediately and persistently rejected');

    // 4.3 Device Unlinking Endpoint (/api/caregiver/device/unlink)
    const unlinkPairingCode = 'PAIR-UNL1';
    const unlinkToken = 'tok-unlink-test-12345';
    pairingSessions.set(unlinkPairingCode, {
      pairingCode: unlinkPairingCode,
      initiatedBy: 'child',
      status: 'paired',
      token: unlinkToken,
      expiresAt: Date.now() + 3600000,
      caregiverEmail: 'owner@test.com',
      targetFamilyCode: testFamilyCode,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    await savePairingSessions();

    assert(await verifyFamilyToken(unlinkToken) !== null, 'Pairing token is valid before unlinking');

    const unlinkRes = await fetch(`${baseUrl}/api/caregiver/device/unlink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerTok}`,
      },
      body: JSON.stringify({ pairingCode: unlinkPairingCode }),
    });
    assert(unlinkRes.ok, '/api/caregiver/device/unlink returns 200 OK');
    assert(await verifyFamilyToken(unlinkToken) === null, 'Unlinked device pairing token is permanently revoked');

    // ==================================================================
    // Group 5: Pairing Session Token Security
    // ==================================================================
    console.log('\n--- Group 5: Pairing Session Token Security ---');

    // 5.1 Pending status rejected
    const pendingPairingToken = 'tok-pending-test-1';
    pairingSessions.set('PAIR-PND1', {
      pairingCode: 'PAIR-PND1',
      initiatedBy: 'child',
      status: 'pending',
      token: pendingPairingToken,
      expiresAt: Date.now() + 3600000,
      createdAt: Date.now(),
    });
    assert(await verifyFamilyToken(pendingPairingToken) === null, 'Pairing token with status pending is rejected');

    // 5.2 Awaiting approval status rejected
    const awaitingPairingToken = 'tok-awaiting-test-1';
    pairingSessions.set('PAIR-AWT1', {
      pairingCode: 'PAIR-AWT1',
      initiatedBy: 'child',
      status: 'awaiting_approval',
      token: awaitingPairingToken,
      expiresAt: Date.now() + 3600000,
      createdAt: Date.now(),
    });
    assert(await verifyFamilyToken(awaitingPairingToken) === null, 'Pairing token with status awaiting_approval is rejected');

    // 5.3 Rejected status rejected
    const rejectedPairingToken = 'tok-rejected-test-1';
    pairingSessions.set('PAIR-REJ1', {
      pairingCode: 'PAIR-REJ1',
      initiatedBy: 'child',
      status: 'rejected',
      token: rejectedPairingToken,
      expiresAt: Date.now() + 3600000,
      createdAt: Date.now(),
    });
    assert(await verifyFamilyToken(rejectedPairingToken) === null, 'Pairing token with status rejected is rejected');

    // 5.4 Expired pairing session rejected
    const expiredPairingToken = 'tok-expired-test-1';
    pairingSessions.set('PAIR-EXP1', {
      pairingCode: 'PAIR-EXP1',
      initiatedBy: 'child',
      status: 'paired',
      token: expiredPairingToken,
      expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      createdAt: Date.now() - 3600000,
      targetFamilyCode: 'FAM-PAIR-EXP',
    });
    assert(await verifyFamilyToken(expiredPairingToken) === null, 'Expired pairing session token is rejected');

    // 5.5 Paired unexpired token succeeds
    const validPairingToken = 'tok-valid-test-1';
    pairingSessions.set('PAIR-VAL1', {
      pairingCode: 'PAIR-VAL1',
      initiatedBy: 'child',
      status: 'paired',
      token: validPairingToken,
      expiresAt: Date.now() + 3600000, // Valid for 1 hour
      createdAt: Date.now(),
      targetFamilyCode: 'FAM-PAIR-VAL',
    });
    const verifiedPairing = await verifyFamilyToken(validPairingToken);
    assert(verifiedPairing !== null && verifiedPairing.familyCode === 'FAM-PAIR-VAL', 'Paired unexpired pairing token succeeds');

    // ==================================================================
    // Group 6: Authoritative Server Role Enforcement
    // ==================================================================
    console.log('\n--- Group 6: Authoritative Server Role Enforcement ---');

    const roleUid = 'uid-role-test-user';
    const roleFamilyCode = 'FAM-ROLE-TEST';
    familyAccounts.set('role@test.com', {
      familyCode: roleFamilyCode,
      email: 'role@test.com',
      ownerUid: 'uid-owner-role',
      caregiverName: 'Owner',
      createdAt: new Date().toISOString(),
      members: {
        [roleUid]: { uid: roleUid, email: 'role@test.com', role: 'child', addedAt: Date.now() },
      },
    });
    await saveFamilyAccounts();

    // Client possesses a token claiming role: caregiver, but server records role: child
    const conflictingTok = signFamilyToken(roleFamilyCode, 'caregiver', 'role@test.com', roleUid);
    const verifiedRole = await verifyFamilyToken(conflictingTok);
    assert(
      verifiedRole !== null && verifiedRole.role === 'child',
      'Authoritative server account overrides client token role from caregiver to child'
    );

    // ==================================================================
    // Group 7: Client-Side Token Validation & Cache Purging
    // ==================================================================
    console.log('\n--- Group 7: Client-Side Token Validation & Cache Purging ---');

    // 7.1 Fresh token is valid
    const clientFreshTok = signFamilyToken('FAM-CLI1', 'caregiver', 'cli@test.com', 'uid-cli-1', 3600000);
    assert(isClientTokenValid(clientFreshTok, 'FAM-CLI1'), 'isClientTokenValid returns true for fresh token');

    // 7.2 Expiring within 30s buffer is treated as invalid
    const clientNearExpTok = craftToken({
      familyCode: 'FAM-CLI1',
      role: 'caregiver',
      email: 'cli@test.com',
      uid: 'uid-cli-1',
      iat: Date.now() - 3580000,
      exp: Date.now() + 15000, // Expiring in 15 seconds (< 30s buffer)
      jti: 'jti_near_exp',
    });
    assert(!isClientTokenValid(clientNearExpTok, 'FAM-CLI1'), 'isClientTokenValid returns false for token expiring within 30-second buffer');

    // 7.3 Expired token is invalid
    const clientExpiredTok = craftToken({
      familyCode: 'FAM-CLI1',
      role: 'caregiver',
      email: 'cli@test.com',
      uid: 'uid-cli-1',
      iat: Date.now() - 3600000,
      exp: Date.now() - 1000, // Expired 1s ago
      jti: 'jti_cli_exp',
    });
    assert(!isClientTokenValid(clientExpiredTok, 'FAM-CLI1'), 'isClientTokenValid returns false for expired token');

    // 7.4 Legacy token without exp is invalid
    const clientLegacyTok = craftToken({
      familyCode: 'FAM-CLI1',
      role: 'caregiver',
      email: 'cli@test.com',
      uid: 'uid-cli-1',
      iat: Date.now(),
    });
    assert(!isClientTokenValid(clientLegacyTok, 'FAM-CLI1'), 'isClientTokenValid returns false for legacy token missing exp');

    // 7.5 getSyncClientAuthToken purges expired token from cache
    clearClientAuthToken();
    saveClientAuthToken(clientExpiredTok);
    const syncResult = getSyncClientAuthToken('FAM-CLI1');
    assert(syncResult === '', 'getSyncClientAuthToken returns empty string and purges expired cached token');

    // 7.6 Reviewer Demo Sandbox isolation
    assert(isClientTokenValid('by_demo_reviewer_token_2026', 'FAM-REAL') === false, 'Demo token cannot validate for real family code');
  } catch (err: any) {
    console.error('Unhandled test exception:', err);
    failed++;
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
  console.error('Test execution failed:', err);
  process.exit(1);
});
