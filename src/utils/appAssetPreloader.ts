/**
 * BeeYou Global Asset Preloader
 * Proactively fetches and caches 100% of app icons, wallpapers, mascots,
 * and theme collections before revealing the app, ensuring 0ms instantaneous
 * icon rendering and zero pop-in when using the app or switching themes.
 */

import assetsData from '../data/allPreloadAssets.json';

// In-memory cache holding HTMLImageElements to keep browser & GPU textures hot
const memoryImageCache = new Map<string, HTMLImageElement>();
let isPreloadCompleted = false;

export function isAllAssetsPreloaded(): boolean {
  return isPreloadCompleted;
}

export interface PreloadProgress {
  percent: number;
  loaded: number;
  total: number;
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
  onItemDone: () => void
): Promise<void> {
  let index = 0;

  const poolSize = Math.min(concurrency, urls.length);
  const workers = Array.from({ length: poolSize }, async () => {
    while (index < urls.length) {
      const currentIndex = index++;
      const url = urls[currentIndex];
      await preloadSingleImage(url, decode);
      onItemDone();
    }
  });

  await Promise.all(workers);
}

/**
 * Preload all verified app assets across all themes, wallpapers, and tools.
 * Resolves ONLY when all assets have been preloaded.
 */
export async function preloadAllAppAssets(
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  const allUrls = assetsData.allAssets;
  const total = allUrls.length;

  if (isPreloadCompleted) {
    onProgress?.({
      percent: 100,
      loaded: total,
      total,
    });
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

  // Phase 1: High Priority (Wallpapers, Mascots, Core Tools)
  const priorityUrls = assetsData.priorityAssets;
  await preloadPool(priorityUrls, 16, true, () => {
    loaded++;
    notify();
  });

  // Phase 2: All Theme Collections, Emotion Avatars & Routine Stickers
  const remainingUrls = assetsData.remainingAssets;
  await preloadPool(remainingUrls, 32, false, () => {
    loaded++;
    notify();
  });

  isPreloadCompleted = true;
  notify();
}
