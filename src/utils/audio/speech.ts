import { playChime } from './chimes';
import { getAudioContext, enableSilentModePlayback } from './context';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../../data/voicePersonasData';
import { t, getLanguage } from '../../services/translator';
import { isPremiumSubscription } from '../../services/subscriptionService';
import { synthesizeWithPiper, resolvePiperVoiceId, isPiperVoiceReady } from '../../services/piperTtsService';

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
    return 'http://10.0.0.170:3000';
  }

  return '';
}

/**
 * Builds version-scoped TTS stream URL with cache-busting query parameter.
 */
export function getTtsStreamUrl(voiceId: string, lang: string, text: string): string {
  const base = getApiBaseUrl();
  return `${base}/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voiceId)}&v=${encodeURIComponent(TTS_GENERATION_VERSION)}`;
}

/**
 * Builds version-scoped TTS memory cache key.
 */
export function getTtsCacheKey(voiceId: string, lang: string, text: string): string {
  const normalized = text.trim().replace(/[.!?]+$/, '').toLowerCase();
  return `${voiceId.toLowerCase()}_${lang}_${normalized}_${TTS_GENERATION_VERSION}`;
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
  // Male personas: prioritize male voices (Daniel on iOS, David/Guy on Windows, Alex on Mac)
  fenrir: { preferred: ['daniel', 'david', 'guy', 'ryan', 'oliver', 'george', 'mark', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  zephyr: { preferred: ['daniel', 'oliver', 'ryan', 'david', 'guy', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  achird: { preferred: ['daniel', 'george', 'david', 'mark', 'alex'], avoid: ['samantha', 'karen', 'moira', 'zira', 'female'] },
  iapetus: { preferred: ['daniel', 'david', 'bruce', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  algenib: { preferred: ['daniel', 'guy', 'david', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  rasalas: { preferred: ['daniel', 'ryan', 'david', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },
  achernar: { preferred: ['daniel', 'oliver', 'ryan', 'alex'], avoid: ['samantha', 'karen', 'moira', 'female'] },

  // Leda: Australian / bright female (Karen on iOS, Jenny/Ava on Windows/Web)
  leda: { preferred: ['karen', 'ava', 'zoe', 'jenny', 'allison'], avoid: ['daniel', 'david', 'male'] },

  // Puck: Youthful/Child tone (Samantha, Ava, Zoe)
  puck: { preferred: ['samantha', 'ava', 'zoe'], avoid: ['daniel', 'david', 'male'] },

  // Expressive female: Moira (Irish on iOS), Victoria, Serena
  aoede: { preferred: ['moira', 'victoria', 'serena', 'fiona'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  callirrhoe: { preferred: ['moira', 'serena', 'victoria'], avoid: ['daniel', 'david', 'samantha', 'male'] },

  // Clear female: Tessa (South African on iOS), Fiona, Hazel
  autonoe: { preferred: ['tessa', 'fiona', 'hazel'], avoid: ['daniel', 'david', 'samantha', 'male'] },
  sulafat: { preferred: ['tessa', 'karen', 'fiona'], avoid: ['daniel', 'david', 'samantha', 'male'] },

  // Calm maternal female: Samantha, Allison, Susan
  kore: { preferred: ['samantha', 'allison', 'susan', 'aria'], avoid: ['daniel', 'david', 'male'] },
  vindemiatrix: { preferred: ['samantha', 'susan', 'allison'], avoid: ['daniel', 'david', 'male'] },
  polaris: { preferred: ['samantha', 'allison', 'aria'], avoid: ['daniel', 'david', 'male'] },

  // Articulate professional female: Karen, Zira, Jenny
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
      return l.startsWith('fr') && (l.includes('ca') || v.name.toLowerCase().includes('canada'));
    }
    return l.startsWith(targetPrefix);
  });

  const candidates = matchingVoices.length > 0 ? matchingVoices : (targetPrefix === 'en' ? voices : []);
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

  // Add single final sentence punctuation for natural conversational pitch contour
  if (isQuestion) {
    cleaned += '?';
  } else if (isExclamation) {
    cleaned += '!';
  } else {
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

  // Piper On-Device Neural Personas
  amy: { pitch: 1.00, rate: 1.00 },
  danny: { pitch: 1.02, rate: 1.02 },
  bryce: { pitch: 1.00, rate: 0.98 },
  ryan: { pitch: 1.00, rate: 1.00 },
  kristin: { pitch: 1.02, rate: 1.00 },
  lessac: { pitch: 1.00, rate: 0.98 },
  joe: { pitch: 0.98, rate: 0.98 },
  claude: { pitch: 1.00, rate: 1.00 },
  davefx: { pitch: 1.00, rate: 1.00 },
  upmc: { pitch: 1.00, rate: 1.00 },

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
  }
): Promise<void> {
  const formattedText = formatForNaturalSpeech(text);
  if (!formattedText) return;

  const speechId = ++latestSpeechRequestId;

  // Immediately cancel any prior in-flight speech to prevent double/overlapping vocalization on rapid clicks
  stopSpeaking();

  // CRITICAL FOR IOS SAFARI & CAPACITOR:
  // Synchronously initialize and resume Web Audio context during the active user gesture.
  // This unlocks the audio hardware pipeline before any async operations occur.
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const rawPersona = options?.voicePersona || 'puck';
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

  // High-Fidelity Audio Stream Generation (Multi-Tier Caching: RAM -> Browser CacheStorage -> Server):
  // High-fidelity streaming is active for all voices and sentences whenever online.
  const shouldAttemptServerTts = !options?.preferOfflineOnly;

  if (shouldAttemptServerTts) {
    const voiceToStream = selectedPersonaId === 'system' ? 'puck' : selectedPersonaId;
    const cacheKey = getTtsCacheKey(voiceToStream, normalizedLang, formattedText);
    const streamUrl = getTtsStreamUrl(voiceToStream, normalizedLang, formattedText);

    // 1. Instant check in local cache (RAM & CacheStorage) (< 10ms lookup)
    const localAudioItem = await getLocalCacheOnly(streamUrl, cacheKey);
    if (speechId !== latestSpeechRequestId) {
      return;
    }

    if (localAudioItem) {
      // Audio is already cached on-device! Play immediately with 0ms latency
      try {
        const played = await playAudioUrl(localAudioItem.buffer, formattedText, calibratedRate, speechId, localAudioItem.blobUrl);
        if (played || speechId !== latestSpeechRequestId) return;
      } catch (err) {
        console.warn(`[Audio] Cached playback failed, dropping back to on-device speech:`, err);
      }
    } else if (options?.previewAudio) {
      // 2a. Pre-bundled instant offline audition preview asset (.mp3 or .wav)
      const previewCandidates = [
        `/assets/audio/previews/${selectedPersonaId}.mp3`,
        `/assets/audio/previews/${selectedPersonaId}.wav`,
      ];
      for (const candidateUrl of previewCandidates) {
        try {
          const bundledRes = await fetch(candidateUrl);
          const ct = bundledRes.headers.get('content-type') || '';
          if (bundledRes.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
            const buf = await bundledRes.arrayBuffer();
            if (isAudioPayload(buf)) {
              const cleanedBuf = cleanRiffWav(buf);
              const isMp3 = isAudioMp3(cleanedBuf);
              const mime = isMp3 ? 'audio/mpeg' : 'audio/wav';
              const blob = new Blob([cleanedBuf], { type: mime });
              const blobUrl = URL.createObjectURL(blob);
              audioMemoryCache.set(cacheKey, { blobUrl, buffer: cleanedBuf });
              const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, blobUrl);
              if (played || speechId !== latestSpeechRequestId) return;
            }
          }
        } catch {
          // Bundled preview failed or not present, try next
        }
      }

      // 2b. Piper on-device dynamic preview synthesis
      try {
        const piperBuf = await synthesizeWithPiper(formattedText, selectedPersonaId, normalizedLang);
        if (speechId !== latestSpeechRequestId) return;
        if (piperBuf && isAudioPayload(piperBuf)) {
          const cleanedBuf = cleanRiffWav(piperBuf);
          const blob = new Blob([cleanedBuf], { type: 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);
          audioMemoryCache.set(cacheKey, { blobUrl, buffer: cleanedBuf });
          const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, blobUrl);
          if (played || speechId !== latestSpeechRequestId) return;
        }
      } catch (piperErr) {
        console.warn(`[Audio] Piper preview synthesis (${selectedPersonaId}) failed:`, piperErr);
      }

      // 2c. Dynamic network preview fetch fallback
      try {
        const audioItem = await Promise.race([
          getOrFetchAudioItem(streamUrl, cacheKey),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
        ]);
        if (speechId !== latestSpeechRequestId) return;
        if (audioItem && isAudioPayload(audioItem.buffer)) {
          const cleanedBuf = cleanRiffWav(audioItem.buffer);
          const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, audioItem.blobUrl);
          if (played || speechId !== latestSpeechRequestId) return;
        }
      } catch (err) {
        console.warn(`[Audio] Neural preview stream (${selectedPersonaId}) failed:`, err);
      }
      return;
    } else {
      // 3a. Piper On-Device Neural Synthesis for Whole Sentences
      // Synthesizes arbitrary, multi-clause constructed sentences on-device in WebAssembly
      // as a single contiguous audio waveform with natural human cadence and prosody.
      if (selectedPersonaId !== 'system') {
        try {
          const piperBuf = await synthesizeWithPiper(formattedText, selectedPersonaId, normalizedLang);
          if (speechId !== latestSpeechRequestId) return;
          if (piperBuf && isAudioPayload(piperBuf)) {
            const cleanedBuf = cleanRiffWav(piperBuf);
            const blob = new Blob([cleanedBuf], { type: 'audio/wav' });
            const blobUrl = URL.createObjectURL(blob);
            audioMemoryCache.set(cacheKey, { blobUrl, buffer: cleanedBuf });
            const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, blobUrl);
            if (played || speechId !== latestSpeechRequestId) return;
          }
        } catch (piperErr) {
          console.warn('[Audio] Piper on-device speech synthesis notice:', piperErr);
        }
      }
      const isConstructedSentence = Boolean(
        options?.sentenceWords && options.sentenceWords.length > 1
      );
      const isMultiWord = Boolean(
        isConstructedSentence ||
        formattedText.trim().split(/\s+/).length > 1
      );

      // 3a. Check pre-bundled offline core asset for single-tile taps
      // Immediately plays pre-recorded authentic full phrases (e.g., AAC Sensory Board tiles)
      // or single core words without network delay.
      // Constructed multi-word sentences bypass this so they always receive dynamic natural prosody.
      if (!isNonEnglish && !isConstructedSentence) {
        const rawSlug = formattedText.toLowerCase().replace(/[^a-z0-9]/g, '');
        const slugAliases: Record<string, string> = {
          helpme: 'help',
          pleasehelpme: 'help',
          waitplease: 'wait',
          alldone: 'alldone',
          tooloud: 'tooloud',
          itistooloud: 'itistooloud',
          toobright: 'toobright',
          itistoobright: 'itistoobright',
          iwantfood: 'iwantfood',
          iwantadrink: 'iwantadrink',
          iwanttoplay: 'iwanttoplay',
          gosomewhere: 'gosomewhere',
          howifeel: 'howifeel',
          ineedabreak: 'ineedabreak',
          iwantthis: 'iwantthis',
          ineedhelp: 'ineedhelp',
          pleasestop: 'pleasestop',
          headphones: 'ineedmyheadphones',
          ineedmyheadphones: 'ineedmyheadphones',
          weightedblanket: 'iwantmyweightedblanket',
          iwantmyweightedblanket: 'iwantmyweightedblanket',
          quietroom: 'ineedaquietplace',
          ineedaquietplace: 'ineedaquietplace',
          squishyfidget: 'iwantmyfidgettoy',
          iwantmyfidgettoy: 'iwantmyfidgettoy',
        };
        const wordSlug = slugAliases[rawSlug] || rawSlug;

        if (wordSlug) {
          const candidateUrls = [
            `/assets/audio/core/${voiceToStream}_${wordSlug}.wav`,
            `/assets/audio/core/${voiceToStream}_${wordSlug}.mp3`,
            ...(voiceToStream !== 'puck' ? [
              `/assets/audio/core/puck_${wordSlug}.wav`,
              `/assets/audio/core/puck_${wordSlug}.mp3`,
            ] : []),
          ];

          for (const bundledCoreUrl of candidateUrls) {
            try {
              const bundledRes = await fetch(bundledCoreUrl);
              const ct = bundledRes.headers.get('content-type') || '';
              if (bundledRes.ok && !ct.includes('text/html') && !ct.includes('application/json')) {
                const buf = await bundledRes.arrayBuffer();
                if (isAudioPayload(buf)) {
                  const cleanedBuf = cleanRiffWav(buf);
                  const isMp3 = isAudioMp3(cleanedBuf);
                  const mimeType = isMp3 ? 'audio/mpeg' : 'audio/wav';
                  const blob = new Blob([cleanedBuf], { type: mimeType });
                  const blobUrl = URL.createObjectURL(blob);
                  audioMemoryCache.set(cacheKey, { blobUrl, buffer: cleanedBuf });
                  const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, blobUrl);
                  if (played || speechId !== latestSpeechRequestId) return;
                }
              }
            } catch {
              // Bundled core word not present
            }
          }
        }
      }

      // 3b. Unified Whole-Sentence Neural Synthesis via streaming backend:
      // Google TTS synthesizes the entire clause as a single utterance with conversational prosody
      // Generates in ~200-300ms on first press and immediately caches locally for 0ms subsequent replays.
      let streamSucceeded = false;
      const isOnline = typeof navigator === 'undefined' || navigator.onLine;
      if (isOnline && !options?.preferOfflineOnly) {
        try {
          const audioItem = await Promise.race([
            getOrFetchAudioItem(streamUrl, cacheKey),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
          ]);
          if (speechId !== latestSpeechRequestId) return;
          if (audioItem && isAudioPayload(audioItem.buffer)) {
            const cleanedBuf = cleanRiffWav(audioItem.buffer);
            const played = await playAudioUrl(cleanedBuf, formattedText, calibratedRate, speechId, audioItem.blobUrl);
            if (played || speechId !== latestSpeechRequestId) return;
            streamSucceeded = true;
          }
        } catch (streamErr) {
          console.warn('[Audio] Dynamic server speech fetch notice:', streamErr);
        }
      }

      // 3c. EMERGENCY OFFLINE OR NETWORK TIMEOUT FALLBACK:
      // When connected to the internet, unified whole-sentence neural synthesis is always preferred.
      // If completely offline OR if the streaming server is temporarily unreachable on mobile data,
      // fallback to stitched audio so the child can always vocalize without silence!
      if ((!isOnline || !streamSucceeded) && !isNonEnglish && isMultiWord) {
        try {
          const sentenceWav = await synthesizeOfflineSentence(formattedText, voiceToStream, options?.sentenceWords);
          if (sentenceWav && isAudioPayload(sentenceWav)) {
            const blob = new Blob([sentenceWav], { type: 'audio/wav' });
            const blobUrl = URL.createObjectURL(blob);
            const played = await playAudioUrl(sentenceWav, formattedText, calibratedRate, speechId, blobUrl);
            if (played || speechId !== latestSpeechRequestId) return;
          }
        } catch (synthErr) {
          console.warn('[Audio] Emergency sentence synthesis notice:', synthErr);
        }
      }
    }
  }

  // If superseded by a newer tap, do not play fallback system speech
  if (speechId !== latestSpeechRequestId) {
    return;
  }

  // Fallback to on-device Web Speech API with rich persona acoustic calibration (< 20ms response, zero user-gesture expiration)
  await speakWithBrowserSpeechSynthesis(formattedText, {
    ...options,
    voicePersona: selectedPersonaId,
    pitch: calibratedPitch,
    rate: calibratedRate,
    force: options?.force,
  });
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
  while (offset + 8 <= buffer.byteLength) {
    const chunkId =
      String.fromCharCode(view.getUint8(offset)) +
      String.fromCharCode(view.getUint8(offset + 1)) +
      String.fromCharCode(view.getUint8(offset + 2)) +
      String.fromCharCode(view.getUint8(offset + 3));
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'fmt ') {
      sampleRate = view.getUint32(offset + 12, true);
    } else if (chunkId === 'data') {
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
  fallbackBlobUrl?: string
): Promise<boolean> {
  enableSilentModePlayback();
  stopSpeaking();

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
          console.warn('[Audio] Non-audio payload rejected from Web Audio decode.');
          return false;
        }

        const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          ctx.decodeAudioData(verifiedBuffer.slice(0), resolve, reject);
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
        const bestVoice = getBestSystemVoice(targetPrefix, options?.voicePersona || 'Kore');
        if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang; // Synchronize utterance.lang with voice to fix iOS WebKit voice override
        } else if (voices.length > 0) {
          // If the device does not have a foreign language pack installed,
          // fall back to the highest rated available voice so speech is never completely silenced
          const fallbackVoice = getBestSystemVoice('en', options?.voicePersona || 'Kore') || voices[0];
          if (fallbackVoice) {
            utterance.voice = fallbackVoice;
          }
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

      // On iOS Safari / WebKit, any setTimeout breaks the synchronous user-gesture token,
      // which causes window.speechSynthesis.speak() to be completely silenced or dropped.
      // On iOS, dispatch synchronously. On Chromium/Android Chrome, use a tiny 25ms delay
      // to let cancel() flush without race condition.
      const isIOS = typeof navigator !== 'undefined' && (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1)
      );

      if (isIOS) {
        dispatchSpeech();
      } else {
        pendingSpeakTimeout = setTimeout(() => {
          pendingSpeakTimeout = null;
          dispatchSpeech();
        }, 25);
      }
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
      playChime('speak');
      notifySpeechState(false, null);
      resolve();
    }
  });
}

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

  const voiceToUse = selectedPersonaId === 'system' ? 'puck' : selectedPersonaId;
  const throttleKey = `${voiceToUse}_${normalizedLang}`;
  const now = Date.now();
  if (prewarmThrottleMap.has(throttleKey) && now - prewarmThrottleMap.get(throttleKey)! < 60000) {
    return;
  }
  prewarmThrottleMap.set(throttleKey, now);

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 100));
  idleFn(async () => {
    // For English: check and populate RAM cache from pre-bundled zero-latency local assets
    if (normalizedLang === 'en') {
      for (const phrase of CORE_AAC_VOCABULARY) {
        const formatted = formatForNaturalSpeech(phrase);
        if (!formatted) continue;
        const cacheKey = getTtsCacheKey(voiceToUse, normalizedLang, formatted);
        const streamUrl = getTtsStreamUrl(voiceToUse, normalizedLang, formatted);
        const existing = await getLocalCacheOnly(streamUrl, cacheKey);
        if (existing) continue;

        const wordSlug = formatted.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (wordSlug) {
          const bundledUrl = `/assets/audio/core/${voiceToUse}_${wordSlug}.wav`;
          try {
            const res = await fetch(bundledUrl);
            if (res.ok) {
              const buf = await res.arrayBuffer();
              if (isAudioPayload(buf)) {
                const cleaned = cleanRiffWav(buf);
                const blob = new Blob([cleaned], { type: 'audio/wav' });
                const blobUrl = URL.createObjectURL(blob);
                audioMemoryCache.set(cacheKey, { blobUrl, buffer: cleaned });
              }
            }
          } catch {}
        }
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
  const voiceToUse = selectedPersonaId === 'system' ? 'puck' : selectedPersonaId;

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
