/**
 * BeeYou Sticker Preloader
 * Proactively caches sticker images in memory to ensure 0ms instantaneous icon rendering
 * with zero pop-in flickering across themes, routines, and views.
 */

import { TURTLE_SANCTUARY_ICONS, DINO_KINGDOM_ICONS, RIBBIT_POND_ICONS, STEAM_EXPRESS_ICONS, COSMIC_SPACE_ICONS, OCEAN_SPLASH_ICONS, FAIRYTALE_MAGIC_ICONS, RACING_SPEEDWAY_ICONS } from '../data/themedIconsData';

const loadedCache = new Set<string>();

export function preloadStickerUrls(urls: string[], immediate = false) {
  if (typeof window === 'undefined') return;

  const pending = urls.filter((u) => u && !loadedCache.has(u));
  if (pending.length === 0) return;

  pending.forEach((u) => loadedCache.add(u));

  if (immediate) {
    // Immediate pre-warm
    pending.forEach((url) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    });
    return;
  }

  // Chunked idle preloading (6 parallel connections per chunk)
  let cursor = 0;
  const chunk = 6;

  const processChunk = () => {
    const slice = pending.slice(cursor, cursor + chunk);
    cursor += chunk;

    slice.forEach((url) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    });

    if (cursor < pending.length) {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(processChunk, { timeout: 150 });
      } else {
        setTimeout(processChunk, 40);
      }
    }
  };

  processChunk();
}

/**
 * Preloads all Turtle Sanctuary stickers immediately into the browser's cache.
 */
export function preloadTurtleThemeStickers() {
  const turtleUrls = TURTLE_SANCTUARY_ICONS.map((i) => i.value);
  preloadStickerUrls(turtleUrls, false);
}

/**
 * Preloads all Dino Kingdom stickers into the browser's cache during idle cycles.
 */
export function preloadDinoThemeStickers() {
  const dinoUrls = DINO_KINGDOM_ICONS.map((i) => i.value);
  preloadStickerUrls(dinoUrls, false);
}

/**
 * Preloads all Ribbit Pond stickers into the browser's cache during idle cycles.
 */
export function preloadFrogThemeStickers() {
  const frogUrls = RIBBIT_POND_ICONS.map((i) => i.value);
  preloadStickerUrls(frogUrls, false);
}

/**
 * Preloads all Steam Express stickers into the browser's cache during idle cycles.
 */
export function preloadSteamThemeStickers() {
  const trainUrls = STEAM_EXPRESS_ICONS.map((i) => i.value);
  preloadStickerUrls(trainUrls, false);
}

/**
 * Preloads all Cosmic Explorer (Space) stickers into the browser's cache during idle cycles.
 */
export function preloadSpaceThemeStickers() {
  const spaceUrls = COSMIC_SPACE_ICONS.map((i) => i.value);
  preloadStickerUrls(spaceUrls, false);
}

/**
 * Preloads all Ocean Splash stickers into the browser's cache during idle cycles.
 */
export function preloadOceanThemeStickers() {
  const oceanUrls = OCEAN_SPLASH_ICONS.map((i) => i.value);
  preloadStickerUrls(oceanUrls, false);
}

/**
 * Preloads all Magic Fairytale stickers into the browser's cache during idle cycles.
 */
export function preloadFairytaleThemeStickers() {
  const fairytaleUrls = FAIRYTALE_MAGIC_ICONS.map((i) => i.value);
  preloadStickerUrls(fairytaleUrls, false);
}

/**
 * Preloads all Turbo Speedway stickers into the browser's cache during idle cycles.
 */
export function preloadRacingThemeStickers() {
  const racingUrls = RACING_SPEEDWAY_ICONS.map((i) => i.value);
  preloadStickerUrls(racingUrls, false);
}

import { preloadThemeAssetsImmediate } from './appAssetPreloader';

/**
 * Preloads stickers for a specific theme ID.
 */
