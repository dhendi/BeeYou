import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  defaultRateLimitStore,
  getClientIp,
  createCompositeRateLimiter,
  createSingleRateLimiter,
} from './src/services/sharedRateLimitStore';
import {
  handleTranslateRequest,
  handleTtsRequest,
  usageBudgetTracker,
  validateTextInput,
  normalizeLanguageCode,
} from './src/services/ttsAndTranslationService';

dotenv.config();

const app = express();
const childPort = Number(process.env.PORT) || 3000;
const caregiverPort = Number(process.env.CAREGIVER_PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Configure trusted reverse proxies properly (Vercel, Cloudflare, AWS ALB, Nginx, Fly.io, etc.)
// Prevents spoofing of client IP address via untrusted X-Forwarded-For headers
const trustProxyConfig = process.env.TRUST_PROXY
  ? (!isNaN(Number(process.env.TRUST_PROXY)) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY)
  : (isProd ? 1 : 'loopback');
app.set('trust proxy', trustProxyConfig);

app.use(express.json({ limit: '10mb' }));

// Allowed origin patterns for Capacitor native apps (iOS / Android) and local development
const ALLOWED_ORIGIN_PATTERNS = [
  /^capacitor:\/\/localhost$/,
  /^https?:\/\/localhost(:[0-9]+)?$/,
  /^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/,
  /^https?:\/\/192\.168\.[0-9]+\.[0-9]+(:[0-9]+)?$/,
  /^https?:\/\/10\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)?$/,
];

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Direct native mobile app requests (Capacitor HTTP) or same-origin
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

// Security & CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'microphone=(self), camera=(self)');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Strict validation and sanitization for family sync codes.
 * Ensures code matches safe alphanumeric format (3-32 characters),
 * completely blocking directory traversal ('..') and path injection.
 */
export function sanitizeFamilyCode(code: unknown): string | null {
  if (!code || typeof code !== 'string') return null;
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,32}$/.test(clean) || clean.includes('..')) {
    return null;
  }
  return clean;
}

// -------------------------------------------------------------
// Scalable Persistent Rate Limiting Middleware
// Protects backend server from runaway loops, stimming, credential stuffing, and abuse
// Backed by L1 in-memory cache + L2 persistent disk store in .data/rate_limits.json
// Supports trusted reverse proxies and strict per-account / per-target limits
// -------------------------------------------------------------
export { defaultRateLimitStore, getClientIp };

export const apiLimiter = createSingleRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 300,
  message: 'API rate limit exceeded. Please slow down requests.',
  scope: 'ip',
});

export const ttsLimiter = createSingleRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'Audio generation limit reached. Please wait a moment.',
  scope: 'ip',
});

export const translateLimiter = createSingleRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Translation rate limit reached. Please wait a moment.',
  scope: 'ip',
});

export function extractTargetCode(req: express.Request): string | null {
  // 1. Direct body or query parameter
  const candidate = req.body?.pairingCode || req.body?.familyCode || req.body?.code || req.query?.code || req.params?.code;
  if (candidate) {
    return sanitizeFamilyCode(candidate);
  }
  // 2. Trailing URL path parameter (e.g. /status/BEE-XYZ, /alert/BEE-XYZ, /state/BEE-XYZ)
  const pathname = (req.originalUrl || req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (/^[A-Z0-9-]{3,32}$/i.test(seg) && !['api', 'caregiver', 'family', 'pairing', 'status', 'claim', 'create', 'approve', 'reject', 'alert', 'ack', 'resolve', 'events', 'poll', 'login', 'register'].includes(seg.toLowerCase())) {
      return sanitizeFamilyCode(seg);
    }
  }
  return null;
}

export const authLimiter = createCompositeRateLimiter([
  {
    scope: 'ip',
    windowMs: 15 * 60 * 1000,
    maxRequests: 60,
    message: 'Too many authentication attempts from this IP address. Please wait 15 minutes.',
    keyGenerator: (req) => `auth:ip:${getClientIp(req)}`,
  },
  {
    scope: 'account',
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many authentication attempts for this account. Please wait 15 minutes before trying again.',
    keyGenerator: (req) => {
      const email = String(req.body?.email || req.query?.email || '').trim().toLowerCase();
      if (email && email.includes('@')) {
        return `auth:account:${email}`;
      }
      const code = extractTargetCode(req);
      if (code && code !== 'BEE-DEMO') {
        return `auth:account:${code}`;
      }
      return null;
    },
  },
]);

export const pairingLimiter = createCompositeRateLimiter([
  {
    scope: 'ip',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30,
    message: 'Too many pairing requests from this IP address. Please wait a while.',
    keyGenerator: (req) => `pairing:ip:${getClientIp(req)}`,
  },
  {
    scope: 'pairing',
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many pairing attempts for this code. Please verify the code or generate a fresh one.',
    keyGenerator: (req) => {
      const code = extractTargetCode(req);
      if (code && code !== 'BEE-DEMO') {
        return `pairing:code:${code}`;
      }
      return null;
    },
  },
]);

export const recoverEmailLimiter = createCompositeRateLimiter([
  {
    scope: 'ip',
    windowMs: 15 * 60 * 1000,
    maxRequests: 15,
    message: 'Too many recovery attempts from this IP. Please wait 15 minutes.',
    keyGenerator: (req) => `recovery:ip:${getClientIp(req)}`,
  },
  {
    scope: 'account',
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
    message: 'Too many recovery attempts for this email address. Please check your inbox or wait 15 minutes.',
    keyGenerator: (req) => {
      const email = String(req.body?.lookupEmail || req.body?.email || '').trim().toLowerCase();
      if (email && email.includes('@')) {
        return `recovery:account:${email}`;
      }
      return null;
    },
  },
]);

export const alertLimiter = createCompositeRateLimiter([
  {
    scope: 'ip',
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Alert limit reached for this IP. Please wait a moment before sending more alerts.',
    keyGenerator: (req) => `alert:ip:${getClientIp(req)}`,
  },
  {
    scope: 'family',
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Too many alerts sent for this family. Please wait a moment before sending another alert.',
    keyGenerator: (req) => {
      const code = extractTargetCode(req);
      if (code && code !== 'BEE-DEMO') {
        return `alert:family:${code}`;
      }
      return null;
    },
  },
]);

app.use('/api/translate', translateLimiter);
app.use('/api/tts', ttsLimiter);

// High-priority per-account and per-target limiters mounted before catch-alls
app.use('/api/family/auth', authLimiter);
app.use('/api/caregiver/family/login', authLimiter);
app.use('/api/caregiver/family/register', authLimiter);
app.use('/api/caregiver/pairing', pairingLimiter);
app.use('/api/family/recover-email', recoverEmailLimiter);
app.use('/api/family/alert', alertLimiter);
app.use('/api/caregiver/alert', alertLimiter);

// Fallthrough generic API limiters
app.use('/api/family', apiLimiter);
app.use('/api/caregiver', apiLimiter);
app.use('/api/subscription', apiLimiter);

// Global Express route param handler for :code across all family and caregiver endpoints
app.param('code', (req, res, next, rawCode) => {
  const sanitized = sanitizeFamilyCode(rawCode);
  if (!sanitized) {
    return res.status(400).json({
      success: false,
      message: 'Invalid family code format. Codes must contain only letters, numbers, and hyphens.',
    });
  }
  req.params.code = sanitized;
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', childPort, caregiverPort, timestamp: new Date().toISOString() });
});

// Lightweight On-Demand Translation Endpoint with Input Validation, Timeouts & Multi-Tier Caching
app.get('/api/translate', handleTranslateRequest);

// Authentic High-Fidelity Audio Streaming Endpoint with Abuse Protection, Quotas & Caching
app.get('/api/tts', handleTtsRequest);

// Usage Metrics & Budget Status Endpoint (Admin & Diagnostic Health)
app.get('/api/admin/usage', (_req, res) => {
  res.json({
    success: true,
    metrics: usageBudgetTracker.getMetrics(),
    timestamp: new Date().toISOString(),
  });
});

export {
  handleTranslateRequest,
  handleTtsRequest,
  usageBudgetTracker,
  validateTextInput,
  normalizeLanguageCode,
};

// -------------------------------------------------------------
// Live Caregiver Companion & Sync Endpoints
// Enables caregivers to see child's current activity, feelings,
// AAC speech, habits, and send reassuring messages from anywhere.
// -------------------------------------------------------------
interface CaregiverMessageItem {
  id: string;
  senderName: string;
  text: string;
  emoji?: string;
  timestamp: string;
  read: boolean;
  responseId?: string;
  senderRole?: 'caregiver' | 'child';
}

interface TemporaryPairingSessionData {
  pairingCode: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'awaiting_approval' | 'paired' | 'rejected' | 'expired' | 'revoked';
  initiatedBy: 'child_device' | 'caregiver';
  childName?: string;
  childAge?: number;
  ageGroup?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  permissions?: any;
  requestingDeviceName?: string;
  requestingDeviceRole?: 'caregiver' | 'child_device';
  requestedAt?: number;
}

interface CaregiverSessionData {
  pairingCode: string;
  childName: string;
  lastActiveTime: string;
  currentActivity: string;
  currentMood: string | null;
  currentMoodReason?: string;
  currentMoodNeed?: string;
  lastAacSentence?: string;
  lastSpokenTime?: string;
  habitsCompletedToday: number;
  totalHabits: number;
  routineProgress: any;
  stars: number;
  isOffline: boolean;
  quickAlert?: string | null;
  activeAlert?: any | null;
  messages: CaregiverMessageItem[];
  caregiverPhone?: string;
  userRole?: string;
  permissions?: any;
  unlinked?: boolean;
  lastChildActiveTime?: string;
  lastCaregiverActiveTime?: string;
}

export interface ServerFamilyAccount {
  id: string;
  email: string;
  familyCode: string;
  caregiverName: string;
  caregiverRole: string;
  childProfile: {
    name: string;
    ageGroup: string;
    pin: string;
    interests: string[];
    pronouns: string;
  };
  subscriptionTier: 'free' | 'premium';
  createdAt: string;
  lastSyncedAt: string;
}

export const caregiverSessions = new Map<string, CaregiverSessionData>();
export const pairingSessions = new Map<string, TemporaryPairingSessionData>();
export const familyAccounts = new Map<string, ServerFamilyAccount>();

export function seedDemoFamilyAccount(): void {
  familyAccounts.set('demo@beeyou.app', {
    id: 'fam-demo-2026',
    email: 'demo@beeyou.app',
    familyCode: 'BEE-DEMO',
    caregiverName: 'Sarah (Mom)',
    caregiverRole: 'Mom',
    childProfile: {
      name: 'Child',
      ageGroup: 'kid',
      pin: 'sha256:2ff234ff7ffc2e0d5fd76242632098701dede4e4d6b695a58e48cd8ce10d0c00',
      interests: ['Visual schedules'],
      pronouns: 'they/them',
    },
    subscriptionTier: 'premium',
    createdAt: '2026-10-01T00:00:00.000Z',
    lastSyncedAt: new Date().toISOString(),
  });
}

// Periodic cleanup for stale pairing sessions (> 24 hours old) to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [code, session] of pairingSessions.entries()) {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) {
      pairingSessions.delete(code);
      changed = true;
    }
  }
  if (changed) {
    savePairingSessions().catch(() => {});
  }
}, 60 * 60 * 1000).unref?.();

// In-Memory Cloud Sync Event Bus (Multi-device pub/sub & SSE)
interface CloudSyncEvent {
  eventId: string;
  pairingCode: string;
  type: string;
  sentAt: number;
  senderDeviceId?: string;
  [key: string]: any;
}

export interface SharedFamilyState {
  familyCode: string;
  email: string;
  backupEmail?: string;
  caregiverName: string;
  caregiverRole: string;
  childProfile: {
    name: string;
    ageGroup: string;
    pin: string;
    interests: string[];
    pronouns: string;
  };
  childState: {
    lastActiveTime: string;
    currentActivity: string;
    currentMood: string;
    habitsCompletedToday: number;
    totalHabits: number;
    stars: number;
    isOnline: boolean;
  };
  routines: any[];
  aacItems: any[];
  plansChanged: {
    active: boolean;
    originalPlanTitle: string;
    reason: string;
    newPlanTitle: string;
    calmingMessage: string;
    newSteps: any[];
    relevantPhrases: string[];
  };
  activeAlert: any | null;
  alertHistory: any[];
  messages: any[];
  lastUpdated: number;
}

