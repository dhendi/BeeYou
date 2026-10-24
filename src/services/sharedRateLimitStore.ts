import fs from 'fs';
import path from 'path';
import type { Request, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import { getFirestoreAuthHeader } from './firestoreSyncService';

export interface RateLimitRecord {
  count: number;
  resetAt: number;
  createdAt: number;
  scope?: string;
}

export interface HitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
  key: string;
  scope: 'ip' | 'account' | 'pairing' | 'family' | 'global';
}

export interface RateLimitRule {
  scope: 'ip' | 'account' | 'pairing' | 'family' | 'global';
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator: (req: Request) => string | null | undefined;
  failClosed?: boolean;
}

export interface SharedRateLimitStoreOptions {
  customStoragePath?: string;
  customDbUrl?: string;
  customAuthHeader?: string;
  customFetch?: typeof fetch;
  disableRtdb?: boolean;
  timeoutMs?: number;
}

/**
 * Safely encodes rate limit keys for Firebase Realtime Database.
 * RTDB forbidden characters: . $ # [ ] / and control characters.
 */
export function encodeRtdbKey(key: string): string {
  if (!key) return 'empty';
  return key.replace(/[/.$#[\]]/g, (c) => `_${c.charCodeAt(0)}_`);
}

export function decodeRtdbKey(encoded: string): string {
  if (!encoded) return '';
  return encoded.replace(/_(\d+)_/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Computes integer seconds remaining until UTC midnight (for daily quota Retry-After).
 */
export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000));
}

/**
 * Checks if Firebase Realtime Database is configured via emulator, custom URL, or env variables.
 */
export function isRtdbConfigured(options?: { disableRtdb?: boolean; customDbUrl?: string }): boolean {
  if (options?.disableRtdb) return false;
  if (options?.customDbUrl) return true;
  if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) return true;
  if (
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    return true;
  }
  return false;
}

/**
 * Resolves full Firebase Realtime Database REST URL for a subpath.
 */
export function resolveRtdbUrl(subPath: string, customDbUrl?: string): string {
  const cleanPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  const emuHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
  const projectId =
    process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'beeyou-23d7d';

  if (customDbUrl) {
    const base = customDbUrl.replace(/\/+$/, '');
    if (base.includes('?')) {
      const [baseUrl, query] = base.split('?');
      return `${baseUrl}${cleanPath}?${query}`;
    }
    return `${base}${cleanPath}`;
  }

  if (emuHost) {
    const baseHost = emuHost.startsWith('http') ? emuHost : `http://${emuHost}`;
    return `${baseHost}${cleanPath}?ns=${projectId}-default-rtdb`;
  }

  const defaultDbUrl = (
    process.env.VITE_FIREBASE_DATABASE_URL ||
    `https://${projectId}-default-rtdb.firebaseio.com`
  ).replace(/\/+$/, '');
  if (defaultDbUrl.includes('?')) {
    const [baseUrl, query] = defaultDbUrl.split('?');
    return `${baseUrl}${cleanPath}?${query}`;
  }
  return `${defaultDbUrl}${cleanPath}`;
}

/**
 * Performs an authenticated fetch to Firebase Realtime Database with timeout.
 */
