import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Heart, 
  CheckCircle2, 
  Volume2, 
  ShieldAlert, 
  Wind,
  School,
  Activity,
  Bus,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  Loader2,
  Check,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  sendCaregiverAlert, 
  sendCaregiverMessage,
  onCaregiverAlertAck,
  onCaregiverAlertResolve,
  launchNativePhoneCall,
  launchNativeSms,
  getPairingCode
} from '../services/caregiverSync';
import { playChime } from '../utils/audio';
import { PredefinedAlertId, PredefinedCaregiverResponseId } from '../types';
import { BeeMascot } from './BeeYouLogo';
import { ContextualHelpButton } from './ContextualHelpButton';

interface CaregiverAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PredefinedAlertChoice {
  id: PredefinedAlertId;
  label: string;
  sublabel: string;
  emoji: string;
  colorClass: string;
  borderClass: string;
  ttsAnnouncement: string;
}

const DEFAULT_QUICK_ALERTS: PredefinedAlertChoice[] = [
  {
    id: 'need_help',
    label: 'I Need Help',
    sublabel: 'I need adult assistance right now',
    emoji: '🆘',
    colorClass: 'text-rose-900',
    borderClass: 'border-rose-300 hover:border-rose-500 bg-rose-50 hover:bg-rose-100',
    ttsAnnouncement: 'I sent an alert asking for help right now.',
  },
  {
    id: 'overwhelmed',
    label: "I'm Overwhelmed",
    sublabel: 'Sensory overload, too loud or bright',
    emoji: '😣',
    colorClass: 'text-amber-900',
    borderClass: 'border-amber-300 hover:border-amber-500 bg-amber-50 hover:bg-amber-100',
    ttsAnnouncement: 'I sent an alert that I feel overwhelmed.',
  },
  {
    id: 'need_break',
    label: 'I Need a Break',
    sublabel: 'Pause from activity or noise',
    emoji: '🧘',
    colorClass: 'text-teal-900',
    borderClass: 'border-teal-300 hover:border-teal-500 bg-teal-50 hover:bg-teal-100',
    ttsAnnouncement: 'I sent an alert that I need a calm break.',
  },
  {
    id: 'love_hug',
    label: 'Send Love / Hug',
    sublabel: 'Thinking of you and safe',
    emoji: '❤️',
    colorClass: 'text-emerald-900',
    borderClass: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50 hover:bg-emerald-100',
    ttsAnnouncement: 'I sent a loving check-in to my caregiver.',
  },
  {
    id: 'pickup_ready',
    label: 'Ready for Pickup / Home',
    sublabel: 'Ready to be picked up or go home',
    emoji: '🚗',
    colorClass: 'text-indigo-900',
    borderClass: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100',
    ttsAnnouncement: 'I sent an alert that I am ready to go home.',
  },
  {
    id: 'hungry_thirsty',
    label: 'Hungry / Thirsty',
    sublabel: 'Need snack, meal or water',
    emoji: '🥪',
    colorClass: 'text-orange-900',
    borderClass: 'border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100',
    ttsAnnouncement: 'I sent an alert that I need food or water.',
  },
  {
    id: 'restroom',
    label: 'Need Restroom',
    sublabel: 'Need to use the bathroom',
    emoji: '🚽',
    colorClass: 'text-sky-900',
    borderClass: 'border-sky-300 hover:border-sky-500 bg-sky-50 hover:bg-sky-100',
    ttsAnnouncement: 'I sent an alert that I need the restroom.',
  },
  {
    id: 'task_done',
    label: 'Finished My Task! ⭐',
    sublabel: 'Done with my routine or schedule',
    emoji: '✅',
    colorClass: 'text-purple-900',
    borderClass: 'border-purple-300 hover:border-purple-500 bg-purple-50 hover:bg-purple-100',
    ttsAnnouncement: 'I sent an alert that I completed my task.',
  },
];

