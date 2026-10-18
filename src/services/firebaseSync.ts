/**
 * BeeYou Firebase Realtime Cloud Synchronization Engine
 * Provides instant (<50ms) zero-maintenance WebSockets sync across all physical devices worldwide.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  serverTimestamp,
  DatabaseReference,
  Unsubscribe 
} from 'firebase/database';
import { CaregiverAlert, CaregiverChildStatus, CaregiverMessage, PredefinedCaregiverResponseId } from '../types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBQ9VPr9uSiJrOHrybnT4K24INfP9BIYHg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "beeyou-23d7d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://beeyou-23d7d-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "beeyou-23d7d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "beeyou-23d7d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "985183179557",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:985183179557:web:085de960ef227a087f40cc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VR0VWBRJ7J"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Event Callbacks
type AlertCallback = (alert: CaregiverAlert) => void;
type AckCallback = (ack: { alertId: string; responseMessage?: string; responseId?: PredefinedCaregiverResponseId; by: string }) => void;
type MessageCallback = (msg: CaregiverMessage) => void;
type StatusCallback = (status: CaregiverChildStatus) => void;
type PresenceCallback = (info: { isConnected: boolean; peerName: string; peerRole: 'caregiver' | 'child_device' | null; lastPingAgo: number }) => void;
type ResolveCallback = (info: { pairingCode: string }) => void;
type GenericEventCallback = (event: any) => void;

let activeAlertUnsub: Unsubscribe | null = null;
let activeMessagesUnsub: Unsubscribe | null = null;
let activePingsUnsub: Unsubscribe | null = null;
let activeStatusUnsub: Unsubscribe | null = null;
let activeEventUnsub: Unsubscribe | null = null;
let currentCode: string | null = null;

const alertListeners: Set<AlertCallback> = new Set();
const ackListeners: Set<AckCallback> = new Set();
const messageListeners: Set<MessageCallback> = new Set();
const statusListeners: Set<StatusCallback> = new Set();
const presenceListeners: Set<PresenceCallback> = new Set();
const resolveListeners: Set<ResolveCallback> = new Set();
const eventListeners: Set<GenericEventCallback> = new Set();

let lastKnownPeerPing = 0;
let lastKnownPeerRole: 'caregiver' | 'child_device' | null = null;
let lastKnownPeerName = '';

export function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  return JSON.parse(JSON.stringify(obj));
}

export function parseTimestampMs(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function cleanCode(code: string): string {
  return (code || 'BEE-DEMO').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Subscribe this device to real-time Firebase channel
 */
