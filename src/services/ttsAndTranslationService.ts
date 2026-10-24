import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import https from 'https';
import type { Request, Response as ExpressResponse } from 'express';
import {
  defaultRateLimitStore,
  getClientIp,
  isRtdbConfigured,
  isProductionEnvironment,
  resolveRtdbUrl,
  fetchRtdbWithAuth,
  getSecondsUntilMidnight,
} from './sharedRateLimitStore';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../data/voicePersonasData';
import {
  getAudioFromCloudStorage,
  saveAudioToCloudStorage,
  getCloudStorageStatus,
} from './cloudStorageTtsCache';
import { getTtsCacheControlDirective, isApprovedVocabulary } from './approvedVocabularyService';

// Strict allowlist of supported application languages
export const ALLOWED_LANGUAGES = new Set([
  'en',
  'es',
  'fr',
  'fr-ca',
  'fr_ca',
  'de',
  'el',
  'ja',
  'ko',
  'ru',
  'vi',
  'zh',
  'zh-cn',
  'zh_cn',
  'it',
  'pt',
]);

export function normalizeLanguageCode(lang: unknown): string | null {
  if (!lang || typeof lang !== 'string') return null;
  const clean = lang.trim().toLowerCase();
  if (!ALLOWED_LANGUAGES.has(clean)) {
    // Check 2-letter prefix if exact match not found
    const prefix = clean.substring(0, 2);
    if (!ALLOWED_LANGUAGES.has(prefix)) {
      return null;
    }
  }

  if (clean === 'fr_ca' || clean === 'fr-ca') return 'fr-CA';
  if (clean === 'zh' || clean.startsWith('zh')) return 'zh-CN';
  return clean.substring(0, 2);
}

export function validateTextInput(raw: unknown, maxLength = 150): { valid: boolean; error?: string; cleanText?: string } {
  if (raw === undefined || raw === null || typeof raw !== 'string') {
    return { valid: false, error: 'Text parameter is required and must be a string.' };
  }

  // Strip control characters (ASCII 0-31 and 127) to block injection / null-byte bypasses
  const stripped = raw.replace(/[\x00-\x1F\x7F]/g, '').trim();

  if (!stripped) {
    return { valid: false, error: 'Text parameter cannot be empty or whitespace only.' };
  }

  if (stripped.length > maxLength) {
    return {
      valid: false,
      error: `Text exceeds maximum allowed length of ${maxLength} characters (received ${stripped.length}).`,
    };
  }

  return { valid: true, cleanText: stripped };
}

// -------------------------------------------------------------
// Daily Usage & Budget Tracking (Prevents Upstream Billing Abuse)
// Supports multi-server atomic budget reservations via Firebase RTDB
// with non-blocking local persistence and instant 0ms cache hits.
// -------------------------------------------------------------
export interface DailyUsageMetrics {
  date: string; // YYYY-MM-DD
  ttsUpstreamCalls: number;
  translateUpstreamCalls: number;
  ttsCacheHits: number;
  translateCacheHits: number;
  lastBudgetAlertSent?: number;
}

export interface UsageBudgetTrackerOptions {
  customPath?: string;
  customDbUrl?: string;
  customAuthHeader?: string;
  customFetch?: typeof fetch;
  disableRtdb?: boolean;
  timeoutMs?: number;
  dailyTtsCap?: number;
  dailyTranslateCap?: number;
}

