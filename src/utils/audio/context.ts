let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
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
  const events = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click'] as const;
  const unbindUnlockListeners = () => {
    events.forEach((evt) => {
      window.removeEventListener(evt, unlockMobileAudioAndSpeech, { capture: true });
    });
  };

  const unlockMobileAudioAndSpeech = () => {
    try {
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
