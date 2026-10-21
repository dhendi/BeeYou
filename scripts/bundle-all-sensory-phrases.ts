import fs from 'fs';
import path from 'path';

interface AudioTarget {
  text: string;
  slug: string;
}

const PHRASES: AudioTarget[] = [
  // AAC Sensory Category Items
  { text: 'I need my headphones.', slug: 'ineedmyheadphones' },
  { text: 'I want my weighted blanket.', slug: 'iwantmyweightedblanket' },
  { text: 'I need a quiet place.', slug: 'ineedaquietplace' },
  { text: 'I want my fidget toy.', slug: 'iwantmyfidgettoy' },
  { text: 'Headphones.', slug: 'headphones' },
  { text: 'Weighted blanket.', slug: 'weightedblanket' },
  { text: 'Quiet room.', slug: 'quietroom' },
  { text: 'Squishy fidget.', slug: 'squishyfidget' },

  // Home Sensory Board
  { text: 'I want food.', slug: 'iwantfood' },
  { text: 'I want a drink.', slug: 'iwantadrink' },
  { text: 'I want to play.', slug: 'iwanttoplay' },
  { text: 'Go somewhere.', slug: 'gosomewhere' },
  { text: 'How I feel.', slug: 'howifeel' },
  { text: 'I need a break.', slug: 'ineedabreak' },
  { text: 'I want this.', slug: 'iwantthis' },
  { text: 'I need help.', slug: 'ineedhelp' },
  { text: 'Please stop.', slug: 'pleasestop' },

  // Sensory Loudness / Brightness
  { text: 'Too loud.', slug: 'tooloud' },
  { text: 'It is too loud.', slug: 'itistooloud' },
  { text: 'Too bright.', slug: 'toobright' },
  { text: 'It is too bright.', slug: 'itistoobright' },

  // Core words
  { text: 'Food.', slug: 'food' },
  { text: 'This.', slug: 'this' },
  { text: 'A.', slug: 'a' },
  { text: 'To.', slug: 'to' },
];

const VOICES = ['puck', 'fenrir', 'kore', 'aoede'];

const DIRS = [
  path.resolve('public/assets/audio/core'),
  path.resolve('dist/assets/audio/core'),
  path.resolve('android/app/src/main/assets/public/assets/audio/core'),
  path.resolve('ios/App/App/public/assets/audio/core'),
];

async function fetchGoogleTts(text: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) {
    throw new Error(`Google TTS status: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main() {
  console.log('Ensuring all sensory audio assets are pre-bundled across all targets...');

  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const publicCore = DIRS[0];

  for (const item of PHRASES) {
    // Check if puck WAV already exists in public
    const wavPath = path.join(publicCore, `puck_${item.slug}.wav`);
    const mp3Path = path.join(publicCore, `puck_${item.slug}.mp3`);

    let audioBuffer: Buffer | null = null;
    let extension = 'wav';

    if (fs.existsSync(wavPath)) {
      audioBuffer = fs.readFileSync(wavPath);
      extension = 'wav';
      console.log(`[Already Exists WAV] puck_${item.slug}.wav`);
    } else if (fs.existsSync(mp3Path)) {
      audioBuffer = fs.readFileSync(mp3Path);
      extension = 'mp3';
      console.log(`[Already Exists MP3] puck_${item.slug}.mp3`);
    } else {
      console.log(`[Generating] "${item.text}" -> ${item.slug}...`);
      try {
        audioBuffer = await fetchGoogleTts(item.text);
        extension = 'mp3';
        fs.writeFileSync(mp3Path, audioBuffer);
        console.log(`[Generated] puck_${item.slug}.mp3 (${audioBuffer.length} bytes)`);
      } catch (err: any) {
        console.error(`[Error generating ${item.slug}]:`, err.message);
        continue;
      }
    }

    if (!audioBuffer) continue;

    // Save for all voices and copy across all directories
    for (const voice of VOICES) {
      const fileName = `${voice}_${item.slug}.${extension}`;
      for (const dir of DIRS) {
        const destFile = path.join(dir, fileName);
        if (!fs.existsSync(destFile)) {
          fs.writeFileSync(destFile, audioBuffer);
        }
      }
    }
  }

  console.log('All sensory audio assets successfully bundled and synced!');
}

main().catch(console.error);
