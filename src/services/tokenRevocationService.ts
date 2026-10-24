/**
 * BeeYou Authoritative Shared Token Revocation Service
 *
 * Provides production-grade token revocation tracking across multiple backend instances,
 * ephemeral serverless deployments, and server restarts using Cloud Firestore
 * as the authoritative, shared backend datastore with local fast-path caching.
 *
 * Tracks:
 * 1. Individual token revocation (by token string or unique JTI ID) with expiration timestamps.
 * 2. User-level revocation (invalidates all credentials issued to a user before revocation timestamp).
 * 3. Family-level revocation (invalidates all credentials for a family upon deletion or unlinking).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  verifyFirestoreConfig,
  getFirestoreAuthHeader,
  FirestoreSyncError,
  SyncOptions,
} from './firestoreSyncService';

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

const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'beeyou-23d7d';
const DATA_DIR = path.resolve('.data');
const REVOCATION_FILE = path.join(DATA_DIR, 'revoked_tokens.json');

// In-memory caches for fast-path O(1) positive revocation lookup
const memoryRevokedTokens = new Map<string, RevokedTokenRecord>();
const memoryRevokedUsers = new Map<string, { revokedAt: number; reason?: string }>();
const memoryRevokedFamilies = new Map<string, { revokedAt: number; reason?: string }>();

let isInitialized = false;

/**
 * Computes deterministic SHA-256 hash for document IDs in Firestore
 * to guarantee valid document paths and protect token signatures from leakage.
 */
export function hashTokenIdentifier(tokenOrJti: string): string {
  return crypto.createHash('sha256').update(tokenOrJti.trim()).digest('hex');
}

/**
 * Extracts JTI from a signed family token (by_tok) if available.
 */
export function extractJtiFromToken(token: string): string | undefined {
  if (!token || !token.startsWith('by_tok.')) return undefined;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
      if (payload?.jti && typeof payload.jti === 'string') {
        return payload.jti.trim();
      }
    }
  } catch {}
  return undefined;
}

/**
 * Initializes the local revocation cache from disk if available.
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
    isInitialized = true;
  }
}

/**
 * Persists current in-memory revocation records to local disk atomically as a local replica.
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
    // In serverless / read-only disk environments, disk save warning is non-fatal if datastore write succeeded
  }
}

/**
 * Executes an atomic batch commit to Cloud Firestore for revocation updates.
 * Throws FirestoreSyncError on non-2xx responses or network failures.
 */
