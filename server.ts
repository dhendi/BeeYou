import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const childPort = Number(process.env.PORT) || 3000;
const caregiverPort = Number(process.env.CAREGIVER_PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Permissive CORS for cross-port communication between child (3000) and caregiver (3001)
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', childPort, caregiverPort, timestamp: new Date().toISOString() });
});

// Lightweight On-Demand Translation Endpoint (Free Google Translate API fallback)
app.get('/api/translate', async (req, res) => {
  const text = String(req.query.text || '').trim();
  const to = String(req.query.to || 'fil').trim();
  if (!text) return res.json({ translated: text });
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data: any = await response.json();
    const translated = data?.[0]?.[0]?.[0] || text;
    res.json({ translated });
  } catch (err: any) {
    res.json({ translated: text });
  }
});

// Authentic High-Fidelity Audio Streaming Endpoint (Google Neural TTS Stream)
// Provides authentic native Filipino, Spanish, French, Japanese pronunciation
const ttsAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();

app.get('/api/tts', async (req, res) => {
  const text = String(req.query.text || '').trim();
  const lang = String(req.query.lang || 'fil').trim().toLowerCase();
  if (!text) {
    return res.status(400).send('Missing text parameter');
  }

  // Normalize language codes (e.g., fil-PH -> fil, tl-PH -> fil, fr_ca -> fr-CA, zh -> zh-CN)
  let normalizedLang = 'en';
  if (lang.startsWith('fil') || lang.startsWith('tl')) {
    normalizedLang = 'fil';
  } else if (lang === 'fr_ca' || lang === 'fr-ca') {
    normalizedLang = 'fr-CA';
  } else if (lang === 'zh' || lang.startsWith('zh')) {
    normalizedLang = 'zh-CN';
  } else {
    normalizedLang = lang.substring(0, 2);
  }
  const cacheKey = `${normalizedLang}_${text.toLowerCase()}`;

  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.send(cached.buffer);
  }

  try {
    const safeText = text.length > 200 ? text.slice(0, 200) : text;
    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(normalizedLang)}&client=tw-ob&q=${encodeURIComponent(safeText)}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('TTS upstream error');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    if (ttsAudioCache.size > 500) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, { buffer, contentType });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.send(buffer);
  } catch (err: any) {
    console.error('[TTS Proxy Error]:', err);
    return res.status(500).send('TTS internal error');
  }
});

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
}

interface TemporaryPairingSessionData {
  pairingCode: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'paired' | 'expired' | 'revoked';
  initiatedBy: 'child_device' | 'caregiver';
  childName?: string;
  childAge?: number;
  ageGroup?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  permissions?: any;
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

const caregiverSessions = new Map<string, CaregiverSessionData>();
const pairingSessions = new Map<string, TemporaryPairingSessionData>();

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

const DATA_DIR = path.join(process.cwd(), '.data');
const STATE_FILE = path.join(DATA_DIR, 'shared_families.json');

function loadAllFamilyStates(): Map<string, SharedFamilyState> {
  const map = new Map<string, SharedFamilyState>();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        for (const [code, val] of Object.entries(data)) {
          map.set(code.toUpperCase(), val as SharedFamilyState);
        }
      }
    }
  } catch (err) {
    console.warn('Persistent family state file not found or corrupted, will recreate:', err);
  }
  return map;
}

function saveAllFamilyStates(map: Map<string, SharedFamilyState>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, any> = {};
    for (const [k, v] of map.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving persistent family state:', err);
  }
}

