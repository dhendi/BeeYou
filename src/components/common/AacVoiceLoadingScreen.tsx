import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Loader2, CheckCircle2, ArrowRight, Mic } from 'lucide-react';
import { preloadVoicePack, PreloadProgress } from '../../services/aacPreloadService';
import { playChime } from '../../utils/audio/chimes';
import { getVoicePersonaById } from '../../data/voicePersonasData';
import { t } from '../../services/translator';

interface AacVoiceLoadingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  persona?: string;
  language?: string;
}

export const AacVoiceLoadingScreen: React.FC<AacVoiceLoadingScreenProps> = ({
  isOpen,
  onComplete,
  persona = 'amy',
  language = 'en',
}) => {
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 83,
    percent: 0,
    currentPhrase: 'Connecting to neural speech engine...',
  });
  const [isFinished, setIsFinished] = useState(false);
  const personaObj = getVoicePersonaById(persona);

  // Keep a stable ref to onComplete to avoid triggering re-renders or restarting preloads
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const activeOpRef = useRef<string | null>(null);
  const highestPercentRef = useRef(0);
  const highestLoadedRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      activeOpRef.current = null;
      setIsFinished(false);
      highestPercentRef.current = 0;
      highestLoadedRef.current = 0;
      setProgress({
        loaded: 0,
        total: 82,
        percent: 0,
        currentPhrase: 'Preparing speech cache...',
      });
      return;
    }

    const opKey = `${persona}_${language}`;
    if (activeOpRef.current === opKey) {
      // Already running for this exact persona and language, do not restart
      return;
    }
    activeOpRef.current = opKey;
    setIsFinished(false);
    highestPercentRef.current = 0;
    highestLoadedRef.current = 0;
    setProgress({
      loaded: 0,
      total: 82,
      percent: 0,
      currentPhrase: 'Preparing speech cache...',
    });

    let isSubscribed = true;

    // Safety fail-safe threshold: Dismiss gracefully if network connection drops
    const maxSafetyTimer = setTimeout(() => {
      if (!isSubscribed) return;
      console.warn('[Voice Loading Screen] Safety threshold reached, dismissing modal.');
      setIsFinished(true);
      try { playChime('complete'); } catch {}
      setTimeout(() => {
        if (isSubscribed) {
          onCompleteRef.current?.();
        }
      }, 300);
    }, 30000);

    // Trigger genuine background pre-caching of every single AAC tile
    preloadVoicePack(
      persona,
      language,
      (p) => {
        if (!isSubscribed) return;
        highestLoadedRef.current = Math.max(highestLoadedRef.current, p.loaded);
        highestPercentRef.current = Math.max(highestPercentRef.current, p.percent);
        setProgress({
          loaded: highestLoadedRef.current,
          total: p.total || 82,
          percent: highestPercentRef.current,
          currentPhrase: p.currentPhrase,
        });
      }
    )
      .then(() => {
        if (!isSubscribed) return;
        clearTimeout(maxSafetyTimer);
        setIsFinished(true);
        try {
          playChime('complete');
        } catch {}
        setTimeout(() => {
          if (isSubscribed) {
            onCompleteRef.current?.();
          }
        }, 350);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        clearTimeout(maxSafetyTimer);
        console.warn('[Voice Preload Notice]:', err);
        setIsFinished(true);
        onCompleteRef.current?.();
      });

    return () => {
      isSubscribed = false;
      clearTimeout(maxSafetyTimer);
    };
  }, [isOpen, persona, language]);

  if (!isOpen) return null;

  const displayLanguage = language.toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-loading-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#2B231D]/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] border-3 border-amber-300 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(217,119,6,0.25)] text-center overflow-hidden flex flex-col items-center">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Animated mascot / voice icon badge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 border-3 border-amber-500 shadow-md flex items-center justify-center mb-5 animate-pulse">
          <Mic className="w-10 h-10 text-amber-950" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Volume2 className="w-4 h-4" />
          </div>
        </div>

        {/* Headline */}
        <h3 id="aac-loading-title" className="text-xl sm:text-2xl font-black text-[#2D241E] tracking-tight">
          {isFinished ? t('Voice Pack Ready!') : t('Loading Your Voice')}
        </h3>
        <p className="text-xs sm:text-sm text-[#7A6C60] font-semibold mt-1 max-w-xs">
          {isFinished
            ? t('All AAC tiles are cached for instant 0ms speech.')
            : t('Pre-caching every speech tile for instantaneous communication.')}
        </p>

        {/* Live Progress Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5 truncate max-w-[240px]">
              {isFinished ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              )}
              <span className="truncate">
                {isFinished ? t('Ready for communication!') : progress.currentPhrase}
              </span>
            </span>
            <span className="tabular-nums font-extrabold shrink-0 text-amber-700">
              {progress.percent}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 rounded-full transition-all duration-150 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(4, progress.percent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-bold px-0.5">
            <span>{t('Speech Tiles Cached')}</span>
            <span className="tabular-nums font-extrabold">
              {progress.loaded} / {progress.total}
            </span>
          </div>
        </div>

        {/* Selected Persona Badge */}
        <div className="mt-5 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2">
          <span>{t('Voice')}: <strong>{personaObj.name}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-800 text-[11px] font-black">{displayLanguage}</span>
        </div>

        {/* Manual Dismiss Button if needed */}
        <button
          type="button"
          onClick={() => {
            try { playChime('tap'); } catch {}
            onCompleteRef.current?.();
          }}
          className="mt-6 text-xs text-[#7A6C60] hover:text-[#2D241E] font-bold underline cursor-pointer flex items-center gap-1 transition"
        >
          <span>{t('Continue to app')}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
