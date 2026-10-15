/**
 * BeeYou Audio & Speech Engine (Modular Re-export Bridge)
 * All audio modules have been cleanly separated into:
 * - ./audio/context.ts      (AudioContext singleton & mobile gesture unlocker)
 * - ./audio/chimes.ts       (UI feedback chimes, pet sounds, entity audio)
 * - ./audio/catalog.ts      (Ambient soundscapes catalog & asset mappings)
 * - ./audio/procedural.ts   (Web Audio API mathematical synthesizers)
 * - ./audio/soundscapes.ts  (Multi-track player, volume persistence, mixing)
 * - ./audio/speech.ts       (Neural/system TTS, voice ranking, voice recordings)
 */
export * from './audio/index';
