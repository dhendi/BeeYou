/**
 * Lumina Sound Synthesizer & Enhanced Web Speech API Voice Engine
 * Queries window.speechSynthesis.getVoices() to identify, rank, and prioritize
 * high-quality, fluid, natural system voices over mechanical/robotic voices.
 * 100% offline-ready.
 */

import { SoundscapeId, SoundscapeItem } from '../types';

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

// Audio file mappings for authentic high-fidelity chimes & sound effects
export const CHIME_AUDIO_FILES: Record<string, string> = {
  tap: '/sounds/tap.mp3',
  speak: '/sounds/speak.mp3',
  star: '/sounds/star.mp3',
  complete: '/sounds/complete.wav',
};

export const PET_AUDIO_FILES: Record<string, string> = {
  puppy: '/sounds/puppy.mp3',
  kitten: '/sounds/kitten.mp3',
};

// Reusable audio element pool for instant response without latency
const sampleAudioPool: Map<string, HTMLAudioElement[]> = new Map();

function playAudioSample(src: string, volume = 0.35): boolean {
  if (typeof window === 'undefined') return false;
  try {
    let pool = sampleAudioPool.get(src);
    if (!pool) {
      pool = [];
      sampleAudioPool.set(src, pool);
    }
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio) {
      if (pool.length < 8) {
        audio = new Audio(src);
        pool.push(audio);
      } else {
        audio = pool[0];
      }
    }
    audio.currentTime = 0;
    audio.volume = Math.max(0.01, Math.min(1.0, volume));
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Gentle pleasant musical chime for AAC taps and successes
export function playChime(type: 'tap' | 'speak' | 'star' | 'complete' | 'breathe' | 'clear' = 'tap') {
  try {
    const file = CHIME_AUDIO_FILES[type];
    if (file) {
      const vol = type === 'star' || type === 'complete' ? 0.45 : 0.28;
      const played = playAudioSample(file, vol);
      if (played) return;
    }
  } catch (e) {}

  playProceduralChime(type);
}

// Procedural synthesizer fallback if audio files are blocked or loading
export function playProceduralChime(type: 'tap' | 'speak' | 'star' | 'complete' | 'breathe' | 'clear' = 'tap') {
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
    const file = PET_AUDIO_FILES[petType];
    if (file) {
      const played = playAudioSample(file, 0.45);
      if (played) return;
    }
  } catch (e) {}

  playProceduralPetSound(petType);
}

