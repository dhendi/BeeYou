import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  AppLanguage,
  PlansChangedState,
  EmotionRecord,
  EmotionType,
  CaregiverMessage,
  EarnedRoutineSticker,
  AppTheme,
  UserPersona,
  UserAgeGroup,
  EnabledFeatures,
  getDefaultFeaturesForAge,
  MedicationReminder,
  MedicationDoseLog,
  MoodJournalEntry,
  DailyRecollectionEntry,
  CycleSettings,
  CycleDailyLog,
  CyclePhase,
  SubscriptionInfo,
  SubscriptionTier,
  BillingCycle,
  EmergencySensorySettings,
  FivePointScaleSettings,
  FivePointLevelConfig,
  DecisionWheelConfig,
  CommunicationPassport,
  SpoonBudgetEntry,
  DashboardWidgetConfig,
  DashboardWidgetId,
  BeeYouBackupData,
  UserAccountRole,
  CaregiverPermissions,
  EmergencySupportContact,
  HelpAlertPreset,
  CaregiverResponsePreset,
  CalmCopingStrategy,
  BreathingPacerConfig,
} from '../types';
import { normalizePersona, personaToAgeGroup } from '../utils/personaHelpers';
import {
  INITIAL_CHILD_PROFILE,
  INITIAL_APP_SETTINGS,
} from '../data/defaultData';
import { playChime } from '../utils/audio';
import { setHapticsEnabled } from '../services/haptics';
import { indexOfflineData } from '../utils/offlineStorage';
import {
  syncChildStatusToCaregiver,
  ConnectionStatusInfo,
} from '../services/caregiverSync';
import { wipeDeviceStorage, getSyncSecureCaregiverPin, getSecureCaregiverPin, saveSecureCaregiverPin } from '../services/authService';
import { setLanguage, getLanguage, subscribeToLanguage } from '../services/translator';
import { AacVoiceLoadingScreen } from '../components/common/AacVoiceLoadingScreen';
import { isVoicePackLoaded } from '../services/aacPreloadService';
import { preloadPiperVoice } from '../services/piperTtsService';
import { getVoicePersonaById, getDefaultVoicePersonaForLanguage } from '../data/voicePersonasData';

// Domain Hooks
import { useSpeechEngine } from '../hooks/useSpeechEngine';
import { useSubscriptionState } from '../hooks/useSubscriptionState';
import { useGamificationState } from '../hooks/useGamificationState';
import { useRoutinesSchedule } from '../hooks/useRoutinesSchedule';
import { useAacCommunication } from '../hooks/useAacCommunication';
import { useSensoryToolsState } from '../hooks/useSensoryToolsState';
import { useCustomToolsState } from '../hooks/useCustomToolsState';
import { useMedicationState } from '../hooks/useMedicationState';
import { useMoodJournalState } from '../hooks/useMoodJournalState';
import { useCycleTrackerState } from '../hooks/useCycleTrackerState';
import { useRecollectionsState } from '../hooks/useRecollectionsState';
import { useThemeState } from '../hooks/useThemeState';
import { useFamilyCloudSync } from '../hooks/useFamilyCloudSync';
import { reconcileAacItems, reconcileRoutines } from '../utils/aacHelpers';

export type ChildViewType =
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
  | 'rewards'
  | 'scrapbook'
  | 'more'
  | 'settings'
  | 'visual-timer'
  | 'first-then'
  | 'parent-portal'
  | 'sound-lab'
  | 'calm'
  | 'sensory-studio'
  | 'social-stories'
  | 'caregiver-portal';

