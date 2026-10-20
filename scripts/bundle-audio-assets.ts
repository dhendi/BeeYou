import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VOICE_PERSONAS } from '../src/data/voicePersonasData';

const PREVIEWS_DIR = path.join(process.cwd(), 'public', 'assets', 'audio', 'previews');
const CORE_DIR = path.join(process.cwd(), 'public', 'assets', 'audio', 'core');

if (!fs.existsSync(PREVIEWS_DIR)) fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
if (!fs.existsSync(CORE_DIR)) fs.mkdirSync(CORE_DIR, { recursive: true });

const CORE_WORDS = [
  'Yes', 'No', 'Help', 'Water', 'More', 'Stop', 'Please', 'Thank you',
  'I', 'You', 'We', 'My', 'Want', 'Need', 'Like', 'Go', 'See', 'Feel',
  'Eat', 'Drink', 'Play', 'All done', 'Break', 'Wait', 'Happy', 'Sad',
  'Calm', 'Tired', 'Angry', 'Apple', 'Pizza', 'Bathroom', 'Home'
];
const FOCUS_VOICES = ['puck', 'fenrir', 'kore', 'leda', 'zephyr'];

async function bundleAudio() {
  console.log('--- 1. Bundling Preview Auditions ---');
  for (const p of VOICE_PERSONAS) {
    if (!FOCUS_VOICES.includes(p.id)) continue;
    const dest = path.join(PREVIEWS_DIR, `${p.id}.wav`);
    
    // Check if preview is already on server
    const url = `http://localhost:3000/api/tts?voice=${encodeURIComponent(p.id)}&lang=en&text=${encodeURIComponent(p.previewText)}&v=v4`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 44) {
          fs.writeFileSync(dest, buf);
          console.log(`[Bundled Preview] ${p.id}.wav (${(buf.length / 1024).toFixed(1)} KB)`);
        }
      }
    } catch (err: any) {
      console.warn(`[Fail Preview] ${p.id}:`, err.message);
    }
  }

  console.log('\n--- 2. Bundling Core AAC Vocabulary ---');
  for (const v of ['puck', 'fenrir', 'kore']) {
    for (const word of CORE_WORDS) {
      const slug = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dest = path.join(CORE_DIR, `${v}_${slug}.wav`);
      if (fs.existsSync(dest)) {
        console.log(`[Already Exists] ${v}_${slug}.wav`);
        continue;
      }

      const url = `http://localhost:3000/api/tts?voice=${encodeURIComponent(v)}&lang=en&text=${encodeURIComponent(word)}&v=v4`;
      try {
        const res = await fetch(url);
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('audio')) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 44 && buf.subarray(0, 4).toString() === 'RIFF') {
            fs.writeFileSync(dest, buf);
            console.log(`[Bundled Core] ${v}_${slug}.wav (${(buf.length / 1024).toFixed(1)} KB)`);
          }
        }
      } catch (err: any) {
        console.warn(`[Fail Core] ${v}_${slug}:`, err.message);
      }
    }
  }

  console.log('\nFinished bundling audio assets successfully.');
}

bundleAudio().catch(console.error);
