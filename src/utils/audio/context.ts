let audioCtx: AudioContext | null = null;
let silentAudioEl: HTMLAudioElement | null = null;

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

  // 2. Universal HTML5 Audio silent unlock for WebKit silent-switch bypass
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
    silentAudioEl.play().catch(() => {});
  }
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

// Mobile / Android Global User-Gesture Audio & Speech Unlocker
if (typeof window !== 'undefined') {
  const events = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'] as const;
  const unbindUnlockListeners = () => {
    events.forEach((evt) => {
      window.removeEventListener(evt, unlockMobileAudioAndSpeech, { capture: true });
    });
  };

  const unlockMobileAudioAndSpeech = () => {
    try {
      enableSilentModePlayback();
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          unbindUnlockListeners();
        }).catch(() => {});
      } else if (ctx && ctx.state === 'running') {
        unbindUnlockListeners();
      }
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    } catch (e) {}
  };

  events.forEach((evt) => {
    window.addEventListener(evt, unlockMobileAudioAndSpeech, { passive: true, capture: true });
  });
}
