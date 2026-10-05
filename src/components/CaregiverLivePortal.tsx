import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  RefreshCw, 
  Sparkles, 
  Smile, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  ShieldAlert,
  Phone,
  MessageCircle,
  Car,
  QrCode,
  Smartphone,
  Trash2,
  Settings,
  UserCheck
} from 'lucide-react';
import { 
  fetchCaregiverSession, 
  sendCaregiverMessage, 
  acknowledgeCaregiverAlert,
  onCaregiverAlert,
  getPairingCode,
  setPairingCode,
  unlinkDeviceSession,
  createTemporaryPairingSession,
  claimPairingSession,
  launchNativePhoneCall,
  launchNativeSms
} from '../services/caregiverSync';
import { 
  CaregiverChildStatus, 
  EmotionType, 
  CaregiverAlert, 
  PredefinedCaregiverResponseId,
  TemporaryPairingSession 
} from '../types';
import { playChime } from '../utils/audio';
import { BeeMascot, BeeYouLogo } from './BeeYouLogo';

interface CaregiverLivePortalProps {
  initialCode?: string;
  onBackToApp?: () => void;
}

const PREDEFINED_RESPONSES: Array<{
  id: PredefinedCaregiverResponseId;
  text: string;
  emoji: string;
  label: string;
}> = [
  { id: 'im_here', text: "I'm here for you ❤️", emoji: '❤️', label: "I'm here" },
  { id: 'coming', text: "I'm on my way 🚗", emoji: '🚗', label: "I'm coming" },
  { id: 'okay', text: "Okay, got your message 👍", emoji: '👍', label: "Okay" },
  { id: 'give_minutes', text: "Give me a few minutes ⏳", emoji: '⏳', label: "Give me a few minutes" },
];

export const CaregiverLivePortal: React.FC<CaregiverLivePortalProps> = ({ 
  initialCode, 
  onBackToApp 
}) => {
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
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus(code);
    // Poll every 4 seconds for live status
    const interval = setInterval(() => {
      loadStatus(code);
    }, 4000);

    // Instant notification on urgent alert broadcast
    const unsubAlert = onCaregiverAlert((alert) => {
      playChime('complete');
      loadStatus(code);
    });

    return () => {
      clearInterval(interval);
      unsubAlert();
    };
  }, [code]);

  const handleSendPredefinedResponse = async (item: typeof PREDEFINED_RESPONSES[0]) => {
    playChime('star');
    if (status?.activeAlert) {
      await acknowledgeCaregiverAlert(code, senderName, item.text, item.id);
    } else {
      await sendCaregiverMessage(code, item.text, senderName, item.emoji, item.id);
    }
    setMessageSentNotice(`Sent response to ${status?.childName || 'Child'}: "${item.text}"`);
    loadStatus(code);
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
    if (window.confirm(`Unlink ${status?.childName || 'this device'}? Remote updates will stop.`)) {
      await unlinkDeviceSession(code);
      setStatus(null);
      playChime('tap');
      setMessageSentNotice('Device unlinked.');
    }
  };

  // Helper for emotion display
  const getEmotionBadge = (mood: string | null | undefined) => {
    switch (mood) {
      case 'happy': return { label: 'Happy', emoji: '😊', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'calm': return { label: 'Calm & Steady', emoji: '😌', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'need_help': return { label: 'Needs Help', emoji: '🆘', color: 'bg-rose-100 text-rose-950 border-rose-300' };
      case 'overwhelmed': return { label: 'Overwhelmed', emoji: '😣', color: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'need_break': return { label: 'Taking a Break', emoji: '🧘', color: 'bg-teal-100 text-teal-950 border-teal-300' };
      case 'want_to_talk': return { label: 'Wants to Talk', emoji: '💬', color: 'bg-blue-100 text-blue-950 border-blue-300' };
      case 'im_okay': return { label: 'Feeling Okay', emoji: '❤️', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      default: return { label: 'Active', emoji: '🐝', color: 'bg-amber-100 text-amber-950 border-amber-300' };
    }
  };

  const badge = getEmotionBadge(status?.currentMood);
  const childPhone = status?.caregiverPhone;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 pb-20 flex flex-col">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white p-4 sm:p-5 sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Back to App"
              >
                <ArrowLeft className="w-5 h-5" />
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
                <span>{status?.childName ? `${status.childName}'s Support Hub` : 'Connected Person'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 Connected
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{messageSentNotice}</span>
            </div>
          </div>
        )}

        {/* 1. URGENT ALERT BANNER (If active alert from child) */}
        {status?.activeAlert && (
          <div className="p-5 rounded-3xl bg-rose-50 border-3 border-rose-400 shadow-md animate-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {status.activeAlert.emoji || '🚨'}
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Incoming Alert from {status.childName}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    "{status.activeAlert.label}"
                  </h3>
                </div>
              </div>
              
              <div className="text-xs text-rose-800 font-bold bg-rose-200/80 px-3 py-1 rounded-full">
                {status.activeAlert.location ? `At ${status.activeAlert.location}` : 'Live Alert'}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Tap a predefined response below to immediately notify {status.childName} on their screen:
            </p>

            {/* 1-Tap Predefined Responses */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {PREDEFINED_RESPONSES.map((resp) => (
                <button
                  key={resp.id}
                  type="button"
                  onClick={() => handleSendPredefinedResponse(resp)}
                  className="p-2.5 rounded-xl bg-white border-2 border-rose-300 hover:bg-rose-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-base">{resp.emoji}</span>
                  <span>{resp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. LIVE STATUS CARD */}
        <div className="bg-white rounded-3xl p-5 border-2 border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{badge.emoji}</span>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Current Status</span>
                <h2 className="text-base font-bold text-slate-900">{status?.childName || 'Alex'} is {status?.currentActivity || 'Active'}</h2>
              </div>
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
                  className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="text-base">{resp.emoji}</span>
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
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Native</span>
                </button>
                <button
                  type="button"
                  onClick={() => launchNativeSms(childPhone, `Hi ${status?.childName || ''}, checking in on you!`)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Text SMS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. DEVICE & PAIRING MANAGEMENT */}
        <div className="bg-white rounded-3xl p-5 border-2 border-stone-200/90 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Device Connection & Code</span>
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
                  {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
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

                <div className="w-36 h-36 bg-amber-50 p-2 mx-auto rounded-xl border-2 border-amber-300 flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-800" />
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

    </div>
  );
};
