import React, { useState, useEffect } from 'react';
import { preloadAllAppAssets, PreloadProgress } from '../utils/appAssetPreloader';

interface AppLoadingScreenProps {
  onLoaded: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState<PreloadProgress>({
    percent: 0,
    loaded: 0,
    total: 2624,
  });

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadAllAppAssets((p) => {
      if (!isMounted) return;
      setProgress(p);

      // Gate: ONLY finish when 100% of all assets are preloaded
      if (p.percent >= 100 && p.loaded >= p.total) {
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(onLoaded, 500);
          }
        }, 300);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [onLoaded]);

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7EE] text-[#422006] transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center px-6 py-8 max-w-xs sm:max-w-sm w-full text-center">
        {/* Official BeeYou Brand Logo */}
        <div className="mb-6">
          <img
            src="/logo.png"
            alt="BeeYou"
            draggable={false}
            className="h-16 sm:h-20 w-auto object-contain select-none"
          />
        </div>

        {/* Honey Progress Bar Container */}
        <div className="w-full bg-amber-100/70 border border-amber-200/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-150 ease-out shadow-xs"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {/* Live percentage & item count */}
        <div className="flex items-center justify-between w-full px-1 text-xs font-semibold text-[#78350F]">
          <span>{progress.percent}% Preloaded</span>
          <span className="text-[11px] text-[#92400E] font-mono">
            {progress.loaded} / {progress.total}
          </span>
        </div>
      </div>
    </div>
  );
};
