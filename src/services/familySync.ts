/**
 * BeeYou Unified Family Cloud Synchronization Engine
 * Connects Main (Child) App and Caregiver Hub with:
 * 1. Persistent Shared State (Routines, AAC, Plans Changed, Child Status)
 * 2. Guaranteed Bi-directional Alerts with Delivery ACKs
 * 3. SSE Stream with Automatic Short-Polling Fallback
 */

import { EmotionType, UserAgeGroup } from '../types';
import { db } from './firebaseSync';
import { ref, get, set, update, onValue, push, Unsubscribe } from 'firebase/database';

function cleanFirebaseObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  return JSON.parse(JSON.stringify(obj));
}

export interface RemoteChildProfile {
  name: string;
  ageGroup?: UserAgeGroup | string;
  pin?: string;
  interests?: string[];
  pronouns?: string;
}

export interface RemoteChildState {
  lastActiveTime: string;
  currentActivity: string;
  currentMood: string;
  habitsCompletedToday: number;
  totalHabits: number;
  routineProgress?: any;
  stars: number;
  isOnline: boolean;
}

export interface RemoteFamilyAlert {
  id: string;
  familyCode: string;
  childName: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload' | 'want_to_talk' | 'im_okay';
  alertId?: string;
  label: string;
  emoji: string;
  location?: string;
  note?: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  responseMessage?: string;
  responseId?: string;
}

export interface RemoteFamilyMessage {
  id: string;
  senderName: string;
  text: string;
  emoji: string;
  timestamp: string;
  read: boolean;
  responseId?: string;
}

export interface RemotePlansChanged {
  active: boolean;
  originalPlanTitle: string;
  reason: string;
  newPlanTitle: string;
  calmingMessage: string;
  newSteps: Array<{ title: string; emoji: string; time?: string }>;
  relevantPhrases: string[];
}

export interface SharedFamilyState {
  familyCode: string;
  email: string;
  caregiverName: string;
  caregiverRole: string;
  childProfile: RemoteChildProfile;
  childState: RemoteChildState;
  routines: any[];
  adventures?: any[];
  socialStories?: any[];
  medicationLogs?: any[];
  aacItems: any[];
  plansChanged: RemotePlansChanged;
  activeAlert: RemoteFamilyAlert | null;
  alertHistory: RemoteFamilyAlert[];
  messages: RemoteFamilyMessage[];
  lastUpdated: number;
}

export interface FamilySyncConnectionStatus {
  isConnected: boolean;
  mode: 'sse' | 'polling' | 'disconnected';
  lastPingAgoSeconds: number;
  familyCode: string;
  peerRole?: 'child_device' | 'caregiver';
  peerName?: string;
  statusText: string;
}

// -------------------------------------------------------------
// Identification & Tab Isolation
// -------------------------------------------------------------

