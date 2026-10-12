/**
 * BeeYou AAC Architecture & Onboarding Types
 * Anti-Abandonment Motor Planning & Caregiver Support System
 */

export type GridStage = 1 | 2 | 3; // 1 = 4 tiles (Cause & Effect), 2 = 12 tiles (Motor Expansion), 3 = Full Matrix
export type DwellMode = 'direct' | 'dwell' | 'release'; // Touch ergonomic modes for tremors/involuntary motor patterns
export type AACButtonSize = 'small' | 'medium' | 'large'; // Standard clinical AAC density options (TouchChat, Proloquo2Go, TD Snap, LAMP)

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'beeyou_onboarding_completed',
  GRID_STAGE: 'beeyou_grid_stage',
  DWELL_MODE: 'beeyou_dwell_mode',
  AAC_EXPERIENCE_KNOWN: 'beeyou_aac_experience_known',
  AAC_PROMPT_COMPLETED: 'beeyou_aac_prompt_completed',
  BUTTON_SIZE: 'beeyou_aac_button_size',
} as const;

export interface OnboardingTourState {
  completed: boolean;
  currentStep: number;
  gridStage: GridStage;
  dwellMode: DwellMode;
}

export type GrammaticalCategory = 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';

export interface AACTourTile {
  id: string;
  label: string;
  speechText: string;
  emoji: string;
  colorType: GrammaticalCategory;
  row: number;
  col: number;
  category?: string;
  photoUrl?: string;
  isLockedOriginal?: boolean; // Highlight motor continuity for the first 4 words
  grammars?: {
    present: string;
    past: string;
    continuous: string;
    thirdPerson?: string;
  };
}

export type CaregiverHelpTopicId =
  | 'create_folder'
  | 'add_photo_tile'
  | 'custom_words_tts'
  | 'grammar_forms'
  | 'mask_dim_tiles'
  | 'touch_ergonomics';

export interface CaregiverHelpTopic {
  id: CaregiverHelpTopicId;
  title: string;
  shortLabel: string;
  iconName: string;
  summary: string;
  badge: string;
  keyTakeaway: string;
  steps: string[];
  targetSelector?: string;
  interactiveDemoType?: 'folder' | 'photo' | 'phonetic' | 'grammar' | 'mask' | 'ergonomics';
}
