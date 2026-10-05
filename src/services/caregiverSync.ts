import { 
  CaregiverChildStatus, 
  CaregiverMessage, 
  CaregiverAlert, 
  EmotionType,
  TemporaryPairingSession,
  CaregiverPermissions,
  EmergencySupportContact,
  PredefinedAlertId,
  PredefinedCaregiverResponseId,
  UserAgeGroup
} from '../types';

const PAIRING_KEY = 'beeyou_caregiver_pairing_code';
const LOCAL_SESSION_KEY = 'beeyou_caregiver_local_session';
const ACTIVE_ALERT_KEY = 'beeyou_active_caregiver_alert';
const EMERGENCY_CONTACT_KEY = 'beeyou_emergency_support_contact';
const CAREGIVER_ACCOUNT_KEY = 'beeyou_caregiver_account_data';
const DEVICE_ID_KEY = 'beeyou_device_id';

// Generate or retrieve unique Device ID for echo suppression
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'dev-server';
  let devId = localStorage.getItem(DEVICE_ID_KEY);
  if (!devId) {
    devId = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    try {
      localStorage.setItem(DEVICE_ID_KEY, devId);
    } catch {}
  }
  return devId;
}

// Setup local broadcast channel for same-device instant multi-tab communication
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('beeyou_caregiver_channel');
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

/**
 * Trigger a browser Web Push Notification if permission is granted
 */
export function triggerWebNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        try {
          new Notification(title, {
            icon: '/icon.svg',
            ...options,
          });
        } catch {}
      }
    });
  }
}

/**
 * Launches device's native phone dialer for saved contact
 */
export function launchNativePhoneCall(phoneNumber: string): void {
  if (!phoneNumber) return;
  const clean = phoneNumber.replace(/[^0-9+]/g, '');
  if (clean) {
    window.location.href = `tel:${clean}`;
  }
}

/**
 * Launches device's native SMS messaging app for saved contact
 */
export function launchNativeSms(phoneNumber: string, prefillMessage?: string): void {
  if (!phoneNumber) return;
  const clean = phoneNumber.replace(/[^0-9+]/g, '');
  if (clean) {
    const bodyParam = prefillMessage ? `?body=${encodeURIComponent(prefillMessage)}` : '';
    window.location.href = `sms:${clean}${bodyParam}`;
  }
}

/**
 * Gets the current active pairing code (e.g., K7P4-92 or LUMI-101)
 */
export function getPairingCode(): string {
  if (typeof window === 'undefined') return 'BEE-101';
  let code = localStorage.getItem(PAIRING_KEY);
  if (!code) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let p1 = '';
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    let p2 = '';
    for (let i = 0; i < 2; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    code = `${p1}-${p2}`;
    localStorage.setItem(PAIRING_KEY, code);
  }
  return code;
}

/**
 * Sets a custom pairing code if preferred
 */
export function setPairingCode(newCode: string): void {
  if (typeof window !== 'undefined' && newCode) {
    const safe = newCode.trim().toUpperCase();
    localStorage.setItem(PAIRING_KEY, safe);
    subscribeToCloudChannel(safe);
  }
}

// -------------------------------------------------------------
// Real-time Cloud Pub/Sub Relay (ntfy.sh + SSE + Short Polling Backup)
// -------------------------------------------------------------

function getTopicForCode(code: string): string {
  const sanitized = (code || 'beeyou-demo').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').toLowerCase();
  return `beeyou-sync-${sanitized || 'default'}`;
}

let activeEventSource: EventSource | null = null;
let activePollingInterval: any = null;
let currentSubscribedCode: string | null = null;

// Track processed events to prevent duplicate callbacks between SSE and polling
const seenEventIds = new Set<string>();

function isEventAlreadyProcessed(envelope: any): boolean {
  if (!envelope) return true;
  const id = envelope.eventId || `${envelope.type}-${envelope.sentAt}-${envelope.senderDeviceId}`;
  if (seenEventIds.has(id)) return true;
  seenEventIds.add(id);
  if (seenEventIds.size > 300) {
    const first = seenEventIds.values().next().value;
    if (first) seenEventIds.delete(first);
  }
  return false;
}

// Track last known pings
let lastPeerPingTimestamp = 0;
let lastPeerRole: 'child_device' | 'caregiver' | null = null;
let lastPeerName: string = '';

export interface ConnectionStatusInfo {
  isConnected: boolean;
  peerRole: 'child_device' | 'caregiver' | null;
  peerName: string;
  lastPingAgoSeconds: number;
  statusText: string;
  pairingCode: string;
}