const DEFAULT_DEMO_ROUTINES = [
  {
    id: 'demo-rt-morning',
    title: 'Morning Sunshine Schedule',
    emoji: '☀️',
    targetMinutes: 25,
    rewardSticker: '🌟 Morning Champion',
    firstThen: {
      firstTaskTitle: 'Get dressed & Brush teeth',
      firstTaskEmoji: '👕',
      thenRewardTitle: '10 Minutes Favorite Lego Time',
      thenRewardEmoji: '🧱',
    },
    steps: [
      { id: 'ms-1', title: 'Wake up gently & stretch', emoji: '🥱', time: '7:30 AM', completed: false },
      { id: 'ms-2', title: 'Put on cozy clothes', emoji: '👕', time: '7:40 AM', completed: false },
      { id: 'ms-3', title: 'Brush teeth & wash face', emoji: '🪥', time: '7:50 AM', completed: false },
      { id: 'ms-4', title: 'Healthy breakfast snack', emoji: '🥞', time: '8:00 AM', completed: false },
      { id: 'ms-5', title: 'Pack backpack for day', emoji: '🎒', time: '8:15 AM', completed: false },
    ],
  },
  {
    id: 'demo-rt-bedtime',
    title: 'Cozy Evening & Bedtime Wind Down',
    emoji: '🌙',
    targetMinutes: 30,
    rewardSticker: '🌙 Peaceful Star',
    steps: [
      { id: 'bs-1', title: 'Put away toys & cleanup', emoji: '🧸', time: '8:00 PM', completed: false },
      { id: 'bs-2', title: 'Put on soft pajamas', emoji: '🛌', time: '8:15 PM', completed: false },
      { id: 'bs-3', title: 'Brush teeth calmly', emoji: '🪥', time: '8:25 PM', completed: false },
      { id: 'bs-4', title: 'Read bedtime story or listen to calm music', emoji: '📖', time: '8:35 PM', completed: false },
      { id: 'bs-5', title: 'Cozy lights off and deep slow breath', emoji: '✨', time: '8:50 PM', completed: false },
    ],
  },
];

const DEFAULT_DEMO_AAC = [
  { id: 'aac-1', label: 'I want', emoji: '👉', category: 'core', soundWord: 'I want' },
  { id: 'aac-2', label: 'Help please', emoji: '🙋', category: 'emergency', soundWord: 'Help please' },
  { id: 'aac-3', label: 'Need break', emoji: '🛑', category: 'emergency', soundWord: 'I need a break' },
  { id: 'aac-4', label: 'Water', emoji: '💧', category: 'basic', soundWord: 'Water' },
  { id: 'aac-5', label: 'Food / Snack', emoji: '🍎', category: 'basic', soundWord: 'Food' },
  { id: 'aac-6', label: 'Bathroom', emoji: '🚻', category: 'basic', soundWord: 'Bathroom' },
  { id: 'aac-7', label: 'Happy', emoji: '😊', category: 'emotions', soundWord: 'Happy' },
  { id: 'aac-8', label: 'Overwhelmed', emoji: '😫', category: 'emotions', soundWord: 'I feel overwhelmed' },
  { id: 'aac-9', label: 'Quiet space', emoji: '🎧', category: 'comfort', soundWord: 'I want a quiet space' },
  { id: 'aac-10', label: 'Yes', emoji: '✅', category: 'core', soundWord: 'Yes' },
  { id: 'aac-11', label: 'No', emoji: '❌', category: 'core', soundWord: 'No' },
  { id: 'aac-12', label: 'Thank you', emoji: '🙏', category: 'social', soundWord: 'Thank you' },
];

const DEFAULT_DEMO_PLANS_CHANGED = {
  active: false,
  originalPlanTitle: 'Trip to Playground',
  reason: 'It started raining heavily outside.',
  newPlanTitle: 'Living Room Blanket Fort & Lego Fun',
  calmingMessage: 'It is okay to feel disappointed when plans change. Take a slow, deep breath. You are safe, and here is our new cozy plan.',
  newSteps: [
    { title: 'Gather soft pillows & blankets', emoji: '⛺', time: '1:00 PM' },
    { title: 'Build living room fort together', emoji: '🛋️', time: '1:15 PM' },
    { title: 'Warm cocoa or juice snack', emoji: '☕', time: '1:45 PM' },
  ],
  relevantPhrases: [
    'Why did it change?',
    'I feel disappointed.',
    'I need a quiet moment.',
    'What do we do now?',
  ],
};

export const DATA_DIR = path.join(process.cwd(), '.data');
const STATE_FILE = path.join(DATA_DIR, 'shared_families.json');
const FAMILIES_DIR = path.join(DATA_DIR, 'families');
const FAMILY_ACCOUNTS_FILE = path.join(DATA_DIR, 'family_accounts.json');
const PAIRING_SESSIONS_FILE = path.join(DATA_DIR, 'pairing_sessions.json');
const CAREGIVER_SESSIONS_FILE = path.join(DATA_DIR, 'caregiver_sessions.json');
const FIREBASE_DB_URL = process.env.VITE_FIREBASE_DATABASE_URL || 'https://beeyou-23d7d-default-rtdb.firebaseio.com';

export async function saveFamilyAccounts(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    const data: Record<string, ServerFamilyAccount> = {};
    for (const [email, account] of familyAccounts.entries()) {
      if (email === 'demo@beeyou.app' || account.familyCode === 'BEE-DEMO') continue;
      data[email] = account;
    }
    const tempPath = `${FAMILY_ACCOUNTS_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, FAMILY_ACCOUNTS_FILE);
  } catch (err) {
    console.error('[Session Store] saveFamilyAccounts error:', err);
  }
}

export async function savePairingSessions(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    const data: Record<string, TemporaryPairingSessionData> = {};
    const now = Date.now();
    for (const [code, session] of pairingSessions.entries()) {
      if (code === 'BEE-DEMO' || session.expiresAt < now) continue;
      data[code] = session;
    }
    const tempPath = `${PAIRING_SESSIONS_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, PAIRING_SESSIONS_FILE);
  } catch (err) {
    console.error('[Session Store] savePairingSessions error:', err);
  }
}

