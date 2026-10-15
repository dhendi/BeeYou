import { getAudioContext } from './context';
import { triggerHaptic } from '../../services/haptics';

// Audio file mappings for authentic high-fidelity chimes & sound effects
export const CHIME_AUDIO_FILES: Record<string, string> = {};

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
  // Fire sensory haptics if enabled by user (default OFF)
  if (type === 'tap') {
    triggerHaptic('light');
    return; // Silent audio on button taps per user request (removes navigation button press noise)
  }
  if (type === 'star' || type === 'complete') {
    triggerHaptic('success');
  } else if (type === 'breathe') {
    triggerHaptic('selection');
  }

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

export function playProceduralPetSound(petType: 'puppy' | 'kitten' | 'bunny' | 'turtle') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (petType === 'puppy') {
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
    }
  } catch (e) {}
}



