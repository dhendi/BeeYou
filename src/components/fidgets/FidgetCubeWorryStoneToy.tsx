import React, { useState } from 'react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const FidgetCubeWorryStoneToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [rubCount, setRubCount] = useState(0);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);

  const handleRub = () => {
    setRubCount((p) => p + 1);
    audioEngine.playSpinnerTick(soundEnabled);
    triggerHaptic(15, hapticEnabled);
  };

  const handleButtonClick = (idx: number, isSilent: boolean) => {
    setActiveBtn(idx);
    if (!isSilent) {
      audioEngine.playSwitch('blue', soundEnabled);
      triggerHaptic(30, hapticEnabled);
    } else {
      triggerHaptic(15, hapticEnabled);
    }
    setTimeout(() => setActiveBtn(null), 100);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full px-2">
        <p className="text-xs font-bold text-slate-500">{t('Tactile pad & soothing worry stone')}</p>
        <span className="text-xs font-bold text-indigo-600">{rubCount} {t('smooth strokes')}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {/* 5-Button Die Pad */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('5-Click Die')}</p>
          <div className="grid grid-cols-3 gap-2 w-full p-2 bg-slate-200/60 rounded-xl">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isSilent = idx >= 3; // 2 silent, 3 clicky
              const isPressed = activeBtn === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleButtonClick(idx, isSilent)}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold ${
                    isPressed
                      ? 'scale-90 bg-indigo-600 border-indigo-700 text-white'
                      : isSilent
                      ? 'bg-slate-300 border-slate-400 text-slate-600'
                      : 'bg-white border-slate-300 text-slate-800 shadow-sm'
                  }`}
                >
                  {/* Click button */}
                  <span className={`w-2 h-2 rounded-full ${isSilent ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500">{t('3 clicky, 2 silent')}</span>
        </div>

        {/* Smooth Worry Stone Groove */}
        <div
          onPointerDown={handleRub}
          onPointerMove={(e) => { if (e.buttons === 1) handleRub(); }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 text-white flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all select-none touch-none"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('Worry Stone')}</p>
          <div className="w-16 h-12 rounded-full bg-slate-800 border-2 border-slate-600 shadow-inner flex items-center justify-center">
            <div className="w-8 h-6 rounded-full bg-slate-700/60 shadow-inner" />
          </div>
          <span className="text-[10px] text-slate-300 mt-2">{t('Rub thumb gently')}</span>
        </div>
      </div>
    </div>
  );
};