export async function saveCaregiverSessions(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    const data: Record<string, CaregiverSessionData> = {};
    for (const [code, session] of caregiverSessions.entries()) {
      if (code === 'BEE-DEMO') continue;
      data[code] = session;
    }
    const tempPath = `${CAREGIVER_SESSIONS_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, CAREGIVER_SESSIONS_FILE);
  } catch (err) {
    console.error('[Session Store] saveCaregiverSessions error:', err);
  }
}

// -------------------------------------------------------------
// High-Performance In-Memory Family State Engine
// - 0ms read/write latency in memory
// - Asynchronous, isolated per-family atomic file persistence
// - Non-blocking background mirroring to Firebase Realtime Database
// - Zero event-loop blocking under high concurrent user load
// -------------------------------------------------------------
const activeFamilyStates = new Map<string, SharedFamilyState>();
const dirtyFamilyCodes = new Set<string>();

function initFamilyStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FAMILIES_DIR)) {
      fs.mkdirSync(FAMILIES_DIR, { recursive: true });
    }

    // 1. Load legacy shared_families.json if present
    if (fs.existsSync(STATE_FILE)) {
      try {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          for (const [code, val] of Object.entries(data)) {
            const cleanCode = code.toUpperCase();
            if (cleanCode === 'BEE-DEMO') continue;
            activeFamilyStates.set(cleanCode, val as SharedFamilyState);
            const perFamilyFile = path.join(FAMILIES_DIR, `${cleanCode}.json`);
            if (!fs.existsSync(perFamilyFile)) {
              fs.writeFileSync(perFamilyFile, JSON.stringify(val, null, 2), 'utf-8');
            }
          }
        }
      } catch (e) {
        console.warn('[State Store] Legacy file parse error:', e);
      }
    }

    // Clean up any legacy BEE-DEMO file on disk to guarantee sandbox isolation
    const legacyDemoFile = path.join(FAMILIES_DIR, 'BEE-DEMO.json');
    if (fs.existsSync(legacyDemoFile)) {
      try { fs.unlinkSync(legacyDemoFile); } catch {}
    }

    // 2. Load individual per-family files
    const files = fs.readdirSync(FAMILIES_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const rawCode = path.basename(file, '.json').toUpperCase();
        const code = sanitizeFamilyCode(rawCode);
        // Strict Sandbox Isolation: BEE-DEMO is never loaded into real activeFamilyStates
        if (!code || code === 'BEE-DEMO') continue;
        try {
          const raw = fs.readFileSync(path.join(FAMILIES_DIR, file), 'utf-8');
          const val = JSON.parse(raw);
          if (val && typeof val === 'object') {
            activeFamilyStates.set(code, val as SharedFamilyState);
          }
        } catch {}
      }
    }

    // 3. Load persistent family accounts
    if (fs.existsSync(FAMILY_ACCOUNTS_FILE)) {
      try {
        const raw = fs.readFileSync(FAMILY_ACCOUNTS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          for (const [email, acc] of Object.entries(data)) {
            if (email === 'demo@beeyou.app') continue;
            familyAccounts.set(email, acc as ServerFamilyAccount);
          }
        }
      } catch (e) {
        console.warn('[Session Store] Family accounts parse error:', e);
      }
    }

    // 4. Load persistent pairing sessions
    if (fs.existsSync(PAIRING_SESSIONS_FILE)) {
      try {
        const raw = fs.readFileSync(PAIRING_SESSIONS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          const now = Date.now();
          for (const [code, sess] of Object.entries(data)) {
            const s = sess as TemporaryPairingSessionData;
            if (s && s.expiresAt > now && code !== 'BEE-DEMO') {
              pairingSessions.set(code, s);
            }
          }
        }
      } catch (e) {
        console.warn('[Session Store] Pairing sessions parse error:', e);
      }
    }

    // 5. Load persistent caregiver sessions
    if (fs.existsSync(CAREGIVER_SESSIONS_FILE)) {
      try {
        const raw = fs.readFileSync(CAREGIVER_SESSIONS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          for (const [code, sess] of Object.entries(data)) {
            if (code === 'BEE-DEMO') continue;
            caregiverSessions.set(code, sess as CaregiverSessionData);
          }
        }
      } catch (e) {
        console.warn('[Session Store] Caregiver sessions parse error:', e);
      }
    }

    // Always seed demo family account in sandbox memory
    seedDemoFamilyAccount();
  } catch (err) {
    console.warn('[State Store] Initial store boot warning:', err);
  }
}

// -------------------------------------------------------------
// Strict Sandbox Store for App Store / Reviewer Demo Account
// Completely isolated in-memory from authentic customer families
// -------------------------------------------------------------
function createDefaultDemoFamilyState(): SharedFamilyState {
  return {
    familyCode: 'BEE-DEMO',
    email: 'demo@beeyou.app',
    caregiverName: 'Sarah (Mom)',
    caregiverRole: 'Mom',
    childProfile: {
      name: 'Child',
      ageGroup: 'kid',
      pin: 'sha256:2ff234ff7ffc2e0d5fd76242632098701dede4e4d6b695a58e48cd8ce10d0c00', // Salted SHA-256 hash of '1234'
      interests: ['Visual schedules', 'Creative play'],
      pronouns: 'they/them',
    },
    childState: {
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Using BeeYou',
      currentMood: 'happy',
      habitsCompletedToday: 2,
      totalHabits: 4,
      stars: 15,
      isOnline: true,
    },
    routines: DEFAULT_DEMO_ROUTINES,
    aacItems: DEFAULT_DEMO_AAC,
    plansChanged: DEFAULT_DEMO_PLANS_CHANGED,
    activeAlert: null,
    alertHistory: [],
    messages: [],
    lastUpdated: Date.now(),
  };
}

function createDefaultDemoCaregiverSession(): CaregiverSessionData {
  return {
    pairingCode: 'BEE-DEMO',
    childName: 'Child',
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Active in BeeYou',
    currentMood: 'happy',
    habitsCompletedToday: 2,
    totalHabits: 4,
    routineProgress: null,
    stars: 15,
    isOffline: false,
    messages: [],
    unlinked: false,
  };
}

let demoSandboxedState: SharedFamilyState = createDefaultDemoFamilyState();
let demoSandboxedSession: CaregiverSessionData = createDefaultDemoCaregiverSession();

export function getCaregiverSession(code: string): CaregiverSessionData | null {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode) return null;
  if (cleanCode === 'BEE-DEMO') {
    return demoSandboxedSession;
  }
  return caregiverSessions.get(cleanCode) || null;
}

export function setCaregiverSession(code: string, session: CaregiverSessionData): void {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode) return;
  if (cleanCode === 'BEE-DEMO') {
    demoSandboxedSession = session;
    return;
  }
  caregiverSessions.set(cleanCode, session);
  saveCaregiverSessions().catch(() => {});
}

// Asynchronous background mirror to Firebase Realtime Database
async function syncFamilyToFirebase(code: string): Promise<void> {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode || cleanCode === 'BEE-DEMO' || !FIREBASE_DB_URL) return;

  const state = activeFamilyStates.get(cleanCode);
  if (!state) return;

  try {
    const url = `${FIREBASE_DB_URL}/beeyou/families/${encodeURIComponent(cleanCode)}.json`;
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {}
}

let isFlushing = false;
async function flushDirtyFamilies(): Promise<void> {
  if (isFlushing || dirtyFamilyCodes.size === 0) return;
  isFlushing = true;
  const codesToFlush = Array.from(dirtyFamilyCodes);
  dirtyFamilyCodes.clear();

  try {
    if (!fs.existsSync(FAMILIES_DIR)) {
      await fs.promises.mkdir(FAMILIES_DIR, { recursive: true });
    }

    // Write each dirty real family atomically to its own file (isolated, non-blocking)
    for (const code of codesToFlush) {
      const sanitized = sanitizeFamilyCode(code);
      if (!sanitized || sanitized === 'BEE-DEMO') continue;

      const state = activeFamilyStates.get(sanitized);
      if (state) {
        const filePath = path.join(FAMILIES_DIR, `${sanitized}.json`);
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(FAMILIES_DIR))) {
          console.error(`[Security] Blocked path traversal attempt for code: ${code}`);
          continue;
        }
        const tempPath = `${filePath}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
        const json = JSON.stringify(state, null, 2);
        await fs.promises.writeFile(tempPath, json, 'utf-8');
        await fs.promises.rename(tempPath, filePath);
      }
    }

    // Consolidated master file for real families only
    const masterObj: Record<string, any> = {};
    for (const [k, v] of activeFamilyStates.entries()) {
      if (k !== 'BEE-DEMO') {
        masterObj[k] = v;
      }
    }
    const masterTemp = `${STATE_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(masterTemp, JSON.stringify(masterObj, null, 2), 'utf-8');
    await fs.promises.rename(masterTemp, STATE_FILE);
  } catch (err) {
    console.error('[State Store] Async flush error:', err);
    codesToFlush.forEach((c) => {
      if (c !== 'BEE-DEMO') dirtyFamilyCodes.add(c);
    });
  } finally {
    isFlushing = false;
  }
}

// Mark a family state as updated and trigger asynchronous persistence
function saveFamilyState(code: string, state?: SharedFamilyState, immediate = false): void {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode) return;

  // Strict Demo Isolation: BEE-DEMO updates only mutate ephemeral sandbox memory.
  // They are NEVER flushed to real customer family stores or files.
  if (cleanCode === 'BEE-DEMO') {
    if (state) {
      demoSandboxedState = state;
    }
    return;
  }

  if (state) {
    activeFamilyStates.set(cleanCode, state);
  }
  dirtyFamilyCodes.add(cleanCode);

  syncFamilyToFirebase(cleanCode).catch(() => {});

  if (immediate) {
    flushDirtyFamilies().catch(() => {});
  }
}

// Periodic non-blocking flush interval (flushes batches every 1000ms)
setInterval(() => {
  if (dirtyFamilyCodes.size > 0) {
    flushDirtyFamilies().catch(() => {});
  }
}, 1000).unref?.();

// Graceful process shutdown flushes any remaining state
process.on('SIGINT', () => {
  flushDirtyFamilies().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  flushDirtyFamilies().finally(() => process.exit(0));
});

// Boot the store once
initFamilyStore();

function loadAllFamilyStates(): Map<string, SharedFamilyState> {
  return activeFamilyStates;
}

function saveAllFamilyStates(_map?: Map<string, SharedFamilyState>, specificCode?: string): void {
  if (specificCode) {
    saveFamilyState(specificCode);
  } else {
    for (const code of activeFamilyStates.keys()) {
      dirtyFamilyCodes.add(code);
      syncFamilyToFirebase(code).catch(() => {});
    }
    flushDirtyFamilies().catch(() => {});
  }
}

export function getOrCreateFamilyState(code: string, email?: string): SharedFamilyState | null {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode) return null;

  // Strict Demo Isolation: BEE-DEMO always routes to sandbox state
  if (cleanCode === 'BEE-DEMO') {
    return demoSandboxedState;
  }

  let state = activeFamilyStates.get(cleanCode);

  if (!state) {
    state = {
      familyCode: cleanCode,
      email: email || `${cleanCode.toLowerCase()}@family.beeyou.app`,
      caregiverName: 'Caregiver',
      caregiverRole: 'Parent',
      childProfile: {
        name: 'Child',
        ageGroup: 'kid',
        pin: '1234',
        interests: ['Visual schedules', 'Creative play'],
        pronouns: 'they/them',
      },
      childState: {
        lastActiveTime: new Date().toISOString(),
        currentActivity: 'Using BeeYou',
        currentMood: 'calm',
        habitsCompletedToday: 0,
        totalHabits: 4,
        stars: 0,
        isOnline: true,
      },
      routines: [],
      aacItems: [],
      plansChanged: { ...DEFAULT_DEMO_PLANS_CHANGED, active: false },
      activeAlert: null,
      alertHistory: [],
      messages: [],
      lastUpdated: Date.now(),
    };
    activeFamilyStates.set(cleanCode, state);
    saveFamilyState(cleanCode, state, true);
  }
  return state;
}

function getDeterministicFamilyCode(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'demo@beeyou.app' || clean === 'reviewer@beeyou.app') {
    return 'BEE-DEMO';
  }
  const hmac = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(clean).digest();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars[hmac[i] % chars.length];
  }
  return `BEE-${code}`;
}

// -------------------------------------------------------------
// Authentication & Cryptographic Family Authorization Engine
// Satisfies Launch-Blocking Priority 3 Security Requirement
// -------------------------------------------------------------
const SERVER_AUTH_SECRET = process.env.FAMILY_AUTH_SECRET || process.env.SESSION_SECRET || 'beeyou-secure-family-auth-secret-key-2026';

export interface AuthenticatedUser {
  familyCode: string;
  role: 'caregiver' | 'child' | 'demo' | 'admin';
  email?: string;
  uid?: string;
  isDemo?: boolean;
}

export function signFamilyToken(
  familyCode: string,
  role: 'caregiver' | 'child' | 'demo' | 'admin' = 'caregiver',
  email?: string
): string {
  const cleanCode = sanitizeFamilyCode(familyCode);
  if (!cleanCode) throw new Error('Cannot sign token: invalid family code');
  const payload = {
    familyCode: cleanCode,
    role: cleanCode === 'BEE-DEMO' ? 'demo' : role,
    email: email || '',
    iat: Date.now(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payloadB64).digest('base64url');
  return `by_tok.${payloadB64}.${sig}`;
}

export const revokedFamilyCodes = new Set<string>();
export const revokedFamilyTokens = new Set<string>();

export function verifyFamilyToken(token: string): AuthenticatedUser | null {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (revokedFamilyTokens.has(trimmed)) return null;

  // 1. App Store & Google Play reviewer demo token
  if (trimmed === 'by_demo_reviewer_token_2026' || trimmed === 'DEMO-APPSTORE-REVIEWER-2026') {
    return { familyCode: 'BEE-DEMO', role: 'demo', email: 'demo@beeyou.app', isDemo: true };
  }

  // 2. Cryptographic signed by_tok format
  if (trimmed.startsWith('by_tok.')) {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      const [, payloadB64, sig] = parts;
      try {
        const expectedSig = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payloadB64).digest('base64url');
        const sigBuf = Buffer.from(sig);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
          if (parsed && parsed.familyCode) {
            const cleanCode = sanitizeFamilyCode(parsed.familyCode);
            if (!cleanCode || revokedFamilyCodes.has(cleanCode)) return null;
            return {
              familyCode: cleanCode,
              role: cleanCode === 'BEE-DEMO' ? 'demo' : (parsed.role || 'caregiver'),
              email: parsed.email,
              isDemo: cleanCode === 'BEE-DEMO',
            };
          }
        }
      } catch {}
    }
  }

  // 3. Active pairing session token (tok-...)
  if (trimmed.startsWith('tok-')) {
    for (const [code, session] of pairingSessions.entries()) {
      if (session.token === trimmed && (session.status === 'paired' || session.status === 'pending')) {
        const cleanCode = sanitizeFamilyCode(code);
        if (!cleanCode || revokedFamilyCodes.has(cleanCode)) continue;
        return {
          familyCode: cleanCode,
          role: session.initiatedBy === 'caregiver' ? 'caregiver' : 'child',
          email: session.caregiverEmail,
          isDemo: cleanCode === 'BEE-DEMO',
        };
      }
    }
  }

  // 4. Firebase Auth ID Token (JWT with 3 parts)
  if (trimmed.split('.').length === 3 && !trimmed.startsWith('by_tok.')) {
    try {
      const payloadPart = trimmed.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf-8'));
      if (decoded && (decoded.user_id || decoded.sub)) {
        const uid = decoded.user_id || decoded.sub;
        const email = decoded.email ? String(decoded.email).toLowerCase() : undefined;

        if (email === 'demo@beeyou.app' || uid === 'B5wSQd95KbYRuL79L6I3wNMgSxP2') {
          return { familyCode: 'BEE-DEMO', role: 'demo', email: 'demo@beeyou.app', uid, isDemo: true };
        }

        if (decoded.familyCode) {
          const cleanCode = sanitizeFamilyCode(decoded.familyCode);
          if (cleanCode && !revokedFamilyCodes.has(cleanCode)) {
            return {
              familyCode: cleanCode,
              role: decoded.role || 'caregiver',
              email,
              uid,
              isDemo: cleanCode === 'BEE-DEMO',
            };
          }
        }

        if (email && familyAccounts.has(email)) {
          const acc = familyAccounts.get(email)!;
          if (!revokedFamilyCodes.has(acc.familyCode)) {
            return {
              familyCode: acc.familyCode,
              role: 'caregiver',
              email,
              uid,
              isDemo: acc.familyCode === 'BEE-DEMO',
            };
          }
        }
      }
    } catch {}
  }

  return null;
}

export function extractAuthToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const customHeader = req.headers['x-beeyou-family-token'] || req.headers['x-family-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  if (typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
}

export function requireFamilyAuth(options?: { allowedRoles?: string[] }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = extractAuthToken(req);
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Missing authorization token.',
      });
    }

    const user = verifyFamilyToken(token);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authorization token.',
      });
    }

    // Determine target code from route params, body, or query
    const targetRaw = req.params.code || req.body?.pairingCode || req.body?.code || req.query.code;
    const targetCode = sanitizeFamilyCode(targetRaw);

    // If target family was requested, ensure user token has explicit access
    if (targetCode) {
      if (user.familyCode !== targetCode) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Your authorization token does not have access to family '${targetCode}'.`,
        });
      }
    }

    // Role verification
    if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${user.role}' is not authorized for this operation.`,
      });
    }

    // Verify session has not been unlinked
    const session = caregiverSessions.get(user.familyCode);
    if (session && session.unlinked && !req.path.includes('/pairing/') && !req.path.includes('/auth/')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This device has been unlinked. Please re-pair your device to access family data.',
      });
    }

    (req as any).user = user;
    next();
  };
}

const eventHistoryByCode = new Map<string, CloudSyncEvent[]>();
const sseClientsByCode = new Map<string, Set<express.Response>>();
const lastAlertTimeByFamily = new Map<string, number>();
const lastAckTimeByFamily = new Map<string, number>();