let cachedTabId = '';
export function getTabId(): string {
  if (typeof window === 'undefined') return 'tab-server';
  if (!cachedTabId) {
    try {
      let tid = sessionStorage.getItem('beeyou_tab_id');
      if (!tid) {
        tid = 'tab-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
        sessionStorage.setItem('beeyou_tab_id', tid);
      }
      cachedTabId = tid;
    } catch {
      cachedTabId = 'tab-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    }
  }
  return cachedTabId;
}

export function getActiveFamilyCode(): string {
  if (typeof window === 'undefined') return 'BEE-DEMO';
  try {
    const rawFam = localStorage.getItem('beeyou_family_account');
    if (rawFam) {
      const fam = JSON.parse(rawFam);
      if (fam?.familyCode) return fam.familyCode.trim().toUpperCase();
    }
    const legacyCode = localStorage.getItem('beeyou_caregiver_pairing_code');
    if (legacyCode) return legacyCode.trim().toUpperCase();
  } catch {}
  return 'BEE-DEMO';
}

export function setActiveFamilyCode(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  const safe = code.trim().toUpperCase();
  try {
    localStorage.setItem('beeyou_caregiver_pairing_code', safe);
    localStorage.setItem('beeyou_device_linked_code', safe);
  } catch {}
}

// -------------------------------------------------------------
// Event Listeners & Observables
// -------------------------------------------------------------

type StateListener = (state: SharedFamilyState) => void;
type AlertListener = (alert: RemoteFamilyAlert) => void;
type AlertAckListener = (ack: { alertId: string; responseMessage?: string; responseId?: string; by: string }) => void;
type MessageListener = (message: RemoteFamilyMessage) => void;
type ConnectionListener = (status: FamilySyncConnectionStatus) => void;

const stateListeners = new Set<StateListener>();
const alertListeners = new Set<AlertListener>();
const alertAckListeners = new Set<AlertAckListener>();
const alertResolveListeners = new Set<(alertId?: string) => void>();
const messageListeners = new Set<MessageListener>();
const connectionListeners = new Set<ConnectionListener>();

export function onFamilyStateChange(fn: StateListener): () => void {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

export function onFamilyAlert(fn: AlertListener): () => void {
  alertListeners.add(fn);
  return () => alertListeners.delete(fn);
}

export function onFamilyAlertAck(fn: AlertAckListener): () => void {
  alertAckListeners.add(fn);
  return () => alertAckListeners.delete(fn);
}

export function onFamilyAlertResolve(fn: (alertId?: string) => void): () => void {
  alertResolveListeners.add(fn);
  return () => alertResolveListeners.delete(fn);
}

export function onFamilyMessage(fn: MessageListener): () => void {
  messageListeners.add(fn);
  return () => messageListeners.delete(fn);
}

export function onFamilyConnectionStatus(fn: ConnectionListener): () => void {
  connectionListeners.add(fn);
  return () => connectionListeners.delete(fn);
}

// -------------------------------------------------------------
// API Actions (Remote CRUD & Dispatch)
// -------------------------------------------------------------

/**
 * Fetch full shared family state from cloud (Firebase Realtime Database primary)
 */
export async function fetchFamilyState(familyCode?: string): Promise<SharedFamilyState | null> {
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();

  // 1. Primary: Fetch from Firebase Realtime Database
  try {
    const familyRef = ref(db, `beeyou/families/${code}`);
    const snap = await get(familyRef);
    if (snap.exists()) {
      const data = snap.val();
      if (data && typeof data === 'object') {
        lastKnownState = data as SharedFamilyState;
        notifyStateChange(lastKnownState);
        return lastKnownState;
      }
    }
  } catch (fbErr) {
    console.warn('Firebase fetchFamilyState error, trying fallback:', fbErr);
  }

  // 2. Secondary Fallback: Local Express server (if running on localhost)
  try {
    const res = await fetch(`/api/family/state/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.state) {
        lastKnownState = data.state;
        notifyStateChange(data.state);
        return data.state;
      }
    }
  } catch (err) {
    // Expected on static production hosts like Vercel
  }

  return lastKnownState;
}

/**
 * Push remote updates (routines, AAC, plansChanged, childState, childProfile)
 */
export async function pushFamilyStateUpdate(
  partial: Partial<SharedFamilyState>,
  familyCode?: string
): Promise<{ success: boolean; state?: SharedFamilyState }> {
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();
  const cleanPartial = cleanFirebaseObject(partial);

  let success = false;
  const updatedState: SharedFamilyState = lastKnownState 
    ? { ...lastKnownState, ...cleanPartial, lastUpdated: Date.now() }
    : { ...cleanPartial, familyCode: code, lastUpdated: Date.now() } as SharedFamilyState;

  // 1. Primary: Push directly to Firebase Realtime Database
  try {
    const familyRef = ref(db, `beeyou/families/${code}`);
    await update(familyRef, cleanPartial);
    success = true;
    lastKnownState = updatedState;
    notifyStateChange(updatedState);

    // Broadcast on local channel for instant multi-tab response
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage({
        type: 'STATE_UPDATE',
        senderTabId: getTabId(),
        state: updatedState,
      });
    }
  } catch (fbErr) {
    console.warn('Firebase pushFamilyStateUpdate error:', fbErr);
  }

  // 2. Secondary fallback: Local Express server
  try {
    const res = await fetch(`/api/family/state/${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPartial),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.state) {
        lastKnownState = data.state;
        notifyStateChange(data.state);
        return { success: true, state: data.state };
      }
    }
  } catch (err) {
    // Expected on static production hosts like Vercel
  }

  return { success, state: updatedState };
}

/**
 * Send instant emergency or sensory overload alert from Child tablet
 */
export async function sendEmergencyAlert(params: {
  childName: string;
  emotion: EmotionType | 'need_help' | 'need_break' | 'sensory_overload' | 'want_to_talk' | 'im_okay';
  alertId?: string;
  label: string;
  emoji: string;
  location?: string;
  note?: string;
  familyCode?: string;
}): Promise<{ success: boolean; alert?: RemoteFamilyAlert; deliveryStatus: 'delivered' | 'failed' }> {
  const code = (params.familyCode || getActiveFamilyCode()).trim().toUpperCase();
  const alertId = params.alertId || `alt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const alert: RemoteFamilyAlert = {
    id: alertId,
    familyCode: code,
    childName: params.childName,
    emotion: params.emotion,
    label: params.label,
    emoji: params.emoji,
    location: params.location,
    note: params.note,
    timestamp: new Date().toISOString(),
    status: 'active',
  };

  // 1. Primary: Write to Firebase Realtime Database
  try {
    const alertRef = ref(db, `beeyou/families/${code}/activeAlert`);
    await set(alertRef, cleanFirebaseObject(alert));

    alertListeners.forEach((fn) => fn(alert));
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage({
        type: 'CAREGIVER_ALERT',
        senderTabId: getTabId(),
        alert,
      });
    }
    return { success: true, alert, deliveryStatus: 'delivered' };
  } catch (fbErr) {
    console.warn('Firebase sendEmergencyAlert error:', fbErr);
  }

  // 2. Secondary fallback: Local Express server
  try {
    const res = await fetch(`/api/family/alert/${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.alert) {
        if (data.state) {
          lastKnownState = data.state;
          notifyStateChange(data.state);
        }
        return { success: true, alert: data.alert, deliveryStatus: 'delivered' };
      }
    }
  } catch (err) {
    console.error('sendEmergencyAlert network failure:', err);
  }
  return { success: false, deliveryStatus: 'failed' };
}

