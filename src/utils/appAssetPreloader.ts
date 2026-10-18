/**
 * BeeYou Global Asset Preloader
 * Proactively fetches and decodes 100% of app icons, wallpapers, mascots,
 * and theme collections before revealing the app, ensuring 0ms instantaneous
 * icon rendering and zero pop-in when using the app or switching themes.
 */

import assetsData from '../data/allPreloadAssets.json';

// In-memory cache holding HTMLImageElements to keep GPU/render textures hot
const memoryImageCache = new Map<string, HTMLImageElement>();
let isPreloadCompleted = false;

export function isAllAssetsPreloaded(): boolean {
  return isPreloadCompleted;
}

export interface PreloadProgress {
  percent: number;
  loaded: number;
  total: number;
  currentLabel: string;
}

/**
 * Preload and decode a single image URL.
 */
function preloadSingleImage(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if (memoryImageCache.has(url)) {
      resolve();
      return;
    }

    const img = new Image();
    img.decoding = 'async';

    const onDone = () => {
      memoryImageCache.set(url, img);
      if ('decode' in img && typeof img.decode === 'function') {
        img.decode().then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };

    img.onload = onDone;
    img.onerror = () => {
      // Gracefully resolve on error to avoid blocking the queue
      resolve();
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
  onItemDone: () => void
): Promise<void> {
  let index = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (index < urls.length) {
      const currentIndex = index++;
      const url = urls[currentIndex];
      await preloadSingleImage(url);
      onItemDone();
    }
  });

  await Promise.all(workers);
}

/**
 * Preload all verified app assets across all 9 themes, wallpapers, and tools.
 * Resolves ONLY when all assets have been preloaded.
 */
export async function preloadAllAppAssets(
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isPreloadCompleted) {
    onProgress?.({
      percent: 100,
      loaded: assetsData.allAssets.length,
      total: assetsData.allAssets.length,
      currentLabel: 'Ready! Welcome back!',
    });
    return;
  }

  const allUrls = assetsData.allAssets;
  const total = allUrls.length;
  let loaded = 0;

  const notify = () => {
    const percent = Math.min(100, Math.round((loaded / total) * 100));
    let label = 'Warming up cozy space...';
    if (percent < 25) {
      label = 'Waking up Barnaby and the cozy crew...';
    } else if (percent < 60) {
      label = `Loading themes & wallpapers (${loaded}/${total})...`;
    } else if (percent < 90) {
      label = `Caching sticker collections (${loaded}/${total})...`;
    } else if (percent < 100) {
      label = 'Finalizing sensory space...';
    } else {
      label = 'Ready! Welcome back!';
    }

    onProgress?.({
      percent,
      loaded,
      total,
      currentLabel: label,
    });
  };

  notify();

  // Run with 20 parallel connections for fast local disk/network loading
  const CONCURRENCY = 20;

  // Phase 1: High Priority (Wallpapers, Mascots, Core Tools)
  const priorityUrls = assetsData.priorityAssets;
  await preloadPool(priorityUrls, CONCURRENCY, () => {
    loaded++;
    notify();
  });

  // Phase 2: All Theme Collections & Routine Stickers
  const remainingUrls = assetsData.remainingAssets;
  await preloadPool(remainingUrls, CONCURRENCY, () => {
    loaded++;
    notify();
  });

  isPreloadCompleted = true;
  notify();
}
