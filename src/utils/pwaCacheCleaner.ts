/**
 * PWA Cache Cleaner Utility
 *
 * Purges obsolete, sensitive, or legacy API caches (such as api-speech-translation-cache)
 * without destroying offline user data, AAC symbols, stickers, sounds, or locales.
 */

export const OBSOLETE_API_CACHES = ['api-speech-translation-cache'];

export const PRESERVED_OFFLINE_CACHE_PATTERNS = [
  'stickers',
  'locales',
  'audio',
  'fonts',
  'mulberry',
  'workbox-precache',
];

/**
 * Purges obsolete API caches from the browser CacheStorage.
 * Returns the list of deleted cache names.
 */
export async function purgeLegacyApiCaches(): Promise<string[]> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return [];
  }
  const purged: string[] = [];
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (OBSOLETE_API_CACHES.includes(key)) {
        const ok = await caches.delete(key);
        if (ok) {
          purged.push(key);
          console.log('[CacheCleaner] Purged obsolete API cache:', key);
        }
      }
    }
  } catch (err) {
    console.warn('[CacheCleaner] Error purging legacy caches:', err);
  }
  return purged;
}
