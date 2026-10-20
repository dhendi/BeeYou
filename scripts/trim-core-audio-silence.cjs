const fs = require('fs');
const path = require('path');

const CORE_DIR = path.join(process.cwd(), 'public', 'assets', 'audio', 'core');

function trimSilence(buf) {
  if (!buf || buf.length < 44) return buf;
  if (buf.readUInt32BE(0) !== 0x52494646 || buf.readUInt32BE(8) !== 0x57415645) {
    return buf;
  }

  const sampleRate = buf.readUInt32LE(24);
  const numChannels = buf.readUInt16LE(22);
  const bitDepth = buf.readUInt16LE(34);

  let dataOffset = -1;
  let dataLen = 0;
  let offset = 12;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataLen = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }

  if (dataOffset === -1 || dataLen === 0) return buf;

  const numSamples = Math.floor(dataLen / 2);
  const threshold = 400; // -38 dB

  // Find start
  let startSample = 0;
  for (let i = 0; i < numSamples; i++) {
    if (Math.abs(buf.readInt16LE(dataOffset + i * 2)) > threshold) {
      startSample = Math.max(0, i - Math.round(sampleRate * 0.015)); // 15ms lead padding
      break;
    }
  }

  // Find end
  let endSample = numSamples;
  for (let i = numSamples - 1; i >= 0; i--) {
    if (Math.abs(buf.readInt16LE(dataOffset + i * 2)) > threshold) {
      endSample = Math.min(numSamples, i + Math.round(sampleRate * 0.025)); // 25ms trail padding
      break;
    }
  }

  if (startSample >= endSample || (startSample === 0 && endSample === numSamples)) {
    return buf; // Nothing to trim
  }

  const trimmedSampleCount = endSample - startSample;
  const trimmedByteLength = trimmedSampleCount * 2;

  // Build clean WAV
  const totalRiffSize = 36 + trimmedByteLength;
  const out = Buffer.alloc(44 + trimmedByteLength);

  out.write('RIFF', 0, 4, 'ascii');
  out.writeUInt32LE(totalRiffSize, 4);
  out.write('WAVE', 8, 4, 'ascii');

  out.write('fmt ', 12, 4, 'ascii');
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(numChannels, 22);
  out.writeUInt32LE(sampleRate, 24);
  out.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
  out.writeUInt16LE(numChannels * (bitDepth / 8), 32);
  out.writeUInt16LE(bitDepth, 34);

  out.write('data', 36, 4, 'ascii');
  out.writeUInt32LE(trimmedByteLength, 40);

  // Copy trimmed samples
  buf.copy(out, 44, dataOffset + startSample * 2, dataOffset + endSample * 2);

  // Smooth fade-in over first 5ms (120 samples at 24kHz)
  const fadeInSamples = Math.min(trimmedSampleCount, Math.round(sampleRate * 0.005));
  for (let i = 0; i < fadeInSamples; i++) {
    const val = out.readInt16LE(44 + i * 2);
    const gain = i / fadeInSamples;
    out.writeInt16LE(Math.round(val * gain), 44 + i * 2);
  }

  // Smooth fade-out over last 10ms (240 samples at 24kHz)
  const fadeOutSamples = Math.min(trimmedSampleCount, Math.round(sampleRate * 0.010));
  for (let i = 0; i < fadeOutSamples; i++) {
    const targetIdx = trimmedSampleCount - fadeOutSamples + i;
    const val = out.readInt16LE(44 + targetIdx * 2);
    const gain = 1 - (i / fadeOutSamples);
    out.writeInt16LE(Math.round(val * gain), 44 + targetIdx * 2);
  }

  return out;
}

function processDirectory() {
  const files = fs.readdirSync(CORE_DIR).filter(f => f.endsWith('.wav'));
  let totalSavedMs = 0;

  for (const f of files) {
    const p = path.join(CORE_DIR, f);
    const origBuf = fs.readFileSync(p);
    const origDuration = (origBuf.length - 44) / origBuf.readUInt32LE(28);

    const trimmed = trimSilence(origBuf);
    const trimmedDuration = (trimmed.length - 44) / trimmed.readUInt32LE(28);
    const cutSec = origDuration - trimmedDuration;

    if (cutSec > 0.05) {
      fs.writeFileSync(p, trimmed);
      totalSavedMs += cutSec * 1000;
      console.log(`Trimmed ${f}: ${origDuration.toFixed(2)}s -> ${trimmedDuration.toFixed(2)}s (-${(cutSec * 1000).toFixed(0)}ms dead air)`);
    }
  }

  console.log(`\nTotal dead air eliminated across ${files.length} core files: ${(totalSavedMs / 1000).toFixed(2)}s`);

  // Sync to dist, android, ios
  const targets = [
    path.join(process.cwd(), 'dist', 'assets', 'audio', 'core'),
    path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'audio', 'core'),
    path.join(process.cwd(), 'ios', 'App', 'App', 'public', 'assets', 'audio', 'core')
  ];

  for (const target of targets) {
    if (fs.existsSync(path.dirname(target))) {
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      for (const f of files) {
        fs.copyFileSync(path.join(CORE_DIR, f), path.join(target, f));
      }
      console.log(`Synced trimmed assets to ${target}`);
    }
  }
}

processDirectory();
