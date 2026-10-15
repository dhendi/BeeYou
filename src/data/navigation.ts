import { DashboardWidgetId, EnabledFeatures, DashboardWidgetConfig } from '../types';

/**
 * Shared information-architecture helpers for BeeYou.
 * Keeps the bottom nav, the "More" screen, the dashboard and the feature
 * toggles consistent without adding another toggle system: everything here
 * is derived from the existing `enabledFeatures` and `userAgeGroup` state.
 */

/** Main-area views that live under the "More" tab instead of the bottom bar. */
export const MORE_VIEWS = ['more', 'adventures', 'skills', 'feelings', 'rewards'] as const;

export const isMoreView = (view: string): boolean => (MORE_VIEWS as readonly string[]).includes(view);

/** All customizable dashboard widgets */
export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
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
    title: 'Daily Welcome Greeting',
    emoji: '🐝',
    description: 'Warm daily greeting and comforting encouragement',
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

/**
 * Dashboard widgets that depend on a feature toggle. When the feature is
 * switched off the widget is hidden from Home (and from the customizer) so
 * users never see a card for something they turned off.
 */
export const WIDGET_FEATURE_GATE: Partial<Record<DashboardWidgetId, keyof EnabledFeatures>> = {
  routine_schedule: 'firstThenSchedules',
  quick_aac: 'aacCommunication',
  five_point_scale: 'sensoryBreathingPacer',
  fidget_toys: 'sensoryBreathingPacer',
  decision_wheel: 'sensoryBreathingPacer',
  pie_timer: 'visualCountdownTimer',
  medication_tracker: 'medicationReminders',
  mood_journal: 'moodJournal',
  cycle_tracker: 'cycleTracker',
  evening_reflection: 'dailyMoodRecollection',
  adventure_spotlight: 'socialStories',
};

export const isWidgetAvailable = (id: DashboardWidgetId, features?: EnabledFeatures): boolean => {
  const gate = WIDGET_FEATURE_GATE[id];
  return !gate || features?.[gate] !== false;
};

/** Widgets switched on by default for each age group. Everything else stays one tap away in the customizer. */
export const AGE_DEFAULT_WIDGETS: Record<'kid' | 'teen' | 'adult', DashboardWidgetId[]> = {
  // My Day, Communicate, mascot companion, 5-point scale, and visual timer
  kid: ['routine_schedule', 'quick_aac', 'mascot_companion', 'five_point_scale', 'pie_timer'],
  // My Day, Communicate, Mood, Energy, visual timer
  teen: ['routine_schedule', 'quick_aac', 'mascot_companion', 'mood_journal', 'spoon_budget', 'pie_timer'],
  // Schedule, Communicate, Energy, Mood/reflection, Health reminders
  adult: ['routine_schedule', 'quick_aac', 'spoon_budget', 'mood_journal', 'medication_tracker', 'pie_timer'],
};

/** The "Minimal" preset: just the day plan and quick communication. */
export const MINIMAL_WIDGETS: DashboardWidgetId[] = ['routine_schedule', 'quick_aac'];

/** Plain-language groups for the "Choose what BeeYou helps you with" screen. */
export interface FeatureGroup {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  keys: Array<keyof EnabledFeatures>;
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  { id: 'communication', title: 'Communication', emoji: '💬', blurb: 'Talk with pictures, words and phrases', keys: ['aacCommunication'] },
  { id: 'routines', title: 'Routines & schedules', emoji: '📅', blurb: 'Plan your day step by step', keys: ['firstThenSchedules', 'visualCountdownTimer'] },
  { id: 'sensory', title: 'Sensory & regulation', emoji: '🛋️', blurb: 'Calm down and reset', keys: ['sensoryBreathingPacer'] },
  { id: 'feelings', title: 'Feelings', emoji: '💛', blurb: 'Check in and reflect', keys: ['dailyMoodRecollection', 'moodJournal'] },
  { id: 'skills', title: 'Life skills & social stories', emoji: '🚀', blurb: 'Get ready for new things', keys: ['lifeSkills', 'socialStories'] },
  { id: 'caregiver', title: 'Caregiver support', emoji: '🚨', blurb: 'Ask a trusted person for help', keys: ['emergencyAlertSOS'] },
  { id: 'health', title: 'Health & wellness', emoji: '💊', blurb: 'Reminders and body tracking', keys: ['medicationReminders', 'cycleTracker'] },
  { id: 'rewards', title: 'Rewards & motivation', emoji: '🏆', blurb: 'Badges, stickers and celebrations', keys: ['starsAndRewards'] },
];