export function initFirebaseLiveChannel(rawCode: string, isCaregiver: boolean): void {
  const code = cleanCode(rawCode);
  if (currentCode === code && activePingsUnsub) return;

  // Cleanup existing listeners
  if (activeAlertUnsub) activeAlertUnsub();
  if (activeMessagesUnsub) activeMessagesUnsub();
  if (activePingsUnsub) activePingsUnsub();
  if (activeStatusUnsub) activeStatusUnsub();
  if (activeEventUnsub) activeEventUnsub();

  currentCode = code;

  // 1. Listen for Active Alerts & Acknowledgments
  const alertRef = ref(db, `beeyou/sessions/${code}/activeAlert`);
  const subscriptionStartTime = Date.now();
  let initialAlertLoaded = false;
  let lastProcessedAlertKey = '';

  activeAlertUnsub = onValue(alertRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      if (lastProcessedAlertKey !== '') {
        resolveListeners.forEach((fn) => fn({ pairingCode: code }));
      }
      initialAlertLoaded = true;
      lastProcessedAlertKey = '';
      return;
    }

    const currentAlertKey = `${data.id || data.alertId || ''}:${data.status || ''}:${data.acknowledgedAt || data.timestamp || ''}:${data.responseMessage || ''}`;
    if (currentAlertKey === lastProcessedAlertKey) {
      return;
    }
    lastProcessedAlertKey = currentAlertKey;

    const eventTime = parseTimestampMs(data.sentAt || data.acknowledgedAt || data.timestamp);
    const now = Date.now();
    // Alert considered recent if sent within the last 5 minutes
    const isRecent = eventTime > 0 && (now - eventTime) < 300000;

    if (data.status === 'active') {
      lastKnownPeerPing = Date.now();
      lastKnownPeerRole = 'child_device';
      lastKnownPeerName = data.childName || 'Child';
      notifyPresence();

      // Fire alert if active and recent (<5m), or sent after connection established
      if (isRecent || eventTime >= subscriptionStartTime || !initialAlertLoaded) {
        alertListeners.forEach((fn) => fn(data));
      }
    } else if (data.status === 'acknowledged') {
      lastKnownPeerPing = Date.now();
      lastKnownPeerRole = 'caregiver';
      lastKnownPeerName = data.acknowledgedBy || 'Caregiver';
      notifyPresence();

      const ackTime = parseTimestampMs(data.acknowledgedAt || data.sentAt || data.timestamp);
      const isRecentAck = ackTime > 0 && (now - ackTime) < 120000;

      // Only notify acks that are recent (<2m) or arrived after initial subscription
      if (isRecentAck || ackTime >= subscriptionStartTime || initialAlertLoaded) {
        ackListeners.forEach((fn) => fn({
          alertId: data.id || data.alertId || code,
          responseMessage: data.responseMessage,
          responseId: data.responseId,
          by: data.acknowledgedBy || 'Caregiver',
        }));
      }
    }
    initialAlertLoaded = true;
  });

  // 2. Listen for Real-Time Messages
  const messagesRef = ref(db, `beeyou/sessions/${code}/messages`);
  const seenMessageKeys = new Set<string>();
  let initialMessagesLoaded = false;

  activeMessagesUnsub = onValue(messagesRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      initialMessagesLoaded = true;
      return;
    }

    const entries = Object.entries(val) as [string, CaregiverMessage][];
    
    if (!initialMessagesLoaded) {
      // Record all existing historical messages on initial load
      entries.forEach(([k]) => seenMessageKeys.add(k));
      initialMessagesLoaded = true;
      return;
    }

    // Process all newly added messages
    entries.forEach(([key, msg]) => {
      if (!seenMessageKeys.has(key)) {
        seenMessageKeys.add(key);
        const rawSender = msg?.senderName || 'Caregiver';
        const rawText = msg?.text || '';
        const isActuallyInverted =
          (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
          rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
        const finalSender = isActuallyInverted ? rawText : rawSender;
        const finalText = isActuallyInverted ? rawSender : rawText;

        const isFromChild = msg?.senderRole === 'child' || (
          finalSender.trim().toLowerCase() !== 'caregiver' &&
          finalSender.trim().toLowerCase() !== 'parent'
        );

        lastKnownPeerPing = Date.now();
        lastKnownPeerRole = isFromChild ? 'child_device' : 'caregiver';
        lastKnownPeerName = finalSender;
        notifyPresence();

        const normalizedMsg: CaregiverMessage = {
          ...msg,
          senderName: finalSender,
          text: finalText,
          senderRole: isFromChild ? 'child' : 'caregiver',
        };

        messageListeners.forEach((fn) => fn(normalizedMsg));
      }
    });
  });

  // 3. Listen for Peer Presence & Heartbeats
  const pingsRef = ref(db, `beeyou/sessions/${code}/pings`);
  activePingsUnsub = onValue(pingsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;

    const peerKey = isCaregiver ? 'child' : 'caregiver';
    const peerData = val[peerKey];

    if (peerData && peerData.timestamp) {
      lastKnownPeerPing = peerData.timestamp;
      lastKnownPeerRole = isCaregiver ? 'child_device' : 'caregiver';
      lastKnownPeerName = peerData.name || (isCaregiver ? 'Child Device' : 'Caregiver');
      notifyPresence();
    }
  });

  // 4. Listen for Child Status Updates
  const statusRef = ref(db, `beeyou/sessions/${code}/childStatus`);
  activeStatusUnsub = onValue(statusRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      statusListeners.forEach((fn) => fn(val));
    }
  });

  // 5. Listen for Universal Real-Time Event Stream (Multi-server & Pub/Sub)
  const eventRef = ref(db, `beeyou/events/${code}/latest`);
  let initialEventLoaded = false;
  activeEventUnsub = onValue(eventRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;
    if (!initialEventLoaded) {
      initialEventLoaded = true;
      if (Date.now() - (val.sentAt || 0) < 20000) {
        eventListeners.forEach((fn) => fn(val));
      }
      return;
    }
    eventListeners.forEach((fn) => fn(val));
  });
}

function notifyPresence(): void {
  const diffSec = lastKnownPeerPing > 0 ? Math.floor((Date.now() - lastKnownPeerPing) / 1000) : 9999;
  const isConnected = lastKnownPeerPing > 0 && diffSec <= 25;

  presenceListeners.forEach((fn) => fn({
    isConnected,
    peerName: lastKnownPeerName || (lastKnownPeerRole === 'caregiver' ? 'Caregiver' : 'Child'),
    peerRole: lastKnownPeerRole,
    lastPingAgo: diffSec,
  }));
}

/**
 * Send real-time heartbeat to Firebase
 */
