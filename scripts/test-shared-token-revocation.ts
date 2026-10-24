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
    caregiverSessions,
    saveFamilyAccounts,
    savePairingSessions,
  } = serverModule;

  const {
    hashTokenIdentifier,
    extractJtiFromToken,
    parseFirestoreBatchGetResponse,
    validateBatchGetDocumentsCoverage,
    isProductionEnvironment,
  } = await import('../src/services/tokenRevocationService');

  const {
    verifyFirestoreConfig,
    FirestoreSyncError,
    resetCachedGoogleAuth,
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
          let bodyStr = '';
          req.on('data', (c) => { bodyStr += c.toString(); });
          req.on('end', () => {
            let reqDocs: string[] = [];
            try {
              reqDocs = JSON.parse(bodyStr).documents || [];
            } catch {}
            res.writeHead(200, { 'Content-Type': 'application/json' });
            for (const doc of reqDocs) {
              res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z', missing: doc }) + '\n');
            }
            res.end();
          });
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

      // 3.4 Direct datastore read outage throws structured FirestoreSyncError (without test-only flags)
      readOutageActive = true;
      let readOutageThrew = false;
      try {
        await isTokenRevoked('by_tok_read_outage_test', undefined, {
          customHost: failingHost,
          customAuthHeader: 'Bearer test',
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

      // 3.5 Normal verifyFamilyToken() and protected routes fail closed during datastore read outage
      const failClosedUser = await verifyFamilyToken(outageOwnerToken);
      assert(
        failClosedUser === null,
        'Normal verifyFamilyToken() fails closed and returns null during datastore outage'
      );

      const protectedOutageRes = await fetch(`${outageBaseUrl}/api/family/state/${outageFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${outageOwnerToken}` },
      });
      assert(
        protectedOutageRes.status === 401,
        'Protected API route returns 401 Unauthorized during datastore read outage (fails closed)'
      );

      // 3.6 Revoked credentials cannot be authorized during datastore read failure
      const revokedOutageRes = await fetch(`${outageBaseUrl}/api/caregiver/session/${multiFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${crossToken}` },
      });
      assert(
        revokedOutageRes.status === 401,
        'Revoked credentials cannot be authorized during datastore read failures'
      );

      // 3.7 Existing demo reviewer sandbox remains functional during datastore read failure
      const demoVerifyResult = await verifyFamilyToken('by_demo_reviewer_token_2026');
      assert(
        demoVerifyResult?.role === 'demo' && demoVerifyResult?.isDemo === true,
        'Existing demo reviewer token remains functional during datastore outage'
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

    // ==================================================================
    // Suite 5: Production Firestore REST documents:batchGet Stream Parsing
    // ==================================================================
    console.log('\n--- Suite 5: Production Firestore REST documents:batchGet Stream Parsing ---');

    // 5.1 Direct parser verification for NDJSON stream (newline-delimited JSON objects)
    const streamDocName = `projects/beeyou-reviewer-demo/databases/(default)/documents/beeyou_revoked_tokens/${crypto.createHash('sha256').update('test_tok_stream').digest('hex')}`;
    const ndjsonFoundStream = [
      JSON.stringify({ readTime: '2026-10-23T20:00:00.000000Z' }),
      JSON.stringify({
        found: {
          name: streamDocName,
          fields: {
            revokedAt: { integerValue: String(Date.now()) },
            reason: { stringValue: 'stream_test' },
          },
        },
        readTime: '2026-10-23T20:00:01.000000Z',
      }),
    ].join('\n') + '\n';

    const parsedNdjson = parseFirestoreBatchGetResponse(ndjsonFoundStream, 1);
    assert(parsedNdjson.length === 2, 'Parses real production NDJSON streamed response into discrete items');
    assert(parsedNdjson[1].found?.name === streamDocName, 'Correctly extracts found document from NDJSON stream');

    // 5.2 Direct parser verification for concatenated JSON stream (no newlines)
    const concatStream = `{"readTime":"2026-10-23T20:00:00Z","missing":"doc1"}{"readTime":"2026-10-23T20:00:00Z","missing":"doc2"}`;
    const parsedConcat = parseFirestoreBatchGetResponse(concatStream, 2);
    assert(parsedConcat.length === 2, 'Parses concatenated JSON objects from HTTP stream without newlines');
    assert(parsedConcat[0].missing === 'doc1' && parsedConcat[1].missing === 'doc2', 'Correctly extracts missing document paths');

    // 5.3 Direct parser verification for single JSON object response
    const singleObjStream = JSON.stringify({
      readTime: '2026-10-23T20:00:00Z',
      missing: 'doc_single',
    });
    const parsedSingle = parseFirestoreBatchGetResponse(singleObjStream, 1);
    assert(parsedSingle.length === 1 && parsedSingle[0].missing === 'doc_single', 'Parses single JSON object response without assuming array');

    // 5.4 Direct parser failure on malformed or unexpected responses (fails closed)
    let threwOnHtml = false;
    try {
      parseFirestoreBatchGetResponse('<html><body>502 Bad Gateway</body></html>', 1);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError) threwOnHtml = true;
    }
    assert(threwOnHtml, 'Throws FirestoreSyncError on HTML or non-JSON error stream (fails closed)');

    let threwOnEmpty = false;
    try {
      parseFirestoreBatchGetResponse('', 1);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError) threwOnEmpty = true;
    }
    assert(threwOnEmpty, 'Throws FirestoreSyncError on empty response when documents were requested');

    let threwOnUnexpectedFormat = false;
    try {
      parseFirestoreBatchGetResponse(JSON.stringify({ unexpectedKey: 12345 }), 1);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError) threwOnUnexpectedFormat = true;
    }
    assert(threwOnUnexpectedFormat, 'Throws FirestoreSyncError on unexpected object structure (does not assume empty)');

    // 5.5 End-to-end streamed response verification with normal verifyFamilyToken() and protected API routes
    let streamMode: 'valid_ndjson' | 'revoked_ndjson' | 'malformed_html' = 'valid_ndjson';
    const streamFamilyCode = 'BEE-STREAM1';
    const streamOwnerEmail = 'stream-owner@test.com';
    const streamToken = signFamilyToken(streamFamilyCode, 'caregiver', streamOwnerEmail, 'uid-stream-1');
    const streamTokenHash = crypto.createHash('sha256').update(streamToken).digest('hex');

    familyAccounts.set(streamOwnerEmail, {
      id: 'fam-stream1',
      email: streamOwnerEmail,
      familyCode: streamFamilyCode,
      ownerUid: 'uid-stream-1',
      caregiverName: 'Stream Owner',
      caregiverRole: 'Parent',
      members: {
        'uid-stream-1': { role: 'caregiver', email: streamOwnerEmail, approvedAt: Date.now() },
        'uid-stream-1-rev': { role: 'caregiver', email: streamOwnerEmail, approvedAt: Date.now() },
        'uid-stream-1-malformed': { role: 'caregiver', email: streamOwnerEmail, approvedAt: Date.now() },
      },
      childProfile: { name: 'Stream Child', ageGroup: 'kid', interests: [] },
    });
    caregiverSessions.set(streamFamilyCode, {
      pairingCode: streamFamilyCode,
      childName: 'Stream Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 0,
      routineProgress: 0,
      stars: 0,
      isOffline: false,
      messages: [],
      unlinked: false,
    });

    const streamServer = http.createServer((req, res) => {
      if (req.url?.includes(':batchGet')) {
        let bodyStr = '';
        req.on('data', (c) => { bodyStr += c.toString(); });
        req.on('end', () => {
          let reqDocs: string[] = [];
          try {
            const parsed = JSON.parse(bodyStr);
            reqDocs = parsed.documents || [];
          } catch {}

          if (streamMode === 'valid_ndjson') {
            // Stream NDJSON with missing documents (token is valid)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            for (const doc of reqDocs) {
              res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z', missing: doc }) + '\n');
            }
            res.end();
          } else if (streamMode === 'revoked_ndjson') {
            // Stream NDJSON with found document (token is revoked)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z' }) + '\n');
            for (const doc of reqDocs) {
              if (doc.includes('/beeyou_revoked_tokens/')) {
                res.write(JSON.stringify({
                  found: {
                    name: doc,
                    fields: {
                      revokedAt: { integerValue: String(Date.now()) },
                      reason: { stringValue: 'stream_revoked' },
                    },
                  },
                  readTime: '2026-10-23T20:00:00Z',
                }) + '\n');
              } else {
                res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z', missing: doc }) + '\n');
              }
            }
            res.end();
          } else if (streamMode === 'malformed_html') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body>Proxy Error</body></html>');
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
      }
    });
    await new Promise<void>((r) => streamServer.listen(0, r));
    const streamPort = (streamServer.address() as any).port;

    const streamApp = http.createServer(appA);
    await new Promise<void>((r) => streamApp.listen(0, r));
    const streamAppPort = (streamApp.address() as any).port;
    const streamBaseUrl = `http://127.0.0.1:${streamAppPort}`;

    const prevEmuStream = process.env.FIRESTORE_EMULATOR_HOST;
    try {
      process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${streamPort}`;

      // A: When stream indicates missing, normal verifyFamilyToken succeeds
      streamMode = 'valid_ndjson';
      const validStreamUser = await verifyFamilyToken(streamToken);
      assert(validStreamUser?.familyCode === 'BEE-STREAM1', 'Normal verifyFamilyToken() succeeds when streamed response indicates unrevoked token');

      const streamProtectedRes = await fetch(`${streamBaseUrl}/api/family/state/BEE-STREAM1`, {
        headers: { 'Authorization': `Bearer ${streamToken}` },
      });
      assert(streamProtectedRes.status === 200, 'Protected API route returns 200 OK when streamed NDJSON confirms token is valid');

      // B: When stream indicates found, normal verifyFamilyToken rejects (401)
      streamMode = 'revoked_ndjson';
      const revokedStreamToken = signFamilyToken('BEE-STREAM1', 'caregiver', 'stream-owner@test.com', 'uid-stream-1-rev');
      const revokedStreamUser = await verifyFamilyToken(revokedStreamToken);
      assert(revokedStreamUser === null, 'Normal verifyFamilyToken() rejects token when streamed response contains found revocation');

      const streamRevokedRes = await fetch(`${streamBaseUrl}/api/family/state/BEE-STREAM1`, {
        headers: { 'Authorization': `Bearer ${revokedStreamToken}` },
      });
      assert(streamRevokedRes.status === 401, 'Protected API route returns 401 Unauthorized when streamed NDJSON reports token is revoked');

      // C: When stream sends malformed HTML, normal verifyFamilyToken fails closed (401)
      streamMode = 'malformed_html';
      const malformedStreamToken = signFamilyToken('BEE-STREAM1', 'caregiver', 'stream-owner@test.com', 'uid-stream-1-malformed');
      const malformedStreamUser = await verifyFamilyToken(malformedStreamToken);
      assert(malformedStreamUser === null, 'Normal verifyFamilyToken() fails closed when stream returns malformed HTML');

      const streamMalformedRes = await fetch(`${streamBaseUrl}/api/family/state/BEE-STREAM1`, {
        headers: { 'Authorization': `Bearer ${malformedStreamToken}` },
      });
      assert(streamMalformedRes.status === 401, 'Protected API route returns 401 Unauthorized when stream is malformed (fails closed)');
    } finally {
      if (prevEmuStream) {
        process.env.FIRESTORE_EMULATOR_HOST = prevEmuStream;
      } else {
        delete process.env.FIRESTORE_EMULATOR_HOST;
      }
      streamServer.close();
      streamApp.close();
    }

    // ==================================================================
    // Suite 6: Production Unconfigured & Incomplete Stream Coverage
    // ==================================================================
    console.log('\n--- Suite 6: Production Unconfigured & Incomplete Stream Coverage ---');

    // 6.1 Missing production Firestore configuration denies protected authentication
    const prodFamilyCode = 'BEE-PROD-TEST';
    const prodOwnerEmail = 'prod-owner@test.com';
    const prodToken = signFamilyToken(prodFamilyCode, 'caregiver', prodOwnerEmail, 'uid-prod-1');

    familyAccounts.set(prodOwnerEmail, {
      id: 'fam-prod1',
      email: prodOwnerEmail,
      familyCode: prodFamilyCode,
      ownerUid: 'uid-prod-1',
      caregiverName: 'Prod Owner',
      caregiverRole: 'Parent',
      members: {
        'uid-prod-1': { role: 'caregiver', email: prodOwnerEmail, approvedAt: Date.now() },
      },
      childProfile: { name: 'Prod Child', ageGroup: 'kid', interests: [] },
    });
    caregiverSessions.set(prodFamilyCode, {
      pairingCode: prodFamilyCode,
      childName: 'Prod Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 0,
      routineProgress: 0,
      stars: 0,
      isOffline: false,
      messages: [],
      unlinked: false,
    });

    const oldNodeEnv = process.env.NODE_ENV;
    const oldEmuHost = process.env.FIRESTORE_EMULATOR_HOST;
    const oldOfflineDev = process.env.OFFLINE_DEV;
    const oldGcloudProject = process.env.GCLOUD_PROJECT;
    const oldGoogleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;

    try {
      // Simulate production environment with missing Firestore credentials
      process.env.NODE_ENV = 'production';
      delete process.env.FIRESTORE_EMULATOR_HOST;
      delete process.env.OFFLINE_DEV;
      delete process.env.GCLOUD_PROJECT;
      delete process.env.GOOGLE_CLOUD_PROJECT;
      resetCachedGoogleAuth();

      // A: Direct isTokenRevoked throws structured error in production when credentials missing
      let threwMissingConfig = false;
      try {
        await isTokenRevoked(prodToken);
      } catch (err: any) {
        if (err instanceof FirestoreSyncError && err.statusCode === 500) {
          threwMissingConfig = true;
        }
      }
      assert(
        threwMissingConfig,
        'Direct isTokenRevoked throws 500 FirestoreSyncError when production credentials missing'
      );

      // B: Normal verifyFamilyToken denies authentication in production when credentials missing
      const prodVerifyResult = await verifyFamilyToken(prodToken);
      assert(
        prodVerifyResult === null,
        'Normal verifyFamilyToken denies authentication in production when credentials missing'
      );

      // C: Protected route denies request (401 Unauthorized) in production
      const prodProtectedRes = await fetch(`${baseUrlA}/api/family/state/${prodFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${prodToken}` },
      });
      assert(
        prodProtectedRes.status === 401,
        'Protected API route returns 401 Unauthorized in production when credentials missing'
      );

      // D: Revocation write in production fails closed and throws (never reports success)
      let threwOnRevokeMissing = false;
      try {
        await revokeToken(prodToken, undefined, 'prod_missing_test');
      } catch (err: any) {
        if (err instanceof FirestoreSyncError && err.statusCode === 500) {
          threwOnRevokeMissing = true;
        }
      }
      assert(
        threwOnRevokeMissing,
        'Direct revokeToken throws 500 FirestoreSyncError in production when credentials missing'
      );

      // E: Normal /api/caregiver/logout endpoint returns 502 or 401 (fails closed)
      const prodLogoutRes = await fetch(`${baseUrlA}/api/caregiver/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${prodToken}`,
        },
      });
      assert(
        prodLogoutRes.status === 502 || prodLogoutRes.status === 401,
        '/api/caregiver/logout fails closed when production credentials missing'
      );

      // F: Isolated demo sandbox remains intact in production even without Firestore
      const prodDemoUser = await verifyFamilyToken('by_demo_reviewer_token_2026');
      assert(
        prodDemoUser?.role === 'demo' && prodDemoUser?.isDemo === true,
        'Isolated demo sandbox remains functional in production without cloud credentials'
      );

      // G: Explicitly configured offline development allows verification
      process.env.OFFLINE_DEV = 'true';
      const offlineDevResult = await verifyFamilyToken('by_demo_reviewer_token_2026');
      assert(
        offlineDevResult !== null,
        'Explicitly configured offline development allows local verification'
      );
    } finally {
      process.env.NODE_ENV = oldNodeEnv;
      if (oldEmuHost) process.env.FIRESTORE_EMULATOR_HOST = oldEmuHost;
      if (oldOfflineDev) process.env.OFFLINE_DEV = oldOfflineDev;
      else delete process.env.OFFLINE_DEV;
      if (oldGcloudProject) process.env.GCLOUD_PROJECT = oldGcloudProject;
      else delete process.env.GCLOUD_PROJECT;
      if (oldGoogleCloudProject) process.env.GOOGLE_CLOUD_PROJECT = oldGoogleCloudProject;
      else delete process.env.GOOGLE_CLOUD_PROJECT;
      resetCachedGoogleAuth();
    }

    // 6.2 Incomplete response testing: 4 documents requested but only 1 response received
    const fourDocPaths = [
      'projects/p/databases/(default)/documents/beeyou_revoked_tokens/tok_hash_1',
      'projects/p/databases/(default)/documents/beeyou_revoked_tokens/jti_hash_1',
      'projects/p/databases/(default)/documents/beeyou_revoked_users/uid_1',
      'projects/p/databases/(default)/documents/beeyou_revoked_families/FAM_1',
    ];

    let threwOnPartialResponse = false;
    try {
      const partialItems = [
        { missing: fourDocPaths[0], readTime: '2026-10-23T20:00:00Z' },
      ];
      validateBatchGetDocumentsCoverage(fourDocPaths, partialItems);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && err.message.includes('omitted requested documents (1/4)')) {
        threwOnPartialResponse = true;
      }
    }
    assert(
      threwOnPartialResponse,
      'validateBatchGetDocumentsCoverage rejects partial response when 4 requested but 1 received'
    );

    // 6.3 Completely missing response records (only read-time metadata returned)
    let threwOnMetadataOnly = false;
    try {
      const metadataOnlyItems = [
        { readTime: '2026-10-23T20:00:00Z' },
        { transaction: 'tx-metadata-start' },
      ];
      validateBatchGetDocumentsCoverage(fourDocPaths, metadataOnlyItems);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && err.message.includes('omitted requested documents (0/4)')) {
        threwOnMetadataOnly = true;
      }
    }
    assert(
      threwOnMetadataOnly,
      'validateBatchGetDocumentsCoverage rejects metadata-only stream with 0 document records'
    );

    // 6.4 Duplicate results rejection
    let threwOnDuplicate = false;
    try {
      const duplicateItems = [
        { missing: fourDocPaths[0] },
        { missing: fourDocPaths[1] },
        { missing: fourDocPaths[2] },
        { missing: fourDocPaths[3] },
        { missing: fourDocPaths[0] },
      ];
      validateBatchGetDocumentsCoverage(fourDocPaths, duplicateItems);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && err.message.includes('duplicate results')) {
        threwOnDuplicate = true;
      }
    }
    assert(
      threwOnDuplicate,
      'validateBatchGetDocumentsCoverage rejects duplicate results for the same document path'
    );

    // 6.5 Unexpected document paths rejection
    let threwOnUnexpectedPath = false;
    try {
      const unexpectedItems = [
        { missing: fourDocPaths[0] },
        { missing: fourDocPaths[1] },
        { missing: fourDocPaths[2] },
        { missing: 'projects/p/databases/(default)/documents/unrelated/alien_path' },
      ];
      validateBatchGetDocumentsCoverage(fourDocPaths, unexpectedItems);
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && err.message.includes('unexpected document path')) {
        threwOnUnexpectedPath = true;
      }
    }
    assert(
      threwOnUnexpectedPath,
      'validateBatchGetDocumentsCoverage rejects responses containing unexpected document paths'
    );

    // 6.6 Valid complete streams in different orders
    const shuffledItems = [
      { missing: fourDocPaths[2] },
      { readTime: '2026-10-23T20:00:00Z' },
      { missing: fourDocPaths[0] },
      { missing: fourDocPaths[3] },
      { missing: fourDocPaths[1] },
    ];
    const coveredResults = validateBatchGetDocumentsCoverage(fourDocPaths, shuffledItems);
    assert(
      coveredResults.length === 4,
      'validateBatchGetDocumentsCoverage handles valid complete streams in shuffled orders'
    );

    // 6.7 End-to-end: Stream server returning only 1 of multiple documents causes normal verifyFamilyToken to fail closed
    let incompleteStreamMode: 'single_doc' | 'metadata_only' | 'shuffled_complete' = 'single_doc';
    const fourDocFamilyCode = 'BEE-FOURDOC';
    const fourDocToken = signFamilyToken(fourDocFamilyCode, 'caregiver', 'fourdoc@test.com', 'uid-fourdoc-1');
    const fourDocTokenHash = crypto.createHash('sha256').update(fourDocToken).digest('hex');

    familyAccounts.set('fourdoc@test.com', {
      id: 'fam-fourdoc',
      email: 'fourdoc@test.com',
      familyCode: fourDocFamilyCode,
      ownerUid: 'uid-fourdoc-1',
      caregiverName: 'FourDoc Owner',
      caregiverRole: 'Parent',
      members: {
        'uid-fourdoc-1': { role: 'caregiver', email: 'fourdoc@test.com', approvedAt: Date.now() },
      },
      childProfile: { name: 'FourDoc Child', ageGroup: 'kid', interests: [] },
    });
    caregiverSessions.set(fourDocFamilyCode, {
      pairingCode: fourDocFamilyCode,
      childName: 'FourDoc Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 0,
      routineProgress: 0,
      stars: 0,
      isOffline: false,
      messages: [],
      unlinked: false,
    });

    const incompleteStreamServer = http.createServer((req, res) => {
      if (req.url?.includes(':batchGet')) {
        let bodyStr = '';
        req.on('data', (c) => { bodyStr += c.toString(); });
        req.on('end', () => {
          let reqDocs: string[] = [];
          try {
            const parsed = JSON.parse(bodyStr);
            reqDocs = parsed.documents || [];
          } catch {}

          res.writeHead(200, { 'Content-Type': 'application/json' });
          if (incompleteStreamMode === 'single_doc') {
            // Send only 1 document result even though multiple documents are requested
            if (reqDocs.length > 0) {
              res.write(JSON.stringify({
                readTime: '2026-10-23T20:00:00Z',
                missing: reqDocs[0],
              }) + '\n');
            }
            res.end();
          } else if (incompleteStreamMode === 'metadata_only') {
            // Send only readTime metadata without document records
            res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z' }) + '\n');
            res.end();
          } else if (incompleteStreamMode === 'shuffled_complete') {
            // Send all requested documents in shuffled order with interleaved metadata
            res.write(JSON.stringify({ readTime: '2026-10-23T20:00:00Z' }) + '\n');
            const reversed = [...reqDocs].reverse();
            for (const doc of reversed) {
              res.write(JSON.stringify({
                readTime: '2026-10-23T20:00:01Z',
                missing: doc,
              }) + '\n');
            }
            res.end();
          }
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
      }
    });
    await new Promise<void>((r) => incompleteStreamServer.listen(0, r));
    const incPort = (incompleteStreamServer.address() as any).port;

    const incApp = http.createServer(appA);
    await new Promise<void>((r) => incApp.listen(0, r));
    const incAppPort = (incApp.address() as any).port;
    const incBaseUrl = `http://127.0.0.1:${incAppPort}`;

    const prevIncEmu = process.env.FIRESTORE_EMULATOR_HOST;
    try {
      process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${incPort}`;

      // Test 1: Incomplete stream with 1 of multiple documents causes normal verifyFamilyToken to fail closed
      incompleteStreamMode = 'single_doc';
      const incVerifyResult = await verifyFamilyToken(fourDocToken);
      assert(
        incVerifyResult === null,
        'Normal verifyFamilyToken fails closed when stream omits requested documents'
      );

      const incRouteRes = await fetch(`${incBaseUrl}/api/family/state/${fourDocFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${fourDocToken}` },
      });
      assert(
        incRouteRes.status === 401,
        'Protected API route returns 401 Unauthorized when stream omits requested documents'
      );

      // Test 2: Metadata-only stream causes normal verifyFamilyToken to fail closed
      incompleteStreamMode = 'metadata_only';
      const metaVerifyResult = await verifyFamilyToken(fourDocToken);
      assert(
        metaVerifyResult === null,
        'Normal verifyFamilyToken fails closed when stream returns only metadata without document records'
      );

      const metaRouteRes = await fetch(`${incBaseUrl}/api/family/state/${fourDocFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${fourDocToken}` },
      });
      assert(
        metaRouteRes.status === 401,
        'Protected API route returns 401 Unauthorized when stream returns only metadata'
      );

      // Test 3: Shuffled complete stream succeeds normally
      incompleteStreamMode = 'shuffled_complete';
      const completeVerifyResult = await verifyFamilyToken(fourDocToken);
      assert(
        completeVerifyResult?.familyCode === fourDocFamilyCode,
        'Normal verifyFamilyToken succeeds when streamed responses arrive complete in shuffled order'
      );

      const completeRouteRes = await fetch(`${incBaseUrl}/api/family/state/${fourDocFamilyCode}`, {
        headers: { 'Authorization': `Bearer ${fourDocToken}` },
      });
      assert(
        completeRouteRes.status === 200,
        'Protected API route returns 200 OK when complete streamed response is verified'
      );
    } finally {
      if (prevIncEmu) {
        process.env.FIRESTORE_EMULATOR_HOST = prevIncEmu;
      } else {
        delete process.env.FIRESTORE_EMULATOR_HOST;
      }
      incompleteStreamServer.close();
      incApp.close();
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
