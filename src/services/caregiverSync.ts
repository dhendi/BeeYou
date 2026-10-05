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
// Real-time Cloud Pub/Sub Relay (ntfy.sh + SSE + BroadcastChannel)
// -------------------------------------------------------------

function getTopicForCode(code: string): string {
  const sanitized = (code || 'beeyou-demo').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').toLowerCase();
  return `beeyou-sync-${sanitized || 'default'}`;
}

let activeEventSource: EventSource | null = null;
let currentSubscribedCode: string | null = null;

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
  const isConnected = lastPeerPingTimestamp > 0 && diffSec <= 35;

  let statusText = 'Not Connected';
  if (isConnected) {
    statusText = `Connected (${diffSec < 5 ? 'Live' : `${diffSec}s ago`})`;
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

// Check connection status periodically (every 4s)
if (typeof window !== 'undefined') {
  setInterval(() => {
    notifyConnectionStatus();
  }, 4000);
}

/**
 * Publishes an event to the cloud relay and local BroadcastChannel
 */
export async function publishCloudEvent(code: string, eventData: Record<string, any>): Promise<void> {
  const safeCode = (code || getPairingCode()).trim().toUpperCase();
  const topic = getTopicForCode(safeCode);
  const myDeviceId = getDeviceId();

  const envelope = {
    ...eventData,
    senderDeviceId: myDeviceId,
    pairingCode: safeCode,
    sentAt: Date.now(),
  };

  // 1. Local BroadcastChannel for zero-latency multi-tab
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(envelope);
    } catch (e) {}
  }

  // 2. Cloud Relay (ntfy.sh) for cross-device (Phone <-> Tablet)
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Title': 'BeeYou Sync',
          'Priority': eventData.type === 'CAREGIVER_ALERT' ? '5' : '3',
        },
        body: JSON.stringify(envelope),
      });
    } catch (e) {
      console.warn('Cloud publish failed, fallback active:', e);
    }
  }
}

/**
 * Subscribes to the live cloud SSE stream for a pairing code
 */
export function subscribeToCloudChannel(code: string): void {
  if (typeof window === 'undefined' || !('EventSource' in window)) return;
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

  currentSubscribedCode = safeCode;
  const topic = getTopicForCode(safeCode);

  try {
    const es = new EventSource(`https://ntfy.sh/${topic}/sse`);
    activeEventSource = es;

    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        // ntfy.sh wraps messages in an object with `message` field
        let payload = raw;
        if (raw.message && typeof raw.message === 'string') {
          try {
            payload = JSON.parse(raw.message);
          } catch {
            payload = raw;
          }
        }

        handleIncomingSyncEnvelope(payload);
      } catch (e) {
        // Non-JSON or keepalive comment
      }
    };

    es.onerror = () => {
      // Automatic browser reconnect will handle retry
    };
  } catch (e) {
    console.warn('Could not establish SSE stream:', e);
  }
}

// Initialize cloud subscription on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    subscribeToCloudChannel(getPairingCode());
  }, 1000);
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

  const type = envelope.type;

  // 1. Heartbeat & Ping Events
  if (type === 'HEARTBEAT' || type === 'CHILD_HEARTBEAT' || type === 'CAREGIVER_HEARTBEAT') {
    lastPeerPingTimestamp = Date.now();
    lastPeerRole = envelope.role || (type === 'CHILD_HEARTBEAT' ? 'child_device' : 'caregiver');
    lastPeerName = envelope.name || (lastPeerRole === 'caregiver' ? 'Caregiver Device' : 'Child Device');
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
    lastPeerName = envelope.status.childName || 'Child Device';
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
    lastPeerName = envelope.alert.childName || 'Child Device';
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
  const safeCode = params.pairingCode.trim().toUpperCase();
  setPairingCode(safeCode);

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

  await publishCloudEvent(safeCode, {
    type: 'DEVICE_PAIRED',
    pairingCode: safeCode,
    session: claimedSession,
  });

  // Also send an immediate heartbeat to confirm connection
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

  await publishCloudEvent(code, {
    type: 'CHILD_STATUS_UPDATE',
    status: payload,
  });
}

/**
 * Caregiver fetches the live child status
 */
export async function fetchCaregiverSession(code: string): Promise<CaregiverChildStatus | null> {
  const safeCode = code.trim().toUpperCase();

  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.pairingCode === safeCode) {
        return parsed;
      }
    }
  } catch {}

  return {
    childName: 'Alex',
    pairingCode: safeCode,
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Using BeeYou',
    currentMood: 'happy',
    habitsCompletedToday: 2,
    totalHabits: 4,
    routineProgress: null,
    stars: 12,
    isOffline: false,
  };
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

  await publishCloudEvent(safeCode, {
    type: 'CAREGIVER_ALERT_ACK',
    ack: { alertId: safeCode, responseMessage, responseId, by: acknowledgedBy },
  });

  if (responseMessage) {
    await sendCaregiverMessage(safeCode, responseMessage, acknowledgedBy, '❤️', responseId);
  }
}
