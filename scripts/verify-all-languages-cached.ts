import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPrimarySpokenPhrasesForLanguage } from '../src/data/aacVocabularyCatalog';
import { formatForNaturalSpeech } from '../src/utils/audio/speech';
import { TTS_GENERATION_VERSION } from '../src/data/voicePersonasData';

const CACHE_DIR = path.resolve('.data/tts_cache');

const locales: Record<string, Record<string, string>> = {};
for (const lang of ['es', 'fr', 'de']) {
  try {
    const locPath = path.resolve(`public/locales/${lang}.json`);
    if (fs.existsSync(locPath)) {
      locales[lang] = JSON.parse(fs.readFileSync(locPath, 'utf8'));
    }
  } catch {}
}

function translateText(text: string, lang: string): string {
  if (lang === 'en') return text;
  const dict = locales[lang] || {};
  return dict[text] || dict[text.toLowerCase()] || text;
}

for (const lang of ['en', 'es', 'fr', 'de']) {
  const items = getPrimarySpokenPhrasesForLanguage(lang, (k) => translateText(k, lang));
  let count = 0;
  for (const it of items) {
    const formatted = formatForNaturalSpeech(it.phrase);
    const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
    const hash = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_puck_${lang}_${cacheKeyText}`).digest('hex');
    const f1 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${hash}.wav`);
    const f2 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${hash}.mp3`);
    if (fs.existsSync(f1) || fs.existsSync(f2)) count++;
  }
  console.log(`Puck in ${lang.toUpperCase()}: ${count} / ${items.length} cached`);
}
