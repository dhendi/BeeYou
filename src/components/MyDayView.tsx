import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  AlertCircle,
  Volume2,
  Info,
  Timer,
  Pill,
  Mic,
  Wand2,
  Play
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { VisualTaskTimer } from './VisualTaskTimer';
import { getStickerForRoutine } from '../data/rewardsData';
import { VisualScheduleStep } from '../types';

export const MyDayView: React.FC = () => {
  const {
    routines,
    toggleRoutineStep,
    resetRoutine,
    toggleFirstThen,
    plansChanged,
    setShowPlansChangedModal,
    speak,
    setChildView,
    earnedStickers,
    dailyRecollections,
    setShowRecollectionModal,
    medications,
    takeMedicationDose,
    setShowMedicationModal,
    enabledFeatures,
  } = useApp();


  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines[0]?.id || 'routine-morning'
  );

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

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];

  // Find next uncompleted step
  const nextStep = currentRoutine?.steps.find((s) => !s.completed);

  const [activeTimerTask, setActiveTimerTask] = useState<{
    title: string;
    emoji?: string;
    durationSeconds?: number;
    stepId?: string;
    autoStart?: boolean;
  } | undefined>(() => {
    if (nextStep) {
      return {
        title: nextStep.title,
        emoji: nextStep.emoji,
        durationSeconds: (nextStep.durationMin || 2) * 60,
        stepId: nextStep.id,
        autoStart: false,
      };
    }
    return undefined;
  });

  // When selected routine changes, sync timer to current activity
  React.useEffect(() => {
    if (nextStep) {
      setActiveTimerTask({
        title: nextStep.title,
        emoji: nextStep.emoji,
        durationSeconds: (nextStep.durationMin || 2) * 60,
        stepId: nextStep.id,
        autoStart: false,
      });
    }
  }, [selectedRoutineId, nextStep?.id]);

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
    speak(`Timer ready for ${step.title}. ${(step.durationMin || 2)} minutes.`);
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
          className="bg-amber-100 hover:bg-amber-200 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce">🔄</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[11px] uppercase tracking-wider">
                  Important Change
                </span>
                <span className="text-xs font-bold text-amber-900">Tap to see new plan</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                New Plan: {plansChanged.newPlanTitle}
              </h2>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-700 shrink-0" />
        </div>
      )}

      {/* 2. ROUTINE SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {routines.map((routine) => {
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
                  ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="text-lg">{routine.emoji}</span>
              <span>{routine.title}</span>
              {isAllDone && <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-500" />}
            </button>
          );
        })}
      </div>

      {/* 3. FIRST -> THEN CARD (Core Predictability Principle) */}
      {currentRoutine.firstThen && (
        <section
          aria-label="First then board"
          className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-3 border-indigo-200 rounded-3xl p-4 sm:p-5 shadow-sm"
        >
          <div className="text-[11px] font-black uppercase tracking-wider text-indigo-800 mb-2 flex items-center justify-between">
            <span>First → Then</span>
            <span className="text-slate-500 font-medium">Tap when done!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* FIRST */}
            <button
              onClick={() => toggleFirstThen(currentRoutine.id, 'first')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-95 text-left cursor-pointer ${
                currentRoutine.firstThen.completedFirst
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-inner'
                  : 'bg-white border-slate-300 text-slate-800 shadow-xs'
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
                  : 'bg-white border-slate-300 text-slate-800 shadow-xs'
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

      {/* 4. VISUAL COUNTDOWN TIMER COMPONENT (Non-pressuring, calm, visual) */}
      <div ref={timerSectionRef} className="scroll-mt-4">
        <VisualTaskTimer
          initialTask={activeTimerTask}
          onCompleteStep={handleTimerCompleteStep}
        />
      </div>

      {/* 5. ACTIVE ROUTINE HEADER & PROGRESS */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{currentRoutine.emoji}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                {currentRoutine.title}
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
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
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            title="Reset routine"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Digital Sticker Reward Banner */}
        <div className="mt-3.5 p-3 rounded-2xl border-2 flex items-center justify-between flex-wrap gap-2 transition-all bg-gradient-to-r from-amber-50 via-yellow-50 to-indigo-50 border-amber-300/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {routineStickerDef.emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  {isRoutineCompleted ? '🎉 Sticker Unlocked!' : '🎁 Complete Routine Reward'}
                </span>
                <span className="text-[11px] font-bold text-amber-700">
                  +{routineStickerDef.starsAward} Stars
                </span>
              </div>
              <p className="font-black text-xs sm:text-sm text-slate-800 mt-0.5">
                {routineStickerDef.stickerName}: <span className="text-slate-500 font-medium">{routineStickerDef.description}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setChildView('rewards');
              playChime('tap');
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Sticker Album ({earnedStickers.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>

        {/* WHAT AM I DOING? & WHAT'S NEXT? Indicator */}
        {nextStep && (
          <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sky-800 uppercase tracking-wider">
                Up Next:
              </span>
              <span className="text-xl">{nextStep.emoji}</span>
              <span className="font-bold text-xs sm:text-sm text-sky-950">{nextStep.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => startTimerForStep(nextStep, true)}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sky-200"
                title="Start visual countdown timer for up next step"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Start Timer ({nextStep.durationMin || 2}m)</span>
              </button>
              <button
                onClick={() => speak(`Up next is: ${nextStep.title}`)}
                className="p-1.5 rounded-lg bg-sky-200/80 text-sky-800 hover:bg-sky-300 transition-all cursor-pointer"
                title="Hear up next"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. STEP-BY-STEP MISSION CHECKLIST */}
      <div className="space-y-2.5">
        {currentRoutine.steps.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => toggleRoutineStep(currentRoutine.id, step.id)}
            className={`flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-3xl border-2 transition-all active:scale-98 cursor-pointer select-none ${
              step.completed
                ? 'bg-emerald-50/70 border-emerald-300 opacity-90'
                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
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
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3
                    className={`font-black text-sm sm:text-base leading-tight ${
                      step.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.durationMin && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {step.durationMin}m
                    </span>
                  )}
                </div>

                {step.instruction && (
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                    {step.instruction}
                  </p>
                )}

                {step.sensoryNote && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 w-fit">
                    <Info className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Sensory tip: {step.sensoryNote}</span>
                  </div>
                )}

                {/* Magic Micro-Steps Checklist (Feature 4 & 10) */}
                {step.microSteps && step.microSteps.length > 0 && (
                  <div 
                    className="mt-2.5 p-2 sm:p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                        <Wand2 className="w-3 h-3 text-purple-600" />
                        <span>Micro-Steps ({step.microSteps.filter((m) => completedMicroSteps[m.id]).length}/{step.microSteps.length})</span>
                      </span>
                      <span className="text-[10px] font-bold text-purple-700">Tap to check off</span>
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
                                ? 'bg-purple-100/90 border-purple-300 text-purple-900 line-through opacity-75'
                                : 'bg-white hover:bg-purple-100/50 border-purple-200 text-purple-950 shadow-2xs'
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

            {/* Action buttons: Start Timer, Parent Voice & Hear step */}
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              {/* Parent Voice Recorded Clip (Feature 11) */}
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
                  title="Listen to parent's voice recording for this step"
                >
                  <Mic className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">{playingAudioStepId === step.id ? 'Playing...' : "Parent Voice"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startTimerForStep(step, true);
                }}
                className="px-2.5 sm:px-3 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border-2 border-sky-200 hover:border-sky-300 cursor-pointer flex items-center gap-1.5 text-xs font-black transition-all active:scale-95 shadow-xs"
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
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title="Hear step instructions"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Medication & Health Routine Card */}
      {enabledFeatures?.medicationReminders !== false && medications.length > 0 && (() => {
        const totalDoses = medications.reduce((acc, m) => acc + (m.frequency === 'as_needed' ? 1 : m.times.length), 0);
        const takenDoses = medications.reduce((acc, m) => acc + m.takenTimesToday.length, 0);

        return (
          <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border-2 border-teal-300 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl select-none">💊</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-200/90 px-2 py-0.5 rounded-full">
                    Health & Medications
                  </span>
                  <span className="text-xs font-bold text-teal-900">
                    {takenDoses >= totalDoses
                      ? "All doses taken today! ✓"
                      : `${takenDoses} of ${totalDoses} doses taken (+1 ⭐ per dose)`}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
                  Medication Reminders & Supply
                </h4>
                <p className="text-xs text-slate-600">
                  Track pills, chewables, and inhalers with automatic inventory countdown.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMedicationModal(true);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Pill className="w-4 h-4" />
              <span>Open Medication Tracker</span>
            </button>
          </div>
        );
      })()}

      {/* End of Day Reflection Card */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-indigo-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none">🌙</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full">
                End-of-Day Chart
              </span>
              <span className="text-xs font-bold text-amber-900">
                {dailyRecollections.some((r) => r.date === new Date().toISOString().split('T')[0])
                  ? "Today's reflection recorded! ✓"
                  : "How was today? (+3 ⭐)"}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">
              Daily Mood & Recollection Check-In
            </h4>
            <p className="text-xs text-slate-600">
              Answer quick questions with your family or therapist to review your day.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowRecollectionModal(true);
            playChime('tap');
          }}
          className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-amber-300 text-amber-600" />
          <span>Open Reflection</span>
        </button>
      </div>
    </div>
  );
};


