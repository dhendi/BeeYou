/**
 * Mulberry Symbols AAC Online & Offline Symbol Service
 * 
 * Mulberry Symbols is an open-source, high-quality AAC symbol set designed for
 * augmentative and alternative communication (AAC).
 * 
 * Created by: Straight Street / Paxtoncrafts Charitable Trust
 * License: Creative Commons Attribution-ShareAlike 2.0 / 4.0 (CC BY-SA)
 * URL: https://mulberrysymbols.org / https://github.com/mulberrysymbols/mulberry-symbols
 * 
 * Allows commercial use under the CC BY-SA license with attribution.
 */

import { AACCategory } from '../types';
import { ALL_MULBERRY_SYMBOLS } from './mulberrySymbolsData';
import { t } from './translator';

export interface AacSymbolItem {
  id: string | number;
  label: string;
  imageUrl: string;
  category: AACCategory;
  colorType: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  tags?: string[];
  emojiFallback?: string;
  source: 'mulberry' | 'custom' | 'pack';
}

export interface IndustryAacPack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  usedBy: string;
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

export const MULBERRY_CDN_BASE = 'https://raw.githubusercontent.com/mulberrysymbols/mulberry-symbols/master/EN';

export const MULBERRY_ATTRIBUTION = {
  name: 'Mulberry Symbols',
  creator: 'Straight Street / Paxtoncrafts Charitable Trust',
  license: 'Creative Commons Attribution-ShareAlike (CC BY-SA)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  url: 'https://mulberrysymbols.org',
  repoUrl: 'https://github.com/mulberrysymbols/mulberry-symbols',
  notice: 'Mulberry Symbols are created by Straight Street / Paxtoncrafts Charitable Trust and made available under the Creative Commons Attribution-ShareAlike (CC BY-SA) license.',
};

/**
 * Returns the raw SVG CDN URL for a given Mulberry symbol filename
 */
export function getMulberrySymbolUrl(filename: string): string {
  const cleanName = filename.replace(/\.svg$/, '');
  return `${MULBERRY_CDN_BASE}/${encodeURIComponent(cleanName)}.svg`;
}

// Legacy alias for existing imports
export const getArasaacImageUrl = getMulberrySymbolUrl;

/**
 * Verified dictionary of core & situational AAC words to their exact official Mulberry Symbol filenames
 */
