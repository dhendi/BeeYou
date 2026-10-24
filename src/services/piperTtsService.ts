/**
 * Piper TTS On-Device Neural Speech Engine Service
 *
 * Runs Piper text-to-speech models locally in the browser/Capacitor environment
 * via WebAssembly and ONNX Runtime Web.
 *
 * Key guarantees:
 * - 100% On-device, local execution (0ms network round-trip, zero API keys, $0.00 cost)
 * - Single whole-sentence neural synthesis (prosody across multi-clause phrases, no word stitching)
 * - Native accent support across 50+ languages (English, Spanish, French, German, etc.)
 * - Caches voice models in OPFS (Origin Private File System) and synthesized clips in memory
 */

import { VoicePersona, VOICE_PERSONAS, getVoicePersonaById } from '../data/voicePersonasData';

export interface PiperProgressInfo {
  percent: number;
  currentPhrase: string;
  loadedBytes: number;
  totalBytes: number;
}

// Maps internal persona and language to official Piper Voice IDs
export const PIPER_VOICE_MAP: Record<string, string> = {
  // English Personas
  amy: 'en_US-amy-medium',
  ryan: 'en_US-ryan-medium',
  lessac: 'en_US-lessac-medium',
  danny: 'en_US-danny-low',
  bryce: 'en_US-bryce-medium',
  kristin: 'en_US-kristin-medium',
  joe: 'en_US-joe-medium',
  cori: 'en_GB-cori-medium',
  alan: 'en_GB-alan-medium',

  // Chinese (Mandarin)
  huayan: 'zh_CN-huayan-medium',
  huayan_lite: 'zh_CN-huayan-x_low',
  xiaobei: 'zh_CN-huayan-medium',
  xiaobei_playful: 'zh_CN-huayan-medium',
  zh_default: 'zh_CN-huayan-medium',

  // Spanish
  claude: 'es_MX-claude-high',
  davefx: 'es_ES-davefx-medium',
  ald: 'es_MX-ald-medium',
  sharvard: 'es_ES-sharvard-medium',
  carlfm: 'es_ES-carlfm-x_low',
  es_default: 'es_MX-claude-high',

  // French
  upmc: 'fr_FR-upmc-medium',
  siwis: 'fr_FR-siwis-medium',
  tom: 'fr_FR-tom-medium',
  gilles: 'fr_FR-gilles-low',
  fr_default: 'fr_FR-upmc-medium',

  // German
  thorsten: 'de_DE-thorsten-medium',
  thorsten_high: 'de_DE-thorsten-high',
  karlsson: 'de_DE-karlsson-low',
  kerstin: 'de_DE-kerstin-low',
  ramona: 'de_DE-ramona-low',
  de_default: 'de_DE-thorsten-medium',

  // Italian
  paola: 'it_IT-paola-medium',
  riccardo: 'it_IT-riccardo-x_low',
  it_default: 'it_IT-paola-medium',

  // Portuguese
  faber: 'pt_BR-faber-medium',
  edresson: 'pt_BR-edresson-low',
  tugao: 'pt_PT-tugão-medium',
  pt_default: 'pt_BR-faber-medium',

  // Russian
  irina: 'ru_RU-irina-medium',
  denis: 'ru_RU-denis-medium',
  dmitri: 'ru_RU-dmitri-medium',
  ruslan: 'ru_RU-ruslan-medium',
  ru_default: 'ru_RU-irina-medium',

  // Vietnamese
  vais: 'vi_VN-vais1000-medium',
  vivos: 'vi_VN-vivos-x_low',
  h25hours: 'vi_VN-25hours_single-low',
  vi_default: 'vi_VN-vais1000-medium',

  // Greek
  rapunzelina: 'el_GR-rapunzelina-low',
  rapunzelina_calm: 'el_GR-rapunzelina-low',
  el_default: 'el_GR-rapunzelina-low',

  // Legacy persona alias mappings so existing user settings work smoothly
  puck: 'en_US-amy-medium',
  leda: 'en_US-amy-medium',
  fenrir: 'en_US-ryan-medium',
  aoede: 'en_US-amy-medium',
  callirrhoe: 'en_US-kristin-medium',
  autonoe: 'en_US-amy-medium',
  kore: 'en_US-amy-medium',
  zephyr: 'en_US-amy-medium',
  sulafat: 'en_US-amy-medium',
  vindemiatrix: 'en_US-amy-medium',
  erinome: 'en_US-lessac-medium',
  despina: 'en_US-kristin-medium',
  algieba: 'en_US-lessac-medium',
  achird: 'en_US-ryan-medium',
  umbriel: 'en_US-ryan-medium',
  zubenelgenubi: 'en_US-ryan-medium',
  iapetus: 'en_US-lessac-medium',
  sadaltager: 'en_US-lessac-medium',
  sadachbia: 'en_US-danny-low',
  achernar: 'en_US-amy-medium',
};

