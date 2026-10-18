/**
 * ThemedEmotionFace — Authentic Themed Mascot Feelings System
 *
 * Replaces the old 16-bit pixel feelings with authentic, sensory-friendly
 * hand-drawn watercolor mascot stickers from `public/assets/stickers/`.
 *
 * Seamlessly adapts across all 9 themes:
 * - Wise Turtle Sanctuary -> Shelly the Turtle feelings (happy, calm, excited, sleepy, unsure)
 * - Dino Kingdom -> Rex the T-Rex feelings
 * - Ribbit Pond -> Hoppy the Frog feelings
 * - Steam Express -> Conductor Leo Locomotive feelings
 * - Cosmic Explorer -> Orion the Astro-Pup feelings
 * - Ocean Splash -> Baby Shark / Dolphin feelings
 * - Turbo Speedway -> Turbo Racer feelings
 * - Tactile Silicone & Oat Milk (Default) -> Classic round face feelings
 */

import React, { useState } from 'react';
import { AppTheme } from '../data/themesData';

export type EmotionId =
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

export interface ThemedEmotionFaceProps {
  emotionId: EmotionId | string;
  theme?: AppTheme | null;
  hairStyle?: string;
  gender?: 'boy' | 'girl' | 'neutral';
  skinTone?: string;
  hairColor?: string;
  /** CSS size class e.g. "w-16 h-16" */
  className?: string;
}

/**
 * Returns the exact themed watercolor mascot sticker path for a given emotion and theme category.
 */
export function getThemedEmotionStickerSrc(emotionId: string, themeCategory?: string): string {
  const normId = (emotionId || 'happy').toLowerCase().trim();
  const cat = themeCategory || 'classic';

  // Map high-level / extended emotions to core mood keys:
  // - happy, joy, content, grateful -> happy
  // - calm, peaceful, focused, reflective -> calm
  // - excited, inspired, energized -> excited
  // - tired, sleepy, exhausted -> sleepy
  // - worried, unsure, confused, scared, overwhelmed, angry, frustrated -> unsure (gentle downcast)
  let moodKey: 'happy' | 'calm' | 'excited' | 'sleepy' | 'unsure' | 'sad' = 'happy';
  if (normId === 'happy' || normId === 'joy' || normId === 'content' || normId === 'grateful' || normId === 'confident') {
    moodKey = 'happy';
  } else if (normId === 'calm' || normId === 'peaceful' || normId === 'focused' || normId === 'reflective') {
    moodKey = 'calm';
  } else if (normId === 'excited' || normId === 'inspired' || normId === 'energized') {
    moodKey = 'excited';
  } else if (normId === 'tired' || normId === 'sleepy' || normId === 'exhausted') {
    moodKey = 'sleepy';
  } else if (normId === 'sad') {
    moodKey = 'sad';
  } else {
    // worried, unsure, confused, scared, overwhelmed, angry, frustrated, sensitive
    moodKey = 'unsure';
  }

  // Theme-specific sticker files
  switch (cat) {
    case 'turtle':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/turtle_mood_happy.webp';
        case 'calm': return '/assets/stickers/turtle_mood_calm.webp';
        case 'excited': return '/assets/stickers/turtle_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/turtle_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/turtle_mood_unsure.webp';
        case 'sad': return '/assets/stickers/turtle_mood_sad.webp';
      }
      break;

    case 'dinosaur':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/dino_mood_happy.webp';
        case 'calm': return '/assets/stickers/dino_mood_calm.webp';
        case 'excited': return '/assets/stickers/dino_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/dino_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/dino_mood_unsure.webp';
        case 'sad': return '/assets/stickers/dino_mood_sad.webp';
      }
      break;

    case 'frog':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/frog_mood_happy.webp';
        case 'calm': return '/assets/stickers/frog_mood_calm.webp';
        case 'excited': return '/assets/stickers/frog_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/frog_mood_tired.webp';
        case 'unsure': return '/assets/stickers/frog_mood_worried.webp';
        case 'sad': return '/assets/stickers/frog_mood_sad.webp';
      }
      break;

    case 'train':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/train_mood_happy.webp';
        case 'calm': return '/assets/stickers/train_mood_calm.webp';
        case 'excited': return '/assets/stickers/train_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/train_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/train_mood_unsure.webp';
        case 'sad': return '/assets/stickers/train_mood_sad.webp';
      }
      break;

    case 'space':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/space_mood_happy.webp';
        case 'calm': return '/assets/stickers/space_mood_calm.webp';
        case 'excited': return '/assets/stickers/space_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/space_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/space_mood_unsure.webp';
        case 'sad': return '/assets/stickers/space_mood_sad.webp';
      }
      break;

    case 'ocean':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/ocean_happy_baby_shark.webp';
        case 'calm': return '/assets/stickers/ocean_calm_floating_shark.webp';
        case 'excited': return '/assets/stickers/ocean_excited_leaping_shark.webp';
        case 'sleepy': return '/assets/stickers/ocean_sleepy_resting_shark.webp';
        case 'unsure': return '/assets/stickers/ocean_unsure_wondering_shark.webp';
        case 'sad': return '/assets/stickers/ocean_mood_sad.webp';
      }
      break;

    case 'racing':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/racing_mood_happy.webp';
        case 'calm': return '/assets/stickers/racing_mood_calm.webp';
        case 'excited': return '/assets/stickers/racing_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/racing_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/racing_mood_unsure.webp';
        case 'sad': return '/assets/stickers/racing_mood_sad.webp';
      }
      break;

    case 'fantasy':
      switch (moodKey) {
        case 'happy': return '/assets/stickers/fairytale_mood_happy.webp';
        case 'calm': return '/assets/stickers/fairytale_mood_calm.webp';
        case 'excited': return '/assets/stickers/fairytale_mood_excited.webp';
        case 'sleepy': return '/assets/stickers/fairytale_mood_sleepy.webp';
        case 'unsure': return '/assets/stickers/fairytale_mood_unsure.webp';
        case 'sad': return '/assets/stickers/fairytale_mood_sad.webp';
      }
      break;

    case 'classic':
    default:
      switch (moodKey) {
        case 'happy': return '/assets/stickers/mood_happy.webp';
        case 'calm': return '/assets/stickers/mood_calm.webp';
        case 'excited': return '/assets/stickers/mood_excited.webp';
        case 'sleepy': return '/assets/stickers/mood_tired.webp';
        case 'unsure': return '/assets/stickers/mood_worried.webp';
        case 'sad': return '/assets/stickers/mood_sad.webp';
      }
      break;
  }

  return '/assets/stickers/mood_happy.webp';
}

export const ThemedEmotionFace: React.FC<ThemedEmotionFaceProps> = ({
  emotionId,
  theme,
  className = 'w-16 h-16',
}) => {
  const category = theme?.category || 'classic';
  const stickerSrc = getThemedEmotionStickerSrc(emotionId, category);
  const label = emotionId.charAt(0).toUpperCase() + emotionId.slice(1);
  const [hasError, setHasError] = useState(false);

  return (
    <span
      className={`${className} inline-flex items-center justify-center select-none shrink-0 drop-shadow-xs relative overflow-hidden`}
      aria-hidden="true"
    >
      {!hasError ? (
        <img
          key={`${category}-${emotionId}`}
          src={stickerSrc}
          alt={label}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain transition-transform hover:scale-105 active:scale-95"
          loading="lazy"
        />
      ) : (
        <span className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
          {label.slice(0, 2)}
        </span>
      )}
    </span>
  );
};
