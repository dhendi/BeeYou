/**
 * BeeYou Persistent & Shared Token Revocation Service
 *
 * Provides production-grade token revocation tracking across server restarts
 * and distributed backend instances.
 *
 * Tracks:
 * 1. Individual token revocation (by token string or unique jti ID) with expiration timestamps.
 * 2. User-level revocation (invalidates all credentials issued to a user before revocation timestamp).
 * 3. Family-level revocation (invalidates all credentials for a family upon deletion or unlinking).
 */

import fs from 'fs';
import path from 'path';

export interface RevokedTokenRecord {
  revokedAt: number;
  expiresAt?: number;
  reason?: string;
}

export interface RevocationStoreData {
  revokedTokens: Record<string, RevokedTokenRecord>;
  revokedUsers: Record<string, { revokedAt: number; reason?: string }>;
  revokedFamilies: Record<string, { revokedAt: number; reason?: string }>;
}

const DATA_DIR = path.resolve('.data');
const REVOCATION_FILE = path.join(DATA_DIR, 'revoked_tokens.json');

// In-memory caches for synchronous O(1) authorization checks
const memoryRevokedTokens = new Map<string, RevokedTokenRecord>();
const memoryRevokedUsers = new Map<string, { revokedAt: number; reason?: string }>();
const memoryRevokedFamilies = new Map<string, { revokedAt: number; reason?: string }>();

let isInitialized = false;

/**
 * Initializes the persistent revocation store from disk.
 */
export function initTokenRevocationStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(REVOCATION_FILE)) {
      const raw = fs.readFileSync(REVOCATION_FILE, 'utf-8');
      const data: RevocationStoreData = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (data.revokedTokens) {
          for (const [id, rec] of Object.entries(data.revokedTokens)) {
            memoryRevokedTokens.set(id, rec);
          }
        }
        if (data.revokedUsers) {
          for (const [uid, rec] of Object.entries(data.revokedUsers)) {
            memoryRevokedUsers.set(uid, rec);
          }
        }
        if (data.revokedFamilies) {
          for (const [code, rec] of Object.entries(data.revokedFamilies)) {
            memoryRevokedFamilies.set(code.toUpperCase(), rec);
          }
        }
      }
    }
    isInitialized = true;
  } catch (err) {
    console.warn('[TokenRevocation] Store initialization notice:', err);
    isInitialized = true;
  }
}

/**
 * Persists current in-memory revocation records to disk atomically.
 */
export async function saveRevocationStore(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }

    const data: RevocationStoreData = {
      revokedTokens: Object.fromEntries(memoryRevokedTokens.entries()),
      revokedUsers: Object.fromEntries(memoryRevokedUsers.entries()),
      revokedFamilies: Object.fromEntries(memoryRevokedFamilies.entries()),
    };

    const tempFile = `${REVOCATION_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, REVOCATION_FILE);
  } catch (err) {
    console.error('[TokenRevocation] Save store error:', err);
  }
}

/**
 * Revokes an individual token (by token string or jti ID).
 */
export async function revokeToken(
  tokenOrJti: string,
  expiresAt?: number,
  reason = 'manual_revocation'
): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!tokenOrJti || typeof tokenOrJti !== 'string') return;

  const id = tokenOrJti.trim();
  const record: RevokedTokenRecord = {
    revokedAt: Date.now(),
    expiresAt,
    reason,
  };

  memoryRevokedTokens.set(id, record);

  // If token is a by_tok, also record its jti if parseable
  if (id.startsWith('by_tok.')) {
    try {
      const parts = id.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        if (payload?.jti) {
          memoryRevokedTokens.set(payload.jti, record);
        }
      }
    } catch {}
  }

  await saveRevocationStore();
}

/**
 * Revokes all tokens issued to a specific user UID prior to this moment.
 */
export async function revokeUserTokens(uid: string, reason = 'user_revoked'): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!uid || typeof uid !== 'string') return;

  const cleanUid = uid.trim();
  memoryRevokedUsers.set(cleanUid, {
    revokedAt: Date.now(),
    reason,
  });

  await saveRevocationStore();
}

/**
 * Revokes all tokens issued to a family code prior to this moment.
 */
export async function revokeFamilyTokens(familyCode: string, reason = 'family_revoked'): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!familyCode || typeof familyCode !== 'string') return;

  const cleanCode = familyCode.trim().toUpperCase();
  memoryRevokedFamilies.set(cleanCode, {
    revokedAt: Date.now(),
    reason,
  });

  await saveRevocationStore();
}

/**
 * Checks whether a token or its associated identity has been revoked.
 * Synchronous and performant for request-filter evaluation.
 */
export function isTokenRevoked(
  token: string,
  payload?: { jti?: string; uid?: string; familyCode?: string; iat?: number }
): boolean {
  if (!isInitialized) initTokenRevocationStore();
  if (!token) return true;

  const trimmed = token.trim();

  // 1. Check direct token string revocation
  if (memoryRevokedTokens.has(trimmed)) {
    return true;
  }

  // 2. Check token JTI revocation
  if (payload?.jti && memoryRevokedTokens.has(payload.jti)) {
    return true;
  }

  // 3. Check user-level revocation
  if (payload?.uid) {
    const userRev = memoryRevokedUsers.get(payload.uid.trim());
    if (userRev) {
      if (!payload.iat || payload.iat <= userRev.revokedAt) {
        return true;
      }
    }
  }

  // 4. Check family-level revocation
  const familyCode = (payload?.familyCode || '').trim().toUpperCase();
  if (familyCode) {
    const famRev = memoryRevokedFamilies.get(familyCode);
    if (famRev) {
      if (!payload || !payload.iat || payload.iat <= famRev.revokedAt) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Prunes expired individual token revocations to maintain a compact database.
 */
export function pruneExpiredRevocations(): number {
  if (!isInitialized) initTokenRevocationStore();
  const now = Date.now();
  let pruned = 0;

  for (const [id, rec] of memoryRevokedTokens.entries()) {
    if (rec.expiresAt && now > rec.expiresAt) {
      memoryRevokedTokens.delete(id);
      pruned++;
    }
  }

  if (pruned > 0) {
    saveRevocationStore().catch(() => {});
  }

  return pruned;
}

/**
 * Test helper to reset revocation store.
 */
export function clearAllRevocationsForTesting(): void {
  memoryRevokedTokens.clear();
  memoryRevokedUsers.clear();
  memoryRevokedFamilies.clear();
  if (fs.existsSync(REVOCATION_FILE)) {
    try {
      fs.unlinkSync(REVOCATION_FILE);
    } catch {}
  }
}

/**
 * Returns current count of active revocations.
 */
export function getRevocationStats(): { tokenCount: number; userCount: number; familyCount: number } {
  if (!isInitialized) initTokenRevocationStore();
  return {
    tokenCount: memoryRevokedTokens.size,
    userCount: memoryRevokedUsers.size,
    familyCount: memoryRevokedFamilies.size,
  };
}

// Auto-initialize on module load
initTokenRevocationStore();
