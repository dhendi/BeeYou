import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { defaultRateLimitStore, getClientIp } from './sharedRateLimitStore';
import { getVoicePersonaById, TTS_GENERATION_VERSION } from '../data/voicePersonasData';
import {
  getAudioFromCloudStorage,
  saveAudioToCloudStorage,
  getCloudStorageStatus,
} from './cloudStorageTtsCache';

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
// -------------------------------------------------------------
interface DailyUsageMetrics {
  date: string; // YYYY-MM-DD
  ttsUpstreamCalls: number;
  translateUpstreamCalls: number;
  ttsCacheHits: number;
  translateCacheHits: number;
  lastBudgetAlertSent?: number;
}

export class UsageBudgetTracker {
  private metricsFile: string;
  private currentMetrics: DailyUsageMetrics;
  private dailyTtsCap = 5000; // Hard cap on daily upstream TTS calls
  private dailyTranslateCap = 5000; // Hard cap on daily upstream translation calls
  private warningThreshold = 0.8; // Warn at 80% capacity

  constructor(customPath?: string) {
    const dataDir = path.join(process.cwd(), '.data');
    this.metricsFile = customPath || path.join(dataDir, 'usage_metrics.json');
    this.currentMetrics = this.loadMetrics();
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadMetrics(): DailyUsageMetrics {
    const today = this.getTodayString();
    try {
      if (fs.existsSync(this.metricsFile)) {
        const raw = fs.readFileSync(this.metricsFile, 'utf-8');
        const data = JSON.parse(raw);
        if (data && data.date === today) {
          return data;
        }
      }
    } catch {}

    return {
      date: today,
      ttsUpstreamCalls: 0,
      translateUpstreamCalls: 0,
      ttsCacheHits: 0,
      translateCacheHits: 0,
    };
  }

  private saveMetrics(): void {
    try {
      const dir = path.dirname(this.metricsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.currentMetrics, null, 2), 'utf-8');
    } catch {}
  }

  private checkRollover(): void {
    const today = this.getTodayString();
    if (this.currentMetrics.date !== today) {
      this.currentMetrics = {
        date: today,
        ttsUpstreamCalls: 0,
        translateUpstreamCalls: 0,
        ttsCacheHits: 0,
        translateCacheHits: 0,
      };
      this.saveMetrics();
    }
  }

  public recordTtsCacheHit(): void {
    this.checkRollover();
    this.currentMetrics.ttsCacheHits++;
    this.saveMetrics();
  }

  public recordTranslateCacheHit(): void {
    this.checkRollover();
    this.currentMetrics.translateCacheHits++;
    this.saveMetrics();
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

    // Check warning threshold
    if (this.currentMetrics.ttsUpstreamCalls >= this.dailyTtsCap * this.warningThreshold) {
      const now = Date.now();
      if (!this.currentMetrics.lastBudgetAlertSent || now - this.currentMetrics.lastBudgetAlertSent > 3600000) {
        console.warn(`[Budget Alert] TTS upstream usage at ${this.currentMetrics.ttsUpstreamCalls}/${this.dailyTtsCap} (${Math.round((this.currentMetrics.ttsUpstreamCalls / this.dailyTtsCap) * 100)}%) for ${this.currentMetrics.date}`);
        this.currentMetrics.lastBudgetAlertSent = now;
      }
    }

    return { allowed: true, remaining: this.dailyTtsCap - this.currentMetrics.ttsUpstreamCalls };
  }

  public recordTtsUpstream(): void {
    this.checkRollover();
    this.currentMetrics.ttsUpstreamCalls++;
    this.saveMetrics();
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
    this.saveMetrics();
  }

  public getMetrics(): DailyUsageMetrics {
    this.checkRollover();
    return { ...this.currentMetrics };
  }