export async function fetchRtdbWithAuth(
  url: string,
  init: RequestInit,
  options?: {
    customAuthHeader?: string;
    customFetch?: typeof fetch;
    timeoutMs?: number;
  }
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 3000;
  const fetchFn = options?.customFetch || fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let authHeader = options?.customAuthHeader;
  if (!authHeader) {
    try {
      authHeader = await getFirestoreAuthHeader();
    } catch {}
  }

  const headers: Record<string, string> = {
    ...((init.headers as Record<string, string>) || {}),
  };
  if (authHeader && !headers['Authorization']) {
    headers['Authorization'] = authHeader;
  }

  try {
    return await fetchFn(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Shared Persistent Rate Limit Store
 *
 * Provides:
 * 1. Distributed Authoritative Counter Store: Uses Firebase Realtime Database (RTDB)
 *    with atomic optimistic concurrency control (ETags) for consistent counting across
 *    multiple backend instances.
 * 2. L1 In-Memory Lockout Cache: 0ms ultra-low latency rejections for clients that
 *    have already exhausted their quotas, shielding the database from brute-force floods.
 * 3. Fail-Closed Authentication Protection: Critical authentication, account, and pairing
 *    rules fail closed if the shared database is unreachable, preventing brute-force bypasses.
 * 4. Non-Blocking Async Local Persistence: Avoids event-loop blocking file writes.
 */
export class SharedRateLimitStore {
  private localRecords = new Map<string, RateLimitRecord>();
  private lockoutCache = new Map<string, RateLimitRecord>();
  private storagePath: string;
  private isDirty = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private options: SharedRateLimitStoreOptions;

  constructor(options?: string | SharedRateLimitStoreOptions) {
    if (typeof options === 'string') {
      this.options = { customStoragePath: options };
    } else {
      this.options = options || {};
    }

    const dataDir = path.join(process.cwd(), '.data');
    this.storagePath = this.options.customStoragePath || path.join(dataDir, 'rate_limits.json');
    this.initStore();
  }

  public isRtdbConfigured(): boolean {
    return isRtdbConfigured(this.options);
  }

  private resolveRtdbUrl(subPath: string): string {
    return resolveRtdbUrl(subPath, this.options.customDbUrl);
  }

  private async fetchRtdb(
    url: string,
    init: RequestInit,
    timeoutMs: number = 3000
  ): Promise<Response> {
    return fetchRtdbWithAuth(url, init, {
      customAuthHeader: this.options.customAuthHeader,
      customFetch: this.options.customFetch,
      timeoutMs,
    });
  }

  private initStore(): void {
    // Non-blocking asynchronous initial file read for fallback/offline cache
    fs.promises
      .readFile(this.storagePath, 'utf-8')
      .then((raw) => {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          const now = Date.now();
          for (const [key, val] of Object.entries(data)) {
            const rec = val as RateLimitRecord;
            if (
              rec &&
              typeof rec.count === 'number' &&
              typeof rec.resetAt === 'number' &&
              rec.resetAt > now
            ) {
              this.localRecords.set(key, rec);
            }
          }
        }
      })
      .catch(() => {});

    // Periodic cleanup of expired records every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.pruneExpired();
    }, 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  /**
   * Register a hit against a rate limit key.
   * Atomically increments the counter in the shared datastore or local fallback.
   */
  public async hit(
    key: string,
    maxRequests: number,
    windowMs: number,
    scope: HitResult['scope'] = 'global',
    hitOptions?: { failClosed?: boolean }
  ): Promise<HitResult> {
    const now = Date.now();

    // 1. L1 Fast Lockout Check: Instant rejection if client is already known to be blocked
    const cachedLockout = this.lockoutCache.get(key);
    if (cachedLockout && now < cachedLockout.resetAt) {
      const retryAfterSec = Math.max(1, Math.ceil((cachedLockout.resetAt - now) / 1000));
      return {
        allowed: false,
        count: cachedLockout.count,
        limit: maxRequests,
        remaining: 0,
        resetAt: cachedLockout.resetAt,
        retryAfterSec,
        key,
        scope,
      };
    } else if (cachedLockout && now >= cachedLockout.resetAt) {
      this.lockoutCache.delete(key);
    }

    // 2. Distributed Atomic Hit via Firebase Realtime Database
    if (this.isRtdbConfigured()) {
      try {
        return await this.atomicHitRtdb(key, maxRequests, windowMs, scope);
      } catch (dbErr: any) {
        const isAuthOrSensitive =
          hitOptions?.failClosed === true ||
          scope === 'account' ||
          scope === 'pairing' ||
          key.startsWith('auth:') ||
          key.startsWith('pairing:') ||
          key.startsWith('recovery:');

        if (isAuthOrSensitive) {
          console.error(
            `[RateLimitStore] Fail-closed triggered for sensitive key ${key} due to DB error:`,
            dbErr?.message || dbErr
          );
          const retryAfterSec = Math.max(1, Math.ceil(windowMs / 1000));
          return {
            allowed: false,
            count: maxRequests + 1,
            limit: maxRequests,
            remaining: 0,
            resetAt: now + windowMs,
            retryAfterSec,
            key,
            scope,
          };
        }

        // Non-critical scope fallback to local in-memory counter
        return this.fallbackLocalHit(key, maxRequests, windowMs, scope);
      }
    }

    // 3. In-Memory Atomic Fallback (when RTDB is disabled or offline)
    return this.fallbackLocalHit(key, maxRequests, windowMs, scope);
  }

  /**
   * Atomic optimistic concurrency control counter update via RTDB ETag conditional writes.
   */
  private async atomicHitRtdb(
    key: string,
    maxRequests: number,
    windowMs: number,
    scope: HitResult['scope']
  ): Promise<HitResult> {
    const safeKey = encodeRtdbKey(key);
    const url = this.resolveRtdbUrl(`/beeyou/rate_limits/${safeKey}.json`);
    const maxRetries = 6;
    const timeoutMs = this.options.timeoutMs ?? 4000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const getRes = await this.fetchRtdb(
        url,
        {
          method: 'GET',
          headers: { 'X-Firebase-ETag': 'true' },
        },
        timeoutMs
      );
      const etag = getRes.headers.get('etag');
      const now = Date.now();

      let existing: RateLimitRecord | null = null;
      if (getRes.ok && getRes.status !== 204) {
        const text = await getRes.text();
        if (text && text.trim() !== 'null') {
          try {
            existing = JSON.parse(text);
          } catch {}
        }
      }

      // If document exists, an ETag is mandatory for concurrency safety
      if (existing && !etag) {
        const backoffDelay = 20 * Math.pow(2, attempt) + Math.floor(Math.random() * 15);
        await new Promise((r) => setTimeout(r, backoffDelay));
        continue;
      }

      // Case A: Fresh key or expired window
      if (!existing || now >= existing.resetAt) {
        const newRecord: RateLimitRecord = {
          count: 1,
          resetAt: now + windowMs,
          createdAt: now,
          scope,
        };

        const putHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (etag) {
          putHeaders['if-match'] = etag;
        }

        const putRes = await this.fetchRtdb(
          url,
          {
            method: 'PUT',
            headers: putHeaders,
            body: JSON.stringify(newRecord),
          },
          timeoutMs
        );

        if (putRes.status === 412) {
          // Concurrency conflict: another server updated in the same millisecond; retry
          const backoffDelay = 20 * Math.pow(2, attempt) + Math.floor(Math.random() * 15);
          await new Promise((r) => setTimeout(r, backoffDelay));
          continue;
        }

        if (!putRes.ok) {
          throw new Error(`RTDB PUT failed with status ${putRes.status}`);
        }

        this.localRecords.set(key, newRecord);
        const remaining = Math.max(0, maxRequests - 1);
        const retryAfterSec = Math.max(1, Math.ceil((newRecord.resetAt - now) / 1000));
        return {
          allowed: 1 <= maxRequests,
          count: 1,
          limit: maxRequests,
          remaining,
          resetAt: newRecord.resetAt,
          retryAfterSec,
          key,
          scope,
        };
      }

      // Case B: Window is currently active
      if (existing.count >= maxRequests) {
        // Quota is already exhausted. Do NOT increment.
        this.lockoutCache.set(key, existing);
        const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        return {
          allowed: false,
          count: existing.count,
          limit: maxRequests,
          remaining: 0,
          resetAt: existing.resetAt,
          retryAfterSec,
          key,
          scope,
        };
      }

      // Quota slot is available: attempt atomic increment
      const updatedRecord: RateLimitRecord = {
        ...existing,
        count: existing.count + 1,
      };

      const putHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (etag) {
        putHeaders['if-match'] = etag;
      }

      const putRes = await this.fetchRtdb(
        url,
        {
          method: 'PUT',
          headers: putHeaders,
          body: JSON.stringify(updatedRecord),
        },
        timeoutMs
      );

      if (putRes.status === 412) {
        // Concurrency conflict: another server incremented concurrently; retry
        const backoffDelay = 20 * Math.pow(2, attempt) + Math.floor(Math.random() * 15);
        await new Promise((r) => setTimeout(r, backoffDelay));
        continue;
      }

      if (!putRes.ok) {
        throw new Error(`RTDB PUT failed with status ${putRes.status}`);
      }

      this.localRecords.set(key, updatedRecord);
      const remaining = Math.max(0, maxRequests - updatedRecord.count);
      const allowed = updatedRecord.count <= maxRequests;
      const retryAfterSec = Math.max(1, Math.ceil((updatedRecord.resetAt - now) / 1000));

      if (!allowed) {
        this.lockoutCache.set(key, updatedRecord);
      }

      return {
        allowed,
        count: updatedRecord.count,
        limit: maxRequests,
        remaining,
        resetAt: updatedRecord.resetAt,
        retryAfterSec,
        key,
        scope,
      };
    }

    throw new Error(`Exceeded max retries (${maxRetries}) during atomic rate limit hit for ${key}`);
  }

  /**
   * Fast in-memory counter update (used when offline or as local fallback).
   */
  private fallbackLocalHit(
    key: string,
    maxRequests: number,
    windowMs: number,
    scope: HitResult['scope']
  ): HitResult {
    const now = Date.now();
    let record = this.localRecords.get(key);

    if (!record || now >= record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs,
        createdAt: now,
        scope,
      };
      this.localRecords.set(key, record);
      this.markDirty();
    } else {
      if (record.count >= maxRequests) {
        this.lockoutCache.set(key, record);
        const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
        return {
          allowed: false,
          count: record.count,
          limit: maxRequests,
          remaining: 0,
          resetAt: record.resetAt,
          retryAfterSec,
          key,
          scope,
        };
      }
      record.count++;
      this.markDirty();
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    const allowed = record.count <= maxRequests;

    if (!allowed) {
      this.lockoutCache.set(key, record);
    }

    return {
      allowed,
      count: record.count,
      limit: maxRequests,
      remaining,
      resetAt: record.resetAt,
      retryAfterSec,
      key,
      scope,
    };
  }

  public async get(key: string): Promise<RateLimitRecord | null> {
    const now = Date.now();

    if (this.isRtdbConfigured()) {
      try {
        const safeKey = encodeRtdbKey(key);
        const url = this.resolveRtdbUrl(`/beeyou/rate_limits/${safeKey}.json`);
        const res = await this.fetchRtdb(url, { method: 'GET' }, 3000);
        if (res.ok && res.status !== 204) {
          const text = await res.text();
          if (text && text.trim() !== 'null') {
            const data: RateLimitRecord = JSON.parse(text);
            if (data && now < data.resetAt) {
              return data;
            }
          }
        }
        return null;
      } catch {}
    }

    const local = this.localRecords.get(key);
    if (!local) return null;
    if (now >= local.resetAt) {
      this.localRecords.delete(key);
      this.lockoutCache.delete(key);
      return null;
    }
    return { ...local };
  }

  public async reset(key: string): Promise<void> {
    this.localRecords.delete(key);
    this.lockoutCache.delete(key);
    this.markDirty();

    if (this.isRtdbConfigured()) {
      try {
        const safeKey = encodeRtdbKey(key);
        const url = this.resolveRtdbUrl(`/beeyou/rate_limits/${safeKey}.json`);
        await this.fetchRtdb(url, { method: 'DELETE' }, 3000);
      } catch {}
    }
  }

  public async clear(): Promise<void> {
    this.localRecords.clear();
    this.lockoutCache.clear();
    this.markDirty();

    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/rate_limits.json`);
        await this.fetchRtdb(url, { method: 'DELETE' }, 3000);
      } catch {}
    }
  }

  public async pruneExpired(): Promise<void> {
    const now = Date.now();
    let pruned = 0;
    for (const [key, record] of this.localRecords.entries()) {
      if (now >= record.resetAt) {
        this.localRecords.delete(key);
        this.lockoutCache.delete(key);
        pruned++;
      }
    }
    if (pruned > 0) {
      this.markDirty();
    }
  }

  private markDirty(): void {
    this.isDirty = true;
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushToDisk().catch(() => {});
      }, 1500); // 1.5-second debounce
      this.flushTimer.unref?.();
    }
  }

  public async flushToDisk(): Promise<void> {
    if (!this.isDirty) return;
    this.isDirty = false;

    try {
      const dir = path.dirname(this.storagePath);
      await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});

      const obj: Record<string, RateLimitRecord> = {};
      const now = Date.now();
      for (const [k, v] of this.localRecords.entries()) {
        if (v.resetAt > now) {
          obj[k] = v;
        }
      }

      const tempPath = `${this.storagePath}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(obj, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, this.storagePath);
    } catch (err) {
      this.isDirty = true;
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.localRecords.clear();
    this.lockoutCache.clear();
  }
}

// Global default singleton store
export const defaultRateLimitStore = new SharedRateLimitStore();

/**
 * Securely extracts client IP address respecting trusted reverse proxy configuration.
 * Discards arbitrary untrusted client headers (e.g. forged X-Forwarded-For or Client-IP).
 */
export function getClientIp(req: Request): string {
  // 1. If Express 'trust proxy' is configured, req.ip is computed safely from trusted proxy hops
  if (req.ip) {
    return cleanIp(req.ip);
  }

  // 2. Direct remote socket address fallback
  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    return cleanIp(socketIp);
  }

  return '127.0.0.1';
}

