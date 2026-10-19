/**
 * Security and Cryptographic Utilities for BeeYou Native Mobile App
 * Provides salt-hashed PIN storage and verification using the native Web Crypto API.
 */

const PIN_SALT = 'beeyou_secure_caregiver_pin_salt_v1';

/**
 * Computes a salted SHA-256 hash string for a 4-digit PIN.
 * Uses window.crypto.subtle (supported natively across all modern iOS and Android WebViews).
 */
export async function hashPin(pin: string): Promise<string> {
  const cleanPin = (pin || '').trim();
  const subtleCrypto =
    (typeof window !== 'undefined' ? window.crypto?.subtle : undefined) ||
    (typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined);

  if (subtleCrypto) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${PIN_SALT}:${cleanPin}`);
      const hashBuffer = await subtleCrypto.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    } catch (e) {
      console.warn('Web Crypto subtle digest fallback:', e);
    }
  }

  // Deterministic fallback hashing for environments where subtle crypto is unavailable
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = `${PIN_SALT}:${cleanPin}`;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `hash:${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}`;
}

/**
 * Verifies an entered PIN against a stored PIN.
 * Fully backwards compatible: handles both hashed PINs (sha256:..., hash:...) and legacy plaintext PINs (e.g. "1234").
 * If the stored PIN was legacy plaintext, signals `shouldUpgrade: true` so the caller can transparently hash it.
 */
export async function verifyPin(
  inputPin: string,
  storedPin: string | undefined | null
): Promise<{ valid: boolean; shouldUpgrade: boolean; upgradedHash?: string }> {
  const cleanInput = (inputPin || '').trim();
  const effectiveStored = (storedPin || '1234').trim();

  if (!cleanInput) {
    return { valid: false, shouldUpgrade: false };
  }

  // 1. If stored PIN is already hashed
  if (effectiveStored.startsWith('sha256:') || effectiveStored.startsWith('hash:')) {
    const computed = await hashPin(cleanInput);
    return { valid: computed === effectiveStored, shouldUpgrade: false };
  }

  // 2. Legacy plaintext comparison (e.g. "1234")
  if (cleanInput === effectiveStored) {
    const upgraded = await hashPin(cleanInput);
    return { valid: true, shouldUpgrade: true, upgradedHash: upgraded };
  }

  return { valid: false, shouldUpgrade: false };
}