export type ConnectionStatusListener = (status: ConnectionStatusInfo) => void;
const connectionStatusListeners: Set<ConnectionStatusListener> = new Set();

export function onConnectionStatusChange(listener: ConnectionStatusListener): () => void {
  connectionStatusListeners.add(listener);
  // Immediate trigger with current status
  listener(getLiveConnectionStatus());
  return () => connectionStatusListeners.delete(listener);
}

export function getLiveConnectionStatus(): ConnectionStatusInfo {
  const code = getPairingCode();
  const now = Date.now();
  const diffSec = lastPeerPingTimestamp > 0 ? Math.floor((now - lastPeerPingTimestamp) / 1000) : 9999;
  const isConnected = lastPeerPingTimestamp > 0 && diffSec <= 25;

  let statusText = 'Not Connected';
  if (isConnected) {
    statusText = `Connected (${diffSec < 4 ? 'Live' : `${diffSec}s ago`})`;
  } else if (lastPeerPingTimestamp > 0) {
    statusText = `Last seen ${diffSec > 60 ? `${Math.floor(diffSec / 60)}m ago` : `${diffSec}s ago`}`;
  }

  return {
    isConnected,
    peerRole: lastPeerRole,
    peerName: lastPeerName || (lastPeerRole === 'caregiver' ? 'Caregiver Device' : 'Child Tablet'),
    lastPingAgoSeconds: diffSec,
    statusText,
    pairingCode: code,
  };
}

function notifyConnectionStatus(): void {
  const status = getLiveConnectionStatus();
  connectionStatusListeners.forEach((fn) => fn(status));
}

// Check connection status periodically (every 3s)
if (typeof window !== 'undefined') {
  setInterval(() => {
    notifyConnectionStatus();
  }, 3000);
}

/**
 * Publishes an event to the server relay and local BroadcastChannel
 */
export async function publishCloudEvent(code: string, eventData: Record<string, any>): Promise<void> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();
  const myDeviceId = getDeviceId();
  const eventId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const envelope = {
    ...eventData,
    eventId,
    senderDeviceId: myDeviceId,
    pairingCode: safeCode,
    sentAt: Date.now(),
  };

  // Mark as seen locally to prevent self-processing
  seenEventIds.add(eventId);

  // 1. Local BroadcastChannel for zero-latency multi-tab on same machine
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(envelope);
    } catch (e) {}
  }

  // 2. Direct Server Event Relay (/api/caregiver/event)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    await fetch('/api/caregiver/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn('Direct server event publish error:', e);
  }
}

let lastPollTimestamp = 0;

/**
 * Subscribes to the live cloud channel (Server SSE stream + active short-polling fallback)
 */
