/**
 * Automated Cache & Service Worker Invalidation for BeeYou Releases.
 *
 * Ensures all connected devices (especially mobile Safari and standalone iOS PWAs)
 * immediately purge stale bundles, precached legacy components, and obsolete
 * Gemini voice references upon a new app release.
 */

import { purgeLegacyApiCaches, PRESERVED_OFFLINE_CACHE_PATTERNS } from './pwaCacheCleaner';

export const APP_RELEASE_VERSION = 'v12-pwa-cache-security-20261024';
const RELEASE_KEY = 'beeyou_release_version';

export function runReleaseAutoCacheBust(): void {
  if (typeof window === 'undefined') return;

  try {
    const currentInstalled = localStorage.getItem(RELEASE_KEY);
    if (currentInstalled === APP_RELEASE_VERSION) {
      return;
    }

    const isReturningUser = Boolean(
      currentInstalled ||
      localStorage.getItem('beeyou_app_state_v1') ||
      localStorage.getItem('beeyou_onboarding_completed') ||
      localStorage.getItem('beeyou_user_role') ||
      localStorage.getItem('beeyou_voice_persona')
    );

    // 1. Mark the new release version immediately so we never enter a reload loop
    localStorage.setItem(RELEASE_KEY, APP_RELEASE_VERSION);

    // 2. Migrate legacy Gemini persona IDs to modern Piper personas in stored app settings
    try {
      const STORAGE_KEY = 'beeyou_app_state_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.settings?.voicePersona) {
          const old = parsed.settings.voicePersona.toLowerCase();
          const legacyMap: Record<string, string> = {
            puck: 'amy',
            leda: 'amy',
            fenrir: 'ryan',
            aoede: 'amy',
            callirrhoe: 'kristin',
            autonoe: 'amy',
            kore: 'amy',
            zephyr: 'amy',
            sulafat: 'amy',
            vindemiatrix: 'amy',
            erinome: 'lessac',
            despina: 'kristin',
            algieba: 'lessac',
            achird: 'ryan',
            umbriel: 'joe',
            zubenelgenubi: 'ryan',
            iapetus: 'lessac',
            sadaltager: 'lessac',
            sadachbia: 'danny',
            achernar: 'bryce',
          };
          if (legacyMap[old]) {
            parsed.settings.voicePersona = legacyMap[old];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }

      // Also migrate standalone voice persona key if present
      const directVoice = localStorage.getItem('beeyou_voice_persona');
      if (directVoice && ['puck', 'fenrir', 'kore', 'leda', 'zephyr', 'achird', 'iapetus'].includes(directVoice.toLowerCase())) {
        localStorage.setItem('beeyou_voice_persona', 'amy');
      }
    } catch (e) {
      console.warn('Storage migration notice:', e);
    }

    // 3. Purge obsolete API caches while strictly preserving offline assets, locales, sounds, and symbols
    if ('caches' in window) {
      purgeLegacyApiCaches().catch(() => {});
      caches.keys().then((names) => {
        for (const name of names) {
          const isPreserved = PRESERVED_OFFLINE_CACHE_PATTERNS.some((pattern) => name.includes(pattern));
          if (!isPreserved) {
            caches.delete(name).catch(() => {});
          }
        }
      }).catch(() => {});
    }

    // 4. Unregister all existing Service Workers to evict obsolete script graphs
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().catch(() => {});
        }
      }).catch(() => {});
    }

    // 5. If this is an upgrade from an older version, force a clean hard reload once
    if (isReturningUser && currentInstalled !== APP_RELEASE_VERSION) {
      console.info(`[BeeYou] Upgrading client to ${APP_RELEASE_VERSION}. Reloading for fresh bundle.`);
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  } catch (err) {
    console.warn('[BeeYou] Cache bust notice:', err);
  }
}

runReleaseAutoCacheBust();
purgeLegacyApiCaches().catch(() => {});
