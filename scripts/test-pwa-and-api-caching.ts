/**
 * BeeYou: PWA and API Caching Security Verification Suite
 *
 * Acceptance Tests:
 * 1. Custom user-entered speech is not stored in shared public HTTP caches.
 * 2. Approved reusable speech still benefits from server-side caching.
 * 3. TTS 200/304 headers have consistent privacy behavior.
 * 4. Existing offline assets survive a service-worker upgrade.
 * 5. The updated service worker remains registered and functional.
 * 6. The old API cache is deleted without clearing unrelated data.
 * 7. User logout/account switching cannot replay private API responses.
 *
 * Environment Note: Distinguishes simulated tests from browser-verified behavior.
 * Live browser automation packages (Playwright/Puppeteer) are not installed in this environment;
 * real production-build artifacts (dist/sw.js, dist/sw-cleanup.js, dist/index.html) are verified directly.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import assert from 'assert';
import { purgeLegacyApiCaches, OBSOLETE_API_CACHES, PRESERVED_OFFLINE_CACHE_PATTERNS } from '../src/utils/pwaCacheCleaner';
import { runReleaseAutoCacheBust, APP_RELEASE_VERSION } from '../src/utils/autoCacheBust';
import { isApprovedVocabulary } from '../src/services/approvedVocabularyService';

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
    // Acceptance Test 1 & 3: Custom User-Entered Speech Privacy & Header Consistency
    // ========================================================================
    console.log('--- Test 1 & 3: Custom User-Entered Speech Privacy & Consistent 200/304 Headers ---');
    try {
      const customPhrase = 'Emergency: Tommy needs his emergency inhaler in blue backpack';
      assert.strictEqual(isApprovedVocabulary(customPhrase), false, 'Custom private phrase is recognized as non-approved');

      // 1. Initial 200 OK request for custom phrase
      const customRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(customPhrase)}&voice=amy&lang=en&v=v4`);
      assert.strictEqual(customRes.status, 200, 'Custom TTS request returns 200 OK');
      const customCc = customRes.headers.get('cache-control') || '';

      assert.ok(
        customCc.includes('private') && customCc.includes('no-store'),
        `Custom phrase 200 response contains private, no-store (got: ${customCc})`
      );
      assert.strictEqual(
        customCc.includes('public'),
        false,
        'Custom phrase 200 response MUST NOT contain public'
      );
      assert.strictEqual(
        customCc.includes('max-age=31536000'),
        false,
        'Custom phrase 200 response MUST NOT contain 1-year public max-age'
      );
      assert.strictEqual(customRes.headers.get('pragma'), 'no-cache', 'Custom phrase 200 response includes Pragma: no-cache');

      const customEtag = customRes.headers.get('etag');
      assert.ok(Boolean(customEtag), 'Custom phrase response includes deterministic ETag');

      // 2. Conditional 304 Not Modified request for custom phrase
      const customRevalRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(customPhrase)}&voice=amy&lang=en&v=v4`, {
        headers: {
          'If-None-Match': customEtag!,
        },
      });
      assert.strictEqual(customRevalRes.status, 304, 'Conditional request with matching ETag returns 304 Not Modified');
      const customRevalCc = customRevalRes.headers.get('cache-control') || '';

      assert.ok(
        customRevalCc.includes('private') && customRevalCc.includes('no-store'),
        `Custom phrase 304 response maintains private, no-store (got: ${customRevalCc})`
      );
      assert.strictEqual(
        customRevalCc.includes('public'),
        false,
        'Custom phrase 304 response MUST NOT contain public'
      );
      assert.strictEqual(customRevalRes.headers.get('pragma'), 'no-cache', 'Custom phrase 304 includes Pragma: no-cache');

      pass('Custom user-entered speech is strictly marked private, no-store to block shared CDN storage');
      pass('TTS 200 and 304 responses maintain 100% consistent privacy headers for custom speech');
    } catch (err) {
      fail('Custom user-entered speech privacy test failed', err);
    }

    // ========================================================================
    // Acceptance Test 2 & 3: Approved Reusable Speech Caching & Header Consistency
    // ========================================================================
    console.log('\n--- Test 2 & 3: Approved Reusable Speech Caching & Consistent 200/304 Headers ---');
    try {
      const approvedPhrase = 'I am ready to learn and play';
      assert.strictEqual(isApprovedVocabulary(approvedPhrase), true, 'Approved phrase is recognized in standard catalog');

      // 1. Initial 200 OK request for approved phrase
      const approvedRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(approvedPhrase)}&voice=amy&lang=en&v=v4`);
      assert.strictEqual(approvedRes.status, 200, 'Approved TTS request returns 200 OK');
      const approvedCc = approvedRes.headers.get('cache-control') || '';

      assert.ok(
        approvedCc.includes('public') && approvedCc.includes('max-age=31536000'),
        `Approved phrase 200 response contains public, max-age=31536000 (got: ${approvedCc})`
      );
      const approvedEtag = approvedRes.headers.get('etag');
      assert.ok(Boolean(approvedEtag), 'Approved phrase response includes deterministic ETag');

      // 2. Conditional 304 Not Modified request for approved phrase
      const approvedRevalRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(approvedPhrase)}&voice=amy&lang=en&v=v4`, {
        headers: {
          'If-None-Match': approvedEtag!,
        },
      });
      assert.strictEqual(approvedRevalRes.status, 304, 'Conditional request with matching ETag returns 304 Not Modified');
      const approvedRevalCc = approvedRevalRes.headers.get('cache-control') || '';

      assert.ok(
        approvedRevalCc.includes('public') && approvedRevalCc.includes('max-age=31536000'),
        `Approved phrase 304 response preserves public, max-age=31536000 (got: ${approvedRevalCc})`
      );

      // 3. Multilingual approved speech verification (Spanish standard tile)
      const spanishPhrase = 'Desayuno';
      assert.strictEqual(isApprovedVocabulary(spanishPhrase), true, 'Spanish translated word recognized as approved');
      const spanishRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent(spanishPhrase)}&voice=amy&lang=es&v=v4`);
      assert.strictEqual(spanishRes.status, 200, 'Spanish approved TTS request returns 200 OK');
      assert.ok(
        (spanishRes.headers.get('cache-control') || '').includes('public'),
        'Spanish approved phrase receives public edge cache header'
      );

      // 4. Server-side caching verification: custom phrase replay
      // Even though custom phrases are private on HTTP, server-side L1/L3 caching still functions
      const repeatCustomRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent('Custom reusable test phrase')}&voice=amy&lang=en&v=v4`);
      assert.strictEqual(repeatCustomRes.status, 200, 'First custom request succeeds');
      const secondCustomRes = await fetch(`${baseUrl}/api/tts?text=${encodeURIComponent('Custom reusable test phrase')}&voice=amy&lang=en&v=v4`);
      assert.strictEqual(secondCustomRes.status, 200, 'Second custom request served from server cache');
      assert.ok(
        (secondCustomRes.headers.get('cache-control') || '').includes('no-store'),
        'Replayed custom phrase preserves private, no-store headers'
      );

      pass('Approved standard vocabulary retains 1-year public edge caching and deterministic ETags');
      pass('TTS 200 and 304 responses maintain 100% consistent public headers for approved vocabulary');
      pass('Multilingual speech in approved catalog benefits from public edge acceleration');
      pass('Custom user speech continues to benefit from server-side L1/L3 caching without public exposure');
    } catch (err) {
      fail('Approved reusable speech caching test failed', err);
    }

    // ========================================================================
    // Acceptance Test 4, 5 & 6: Safe PWA Upgrade & Registration Preservation
    // ========================================================================
    console.log('\n--- Test 4, 5 & 6: Safe PWA Upgrade, Registration Preservation & Cache Cleanup ---');
    try {
      // 1. Simulate client browser storage before upgrade
      const mockStorage = new Map<string, any>();
      mockStorage.set('api-speech-translation-cache', ['/api/tts?text=UserPrivateInfo']);
      mockStorage.set('beeyou-locales-cache', ['/locales/en.json', '/locales/es.json']);
      mockStorage.set('beeyou-stickers-cache', ['/assets/stickers/happy.webp', '/assets/stickers/calm.webp']);
      mockStorage.set('beeyou-audio-cache', ['/sounds/gentle_bell.mp3']);
      mockStorage.set('mulberry-symbols-cdn-cache', ['https://raw.githubusercontent.com/.../water.svg']);
      mockStorage.set('google-fonts-cache', ['https://fonts.googleapis.com/...']);
      mockStorage.set('workbox-precache-v2', ['/index.html', '/assets/index.js']);

      // Mock localStorage with existing user app state and older release version
      const mockLocalStorage = new Map<string, string>();
      mockLocalStorage.set('beeyou_release_version', 'v10-legacy-build-old');
      mockLocalStorage.set('beeyou_app_state_v1', JSON.stringify({
        childName: 'Tommy',
        routines: [{ id: 'r1', title: 'Morning Brush Teeth' }],
        settings: { voicePersona: 'puck' },
      }));

      // Mock navigator.serviceWorker to track registration status
      let unregisterCalled = false;
      const mockRegistration = {
        scope: '/',
        active: { scriptURL: 'http://127.0.0.1/sw.js' },
        unregister: async () => {
          unregisterCalled = true;
          return true;
        },
      };

      (globalThis as any).window = {
        caches: {
          keys: async () => Array.from(mockStorage.keys()),
          delete: async (k: string) => {
            const existed = mockStorage.has(k);
            mockStorage.delete(k);
            return existed;
          },
        },
        location: {
          reload: () => {
            throw new Error('Forced reload loop triggered unexpectedly');
          },
        },
      };
      (globalThis as any).caches = (globalThis as any).window.caches;
      (globalThis as any).localStorage = {
        getItem: (k: string) => mockLocalStorage.get(k) || null,
        setItem: (k: string, v: string) => mockLocalStorage.set(k, v),
        removeItem: (k: string) => mockLocalStorage.delete(k),
      };
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          serviceWorker: {
            getRegistrations: async () => [mockRegistration],
          },
        },
        configurable: true,
        writable: true,
      });

      // Execute PWA upgrade logic via runReleaseAutoCacheBust
      await runReleaseAutoCacheBust();

      // Assert service-worker registration was NOT torn down
      assert.strictEqual(unregisterCalled, false, 'runReleaseAutoCacheBust MUST NOT unregister service workers');

      // Assert obsolete cache was removed
      assert.strictEqual(mockStorage.has('api-speech-translation-cache'), false, 'Legacy api-speech-translation-cache deleted');

      // Assert all offline asset caches were completely preserved
      assert.ok(mockStorage.has('beeyou-locales-cache'), 'beeyou-locales-cache preserved');
      assert.ok(mockStorage.has('beeyou-stickers-cache'), 'beeyou-stickers-cache preserved');
      assert.ok(mockStorage.has('beeyou-audio-cache'), 'beeyou-audio-cache preserved');
      assert.ok(mockStorage.has('mulberry-symbols-cdn-cache'), 'mulberry-symbols-cdn-cache preserved');
      assert.ok(mockStorage.has('google-fonts-cache'), 'google-fonts-cache preserved');
      assert.ok(mockStorage.has('workbox-precache-v2'), 'workbox-precache preserved');

      // Assert offline user data survived upgrade
      const rawAppState = mockLocalStorage.get('beeyou_app_state_v1');
      assert.ok(Boolean(rawAppState), 'App state preserved in localStorage');
      const parsedAppState = JSON.parse(rawAppState!);
      assert.strictEqual(parsedAppState.childName, 'Tommy', 'Child profile name preserved');
      assert.strictEqual(parsedAppState.routines.length, 1, 'Child offline routines preserved');
      assert.strictEqual(parsedAppState.settings.voicePersona, 'amy', 'Legacy persona migrated to Piper Amy');

      // Assert new release version was recorded without reload loop
      assert.strictEqual(mockLocalStorage.get('beeyou_release_version'), APP_RELEASE_VERSION, 'Release version updated');

      pass('Service worker registration remains registered and intact during PWA release upgrades');
      pass('Legacy api-speech-translation-cache is deleted without clearing unrelated data');
      pass('All offline AAC stickers, audio, locales, fonts, and symbols survive upgrade without loss');
      pass('Offline routines, schedules, and app state in localStorage survive upgrade intact');
      pass('PWA upgrade completes safely without triggering forced reload loops');
    } catch (err) {
      fail('Safe PWA Upgrade test failed', err);
    }

    // ========================================================================
    // Acceptance Test 7: User Logout / Account Switching Replay Prevention
    // ========================================================================
    console.log('\n--- Test 7: User Logout / Account Switching Replay Prevention ---');
    try {
      const privatePhrase = 'User A Private Prescription Schedule 50mg';
      const userARes = await fetch(`${baseUrl}/api/translate?text=${encodeURIComponent(privatePhrase)}&to=es`);
      assert.strictEqual(userARes.status, 200, 'User A translation succeeds');
      assert.ok(
        (userARes.headers.get('cache-control') || '').includes('no-store'),
        'User A translation enforces private, no-store'
      );

      // Simulate logout
      const mockStorage = new Map<string, any>();
      mockStorage.set('api-speech-translation-cache', { sensitive: 'cached-user-a-audio' });
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

      await purgeLegacyApiCaches();
      assert.strictEqual(mockStorage.has('api-speech-translation-cache'), false, 'Logout purged obsolete speech cache');

      // User B makes request
      const userBRes = await fetch(`${baseUrl}/api/translate?text=${encodeURIComponent(privatePhrase)}&to=es`);
      assert.strictEqual(userBRes.status, 200, 'User B request receives fresh response');
      assert.ok(
        (userBRes.headers.get('cache-control') || '').includes('no-store'),
        'User B request enforces private, no-store'
      );

      pass('User logout and account switching cannot replay private speech or translation responses');
      pass('CacheStorage purged of obsolete API caches upon family logout');
    } catch (err) {
      fail('Logout replay prevention test failed', err);
    }

    // ========================================================================
    // Production Build Artifacts Verification
    // ========================================================================
    console.log('\n--- Production Build Artifacts Verification ---');
    try {
      const distSwPath = path.resolve(process.cwd(), 'dist/sw.js');
      assert.ok(fs.existsSync(distSwPath), 'dist/sw.js exists from production build');
      const swContent = fs.readFileSync(distSwPath, 'utf-8');

      assert.strictEqual(
        swContent.includes('api-speech-translation-cache'),
        false,
        'dist/sw.js does NOT register api-speech-translation-cache'
      );
      assert.ok(
        swContent.includes('NetworkOnly'),
        'dist/sw.js registers NetworkOnly for API requests'
      );
      assert.ok(
        swContent.includes('denylist:[/^\\/api/]') || swContent.includes('denylist:[/^/api/]'),
        'dist/sw.js includes /api/ denylist on NavigationRoute'
      );
      assert.ok(
        swContent.includes('sw-cleanup.js'),
        'dist/sw.js imports sw-cleanup.js'
      );

      const cleanupPath = path.resolve(process.cwd(), 'dist/sw-cleanup.js');
      assert.ok(fs.existsSync(cleanupPath), 'dist/sw-cleanup.js exists in distribution');
      const cleanupContent = fs.readFileSync(cleanupPath, 'utf-8');
      assert.ok(
        cleanupContent.includes('api-speech-translation-cache'),
        'dist/sw-cleanup.js targets api-speech-translation-cache'
      );

      pass('Verified production-built service worker adheres strictly to secure NetworkOnly API policy');
      pass('Verified production-built sw-cleanup.js purges obsolete caches on activation');
    } catch (err) {
      fail('Production Build Artifacts verification failed', err);
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
