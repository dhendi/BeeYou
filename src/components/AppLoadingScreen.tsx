import React, { useState, useEffect } from 'react';
import { preloadAllAppAssets, PreloadProgress } from '../utils/appAssetPreloader';

interface AppLoadingScreenProps {
  onLoaded: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState<PreloadProgress>({
    percent: 0,
    loaded: 0,
    total: 100,
    currentLabel: 'Waking up Barnaby and the cozy crew...',
  });

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: max 12 seconds in case of extreme network failure
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsFadingOut(true);
        setTimeout(onLoaded, 500);
      }
    }, 12000);

    preloadAllAppAssets((p) => {
      if (!isMounted) return;
      setProgress(p);

      if (p.percent >= 100) {
        clearTimeout(safetyTimer);
        // Brief pause at 100% so user sees completion, then fade out
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(onLoaded, 500);
          }
        }, 300);
      }
    }).catch(() => {
      if (isMounted) {
        setIsFadingOut(true);
        setTimeout(onLoaded, 500);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [onLoaded]);

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7EE] text-[#422006] transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, rgba(254, 243, 199, 0.45) 0%, transparent 60%)`,
      }}
    >
      {/* Center Card */}
      <div className="flex flex-col items-center px-6 py-8 max-w-sm w-full text-center">
        {/* Floating Mascot Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-100/80 border-2 border-amber-200/80 shadow-md flex items-center justify-center p-3 animate-bounce" style={{ animationDuration: '2.5s' }}>
            <img
              src="/assets/stickers/bee_mascot.png"
              alt="Barnaby the Bee"
              className="w-full h-full object-contain filter drop-shadow-sm"
              decoding="async"
            />
          </div>
          {/* Sparkle badge */}
          <span className="absolute -top-1 -right-1 text-xl animate-pulse">✨</span>
        </div>

        {/* Brand Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#451A03] mb-1">
          Bee<span className="text-amber-500">You</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#78350F]/80 mb-6">
          Sensory Visual Routines & Communication
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-amber-100/70 border border-amber-200/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-150 ease-out shadow-xs"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {/* Live percentage & status label */}
        <div className="flex items-center justify-between w-full px-1 mb-2 text-xs font-semibold text-[#78350F]">
          <span>{progress.percent}% Preloaded</span>
          <span className="text-[11px] text-[#92400E] font-normal">
            {progress.loaded} / {progress.total}
          </span>
        </div>

        <p className="text-xs text-[#92400E]/90 italic font-medium min-h-[1.5rem] transition-all duration-200">
          {progress.currentLabel}
        </p>
      </div>
    </div>
  );
};