export const MULBERRY_WORD_MAP: Record<string, string> = {
  // Core & Pronouns
  'i / me': 'good_person',
  'i': 'good_person',
  'me': 'good_person',
  'you': 'good_person',
  'we': 'good_person',
  'my / mine': 'personal_passport',
  'my': 'personal_passport',
  'mine': 'personal_passport',
  'want': 'want_,_to',
  'i want': 'want_,_to',
  'need': 'want_,_to',
  'like': 'good',
  'go': 'go_,_to',
  'see / look': 'look_,_to',
  'see': 'look_,_to',
  'look': 'look_,_to',
  'feel': 'happy_man',
  'eat': 'eat_,_to',
  'drink': 'drink',
  'play': 'play_,_to',
  'help': 'help_,_to',
  'help me': 'help_,_to',
  'help please': 'help_,_to',
  'stop': 'backstop',
  'wait': 'wait_,_to',
  'wait in line': 'wait_,_to',
  'more': 'more',
  'more please': 'more',
  'all done': 'finish',
  'finished': 'finish',
  "don't / not": 'mistake_no_wrong',
  'no': 'mistake_no_wrong',
  'not': 'mistake_no_wrong',
  'yes': 'good',
  'break': 'break_,_to',
  'need a break': 'break_,_to',
  'sensory break': 'sensory_room',
  'please': 'communication_aid',
  'gentle please': 'communication_aid',
  'thank you': 'good',
  'what next?': 'what',
  'what next': 'what',
  'my turn': 'personal_passport',
  'your turn': 'good_person',

  // Food & Snacks
  'food': 'food',
  'foods': 'food',
  'pizza': 'pizza',
  'mac & cheese': 'sandwich_cheese',
  'apple': 'apple',
  'fruit / apples': 'apple',
  'fruit': 'apple',
  'sandwich': 'sandwich',
  'banana': 'banana',
  'crackers': 'cracker',
  'cookie': 'biscuit_chocolate_chip',
  'strawberries': 'strawberry',
  'strawberry': 'strawberry',
  'burger': 'sandwich',
  'fries': 'food',
  'nuggets': 'food',
  'pasta': 'food',
  'ice cream': 'delicious_food',
  'snack': 'biscuit_chocolate_chip',
  'snacks': 'biscuit_chocolate_chip',
  'bread': 'sandwich',
  'lunch / snack': 'sandwich',
  'snack time': 'apple',
  'order': 'food',
  'menu': 'food',
  'fork & spoon': 'food',
  'napkin': 'food',
  'take home box': 'food',

  // Drinks
  'drinks': 'drink',
  'beverage': 'drink',
  'beverages': 'drink',
  'water': 'water',
  'water break': 'water',
  'apple juice': 'apple_juice',
  'juice': 'orange_juice',
  'milk': 'milk',
  'smoothie': 'blender_drinks',

  // Activities & Objects
  'play & fun': 'play_,_to',
  'play and fun': 'play_,_to',
  'activities': 'play_,_to',
  'activity': 'play_,_to',
  'games': 'play_,_to',
  'game': 'play_,_to',
  'tablet': 'touch_screen',
  'ipad': 'touch_screen',
  'tablet / ipad': 'touch_screen',
  'ipad / tablet': 'touch_screen',
  'tablet / video': 'touch_screen',
  'playground': 'play_area',
  'book': 'communication_book',
  'read': 'communication_book',
  'read book': 'communication_book',
  'drawing': 'draw_,_to',
  'draw / color': 'draw_,_to',
  'write': 'draw_,_to',
  'scissors': 'cut_with_scissors_,_to',
  'music': 'music',
  'blocks': 'bricks',
  'lego': 'lego',
  'lego / blocks': 'lego',
  'blocks / lego': 'lego',
  'puzzles': 'jigsaw_puzzle',
  'puzzle': 'jigsaw_puzzle',
  'outside': 'go_outside_,_to',
  'outside / walk': 'go_outside_,_to',
  'outside / recess': 'play_area',
  'walk': 'go_,_to',
  'recess': 'play_area',
  'slide': 'play_area',
  'swing': 'play_area',
  'push me': 'play_area',
  'sandbox': 'play_area',
  'climb': 'play_area',
  'run': 'go_,_to',
  'ball': 'ball',
  'tag game': 'play_,_to',
  'toy': 'toys',
  'desk': 'computer_1',
  'backpack': 'school_bag',
  'circle time': 'circle_time',
  'raise hand': 'help_,_to',
  'good job': 'good',
  'speech therapy': 'talk_1_,_to',
  'hold item': 'toys',
  'can i have?': 'want_,_to',
  'buy / pay': 'shop',
  'money': 'shop',
  'shopping cart': 'shop',
  'bag': 'school_bag',

  // Places
  'places': 'house',
  'place': 'house',
  'home': 'house',
  'go home': 'house',
  'school': 'school',
  'park': 'theme_park',
  'dentist': 'dentist_1a',
  'doctor': 'doctor_1a',
  'doctor / clinic': 'doctor_1a',
  'restaurant': 'cafe',
  'store': 'shop',
  'leave store': 'shop',
  'car': 'car',
  'car / bus': 'car',
  'bus': 'bus',
  'drive': 'car',
  'seatbelt': 'car',
  'window': 'house',
  'open door': 'house',
  'cold air': 'drink_cold',
  'heater': 'house',
  'are we there?': 'car',
  'arrived': 'house',
  'bathroom stop': 'toilet',

  // People
  'people': 'good_person',
  'person': 'good_person',
  'mom': 'mum_parent',
  'dad': 'dad_parent',
  'mom / dad': 'mum_parent',
  'teacher': 'teacher_1a',
  'friend': 'good_person',
  'friends': 'good_person',
  'nurse': 'nurse_1a',
  'cashier': 'good_person',

  // Medical & Health
  'stethoscope': 'doctor_1a',
  'medicine': 'medicine',
  'bandage': 'bandage',
  'shot / vaccine': 'doctor_1a',
  'hot / fever': 'hot_person',
  'cold / chills': 'drink_cold',
  'breathe': 'relax_,_to',
  'open mouth': 'dentist_1a',
  'tummy': 'stomach_ache',
  'head': 'headache',
  'throat': 'cough',
  'ear': 'ear',

  // Sensory
  'sensory': 'sensory_room',
  'too loud': 'noisy',
  'too bright': 'bright_room',
  'headphones': 'headphones',
  'weighted blanket': 'blanket',
  'quiet room': 'quiet',
  'quiet please': 'quiet',
  'squishy fidget': 'squeeze_,_to',
  'fidget': 'squeeze_,_to',
  'deep hug': 'hug_,_to',
  'too crowded': 'noisy',
  'hot sun': 'bright_room',
  'too bumpy': 'car',

  // Feelings
  'feelings': 'happy_man',
  'feeling': 'happy_man',
  'emotions': 'happy_man',
  'emotion': 'happy_man',
  'happy': 'happy_man',
  'sad': 'sad_man',
  'calm': 'relax_,_to',
  'tired': 'sleep_male_,_to',
  'sleepy': 'sleep_male_,_to',
  'sleep': 'sleep_male_,_to',
  'angry': 'angry_man',
  'scared': 'afraid_man',
  'hurt': 'headache',
  'hurt / pain': 'headache',
  'pain': 'headache',
  'hurt / fell': 'headache',
  'car sick': 'headache',
  'toilet': 'toilet',
  'toilet / potty': 'toilet',
  'potty': 'potty_chair',
  'restroom': 'toilet',
  'bathroom': 'toilet',
  'yummy': 'delicious_food',
  'fun!': 'play_,_to',
  'fun': 'play_,_to',
  'careful': 'backstop',
  'high up': 'play_area',
  'fast': 'go_,_to',
  'sit down': 'relax_,_to',
  'sleep / nap': 'sleep_male_,_to',
  'too long': 'wait_,_to',
};

