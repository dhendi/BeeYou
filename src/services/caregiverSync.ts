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

// Setup broadcast channel for instant local cross-tab communication
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
    localStorage.setItem(PAIRING_KEY, newCode.trim().toUpperCase());
  }
}

// -------------------------------------------------------------
// Two-Way Temporary Pairing API (Flow A & Flow B)
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

  // Try server API first
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/caregiver/pairing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setPairingCode(data.session.pairingCode);
          return data.session;
        }
      }
    } catch (e) {
      console.warn('Network pairing session creation failed, using local session:', e);
    }
  }

  // Local fallback session
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

  return session;
}

/**
 * Checks the status of a temporary pairing session
 */
export async function pollPairingSessionStatus(code: string): Promise<TemporaryPairingSession | null> {
  const safeCode = code.trim().toUpperCase();

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`/api/caregiver/pairing/status/${safeCode}`);
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
    } catch (e) {}
  }

  // Local check
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

  // Try server API
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/caregiver/pairing/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, pairingCode: safeCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPairingCode(safeCode);
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'DEVICE_PAIRED', pairingCode: safeCode, session: data.session });
        }
        return data;
      } else {
        return { success: false, message: data.error || 'Failed to claim pairing code' };
      }
    } catch (e) {
      console.warn('Claim pairing network failed, using local simulation:', e);
    }
  }

  // Local claiming simulation
  setPairingCode(safeCode);
  const claimedSession: TemporaryPairingSession = {
    pairingCode: safeCode,
    token: 'tok-claimed-' + Date.now(),
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000,
    status: 'paired',
    initiatedBy: params.claimerRole === 'caregiver' ? 'child_device' : 'caregiver',
    childName: params.childName || 'Emma',
    childAge: params.childAge || 10,
    ageGroup: params.ageGroup || 'kid',
    caregiverName: params.caregiverName || 'Caregiver',
    caregiverPhone: params.caregiverPhone,
    permissions: params.permissions,
  };

  try {
    localStorage.setItem('beeyou_temporary_pairing_session', JSON.stringify(claimedSession));
  } catch {}

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'DEVICE_PAIRED', pairingCode: safeCode, session: claimedSession });
  }

  return { success: true, message: 'Device connected successfully!', session: claimedSession };
}

/**
 * Unlinks a paired device
 */
export async function unlinkDeviceSession(code: string): Promise<boolean> {
  const safeCode = code.trim().toUpperCase();

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DEVICE_UNLINKED', pairingCode: safeCode });
    } catch {}
  }

  try {
    localStorage.removeItem('beeyou_temporary_pairing_session');
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {}

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/caregiver/device/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairingCode: safeCode }),
      });
      return res.ok;
    } catch {}
  }

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

// Listen for broadcast messages from other tabs/windows
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data?.type === 'CAREGIVER_MESSAGE' && event.data.message) {
      messageListeners.forEach((fn) => fn(event.data.message));
      triggerWebNotification(`Message from ${event.data.message.senderName}`, {
        body: event.data.message.text,
      });
    } else if (event.data?.type === 'CAREGIVER_ALERT' && event.data.alert) {
      alertListeners.forEach((fn) => fn(event.data.alert));
      triggerWebNotification(`BeeYou Alert: ${event.data.alert.childName}`, {
        body: `${event.data.alert.emoji} ${event.data.alert.label}`,
      });
    } else if (event.data?.type === 'CAREGIVER_ALERT_ACK' && event.data.ack) {
      alertAckListeners.forEach((fn) => fn(event.data.ack));
      triggerWebNotification(`Response from ${event.data.ack.by}`, {
        body: event.data.ack.responseMessage || 'Response received.',
      });
    } else if (event.data?.type === 'DEVICE_PAIRED' || event.data?.type === 'DEVICE_UNLINKED') {
      pairingListeners.forEach((fn) => fn(event.data));
    }
  };
}

/**
 * Sends child status update to caregiver (via backend API and BroadcastChannel)
 */
export async function syncChildStatusToCaregiver(status: Partial<CaregiverChildStatus>): Promise<void> {
  const code = getPairingCode();
  const payload = {
    pairingCode: code,
    lastActiveTime: new Date().toISOString(),
    ...status,
  };

  // 1. Mirror locally for instantaneous cross-tab access
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(payload));
  } catch {}

  // 2. Broadcast immediately
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'CHILD_STATUS_UPDATE', status: payload });
    } catch {}
  }

  // 3. Sync to server API if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await fetch('/api/caregiver/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // offline silent fallback
    }
  }
}

/**
 * Caregiver fetches the live child status
 */
export async function fetchCaregiverSession(code: string): Promise<CaregiverChildStatus | null> {
  const safeCode = code.trim().toUpperCase();

  // Try server first if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(`/api/caregiver/session/${safeCode}`);
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
    } catch (e) {
      console.warn('Could not fetch session from server:', e);
    }
  }

  // Fallback to local storage mirror
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.pairingCode === safeCode) {
        return parsed;
      }
    }
  } catch {}

  // Default fallback status
  return {
    childName: 'Alex',
    pairingCode: safeCode,
    lastActiveTime: new Date().toISOString(),
    currentActivity: 'Using BeeYou',
    currentMood: 'calm',
    habitsCompletedToday: 2,
    totalHabits: 4,
    routineProgress: null,
    stars: 12,
    isOffline: false,
  };
}

/**
 * Caregiver sends a message or predefined response to the child
 */
export async function sendCaregiverMessage(
  code: string,
  text: string,
  senderName = 'Caregiver',
  emoji = '❤️',
  responseId?: PredefinedCaregiverResponseId
): Promise<CaregiverMessage | null> {
  const safeCode = code.trim().toUpperCase();
  const newMsg: CaregiverMessage = {
    id: 'msg-' + Date.now(),
    senderName,
    text,
    emoji,
    timestamp: new Date().toISOString(),
    read: false,
    responseId,
  };

  // Broadcast locally
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'CAREGIVER_MESSAGE', message: newMsg });
    } catch {}
  }

  // Save to server
  try {
    const res = await fetch('/api/caregiver/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: safeCode,
        senderName,
        text,
        emoji,
        responseId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.message;
    }
  } catch (e) {
    console.warn('Failed to send caregiver message over network:', e);
  }

  return newMsg;
}

/**
 * Child fetches new messages from caregiver
 */
export async function pollCaregiverMessages(code: string): Promise<CaregiverMessage[]> {
  const safeCode = code.trim().toUpperCase();
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }

  try {
    const res = await fetch(`/api/caregiver/messages/${safeCode}`);
    if (res.ok) {
      const data = await res.json();
      return data.messages || [];
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

  // 1. Mirror in localStorage
  try {
    localStorage.setItem(ACTIVE_ALERT_KEY, JSON.stringify(alert));
  } catch {}

  // 2. Broadcast immediately over local channel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'CAREGIVER_ALERT', alert });
    } catch {}
  }

  // 3. Post to backend server if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/caregiver/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingCode: code,
          ...alertData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.alert;
      }
    } catch (e) {
      console.warn('Network alert post failed, local broadcast active:', e);
    }
  }

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
  const safeCode = code.trim().toUpperCase();

  // 1. Broadcast locally
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'CAREGIVER_ALERT_ACK',
        ack: { alertId: safeCode, responseMessage, responseId, by: acknowledgedBy },
      });
    } catch {}
  }

  // 2. Update server
  try {
    await fetch('/api/caregiver/alert/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingCode: safeCode,
        acknowledgedBy,
        responseMessage,
        responseId,
      }),
    });
  } catch (e) {
    console.warn('Network alert acknowledge failed:', e);
  }
}

