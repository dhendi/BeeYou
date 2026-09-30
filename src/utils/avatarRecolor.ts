/**
 * avatarRecolor.ts — High-Fidelity Real-time Palette Swapping Engine for Themed Emotion Icons
 *
 * Dynamically recolors 16-bit pixel art emotion sprites so that characters
 * reflect the child's chosen hair color and skin tone.
 *
 * Uses multi-tier pixel art shading ramps (Highlights, Midtones, Shadows)
 * with strict spatial & color protection for:
 * - Real black outlines & eye pupils (max < 32)
 * - Teeth & Eye whites (desaturated greys/whites)
 * - Green dinosaur hoodie (greens & fold shadows)
 * - Golden dorsal spikes (yellows/golds)
 * - Hoodie drawstrings & collar (mint/white)
 * - Mouth & Tongue (crimson interior & pink tongue)
 */

const recolorCache = new Map<string, string>();

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

/** Check if current skin and hair match default baseline sprites */
export function isDefaultPalette(skinHex?: string, hairHex?: string): boolean {
  if (!skinHex && !hairHex) return true;
  const isDefaultSkin = !skinHex || skinHex === '#fcd34d' || skinHex === '#fed7aa';
  const isDefaultHair = !hairHex || hairHex === '#451a03' || hairHex === '#78350f';
  return isDefaultSkin && isDefaultHair;
}

/**
 * 16-bit pixel art shading ramp generator
 * Generates natural highlights, midtones, and deep shadows based on luminance parameter t [0.0 .. 1.0]
 */
function makeRamp(baseRgb: [number, number, number], t: number): [number, number, number] {
  const [r, g, b] = baseRgb;
  if (t < 0.5) {
    // Shadow to midtone: deep, rich scaling
    const scale = 0.45 + 0.55 * (t / 0.5);
    return [
      Math.min(255, Math.round(r * scale)),
      Math.min(255, Math.round(g * scale)),
      Math.min(255, Math.round(b * scale)),
    ];
  } else {
    // Midtone to highlight: luminous highlight catch
    const frac = (t - 0.5) / 0.5;
    return [
      Math.min(255, Math.round(r + (255 - r) * 0.45 * frac)),
      Math.min(255, Math.round(g + (255 - g) * 0.45 * frac)),
      Math.min(255, Math.round(b + (255 - b) * 0.45 * frac)),
    ];
  }
}

/**
 * Palette Swapping function:
 * Loads sprite on an offscreen canvas and transforms face skin and hair pixels in < 2ms.
 */
export async function getRecoloredEmotionImage(
  src: string,
  targetSkinHex?: string,
  targetHairHex?: string
): Promise<string> {
  // If running server-side, return original URL
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return src;
  }

  const shouldRecolorSkin = Boolean(
    targetSkinHex && targetSkinHex !== '#fed7aa' && targetSkinHex !== '#fcd34d'
  );
  const shouldRecolorHair = Boolean(
    targetHairHex && targetHairHex !== '#451a03' && targetHairHex !== '#78350f'
  );

  // If neither skin nor hair needs custom palette swapping, return original sprite directly
  if (!shouldRecolorSkin && !shouldRecolorHair) {
    return src;
  }

  const cacheKey = `${src}__${shouldRecolorSkin ? targetSkinHex : 'def'}__${shouldRecolorHair ? targetHairHex : 'def'}`;
  const cached = recolorCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const targetSkinRgb = shouldRecolorSkin ? hexToRgb(targetSkinHex!) : null;
  const targetHairRgb = shouldRecolorHair ? hexToRgb(targetHairHex!) : null;

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
            if (a < 40) continue;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 1. Real Black Outlines & Pupils (NEVER recolor!)
            if (Math.max(r, g, b) < 32) continue;

            const lum = r * 0.299 + g * 0.587 + b * 0.114;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);

            // 2. Desaturated / Greys (Teeth, Eye whites, Eye corners, Outlines)
            if (sat <= 16 && (lum > 80 || Math.max(r, g, b) < 45)) continue;

            // 3. Green Hoodie & Ocean Blue (NEVER recolor!)
            if ((g > r + 10 && g > b + 10) || (g > 55 && g > r && g > b)) continue;
            if (b > r + 20 && b > g + 15 && b > 70) continue; // Ocean theme

            // 4. Golden Dinosaur Spikes (NEVER recolor!)
            const isSpike =
              (r > 160 && g > 110 && b < 95 && g - b >= 30) ||
              (x < 85 && y < 170 && r > 90 && g > 60 && b < 60 && g - b >= 15);
            if (isSpike) continue;

            // 5. Hoodie Drawstrings (NEVER recolor!)
            if (y > 170 && x >= 110 && x <= 170 && g > 150 && g > r) continue;

            // 6. Mouth & Tongue (NEVER recolor!)
            const isMouth =
              y > 135 &&
              x >= 115 &&
              x <= 165 &&
              ((r > 50 && g < 65 && b < 65 && r > g + 30 && r > b + 30) ||
                (r > 160 && g < 115 && b < 125 && r - g >= 75));
            if (isMouth) continue;

            // 7. Skin (Face opening or waving hand)
            if (shouldRecolorSkin && targetSkinRgb) {
              const isFaceSkinLoc = x >= 75 && x <= 195 && y >= 95 && y <= 185;
              const isHandSkinLoc = x >= 195 && x <= 252 && y >= 120 && y <= 185;
              const isCentralFace = x >= 105 && x <= 164 && y > 112 && y <= 185;
              const isSkinTone =
                r > 90 && g > 55 && b > 30 && r > g && g >= b && r - b >= 15 && r - g <= 85;

              if (
                (isFaceSkinLoc || isHandSkinLoc) &&
                (isSkinTone || (isCentralFace && r > 70 && g > 40))
              ) {
                const t = Math.min(1.0, Math.max(0.0, (lum - 90) / 130));
                const [nr, ng, nb] = makeRamp(targetSkinRgb, t);
                data[i] = nr;
                data[i + 1] = ng;
                data[i + 2] = nb;
                continue;
              }
            }

            // 8. Hair
            if (shouldRecolorHair && targetHairRgb) {
              const canBeHairLoc =
                (y <= 114 && x >= 75 && x <= 205) || (y <= 165 && (x < 105 || x > 164));
              const isHairTone =
                (r >= 35 &&
                  r <= 165 &&
                  g >= 15 &&
                  g <= 125 &&
                  b >= 10 &&
                  b <= 110 &&
                  (r - b >= 8 || r - g >= 8)) ||
                (r >= 32 && r <= 70 && g >= 22 && g <= 60 && b >= 40 && b <= 80); // cool tone variant
              if (canBeHairLoc && isHairTone) {
                const t = Math.min(1.0, Math.max(0.0, (lum - 32) / 85));
                const [nr, ng, nb] = makeRamp(targetHairRgb, t);
                data[i] = nr;
                data[i + 1] = ng;
                data[i + 2] = nb;
                continue;
              }
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
