import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  ArrowLeft,
  X
} from 'lucide-react';
import { 
  fetchCaregiverSession, 
  sendCaregiverMessage, 
  acknowledgeCaregiverAlert,
  resolveCaregiverAlert,
  onCaregiverAlert,
  onCaregiverAlertResolve,
  getPairingCode,
  setPairingCode,
  unlinkDeviceSession,
  createTemporaryPairingSession,
  claimPairingSession,
  launchNativePhoneCall,
  launchNativeSms,
  subscribeToCloudChannel,
  sendHeartbeat,
  onConnectionStatusChange,
  getLiveConnectionStatus,
  ConnectionStatusInfo
} from '../services/caregiverSync';
import { pushNotificationService } from '../services/pushNotificationService';
import { CaregiverIncomingAlertModal } from './caregiver/CaregiverIncomingAlertModal';
import { 
  CaregiverChildStatus, 
  EmotionType, 
  CaregiverAlert, 
  PredefinedCaregiverResponseId,
  TemporaryPairingSession 
} from '../types';
import { playChime } from '../utils/audio';
import { BeeMascot, BeeYouLogo } from './BeeYouLogo';
import { ContextualHelpButton } from './ContextualHelpButton';
import { QRCodeView } from './QRCodeView';
import { useApp } from '../context/AppContext';

interface CaregiverLivePortalProps {
  initialCode?: string;
  onBackToApp?: () => void;
}

const PREDEFINED_RESPONSES: Array<{
  id: PredefinedCaregiverResponseId;
  text: string;
  label: string;
  iconName: 'heart' | 'car' | 'check' | 'clock';
  colorClass: string;
}> = [
  { id: 'im_here', text: "I'm here for you.", label: "I'm here", iconName: 'heart', colorClass: 'text-rose-500 fill-rose-500' },
  { id: 'coming', text: "I'm on my way.", label: "I'm coming", iconName: 'car', colorClass: 'text-sky-600' },
  { id: 'okay', text: "Okay, got your message.", label: "Okay", iconName: 'check', colorClass: 'text-emerald-600' },
  { id: 'give_minutes', text: "Give me a few minutes.", label: "Give me a few minutes", iconName: 'clock', colorClass: 'text-amber-600' },
];

const renderResponseIcon = (_iconName: string, _className?: string) => null;

