/**
 * BeeYou Global Two-Tier Asset Preloader
 *
 * - Tier 1 (Blocking on Opening Loading Screen):
 *   Preloads and decodes 100% of all 9 theme wallpapers, all 9 theme mascots,
 *   all 9 themes' emotion face sets, all core Home/Routine/AAC/Adventure/Skill/Tool
 *   stickers, AND the currently equipped theme's complete sticker swap set (~319–440 assets, ~4.2 MB).
 *
 * - Tier 2 (Silent Background Preload immediately after App Opens):
 *   Silently preloads and caches the remaining 8 themes' swap sets and deep Icon Library
 *   picker items into `memoryImageCache` in the background so theme switching and icon
 *   browsing remain 0ms instantaneous.
 */

import assetsData from '../data/allPreloadAssets.json';

type ThemeCategoryKey = keyof typeof assetsData.themeSwapAssets;

// In-memory cache holding HTMLImageElements to keep browser & GPU textures hot
const memoryImageCache = new Map<string, HTMLImageElement>();
let isTier1Completed = false;
let isTier2Running = false;

// Persistent cache version key — bump if asset manifest changes significantly
const ASSET_CACHE_VERSION_KEY = 'beeyou_asset_cache_version';
const ASSET_FULL_CACHE_KEY = 'beeyou_asset_full_cache_version';
const CURRENT_ASSET_CACHE_VERSION = 'beeyou-webp-v2.3-1366';

/**
 * Returns true if this browser has already completed Tier 1 preloading for the
 * current asset version on a previous visit (meaning assets are in HTTP/SW disk cache).
 */
export function isWarmCacheVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ASSET_CACHE_VERSION_KEY) === CURRENT_ASSET_CACHE_VERSION;
  } catch {
    return false;
  }
}

export function isAllAssetsPreloaded(): boolean {
  return isTier1Completed;
}

export interface PreloadProgress {
  percent: number;
  loaded: number;
  total: number;
}

/**
 * Detect currently equipped theme category from localStorage/DOM so its swap stickers
 * are included in Tier 1 on startup.
 */
function detectActiveThemeCategory(): ThemeCategoryKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const mapIdToCat = (id?: string | null): ThemeCategoryKey | null => {
      if (!id) return null;
      if (id === 'theme-turtle' || id === 'turtle') return 'turtle';
      if (id === 'theme-dino' || id === 'dinosaur') return 'dinosaur';
      if (id === 'theme-frog' || id === 'frog') return 'frog';
      if (id === 'theme-trains' || id === 'train') return 'train';
      if (id === 'theme-space' || id === 'space') return 'space';
      if (id === 'theme-ocean' || id === 'ocean') return 'ocean';
      if (id === 'theme-fantasy' || id === 'fantasy' || id === 'magic') return 'fantasy';
      if (id === 'theme-racing' || id === 'racing') return 'racing';
      return null;
    };

    const directId = localStorage.getItem('beeyou_active_theme_id');
    const fromDirect = mapIdToCat(directId);
    if (fromDirect) return fromDirect;

    const appStateRaw = localStorage.getItem('beeyou_app_state_v1');
    if (appStateRaw) {
      const parsed = JSON.parse(appStateRaw);
      const fromState = mapIdToCat(parsed?.activeThemeId);
      if (fromState) return fromState;
    }
  } catch {}
  return null;
}

const THEME_WALLPAPER_MAP: Record<ThemeCategoryKey | 'classic', string> = {
  classic: '/assets/wallpapers/default_honey_theme_bg.webp',
  turtle: '/assets/wallpapers/turtle_sanctuary_bg.webp',
  dinosaur: '/assets/wallpapers/dino_kingdom_bg.webp',
  frog: '/assets/wallpapers/ribbit_pond_bg.webp',
  train: '/assets/wallpapers/steam_express_bg.webp',
  space: '/assets/wallpapers/cosmic_voyager_bg.webp',
  ocean: '/assets/wallpapers/ocean_splash_bg.webp',
  fantasy: '/assets/wallpapers/magic_fairytale_bg.webp',
  racing: '/assets/wallpapers/turbo_speedway_bg.webp',
};

/**
 * Compute the exact deduplicated Tier 1 URL list for the current startup session.
 * - On a cold first visit: includes all 319 base Tier 1 assets + active theme swaps.
 * - On a warm returning visit (already cached on disk): blocks only on the active theme's
 *   emotions, wallpaper, core stickers, and active theme swaps (~223 assets), while the
 *   other 8 themes' cached wallpapers & emotions warm up immediately in Tier 2A.
 */
export function getTier1Assets(): string[] {
  const activeCat = detectActiveThemeCategory();
  const warm = isWarmCacheVisit();
  const activeEmotionFolder = activeCat ?? 'classic';
  const activeWallpaper = THEME_WALLPAPER_MAP[activeEmotionFolder];

  const set = new Set<string>();

  for (const url of assetsData.tier1Assets) {
    if (warm) {
      // On warm cache visits, defer inactive themes' emotion folders to Tier 2A
      if (url.startsWith('/assets/emotions/') && !url.startsWith(`/assets/emotions/${activeEmotionFolder}/`)) {
        continue;
      }
      // On warm cache visits, defer inactive themes' wallpapers to Tier 2A
      if (
        url.startsWith('/assets/wallpapers/') &&
        url !== activeWallpaper &&
        url !== THEME_WALLPAPER_MAP.classic
      ) {
        continue;
      }
    }
    set.add(url);
  }

  if (activeCat && assetsData.themeSwapAssets[activeCat]) {
    for (const url of assetsData.themeSwapAssets[activeCat]) {
      set.add(url);
    }
  }
  return Array.from(set);
}

