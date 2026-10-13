import { useState, useEffect } from 'react';
import {
  EmergencySensorySettings,
  FivePointScaleSettings,
  FivePointLevelConfig,
  DecisionWheelConfig,
  DecisionWheelOption,
  CommunicationPassport,
  SpoonBudgetEntry,
} from '../types';
import { playChime } from '../utils/audio';
import { sendEmergencySafeModeEvent } from '../services/caregiverSync';

interface UseSensoryToolsStateProps {
  childName: string;
  soundEffects: boolean;
}

const DEFAULT_FIVE_POINT_LEVELS: FivePointLevelConfig[] = [
  {
    level: 1,
    label: 'Calm & Happy',
    emoji: '😊',
    color: 'bg-green-400',
    textColor: 'text-green-900',
    bodyFeelings: 'Body feels relaxed. Breathing is slow and easy. Muscles are loose.',
    actions: [{ label: 'Keep going!', emoji: '⭐' }, { label: 'Share something nice', emoji: '💬' }],
  },
  {
    level: 2,
    label: 'Okay / A Little Wiggly',
    emoji: '🙂',
    color: 'bg-lime-400',
    textColor: 'text-lime-900',
    bodyFeelings: 'A tiny bit excited or distracted. Body is mostly comfortable.',
    actions: [{ label: 'Take 2 deep breaths', emoji: '🌬️' }, { label: 'Wiggle your fingers', emoji: '🖐️' }],
  },
  {
    level: 3,
    label: 'Medium / Uneasy',
    emoji: '😐',
    color: 'bg-yellow-400',
    textColor: 'text-yellow-900',
    bodyFeelings: 'Heart might beat faster. Feeling tense, anxious, or frustrated.',
    actions: [{ label: 'Try box breathing', emoji: '📦' }, { label: 'Squeeze a fidget', emoji: '🧸' }],
  },
  {
    level: 4,
    label: 'Very Upset',
    emoji: '😟',
    color: 'bg-orange-400',
    textColor: 'text-orange-900',
    bodyFeelings: 'Lots of tension. Might want to yell or run away. Hard to think clearly.',
    actions: [{ label: 'Go to quiet space', emoji: '🤫' }, { label: 'Use Coping Toolkit', emoji: '🎧' }],
  },
  {
    level: 5,
    label: 'Completely Overwhelmed',
    emoji: '🌋',
    color: 'bg-red-500',
    textColor: 'text-red-100',
    bodyFeelings: "Out of control. Very hard to listen or stop. Body may feel like it's going to explode.",
    actions: [{ label: 'Press Emergency Button', emoji: '🚨' }, { label: 'Ask for help now', emoji: '🆘' }],
  },
];

const DEFAULT_WHEEL_OPTIONS: DecisionWheelOption[] = [
  { id: 'opt-1', label: 'Watch a Movie', emoji: '🎬', color: '#818cf8' },
  { id: 'opt-2', label: 'Play Outside', emoji: '⚽', color: '#34d399' },
  { id: 'opt-3', label: 'Draw or Paint', emoji: '🎨', color: '#fb923c' },
  { id: 'opt-4', label: 'Read a Book', emoji: '📚', color: '#60a5fa' },
  { id: 'opt-5', label: 'Build with Legos', emoji: '🧱', color: '#f87171' },
  { id: 'opt-6', label: 'Listen to Music', emoji: '🎵', color: '#a78bfa' },
];

