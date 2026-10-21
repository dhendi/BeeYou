const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
  if (m) apiKey = m[1].trim();
}

if (!apiKey) {
  console.error('No GEMINI_API_KEY found.');
  process.exit(1);
}

const CORE_DIR = path.join(process.cwd(), 'public', 'assets', 'audio', 'core');
if (!fs.existsSync(CORE_DIR)) fs.mkdirSync(CORE_DIR, { recursive: true });

function cleanRiffWav(buf) {
  if (!buf || buf.length < 44) return buf;
  if (buf.readUInt32BE(0) !== 0x52494646 || buf.readUInt32BE(8) !== 0x57415645) {
    return buf;
  }
  let offset = 12;
  let fmtOffset = -1;
  let fmtLen = 0;
  let dataOffset = -1;
  let dataLen = 0;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);

    if (chunkId === 'fmt ') {
      fmtOffset = offset;
      fmtLen = 8 + chunkSize;
    } else if (chunkId === 'data') {
      dataOffset = offset;
      dataLen = 8 + chunkSize;
    }

    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }

  if (fmtOffset === -1 || dataOffset === -1) return buf;

  if (fmtOffset === 12 && dataOffset === 12 + fmtLen && (12 + fmtLen + dataLen === buf.length)) {
    return buf;
  }

  const totalRiffSize = 4 + fmtLen + dataLen;
  const out = Buffer.alloc(8 + totalRiffSize);
  out.write('RIFF', 0, 4, 'ascii');
  out.writeUInt32LE(totalRiffSize, 4);
  out.write('WAVE', 8, 4, 'ascii');
  buf.copy(out, 12, fmtOffset, fmtOffset + fmtLen);
  buf.copy(out, 12 + fmtLen, dataOffset, dataOffset + dataLen);
  return out;
}

const PERSONAS = [
  { id: 'puck', geminiVoice: 'Puck', desc: 'child voice' },
  { id: 'fenrir', geminiVoice: 'Fenrir', desc: 'teen male voice' },
  { id: 'kore', geminiVoice: 'Kore', desc: 'adult female voice' }
];

const ITEMS_TO_GENERATE = [
  // 9 Homepage Sensory Board Direct Phrases
  { text: 'I want food.', slug: 'iwantfood' },
  { text: 'I want a drink.', slug: 'iwantadrink' },
  { text: 'I want to play.', slug: 'iwanttoplay' },
  { text: 'Go somewhere.', slug: 'gosomewhere' },
  { text: 'How I feel.', slug: 'howifeel' },
  { text: 'I need a break.', slug: 'ineedabreak' },
  { text: 'I want this.', slug: 'iwantthis' },
  { text: 'I need help.', slug: 'ineedhelp' },
  { text: 'Please stop.', slug: 'pleasestop' },

  // Missing Individual Core Words
  { text: 'Food.', slug: 'food' },
  { text: 'This.', slug: 'this' },
  { text: 'A.', slug: 'a' },
  { text: 'To.', slug: 'to' },

  // Sensory Loudness
  { text: 'It is too loud.', slug: 'itistooloud' },
  { text: 'Too loud.', slug: 'tooloud' },
];

async function generateAudio(text, geminiVoice, desc) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const payload = {
    model: 'gemini-3.8-flash-tts',
    input: [{
      type: 'user_input',
      content: [{
        type: 'text',
        text,
        annotations: [{
          type: 'speech_metadata',
          style: `monotonous, flat pitch, completely even-toned, clinical AAC assistive communication, matter-of-fact, calm, brisk and steady pace, direct pronunciation without pitch swings, without melodic variation, without emotional inflection, without excitement or drama, ${desc}`
        }]
      }]
    }],
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice: geminiVoice }]
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 100)}`);
  }

  const data = await res.json();
  const base64 = data?.steps?.[0]?.content?.[0]?.data ||
                 data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
                 data?.output_audio?.data;

  if (!base64) {
    throw new Error('No audio data in response');
  }

  return Buffer.from(base64, 'base64');
}

async function run() {
  console.log('Generating brisk, monotonous AAC audio assets...');

  const mainPersona = PERSONAS[0]; // Puck (Default child voice)
  for (const item of ITEMS_TO_GENERATE) {
    const targetFile = path.join(CORE_DIR, `${mainPersona.id}_${item.slug}.wav`);
    if (fs.existsSync(targetFile)) {
      console.log(`[Already Exists] ${mainPersona.id}_${item.slug}.wav`);
      continue;
    }

    let success = false;
    for (let attempt = 1; attempt <= 4 && !success; attempt++) {
      try {
        const rawBuf = await generateAudio(item.text, mainPersona.geminiVoice, mainPersona.desc);
        const cleaned = cleanRiffWav(rawBuf);
        fs.writeFileSync(targetFile, cleaned);
        console.log(`  Saved ${targetFile} (${(cleaned.length / 1024).toFixed(1)} KB)`);
        success = true;
      } catch (err) {
        console.warn(`  Attempt ${attempt} failed for ${mainPersona.id} ${item.slug}:`, err.message);
        if (err.message.includes('429')) {
          console.log('  Waiting 7s for rate limit window...');
          await new Promise(r => setTimeout(r, 7000));
        } else {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    // Pacing to stay within quota
    await new Promise(r => setTimeout(r, 3500));
  }

  // Ensure other personas have pre-bundled files by copying Puck's audio if not present
  for (const p of ['fenrir', 'kore']) {
    for (const item of ITEMS_TO_GENERATE) {
      const personaFile = path.join(CORE_DIR, `${p}_${item.slug}.wav`);
      const puckFile = path.join(CORE_DIR, `puck_${item.slug}.wav`);
      if (!fs.existsSync(personaFile) && fs.existsSync(puckFile)) {
        fs.copyFileSync(puckFile, personaFile);
        console.log(`  Mirrored to ${p}_${item.slug}.wav`);
      }
    }
  }

  // Copy all assets to dist, android, ios if they exist
  const targets = [
    path.join(process.cwd(), 'dist', 'assets', 'audio', 'core'),
    path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'audio', 'core'),
    path.join(process.cwd(), 'ios', 'App', 'App', 'public', 'assets', 'audio', 'core')
  ];

  for (const target of targets) {
    if (fs.existsSync(path.dirname(target))) {
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      const files = fs.readdirSync(CORE_DIR);
      for (const f of files) {
        fs.copyFileSync(path.join(CORE_DIR, f), path.join(target, f));
      }
      console.log(`Synced ${files.length} audio files to ${target}`);
    }
  }

  console.log('Finished bundling sensory audio assets successfully.');
}

run().catch(console.error);
