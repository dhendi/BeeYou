import { EmotionType } from '../types';

export type DayRating = 'great' | 'good' | 'okay' | 'difficult' | 'very_hard';
export type EnergyLevelType = 'low' | 'calm' | 'high' | 'overstimulated';
export type ChallengeType = 
  | 'none' 
  | 'routine_change' 
  | 'sensory_overload' 
  | 'waiting_transitions' 
  | 'communication' 
  | 'social_conflict' 
  | 'physical';

export type WinType = 
  | 'routine_success' 
  | 'communication_aac' 
  | 'calmed_down' 
  | 'tried_new' 
  | 'great_school' 
  | 'fun_play';

export type SleepQualityType = 
  | 'slept_well' 
  | 'restless' 
  | 'trouble_falling_asleep' 
  | 'woke_early';

export interface DailyRecollectionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  submittedBy: 'child' | 'parent' | 'together';
  overallDay: DayRating;
  energyLevel: EnergyLevelType;
  primaryFeeling: EmotionType;
  mainChallenge: ChallengeType;
  bestWin: WinType;
  sleepQuality?: SleepQualityType;
  additionalNotes?: string;
  starsAwarded?: number;
}

export interface DayRatingOption {
  value: DayRating;
  label: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
}

export const DAY_RATING_OPTIONS: DayRatingOption[] = [
  {
    value: 'great',
    label: 'Great Day',
    emoji: '🌟',
    description: 'Lots of joy, everything went smoothly',
    color: '#15803d',
    bgColor: '#dcfce7',
  },
  {
    value: 'good',
    label: 'Good Day',
    emoji: '😊',
    description: 'Mostly positive, handled tasks well',
    color: '#0369a1',
    bgColor: '#e0f2fe',
  },
  {
    value: 'okay',
    label: 'Okay / Normal',
    emoji: '😐',
    description: 'A mix of ups and downs, average day',
    color: '#854d0e',
    bgColor: '#fef9c3',
  },
  {
    value: 'difficult',
    label: 'Difficult',
    emoji: '😕',
    description: 'Some tough moments, felt frustrated or tired',
    color: '#c2410c',
    bgColor: '#ffedd5',
  },
  {
    value: 'very_hard',
    label: 'Very Tough',
    emoji: '😣',
    description: 'Heavy struggle, big meltdowns or overload',
    color: '#b91c1c',
    bgColor: '#fee2e2',
  },
];

export interface EnergyOption {
  value: EnergyLevelType;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export const ENERGY_OPTIONS: EnergyOption[] = [
  {
    value: 'low',
    label: 'Low / Tired',
    emoji: '🔋',
    description: 'Slow body, depleted battery, needed rest',
    color: '#64748b',
  },
  {
    value: 'calm',
    label: 'Calm & Steady',
    emoji: '⚡',
    description: 'Just right, regulated, ready to engage',
    color: '#0284c7',
  },
  {
    value: 'high',
    label: 'High & Bouncy',
    emoji: '⚡⚡',
    description: 'Very active, sensory-seeking, lots of wiggles',
    color: '#eab308',
  },
  {
    value: 'overstimulated',
    label: 'Overstimulated',
    emoji: '⚡💥',
    description: 'Sensory fried, restless, close to burnout',
    color: '#ef4444',
  },
];

export interface ChallengeOption {
  value: ChallengeType;
  label: string;
  emoji: string;
  description: string;
}

export const CHALLENGE_OPTIONS: ChallengeOption[] = [
  {
    value: 'none',
    label: 'Smooth Sailing',
    emoji: '⛵',
    description: 'No major hurdles or triggers today',
  },
  {
    value: 'routine_change',
    label: 'Plan / Routine Change',
    emoji: '🔄',
    description: 'Unexpected surprise or altered schedule',
  },
  {
    value: 'sensory_overload',
    label: 'Sensory Overload',
    emoji: '🔊',
    description: 'Too loud, bright, crowded, or itchy clothes',
  },
  {
    value: 'waiting_transitions',
    label: 'Waiting & Transitions',
    emoji: '⏳',
    description: 'Tough time stopping an activity or waiting turn',
  },
  {
    value: 'communication',
    label: 'Expressing Needs',
    emoji: '🗣️',
    description: 'Frustration finding words or being understood',
  },
  {
    value: 'social_conflict',
    label: 'Social Friction',
    emoji: '👥',
    description: 'Difficulty with peers, siblings, or sharing',
  },
  {
    value: 'physical',
    label: 'Body Discomfort / Hunger',
    emoji: '🥱',
    description: 'Tummy ache, overtiredness, or hungry',
  },
];

export interface WinOption {
  value: WinType;
  label: string;
  emoji: string;
  description: string;
}

export const WIN_OPTIONS: WinOption[] = [
  {
    value: 'routine_success',
    label: 'Smooth Routine',
    emoji: '⏰',
    description: 'Finished morning or bedtime routines nicely',
  },
  {
    value: 'communication_aac',
    label: 'Great Communication',
    emoji: '🗣️',
    description: 'Used AAC or words to self-advocate and ask for needs',
  },
  {
    value: 'calmed_down',
    label: 'Coping & Calming',
    emoji: '🌬️',
    description: 'Took deep breaths or used calm toolkit independently',
  },
  {
    value: 'tried_new',
    label: 'Brave & Flexible',
    emoji: '🌟',
    description: 'Tried a new food, place, or adapted to change',
  },
  {
    value: 'great_school',
    label: 'School / Therapy Win',
    emoji: '🏫',
    description: 'Positive engagement with teachers or therapists',
  },
  {
    value: 'fun_play',
    label: 'Joyful Play & Connection',
    emoji: '🎨',
    description: 'Creative building, laughter, or happy family time',
  },
];

export interface SleepOption {
  value: SleepQualityType;
  label: string;
  emoji: string;
  description: string;
}

export const SLEEP_OPTIONS: SleepOption[] = [
  {
    value: 'slept_well',
    label: 'Slept Well',
    emoji: '🌙',
    description: 'Solid, restful sleep through the night',
  },
  {
    value: 'restless',
    label: 'Restless Sleep',
    emoji: '😴',
    description: 'Tossed and turned, woke up once or twice',
  },
  {
    value: 'trouble_falling_asleep',
    label: 'Hard to Wind Down',
    emoji: '🛌',
    description: 'Took a long time to fall asleep',
  },
  {
    value: 'woke_early',
    label: 'Woke Up Very Early',
    emoji: '⏰',
    description: 'Awoke before schedule feeling groggy',
  },
];

// Helper: Seed historical data for past 6 days
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().split('T')[0];
};