export function subscribeToCloudChannel(code: string): void {
  if (typeof window === 'undefined') return;
  const safeCode = (code || getPairingCode()).trim().toUpperCase();
  if (currentSubscribedCode === safeCode && activeEventSource && activeEventSource.readyState !== EventSource.CLOSED) {
    return;
  }

  if (activeEventSource) {
    try {
      activeEventSource.close();
    } catch {}
    activeEventSource = null;
  }

  if (activePollingInterval) {
    clearInterval(activePollingInterval);
    activePollingInterval = null;
  }

  currentSubscribedCode = safeCode;
  lastPollTimestamp = Date.now() - 45000;

  // 1. Live SSE Stream from App Server (/api/caregiver/events/:code)
  if ('EventSource' in window) {
    try {
      const sseUrl = `/api/caregiver/events/${encodeURIComponent(safeCode)}`;
      const es = new EventSource(sseUrl);
      activeEventSource = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleIncomingSyncEnvelope(payload);
        } catch (e) {}
      };

      es.onerror = () => {
        // SSE auto-reconnects; short polling guarantees continuous delivery
      };
    } catch (e) {
      console.warn('Could not establish SSE stream with server:', e);
    }
  }

  // 2. Short-Polling Backup (every 1.5s - guarantees delivery on iOS Safari / backgrounded mobile apps)
  const pollServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`/api/caregiver/poll/${encodeURIComponent(safeCode)}?since=${lastPollTimestamp}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.serverTime) {
          lastPollTimestamp = data.serverTime;
        } else {
          lastPollTimestamp = Date.now();
        }

        if (Array.isArray(data.events)) {
          for (const ev of data.events) {
            handleIncomingSyncEnvelope(ev);
          }
        }

        // If session returned from poll has active alert, ensure alert delivery
        if (data.session) {
          if (data.session.activeAlert && data.session.activeAlert.status === 'active') {
            handleIncomingSyncEnvelope({
              type: 'CAREGIVER_ALERT',
              alert: data.session.activeAlert,
              pairingCode: safeCode,
            });
          }
        }
      }
    } catch (e) {}
  };

  pollServer();
  activePollingInterval = setInterval(pollServer, 1500);
}

// Initialize cloud subscription on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    subscribeToCloudChannel(getPairingCode());
  }, 300);
}

// -------------------------------------------------------------
// Live Messaging & Broadcast Event Handlers
// -------------------------------------------------------------

export type MessageListener = (message: CaregiverMessage) => void;
const messageListeners: Set<MessageListener> = new Set();

export function onCaregiverMessage(listener: MessageListener): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export type AlertListener = (alert: CaregiverAlert) => void;
const alertListeners: Set<AlertListener> = new Set();

export function onCaregiverAlert(listener: AlertListener): () => void {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
}

export type AlertAckListener = (ack: { alertId: string; responseMessage?: string; responseId?: PredefinedCaregiverResponseId; by: string }) => void;
const alertAckListeners: Set<AlertAckListener> = new Set();

export function onCaregiverAlertAck(listener: AlertAckListener): () => void {
  alertAckListeners.add(listener);
  return () => alertAckListeners.delete(listener);
}

export type PairingListener = (event: { type: 'DEVICE_PAIRED' | 'DEVICE_UNLINKED'; pairingCode: string; session?: any }) => void;
const pairingListeners: Set<PairingListener> = new Set();

export function onDevicePairingEvent(listener: PairingListener): () => void {
  pairingListeners.add(listener);
  return () => pairingListeners.delete(listener);
}

export type ChildStatusListener = (status: CaregiverChildStatus) => void;
const statusListeners: Set<ChildStatusListener> = new Set();

export function onChildStatusUpdate(listener: ChildStatusListener): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

/**
 * Dispatches incoming envelope from SSE or BroadcastChannel
 */
function handleIncomingSyncEnvelope(envelope: any): void {
  if (!envelope || typeof envelope !== 'object') return;
  
  const myDevId = getDeviceId();
  // Echo suppression: Ignore if sent by this exact same browser tab/device
  if (envelope.senderDeviceId && envelope.senderDeviceId === myDevId) {
    return;
  }

  // Deduplication check
  if (isEventAlreadyProcessed(envelope)) {
    return;
  }

  const type = envelope.type;

  // 1. Heartbeat & Ping Events
  if (type === 'HEARTBEAT' || type === 'CHILD_HEARTBEAT' || type === 'CAREGIVER_HEARTBEAT') {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = envelope.role || (type === 'CHILD_HEARTBEAT' ? 'child_device' : 'caregiver');
    lastPeerName = envelope.name || (lastPeerRole === 'caregiver' ? 'Caregiver Device' : 'Child Tablet');
    notifyConnectionStatus();

    if (envelope.childStatus) {
      statusListeners.forEach((fn) => fn(envelope.childStatus));
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(envelope.childStatus));
      } catch {}
    }
    return;
  }

  // 2. Child Status Update
  if (type === 'CHILD_STATUS_UPDATE' && envelope.status) {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = 'child_device';
    lastPeerName = envelope.status.childName || 'Child Tablet';
    notifyConnectionStatus();

    statusListeners.forEach((fn) => fn(envelope.status));
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(envelope.status));
    } catch {}
    return;
  }

  // 3. Caregiver Message (Caregiver -> Child)
  if (type === 'CAREGIVER_MESSAGE' && envelope.message) {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = 'caregiver';
    notifyConnectionStatus();

    messageListeners.forEach((fn) => fn(envelope.message));
    triggerWebNotification(`Message from ${envelope.message.senderName || 'Caregiver'}`, {
      body: envelope.message.text,
    });
    return;
  }

  // 4. Caregiver Alert (Child -> Caregiver)
  if (type === 'CAREGIVER_ALERT' && envelope.alert) {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = 'child_device';
    lastPeerName = envelope.alert.childName || 'Child Tablet';
    notifyConnectionStatus();

    alertListeners.forEach((fn) => fn(envelope.alert));
    try {
      localStorage.setItem(ACTIVE_ALERT_KEY, JSON.stringify(envelope.alert));
    } catch {}
    triggerWebNotification(`BeeYou Alert: ${envelope.alert.childName}`, {
      body: `${envelope.alert.emoji || '🚨'} ${envelope.alert.label}: ${envelope.alert.note || 'Help requested'}`,
      requireInteraction: true,
    });
    return;
  }

  // 5. Caregiver Alert ACK (Caregiver -> Child)
  if (type === 'CAREGIVER_ALERT_ACK' && envelope.ack) {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = 'caregiver';
    notifyConnectionStatus();

    alertAckListeners.forEach((fn) => fn(envelope.ack));
    triggerWebNotification(`Caregiver Response: ${envelope.ack.by || 'Caregiver'}`, {
      body: envelope.ack.responseMessage || "I'm here for you ❤️",
    });
    return;
  }

  // 6. Pairing & Unlink Events
  if (type === 'DEVICE_PAIRED' || type === 'DEVICE_UNLINKED') {
    if (type === 'DEVICE_PAIRED') {
      lastPeerPingTimestamp = Date.now();
      const session = envelope.session;
      if (session) {
        if (session.caregiverName) {
          lastPeerRole = 'caregiver';
          lastPeerName = session.caregiverName;
        } else if (session.childName) {
          lastPeerRole = 'child_device';
          lastPeerName = session.childName;
        }
      }
      notifyConnectionStatus();
    } else if (type === 'DEVICE_UNLINKED') {
      lastPeerPingTimestamp = 0;
      lastPeerRole = null;
      lastPeerName = '';
      notifyConnectionStatus();
    }
    pairingListeners.forEach((fn) => fn(envelope));
    return;
  }
}

// Local BroadcastChannel Listener
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    handleIncomingSyncEnvelope(event.data);
  };
}

// -------------------------------------------------------------
// Two-Way Temporary Pairing API
// -------------------------------------------------------------

/**
 * Creates a single-use expirable pairing session (10 min expiry)
 */
export async function createTemporaryPairingSession(params: {
  initiatedBy: 'child_device' | 'caregiver';
  childName?: string;
  childAge?: number;
  ageGroup?: UserAgeGroup;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  permissions?: CaregiverPermissions;
}): Promise<TemporaryPairingSession> {
  const now = Date.now();
  const fallbackCode = getPairingCode();

  const session: TemporaryPairingSession = {
    pairingCode: fallbackCode,
    token: 'tok-local-' + now,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
    status: 'pending',
    initiatedBy: params.initiatedBy,
    childName: params.childName,
    childAge: params.childAge,
    ageGroup: params.ageGroup || 'kid',
    caregiverName: params.caregiverName,
    caregiverPhone: params.caregiverPhone,
    caregiverEmail: params.caregiverEmail,
    permissions: params.permissions || {
      receiveAlerts: true,
      receiveMood: true,
      receiveRoutines: true,
      canEditRoutines: true,
      canEditAac: true,
      allowLocationTag: true,
    },
  };

  try {
    localStorage.setItem('beeyou_temporary_pairing_session', JSON.stringify(session));
  } catch {}

  // Publish pairing session creation event
  await publishCloudEvent(fallbackCode, {
    type: 'PAIRING_SESSION_CREATED',
    session,
  });

  return session;
}

/**
 * Checks the status of a temporary pairing session
 */
export async function pollPairingSessionStatus(code: string): Promise<TemporaryPairingSession | null> {
  const safeCode = code.trim().toUpperCase();

  try {
    const raw = localStorage.getItem('beeyou_temporary_pairing_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.pairingCode === safeCode) {
        if (Date.now() > parsed.expiresAt && parsed.status === 'pending') {
          parsed.status = 'expired';
        }
        return parsed;
      }
    }
  } catch {}

  return null;
}

/**
 * Extracts and sanitizes pairing code from scanned QR string or URL
 */
export function extractPairingCodeFromScan(rawScan: string): string {
  if (!rawScan) return '';
  const trimmed = rawScan.trim();
  try {
    if (trimmed.includes('code=')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://beeyou.app/${trimmed.startsWith('?') ? '' : '?'}${trimmed}`);
      const code = url.searchParams.get('code');
      if (code) return code.trim().toUpperCase();
    }
  } catch {}
  return trimmed.toUpperCase();
}

