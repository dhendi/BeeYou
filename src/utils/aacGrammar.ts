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

/**
 * Generates a grammatically fluent, natural spoken sentence from an array of AAC tokens.
 * 
 * Example:
 *   autocorrectAacGrammar(["ME", "GO", "LOOK"]) => "I go look."
 *   autocorrectAacGrammar(["ME", "WANT", "EAT"]) => "I want to eat."
 *   autocorrectAacGrammar(["ME", "TIRED"]) => "I am tired."
 *   autocorrectAacGrammar(["YOU", "HELP", "ME"]) => "You help me."
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

  const output: string[] = [];
  let isSubject = true;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prev = i > 0 ? words[i - 1] : '';
    const next = i + 1 < words.length ? words[i + 1] : '';

    // 1. Pronoun Case Correction
    if (word === 'me') {
      // If at start, or followed by an action verb / adjective, or prev was a coordinating conjunction
      const isPrecedingVerb = next && (ACTION_VERBS.has(next) || next === 'go' || next === 'look');
      const isPrecedingAdj = next && STATE_ADJECTIVES.has(next);
      const isConjunction = prev === 'and' || prev === 'or' || prev === 'then';

      if (i === 0 || isPrecedingVerb || isPrecedingAdj || isConjunction) {
        output.push('I');
        isSubject = false;
        continue;
      } else {
        // Object position: "You help me", "Look at me"
        output.push('me');
        continue;
      }
    }

    if (word === 'us' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      output.push('we');
      continue;
    }

    if (word === 'him' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      output.push('he');
      continue;
    }

    if (word === 'her' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      output.push('she');
      continue;
    }

    if (word === 'them' && (i === 0 || (next && ACTION_VERBS.has(next)))) {
      output.push('they');
      continue;
    }

    // 2. Copula "to be" insertion for adjectives/states
    // e.g. "I" + "tired" -> "I am tired"
    // e.g. "You" + "happy" -> "You are happy"
    if (STATE_ADJECTIVES.has(word)) {
      const lastToken = output[output.length - 1]?.toLowerCase();
      if (lastToken === 'i') {
        output.push('am');
      } else if (lastToken === 'you' || lastToken === 'we' || lastToken === 'they') {
        output.push('are');
      } else if (lastToken === 'he' || lastToken === 'she' || lastToken === 'it') {
        output.push('is');
      }
      output.push(word);
      continue;
    }

    // 3. Catenative Verb + Infinitive Particle "to"
    // e.g., "want" + "eat" -> "want to eat"
    // e.g., "like" + "play" -> "like to play"
    if (prev && CATENATIVE_VERBS.has(prev) && ACTION_VERBS.has(word) && word !== 'help' && word !== 'food') {
      output.push('to');
      output.push(word);
      continue;
    }

    // 4. "Go" + Location smoothing
    // e.g. "go" + "bathroom" -> "go to the bathroom"
    if (prev === 'go' && LOCATION_SMOOTHING[word]) {
      // replace the default with smooth location phrase
      output.push(LOCATION_SMOOTHING[word]);
      continue;
    }

    // 5. Third-person subject-verb agreement
    // e.g. "he" + "go" -> "he goes"
    const lastWord = output[output.length - 1]?.toLowerCase();
    if ((lastWord === 'he' || lastWord === 'she' || lastWord === 'it') && THIRD_PERSON_VERBS[word]) {
      output.push(THIRD_PERSON_VERBS[word]);
      continue;
    }

    // Standard word pass-through
    output.push(word);
  }

  // Build sentence string with proper capitalization
  let sentence = output.join(' ').trim();
  if (sentence.length > 0) {
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  return sentence;
}
