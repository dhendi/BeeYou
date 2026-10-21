import fs from 'fs';
import path from 'path';
import https from 'https';

interface SentenceItem {
  text: string;
  slug: string;
}

const SENTENCES: SentenceItem[] = [
  { text: 'I want water.', slug: 'iwantwater' },
  { text: 'I want food.', slug: 'iwantfood' },
  { text: 'I want a drink.', slug: 'iwantadrink' },
  { text: 'I want a drink.', slug: 'iwantdrink' },
  { text: 'I want pizza.', slug: 'iwantpizza' },
  { text: 'I want an apple.', slug: 'iwantapple' },
  { text: 'I want to play.', slug: 'iwanttoplay' },
  { text: 'I need help.', slug: 'ineedhelp' },
  { text: 'I need a break.', slug: 'ineedabreak' },
  { text: 'Please stop.', slug: 'pleasestop' },
  { text: 'Thank you.', slug: 'thankyou' },
  { text: 'All done.', slug: 'alldone' },
  { text: 'How I feel.', slug: 'howifeel' },
  { text: 'Go somewhere.', slug: 'gosomewhere' },
  { text: 'It is too loud.', slug: 'itistooloud' },
  { text: 'It is too bright.', slug: 'itistoobright' },
  { text: 'I want this.', slug: 'iwantthis' },
  { text: 'I need the bathroom.', slug: 'ineedbathroom' },
  { text: 'I want more.', slug: 'iwantmore' },
  { text: 'I like it.', slug: 'ilikeit' },
  { text: 'I do not like it.', slug: 'idontlikeit' },
  { text: 'Yes please.', slug: 'yesplease' },
  { text: 'No thank you.', slug: 'nothankyou' },
];

const PERSONAS = [
  'amy',
  'danny',
  'bryce',
  'ryan',
  'kristin',
  'lessac',
  'joe',
  'claude',
  'davefx',
  'upmc',
  'puck',
];

const TARGET_DIRS = [
  path.resolve('public/assets/audio/core'),
  path.resolve('dist/assets/audio/core'),
  path.resolve('android/app/src/main/assets/public/assets/audio/core'),
  path.resolve('ios/App/App/public/assets/audio/core'),
];

function fetchAudio(text: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

async function run() {
  console.log('Generating fluid whole-sentence neural audio assets...');
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  for (const item of SENTENCES) {
    try {
      console.log(`Fetching audio for "${item.text}" (${item.slug})...`);
      const buffer = await fetchAudio(item.text);
      if (buffer.length < 100) {
        console.warn(`Buffer too small for ${item.slug}, skipping`);
        continue;
      }

      for (const persona of PERSONAS) {
        for (const dir of TARGET_DIRS) {
          if (fs.existsSync(dir)) {
            const mp3Path = path.join(dir, `${persona}_${item.slug}.mp3`);
            fs.writeFileSync(mp3Path, buffer);
          }
        }
      }
      console.log(`Saved ${item.slug}.mp3 for ${PERSONAS.length} personas`);
      await new Promise((r) => setTimeout(r, 80));
    } catch (err: any) {
      console.warn(`Failed for ${item.slug}:`, err.message);
    }
  }

  console.log('Done generating all fluid whole-sentence neural assets!');
}

run();