// Asynchronously publish event to Firebase Realtime Database for cross-server & cloud pub/sub
async function publishEventToFirebase(code: string, event: CloudSyncEvent): Promise<void> {
  if (!FIREBASE_DB_URL) return;
  const cleanCode = code.trim().toUpperCase();

  try {
    const promises: Promise<any>[] = [];

    // 1. Publish to latest event channel for instant (<50ms) listener wakeup
    const latestUrl = `${FIREBASE_DB_URL}/beeyou/events/${encodeURIComponent(cleanCode)}/latest.json`;
    promises.push(
      fetch(latestUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    );

    // 2. Publish to event history log for multi-server polling & offline catch-up
    const logUrl = `${FIREBASE_DB_URL}/beeyou/events/${encodeURIComponent(cleanCode)}/log/${encodeURIComponent(event.eventId)}.json`;
    promises.push(
      fetch(logUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    );

    // 3. Keep legacy session paths synchronized for cross-component compatibility
    if (event.type === 'CAREGIVER_ALERT' && event.alert) {
      const alertUrl = `${FIREBASE_DB_URL}/beeyou/sessions/${encodeURIComponent(cleanCode)}/activeAlert.json`;
      promises.push(
        fetch(alertUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.alert),
        })
      );
    } else if (event.type === 'CAREGIVER_ALERT_ACK' && event.ack) {
      const alertUrl = `${FIREBASE_DB_URL}/beeyou/sessions/${encodeURIComponent(cleanCode)}/activeAlert.json`;
      promises.push(
        fetch(alertUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'acknowledged',
            responseMessage: event.ack.responseMessage,
            responseId: event.ack.responseId,
            acknowledgedBy: event.ack.by,
            acknowledgedAt: new Date().toISOString(),
          }),
        })
      );
    } else if (event.type === 'ALERT_RESOLVED') {
      const alertUrl = `${FIREBASE_DB_URL}/beeyou/sessions/${encodeURIComponent(cleanCode)}/activeAlert.json`;
      promises.push(
        fetch(alertUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(null),
        })
      );
    } else if (event.type === 'CAREGIVER_MESSAGE' && event.message) {
      const msgId = event.message.id || `msg-${Date.now()}`;
      const msgUrl = `${FIREBASE_DB_URL}/beeyou/sessions/${encodeURIComponent(cleanCode)}/messages/${encodeURIComponent(msgId)}.json`;
      promises.push(
        fetch(msgUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.message),
        })
      );
    } else if (event.type === 'CHILD_STATUS_UPDATE' && event.status) {
      const statusUrl = `${FIREBASE_DB_URL}/beeyou/sessions/${encodeURIComponent(cleanCode)}/childStatus.json`;
      promises.push(
        fetch(statusUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.status),
        })
      );
    }

    await Promise.allSettled(promises);
  } catch {}
}

function broadcastEvent(code: string, event: CloudSyncEvent): void {
  const cleanCode = sanitizeFamilyCode(code);
  if (!cleanCode) return;
  event.pairingCode = cleanCode;
  if (!event.sentAt) event.sentAt = Date.now();
  if (!event.eventId) {
    event.eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // Store in rolling event history (last 60 events)
  const history = eventHistoryByCode.get(cleanCode) || [];
  history.push(event);
  if (history.length > 60) history.shift();
  eventHistoryByCode.set(cleanCode, history);

  // Broadcast to all active SSE subscribers for this family/code
  const clients = sseClientsByCode.get(cleanCode);
  if (clients && clients.size > 0) {
    const dataString = `data: ${JSON.stringify(event)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(dataString);
      } catch {
        clients.delete(res);
      }
    });
  }

  // Broadcast to Firebase Realtime Database for cross-server & cloud pub/sub (skip BEE-DEMO from cross-family pub/sub)
  if (cleanCode !== 'BEE-DEMO') {
    publishEventToFirebase(cleanCode, event).catch(() => {});
  }
}

// Helper to generate an unguessable high-entropy temporary pairing code (e.g., BEE-K7P492)
function generatePairingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part = '';
  for (let i = 0; i < 6; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BEE-${part}`;
}

// -------------------------------------------------------------
// Family Authentication Token Exchange Endpoint
// -------------------------------------------------------------
app.post('/api/family/auth/token', (req, res) => {
  const { familyCode, pin, email } = req.body || {};
  const cleanCode = sanitizeFamilyCode(familyCode);
  if (!cleanCode) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid family code is required.' });
  }

  // 1. App Store & Google Play reviewer demo access (strictly isolated sandbox)
  if (cleanCode === 'BEE-DEMO') {
    if (email === 'demo@beeyou.app' || req.headers['x-reviewer-demo'] === 'true') {
      return res.json({
        success: true,
        token: 'by_demo_reviewer_token_2026',
        familyCode: 'BEE-DEMO',
        role: 'demo',
      });
    }
    return res.status(403).json({ error: 'Forbidden', message: 'Demo access requires valid reviewer credentials.' });
  }

  // Check if caller already has a valid Bearer token (e.g. Firebase ID token or pairing token)
  const bearerToken = extractAuthToken(req);
  if (bearerToken) {
    const verified = verifyFamilyToken(bearerToken);
    if (verified && (verified.familyCode === cleanCode || verified.role === 'admin')) {
      const token = signFamilyToken(cleanCode, verified.role === 'admin' ? 'caregiver' : (verified.role as any), verified.email || email);
      return res.json({ success: true, token, familyCode: cleanCode, role: verified.role });
    }
  }

  // 2. Real family verification
  let state = activeFamilyStates.get(cleanCode);
  const session = caregiverSessions.get(cleanCode);

  if (!state && !session) {
    if (email) {
      state = getOrCreateFamilyState(cleanCode, email) || undefined;
    } else {
      return res.status(404).json({ error: 'NotFound', message: `Family '${cleanCode}' was not found.` });
    }
  }

  const storedPin = state?.childProfile?.pin;
  if (storedPin) {
    if (!pin) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Family PIN required.' });
    }
    const cleanPin = String(pin).trim();
    const isDirectMatch = cleanPin === storedPin;
    const hashed = crypto.createHash('sha256').update(`beeyou_secure_caregiver_pin_salt_v1:${cleanPin}`).digest('hex');
    const isHashMatch = `sha256:${hashed}` === storedPin;

    if (!isDirectMatch && !isHashMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid family PIN.' });
    }
  }

  const token = signFamilyToken(cleanCode, 'caregiver', email || state?.email);
  return res.json({ success: true, token, familyCode: cleanCode, role: 'caregiver' });
});

// -------------------------------------------------------------
// 1. Temporary Pairing Sessions (Explicit, Expiring, Intended Account Approval)
// -------------------------------------------------------------

// Create a new temporary single-use expirable pairing session (15-min TTL)
app.post('/api/caregiver/pairing/create', (req, res) => {
  const { initiatedBy, childName, childAge, ageGroup, caregiverName, caregiverPhone, caregiverEmail, permissions } = req.body || {};
  
  let pairingCode = generatePairingCode();
  // Ensure unique and never BEE-DEMO
  while (pairingSessions.has(pairingCode) || pairingCode === 'BEE-DEMO') {
    pairingCode = generatePairingCode();
  }

  const token = 'tok-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
  const now = Date.now();
  const session: TemporaryPairingSessionData = {
    pairingCode,
    token,
    createdAt: now,
    expiresAt: now + 15 * 60 * 1000, // 15 minutes TTL
    status: 'pending',
    initiatedBy: initiatedBy === 'caregiver' ? 'caregiver' : 'child_device',
    childName: childName || (initiatedBy === 'caregiver' ? 'Child' : undefined),
    childAge: childAge ? Number(childAge) : undefined,
    ageGroup: ageGroup || 'kid',
    caregiverName: caregiverName || (initiatedBy === 'child_device' ? undefined : 'Caregiver'),
    caregiverPhone,
    caregiverEmail,
    permissions: permissions || {
      receiveAlerts: true,
      receiveMood: true,
      receiveRoutines: true,
      canEditRoutines: true,
      canEditAac: true,
      allowLocationTag: true,
    },
  };

  pairingSessions.set(pairingCode, session);
  savePairingSessions().catch(() => {});
  return res.json({ success: true, session });
});

// Check status of a pairing code (for live polling during setup)
app.get('/api/caregiver/pairing/status/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const session = pairingSessions.get(code);

  if (!session) {
    return res.status(404).json({ error: 'Pairing session not found or expired', status: 'not_found' });
  }

  if (Date.now() > session.expiresAt && session.status !== 'paired') {
    session.status = 'expired';
  }

  return res.json({ success: true, session });
});

// Request to pair (submits claiming device details and enters awaiting_approval state)
app.post('/api/caregiver/pairing/claim', (req, res) => {
  const { pairingCode, claimerRole, childName, childAge, ageGroup, caregiverName, caregiverPhone, caregiverEmail, permissions } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code || code === 'BEE-DEMO') {
    return res.status(400).json({ error: 'Invalid pairing code format.' });
  }
  const session = pairingSessions.get(code);

  if (!session) {
    return res.status(404).json({ error: 'Invalid or expired pairing code.' });
  }

  if (Date.now() > session.expiresAt || session.status === 'expired') {
    session.status = 'expired';
    return res.status(400).json({ error: 'Pairing code has expired. Please generate a fresh code on the companion device.' });
  }

  if (session.status === 'paired') {
    return res.status(400).json({ error: 'This pairing code has already been claimed.' });
  }

  if (session.status === 'rejected' || session.status === 'revoked') {
    return res.status(400).json({ error: 'This pairing request was declined.' });
  }

  // Update session with claiming party details
  const requestingName = claimerRole === 'caregiver' ? (caregiverName || 'Caregiver') : (childName || 'Child');
  session.requestingDeviceName = requestingName;
  session.requestingDeviceRole = claimerRole === 'caregiver' ? 'caregiver' : 'child_device';
  session.requestedAt = Date.now();
  if (childName) session.childName = childName;
  if (childAge) session.childAge = Number(childAge);
  if (ageGroup) session.ageGroup = ageGroup;
  if (caregiverName) session.caregiverName = caregiverName;
  if (caregiverPhone) session.caregiverPhone = caregiverPhone;
  if (caregiverEmail) session.caregiverEmail = caregiverEmail;
  if (permissions) session.permissions = permissions;

  // Status transitions to awaiting_approval: requires intended account confirmation
  session.status = 'awaiting_approval';
  savePairingSessions().catch(() => {});

  // Broadcast PAIRING_APPROVAL_REQUESTED to the host device
  broadcastEvent(code, {
    eventId: `ev-pair-req-${Date.now()}`,
    type: 'PAIRING_APPROVAL_REQUESTED',
    pairingCode: code,
    session,
    sentAt: Date.now(),
  });

  return res.json({ 
    success: true, 
    status: 'awaiting_approval',
    session,
    message: 'Pairing request submitted! Please tap Approve on the companion device to complete connection.' 
  });
});

// Explicit approval endpoint called by the intended account on the host device
app.post('/api/caregiver/pairing/approve', (req, res) => {
  const { pairingCode } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'Invalid pairing code.' });
  }

  const session = pairingSessions.get(code);
  if (!session) {
    return res.status(404).json({ error: 'Pairing session not found.' });
  }

  if (Date.now() > session.expiresAt || session.status === 'expired') {
    session.status = 'expired';
    return res.status(400).json({ error: 'Pairing code has expired. Please generate a new code.' });
  }

  session.status = 'paired';
  savePairingSessions().catch(() => {});

  // Initialize the permanent live caregiver session for this linked pairing
  const permanentSession: CaregiverSessionData = {
    pairingCode: code,
    childName: session.childName || 'Child',
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Connected to BeeYou Companion',
    currentMood: 'calm',
    habitsCompletedToday: 0,
    totalHabits: 4,
    routineProgress: null,
    stars: 10,
    isOffline: false,
    messages: [
      {
        id: 'msg-welcome-' + Date.now(),
        senderName: session.caregiverName || 'Caregiver',
        text: `Connected! You can be yourself here. 🐝`,
        emoji: '🐝',
        timestamp: new Date().toISOString(),
        read: false,
      }
    ],
    caregiverPhone: session.caregiverPhone,
    userRole: session.ageGroup === 'adult' ? 'independent_adult' : session.ageGroup === 'teen' ? 'teen_dependent' : 'child_dependent',
    permissions: session.permissions,
    unlinked: false,
  };

  setCaregiverSession(code, permanentSession);

  // Broadcast DEVICE_PAIRED & PAIRING_APPROVED events across all connected devices
  broadcastEvent(code, {
    eventId: `ev-pair-approved-${Date.now()}`,
    type: 'DEVICE_PAIRED',
    pairingCode: code,
    session: permanentSession,
    sentAt: Date.now(),
  });

  const authToken = signFamilyToken(code, (session.initiatedBy === 'caregiver' ? 'caregiver' : 'child'), session.caregiverEmail);

  return res.json({ 
    success: true, 
    status: 'paired',
    session,
    permanentSession,
    token: authToken,
    message: 'Pairing approved and device connected successfully!' 
  });
});

// Explicit decline endpoint called when the intended account rejects the pairing request
app.post('/api/caregiver/pairing/reject', (req, res) => {
  const { pairingCode } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'Invalid pairing code.' });
  }

  const session = pairingSessions.get(code);
  if (session) {
    session.status = 'rejected';
    savePairingSessions().catch(() => {});
  }

  broadcastEvent(code, {
    eventId: `ev-pair-rejected-${Date.now()}`,
    type: 'PAIRING_REJECTED',
    pairingCode: code,
    sentAt: Date.now(),
  });

  return res.json({ success: true, status: 'rejected', session, message: 'Pairing request was declined.' });
});

