/**
 * Lumina Sound Synthesizer & Enhanced Web Speech API Voice Engine
 * Queries window.speechSynthesis.getVoices() to identify, rank, and prioritize
 * high-quality, fluid, natural system voices over mechanical/robotic voices.
 * 100% offline-ready.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Gentle pleasant musical chime for AAC taps and successes
export function playChime(type: 'tap' | 'speak' | 'star' | 'complete' | 'breathe' | 'clear' = 'tap') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'speak') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'star') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.06);
        noteGain.gain.setValueAtTime(0.1, now + idx * 0.06);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);
        noteOsc.start(now + idx * 0.06);
        noteOsc.stop(now + idx * 0.06 + 0.25);
      });
    } else if (type === 'complete') {
      const chords = [523.25, 659.25, 783.99]; // C major
      chords.forEach((freq) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, now);
        cGain.gain.setValueAtTime(0.07, now);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(now);
        cOsc.stop(now + 0.6);
      });
    } else if (type === 'breathe') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4 warm
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.5);
      gain.gain.linearRampToValueAtTime(0.001, now + 3.0);
      osc.start(now);
      osc.stop(now + 3.0);
    } else if (type === 'clear') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // Audio context not allowed or failed
  }
}

// Gentle audio effects for interactive animated pets & world objects
export function playPetSound(petType: 'puppy' | 'kitten' | 'bunny' | 'turtle') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (petType === 'puppy') {
      // Cheerful friendly double bark (pitch rising)
      [0, 0.14].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + idx * 30, now + delay);
        osc.frequency.exponentialRampToValueAtTime(560 + idx * 40, now + delay + 0.08);
        osc.frequency.exponentialRampToValueAtTime(260, now + delay + 0.12);
        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });
    } else if (petType === 'kitten') {
      // Sweet purring meow
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (petType === 'bunny') {
      // Rapid cute nibble chime
      [0, 0.06, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 + Math.random() * 100, now + delay);
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.05);
      });
    } else if (petType === 'turtle') {
      // Deep soothing singing bowl chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now); // A3 calm
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    }
  } catch (e) {}
}

export function playEntitySound(itemType: string) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (itemType.includes('puppy')) {
      playPetSound('puppy');
    } else if (itemType.includes('kitten')) {
      playPetSound('kitten');
    } else if (itemType.includes('bunny')) {
      playPetSound('bunny');
    } else if (itemType.includes('turtle')) {
      playPetSound('turtle');
    } else if (itemType.includes('train')) {
      // Train whistle chord (D5 + F#5)
      [587.33, 739.99].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } else if (itemType.includes('trampoline')) {
      // Boing sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (itemType.includes('projector') || itemType.includes('nightlight')) {
      // Cosmic shimmer sweep
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.05, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } else if (itemType.includes('aquarium')) {
      // Water bubble pop
      [300, 450, 600].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.08 + 0.05);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.06);
      });
    } else {
      playChime('star');
    }
  } catch (e) {}
}

// Gentle ambient white/pink soothing noise for Calm Toolkit
let ambientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function toggleSoothingNoise(enable: boolean, volume = 0.05) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!enable) {
      if (ambientGain) {
        ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        setTimeout(() => {
          if (ambientNode) {
            ambientNode.disconnect();
            ambientNode = null;
          }
          ambientGain = null;
        }, 500);
      }
      return;
    }

    if (ambientNode) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    noiseSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    noiseSource.start();
    ambientNode = noiseSource;
  } catch (e) {
    console.error('Ambient audio error:', e);
  }
}

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
  'microsoft david desktop',
  'microsoft zira desktop',
  'microsoft mark desktop',
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
export function getBestSystemVoice(langPrefix = 'en'): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const matchingVoices = voices.filter((v) => {
    return !langPrefix || v.lang.toLowerCase().startsWith(langPrefix.toLowerCase());
  });

  const targetList = matchingVoices.length > 0 ? matchingVoices : voices;

  // Sort descending by naturalness score
  const sorted = [...targetList].sort((a, b) => rateVoiceNaturalness(b) - rateVoiceNaturalness(a));

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
 * Format phrases for natural human speech cadence and prosody.
 */
function formatForNaturalSpeech(text: string): string {
  let cleaned = text.trim();
  if (!cleaned) return '';

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Add trailing punctuation if missing for natural downward intonation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Stop any current vocalization immediately
 */
export function stopSpeaking() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
  notifySpeechState(false, null);
}