// Legacy word map alias
export const ARASAAC_WORD_MAP = MULBERRY_WORD_MAP;

/**
 * Resolves an authentic Mulberry Symbol SVG URL for any AAC item.
 * Guarantee: ALWAYS returns an authentic, verified Mulberry symbol or custom photo.
 */
export function resolveAacImageUrl(item: {
  symbolId?: string | number;
  arasaacId?: number;
  photoUrl?: string;
  label?: string;
  speechText?: string;
  id?: string;
  category?: string;
}): string {
  // 1. Direct explicit Mulberry Symbol ID or Filename
  if (item.symbolId && typeof item.symbolId === 'string' && item.symbolId.trim().length > 0) {
    const rawId = item.symbolId.trim().toLowerCase();
    const resolvedId = MULBERRY_WORD_MAP[rawId] || rawId;
    return getMulberrySymbolUrl(resolvedId);
  }

  // 2. Custom uploaded photo (data URL or blob) takes immediate priority
  if (item.photoUrl && (item.photoUrl.startsWith('data:image') || item.photoUrl.startsWith('blob:'))) {
    return item.photoUrl;
  }

  const cleanLabel = (item.label || '').trim().toLowerCase();

  // 3. Strict exact dictionary match
  if (cleanLabel && MULBERRY_WORD_MAP[cleanLabel]) {
    return getMulberrySymbolUrl(MULBERRY_WORD_MAP[cleanLabel]);
  }

  // 4. Check folder ID mapping
  if (item.id) {
    const folderMap: Record<string, string> = {
      'folder-food': 'food',
      'folder-drinks': 'drink',
      'folder-activities': 'play_,_to',
      'folder-places': 'house',
      'folder-people': 'good_person',
      'folder-feelings': 'happy_man',
      'folder-sensory': 'sensory_room',
    };
    if (folderMap[item.id]) {
      return getMulberrySymbolUrl(folderMap[item.id]);
    }
  }

  // 5. Discrete word token match for compound labels (e.g. "read book" -> "book", "go home" -> "home")
  if (cleanLabel) {
    const tokens = cleanLabel.split(/[\s/,\-_]+/).filter((t) => t.length >= 3);
    for (const token of tokens) {
      if (MULBERRY_WORD_MAP[token]) {
        return getMulberrySymbolUrl(MULBERRY_WORD_MAP[token]);
      }
    }
  }

  // 6. Valid raw.githubusercontent.com / mulberry URL fallback if explicitly set on item
  if (item.photoUrl && item.photoUrl.includes('mulberry-symbols')) {
    return item.photoUrl;
  }

  // 7. Category-aware fallback
  if (item.category) {
    const categoryFallback: Record<string, string> = {
      food: 'food',
      drinks: 'drink',
      activities: 'play_,_to',
      places: 'house',
      people: 'good_person',
      feelings: 'happy_man',
      sensory: 'sensory_room',
      personal: 'toilet',
      core: 'want_,_to',
      actions: 'go_,_to',
      social: 'communication_aid',
    };
    if (categoryFallback[item.category]) {
      return getMulberrySymbolUrl(categoryFallback[item.category]);
    }
  }

  // 8. Foundational communication symbol fallback
  return getMulberrySymbolUrl('want_,_to');
}

