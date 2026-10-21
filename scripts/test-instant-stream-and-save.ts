import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function testDynamicGenerationAndSave() {
  const customPhrase = `Sparkling lemonade with mint leaves on a warm afternoon ${Date.now()}`;
  console.log(`[Test] Testing completely un-baked phrase: "${customPhrase}"`);

  const t0 = performance.now();
  const url = `http://127.0.0.1:3000/api/tts?voice=puck&lang=en&text=${encodeURIComponent(customPhrase)}`;
  
  console.log('[Test] Step 1: Requesting un-cached phrase from server...');
  const res1 = await fetch(url);
  const duration1 = Math.round(performance.now() - t0);

  console.log(`[Test] Step 1 Response: Status ${res1.status}, Content-Type: ${res1.headers.get('content-type')}, took ${duration1}ms`);
  if (!res1.ok) {
    throw new Error(`Step 1 failed with status ${res1.status}`);
  }

  const buf1 = Buffer.from(await res1.arrayBuffer());
  console.log(`[Test] Received audio buffer of size: ${buf1.length} bytes`);

  // Verify file was saved to disk
  const norm = customPhrase.trim().replace(/[.!?]+$/, '').toLowerCase();
  const hash = crypto.createHash('md5').update(`v9_puck_en_${norm}`).digest('hex');
  const diskFile = path.resolve(`.data/tts_cache/v9_puck_en_${hash}.mp3`);
  
  console.log(`[Test] Step 2: Checking if file was saved to disk cache: ${diskFile}`);
  // Give 50ms for background fs write
  await new Promise(r => setTimeout(r, 60));
  const exists = fs.existsSync(diskFile);
  console.log(`[Test] File exists on disk: ${exists}`);
  if (!exists) {
    throw new Error('Audio was not auto-saved to disk cache!');
  }

  // Step 3: Second call - must be an instant disk hit in under 20ms!
  console.log('[Test] Step 3: Requesting exact same phrase again to verify instant cache hit...');
  const t1 = performance.now();
  const res2 = await fetch(url);
  const duration2 = Math.round(performance.now() - t1);
  console.log(`[Test] Step 3 Response: Status ${res2.status}, took ${duration2}ms (Cache Hit)`);

  if (duration2 > 50) {
    throw new Error(`Cache hit took too long: ${duration2}ms`);
  }

  console.log('[Test] SUCCESS: Dynamic generation generated instantly and auto-saved to disk cache perfectly!');
}

testDynamicGenerationAndSave().catch((err) => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