/**
 * Claims and connects a temporary pairing code
 */
export async function claimPairingSession(params: {
  pairingCode: string;
  claimerRole: 'caregiver' | 'child_device';
  childName?: string;
  childAge?: number;
  ageGroup?: UserAgeGroup;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  permissions?: CaregiverPermissions;
}): Promise<{ success: boolean; message: string; session?: TemporaryPairingSession }> {
  if (!params.pairingCode || !params.pairingCode.trim()) {
    return { 
      success: false, 
      message: 'Pairing code cannot be empty. Please enter or scan a valid code.' 
    };
  }

  const cleanCode = extractPairingCodeFromScan(params.pairingCode);
  const alphanumericOnly = cleanCode.replace(/[^A-Z0-9]/g, '');

  if (alphanumericOnly.length < 3) {
    return { 
      success: false, 
      message: `Invalid pairing code format ("${cleanCode}"). BeeYou pairing codes have 6 characters (e.g. K7P4-92).` 
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      message: 'Your device is currently offline. Please connect to Wi-Fi or cellular data and try again.'
    };
  }

  const safeCode = cleanCode;
  setPairingCode(safeCode);
  subscribeToCloudChannel(safeCode);

  lastPeerPingTimestamp = Date.now();
  lastPeerRole = params.claimerRole === 'caregiver' ? 'child_device' : 'caregiver';
  lastPeerName = params.claimerRole === 'caregiver' ? (params.childName || 'Child') : (params.caregiverName || 'Caregiver');

  const claimedSession: TemporaryPairingSession = {
    pairingCode: safeCode,
    token: 'tok-claimed-' + Date.now(),
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: 'paired',
    initiatedBy: params.claimerRole === 'caregiver' ? 'child_device' : 'caregiver',
    childName: params.childName || 'Leo',
    childAge: params.childAge || 10,
    ageGroup: params.ageGroup || 'kid',
    caregiverName: params.caregiverName || 'Caregiver',
    caregiverPhone: params.caregiverPhone,
    permissions: params.permissions,
  };

  try {
    localStorage.setItem('beeyou_temporary_pairing_session', JSON.stringify(claimedSession));
  } catch {}

  notifyConnectionStatus();

  await publishCloudEvent(safeCode, {
    type: 'DEVICE_PAIRED',
    pairingCode: safeCode,
    session: claimedSession,
  });

  // Send an immediate heartbeat to confirm connection
  await sendHeartbeat({
    role: params.claimerRole,
    name: params.claimerRole === 'caregiver' ? params.caregiverName || 'Caregiver' : params.childName || 'Child',
    pairingCode: safeCode,
  });

  return { success: true, message: 'Device connected successfully!', session: claimedSession };
}

