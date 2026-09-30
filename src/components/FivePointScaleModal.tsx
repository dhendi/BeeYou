import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { playChime } from '../utils/audio';

export const FivePointScaleModal: React.FC = () => {
  const {
    showFivePointModal,
    setShowFivePointModal,
    fivePointSettings,
    setShowCopingToolkit,
    activateEmergencyMode,
    speak,
  } = useApp();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  if (!showFivePointModal) return null;

  const handleSelect = (level: number) => {
    setSelectedLevel(level);
    playChime('tap');
    const levelCfg = fivePointSettings.levels.find((l) => l.level === level);
    if (levelCfg) {
      speak(`You are at level ${level}. ${levelCfg.label}. ${levelCfg.bodyFeelings}`);
    }
  };

  const handleAction = (action: { label: string; emoji: string }, level: number) => {
    playChime('breathe');
    if (action.label.includes('Coping Toolkit')) {
      setShowFivePointModal(false);
      setShowCopingToolkit(true);
    } else if (action.label.includes('Emergency')) {
      setShowFivePointModal(false);
      activateEmergencyMode();
    } else {
      speak(action.label);
    }
  };

  const selectedCfg = selectedLevel ? fivePointSettings.levels.find((l) => l.level === selectedLevel) : null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incredible 5-Point Scale</p>
          <h2 className="text-xl font-black text-slate-800">How do I feel right now?</h2>
        </div>
        <button
          onClick={() => setShowFivePointModal(false)}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-3">
        {/* Thermometer bar */}
        <div className="flex justify-between gap-1.5 mb-2">
          {fivePointSettings.levels.map((l) => (
            <button
              key={l.level}
              onClick={() => handleSelect(l.level)}
              className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-3 font-black text-lg ${l.color} ${
                selectedLevel === l.level ? 'border-white shadow-lg scale-105 ring-4 ring-slate-400/40' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              <span>{l.emoji}</span>
              <span className={`text-[10px] font-black ${l.textColor}`}>{l.level}</span>
            </button>
          ))}
        </div>

        {/* Level cards (full) */}
        {fivePointSettings.levels.map((l) => (
          <button
            key={l.level}
            onClick={() => handleSelect(l.level)}
            className={`w-full text-left rounded-3xl p-4 border-2 transition-all cursor-pointer ${
              selectedLevel === l.level
                ? `${l.color} border-transparent shadow-md`
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{l.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${l.color} ${l.textColor}`}>
                    Level {l.level}
                  </span>
                  <span className="font-black text-sm text-slate-800">{l.label}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">{l.bodyFeelings}</p>
              </div>
              {selectedLevel === l.level && <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />}
            </div>
          </button>
        ))}

        {/* Coping actions for selected level */}
        {selectedCfg && (
          <div className="rounded-3xl bg-slate-900 p-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Helpful right now at Level {selectedCfg.level}:
            </p>
            {selectedCfg.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleAction(action, selectedCfg.level)}
                className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer active:scale-98"
              >
                <span className="text-2xl">{action.emoji}</span>
                <span className="font-bold text-white text-sm flex-1">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