export interface AppContextType {
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
  copingToolkitTab: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound';
  setCopingToolkitTab: (tab: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound') => void;
  openCopingToolkit: (tab?: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound') => void;
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
  showEmailVerificationModal: boolean;
  setShowEmailVerificationModal: (val: boolean) => void;
  showAboutMeModal: boolean;
  setShowAboutMeModal: (val: boolean) => void;
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
  speak: (text: string, options?: { force?: boolean; voicePersona?: string; previewAudio?: boolean; voiceURI?: string; gestureTime?: number }) => Promise<void>;
  announce: (text: string, options?: { force?: boolean }) => Promise<void>;
  addToSentence: (item: AACItem, options?: { gestureTime?: number }) => void;
  speakSentence: (gestureTime?: number) => Promise<void>;
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
  addRoutine: (routine: Omit<Routine, 'id'> & { id?: string }) => Routine;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  toggleFirstThen: (routineId: string, part: 'first' | 'then') => void;

  // Plans Changed
  plansChanged: PlansChangedState;
  activatePlansChanged: (data: Partial<PlansChangedState>) => void;
  applyPlansChangedToRoutine: (data?: Partial<PlansChangedState>) => void;
  dismissPlansChanged: () => void;

  // Adventures
  adventures: LifeAdventure[];
  addAdventure: (adventure: Omit<LifeAdventure, 'id'>) => void;
  updateAdventure: (adventure: LifeAdventure) => void;
  deleteAdventure: (id: string) => void;
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
  updateSocialStory: (story: SocialStory) => void;
  deleteSocialStory: (id: string) => void;

  awardStars: (amount: number) => void;

  // Profile & Settings
  childProfile: ChildProfile;
  updateChildProfile: (profile: Partial<ChildProfile>) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  triggerVoicePreload: (persona?: string, lang?: string) => Promise<void>;
  currentLanguage: AppLanguage;

  // Digital Routine Stickers & Rewards
  earnedStickers: EarnedRoutineSticker[];
  newlyAwardedSticker: EarnedRoutineSticker | null;
  awardRoutineSticker: (routine: Routine) => EarnedRoutineSticker;
  dismissStickerCelebration: () => void;

  // Daily Mood & Recollection
  dailyRecollections: DailyRecollectionEntry[];
  setDailyRecollections: React.Dispatch<React.SetStateAction<DailyRecollectionEntry[]>>;
  showRecollectionModal: boolean;
  setShowRecollectionModal: (val: boolean) => void;
  addDailyRecollection: (entry: Omit<DailyRecollectionEntry, 'id' | 'timestamp'>) => void;
  updateDailyRecollection: (id: string, updates: Partial<DailyRecollectionEntry>) => void;
  deleteDailyRecollection: (id: string) => void;
  clearAllDailyRecollections: () => void;

  // Themes & Customization
  themes: AppTheme[];
  activeThemeId: string;
  activeTheme: AppTheme;
  setTheme: (id: string) => void;
  buyTheme: (themeId: string) => boolean;
  createCustomTheme: (theme: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>) => AppTheme;
  updateCustomTheme: (id: string, updates: Partial<AppTheme>) => void;
  updateTheme: (id: string, updates: Partial<AppTheme>) => void;
  resetThemeToPreset: (id: string) => void;
  deleteCustomTheme: (id: string) => void;
  showThemeModal: boolean;
  setShowThemeModal: (val: boolean) => void;
  editingThemeId: string | null;
  setEditingThemeId: (id: string | null) => void;

  // Onboarding & Multi-Age Adaptability & Role
  userPersona: UserPersona;
  setUserPersona: (persona: UserPersona) => void;
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
  showPostOnboardingSpotlight: boolean;
  setShowPostOnboardingSpotlight: (val: boolean) => void;

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

  // Mood Journal
  moodJournalEntries: MoodJournalEntry[];
  addMoodJournalEntry: (entry: Omit<MoodJournalEntry, 'id' | 'timestamp'>) => void;
  updateMoodJournalEntry: (id: string, updates: Partial<MoodJournalEntry>) => void;
  deleteMoodJournalEntry: (id: string) => void;
  showMoodJournalModal: boolean;
  setShowMoodJournalModal: (val: boolean) => void;

  // Cycle Tracker
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

  // Subscription & Membership Tiering
  subscription: SubscriptionInfo;
  isPremium: boolean;
  isRestoring: boolean;
  startFreeTrial: (cycle?: BillingCycle) => void;
  activateSubscription: (cycle?: BillingCycle) => void;
  cancelSubscription: () => void;
  restorePurchases: () => Promise<{ success: boolean; restored: boolean; message: string }>;
  purchaseSubscription: (
    cycle: BillingCycle,
    simulateScenario?: 'success' | 'payment_declined' | 'user_cancelled' | 'network_interrupted' | 'parental_approval_pending'
  ) => Promise<{ success: boolean; subscription: SubscriptionInfo; error?: string; errorCode?: string }>;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  showPaywallModal: boolean;
  setShowPaywallModal: (val: boolean) => void;
  paywallTriggerReason: string;
  triggerUpgrade: (reason?: string) => void;
  getTrialDaysRemaining: () => number;

  // Emergency Sensory Red Button & Safe Mode
  emergencyMode: EmergencySensorySettings;
  setEmergencyMode: (val: Partial<EmergencySensorySettings>) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (val: boolean) => void;
  activateEmergencyMode: () => void;
  deactivateEmergencyMode: () => void;
  isSafeModeActive: boolean;
  activateSafeMode: () => void;
  deactivateSafeMode: () => void;

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

  // Visual Pie Clock & Fidget
  showPieTimerModal: boolean;
  setShowPieTimerModal: (val: boolean) => void;
  showFidgetModal: boolean;
  setShowFidgetModal: (val: boolean) => void;

  // AAC Context Scene & Keyboard
  aacActiveScene: string | null;
  setAacActiveScene: (scene: string | null) => void;
  showAacKeyboardModal: boolean;
  setShowAacKeyboardModal: (val: boolean) => void;

  // Accessibility
  showAccessibilityModal: boolean;
  setShowAccessibilityModal: (val: boolean) => void;

  // Customizable Dashboard
  dashboardWidgets: DashboardWidgetConfig[];
  setDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  toggleDashboardWidget: (id: DashboardWidgetId) => void;
  reorderDashboardWidgets: (fromIndex: number, toIndex: number) => void;
  resetDashboardWidgets: () => void;
  showDashboardCustomizer: boolean;
  setShowDashboardCustomizer: (val: boolean) => void;

  // Help Alerts & Caregiver Responses
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

  // Calm Down Tools & Breathing Pacer
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

  // Printable Schedules & Scrapbook
  showPrintScheduleModal: boolean;
  setShowPrintScheduleModal: (val: boolean) => void;
  printScheduleConfig: {
    mode: 'checklist' | 'cards' | 'first-then' | 'scrapbook';
    routineId?: string;
    pageIndex?: number;
  };
  openPrintSchedule: (config?: Partial<{
    mode: 'checklist' | 'cards' | 'first-then' | 'scrapbook';
    routineId?: string;
    pageIndex?: number;
  }>) => void;

  // Backup & Restore
  exportProfileBackup: () => BeeYouBackupData;
  importProfileBackup: (importedJson: string | object) => { success: boolean; message: string };

  // Utilities
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'beeyou_app_state_v1';

// Automatically migrate any cached /assets/stickers/*.png paths in localStorage to .webp
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && raw.includes('/assets/stickers/') && raw.includes('.png')) {
      const migrated = raw.replace(/(\/assets\/stickers\/[a-zA-Z0-9_\-\/]+)\.png/g, '$1.webp');
      if (migrated !== raw) {
        localStorage.setItem(STORAGE_KEY, migrated);
      }
    }
  } catch {}
}

