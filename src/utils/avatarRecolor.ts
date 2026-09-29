/**
 * avatarRecolor.ts — Real-time Palette Swapping Engine for Themed Emotion Icons
 *
 * Dynamically recolors 16-bit pixel art emotion sprites so that characters
 * reflect the child's own skin tone, ethnicity (e.g. 1. White, 2. Black, 3. Asian, 4. Hispanic),
 * and hair color (e.g. blonde, red, black, brown).
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
  // Default baseline sprites are warm peach skin (#fed7aa / #fcd34d) with dark brown hair (#451a03 / #78350f)
  const isDefaultSkin = !skinHex || skinHex === '#fcd34d' || skinHex === '#fed7aa';
  const isDefaultHair = !hairHex || hairHex === '#451a03' || hairHex === '#78350f';
  return isDefaultSkin && isDefaultHair;
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
  // If baseline default or running server-side, return original URL
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return src;
  }
  if (!targetSkinHex && !targetHairHex) {
    return src;
  }
  if (isDefaultPalette(targetSkinHex, targetHairHex)) {
    return src;
  }

  const cacheKey = `${src}__${targetSkinHex || 'def'}__${targetHairHex || 'def'}`;
  const cached = recolorCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const targetSkinRgb = hexToRgb(targetSkinHex || '#fcd34d');
  const targetHairRgb = hexToRgb(targetHairHex || '#451a03');

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
        const totalPixels = data.length;

        const baseSkinLum = 252 * 0.299 + 196 * 0.587 + 154 * 0.114; // ~ 208
        const baseHairLum = 108 * 0.299 + 56 * 0.587 + 42 * 0.114;   // ~ 70

        for (let i = 0; i < totalPixels; i += 4) {
          const a = data[i + 3];
          if (a === 0) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Exclude extreme colors (teeth/eyes white, dark outlines)
          if (r > 245 && g > 245 && b > 245) continue;
          if (r < 25 && g < 25 && b < 25) continue;

          // Exclude green hoodie
          if (g > r + 15 && g > b + 15) continue;
          // Exclude blue ocean/space
          if (b > r + 20 && b > g + 15) continue;
          // Exclude dino yellow/gold spikes (r > 180, g > 130, b < 70)
          if (r > 180 && g > 130 && b < 70) continue;
          // Exclude pink tongue / inner mouth (r > 180, g < 110, b < 130)
          if (r > 180 && g < 110 && b < 130) continue;

          // 1. Detect skin pixels (warm tones with R > G > B and high lightness)
          if (r > 165 && g > 115 && b > 70 && r > g && r - b >= 25) {
            const curLum = r * 0.299 + g * 0.587 + b * 0.114;
            const ratio = curLum / baseSkinLum;
            data[i] = Math.min(255, Math.round(targetSkinRgb[0] * ratio));
            data[i + 1] = Math.min(255, Math.round(targetSkinRgb[1] * ratio));
            data[i + 2] = Math.min(255, Math.round(targetSkinRgb[2] * ratio));
            continue;
          }

          // 2. Detect hair pixels (medium to dark brown / slate-brown / dark chestnut)
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          if (maxVal <= 165 && minVal >= 25 && (r >= b || maxVal - minVal <= 35)) {
            const curLum = r * 0.299 + g * 0.587 + b * 0.114;
            const factor = Math.min(1.4, Math.max(0.6, curLum / 75));
            data[i] = Math.min(255, Math.round(targetHairRgb[0] * factor));
            data[i + 1] = Math.min(255, Math.round(targetHairRgb[1] * factor));
            data[i + 2] = Math.min(255, Math.round(targetHairRgb[2] * factor));
            continue;
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