/**
 * Preload a single image URL into browser cache & memoryImageCache.
 * Resolves safely on load or error without blocking if an asset is delayed.
 */
function preloadSingleImage(url: string, shouldDecode: boolean = false): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if (memoryImageCache.has(url)) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve();
      }
    };

    // Safety timeout per individual image (3s) so one slow asset never stalls the batch
    const timer = setTimeout(finish, 3000);

    const img = new Image();
    img.decoding = shouldDecode ? 'sync' : 'async';

    img.onload = () => {
      memoryImageCache.set(url, img);
      if (shouldDecode && 'decode' in img && typeof img.decode === 'function') {
        img.decode().then(finish).catch(finish);
      } else {
        finish();
      }
    };

    img.onerror = () => {
      finish();
    };

    img.src = url;
  });
}

/**
 * Concurrently preload a list of URLs with a worker pool.
 */
async function preloadPool(
  urls: string[],
  concurrency: number,
  decode: boolean,
  onItemDone?: () => void
): Promise<void> {
  let index = 0;
  const poolSize = Math.min(concurrency, urls.length);
  if (poolSize === 0) return;

  const workers = Array.from({ length: poolSize }, async () => {
    while (index < urls.length) {
      const currentIndex = index++;
      const url = urls[currentIndex];
      await preloadSingleImage(url, decode);
      onItemDone?.();
    }
  });

  await Promise.all(workers);
}

/**
 * Immediately pre-warm a specific theme's sticker swap set at high priority
 * (called when a user previews or switches themes).
 */
export function preloadThemeAssetsImmediate(themeIdOrCategory?: string | null): void {
  if (typeof window === 'undefined' || !themeIdOrCategory) return;
  const norm = themeIdOrCategory.replace(/^theme-/, '');
  const catMap: Record<string, ThemeCategoryKey> = {
    turtle: 'turtle',
    dino: 'dinosaur',
    dinosaur: 'dinosaur',
    frog: 'frog',
    trains: 'train',
    train: 'train',
    space: 'space',
    ocean: 'ocean',
    fantasy: 'fantasy',
    magic: 'fantasy',
    racing: 'racing',
  };
  const key = catMap[norm];
  if (!key || !assetsData.themeSwapAssets[key]) return;

  const pending = assetsData.themeSwapAssets[key].filter((u) => !memoryImageCache.has(u));
  if (pending.length > 0) {
    void preloadPool(pending, 24, true);
  }
}

/**
 * Tier 2: Silently preload all remaining theme wallpapers, emotions, theme swap sets,
 * and deep Icon Library stickers in the background after the main app has opened.
 */
function startTier2BackgroundPreload(): void {
  if (typeof window === 'undefined' || isTier2Running) return;
  isTier2Running = true;

  const runTier2 = async () => {
    // Tier 2A-0: Any deferred wallpapers & emotions from warm-cache startup
    const deferredTier1 = assetsData.tier1Assets.filter((u) => !memoryImageCache.has(u));
    if (deferredTier1.length > 0) {
      await preloadPool(deferredTier1, 24, false);
    }

    // Tier 2A: All remaining 9-theme swap stickers (so switching to any theme is 0ms instant)
    const pendingSwaps = assetsData.tier2PrioritySwaps.filter((u) => !memoryImageCache.has(u));
    await preloadPool(pendingSwaps, 16, false);

    // Tier 2B: Remaining deep Icon Library picker items
    const pendingDeep = assetsData.tier2DeepAssets.filter((u) => !memoryImageCache.has(u));
    await preloadPool(pendingDeep, 12, false);

    try {
      localStorage.setItem(ASSET_FULL_CACHE_KEY, CURRENT_ASSET_CACHE_VERSION);
    } catch {}
  };

  setTimeout(() => {
    void runTier2();
  }, 50);
}

/**
 * Tier 1: Preload all critical startup assets, wallpapers, mascots, emotions,
 * and active theme stickers before dismissing the loading screen.
 */
export async function preloadAllAppAssets(
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  const warm = isWarmCacheVisit();
  const tier1Urls = getTier1Assets();
  const total = tier1Urls.length;

  if (isTier1Completed) {
    onProgress?.({
      percent: 100,
      loaded: total,
      total,
    });
    startTier2BackgroundPreload();
    return;
  }

  let loaded = 0;

  const notify = () => {
    const percent = Math.min(100, Math.round((loaded / total) * 100));
    onProgress?.({
      percent,
      loaded,
      total,
    });
  };

  notify();

  // Warm cache visits pull directly from local HTTP/SW disk cache with 64 concurrent workers;
  // Cold network visits use 32 concurrent workers with full bitmap decode.
  const concurrency = warm ? 64 : 32;
  await preloadPool(tier1Urls, concurrency, true, () => {
    loaded++;
    notify();
  });

  isTier1Completed = true;
  try {
    localStorage.setItem(ASSET_CACHE_VERSION_KEY, CURRENT_ASSET_CACHE_VERSION);
  } catch {}
  notify();

  // Immediately kick off silent Tier 2 background preloading for remaining themes & icon picker
  startTier2BackgroundPreload();
}
