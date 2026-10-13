/**
 * Clinical AAC Smart Grammar & Natural Language Smoother
 * 
 * Automatically transforms telegraphic AAC word sequences into fluent,
 * grammatically correct natural language on the spot across all supported languages.
 * 
 * Architecture:
 * - Metadata-driven tokenization (Fitzgerald Key colorType)
 * - Zero hardcoded vocabulary bloat
 * - Language-aware coordination ("and", "y", "et", "und", "と", "和", etc.)
 * - Dynamic subject pronoun resolution (I, yo, je, ich, etc.)
 */

import { AACItem } from '../types';
import { conjugateEnglishSingleVerb } from './aacInflections';

// Base English core action verbs for raw string input fallback (AACItem tiles use metadata: colorType === 'verb')
const CORE_ACTION_VERBS = new Set([
  'go', 'look', 'see', 'watch', 'want', 'need', 'like', 'love', 'eat', 'drink',
  'play', 'help', 'stop', 'wait', 'read', 'write', 'draw', 'color', 'run', 'walk',
  'jump', 'climb', 'sleep', 'listen', 'hear', 'touch', 'feel', 'open', 'close',
  'give', 'take', 'find', 'make', 'build', 'tell', 'talk', 'speak', 'sing', 'dance',
  'wash', 'clean', 'brush', 'put', 'get', 'come', 'sit', 'stand', 'push', 'pull',
  'throw', 'catch', 'ride', 'drive', 'swim', 'hug', 'kiss', 'share', 'choose'
]);

// Verbs that take an infinitive "to" before another verb in English
const CATENATIVE_VERBS = new Set([
  'want', 'need', 'like', 'love', 'prefer', 'hope', 'try', 'learn', 'hate', 'start'
]);

// Adjectives, feelings, and physical states that require a copula "to be"
const STATE_ADJECTIVES = new Set([
  'happy', 'sad', 'tired', 'sleepy', 'hungry', 'thirsty', 'angry', 'mad', 'frustrated',
  'scared', 'afraid', 'worried', 'calm', 'sick', 'hurt', 'pain', 'cold', 'hot', 'warm',
  'bored', 'excited', 'proud', 'confused', 'ready', 'finished', 'done', 'all done',
  'fine', 'good', 'bad', 'great', 'awesome', 'okay', 'busy', 'silly'
]);

/**
 * Identifies whether an AAC token is a verb or action.
 * Priority 1: Metadata from AACItem (colorType: 'verb' or 'action', category: 'actions')
 * Priority 2: Algorithmic / core set fallback for raw string tokens
 */
export function isVerbToken(token?: string | AACItem): boolean {
  if (!token) return false;
  if (typeof token !== 'string') {
    if (token.colorType === 'verb') return true;
    if (token.category === 'actions') return true;
  }
  const clean = cleanToken(token);
  if (!clean) return false;
  return CORE_ACTION_VERBS.has(clean) || CATENATIVE_VERBS.has(clean);
}

// Verbs that can form bare serial motion constructions (e.g. "go look", "come see", "help clean")
const SERIAL_MOTION_VERBS = new Set(['go', 'come', 'help']);

// Attributive modifiers that attach directly to the following noun
const ATTRIBUTIVE_MODIFIERS = new Set([
  'more', 'big', 'little', 'small', 'huge', 'tiny', 'hot', 'cold', 'warm', 'cool',
  'good', 'bad', 'new', 'old', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
  'pink', 'black', 'white', 'brown', 'sweet', 'sour', 'yummy', 'spicy', 'clean',
  'dirty', 'soft', 'hard', 'one', 'two', 'three', 'four', 'five', 'some', 'any',
  'a', 'an', 'the', 'my', 'your', 'this', 'that', 'these', 'those'
]);

const CONJUNCTIONS = new Set(['and', 'or', 'but', 'then', 'plus', 'with', 'without', 'y', 'et', 'und', 'и', 'και', 'và']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'by', 'under', 'over', 'into', 'de', 'en', 'para', 'por', 'dans', 'à', 'zu', 'mit']);

