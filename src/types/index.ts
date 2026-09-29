export type EmotionType = 
  | 'happy'
  | 'calm'
  | 'excited'
  | 'tired'
  | 'worried'
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'overwhelmed'
  | 'scared'
  | 'confused';

export interface EmotionOption {
  id: EmotionType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export type AACCategory = 
  | 'core'
  | 'food'
  | 'drinks'
  | 'activities'
  | 'places'
  | 'people'
  | 'feelings'
  | 'sensory'
  | 'actions'
  | 'social'
  | 'personal';

export interface AACItem {
  id: string;
  label: string;
  speechText?: string;
  emoji: string;
  photoUrl?: string;
  category: AACCategory;
  colorType: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  motorIndex: number; // for motor planning consistency
  isCustom?: boolean;
}

export interface QuickPhrase {
  id: string;
  text: string;
  speechText?: string;
  emoji: string;
  category?: string;
  isEmergency?: boolean;
  isCustom?: boolean;
}

export interface VisualScheduleStep {
  id: string;
  title: string;
  instruction?: string;
  durationMin?: number;
  completed: boolean;
  emoji: string;
  photoUrl?: string;
  sensoryNote?: string;
  communicationShortcutPhrases?: string[];
}

export interface Routine {
  id: string;
  title: string;
  category: 'morning' | 'school' | 'after-school' | 'bedtime' | 'appointment' | 'custom';
  emoji: string;
  time?: string;
  steps: VisualScheduleStep[];
  firstThen?: {
    first: string;
    firstEmoji: string;
    then: string;
    thenEmoji: string;
    completedFirst: boolean;
    completedThen: boolean;
  };
}

export interface RoutineTemplate {
  id: string;
  title: string;
  category: 'morning' | 'school' | 'after-school' | 'bedtime' | 'appointment' | 'custom';
  emoji: string;
  time?: string;
  description: string;
  recommendedFor?: string;
  firstThen?: {
    first: string;
    firstEmoji: string;
    then: string;
    thenEmoji: string;
  };
  steps: Array<{
    title: string;
    instruction?: string;
    durationMin?: number;
    emoji: string;
    sensoryNote?: string;
    communicationShortcutPhrases?: string[];
  }>;
}

export interface SensoryProfileItem {
  category: 'sound' | 'light' | 'people' | 'touch' | 'waiting' | 'smells' | 'movement';
  label: string;
  description: string;
  icon: string;
  isRelevant: boolean;
}

export interface AdventureStep {
  order: number;
  title: string;
  description: string;
  emoji: string;
  sensoryTip?: string;
}

export interface LifeAdventure {
  id: string;
  title: string;
  category: string;
  emoji: string;
  summary: string;
  steps: AdventureStep[];
  sensoryPreview: {
    sound?: string;
    light?: string;
    people?: string;
    touch?: string;
    waiting?: string;
    smells?: string;
    movement?: string;
  };
  thingsICanSay: string[];
  thingsICanAskFor: string[];
  whatHappensAfter: string;
  isCustom?: boolean;
  completedCount?: number;
}

export interface LifeSkillStep {
  id: number;
  title: string;
  instruction: string;
  emoji: string;
  durationSec?: number;
  completed: boolean;
}

export interface LifeSkill {
  id: string;
  title: string;
  emoji: string;
  category: 'hygiene' | 'dressing' | 'chores' | 'eating' | 'preparation';
  estimatedMin: number;
  steps: LifeSkillStep[];
  starsReward: number;
  completedTimes: number;
}

export interface DailyHabit {
  id: string;
  title: string;
  emoji: string;
  category: 'health' | 'organization' | 'self-care' | 'kindness';
  completedToday: boolean;
  streakDays: number;
  lastCompletedDate?: string;
  targetTimesPerDay?: number;
  timesCompletedToday?: number;
  encouragement: string;
  isCustom?: boolean;
}

export interface SocialStoryPage {
  pageNumber: number;
  text: string;
  emoji: string;
  photoUrl?: string;
}

export interface SocialStory {
  id: string;
  title: string;
  emoji: string;
  pages: SocialStoryPage[];
  keyTakeaways: string[];
  suggestedPhrases: string[];
  isCustom?: boolean;
}

export interface PlansChangedState {
  active: boolean;
  originalPlanTitle: string;
  reason: string;
  newPlanTitle: string;
  newSteps: { title: string; emoji: string; time?: string }[];
  calmingMessage: string;
  relevantPhrases: string[];
}

export interface EmotionRecord {
  id: string;
  timestamp: number;
  emotion: EmotionType;
  reason?: string;
  need?: string;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'short' | 'curly' | 'pigtails' | 'spiky' | 'braids' | 'wavy';
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory: 'none' | 'glasses' | 'hearing_aids' | 'cochlear' | 'sensory_headphones' | 'cap';
  mobilityAid: 'none' | 'wheelchair' | 'stroller_walker' | 'cane';
  companionDevice: 'none' | 'aac_tablet' | 'communication_ring' | 'squishy_fidget';
}

export interface WorldItem {
  id: string;
  name: string;
  emoji: string;
  category: 'furniture' | 'pet' | 'toy' | 'decoration' | 'comfort';
  costStars: number;
  description: string;
}

export interface PlacedWorldItem {
  id: string;
  itemId: string;
  room: 'bedroom' | 'playroom' | 'yard';
  x: number;
  y: number;
}

export interface MyWorldState {
  stars: number;
  unlockedItemIds: string[];
  placedItems: PlacedWorldItem[];
  currentRoom: 'bedroom' | 'playroom' | 'yard';
}

export interface ChildProfile {
  name: string;
  pronouns?: string;
  interests: string[];
  favoriteFoods: string[];
  favoriteActivities: string[];
  comfortItems: string[];
  dislikes: string[];
  sensoryNotes: {
    sound: string;
    light: string;
    touch: string;
    movement: string;
    waiting: string;
  };
  communicationPreference: string;
  activeSticker?: string;
  activeTitle?: string;
}

export interface RewardBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'routines' | 'skills' | 'feelings' | 'aac' | 'adventure';
  targetCount: number;
  currentCount: number;
  isUnlocked: boolean;
  unlockedStickerId?: string;
  rewardStars: number;
}

