/**
 * ARASAAC AAC Online Symbol & Pictogram Service
 * 
 * ARASAAC (Aragonese Center of Augmentative and Alternative Communication)
 * is the world's most widely adopted open-source clinical AAC pictogram library,
 * used across speech therapy clinics, schools, and apps like Cboard, AsTeRICS Grid,
 * LetMeTalk, and CoughDrop.
 * 
 * License: Creative Commons (BY-NC-SA).
 */

import { AACCategory } from '../types';

export interface AacSymbolItem {
  id: string | number;
  label: string;
  imageUrl: string;
  category: AACCategory;
  colorType: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  tags?: string[];
  emojiFallback?: string;
  source: 'arasaac' | 'custom' | 'pack';
}

export interface IndustryAacPack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  usedBy: string; // e.g., "TouchChat, LAMP, Proloquo2Go"
  icon: string;
  badge: string;
  items: Array<{
    label: string;
    speechText?: string;
    emoji: string;
    photoUrl: string;
    category: AACCategory;
    colorType: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  }>;
}

export const ARASAAC_IMAGE_BASE = 'https://static.arasaac.org/pictograms';

export function getArasaacImageUrl(id: number | string, size: 300 | 500 = 300): string {
  return `${ARASAAC_IMAGE_BASE}/${id}/${id}_${size}.png`;
}

/**
 * Searches the official ARASAAC REST API for clinical pictograms.
 */
