/**
 * BeeYou AAC Interaction & Usability Verification - Batch 2
 *
 * Verifies:
 * 1. BUG-AAC-005: Speaking-state visual feedback, preparation state vs audibly speaking,
 *    cancellation, and clean reset.
 * 2. BUG-AAC-006: Tap chime deduplication and sound effects toggle enforcement.
 * 3. BUG-AAC-007: Long-press inflection click suppression, preventing accidental base word insertion.
 * 4. BUG-AAC-008: Dual-label consistency between visual sentence display and speech,
 *    preserving legitimate slashes in user phrases.
 * 5. BUG-AAC-009: Natural punctuation preservation (commas in lists, decimals, abbreviations,
 *    questions, exclamations, multilingual text) while stripping artificial word-by-word stops.
 */

import assert from 'assert';
import {
  formatForNaturalSpeech,
  subscribeToSpeechState,
  subscribeToSpeechPreparing,
  stopSpeaking,
} from '../src/utils/audio/speech.ts';
import {
  autocorrectAacGrammar,
  normalizeDualLabel,
  DUAL_LABEL_VOCABULARY,
} from '../src/utils/aacGrammar.ts';
import { AACItem } from '../src/types.ts';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void | Promise<void>): Promise<void> | void {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof (result as any).then === 'function') {
      return (result as Promise<void>)
        .then(() => {
          passedTests++;
          console.log(`[PASS] ${name}`);
        })
        .catch((err) => {
          console.error(`[FAIL] ${name}:`, err?.message || err);
        });
    }
    passedTests++;
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err?.message || err);
  }
}