  public resetForTesting(): void {
    this.currentMetrics = {
      date: this.getTodayString(),
      ttsUpstreamCalls: 0,
      translateUpstreamCalls: 0,
      ttsCacheHits: 0,
      translateCacheHits: 0,
    };
    this.saveMetrics();
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
    for (const f of files) {
      if (f.endsWith('.wav') || f.endsWith('.mp3')) {
        cachedFilesCount++;
        const stat = fs.statSync(path.join(TTS_CACHE_DIR, f));
        totalSizeBytes += stat.size;
      }
    }
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
 */
export function ensureValidWavContainer(
  buffer: Buffer,
  rawMime?: string,
  metadataSampleRate?: number
): { buffer: Buffer; sampleRate: number; isNativeWav: boolean } {
  // If already a valid RIFF WAV, read and return its native sample rate
  if (isValidRiffWav(buffer)) {
    const sampleRate = buffer.readUInt32LE(24) || 24000;
    return { buffer, sampleRate, isNativeWav: true };
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
const TTS_TIMEOUT_MS = 7500; // 7.5-second strict upstream timeout

/**
 * Handle Translation Requests with Validation, Timeouts, Multi-Tier Caching, and Abuse Protection.
 */
export async function handleTranslateRequest(req: Request, res: Response): Promise<void> {
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

  // 4. L2 Persistent Disk Cache Check
  if (fs.existsSync(diskPath)) {
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
  }

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

  // 6. Global Daily Budget & Circuit Breaker Check
  const budgetCheck = usageBudgetTracker.canMakeTranslateUpstream();
  if (!budgetCheck.allowed) {
    res.status(429).json({ error: 'Too Many Requests', message: budgetCheck.error });
    return;
  }

  // 7. Upstream Translation Request with AbortSignal Timeout
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=${encodeURIComponent(toLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(TRANSLATE_TIMEOUT_MS),
    });

    usageBudgetTracker.recordTranslateUpstream();

    if (!response.ok) {
      res.json({ translated: cleanText });
      return;
    }

    const data: any = await response.json();
    const translated = data?.[0]?.[0]?.[0] || cleanText;

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
  }
}

/**
 * Handle Text-to-Speech Requests with Validation, Timeouts, Multi-Tier Caching, and Abuse Protection.
 * Supports 20 Gemini 3.8 Flash-Lite Neural TTS Personas across Kids, Teens, Caring, and Professional categories.
 */
export async function handleTtsRequest(req: Request, res: Response): Promise<void> {
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
  // Include explicit TTS generation version in hashKey and cacheKey so bumping version guarantees fresh generation
  const hashKey = crypto.createHash('md5').update(`${ttsVersion}_${voiceKey}_${normalizedLang}_${cleanText.toLowerCase()}`).digest('hex');
  const cacheKey = `${ttsVersion}_${voiceKey}_${normalizedLang}_${cleanText.toLowerCase()}`;
  const diskPathWav = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${hashKey}.wav`);
  const diskPathMp3 = path.join(TTS_CACHE_DIR, `${ttsVersion}_${voiceKey}_${normalizedLang}_${hashKey}.mp3`);
  const legacyDiskPathMp3 = path.join(TTS_CACHE_DIR, `${normalizedLang}_${hashKey}.mp3`);

  // 3. L1 In-Memory Cache Check (0ms latency, zero upstream calls)
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    usageBudgetTracker.recordTtsCacheHit();
    console.log(`[TTS Cache HIT L1] "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 API calls ($0.00)`);
    if (req.headers['if-none-match'] === `"${hashKey}"`) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
    res.setHeader('ETag', `"${hashKey}"`);
    res.send(cached.buffer);
    return;
  }

  // 3b. Single-Flight Coalescing Early Check
  // If another concurrent request is currently generating this exact voice/phrase, join and await its completion
  // This avoids duplicate disk/cloud reads and ensures zero duplicate Gemini calls
  if (inFlightTtsGenerations.has(cacheKey)) {
    console.log(`[TTS Single-Flight JOIN] Concurrent request joined in-flight generation: "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 extra Gemini calls ($0.00)`);
    try {
      const joined = await inFlightTtsGenerations.get(cacheKey)!;
      if (joined) {
        usageBudgetTracker.recordTtsCacheHit();
        if (req.headers['if-none-match'] === `"${hashKey}"`) {
          res.status(304).end();
          return;
        }
        res.setHeader('Content-Type', joined.contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
        res.setHeader('ETag', `"${hashKey}"`);
        res.send(joined.buffer);
        return;
      }
    } catch (joinErr) {
      console.warn('[TTS Single-Flight Early Join Error]:', joinErr);
    }

    if (voiceKey !== 'system') {
      res.status(503).json({
        error: 'NeuralVoiceUnavailable',
        message: 'Gemini neural voice requires a valid API key. Falling back to calibrated on-device speech.',
      });
      return;
    }
    res.status(500).send('TTS internal error');
    return;
  }

  // 4. L3 Persistent Disk Cache Check
  const diskFile = fs.existsSync(diskPathWav)
    ? diskPathWav
    : (fs.existsSync(diskPathMp3) ? diskPathMp3 : (fs.existsSync(legacyDiskPathMp3) ? legacyDiskPathMp3 : null));

  if (diskFile) {
    try {
      let fileBuffer: Buffer = await fs.promises.readFile(diskFile);
      let contentType = diskFile.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';

      // Ensure disk cached WAV has a valid RIFF header
      if (contentType === 'audio/wav') {
        const { buffer: validatedBuffer, isNativeWav } = ensureValidWavContainer(fileBuffer);
        if (!isNativeWav) {
          fileBuffer = validatedBuffer;
          fs.promises.writeFile(diskFile, fileBuffer).catch(() => {});
        }
      }

      ttsAudioCache.set(cacheKey, { buffer: fileBuffer, contentType });
      usageBudgetTracker.recordTtsCacheHit();
      console.log(`[TTS Cache HIT L3 Disk] "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 API calls ($0.00)`);
      if (req.headers['if-none-match'] === `"${hashKey}"`) {
        res.status(304).end();
        return;
      }
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
      res.setHeader('ETag', `"${hashKey}"`);
      res.send(fileBuffer);
      return;
    } catch {}
  }

  // 4b. Persistent Cloud Object Storage Check (Firebase Storage / GCS / Vercel Durable Cache)
  // Ensures audio persists across Vercel serverless container recycles and cold starts
  try {
    const cloudRaw = await getAudioFromCloudStorage(voiceKey, normalizedLang, hashKey, ttsVersion);
    if (cloudRaw) {
      const contentType = 'audio/wav';
      const { buffer: cloudBuffer } = ensureValidWavContainer(cloudRaw);
      ttsAudioCache.set(cacheKey, { buffer: cloudBuffer, contentType });
      // Cache to local container disk/tmp for 0ms subsequent hits on this instance
      fs.promises.writeFile(diskPathWav, cloudBuffer).then(() => {
        scheduleDiskCacheLifecycleCheck();
      }).catch(() => {});
      usageBudgetTracker.recordTtsCacheHit();

      if (req.headers['if-none-match'] === `"${hashKey}"`) {
        res.status(304).end();
        return;
      }
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
      res.setHeader('ETag', `"${hashKey}"`);
      res.send(cloudBuffer);
      return;
    }
  } catch {}

  // 4c. Single-Flight Coalescing Secondary Check (catches requests that arrived during disk/cloud checks)
  if (inFlightTtsGenerations.has(cacheKey)) {
    console.log(`[TTS Single-Flight JOIN] Concurrent request joined in-flight generation: "${cleanText}" (${persona.name}, ${normalizedLang}) - 0 extra Gemini calls ($0.00)`);
    try {
      const joined = await inFlightTtsGenerations.get(cacheKey)!;
      if (joined) {
        usageBudgetTracker.recordTtsCacheHit();
        if (req.headers['if-none-match'] === `"${hashKey}"`) {
          res.status(304).end();
          return;
        }
        res.setHeader('Content-Type', joined.contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
        res.setHeader('ETag', `"${hashKey}"`);
        res.send(joined.buffer);
        return;
      }
    } catch (joinErr) {
      console.warn('[TTS Single-Flight Secondary Join Error]:', joinErr);
    }

    if (voiceKey !== 'system') {
      res.status(503).json({
        error: 'NeuralVoiceUnavailable',
        message: 'Gemini neural voice requires a valid API key. Falling back to calibrated on-device speech.',
      });
      return;
    }
    res.status(500).send('TTS internal error');
    return;
  }

  // 5. Per-User Quota Check (Only charged on cache miss that would trigger upstream call)
  const minuteQuota = await defaultRateLimitStore.hit(`tts:burst:${clientIp}`, TTS_BURST_LIMIT_PER_MIN, 60 * 1000, 'ip');
  if (!minuteQuota.allowed) {
    res.setHeader('Retry-After', minuteQuota.retryAfterSec);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Audio generation limit reached. Please wait a moment before requesting more audio.',
      retryAfter: minuteQuota.retryAfterSec,
    });
    return;
  }

  const dailyQuota = await defaultRateLimitStore.hit(`tts:daily:${clientIp}`, TTS_DAILY_LIMIT_PER_USER, 24 * 60 * 60 * 1000, 'ip');
  if (!dailyQuota.allowed) {
    res.setHeader('Retry-After', dailyQuota.retryAfterSec);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Daily audio generation quota exceeded for this device. Please try again tomorrow.',
      retryAfter: dailyQuota.retryAfterSec,
    });
    return;
  }

