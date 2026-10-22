let audioCtx: AudioContext | null = null;
let silentAudioEl: HTMLAudioElement | null = null;
let hardwareUnlocked = false;
let silentAudioUnlocked = false;

/**
 * Configure browser / WebKit audio session to 'playback' mode.
 * On iOS Safari & mobile devices, this prevents the hardware Ring/Silent switch
 * from muting the user's AAC speech and audio feedback.
 */
export function enableSilentModePlayback(): void {
  if (typeof window === 'undefined') return;

  // 1. Modern WebKit AudioSession API (iOS 15+ Safari, WebKit, PWA)
  if ('audioSession' in navigator) {
    try {
      (navigator as any).audioSession.type = 'playback';
    } catch (e) {}
  }

  // 2. HTML5 Audio silent element for WebKit silent-switch bypass
  // Only trigger once to avoid unnecessary overhead and media pipeline churn on every tap
  if (!silentAudioUnlocked) {
    if (!silentAudioEl) {
      try {
        // 0.05s silent PCM WAV data URI
        const silenceWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8A/w==';
        const audio = new Audio(silenceWav);
        audio.preload = 'auto';
        (audio as any).playsInline = true;
        (audio as any).webkitPlaysInline = true;
        audio.volume = 0.001;
        silentAudioEl = audio;
      } catch (e) {}
    }

    if (silentAudioEl) {
      try {
        silentAudioEl.currentTime = 0;
        const playPromise = silentAudioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              silentAudioUnlocked = true;
            })
            .catch(() => {});
        }
      } catch (e) {}
    }
  }
}

/**
 * Unlocks Web Audio hardware output on iOS WebKit and mobile devices
 * by scheduling a 1-sample silent buffer directly through the destination node.
 */
export function unlockAudioHardwareNode(ctx: AudioContext): void {
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    hardwareUnlocked = true;
  } catch (e) {}
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  enableSilentModePlayback();

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

export function isAudioHardwareUnlocked(): boolean {
  return hardwareUnlocked && Boolean(audioCtx && audioCtx.state === 'running');
}

// Mobile / iOS User-Gesture Audio & Speech Unlocker
// Crucial: Keeps listeners active so subsequent app-switch or lock-screen suspensions
// are immediately resumed on the next user interaction.
if (typeof window !== 'undefined') {
  const handleUserGestureUnlock = () => {
    try {
      enableSilentModePlayback();
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        if (!hardwareUnlocked) {
          unlockAudioHardwareNode(ctx);
        }
      }
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    } catch (e) {}
  };

  const gestureEvents = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'] as const;
  gestureEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserGestureUnlock, { passive: true, capture: true });
  });

  // App lifecycle: resume audio pipeline when returning from background or lock screen
  const handleAppResume = () => {
    enableSilentModePlayback();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      handleAppResume();
    }
  });

  window.addEventListener('pageshow', handleAppResume);
  window.addEventListener('focus', handleAppResume);
}
