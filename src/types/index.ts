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
  | 'favorites'
  | 'favorite_sentences'
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
  symbolId?: string | number; // Direct official Mulberry / open symbol ID or filename
  symbolSource?: 'mulberry' | 'custom' | 'pack';
  arasaacId?: number; // Legacy alias for backward compatibility
  category: AACCategory;
  colorType: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  motorIndex: number; // for motor planning consistency
  isCustom?: boolean;
  isFavorite?: boolean;
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

export interface FavoriteSentence {
  id: string;
  text: string;
  speechText?: string;
  emoji: string;
  usageCount: number;
  lastUsedAt?: string;
  isParentPinned?: boolean;
  isCustom?: boolean;
  category?: string;
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
  audioDataUrl?: string; // parent voice recording (base64 data URI)
  microSteps?: Array<{ id: string; title: string; emoji: string; completed: boolean }>; // Magic Task Breakdown
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
  hairStyle: 'short' | 'curly' | 'pigtails' | 'spiky' | 'braids' | 'wavy' | 'afro' | 'bob' | 'ponytail' | 'buzz';
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  clothingStyle?: 'tshirt' | 'hoodie' | 'dino_hoodie' | 'sailor_hoodie' | 'turtle_hoodie' | 'frog_hoodie' | 'space_suit' | 'overalls';
  expression?: 'happy' | 'smile' | 'calm' | 'excited' | 'wink';
  gender?: 'boy' | 'girl' | 'neutral';
  accessory: 'none' | 'glasses' | 'sunglasses' | 'hearing_aids' | 'cochlear' | 'sensory_headphones' | 'cap' | 'beanie';
  accessoryColor?: string;
  mobilityAid: 'none' | 'wheelchair' | 'stroller_walker' | 'cane' | 'service_dog';
  companionDevice: 'none' | 'aac_tablet' | 'communication_ring' | 'squishy_fidget' | 'comfort_plush' | 'star_wand';
  avatarFrame?: 'none' | 'stars' | 'bubbles' | 'sunburst' | 'rainbow' | 'space';
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

export type UserAgeGroup = 'kid' | 'teen' | 'adult';

export type MedicationFrequency = 
  | 'daily'
  | 'twice_daily'
  | 'three_daily'
  | 'as_needed'
  | 'weekly'
  | 'custom_days';

export interface MedicationReminder {
  id: string;
  name: string;                // Medication name (e.g. "Morning Multivitamin", "Inhaler")
  totalQuantity: number;       // How many they have in stock (inventory count)
  dosage: number;              // How many to take per intake (e.g. 1, 2)
  unit: string;                // Unit: "pill", "gummy", "puff", "tablet", "drop", "ml"
  frequency: MedicationFrequency; // How often they should take it
  times: string[];             // What time(s) they should take them (e.g. ["08:00", "20:00"])
  instructions?: string;       // Helpful note (e.g. "Take with breakfast and a glass of water")
  emoji?: string;              // Friendly visual icon: 💊, 🍬, 🫁, 💧, 🧴
  color?: string;              // Visual theme color (e.g. #3b82f6)
  refillThreshold: number;     // Low supply threshold (default: 5)
  customDays?: number[];       // [0..6] (0=Sun, 1=Mon, ..., 6=Sat)
  takenTimesToday: string[];   // Times marked taken today (e.g. ["08:00"])
  lastTakenDate?: string;      // YYYY-MM-DD
  active: boolean;             // Whether reminder is active
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  timestamp: string;           // ISO string
  doseQuantity: number;        // Quantity taken
  doseUnit?: string;           // Unit
  doseTime: string;            // Scheduled time, e.g. "08:00" or "as_needed"
  status: 'taken' | 'skipped' | 'missed';
  notes?: string;
}

// Mood Journal Types (Teens to Adults)
export type MoodJournalEmotion =
  | 'peaceful'
  | 'content'
  | 'inspired'
  | 'energized'
  | 'confident'
  | 'grateful'
  | 'focused'
  | 'reflective'
  | 'melancholic'
  | 'restless'
  | 'sensitive'
  | 'spacey'
  | 'anxious'
  | 'overwhelmed'
  | 'irritable'
  | 'exhausted'
  | 'sad'
  | 'lonely'
  | 'frustrated';

export type MoodTriggerCategory =
  | 'sensory_overload'
  | 'bright_lights'
  | 'loud_noise'
  | 'social_masking'
  | 'social_battery_empty'
  | 'conflict'
  | 'school_work_stress'
  | 'routine_change'
  | 'lack_of_sleep'
  | 'hormonal_cycle'
  | 'executive_dysfunction'
  | 'physical_pain'
  | 'hunger_dehydration'
  | 'unknown';

export type CopingStrategyUsed =
  | 'quiet_sensory_break'
  | 'noise_cancelling_headphones'
  | 'deep_breathing'
  | 'stimming_fidgeting'
  | 'weighted_blanket'
  | 'journaling'
  | 'listening_to_music'
  | 'walk_in_nature'
  | 'talking_to_someone'
  | 'gaming_special_interest'
  | 'nap_rest'
  | 'hydration_snack';

export interface MoodJournalEntry {
  id: string;
  date: string;               // YYYY-MM-DD
  time: string;               // HH:MM
  timestamp: number;
  primaryMood: MoodJournalEmotion;
  moodIntensity: number;      // 1 - 10
  energyLevel: number;        // 1 - 5 (1=Drained, 5=Overcharged)
  sensoryDistress: number;    // 0 - 100%
  triggers: MoodTriggerCategory[];
  copingStrategies: CopingStrategyUsed[];
  journalText: string;        // Freeform reflection
  notes?: string;             // Optional notes alias
  gratitudeOrWin?: string;    // Positive anchor
  isPrivate?: boolean;        // Optional discreet flag
}

// Cycle Tracker Types (Teens to Adults)
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type CycleSymptom =
  | 'cramps'
  | 'headache'
  | 'fatigue'
  | 'bloating'
  | 'breast_tenderness'
  | 'backache'
  | 'nausea'
  | 'acne'
  | 'joint_muscle_pain'
  | 'sensory_amplification'
  | 'sensory_overload'
  | 'executive_dysfunction_dip'
  | 'brain_fog'
  | 'rejection_sensitivity'
  | 'mood_swings_irritability'
  | 'insomnia_restless_sleep'
  | 'cravings_comfort_food';

export interface CycleDailyLog {
  id: string;
  date: string;                  // YYYY-MM-DD
  flow: FlowIntensity;
  symptoms: CycleSymptom[];
  painLevel: number;             // 0 - 10
  energyLevel: number;           // 1 - 5
  moodSummary?: string;
  notes?: string;
}

export interface CycleSettings {
  enabled: boolean;
  averageCycleLength: number;    // default 28 days
  averagePeriodLength: number;   // default 5 days
  lastPeriodStartDate: string;   // YYYY-MM-DD
  trackSensoryAmplification: boolean; // Neurodivergent sensory & PMDD watch
  discreetMode: boolean;         // Hide period terms for privacy
  remindersEnabled: boolean;     // Alert a couple days prior
}

export interface EnabledFeatures {
  starsAndRewards: boolean;       // Star coins, badges, routine stickers (gamification)
  firstThenSchedules: boolean;     // Visual first/then routine cards
  mascotCompanion: boolean;        // Playful mascot avatar greeting and cheering
  visualCountdownTimer: boolean;   // Visual activity countdown timer
  socialStories: boolean;          // Social stories preparation
  lifeSkills: boolean;             // Step-by-step life skills breakdown
  dailyMoodRecollection: boolean;  // End-of-day reflection & therapist clinical log
  emergencyAlertSOS: boolean;      // Quick help / caregiver alert SOS button
  aacCommunication: boolean;       // AAC picture & symbol communication board
  sensoryBreathingPacer: boolean;  // Calm sensory breathing pacer & coping toolkit
  medicationReminders: boolean;    // Medication reminders, dose tracking & inventory supply
  moodJournal: boolean;            // Reflective mood & trigger journal (teens to adults)
  cycleTracker: boolean;           // Cycle & hormonal tracking with sensory insights (teens to adults)
  discreetMode: boolean;           // Minimal text-focused mode without cartoons for adults
  routines?: boolean;
  aac?: boolean;
  sensoryTools?: boolean;
  emotions?: boolean;
  caregiverMessaging?: boolean;
  spoonBudget?: boolean;
  morningBrief?: boolean;
}

export const DEFAULT_KID_FEATURES: EnabledFeatures = {
  starsAndRewards: true,
  firstThenSchedules: true,
  mascotCompanion: true,
  visualCountdownTimer: true,
  socialStories: true,
  lifeSkills: true,
  dailyMoodRecollection: true,
  emergencyAlertSOS: true,
  aacCommunication: true,
  sensoryBreathingPacer: true,
  medicationReminders: true,
  moodJournal: false,
  cycleTracker: false,
  discreetMode: false,
};

export const DEFAULT_TEEN_FEATURES: EnabledFeatures = {
  starsAndRewards: true,
  firstThenSchedules: true,
  mascotCompanion: false,
  visualCountdownTimer: true,
  socialStories: true,
  lifeSkills: true,
  dailyMoodRecollection: true,
  emergencyAlertSOS: true,
  aacCommunication: true,
  sensoryBreathingPacer: true,
  medicationReminders: true,
  moodJournal: true,
  cycleTracker: true,
  discreetMode: false,
};

export const DEFAULT_ADULT_FEATURES: EnabledFeatures = {
  starsAndRewards: false,
  firstThenSchedules: true,
  mascotCompanion: false,
  visualCountdownTimer: true,
  socialStories: false,
  lifeSkills: false,
  dailyMoodRecollection: true,
  emergencyAlertSOS: true,
  aacCommunication: true,
  sensoryBreathingPacer: true,
  medicationReminders: true,
  moodJournal: true,
  cycleTracker: true,
  discreetMode: true,
};

export function getDefaultFeaturesForAge(age: UserAgeGroup): EnabledFeatures {
  switch (age) {
    case 'adult':
      return { ...DEFAULT_ADULT_FEATURES };
    case 'teen':
      return { ...DEFAULT_TEEN_FEATURES };
    case 'kid':
    default:
      return { ...DEFAULT_KID_FEATURES };
  }
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  email?: string;
  notes?: string;
}

export interface AboutMeCardData {
  conditions: string[];           // What they have (e.g. Autistic, Non-speaking, ADHD, Sensory Processing)
  sensorySensitivities: string[]; // What they are sensitive from (e.g. Loud noises, bright lights, sudden touch)
  comfortsAndLikes: string[];     // What they like & what helps (e.g. Dinosaurs, headphones, calm room)
  communicationTips: string[];    // How to communicate (e.g. Give 10s to reply, I understand words)
  allergiesOrMedical: string[];   // Medical alerts & allergies (e.g. Peanut allergy, EpiPen location)
  emergencyContacts: EmergencyContact[];
  bloodType?: string;
  speechSummary?: string;         // Audio script for "Read My ID" button
}

export interface ChildProfile {
  name: string;
  characterGender?: 'boy' | 'girl' | 'neutral';
  pronouns?: string;
  ageGroup?: UserAgeGroup;
  userRole?: 'self' | 'caregiver_managing';
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
  onboardingCompleted?: boolean;
  aboutMe?: AboutMeCardData;
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

export type AppLanguage = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'fr_ca' 
  | 'de' 
  | 'el' 
  | 'ru' 
  | 'vi' 
  | 'zh' 
  | 'ja' 
  | 'ko';

export interface AppSettings {
  pin: string;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceURI: string;
  voicePersona?: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'system';
  language: AppLanguage;
  gridColumns: 2 | 3 | 4 | 6 | 8;
  largeButtonMode: boolean;
  highContrast: boolean;
  touchHoldDelayMs: number; // 0 for instant, or e.g. 300ms accidental touch protection
  reduceMotion: boolean;
  soundEffects: boolean;
  colorCodingEnabled?: boolean;
  spokenAnnouncements?: boolean;
  autoSpeakSentence: boolean;
  features?: EnabledFeatures;
  onboardingCompleted?: boolean;
  aacButtonColorMode?: 'fitzgerald' | 'theme' | 'high_contrast_white' | 'neutral_monochrome';
  visualAlerts?: boolean;
  soundAlerts?: boolean;
  vibrationAlerts?: boolean;
  spokenAlerts?: boolean;
}

export type UserAccountRole = 
  | 'child_dependent'      // Scenario A: 10-year-old child (caregiver owned, paired device, simplified)
  | 'teen_dependent'       // Scenario B: 15-year-old teen (caregiver linked with privacy/permissions)
  | 'independent_adult'    // Scenario C: 27-year-old adult (self-owned account, optional emergency contact)
  | 'caregiver';           // Caregiver dashboard view for the parent/supporter

export interface CaregiverPermissions {
  receiveAlerts: boolean;
  receiveMood: boolean;
  receiveRoutines: boolean;
  canEditRoutines: boolean;
  canEditAac: boolean;
  allowLocationTag: boolean;
}

export interface EmergencySupportContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
  permissions: {
    receiveHelpAlerts: boolean;
    receiveOverwhelmedAlerts: boolean;
    receiveRoutineUpdates: boolean;
    receiveLocation: boolean;
  };
}

export interface TemporaryPairingSession {
  pairingCode: string; // e.g. "K7P4-92"
  token: string;
  createdAt: number;
  expiresAt: number; // 10 minutes from creation
  status: 'pending' | 'paired' | 'expired' | 'revoked';
  initiatedBy: 'child_device' | 'caregiver';
  childName?: string;
  childAge?: number;
  ageGroup?: UserAgeGroup;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  permissions?: CaregiverPermissions;
}

export interface LinkedDeviceProfile {
  id: string;
  childName: string;
  ageGroup: UserAgeGroup;
  age?: number;
  pairingCode: string;
  deviceToken?: string;
  linkedAt: string;
  lastActive?: string;
  status: 'connected' | 'offline' | 'unlinked';
  permissions: CaregiverPermissions;
}

export interface CaregiverAccountData {
  caregiverId: string;
  name: string;
  email: string;
  phone?: string;
  linkedChildren: LinkedDeviceProfile[];
  selectedChildId?: string;
}

export type PredefinedAlertId = 
  | 'need_help'      // 🆘 I NEED HELP
  | 'overwhelmed'    // 😣 I'M OVERWHELMED
  | 'need_break'     // 🧘 I NEED A BREAK
  | 'want_to_talk'   // 💬 I WANT TO TALK
  | 'im_okay'        // ❤️ I'M OKAY
  | string;          // Custom user-defined alert IDs

export interface HelpAlertPreset {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
  colorClass: string;
  borderClass: string;
  ttsAnnouncement: string;
  isCustom?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export type PredefinedCaregiverResponseId =
  | 'im_here'        // ❤️ I'm here
  | 'coming'         // 🚗 I'm coming
  | 'okay'           // 👍 Okay
  | 'give_minutes'   // ⏳ Give me a few minutes
  | string;          // Custom user-defined response IDs

export interface CaregiverResponsePreset {
  id: string;
  label: string;
  text: string;
  emoji: string;
  isCustom?: boolean;
}

export interface CalmCopingStrategy {
  id: string;
  title: string;
  instruction: string;
  emoji: string;
  category: 'breathing' | 'sensory' | 'movement' | 'comfort' | 'grounding';
  durationMin?: number;
  isCustom?: boolean;
}

export interface BreathingPacerConfig {
  pattern: 'box_4_4_4_4' | 'relax_4_7_8' | 'calm_4_2_6' | 'gentle_3_3_3' | 'custom';
  inhaleSec: number;
  holdSec: number;
  exhaleSec: number;
  pauseSec?: number;
  soundTheme: 'chime' | 'soft_bell' | 'ocean' | 'silent';
}

export interface CaregiverMessage {
  id: string;
  senderName: string;
  text: string;
  emoji?: string;
  timestamp: string;
  read: boolean;
  responseId?: PredefinedCaregiverResponseId;
}

export interface CaregiverAlert {
  id: string;
  childName: string;
  pairingCode: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload' | 'want_to_talk' | 'im_okay';
  alertId?: PredefinedAlertId;
  label: string;
  emoji: string;
  location?: 'school' | 'therapy' | 'bus' | 'home' | 'other';
  note?: string;
  timestamp: string;
  status: 'active' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  responseMessage?: string;
  responseId?: PredefinedCaregiverResponseId;
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
  emergencyContact?: EmergencySupportContact | null;
  caregiverPhone?: string;
  userRole?: UserAccountRole;
  permissions?: CaregiverPermissions;
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

export {
  getThemesForAgeGroup,
  suggestThemeForUser,
  getThemedAacEmoji,
} from '../data/themesData';

export type SubscriptionTier = 'basic' | 'premium';
export type SubscriptionStatus = 'basic' | 'trial' | 'active' | 'expired';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialStartDate?: string;
  trialEndDate?: string;
  monthlyPrice: number; // 12.99
  yearlyPrice: number;  // 129.99 (Free 2 months)
  trialDays: number; // 30
  autoRenew: boolean;
}

export type SoundscapeId = 
  | 'rain' 
  | 'ocean' 
  | 'brown_noise' 
  | 'stream' 
  | 'crickets' 
  | 'space_drone' 
  | 'wind_chimes' 
  | 'train_chug'
  | 'train_tracks'
  | 'driving'
  | 'city'
  | 'night_time'
  | 'white_noise'
  | 'beach'
  | 'forest'
  | 'fireplace'
  | 'medieval_tavern';

export interface SoundscapeItem {
  id: SoundscapeId;
  name: string;
  description: string;
  emoji: string;
  isPremium: boolean;
  category: 'nature' | 'noise' | 'focus' | 'special_interest' | 'ambient';
  tags: string[];
}


// ── FEATURE: Emergency Sensory Mode ──────────────────────────────────────────
export interface EmergencySensorySettings {
  isActive: boolean;
  preferredSoundscape?: SoundscapeId;
  preferredSoundscapeVolume?: number;
  activatedAt?: string;
  pingCaregiverOnActivate: boolean;
}

// ── FEATURE: Incredible 5-Point Scale ────────────────────────────────────────
export type FivePointLevel = 1 | 2 | 3 | 4 | 5;
export interface FivePointCopingAction {
  label: string;
  emoji: string;
}
export interface FivePointLevelConfig {
  level: FivePointLevel;
  label: string;
  color: string;       // Tailwind bg class e.g. 'bg-green-400'
  textColor: string;   // Tailwind text class
  emoji: string;
  bodyFeelings: string;
  actions: FivePointCopingAction[]; // 2 recommended by caregiver
}
export interface FivePointScaleSettings {
  levels: FivePointLevelConfig[];
  showOnChildHome: boolean;
}

// ── FEATURE: Decision Wheel ───────────────────────────────────────────────────
export interface DecisionWheelOption {
  id: string;
  label: string;
  emoji: string;
  color: string; // hex or Tailwind
}
export interface DecisionWheelConfig {
  options: DecisionWheelOption[];
}

// ── FEATURE: Communication Passport ──────────────────────────────────────────
export interface CommunicationPassport {
  communicationStyle: string;       // e.g. "I use AAC to communicate"
  sensoryTriggers: string[];         // e.g. ["loud noises", "bright lights"]
  whatHelps: string[];               // e.g. ["quiet space", "fidget toy"]
  specialInterests: string[];        // e.g. ["trains", "dinosaurs"]
  comfortItems: string[];            // e.g. ["blue blanket", "noise-cancelling headphones"]
  emergencyNote?: string;            // e.g. "If overwhelmed, please call Mom: 555-1234"
  shareCode?: string;
}

// ── FEATURE: Spoon Theory Budget ─────────────────────────────────────────────
export type SpoonCost = 1 | 2 | 3;
export interface SpoonBudgetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  totalSpoons: number; // morning check-in
  usedSpoons: number;
  activityLog: Array<{ label: string; cost: SpoonCost; emoji: string }>;
  notes?: string;
}

// ── FEATURE: Visual Pie Clock ─────────────────────────────────────────────────
export interface PieTimerState {
  totalSeconds: number;
  secondsLeft: number;
  isRunning: boolean;
  startedAt?: number;
}

// ── FEATURE: Voice-Recorded Routine Step ─────────────────────────────────────
// Stored in VisualScheduleStep.audioDataUrl (base64 data URI)
// No new type needed; we extend VisualScheduleStep inline.

// ── FEATURE: Editable & Customizable Dashboard ────────────────────────────────
export type DashboardWidgetId =
  | 'routine_schedule'
  | 'medication_tracker'
  | 'five_point_scale'
  | 'spoon_budget'
  | 'pie_timer'
  | 'decision_wheel'
  | 'fidget_toys'
  | 'mood_journal'
  | 'cycle_tracker'
  | 'communication_passport'
  | 'quick_aac'
  | 'mascot_companion'
  | 'adventure_spotlight'
  | 'evening_reflection';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  emoji: string;
  description: string;
  category: 'core' | 'sensory' | 'wellness' | 'support';
  enabled: boolean;
}

// ── FEATURE: Full Backup & Restore ──────────────────────────────────────────
export interface BeeYouBackupData {
  version: number;
  exportedAt: string;
  app: 'BeeYou' | 'Lumina'; // 'Lumina' = backups made before the rebrand
  childProfile: ChildProfile;
  avatar: AvatarConfig;
  settings: AppSettings;
  aacItems: AACItem[];
  quickPhrases: QuickPhrase[];
  routines: Routine[];
  adventures: LifeAdventure[];
  skills: LifeSkill[];
  habits: DailyHabit[];
  worldState: MyWorldState;
  socialStories: SocialStory[];
  dailyRecollections?: any[];
  medications?: any[];
  cycleSettings?: any;
  userAgeGroup?: UserAgeGroup;
  enabledFeatures?: EnabledFeatures;
  activeThemeId?: string;
  soundscapePreferences?: Record<string, number>;
}