/**
 * Caregiver acknowledges the alert and sends instant reassurance response
 */
export async function ackEmergencyAlert(params: {
  acknowledgedBy: string;
  responseMessage?: string;
  responseId?: string;
  alertId?: string;
  familyCode?: string;
}): Promise<boolean> {
  const code = (params.familyCode || getActiveFamilyCode()).trim().toUpperCase();
  const ackData = {
    status: 'acknowledged',
    acknowledgedBy: params.acknowledgedBy,
    responseMessage: params.responseMessage || "I'm on my way.",
    responseId: params.responseId || null,
    acknowledgedAt: new Date().toISOString(),
  };

  // 1. Primary: Write to Firebase Realtime Database
  try {
    const alertRef = ref(db, `beeyou/families/${code}/activeAlert`);
    await update(alertRef, cleanFirebaseObject(ackData));
    alertAckListeners.forEach((fn) =>
      fn({
        alertId: params.alertId || '',
        responseMessage: params.responseMessage,
        responseId: params.responseId,
        by: params.acknowledgedBy,
      })
    );
    return true;
  } catch (fbErr) {
    console.warn('Firebase ackEmergencyAlert error:', fbErr);
  }

  // 2. Secondary fallback: Local Express server
  try {
    const res = await fetch(`/api/family/alert/${encodeURIComponent(code)}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.state) {
        lastKnownState = data.state;
        notifyStateChange(data.state);
        return true;
      }
    }
  } catch (err) {
    console.error('ackEmergencyAlert error:', err);
  }
  return false;
}

/**
 * Caregiver marks alert as resolved / all clear
 */
export async function resolveEmergencyAlert(alertId?: string, familyCode?: string): Promise<boolean> {
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();

  // 1. Primary: Clear in Firebase Realtime Database
  try {
    const alertRef = ref(db, `beeyou/families/${code}/activeAlert`);
    await set(alertRef, null);
    alertResolveListeners.forEach((fn) => fn(alertId));
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage({
        type: 'ALERT_RESOLVED',
        senderTabId: getTabId(),
        alertId,
      });
    }
    return true;
  } catch (fbErr) {
    console.warn('Firebase resolveEmergencyAlert error:', fbErr);
  }

  // 2. Secondary fallback: Local Express server
  try {
    const res = await fetch(`/api/family/alert/${encodeURIComponent(code)}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.state) {
        lastKnownState = data.state;
        notifyStateChange(data.state);
        return true;
      }
    }
  } catch (err) {
    console.error('resolveEmergencyAlert error:', err);
  }
  return false;
}