export function playProceduralPetSound(petType: 'puppy' | 'kitten' | 'bunny' | 'turtle') {
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

// -------------------------------------------------------------
// LUMINA PROCEDURAL SENSORY ROOM SOUNDSCAPES (WEB AUDIO API)
// 100% Offline-ready, synthesized in real-time, infinite loop
// -------------------------------------------------------------

export const SOUNDSCAPES_CATALOG: SoundscapeItem[] = [
  {
    id: 'rain',
    name: 'Warm Summer Rain',
    description: 'Gentle steady rain patter on leaves. Masks distracting background noise.',
    emoji: '🌧️',
    isPremium: false,
    category: 'nature',
    tags: ['Calming', 'Masking', 'Free'],
  },
  {
    id: 'ocean',
    name: 'Calm Ocean Surf',
    description: 'Rhythmic, gentle waves rising and falling. Balances nervous system.',
    emoji: '🌊',
    isPremium: false,
    category: 'nature',
    tags: ['Rhythmic', 'Grounding', 'Free'],
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    description: 'Ultra-warm low-frequency rumble, like a soothing weighted blanket for your ears.',
    emoji: '🧸',
    isPremium: true,
    category: 'noise',
    tags: ['Sensory Deep', 'Premium'],
  },
  {
    id: 'stream',
    name: 'Babbling Forest Stream',
    description: 'Tranquil moving brook flowing over smooth river stones.',
    emoji: '🏞️',
    isPremium: true,
    category: 'nature',
    tags: ['Fresh', 'Peaceful', 'Premium'],
  },
  {
    id: 'crickets',
    name: 'Twilight Woods & Crickets',
    description: 'Peaceful nighttime forest with gentle ambient crickets and soft breeze.',
    emoji: '🦗',
    isPremium: true,
    category: 'nature',
    tags: ['Sleep', 'Evening', 'Premium'],
  },
  {
    id: 'space_drone',
    name: 'Cosmic Ambient Drone',
    description: 'Dreamy harmonic deep space resonance. Ideal for hyperfocus and calming.',
    emoji: '🪐',
    isPremium: true,
    category: 'focus',
    tags: ['Hyperfocus', 'Dreamy', 'Premium'],
  },
  {
    id: 'wind_chimes',
    name: 'Zen Wind Chimes & Bells',
    description: 'Gentle breeze carrying resonant melodic chimes and singing bowls.',
    emoji: '🎐',
    isPremium: true,
    category: 'nature',
    tags: ['Centering', 'Meditation', 'Premium'],
  },
  {
    id: 'train_chug',
    name: 'Steam Train Rhythm',
    description: 'Hypnotic steady chug and gentle click-clack along the scenic tracks.',
    emoji: '🚂',
    isPremium: true,
    category: 'special_interest',
    tags: ['Special Interest', 'Rhythmic', 'Premium'],
  },
  {
    id: 'train_tracks',
    name: 'Train Tracks & Rail Cadence',
    description: 'Hypnotic metallic click-clack rhythms over rail switches and rhythmic sleepers.',
    emoji: '🛤️',
    isPremium: true,
    category: 'special_interest',
    tags: ['Railways', 'Click-Clack', 'Premium'],
  },
  {
    id: 'driving',
    name: 'Cozy Highway Car Ride',
    description: 'Gentle low cabin engine hum, rhythmic pavement texture, and smooth highway air stream.',
    emoji: '🚗',
    isPremium: true,
    category: 'focus',
    tags: ['Car Ride', 'Cabin Rumble', 'Premium'],
  },
  {
    id: 'city',
    name: 'Gentle City & Rainy Street',
    description: 'Soft urban drizzle, distant muffled traffic echoes, and calm evening street ambiance.',
    emoji: '🏙️',
    isPremium: true,
    category: 'ambient',
    tags: ['City Rain', 'Urban Hum', 'Premium'],
  },
  {
    id: 'night_time',
    name: 'Peaceful Night & Starlight',
    description: 'Warm summer night stillness, distant tree crickets, and gentle nocturnal lullaby atmosphere.',
    emoji: '🌌',
    isPremium: true,
    category: 'nature',
    tags: ['Bedtime', 'Night Sky', 'Premium'],
  },
  {
    id: 'white_noise',
    name: 'Classic White Noise',
    description: 'Even full-spectrum static hiss. Blocks sudden household sounds, barking, and chatter.',
    emoji: '📻',
    isPremium: true,
    category: 'noise',
    tags: ['Full Masking', 'Tinnitus', 'Premium'],
  },
  {
    id: 'beach',
    name: 'Sunny Beach & Gentle Shoreline',
    description: 'Rolling warm surf washing over soft sand, gentle seafoam sizzle, and coastal ocean breeze.',
    emoji: '🏖️',
    isPremium: true,
    category: 'nature',
    tags: ['Warm Beach', 'Shoreline', 'Premium'],
  },
  {
    id: 'forest',
    name: 'Deep Pine Forest & Breeze',
    description: 'Wind whispering through ancient tall pines, soft pine needle rustle, and woodland calmness.',
    emoji: '🌲',
    isPremium: true,
    category: 'nature',
    tags: ['Pine Forest', 'Canopy Breeze', 'Premium'],
  },
  {
    id: 'fireplace',
    name: 'Cozy Crackling Fireplace',
    description: 'Deep warm glowing hearth, natural cedar wood crackles, gentle spark pops, and cozy fireside calm.',
    emoji: '🔥',
    isPremium: true,
    category: 'ambient',
    tags: ['Cozy Hearth', 'Wood Crackle', 'Sleep Aid', 'Premium'],
  },
  {
    id: 'medieval_tavern',
    name: 'Medieval Castle & Bard Hall',
    description: 'Atmospheric medieval stone hall with gentle Celtic harp, wooden flute melodies, ancient bourdon drone, and peaceful fantasy calm.',
    emoji: '🏰',
    isPremium: true,
    category: 'special_interest',
    tags: ['Fantasy RPG', 'Harp & Woodwinds', 'Medieval Drone', 'Premium'],
  },
];

// Audio file mappings for authentic, high-quality ambient recordings (100% offline & seamless looping)
export const SOUNDSCAPE_AUDIO_FILES: Record<SoundscapeId, string> = {
  rain: '/sounds/rain.mp3',
  ocean: '/sounds/ocean.mp3',
  brown_noise: '/sounds/brown_noise.wav',
  white_noise: '/sounds/white_noise.wav',
  stream: '/sounds/stream.mp3',
  crickets: '/sounds/crickets.mp3',
  space_drone: '/sounds/space_drone.mp3',
  wind_chimes: '/sounds/wind_chimes.mp3',
  train_chug: '/sounds/train_chug.mp3',
  train_tracks: '/sounds/train_tracks.mp3',
  driving: '/sounds/driving.mp3',
  city: '/sounds/city.mp3',
  night_time: '/sounds/night_time.mp3',
  beach: '/sounds/beach.mp3',
  forest: '/sounds/forest.mp3',
  fireplace: '/sounds/fireplace.mp3',
  medieval_tavern: '/sounds/medieval_tavern.mp3',
};

let activeSoundscapeId: SoundscapeId | null = null;
let activeSoundscapeAudioElement: HTMLAudioElement | null = null;
let activeSoundscapeFadeTimer: any = null;
let activeSoundscapeGain: GainNode | null = null;
let activeSoundscapeNodes: AudioNode[] = [];
let activeSoundscapeTimers: any[] = [];
const soundscapeChangeListeners: Set<(id: SoundscapeId | null) => void> = new Set();

function normalizeSoundscapeVolume(vol: number): number {
  if (vol <= 0.001) return 0;
  // If volume was passed in the legacy 0.01 - 0.25 range, scale to a pleasant 0.1 - 0.85
  if (vol <= 0.3) {
    return Math.min(1.0, Math.max(0.04, vol * 3.4));
  }
  return Math.min(1.0, Math.max(0.04, vol));
}

export function subscribeToSoundscape(listener: (id: SoundscapeId | null) => void) {
  soundscapeChangeListeners.add(listener);
  listener(activeSoundscapeId);
  return () => {
    soundscapeChangeListeners.delete(listener);
  };
}

function notifySoundscapeChange(id: SoundscapeId | null) {
  soundscapeChangeListeners.forEach((l) => {
    try {
      l(id);
    } catch (e) {
      console.error(e);
    }
  });
}

export function getActiveSoundscape(): SoundscapeId | null {
  return activeSoundscapeId;
}

export function stopSoundscape(): void {
  try {
    if (activeSoundscapeFadeTimer) {
      clearInterval(activeSoundscapeFadeTimer);
      activeSoundscapeFadeTimer = null;
    }

    if (activeSoundscapeAudioElement) {
      const audioToStop = activeSoundscapeAudioElement;
      activeSoundscapeAudioElement = null;
      // Gentle fade out over 200ms
      const initialVol = audioToStop.volume;
      const step = initialVol / 5;
      let cur = initialVol;
      const fadeOutTimer = setInterval(() => {
        cur = Math.max(0, cur - step);
        try {
          audioToStop.volume = cur;
        } catch (e) {}
        if (cur <= 0.01) {
          clearInterval(fadeOutTimer);
          audioToStop.pause();
          audioToStop.currentTime = 0;
        }
      }, 40);
    }

    // Stop procedural synthesizer nodes
    activeSoundscapeTimers.forEach((t) => clearInterval(t));
    activeSoundscapeTimers = [];

    const ctx = getAudioContext();
    if (activeSoundscapeGain && ctx) {
      const now = ctx.currentTime;
      activeSoundscapeGain.gain.cancelScheduledValues(now);
      activeSoundscapeGain.gain.setValueAtTime(activeSoundscapeGain.gain.value, now);
      activeSoundscapeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      const nodesToClean = [...activeSoundscapeNodes];
      setTimeout(() => {
        nodesToClean.forEach((n) => {
          try {
            (n as any).stop?.();
            n.disconnect();
          } catch (e) {}
        });
      }, 350);
    } else {
      activeSoundscapeNodes.forEach((n) => {
        try {
          (n as any).stop?.();
          n.disconnect();
        } catch (e) {}
      });
    }

    activeSoundscapeGain = null;
    activeSoundscapeNodes = [];
    activeSoundscapeId = null;
    notifySoundscapeChange(null);
  } catch (e) {
    console.error('Error stopping soundscape:', e);
  }
}

export function setSoundscapeVolume(vol: number): void {
  try {
    const normalized = normalizeSoundscapeVolume(vol);
    if (activeSoundscapeAudioElement) {
      activeSoundscapeAudioElement.volume = normalized;
    }
    const ctx = getAudioContext();
    if (!ctx || !activeSoundscapeGain) return;
    const clamped = Math.max(0.001, Math.min(0.5, vol));
    activeSoundscapeGain.gain.cancelScheduledValues(ctx.currentTime);
    activeSoundscapeGain.gain.linearRampToValueAtTime(clamped, ctx.currentTime + 0.1);
  } catch (e) {}
}

export function playSoundscape(id: SoundscapeId, volume = 0.12): void {
  try {
    if (activeSoundscapeId === id && activeSoundscapeAudioElement && !activeSoundscapeAudioElement.paused) {
      setSoundscapeVolume(volume);
      return;
    }

    stopSoundscape();

    activeSoundscapeId = id;
    notifySoundscapeChange(id);

    const soundFile = SOUNDSCAPE_AUDIO_FILES[id];
    const targetVol = normalizeSoundscapeVolume(volume);

    if (soundFile && typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundFile);
        audio.loop = true;
        audio.volume = 0.01;
        activeSoundscapeAudioElement = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (activeSoundscapeAudioElement !== audio) return;
              // Smooth fade-in over 450ms
              let cur = 0.01;
              const step = Math.max(0.02, targetVol / 11);
              activeSoundscapeFadeTimer = setInterval(() => {
                if (activeSoundscapeAudioElement !== audio) {
                  clearInterval(activeSoundscapeFadeTimer);
                  return;
                }
                cur = Math.min(targetVol, cur + step);
                try {
                  audio.volume = cur;
                } catch (e) {}
                if (cur >= targetVol) {
                  clearInterval(activeSoundscapeFadeTimer);
                  activeSoundscapeFadeTimer = null;
                }
              }, 40);
            })
            .catch((err) => {
              console.warn(`[Lumina Audio] Audio file playback blocked or failed for ${id}, using procedural fallback:`, err);
              playProceduralSoundscape(id, volume);
            });
        }
        return;
      } catch (err) {
        console.warn(`[Lumina Audio] Could not instantiate audio file for ${id}:`, err);
      }
    }

    // Procedural synthesis fallback
    playProceduralSoundscape(id, volume);
  } catch (e) {
    console.error('Error playing soundscape:', e);
  }
}