export const AppProvider: React.FC<{ children: ReactNode; initialRole?: 'caregiver' | 'child' }> = ({
  children,
  initialRole,
}) => {
  // Navigation & View Modals
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
  const [copingToolkitTab, setCopingToolkitTab] = useState<'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound'>('breathing');

  const openCopingToolkit = useCallback((tab?: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound') => {
    if (tab) setCopingToolkitTab(tab);
    setShowCopingToolkit(true);
  }, []);

  // Printable Schedules & Scrapbook Studio State
  const [showPrintScheduleModal, setShowPrintScheduleModal] = useState<boolean>(false);
  const [printScheduleConfig, setPrintScheduleConfig] = useState<{
    mode: 'checklist' | 'cards' | 'first-then' | 'scrapbook';
    routineId?: string;
    pageIndex?: number;
  }>({
    mode: 'checklist',
  });

  const openPrintSchedule = useCallback((config?: Partial<{
    mode: 'checklist' | 'cards' | 'first-then' | 'scrapbook';
    routineId?: string;
    pageIndex?: number;
  }>) => {
    setPrintScheduleConfig((prev) => ({
      mode: config?.mode || prev.mode || 'checklist',
      routineId: config?.routineId ?? prev.routineId,
      pageIndex: config?.pageIndex ?? prev.pageIndex ?? 0,
    }));
    setShowPrintScheduleModal(true);
    playChime('tap');
  }, []);

  const [showAboutMeModal, setShowAboutMeModal] = useState<boolean>(false);
  const [activeContextTopic, setActiveContextTopic] = useState<string | null>(null);

  // Root Profile & Settings
  const [childProfile, setChildProfile] = useState<ChildProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.childProfile) {
          // Clean legacy mock demo user data if present
          if (parsed.childProfile.name === 'Leo') {
            parsed.childProfile.name = '';
          }
          if (parsed.childProfile.aboutMe?.emergencyContacts?.some((c: any) => c.name?.includes('Sarah'))) {
            parsed.childProfile.aboutMe.emergencyContacts = [];
            parsed.childProfile.aboutMe.allergiesOrMedical = [];
            parsed.childProfile.aboutMe.bloodType = '';
            parsed.childProfile.aboutMe.speechSummary = '';
          }
          return parsed.childProfile;
        }
      }
    } catch (e) {}
    return INITIAL_CHILD_PROFILE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const secPin = getSyncSecureCaregiverPin();
    const storedLang = typeof window !== 'undefined' ? (localStorage.getItem('beeyou_lang') as AppLanguage) : null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          const loaded = { ...INITIAL_APP_SETTINGS, ...parsed.settings };
          if (secPin) loaded.pin = secPin;
          if (!loaded.voiceRate || loaded.voiceRate <= 0.85) loaded.voiceRate = 1.0;
          if (storedLang && storedLang !== loaded.language) {
            loaded.language = storedLang;
          }
          return loaded;
        }
      }
    } catch (e) {}
    return {
      ...INITIAL_APP_SETTINGS,
      language: storedLang || INITIAL_APP_SETTINGS.language,
      pin: secPin || INITIAL_APP_SETTINGS.pin,
    };
  });

  // Active synchronized language state
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('beeyou_lang') as AppLanguage) : null;
    return stored || settings.language || 'en';
  });

  useEffect(() => {
    return subscribeToLanguage((lang) => {
      const validLang = (lang as AppLanguage) || 'en';
      setCurrentLanguage(validLang);
      setSettings((prev) => (prev.language === validLang ? prev : { ...prev, language: validLang }));
    });
  }, []);

  // Re-sync secure PIN from device storage asynchronously
  useEffect(() => {
    getSecureCaregiverPin().then((secPin) => {
      if (secPin) {
        setSettings((prev) => (prev.pin !== secPin ? { ...prev, pin: secPin } : prev));
      }
    });
  }, []);

  const updateChildProfile = (profile: Partial<ChildProfile>) => {
    setChildProfile((prev) => ({ ...prev, ...profile }));
  };

  

  // Onboarding, Multi-Age Adaptability & Account Role
  const [userPersona, setUserPersonaState] = useState<UserPersona>(() => {
    try {
      const savedPersona = localStorage.getItem('beeyou_user_persona');
      if (savedPersona === 'child' || savedPersona === 'teen' || savedPersona === 'adult') {
        return savedPersona;
      }
      const savedAge = localStorage.getItem('beeyou_user_age_group');
      return normalizePersona(savedAge);
    } catch (e) {}
    return 'child';
  });

  const [userAgeGroup, setUserAgeGroupState] = useState<UserAgeGroup>(() => {
    try {
      const savedPersona = localStorage.getItem('beeyou_user_persona');
      if (savedPersona) return personaToAgeGroup(normalizePersona(savedPersona));
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
        if (
          sess === 'child_dependent' ||
          sess === 'teen_dependent' ||
          sess === 'independent_adult' ||
          sess === 'caregiver'
        ) {
          return sess as UserAccountRole;
        }

        if (window.location.port === '3000') return 'child_dependent';
      }
      const saved = localStorage.getItem('beeyou_user_role');
      if (
        saved === 'child_dependent' ||
        saved === 'teen_dependent' ||
        saved === 'independent_adult' ||
        saved === 'caregiver'
      ) {
        return saved;
      }
    } catch (e) {}
    return 'child_dependent';
  });

  const setUserRole = (role: UserAccountRole) => {
    setUserRoleState(role);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('beeyou_user_role', role);
      }
      localStorage.setItem('beeyou_user_role', role);
    } catch (e) {}
  };

  const [enabledFeatures, setEnabledFeatures] = useState<EnabledFeatures>(() => {
    try {
      const saved = localStorage.getItem('beeyou_enabled_features');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultFeaturesForAge('kid');
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => {
    if (initialRole === 'caregiver') return false;
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('role') === 'caregiver' || params.get('mode') === 'caregiver') return false;
        if (window.location.port === '3001' || window.location.pathname.startsWith('/caregiver')) return false;
        const sessionView = sessionStorage.getItem('beeyou_active_device_view');
        if (sessionView === 'caregiver') return false;
      }
      const completed = localStorage.getItem('beeyou_onboarding_completed');
      if (completed === 'true') return false;
      const localView = localStorage.getItem('beeyou_active_device_view');
      if (localView === 'caregiver') return false;
      const famAccount = localStorage.getItem('beeyou_family_account');
      if (famAccount) {
        const parsed = JSON.parse(famAccount);
        if (parsed?.email && !parsed.isDemoAccount) return false;
      }
    } catch (e) {}
    return true;
  });

  const [showPostOnboardingSpotlight, setShowPostOnboardingSpotlight] = useState<boolean>(false);

  const setUserPersona = (persona: UserPersona) => {
    setUserPersonaState(persona);
    const mappedAge = personaToAgeGroup(persona);
    setUserAgeGroupState(mappedAge);
    try {
      localStorage.setItem('beeyou_user_persona', persona);
      localStorage.setItem('beeyou_user_age_group', mappedAge);
    } catch (e) {}
  };

  const setUserAgeGroup = (age: UserAgeGroup) => {
    setUserAgeGroupState(age);
    const mappedPersona = normalizePersona(age);
    setUserPersonaState(mappedPersona);
    try {
      localStorage.setItem('beeyou_user_age_group', age);
      localStorage.setItem('beeyou_user_persona', mappedPersona);
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
    return next;
  };

  const updateEnabledFeatures = (updates: Partial<EnabledFeatures>) => {
    const wasAacActive =
      enabledFeatures?.aacCommunication !== false &&
      enabledFeatures?.aac !== false &&
      settings.features?.aacCommunication !== false &&
      settings.features?.aac !== false;

    const nextFeatures = normalizeFeatures(updates, enabledFeatures);
    const willAacBeActive =
      nextFeatures?.aacCommunication !== false &&
      nextFeatures?.aac !== false;

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

    // When activating AAC from a disabled state, display loading screen until voices are prepared
    if (!wasAacActive && willAacBeActive) {
      const p = settings.voicePersona || 'amy';
      const l = settings.language || 'en';
      if (p !== 'system' && !isVoicePackLoaded(p, l)) {
        triggerVoicePreload(p, l, true);
      }
    }
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    updateEnabledFeatures({ [key]: !enabledFeatures[key] });
  };

  const reopenOnboarding = () => {
    setShowOnboardingModal(true);
  };

  // 1. Subscription Hook
  const subscriptionState = useSubscriptionState();



  const [voiceLoadingState, setVoiceLoadingState] = useState<{
    isOpen: boolean;
    persona: string;
    language: string;
  }>({
    isOpen: false,
    persona: 'amy',
    language: 'en',
  });

  const triggerVoicePreload = useCallback(async (persona?: string, lang?: string, force = false) => {
    const p = persona || settings.voicePersona || 'amy';
    const l = lang || settings.language || 'en';
    if (p === 'system') {
      // System native voice runs 100% on-device via Web Speech API, zero download required
      return;
    }

    const aacActive =
      enabledFeatures?.aacCommunication !== false &&
      enabledFeatures?.aac !== false &&
      settings.features?.aacCommunication !== false &&
      settings.features?.aac !== false;

    // If AAC is not enabled, skip voice preloading unless explicitly forced by activating AAC
    if (!aacActive && !force) {
      return;
    }

    setVoiceLoadingState({
      isOpen: true,
      persona: p,
      language: l,
    });
  }, [settings.voicePersona, settings.language, settings.features, enabledFeatures]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (newSettings.pin) {
      saveSecureCaregiverPin(newSettings.pin).catch(() => {});
    }
    if (newSettings.language) {
      setLanguage(newSettings.language).catch(() => {});

      // Automatically switch to dedicated default voice for new language if persona is not explicitly specified
      if (!newSettings.voicePersona && newSettings.language !== settings.language) {
        const currentVoice = getVoicePersonaById(settings.voicePersona);
        const newNormLang = newSettings.language.toLowerCase().split(/[-_]/)[0];
        const currentVoiceLang = (currentVoice.language || 'en').toLowerCase().split(/[-_]/)[0];

        // If the current persona is not dedicated to the new language, auto-switch to new language default
        if (currentVoice.id !== 'system' && currentVoiceLang !== newNormLang) {
          newSettings.voicePersona = getDefaultVoicePersonaForLanguage(newSettings.language);
        }
      }
    }

    const wasAacActive =
      enabledFeatures?.aacCommunication !== false &&
      enabledFeatures?.aac !== false &&
      settings.features?.aacCommunication !== false &&
      settings.features?.aac !== false;

    const willAacBeActive = newSettings.features
      ? (newSettings.features.aacCommunication !== false && newSettings.features.aac !== false)
      : wasAacActive;

    const isActivatingAac = !wasAacActive && willAacBeActive;

    if (newSettings.voicePersona || newSettings.language || isActivatingAac) {
      const p = newSettings.voicePersona || settings.voicePersona || 'amy';
      const l = newSettings.language || settings.language || 'en';
      const pObj = getVoicePersonaById(p);
      if (p !== 'system' && pObj.piperVoice && willAacBeActive) {
        if (!isVoicePackLoaded(p, l) || isActivatingAac) {
          triggerVoicePreload(p, l, true);
        } else {
          // Warm up target voice in memory eagerly upon selection
          preloadPiperVoice(p, l).catch(() => {});
        }
      }
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };


  // 2. Speech Engine Hook
  const speechEngine = useSpeechEngine({
    settings,
    isPremium: subscriptionState.isPremium,
  });

  // 3. Gamification Hook
  const gamification = useGamificationState({
    childName: childProfile.name,
    isPremium: subscriptionState.isPremium,
    soundEffects: settings.soundEffects,
    triggerUpgrade: subscriptionState.triggerUpgrade,
    speak: speechEngine.speak,
  });

  // 4. Routines & Schedule Hook
  const routinesSchedule = useRoutinesSchedule({
    soundEffects: settings.soundEffects,
    isPremium: subscriptionState.isPremium,
    triggerUpgrade: subscriptionState.triggerUpgrade,
    onRoutineCompleted: (routine) => {
      gamification.awardRoutineSticker(routine);
    },
  });

  // 5. AAC Communication Hook
  const aacComm = useAacCommunication({
    language: settings.language,
    soundEffects: settings.soundEffects,
    autoSpeakSentence: settings.autoSpeakSentence,
    childName: childProfile.name,
    currentMood: gamification.currentMood,
    speak: speechEngine.speak,
  });

  // 6. Sensory & Regulation Tools Hook
  const sensoryTools = useSensoryToolsState({
    childName: childProfile.name,
    soundEffects: settings.soundEffects,
  });

  // 7. Custom Dashboard Tools & Help Alerts Hook
  const customTools = useCustomToolsState({
    userAgeGroup,
    soundEffects: settings.soundEffects,
  });

  // 8. Medication Reminders Hook
  const medication = useMedicationState({
    isPremium: subscriptionState.isPremium,
    soundEffects: settings.soundEffects,
    triggerUpgrade: subscriptionState.triggerUpgrade,
    awardStars: gamification.awardStars,
    announce: speechEngine.announce,
  });

  // 9. Mood Journal Hook
  const moodJournal = useMoodJournalState({
    soundEffects: settings.soundEffects,
    announce: speechEngine.announce,
  });

  // 10. Cycle Tracker Hook
  const cycleTracker = useCycleTrackerState({
    soundEffects: settings.soundEffects,
    announce: speechEngine.announce,
  });

  // 11. Daily Recollections Hook
  const recollections = useRecollectionsState({
    soundEffects: settings.soundEffects,
    childName: childProfile.name,
    recordEmotion: gamification.recordEmotion,
    awardStars: gamification.awardStars,
    speak: speechEngine.speak,
  });

  // 12. Themes Hook
  const themeState = useThemeState({
    isPremium: subscriptionState.isPremium,
    stars: gamification.earnedStickers.length,
    soundEffects: settings.soundEffects,
    spokenAnnouncements: !!settings.spokenAnnouncements,
    triggerUpgrade: subscriptionState.triggerUpgrade,
    deductStars: (amount: number) => gamification.awardStars(-amount),
    speak: speechEngine.speak,
  });

  // 13. Family Cloud Sync Hook
  const familyCloudSync = useFamilyCloudSync({
    userRole,
    isParentMode,
    childName: childProfile.name,
    currentMood: gamification.currentMood,
    childView,
    stars: gamification.earnedStickers.length,
    habitsCompletedToday: gamification.habits.filter((h) => h.completedToday).length,
    totalHabits: gamification.habits.length,
    routines: routinesSchedule.routines,
    adventures: gamification.adventures,
    socialStories: gamification.socialStories,
    aacItems: aacComm.aacItems,
    plansChanged: routinesSchedule.plansChanged,
    onRemoteRoutinesSync: (remoteRoutines) => routinesSchedule.setRoutines((prev) => reconcileRoutines(prev, remoteRoutines)),
    onRemoteAdventuresSync: (remoteAdventures) => gamification.setAdventures(remoteAdventures),
    onRemoteSocialStoriesSync: (remoteStories) => gamification.setSocialStories(remoteStories),
    onRemoteAacSync: (remoteAac) => aacComm.setAacItems((prev) => reconcileAacItems(prev, remoteAac)),
    onRemotePlansChangedSync: (plans) => routinesSchedule.syncRemotePlansChanged(plans),
    speak: speechEngine.speak,
  });

  // Keep haptics enabled status in sync with user settings
  useEffect(() => {
    setHapticsEnabled(settings.hapticsEnabled ?? false);
  }, [settings.hapticsEnabled]);

  // Root Storage Persistence Effect
  useEffect(() => {
    try {
      // Data Minimization: strip PIN and credentials before saving to unencrypted localStorage
      const { pin: _pin, ...safeSettings } = settings;
      const safeChildProfile = { ...childProfile, pin: undefined };

      const stateToSave = {
        aacItems: aacComm.aacItems,
        quickPhrases: aacComm.quickPhrases,
        routines: routinesSchedule.routines,
        plansChanged: routinesSchedule.plansChanged,
        adventures: gamification.adventures,
        skills: gamification.skills,
        habits: gamification.habits,
        socialStories: gamification.socialStories,
        emotionHistory: gamification.emotionHistory,
        currentMood: gamification.currentMood,
        childProfile: safeChildProfile,
        settings: safeSettings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

      indexOfflineData({
        aacItems: aacComm.aacItems,
        routines: routinesSchedule.routines,
        socialStories: gamification.socialStories,
        skills: gamification.skills,
        habits: gamification.habits,
        childName: childProfile.name,
      });

      syncChildStatusToCaregiver({
        childName: childProfile.name,
        currentMood: gamification.currentMood,
        habitsCompletedToday: gamification.habits.filter((h) => h.completedToday).length,
        totalHabits: gamification.habits.length,
        currentActivity: `In ${
          childView === 'my-day'
            ? 'Visual Schedule'
            : childView === 'aac'
            ? 'AAC Speech Board'
            : childView === 'skills'
            ? 'Life Skills'
            : childView === 'adventures'
            ? 'Life Adventures'
            : childView === 'feelings'
            ? 'Feelings Check-in'
            : 'BeeYou'
        }`,
        stars: gamification.earnedStickers.length,
        isOffline: speechEngine.isOffline,
      });
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    aacComm.aacItems,
    aacComm.quickPhrases,
    routinesSchedule.routines,
    routinesSchedule.plansChanged,
    gamification.adventures,
    gamification.skills,
    gamification.habits,
    gamification.socialStories,
    gamification.emotionHistory,
    gamification.currentMood,
    gamification.earnedStickers.length,
    childProfile,
    settings,
    childView,
    speechEngine.isOffline,
  ]);

  // Profile Backup & Restore Functions
  const exportProfileBackup = (): BeeYouBackupData => {
    const backup: BeeYouBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'BeeYou',
      childProfile,
      settings,
      aacItems: aacComm.aacItems,
      quickPhrases: aacComm.quickPhrases,
      routines: routinesSchedule.routines,
      adventures: gamification.adventures,
      skills: gamification.skills,
      habits: gamification.habits,
      socialStories: gamification.socialStories,
      dailyRecollections: recollections.dailyRecollections,
      medications: medication.medications,
      cycleSettings: cycleTracker.cycleSettings,
      userAgeGroup,
      enabledFeatures,
      activeThemeId: themeState.activeTheme?.id || 'classic',
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
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.aacItems) && data.aacItems.length > 0) aacComm.setAacItems(data.aacItems);
      if (Array.isArray(data.quickPhrases)) aacComm.setQuickPhrases(data.quickPhrases);
      if (Array.isArray(data.routines) && data.routines.length > 0) routinesSchedule.setRoutines(data.routines);
      if (Array.isArray(data.adventures)) gamification.setAdventures(data.adventures);
      if (Array.isArray(data.skills)) gamification.setSkills(data.skills);
      if (Array.isArray(data.habits)) gamification.setHabits(data.habits);
      if (Array.isArray(data.socialStories)) gamification.setSocialStories(data.socialStories);
      if (Array.isArray(data.dailyRecollections)) recollections.setDailyRecollections(data.dailyRecollections);
      if (Array.isArray(data.medications)) medication.setMedications(data.medications);
      if (data.cycleSettings) cycleTracker.setCycleSettings(data.cycleSettings);
      if (data.userAgeGroup) setUserAgeGroup(data.userAgeGroup);
      if (data.enabledFeatures) updateEnabledFeatures(data.enabledFeatures);
      if (data.activeThemeId) themeState.setTheme(data.activeThemeId);

      if (settings.soundEffects) playChime('complete');
      return {
        success: true,
        message: `Successfully restored profile backup for ${data.childProfile?.name || 'child'}!`,
      };
    } catch (err: any) {
      return { success: false, message: `Failed to restore: ${err.message || 'Unknown error'}` };
    }
  };

  const resetToDefaults = async () => {
    try {
      await wipeDeviceStorage();
    } catch {}
    if (settings.soundEffects) playChime('clear');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const contextValue: AppContextType = {
    // Navigation & Views
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
    copingToolkitTab,
    setCopingToolkitTab,
    openCopingToolkit,
    showPlansChangedModal: routinesSchedule.showPlansChangedModal,
    setShowPlansChangedModal: routinesSchedule.setShowPlansChangedModal,
    showMorningBrief: routinesSchedule.showMorningBrief,
    setShowMorningBrief: routinesSchedule.setShowMorningBrief,
    showCaregiverModal: familyCloudSync.showCaregiverModal,
    setShowCaregiverModal: familyCloudSync.setShowCaregiverModal,
    showCaregiverAlertModal: familyCloudSync.showCaregiverAlertModal,
    setShowCaregiverAlertModal: familyCloudSync.setShowCaregiverAlertModal,
    showFamilyAuthModal: familyCloudSync.showFamilyAuthModal,
    setShowFamilyAuthModal: familyCloudSync.setShowFamilyAuthModal,
    showEmailVerificationModal: familyCloudSync.showEmailVerificationModal,
    setShowEmailVerificationModal: familyCloudSync.setShowEmailVerificationModal,
    showAboutMeModal,
    setShowAboutMeModal,
    incomingCaregiverMessage: familyCloudSync.incomingCaregiverMessage,
    dismissIncomingCaregiverMessage: familyCloudSync.dismissIncomingCaregiverMessage,
    activeContextTopic,
    setActiveContextTopic,

    // Real-time Caregiver Connection & Cross-Device Sync
    connectionStatus: familyCloudSync.connectionStatus,
    isCaregiverConnected: familyCloudSync.isCaregiverConnected,

    // TTS & Offline Engine
    isSpeaking: speechEngine.isSpeaking,
    speakingText: speechEngine.speakingText,
    isOffline: speechEngine.isOffline,
    stopSpeaking: speechEngine.stopSpeaking,
    offlineVoices: speechEngine.offlineVoices,

    // AAC & Voice
    aacItems: aacComm.aacItems,
    sentence: aacComm.sentence,
    quickPhrases: aacComm.quickPhrases,
    favoriteSentences: aacComm.favoriteSentences,
    showAacGuideModal: aacComm.showAacGuideModal,
    setShowAacGuideModal: aacComm.setShowAacGuideModal,
    showMyDayGuideModal: routinesSchedule.showMyDayGuideModal,
    setShowMyDayGuideModal: routinesSchedule.setShowMyDayGuideModal,
    speak: speechEngine.speak,
    announce: speechEngine.announce,
    addToSentence: aacComm.addToSentence,
    speakSentence: aacComm.speakSentence,
    clearSentence: aacComm.clearSentence,
    removeLastFromSentence: aacComm.removeLastFromSentence,
    saveSentenceAsQuickPhrase: aacComm.saveSentenceAsQuickPhrase,
    addFavoriteSentence: aacComm.addFavoriteSentence,
    deleteFavoriteSentence: aacComm.deleteFavoriteSentence,
    togglePinFavoriteSentence: aacComm.togglePinFavoriteSentence,
    recordSentenceSpoken: aacComm.recordSentenceSpoken,
    addAacItem: aacComm.addAacItem,
    updateAacItem: aacComm.updateAacItem,
    toggleAacFavorite: aacComm.toggleAacFavorite,
    importAacPack: aacComm.importAacPack,
    upgradeAllAacToClinicalSymbols: aacComm.upgradeAllAacToClinicalSymbols,
    deleteAacItem: aacComm.deleteAacItem,
    addQuickPhrase: aacComm.addQuickPhrase,
    deleteQuickPhrase: aacComm.deleteQuickPhrase,

    // Routines & My Day
    routines: routinesSchedule.routines,
    toggleRoutineStep: routinesSchedule.toggleRoutineStep,
    resetRoutine: routinesSchedule.resetRoutine,
    addRoutine: routinesSchedule.addRoutine,
    updateRoutine: routinesSchedule.updateRoutine,
    deleteRoutine: routinesSchedule.deleteRoutine,
    toggleFirstThen: routinesSchedule.toggleFirstThen,

    // Plans Changed
    plansChanged: routinesSchedule.plansChanged,
    activatePlansChanged: routinesSchedule.activatePlansChanged,
    applyPlansChangedToRoutine: routinesSchedule.applyPlansChangedToRoutine,
    dismissPlansChanged: routinesSchedule.dismissPlansChanged,

    // Adventures
    adventures: gamification.adventures,
    addAdventure: gamification.addAdventure,
    updateAdventure: gamification.updateAdventure,
    deleteAdventure: gamification.deleteAdventure,
    completeAdventure: gamification.completeAdventure,

    // Skills
    skills: gamification.skills,
    toggleSkillStep: gamification.toggleSkillStep,
    completeSkill: gamification.completeSkill,
    resetSkill: gamification.resetSkill,
    addSkill: gamification.addSkill,
    updateSkill: gamification.updateSkill,

    // Daily Habits
    habits: gamification.habits,
    toggleHabit: gamification.toggleHabit,
    incrementHabitCount: gamification.incrementHabitCount,
    addHabit: gamification.addHabit,
    deleteHabit: gamification.deleteHabit,

    // Emotions
    emotionHistory: gamification.emotionHistory,
    currentMood: gamification.currentMood,
    recordEmotion: gamification.recordEmotion,

    // Social Stories
    socialStories: gamification.socialStories,
    addSocialStory: gamification.addSocialStory,
    updateSocialStory: gamification.updateSocialStory,
    deleteSocialStory: gamification.deleteSocialStory,

    awardStars: gamification.awardStars,

    // Profile & Settings
    childProfile,
    updateChildProfile,
    settings,
    updateSettings,
    triggerVoicePreload,
    currentLanguage,

    // Digital Routine Stickers & Rewards
    earnedStickers: gamification.earnedStickers,
    newlyAwardedSticker: gamification.newlyAwardedSticker,
    awardRoutineSticker: gamification.awardRoutineSticker,
    dismissStickerCelebration: gamification.dismissStickerCelebration,

    // Daily Mood & Recollection
    dailyRecollections: recollections.dailyRecollections,
    setDailyRecollections: recollections.setDailyRecollections,
    showRecollectionModal: recollections.showRecollectionModal,
    setShowRecollectionModal: recollections.setShowRecollectionModal,
    addDailyRecollection: recollections.addDailyRecollection,
    updateDailyRecollection: recollections.updateDailyRecollection,
    deleteDailyRecollection: recollections.deleteDailyRecollection,
    clearAllDailyRecollections: recollections.clearAllDailyRecollections,

    // Themes & Customization
    themes: themeState.themes,
    activeThemeId: themeState.activeThemeId,
    activeTheme: themeState.activeTheme,
    setTheme: themeState.setTheme,
    buyTheme: themeState.buyTheme,
    createCustomTheme: themeState.createCustomTheme,
    updateCustomTheme: themeState.updateCustomTheme,
    updateTheme: themeState.updateTheme,
    resetThemeToPreset: themeState.resetThemeToPreset,
    deleteCustomTheme: themeState.deleteCustomTheme,
    showThemeModal: themeState.showThemeModal,
    setShowThemeModal: themeState.setShowThemeModal,
    editingThemeId: themeState.editingThemeId,
    setEditingThemeId: themeState.setEditingThemeId,

    // Onboarding & Multi-Age Adaptability & Role
    userPersona,
    setUserPersona,
    userAgeGroup,
    setUserAgeGroup,
    userRole,
    setUserRole,
    emergencyContact: familyCloudSync.emergencyContact,
    setEmergencyContact: familyCloudSync.setEmergencyContact,
    caregiverPermissions: familyCloudSync.caregiverPermissions,
    updateCaregiverPermissions: familyCloudSync.updateCaregiverPermissions,
    linkedDeviceCode: familyCloudSync.linkedDeviceCode,
    setLinkedDeviceCode: familyCloudSync.setLinkedDeviceCode,
    enabledFeatures,
    updateEnabledFeatures,
    toggleFeature,
    showOnboardingModal,
    setShowOnboardingModal,
    reopenOnboarding,
    showPostOnboardingSpotlight,
    setShowPostOnboardingSpotlight,

    // Medication Reminders & Health Supply
    medications: medication.medications,
    medicationLogs: medication.medicationLogs,
    showMedicationModal: medication.showMedicationModal,
    setShowMedicationModal: medication.setShowMedicationModal,
    addMedication: medication.addMedication,
    updateMedication: medication.updateMedication,
    deleteMedication: medication.deleteMedication,
    takeMedicationDose: medication.takeMedicationDose,
    undoMedicationDose: medication.undoMedicationDose,
    restockMedication: medication.restockMedication,

    // Mood Journal
    moodJournalEntries: moodJournal.moodJournalEntries,
    addMoodJournalEntry: moodJournal.addMoodJournalEntry,
    updateMoodJournalEntry: moodJournal.updateMoodJournalEntry,
    deleteMoodJournalEntry: moodJournal.deleteMoodJournalEntry,
    showMoodJournalModal: moodJournal.showMoodJournalModal,
    setShowMoodJournalModal: moodJournal.setShowMoodJournalModal,

    // Cycle Tracker
    cycleSettings: cycleTracker.cycleSettings,
    updateCycleSettings: cycleTracker.updateCycleSettings,
    cycleLogs: cycleTracker.cycleLogs,
    logCycleDay: cycleTracker.logCycleDay,
    deleteCycleLog: cycleTracker.deleteCycleLog,
    showCycleTrackerModal: cycleTracker.showCycleTrackerModal,
    setShowCycleTrackerModal: cycleTracker.setShowCycleTrackerModal,
    getCyclePhaseInfo: cycleTracker.getCyclePhaseInfo,

    // Subscription & Membership Tiering
    subscription: subscriptionState.subscription,
    isPremium: subscriptionState.isPremium,
    isRestoring: subscriptionState.isRestoring,
    startFreeTrial: subscriptionState.startFreeTrial,
    activateSubscription: subscriptionState.activateSubscription,
    cancelSubscription: subscriptionState.cancelSubscription,
    restorePurchases: subscriptionState.restorePurchases,
    purchaseSubscription: subscriptionState.purchaseSubscription,
    setSubscriptionTier: subscriptionState.setSubscriptionTier,
    setBillingCycle: subscriptionState.setBillingCycle,
    showPaywallModal: subscriptionState.showPaywallModal,
    setShowPaywallModal: subscriptionState.setShowPaywallModal,
    paywallTriggerReason: subscriptionState.paywallTriggerReason,
    triggerUpgrade: subscriptionState.triggerUpgrade,
    getTrialDaysRemaining: subscriptionState.getTrialDaysRemaining,

    // Emergency Sensory Red Button & Safe Mode
    emergencyMode: sensoryTools.emergencyMode,
    setEmergencyMode: sensoryTools.setEmergencyMode,
    showEmergencyModal: sensoryTools.showEmergencyModal,
    setShowEmergencyModal: sensoryTools.setShowEmergencyModal,
    activateEmergencyMode: sensoryTools.activateEmergencyMode,
    deactivateEmergencyMode: sensoryTools.deactivateEmergencyMode,
    isSafeModeActive: sensoryTools.isSafeModeActive,
    activateSafeMode: sensoryTools.activateSafeMode,
    deactivateSafeMode: sensoryTools.deactivateSafeMode,

    // Incredible 5-Point Scale
    fivePointSettings: sensoryTools.fivePointSettings,
    updateFivePointSettings: sensoryTools.updateFivePointSettings,
    updateFivePointLevel: sensoryTools.updateFivePointLevel,
    showFivePointModal: sensoryTools.showFivePointModal,
    setShowFivePointModal: sensoryTools.setShowFivePointModal,

    // Decision Wheel
    decisionWheelConfig: sensoryTools.decisionWheelConfig,
    updateDecisionWheelConfig: sensoryTools.updateDecisionWheelConfig,
    showDecisionWheelModal: sensoryTools.showDecisionWheelModal,
    setShowDecisionWheelModal: sensoryTools.setShowDecisionWheelModal,

    // Communication Passport
    communicationPassport: sensoryTools.communicationPassport,
    updateCommunicationPassport: sensoryTools.updateCommunicationPassport,
    showPassportModal: sensoryTools.showPassportModal,
    setShowPassportModal: sensoryTools.setShowPassportModal,

    // Spoon Theory Budget
    spoonEntries: sensoryTools.spoonEntries,
    addSpoonEntry: sensoryTools.addSpoonEntry,
    updateSpoonEntry: sensoryTools.updateSpoonEntry,
    getTodaySpoonEntry: sensoryTools.getTodaySpoonEntry,
    showSpoonModal: sensoryTools.showSpoonModal,
    setShowSpoonModal: sensoryTools.setShowSpoonModal,

    // Visual Pie Clock & Fidget
    showPieTimerModal: sensoryTools.showPieTimerModal,
    setShowPieTimerModal: sensoryTools.setShowPieTimerModal,
    showFidgetModal: sensoryTools.showFidgetModal,
    setShowFidgetModal: sensoryTools.setShowFidgetModal,

    // AAC Context Scene & Keyboard
    aacActiveScene: aacComm.aacActiveScene,
    setAacActiveScene: aacComm.setAacActiveScene,
    showAacKeyboardModal: aacComm.showAacKeyboardModal,
    setShowAacKeyboardModal: aacComm.setShowAacKeyboardModal,

    // Accessibility
    showAccessibilityModal: sensoryTools.showAccessibilityModal,
    setShowAccessibilityModal: sensoryTools.setShowAccessibilityModal,

    // Customizable Dashboard
    dashboardWidgets: customTools.dashboardWidgets,
    setDashboardWidgets: customTools.setDashboardWidgets,
    toggleDashboardWidget: customTools.toggleDashboardWidget,
    reorderDashboardWidgets: customTools.reorderDashboardWidgets,
    resetDashboardWidgets: customTools.resetDashboardWidgets,
    showDashboardCustomizer: customTools.showDashboardCustomizer,
    setShowDashboardCustomizer: customTools.setShowDashboardCustomizer,

    // Help Alerts & Caregiver Responses
    helpAlertPresets: customTools.helpAlertPresets,
    addHelpAlertPreset: customTools.addHelpAlertPreset,
    updateHelpAlertPreset: customTools.updateHelpAlertPreset,
    deleteHelpAlertPreset: customTools.deleteHelpAlertPreset,
    resetHelpAlertPresets: customTools.resetHelpAlertPresets,
    caregiverResponses: customTools.caregiverResponses,
    addCaregiverResponse: customTools.addCaregiverResponse,
    updateCaregiverResponse: customTools.updateCaregiverResponse,
    deleteCaregiverResponse: customTools.deleteCaregiverResponse,
    resetCaregiverResponses: customTools.resetCaregiverResponses,
    showEditAlertsModal: customTools.showEditAlertsModal,
    setShowEditAlertsModal: customTools.setShowEditAlertsModal,

    // Calm Down Tools & Breathing Pacer
    calmStrategies: customTools.calmStrategies,
    addCalmStrategy: customTools.addCalmStrategy,
    updateCalmStrategy: customTools.updateCalmStrategy,
    deleteCalmStrategy: customTools.deleteCalmStrategy,
    resetCalmStrategies: customTools.resetCalmStrategies,
    breathingConfig: customTools.breathingConfig,
    updateBreathingConfig: customTools.updateBreathingConfig,
    resetBreathingConfig: customTools.resetBreathingConfig,
    showEditCalmModal: customTools.showEditCalmModal,
    setShowEditCalmModal: customTools.setShowEditCalmModal,

    // Printable Schedules & Scrapbook
    showPrintScheduleModal,
    setShowPrintScheduleModal,
    printScheduleConfig,
    openPrintSchedule,

    // Backup & Restore
    exportProfileBackup,
    importProfileBackup,

    // Utilities
    resetToDefaults,
  };

  const handleVoiceLoadingComplete = useCallback(() => {
    setVoiceLoadingState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <AacVoiceLoadingScreen
        isOpen={voiceLoadingState.isOpen}
        persona={voiceLoadingState.persona}
        language={voiceLoadingState.language}
        onComplete={handleVoiceLoadingComplete}
      />
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