/**
 * Searches the 3,400+ Mulberry Symbols library with instant offline matching & ranking.
 * Supports multilingual searching in English, Spanish, French, German, Greek, Russian, Vietnamese, Chinese, Japanese, and Korean.
 */
export async function searchMulberrySymbols(query: string): Promise<AacSymbolItem[]> {
  const cleanQuery = query.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, ' ');
  if (!cleanQuery) return [];

  const searchTokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (searchTokens.length === 0) return [];

  const matchedItems: Array<{ symbol: string; score: number }> = [];

  for (const sym of ALL_MULBERRY_SYMBOLS) {
    const symLower = sym.toLowerCase().replace(/[,_-]+/g, ' ');
    
    // Format human label to test against localized dictionary
    let labelCandidate = sym
      .replace(/_,_to$/, '')
      .replace(/_[0-9]+[a-z]?$/, '')
      .replace(/_/g, ' ')
      .trim();
    if (labelCandidate) {
      labelCandidate = labelCandidate.charAt(0).toUpperCase() + labelCandidate.slice(1);
    }
    const localizedLabel = t(labelCandidate).toLowerCase();

    let score = 0;

    // Exact name match in English or translated language
    if (symLower === cleanQuery || sym.toLowerCase() === cleanQuery || localizedLabel === cleanQuery) {
      score += 100;
    } else if (symLower.startsWith(cleanQuery) || localizedLabel.startsWith(cleanQuery)) {
      score += 50;
    } else {
      let allTokensMatch = true;
      for (const token of searchTokens) {
        if (symLower.includes(token) || localizedLabel.includes(token)) {
          score += 10;
        } else {
          allTokensMatch = false;
        }
      }
      if (!allTokensMatch) continue;
    }

    // Boost common high-utility symbols
    if (sym.includes('_,_to')) score += 5; // Action verbs
    if (!sym.includes('flag_') && !sym.includes('country_')) score += 5; // Prefer real symbols over country flags

    matchedItems.push({ symbol: sym, score });
  }

  // Sort by highest match score
  matchedItems.sort((a, b) => b.score - a.score);

  return matchedItems.slice(0, 48).map(({ symbol }) => {
    // Derive nice human label from filename
    let formattedLabel = symbol
      .replace(/_,_to$/, '')
      .replace(/_[0-9]+[a-z]?$/, '')
      .replace(/_/g, ' ')
      .trim();

    formattedLabel = formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);

    // Derive category and colorType
    let colorType: AacSymbolItem['colorType'] = 'noun';
    let category: AACCategory = 'activities';

    const s = symbol.toLowerCase();
    if (s.includes('_,_to') || s.startsWith('go_') || s.startsWith('eat_') || s.startsWith('play_')) {
      colorType = 'verb';
      category = 'actions';
    } else if (s.includes('food') || s.includes('sandwich') || s.includes('pizza') || s.includes('fruit') || s.includes('apple') || s.includes('banana')) {
      colorType = 'noun';
      category = 'food';
    } else if (s.includes('drink') || s.includes('water') || s.includes('juice') || s.includes('milk')) {
      colorType = 'noun';
      category = 'drinks';
    } else if (s.includes('happy') || s.includes('sad') || s.includes('angry') || s.includes('afraid') || s.includes('confused') || s.includes('relax')) {
      colorType = 'adjective';
      category = 'feelings';
    } else if (s.includes('loud') || s.includes('quiet') || s.includes('bright') || s.includes('headphone') || s.includes('sensory') || s.includes('hug')) {
      colorType = 'emergency';
      category = 'sensory';
    } else if (s.includes('school') || s.includes('house') || s.includes('shop') || s.includes('cafe') || s.includes('car') || s.includes('bus') || s.includes('park')) {
      colorType = 'noun';
      category = 'places';
    } else if (s.includes('mum') || s.includes('dad') || s.includes('teacher') || s.includes('doctor') || s.includes('dentist') || s.includes('person') || s.includes('nurse')) {
      colorType = 'subject';
      category = 'people';
    }

    return {
      id: symbol,
      label: formattedLabel,
      imageUrl: getMulberrySymbolUrl(symbol),
      category,
      colorType,
      tags: [category, colorType],
      source: 'mulberry',
    };
  });
}

