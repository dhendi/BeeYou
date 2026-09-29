import React, { useState } from 'react';
import { 
  AlertCircle, 
  X, 
  Send, 
  Heart, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Coffee, 
  ShieldAlert, 
  Wind,
  School,
  Activity,
  Bus,
  MapPin,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendCaregiverAlert, onCaregiverAlertAck } from '../services/caregiverSync';
import { playChime } from '../utils/audio';

interface CaregiverAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertChoice {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
  emotion: any;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  ttsAnnouncement: string;
}

const ALERT_CHOICES: AlertChoice[] = [
  {
    id: 'help',
    label: 'I Need Help',
    sublabel: 'I need adult assistance right now',
    emoji: '🆘',
    emotion: 'need_help',
    colorClass: 'text-rose-900',
    borderClass: 'border-rose-400 hover:border-rose-500 bg-rose-50 hover:bg-rose-100',
    bgClass: 'bg-rose-500 text-white',
    ttsAnnouncement: 'I sent an alert asking for help right now.',
  },
  {
    id: 'sad',
    label: "I'm Sad / Missing You",
    sublabel: 'Feeling down, tearful, or homesick',
    emoji: '😢',
    emotion: 'sad',
    colorClass: 'text-blue-900',
    borderClass: 'border-blue-400 hover:border-blue-500 bg-blue-50 hover:bg-blue-100',
    bgClass: 'bg-blue-500 text-white',
    ttsAnnouncement: 'I sent an alert that I am feeling sad and miss you.',
  },
  {
    id: 'overwhelmed',
    label: 'Too Loud / Overwhelmed',
    sublabel: 'Sensory overload, too noisy, too bright',
    emoji: '😵‍💫',
    emotion: 'overwhelmed',
    colorClass: 'text-purple-900',
    borderClass: 'border-purple-400 hover:border-purple-500 bg-purple-50 hover:bg-purple-100',
    bgClass: 'bg-purple-500 text-white',
    ttsAnnouncement: 'I sent an alert that I feel overwhelmed and need quiet.',
  },
  {
    id: 'break',
    label: 'I Need a Break',
    sublabel: 'Pause from class, activity, or therapy',
    emoji: '☕',
    emotion: 'need_break',
    colorClass: 'text-teal-900',
    borderClass: 'border-teal-400 hover:border-teal-500 bg-teal-50 hover:bg-teal-100',
    bgClass: 'bg-teal-500 text-white',
    ttsAnnouncement: 'I sent an alert that I need a calm break.',
  },
  {
    id: 'worried',
    label: "I'm Worried / Scared",
    sublabel: 'Anxious, nervous, or uncomfortable',
    emoji: '😟',
    emotion: 'worried',
    colorClass: 'text-amber-900',
    borderClass: 'border-amber-400 hover:border-amber-500 bg-amber-50 hover:bg-amber-100',
    bgClass: 'bg-amber-500 text-white',
    ttsAnnouncement: 'I sent an alert that I feel worried and need reassurance.',
  },
  {
    id: 'comfort',
    label: 'I Want a Hug / Comfort',
    sublabel: 'Need reassuring words and love',
    emoji: '🫂',
    emotion: 'calm',
    colorClass: 'text-pink-900',
    borderClass: 'border-pink-400 hover:border-pink-500 bg-pink-50 hover:bg-pink-100',
    bgClass: 'bg-pink-500 text-white',
    ttsAnnouncement: 'I sent an alert that I need comfort and a hug.',
  },
];

