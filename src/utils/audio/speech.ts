import { playChime } from './chimes';
import { getAudioContext, enableSilentModePlayback } from './context';
import { getVoicePersonaById, getDefaultVoicePersonaForLanguage, TTS_GENERATION_VERSION } from '../../data/voicePersonasData';
import { t, getLanguage } from '../../services/translator';
import { isPremiumSubscription } from '../../services/subscriptionService';
import { synthesizeWithPiper, resolvePiperVoiceId, isPiperVoiceReady, isPiperVoiceReadySync, preloadPiperVoice, getLastPiperTimings } from '../../services/piperTtsService';

// -------------------------------------------------------------
// WEB SPEECH API GETVOICES() QUERYING & NATURAL RANKING ENGINE
// -------------------------------------------------------------

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let activeSourceNode: AudioBufferSourceNode | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
const speechListeners: Set<(isSpeaking: boolean, text: string | null) => void> = new Set();
const voiceUpdateListeners: Set<(voices: SpeechSynthesisVoice[]) => void> = new Set();
export interface CachedAudioItem {
  blobUrl: string;
  buffer: ArrayBuffer;
}

const audioMemoryCache = new Map<string, CachedAudioItem>();
// Level 0: In-Memory Decoded AudioBuffer Cache (0ms decoding latency)
const decodedAudioBufferCache = new Map<string, AudioBuffer>();

export interface SpeechLatencyReport {
  text: string;
  voicePersona: string;
  engine: 'piper' | 'core_audio' | 'local_cache' | 'system_speech' | 'offline_stitching' | 'custom_recording' | 'server_stream';
  isCached: boolean;
  tapToHandlerMs: number;
  voiceResolutionMs: number;
  piperInitMs: number;
  phonemizeMs: number;
  onnxInferenceMs: number;
  audioDecodeMs: number;
  playbackSchedulingMs: number;
  totalToAudibleMs: number;
  timestamp: number;
}

let lastSpeechLatencyReport: SpeechLatencyReport | null = null;

export function getLastSpeechLatencyReport(): SpeechLatencyReport | null {
  return lastSpeechLatencyReport;
}

if (typeof window !== 'undefined') {
  (window as any).__lastAacLatencyReport = () => lastSpeechLatencyReport;
}

export function logLatencyBreakdown(r: SpeechLatencyReport): void {
  console.log(`[AAC Latency Breakdown] "${r.text}" (${r.voicePersona}, engine: ${r.engine}, cached: ${r.isCached}):`);
  console.log(`  Stage 1 (tapToHandler):        ${r.tapToHandlerMs}ms`);
  console.log(`  Stage 2 (voiceResolution):     ${r.voiceResolutionMs}ms`);
  console.log(`  Stage 3 (piperInit):           ${r.piperInitMs}ms`);
  console.log(`  Stage 4 (phonemize):           ${r.phonemizeMs}ms`);
  console.log(`  Stage 5 (onnxInference):       ${r.onnxInferenceMs}ms`);
  console.log(`  Stage 6 (audioDecode):         ${r.audioDecodeMs}ms`);
  console.log(`  Stage 7 (playbackScheduling):  ${r.playbackSchedulingMs}ms`);
  console.log(`  Stage 8 (totalToAudible):      ${r.totalToAudibleMs}ms`);
}
export const TTS_CACHE_NAME = `beeyou-tts-${TTS_GENERATION_VERSION}`;

// Immediately purge obsolete audio caches from previous generations (v1 - v10)
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key.startsWith('beeyou-tts-') && key !== TTS_CACHE_NAME) {
        console.log(`[AAC Speech] Purging obsolete audio cache: ${key}`);
        caches.delete(key);
      }
    });
  }).catch(() => {});
}
const inFlightAudioFetches = new Map<string, Promise<CachedAudioItem | null>>();

/**
 * Resolves the base API URL for TTS requests.
 * Handles native mobile wrappers (Capacitor) where relative URLs fail to resolve to the server.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  try {
    const custom = localStorage.getItem('beeyou_api_server');
    if (custom) return custom.replace(/\/+$/, '');
  } catch {}

  try {
    const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envUrl) return envUrl.replace(/\/+$/, '');
  } catch {}

  // Detect Capacitor native mobile environment (iOS or Android)
  const isCapacitorNative =
    typeof (window as any).Capacitor !== 'undefined' &&
    typeof (window as any).Capacitor?.isNativePlatform === 'function' &&
    Boolean((window as any).Capacitor.isNativePlatform());

  const isNativeProtocol =
    typeof window.location !== 'undefined' &&
    (window.location.origin.startsWith('capacitor://') ||
      window.location.protocol === 'file:' ||
      Boolean((window as any).androidBridge));

  if (isCapacitorNative || isNativeProtocol) {
    return '';
  }

  return '';
}

/**
 * Builds version-scoped TTS stream URL with cache-busting query parameter.
 */
export function getTtsStreamUrl(voiceId: string, lang: string, text: string, rate?: number): string {
  const base = getApiBaseUrl();
  const rateParam = rate && rate !== 1.0 ? `&rate=${encodeURIComponent(rate.toFixed(2))}` : '';
  return `${base}/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceId)}${rateParam}&v=${encodeURIComponent(TTS_GENERATION_VERSION)}`;
}

/**
 * Builds version-scoped TTS memory cache key distinguishing voice, language, text, rate, and version.
 */
export function getTtsCacheKey(voiceId: string, lang: string, text: string, rate?: number): string {
  const normalized = text.trim().replace(/[.!?]+$/, '').toLowerCase();
  const rateTag = rate && rate !== 1.0 ? `_r${Math.round(rate * 100)}` : '';
  return `${voiceId.toLowerCase()}_${lang}_${normalized}${rateTag}_${TTS_GENERATION_VERSION}`;
}

/**
 * Automatically purges stale, obsolete TTS cache partitions from previous engine versions.
 */
export async function cleanupObsoleteAudioCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith('beeyou-tts-') && key !== TTS_CACHE_NAME) {
        console.log(`[Cache Cleanup] Purging obsolete TTS cache version: ${key}`);
        await caches.delete(key);
      }
    }
  } catch (err) {
    console.warn('[Cache Cleanup] Failed to purge obsolete audio caches:', err);
  }
}

// Run cleanup once on client initialization
if (typeof window !== 'undefined') {
  cleanupObsoleteAudioCaches().catch(() => {});
}

/**
 * Fast synchronous/near-instant local cache lookup (L1 RAM + L2 CacheStorage).
 * Returns immediately (< 10ms) without initiating any network fetch or cloud roundtrip.
 */
export async function getLocalCacheOnly(streamUrl: string, cacheKey: string): Promise<CachedAudioItem | null> {
  // 1. Level 1: In-Memory RAM Cache (Instantaneous 0ms access)
  if (audioMemoryCache.has(cacheKey)) {
    return audioMemoryCache.get(cacheKey)!;
  }

  // 2. Level 2: Browser CacheStorage API (Fast local client storage, ~5ms)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const fullUrl = new URL(streamUrl, window.location.origin).href;
      const cache = await caches.open(TTS_CACHE_NAME);
      const match = (await cache.match(fullUrl)) || (await cache.match(streamUrl));
      if (match) {
        const buffer = await match.arrayBuffer();
        if (buffer && buffer.byteLength > 44) {
          const blob = new Blob([buffer], { type: 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);
          const entry: CachedAudioItem = { blobUrl, buffer };
          audioMemoryCache.set(cacheKey, entry);
          return entry;
        }
      }
    } catch (e) {
      // Local storage read error; ignore and return null
    }
  }

  return null;
}

/**
 * Multi-tier Audio Cache Loader (L1 In-Memory -> Client Single-Flight -> L2 Browser CacheStorage -> L3 Server Disk Stream)
 * Deduplicates in-flight requests so simultaneous clicks or prefetch jobs share a single HTTP fetch.
 */
export async function getOrFetchAudioItem(streamUrl: string, cacheKey: string): Promise<CachedAudioItem | null> {
  // 1. Level 1 & 2: Local Cache (RAM & CacheStorage)
  const local = await getLocalCacheOnly(streamUrl, cacheKey);
  if (local) return local;

  // In native Capacitor environment without a configured remote API server, do not attempt network fetch
  const isCapacitorNative =
    typeof (window as any).Capacitor !== 'undefined' &&
    typeof (window as any).Capacitor?.isNativePlatform === 'function' &&
    Boolean((window as any).Capacitor.isNativePlatform());

  if (isCapacitorNative && !getApiBaseUrl()) {
    return null;
  }

  // 1b. Client Single-Flight In-Flight Deduplication:
  // If an audio fetch for this cacheKey is already in flight, share the existing promise
  if (inFlightAudioFetches.has(cacheKey)) {
    return inFlightAudioFetches.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<CachedAudioItem | null> => {
    // 3. Level 3: Edge Server Stream (backed by Server-Side Disk Cache in .data/tts_cache)
    try {
      const fullUrl = typeof window !== 'undefined' ? new URL(streamUrl, window.location.origin).href : streamUrl;
      const response = await fetch(streamUrl, {
        signal: AbortSignal.timeout(2200),
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('audio') && !contentType.includes('octet-stream')) {
          console.warn('[Audio Stream] Invalid content type:', contentType);
          return null;
        }

        const buffer = await response.arrayBuffer();
        if (buffer && buffer.byteLength > 44) {
          if (typeof window !== 'undefined' && 'caches' in window) {
            const responseToCache = new Response(buffer.slice(0), {
              headers: {
                'content-type': contentType || 'audio/wav',
                'cache-control': 'public, max-age=31536000, immutable',
              },
            });
            caches.open(TTS_CACHE_NAME)
              .then((cache) => cache.put(fullUrl, responseToCache))
              .catch((err) => console.warn('[CacheStorage] Write warning:', err));
          }

          const blob = new Blob([buffer], { type: contentType || 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);

          // LRU Eviction guard for Level 1 memory cache (max 250 entries)
          if (audioMemoryCache.size > 250) {
            const oldestKey = audioMemoryCache.keys().next().value;
            if (oldestKey) {
              const oldEntry = audioMemoryCache.get(oldestKey);
              if (oldEntry?.blobUrl) URL.revokeObjectURL(oldEntry.blobUrl);
              audioMemoryCache.delete(oldestKey);
            }
          }

          const entry: CachedAudioItem = { blobUrl, buffer };
          audioMemoryCache.set(cacheKey, entry);
          return entry;
        }
      }
    } catch (err) {
      console.warn('[Audio Stream] Fetch error:', err);
    }

    return null;
  })();

  inFlightAudioFetches.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlightAudioFetches.delete(cacheKey);
  }
}