async function executeFirestoreCommit(writes: any[], options?: SyncOptions): Promise<void> {
  const config = verifyFirestoreConfig();
  if (!config.configured && !options?.customAuthHeader && !options?.customHost) {
    if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_FIRESTORE_SYNC === 'true') {
      throw new FirestoreSyncError(
        'Cloud Firestore service account credentials are required in production for revocation',
        500,
        false
      );
    }
    return;
  }

  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  const baseHost = options?.customHost
    || (emulatorHost ? `http://${emulatorHost}` : 'https://firestore.googleapis.com');
  const url = `${baseHost}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;

  const authHeader = await getFirestoreAuthHeader(options);
  const maxRetries = options?.maxRetries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 6000;
  const fetchFn = options?.customFetch ?? fetch;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ writes }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorDetail = '';
        try {
          const json = await res.json();
          errorDetail = json?.error?.message || JSON.stringify(json);
        } catch {
          errorDetail = await res.text().catch(() => '');
        }

        const isTransient = res.status >= 500 || res.status === 429;
        const syncError = new FirestoreSyncError(
          `Firestore revocation write failed with status ${res.status}: ${errorDetail || res.statusText}`,
          res.status,
          isTransient
        );

        if (!isTransient) {
          throw syncError;
        }
        lastError = syncError;
      } else {
        return; // Success
      }
    } catch (err: any) {
      if (err instanceof FirestoreSyncError && !err.isTransient) {
        throw err;
      }

      if (err?.name === 'AbortError') {
        lastError = new FirestoreSyncError(`Firestore revocation write timed out after ${timeoutMs}ms`, 504, true);
      } else if (err instanceof FirestoreSyncError) {
        lastError = err;
      } else {
        lastError = new FirestoreSyncError(
          `Firestore network interruption during revocation write: ${err?.message || 'connection failed'}`,
          502,
          true
        );
      }
    } finally {
      clearTimeout(timer);
    }

    if (attempt < maxRetries) {
      const delayMs = 150 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new FirestoreSyncError('Firestore revocation write failed after retries', 500, false);
}

/**
 * Parses real production Firestore REST documents:batchGet streamed response bodies.
 *
 * In production Google Cloud Firestore REST API, documents:batchGet streams BatchGetDocumentsResponse
 * chunks. When consumed over HTTP/1.1 or HTTP/2, this arrives as:
 * 1. Newline-delimited JSON (NDJSON): each line is a JSON object {"found": ...} or {"missing": ...}
 * 2. Concatenated JSON objects: {"found": ...}{"missing": ...}
 * 3. JSON array format (used by emulator or JSON proxy buffers): [{"found": ...}, {"missing": ...}]
 * 4. Single JSON object (when a single document is requested)
 *
 * Fails closed: throws FirestoreSyncError if the response is empty, truncated, malformed,
 * or represents an unexpected format, preventing unverified tokens from being treated as valid.
 */
export function parseFirestoreBatchGetResponse(rawText: string, requestedDocsCount = 0): any[] {
  if (typeof rawText !== 'string') {
    throw new FirestoreSyncError('Invalid Firestore batchGet response type', 502, true);
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    if (requestedDocsCount > 0) {
      throw new FirestoreSyncError('Firestore batchGet returned empty response for requested documents', 502, true);
    }
    return [];
  }

  // Strategy 1: Attempt direct JSON.parse for JSON array or single object format
  try {
    const direct = JSON.parse(trimmed);
    if (Array.isArray(direct)) {
      for (const item of direct) {
        validateBatchGetItem(item);
      }
      return direct;
    } else if (direct && typeof direct === 'object') {
      validateBatchGetItem(direct);
      return [direct];
    }
  } catch (err: any) {
    if (err instanceof FirestoreSyncError) throw err;
    // Direct parse failed (streamed NDJSON or concatenated JSON objects) - proceed to streaming scanner
  }

  // Strategy 2: Robust streaming scanner for multiple JSON objects (NDJSON / concatenated JSON)
  const items: any[] = [];
  let i = 0;
  const len = trimmed.length;

  while (i < len) {
    // Skip whitespace, newlines, commas, and array framing characters
    while (i < len && (
      trimmed[i] === ' ' ||
      trimmed[i] === '\t' ||
      trimmed[i] === '\n' ||
      trimmed[i] === '\r' ||
      trimmed[i] === ',' ||
      trimmed[i] === '[' ||
      trimmed[i] === ']'
    )) {
      i++;
    }
    if (i >= len) break;

    if (trimmed[i] === '{') {
      const start = i;
      let depth = 0;
      let inString = false;
      let escaped = false;

      while (i < len) {
        const char = trimmed[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === '"') {
            inString = false;
          }
        } else {
          if (char === '"') {
            inString = true;
          } else if (char === '{') {
            depth++;
          } else if (char === '}') {
            depth--;
            if (depth === 0) {
              i++;
              break;
            }
          }
        }
        i++;
      }

      if (depth !== 0) {
        throw new FirestoreSyncError('Truncated or incomplete JSON object in Firestore batchGet stream', 502, true);
      }

      const jsonStr = trimmed.slice(start, i);
      let parsedObj: any;
      try {
        parsedObj = JSON.parse(jsonStr);
      } catch (jsonErr: any) {
        throw new FirestoreSyncError(`Malformed JSON object in Firestore batchGet stream: ${jsonErr?.message}`, 502, true);
      }

      validateBatchGetItem(parsedObj);
      items.push(parsedObj);
    } else {
      // Encountered non-whitespace, non-bracket, non-brace character (e.g. HTML error page or junk)
      const preview = trimmed.slice(i, i + 50);
      throw new FirestoreSyncError(`Unexpected character in Firestore batchGet stream: "${preview}"`, 502, true);
    }
  }

  if (items.length === 0 && requestedDocsCount > 0) {
    throw new FirestoreSyncError('Firestore batchGet stream contained no valid document responses', 502, true);
  }

  return items;
}

function validateBatchGetItem(item: any): void {
  if (!item || typeof item !== 'object') {
    throw new FirestoreSyncError('Invalid item in Firestore batchGet response: expected object', 502, true);
  }

  if (item.error) {
    const code = typeof item.error.code === 'number' ? item.error.code : 502;
    const msg = item.error.message || JSON.stringify(item.error);
    throw new FirestoreSyncError(`Firestore batchGet item reported error (${code}): ${msg}`, code, code >= 500);
  }

  // A valid BatchGetDocumentsResponse item MUST have found, missing, readTime, or transaction
  const isValidFormat = 'found' in item || 'missing' in item || 'readTime' in item || 'transaction' in item;
  if (!isValidFormat) {
    throw new FirestoreSyncError(
      `Unexpected response format in Firestore batchGet: missing found/missing/readTime fields (${JSON.stringify(item).slice(0, 100)})`,
      502,
      true
    );
  }
}

/**
 * Performs a batch document lookup against Cloud Firestore.
 * Throws FirestoreSyncError on non-2xx responses or network failures.
 */
async function executeFirestoreBatchGet(documents: string[], options?: SyncOptions): Promise<any[]> {
  if (!documents || documents.length === 0) {
    return [];
  }

  const config = verifyFirestoreConfig();
  if (!config.configured && !options?.customAuthHeader && !options?.customHost) {
    return [];
  }

  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  const baseHost = options?.customHost
    || (emulatorHost ? `http://${emulatorHost}` : 'https://firestore.googleapis.com');
  const url = `${baseHost}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:batchGet`;

  const authHeader = await getFirestoreAuthHeader(options);
  const timeoutMs = options?.timeoutMs ?? 5000;
  const fetchFn = options?.customFetch ?? fetch;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let rawText = '';
  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ documents }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let errorDetail = '';
      try {
        const json = await res.json();
        errorDetail = json?.error?.message || JSON.stringify(json);
      } catch {
        errorDetail = await res.text().catch(() => '');
      }
      throw new FirestoreSyncError(
        `Firestore batchGet failed with status ${res.status}: ${errorDetail || res.statusText}`,
        res.status,
        res.status >= 500
      );
    }

    rawText = await res.text();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new FirestoreSyncError(`Firestore batchGet timed out after ${timeoutMs}ms`, 504, true);
    }
    if (err instanceof FirestoreSyncError) {
      throw err;
    }
    throw new FirestoreSyncError(`Firestore batchGet network error: ${err?.message || 'failed'}`, 502, true);
  } finally {
    clearTimeout(timer);
  }

  return parseFirestoreBatchGetResponse(rawText, documents.length);
}