export function playProceduralSoundscape(id: SoundscapeId, volume = 0.08): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.8);
    masterGain.connect(ctx.destination);

    activeSoundscapeGain = masterGain;

    if (id === 'rain') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.03 * white) / 1.03;
        last = data[i];
        data[i] *= 2.2;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(350, now);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3200, now);

      noise.connect(hp);
      hp.connect(lp);
      lp.connect(masterGain);
      noise.start();
      activeSoundscapeNodes.push(noise, hp, lp, masterGain);

      const dripTimer = setInterval(() => {
        if (activeSoundscapeId !== 'rain') return;
        const dripCtx = getAudioContext();
        if (!dripCtx || !activeSoundscapeGain) return;
        const dNow = dripCtx.currentTime;
        const osc = dripCtx.createOscillator();
        const g = dripCtx.createGain();
        osc.type = 'sine';
        const freq = 1200 + Math.random() * 1200;
        osc.frequency.setValueAtTime(freq, dNow);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, dNow + 0.04);
        g.gain.setValueAtTime(volume * 0.25, dNow);
        g.gain.exponentialRampToValueAtTime(0.0001, dNow + 0.04);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(dNow);
        osc.stop(dNow + 0.05);
      }, 240);
      activeSoundscapeTimers.push(dripTimer);

    } else if (id === 'ocean') {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);

      noise.start();
      lfo.start();
      activeSoundscapeNodes.push(noise, filter, lfo, lfoGain, masterGain);

    } else if (id === 'brown_noise') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.8;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.Q.setValueAtTime(0.7, now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      activeSoundscapeNodes.push(noise, filter, masterGain);

    } else if (id === 'stream') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.setValueAtTime(750, now);
      bp1.Q.setValueAtTime(1.2, now);

      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(1600, now);
      bp2.Q.setValueAtTime(1.8, now);

      noise.connect(bp1);
      noise.connect(bp2);
      bp1.connect(masterGain);
      bp2.connect(masterGain);
      noise.start();
      activeSoundscapeNodes.push(noise, bp1, bp2, masterGain);

      const bubbleTimer = setInterval(() => {
        if (activeSoundscapeId !== 'stream') return;
        const sCtx = getAudioContext();
        if (!sCtx || !activeSoundscapeGain) return;
        const bNow = sCtx.currentTime;
        const osc = sCtx.createOscillator();
        const g = sCtx.createGain();
        osc.type = 'sine';
        const startFreq = 400 + Math.random() * 450;
        osc.frequency.setValueAtTime(startFreq, bNow);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, bNow + 0.05);
        g.gain.setValueAtTime(volume * 0.2, bNow);
        g.gain.exponentialRampToValueAtTime(0.0001, bNow + 0.06);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(bNow);
        osc.stop(bNow + 0.07);
      }, 280);
      activeSoundscapeTimers.push(bubbleTimer);

    } else if (id === 'crickets') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.015 * white) / 1.015;
        last = data[i];
      }
      const breeze = ctx.createBufferSource();
      breeze.buffer = buffer;
      breeze.loop = true;
      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(320, now);
      breeze.connect(breezeFilter);
      breezeFilter.connect(masterGain);
      breeze.start();
      activeSoundscapeNodes.push(breeze, breezeFilter, masterGain);

      const cricketTimer = setInterval(() => {
        if (activeSoundscapeId !== 'crickets') return;
        const cCtx = getAudioContext();
        if (!cCtx || !activeSoundscapeGain) return;
        const cNow = cCtx.currentTime;
        [0, 0.04, 0.08].forEach((offset) => {
          const osc = cCtx.createOscillator();
          const g = cCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4600 + Math.random() * 200, cNow + offset);
          g.gain.setValueAtTime(volume * 0.25, cNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, cNow + offset + 0.025);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(cNow + offset);
          osc.stop(cNow + offset + 0.03);
        });
      }, 1400);
      activeSoundscapeTimers.push(cricketTimer);

    } else if (id === 'space_drone') {
      const freqs = [55, 110, 164.81, 220];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? 0.4 : -0.3), now);
        g.gain.setValueAtTime(volume * (idx === 0 ? 0.6 : 0.35), now);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        activeSoundscapeNodes.push(osc, g);
      });
      activeSoundscapeNodes.push(masterGain);

    } else if (id === 'wind_chimes') {
      const chimePitches = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const chimeTimer = setInterval(() => {
        if (activeSoundscapeId !== 'wind_chimes') return;
        const wCtx = getAudioContext();
        if (!wCtx || !activeSoundscapeGain) return;
        const wNow = wCtx.currentTime;
        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const delay = i * 0.15;
          const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
          const osc = wCtx.createOscillator();
          const overtone = wCtx.createOscillator();
          const g = wCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, wNow + delay);

          overtone.type = 'sine';
          overtone.frequency.setValueAtTime(pitch * 2.76, wNow + delay);

          g.gain.setValueAtTime(volume * 0.35, wNow + delay);
          g.gain.exponentialRampToValueAtTime(0.0001, wNow + delay + 2.5);

          osc.connect(g);
          overtone.connect(g);
          g.connect(masterGain);

          osc.start(wNow + delay);
          overtone.start(wNow + delay);
          osc.stop(wNow + delay + 2.6);
          overtone.stop(wNow + delay + 2.6);
        }
      }, 1900);
      activeSoundscapeTimers.push(chimeTimer);
      activeSoundscapeNodes.push(masterGain);

    } else if (id === 'train_chug') {
      let beat = 0;
      const trainTimer = setInterval(() => {
        if (activeSoundscapeId !== 'train_chug') return;
        const tCtx = getAudioContext();
        if (!tCtx || !activeSoundscapeGain) return;
        const tNow = tCtx.currentTime;

        const bufferSize = Math.floor(tCtx.sampleRate * 0.12);
        const buffer = tCtx.createBuffer(1, bufferSize, tCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const chugSource = tCtx.createBufferSource();
        chugSource.buffer = buffer;

        const chugFilter = tCtx.createBiquadFilter();
        chugFilter.type = 'bandpass';
        chugFilter.frequency.setValueAtTime(beat % 2 === 0 ? 550 : 420, tNow);
        chugFilter.Q.setValueAtTime(2.0, tNow);

        const chugGain = tCtx.createGain();
        const chugVol = beat % 2 === 0 ? volume * 0.55 : volume * 0.35;
        chugGain.gain.setValueAtTime(chugVol, tNow);
        chugGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.11);

        chugSource.connect(chugFilter);
        chugFilter.connect(chugGain);
        chugGain.connect(masterGain);

        chugSource.start(tNow);
        chugSource.stop(tNow + 0.12);

        if (beat % 2 === 0) {
          const rumble = tCtx.createOscillator();
          const rGain = tCtx.createGain();
          rumble.type = 'triangle';
          rumble.frequency.setValueAtTime(65, tNow);
          rGain.gain.setValueAtTime(volume * 0.25, tNow);
          rGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.09);
          rumble.connect(rGain);
          rGain.connect(masterGain);
          rumble.start(tNow);
          rumble.stop(tNow + 0.1);
        }

        beat = (beat + 1) % 4;
      }, 260);
      activeSoundscapeTimers.push(trainTimer);
      activeSoundscapeNodes.push(masterGain);

    } else if (id === 'train_tracks') {
      // 1. Continuous rail resonance hum
      const humBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const humData = humBuffer.getChannelData(0);
      let lastHum = 0;
      for (let i = 0; i < ctx.sampleRate * 2; i++) {
        const white = Math.random() * 2 - 1;
        humData[i] = (lastHum + 0.02 * white) / 1.02;
        lastHum = humData[i];
      }
      const humSrc = ctx.createBufferSource();
      humSrc.buffer = humBuffer;
      humSrc.loop = true;
      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(140, now);
      humSrc.connect(humFilter);
      humFilter.connect(masterGain);
      humSrc.start(now);
      activeSoundscapeNodes.push(humSrc, humFilter, masterGain);

      // 2. Double click-clack rail cadence (wheels crossing track joints)
      let railStep = 0;
      const railTimer = setInterval(() => {
        if (activeSoundscapeId !== 'train_tracks') return;
        const rCtx = getAudioContext();
        if (!rCtx || !activeSoundscapeGain) return;
        const rNow = rCtx.currentTime;

        [0, 0.11].forEach((offset, idx) => {
          const osc = rCtx.createOscillator();
          const g = rCtx.createGain();
          const filter = rCtx.createBiquadFilter();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 520 : 410, rNow + offset);
          osc.frequency.exponentialRampToValueAtTime(110, rNow + offset + 0.05);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(950, rNow + offset);
          filter.Q.setValueAtTime(3.0, rNow + offset);

          g.gain.setValueAtTime(volume * (idx === 0 ? 0.45 : 0.35), rNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, rNow + offset + 0.06);

          osc.connect(filter);
          filter.connect(g);
          g.connect(masterGain);

          osc.start(rNow + offset);
          osc.stop(rNow + offset + 0.07);
        });

        railStep++;
      }, 540);
      activeSoundscapeTimers.push(railTimer);

    } else if (id === 'driving') {
      // 1. Engine low cabin drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const engineFilter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(46, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(92, now);

      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(110, now);

      oscGain.gain.setValueAtTime(volume * 0.45, now);
      osc1.connect(engineFilter);
      osc2.connect(engineFilter);
      engineFilter.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      activeSoundscapeNodes.push(osc1, osc2, engineFilter, oscGain);

      // 2. Cabin road texture & highway air stream
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastRoad = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastRoad + 0.04 * white) / 1.04;
        lastRoad = data[i];
      }
      const roadNoise = ctx.createBufferSource();
      roadNoise.buffer = buffer;
      roadNoise.loop = true;

      const roadFilter = ctx.createBiquadFilter();
      roadFilter.type = 'bandpass';
      roadFilter.frequency.setValueAtTime(260, now);
      roadFilter.Q.setValueAtTime(0.8, now);

      roadNoise.connect(roadFilter);
      roadFilter.connect(masterGain);
      roadNoise.start(now);
      activeSoundscapeNodes.push(roadNoise, roadFilter, masterGain);

    } else if (id === 'city') {
      // 1. Distant city muffled low murmur
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastCity = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastCity + 0.02 * white) / 1.02;
        lastCity = data[i];
      }
      const cityNoise = ctx.createBufferSource();
      cityNoise.buffer = buffer;
      cityNoise.loop = true;

      const cityFilter = ctx.createBiquadFilter();
      cityFilter.type = 'lowpass';
      cityFilter.frequency.setValueAtTime(220, now);

      cityNoise.connect(cityFilter);
      cityFilter.connect(masterGain);
      cityNoise.start(now);
      activeSoundscapeNodes.push(cityNoise, cityFilter);

      // 2. Soft rain on street pavement
      const rainBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      for (let i = 0; i < ctx.sampleRate * 2; i++) {
        rainData[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = rainBuffer;
      rainSource.loop = true;
      const rainBandpass = ctx.createBiquadFilter();
      rainBandpass.type = 'bandpass';
      rainBandpass.frequency.setValueAtTime(1400, now);
      rainBandpass.Q.setValueAtTime(1.1, now);
      rainSource.connect(rainBandpass);
      rainBandpass.connect(masterGain);
      rainSource.start(now);
      activeSoundscapeNodes.push(rainSource, rainBandpass, masterGain);

    } else if (id === 'night_time') {
      // 1. Soft dreamy nighttime harmonic pad (F3, C4, A4)
      const chord = [174.61, 261.63, 440.0];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : -0.2), now);
        g.gain.setValueAtTime(volume * 0.28, now);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        activeSoundscapeNodes.push(osc, g);
      });

      // 2. Summer night crickets with soft rhythm
      const nightTimer = setInterval(() => {
        if (activeSoundscapeId !== 'night_time') return;
        const nCtx = getAudioContext();
        if (!nCtx || !activeSoundscapeGain) return;
        const nNow = nCtx.currentTime;
        [0, 0.05, 0.1].forEach((off) => {
          const osc = nCtx.createOscillator();
          const g = nCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(5100 + Math.random() * 180, nNow + off);
          g.gain.setValueAtTime(volume * 0.18, nNow + off);
          g.gain.exponentialRampToValueAtTime(0.0001, nNow + off + 0.035);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(nNow + off);
          osc.stop(nNow + off + 0.04);
        });
      }, 1600);
      activeSoundscapeTimers.push(nightTimer);
      activeSoundscapeNodes.push(masterGain);

    } else if (id === 'white_noise') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.55;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Soft lowpass filter to prevent harshness on sensory sensitive ears
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(7000, now);

      source.connect(filter);
      filter.connect(masterGain);
      source.start(now);
      activeSoundscapeNodes.push(source, filter, masterGain);

    } else if (id === 'beach') {
      // 1. Shoreline wave swells with ocean wash
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(0.7, now);

      // Slow 6-second wave cycle
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.16, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);

      noise.start(now);
      lfo.start(now);
      activeSoundscapeNodes.push(noise, filter, lfo, lfoGain, masterGain);

      // 2. Faint distant seagull call every ~8 seconds
      const gullTimer = setInterval(() => {
        if (activeSoundscapeId !== 'beach') return;
        const bCtx = getAudioContext();
        if (!bCtx || !activeSoundscapeGain) return;
        const bNow = bCtx.currentTime;
        const osc = bCtx.createOscillator();
        const g = bCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, bNow);
        osc.frequency.exponentialRampToValueAtTime(2400, bNow + 0.18);
        osc.frequency.exponentialRampToValueAtTime(1900, bNow + 0.45);
        g.gain.setValueAtTime(volume * 0.08, bNow);
        g.gain.exponentialRampToValueAtTime(0.0001, bNow + 0.5);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(bNow);
        osc.stop(bNow + 0.52);
      }, 7800);
      activeSoundscapeTimers.push(gullTimer);

    } else if (id === 'forest') {
      // 1. Wind through canopy pine needles
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastWind = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastWind + 0.03 * white) / 1.03;
        lastWind = data[i];
      }
      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(420, now);
      windFilter.Q.setValueAtTime(1.0, now);

      const windLfo = ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.2, now);
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(180, now);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      wind.connect(windFilter);
      windFilter.connect(masterGain);
      wind.start(now);
      windLfo.start(now);
      activeSoundscapeNodes.push(wind, windFilter, windLfo, windLfoGain, masterGain);

      // 2. Occasional sweet woodland bird whistle
      const birdTimer = setInterval(() => {
        if (activeSoundscapeId !== 'forest') return;
        const fCtx = getAudioContext();
        if (!fCtx || !activeSoundscapeGain) return;
        const fNow = fCtx.currentTime;
        const startPitch = 2100 + Math.random() * 500;
        const osc = fCtx.createOscillator();
        const g = fCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startPitch, fNow);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 1.25, fNow + 0.12);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 0.9, fNow + 0.28);
        g.gain.setValueAtTime(volume * 0.14, fNow);
        g.gain.exponentialRampToValueAtTime(0.0001, fNow + 0.32);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(fNow);
        osc.stop(fNow + 0.35);
      }, 4200);
      activeSoundscapeTimers.push(birdTimer);

    } else if (id === 'fireplace') {
      // 1. Warm low hearth flame rumble (pink-brown noise with gentle undulating breath)
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let lastFire = 0;
      for (let i = 0; i < ctx.sampleRate * 3; i++) {
        const white = Math.random() * 2 - 1;
        fireData[i] = (lastFire + 0.025 * white) / 1.025;
        lastFire = fireData[i];
      }
      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(220, now);

      // Flame flicker LFO
      const flameLfo = ctx.createOscillator();
      flameLfo.type = 'sine';
      flameLfo.frequency.setValueAtTime(0.35, now);
      const flameLfoGain = ctx.createGain();
      flameLfoGain.gain.setValueAtTime(60, now);
      flameLfo.connect(flameLfoGain);
      flameLfoGain.connect(fireFilter.frequency);

      fireSrc.connect(fireFilter);
      fireFilter.connect(masterGain);
      fireSrc.start(now);
      flameLfo.start(now);
      activeSoundscapeNodes.push(fireSrc, fireFilter, flameLfo, flameLfoGain);

      // 2. Soft glowing ember hiss (air and warmth)
      const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const hissData = hissBuffer.getChannelData(0);
      for (let i = 0; i < ctx.sampleRate * 2; i++) {
        hissData[i] = (Math.random() * 2 - 1) * 0.12;
      }
      const hissSrc = ctx.createBufferSource();
      hissSrc.buffer = hissBuffer;
      hissSrc.loop = true;
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'bandpass';
      hissFilter.frequency.setValueAtTime(1400, now);
      hissFilter.Q.setValueAtTime(0.8, now);
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(volume * 0.25, now);
      hissSrc.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(masterGain);
      hissSrc.start(now);
      activeSoundscapeNodes.push(hissSrc, hissFilter, hissGain);

      // 3. Authentic natural wood crackles, ember snaps & resin pops
      const crackleTimer = setInterval(() => {
        if (activeSoundscapeId !== 'fireplace') return;
        const mCtx = getAudioContext();
        if (!mCtx || !activeSoundscapeGain) return;
        const mNow = mCtx.currentTime;

        // Random chance of crackle snap
        if (Math.random() > 0.3) {
          const isDeepPop = Math.random() < 0.25; // 25% deep wood pop, 75% light snap
          const dur = isDeepPop ? 0.06 : 0.025;
          const pop = mCtx.createBufferSource();
          const popBuf = mCtx.createBuffer(1, Math.floor(mCtx.sampleRate * dur), mCtx.sampleRate);
          const pData = popBuf.getChannelData(0);
          const decay = isDeepPop ? 80 : 180;
          for (let p = 0; p < pData.length; p++) {
            pData[p] = (Math.random() * 2 - 1) * Math.exp(-p / decay);
          }
          pop.buffer = popBuf;

          const popFilter = mCtx.createBiquadFilter();
          popFilter.type = isDeepPop ? 'bandpass' : 'highpass';
          popFilter.frequency.setValueAtTime(isDeepPop ? 450 + Math.random() * 250 : 1600 + Math.random() * 800, mNow);
          if (isDeepPop) popFilter.Q.setValueAtTime(3.0, mNow);

          const popGain = mCtx.createGain();
          const popVol = volume * (isDeepPop ? 0.6 : 0.4) * (0.6 + Math.random() * 0.8);
          popGain.gain.setValueAtTime(popVol, mNow);
          popGain.gain.exponentialRampToValueAtTime(0.0001, mNow + dur);

          pop.connect(popFilter);
          popFilter.connect(popGain);
          popGain.connect(masterGain);
          pop.start(mNow);
        }
      }, 220);
      activeSoundscapeTimers.push(crackleTimer);
      activeSoundscapeNodes.push(masterGain);

    } else if (id === 'medieval_tavern') {
      // 1. Ancient Bourdon & Bowed Vielle Open-Fifth Drone (D2, A2, D3)
      const dronePitches = [73.42, 110.00, 146.83];
      dronePitches.forEach((dPitch, dIdx) => {
        const dOsc = ctx.createOscillator();
        const dGain = ctx.createGain();
        const dFilter = ctx.createBiquadFilter();

        dOsc.type = dIdx === 0 ? 'sawtooth' : 'triangle';
        dOsc.frequency.setValueAtTime(dPitch + (dIdx === 1 ? 0.25 : -0.2), now);

        dFilter.type = 'lowpass';
        dFilter.frequency.setValueAtTime(360, now);

        dGain.gain.setValueAtTime(volume * (dIdx === 0 ? 0.16 : 0.2), now);

        // Organic slow drone undulation
        const dLfo = ctx.createOscillator();
        dLfo.type = 'sine';
        dLfo.frequency.setValueAtTime(0.14 + dIdx * 0.03, now);
        const dLfoGain = ctx.createGain();
        dLfoGain.gain.setValueAtTime(volume * 0.04, now);
        dLfo.connect(dLfoGain);
        dLfoGain.connect(dGain.gain);

        dOsc.connect(dFilter);
        dFilter.connect(dGain);
        dGain.connect(masterGain);

        dOsc.start(now);
        dLfo.start(now);
        activeSoundscapeNodes.push(dOsc, dFilter, dGain, dLfo, dLfoGain);
      });

      // 2. Celtic Harp & Plucked Dulcimer Arpeggios (Modal Chords in D Dorian)
      const harpChords = [
        [146.83, 220.00, 293.66, 349.23, 440.00], // D3, A3, D4, F4, A4 (D min)
        [130.81, 196.00, 261.63, 329.63, 392.00], // C3, G3, C4, E4, G4 (C maj)
        [98.00, 146.83, 246.94, 293.66, 392.00],  // G2, D3, B3, D4, G4 (G maj)
        [146.83, 174.61, 220.00, 293.66, 349.23], // D3, F3, A3, D4, F4 (D min)
      ];
      let chordIndex = 0;
      const harpTimer = setInterval(() => {
        if (activeSoundscapeId !== 'medieval_tavern') return;
        const hCtx = getAudioContext();
        if (!hCtx || !activeSoundscapeGain) return;
        const hNow = hCtx.currentTime;

        const chord = harpChords[chordIndex % harpChords.length];
        chordIndex++;

        chord.forEach((notePitch, pIdx) => {
          const pluckTime = hNow + pIdx * 0.22;
          const osc1 = hCtx.createOscillator();
          const osc2 = hCtx.createOscillator();
          const pFilter = hCtx.createBiquadFilter();
          const pGain = hCtx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(notePitch, pluckTime);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(notePitch * 2.01, pluckTime); // string harmonic

          pFilter.type = 'lowpass';
          pFilter.frequency.setValueAtTime(1900, pluckTime);
          pFilter.frequency.exponentialRampToValueAtTime(340, pluckTime + 1.2);

          pGain.gain.setValueAtTime(volume * 0.26, pluckTime);
          pGain.gain.exponentialRampToValueAtTime(0.0001, pluckTime + 1.7);

          osc1.connect(pFilter);
          osc2.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(masterGain);

          osc1.start(pluckTime);
          osc2.start(pluckTime);
          osc1.stop(pluckTime + 1.75);
          osc2.stop(pluckTime + 1.75);
        });
      }, 2600);
      activeSoundscapeTimers.push(harpTimer);

      // 3. Wandering Renaissance Wooden Flute / Whistle Melodies
      const fluteMelodies = [
        [440.00, 523.25, 493.88, 440.00, 392.00, 440.00], // A4, C5, B4, A4, G4, A4
        [293.66, 349.23, 392.00, 440.00, 349.23, 293.66], // D4, F4, G4, A4, F4, D4
        [329.63, 349.23, 329.63, 293.66, 261.63, 293.66], // E4, F4, E4, D4, C4, D4
        [440.00, 392.00, 349.23, 392.00, 440.00, 523.25, 440.00], // A4, G4, F4, G4, A4, C5, A4
      ];
      let flutePhraseIndex = 0;
      const fluteTimer = setInterval(() => {
        if (activeSoundscapeId !== 'medieval_tavern') return;
        const flCtx = getAudioContext();
        if (!flCtx || !activeSoundscapeGain) return;
        const flNow = flCtx.currentTime;

        const phrase = fluteMelodies[flutePhraseIndex % fluteMelodies.length];
        flutePhraseIndex++;

        phrase.forEach((notePitch, nIdx) => {
          const noteTime = flNow + nIdx * 0.44;
          const noteDur = 0.40;

          // Warm flute core
          const fOsc = flCtx.createOscillator();
          fOsc.type = 'sine';
          fOsc.frequency.setValueAtTime(notePitch, noteTime);

          // Gentle vibrato (after breath onset)
          const vibOsc = flCtx.createOscillator();
          vibOsc.frequency.setValueAtTime(4.8, noteTime);
          const vibGain = flCtx.createGain();
          vibGain.gain.setValueAtTime(0, noteTime);
          vibGain.gain.setValueAtTime(0, noteTime + 0.12);
          vibGain.gain.linearRampToValueAtTime(3.2, noteTime + 0.35);
          vibOsc.connect(vibGain);
          vibGain.connect(fOsc.frequency);

          // Woodwind breath noise
          const bBuffer = flCtx.createBuffer(1, Math.floor(flCtx.sampleRate * noteDur), flCtx.sampleRate);
          const bData = bBuffer.getChannelData(0);
          for (let b = 0; b < bData.length; b++) {
            bData[b] = (Math.random() * 2 - 1) * 0.07;
          }
          const bSrc = flCtx.createBufferSource();
          bSrc.buffer = bBuffer;
          const bFilter = flCtx.createBiquadFilter();
          bFilter.type = 'bandpass';
          bFilter.frequency.setValueAtTime(notePitch * 2.2, noteTime);
          bFilter.Q.setValueAtTime(2.0, noteTime);
          bSrc.connect(bFilter);

          // Soft expressive note envelope
          const fGain = flCtx.createGain();
          fGain.gain.setValueAtTime(0.0001, noteTime);
          fGain.gain.linearRampToValueAtTime(volume * 0.30, noteTime + 0.06);
          fGain.gain.setValueAtTime(volume * 0.26, noteTime + noteDur - 0.08);
          fGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + noteDur);

          fOsc.connect(fGain);
          bFilter.connect(fGain);
          fGain.connect(masterGain);

          fOsc.start(noteTime);
          vibOsc.start(noteTime);
          bSrc.start(noteTime);

          fOsc.stop(noteTime + noteDur + 0.05);
          vibOsc.stop(noteTime + noteDur + 0.05);
          bSrc.stop(noteTime + noteDur + 0.05);
        });
      }, 5200);
      activeSoundscapeTimers.push(fluteTimer);
      activeSoundscapeNodes.push(masterGain);
    }
  } catch (e) {
    console.error('Lumina Soundscape playback error:', e);
  }
}

// Backward-compatible toggle for calming toolkit
export function toggleSoothingNoise(enable: boolean, volume = 0.06) {
  if (enable) {
    playSoundscape('ocean', volume);
  } else {
    stopSoundscape();
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