/**
 * Main vocalization function:
 * 1. Checks memory cache for fast playback.
 * 2. Tries server-side Gemini Neural Voice (Kore, Puck, Zephyr) for human lifelike prosody when online.
 * 3. Fallbacks to the browser's top-ranked Natural on-device voice when offline or if server unavailable.
 */
export async function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    voicePersona?: string; // 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'system'
    lang?: string;
    preferOfflineOnly?: boolean;
  }
): Promise<void> {
  const formattedText = formatForNaturalSpeech(text);
  if (!formattedText) return;

  stopSpeaking();
  notifySpeechState(true, formattedText);

  const selectedPersona = options?.voicePersona || 'Kore';
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
  const isServerThrottled = Date.now() < serverTTSCooldownUntil;

  // 1. Try Lifelike Server Neural Voice if online, not throttled, and not explicitly set to system-only
  if (isOnline && !isServerThrottled && selectedPersona !== 'system' && !options?.preferOfflineOnly && !options?.voiceURI) {
    const cacheKey = `${selectedPersona}_${formattedText}`;

    // Check memory cache
    if (audioMemoryCache.has(cacheKey)) {
      try {
        const audioSrc = audioMemoryCache.get(cacheKey)!;
        await playAudioUrl(audioSrc, formattedText);
        return;
      } catch (e) {
        // Fallback below
      }
    }

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formattedText,
          voiceName: selectedPersona,
          style: 'Warm, clear, natural, friendly, and expressive voice for a child companion',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioData) {
          const audioSrc = `data:audio/wav;base64,${data.audioData}`;
          audioMemoryCache.set(cacheKey, audioSrc);
          await playAudioUrl(audioSrc, formattedText);
          return;
        }
      } else {
        // If server returns 429 quota or 503, cooldown server requests and smoothly use on-device speech
        serverTTSCooldownUntil = Date.now() + 5 * 60 * 1000;
      }
    } catch (err) {
      serverTTSCooldownUntil = Date.now() + 2 * 60 * 1000;
    }
  }

  // 2. High-Quality On-Device Natural Voice (Guaranteed Offline)
  await speakWithBrowserSpeechSynthesis(formattedText, options);
}

/**
 * Audio playback helper for base64 / audio URL
 */
function playAudioUrl(src: string, originalText: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(src);
      activeAudioElement = audio;

      audio.onended = () => {
        activeAudioElement = null;
        notifySpeechState(false, null);
        resolve();
      };

      audio.onerror = () => {
        activeAudioElement = null;
        notifySpeechState(false, null);
        resolve();
      };

      audio.play().catch(() => {
        activeAudioElement = null;
        notifySpeechState(false, null);
        resolve();
      });
    } catch (e) {
      activeAudioElement = null;
      notifySpeechState(false, null);
      resolve();
    }
  });
}

/**
 * On-Device Web Speech API Engine with Priority for Non-Robotic Fluid Voices
 */
function speakWithBrowserSpeechSynthesis(
  formattedText: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    lang?: string;
  }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      playChime('speak');
      notifySpeechState(false, null);
      resolve();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(formattedText);
      activeUtterance = utterance;

      // Natural Human Cadence Calibration:
      // High pitches (>1.05) sound metallic/robotic. Keep pitch at 1.0 (natural resonance).
      utterance.pitch = Math.max(0.85, Math.min(1.15, options?.pitch ?? 1.0));
      // Natural conversational rate: 0.96 gives clear, unhurried articulation without robotic staccato.
      utterance.rate = Math.max(0.7, Math.min(1.3, options?.rate ?? 0.96));

      const langMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        fil: 'fil-PH',
      };
      const targetLang = langMap[options?.lang ?? 'en'] || 'en-US';
      utterance.lang = targetLang;

      // Select top-ranked non-robotic natural voice
      const voices = getAvailableVoices();
      if (options?.voiceURI) {
        const explicit = voices.find((v) => v.voiceURI === options.voiceURI);
        if (explicit) utterance.voice = explicit;
      }

      // If no explicit voice, prioritize non-robotic fluid system voice
      if (!utterance.voice && voices.length > 0) {
        const bestVoice = getBestSystemVoice(targetLang.substring(0, 2));
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      utterance.onstart = () => {
        notifySpeechState(true, formattedText);
      };

      utterance.onend = () => {
        activeUtterance = null;
        notifySpeechState(false, null);
        resolve();
      };

      utterance.onerror = () => {
        activeUtterance = null;
        notifySpeechState(false, null);
        playChime('speak');
        resolve();
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
      playChime('speak');
      notifySpeechState(false, null);
      resolve();
    }
  });
}