export const INITIAL_DAILY_RECOLLECTIONS: DailyRecollectionEntry[] = [
  {
    id: 'rec-6',
    date: getPastDateStr(6),
    timestamp: Date.now() - 6 * 86400000,
    submittedBy: 'together',
    overallDay: 'good',
    energyLevel: 'calm',
    primaryFeeling: 'happy',
    mainChallenge: 'none',
    bestWin: 'routine_success',
    sleepQuality: 'slept_well',
    additionalNotes: 'Morning readiness routine took only 8 minutes with visual timer! Leo was proud.',
    starsAwarded: 3,
  },
  {
    id: 'rec-5',
    date: getPastDateStr(5),
    timestamp: Date.now() - 5 * 86400000,
    submittedBy: 'parent',
    overallDay: 'difficult',
    energyLevel: 'overstimulated',
    primaryFeeling: 'overwhelmed',
    mainChallenge: 'sensory_overload',
    bestWin: 'calmed_down',
    sleepQuality: 'restless',
    additionalNotes: 'Fire drill at school triggered high anxiety. Leo put on noise-cancelling headphones and used the calm pacer for 5 minutes.',
    starsAwarded: 3,
  },
  {
    id: 'rec-4',
    date: getPastDateStr(4),
    timestamp: Date.now() - 4 * 86400000,
    submittedBy: 'together',
    overallDay: 'great',
    energyLevel: 'calm',
    primaryFeeling: 'excited',
    mainChallenge: 'none',
    bestWin: 'communication_aac',
    sleepQuality: 'slept_well',
    additionalNotes: 'Speech session went wonderfully. Built a 4-word sentence on AAC board without prompting.',
    starsAwarded: 3,
  },
  {
    id: 'rec-3',
    date: getPastDateStr(3),
    timestamp: Date.now() - 3 * 86400000,
    submittedBy: 'child',
    overallDay: 'okay',
    energyLevel: 'high',
    primaryFeeling: 'calm',
    mainChallenge: 'waiting_transitions',
    bestWin: 'fun_play',
    sleepQuality: 'slept_well',
    additionalNotes: 'Built a huge LEGO train track. Hard to leave for dinner, but 2-minute countdown timer helped.',
    starsAwarded: 3,
  },
  {
    id: 'rec-2',
    date: getPastDateStr(2),
    timestamp: Date.now() - 2 * 86400000,
    submittedBy: 'together',
    overallDay: 'good',
    energyLevel: 'calm',
    primaryFeeling: 'happy',
    mainChallenge: 'routine_change',
    bestWin: 'tried_new',
    sleepQuality: 'slept_well',
    additionalNotes: 'Rain caused PE class to be inside. Leo adapted smoothly after viewing the Plans Changed card.',
    starsAwarded: 3,
  },
  {
    id: 'rec-1',
    date: getPastDateStr(1),
    timestamp: Date.now() - 1 * 86400000,
    submittedBy: 'together',
    overallDay: 'great',
    energyLevel: 'calm',
    primaryFeeling: 'excited',
    mainChallenge: 'none',
    bestWin: 'routine_success',
    sleepQuality: 'slept_well',
    additionalNotes: 'Completed full morning routine and earned Morning Superstar sticker! Very cheerful day.',
    starsAwarded: 3,
  },
];

