import { getPrimarySpokenPhrasesForLanguage, getSpokenPhrasesForLanguage } from '../data/aacVocabularyCatalog';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../data/voicePersonasData';
import { preloadPiperVoice, isPiperVoiceReady, isPiperVoiceReadySync, synthesizeWithPiper } from './piperTtsService';
import {
  formatForNaturalSpeech,
  cachePiperAudio,
} from '../utils/audio/speech';
import { t } from './translator';

export interface PreloadProgress {
  loaded: number;
  total: number;
  percent: number;
  currentPhrase: string;
  loadedBytes?: number;
  totalBytes?: number;
  stage?: 'download' | 'engine' | 'tiles' | 'ready';
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
  const personaObj = getVoicePersonaById(personaId);
  if (!personaObj.piperVoice) return true;
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
    let modelTotalBytes = 0;
    let modelLoadedBytes = 0;

    try {
      piperReady = await preloadPiperVoice(voiceToUse, normalizedLang, (pInfo) => {
        modelTotalBytes = pInfo.totalBytes || modelTotalBytes;
        modelLoadedBytes = pInfo.loadedBytes || modelLoadedBytes;
        dispatchProgress({
          loaded: pInfo.percent,
          total: 100,
          percent: pInfo.percent,
          currentPhrase: pInfo.currentPhrase,
          loadedBytes: pInfo.loadedBytes,
          totalBytes: pInfo.totalBytes,
          stage: pInfo.stage || 'download',
        });
      });
    } catch (piperErr) {
      console.warn('[AAC Preload] Piper voice model download notice:', piperErr);
    }

    if (effectiveSignal.aborted) return;

    // Pre-warm core speech tiles on-device with Piper so first tap has zero delay
    const coreTilesToWarm = primaryItems.slice(0, 12);
    const numCoreTiles = coreTilesToWarm.length;

    for (let i = 0; i < numCoreTiles; i++) {
      if (effectiveSignal.aborted) break;
      const item = coreTilesToWarm[i];
      if (!item) continue;

      const formatted = formatForNaturalSpeech(item.phrase);
      if (formatted) {
        try {
          const piperBuf = await synthesizeWithPiper(formatted, voiceToUse, normalizedLang, {
            timeoutMs: 3000,
            signal: effectiveSignal,
          });
          if (piperBuf) {
            cachePiperAudio(voiceToUse, normalizedLang, formatted, piperBuf);
          }
        } catch {}
      }

      const tilePercent = Math.min(100, 85 + Math.round(((i + 1) / numCoreTiles) * 15));
      dispatchProgress({
        loaded: i + 1,
        total: numCoreTiles,
        percent: tilePercent,
        currentPhrase: 'Preparing your voice...',
        loadedBytes: modelTotalBytes,
        totalBytes: modelTotalBytes,
        stage: 'tiles',
      });
    }

    if (!effectiveSignal.aborted) {
      markVoicePackLoaded(personaId, normalizedLang);
      dispatchProgress({
        loaded: numCoreTiles,
        total: numCoreTiles,
        percent: 100,
        currentPhrase: 'Ready',
        loadedBytes: modelTotalBytes,
        totalBytes: modelTotalBytes,
        stage: 'ready',
      });
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
