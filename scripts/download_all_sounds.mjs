import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const soundDir = path.resolve(__dirname, '../public/sounds');

if (!fs.existsSync(soundDir)) {
  fs.mkdirSync(soundDir, { recursive: true });
}

const sounds = [
  // 17 Soundscapes
  { id: 'rain', filename: 'rain.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/rain/heavy-rain.mp3' },
  { id: 'ocean', filename: 'ocean.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/waves.mp3' },
  { id: 'brown_noise', filename: 'brown_noise.wav', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/noise/brown-noise.wav' },
  { id: 'white_noise', filename: 'white_noise.wav', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/noise/white-noise.wav' },
  { id: 'stream', filename: 'stream.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/river.mp3' },
  { id: 'crickets', filename: 'crickets.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/animals/crickets.mp3' },
  { id: 'space_drone', filename: 'space_drone.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/things/singing-bowl.mp3' },
  { id: 'wind_chimes', filename: 'wind_chimes.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/things/wind-chimes.mp3' },
  { id: 'train_chug', filename: 'train_chug.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/transport/train.mp3' },
  { id: 'train_tracks', filename: 'train_tracks.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/transport/inside-a-train.mp3' },
  { id: 'driving', filename: 'driving.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/urban/highway.mp3' },
  { id: 'city', filename: 'city.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/urban/busy-street.mp3' },
  { id: 'night_time', filename: 'night_time.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/places/night-village.mp3' },
  { id: 'beach', filename: 'beach.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/waves.mp3' },
  { id: 'forest', filename: 'forest.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/wind-in-trees.mp3' },
  { id: 'fireplace', filename: 'fireplace.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/nature/campfire.mp3' },
  { id: 'medieval_tavern', filename: 'medieval_tavern.mp3', url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Minstrel%20Guild.mp3' },

  // UI Sound Effects & Chimes
  { id: 'tap', filename: 'tap.mp3', url: 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/audio/SoundEffects/menu_select.mp3' },
  { id: 'speak', filename: 'speak.mp3', url: 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/audio/SoundEffects/menu_switch.mp3' },
  { id: 'star', filename: 'star.mp3', url: 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/audio/SoundEffects/p-ping.mp3' },
  { id: 'complete', filename: 'complete.wav', url: 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/audio/SoundEffects/pickup.wav' },

  // Pet sounds
  { id: 'puppy', filename: 'puppy.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/animals/dog-barking.mp3' },
  { id: 'kitten', filename: 'kitten.mp3', url: 'https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/animals/cat-purring.mp3' }
];

async function downloadFile(item) {
  const dest = path.join(soundDir, item.filename);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[Already exists] ${item.filename} (${fs.statSync(dest).size} bytes)`);
    return;
  }
  console.log(`Downloading ${item.filename} from ${item.url}...`);
  try {
    const res = await fetch(item.url, { headers: { 'User-Agent': 'LuminaAAC-Downloader/1.0' } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`[Saved] ${item.filename} (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`[Error] Failed to download ${item.filename}:`, err.message);
  }
}

async function main() {
  console.log(`Downloading ${sounds.length} authentic sound files to ${soundDir}...`);
  for (const item of sounds) {
    await downloadFile(item);
  }
  console.log('Finished downloading audio files!');
}

main();
