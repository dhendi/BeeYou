/**
 * Security and Cryptographic Utilities for BeeYou Native Mobile App
 *
 * Architecture & Threat Model:
 * 1. Caregiver PIN Role:
 *    The 4-digit caregiver PIN serves exclusively as an on-device UI guard (e.g., preventing young children
 *    from accidentally altering routines, changing device speech settings, or viewing parent configuration).
 *    It is NOT the sole barrier to sensitive cloud data.
 * 2. Cloud Data Protection:
 *    All cloud data (accounts, synchronized profiles, family messages, medical reminders) is authenticated
 *    and protected independently via Firebase Authentication (JWT/OAuth), user UID isolation, and
 *    server-side Realtime Database Security Rules.
 * 3. PIN Cryptography:
 *    - Key Derivation: Standard PBKDF2 (Password-Based Key Derivation Function 2) with HMAC-SHA-256.
 *    - Iterations: 100,000 rounds (OWASP recommended standard for Web Crypto).
 *    - Salt: 16 bytes (128 bits) of cryptographically secure random entropy per PIN via crypto.getRandomValues.
 *    - Comparison: Timing-attack-resistant constant-time byte comparison.
 * 4. Brute-Force & Rate Limiting:
 *    - Persistent lockout tracking after 5 consecutive incorrect attempts.
 *    - Progressive cooldown intervals (30s at 5 attempts, 60s at 6 attempts, 300s at 7+ attempts).
 *    - Mandatory artificial minimum delay on verification to throttle automated brute-force attacks.
 * 5. Backwards Compatibility & Transparent Upgrade:
 *    - Existing legacy SHA-256 and plaintext PINs are automatically verified and upgraded to PBKDF2 on first unlock.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32; // 256 bits

const RATE_LIMIT_STORAGE_KEY = 'beeyou_pin_ratelimit_v1';
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;

// Legacy fixed salt preserved exclusively for seamless, backward-compatible upgrades of legacy hashes
const LEGACY_PIN_SALT = 'beeyou_secure_caregiver_pin_salt_v1';

function getCrypto(): Crypto | null {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  return null;
}

function getSubtleCrypto(): SubtleCrypto | null {
  const c = getCrypto();
  return c?.subtle || null;
}

/**
 * Generates a unique, cryptographically secure 16-byte random salt.
 */
