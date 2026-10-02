/**
 * AAC Grammar Inflections & Morphology Utility (Proloquo2Go Style)
 * 
 * Provides grammatical inflections (verb tenses, noun plurals, comparative adjectives)
 * for clinical AAC boards.
 */

export interface WordInflection {
  label: string;
  speechText: string;
  form: 'base' | 'present_s' | 'past' | 'continuous' | 'plural' | 'comparative' | 'superlative';
  badge: string;
}

// Irregular and common verb conjugations
const VERB_CONJUGATIONS: Record<string, { present_s: string; past: string; continuous: string }> = {
  'want': { present_s: 'wants', past: 'wanted', continuous: 'wanting' },
  'need': { present_s: 'needs', past: 'needed', continuous: 'needing' },
  'like': { present_s: 'likes', past: 'liked', continuous: 'liking' },
  'go': { present_s: 'goes', past: 'went', continuous: 'going' },
  'see': { present_s: 'sees', past: 'saw', continuous: 'seeing' },
  'see / look': { present_s: 'sees', past: 'saw', continuous: 'seeing' },
  'look': { present_s: 'looks', past: 'looked', continuous: 'looking' },
  'feel': { present_s: 'feels', past: 'felt', continuous: 'feeling' },
  'eat': { present_s: 'eats', past: 'ate', continuous: 'eating' },
  'drink': { present_s: 'drinks', past: 'drank', continuous: 'drinking' },
  'play': { present_s: 'plays', past: 'played', continuous: 'playing' },
  'help': { present_s: 'helps', past: 'helped', continuous: 'helping' },
  'stop': { present_s: 'stops', past: 'stopped', continuous: 'stopping' },
  'wait': { present_s: 'waits', past: 'waited', continuous: 'waiting' },
  'read': { present_s: 'reads', past: 'read', continuous: 'reading' },
  'write': { present_s: 'writes', past: 'wrote', continuous: 'writing' },
  'draw': { present_s: 'draws', past: 'drew', continuous: 'drawing' },
  'draw / color': { present_s: 'draws', past: 'drew', continuous: 'drawing' },
  'run': { present_s: 'runs', past: 'ran', continuous: 'running' },
  'climb': { present_s: 'climbs', past: 'climbed', continuous: 'climbing' },
  'sleep': { present_s: 'sleeps', past: 'slept', continuous: 'sleeping' },
  'sleep / nap': { present_s: 'sleeps', past: 'slept', continuous: 'sleeping' },
  'listen': { present_s: 'listens', past: 'listened', continuous: 'listening' },
  'breathe': { present_s: 'breathes', past: 'breathed', continuous: 'breathing' },
};

// Common noun plurals
const NOUN_PLURALS: Record<string, string> = {
  'apple': 'apples',
  'cookie': 'cookies',
  'cracker': 'crackers',
  'crackers': 'crackers',
  'banana': 'bananas',
  'strawberries': 'strawberries',
  'strawberry': 'strawberries',
  'sandwich': 'sandwiches',
  'pizza': 'pizzas',
  'nuggets': 'nuggets',
  'nugget': 'nuggets',
  'toy': 'toys',
  'book': 'books',
  'read book': 'books',
  'friend': 'friends',
  'teacher': 'teachers',
  'headphones': 'headphones',
  'headphone': 'headphones',
  'block': 'blocks',
  'blocks / lego': 'blocks',
  'puzzle': 'puzzles',
  'puzzles': 'puzzles',
};

// Common adjective forms
const ADJECTIVE_FORMS: Record<string, { comparative: string; superlative: string }> = {
  'happy': { comparative: 'happier', superlative: 'happiest' },
  'sad': { comparative: 'sadder', superlative: 'saddest' },
  'calm': { comparative: 'calmer', superlative: 'calmest' },
  'tired': { comparative: 'more tired', superlative: 'most tired' },
  'angry': { comparative: 'angrier', superlative: 'angriest' },
  'scared': { comparative: 'more scared', superlative: 'most scared' },
  'big': { comparative: 'bigger', superlative: 'biggest' },
  'small': { comparative: 'smaller', superlative: 'smallest' },
  'hot': { comparative: 'hotter', superlative: 'hottest' },
  'cold': { comparative: 'colder', superlative: 'coldest' },
  'fast': { comparative: 'faster', superlative: 'fastest' },
};

/**
 * Returns grammatical inflections for an AAC word (Verbs, Nouns, Adjectives)
 */
export function getWordInflections(label: string, colorType: string): WordInflection[] {
  const cleanLabel = label.trim().toLowerCase();
  const baseLabel = label.trim();

  // 1. Verbs (Tenses)
  if (colorType === 'verb' || VERB_CONJUGATIONS[cleanLabel]) {
    const conj = VERB_CONJUGATIONS[cleanLabel] || {
      present_s: `${cleanLabel}s`,
      past: `${cleanLabel}ed`,
      continuous: `${cleanLabel}ing`,
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'Base' },
      { label: capitalize(conj.present_s), speechText: conj.present_s, form: 'present_s', badge: '-s / he/she' },
      { label: capitalize(conj.past), speechText: conj.past, form: 'past', badge: 'Past (-ed)' },
      { label: capitalize(conj.continuous), speechText: conj.continuous, form: 'continuous', badge: 'Now (-ing)' },
    ];
  }

  // 2. Nouns (Plurals)
  if (colorType === 'noun' || NOUN_PLURALS[cleanLabel]) {
    const plural = NOUN_PLURALS[cleanLabel] || `${cleanLabel}s`;
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'Single' },
      { label: capitalize(plural), speechText: plural, form: 'plural', badge: 'Many (Plural)' },
    ];
  }

  // 3. Adjectives (Comparatives)
  if (colorType === 'adjective' && ADJECTIVE_FORMS[cleanLabel]) {
    const forms = ADJECTIVE_FORMS[cleanLabel];
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'Base' },
      { label: capitalize(forms.comparative), speechText: forms.comparative, form: 'comparative', badge: 'More (-er)' },
      { label: capitalize(forms.superlative), speechText: forms.superlative, form: 'superlative', badge: 'Most (-est)' },
    ];
  }

  return [];
}