// Internal cache for synthesized sentence audio buffers (text -> ArrayBuffer)
const piperAudioMemoryCache = new Map<string, ArrayBuffer>();

// Tracks in-flight synthesis promises to coalesce identical concurrent calls
const inFlightPiperPredictions = new Map<string, Promise<ArrayBuffer | null>>();

// Tracks loaded Piper sessions
let cachedPiperModule: typeof import('@mintplex-labs/piper-tts-web') | null = null;
let piperInitAttempted = false;
let piperAvailable = true;
let activeLoadedVoiceId: string | null = null;

// Tracks in-flight preload promises to coalesce concurrent model downloads/warm-ups
const inFlightPiperPreloads = new Map<string, Promise<boolean>>();

export interface PiperLockOptions {
  isCancelled?: () => boolean;
  signal?: AbortSignal;
}

// Serial execution queue / mutex ensuring only one WebAssembly ONNX operation executes at a time
let piperExecutionQueue = Promise.resolve<any>(null);

export function runWithPiperLock<T>(
  task: () => Promise<T>,
  options?: PiperLockOptions
): Promise<T | null> {
  const isCancelled = () => Boolean(
    options?.isCancelled?.() || options?.signal?.aborted
  );

  // Fast path: if already cancelled before enqueuing, avoid touching the queue
  if (isCancelled()) {
    return Promise.resolve(null);
  }

  const executeIfActive = async (): Promise<T | null> => {
    // If request was superseded or cancelled while waiting in queue,
    // yield the lock immediately in 0ms without starting WebAssembly inference.
    if (isCancelled()) {
      return null;
    }
    return task();
  };

  const current = piperExecutionQueue.then(executeIfActive, executeIfActive);
  piperExecutionQueue = current.catch(() => {});
  return current;
}

// Performance telemetry for Piper phonemization and ONNX inference
let lastOnnxInferenceMs = 0;
let lastPhonemizeMs = 0;

/**
 * Returns the most recent Piper ONNX inference and phonemization durations in milliseconds.
 */
export function getLastPiperTimings(): { onnxInferenceMs: number; phonemizeMs: number } {
  return { onnxInferenceMs: lastOnnxInferenceMs, phonemizeMs: lastPhonemizeMs };
}

/**
 * Returns the currently active in-memory Piper voice ID.
 */
export function getActivePiperVoiceId(): string | null {
  return activeLoadedVoiceId;
}

/**
 * Dynamically loads the piper-tts-web WebAssembly module.
 */
