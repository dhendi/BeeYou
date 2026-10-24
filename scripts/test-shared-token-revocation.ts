/**
 * BeeYou Shared Token Revocation & Multi-Instance Verification Suite
 *
 * Requirements verified:
 * 1. Move authoritative token, user, and family revocation records to shared Firestore datastore.
 * 2. Every server instance checks current authoritative revocation state without allowing stale cached access.
 * 3. Never report successful logout, unlinking, or revocation when the authoritative datastore write fails.
 * 4. Real multi-instance test: revoke a token through Server A, then verify that Server B,
 *    with independent process memory, rejects that same token.
 * 5. Test datastore outages, failed writes, and server restarts.
 * 6. Preserve short-lived tokens, client renewal, pairing behavior, and demo sandbox.
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

    child.stderr.on('data', (chunk) => {
      // Allow warnings
    });

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

    // 15s timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill();
        reject(new Error('Timed out waiting for worker server to start'));
      }
    }, 15000);
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('BeeYou Shared Token Revocation & Multi-Instance Suite');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const appA = serverModule.default;
  const {
    signFamilyToken,
    verifyFamilyToken,
    revokeToken,
    revokeUserTokens,
    revokeFamilyTokens,
    isTokenRevoked,
    clearAllRevocationsForTesting,
    familyAccounts,
    pairingSessions,
    saveFamilyAccounts,
    savePairingSessions,
  } = serverModule;

  const {
    hashTokenIdentifier,
    extractJtiFromToken,
  } = await import('../src/services/tokenRevocationService');

  const {
    verifyFirestoreConfig,
    FirestoreSyncError,
  } = await import('../src/services/firestoreSyncService');

  // Server A (Process 1)
  const serverA = http.createServer(appA);
  await new Promise<void>((resolve) => serverA.listen(0, resolve));
  const portA = (serverA.address() as any).port;
  const baseUrlA = `http://127.0.0.1:${portA}`;
  console.log(`[Server A] Active on port ${portA} (Process 1)`);

  const firestoreConfig = verifyFirestoreConfig();
  console.log(`[Firestore Datastore] Mode: ${firestoreConfig.mode}, Host: ${firestoreConfig.emulatorHost || 'default'}\n`);

  let workerB: { child: ChildProcess; port: number } | null = null;

  try {
    clearAllRevocationsForTesting();

    // ==================================================================
    // Suite 1: Authoritative Shared Datastore Writes
    // ==================================================================
    console.log('--- Suite 1: Authoritative Shared Datastore Writes ---');

    const testTok1 = signFamilyToken('BEE-SHARE1', 'caregiver', 'share1@test.com', 'uid-share-1');
    const tokenHash1 = hashTokenIdentifier(testTok1);
    const jti1 = extractJtiFromToken(testTok1);

    // Initial check: token is not revoked
    assert(await isTokenRevoked(testTok1) === false, 'Freshly signed token is not revoked');

    // Revoke token through service
    await revokeToken(testTok1, undefined, 'shared_suite_test');

    // In-memory check immediately passes
    assert(await isTokenRevoked(testTok1) === true, 'Token is immediately reported revoked in local memory');

    // Directly verify the document in Cloud Firestore emulator via REST API
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (emulatorHost) {
      const docUrl = `http://${emulatorHost}/v1/projects/beeyou-23d7d/databases/(default)/documents/beeyou_revoked_tokens/${tokenHash1}`;
      const docRes = await fetch(docUrl, {
        headers: { 'Authorization': 'Bearer owner' },
      });
      assert(docRes.ok, 'Revoked token document exists in Firestore beeyou_revoked_tokens collection');
      const docData = await docRes.json();
      assert(docData.fields?.tokenHash?.stringValue === tokenHash1, 'Firestore record contains matching tokenHash');
      assert(Number(docData.fields?.revokedAt?.integerValue) > 0, 'Firestore record contains valid revokedAt timestamp');

      // Test User-Level Firestore Write
      const testUid = 'uid-shared-user-1';
      await revokeUserTokens(testUid, 'test_user_revocation');
      const userDocUrl = `http://${emulatorHost}/v1/projects/beeyou-23d7d/databases/(default)/documents/beeyou_revoked_users/${encodeURIComponent(testUid)}`;
      const userRes = await fetch(userDocUrl, {
        headers: { 'Authorization': 'Bearer owner' },
      });
      assert(userRes.ok, 'Revoked user document exists in Firestore beeyou_revoked_users collection');

      // Test Family-Level Firestore Write
      const testFamCode = 'BEE-FAM-SHARE1';
      await revokeFamilyTokens(testFamCode, 'test_family_revocation');
      const famDocUrl = `http://${emulatorHost}/v1/projects/beeyou-23d7d/databases/(default)/documents/beeyou_revoked_families/${encodeURIComponent(testFamCode)}`;
      const famRes = await fetch(famDocUrl, {
        headers: { 'Authorization': 'Bearer owner' },
      });
      assert(famRes.ok, 'Revoked family document exists in Firestore beeyou_revoked_families collection');

      // Demo sandbox isolation: BEE-DEMO revocation does not write to Cloud Firestore
      await revokeFamilyTokens('BEE-DEMO', 'demo_reset');
      const demoDocUrl = `http://${emulatorHost}/v1/projects/beeyou-23d7d/databases/(default)/documents/beeyou_revoked_families/BEE-DEMO`;
      const demoRes = await fetch(demoDocUrl, {
        headers: { 'Authorization': 'Bearer owner' },
      });
      assert(!demoRes.ok, 'BEE-DEMO revocation is strictly memory-only and does NOT write to Cloud Firestore');
    }

    // ==================================================================
    // Suite 2: Real Multi-Instance Verification with Independent Process Memory
    // ==================================================================
    console.log('\n--- Suite 2: Real Multi-Instance Verification with Independent Memory ---');

    const multiFamilyCode = 'BEE-MULTI1';
    familyAccounts.set('caregiver@multi.com', {
      familyCode: multiFamilyCode,
      email: 'caregiver@multi.com',
      ownerUid: 'uid-owner-multi',
      caregiverName: 'Caregiver',
      createdAt: new Date().toISOString(),
      members: {
        'uid-owner-multi': { uid: 'uid-owner-multi', email: 'caregiver@multi.com', role: 'caregiver', addedAt: Date.now() },
        'uid-child-multi': { uid: 'uid-child-multi', email: 'child@multi.com', role: 'child', addedAt: Date.now() },
      },
    });
    await saveFamilyAccounts();

    const unlinkPairingCode = 'PAIR-CROSS1';
    const unlinkToken = 'tok-cross-device-unlink-999';
    pairingSessions.set(unlinkPairingCode, {
      pairingCode: unlinkPairingCode,
      initiatedBy: 'child',
      status: 'paired',
      token: unlinkToken,
      expiresAt: Date.now() + 3600000,
      caregiverEmail: 'caregiver@multi.com',
      targetFamilyCode: multiFamilyCode,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    await savePairingSessions();

    console.log('[Multi-Instance] Launching Server B as an independent child process...');
    workerB = await spawnWorkerServer();
    const portB = workerB.port;
    const baseUrlB = `http://127.0.0.1:${portB}`;
    console.log(`[Server B] Active on port ${portB} (Process 2 - Independent Memory)`);

    // 2.1 Cross-Instance Token Invalidation via Server A Logout
    const crossToken = signFamilyToken(multiFamilyCode, 'caregiver', 'caregiver@multi.com', 'uid-owner-multi');

    // Both Server A and Server B initially accept the valid token
    const testAInit = await fetch(`${baseUrlA}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${crossToken}` },
    });
    assert(testAInit.ok, 'Server A initially accepts the valid cross-instance token');

    const testBInit = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${crossToken}` },
    });
    assert(testBInit.ok, 'Server B initially accepts the valid cross-instance token');

    // Client sends logout to Server A
    const logoutRes = await fetch(`${baseUrlA}/api/caregiver/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${crossToken}`,
      },
    });
    assert(logoutRes.ok, 'Server A processes logout successfully (200 OK)');

    // Client immediately sends request to Server B (with completely independent process memory)
    const testBAfterRevoke = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${crossToken}` },
    });
    assert(
      testBAfterRevoke.status === 401,
      'Server B (independent memory) immediately rejects the token revoked on Server A (401 Unauthorized)'
    );

    // 2.2 Cross-Instance Member Revocation via Server A
    const childMemberUid = 'uid-child-multi';
    const childToken = signFamilyToken(multiFamilyCode, 'child', 'child@multi.com', childMemberUid);
    const ownerToken = signFamilyToken(multiFamilyCode, 'caregiver', 'caregiver@multi.com', 'uid-owner-multi');

    // Server B initially accepts child token
    const testBChildInit = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${childToken}` },
    });
    assert(testBChildInit.ok, 'Server B initially accepts child token prior to revocation');

    // Owner revokes child member through Server A
    const memberRevokeRes = await fetch(`${baseUrlA}/api/family/member/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ targetUid: childMemberUid, reason: 'Device replaced' }),
    });
    assert(memberRevokeRes.ok, 'Server A processes member revocation successfully (200 OK)');

    // Child device sends request to Server B
    const testBChildAfterRevoke = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${childToken}` },
    });
    assert(
      testBChildAfterRevoke.status === 401,
      'Server B (independent memory) immediately rejects member token revoked on Server A (401 Unauthorized)'
    );

    // 2.3 Cross-Instance Device Unlinking
    // Server B accepts pairing token initially
    const testBPairInit = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${unlinkToken}` },
    });
    assert(testBPairInit.ok, 'Server B initially accepts device pairing token');

    // Unlink device via Server A
    const unlinkRes = await fetch(`${baseUrlA}/api/caregiver/device/unlink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ pairingCode: unlinkPairingCode }),
    });
    assert(unlinkRes.ok, 'Server A processes device unlinking successfully (200 OK)');

    // Device attempts request to Server B
    const testBPairAfterUnlink = await fetch(`${baseUrlB}/api/caregiver/session/${multiFamilyCode}`, {
      headers: { 'Authorization': `Bearer ${unlinkToken}` },
    });
    assert(
      testBPairAfterUnlink.status === 401,
      'Server B (independent memory) immediately rejects unlinked pairing token (401 Unauthorized)'
    );

    // ==================================================================
    // Suite 3: Datastore Outages & Failed Writes Error Handling
    // ==================================================================
    console.log('\n--- Suite 3: Datastore Outages & Failed Writes Error Handling ---');

    // Create a mock failing datastore server on an ephemeral port
    // Emulates datastore write outage: reads succeed, but commits fail with 503
    let readOutageActive = false;
    const failingServer = http.createServer((req, res) => {
      if (req.url?.includes(':batchGet')) {
        if (readOutageActive) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { code: 503, message: 'Datastore read unavailable' } }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([]));
        }
      } else {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 503, message: 'Datastore write unavailable' } }));
      }
    });
    await new Promise<void>((r) => failingServer.listen(0, r));
    const failingPort = (failingServer.address() as any).port;
    const failingHost = `http://127.0.0.1:${failingPort}`;

    // 3.1 Direct revocation write failure throws structured FirestoreSyncError
    let threwSyncError = false;
    try {
      await revokeToken('by_tok_failure_test', undefined, 'outage_test', {
        customHost: failingHost,
        customAuthHeader: 'Bearer test',
        maxRetries: 0,
        timeoutMs: 1000,
      });
    } catch (err: any) {
      if (err instanceof FirestoreSyncError) {
        threwSyncError = true;
      }
    }
    assert(threwSyncError, 'Direct revokeToken throws FirestoreSyncError when datastore write fails');

    // 3.2 Endpoint failure handling: /api/caregiver/logout fails safely on datastore outage
    // Start an instance pointed to the failing datastore
    const outageApp = http.createServer(appA);
    await new Promise<void>((r) => outageApp.listen(0, r));
    const outagePort = (outageApp.address() as any).port;
    const outageBaseUrl = `http://127.0.0.1:${outagePort}`;

    const prevEmulator = process.env.FIRESTORE_EMULATOR_HOST;
    try {
      // Direct FIRESTORE_EMULATOR_HOST to the failing server
      process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${failingPort}`;

      const logoutFailRes = await fetch(`${outageBaseUrl}/api/caregiver/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`,
        },
      });
      assert(
        logoutFailRes.status === 502,
        '/api/caregiver/logout returns 502 Bad Gateway when datastore write fails'
      );
      const logoutFailBody = await logoutFailRes.json();
      assert(
        logoutFailBody.error === 'RevocationSyncError',
        'Logout failure response identifies RevocationSyncError'
      );

      // 3.3 Endpoint failure handling: /api/caregiver/device/unlink fails safely
      const outageFamilyCode = 'BEE-OUTAGE-UNL';
      const outageOwnerToken = signFamilyToken(outageFamilyCode, 'caregiver', 'outage-owner@test.com', 'uid-outage-owner');
      const outagePairingCode = 'PAIR-OUTAGE1';
      const outagePairToken = 'tok-outage-pair-123';
      pairingSessions.set(outagePairingCode, {
        pairingCode: outagePairingCode,
        initiatedBy: 'child',
        status: 'paired',
        token: outagePairToken,
        expiresAt: Date.now() + 3600000,
        caregiverEmail: 'outage-owner@test.com',
        targetFamilyCode: outageFamilyCode,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
      });

      const unlinkFailRes = await fetch(`${outageBaseUrl}/api/caregiver/device/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${outageOwnerToken}`,
        },
        body: JSON.stringify({ pairingCode: outagePairingCode }),
      });
      assert(
        unlinkFailRes.status === 502,
        '/api/caregiver/device/unlink returns 502 Bad Gateway when datastore write fails'
      );
      const unlinkFailBody = await unlinkFailRes.json();
      assert(
        unlinkFailBody.error === 'RevocationSyncError',
        'Unlink failure response identifies RevocationSyncError'
      );

      // 3.4 Direct datastore read outage throws structured FirestoreSyncError
      readOutageActive = true;
      let readOutageThrew = false;
      try {
        await isTokenRevoked('by_tok_read_outage_test', undefined, {
          customHost: failingHost,
          customAuthHeader: 'Bearer test',
          throwOnError: true,
          timeoutMs: 1000,
        });
      } catch (err: any) {
        if (err instanceof FirestoreSyncError) {
          readOutageThrew = true;
        }
      }
      assert(
        readOutageThrew,
        'Direct isTokenRevoked throws FirestoreSyncError when datastore read encounters an outage'
      );
    } finally {
      if (prevEmulator) {
        process.env.FIRESTORE_EMULATOR_HOST = prevEmulator;
      } else {
        delete process.env.FIRESTORE_EMULATOR_HOST;
      }
      failingServer.close();
      outageApp.close();
    }

    // ==================================================================
    // Suite 4: Server Restart Persistence
    // ==================================================================
    console.log('\n--- Suite 4: Server Restart Persistence ---');

    const restartToken = signFamilyToken('BEE-RESTART1', 'caregiver', 'restart@test.com', 'uid-restart-1');

    // Revoke token on Server A
    await revokeToken(restartToken, undefined, 'restart_persistence_test');

    // Terminate Server B child process
    if (workerB) {
      workerB.child.kill();
      workerB = null;
    }

    // Spawn a completely new Server C child process (cold start)
    console.log('[Server Restart] Booting a fresh Server C process with cold memory...');
    const workerC = await spawnWorkerServer();
    const portC = workerC.port;
    const baseUrlC = `http://127.0.0.1:${portC}`;
    console.log(`[Server C] Active on port ${portC} (Process 3 - Cold Boot)`);

    try {
      const restartVerifyRes = await fetch(`${baseUrlC}/api/caregiver/session/BEE-RESTART1`, {
        headers: { 'Authorization': `Bearer ${restartToken}` },
      });
      assert(
        restartVerifyRes.status === 401,
        'Cold-booted Server C checks Firestore and rejects previously revoked token (401 Unauthorized)'
      );
    } finally {
      workerC.child.kill();
    }
  } catch (err: any) {
    console.error('Unhandled shared revocation test exception:', err);
    failed++;
  } finally {
    if (workerB) {
      try { workerB.child.kill(); } catch {}
    }
    serverA.close();
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
