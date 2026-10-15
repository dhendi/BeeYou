import { SoundscapeId } from '../../types';
import { getAudioContext } from './context';
import { SOUNDSCAPE_AUDIO_FILES, SOUNDSCAPES_CATALOG } from './catalog';
import { ActiveSoundTrack, startProceduralTrack } from './procedural';

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
  track.active = false;
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
        // Direct volume assignment avoids browser interval throttling that leaves audio silent at 0.01
        audio.volume = targetVol;
        track.audioElement = audio;

        // Fallback to procedural synthesis if file fails to load/decode or errors
        audio.onerror = (err) => {
          console.warn(`[BeeYou Audio] Audio file error for ${id}, switching to procedural fallback:`, err);
          track.audioElement = null;
          startProceduralTrack(id, targetVolume, track);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio element playing successfully
            })
            .catch((err) => {
              console.warn(`[BeeYou Audio] Audio file playback failed for ${id}, using procedural fallback:`, err);
              track.audioElement = null;
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

