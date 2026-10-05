import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  sendCaregiverAlert, 
  onCaregiverAlertAck,
  launchNativePhoneCall,
  launchNativeSms,
  getPairingCode
} from '../services/caregiverSync';
import { PredefinedAlertId, PredefinedCaregiverResponseId } from '../types';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';

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

const PREDEFINED_ALERTS: PredefinedAlertChoice[] = [
  {
    id: 'need_help',
    label: 'I Need Help',
    sublabel: 'I need adult assistance right now',
    emoji: '🆘',
    colorClass: 'text-rose-900',
    borderClass: 'border-rose-400 hover:border-rose-500 bg-rose-50 hover:bg-rose-100',
    ttsAnnouncement: 'I sent an alert asking for help right now.',
  },
  {
    id: 'overwhelmed',
    label: "I'm Overwhelmed",
    sublabel: 'Sensory overload, too loud or too bright',
    emoji: '😣',
    colorClass: 'text-amber-900',
    borderClass: 'border-amber-400 hover:border-amber-500 bg-amber-50 hover:bg-amber-100',
    ttsAnnouncement: 'I sent an alert that I feel overwhelmed.',
  },
  {
    id: 'need_break',
    label: 'I Need a Break',
    sublabel: 'Pause from activity, class, or therapy',
    emoji: '🧘',
    colorClass: 'text-teal-900',
    borderClass: 'border-teal-400 hover:border-teal-500 bg-teal-50 hover:bg-teal-100',
    ttsAnnouncement: 'I sent an alert that I need a calm break.',
  },
  {
    id: 'want_to_talk',
    label: 'I Want to Talk',
    sublabel: 'I would like to speak with you when possible',
    emoji: '💬',
    colorClass: 'text-blue-900',
    borderClass: 'border-blue-400 hover:border-blue-500 bg-blue-50 hover:bg-blue-100',
    ttsAnnouncement: 'I sent an alert that I want to talk.',
  },
  {
    id: 'im_okay',
    label: "I'm Okay",
    sublabel: 'Just checking in to let you know I am safe',
    emoji: '❤️',
    colorClass: 'text-emerald-900',
    borderClass: 'border-emerald-400 hover:border-emerald-500 bg-emerald-50 hover:bg-emerald-100',
    ttsAnnouncement: 'I sent an alert letting my caregiver know I am okay.',
  },
];