function getOrCreateFamilyState(code: string, email?: string): SharedFamilyState {
  const cleanCode = (code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  let state = allStates.get(cleanCode);

  if (!state) {
    state = {
      familyCode: cleanCode,
      email: email || (cleanCode === 'BEE-DEMO' ? 'demo@beeyou.app' : `${cleanCode.toLowerCase()}@family.beeyou.app`),
      caregiverName: 'Sarah (Mom)',
      caregiverRole: 'Mom',
      childProfile: {
        name: 'Leo',
        ageGroup: 'kid',
        pin: '1234',
        interests: ['Lego building', 'Visual schedules'],
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
    allStates.set(cleanCode, state);
    saveAllFamilyStates(allStates);
  }
  return state;
}

// Pre-seed Demo family immediately on startup
getOrCreateFamilyState('BEE-DEMO', 'demo@beeyou.app');

interface ServerFamilyAccount {
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

const familyAccounts = new Map<string, ServerFamilyAccount>();

// Pre-seed Demo Account
familyAccounts.set('demo@beeyou.app', {
  id: 'fam-demo-2026',
  email: 'demo@beeyou.app',
  familyCode: 'BEE-DEMO',
  caregiverName: 'Sarah (Mom)',
  caregiverRole: 'Mom',
  childProfile: {
    name: 'Leo',
    ageGroup: 'kid',
    pin: '1234',
    interests: ['Lego building', 'Visual schedules'],
    pronouns: 'he/him',
  },
  subscriptionTier: 'premium',
  createdAt: '2026-10-01T00:00:00.000Z',
  lastSyncedAt: new Date().toISOString(),
});

function getDeterministicFamilyCode(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'demo@beeyou.app' || clean === 'demo' || clean === 'test@beeyou.app') {
    return 'BEE-DEMO';
  }
  const prefix = clean.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 5).toUpperCase();
  return `BEE-${prefix || 'FAM'}`;
}

const eventHistoryByCode = new Map<string, CloudSyncEvent[]>();
const sseClientsByCode = new Map<string, Set<express.Response>>();
const lastAlertTimeByFamily = new Map<string, number>();
const lastAckTimeByFamily = new Map<string, number>();

function broadcastEvent(code: string, event: CloudSyncEvent): void {
  const cleanCode = (code || 'BEE-DEMO').trim().toUpperCase();
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
}

// Helper to generate a clean, readable temporary pairing code (e.g., K7P4-92)
function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let part2 = '';
  for (let i = 0; i < 2; i++) {
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${part1}-${part2}`;
}

// -------------------------------------------------------------
// 1. Temporary Pairing Sessions (Flow A & Flow B)
// -------------------------------------------------------------

// Create a new temporary single-use expirable pairing session
app.post('/api/caregiver/pairing/create', (req, res) => {
  const { initiatedBy, childName, childAge, ageGroup, caregiverName, caregiverPhone, caregiverEmail, permissions } = req.body;
  
  let pairingCode = generatePairingCode();
  // Ensure unique
  while (pairingSessions.has(pairingCode)) {
    pairingCode = generatePairingCode();
  }

  const token = 'tok-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
  const now = Date.now();
  const session: TemporaryPairingSessionData = {
    pairingCode,
    token,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
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
  return res.json({ success: true, session });
});

// Check status of a pairing code (for live polling during setup)
app.get('/api/caregiver/pairing/status/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const session = pairingSessions.get(code);

  if (!session) {
    return res.status(404).json({ error: 'Pairing session not found or expired', status: 'not_found' });
  }

  if (Date.now() > session.expiresAt && session.status === 'pending') {
    session.status = 'expired';
  }

  return res.json({ success: true, session });
});

// Claim/complete pairing (from caregiver or child)
app.post('/api/caregiver/pairing/claim', (req, res) => {
  const { pairingCode, claimerRole, childName, childAge, ageGroup, caregiverName, caregiverPhone, caregiverEmail, permissions } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();
  const session = pairingSessions.get(code);

  if (!session) {
    return res.status(404).json({ error: 'Invalid or expired pairing code.' });
  }

  if (Date.now() > session.expiresAt || session.status === 'expired') {
    session.status = 'expired';
    return res.status(400).json({ error: 'Pairing code has expired. Please generate a new code.' });
  }

  if (session.status === 'paired') {
    return res.status(400).json({ error: 'This pairing code has already been used.' });
  }

  // Update session with claimed details
  if (childName) session.childName = childName;
  if (childAge) session.childAge = Number(childAge);
  if (ageGroup) session.ageGroup = ageGroup;
  if (caregiverName) session.caregiverName = caregiverName;
  if (caregiverPhone) session.caregiverPhone = caregiverPhone;
  if (caregiverEmail) session.caregiverEmail = caregiverEmail;
  if (permissions) session.permissions = permissions;

  session.status = 'paired';

  // Initialize or update the permanent live caregiver session for this linked pairing
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

  caregiverSessions.set(code, permanentSession);

  // Broadcast DEVICE_PAIRED event across all connected devices
  broadcastEvent(code, {
    eventId: `ev-pair-${Date.now()}`,
    type: 'DEVICE_PAIRED',
    pairingCode: code,
    session: permanentSession,
    sentAt: Date.now(),
  });

  return res.json({ 
    success: true, 
    session,
    permanentSession,
    message: 'Device successfully paired and linked!' 
  });
});

// Unlink a paired device
app.post('/api/caregiver/device/unlink', (req, res) => {
  const { pairingCode } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();

  const session = caregiverSessions.get(code);
  if (session) {
    session.unlinked = true;
    session.activeAlert = null;
    session.quickAlert = 'Device unlinked.';
  }

  const pairing = pairingSessions.get(code);
  if (pairing) {
    pairing.status = 'revoked';
  }

  // Broadcast DEVICE_UNLINKED event
  broadcastEvent(code, {
    eventId: `ev-unlink-${Date.now()}`,
    type: 'DEVICE_UNLINKED',
    pairingCode: code,
    sentAt: Date.now(),
  });

  return res.json({ success: true, message: 'Device unlinked successfully.' });
});

// -------------------------------------------------------------
// Real-time Event Hub: Publish Event, Live SSE Stream & Polling
// -------------------------------------------------------------

// Universal Event Publisher (Child <-> Caregiver bidirectional relay)
app.post('/api/caregiver/event', (req, res) => {
  const envelope = req.body || {};
  const pairingCode = (envelope.pairingCode || envelope.code || 'BEE-DEMO').trim().toUpperCase();

  if (!envelope.eventId) {
    envelope.eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
  if (!envelope.sentAt) {
    envelope.sentAt = Date.now();
  }
  envelope.pairingCode = pairingCode;

  // Auto-sync session state in server memory
  let session = caregiverSessions.get(pairingCode);
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
    caregiverSessions.set(pairingCode, session);
  }

  if (envelope.type === 'CAREGIVER_ALERT' && envelope.alert) {
    session.activeAlert = envelope.alert;
    session.quickAlert = `ALERT: ${envelope.alert.label}`;
    session.lastActiveTime = new Date().toISOString();
    session.lastChildActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CAREGIVER_ALERT_ACK' && envelope.ack) {
    if (session.activeAlert) {
      session.activeAlert.status = 'acknowledged';
      session.activeAlert.acknowledgedBy = envelope.ack.by;
    }
    session.lastCaregiverActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CAREGIVER_MESSAGE' && envelope.message) {
    session.messages.push(envelope.message);
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

  // Update persistent state timestamp
  const familyState = getOrCreateFamilyState(pairingCode);
  familyState.lastUpdated = Date.now();

  broadcastEvent(pairingCode, envelope);
  return res.json({ success: true, eventId: envelope.eventId });
});

// Live Server-Sent Events (SSE) Stream for real-time 0ms delivery
app.get('/api/caregiver/events/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();

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
  const familyState = getOrCreateFamilyState(code);
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

// Short-polling endpoint for background reliability & environments where SSE drops
app.get('/api/caregiver/poll/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const since = Number(req.query.since) || 0;
  const history = eventHistoryByCode.get(code) || [];
  const newEvents = history.filter((e) => e.sentAt > since);
  const familyState = getOrCreateFamilyState(code);
  const session = caregiverSessions.get(code);

  const mergedSession = {
    ...(session || {}),
    ...(familyState.childState || {}),
    activeAlert: familyState.activeAlert || session?.activeAlert || null,
    childName: familyState.childProfile?.name || session?.childName || 'Leo',
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
app.get('/api/family/state/:code', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const state = getOrCreateFamilyState(code);
  return res.json({ success: true, state });
});

// 2. Update family state remotely (routines, aac, plansChanged, childState, childProfile)
app.post('/api/family/state/:code', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  const current = getOrCreateFamilyState(code);

  const { routines, aacItems, plansChanged, childState, childProfile, caregiverName } = req.body || {};

  if (Array.isArray(routines)) current.routines = routines;
  if (Array.isArray(aacItems)) current.aacItems = aacItems;
  if (plansChanged && typeof plansChanged === 'object') current.plansChanged = { ...current.plansChanged, ...plansChanged };
  if (childState && typeof childState === 'object') current.childState = { ...current.childState, ...childState };
  if (childProfile && typeof childProfile === 'object') current.childProfile = { ...current.childProfile, ...childProfile };
  if (caregiverName) current.caregiverName = caregiverName;
  current.lastUpdated = Date.now();

  allStates.set(code, current);
  saveAllFamilyStates(allStates);

  // Sync with caregiverSessions map for backwards compatibility
  const session = caregiverSessions.get(code);
  if (session && current.childState) {
    Object.assign(session, current.childState);
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

// 3. Child triggers an emergency / sensory overload alert
app.post('/api/family/alert/:code', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  const current = getOrCreateFamilyState(code);

  const now = Date.now();
  const lastTime = lastAlertTimeByFamily.get(code) || 0;
  if (now - lastTime < 5000 && current.activeAlert) {
    return res.json({
      success: true,
      alert: current.activeAlert,
      cooldown: true,
      message: '5-second alert cooldown in effect',
      state: current,
    });
  }
  lastAlertTimeByFamily.set(code, now);

  const { id, childName, emotion, alertId, label, emoji, location, note } = req.body || {};

  const alert = {
    id: id || ('alert-' + Date.now()),
    familyCode: code,
    childName: childName || current.childProfile.name || 'Leo',
    emotion: emotion || 'need_help',
    alertId: alertId || 'need_help',
    label: label || 'Needs Support',
    emoji: emoji || '🚨',
    location: location || 'home',
    note: note || '',
    timestamp: new Date().toISOString(),
    status: 'active',
  };

  current.activeAlert = alert;
  current.alertHistory = [alert, ...(current.alertHistory || []).filter((a: any) => a.id !== alert.id)].slice(0, 50);
  current.lastUpdated = Date.now();

  allStates.set(code, current);
  saveAllFamilyStates(allStates);

  // Sync legacy caregiverSessions map
  const session = caregiverSessions.get(code);
  if (session) {
    session.activeAlert = alert;
    session.quickAlert = `ALERT: ${alert.label}`;
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
app.post('/api/family/alert/:code/ack', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  const current = getOrCreateFamilyState(code);

  const now = Date.now();
  const lastTime = lastAckTimeByFamily.get(code) || 0;
  if (now - lastTime < 5000) {
    return res.json({
      success: true,
      cooldown: true,
      message: '5-second response cooldown in effect',
      state: current,
    });
  }
  lastAckTimeByFamily.set(code, now);

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
      emoji: '❤️',
      timestamp: new Date().toISOString(),
      read: false,
      responseId,
    };
    current.messages = [...(current.messages || []).slice(-29), newMsg];
  }

  current.lastUpdated = Date.now();
  allStates.set(code, current);
  saveAllFamilyStates(allStates);

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
app.post('/api/family/alert/:code/resolve', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  const current = getOrCreateFamilyState(code);
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
  allStates.set(code, current);
  saveAllFamilyStates(allStates);

  // Sync legacy session
  const session = caregiverSessions.get(code);
  if (session) session.activeAlert = null;

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
app.post('/api/family/message/:code', (req, res) => {
  const code = (req.params.code || 'BEE-DEMO').trim().toUpperCase();
  const allStates = loadAllFamilyStates();
  const current = getOrCreateFamilyState(code);

  const { senderName, text, emoji, responseId } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const newMsg: CaregiverMessageItem = {
    id: 'msg-' + Date.now(),
    senderName: senderName || current.caregiverName || 'Caregiver',
    text: text.trim(),
    emoji: emoji || '❤️',
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
  };

  current.messages = [...(current.messages || []).slice(-29), newMsg];
  current.lastUpdated = Date.now();
  allStates.set(code, current);
  saveAllFamilyStates(allStates);

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
      name: childName?.trim() || 'Leo',
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
  }

  return res.json({ success: true, account, message: `Account created for ${cleanEmail}! Family code: ${familyCode}` });
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
        name: 'Leo',
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
  }

  return res.json({ success: true, account, message: `Logged in as ${cleanEmail}!` });
});

// Fetch account details by email
app.get('/api/caregiver/family/:email', (req, res) => {
  const cleanEmail = (req.params.email || '').trim().toLowerCase();
  const account = familyAccounts.get(cleanEmail);
  if (!account) {
    return res.status(404).json({ success: false, message: 'Family account not found' });
  }
  return res.json({ success: true, account });
});

// -------------------------------------------------------------
// 2. Live Status & Caregiver Session Endpoints
// -------------------------------------------------------------

// Get caregiver session for a pairing code
app.get('/api/caregiver/session/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  if (!code) {
    return res.status(400).json({ error: 'Pairing code is required' });
  }

  const familyState = getOrCreateFamilyState(code);
  let session = caregiverSessions.get(code);

  if (!session) {
    // Check if pairing session exists
    const pairing = pairingSessions.get(code);
    session = {
      pairingCode: code,
      childName: pairing?.childName || familyState.childProfile?.name || 'Leo',
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
      activeAlert: familyState.activeAlert || null,
      unlinked: false,
    };
    caregiverSessions.set(code, session);
  } else {
    session.activeAlert = familyState.activeAlert || session.activeAlert || null;
    if (familyState.childProfile?.name) session.childName = familyState.childProfile.name;
    if (familyState.childState) {
      session.currentActivity = familyState.childState.currentActivity || session.currentActivity;
      session.currentMood = familyState.childState.currentMood || session.currentMood;
      session.habitsCompletedToday = familyState.childState.habitsCompletedToday ?? session.habitsCompletedToday;
      session.stars = familyState.childState.stars ?? session.stars;
    }
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'This device has been unlinked.', session: { ...session, unlinked: true } });
  }

  return res.json({ session, state: familyState });
});

// Child updates their active state (activity, mood, AAC, habits, routine)
app.post('/api/caregiver/sync', (req, res) => {
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
  } = req.body;

  const code = (pairingCode || 'LUMI-101').trim().toUpperCase();
  const existing = caregiverSessions.get(code);

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

  caregiverSessions.set(code, updated);

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
app.post('/api/caregiver/message', (req, res) => {
  const { pairingCode, senderName, text, emoji, responseId } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();

  if (!code || !text) {
    return res.status(400).json({ error: 'Pairing code and message text are required' });
  }

  let session = caregiverSessions.get(code);
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
    caregiverSessions.set(code, session);
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'Cannot send message to unlinked device.' });
  }

  const newMessage: CaregiverMessageItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    senderName: senderName || 'Caregiver',
    text: text.trim(),
    emoji: emoji || '❤️',
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
  };

  session.messages.push(newMessage);
  if (session.messages.length > 30) {
    session.messages = session.messages.slice(-30);
  }

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
app.get('/api/caregiver/messages/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const session = caregiverSessions.get(code);
  if (!session || session.unlinked) {
    return res.json({ messages: [], unreadCount: 0 });
  }

  const unreadCount = session.messages.filter((m) => !m.read).length;
  session.messages.forEach((m) => {
    m.read = true;
  });

  return res.json({ messages: session.messages, unreadCount });
});

// Child triggers an alert (predefined 5 options supported)
app.post('/api/caregiver/alert', (req, res) => {
  const { id, pairingCode, childName, emotion, alertId, label, emoji, location, note } = req.body;
  const code = (pairingCode || 'LUMI-101').trim().toUpperCase();

  let session = caregiverSessions.get(code);
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
    caregiverSessions.set(code, session);
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'Device is unlinked.' });
  }

  // Check permissions: if alerts disabled in permissions, reject
  if (session.permissions && session.permissions.receiveAlerts === false) {
    return res.status(403).json({ error: 'Alerts are disabled by user permissions.' });
  }

  const now = Date.now();
  const lastTime = lastAlertTimeByFamily.get(code) || 0;
  if (now - lastTime < 5000 && session.activeAlert) {
    return res.json({
      success: true,
      alert: session.activeAlert,
      cooldown: true,
      message: '5-second alert cooldown in effect',
    });
  }
  lastAlertTimeByFamily.set(code, now);

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
  };

  session.activeAlert = alert;
  session.currentMood = emotion;
  session.quickAlert = `ALERT: ${label} (${location ? 'At ' + location : 'Needs help'})`;
  session.lastActiveTime = new Date().toISOString();

  // Also sync persistent family state on disk
  const allStates = loadAllFamilyStates();
  const familyState = getOrCreateFamilyState(code);
  familyState.activeAlert = alert;
  familyState.alertHistory = [alert, ...(familyState.alertHistory || []).filter((a: any) => a.id !== alert.id)].slice(0, 50);
  familyState.lastUpdated = Date.now();
  allStates.set(code, familyState);
  saveAllFamilyStates(allStates);

  broadcastEvent(code, {
    eventId: `ev-alert-${Date.now()}`,
    type: 'CAREGIVER_ALERT',
    pairingCode: code,
    alert,
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert, deliveryStatus: 'delivered', state: familyState });
});

// Caregiver acknowledges the alert and sends instant predefined reassurance response
app.post('/api/caregiver/alert/acknowledge', (req, res) => {
  const { pairingCode, acknowledgedBy, responseMessage, responseId } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();

  const now = Date.now();
  const lastTime = lastAckTimeByFamily.get(code) || 0;
  if (now - lastTime < 5000) {
    return res.json({
      success: true,
      cooldown: true,
      message: '5-second response cooldown in effect',
    });
  }
  lastAckTimeByFamily.set(code, now);

  const session = caregiverSessions.get(code);

  // Sync persistent family state on disk
  const allStates = loadAllFamilyStates();
  const familyState = getOrCreateFamilyState(code);

  if (session && session.activeAlert) {
    session.activeAlert.status = 'acknowledged';
    session.activeAlert.acknowledgedBy = acknowledgedBy || 'Caregiver';
    session.activeAlert.acknowledgedAt = new Date().toISOString();
    session.activeAlert.responseMessage = responseMessage;
    session.activeAlert.responseId = responseId;
  }

  if (familyState.activeAlert) {
    familyState.activeAlert.status = 'acknowledged';
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
      emoji: responseId === 'coming' ? '🚗' : responseId === 'im_here' ? '❤️' : '👍',
      timestamp: new Date().toISOString(),
      read: false,
      responseId,
    };
    if (session) session.messages.push(newMessage);
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
  allStates.set(code, familyState);
  saveAllFamilyStates(allStates);

  broadcastEvent(code, {
    eventId: `ev-ack-${Date.now()}`,
    type: 'CAREGIVER_ALERT_ACK',
    pairingCode: code,
    ack: { alertId: code, responseMessage, responseId, by: acknowledgedBy || 'Caregiver' },
    state: familyState,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert: session?.activeAlert || familyState.activeAlert, state: familyState });
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(childPort, () => {
    console.log(`🧒 Child Tablet App listening on http://localhost:${childPort}`);
  });

  if (childPort !== caregiverPort) {
    app.listen(caregiverPort, () => {
      console.log(`👑 Caregiver Controller Hub listening on http://localhost:${caregiverPort}`);
    }).on('error', (err: any) => {
      console.warn(`Could not bind caregiver port ${caregiverPort}:`, err.message);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