export function useSensoryToolsState({ childName, soundEffects }: UseSensoryToolsStateProps) {
  // 1. Emergency Sensory Mode
  const [emergencyMode, setEmergencyModeState] = useState<EmergencySensorySettings>(() => {
    try {
      const saved = localStorage.getItem('beeyou_emergency_mode');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isActive: false,
      preferredSoundscape: 'brown_noise',
      preferredSoundscapeVolume: 0.06,
      pingCaregiverOnActivate: true,
    };
  });
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_emergency_mode', JSON.stringify(emergencyMode));
    } catch (e) {}
  }, [emergencyMode]);

  const setEmergencyMode = (val: Partial<EmergencySensorySettings>) => {
    setEmergencyModeState((prev) => ({ ...prev, ...val }));
  };

  // Sensory Safe Mode
  const [isSafeModeActive, setIsSafeModeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('beeyou_safe_mode_active') === 'true';
    } catch {
      return false;
    }
  });

  const activateSafeMode = () => {
    const timestamp = new Date().toISOString();
    setIsSafeModeActive(true);
    try {
      localStorage.setItem('beeyou_safe_mode_active', 'true');
    } catch {}

    sendEmergencySafeModeEvent({
      childName: childName || 'Leo',
      activatedAt: timestamp,
      reason: 'Sensory Safe Mode Activated (Overload Shield)',
    }).catch((err) => {
      console.warn('Failed to send silent safe mode event:', err);
    });
  };

  const deactivateSafeMode = () => {
    setIsSafeModeActive(false);
    try {
      localStorage.removeItem('beeyou_safe_mode_active');
    } catch {}
    if (soundEffects) playChime('complete');
  };

  const activateEmergencyMode = () => {
    setEmergencyModeState((prev) => ({ ...prev, isActive: true, activatedAt: new Date().toISOString() }));
    setShowEmergencyModal(true);
    if (soundEffects) playChime('clear');
  };

  const deactivateEmergencyMode = () => {
    setEmergencyModeState((prev) => ({ ...prev, isActive: false }));
    setShowEmergencyModal(false);
  };

  // 2. 5-Point Scale
  const [fivePointSettings, setFivePointSettings] = useState<FivePointScaleSettings>(() => {
    try {
      const saved = localStorage.getItem('beeyou_five_point');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.levels)) {
          parsed.levels = parsed.levels.map((l: FivePointLevelConfig, idx: number) => {
            const def = DEFAULT_FIVE_POINT_LEVELS[idx] || DEFAULT_FIVE_POINT_LEVELS[0];
            const isCorrupted = !l.emoji || l.emoji.includes('\u00f0') || l.emoji.includes('dY');
            const cleanEmoji = isCorrupted ? def.emoji : l.emoji;
            const cleanActions = (l.actions || def.actions).map((act, aIdx) => {
              const defAct = def.actions[aIdx] || { label: act.label, emoji: '⭐' };
              const actCorrupted = !act.emoji || act.emoji.includes('\u00f0') || act.emoji.includes('dY');
              return {
                label: act.label || defAct.label,
                emoji: actCorrupted ? defAct.emoji : act.emoji,
              };
            });
            return {
              ...l,
              emoji: cleanEmoji,
              actions: cleanActions,
            };
          });
          return parsed;
        }
      }
    } catch (e) {}
    return { levels: DEFAULT_FIVE_POINT_LEVELS, showOnChildHome: true };
  });
  const [showFivePointModal, setShowFivePointModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_five_point', JSON.stringify(fivePointSettings));
    } catch (e) {}
  }, [fivePointSettings]);

  const updateFivePointSettings = (updates: Partial<FivePointScaleSettings>) => {
    setFivePointSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateFivePointLevel = (level: number, updates: Partial<FivePointLevelConfig>) => {
    setFivePointSettings((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => (l.level === level ? { ...l, ...updates } : l)),
    }));
  };

  // 3. Decision Wheel
  const [decisionWheelConfig, setDecisionWheelConfig] = useState<DecisionWheelConfig>(() => {
    try {
      const saved = localStorage.getItem('beeyou_decision_wheel');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.options)) {
          parsed.options = parsed.options.map((opt: DecisionWheelOption, idx: number) => {
            const def = DEFAULT_WHEEL_OPTIONS[idx] || DEFAULT_WHEEL_OPTIONS[0];
            const isCorrupted = !opt.emoji || opt.emoji.includes('\u00f0') || opt.emoji.includes('dY');
            return {
              ...opt,
              emoji: isCorrupted ? def.emoji : opt.emoji,
            };
          });
          return parsed;
        }
      }
    } catch (e) {}
    return { options: DEFAULT_WHEEL_OPTIONS };
  });
  const [showDecisionWheelModal, setShowDecisionWheelModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_decision_wheel', JSON.stringify(decisionWheelConfig));
    } catch (e) {}
  }, [decisionWheelConfig]);

  const updateDecisionWheelConfig = (config: Partial<DecisionWheelConfig>) => {
    setDecisionWheelConfig((prev) => ({ ...prev, ...config }));
  };

  // 4. Communication Passport
  const [communicationPassport, setCommunicationPassport] = useState<CommunicationPassport>(() => {
    try {
      const saved = localStorage.getItem('beeyou_passport');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      communicationStyle: 'I use AAC to communicate. Please be patient and give me time to respond.',
      sensoryTriggers: ['loud noises', 'bright lights', 'unexpected changes'],
      whatHelps: ['quiet space', 'visual schedule', 'fidget toy', 'warning before transitions'],
      specialInterests: [],
      comfortItems: [],
      emergencyNote: '',
    };
  });
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_passport', JSON.stringify(communicationPassport));
    } catch (e) {}
  }, [communicationPassport]);

  const updateCommunicationPassport = (updates: Partial<CommunicationPassport>) => {
    setCommunicationPassport((prev) => ({ ...prev, ...updates }));
  };

  // 5. Spoon Theory Budget
  const [spoonEntries, setSpoonEntries] = useState<SpoonBudgetEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_spoon_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [showSpoonModal, setShowSpoonModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_spoon_entries', JSON.stringify(spoonEntries));
    } catch (e) {}
  }, [spoonEntries]);

  const addSpoonEntry = (entry: Omit<SpoonBudgetEntry, 'id'>) => {
    setSpoonEntries((prev) => [{ ...entry, id: `spoon-${Date.now()}` }, ...prev.slice(0, 29)]);
  };

  const updateSpoonEntry = (id: string, updates: Partial<SpoonBudgetEntry>) => {
    setSpoonEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const getTodaySpoonEntry = (): SpoonBudgetEntry | null => {
    const todayStr = new Date().toISOString().split('T')[0];
    return spoonEntries.find((e) => e.date === todayStr) || null;
  };

  // 6. Generic Tool Modal States
  const [showPieTimerModal, setShowPieTimerModal] = useState<boolean>(false);
  const [showFidgetModal, setShowFidgetModal] = useState<boolean>(false);
  const [showToolsHubModal, setShowToolsHubModal] = useState<boolean>(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState<boolean>(false);

  return {
    emergencyMode,
    setEmergencyMode,
    showEmergencyModal,
    setShowEmergencyModal,
    activateEmergencyMode,
    deactivateEmergencyMode,
    isSafeModeActive,
    activateSafeMode,
    deactivateSafeMode,

    fivePointSettings,
    updateFivePointSettings,
    updateFivePointLevel,
    showFivePointModal,
    setShowFivePointModal,

    decisionWheelConfig,
    updateDecisionWheelConfig,
    showDecisionWheelModal,
    setShowDecisionWheelModal,

    communicationPassport,
    updateCommunicationPassport,
    showPassportModal,
    setShowPassportModal,

    spoonEntries,
    addSpoonEntry,
    updateSpoonEntry,
    getTodaySpoonEntry,
    showSpoonModal,
    setShowSpoonModal,

    showPieTimerModal,
    setShowPieTimerModal,
    showFidgetModal,
    setShowFidgetModal,
    showToolsHubModal,
    setShowToolsHubModal,
    showAccessibilityModal,
    setShowAccessibilityModal,
  };
}
