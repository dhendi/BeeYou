import { playChime } from './chimes';
import { getVoicePersonaById } from '../../data/voicePersonasData';

// -------------------------------------------------------------
// WEB SPEECH API GETVOICES() QUERYING & NATURAL RANKING ENGINE
// -------------------------------------------------------------

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
const speechListeners: Set<(isSpeaking: boolean, text: string | null) => void> = new Set();
const voiceUpdateListeners: Set<(voices: SpeechSynthesisVoice[]) => void> = new Set();
const audioMemoryCache = new Map<string, string>();
const TTS_CACHE_NAME = 'beeyou-tts-v3';

/**
 * Multi-tier Audio Cache Loader (Memory -> Browser CacheStorage -> Edge Stream)
 */
async function getOrFetchAudioBlobUrl(streamUrl: string, cacheKey: string): Promise<string | null> {
  // 1. L1 In-Memory Cache (0ms latency)
  if (audioMemoryCache.has(cacheKey)) {
    return audioMemoryCache.get(cacheKey)!;
  }

  // 2. L2 Browser CacheStorage API (Persistent across app reloads & offline)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(TTS_CACHE_NAME);
      const match = await cache.match(streamUrl);
      if (match) {
        const blob = await match.blob();
        const blobUrl = URL.createObjectURL(blob);
        audioMemoryCache.set(cacheKey, blobUrl);
        return blobUrl;
      }
    } catch {}
  }

  // 3. L3 Edge Server Stream
  try {
    const response = await fetch(streamUrl);
    if (response.ok) {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.open(TTS_CACHE_NAME).then((c) => c.put(streamUrl, response.clone())).catch(() => {});
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioMemoryCache.set(cacheKey, blobUrl);
      return blobUrl;
    }
  } catch {}

  return null;
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
  }
): Promise<void> {
  const formattedText = formatForNaturalSpeech(text);
  if (!formattedText) return;

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
  // When using any of the 20 neural voices and not restricted to offline-only:
  if (selectedPersonaId !== 'system' && !options?.preferOfflineOnly) {
    const cacheKey = `${selectedPersonaId}_${normalizedLang}_${formattedText.toLowerCase()}`;
    const streamUrl = `/api/tts?lang=${encodeURIComponent(normalizedLang)}&text=${encodeURIComponent(formattedText)}&voice=${encodeURIComponent(selectedPersonaId)}`;

    try {
      const blobUrl = await getOrFetchAudioBlobUrl(streamUrl, cacheKey);
      if (blobUrl) {
        const played = await playAudioUrl(blobUrl, formattedText, options?.rate);
        if (played) return;
      }
    } catch (err) {
      console.warn(`[Audio] Neural stream (${selectedPersonaId}) failed, falling back to local speech synthesis:`, err);
    }
  }

  // Fallback to on-device Web Speech API with rich persona acoustic calibration
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
 * Audio playback helper for base64 / audio URL
 */
export function playAudioUrl(src: string, originalText: string = '', rate?: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      stopSpeaking();
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;
      activeAudioElement = audio;
      notifySpeechState(true, originalText);

      const targetRate = Math.max(0.65, Math.min(1.2, rate ?? 0.85));
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
          console.warn('[Audio] playAudioUrl rejected:', err);
          cleanupAudio();
          notifySpeechState(false, null);
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
 * Top high-frequency AAC vocabulary to pre-warm for 0ms instantaneous speech
 */
export const CORE_AAC_VOCABULARY = [
  'Help',
  'Water',
  'Apple',
  'Food',
  'Bathroom',
  'Yes',
  'No',
  'Please',
  'Thank you',
  'I want',
  'More',
  'Stop',
  'All done',
  'Break',
  'Happy',
  'Sad',
  'Tired',
  'Hurts',
  'Play',
  'Go',
  'Like',
  'Quiet',
];

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

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 300));
  idleFn(async () => {
    for (const phrase of CORE_AAC_VOCABULARY) {
      const formatted = formatForNaturalSpeech(phrase);
      if (!formatted) continue;
      const cacheKey = `${selectedPersonaId}_${normalizedLang}_${formatted.toLowerCase()}`;
      const streamUrl = `/api/tts?lang=${encodeURIComponent(normalizedLang)}&text=${encodeURIComponent(formatted)}&voice=${encodeURIComponent(selectedPersonaId)}`;
      await getOrFetchAudioBlobUrl(streamUrl, cacheKey).catch(() => {});
    }
  });
}

/**
 * Predictive Screen Pre-loader:
 * Pre-warms words visible on the active view (e.g., Food board, Feelings, Tools) in the background
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

  const idleFn = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 100));
  idleFn(async () => {
    for (const phrase of phrases.slice(0, 24)) {
      const formatted = formatForNaturalSpeech(phrase);
      if (!formatted) continue;
      const cacheKey = `${selectedPersonaId}_${normalizedLang}_${formatted.toLowerCase()}`;
      const streamUrl = `/api/tts?lang=${encodeURIComponent(normalizedLang)}&text=${encodeURIComponent(formatted)}&voice=${encodeURIComponent(selectedPersonaId)}`;
      getOrFetchAudioBlobUrl(streamUrl, cacheKey).catch(() => {});
    }
  });
}
