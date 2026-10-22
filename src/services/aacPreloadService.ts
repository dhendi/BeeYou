import { getPrimarySpokenPhrasesForLanguage, getSpokenPhrasesForLanguage } from '../data/aacVocabularyCatalog';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../data/voicePersonasData';
import { preloadPiperVoice, isPiperVoiceReady, isPiperVoiceReadySync } from './piperTtsService';
import {
  getTtsStreamUrl,
  getTtsCacheKey,
  getLocalCacheOnly,
  getOrFetchAudioItem,
  formatForNaturalSpeech,
} from '../utils/audio/speech';
import { t } from './translator';

export interface PreloadProgress {
  loaded: number;
  total: number;
  percent: number;
  currentPhrase: string;
}

export type PreloadProgressCallback = (progress: PreloadProgress) => void;

const activePreloadAbortControllers = new Map<string, AbortController>();
const inFlightPreloadPromises = new Map<string, Promise<void>>();
const progressListenersMap = new Map<string, Set<PreloadProgressCallback>>();

function getStorageKey(personaId: string, lang: string): string {
  const normLang = (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' : (lang === 'zh' || lang.startsWith('zh')) ? 'zh' : lang.substring(0, 2);
  const normVoice = (personaId === 'system' ? 'amy' : personaId).toLowerCase();
  return `beeyou_vp_${normVoice}_${normLang}_${TTS_GENERATION_VERSION}`;
}

/**
 * Checks whether speech tiles for this voice persona and language are pre-cached and ready for instant playback.
 */
export function isVoicePackLoaded(personaId: string = 'amy', lang: string = 'en'): boolean {
  if (personaId === 'system') return true;
  if (typeof window === 'undefined') return true;
  try {
    const key = getStorageKey(personaId, lang);
    const vpReady = localStorage.getItem(key) === 'ready';
    const piperReady = isPiperVoiceReadySync(personaId, lang);
    return vpReady && piperReady;
  } catch {
    return false;
  }
}

/**
 * Marks voice pack as ready in local storage.
 */
export function markVoicePackLoaded(personaId: string = 'amy', lang: string = 'en'): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(personaId, lang);
    localStorage.setItem(key, 'ready');
  } catch {}
}

/**
 * Preloads all primary AAC speech tiles into device RAM and persistent browser CacheStorage.
 * Emits real-time progress callbacks for the loading screen.
 */
