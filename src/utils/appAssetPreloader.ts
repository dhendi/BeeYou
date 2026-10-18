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

/**
 * Compute the exact deduplicated Tier 1 URL list for the current startup session.
 */
export function getTier1Assets(): string[] {
  const set = new Set<string>(assetsData.tier1Assets);
  const activeCat = detectActiveThemeCategory();
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
    void preloadPool(pending, 16, true);
  }
}

/**
 * Tier 2: Silently preload all remaining theme swap sets and deep Icon Library
 * stickers in the background after the main app has opened.
 */
function startTier2BackgroundPreload(): void {
  if (typeof window === 'undefined' || isTier2Running) return;
  isTier2Running = true;

  const runTier2 = async () => {
    // Tier 2A: All remaining 9-theme swap stickers (so switching to any theme is 0ms instant)
    const pendingSwaps = assetsData.tier2PrioritySwaps.filter((u) => !memoryImageCache.has(u));
    await preloadPool(pendingSwaps, 12, false);

    // Tier 2B: Remaining deep Icon Library picker items
    const pendingDeep = assetsData.tier2DeepAssets.filter((u) => !memoryImageCache.has(u));
    await preloadPool(pendingDeep, 8, false);
  };

  setTimeout(() => {
    void runTier2();
  }, 100);
}

/**
 * Tier 1: Preload all critical startup assets, wallpapers, mascots, emotions,
 * and active theme stickers before dismissing the loading screen.
 */
export async function preloadAllAppAssets(
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

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

  // Preload & decode all Tier 1 startup assets with 24 concurrent workers
  await preloadPool(tier1Urls, 24, true, () => {
    loaded++;
    notify();
  });

  isTier1Completed = true;
  notify();

  // Immediately kick off silent Tier 2 background preloading for remaining themes & icon picker
  startTier2BackgroundPreload();
}