function cleanIp(ip: string): string {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();
  // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.slice(7);
  }
  // Standard IPv6 localhost
  if (cleaned === '::1') {
    return '127.0.0.1';
  }
  // Remove port if present (e.g. 192.168.1.1:54321 -> 192.168.1.1)
  if (cleaned.includes(':') && !cleaned.includes('::')) {
    const parts = cleaned.split(':');
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      cleaned = parts[0];
    }
  }
  return cleaned.trim();
}

/**
 * Create a composite rate limiter that enforces multiple hierarchical rules
 * (e.g., both IP-level anti-DDoS and per-account credential-stuffing protection).
 */
export function createCompositeRateLimiter(
  rules: RateLimitRule[],
  store: SharedRateLimitStore = defaultRateLimitStore
): RequestHandler {
  return async (req: Request, res: ExpressResponse, next: NextFunction) => {
    if (req.method === 'OPTIONS' || req.path === '/api/health') {
      return next();
    }

    let mostRestrictedResult: HitResult | null = null;
    let failedRule: RateLimitRule | null = null;

    for (const rule of rules) {
      const key = rule.keyGenerator(req);
      if (!key) continue;

      const result = await store.hit(key, rule.maxRequests, rule.windowMs, rule.scope, {
        failClosed: rule.failClosed,
      });

      // Track lowest remaining quota for HTTP headers
      if (!mostRestrictedResult || result.remaining < mostRestrictedResult.remaining) {
        mostRestrictedResult = result;
      }

      if (!result.allowed) {
        failedRule = rule;
        mostRestrictedResult = result;
        break;
      }
    }

    if (mostRestrictedResult) {
      res.setHeader('X-RateLimit-Limit', mostRestrictedResult.limit);
      res.setHeader('X-RateLimit-Remaining', mostRestrictedResult.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(mostRestrictedResult.resetAt / 1000));
    }

    if (failedRule && mostRestrictedResult && !mostRestrictedResult.allowed) {
      res.setHeader('Retry-After', mostRestrictedResult.retryAfterSec);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: failedRule.message,
        retryAfter: mostRestrictedResult.retryAfterSec,
        rateLimitScope: failedRule.scope,
      });
    }

    next();
  };
}

/**
 * Convenience helper to create a single-rule rate limiter.
 */
export function createSingleRateLimiter(
  options: {
    windowMs: number;
    maxRequests: number;
    message?: string;
    scope?: HitResult['scope'];
    keyGenerator?: (req: Request) => string;
    failClosed?: boolean;
  },
  store: SharedRateLimitStore = defaultRateLimitStore
): RequestHandler {
  const scope = options.scope || 'ip';
  const keyGen = options.keyGenerator || ((req: Request) => `${scope}:${getClientIp(req)}`);

  return createCompositeRateLimiter(
    [
      {
        scope,
        windowMs: options.windowMs,
        maxRequests: options.maxRequests,
        message: options.message || 'Rate limit exceeded. Please slow down requests.',
        keyGenerator: keyGen,
        failClosed: options.failClosed,
      },
    ],
    store
  );
}