/**
 * Authoritatively revokes an individual token in the shared Cloud Firestore datastore
 * and local cache.
 * Throws FirestoreSyncError if the authoritative write fails.
 */
export async function revokeToken(
  tokenOrJti: string,
  expiresAt?: number,
  reason = 'manual_revocation',
  options?: SyncOptions
): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!tokenOrJti || typeof tokenOrJti !== 'string') return;

  const id = tokenOrJti.trim();
  const now = Date.now();
  const record: RevokedTokenRecord = {
    revokedAt: now,
    expiresAt,
    reason,
  };

  const tokenHash = hashTokenIdentifier(id);
  const jti = extractJtiFromToken(id);
  const jtiHash = jti ? hashTokenIdentifier(jti) : undefined;

  // 1. Authoritative write to shared Cloud Firestore datastore
  const config = verifyFirestoreConfig();
  if (config.configured || options?.customAuthHeader || options?.customHost) {
    const writes: any[] = [
      {
        update: {
          name: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/beeyou_revoked_tokens/${tokenHash}`,
          fields: {
            tokenHash: { stringValue: tokenHash },
            revokedAt: { integerValue: String(now) },
            reason: { stringValue: reason },
            ...(expiresAt ? { expiresAt: { integerValue: String(expiresAt) } } : {}),
          },
        },
      },
    ];

    if (jtiHash && jtiHash !== tokenHash) {
      writes.push({
        update: {
          name: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/beeyou_revoked_tokens/${jtiHash}`,
          fields: {
            tokenHash: { stringValue: jtiHash },
            jti: { stringValue: jti || '' },
            revokedAt: { integerValue: String(now) },
            reason: { stringValue: reason },
            ...(expiresAt ? { expiresAt: { integerValue: String(expiresAt) } } : {}),
          },
        },
      });
    }

    await executeFirestoreCommit(writes, options);
  }

  // 2. Update local memory indexes
  memoryRevokedTokens.set(id, record);
  memoryRevokedTokens.set(tokenHash, record);
  if (jti) {
    memoryRevokedTokens.set(jti, record);
    if (jtiHash) memoryRevokedTokens.set(jtiHash, record);
  }

  // 3. Persist local replica
  await saveRevocationStore();
}