export const CaregiverAlertModal: React.FC<CaregiverAlertModalProps> = ({ isOpen, onClose }) => {
  const { childProfile, speak } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<'school' | 'therapy' | 'bus' | 'home' | 'other'>('school');
  const [sentAlert, setSentAlert] = useState<{
    label: string;
    emoji: string;
    time: string;
    location: string;
  } | null>(null);
  const [caregiverResponse, setCaregiverResponse] = useState<string | null>(null);
  const [breathingStep, setBreathingStep] = useState<'Inhale slowly...' | 'Hold gently...' | 'Exhale softly...'>('Inhale slowly...');

  React.useEffect(() => {
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
      if (ack.responseMessage) {
        setCaregiverResponse(ack.responseMessage);
        speak(`Message from ${ack.by}: ${ack.responseMessage}`);
      } else {
        setCaregiverResponse(`${ack.by} saw your alert and is responding!`);
        speak(`${ack.by} saw your alert and is responding.`);
      }
    });

    return () => {
      clearInterval(interval);
      unsubAck();
    };
  }, [sentAlert]);

  if (!isOpen) return null;

  const handleSendAlert = async (choice: AlertChoice) => {
    playChime('complete');
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setSentAlert({
      label: choice.label,
      emoji: choice.emoji,
      time: timeStr,
      location: selectedLocation,
    });

    await sendCaregiverAlert({
      childName: childProfile.name,
      emotion: choice.emotion,
      label: choice.label,
      emoji: choice.emoji,
      location: selectedLocation,
      note: `Sent from Lumina Easy Alert at ${selectedLocation}`,
    });

    speak(`Your alert was sent to your caregiver. You are safe. Take a slow, gentle breath.`);
  };

  const handleReset = () => {
    setSentAlert(null);
    setCaregiverResponse(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border-4 border-rose-300 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-200 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>Caregiver Alert Button</span>
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Quick SOS
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tap once to immediately notify your caregiver with your feeling & location
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {sentAlert ? (
            /* Sent State & Waiting Reassurance */
            <div className="space-y-5 animate-in zoom-in-95">
              {/* Delivery Banner */}
              <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1 justify-center sm:justify-start">
                      <Clock className="w-3.5 h-3.5" />
                      Delivered at {sentAlert.time}
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      Alert Sent: "{sentAlert.emoji} {sentAlert.label}"
                    </div>
                    <div className="text-xs text-emerald-800 font-medium">
                      Location tagged: <strong className="capitalize">{sentAlert.location}</strong>
                    </div>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black">
                  Delivered ✅
                </div>
              </div>

              {/* Caregiver Response Banner (if received) */}
              {caregiverResponse ? (
                <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-3.5 animate-in slide-in-from-top-2">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shrink-0">
                    ❤️
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black text-rose-700 uppercase tracking-wider block">
                      Caregiver Response:
                    </span>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      "{caregiverResponse}"
                    </p>
                    <button
                      onClick={() => speak(`Message from caregiver: ${caregiverResponse}`)}
                      className="mt-2 text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Hear Message Again</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Waiting for caregiver to respond... Your alert is flashing on their companion screen.
                  </p>
                </div>
              )}

              {/* Calming Breathing Guidance while waiting */}
              <div className="p-6 rounded-3xl bg-linear-to-b from-teal-50 to-emerald-50 border border-teal-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-black text-teal-800 uppercase tracking-wider">
                  <Wind className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>Calm & Safe Breathing Pause</span>
                </div>

                {/* Animated breathing circle */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-teal-200/50 animate-ping opacity-30"></div>
                  <div className="w-24 h-24 rounded-full bg-teal-500 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-teal-200 transition-all duration-1000">
                    <span className="text-2xl">🌸</span>
                    <span className="text-[10px] uppercase font-bold mt-1">Breathe</span>
                  </div>
                </div>

                <div className="text-base font-black text-teal-950">
                  {breathingStep}
                </div>

                <p className="text-xs text-teal-800 font-medium max-w-sm mx-auto">
                  You are safe, {childProfile.name}. Your feelings are valid and help is notified.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition cursor-pointer"
                >
                  Send Another Emotion
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          ) : (
            /* Selection State: Where are you? + Giant Buttons */
            <>
              {/* Where are you right now? */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Where are you right now?</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'school', label: 'School', icon: School, emoji: '🏫' },
                    { id: 'therapy', label: 'Therapy', icon: Activity, emoji: '🩺' },
                    { id: 'bus', label: 'Bus / Van', icon: Bus, emoji: '🚌' },
                    { id: 'other', label: 'Other', icon: MapPin, emoji: '📍' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.id as any);
                        playChime('tap');
                      }}
                      className={`p-2 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                        selectedLocation === loc.id
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{loc.emoji}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Giant Alert Emotion Cards */}
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
                  Choose what you are feeling:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALERT_CHOICES.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSendAlert(choice)}
                      className={`p-4 rounded-3xl border-2 ${choice.borderClass} text-left transition-all active:scale-95 cursor-pointer shadow-xs group flex items-start gap-3.5`}
                    >
                      <div className="text-3xl sm:text-4xl group-hover:scale-110 transition shrink-0">
                        {choice.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm sm:text-base font-black ${choice.colorClass}`}>
                          {choice.label}
                        </div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5 leading-snug">
                          {choice.sublabel}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-rose-600 shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
