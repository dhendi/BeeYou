/**
 * BeeYou Sticker Preloader
 * Proactively caches sticker images in memory to ensure 0ms instantaneous icon rendering
 * with zero pop-in flickering across themes, routines, and views.
 */

import { TURTLE_SANCTUARY_ICONS } from '../data/themedIconsData';

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
  preloadStickerUrls(turtleUrls, true);
}

/**
 * Preloads all core app stickers when the app initializes.
 */
export function preloadAllStickersOnIdle() {
  if (typeof window === 'undefined') return;

  const turtleUrls = TURTLE_SANCTUARY_ICONS.map((i) => i.value);

  // Common high-frequency default stickers
  const commonUrls = [
    '/assets/stickers/alarm_clock.png',
    '/assets/stickers/routine_toilet_restroom.png',
    '/assets/stickers/pancakes_breakfast.png',
    '/assets/stickers/backpack_school.png',
    '/assets/stickers/sneaker_shoes.png',
    '/assets/stickers/apple_snack.png',
    '/assets/stickers/folder_schoolwork.png',
    '/assets/stickers/pencil_write.png',
    '/assets/stickers/teddy_bear.png',
    '/assets/stickers/shower_wash.png',
    '/assets/stickers/school_bus.png',
    '/assets/stickers/science_flask.png',
    '/assets/stickers/home_house.png',
    '/assets/stickers/car_ride.png',
    '/assets/stickers/outdoor_sun.png',
    '/assets/stickers/pet_care.png',
    '/assets/stickers/fav_sandwich.png',
    '/assets/stickers/drink_cup.png',
    '/assets/stickers/hot_cocoa.png',
    '/assets/stickers/laundry_hamper.png',
    '/assets/stickers/schedule_calendar.png',
    '/assets/stickers/breathing_cloud.png',
    '/assets/stickers/bedtime_sleep.png',
    '/assets/stickers/fork_knife.png',
    '/assets/stickers/candy_treat.png',
    '/assets/stickers/clock_time.png',
    '/assets/stickers/ocean_wave.png',
    '/assets/stickers/battery_meter.png',
    '/assets/stickers/quiet_voice.png',
    '/assets/stickers/bee_mascot.png',
    '/assets/stickers/turtle_mascot.png',
    '/assets/stickers/task_done.png',
  ];

  // Load common stickers immediately
  preloadStickerUrls(commonUrls, true);

  // Pre-cache all turtle stickers so theme switches are instant
  preloadStickerUrls(turtleUrls, false);
}
