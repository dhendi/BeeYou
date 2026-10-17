/**
 * BeeYou Sticker Preloader
 * Proactively caches sticker images in memory to ensure 0ms instantaneous icon rendering
 * with zero pop-in flickering across themes, routines, and views.
 */

import { TURTLE_SANCTUARY_ICONS, DINO_KINGDOM_ICONS, RIBBIT_POND_ICONS, STEAM_EXPRESS_ICONS, COSMIC_SPACE_ICONS } from '../data/themedIconsData';

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
 * Preloads stickers for a specific theme ID.
 */
export function preloadThemeStickers(themeId?: string) {
  if (!themeId) return;
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
    '/assets/stickers/bee_mascot.png',
    '/assets/stickers/turtle_mascot.png',
    '/assets/stickers/frog_mascot.png',
    '/assets/stickers/train_mascot.png',
    '/assets/stickers/dino_rex_mascot.png',
    '/assets/stickers/dino_rex.png',
    '/assets/stickers/turtle_welcome_sign.png',

    // Dashboard Tools & Badges
    '/assets/stickers/about_id.png',
    '/assets/stickers/fidget_bubbles.png',
    '/assets/stickers/timer_clock.png',
    '/assets/stickers/feelings_thermometer.png',
    '/assets/stickers/spoons_energy.png',
    '/assets/stickers/decision_wheel.png',
    '/assets/stickers/medications_health.png',
    '/assets/stickers/passport_book.png',
    '/assets/stickers/story_plans_change.png',
    '/assets/stickers/turtle_arched_bridge.png',
    '/assets/stickers/dino_footprint_loop.png',
    '/assets/stickers/turtle_seedling.png',
    '/assets/stickers/turtle_lily_pads.png',

    // Core High-Frequency Routines & Steps
    '/assets/stickers/alarm_clock.png',
    '/assets/stickers/routine_toilet_restroom.png',
    '/assets/stickers/toothbrush.png',
    '/assets/stickers/soap_wash_hands.png',
    '/assets/stickers/clothes_dressed.png',
    '/assets/stickers/pancakes_breakfast.png',
    '/assets/stickers/backpack_school.png',
    '/assets/stickers/sneaker_shoes.png',
    '/assets/stickers/apple_snack.png',
    '/assets/stickers/folder_schoolwork.png',
    '/assets/stickers/pencil_write.png',
    '/assets/stickers/teddy_bear.png',
    '/assets/stickers/shower_wash.png',
    '/assets/stickers/school_bus.png',
    '/assets/stickers/bedtime_sleep.png',
    '/assets/stickers/breathing_cloud.png',
    '/assets/stickers/drink_water.png',
    '/assets/stickers/drink_cup.png',
    '/assets/stickers/fav_quiet_break.png',
    '/assets/stickers/help_sos.png',
    '/assets/stickers/task_done.png',
    '/assets/stickers/adventure_dentist.png',
    '/assets/stickers/turtle_mineral_polishing_basin.png',
    '/assets/stickers/dino_trex_tooth_care.png',
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
