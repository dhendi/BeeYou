import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Send, 
  Copy, 
  Check, 
  X, 
  Volume2, 
  Star, 
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
  Plus,
  Mail,
  Zap,
  Lock,
  Tablet,
  Bell,
  Crown,
  CheckCircle2
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
  approvePairingSession,
  rejectPairingSession,
  unlinkDeviceSession,
  launchNativePhoneCall,
  launchNativeSms,
  onDevicePairingEvent,
  extractPairingCodeFromScan
} from '../services/caregiverSync';
import { CaregiverMessage, TemporaryPairingSession, EmergencySupportContact } from '../types';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';
import { ContextualHelpButton } from './ContextualHelpButton';
import { QRCodeView } from './QRCodeView';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './ConnectionFeedbackModal';
import { FamilyAuthModal } from './FamilyAuthModal';

interface ConnectCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pair_code' | 'enter_code' | 'support_contact';
}

const CaregiverPortalPreview: React.FC<{
  childName?: string;
  onUpgrade: () => void;
}> = ({ childName = 'Child', onUpgrade }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-amber-300/80 shadow-sm space-y-4 animate-in fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider mb-1">
          <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>BeeYou Plus Feature</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Caregiver Remote Live Sync &amp; Portal
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
          Monitor your child's communication device from your own smartphone or tablet in real time.
        </p>
      </div>

      {/* Dual Device Live Preview Mock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        {/* Left Device: Child Tablet */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-600 pb-1.5 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <Tablet className="w-3.5 h-3.5 text-amber-600" />
              <span>{childName}'s Tablet</span>
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Live</span>
          </div>
          <div className="space-y-1.5 text-left">
            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-900 block">Current Routine</span>
              <span className="text-xs font-black text-slate-800">Morning Prep • Step 2 of 4</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-900 block">Spoon Energy Budget</span>
              <span className="text-xs font-black text-slate-800">8 / 10 Spoons • Calm</span>
            </div>
          </div>
        </div>

        {/* Right Device: Parent Phone */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black text-slate-600 pb-1.5 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Parent's Phone</span>
            </span>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">Synced</span>
          </div>
          <div className="space-y-1.5 text-left">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-slate-800 block">Brush Teeth Completed</span>
                <span className="text-[9px] text-slate-500">1 min ago via Live Sync</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-slate-800 block">Silent Help Alerts</span>
                <span className="text-[9px] text-slate-500">Instant notification when overwhelmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Bullet List */}
      <ul className="space-y-1.5 text-xs text-slate-700 text-left max-w-md mx-auto">
        <li className="flex items-center gap-2 font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><strong>Cross-Room Visibility</strong> — See routine steps from another room or at work.</span>
        </li>
        <li className="flex items-center gap-2 font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><strong>Instant Silent Alerts</strong> — Get notified when sensory overwhelm or a meltdown begins.</span>
        </li>
        <li className="flex items-center gap-2 font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span><strong>Instant 6-Digit Code or QR</strong> — No passwords, email signups, or accounts needed.</span>
        </li>
      </ul>

      {/* Action Upgrade Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Start 15-Day Free Trial to Link Devices</span>
        </button>
      </div>
    </div>
  );
};

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
    isPremium,
    triggerUpgrade,
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

  const [pairingCode, setPairingCode] = useState<string>(linkedDeviceCode || '');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<CaregiverMessage[]>([]);
  
  // Temporary session state
  const [tempSession, setTempSession] = useState<TemporaryPairingSession | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(900);
  const [showQr, setShowQr] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Enter code flow
  const [inputCode, setInputCode] = useState('');
  const [inputCaregiverName, setInputCaregiverName] = useState('Parent');
  const [inputCaregiverPhone, setInputCaregiverPhone] = useState('');
  const [inputChildName, setInputChildName] = useState(childProfile.name || 'Emma');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimWaitingApproval, setClaimWaitingApproval] = useState(false);
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

  // Connection feedback popup state
  const [feedbackState, setFeedbackState] = useState<ConnectionFeedbackState | null>(null);
  // Family Account Modal state
  const [showFamilyModal, setShowFamilyModal] = useState(false);

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

    // Listen for device pairing & approval requests
    const unsubPairing = onDevicePairingEvent((evt) => {
      if (evt.type === 'PAIRING_APPROVAL_REQUESTED') {
        if (evt.session) {
          setTempSession(evt.session);
          playChime('alert');
          speak(`${evt.session.requestingDeviceName || 'Caregiver'} is requesting to link with this device.`);
        }
      } else if (evt.type === 'DEVICE_PAIRED' || evt.type === 'PAIRING_APPROVED') {
        setIsConnected(true);
        setClaimWaitingApproval(false);
        setTempSession((prev) => prev ? { ...prev, status: 'paired' } : null);
        const caregiverName = evt.session?.caregiverName || 'Caregiver';
        const childName = evt.session?.childName || childProfile.name || 'Child';
        const isCaregiverUser = userRole === 'caregiver';

        setFeedbackState({
          isOpen: true,
          type: 'success',
          role: isCaregiverUser ? 'caregiver' : 'child_device',
          peerName: isCaregiverUser ? childName : caregiverName,
          pairingCode: evt.pairingCode,
        });

        if (isCaregiverUser) {
          speak(`You are connected to ${childName}`);
        } else {
          speak(`${caregiverName} is connected to your device`);
        }

        setSentSuccess(isCaregiverUser ? `Connected to ${childName}!` : `${caregiverName} is connected to your device!`);
      } else if (evt.type === 'PAIRING_REJECTED') {
        setClaimWaitingApproval(false);
        setClaimError('Pairing request was declined by the companion device.');
        playChime('tap');
      } else if (evt.type === 'DEVICE_UNLINKED') {
        setIsConnected(false);
        setSentSuccess('Device has been unlinked.');
      }
    });

    // Subscribe to live broadcast messages
    const unsubscribeMsg = onCaregiverMessage((newMsg) => {
      setMessages((prev) => [newMsg, ...prev]);
    });

    return () => {
      unsubPairing();
      unsubscribeMsg();
    };
  }, [isOpen, childProfile.name, currentMood, userAgeGroup, userRole]);

  // Expiration countdown & approval polling
  useEffect(() => {
    if (!tempSession || (tempSession.status !== 'pending' && tempSession.status !== 'awaiting_approval')) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((tempSession.expiresAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
      if (remaining <= 0) {
        setTempSession((prev) => prev ? { ...prev, status: 'expired' } : null);
      }
    }, 1000);

    // Periodic status poll in case WebSockets/SSE miss the event
    const pollTimer = setInterval(async () => {
      if (tempSession?.pairingCode) {
        const s = await pollPairingSessionStatus(tempSession.pairingCode);
        if (s && s.status === 'awaiting_approval' && tempSession.status === 'pending') {
          setTempSession(s);
          playChime('alert');
        } else if (s && s.status === 'paired' && tempSession.status !== 'paired') {
          setIsConnected(true);
          setTempSession(s);
        }
      }
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, [tempSession]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopied(true);
    playChime('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessCodeClaim = async (codeToClaim: string) => {
    const cleanCode = extractPairingCodeFromScan(codeToClaim);
    if (!cleanCode) return;

    setClaimLoading(true);
    setClaimError(null);

    const isCaregiverUser = userRole === 'caregiver';
    const targetChildName = inputChildName.trim() || childProfile.name || 'Child';
    const targetCaregiverName = inputCaregiverName.trim() || 'Caregiver';

    const res = await claimPairingSession({
      pairingCode: cleanCode,
      claimerRole: isCaregiverUser ? 'caregiver' : 'child_device',
      childName: targetChildName,
      ageGroup: userAgeGroup,
      caregiverName: targetCaregiverName,
      caregiverPhone: inputCaregiverPhone.trim() || undefined,
      permissions: caregiverPermissions,
    });

    setClaimLoading(false);

    if (res.success) {
      if (res.status === 'awaiting_approval') {
        setClaimWaitingApproval(true);
        setSentSuccess('Pairing request sent! Waiting for approval on the companion device...');
        // Poll status until host approves or rejects
        const approvalPoller = setInterval(async () => {
          const s = await pollPairingSessionStatus(cleanCode);
          if (s?.status === 'paired') {
            clearInterval(approvalPoller);
            setClaimWaitingApproval(false);
            setPairingCode(cleanCode);
            setLinkedDeviceCode(cleanCode);
            setIsConnected(true);
            playChime('complete');
            setFeedbackState({
              isOpen: true,
              type: 'success',
              role: isCaregiverUser ? 'caregiver' : 'child_device',
              peerName: isCaregiverUser ? targetChildName : targetCaregiverName,
              pairingCode: cleanCode,
            });
            setSentSuccess(`Connected successfully to ${isCaregiverUser ? `${targetChildName}'s Tablet` : targetCaregiverName}!`);
          } else if (s?.status === 'rejected') {
            clearInterval(approvalPoller);
            setClaimWaitingApproval(false);
            setClaimError('Pairing request was declined by the companion device.');
            playChime('tap');
          } else if (s?.status === 'expired') {
            clearInterval(approvalPoller);
            setClaimWaitingApproval(false);
            setClaimError('Pairing code has expired. Please ask for a new code.');
            playChime('tap');
          }
        }, 2000);
      } else {
        setPairingCode(cleanCode);
        setLinkedDeviceCode(cleanCode);
        setIsConnected(true);
        setFeedbackState({
          isOpen: true,
          type: 'success',
          role: isCaregiverUser ? 'caregiver' : 'child_device',
          peerName: isCaregiverUser ? targetChildName : targetCaregiverName,
          pairingCode: cleanCode,
        });
        if (isCaregiverUser) {
          speak(`You are connected to ${targetChildName}`);
        } else {
          speak(`${targetCaregiverName} is connected to your device`);
        }
        setSentSuccess(`Connected successfully to ${isCaregiverUser ? `${targetChildName}'s Tablet` : targetCaregiverName}!`);
      }
    } else {
      setClaimError(res.message);
      setFeedbackState({
        isOpen: true,
        type: 'failure',
        role: isCaregiverUser ? 'caregiver' : 'child_device',
        peerName: isCaregiverUser ? targetChildName : targetCaregiverName,
        errorMessage: res.message,
        pairingCode: cleanCode,
      });
    }
  };

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    await handleProcessCodeClaim(inputCode);
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
              type="button"
              aria-label="Close caregiver connect modal"
              onClick={onClose}
              className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-2xl hover:bg-stone-200/70 text-slate-400 hover:text-slate-700 transition cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* SHARED FAMILY EMAIL & DEMO ACCOUNT HERO BANNER */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-purple-500/15 border-2 border-amber-300 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-slate-900">
                  Shared Family Email (Recommended)
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase">
                  Permanent Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Only 1 email needed to link phone &amp; tablet permanently with 0 code expiry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isPremium) {
                triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.');
                return;
              }
              setShowFamilyModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Sign In / Demo</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl mt-3 gap-1 text-xs font-bold shrink-0">
          {!isAdult && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.');
                    return;
                  }
                  setActiveTab('pair_code');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'pair_code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Temporary Code / QR</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase">
                    Plus
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.');
                    return;
                  }
                  setActiveTab('enter_code');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'enter_code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Enter 6-Letter Code</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase">
                    Plus
                  </span>
                )}
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
          {activeTab === 'pair_code' && !isPremium && (
            <CaregiverPortalPreview 
              childName={childProfile?.name || 'Child'} 
              onUpgrade={() => triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.')} 
            />
          )}

          {activeTab === 'pair_code' && isPremium && (
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

                {/* Explicit Device Approval Request */}
                {tempSession?.status === 'awaiting_approval' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-2 border-amber-400 text-left space-y-3 shadow-md animate-in zoom-in-95">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                          Connection Approval Request
                        </h4>
                        <p className="text-xs text-slate-800 font-bold mt-0.5">
                          <strong>{tempSession.requestingDeviceName || 'Caregiver'}</strong> ({tempSession.requestingDeviceRole === 'caregiver' ? 'Caregiver' : 'Companion'}) is requesting to link with this device.
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      Explicit authorization from this device is required before any alerts or routines can be shared.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await approvePairingSession(tempSession.pairingCode);
                          if (result.success) {
                            playChime('complete');
                            setTempSession((prev) => prev ? { ...prev, status: 'paired' } : null);
                            setIsConnected(true);
                            setSentSuccess('Pairing approved! Device connected.');
                            speak('Pairing approved. Device connected.');
                          } else {
                            playChime('tap');
                            setSentSuccess(result.message || 'Pairing approval failed.');
                          }
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Pairing</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          playChime('tap');
                          await rejectPairingSession(tempSession.pairingCode);
                          setTempSession((prev) => prev ? { ...prev, status: 'rejected' } : null);
                          setSentSuccess('Pairing request declined.');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
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
          {activeTab === 'enter_code' && !isPremium && (
            <CaregiverPortalPreview 
              childName={childProfile?.name || 'Child'} 
              onUpgrade={() => triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.')} 
            />
          )}

          {activeTab === 'enter_code' && isPremium && (
            <div className="space-y-4 animate-in fade-in">
              <form onSubmit={handleClaimCode} className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border-2 border-stone-200/90 shadow-xs space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Enter pairing code provided by other device:
                  </h3>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Pairing Code:
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="e.g. K7P4-92"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 font-mono font-bold text-lg text-center tracking-widest focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none uppercase"
                        required
                      />
                    </div>

                    {linkedDeviceCode && (
                      <div className="pt-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Your Family Sync Code:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInputCode(linkedDeviceCode);
                            playChime('tap');
                          }}
                          className="font-mono font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Use {linkedDeviceCode}
                        </button>
                      </div>
                    )}
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
                        Child's Name:
                      </label>
                      <input
                        type="text"
                        value={inputChildName}
                        onChange={(e) => setInputChildName(e.target.value)}
                        placeholder="e.g. Alex"
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

                  {claimWaitingApproval && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                        <span>Waiting for Approval on Companion Device...</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Please tap <strong>Approve Pairing</strong> on the other device's screen to complete this connection.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setClaimWaitingApproval(false);
                          setClaimError(null);
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
                      >
                        Cancel request
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={claimLoading || claimWaitingApproval || !inputCode.trim()}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {claimLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{claimWaitingApproval ? 'Awaiting Host Approval...' : 'Connect Device'}</span>
                  </button>
                </div>
              </form>
            </div>
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
                      placeholder="e.g. Alex"
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
                      placeholder="e.g. contact@example.com"
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
                      aria-label="Remove support contact"
                      onClick={handleRemoveSupportContact}
                      className="px-3 py-2.5 min-w-[48px] min-h-[44px] flex items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer focus-visible:ring-4 focus-visible:ring-rose-400 focus-visible:outline-none"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
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

      {/* Connection Feedback Popup (Success / Failure) */}
      <ConnectionFeedbackModal
        state={feedbackState}
        onClose={() => setFeedbackState(null)}
        onRetry={() => {
          if (inputCode) handleProcessCodeClaim(inputCode);
        }}
      />

      {/* Shared Family Email & Demo Auth Modal */}
      <FamilyAuthModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        initialTab="demo"
      />
    </div>
  );
};
