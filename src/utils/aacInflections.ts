/**
 * AAC Grammar Inflections & Morphology Utility (Proloquo2Go Style)
 * 
 * Provides robust grammatical inflections (verb tenses, noun plurals, comparative adjectives)
 * for clinical AAC boards in English, Spanish, French, German, and multilingual modes.
 * Supports multi-word verb phrases (e.g. "Wash vegetables", "Clean window", "Lavar verduras", "Fenster putzen").
 */

import { getLanguage, t } from '../services/translator';

export interface WordInflection {
  label: string;
  speechText: string;
  form: 'base' | 'present_s' | 'past' | 'continuous' | 'plural' | 'comparative' | 'superlative';
  badge: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH CONJUGATION & MORPHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

const EN_VERB_IRREGULARS: Record<string, { present_s: string; past: string; continuous: string }> = {
  'be': { present_s: 'is', past: 'was', continuous: 'being' },
  'have': { present_s: 'has', past: 'had', continuous: 'having' },
  'do': { present_s: 'does', past: 'did', continuous: 'doing' },
  'say': { present_s: 'says', past: 'said', continuous: 'saying' },
  'go': { present_s: 'goes', past: 'went', continuous: 'going' },
  'get': { present_s: 'gets', past: 'got', continuous: 'getting' },
  'make': { present_s: 'makes', past: 'made', continuous: 'making' },
  'know': { present_s: 'knows', past: 'knew', continuous: 'knowing' },
  'think': { present_s: 'thinks', past: 'thought', continuous: 'thinking' },
  'take': { present_s: 'takes', past: 'took', continuous: 'taking' },
  'see': { present_s: 'sees', past: 'saw', continuous: 'seeing' },
  'see / look': { present_s: 'sees', past: 'saw', continuous: 'seeing' },
  'come': { present_s: 'comes', past: 'came', continuous: 'coming' },
  'want': { present_s: 'wants', past: 'wanted', continuous: 'wanting' },
  'look': { present_s: 'looks', past: 'looked', continuous: 'looking' },
  'give': { present_s: 'gives', past: 'gave', continuous: 'giving' },
  'tell': { present_s: 'tells', past: 'told', continuous: 'telling' },
  'feel': { present_s: 'feels', past: 'felt', continuous: 'feeling' },
  'put': { present_s: 'puts', past: 'put', continuous: 'putting' },
  'find': { present_s: 'finds', past: 'found', continuous: 'finding' },
  'eat': { present_s: 'eats', past: 'ate', continuous: 'eating' },
  'drink': { present_s: 'drinks', past: 'drank', continuous: 'drinking' },
  'run': { present_s: 'runs', past: 'ran', continuous: 'running' },
  'sit': { present_s: 'sits', past: 'sat', continuous: 'sitting' },
  'stand': { present_s: 'stands', past: 'stood', continuous: 'standing' },
  'sleep': { present_s: 'sleeps', past: 'slept', continuous: 'sleeping' },
  'sleep / nap': { present_s: 'sleeps', past: 'slept', continuous: 'sleeping' },
  'read': { present_s: 'reads', past: 'read', continuous: 'reading' },
  'write': { present_s: 'writes', past: 'wrote', continuous: 'writing' },
  'draw': { present_s: 'draws', past: 'drew', continuous: 'drawing' },
  'draw / color': { present_s: 'draws', past: 'drew', continuous: 'drawing' },
  'cut': { present_s: 'cuts', past: 'cut', continuous: 'cutting' },
  'buy': { present_s: 'buys', past: 'bought', continuous: 'buying' },
  'bring': { present_s: 'brings', past: 'brought', continuous: 'bringing' },
  'catch': { present_s: 'catches', past: 'caught', continuous: 'catching' },
  'throw': { present_s: 'throws', past: 'threw', continuous: 'throwing' },
  'swim': { present_s: 'swims', past: 'swam', continuous: 'swimming' },
  'sing': { present_s: 'sings', past: 'sang', continuous: 'singing' },
  'break': { present_s: 'breaks', past: 'broke', continuous: 'breaking' },
  'wear': { present_s: 'wears', past: 'wore', continuous: 'wearing' },
  'choose': { present_s: 'chooses', past: 'chose', continuous: 'choosing' },
  'fly': { present_s: 'flies', past: 'flew', continuous: 'flying' },
  'drive': { present_s: 'drives', past: 'drove', continuous: 'driving' },
  'ride': { present_s: 'rides', past: 'rode', continuous: 'riding' },
  'speak': { present_s: 'speaks', past: 'spoke', continuous: 'speaking' },
  'teach': { present_s: 'teaches', past: 'taught', continuous: 'teaching' },
  'fall': { present_s: 'falls', past: 'fell', continuous: 'falling' },
  'hold': { present_s: 'holds', past: 'held', continuous: 'holding' },
  'lose': { present_s: 'loses', past: 'lost', continuous: 'losing' },
  'meet': { present_s: 'meets', past: 'met', continuous: 'meeting' },
  'pay': { present_s: 'pays', past: 'paid', continuous: 'paying' },
  'send': { present_s: 'sends', past: 'sent', continuous: 'sending' },
  'spend': { present_s: 'spends', past: 'spent', continuous: 'spending' },
  'win': { present_s: 'wins', past: 'won', continuous: 'winning' },
  'wake': { present_s: 'wakes', past: 'woke', continuous: 'waking' },
  'tear': { present_s: 'tears', past: 'tore', continuous: 'tearing' },
  'sweep': { present_s: 'sweeps', past: 'swept', continuous: 'sweeping' },
  'bite': { present_s: 'bites', past: 'bit', continuous: 'biting' },
  'blow': { present_s: 'blows', past: 'blew', continuous: 'blowing' },
  'burn': { present_s: 'burns', past: 'burned', continuous: 'burning' },
  'hide': { present_s: 'hides', past: 'hid', continuous: 'hiding' },
  'shake': { present_s: 'shakes', past: 'shook', continuous: 'shaking' },
  'shine': { present_s: 'shines', past: 'shone', continuous: 'shining' },
  'shoot': { present_s: 'shoots', past: 'shot', continuous: 'shooting' },
  'smell': { present_s: 'smells', past: 'smelled', continuous: 'smelling' },
  'spell': { present_s: 'spells', past: 'spelled', continuous: 'spelling' },
  'spill': { present_s: 'spills', past: 'spilled', continuous: 'spilling' },
  'spin': { present_s: 'spins', past: 'spun', continuous: 'spinning' },
  'spit': { present_s: 'spits', past: 'spat', continuous: 'spitting' },
  'stick': { present_s: 'sticks', past: 'stuck', continuous: 'sticking' },
  'strike': { present_s: 'strikes', past: 'struck', continuous: 'striking' },
  'swing': { present_s: 'swings', past: 'swung', continuous: 'swinging' },
  'understand': { present_s: 'understands', past: 'understood', continuous: 'understanding' },
};

function conjugateEnglishSingleVerb(verb: string): { present_s: string; past: string; continuous: string } {
  const v = verb.toLowerCase();
  if (EN_VERB_IRREGULARS[v]) {
    return EN_VERB_IRREGULARS[v];
  }

  let present_s = '';
  let past = '';
  let continuous = '';

  if (/(?:s|x|z|ch|sh)$/i.test(v)) {
    present_s = `${v}es`;
  } else if (/[^aeiou]y$/i.test(v)) {
    present_s = `${v.slice(0, -1)}ies`;
  } else {
    present_s = `${v}s`;
  }

  if (/e$/i.test(v)) {
    past = `${v}d`;
  } else if (/[^aeiou]y$/i.test(v)) {
    past = `${v.slice(0, -1)}ied`;
  } else if (/[aeiou][^aeiouwxy]$/i.test(v) && v.length <= 4) {
    const lastChar = v.slice(-1);
    past = `${v}${lastChar}ed`;
  } else {
    past = `${v}ed`;
  }

  if (/ie$/i.test(v)) {
    continuous = `${v.slice(0, -2)}ying`;
  } else if (/e$/i.test(v) && !/(?:ee|oe|ye)$/i.test(v)) {
    continuous = `${v.slice(0, -1)}ing`;
  } else if (/[aeiou][^aeiouwxy]$/i.test(v) && v.length <= 4) {
    const lastChar = v.slice(-1);
    continuous = `${v}${lastChar}ing`;
  } else {
    continuous = `${v}ing`;
  }

  return { present_s, past, continuous };
}

function conjugateEnglishPhrase(phrase: string): { present_s: string; past: string; continuous: string } {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) return { present_s: phrase, past: phrase, continuous: phrase };

