import { DEFAULT_AAC_ITEMS, DEFAULT_QUICK_PHRASES } from './defaultData';

export interface AacVocabularyItem {
  id: string;
  label: string;
  speechText: string;
  category: string;
}

// Situational scene items matching AACView
export const AAC_SCENE_ITEMS: AacVocabularyItem[] = [
  // Doctor Scene
  { id: 'sc-doc-1', label: 'Doctor', speechText: 'Doctor', category: 'people' },
  { id: 'sc-doc-2', label: 'Nurse', speechText: 'Nurse', category: 'people' },
  { id: 'sc-doc-3', label: 'Mom / Dad', speechText: 'I want my caregiver with me', category: 'people' },
  { id: 'sc-doc-4', label: 'Hurt / Pain', speechText: 'This hurts', category: 'feelings' },
  { id: 'sc-doc-5', label: 'Tummy', speechText: 'My tummy hurts', category: 'feelings' },
  { id: 'sc-doc-6', label: 'Head', speechText: 'My head hurts', category: 'feelings' },
  { id: 'sc-doc-7', label: 'Throat', speechText: 'My throat hurts', category: 'feelings' },
  { id: 'sc-doc-8', label: 'Ear', speechText: 'My ear hurts', category: 'feelings' },
  { id: 'sc-doc-9', label: 'Stethoscope', speechText: 'Listen to my heart with stethoscope', category: 'personal' },
  { id: 'sc-doc-10', label: 'Medicine', speechText: 'I need my medicine', category: 'personal' },
  { id: 'sc-doc-11', label: 'Bandage', speechText: 'I need a bandaid bandage', category: 'personal' },
  { id: 'sc-doc-12', label: 'Shot / Vaccine', speechText: 'I am worried about getting a shot', category: 'personal' },
  { id: 'sc-doc-13', label: 'Hot / Fever', speechText: 'I feel hot and have a fever', category: 'feelings' },
  { id: 'sc-doc-14', label: 'Cold / Chills', speechText: 'I feel cold and shivering', category: 'feelings' },
  { id: 'sc-doc-15', label: 'Scared', speechText: 'I feel scared', category: 'feelings' },
  { id: 'sc-doc-16', label: 'Gentle Please', speechText: 'Please be gentle', category: 'core' },
  { id: 'sc-doc-17', label: 'Breathe', speechText: 'Take a deep breath', category: 'actions' },
  { id: 'sc-doc-18', label: 'Open Mouth', speechText: 'Open mouth wide', category: 'actions' },
  { id: 'sc-doc-19', label: 'Need a Break', speechText: 'I need to pause and take a break', category: 'sensory' },
  { id: 'sc-doc-20', label: 'Restroom', speechText: 'I need to use the bathroom', category: 'places' },
  { id: 'sc-doc-21', label: 'Help', speechText: 'Please help me', category: 'core' },
  { id: 'sc-doc-22', label: 'All Done', speechText: 'Are we all done now?', category: 'core' },
  { id: 'sc-doc-23', label: 'Water', speechText: 'Can I have a sip of water', category: 'drinks' },
  { id: 'sc-doc-24', label: 'Thank You', speechText: 'Thank you doctor', category: 'core' },

  // School Scene
  { id: 'sc-sch-1', label: 'Teacher', speechText: 'Teacher', category: 'people' },
  { id: 'sc-sch-2', label: 'Friend', speechText: 'My school friend', category: 'people' },
  { id: 'sc-sch-3', label: 'Help', speechText: 'I need help with schoolwork', category: 'core' },
  { id: 'sc-sch-4', label: 'Question', speechText: 'I have a question', category: 'social' },
  { id: 'sc-sch-5', label: 'Restroom', speechText: 'May I go to the bathroom?', category: 'places' },
  { id: 'sc-sch-6', label: 'Pencil', speechText: 'I need a pencil', category: 'school' },
  { id: 'sc-sch-7', label: 'Paper', speechText: 'Piece of paper', category: 'school' },
  { id: 'sc-sch-8', label: 'Book', speechText: 'Reading book', category: 'school' },
  { id: 'sc-sch-9', label: 'Recess', speechText: 'Is it recess time?', category: 'activities' },
  { id: 'sc-sch-10', label: 'Lunch', speechText: 'Cafeteria lunchtime', category: 'food' },
  { id: 'sc-sch-11', label: 'Too Loud', speechText: 'The classroom is too loud', category: 'sensory' },
  { id: 'sc-sch-12', label: 'Break', speechText: 'I need a sensory break from class', category: 'sensory' },

  // Playground Scene
  { id: 'sc-play-1', label: 'Swing', speechText: 'I want to swing', category: 'activities' },
  { id: 'sc-play-2', label: 'Slide', speechText: 'Go down the slide', category: 'activities' },
  { id: 'sc-play-3', label: 'Play With Me', speechText: 'Do you want to play with me?', category: 'social' },
  { id: 'sc-play-4', label: 'My Turn', speechText: 'It is my turn now', category: 'social' },
  { id: 'sc-play-5', label: 'Your Turn', speechText: 'It is your turn now', category: 'social' },
  { id: 'sc-play-6', label: 'Tag', speechText: 'Let us play tag', category: 'activities' },
  { id: 'sc-play-7', label: 'Ball', speechText: 'Throw the ball', category: 'activities' },
  { id: 'sc-play-8', label: 'Run', speechText: 'I want to run fast', category: 'activities' },
  { id: 'sc-play-9', label: 'Tired', speechText: 'I am tired and need to sit', category: 'feelings' },
  { id: 'sc-play-10', label: 'Water', speechText: 'Water bottle drink', category: 'drinks' },
  { id: 'sc-play-11', label: 'Go Inside', speechText: 'I want to go inside now', category: 'places' },
  { id: 'sc-play-12', label: 'All Done', speechText: 'All done playing outside', category: 'core' },

  // Restaurant Scene
  { id: 'sc-rest-1', label: 'Menu', speechText: 'Can I see the menu?', category: 'food' },
  { id: 'sc-rest-2', label: 'Order', speechText: 'I am ready to order', category: 'actions' },
  { id: 'sc-rest-3', label: 'Water', speechText: 'Water with ice please', category: 'drinks' },
  { id: 'sc-rest-4', label: 'Pizza', speechText: 'I want pizza', category: 'food' },
  { id: 'sc-rest-5', label: 'Burger', speechText: 'Hamburger or cheeseburger', category: 'food' },
  { id: 'sc-rest-6', label: 'Fries', speechText: 'French fries please', category: 'food' },
  { id: 'sc-rest-7', label: 'Chicken', speechText: 'Chicken nuggets', category: 'food' },
  { id: 'sc-rest-8', label: 'Napkin', speechText: 'I need a napkin', category: 'personal' },
  { id: 'sc-rest-9', label: 'Fork', speechText: 'Fork and spoon', category: 'personal' },
  { id: 'sc-rest-10', label: 'Restroom', speechText: 'Where is the restroom?', category: 'places' },
  { id: 'sc-rest-11', label: 'Check Please', speechText: 'Check please', category: 'social' },
  { id: 'sc-rest-12', label: 'Thank You', speechText: 'Thank you very much', category: 'social' },
];

