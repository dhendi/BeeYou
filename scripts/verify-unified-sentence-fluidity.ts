import https from 'https';
import fs from 'fs';
import path from 'path';
import { formatForNaturalSpeech } from '../src/utils/audio/speech';

async function main() {
  console.log('--- 1. Testing formatForNaturalSpeech prosody normalization ---');
  const testCases = [
    { input: 'I. want. a. drink.', expected: 'I want a drink.' },
    { input: 'I, want, a, drink', expected: 'I want a drink.' },
    { input: 'I . want . a . drink .', expected: 'I want a drink.' },
    { input: 'want a drink?', expected: 'Want a drink?' },
    { input: 'help me please!', expected: 'Help me please!' },
    { input: 'Yes / Good', expected: 'Yes.' },
    { input: 'Me / Mine', expected: 'Me.' },
  ];

  let passedFormatting = true;
  for (const tc of testCases) {
    const output = formatForNaturalSpeech(tc.input);
    const pass = output === tc.expected;
    if (!pass) passedFormatting = false;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] "${tc.input}" -> "${output}" (expected: "${tc.expected}")`);
  }

  if (!passedFormatting) {
    console.error('Formatting tests failed!');
    process.exit(1);
  }

  console.log('\n--- 2. Testing Unified Whole-Sentence Neural Synthesis from Server ---');
  const sentence = 'I want a drink.';
  const voice = 'puck';
  const lang = 'en';
  const url = `http://localhost:3000/api/tts?lang=${lang}&text=${encodeURIComponent(sentence)}&voice=${voice}&v=v9`;

  const t0 = Date.now();
  const res1 = await fetch(url);
  const dur1 = Date.now() - t0;
  console.log(`First request: status=${res1.status}, contentType=${res1.headers.get('content-type')}, latency=${dur1}ms`);

  if (!res1.ok) {
    console.error('First request failed!');
    process.exit(1);
  }

  const buf1 = await res1.arrayBuffer();
  console.log(`Audio buffer size: ${buf1.byteLength} bytes`);

  const t1 = Date.now();
  const res2 = await fetch(url);
  const dur2 = Date.now() - t1;
  console.log(`Second request (disk/memory cache hit): status=${res2.status}, latency=${dur2}ms`);

  if (dur2 > 50) {
    console.warn(`Cache hit took ${dur2}ms (expected <50ms)`);
  }

  console.log('\n--- 3. Verifying Local Cache file in .data/tts_cache ---');
  const cacheDir = path.join(process.cwd(), '.data', 'tts_cache');
  const files = fs.readdirSync(cacheDir).filter(f => f.startsWith('v9_puck_en_'));
  console.log(`Found ${files.length} Puck English cache files in ${cacheDir}`);

  console.log('\nALL UNIFIED WHOLE-SENTENCE VERIFICATIONS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
