import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  Play, 
  Check, 
  Plus, 
  RotateCcw, 
  RotateCw,
  Clock, 
  X,
  BookOpen,
  Pause,
  Printer,
  Lock
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { Routine, VisualScheduleStep } from '../types';
import { DEFAULT_ROUTINES } from '../data/defaultData';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { VisualStepPacer } from './VisualStepPacer';
import { 
  getCurrentTimeRoutine,
  getTimePeriodCategory,
  getTimeOrderedCategoryOrder,
  sortRoutinesByTime
} from '../utils/routineTimeHelper';

interface MyDayViewProps {
  selectedCalendarDate?: Date;
  selectedRoutineId?: string;
  onSelectRoutineId?: (id: string) => void;
  onOpenTemplatesLibrary?: () => void;
  onOpenCustomizer?: (initial?: Partial<Routine>) => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({
  selectedCalendarDate,
  selectedRoutineId: selectedRoutineIdProp,
  onSelectRoutineId,
  onOpenTemplatesLibrary,
  onOpenCustomizer,
}) => {
  const {
    routines,
    toggleRoutineStep,
    resetRoutine,
    updateRoutine,
    openPrintSchedule,
    activeTheme,
    isPremium,
    triggerUpgrade,
  } = useApp();

  // Re-render when language changes
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handleLangChange = () => setLangTick((n) => n + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  // Helper for dynamic routine title formatting (including New Plan)
  const renderRoutineTitle = (title: string) => {
    if (title.includes('New Plan: ')) {
      const planName = title.split('New Plan: ')[1];
      return `${t('New Plan')}: ${t(planName)}`;
    }
    return t(title);
  };

  // Filter out any legacy 20-step routines
  const validRoutines = routines.filter(
    (r) => r.id !== 'routine-school-full' && (r.steps?.length || 0) < 18
  );

  // Target date for time awareness (today vs specific calendar day)
  const isToday = !selectedCalendarDate || selectedCalendarDate.toDateString() === new Date().toDateString();
  const targetDate = isToday ? new Date() : selectedCalendarDate;
  const currentActiveRoutine = getCurrentTimeRoutine(validRoutines, targetDate);
  const currentPeriod = getTimePeriodCategory(targetDate);

  // Set of expanded routine card IDs
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Default: expand the selected routine or the time-appropriate routine
    if (selectedRoutineIdProp) {
      initial.add(selectedRoutineIdProp);
    } else {
      const timeRoutine = getCurrentTimeRoutine(validRoutines, targetDate);
      if (timeRoutine) {
        initial.add(timeRoutine.id);
      } else if (validRoutines.length > 0) {
        initial.add(validRoutines[0].id);
      }
    }
    return initial;
  });