// Primary board items (Core + Food + Drinks + Activities + Places + People + Sensory + Feelings + Personal + Quick Phrases)
export const PRIMARY_AAC_BOARD_ITEMS: AacVocabularyItem[] = [
  ...DEFAULT_AAC_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    speechText: item.speechText || item.label,
    category: item.category || 'core',
  })),
  ...DEFAULT_QUICK_PHRASES.map((phrase) => ({
    id: phrase.id,
    label: phrase.text,
    speechText: phrase.text,
    category: 'quick_phrases',
  })),
];

// Master list combining all primary items + scene items
export const ALL_AAC_VOCABULARY: AacVocabularyItem[] = [
  ...PRIMARY_AAC_BOARD_ITEMS,
  ...AAC_SCENE_ITEMS,
];

function extractPhrases(
  itemList: AacVocabularyItem[],
  translator?: (key: string) => string
): { id: string; phrase: string }[] {
  const t = translator || ((k: string) => k);
  const seen = new Set<string>();
  const result: { id: string; phrase: string }[] = [];

  for (const item of itemList) {
    const rawSpeech = item.speechText || item.label;
    const translatedSpeech = t(rawSpeech);
    const spoken = (translatedSpeech && translatedSpeech !== rawSpeech)
      ? translatedSpeech
      : (t(item.label) || rawSpeech);

    const clean = spoken.trim();
    if (!clean) continue;

    const dedupKey = clean.toLowerCase();
    if (!seen.has(dedupKey)) {
      seen.add(dedupKey);
      result.push({ id: item.id, phrase: clean });
    }
  }

  return result;
}

/**
 * Returns the primary AAC board phrases (84 tiles & phrases) that must be ready before unlocking speech.
 */
export function getPrimarySpokenPhrasesForLanguage(
  language: string = 'en',
  translator?: (key: string) => string
): { id: string; phrase: string }[] {
  return extractPhrases(PRIMARY_AAC_BOARD_ITEMS, translator);
}

/**
 * Returns all spoken phrases including secondary situational scenes.
 */
export function getSpokenPhrasesForLanguage(
  language: string = 'en',
  translator?: (key: string) => string
): { id: string; phrase: string }[] {
  return extractPhrases(ALL_AAC_VOCABULARY, translator);
}
