/**
 * Clinical AAC Smart Grammar & Natural Language Smoother
 * 
 * Automatically transforms telegraphic AAC word sequences into fluent,
 * grammatically correct natural language on the spot.
 * 
 * Example:
 *   ["ME", "GO", "LOOK"] -> "I go look"
 *   ["ME", "WANT", "EAT"] -> "I want to eat"
 *   ["ME", "TIRED"]      -> "I am tired"
 *   ["YOU", "HELP", "ME"]-> "You help me" (preserves accusative pronoun)
 */

import { AACItem } from '../types';

// Common verbs in AAC boards
const ACTION_VERBS = new Set([
  'go', 'look', 'see', 'watch', 'want', 'need', 'like', 'love', 'eat', 'drink',
  'play', 'help', 'stop', 'wait', 'read', 'write', 'draw', 'color', 'run', 'walk',
  'jump', 'climb', 'sleep', 'nap', 'listen', 'hear', 'touch', 'feel', 'open', 'close',
  'give', 'take', 'find', 'make', 'build', 'tell', 'talk', 'speak', 'sing', 'dance',
  'wash', 'clean', 'brush', 'put', 'get', 'come', 'sit', 'stand', 'push', 'pull',
  'throw', 'catch', 'ride', 'drive', 'swim', 'hug', 'kiss', 'share', 'choose'
]);

// Verbs that take an infinitive "to" before another verb (e.g., "want to eat", "like to play")
const CATENATIVE_VERBS = new Set([
  'want', 'need', 'like', 'love', 'prefer', 'hope', 'try', 'learn', 'hate', 'start'
]);

// Adjectives, feelings, and physical states that require a copula "to be" (e.g. "I am tired")
const STATE_ADJECTIVES = new Set([
  'happy', 'sad', 'tired', 'sleepy', 'hungry', 'thirsty', 'angry', 'mad', 'frustrated',
  'scared', 'afraid', 'worried', 'calm', 'sick', 'hurt', 'pain', 'cold', 'hot', 'warm',
  'bored', 'excited', 'proud', 'confused', 'ready', 'finished', 'done', 'all done',
  'fine', 'good', 'bad', 'great', 'awesome', 'okay', 'busy', 'silly'
]);

// Third-person irregular present tense verbs
const THIRD_PERSON_VERBS: Record<string, string> = {
  'go': 'goes',
  'do': 'does',
  'have': 'has',
  'want': 'wants',
  'need': 'needs',
  'like': 'likes',
  'see': 'sees',
  'look': 'looks',
  'eat': 'eats',
  'drink': 'drinks',
  'play': 'plays',
  'help': 'helps',
  'stop': 'stops',
  'feel': 'feels',
  'sleep': 'sleeps',
  'run': 'runs',
};

// Verbs that can form bare serial motion constructions (e.g. "go look", "come see", "help clean")
const SERIAL_MOTION_VERBS = new Set(['go', 'come', 'help']);

// Common nouns in AAC boards (food, drinks, toys, places, people, objects, animals)
const COMMON_NOUNS = new Set([
  // Food & Drinks
  'pizza', 'apple', 'sandwich', 'banana', 'crackers', 'cracker', 'cookie', 'cookies',
  'strawberries', 'strawberry', 'water', 'milk', 'apple juice', 'smoothie', 'juice',
  'mac and cheese', 'mac & cheese', 'cheese', 'bread', 'toast', 'cereal', 'yogurt',
  'chips', 'nuggets', 'pasta', 'rice', 'fries', 'burger', 'hamburger', 'hot dog',
  'soup', 'salad', 'ice cream', 'cake', 'candy', 'fruit', 'vegetables', 'chicken',
  'meat', 'snack', 'breakfast', 'lunch', 'dinner', 'popcorn', 'pie', 'grapes',
  'orange', 'carrot', 'carrots', 'egg', 'eggs', 'biscuit', 'soda', 'tea',
  // Objects, Activities & Toys
  'tablet', 'book', 'books', 'blocks', 'puzzle', 'puzzles', 'toy', 'toys', 'ball',
  'bubbles', 'train', 'trains', 'car', 'cars', 'truck', 'trucks', 'plane', 'planes',
  'doll', 'dolls', 'game', 'games', 'lego', 'dinosaur', 'dinosaurs', 'crayons',
  'crayon', 'paper', 'stickers', 'sticker', 'blanket', 'headphones', 'fidget',
  'fidgets', 'phone', 'shoes', 'jacket', 'hat', 'shirt', 'pants', 'backpack',
  // Places
  'park', 'playground', 'school', 'home', 'store', 'restaurant', 'dentist', 'doctor',
  'room', 'bed', 'bathroom', 'toilet', 'restroom', 'outside', 'library', 'pool', 'beach',
  // People
  'mom', 'dad', 'teacher', 'friend', 'friends', 'brother', 'sister', 'grandma',
  'grandpa', 'baby', 'therapist', 'boy', 'girl', 'person', 'people',
  // Animals & Pets
  'puppy', 'dog', 'kitten', 'cat', 'bunny', 'rabbit', 'turtle', 'fish', 'bird',
  'horse', 'bear'
]);

