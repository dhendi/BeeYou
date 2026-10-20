import React, { useState, useEffect } from 'react';
import { Volume2, Loader2, CheckCircle2, ArrowRight, Mic } from 'lucide-react';
import { prewarmCoreAudioVocabulary } from '../../utils/audio/speech';
import { playChime } from '../../utils/audio/chimes';
import { getVoicePersonaById } from '../../data/voicePersonasData';

interface AacVoiceLoadingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
  persona?: string;
  language?: string;
}

export const AacVoiceLoadingScreen: React.FC<AacVoiceLoadingScreenProps> = ({
  isOpen,
  onComplete,
  persona = 'puck',
  language = 'en',
}) => {
  const [progress, setProgress] = useState(10);
  const [currentStepText, setCurrentStepText] = useState('Connecting to assistive speech engine...');
  const personaObj = getVoicePersonaById(persona);

  useEffect(() => {
    if (!isOpen) {
      setProgress(10);
      return;
    }

    // Trigger genuine background pre-caching of all core AAC vocabulary
    prewarmCoreAudioVocabulary(persona, language);

    // Smooth progress simulation that guarantees completion
    const stepInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(stepInterval);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 14) + 8;
        if (next >= 100) {
          clearInterval(stepInterval);
          return 100;
        }

        if (next > 70) {
          setCurrentStepText('Calibrating calm, even-toned assistive speech...');
        } else if (next > 35) {
          setCurrentStepText('Pre-caching instant speech tiles (Water, Food, Help, Yes)...');
        } else {
          setCurrentStepText('Connecting to assistive speech engine...');
        }
        return next;
      });
    }, 280);

    return () => clearInterval(stepInterval);
  }, [isOpen, persona, language]);

  // When progress reaches 100%, complete with a pleasant sound
  useEffect(() => {
    if (progress >= 100 && isOpen) {
      setCurrentStepText('Ready for instant communication!');
      try {
        playChime('complete');
      } catch {}
      const timer = setTimeout(() => {
        onComplete();
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [progress, isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-loading-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#2B231D]/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] border-3 border-amber-300 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(217,119,6,0.25)] text-center overflow-hidden flex flex-col items-center">
        {/* Subtle background glow */}
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
          Loading All AAC Voices
        </h3>
        <p className="text-xs sm:text-sm text-[#7A6C60] font-semibold mt-1 max-w-xs">
          Preparing instant zero-delay speech for every communication tile on your board.
        </p>

        {/* Live Progress Bar */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              <span className="truncate">{currentStepText}</span>
            </span>
            <span className="tabular-nums font-extrabold shrink-0 text-amber-700">{progress}%</span>
          </div>

          <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Selected Persona Badge */}
        <div className="mt-5 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2">
          <span>Voice: <strong>{personaObj.name}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-800 text-[11px]">Calm AAC Mode</span>
        </div>

        {/* Manual Skip Button */}
        <button
          type="button"
          onClick={() => {
            try { playChime('tap'); } catch {}
            onComplete();
          }}
          className="mt-6 text-xs text-[#7A6C60] hover:text-[#2D241E] font-bold underline cursor-pointer flex items-center gap-1 transition"
        >
          <span>Skip to app now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
