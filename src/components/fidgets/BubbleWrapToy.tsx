import React, { useState } from 'react';
import { RotateCcw, Star } from 'lucide-react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export type BubbleWrapSize = 'regular' | 'jumbo';

export const BUBBLE_WRAP_CONFIG = {
  regular: { rows: 6, cols: 6, bubbleClass: 'w-10 h-10 sm:w-11 sm:h-11', pitchBase: 1.0 },
  jumbo: { rows: 4, cols: 4, bubbleClass: 'w-14 h-14 sm:w-16 sm:h-16', pitchBase: 0.78 },
};

export const BubbleWrapToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [sizeMode, setSizeMode] = useState<BubbleWrapSize>('regular');
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [totalSessionPops, setTotalSessionPops] = useState<number>(0);

  const cfg = BUBBLE_WRAP_CONFIG[sizeMode];
  const totalInSheet = cfg.rows * cfg.cols;

  const handlePop = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (popped.has(key)) {
      // Re-pop / crinkle sound if already popped
      audioEngine.playBubbleWrap(1.3, soundEnabled);
      triggerHaptic(15, hapticEnabled);
      return;
    }

    setPopped((prev) => new Set(prev).add(key));
    setTotalSessionPops((prev) => prev + 1);

    const pitchVar = cfg.pitchBase + ((r * cfg.cols + c) % 5) * 0.04 + (Math.random() * 0.08 - 0.04);
    audioEngine.playBubbleWrap(pitchVar, soundEnabled);
    triggerHaptic(sizeMode === 'jumbo' ? 38 : 24, hapticEnabled);
  };

  const handleFreshSheet = () => {
    setPopped(new Set());
    audioEngine.playPlasticUnroll(soundEnabled);
    triggerHaptic(30, hapticEnabled);
  };

  const handlePopAll = () => {
    const all = new Set<string>();
    const unpopped: { r: number; c: number }[] = [];
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const k = `${r}-${c}`;
        all.add(k);
        if (!popped.has(k)) unpopped.push({ r, c });
      }
    }
    setPopped(all);
    setTotalSessionPops((prev) => prev + unpopped.length);

    // Cascading rapid firecracker pops
    unpopped.forEach((item, idx) => {
      setTimeout(() => {
        const pitch = cfg.pitchBase + (Math.random() * 0.3 - 0.15);
        audioEngine.playBubbleWrap(pitch, soundEnabled);
        triggerHaptic(15, hapticEnabled);
      }, idx * 28);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Size Selector & Stats */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setSizeMode('regular'); setPopped(new Set()); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sizeMode === 'regular'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('Classic')}
          </button>
          <button
            type="button"
            onClick={() => { setSizeMode('jumbo'); setPopped(new Set()); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sizeMode === 'jumbo'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('Jumbo')}
          </button>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Popped')}</p>
          <p className="text-sm font-black text-sky-600 dark:text-sky-400">
            {popped.size} / {totalInSheet}
            <span className="text-[11px] font-semibold text-slate-400 ml-1.5">({totalSessionPops} {t('total')})</span>
          </p>
        </div>
      </div>

      {/* Bubble Wrap Translucent Packaging Sheet */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-sky-50/80 dark:bg-sky-950/40 border-2 border-sky-200/90 dark:border-sky-800/80 shadow-inner flex flex-col items-center justify-center gap-2 max-w-full overflow-hidden backdrop-blur-xs select-none">
        {Array.from({ length: cfg.rows }, (_, r) => (
          <div key={r} className="flex gap-2">
            {Array.from({ length: cfg.cols }, (_, c) => {
              const key = `${r}-${c}`;
              const isPopped = popped.has(key);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handlePop(r, c)}
                  aria-label={`Bubble ${r + 1}, ${c + 1} ${isPopped ? 'Popped' : 'Unpopped'}`}
                  className={`${cfg.bubbleClass} rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center relative active:scale-90 ${
                    isPopped
                      ? 'bg-sky-900/10 dark:bg-slate-800/60 border border-dashed border-sky-300/60 shadow-inner scale-90 opacity-60'
                      : 'bg-gradient-to-br from-white/95 via-sky-100/80 to-sky-200/60 border border-white/90 ring-2 ring-sky-300/60 shadow-[0_4px_8px_rgba(56,189,248,0.25),inset_0_2px_3px_rgba(255,255,255,0.9)] hover:scale-105'
                  }`}
                >
                  {isPopped ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400/30 border border-sky-400/50" />
                  ) : (
                    <>
                      {/* Top-left specular highlight gleam */}
                      <div className="absolute top-1 left-1.5 w-3 h-1.5 rounded-full bg-white/95 rotate-[-30deg] pointer-events-none" />
                      {/* Inner air ring */}
                      <div className="w-4 h-4 rounded-full border border-sky-300/40 pointer-events-none" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={handleFreshSheet}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Fresh Sheet')}</span>
        </button>
        <button
          type="button"
          onClick={handlePopAll}
          className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Star className="w-3.5 h-3.5" />
          <span>{t('Pop All')}</span>
        </button>
      </div>
    </div>
  );
};
