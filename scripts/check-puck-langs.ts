import fs from 'fs';
import path from 'path';
import { getPrimarySpokenPhrasesForLanguage } from '../src/data/aacVocabularyCatalog';
import crypto from 'crypto';

const dir = path.join(process.cwd(), '.data/tts_cache');
for (const lang of ['en', 'es', 'fr', 'de']) {
  const items = getPrimarySpokenPhrasesForLanguage(lang, k => k);
  let count = 0;
  for (const it of items) {
    const norm = it.phrase.trim().replace(/[.!?]+$/, '').toLowerCase();
    const hash = crypto.createHash('md5').update('v9_puck_' + lang + '_' + norm).digest('hex');
    const f1 = path.join(dir, 'v9_puck_' + lang + '_' + hash + '.wav');
    const f2 = path.join(dir, 'v9_puck_' + lang + '_' + hash + '.mp3');
    if (fs.existsSync(f1) || fs.existsSync(f2)) count++;
  }
  console.log('puck ' + lang + ': ' + count + ' / ' + items.length);
}