async function getPiperModule(): Promise<typeof import('@mintplex-labs/piper-tts-web') | null> {
  if (typeof window === 'undefined') return null;
  if (cachedPiperModule) return cachedPiperModule;
  if (piperInitAttempted && !piperAvailable) return null;

  piperInitAttempted = true;
  try {
    // 1. Configure ONNX runtime WASM paths and single-threading BEFORE anything initializes
    try {
      const [ortMain, ortWasm] = await Promise.all([
        import('onnxruntime-web').catch(() => null),
        import('onnxruntime-web/wasm').catch(() => null),
      ]);
      const ortInstances = [
        (ortMain as any)?.default || ortMain,
        (ortWasm as any)?.default || ortWasm,
      ].filter(Boolean);

      for (const ort of ortInstances) {
        if (ort?.env?.wasm) {
          ort.env.wasm.wasmPaths = '/onnx/';
          if (!window.crossOriginIsolated) {
            try {
              Object.defineProperty(ort.env.wasm, 'numThreads', {
                configurable: true,
                enumerable: true,
                get: () => 1,
                set: () => {}
              });
            } catch {
              ort.env.wasm.numThreads = 1;
            }
          }
        }

        // Intercept InferenceSession to accurately profile raw neural inference duration
        if (ort?.InferenceSession && !(ort.InferenceSession as any).__timed) {
          (ort.InferenceSession as any).__timed = true;
          if (ort.InferenceSession.prototype?.run) {
            const origProtoRun = ort.InferenceSession.prototype.run;
            ort.InferenceSession.prototype.run = async function (this: any, ...args: any[]) {
              const t0 = performance.now();
              const res = await origProtoRun.apply(this, args);
              lastOnnxInferenceMs = Math.round(performance.now() - t0);
              return res;
            };
          }
          if (typeof ort.InferenceSession.create === 'function') {
            const origCreate = ort.InferenceSession.create.bind(ort.InferenceSession);
            ort.InferenceSession.create = async function (...args: any[]) {
              const session = await origCreate(...args);
              if (session && typeof session.run === 'function') {
                const origRun = session.run.bind(session);
                session.run = async function (...runArgs: any[]) {
                  const t0 = performance.now();
                  const res = await origRun(...runArgs);
                  lastOnnxInferenceMs = Math.round(performance.now() - t0);
                  return res;
                };
              }
              return session;
            };
          }
        }
      }
    } catch (e) {
      console.warn('[Piper TTS] Failed to pre-configure onnxruntime-web:', e);
    }

    // 2. Load Piper TTS web module and redirect WASM and data paths to self-hosted assets
    const mod = await import('@mintplex-labs/piper-tts-web');
    if (mod?.TtsSession?.WASM_LOCATIONS) {
      mod.TtsSession.WASM_LOCATIONS.onnxWasm = '/onnx/';
      mod.TtsSession.WASM_LOCATIONS.piperWasm = '/piper/piper_phonemize.wasm';
      mod.TtsSession.WASM_LOCATIONS.piperData = '/piper/piper_phonemize.data';
    }

    cachedPiperModule = mod;
    piperAvailable = true;
    return mod;
  } catch (err) {
    console.warn('[Piper TTS] Failed to load piper-tts-web module:', err);
    piperAvailable = false;
    return null;
  }
}

/**
 * Resolves the canonical Piper VoiceId based on persona ID and language.
 * Returns empty string if no Piper voice model is available for the given language or persona.
 */
export function resolvePiperVoiceId(personaId?: string, lang: string = 'en'): string {
  const normLang = (lang || 'en').toLowerCase().trim();
  const normPersona = (personaId || '').toLowerCase().trim();

  // If persona explicitly has no Piper voice (e.g. system, Japanese, Korean personas)
  if (normPersona) {
    const persona = getVoicePersonaById(normPersona);
    if (persona && (persona.piperVoice === '' || persona.language === 'ja' || persona.language === 'ko')) {
      return '';
    }
  }

  // Explicit check for languages with NO Piper models (e.g. Japanese, Korean)
  if (normLang.startsWith('ja') || normLang.startsWith('ko')) {
    return '';
  }

  // If specific persona is in PIPER_VOICE_MAP
  if (normPersona && PIPER_VOICE_MAP[normPersona]) {
    return PIPER_VOICE_MAP[normPersona];
  }

  // Language based fallback
  if (normLang.startsWith('zh')) return PIPER_VOICE_MAP.huayan;
  if (normLang.startsWith('es')) return PIPER_VOICE_MAP.claude;
  if (normLang.startsWith('fr')) return PIPER_VOICE_MAP.upmc;
  if (normLang.startsWith('de')) return PIPER_VOICE_MAP.thorsten;
  if (normLang.startsWith('it')) return PIPER_VOICE_MAP.paola;
  if (normLang.startsWith('pt')) return PIPER_VOICE_MAP.faber;
  if (normLang.startsWith('ru')) return PIPER_VOICE_MAP.irina;
  if (normLang.startsWith('vi')) return PIPER_VOICE_MAP.vais;
  if (normLang.startsWith('el')) return PIPER_VOICE_MAP.rapunzelina;

  // English fallback for English or unspecified requests
  if (normLang.startsWith('en')) {
    return PIPER_VOICE_MAP.amy;
  }

  // For any other language not supported by Piper, return empty string so system speech handles it
  return '';
}

