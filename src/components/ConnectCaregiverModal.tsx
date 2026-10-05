import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  Copy, 
  Check, 
  X, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Smile, 
  MessageSquare, 
  Clock,
  Radio,
  Phone,
  MessageCircle,
  QrCode,
  Smartphone,
  UserCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getPairingCode, 
  syncChildStatusToCaregiver, 
  pollCaregiverMessages, 
  onCaregiverMessage,
  createTemporaryPairingSession,
  pollPairingSessionStatus,
  claimPairingSession,
  unlinkDeviceSession,
  launchNativePhoneCall,
  launchNativeSms,
  onDevicePairingEvent
} from '../services/caregiverSync';
import { CaregiverMessage, TemporaryPairingSession, EmergencySupportContact } from '../types';
import { BeeMascot } from './BeeYouLogo';
import { ContextualHelpButton } from './ContextualHelpButton';
import { QRCodeView } from './QRCodeView';

interface ConnectCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pair_code' | 'enter_code' | 'support_contact';
}

export const ConnectCaregiverModal: React.FC<ConnectCaregiverModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab 
}) => {
  const { 
    childProfile, 
    currentMood, 
    sentence, 
    speak,
    userAgeGroup,
    userRole,
    emergencyContact,
    setEmergencyContact,
    caregiverPermissions,
    updateCaregiverPermissions,
    linkedDeviceCode,
    setLinkedDeviceCode,
    connectionStatus,
    isCaregiverConnected,
  } = useApp();

  const isAdult = userAgeGroup === 'adult' || userRole === 'independent_adult';

  // Tabs: 'pair_code' | 'enter_code' | 'support_contact'
  const [activeTab, setActiveTab] = useState<'pair_code' | 'enter_code' | 'support_contact'>(
    initialTab || (isAdult ? 'support_contact' : 'pair_code')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [pairingCode, setPairingCode] = useState<string>(linkedDeviceCode || 'BEE-101');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<CaregiverMessage[]>([]);
  
  // Temporary session state
  const [tempSession, setTempSession] = useState<TemporaryPairingSession | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(600);
  const [showQr, setShowQr] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Enter code flow
  const [inputCode, setInputCode] = useState('');
  const [inputCaregiverName, setInputCaregiverName] = useState('Parent');
  const [inputCaregiverPhone, setInputCaregiverPhone] = useState('');
  const [inputChildName, setInputChildName] = useState(childProfile.name || 'Emma');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Adult Support Contact form
  const [contactName, setContactName] = useState(emergencyContact?.name || '');
  const [contactRelationship, setContactRelationship] = useState(emergencyContact?.relationship || 'Friend');
  const [contactPhone, setContactPhone] = useState(emergencyContact?.phone || '');
  const [contactEmail, setContactEmail] = useState(emergencyContact?.email || '');
  const [permHelp, setPermHelp] = useState(emergencyContact?.permissions?.receiveHelpAlerts ?? true);
  const [permOverwhelmed, setPermOverwhelmed] = useState(emergencyContact?.permissions?.receiveOverwhelmedAlerts ?? true);
  const [permRoutines, setPermRoutines] = useState(emergencyContact?.permissions?.receiveRoutineUpdates ?? false);
  const [permLocation, setPermLocation] = useState(emergencyContact?.permissions?.receiveLocation ?? true);

  // Initialize or generate session when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const code = getPairingCode();
    setPairingCode(code);
    setLinkedDeviceCode(code);

    // Initial sync
    syncChildStatusToCaregiver({
      childName: childProfile.name,
      currentMood,
      caregiverPhone: emergencyContact?.phone,
      userRole,
      permissions: caregiverPermissions,
    });

    // Check for messages
    pollCaregiverMessages(code).then((msgs) => {
      if (msgs.length > 0) setMessages(msgs);
    });

    // Create or refresh temporary session for Flow A
    createTemporaryPairingSession({
      initiatedBy: 'child_device',
      childName: childProfile.name,
      ageGroup: userAgeGroup,
      permissions: caregiverPermissions,
    }).then((session) => {
      setTempSession(session);
      setPairingCode(session.pairingCode);
      setLinkedDeviceCode(session.pairingCode);
    });

    // Listen for device pairing
    const unsubPairing = onDevicePairingEvent((evt) => {
      if (evt.type === 'DEVICE_PAIRED') {
        setIsConnected(true);
        playChime('complete');
        setSentSuccess('Device linked successfully to caregiver!');
      } else if (evt.type === 'DEVICE_UNLINKED') {
        setIsConnected(false);
        setSentSuccess('Device has been unlinked.');
      }
    });

    // Subscribe to live broadcast messages
    const unsubscribeMsg = onCaregiverMessage((newMsg) => {
      setMessages((prev) => [newMsg, ...prev]);
      playChime('star');
      speak(`${newMsg.senderName} says: ${newMsg.text}`);
    });

    return () => {
      unsubPairing();
      unsubscribeMsg();
    };
  }, [isOpen, childProfile.name, currentMood, userAgeGroup, userRole]);

  // Expiration countdown
  useEffect(() => {
    if (!tempSession || tempSession.status !== 'pending') return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((tempSession.expiresAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
      if (remaining <= 0) {
        setTempSession((prev) => prev ? { ...prev, status: 'expired' } : null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tempSession]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopied(true);
    playChime('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setClaimLoading(true);
    setClaimError(null);

    const cleanCode = inputCode.trim().toUpperCase();
    const isCaregiverUser = userRole === 'caregiver';

    const res = await claimPairingSession({
      pairingCode: cleanCode,
      claimerRole: isCaregiverUser ? 'caregiver' : 'child_device',
      childName: inputChildName.trim() || childProfile.name,
      ageGroup: userAgeGroup,
      caregiverName: inputCaregiverName.trim() || 'Caregiver',
      caregiverPhone: inputCaregiverPhone.trim() || undefined,
      permissions: caregiverPermissions,
    });

    setClaimLoading(false);

    if (res.success) {
      setPairingCode(cleanCode);
      setLinkedDeviceCode(cleanCode);
      setIsConnected(true);
      playChime('complete');
      setSentSuccess(`Connected successfully to ${isCaregiverUser ? `${inputChildName || 'Child'}'s Tablet` : inputCaregiverName || 'Caregiver'}! 🎉`);
      speak(`Connected successfully.`);
    } else {
      setClaimError(res.message || 'Could not connect. Please check the code and try again.');
      playChime('tap');
    }
  };

  const handleSaveSupportContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const contact: EmergencySupportContact = {
      id: emergencyContact?.id || `contact-${Date.now()}`,
      name: contactName.trim(),
      relationship: contactRelationship.trim() || 'Friend',
      phone: contactPhone.trim(),
      email: contactEmail.trim() || undefined,
      permissions: {
        receiveHelpAlerts: permHelp,
        receiveOverwhelmedAlerts: permOverwhelmed,
        receiveRoutineUpdates: permRoutines,
        receiveLocation: permLocation,
      },
    };

    setEmergencyContact(contact);
    playChime('star');
    setSentSuccess(`Saved emergency support contact: ${contact.name}! 🛡️`);
    speak(`Saved support contact ${contact.name}.`);
    setTimeout(() => setSentSuccess(null), 3500);
  };

  const handleRemoveSupportContact = () => {
    setEmergencyContact(null);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    playChime('tap');
    setSentSuccess('Support contact removed. You are using BeeYou completely independently.');
    speak(`Support contact removed.`);
    setTimeout(() => setSentSuccess(null), 3500);
  };

  const handleUnlink = async () => {
    if (window.confirm('Are you sure you want to unlink this device from the caregiver?')) {
      await unlinkDeviceSession(pairingCode);
      setIsConnected(false);
      playChime('tap');
      setSentSuccess('Device unlinked successfully.');
    }
  };

  const minutesRemaining = Math.floor(timeLeftSec / 60);
  const secondsRemaining = timeLeftSec % 60;
  const activePhone = emergencyContact?.phone || inputCaregiverPhone;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#FAF8F5] p-4 sm:p-6 shadow-2xl border-2 border-amber-200/90 text-slate-800 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold shadow-xs">
              <BeeMascot size="xs" pose="listening" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{isAdult ? 'Support & Emergency Contact' : 'Connect with Caregiver'}</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {isAdult 
                  ? 'Optional support contact for help alerts. You own your account.'
                  : 'Let your caregiver link this device to see your status & alerts.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ContextualHelpButton topic="device_connection" label="How pairing works" variant="pill" />
            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-stone-200/70 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl mt-3.5 gap-1 text-xs font-bold shrink-0">
          {!isAdult && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('pair_code')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'pair_code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pair This Device</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('enter_code')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'enter_code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>I Have a Code</span>
              </button>
            </>
          )}

          {isAdult && (
            <button
              type="button"
              onClick={() => setActiveTab('support_contact')}
              className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'support_contact'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Emergency Support Contact</span>
            </button>
          )}
        </div>

        {/* Success / Notification Banner */}
        {sentSuccess && (
          <div className="mt-3 bg-emerald-50 border border-emerald-300 text-emerald-950 p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sentSuccess}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-3.5 space-y-4 overflow-y-auto flex-1 pr-1 text-slate-800">

          {/* TAB 1: FLOW A (CHILD IPAD FIRST -> GENERATE TEMPORARY PAIRING CODE & QR) */}
          {activeTab === 'pair_code' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-3xl border-2 border-stone-200/90 shadow-xs text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                    connectionStatus.isConnected
                      ? 'text-emerald-900 bg-emerald-100 border border-emerald-300'
                      : 'text-amber-800 bg-amber-100'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${connectionStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{connectionStatus.isConnected ? `🟢 Connected with ${connectionStatus.peerName || 'Caregiver'}` : 'Temporary Pairing Session'}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {connectionStatus.isConnected ? 'Connected Caregiver Device' : 'Give this code to your caregiver:'}
                </h3>

                {/* Big Code Pill */}
                <div className="p-4 bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-2xl flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-slate-900 select-all">
                    {pairingCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 transition cursor-pointer active:scale-95 shadow-xs"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expiration Timer & Instructions */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span className="flex items-center gap-1 text-amber-800 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires in {minutesRemaining}:{String(secondsRemaining).padStart(2, '0')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQr ? 'Hide QR Code' : 'Show QR Code'}</span>
                  </button>
                </div>

                {/* QR Code SVG Display */}
                {showQr && (
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-col items-center gap-2 animate-in zoom-in-95">
                    <QRCodeView value={pairingCode} size={150} />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Point caregiver's phone camera or BeeYou app at this QR code to connect instantly.
                    </span>
                  </div>
                )}
              </div>

              {/* Native Calling & Texting Direct Access */}
              {activePhone && (
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                      📞
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Caregiver Contact</span>
                      <span className="text-[11px] text-slate-600">{activePhone}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => launchNativePhoneCall(activePhone)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => launchNativeSms(activePhone, `Hi, I am using BeeYou right now!`)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Text</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Unlink Action */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleUnlink}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                >
                  Unlink this device from caregiver
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FLOW B (CAREGIVER GAVE A PAIRING CODE -> ENTER CODE) */}
          {activeTab === 'enter_code' && (
            <form onSubmit={handleClaimCode} className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-3xl border-2 border-stone-200/90 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Enter pairing code provided by caregiver:
                </h3>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Pairing Code:
                  </label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. K7P4-92"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 font-mono font-bold text-lg text-center tracking-widest focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Caregiver Name:
                    </label>
                    <input
                      type="text"
                      value={inputCaregiverName}
                      onChange={(e) => setInputCaregiverName(e.target.value)}
                      placeholder="e.g. Mom, Dad, Coach"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Caregiver Phone (Optional):
                    </label>
                    <input
                      type="tel"
                      value={inputCaregiverPhone}
                      onChange={(e) => setInputCaregiverPhone(e.target.value)}
                      placeholder="e.g. 555-0199"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                    />
                  </div>
                </div>

                {claimError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{claimError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={claimLoading || !inputCode.trim()}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {claimLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Connect Device</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: INDEPENDENT ADULT (OPTIONAL SUPPORT / EMERGENCY CONTACT) */}
          {activeTab === 'support_contact' && (
            <form onSubmit={handleSaveSupportContact} className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-3xl border-2 border-stone-200/90 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Trusted Emergency / Support Contact</span>
                  </h3>
                  {emergencyContact && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Active Contact
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Add someone you trust (friend, partner, therapist, or support assistant). They do not control your account; they only receive the alerts you select below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Contact Name:
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Relationship:
                    </label>
                    <input
                      type="text"
                      value={contactRelationship}
                      onChange={(e) => setContactRelationship(e.target.value)}
                      placeholder="e.g. Friend, Partner, Case Manager"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Phone Number:
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +1 555-0144"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Email (Optional):
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. sarah@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Granular Permissions Checkboxes */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    What alerts can {contactName || 'this contact'} receive?
                  </span>
                  
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permHelp}
                      onChange={(e) => setPermHelp(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                    />
                    <span>☑ "I need help" quick alerts</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permOverwhelmed}
                      onChange={(e) => setPermOverwhelmed(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                    />
                    <span>☑ "I'm overwhelmed / sensory break" alerts</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permRoutines}
                      onChange={(e) => setPermRoutines(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                    />
                    <span>☐ Routine completion summaries</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permLocation}
                      onChange={(e) => setPermLocation(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                    />
                    <span>☑ Location tag with alert (e.g. Home, Work, Transit)</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Save Support Contact
                  </button>

                  {emergencyContact && (
                    <button
                      type="button"
                      onClick={handleRemoveSupportContact}
                      className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Native Calling & Texting Direct Access for Adult Contact */}
              {emergencyContact?.phone && (
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                      📞
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{emergencyContact.name} ({emergencyContact.relationship})</span>
                      <span className="text-[11px] text-slate-600">{emergencyContact.phone}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => launchNativePhoneCall(emergencyContact.phone)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => launchNativeSms(emergencyContact.phone, `Hi ${emergencyContact.name}, I am reaching out from BeeYou.`)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Text</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted &amp; private BeeYou companion link</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