/**
 * Generate a formatted clinical summary text to copy/share with therapists & educators
 */
export function generateTherapistSummaryText(
  entries: DailyRecollectionEntry[],
  childName: string = 'Leo'
): string {
  if (entries.length === 0) {
    return `No daily recollections recorded yet for ${childName}.`;
  }

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const totalDays = sorted.length;
  const greatOrGoodCount = sorted.filter(
    (e) => e.overallDay === 'great' || e.overallDay === 'good'
  ).length;
  const difficultCount = sorted.filter(
    (e) => e.overallDay === 'difficult' || e.overallDay === 'very_hard'
  ).length;
  const positiveRatio = Math.round((greatOrGoodCount / totalDays) * 100);

  // Count challenges
  const challengeCounts: Record<string, number> = {};
  sorted.forEach((e) => {
    if (e.mainChallenge !== 'none') {
      challengeCounts[e.mainChallenge] = (challengeCounts[e.mainChallenge] || 0) + 1;
    }
  });

  // Count wins
  const winCounts: Record<string, number> = {};
  sorted.forEach((e) => {
    winCounts[e.bestWin] = (winCounts[e.bestWin] || 0) + 1;
  });

  const lines: string[] = [
    `==================================================`,
    `📋 LUMINA DAILY MOOD & BEHAVIOR SUMMARY FOR THERAPY`,
    `Child: ${childName} | Date Generated: ${new Date().toLocaleDateString()}`,
    `Days Logged: ${totalDays} | Positive Days: ${positiveRatio}% (${greatOrGoodCount}/${totalDays})`,
    `Difficult Days: ${difficultCount}/${totalDays}`,
    `==================================================\n`,
    `📊 1. REGULATION & ENERGY TRENDS:`,
    `- Energy: ${sorted.filter(e => e.energyLevel === 'calm').length} Calm/Regulated, ${sorted.filter(e => e.energyLevel === 'high').length} High/Seeking, ${sorted.filter(e => e.energyLevel === 'overstimulated').length} Overstimulated, ${sorted.filter(e => e.energyLevel === 'low').length} Low/Tired`,
    `- Sleep: ${sorted.filter(e => e.sleepQuality === 'slept_well').length} Slept well, ${sorted.filter(e => e.sleepQuality === 'restless').length} Restless/Fragmented\n`,
    `⚡ 2. TOP REPORTED CHALLENGES & SENSORY TRIGGERS:`,
  ];

  if (Object.keys(challengeCounts).length === 0) {
    lines.push(`- No persistent triggers recorded (smooth regulation reported)`);
  } else {
    Object.entries(challengeCounts).forEach(([trigger, count]) => {
      const match = CHALLENGE_OPTIONS.find((c) => c.value === trigger);
      lines.push(`- ${match ? match.label : trigger}: ${count} time(s)`);
    });
  }

  lines.push(`\n🌟 3. TOP WINS & SUCCESSFUL COPING STRATEGIES:`);
  Object.entries(winCounts).forEach(([win, count]) => {
    const match = WIN_OPTIONS.find((w) => w.value === win);
    lines.push(`- ${match ? match.label : win}: ${count} time(s)`);
  });

  lines.push(`\n📅 4. DAY-BY-DAY RECOLLECTION NOTES:`);
  sorted.slice(0, 7).forEach((entry) => {
    const ratingObj = DAY_RATING_OPTIONS.find((r) => r.value === entry.overallDay);
    const winObj = WIN_OPTIONS.find((w) => w.value === entry.bestWin);
    const challengeObj = CHALLENGE_OPTIONS.find((c) => c.value === entry.mainChallenge);

    lines.push(
      `• [${entry.date}] Overall: ${ratingObj?.emoji} ${ratingObj?.label} | Energy: ${entry.energyLevel} | Win: ${winObj?.label}`
    );
    if (entry.mainChallenge !== 'none') {
      lines.push(`  Challenge: ${challengeObj?.emoji} ${challengeObj?.label}`);
    }
    if (entry.additionalNotes) {
      lines.push(`  Note: "${entry.additionalNotes}"`);
    }
  });

  lines.push(`\n==================================================`);
  lines.push(`Report generated via Lumina Neurodivergent Companion App.`);
  return lines.join('\n');
}
