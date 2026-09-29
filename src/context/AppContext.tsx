import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  AACItem,
  QuickPhrase,
  Routine,
  LifeAdventure,
  LifeSkill,
  DailyHabit,
  SocialStory,
  ChildProfile,
  AppSettings,
  AvatarConfig,
  MyWorldState,
  PlansChangedState,
  EmotionRecord,
  EmotionType,
  CaregiverMessage,
  DailyCheckInEntry,
  EarnedRoutineSticker,
  DailyRecollectionEntry,
  AppTheme,
} from '../types';
import { PRESET_THEMES } from '../data/themesData';
import {
  DEFAULT_AAC_ITEMS,
  DEFAULT_QUICK_PHRASES,
  DEFAULT_ROUTINES,
  DEFAULT_ADVENTURES,
  DEFAULT_SKILLS,
  DEFAULT_DAILY_HABITS,
  DEFAULT_SOCIAL_STORIES,
  INITIAL_CHILD_PROFILE,
  INITIAL_APP_SETTINGS,
  INITIAL_AVATAR,
  INITIAL_WORLD_STATE,
  DEFAULT_PLANS_CHANGED,
  WORLD_ITEMS_CATALOG,
  DEFAULT_DAILY_CHECKINS,
} from '../data/defaultData';
import { getStickerForRoutine } from '../data/rewardsData';
import { INITIAL_DAILY_RECOLLECTIONS } from '../data/recollectionData';

import { 
  speakText, 
  playChime, 
  stopSpeaking as haltSpeaking, 
  subscribeToSpeechState, 
  subscribeToVoiceUpdates,
  getOfflineCapableVoices,
  getBestSystemVoice
} from '../utils/audio';
import { indexOfflineData } from '../utils/offlineStorage';
import { 
  syncChildStatusToCaregiver, 
  pollCaregiverMessages, 
  onCaregiverMessage, 
  getPairingCode 
} from '../services/caregiverSync';

type ChildViewType = 
  | 'home'
  | 'aac'
  | 'my-day'
  | 'adventures'
  | 'skills'
  | 'feelings'
  | 'my-world'
  | 'rewards';

interface AppContextType {
  // Navigation & Views
  childView: ChildViewType;
  setChildView: (view: ChildViewType) => void;
  activeAdventureId: string | null;
  setActiveAdventureId: (id: string | null) => void;
  activeSkillId: string | null;
  setActiveSkillId: (id: string | null) => void;
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;
  isParentMode: boolean;
  setIsParentMode: (val: boolean) => void;
  showPinModal: boolean;
  setShowPinModal: (val: boolean) => void;
  showQuickPhrasesDrawer: boolean;
  setShowQuickPhrasesDrawer: (val: boolean) => void;
  showCopingToolkit: boolean;
  setShowCopingToolkit: (val: boolean) => void;
  showPlansChangedModal: boolean;
  setShowPlansChangedModal: (val: boolean) => void;
  showMorningBrief: boolean;
  setShowMorningBrief: (val: boolean) => void;
  showCaregiverModal: boolean;
  setShowCaregiverModal: (val: boolean) => void;
  showCaregiverAlertModal: boolean;
  setShowCaregiverAlertModal: (val: boolean) => void;
  incomingCaregiverMessage: CaregiverMessage | null;
  dismissIncomingCaregiverMessage: () => void;
  activeContextTopic: string | null;
  setActiveContextTopic: (topic: string | null) => void;

  // TTS & Offline Engine
  isSpeaking: boolean;
  speakingText: string | null;
  isOffline: boolean;
  stopSpeaking: () => void;
  offlineVoices: SpeechSynthesisVoice[];