// Location smoothing (e.g., "go bathroom" -> "go to the bathroom")
const LOCATION_SMOOTHING: Record<string, string> = {
  'bathroom': 'to the bathroom',
  'restroom': 'to the restroom',
  'toilet': 'to the bathroom',
  'park': 'to the park',
  'playground': 'to the playground',
  'school': 'to school',
  'home': 'home',
  'bed': 'to bed',
  'outside': 'outside',
  'inside': 'inside',
  'car': 'to the car',
  'bus': 'to the bus',
  'store': 'to the store',
};

// Language-aware conjunctions
export const LANGUAGE_CONJUNCTIONS: Record<string, string> = {
  en: 'and',
  es: 'y',
  fr: 'et',
  fr_ca: 'et',
  de: 'und',
  el: 'και',
  ru: 'и',
  vi: 'và',
  zh: '和',
  ja: 'と',
  ko: '와',
};

// Language-aware subject pronoun normalizations (converts object/disjunctive forms to subject forms)
export const LANGUAGE_SUBJECT_PRONOUNS: Record<string, Record<string, string>> = {
  en: {
    'me': 'I',
    'us': 'we',
    'him': 'he',
    'her': 'she',
    'them': 'they',
  },
  es: {
    'mí': 'yo',
    'me': 'yo',
    'nosotros': 'nosotros',
  },
  fr: {
    'moi': 'je',
    'nous': 'nous',
    'lui': 'il',
    'elle': 'elle',
  },
  fr_ca: {
    'moi': 'je',
    'nous': 'nous',
    'lui': 'il',
    'elle': 'elle',
  },
  de: {
    'mich': 'ich',
    'mir': 'ich',
    'uns': 'wir',
  },
  ru: {
    'меня': 'я',
    'мне': 'я',
  },
  vi: {
    'tôi': 'tôi',
    'mình': 'mình',
  },
  zh: {},
  ja: {},
  ko: {},
};

/**
 * Normalizes an AAC token to clean lowercase text
 */
function cleanToken(token: string | AACItem): string {
  if (!token) return '';
  if (typeof token === 'string') return token.trim().toLowerCase();
  return (token.speechText || token.label || '').trim().toLowerCase();
}

/**
 * Formats a series of noun phrases or items using the language's native coordination rules.
 * English: "apple, pizza, and cookie" (Oxford comma)
 * Spanish: "manzana, pizza y galleta" (or "e" before 'i')
 * French: "pomme, pizza et biscuit"
 * German: "Apfel, Pizza und Keks"
 * Japanese: "りんごとピザとクッキー"
 * Chinese: "苹果、披萨和饼干"
 */
export function formatConjunctionSeries(series: string[], lang: string = 'en'): string {
  if (!series || series.length === 0) return '';
  if (series.length === 1) return series[0];

  const normalizedLang = (lang || 'en').toLowerCase().split('-')[0];
  let conj = LANGUAGE_CONJUNCTIONS[lang] || LANGUAGE_CONJUNCTIONS[normalizedLang] || 'and';

  // Spanish phonetic exception: 'y' becomes 'e' before words starting with 'i' or 'hi'
  if (normalizedLang === 'es' && series.length > 1) {
    const lastWord = series[series.length - 1].toLowerCase().trim();
    if (lastWord.startsWith('i') || (lastWord.startsWith('hi') && !lastWord.startsWith('hie'))) {
      conj = 'e';
    }
  }

  // CJK languages
  if (normalizedLang === 'ja') {
    return series.join('と');
  }
  if (normalizedLang === 'zh') {
    if (series.length === 2) return `${series[0]}和${series[1]}`;
    return `${series.slice(0, -1).join('、')}和${series[series.length - 1]}`;
  }
  if (normalizedLang === 'ko') {
    return series.join(' 와 ');
  }

  // Western languages
  if (series.length === 2) {
    return `${series[0]} ${conj} ${series[1]}`;
  }

  if (normalizedLang === 'en') {
    // Oxford comma
    const head = series.slice(0, -1).join(', ');
    return `${head}, ${conj} ${series[series.length - 1]}`;
  } else {
    // Standard European style (no Oxford comma)
    const head = series.slice(0, -1).join(', ');
    return `${head} ${conj} ${series[series.length - 1]}`;
  }
}