/**
 * Authoritatively revokes all tokens issued to a specific user UID prior to this moment.
 * Throws FirestoreSyncError if the authoritative write fails.
 */
export async function revokeUserTokens(
  uid: string,
  reason = 'user_revoked',
  options?: SyncOptions
): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!uid || typeof uid !== 'string') return;

  const cleanUid = uid.trim();
  const now = Date.now();

  // 1. Authoritative write to shared Cloud Firestore datastore
  const config = verifyFirestoreConfig();
  if (config.configured || options?.customAuthHeader || options?.customHost) {
    const safeUidDocId = encodeURIComponent(cleanUid);
    const writes = [
      {
        update: {
          name: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/beeyou_revoked_users/${safeUidDocId}`,
          fields: {
            uid: { stringValue: cleanUid },
            revokedAt: { integerValue: String(now) },
            reason: { stringValue: reason },
          },
        },
      },
    ];

    await executeFirestoreCommit(writes, options);
  }

  // 2. Update local memory index
  memoryRevokedUsers.set(cleanUid, {
    revokedAt: now,
    reason,
  });

  // 3. Persist local replica
  await saveRevocationStore();
}

/**
 * Authoritatively revokes all tokens issued to a family code prior to this moment.
 * Throws FirestoreSyncError if the authoritative write fails.
 */
export async function revokeFamilyTokens(
  familyCode: string,
  reason = 'family_revoked',
  options?: SyncOptions
): Promise<void> {
  if (!isInitialized) initTokenRevocationStore();
  if (!familyCode || typeof familyCode !== 'string') return;

  const cleanCode = familyCode.trim().toUpperCase();
  const now = Date.now();

  // Reviewer Demo Account is strictly memory-only; skip cloud writes
  if (cleanCode === 'BEE-DEMO') {
    memoryRevokedFamilies.set(cleanCode, { revokedAt: now, reason });
    return;
  }

  // 1. Authoritative write to shared Cloud Firestore datastore
  const config = verifyFirestoreConfig();
  if (config.configured || options?.customAuthHeader || options?.customHost) {
    const safeFamDocId = encodeURIComponent(cleanCode);
    const writes = [
      {
        update: {
          name: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/beeyou_revoked_families/${safeFamDocId}`,
          fields: {
            familyCode: { stringValue: cleanCode },
            revokedAt: { integerValue: String(now) },
            reason: { stringValue: reason },
          },
        },
      },
    ];

    await executeFirestoreCommit(writes, options);
  }

  // 2. Update local memory index
  memoryRevokedFamilies.set(cleanCode, {
    revokedAt: now,
    reason,
  });

  // 3. Persist local replica
  await saveRevocationStore();
}

/**
 * Checks whether a token or its associated identity has been authoritatively revoked.
 * Evaluates in-memory cache first, then checks Cloud Firestore for cross-instance consistency.
 *
 * Fails closed (throws on datastore outage) so revoked tokens cannot slip through.
 */