/**
 * Fast synchronous check whether a Piper voice model is already confirmed stored in local cache.
 */
export function isPiperVoiceReadySync(personaId?: string, lang: string = 'en'): boolean {
  if (typeof window === 'undefined') return false;
  const voiceId = resolvePiperVoiceId(personaId, lang);
  if (!voiceId) return false;
  try {
    return localStorage.getItem(`beeyou_piper_ready_${voiceId}`) === '1';
  } catch {
    return false;
  }
}

/**
 * Checks whether a Piper voice model is already stored in OPFS or local cache.
 */
export async function isPiperVoiceReady(personaId?: string, lang: string = 'en'): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const voiceId = resolvePiperVoiceId(personaId, lang);
  if (!voiceId) return false;

  // Check localStorage flag for fast synchronous query
  try {
    const cachedFlag = localStorage.getItem(`beeyou_piper_ready_${voiceId}`);
    if (cachedFlag === '1') return true;
  } catch {}

  const piper = await getPiperModule();
  if (!piper) return false;

  try {
    if (typeof navigator !== 'undefined' && (!navigator.storage || typeof navigator.storage.getDirectory !== 'function')) {
      return false;
    }
    const storedVoices = await piper.stored();
    const isStored = storedVoices.includes(voiceId as any);
    if (isStored) {
      try {
        localStorage.setItem(`beeyou_piper_ready_${voiceId}`, '1');
      } catch {}
    }
    return isStored;
  } catch (err) {
    console.warn('[Piper TTS] Error checking stored voices:', err);
    return false;
  }
}

/**
 * Helper to ensure OPFS file handle has finished writing and flushing to disk before reading.
 * Works around upstream piper-tts-web omitting `await` before writeBlob().
 */
