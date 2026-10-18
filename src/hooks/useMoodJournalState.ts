import { useState, useEffect } from 'react';
import { MoodJournalEntry } from '../types';
import { INITIAL_MOOD_JOURNAL_ENTRIES } from '../data/defaultData';
import { playChime } from '../utils/audio';

interface UseMoodJournalStateProps {
  soundEffects: boolean;
  announce: (text: string) => void;
}

export function useMoodJournalState({ soundEffects, announce }: UseMoodJournalStateProps) {
  const [moodJournalEntries, setMoodJournalEntries] = useState<MoodJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_mood_journal');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const MOCK_IDS = new Set(['mj-1', 'mj-2']);
          const clean = parsed.filter((item: any) => item && item.id && !MOCK_IDS.has(item.id));
          if (clean.length !== parsed.length) {
            localStorage.setItem('beeyou_mood_journal', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_mood_journal:', e);
    }
    return INITIAL_MOOD_JOURNAL_ENTRIES;
  });

  const [showMoodJournalModal, setShowMoodJournalModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_mood_journal', JSON.stringify(moodJournalEntries));
    } catch (e) {}
  }, [moodJournalEntries]);

  const addMoodJournalEntry = (entry: Omit<MoodJournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodJournalEntry = {
      ...entry,
      id: `mj-${Date.now()}`,
      timestamp: Date.now(),
    };
    setMoodJournalEntries((prev) => [newEntry, ...prev]);
    if (soundEffects) playChime('star');
    announce('Mood journal reflection saved.');
  };

  const updateMoodJournalEntry = (id: string, updates: Partial<MoodJournalEntry>) => {
    setMoodJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    if (soundEffects) playChime('tap');
  };

  const deleteMoodJournalEntry = (id: string) => {
    setMoodJournalEntries((prev) => prev.filter((e) => e.id !== id));
    if (soundEffects) playChime('clear');
  };

  return {
    moodJournalEntries,
    showMoodJournalModal,
    setShowMoodJournalModal,
    addMoodJournalEntry,
    updateMoodJournalEntry,
    deleteMoodJournalEntry,
  };
}