export async function isTokenRevoked(
  token: string,
  payload?: { jti?: string; uid?: string; familyCode?: string; iat?: number },
  options?: SyncOptions
): Promise<boolean> {
  if (!isInitialized) initTokenRevocationStore();
  if (!token) return true;

  const trimmed = token.trim();
  const tokenHash = hashTokenIdentifier(trimmed);

  // 1. Fast in-memory positive revocation check (already proven revoked)
  if (memoryRevokedTokens.has(trimmed) || memoryRevokedTokens.has(tokenHash)) {
    return true;
  }

  const effectiveJti = payload?.jti || extractJtiFromToken(trimmed);
  if (effectiveJti) {
    const jtiHash = hashTokenIdentifier(effectiveJti);
    if (memoryRevokedTokens.has(effectiveJti) || memoryRevokedTokens.has(jtiHash)) {
      return true;
    }
  }

  if (payload?.uid) {
    const userRev = memoryRevokedUsers.get(payload.uid.trim());
    if (userRev) {
      if (!payload.iat || payload.iat <= userRev.revokedAt) {
        return true;
      }
    }
  }

  const familyCode = (payload?.familyCode || '').trim().toUpperCase();
  if (familyCode) {
    const famRev = memoryRevokedFamilies.get(familyCode);
    if (famRev) {
      if (!payload || !payload.iat || payload.iat <= famRev.revokedAt) {
        return true;
      }
    }
  }

  // App Store / Google Play reviewer demo tokens are memory-only sandbox
  if (trimmed === 'by_demo_reviewer_token_2026' || trimmed === 'DEMO-APPSTORE-REVIEWER-2026' || familyCode === 'BEE-DEMO') {
    return false;
  }

  // 2. Query authoritative shared Firestore datastore for cross-instance verification
  const config = verifyFirestoreConfig();
  if (config.configured || options?.customAuthHeader || options?.customHost) {
    const docsToCheck: string[] = [];
    const basePath = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
    docsToCheck.push(`${basePath}/beeyou_revoked_tokens/${tokenHash}`);

    if (effectiveJti) {
      const jtiHash = hashTokenIdentifier(effectiveJti);
      if (jtiHash !== tokenHash) {
        docsToCheck.push(`${basePath}/beeyou_revoked_tokens/${jtiHash}`);
      }
    }

    if (payload?.uid) {
      docsToCheck.push(`${basePath}/beeyou_revoked_users/${encodeURIComponent(payload.uid.trim())}`);
    }

    if (familyCode && familyCode !== 'BEE-DEMO') {
      docsToCheck.push(`${basePath}/beeyou_revoked_families/${encodeURIComponent(familyCode)}`);
    }

    // Authoritative lookup: Must fail closed.
    // If the lookup fails, times out, is malformed, or datastore is unavailable,
    // throw FirestoreSyncError so production authorization fails closed.
    const results = await executeFirestoreBatchGet(docsToCheck, options);
    for (const item of results) {
      if (item.found) {
        const docName = String(item.found.name || '');

        if (docName.includes('/beeyou_revoked_tokens/')) {
          const rec: RevokedTokenRecord = {
            revokedAt: Number(item.found.fields?.revokedAt?.integerValue || Date.now()),
            expiresAt: item.found.fields?.expiresAt?.integerValue ? Number(item.found.fields.expiresAt.integerValue) : undefined,
            reason: item.found.fields?.reason?.stringValue,
          };
          memoryRevokedTokens.set(tokenHash, rec);
          memoryRevokedTokens.set(trimmed, rec);
          return true;
        }

        if (docName.includes('/beeyou_revoked_users/')) {
          const userRevAt = Number(item.found.fields?.revokedAt?.integerValue || 0);
          const userReason = item.found.fields?.reason?.stringValue;
          if (payload?.uid) {
            memoryRevokedUsers.set(payload.uid.trim(), { revokedAt: userRevAt, reason: userReason });
          }
          if (!payload?.iat || payload.iat <= userRevAt) {
            return true;
          }
        }

        if (docName.includes('/beeyou_revoked_families/')) {
          const famRevAt = Number(item.found.fields?.revokedAt?.integerValue || 0);
          const famReason = item.found.fields?.reason?.stringValue;
          if (familyCode) {
            memoryRevokedFamilies.set(familyCode, { revokedAt: famRevAt, reason: famReason });
          }
          if (!payload?.iat || payload.iat <= famRevAt) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Synchronous in-memory check for positive revocation (fast-path).
 */
export function isTokenRevokedSync(
  token: string,
  payload?: { jti?: string; uid?: string; familyCode?: string; iat?: number }
): boolean {
  if (!isInitialized) initTokenRevocationStore();
  if (!token) return true;

  const trimmed = token.trim();
  const tokenHash = hashTokenIdentifier(trimmed);

  if (memoryRevokedTokens.has(trimmed) || memoryRevokedTokens.has(tokenHash)) {
    return true;
  }

  const effectiveJti = payload?.jti || extractJtiFromToken(trimmed);
  if (effectiveJti) {
    const jtiHash = hashTokenIdentifier(effectiveJti);
    if (memoryRevokedTokens.has(effectiveJti) || memoryRevokedTokens.has(jtiHash)) {
      return true;
    }
  }

  if (payload?.uid) {
    const userRev = memoryRevokedUsers.get(payload.uid.trim());
    if (userRev) {
      if (!payload.iat || payload.iat <= userRev.revokedAt) {
        return true;
      }
    }
  }

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
 * Test helper to reset local revocation store and memory caches.
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
 * Returns current count of active in-memory cached revocations.
 */
export function getRevocationStats(): { tokenCount: number; userCount: number; familyCount: number } {
  if (!isInitialized) initTokenRevocationStore();
  return {
    tokenCount: memoryRevokedTokens.size,
    userCount: memoryRevokedUsers.size,
    familyCount: memoryRevokedFamilies.size,
  };
}

// Auto-initialize local cache on module load
initTokenRevocationStore();