/**
 * Synchronize custom adventures & social stories to Firebase Cloud
 */
export async function syncAdventuresToCloud(
  adventures: any[],
  socialStories?: any[],
  familyCode?: string
): Promise<void> {
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();
  try {
    const payload: Record<string, any> = {
      adventures: cleanFirebaseObject(adventures),
      lastUpdated: Date.now(),
    };
    if (socialStories) {
      payload.socialStories = cleanFirebaseObject(socialStories);
    }
    const familyRef = ref(db, `beeyou/families/${code}`);
    await update(familyRef, payload);
  } catch (err) {
    console.warn('Firebase syncAdventuresToCloud error:', err);
  }
}

/**
 * Synchronize routines to Firebase Cloud
 */
export async function syncRoutinesToCloud(
  routines: any[],
  familyCode?: string
): Promise<void> {
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();
  try {
    const familyRef = ref(db, `beeyou/families/${code}`);
    await update(familyRef, {
      routines: cleanFirebaseObject(routines),
      lastUpdated: Date.now(),
    });
  } catch (err) {
    console.warn('Firebase syncRoutinesToCloud error:', err);
  }
}

/**
 * Caregiver sends instant nudge or reminder message to child
 */
export async function sendNudgeMessage(params: {
  text: string;
  emoji?: string;
  senderName?: string;
  responseId?: string;
  familyCode?: string;
}): Promise<{ success: boolean; message?: RemoteFamilyMessage }> {
  const code = (params.familyCode || getActiveFamilyCode()).trim().toUpperCase();
  const msgObj: RemoteFamilyMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: params.text,
    emoji: params.emoji || '💬',
    senderName: params.senderName || 'Caregiver',
    timestamp: new Date().toISOString(),
    read: false,
    responseId: params.responseId,
  };

  // 1. Primary: Write to Firebase Realtime Database
  try {
    const msgsRef = ref(db, `beeyou/families/${code}/messages`);
    const newMsgRef = push(msgsRef);
    await set(newMsgRef, cleanFirebaseObject(msgObj));
    messageListeners.forEach((fn) => fn(msgObj));
    return { success: true, message: msgObj };
  } catch (fbErr) {
    console.warn('Firebase sendNudgeMessage error:', fbErr);
  }

  // 2. Secondary fallback: Local Express server
  try {
    const res = await fetch(`/api/family/message/${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.message) {
        if (data.state) {
          lastKnownState = data.state;
          notifyStateChange(data.state);
        }
        return { success: true, message: data.message };
      }
    }
  } catch (err) {
    console.error('sendNudgeMessage error:', err);
  }
  return { success: false };
}

// -------------------------------------------------------------
// Live Real-Time Transport (SSE + Polling Fallback + Local Bus)
// -------------------------------------------------------------

let lastKnownState: SharedFamilyState | null = null;
let activeEventSource: EventSource | null = null;
let activePollInterval: any = null;
let subscribedCode: string | null = null;
let lastServerPingTime = 0;
let seenEventIds = new Set<string>();

const localBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('beeyou_family_sync')
  : null;

if (localBroadcastChannel) {
  localBroadcastChannel.onmessage = (event) => {
    handleIncomingEvent(event.data);
  };
}

function handleIncomingEvent(event: any): void {
  if (!event || typeof event !== 'object') return;

  // Echo suppression: Ignore if sent by the exact same tab
  const tabId = getTabId();
  if (event.senderTabId && event.senderTabId === tabId) return;

  const eventId = event.eventId || `${event.type}-${event.sentAt}`;
  if (seenEventIds.has(eventId)) return;
  seenEventIds.add(eventId);
  if (seenEventIds.size > 200) {
    const first = seenEventIds.values().next().value;
    if (first) seenEventIds.delete(first);
  }

  lastServerPingTime = Date.now();
  updateLiveConnectionStatus(true, 'sse');

  if (event.state) {
    lastKnownState = event.state;
    notifyStateChange(event.state);
  }

  if (event.type === 'CAREGIVER_ALERT' && event.alert) {
    alertListeners.forEach((fn) => fn(event.alert));
  } else if (event.type === 'CAREGIVER_ALERT_ACK' && event.ack) {
    alertAckListeners.forEach((fn) => fn(event.ack));
  } else if (event.type === 'ALERT_RESOLVED') {
    alertResolveListeners.forEach((fn) => fn(event.alertId));
  } else if (event.type === 'CAREGIVER_MESSAGE' && event.message) {
    messageListeners.forEach((fn) => fn(event.message));
  }
}

function notifyStateChange(state: SharedFamilyState): void {
  stateListeners.forEach((fn) => fn(state));
}

function updateLiveConnectionStatus(connected: boolean, mode: 'sse' | 'polling' | 'disconnected'): void {
  const now = Date.now();
  const diffSec = lastServerPingTime > 0 ? Math.floor((now - lastServerPingTime) / 1000) : 999;
  const isLive = connected && diffSec <= 30;

  const status: FamilySyncConnectionStatus = {
    isConnected: isLive,
    mode: isLive ? mode : 'disconnected',
    lastPingAgoSeconds: diffSec,
    familyCode: getActiveFamilyCode(),
    statusText: isLive ? `Connected (${mode.toUpperCase()} • ${diffSec < 3 ? 'Live' : `${diffSec}s ago`})` : 'Offline / Reconnecting',
  };

  connectionListeners.forEach((fn) => fn(status));
}

/**
 * Initializes live synchronization connection for the given family code
 */
export function startFamilyLiveSync(familyCode?: string): () => void {
  if (typeof window === 'undefined') return () => {};
  const code = (familyCode || getActiveFamilyCode()).trim().toUpperCase();

  if (subscribedCode === code && activeEventSource && activeEventSource.readyState !== EventSource.CLOSED) {
    return () => {};
  }

  if (activeEventSource) {
    try { activeEventSource.close(); } catch {}
    activeEventSource = null;
  }
  if (activePollInterval) {
    clearInterval(activePollInterval);
    activePollInterval = null;
  }

  subscribedCode = code;

  // 1. Initial State Fetch
  fetchFamilyState(code);

  // 2. Real-Time Firebase Listener (Direct WebSocket Push across all devices)
  let fbFamilyUnsub: Unsubscribe | null = null;
  let fbAlertUnsub: Unsubscribe | null = null;
  let fbMsgsUnsub: Unsubscribe | null = null;
  let fbEventsUnsub: Unsubscribe | null = null;

  try {
    const familyRef = ref(db, `beeyou/families/${code}`);
    fbFamilyUnsub = onValue(familyRef, (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val === 'object') {
        lastServerPingTime = Date.now();
        updateLiveConnectionStatus(true, 'sse');
        lastKnownState = val as SharedFamilyState;
        notifyStateChange(lastKnownState);
      }
    });

    const alertRef = ref(db, `beeyou/families/${code}/activeAlert`);
    fbAlertUnsub = onValue(alertRef, (snapshot) => {
      const alert = snapshot.val();
      if (!alert) {
        alertResolveListeners.forEach((fn) => fn());
      } else if (alert.status === 'acknowledged') {
        alertAckListeners.forEach((fn) =>
          fn({
            alertId: alert.id,
            responseMessage: alert.responseMessage,
            responseId: alert.responseId,
            by: alert.acknowledgedBy || 'Caregiver',
          })
        );
      } else if (alert.status === 'active') {
        alertListeners.forEach((fn) => fn(alert));
      }
    });

    const msgsRef = ref(db, `beeyou/families/${code}/messages`);
    fbMsgsUnsub = onValue(msgsRef, (snapshot) => {
      const msgs = snapshot.val();
      if (msgs && typeof msgs === 'object') {
        const msgList = Object.values(msgs) as RemoteFamilyMessage[];
        if (msgList.length > 0) {
          const latest = msgList[msgList.length - 1];
          if (latest) {
            messageListeners.forEach((fn) => fn(latest));
          }
        }
      }
    });

    // Universal Pub/Sub: Listen for real-time events published across servers
    const latestEventRef = ref(db, `beeyou/events/${code}/latest`);
    let initialFamilyEventLoaded = false;
    fbEventsUnsub = onValue(latestEventRef, (snapshot) => {
      const ev = snapshot.val();
      if (ev && typeof ev === 'object') {
        if (!initialFamilyEventLoaded) {
          initialFamilyEventLoaded = true;
          if (Date.now() - (ev.sentAt || 0) < 20000) {
            handleIncomingEvent(ev);
          }
          return;
        }
        handleIncomingEvent(ev);
      }
    });
  } catch (fbErr) {
    console.warn('Firebase live listener setup error, falling back to SSE:', fbErr);
  }

  // 3. Establish Server-Sent Events (SSE) Stream (if local server is running)
  if ('EventSource' in window) {
    try {
      const sseUrl = `/api/caregiver/events/${encodeURIComponent(code)}`;
      const es = new EventSource(sseUrl);
      activeEventSource = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleIncomingEvent(payload);
        } catch {}
      };

      es.onerror = () => {
        // SSE reconnects automatically
      };
    } catch (err) {
      // Expected on static hosts
    }
  }

  // 4. Polling Fallback (runs every 5s on localhost)
  let lastPollTime = Date.now() - 30000;
  const poll = async () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      const res = await fetch(`/api/caregiver/poll/${encodeURIComponent(code)}?since=${lastPollTime}`);
      if (res.ok) {
        const data = await res.json();
        lastPollTime = data.serverTime || Date.now();
        lastServerPingTime = Date.now();
        updateLiveConnectionStatus(true, 'polling');

        if (data.state) {
          lastKnownState = data.state;
          notifyStateChange(data.state);
        }

        if (Array.isArray(data.events)) {
          for (const ev of data.events) {
            handleIncomingEvent(ev);
          }
        }
      }
    } catch {}
  };

  activePollInterval = setInterval(poll, 5000);

  return () => {
    if (fbFamilyUnsub) fbFamilyUnsub();
    if (fbAlertUnsub) fbAlertUnsub();
    if (fbMsgsUnsub) fbMsgsUnsub();
    if (fbEventsUnsub) fbEventsUnsub();
    if (activeEventSource) {
      try { activeEventSource.close(); } catch {}
      activeEventSource = null;
    }
    if (activePollInterval) {
      clearInterval(activePollInterval);
      activePollInterval = null;
    }
  };
}