export async function getOrFetchAudioBlobUrl(streamUrl: string, cacheKey: string): Promise<string | null> {
  const item = await getOrFetchAudioItem(streamUrl, cacheKey);
  return item ? item.blobUrl : null;
}

let serverTTSCooldownUntil = 0;

export function subscribeToSpeechState(listener: (isSpeaking: boolean, text: string | null) => void) {
  speechListeners.add(listener);
  return () => {
    speechListeners.delete(listener);
  };
}

export function subscribeToVoiceUpdates(listener: (voices: SpeechSynthesisVoice[]) => void) {
  voiceUpdateListeners.add(listener);
  if (voicesLoaded && cachedVoices.length > 0) {
    listener(cachedVoices);
  }
  return () => {
    voiceUpdateListeners.delete(listener);
  };
}

function notifySpeechState(isSpeaking: boolean, text: string | null) {
  speechListeners.forEach((listener) => {
    try {
      listener(isSpeaking, text);
    } catch (e) {
      console.error(e);
    }
  });
}

function notifyVoiceUpdates(voices: SpeechSynthesisVoice[]) {
  voiceUpdateListeners.forEach((listener) => {
    try {
      listener(voices);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Known notoriously robotic/mechanical voices to heavily penalize
 */
const ROBOTIC_VOICE_NAMES = [
  'espeak',
  'espeak-ng',
  'albert',
  'bad news',
  'bahh',
  'bells',
  'boing',
  'cellos',
  'deranged',
  'good news',
  'hysterical',
  'pipe organ',
  'trinoids',
  'whisper',
  'zarvox',
  'fred',
  'junior',
  'ralph',
];

/**
 * Scores a system voice based on fluidity and human naturalness.
 * High score = smooth, fluid, natural prosody.
 * Negative score = mechanical, robotic legacy synth.
 */
export function rateVoiceNaturalness(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const uri = voice.voiceURI.toLowerCase();
  let score = 0;

  // 1. Direct penalty for known robotic synths
  for (const roboticName of ROBOTIC_VOICE_NAMES) {
    if (name.includes(roboticName) || uri.includes(roboticName)) {
      return -500;
    }
  }

  // 2. Microsoft Natural / Online voices (Industry-leading fluidity)
  if (name.includes('natural')) score += 200;
  if (name.includes('online (natural)')) score += 220;
  if (name.includes('neural')) score += 180;

  // 3. Apple Enhanced / Premium / Siri voices
  if (name.includes('enhanced')) score += 160;
  if (name.includes('premium')) score += 150;
  if (name.includes('siri')) score += 140;

  // 4. Google Neural / Standard Natural voices
  if (name.includes('google') && !name.includes('espeak')) {
    score += 100;
    if (name.includes('natural') || name.includes('wavenet') || name.includes('neural2')) {
      score += 120;
    }
  }

  // 5. Specific high-fluidity human voice personas
  if (
    name.includes('jenny') ||
    name.includes('aria') ||
    name.includes('guy') ||
    name.includes('sonia') ||
    name.includes('ryan') ||
    name.includes('ana') ||
    name.includes('christopher')
  ) {
    score += 80;
  }

  if (
    name.includes('samantha') ||
    name.includes('ava') ||
    name.includes('zoe') ||
    name.includes('evan') ||
    name.includes('oliver') ||
    name.includes('allison') ||
    name.includes('tom') ||
    name.includes('serena') ||
    name.includes('daniel') ||
    name.includes('karen')
  ) {
    score += 60;
  }

  // General OS clean voices
  if (name.includes('victoria') || name.includes('moira') || name.includes('fiona') || name.includes('tessa')) {
    score += 40;
  }

  // Penalize desktop/compact legacy tags
  if (name.includes('desktop')) score -= 50;
  if (name.includes('compact')) score -= 30;

  // Boost if on-device localService for 100% offline zero-latency guarantee
  if (voice.localService) {
    score += 15;
  }

  return score;
}

/**
 * Checks if a voice is considered "Fluid / Natural Human"
 */
export function isVoiceFluid(voice: SpeechSynthesisVoice): boolean {
  return rateVoiceNaturalness(voice) >= 50;
}

/**
 * Queries window.speechSynthesis.getVoices() with asynchronous polling
 * and onvoiceschanged registration.
 */
export function querySystemVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
    voicesLoaded = true;
    notifyVoiceUpdates(cachedVoices);
  }
  return cachedVoices;
}

/**
 * Initialize voices with polling fallback for browsers (Chrome/Safari) where
 * getVoices() is empty on the first tick.
 */
export function initSpeechSynthesis(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  querySystemVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      querySystemVoices();
    };
  }

  // Periodic polling for the first 3 seconds to catch late-loading voices
  let attempts = 0;
  const pollInterval = setInterval(() => {
    attempts++;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      notifyVoiceUpdates(cachedVoices);
      clearInterval(pollInterval);
    }
    if (attempts >= 15) {
      clearInterval(pollInterval);
    }
  }, 200);

  return cachedVoices;
}

if (typeof window !== 'undefined') {
  initSpeechSynthesis();
}

/**
 * Get all available system voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (!voicesLoaded || cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

/**
 * System voice preference mappings per persona to guarantee audibly distinct,
 * authentic voice characteristics on iOS, Android, and Desktop on-device speech.
 */
