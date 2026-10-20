import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { defaultRateLimitStore, getClientIp } from './sharedRateLimitStore';
import { getVoicePersonaById } from '../data/voicePersonasData';
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

const ttsAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();
const inFlightTtsGenerations = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();
const translateTextCache = new Map<string, string>();

/**
 * Diagnostic helper to verify Level 3 server-side disk cache deployment readiness
 */
export function verifyLevel3DiskCache(): {
  status: 'VERIFIED_READY' | 'DEGRADED';
  path: string;
  cachedFilesCount: number;
  totalSizeBytes: number;
  writable: boolean;
  cloudStorage: ReturnType<typeof getCloudStorageStatus>;
  singleFlightActiveRequests: number;
} {
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

  const status = writable ? 'VERIFIED_READY' : 'DEGRADED';
  return {
    status,
    path: TTS_CACHE_DIR,
    cachedFilesCount,
    totalSizeBytes,
    writable,
    cloudStorage: getCloudStorageStatus(),
    singleFlightActiveRequests: inFlightTtsGenerations.size,
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
  return Buffer.from(Buffer.concat([header, pcmBuffer]));
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

  const clientIp = getClientIp(req);
  const hashKey = crypto.createHash('md5').update(`${voiceKey}_${normalizedLang}_${cleanText.toLowerCase()}`).digest('hex');
  const cacheKey = `${voiceKey}_${normalizedLang}_${cleanText.toLowerCase()}`;
  const diskPathWav = path.join(TTS_CACHE_DIR, `${voiceKey}_${normalizedLang}_${hashKey}.wav`);
  const diskPathMp3 = path.join(TTS_CACHE_DIR, `${voiceKey}_${normalizedLang}_${hashKey}.mp3`);
  const legacyDiskPathMp3 = path.join(TTS_CACHE_DIR, `${normalizedLang}_${hashKey}.mp3`);

  // 3. L1 In-Memory Cache Check (0ms latency, zero upstream calls)
  if (ttsAudioCache.has(cacheKey)) {
    usageBudgetTracker.recordTtsCacheHit();
    const cached = ttsAudioCache.get(cacheKey)!;
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
      const fileBuffer = await fs.promises.readFile(diskFile);
      const contentType = diskFile.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
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
    const cloudBuffer = await getAudioFromCloudStorage(voiceKey, normalizedLang, hashKey);
    if (cloudBuffer) {
      const contentType = 'audio/wav';
      ttsAudioCache.set(cacheKey, { buffer: cloudBuffer, contentType });
      // Cache to local container disk/tmp for 0ms subsequent hits on this instance
      fs.promises.writeFile(diskPathWav, cloudBuffer).catch(() => {});
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
              let buffer: any = Buffer.from(audioBase64, 'base64');
              const mime = inline?.mimeType || '';

              // If audio is raw PCM (e.g. Gemini 2.5 returns audio/L16;codec=pcm;rate=24000 without RIFF header), wrap in WAV container
              if (mime.includes('pcm') || mime.includes('L16') || !buffer.subarray(0, 4).toString('ascii').startsWith('RIFF')) {
                buffer = pcmToWav(buffer, 24000, 1, 16);
              }
              const contentType = 'audio/wav';

              console.log(`[TTS Upstream] Generated from Gemini (${model}): "${cleanText}" (${persona.label}) - 1 API call`);

              if (ttsAudioCache.size > 1000) {
                const firstKey = ttsAudioCache.keys().next().value;
                if (firstKey) ttsAudioCache.delete(firstKey);
              }
              ttsAudioCache.set(cacheKey, { buffer, contentType });

              // Asynchronously write to persistent disk cache & cloud storage
              fs.promises.writeFile(diskPathWav, buffer).catch(() => {});
              saveAudioToCloudStorage(voiceKey, normalizedLang, hashKey, buffer, contentType).catch(() => {});

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

      if (ttsAudioCache.size > 1000) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, { buffer, contentType });
      fs.promises.writeFile(diskPathMp3, buffer).catch(() => {});

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

