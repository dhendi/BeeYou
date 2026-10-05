import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  } else if (envelope.type === 'CAREGIVER_ALERT_ACK' && envelope.ack) {
    if (session.activeAlert) {
      session.activeAlert.status = 'acknowledged';
      session.activeAlert.acknowledgedBy = envelope.ack.by;
    }
  } else if (envelope.type === 'CAREGIVER_MESSAGE' && envelope.message) {
    session.messages.push(envelope.message);
    if (session.messages.length > 30) session.messages = session.messages.slice(-30);
  } else if (envelope.type === 'CHILD_STATUS_UPDATE' && envelope.status) {
    Object.assign(session, envelope.status);
    session.lastActiveTime = new Date().toISOString();
  } else if (envelope.type === 'CHILD_HEARTBEAT' || envelope.type === 'HEARTBEAT') {
    session.lastActiveTime = new Date().toISOString();
    if (envelope.childStatus) {
      Object.assign(session, envelope.childStatus);
    }
  }

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

  // Send current active session state immediately
  const session = caregiverSessions.get(code);
  if (session) {
    res.write(`data: ${JSON.stringify({ type: 'CHILD_STATUS_UPDATE', status: session, sentAt: Date.now() })}\n\n`);
    if (session.activeAlert && session.activeAlert.status === 'active') {
      res.write(`data: ${JSON.stringify({ type: 'CAREGIVER_ALERT', alert: session.activeAlert, sentAt: Date.now() })}\n\n`);
    }
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
  }, 12000);

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
  const session = caregiverSessions.get(code) || null;

  return res.json({
    success: true,
    events: newEvents,
    session,
    serverTime: Date.now(),
  });
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

  const session = caregiverSessions.get(code);
  if (!session) {
    // Check if pairing session exists
    const pairing = pairingSessions.get(code);
    const fallback: CaregiverSessionData = {
      pairingCode: code,
      childName: pairing?.childName || 'Alex',
      lastActiveTime: new Date().toISOString(),
      currentActivity: 'Exploring BeeYou Home',
      currentMood: 'calm',
      habitsCompletedToday: 2,
      totalHabits: 4,
      routineProgress: null,
      stars: 15,
      isOffline: false,
      messages: [],
      caregiverPhone: pairing?.caregiverPhone,
      permissions: pairing?.permissions,
      unlinked: false,
    };
    return res.json({ session: fallback });
  }

  if (session.unlinked) {
    return res.status(403).json({ error: 'This device has been unlinked.', session: { ...session, unlinked: true } });
  }

  return res.json({ session });
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
  const { pairingCode, childName, emotion, alertId, label, emoji, location, note } = req.body;
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

  const alert = {
    id: 'alert-' + Date.now(),
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

  broadcastEvent(code, {
    eventId: `ev-alert-${Date.now()}`,
    type: 'CAREGIVER_ALERT',
    pairingCode: code,
    alert,
    sentAt: Date.now(),
  });

  return res.json({ success: true, alert });
});

// Caregiver acknowledges the alert and sends instant predefined reassurance response
app.post('/api/caregiver/alert/acknowledge', (req, res) => {
  const { pairingCode, acknowledgedBy, responseMessage, responseId } = req.body;
  const code = (pairingCode || '').trim().toUpperCase();
  const session = caregiverSessions.get(code);

  if (!session || !session.activeAlert) {
    return res.status(404).json({ error: 'No active alert found for this code' });
  }

  session.activeAlert.status = 'acknowledged';
  session.activeAlert.acknowledgedBy = acknowledgedBy || 'Caregiver';
  session.activeAlert.acknowledgedAt = new Date().toISOString();
  session.activeAlert.responseMessage = responseMessage;
  session.activeAlert.responseId = responseId;

  broadcastEvent(code, {
    eventId: `ev-ack-${Date.now()}`,
    type: 'CAREGIVER_ALERT_ACK',
    pairingCode: code,
    ack: { alertId: code, responseMessage, responseId, by: acknowledgedBy || 'Caregiver' },
    sentAt: Date.now(),
  });

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
    session.messages.push(newMessage);

    broadcastEvent(code, {
      eventId: `ev-msg-${Date.now()}`,
      type: 'CAREGIVER_MESSAGE',
      pairingCode: code,
      message: newMessage,
      sentAt: Date.now(),
    });
  }

  return res.json({ success: true, alert: session.activeAlert });
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

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