export const CaregiverAlertModal: React.FC<CaregiverAlertModalProps> = ({ isOpen, onClose }) => {
  const { childProfile, speak, emergencyContact, userAgeGroup } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<'school' | 'therapy' | 'bus' | 'home' | 'other'>('school');
  const [sentAlert, setSentAlert] = useState<{
    alertId: PredefinedAlertId;
    label: string;
    emoji: string;
    time: string;
    location: string;
  } | null>(null);
  
  const [caregiverResponse, setCaregiverResponse] = useState<{
    text: string;
    responseId?: PredefinedCaregiverResponseId;
    by: string;
  } | null>(null);

  const [breathingStep, setBreathingStep] = useState<'Inhale slowly...' | 'Hold gently...' | 'Exhale softly...'>('Inhale slowly...');

  const isAdult = userAgeGroup === 'adult';
  const activePhone = emergencyContact?.phone;

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
      playChime('star');
      const text = ack.responseMessage || 'Response received.';
      setCaregiverResponse({
        text,
        responseId: ack.responseId,
        by: ack.by,
      });
      speak(`Message from ${ack.by}: ${text}`);
    });

    return () => {
      clearInterval(interval);
      unsubAck();
    };
  }, [sentAlert, speak]);

  if (!isOpen) return null;

  const handleSendAlert = async (choice: PredefinedAlertChoice) => {
    playChime('complete');
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setSentAlert({
      alertId: choice.id,
      label: choice.label,
      emoji: choice.emoji,
      time: timeStr,
      location: selectedLocation,
    });

    await sendCaregiverAlert({
      childName: childProfile.name,
      emotion: choice.id,
      alertId: choice.id,
      label: choice.label,
      emoji: choice.emoji,
      location: selectedLocation,
      note: `Location: ${selectedLocation}`,
    });

    speak(`Your alert was sent to your ${isAdult ? 'emergency contact' : 'caregiver'}. You are safe. Take a slow, gentle breath.`);
  };

  const handleReset = () => {
    setSentAlert(null);
    setCaregiverResponse(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#FAF8F5] p-5 sm:p-7 shadow-2xl border-2 border-amber-200/90 text-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-300 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{isAdult ? 'Support Alert & Quick Check-in' : 'Caregiver Alert'}</span>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  Instant SOS
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Tap once to notify your {isAdult ? 'trusted contact' : 'caregiver'} with your status and location
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 rounded-2xl hover:bg-stone-200/70 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {sentAlert ? (
            /* Sent State & Waiting Reassurance */
            <div className="space-y-4 animate-in zoom-in-95">
              
              {/* Delivery Banner */}
              <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1 justify-center sm:justify-start">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Delivered at {sentAlert.time}</span>
                    </div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      Alert: "{sentAlert.emoji} {sentAlert.label}"
                    </div>
                    <div className="text-xs text-emerald-800 font-medium">
                      Location: <strong className="capitalize">{sentAlert.location}</strong>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold shrink-0">
                  Delivered ✓
                </div>
              </div>

              {/* Caregiver Response Banner (Predefined Response) */}
              {caregiverResponse ? (
                <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-slate-900 flex items-start gap-3.5 animate-in slide-in-from-top-2 shadow-xs">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                    {caregiverResponse.responseId === 'coming' ? '🚗' : caregiverResponse.responseId === 'im_here' ? '❤️' : '👍'}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Response from {caregiverResponse.by}:
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      "{caregiverResponse.text}"
                    </p>
                    <button
                      type="button"
                      onClick={() => speak(`Message from ${caregiverResponse.by}: ${caregiverResponse.text}`)}
                      className="mt-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Response Again</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-xs">
                  <p className="text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5">
                    <BeeMascot size="xs" pose="listening" />
                    <span>Waiting for response... Your alert is displayed on their companion screen.</span>
                  </p>
                </div>
              )}

              {/* Calming Breathing Guidance while waiting */}
              <div className="p-5 rounded-3xl bg-teal-50/70 border border-teal-200 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                  <Wind className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>Calm & Safe Breathing Pause</span>
                </div>

                {/* Animated breathing circle */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-teal-200/50 animate-ping opacity-30"></div>
                  <div className="w-20 h-20 rounded-full bg-teal-500 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-teal-200/50 transition-all duration-1000">
                    <span className="text-xl">🌸</span>
                    <span className="text-[9px] uppercase font-bold mt-0.5">Breathe</span>
                  </div>
                </div>

                <div className="text-sm font-bold text-teal-950">
                  {breathingStep}
                </div>

                <p className="text-xs text-teal-800 font-medium max-w-sm mx-auto">
                  You are safe, {childProfile.name}. Take your time.
                </p>
              </div>

              {/* Native Calling & Texting Shortcuts */}
              {activePhone && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                  <div className="text-xs text-slate-700 font-medium">
                    Need instant contact?
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => launchNativePhoneCall(activePhone)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Native Phone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => launchNativeSms(activePhone, `BeeYou Alert: I need assistance right now.`)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-slate-800 hover:bg-stone-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Text SMS</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Send Another Status
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          ) : (
            /* Selection State: Where are you? + Predefined Alert Cards */
            <>
              {/* Where are you right now? */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Where are you right now?</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'school', label: 'School', icon: School, emoji: '🏫' },
                    { id: 'therapy', label: 'Therapy', icon: Activity, emoji: '🩺' },
                    { id: 'bus', label: 'Transit', icon: Bus, emoji: '🚌' },
                    { id: 'home', label: 'Home', icon: MapPin, emoji: '🏡' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.id as any);
                        playChime('tap');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                        selectedLocation === loc.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-base">{loc.emoji}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5 Predefined Alert Cards */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tap to send instant update:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREDEFINED_ALERTS.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSendAlert(choice)}
                      className={`p-3.5 rounded-2xl border-2 ${choice.borderClass} text-left transition-all active:scale-95 cursor-pointer shadow-xs group flex items-start gap-3`}
                    >
                      <div className="text-3xl group-hover:scale-110 transition shrink-0">
                        {choice.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold ${choice.colorClass}`}>
                          {choice.label}
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5 leading-snug">
                          {choice.sublabel}
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/90 border border-stone-300 flex items-center justify-center text-slate-400 group-hover:text-amber-700 shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Native Phone & SMS Buttons if contact is saved */}
              {activePhone && (
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Direct Native Dial:</span>
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
            </>
          )}
        </div>

      </div>
    </div>
  );
};
