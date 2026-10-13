import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Check, 
  Plus, 
  RotateCcw, 
  RotateCw,
  Clock, 
  X,
  BookOpen,
  Pause
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { Routine, VisualScheduleStep } from '../types';
import { DEFAULT_ROUTINES } from '../data/defaultData';
import { RoutineStickerIcon } from './icons/JournalStickers';

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
  } = useApp();

  // Filter out any legacy 20-step routines
  const validRoutines = routines.filter(
    (r) => r.id !== 'routine-school-full' && (r.steps?.length || 0) < 18
  );

  // Set of expanded routine card IDs
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Default: expand the selected routine or the first routine
    if (selectedRoutineIdProp) {
      initial.add(selectedRoutineIdProp);
    } else if (validRoutines.length > 0) {
      initial.add(validRoutines[0].id);
    }
    return initial;
  });

  // Set of collapsed category sections
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Active Timer routine state (when Play ▶ is tapped)
  const [timerRoutine, setTimerRoutine] = useState<Routine | null>(null);
  const [timerStepIndex, setTimerStepIndex] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Sync expanded routine when parent prop changes
  React.useEffect(() => {
    if (selectedRoutineIdProp) {
      setExpandedRoutineIds((prev) => {
        const next = new Set(prev);
        next.add(selectedRoutineIdProp);
        return next;
      });
    }
  }, [selectedRoutineIdProp]);

  // Timer interval countdown
  React.useEffect(() => {
    if (!isTimerRunning || !timerRoutine) return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          playChime('complete');
          setIsTimerRunning(false);
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

  // Toggle step completion cleanly
  const handleToggleStep = (routineId: string, stepId: string) => {
    toggleRoutineStep(routineId, stepId);
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
    setIsTimerRunning(true);
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

  // Map routines to categories without duplicating, filtering by active day
  const placedRoutineIds = new Set<string>();
  const categorizedGroups = categoryConfigs.map((cfg) => {
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
      routines: groupRoutines,
    };
  }).filter((group) => group.routines.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 select-none">
      {/* Visual Timer Banner Modal (if activated via Play ▶ button) */}
      {timerRoutine && (
        <div className="bg-[#1E232A] text-white p-5 rounded-[2.5rem] shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-amber-400 text-stone-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              {Math.floor(timerSecondsLeft / 60)}:
              {String(timerSecondsLeft % 60).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>{timerRoutine.title}</span>
                <RoutineStickerIcon
                  emoji={timerRoutine.emoji}
                  title={timerRoutine.title}
                  className="w-4 h-4 object-contain inline-block shrink-0"
                />
              </span>
              <h4 className="text-base sm:text-lg font-black truncate text-white flex items-center gap-2">
                <RoutineStickerIcon
                  emoji={timerRoutine.steps[timerStepIndex]?.emoji}
                  title={timerRoutine.steps[timerStepIndex]?.title}
                  className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                />
                <span>{timerRoutine.steps[timerStepIndex]?.title || t('In Progress')}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isTimerRunning ? t('Pause') : t('Resume')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const currentStep = timerRoutine.steps[timerStepIndex];
                if (currentStep) {
                  toggleRoutineStep(timerRoutine.id, currentStep.id);
                  playChime('star');
                }
                if (timerStepIndex + 1 < timerRoutine.steps.length) {
                  const nextIdx = timerStepIndex + 1;
                  setTimerStepIndex(nextIdx);
                  const nextStep = timerRoutine.steps[nextIdx];
                  setTimerSecondsLeft((nextStep?.durationMin || 5) * 60);
                } else {
                  setTimerRoutine(null);
                }
              }}
              className="px-4 py-2 rounded-full bg-[#FACC15] hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('Done')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTimerRoutine(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title={t('Close Timer')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no routines are scheduled for this day */}
      {categorizedGroups.length === 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-stone-200 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
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
                <span className="text-stone-700 font-extrabold">{group.label}</span>
                <span>·</span>
                <span>{group.routines.length}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCustomizer?.({ category: group.id as any })}
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
                  const totalMinutes = getTotalMinutes(routine.steps);
                  const recurrenceText = getRecurrenceText(routine.assignedDays);
                  const completedCount = routine.steps.filter((s) => s.completed).length;

                  return (
                    <div
                      key={routine.id}
                      className="bg-white rounded-[2rem] sm:rounded-[2.4rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/80 transition-all"
                    >
                      {/* Collapsed Routine Header: Chevron, Title, Subtitle, Play Button */}
                      <div
                        className="flex items-center justify-between gap-3 cursor-pointer select-none"
                        onClick={() => toggleRoutineExpanded(routine.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-stone-500 shrink-0 stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-stone-400 shrink-0 stroke-[2.5]" />
                          )}

                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2 truncate">
                              <span>{t(routine.title)}</span>
                              <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
                                <RoutineStickerIcon emoji={routine.emoji} title={routine.title} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                              </div>
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-stone-400 flex items-center gap-1.5 mt-0.5">
                              <span>{totalMinutes}m</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <RotateCw className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>{recurrenceText}</span>
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Circular Dark Play Button */}
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
                      </div>

                      {/* Expanded Dropdown Steps List */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                          {routine.steps.map((step) => {
                            return (
                              <div
                                key={step.id}
                                onClick={() => handleToggleStep(routine.id, step.id)}
                                className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-2xl hover:bg-stone-50 cursor-pointer select-none transition-colors group"
                              >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                  {/* Checkbox: Gold badge with black checkmark when done, hollow gray outline when incomplete */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStep(routine.id, step.id);
                                    }}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                      step.completed
                                        ? 'bg-[#FACC15] text-stone-950 shadow-xs'
                                        : 'border-2 border-stone-300 group-hover:border-stone-400 bg-transparent'
                                    }`}
                                    title={step.completed ? t('Completed - click to uncheck') : t('Click to mark done')}
                                  >
                                    {step.completed && (
                                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] text-stone-950" />
                                    )}
                                  </button>

                                  {/* Custom Hand-Drawn Sticker Icon / Emoji */}
                                  <div className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
                                    <RoutineStickerIcon
                                      emoji={step.emoji}
                                      title={step.title}
                                      className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                                    />
                                  </div>

                                  {/* Title: Strikethrough when done, dark and clean when pending */}
                                  <span
                                    className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                                      step.completed
                                        ? 'line-through text-stone-400 font-medium'
                                        : 'text-stone-800'
                                    }`}
                                  >
                                    {t(step.title)}
                                  </span>
                                </div>

                                {/* Duration on the right */}
                                <span className="text-xs sm:text-sm font-semibold text-stone-400 shrink-0">
                                  {step.durationMin || 5}m
                                </span>
                              </div>
                            );
                          })}

                          {/* Routine Footer: Completed summary and Reset */}
                          <div className="flex items-center justify-between pt-2 px-2 text-xs font-bold text-stone-400 border-t border-stone-100">
                            <span>
                              {completedCount} of {routine.steps.length} {t('completed')}
                            </span>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-black text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>{t('Browse Pre-Built Routine Templates Library')} ➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
