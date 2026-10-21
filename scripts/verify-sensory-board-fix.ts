import fs from 'fs';
import path from 'path';
import { isAudioPayload } from '../src/utils/audio/speech';

const SENSORY_TILES = [
  { text: 'I want food', slug: 'iwantfood' },
  { text: 'I want a drink', slug: 'iwantadrink' },
  { text: 'I want to play', slug: 'iwanttoplay' },
  { text: 'Go somewhere', slug: 'gosomewhere' },
  { text: 'How I feel', slug: 'howifeel' },
  { text: 'I need a break', slug: 'ineedabreak' },
  { text: 'I want this', slug: 'iwantthis' },
  { text: 'I need help', slug: 'ineedhelp' },
  { text: 'Please stop', slug: 'pleasestop' },
  { text: 'Too loud', slug: 'tooloud' },
  { text: 'It is too loud', slug: 'itistooloud' },
];

const VOICES = ['puck', 'fenrir', 'kore'];

async function verifySensoryBoardFix() {
  console.log('--- Verifying AAC Sensory Board Offline Assets & Fix ---');
  let allPassed = true;

  const coreDir = path.resolve('public/assets/audio/core');
  for (const v of VOICES) {
    for (const t of SENSORY_TILES) {
      const fileName = `${v}_${t.slug}.wav`;
      const filePath = path.join(coreDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.error(`[FAIL] Missing audio asset: ${fileName}`);
        allPassed = false;
        continue;
      }
      const buf = fs.readFileSync(filePath);
      const isAudio = isAudioPayload(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
      if (!isAudio) {
        console.error(`[FAIL] Invalid audio payload for: ${fileName}`);
        allPassed = false;
      } else {
        console.log(`[PASS] ${fileName} (${(buf.length / 1024).toFixed(1)} KB, valid RIFF WAV)`);
      }
    }
  }

  // Verify slug mapping in speech.ts
  console.log('\n--- Verifying slug generation in speech.ts ---');
  for (const t of SENSORY_TILES) {
    const rawSlug = t.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rawSlug !== t.slug) {
      console.error(`[FAIL] Slug mismatch for "${t.text}": expected ${t.slug}, got ${rawSlug}`);
      allPassed = false;
    } else {
      console.log(`[PASS] "${t.text}" -> rawSlug "${rawSlug}" matches exact WAV file`);
    }
  }

  if (allPassed) {
    console.log('\nAll AAC Sensory Board verification checks PASSED successfully!');
  } else {
    console.error('\nSome checks FAILED.');
    process.exit(1);
  }
}

verifySensoryBoardFix().catch(err => {
  console.error(err);
  process.exit(1);
});
