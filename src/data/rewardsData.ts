import { RewardBadge, ProfileSticker } from '../types';

export const REWARD_BADGES: RewardBadge[] = [
  {
    id: 'badge-morning',
    title: 'Morning Sun',
    description: 'Checked your Morning Brief to start the day calm & ready!',
    emoji: '🌅',
    category: 'routines',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-sun',
    rewardStars: 2,
  },
  {
    id: 'badge-teeth',
    title: 'Chomper Champion',
    description: 'Used the gentle timer to brush your teeth clean & bright!',
    emoji: '🪥',
    category: 'skills',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-tooth',
    rewardStars: 2,
  },
  {
    id: 'badge-routine',
    title: 'Routine Rocker',
    description: 'Completed tasks in your daily schedule step-by-step!',
    emoji: '📅',
    category: 'routines',
    targetCount: 3,
    currentCount: 2,
    isUnlocked: false,
    unlockedStickerId: 'st-rocker',
    rewardStars: 3,
  },
  {
    id: 'badge-feelings',
    title: 'Feelings Explorer',
    description: 'Shared how your heart and body are feeling today!',
    emoji: '💖',
    category: 'feelings',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-heart',
    rewardStars: 2,
  },
  {
    id: 'badge-calm',
    title: 'Calm Breather',
    description: 'Took gentle breaths with the breathing bubble or calm tools!',
    emoji: '🫧',
    category: 'feelings',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-bubble',
    rewardStars: 2,
  },
  {
    id: 'badge-aac',
    title: 'Voice of Wonder',
    description: 'Built a sentence with words and pictures on the AAC board!',
    emoji: '🗣️',
    category: 'aac',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-voice',
    rewardStars: 2,
  },
  {
    id: 'badge-adventure',
    title: 'Brave Explorer',
    description: 'Prepared for a real-world visit like the dentist or haircut!',
    emoji: '🚀',
    category: 'adventure',
    targetCount: 1,
    currentCount: 1,
    isUnlocked: true,
    unlockedStickerId: 'st-helmet',
    rewardStars: 3,
  },
  {
    id: 'badge-hands',
    title: 'Bubbly Hero',
    description: 'Washed hands clean with warm water and soap bubbles!',
    emoji: '🧼',
    category: 'skills',
    targetCount: 1,
    currentCount: 0,
    isUnlocked: false,
    unlockedStickerId: 'st-wand',
    rewardStars: 2,
  },
  {
    id: 'badge-dino',
    title: 'Dino Discovery',
    description: 'Completed 5 total missions across your day with patience!',
    emoji: '🦖',
    category: 'skills',
    targetCount: 5,
    currentCount: 4,
    isUnlocked: false,
    unlockedStickerId: 'st-dino',
    rewardStars: 4,
  },
  {
    id: 'badge-allstar',
    title: 'Golden Legend',
    description: 'Collected 10 or more shining star coins for your room!',
    emoji: '👑',
    category: 'routines',
    targetCount: 10,
    currentCount: 14,
    isUnlocked: true,
    unlockedStickerId: 'st-crown',
    rewardStars: 5,
  },
];