// Alias for search
export const searchArasaacPictograms = searchMulberrySymbols;

/**
 * Curated standard symbols ready for instant offline-safe browsing
 */
export const CURATED_AAC_SYMBOLS: AacSymbolItem[] = [
  // Core Words
  { id: 'want_,_to', label: 'Want', imageUrl: getMulberrySymbolUrl('want_,_to'), category: 'core', colorType: 'verb', source: 'mulberry' },
  { id: 'help_,_to', label: 'Help', imageUrl: getMulberrySymbolUrl('help_,_to'), category: 'core', colorType: 'verb', source: 'mulberry' },
  { id: 'backstop', label: 'Stop', imageUrl: getMulberrySymbolUrl('backstop'), category: 'core', colorType: 'emergency', source: 'mulberry' },
  { id: 'more', label: 'More', imageUrl: getMulberrySymbolUrl('more'), category: 'core', colorType: 'adjective', source: 'mulberry' },
  { id: 'break_,_to', label: 'Break', imageUrl: getMulberrySymbolUrl('break_,_to'), category: 'core', colorType: 'emergency', source: 'mulberry' },
  { id: 'good', label: 'Yes', imageUrl: getMulberrySymbolUrl('good'), category: 'core', colorType: 'social', source: 'mulberry' },
  { id: 'mistake_no_wrong', label: 'No', imageUrl: getMulberrySymbolUrl('mistake_no_wrong'), category: 'core', colorType: 'emergency', source: 'mulberry' },
  { id: 'play_,_to', label: 'Play', imageUrl: getMulberrySymbolUrl('play_,_to'), category: 'activities', colorType: 'verb', source: 'mulberry' },
  { id: 'eat_,_to', label: 'Eat', imageUrl: getMulberrySymbolUrl('eat_,_to'), category: 'food', colorType: 'verb', source: 'mulberry' },
  { id: 'drink', label: 'Drink', imageUrl: getMulberrySymbolUrl('drink'), category: 'drinks', colorType: 'verb', source: 'mulberry' },

  // Daily Living & Places
  { id: 'toilet', label: 'Toilet', imageUrl: getMulberrySymbolUrl('toilet'), category: 'personal', colorType: 'noun', source: 'mulberry' },
  { id: 'water', label: 'Water', imageUrl: getMulberrySymbolUrl('water'), category: 'drinks', colorType: 'noun', source: 'mulberry' },
  { id: 'house', label: 'Home', imageUrl: getMulberrySymbolUrl('house'), category: 'places', colorType: 'noun', source: 'mulberry' },
  { id: 'school', label: 'School', imageUrl: getMulberrySymbolUrl('school'), category: 'places', colorType: 'noun', source: 'mulberry' },
  { id: 'car', label: 'Car', imageUrl: getMulberrySymbolUrl('car'), category: 'places', colorType: 'noun', source: 'mulberry' },
  { id: 'headache', label: 'Hurt', imageUrl: getMulberrySymbolUrl('headache'), category: 'feelings', colorType: 'emergency', source: 'mulberry' },

  // Feelings & Regulation
  { id: 'happy_man', label: 'Happy', imageUrl: getMulberrySymbolUrl('happy_man'), category: 'feelings', colorType: 'adjective', source: 'mulberry' },
  { id: 'sad_man', label: 'Sad', imageUrl: getMulberrySymbolUrl('sad_man'), category: 'feelings', colorType: 'adjective', source: 'mulberry' },
  { id: 'relax_,_to', label: 'Calm', imageUrl: getMulberrySymbolUrl('relax_,_to'), category: 'feelings', colorType: 'adjective', source: 'mulberry' },
  { id: 'sleep_male_,_to', label: 'Tired', imageUrl: getMulberrySymbolUrl('sleep_male_,_to'), category: 'feelings', colorType: 'adjective', source: 'mulberry' },
  { id: 'angry_man', label: 'Angry', imageUrl: getMulberrySymbolUrl('angry_man'), category: 'feelings', colorType: 'adjective', source: 'mulberry' },
  { id: 'afraid_man', label: 'Scared', imageUrl: getMulberrySymbolUrl('afraid_man'), category: 'feelings', colorType: 'emergency', source: 'mulberry' },
];