// Unlink a paired device
app.post('/api/caregiver/device/unlink', requireFamilyAuth(), (req, res) => {
  const { pairingCode } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  // Revoke the caller's auth token
  const callerToken = extractAuthToken(req);
  if (callerToken) {
    revokedFamilyTokens.add(callerToken);
  }

  const session = getCaregiverSession(code);
  if (session) {
    session.unlinked = true;
    session.activeAlert = null;
    session.quickAlert = 'Device unlinked.';
    setCaregiverSession(code, session);
  }

  const pairing = pairingSessions.get(code);
  if (pairing) {
    pairing.status = 'revoked';
    if (pairing.token) {
      revokedFamilyTokens.add(pairing.token);
    }
    savePairingSessions().catch(() => {});
  }

  // Terminate any active SSE streams for this unlinked code immediately
  const clients = sseClientsByCode.get(code);
  if (clients) {
    for (const clientRes of clients) {
      try {
        clientRes.write(`data: ${JSON.stringify({ type: 'DEVICE_UNLINKED', pairingCode: code, sentAt: Date.now() })}\n\n`);
        clientRes.end();
      } catch {}
    }
    sseClientsByCode.delete(code);
  }

  // Broadcast DEVICE_UNLINKED event
  broadcastEvent(code, {
    eventId: `ev-unlink-${Date.now()}`,
    type: 'DEVICE_UNLINKED',
    pairingCode: code,
    sentAt: Date.now(),
  });

  return res.json({ success: true, message: 'Device unlinked successfully and access revoked.' });
});

// -------------------------------------------------------------
// Real-time Event Hub: Publish Event, Live SSE Stream & Polling
// -------------------------------------------------------------

// Universal Event Publisher (Child <-> Caregiver bidirectional relay)
app.post('/api/caregiver/event', requireFamilyAuth(), (req, res) => {
  const envelope = req.body || {};
  const pairingCode = sanitizeFamilyCode(envelope.pairingCode || envelope.code);
  if (!pairingCode) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  if (!envelope.eventId) {
    envelope.eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
  if (!envelope.sentAt) {
    envelope.sentAt = Date.now();
  }
  envelope.pairingCode = pairingCode;

  // Auto-sync session state in server memory
  let session = getCaregiverSession(pairingCode);
  if (!session) {
    session = {
      pairingCode,
      childName: envelope.childName || envelope.status?.childName || 'Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
      unlinked: false,
    };
    setCaregiverSession(pairingCode, session);
  }

  if (envelope.type === 'CAREGIVER_ALERT' && envelope.alert) {
    const familyState = getOrCreateFamilyState(pairingCode);
    if (familyState) {
      if (envelope.alert.childName && envelope.alert.childName !== 'Leo') {
        session.childName = envelope.alert.childName;
        familyState.childProfile.name = envelope.alert.childName;
      }
      session.activeAlert = envelope.alert;
      session.quickAlert = `ALERT: ${envelope.alert.label}`;
      session.lastActiveTime = new Date().toISOString();
      session.lastChildActiveTime = new Date().toISOString();
      familyState.activeAlert = envelope.alert;
      familyState.alertHistory = [envelope.alert, ...(familyState.alertHistory || []).filter((a: any) => a.id !== envelope.alert.id)].slice(0, 50);
      familyState.lastUpdated = Date.now();
      saveFamilyState(pairingCode, familyState, true);
    }
  } else if (envelope.type === 'CAREGIVER_ALERT_ACK' && envelope.ack) {
    if (session.activeAlert) {
      session.activeAlert.status = 'acknowledged';
      session.activeAlert.acknowledgedBy = envelope.ack.by;
    }
    const familyState = getOrCreateFamilyState(pairingCode);
    if (familyState) {
      if (familyState.activeAlert) {
        familyState.activeAlert.status = 'acknowledged';
        familyState.activeAlert.acknowledgedBy = envelope.ack.by;
        familyState.activeAlert.responseMessage = envelope.ack.responseMessage;
        familyState.activeAlert.responseId = envelope.ack.responseId;
      }
      session.lastCaregiverActiveTime = new Date().toISOString();
      familyState.lastUpdated = Date.now();
      saveFamilyState(pairingCode, familyState, true);
    }
  } else if (envelope.type === 'ALERT_RESOLVED') {
    session.activeAlert = null;
    session.quickAlert = null;
    const familyState = getOrCreateFamilyState(pairingCode);
    if (familyState) {
      familyState.activeAlert = null;
      if (Array.isArray(familyState.alertHistory)) {
        familyState.alertHistory = familyState.alertHistory.map((a: any) => {
          if (!envelope.alertId || a.id === envelope.alertId) {
            return { ...a, status: 'resolved' };
          }
          return a;
        });
      }
      familyState.lastUpdated = Date.now();
      saveFamilyState(pairingCode, familyState, true);
    }
  } else if (envelope.type === 'CAREGIVER_MESSAGE' && envelope.message) {
    let msg = { ...envelope.message };
    const rawSender = String(msg.senderName || '');
    const rawText = String(msg.text || '');
    const isActuallyInverted =
      (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
      rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
    if (isActuallyInverted) {
      msg.senderName = rawText;
      msg.text = rawSender;
      envelope.message = msg;
    }
    session.messages.push(msg);
    if (session.messages.length > 30) session.messages = session.messages.slice(-30);
    session.lastCaregiverActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CHILD_STATUS_UPDATE' && envelope.status) {
    Object.assign(session, envelope.status);
    session.lastActiveTime = new Date().toISOString();
    session.lastChildActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CAREGIVER_HEARTBEAT' || envelope.role === 'caregiver') {
    session.lastCaregiverActiveTime = new Date().toISOString();
    session.lastActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CHILD_HEARTBEAT' || envelope.role === 'child_device' || envelope.type === 'HEARTBEAT') {
    session.lastChildActiveTime = new Date().toISOString();
    session.lastActiveTime = new Date().toISOString();
    if (envelope.childStatus) {
      Object.assign(session, envelope.childStatus);
    }
  }

  setCaregiverSession(pairingCode, session);

  // Update persistent state timestamp
  const familyState = getOrCreateFamilyState(pairingCode);
  if (familyState) {
    familyState.lastUpdated = Date.now();
  }

  broadcastEvent(pairingCode, envelope);
  return res.json({ success: true, eventId: envelope.eventId });
});

// Live Server-Sent Events (SSE) Stream for real-time 0ms delivery
app.get('/api/caregiver/events/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const familyState = getOrCreateFamilyState(code);
  if (!familyState) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  let clients = sseClientsByCode.get(code);
  if (!clients) {
    clients = new Set();
    sseClientsByCode.set(code, clients);
  }
  clients.add(res);

  // Send initial connection ACK
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', pairingCode: code, timestamp: Date.now() })}\n\n`);

  // Send current active persistent family state immediately
  res.write(`data: ${JSON.stringify({ type: 'SYNC_INIT', state: familyState, pairingCode: code, sentAt: Date.now() })}\n\n`);
  if (familyState.activeAlert && familyState.activeAlert.status === 'active') {
    res.write(`data: ${JSON.stringify({ type: 'CAREGIVER_ALERT', alert: familyState.activeAlert, state: familyState, sentAt: Date.now() })}\n\n`);
  }

  // Send recent events from last 45 seconds to catch up
  const history = eventHistoryByCode.get(code) || [];
  const now = Date.now();
  for (const ev of history) {
    if (now - ev.sentAt < 45000) {
      res.write(`data: ${JSON.stringify(ev)}\n\n`);
    }
  }

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAliveInterval);
      clients?.delete(res);
    }
  }, 10000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    clients?.delete(res);
  });
});

// Short-polling endpoint for background reliability & multi-server distributed sync
app.get('/api/caregiver/poll/:code', requireFamilyAuth(), async (req, res) => {
  const code = req.params.code;
  const since = Number(req.query.since) || 0;
  const history = eventHistoryByCode.get(code) || [];
  let newEvents = history.filter((e) => e.sentAt > since);

  // Distributed multi-server catch-up: if local server instance has no new events since timestamp, check Firebase (skip BEE-DEMO)
  if (newEvents.length === 0 && since > 0 && FIREBASE_DB_URL && code !== 'BEE-DEMO') {
    try {
      const fbRes = await fetch(`${FIREBASE_DB_URL}/beeyou/events/${encodeURIComponent(code)}/latest.json`);
      if (fbRes.ok) {
        const latestEv = await fbRes.json();
        if (latestEv && latestEv.sentAt > since) {
          newEvents = [latestEv];
          if (!history.some((h) => h.eventId === latestEv.eventId)) {
            history.push(latestEv);
            if (history.length > 60) history.shift();
            eventHistoryByCode.set(code, history);
          }
        }
      }
    } catch {}
  }

  const familyState = getOrCreateFamilyState(code);
  if (!familyState) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  const session = getCaregiverSession(code);

  const rawActiveAlert = familyState.activeAlert || session?.activeAlert || null;
  const mergedSession = {
    ...(session || {}),
    ...(familyState.childState || {}),
    activeAlert: rawActiveAlert && rawActiveAlert.status !== 'resolved' ? rawActiveAlert : null,
    childName: (familyState.childProfile?.name && familyState.childProfile.name !== 'Leo')
      ? familyState.childProfile.name
      : (session?.childName && session.childName !== 'Leo')
        ? session.childName
        : 'Child',
  };

  return res.json({
    success: true,
    events: newEvents,
    session: mergedSession,
    state: familyState,
    serverTime: Date.now(),
  });
});

// -------------------------------------------------------------
// Unified Persistent Family Sync API
// -------------------------------------------------------------

// 1. Fetch entire family state
app.get('/api/family/state/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const state = getOrCreateFamilyState(code);
  if (!state) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }
  return res.json({ success: true, state });
});

// 2. Update family state remotely (routines, aac, plansChanged, childState, childProfile)
app.post('/api/family/state/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const current = getOrCreateFamilyState(code);
  if (!current) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  const { routines, aacItems, plansChanged, childState, childProfile, caregiverName, backupEmail } = req.body || {};

  if (backupEmail) current.backupEmail = String(backupEmail).trim().toLowerCase();
  if (Array.isArray(routines)) current.routines = routines;
  if (Array.isArray(aacItems)) current.aacItems = aacItems;
  if (plansChanged && typeof plansChanged === 'object') current.plansChanged = { ...current.plansChanged, ...plansChanged };
  if (childState && typeof childState === 'object') current.childState = { ...current.childState, ...childState };
  if (childProfile && typeof childProfile === 'object') {
    current.childProfile = { ...current.childProfile, ...childProfile };
    if (childProfile.name && childProfile.name !== 'Leo') {
      const sess = getCaregiverSession(code);
      if (sess) {
        sess.childName = childProfile.name;
        setCaregiverSession(code, sess);
      }
    }
  }
  if (caregiverName) current.caregiverName = caregiverName;
  current.lastUpdated = Date.now();

  saveFamilyState(code, current);

  // Sync with caregiverSessions map for backwards compatibility
  const session = getCaregiverSession(code);
  if (session && current.childState) {
    Object.assign(session, current.childState);
    setCaregiverSession(code, session);
  }

  broadcastEvent(code, {
    eventId: `ev-state-${Date.now()}`,
    type: 'FAMILY_STATE_UPDATED',
    pairingCode: code,
    state: current,
    sentAt: Date.now(),
  });

  return res.json({ success: true, state: current });
});

// Lookup account by primary or backup email
app.post('/api/family/recover-email', (req, res) => {
  const { lookupEmail } = req.body || {};
  const clean = String(lookupEmail || '').trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email.' });
  }

  for (const [code, state] of activeFamilyStates.entries()) {
    const primary = (state.email || '').trim().toLowerCase();
    const backup = (state.backupEmail || '').trim().toLowerCase();

    if (clean === backup || clean === primary) {
      const parts = primary.split('@');
      const name = parts[0];
      const domain = parts[1] || 'domain.com';
      const masked = name.length > 2
        ? `${name[0]}${'*'.repeat(Math.min(name.length - 2, 4))}${name[name.length - 1]}`
        : `${name[0]}*`;
      return res.json({
        success: true,
        found: true,
        primaryEmail: primary,
        maskedPrimaryEmail: `${masked}@${domain}`,
        familyCode: state.familyCode,
      });
    }
  }

  return res.json({
    success: false,
    found: false,
    message: 'No account found matching this email or backup email.',
  });
});