export const PROFILE_STICKERS: ProfileSticker[] = [
  {
    id: 'st-sun',
    name: 'Morning Sun',
    emoji: '☀️',
    description: 'Warm and cheerful golden rays.',
    badgeIdRequired: 'badge-morning',
  },
  {
    id: 'st-tooth',
    name: 'Sparkle Tooth',
    emoji: '🦷',
    description: 'Sparkling clean dental superstar.',
    badgeIdRequired: 'badge-teeth',
  },
  {
    id: 'st-heart',
    name: 'Rainbow Heart',
    emoji: '🌈',
    description: 'All feelings are welcome and respected.',
    badgeIdRequired: 'badge-feelings',
  },
  {
    id: 'st-bubble',
    name: 'Peaceful Bubble',
    emoji: '🫧',
    description: 'Gentle and calm breathing spirit.',
    badgeIdRequired: 'badge-calm',
  },
  {
    id: 'st-voice',
    name: 'Speech Star',
    emoji: '💬',
    description: 'Expressing thoughts your way.',
    badgeIdRequired: 'badge-aac',
  },
  {
    id: 'st-helmet',
    name: 'Cosmic Helmet',
    emoji: '🧑‍🚀',
    description: 'Ready to explore unknown galaxies!',
    badgeIdRequired: 'badge-adventure',
  },
  {
    id: 'st-crown',
    name: 'Golden Crown',
    emoji: '👑',
    description: 'Royalty of kindness and perseverance.',
    badgeIdRequired: 'badge-allstar',
  },
  {
    id: 'st-rocker',
    name: 'Electric Guitar',
    emoji: '🎸',
    description: 'Rocking through daily schedules!',
    badgeIdRequired: 'badge-routine',
  },
  {
    id: 'st-dino',
    name: 'Friendly Rex',
    emoji: '🦕',
    description: 'Gentle giant who loves quiet playtime.',
    badgeIdRequired: 'badge-dino',
  },
  {
    id: 'st-wand',
    name: 'Magic Wand',
    emoji: '🪄',
    description: 'Sparkles and wonder wherever you go.',
    badgeIdRequired: 'badge-hands',
  },
  {
    id: 'st-pizza',
    name: 'Champion Pizza',
    emoji: '🍕',
    description: 'Yummy favorite food badge!',
    starsRequired: 3,
  },
  {
    id: 'st-train',
    name: 'Golden Locomotive',
    emoji: '🚂',
    description: 'Full steam ahead on smooth tracks.',
    starsRequired: 5,
  },
];

export const CHARACTER_TITLES: string[] = [
  'Star Explorer',
  'Gentle Hero',
  'Space Captain',
  'Master Builder',
  'Kind Companion',
  'Creative Artist',
  'Peaceful Dreamer',
];

export interface RoutineStickerDef {
  routineId: string;
  routineTitlePattern: string;
  stickerName: string;
  emoji: string;
  description: string;
  starsAward: number;
}

export const ROUTINE_STICKER_REWARDS: RoutineStickerDef[] = [
  {
    routineId: 'routine-morning',
    routineTitlePattern: 'morning',
    stickerName: 'Morning Superstar',
    emoji: '🌅',
    description: 'Woke up, stretched, brushed teeth, and got ready to shine!',
    starsAward: 3,
  },
  {
    routineId: 'routine-bedtime',
    routineTitlePattern: 'bedtime',
    stickerName: 'Starry Dreamer',
    emoji: '🌙',
    description: 'Cozy in pajamas, brushed teeth, ready for sweet dreams!',
    starsAward: 3,
  },
  {
    routineId: 'routine-appointment',
    routineTitlePattern: 'dentist',
    stickerName: 'Sparkle Chomper',
    emoji: '🦷',
    description: 'Braved the dentist appointment with courage and calm!',
    starsAward: 5,
  },
  {
    routineId: 'routine-school',
    routineTitlePattern: 'school',
    stickerName: 'Backpack Hero',
    emoji: '🎒',
    description: 'School routine conquered like an everyday champion!',
    starsAward: 3,
  },
  {
    routineId: 'routine-cleanup',
    routineTitlePattern: 'clean',
    stickerName: 'Tidy Champion',
    emoji: '🧸',
    description: 'Put every toy away into its cozy home!',
    starsAward: 3,
  },
  {
    routineId: 'routine-default',
    routineTitlePattern: '.*',
    stickerName: 'Routine Rocker',
    emoji: '🎸',
    description: 'Completed your scheduled missions step-by-step with great focus!',
    starsAward: 3,
  },
];

export function getStickerForRoutine(routine: { id: string; title: string }): RoutineStickerDef {
  const matchById = ROUTINE_STICKER_REWARDS.find((s) => s.routineId === routine.id);
  if (matchById) return matchById;

  const titleLower = (routine.title || '').toLowerCase();
  const matchByTitle = ROUTINE_STICKER_REWARDS.find(
    (s) => s.routineTitlePattern !== '.*' && titleLower.includes(s.routineTitlePattern)
  );
  if (matchByTitle) return matchByTitle;

  return ROUTINE_STICKER_REWARDS[ROUTINE_STICKER_REWARDS.length - 1];
}

