const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure /public exists
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create clean SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="50%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#F59E0B" />
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#luminaGrad)" />
  <circle cx="256" cy="256" r="140" fill="url(#sunGlow)" />
  <!-- Sparkles / Star motif -->
  <path d="M256 140 L268 220 L348 232 L268 244 L256 324 L244 244 L164 232 L244 220 Z" fill="#FFFFFF" opacity="0.95" />
  <!-- Friendly eyes and smile -->
  <circle cx="216" cy="250" r="14" fill="#4B2C05" />
  <circle cx="296" cy="250" r="14" fill="#4B2C05" />
  <path d="M226 285 Q256 315 286 285" stroke="#4B2C05" stroke-width="10" stroke-linecap="round" fill="none" />
  <!-- Cheeks -->
  <circle cx="196" cy="275" r="10" fill="#F43F5E" opacity="0.4" />
  <circle cx="316" cy="275" r="10" fill="#F43F5E" opacity="0.4" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Function to generate raw PNG with CRC32
function createPng(width, height, isMaskable = false) {
  // Simple PNG encoder
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Deflate
  ihdrData.writeUInt8(0, 11); // Filter 0
  ihdrData.writeUInt8(0, 12); // Interlace 0

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height rows, each starting with filter byte 0, then width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const centerX = width / 2;
  const centerY = height / 2;
  const sunRadius = width * (isMaskable ? 0.22 : 0.28);
  const cornerRadius = isMaskable ? 0 : width * 0.24;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient (Indigo -> Purple -> Rose)
      const gradT = (x + y) / (width + height);
      let r = Math.round(79 + gradT * (236 - 79));
      let g = Math.round(70 + gradT * (72 - 70));
      let b = Math.round(229 + gradT * (153 - 229));
      let a = 255;

      // Outer rounded rect corner check if not maskable
      if (!isMaskable) {
        const ax = Math.abs(dx) - (centerX - cornerRadius);
        const ay = Math.abs(dy) - (centerY - cornerRadius);
        if (ax > 0 && ay > 0) {
          const cornerDist = Math.sqrt(ax * ax + ay * ay);
          if (cornerDist > cornerRadius) {
            a = 0; // transparent outside rounded corner
          }
        }
      }

      if (a > 0) {
        // Sun circle in center
        if (dist <= sunRadius) {
          const sunT = dist / sunRadius;
          r = Math.round(253 * (1 - sunT) + 245 * sunT);
          g = Math.round(224 * (1 - sunT) + 158 * sunT);
          b = Math.round(71 * (1 - sunT) + 11 * sunT);

          // Star/sparkle center
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          const starThreshold = sunRadius * 0.7;
          if (absDx < width * 0.04 && absDy < starThreshold) {
            r = 255; g = 255; b = 255;
          } else if (absDy < height * 0.04 && absDx < starThreshold) {
            r = 255; g = 255; b = 255;
          }

          // Eyes
          const eyeDistL = Math.sqrt((x - (centerX - width * 0.08)) ** 2 + (y - (centerY - height * 0.01)) ** 2);
          const eyeDistR = Math.sqrt((x - (centerX + width * 0.08)) ** 2 + (y - (centerY - height * 0.01)) ** 2);
          if (eyeDistL <= width * 0.025 || eyeDistR <= width * 0.025) {
            r = 75; g = 44; b = 5;
          }

          // Cheerful smile
          if (y > centerY + height * 0.04 && y < centerY + height * 0.09) {
            const smileArcY = (centerY + height * 0.05) + ((x - centerX) / (width * 0.08)) ** 2 * (height * 0.035);
            if (Math.abs(y - smileArcY) < width * 0.018 && Math.abs(x - centerX) < width * 0.075) {
              r = 75; g = 44; b = 5;
            }
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress data
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('Successfully generated PWA icons and SVG in /public');
