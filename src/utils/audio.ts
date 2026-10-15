/**
 * BeeYou Sound Synthesizer & Enhanced Web Speech API Voice Engine
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

// Mobile / Android Global User-Gesture Audio & Speech Unlocker
if (typeof window !== 'undefined') {
  const unlockMobileAudioAndSpeech = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    } catch (e) {}
  };

  ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'].forEach((evt) => {
    window.addEventListener(evt, unlockMobileAudioAndSpeech, { passive: true, capture: true });
  });
}

// Audio file mappings for authentic high-fidelity chimes & sound effects
// Audio file mappings for optional sound effects (soundscapes remain authentic recordings in SOUNDSCAPE_AUDIO_FILES)
export const CHIME_AUDIO_FILES: Record<string, string> = {};

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
  // Silent on button taps per user request (removes navigation button press noise)
  if (type === 'tap') return;
  try {
    const file = CHIME_AUDIO_FILES[type];
    if (file) {
      const vol = type === 'star' || type === 'complete' ? 0.35 : 0.20;
      const played = playAudioSample(file, vol);
      if (played) return;
    }
  } catch (e) {}

  playProceduralChime(type);
}

// Procedural synthesizer for clean, subtle, soothing UI feedback (zero retro/arcade noise)
export function playProceduralChime(type: 'tap' | 'speak' | 'star' | 'complete' | 'breathe' | 'clear' = 'tap') {
  // Silent on button taps per user request
  if (type === 'tap') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'speak') {
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
// BEEYOU PROCEDURAL SENSORY ROOM SOUNDSCAPES (WEB AUDIO API)
// 100% Offline-ready, synthesized in real-time, infinite loop
// -------------------------------------------------------------

export const SOUNDSCAPES_CATALOG: SoundscapeItem[] = [
  {
    id: 'rain',
    name: 'Warm Summer Rain',
    description: 'Gentle steady rain patter on leaves. Masks distracting background noise.',
    isPremium: false,
    category: 'nature',
    tags: ['Calming', 'Masking', 'Free'],
  },
  {
    id: 'ocean',
    name: 'Calm Ocean Surf',
    description: 'Rhythmic, gentle waves rising and falling. Balances nervous system.',
    isPremium: false,
    category: 'nature',
    tags: ['Rhythmic', 'Grounding', 'Free'],
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    description: 'Ultra-warm low-frequency rumble, like a soothing weighted blanket for your ears.',
    isPremium: true,
    category: 'noise',
    tags: ['Sensory Deep', 'Premium'],
  },
  {
    id: 'pink_noise',
    name: 'Balanced Pink Noise',
    description: 'Gentle, balanced natural noise curve. Softer than white noise, ideal for sensory focus.',
    isPremium: true,
    category: 'noise',
    tags: ['Sensory Focus', 'Balanced', 'Premium'],
  },
  {
    id: 'green_noise',
    name: 'Soothing Green Noise',
    description: 'Centering 500Hz nature-frequency spectrum proven to calm sensory overstimulation and promote rest.',
    isPremium: true,
    category: 'noise',
    tags: ['Nervous System', 'Nature Tone', 'Premium'],
  },
  {
    id: 'thunderstorm',
    name: 'Rolling Thunder & Rain',
    description: 'Deep, distant rolling thunder rumbles and peaceful sheets of soothing summer rainfall.',
    isPremium: true,
    category: 'nature',
    tags: ['Thunder', 'Deep Rain', 'Premium'],
  },
  {
    id: 'cat_purr',
    name: 'Cozy Purring Cat',
    description: 'Deep, rhythmic chest vibrations and gentle breathing cadence of a contented sleeping kitten.',
    isPremium: true,
    category: 'nature',
    tags: ['Cat Purr', 'Vibration', 'Cozy', 'Premium'],
  },
  {
    id: 'stream',
    name: 'Babbling Forest Stream',
    description: 'Tranquil moving brook flowing over smooth river stones.',
    isPremium: true,
    category: 'nature',
    tags: ['Fresh', 'Peaceful', 'Premium'],
  },
  {
    id: 'crickets',
    name: 'Twilight Woods & Crickets',
    description: 'Peaceful nighttime forest with gentle ambient crickets and soft breeze.',
    isPremium: true,
    category: 'nature',
    tags: ['Sleep', 'Evening', 'Premium'],
  },
  {
    id: 'morning_birds',
    name: 'Morning Songbirds & Meadow',
    description: 'Sweet dawn robin melodies, soft canopy breeze, and gentle morning prairie stillness.',
    isPremium: true,
    category: 'nature',
    tags: ['Songbirds', 'Morning Meadow', 'Premium'],
  },
  {
    id: 'space_drone',
    name: 'Cosmic Ambient Drone',
    description: 'Dreamy harmonic deep space resonance. Ideal for hyperfocus and calming.',
    isPremium: true,
    category: 'focus',
    tags: ['Hyperfocus', 'Dreamy', 'Premium'],
  },
  {
    id: 'wind_chimes',
    name: 'Zen Wind Chimes & Bells',
    description: 'Gentle breeze carrying resonant melodic chimes and singing bowls.',
    isPremium: true,
    category: 'ambient',
    tags: ['Centering', 'Meditation', 'Premium'],
  },
  {
    id: 'tibetan_bowl',
    name: '432Hz Tibetan Singing Bowl',
    description: 'Pure 432Hz harmonic acoustic resonance and warm bronze bell envelope for deep grounding.',
    isPremium: true,
    category: 'ambient',
    tags: ['Singing Bowl', '432Hz', 'Meditation', 'Premium'],
  },
  {
    id: 'train_chug',
    name: 'Steam Train Rhythm',
    description: 'Hypnotic steady chug and gentle click-clack along the scenic tracks.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Special Interest', 'Rhythmic', 'Premium'],
  },
  {
    id: 'train_tracks',
    name: 'Train Tracks & Rail Cadence',
    description: 'Hypnotic metallic click-clack rhythms over rail switches and rhythmic sleepers.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Railways', 'Click-Clack', 'Premium'],
  },
  {
    id: 'driving',
    name: 'Cozy Highway Car Ride',
    description: 'Gentle low cabin engine hum, rhythmic pavement texture, and smooth highway air stream.',
    isPremium: true,
    category: 'focus',
    tags: ['Car Ride', 'Cabin Rumble', 'Premium'],
  },
  {
    id: 'box_fan',
    name: 'Rhythmic Box Fan',
    description: 'Steady, comforting mechanical motor hum and continuous airflow for full acoustic masking.',
    isPremium: true,
    category: 'noise',
    tags: ['Box Fan', 'Sleep Masking', 'Premium'],
  },
  {
    id: 'clock_tick',
    name: 'Gentle Wooden Clock',
    description: 'Predictable, grounding rhythmic pendulum tick-tock cadence providing calm temporal focus.',
    isPremium: true,
    category: 'focus',
    tags: ['Clock Tick', 'Rhythmic', 'Grounding', 'Premium'],
  },
  {
    id: 'library',
    name: 'Sanctuary Quiet Library',
    description: 'Peaceful sanctuary room tone, soft gentle page turns, and warm oak study stillness.',
    isPremium: true,
    category: 'focus',
    tags: ['Library', 'Quiet Study', 'Premium'],
  },
  {
    id: 'cafe',
    name: 'Cozy Raindrop Cafe',
    description: 'Quiet coffee shop corner, muffled comforting room murmur, gentle porcelain clink, and rain.',
    isPremium: true,
    category: 'ambient',
    tags: ['Cozy Cafe', 'Coffee Shop', 'Premium'],
  },
  {
    id: 'city',
    name: 'Gentle City & Rainy Street',
    description: 'Soft urban drizzle, distant muffled traffic echoes, and calm evening street ambiance.',
    isPremium: true,
    category: 'ambient',
    tags: ['City Rain', 'Urban Hum', 'Premium'],
  },
  {
    id: 'night_time',
    name: 'Peaceful Night & Starlight',
    description: 'Warm summer night stillness, distant tree crickets, and gentle nocturnal lullaby atmosphere.',
    isPremium: true,
    category: 'nature',
    tags: ['Bedtime', 'Night Sky', 'Premium'],
  },
  {
    id: 'white_noise',
    name: 'Classic White Noise',
    description: 'Even full-spectrum static hiss. Blocks sudden household sounds, barking, and chatter.',
    isPremium: true,
    category: 'noise',
    tags: ['Full Masking', 'Tinnitus', 'Premium'],
  },
  {
    id: 'beach',
    name: 'Sunny Beach & Gentle Shoreline',
    description: 'Rolling warm surf washing over soft sand, gentle seafoam sizzle, and coastal ocean breeze.',
    isPremium: true,
    category: 'nature',
    tags: ['Warm Beach', 'Shoreline', 'Premium'],
  },
  {
    id: 'forest',
    name: 'Deep Pine Forest & Breeze',
    description: 'Wind whispering through ancient tall pines, soft pine needle rustle, and woodland calmness.',
    isPremium: true,
    category: 'nature',
    tags: ['Pine Forest', 'Canopy Breeze', 'Premium'],
  },
  {
    id: 'fireplace',
    name: 'Cozy Crackling Fireplace',
    description: 'Deep warm glowing hearth, natural cedar wood crackles, gentle spark pops, and cozy fireside calm.',
    isPremium: true,
    category: 'ambient',
    tags: ['Cozy Hearth', 'Wood Crackle', 'Sleep Aid', 'Premium'],
  },
  {
    id: 'campfire',
    name: 'Night Pine Campfire',
    description: 'Outdoor campfire crackle, gentle glowing embers, evening breeze, and forest night sky.',
    isPremium: true,
    category: 'nature',
    tags: ['Campfire', 'Embers', 'Night Sky', 'Premium'],
  },
  {
    id: 'underwater',
    name: 'Deep Ocean Sanctuary',
    description: 'Submerged tranquil acoustic isolation, soothing pressure resonance, and gentle bubble flow.',
    isPremium: true,
    category: 'nature',
    tags: ['Underwater', 'Deep Ocean', 'Premium'],
  },
  {
    id: 'medieval_tavern',
    name: 'Medieval Castle & Bard Hall',
    description: 'Atmospheric medieval stone hall with gentle Celtic harp, wooden flute melodies, ancient bourdon drone, and peaceful fantasy calm.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Fantasy RPG', 'Harp & Woodwinds', 'Medieval Drone', 'Premium'],
  },
  {
    id: 'focus_20hz',
    name: 'Focus (20 Hz)',
    description: 'Binaural 20Hz beta-wave cognitive clarity frequency for deep attention and study.',
    isPremium: true,
    category: 'focus',
    tags: ['20Hz Beta', 'Focus', 'Cognitive', 'Premium'],
  },
  {
    id: 'anxiety_396hz',
    name: 'Anxiety Healer (396 Hz)',
    description: 'Grounding 396Hz Solfeggio frequency to release tension, worry, and nervous flutter.',
    isPremium: true,
    category: 'ambient',
    tags: ['396Hz', 'Solfeggio', 'Calm Nervous System', 'Premium'],
  },
  {
    id: 'release_528hz',
    name: 'Emotional Release (528 Hz)',
    description: 'Harmonic 528Hz Solfeggio frequency encouraging deep emotional release and somatic balance.',
    isPremium: true,
    category: 'ambient',
    tags: ['528Hz', 'Miracle Tone', 'Transformation', 'Premium'],
  },
  {
    id: 'rain_roof',
    name: 'Rain On Roof',
    description: 'Gentle, comforting raindrops pattering softly on an attic wooden and tin roof.',
    isPremium: true,
    category: 'nature',
    tags: ['Attic Rain', 'Tin Roof', 'Cozy Shelter', 'Premium'],
  },
  {
    id: 'hypnotic_words',
    name: 'Hypnotic Words',
    description: 'Soothing rhythmic resonant vocal drone and swaying acoustic pendulum hum.',
    isPremium: true,
    category: 'focus',
    tags: ['Hypnotic Pendulum', 'Rhythmic Cadence', 'Premium'],
  },
  {
    id: 'sleep_affirmations',
    name: 'Sleep Affirmations',
    description: 'Dreamy 432Hz ambient lullaby pad with warm acoustic heart warmth for bedtime.',
    isPremium: true,
    category: 'ambient',
    tags: ['Bedtime Pad', '432Hz', 'Affirmation', 'Premium'],
  },
  {
    id: 'elvish_whispers',
    name: 'Elvish Whispers',
    description: 'Gentle whispering breeze harmonies through ancient twilight canopy leaves.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Whisper Breeze', 'Fantasy Ambience', 'ASMR Gentle', 'Premium'],
  },
  {
    id: 'counting_sheep',
    name: 'Counting Sheep',
    description: 'Peaceful nighttime meadow with soft pasture hum and gentle distant chime.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Counting Sheep', 'Night Meadow', 'Sleep Aid', 'Premium'],
  },
  {
    id: 'bubble_wrap',
    name: 'Bubble Wrap',
    description: 'Pleasing, gentle tactile sensory popping impulses for grounding and tactile focus.',
    isPremium: true,
    category: 'special_interest',
    tags: ['Sensory Pop', 'Tactile Fidget', 'ASMR', 'Premium'],
  },
];

// Audio file mappings for authentic, high-quality ambient recordings (100% offline & seamless looping)
export const SOUNDSCAPE_AUDIO_FILES: Record<string, string> = {
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
  cat_purr: '/sounds/kitten.mp3',
};

export interface ActiveSoundTrack {
  id: SoundscapeId;
  audioElement: HTMLAudioElement | null;
  gainNode: GainNode | null;
  nodes: AudioNode[];
  timers: any[];
  fadeTimer: any;
  volume: number; // 0.0 to 1.0 (as low or as loud as user wants)
}

const activeSoundTracks: Map<SoundscapeId, ActiveSoundTrack> = new Map();
const soundscapeChangeListeners: Set<(ids: SoundscapeId[]) => void> = new Set();

function normalizeSoundscapeVolume(vol: number): number {
  if (vol <= 0.0001) return 0;
  return Math.max(0.0, Math.min(1.0, vol));
}

function notifySoundscapeChange(): void {
  const activeIds = Array.from(activeSoundTracks.keys());
  soundscapeChangeListeners.forEach((l) => {
    try {
      l(activeIds);
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeToSoundscapes(listener: (ids: SoundscapeId[]) => void) {
  soundscapeChangeListeners.add(listener);
  listener(Array.from(activeSoundTracks.keys()));
  return () => {
    soundscapeChangeListeners.delete(listener);
  };
}

export function subscribeToSoundscape(listener: (id: SoundscapeId | null) => void) {
  const legacyWrapper = (activeIds: SoundscapeId[]) => {
    listener(activeIds.length > 0 ? activeIds[0] : null);
  };
  soundscapeChangeListeners.add(legacyWrapper);
  listener(getActiveSoundscape());
  return () => {
    soundscapeChangeListeners.delete(legacyWrapper);
  };
}

export function getActiveSoundscape(): SoundscapeId | null {
  const keys = Array.from(activeSoundTracks.keys());
  return keys.length > 0 ? keys[0] : null;
}

export function getActiveSoundscapes(): SoundscapeId[] {
  return Array.from(activeSoundTracks.keys());
}

export function isSoundscapeActive(id: SoundscapeId): boolean {
  return activeSoundTracks.has(id);
}

const SOUNDSCAPE_VOLUME_STORAGE_KEY = 'beeyou_soundscape_volumes';

export function getSavedSoundscapeVolume(id?: SoundscapeId | null): number {
  if (typeof window === 'undefined') return 0.50;
  try {
    const raw = localStorage.getItem(SOUNDSCAPE_VOLUME_STORAGE_KEY);
    if (!raw) return 0.50;
    const map = JSON.parse(raw);
    if (id && typeof map[id] === 'number') {
      return map[id];
    }
    if (typeof map.global === 'number') {
      return map.global;
    }
  } catch (e) {}
  return 0.50;
}

export function saveSoundscapeVolume(vol: number, id?: SoundscapeId | null): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SOUNDSCAPE_VOLUME_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map.global = vol;
    if (id) {
      map[id] = vol;
    }
    localStorage.setItem(SOUNDSCAPE_VOLUME_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

export function setSoundscapeVolume(vol: number, soundId?: SoundscapeId | null): void {
  try {
    const clamped = Math.max(0.0, Math.min(1.0, vol));
    saveSoundscapeVolume(clamped, soundId);

    if (soundId) {
      const track = activeSoundTracks.get(soundId);
      if (track) {
        track.volume = clamped;
        if (track.audioElement) {
          track.audioElement.volume = clamped;
        }
        if (track.gainNode) {
          const ctx = getAudioContext();
          if (ctx) {
            track.gainNode.gain.cancelScheduledValues(ctx.currentTime);
            track.gainNode.gain.linearRampToValueAtTime(Math.max(0.0001, clamped), ctx.currentTime + 0.05);
          }
        }
      }
    } else {
      activeSoundTracks.forEach((_, id) => {
        setSoundscapeVolume(clamped, id);
      });
    }
  } catch (e) {}
}

function cleanupTrack(track: ActiveSoundTrack): void {
  if (track.fadeTimer) {
    clearInterval(track.fadeTimer);
    track.fadeTimer = null;
  }
  if (track.audioElement) {
    const audioToStop = track.audioElement;
    track.audioElement = null;
    const initialVol = audioToStop.volume;
    const step = initialVol / 4;
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
    }, 30);
  }
  track.timers.forEach((t) => clearInterval(t));
  track.timers = [];

  const ctx = getAudioContext();
  if (track.gainNode && ctx) {
    const now = ctx.currentTime;
    try {
      track.gainNode.gain.cancelScheduledValues(now);
      track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
      track.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    } catch (e) {}
    const nodesToClean = [...track.nodes];
    setTimeout(() => {
      nodesToClean.forEach((n) => {
        try {
          (n as any).stop?.();
          n.disconnect();
        } catch (e) {}
      });
    }, 250);
  } else {
    track.nodes.forEach((n) => {
      try {
        (n as any).stop?.();
        n.disconnect();
      } catch (e) {}
    });
  }
}

export function stopSoundscape(id?: SoundscapeId | null): void {
  try {
    if (id) {
      const track = activeSoundTracks.get(id);
      if (track) {
        cleanupTrack(track);
        activeSoundTracks.delete(id);
        notifySoundscapeChange();
      }
    } else {
      activeSoundTracks.forEach((track) => cleanupTrack(track));
      activeSoundTracks.clear();
      notifySoundscapeChange();
    }
  } catch (e) {
    console.error('Error stopping soundscape:', e);
  }
}

export function playSoundscape(id: SoundscapeId, volume?: number, isPremiumUser = false): void {
  try {
    const targetVolume = volume !== undefined ? volume : getSavedSoundscapeVolume(id);

    // If already playing, just update volume
    if (activeSoundTracks.has(id)) {
      setSoundscapeVolume(targetVolume, id);
      return;
    }

    // Free users: single active sound only
    if (!isPremiumUser) {
      stopSoundscape();
    }

    const track: ActiveSoundTrack = {
      id,
      audioElement: null,
      gainNode: null,
      nodes: [],
      timers: [],
      fadeTimer: null,
      volume: targetVolume,
    };
    activeSoundTracks.set(id, track);
    notifySoundscapeChange();

    const soundFile = SOUNDSCAPE_AUDIO_FILES[id];
    const targetVol = normalizeSoundscapeVolume(targetVolume);

    if (soundFile && typeof window !== 'undefined') {
      try {
        const audio = new Audio(soundFile);
        audio.loop = true;
        audio.volume = 0.01;
        track.audioElement = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!activeSoundTracks.has(id) || track.audioElement !== audio) return;
              let cur = 0.01;
              const step = Math.max(0.02, targetVol / 10);
              track.fadeTimer = setInterval(() => {
                if (!activeSoundTracks.has(id) || track.audioElement !== audio) {
                  clearInterval(track.fadeTimer);
                  return;
                }
                cur = Math.min(targetVol, cur + step);
                try {
                  audio.volume = cur;
                } catch (e) {}
                if (cur >= targetVol) {
                  clearInterval(track.fadeTimer);
                  track.fadeTimer = null;
                }
              }, 40);
            })
            .catch((err) => {
              console.warn(`[BeeYou Audio] Audio file playback failed for ${id}, using procedural fallback:`, err);
              startProceduralTrack(id, targetVolume, track);
            });
        }
        return;
      } catch (err) {
        console.warn(`[BeeYou Audio] Audio file init failed for ${id}:`, err);
      }
    }

    // Procedural synthesis fallback
    startProceduralTrack(id, targetVolume, track);
  } catch (e) {
    console.error('Error playing soundscape:', e);
  }
}

export function toggleSoundscape(id: SoundscapeId, volume?: number, isPremiumUser = false): boolean {
  if (activeSoundTracks.has(id)) {
    stopSoundscape(id);
    return false;
  } else {
    playSoundscape(id, volume, isPremiumUser);
    return true;
  }
}

// Procedural Web Audio Engine supporting all 29 soundscapes
export function startProceduralTrack(id: SoundscapeId, volume: number, track: ActiveSoundTrack): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const targetVol = Math.max(0.0001, volume);
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.6);
    masterGain.connect(ctx.destination);

    track.gainNode = masterGain;
    track.nodes.push(masterGain);

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
      track.nodes.push(noise, hp, lp);

      const dripTimer = setInterval(() => {
        if (!activeSoundTracks.has('rain')) return;
        const dCtx = getAudioContext();
        if (!dCtx || !track.gainNode) return;
        const dNow = dCtx.currentTime;
        const osc = dCtx.createOscillator();
        const g = dCtx.createGain();
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
      track.timers.push(dripTimer);

    } else if (id === 'thunderstorm') {
      // 1. Heavy rain bed
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.035 * white) / 1.035;
        last = data[i];
        data[i] *= 2.5;
      }
      const rainNoise = ctx.createBufferSource();
      rainNoise.buffer = buffer;
      rainNoise.loop = true;
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(2600, now);
      rainNoise.connect(rainFilter);
      rainFilter.connect(masterGain);
      rainNoise.start(now);
      track.nodes.push(rainNoise, rainFilter);

      // 2. Rolling thunder rumbles every 7-9 seconds
      const thunderTimer = setInterval(() => {
        if (!activeSoundTracks.has('thunderstorm')) return;
        const tCtx = getAudioContext();
        if (!tCtx || !track.gainNode) return;
        const tNow = tCtx.currentTime;

        const subOsc = tCtx.createOscillator();
        const subGain = tCtx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(42, tNow);
        subOsc.frequency.exponentialRampToValueAtTime(30, tNow + 3.2);

        subGain.gain.setValueAtTime(0.0001, tNow);
        subGain.gain.linearRampToValueAtTime(volume * 0.6, tNow + 0.8);
        subGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 3.5);

        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start(tNow);
        subOsc.stop(tNow + 3.6);
      }, 7500);
      track.timers.push(thunderTimer);

    } else if (id === 'pink_noise') {
      // Balanced Pink Noise (-3dB/octave slope)
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, filter);

    } else if (id === 'green_noise') {
      // Centered 500Hz nature-frequency spectrum
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.setValueAtTime(500, now);
      bp1.Q.setValueAtTime(1.1, now);
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(500, now);
      bp2.Q.setValueAtTime(1.1, now);
      noise.connect(bp1);
      bp1.connect(bp2);
      bp2.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, bp1, bp2);

    } else if (id === 'cat_purr') {
      // Warm rhythmic sleeping cat purr
      const purrOsc = ctx.createOscillator();
      const purrHarmonic = ctx.createOscillator();
      const purrFilter = ctx.createBiquadFilter();
      const purrGain = ctx.createGain();

      purrOsc.type = 'triangle';
      purrOsc.frequency.setValueAtTime(26, now);
      purrHarmonic.type = 'sine';
      purrHarmonic.frequency.setValueAtTime(52, now);

      purrFilter.type = 'lowpass';
      purrFilter.frequency.setValueAtTime(130, now);

      // Tremolo flutter
      const tremolo = ctx.createOscillator();
      tremolo.frequency.setValueAtTime(24, now);
      const tremGain = ctx.createGain();
      tremGain.gain.setValueAtTime(volume * 0.25, now);
      tremolo.connect(tremGain);
      tremGain.connect(purrGain.gain);

      purrOsc.connect(purrFilter);
      purrHarmonic.connect(purrFilter);
      purrFilter.connect(purrGain);
      purrGain.connect(masterGain);

      purrOsc.start(now);
      purrHarmonic.start(now);
      tremolo.start(now);
      track.nodes.push(purrOsc, purrHarmonic, purrFilter, purrGain, tremolo, tremGain);

    } else if (id === 'box_fan') {
      // Motor hum + steady air turbulence
      const motorOsc = ctx.createOscillator();
      motorOsc.type = 'triangle';
      motorOsc.frequency.setValueAtTime(60, now);
      const motorGain = ctx.createGain();
      motorGain.gain.setValueAtTime(volume * 0.35, now);
      motorOsc.connect(motorGain);
      motorGain.connect(masterGain);
      motorOsc.start(now);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }
      const airNoise = ctx.createBufferSource();
      airNoise.buffer = buffer;
      airNoise.loop = true;
      const airFilter = ctx.createBiquadFilter();
      airFilter.type = 'bandpass';
      airFilter.frequency.setValueAtTime(320, now);
      airFilter.Q.setValueAtTime(0.9, now);
      airNoise.connect(airFilter);
      airFilter.connect(masterGain);
      airNoise.start(now);
      track.nodes.push(motorOsc, motorGain, airNoise, airFilter);

    } else if (id === 'tibetan_bowl') {
      // 432Hz calming meditation singing bowl
      const bowlTimer = setInterval(() => {
        if (!activeSoundTracks.has('tibetan_bowl')) return;
        const bCtx = getAudioContext();
        if (!bCtx || !track.gainNode) return;
        const bNow = bCtx.currentTime;

        const fundamental = bCtx.createOscillator();
        const overtone = bCtx.createOscillator();
        const bGain = bCtx.createGain();

        fundamental.type = 'sine';
        fundamental.frequency.setValueAtTime(432, bNow);
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(864.5, bNow);

        bGain.gain.setValueAtTime(0.0001, bNow);
        bGain.gain.linearRampToValueAtTime(volume * 0.5, bNow + 0.15);
        bGain.gain.exponentialRampToValueAtTime(0.0001, bNow + 4.8);

        fundamental.connect(bGain);
        overtone.connect(bGain);
        bGain.connect(masterGain);

        fundamental.start(bNow);
        overtone.start(bNow);
        fundamental.stop(bNow + 5.0);
        overtone.stop(bNow + 5.0);
      }, 5200);
      track.timers.push(bowlTimer);

    } else if (id === 'clock_tick') {
      // Grounding wooden clock cadence
      let isTick = true;
      const clockTimer = setInterval(() => {
        if (!activeSoundTracks.has('clock_tick')) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
        const cNow = cCtx.currentTime;

        const osc = cCtx.createOscillator();
        const g = cCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isTick ? 780 : 640, cNow);
        osc.frequency.exponentialRampToValueAtTime(140, cNow + 0.025);

        g.gain.setValueAtTime(volume * 0.45, cNow);
        g.gain.exponentialRampToValueAtTime(0.0001, cNow + 0.03);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(cNow);
        osc.stop(cNow + 0.035);
        isTick = !isTick;
      }, 500);
      track.timers.push(clockTimer);

    } else if (id === 'morning_birds') {
      // Gentle meadow air + periodic morning birdsong
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
      }
      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(380, now);
      wind.connect(windFilter);
      windFilter.connect(masterGain);
      wind.start(now);
      track.nodes.push(wind, windFilter);

      const birdTimer = setInterval(() => {
        if (!activeSoundTracks.has('morning_birds')) return;
        const mCtx = getAudioContext();
        if (!mCtx || !track.gainNode) return;
        const mNow = mCtx.currentTime;
        const baseFreq = 2400 + Math.random() * 600;

        [0, 0.12, 0.24].forEach((offset) => {
          const osc = mCtx.createOscillator();
          const g = mCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, mNow + offset);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, mNow + offset + 0.06);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, mNow + offset + 0.1);
          g.gain.setValueAtTime(volume * 0.22, mNow + offset);
          g.gain.exponentialRampToValueAtTime(0.0001, mNow + offset + 0.11);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(mNow + offset);
          osc.stop(mNow + offset + 0.12);
        });
      }, 3400);
      track.timers.push(birdTimer);

    } else if (id === 'underwater') {
      // Deep submerged resonance
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(58, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(volume * 0.35, now);
      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(subOsc, subGain, noise, filter);

    } else if (id === 'cafe') {
      // Cozy Raindrop Cafe
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
      }
      const room = ctx.createBufferSource();
      room.buffer = buffer;
      room.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      room.connect(filter);
      filter.connect(masterGain);
      room.start(now);
      track.nodes.push(room, filter);

    } else if (id === 'library') {
      // Sanctuary Quiet Library
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const room = ctx.createBufferSource();
      room.buffer = buffer;
      room.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      room.connect(filter);
      filter.connect(masterGain);
      room.start(now);
      track.nodes.push(room, filter);

    } else if (id === 'campfire') {
      // Night Pine Campfire
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
      fireFilter.frequency.setValueAtTime(240, now);
      fireSrc.connect(fireFilter);
      fireFilter.connect(masterGain);
      fireSrc.start(now);
      track.nodes.push(fireSrc, fireFilter);

      const crackleTimer = setInterval(() => {
        if (!activeSoundTracks.has('campfire')) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
        const cNow = cCtx.currentTime;
        if (Math.random() > 0.35) {
          const pop = cCtx.createOscillator();
          const g = cCtx.createGain();
          pop.type = 'triangle';
          pop.frequency.setValueAtTime(1400 + Math.random() * 1200, cNow);
          g.gain.setValueAtTime(volume * 0.35, cNow);
          g.gain.exponentialRampToValueAtTime(0.0001, cNow + 0.03);
          pop.connect(g);
          g.connect(masterGain);
          pop.start(cNow);
          pop.stop(cNow + 0.035);
        }
      }, 250);
      track.timers.push(crackleTimer);

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
      track.nodes.push(noise, filter, lfo, lfoGain);

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
      track.nodes.push(noise, filter);

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
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(1600, now);
      noise.connect(bp1);
      noise.connect(bp2);
      bp1.connect(masterGain);
      bp2.connect(masterGain);
      noise.start();
      track.nodes.push(noise, bp1, bp2);

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
      track.nodes.push(breeze, breezeFilter);

      const cricketTimer = setInterval(() => {
        if (!activeSoundTracks.has('crickets')) return;
        const cCtx = getAudioContext();
        if (!cCtx || !track.gainNode) return;
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
      track.timers.push(cricketTimer);

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
        track.nodes.push(osc, g);
      });

    } else if (id === 'wind_chimes') {
      const chimePitches = [523.25, 659.25, 783.99, 880.0, 1046.5];
      const chimeTimer = setInterval(() => {
        if (!activeSoundTracks.has('wind_chimes')) return;
        const wCtx = getAudioContext();
        if (!wCtx || !track.gainNode) return;
        const wNow = wCtx.currentTime;
        const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
        const osc = wCtx.createOscillator();
        const g = wCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, wNow);
        g.gain.setValueAtTime(volume * 0.35, wNow);
        g.gain.exponentialRampToValueAtTime(0.0001, wNow + 2.4);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(wNow);
        osc.stop(wNow + 2.5);
      }, 1900);
      track.timers.push(chimeTimer);

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
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(7000, now);
      source.connect(filter);
      filter.connect(masterGain);
      source.start(now);
      track.nodes.push(source, filter);

    } else if (id === 'train_chug') {
      let beat = 0;
      const trainTimer = setInterval(() => {
        if (!activeSoundTracks.has('train_chug')) return;
        const tCtx = getAudioContext();
        if (!tCtx || !track.gainNode) return;
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
      track.timers.push(trainTimer);

    } else if (id === 'train_tracks') {
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
      track.nodes.push(humSrc, humFilter);

      const railTimer = setInterval(() => {
        if (!activeSoundTracks.has('train_tracks')) return;
        const rCtx = getAudioContext();
        if (!rCtx || !track.gainNode) return;
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
      }, 540);
      track.timers.push(railTimer);

    } else if (id === 'driving') {
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
      track.nodes.push(osc1, osc2, engineFilter, oscGain);

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
      track.nodes.push(roadNoise, roadFilter);

    } else if (id === 'city') {
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
      track.nodes.push(cityNoise, cityFilter);

    } else if (id === 'night_time') {
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
        track.nodes.push(osc, g);
      });

    } else if (id === 'beach') {
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
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, filter);

    } else if (id === 'forest') {
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
      wind.connect(windFilter);
      windFilter.connect(masterGain);
      wind.start(now);
      track.nodes.push(wind, windFilter);

    } else if (id === 'fireplace') {
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
      fireSrc.connect(fireFilter);
      fireFilter.connect(masterGain);
      fireSrc.start(now);
      track.nodes.push(fireSrc, fireFilter);

      const crackleTimer = setInterval(() => {
        if (!activeSoundTracks.has('fireplace')) return;
        const mCtx = getAudioContext();
        if (!mCtx || !track.gainNode) return;
        const mNow = mCtx.currentTime;
        if (Math.random() > 0.3) {
          const osc = mCtx.createOscillator();
          const g = mCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400 + Math.random() * 1200, mNow);
          g.gain.setValueAtTime(volume * 0.4, mNow);
          g.gain.exponentialRampToValueAtTime(0.0001, mNow + 0.03);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(mNow);
          osc.stop(mNow + 0.035);
        }
      }, 220);
      track.timers.push(crackleTimer);

    } else if (id === 'medieval_tavern') {
      const dronePitches = [73.42, 110.00, 146.83];
      dronePitches.forEach((dPitch, dIdx) => {
        const dOsc = ctx.createOscillator();
        const dGain = ctx.createGain();
        const dFilter = ctx.createBiquadFilter();
        dOsc.type = dIdx === 0 ? 'sawtooth' : 'triangle';
        dOsc.frequency.setValueAtTime(dPitch, now);
        dFilter.type = 'lowpass';
        dFilter.frequency.setValueAtTime(360, now);
        dGain.gain.setValueAtTime(volume * 0.18, now);
        dOsc.connect(dFilter);
        dFilter.connect(dGain);
        dGain.connect(masterGain);
        dOsc.start(now);
        track.nodes.push(dOsc, dFilter, dGain);
      });

    } else if (id === 'focus_20hz') {
      // 160Hz carrier with 20Hz beta-wave amplitude modulation
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(160, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.5, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(20, now);
      lfo.connect(modGain.gain);

      carrier.connect(modGain);
      modGain.connect(masterGain);

      carrier.start(now);
      lfo.start(now);
      track.nodes.push(carrier, lfo, modGain);

    } else if (id === 'anxiety_396hz') {
      // Solfeggio 396Hz pure sine with gentle 0.1Hz breathing envelope
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(396, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, now);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.15, now);
      osc2.connect(gain2);

      const tremolo = ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.setValueAtTime(0.12, now);

      const tremoloGain = ctx.createGain();
      tremoloGain.gain.setValueAtTime(0.7, now);
      tremolo.connect(tremoloGain.gain);

      osc.connect(tremoloGain);
      gain2.connect(tremoloGain);
      tremoloGain.connect(masterGain);

      osc.start(now);
      osc2.start(now);
      tremolo.start(now);
      track.nodes.push(osc, osc2, gain2, tremolo, tremoloGain);

    } else if (id === 'release_528hz') {
      // Solfeggio 528Hz Transformation tone with warm harmonic resonance
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);

      const oscHarmonic = ctx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(1056, now);

      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0.18, now);
      oscHarmonic.connect(harmGain);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      harmGain.connect(filter);
      filter.connect(masterGain);

      osc.start(now);
      oscHarmonic.start(now);
      track.nodes.push(osc, oscHarmonic, harmGain, filter);

    } else if (id === 'rain_roof') {
      // Filtered noise simulating rain on tin / attic roof
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.04 * white) / 1.04;
        last = data[i];
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1400, now);
      bp.Q.setValueAtTime(1.8, now);

      noise.connect(bp);
      bp.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, bp);

    } else if (id === 'hypnotic_words') {
      // Rhythmic resonant formant drone
      const f1 = ctx.createOscillator();
      f1.type = 'triangle';
      f1.frequency.setValueAtTime(220, now);

      const f2 = ctx.createOscillator();
      f2.type = 'sine';
      f2.frequency.setValueAtTime(330, now);

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(480, now);

      f1.connect(lpf);
      f2.connect(lpf);
      lpf.connect(masterGain);

      f1.start(now);
      f2.start(now);
      track.nodes.push(f1, f2, lpf);

    } else if (id === 'sleep_affirmations') {
      // Dreamy 432Hz ambient lullaby pad
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);

      const osc5 = ctx.createOscillator();
      osc5.type = 'sine';
      osc5.frequency.setValueAtTime(648, now);

      const gain5 = ctx.createGain();
      gain5.gain.setValueAtTime(0.2, now);
      osc5.connect(gain5);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      osc.connect(filter);
      gain5.connect(filter);
      filter.connect(masterGain);

      osc.start(now);
      osc5.start(now);
      track.nodes.push(osc, osc5, gain5, filter);

    } else if (id === 'elvish_whispers') {
      // Whispering breeze filtered pink noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.18;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1800, now);

      noise.connect(hp);
      hp.connect(masterGain);
      noise.start(now);
      track.nodes.push(noise, hp);

    } else if (id === 'counting_sheep') {
      // Night meadow drone with periodic gentle pentatonic chime
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(130.81, now);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(220, now);

      drone.connect(droneFilter);
      droneFilter.connect(masterGain);
      drone.start(now);
      track.nodes.push(drone, droneFilter);

      const sheepTimer = setInterval(() => {
        if (!activeSoundTracks.has('counting_sheep')) return;
        const sCtx = getAudioContext();
        if (!sCtx || !track.gainNode) return;
        const sNow = sCtx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];
        const note = notes[Math.floor(Math.random() * notes.length)];
        const bell = sCtx.createOscillator();
        const bellGain = sCtx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(note, sNow);
        bellGain.gain.setValueAtTime(0.0001, sNow);
        bellGain.gain.linearRampToValueAtTime(0.08, sNow + 0.08);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, sNow + 2.4);
        bell.connect(bellGain);
        bellGain.connect(track.gainNode);
        bell.start(sNow);
        bell.stop(sNow + 2.5);
      }, 3500);
      track.timers.push(sheepTimer);

    } else if (id === 'bubble_wrap') {
      // Tactile gentle bubble wrap popping impulses
      const popTimer = setInterval(() => {
        if (!activeSoundTracks.has('bubble_wrap')) return;
        const pCtx = getAudioContext();
        if (!pCtx || !track.gainNode) return;
        const pNow = pCtx.currentTime;
        const popOsc = pCtx.createOscillator();
        const popGain = pCtx.createGain();
        const baseFreq = 480 + (Math.random() * 120 - 60);
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(baseFreq, pNow);
        popOsc.frequency.exponentialRampToValueAtTime(90, pNow + 0.04);
        popGain.gain.setValueAtTime(0.0001, pNow);
        popGain.gain.linearRampToValueAtTime(0.35, pNow + 0.005);
        popGain.gain.exponentialRampToValueAtTime(0.0001, pNow + 0.045);
        popOsc.connect(popGain);
        popGain.connect(track.gainNode);
        popOsc.start(pNow);
        popOsc.stop(pNow + 0.05);
      }, 480);
      track.timers.push(popTimer);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      osc.connect(filter);
      filter.connect(masterGain);
      osc.start(now);
      track.nodes.push(osc, filter);
    }
  } catch (e) {
    console.error('Error starting procedural track:', e);
  }
}

export function playProceduralSoundscape(id: SoundscapeId, volume = 0.50): void {
  playSoundscape(id, volume);
}

// Backward-compatible toggle for calming toolkit
export function toggleSoothingNoise(enable: boolean, volume = 0.50) {
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

  // Persona gender orientation: Kore & Zephyr = Female; Puck & Fenrir = Male
  const isPreferFemale = !persona || persona === 'Kore' || persona === 'Zephyr';
  const isPreferMale = persona === 'Puck' || persona === 'Fenrir';

  const femaleKeywords = ['female', 'zira', 'jenny', 'aria', 'samantha', 'ava', 'zoe', 'allison', 'karen', 'serena', 'victoria', 'moira', 'fiona', 'tessa', 'ana', 'hazel', 'susan', 'cathy', 'agnes'];
  const maleKeywords = ['male', 'david', 'puck', 'guy', 'ryan', 'daniel', 'oliver', 'evan', 'tom', 'alex', 'george', 'mark', 'christopher', 'fred', 'bruce', 'ralph'];

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = rateVoiceNaturalness(v);
    const n = v.name.toLowerCase();

    if (isCanadianFrench) {
      if (v.lang.toLowerCase().includes('ca') || n.includes('canada')) score += 100;
    }

    if (isPreferFemale) {
      if (femaleKeywords.some((k) => n.includes(k))) score += 80;
      if (maleKeywords.some((k) => n.includes(k))) score -= 80;
    } else if (isPreferMale) {
      if (maleKeywords.some((k) => n.includes(k))) score += 80;
      if (femaleKeywords.some((k) => n.includes(k))) score -= 80;
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

  const selectedPersona = options?.voicePersona || 'Kore';

  // Check if we already have a cached audio blob for this phrase
  if (selectedPersona !== 'system' && !options?.preferOfflineOnly && !options?.voiceURI) {
    const cacheKey = `${selectedPersona}_${formattedText}`;
    if (audioMemoryCache.has(cacheKey)) {
      try {
        const audioSrc = audioMemoryCache.get(cacheKey)!;
        const played = await playAudioUrl(audioSrc, formattedText, options?.rate);
        if (played) return;
      } catch (e) {
        // Fallback to device speech synthesis below
      }
    }
  }

  // Authentic Native Pronunciation Audio Stream:
  // When speaking non-English languages where device browsers lack high-quality local voices,
  // stream authentic Google Neural audio for genuine native inflection.
  const lang = (options?.lang || 'en').toLowerCase();
  const normalizedLang = 
    (lang === 'fr_ca' || lang === 'fr-ca') ? 'fr_ca' :
    (lang === 'zh' || lang.startsWith('zh')) ? 'zh' :
    lang.substring(0, 2);

  if (normalizedLang !== 'en' && !options?.preferOfflineOnly) {
    const voices = getAvailableVoices();
    const explicitVoice = options?.voiceURI ? voices.find(v => v.voiceURI === options.voiceURI) : null;
    const isExplicitVoiceAuthenticForLang = explicitVoice && (
      normalizedLang === 'fr_ca'
        ? explicitVoice.lang.toLowerCase().startsWith('fr')
        : explicitVoice.lang.toLowerCase().startsWith(normalizedLang)
    );

    // If no authentic local voice is explicitly chosen, check if OS has any authentic local voice installed
    if (!isExplicitVoiceAuthenticForLang) {
      const localVoice = getBestSystemVoice(normalizedLang);
      const hasAuthenticLocalVoice = localVoice && (
        normalizedLang === 'fr_ca'
          ? localVoice.lang.toLowerCase().startsWith('fr')
          : localVoice.lang.toLowerCase().startsWith(normalizedLang)
      );

      // When device lacks native voice pack for this language, stream authentic neural audio
      if (!hasAuthenticLocalVoice) {
        const cacheKey = `${normalizedLang}_${formattedText.toLowerCase()}`;
        if (audioMemoryCache.has(cacheKey)) {
          try {
            const audioSrc = audioMemoryCache.get(cacheKey)!;
            const played = await playAudioUrl(audioSrc, formattedText, options?.rate);
            if (played) return;
          } catch (e) {
            // Fall through to fetch
          }
        }

        try {
          const streamUrl = `/api/tts?lang=${encodeURIComponent(normalizedLang)}&text=${encodeURIComponent(formattedText)}`;
          const response = await fetch(streamUrl);
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            audioMemoryCache.set(cacheKey, blobUrl);
            const played = await playAudioUrl(blobUrl, formattedText, options?.rate);
            if (played) return;
          }
        } catch (err) {
          console.warn(`[Audio] Authentic ${normalizedLang} audio stream playback failed, falling back to local speech synthesis:`, err);
        }
      }
    }
  }

  // Speak immediately via on-device Web Speech API for 0ms latency and 100% Android user gesture reliability
  await speakWithBrowserSpeechSynthesis(formattedText, {
    ...options,
    voicePersona: selectedPersona,
    force: options?.force,
  });
}

/**
 * Audio playback helper for base64 / audio URL
 */
function playAudioUrl(src: string, originalText: string, rate?: number): Promise<boolean> {
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

      audio.onplay = () => {
        try {
          audio.playbackRate = targetRate;
        } catch (e) {}
      };

      audio.onended = () => {
        activeAudioElement = null;
        notifySpeechState(false, null);
        resolve(true);
      };

      audio.onerror = (err) => {
        console.warn('[Audio] playAudioUrl error:', err, audio.error);
        activeAudioElement = null;
        notifySpeechState(false, null);
        resolve(false);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] playAudioUrl rejected:', err);
          activeAudioElement = null;
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

      // Natural Human Cadence Calibration (Deliberate & gentle for AAC clarity)
      utterance.pitch = Math.max(0.85, Math.min(1.15, options?.pitch ?? 1.0));
      utterance.rate = Math.max(0.65, Math.min(1.2, options?.rate ?? 0.85));

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