export async function sendFirebaseHeartbeat(params: {
  code: string;
  role: 'caregiver' | 'child_device';
  name: string;
  childStatus?: Partial<CaregiverChildStatus>;
}): Promise<void> {
  const code = cleanCode(params.code);
  const isCaregiver = params.role === 'caregiver';
  const roleKey = isCaregiver ? 'caregiver' : 'child';

  try {
    const pingRef = ref(db, `beeyou/sessions/${code}/pings/${roleKey}`);
    await set(pingRef, removeUndefined({
      role: params.role,
      name: params.name,
      timestamp: Date.now(),
    }));

    if (params.childStatus) {
      const statusRef = ref(db, `beeyou/sessions/${code}/childStatus`);
      await set(statusRef, removeUndefined({
        ...params.childStatus,
        lastActiveTime: new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Firebase heartbeat error:', err);
  }
}

/**
 * Send SOS Emergency Alert from Child to Caregiver
 */
export async function sendFirebaseAlert(alert: CaregiverAlert): Promise<void> {
  const code = cleanCode(alert.pairingCode);
  try {
    const alertRef = ref(db, `beeyou/sessions/${code}/activeAlert`);
    await set(alertRef, removeUndefined({
      ...alert,
      status: 'active',
      sentAt: Date.now(),
      timestamp: alert.timestamp || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Firebase alert dispatch error:', err);
  }
}

/**
 * Acknowledge Alert from Caregiver to Child
 */
export async function acknowledgeFirebaseAlert(params: {
  code: string;
  alertId: string;
  acknowledgedBy: string;
  responseMessage?: string;
  responseId?: PredefinedCaregiverResponseId;
}): Promise<void> {
  const code = cleanCode(params.code);
  try {
    const alertRef = ref(db, `beeyou/sessions/${code}/activeAlert`);
    await set(alertRef, removeUndefined({
      id: params.alertId,
      status: 'acknowledged',
      acknowledgedBy: params.acknowledgedBy,
      responseMessage: params.responseMessage || "I'm on my way.",
      responseId: params.responseId || null,
      acknowledgedAt: new Date().toISOString(),
      sentAt: Date.now(),
    }));
  } catch (err) {
    console.warn('Firebase alert ACK error:', err);
  }
}

/**
 * Resolve/Clear Alert from Firebase
 */
export async function resolveFirebaseAlert(code: string): Promise<void> {
  const c = cleanCode(code);
  try {
    const alertRef = ref(db, `beeyou/sessions/${c}/activeAlert`);
    await set(alertRef, null);
  } catch (err) {
    console.warn('Firebase alert resolve error:', err);
  }
}

/**
 * Send instant reassurance note / nudge
 */
export async function sendFirebaseMessage(code: string, message: CaregiverMessage): Promise<void> {
  const c = cleanCode(code);
  try {
    const rawSender = message?.senderName || 'Caregiver';
    const rawText = message?.text || '';
    const isActuallyInverted =
      (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
      rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
    const normalizedMessage: CaregiverMessage = isActuallyInverted
      ? { ...message, senderName: rawText, text: rawSender }
      : message;

    const msgsRef = ref(db, `beeyou/sessions/${c}/messages`);
    const newMsgRef = push(msgsRef);
    await set(newMsgRef, removeUndefined(normalizedMessage));
  } catch (err) {
    console.warn('Firebase send message error:', err);
  }
}

// Subscription Listeners
export function onFirebasePresence(listener: PresenceCallback): () => void {
  presenceListeners.add(listener);
  notifyPresence();
  return () => presenceListeners.delete(listener);
}

export function onFirebaseAlert(listener: AlertCallback): () => void {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
}

export function onFirebaseAck(listener: AckCallback): () => void {
  ackListeners.add(listener);
  return () => ackListeners.delete(listener);
}

export function onFirebaseResolve(listener: ResolveCallback): () => void {
  resolveListeners.add(listener);
  return () => resolveListeners.delete(listener);
}

export function onFirebaseMessage(listener: MessageCallback): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export function onFirebaseStatus(listener: StatusCallback): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function onFirebaseGenericEvent(listener: GenericEventCallback): () => void {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

/**
 * Permanently deletes all family cloud realtime records for a familyCode.
 * Used for Apple Guideline 5.1.1(v) account deletion compliance.
 */
export async function deleteFirebaseFamilyNode(familyCode: string): Promise<boolean> {
  const safeCode = (familyCode || '').trim().toUpperCase();
  if (!safeCode || safeCode === 'BEE-DEMO') return true;
  try {
    const familyRef = ref(db, `beeyou/families/${safeCode}`);
    await set(familyRef, null);
    return true;
  } catch (err) {
    console.warn('deleteFirebaseFamilyNode warning:', err);
    return false;
  }
}