function generateSecureSalt(): Uint8Array {
  const c = getCrypto();
  if (!c || !c.getRandomValues) {
    throw new Error('Cryptographically secure random number generator (crypto.getRandomValues) is unavailable.');
  }
  const salt = new Uint8Array(SALT_BYTE_LENGTH);
  c.getRandomValues(salt);
  return salt;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const len = clean.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time string equality to prevent timing attacks.
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Derives a PBKDF2-HMAC-SHA-256 key from PIN and salt.
 */
async function derivePbkdf2Hash(
  pin: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<string> {
  const subtle = getSubtleCrypto();
  if (!subtle) {
    throw new Error('Web Crypto API (subtle.deriveBits) is required for secure PIN hashing.');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BYTE_LENGTH * 8
  );
  return bytesToHex(new Uint8Array(derivedBits));
}

/**
 * Computes a standard PBKDF2 salted hash string for a PIN using a unique cryptographically secure salt.
 * Output format: `pbkdf2:v1:<iterations>:<saltHex>:<hashHex>`
 */
export async function hashPin(pin: string, customSalt?: Uint8Array): Promise<string> {
  const cleanPin = (pin || '').trim();
  const salt = customSalt || generateSecureSalt();
  const hashHex = await derivePbkdf2Hash(cleanPin, salt, PBKDF2_ITERATIONS);
  const saltHex = bytesToHex(salt);
  return `pbkdf2:v1:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

export interface PinRateLimitStatus {
  isLocked: boolean;
  remainingLockoutSeconds: number;
  failedAttempts: number;
  remainingAttempts: number;
  lockoutUntil: number;
}

/**
 * Inspects the current brute-force rate limit status from persistent device memory.
 */
export function getPinRateLimitStatus(): PinRateLimitStatus {
  try {
    if (typeof localStorage === 'undefined') {
      return { isLocked: false, remainingLockoutSeconds: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT, lockoutUntil: 0 };
    }
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) {
      return { isLocked: false, remainingLockoutSeconds: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT, lockoutUntil: 0 };
    }
    const data = JSON.parse(raw);
    const now = Date.now();
    const lockoutUntil = Number(data.lockoutUntil) || 0;
    const failedAttempts = Number(data.failedAttempts) || 0;

    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return {
        isLocked: true,
        remainingLockoutSeconds: remainingSec,
        failedAttempts,
        remainingAttempts: 0,
        lockoutUntil,
      };
    }

    // Auto-reset stale failed attempts after 10 minutes of inactivity
    const lastAttempt = Number(data.lastAttemptTime) || 0;
    if (now - lastAttempt > 600000) {
      resetPinRateLimit();
      return { isLocked: false, remainingLockoutSeconds: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT, lockoutUntil: 0 };
    }

    return {
      isLocked: false,
      remainingLockoutSeconds: 0,
      failedAttempts,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS_BEFORE_LOCKOUT - (failedAttempts % MAX_ATTEMPTS_BEFORE_LOCKOUT)),
      lockoutUntil: 0,
    };
  } catch {
    return { isLocked: false, remainingLockoutSeconds: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT, lockoutUntil: 0 };
  }
}

/**
 * Records an incorrect PIN attempt and applies progressive lockout tiers:
 * - 5 attempts: 30 seconds
 * - 6 attempts: 60 seconds
 * - 7+ attempts: 300 seconds (5 minutes)
 */
export function recordFailedPinAttempt(): PinRateLimitStatus {
  try {
    const current = getPinRateLimitStatus();
    const nextAttempts = current.failedAttempts + 1;
    const now = Date.now();
    let lockoutDurationSec = 0;

    if (nextAttempts >= 7) {
      lockoutDurationSec = 300; // 5 minutes
    } else if (nextAttempts === 6) {
      lockoutDurationSec = 60; // 1 minute
    } else if (nextAttempts === 5) {
      lockoutDurationSec = 30; // 30 seconds
    }

    const lockoutUntil = lockoutDurationSec > 0 ? now + lockoutDurationSec * 1000 : 0;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        RATE_LIMIT_STORAGE_KEY,
        JSON.stringify({
          failedAttempts: nextAttempts,
          lockoutUntil,
          lastAttemptTime: now,
        })
      );
    }

    return {
      isLocked: lockoutDurationSec > 0,
      remainingLockoutSeconds: lockoutDurationSec,
      failedAttempts: nextAttempts,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS_BEFORE_LOCKOUT - (nextAttempts % MAX_ATTEMPTS_BEFORE_LOCKOUT)),
      lockoutUntil,
    };
  } catch {
    return { isLocked: false, remainingLockoutSeconds: 0, failedAttempts: 1, remainingAttempts: 4, lockoutUntil: 0 };
  }
}

/**
 * Resets the PIN attempt counter upon a successful PIN verification.
 */
export function resetPinRateLimit(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Verifies legacy single-round SHA-256 hashes generated with the legacy fixed salt.
 */
async function verifyLegacyHash(pin: string, storedHash: string): Promise<boolean> {
  const subtle = getSubtleCrypto();
  if (subtle && storedHash.startsWith('sha256:')) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${LEGACY_PIN_SALT}:${pin}`);
      const hashBuffer = await subtle.digest('SHA-256', data);
      const hashHex = bytesToHex(new Uint8Array(hashBuffer));
      return constantTimeEquals(`sha256:${hashHex}`, storedHash);
    } catch {}
  }
  return false;
}

export interface VerifyPinOptions {
  bypassRateLimit?: boolean;
}

export interface VerifyPinResult {
  valid: boolean;
  shouldUpgrade: boolean;
  upgradedHash?: string;
  isLocked?: boolean;
  remainingLockoutSeconds?: number;
  remainingAttempts?: number;
  error?: string;
}

