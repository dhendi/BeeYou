import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { t, setLanguage } from '../services/translator';
import confetti from 'canvas-confetti';
import {
  AACItem,
  QuickPhrase,
  FavoriteSentence,
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
  UserAgeGroup,
  EnabledFeatures,
  getDefaultFeaturesForAge,
  MedicationReminder,
  MedicationDoseLog,
  MedicationFrequency,
  MoodJournalEntry,
  CycleDailyLog,
  CycleSettings,
  CyclePhase,
  SubscriptionInfo,
  SubscriptionTier,
  SubscriptionStatus,
  BillingCycle,
  EmergencySensorySettings,
  FivePointScaleSettings,
  FivePointLevelConfig,
  DecisionWheelConfig,
  DecisionWheelOption,
  CommunicationPassport,
  SpoonBudgetEntry,
  DashboardWidgetConfig,
  DashboardWidgetId,
  BeeYouBackupData,
  UserAccountRole,
  CaregiverPermissions,
  EmergencySupportContact,
  TemporaryPairingSession,
  HelpAlertPreset,
  CaregiverResponsePreset,
  CalmCopingStrategy,
  BreathingPacerConfig,
} from '../types';
import { PRESET_THEMES } from '../data/themesData';
import {
  DEFAULT_AAC_ITEMS,
  DEFAULT_QUICK_PHRASES,
  DEFAULT_FAVORITE_SENTENCES,
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
  INITIAL_MEDICATIONS,
  INITIAL_MEDICATION_LOGS,
  INITIAL_MOOD_JOURNAL_ENTRIES,
  INITIAL_CYCLE_SETTINGS,
  INITIAL_CYCLE_LOGS,
  DEFAULT_HELP_ALERT_PRESETS,
  DEFAULT_CAREGIVER_RESPONSES,
  DEFAULT_CALM_STRATEGIES,
  DEFAULT_BREATHING_PACER_CONFIG,
} from '../data/defaultData';
import { getStickerForRoutine } from '../data/rewardsData';
import { AGE_DEFAULT_WIDGETS } from '../data/navigation';
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
  onCaregiverAlert,
  onCaregiverAlertAck,
  onCaregiverAlertResolve,
  getPairingCode,
  setPairingCode,
  onConnectionStatusChange,
  getLiveConnectionStatus,
  sendHeartbeat,
  subscribeToCloudChannel,
  ConnectionStatusInfo
} from '../services/caregiverSync';
import {
  startFamilyLiveSync,
  onFamilyStateChange,
  pushFamilyStateUpdate
} from '../services/familySync';
import { resolveAacImageUrl } from '../services/symbolService';

type ChildViewType = 
  | 'home'
  | 'aac'
  | 'communicate'
  | 'me'
  | 'my-routine'
  | 'tools'
  | 'my-day'
  | 'adventures'
  | 'skills'
  | 'feelings'
  | 'my-world'
  | 'rewards'
  | 'more';

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
  showFamilyAuthModal: boolean;
  setShowFamilyAuthModal: (val: boolean) => void;
  showAboutMeModal: boolean;
  setShowAboutMeModal: (val: boolean) => void;
  showAvatarCreator: boolean;
  setShowAvatarCreator: (val: boolean) => void;
  incomingCaregiverMessage: CaregiverMessage | null;
  dismissIncomingCaregiverMessage: () => void;
  activeContextTopic: string | null;
  setActiveContextTopic: (topic: string | null) => void;

  // Real-time Caregiver Connection & Cross-Device Sync
  connectionStatus: ConnectionStatusInfo;
  isCaregiverConnected: boolean;

  // TTS & Offline Engine
  isSpeaking: boolean;
  speakingText: string | null;
  isOffline: boolean;
  stopSpeaking: () => void;
  offlineVoices: SpeechSynthesisVoice[];

  // AAC & Voice
  aacItems: AACItem[];
  sentence: AACItem[];
  quickPhrases: QuickPhrase[];
  favoriteSentences: FavoriteSentence[];
  showAacGuideModal: boolean;
  setShowAacGuideModal: (val: boolean) => void;
  showMyDayGuideModal: boolean;
  setShowMyDayGuideModal: (val: boolean) => void;
  speak: (text: string, options?: { force?: boolean }) => Promise<void>;
  announce: (text: string, options?: { force?: boolean }) => Promise<void>;
  addToSentence: (item: AACItem) => void;
  speakSentence: () => Promise<void>;
  clearSentence: () => void;
  removeLastFromSentence: () => void;
  saveSentenceAsQuickPhrase: () => void;
  addFavoriteSentence: (fav: Omit<FavoriteSentence, 'id' | 'usageCount'> & { usageCount?: number }) => void;
  deleteFavoriteSentence: (id: string) => void;
  togglePinFavoriteSentence: (id: string) => void;
  recordSentenceSpoken: (text: string, emoji?: string) => void;
  addAacItem: (item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string; isFavorite?: boolean }) => void;
  updateAacItem: (item: AACItem) => void;
  toggleAacFavorite: (id: string) => void;
  importAacPack: (items: Array<Omit<AACItem, 'id' | 'motorIndex'>>) => void;
  upgradeAllAacToClinicalSymbols: () => void;
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

  // Onboarding & Multi-Age Adaptability & Role
  userAgeGroup: UserAgeGroup;
  setUserAgeGroup: (age: UserAgeGroup) => void;
  userRole: UserAccountRole;
  setUserRole: (role: UserAccountRole) => void;
  emergencyContact: EmergencySupportContact | null;
  setEmergencyContact: (contact: EmergencySupportContact | null) => void;
  caregiverPermissions: CaregiverPermissions;
  updateCaregiverPermissions: (updates: Partial<CaregiverPermissions>) => void;
  linkedDeviceCode: string;
  setLinkedDeviceCode: (code: string) => void;
  enabledFeatures: EnabledFeatures;
  updateEnabledFeatures: (features: Partial<EnabledFeatures>) => void;
  toggleFeature: (key: keyof EnabledFeatures) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (val: boolean) => void;
  reopenOnboarding: () => void;
  // Medication Reminders & Health Supply
  medications: MedicationReminder[];
  medicationLogs: MedicationDoseLog[];
  showMedicationModal: boolean;
  setShowMedicationModal: (val: boolean) => void;
  addMedication: (med: Omit<MedicationReminder, 'id' | 'takenTimesToday'>) => void;
  updateMedication: (id: string, updates: Partial<MedicationReminder>) => void;
  deleteMedication: (id: string) => void;
  takeMedicationDose: (medId: string, time?: string) => void;
  undoMedicationDose: (medId: string, time?: string) => void;
  restockMedication: (medId: string, addedCount: number) => void;

  // Mood Journal (Teens to Adults)
  moodJournalEntries: MoodJournalEntry[];
  addMoodJournalEntry: (entry: Omit<MoodJournalEntry, 'id' | 'timestamp'>) => void;
  updateMoodJournalEntry: (id: string, updates: Partial<MoodJournalEntry>) => void;
  deleteMoodJournalEntry: (id: string) => void;
  showMoodJournalModal: boolean;
  setShowMoodJournalModal: (val: boolean) => void;

  // Cycle Tracker (Teens to Adults)
  cycleSettings: CycleSettings;
  updateCycleSettings: (settings: Partial<CycleSettings>) => void;
  cycleLogs: CycleDailyLog[];
  logCycleDay: (log: Omit<CycleDailyLog, 'id'>) => void;
  deleteCycleLog: (id: string) => void;
  showCycleTrackerModal: boolean;
  setShowCycleTrackerModal: (val: boolean) => void;
  getCyclePhaseInfo: () => {
    currentCycleDay: number;
    currentPhase: CyclePhase;
    phaseLabel: string;
    phaseDescription: string;
    sensoryInsight: string;
    daysUntilNextPeriod: number;
    nextPeriodDate: string;
    isPeriodToday: boolean;
  };

  // Subscription & Membership Tiering ($12.99/mo or $129.99/yr, 30-day free trial, Day 1 Basic tier)
  subscription: SubscriptionInfo;
  isPremium: boolean;
  startFreeTrial: (cycle?: BillingCycle) => void;
  activateSubscription: (cycle?: BillingCycle) => void;
  cancelSubscription: () => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  showPaywallModal: boolean;
  setShowPaywallModal: (val: boolean) => void;
  paywallTriggerReason: string;
  triggerUpgrade: (reason?: string) => void;
  getTrialDaysRemaining: () => number;

  // â”€â”€ 11 New Competitive Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Emergency Sensory Red Button
  emergencyMode: EmergencySensorySettings;
  setEmergencyMode: (val: Partial<EmergencySensorySettings>) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (val: boolean) => void;
  activateEmergencyMode: () => void;
  deactivateEmergencyMode: () => void;

  // Incredible 5-Point Scale
  fivePointSettings: FivePointScaleSettings;
  updateFivePointSettings: (updates: Partial<FivePointScaleSettings>) => void;
  updateFivePointLevel: (level: number, updates: Partial<FivePointLevelConfig>) => void;
  showFivePointModal: boolean;
  setShowFivePointModal: (val: boolean) => void;

  // Decision Wheel
  decisionWheelConfig: DecisionWheelConfig;
  updateDecisionWheelConfig: (config: Partial<DecisionWheelConfig>) => void;
  showDecisionWheelModal: boolean;
  setShowDecisionWheelModal: (val: boolean) => void;

  // Communication Passport
  communicationPassport: CommunicationPassport;
  updateCommunicationPassport: (updates: Partial<CommunicationPassport>) => void;
  showPassportModal: boolean;
  setShowPassportModal: (val: boolean) => void;

  // Spoon Theory Budget
  spoonEntries: SpoonBudgetEntry[];
  addSpoonEntry: (entry: Omit<SpoonBudgetEntry, 'id'>) => void;
  updateSpoonEntry: (id: string, updates: Partial<SpoonBudgetEntry>) => void;
  getTodaySpoonEntry: () => SpoonBudgetEntry | null;
  showSpoonModal: boolean;
  setShowSpoonModal: (val: boolean) => void;

  // Visual Pie Clock (Time Timer)
  showPieTimerModal: boolean;
  setShowPieTimerModal: (val: boolean) => void;

  // Digital Fidget Toys
  showFidgetModal: boolean;
  setShowFidgetModal: (val: boolean) => void;

  // AAC Context Scene Switcher (inline in AACView â€” no modal state needed)
  aacActiveScene: string | null;
  setAacActiveScene: (scene: string | null) => void;

  // Dyslexia-Friendly AAC Keyboard
  showAacKeyboardModal: boolean;
  setShowAacKeyboardModal: (val: boolean) => void;

  // Tools Hub (Consolidated Tools Modal)
  showToolsHubModal: boolean;
  setShowToolsHubModal: (val: boolean) => void;

  // Accessibility & Sensory Preferences Hub
  showAccessibilityModal: boolean;
  setShowAccessibilityModal: (val: boolean) => void;

  // Editable & Customizable Dashboard
  dashboardWidgets: DashboardWidgetConfig[];
  setDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  toggleDashboardWidget: (id: DashboardWidgetId) => void;
  reorderDashboardWidgets: (fromIndex: number, toIndex: number) => void;
  resetDashboardWidgets: () => void;
  showDashboardCustomizer: boolean;
  setShowDashboardCustomizer: (val: boolean) => void;
  // Editable Help Alerts & Caregiver Responses
  helpAlertPresets: HelpAlertPreset[];
  addHelpAlertPreset: (preset: Omit<HelpAlertPreset, 'id'>) => void;
  updateHelpAlertPreset: (id: string, updates: Partial<HelpAlertPreset>) => void;
  deleteHelpAlertPreset: (id: string) => void;
  resetHelpAlertPresets: () => void;
  caregiverResponses: CaregiverResponsePreset[];
  addCaregiverResponse: (response: Omit<CaregiverResponsePreset, 'id'>) => void;
  updateCaregiverResponse: (id: string, updates: Partial<CaregiverResponsePreset>) => void;
  deleteCaregiverResponse: (id: string) => void;
  resetCaregiverResponses: () => void;
  showEditAlertsModal: boolean;
  setShowEditAlertsModal: (val: boolean) => void;

  // Editable Calm Down Tools & Breathing Pacer
  calmStrategies: CalmCopingStrategy[];
  addCalmStrategy: (strategy: Omit<CalmCopingStrategy, 'id'>) => void;
  updateCalmStrategy: (id: string, updates: Partial<CalmCopingStrategy>) => void;
  deleteCalmStrategy: (id: string) => void;
  resetCalmStrategies: () => void;
  breathingConfig: BreathingPacerConfig;
  updateBreathingConfig: (config: Partial<BreathingPacerConfig>) => void;
  resetBreathingConfig: () => void;
  showEditCalmModal: boolean;
  setShowEditCalmModal: (val: boolean) => void;

  // Backup & Restore
  exportProfileBackup: () => BeeYouBackupData;
  importProfileBackup: (importedJson: string | object) => { success: boolean; message: string };

  // Utilities
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'beeyou_app_state_v1';

