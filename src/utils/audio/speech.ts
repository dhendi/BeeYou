import { playChime } from './chimes';
import { getAudioContext, enableSilentModePlayback } from './context';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../../data/voicePersonasData';

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
export const TTS_CACHE_NAME = `beeyou-tts-${TTS_GENERATION_VERSION}`;
const inFlightAudioFetches = new Map<string, Promise<CachedAudioItem | null>>();

/**
 * Builds version-scoped TTS stream URL with cache-busting query parameter.
 */
export function getTtsStreamUrl(voiceId: string, lang: string, text: string): string {
  return `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceId)}&v=${encodeURIComponent(TTS_GENERATION_VERSION)}`;
}

/**
 * Builds version-scoped TTS memory cache key.
 */
export function getTtsCacheKey(voiceId: string, lang: string, text: string): string {
  return `${voiceId}_${lang}_${text.toLowerCase()}_${TTS_GENERATION_VERSION}`;
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

  // 1b. Client Single-Flight In-Flight Deduplication:
  // If an audio fetch for this cacheKey is already in flight, share the existing promise
  if (inFlightAudioFetches.has(cacheKey)) {
    return inFlightAudioFetches.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<CachedAudioItem | null> => {
    // 3. Level 3: Edge Server Stream (backed by Server-Side Disk Cache in .data/tts_cache)
    try {
      const fullUrl = typeof window !== 'undefined' ? new URL(streamUrl, window.location.origin).href : streamUrl;
      const response = await fetch(streamUrl);
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
      return l.startsWith('fr') && (l.includes('ca') || v.name.toLowerCase().includes('canada'));
    }
    return l.startsWith(targetPrefix);
  });

  const candidates = matchingVoices.length > 0 ? matchingVoices : (targetPrefix === 'en' ? voices : []);
  if (candidates.length === 0) return null;

  const personaObj = getVoicePersonaById(persona);
  const isPreferFemale = personaObj.gender === 'female';
  const isPreferMale = personaObj.gender === 'male';
  const isChild = personaObj.gender === 'child';

  const femaleKeywords = ['female', 'zira', 'jenny', 'aria', 'samantha', 'ava', 'zoe', 'allison', 'karen', 'serena', 'victoria', 'moira', 'fiona', 'tessa', 'ana', 'hazel', 'susan', 'cathy', 'agnes'];
  const maleKeywords = ['male', 'david', 'puck', 'guy', 'ryan', 'daniel', 'oliver', 'evan', 'tom', 'alex', 'george', 'mark', 'christopher', 'fred', 'bruce', 'ralph'];
  const childKeywords = ['child', 'junior', 'kid', 'youth', 'puck', 'samantha', 'ava', 'zoe', 'daniel'];

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = rateVoiceNaturalness(v);
    const n = v.name.toLowerCase();

    if (isCanadianFrench) {
      if (v.lang.toLowerCase().includes('ca') || n.includes('canada')) score += 100;
    }

    if (isPreferMale) {
      if (maleKeywords.some((k) => n.includes(k))) score += 500;
      if (femaleKeywords.some((k) => n.includes(k))) score -= 500;
    } else if (isPreferFemale) {
      if (femaleKeywords.some((k) => n.includes(k))) score += 500;
      if (maleKeywords.some((k) => n.includes(k))) score -= 500;
    } else if (isChild) {
      if (childKeywords.some((k) => n.includes(k))) score += 500;
      else if (femaleKeywords.some((k) => n.includes(k))) score += 200;
      if (maleKeywords.some((k) => n.includes(k))) score -= 300;
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
 * Format phrases for natural human speech cadence and prosody without emojis.
 */
function formatForNaturalSpeech(text: string): string {
  let cleaned = stripEmojis(text.trim());
  if (!cleaned) return '';

  // Clean dual slash labels like "My/Mine", "My / Mine", "I / Me", "Yes / Good", "No / Stop"
  // Speak ONLY the first word so it never repeats or pronounces "slash"
  if (cleaned.includes('/')) {
    cleaned = cleaned.split('/')[0].trim();
  }

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Add trailing punctuation if missing for natural downward intonation
  if (!/[.!?]$/.test(cleaned)) {
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
 * Stop any current vocalization immediately
 */
export function stopSpeaking() {
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
      window.speechSynthesis.cancel();
    } catch (e) {}
    activeUtterance = null;
    activeUtterancesSet.clear();
  }
  notifySpeechState(false, null);
}

/**
 * Main vocalization function:
 * 1. Executes instantaneous, zero-latency on-device SpeechSynthesis for reliable Android & offline speech.
 * 2. If memory-cached audio exists from previous server synthesis, plays it immediately.
 * 3. Never blocks user-gesture activation behind failing network calls.
 */
export const PERSONA_ACOUSTIC_PROFILES: Record<string, { pitch: number; rate: number }> = {
  system: { pitch: 1.0, rate: 1.0 },

  // Kids (Youthful tone, steady even pitch for AAC)
  puck: { pitch: 1.15, rate: 0.95 },
  leda: { pitch: 1.18, rate: 0.92 },
  sadachbia: { pitch: 1.12, rate: 0.98 },
  achernar: { pitch: 1.06, rate: 0.90 },
  alchiba: { pitch: 1.14, rate: 0.96 },

  // Teens (Youthful, casual, steady)
  zephyr: { pitch: 0.96, rate: 0.88 },
  fenrir: { pitch: 0.90, rate: 0.95 },
  aoede: { pitch: 1.04, rate: 0.96 },
  callirrhoe: { pitch: 1.00, rate: 0.92 },
  autonoe: { pitch: 1.06, rate: 0.98 },
  sulafat: { pitch: 1.02, rate: 0.92 },

  // Caring Women (Calm, steady, maternal)
  kore: { pitch: 1.02, rate: 0.90 },
  vindemiatrix: { pitch: 1.00, rate: 0.88 },
  polaris: { pitch: 1.02, rate: 0.92 },

  // Professional Women (Crisp, articulate, structured)
  erinome: { pitch: 1.02, rate: 0.98 },
  despina: { pitch: 1.00, rate: 0.96 },
  algieba: { pitch: 0.98, rate: 0.94 },
  charon: { pitch: 1.02, rate: 0.98 },
  kalyke: { pitch: 0.98, rate: 0.96 },
  vega: { pitch: 1.04, rate: 1.00 },
  schedar: { pitch: 1.00, rate: 0.94 },

  // Caring Men (Steady, grounded, calm)
  achird: { pitch: 0.92, rate: 0.92 },
  umbriel: { pitch: 0.86, rate: 0.90 },
  zubenelgenubi: { pitch: 0.90, rate: 0.94 },
  rasalas: { pitch: 0.92, rate: 0.94 },
  capella: { pitch: 0.88, rate: 0.90 },

  // Professional Men (Articulate, steady, direct)
  iapetus: { pitch: 0.85, rate: 0.96 },
  sadaltager: { pitch: 0.86, rate: 0.92 },
  tarazed: { pitch: 0.88, rate: 0.98 },
};

let latestSpeechRequestId = 0;

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
  }
): Promise<void> {
  const formattedText = formatForNaturalSpeech(text);
  if (!formattedText) return;

  const speechId = ++latestSpeechRequestId;

  // Immediately cancel any prior in-flight speech to prevent double/overlapping vocalization on rapid clicks
  stopSpeaking();

  const rawPersona = options?.voicePersona || 'system';
  const personaObj = getVoicePersonaById(rawPersona);
  const selectedPersonaId = personaObj.id;

  const lang = (options?.lang || 'en').toLowerCase();
  const normalizedLang = 
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  // High-Fidelity Neural Audio Stream (Multi-Tier Caching: RAM -> Browser CacheStorage -> Edge Server):
  // When using any neural voice and not restricted to offline-only:
  if (selectedPersonaId !== 'system' && !options?.preferOfflineOnly) {
    const cacheKey = getTtsCacheKey(selectedPersonaId, normalizedLang, formattedText);
    const streamUrl = getTtsStreamUrl(selectedPersonaId, normalizedLang, formattedText);

    // 1. Instant check in local cache (RAM & CacheStorage) (< 10ms lookup)
    const localAudioItem = await getLocalCacheOnly(streamUrl, cacheKey);
    if (speechId !== latestSpeechRequestId) {
      return;
    }

    if (localAudioItem) {
      // Audio is already cached on-device! Play immediately with 0ms latency
      try {
        const played = await playAudioUrl(localAudioItem.buffer, formattedText, options?.rate, speechId, localAudioItem.blobUrl);
        if (played || speechId !== latestSpeechRequestId) return;
      } catch (err) {
        console.warn(`[Audio] Cached playback failed, dropping back to on-device speech:`, err);
      }
    } else if (options?.previewAudio) {
      // Explicit preview audition in voice settings (user intentionally requested audition of this specific cloud voice)
      try {
        const audioItem = await Promise.race([
          getOrFetchAudioItem(streamUrl, cacheKey),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500)),
        ]);
        if (speechId !== latestSpeechRequestId) return;
        if (audioItem) {
          const played = await playAudioUrl(audioItem.buffer, formattedText, options?.rate, speechId, audioItem.blobUrl);
          if (played || speechId !== latestSpeechRequestId) return;
        }
      } catch (err) {
        console.warn(`[Audio] Preview neural stream failed:`, err);
      }
    } else {
      // AAC Tile or Sentence speech: DO NOT block user on uncached cloud roundtrip (which takes 3-5s and breaks iOS Safari user gesture)
      // Fire background fetch to pre-warm CacheStorage for next time
      getOrFetchAudioItem(streamUrl, cacheKey).catch(() => {});
      // Drop immediately to on-device SpeechSynthesis below!
    }
  }

  // If superseded by a newer tap, do not play fallback system speech
  if (speechId !== latestSpeechRequestId) {
    return;
  }

  // Fallback to on-device Web Speech API with rich persona acoustic calibration (< 20ms response, zero user-gesture expiration)
  const userBasePitch = options?.pitch ?? 1.0;
  const userBaseRate = options?.rate ?? 1.0;
  const profile = PERSONA_ACOUSTIC_PROFILES[selectedPersonaId] || { pitch: 1.0, rate: 1.0 };

  const calibratedPitch = Math.max(0.5, Math.min(1.85, userBasePitch * profile.pitch));
  const calibratedRate = Math.max(0.55, Math.min(1.4, userBaseRate * profile.rate));

  await speakWithBrowserSpeechSynthesis(formattedText, {
    ...options,
    voicePersona: selectedPersonaId,
    pitch: calibratedPitch,
    rate: calibratedRate,
    force: options?.force,
  });
}

