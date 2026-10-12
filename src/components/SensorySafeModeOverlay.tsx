import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Volume2, Lock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { AccessibleTile } from './common/AccessibleTile';

export const SensorySafeModeOverlay: React.FC = () => {
  const { isSafeModeActive, deactivateSafeMode, speak } = useApp();
  const [activeSpokenId, setActiveSpokenId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState<boolean>(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);

  const HOLD_DURATION_MS = 3000;

  const SURVIVAL_TILES = [
    {
      id: 'break',
      text: 'I need a break',
      speech: 'I need a break',
      emoji: '🛑',
      colorBg: 'bg-[#991B1B]', // high contrast crimson red
      colorBorder: 'border-[#F87171]',
      textColor: 'text-white',
    },
    {
      id: 'loud',
      text: 'Too loud',
      speech: 'Too loud',
      emoji: '🔊',
      colorBg: 'bg-[#1E3A8A]', // high contrast deep navy blue
      colorBorder: 'border-[#60A5FA]',
      textColor: 'text-white',
    },
    {
      id: 'help',
      text: 'I need help',
      speech: 'I need help',
      emoji: '🆘',
      colorBg: 'bg-[#701A75]', // high contrast deep fuchsia/purple
      colorBorder: 'border-[#E879F9]',
      textColor: 'text-white',
    },
    {
      id: 'home',
      text: 'Take me home',
      speech: 'Take me home',
      emoji: '🏠',
      colorBg: 'bg-[#064E3B]', // high contrast deep forest emerald
      colorBorder: 'border-[#34D399]',
      textColor: 'text-white',
    },
  ];

  const handleTileTouch = (tile: typeof SURVIVAL_TILES[0]) => {
    setActiveSpokenId(tile.id);
    playChime('tap');
    // Immediate native on-device speech audio upon touch
    speak(tile.speech, { force: true });
    setTimeout(() => {
      setActiveSpokenId(null);
    }, 2000);
  };

  const startUnlockHold = () => {
    setIsHoldingUnlock(true);
    setHoldProgress(0);
    holdStartRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(progress);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsHoldingUnlock(false);
      setHoldProgress(0);
      deactivateSafeMode();
    }, HOLD_DURATION_MS);
  };

  const cancelUnlockHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHoldingUnlock(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!isSafeModeActive) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Sensory Safe Mode Activated"
      className="fixed inset-0 z-[100000] bg-black text-white flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden touch-none"
    >
      {/* Discreet Header with Status Banner */}
      <div className="flex items-center justify-between w-full shrink-0 pt-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping shrink-0" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-500">
            Sensory Safe Mode • Overload Shield Active
          </span>
        </div>

        {/* Discreet 3s Caregiver Unlock Button */}
        <button
          type="button"
          onMouseDown={startUnlockHold}
          onMouseUp={cancelUnlockHold}
          onMouseLeave={cancelUnlockHold}
          onTouchStart={startUnlockHold}
          onTouchEnd={cancelUnlockHold}
          onTouchCancel={cancelUnlockHold}
          className="relative px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all overflow-hidden"
          title="Caregiver: Hold for 3 seconds to exit safe mode"
        >
          {isHoldingUnlock && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-emerald-600/40 transition-all duration-75 pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />
          )}
          <Lock className="w-3.5 h-3.5 text-neutral-400 relative z-10" />
          <span className="relative z-10 text-[11px] sm:text-xs">
            {isHoldingUnlock ? `Holding... (${Math.max(0, Math.ceil((HOLD_DURATION_MS - (holdProgress / 100) * HOLD_DURATION_MS) / 1000))}s)` : 'Hold 3s to Exit'}
          </span>
        </button>
      </div>

      {/* Center Grid: 4 Oversized High-Contrast Tactile Survival Tiles */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 py-4 w-full max-w-5xl mx-auto h-full">
        {SURVIVAL_TILES.map((tile) => {
          const isSpoken = activeSpokenId === tile.id;
          return (
            <AccessibleTile
              key={tile.id}
              variant="emergency"
              label={tile.text}
              onClick={() => handleTileTouch(tile)}
              className={`w-full h-full rounded-3xl ${tile.colorBg} border-4 ${tile.colorBorder} ${tile.textColor} flex flex-col items-center justify-center p-4 sm:p-6 gap-2 sm:gap-4 transition-transform active:scale-95 cursor-pointer relative overflow-hidden shadow-2xl focus-visible:ring-4 focus-visible:ring-white`}
              style={{ minHeight: '35vh' }}
            >
              {isSpoken && (
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              )}
              <span aria-hidden="true" className="text-6xl sm:text-7xl md:text-8xl select-none filter drop-shadow-md">
                {tile.emoji}
              </span>
              <span className="text-xl sm:text-2xl md:text-4xl font-black text-center tracking-tight leading-snug drop-shadow-sm px-2">
                {tile.text}
              </span>
              {isSpoken && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold border border-white/30 animate-in fade-in">
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Spoken</span>
                </span>
              )}
            </AccessibleTile>
          );
        })}
      </div>

      {/* Footer reassurance */}
      <div className="text-center pt-2 pb-1 shrink-0 text-neutral-500 text-xs font-semibold">
        Tap any tile to speak instantly. Silent notice dispatched to caregiver. Take slow, gentle breaths.
      </div>
    </div>
  );
};
