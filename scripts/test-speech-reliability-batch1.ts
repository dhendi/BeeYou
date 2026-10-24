/**
 * BeeYou Speech Reliability Verification - Batch 1
 *
 * Verifies:
 * 1. BUG-AAC-002: Piper inference queue delays, rapid tile tapping cancellation,
 *    mutex yielding, voice switching, simultaneous requests, and stale audio prevention.
 * 2. BUG-AAC-003: Piper voice resolution for Japanese, Korean, English, French, Spanish,
 *    and system speech routing without silent English fallback.
 * 3. BUG-AAC-004: Service worker lifecycle updates, first-install reload suppression,
 *    and reload loop protection.
 */

import assert from 'assert';
import {
  resolvePiperVoiceId,
  isPiperVoiceReadySync,
  runWithPiperLock,
  synthesizeWithPiper,
  PIPER_VOICE_MAP,
} from '../src/services/piperTtsService.ts';
import {
  getBestSystemVoice,
  getTtsCacheKey,
  CORE_AAC_VOCABULARY,
} from '../src/utils/audio/speech.ts';
import {
  initServiceWorkerUpdates,
  SW_RELOAD_STORAGE_KEY,
  SW_RELOAD_COOLDOWN_MS,
} from '../src/utils/serviceWorkerUpdate.ts';
import {
  getVoicePersonaById,
  VOICE_PERSONAS,
} from '../src/data/voicePersonasData.ts';

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
  console.log('BEE-YOU AAC BATCH 1: SPEECH RELIABILITY TESTS');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SECTION 1: BUG-AAC-003 - Voice Routing & Language Preservation
  // ----------------------------------------------------
  console.log('--- Section 1: Voice Routing & Language Preservation (BUG-AAC-003) ---');

  runTest('Routing: English personas map to proper Piper models', () => {
    assert.strictEqual(resolvePiperVoiceId('amy', 'en'), 'en_US-amy-medium');
    assert.strictEqual(resolvePiperVoiceId('ryan', 'en'), 'en_US-ryan-medium');
    assert.strictEqual(resolvePiperVoiceId('danny', 'en'), 'en_US-danny-low');
    assert.strictEqual(resolvePiperVoiceId(undefined, 'en'), 'en_US-amy-medium');
  });

  runTest('Routing: French and Spanish personas map to proper Piper models', () => {
    assert.strictEqual(resolvePiperVoiceId('upmc', 'fr'), 'fr_FR-upmc-medium');
    assert.strictEqual(resolvePiperVoiceId(undefined, 'fr'), 'fr_FR-upmc-medium');
    assert.strictEqual(resolvePiperVoiceId('claude', 'es'), 'es_MX-claude-high');
    assert.strictEqual(resolvePiperVoiceId(undefined, 'es'), 'es_MX-claude-high');
  });

  runTest('Routing: Japanese personas never route to English Piper model', () => {
    const harutoVoice = resolvePiperVoiceId('ja_haruto', 'ja');
    assert.strictEqual(harutoVoice, '', 'ja_haruto must return empty string for Piper voice');

    const sakuraVoice = resolvePiperVoiceId('ja_sakura', 'ja');
    assert.strictEqual(sakuraVoice, '', 'ja_sakura must return empty string for Piper voice');

    const jaGeneric = resolvePiperVoiceId(undefined, 'ja');
    assert.strictEqual(jaGeneric, '', 'Generic Japanese must return empty string for Piper voice');
  });

  runTest('Routing: Korean personas never route to English Piper model', () => {
    const minjunVoice = resolvePiperVoiceId('ko_minjun', 'ko');
    assert.strictEqual(minjunVoice, '', 'ko_minjun must return empty string for Piper voice');

    const seoyeonVoice = resolvePiperVoiceId('ko_seoyeon', 'ko');
    assert.strictEqual(seoyeonVoice, '', 'ko_seoyeon must return empty string for Piper voice');

    const koGeneric = resolvePiperVoiceId(undefined, 'ko');
    assert.strictEqual(koGeneric, '', 'Generic Korean must return empty string for Piper voice');
  });

  runTest('Routing: System persona returns empty string for Piper voice', () => {
    assert.strictEqual(resolvePiperVoiceId('system', 'en'), '');
    assert.strictEqual(resolvePiperVoiceId('system', 'ja'), '');
    assert.strictEqual(resolvePiperVoiceId('system', 'ko'), '');
  });

  runTest('Routing: Persona metadata correctly defines ja and ko languages', () => {
    const haruto = getVoicePersonaById('ja_haruto');
    assert.strictEqual(haruto.language, 'ja');
    assert.strictEqual(haruto.piperVoice, '');

    const minjun = getVoicePersonaById('ko_minjun');
    assert.strictEqual(minjun.language, 'ko');
    assert.strictEqual(minjun.piperVoice, '');
  });

  runTest('System Voice Matching: Does not silently fall back to English voices for ja/ko', () => {
    // In node environment without browser speech synthesis, getBestSystemVoice returns null
    const bestJa = getBestSystemVoice('ja', 'ja_haruto');
    assert.strictEqual(bestJa, null, 'Should return null rather than English voice when no ja voices installed');

    const bestKo = getBestSystemVoice('ko', 'ko_minjun');
    assert.strictEqual(bestKo, null, 'Should return null rather than English voice when no ko voices installed');
  });

  // ----------------------------------------------------
  // SECTION 2: BUG-AAC-002 - Piper Inference Queue & Cancellation
  // ----------------------------------------------------
  console.log('\n--- Section 2: Piper Queue & Cancellation (BUG-AAC-002) ---');

  await runTest('runWithPiperLock: Fast path skips cancelled task before enqueuing', async () => {
    let taskExecuted = false;
    const result = await runWithPiperLock(async () => {
      taskExecuted = true;
      return 'done';
    }, { isCancelled: () => true });

    assert.strictEqual(result, null);
    assert.strictEqual(taskExecuted, false, 'Pre-cancelled task must not execute');
  });

  await runTest('runWithPiperLock: Superseded task in queue yields lock in 0ms without executing', async () => {
    const executionOrder: string[] = [];

    // Task 1: Represents an active running ONNX operation
    let resolveTask1: () => void = () => {};
    const task1Promise = new Promise<void>((r) => { resolveTask1 = r; });

    const p1 = runWithPiperLock(async () => {
      executionOrder.push('task1_start');
      await task1Promise;
      executionOrder.push('task1_end');
      return 'task1_result';
    });

    // Task 2: Represents rapid tile tap 2 (superseded before task 1 finishes)
    let task2Cancelled = false;
    let task2Executed = false;
    const p2 = runWithPiperLock(async () => {
      task2Executed = true;
      executionOrder.push('task2_run');
      return 'task2_result';
    }, { isCancelled: () => task2Cancelled });

    // Task 3: Represents rapid tile tap 3 (the active tile the user wants)
    let task3Executed = false;
    const p3 = runWithPiperLock(async () => {
      task3Executed = true;
      executionOrder.push('task3_run');
      return 'task3_result';
    }, { isCancelled: () => false });

    // Simulate tile tap 3 superseding tile tap 2 while task 1 is in-flight
    task2Cancelled = true;

    // Finish task 1
    resolveTask1();

    const [res1, res2, res3] = await Promise.all([p1, p2, p3]);

    assert.strictEqual(res1, 'task1_result');
    assert.strictEqual(res2, null, 'Superseded task 2 must return null');
    assert.strictEqual(task2Executed, false, 'Superseded task 2 must NOT execute inference');
    assert.strictEqual(res3, 'task3_result', 'Active task 3 must execute and return result');
    assert.strictEqual(task3Executed, true);

    // Verify task 3 started immediately after task 1 without task 2 executing
    assert.deepStrictEqual(executionOrder, ['task1_start', 'task1_end', 'task3_run']);
  });

  await runTest('runWithPiperLock: Multiple simultaneous non-cancelled requests execute serially', async () => {
    const executed: number[] = [];

    const tasks = [1, 2, 3, 4].map((id) =>
      runWithPiperLock(async () => {
        executed.push(id);
        return `result_${id}`;
      })
    );

    const results = await Promise.all(tasks);
    assert.deepStrictEqual(executed, [1, 2, 3, 4], 'Non-cancelled tasks must execute in order');
    assert.deepStrictEqual(results, ['result_1', 'result_2', 'result_3', 'result_4']);
  });

  await runTest('runWithPiperLock: Rapid tile tap sequence (5 taps) skips 4 stale inferences', async () => {
    const executedWords: string[] = [];
    const words = ['I', 'want', 'water', 'please', 'help'];
    let latestTapIndex = 0;

    const promises = words.map((word, index) => {
      return runWithPiperLock(
        async () => {
          executedWords.push(word);
          return word;
        },
        {
          isCancelled: () => index < latestTapIndex,
        }
      );
    });

    // Rapidly advance latest tap to the 5th word (index 4)
    latestTapIndex = 4;

    const results = await Promise.all(promises);

    assert.strictEqual(results[0], null);
    assert.strictEqual(results[1], null);
    assert.strictEqual(results[2], null);
    assert.strictEqual(results[3], null);
    assert.strictEqual(results[4], 'help');

    // Only 'help' should have executed its inference task
    assert.deepStrictEqual(executedWords, ['help']);
  });

  await runTest('runWithPiperLock: Voice switching during queued operations maintains isolation', async () => {
    const voiceEvents: string[] = [];

    const voicesToTest = ['amy', 'ryan', 'claude'];
    const tasks = voicesToTest.map((voice) =>
      runWithPiperLock(async () => {
        voiceEvents.push(`active_${voice}`);
        return `${voice}_done`;
      })
    );

    const results = await Promise.all(tasks);
    assert.deepStrictEqual(results, ['amy_done', 'ryan_done', 'claude_done']);
    assert.deepStrictEqual(voiceEvents, ['active_amy', 'active_ryan', 'active_claude']);
  });

  await runTest('synthesizeWithPiper: Skips Japanese and Korean with 0ms return', async () => {
    const t0 = performance.now();
    const jaResult = await synthesizeWithPiper('こんにちは', 'ja_haruto', 'ja');
    const koResult = await synthesizeWithPiper('안녕하세요', 'ko_minjun', 'ko');
    const elapsed = performance.now() - t0;

    assert.strictEqual(jaResult, null);
    assert.strictEqual(koResult, null);
    assert.ok(elapsed < 50, `Japanese and Korean checks must return near-instantly (${elapsed}ms)`);
  });

  await runTest('synthesizeWithPiper: Respects external AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await synthesizeWithPiper('Hello world', 'amy', 'en', {
      signal: controller.signal,
    });
    assert.strictEqual(result, null, 'Aborted signal must return null immediately');
  });

  await runTest('synthesizeWithPiper: Respects isCancelled predicate', async () => {
    let cancelled = true;
    const result = await synthesizeWithPiper('Testing cancellation', 'amy', 'en', {
      isCancelled: () => cancelled,
    });
    assert.strictEqual(result, null, 'isCancelled returning true must return null immediately');
  });

  // ----------------------------------------------------
  // SECTION 3: BUG-AAC-004 - Service Worker Update Lifecycle
  // ----------------------------------------------------
  console.log('\n--- Section 3: Service Worker Lifecycle (BUG-AAC-004) ---');

  runTest('Service Worker: First install (no initial controller) never reloads page', () => {
    let reloaded = false;
    let registeredHandler: (() => boolean) | null = null;

    const mockSw = {
      controller: null, // Initial install: page was not controlled on load
      addEventListener: (_event: string, handler: any) => {
        registeredHandler = handler;
      },
      getRegistrations: async () => [],
    };

    const mockStorage = {
      store: new Map<string, string>(),
      getItem(k: string) { return this.store.get(k) || null; },
      setItem(k: string, v: string) { this.store.set(k, v); },
    };

    const controller = initServiceWorkerUpdates({
      serviceWorker: mockSw as any,
      reloadFn: () => { reloaded = true; },
      storage: mockStorage as any,
    });

    assert.ok(controller, 'Update controller must initialize');
    assert.strictEqual(controller.hadInitialController, false, 'Initial controller must be false on first visit');

    // Simulate controllerchange event triggered by initial SW installation
    const reloadOccurred = controller.onControllerChange();
    assert.strictEqual(reloadOccurred, false, 'onControllerChange must return false on first install');
    assert.strictEqual(reloaded, false, 'window.location.reload must NOT be called on first install');
  });

  runTest('Service Worker: Update on existing install reloads page to apply updates', () => {
    let reloaded = false;

    const mockSw = {
      controller: { state: 'activated' }, // Existing install: page was already controlled
      addEventListener: () => {},
      getRegistrations: async () => [],
    };

    const mockStorage = {
      store: new Map<string, string>(),
      getItem(k: string) { return this.store.get(k) || null; },
      setItem(k: string, v: string) { this.store.set(k, v); },
    };

    const controller = initServiceWorkerUpdates({
      serviceWorker: mockSw as any,
      reloadFn: () => { reloaded = true; },
      storage: mockStorage as any,
    });

    assert.ok(controller);
    assert.strictEqual(controller.hadInitialController, true, 'Initial controller must be true on existing install');

    const reloadOccurred = controller.onControllerChange();
    assert.strictEqual(reloadOccurred, true, 'onControllerChange must return true on update');
    assert.strictEqual(reloaded, true, 'window.location.reload must be called on update');
  });

  runTest('Service Worker: Cooldown prevents rapid reload loops', () => {
    let reloadCount = 0;

    const mockSw = {
      controller: { state: 'activated' },
      addEventListener: () => {},
      getRegistrations: async () => [],
    };

    const mockStorage = {
      store: new Map<string, string>(),
      getItem(k: string) { return this.store.get(k) || null; },
      setItem(k: string, v: string) { this.store.set(k, v); },
    };

    const controller = initServiceWorkerUpdates({
      serviceWorker: mockSw as any,
      reloadFn: () => { reloadCount++; },
      storage: mockStorage as any,
    });

    assert.ok(controller);

    // First update: should reload
    const firstResult = controller.onControllerChange();
    assert.strictEqual(firstResult, true);
    assert.strictEqual(reloadCount, 1);

    // Second update immediately (within cooldown): must be suppressed
    const secondResult = controller.onControllerChange();
    assert.strictEqual(secondResult, false, 'Rapid second controllerchange must be suppressed');
    assert.strictEqual(reloadCount, 1, 'Reload count must not increase during cooldown');
  });

  // ----------------------------------------------------
  // SECTION 4: Regression Checks
  // ----------------------------------------------------
  console.log('\n--- Section 4: Regression Checks ---');

  runTest('Regression: TTS Cache Key generation remains stable', () => {
    const key1 = getTtsCacheKey('amy', 'en', 'Water');
    const key2 = getTtsCacheKey('amy', 'en', 'water.');
    assert.strictEqual(key1, key2, 'Normalized cache keys must match');
  });

  runTest('Regression: Core vocabulary list is intact', () => {
    assert.ok(CORE_AAC_VOCABULARY.length >= 30, 'Core vocabulary list must have at least 30 entries');
    assert.ok(CORE_AAC_VOCABULARY.includes('Water'));
    assert.ok(CORE_AAC_VOCABULARY.includes('Help'));
    assert.ok(CORE_AAC_VOCABULARY.includes('Yes'));
    assert.ok(CORE_AAC_VOCABULARY.includes('No'));
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
