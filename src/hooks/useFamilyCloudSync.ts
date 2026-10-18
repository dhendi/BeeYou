import { useState, useEffect, useRef } from 'react';
import {
  CaregiverMessage,
  CaregiverPermissions,
  EmergencySupportContact,
  UserAccountRole,
  Routine,
  AACItem,
  PlansChangedState,
  EmotionType,
} from '../types';
import {
  ConnectionStatusInfo,
  getLiveConnectionStatus,
  onCaregiverMessage,
  onCaregiverAlert,
  onCaregiverAlertAck,
  onCaregiverAlertResolve,
  onConnectionStatusChange,
  getPairingCode,
  subscribeToCloudChannel,
  sendHeartbeat,
} from '../services/caregiverSync';
import {
  startFamilyLiveSync,
  onFamilyStateChange,
  pushFamilyStateUpdate,
} from '../services/familySync';
import { playChime } from '../utils/audio';

const spokenAlertKeys = new Set<string>();
const spokenAckKeys = new Set<string>();

interface UseFamilyCloudSyncProps {
  userRole: UserAccountRole;
  isParentMode: boolean;
  childName: string;
  currentMood: EmotionType | null;
  childView: string;
  stars: number;
  habitsCompletedToday: number;
  totalHabits: number;
  routines: Routine[];
  adventures?: any[];
  socialStories?: any[];
  aacItems: AACItem[];
  plansChanged: PlansChangedState;
  onRemoteRoutinesSync: (remoteRoutines: Routine[]) => void;
  onRemoteAdventuresSync?: (remoteAdventures: any[]) => void;
  onRemoteSocialStoriesSync?: (remoteStories: any[]) => void;
  onRemoteAacSync: (remoteAac: AACItem[]) => void;
  onRemotePlansChangedSync: (plans: Partial<PlansChangedState>) => void;
  speak: (text: string) => Promise<void>;
}