  const firstWord = parts[0];
  const rest = parts.slice(1).join(' ');

  const conj = conjugateEnglishSingleVerb(firstWord);

  const formatWithRest = (conjugatedHead: string): string => {
    const formattedHead = phrase.charAt(0) === phrase.charAt(0).toUpperCase()
      ? conjugatedHead.charAt(0).toUpperCase() + conjugatedHead.slice(1)
      : conjugatedHead;
    return rest ? `${formattedHead} ${rest}` : formattedHead;
  };

  return {
    present_s: formatWithRest(conj.present_s),
    past: formatWithRest(conj.past),
    continuous: formatWithRest(conj.continuous),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SPANISH CONJUGATION & MORPHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

const ES_VERB_IRREGULARS: Record<string, { present_s: string; past: string; continuous: string }> = {
  'ir': { present_s: 'va', past: 'fue', continuous: 'yendo' },
  'ser': { present_s: 'es', past: 'fue', continuous: 'siendo' },
  'estar': { present_s: 'está', past: 'estuvo', continuous: 'estando' },
  'hacer': { present_s: 'hace', past: 'hizo', continuous: 'haciendo' },
  'tener': { present_s: 'tiene', past: 'tuvo', continuous: 'teniendo' },
  'poner': { present_s: 'pone', past: 'puso', continuous: 'poniendo' },
  'querer': { present_s: 'quiere', past: 'quiso', continuous: 'queriendo' },
  'decir': { present_s: 'dice', past: 'dijo', continuous: 'diciendo' },
  'ver': { present_s: 've', past: 'vio', continuous: 'viendo' },
  'dar': { present_s: 'da', past: 'dio', continuous: 'dando' },
  'saber': { present_s: 'sabe', past: 'supo', continuous: 'sabiendo' },
  'poder': { present_s: 'puede', past: 'pudo', continuous: 'pudiendo' },
  'comer': { present_s: 'come', past: 'comió', continuous: 'comiendo' },
  'beber': { present_s: 'bebe', past: 'bebió', continuous: 'bebiendo' },
  'dormir': { present_s: 'duerme', past: 'durmió', continuous: 'durmiendo' },
  'jugar': { present_s: 'juega', past: 'jugó', continuous: 'jugando' },
  'lavarse': { present_s: 'se lava', past: 'se lavó', continuous: 'lavándose' },
  'cepillarse': { present_s: 'se cepilla', past: 'se cepilló', continuous: 'cepillándose' },
};

function conjugateSpanishPhrase(phrase: string): { present_s: string; past: string; continuous: string } {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) return { present_s: phrase, past: phrase, continuous: phrase };

  const head = parts[0].toLowerCase();
  const rest = parts.slice(1).join(' ');

  let conj: { present_s: string; past: string; continuous: string };
  if (ES_VERB_IRREGULARS[head]) {
    conj = ES_VERB_IRREGULARS[head];
  } else if (head.endsWith('ar')) {
    const stem = head.slice(0, -2);
    conj = { present_s: stem + 'a', past: stem + 'ó', continuous: stem + 'ando' };
  } else if (head.endsWith('er') || head.endsWith('ir')) {
    const stem = head.slice(0, -2);
    conj = { present_s: stem + 'e', past: stem + 'ió', continuous: stem + 'iendo' };
  } else {
    conj = { present_s: head, past: head, continuous: head };
  }

  const cap = (s: string) => phrase.charAt(0) === phrase.charAt(0).toUpperCase() ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const join = (s: string) => rest ? `${cap(s)} ${rest}` : cap(s);

  return {
    present_s: join(conj.present_s),
    past: join(conj.past),
    continuous: join(conj.continuous),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FRENCH CONJUGATION & MORPHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

function conjugateFrenchPhrase(phrase: string): { present_s: string; past: string; continuous: string } {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) return { present_s: phrase, past: phrase, continuous: phrase };

  const head = parts[0].toLowerCase();
  const rest = parts.slice(1).join(' ');

  let conj: { present_s: string; past: string; continuous: string };
  if (head === 'aller') conj = { present_s: 'va', past: 'est allé', continuous: 'en allant' };
  else if (head === 'être') conj = { present_s: 'est', past: 'a été', continuous: 'en étant' };
  else if (head === 'avoir') conj = { present_s: 'a', past: 'a eu', continuous: 'en ayant' };
  else if (head === 'faire') conj = { present_s: 'fait', past: 'a fait', continuous: 'en faisant' };
  else if (head === 'manger') conj = { present_s: 'mange', past: 'a mangé', continuous: 'en mangeant' };
  else if (head === 'boire') conj = { present_s: 'boit', past: 'a bu', continuous: 'en buvant' };
  else if (head === 'prendre') conj = { present_s: 'prend', past: 'a pris', continuous: 'en prenant' };
  else if (head === 'vouloir') conj = { present_s: 'veut', past: 'a voulu', continuous: 'en voulant' };
  else if (head.endsWith('er')) {
    const stem = head.slice(0, -2);
    conj = { present_s: stem + 'e', past: 'a ' + stem + 'é', continuous: 'en ' + stem + 'ant' };
  } else if (head.endsWith('ir')) {
    const stem = head.slice(0, -2);
    conj = { present_s: stem + 'it', past: 'a ' + stem + 'i', continuous: 'en ' + stem + 'issant' };
  } else {
    conj = { present_s: head, past: head, continuous: head };
  }

  const cap = (s: string) => phrase.charAt(0) === phrase.charAt(0).toUpperCase() ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const join = (s: string) => rest ? `${cap(s)} ${rest}` : cap(s);

  return {
    present_s: join(conj.present_s),
    past: join(conj.past),
    continuous: join(conj.continuous),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GERMAN CONJUGATION & MORPHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

function conjugateGermanPhrase(phrase: string): { present_s: string; past: string; continuous: string } {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) return { present_s: phrase, past: phrase, continuous: phrase };

  // In German verb phrases (e.g. "Fenster putzen", "Gemüse waschen"), the verb is typically at the end
  let verbIndex = parts.findIndex(p => p.toLowerCase().endsWith('en') || p.toLowerCase().endsWith('ern') || p.toLowerCase().endsWith('eln'));
  if (verbIndex === -1) verbIndex = parts.length - 1;

  const verb = parts[verbIndex].toLowerCase();
  const stem = verb.replace(/en$|n$/, '');

  const present_s = stem + 't';
  const past = 'hat ge' + stem + 't';
  const continuous = 'beim ' + verb.charAt(0).toUpperCase() + verb.slice(1);

  const rebuild = (conjugated: string) => {
    const copy = [...parts];
    copy[verbIndex] = conjugated;
    return copy.join(' ');
  };

  return {
    present_s: rebuild(present_s),
    past: rebuild(past),
    continuous: rebuild(continuous),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// NOUN PLURALS & ADJECTIVES
// ─────────────────────────────────────────────────────────────────────────────

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
  'child': 'children',
  'person': 'people',
  'man': 'men',
  'woman': 'women',
  'tooth': 'teeth',
  'foot': 'feet',
};

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
 * Returns grammatical inflections for an AAC word or phrase (Verbs, Nouns, Adjectives).
 * Automatically adapts conjugation and badges to the active language!
 */
export function getWordInflections(label: string, colorType: string): WordInflection[] {
  const currentLang = getLanguage ? getLanguage() : 'en';
  const cleanLabel = label.trim().toLowerCase();
  const baseLabel = label.trim();

  // 1. Verbs (Tenses & Phrasal Verbs)
  const firstWord = cleanLabel.split(/\s+/)[0];
  const isVerb = colorType === 'verb' || Boolean(EN_VERB_IRREGULARS[cleanLabel]) || Boolean(EN_VERB_IRREGULARS[firstWord]) || Boolean(ES_VERB_IRREGULARS[cleanLabel]) || cleanLabel.endsWith('ar') || cleanLabel.endsWith('er') || cleanLabel.endsWith('ir');

  if (isVerb) {
    let conj: { present_s: string; past: string; continuous: string };

    if (currentLang === 'es') {
      conj = conjugateSpanishPhrase(baseLabel);
    } else if (currentLang === 'fr' || currentLang === 'fr_ca') {
      conj = conjugateFrenchPhrase(baseLabel);
    } else if (currentLang === 'de') {
      conj = conjugateGermanPhrase(baseLabel);
    } else {
      conj = conjugateEnglishPhrase(baseLabel);
    }

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: t('BASE') },
      { label: conj.present_s, speechText: conj.present_s, form: 'present_s', badge: t('-S / HE/SHE') },
      { label: conj.past, speechText: conj.past, form: 'past', badge: t('PAST (-ED)') },
      { label: conj.continuous, speechText: conj.continuous, form: 'continuous', badge: t('NOW (-ING)') },
    ];
  }

  // 2. Nouns (Plurals)
  if (colorType === 'noun' || NOUN_PLURALS[cleanLabel]) {
    let plural = NOUN_PLURALS[cleanLabel];
    if (!plural) {
      if (currentLang === 'es') {
        plural = cleanLabel.endsWith('s') ? cleanLabel : (/[aeiouáéíóú]$/i.test(cleanLabel) ? `${cleanLabel}s` : `${cleanLabel}es`);
      } else if (currentLang === 'fr' || currentLang === 'fr_ca') {
        plural = cleanLabel.endsWith('s') || cleanLabel.endsWith('x') ? cleanLabel : `${cleanLabel}s`;
      } else if (currentLang === 'de') {
        plural = cleanLabel.endsWith('e') ? `${cleanLabel}n` : `${cleanLabel}e`;
      } else {
        if (/(?:s|x|z|ch|sh)$/i.test(cleanLabel)) {
          plural = `${cleanLabel}es`;
        } else if (/[^aeiou]y$/i.test(cleanLabel)) {
          plural = `${cleanLabel.slice(0, -1)}ies`;
        } else {
          plural = `${cleanLabel}s`;
        }
      }
    }
    const formattedPlural = baseLabel.charAt(0) === baseLabel.charAt(0).toUpperCase()
      ? plural.charAt(0).toUpperCase() + plural.slice(1)
      : plural;

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: t('SINGLE') },
      { label: formattedPlural, speechText: plural, form: 'plural', badge: t('MANY (PLURAL)') },
    ];
  }

  // 3. Adjectives (Comparatives)
  if (colorType === 'adjective' && (ADJECTIVE_FORMS[cleanLabel] || currentLang === 'es' || currentLang === 'fr')) {
    const forms = ADJECTIVE_FORMS[cleanLabel] || {
      comparative: currentLang === 'es' ? `más ${baseLabel}` : (currentLang === 'fr' ? `plus ${baseLabel}` : `more ${baseLabel}`),
      superlative: currentLang === 'es' ? `el más ${baseLabel}` : (currentLang === 'fr' ? `le plus ${baseLabel}` : `most ${baseLabel}`)
    };
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: t('BASE') },
      { label: capitalize(forms.comparative), speechText: forms.comparative, form: 'comparative', badge: t('MORE (-ER)') },
      { label: capitalize(forms.superlative), speechText: forms.superlative, form: 'superlative', badge: t('MOST (-EST)') },
    ];
  }

  return [];
}