/**
 * Inspects raw audio ArrayBuffer before decoding.
 * If raw PCM bytes were received without a RIFF header, constructs a standard 44-byte RIFF WAV
 * container so Web Audio API (decodeAudioData) on iOS Safari and Android WebView decodes it without failure.
 */
export function ensureWavHeader(buffer: ArrayBuffer, defaultSampleRate = 24000): ArrayBuffer {
  if (!buffer || buffer.byteLength < 44) return buffer;
  const view = new DataView(buffer);

  // Check for 'RIFF' (0x52494646) and 'WAVE' (0x57415645)
  const isRiff = view.getUint32(0, false) === 0x52494646;
  const isWave = view.getUint32(8, false) === 0x57415645;

  // Also check for MP3 (ID3 tag or sync word 0xFFE0)
  const isId3 = (view.getUint32(0, false) & 0xFFFFFF00) === 0x49443300;
  const isMp3Sync = (view.getUint16(0, false) & 0xFFE0) === 0xFFE0;

  if ((isRiff && isWave) || isId3 || isMp3Sync) {
    return buffer; // Already a valid container format
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
  fallbackBlobUrl?: string
): Promise<boolean> {
  enableSilentModePlayback();
  stopSpeaking();

  const targetRate = Math.max(0.65, Math.min(1.4, rate ?? 0.85));
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
        arrayBuffer = ensureWavHeader(arrayBuffer, 24000);

        const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          ctx.decodeAudioData(arrayBuffer!.slice(0), resolve, reject);
        });

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
          source.onended = () => {
            if (activeSourceNode === source) {
              activeSourceNode = null;
            }
            notifySpeechState(false, null);
            resolve(true);
          };

          try {
            source.start(0);
          } catch (startErr) {
            console.warn('[WebAudio] source.start error:', startErr);
            if (activeSourceNode === source) {
              activeSourceNode = null;
            }
            notifySpeechState(false, null);
            resolve(false);
          }
        });
      }
    } catch (webAudioErr) {
      console.warn('[WebAudio] Web Audio decode failed, falling back to HTML5 audio element:', webAudioErr);
    }
  }

  // 2. Tier 2: HTML5 Audio Element Fallback
  return new Promise((resolve) => {
    try {
      stopSpeaking();
      const audio = new Audio();
      audio.preload = 'auto';
      (audio as any).playsInline = true;
      (audio as any).webkitPlaysInline = true;

      let blobUrlToRevoke: string | null = null;
      if (arrayBuffer) {
        const verifiedBuffer = ensureWavHeader(arrayBuffer, 24000);
        const blob = new Blob([verifiedBuffer], { type: 'audio/wav' });
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
): Promise<void> {
  enableSilentModePlayback();
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      playChime('speak');
      notifySpeechState(false, null);
      resolve();
      return;
    }

    if (!formattedText || typeof formattedText !== 'string' || !formattedText.trim()) {
      resolve();
      return;
    }

    // Double-tap bounce protection: ignore rapid duplicate clicks on the exact same word within 200ms,
    // but allow different words immediately and allow repeat words after 200ms (or when force is true).
    const normText = formattedText.trim().toLowerCase();
    const now = Date.now();
    const debounceWindow = options?.force ? 0 : 200;
    if (normText === lastSpokenTextNormalized && (now - lastSpokenTimestamp) < debounceWindow) {
      resolve();
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
      utterance.rate = Math.max(0.55, Math.min(1.4, options?.rate ?? 0.85));

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
      const targetLang = langMap[options?.lang ?? 'en'] || 'en-US';
      utterance.lang = targetLang;

      // Select system voice if available
      const voices = getAvailableVoices();
      if (options?.voiceURI) {
        const explicit = voices.find((v) => v.voiceURI === options.voiceURI);
        if (explicit) {
          const vLang = explicit.lang.toLowerCase();
          const tPrefix = (options?.lang || 'en').toLowerCase();
          if (
            tPrefix === 'en' ||
            vLang.startsWith(tPrefix) ||
            (tPrefix === 'fr_ca' && vLang.startsWith('fr'))
          ) {
            utterance.voice = explicit;
          }
        }
      }

      if (!utterance.voice && voices.length > 0) {
        const targetPrefix = 
          options?.lang === 'fr_ca' ? 'fr_ca' :
          targetLang.substring(0, 2);
        const bestVoice = getBestSystemVoice(targetPrefix, options?.voicePersona || 'Kore');
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      let finished = false;
      const cleanup = () => {
        if (finished) return;
        finished = true;
        activeUtterancesSet.delete(utterance);
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        notifySpeechState(false, null);
        resolve();
      };

      utterance.onstart = () => {
        if ((utterance as any).__beeyouCancelled) return;
        notifySpeechState(true, formattedText);
      };

      utterance.onend = () => {
        cleanup();
      };

      utterance.onerror = (err) => {
        const errorType = (err as any)?.error;
        // If cancelled, interrupted, or superseded by a newer tap, exit cleanly without retrying
        if (
          (utterance as any).__beeyouCancelled ||
          errorType === 'interrupted' ||
          errorType === 'canceled'
        ) {
          cleanup();
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
            fallbackUtterance.onend = () => {
              activeUtterancesSet.delete(fallbackUtterance);
              cleanup();
            };
            fallbackUtterance.onerror = (fallbackErr) => {
              activeUtterancesSet.delete(fallbackUtterance);
              cleanup();
              const fbErrorType = (fallbackErr as any)?.error;
              if (
                fbErrorType !== 'interrupted' &&
                fbErrorType !== 'canceled' &&
                !(fallbackUtterance as any).__beeyouCancelled
              ) {
                playChime('speak');
              }
            };
            window.speechSynthesis.speak(fallbackUtterance);
            return;
          } catch (e) {}
        }
        cleanup();
        if (errorType !== 'interrupted' && errorType !== 'canceled') {
          playChime('speak');
        }
      };

      // Watchdog timeout in case onend never fires on buggy Android Chrome versions
      const approxDurationMs = Math.max(2500, (formattedText.split(' ').length / 1.5) * 1000 + 3500);
      setTimeout(() => {
        if (!finished && activeUtterance === utterance) {
          cleanup();
        }
      }, approxDurationMs);

      // Safe dispatch: ensure cancel has flushed before speaking
      if (pendingSpeakTimeout) {
        clearTimeout(pendingSpeakTimeout);
        pendingSpeakTimeout = null;
      }

      const dispatchSpeech = () => {
        if (finished || (utterance as any).__beeyouCancelled) {
          cleanup();
          return;
        }
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error('Speech dispatch error:', err);
          cleanup();
        }
      };

      // In Chromium / Android Chrome, executing cancel() and immediately calling speak()
      // in the same microtask can cause cancel() to kill the newly dispatched utterance.
      // A small micro-delay (25ms) ensures cancel() finishes flushing before speak().
      pendingSpeakTimeout = setTimeout(() => {
        pendingSpeakTimeout = null;
        dispatchSpeech();
      }, 25);
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
      playChime('speak');
      notifySpeechState(false, null);
      resolve();
    }
  });
}