/**
 * Identifies whether an AAC token is a noun or entity.
 * Priority 1: AACItem metadata (colorType: 'noun' or category) - zero hardcoded words needed!
 * Priority 2: Fallback for raw text strings based on grammatical part of speech.
 */
export function isNounToken(token: string | AACItem): boolean {
  if (!token) return false;

  // Metadata check for AACItem objects (100% scalable to millions of words and custom photo tiles)
  if (typeof token !== 'string') {
    if (token.colorType === 'noun') return true;
    if (
      ['food', 'drinks', 'activities', 'places', 'people', 'personal'].includes(token.category) &&
      token.colorType !== 'verb' &&
      token.colorType !== 'adjective'
    ) {
      return true;
    }
  }

  const clean = cleanToken(token);
  if (!clean) return false;

  // Disqualify known function words, verbs, adjectives, and pronouns
  const isVerb = isVerbToken(token);
  const isAdj = STATE_ADJECTIVES.has(clean) || ATTRIBUTIVE_MODIFIERS.has(clean);
  const isPronoun = [
    'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'we', 'us', 'they', 'them', 'it',
    'yo', 'mí', 'tú', 'él', 'ella', 'nosotros', 'ellos',
    'je', 'moi', 'tu', 'il', 'elle', 'nous', 'vous', 'ils',
    'ich', 'mich', 'mir', 'du', 'dich', 'dir', 'er', 'sie', 'es', 'wir', 'ihr'
  ].includes(clean);
  const isPrepositionOrConj = PREPOSITIONS.has(clean) || CONJUNCTIONS.has(clean);
  const isSpecial = ['yes', 'no', 'stop', 'please', 'help', 'what', 'where', 'when', 'why', 'how', 'not', 'sí', 'non', 'nein', 'ja'].includes(clean);

  return !isVerb && !isAdj && !isPronoun && !isPrepositionOrConj && !isSpecial;
}

function resolveLanguage(lang?: string): string {
  if (lang) return lang;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('beeyou_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language) return parsed.language;
      }
    } catch {}
  }
  return 'en';
}

/**
 * Adjusts token labels on the spot for visual display in the sentence builder.
 * e.g., if user taps "ME" followed by "GO", the first token "ME" transforms to "I".
 */
export function adjustSentenceTokensOnTheSpot(tokens: string[], language?: string): string[] {
  if (!tokens || tokens.length === 0) return [];
  const result = [...tokens];
  const lang = resolveLanguage(language);
  const pronounMap = LANGUAGE_SUBJECT_PRONOUNS[lang] || LANGUAGE_SUBJECT_PRONOUNS['en'] || {};

  for (let i = 0; i < result.length; i++) {
    const raw = result[i].trim();
    const currentLower = raw.toLowerCase();
    const nextClean = i + 1 < result.length ? cleanToken(result[i + 1]) : '';

    if (pronounMap[currentLower]) {
      const isStart = (i === 0);
      const followedByVerb = nextClean && (isVerbToken(result[i + 1]) || nextClean === 'go' || nextClean === 'look');
      const followedByAdjective = nextClean && STATE_ADJECTIVES.has(nextClean);

      if (isStart || followedByVerb || followedByAdjective) {
        const replacement = pronounMap[currentLower];
        result[i] = raw === raw.toUpperCase() ? replacement.toUpperCase() : replacement;
      }
    }
  }

  return result;
}

interface IntermediateGrammarItem {
  text: string;
  token?: string | AACItem;
  role: 'subject' | 'object' | 'copula' | 'adj' | 'verb' | 'particle' | 'noun' | 'modifier' | 'conj' | 'prep' | 'other';
}