async function waitForOpfsFileReady(filename: string, minBytes: number = 1000000, maxWaitMs: number = 1200): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return true;
  const start = performance.now();
  while (performance.now() - start < maxWaitMs) {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('piper');
      const fileHandle = await dir.getFileHandle(filename);
      if (typeof (fileHandle as any).createWritable !== 'function') {
        // WebKit / iOS Safari main thread lacks createWritable - do not stall
        return true;
      }
      const file = await fileHandle.getFile();
      if (file.size >= minBytes) {
        return true;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

/**
 * Downloads and preloads a Piper voice model for local offline use.
 * Coalesces concurrent calls to prevent OPFS file lock contention.
 */
export async function preloadPiperVoice(
  personaId?: string,
  lang: string = 'en',
  onProgress?: (info: PiperProgressInfo) => void
): Promise<boolean> {
  const voiceId = resolvePiperVoiceId(personaId, lang);
  if (!voiceId) return false;

  // Single-flight deduplication: if preload is already active for this voice, join it
  if (inFlightPiperPreloads.has(voiceId)) {
    return inFlightPiperPreloads.get(voiceId)!;
  }

  const preloadPromise = (async () => {
    const piper = await getPiperModule();
    if (!piper) return false;

    try {
      // 1. Check if already stored in OPFS
      const alreadyStored = await isPiperVoiceReady(personaId, lang);
      if (!alreadyStored) {
        onProgress?.({
          percent: 10,
          currentPhrase: `Downloading neural voice model (${voiceId})...`,
          loadedBytes: 10,
          totalBytes: 100,
        });

        await piper.download(voiceId as any, (p) => {
          const percent = p.total > 0 ? Math.min(90, Math.round((p.loaded / p.total) * 100)) : 50;
          onProgress?.({
            percent,
            currentPhrase: `Downloading voice model: ${Math.round(percent)}%`,
            loadedBytes: p.loaded,
            totalBytes: p.total,
          });
        });

        // Ensure OPFS write stream is completely closed and flushed before session initialization
        await waitForOpfsFileReady(`${voiceId}.onnx`, 1000000);
        await waitForOpfsFileReady(`${voiceId}.onnx.json`, 100);
      }

      // 2. Warm up / prime the WebAssembly session in memory for this target voice
      if (activeLoadedVoiceId !== voiceId) {
        onProgress?.({
          percent: 95,
          currentPhrase: `Preparing neural speech engine...`,
          loadedBytes: 95,
          totalBytes: 100,
        });

        await Promise.race([
          runWithPiperLock(async () => {
            // Clear singleton session lock if different voice was previously active
            if ((piper as any).TtsSession?._instance) {
              (piper as any).TtsSession._instance = null;
            }

            try {
              await piper.predict({ text: 'ready', voiceId: voiceId as any });
              activeLoadedVoiceId = voiceId;
              console.log(`[Piper TTS] Voice session warmed up successfully in memory: ${voiceId}`);
            } catch (warmErr) {
              console.warn(`[Piper TTS] Model warm-up notice for ${voiceId}:`, warmErr);
            }
          }),
          new Promise((r) => setTimeout(r, 12000)),
        ]);
      }

      try {
        localStorage.setItem(`beeyou_piper_ready_${voiceId}`, '1');
      } catch {}

      onProgress?.({
        percent: 100,
        currentPhrase: `Voice model ready (${voiceId})`,
        loadedBytes: 100,
        totalBytes: 100,
      });

      return true;
    } catch (err) {
      console.warn(`[Piper TTS] Preload failed for ${voiceId}:`, err);
      return false;
    }
  })().finally(() => {
    inFlightPiperPreloads.delete(voiceId);
  });

  inFlightPiperPreloads.set(voiceId, preloadPromise);
  return preloadPromise;
}

/**
 * Clears the Piper in-memory audio cache to release RAM.
 */
export function clearPiperAudioMemoryCache(): void {
  piperAudioMemoryCache.clear();
}

export interface SynthesizeWithPiperOptions {
  timeoutMs?: number;
  isCancelled?: () => boolean;
  signal?: AbortSignal;
}

/**
 * Synthesizes arbitrary text using Piper on-device.
 * Returns ArrayBuffer of canonical WAV audio, or null if synthesis failed or was cancelled.
 */
export async function synthesizeWithPiper(
  text: string,
  personaId?: string,
  lang: string = 'en',
  timeoutOrOptions?: number | SynthesizeWithPiperOptions,
  optionsArg?: SynthesizeWithPiperOptions
): Promise<ArrayBuffer | null> {
  const opts: SynthesizeWithPiperOptions =
    typeof timeoutOrOptions === 'object' && timeoutOrOptions !== null
      ? timeoutOrOptions
      : (optionsArg || (typeof timeoutOrOptions === 'number' ? { timeoutMs: timeoutOrOptions } : {}));

  const isCancelled = () => Boolean(opts.isCancelled?.() || opts.signal?.aborted);

  // Fast return if already superseded before starting
  if (isCancelled()) return null;

  const cleanText = text.trim();
  if (!cleanText) return null;

  const voiceId = resolvePiperVoiceId(personaId, lang);
  if (!voiceId) return null;

  const cacheKey = `piper_${voiceId}_${cleanText.toLowerCase()}`;

  // 1. Check in-memory audio cache for 0ms instant replay
  if (piperAudioMemoryCache.has(cacheKey)) {
    return piperAudioMemoryCache.get(cacheKey)!;
  }

  if (isCancelled()) return null;

  // 2. Coalesce concurrent requests for the exact same text
  if (inFlightPiperPredictions.has(cacheKey)) {
    const existing = inFlightPiperPredictions.get(cacheKey)!;
    if (opts.signal) {
      return Promise.race([
        existing,
        new Promise<null>((resolve) => {
          opts.signal!.addEventListener('abort', () => resolve(null), { once: true });
        }),
      ]);
    }
    return existing;
  }

  // 3. Fast-guard: If voice model is not yet in OPFS, do NOT stall user gesture with a 60MB on-the-fly download.
  // Kick off silent background download and return null so instant speech fallback sounds immediately.
  const isReady = await isPiperVoiceReady(personaId, lang);
  if (isCancelled()) return null;

  if (!isReady) {
    console.log(`[AAC Speech] Piper model not ready for voice ${voiceId}, triggering background preload`);
    preloadPiperVoice(personaId, lang).catch(() => {});
    return null;
  }

  const predictionPromise = (async () => {
    if (isCancelled()) return null;

    const piper = await getPiperModule();
    if (!piper) {
      console.warn(`[AAC Speech] Piper WebAssembly module unavailable for voice ${voiceId}`);
      return null;
    }

    if (isCancelled()) return null;

    const effectiveTimeout = opts.timeoutMs || 4500;

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), effectiveTimeout)
    );

    const executionPromise = runWithPiperLock(async () => {
      if (isCancelled()) return null;

      // If changing active voice, clear previous singleton instance so new ONNX model is loaded
      if (activeLoadedVoiceId !== voiceId && (piper as any).TtsSession?._instance) {
        (piper as any).TtsSession._instance = null;
      }

      try {
        const tStart = performance.now();
        lastOnnxInferenceMs = 0;
        const wavBlob = await piper.predict({
          text: cleanText,
          voiceId: voiceId as any,
        });

        if (!wavBlob) {
          if ((piper as any).TtsSession?._instance) {
            (piper as any).TtsSession._instance = null;
          }
          activeLoadedVoiceId = null;
          return null;
        }

        const arrayBuffer = await wavBlob.arrayBuffer();
        const durationMs = Math.round(performance.now() - tStart);
        lastPhonemizeMs = Math.max(0, durationMs - lastOnnxInferenceMs);

        if (arrayBuffer && arrayBuffer.byteLength > 44) {
          activeLoadedVoiceId = voiceId;
          console.log(`[AAC Speech] Piper sentence synthesized successfully (${voiceId}, ${cleanText.split(/\s+/).length} words, total: ${durationMs}ms [phonemize: ${lastPhonemizeMs}ms, onnx: ${lastOnnxInferenceMs}ms], ${arrayBuffer.byteLength} bytes)`);

          // LRU guard: keep cache size bounded to prevent excessive mobile memory usage (max 150 entries)
          if (piperAudioMemoryCache.size >= 150) {
            const firstKey = piperAudioMemoryCache.keys().next().value;
            if (firstKey) piperAudioMemoryCache.delete(firstKey);
          }

          piperAudioMemoryCache.set(cacheKey, arrayBuffer);
          try {
            localStorage.setItem(`beeyou_piper_ready_${voiceId}`, '1');
          } catch {}
          return arrayBuffer;
        }
        return null;
      } catch (err: any) {
        console.warn(`[AAC Speech] Piper synthesis failed for voice ${voiceId} (words: ${cleanText.split(/\s+/).length}):`, err?.message || err);
        if ((piper as any).TtsSession?._instance) {
          (piper as any).TtsSession._instance = null;
        }
        activeLoadedVoiceId = null;
        return null;
      }
    }, { isCancelled });

    const result = await Promise.race([executionPromise, timeoutPromise]);
    if (!result && !isCancelled()) {
      console.warn(`[AAC Speech] Piper synthesis timed out or lock busy after ${effectiveTimeout}ms for voice ${voiceId}`);
    }
    return result;
  })().finally(() => {
    inFlightPiperPredictions.delete(cacheKey);
  });

  inFlightPiperPredictions.set(cacheKey, predictionPromise);
  return predictionPromise;
}

// Client startup: pre-sync stored OPFS voices to localStorage for instant synchronous ready checks
if (typeof window !== 'undefined') {
  getPiperModule().then((piper) => {
    if (piper && typeof piper.stored === 'function') {
      return piper.stored().then((storedVoices: any) => {
        if (Array.isArray(storedVoices)) {
          for (const v of storedVoices) {
            try {
              localStorage.setItem(`beeyou_piper_ready_${v}`, '1');
            } catch {}
          }
        }
      });
    }
  }).catch(() => {});
}