export function preloadThemeStickers(themeId?: string) {
  if (!themeId) return;
  preloadThemeAssetsImmediate(themeId);
  if (themeId === 'theme-turtle' || themeId === 'turtle') {
    preloadTurtleThemeStickers();
  } else if (themeId === 'theme-dino' || themeId === 'dinosaur') {
    preloadDinoThemeStickers();
  } else if (themeId === 'theme-frog' || themeId === 'frog') {
    preloadFrogThemeStickers();
  } else if (themeId === 'theme-trains' || themeId === 'train') {
    preloadSteamThemeStickers();
  } else if (themeId === 'theme-space' || themeId === 'space') {
    preloadSpaceThemeStickers();
  } else if (themeId === 'theme-ocean' || themeId === 'ocean') {
    preloadOceanThemeStickers();
  } else if (themeId === 'theme-fantasy' || themeId === 'fantasy' || themeId === 'magic') {
    preloadFairytaleThemeStickers();
  } else if (themeId === 'theme-racing' || themeId === 'racing') {
    preloadRacingThemeStickers();
  }
}

/**
 * Preloads all core app stickers when the app initializes.
 * Pre-warms the active theme and critical dashboard icons immediately,
 * and schedules the remaining icon library during idle cycles.
 */
export function preloadAllStickersOnIdle() {
  if (typeof window === 'undefined') return;

  // 1. Critical common dashboard stickers needed on first paint
  const immediateCommonUrls = [
    // Mascots & Greetings
    '/assets/stickers/bee_mascot.webp',
    '/assets/stickers/turtle_mascot.webp',
    '/assets/stickers/frog_mascot.webp',
    '/assets/stickers/train_mascot.webp',
    '/assets/stickers/dino_rex_mascot.webp',
    '/assets/stickers/dino_rex.webp',
    '/assets/stickers/turtle_welcome_sign.webp',

    // Dashboard Tools & Badges
    '/assets/stickers/about_id.webp',
    '/assets/stickers/fidget_bubbles.webp',
    '/assets/stickers/timer_clock.webp',
    '/assets/stickers/feelings_thermometer.webp',
    '/assets/stickers/spoons_energy.webp',
    '/assets/stickers/decision_wheel.webp',
    '/assets/stickers/medications_health.webp',
    '/assets/stickers/passport_book.webp',
    '/assets/stickers/story_plans_change.webp',
    '/assets/stickers/turtle_arched_bridge.webp',
    '/assets/stickers/dino_footprint_loop.webp',
    '/assets/stickers/turtle_seedling.webp',
    '/assets/stickers/turtle_lily_pads.webp',

    // Core High-Frequency Routines & Steps
    '/assets/stickers/alarm_clock.webp',
    '/assets/stickers/routine_toilet_restroom.webp',
    '/assets/stickers/toothbrush.webp',
    '/assets/stickers/soap_wash_hands.webp',
    '/assets/stickers/clothes_dressed.webp',
    '/assets/stickers/pancakes_breakfast.webp',
    '/assets/stickers/backpack_school.webp',
    '/assets/stickers/sneaker_shoes.webp',
    '/assets/stickers/apple_snack.webp',
    '/assets/stickers/folder_schoolwork.webp',
    '/assets/stickers/pencil_write.webp',
    '/assets/stickers/teddy_bear.webp',
    '/assets/stickers/shower_wash.webp',
    '/assets/stickers/school_bus.webp',
    '/assets/stickers/bedtime_sleep.webp',
    '/assets/stickers/breathing_cloud.webp',
    '/assets/stickers/drink_water.webp',
    '/assets/stickers/drink_cup.webp',
    '/assets/stickers/fav_quiet_break.webp',
    '/assets/stickers/help_sos.webp',
    '/assets/stickers/task_done.webp',
    '/assets/stickers/adventure_dentist.webp',
    '/assets/stickers/turtle_mineral_polishing_basin.webp',
    '/assets/stickers/dino_trex_tooth_care.webp',
  ];

  // Immediately warm up the critical common stickers
  preloadStickerUrls(immediateCommonUrls, true);

  // Check which theme is currently active and immediately pre-warm its collection
  try {
    const savedThemeId = localStorage.getItem('beeyou_active_theme_id');
    if (savedThemeId === 'theme-turtle' || savedThemeId === 'turtle') {
      preloadTurtleThemeStickers();
    } else if (savedThemeId === 'theme-dino' || savedThemeId === 'dinosaur') {
      preloadDinoThemeStickers();
    }
  } catch (e) {}

  // Background idle pre-warming for remaining theme collections so subsequent switches are instant
  const turtleUrls = TURTLE_SANCTUARY_ICONS.map((i) => i.value);
  const dinoUrls = DINO_KINGDOM_ICONS.map((i) => i.value);

  preloadStickerUrls(turtleUrls, false);
  preloadStickerUrls(dinoUrls, false);
}
