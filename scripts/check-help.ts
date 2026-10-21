import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = '.data/tts_cache';
const files = fs.readdirSync(dir);

// Search for any file where the hash or content might be Help
const ttsVersion = 'v9';
const voiceKey = 'puck';
const normalizedLang = 'en';

const variations = [
  'help',
  'help.',
  'please help me',
  'please help me.',
  'i need help with schoolwork',
];

for (const v of variations) {
  const h1 = crypto.createHash('md5').update(`${ttsVersion}_${voiceKey}_${normalizedLang}_${v}`).digest('hex');
  const h2 = crypto.createHash('md5').update(`${voiceKey}_${normalizedLang}_${v}`).digest('hex');
  const h3 = crypto.createHash('md5').update(`${normalizedLang}_${v}`).digest('hex');
  
  console.log(`Variation "${v}":`);
  console.log(`  v9 hash: ${h1} -> exists: ${fs.existsSync(path.join(dir, `v9_puck_en_${h1}.wav`)) || fs.existsSync(path.join(dir, `v9_puck_en_${h1}.mp3`))}`);
  console.log(`  raw hash: ${h2} -> exists: ${fs.existsSync(path.join(dir, `puck_en_${h2}.wav`))}`);
  console.log(`  legacy hash: ${h3} -> exists: ${fs.existsSync(path.join(dir, `en_${h3}.mp3`))}`);
}
