import { DashboardWidgetId, EnabledFeatures } from '../types';

/**
 * Shared information-architecture helpers for Lumina.
 * Keeps the bottom nav, the "More" screen, the dashboard and the feature
 * toggles consistent without adding another toggle system: everything here
 * is derived from the existing `enabledFeatures` and `userAgeGroup` state.
 */

/** Main-area views that live under the "More" tab instead of the bottom bar. */
export const MORE_VIEWS = ['more', 'adventures', 'skills', 'feelings', 'rewards', 'my-world'] as const;

export const isMoreView = (view: string): boolean => (MORE_VIEWS as readonly string[]).includes(view);

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
  // My Day, Communicate, motivation
  kid: ['routine_schedule', 'quick_aac', 'mascot_companion'],
  // My Day, Communicate, Mood, Energy
  teen: ['routine_schedule', 'quick_aac', 'mood_journal', 'spoon_budget'],
  // Schedule, Communicate, Energy, Mood/reflection, Health reminders
  adult: ['routine_schedule', 'quick_aac', 'spoon_budget', 'mood_journal', 'medication_tracker'],
};

/** The "Minimal" preset: just the day plan and quick communication. */
export const MINIMAL_WIDGETS: DashboardWidgetId[] = ['routine_schedule', 'quick_aac'];

/** Plain-language groups for the "Choose what Lumina helps you with" screen. */
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
  { id: 'rewards', title: 'Rewards & motivation', emoji: '⭐', blurb: 'Stars, stickers and celebrations', keys: ['starsAndRewards'] },
];