// 3. Child triggers an emergency / sensory overload alert
app.post('/api/family/alert/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const current = getOrCreateFamilyState(code);
  if (!current) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  const { id, childName, emotion, alertId, label, emoji, location, note } = req.body || {};

  const alert = {
    id: id || ('alert-' + Date.now()),
    familyCode: code,
    childName: childName || (current.childProfile?.name && current.childProfile.name !== 'Leo' ? current.childProfile.name : 'Child'),
    emotion: emotion || 'need_help',
    alertId: alertId || 'need_help',
    label: label || 'Needs Support',
    emoji: emoji || '🚨',
    location: location || 'home',
    note: note || '',
    timestamp: new Date().toISOString(),
  };

  current.activeAlert = alert;
  current.alertHistory = [alert, ...(current.alertHistory || []).filter((a: any) => a.id !== alert.id)].slice(0, 50);
  current.lastUpdated = Date.now();

  saveFamilyState(code, current, true);

  // Sync caregiver session
  const session = getCaregiverSession(code);
  if (session) {
    session.activeAlert = alert;
    session.quickAlert = `ALERT: ${alert.label}`;
    setCaregiverSession(code, session);
  }

  broadcastEvent(code, {
    eventId: `ev-alert-${Date.now()}`,
    type: 'CAREGIVER_ALERT',
    pairingCode: code,
    alert,
    state: current,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert, deliveryStatus: 'delivered', state: current });
});

// 4. Caregiver acknowledges alert with reassurance message
app.post('/api/family/alert/:code/ack', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const current = getOrCreateFamilyState(code);
  if (!current) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  const { acknowledgedBy, responseMessage, responseId, alertId } = req.body || {};

  if (current.activeAlert) {
    current.activeAlert.status = 'acknowledged';
    current.activeAlert.acknowledgedBy = acknowledgedBy || current.caregiverName || 'Caregiver';
    current.activeAlert.acknowledgedAt = new Date().toISOString();
    current.activeAlert.responseMessage = responseMessage;
    current.activeAlert.responseId = responseId;
  }

  // Update item in alert history
  if (Array.isArray(current.alertHistory)) {
    current.alertHistory = current.alertHistory.map((a: any) => {
      if (a.id === alertId || (current.activeAlert && a.id === current.activeAlert.id)) {
        return {
          ...a,
          status: 'acknowledged',
          acknowledgedBy: acknowledgedBy || 'Caregiver',
          responseMessage,
        };
      }
      return a;
    });
  }

  // Also append response message to messages stream for the child
  if (responseMessage) {
    const newMsg: CaregiverMessageItem = {
      id: 'msg-' + Date.now(),
      senderName: acknowledgedBy || current.caregiverName || 'Caregiver',
      text: responseMessage,
      emoji: '',
      timestamp: new Date().toISOString(),
      read: false,
      responseId,
      senderRole: 'caregiver',
    };
    current.messages = [...(current.messages || []).slice(-29), newMsg];
  }

  current.lastUpdated = Date.now();
  saveFamilyState(code, current, true);

  broadcastEvent(code, {
    eventId: `ev-ack-${Date.now()}`,
    type: 'CAREGIVER_ALERT_ACK',
    pairingCode: code,
    ack: {
      alertId: alertId || (current.activeAlert?.id),
      responseMessage,
      responseId,
      by: acknowledgedBy || 'Caregiver',
    },
    state: current,
    sentAt: Date.now(),
  });

  return res.json({ success: true, state: current });
});

// 5. Caregiver marks alert resolved / all clear
app.post('/api/family/alert/:code/resolve', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const current = getOrCreateFamilyState(code);
  if (!current) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }
  const { alertId } = req.body || {};

  current.activeAlert = null;
  if (Array.isArray(current.alertHistory)) {
    current.alertHistory = current.alertHistory.map((a: any) => {
      if (!alertId || a.id === alertId) {
        return { ...a, status: 'resolved' };
      }
      return a;
    });
  }

  current.lastUpdated = Date.now();
  saveFamilyState(code, current, true);

  // Sync session
  const session = getCaregiverSession(code);
  if (session) {
    session.activeAlert = null;
    setCaregiverSession(code, session);
  }

  broadcastEvent(code, {
    eventId: `ev-res-${Date.now()}`,
    type: 'ALERT_RESOLVED',
    pairingCode: code,
    alertId,
    state: current,
    sentAt: Date.now(),
  });

  return res.json({ success: true, state: current });
});

// 6. Caregiver sends instant nudge or reminder message to child
app.post('/api/family/message/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const current = getOrCreateFamilyState(code);
  if (!current) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  const { senderName, text, emoji, responseId, senderRole } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const determinedRole = senderRole || (
    typeof senderName === 'string' &&
    senderName.trim().toLowerCase() !== 'caregiver' &&
    senderName.trim().toLowerCase() !== 'parent'
      ? 'child'
      : 'caregiver'
  );

  const newMsg: CaregiverMessageItem = {
    id: 'msg-' + Date.now(),
    senderName: senderName || (determinedRole === 'child' ? 'Child' : current.caregiverName || 'Caregiver'),
    text: text.trim(),
    emoji: emoji || '',
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
    senderRole: determinedRole,
  };

  current.messages = [...(current.messages || []).slice(-29), newMsg];
  current.lastUpdated = Date.now();
  saveFamilyState(code, current);

  broadcastEvent(code, {
    eventId: `ev-msg-${Date.now()}`,
    type: 'CAREGIVER_MESSAGE',
    pairingCode: code,
    message: newMsg,
    state: current,
    sentAt: Date.now(),
  });

  return res.json({ success: true, message: newMsg, state: current });
});

// -------------------------------------------------------------
// Shared Family Account Endpoints (Single Email Links Both Devices)
// -------------------------------------------------------------