  // Set of collapsed category sections
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Active Timer routine state (when Play ▶ is tapped)
  const [timerRoutine, setTimerRoutine] = useState<Routine | null>(null);
  const [timerStepIndex, setTimerStepIndex] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(300);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isWaitingForNext, setIsWaitingForNext] = useState<boolean>(false);

  // Sync expanded routine when parent prop or calendar date changes
  React.useEffect(() => {
    if (selectedRoutineIdProp) {
      setExpandedRoutineIds((prev) => {
        const next = new Set(prev);
        next.add(selectedRoutineIdProp);
        return next;
      });
    } else {
      const timeRoutine = getCurrentTimeRoutine(validRoutines, targetDate);
      if (timeRoutine) {
        setExpandedRoutineIds((prev) => {
          const next = new Set(prev);
          next.add(timeRoutine.id);
          return next;
        });
      }
    }
  }, [selectedRoutineIdProp, selectedCalendarDate]);

  // Timer interval countdown
  React.useEffect(() => {
    if (!isTimerRunning || !timerRoutine) return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime('complete');
          setIsTimerRunning(false);
          setIsWaitingForNext(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRoutine]);

  // Recurrence text helper matching mockup format: "46m · 🔄 Daily"
  const getRecurrenceText = (assignedDays?: number[]) => {
    if (!assignedDays || assignedDays.length === 0 || assignedDays.length === 7) {
      return 'Daily';
    }
    const isWeekdays =
      assignedDays.length === 5 && [1, 2, 3, 4, 5].every((d) => assignedDays.includes(d));
    if (isWeekdays) return 'Mon - Fri';

    const isWeekends =
      assignedDays.length === 2 && [0, 6].every((d) => assignedDays.includes(d));
    if (isWeekends) return 'Weekends';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return assignedDays.map((d) => dayNames[d]).join(', ');
  };

  // Total routine duration in minutes
  const getTotalMinutes = (steps: VisualScheduleStep[]) => {
    if (!steps || steps.length === 0) return 15;
    return steps.reduce((acc, s) => acc + (s.durationMin || 5), 0);
  };

  // Toggle dropdown expansion of a routine card
  const toggleRoutineExpanded = (id: string) => {
    setExpandedRoutineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (onSelectRoutineId) {
      onSelectRoutineId(id);
    }
  };

  // Toggle category section collapse
  const toggleCategory = (catKey: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) {
        next.delete(catKey);
      } else {
        next.add(catKey);
      }
      return next;
    });
  };

  // Select any step to put on the top timer without crossing it off
  const handleSelectStepForTimer = (routine: Routine, stepIndex: number) => {
    const step = routine.steps[stepIndex];
    if (!step) return;
    const duration = (step.durationMin || 5) * 60;

    setTimerRoutine(routine);
    setTimerStepIndex(stepIndex);
    setTimerSecondsLeft(duration);
    setTimerTotalSeconds(duration);
    setIsTimerRunning(true);
    setIsWaitingForNext(false);
    playChime('tap');
  };

  // Start visual countdown timer for a routine
  const handleStartTimer = (routine: Routine) => {
    const firstIncompleteIdx = routine.steps.findIndex((s) => !s.completed);
    const stepIdx = firstIncompleteIdx >= 0 ? firstIncompleteIdx : 0;
    const step = routine.steps[stepIdx];
    const duration = step ? (step.durationMin || 5) * 60 : 300;

    setTimerRoutine(routine);
    setTimerStepIndex(stepIdx);
    setTimerSecondsLeft(duration);
    setTimerTotalSeconds(duration);
    setIsTimerRunning(true);
    setIsWaitingForNext(false);
    playChime('tap');
  };

  // Add extra grace time to current step
  const handleAddGraceTime = (addedSeconds: number) => {
    setTimerSecondsLeft((prev) => prev + addedSeconds);
    setTimerTotalSeconds((prev) => Math.max(prev, timerSecondsLeft + addedSeconds));
    playChime('tap');
  };

  // Advance to next step (optionally marking current as done), pausing for user readiness
  const handleAdvanceStep = (markDone: boolean = true) => {
    if (!timerRoutine) return;
    const currentStep = timerRoutine.steps[timerStepIndex];
    if (markDone && currentStep && !currentStep.completed) {
      toggleRoutineStep(timerRoutine.id, currentStep.id);
      playChime('star');
    }

    if (timerStepIndex + 1 < timerRoutine.steps.length) {
      const nextIdx = timerStepIndex + 1;
      const nextStep = timerRoutine.steps[nextIdx];
      const nextDuration = (nextStep?.durationMin || 5) * 60;
      setTimerStepIndex(nextIdx);
      setTimerSecondsLeft(nextDuration);
      setTimerTotalSeconds(nextDuration);
      // Wait until person is ready before starting the next item's timer
      setIsTimerRunning(false);
      setIsWaitingForNext(true);
    } else {
      // Completed all steps in the routine!
      playChime('complete');
      setTimerRoutine(null);
      setIsWaitingForNext(false);
    }
  };

  // Start timer for the next item when the user is ready
  const handleStartNextWhenReady = () => {
    setIsTimerRunning(true);
    setIsWaitingForNext(false);
    playChime('tap');
  };

  // Check if routine applies to calendar date
  const isRoutineActiveOnDate = (routine: Routine) => {
    if (!selectedCalendarDate) return true;
    const day = selectedCalendarDate.getDay();
    if (routine.assignedDays === undefined) return true;
    return routine.assignedDays.includes(day);
  };

  // Group routines into clean categories matching mockup style
  const categoryConfigs = [
    { id: 'morning', label: 'Morning', emoji: '🔆', matcher: (r: Routine) => r.category === 'morning' || r.id.includes('morning') || r.id.includes('prep') },
    { id: 'school', label: 'School & Daytime', emoji: '🏫', matcher: (r: Routine) => r.category === 'school' || r.id.includes('school') },
    { id: 'after-school', label: 'Afternoon & Evening', emoji: '🏡', matcher: (r: Routine) => r.category === 'after-school' || r.category === 'evening' || r.id.includes('evening') || r.id.includes('home') },
    { id: 'bedtime', label: 'Bedtime', emoji: '🌙', matcher: (r: Routine) => r.category === 'bedtime' || r.id.includes('bed') },
    { id: 'custom', label: 'Other Routines', emoji: '⭐', matcher: () => true },
  ];

  // Dynamic category ordering: routines relevant to current time of day appear first
  const categoryOrder = getTimeOrderedCategoryOrder(targetDate);
  const orderedCategoryConfigs = [...categoryConfigs].sort((a, b) => {
    const idxA = categoryOrder.indexOf(a.id as any);
    const idxB = categoryOrder.indexOf(b.id as any);
    return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
  });

  // Map routines to categories without duplicating, filtering by active day and sorting chronologically
  const placedRoutineIds = new Set<string>();
  const categorizedGroups = orderedCategoryConfigs.map((cfg) => {
    const groupRoutines = validRoutines.filter((r) => {
      if (placedRoutineIds.has(r.id)) return false;
      if (!isRoutineActiveOnDate(r)) return false;
      if (cfg.matcher(r)) {
        placedRoutineIds.add(r.id);
        return true;
      }
      return false;
    });

    return {
      id: cfg.id,
      label: cfg.label,
      emoji: cfg.emoji,
      routines: sortRoutinesByTime(groupRoutines),
    };
  }).filter((group) => group.routines.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 select-none">
      {/* Visual Step Pacer Banner (if activated via Play ▶ button) */}
      {timerRoutine && (
        <VisualStepPacer
          routine={timerRoutine}
          stepIndex={timerStepIndex}
          secondsLeft={timerSecondsLeft}
          totalSeconds={timerTotalSeconds}
          isRunning={isTimerRunning}
          isWaitingForNext={isWaitingForNext}
          onTogglePlayPause={() => setIsTimerRunning(!isTimerRunning)}
          onAdvanceStep={handleAdvanceStep}
          onAddGraceTime={handleAddGraceTime}
          onStartWhenReady={handleStartNextWhenReady}
          onClose={() => {
            setTimerRoutine(null);
            setIsWaitingForNext(false);
          }}
          onSelectStepIndex={(idx) => handleSelectStepForTimer(timerRoutine, idx)}
        />
      )}

      {/* Empty State when no routines are scheduled for this day */}
      {categorizedGroups.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-stone-200 text-center space-y-3 shadow-xs">
          <div className={`w-16 h-16 mx-auto rounded-3xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex items-center justify-center text-3xl`}>
            ☀️
          </div>
          <h4 className="text-base sm:text-lg font-black text-stone-900">
            {t('No Routines Scheduled for This Day')}
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-stone-500 max-w-sm mx-auto">
            {t('All routines are turned off for today. You can tap "Edit Days" above to activate routines, or browse pre-built templates.')}
          </p>
        </div>
      )}

      {/* Routine Category Sections */}
      {categorizedGroups.map((group) => {
        const isCollapsed = collapsedCategories.has(group.id);
        const isCurrentPeriod = isToday && group.id === currentPeriod;

        return (
          <section key={group.id} className="space-y-3">
            {/* Section Header: e.g. "^ 🔆 Morning · 1         +" */}
            <div className="flex items-center justify-between text-stone-500 font-bold text-sm px-2 py-0.5">
              <button
                type="button"
                onClick={() => toggleCategory(group.id)}
                className="flex items-center gap-1.5 hover:text-stone-800 transition-colors cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                )}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <RoutineStickerIcon emoji={group.emoji} title={group.label} className="w-5 h-5 object-contain" />
                </div>
                <span className="text-stone-700 font-extrabold">{t(group.label)}</span>
                <span>·</span>
                <span>{group.routines.length}</span>
                {isCurrentPeriod && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full ${activeTheme?.palette?.badgeBg || 'bg-amber-100/90'} ${activeTheme?.palette?.textAccent || 'text-amber-800'} text-[10px] font-black border ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} flex items-center gap-1 shadow-2xs`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTheme?.palette?.primaryBg || 'bg-amber-600'} inline-block`} />
                    <span>{t('Now')}</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPremium && routines.length >= 1) {
                    triggerUpgrade('Free plan includes 1 active visual routine. Upgrade to BeeYou Plus for unlimited routines and First-Then schedules!');
                    return;
                  }
                  onOpenCustomizer?.({ category: group.id as any });
                }}
                className="text-stone-400 hover:text-stone-800 text-2xl font-light leading-none p-1 -m-1 transition-colors cursor-pointer"
                title={t('Add routine')}
              >
                +
              </button>
            </div>

            {/* Routine Cards in this category */}
            {!isCollapsed && (
              <div className="space-y-3.5">
                {group.routines.map((routine) => {
                  const isExpanded = expandedRoutineIds.has(routine.id);
                  const isLocked = !isPremium && routine.id !== validRoutines[0]?.id;
                  const isCurrentRoutine = isToday && routine.id === currentActiveRoutine?.id;
                  const totalMinutes = getTotalMinutes(routine.steps);
                  const recurrenceText = getRecurrenceText(routine.assignedDays);
                  const completedCount = routine.steps.filter((s) => s.completed).length;

                  return (
                    <div
                      key={routine.id}
                      className={`bg-white rounded-[2rem] sm:rounded-[2.4rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all ${
                        isCurrentRoutine
                          ? `${activeTheme?.palette?.primaryBorder || 'border-amber-400'} ring-2 shadow-md`
                          : 'border-stone-200/80'
                      }`}
                      style={{
                        borderColor: isCurrentRoutine ? (activeTheme?.palette?.primary || '#f59e0b') : undefined,
                        boxShadow: isCurrentRoutine ? `0 0 0 2px ${activeTheme?.palette?.primary || '#f59e0b'}33, 0 4px 20px rgba(0,0,0,0.05)` : undefined,
                      }}
                    >
                      {/* Collapsed Routine Header: Chevron, Title, Subtitle, Play Button */}
                      <div
                        className="flex items-center justify-between gap-3 cursor-pointer select-none"
                        onClick={() => {
                          if (isLocked) {
                            triggerUpgrade('Free plan includes 1 active visual routine. Upgrade to BeeYou Plus for unlimited routines and First-Then schedules!');
                            return;
                          }
                          toggleRoutineExpanded(routine.id);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-stone-500 shrink-0 stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-stone-400 shrink-0 stroke-[2.5]" />
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2 truncate">
                                <span>{renderRoutineTitle(routine.title)}</span>
                                <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
                                  <RoutineStickerIcon emoji={routine.emoji} title={routine.title} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                                </div>
                              </h3>
                              {isCurrentRoutine && (
                                <span className={`px-2 py-0.5 rounded-full ${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white text-[10px] sm:text-[11px] font-black border ${activeTheme?.palette?.primaryBorder || 'border-amber-500/70'} flex items-center gap-1 shadow-2xs shrink-0`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                                  <span>{t('Current Now')}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-stone-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {routine.time && (
                                <>
                                  <span className="flex items-center gap-1 text-stone-700 font-bold bg-stone-100 px-2 py-0.5 rounded-md text-[11px] sm:text-xs">
                                    <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                    <span>{routine.time}</span>
                                  </span>
                                  <span>·</span>
                                </>
                              )}
                              <span>{totalMinutes}{t('m')}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <RotateCw className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>{t(recurrenceText)}</span>
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Circular Dark Play Button or Lock Plus Button */}
                        {isLocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerUpgrade('Free plan includes 1 active visual routine. Upgrade to BeeYou Plus for unlimited routines and First-Then schedules!');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                            title={t('Unlock with BeeYou Plus')}
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Plus</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTimer(routine);
                            }}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1E232A] hover:bg-[#2D3748] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
                            title={t('Start Routine Timer')}
                          >
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </button>
                        )}
                      </div>

                      {/* Expanded Dropdown Steps List */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                          {routine.steps.map((step, stepIdx) => {
                            const isStepActiveOnTimer =
                              timerRoutine?.id === routine.id && timerStepIndex === stepIdx;

                            return (
                              <div
                                key={step.id}
                                onClick={() => handleSelectStepForTimer(routine, stepIdx)}
                                className={`flex items-center justify-between gap-3 py-2 px-3 rounded-2xl cursor-pointer select-none transition-all group ${
                                  isStepActiveOnTimer
                                    ? `${activeTheme?.palette?.primaryLight || 'bg-amber-50/90'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-400'} shadow-xs`
                                    : 'hover:bg-stone-50 border-2 border-transparent'
                                }`}
                                title={t('Click to put on top timer')}
                              >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  {/* Status indicator: Gold checkmark badge when done, themed play icon when on timer, hollow gray circle otherwise */}
                                  <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                      step.completed
                                        ? 'bg-[#FACC15] text-stone-950 shadow-xs'
                                        : isStepActiveOnTimer
                                        ? `${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white ring-2 ring-black/10 shadow-xs animate-pulse`
                                        : 'border-2 border-stone-300 group-hover:border-stone-400 bg-transparent'
                                    }`}
                                  >
                                    {step.completed ? (
                                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] text-stone-950" />
                                    ) : isStepActiveOnTimer ? (
                                      <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                    ) : null}
                                  </div>

                                  {/* Custom Hand-Drawn Sticker Icon / Emoji */}
                                  <div className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
                                    <RoutineStickerIcon
                                      emoji={step.emoji}
                                      title={step.title}
                                      className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                                    />
                                  </div>

                                  {/* Title & timer badge: Strikethrough when done, theme highlight when active on timer, dark clean when pending */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                                          step.completed
                                            ? 'line-through text-stone-400 font-medium'
                                            : isStepActiveOnTimer
                                            ? `${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold`
                                            : 'text-stone-800'
                                        }`}
                                      >
                                        {t(step.title)}
                                      </span>
                                      {step.completed && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 shrink-0 flex items-center gap-1">
                                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                                          {t('Already Done')}
                                        </span>
                                      )}
                                      {isStepActiveOnTimer && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shrink-0 ${
                                          step.completed
                                            ? `${activeTheme?.palette?.primaryLight || 'bg-amber-100'} ${activeTheme?.palette?.textAccent || 'text-amber-900'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-300'}`
                                            : `${activeTheme?.palette?.badgeBg || 'bg-amber-200/80'} ${activeTheme?.palette?.textAccent || 'text-amber-900'}`
                                        }`}>
                                          {t('On Timer')}
                                        </span>
                                      )}
                                    </div>
                                    {isStepActiveOnTimer && (
                                      <p className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${
                                        step.completed ? 'text-emerald-700 font-bold' : (activeTheme?.palette?.textAccent || 'text-amber-700')
                                      }`}>
                                        {step.completed ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 shrink-0" />
                                            <span>{t('Already done! Click "Next" on the top timer to continue.')}</span>
                                          </>
                                        ) : (
                                          <span>{t('Click "Done" on the top timer to finish')}</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Duration on the right */}
                                {isStepActiveOnTimer ? (
                                  <div className={`flex items-center gap-1.5 shrink-0 ${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white px-2.5 py-1 rounded-full font-black text-xs shadow-xs animate-pulse`}>
                                    <Clock className="w-3 h-3 text-white" />
                                    <span>{Math.floor(timerSecondsLeft / 60)}:{String(timerSecondsLeft % 60).padStart(2, '0')}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs sm:text-sm font-semibold shrink-0 text-stone-400">
                                    {step.durationMin || 5}m
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {/* Routine Footer: Completed summary, Print, and Reset */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 px-2 text-xs font-bold text-stone-400 border-t border-stone-100">
                            <div className="flex items-center gap-2">
                              <span>
                                {completedCount} of {routine.steps.length} {t('completed')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPrintSchedule({ mode: 'checklist', routineId: routine.id });
                                  playChime('tap');
                                }}
                                className={`inline-flex items-center gap-1 ${activeTheme?.palette?.textAccent || 'text-amber-700'} hover:opacity-80 ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 px-2 py-0.5 rounded-lg border ${activeTheme?.palette?.primaryBorder || 'border-amber-200/80'} cursor-pointer font-bold transition-all text-[11px] shadow-2xs`}
                                title="Print this routine or PECS cards"
                              >
                                <Printer className="w-3 h-3 opacity-80" />
                                <span>{t('Print Schedule / Cards')}</span>
                              </button>
                            </div>
                            {completedCount > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetRoutine(routine.id);
                                }}
                                className="text-stone-400 hover:text-stone-700 underline cursor-pointer"
                              >
                                {t('Reset all')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* Quick link to Pre-Built Routine Templates */}
      {onOpenTemplatesLibrary && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenTemplatesLibrary}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-900'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200/80'} font-black text-xs transition-all shadow-2xs cursor-pointer active:scale-95`}
          >
            <BookOpen className="w-4 h-4 opacity-80" />
            <span>{t('Browse Pre-Built Routine Templates Library')} ➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
