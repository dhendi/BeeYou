import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  Timer, 
  Volume2, 
  ArrowLeft, 
  RotateCcw,
  Play,
  Pause,
  Layers
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';
import { RoutineStickerIcon, GoldStarSticker } from './icons/JournalStickers';

const getSkillSticker = (id: string, emoji?: string): string | undefined => {
  if (id === 'skill-teeth' || emoji === '🪥') return '/assets/stickers/toothbrush.png';
  if (id === 'skill-hands' || emoji === '🧼') return '/assets/stickers/soap_wash_hands.png';
  if (id === 'skill-dressed' || emoji === '👕') return '/assets/stickers/clothes_dressed.png';
  if (id === 'skill-backpack' || emoji === '🎒') return '/assets/stickers/backpack_school.png';
  if (id === 'skill-snack' || emoji === '🍏' || emoji === '🍎') return '/assets/stickers/apple_snack.png';
  return undefined;
};

export const SkillsView: React.FC = () => {
  const {
    skills,
    activeSkillId,
    setActiveSkillId,
    toggleSkillStep,
    completeSkill,
    resetSkill,
    speak,
    announce,
    settings,
    activeTheme,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);
  const isColorCoded = settings?.colorCodedActionCards === true;
  const selectedSkill = skills.find((s) => s.id === activeSkillId);

  // Active step countdown timer
  const [activeTimerStepId, setActiveTimerStepId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime('complete');
      if (selectedSkill && activeTimerStepId !== null) {
        toggleSkillStep(selectedSkill.id, activeTimerStepId);
        announce('Timer complete! Good job!');
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft, activeTimerStepId, selectedSkill]);

  const startStepTimer = (stepId: number, durationSec: number) => {
    setActiveTimerStepId(stepId);
    setSecondsLeft(durationSec);
    setIsTimerRunning(true);
    playChime('tap');
  };

  // IF A SKILL IS OPEN
  if (selectedSkill) {
    const completedCount = selectedSkill.steps.filter((s) => s.completed).length;
    const totalCount = selectedSkill.steps.length;
    const isAllDone = totalCount > 0 && completedCount === totalCount;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-3xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
        {/* Back and Status */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveSkillId(null);
              setIsTimerRunning(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('All Skills')}</span>
          </button>

          <button
            onClick={() => resetSkill(selectedSkill.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Start Over')}</span>
          </button>
        </div>

        {/* Skill Hero Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center p-2 shrink-0 shadow-xs ${isColorCoded ? 'bg-purple-50 border-2 border-purple-200' : `${activeTheme?.palette?.primaryLight || 'bg-amber-50/70'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-200'}`}`}>
            {(selectedSkill.stickerSrc || getSkillSticker(selectedSkill.id, selectedSkill.emoji)) ? (
              <img
                src={selectedSkill.stickerSrc || getSkillSticker(selectedSkill.id, selectedSkill.emoji)}
                alt=""
                className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
              />
            ) : (
              <span className="text-5xl">{selectedSkill.emoji}</span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isColorCoded ? 'text-purple-700 bg-purple-100' : `${activeTheme?.palette?.textAccent || 'text-amber-900'} ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-300/80'}`}`}>
                {t('Mission')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {t(selectedSkill.title)}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {completedCount} {t('of')} {totalCount} {t('steps finished')}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 mt-3">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isColorCoded ? 'bg-purple-500' : (activeTheme?.palette?.primaryBg || 'bg-amber-500')}`}
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* All Steps Completed Celebration Box */}
        {isAllDone && (
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-3 border-amber-300 rounded-3xl p-5 text-center shadow-md animate-in fade-in zoom-in-95">
            <span className="text-5xl">🏆</span>
            <h3 className="text-xl font-black text-amber-950 mt-2">{t('Mission Accomplished!')}</h3>
            <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
              {t('You completed')} "{t(selectedSkill.title)}" {t('independently!')}
            </p>
          </div>
        )}

        {/* Step-by-Step Mission Checklist */}
        <div className="space-y-3">
          {selectedSkill.steps.map((step, idx) => {
            const hasTimer = !!step.durationSec;
            const isStepTimerActive = isTimerRunning && activeTimerStepId === step.id;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-3xl border-2 transition-all shadow-xs ${
                  step.completed
                    ? (isColorCoded ? 'bg-purple-50/70 border-purple-300' : 'bg-amber-50/70 border-amber-300')
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    aria-label={`Skill step ${idx + 1}: ${t(step.title)}. ${step.completed ? 'Completed' : 'Not completed'}`}
                    aria-pressed={step.completed}
                    onClick={() => toggleSkillStep(selectedSkill.id, step.id)}
                    className="flex items-start sm:items-center gap-3 flex-1 cursor-pointer select-none text-left focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none min-h-[48px]"
                  >
                    <span className={`${isColorCoded ? 'text-purple-600' : 'text-amber-600'} transition-transform hover:scale-110 mt-0.5 sm:mt-0 shrink-0 pointer-events-none`} aria-hidden="true">
                      {step.completed ? (
                        <CheckCircle2 className={`w-7 h-7 ${isColorCoded ? 'fill-purple-500' : 'fill-amber-500'} text-white`} />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-300" />
                      )}
                    </span>

                    <RoutineStickerIcon emoji={step.emoji} title={step.title} className="w-8 h-8 shrink-0" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <h4
                          className={`font-black text-sm sm:text-base ${
                            step.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {t(step.title)}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                        {t(step.instruction)}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Speak Button */}
                    <button
                      onClick={() => speak(`${t(step.title)}. ${t(step.instruction)}`)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      title="Hear instruction"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Step Timer Button if available */}
                    {hasTimer && (
                      <button
                        onClick={() => {
                          if (isStepTimerActive) {
                            setIsTimerRunning(false);
                          } else {
                            startStepTimer(step.id, step.durationSec || 20);
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                          isStepTimerActive
                            ? `${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white animate-pulse`
                            : (isColorCoded ? 'bg-purple-100 hover:bg-purple-200 text-purple-900' : `${activeTheme?.palette?.badgeBg || 'bg-amber-100'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-900'}`)
                        }`}
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>
                          {isStepTimerActive
                            ? `${secondsLeft}s`
                            : `${step.durationSec}s`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MAIN SKILLS LIST
  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* Header Banner */}
      <div className={`${activeTheme?.palette?.primaryBg ? `${activeTheme.palette.primaryBg} text-white` : 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-white'} rounded-3xl p-5 sm:p-6 shadow-md flex items-center justify-between`}>
        <div>
          <span className="text-xs font-black uppercase tracking-wider opacity-90">
            {t('Independence & Life Skills')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">{t('My Daily Skills')}</h2>
          <p className="text-xs sm:text-sm opacity-90 font-medium mt-1 max-w-md">
            {t('Master everyday activities step-by-step at your own pace!')}
          </p>
        </div>
        <GoldStarSticker className="w-14 h-14 hidden sm:inline-block drop-shadow-md" />
      </div>

      {/* Step-by-Step Missions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {skills.map((skill) => {
            const completedCount = skill.steps.filter((s) => s.completed).length;
            const totalCount = skill.steps.length;
            const isDone = totalCount > 0 && completedCount === totalCount;

            const cardClass = isColorCoded
              ? 'bg-white hover:bg-purple-50/40 border-2 border-slate-200 hover:border-purple-300'
              : `${themeStyles.card} !p-4 sm:!p-5 !rounded-3xl`;
            const iconBoxClass = isColorCoded
              ? 'bg-purple-50 border border-purple-200'
              : `bg-white/90 border ${activeTheme?.palette?.primaryBorder || 'border-amber-200/90'}`;
            const badgeClass = isColorCoded
              ? 'text-purple-700 bg-purple-50'
              : themeStyles.adventureTag;
            const subtextClass = isColorCoded ? 'text-purple-600' : (activeTheme?.palette?.textAccent || 'text-amber-800');

            return (
              <button
                type="button"
                key={skill.id}
                aria-label={`Skill: ${t(skill.title)}. ${totalCount} steps. ${isDone ? 'Completed' : `${completedCount} of ${totalCount} steps done`}`}
                onClick={() => {
                  setActiveSkillId(skill.id);
                  playChime('tap');
                }}
                className={`w-full text-left rounded-3xl p-4 sm:p-5 transition-all active:scale-98 cursor-pointer flex items-start gap-3.5 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${cardClass}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs ${iconBoxClass}`} aria-hidden="true">
                  {(skill.stickerSrc || getSkillSticker(skill.id, skill.emoji)) ? (
                    <img
                      src={skill.stickerSrc || getSkillSticker(skill.id, skill.emoji)}
                      alt=""
                      className="w-full h-full object-contain pointer-events-none drop-shadow-2xs"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-4xl">{skill.emoji}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${badgeClass}`}>
                      {t(skill.category)}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 leading-snug">
                    {t(skill.title)}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {totalCount} {t('steps')} • ~{skill.estimatedMin} {t('mins')}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span className={isDone ? 'text-emerald-600 font-black' : 'text-slate-400'}>
                      {isDone ? t('Completed! 🏆') : `${completedCount}/${totalCount} ${t('steps done')}`}
                    </span>
                    {skill.completedTimes > 0 && (
                      <span className={subtextClass}>{t('Finished')} {skill.completedTimes}x</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
    </div>
  );
};
