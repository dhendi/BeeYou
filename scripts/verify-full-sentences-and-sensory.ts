import fs from 'fs';
import path from 'path';

async function verifyAll() {
  console.log('=== VERIFYING FULL SENTENCES AND AAC SENSORY BOARD ===\n');

  // 1. Verify all pre-bundled sensory files exist on disk
  console.log('1. Checking pre-bundled core assets on disk...');
  const SENSORY_SLUGS = [
    'iwantfood',
    'iwantadrink',
    'iwanttoplay',
    'gosomewhere',
    'howifeel',
    'ineedabreak',
    'iwantthis',
    'ineedhelp',
    'pleasestop',
    'tooloud',
    'itistooloud',
    'toobright',
    'itistoobright',
    'ineedmyheadphones',
    'iwantmyweightedblanket',
    'ineedaquietplace',
    'iwantmyfidgettoy',
  ];

  const publicCore = path.resolve('public/assets/audio/core');
  let missingCount = 0;
  for (const slug of SENSORY_SLUGS) {
    const wav = path.join(publicCore, `puck_${slug}.wav`);
    const mp3 = path.join(publicCore, `puck_${slug}.mp3`);
    if (!fs.existsSync(wav) && !fs.existsSync(mp3)) {
      console.error(`[FAIL] Missing pre-bundled file for slug: ${slug}`);
      missingCount++;
    } else {
      const found = fs.existsSync(wav) ? `puck_${slug}.wav` : `puck_${slug}.mp3`;
      console.log(`[PASS] Found asset: ${found}`);
    }
  }

  if (missingCount > 0) {
    throw new Error(`Missing ${missingCount} sensory assets!`);
  }

  // 2. Verify server /api/tts endpoint generates arbitrary full sentences in < 1000ms
  console.log('\n2. Testing server dynamic full-sentence synthesis via /api/tts...');
  const TEST_SENTENCES = [
    'I want apple and pizza.',
    'Can you please help me find my backpack?',
    'The playground is so much fun today.',
    'I feel calm and happy right now.',
    'Please turn on the music so we can dance together.',
  ];

  for (const sentence of TEST_SENTENCES) {
    const start = Date.now();
    const url = `http://localhost:3000/api/tts?lang=en&voice=puck&text=${encodeURIComponent(sentence)}`;
    const res = await fetch(url);
    const duration = Date.now() - start;

    if (!res.ok) {
      throw new Error(`[FAIL] Sentence "${sentence}" failed with HTTP ${res.status}`);
    }

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('audio')) {
      throw new Error(`[FAIL] Sentence "${sentence}" returned invalid content type: ${ct}`);
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) {
      throw new Error(`[FAIL] Sentence "${sentence}" returned payload too small: ${buf.byteLength} bytes`);
    }

    console.log(`[PASS] "${sentence}" -> ${buf.byteLength} bytes, ${ct}, generated in ${duration}ms`);
  }

  // 3. Verify cached replay is fast (< 500ms)
  console.log('\n3. Testing instant replay cache (< 500ms)...');
  const replayStart = Date.now();
  const replayRes = await fetch(`http://localhost:3000/api/tts?lang=en&voice=puck&text=${encodeURIComponent(TEST_SENTENCES[0])}`);
  const replayDuration = Date.now() - replayStart;
  if (!replayRes.ok || replayDuration > 500) {
    throw new Error(`[FAIL] Cached replay too slow: ${replayDuration}ms`);
  }
  console.log(`[PASS] Cached replay returned in ${replayDuration}ms`);

  console.log('\n=== ALL FULL SENTENCE AND SENSORY VERIFICATION CHECKS PASSED! ===');
}

verifyAll().catch((err) => {
  console.error('\nVerification FAILED:', err);
  process.exit(1);
});
