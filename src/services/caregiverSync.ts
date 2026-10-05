import { CaregiverChildStatus, CaregiverMessage, CaregiverAlert, EmotionType } from '../types';

const PAIRING_KEY = 'beeyou_caregiver_pairing_code';
const LOCAL_SESSION_KEY = 'beeyou_caregiver_local_session';
const ACTIVE_ALERT_KEY = 'beeyou_active_caregiver_alert';

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
 * Gets or initializes the child's unique pairing code (e.g., LUMI-782)
 */
export function getPairingCode(): string {
  if (typeof window === 'undefined') return 'LUMI-101';
  let code = localStorage.getItem(PAIRING_KEY);
  if (!code) {
    const randomDigits = Math.floor(100 + Math.random() * 900);
    code = `LUMI-${randomDigits}`;
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

export type AlertAckListener = (ack: { alertId: string; responseMessage?: string; by: string }) => void;
const alertAckListeners: Set<AlertAckListener> = new Set();

export function onCaregiverAlertAck(listener: AlertAckListener): () => void {
  alertAckListeners.add(listener);
  return () => alertAckListeners.delete(listener);
}

// Listen for broadcast messages from other tabs/windows
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data?.type === 'CAREGIVER_MESSAGE' && event.data.message) {
      messageListeners.forEach((fn) => fn(event.data.message));
    } else if (event.data?.type === 'CAREGIVER_ALERT' && event.data.alert) {
      alertListeners.forEach((fn) => fn(event.data.alert));
    } else if (event.data?.type === 'CAREGIVER_ALERT_ACK' && event.data.ack) {
      alertAckListeners.forEach((fn) => fn(event.data.ack));
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
 * Caregiver sends a message to the child
 */
export async function sendCaregiverMessage(
  code: string,
  text: string,
  senderName = 'Caregiver',
  emoji = '❤️'
): Promise<CaregiverMessage | null> {
  const safeCode = code.trim().toUpperCase();
  const newMsg: CaregiverMessage = {
    id: 'msg-' + Date.now(),
    senderName,
    text,
    emoji,
    timestamp: new Date().toISOString(),
    read: false,
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
 * Child sends an easy access emotion / distress alert to caregiver
 */
export async function sendCaregiverAlert(alertData: {
  childName: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload';
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
 * Caregiver acknowledges the alert and sends response back
 */
export async function acknowledgeCaregiverAlert(
  code: string,
  acknowledgedBy: string,
  responseMessage?: string
): Promise<void> {
  const safeCode = code.trim().toUpperCase();

  // 1. Broadcast locally
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'CAREGIVER_ALERT_ACK',
        ack: { alertId: safeCode, responseMessage, by: acknowledgedBy },
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
      }),
    });
  } catch (e) {
    console.warn('Network alert acknowledge failed:', e);
  }
}