/**
 * Unlinks a paired device
 */
export async function unlinkDeviceSession(code: string): Promise<boolean> {
  const safeCode = code.trim().toUpperCase();

  await publishCloudEvent(safeCode, {
    type: 'DEVICE_UNLINKED',
    pairingCode: safeCode,
  });

  try {
    localStorage.removeItem('beeyou_temporary_pairing_session');
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(ACTIVE_ALERT_KEY);
  } catch {}

  lastPeerPingTimestamp = 0;
  notifyConnectionStatus();

  return true;
}

// -------------------------------------------------------------
// Emergency / Support Contact Storage for Independent Adults
// -------------------------------------------------------------

export function getStoredEmergencyContact(): EmergencySupportContact | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EMERGENCY_CONTACT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveStoredEmergencyContact(contact: EmergencySupportContact | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (contact) {
      localStorage.setItem(EMERGENCY_CONTACT_KEY, JSON.stringify(contact));
    } else {
      localStorage.removeItem(EMERGENCY_CONTACT_KEY);
    }
  } catch {}
}

// -------------------------------------------------------------
// Core Real-Time Methods
// -------------------------------------------------------------

/**
 * Sends a periodic heartbeat ping to the other device
 */
export async function sendHeartbeat(params: {
  role: 'child_device' | 'caregiver';
  name?: string;
  pairingCode?: string;
  childStatus?: Partial<CaregiverChildStatus>;
}): Promise<void> {
  const code = params.pairingCode || getPairingCode();
  await publishCloudEvent(code, {
    type: params.role === 'child_device' ? 'CHILD_HEARTBEAT' : 'CAREGIVER_HEARTBEAT',
    role: params.role,
    name: params.name,
    childStatus: params.childStatus,
  });
}

/**
 * Sends child status update to caregiver in real-time
 */
