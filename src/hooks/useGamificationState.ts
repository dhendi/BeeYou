import { useState } from 'react';
import {
  EarnedRoutineSticker,
  LifeAdventure,
  LifeSkill,
  DailyHabit,
  SocialStory,
  EmotionRecord,
  EmotionType,
  Routine,
} from '../types';
import {
  DEFAULT_ADVENTURES,
  DEFAULT_SKILLS,
  DEFAULT_DAILY_HABITS,
  DEFAULT_SOCIAL_STORIES,
} from '../data/defaultData';
import { getStickerForRoutine } from '../data/rewardsData';
import { playChime } from '../utils/audio';
import { syncChildStatusToCaregiver } from '../services/caregiverSync';

interface UseGamificationStateProps {
  childName: string;
  isPremium: boolean;
  soundEffects: boolean;
  triggerUpgrade: (reason?: string) => void;
  speak: (text: string) => Promise<void>;
}

export function useGamificationState({
  childName,
  isPremium,
  soundEffects,
  triggerUpgrade,
  speak,
}: UseGamificationStateProps) {
  const [adventures, setAdventures] = useState<LifeAdventure[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_adventures');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ADVENTURES;
  });
  const [skills, setSkills] = useState<LifeSkill[]>(DEFAULT_SKILLS);
  const [habits, setHabits] = useState<DailyHabit[]>(DEFAULT_DAILY_HABITS);
  const [socialStories, setSocialStories] = useState<SocialStory[]>(DEFAULT_SOCIAL_STORIES);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [currentMood, setCurrentMood] = useState<EmotionType | null>('happy');

  const [earnedStickers, setEarnedStickers] = useState<EarnedRoutineSticker[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_earned_routine_stickers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [newlyAwardedSticker, setNewlyAwardedSticker] = useState<EarnedRoutineSticker | null>(null);

  const awardStars = (_amount: number) => {
    // Star coins economy removed per user request
  };

  const awardRoutineSticker = (routine: Routine): EarnedRoutineSticker => {
    const stickerDef = getStickerForRoutine(routine);
    const dateFormatted = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const newSticker: EarnedRoutineSticker = {
      id: `stk-${routine.id}-${Date.now()}`,
      routineId: routine.id,
      routineTitle: routine.title,
      stickerName: stickerDef.stickerName,
      emoji: stickerDef.emoji,
      description: stickerDef.description,
      earnedAt: dateFormatted,
      starsAwarded: stickerDef.starsAward,
    };

    setEarnedStickers((prev) => {
      const updated = [newSticker, ...prev.filter((s) => s.routineId !== routine.id).slice(0, 49)];
      try {
        localStorage.setItem('beeyou_earned_routine_stickers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setNewlyAwardedSticker(newSticker);

    if (soundEffects) {
      playChime('complete');
    }

    speak(
      `Awesome job, ${childName}! You finished ${routine.title} and earned the ${stickerDef.stickerName} sticker!`
    );

    return newSticker;
  };

  const dismissStickerCelebration = () => {
    setNewlyAwardedSticker(null);
  };

  const addAdventure = (adventure: Omit<LifeAdventure, 'id'>) => {
    const newAdv: LifeAdventure = {
      id: `adv-${Date.now()}`,
      ...adventure,
      isCustom: true,
    };
    setAdventures((prev) => {
      const updated = [...prev, newAdv];
      try {
        localStorage.setItem('beeyou_adventures', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (soundEffects) playChime('star');
  };

  const updateAdventure = (adventure: LifeAdventure) => {
    setAdventures((prev) => {
      const updated = prev.map((a) => (a.id === adventure.id ? adventure : a));
      try {
        localStorage.setItem('beeyou_adventures', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (soundEffects) playChime('tap');
  };

  const deleteAdventure = (id: string) => {
    setAdventures((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('beeyou_adventures', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (soundEffects) playChime('clear');
  };

  const completeAdventure = (id: string) => {
    if (soundEffects) playChime('complete');
    setAdventures((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, completedCount: (a.completedCount || 0) + 1 } : a
      );
      try {
        localStorage.setItem('beeyou_adventures', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleSkillStep = (skillId: string, stepId: number) => {
    if (soundEffects) playChime('tap');
    setSkills((prev) =>
      prev.map((sk) => {
        if (sk.id !== skillId) return sk;
        const newSteps = sk.steps.map((st) =>
          st.id === stepId ? { ...st, completed: !st.completed } : st
        );
        const allDone = newSteps.length > 0 && newSteps.every((st) => st.completed);
        if (allDone) {
          completeSkill(skillId);
        }
        return { ...sk, steps: newSteps };
      })
    );
  };

  const completeSkill = (skillId: string) => {
    if (soundEffects) playChime('complete');
    setSkills((prev) =>
      prev.map((sk) =>
        sk.id === skillId
          ? {
              ...sk,
              completedTimes: sk.completedTimes + 1,
              steps: sk.steps.map((st) => ({ ...st, completed: true })),
            }
          : sk
      )
    );
  };

  const resetSkill = (skillId: string) => {
    if (soundEffects) playChime('clear');
    setSkills((prev) =>
      prev.map((sk) =>
        sk.id === skillId
          ? { ...sk, steps: sk.steps.map((st) => ({ ...st, completed: false })) }
          : sk
      )
    );
  };

  const addSkill = (skill: Omit<LifeSkill, 'id'>) => {
    const newSk: LifeSkill = {
      id: `skill-${Date.now()}`,
      ...skill,
      completedTimes: 0,
    };
    setSkills((prev) => [...prev, newSk]);
    if (soundEffects) playChime('star');
  };

  const updateSkill = (skill: LifeSkill) => {
    setSkills((prev) => prev.map((s) => (s.id === skill.id ? skill : s)));
  };

  const toggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !h.completedToday;
          if (nextCompleted) {
            if (soundEffects) playChime('complete');
            speak(`Great job! ${h.title}. ${h.encouragement}`);
          } else {
            if (soundEffects) playChime('tap');
          }

          const target = h.targetTimesPerDay || 1;
          return {
            ...h,
            completedToday: nextCompleted,
            timesCompletedToday: nextCompleted ? target : 0,
            streakDays: nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1),
            lastCompletedDate: nextCompleted ? new Date().toDateString() : h.lastCompletedDate,
          };
        }
        return h;
      })
    );
  };

  const incrementHabitCount = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const currentTimes = h.timesCompletedToday || 0;
          const target = h.targetTimesPerDay || 1;
          const nextTimes = currentTimes + 1;
          const nowCompleted = nextTimes >= target;

          if (soundEffects) playChime('complete');

          if (nowCompleted && !h.completedToday) {
            speak(`Super! Finished ${h.title} for today! ${h.encouragement}`);
          } else {
            speak(`${h.title}: ${nextTimes} of ${target}`);
          }

          return {
            ...h,
            timesCompletedToday: nextTimes,
            completedToday: nowCompleted,
            streakDays: nowCompleted && !h.completedToday ? h.streakDays + 1 : h.streakDays,
            lastCompletedDate: nowCompleted ? new Date().toDateString() : h.lastCompletedDate,
          };
        }
        return h;
      })
    );
  };

  const addHabit = (habit: Omit<DailyHabit, 'id' | 'completedToday' | 'streakDays'>) => {
    const newH: DailyHabit = {
      id: `habit-${Date.now()}`,
      ...habit,
      completedToday: false,
      streakDays: 0,
      timesCompletedToday: 0,
      isCustom: true,
    };
    setHabits((prev) => [...prev, newH]);
    if (soundEffects) playChime('star');
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (soundEffects) playChime('clear');
  };

  const recordEmotion = (emotion: EmotionType, reason?: string, need?: string) => {
    setCurrentMood(emotion);
    syncChildStatusToCaregiver({
      childName: childName || 'Leo',
      currentMood: emotion,
      currentMoodReason: reason,
      currentMoodNeed: need,
      quickAlert: need ? `Needs support: ${need}` : undefined,
    });
    const newRec: EmotionRecord = {
      id: `emo-${Date.now()}`,
      timestamp: Date.now(),
      emotion,
      reason,
      need,
    };
    setEmotionHistory((prev) => [newRec, ...prev.slice(0, 50)]);
    if (soundEffects) playChime('tap');
  };

  const addSocialStory = (story: Omit<SocialStory, 'id'>) => {
    const newStory: SocialStory = {
      id: `story-${Date.now()}`,
      ...story,
      isCustom: true,
    };
    setSocialStories((prev) => [...prev, newStory]);
    if (soundEffects) playChime('star');
  };

  return {
    awardStars,

    earnedStickers,
    setEarnedStickers,
    newlyAwardedSticker,
    awardRoutineSticker,
    dismissStickerCelebration,

    adventures,
    setAdventures,
    addAdventure,
    updateAdventure,
    deleteAdventure,
    completeAdventure,

    skills,
    setSkills,
    toggleSkillStep,
    completeSkill,
    resetSkill,
    addSkill,
    updateSkill,

    habits,
    setHabits,
    toggleHabit,
    incrementHabitCount,
    addHabit,
    deleteHabit,

    socialStories,
    setSocialStories,
    addSocialStory,

    emotionHistory,
    setEmotionHistory,
    currentMood,
    setCurrentMood,
    recordEmotion,
  };
}