export function useFamilyCloudSync({
  userRole,
  isParentMode,
  childName,
  currentMood,
  childView,
  stars,
  habitsCompletedToday,
  totalHabits,
  routines,
  adventures,
  socialStories,
  aacItems,
  plansChanged,
  onRemoteRoutinesSync,
  onRemoteAdventuresSync,
  onRemoteSocialStoriesSync,
  onRemoteAacSync,
  onRemotePlansChangedSync,
  speak,
}: UseFamilyCloudSyncProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusInfo>(
    getLiveConnectionStatus()
  );
  const isCaregiverConnected =
    connectionStatus.isConnected &&
    (connectionStatus.peerRole === 'caregiver' ||
      !connectionStatus.peerRole ||
      connectionStatus.lastPingAgoSeconds <= 35);

  const [incomingCaregiverMessage, setIncomingCaregiverMessage] = useState<CaregiverMessage | null>(
    null
  );

  const [showCaregiverModal, setShowCaregiverModal] = useState<boolean>(false);
  const [showCaregiverAlertModal, setShowCaregiverAlertModal] = useState<boolean>(false);
  const [showFamilyAuthModal, setShowFamilyAuthModal] = useState<boolean>(false);

  const [emergencyContact, setEmergencyContactState] =
    useState<EmergencySupportContact | null>(() => {
      try {
        const saved = localStorage.getItem('beeyou_emergency_contact');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return null;
    });

  const [caregiverPermissions, setCaregiverPermissions] = useState<CaregiverPermissions>(() => {
    try {
      const saved = localStorage.getItem('beeyou_caregiver_permissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      canEditSchedules: true,
      canEditAAC: true,
      canViewLocation: true,
      canTriggerSensoryAlert: true,
      canAccessTherapistNotes: true,
    };
  });

  const [linkedDeviceCode, setLinkedDeviceCodeState] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('beeyou_device_linked_code') ||
        localStorage.getItem('beeyou_caregiver_pairing_code') ||
        'BEE-DEMO'
      );
    } catch {
      return 'BEE-DEMO';
    }
  });

  const setLinkedDeviceCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    setLinkedDeviceCodeState(clean);
    try {
      localStorage.setItem('beeyou_device_linked_code', clean);
      localStorage.setItem('beeyou_caregiver_pairing_code', clean);
    } catch {}
  };

  const setEmergencyContact = (contact: EmergencySupportContact | null) => {
    setEmergencyContactState(contact);
    try {
      if (contact) {
        localStorage.setItem('beeyou_emergency_contact', JSON.stringify(contact));
      } else {
        localStorage.removeItem('beeyou_emergency_contact');
      }
    } catch {}
  };

  const updateCaregiverPermissions = (updates: Partial<CaregiverPermissions>) => {
    setCaregiverPermissions((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('beeyou_caregiver_permissions', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const dismissIncomingCaregiverMessage = () => {
    setIncomingCaregiverMessage(null);
  };

  const isSyncingFromRemoteRef = useRef(false);

  // Unified Family Cloud Sync (Real-time remote control + live alert relay)
  useEffect(() => {
    const code = getPairingCode();
    const unsubSync = startFamilyLiveSync(code);

    const unsubState = onFamilyStateChange((remoteState) => {
      if (!remoteState) return;

      isSyncingFromRemoteRef.current = true;

      if (Array.isArray(remoteState.routines) && remoteState.routines.length > 0) {
        onRemoteRoutinesSync(remoteState.routines);
      }

      if (Array.isArray(remoteState.adventures) && remoteState.adventures.length > 0 && onRemoteAdventuresSync) {
        onRemoteAdventuresSync(remoteState.adventures);
      }

      if (Array.isArray(remoteState.socialStories) && remoteState.socialStories.length > 0 && onRemoteSocialStoriesSync) {
        onRemoteSocialStoriesSync(remoteState.socialStories);
      }

      if (Array.isArray(remoteState.aacItems) && remoteState.aacItems.length > 0) {
        onRemoteAacSync(remoteState.aacItems);
      }

      if (remoteState.plansChanged) {
        onRemotePlansChangedSync(remoteState.plansChanged);
      }

      setTimeout(() => {
        isSyncingFromRemoteRef.current = false;
      }, 600);
    });

    return () => {
      unsubSync();
      unsubState();
    };
  }, []);

  // Remote Push Debounce
  useEffect(() => {
    if (isSyncingFromRemoteRef.current) return;
    const timeout = setTimeout(() => {
      pushFamilyStateUpdate({
        routines,
        adventures,
        socialStories,
        aacItems,
        plansChanged,
        childProfile: {
          name: childName || 'Child',
          ageGroup: 'kid',
          pin: '1234',
          interests: [],
          pronouns: '',
        },
        childState: {
          lastActiveTime: new Date().toISOString(),
          currentActivity: `In ${childView === 'my-day' ? 'Visual Schedule' : childView === 'aac' ? 'AAC Speech Board' : 'BeeYou'}`,
          currentMood: currentMood || 'happy',
          habitsCompletedToday,
          totalHabits,
          stars,
          isOnline: true,
        },
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [routines, adventures, socialStories, aacItems, plansChanged, currentMood, childView, stars, habitsCompletedToday, totalHabits, childName]);

  // Caregiver Message & Heartbeat Listeners
  const liveChildStatusRef = useRef({
    currentMood,
    childView,
    stars,
    childName: childName || 'Child',
  });
  liveChildStatusRef.current = {
    currentMood,
    childView,
    stars,
    childName: childName || 'Child',
  };

  useEffect(() => {
    const isCaregiver =
      userRole === 'caregiver' ||
      isParentMode ||
      (typeof window !== 'undefined' &&
        (window.location.port === '3001' ||
          window.location.pathname.startsWith('/caregiver') ||
          new URLSearchParams(window.location.search).get('role') === 'caregiver' ||
          sessionStorage.getItem('beeyou_active_device_view') === 'caregiver'));

    const unsubCaregiver = onCaregiverMessage((msg) => {
      if (msg.responseId) return;
      const rawSender = msg.senderName || 'Caregiver';
      const rawText = msg.text || '';
      const isInverted =
        (rawText.trim().toLowerCase() === 'caregiver' || rawText.trim().toLowerCase() === 'child') &&
        rawSender.trim().toLowerCase() !== rawText.trim().toLowerCase();
      const sender = isInverted ? rawText : rawSender;
      const text = isInverted ? rawSender : rawText;

      const isFromChild = msg.senderRole === 'child' || (
        sender.trim().toLowerCase() !== 'caregiver' &&
        sender.trim().toLowerCase() !== 'parent'
      );

      // On Child Tablet: ONLY accept messages from Caregiver (silence own replies)
      if (!isCaregiver) {
        if (isFromChild) return;
        const normalizedMsg = { ...msg, senderName: sender, text, senderRole: 'caregiver' as const };
        setIncomingCaregiverMessage(normalizedMsg);
        playChime('star');
        speak(`${sender} sent you a message: ${text}`);
        return;
      }

      // On Caregiver Device: ONLY accept messages from Child
      if (isCaregiver) {
        if (!isFromChild) return;
        const normalizedMsg = { ...msg, senderName: sender, text, senderRole: 'child' as const };
        setIncomingCaregiverMessage(normalizedMsg);
        playChime('star');
        speak(`${sender} replied: ${text}`);
        return;
      }
    });

    const unsubAlert = onCaregiverAlert((alert) => {
      if (!isCaregiver) return;
      const alertKey = `${alert.id || alert.label}:${alert.status || 'active'}`;
      if (spokenAlertKeys.has(alertKey)) return;
      spokenAlertKeys.add(alertKey);

      playChime('star');
      speak(`Incoming Alert from ${alert.childName || 'Child'}: ${alert.label}`);
      setIncomingCaregiverMessage({
        id: 'alert-' + alert.id,
        senderName: alert.childName || 'Child',
        text: `ALERT: ${alert.label} (${alert.location || 'Location shared'})`,
        emoji: '',
        timestamp: alert.timestamp || new Date().toISOString(),
        read: false,
        senderRole: 'child',
      });
    });

    const unsubAck = onCaregiverAlertAck((ack) => {
      if (isCaregiver) return;
      if (ack.responseMessage) {
        const ackKey = `${ack.alertId || ''}:${ack.responseMessage || ''}:${ack.by || ''}`;
        if (spokenAckKeys.has(ackKey)) return;
        spokenAckKeys.add(ackKey);

        setIncomingCaregiverMessage({
          id: 'ack-' + Date.now(),
          senderName: ack.by || 'Caregiver',
          text: ack.responseMessage,
          timestamp: new Date().toISOString(),
          read: false,
        });
        playChime('star');
        speak(`${ack.by || 'Caregiver'} says: ${ack.responseMessage}`);
      }
    });

    const unsubResolve = onCaregiverAlertResolve(() => {
      setIncomingCaregiverMessage((prev) => {
        if (prev?.text?.includes('ALERT:')) return null;
        return prev;
      });
    });

    const unsubConnection = onConnectionStatusChange((status) => {
      setConnectionStatus(status);
    });

    const code = getPairingCode();
    subscribeToCloudChannel(code);

    const sendPing = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }
      const snap = liveChildStatusRef.current;
      sendHeartbeat({
        role: isCaregiver ? 'caregiver' : 'child_device',
        name: isCaregiver ? 'Caregiver' : snap.childName || 'Child',
        pairingCode: code,
        childStatus: {
          childName: snap.childName || 'Child',
          currentMood: snap.currentMood,
          currentActivity: `In ${snap.childView === 'my-day' ? 'Visual Schedule' : snap.childView === 'aac' ? 'AAC Speech Board' : 'BeeYou'}`,
          stars: snap.stars,
        },
      });
    };

    const onForegroundResume = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendPing();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onForegroundResume);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', onForegroundResume);
    }

    sendPing();
    const interval = setInterval(sendPing, 3500);

    return () => {
      unsubCaregiver();
      unsubAlert();
      unsubAck();
      unsubResolve();
      unsubConnection();
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onForegroundResume);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onForegroundResume);
      }
    };
  }, [userRole, isParentMode]);

  return {
    connectionStatus,
    isCaregiverConnected,
    incomingCaregiverMessage,
    dismissIncomingCaregiverMessage,
    emergencyContact,
    setEmergencyContact,
    caregiverPermissions,
    updateCaregiverPermissions,
    linkedDeviceCode,
    setLinkedDeviceCode,
    showCaregiverModal,
    setShowCaregiverModal,
    showCaregiverAlertModal,
    setShowCaregiverAlertModal,
    showFamilyAuthModal,
    setShowFamilyAuthModal,
  };
}
