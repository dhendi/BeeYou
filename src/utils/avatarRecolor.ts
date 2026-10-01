/**
 * avatarRecolor.ts — High-Fidelity Real-time Palette Swapping Engine for Themed Emotion Icons
 *
 * Exclusively recolors character skin tones (face, forehead, cheeks, chin, neck,
 * ears, wrists, and hands across all 11 emotion poses) with rich, warm melanin
 * depth and natural highlights. Hair, costumes, and facial expressions remain authentic.
 */

const recolorCache = new Map<string, string>();

/** Query the memory cache synchronously for instant zero-flicker render */
export function getCachedRecoloredEmotionImage(
  src: string,
  targetSkinHex?: string,
  _targetHairHex?: string
): string | null {
  const shouldRecolorSkin = Boolean(targetSkinHex && targetSkinHex.toLowerCase() !== '#fed7aa');
  if (!shouldRecolorSkin) return src;
  const cacheKey = `${src}__skin_${targetSkinHex}`;
  return recolorCache.get(cacheKey) || null;
}

/** Helper to parse hex string into RGB tuple */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [252, 196, 154];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Check if current skin matches default baseline sprites */
export function isDefaultPalette(skinHex?: string, _hairHex?: string): boolean {
  if (!skinHex) return true;
  return skinHex.toLowerCase() === '#fed7aa';
}

/** Baseline luminance of default peach skin across Lumina sprites */
const BASE_SKIN_LUM = 206.6; // 0.299 * 253 + 0.587 * 194 + 0.114 * 150

/**
 * Palette Swapping function:
 * Loads sprite on an offscreen canvas and transforms face skin and hands in < 2ms.
 */
export async function getRecoloredEmotionImage(
  src: string,
  targetSkinHex?: string,
  _targetHairHex?: string
): Promise<string> {
  // If running server-side, return original URL
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return src;
  }

  const shouldRecolorSkin = Boolean(
    targetSkinHex && targetSkinHex.toLowerCase() !== '#fed7aa'
  );

  // If skin matches default baseline, return original sprite directly
  if (!shouldRecolorSkin) {
    return src;
  }

  const cacheKey = `${src}__skin_${targetSkinHex}`;
  const cached = recolorCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const targetSkinRgb = hexToRgb(targetSkinHex!);

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;
        const w = img.width;
        const h = img.height;

        for (let y = 0; y < h; y++) {
          const rowOffset = y * w * 4;
          for (let x = 0; x < w; x++) {
            const i = rowOffset + x * 4;
            const a = data[i + 3];
            if (a < 25) continue;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 1. Real Pure Black Outlines, Hair Edges, Pupils (NEVER recolor!)
            if (Math.max(r, g, b) < 32) continue;

            const lum = r * 0.299 + g * 0.587 + b * 0.114;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);

            // 2. Teeth, Eye Whites, and White Drawstrings (NEVER recolor!)
            if (sat <= 16 && lum > 160) continue;

            // 3. Protected Outfits & Costumes (Across all 9 themes)
            // Green Hoodies & Outfits (Dinosaur, Frog, Turtle)
            if ((g > r + 4 && g > b + 8 && g > 45) || (g > 70 && g > r && g > b)) continue;

            // Yellow Horns / Spikes / Star Badges / Lion Body
            if (r > 160 && g > 120 && b < 80 && (r - b > 90) && (g - b > 50)) continue;

            // Lion Mane (Rich golden orange-brown)
            if ((x < 80 || x > 175 || y < 75 || y > 185) && (r > 130 && g > 65 && b < 60 && r - b >= 70)) continue;

            // Blue Water, Tears, Sweat Drops, Sailor & Ocean Suits
            if ((b > r + 15 && b > 100) || (b > g + 15 && b > 100)) continue;

            // Space Comms Pods & Cyan Visor
            if ((r > 60 && b > 90 && b > g + 25) || (g > 140 && b > 140 && r < 110)) continue;

            // Racing Red Suit & Helmet
            if (r > 130 && r > g + 40 && r > b + 40 && (y > 170 || x < 75 || x > 180 || y < 75)) continue;

            // Unicorn Pastel Hood (Fantasy)
            if (b > 115 && b > r + 15 && g > 110) continue;

            // Red Tongue & Dark Red Mouth Interior (NEVER recolor!)
            if (
              (r > 165 && g < 110 && b < 125 && r - g > 75 && r - b > 50) ||
              (r > 60 && g < 50 && b < 60 && r - g > 35)
            ) {
              continue;
            }

            // Authentic Dark Hair Interior (NEVER recolor!)
            if (lum <= 88 && r <= 120 && g <= 65 && b <= 55) continue;

            // Scared / Overwhelmed Blue Freezing Face Forehead
            if (b > 115 && b >= r - 15 && b >= g) continue;

            // 4. PRECISE SKIN TONE RECOLORING
            // Targets all skin pixels (face, forehead, cheeks, blush, chin, neck, hands, fingers, wrists)
            const isSkin =
              r >= 120 &&
              g >= 60 &&
              b >= 40 &&
              (r - b >= 15) &&
              (r - g <= 125) &&
              (b - g <= 30);

            if (isSkin) {
              const factor = lum / BASE_SKIN_LUM;
              let nr: number, ng: number, nb: number;

              if (factor >= 1.0) {
                // Natural soft highlight on forehead, nose, and cheekbones
                const delta = Math.min(1.0, Math.max(0.0, (factor - 1.0) / 0.22));
                nr = Math.min(255, Math.round(targetSkinRgb[0] + (255 - targetSkinRgb[0]) * 0.30 * delta));
                ng = Math.min(255, Math.round(targetSkinRgb[1] + (255 - targetSkinRgb[1]) * 0.25 * delta));
                nb = Math.min(255, Math.round(targetSkinRgb[2] + (255 - targetSkinRgb[2]) * 0.20 * delta));
              } else {
                // Soft depth and ambient shadow under chin, hair fringe, and fingers
                const shadowMult = Math.max(0.68, factor);
                nr = Math.min(255, Math.max(0, Math.round(targetSkinRgb[0] * shadowMult)));
                ng = Math.min(255, Math.max(0, Math.round(targetSkinRgb[1] * shadowMult)));
                nb = Math.min(255, Math.max(0, Math.round(targetSkinRgb[2] * shadowMult)));
              }

              data[i] = nr;
              data[i + 1] = ng;
              data[i + 2] = nb;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const recoloredUrl = canvas.toDataURL('image/png');
        recolorCache.set(cacheKey, recoloredUrl);
        resolve(recoloredUrl);
      } catch (e) {
        console.warn('Recolor failed, falling back to original image', e);
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(src);
    };

    img.src = src;
  });
}
