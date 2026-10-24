import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Grid, Heart, Star, Layers, CircleDot, Zap, Waves, RotateCcw } from 'lucide-react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export type PopShape = 'grid' | 'heart' | 'star' | 'honeycomb' | 'turtle_shell' | 'dino_footprint' | 'lily_pad';

export const SHAPE_PATTERNS: Record<PopShape, number[][]> = {
  grid: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  heart: [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  star: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
  ],
  honeycomb: [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  turtle_shell: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0],
  ],
  dino_footprint: [
    [0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  lily_pad: [
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
  ],
};

export const ROW_COLORS = [
  'from-rose-400 to-rose-500 border-rose-300 text-rose-950',
  'from-amber-400 to-amber-500 border-amber-300 text-amber-950',
  'from-yellow-400 to-yellow-500 border-yellow-300 text-yellow-950',
  'from-emerald-400 to-emerald-500 border-emerald-300 text-emerald-950',
  'from-sky-400 to-sky-500 border-sky-300 text-sky-950',
  'from-purple-400 to-purple-500 border-purple-300 text-purple-950',
  'from-pink-400 to-pink-500 border-pink-300 text-pink-950',
];

export const PopItToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const { activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';
  const [shape, setShape] = useState<PopShape>(
    isFrogTheme ? 'lily_pad' : isDinoTheme ? 'dino_footprint' : isTurtleTheme ? 'turtle_shell' : 'grid'
  );
  const [popped, setPopped] = useState<Set<string>>(new Set());

  const pattern = SHAPE_PATTERNS[shape];
  let totalBubbles = 0;
  pattern.forEach((row) => row.forEach((cell) => { if (cell === 1) totalBubbles++; }));

  const handlePop = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const isPopped = popped.has(key);
    const poppingIn = !isPopped;
    
    // Toggle pop state (can pop back and forth like real silicone pop-it!)
    setPopped((prev) => {
      const next = new Set(prev);
      if (isPopped) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    const pitch = 0.92 + ((r + c) * 0.03) + (Math.random() * 0.04 - 0.02);
    audioEngine.playPopIt(poppingIn, pitch, soundEnabled);
    triggerHaptic(poppingIn ? 24 : 16, hapticEnabled);
  };

  const handleFlipReset = () => {
    setPopped(new Set());
    audioEngine.playPopIt(false, 0.8, soundEnabled);
    triggerHaptic(35, hapticEnabled);
  };

  const handlePopAll = () => {
    const all = new Set<string>();
    const unpopped: { r: number; c: number }[] = [];
    pattern.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) {
          all.add(`${r}-${c}`);
          if (!popped.has(`${r}-${c}`)) unpopped.push({ r, c });
        }
      });
    });
    setPopped(all);
    unpopped.forEach((item, idx) => {
      setTimeout(() => {
        audioEngine.playPopIt(true, 0.9 + ((item.r + item.c) * 0.03), soundEnabled);
        triggerHaptic(14, hapticEnabled);
      }, idx * 28);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Shape Selector & Stats */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'grid' as const, label: 'Grid', icon: Grid },
            { id: 'heart' as const, label: 'Heart', icon: Heart },
            { id: 'star' as const, label: 'Star', icon: Star },
            { id: 'honeycomb' as const, label: 'Hex', icon: Layers },
            { id: 'turtle_shell' as const, label: 'Shell', icon: CircleDot },
            { id: 'dino_footprint' as const, label: 'Dino', icon: Zap },
            { id: 'lily_pad' as const, label: 'Pond', icon: Waves },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setShape(s.id); setPopped(new Set()); triggerHaptic(15, hapticEnabled); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  shape === s.id
                    ? isFrogTheme
                      ? 'bg-lime-600 text-white shadow-sm'
                      : isDinoTheme
                      ? 'bg-green-600 text-white shadow-sm'
                      : isTurtleTheme
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(s.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Pops')}</p>
          <p className={`text-sm font-black ${
            isFrogTheme ? 'text-lime-700' : isDinoTheme ? 'text-green-700' : isTurtleTheme ? 'text-emerald-700' : 'text-indigo-600'
          }`}>
            {popped.size} / {totalBubbles}
          </p>
        </div>
      </div>

      {/* Pop-It Silicone Tray */}
      <div className="p-4 rounded-3xl bg-slate-200/80 border-4 border-slate-300/80 shadow-inner flex flex-col items-center justify-center gap-2 max-w-full overflow-hidden">
        {pattern.map((row, r) => (
          <div key={r} className="flex gap-2">
            {row.map((cell, c) => {
              if (cell === 0) {
                return <div key={c} className="w-10 h-10 sm:w-11 sm:h-11" />;
              }
              const key = `${r}-${c}`;
              const isPopped = popped.has(key);
              const colorClass = ROW_COLORS[r % ROW_COLORS.length];

              return (
                <button
                  key={c}
                  onClick={() => handlePop(r, c)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                    isPopped
                      ? 'bg-slate-300/90 border-slate-400 shadow-inner scale-90 opacity-70'
                      : `bg-gradient-to-b ${colorClass} shadow-md hover:scale-105 active:scale-95 active:shadow-none`
                  }`}
                  style={{
                    boxShadow: isPopped 
                      ? 'inset 0 3px 5px rgba(0,0,0,0.25)' 
                      : '0 4px 6px rgba(0,0,0,0.15), inset 0 2px 2px rgba(255,255,255,0.6)'
                  }}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-all ${
                    isPopped ? 'bg-slate-400/60 scale-75' : 'bg-white/40'
                  }`} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleFlipReset}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Flip & Reset')}</span>
        </button>
        <button
          onClick={handlePopAll}
          className={`flex-1 py-2 px-3 rounded-xl ${
            isFrogTheme
              ? 'bg-lime-50 hover:bg-lime-100 text-lime-700'
              : isDinoTheme
              ? 'bg-green-50 hover:bg-green-100 text-green-700'
              : isTurtleTheme
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
          } text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>{t('Pop All')}</span>
        </button>
      </div>
    </div>
  );
};
