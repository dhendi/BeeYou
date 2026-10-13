import { useState, useEffect } from 'react';
import { DailyRecollectionEntry, EmotionType } from '../types';
import { INITIAL_DAILY_RECOLLECTIONS } from '../data/recollectionData';
import { playChime } from '../utils/audio';

interface UseRecollectionsStateProps {
  soundEffects: boolean;
  childName: string;
  recordEmotion: (emotion: EmotionType, reason?: string, need?: string) => void;
  awardStars: (amount: number) => void;
  speak: (text: string) => Promise<void>;
}

export function useRecollectionsState({
  soundEffects,
  childName,
  recordEmotion,
  awardStars,
  speak,
}: UseRecollectionsStateProps) {
  const [dailyRecollections, setDailyRecollections] = useState<DailyRecollectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_daily_recollections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse beeyou_daily_recollections:', e);
    }
    return INITIAL_DAILY_RECOLLECTIONS;
  });

  const [showRecollectionModal, setShowRecollectionModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_daily_recollections', JSON.stringify(dailyRecollections));
    } catch (e) {}
  }, [dailyRecollections]);

  const addDailyRecollection = (entry: Omit<DailyRecollectionEntry, 'id' | 'timestamp'>) => {
    const newEntry: DailyRecollectionEntry = {
      ...entry,
      id: `rec-${Date.now()}`,
      timestamp: Date.now(),
      starsAwarded: entry.starsAwarded ?? 3,
    };

    setDailyRecollections((prev) => [newEntry, ...prev.filter((p) => p.date !== newEntry.date)]);

    recordEmotion(
      newEntry.primaryFeeling,
      `Day Recollection: ${newEntry.overallDay}`,
      newEntry.additionalNotes
    );

    awardStars(newEntry.starsAwarded || 3);

    if (soundEffects) {
      playChime('star');
      setTimeout(() => playChime('complete'), 350);
    }

    speak(`Wonderful reflection, ${childName}! You earned ${newEntry.starsAwarded || 3} stars.`);
  };

  const updateDailyRecollection = (id: string, updates: Partial<DailyRecollectionEntry>) => {
    setDailyRecollections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteDailyRecollection = (id: string) => {
    setDailyRecollections((prev) => prev.filter((item) => item.id !== id));
    if (soundEffects) playChime('clear');
  };

  return {
    dailyRecollections,
    setDailyRecollections,
    showRecollectionModal,
    setShowRecollectionModal,
    addDailyRecollection,
    updateDailyRecollection,
    deleteDailyRecollection,
  };
}
