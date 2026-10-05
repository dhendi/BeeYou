import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Info, 
  Timer, 
  Mic, 
  Wand2, 
  Play,
  Sun,
  Moon,
  ListFilter,
  Eye,
  Layers,
  Sparkle
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { VisualTaskTimer } from './VisualTaskTimer';
import { getStickerForRoutine } from '../data/rewardsData';
import { VisualScheduleStep } from '../types';
import { ContextualHelpButton } from './ContextualHelpButton';

export const MyDayView: React.FC = () => {
  const {
    routines,
    toggleRoutineStep,
    resetRoutine,
    toggleFirstThen,
    plansChanged,
    setShowPlansChangedModal,
    speak,
    announce,
    setChildView,
    earnedStickers,
  } = useApp();

  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines[0]?.id || 'routine-morning'
  );

  // View Mode: 'focus_mode' (One Step at a Time) vs 'list_mode' (Full Schedule)
  const [scheduleViewMode, setScheduleViewMode] = useState<'focus_mode' | 'list_mode'>('focus_mode');
  
  // Category Filter: 'all' | 'morning' | 'evening' | 'other'
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'morning' | 'evening' | 'other'>('all');

  const timerSectionRef = React.useRef<HTMLDivElement | null>(null);
  const [playingAudioStepId, setPlayingAudioStepId] = useState<string | null>(null);
  const [completedMicroSteps, setCompletedMicroSteps] = useState<Record<string, boolean>>({});

  const playParentVoice = (step: VisualScheduleStep) => {
    if (!step.audioDataUrl) return;
    try {
      const audio = new Audio(step.audioDataUrl);
      setPlayingAudioStepId(step.id);
      audio.play().catch(() => setPlayingAudioStepId(null));
      audio.onended = () => setPlayingAudioStepId(null);
      audio.onerror = () => setPlayingAudioStepId(null);
    } catch (e) {
      setPlayingAudioStepId(null);
    }
  };

  // Filtered routines based on category filter
  const filteredRoutines = routines.filter((r) => {
    if (categoryFilter === 'morning') return r.category === 'morning';
    if (categoryFilter === 'evening') return r.category === 'bedtime' || r.category === 'after-school';
    if (categoryFilter === 'other') return r.category !== 'morning' && r.category !== 'bedtime' && r.category !== 'after-school';
    return true;
  });

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId) || filteredRoutines[0] || routines[0];

  // Find next uncompleted step (Active Step)
  const activeStep = currentRoutine?.steps.find((s) => !s.completed);
  const activeStepIndex = currentRoutine?.steps.findIndex((s) => !s.completed) ?? -1;
  const subsequentStep = activeStepIndex >= 0 && activeStepIndex + 1 < (currentRoutine?.steps.length || 0)
    ? currentRoutine.steps[activeStepIndex + 1]
    : undefined;

  const [activeTimerTask, setActiveTimerTask] = useState<{
    title: string;
    emoji?: string;
    durationSeconds?: number;
    stepId?: string;
    autoStart?: boolean;
  } | undefined>(() => {
    if (activeStep) {
      return {
        title: activeStep.title,
        emoji: activeStep.emoji,
        durationSeconds: (activeStep.durationMin || 2) * 60,
        stepId: activeStep.id,
        autoStart: false,
      };
    }
    return undefined;
  });

  // When selected routine changes or step finishes, sync timer to current activity
  React.useEffect(() => {
    if (activeStep) {
      setActiveTimerTask({
        title: activeStep.title,
        emoji: activeStep.emoji,
        durationSeconds: (activeStep.durationMin || 2) * 60,
        stepId: activeStep.id,
        autoStart: false,
      });
    }
  }, [selectedRoutineId, activeStep?.id]);

  if (!currentRoutine) {
    return (
      <div className="p-8 text-center text-slate-500">
        No routines available. Create one in Parent Dashboard!
      </div>
    );
  }

  const completedStepsCount = currentRoutine.steps.filter((s) => s.completed).length;
  const totalStepsCount = currentRoutine.steps.length;
  const progressPercent = totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0;
  const isRoutineCompleted = totalStepsCount > 0 && completedStepsCount === totalStepsCount;
  const routineStickerDef = getStickerForRoutine(currentRoutine);

  const startTimerForStep = (
    step: { title: string; emoji: string; durationMin?: number; id: string },
    autoStart = true
  ) => {
    setActiveTimerTask({
      title: step.title,
      emoji: step.emoji,
      durationSeconds: (step.durationMin || 2) * 60,
      stepId: step.id,
      autoStart,
    });
    playChime('tap');
    announce(`Timer ready for ${step.title}. ${(step.durationMin || 2)} minutes.`);
    setTimeout(() => {
      timerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleTimerCompleteStep = (stepId?: string) => {
    if (stepId && currentRoutine) {
      const step = currentRoutine.steps.find((s) => s.id === stepId);
      if (step && !step.completed) {
        toggleRoutineStep(currentRoutine.id, stepId);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      
      {/* 1. PLANS CHANGED ALERT BANNER (If Active) */}
      {plansChanged.active && (
        <div
          onClick={() => setShowPlansChangedModal(true)}
          className="bg-amber-100 hover:bg-amber-200 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce">🔄</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider">
                  Important Change
                </span>
                <span className="text-xs font-bold text-amber-900">Tap to see new calm plan</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                New Plan: {plansChanged.newPlanTitle}
              </h2>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-700 shrink-0" />
        </div>
      )}

      {/* 2. TOP CONTROLS: CATEGORY FILTER & HELP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              playChime('tap');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-amber-400 text-white dark:text-amber-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Schedules
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('morning');
              playChime('tap');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'morning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning ☀️</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('evening');
              playChime('tap');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'evening'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening 🌙</span>
          </button>
        </div>

        {/* View Mode Switcher & Contextual Help Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setScheduleViewMode('focus_mode');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                scheduleViewMode === 'focus_mode'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Focus on one activity at a time"
            >
              <span>🎯 One at a Time</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScheduleViewMode('list_mode');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                scheduleViewMode === 'list_mode'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="View full schedule checklist"
            >
              <span>📋 Full List</span>
            </button>
          </div>

          <ContextualHelpButton topic="schedules" label="How it works" variant="pill" />
        </div>
      </div>

      {/* 3. ROUTINE SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {filteredRoutines.map((routine) => {
          const isSelected = routine.id === selectedRoutineId;
          const isAllDone =
            routine.steps.length > 0 && routine.steps.every((s) => s.completed);

          return (
            <button
              key={routine.id}
              onClick={() => {
                setSelectedRoutineId(routine.id);
                playChime('tap');
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="text-lg">{routine.emoji}</span>
              <span>{routine.title}</span>
              {isAllDone && <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-500" />}
            </button>
          );
        })}
      </div>

      {/* 4. FIRST -> THEN CARD (Core Predictability Principle) */}
      {currentRoutine.firstThen && (
        <section
          aria-label="First then board"
          className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-4 sm:p-5 shadow-xs"
        >
          <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2 flex items-center justify-between">
            <span>First → Then</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Tap when done!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* FIRST */}
            <button
              onClick={() => toggleFirstThen(currentRoutine.id, 'first')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-95 text-left cursor-pointer ${
                currentRoutine.firstThen.completedFirst
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-inner'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <span className="text-3xl">{currentRoutine.firstThen.firstEmoji}</span>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  First
                </span>
                <span className="font-black text-sm sm:text-base leading-tight">
                  {currentRoutine.firstThen.first}
                </span>
              </div>
              {currentRoutine.firstThen.completedFirst ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-200" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300" />
              )}
            </button>

            {/* THEN */}
            <button
              onClick={() => toggleFirstThen(currentRoutine.id, 'then')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-95 text-left cursor-pointer ${
                currentRoutine.firstThen.completedThen
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-inner'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <span className="text-3xl">{currentRoutine.firstThen.thenEmoji}</span>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Then
                </span>
                <span className="font-black text-sm sm:text-base leading-tight">
                  {currentRoutine.firstThen.then}
                </span>
              </div>
              {currentRoutine.firstThen.completedThen ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-200" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300" />
              )}
            </button>
          </div>
        </section>
      )}

      {/* 5. VISUAL TASK TIMER */}
      <div ref={timerSectionRef} className="scroll-mt-4">
        <VisualTaskTimer
          initialTask={activeTimerTask}
          onCompleteStep={handleTimerCompleteStep}
        />
      </div>

      {/* 6. ROUTINE PROGRESS & REWARD BANNER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{currentRoutine.emoji}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
                {currentRoutine.title}
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentRoutine.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {currentRoutine.time}
                  </span>
                )}
                <span>•</span>
                <span>
                  {completedStepsCount} of {totalStepsCount} completed
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => resetRoutine(currentRoutine.id)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            title="Reset routine"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Digital Sticker Reward Banner */}
        <div className="mt-3.5 p-3 rounded-2xl border flex items-center justify-between flex-wrap gap-2 transition-all bg-gradient-to-r from-amber-50 via-yellow-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-amber-300/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {routineStickerDef.emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  {isRoutineCompleted ? '🎉 Sticker Unlocked!' : '🎁 Complete Routine Reward'}
                </span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  +{routineStickerDef.starsAward} Stars
                </span>
              </div>
              <p className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 mt-0.5">
                {routineStickerDef.stickerName}: <span className="text-slate-500 dark:text-slate-400 font-medium">{routineStickerDef.description}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setChildView('rewards');
              playChime('tap');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 dark:bg-slate-900 text-amber-900 dark:text-amber-200 border border-amber-300 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Sticker Album ({earnedStickers.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          7A. FOCUS MODE: ONE STEP AT A TIME (Current Activity Experience)
      ════════════════════════════════════════════════════════════════ */}
      {scheduleViewMode === 'focus_mode' && (
        <div className="space-y-4 animate-in fade-in">
          {activeStep ? (
            <div className="space-y-3">
              {/* CURRENT STEP (NOW) HERO CARD */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-3 border-amber-400 dark:border-amber-500/80 bg-white dark:bg-slate-900 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NOW • Step {activeStepIndex + 1} of {totalStepsCount}</span>
                  </span>
                  {activeStep.durationMin && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-black text-xs">
                      ⏱️ {activeStep.durationMin} minutes
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left py-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 flex items-center justify-center text-5xl sm:text-6xl shadow-sm shrink-0">
                    {activeStep.emoji}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeStep.title}
                    </h3>
                    {activeStep.instruction && (
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                        {activeStep.instruction}
                      </p>
                    )}
                    {activeStep.sensoryNote && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-xl mt-1">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Sensory tip: {activeStep.sensoryNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons: Start Timer & Complete Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startTimerForStep(activeStep, true)}
                    className="py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Timer className="w-5 h-5" />
                    <span>Start Timer ({activeStep.durationMin || 2}m)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleRoutineStep(currentRoutine.id, activeStep.id);
                      playChime('star');
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>✓ Mark as Done!</span>
                  </button>
                </div>
              </div>

              {/* UP NEXT PREVIEW CARD */}
              {subsequentStep && (
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{subsequentStep.emoji}</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        NEXT
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                        {subsequentStep.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-500 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700">
                    {subsequentStep.durationMin || 2}m
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 text-center space-y-3">
              <span className="text-5xl block animate-bounce">🎉</span>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200">
                All done with {currentRoutine.title}!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium max-w-md mx-auto">
                Great job following each step! You earned your routine reward stars.
              </p>
              <button
                type="button"
                onClick={() => resetRoutine(currentRoutine.id)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Routine Again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          7B. LIST MODE: STEP-BY-STEP MISSION CHECKLIST
      ════════════════════════════════════════════════════════════════ */}
      {scheduleViewMode === 'list_mode' && (
        <div className="space-y-2.5 animate-in fade-in">
          {currentRoutine.steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => toggleRoutineStep(currentRoutine.id, step.id)}
              className={`flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-3xl border-2 transition-all active:scale-98 cursor-pointer select-none ${
                step.completed
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 opacity-90'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 flex-1">
                {/* Checkbox button */}
                <button
                  className="mt-0.5 sm:mt-0 text-emerald-600 transition-transform hover:scale-110"
                  aria-label={step.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-7 h-7 fill-emerald-500 text-white" />
                  ) : (
                    <Circle className="w-7 h-7 text-slate-300" />
                  )}
                </button>

                <span className="text-3xl shrink-0">{step.emoji}</span>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3
                      className={`font-black text-sm sm:text-base leading-tight ${
                        step.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.durationMin && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {step.durationMin}m
                      </span>
                    )}
                  </div>

                  {step.instruction && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                      {step.instruction}
                    </p>
                  )}

                  {step.sensoryNote && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                      <Info className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Sensory tip: {step.sensoryNote}</span>
                    </div>
                  )}

                  {/* Micro-Steps Breakdown */}
                  {step.microSteps && step.microSteps.length > 0 && (
                    <div 
                      className="mt-2.5 p-2 sm:p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1">
                          <Wand2 className="w-3 h-3 text-purple-600" />
                          <span>Micro-Steps ({step.microSteps.filter((m) => completedMicroSteps[m.id]).length}/{step.microSteps.length})</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">Tap to check off</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {step.microSteps.map((ms) => {
                          const isDone = completedMicroSteps[ms.id];
                          return (
                            <div
                              key={ms.id}
                              onClick={() => {
                                setCompletedMicroSteps((prev) => ({ ...prev, [ms.id]: !prev[ms.id] }));
                                playChime('tap');
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-purple-100/90 dark:bg-purple-900/60 border-purple-300 text-purple-900 line-through opacity-75'
                                  : 'bg-white dark:bg-slate-900 hover:bg-purple-100/50 border-purple-200 dark:border-purple-700 text-purple-950 dark:text-purple-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm shrink-0">{isDone ? '✅' : '⬜'}</span>
                                <span className="text-sm shrink-0">{ms.emoji}</span>
                                <span className="truncate">{ms.title}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startTimerForStep({ title: ms.title, emoji: ms.emoji, durationMin: 2, id: ms.id }, true);
                                }}
                                className="p-1 rounded-lg text-purple-600 hover:bg-purple-200/80 shrink-0 ml-1 cursor-pointer"
                                title="2-min micro-step timer"
                              >
                                <Timer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                {step.audioDataUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playParentVoice(step);
                    }}
                    className={`px-2.5 py-2 rounded-2xl border-2 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                      playingAudioStepId === step.id
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                    title="Listen to voice recording for this step"
                  >
                    <Mic className="w-4 h-4 text-rose-600" />
                    <span className="hidden sm:inline">{playingAudioStepId === step.id ? 'Playing...' : "Voice"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startTimerForStep(step, true);
                  }}
                  className="px-2.5 sm:px-3 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-2 border-sky-200 dark:border-sky-800 hover:border-sky-300 cursor-pointer flex items-center gap-1.5 text-xs font-black transition-all active:scale-95 shadow-xs"
                  title={`Start countdown timer for ${step.title}`}
                >
                  <Timer className="w-4 h-4 text-sky-600" />
                  <span className="hidden sm:inline">Start Timer</span>
                  <span className="sm:hidden">Timer</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(`${step.title}. ${step.instruction || ''}`);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Hear step instructions"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