const spokenAlertKeys = new Set<string>();
const spokenAckKeys = new Set<string>();

export const AppProvider: React.FC<{ children: ReactNode; initialRole?: 'caregiver' | 'child' }> = ({ children, initialRole }) => {
  // Navigation
  const [childView, setChildView] = useState<ChildViewType>('home');
  const [activeAdventureId, setActiveAdventureId] = useState<string | null>(null);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isParentMode, setIsParentMode] = useState<boolean>(() => {
    if (initialRole === 'caregiver') return true;
    if (initialRole === 'child') return false;
    if (typeof window !== 'undefined') {
      if (window.location.port === '3001' || window.location.pathname.startsWith('/caregiver')) return true;
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'caregiver' || params.get('mode') === 'caregiver') return true;
      if (params.get('role') === 'child') return false;
    }
    return false;
  });
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showQuickPhrasesDrawer, setShowQuickPhrasesDrawer] = useState<boolean>(false);
  const [showCopingToolkit, setShowCopingToolkit] = useState<boolean>(false);
  const [showPlansChangedModal, setShowPlansChangedModal] = useState<boolean>(false);
  const [showMorningBrief, setShowMorningBrief] = useState<boolean>(false);
  const [showCaregiverModal, setShowCaregiverModal] = useState<boolean>(false);
  const [showCaregiverAlertModal, setShowCaregiverAlertModal] = useState<boolean>(false);
  const [showFamilyAuthModal, setShowFamilyAuthModal] = useState<boolean>(false);
  const [showAboutMeModal, setShowAboutMeModal] = useState<boolean>(false);
  const [showAvatarCreator, _setShowAvatarCreator] = useState<boolean>(false);

  // Subscription state ($12.99/month, 30-day free trial, Day 1 Basic tier available)
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    try {
      const saved = localStorage.getItem('beeyou_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.tier === 'basic' || parsed.tier === 'premium')) {
          if (parsed.status === 'trial' && parsed.trialEndDate) {
            const end = new Date(parsed.trialEndDate).getTime();
            if (Date.now() > end) {
              return {
                ...parsed,
                tier: 'basic',
                status: 'expired',
              };
            }
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_subscription:', e);
    }
    return {
      tier: 'basic',
      status: 'basic',
      billingCycle: 'monthly',
      monthlyPrice: 12.99,
      yearlyPrice: 129.99,
      trialDays: 30,
      autoRenew: true,
    };
  });

  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallTriggerReason, setPaywallTriggerReason] = useState<string>('Unlock all BeeYou Premium features');
  const [, setLangVersion] = useState(0);

  useEffect(() => {
    const handleLangChanged = () => setLangVersion((v) => v + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChanged);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChanged);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_subscription', JSON.stringify(subscription));
    } catch (e) {}
  }, [subscription]);

  const isPremium = subscription.tier === 'premium' || subscription.status === 'trial' || subscription.status === 'active';

  const triggerUpgrade = (reason?: string) => {
    if (reason) setPaywallTriggerReason(reason);
    setShowPaywallModal(true);
  };

  const startFreeTrial = (cycle?: BillingCycle) => {
    const chosenCycle = cycle || subscription.billingCycle || 'monthly';
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setSubscription({
      tier: 'premium',
      status: 'trial',
      billingCycle: chosenCycle,
      trialStartDate: startDate.toISOString(),
      trialEndDate: endDate.toISOString(),
      monthlyPrice: 12.99,
      yearlyPrice: 129.99,
      trialDays: 30,
      autoRenew: true,
    });
    setShowPaywallModal(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const activateSubscription = (cycle?: BillingCycle) => {
    setSubscription((prev) => ({
      ...prev,
      tier: 'premium',
      status: 'active',
      billingCycle: cycle || prev.billingCycle || 'monthly',
      yearlyPrice: 129.99,
    }));
    setShowPaywallModal(false);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const cancelSubscription = () => {
    setSubscription({
      tier: 'basic',
      status: 'basic',
      billingCycle: 'monthly',
      monthlyPrice: 12.99,
      yearlyPrice: 129.99,
      trialDays: 30,
      autoRenew: false,
    });
  };

  const setBillingCycle = (cycle: BillingCycle) => {
    setSubscription((prev) => ({
      ...prev,
      billingCycle: cycle,
    }));
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    if (tier === 'premium') {
      startFreeTrial();
    } else {
      cancelSubscription();
    }
  };

  const getTrialDaysRemaining = (): number => {
    if (subscription.status !== 'trial' || !subscription.trialEndDate) return 0;
    const diff = new Date(subscription.trialEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const setShowAvatarCreator = (val: boolean) => {
    if (val && !isPremium) {
      triggerUpgrade('Avatar Customizer Studio is a BeeYou Premium feature! Start your 30-day free trial to customize hair, colors, and accessories.');
      return;
    }
    _setShowAvatarCreator(val);
  };

  const [incomingCaregiverMessage, setIncomingCaregiverMessage] = useState<CaregiverMessage | null>(null);
  const [activeContextTopic, setActiveContextTopic] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusInfo>(getLiveConnectionStatus());
  const isCaregiverConnected = connectionStatus.isConnected && (connectionStatus.peerRole === 'caregiver' || !connectionStatus.peerRole || connectionStatus.lastPingAgoSeconds <= 35);

  const dismissIncomingCaregiverMessage = () => {
    setIncomingCaregiverMessage(null);
  };

  // Morning Brief is available on-demand from the child home dashboard

  // Core Data States
  const [aacItems, setAacItems] = useState<AACItem[]>(DEFAULT_AAC_ITEMS);
  const [sentence, setSentence] = useState<AACItem[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<QuickPhrase[]>(DEFAULT_QUICK_PHRASES);
  const [favoriteSentences, setFavoriteSentences] = useState<FavoriteSentence[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_favorite_sentences');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_FAVORITE_SENTENCES;
  });
  const [showAacGuideModal, setShowAacGuideModal] = useState<boolean>(false);
  const [showMyDayGuideModal, setShowMyDayGuideModal] = useState<boolean>(false);
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

  // Core Speech & Announcement Helper (Persona-aware & force-override enabled)
  const speak = async (text: string, options?: { force?: boolean }) => {
    if (settings.soundEffects) playChime('speak');
    const spoken = t(text);
    await speakText(spoken, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceURI: settings.selectedVoiceURI,
      voicePersona: settings.voicePersona || 'Kore',
      lang: settings.language,
      force: options?.force,
    });
  };

  const announce = async (text: string, options?: { force?: boolean }) => {
    if (!settings.spokenAnnouncements) return;
    await speak(text, options);
  };

  const stopSpeaking = () => {
    haltSpeaking();
  };

  // Digital Routine Stickers earned through My Day completions
  const [earnedStickers, setEarnedStickers] = useState<EarnedRoutineSticker[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_earned_routine_stickers');
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
      localStorage.setItem('beeyou_earned_routine_stickers', JSON.stringify(earnedStickers));
    } catch (e) {}
  }, [earnedStickers]);

  // Daily Mood & Recollection (End-of-Day Journal & Therapist Summary)
  const [dailyRecollections, setDailyRecollections] = useState<DailyRecollectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_daily_recollections');
      if (saved) {
        return JSON.parse(saved);
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

  // Medication Reminders & Supply Tracking state
  const [medications, setMedications] = useState<MedicationReminder[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_medications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          return parsed.map((m: MedicationReminder) => {
            if (m.lastTakenDate !== todayStr) {
              return { ...m, takenTimesToday: [], lastTakenDate: todayStr };
            }
            return m;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_medications:', e);
    }
    return INITIAL_MEDICATIONS;
  });

  const [medicationLogs, setMedicationLogs] = useState<MedicationDoseLog[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_medication_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse beeyou_medication_logs:', e);
    }
    return INITIAL_MEDICATION_LOGS;
  });

  const [showMedicationModal, setShowMedicationModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_medications', JSON.stringify(medications));
    } catch (e) {}
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_medication_logs', JSON.stringify(medicationLogs));
    } catch (e) {}
  }, [medicationLogs]);

  // Mood Journal State (Teens to Adults)
  const [moodJournalEntries, setMoodJournalEntries] = useState<MoodJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_mood_journal_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse beeyou_mood_journal_entries:', e);
    }
    return INITIAL_MOOD_JOURNAL_ENTRIES;
  });

  const [showMoodJournalModal, setShowMoodJournalModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_mood_journal_entries', JSON.stringify(moodJournalEntries));
    } catch (e) {}
  }, [moodJournalEntries]);

  // Cycle Tracker State (Teens to Adults)
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
      if (saved) return JSON.parse(saved);
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

  // Themes & Customization state
  const [themes, setThemes] = useState<AppTheme[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_themes');
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
      console.error('Failed to parse beeyou_themes:', e);
    }
    return PRESET_THEMES;
  });

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('beeyou_active_theme_id');
      if (saved) return saved;
    } catch (e) {}
    return 'theme-classic'; // Clean neutral classic theme default for Day 1 Basic
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_themes', JSON.stringify(themes));
    } catch (e) {}
  }, [themes]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_active_theme_id', activeThemeId);
    } catch (e) {}
  }, [activeThemeId]);

  // Themes are only for BeeYou Premium: Basic tier falls back to theme-classic
  useEffect(() => {
    if (!isPremium && activeThemeId !== 'theme-classic') {
      setActiveThemeId('theme-classic');
    }
  }, [isPremium, activeThemeId]);

  const activeTheme = !isPremium
    ? (themes.find((t) => t.id === 'theme-classic') || PRESET_THEMES.find((t) => t.id === 'theme-classic') || themes[0])
    : (themes.find((t) => t.id === activeThemeId) || themes[0] || PRESET_THEMES[0]);

  const setTheme = (id: string) => {
    if (!isPremium && id !== 'theme-classic') {
      triggerUpgrade('Themes are a BeeYou Premium feature! Start your 30-day free trial to unlock all themes.');
      return;
    }
    const target = themes.find((t) => t.id === id);
    if (target && target.isUnlocked) {
      setActiveThemeId(id);
    }
  };

  const buyTheme = (themeId: string): boolean => {
    if (!isPremium) {
      triggerUpgrade('Themes are a BeeYou Premium feature! Start your 30-day free trial to unlock all themes.');
      return false;
    }
    const target = themes.find((t) => t.id === themeId);
    if (!target) return false;
    if (target.isUnlocked) {
      setTheme(themeId);
      return true;
    }
    if (worldState.stars < target.costStars) {
      if (settings.soundEffects) playChime('tap');
      speak(`Need ${target.costStars - worldState.stars} more stars to unlock ${target.name}!`);
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
    if (settings.spokenAnnouncements) {
      speak(`Hooray! You unlocked and equipped the ${target.name} theme!`);
    }
    return true;
  };

  const createCustomTheme = (themeData: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>): AppTheme => {
    if (!isPremium) {
      triggerUpgrade('Custom Theme Studio is a BeeYou Premium feature! Start your 30-day free trial.');
      throw new Error('Premium required for custom themes');
    }
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
    if (settings.spokenAnnouncements) {
      speak(`Awesome! Created your custom theme ${newTheme.name}!`);
    }
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

  // Onboarding & Multi-Age Adaptability
  const [userAgeGroup, setUserAgeGroupState] = useState<UserAgeGroup>(() => {
    try {
      const saved = localStorage.getItem('beeyou_user_age_group');
      if (saved === 'kid' || saved === 'teen' || saved === 'adult') return saved;
    } catch (e) {}
    return 'kid';
  });

  const [userRole, setUserRoleState] = useState<UserAccountRole>(() => {
    if (initialRole === 'caregiver') return 'caregiver';
    if (initialRole === 'child') return 'child_dependent';
    try {
      if (typeof window !== 'undefined') {
        if (window.location.port === '3001' || window.location.pathname.startsWith('/caregiver')) return 'caregiver';
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role') || params.get('mode');
        if (role === 'caregiver') return 'caregiver';
        if (role === 'child') return 'child_dependent';

        const sess = sessionStorage.getItem('beeyou_user_role');
        if (sess === 'child_dependent' || sess === 'teen_dependent' || sess === 'independent_adult' || sess === 'caregiver') {
          return sess as UserAccountRole;
        }

        if (window.location.port === '3000') return 'child_dependent';
      }
      const saved = localStorage.getItem('beeyou_user_role');
      if (saved === 'child_dependent' || saved === 'teen_dependent' || saved === 'independent_adult' || saved === 'caregiver') {
        return saved;
      }
    } catch (e) {}
    return 'child_dependent';
  });

  const [emergencyContact, setEmergencyContactState] = useState<EmergencySupportContact | null>(() => {
    try {
      const saved = localStorage.getItem('beeyou_emergency_support_contact');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [caregiverPermissions, setCaregiverPermissions] = useState<CaregiverPermissions>(() => {
    try {
      const saved = localStorage.getItem('beeyou_caregiver_permissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      receiveAlerts: true,
      receiveMood: true,
      receiveRoutines: true,
      canEditRoutines: true,
      canEditAac: true,
      allowLocationTag: true,
    };
  });

  const [linkedDeviceCode, setLinkedDeviceCodeState] = useState<string>(() => {
    return getPairingCode();
  });

  const setUserRole = (role: UserAccountRole) => {
    setUserRoleState(role);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('beeyou_user_role', role);
      }
      if (typeof window !== 'undefined' && window.location.port === '3001' && role === 'caregiver') {
        localStorage.setItem('beeyou_user_role', 'caregiver');
      } else if (typeof window !== 'undefined' && window.location.port === '3000' && role !== 'caregiver') {
        localStorage.setItem('beeyou_user_role', role);
      } else {
        localStorage.setItem('beeyou_user_role', role);
      }
    } catch (e) {}
  };

  const setEmergencyContact = (contact: EmergencySupportContact | null) => {
    setEmergencyContactState(contact);
    try {
      if (contact) {
        localStorage.setItem('beeyou_emergency_support_contact', JSON.stringify(contact));
      } else {
        localStorage.removeItem('beeyou_emergency_support_contact');
      }
    } catch (e) {}
  };

  const updateCaregiverPermissions = (updates: Partial<CaregiverPermissions>) => {
    setCaregiverPermissions((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('beeyou_caregiver_permissions', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const setLinkedDeviceCode = (code: string) => {
    setLinkedDeviceCodeState(code);
    setPairingCode(code);
  };

  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>(() => {
    try {
      const saved = localStorage.getItem('beeyou_enabled_features');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultFeaturesForAge('kid');
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('beeyou_onboarding_completed');
      if (completed === 'true') return false;
    } catch (e) {}
    return true; // First time launch
  });

  const setUserAgeGroup = (age: UserAgeGroup) => {
    setUserAgeGroupState(age);
    try {
      localStorage.setItem('beeyou_user_age_group', age);
      // Re-apply age defaults to Home only if the user hasn't customised their dashboard.
      if (localStorage.getItem('beeyou_dashboard_customized') !== 'true') {
        setDashboardWidgetsState(getDefaultDashboardWidgets(age));
      }
    } catch (e) {}
  };

  const normalizeFeatures = (updates: Partial<EnabledFeatures>, base?: EnabledFeatures): EnabledFeatures => {
    const next = { ...(base || enabledFeatures), ...updates };
    if (updates.aac !== undefined) next.aacCommunication = updates.aac;
    if (updates.aacCommunication !== undefined) next.aac = updates.aacCommunication;
    if (updates.routines !== undefined) next.firstThenSchedules = updates.routines;
    if (updates.firstThenSchedules !== undefined) next.routines = updates.firstThenSchedules;
    if (updates.caregiverMessaging !== undefined) next.emergencyAlertSOS = updates.caregiverMessaging;
    if (updates.emergencyAlertSOS !== undefined) next.caregiverMessaging = updates.emergencyAlertSOS;
    if (updates.sensoryTools !== undefined) next.sensoryBreathingPacer = updates.sensoryTools;
    if (updates.sensoryBreathingPacer !== undefined) next.sensoryTools = updates.sensoryBreathingPacer;
    if (updates.emotions !== undefined) next.dailyMoodRecollection = updates.emotions;
    if (updates.dailyMoodRecollection !== undefined) next.emotions = updates.dailyMoodRecollection;
    return next;
  };

  const updateEnabledFeatures = (updates: Partial<EnabledFeatures>) => {
    setEnabledFeatures((prev) => {
      const next = normalizeFeatures(updates, prev);
      try {
        localStorage.setItem('beeyou_enabled_features', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setSettings((prev) => ({
      ...prev,
      features: normalizeFeatures(updates, prev.features),
    }));
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    setEnabledFeatures((prev) => {
      const next = normalizeFeatures({ [key]: !prev[key] }, prev);
      try {
        localStorage.setItem('beeyou_enabled_features', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const reopenOnboarding = () => {
    setShowOnboardingModal(true);
  };

  // Timed medication reminder notification check (every 30s)
  const notifiedMedicationKeysRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (enabledFeatures?.medicationReminders === false) return;

    const checkDueMedications = () => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMinute}`;
      const todayDateStr = now.toISOString().split('T')[0];
      const currentDayOfWeek = now.getDay(); // 0=Sun..6=Sat

      medications.forEach((med) => {
        if (!med.active || med.frequency === 'as_needed') return;
        if (med.frequency === 'custom_days' && med.customDays && !med.customDays.includes(currentDayOfWeek)) {
          return;
        }

        med.times.forEach((scheduledTime) => {
          if (scheduledTime === currentTimeStr) {
            const reminderKey = `${med.id}_${scheduledTime}_${todayDateStr}`;
            if (!notifiedMedicationKeysRef.current.has(reminderKey) && !med.takenTimesToday?.includes(scheduledTime)) {
              notifiedMedicationKeysRef.current.add(reminderKey);
              if (settings.soundEffects) playChime('star');
              if (settings.spokenAnnouncements) {
                speak(`Medication reminder: It is time for ${childProfile.name}'s ${med.name}. Please take ${med.dosage} ${med.unit}.`);
              }
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                try {
                  new Notification(`Medication Reminder: ${med.name}`, {
                    body: `Time to take ${med.dosage} ${med.unit}. ${med.instructions || ''}`,
                  });
                } catch (e) {}
              }
            }
          }
        });
      });
    };

    checkDueMedications();
    const interval = setInterval(checkDueMedications, 30000);
    return () => clearInterval(interval);
  }, [medications, enabledFeatures?.medicationReminders, childProfile.name, settings.soundEffects]);

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
    setLanguage(settings.language || 'en').then(() => {
      setLangVersion((v) => v + 1);
    });

    return () => {
      unsubSpeech();
      unsubVoices();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.language]);

  const liveChildStatusRef = useRef({
    currentMood,
    childView,
    stars: worldState.stars,
    childName: childProfile?.name || 'Leo',
  });
  liveChildStatusRef.current = {
    currentMood,
    childView,
    stars: worldState.stars,
    childName: childProfile?.name || 'Leo',
  };

  // Listen for real-time messages, alert acks and connection updates from caregiver
  useEffect(() => {
    const isCaregiver = 
      userRole === 'caregiver' || 
      isParentMode || 
      (typeof window !== 'undefined' && (
        window.location.port === '3001' || 
        window.location.pathname.startsWith('/caregiver') || 
        new URLSearchParams(window.location.search).get('role') === 'caregiver' ||
        sessionStorage.getItem('beeyou_active_device_view') === 'caregiver'
      ));

    const unsubCaregiver = onCaregiverMessage((msg) => {
      if (isCaregiver) return; // Caregiver device does not receive/speak its own outgoing messages
      if (msg.responseId) return; // Alert acknowledgment already announced via onCaregiverAlertAck
      const rawSender = msg.senderName || 'Caregiver';
      const rawText = msg.text || '';
      const isInverted =
        (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
        rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
      const sender = isInverted ? rawText : rawSender;
      const text = isInverted ? rawSender : rawText;
      const normalizedMsg = { ...msg, senderName: sender, text };

      setIncomingCaregiverMessage(normalizedMsg);
      playChime('star');
      speak(`${sender} sent you a message: ${text}`);
    });

    const unsubAlert = onCaregiverAlert((alert) => {
      if (!isCaregiver) return; // Only caregiver device receives incoming child alerts
      const alertKey = `${alert.id || alert.label}:${alert.status || 'active'}`;
      if (spokenAlertKeys.has(alertKey)) return;
      spokenAlertKeys.add(alertKey);

      playChime('star');
      speak(`Incoming Alert from ${alert.childName || 'Child'}: ${alert.label}`);
      setIncomingCaregiverMessage({
        id: 'alert-' + alert.id,
        senderName: alert.childName || 'Child',
        text: `🚨 ALERT: ${alert.label} (${alert.location || 'Location shared'})`,
        emoji: alert.emoji || '🚨',
        timestamp: alert.timestamp || new Date().toISOString(),
        read: false,
      });
    });

    const unsubAck = onCaregiverAlertAck((ack) => {
      if (isCaregiver) return; // Caregiver device does not receive/speak its own outgoing acknowledgments
      if (ack.responseMessage) {
        const ackKey = `${ack.alertId || ''}:${ack.responseMessage || ''}:${ack.by || ''}`;
        if (spokenAckKeys.has(ackKey)) return;
        spokenAckKeys.add(ackKey);

        setIncomingCaregiverMessage({
          id: 'ack-' + Date.now(),
          senderName: ack.by || 'Caregiver',
          text: ack.responseMessage,
          timestamp: new Date().toISOString(),
          read: false,
        });
        playChime('star');
        speak(`${ack.by || 'Caregiver'} says: ${ack.responseMessage}`);
      }
    });

    const unsubResolve = onCaregiverAlertResolve(() => {
      setIncomingCaregiverMessage((prev) => {
        if (prev?.text?.includes('ALERT:')) return null;
        return prev;
      });
    });

    const unsubConnection = onConnectionStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Send initial heartbeat and periodic keepalive (every 3.5s)
    const code = getPairingCode();
    subscribeToCloudChannel(code);

    const sendPing = () => {
      const snap = liveChildStatusRef.current;
      sendHeartbeat({
        role: isCaregiver ? 'caregiver' : 'child_device',
        name: isCaregiver ? 'Sarah (Mom)' : (snap.childName || 'Leo'),
        pairingCode: code,
        childStatus: {
          childName: snap.childName || 'Leo',
          currentMood: snap.currentMood,
          currentActivity: `In ${snap.childView === 'my-day' ? 'Visual Schedule' : snap.childView === 'aac' ? 'AAC Speech Board' : snap.childView === 'skills' ? 'Life Skills' : snap.childView === 'adventures' ? 'Life Adventures' : snap.childView === 'feelings' ? 'Feelings Check-in' : 'BeeYou'}`,
          stars: snap.stars,
        }
      });
    };

    sendPing();
    const interval = setInterval(sendPing, 3500);

    return () => {
      unsubCaregiver();
      unsubAlert();
      unsubAck();
      unsubResolve();
      unsubConnection();
      clearInterval(interval);
    };
  }, [userRole, isParentMode, childProfile?.name]);

  const isSyncingFromRemoteRef = useRef(false);

  // Unified Family Cloud Sync (Real-time remote control + live alert relay)
  useEffect(() => {
    const code = getPairingCode();
    const unsubSync = startFamilyLiveSync(code);

    const unsubState = onFamilyStateChange((remoteState) => {
      if (!remoteState) return;

      isSyncingFromRemoteRef.current = true;

      // Remote routines sync
      if (Array.isArray(remoteState.routines) && remoteState.routines.length > 0) {
        setRoutines((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(remoteState.routines)) {
            return remoteState.routines;
          }
          return prev;
        });
      }

      // Remote AAC vocabulary sync
      if (Array.isArray(remoteState.aacItems) && remoteState.aacItems.length > 0) {
        setAacItems((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(remoteState.aacItems)) {
            return remoteState.aacItems;
          }
          return prev;
        });
      }

      // Remote Plans Changed trigger
      if (remoteState.plansChanged) {
        setPlansChanged((prev) => {
          if (remoteState.plansChanged.active && !prev.active) {
            setShowPlansChangedModal(true);
            playChime('tap');
            speak(`Our plans have changed: ${remoteState.plansChanged.newPlanTitle || 'New Plan'}`);
          }
          return { ...prev, ...remoteState.plansChanged };
        });
      }

      // Remote Child Profile sync
      if (remoteState.childProfile && remoteState.childProfile.name) {
        setChildProfile((prev) => {
          if (prev.name !== remoteState.childProfile.name) {
            const validAgeGroup = (remoteState.childProfile.ageGroup === 'kid' || remoteState.childProfile.ageGroup === 'teen' || remoteState.childProfile.ageGroup === 'adult')
              ? remoteState.childProfile.ageGroup
              : prev.ageGroup;
            return {
              ...prev,
              name: remoteState.childProfile.name,
              ...(remoteState.childProfile.interests ? { interests: remoteState.childProfile.interests } : {}),
              ...(remoteState.childProfile.pronouns ? { pronouns: remoteState.childProfile.pronouns } : {}),
              ageGroup: validAgeGroup,
            };
          }
          return prev;
        });
      }

      setTimeout(() => {
        isSyncingFromRemoteRef.current = false;
      }, 600);
    });

    return () => {
      unsubSync();
      unsubState();
    };
  }, []);

  // Remote Push Debounce: When user or caregiver updates routines, AAC, or plansChanged, push to cloud
  useEffect(() => {
    if (isSyncingFromRemoteRef.current) return;
    const timeout = setTimeout(() => {
      pushFamilyStateUpdate({
        routines,
        aacItems,
        plansChanged,
        childState: {
          lastActiveTime: new Date().toISOString(),
          currentActivity: `In ${childView === 'my-day' ? 'Visual Schedule' : childView === 'aac' ? 'AAC Speech Board' : 'BeeYou'}`,
          currentMood: currentMood || 'happy',
          habitsCompletedToday: habits.filter((h) => h.completedToday).length,
          totalHabits: habits.length,
          stars: worldState.stars,
          isOnline: true,
        },
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [routines, aacItems, plansChanged, currentMood, childView, worldState.stars]);

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.aacItems) {
          const defaultItemsMap = new Map(DEFAULT_AAC_ITEMS.map((item) => [item.id, item]));
          const defaultLabelMap = new Map(DEFAULT_AAC_ITEMS.map((item) => [item.label.toLowerCase().trim(), item]));

          const upgraded = parsed.aacItems.map((item: AACItem) => {
            const cleanLabel = (item.label || '').toLowerCase().trim();
            const defaultItem = defaultItemsMap.get(item.id) || defaultLabelMap.get(cleanLabel);
            if (defaultItem && !item.isCustom) {
              // Always sync standard default items with verified Mulberry Symbols URL while preserving favorites
              return {
                ...defaultItem,
                isFavorite: item.isFavorite !== undefined ? item.isFavorite : defaultItem.isFavorite,
                photoUrl: defaultItem.photoUrl,
              };
            }
            // Auto-heal photoUrl for custom/imported items unless it is a user-uploaded photo
            if (!item.photoUrl?.startsWith('data:image')) {
              return {
                ...item,
                photoUrl: resolveAacImageUrl(item),
              };
            }
            return item;
          });

          // Deduplicate items by normalized label to fix and clean existing boards with duplicate tiles
          const seenLabels = new Set<string>();
          const deduped: AACItem[] = [];
          for (const it of upgraded) {
            const norm = (it.label || '').toLowerCase().trim();
            if (norm && !seenLabels.has(norm)) {
              seenLabels.add(norm);
              deduped.push(it);
            } else if (!norm) {
              deduped.push(it);
            }
          }

          // Check if newly introduced default items (like feelings) are missing
          const existingIds = new Set(deduped.map((i: AACItem) => i.id));
          const existingLabels = new Set(deduped.map((i: AACItem) => (i.label || '').toLowerCase().trim()));
          const missingDefaults = DEFAULT_AAC_ITEMS.filter((d) => !existingIds.has(d.id) && !existingLabels.has(d.label.toLowerCase().trim()));

          setAacItems([...deduped, ...missingDefaults]);
        }
        if (parsed.quickPhrases) setQuickPhrases(parsed.quickPhrases);
        if (parsed.routines) setRoutines(parsed.routines);
        if (parsed.plansChanged) setPlansChanged(parsed.plansChanged);
        if (parsed.adventures) setAdventures(parsed.adventures);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.habits) {
          const todayStr = new Date().toDateString();
          const lastHabitsDate = localStorage.getItem('beeyou_last_habits_date');
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
        if (parsed.settings) {
          const loaded = { ...INITIAL_APP_SETTINGS, ...parsed.settings };
          if (loaded.voiceRate >= 0.95) {
            loaded.voiceRate = 0.85;
          }
          setSettings(loaded);
        }
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
        currentActivity: `In ${childView === 'my-day' ? 'Visual Schedule' : childView === 'aac' ? 'AAC Speech Board' : childView === 'skills' ? 'Life Skills' : childView === 'adventures' ? 'Life Adventures' : childView === 'feelings' ? 'Feelings Check-in' : 'BeeYou'}`,
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

  // AAC Methods
  const addToSentence = (item: AACItem) => {
    if (settings.soundEffects) playChime('tap');
    setSentence((prev) => [...prev, item]);
    if (settings.autoSpeakSentence) {
      // Speak the tapped item immediately for motor reinforcement
      speak(item.speechText || item.label);
    }
  };

  // Sync favoriteSentences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('beeyou_favorite_sentences', JSON.stringify(favoriteSentences));
    } catch (e) {}
  }, [favoriteSentences]);

  const recordSentenceSpoken = (text: string, emoji?: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setFavoriteSentences((prev) => {
      const existingIdx = prev.findIndex((s) => s.text.toLowerCase() === cleanText.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          usageCount: (updated[existingIdx].usageCount || 0) + 1,
          lastUsedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newFav: FavoriteSentence = {
          id: `fav-used-${Date.now()}`,
          text: cleanText,
          speechText: cleanText,
          emoji: emoji || '💬',
          usageCount: 1,
          lastUsedAt: new Date().toISOString(),
          isCustom: true,
          category: 'favorites',
        };
        return [...prev, newFav];
      }
    });
  };

  const addFavoriteSentence = (fav: Omit<FavoriteSentence, 'id' | 'usageCount'> & { usageCount?: number }) => {
    const cleanText = fav.text.trim();
    if (!cleanText) return;
    setFavoriteSentences((prev) => {
      const existingIdx = prev.findIndex((s) => s.text.toLowerCase() === cleanText.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          usageCount: (updated[existingIdx].usageCount || 0) + 1,
          isParentPinned: fav.isParentPinned !== undefined ? fav.isParentPinned : updated[existingIdx].isParentPinned,
          emoji: fav.emoji || updated[existingIdx].emoji,
          speechText: fav.speechText || updated[existingIdx].speechText,
          lastUsedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newFav: FavoriteSentence = {
          id: `fav-custom-${Date.now()}`,
          text: cleanText,
          speechText: fav.speechText || cleanText,
          emoji: fav.emoji || '💬',
          usageCount: fav.usageCount || 1,
          isParentPinned: fav.isParentPinned !== undefined ? fav.isParentPinned : true,
          isCustom: true,
          lastUsedAt: new Date().toISOString(),
          category: fav.category || 'favorites',
        };
        return [newFav, ...prev];
      }
    });
    if (settings.soundEffects) playChime('star');
  };

  const deleteFavoriteSentence = (id: string) => {
    setFavoriteSentences((prev) => prev.filter((f) => f.id !== id));
    if (settings.soundEffects) playChime('clear');
  };

  const togglePinFavoriteSentence = (id: string) => {
    setFavoriteSentences((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isParentPinned: !f.isParentPinned } : f))
    );
    if (settings.soundEffects) playChime('tap');
  };

  const speakSentence = async () => {
    if (sentence.length === 0) return;
    const fullText = sentence
      .map((item) => {
        if (item.speechText) {
          const tr = t(item.speechText);
          if (tr !== item.speechText) return tr;
        }
        return t(item.label) || item.label;
      })
      .join(' ');
    recordSentenceSpoken(fullText, sentence[0]?.emoji);
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
    addFavoriteSentence({
      text: phraseText,
      speechText: phraseText,
      emoji: sentence[0]?.emoji || '💬',
      isParentPinned: true,
    });
    const newQP: QuickPhrase = {
      id: `qp-custom-${Date.now()}`,
      text: phraseText,
      emoji: sentence[0]?.emoji || '💬',
      isCustom: true,
    };
    setQuickPhrases((prev) => [newQP, ...prev]);
    if (settings.soundEffects) playChime('star');
  };

  const addAacItem = (item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string; isFavorite?: boolean }) => {
    const cleanLabel = (item.label || '').trim().toLowerCase();
    
    setAacItems((prev) => {
      // Check if item with same label already exists
      const existingIdx = prev.findIndex((i) => (i.label || '').trim().toLowerCase() === cleanLabel);
      if (existingIdx !== -1) {
        // Update the existing item rather than creating a duplicate
        return prev.map((it, idx) =>
          idx === existingIdx
            ? {
                ...it,
                speechText: item.speechText || it.speechText,
                emoji: item.emoji || it.emoji,
                photoUrl: item.photoUrl || it.photoUrl,
                symbolId: item.symbolId !== undefined ? item.symbolId : it.symbolId,
                symbolSource: item.symbolSource !== undefined ? item.symbolSource : it.symbolSource,
                arasaacId: item.arasaacId !== undefined ? item.arasaacId : it.arasaacId,
                category: item.category || it.category,
                colorType: item.colorType || it.colorType,
                isFavorite: item.isFavorite !== undefined ? item.isFavorite : it.isFavorite,
              }
            : it
        );
      }

      const newItem: AACItem = {
        id: item.id || `aac-${Date.now()}`,
        label: item.label,
        speechText: item.speechText || item.label,
        emoji: item.emoji || '✨',
        photoUrl: item.photoUrl,
        symbolId: item.symbolId,
        symbolSource: item.symbolSource || 'mulberry',
        arasaacId: item.arasaacId,
        category: item.category,
        colorType: item.colorType,
        motorIndex: prev.length,
        isCustom: true,
        isFavorite: item.isFavorite !== undefined ? item.isFavorite : (item.category === 'favorites'),
      };
      return [...prev, newItem];
    });

    if (settings.soundEffects) playChime('star');
  };

  const updateAacItem = (updated: AACItem) => {
    setAacItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (settings.soundEffects) playChime('tap');
  };

  const toggleAacFavorite = (id: string) => {
    setAacItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (settings.soundEffects) playChime('star');
  };

  const importAacPack = (items: Array<Omit<AACItem, 'id' | 'motorIndex'>>) => {
    setAacItems((prev) => {
      const existingLabels = new Set(prev.map((i) => i.label.toLowerCase()));
      const newItems: AACItem[] = [];
      let nextIndex = prev.length;

      for (const item of items) {
        if (!existingLabels.has(item.label.toLowerCase())) {
          newItems.push({
            id: `aac-pack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: item.label,
            speechText: item.speechText || item.label,
            emoji: item.emoji || '✨',
            photoUrl: item.photoUrl,
            category: item.category,
            colorType: item.colorType,
            motorIndex: nextIndex++,
            isCustom: true,
          });
          existingLabels.add(item.label.toLowerCase());
        }
      }
      return [...prev, ...newItems];
    });
    if (settings.soundEffects) playChime('complete');
  };

  const upgradeAllAacToClinicalSymbols = () => {
    const defaultLabelMap = new Map(DEFAULT_AAC_ITEMS.map((item) => [item.label.toLowerCase().trim(), item.photoUrl]));
    const defaultIdMap = new Map(DEFAULT_AAC_ITEMS.map((item) => [item.id, item.photoUrl]));

    setAacItems((prev) =>
      prev.map((item) => {
        if (item.photoUrl?.startsWith('data:image')) return item;
        const verifiedPhoto = defaultIdMap.get(item.id) || defaultLabelMap.get((item.label || '').toLowerCase().trim()) || resolveAacImageUrl(item);
        return { ...item, photoUrl: verifiedPhoto };
      })
    );
    if (settings.soundEffects) playChime('complete');
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

    speak(
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
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('BeeYou Basic includes 1 routine. Upgrade to BeeYou Premium for unlimited routines, routine templates, and First-Then boards!');
      return;
    }
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
            speak(`Great job! ${h.title}. ${h.encouragement}`);
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
    if (!isPremium) {
      triggerUpgrade('Avatar Customizer Studio is a BeeYou Premium feature! Start your 30-day free trial to customize hair, colors, and accessories.');
      return;
    }
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

    speak(`Wonderful reflection, ${childProfile.name}! You earned ${newEntry.starsAwarded || 3} stars.`);
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

  // Medication Actions
  const addMedication = (med: Omit<MedicationReminder, 'id' | 'takenTimesToday'>) => {
    if (!isPremium && medications.length >= 1) {
      triggerUpgrade('BeeYou Basic includes 1 medication reminder. Upgrade to BeeYou Premium for unlimited medications, pill inventory tracking, and refill alerts!');
      return;
    }
    const newMed: MedicationReminder = {
      ...med,
      id: `med-${Date.now()}`,
      takenTimesToday: [],
      lastTakenDate: new Date().toISOString().split('T')[0],
    };
    setMedications((prev) => [...prev, newMed]);
    if (settings.soundEffects) playChime('tap');
  };

  const updateMedication = (id: string, updates: Partial<MedicationReminder>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (settings.soundEffects) playChime('tap');
  };

  const takeMedicationDose = (medId: string, time?: string) => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const targetTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const targetMed = medications.find((m) => m.id === medId);
    if (!targetMed) return;

    const newQuantity = Math.max(0, targetMed.totalQuantity - targetMed.dosage);
    const updatedTaken = targetMed.takenTimesToday.includes(targetTime)
      ? targetMed.takenTimesToday
      : [...targetMed.takenTimesToday, targetTime];

    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              totalQuantity: newQuantity,
              takenTimesToday: updatedTaken,
              lastTakenDate: todayDateStr,
            }
          : m
      )
    );

    const newLog: MedicationDoseLog = {
      id: `log-${Date.now()}`,
      medicationId: targetMed.id,
      medicationName: targetMed.name,
      timestamp: new Date().toISOString(),
      doseQuantity: targetMed.dosage,
      doseUnit: targetMed.unit,
      doseTime: targetTime,
      status: 'taken',
      notes: `Taken as scheduled. Remaining: ${newQuantity} ${targetMed.unit}`,
    };
    setMedicationLogs((prev) => [newLog, ...prev]);

    awardStars(1);
    if (settings.soundEffects) playChime('star');
    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch (e) {}
    announce(`Great job taking your ${targetMed.name}! You earned 1 star!`);
  };

  const undoMedicationDose = (medId: string, time?: string) => {
    const targetMed = medications.find((m) => m.id === medId);
    if (!targetMed) return;

    const restoredQuantity = targetMed.totalQuantity + targetMed.dosage;
    const updatedTaken = time
      ? targetMed.takenTimesToday.filter((t) => t !== time)
      : targetMed.takenTimesToday.slice(0, -1);

    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              totalQuantity: restoredQuantity,
              takenTimesToday: updatedTaken,
            }
          : m
      )
    );

    setMedicationLogs((prev) => {
      const idx = prev.findIndex((l) => l.medicationId === medId);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
    if (settings.soundEffects) playChime('tap');
  };

  const restockMedication = (medId: string, addedCount: number) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? { ...m, totalQuantity: Math.max(0, m.totalQuantity + addedCount) }
          : m
      )
    );
    if (settings.soundEffects) playChime('star');
  };

  // Mood Journal Actions (Teens to Adults)
  const addMoodJournalEntry = (entry: Omit<MoodJournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodJournalEntry = {
      ...entry,
      id: `mj-${Date.now()}`,
      timestamp: Date.now(),
    };
    setMoodJournalEntries((prev) => [newEntry, ...prev]);
    if (settings.soundEffects) playChime('star');
    announce('Mood journal reflection saved.');
  };

  const updateMoodJournalEntry = (id: string, updates: Partial<MoodJournalEntry>) => {
    setMoodJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    if (settings.soundEffects) playChime('tap');
  };

  const deleteMoodJournalEntry = (id: string) => {
    setMoodJournalEntries((prev) => prev.filter((e) => e.id !== id));
    if (settings.soundEffects) playChime('clear');
  };

  // Cycle Tracker Actions (Teens to Adults)
  const updateCycleSettings = (updates: Partial<CycleSettings>) => {
    setCycleSettings((prev) => ({ ...prev, ...updates }));
    if (settings.soundEffects) playChime('tap');
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

    // If starting a new period flow (light, medium, heavy) and date is recent, update lastPeriodStartDate
    if (logData.flow && logData.flow !== 'none' && logData.flow !== 'spotting') {
      const logDate = new Date(logData.date).getTime();
      const lastStart = new Date(cycleSettings.lastPeriodStartDate).getTime();
      if (logDate > lastStart + 15 * 86400000) {
        setCycleSettings((prev) => ({ ...prev, lastPeriodStartDate: logData.date }));
      }
    }
    if (settings.soundEffects) playChime('star');
    announce('Cycle log recorded.');
  };

  const deleteCycleLog = (id: string) => {
    setCycleLogs((prev) => prev.filter((l) => l.id !== id));
    if (settings.soundEffects) playChime('clear');
  };

  const getCyclePhaseInfo = () => {
    const startDate = new Date(cycleSettings.lastPeriodStartDate || new Date().toISOString().split('T')[0]);
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
    let phaseDescription = 'Estrogen is steadily rising as follicle matures. Energy, focus, and verbal recall increase.';
    let sensoryInsight = 'Executive function and dopamine are often higher now. Great time for learning new topics or social connection.';

    if (currentCycleDay <= periodLen) {
      currentPhase = 'menstrual';
      phaseLabel = 'Menstrual Phase (Rest & Reset)';
      phaseDescription = 'Hormone levels (estrogen & progesterone) are at their baseline. Your body is resetting.';
      sensoryInsight = 'Energy may feel lower today. Extra rest, warm tea, weighted blankets, and quiet dim spaces help your nervous system regulate.';
    } else if (currentCycleDay < cycleLen - 14) {
      currentPhase = 'follicular';
      phaseLabel = 'Follicular Phase (Rising Energy)';
      phaseDescription = 'Estrogen rises towards peak. Creativity, social curiosity, and cognitive stamina build.';
      sensoryInsight = 'Sensory processing is generally resilient. Ideal window for trying new activities or tackling challenging tasks.';
    } else if (currentCycleDay <= cycleLen - 12) {
      currentPhase = 'ovulatory';
      phaseLabel = 'Ovulatory Phase (Peak Vitality)';
      phaseDescription = 'Peak estrogen and brief testosterone peak around mid-cycle.';
      sensoryInsight = 'Communication and motivation are at their highest monthly level. Stay mindful not to overcommit if social battery drains.';
    } else {
      currentPhase = 'luteal';
      phaseLabel = 'Luteal Phase (Inward Focus & Sensory Watch)';
      phaseDescription = 'Progesterone rises then drops before menstruation.';
      sensoryInsight = 'Neurodivergent individuals often experience sensory amplification, rejection sensitivity, and lower dopamine during the luteal phase. Keep noise-cancelling headphones nearby and reduce demanding masking.';
    }

    const daysUntilNextPeriod = cycleLen - currentCycleDay + 1;
    const nextPeriodDateObj = new Date(today.getTime() + daysUntilNextPeriod * 86400000);
    const nextPeriodDate = nextPeriodDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // 11 NEW FEATURES: State & Handlers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // FEATURE 1: Emergency Sensory Mode
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
    try { localStorage.setItem('beeyou_emergency_mode', JSON.stringify(emergencyMode)); } catch (e) {}
  }, [emergencyMode]);

  const setEmergencyMode = (val: Partial<EmergencySensorySettings>) => {
    setEmergencyModeState((prev) => ({ ...prev, ...val }));
  };

  const activateEmergencyMode = () => {
    setEmergencyModeState((prev) => ({ ...prev, isActive: true, activatedAt: new Date().toISOString() }));
    setShowEmergencyModal(true);
    if (settings.soundEffects) playChime('clear');
  };

  const deactivateEmergencyMode = () => {
    setEmergencyModeState((prev) => ({ ...prev, isActive: false }));
    setShowEmergencyModal(false);
  };

  // FEATURE 2: Incredible 5-Point Scale
  const DEFAULT_FIVE_POINT_LEVELS: FivePointLevelConfig[] = [
    {
      level: 1, label: 'Calm & Happy', emoji: '😊', color: 'bg-green-400', textColor: 'text-green-900',
      bodyFeelings: 'Body feels relaxed. Breathing is slow and easy. Muscles are loose.',
      actions: [{ label: 'Keep going!', emoji: '⭐' }, { label: 'Share something nice', emoji: '💬' }],
    },
    {
      level: 2, label: 'Okay / A Little Wiggly', emoji: '🙂', color: 'bg-lime-400', textColor: 'text-lime-900',
      bodyFeelings: 'A tiny bit excited or distracted. Body is mostly comfortable.',
      actions: [{ label: 'Take 2 deep breaths', emoji: '🌬️' }, { label: 'Wiggle your fingers', emoji: '🖐️' }],
    },
    {
      level: 3, label: 'Medium / Uneasy', emoji: '😐', color: 'bg-yellow-400', textColor: 'text-yellow-900',
      bodyFeelings: 'Heart might beat faster. Feeling tense, anxious, or frustrated.',
      actions: [{ label: 'Try box breathing', emoji: '📦' }, { label: 'Squeeze a fidget', emoji: '🧸' }],
    },
    {
      level: 4, label: 'Very Upset', emoji: '😟', color: 'bg-orange-400', textColor: 'text-orange-900',
      bodyFeelings: 'Lots of tension. Might want to yell or run away. Hard to think clearly.',
      actions: [{ label: 'Go to quiet space', emoji: '🤫' }, { label: 'Use Coping Toolkit', emoji: '🎧' }],
    },
    {
      level: 5, label: 'Completely Overwhelmed', emoji: '🌋', color: 'bg-red-500', textColor: 'text-red-100',
      bodyFeelings: 'Out of control. Very hard to listen or stop. Body may feel like it\'s going to explode.',
      actions: [{ label: 'Press Emergency Button', emoji: '🚨' }, { label: 'Ask for help now', emoji: '🆘' }],
    },
  ];

  const [fivePointSettings, setFivePointSettings] = useState<FivePointScaleSettings>(() => {
    try {
      const saved = localStorage.getItem('beeyou_five_point');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.levels)) {
          // Sanitize corrupted emojis if present from older browser storage
          parsed.levels = parsed.levels.map((l: FivePointLevelConfig, idx: number) => {
            const def = DEFAULT_FIVE_POINT_LEVELS[idx] || DEFAULT_FIVE_POINT_LEVELS[0];
            const isCorrupted = !l.emoji || l.emoji.includes('\u00f0') || l.emoji.includes('dY') || l.emoji.includes('');
            const cleanEmoji = isCorrupted ? def.emoji : l.emoji;
            const cleanActions = (l.actions || def.actions).map((act, aIdx) => {
              const defAct = def.actions[aIdx] || { label: act.label, emoji: '⭐' };
              const actCorrupted = !act.emoji || act.emoji.includes('\u00f0') || act.emoji.includes('dY') || act.emoji.includes('');
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
    try { localStorage.setItem('beeyou_five_point', JSON.stringify(fivePointSettings)); } catch (e) {}
  }, [fivePointSettings]);

  const updateFivePointSettings = (updates: Partial<FivePointScaleSettings>) => {
    setFivePointSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateFivePointLevel = (level: number, updates: Partial<FivePointLevelConfig>) => {
    setFivePointSettings((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => l.level === level ? { ...l, ...updates } : l),
    }));
  };

  // FEATURE 3: Decision Wheel
  const DEFAULT_WHEEL_OPTIONS: DecisionWheelOption[] = [
    { id: 'opt-1', label: 'Watch a Movie', emoji: '🎬', color: '#818cf8' },
    { id: 'opt-2', label: 'Play Outside', emoji: '⚽', color: '#34d399' },
    { id: 'opt-3', label: 'Draw or Paint', emoji: '🎨', color: '#fb923c' },
    { id: 'opt-4', label: 'Read a Book', emoji: '📚', color: '#60a5fa' },
    { id: 'opt-5', label: 'Build with Legos', emoji: '🧱', color: '#f87171' },
    { id: 'opt-6', label: 'Listen to Music', emoji: '🎵', color: '#a78bfa' },
  ];

  const [decisionWheelConfig, setDecisionWheelConfig] = useState<DecisionWheelConfig>(() => {
    try {
      const saved = localStorage.getItem('beeyou_decision_wheel');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.options)) {
          parsed.options = parsed.options.map((opt: DecisionWheelOption, idx: number) => {
            const def = DEFAULT_WHEEL_OPTIONS[idx] || DEFAULT_WHEEL_OPTIONS[0];
            const isCorrupted = !opt.emoji || opt.emoji.includes('\u00f0') || opt.emoji.includes('dY') || opt.emoji.includes('');
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
    try { localStorage.setItem('beeyou_decision_wheel', JSON.stringify(decisionWheelConfig)); } catch (e) {}
  }, [decisionWheelConfig]);

  const updateDecisionWheelConfig = (config: Partial<DecisionWheelConfig>) => {
    setDecisionWheelConfig((prev) => ({ ...prev, ...config }));
  };

  // FEATURE 4: Communication Passport
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
    try { localStorage.setItem('beeyou_passport', JSON.stringify(communicationPassport)); } catch (e) {}
  }, [communicationPassport]);

  const updateCommunicationPassport = (updates: Partial<CommunicationPassport>) => {
    setCommunicationPassport((prev) => ({ ...prev, ...updates }));
  };

  // FEATURE 5: Spoon Theory Budget
  const [spoonEntries, setSpoonEntries] = useState<SpoonBudgetEntry[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_spoon_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [showSpoonModal, setShowSpoonModal] = useState<boolean>(false);

  useEffect(() => {
    try { localStorage.setItem('beeyou_spoon_entries', JSON.stringify(spoonEntries)); } catch (e) {}
  }, [spoonEntries]);

  const addSpoonEntry = (entry: Omit<SpoonBudgetEntry, 'id'>) => {
    setSpoonEntries((prev) => [{ ...entry, id: `spoon-${Date.now()}` }, ...prev.slice(0, 29)]);
  };

  const updateSpoonEntry = (id: string, updates: Partial<SpoonBudgetEntry>) => {
    setSpoonEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
  };

  const getTodaySpoonEntry = (): SpoonBudgetEntry | null => {
    const todayStr = new Date().toISOString().split('T')[0];
    return spoonEntries.find((e) => e.date === todayStr) || null;
  };

  // FEATURE 6: Visual Pie Clock (no persistent state)
  const [showPieTimerModal, setShowPieTimerModal] = useState<boolean>(false);

  // FEATURE 7: Digital Fidget Toys (no persistent state)
  const [showFidgetModal, setShowFidgetModal] = useState<boolean>(false);

  // FEATURE 8 & 9: AAC Context Scene Switcher + Keyboard
  const [aacActiveScene, setAacActiveScene] = useState<string | null>(null);
  const [showAacKeyboardModal, setShowAacKeyboardModal] = useState<boolean>(false);

  // Consolidated Tools Hub
  const [showToolsHubModal, setShowToolsHubModal] = useState<boolean>(false);

  // Accessibility & Sensory Preferences Hub
  const [showAccessibilityModal, setShowAccessibilityModal] = useState<boolean>(false);

  // Customizable Dashboard Widgets (Clean & Minimalist by Default)
  const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
    {
      id: 'routine_schedule',
      title: 'Visual Schedule & Routine',
      emoji: '📅',
      description: 'Step-by-step routine progress, timers, and sticker unlocks',
      category: 'core',
      enabled: true,
    },
    {
      id: 'quick_aac',
      title: 'Quick Communication Phrases',
      emoji: '💬',
      description: 'Instant speech tiles for fast, motor-friendly expression',
      category: 'core',
      enabled: true,
    },
    {
      id: 'mascot_companion',
      title: 'Themed Companion & Motivation',
      emoji: '🐝',
      description: 'Daily greeting, mascot companion, and star motivation',
      category: 'core',
      enabled: false,
    },
    {
      id: 'five_point_scale',
      title: 'Incredible 5-Point Scale',
      emoji: '🌡️',
      description: 'Visual regulation thermometer with coping actions',
      category: 'sensory',
      enabled: false,
    },
    {
      id: 'spoon_budget',
      title: 'Spoon Theory Energy Budget',
      emoji: '🥄',
      description: 'Morning energy check-in and stamina cost tracker',
      category: 'wellness',
      enabled: false,
    },
    {
      id: 'pie_timer',
      title: 'Visual Pie Clock',
      emoji: '⏱️',
      description: 'Time Timer visual countdown disk with color warnings',
      category: 'sensory',
      enabled: false,
    },
    {
      id: 'decision_wheel',
      title: 'Decision Wheel Spinner',
      emoji: '🎡',
      description: 'Break choice paralysis with an animated spin wheel',
      category: 'sensory',
      enabled: false,
    },
    {
      id: 'fidget_toys',
      title: 'Digital Fidget Corner',
      emoji: '🧸',
      description: 'Bubble pop with haptics, sand ripples, and marble roll',
      category: 'sensory',
      enabled: false,
    },
    {
      id: 'medication_tracker',
      title: 'Medication Reminders',
      emoji: '💊',
      description: 'Upcoming scheduled doses, supply tracking, and logged doses',
      category: 'wellness',
      enabled: false,
    },
    {
      id: 'mood_journal',
      title: 'Mood Reflection Journal',
      emoji: '📖',
      description: 'Deep feelings, sensory overload triggers, and body logs',
      category: 'wellness',
      enabled: false,
    },
    {
      id: 'cycle_tracker',
      title: 'Cycle & Sensory Rhythm',
      emoji: '🌸',
      description: 'Hormonal wellness, sensory sensitivity, and period predictor',
      category: 'wellness',
      enabled: false,
    },
    {
      id: 'communication_passport',
      title: 'Communication Support Passport',
      emoji: '📋',
      description: '1-page printable summary for teachers, doctors & dentists',
      category: 'support',
      enabled: false,
    },
    {
      id: 'adventure_spotlight',
      title: "Today's Adventure Spotlight",
      emoji: '🚀',
      description: 'Social story and life skills preparation walkthrough',
      category: 'core',
      enabled: false,
    },
    {
      id: 'evening_reflection',
      title: 'Evening Mood Recollection',
      emoji: '🌙',
      description: 'End-of-day recollection chart and mood tracker',
      category: 'wellness',
      enabled: false,
    },
  ];

  /** Default layout for an age group: same widgets, different ones switched on. */
  const getDefaultDashboardWidgets = (age: UserAgeGroup): DashboardWidgetConfig[] => {
    const on = new Set<string>(AGE_DEFAULT_WIDGETS[age] ?? AGE_DEFAULT_WIDGETS.kid);
    const base = DEFAULT_DASHBOARD_WIDGETS.map((w) => ({ ...w, enabled: on.has(w.id) }));
    // Enabled widgets first (in the order listed for the age group), the rest after.
    const order = AGE_DEFAULT_WIDGETS[age] ?? AGE_DEFAULT_WIDGETS.kid;
    return [
      ...order.map((id) => base.find((w) => w.id === id)).filter((w): w is DashboardWidgetConfig => !!w),
      ...base.filter((w) => !on.has(w.id)),
    ];
  };

  const [dashboardWidgets, setDashboardWidgetsState] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_dashboard_widgets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = DEFAULT_DASHBOARD_WIDGETS.filter((d) => !existingIds.has(d.id));
          const combined = [...parsed, ...missing];
          if (combined.some((w) => w.enabled)) {
            return combined;
          }
        }
      }
    } catch (e) {}
    return getDefaultDashboardWidgets(userAgeGroup);
  });

  const [showDashboardCustomizer, setShowDashboardCustomizer] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_dashboard_widgets_v3', JSON.stringify(dashboardWidgets));
    } catch (e) {}
  }, [dashboardWidgets]);

  const markDashboardCustomized = (value: boolean) => {
    try {
      if (value) localStorage.setItem('beeyou_dashboard_customized', 'true');
      else localStorage.removeItem('beeyou_dashboard_customized');
    } catch (e) {}
  };

  const setDashboardWidgets = (widgets: DashboardWidgetConfig[]) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState(widgets);
  };

  const toggleDashboardWidget = (id: DashboardWidgetId) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const reorderDashboardWidgets = (fromIndex: number, toIndex: number) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const resetDashboardWidgets = () => {
    markDashboardCustomized(false);
    setDashboardWidgetsState(getDefaultDashboardWidgets(userAgeGroup));
  };

  // FEATURES 10 & 11: Magic Task Breakdown & Voice Recording
  // These live inside routine steps (microSteps and audioDataUrl fields) — no extra top-level state.

  // ── FEATURE: Editable Help Alerts & Caregiver Responses ─────────────────────
  const [helpAlertPresets, setHelpAlertPresets] = useState<HelpAlertPreset[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_help_alert_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_HELP_ALERT_PRESETS;
  });

  const [caregiverResponses, setCaregiverResponses] = useState<CaregiverResponsePreset[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_caregiver_responses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CAREGIVER_RESPONSES;
  });

  const [showEditAlertsModal, setShowEditAlertsModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_help_alert_presets', JSON.stringify(helpAlertPresets));
    } catch (e) {}
  }, [helpAlertPresets]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_caregiver_responses', JSON.stringify(caregiverResponses));
    } catch (e) {}
  }, [caregiverResponses]);

  const addHelpAlertPreset = (preset: Omit<HelpAlertPreset, 'id'>) => {
    const newPreset: HelpAlertPreset = {
      ...preset,
      id: `alert-custom-${Date.now()}`,
      isCustom: true,
    };
    setHelpAlertPresets((prev) => [...prev, newPreset]);
    if (settings.soundEffects) playChime('complete');
  };

  const updateHelpAlertPreset = (id: string, updates: Partial<HelpAlertPreset>) => {
    setHelpAlertPresets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteHelpAlertPreset = (id: string) => {
    setHelpAlertPresets((prev) => prev.filter((a) => a.id !== id));
  };

  const resetHelpAlertPresets = () => {
    setHelpAlertPresets(DEFAULT_HELP_ALERT_PRESETS);
  };

  const addCaregiverResponse = (resp: Omit<CaregiverResponsePreset, 'id'>) => {
    const newResp: CaregiverResponsePreset = {
      ...resp,
      id: `resp-custom-${Date.now()}`,
      isCustom: true,
    };
    setCaregiverResponses((prev) => [...prev, newResp]);
    if (settings.soundEffects) playChime('complete');
  };

  const updateCaregiverResponse = (id: string, updates: Partial<CaregiverResponsePreset>) => {
    setCaregiverResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteCaregiverResponse = (id: string) => {
    setCaregiverResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const resetCaregiverResponses = () => {
    setCaregiverResponses(DEFAULT_CAREGIVER_RESPONSES);
  };

  // ── FEATURE: Editable Calm Coping Strategies & Breathing Pacer ─────────────
  const [calmStrategies, setCalmStrategies] = useState<CalmCopingStrategy[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_calm_strategies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CALM_STRATEGIES;
  });

  const [breathingConfig, setBreathingConfig] = useState<BreathingPacerConfig>(() => {
    try {
      const saved = localStorage.getItem('beeyou_breathing_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.inhaleSec) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BREATHING_PACER_CONFIG;
  });

  const [showEditCalmModal, setShowEditCalmModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_calm_strategies', JSON.stringify(calmStrategies));
    } catch (e) {}
  }, [calmStrategies]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_breathing_config', JSON.stringify(breathingConfig));
    } catch (e) {}
  }, [breathingConfig]);

  const addCalmStrategy = (strategy: Omit<CalmCopingStrategy, 'id'>) => {
    const newStrat: CalmCopingStrategy = {
      ...strategy,
      id: `calm-custom-${Date.now()}`,
      isCustom: true,
    };
    setCalmStrategies((prev) => [...prev, newStrat]);
    if (settings.soundEffects) playChime('complete');
  };

  const updateCalmStrategy = (id: string, updates: Partial<CalmCopingStrategy>) => {
    setCalmStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteCalmStrategy = (id: string) => {
    setCalmStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  const resetCalmStrategies = () => {
    setCalmStrategies(DEFAULT_CALM_STRATEGIES);
  };

  const updateBreathingConfig = (config: Partial<BreathingPacerConfig>) => {
    setBreathingConfig((prev) => ({ ...prev, ...config }));
  };

  const resetBreathingConfig = () => {
    setBreathingConfig(DEFAULT_BREATHING_PACER_CONFIG);
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
    setMedications(INITIAL_MEDICATIONS);
    setMedicationLogs(INITIAL_MEDICATION_LOGS);
    setMoodJournalEntries(INITIAL_MOOD_JOURNAL_ENTRIES);
    setCycleSettings(INITIAL_CYCLE_SETTINGS);
    setCycleLogs(INITIAL_CYCLE_LOGS);
    setUserAgeGroupState('kid');
    setEnabledFeatures(getDefaultFeaturesForAge('kid'));
    setHelpAlertPresets(DEFAULT_HELP_ALERT_PRESETS);
    setCaregiverResponses(DEFAULT_CAREGIVER_RESPONSES);
    setCalmStrategies(DEFAULT_CALM_STRATEGIES);
    setBreathingConfig(DEFAULT_BREATHING_PACER_CONFIG);
    setSentence([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('beeyou_daily_recollections');
    localStorage.removeItem('beeyou_medications');
    localStorage.removeItem('beeyou_mood_journal_entries');
    localStorage.removeItem('beeyou_cycle_settings');
    localStorage.removeItem('beeyou_cycle_logs');
    localStorage.removeItem('beeyou_user_age_group');
    localStorage.removeItem('beeyou_enabled_features');
    localStorage.removeItem('beeyou_onboarding_completed');
    localStorage.removeItem('beeyou_help_alert_presets');
    localStorage.removeItem('beeyou_caregiver_responses');
    localStorage.removeItem('beeyou_calm_strategies');
    localStorage.removeItem('beeyou_breathing_config');
    if (settings.soundEffects) playChime('clear');
  };

  const exportProfileBackup = (): BeeYouBackupData => {
    const backup: BeeYouBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'BeeYou',
      childProfile,
      avatar,
      settings,
      aacItems,
      quickPhrases,
      routines,
      adventures,
      skills,
      habits,
      worldState,
      socialStories,
      dailyRecollections,
      medications,
      cycleSettings,
      userAgeGroup,
      enabledFeatures,
      activeThemeId: activeTheme?.id || 'classic',
    };

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const safeName = (childProfile.name || 'beeyou').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `beeyou-backup-${safeName}-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (settings.soundEffects) playChime('complete');
    } catch (e) {
      console.error('Export download error', e);
    }

    return backup;
  };

  const importProfileBackup = (importedJson: string | object): { success: boolean; message: string } => {
    try {
      const data: any = typeof importedJson === 'string' ? JSON.parse(importedJson) : importedJson;
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid backup file format.' };
      }

      if (data.childProfile) setChildProfile(data.childProfile);
      if (data.avatar) setAvatar(data.avatar);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.aacItems) && data.aacItems.length > 0) setAacItems(data.aacItems);
      if (Array.isArray(data.quickPhrases)) setQuickPhrases(data.quickPhrases);
      if (Array.isArray(data.routines) && data.routines.length > 0) setRoutines(data.routines);
      if (Array.isArray(data.adventures)) setAdventures(data.adventures);
      if (Array.isArray(data.skills)) setSkills(data.skills);
      if (Array.isArray(data.habits)) setHabits(data.habits);
      if (data.worldState) setWorldState(data.worldState);
      if (Array.isArray(data.socialStories)) setSocialStories(data.socialStories);
      if (Array.isArray(data.dailyRecollections)) setDailyRecollections(data.dailyRecollections);
      if (Array.isArray(data.medications)) setMedications(data.medications);
      if (data.cycleSettings) setCycleSettings(data.cycleSettings);
      if (data.userAgeGroup) setUserAgeGroupState(data.userAgeGroup);
      if (data.enabledFeatures) setEnabledFeatures(data.enabledFeatures);
      if (data.activeThemeId) setActiveThemeId(data.activeThemeId);

      if (settings.soundEffects) playChime('complete');
      return { success: true, message: `Successfully restored profile backup for ${data.childProfile?.name || 'child'}!` };
    } catch (err: any) {
      return { success: false, message: `Failed to restore: ${err.message || 'Unknown error'}` };
    }
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
        showFamilyAuthModal,
        setShowFamilyAuthModal,
        showAboutMeModal,
        setShowAboutMeModal,
        showAvatarCreator,
        setShowAvatarCreator,
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
        favoriteSentences,
        showAacGuideModal,
        setShowAacGuideModal,
        showMyDayGuideModal,
        setShowMyDayGuideModal,
        speak,
        announce,
        addToSentence,
        speakSentence,
        clearSentence,
        removeLastFromSentence,
        saveSentenceAsQuickPhrase,
        addFavoriteSentence,
        deleteFavoriteSentence,
        togglePinFavoriteSentence,
        recordSentenceSpoken,
        addAacItem,
        updateAacItem,
        toggleAacFavorite,
        importAacPack,
        upgradeAllAacToClinicalSymbols,
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

        userAgeGroup,
        setUserAgeGroup,
        userRole,
        setUserRole,
        emergencyContact,
        setEmergencyContact,
        caregiverPermissions,
        updateCaregiverPermissions,
        linkedDeviceCode,
        setLinkedDeviceCode,
        enabledFeatures,
        updateEnabledFeatures,
        toggleFeature,
        showOnboardingModal,
        setShowOnboardingModal,
        reopenOnboarding,

        medications,
        medicationLogs,
        showMedicationModal,
        setShowMedicationModal,
        addMedication,
        updateMedication,
        deleteMedication,
        takeMedicationDose,
        undoMedicationDose,
        restockMedication,

        moodJournalEntries,
        addMoodJournalEntry,
        updateMoodJournalEntry,
        deleteMoodJournalEntry,
        showMoodJournalModal,
        setShowMoodJournalModal,

        cycleSettings,
        updateCycleSettings,
        cycleLogs,
        logCycleDay,
        deleteCycleLog,
        showCycleTrackerModal,
        setShowCycleTrackerModal,
        getCyclePhaseInfo,

        subscription,
        isPremium,
        startFreeTrial,
        activateSubscription,
        cancelSubscription,
        setSubscriptionTier,
        setBillingCycle,
        showPaywallModal,
        setShowPaywallModal,
        paywallTriggerReason,
        triggerUpgrade,
        getTrialDaysRemaining,

        // 11 New Competitive Features
        emergencyMode,
        setEmergencyMode,
        showEmergencyModal,
        setShowEmergencyModal,
        activateEmergencyMode,
        deactivateEmergencyMode,

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

        aacActiveScene,
        setAacActiveScene,

        showAacKeyboardModal,
        setShowAacKeyboardModal,

        showToolsHubModal,
        setShowToolsHubModal,

        showAccessibilityModal,
        setShowAccessibilityModal,

        dashboardWidgets,
        setDashboardWidgets,
        toggleDashboardWidget,
        reorderDashboardWidgets,
        resetDashboardWidgets,
        showDashboardCustomizer,
        setShowDashboardCustomizer,

        // Editable Help Alerts & Caregiver Responses
        helpAlertPresets,
        addHelpAlertPreset,
        updateHelpAlertPreset,
        deleteHelpAlertPreset,
        resetHelpAlertPresets,
        caregiverResponses,
        addCaregiverResponse,
        updateCaregiverResponse,
        deleteCaregiverResponse,
        resetCaregiverResponses,
        showEditAlertsModal,
        setShowEditAlertsModal,

        // Editable Calm Coping Strategies & Breathing Pacer
        calmStrategies,
        addCalmStrategy,
        updateCalmStrategy,
        deleteCalmStrategy,
        resetCalmStrategies,
        breathingConfig,
        updateBreathingConfig,
        resetBreathingConfig,
        showEditCalmModal,
        setShowEditCalmModal,

        exportProfileBackup,
        importProfileBackup,

        // Real-time Caregiver Connection
        connectionStatus,
        isCaregiverConnected,

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