export async function searchArasaacPictograms(query: string): Promise<AacSymbolItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  try {
    const response = await fetch(
      `https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(cleanQuery)}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      console.warn('ARASAAC search returned status', response.status);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 32).map((item: any) => {
      const primaryKeyword = item.keywords?.[0]?.keyword || cleanQuery;
      const type = item.keywords?.[0]?.type || 2; // 1: noun, 2: common noun, 3: verb, 4: adj, etc.

      let colorType: AacSymbolItem['colorType'] = 'noun';
      let category: AACCategory = 'activities';

      if (type === 3 || item.tags?.includes('verb')) {
        colorType = 'verb';
        category = 'actions';
      } else if (item.tags?.includes('food') || item.tags?.includes('beverage')) {
        colorType = 'noun';
        category = item.tags.includes('beverage') ? 'drinks' : 'food';
      } else if (item.tags?.includes('feeling') || item.tags?.includes('emotion')) {
        colorType = 'adjective';
        category = 'feelings';
      } else if (item.tags?.includes('communication') || item.tags?.includes('core vocabulary')) {
        colorType = 'subject';
        category = 'core';
      }

      return {
        id: item._id,
        label: primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1),
        imageUrl: getArasaacImageUrl(item._id, 300),
        category,
        colorType,
        tags: item.tags || [],
        source: 'arasaac',
      };
    });
  } catch (error) {
    console.warn('ARASAAC fetch error:', error);
    return [];
  }
}

/**
 * Curated standard symbols ready for instant offline-safe browsing
 */
export const CURATED_AAC_SYMBOLS: AacSymbolItem[] = [
  // Core Words
  { id: 5441, label: 'Want', imageUrl: getArasaacImageUrl(5441), category: 'core', colorType: 'verb', source: 'arasaac' },
  { id: 32648, label: 'Help', imageUrl: getArasaacImageUrl(32648), category: 'core', colorType: 'verb', source: 'arasaac' },
  { id: 7196, label: 'Stop', imageUrl: getArasaacImageUrl(7196), category: 'core', colorType: 'emergency', source: 'arasaac' },
  { id: 5508, label: 'More', imageUrl: getArasaacImageUrl(5508), category: 'core', colorType: 'adjective', source: 'arasaac' },
  { id: 6604, label: 'Break', imageUrl: getArasaacImageUrl(6604), category: 'core', colorType: 'emergency', source: 'arasaac' },
  { id: 5584, label: 'Yes', imageUrl: getArasaacImageUrl(5584), category: 'core', colorType: 'social', source: 'arasaac' },
  { id: 5526, label: 'No', imageUrl: getArasaacImageUrl(5526), category: 'core', colorType: 'emergency', source: 'arasaac' },
  { id: 23392, label: 'Play', imageUrl: getArasaacImageUrl(23392), category: 'activities', colorType: 'verb', source: 'arasaac' },
  { id: 6456, label: 'Eat', imageUrl: getArasaacImageUrl(6456), category: 'food', colorType: 'verb', source: 'arasaac' },
  { id: 6061, label: 'Drink', imageUrl: getArasaacImageUrl(6061), category: 'drinks', colorType: 'verb', source: 'arasaac' },

  // Daily Living & Places
  { id: 5921, label: 'Toilet / Potty', imageUrl: getArasaacImageUrl(5921), category: 'personal', colorType: 'noun', source: 'arasaac' },
  { id: 32464, label: 'Water', imageUrl: getArasaacImageUrl(32464), category: 'drinks', colorType: 'noun', source: 'arasaac' },
  { id: 2617, label: 'Home', imageUrl: getArasaacImageUrl(2617), category: 'places', colorType: 'noun', source: 'arasaac' },
  { id: 2618, label: 'School', imageUrl: getArasaacImageUrl(2618), category: 'places', colorType: 'noun', source: 'arasaac' },
  { id: 6723, label: 'Car / Drive', imageUrl: getArasaacImageUrl(6723), category: 'places', colorType: 'noun', source: 'arasaac' },
  { id: 5484, label: 'Hurt / Pain', imageUrl: getArasaacImageUrl(5484), category: 'feelings', colorType: 'emergency', source: 'arasaac' },

  // Feelings & Regulation
  { id: 35533, label: 'Happy', imageUrl: getArasaacImageUrl(35533), category: 'feelings', colorType: 'adjective', source: 'arasaac' },
  { id: 35545, label: 'Sad', imageUrl: getArasaacImageUrl(35545), category: 'feelings', colorType: 'adjective', source: 'arasaac' },
  { id: 35531, label: 'Calm', imageUrl: getArasaacImageUrl(35531), category: 'feelings', colorType: 'adjective', source: 'arasaac' },
  { id: 35549, label: 'Tired', imageUrl: getArasaacImageUrl(35549), category: 'feelings', colorType: 'adjective', source: 'arasaac' },
  { id: 35541, label: 'Angry', imageUrl: getArasaacImageUrl(35541), category: 'feelings', colorType: 'adjective', source: 'arasaac' },
  { id: 35543, label: 'Scared', imageUrl: getArasaacImageUrl(35543), category: 'feelings', colorType: 'emergency', source: 'arasaac' },
];

/**
 * Pre-built Industry AAC Packs inspired by top clinical apps (TouchChat, LAMP, Proloquo2Go)
 */
export const INDUSTRY_AAC_PACKS: IndustryAacPack[] = [
  {
    id: 'pack-clinical-core',
    title: 'Essential Clinical Core 12',
    subtitle: 'High-frequency core words used in 80% of daily communication',
    description: 'Based on the clinical research behind TouchChat, LAMP Words for Life, and Proloquo2Go. These foundational words build sentences quickly.',
    usedBy: 'TouchChat, LAMP, Proloquo2Go',
    icon: '⭐',
    badge: 'Clinical Standard',
    items: [
      { label: 'Want', speechText: 'I want', emoji: '🤲', photoUrl: getArasaacImageUrl(5441), category: 'core', colorType: 'verb' },
      { label: 'Help', speechText: 'Please help me', emoji: '🆘', photoUrl: getArasaacImageUrl(32648), category: 'core', colorType: 'verb' },
      { label: 'Stop', speechText: 'Stop please', emoji: '🛑', photoUrl: getArasaacImageUrl(7196), category: 'core', colorType: 'emergency' },
      { label: 'More', speechText: 'I want more', emoji: '➕', photoUrl: getArasaacImageUrl(5508), category: 'core', colorType: 'adjective' },
      { label: 'Break', speechText: 'I need a break', emoji: '🛋️', photoUrl: getArasaacImageUrl(6604), category: 'core', colorType: 'emergency' },
      { label: 'Yes', speechText: 'Yes', emoji: '✅', photoUrl: getArasaacImageUrl(5584), category: 'core', colorType: 'social' },
      { label: 'No', speechText: 'No', emoji: '⛔', photoUrl: getArasaacImageUrl(5526), category: 'core', colorType: 'emergency' },
      { label: 'Go', speechText: 'Let us go', emoji: '🚶', photoUrl: getArasaacImageUrl(6723), category: 'core', colorType: 'verb' },
      { label: 'Play', speechText: 'I want to play', emoji: '🎲', photoUrl: getArasaacImageUrl(23392), category: 'activities', colorType: 'verb' },
      { label: 'Toilet', speechText: 'I need the toilet', emoji: '🚽', photoUrl: getArasaacImageUrl(5921), category: 'personal', colorType: 'noun' },
      { label: 'Water', speechText: 'Water please', emoji: '💧', photoUrl: getArasaacImageUrl(32464), category: 'drinks', colorType: 'noun' },
      { label: 'Eat', speechText: 'I want to eat', emoji: '🍽️', photoUrl: getArasaacImageUrl(6456), category: 'food', colorType: 'verb' },
    ],
  },
  {
    id: 'pack-sensory-regulation',
    title: 'Sensory & Meltdown Prevention Pack',
    subtitle: 'Critical regulation tools for autistic and neurodivergent individuals',
    description: 'Designed specifically for sensory overload, ear defender requests, deep pressure, and interoception awareness.',
    usedBy: 'Autism AAC Toolkits & Speech Clinics',
    icon: '🎧',
    badge: 'Sensory Safety',
    items: [
      { label: 'Headphones', speechText: 'I need my headphones', emoji: '🎧', photoUrl: getArasaacImageUrl(35541), category: 'sensory', colorType: 'noun' },
      { label: 'Too Loud', speechText: 'It is too loud here', emoji: '🔊', photoUrl: getArasaacImageUrl(7196), category: 'sensory', colorType: 'emergency' },
      { label: 'Quiet Room', speechText: 'Can we go somewhere quiet?', emoji: '🤫', photoUrl: getArasaacImageUrl(6604), category: 'places', colorType: 'noun' },
      { label: 'Deep Hug', speechText: 'I need deep pressure or a hug', emoji: '🫂', photoUrl: getArasaacImageUrl(5441), category: 'sensory', colorType: 'social' },
      { label: 'Hurt', speechText: 'Something hurts', emoji: '🤕', photoUrl: getArasaacImageUrl(5484), category: 'feelings', colorType: 'emergency' },
      { label: 'Tired', speechText: 'I am so tired', emoji: '🥱', photoUrl: getArasaacImageUrl(35549), category: 'feelings', colorType: 'adjective' },
    ],
  },
  {
    id: 'pack-school-therapy',
    title: 'School, Class & Therapy Pack',
    subtitle: 'Classroom participation, routines, and peer communication',
    description: 'Perfect for IEP goals, special education classrooms, and speech therapy appointments.',
    usedBy: 'Public School Districts & Special Ed',
    icon: '🏫',
    badge: 'School & IEP',
    items: [
      { label: 'Teacher', speechText: 'Teacher', emoji: '👩‍🏫', photoUrl: getArasaacImageUrl(2618), category: 'people', colorType: 'subject' },
      { label: 'Finished', speechText: 'I am finished with this', emoji: '🏁', photoUrl: getArasaacImageUrl(5508), category: 'core', colorType: 'adjective' },
      { label: 'My Turn', speechText: 'It is my turn please', emoji: '✋', photoUrl: getArasaacImageUrl(5441), category: 'social', colorType: 'social' },
      { label: 'Snack Time', speechText: 'Is it snack time?', emoji: '🍎', photoUrl: getArasaacImageUrl(6456), category: 'food', colorType: 'noun' },
      { label: 'Outside / Recess', speechText: 'I want to go to recess', emoji: '🛝', photoUrl: getArasaacImageUrl(23392), category: 'places', colorType: 'noun' },
      { label: 'Speech Therapy', speechText: 'Time for speech therapy', emoji: '🗣️', photoUrl: getArasaacImageUrl(32648), category: 'activities', colorType: 'noun' },
    ],
  },
];