export interface ProfileSticker {
  id: string;
  name: string;
  emoji: string;
  description: string;
  badgeIdRequired?: string;
  starsRequired?: number;
}

export interface EarnedRoutineSticker {
  id: string;
  routineId: string;
  routineTitle: string;
  stickerName: string;
  emoji: string;
  description: string;
  earnedAt: string;
  starsAwarded: number;
}

export interface AppSettings {
  pin: string;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceURI: string;
  voicePersona?: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'system';
  language: 'en' | 'es' | 'fr' | 'fil';
  gridColumns: 3 | 4 | 6;
  largeButtonMode: boolean;
  highContrast: boolean;
  touchHoldDelayMs: number; // 0 for instant, or e.g. 300ms accidental touch protection
  reduceMotion: boolean;
  soundEffects: boolean;
  autoSpeakSentence: boolean;
}

export interface CaregiverMessage {
  id: string;
  senderName: string;
  text: string;
  emoji?: string;
  timestamp: string;
  read: boolean;
}

export interface CaregiverAlert {
  id: string;
  childName: string;
  pairingCode: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload';
  label: string;
  emoji: string;
  location?: 'school' | 'therapy' | 'bus' | 'home' | 'other';
  note?: string;
  timestamp: string;
  status: 'active' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  responseMessage?: string;
}

export interface CaregiverChildStatus {
  childName: string;
  pairingCode: string;
  lastActiveTime: string;
  currentActivity: string;
  currentMood: EmotionType | null;
  currentMoodReason?: string;
  currentMoodNeed?: string;
  lastAacSentence?: string;
  lastSpokenTime?: string;
  habitsCompletedToday: number;
  totalHabits: number;
  routineProgress: {
    routineTitle: string;
    completedSteps: number;
    totalSteps: number;
    currentStepTitle?: string;
  } | null;
  stars: number;
  isOffline: boolean;
  quickAlert?: string | null;
  activeAlert?: CaregiverAlert | null;
}

export interface OfflineStorageStats {
  indexedAt: string;
  aacCount: number;
  routinesCount: number;
  storiesCount: number;
  skillsCount: number;
  habitsCount: number;
  storageEngine: 'indexeddb' | 'localstorage_indexed';
  isFullyCached: boolean;
  voicesCount: number;
}

export type DayTimeSlot = 'morning' | 'afternoon' | 'evening';

export interface DailyCheckInEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: DayTimeSlot;
  timestamp: number;
  emotion: EmotionType;
  energyLevel: 'low' | 'just_right' | 'high';
  activitiesDone: string[];
  sensoryState: 'calm' | 'sensitive' | 'overwhelmed' | 'seeking_sensory';
  wins: string[];
  kidsNotes?: string;
  therapyHighlight?: string;
}

export interface DailySummaryChart {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Monday, Sep 28"
  entries: DailyCheckInEntry[];
  endOfDayMood?: EmotionType;
  overallDayRating?: number; // 1-5
  highlights: string[];
  sensoryWins: string[];
  therapyTakeaways?: string;
}

export type {
  DayRating,
  EnergyLevelType,
  ChallengeType,
  WinType,
  SleepQualityType,
  DailyRecollectionEntry,
} from '../data/recollectionData';

export type {
  AppTheme,
  ThemePalette,
  WallpaperPattern,
} from '../data/themesData';


