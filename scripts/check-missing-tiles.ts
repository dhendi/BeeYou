import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPrimarySpokenPhrasesForLanguage } from '../src/data/aacVocabularyCatalog';
import { formatForNaturalSpeech } from '../src/utils/audio/speech';

const items = getPrimarySpokenPhrasesForLanguage('en', (k) => k);
const dir = path.join(process.cwd(), '.data/tts_cache');

let serverWillFind = 0;
let serverWillMiss = 0;
const missedList: any[] = [];

for (let i = 0; i < items.length; i++) {
  const phrase = items[i].phrase;
  const formatted = formatForNaturalSpeech(phrase);
  
  const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
  const literalKeyText = formatted.trim().toLowerCase();
  const hashKey = crypto.createHash('md5').update(`v9_puck_en_${cacheKeyText}`).digest('hex');
  const literalHashKey = crypto.createHash('md5').update(`v9_puck_en_${literalKeyText}`).digest('hex');
  
  const diskPathWav = path.join(dir, `v9_puck_en_${hashKey}.wav`);
  const literalDiskPathWav = path.join(dir, `v9_puck_en_${literalHashKey}.wav`);
  const diskPathMp3 = path.join(dir, `v9_puck_en_${hashKey}.mp3`);
  const literalDiskPathMp3 = path.join(dir, `v9_puck_en_${literalHashKey}.mp3`);
  const legacyDiskPathMp3 = path.join(dir, `en_${hashKey}.mp3`);

  const serverFindsIt = fs.existsSync(diskPathWav) ||
    fs.existsSync(literalDiskPathWav) ||
    fs.existsSync(diskPathMp3) ||
    fs.existsSync(literalDiskPathMp3) ||
    fs.existsSync(legacyDiskPathMp3);

  if (serverFindsIt) {
    serverWillFind++;
  } else {
    serverWillMiss++;
    // Let's see what file ACTUALLY exists for this tile
    const rawClean = cacheKeyText;
    const rawHash = crypto.createHash('md5').update(`puck_en_${rawClean}`).digest('hex');
    const rawFile = path.join(dir, `puck_en_${rawHash}.wav`);
    const rawLiteralHash = crypto.createHash('md5').update(`puck_en_${literalKeyText}`).digest('hex');
    const rawLiteralFile = path.join(dir, `puck_en_${rawLiteralHash}.wav`);
    
    missedList.push({
      index: i,
      phrase,
      formatted,
      rawFileExists: fs.existsSync(rawFile),
      rawLiteralFileExists: fs.existsSync(rawLiteralFile),
    });
  }
}

console.log(`Server will find: ${serverWillFind} / 82`);
console.log(`Server will miss: ${serverWillMiss} / 82`);
console.log('Missed items:');
missedList.forEach(m => console.log(JSON.stringify(m)));
