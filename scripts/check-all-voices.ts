import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPrimarySpokenPhrasesForLanguage } from '../src/data/aacVocabularyCatalog';
import { formatForNaturalSpeech } from '../src/utils/audio/speech';
import { VOICE_PERSONAS } from '../src/data/voicePersonasData';

const items = getPrimarySpokenPhrasesForLanguage('en', (k) => k);
const dir = path.join(process.cwd(), '.data/tts_cache');

console.log('Total items in primary board:', items.length);

for (const persona of VOICE_PERSONAS) {
  const voiceKey = persona.id.toLowerCase();
  let found = 0;
  for (const it of items) {
    const formatted = formatForNaturalSpeech(it.phrase);
    const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
    const literalKeyText = formatted.trim().toLowerCase();
    const hashKey = crypto.createHash('md5').update(`v9_${voiceKey}_en_${cacheKeyText}`).digest('hex');
    const literalHashKey = crypto.createHash('md5').update(`v9_${voiceKey}_en_${literalKeyText}`).digest('hex');
    
    const p1 = path.join(dir, `v9_${voiceKey}_en_${hashKey}.wav`);
    const p2 = path.join(dir, `v9_${voiceKey}_en_${literalHashKey}.wav`);
    const p3 = path.join(dir, `${voiceKey}_en_${hashKey}.wav`);
    const p4 = path.join(dir, `${voiceKey}_en_${literalHashKey}.wav`);
    const p5 = path.join(dir, `v9_${voiceKey}_en_${hashKey}.mp3`);
    const p6 = path.join(dir, `v9_${voiceKey}_en_${literalHashKey}.mp3`);

    if (fs.existsSync(p1) || fs.existsSync(p2) || fs.existsSync(p3) || fs.existsSync(p4) || fs.existsSync(p5) || fs.existsSync(p6)) {
      found++;
    }
  }
  console.log(`Voice "${persona.id}" (${persona.name}): ${found} / ${items.length} cached`);
}