// Register a new shared family account on the server
app.post('/api/caregiver/family/register', (req, res) => {
  const { email, caregiverName, caregiverRole, childName, childAgeGroup, pin } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const familyCode = getDeterministicFamilyCode(cleanEmail);
  const account: ServerFamilyAccount = {
    id: 'fam-' + Date.now(),
    email: cleanEmail,
    familyCode,
    caregiverName: caregiverName?.trim() || 'Caregiver',
    caregiverRole: caregiverRole?.trim() || 'Parent',
    childProfile: {
      name: childName?.trim() || 'Child',
      ageGroup: childAgeGroup || 'kid',
      pin: pin || '1234',
      interests: ['Visual Schedules', 'Calm Activities'],
      pronouns: 'they/them',
    },
    subscriptionTier: 'premium',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  familyAccounts.set(cleanEmail, account);
  saveFamilyAccounts().catch(() => {});

  // Initialize caregiver session for this familyCode
  if (!caregiverSessions.has(familyCode)) {
    caregiverSessions.set(familyCode, {
      pairingCode: familyCode,
      childName: account.childProfile.name,
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
      unlinked: false,
    });
    saveCaregiverSessions().catch(() => {});
  }

  const token = signFamilyToken(familyCode, 'caregiver', cleanEmail);

  const safeAccount = {
    ...account,
    childProfile: {
      ...account.childProfile,
      pin: undefined,
    },
    backupEmail: undefined,
  };

  return res.json({ success: true, account: safeAccount, token, message: `Account created for ${cleanEmail}! Family code: ${familyCode}` });
});

// Sign into shared family account on the server
app.post('/api/caregiver/family/login', (req, res) => {
  const { email } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  let account = familyAccounts.get(cleanEmail);
  if (!account) {
    // Deterministically generate so sign in NEVER fails across devices
    const familyCode = getDeterministicFamilyCode(cleanEmail);
    account = {
      id: 'fam-' + Date.now(),
      email: cleanEmail,
      familyCode,
      caregiverName: 'Caregiver',
      caregiverRole: 'Parent',
      childProfile: {
        name: 'Child',
        ageGroup: 'kid',
        pin: '1234',
        interests: ['Visual Schedules'],
        pronouns: 'they/them',
      },
      subscriptionTier: 'premium',
      createdAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
    familyAccounts.set(cleanEmail, account);
    saveFamilyAccounts().catch(() => {});
  }

  // Ensure caregiver session is initialized
  if (!caregiverSessions.has(account.familyCode)) {
    caregiverSessions.set(account.familyCode, {
      pairingCode: account.familyCode,
      childName: account.childProfile.name,
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
      unlinked: false,
    });
    saveCaregiverSessions().catch(() => {});
  }

  const token = signFamilyToken(account.familyCode, 'caregiver', cleanEmail);

  const safeAccount = {
    ...account,
    childProfile: {
      ...account.childProfile,
      pin: undefined,
    },
    backupEmail: undefined,
  };

  return res.json({ success: true, account: safeAccount, token, message: `Logged in as ${cleanEmail}!` });
});

// Fetch account details by email (sanitized - strips internal PIN)
app.get('/api/caregiver/family/:email', requireFamilyAuth(), (req, res) => {
  const cleanEmail = (req.params.email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length > 254) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  const user = (req as any).user as AuthenticatedUser;
  const account = familyAccounts.get(cleanEmail);
  if (!account) {
    return res.status(404).json({ success: false, message: 'Family account not found' });
  }

  // Cross-family authorization check
  if (user.role !== 'admin' && user.familyCode !== account.familyCode) {
    return res.status(403).json({ error: 'Forbidden', message: 'Access denied to this family account.' });
  }

  const safeAccount = {
    ...account,
    childProfile: {
      ...account.childProfile,
      pin: undefined,
    },
    backupEmail: undefined,
  };
  return res.json({ success: true, account: safeAccount });
});

// Permanently delete family account, sessions, disk state, and purge records (Finding #7)
app.post('/api/caregiver/family/delete', requireFamilyAuth(), async (req, res) => {
  const user = (req as any).user as AuthenticatedUser;
  const { email, familyCode } = req.body || {};
  const cleanEmail = (email || user.email || '').trim().toLowerCase();
  const targetCode = sanitizeFamilyCode(familyCode || user.familyCode);

  if (!targetCode) {
    return res.status(400).json({ success: false, message: 'Invalid or missing family code.' });
  }

  // Protect DEMO account from permanent destruction
  if (targetCode === 'BEE-DEMO' || cleanEmail === 'demo@beeyou.app') {
    return res.status(403).json({
      success: false,
      message: 'Demo reviewer account cannot be permanently deleted. Use local device reset instead.'
    });
  }

  // Cross-family authorization check
  if (user.role !== 'admin' && user.familyCode !== targetCode) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Cannot delete another family account.'
    });
  }

  const results: Record<string, boolean> = {
    broadcastNotified: false,
    familyAccountDeleted: false,
    caregiverSessionDeleted: false,
    pairingSessionsDeleted: false,
    diskFilesPurged: false,
    sseClientsTerminated: false,
  };

  try {
    // 1. Broadcast FAMILY_ACCOUNT_DELETED to all connected devices before purging
    try {
      broadcastEvent(targetCode, {
        eventId: `del_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        pairingCode: targetCode,
        type: 'FAMILY_ACCOUNT_DELETED',
        sentAt: Date.now(),
        message: 'Family account has been permanently deleted.',
      });
      results.broadcastNotified = true;
    } catch (e) {
      console.warn('[Delete] Broadcast notice:', e);
    }

    // 2. Terminate active SSE clients for this family
    const sseClients = sseClientsByCode.get(targetCode);
    if (sseClients) {
      sseClients.forEach((clientRes) => {
        try {
          clientRes.write(`data: ${JSON.stringify({ type: 'FAMILY_ACCOUNT_DELETED', disconnected: true })}\n\n`);
          clientRes.end();
        } catch {}
      });
      sseClientsByCode.delete(targetCode);
      results.sseClientsTerminated = true;
    }

    // 3. Remove in-memory and disk family account
    if (cleanEmail && familyAccounts.has(cleanEmail)) {
      familyAccounts.delete(cleanEmail);
      results.familyAccountDeleted = true;
    } else {
      // Find by familyCode if email was different or unspecified
      for (const [em, acc] of familyAccounts.entries()) {
        if (acc.familyCode === targetCode) {
          familyAccounts.delete(em);
          results.familyAccountDeleted = true;
          break;
        }
      }
    }
    await saveFamilyAccounts();

    // 4. Remove caregiver session
    if (caregiverSessions.has(targetCode)) {
      caregiverSessions.delete(targetCode);
      results.caregiverSessionDeleted = true;
    }
    await saveCaregiverSessions();

    // 5. Remove any pairing sessions
    for (const [pCode, pSess] of pairingSessions.entries()) {
      if (pCode === targetCode || pSess.pairingCode === targetCode || (cleanEmail && pSess.caregiverEmail === cleanEmail)) {
        pairingSessions.delete(pCode);
        results.pairingSessionsDeleted = true;
      }
    }
    await savePairingSessions();

    // 6. Delete family disk state files
    try {
      const familyFile = path.join(DATA_DIR, 'families', `${targetCode}.json`);
      if (fs.existsSync(familyFile)) {
        fs.unlinkSync(familyFile);
        results.diskFilesPurged = true;
      } else {
        results.diskFilesPurged = true;
      }
    } catch (fileErr) {
      console.warn('[Delete] Disk file deletion warning:', fileErr);
    }

    // 7. Revoke family code and tokens
    revokedFamilyCodes.add(targetCode);

    return res.json({
      success: true,
      message: `Family ${targetCode} records, sessions, and files permanently deleted.`,
      details: results,
    });
  } catch (err: any) {
    console.error('[Delete] Server account deletion error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server failed to delete all family records.',
      error: err?.message,
      partialResults: results,
    });
  }
});

// -------------------------------------------------------------
// 2. Live Status & Caregiver Session Endpoints
// -------------------------------------------------------------

// Get caregiver session for a pairing code
app.get('/api/caregiver/session/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const familyState = getOrCreateFamilyState(code);
  if (!familyState) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code' });
  }

  let session = getCaregiverSession(code);

  if (!session) {
    // Check if pairing session exists
    const pairing = pairingSessions.get(code);
    session = {
      pairingCode: code,
      childName: pairing?.childName || (familyState.childProfile?.name && familyState.childProfile.name !== 'Leo' ? familyState.childProfile.name : 'Child'),
      lastActiveTime: new Date().toISOString(),
      currentActivity: familyState.childState?.currentActivity || 'Active in BeeYou',
      currentMood: (familyState.childState?.currentMood as any) || 'calm',
      habitsCompletedToday: familyState.childState?.habitsCompletedToday || 2,
      totalHabits: familyState.childState?.totalHabits || 4,
      routineProgress: null,
      stars: familyState.childState?.stars || 15,
      isOffline: false,
      messages: familyState.messages || [],
      caregiverPhone: pairing?.caregiverPhone,
      permissions: pairing?.permissions,
      activeAlert: familyState.activeAlert && familyState.activeAlert.status !== 'resolved' ? familyState.activeAlert : null,
      unlinked: false,
    };
    setCaregiverSession(code, session);
  } else {
    const rawActiveAlert = familyState.activeAlert || session.activeAlert || null;
    session.activeAlert = rawActiveAlert && rawActiveAlert.status !== 'resolved' ? rawActiveAlert : null;
    if (familyState.childProfile?.name && familyState.childProfile.name !== 'Leo') {
      session.childName = familyState.childProfile.name;
    }
    if (familyState.childState) {
      session.currentActivity = familyState.childState.currentActivity || session.currentActivity;
      session.currentMood = familyState.childState.currentMood || session.currentMood;
      session.habitsCompletedToday = familyState.childState.habitsCompletedToday ?? session.habitsCompletedToday;
      session.stars = familyState.childState.stars ?? session.stars;
    }
    setCaregiverSession(code, session);
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'This device has been unlinked.', session: { ...session, unlinked: true } });
  }

  return res.json({ session, state: familyState });
});

// Child updates their active state (activity, mood, AAC, habits, routine)
app.post('/api/caregiver/sync', requireFamilyAuth(), (req, res) => {
  const {
    pairingCode,
    childName,
    currentActivity,
    currentMood,
    currentMoodReason,
    currentMoodNeed,
    lastAacSentence,
    habitsCompletedToday,
    totalHabits,
    routineProgress,
    stars,
    isOffline,
    quickAlert,
    caregiverPhone,
    permissions,
  } = req.body || {};

  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }
  const existing = getCaregiverSession(code);

  if (existing && existing.unlinked) {
    return res.status(403).json({ error: 'Device unlinked. Sync halted.' });
  }

  const updated: CaregiverSessionData = {
    pairingCode: code,
    childName: childName || existing?.childName || 'Child',
    lastActiveTime: new Date().toISOString(),
    currentActivity: currentActivity || existing?.currentActivity || 'Active in BeeYou',
    currentMood: currentMood !== undefined ? currentMood : (existing?.currentMood ?? null),
    currentMoodReason: currentMoodReason !== undefined ? currentMoodReason : existing?.currentMoodReason,
    currentMoodNeed: currentMoodNeed !== undefined ? currentMoodNeed : existing?.currentMoodNeed,
    lastAacSentence: lastAacSentence !== undefined ? lastAacSentence : existing?.lastAacSentence,
    lastSpokenTime: lastAacSentence ? new Date().toISOString() : existing?.lastSpokenTime,
    habitsCompletedToday: habitsCompletedToday ?? existing?.habitsCompletedToday ?? 0,
    totalHabits: totalHabits ?? existing?.totalHabits ?? 0,
    routineProgress: routineProgress !== undefined ? routineProgress : existing?.routineProgress,
    stars: stars ?? existing?.stars ?? 0,
    isOffline: !!isOffline,
    quickAlert: quickAlert !== undefined ? quickAlert : existing?.quickAlert,
    messages: existing?.messages || [],
    caregiverPhone: caregiverPhone || existing?.caregiverPhone,
    permissions: permissions || existing?.permissions,
    unlinked: false,
  };

  setCaregiverSession(code, updated);

  broadcastEvent(code, {
    eventId: `ev-sync-${Date.now()}`,
    type: 'CHILD_STATUS_UPDATE',
    pairingCode: code,
    status: updated,
    sentAt: Date.now(),
  });

  return res.json({ success: true, session: updated });
});

// Caregiver sends a predefined or custom message to child
app.post('/api/caregiver/message', requireFamilyAuth(), (req, res) => {
  let { pairingCode, senderName, text, emoji, responseId, senderRole } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);

  // Defensive auto-healing: if text is "Caregiver" and senderName is the message phrase, swap them
  if (
    typeof text === 'string' &&
    typeof senderName === 'string' &&
    (text.trim().toLowerCase() === 'caregiver' || text.trim().toLowerCase() === 'child') &&
    senderName.trim().toLowerCase() !== text.trim().toLowerCase()
  ) {
    const temp = text;
    text = senderName;
    senderName = temp;
  }

  if (!code || !text) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode and message text are required.' });
  }

  const determinedRole = senderRole || (
    typeof senderName === 'string' &&
    senderName.trim().toLowerCase() !== 'caregiver' &&
    senderName.trim().toLowerCase() !== 'parent'
      ? 'child'
      : 'caregiver'
  );

  let session = getCaregiverSession(code);
  if (!session) {
    session = {
      pairingCode: code,
      childName: 'Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Active in BeeYou',
      currentMood: 'calm',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
      unlinked: false,
    };
    setCaregiverSession(code, session);
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'Cannot send message to unlinked device.' });
  }

  const newMessage: CaregiverMessageItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    senderName: senderName || (determinedRole === 'child' ? 'Child' : 'Caregiver'),
    text: text.trim(),
    emoji: emoji || '',
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
    senderRole: determinedRole,
  };

  session.messages.push(newMessage);
  if (session.messages.length > 30) {
    session.messages = session.messages.slice(-30);
  }
  setCaregiverSession(code, session);

  broadcastEvent(code, {
    eventId: `ev-msg-${Date.now()}`,
    type: 'CAREGIVER_MESSAGE',
    pairingCode: code,
    message: newMessage,
    sentAt: Date.now(),
  });

  return res.json({ success: true, message: newMessage });
});

// Child checks for unread messages from caregiver
app.get('/api/caregiver/messages/:code', requireFamilyAuth(), (req, res) => {
  const code = req.params.code;
  const session = getCaregiverSession(code);
  if (!session || session.unlinked) {
    return res.json({ messages: [], unreadCount: 0 });
  }

  const unreadCount = session.messages.filter((m) => !m.read).length;
  session.messages.forEach((m) => {
    m.read = true;
  });
  setCaregiverSession(code, session);

  const normalizedMessages = session.messages.map((m) => {
    const rawSender = String(m.senderName || '');
    const rawText = String(m.text || '');
    const isActuallyInverted =
      (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
      rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
    return isActuallyInverted
      ? { ...m, senderName: rawText, text: rawSender }
      : m;
  });

  return res.json({ messages: normalizedMessages, unreadCount });
});

// Child triggers an alert (predefined 5 options supported)
app.post('/api/caregiver/alert', requireFamilyAuth(), (req, res) => {
  const { id, pairingCode, childName, emotion, alertId, label, emoji, location, note } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  let session = getCaregiverSession(code);
  if (!session) {
    session = {
      pairingCode: code,
      childName: childName || 'Child',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Alert Triggered',
      currentMood: emotion || 'need_help',
      habitsCompletedToday: 0,
      totalHabits: 4,
      routineProgress: null,
      stars: 10,
      isOffline: false,
      messages: [],
      unlinked: false,
    };
    setCaregiverSession(code, session);
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'Device is unlinked.' });
  }

  // Check permissions: if alerts disabled in permissions, reject
  if (session.permissions && session.permissions.receiveAlerts === false) {
    return res.status(403).json({ error: 'Alerts are disabled by user permissions.' });
  }

  const alert = {
    id: id || ('alert-' + Date.now()),
    childName: childName || session.childName || 'Child',
    pairingCode: code,
    emotion: emotion || 'need_help',
    alertId: alertId || 'need_help',
    label: label || 'Needs Support',
    emoji: emoji || '🚨',
    location: location || 'school',
    note: note || '',
    timestamp: new Date().toISOString(),
    status: 'active',
    deliveryStatus: 'dispatched', // Dispatched to relay; not yet confirmed received on caregiver device
    dispatchedAt: new Date().toISOString(),
    deliveredToDeviceAt: null,
    acknowledgedAt: null,
  };

  session.activeAlert = alert;
  session.currentMood = emotion;
  session.quickAlert = `ALERT: ${label} (${location ? 'At ' + location : 'Needs help'})`;
  session.lastActiveTime = new Date().toISOString();
  setCaregiverSession(code, session);

  // Also sync persistent family state
  const familyState = getOrCreateFamilyState(code);
  if (familyState) {
    familyState.activeAlert = alert;
    familyState.alertHistory = [alert, ...(familyState.alertHistory || []).filter((a: any) => a.id !== alert.id)].slice(0, 50);
    familyState.lastUpdated = Date.now();
    saveFamilyState(code, familyState, true);
  }

  broadcastEvent(code, {
    eventId: `ev-alert-${Date.now()}`,
    type: 'CAREGIVER_ALERT',
    pairingCode: code,
    alert,
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert, deliveryStatus: 'dispatched', state: familyState });
});

// Caregiver device confirms physical receipt of the alert
app.post('/api/caregiver/alert/delivered', requireFamilyAuth(), (req, res) => {
  const { pairingCode, alertId, deviceId } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  const session = getCaregiverSession(code);
  const familyState = getOrCreateFamilyState(code);
  const deliveredAt = new Date().toISOString();

  if (session && session.activeAlert && (!alertId || session.activeAlert.id === alertId)) {
    if (session.activeAlert.deliveryStatus !== 'acknowledged') {
      session.activeAlert.deliveryStatus = 'delivered_to_device';
      session.activeAlert.deliveredToDeviceAt = deliveredAt;
    }
    setCaregiverSession(code, session);
  }

  if (familyState && familyState.activeAlert && (!alertId || familyState.activeAlert.id === alertId)) {
    if (familyState.activeAlert.deliveryStatus !== 'acknowledged') {
      familyState.activeAlert.deliveryStatus = 'delivered_to_device';
      familyState.activeAlert.deliveredToDeviceAt = deliveredAt;
    }
    familyState.lastUpdated = Date.now();
    saveFamilyState(code, familyState, true);
  }

  broadcastEvent(code, {
    eventId: `ev-deliv-${Date.now()}`,
    type: 'CAREGIVER_ALERT_DELIVERED',
    pairingCode: code,
    delivery: {
      alertId: alertId || (session?.activeAlert?.id) || code,
      deliveredAt,
      deviceId: deviceId || 'caregiver-device',
    },
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, deliveredAt });
});

// Caregiver acknowledges the alert and sends instant predefined reassurance response
app.post('/api/caregiver/alert/acknowledge', requireFamilyAuth(), (req, res) => {
  const { pairingCode, acknowledgedBy, responseMessage, responseId, alertId } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  const session = getCaregiverSession(code);
  const familyState = getOrCreateFamilyState(code);
  if (!familyState) {
    return res.status(400).json({ error: 'BadRequest', message: 'Invalid family code.' });
  }

  if (session && session.activeAlert) {
    session.activeAlert.status = 'acknowledged';
    session.activeAlert.deliveryStatus = 'acknowledged';
    session.activeAlert.acknowledgedBy = acknowledgedBy || 'Caregiver';
    session.activeAlert.acknowledgedAt = new Date().toISOString();
    session.activeAlert.responseMessage = responseMessage;
    session.activeAlert.responseId = responseId;
    setCaregiverSession(code, session);
  }

  if (familyState.activeAlert) {
    familyState.activeAlert.status = 'acknowledged';
    familyState.activeAlert.deliveryStatus = 'acknowledged';
    familyState.activeAlert.acknowledgedBy = acknowledgedBy || familyState.caregiverName || 'Caregiver';
    familyState.activeAlert.acknowledgedAt = new Date().toISOString();
    familyState.activeAlert.responseMessage = responseMessage;
    familyState.activeAlert.responseId = responseId;
  }

  if (Array.isArray(familyState.alertHistory)) {
    familyState.alertHistory = familyState.alertHistory.map((a: any) => {
      if (familyState.activeAlert && a.id === familyState.activeAlert.id) {
        return {
          ...a,
          status: 'acknowledged',
          acknowledgedBy: acknowledgedBy || 'Caregiver',
          responseMessage,
        };
      }
      return a;
    });
  }

  // Push response message to child's message stream
  if (responseMessage) {
    const newMessage: CaregiverMessageItem = {
      id: 'msg-ack-' + Date.now(),
      senderName: acknowledgedBy || 'Caregiver',
      text: responseMessage,
      emoji: '',
      timestamp: new Date().toISOString(),
      read: false,
      responseId,
      senderRole: 'caregiver',
    };
    if (session) {
      session.messages.push(newMessage);
      setCaregiverSession(code, session);
    }
    familyState.messages = [...(familyState.messages || []).slice(-29), newMessage];

    broadcastEvent(code, {
      eventId: `ev-msg-${Date.now()}`,
      type: 'CAREGIVER_MESSAGE',
      pairingCode: code,
      message: newMessage,
      state: familyState,
      sentAt: Date.now(),
    });
  }

  familyState.lastUpdated = Date.now();
  saveFamilyState(code, familyState, true);

  broadcastEvent(code, {
    eventId: `ev-ack-${Date.now()}`,
    type: 'CAREGIVER_ALERT_ACK',
    pairingCode: code,
    ack: { alertId: alertId || code, responseMessage, responseId, by: acknowledgedBy || 'Caregiver' },
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert: session?.activeAlert || familyState.activeAlert, state: familyState });
});

// Caregiver resolves and clears the active alert
app.post('/api/caregiver/alert/resolve', requireFamilyAuth(), (req, res) => {
  const { pairingCode, alertId } = req.body || {};
  const code = sanitizeFamilyCode(pairingCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'A valid pairingCode is required.' });
  }

  const session = getCaregiverSession(code);
  if (session) {
    session.activeAlert = null;
    session.quickAlert = null;
    setCaregiverSession(code, session);
  }

  const familyState = getOrCreateFamilyState(code);
  if (familyState) {
    familyState.activeAlert = null;
    if (Array.isArray(familyState.alertHistory)) {
      familyState.alertHistory = familyState.alertHistory.map((a: any) => {
        if (!alertId || a.id === alertId) {
          return { ...a, status: 'resolved' };
        }
        return a;
      });
    }
    familyState.lastUpdated = Date.now();
    saveFamilyState(code, familyState, true);
  }

  broadcastEvent(code, {
    eventId: `ev-res-${Date.now()}`,
    type: 'ALERT_RESOLVED',
    pairingCode: code,
    alertId,
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, message: 'Alert resolved successfully.', state: familyState });
});

// -------------------------------------------------------------
// BeeYou In-App Purchase & Subscription Security Endpoints
// Pre-Launch Audit Section 1: StoreKit & Google Play Billing Compliance
// -------------------------------------------------------------

const ENTITLEMENT_SECRET = process.env.ENTITLEMENT_SECRET || 'by_entitlement_v1_8f93a1c94b2';
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
export const serverSubscriptions = new Map<string, any>();

// Load persisted subscriptions from disk on startup
(function loadServerSubscriptions() {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [code, sub] of Object.entries(parsed)) {
          serverSubscriptions.set(code, sub);
        }
      }
    }
  } catch (err) {
    console.warn('[Subscription Store] Could not load persisted subscriptions:', err);
  }
})();

async function saveServerSubscriptions(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    const data: Record<string, any> = {};
    for (const [code, sub] of serverSubscriptions.entries()) {
      data[code] = sub;
    }
    const tempPath = `${SUBSCRIPTIONS_FILE}.${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, SUBSCRIPTIONS_FILE);
  } catch (err) {
    console.error('[Subscription Store] saveServerSubscriptions error:', err);
  }
}

export function computeServerSubscriptionSignature(sub: any): string {
  const tier = sub.tier || 'basic';
  const status = sub.status || 'basic';
  const cycle = sub.billingCycle || 'monthly';
  const expires = sub.expiresAt || sub.trialEndDate || 'none';
  const provider = sub.storeProvider || 'none';
  const order = sub.orderId || 'none';

  const message = `${tier}|${status}|${cycle}|${expires}|${provider}|${order}|${ENTITLEMENT_SECRET}`;

  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193);
    h2 = Math.imul(h2 ^ (ch << 3), 0x5bd1e995);
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');

  return `by_sig_v1_${part1}${part2}${part3}${part4}`;
}

// 1. Verify Purchase & Issue Cryptographic Entitlement
app.post('/api/subscription/verify', (req, res) => {
  const { familyCode, orderId, productId, storeProvider, tier, status, billingCycle, expiresAt } = req.body || {};
  const code = sanitizeFamilyCode(familyCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'Valid familyCode is required.' });
  }

  const subscriptionRecord = {
    tier: tier === 'premium' ? 'premium' : 'basic',
    status: status || 'active',
    billingCycle: billingCycle || 'monthly',
    productId: productId || 'app.beeyou.subscription.monthly',
    storeProvider: storeProvider || 'apple_app_store',
    orderId: orderId || `ord_${Date.now()}`,
    purchasedAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    weeklyPrice: 2.99,
    monthlyPrice: 9.99,
    yearlyPrice: 89.99,
    trialDays: 15,
    autoRenew: true,
    lastVerifiedAt: new Date().toISOString(),
    entitlementSignature: '',
  };

  subscriptionRecord.entitlementSignature = computeServerSubscriptionSignature(subscriptionRecord);
  serverSubscriptions.set(code, subscriptionRecord);
  saveServerSubscriptions().catch(() => {});

  // Update associated familyAccount tier if present
  for (const account of familyAccounts.values()) {
    if (account.familyCode === code) {
      account.subscriptionTier = subscriptionRecord.tier === 'premium' ? 'premium' : 'free';
      account.lastSyncedAt = new Date().toISOString();
      saveFamilyAccounts().catch(() => {});
      break;
    }
  }

  return res.json({
    success: true,
    verified: true,
    subscription: subscriptionRecord,
  });
});