export async function preloadVoicePack(
  personaId: string = 'amy',
  lang: string = 'en',
  onProgress?: PreloadProgressCallback,
  signal?: AbortSignal
): Promise<void> {
  if (typeof window === 'undefined') return;

  if (personaId === 'system') {
    markVoicePackLoaded('system', lang);
    onProgress?.({ loaded: 82, total: 82, percent: 100, currentPhrase: 'Ready' });
    return;
  }

  const personaObj = getVoicePersonaById(personaId);
  const voiceToUse = personaObj.id === 'system' ? 'amy' : personaObj.id;
  const normalizedLang =
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  const operationKey = `${voiceToUse}_${normalizedLang}`;

  // Register listener for progress
  if (!progressListenersMap.has(operationKey)) {
    progressListenersMap.set(operationKey, new Set());
  }
  if (onProgress) {
    progressListenersMap.get(operationKey)!.add(onProgress);
  }

  // If a preload is already in flight for this exact voice and language, join it
  if (inFlightPreloadPromises.has(operationKey)) {
    return inFlightPreloadPromises.get(operationKey)!;
  }

  const controller = new AbortController();
  activePreloadAbortControllers.set(operationKey, controller);

  const effectiveSignal = signal || controller.signal;

  const promise = (async () => {
    // Primary board items (Core + Categories + Quick Phrases)
    const primaryItems = getPrimarySpokenPhrasesForLanguage(normalizedLang, (key) => t(key));
    const total = primaryItems.length;
    let loaded = 0;

    const dispatchProgress = (p: PreloadProgress) => {
      const listeners = progressListenersMap.get(operationKey);
      if (listeners) {
        listeners.forEach((fn) => {
          try { fn(p); } catch {}
        });
      }
    };

    if (total === 0) {
      dispatchProgress({ loaded: 0, total: 0, percent: 100, currentPhrase: 'Ready' });
      markVoicePackLoaded(personaId, normalizedLang);
      return;
    }

    // Preload Piper on-device neural voice model first
    let piperReady = false;
    try {
      piperReady = await preloadPiperVoice(voiceToUse, normalizedLang, (pInfo) => {
        dispatchProgress({
          loaded: Math.round((pInfo.percent / 100) * total),
          total,
          percent: pInfo.percent,
          currentPhrase: pInfo.currentPhrase,
        });
      });
    } catch (piperErr) {
      console.warn('[AAC Preload] Piper voice model download notice:', piperErr);
    }

    // If Piper on-device neural voice is verified ready, the engine is fully prepared
    if (piperReady || isPiperVoiceReadySync(voiceToUse, normalizedLang)) {
      markVoicePackLoaded(personaId, normalizedLang);
      dispatchProgress({ loaded: total, total, percent: 100, currentPhrase: 'Ready' });
      return;
    }

    // Concurrency worker pool (up to 6 parallel fetches for fast downloads)
    const CONCURRENCY = 6;
    let index = 0;

    const runItem = async (phraseText: string) => {
      const formatted = formatForNaturalSpeech(phraseText);
      if (!formatted) return;

      const cacheKey = getTtsCacheKey(voiceToUse, normalizedLang, formatted);
      const streamUrl = `${getTtsStreamUrl(voiceToUse, normalizedLang, formatted)}&cachedOnly=1`;

      try {
        const local = await getLocalCacheOnly(streamUrl, cacheKey);
        if (!local && !effectiveSignal.aborted) {
          // Strict 1.5s timeout per tile to ensure preloading NEVER blocks or hangs
          await Promise.race([
            getOrFetchAudioItem(streamUrl, cacheKey),
            new Promise((resolve) => setTimeout(resolve, 1500)),
          ]);
        }
      } catch {
        // Ignore single item fetch error
      }
    };

    const primaryWorker = async () => {
      while (index < primaryItems.length) {
        if (effectiveSignal.aborted) return;
        const currentIndex = index++;
        const item = primaryItems[currentIndex];
        if (!item) break;

        await runItem(item.phrase);

        loaded++;
        if (!effectiveSignal.aborted) {
          const percent = Math.min(100, Math.round((loaded / total) * 100));
          dispatchProgress({
            loaded,
            total,
            percent,
            currentPhrase: item.phrase,
          });
        }
      }
    };

    const primaryWorkers = Array.from({ length: Math.min(CONCURRENCY, primaryItems.length) }, () => primaryWorker());
    await Promise.all(primaryWorkers);

    if (!effectiveSignal.aborted) {
      markVoicePackLoaded(personaId, normalizedLang);
      dispatchProgress({ loaded: total, total, percent: 100, currentPhrase: 'Ready' });

      // Silently warm secondary scene tiles in background on idle priority
      const allItems = getSpokenPhrasesForLanguage(normalizedLang, (key) => t(key));
      const secondaryItems = allItems.slice(primaryItems.length);
      if (secondaryItems.length > 0) {
        const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 500));
        idleFn(async () => {
          for (const item of secondaryItems) {
            if (effectiveSignal.aborted) break;
            await runItem(item.phrase);
            await new Promise((r) => setTimeout(r, 40));
          }
        });
      }
    }
  })()
    .finally(() => {
      inFlightPreloadPromises.delete(operationKey);
      activePreloadAbortControllers.delete(operationKey);
      progressListenersMap.delete(operationKey);
    });

  inFlightPreloadPromises.set(operationKey, promise);
  return promise;
}

/**
 * Cancels any active preload operation for this voice and language.
 */
export function abortVoicePackPreload(personaId: string = 'amy', lang: string = 'en'): void {
  const normVoice = (personaId === 'system' ? 'amy' : personaId).toLowerCase();
  const normLang = (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' : (lang === 'zh' || lang.startsWith('zh')) ? 'zh' : lang.substring(0, 2);
  const key = `${normVoice}_${normLang}`;
  if (activePreloadAbortControllers.has(key)) {
    activePreloadAbortControllers.get(key)?.abort();
    activePreloadAbortControllers.delete(key);
    inFlightPreloadPromises.delete(key);
    progressListenersMap.delete(key);
  }
}