export const CaregiverAlertModal: React.FC<CaregiverAlertModalProps> = ({ isOpen, onClose }) => {
  const { childProfile, speak, emergencyContact, userAgeGroup, settings } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<'school' | 'therapy' | 'bus' | 'home' | 'other'>('school');
  const [customText, setCustomText] = useState('');
  const [sentAlert, setSentAlert] = useState<{
    alertId: string;
    label: string;
    emoji: string;
    time: string;
    location: string;
  } | null>(null);
  
  const [deliveryStage, setDeliveryStage] = useState<'idle' | 'sending' | 'delivered' | 'acknowledged'>('idle');
  const [caregiverResponse, setCaregiverResponse] = useState<{
    text: string;
    responseId?: PredefinedCaregiverResponseId;
    by: string;
  } | null>(null);

  const [breathingStep, setBreathingStep] = useState<'Inhale slowly...' | 'Hold gently...' | 'Exhale softly...'>('Inhale slowly...');

  const isAdult = userAgeGroup === 'adult';
  const activePhone = emergencyContact?.phone;

  useEffect(() => {
    if (!isOpen) return;
    try {
      const activeRaw = localStorage.getItem('beeyou_active_caregiver_alert');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active && active.status === 'active') {
          const timeStr = active.timestamp ? new Date(active.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
          setSentAlert({
            alertId: active.alertId || active.id,
            label: active.label || 'Needs Support',
            emoji: active.emoji || '🚨',
            time: timeStr,
            location: active.location || 'school',
          });
          setDeliveryStage('delivered');
        }
      }
    } catch {}
  }, [isOpen]);

  const acknowledgedAlertKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubResolve = onCaregiverAlertResolve(() => {
      handleReset();
      onClose();
    });
    return () => unsubResolve();
  }, [onClose]);

  useEffect(() => {
    if (!sentAlert) return;

    const interval = setInterval(() => {
      setBreathingStep((prev) => {
        if (prev === 'Inhale slowly...') return 'Hold gently...';
        if (prev === 'Hold gently...') return 'Exhale softly...';
        return 'Inhale slowly...';
      });
    }, 4000);

    const unsubAck = onCaregiverAlertAck((ack) => {
      const ackKey = `${ack.alertId || ''}:${ack.responseMessage || ''}`;
      if (acknowledgedAlertKeysRef.current.has(ackKey)) return;
      acknowledgedAlertKeysRef.current.add(ackKey);

      if (settings?.soundAlerts !== false) {
        playChime('star');
      }
      if (settings?.vibrationAlerts !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const text = ack.responseMessage || 'Response received.';
      setCaregiverResponse({
        text,
        responseId: ack.responseId,
        by: ack.by,
      });
      setDeliveryStage('acknowledged');
    });

    return () => {
      clearInterval(interval);
      unsubAck();
    };
  }, [sentAlert, speak, settings]);

  if (!isOpen) return null;

  const handleSendAlert = async (choice: PredefinedAlertChoice) => {
    if (settings?.soundAlerts !== false) {
      playChime('complete');
    }
    if (settings?.vibrationAlerts !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(150);
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setDeliveryStage('sending');
    setSentAlert({
      alertId: choice.id,
      label: choice.label,
      emoji: choice.emoji,
      time: timeStr,
      location: selectedLocation,
    });

    const alertUid = 'alert-' + Date.now();
    await sendCaregiverAlert({
      id: alertUid,
      childName: childProfile.name || 'Leo',
      emotion: choice.id as any,
      alertId: choice.id,
      label: choice.label,
      emoji: choice.emoji,
      location: selectedLocation,
      note: '',
    });
    setDeliveryStage('delivered');

    if (settings?.spokenAlerts !== false) {
      speak(`Alert sent to your caregiver. You are safe. Take a slow breath.`);
    }
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    playChime('complete');
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const code = getPairingCode();

    setDeliveryStage('sending');
    setSentAlert({
      alertId: 'custom-note',
      label: customText.trim(),
      emoji: '💬',
      time: timeStr,
      location: selectedLocation,
    });

    await sendCaregiverMessage(code, customText.trim(), childProfile.name || 'Child', '💬');
    setDeliveryStage('delivered');
    setCustomText('');

    if (settings?.spokenAlerts !== false) {
      speak(`Note sent to caregiver.`);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setSentAlert(null);
    setCaregiverResponse(null);
    setDeliveryStage('idle');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-[#FAF8F5] p-4 sm:p-6 shadow-2xl border-2 border-amber-300 text-slate-800 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-300 animate-pulse text-2xl">
              🚨
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{isAdult ? 'Support Alert & Quick Check-in' : 'Alert / Message Caregiver'}</span>
                <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Sync 🟢
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Tap once to notify your {isAdult ? 'trusted contact' : 'caregiver'} instantly
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2.5 rounded-2xl hover:bg-stone-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {sentAlert ? (
            /* Sent State & Waiting Reassurance */
            <div className="space-y-4 animate-in zoom-in-95">
              
              {/* Delivery Progress Bar */}
              <div className="p-4 rounded-3xl bg-white border-2 border-amber-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-500 uppercase tracking-wider">
                    📡 Live Delivery Status:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 ${
                    deliveryStage === 'sending' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                    deliveryStage === 'delivered' ? 'bg-blue-100 text-blue-900' :
                    'bg-emerald-100 text-emerald-900'
                  }`}>
                    {deliveryStage === 'sending' && <><span>⏳</span><span>1. Sending to Cloud...</span></>}
                    {deliveryStage === 'delivered' && <><span>📱</span><span>2. Delivered to Caregiver</span></>}
                    {deliveryStage === 'acknowledged' && <><span>❤️</span><span>3. Acknowledged by Caregiver!</span></>}
                  </span>
                </div>

                <div className="relative flex items-center justify-between px-4 py-1">
                  <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-500 transition-all duration-700 rounded-full"
                      style={{
                        width: deliveryStage === 'sending' ? '25%' : deliveryStage === 'delivered' ? '65%' : '100%'
                      }}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'sending' ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
                    }`}>
                      {deliveryStage === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Sending</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'delivered' ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse' :
                      deliveryStage === 'acknowledged' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Delivered</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'acknowledged' ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Replied ❤️</span>
                  </div>
                </div>
              </div>

              {/* Delivery Banner */}
              <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0 text-2xl">
                    {sentAlert.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sent at {sentAlert.time}</span>
                    </div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      "{sentAlert.label}"
                    </div>
                    <div className="text-xs text-emerald-800 font-medium">
                      Location Tag: <strong className="capitalize">{sentAlert.location}</strong>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black shrink-0">
                  Delivered ✓
                </div>
              </div>

              {/* Caregiver Response Banner */}
              {caregiverResponse ? (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-amber-300 text-slate-900 flex items-start gap-3.5 animate-in slide-in-from-top-2 shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {caregiverResponse.responseId === 'coming' ? '🚗' : caregiverResponse.responseId === 'im_here' ? '❤️' : '👍'}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
                      Caregiver Response from {caregiverResponse.by}:
                    </span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      "{caregiverResponse.text}"
                    </p>
                    <button
                      type="button"
                      onClick={() => speak(`Message from ${caregiverResponse.by}: ${caregiverResponse.text}`)}
                      className="mt-2 text-xs font-black text-amber-800 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Response Again</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center shadow-xs">
                  <p className="text-xs sm:text-sm text-slate-600 font-bold flex items-center justify-center gap-2">
                    <BeeMascot size="xs" pose="listening" />
                    <span>Waiting for response... Your caregiver received this on their phone/hub.</span>
                  </p>
                </div>
              )}

              {/* Calming Breathing Pause */}
              <div className="p-5 rounded-3xl bg-teal-50/80 border border-teal-200 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-teal-800 uppercase tracking-wider">
                  <Wind className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>Calm &amp; Safe Breathing Pause</span>
                </div>

                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-teal-200/50 animate-ping opacity-30"></div>
                  <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex flex-col items-center justify-center font-black shadow-md shadow-teal-200/50">
                    <span className="text-lg">🌸</span>
                    <span className="text-[8px] uppercase font-black">Breathe</span>
                  </div>
                </div>

                <div className="text-sm font-black text-teal-950">
                  {breathingStep}
                </div>

                <p className="text-xs text-teal-800 font-medium">
                  You are safe, {childProfile.name}. Take your time.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 font-black text-xs sm:text-sm transition cursor-pointer"
                >
                  Send Another Message
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  Close &amp; Continue
                </button>
              </div>
            </div>
          ) : (
            /* Selection State: 1-Tap Quick Alerts & Messages */
            <div className="space-y-4">
              {/* Location Tag */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Your Current Location:</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'school', label: 'School', emoji: '🏫' },
                    { id: 'therapy', label: 'Therapy', emoji: '🩺' },
                    { id: 'bus', label: 'Transit', emoji: '🚌' },
                    { id: 'home', label: 'Home', emoji: '🏡' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.id as any);
                        playChime('tap');
                      }}
                      className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                        selectedLocation === loc.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm">{loc.emoji}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Tap Quick Action Cards */}
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Tap 1-Tap Instant Alert / Note:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEFAULT_QUICK_ALERTS.map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAlert(choice)}
                      className={`p-3.5 rounded-2xl border-2 ${choice.borderClass} text-left transition-all active:scale-95 cursor-pointer shadow-xs group flex items-center gap-3.5`}
                    >
                      <div className="text-3xl group-hover:scale-110 transition shrink-0">
                        {choice.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black ${choice.colorClass}`}>
                          {choice.label}
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5 leading-snug truncate">
                          {choice.sublabel}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-slate-400 group-hover:text-amber-600 shrink-0 shadow-2xs">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text / Message Composer */}
              <div className="pt-2 border-t border-stone-200">
                <form onSubmit={handleSendCustomMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Or type a custom note to caregiver..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* Native Calling & Texting Shortcuts */}
              {activePhone && (
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Emergency Call:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => launchNativePhoneCall(activePhone)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call {activePhone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => launchNativeSms(activePhone, `BeeYou Alert from ${childProfile.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Text SMS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
