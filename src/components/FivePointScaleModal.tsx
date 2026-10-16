import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flame, 
  CheckCircle2, 
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Wind,
  Hand,
  Box,
  Star,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { TurtleBambooThermometerSticker } from './icons/JournalStickers';

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1: return Smile;
    case 2: return Smile;
    case 3: return Meh;
    case 4: return Frown;
    case 5: return Flame;
    default: return Smile;
  }
};

const getActionIcon = (label: string, idx: number) => {
  const l = label.toLowerCase();
  if (l.includes('breath') || l.includes('inhale')) return Wind;
  if (l.includes('wiggle') || l.includes('squeeze') || l.includes('finger')) return Hand;
  if (l.includes('box')) return Box;
  if (l.includes('toolkit') || l.includes('quiet') || l.includes('nice') || l.includes('going')) return Star;
  if (l.includes('emergency') || l.includes('button')) return ShieldAlert;
  if (l.includes('help')) return HelpCircle;
  return idx === 0 ? Star : CheckCircle2;
};

export const FivePointScaleModal: React.FC = () => {
  const {
    showFivePointModal,
    setShowFivePointModal,
    fivePointSettings,
    setShowCopingToolkit,
    activateEmergencyMode,
    speak,
    announce,
    activeTheme,
  } = useApp();

  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  if (!showFivePointModal) return null;

  const handleSelect = (level: number) => {
    setSelectedLevel(level);
    playChime('tap');
    const levelCfg = fivePointSettings.levels.find((l) => l.level === level);
    if (levelCfg) {
      announce(`You are at level ${level}. ${levelCfg.label}. ${levelCfg.bodyFeelings}`);
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
      announce(action.label);
    }
  };

  const selectedCfg = selectedLevel ? fivePointSettings.levels.find((l) => l.level === selectedLevel) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Incredible 5-Point Scale')}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowFivePointModal(false)}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {isTurtleTheme && (
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                <TurtleBambooThermometerSticker className="w-full h-full object-contain" />
              </div>
            )}
            {isDinoTheme && (
              <div className="w-9 h-9 rounded-xl bg-green-100 border border-green-400 flex items-center justify-center p-1 shadow-xs shrink-0 text-xl select-none">
                🦖
              </div>
            )}
            {isFrogTheme && (
              <div className="w-9 h-9 rounded-xl bg-lime-100 border border-lime-400 flex items-center justify-center p-1 shadow-xs shrink-0 text-xl select-none">
                🐸
              </div>
            )}
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                isFrogTheme ? 'text-lime-800' : isTurtleTheme ? 'text-emerald-800' : isDinoTheme ? 'text-green-800' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {isFrogTheme
                  ? t('Ribbit Pond Calming Scale')
                  : isTurtleTheme
                  ? t('Wise Turtle Regulation Scale')
                  : isDinoTheme
                    ? t('Dino Kingdom Energy & Volcano Scale')
                    : t('Incredible 5-Point Scale')}
              </p>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">{t('How do I feel right now?')}</h2>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('Close emotional scale modal')}
            onClick={() => setShowFivePointModal(false)}
            className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer active:scale-95 focus-visible:ring-4 ${
              isFrogTheme
                ? 'focus-visible:ring-lime-500/70'
                : isTurtleTheme
                ? 'focus-visible:ring-emerald-500/70'
                : isDinoTheme
                  ? 'focus-visible:ring-green-500/70'
                  : 'focus-visible:ring-amber-500/70'
            } focus-visible:outline-none`}
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-3">
        {/* Thermometer bar */}
        <div className="flex justify-between gap-1.5 mb-2" role="group" aria-label="5-Point scale level selector">
          {fivePointSettings.levels.map((l) => {
            const LevelIcon = getLevelIcon(l.level);
            return (
              <button
                key={l.level}
                type="button"
                aria-label={`Level ${l.level}: ${l.label}`}
                aria-pressed={selectedLevel === l.level}
                onClick={() => handleSelect(l.level)}
                className={`flex-1 min-w-[48px] min-h-[56px] py-1.5 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 font-black focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${l.color} ${
                  selectedLevel === l.level ? 'border-white shadow-lg scale-105 ring-4 ring-slate-400/40' : 'border-transparent opacity-90 hover:opacity-100'
                }`}
              >
                <LevelIcon className={`w-5 h-5 ${l.textColor}`} aria-hidden="true" />
                <span className={`text-[10px] font-black ${l.textColor} mt-0.5 tracking-tight text-center leading-tight line-clamp-1`}>
                  L{l.level} {l.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level cards (full) */}
        {fivePointSettings.levels.map((l) => {
          const LevelIcon = getLevelIcon(l.level);
          return (
            <button
              key={l.level}
              type="button"
              aria-label={`Level ${l.level}: ${l.label}. ${l.bodyFeelings}`}
              aria-pressed={selectedLevel === l.level}
              onClick={() => handleSelect(l.level)}
              className={`w-full min-h-[48px] text-left rounded-3xl p-4 border-2 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${
                selectedLevel === l.level
                  ? `${l.color} border-transparent shadow-md`
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-900/60 flex items-center justify-center shadow-xs shrink-0" aria-hidden="true">
                  <LevelIcon className={`w-7 h-7 ${selectedLevel === l.level ? l.textColor : 'text-slate-700 dark:text-slate-200'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${l.color} ${l.textColor}`}>
                      Level {l.level}: {l.label}
                    </span>
                    <span className="font-black text-sm text-slate-800 dark:text-white">{l.label}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-snug">{l.bodyFeelings}</p>
                </div>
                {selectedLevel === l.level && <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" aria-hidden="true" />}
              </div>
            </button>
          );
        })}

        {/* Coping actions for selected level */}
        {selectedCfg && (
          <div className="rounded-3xl bg-slate-900 p-5 space-y-3 animate-in fade-in" role="region" aria-label={`Coping strategies for Level ${selectedCfg.level}`}>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Helpful right now at Level {selectedCfg.level} ({selectedCfg.label}):
            </p>
            {selectedCfg.actions.map((action, idx) => {
              const ActionIcon = getActionIcon(action.label, idx);
              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Strategy: ${action.label}`}
                  onClick={() => handleAction(action, selectedCfg.level)}
                  className="w-full min-h-[48px] text-left flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer active:scale-98 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-700/80 flex items-center justify-center shrink-0">
                    <ActionIcon className="w-5 h-5 text-amber-300" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-white text-sm flex-1">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
