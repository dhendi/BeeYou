import { App as CapApp } from '@capacitor/app';
import { getAudioContext } from './context';

let backgroundAudioElement: HTMLAudioElement | null = null;
let isAudioKeeperActive = false;
let stopAllSoundscapesCallback: (() => void) | null = null;
let resumeSoundscapesCallback: (() => void) | null = null;

export function registerSoundscapeControlCallbacks(
  onStopAll: () => void,
  onResume: () => void
): void {
  stopAllSoundscapesCallback = onStopAll;
  resumeSoundscapesCallback = onResume;
}

/**
 * Initializes or updates the background audio keep-alive and lock-screen MediaSession.
 * When one or more ambient soundscapes are playing:
 * 1. An inaudible looping HTML5 audio element starts, engaging mobile OS background audio sessions (iOS AVAudioSession / Android MediaSession).
 * 2. MediaSession API registers lock screen play/pause/stop controls with custom soundscape titles.
 * 3. Visibility and Capacitor App listeners ensure AudioContext never gets paused or frozen when the phone locks or sleeps.
 */
export function updateBackgroundAudioKeeper(
  activeTrackCount: number,
  soundscapeTitles: string[] = []
): void {
  if (typeof window === 'undefined') return;

  if (activeTrackCount > 0) {
    // 1. Keep-alive HTML5 audio element
    if (!backgroundAudioElement) {
      try {
        const audio = new Audio('/sounds/silence.wav');
        audio.loop = true;
        audio.volume = 0.01;
        (audio as any).playsInline = true;
        backgroundAudioElement = audio;
      } catch (e) {
        console.warn('[BeeYou Audio] Background keeper init error:', e);
      }
    }

    if (backgroundAudioElement && backgroundAudioElement.paused) {
      backgroundAudioElement.play().catch(() => {
        // User gesture unlocks this on soundscape start
      });
    }

    isAudioKeeperActive = true;

    // 2. Lock-Screen / Notification Controls via MediaSession API
    if ('mediaSession' in navigator) {
      try {
        const displayTitle = soundscapeTitles.length > 0 
          ? soundscapeTitles.join(' + ') 
          : 'Ambient Soundscape';

        navigator.mediaSession.metadata = new MediaMetadata({
          title: displayTitle,
          artist: 'BeeYou • Sensory Room',
          album: 'Calm & Sleep Soundscapes',
          artwork: [
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            { src: '/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
          ],
        });

        navigator.mediaSession.playbackState = 'playing';

        navigator.mediaSession.setActionHandler('play', () => {
          const ctx = getAudioContext();
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          if (backgroundAudioElement && backgroundAudioElement.paused) {
            backgroundAudioElement.play().catch(() => {});
          }
          resumeSoundscapesCallback?.();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          stopAllSoundscapesCallback?.();
          if (backgroundAudioElement) {
            backgroundAudioElement.pause();
          }
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          stopAllSoundscapesCallback?.();
          if (backgroundAudioElement) {
            backgroundAudioElement.pause();
          }
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none';
          }
        });
      } catch (e) {
        // MediaSession unsupported or restricted
      }
    }
  } else {
    // Zero active soundscapes - release keeper and reset lock screen
    isAudioKeeperActive = false;

    if (backgroundAudioElement) {
      try {
        backgroundAudioElement.pause();
        backgroundAudioElement.currentTime = 0;
      } catch (e) {}
    }

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch (e) {}
    }
  }
}

// Global watchers to ensure AudioContext stays running when device sleeps / locks
if (typeof window !== 'undefined') {
  const ensureAudioAlive = () => {
    if (!isAudioKeeperActive) return;

    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (backgroundAudioElement && backgroundAudioElement.paused) {
        backgroundAudioElement.play().catch(() => {});
      }
    } catch (e) {}
  };

  // 1. Browser Visibility Change (Screen off, phone lock, tab switch)
  document.addEventListener('visibilitychange', () => {
    ensureAudioAlive();
  });

  // 2. Window Focus & Page Lifecycle
  window.addEventListener('focus', ensureAudioAlive);
  window.addEventListener('pageshow', ensureAudioAlive);

  // 3. Native Capacitor App State Change (Background / Foreground transition)
  try {
    CapApp.addListener('appStateChange', () => {
      if (isAudioKeeperActive) {
        ensureAudioAlive();
      }
    });
  } catch (e) {
    // Running in web browser without Capacitor native bridge
  }
}
