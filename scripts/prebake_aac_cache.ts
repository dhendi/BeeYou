import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ALL_AAC_VOCABULARY } from '../src/data/aacVocabularyCatalog';
import { TTS_GENERATION_VERSION } from '../src/data/voicePersonasData';

const TTS_CACHE_DIR = path.resolve('.data/tts_cache');
if (!fs.existsSync(TTS_CACHE_DIR)) {
  fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
}

// Load static locales
const locales: Record<string, Record<string, string>> = {};
const localeFiles = ['es', 'fr', 'de', 'zh'];
for (const l of localeFiles) {
  try {
    const locPath = path.resolve(`public/locales/${l}.json`);
    if (fs.existsSync(locPath)) {
      locales[l] = JSON.parse(fs.readFileSync(locPath, 'utf8'));
    }
  } catch {}
}

function translate(text: string, lang: string): string {
  if (lang === 'en') return text;
  const dict = locales[lang];
  if (!dict) return text;
  return dict[text] || dict[text.toLowerCase()] || text;
}

function getCachePath(voice: string, lang: string, text: string): string {
  const cleanText = text.trim().toLowerCase();
  const hashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_${voice.toLowerCase()}_${lang}_${cleanText}`).digest('hex');
  return path.join(TTS_CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice.toLowerCase()}_${lang}_${hashKey}.wav`);
}

async function runPrebake() {
  console.log('[Prebake] Starting AAC vocabulary pre-baking into .data/tts_cache...');
  console.log(`[Prebake] TTS Generation Version: ${TTS_GENERATION_VERSION}`);
  console.log(`[Prebake] Target Directory: ${TTS_CACHE_DIR}`);

  const targets = [
    { voice: 'puck', languages: ['en', 'es', 'fr', 'de'] },
    { voice: 'fenrir', languages: ['en'] },
    { voice: 'kore', languages: ['en'] },
    { voice: 'leda', languages: ['en'] },
    { voice: 'zephyr', languages: ['en'] },
  ];

  let totalChecked = 0;
  let alreadyCached = 0;
  let newlyGenerated = 0;
  let failed = 0;

  for (const target of targets) {
    for (const lang of target.languages) {
      console.log(`\n[Prebake] Scanning voice "${target.voice}" (${lang.toUpperCase()})...`);
      const seen = new Set<string>();

      for (const item of ALL_AAC_VOCABULARY) {
        const raw = item.speechText || item.label;
        const localized = translate(raw, lang);
        const phrase = localized.trim();
        if (!phrase || seen.has(phrase.toLowerCase())) continue;
        seen.add(phrase.toLowerCase());
        totalChecked++;

        const diskPath = getCachePath(target.voice, lang, phrase);
        if (fs.existsSync(diskPath)) {
          alreadyCached++;
          continue;
        }

        // Fetch from local running server so it passes through the unified TTS pipeline
        const url = `http://localhost:3000/api/tts?text=${encodeURIComponent(phrase)}&lang=${encodeURIComponent(lang)}&voice=${encodeURIComponent(target.voice)}&v=${encodeURIComponent(TTS_GENERATION_VERSION)}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            newlyGenerated++;
            process.stdout.write(`+`);
          } else {
            failed++;
            process.stdout.write(`x`);
          }
        } catch {
          failed++;
          process.stdout.write(`!`);
        }

        // Small breather between requests to maintain API stability
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }

  console.log(`\n\n[Prebake Summary]`);
  console.log(`  Total Tiles Checked: ${totalChecked}`);
  console.log(`  Already Cached:      ${alreadyCached}`);
  console.log(`  Newly Generated:     ${newlyGenerated}`);
  console.log(`  Failed / Skipped:    ${failed}`);
}

runPrebake().catch(console.error);
