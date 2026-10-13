import { useState, useEffect } from 'react';
import { CycleSettings, CycleDailyLog, CyclePhase } from '../types';
import { INITIAL_CYCLE_SETTINGS, INITIAL_CYCLE_LOGS } from '../data/defaultData';
import { playChime } from '../utils/audio';

interface UseCycleTrackerStateProps {
  soundEffects: boolean;
  announce: (text: string) => void;
}

export function useCycleTrackerState({ soundEffects, announce }: UseCycleTrackerStateProps) {
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(() => {
    try {
      const saved = localStorage.getItem('beeyou_cycle_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse beeyou_cycle_settings:', e);
    }
    return INITIAL_CYCLE_SETTINGS;
  });

  const [cycleLogs, setCycleLogs] = useState<CycleDailyLog[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_cycle_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse beeyou_cycle_logs:', e);
    }
    return INITIAL_CYCLE_LOGS;
  });

  const [showCycleTrackerModal, setShowCycleTrackerModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_cycle_settings', JSON.stringify(cycleSettings));
    } catch (e) {}
  }, [cycleSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_cycle_logs', JSON.stringify(cycleLogs));
    } catch (e) {}
  }, [cycleLogs]);

  const updateCycleSettings = (updates: Partial<CycleSettings>) => {
    setCycleSettings((prev) => ({ ...prev, ...updates }));
    if (soundEffects) playChime('tap');
  };

  const logCycleDay = (logData: Omit<CycleDailyLog, 'id'>) => {
    setCycleLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === logData.date);
      const newEntry: CycleDailyLog = {
        ...logData,
        id: existingIdx !== -1 ? prev[existingIdx].id : `clog-${Date.now()}`,
      };
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = newEntry;
        return copy;
      }
      return [newEntry, ...prev];
    });

    if (logData.flow && logData.flow !== 'none' && logData.flow !== 'spotting') {
      const logDate = new Date(logData.date).getTime();
      const lastStart = new Date(cycleSettings.lastPeriodStartDate).getTime();
      if (logDate > lastStart + 15 * 86400000) {
        setCycleSettings((prev) => ({ ...prev, lastPeriodStartDate: logData.date }));
      }
    }
    if (soundEffects) playChime('star');
    announce('Cycle log recorded.');
  };

  const deleteCycleLog = (id: string) => {
    setCycleLogs((prev) => prev.filter((l) => l.id !== id));
    if (soundEffects) playChime('clear');
  };

  const getCyclePhaseInfo = () => {
    const startDate = new Date(
      cycleSettings.lastPeriodStartDate || new Date().toISOString().split('T')[0]
    );
    const today = new Date();
    const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.max(0, Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24)));

    const cycleLen = Math.max(20, cycleSettings.averageCycleLength || 28);
    const periodLen = Math.max(2, cycleSettings.averagePeriodLength || 5);

    const currentCycleDay = (diffDays % cycleLen) + 1;
    const isPeriodToday = currentCycleDay <= periodLen;

    let currentPhase: CyclePhase = 'follicular';
    let phaseLabel = 'Follicular Phase';
    let phaseDescription =
      'Estrogen is steadily rising as follicle matures. Energy, focus, and verbal recall increase.';
    let sensoryInsight =
      'Executive function and dopamine are often higher now. Great time for learning new topics or social connection.';

    if (currentCycleDay <= periodLen) {
      currentPhase = 'menstrual';
      phaseLabel = 'Menstrual Phase (Rest & Reset)';
      phaseDescription =
        'Hormone levels (estrogen & progesterone) are at their baseline. Your body is resetting.';
      sensoryInsight =
        'Energy may feel lower today. Extra rest, warm tea, weighted blankets, and quiet dim spaces help your nervous system regulate.';
    } else if (currentCycleDay < cycleLen - 14) {
      currentPhase = 'follicular';
      phaseLabel = 'Follicular Phase (Rising Energy)';
      phaseDescription =
        'Estrogen rises towards peak. Creativity, social curiosity, and cognitive stamina build.';
      sensoryInsight =
        'Sensory processing is generally resilient. Ideal window for trying new activities or tackling challenging tasks.';
    } else if (currentCycleDay <= cycleLen - 12) {
      currentPhase = 'ovulatory';
      phaseLabel = 'Ovulatory Phase (Peak Vitality)';
      phaseDescription = 'Peak estrogen and brief testosterone peak around mid-cycle.';
      sensoryInsight =
        'Communication and motivation are at their highest monthly level. Stay mindful not to overcommit if social battery drains.';
    } else {
      currentPhase = 'luteal';
      phaseLabel = 'Luteal Phase (Inward Focus & Sensory Watch)';
      phaseDescription = 'Progesterone rises then drops before menstruation.';
      sensoryInsight =
        'Neurodivergent individuals often experience sensory amplification, rejection sensitivity, and lower dopamine during the luteal phase. Keep noise-cancelling headphones nearby and reduce demanding masking.';
    }

    const daysUntilNextPeriod = cycleLen - currentCycleDay + 1;
    const nextPeriodDateObj = new Date(today.getTime() + daysUntilNextPeriod * 86400000);
    const nextPeriodDate = nextPeriodDateObj.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });

    return {
      currentCycleDay,
      currentPhase,
      phaseLabel,
      phaseDescription,
      sensoryInsight,
      daysUntilNextPeriod,
      nextPeriodDate,
      isPeriodToday,
    };
  };

  return {
    cycleSettings,
    setCycleSettings,
    cycleLogs,
    showCycleTrackerModal,
    setShowCycleTrackerModal,
    updateCycleSettings,
    logCycleDay,
    deleteCycleLog,
    getCyclePhaseInfo,
  };
}
