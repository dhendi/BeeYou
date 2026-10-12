/**
 * AAC Grammar Inflections & Morphology Utility (Proloquo2Go Style)
 * 
 * Provides robust grammatical inflections (verb tenses, noun plurals, comparative adjectives)
 * for clinical AAC boards, with support for multi-word verb phrases (e.g., "Wash vegetables", "Clean window").
 */

export interface WordInflection {
  label: string;
  speechText: string;
  form: 'base' | 'present_s' | 'past' | 'continuous' | 'plural' | 'comparative' | 'superlative';
  badge: string;
}

// Irregular verb conjugations for base verbs
const VERB_IRREGULARS: Record<string, { present_s: string; past: string; continuous: string }> = {
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

/**
 * Accurately conjugates a single English verb according to morphology rules.
 */
function conjugateSingleVerb(verb: string): { present_s: string; past: string; continuous: string } {
  const v = verb.toLowerCase();
  if (VERB_IRREGULARS[v]) {
    return VERB_IRREGULARS[v];
  }

  let present_s = '';
  let past = '';
  let continuous = '';

  // 1. Third person singular -s form
  if (/(?:s|x|z|ch|sh)$/i.test(v)) {
    present_s = `${v}es`;
  } else if (/[^aeiou]y$/i.test(v)) {
    present_s = `${v.slice(0, -1)}ies`;
  } else {
    present_s = `${v}s`;
  }

  // 2. Past tense -ed form
  if (/e$/i.test(v)) {
    past = `${v}d`;
  } else if (/[^aeiou]y$/i.test(v)) {
    past = `${v.slice(0, -1)}ied`;
  } else if (/[aeiou][^aeiouwxy]$/i.test(v) && v.length <= 4) {
    // CVC doubling (e.g. stop -> stopped, clap -> clapped, hug -> hugged)
    const lastChar = v.slice(-1);
    past = `${v}${lastChar}ed`;
  } else {
    past = `${v}ed`;
  }

  // 3. Continuous -ing form
  if (/ie$/i.test(v)) {
    continuous = `${v.slice(0, -2)}ying`;
  } else if (/e$/i.test(v) && !/(?:ee|oe|ye)$/i.test(v)) {
    // dance -> dancing, bake -> baking, smile -> smiling, ride -> riding
    continuous = `${v.slice(0, -1)}ing`;
  } else if (/[aeiou][^aeiouwxy]$/i.test(v) && v.length <= 4) {
    // CVC doubling (e.g. stop -> stopping, run -> running, sit -> sitting)
    const lastChar = v.slice(-1);
    continuous = `${v}${lastChar}ing`;
  } else {
    continuous = `${v}ing`;
  }

  return { present_s, past, continuous };
}

/**
 * Conjugates an entire verb phrase (e.g. "Wash vegetables", "Clean window", "Brush teeth", "Take off shoes").
 * Modifies the HEAD verb rather than appending suffixes to the tail noun!
 */
function conjugateVerbPhrase(phrase: string): { present_s: string; past: string; continuous: string } {
  const parts = phrase.trim().split(/\s+/);
  if (parts.length === 0) {
    return { present_s: phrase, past: phrase, continuous: phrase };
  }

  const firstWord = parts[0];
  const rest = parts.slice(1).join(' ');

  const conj = conjugateSingleVerb(firstWord);

  const formatWithRest = (conjugatedHead: string): string => {
    // Preserve initial capitalization style of the head
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
  'child': 'children',
  'person': 'people',
  'man': 'men',
  'woman': 'women',
  'tooth': 'teeth',
  'foot': 'feet',
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
 * Returns grammatical inflections for an AAC word or phrase (Verbs, Nouns, Adjectives).
 */
export function getWordInflections(label: string, colorType: string): WordInflection[] {
  const cleanLabel = label.trim().toLowerCase();
  const baseLabel = label.trim();

  // 1. Verbs (Tenses & Phrasal Verbs)
  // Check if labeled as verb or matches common verb dictionary/head verb
  const firstWord = cleanLabel.split(/\s+/)[0];
  const isVerb = colorType === 'verb' || Boolean(VERB_IRREGULARS[cleanLabel]) || Boolean(VERB_IRREGULARS[firstWord]);

  if (isVerb) {
    const conj = conjugateVerbPhrase(baseLabel);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'BASE' },
      { label: conj.present_s, speechText: conj.present_s, form: 'present_s', badge: '-S / HE/SHE' },
      { label: conj.past, speechText: conj.past, form: 'past', badge: 'PAST (-ED)' },
      { label: conj.continuous, speechText: conj.continuous, form: 'continuous', badge: 'NOW (-ING)' },
    ];
  }

  // 2. Nouns (Plurals)
  if (colorType === 'noun' || NOUN_PLURALS[cleanLabel]) {
    let plural = NOUN_PLURALS[cleanLabel];
    if (!plural) {
      if (/(?:s|x|z|ch|sh)$/i.test(cleanLabel)) {
        plural = `${cleanLabel}es`;
      } else if (/[^aeiou]y$/i.test(cleanLabel)) {
        plural = `${cleanLabel.slice(0, -1)}ies`;
      } else {
        plural = `${cleanLabel}s`;
      }
    }
    const formattedPlural = baseLabel.charAt(0) === baseLabel.charAt(0).toUpperCase()
      ? plural.charAt(0).toUpperCase() + plural.slice(1)
      : plural;

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'SINGLE' },
      { label: formattedPlural, speechText: plural, form: 'plural', badge: 'MANY (PLURAL)' },
    ];
  }

  // 3. Adjectives (Comparatives)
  if (colorType === 'adjective' && ADJECTIVE_FORMS[cleanLabel]) {
    const forms = ADJECTIVE_FORMS[cleanLabel];
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return [
      { label: baseLabel, speechText: baseLabel, form: 'base', badge: 'BASE' },
      { label: capitalize(forms.comparative), speechText: forms.comparative, form: 'comparative', badge: 'MORE (-ER)' },
      { label: capitalize(forms.superlative), speechText: forms.superlative, form: 'superlative', badge: 'MOST (-EST)' },
    ];
  }

  return [];
}
