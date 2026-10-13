import { useState, useEffect } from 'react';
import { Routine, PlansChangedState } from '../types';
import { DEFAULT_ROUTINES, DEFAULT_PLANS_CHANGED } from '../data/defaultData';
import { playChime } from '../utils/audio';
import { pushFamilyStateUpdate } from '../services/familySync';

interface UseRoutinesScheduleProps {
  soundEffects: boolean;
}

export function useRoutinesSchedule({ soundEffects }: UseRoutinesScheduleProps) {
  const [showMyDayGuideModal, setShowMyDayGuideModal] = useState<boolean>(false);
  const [showPlansChangedModal, setShowPlansChangedModal] = useState<boolean>(false);
  const [showMorningBrief, setShowMorningBrief] = useState<boolean>(false);

  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_routines');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // PURGE legacy 20-step routine
          parsed = parsed.filter(
            (r: Routine) => r.id !== 'routine-school-full' && (r.steps?.length || 0) < 18
          );
          const merged = [...parsed];
          for (const def of DEFAULT_ROUTINES) {
            if (!merged.some((r) => r.id === def.id)) {
              merged.push(def);
            }
          }
          const healed = merged.map((r: Routine) => {
            const def = DEFAULT_ROUTINES.find((d) => d.id === r.id);
            const assignedDays =
              r.assignedDays && r.assignedDays.length > 0
                ? r.assignedDays
                : def?.assignedDays || [0, 1, 2, 3, 4, 5, 6];
            if (!r.steps || r.steps.length === 0) {
              const fallbackSteps = def?.steps || DEFAULT_ROUTINES[0].steps;
              return {
                ...r,
                assignedDays,
                steps: fallbackSteps,
                firstThen: r.firstThen || def?.firstThen,
              };
            }
            return { ...r, assignedDays };
          });
          try {
            localStorage.setItem('beeyou_routines', JSON.stringify(healed));
          } catch {}
          return healed;
        }
      }
    } catch {}
    return DEFAULT_ROUTINES;
  });

  const [plansChanged, setPlansChanged] = useState<PlansChangedState>(DEFAULT_PLANS_CHANGED);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_routines', JSON.stringify(routines));
    } catch {}
  }, [routines]);

  const toggleRoutineStep = (routineId: string, stepId: string) => {
    if (soundEffects) playChime('tap');
    setRoutines((prev) => {
      const routineIndex = prev.findIndex(
        (r) => r.id === routineId || r.title.toLowerCase() === routineId.toLowerCase()
      );
      if (routineIndex === -1) return prev;

      const targetRoutine = prev[routineIndex];
      let currentSteps = targetRoutine.steps || [];

      if (currentSteps.length === 0) {
        const def =
          DEFAULT_ROUTINES.find(
            (d) =>
              d.id === targetRoutine.id ||
              d.title.toLowerCase() === targetRoutine.title.toLowerCase()
          ) || DEFAULT_ROUTINES[0];
        currentSteps = def
          ? def.steps.map((st, i) => ({
              ...st,
              id: `step-${targetRoutine.id}-${i}`,
              completed: false,
            }))
          : [];
      }

      // Step 1: Exact match on s.id
      let targetIndex = currentSteps.findIndex((s) => s.id === stepId);

      // Step 2: Match on step title
      if (targetIndex === -1) {
        targetIndex = currentSteps.findIndex(
          (s) => s.title.toLowerCase() === stepId.toLowerCase()
        );
      }

      // Step 3: Match on exact numeric index string (e.g. "0", "1", "2")
      if (targetIndex === -1 && /^\d+$/.test(stepId)) {
        const num = parseInt(stepId, 10);
        if (num >= 0 && num < currentSteps.length) {
          targetIndex = num;
        }
      }

      // Step 4: Match trailing -N index (e.g. "step-0", "st-0")
      if (targetIndex === -1) {
        const trailingMatch = stepId.match(/-(\d+)$/);
        if (trailingMatch) {
          const num = parseInt(trailingMatch[1], 10);
          if (num >= 0 && num < currentSteps.length) {
            targetIndex = num;
          }
        }
      }

      if (targetIndex === -1) return prev;

      const newSteps = currentSteps.map((s, idx) =>
        idx === targetIndex ? { ...s, completed: !s.completed } : s
      );

      const updatedRoutine = { ...targetRoutine, steps: newSteps };
      const nextRoutines = [...prev];
      nextRoutines[routineIndex] = updatedRoutine;

      try {
        localStorage.setItem('beeyou_routines', JSON.stringify(nextRoutines));
      } catch {}

      const wasAllCompleted = currentSteps.length > 0 && currentSteps.every((s) => s.completed);
      const isNowAllCompleted = newSteps.length > 0 && newSteps.every((s) => s.completed);
      if (isNowAllCompleted && !wasAllCompleted && soundEffects) {
        playChime('complete');
      }

      return nextRoutines;
    });
  };

  const resetRoutine = (routineId: string) => {
    if (soundEffects) playChime('clear');
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routineId
          ? {
              ...r,
              steps: r.steps.map((s) => ({ ...s, completed: false })),
              firstThen: r.firstThen
                ? { ...r.firstThen, completedFirst: false, completedThen: false }
                : undefined,
            }
          : r
      )
    );
  };

  const addRoutine = (routine: Omit<Routine, 'id'> & { id?: string }): Routine => {
    const newR: Routine = {
      id: routine.id || `routine-${Date.now()}`,
      assignedDays:
        routine.assignedDays && routine.assignedDays.length > 0
          ? routine.assignedDays
          : [0, 1, 2, 3, 4, 5, 6],
      ...routine,
    };
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === newR.id);
      const updated = exists ? prev.map((r) => (r.id === newR.id ? newR : r)) : [...prev, newR];
      try {
        localStorage.setItem('beeyou_routines', JSON.stringify(updated));
      } catch {}
      pushFamilyStateUpdate({ routines: updated });
      return updated;
    });
    if (soundEffects) playChime('star');
    return newR;
  };

  const updateRoutine = (routine: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      const updated = exists
        ? prev.map((r) => (r.id === routine.id ? routine : r))
        : [...prev, routine];
      try {
        localStorage.setItem('beeyou_routines', JSON.stringify(updated));
      } catch {}
      pushFamilyStateUpdate({ routines: updated });
      return updated;
    });
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('beeyou_routines', JSON.stringify(updated));
      } catch {}
      pushFamilyStateUpdate({ routines: updated });
      return updated;
    });
  };

  const toggleFirstThen = (routineId: string, part: 'first' | 'then') => {
    if (soundEffects) playChime('tap');
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId || !r.firstThen) return r;
        const updated = { ...r.firstThen };
        if (part === 'first') updated.completedFirst = !updated.completedFirst;
        if (part === 'then') updated.completedThen = !updated.completedThen;
        if (updated.completedFirst && updated.completedThen) {
          if (soundEffects) playChime('complete');
        }
        return { ...r, firstThen: updated };
      })
    );
  };

  const applyPlansChangedToRoutine = (data?: Partial<PlansChangedState>) => {
    const target = data ? { ...plansChanged, ...data } : plansChanged;
    if (!target.newSteps || target.newSteps.length === 0) return;

    const newRoutineId = 'routine-plans-changed';
    const updatedPlanRoutine: Routine = {
      id: newRoutineId,
      title: `✨ New Plan: ${target.newPlanTitle || 'Updated Schedule'}`,
      category: 'special',
      emoji: '✨',
      time: target.newSteps[0]?.time || 'Now',
      firstThen: {
        first: target.newSteps[0]?.title || 'First step',
        firstEmoji: target.newSteps[0]?.emoji || '✨',
        then: target.newSteps[1]?.title || 'Next step',
        thenEmoji: target.newSteps[1]?.emoji || '✨',
        completedFirst: false,
        completedThen: false,
      },
      steps: target.newSteps.map((step, idx) => ({
        id: `pc-step-${idx}-${Date.now()}`,
        title: step.title,
        instruction: `Step ${idx + 1} of our updated plan`,
        durationMin: 15,
        completed: false,
        emoji: step.emoji || '✨',
        time: step.time,
      })),
    };

    setRoutines((prev) => {
      const idx = prev.findIndex((r) => r.id === newRoutineId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedPlanRoutine;
        return copy;
      }
      return [updatedPlanRoutine, ...prev];
    });

    if (soundEffects) playChime('complete');
  };

  const activatePlansChanged = (data: Partial<PlansChangedState>) => {
    const nextState = {
      ...plansChanged,
      ...data,
      active: true,
    };
    setPlansChanged(nextState);
    applyPlansChangedToRoutine(nextState);
    setShowPlansChangedModal(true);
    if (soundEffects) playChime('tap');
  };

  const dismissPlansChanged = () => {
    setPlansChanged((prev) => ({ ...prev, active: false }));
    setShowPlansChangedModal(false);
  };

  return {
    routines,
    setRoutines,
    plansChanged,
    setPlansChanged,
    showMyDayGuideModal,
    setShowMyDayGuideModal,
    showPlansChangedModal,
    setShowPlansChangedModal,
    showMorningBrief,
    setShowMorningBrief,
    toggleRoutineStep,
    resetRoutine,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleFirstThen,
    applyPlansChangedToRoutine,
    activatePlansChanged,
    dismissPlansChanged,
  };
}