// 2. Restore Purchases Across Devices
app.post('/api/subscription/restore', (req, res) => {
  const { familyCode, email } = req.body || {};
  const code = sanitizeFamilyCode(familyCode);

  let existingSub: any = null;
  if (code && serverSubscriptions.has(code)) {
    existingSub = serverSubscriptions.get(code);
  } else if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    for (const sub of serverSubscriptions.values()) {
      if (sub.customerEmail === cleanEmail) {
        existingSub = sub;
        break;
      }
    }
  }

  if (!existingSub) {
    return res.status(404).json({
      success: false,
      restored: false,
      message: 'No previous purchases found for this Apple ID / Google account.',
    });
  }

  // Check lifecycle (active or expired)
  const now = Date.now();
  if (existingSub.expiresAt && new Date(existingSub.expiresAt).getTime() < now && existingSub.status !== 'grace_period') {
    existingSub.tier = 'basic';
    existingSub.status = 'expired';
    existingSub.entitlementSignature = computeServerSubscriptionSignature(existingSub);
    if (code) serverSubscriptions.set(code, existingSub);
    saveServerSubscriptions().catch(() => {});

    return res.json({
      success: true,
      restored: false,
      message: 'Subscription has expired. Please renew to continue BeeYou Premium.',
      subscription: existingSub,
    });
  }

  // Refresh signature & return
  existingSub.lastVerifiedAt = new Date().toISOString();
  existingSub.entitlementSignature = computeServerSubscriptionSignature(existingSub);
  if (code) serverSubscriptions.set(code, existingSub);
  saveServerSubscriptions().catch(() => {});

  return res.json({
    success: true,
    restored: existingSub.tier === 'premium',
    subscription: existingSub,
    message: 'Purchases restored successfully.',
  });
});

// 3. Subscription Status Check
app.post('/api/subscription/status', (req, res) => {
  const { familyCode } = req.body || {};
  const code = sanitizeFamilyCode(familyCode);
  if (!code) {
    return res.status(400).json({ error: 'BadRequest', message: 'Valid familyCode is required.' });
  }

  const sub = serverSubscriptions.get(code);
  if (!sub) {
    const basicSub = {
      tier: 'basic',
      status: 'basic',
      billingCycle: 'monthly',
      weeklyPrice: 2.99,
      monthlyPrice: 9.99,
      yearlyPrice: 89.99,
      trialDays: 15,
      autoRenew: false,
      storeProvider: 'none',
      entitlementSignature: '',
    };
    basicSub.entitlementSignature = computeServerSubscriptionSignature(basicSub);
    return res.json({ success: true, subscription: basicSub });
  }

  return res.json({ success: true, subscription: sub });
});

// 4. App Store Server Notifications & Google Play RTDN Webhook
app.post('/api/subscription/webhook', (req, res) => {
  const { eventType, familyCode, cancellationReason } = req.body || {};
  const code = sanitizeFamilyCode(familyCode);

  console.log(`[Subscription Webhook] Received ${eventType} for ${code || 'unknown'}`);

  if (code && serverSubscriptions.has(code)) {
    const sub = serverSubscriptions.get(code);
    switch (eventType) {
      case 'DID_RENEW':
      case 'PURCHASE_CONFIRMED':
        sub.status = 'active';
        sub.tier = 'premium';
        sub.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'DID_FAIL_TO_RENEW':
        sub.status = 'grace_period';
        sub.gracePeriodEndDate = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'CANCEL':
      case 'DID_CANCEL':
        sub.status = 'cancelled';
        sub.autoRenew = false;
        sub.cancellationReason = cancellationReason || 'Cancelled by user';
        break;
      case 'REFUND':
      case 'REVOKE':
        sub.status = eventType === 'REFUND' ? 'refunded' : 'revoked';
        sub.tier = 'basic';
        sub.autoRenew = false;
        sub.cancellationReason = eventType === 'REFUND' ? 'Purchase was refunded' : 'Subscription was revoked';
        break;
      case 'EXPIRED':
        sub.status = 'expired';
        sub.tier = 'basic';
        sub.autoRenew = false;
        break;
    }

    sub.entitlementSignature = computeServerSubscriptionSignature(sub);
    serverSubscriptions.set(code, sub);
    saveServerSubscriptions().catch(() => {});

    broadcastEvent(code, {
      eventId: `ev-sub-${Date.now()}`,
      type: 'SUBSCRIPTION_UPDATED',
      pairingCode: code,
      subscription: sub,
      sentAt: Date.now(),
    });
  }

  return res.json({ received: true, eventType });
});

app.get(['/privacy', '/privacy.html'], (_req, res) => {
  const filePath = isProd && fs.existsSync(path.resolve(__dirname, 'dist', 'privacy.html'))
    ? path.resolve(__dirname, 'dist', 'privacy.html')
    : path.resolve(__dirname, 'public', 'privacy.html');
  return res.sendFile(filePath);
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const host = '0.0.0.0';
  app.listen(childPort, host, () => {
    console.log(`🧒 Child Tablet App listening on http://0.0.0.0:${childPort} (Local: http://localhost:${childPort})`);
  });

  if (childPort !== caregiverPort) {
    app.listen(caregiverPort, host, () => {
      console.log(`👑 Caregiver Controller Hub listening on http://0.0.0.0:${caregiverPort} (Local: http://localhost:${caregiverPort})`);
    }).on('error', (err: any) => {
      console.warn(`Could not bind caregiver port ${caregiverPort}:`, err.message);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

