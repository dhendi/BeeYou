import React, { useState, useEffect, useRef } from 'react';
import { preloadAllAppAssets, getTier1Assets, isWarmCacheVisit, isAppOpenedInSession, markAppOpenedInSession, PreloadProgress } from '../utils/appAssetPreloader';

interface AppLoadingScreenProps {
  onLoaded: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onLoaded }) => {
  const [warmCache] = useState(() => isWarmCacheVisit());
  const [progress, setProgress] = useState<PreloadProgress>(() => ({
    percent: 0,
    loaded: 0,
    total: getTier1Assets().length,
  }));

  const [isFadingOut, setIsFadingOut] = useState(false);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // If already opened in this browser session, finish immediately without showing loading screen
    if (isAppOpenedInSession()) {
      hasFinishedRef.current = true;
      onLoadedRef.current();
      return;
    }

    let isMounted = true;

    preloadAllAppAssets((p) => {
      if (!isMounted || hasFinishedRef.current) return;
      setProgress(p);

      // Gate: ONLY finish when 100% of all Tier 1 startup assets are preloaded
      if (p.percent >= 100 && p.loaded >= p.total) {
        hasFinishedRef.current = true;
        markAppOpenedInSession();
        const holdMs = warmCache ? 40 : 120;
        const fadeMs = warmCache ? 150 : 250;
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(() => {
              if (isMounted) {
                onLoadedRef.current();
              }
            }, fadeMs);
          }
        }, holdMs);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [warmCache]);

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7EE] text-[#422006] transition-opacity ${
        warmCache ? 'duration-200' : 'duration-400'
      } select-none ${
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
