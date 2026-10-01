/**
 * avatarRecolor.ts — High-Fidelity Real-time Palette Swapping Engine for Themed Emotion Icons
 *
 * Exclusively recolors character skin tones (face, forehead, cheeks, chin, neck,
 * ears, wrists, and hands across all 11 emotion poses) with rich, warm melanin
 * depth and natural highlights. Hair remains authentic hand-drawn pixel art.
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
            if (a < 35) continue;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 1. Real Black Outlines, Brows, Hair & Pupils (NEVER recolor!)
            if (Math.max(r, g, b) < 36) continue;

            const lum = r * 0.299 + g * 0.587 + b * 0.114;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);

            // 2. Desaturated / Greys (Teeth, Eye whites, Eye corners)
            if (sat <= 18 && (lum > 175 || Math.max(r, g, b) < 45)) continue;

            // 3. Tears, Water & Sweat Drops (Cyan / Blue)
            if (b > 150 && b > r + 30 && b > g + 10) continue;

            // 4. Protected Outfits & Costumes (Across all 9 themes)
            // Green Hoodies & Outfits (Dinosaur, Frog, Turtle)
            if ((g > r + 8 && g > b + 10) || (g > 65 && g > r && g > b)) continue;

            // Ocean Navy & Train Conductor Overalls (Navy / Blue)
            if (b > r + 15 && b > g + 10 && b > 50) continue;

            // Space Comms Pods & Cyan Visor
            if (r > 60 && b > 90 && b > g + 25) continue;
            if (g > 140 && b > 140 && r < 110) continue;

            // Racing Red Suit & Helmet
            if (r > 130 && r > g + 40 && r > b + 40 && (y > 170 || x < 75 || x > 180 || y < 75)) continue;

            // Unicorn Pastel Hood (Fantasy)
            if (b > 115 && b > r + 15 && g > 110) continue;

            // Classic Lion Costume Protection:
            // - Lion Mane: Rich golden-orange/brown with high (r - b) and low blue (b < 65)
            const isLionMane =
              (x < 80 || x > 175 || y < 75 || y > 185) &&
              (r > 140 && g > 75 && b < 65 && r - b >= 75 && g - b >= 30);
            // - Lion Onesie Yellow Body:
            const isLionYellowBody = (r > 190 && g > 145 && b < 70 && r - b >= 120 && g - b >= 75);
            if (isLionMane || isLionYellowBody) continue;

            // Golden Dinosaur Spikes & Yellow Star Badges
            const isGoldenSpike = (r > 160 && g > 110 && b < 70 && g - b >= 30 && (x < 85 || y < 80));
            if (isGoldenSpike) continue;

            // Rainbow Badge on Chest (Red, Orange, Green, Blue, Purple)
            if (y >= 180 && y <= 245 && x >= 105 && x <= 155) {
              const isRainbowStripe =
                (r > 180 && g < 40 && b < 40) || // red
                (r > 200 && g > 100 && b < 40) || // orange
                (g > 150 && r < 100) || // green
                (b > 170 && r < 80) || // blue
                (r > 100 && b > 140 && g < 70); // purple
              if (isRainbowStripe) continue;
            }

            // Hoodie Drawstrings
            if (y > 170 && x >= 110 && x <= 170 && g > 140 && g > r) continue;

            // Mouth Interior & Tongue (NEVER recolor!)
            const isMouth =
              y > 125 &&
              x >= 100 &&
              x <= 165 &&
              ((r > 60 && g < 60 && b < 60 && r > g + 25 && r > b + 25) ||
                (r > 170 && g < 110 && b < 120 && r - g >= 70));
            if (isMouth) continue;

            // 5. CHARACTER SKIN TONE RECOLORING
            // Detects face opening, forehead, cheeks, chin, neck, ears, AND all hands
            // (waving, holding head, grabbing chin, clenched fists, scratching head)
            const isSkinLocation = (x >= 35 && x <= 225 && y >= 60 && y <= 245);
            const isSkinColor = (
              (r >= 130 && g >= 85 && b >= 55 && r > g && g >= b && r - b >= 18 && r - b <= 135 && r - g <= 75) ||
              (r >= 180 && g >= 130 && b >= 90 && r > g && g >= b) ||
              (r >= 110 && r <= 170 && g >= 65 && g <= 125 && b >= 45 && b <= 95 && r > g && g >= b) // shaded skin creases
            );

            if (isSkinLocation && isSkinColor) {
              // Compute relative luminance within original skin range [95 .. 245]
              const norm = Math.min(1.0, Math.max(0.0, (lum - 95) / 145));
              let nr: number, ng: number, nb: number;

              if (norm >= 0.60) {
                // Highlight: warm radiant glow that retains authentic skin undertone
                const delta = (norm - 0.60) / 0.40;
                nr = Math.min(255, Math.round(targetSkinRgb[0] + (255 - targetSkinRgb[0]) * 0.26 * delta));
                ng = Math.min(255, Math.round(targetSkinRgb[1] + (255 - targetSkinRgb[1]) * 0.22 * delta));
                nb = Math.min(255, Math.round(targetSkinRgb[2] + (255 - targetSkinRgb[2]) * 0.18 * delta));
              } else {
                // Shadow / Crease: rich, deep melanin depth (never grayish or chalky!)
                const shadowMult = 0.70 + 0.30 * (norm / 0.60);
                nr = Math.min(255, Math.max(0, Math.round(targetSkinRgb[0] * shadowMult)));
                ng = Math.min(255, Math.max(0, Math.round(targetSkinRgb[1] * shadowMult)));
                nb = Math.min(255, Math.max(0, Math.round(targetSkinRgb[2] * shadowMult)));
              }

              // Rosy blush on cheeks adapting to skin depth
              const isRosyCheek = (r > 200 && r - g > 50 && y >= 125 && y <= 165 && (x <= 118 || x >= 138));
              if (isRosyCheek) {
                if (targetSkinRgb[0] < 160) {
                  // Warm terracotta / berry on deep skin
                  nr = Math.min(255, nr + 35);
                  ng = Math.max(0, ng - 8);
                  nb = Math.max(0, nb - 4);
                } else if (targetSkinRgb[0] < 210) {
                  // Coral blush on medium skin
                  nr = Math.min(255, nr + 25);
                  ng = Math.max(0, ng - 15);
                  nb = Math.max(0, nb - 10);
                }
              }

              data[i] = nr;
              data[i + 1] = ng;
              data[i + 2] = nb;
              continue;
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