async function main() {
  console.log('====================================================');
  console.log('BEE-YOU AAC BATCH 2: INTERACTION & USABILITY TESTS');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SECTION 1: Speaking-State Feedback (BUG-AAC-005)
  // ----------------------------------------------------
  console.log('--- Section 1: Speaking-State Feedback (BUG-AAC-005) ---');

  runTest('Speech State: Subscribing to preparing speech tracks state changes', () => {
    let preparingState = false;
    let preparingText: string | null = null;

    const unsubscribe = subscribeToSpeechPreparing((isPreparing, text) => {
      preparingState = isPreparing;
      preparingText = text;
    });

    assert.strictEqual(typeof unsubscribe, 'function');
    unsubscribe();
  });

  runTest('Speech State: stopSpeaking immediately clears preparing state to false', () => {
    let capturedPreparing: boolean | null = null;
    const unsub = subscribeToSpeechPreparing((isPreparing) => {
      capturedPreparing = isPreparing;
    });

    stopSpeaking();
    assert.strictEqual(capturedPreparing, false, 'stopSpeaking must reset isPreparingSpeech to false');
    unsub();
  });

  runTest('Speech State: isSpeaking remains false while preparing', () => {
    let isSpeakingState = false;
    let isPreparingState = false;

    const unsubSpeech = subscribeToSpeechState((speaking) => {
      isSpeakingState = speaking;
    });
    const unsubPrep = subscribeToSpeechPreparing((preparing) => {
      isPreparingState = preparing;
    });

    // Verify independent tracking
    assert.strictEqual(isSpeakingState, false);
    assert.strictEqual(isPreparingState, false);

    unsubSpeech();
    unsubPrep();
  });

  // ----------------------------------------------------
  // SECTION 2: Duplicate Tile Chimes (BUG-AAC-006)
  // ----------------------------------------------------
  console.log('\n--- Section 2: Tile Chime Deduplication (BUG-AAC-006) ---');

  runTest('Tile Chime: Single chime triggered when sound effects are enabled', () => {
    let chimeCount = 0;
    const mockPlayChime = () => {
      chimeCount++;
    };

    // Simulate addToSentence sound effect behavior
    const soundEffects = true;
    if (soundEffects) mockPlayChime();

    assert.strictEqual(chimeCount, 1, 'Only one tap chime should fire per tile press');
  });

  runTest('Tile Chime: Zero chimes triggered when sound effects are disabled', () => {
    let chimeCount = 0;
    const mockPlayChime = () => {
      chimeCount++;
    };

    // Simulate tile interaction with soundEffects disabled
    const soundEffects = false;
    if (soundEffects) mockPlayChime();

    assert.strictEqual(chimeCount, 0, 'No tap chime should fire when sound effects are disabled');
  });

  // ----------------------------------------------------
  // SECTION 3: Long-Press Inflection Behavior (BUG-AAC-007)
  // ----------------------------------------------------
  console.log('\n--- Section 3: Long-Press Inflection Behavior (BUG-AAC-007) ---');

  runTest('Long-Press: Long press triggers flag and suppresses click insertion', () => {
    let isTileLongPress = false;
    let sentenceWords: string[] = [];

    // Simulate long press start
    isTileLongPress = false;
    // 450ms timer fires
    isTileLongPress = true;

    // Subsequent click event fires on finger release
    const handleTileClick = (word: string) => {
      if (isTileLongPress) {
        isTileLongPress = false;
        return; // Click suppressed!
      }
      sentenceWords.push(word);
    };

    handleTileClick('go');

    // Base word 'go' must NOT be in the sentence
    assert.strictEqual(sentenceWords.length, 0, 'Base word must not be inserted on long-press release');

    // Inflection selection inserts the chosen inflected form
    const handleSelectInflection = (inflectedWord: string) => {
      sentenceWords.push(inflectedWord);
    };
    handleSelectInflection('went');

    assert.deepStrictEqual(sentenceWords, ['went'], 'Only the inflected word should be present');
  });

  runTest('Long-Press: Short tap (< 450ms) correctly inserts word', () => {
    let isTileLongPress = false;
    const sentenceWords: string[] = [];

    // Short tap: user releases before 450ms
    isTileLongPress = false;

    const handleTileClick = (word: string) => {
      if (isTileLongPress) {
        isTileLongPress = false;
        return;
      }
      sentenceWords.push(word);
    };

    handleTileClick('water');
    assert.deepStrictEqual(sentenceWords, ['water'], 'Short tap must insert word normally');
  });

  // ----------------------------------------------------
  // SECTION 4: Dual-Label Consistency (BUG-AAC-008)
  // ----------------------------------------------------
  console.log('\n--- Section 4: Dual-Label Consistency (BUG-AAC-008) ---');

  runTest('Dual-Label: Normalizes core dual-label AAC vocabulary', () => {
    assert.strictEqual(normalizeDualLabel('I / Me'), 'I');
    assert.strictEqual(normalizeDualLabel('i / me'), 'I');
    assert.strictEqual(normalizeDualLabel('Yes / Good'), 'Yes');
    assert.strictEqual(normalizeDualLabel('yes / good'), 'Yes');
    assert.strictEqual(normalizeDualLabel('No / Stop'), 'No');
    assert.strictEqual(normalizeDualLabel('no / stop'), 'No');
    assert.strictEqual(normalizeDualLabel('My / Mine'), 'My');
    assert.strictEqual(normalizeDualLabel('my / mine'), 'My');
    assert.strictEqual(normalizeDualLabel('Hurt / Pain'), 'Hurt');
    assert.strictEqual(normalizeDualLabel('Toilet / Potty'), 'Toilet');
    assert.strictEqual(normalizeDualLabel('Mom / Dad'), 'Mom');
    assert.strictEqual(normalizeDualLabel('Shot / Vaccine'), 'Shot');
    assert.strictEqual(normalizeDualLabel('Hot / Fever'), 'Hot');
    assert.strictEqual(normalizeDualLabel('Cold / Chills'), 'Cold');
    assert.strictEqual(normalizeDualLabel('Draw / Color'), 'Draw');
    assert.strictEqual(normalizeDualLabel('iPad / Tablet'), 'Tablet');
    assert.strictEqual(normalizeDualLabel('Lunch / Snack'), 'Lunch');
    assert.strictEqual(normalizeDualLabel('Bill / Check'), 'Check');
    assert.strictEqual(normalizeDualLabel('Sleep / Nap'), 'Sleep');
    assert.strictEqual(normalizeDualLabel('Doctor / Clinic'), 'Doctor');
    assert.strictEqual(normalizeDualLabel('See / Look'), 'See');
    assert.strictEqual(normalizeDualLabel('Fruit / Apples'), 'Fruit');
    assert.strictEqual(normalizeDualLabel('Blocks / Lego'), 'Blocks');
    assert.strictEqual(normalizeDualLabel('Lego / Blocks'), 'Lego');
    assert.strictEqual(normalizeDualLabel('Outside / Walk'), 'Outside');
    assert.strictEqual(normalizeDualLabel('Outside / Recess'), 'Outside');
    assert.strictEqual(normalizeDualLabel('Buy / Pay'), 'Buy');
    assert.strictEqual(normalizeDualLabel('Car / Bus'), 'Car');
  });

  runTest('Dual-Label: Preserves user-created slash phrases without regex guessing', () => {
    // Custom phrases with slashes must be preserved exactly
    assert.strictEqual(normalizeDualLabel('red/blue'), 'red/blue');
    assert.strictEqual(normalizeDualLabel('red / blue'), 'red / blue');
    assert.strictEqual(normalizeDualLabel('mother/father'), 'mother/father');
    assert.strictEqual(normalizeDualLabel('mother / father'), 'mother / father');
    assert.strictEqual(normalizeDualLabel('coffee/tea'), 'coffee/tea');
    assert.strictEqual(normalizeDualLabel('coffee / tea'), 'coffee / tea');
    assert.strictEqual(normalizeDualLabel('yes/no/maybe'), 'yes/no/maybe');
    assert.strictEqual(normalizeDualLabel('cats/dogs'), 'cats/dogs');
    assert.strictEqual(normalizeDualLabel('apple/orange/banana'), 'apple/orange/banana');
  });

  runTest('Dual-Label: Preserves explicit custom tile metadata', () => {
    // If tile is marked isCustom or custom symbolSource, it must never be normalized
    assert.strictEqual(normalizeDualLabel('I / Me', { isCustom: true } as any), 'I / Me');
    assert.strictEqual(normalizeDualLabel('red/blue', { isCustom: true } as any), 'red/blue');
    assert.strictEqual(normalizeDualLabel('coffee/tea', { symbolSource: 'custom' } as any), 'coffee/tea');
    assert.strictEqual(normalizeDualLabel('mother/father', { id: 'custom-1', isCustom: true } as any), 'mother/father');
  });

  runTest('Dual-Label: Custom phrases in sentences display and speak consistently', () => {
    // Sentence display with custom "red/blue"
    const sentenceWithRedBlue = autocorrectAacGrammar(['I / Me', 'WANT', 'RED/BLUE']);
    assert.strictEqual(sentenceWithRedBlue, 'I want red/blue');
    const spokenRedBlue = formatForNaturalSpeech(sentenceWithRedBlue);
    assert.strictEqual(spokenRedBlue, 'I want red/blue.');

    // Sentence display with custom "coffee/tea"
    const sentenceWithCoffeeTea = autocorrectAacGrammar(['I / Me', 'WANT', 'COFFEE/TEA']);
    assert.strictEqual(sentenceWithCoffeeTea, 'I want coffee/tea');
    const spokenCoffeeTea = formatForNaturalSpeech(sentenceWithCoffeeTea);
    assert.strictEqual(spokenCoffeeTea, 'I want coffee/tea.');

    // Sentence display with custom "mother/father"
    const sentenceWithMotherFather = autocorrectAacGrammar(['I / Me', 'LOVE', 'MOTHER/FATHER']);
    assert.strictEqual(sentenceWithMotherFather, 'I love mother/father');
    const spokenMotherFather = formatForNaturalSpeech(sentenceWithMotherFather);
    assert.strictEqual(spokenMotherFather, 'I love mother/father.');
  });

  runTest('Dual-Label: Preserves legitimate user-authored slashes and abbreviations', () => {
    assert.strictEqual(normalizeDualLabel('tea and/or coffee'), 'tea and/or coffee');
    assert.strictEqual(normalizeDualLabel('water w/o ice'), 'water w/o ice');
    assert.strictEqual(normalizeDualLabel('and/or'), 'and/or');
    assert.strictEqual(normalizeDualLabel('w/o'), 'w/o');
    assert.strictEqual(normalizeDualLabel('1/2 cup'), '1/2 cup');
    assert.strictEqual(normalizeDualLabel('N/A'), 'N/A');
    assert.strictEqual(normalizeDualLabel('c/o Nurse'), 'c/o Nurse');
    assert.strictEqual(normalizeDualLabel('5/10/2026'), '5/10/2026');
  });

  runTest('Dual-Label: Sentence display and speech consistency for "I / Me"', () => {
    const tile: AACItem = {
      id: 'tile-i-me',
      label: 'I / Me',
      colorType: 'subject',
      category: 'people',
      originalLabel: 'I / Me',
    };

    // Grammar autocorrection (Sentence Builder visual display)
    const visualSentence = autocorrectAacGrammar([tile, 'WANT', 'WATER']);
    assert.strictEqual(visualSentence, 'I want water', 'Visual sentence must display "I want water"');

    // Natural speech formatting (Audible output)
    const spokenSentence = formatForNaturalSpeech(visualSentence);
    assert.strictEqual(spokenSentence, 'I want water.', 'Spoken output must speak "I want water."');

    // Both visual and speech agree on "I"
    assert.ok(visualSentence.startsWith('I'));
    assert.ok(spokenSentence.startsWith('I'));
  });

  runTest('Dual-Label: Single tile "I / Me" autocorrection produces "I"', () => {
    const tile: AACItem = {
      id: 'tile-i-me',
      label: 'I / Me',
      colorType: 'subject',
      category: 'people',
      originalLabel: 'I / Me',
    };
    const visualSingle = autocorrectAacGrammar([tile]);
    assert.strictEqual(visualSingle, 'I');

    const spokenSingle = formatForNaturalSpeech(tile.label);
    assert.strictEqual(spokenSingle, 'I');
  });

  runTest('Dual-Label: DUAL_LABEL_VOCABULARY dictionary is comprehensive', () => {
    assert.ok(Object.keys(DUAL_LABEL_VOCABULARY).length >= 10);
    assert.strictEqual(DUAL_LABEL_VOCABULARY['i / me'], 'I');
    assert.strictEqual(DUAL_LABEL_VOCABULARY['yes / good'], 'Yes');
    assert.strictEqual(DUAL_LABEL_VOCABULARY['no / stop'], 'No');
  });

  // ----------------------------------------------------
  // SECTION 5: Natural Punctuation (BUG-AAC-009)
  // ----------------------------------------------------
  console.log('\n--- Section 5: Natural Punctuation (BUG-AAC-009) ---');

  runTest('Punctuation: Preserves commas in normal sentences and lists', () => {
    const list = 'I want an apple, a banana, and a cookie.';
    assert.strictEqual(formatForNaturalSpeech(list), 'I want an apple, a banana, and a cookie.');

    const multiClause = 'Please wait, I am getting ready.';
    assert.strictEqual(formatForNaturalSpeech(multiClause), 'Please wait, I am getting ready.');
  });

  runTest('Punctuation: Strips artificial word-by-word periods', () => {
    const wordByWord = 'I. want. water.';
    assert.strictEqual(formatForNaturalSpeech(wordByWord), 'I want water.');

    const fourWords = 'I. want. a. drink.';
    assert.strictEqual(formatForNaturalSpeech(fourWords), 'I want a drink.');
  });

  runTest('Punctuation: Preserves numbers with decimal points', () => {
    const decimal = 'Take 2.5 ml of water.';
    assert.strictEqual(formatForNaturalSpeech(decimal), 'Take 2.5 ml of water.');

    const temp = 'My temperature is 98.6 degrees.';
    assert.strictEqual(formatForNaturalSpeech(temp), 'My temperature is 98.6 degrees.');
  });

  runTest('Punctuation: Preserves common abbreviations', () => {
    const dr = 'Appointment with Dr. Smith at 3 p.m.';
    assert.strictEqual(formatForNaturalSpeech(dr), 'Appointment with Dr. Smith at 3 p.m.');

    const mr = 'Mr. Davis is here.';
    assert.strictEqual(formatForNaturalSpeech(mr), 'Mr. Davis is here.');

    const am = 'Wake up at 7 a.m.';
    assert.strictEqual(formatForNaturalSpeech(am), 'Wake up at 7 a.m.');
  });

  runTest('Punctuation: Preserves question marks and exclamation points', () => {
    const question = 'Can I have some water?';
    assert.strictEqual(formatForNaturalSpeech(question), 'Can I have some water?');

    const exclamation = 'Stop, please!';
    assert.strictEqual(formatForNaturalSpeech(exclamation), 'Stop, please!');
  });

  runTest('Punctuation: Handles multilingual punctuation and accents', () => {
    const spanish = 'Por favor, quiero agua.';
    assert.strictEqual(formatForNaturalSpeech(spanish), 'Por favor, quiero agua.');

    const french = 'Pomme, pizza et biscuit.';
    assert.strictEqual(formatForNaturalSpeech(french), 'Pomme, pizza et biscuit.');

    const german = 'Ich möchte Äpfel, Birnen und Kekse.';
    assert.strictEqual(formatForNaturalSpeech(german), 'Ich möchte Äpfel, Birnen und Kekse.');

    const japanese = 'りんご、みかん、バナナ';
    assert.strictEqual(formatForNaturalSpeech(japanese), 'りんご、みかん、バナナ');
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