  // 6. Global Daily Budget & Circuit Breaker Check
  const budgetCheck = usageBudgetTracker.canMakeTtsUpstream();
  if (!budgetCheck.allowed) {
    res.status(429).json({ error: 'Too Many Requests', message: budgetCheck.error });
    return;
  }

  // 7. Single-Flight Registry: Register Leader Generation Promise
  // Any concurrent requests arriving during this generation will join the leader promise and share the result
  const generationPromise = (async (): Promise<{ buffer: Buffer; contentType: string } | null> => {
    let geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
          if (match) geminiApiKey = match[1].trim();
        }
      } catch {}
    }

    // Accept both classic AIzaSy keys and Google AI Studio AQ. keys
    const isValidGeminiKey = Boolean(geminiApiKey && geminiApiKey.trim().length > 15);

    if (isValidGeminiKey && voiceKey !== 'system') {
      const candidateModels = [
        'gemini-3.8-flash-lite-tts',
        'gemini-2.5-flash-preview-tts',
        'gemini-3.8-flash-tts',
      ];

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
          const textPart: any = { text: cleanText };
          // speech_metadata is exclusively supported on Gemini 3.8 models (Gemini 2.5 throws 400 Invalid Argument)
          if (model.includes('3.8')) {
            textPart.speech_metadata = {
              style: `${persona.style}, calm, steady, neutral intonation, matter-of-fact assistive communication, even-toned and clear without dramatic inflection or exaggerated emotion`,
            };
          }
          const payload = {
            contents: [{
              role: 'user',
              parts: [textPart],
            }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              ...(model.includes('3.8') ? {
                responseFormat: {
                  audio: {
                    mimeType: 'AUDIO_WAV',
                    sampleRate: 24000,
                  },
                },
              } : {}),
              speechConfig: {
                voiceConfig: {
                  voice: persona.geminiVoice || persona.name,
                },
              },
            },
          };

          const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'x-goog-api-key': geminiApiKey!,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
          });

          if (geminiRes.ok) {
            usageBudgetTracker.recordTtsUpstream();
            const geminiData: any = await geminiRes.json();
            const inline = geminiData?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
            const audioBase64 =
              inline?.data ||
              geminiData?.output_audio?.data ||
              geminiData?.outputAudio?.data;

            if (audioBase64) {
              const rawBuffer: Buffer = Buffer.from(audioBase64, 'base64');
              const rawMime = inline?.mimeType || geminiData?.output_audio?.mime_type || geminiData?.outputAudio?.mimeType || '';
              const metaRate = geminiData?.output_audio?.sample_rate || geminiData?.outputAudio?.sampleRate;

              // Inspect response format and sample rate, adding a valid WAV header if raw PCM
              const { buffer, sampleRate, isNativeWav } = ensureValidWavContainer(rawBuffer, rawMime, metaRate);
              const contentType = 'audio/wav';

              console.log(
                `[TTS Upstream] Generated from Gemini (${model}): "${cleanText}" (${persona.label}) [format: ${isNativeWav ? 'Native RIFF WAV' : 'Raw PCM -> Wrapped 44-byte RIFF WAV'}, sampleRate: ${sampleRate}Hz, size: ${buffer.length} bytes] - 1 API call`
              );

              ttsAudioCache.set(cacheKey, { buffer, contentType });

              // Asynchronously write to persistent disk cache & cloud storage
              fs.promises.writeFile(diskPathWav, buffer).then(() => {
                scheduleDiskCacheLifecycleCheck();
              }).catch(() => {});
              saveAudioToCloudStorage(voiceKey, normalizedLang, hashKey, buffer, contentType, ttsVersion).catch(() => {});

              return { buffer, contentType };
            }
          } else {
            const errText = await geminiRes.text().catch(() => '');
            console.warn(`[Gemini TTS (${model}) Error] Status ${geminiRes.status}: ${errText.slice(0, 150)}... Trying next model.`);
          }
        } catch (err: any) {
          console.warn(`[Gemini TTS (${model})] Upstream call failed:`, err?.message || err);
        }
      }
    }

    // If neural persona requested and Gemini unavailable, return null to prompt calibrated on-device speech fallback
    if (voiceKey !== 'system') {
      return null;
    }

    // Default system fallback for non-persona translation speech
    try {
      const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normalizedLang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
        signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
      });

      usageBudgetTracker.recordTtsUpstream();

      if (!response.ok) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'audio/mpeg';

      ttsAudioCache.set(cacheKey, { buffer, contentType });
      fs.promises.writeFile(diskPathMp3, buffer).then(() => {
        scheduleDiskCacheLifecycleCheck();
      }).catch(() => {});

      return { buffer, contentType };
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        console.warn('[TTS Proxy Timeout]:', err);
      } else {
        console.error('[TTS Proxy Error]:', err);
      }
      return null;
    }
  })();

  inFlightTtsGenerations.set(cacheKey, generationPromise);

  let result: { buffer: Buffer; contentType: string } | null = null;
  try {
    result = await generationPromise;
  } finally {
    inFlightTtsGenerations.delete(cacheKey);
  }

  if (result) {
    if (req.headers['if-none-match'] === `"${hashKey}"`) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
    res.setHeader('ETag', `"${hashKey}"`);
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

// Initialize non-blocking background disk cache lifecycle check
scheduleDiskCacheLifecycleCheck();