// Attributive modifiers that attach directly to the following noun
const ATTRIBUTIVE_MODIFIERS = new Set([
  'more', 'big', 'little', 'small', 'huge', 'tiny', 'hot', 'cold', 'warm', 'cool',
  'good', 'bad', 'new', 'old', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
  'pink', 'black', 'white', 'brown', 'sweet', 'sour', 'yummy', 'spicy', 'clean',
  'dirty', 'soft', 'hard', 'one', 'two', 'three', 'four', 'five', 'some', 'any',
  'a', 'an', 'the', 'my', 'your', 'this', 'that', 'these', 'those'
]);

const CONJUNCTIONS = new Set(['and', 'or', 'but', 'then', 'plus', 'with', 'without']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'to', 'for', 'from', 'with', 'about', 'by', 'under', 'over', 'into']);

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

/**
 * Normalizes an AAC token to clean lowercase text
 */
function cleanToken(token: string | AACItem): string {
  if (!token) return '';
  if (typeof token === 'string') return token.trim().toLowerCase();
  return (token.speechText || token.label || '').trim().toLowerCase();
}

/**
 * Identifies whether a token is a noun or entity in clinical AAC
 */
export function isNounToken(token: string | AACItem): boolean {
  if (!token) return false;
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
  if (COMMON_NOUNS.has(clean)) return true;
  if (clean.includes(' ') && !ACTION_VERBS.has(clean) && !STATE_ADJECTIVES.has(clean)) {
    return true;
  }
  const isVerb = ACTION_VERBS.has(clean) || CATENATIVE_VERBS.has(clean);
  const isAdj = STATE_ADJECTIVES.has(clean) || ATTRIBUTIVE_MODIFIERS.has(clean);
  const isPronoun = ['i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'we', 'us', 'they', 'them', 'it'].includes(clean);
  const isPrepositionOrConj = PREPOSITIONS.has(clean) || CONJUNCTIONS.has(clean);
  const isSpecial = ['yes', 'no', 'stop', 'please', 'help', 'what', 'where', 'when', 'why', 'how', 'not'].includes(clean);

  return !isVerb && !isAdj && !isPronoun && !isPrepositionOrConj && !isSpecial;
}

/**
 * Adjusts token labels on the spot for visual display in the sentence builder.
 * e.g., if user taps "ME" followed by "GO", the first token "ME" transforms to "I".
 */
export function adjustSentenceTokensOnTheSpot(tokens: string[]): string[] {
  if (!tokens || tokens.length === 0) return [];
  const result = [...tokens];

  for (let i = 0; i < result.length; i++) {
    const current = result[i].trim().toUpperCase();
    const nextClean = i + 1 < result.length ? cleanToken(result[i + 1]) : '';

    // Rule 1: "ME" as subject at start of clause or before a verb/adjective -> "I"
    if (current === 'ME') {
      const isStart = (i === 0);
      const followedByVerb = nextClean && ACTION_VERBS.has(nextClean);
      const followedByAdjective = nextClean && STATE_ADJECTIVES.has(nextClean);
      const followedByGo = nextClean === 'go' || nextClean === 'look';

      if (isStart || followedByVerb || followedByAdjective || followedByGo) {
        result[i] = 'I';
      }
    }

    // Rule 2: "US" as subject -> "WE"
    if (current === 'US' && (i === 0 || (nextClean && ACTION_VERBS.has(nextClean)))) {
      result[i] = 'WE';
    }

    // Rule 3: "HIM" before a verb -> "HE"
    if (current === 'HIM' && (i === 0 || (nextClean && ACTION_VERBS.has(nextClean)))) {
      result[i] = 'HE';
    }

    // Rule 4: "THEM" before a verb -> "THEY"
    if (current === 'THEM' && (i === 0 || (nextClean && ACTION_VERBS.has(nextClean)))) {
      result[i] = 'THEY';
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
export function autocorrectAacGrammar(tokens: (string | AACItem)[]): string {
  if (!tokens || tokens.length === 0) return '';

  const words = tokens.map(cleanToken).filter(Boolean);
  if (words.length === 0) return '';

  // Single word: return capitalized
  if (words.length === 1) {
    const single = words[0];
    if (single === 'me') return 'I';
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
    if (word === 'me') {
      const isPrecedingVerb = next && (ACTION_VERBS.has(next) || next === 'go' || next === 'look');
      const isPrecedingAdj = next && STATE_ADJECTIVES.has(next);
      const isConjunction = prev === 'and' || prev === 'or' || prev === 'then';

      if (i === 0 || isPrecedingVerb || isPrecedingAdj || isConjunction) {
        intermediate.push({ text: 'I', token: origToken, role: 'subject' });
        continue;
      } else {
        intermediate.push({ text: 'me', token: origToken, role: 'object' });
        continue;
      }
    }

    if (word === 'us' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      intermediate.push({ text: 'we', token: origToken, role: 'subject' });
      continue;
    }

    if (word === 'him' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      intermediate.push({ text: 'he', token: origToken, role: 'subject' });
      continue;
    }

    if (word === 'her' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      intermediate.push({ text: 'she', token: origToken, role: 'subject' });
      continue;
    }

    if (word === 'them' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      intermediate.push({ text: 'they', token: origToken, role: 'subject' });
      continue;
    }

    // 2. Copula "to be" insertion for adjectives/states
    if (STATE_ADJECTIVES.has(word)) {
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

    // 3. Catenative Verb + Infinitive Particle "to"
    if (prev && CATENATIVE_VERBS.has(prev) && ACTION_VERBS.has(word) && word !== 'help' && word !== 'food') {
      intermediate.push({ text: 'to', role: 'particle' });
      intermediate.push({ text: word, token: origToken, role: 'verb' });
      continue;
    }

    // 4. "Go" + Location smoothing
    if (prev === 'go' && LOCATION_SMOOTHING[word]) {
      intermediate.push({ text: LOCATION_SMOOTHING[word], token: origToken, role: 'noun' });
      continue;
    }

    // 5. Third-person subject-verb agreement
    const lastWord = intermediate[intermediate.length - 1]?.text?.toLowerCase();
    if ((lastWord === 'he' || lastWord === 'she' || lastWord === 'it') && THIRD_PERSON_VERBS[word]) {
      intermediate.push({ text: THIRD_PERSON_VERBS[word], token: origToken, role: 'verb' });
      continue;
    }

    // Classify syntactic role
    let role: IntermediateGrammarItem['role'] = 'other';
    if (isNounToken(origToken || word)) role = 'noun';
    else if (ACTION_VERBS.has(word)) role = 'verb';
    else if (ATTRIBUTIVE_MODIFIERS.has(word)) role = 'modifier';
    else if (CONJUNCTIONS.has(word)) role = 'conj';
    else if (PREPOSITIONS.has(word)) role = 'prep';

    intermediate.push({ text: word, token: origToken, role });
  }

  // 2. Second pass: Additive Coordination & Series Formulation
  // Automatically detects additive chains of objects (e.g. "I want pizza apple" -> "I want pizza and apple")
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
          // If user already supplied an explicit conjunction ('and', 'or'), do not auto-insert
          if (intermediate[currIdx].role === 'conj') break;
          // If next is a preposition or verb, series ends
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
          // Format additive series
          if (series.length === 2) {
            finalPieces.push(`${series[0]} and ${series[1]}`);
          } else {
            const allButLast = series.slice(0, -1).join(', ');
            finalPieces.push(`${allButLast}, and ${series[series.length - 1]}`);
          }
          i = currIdx;
          continue;
        }
      }
    }

    // Two consecutive predicate adjectives: [tired, hungry] -> "tired and hungry"
    if (item.role === 'adj' && i + 1 < intermediate.length && intermediate[i + 1].role === 'adj') {
      finalPieces.push(`${item.text} and ${intermediate[i + 1].text}`);
      i += 2;
      continue;
    }

    // Serial motion verbs (e.g. "go look", "come see", "help clean") preserve bare construction without "and"
    if (SERIAL_MOTION_VERBS.has(item.text) && i + 1 < intermediate.length && intermediate[i + 1].role === 'verb') {
      finalPieces.push(item.text);
      i++;
      continue;
    }

    // Two consecutive action verbs after a catenative: [eat, drink] -> "eat and drink"
    if (item.role === 'verb' && i + 1 < intermediate.length && intermediate[i + 1].role === 'verb' && !CATENATIVE_VERBS.has(item.text)) {
      finalPieces.push(`${item.text} and ${intermediate[i + 1].text}`);
      i += 2;
      continue;
    }

    finalPieces.push(item.text);
    i++;
  }

  // Build sentence string with proper capitalization
  let sentence = finalPieces.join(' ').trim();
  if (sentence.length > 0) {
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  return sentence;
}