/**
 * Top high-frequency AAC survival vocabulary to pre-warm for 0ms instantaneous speech
 */
export const CORE_AAC_VOCABULARY = [
  'Yes',
  'No',
  'Help',
  'Water',
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

  // System native voice runs directly on-device hardware with 0ms latency; no need to pre-warm network
  if (selectedPersonaId === 'system') return;

  const normalizedLang =
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  const throttleKey = `${selectedPersonaId}_${normalizedLang}`;
  const now = Date.now();
  if (prewarmThrottleMap.has(throttleKey) && now - prewarmThrottleMap.get(throttleKey)! < 60000) {
    return;
  }
  prewarmThrottleMap.set(throttleKey, now);

  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 500));
  idleFn(async () => {
    for (const phrase of CORE_AAC_VOCABULARY) {
      const formatted = formatForNaturalSpeech(phrase);
      if (!formatted) continue;
      const cacheKey = getTtsCacheKey(selectedPersonaId, normalizedLang, formatted);
      const streamUrl = getTtsStreamUrl(selectedPersonaId, normalizedLang, formatted);
      const existing = await getLocalCacheOnly(streamUrl, cacheKey);
      if (existing) continue;
      await getOrFetchAudioItem(streamUrl, cacheKey).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });
}

/**
 * Predictive Screen Pre-loader:
 * Gently pre-warms words visible on the active view in the background sequentially.
 * Throttled to avoid saturating mobile network connections.
 */
export function prewarmPhrases(phrases: string[], persona: string = 'system', lang: string = 'en'): void {
  if (typeof window === 'undefined' || !phrases || phrases.length === 0) return;
  const personaObj = getVoicePersonaById(persona);
  const selectedPersonaId = personaObj.id;
  if (selectedPersonaId === 'system') return;

  const normalizedLang =
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 600));
  idleFn(async () => {
    // Top 8 phrases sequentially, checked against local cache first
    const topPhrases = phrases.slice(0, 8);
    for (const phrase of topPhrases) {
      const formatted = formatForNaturalSpeech(phrase);
      if (!formatted) continue;

      const cacheKey = getTtsCacheKey(selectedPersonaId, normalizedLang, formatted);
      const streamUrl = getTtsStreamUrl(selectedPersonaId, normalizedLang, formatted);

      const existing = await getLocalCacheOnly(streamUrl, cacheKey);
      if (existing) continue;

      try {
        await getOrFetchAudioItem(streamUrl, cacheKey);
      } catch {}

      // 500ms breather between requests to preserve mobile connection pool
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });
}