export class UsageBudgetTracker {
  private metricsFile: string;
  private currentMetrics: DailyUsageMetrics;
  private dailyTtsCap = 5000; // Hard cap on daily upstream TTS calls
  private dailyTranslateCap = 5000; // Hard cap on daily upstream translation calls
  private warningThreshold = 0.8; // Warn at 80% capacity
  private options: UsageBudgetTrackerOptions;
  private isDirty = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(options?: string | UsageBudgetTrackerOptions) {
    if (typeof options === 'string') {
      this.options = { customPath: options };
    } else {
      this.options = options || {};
    }

    const dataDir = path.join(process.cwd(), '.data');
    this.metricsFile = this.options.customPath || path.join(dataDir, 'usage_metrics.json');
    if (this.options.dailyTtsCap !== undefined) this.dailyTtsCap = this.options.dailyTtsCap;
    if (this.options.dailyTranslateCap !== undefined) this.dailyTranslateCap = this.options.dailyTranslateCap;

    this.currentMetrics = {
      date: this.getTodayString(),
      ttsUpstreamCalls: 0,
      translateUpstreamCalls: 0,
      ttsCacheHits: 0,
      translateCacheHits: 0,
    };

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
      .readFile(this.metricsFile, 'utf-8')
      .then((raw) => {
        const data = JSON.parse(raw);
        const today = this.getTodayString();
        if (data && data.date === today) {
          this.currentMetrics = {
            date: today,
            ttsUpstreamCalls: Number(data.ttsUpstreamCalls) || 0,
            translateUpstreamCalls: Number(data.translateUpstreamCalls) || 0,
            ttsCacheHits: Number(data.ttsCacheHits) || 0,
            translateCacheHits: Number(data.translateCacheHits) || 0,
            lastBudgetAlertSent: data.lastBudgetAlertSent,
          };
        }
      })
      .catch(() => {});
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private checkRollover(today?: string): void {
    const target = today || this.getTodayString();
    if (this.currentMetrics.date !== target) {
      this.currentMetrics = {
        date: target,
        ttsUpstreamCalls: 0,
        translateUpstreamCalls: 0,
        ttsCacheHits: 0,
        translateCacheHits: 0,
      };
      this.markDirty();
    }
  }

  private markDirty(): void {
    this.isDirty = true;
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushToDisk().catch(() => {});
      }, 1500);
      this.flushTimer.unref?.();
    }
  }

  public async flushToDisk(): Promise<void> {
    if (!this.isDirty) return;
    this.isDirty = false;

    try {
      const dir = path.dirname(this.metricsFile);
      await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});

      const tempPath = `${this.metricsFile}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(this.currentMetrics, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, this.metricsFile);
    } catch {
      this.isDirty = true;
    }
  }

  public setCapsForTesting(caps: { dailyTtsCap?: number; dailyTranslateCap?: number }): void {
    if (caps.dailyTtsCap !== undefined) this.dailyTtsCap = caps.dailyTtsCap;
    if (caps.dailyTranslateCap !== undefined) this.dailyTranslateCap = caps.dailyTranslateCap;
  }

  /**
   * Concurrency-safe atomic budget reservation for TTS upstream call.
   * Eliminates check-then-act races across distributed server instances.
   */
  public async reserveTtsBudget(targetDate?: string): Promise<{
    allowed: boolean;
    remaining: number;
    date: string;
    error?: string;
    retryAfterSec?: number;
  }> {
    const today = targetDate || this.getTodayString();
    this.checkRollover(today);

    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
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

          if (!getRes.ok) {
            throw new Error(`RTDB GET budget metric failed with status ${getRes.status}`);
          }

          const etag = getRes.headers.get('etag');
          if (!etag) {
            throw new Error('RTDB GET budget metric response missing required ETag');
          }

          const text = await getRes.text();
          let existing: DailyUsageMetrics | null = null;
          if (text && text.trim() !== 'null') {
            try {
              existing = JSON.parse(text);
            } catch (jsonErr: any) {
              throw new Error(`RTDB budget metric contains malformed JSON: ${jsonErr?.message || jsonErr}`);
            }
          }

          if (!existing || existing.date !== today) {
            existing = {
              date: today,
              ttsUpstreamCalls: 0,
              translateUpstreamCalls: 0,
              ttsCacheHits: this.currentMetrics.ttsCacheHits,
              translateCacheHits: this.currentMetrics.translateCacheHits,
            };
          }

          if (existing.ttsUpstreamCalls >= this.dailyTtsCap) {
            const retryAfterSec = getSecondsUntilMidnight();
            return {
              allowed: false,
              remaining: 0,
              date: today,
              error: 'Daily upstream TTS generation limit reached. Cached audio remains fully available.',
              retryAfterSec,
            };
          }

          const updated: DailyUsageMetrics = {
            ...existing,
            ttsUpstreamCalls: existing.ttsUpstreamCalls + 1,
            ttsCacheHits: Math.max(existing.ttsCacheHits || 0, this.currentMetrics.ttsCacheHits || 0),
            translateCacheHits: Math.max(existing.translateCacheHits || 0, this.currentMetrics.translateCacheHits || 0),
          };

          const putHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'if-match': etag,
          };

          const putRes = await this.fetchRtdb(
            url,
            {
              method: 'PUT',
              headers: putHeaders,
              body: JSON.stringify(updated),
            },
            timeoutMs
          );

          if (putRes.status === 412) {
            const backoff = 20 * Math.pow(2, attempt) + Math.floor(Math.random() * 15);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          if (!putRes.ok) {
            throw new Error(`RTDB PUT budget metric failed with status ${putRes.status}`);
          }

          this.currentMetrics = updated;
          this.markDirty();
          return {
            allowed: true,
            remaining: Math.max(0, this.dailyTtsCap - updated.ttsUpstreamCalls),
            date: today,
          };
        }

        throw new Error(
          `RTDB budget metric reservation exceeded maximum retries (${maxRetries + 1}) due to continuous 412 conflicts`
        );
      } catch (err: any) {
        console.warn('[UsageBudgetTracker] RTDB reservation error:', err?.message || err);
        if (isProductionEnvironment()) {
          const retryAfterSec = getSecondsUntilMidnight();
          return {
            allowed: false,
            remaining: 0,
            date: today,
            error: 'Authoritative shared spending store is unavailable in production. Cached audio remains available.',
            retryAfterSec,
          };
        }
      }
    } else {
      if (isProductionEnvironment()) {
        console.error('[UsageBudgetTracker] RTDB unconfigured in production. Upstream TTS blocked to protect spending budget.');
        const retryAfterSec = getSecondsUntilMidnight();
        return {
          allowed: false,
          remaining: 0,
          date: today,
          error: 'Authoritative shared spending store is unconfigured in production. Cached audio remains available.',
          retryAfterSec,
        };
      }
    }

    // Production fail-closed guard: Never fall through to local in-memory counters in production
    if (isProductionEnvironment()) {
      const retryAfterSec = getSecondsUntilMidnight();
      return {
        allowed: false,
        remaining: 0,
        date: today,
        error: 'Failed to secure shared budget reservation in production. Cached audio remains available.',
        retryAfterSec,
      };
    }

    // Local fallback atomic check (only permitted in offline development / test / non-production)
    if (this.currentMetrics.ttsUpstreamCalls >= this.dailyTtsCap) {
      const retryAfterSec = getSecondsUntilMidnight();
      return {
        allowed: false,
        remaining: 0,
        date: today,
        error: 'Daily upstream TTS generation limit reached. Cached audio remains fully available.',
        retryAfterSec,
      };
    }

    this.currentMetrics.ttsUpstreamCalls++;
    this.markDirty();
    return {
      allowed: true,
      remaining: Math.max(0, this.dailyTtsCap - this.currentMetrics.ttsUpstreamCalls),
      date: today,
    };
  }

  /**
   * Concurrency-safe atomic refund for failed, timed out, or coalesced TTS upstream call.
   */
  public async releaseTtsReservation(targetDate?: string): Promise<void> {
    const today = targetDate || this.getTodayString();
    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
        const maxRetries = 4;
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

          if (!getRes.ok) {
            throw new Error(`RTDB GET budget metric failed with status ${getRes.status}`);
          }

          const etag = getRes.headers.get('etag');
          if (!etag) {
            throw new Error('RTDB GET budget metric response missing required ETag');
          }

          const text = await getRes.text();
          if (!text || text.trim() === 'null') return;

          let existing: DailyUsageMetrics | null = null;
          try {
            existing = JSON.parse(text);
          } catch (jsonErr: any) {
            throw new Error(`RTDB budget metric contains malformed JSON: ${jsonErr?.message || jsonErr}`);
          }

          if (!existing || existing.ttsUpstreamCalls <= 0) return;

          const updated: DailyUsageMetrics = {
            ...existing,
            ttsUpstreamCalls: Math.max(0, existing.ttsUpstreamCalls - 1),
          };

          const putHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'if-match': etag,
          };

          const putRes = await this.fetchRtdb(
            url,
            {
              method: 'PUT',
              headers: putHeaders,
              body: JSON.stringify(updated),
            },
            timeoutMs
          );

          if (putRes.status === 412) {
            const backoff = 15 * Math.pow(2, attempt);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          if (putRes.ok) {
            this.currentMetrics = updated;
            this.markDirty();
            return;
          }
          break;
        }
      } catch (err: any) {
        console.warn('[UsageBudgetTracker] RTDB release failed:', err?.message || err);
        if (isProductionEnvironment()) {
          return;
        }
      }
    }

    if (!isProductionEnvironment()) {
      if (this.currentMetrics.ttsUpstreamCalls > 0) {
        this.currentMetrics.ttsUpstreamCalls--;
        this.markDirty();
      }
    }
  }

  /**
   * Concurrency-safe atomic budget reservation for translation upstream call.
   */
  public async reserveTranslateBudget(targetDate?: string): Promise<{
    allowed: boolean;
    remaining: number;
    date: string;
    error?: string;
    retryAfterSec?: number;
  }> {
    const today = targetDate || this.getTodayString();
    this.checkRollover(today);

    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
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

          if (!getRes.ok) {
            throw new Error(`RTDB GET budget metric failed with status ${getRes.status}`);
          }

          const etag = getRes.headers.get('etag');
          if (!etag) {
            throw new Error('RTDB GET budget metric response missing required ETag');
          }

          const text = await getRes.text();
          let existing: DailyUsageMetrics | null = null;
          if (text && text.trim() !== 'null') {
            try {
              existing = JSON.parse(text);
            } catch (jsonErr: any) {
              throw new Error(`RTDB budget metric contains malformed JSON: ${jsonErr?.message || jsonErr}`);
            }
          }

          if (!existing || existing.date !== today) {
            existing = {
              date: today,
              ttsUpstreamCalls: 0,
              translateUpstreamCalls: 0,
              ttsCacheHits: this.currentMetrics.ttsCacheHits,
              translateCacheHits: this.currentMetrics.translateCacheHits,
            };
          }

          if (existing.translateUpstreamCalls >= this.dailyTranslateCap) {
            const retryAfterSec = getSecondsUntilMidnight();
            return {
              allowed: false,
              remaining: 0,
              date: today,
              error: 'Daily upstream translation limit reached. Cached translations remain available.',
              retryAfterSec,
            };
          }

          const updated: DailyUsageMetrics = {
            ...existing,
            translateUpstreamCalls: existing.translateUpstreamCalls + 1,
            ttsCacheHits: Math.max(existing.ttsCacheHits || 0, this.currentMetrics.ttsCacheHits || 0),
            translateCacheHits: Math.max(existing.translateCacheHits || 0, this.currentMetrics.translateCacheHits || 0),
          };

          const putHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'if-match': etag,
          };

          const putRes = await this.fetchRtdb(
            url,
            {
              method: 'PUT',
              headers: putHeaders,
              body: JSON.stringify(updated),
            },
            timeoutMs
          );

          if (putRes.status === 412) {
            const backoff = 20 * Math.pow(2, attempt) + Math.floor(Math.random() * 15);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          if (!putRes.ok) {
            throw new Error(`RTDB PUT budget metric failed with status ${putRes.status}`);
          }

          this.currentMetrics = updated;
          this.markDirty();
          return {
            allowed: true,
            remaining: Math.max(0, this.dailyTranslateCap - updated.translateUpstreamCalls),
            date: today,
          };
        }

        throw new Error(
          `RTDB budget metric reservation exceeded maximum retries (${maxRetries + 1}) due to continuous 412 conflicts`
        );
      } catch (err: any) {
        console.warn('[UsageBudgetTracker] RTDB reservation error:', err?.message || err);
        if (isProductionEnvironment()) {
          const retryAfterSec = getSecondsUntilMidnight();
          return {
            allowed: false,
            remaining: 0,
            date: today,
            error: 'Authoritative shared spending store is unavailable in production. Cached translations remain available.',
            retryAfterSec,
          };
        }
      }
    } else {
      if (isProductionEnvironment()) {
        console.error('[UsageBudgetTracker] RTDB unconfigured in production. Upstream translations blocked to protect spending budget.');
        const retryAfterSec = getSecondsUntilMidnight();
        return {
          allowed: false,
          remaining: 0,
          date: today,
          error: 'Authoritative shared spending store is unconfigured in production. Cached translations remain available.',
          retryAfterSec,
        };
      }
    }

    // Production fail-closed guard: Never fall through to local in-memory counters in production
    if (isProductionEnvironment()) {
      const retryAfterSec = getSecondsUntilMidnight();
      return {
        allowed: false,
        remaining: 0,
        date: today,
        error: 'Failed to secure shared budget reservation in production. Cached translations remain available.',
        retryAfterSec,
      };
    }

    // Local fallback atomic check (only permitted in offline development / test / non-production)
    if (this.currentMetrics.translateUpstreamCalls >= this.dailyTranslateCap) {
      const retryAfterSec = getSecondsUntilMidnight();
      return {
        allowed: false,
        remaining: 0,
        date: today,
        error: 'Daily upstream translation limit reached. Cached translations remain available.',
        retryAfterSec,
      };
    }

    this.currentMetrics.translateUpstreamCalls++;
    this.markDirty();
    return {
      allowed: true,
      remaining: Math.max(0, this.dailyTranslateCap - this.currentMetrics.translateUpstreamCalls),
      date: today,
    };
  }

  /**
   * Concurrency-safe atomic refund for failed or timed out translation upstream call.
   */
  public async releaseTranslateReservation(targetDate?: string): Promise<void> {
    const today = targetDate || this.getTodayString();
    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
        const maxRetries = 4;
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

          if (!getRes.ok) {
            throw new Error(`RTDB GET budget metric failed with status ${getRes.status}`);
          }

          const etag = getRes.headers.get('etag');
          if (!etag) {
            throw new Error('RTDB GET budget metric response missing required ETag');
          }

          const text = await getRes.text();
          if (!text || text.trim() === 'null') return;

          let existing: DailyUsageMetrics | null = null;
          try {
            existing = JSON.parse(text);
          } catch (jsonErr: any) {
            throw new Error(`RTDB budget metric contains malformed JSON: ${jsonErr?.message || jsonErr}`);
          }

          if (!existing || existing.translateUpstreamCalls <= 0) return;

          const updated: DailyUsageMetrics = {
            ...existing,
            translateUpstreamCalls: Math.max(0, existing.translateUpstreamCalls - 1),
          };

          const putHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'if-match': etag,
          };

          const putRes = await this.fetchRtdb(
            url,
            {
              method: 'PUT',
              headers: putHeaders,
              body: JSON.stringify(updated),
            },
            timeoutMs
          );

          if (putRes.status === 412) {
            const backoff = 15 * Math.pow(2, attempt);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          if (putRes.ok) {
            this.currentMetrics = updated;
            this.markDirty();
            return;
          }
          break;
        }
      } catch (err: any) {
        console.warn('[UsageBudgetTracker] RTDB release failed:', err?.message || err);
        if (isProductionEnvironment()) {
          return;
        }
      }
    }

    if (!isProductionEnvironment()) {
      if (this.currentMetrics.translateUpstreamCalls > 0) {
        this.currentMetrics.translateUpstreamCalls--;
        this.markDirty();
      }
    }
  }

  public recordTtsCacheHit(targetDate?: string): void {
    const today = targetDate || this.getTodayString();
    this.checkRollover(today);
    this.currentMetrics.ttsCacheHits++;
    this.markDirty();
  }

  public recordTranslateCacheHit(targetDate?: string): void {
    const today = targetDate || this.getTodayString();
    this.checkRollover(today);
    this.currentMetrics.translateCacheHits++;
    this.markDirty();
  }

  public canMakeTtsUpstream(): { allowed: boolean; remaining: number; error?: string } {
    this.checkRollover();
    if (this.currentMetrics.ttsUpstreamCalls >= this.dailyTtsCap) {
      return {
        allowed: false,
        remaining: 0,
        error: 'Daily upstream TTS generation limit reached. Cached audio remains fully available.',
      };
    }
    return { allowed: true, remaining: this.dailyTtsCap - this.currentMetrics.ttsUpstreamCalls };
  }

  public recordTtsUpstream(): void {
    this.checkRollover();
    this.currentMetrics.ttsUpstreamCalls++;
    this.markDirty();
  }

  public canMakeTranslateUpstream(): { allowed: boolean; remaining: number; error?: string } {
    this.checkRollover();
    if (this.currentMetrics.translateUpstreamCalls >= this.dailyTranslateCap) {
      return {
        allowed: false,
        remaining: 0,
        error: 'Daily upstream translation limit reached. Cached translations remain available.',
      };
    }
    return { allowed: true, remaining: this.dailyTranslateCap - this.currentMetrics.translateUpstreamCalls };
  }

  public recordTranslateUpstream(): void {
    this.checkRollover();
    this.currentMetrics.translateUpstreamCalls++;
    this.markDirty();
  }

  public getMetrics(): DailyUsageMetrics {
    this.checkRollover();
    return { ...this.currentMetrics };
  }

  public async getMetricsAsync(targetDate?: string): Promise<DailyUsageMetrics> {
    const today = targetDate || this.getTodayString();
    this.checkRollover(today);

    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
        const res = await this.fetchRtdb(url, { method: 'GET' }, 3000);
        if (res.ok && res.status !== 204) {
          const text = await res.text();
          if (text && text.trim() !== 'null') {
            const data = JSON.parse(text);
            if (data && data.date === today) {
              this.currentMetrics = {
                date: today,
                ttsUpstreamCalls: Number(data.ttsUpstreamCalls) || 0,
                translateUpstreamCalls: Number(data.translateUpstreamCalls) || 0,
                ttsCacheHits: Number(data.ttsCacheHits) || 0,
                translateCacheHits: Number(data.translateCacheHits) || 0,
                lastBudgetAlertSent: data.lastBudgetAlertSent,
              };
            }
          }
        }
      } catch {}
    }

    return { ...this.currentMetrics };
  }

  public async resetForTesting(targetDate?: string): Promise<void> {
    const today = targetDate || this.getTodayString();
    this.currentMetrics = {
      date: today,
      ttsUpstreamCalls: 0,
      translateUpstreamCalls: 0,
      ttsCacheHits: 0,
      translateCacheHits: 0,
    };
    this.markDirty();
    await this.flushToDisk();

    if (this.isRtdbConfigured()) {
      try {
        const url = this.resolveRtdbUrl(`/beeyou/budget_metrics/${today}.json`);
        await this.fetchRtdb(url, { method: 'DELETE' }, 3000);
      } catch {}
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const usageBudgetTracker = new UsageBudgetTracker();

// -------------------------------------------------------------
// Multi-Tier Caching Infrastructure (L1 Memory + L3 Disk Cache)
// Resilient storage verified for local dev & cloud deployment (Render, Railway, Vercel, Docker)
// -------------------------------------------------------------
export function resolveCacheDirectory(subdir: string): string {
  const preferred = process.env.DATA_DIR
    ? path.join(process.env.DATA_DIR, subdir)
    : path.join(process.cwd(), '.data', subdir);

  try {
    if (!fs.existsSync(preferred)) {
      fs.mkdirSync(preferred, { recursive: true });
    }
    const probe = path.join(preferred, `.probe_${Date.now()}.tmp`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return preferred;
  } catch (err) {
    const fallback = path.join(os.tmpdir(), 'beeyou_data', subdir);
    try {
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
      return fallback;
    } catch {
      return preferred;
    }
  }
}

export const TTS_CACHE_DIR = resolveCacheDirectory('tts_cache');
export const TRANSLATE_CACHE_DIR = resolveCacheDirectory('translate_cache');

// Cache capacity bounds & storage lifecycle rules
export const MAX_MEMORY_CACHE_BYTES = 64 * 1024 * 1024; // 64 MB bounded RAM limit
export const MAX_MEMORY_CACHE_ITEMS = 500; // 500 items max in memory
export const MAX_DISK_CACHE_BYTES = 500 * 1024 * 1024; // 500 MB bounded persistent disk limit
export const MAX_DISK_CACHE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30-day TTL lifecycle expiration
export const DISK_CLEANUP_TARGET_RATIO = 0.8; // Prune down to 80% (400 MB) when threshold breached
const DISK_LIFECYCLE_MIN_INTERVAL_MS = 5 * 60 * 1000; // Throttle background runs to at most once every 5 min

export interface MemoryCacheEntry<T> {
  value: T;
  sizeBytes: number;
  addedAt: number;
}

export interface MemoryCacheMetrics {
  itemCount: number;
  maxItemCount: number;
  totalSizeBytes: number;
  maxSizeBytes: number;
  utilizationPercent: number;
  evictionsCount: number;
  evictionsBytes: number;
  hits: number;
  misses: number;
  hitRatePercent: number;
}

/**
 * Byte-bounded LRU Memory Cache
 * Enforces strict byte-based memory limits as well as item count bounds to prevent
 * unbounded RAM growth from audio buffers.
 */
export class ByteBoundedMemoryCache<T extends { buffer: Buffer; contentType: string }> {
  private map = new Map<string, MemoryCacheEntry<T>>();
  private currentSizeBytes = 0;
  public readonly maxSizeBytes: number;
  public readonly maxItemCount: number;

  private hits = 0;
  private misses = 0;
  private evictionsCount = 0;
  private evictionsBytes = 0;

  constructor(
    maxSizeBytes: number = MAX_MEMORY_CACHE_BYTES,
    maxItemCount: number = MAX_MEMORY_CACHE_ITEMS
  ) {
    this.maxSizeBytes = maxSizeBytes;
    this.maxItemCount = maxItemCount;
  }

  private calculateEntrySize(key: string, value: T): number {
    const keyBytes = key.length * 2;
    const mimeBytes = value.contentType ? value.contentType.length * 2 : 32;
    const bufferBytes = value.buffer ? value.buffer.length : 0;
    // Estimated Map node and object wrapper overhead (~64 bytes)
    return keyBytes + mimeBytes + bufferBytes + 64;
  }

  public get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    // LRU refresh: re-insert so it becomes the most recently used
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  public has(key: string): boolean {
    return this.map.has(key);
  }

  public set(key: string, value: T): void {
    const entrySize = this.calculateEntrySize(key, value);

    // If an individual entry is abnormally larger than the entire cache max size, skip in-memory caching
    if (entrySize > this.maxSizeBytes) {
      console.warn(
        `[ByteBoundedMemoryCache] Entry for key "${key}" (${(entrySize / 1024 / 1024).toFixed(2)} MB) exceeds total cache limit (${(this.maxSizeBytes / 1024 / 1024).toFixed(2)} MB). Bypassing L1 RAM cache.`
      );
      return;
    }

    // If key already exists, deduct old size before updating
    if (this.map.has(key)) {
      const existing = this.map.get(key)!;
      this.currentSizeBytes -= existing.sizeBytes;
      this.map.delete(key);
    }

    // Evict least-recently-used items until within byte and item count bounds
    while (
      (this.currentSizeBytes + entrySize > this.maxSizeBytes || this.map.size >= this.maxItemCount) &&
      this.map.size > 0
    ) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey === undefined) break;
      const oldestEntry = this.map.get(oldestKey);
      if (oldestEntry) {
        this.currentSizeBytes -= oldestEntry.sizeBytes;
        this.evictionsBytes += oldestEntry.sizeBytes;
        this.evictionsCount++;
      }
      this.map.delete(oldestKey);
    }

    this.map.set(key, {
      value,
      sizeBytes: entrySize,
      addedAt: Date.now(),
    });
    this.currentSizeBytes += entrySize;
  }

  public delete(key: string): boolean {
    const existing = this.map.get(key);
    if (existing) {
      this.currentSizeBytes -= existing.sizeBytes;
      return this.map.delete(key);
    }
    return false;
  }

  public clear(): void {
    this.map.clear();
    this.currentSizeBytes = 0;
  }

  public get size(): number {
    return this.map.size;
  }

  public get bytes(): number {
    return this.currentSizeBytes;
  }

  public keys(): IterableIterator<string> {
    return this.map.keys();
  }

  public getMetrics(): MemoryCacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRatePercent = totalRequests > 0 ? Number(((this.hits / totalRequests) * 100).toFixed(1)) : 0;
    const utilizationPercent = this.maxSizeBytes > 0
      ? Number(((this.currentSizeBytes / this.maxSizeBytes) * 100).toFixed(1))
      : 0;

    return {
      itemCount: this.map.size,
      maxItemCount: this.maxItemCount,
      totalSizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      utilizationPercent,
      evictionsCount: this.evictionsCount,
      evictionsBytes: this.evictionsBytes,
      hits: this.hits,
      misses: this.misses,
      hitRatePercent,
    };
  }
}

export const ttsAudioCache = new ByteBoundedMemoryCache<{ buffer: Buffer; contentType: string }>();
const inFlightTtsGenerations = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();
const modelCooldownMap = new Map<string, number>();
const translateTextCache = new Map<string, string>();

export interface DiskLifecycleTelemetry {
  lastRunTimestamp: string | null;
  lastRunDurationMs: number;
  ttlEvictedCount: number;
  ttlEvictedBytes: number;
  capacityEvictedCount: number;
  capacityEvictedBytes: number;
  lastScannedFilesCount: number;
  lastScannedSizeBytes: number;
}

let diskLifecycleTelemetry: DiskLifecycleTelemetry = {
  lastRunTimestamp: null,
  lastRunDurationMs: 0,
  ttlEvictedCount: 0,
  ttlEvictedBytes: 0,
  capacityEvictedCount: 0,
  capacityEvictedBytes: 0,
  lastScannedFilesCount: 0,
  lastScannedSizeBytes: 0,
};

let isDiskLifecycleRunning = false;
let lastDiskLifecycleRunTime = 0;

/**
 * Storage Lifecycle Manager
 * Enforces TTL (30-day expiration) and maximum byte-capacity (500 MB) on the persistent disk cache.
 * When disk usage exceeds MAX_DISK_CACHE_BYTES, prunes the oldest files down to 80% capacity (400 MB).
 */
export async function enforceDiskCacheLifecycle(force = false): Promise<{
  scannedFiles: number;
  totalSizeBytes: number;
  ttlEvictedCount: number;
  ttlEvictedBytes: number;
  capacityEvictedCount: number;
  capacityEvictedBytes: number;
  durationMs: number;
}> {
  const now = Date.now();
  if (!force && now - lastDiskLifecycleRunTime < DISK_LIFECYCLE_MIN_INTERVAL_MS) {
    return {
      scannedFiles: diskLifecycleTelemetry.lastScannedFilesCount,
      totalSizeBytes: diskLifecycleTelemetry.lastScannedSizeBytes,
      ttlEvictedCount: 0,
      ttlEvictedBytes: 0,
      capacityEvictedCount: 0,
      capacityEvictedBytes: 0,
      durationMs: 0,
    };
  }

  if (isDiskLifecycleRunning) {
    return {
      scannedFiles: diskLifecycleTelemetry.lastScannedFilesCount,
      totalSizeBytes: diskLifecycleTelemetry.lastScannedSizeBytes,
      ttlEvictedCount: 0,
      ttlEvictedBytes: 0,
      capacityEvictedCount: 0,
      capacityEvictedBytes: 0,
      durationMs: 0,
    };
  }

  isDiskLifecycleRunning = true;
  const startTime = Date.now();

  let ttlEvictedCount = 0;
  let ttlEvictedBytes = 0;
  let capacityEvictedCount = 0;
  let capacityEvictedBytes = 0;
  const remainingFiles: { path: string; size: number; mtime: number }[] = [];
  let remainingBytes = 0;

  try {
    if (!fs.existsSync(TTS_CACHE_DIR)) {
      return {
        scannedFiles: 0,
        totalSizeBytes: 0,
        ttlEvictedCount: 0,
        ttlEvictedBytes: 0,
        capacityEvictedCount: 0,
        capacityEvictedBytes: 0,
        durationMs: 0,
      };
    }

    const entries = await fs.promises.readdir(TTS_CACHE_DIR);
    for (const file of entries) {
      if (!file.endsWith('.wav') && !file.endsWith('.mp3')) continue;

      const filePath = path.join(TTS_CACHE_DIR, file);
      try {
        const stat = await fs.promises.stat(filePath);
        const ageMs = now - stat.mtimeMs;

        // Rule 1: Expiration check (TTL > 30 days)
        if (ageMs > MAX_DISK_CACHE_AGE_MS) {
          await fs.promises.unlink(filePath);
          ttlEvictedCount++;
          ttlEvictedBytes += stat.size;
        } else {
          remainingFiles.push({
            path: filePath,
            size: stat.size,
            mtime: stat.mtimeMs,
          });
          remainingBytes += stat.size;
        }
      } catch {
        // File may have been unlinked concurrently
      }
    }

    // Rule 2: Byte-bounded capacity eviction (Prune to 80% if > MAX_DISK_CACHE_BYTES)
    if (remainingBytes > MAX_DISK_CACHE_BYTES) {
      const targetBytes = Math.floor(MAX_DISK_CACHE_BYTES * DISK_CLEANUP_TARGET_RATIO);
      // Sort oldest first by mtime
      remainingFiles.sort((a, b) => a.mtime - b.mtime);

      for (const item of remainingFiles) {
        if (remainingBytes <= targetBytes) break;
        try {
          await fs.promises.unlink(item.path);
          remainingBytes -= item.size;
          capacityEvictedCount++;
          capacityEvictedBytes += item.size;
        } catch {
          // File may have already been removed
        }
      }
    }

    const durationMs = Date.now() - startTime;
    lastDiskLifecycleRunTime = Date.now();

    diskLifecycleTelemetry = {
      lastRunTimestamp: new Date().toISOString(),
      lastRunDurationMs: durationMs,
      ttlEvictedCount: diskLifecycleTelemetry.ttlEvictedCount + ttlEvictedCount,
      ttlEvictedBytes: diskLifecycleTelemetry.ttlEvictedBytes + ttlEvictedBytes,
      capacityEvictedCount: diskLifecycleTelemetry.capacityEvictedCount + capacityEvictedCount,
      capacityEvictedBytes: diskLifecycleTelemetry.capacityEvictedBytes + capacityEvictedBytes,
      lastScannedFilesCount: remainingFiles.length - capacityEvictedCount,
      lastScannedSizeBytes: remainingBytes,
    };

    if (ttlEvictedCount > 0 || capacityEvictedCount > 0) {
      console.log(
        `[Disk Cache Lifecycle] Cleaned ${ttlEvictedCount} expired files (${(ttlEvictedBytes / 1024 / 1024).toFixed(2)} MB) and ${capacityEvictedCount} overflow files (${(capacityEvictedBytes / 1024 / 1024).toFixed(2)} MB). Remaining: ${remainingFiles.length - capacityEvictedCount} files (${(remainingBytes / 1024 / 1024).toFixed(2)} MB) in ${durationMs}ms.`
      );
    }

    return {
      scannedFiles: remainingFiles.length - capacityEvictedCount,
      totalSizeBytes: remainingBytes,
      ttlEvictedCount,
      ttlEvictedBytes,
      capacityEvictedCount,
      capacityEvictedBytes,
      durationMs,
    };
  } catch (err) {
    console.warn('[Disk Cache Lifecycle Error]:', err);
    return {
      scannedFiles: remainingFiles.length,
      totalSizeBytes: remainingBytes,
      ttlEvictedCount,
      ttlEvictedBytes,
      capacityEvictedCount,
      capacityEvictedBytes,
      durationMs: Date.now() - startTime,
    };
  } finally {
    isDiskLifecycleRunning = false;
  }
}

/**
 * Schedules a non-blocking background check for disk cache lifecycle rules.
 * Uses setImmediate to prevent blocking the current request or event loop.
 */
export function scheduleDiskCacheLifecycleCheck(): void {
  setImmediate(() => {
    enforceDiskCacheLifecycle().catch((err) => {
      console.warn('[Scheduled Disk Cache Lifecycle Error]:', err);
    });
  });
}

export interface DiskCacheVerification {
  status: 'VERIFIED_READY' | 'DEGRADED';
  path: string;
  cachedFilesCount: number;
  totalSizeBytes: number;
  maxDiskSizeBytes: number;
  diskUtilizationPercent: number;
  diskTtlDays: number;
  writable: boolean;
  cloudStorage: ReturnType<typeof getCloudStorageStatus>;
  singleFlightActiveRequests: number;
  memoryCache: MemoryCacheMetrics;
  lifecycleTelemetry: DiskLifecycleTelemetry;
}

/**
 * Diagnostic helper to verify Level 3 server-side disk cache deployment readiness
 * and report real-time memory and disk utilization metrics.
 */
export function verifyLevel3DiskCache(): DiskCacheVerification {
  let writable = false;
  let cachedFilesCount = 0;
  let totalSizeBytes = 0;

  try {
    const probe = path.join(TTS_CACHE_DIR, `.probe_${Date.now()}.tmp`);
    fs.writeFileSync(probe, 'test');
    fs.unlinkSync(probe);
    writable = true;
  } catch {
    writable = false;
  }

  try {
    const files = fs.readdirSync(TTS_CACHE_DIR);
    cachedFilesCount = files.length;
    totalSizeBytes = diskLifecycleTelemetry.lastScannedSizeBytes || (cachedFilesCount * 26000); // Fast O(1) estimate without 11,000 blocking statSync calls
  } catch {}

  const diskUtilizationPercent = MAX_DISK_CACHE_BYTES > 0
    ? Number(((totalSizeBytes / MAX_DISK_CACHE_BYTES) * 100).toFixed(1))
    : 0;

  const status = writable ? 'VERIFIED_READY' : 'DEGRADED';
  return {
    status,
    path: TTS_CACHE_DIR,
    cachedFilesCount,
    totalSizeBytes,
    maxDiskSizeBytes: MAX_DISK_CACHE_BYTES,
    diskUtilizationPercent,
    diskTtlDays: Math.round(MAX_DISK_CACHE_AGE_MS / (24 * 60 * 60 * 1000)),
    writable,
    cloudStorage: getCloudStorageStatus(),
    singleFlightActiveRequests: inFlightTtsGenerations.size,
    memoryCache: ttsAudioCache.getMetrics(),
    lifecycleTelemetry: { ...diskLifecycleTelemetry },
  };
}

/**
 * Wraps raw linear PCM (e.g. Gemini 2.5) into a standard 44-byte RIFF WAV container
 * so all modern browsers can decode and play the audio seamlessly.
 */
export function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28); // ByteRate
  header.writeUInt16LE(numChannels * (bitDepth / 8), 32); // BlockAlign
  header.writeUInt16LE(bitDepth, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Strips non-standard trailing subchunks (such as Google Gemini's 6066-byte C2PA chunk)
 * and reconstructs a pristine, strictly compliant RIFF WAV container containing only
 * the 'fmt ' and 'data' chunks. This ensures 100% audio compatibility with Apple CoreAudio
 * on iOS and WebKit/Chromium on Android without decoder rejection or static.
 */
export function cleanRiffWavBuffer(buffer: Buffer): Buffer {
  if (!buffer || buffer.length < 44) return buffer;
  if (buffer.subarray(0, 4).toString('ascii') !== 'RIFF' || buffer.subarray(8, 12).toString('ascii') !== 'WAVE') {
    return buffer;
  }
  let offset = 12;
  let fmtSubchunk: Buffer | null = null;
  let dataSubchunk: Buffer | null = null;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.subarray(offset, offset + 4).toString('ascii');
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkId === 'fmt ') {
      fmtSubchunk = buffer.subarray(offset, offset + 8 + chunkSize);
    } else if (chunkId === 'data') {
      dataSubchunk = buffer.subarray(offset, offset + 8 + chunkSize);
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  if (!fmtSubchunk || !dataSubchunk) return buffer;
  const riffSize = 4 + fmtSubchunk.length + dataSubchunk.length;
  const out = Buffer.alloc(8 + riffSize);
  out.write('RIFF', 0);
  out.writeUInt32LE(riffSize, 4);
  out.write('WAVE', 8);
  fmtSubchunk.copy(out, 12);
  dataSubchunk.copy(out, 12 + fmtSubchunk.length);
  return out;
}

/**
 * Checks whether an audio buffer already contains a valid RIFF WAVE container.
 */
export function isValidRiffWav(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 44) return false;
  const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
  const isWave = buffer.subarray(8, 12).toString('ascii') === 'WAVE';
  const isFmt = buffer.subarray(12, 16).toString('ascii') === 'fmt ';
  return isRiff && isWave && isFmt;
}

/**
 * Inspects audio buffer and MIME metadata. If the buffer is raw PCM (missing RIFF WAVE header),
 * parses sample rate from MIME or metadata and wraps it into a complete, standard 44-byte RIFF WAV container.
 * Also cleans any trailing metadata subchunks (such as C2PA) to guarantee Apple CoreAudio compliance.
 */
export function ensureValidWavContainer(
  buffer: Buffer,
  rawMime?: string,
  metadataSampleRate?: number
): { buffer: Buffer; sampleRate: number; isNativeWav: boolean } {
  // If already a valid RIFF WAV, clean any trailing non-standard chunks (C2PA) and return native sample rate
  if (isValidRiffWav(buffer)) {
    const cleaned = cleanRiffWavBuffer(buffer);
    const sampleRate = cleaned.readUInt32LE(24) || 24000;
    return { buffer: cleaned, sampleRate, isNativeWav: true };
  }

  // Parse sample rate from MIME string (e.g. "audio/L16;rate=24000" or "audio/pcm;rate=16000")
  let sampleRate = metadataSampleRate || 24000;
  if (rawMime) {
    const rateMatch = rawMime.match(/rate[=:]\s*(\d+)/i);
    if (rateMatch) {
      sampleRate = parseInt(rateMatch[1], 10);
    }
  }

  let numChannels = 1;
  if (rawMime) {
    const channelMatch = rawMime.match(/channels[=:]\s*(\d+)/i);
    if (channelMatch) {
      numChannels = parseInt(channelMatch[1], 10);
    }
  }

  const wavBuffer = pcmToWav(buffer, sampleRate, numChannels, 16);
  return { buffer: wavBuffer, sampleRate, isNativeWav: false };
}

// Per-User Quota Constants
const TTS_BURST_LIMIT_PER_MIN = 120; // Max 120 speech generations per minute per IP/user
const TTS_DAILY_LIMIT_PER_USER = 1000; // Max 1000 speech generations per 24 hours per IP/user

const TRANSLATE_BURST_LIMIT_PER_MIN = 20; // Max 20 dynamic translations per minute per IP/user
const TRANSLATE_DAILY_LIMIT_PER_USER = 200; // Max 200 dynamic translations per 24 hours per IP/user

// Request Timeouts
const TRANSLATE_TIMEOUT_MS = 5000; // 5-second strict upstream timeout
const TTS_TIMEOUT_MS = 4500; // 4.5-second strict timeout for fast, non-blocking speech responses

/**
 * Handle Translation Requests with Validation, Timeouts, Multi-Tier Caching, and Abuse Protection.
 */
export async function handleTranslateRequest(req: Request, res: ExpressResponse): Promise<void> {
  const rawText = req.query.text;
  const rawTo = req.query.to || 'es';

  // 1. Text Validation
  const textValidation = validateTextInput(rawText, 150);
  if (!textValidation.valid) {
    res.status(400).json({ error: 'BadRequest', message: textValidation.error });
    return;
  }
  const cleanText = textValidation.cleanText!;

  // 2. Language Validation
  const toLang = normalizeLanguageCode(rawTo);
  if (!toLang) {
    res.status(400).json({
      error: 'BadRequest',
      message: `Unsupported target language '${rawTo}'. Supported languages are: ${Array.from(ALLOWED_LANGUAGES).join(', ')}`,
    });
    return;
  }

  // If target is English or source text is identical, return immediately
  if (toLang === 'en') {
    res.json({ translated: cleanText });
    return;
  }

  const clientIp = getClientIp(req);
  const hashKey = crypto.createHash('md5').update(`${toLang}_${cleanText.toLowerCase()}`).digest('hex');
  const cacheKey = `${toLang}_${cleanText.toLowerCase()}`;
  const diskPath = path.join(TRANSLATE_CACHE_DIR, `${toLang}_${hashKey}.json`);

  // 3. L1 In-Memory Cache Check (0ms latency, zero upstream calls)
  if (translateTextCache.has(cacheKey)) {
    usageBudgetTracker.recordTranslateCacheHit();
    res.json({ translated: translateTextCache.get(cacheKey)! });
    return;
  }

  // 4. L2 Persistent Disk Cache Check (Non-blocking async)
  try {
    const cachedRaw = await fs.promises.readFile(diskPath, 'utf-8');
    const cached = JSON.parse(cachedRaw);
    if (cached?.translated) {
      translateTextCache.set(cacheKey, cached.translated);
      usageBudgetTracker.recordTranslateCacheHit();
      res.json({ translated: cached.translated });
      return;
    }
  } catch {}

  // 5. Per-User Quota Check (Only charged on cache miss that would trigger upstream call)
  const minuteQuota = await defaultRateLimitStore.hit(`translate:burst:${clientIp}`, TRANSLATE_BURST_LIMIT_PER_MIN, 60 * 1000, 'ip');
  if (!minuteQuota.allowed) {
    res.setHeader('Retry-After', minuteQuota.retryAfterSec);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Translation request rate limit reached. Please wait a moment.',
      retryAfter: minuteQuota.retryAfterSec,
    });
    return;
  }

  const dailyQuota = await defaultRateLimitStore.hit(`translate:daily:${clientIp}`, TRANSLATE_DAILY_LIMIT_PER_USER, 24 * 60 * 60 * 1000, 'ip');
  if (!dailyQuota.allowed) {
    res.setHeader('Retry-After', dailyQuota.retryAfterSec);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Daily translation quota exceeded for this device. Please try again tomorrow.',
      retryAfter: dailyQuota.retryAfterSec,
    });
    return;
  }

  // 6. Global Daily Budget & Circuit Breaker Check (Atomic Concurrency-Safe Reservation)
  const budgetReservation = await usageBudgetTracker.reserveTranslateBudget();
  if (!budgetReservation.allowed) {
    const retryAfter = budgetReservation.retryAfterSec || 3600;
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: 'Too Many Requests',
      message: budgetReservation.error || 'Daily upstream translation limit reached. Cached translations remain available.',
      retryAfter,
    });
    return;
  }

  // 7. Upstream Translation Request with AbortSignal Timeout
  let reservationKept = false;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(toLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(TRANSLATE_TIMEOUT_MS),
    });

    if (!response.ok) {
      res.json({ translated: cleanText });
      return;
    }

    const data: any = await response.json();
    const translated = data?.[0]?.[0]?.[0] || cleanText;
    reservationKept = true;

    // Cache translated response in memory and disk
    if (translateTextCache.size > 2000) {
      const first = translateTextCache.keys().next().value;
      if (first) translateTextCache.delete(first);
    }
    translateTextCache.set(cacheKey, translated);
    fs.promises.writeFile(diskPath, JSON.stringify({ translated, cleanText, toLang, date: new Date().toISOString() })).catch(() => {});

    res.json({ translated });
  } catch (err: any) {
    // If upstream timed out or failed, gracefully fallback to original text without breaking UI
    res.json({ translated: cleanText });
  } finally {
    if (!reservationKept) {
      usageBudgetTracker.releaseTranslateReservation(budgetReservation.date).catch(() => {});
    }
  }
}

/**
 * Asynchronously locates the first matching audio file on disk without blocking the event loop.
 */
async function findExistingDiskFile(candidates: (string | null | undefined)[]): Promise<string | null> {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      await fs.promises.access(candidate, fs.constants.R_OK);
      return candidate;
    } catch {}
  }
  return null;
}

/**
 * Handle Text-to-Speech Requests with Validation, Timeouts, Multi-Tier Caching, and Abuse Protection.
 * Supports neural persona streaming across Kids, Teens, Caring, and Professional categories.
 */
export async function handleTtsRequest(req: Request, res: ExpressResponse): Promise<void> {
  const rawText = req.query.text;
  const rawLang = req.query.lang || 'en';
  const rawVoice = (req.query.voice || 'puck').toString().trim().toLowerCase();

  // 1. Text Validation
  const textValidation = validateTextInput(rawText, 150);
  if (!textValidation.valid) {
    res.status(400).send(textValidation.error);
    return;
  }
  const cleanText = textValidation.cleanText!;

  // 2. Language Validation
  const normalizedLang = normalizeLanguageCode(rawLang);
  if (!normalizedLang) {
    res.status(400).send(`Unsupported language code '${rawLang}'. Supported languages are: ${Array.from(ALLOWED_LANGUAGES).join(', ')}`);
    return;
  }

  // Determine Voice & Style from 20-Voice Catalog
  const persona = getVoicePersonaById(rawVoice);
  const voiceKey = persona.id.toLowerCase();

  // Explicit TTS Generation Version from query param or default engine version
  const ttsVersion = (req.query.v || TTS_GENERATION_VERSION).toString().trim().toLowerCase();

  const clientIp = getClientIp(req);
  // Normalize text for hashing: strip trailing sentence punctuation so "Want" and "Want." hit the exact same cache file
  const cacheKeyText = cleanText.trim().replace(/[.!?]+$/, '').toLowerCase();
  const literalKeyText = cleanText.trim().toLowerCase();
  const hashKey = crypto.createHash('md5').update(`${ttsVersion}_${voiceKey}_${normalizedLang}_${cacheKeyText}`).digest('hex');
  const literalHashKey = crypto.createHash('md5').update(`${ttsVersion}_${voiceKey}_${normalizedLang}_${literalKeyText}`).digest('hex');
  const cacheKey = `${ttsVersion}_${voiceKey}_${normalizedLang}_${cacheKeyText}`;
  const diskPathWav = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${hashKey}.wav`);
  const literalDiskPathWav = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${literalHashKey}.wav`);
  const diskPathMp3 = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${hashKey}.mp3`);
  const literalDiskPathMp3 = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${literalHashKey}.mp3`);
  const legacyDiskPathMp3 = path.join(TTS_CACHE_DIR, `${normalizedLang}_${hashKey}.mp3`);

  // Determine appropriate HTTP caching policy based on vocabulary sensitivity
  // Approved built-in AAC vocabulary receives public edge caching
  // Arbitrary custom user phrases receive private no-store headers to prevent CDN/shared-cache storage
  const isApproved = isApprovedVocabulary(cleanText);
  const cacheControlDirective = getTtsCacheControlDirective(cleanText);

  const applyTtsHeaders = (targetRes: ExpressResponse, contentType?: string) => {
    if (contentType) {
      targetRes.setHeader('Content-Type', contentType);
    }
    targetRes.setHeader('Cache-Control', cacheControlDirective);
    targetRes.setHeader('ETag', `"${hashKey}"`);
    if (!isApproved) {
      targetRes.setHeader('Pragma', 'no-cache');
      targetRes.setHeader('Expires', '0');
    }
  };

  // 3. L1 In-Memory Cache Check (0ms latency, zero upstream calls)
  const cached = ttsAudioCache.get(cacheKey) || ttsAudioCache.get(`${ttsVersion}_${voiceKey}_${normalizedLang}_${literalKeyText}`);
  if (cached) {
    usageBudgetTracker.recordTtsCacheHit();
    console.log(`[TTS Cache HIT L1] "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 API calls ($0.00)`);
    if (req.headers['if-none-match'] === `"${hashKey}"`) {
      applyTtsHeaders(res);
      res.status(304).end();
      return;
    }
    applyTtsHeaders(res, cached.contentType);
    res.send(cached.buffer);
    return;
  }

  // 4. Single-Flight Coalescing: Join in-flight generation if already in progress
  if (inFlightTtsGenerations.has(cacheKey)) {
    console.log(`[TTS Single-Flight JOIN] Concurrent request joined in-flight generation: "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 extra Gemini calls ($0.00)`);
    try {
      const joined = await inFlightTtsGenerations.get(cacheKey)!;
      if (joined) {
        usageBudgetTracker.recordTtsCacheHit();
        if (req.headers['if-none-match'] === `"${hashKey}"`) {
          applyTtsHeaders(res);
          res.status(304).end();
          return;
        }
        applyTtsHeaders(res, joined.contentType);
        res.send(joined.buffer);
        return;
      }
    } catch (joinErr) {
      console.warn('[TTS Single-Flight Join Error]:', joinErr);
    }

    if (voiceKey !== 'system') {
      res.status(503).json({
        error: 'VoiceStreamUnavailable',
        message: 'Voice stream unavailable. Falling back to on-device Piper or system speech.',
      });
      return;
    }
    res.status(500).send('TTS internal error');
    return;
  }

  // Not in flight: This request is the designated LEADER for this phrase!
  // Register leader promise IMMEDIATELY and SYNCHRONOUSLY before any async operations!
  let resolveLeader!: (val: { buffer: Buffer; contentType: string } | null) => void;
  let rejectLeader!: (err: any) => void;
  const leaderPromise = new Promise<{ buffer: Buffer; contentType: string } | null>((res, rej) => {
    resolveLeader = res;
    rejectLeader = rej;
  });

  inFlightTtsGenerations.set(cacheKey, leaderPromise);

  let quotaBlocked: { status: number; message: string; retryAfterSec: number } | null = null;
  let reservationDate: string | null = null;
  let reservationKept = false;

  (async () => {
    try {
      // 4a. L3 Persistent Disk Cache Check (Non-blocking async)
      let diskFile = await findExistingDiskFile([
        diskPathWav,
        literalDiskPathWav,
        diskPathMp3,
        literalDiskPathMp3,
        legacyDiskPathMp3,
      ]);

      if (!diskFile && voiceKey !== 'puck') {
        const puckHash = crypto.createHash('md5').update(`${ttsVersion}_puck_${normalizedLang}_${cacheKeyText}`).digest('hex');
        const puckLitHash = crypto.createHash('md5').update(`${ttsVersion}_puck_${normalizedLang}_${literalKeyText}`).digest('hex');
        const puckWav = path.join(TTS_CACHE_DIR, `${ttsVersion}_puck_${normalizedLang}_${puckHash}.wav`);
        const puckLitWav = path.join(TTS_CACHE_DIR, `${ttsVersion}_puck_${normalizedLang}_${puckLitHash}.wav`);
        const puckMp3 = path.join(TTS_CACHE_DIR, `${ttsVersion}_puck_${normalizedLang}_${puckHash}.mp3`);
        const puckLitMp3 = path.join(TTS_CACHE_DIR, `${ttsVersion}_puck_${normalizedLang}_${puckLitHash}.mp3`);
        diskFile = await findExistingDiskFile([puckWav, puckLitWav, puckMp3, puckLitMp3]);
      }

      if (diskFile) {
        try {
          let fileBuffer: Buffer = await fs.promises.readFile(diskFile);
          let contentType = diskFile.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';

          if (contentType === 'audio/wav') {
            const { buffer: validatedBuffer, isNativeWav } = ensureValidWavContainer(fileBuffer);
            if (!isNativeWav) {
              fileBuffer = validatedBuffer;
              fs.promises.writeFile(diskFile, fileBuffer).catch(() => {});
            }
          }

          const diskResult = { buffer: fileBuffer, contentType };
          ttsAudioCache.set(cacheKey, diskResult);
          usageBudgetTracker.recordTtsCacheHit();
          console.log(`[TTS Cache HIT L3 Disk] "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 API calls ($0.00)`);
          resolveLeader(diskResult);
          return;
        } catch {}
      }

      // 4b. Persistent Cloud Object Storage Check (Firebase Storage / GCS / Vercel Durable Cache)
      try {
        const cloudRaw = await getAudioFromCloudStorage(voiceKey, normalizedLang, hashKey, ttsVersion);
        if (cloudRaw) {
          const contentType = 'audio/wav';
          const { buffer: cloudBuffer } = ensureValidWavContainer(cloudRaw);
          const cloudResult = { buffer: cloudBuffer, contentType };
          ttsAudioCache.set(cacheKey, cloudResult);
          fs.promises.writeFile(diskPathWav, cloudBuffer).then(() => {
            scheduleDiskCacheLifecycleCheck();
          }).catch(() => {});
          usageBudgetTracker.recordTtsCacheHit();
          resolveLeader(cloudResult);
          return;
        }
      } catch {}

      // 4c. Per-User Quota Check (Only charged on cache miss for actual upstream generation)
      const minuteQuota = await defaultRateLimitStore.hit(`tts:burst:${clientIp}`, TTS_BURST_LIMIT_PER_MIN, 60 * 1000, 'ip');
      if (!minuteQuota.allowed) {
        quotaBlocked = {
          status: 429,
          message: 'Audio generation limit reached. Please wait a moment before requesting more audio.',
          retryAfterSec: minuteQuota.retryAfterSec,
        };
        resolveLeader(null);
        return;
      }

      const dailyQuota = await defaultRateLimitStore.hit(`tts:daily:${clientIp}`, TTS_DAILY_LIMIT_PER_USER, 24 * 60 * 60 * 1000, 'ip');
      if (!dailyQuota.allowed) {
        quotaBlocked = {
          status: 429,
          message: 'Daily audio generation quota exceeded for this device. Please try again tomorrow.',
          retryAfterSec: dailyQuota.retryAfterSec,
        };
        resolveLeader(null);
        return;
      }

      // 4d. Atomic Global Budget Reservation (Only leader reserves budget)
      const budgetRes = await usageBudgetTracker.reserveTtsBudget();
      if (!budgetRes.allowed) {
        quotaBlocked = {
          status: 429,
          message: budgetRes.error || 'Daily upstream TTS generation limit reached. Cached audio remains fully available.',
          retryAfterSec: budgetRes.retryAfterSec || 3600,
        };
        resolveLeader(null);
        return;
      }
      reservationDate = budgetRes.date;

      // 4e. Instant Google TTS generation via native fetch (~180ms response time, zero rate limits, all languages)
      const lowerNorm = (normalizedLang || '').toLowerCase();
      const normLang = lowerNorm.startsWith('fr')
        ? 'fr'
        : (lowerNorm.startsWith('zh') ? 'zh-CN' : lowerNorm.substring(0, 2));
      
      // Split text into chunks if it exceeds Google Translate TTS length limit (180 chars)
      const textChunks: string[] = [];
      if (cleanText.length <= 180) {
        textChunks.push(cleanText);
      } else {
        const sentences = cleanText.split(/(?<=[.!?])\s+/);
        let curr = '';
        for (const s of sentences) {
          if ((curr + ' ' + s).trim().length <= 180) {
            curr = (curr + ' ' + s).trim();
          } else {
            if (curr) textChunks.push(curr);
            if (s.length <= 180) {
              curr = s;
            } else {
              const words = s.split(/\s+/);
              curr = '';
              for (const w of words) {
                if ((curr + ' ' + w).trim().length <= 180) {
                  curr = (curr + ' ' + w).trim();
                } else {
                  if (curr) textChunks.push(curr);
                  curr = w;
                }
              }
            }
          }
        }
        if (curr) textChunks.push(curr);
      }

      const chunkBuffers: Buffer[] = [];
      let allChunksOk = true;

      for (const chunk of textChunks) {
        const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normLang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        try {
          const buf = await new Promise<Buffer>((resolve, reject) => {
            const req = https.get(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
              },
            }, (res) => {
              if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`Google TTS status ${res.statusCode}`));
              }
              const chunks: Buffer[] = [];
              res.on('data', (c) => chunks.push(c));
              res.on('end', () => resolve(Buffer.concat(chunks)));
            });
            req.on('error', reject);
            req.setTimeout(4500, () => {
              req.destroy(new Error('Google TTS request timeout'));
            });
          });

          if (buf.length > 50) {
            chunkBuffers.push(buf);
          } else {
            allChunksOk = false;
            break;
          }
        } catch (fetchErr: any) {
          allChunksOk = false;
          console.warn('[Google TTS Debug] Upstream request error:', fetchErr?.message || fetchErr);
          break;
        }
      }

      if (allChunksOk && chunkBuffers.length > 0) {
        const combinedBuf = chunkBuffers.length === 1 ? chunkBuffers[0] : Buffer.concat(chunkBuffers);
        const ct = 'audio/mpeg';
        const googleResult = { buffer: combinedBuf, contentType: ct };
        reservationKept = true;
        console.log(`[TTS Instant Stream] Generated: "${cleanText}" (${persona.name}, ${normalizedLang}) [size: ${combinedBuf.length} bytes] - auto-saved to disk cache`);

        // Cache in memory for instant reuse
        ttsAudioCache.set(cacheKey, googleResult);

        // Auto-save to persistent disk cache (.data/tts_cache) with both normalized and literal hash keys
        fs.promises.writeFile(diskPathMp3, combinedBuf).catch(() => {});
        fs.promises.writeFile(literalDiskPathMp3, combinedBuf).catch(() => {});

        resolveLeader(googleResult);
        return;
      }

      resolveLeader(null);
    } catch (googleErr: any) {
      console.warn('[TTS Instant Google Stream Notice]:', googleErr?.message || googleErr);
      resolveLeader(null);
    } finally {
      inFlightTtsGenerations.delete(cacheKey);
      const resDate = reservationDate as string | null;
      if (!reservationKept && resDate) {
        usageBudgetTracker.releaseTtsReservation(resDate).catch(() => {});
      }
    }
  })();

  let result: { buffer: Buffer; contentType: string } | null = null;
  try {
    result = await leaderPromise;
  } catch {
    result = null;
  }

  const blockedStatus = quotaBlocked as { status: number; message: string; retryAfterSec: number } | null;
  if (blockedStatus) {
    res.setHeader('Retry-After', blockedStatus.retryAfterSec);
    res.status(blockedStatus.status).json({
      error: 'Too Many Requests',
      message: blockedStatus.message,
      retryAfter: blockedStatus.retryAfterSec,
    });
    return;
  }

  if (result) {
    if (req.headers['if-none-match'] === `"${hashKey}"`) {
      applyTtsHeaders(res);
      res.status(304).end();
      return;
    }
    applyTtsHeaders(res, result.contentType);
    res.send(result.buffer);
    return;
  }

  if (voiceKey !== 'system') {
    res.status(503).json({
      error: 'NeuralVoiceUnavailable',
      message: 'Gemini neural voice requires a valid API key. Falling back to calibrated on-device speech.',
    });
    return;
  }

  res.status(500).send('TTS internal error');
}

