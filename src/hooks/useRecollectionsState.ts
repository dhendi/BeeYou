import { useState, useEffect } from 'react';
import { DailyRecollectionEntry, EmotionType } from '../types';
import { INITIAL_DAILY_RECOLLECTIONS } from '../data/recollectionData';
import { playChime } from '../utils/audio';
import { syncChildStatusToCaregiver } from '../services/caregiverSync';

interface UseRecollectionsStateProps {
  soundEffects: boolean;
  childName: string;
  recordEmotion: (emotion: EmotionType, reason?: string, need?: string) => void;
  awardStars?: (amount: number) => void;
  speak: (text: string) => Promise<void>;
}

const MOCK_REC_IDS = new Set(['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'rec-6']);

export function useRecollectionsState({
  soundEffects,
  childName,
  recordEmotion,
  speak,
}: UseRecollectionsStateProps) {
  const [dailyRecollections, setDailyRecollections] = useState<DailyRecollectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_daily_recollections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly filter out any mock/seed records that the user did not create
          const clean = parsed.filter((item: any) => item && item.id && !MOCK_REC_IDS.has(item.id));
          if (clean.length !== parsed.length) {
            localStorage.setItem('beeyou_daily_recollections', JSON.stringify(clean));
          }
          return clean;
        }
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
    const noteText = entry.additionalNotes || (entry as any).notes;
    const newEntry: DailyRecollectionEntry = {
      ...entry,
      id: `rec-${Date.now()}`,
      timestamp: Date.now(),
      notes: noteText,
      additionalNotes: noteText,
      starsAwarded: entry.starsAwarded ?? 3,
    };

    setDailyRecollections((prev) => {
      const updated = [newEntry, ...prev.filter((p) => p.date !== newEntry.date)];
      try {
        localStorage.setItem('beeyou_daily_recollections', JSON.stringify(updated));
      } catch {}
      syncChildStatusToCaregiver({ dailyRecollections: updated }).catch(() => {});
      return updated;
    });

    recordEmotion(
      newEntry.primaryFeeling,
      `Day Recollection: ${newEntry.overallDay}`,
      noteText
    );

    if (soundEffects) {
      playChime('complete');
    }

    speak(`Wonderful reflection, ${childName}! Great job reflecting on your day.`);
  };

  const updateDailyRecollection = (id: string, updates: Partial<DailyRecollectionEntry>) => {
    setDailyRecollections((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      try {
        localStorage.setItem('beeyou_daily_recollections', JSON.stringify(updated));
      } catch {}
      syncChildStatusToCaregiver({ dailyRecollections: updated }).catch(() => {});
      return updated;
    });
  };

  const deleteDailyRecollection = (id: string) => {
    setDailyRecollections((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('beeyou_daily_recollections', JSON.stringify(updated));
      } catch {}
      syncChildStatusToCaregiver({ dailyRecollections: updated }).catch(() => {});
      return updated;
    });
    if (soundEffects) playChime('clear');
  };

  const clearAllDailyRecollections = () => {
    setDailyRecollections([]);
    try {
      localStorage.removeItem('beeyou_daily_recollections');
    } catch {}
    syncChildStatusToCaregiver({ dailyRecollections: [] }).catch(() => {});
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
    clearAllDailyRecollections,
  };
}