export async function syncChildStatusToCaregiver(status: Partial<CaregiverChildStatus>): Promise<void> {
  const code = getPairingCode();
  const payload: CaregiverChildStatus = {
    childName: status.childName || 'Child',
    pairingCode: code,
    lastActiveTime: new Date().toISOString(),
    currentActivity: status.currentActivity || 'Using BeeYou',
    currentMood: status.currentMood || 'happy',
    habitsCompletedToday: status.habitsCompletedToday ?? 0,
    totalHabits: status.totalHabits ?? 0,
    routineProgress: status.routineProgress || null,
    stars: status.stars ?? 0,
    isOffline: status.isOffline ?? false,
    lastAacSentence: status.lastAacSentence,
    caregiverPhone: status.caregiverPhone,
  };

  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(payload));
  } catch {}

  // 1. Send to server sync endpoint
  try {
    fetch('/api/caregiver/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}

  // 2. Publish to live event stream
  await publishCloudEvent(code, {
    type: 'CHILD_STATUS_UPDATE',
    status: payload,
  });
}

/**
 * Caregiver fetches the live child status
 */
export async function fetchCaregiverSession(code: string): Promise<CaregiverChildStatus | null> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();

  // 1. Fetch live from server
  try {
    const res = await fetch(`/api/caregiver/session/${encodeURIComponent(safeCode)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.session) {
        try {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.session));
        } catch {}
        return data.session;
      }
    }
  } catch (err) {
    // Network or server error, fallback below
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.pairingCode === safeCode) {
        return parsed;
      }
    }
  } catch {}

  return null;
}

/**
 * Caregiver sends a message or remote alert to the child device
 */
export async function sendCaregiverMessage(
  code: string,
  text: string,
  senderName = 'Caregiver',
  emoji = '❤️',
  responseId?: PredefinedCaregiverResponseId
): Promise<CaregiverMessage> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();
  const newMsg: CaregiverMessage = {
    id: 'msg-' + Date.now(),
    senderName,
    text,
    emoji,
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
  };

  // 1. Send to server message endpoint
  try {
    fetch('/api/caregiver/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: safeCode,
        senderName,
        text,
        emoji,
        responseId,
      }),
    }).catch(() => {});
  } catch {}

  // 2. Publish to live event stream
  await publishCloudEvent(safeCode, {
    type: 'CAREGIVER_MESSAGE',
    message: newMsg,
  });

  return newMsg;
}

/**
 * Child fetches new messages from caregiver
 */
export async function pollCaregiverMessages(code: string): Promise<CaregiverMessage[]> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();
  try {
    const res = await fetch(`/api/caregiver/messages/${encodeURIComponent(safeCode)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.messages)) {
        return data.messages;
      }
    }
  } catch {}
  return [];
}

/**
 * Child sends an alert to caregiver or support contact
 */
export async function sendCaregiverAlert(alertData: {
  childName: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload' | 'want_to_talk' | 'im_okay';
  alertId?: PredefinedAlertId;
  label: string;
  emoji: string;
  location?: 'school' | 'therapy' | 'bus' | 'home' | 'other';
  note?: string;
}): Promise<CaregiverAlert> {
  const code = getPairingCode();
  const alert: CaregiverAlert = {
    id: 'alert-' + Date.now(),
    pairingCode: code,
    timestamp: new Date().toISOString(),
    status: 'active',
    ...alertData,
  };

  try {
    localStorage.setItem(ACTIVE_ALERT_KEY, JSON.stringify(alert));
  } catch {}

  // 1. Send to server alert endpoint
  try {
    fetch('/api/caregiver/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: code,
        ...alertData,
      }),
    }).catch(() => {});
  } catch {}

  // 2. Publish to live event stream
  await publishCloudEvent(code, {
    type: 'CAREGIVER_ALERT',
    alert,
  });

  return alert;
}

/**
 * Caregiver acknowledges the alert and sends predefined response back
 */
export async function acknowledgeCaregiverAlert(
  code: string,
  acknowledgedBy: string,
  responseMessage?: string,
  responseId?: PredefinedCaregiverResponseId
): Promise<void> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();

  // 1. Send to server acknowledge endpoint
  try {
    fetch('/api/caregiver/alert/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: safeCode,
        acknowledgedBy,
        responseMessage,
        responseId,
      }),
    }).catch(() => {});
  } catch {}

  // 2. Publish to live event stream
  await publishCloudEvent(safeCode, {
    type: 'CAREGIVER_ALERT_ACK',
    ack: { alertId: safeCode, responseMessage, responseId, by: acknowledgedBy },
  });

  if (responseMessage) {
    await sendCaregiverMessage(safeCode, responseMessage, acknowledgedBy, '❤️', responseId);
  }
}