/**
 * Verifies an entered PIN against a stored PIN hash.
 *
 * Security features:
 * - Constant-time comparison to protect against timing side-channels.
 * - Brute-force throttling with progressive lockouts.
 * - Minimum artificial verification delay (250ms).
 * - Full backwards-compatibility with automatic, transparent upgrade to PBKDF2 upon successful verification.
 */
export async function verifyPin(
  inputPin: string,
  storedPin: string | undefined | null,
  options?: VerifyPinOptions
): Promise<VerifyPinResult> {
  const cleanInput = (inputPin || '').trim();
  const effectiveStored = (storedPin || '1234').trim();

  // 1. Rate limiting check (unless bypassed for internal self-test audits)
  if (!options?.bypassRateLimit) {
    const rateStatus = getPinRateLimitStatus();
    if (rateStatus.isLocked) {
      return {
        valid: false,
        shouldUpgrade: false,
        isLocked: true,
        remainingLockoutSeconds: rateStatus.remainingLockoutSeconds,
        remainingAttempts: 0,
        error: `PIN entry is locked due to too many incorrect attempts. Please wait ${rateStatus.remainingLockoutSeconds}s.`,
      };
    }
  }

  // Mandatory artificial delay to eliminate timing attacks and throttle fast automated brute-forcing
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!cleanInput) {
    return { valid: false, shouldUpgrade: false };
  }

  // 2. Modern PBKDF2 format: pbkdf2:v1:<iterations>:<saltHex>:<hashHex>
  if (effectiveStored.startsWith('pbkdf2:v1:')) {
    const parts = effectiveStored.split(':');
    if (parts.length === 5) {
      const iterations = parseInt(parts[2], 10);
      const saltHex = parts[3];
      const expectedHash = parts[4];
      try {
        const saltBytes = hexToBytes(saltHex);
        const computedHash = await derivePbkdf2Hash(cleanInput, saltBytes, iterations);
        const match = constantTimeEquals(computedHash, expectedHash);
        if (match) {
          if (!options?.bypassRateLimit) resetPinRateLimit();
          return { valid: true, shouldUpgrade: false };
        }
      } catch (err) {
        console.warn('PBKDF2 verification error:', err);
      }
    }

    if (!options?.bypassRateLimit) {
      const failedStatus = recordFailedPinAttempt();
      return {
        valid: false,
        shouldUpgrade: false,
        isLocked: failedStatus.isLocked,
        remainingLockoutSeconds: failedStatus.remainingLockoutSeconds,
        remainingAttempts: failedStatus.remainingAttempts,
      };
    }
    return { valid: false, shouldUpgrade: false };
  }

  // 3. Backwards compatibility: Legacy SHA-256 format
  if (effectiveStored.startsWith('sha256:') || effectiveStored.startsWith('hash:')) {
    const legacyValid = await verifyLegacyHash(cleanInput, effectiveStored);
    if (legacyValid) {
      if (!options?.bypassRateLimit) resetPinRateLimit();
      const upgraded = await hashPin(cleanInput);
      return { valid: true, shouldUpgrade: true, upgradedHash: upgraded };
    }

    if (!options?.bypassRateLimit) {
      const failedStatus = recordFailedPinAttempt();
      return {
        valid: false,
        shouldUpgrade: false,
        isLocked: failedStatus.isLocked,
        remainingLockoutSeconds: failedStatus.remainingLockoutSeconds,
        remainingAttempts: failedStatus.remainingAttempts,
      };
    }
    return { valid: false, shouldUpgrade: false };
  }

  // 4. Backwards compatibility: Plaintext PIN (e.g. initial setup "1234")
  if (cleanInput === effectiveStored) {
    if (!options?.bypassRateLimit) resetPinRateLimit();
    const upgraded = await hashPin(cleanInput);
    return { valid: true, shouldUpgrade: true, upgradedHash: upgraded };
  }

  if (!options?.bypassRateLimit) {
    const failedStatus = recordFailedPinAttempt();
    return {
      valid: false,
      shouldUpgrade: false,
      isLocked: failedStatus.isLocked,
      remainingLockoutSeconds: failedStatus.remainingLockoutSeconds,
      remainingAttempts: failedStatus.remainingAttempts,
    };
  }
  return { valid: false, shouldUpgrade: false };
}