export const CaregiverLivePortal: React.FC<CaregiverLivePortalProps> = ({ 
  initialCode, 
  onBackToApp 
}) => {
  const { 
    userRole, 
    childProfile,
    caregiverResponses,
    addCaregiverResponse,
    deleteCaregiverResponse
  } = useApp();
  const isCaregiverOnly = userRole === 'caregiver';

  const [typedAlertReply, setTypedAlertReply] = useState('');
  const [showAddQuickReply, setShowAddQuickReply] = useState(false);
  const [newReplyLabel, setNewReplyLabel] = useState('');
  const [newReplyText, setNewReplyText] = useState('');

  const [code, setCode] = useState<string>(() => {
    if (initialCode) return initialCode.trim().toUpperCase();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramCode = urlParams.get('code');
      if (paramCode) return paramCode.trim().toUpperCase();
    }
    return getPairingCode();
  });

  const [inputCode, setInputCode] = useState(code);
  const [status, setStatus] = useState<CaregiverChildStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [senderName, setSenderName] = useState('Parent');
  const [messageSentNotice, setMessageSentNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const childName =
    childProfile?.name?.trim() ||
    (status?.activeAlert?.childName && status.activeAlert.childName !== 'Leo' && status.activeAlert.childName !== 'Alex' ? status.activeAlert.childName : '') ||
    (status?.childName && status.childName !== 'Leo' && status.childName !== 'Alex' ? status.childName : '') ||
    'Child';

  // Live Alert Pop-Up Modal & Device Push Notification State
  const [popupAlert, setPopupAlert] = useState<CaregiverAlert | null>(null);
  const [dismissedPopupAlertIds, setDismissedPopupAlertIds] = useState<Set<string>>(() => new Set());
  const dismissedPopupAlertIdsRef = useRef(dismissedPopupAlertIds);
  dismissedPopupAlertIdsRef.current = dismissedPopupAlertIds;
  const [deviceNotificationStatus, setDeviceNotificationStatus] = useState<string>(() => pushNotificationService.getPermissionStatus());
  
  // Add child flow (Caregiver creates child profile and gets QR/Pairing code)
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('10');
  const [createdSession, setCreatedSession] = useState<TemporaryPairingSession | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const loadStatus = async (targetCode: string) => {
    setLoading(true);
    const data = await fetchCaregiverSession(targetCode);
    if (data) {
      setStatus(data);
      setLastUpdated(new Date());

      if (data.activeAlert && (data.activeAlert.status === 'active' || !data.activeAlert.status)) {
        const alertData: CaregiverAlert = {
          ...data.activeAlert,
          status: data.activeAlert.status || 'active',
          timestamp: data.activeAlert.timestamp || new Date().toISOString(),
        };
        if (!dismissedPopupAlertIdsRef.current.has(alertData.id)) {
          setPopupAlert((existing) => (existing?.id === alertData.id ? existing : alertData));
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus(code);
    subscribeToCloudChannel(code);
    setDeviceNotificationStatus(pushNotificationService.getPermissionStatus());

    const sendPing = () => {
      sendHeartbeat({
        role: 'caregiver',
        name: senderName || 'Caregiver',
        pairingCode: code,
      });
    };

    sendPing();
    const interval = setInterval(() => {
      loadStatus(code);
      sendPing();
    }, 3500);

    // Instant notification on urgent alert broadcast
    const unsubAlert = onCaregiverAlert((alert) => {
      if (alert) {
        const fullAlert: CaregiverAlert = {
          ...alert,
          status: alert.status || 'active',
          timestamp: alert.timestamp || new Date().toISOString(),
        };
        setPopupAlert(fullAlert);
        playChime('alert');

        // Fire native device push notification with vibration & sound
        pushNotificationService.triggerAlertNotification({
          title: `BeeYou Alert: ${fullAlert.childName || childName || 'Child'}`,
          body: `${fullAlert.label}: ${fullAlert.note || 'Help requested'}${fullAlert.location ? ` • At ${fullAlert.location}` : ''}`,
          priority: 'emergency',
          tag: 'beeyou-live-alert-' + fullAlert.id,
        });

        loadStatus(code);
      }
    });

    const unsubResolve = onCaregiverAlertResolve(() => {
      setPopupAlert(null);
      loadStatus(code);
    });

    return () => {
      clearInterval(interval);
      unsubAlert();
      unsubResolve();
    };
  }, [code, senderName, childName]);

  const handleEnableDeviceAlerts = async () => {
    const perm = await pushNotificationService.requestPermission();
    setDeviceNotificationStatus(perm);
    if (perm === 'granted') {
      setMessageSentNotice('Device alerts and sound enabled!');
      setTimeout(() => setMessageSentNotice(null), 3500);
      pushNotificationService.sendTestNotification(childName);
    }
  };

  const handleTestDeviceAlert = async () => {
    playChime('alert');
    const sent = await pushNotificationService.sendTestNotification(childName);
    if (sent) {
      setMessageSentNotice('Sent test alert notification to your device!');
    } else {
      setMessageSentNotice('Notification permission required. Tap "Enable Alerts".');
    }
    setTimeout(() => setMessageSentNotice(null), 3500);
  };

  const handleSendTextResponse = async (text: string, responseId: string = 'custom_typed') => {
    playChime('star');
    const alertId = status?.activeAlert?.id;

    if (status?.activeAlert && alertId) {
      await acknowledgeCaregiverAlert(code, senderName, text, responseId as any, alertId);
      await sendCaregiverMessage(code, text, senderName, '', responseId as any, 'caregiver');
      setStatus((prev) => prev ? ({
        ...prev,
        activeAlert: prev.activeAlert ? {
          ...prev.activeAlert,
          status: 'acknowledged',
          responseMessage: text,
          acknowledgedBy: senderName,
        } : null,
      }) : null);
    } else {
      await sendCaregiverMessage(code, text, senderName, '', responseId as any, 'caregiver');
    }

    setMessageSentNotice(`Sent response to ${childName}: "${text}"`);
    setTimeout(() => setMessageSentNotice(null), 4000);
  };

  const handleSendPredefinedResponse = async (item: typeof PREDEFINED_RESPONSES[0]) => {
    await handleSendTextResponse(item.text, item.id);
  };

  const handleResolveAlert = async () => {
    playChime('tap');
    const alertId = status?.activeAlert?.id;
    await resolveCaregiverAlert(code, alertId);
    setStatus((prev) => prev ? ({
      ...prev,
      activeAlert: null,
      quickAlert: null,
    }) : null);
    setMessageSentNotice('Alert marked resolved and cleared.');
    setTimeout(() => setMessageSentNotice(null), 4000);
  };

  const handleConnectCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().toUpperCase();
    setCode(clean);
    setPairingCode(clean);
    loadStatus(clean);
  };

  const handleCreateChildProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    setCreateLoading(true);
    const session = await createTemporaryPairingSession({
      initiatedBy: 'caregiver',
      childName: newChildName.trim(),
      childAge: Number(newChildAge) || 10,
      ageGroup: Number(newChildAge) >= 18 ? 'adult' : Number(newChildAge) >= 12 ? 'teen' : 'kid',
      caregiverName: senderName,
    });
    setCreatedSession(session);
    setCreateLoading(false);
    playChime('complete');
  };

  const handleUnlinkChild = async () => {
    if (window.confirm(`Unlink ${childName}'s device? Remote updates will stop.`)) {
      await unlinkDeviceSession(code);
      setStatus(null);
      playChime('tap');
      setMessageSentNotice('Device unlinked.');
    }
  };

  // Helper for emotion display (clean Lucide icons, 100% free of emojis)
  const getEmotionBadge = (mood: string | null | undefined) => {
    switch (mood) {
      case 'happy': return { label: 'Happy', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'calm': return { label: 'Calm & Steady', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'need_help': return { label: 'Needs Help', color: 'bg-rose-100 text-rose-950 border-rose-300' };
      case 'overwhelmed': return { label: 'Overwhelmed', color: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'need_break': return { label: 'Taking a Break', color: 'bg-teal-100 text-teal-950 border-teal-300' };
      case 'want_to_talk': return { label: 'Wants to Talk', color: 'bg-blue-100 text-blue-950 border-blue-300' };
      case 'im_okay': return { label: 'Feeling Okay', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      default: return { label: 'Active', color: 'bg-amber-100 text-amber-950 border-amber-300' };
    }
  };

  const badge = getEmotionBadge(status?.currentMood);
  const childPhone = status?.caregiverPhone;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 pb-20 flex flex-col">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-5 pb-4 sm:pb-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToApp && !isCaregiverOnly && (
              <button
                type="button"
                aria-label="Back to main app dashboard"
                onClick={onBackToApp}
                className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                title="Back to App"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">BeeYou Caregiver Portal</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{childName}'s Support Hub</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Connected</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deviceNotificationStatus !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnableDeviceAlerts}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title="Enable push notifications and audible alert banners on this device"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Enable Device Alerts</span>
                <span className="sm:hidden">Alerts</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestDeviceAlert}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title="Device notifications active. Tap to test vibration, sound, and notification banner."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">Alerts Active</span>
              </button>
            )}
            <ContextualHelpButton topic="all" label="How It Works" variant="pill" className="bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700" />
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition flex items-center justify-center"
            >
              <span>Add Someone</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-5 space-y-5 flex-1">
        
        {/* Notification Toast */}
        {messageSentNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
            <div>
              <span>{messageSentNotice}</span>
            </div>
          </div>
        )}

        {/* 1. URGENT ALERT BANNER (If active alert from child) */}
        {status?.activeAlert && (status.activeAlert.status === 'active' || !status.activeAlert.status) && (
          <div className="p-5 rounded-3xl bg-rose-50 border-3 border-rose-400 shadow-md animate-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Incoming Alert from {childName}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  "{status.activeAlert.label}"
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-rose-800 font-bold bg-rose-200/80 px-3 py-1 rounded-full">
                  {status.activeAlert.location ? `At ${status.activeAlert.location}` : 'Live Alert'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (status?.activeAlert) {
                      setPopupAlert({
                        ...status.activeAlert,
                        status: status.activeAlert.status || 'active',
                        timestamp: status.activeAlert.timestamp || new Date().toISOString(),
                      });
                    }
                  }}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-2xs active:scale-95 transition flex items-center justify-center"
                >
                  <span>Reply in Pop-Up</span>
                </button>
                <button
                  type="button"
                  onClick={handleResolveAlert}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 cursor-pointer shadow-2xs active:scale-95 transition"
                >
                  Resolve
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600 block">
                  Quick Reply to {childName}:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuickReply(!showAddQuickReply);
                    setNewReplyLabel('');
                    setNewReplyText('');
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center justify-center cursor-pointer transition active:scale-95 shadow-2xs"
                >
                  <span>Add quick reply</span>
                </button>
              </div>

              {/* 1-Tap Predefined Responses */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {PREDEFINED_RESPONSES.map((resp) => (
                  <button
                    key={resp.id}
                    type="button"
                    onClick={() => handleSendPredefinedResponse(resp)}
                    className="p-2.5 rounded-xl bg-white border-2 border-rose-300 hover:bg-rose-100 text-slate-900 font-bold text-xs flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span>{resp.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Quick Replies */}
              {caregiverResponses.filter((r) => r.isCustom).length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {caregiverResponses.filter((r) => r.isCustom).map((customResp) => (
                    <div key={customResp.id} className="inline-flex items-center bg-white hover:bg-amber-50 border border-amber-300 rounded-xl shadow-2xs overflow-hidden transition">
                      <button
                        type="button"
                        onClick={() => handleSendTextResponse(customResp.text, customResp.id)}
                        className="px-3 py-1.5 font-bold text-xs text-amber-950 flex items-center justify-center cursor-pointer active:scale-95"
                        title={customResp.text}
                      >
                        <span>{customResp.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCaregiverResponse(customResp.id);
                          setMessageSentNotice('Quick reply removed.');
                          setTimeout(() => setMessageSentNotice(null), 3000);
                        }}
                        className="px-1.5 py-1.5 text-amber-600 hover:text-rose-600 hover:bg-rose-50 border-l border-amber-200 cursor-pointer transition"
                        title="Delete quick reply"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Quick Reply Panel */}
              {showAddQuickReply && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">
                      <span>New Custom Quick Reply</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddQuickReply(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Button Short Label
                      </label>
                      <input
                        type="text"
                        value={newReplyLabel}
                        onChange={(e) => setNewReplyLabel(e.target.value)}
                        placeholder="e.g. 10 Minutes, On The Porch"
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Spoken Message (Sent to Child)
                      </label>
                      <input
                        type="text"
                        value={newReplyText}
                        onChange={(e) => setNewReplyText(e.target.value)}
                        placeholder="e.g. I am 10 minutes away, stay calm."
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddQuickReply(false)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newReplyLabel.trim()}
                      onClick={() => {
                        if (!newReplyLabel.trim()) return;
                        addCaregiverResponse({
                          label: newReplyLabel.trim(),
                          text: (newReplyText.trim() || newReplyLabel.trim()),
                          emoji: '',
                          isCustom: true,
                        });
                        setMessageSentNotice('New quick reply added.');
                        setTimeout(() => setMessageSentNotice(null), 3000);
                        setNewReplyLabel('');
                        setNewReplyText('');
                        setShowAddQuickReply(false);
                        playChime('complete');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
                    >
                      Save Quick Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Type Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!typedAlertReply.trim()) return;
                  handleSendTextResponse(typedAlertReply.trim(), 'custom_typed');
                  setTypedAlertReply('');
                }}
                className="flex items-center gap-2 pt-2 border-t border-rose-200"
              >
                <input
                  type="text"
                  value={typedAlertReply}
                  onChange={(e) => setTypedAlertReply(e.target.value)}
                  placeholder={`Type a reply to ${childName}...`}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-rose-200 bg-white focus:bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-rose-300 font-medium transition"
                />
                <button
                  type="submit"
                  disabled={!typedAlertReply.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 1b. ACKNOWLEDGED REASSURANCE BANNER */}
        {status?.activeAlert && status.activeAlert.status === 'acknowledged' && (
          <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Reassurance Sent to {childName}: "{status.activeAlert.responseMessage || "I'm here for you."}"
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Alert: "{status.activeAlert.label}" • Notified on screen
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResolveAlert}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-2xs active:scale-95 transition flex items-center gap-1"
              >
                <span>Mark Resolved &amp; Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. LIVE STATUS CARD */}
        <div className="bg-white rounded-3xl p-5 border-2 border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Status</span>
              <h2 className="text-base font-bold text-slate-900">{childName} is {status?.currentActivity || 'In BeeYou'}</h2>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Quick Predefined Reassurance Response Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Send 1-Tap Predefined Response:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PREDEFINED_RESPONSES.map((resp) => (
                <button
                  key={resp.id}
                  type="button"
                  onClick={() => handleSendPredefinedResponse(resp)}
                  className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 text-slate-800 font-bold text-xs flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>{resp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native Call & Text shortcuts if phone is saved */}
          {childPhone && (
            <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-700 font-medium">
                Direct Contact ({childPhone})
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => launchNativePhoneCall(childPhone)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <span>Call Native</span>
                </button>
                <button
                  type="button"
                  onClick={() => launchNativeSms(childPhone, `Hi ${childName}, checking in on you!`)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <span>Text SMS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. DEVICE & PAIRING MANAGEMENT */}
        <div className="bg-white rounded-3xl p-5 border-2 border-stone-200/90 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              <span>Device Connection &amp; Code</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Pairing Code: {code}
            </span>
          </div>

          <form onSubmit={handleConnectCode} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter device pairing code"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-xs uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Switch Device
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Last synced: {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            <button
              type="button"
              onClick={handleUnlinkChild}
              className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
            >
              Unlink this device
            </button>
          </div>
        </div>

      </main>

      {/* MODAL: ADD SOMEONE (FLOW B: Caregiver initiates pairing code & QR) */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-amber-200 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BeeMascot size="xs" pose="happy" />
                <span>Add Someone You Care For</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddChildModal(false);
                  setCreatedSession(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!createdSession ? (
              <form onSubmit={handleCreateChildProfile} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Name or Nickname:
                  </label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="e.g. Emma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Age (Optional):
                  </label>
                  <input
                    type="number"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-sm"
                  />
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  We will generate a single-use pairing code and QR code to scan on their iPad, iPhone, or computer.
                </p>

                <button
                  type="submit"
                  disabled={createLoading || !newChildName.trim()}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
                >
                  {createLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Generate Pairing Code &amp; QR</span>
                </button>
              </form>
            ) : (
              <div className="text-center space-y-3.5 animate-in zoom-in-95">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                  Ready to Connect: {createdSession.childName}
                </span>

                <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Single-Use Pairing Code:</span>
                  <span className="text-3xl font-mono font-bold tracking-widest text-slate-900 block mt-1 select-all">
                    {createdSession.pairingCode}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-2">
                  <QRCodeView value={createdSession.pairingCode} size={150} />
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  On {createdSession.childName}'s device, select <strong>"Connect to caregiver"</strong> and enter this code or scan the QR code.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setCode(createdSession.pairingCode);
                    setPairingCode(createdSession.pairingCode);
                    setShowAddChildModal(false);
                    setCreatedSession(null);
                    loadStatus(createdSession.pairingCode);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Incoming Alert Pop-Up Modal with Quick & Custom Reply */}
      <CaregiverIncomingAlertModal
        isOpen={!!popupAlert}
        alert={popupAlert}
        childName={popupAlert?.childName || childName || 'Child'}
        customResponses={caregiverResponses}
        onClose={() => {
          if (popupAlert) {
            setDismissedPopupAlertIds((prev) => new Set(prev).add(popupAlert.id));
          }
          setPopupAlert(null);
        }}
        onResolve={async () => {
          await handleResolveAlert();
          setPopupAlert(null);
        }}
        onReply={async (_alertId, text, responseId) => {
          await handleSendTextResponse(text, responseId || 'custom_typed');
          setPopupAlert(null);
        }}
      />

    </div>
  );
};
