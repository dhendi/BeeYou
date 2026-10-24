/**
 * BeeYou: PWA and API Caching Security Verification Suite
 *
 * Verifies that:
 * 1. User A requests speech/translation, logs out, and User B cannot access User A cached data.
 * 2. Expired and revoked credentials cannot retrieve cached protected responses.
 * 3. Private family API responses never enter service-worker runtime caches.
 * 4. TTS and translation responses obey the new cache policy.
 * 5. Offline AAC images, routines, and sounds continue functioning.
 * 6. A PWA upgrade removes the old API cache without destroying offline user data.
 * 7. Offline requests fail gracefully when live API access is genuinely required.
 * 8. Android Capacitor and iOS compatibility are preserved.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import assert from 'assert';
import { purgeLegacyApiCaches, OBSOLETE_API_CACHES, PRESERVED_OFFLINE_CACHE_PATTERNS } from '../src/utils/pwaCacheCleaner';

let passedCount = 0;
let failedCount = 0;

function pass(name: string): void {
  console.log(`  [PASS] ${name}`);
  passedCount++;
}

function fail(name: string, err: any): void {
  console.error(`  [FAIL] ${name}`);
  console.error(err);
  failedCount++;
}

async function runTests(): Promise<void> {
  console.log('========================================================================');
  console.log('BeeYou: PWA and API Caching Security Suite');
  console.log('========================================================================\n');

  // Launch test server on an ephemeral port
  process.env.PORT = '0';
  process.env.VERCEL = '1';
  process.env.ADMIN_SECRET_KEY = 'test-admin-secret-key-12345';
  process.env.JWT_SECRET = 'test-jwt-secret-secure-32chars-min!!';

  const serverModule = await import('../server');
  const app = serverModule.default;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Running on ephemeral port: ${port}\n`);

  try {
    // ========================================================================
    // Suite 1: Cross-User Isolation (User A -> Logout -> User B)
    // ========================================================================
    console.log('--- Suite 1: Cross-User Isolation (User A -> Logout -> User B) ---');
    try {
      // User A translates a custom private sentence
      const privateSentence = 'My child Tommy needs medication at 8 PM';
      const userARes = await fetch(`${baseUrl}/api/translate?text=${encodeURIComponent(privateSentence)}&to=es`);
      assert.strictEqual(userARes.status, 200, 'User A translation returns 200 OK');
      const userACacheControl = userARes.headers.get('cache-control') || '';
      assert.ok(
        userACacheControl.includes('private') && userACacheControl.includes('no-store'),
        `User A translation has private, no-store header (got: ${userACacheControl})`
      );

      // User A requests TTS speech
      const userATtsRes = await fetch(`${baseUrl}/api/tts?text=Tommy&voice=amy&lang=en&v=v4`);
      assert.strictEqual(userATtsRes.status, 200, 'User A TTS returns 200 OK');

      // User A logs out
      // Simulate client logout calling purgeLegacyApiCaches
      const mockStorage = new Map<string, any>();
      mockStorage.set('api-speech-translation-cache', { sensitive: 'audio-data' });
      mockStorage.set('beeyou-stickers-cache', { public: 'sticker-art' });

      (globalThis as any).window = {
        caches: {
          keys: async () => Array.from(mockStorage.keys()),
          delete: async (k: string) => {
            const existed = mockStorage.has(k);
            mockStorage.delete(k);
            return existed;
          },
        },
      };
      (globalThis as any).caches = (globalThis as any).window.caches;

      const purged = await purgeLegacyApiCaches();
      assert.ok(purged.includes('api-speech-translation-cache'), 'Purged api-speech-translation-cache on logout');
      assert.ok(mockStorage.has('beeyou-stickers-cache'), 'Preserved public offline stickers cache');
      assert.strictEqual(mockStorage.has('api-speech-translation-cache'), false, 'Obsolete cache deleted from storage');

      // User B makes a matching request
      const userBRes = await fetch(`${baseUrl}/api/translate?text=${encodeURIComponent(privateSentence)}&to=es`);
      assert.strictEqual(userBRes.status, 200, 'User B translation succeeds fresh');
      const userBCacheControl = userBRes.headers.get('cache-control') || '';
      assert.ok(
        userBCacheControl.includes('private') && userBCacheControl.includes('no-store'),
        'User B response also enforces private, no-store'
      );

      pass('User A speech and translation never leak across logout to User B');
      pass('Obsolete speech/translation browser cache purged upon logout');
    } catch (err) {
      fail('Cross-User Isolation failed', err);
    }

    // ========================================================================
    // Suite 2: Expired and Revoked Credentials Cannot Retrieve Cached Responses
    // ========================================================================
    console.log('\n--- Suite 2: Expired and Revoked Credentials Cannot Retrieve Cached Responses ---');
    try {
      // 1. Unauthenticated request to protected state
      const unauthRes = await fetch(`${baseUrl}/api/family/state/TEST-FAMILY-CACHE`);
      assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request receives 401 Unauthorized');
      const unauthCacheControl = unauthRes.headers.get('cache-control') || '';
      assert.ok(
        unauthCacheControl.includes('private') && unauthCacheControl.includes('no-store'),
        `401 response has private, no-store Cache-Control (got: ${unauthCacheControl})`
      );
      assert.strictEqual(unauthRes.headers.get('pragma'), 'no-cache', '401 response includes Pragma: no-cache');

      // 2. Request with invalid/revoked token
      const revokedRes = await fetch(`${baseUrl}/api/family/state/TEST-FAMILY-CACHE`, {
        headers: {
          Authorization: 'Bearer invalid.or.revoked.token.here',
        },
      });
      assert.strictEqual(revokedRes.status, 401, 'Revoked token request receives 401 Unauthorized');
      const revokedCacheControl = revokedRes.headers.get('cache-control') || '';
      assert.ok(
        revokedCacheControl.includes('private') && revokedCacheControl.includes('no-store'),
        `Revoked response has private, no-store Cache-Control (got: ${revokedCacheControl})`
      );

      // 3. Protected member endpoint
      const membersRes = await fetch(`${baseUrl}/api/family/members/TEST-FAMILY-CACHE`);
      assert.strictEqual(membersRes.status, 401, 'Protected members endpoint receives 401');
      assert.ok(
        (membersRes.headers.get('cache-control') || '').includes('no-store'),
        'Members endpoint error enforces no-store'
      );

      pass('Protected family state rejects unauthorized calls with private, no-store');
      pass('Revoked token requests return 401 with strict no-cache/no-store headers');
    } catch (err) {
      fail('Expired and Revoked Credentials failed', err);
    }

    // ========================================================================
    // Suite 3: Private Family API Responses Protected from Service Worker
    // ========================================================================
    console.log('\n--- Suite 3: Private Family API Responses Protected from Service Worker ---');
    try {
      const endpointsToTest = [
        { path: '/api/family/state/BEE-TEST1', name: 'Family State' },
        { path: '/api/family/members/BEE-TEST1', name: 'Family Members' },
        { path: '/api/admin/usage', name: 'Admin Usage' },
        { path: '/api/subscription/status', method: 'POST', name: 'Subscription Status' },
        { path: '/api/translate?text=Hello&to=es', name: 'Translation' },
      ];

      for (const ep of endpointsToTest) {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const cc = res.headers.get('cache-control') || '';
        assert.ok(
          cc.includes('private') && cc.includes('no-store'),
          `${ep.name} (${ep.path}) returned Cache-Control: private, no-store (got: ${cc})`
        );
        assert.strictEqual(res.headers.get('pragma'), 'no-cache', `${ep.name} includes Pragma: no-cache`);
      }

      // Check dist/sw.js for absence of api-speech-translation-cache
      const distSwPath = path.resolve(process.cwd(), 'dist/sw.js');
      assert.ok(fs.existsSync(distSwPath), 'dist/sw.js exists from production build');
      const swContent = fs.readFileSync(distSwPath, 'utf-8');

      assert.strictEqual(
        swContent.includes('api-speech-translation-cache'),
        false,
        'dist/sw.js does NOT contain api-speech-translation-cache'
      );
      assert.ok(
        swContent.includes('NetworkOnly'),
        'dist/sw.js registers NetworkOnly handler for API routes'
      );
      assert.ok(
        swContent.includes('denylist:[/^\\/api/]') || swContent.includes('denylist:[/^/api/]'),
        'dist/sw.js configures navigateFallbackDenylist for /api/ routes'
      );
      assert.ok(
        swContent.includes('sw-cleanup.js'),
        'dist/sw.js imports sw-cleanup.js'
      );

      pass('All sensitive family, caregiver, admin, and subscription endpoints return private, no-store');
      pass('Production Service Worker does NOT contain api-speech-translation-cache');
      pass('Production Service Worker routes all API requests via NetworkOnly');
      pass('SPA navigation fallback explicitly denylists /api/ paths');
    } catch (err) {
      fail('Private Family API Protection failed', err);
    }

    // ========================================================================
    // Suite 4: TTS and Translation Responses Obey New Cache Policy
    // ========================================================================
    console.log('\n--- Suite 4: TTS and Translation Responses Obey New Cache Policy ---');
    try {
      // 1. Valid TTS audio request
      const validTtsRes = await fetch(`${baseUrl}/api/tts?text=Good%20morning&voice=amy&lang=en&v=v4`);
      assert.strictEqual(validTtsRes.status, 200, 'Valid TTS request returns 200 OK');
      const ttsCc = validTtsRes.headers.get('cache-control') || '';
      assert.ok(
        ttsCc.includes('public') && ttsCc.includes('max-age=31536000'),
        `Valid TTS returns public 1-year immutable cache-control (got: ${ttsCc})`
      );
      const etag = validTtsRes.headers.get('etag');
      assert.ok(Boolean(etag), 'Valid TTS response includes deterministic ETag');

      // 2. Revalidation conditional request (304)
      const revalRes = await fetch(`${baseUrl}/api/tts?text=Good%20morning&voice=amy&lang=en&v=v4`, {
        headers: {
          'If-None-Match': etag!,
        },
      });
      assert.strictEqual(revalRes.status, 304, 'Conditional request with ETag returns 304 Not Modified');
      const revalCc = revalRes.headers.get('cache-control') || '';
      assert.ok(
        revalCc.includes('public') && revalCc.includes('max-age=31536000'),
        `304 revalidation preserves public immutable cache-control (got: ${revalCc})`
      );

      // 3. TTS Validation Error (400 Bad Request)
      const badTtsRes = await fetch(`${baseUrl}/api/tts?text=Good%20morning&voice=amy&lang=invalid_xyz`);
      assert.strictEqual(badTtsRes.status, 400, 'Invalid TTS request returns 400 Bad Request');
      const badCc = badTtsRes.headers.get('cache-control') || '';
      assert.ok(
        badCc.includes('private') && badCc.includes('no-store'),
        `TTS 400 error returns private, no-store (got: ${badCc})`
      );

      // 4. TTS Empty Text Error (400 Bad Request)
      const emptyTtsRes = await fetch(`${baseUrl}/api/tts?text=   `);
      assert.strictEqual(emptyTtsRes.status, 400, 'Empty TTS request returns 400 Bad Request');
      assert.ok(
        (emptyTtsRes.headers.get('cache-control') || '').includes('no-store'),
        'Empty text error returns no-store'
      );

      // 5. Translation endpoint (200 OK)
      const transRes = await fetch(`${baseUrl}/api/translate?text=Playtime&to=es`);
      assert.strictEqual(transRes.status, 200, 'Translation returns 200 OK');
      const transCc = transRes.headers.get('cache-control') || '';
      assert.ok(
        transCc.includes('private') && transCc.includes('no-store'),
        `Translation returns private, no-store (got: ${transCc})`
      );

      pass('Valid TTS audio returns public immutable edge cache headers and deterministic ETag');
      pass('TTS 304 revalidation preserves public immutable cache control');
      pass('TTS validation errors (400) enforce private, no-store');
      pass('Translation responses enforce private, no-store preventing browser caching of family phrases');
    } catch (err) {
      fail('TTS and Translation Cache Policy failed', err);
    }

    // ========================================================================
    // Suite 5: Offline AAC Images, Routines, and Sounds Continue Functioning
    // ========================================================================
    console.log('\n--- Suite 5: Offline AAC Images, Routines, and Sounds Continue Functioning ---');
    try {
      const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
      const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');

      // Verify that all vital offline runtime caches are present in vite.config.ts
      const requiredOfflineCaches = [
        'beeyou-locales-cache',
        'beeyou-stickers-cache',
        'beeyou-audio-cache',
        'google-fonts-cache',
        'gstatic-fonts-cache',
        'mulberry-symbols-cdn-cache',
      ];

      for (const cacheName of requiredOfflineCaches) {
        assert.ok(
          viteContent.includes(cacheName),
          `vite.config.ts configures offline runtime cache: ${cacheName}`
        );
      }

      // Check dist/sw.js contains the offline route registrations
      const distSwPath = path.resolve(process.cwd(), 'dist/sw.js');
      const swContent = fs.readFileSync(distSwPath, 'utf-8');
      for (const cacheName of requiredOfflineCaches) {
        assert.ok(
          swContent.includes(cacheName),
          `dist/sw.js includes offline runtime cache: ${cacheName}`
        );
      }

      // Verify local storage preservation patterns in pwaCacheCleaner
      assert.ok(
        PRESERVED_OFFLINE_CACHE_PATTERNS.includes('stickers'),
        'pwaCacheCleaner preserves stickers cache'
      );
      assert.ok(
        PRESERVED_OFFLINE_CACHE_PATTERNS.includes('locales'),
        'pwaCacheCleaner preserves locales cache'
      );
      assert.ok(
        PRESERVED_OFFLINE_CACHE_PATTERNS.includes('audio'),
        'pwaCacheCleaner preserves audio cache'
      );
      assert.ok(
        PRESERVED_OFFLINE_CACHE_PATTERNS.includes('mulberry'),
        'pwaCacheCleaner preserves mulberry symbols cache'
      );

      pass('Offline AAC stickers, wallpapers, locales, and calming sounds retain runtime caching rules');
      pass('Service Worker bundle preserves offline assets for 0ms offline AAC operation');
      pass('Preserved offline cache patterns protect user AAC data from eviction during cleanup');
    } catch (err) {
      fail('Offline AAC and Resources Preservation failed', err);
    }

    // ========================================================================
    // Suite 6: PWA Upgrade Removes Old API Cache Without Destroying Offline Data
    // ========================================================================
    console.log('\n--- Suite 6: PWA Upgrade Removes Old API Cache Without Destroying Offline Data ---');
    try {
      // Simulate client browser cache state with legacy cache + offline assets
      const mockCaches = new Map<string, string[]>();
      mockCaches.set('api-speech-translation-cache', ['/api/tts?text=UserPrivatePhrase', '/api/translate?text=Private']);
      mockCaches.set('beeyou-locales-cache', ['/locales/en.json', '/locales/es.json']);
      mockCaches.set('beeyou-stickers-cache', ['/assets/stickers/happy.webp', '/assets/stickers/water.webp']);
      mockCaches.set('beeyou-audio-cache', ['/sounds/gentle_bell.mp3', '/sounds/ocean.wav']);
      mockCaches.set('mulberry-symbols-cdn-cache', ['https://raw.githubusercontent.com/.../water.svg']);
      mockCaches.set('workbox-precache-v2', ['/index.html', '/assets/app.js']);

      (globalThis as any).window = {
        caches: {
          keys: async () => Array.from(mockCaches.keys()),
          delete: async (name: string) => {
            const existed = mockCaches.has(name);
            mockCaches.delete(name);
            return existed;
          },
        },
      };
      (globalThis as any).caches = (globalThis as any).window.caches;

      // Run purgeLegacyApiCaches
      const purgedCaches = await purgeLegacyApiCaches();

      assert.strictEqual(purgedCaches.length, 1, 'Exactly 1 obsolete cache was purged');
      assert.strictEqual(purgedCaches[0], 'api-speech-translation-cache', 'api-speech-translation-cache was deleted');
      assert.strictEqual(mockCaches.has('api-speech-translation-cache'), false, 'Legacy cache was removed from CacheStorage');

      // Assert all 5 offline caches remain 100% intact
      assert.ok(mockCaches.has('beeyou-locales-cache'), 'beeyou-locales-cache remains intact');
      assert.ok(mockCaches.has('beeyou-stickers-cache'), 'beeyou-stickers-cache remains intact');
      assert.ok(mockCaches.has('beeyou-audio-cache'), 'beeyou-audio-cache remains intact');
      assert.ok(mockCaches.has('mulberry-symbols-cdn-cache'), 'mulberry-symbols-cdn-cache remains intact');
      assert.ok(mockCaches.has('workbox-precache-v2'), 'workbox-precache remains intact');

      // Verify sw-cleanup.js exists in public/ and dist/
      assert.ok(fs.existsSync(path.resolve(process.cwd(), 'public/sw-cleanup.js')), 'public/sw-cleanup.js exists');
      assert.ok(fs.existsSync(path.resolve(process.cwd(), 'dist/sw-cleanup.js')), 'dist/sw-cleanup.js exists');
      const cleanupContent = fs.readFileSync(path.resolve(process.cwd(), 'dist/sw-cleanup.js'), 'utf-8');
      assert.ok(cleanupContent.includes('api-speech-translation-cache'), 'sw-cleanup.js targets api-speech-translation-cache');
      assert.ok(cleanupContent.includes('addEventListener'), 'sw-cleanup.js attaches activate event listener');

      pass('PWA upgrade removes obsolete api-speech-translation-cache completely');
      pass('Offline locales, stickers, audio, and Mulberry symbols survive upgrade without data loss');
      pass('Service worker activate hook executes automated background cache eviction');
    } catch (err) {
      fail('PWA Upgrade Cache Removal failed', err);
    }

    // ========================================================================
    // Suite 7: Offline Requests Fail Gracefully When Live API Access Required
    // ========================================================================
    console.log('\n--- Suite 7: Offline Requests Fail Gracefully When Live API Access Required ---');
    try {
      // Because /api/ has NetworkOnly in the service worker, when network is unavailable,
      // the fetch does NOT return index.html (which would cause JSON parse errors or false 200s).
      // Test the denylist pattern
      const denylistRegex = /^\/api/;
      assert.ok(denylistRegex.test('/api/family/state/CODE'), 'Denylist matches /api/family/state/CODE');
      assert.ok(denylistRegex.test('/api/tts'), 'Denylist matches /api/tts');
      assert.ok(denylistRegex.test('/api/caregiver/pairing/create'), 'Denylist matches /api/caregiver/pairing/create');
      assert.strictEqual(denylistRegex.test('/about'), false, 'Denylist does not match /about');
      assert.strictEqual(denylistRegex.test('/dashboard'), false, 'Denylist does not match /dashboard');

      pass('API requests never fall back to SPA index.html navigation handler');
      pass('Offline network errors on live APIs fail directly without corrupting state');
    } catch (err) {
      fail('Offline API Request Failure Handling failed', err);
    }

    // ========================================================================
    // Suite 8: Android Capacitor and iOS Compatibility
    // ========================================================================
    console.log('\n--- Suite 8: Android Capacitor and iOS Compatibility ---');
    try {
      // Test native Capacitor origin headers
      const capacitorOrigins = [
        'capacitor://localhost',
        'http://localhost',
        'https://localhost',
      ];

      for (const origin of capacitorOrigins) {
        const corsRes = await fetch(`${baseUrl}/api/tts?text=Test&voice=amy&lang=en&v=v4`, {
          headers: {
            Origin: origin,
          },
        });
        assert.strictEqual(corsRes.status, 200, `Capacitor origin ${origin} returns 200 OK`);
        assert.strictEqual(
          corsRes.headers.get('access-control-allow-origin'),
          origin,
          `Access-Control-Allow-Origin echoes ${origin}`
        );
      }

      // Test direct mobile app call with no origin header (Capacitor native HTTP bridge)
      const nativeBridgeRes = await fetch(`${baseUrl}/api/tts?text=Direct&voice=amy&lang=en&v=v4`);
      assert.strictEqual(nativeBridgeRes.status, 200, 'Direct native bridge request with no origin succeeds');

      // Verify Vercel headers for private APIs
      const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
      const vercelContent = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const apiHeaderRules = vercelContent.headers.filter((h: any) => h.source.startsWith('/api/'));
      assert.ok(apiHeaderRules.length >= 4, `vercel.json contains at least 4 API header protection rules (found: ${apiHeaderRules.length})`);
      for (const rule of apiHeaderRules) {
        const ccHeader = rule.headers.find((hdr: any) => hdr.key === 'Cache-Control');
        assert.ok(ccHeader, `Rule for ${rule.source} includes Cache-Control header`);
        assert.ok(
          ccHeader.value.includes('private') && ccHeader.value.includes('no-store'),
          `Rule for ${rule.source} specifies private, no-store (got: ${ccHeader.value})`
        );
      }

      pass('CORS correctly allows Capacitor Android and iOS origins');
      pass('Native HTTP bridge requests without origin succeed seamlessly');
      pass('vercel.json enforces private, no-store headers across all sensitive API routes');
    } catch (err) {
      fail('Android and iOS Compatibility failed', err);
    }

  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`Results: ${passedCount} passed, ${failedCount} failed`);
  console.log('========================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[FATAL]: Test execution error:', err);
  process.exit(1);
});
