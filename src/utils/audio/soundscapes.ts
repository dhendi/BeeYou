import { SoundscapeId } from '../../types';
import { getAudioContext } from './context';
import { SOUNDSCAPE_AUDIO_FILES, SOUNDSCAPES_CATALOG } from './catalog';
import { ActiveSoundTrack, startProceduralTrack } from './procedural';
import { updateBackgroundAudioKeeper, registerSoundscapeControlCallbacks } from './background';

const activeSoundTracks: Map<SoundscapeId, ActiveSoundTrack> = new Map();
const soundscapeChangeListeners: Set<(ids: SoundscapeId[]) => void> = new Set();

// Register lock-screen / notification controls to stop or resume soundscapes
registerSoundscapeControlCallbacks(
  () => {
    stopSoundscape();
  },
  () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
);

function normalizeSoundscapeVolume(vol: number): number {
  if (vol <= 0.0001) return 0;
  return Math.max(0.0, Math.min(1.0, vol));
}

function notifySoundscapeChange(): void {
  const activeIds = Array.from(activeSoundTracks.keys());
  const activeNames = activeIds.map((id) => {
    const found = SOUNDSCAPES_CATALOG.find((s) => s.id === id);
    return found ? found.name : id;
  });
  updateBackgroundAudioKeeper(activeIds.length, activeNames);

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
          try {
            track.audioElement.volume = clamped;
          } catch (e) {}
        }
        if (track.gainNode) {
          const ctx = getAudioContext();
          if (ctx) {
            track.gainNode.gain.cancelScheduledValues(ctx.currentTime);
            track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, ctx.currentTime);
            track.gainNode.gain.linearRampToValueAtTime(clamped, ctx.currentTime + 0.03);
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

// In-memory cache for decoded AudioBuffers to guarantee zero-latency gapless looping
const audioBufferCache: Map<string, AudioBuffer> = new Map();
const pendingBufferLoads: Map<string, Promise<AudioBuffer | null>> = new Map();

export async function getOrLoadAudioBuffer(url: string, ctx: AudioContext): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url)!;
  }
  if (pendingBufferLoads.has(url)) {
    return pendingBufferLoads.get(url)!;
  }
  const loadPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(url, decoded);
      return decoded;
    } catch (err) {
      console.warn(`[BeeYou Audio] Failed to load/decode audio buffer from ${url}:`, err);
      return null;
    } finally {
      pendingBufferLoads.delete(url);
    }
  })();
  pendingBufferLoads.set(url, loadPromise);
  return loadPromise;
}

export function preloadSoundscapes(ids?: SoundscapeId[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const targetIds = ids || (Object.keys(SOUNDSCAPE_AUDIO_FILES) as SoundscapeId[]);
    targetIds.forEach((id) => {
      const file = SOUNDSCAPE_AUDIO_FILES[id];
      if (file && !audioBufferCache.has(file)) {
        getOrLoadAudioBuffer(file, ctx).catch(() => {});
      }
    });
  } catch (e) {}
}

function cleanupTrack(track: ActiveSoundTrack): void {
  track.active = false;
  if (track.fadeTimer) {
    clearInterval(track.fadeTimer);
    track.fadeTimer = null;
  }
  track.timers.forEach((t) => clearInterval(t));
  track.timers = [];

  const ctx = getAudioContext();
  if (track.gainNode && ctx) {
    const now = ctx.currentTime;
    try {
      track.gainNode.gain.cancelScheduledValues(now);
      track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
      track.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.12);
    } catch (e) {}
    
    const nodesToClean = [...track.nodes];
    const sourceToStop = track.sourceNode;
    track.sourceNode = null;

    setTimeout(() => {
      if (sourceToStop) {
        try { sourceToStop.stop(); } catch (e) {}
      }
      nodesToClean.forEach((n) => {
        try {
          (n as any).stop?.();
          n.disconnect();
        } catch (e) {}
      });
    }, 150);
  } else {
    if (track.sourceNode) {
      try { track.sourceNode.stop(); } catch (e) {}
      track.sourceNode = null;
    }
    track.nodes.forEach((n) => {
      try {
        (n as any).stop?.();
        n.disconnect();
      } catch (e) {}
    });
  }

  if (track.audioElement) {
    const audioToStop = track.audioElement;
    track.audioElement = null;
    try {
      audioToStop.pause();
      audioToStop.currentTime = 0;
    } catch (e) {}
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

function startHtmlAudioOrProcedural(
  id: SoundscapeId,
  volume: number,
  track: ActiveSoundTrack,
  soundFile: string,
  gainNode: GainNode
): void {
  try {
    const audio = new Audio(soundFile);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    track.audioElement = audio;

    const ctx = getAudioContext();
    if (ctx) {
      try {
        const source = ctx.createMediaElementSource(audio);
        source.connect(gainNode);
        track.nodes.push(source);
      } catch (e) {}
    }

    audio.onerror = () => {
      track.audioElement = null;
      startProceduralTrack(id, volume, track);
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        track.audioElement = null;
        startProceduralTrack(id, volume, track);
      });
    }
  } catch (e) {
    startProceduralTrack(id, volume, track);
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

    // Sensory room multi-sound mixing (allow up to 4 simultaneous sounds for free tier, unlimited for premium)
    if (!isPremiumUser && activeSoundTracks.size >= 4) {
      const oldestId = activeSoundTracks.keys().next().value;
      if (oldestId) {
        stopSoundscape(oldestId);
      }
    }

    const track: ActiveSoundTrack = {
      id,
      audioElement: null,
      sourceNode: null,
      gainNode: null,
      nodes: [],
      timers: [],
      fadeTimer: null,
      volume: targetVolume,
      active: true,
    };
    activeSoundTracks.set(id, track);
    notifySoundscapeChange();

    const targetVol = normalizeSoundscapeVolume(targetVolume);
    const soundFile = SOUNDSCAPE_AUDIO_FILES[id];
    const ctx = getAudioContext();

    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Create dedicated GainNode for this sound channel
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.05);
      gain.connect(ctx.destination);
      track.gainNode = gain;
      track.nodes.push(gain);

      if (soundFile && typeof window !== 'undefined') {
        getOrLoadAudioBuffer(soundFile, ctx).then((buffer) => {
          if (!track.active) return; // User stopped track while loading

          if (buffer) {
            // Sample-accurate, zero-latency Web Audio buffer looping (100% fluid, no cuts)
            try {
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.loop = true;
              source.connect(gain);
              source.start(0);
              track.sourceNode = source;
              track.nodes.push(source);
              return;
            } catch (err) {
              console.warn(`[BeeYou Audio] Buffer source failed for ${id}, using fallback:`, err);
            }
          }

          // Fallback to HTML5 audio or procedural if buffer decode fails
          startHtmlAudioOrProcedural(id, targetVolume, track, soundFile, gain);
        }).catch((err) => {
          console.warn(`[BeeYou Audio] Audio buffer load error for ${id}:`, err);
          if (track.active) {
            startProceduralTrack(id, targetVolume, track);
          }
        });
        return;
      }
    }

    // Direct procedural synthesis (for solfeggio frequencies 20Hz/396Hz/528Hz or when no audio file exists)
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