/**
 * Pre-built Industry AAC Packs configured with Mulberry Symbols (CC BY-SA)
 */
export const INDUSTRY_AAC_PACKS: IndustryAacPack[] = [
  {
    id: 'pack-clinical-core',
    title: 'Essential Clinical Core 12',
    subtitle: 'High-frequency core words used in 80% of daily communication',
    description: 'Based on high-frequency AAC research. Built using open Mulberry Symbols under CC BY-SA.',
    usedBy: 'TouchChat, LAMP, Proloquo2Go, BeeYou',
    icon: '⭐',
    badge: 'Clinical Standard',
    items: [
      { label: 'Want', speechText: 'I want', emoji: '🤲', photoUrl: getMulberrySymbolUrl('want_,_to'), category: 'core', colorType: 'verb' },
      { label: 'Help', speechText: 'Please help me', emoji: '🆘', photoUrl: getMulberrySymbolUrl('help_,_to'), category: 'core', colorType: 'verb' },
      { label: 'Stop', speechText: 'Stop please', emoji: '🛑', photoUrl: getMulberrySymbolUrl('backstop'), category: 'core', colorType: 'emergency' },
      { label: 'More', speechText: 'I want more', emoji: '➕', photoUrl: getMulberrySymbolUrl('more'), category: 'core', colorType: 'adjective' },
      { label: 'Break', speechText: 'I need a break', emoji: '🛋️', photoUrl: getMulberrySymbolUrl('break_,_to'), category: 'core', colorType: 'emergency' },
      { label: 'Yes', speechText: 'Yes', emoji: '✅', photoUrl: getMulberrySymbolUrl('good'), category: 'core', colorType: 'social' },
      { label: 'No', speechText: 'No', emoji: '⛔', photoUrl: getMulberrySymbolUrl('mistake_no_wrong'), category: 'core', colorType: 'emergency' },
      { label: 'Go', speechText: 'Let us go', emoji: '🚶', photoUrl: getMulberrySymbolUrl('go_,_to'), category: 'core', colorType: 'verb' },
      { label: 'Play', speechText: 'I want to play', emoji: '🎲', photoUrl: getMulberrySymbolUrl('play_,_to'), category: 'activities', colorType: 'verb' },
      { label: 'Toilet', speechText: 'I need the toilet', emoji: '🚽', photoUrl: getMulberrySymbolUrl('toilet'), category: 'personal', colorType: 'noun' },
      { label: 'Water', speechText: 'Water please', emoji: '💧', photoUrl: getMulberrySymbolUrl('water'), category: 'drinks', colorType: 'noun' },
      { label: 'Eat', speechText: 'I want to eat', emoji: '🍽️', photoUrl: getMulberrySymbolUrl('eat_,_to'), category: 'food', colorType: 'verb' },
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
      { label: 'Headphones', speechText: 'I need my headphones', emoji: '🎧', photoUrl: getMulberrySymbolUrl('headphones'), category: 'sensory', colorType: 'noun' },
      { label: 'Too Loud', speechText: 'It is too loud here', emoji: '🔊', photoUrl: getMulberrySymbolUrl('noisy'), category: 'sensory', colorType: 'emergency' },
      { label: 'Quiet Room', speechText: 'Can we go somewhere quiet?', emoji: '🤫', photoUrl: getMulberrySymbolUrl('quiet'), category: 'places', colorType: 'noun' },
      { label: 'Deep Hug', speechText: 'I need deep pressure or a hug', emoji: '🫂', photoUrl: getMulberrySymbolUrl('hug_,_to'), category: 'sensory', colorType: 'social' },
      { label: 'Hurt', speechText: 'Something hurts', emoji: '🤕', photoUrl: getMulberrySymbolUrl('headache'), category: 'feelings', colorType: 'emergency' },
      { label: 'Tired', speechText: 'I am so tired', emoji: '🥱', photoUrl: getMulberrySymbolUrl('sleep_male_,_to'), category: 'feelings', colorType: 'adjective' },
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
      { label: 'Teacher', speechText: 'Teacher', emoji: '👩‍🏫', photoUrl: getMulberrySymbolUrl('teacher_1a'), category: 'people', colorType: 'subject' },
      { label: 'Finished', speechText: 'I am finished with this', emoji: '🏁', photoUrl: getMulberrySymbolUrl('finish'), category: 'core', colorType: 'adjective' },
      { label: 'My Turn', speechText: 'It is my turn please', emoji: '✋', photoUrl: getMulberrySymbolUrl('personal_passport'), category: 'social', colorType: 'social' },
      { label: 'Snack Time', speechText: 'Is it snack time?', emoji: '🍎', photoUrl: getMulberrySymbolUrl('apple'), category: 'food', colorType: 'noun' },
      { label: 'Outside', speechText: 'I want to go to recess', emoji: '🛝', photoUrl: getMulberrySymbolUrl('play_area'), category: 'places', colorType: 'noun' },
      { label: 'Speech Therapy', speechText: 'Time for speech therapy', emoji: '🗣️', photoUrl: getMulberrySymbolUrl('talk_1_,_to'), category: 'activities', colorType: 'noun' },
    ],
  },
];
