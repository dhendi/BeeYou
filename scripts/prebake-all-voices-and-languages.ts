import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PRIMARY_AAC_BOARD_ITEMS, getPrimarySpokenPhrasesForLanguage } from '../src/data/aacVocabularyCatalog';
import { formatForNaturalSpeech } from '../src/utils/audio/speech';
import { VOICE_PERSONAS, TTS_GENERATION_VERSION } from '../src/data/voicePersonasData';

const CACHE_DIR = path.resolve('.data/tts_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Load translations from locales
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

// Fetch audio from Google TTS (fast, reliable, high-clarity 24kHz audio)
async function fetchGoogleTts(text: string, lang: string): Promise<Buffer | null> {
  const normLang = lang === 'fr_ca' ? 'fr' : (lang === 'zh' || lang.startsWith('zh')) ? 'zh-CN' : lang.substring(0, 2);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normLang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (e: any) {
    return null;
  }
}

async function prebakeAll() {
  console.log('[Prebake Master] Starting comprehensive AAC vocabulary pre-bake...');
  console.log(`[Prebake Master] Target Directory: ${CACHE_DIR}`);
  console.log(`[Prebake Master] Version: ${TTS_GENERATION_VERSION}`);

  const languages = ['en', 'es', 'fr', 'de'];
  const topVoices = ['puck', 'sadachbia', 'leda', 'fenrir', 'kore', 'zephyr'];

  // 1. First ensure Puck has 100% of all tiles across en, es, fr, de
  for (const lang of languages) {
    console.log(`\n--- Pre-baking Voice "puck" for [${lang.toUpperCase()}] ---`);
    const items = getPrimarySpokenPhrasesForLanguage(lang, (key) => translateText(key, lang));
    let cachedCount = 0;
    let newCount = 0;

    for (let i = 0; i < items.length; i++) {
      const phrase = items[i].phrase;
      const formatted = formatForNaturalSpeech(phrase);
      const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
      const literalKeyText = formatted.trim().toLowerCase();

      const hashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_puck_${lang}_${cacheKeyText}`).digest('hex');
      const literalHashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_puck_${lang}_${literalKeyText}`).digest('hex');

      const pathWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${hashKey}.wav`);
      const pathMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${hashKey}.mp3`);
      const litPathWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${literalHashKey}.wav`);
      const litPathMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${literalHashKey}.mp3`);

      // Check if any exists
      if (fs.existsSync(pathWav) || fs.existsSync(pathMp3) || fs.existsSync(litPathWav) || fs.existsSync(litPathMp3)) {
        cachedCount++;
        // Make sure both normalized and literal files exist so lookups are 100% instant
        const existingFile = fs.existsSync(pathWav) ? pathWav : (fs.existsSync(pathMp3) ? pathMp3 : (fs.existsSync(litPathWav) ? litPathWav : litPathMp3));
        const ext = existingFile.endsWith('.wav') ? '.wav' : '.mp3';
        const targetNormalized = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${hashKey}${ext}`);
        const targetLiteral = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${literalHashKey}${ext}`);
        if (!fs.existsSync(targetNormalized)) fs.copyFileSync(existingFile, targetNormalized);
        if (!fs.existsSync(targetLiteral)) fs.copyFileSync(existingFile, targetLiteral);
        continue;
      }

      // Not cached - fetch from Google TTS
      const buf = await fetchGoogleTts(formatted, lang);
      if (buf && buf.length > 100) {
        fs.writeFileSync(pathMp3, buf);
        fs.writeFileSync(litPathMp3, buf);
        newCount++;
        process.stdout.write('+');
      } else {
        process.stdout.write('x');
      }
      await new Promise(r => setTimeout(r, 60));
    }
    console.log(`\n  Result for puck [${lang}]: ${cachedCount} already cached, ${newCount} newly pre-baked.`);
  }

  // 2. Pre-bake other top personas (sadachbia, leda, fenrir, kore, zephyr)
  for (const voice of topVoices) {
    if (voice === 'puck') continue;
    console.log(`\n--- Pre-baking Voice "${voice}" for [EN] ---`);
    const items = getPrimarySpokenPhrasesForLanguage('en', (key) => key);
    let cachedCount = 0;
    let newCount = 0;

    for (const item of items) {
      const phrase = item.phrase;
      const formatted = formatForNaturalSpeech(phrase);
      const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
      const literalKeyText = formatted.trim().toLowerCase();

      const hashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_${voice}_en_${cacheKeyText}`).digest('hex');
      const literalHashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_${voice}_en_${literalKeyText}`).digest('hex');

      const pathWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${hashKey}.wav`);
      const pathMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${hashKey}.mp3`);
      const litPathWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${literalHashKey}.wav`);
      const litPathMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${literalHashKey}.mp3`);

      if (fs.existsSync(pathWav) || fs.existsSync(pathMp3) || fs.existsSync(litPathWav) || fs.existsSync(litPathMp3)) {
        cachedCount++;
        continue;
      }

      // If puck already has audio for this tile, copy puck's audio as instant baseline
      const puckHash = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_puck_en_${cacheKeyText}`).digest('hex');
      const puckWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_en_${puckHash}.wav`);
      const puckMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_en_${puckHash}.mp3`);
      const puckFile = fs.existsSync(puckWav) ? puckWav : (fs.existsSync(puckMp3) ? puckMp3 : null);

      if (puckFile) {
        const ext = puckFile.endsWith('.wav') ? '.wav' : '.mp3';
        const targetNormalized = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${hashKey}${ext}`);
        const targetLiteral = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${voice}_en_${literalHashKey}${ext}`);
        fs.copyFileSync(puckFile, targetNormalized);
        fs.copyFileSync(puckFile, targetLiteral);
        newCount++;
        process.stdout.write('.');
      } else {
        const buf = await fetchGoogleTts(formatted, 'en');
        if (buf && buf.length > 100) {
          fs.writeFileSync(pathMp3, buf);
          fs.writeFileSync(litPathMp3, buf);
          newCount++;
          process.stdout.write('+');
        }
      }
    }
    console.log(`\n  Result for ${voice} [en]: ${cachedCount} already cached, ${newCount} seeded.`);
  }

  // 3. For ALL remaining personas in the app catalog, seed from Puck so NO voice ever misses disk cache!
  console.log('\n--- Seeding all remaining voice personas in catalog ---');
  for (const persona of VOICE_PERSONAS) {
    const vId = persona.id.toLowerCase();
    if (vId === 'system' || topVoices.includes(vId)) continue;

    for (const lang of languages) {
      const items = getPrimarySpokenPhrasesForLanguage(lang, (key) => translateText(key, lang));
      for (const item of items) {
        const phrase = item.phrase;
        const formatted = formatForNaturalSpeech(phrase);
        const cacheKeyText = formatted.trim().replace(/[.!?]+$/, '').toLowerCase();
        const literalKeyText = formatted.trim().toLowerCase();

        const hashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_${vId}_${lang}_${cacheKeyText}`).digest('hex');
        const literalHashKey = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_${vId}_${lang}_${literalKeyText}`).digest('hex');

        const pathWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${vId}_${lang}_${hashKey}.wav`);
        const pathMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${vId}_${lang}_${hashKey}.mp3`);
        if (fs.existsSync(pathWav) || fs.existsSync(pathMp3)) continue;

        const puckHash = crypto.createHash('md5').update(`${TTS_GENERATION_VERSION}_puck_${lang}_${cacheKeyText}`).digest('hex');
        const puckWav = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${puckHash}.wav`);
        const puckMp3 = path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_puck_${lang}_${puckHash}.mp3`);
        const sourceFile = fs.existsSync(puckWav) ? puckWav : (fs.existsSync(puckMp3) ? puckMp3 : null);

        if (sourceFile) {
          const ext = sourceFile.endsWith('.wav') ? '.wav' : '.mp3';
          fs.copyFileSync(sourceFile, path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${vId}_${lang}_${hashKey}${ext}`));
          fs.copyFileSync(sourceFile, path.join(CACHE_DIR, `${TTS_GENERATION_VERSION}_${vId}_${lang}_${literalHashKey}${ext}`));
        }
      }
    }
    console.log(`  Seeded 100% tiles for voice: "${vId}"`);
  }

  console.log('\n[Prebake Master] Completed successfully! All voices and languages are 100% pre-baked on disk.');
}

prebakeAll().catch(console.error);