export const PERSONA_SYSTEM_VOICE_PREFERENCES: Record<string, { preferred: string[]; avoid?: string[] }> = {
  // Piper Neural Personas
  amy: { preferred: ['samantha', 'ava', 'zoe', 'jenny', 'allison'], avoid: ['daniel', 'david', 'male'] },
  danny: { preferred: ['junior', 'oliver', 'kid', 'child', 'daniel', 'evan'], avoid: ['female', 'samantha', 'karen'] },
  bryce: { preferred: ['oliver', 'evan', 'ryan', 'daniel', 'guy'], avoid: ['female', 'samantha', 'karen'] },
  ryan: { preferred: ['ryan', 'guy', 'daniel', 'david', 'alex'], avoid: ['female', 'samantha', 'karen'] },
  kristin: { preferred: ['karen', 'ava', 'samantha', 'jenny', 'aria'], avoid: ['daniel', 'david', 'male'] },
  lessac: { preferred: ['serena', 'victoria', 'moira', 'allison', 'aria'], avoid: ['daniel', 'david', 'male'] },
  joe: { preferred: ['david', 'daniel', 'alex', 'mark', 'bruce'], avoid: ['female', 'samantha'] },
  claude: { preferred: ['george', 'bruce', 'daniel', 'alex', 'david'], avoid: ['female', 'samantha'] },
  davefx: { preferred: ['bruce', 'david', 'daniel', 'alex', 'guy'], avoid: ['female', 'samantha'] },
  upmc: { preferred: ['moira', 'victoria', 'allison', 'karen', 'serena'], avoid: ['daniel', 'david', 'male'] },
  ja_haruto: { preferred: ['otoya', 'hattori', 'google', 'male'], avoid: ['kyoko', 'female'] },
  ja_sakura: { preferred: ['kyoko', 'google', 'female', 'ayumi'], avoid: ['otoya', 'male'] },
  ko_minjun: { preferred: ['minjun', 'google', 'male'], avoid: ['yuna', 'female'] },
  ko_seoyeon: { preferred: ['yuna', 'sora', 'google', 'female'], avoid: ['male'] },

  // Legacy persona mappings for backward compatibility
  fenrir: { preferred: ['daniel', 'david', 'guy', 'ryan', 'oliver', 'george', 'mark', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  zephyr: { preferred: ['daniel', 'oliver', 'ryan', 'david', 'guy', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  achird: { preferred: ['daniel', 'george', 'david', 'mark', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  iapetus: { preferred: ['daniel', 'david', 'bruce', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  algenib: { preferred: ['daniel', 'guy', 'david', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  rasalas: { preferred: ['daniel', 'ryan', 'david', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  achernar: { preferred: ['daniel', 'oliver', 'ryan', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  leda: { preferred: ['karen', 'ava', 'zoe', 'jenny', 'allison'], avoid: ['daniel', 'david', 'male'] },
  puck: { preferred: ['samantha', 'ava', 'zoe', 'jenny'], avoid: ['daniel', 'david', 'male'] },
  aoede: { preferred: ['moira', 'victoria', 'serena', 'fiona'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  callirrhoe: { preferred: ['moira', 'serena', 'victoria'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  autonoe: { preferred: ['tessa', 'fiona', 'hazel'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  sulafat: { preferred: ['tessa', 'karen', 'fiona'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  kore: { preferred: ['samantha', 'allison', 'susan', 'aria'], avoid: ['daniel', 'david', 'male'] },
  vindemiatrix: { preferred: ['samantha', 'susan', 'allison'], avoid: ['daniel', 'david', 'male'] },
  polaris: { preferred: ['samantha', 'allison', 'aria'], avoid: ['daniel', 'david', 'male'] },
  erinome: { preferred: ['karen', 'zira', 'jenny', 'aria'], avoid: ['daniel', 'david', 'male'] },
  despina: { preferred: ['karen', 'zira', 'jenny', 'aria'], avoid: ['daniel', 'david', 'male'] },
  sadachbia: { preferred: ['karen', 'ava', 'zoe'], avoid: ['daniel', 'david', 'male'] },
  alchiba: { preferred: ['karen', 'ava', 'zoe'], avoid: ['daniel', 'david', 'male'] },
};

/**
 * Finds and returns the single highest-quality, most fluid system voice
 * available on the user's device for a given language.
 */
export function getBestSystemVoice(langPrefix = 'en', persona?: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const targetPrefix = (langPrefix || 'en').toLowerCase();
  const isCanadianFrench = targetPrefix === 'fr_ca' || targetPrefix === 'fr-ca';

  const matchingVoices = voices.filter((v) => {
    const l = v.lang.toLowerCase();
    if (isCanadianFrench) {
      return l.startsWith('fr');
    }
    return l.startsWith(targetPrefix);
  });

  const candidates = matchingVoices.length > 0 ? matchingVoices : voices;
  if (candidates.length === 0) return null;

  const personaObj = getVoicePersonaById(persona);
  const personaId = (personaObj.id || '').toLowerCase();
  const pref = PERSONA_SYSTEM_VOICE_PREFERENCES[personaId];

  const isPreferFemale = personaObj.gender === 'female';
  const isPreferMale = personaObj.gender === 'male';
  const isChild = personaObj.gender === 'child';

  const femaleKeywords = ['female', 'zira', 'jenny', 'aria', 'samantha', 'ava', 'zoe', 'allison', 'karen', 'serena', 'victoria', 'moira', 'fiona', 'tessa', 'ana', 'hazel', 'susan', 'cathy', 'agnes'];
  const maleKeywords = ['male', 'david', 'puck', 'guy', 'ryan', 'daniel', 'oliver', 'evan', 'tom', 'alex', 'george', 'mark', 'christopher', 'fred', 'bruce', 'ralph'];
  const childKeywords = ['child', 'junior', 'kid', 'youth', 'puck', 'ava', 'zoe'];

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = rateVoiceNaturalness(v);
    const n = v.name.toLowerCase();

    if (isCanadianFrench) {
      if (v.lang.toLowerCase().includes('ca') || n.includes('canada')) score += 100;
    }

    // Persona-specific preference boost
    if (pref) {
      if (pref.preferred.some((k) => n.includes(k))) score += 800;
      if (pref.avoid && pref.avoid.some((k) => n.includes(k))) score -= 600;
    }

    if (isPreferMale) {
      if (maleKeywords.some((k) => n.includes(k))) score += 500;
      if (femaleKeywords.some((k) => n.includes(k))) score -= 500;
    } else if (isPreferFemale) {
      if (femaleKeywords.some((k) => n.includes(k))) score += 500;
      if (maleKeywords.some((k) => n.includes(k))) score -= 500;
    } else if (isChild) {
      if (childKeywords.some((k) => n.includes(k))) score += 600;
      if (pref && pref.avoid?.includes('female')) {
        if (maleKeywords.some((k) => n.includes(k))) score += 300;
        if (femaleKeywords.some((k) => n.includes(k))) score -= 500;
      } else {
        if (femaleKeywords.some((k) => n.includes(k))) score += 200;
      }
    }
    return score;
  };

  const sorted = [...candidates].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0] || null;
}

/**
 * Returns available voices ordered by naturalness and fluidity.
 */
export function getOfflineCapableVoices(langPrefix = 'en'): SpeechSynthesisVoice[] {
  const all = getAvailableVoices();
  const filtered = all.filter((v) => {
    return !langPrefix || v.lang.toLowerCase().startsWith(langPrefix.toLowerCase());
  });

  return filtered.sort((a, b) => rateVoiceNaturalness(b) - rateVoiceNaturalness(a));
}

/**
 * Categorizes system voices into Fluid/Natural vs Standard for parent UI
 */
export function getCategorizedVoices(langPrefix = 'en'): {
  fluidVoices: { voice: SpeechSynthesisVoice; score: number }[];
  standardVoices: { voice: SpeechSynthesisVoice; score: number }[];
  allVoices: SpeechSynthesisVoice[];
  bestVoice: SpeechSynthesisVoice | null;
} {
  const voices = getAvailableVoices().filter((v) =>
    !langPrefix || v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
  );

  const scored = voices.map((voice) => ({
    voice,
    score: rateVoiceNaturalness(voice),
  })).sort((a, b) => b.score - a.score);

  const fluidVoices = scored.filter((item) => item.score >= 50);
  const standardVoices = scored.filter((item) => item.score < 50 && item.score > -200);

  return {
    fluidVoices,
    standardVoices,
    allVoices: scored.map((s) => s.voice),
    bestVoice: scored[0]?.voice || null,
  };
}

/**
 * Strips all Unicode emojis, pictograms, and visual symbols from text
 * so TTS engines only read spoken words and never describe emojis aloud.
 */
export function stripEmojis(text: string): string {
  if (!text) return '';
  return text
    // Replace standard Unicode emoji ranges and presentation selectors
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols (sun, umbrella, etc.)
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats (sparkles, checkmarks, etc.)
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '') // Flags
    .replace(/\p{Extended_Pictographic}/gu, '') // Modern Unicode Extended Pictographic
    .replace(/\s+/g, ' ')                   // Collapse multiple spaces
    .trim();
}

/**
 * Format phrases for natural human speech cadence and conversational prosody without emojis.
 * Removes internal periods, commas, or unnatural stops that create robotic word-by-word cadences.
 */
export function formatForNaturalSpeech(text: string): string {
  let cleaned = stripEmojis(text.trim()).replace(/\s+/g, ' ');
  if (!cleaned) return '';

  // Clean dual slash labels like "My/Mine", "My / Mine", "I / Me", "Yes / Good", "No / Stop"
  // Speak ONLY the first word so it never repeats or pronounces "slash"
  if (cleaned.includes('/')) {
    cleaned = cleaned.split('/')[0].trim();
  }

  // Clean mid-phrase periods, semicolons, and unnatural internal stops that fragment speech into robotic word chunks.
  // e.g., "I. want. a. drink." -> "I want a drink."
  cleaned = cleaned.replace(/([a-zA-Z0-9\u00C0-\u024F])\s*[\.,;:]\s*(?=[a-zA-Z0-9\u00C0-\u024F])/g, (m, p1) => p1 + ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned) return '';

  // Detect if original text intentionally ended with a question mark or exclamation mark
  const isQuestion = /\?$/.test(text.trim());
  const isExclamation = /!$/.test(text.trim());

  // Remove any remaining trailing punctuation before adding the final sentence cadence mark
  cleaned = cleaned.replace(/[\.,;:!\?\s]+$/, '');
  if (!cleaned) return '';

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Add final cadence mark:
  // - Multi-word phrases or sentences get terminal punctuation (., ?, !) for natural human sentence cadence
  // - Single isolated AAC word tiles remain open without a trailing period to prevent unnatural falling pitch drops
  if (isQuestion) {
    cleaned += '?';
  } else if (isExclamation) {
    cleaned += '!';
  } else if (cleaned.includes(' ')) {
    cleaned += '.';
  }

  return cleaned;
}

// Active utterance retain set to prevent Android Chrome V8 Garbage Collector from cutting speech
const activeUtterancesSet = new Set<SpeechSynthesisUtterance>();
let pendingSpeakTimeout: any = null;
if (typeof window !== 'undefined') {
  (window as any).__beeyouUtterances = activeUtterancesSet;
}

/**
 * Stop active hardware audio outputs (Web Audio node, HTML5 Audio, Web Speech API)
 * without incrementing the global speech request ID. Used internally so starting a new
 * utterance terminates any prior sound without cancelling itself.
 */
function stopAudioHardware() {
  if (pendingSpeakTimeout) {
    clearTimeout(pendingSpeakTimeout);
    pendingSpeakTimeout = null;
  }
  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch (e) {}
    activeSourceNode = null;
  }
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
      activeAudioElement.load();
    } catch (e) {}
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    activeUtterancesSet.forEach((u) => {
      try {
        (u as any).__beeyouCancelled = true;
      } catch (e) {}
    });
    if (activeUtterance) {
      (activeUtterance as any).__beeyouCancelled = true;
    }
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
    activeUtterance = null;
    activeUtterancesSet.clear();
  }
  notifySpeechState(false, null);
}

/**
 * Stop any current vocalization immediately and invalidate all pending speech requests
 */
export function stopSpeaking() {
  latestSpeechRequestId++;
  stopAudioHardware();
}

/**
 * Main vocalization function:
 * 1. Executes instantaneous, zero-latency on-device SpeechSynthesis for reliable Android & offline speech.
 * 2. If memory-cached audio exists from previous server synthesis, plays it immediately.
 * 3. Never blocks user-gesture activation behind failing network calls.
 */
/**
 * Top high-frequency AAC vocabulary pre-bundled offline for 0ms instantaneous speech
 */
export const CORE_AAC_VOCABULARY = [
  'Yes',
  'No',
  'Help',
  'Water',
  'More',
  'Stop',
  'Please',
  'Thank You',
  'All Done',
  'I',
  'You',
  'We',
  'My',
  'Want',
  'Need',
  'Like',
  'Go',
  'See',
  'Feel',
  'Eat',
  'Drink',
  'Play',
  'Wait',
  'Happy',
  'Calm',
  'Sad',
  'Angry',
  'Tired',
  'Apple',
  'Pizza',
  'Bathroom',
  'Break',
  'Home',
  'Food',
  'This',
  'A',
  'To',
  // 9 Tactile AAC Sensory Board Communicative Phrases
  'I want food',
  'I want a drink',
  'I want to play',
  'Go somewhere',
  'How I feel',
  'I need a break',
  'I want this',
  'I need help',
  'Please stop',
  // Sensory Needs
  'Too loud',
  'It is too loud',
  'Too bright',
  'It is too bright',
];

export const BUNDLED_CORE_SLUGS = new Set<string>(
  CORE_AAC_VOCABULARY.map((phrase) => phrase.toLowerCase().replace(/[^a-z0-9]/g, ''))
);

export const PERSONA_ACOUSTIC_PROFILES: Record<string, { pitch: number; rate: number }> = {
  system: { pitch: 1.0, rate: 1.0 },

  // Piper On-Device Neural Personas - Distinct Characteristic Acoustic Profiles
  amy: { pitch: 1.06, rate: 0.98 },      // Warm & caring maternal narrator
  danny: { pitch: 1.28, rate: 1.06 },    // Energetic & cheerful 8yo boy child
  bryce: { pitch: 1.18, rate: 0.94 },    // Gentle, soft, patient boy child
  ryan: { pitch: 1.02, rate: 1.02 },     // Clear & relatable teenage boy
  kristin: { pitch: 1.22, rate: 1.02 },  // Bright, cheerful young girl
  lessac: { pitch: 0.96, rate: 0.95 },   // Articulate, measured narrator
  joe: { pitch: 0.82, rate: 0.92 },      // Deep, grounded, calm adult male
  claude: { pitch: 0.92, rate: 0.98 },   // Warm, friendly conversational male
  davefx: { pitch: 0.85, rate: 0.94 },   // Relaxed, deep baritone male
  upmc: { pitch: 1.12, rate: 0.94 },     // Gentle, soothing caregiver

  // Legacy Persona mappings for backward compatibility
  puck: { pitch: 1.00, rate: 1.04 },
  leda: { pitch: 1.00, rate: 1.00 },
  sadachbia: { pitch: 1.00, rate: 1.00 },
  achernar: { pitch: 1.00, rate: 1.00 },
  alchiba: { pitch: 1.00, rate: 1.00 },
  zephyr: { pitch: 1.00, rate: 1.00 },
  fenrir: { pitch: 1.00, rate: 1.00 },
  aoede: { pitch: 1.00, rate: 1.00 },
  callirrhoe: { pitch: 1.00, rate: 1.00 },
  autonoe: { pitch: 1.00, rate: 1.00 },
  sulafat: { pitch: 1.00, rate: 1.00 },
  kore: { pitch: 1.00, rate: 1.00 },
  vindemiatrix: { pitch: 1.00, rate: 1.00 },
  polaris: { pitch: 1.00, rate: 1.00 },
  erinome: { pitch: 1.00, rate: 1.00 },
  despina: { pitch: 1.00, rate: 1.00 },
  algieba: { pitch: 1.00, rate: 1.00 },
  charon: { pitch: 1.00, rate: 1.00 },
  kalyke: { pitch: 1.00, rate: 1.00 },
  vega: { pitch: 1.00, rate: 1.00 },
  schedar: { pitch: 1.00, rate: 1.00 },
  achird: { pitch: 1.00, rate: 1.00 },
  umbriel: { pitch: 1.00, rate: 1.00 },
  zubenelgenubi: { pitch: 1.00, rate: 1.00 },
  rasalas: { pitch: 1.00, rate: 1.00 },
  capella: { pitch: 1.00, rate: 1.00 },
  iapetus: { pitch: 1.00, rate: 1.00 },
  sadaltager: { pitch: 1.00, rate: 1.00 },
  tarazed: { pitch: 1.00, rate: 1.00 },
};

let latestSpeechRequestId = 0;

/**
 * Checks whether the current device profile holds an active Premium subscription or valid trial.
 * Used to safeguard premium Gemini AI voice personas against unauthorized Basic tier access.
 */
export function isDeviceEntitledToPremiumVoices(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem('beeyou_subscription');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return isPremiumSubscription(parsed);
  } catch {
    return false;
  }
}

export async function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    voicePersona?: string; // 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'system'
    lang?: string;
    preferOfflineOnly?: boolean;
    force?: boolean;
    previewAudio?: boolean;
    sentenceWords?: string[];
    gestureTime?: number;
  }
): Promise<void> {
  const tHandlerStart = performance.now();
  const tapToHandlerMs = options?.gestureTime ? Math.max(0, Math.round(tHandlerStart - options.gestureTime)) : 0;
  const formattedText = formatForNaturalSpeech(text);
  if (!formattedText) return;

  // Immediately cancel any prior in-flight speech to prevent double/overlapping vocalization on rapid clicks
  stopSpeaking();
  const speechId = latestSpeechRequestId;

  // CRITICAL FOR IOS SAFARI & CAPACITOR:
  // Synchronously initialize and resume Web Audio context during the active user gesture.
  // This unlocks the audio hardware pipeline before any async operations occur.
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const rawPersona = options?.voicePersona || 'amy';
  const personaObj = getVoicePersonaById(rawPersona);
  let selectedPersonaId = personaObj.id;

  // Dynamically resolve active application language from options or global translation state
  const activeAppLang = (options?.lang && options.lang !== 'en') ? options.lang : (getLanguage() || options?.lang || 'en');
  const lang = (activeAppLang || 'en').toLowerCase();
  const normalizedLang = 
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  const isNonEnglish = normalizedLang !== 'en';

  // Acoustic Calibration & Rate Calculation:
  const userBasePitch = options?.pitch ?? 1.0;
  const userBaseRate = options?.rate ?? 1.0;
  const profile = PERSONA_ACOUSTIC_PROFILES[selectedPersonaId] || { pitch: 1.0, rate: 1.0 };

  const calibratedPitch = Math.max(0.5, Math.min(1.85, userBasePitch * profile.pitch));
  const calibratedRate = Math.max(0.55, Math.min(1.6, userBaseRate * profile.rate));

  const voiceToStream = selectedPersonaId === 'system' ? getDefaultVoicePersonaForLanguage(normalizedLang) : selectedPersonaId;
  const isConstructedSentence = Boolean(
    options?.sentenceWords && options.sentenceWords.length > 1
  );
  const isMultiWord = Boolean(
    isConstructedSentence || formattedText.trim().split(/\s+/).length > 1
  );

  const tVoiceResolved = performance.now();
  const voiceResolutionMs = Math.round(tVoiceResolved - tHandlerStart);

  const recordReport = (
    engine: SpeechLatencyReport['engine'],
    isCached: boolean,
    piperInitMs: number,
    phonemizeMs: number,
    onnxInferenceMs: number,
    audioDecodeMs: number,
    playbackSchedulingMs: number
  ) => {
    const totalToAudibleMs = options?.gestureTime
      ? Math.max(0, Math.round(performance.now() - options.gestureTime))
      : Math.max(0, Math.round(performance.now() - tHandlerStart));

    const report: SpeechLatencyReport = {
      text: formattedText,
      voicePersona: selectedPersonaId,
      engine,
      isCached,
      tapToHandlerMs,
      voiceResolutionMs,
      piperInitMs,
      phonemizeMs,
      onnxInferenceMs,
      audioDecodeMs,
      playbackSchedulingMs,
      totalToAudibleMs,
      timestamp: Date.now(),
    };
    lastSpeechLatencyReport = report;
    logLatencyBreakdown(report);
  };

  // 1. Audition / Voice Studio Preview Vocalization
  if (options?.previewAudio) {
    if (selectedPersonaId !== 'system') {
      const previewCandidateUrls = [
        `/assets/audio/previews/${selectedPersonaId}.wav`,
        `/assets/audio/previews/${selectedPersonaId}.mp3`,
      ];
      for (const previewUrl of previewCandidateUrls) {
        try {
          const res = await fetch(previewUrl);
          const ct = res.headers.get('content-type') || '';
          if (res.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
            const buf = await res.arrayBuffer();
            if (isAudioPayload(buf)) {
              const previewKey = `preview_${selectedPersonaId}`;
              const played = await playAudioUrl(buf, formattedText, calibratedRate, speechId, undefined, previewKey, (t) => {
                recordReport('core_audio', true, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
              });
              if (played || speechId !== latestSpeechRequestId) return;
            }
          }
        } catch {}
      }
    }

    // 1b. On-device Piper neural preview
    if (selectedPersonaId !== 'system') {
      try {
        const piperBuf = await synthesizeWithPiper(formattedText, selectedPersonaId, normalizedLang, 3500);
        if (speechId !== latestSpeechRequestId) return;
        if (piperBuf && isAudioPayload(piperBuf)) {
          const previewKey = `preview_piper_${selectedPersonaId}_${normalizedLang}`;
          const { onnxInferenceMs, phonemizeMs } = getLastPiperTimings();
          const played = await playAudioUrl(piperBuf, formattedText, calibratedRate, speechId, undefined, previewKey, (t) => {
            recordReport('piper', false, 0, phonemizeMs, onnxInferenceMs, t.audioDecodeMs, t.playbackSchedulingMs);
          });
          if (played || speechId !== latestSpeechRequestId) return;
        }
      } catch (piperErr) {
        console.warn('[AAC Speech] Preview Piper synthesis notice:', piperErr);
      }
    }

    // 1c. Universal Edge TTS Stream Preview (/api/tts)
    try {
      const previewCacheKey = getTtsCacheKey(voiceToStream, normalizedLang, formattedText);
      const previewStreamUrl = getTtsStreamUrl(voiceToStream, normalizedLang, formattedText);
      const serverItem = await getOrFetchAudioItem(previewStreamUrl, previewCacheKey);
      if (speechId !== latestSpeechRequestId) return;
      if (serverItem && isAudioPayload(serverItem.buffer)) {
        const played = await playAudioUrl(serverItem.buffer, formattedText, calibratedRate, speechId, undefined, previewCacheKey, (t) => {
          recordReport('server_stream', false, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
        });
        if (played || speechId !== latestSpeechRequestId) return;
      }
    } catch (streamErr) {
      console.warn('[AAC Speech] Preview server stream notice:', streamErr);
    }

    // 1d. Native Browser Speech Synthesis Fallback
    if (speechId !== latestSpeechRequestId) return;
    const browserSuccess = await speakWithBrowserSpeechSynthesis(formattedText, {
      ...options,
      voicePersona: selectedPersonaId,
      pitch: calibratedPitch,
      rate: calibratedRate,
      force: options?.force,
    });
    if (browserSuccess || speechId !== latestSpeechRequestId) return;

    // 1e. Sensory chime fallback if audio generation failed completely
    if (speechId === latestSpeechRequestId) {
      playChime('speak');
    }
    return;
  }

  const cacheKey = getTtsCacheKey(voiceToStream, normalizedLang, formattedText);
  const streamUrl = getTtsStreamUrl(voiceToStream, normalizedLang, formattedText);

  // 2. Direct Whole-Sentence Native Vocalization for Multi-Word Sentences
  // Constructed AAC sentences are vocalized directly as a single, fluid utterance
  // with natural human prosody, proper cadence, and calibrated persona acoustic profiles.
  // Priority:
  // Priority 1: Piper full-sentence neural synthesis (with local cache check first)
  // Priority 2: System text-to-speech fallback (whole sentence as one continuous utterance)
  // Priority 3: Offline prerecorded-word stitching emergency fallback (synthesizeOfflineSentence via Web Audio)
  if (isMultiWord) {
    // 2a. Fast Local Cache Lookup (L1 RAM + L2 CacheStorage)
    const localCached = await getLocalCacheOnly(streamUrl, cacheKey);
    if (speechId !== latestSpeechRequestId) return;
    if (localCached && isAudioPayload(localCached.buffer)) {
      console.log(`[AAC Speech] Playing multi-word sentence via local cache (${selectedPersonaId})`);
      const played = await playAudioUrl(localCached.buffer, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
        recordReport('local_cache', true, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
      });
      if (played || speechId !== latestSpeechRequestId) return;
    }

    // Priority 1: Piper On-Device Neural Synthesis (Preferred whole-sentence neural engine)
    if (selectedPersonaId !== 'system') {
      try {
        const piperBuf = await synthesizeWithPiper(formattedText, selectedPersonaId, normalizedLang, 3500);
        if (speechId !== latestSpeechRequestId) return;
        if (piperBuf && isAudioPayload(piperBuf)) {
          console.log(`[AAC Speech] Playing multi-word sentence via Piper on-device neural engine (${selectedPersonaId})`);
          // Cache in L1 memory and L2 CacheStorage for subsequent 0ms replay
          const blob = new Blob([piperBuf], { type: 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);
          audioMemoryCache.set(cacheKey, { blobUrl, buffer: piperBuf });
          if (typeof window !== 'undefined' && 'caches' in window) {
            const fullUrl = new URL(streamUrl, window.location.origin).href;
            const resToCache = new Response(piperBuf.slice(0), {
              headers: {
                'content-type': 'audio/wav',
                'cache-control': 'public, max-age=31536000, immutable',
              },
            });
            caches.open(TTS_CACHE_NAME).then((c) => c.put(fullUrl, resToCache)).catch(() => {});
          }

          const { onnxInferenceMs, phonemizeMs } = getLastPiperTimings();
          const played = await playAudioUrl(piperBuf, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
            recordReport('piper', false, 0, phonemizeMs, onnxInferenceMs, t.audioDecodeMs, t.playbackSchedulingMs);
          });
          if (played || speechId !== latestSpeechRequestId) return;
        }
      } catch (piperErr) {
        console.warn('[AAC Speech] Piper sentence synthesis error:', piperErr);
      }
    }

    // Priority 2: Universal Edge TTS Stream (/api/tts)
    try {
      const serverItem = await getOrFetchAudioItem(streamUrl, cacheKey);
      if (speechId !== latestSpeechRequestId) return;
      if (serverItem && isAudioPayload(serverItem.buffer)) {
        console.log(`[AAC Speech] Playing multi-word sentence via edge TTS stream (${voiceToStream})`);
        const played = await playAudioUrl(serverItem.buffer, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
          recordReport('server_stream', false, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
        });
        if (played || speechId !== latestSpeechRequestId) return;
      }
    } catch (streamErr) {
      console.warn('[AAC Speech] Edge TTS multi-word stream notice:', streamErr);
    }

    // Priority 3: System text-to-speech fallback (single continuous utterance)
    if (speechId !== latestSpeechRequestId) return;
    console.log(`[AAC Speech] Multi-word sentence falling back to system speech synthesis (${selectedPersonaId})`);
    const systemSuccess = await speakWithBrowserSpeechSynthesis(formattedText, {
      ...options,
      voicePersona: selectedPersonaId,
      pitch: calibratedPitch,
      rate: calibratedRate,
      force: options?.force,
    });
    if (systemSuccess || speechId !== latestSpeechRequestId) {
      recordReport('system_speech', false, 0, 0, 0, 0, 0);
      return;
    }

    // Priority 4: Offline pre-recorded word stitching emergency fallback
    console.log(`[AAC Speech] System speech synthesis unavailable or dropped, attempting offline word stitching (${voiceToStream})`);
    try {
      const stitchedWav = await synthesizeOfflineSentence(formattedText, voiceToStream, options?.sentenceWords);
      if (speechId !== latestSpeechRequestId) return;
      if (stitchedWav && isAudioPayload(stitchedWav)) {
        console.log(`[AAC Speech] Playing multi-word sentence via stitched offline recordings (${voiceToStream})`);
        const played = await playAudioUrl(stitchedWav, formattedText, calibratedRate, speechId);
        if (played || speechId !== latestSpeechRequestId) return;
      }
    } catch (stitchErr) {
      console.warn('[AAC Speech] Offline sentence stitching error:', stitchErr);
    }

    // Final fallback: non-intrusive speak chime if all synthesis mechanisms failed
    if (speechId === latestSpeechRequestId) {
      playChime('speak');
    }
    return;
  }

  // 3. Single Word Vocalization
  // When an individual tile is tapped on the board, vocalizes using the consistent selected Piper voice.
  // Priority: 1. Fast Local Cache (0ms instant playback) -> 2. Piper on-device neural synthesis -> 3. Edge TTS stream -> 4. System speech fallback

  // 3a. Local Audio Cache (L1 RAM + L2 CacheStorage)
  const localCachedSingle = await getLocalCacheOnly(streamUrl, cacheKey);
  if (speechId !== latestSpeechRequestId) return;
  if (localCachedSingle && isAudioPayload(localCachedSingle.buffer)) {
    console.log(`[AAC Speech] Playing single word via local cache (${selectedPersonaId})`);
    const played = await playAudioUrl(localCachedSingle.buffer, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
      recordReport('local_cache', true, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
    });
    if (played || speechId !== latestSpeechRequestId) return;
  }

  // 3b. Piper On-Device Neural Synthesis for Single Word
  if (selectedPersonaId !== 'system') {
    try {
      const piperBuf = await synthesizeWithPiper(formattedText, selectedPersonaId, normalizedLang, 1200);
      if (speechId !== latestSpeechRequestId) return;
      if (piperBuf && isAudioPayload(piperBuf)) {
        console.log(`[AAC Speech] Playing single word via Piper neural synthesis (${selectedPersonaId})`);
        const { onnxInferenceMs, phonemizeMs } = getLastPiperTimings();
        const blob = new Blob([piperBuf], { type: 'audio/wav' });
        const blobUrl = URL.createObjectURL(blob);
        audioMemoryCache.set(cacheKey, { blobUrl, buffer: piperBuf });
        const played = await playAudioUrl(piperBuf, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
          recordReport('piper', false, 0, phonemizeMs, onnxInferenceMs, t.audioDecodeMs, t.playbackSchedulingMs);
        });
        if (played || speechId !== latestSpeechRequestId) return;
      }
    } catch (piperErr) {
      console.warn('[AAC Speech] Piper word synthesis error:', piperErr);
    }
  }

  // 3c. Universal Edge TTS Stream for Single Word (/api/tts)
  try {
    const serverItem = await getOrFetchAudioItem(streamUrl, cacheKey);
    if (speechId !== latestSpeechRequestId) return;
    if (serverItem && isAudioPayload(serverItem.buffer)) {
      console.log(`[AAC Speech] Playing single word via edge TTS stream (${voiceToStream})`);
      const played = await playAudioUrl(serverItem.buffer, formattedText, calibratedRate, speechId, undefined, cacheKey, (t) => {
        recordReport('server_stream', false, 0, 0, 0, t.audioDecodeMs, t.playbackSchedulingMs);
      });
      if (played || speechId !== latestSpeechRequestId) return;
    }
  } catch (streamErr) {
    console.warn('[AAC Speech] Edge TTS single-word stream notice:', streamErr);
  }

  // 3d. Native Browser SpeechSynthesis Fallback:
  if (speechId !== latestSpeechRequestId) return;
  console.log(`[AAC Speech] Single word falling back to system speech synthesis (${selectedPersonaId})`);
  const singleSuccess = await speakWithBrowserSpeechSynthesis(formattedText, {
    ...options,
    voicePersona: selectedPersonaId,
    pitch: calibratedPitch,
    rate: calibratedRate,
    force: options?.force,
  });
  if (singleSuccess) {
    recordReport('system_speech', false, 0, 0, 0, 0, 0);
  } else if (speechId === latestSpeechRequestId) {
    playChime('speak');
  }
}

/**
 * Inspects binary data to detect MP3 container format (ID3 header or sync frames).
 */
export function isAudioMp3(buffer: ArrayBuffer | null | undefined): boolean {
  if (!buffer || buffer.byteLength < 4) return false;
  const view = new DataView(buffer);
  // ID3 tag check (0x494433 = 'ID3')
  const isId3 = (view.getUint32(0, false) & 0xFFFFFF00) === 0x49443300;
  if (isId3) return true;
  // MP3 frame sync check (0xFFE0 mask)
  const isSyncAt0 = (view.getUint16(0, false) & 0xFFE0) === 0xFFE0;
  if (isSyncAt0) return true;
  // Scan first 512 bytes for sync word
  const maxSearch = Math.min(buffer.byteLength - 2, 512);
  for (let i = 1; i < maxSearch; i++) {
    if ((view.getUint16(i, false) & 0xFFE0) === 0xFFE0) {
      return true;
    }
  }
  return false;
}

/**
 * Verifies that a binary ArrayBuffer is an authentic audio stream (WAV, MP3, or OGG),
 * and strictly rejects non-audio text data (such as HTML error pages or JSON strings).
 */
export function isAudioPayload(buffer: ArrayBuffer | null | undefined): boolean {
  if (!buffer || buffer.byteLength < 44) return false;
  const view = new DataView(buffer);
  const b0 = view.getUint8(0);
  const b1 = view.getUint8(1);

  // Reject text strings like HTML ('<'), JSON ('{'), brackets ('['), or whitespace
  if (b0 === 0x3C || b0 === 0x7B || b0 === 0x5B || (b0 === 0x20 && b1 === 0x20)) {
    return false;
  }

  // Check for 'RIFF' (0x52494646) and 'WAVE' (0x57415645)
  const isRiff = view.getUint32(0, false) === 0x52494646;
  const isWave = view.getUint32(8, false) === 0x57415645;
  if (isRiff && isWave) return true;

  // Check for MP3 (ID3 tag or sync word)
  if (isAudioMp3(buffer)) return true;

  // Check for Ogg container
  const isOgg = view.getUint32(0, false) === 0x4F676753;
  if (isOgg) return true;

  return false;
}

/**
 * Strips non-standard trailing subchunks (such as Google Gemini's 6066-byte C2PA chunk)
 * and reconstructs a pristine canonical RIFF WAV ArrayBuffer containing strictly the
 * 'fmt ' and 'data' chunks. Guarantees 100% decodeAudioData compatibility on iOS WebKit/CoreAudio
 * and Android WebView without decoder rejection.
 */
export function cleanRiffWav(buffer: ArrayBuffer): ArrayBuffer {
  if (!buffer || buffer.byteLength < 44) return buffer;
  const view = new DataView(buffer);
  if (view.getUint32(0, false) !== 0x52494646 || view.getUint32(8, false) !== 0x57415645) {
    return buffer;
  }
  let offset = 12;
  let fmtOffset = -1;
  let fmtLen = 0;
  let dataOffset = -1;
  let dataLen = 0;

  while (offset + 8 <= buffer.byteLength) {
    const chunkId =
      String.fromCharCode(view.getUint8(offset)) +
      String.fromCharCode(view.getUint8(offset + 1)) +
      String.fromCharCode(view.getUint8(offset + 2)) +
      String.fromCharCode(view.getUint8(offset + 3));
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      fmtOffset = offset;
      fmtLen = 8 + chunkSize;
    } else if (chunkId === 'data') {
      dataOffset = offset;
      dataLen = 8 + chunkSize;
    }

    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }

  if (fmtOffset === -1 || dataOffset === -1) {
    return buffer;
  }

  // If already strictly canonical (fmt followed immediately by data with no trailing bytes), return as-is
  if (fmtOffset === 12 && dataOffset === 12 + fmtLen && (12 + fmtLen + dataLen === buffer.byteLength)) {
    return buffer;
  }

  const totalRiffSize = 4 + fmtLen + dataLen;
  const out = new ArrayBuffer(8 + totalRiffSize);
  const outView = new DataView(out);
  const outBytes = new Uint8Array(out);
  const inBytes = new Uint8Array(buffer);

  outView.setUint32(0, 0x52494646, false);
  outView.setUint32(4, totalRiffSize, true);
  outView.setUint32(8, 0x57415645, false);

  outBytes.set(inBytes.subarray(fmtOffset, fmtOffset + fmtLen), 12);
  outBytes.set(inBytes.subarray(dataOffset, dataOffset + dataLen), 12 + fmtLen);

  return out;
}

/**
 * Extracts raw PCM byte payload from a standard RIFF WAV buffer,
 * automatically trimming leading and trailing dead silence down to 15ms
 * so stitched sentences flow with natural human prosody.
 */
export function extractWavPcm(buffer: ArrayBuffer, trimSilence = true): Uint8Array | null {
  if (buffer.byteLength < 44) return null;
  const view = new DataView(buffer);
  if (view.getUint32(0, false) !== 0x52494646 || view.getUint32(8, false) !== 0x57415645) {
    return null;
  }
  let offset = 12;
  let sampleRate = 24000;
  let validFormat = false;

  while (offset + 8 <= buffer.byteLength) {
    const chunkId =
      String.fromCharCode(view.getUint8(offset)) +
      String.fromCharCode(view.getUint8(offset + 1)) +
      String.fromCharCode(view.getUint8(offset + 2)) +
      String.fromCharCode(view.getUint8(offset + 3));
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'fmt ') {
      const audioFormat = view.getUint16(offset + 8, true); // 1 = Linear PCM
      const numChannels = view.getUint16(offset + 10, true); // 1 = Mono
      sampleRate = view.getUint32(offset + 12, true);
      const bitsPerSample = view.getUint16(offset + 22, true); // 16-bit
      // Validate Linear PCM (1), Mono (1), and 16-bit
      if (audioFormat === 1 && numChannels === 1 && bitsPerSample === 16) {
        validFormat = true;
      } else {
        return null;
      }
    } else if (chunkId === 'data') {
      if (!validFormat) return null;
      const raw = new Uint8Array(buffer, offset + 8, chunkSize);
      if (!trimSilence || raw.byteLength < 600) return raw;

      const numSamples = Math.floor(raw.byteLength / 2);
      const threshold = 400; // -38 dB threshold

      let startSample = 0;
      for (let i = 0; i < numSamples; i++) {
        const val = Math.abs(view.getInt16(offset + 8 + i * 2, true));
        if (val > threshold) {
          startSample = Math.max(0, i - Math.round(sampleRate * 0.015)); // 15ms lead padding
          break;
        }
      }

      let endSample = numSamples;
      for (let i = numSamples - 1; i >= 0; i--) {
        const val = Math.abs(view.getInt16(offset + 8 + i * 2, true));
        if (val > threshold) {
          endSample = Math.min(numSamples, i + Math.round(sampleRate * 0.025)); // 25ms trail padding
          break;
        }
      }

      if (startSample >= endSample) return raw;
      return new Uint8Array(buffer, offset + 8 + startSample * 2, (endSample - startSample) * 2);
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  return null;
}

/**
 * Offline Neural Sentence Synthesizer:
 * Stitches pre-bundled word assets into a seamless, single canonical WAV audio buffer
 * in the user's selected neural persona (Puck, Fenrir, Kore) with natural 60ms conversational pauses.
 * Completely eliminates robotic system voice reversion during sentence vocalization on iOS and Android.
 */
export async function synthesizeOfflineSentence(
  sentenceText: string,
  personaId: string,
  explicitWords?: string[]
): Promise<ArrayBuffer | null> {
  const rawWords: string[] = (
    explicitWords && explicitWords.length > 0
      ? explicitWords.flatMap((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase().split(/\s+/))
      : sentenceText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase().split(/\s+/)
  ).filter(Boolean);

  if (rawWords.length === 0) return null;

  const pcmBuffers: Uint8Array[] = [];
  const sampleRate = 24000;
  let matchedWordsCount = 0;

  for (let i = 0; i < rawWords.length; i++) {
    let wordMatched = false;

    // 1. Check for 2-word pre-bundled idioms first (e.g. 'all done', 'thank you')
    if (i < rawWords.length - 1) {
      const pairSlug = (rawWords[i] + rawWords[i + 1]).replace(/[^a-z0-9]/g, '');
      const pairUrl = `/assets/audio/core/${personaId}_${pairSlug}.wav`;
      try {
        const pairRes = await fetch(pairUrl);
        const ct = pairRes.headers.get('content-type') || '';
        if (pairRes.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
          const ab = await pairRes.arrayBuffer();
          if (isAudioPayload(ab)) {
            const pcm = extractWavPcm(ab);
            if (pcm) {
              pcmBuffers.push(pcm);
              matchedWordsCount += 2;
              wordMatched = true;
              i++; // consume second word of pair
              continue;
            }
          }
        }
      } catch {}
    }

    // 2. Check for single pre-bundled word
    const singleSlug = rawWords[i].replace(/[^a-z0-9]/g, '');
    if (singleSlug) {
      const singleUrl = `/assets/audio/core/${personaId}_${singleSlug}.wav`;
      try {
        const singleRes = await fetch(singleUrl);
        const ct = singleRes.headers.get('content-type') || '';
        if (singleRes.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
          const ab = await singleRes.arrayBuffer();
          if (isAudioPayload(ab)) {
            const pcm = extractWavPcm(ab);
            if (pcm) {
              pcmBuffers.push(pcm);
              matchedWordsCount += 1;
              wordMatched = true;
              continue;
            }
          }
        }
      } catch {}
    }

    // If this word is not available in pre-bundled offline core recordings,
    // abort offline stitching immediately to avoid stitching an incomplete sentence
    // and to prevent wasted 404 network lookups for subsequent words.
    if (!wordMatched) {
      return null;
    }
  }

  // Must have matched 100% of the words in the sentence
  if (pcmBuffers.length === 0 || matchedWordsCount < rawWords.length) return null;

  // 25ms natural conversational silence gap between words (at 24000Hz 16-bit mono = 1200 bytes)
  const gapBytes = Math.round(sampleRate * 0.025) * 2;
  const gap = new Uint8Array(gapBytes);

  let totalPcmLen = 0;
  for (let i = 0; i < pcmBuffers.length; i++) {
    totalPcmLen += pcmBuffers[i].byteLength;
    if (i < pcmBuffers.length - 1) totalPcmLen += gapBytes;
  }

  const combinedPcm = new Uint8Array(totalPcmLen);
  let writeOffset = 0;
  for (let i = 0; i < pcmBuffers.length; i++) {
    combinedPcm.set(pcmBuffers[i], writeOffset);
    writeOffset += pcmBuffers[i].byteLength;
    if (i < pcmBuffers.length - 1) {
      combinedPcm.set(gap, writeOffset);
      writeOffset += gapBytes;
    }
  }

  // Wrap in a canonical 44-byte RIFF WAV container
  const numChannels = 1;
  const bitDepth = 16;
  const wavBuffer = new ArrayBuffer(44 + totalPcmLen);
  const outView = new DataView(wavBuffer);

  // 'RIFF'
  outView.setUint32(0, 0x52494646, false);
  outView.setUint32(4, 36 + totalPcmLen, true);
  // 'WAVE'
  outView.setUint32(8, 0x57415645, false);
  // 'fmt '
  outView.setUint32(12, 0x666D7420, false);
  outView.setUint32(16, 16, true);
  outView.setUint16(20, 1, true); // Linear PCM
  outView.setUint16(22, numChannels, true);
  outView.setUint32(24, sampleRate, true);
  outView.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  outView.setUint16(32, numChannels * (bitDepth / 8), true);
  outView.setUint16(34, bitDepth, true);
  // 'data'
  outView.setUint32(36, 0x64617461, false);
  outView.setUint32(40, totalPcmLen, true);

  new Uint8Array(wavBuffer, 44).set(combinedPcm);
  return wavBuffer;
}

/**
 * Inspects audio ArrayBuffer before decoding.
 * Validates audio container headers and protects against non-audio text payloads.
 * Automatically cleans any trailing metadata chunks (such as C2PA) to guarantee iOS CoreAudio compatibility.
 */
export function ensureWavHeader(buffer: ArrayBuffer, defaultSampleRate = 24000): ArrayBuffer | null {
  if (!buffer || buffer.byteLength < 44) return null;
  const view = new DataView(buffer);

  // Check for 'RIFF' (0x52494646) and 'WAVE' (0x57415645)
  const isRiff = view.getUint32(0, false) === 0x52494646;
  const isWave = view.getUint32(8, false) === 0x57415645;
  if (isRiff && isWave) {
    return cleanRiffWav(buffer);
  }

  // Also check for MP3 (ID3 tag or sync word)
  if (isAudioMp3(buffer)) return buffer;

  // Strict text detection: prevent HTML/JSON text from ever being treated as PCM samples (eliminates static noise)
  const b0 = view.getUint8(0);
  if (b0 === 0x3C || b0 === 0x7B || b0 === 0x5B) {
    console.warn('[Audio] Non-audio text payload rejected (HTML/JSON/text detected).');
    return null;
  }

  let asciiCount = 0;
  const checkLen = Math.min(64, buffer.byteLength);
  for (let i = 0; i < checkLen; i++) {
    const byte = view.getUint8(i);
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
      asciiCount++;
    }
  }
  if (asciiCount > checkLen * 0.8) {
    console.warn('[Audio] Text payload rejected from audio pipeline.');
    return null;
  }

  // Raw PCM: prepend standard 44-byte RIFF WAV header
  const numChannels = 1;
  const bitDepth = 16;
  const dataSize = buffer.byteLength;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const outView = new DataView(wavBuffer);

  // 'RIFF'
  outView.setUint32(0, 0x52494646, false);
  outView.setUint32(4, 36 + dataSize, true);
  // 'WAVE'
  outView.setUint32(8, 0x57415645, false);
  // 'fmt '
  outView.setUint32(12, 0x666D7420, false);
  outView.setUint32(16, 16, true);
  outView.setUint16(20, 1, true); // PCM
  outView.setUint16(22, numChannels, true);
  outView.setUint32(24, defaultSampleRate, true);
  outView.setUint32(28, defaultSampleRate * numChannels * (bitDepth / 8), true);
  outView.setUint16(32, numChannels * (bitDepth / 8), true);
  outView.setUint16(34, bitDepth, true);
  // 'data'
  outView.setUint32(36, 0x64617461, false);
  outView.setUint32(40, dataSize, true);

  new Uint8Array(wavBuffer, 44).set(new Uint8Array(buffer));
  return wavBuffer;
}

/**
 * Audio playback engine with dual-tier support:
 * Tier 1: Web Audio API (AudioContext) — Primary for iOS/Android mobile browsers & Capacitor.
 *         Completely immune to mobile autoplay expiration after async network fetches,
 *         and plays without muting even when hardware Silent Mode is active.
 * Tier 2: HTML5 Audio Element — Fallback if Web Audio context decoding fails.
 */
export async function playAudioUrl(
  srcOrBuffer: string | ArrayBuffer,
  originalText: string = '',
  rate?: number,
  speechId?: number,
  fallbackBlobUrl?: string,
  cacheKey?: string,
  onAudibleStart?: (timing: { audioDecodeMs: number; playbackSchedulingMs: number }) => void
): Promise<boolean> {
  enableSilentModePlayback();
  stopAudioHardware();

  const targetRate = Math.max(0.65, Math.min(1.6, rate ?? 1.0));
  let arrayBuffer: ArrayBuffer | null = null;
  const sourceUrl = typeof srcOrBuffer === 'string' ? srcOrBuffer : (fallbackBlobUrl || '');

  if (srcOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = srcOrBuffer;
  }

  // 1. Tier 1: Web Audio API Engine
  const ctx = getAudioContext();
  if (ctx) {
    try {
      if (ctx.state === 'suspended') {
        console.log('[AAC Speech] AudioContext suspended, attempting resume');
        await ctx.resume().catch(() => {});
      }

      if (!arrayBuffer && typeof srcOrBuffer === 'string') {
        const response = await fetch(srcOrBuffer);
        if (!response.ok) {
          throw new Error(`Audio fetch HTTP ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }

      // Check if a newer speech request arrived while fetching audio data
      if (speechId !== undefined && speechId !== latestSpeechRequestId) {
        return true;
      }

      if (arrayBuffer) {
        // Audio format safeguard: ensure valid container header for iOS Safari & Android WebView
        const verifiedBuffer = ensureWavHeader(arrayBuffer, 24000);
        if (!verifiedBuffer) {
          console.warn('[AAC Speech] Non-audio payload rejected from Web Audio decode.');
          return false;
        }

        let audioBuffer: AudioBuffer | null = null;
        let decodeDurationMs = 0;

        if (cacheKey && decodedAudioBufferCache.has(cacheKey)) {
          audioBuffer = decodedAudioBufferCache.get(cacheKey)!;
          decodeDurationMs = 0;
        } else {
          const tDecode0 = performance.now();
          audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
            ctx.decodeAudioData(verifiedBuffer.slice(0), resolve, reject);
          });
          decodeDurationMs = Math.round(performance.now() - tDecode0);

          if (cacheKey && audioBuffer) {
            if (decodedAudioBufferCache.size >= 150) {
              const oldest = decodedAudioBufferCache.keys().next().value;
              if (oldest) decodedAudioBufferCache.delete(oldest);
            }
            decodedAudioBufferCache.set(cacheKey, audioBuffer);
          }
        }

        if (speechId !== undefined && speechId !== latestSpeechRequestId) {
          return true;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = targetRate;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        activeSourceNode = source;
        notifySpeechState(true, originalText);

        return await new Promise<boolean>((resolve) => {
          let finished = false;
          const finish = (result: boolean) => {
            if (finished) return;
            finished = true;
            if (activeSourceNode === source) {
              activeSourceNode = null;
            }
            notifySpeechState(false, null);
            resolve(result);
          };

          source.onended = () => {
            finish(true);
          };

          // iOS WebKit safety timeout: handles cases where iOS drops onended event
          const durationMs = Math.ceil((audioBuffer.duration / Math.max(0.1, targetRate)) * 1000) + 350;
          const safetyTimer = setTimeout(() => {
            finish(true);
          }, durationMs);

          try {
            const tSched0 = performance.now();
            source.start(0);
            const schedMs = Math.round(performance.now() - tSched0);
            onAudibleStart?.({ audioDecodeMs: decodeDurationMs, playbackSchedulingMs: schedMs });
          } catch (startErr) {
            console.warn('[AAC Speech] WebAudio source.start error:', startErr);
            clearTimeout(safetyTimer);
            finish(false);
          }
        });
      }
    } catch (webAudioErr) {
      console.warn('[AAC Speech] Web Audio decode failed, falling back to HTML5 audio element:', webAudioErr);
    }
  }

  // 2. Tier 2: HTML5 Audio Element Fallback
  return new Promise((resolve) => {
    try {
      stopAudioHardware();
      const audio = new Audio();
      audio.preload = 'auto';
      (audio as any).playsInline = true;
      (audio as any).webkitPlaysInline = true;

      let blobUrlToRevoke: string | null = null;
      if (arrayBuffer) {
        const verifiedBuffer = ensureWavHeader(arrayBuffer, 24000);
        if (!verifiedBuffer) {
          notifySpeechState(false, null);
          resolve(false);
          return;
        }
        const isMp3 = isAudioMp3(verifiedBuffer);
        const mimeType = isMp3 ? 'audio/mpeg' : 'audio/wav';
        const blob = new Blob([verifiedBuffer], { type: mimeType });
        blobUrlToRevoke = URL.createObjectURL(blob);
        audio.src = blobUrlToRevoke;
      } else if (sourceUrl) {
        audio.src = sourceUrl;
      } else {
        notifySpeechState(false, null);
        resolve(false);
        return;
      }

      activeAudioElement = audio;
      notifySpeechState(true, originalText);

      try {
        audio.playbackRate = targetRate;
        audio.defaultPlaybackRate = targetRate;
      } catch (e) {}

      const cleanupAudio = () => {
        try {
          audio.onplay = null;
          audio.onended = null;
          audio.onerror = null;
          audio.src = '';
          audio.load();
        } catch (e) {}
        if (blobUrlToRevoke) {
          try { URL.revokeObjectURL(blobUrlToRevoke); } catch (e) {}
          blobUrlToRevoke = null;
        }
        if (activeAudioElement === audio) {
          activeAudioElement = null;
        }
      };

      audio.onplay = () => {
        try {
          audio.playbackRate = targetRate;
        } catch (e) {}
      };

      audio.onended = () => {
        cleanupAudio();
        notifySpeechState(false, null);
        resolve(true);
      };

      audio.onerror = (err) => {
        console.warn('[Audio] playAudioUrl error:', err, audio.error);
        cleanupAudio();
        notifySpeechState(false, null);
        resolve(false);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          cleanupAudio();
          notifySpeechState(false, null);
          // If aborted by a newer tap or pause, resolve true so it does NOT drop into default system voice!
          if (err?.name === 'AbortError' || (speechId !== undefined && speechId !== latestSpeechRequestId)) {
            resolve(true);
            return;
          }
          console.warn('[Audio] playAudioUrl rejected:', err);
          resolve(false);
        });
      }
    } catch (e) {
      console.warn('[Audio] playAudioUrl exception:', e);
      activeAudioElement = null;
      notifySpeechState(false, null);
      resolve(false);
    }
  });
}

/**
 * Play recorded caregiver voice clip for AAC tile
 */
export async function playVoiceRecording(src: string, label: string = 'Voice'): Promise<boolean> {
  return playAudioUrl(src, label);
}

/**
 * On-Device Web Speech API Engine with Priority for Non-Robotic Fluid Voices
 * Fully calibrated and hardened for Android Chrome, iOS Safari, and Desktop.
 */
let lastSpokenTextNormalized = '';
let lastSpokenTimestamp = 0;

function speakWithBrowserSpeechSynthesis(
  formattedText: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    lang?: string;
    voicePersona?: string;
    force?: boolean;
  }
): Promise<boolean> {
  enableSilentModePlayback();
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      notifySpeechState(false, null);
      resolve(false);
      return;
    }

    if (!formattedText || typeof formattedText !== 'string' || !formattedText.trim()) {
      resolve(false);
      return;
    }

    // Double-tap bounce protection: ignore rapid duplicate clicks on the exact same word within 50ms (jitter guard),
    // but allow deliberate repeat words (or when force is true).
    const normText = formattedText.trim().toLowerCase();
    const now = Date.now();
    const debounceWindow = options?.force ? 0 : 50;
    if (normText === lastSpokenTextNormalized && (now - lastSpokenTimestamp) < debounceWindow) {
      resolve(true);
      return;
    }
    lastSpokenTextNormalized = normText;
    lastSpokenTimestamp = now;

    try {
      // 1. Wake up / unpause SpeechSynthesis on Android
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // 2. Create and retain utterance to prevent Android Chrome GC bug
      const utterance = new SpeechSynthesisUtterance(formattedText);
      activeUtterance = utterance;
      activeUtterancesSet.add(utterance);

      // Natural Human Cadence Calibration (Calibrated for persona acoustic differentiation)
      utterance.pitch = Math.max(0.5, Math.min(1.85, options?.pitch ?? 1.0));
      utterance.rate = Math.max(0.55, Math.min(1.4, options?.rate ?? 0.96));

      const langMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        fr_ca: 'fr-CA',
        de: 'de-DE',
        el: 'el-GR',
        ru: 'ru-RU',
        vi: 'vi-VN',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ko: 'ko-KR',
      };
      const currentAppLang = (options?.lang && options.lang !== 'en') ? options.lang : (getLanguage() || options?.lang || 'en');
      const targetLang = langMap[currentAppLang] || langMap[currentAppLang.substring(0, 2)] || 'en-US';
      utterance.lang = targetLang;

      // Select system voice if available
      let voices = getAvailableVoices();
      if ((!voices || voices.length === 0) && 'speechSynthesis' in window) {
        voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) cachedVoices = voices;
      }

      if (options?.voiceURI && voices && voices.length > 0) {
        const query = options.voiceURI.trim().toLowerCase();
        const explicit = voices.find(
          (v) =>
            v.voiceURI.toLowerCase() === query ||
            v.name.toLowerCase() === query ||
            v.voiceURI.toLowerCase().includes(query) ||
            v.name.toLowerCase().includes(query)
        );
        if (explicit) {
          const vLang = explicit.lang.toLowerCase();
          const tPrefix = (options?.lang || 'en').toLowerCase();
          if (
            tPrefix === 'en' ||
            vLang.startsWith(tPrefix) ||
            (tPrefix === 'fr_ca' && vLang.startsWith('fr'))
          ) {
            utterance.voice = explicit;
            utterance.lang = explicit.lang; // Synchronize utterance.lang with voice to fix iOS WebKit voice override
          }
        }
      }

      if (!utterance.voice && voices && voices.length > 0) {
        const targetPrefix = 
          currentAppLang === 'fr_ca' ? 'fr_ca' :
          targetLang.substring(0, 2);
        const bestVoice = getBestSystemVoice(targetPrefix, options?.voicePersona || 'amy');
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang; // Synchronize utterance.lang with voice to fix iOS WebKit voice override
        } else if (voices.length > 0) {
          // If the device does not have a foreign language pack installed,
          // fall back to the highest rated available voice so speech is never completely silenced
          const fallbackVoice = getBestSystemVoice('en', options?.voicePersona || 'amy') || voices[0];
          if (fallbackVoice) {
            utterance.voice = fallbackVoice;
            utterance.lang = fallbackVoice.lang;
          }
        }
      }

      let started = false;
      let finished = false;
      let startWatchdogTimer: any = null;

      const cleanup = (success: boolean) => {
        if (finished) return;
        finished = true;
        if (startWatchdogTimer) {
          clearTimeout(startWatchdogTimer);
          startWatchdogTimer = null;
        }
        activeUtterancesSet.delete(utterance);
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        notifySpeechState(false, null);
        resolve(success);
      };

      utterance.onstart = () => {
        if ((utterance as any).__beeyouCancelled) return;
        started = true;
        if (startWatchdogTimer) {
          clearTimeout(startWatchdogTimer);
          startWatchdogTimer = null;
        }
        notifySpeechState(true, formattedText);
      };

      utterance.onend = () => {
        cleanup(true);
      };

      utterance.onerror = (err) => {
        const errorType = (err as any)?.error;
        // If cancelled, interrupted, or superseded by a newer tap, exit cleanly without retrying
        if (
          (utterance as any).__beeyouCancelled ||
          errorType === 'interrupted' ||
          errorType === 'canceled'
        ) {
          cleanup(false);
          return;
        }

        // If voice genuinely failed on Android (synthesis-failed, voice-unavailable), retry once with default system voice
        if (utterance.voice && !finished) {
          try {
            const fallbackUtterance = new SpeechSynthesisUtterance(formattedText);
            fallbackUtterance.lang = targetLang;
            fallbackUtterance.pitch = utterance.pitch;
            fallbackUtterance.rate = utterance.rate;
            activeUtterancesSet.add(fallbackUtterance);
            fallbackUtterance.onstart = () => {
              started = true;
              if (startWatchdogTimer) {
                clearTimeout(startWatchdogTimer);
                startWatchdogTimer = null;
              }
              notifySpeechState(true, formattedText);
            };
            fallbackUtterance.onend = () => {
              activeUtterancesSet.delete(fallbackUtterance);
              cleanup(true);
            };
            fallbackUtterance.onerror = () => {
              activeUtterancesSet.delete(fallbackUtterance);
              cleanup(false);
            };
            window.speechSynthesis.speak(fallbackUtterance);
            return;
          } catch (e) {}
        }
        cleanup(false);
      };

      // Start Watchdog: if WebKit or Android silently drops or ignores utterance.speak(),
      // detect within 400ms so fallback tiers (offline word stitching / chime) trigger immediately.
      startWatchdogTimer = setTimeout(() => {
        if (!started && !finished) {
          console.warn('[AAC Speech] SpeechSynthesis did not start within 400ms (likely dropped or muted by iOS WebKit), falling back');
          try {
            (utterance as any).__beeyouCancelled = true;
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
              window.speechSynthesis.cancel();
            }
          } catch {}
          cleanup(false);
        }
      }, 400);

      // Watchdog timeout in case onend never fires on buggy Android Chrome versions
      const approxDurationMs = Math.max(2500, (formattedText.split(' ').length / 1.5) * 1000 + 3500);
      setTimeout(() => {
        if (!finished && activeUtterance === utterance) {
          cleanup(started);
        }
      }, approxDurationMs);

      // Safe dispatch: ensure cancel has flushed before speaking
      if (pendingSpeakTimeout) {
        clearTimeout(pendingSpeakTimeout);
        pendingSpeakTimeout = null;
      }

      const dispatchSpeech = () => {
        if (finished || (utterance as any).__beeyouCancelled) {
          cleanup(false);
          return;
        }
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error('[AAC Speech] Speech dispatch error:', err);
          cleanup(false);
        }
      };

      // On iOS Safari / WebKit and Capacitor mobile, any setTimeout breaks the synchronous user-gesture token,
      // which causes window.speechSynthesis.speak() to be completely silenced or dropped.
      // On mobile / iOS / Capacitor, dispatch synchronously. On desktop Chromium, use a tiny 15ms delay.
      const isSynchronousPlatform = typeof navigator !== 'undefined' && (
        /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1) ||
        Boolean((window as any).Capacitor?.isNativePlatform?.())
      );

      if (isSynchronousPlatform) {
        dispatchSpeech();
      } else {
        pendingSpeakTimeout = setTimeout(() => {
          pendingSpeakTimeout = null;
          dispatchSpeech();
        }, 15);
      }
    } catch (e) {
      console.error('[AAC Speech] SpeechSynthesis error:', e);
      notifySpeechState(false, null);
      resolve(false);
    }
  });
}

// (CORE_AAC_VOCABULARY defined earlier)
const OBSOLETE_CORE_LIST = [
  'Yes',
  'No',
  'Help',
  'Water',
  'More',
  'Stop',
  'Please',
  'Thank You',
  'All Done',
  'I',
  'You',
  'We',
  'My',
  'Want',
  'Need',
  'Like',
  'Go',
  'See',
  'Feel',
  'Eat',
  'Drink',
  'Play',
  'Wait',
  'Happy',
  'Calm',
  'Sad',
  'Angry',
  'Tired',
  'Apple',
  'Pizza',
  'Bathroom',
  'Break',
  'Home',
  'Food',
  'This',
  'A',
  'To',
  // 9 Tactile AAC Sensory Board Communicative Phrases
  'I want food',
  'I want a drink',
  'I want to play',
  'Go somewhere',
  'How I feel',
  'I need a break',
  'I want this',
  'I need help',
  'Please stop',
  // Sensory Needs
  'Too loud',
  'It is too loud',
  'Too bright',
  'It is too bright',
];

const prewarmThrottleMap = new Map<string, number>();

/**
 * Pre-warms core AAC vocabulary into persistent browser CacheStorage & memory cache.
 * Automatically runs for the active persona across any language.
 * Runs on idle priority so it never impacts UI responsiveness or app boot time.
 */
export async function prewarmCoreAudioVocabulary(persona: string = 'system', lang: string = 'en'): Promise<void> {
  if (typeof window === 'undefined') return;
  const personaObj = getVoicePersonaById(persona);
  const selectedPersonaId = personaObj.id;

  const normalizedLang =
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  // System native voice runs directly on-device hardware with 0ms latency for English;
  // For non-English languages, cloud multilingual TTS is used, so we pre-warm it!
  if (selectedPersonaId === 'system' && normalizedLang === 'en') return;

  const voiceToUse = selectedPersonaId === 'system' ? 'amy' : selectedPersonaId;
  const throttleKey = `${voiceToUse}_${normalizedLang}`;
  const now = Date.now();
  if (prewarmThrottleMap.has(throttleKey) && now - prewarmThrottleMap.get(throttleKey)! < 60000) {
    return;
  }
  prewarmThrottleMap.set(throttleKey, now);

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 100));
  idleFn(async () => {
    // Populate RAM and local cache using the consistent selected Piper neural voice during idle time
    if (selectedPersonaId !== 'system' && isPiperVoiceReadySync(voiceToUse, normalizedLang)) {
      for (const phrase of CORE_AAC_VOCABULARY) {
        const formatted = formatForNaturalSpeech(phrase);
        if (!formatted) continue;
        const cacheKey = getTtsCacheKey(voiceToUse, normalizedLang, formatted);
        const streamUrl = getTtsStreamUrl(voiceToUse, normalizedLang, formatted);
        const existing = await getLocalCacheOnly(streamUrl, cacheKey);
        if (existing) continue;

        try {
          const buf = await synthesizeWithPiper(formatted, voiceToUse, normalizedLang, 2000);
          if (buf && isAudioPayload(buf)) {
            const blob = new Blob([buf], { type: 'audio/wav' });
            const blobUrl = URL.createObjectURL(blob);
            audioMemoryCache.set(cacheKey, { blobUrl, buffer: buf });
            if (typeof window !== 'undefined' && 'caches' in window) {
              const fullUrl = new URL(streamUrl, window.location.origin).href;
              const resToCache = new Response(buf.slice(0), {
                headers: {
                  'content-type': 'audio/wav',
                  'cache-control': 'public, max-age=31536000, immutable',
                },
              });
              caches.open(TTS_CACHE_NAME).then((c) => c.put(fullUrl, resToCache)).catch(() => {});
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 60));
      }
      return;
    }

    // For non-English: fetch each core vocabulary item and cache to L1 RAM & L2 CacheStorage
    for (const phrase of CORE_AAC_VOCABULARY) {
      const translated = t(phrase);
      const formatted = formatForNaturalSpeech(translated);
      if (!formatted) continue;
      const cacheKey = getTtsCacheKey(voiceToUse, normalizedLang, formatted);
      const streamUrl = getTtsStreamUrl(voiceToUse, normalizedLang, formatted);
      const local = await getLocalCacheOnly(streamUrl, cacheKey);
      if (!local) {
        try {
          await getOrFetchAudioItem(streamUrl, cacheKey);
        } catch {}
      }
    }
  });
}

/**
 * Predictive Screen Pre-loader:
 * Pre-warms words visible on the active view in the background.
 */
export function prewarmPhrases(phrases: string[], persona: string = 'system', lang: string = 'en'): void {
  if (typeof window === 'undefined' || !phrases || phrases.length === 0) return;
  const personaObj = getVoicePersonaById(persona);
  const selectedPersonaId = personaObj.id;
  const voiceToUse = selectedPersonaId === 'system' ? 'amy' : selectedPersonaId;

  const normalizedLang =
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 100));
  idleFn(async () => {
    for (const phrase of phrases) {
      const formatted = formatForNaturalSpeech(phrase);
      if (!formatted) continue;

      const cacheKey = getTtsCacheKey(voiceToUse, normalizedLang, formatted);
      const streamUrl = getTtsStreamUrl(voiceToUse, normalizedLang, formatted);

      const existing = await getLocalCacheOnly(streamUrl, cacheKey);
      if (existing) continue;

      try {
        await getOrFetchAudioItem(streamUrl, cacheKey);
      } catch {}

      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  });
}

if (typeof window !== 'undefined') {
  (window as any).__beeyouSpeakText = speakText;
}