/**
 * Generates a grammatically fluent, natural spoken sentence from an array of AAC tokens.
 * Automatically inserts additive coordinators ("and", lists) for consecutive objects/foods/actions.
 * 
 * Example:
 *   autocorrectAacGrammar(["I", "WANT", "PIZZA", "APPLE"]) => "I want pizza and apple"
 *   autocorrectAacGrammar(["PIZZA", "APPLE", "COOKIE"])   => "Pizza, apple, and cookie"
 *   autocorrectAacGrammar(["ME", "GO", "LOOK"])           => "I go look"
 *   autocorrectAacGrammar(["ME", "TIRED", "HUNGRY"])      => "I am tired and hungry"
 */
export function autocorrectAacGrammar(tokens: (string | AACItem)[], language?: string): string {
  if (!tokens || tokens.length === 0) return '';

  const lang = resolveLanguage(language);
  const words = tokens.map(cleanToken).filter(Boolean);
  if (words.length === 0) return '';

  const pronounMap = LANGUAGE_SUBJECT_PRONOUNS[lang] || LANGUAGE_SUBJECT_PRONOUNS['en'] || {};

  // Single word: return capitalized
  if (words.length === 1) {
    const single = words[0];
    if (pronounMap[single]) return pronounMap[single];
    return single.charAt(0).toUpperCase() + single.slice(1);
  }

  // 1. First pass: Apply pronoun corrections, copula to-be, catenative "to", and location smoothing
  const intermediate: IntermediateGrammarItem[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prev = i > 0 ? words[i - 1] : '';
    const next = i + 1 < words.length ? words[i + 1] : '';
    const origToken = tokens[i];

    // 1. Pronoun Case Correction
    if (pronounMap[word]) {
      const nextToken = i + 1 < tokens.length ? tokens[i + 1] : undefined;
      const isPrecedingVerb = nextToken && (isVerbToken(nextToken) || next === 'go' || next === 'look');
      const isPrecedingAdj = next && STATE_ADJECTIVES.has(next);
      const isConjunction = CONJUNCTIONS.has(prev);

      if (i === 0 || isPrecedingVerb || isPrecedingAdj || isConjunction) {
        intermediate.push({ text: pronounMap[word], token: origToken, role: 'subject' });
        continue;
      } else {
        intermediate.push({ text: word, token: origToken, role: 'object' });
        continue;
      }
    }

    // 2. English Copula "to be" insertion for adjectives/states
    if (lang === 'en' && STATE_ADJECTIVES.has(word)) {
      const lastTokenText = intermediate[intermediate.length - 1]?.text?.toLowerCase();
      if (lastTokenText === 'i') {
        intermediate.push({ text: 'am', role: 'copula' });
      } else if (lastTokenText === 'you' || lastTokenText === 'we' || lastTokenText === 'they') {
        intermediate.push({ text: 'are', role: 'copula' });
      } else if (lastTokenText === 'he' || lastTokenText === 'she' || lastTokenText === 'it') {
        intermediate.push({ text: 'is', role: 'copula' });
      }
      intermediate.push({ text: word, token: origToken, role: 'adj' });
      continue;
    }

    // 3. English Catenative Verb + Infinitive Particle "to"
    if (lang === 'en' && prev && CATENATIVE_VERBS.has(prev) && isVerbToken(origToken || word) && word !== 'help' && word !== 'food') {
      intermediate.push({ text: 'to', role: 'particle' });
      intermediate.push({ text: word, token: origToken, role: 'verb' });
      continue;
    }

    // 4. English "Go" + Location smoothing
    if (lang === 'en' && prev === 'go' && LOCATION_SMOOTHING[word]) {
      intermediate.push({ text: LOCATION_SMOOTHING[word], token: origToken, role: 'noun' });
      continue;
    }

    // 5. English Third-person subject-verb agreement (dynamic morphology)
    const lastWord = intermediate[intermediate.length - 1]?.text?.toLowerCase();
    if (lang === 'en' && (lastWord === 'he' || lastWord === 'she' || lastWord === 'it') && isVerbToken(origToken || word)) {
      const conjugated = conjugateEnglishSingleVerb(word);
      if (conjugated?.present_s) {
        intermediate.push({ text: conjugated.present_s, token: origToken, role: 'verb' });
        continue;
      }
    }

    // Classify syntactic role
    let role: IntermediateGrammarItem['role'] = 'other';
    if (origToken && typeof origToken !== 'string') {
      if (origToken.colorType === 'verb') role = 'verb';
      else if (origToken.colorType === 'noun') role = 'noun';
      else if (origToken.colorType === 'subject') role = 'subject';
      else if (origToken.colorType === 'adjective') role = 'adj';
      else if (isNounToken(origToken)) role = 'noun';
    } else {
      if (isVerbToken(word)) role = 'verb';
      else if (ATTRIBUTIVE_MODIFIERS.has(word)) role = 'modifier';
      else if (CONJUNCTIONS.has(word)) role = 'conj';
      else if (PREPOSITIONS.has(word)) role = 'prep';
      else if (isNounToken(word)) role = 'noun';
    }

    intermediate.push({ text: word, token: origToken, role });
  }

  // 2. Second pass: Additive Coordination & Series Formulation
  const finalPieces: string[] = [];
  let i = 0;

  while (i < intermediate.length) {
    const item = intermediate[i];

    // Check if this starts a noun phrase (either a noun, or an attributive modifier followed by a noun)
    const isModifierBeforeNoun = item.role === 'modifier' && (i + 1 < intermediate.length && intermediate[i + 1].role === 'noun');
    const isStartOfNounPhrase = item.role === 'noun' || isModifierBeforeNoun;

    // Check if this noun phrase is part of an additive series of 2+ noun phrases
    if (isStartOfNounPhrase) {
      const collectNounPhrase = (idx: number): { text: string; nextIdx: number } | null => {
        if (idx >= intermediate.length) return null;
        if (intermediate[idx].role === 'modifier' && idx + 1 < intermediate.length && intermediate[idx + 1].role === 'noun') {
          return {
            text: `${intermediate[idx].text} ${intermediate[idx + 1].text}`,
            nextIdx: idx + 2,
          };
        } else if (intermediate[idx].role === 'noun') {
          return {
            text: intermediate[idx].text,
            nextIdx: idx + 1,
          };
        }
        return null;
      };

      const firstNP = collectNounPhrase(i);
      if (firstNP) {
        const series: string[] = [firstNP.text];
        let currIdx = firstNP.nextIdx;

        while (currIdx < intermediate.length) {
          if (intermediate[currIdx].role === 'conj') break;
          if (intermediate[currIdx].role === 'prep' || intermediate[currIdx].role === 'verb') break;

          const nextNP = collectNounPhrase(currIdx);
          if (nextNP) {
            series.push(nextNP.text);
            currIdx = nextNP.nextIdx;
          } else {
            break;
          }
        }

        if (series.length > 1) {
          finalPieces.push(formatConjunctionSeries(series, lang));
          i = currIdx;
          continue;
        }
      }
    }

    // Two consecutive predicate adjectives: [tired, hungry] -> "tired and hungry"
    if (item.role === 'adj' && i + 1 < intermediate.length && intermediate[i + 1].role === 'adj') {
      finalPieces.push(formatConjunctionSeries([item.text, intermediate[i + 1].text], lang));
      i += 2;
      continue;
    }

    // Serial motion verbs (e.g. "go look", "come see", "help clean") preserve bare construction without conjunction
    if (SERIAL_MOTION_VERBS.has(item.text) && i + 1 < intermediate.length && intermediate[i + 1].role === 'verb') {
      finalPieces.push(item.text);
      i++;
      continue;
    }

    // Two consecutive action verbs after a catenative: [eat, drink] -> "eat and drink"
    if (item.role === 'verb' && i + 1 < intermediate.length && intermediate[i + 1].role === 'verb' && !CATENATIVE_VERBS.has(item.text)) {
      finalPieces.push(formatConjunctionSeries([item.text, intermediate[i + 1].text], lang));
      i += 2;
      continue;
    }

    finalPieces.push(item.text);
    i++;
  }

  // Join sentence
  let sentence = (['zh', 'ja'].includes(lang.split('-')[0]))
    ? finalPieces.join('')
    : finalPieces.join(' ').trim();

  if (sentence.length > 0) {
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  return sentence;
}