  // AAC
  aacItems: AACItem[];
  sentence: AACItem[];
  quickPhrases: QuickPhrase[];
  speak: (text: string) => Promise<void>;
  addToSentence: (item: AACItem) => void;
  speakSentence: () => Promise<void>;
  clearSentence: () => void;
  removeLastFromSentence: () => void;
  saveSentenceAsQuickPhrase: () => void;
  addAacItem: (item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string }) => void;
  deleteAacItem: (id: string) => void;
  addQuickPhrase: (phrase: Omit<QuickPhrase, 'id'>) => void;
  deleteQuickPhrase: (id: string) => void;

  // Routines & My Day
  routines: Routine[];
  toggleRoutineStep: (routineId: string, stepId: string) => void;
  resetRoutine: (routineId: string) => void;
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  toggleFirstThen: (routineId: string, part: 'first' | 'then') => void;

  // Plans Changed
  plansChanged: PlansChangedState;
  activatePlansChanged: (data: Partial<PlansChangedState>) => void;
  dismissPlansChanged: () => void;

  // Adventures
  adventures: LifeAdventure[];
  addAdventure: (adventure: Omit<LifeAdventure, 'id'>) => void;
  updateAdventure: (adventure: LifeAdventure) => void;
  completeAdventure: (id: string) => void;

  // Skills
  skills: LifeSkill[];
  toggleSkillStep: (skillId: string, stepId: number) => void;
  completeSkill: (skillId: string) => void;
  resetSkill: (skillId: string) => void;
  addSkill: (skill: Omit<LifeSkill, 'id'>) => void;
  updateSkill: (skill: LifeSkill) => void;

  // Daily Habits
  habits: DailyHabit[];
  toggleHabit: (habitId: string) => void;
  incrementHabitCount: (habitId: string) => void;
  addHabit: (habit: Omit<DailyHabit, 'id' | 'completedToday' | 'streakDays'>) => void;
  deleteHabit: (id: string) => void;

  // Emotions
  emotionHistory: EmotionRecord[];
  currentMood: EmotionType | null;
  recordEmotion: (emotion: EmotionType, reason?: string, need?: string) => void;

  // Social Stories
  socialStories: SocialStory[];
  addSocialStory: (story: Omit<SocialStory, 'id'>) => void;

  // My World & Avatar
  worldState: MyWorldState;
  avatar: AvatarConfig;
  updateAvatar: (avatar: Partial<AvatarConfig>) => void;
  buyWorldItem: (itemId: string) => boolean;
  placeWorldItem: (itemId: string, room: 'bedroom' | 'playroom' | 'yard', x?: number, y?: number) => void;
  removePlacedItem: (placedId: string) => void;
  setCurrentRoom: (room: 'bedroom' | 'playroom' | 'yard') => void;
  awardStars: (amount: number) => void;

  // Profile & Settings
  childProfile: ChildProfile;
  updateChildProfile: (profile: Partial<ChildProfile>) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Digital Routine Stickers & Rewards
  earnedStickers: EarnedRoutineSticker[];
  newlyAwardedSticker: EarnedRoutineSticker | null;
  awardRoutineSticker: (routine: Routine) => EarnedRoutineSticker;
  dismissStickerCelebration: () => void;

  // Daily Mood & Recollection (End-of-Day Journal & Therapist Summary)
  dailyRecollections: DailyRecollectionEntry[];
  showRecollectionModal: boolean;
  setShowRecollectionModal: (val: boolean) => void;
  addDailyRecollection: (entry: Omit<DailyRecollectionEntry, 'id' | 'timestamp'>) => void;
  updateDailyRecollection: (id: string, updates: Partial<DailyRecollectionEntry>) => void;
  deleteDailyRecollection: (id: string) => void;

  // Themes & Customization
  themes: AppTheme[];
  activeThemeId: string;
  activeTheme: AppTheme;
  setTheme: (id: string) => void;
  buyTheme: (themeId: string) => boolean;
  createCustomTheme: (theme: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>) => AppTheme;
  updateCustomTheme: (id: string, updates: Partial<AppTheme>) => void;
  deleteCustomTheme: (id: string) => void;
  showThemeModal: boolean;
  setShowThemeModal: (val: boolean) => void;

  // Utilities
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'lumina_app_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [childView, setChildView] = useState<ChildViewType>('home');
  const [activeAdventureId, setActiveAdventureId] = useState<string | null>(null);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isParentMode, setIsParentMode] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showQuickPhrasesDrawer, setShowQuickPhrasesDrawer] = useState<boolean>(false);
  const [showCopingToolkit, setShowCopingToolkit] = useState<boolean>(false);
  const [showPlansChangedModal, setShowPlansChangedModal] = useState<boolean>(false);
  const [showMorningBrief, setShowMorningBrief] = useState<boolean>(false);
  const [showCaregiverModal, setShowCaregiverModal] = useState<boolean>(false);
  const [showCaregiverAlertModal, setShowCaregiverAlertModal] = useState<boolean>(false);
  const [incomingCaregiverMessage, setIncomingCaregiverMessage] = useState<CaregiverMessage | null>(null);
  const [activeContextTopic, setActiveContextTopic] = useState<string | null>(null);

  const dismissIncomingCaregiverMessage = () => {
    setIncomingCaregiverMessage(null);
  };

  // Daily First Login Check for Morning Brief
  useEffect(() => {
    try {
      const todayStr = new Date().toDateString();
      const lastBriefDate = localStorage.getItem('lumina_last_brief_date');
      if (lastBriefDate !== todayStr) {
        setShowMorningBrief(true);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Core Data States
  const [aacItems, setAacItems] = useState<AACItem[]>(DEFAULT_AAC_ITEMS);
  const [sentence, setSentence] = useState<AACItem[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<QuickPhrase[]>(DEFAULT_QUICK_PHRASES);
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [plansChanged, setPlansChanged] = useState<PlansChangedState>(DEFAULT_PLANS_CHANGED);
  const [adventures, setAdventures] = useState<LifeAdventure[]>(DEFAULT_ADVENTURES);
  const [skills, setSkills] = useState<LifeSkill[]>(DEFAULT_SKILLS);
  const [habits, setHabits] = useState<DailyHabit[]>(DEFAULT_DAILY_HABITS);
  const [socialStories, setSocialStories] = useState<SocialStory[]>(DEFAULT_SOCIAL_STORIES);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [currentMood, setCurrentMood] = useState<EmotionType | null>('happy');
  const [worldState, setWorldState] = useState<MyWorldState>(INITIAL_WORLD_STATE);
  const [avatar, setAvatar] = useState<AvatarConfig>(INITIAL_AVATAR);
  const [childProfile, setChildProfile] = useState<ChildProfile>(INITIAL_CHILD_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);

  // Digital Routine Stickers earned through My Day completions
  const [earnedStickers, setEarnedStickers] = useState<EarnedRoutineSticker[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_earned_routine_stickers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return [
      {
        id: 'sticker-morning-initial',
        routineId: 'routine-morning',
        routineTitle: 'Morning Routine',
        stickerName: 'Morning Superstar',
        emoji: '🌅',
        description: 'Woke up, stretched, brushed teeth, and got ready to shine!',
        earnedAt: 'Today',
        starsAwarded: 3,
      },
    ];
  });

  const [newlyAwardedSticker, setNewlyAwardedSticker] = useState<EarnedRoutineSticker | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_earned_routine_stickers', JSON.stringify(earnedStickers));
    } catch (e) {}
  }, [earnedStickers]);

  // Daily Mood & Recollection (End-of-Day Journal & Therapist Summary)
  const [dailyRecollections, setDailyRecollections] = useState<DailyRecollectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_daily_recollections');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse lumina_daily_recollections:', e);
    }
    return INITIAL_DAILY_RECOLLECTIONS;
  });

  const [showRecollectionModal, setShowRecollectionModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_daily_recollections', JSON.stringify(dailyRecollections));
    } catch (e) {}
  }, [dailyRecollections]);

  // Themes & Customization state
  const [themes, setThemes] = useState<AppTheme[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_themes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customThemes = parsed.filter((p: AppTheme) => p.isCustom);
          const presets = PRESET_THEMES.map((preset) => {
            const found = parsed.find((p: AppTheme) => p.id === preset.id);
            return found ? { ...preset, isUnlocked: found.isUnlocked } : preset;
          });
          return [...presets, ...customThemes];
        }
      }
    } catch (e) {
      console.error('Failed to parse lumina_themes:', e);
    }
    return PRESET_THEMES;
  });

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('lumina_active_theme_id');
      if (saved) return saved;
    } catch (e) {}
    return 'theme-dino'; // Default to dinosaur theme as requested!
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_themes', JSON.stringify(themes));
    } catch (e) {}
  }, [themes]);

  useEffect(() => {
    try {
      localStorage.setItem('lumina_active_theme_id', activeThemeId);
    } catch (e) {}
  }, [activeThemeId]);

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0] || PRESET_THEMES[0];

  const setTheme = (id: string) => {
    const target = themes.find((t) => t.id === id);
    if (target && target.isUnlocked) {
      setActiveThemeId(id);
      if (settings.soundEffects) playChime('star');
      speakText(`Equipped ${target.name} theme!`);
    }
  };

  const buyTheme = (themeId: string): boolean => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return false;
    if (target.isUnlocked) {
      setTheme(themeId);
      return true;
    }
    if (worldState.stars < target.costStars) {
      if (settings.soundEffects) playChime('tap');
      speakText(`Need ${target.costStars - worldState.stars} more stars to unlock ${target.name}!`);
      return false;
    }

    setWorldState((prev) => ({
      ...prev,
      stars: prev.stars - target.costStars,
    }));

    setThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, isUnlocked: true } : t))
    );

    setActiveThemeId(themeId);
    if (settings.soundEffects) playChime('star');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    speakText(`Hooray! You unlocked and equipped the ${target.name} theme!`);
    return true;
  };

  const createCustomTheme = (themeData: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>): AppTheme => {
    const newTheme: AppTheme = {
      ...themeData,
      id: `custom-theme-${Date.now()}`,
      isCustom: true,
      isUnlocked: true,
      costStars: 0,
    };
    setThemes((prev) => [...prev, newTheme]);
    setActiveThemeId(newTheme.id);
    if (settings.soundEffects) playChime('complete');
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    speakText(`Awesome! Created your custom theme ${newTheme.name}!`);
    return newTheme;
  };

  const updateCustomTheme = (id: string, updates: Partial<AppTheme>) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteCustomTheme = (id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
    if (activeThemeId === id) {
      setActiveThemeId('theme-dino');
    }
  };

  // Active Speech & Offline States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [offlineVoices, setOfflineVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const unsubSpeech = subscribeToSpeechState((speaking, text) => {
      setIsSpeaking(speaking);
      setSpeakingText(text);
    });

    const unsubVoices = subscribeToVoiceUpdates((voices) => {
      setOfflineVoices(getOfflineCapableVoices(settings.language));
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineVoices(getOfflineCapableVoices(settings.language));

    return () => {
      unsubSpeech();
      unsubVoices();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.language]);

  // Listen for real-time messages from caregiver and poll periodically
  useEffect(() => {
    const unsubCaregiver = onCaregiverMessage((msg) => {
      setIncomingCaregiverMessage(msg);
      playChime('star');
      speakText(`${msg.senderName} sent you a message: ${msg.text}`);
    });

    const interval = setInterval(() => {
      const code = getPairingCode();
      pollCaregiverMessages(code).then((msgs) => {
        const unread = msgs.find((m) => !m.read);
        if (unread) {
          setIncomingCaregiverMessage(unread);
        }
      });
    }, 8000);

    return () => {
      unsubCaregiver();
      clearInterval(interval);
    };
  }, []);

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.aacItems) setAacItems(parsed.aacItems);
        if (parsed.quickPhrases) setQuickPhrases(parsed.quickPhrases);
        if (parsed.routines) setRoutines(parsed.routines);
        if (parsed.plansChanged) setPlansChanged(parsed.plansChanged);
        if (parsed.adventures) setAdventures(parsed.adventures);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.habits) {
          const todayStr = new Date().toDateString();
          const lastHabitsDate = localStorage.getItem('lumina_last_habits_date');
          if (lastHabitsDate && lastHabitsDate !== todayStr) {
            // Reset daily completion for new day, keeping streak
            setHabits(
              parsed.habits.map((h: DailyHabit) => ({
                ...h,
                completedToday: false,
                timesCompletedToday: 0,
              }))
            );
          } else {
            setHabits(parsed.habits);
          }
        }
        if (parsed.socialStories) setSocialStories(parsed.socialStories);
        if (parsed.emotionHistory) setEmotionHistory(parsed.emotionHistory);
        if (parsed.currentMood) setCurrentMood(parsed.currentMood);
        if (parsed.worldState) setWorldState(parsed.worldState);
        if (parsed.avatar) setAvatar(parsed.avatar);
        if (parsed.childProfile) setChildProfile(parsed.childProfile);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
  }, []);

  // Persist state to localStorage on changes
  useEffect(() => {
    try {
      const stateToSave = {
        aacItems,
        quickPhrases,
        routines,
        plansChanged,
        adventures,
        skills,
        habits,
        socialStories,
        emotionHistory,
        currentMood,
        worldState,
        avatar,
        childProfile,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

      // Dual-index critical offline AAC, schedules, and social stories in IndexedDB & LocalStorage Index
      indexOfflineData({
        aacItems,
        routines,
        socialStories,
        skills,
        habits,
        childName: childProfile.name,
      });

      // Sync live status to caregiver portal
      syncChildStatusToCaregiver({
        childName: childProfile.name,
        currentMood,
        habitsCompletedToday: habits.filter((h) => h.completedToday).length,
        totalHabits: habits.length,
        currentActivity: `In ${childView === 'my-day' ? 'Visual Schedule' : childView === 'aac' ? 'AAC Speech Board' : childView === 'skills' ? 'Life Skills' : childView === 'adventures' ? 'Life Adventures' : childView === 'feelings' ? 'Feelings Check-in' : 'Lumina'}`,
        stars: worldState.stars,
        isOffline,
      });
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    aacItems,
    quickPhrases,
    routines,
    plansChanged,
    adventures,
    skills,
    habits,
    socialStories,
    emotionHistory,
    currentMood,
    worldState,
    avatar,
    childProfile,
    settings,
    childView,
    isOffline,
  ]);

  // Speech Helper
  const speak = async (text: string) => {
    if (settings.soundEffects) playChime('speak');
    await speakText(text, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceURI: settings.selectedVoiceURI,
      voicePersona: settings.voicePersona || 'Kore',
      lang: settings.language,
    });
  };

  const stopSpeaking = () => {
    haltSpeaking();
  };

  // AAC Methods
  const addToSentence = (item: AACItem) => {
    if (settings.soundEffects) playChime('tap');
    setSentence((prev) => [...prev, item]);
    if (settings.autoSpeakSentence) {
      // Speak the tapped item immediately for motor reinforcement
      speak(item.speechText || item.label);
    }
  };

  const speakSentence = async () => {
    if (sentence.length === 0) return;
    const fullText = sentence.map((item) => item.speechText || item.label).join(' ');
    syncChildStatusToCaregiver({
      childName: childProfile.name,
      lastAacSentence: fullText,
      currentMood,
    });
    await speak(fullText);
  };

  const clearSentence = () => {
    if (settings.soundEffects) playChime('clear');
    setSentence([]);
  };

  const removeLastFromSentence = () => {
    if (settings.soundEffects) playChime('tap');
    setSentence((prev) => prev.slice(0, -1));
  };

  const saveSentenceAsQuickPhrase = () => {
    if (sentence.length === 0) return;
    const phraseText = sentence.map((item) => item.speechText || item.label).join(' ');
    const newQP: QuickPhrase = {
      id: `qp-custom-${Date.now()}`,
      text: phraseText,
      emoji: sentence[0]?.emoji || '💬',
      isCustom: true,
    };
    setQuickPhrases((prev) => [newQP, ...prev]);
    if (settings.soundEffects) playChime('star');
  };

  const addAacItem = (item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string }) => {
    const newItem: AACItem = {
      id: item.id || `aac-${Date.now()}`,
      label: item.label,
      speechText: item.speechText || item.label,
      emoji: item.emoji || '✨',
      photoUrl: item.photoUrl,
      category: item.category,
      colorType: item.colorType,
      motorIndex: aacItems.length,
      isCustom: true,
    };
    setAacItems((prev) => [...prev, newItem]);
    if (settings.soundEffects) playChime('star');
  };

  const deleteAacItem = (id: string) => {
    setAacItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuickPhrase = (phrase: Omit<QuickPhrase, 'id'>) => {
    const newQP: QuickPhrase = {
      id: `qp-custom-${Date.now()}`,
      ...phrase,
      isCustom: true,
    };
    setQuickPhrases((prev) => [newQP, ...prev]);
    if (settings.soundEffects) playChime('star');
  };

  const deleteQuickPhrase = (id: string) => {
    setQuickPhrases((prev) => prev.filter((qp) => qp.id !== id));
  };

  // Digital Routine Sticker Reward Methods
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

    setEarnedStickers((prev) => [newSticker, ...prev]);
    awardStars(stickerDef.starsAward);
    setNewlyAwardedSticker(newSticker);

    if (settings.soundEffects) {
      playChime('complete');
      setTimeout(() => playChime('star'), 400);
    }

    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#8b5cf6', '#10b981', '#ec4899'],
      });
    } catch (e) {}

    speakText(
      `Awesome job, ${childProfile.name}! You finished ${routine.title} and earned the ${stickerDef.stickerName} sticker!`
    );

    return newSticker;
  };

  const dismissStickerCelebration = () => {
    setNewlyAwardedSticker(null);
  };

  // Routine Methods
  const toggleRoutineStep = (routineId: string, stepId: string) => {
    if (settings.soundEffects) playChime('tap');
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId) return r;
        const wasAllCompleted = r.steps.length > 0 && r.steps.every((s) => s.completed);
        const newSteps = r.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
        const isNowAllCompleted = newSteps.length > 0 && newSteps.every((s) => s.completed);
        if (isNowAllCompleted && !wasAllCompleted) {
          awardRoutineSticker(r);
        }
        return { ...r, steps: newSteps };
      })
    );
  };

  const resetRoutine = (routineId: string) => {
    if (settings.soundEffects) playChime('clear');
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

  const addRoutine = (routine: Omit<Routine, 'id'>) => {
    const newR: Routine = {
      id: `routine-${Date.now()}`,
      ...routine,
    };
    setRoutines((prev) => [...prev, newR]);
    if (settings.soundEffects) playChime('star');
  };

  const updateRoutine = (routine: Routine) => {
    setRoutines((prev) => prev.map((r) => (r.id === routine.id ? routine : r)));
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleFirstThen = (routineId: string, part: 'first' | 'then') => {
    if (settings.soundEffects) playChime('tap');
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== routineId || !r.firstThen) return r;
        const updated = { ...r.firstThen };
        if (part === 'first') updated.completedFirst = !updated.completedFirst;
        if (part === 'then') updated.completedThen = !updated.completedThen;
        if (updated.completedFirst && updated.completedThen) {
          if (settings.soundEffects) playChime('complete');
          confetti({ particleCount: 35, spread: 50 });
          awardStars(1);
        }
        return { ...r, firstThen: updated };
      })
    );
  };

  // Plans Changed
  const activatePlansChanged = (data: Partial<PlansChangedState>) => {
    setPlansChanged((prev) => ({
      ...prev,
      ...data,
      active: true,
    }));
    setShowPlansChangedModal(true);
    if (settings.soundEffects) playChime('tap');
  };

  const dismissPlansChanged = () => {
    setPlansChanged((prev) => ({ ...prev, active: false }));
    setShowPlansChangedModal(false);
  };

  // Adventures
  const addAdventure = (adventure: Omit<LifeAdventure, 'id'>) => {
    const newAdv: LifeAdventure = {
      id: `adv-${Date.now()}`,
      ...adventure,
      isCustom: true,
    };
    setAdventures((prev) => [...prev, newAdv]);
    if (settings.soundEffects) playChime('star');
  };

  const updateAdventure = (adventure: LifeAdventure) => {
    setAdventures((prev) => prev.map((a) => (a.id === adventure.id ? adventure : a)));
  };

  const completeAdventure = (id: string) => {
    if (settings.soundEffects) playChime('complete');
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    awardStars(3);
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completedCount: (a.completedCount || 0) + 1 } : a
      )
    );
  };

  // Skills
  const toggleSkillStep = (skillId: string, stepId: number) => {
    if (settings.soundEffects) playChime('tap');
    setSkills((prev) =>
      prev.map((sk) => {
        if (sk.id !== skillId) return sk;
        const newSteps = sk.steps.map((st) => (st.id === stepId ? { ...st, completed: !st.completed } : st));
        const allDone = newSteps.length > 0 && newSteps.every((st) => st.completed);
        if (allDone) {
          completeSkill(skillId);
        }
        return { ...sk, steps: newSteps };
      })
    );
  };

  const completeSkill = (skillId: string) => {
    const target = skills.find((s) => s.id === skillId);
    const reward = target?.starsReward || 2;
    if (settings.soundEffects) playChime('star');
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.55 } });
    awardStars(reward);
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
    if (settings.soundEffects) playChime('clear');
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
    if (settings.soundEffects) playChime('star');
  };

  const updateSkill = (skill: LifeSkill) => {
    setSkills((prev) => prev.map((s) => (s.id === skill.id ? skill : s)));
  };

  // Daily Habits Handlers
  const toggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !h.completedToday;
          if (nextCompleted) {
            if (settings.soundEffects) playChime('star');
            awardStars(1);
            try {
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
            } catch (e) {}
            speakText(`Great job! ${h.title}. ${h.encouragement}`);
          } else {
            if (settings.soundEffects) playChime('tap');
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

          if (settings.soundEffects) playChime('star');

          if (nowCompleted && !h.completedToday) {
            awardStars(1);
            try {
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
            } catch (e) {}
            speakText(`Super! Finished ${h.title} for today! ${h.encouragement}`);
          } else {
            speakText(`${h.title}: ${nextTimes} of ${target}`);
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
    if (settings.soundEffects) playChime('star');
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (settings.soundEffects) playChime('clear');
  };

  // Emotions
  const recordEmotion = (emotion: EmotionType, reason?: string, need?: string) => {
    setCurrentMood(emotion);
    syncChildStatusToCaregiver({
      childName: childProfile.name,
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
    if (settings.soundEffects) playChime('tap');
  };

  // Social Stories
  const addSocialStory = (story: Omit<SocialStory, 'id'>) => {
    const newStory: SocialStory = {
      id: `story-${Date.now()}`,
      ...story,
      isCustom: true,
    };
    setSocialStories((prev) => [...prev, newStory]);
    if (settings.soundEffects) playChime('star');
  };

  // World & Avatar
  const updateAvatar = (partial: Partial<AvatarConfig>) => {
    setAvatar((prev) => ({ ...prev, ...partial }));
    if (settings.soundEffects) playChime('tap');
  };

  const awardStars = (amount: number) => {
    setWorldState((prev) => ({ ...prev, stars: prev.stars + amount }));
  };

  const buyWorldItem = (itemId: string): boolean => {
    const item = WORLD_ITEMS_CATALOG.find((i) => i.id === itemId);
    if (!item) return false;
    if (worldState.unlockedItemIds.includes(itemId)) return true;
    if (worldState.stars < item.costStars) return false;

    setWorldState((prev) => ({
      ...prev,
      stars: prev.stars - item.costStars,
      unlockedItemIds: [...prev.unlockedItemIds, itemId],
    }));
    if (settings.soundEffects) playChime('star');
    confetti({ particleCount: 30, spread: 60 });
    return true;
  };

  const placeWorldItem = (
    itemId: string,
    room: 'bedroom' | 'playroom' | 'yard',
    x = 50,
    y = 50
  ) => {
    const newPlaced = {
      id: `placed-${Date.now()}`,
      itemId,
      room,
      x,
      y,
    };
    setWorldState((prev) => ({
      ...prev,
      placedItems: [...prev.placedItems, newPlaced],
    }));
    if (settings.soundEffects) playChime('tap');
  };

  const removePlacedItem = (placedId: string) => {
    setWorldState((prev) => ({
      ...prev,
      placedItems: prev.placedItems.filter((i) => i.id !== placedId),
    }));
  };

  const setCurrentRoom = (room: 'bedroom' | 'playroom' | 'yard') => {
    setWorldState((prev) => ({ ...prev, currentRoom: room }));
    if (settings.soundEffects) playChime('tap');
  };

  // Profile & Settings
  const updateChildProfile = (partial: Partial<ChildProfile>) => {
    setChildProfile((prev) => ({ ...prev, ...partial }));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Daily Mood & Recollection Handlers
  const addDailyRecollection = (entry: Omit<DailyRecollectionEntry, 'id' | 'timestamp'>) => {
    const newEntry: DailyRecollectionEntry = {
      ...entry,
      id: `rec-${Date.now()}`,
      timestamp: Date.now(),
      starsAwarded: entry.starsAwarded ?? 3,
    };

    setDailyRecollections((prev) => [newEntry, ...prev.filter((p) => p.date !== newEntry.date)]);

    // Record in emotion history
    recordEmotion(
      newEntry.primaryFeeling,
      `Day Recollection: ${newEntry.overallDay}`,
      newEntry.additionalNotes
    );

    // Award stars
    awardStars(newEntry.starsAwarded || 3);

    if (settings.soundEffects) {
      playChime('star');
      setTimeout(() => playChime('complete'), 350);
    }

    try {
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    speakText(`Wonderful reflection, ${childProfile.name}! You earned ${newEntry.starsAwarded || 3} stars.`);
  };

  const updateDailyRecollection = (id: string, updates: Partial<DailyRecollectionEntry>) => {
    setDailyRecollections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteDailyRecollection = (id: string) => {
    setDailyRecollections((prev) => prev.filter((item) => item.id !== id));
    if (settings.soundEffects) playChime('clear');
  };

  const resetToDefaults = () => {
    setAacItems(DEFAULT_AAC_ITEMS);
    setQuickPhrases(DEFAULT_QUICK_PHRASES);
    setRoutines(DEFAULT_ROUTINES);
    setPlansChanged(DEFAULT_PLANS_CHANGED);
    setAdventures(DEFAULT_ADVENTURES);
    setSkills(DEFAULT_SKILLS);
    setSocialStories(DEFAULT_SOCIAL_STORIES);
    setWorldState(INITIAL_WORLD_STATE);
    setAvatar(INITIAL_AVATAR);
    setChildProfile(INITIAL_CHILD_PROFILE);
    setSettings(INITIAL_APP_SETTINGS);
    setDailyRecollections(INITIAL_DAILY_RECOLLECTIONS);
    setSentence([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('lumina_daily_recollections');
    if (settings.soundEffects) playChime('clear');
  };

  return (
    <AppContext.Provider
      value={{
        childView,
        setChildView,
        activeAdventureId,
        setActiveAdventureId,
        activeSkillId,
        setActiveSkillId,
        activeStoryId,
        setActiveStoryId,
        isParentMode,
        setIsParentMode,
        showPinModal,
        setShowPinModal,
        showQuickPhrasesDrawer,
        setShowQuickPhrasesDrawer,
        showCopingToolkit,
        setShowCopingToolkit,
        showPlansChangedModal,
        setShowPlansChangedModal,
        showMorningBrief,
        setShowMorningBrief,
        showCaregiverModal,
        setShowCaregiverModal,
        showCaregiverAlertModal,
        setShowCaregiverAlertModal,
        incomingCaregiverMessage,
        dismissIncomingCaregiverMessage,
        activeContextTopic,
        setActiveContextTopic,

        isSpeaking,
        speakingText,
        isOffline,
        stopSpeaking,
        offlineVoices,

        aacItems,
        sentence,
        quickPhrases,
        speak,
        addToSentence,
        speakSentence,
        clearSentence,
        removeLastFromSentence,
        saveSentenceAsQuickPhrase,
        addAacItem,
        deleteAacItem,
        addQuickPhrase,
        deleteQuickPhrase,

        routines,
        toggleRoutineStep,
        resetRoutine,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleFirstThen,

        plansChanged,
        activatePlansChanged,
        dismissPlansChanged,

        adventures,
        addAdventure,
        updateAdventure,
        completeAdventure,

        skills,
        toggleSkillStep,
        completeSkill,
        resetSkill,
        addSkill,
        updateSkill,

        habits,
        toggleHabit,
        incrementHabitCount,
        addHabit,
        deleteHabit,

        emotionHistory,
        currentMood,
        recordEmotion,

        socialStories,
        addSocialStory,

        worldState,
        avatar,
        updateAvatar,
        buyWorldItem,
        placeWorldItem,
        removePlacedItem,
        setCurrentRoom,
        awardStars,

        childProfile,
        updateChildProfile,
        settings,
        updateSettings,

        earnedStickers,
        newlyAwardedSticker,
        awardRoutineSticker,
        dismissStickerCelebration,

        dailyRecollections,
        showRecollectionModal,
        setShowRecollectionModal,
        addDailyRecollection,
        updateDailyRecollection,
        deleteDailyRecollection,

        themes,
        activeThemeId,
        activeTheme,
        setTheme,
        buyTheme,
        createCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        showThemeModal,
        setShowThemeModal,

        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
