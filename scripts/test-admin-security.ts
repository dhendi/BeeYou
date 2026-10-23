/**
 * Automated Security Suite: Administrative API Endpoint Protection
 *
 * Verifies:
 * 1. Unauthenticated request rejection (401 Unauthorized on all /api/admin endpoints)
 * 2. Tampered & forged token rejection (401 Unauthorized)
 * 3. Non-administrator role rejection (403 Forbidden for caregiver, child, demo, and unprivileged accounts)
 * 4. Header spoofing rejection (client cannot spoof admin via headers or query parameters)
 * 5. Authorized administrator access (200 OK with valid metrics and cache status)
 * 6. Cache maintenance protection (POST required for mutations; non-admin blocked with 403)
 * 7. Data sanitization (no internal file paths, API keys, or credentials leaked)
 */

process.env.VERCEL = '1';
process.env.NODE_ENV = 'test';
process.env.FAMILY_AUTH_SECRET = 'admin-audit-secret-salt-32-chars-long-minimum';
process.env.ADMIN_EMAILS = 'superadmin@beeyou.app,ops@beeyou.app';

import http from 'http';
import crypto from 'crypto';

async function runAdminSecuritySuite() {
  console.log('\n======================================================');
  console.log('BeeYou Administrative API Security Verification Suite');
  console.log('======================================================\n');

  const serverModule = await import('../server');
  const app = serverModule.default;
  const { signFamilyToken } = serverModule;

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Admin Test Server] Ephemeral server active on port ${port}\n`);

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
    // Suite 1: Unauthenticated Requests (401 Unauthorized)
    // -------------------------------------------------------------
    console.log('--- Suite 1: Unauthenticated Requests (401 Unauthorized) ---');

    let res = await fetch(`${baseUrl}/api/admin/usage`);
    assert(res.status === 401, 'GET /api/admin/usage without token returns 401 Unauthorized', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache-status`);
    assert(res.status === 401, 'GET /api/admin/cache-status without token returns 401 Unauthorized', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache/maintain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force: true }),
    });
    assert(res.status === 401, 'POST /api/admin/cache/maintain without token returns 401 Unauthorized', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prune: true }),
    });
    assert(res.status === 401, 'POST /api/admin/cache-status without token returns 401 Unauthorized', `got ${res.status}`);

    // -------------------------------------------------------------
    // Suite 2: Tampered & Forged Tokens (401 Unauthorized)
    // -------------------------------------------------------------
    console.log('\n--- Suite 2: Tampered & Forged Tokens (401 Unauthorized) ---');

    // Bogus string
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': 'Bearer totally-bogus-token' },
    });
    assert(res.status === 401, 'Bogus bearer token returns 401 Unauthorized', `got ${res.status}`);

    // Forged by_tok with invalid signature claiming admin role
    const forgedPayloadB64 = Buffer.from(JSON.stringify({
      familyCode: 'ADMIN',
      role: 'admin',
      email: 'attacker@evil.com',
    })).toString('base64url');
    const forgedSig = crypto.createHmac('sha256', 'wrong-secret-key').update(forgedPayloadB64).digest('base64url');
    const forgedToken = `by_tok.${forgedPayloadB64}.${forgedSig}`;

    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': `Bearer ${forgedToken}` },
    });
    assert(res.status === 401, 'Forged HMAC token claiming admin returns 401 Unauthorized', `got ${res.status}`);

    // -------------------------------------------------------------
    // Suite 3: Non-Administrator Role Denial (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- Suite 3: Non-Administrator Role Denial (403 Forbidden) ---');

    const caregiverToken = signFamilyToken('BEE-FAM1', 'caregiver', 'mom@family.com');
    const childToken = signFamilyToken('BEE-FAM1', 'child', 'child@family.com');
    const demoToken = 'by_demo_reviewer_token_2026';

    // Caregiver denial
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': `Bearer ${caregiverToken}` },
    });
    assert(res.status === 403, 'Caregiver token accessing /api/admin/usage returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      headers: { 'Authorization': `Bearer ${caregiverToken}` },
    });
    assert(res.status === 403, 'Caregiver token accessing /api/admin/cache-status returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache/maintain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${caregiverToken}`,
      },
      body: JSON.stringify({ force: true }),
    });
    assert(res.status === 403, 'Caregiver token attempting /api/admin/cache/maintain returns 403 Forbidden', `got ${res.status}`);

    // Child denial
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': `Bearer ${childToken}` },
    });
    assert(res.status === 403, 'Child token accessing /api/admin/usage returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      headers: { 'Authorization': `Bearer ${childToken}` },
    });
    assert(res.status === 403, 'Child token accessing /api/admin/cache-status returns 403 Forbidden', `got ${res.status}`);

    // Demo reviewer denial
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': `Bearer ${demoToken}` },
    });
    assert(res.status === 403, 'Demo reviewer token accessing /api/admin/usage returns 403 Forbidden', `got ${res.status}`);

    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      headers: { 'Authorization': `Bearer ${demoToken}` },
    });
    assert(res.status === 403, 'Demo reviewer token accessing /api/admin/cache-status returns 403 Forbidden', `got ${res.status}`);

    // -------------------------------------------------------------
    // Suite 4: Header Spoofing & Client-Submitted Role Denial
    // -------------------------------------------------------------
    console.log('\n--- Suite 4: Role Spoofing & Header Tampering Denial ---');

    // Caregiver sending x-role: admin header
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: {
        'Authorization': `Bearer ${caregiverToken}`,
        'x-role': 'admin',
        'x-admin': 'true',
      },
    });
    assert(res.status === 403, 'Caregiver with spoofed x-role: admin header is rejected with 403 Forbidden', `got ${res.status}`);

    // Unauthenticated request with x-admin: true header
    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: {
        'x-role': 'admin',
        'x-admin': 'true',
      },
    });
    assert(res.status === 401, 'Unauthenticated request with spoofed x-admin header returns 401', `got ${res.status}`);

    // Child sending query parameter ?role=admin
    res = await fetch(`${baseUrl}/api/admin/usage?role=admin`, {
      headers: { 'Authorization': `Bearer ${childToken}` },
    });
    assert(res.status === 403, 'Child with spoofed ?role=admin query param returns 403 Forbidden', `got ${res.status}`);

    // -------------------------------------------------------------
    // Suite 5: Authorized Administrator Access (200 OK)
    // -------------------------------------------------------------
    console.log('\n--- Suite 5: Authorized Administrator Access (200 OK) ---');

    const adminToken = signFamilyToken('ADMIN', 'admin', 'superadmin@beeyou.app');

    res = await fetch(`${baseUrl}/api/admin/usage`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'GET /api/admin/usage with valid admin token returns 200 OK', `got ${res.status}`);
    const usageData = await res.json();
    assert(usageData.success === true, 'Usage response indicates success: true');
    assert(typeof usageData.metrics?.ttsUpstreamCalls === 'number', 'Usage metrics include ttsUpstreamCalls');
    assert(typeof usageData.metrics?.translateUpstreamCalls === 'number', 'Usage metrics include translateUpstreamCalls');

    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'GET /api/admin/cache-status with valid admin token returns 200 OK', `got ${res.status}`);
    const cacheData = await res.json();
    assert(cacheData.success === true, 'Cache status response indicates success: true');
    assert(cacheData.cache?.status === 'VERIFIED_READY', 'Cache status is VERIFIED_READY');

    // -------------------------------------------------------------
    // Suite 6: State-Changing Maintenance vs Read-Only Diagnostics
    // -------------------------------------------------------------
    console.log('\n--- Suite 6: Cache Maintenance Operations Protection ---');

    // GET /api/admin/cache-status with prune/force query params does NOT perform mutation on GET
    res = await fetch(`${baseUrl}/api/admin/cache-status?prune=true&force=true`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'GET /api/admin/cache-status returns 200 OK');
    const getResult = await res.json();
    assert(getResult.action === undefined, 'GET endpoint is read-only diagnostics (no action executed)');

    // POST /api/admin/cache/maintain with admin token performs maintenance
    res = await fetch(`${baseUrl}/api/admin/cache/maintain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ force: true, prune: true }),
    });
    assert(res.status === 200, 'POST /api/admin/cache/maintain returns 200 OK', `got ${res.status}`);
    const postMaintain = await res.json();
    assert(postMaintain.success === true, 'Maintenance response success is true');
    assert(postMaintain.action === 'enforced_maintenance', 'Maintenance action confirmed as enforced_maintenance');
    assert(typeof postMaintain.maintenance?.scannedFiles === 'number', 'Maintenance reports scanned files count');

    // POST /api/admin/cache-status compatibility endpoint
    res = await fetch(`${baseUrl}/api/admin/cache-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ prune: true }),
    });
    assert(res.status === 200, 'POST /api/admin/cache-status returns 200 OK', `got ${res.status}`);

    // -------------------------------------------------------------
    // Suite 7: Data Sanitization & Credential Protection
    // -------------------------------------------------------------
    console.log('\n--- Suite 7: Data Sanitization & Credential Protection ---');

    const rawUsageStr = JSON.stringify(usageData);
    assert(!rawUsageStr.includes('GEMINI_API_KEY'), 'Usage response does not leak GEMINI_API_KEY');
    assert(!rawUsageStr.includes('FIREBASE_API_KEY'), 'Usage response does not leak FIREBASE_API_KEY');
    assert(!rawUsageStr.includes('FAMILY_AUTH_SECRET'), 'Usage response does not leak FAMILY_AUTH_SECRET');

    const rawCacheStr = JSON.stringify(cacheData);
    assert(cacheData.cache?.path === undefined, 'Cache status response strips internal absolute disk path');
    assert(!rawCacheStr.includes('C:\\'), 'Cache status does not leak local Windows filesystem path');

  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`Admin Security Verification: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminSecuritySuite().catch((err) => {
  console.error('Fatal error during admin security suite:', err);
  process.exit(1);
});
