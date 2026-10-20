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
  Star,
  Loader2,
  Check,
  Smartphone,
  MessageSquare,
  Bell,
  Home,
  LifeBuoy,
  Coffee,
  Car,
  Utensils,
  DoorClosed,
  ThumbsUp,
  Zap,
  Plus,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  Droplet,
  Moon,
  Smile,
  AlertTriangle,
  WifiOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  sendCaregiverAlert, 
  sendCaregiverMessage,
  onCaregiverAlertAck,
  onCaregiverAlertDelivered,
  onCaregiverAlertResolve,
  flushOfflineAlertQueue,
  getOfflineAlertQueue,
  launchNativePhoneCall,
  launchNativeSms,
  getPairingCode
} from '../services/caregiverSync';
import { playChime } from '../utils/audio';
import { PredefinedAlertId, PredefinedCaregiverResponseId, HelpAlertPreset, AlertDeliveryStatus } from '../types';
import { DEFAULT_HELP_ALERT_PRESETS } from '../data/defaultData';
import { BeeMascot } from './BeeYouLogo';
import { ContextualHelpButton } from './ContextualHelpButton';

interface CaregiverAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AlertIconOption {
  id: string;
  label: string;
  icon: React.ElementType;
  stickerSrc: string;
}

export const ALERT_ICON_OPTIONS: AlertIconOption[] = [
  { id: 'need_help', label: 'Help / SOS', icon: LifeBuoy, stickerSrc: '/assets/stickers/fav_help_sos.webp' },
  { id: 'overwhelmed', label: 'Sensory', icon: Zap, stickerSrc: '/assets/stickers/zap_family_demo.webp' },
  { id: 'need_break', label: 'Break', icon: Coffee, stickerSrc: '/assets/stickers/hot_cocoa.webp' },
  { id: 'love_hug', label: 'Love', icon: Heart, stickerSrc: '/assets/stickers/fav_love_heart.webp' },
  { id: 'pickup_ready', label: 'Pickup', icon: Car, stickerSrc: '/assets/stickers/car_ride.webp' },
  { id: 'hungry_thirsty', label: 'Snack', icon: Utensils, stickerSrc: '/assets/stickers/cutlery_meal.webp' },
  { id: 'restroom', label: 'Restroom', icon: DoorClosed, stickerSrc: '/assets/stickers/routine_toilet_restroom.webp' },
  { id: 'task_done', label: 'Done', icon: CheckCircle2, stickerSrc: '/assets/stickers/task_done.webp' },
  { id: 'water', label: 'Water', icon: Droplet, stickerSrc: '/assets/stickers/drink_water.webp' },
  { id: 'bedtime', label: 'Rest', icon: Moon, stickerSrc: '/assets/stickers/evening_moon.webp' },
  { id: 'medicine', label: 'Medicine', icon: ShieldAlert, stickerSrc: '/assets/stickers/alert_sos_shield.webp' },
  { id: 'star', label: 'Star', icon: Star, stickerSrc: '/assets/stickers/star_gold.webp' },
  { id: 'message', label: 'Message', icon: MessageSquare, stickerSrc: '/assets/stickers/caregiver_phone.webp' },
  { id: 'calm', label: 'Calm', icon: Smile, stickerSrc: '/assets/stickers/caregiver_heart.webp' },
];

export const getIconForAlert = (iconName?: string, id?: string) => {
  const match = ALERT_ICON_OPTIONS.find((o) => o.id === iconName || o.id === id);
  if (match) return match.icon;
  return Bell;
};

export const getStickerForAlert = (alertItem: { stickerSrc?: string; iconName?: string; id: string }) => {
  if (alertItem.stickerSrc) return alertItem.stickerSrc;
  const match = ALERT_ICON_OPTIONS.find((o) => o.id === alertItem.iconName || o.id === alertItem.id);
  if (match) return match.stickerSrc;
  return undefined;
};



export const CaregiverAlertModal: React.FC<CaregiverAlertModalProps> = ({ isOpen, onClose }) => {
  const { 
    childProfile, 
    speak, 
    emergencyContact, 
    userAgeGroup, 
    settings,
    helpAlertPresets,
    addHelpAlertPreset,
    deleteHelpAlertPreset,
    resetHelpAlertPresets
  } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<'school' | 'therapy' | 'bus' | 'home' | 'other'>('school');
  const [customText, setCustomText] = useState('');
  const [sentAlert, setSentAlert] = useState<{
    alertId: string;
    label: string;
    icon?: React.ElementType;
    stickerSrc?: string;
    time: string;
    location: string;
  } | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const [deliveryStage, setDeliveryStage] = useState<'idle' | 'sending' | 'queued_offline' | 'dispatched' | 'delivered_to_device' | 'acknowledged'>('idle');
  const [deliveredAtTime, setDeliveredAtTime] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRetryingOffline, setIsRetryingOffline] = useState(false);

  const [caregiverResponse, setCaregiverResponse] = useState<{
    text: string;
    responseId?: PredefinedCaregiverResponseId;
    by: string;
  } | null>(null);

  const [breathingStep, setBreathingStep] = useState<'Inhale slowly...' | 'Hold gently...' | 'Exhale softly...'>('Inhale slowly...');

  // 1-Tap Alerts Customization State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [newAlertLabel, setNewAlertLabel] = useState('');
  const [newAlertSublabel, setNewAlertSublabel] = useState('');
  const [newAlertPriority, setNewAlertPriority] = useState(false);
  const [newAlertIconId, setNewAlertIconId] = useState('need_help');

  const activeQuickAlerts = helpAlertPresets && helpAlertPresets.length > 0 ? helpAlertPresets : DEFAULT_HELP_ALERT_PRESETS;

  const handleDeleteAlert = (alertId: string) => {
    deleteHelpAlertPreset(alertId);
    playChime('clear');
  };

  const handleSaveNewAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAlertLabel.trim()) return;
    const selectedIconOption = ALERT_ICON_OPTIONS.find((o) => o.id === newAlertIconId) || ALERT_ICON_OPTIONS[0];
    addHelpAlertPreset({
      label: newAlertLabel.trim(),
      sublabel: newAlertSublabel.trim() || newAlertLabel.trim(),
      emoji: '',
      stickerSrc: selectedIconOption.stickerSrc,
      iconName: selectedIconOption.id,
      colorClass: 'text-[#2D241E]',
      borderClass: 'border-[#FED676] hover:border-amber-400 bg-[#FEF9EE] hover:bg-[#FDF3DE]',
      ttsAnnouncement: `I sent an alert: ${newAlertLabel.trim()}`,
      priority: newAlertPriority ? 'high' : 'medium',
      isCustom: true,
    });
    setNewAlertLabel('');
    setNewAlertSublabel('');
    setNewAlertPriority(false);
    setShowAddAlertModal(false);
    playChime('complete');
  };

  const handleResetAlerts = () => {
    resetHelpAlertPresets();
    playChime('complete');
  };

  const isAdult = userAgeGroup === 'adult';
  const activePhone = emergencyContact?.phone;

  // Restore active or unacknowledged alert from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const activeRaw = localStorage.getItem('beeyou_active_caregiver_alert');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active && (active.status === 'active' || active.status === 'acknowledged')) {
          const timeStr = active.timestamp ? new Date(active.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
          setSentAlert({
            alertId: active.alertId || active.id,
            label: active.label || 'Needs Support',
            icon: Bell,
            time: timeStr,
            location: active.location || 'school',
          });
          if (active.status === 'acknowledged') {
            setDeliveryStage('acknowledged');
            setCaregiverResponse({
              text: active.responseMessage || 'Response received.',
              responseId: active.responseId,
              by: active.acknowledgedBy || 'Caregiver',
            });
          } else if (active.deliveryStatus === 'queued_offline') {
            setDeliveryStage('queued_offline');
          } else if (active.deliveryStatus === 'delivered_to_device') {
            setDeliveryStage('delivered_to_device');
            if (active.deliveredToDeviceAt) {
              setDeliveredAtTime(new Date(active.deliveredToDeviceAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
            }
          } else {
            setDeliveryStage('dispatched');
          }
        }
      }
    } catch {}
  }, [isOpen]);

  const acknowledgedAlertKeysRef = useRef<Set<string>>(new Set());

  // Listen for alert resolved (cleared by caregiver)
  useEffect(() => {
    const unsubResolve = onCaregiverAlertResolve(() => {
      handleReset();
      onClose();
    });
    return () => unsubResolve();
  }, [onClose]);

  // Delivery confirmation listener: Caregiver device received the alert
  useEffect(() => {
    const unsubDelivered = onCaregiverAlertDelivered((deliv) => {
      if (sentAlert && (deliv.alertId === sentAlert.alertId || deliv.alertId.startsWith('alert-'))) {
        setDeliveryStage('delivered_to_device');
        setDeliveredAtTime(new Date(deliv.deliveredAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      }
    });
    return () => unsubDelivered();
  }, [sentAlert]);

  // Timer: Count elapsed seconds to detect unacknowledged condition
  useEffect(() => {
    if (!sentAlert || deliveryStage === 'acknowledged') return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sentAlert, deliveryStage]);

  // Breathing cycle & Caregiver ACK listener
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

  const handleSendAlert = async (choice: HelpAlertPreset) => {
    if (isCustomizing) return;
    if (settings?.soundAlerts !== false) {
      playChime('complete');
    }
    if (settings?.vibrationAlerts !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(150);
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const Icon = getIconForAlert(choice.iconName, choice.id);
    const stickerSrc = getStickerForAlert(choice);

    setDeliveryStage('sending');
    setSecondsElapsed(0);
    setDeliveredAtTime(null);
    setSentAlert({
      alertId: choice.id,
      label: choice.label,
      icon: Icon,
      stickerSrc: stickerSrc,
      time: timeStr,
      location: selectedLocation,
    });

    const alertUid = 'alert-' + Date.now();
    const result = await sendCaregiverAlert({
      id: alertUid,
      childName: childProfile.name || 'Child',
      emotion: choice.id as any,
      alertId: choice.id,
      label: choice.label,
      emoji: '',
      location: selectedLocation,
      note: choice.sublabel || '',
    });

    if (result.deliveryStatus === 'queued_offline') {
      setDeliveryStage('queued_offline');
    } else {
      setDeliveryStage('dispatched');
    }

    if (settings?.spokenAlerts !== false) {
      speak(choice.ttsAnnouncement || `Alert sent to your caregiver. You are safe. Take a slow breath.`);
    }
  };

  const handleRetryOfflineAlert = async () => {
    setIsRetryingOffline(true);
    try {
      await flushOfflineAlertQueue();
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setDeliveryStage('dispatched');
      }
    } finally {
      setIsRetryingOffline(false);
    }
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    playChime('complete');
    const timeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const code = getPairingCode();

    setDeliveryStage('sending');
    setSecondsElapsed(0);
    setDeliveredAtTime(null);
    setSentAlert({
      alertId: 'custom-note',
      label: customText.trim(),
      icon: MessageSquare,
      time: timeStr,
      location: selectedLocation,
    });

    await sendCaregiverMessage(code, customText.trim(), childProfile.name || 'Child', '', undefined, 'child');
    setDeliveryStage('dispatched');
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
      <div className="w-full max-w-2xl rounded-3xl bg-[#FEFDF9] p-4 sm:p-6 shadow-2xl border-2 border-amber-300 text-slate-800 max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden">
        
        {/* Header - Signature Theme Yellow */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-amber-200/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2D4] border-2 border-[#FED676] flex items-center justify-center p-1.5 shadow-2xs shrink-0">
              <img
                src="/assets/stickers/alert_sos_shield.webp"
                alt="Alert"
                className="w-9 h-9 object-contain drop-shadow-xs select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2D241E] flex items-center gap-2">
                <span>{isAdult ? 'Support Alert & Quick Check-in' : 'Alert / Message Caregiver'}</span>
                <span className="text-[10px] font-black text-amber-950 bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Sync</span>
                </span>
              </h2>
              <p className="text-xs text-[#7A4D05] font-semibold">
                Tap once to notify your {isAdult ? 'trusted contact' : 'caregiver'} instantly
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-[#2D241E] border border-amber-300/80 shadow-xs active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
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
                    Live Delivery Status:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1.5 ${
                    deliveryStage === 'queued_offline' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                    deliveryStage === 'sending' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                    deliveryStage === 'dispatched' ? 'bg-blue-100 text-blue-900' :
                    deliveryStage === 'delivered_to_device' ? 'bg-teal-100 text-teal-900' :
                    'bg-emerald-100 text-emerald-900'
                  }`}>
                    {deliveryStage === 'queued_offline' && <><span><WifiOff className="w-3.5 h-3.5 inline text-amber-700" /></span><span>⚠️ Offline • Queued on Device</span></>}
                    {deliveryStage === 'sending' && <><span><Clock className="w-3.5 h-3.5 inline" /></span><span>1. Sending to Cloud Relay...</span></>}
                    {deliveryStage === 'dispatched' && <><span><Smartphone className="w-3.5 h-3.5 inline animate-pulse" /></span><span>1. Dispatched • Awaiting Device...</span></>}
                    {deliveryStage === 'delivered_to_device' && <><span><Smartphone className="w-3.5 h-3.5 inline text-teal-600" /></span><span>2. Delivered to Caregiver's Phone {deliveredAtTime ? `(${deliveredAtTime})` : ''}</span></>}
                    {deliveryStage === 'acknowledged' && <><span><Heart className="w-3.5 h-3.5 inline text-rose-600 fill-rose-600" /></span><span>3. Caregiver Replied!</span></>}
                  </span>
                </div>

                <div className="relative flex items-center justify-between px-4 py-1">
                  <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-500 transition-all duration-700 rounded-full"
                      style={{
                        width: 
                          deliveryStage === 'queued_offline' ? '15%' :
                          deliveryStage === 'sending' ? '25%' :
                          deliveryStage === 'dispatched' ? '50%' :
                          deliveryStage === 'delivered_to_device' ? '75%' : '100%'
                      }}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'queued_offline' ? 'bg-amber-500 text-white' :
                      deliveryStage === 'sending' ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
                    }`}>
                      {deliveryStage === 'queued_offline' ? <WifiOff className="w-3.5 h-3.5" /> :
                       deliveryStage === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {deliveryStage === 'queued_offline' ? 'Queued' : 'Dispatched'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'delivered_to_device' ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse' :
                      deliveryStage === 'acknowledged' ? 'bg-emerald-600 text-white' :
                      deliveryStage === 'dispatched' ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {deliveryStage === 'delivered_to_device' || deliveryStage === 'acknowledged' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {deliveryStage === 'delivered_to_device' || deliveryStage === 'acknowledged' ? 'Delivered' : 'Waiting'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      deliveryStage === 'acknowledged' ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Replied</span>
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Offline Notice (If queued offline) */}
              {deliveryStage === 'queued_offline' && (
                <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-900">
                    <WifiOff className="w-4 h-4 text-amber-700" />
                    <span>Device Is Currently Offline</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Your alert is saved safely on this device. Once internet connection returns, it will send automatically.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRetryOfflineAlert}
                      disabled={isRetryingOffline}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isRetryingOffline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      <span>Try Sending Now</span>
                    </button>
                    {activePhone && (
                      <button
                        type="button"
                        onClick={() => launchNativePhoneCall(activePhone)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Direct Phone Call</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Unacknowledged Timeout Notice (If >30s without response and not acknowledged) */}
              {secondsElapsed >= 30 && deliveryStage !== 'acknowledged' && deliveryStage !== 'queued_offline' && (
                <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-400 text-slate-900 space-y-2 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-black text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Caregiver Has Not Responded Yet ({secondsElapsed}s)</span>
                    </div>
                    <span className="text-[10px] bg-amber-200/90 text-amber-900 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Unconfirmed
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Their phone may be asleep, offline, or set to Do Not Disturb. If you need support right now, please reach out directly:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {activePhone ? (
                      <>
                        <button
                          type="button"
                          onClick={() => launchNativePhoneCall(activePhone)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {emergencyContact?.name || 'Caregiver'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => launchNativeSms(activePhone, `BeeYou Urgent Alert: ${sentAlert.label}. Please check in.`)}
                          className="py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Text SMS</span>
                        </button>
                      </>
                    ) : (
                      <p className="text-xs font-bold text-amber-900">
                        👉 Please talk to an adult or teacher nearby for help.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Banner */}
              <div className="p-4 rounded-3xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2D4] border border-[#FED676] flex items-center justify-center p-1 font-bold shadow-xs shrink-0">
                    {sentAlert.stickerSrc ? (
                      <img src={sentAlert.stickerSrc} alt={sentAlert.label} className="w-9 h-9 object-contain drop-shadow-xs" />
                    ) : sentAlert.icon ? (
                      <sentAlert.icon className="w-6 h-6 text-amber-900" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-amber-900" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#7A4D05] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sent at {sentAlert.time}</span>
                    </div>
                    <div className="text-base font-black text-[#2D241E] mt-0.5">
                      "{sentAlert.label}"
                    </div>
                    <div className="text-xs text-[#7A4D05] font-medium">
                      Location Tag: <strong className="capitalize text-[#2D241E]">{sentAlert.location}</strong>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 border ${
                  deliveryStage === 'queued_offline' ? 'bg-amber-100 border-amber-300 text-amber-900' :
                  deliveryStage === 'sending' ? 'bg-amber-100 border-amber-300 text-amber-900' :
                  deliveryStage === 'dispatched' ? 'bg-blue-100 border-blue-300 text-blue-900' :
                  deliveryStage === 'delivered_to_device' ? 'bg-teal-100 border-teal-300 text-teal-900' :
                  'bg-emerald-100 border-emerald-300 text-emerald-900'
                }`}>
                  {deliveryStage === 'queued_offline' ? 'Queued Offline' :
                   deliveryStage === 'sending' ? 'Sending...' :
                   deliveryStage === 'dispatched' ? 'Dispatched' :
                   deliveryStage === 'delivered_to_device' ? 'Delivered to Phone' : 'Replied'}
                </div>
              </div>

              {/* Caregiver Response Banner */}
              {caregiverResponse ? (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-amber-300 text-slate-900 flex items-start gap-3.5 animate-in slide-in-from-top-2 shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF2D4] border border-[#FED676] flex items-center justify-center shrink-0 shadow-xs">
                    {caregiverResponse.responseId === 'coming' ? (
                      <Car className="w-6 h-6 text-amber-900" />
                    ) : caregiverResponse.responseId === 'im_here' ? (
                      <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                    ) : (
                      <img
                        src="/assets/stickers/caregiver_response_okay.webp"
                        alt="Caregiver Okay"
                        className="w-10 h-10 object-contain drop-shadow-xs"
                      />
                    )}
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
                    <span>
                      {deliveryStage === 'queued_offline' 
                        ? 'Waiting for internet connection to reach caregiver...'
                        : deliveryStage === 'delivered_to_device'
                        ? 'Caregiver phone received the notification! Waiting for reply...'
                        : 'Dispatched to relay. Waiting for caregiver device to connect...'}
                    </span>
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
                    <Wind className="w-5 h-5 text-white" />
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
              <div className="bg-[#FEF9EE] p-3.5 rounded-2xl border-2 border-[#FED676] shadow-2xs">
                <div className="text-xs font-black text-[#7A4D05] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>Your Current Location:</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'school', label: 'School', icon: School, stickerSrc: '/assets/stickers/school_building.webp' },
                    { id: 'therapy', label: 'Therapy', icon: Activity, stickerSrc: '/assets/stickers/therapy_brain.webp' },
                    { id: 'bus', label: 'Transit', icon: Bus, stickerSrc: '/assets/stickers/school_bus.webp' },
                    { id: 'home', label: 'Home', icon: Home, stickerSrc: '/assets/stickers/home_house.webp' },
                  ].map((loc) => {
                    const LocIcon = loc.icon;
                    const isSelected = selectedLocation === loc.id;
                    const hasSticker = loc.stickerSrc && !imgErrors[loc.id];
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc.id as any);
                          playChime('tap');
                        }}
                        className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 ${
                          isSelected
                            ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                            : 'bg-white text-slate-700 border-amber-200/80 hover:bg-amber-50/80 hover:border-amber-300'
                        }`}
                      >
                        {hasSticker ? (
                          <img
                            src={loc.stickerSrc}
                            alt={loc.label}
                            className="w-4 h-4 object-contain shrink-0"
                            onError={() => setImgErrors((prev) => ({ ...prev, [loc.id]: true }))}
                          />
                        ) : (
                          <LocIcon className="w-4 h-4 shrink-0 text-amber-800" />
                        )}
                        <span>{loc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Tap Quick Action Cards */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-black text-[#7A4D05] uppercase tracking-wider">
                    Tap 1-Tap Instant Alert / Note:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isCustomizing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowAddAlertModal(true)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Alert</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetAlerts}
                          className="px-2 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          title="Reset to default alerts"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomizing(false)}
                          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-2xs active:scale-95"
                        >
                          Done
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCustomizing(true)}
                        className="px-2.5 py-1 rounded-xl bg-[#FEF9EE] hover:bg-[#FDF3DE] text-[#7A4D05] hover:text-amber-950 border border-[#FED676] font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                        title="Customize 1-tap alerts"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                        <span>Customize</span>
                      </button>
                    )}
                  </div>
                </div>

                {isCustomizing && (
                  <div className="mb-2.5 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-2 animate-in fade-in">
                    <span className="font-semibold">
                      Customization Mode: Tap the red delete button on any alert to remove it, or click <strong>Add Alert</strong> to make a new one.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomizing(false)}
                      className="font-bold underline text-amber-900 shrink-0 cursor-pointer"
                    >
                      Done Editing
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeQuickAlerts.map((choice) => {
                    const Icon = getIconForAlert(choice.iconName, choice.id);
                    const sticker = getStickerForAlert(choice);
                    const hasSticker = sticker && !imgErrors[choice.id];
                    const isPriority = choice.priority === 'high';
                    return (
                      <div key={choice.id} className="relative group">
                        <button
                          type="button"
                          disabled={isCustomizing}
                          onClick={() => handleSendAlert(choice)}
                          className={`w-full p-3.5 rounded-2xl border-2 ${
                            choice.borderClass || 'border-[#FED676] hover:border-amber-400 bg-[#FEF9EE] hover:bg-[#FDF3DE]'
                          } text-left transition-all active:scale-[0.98] ${
                            isCustomizing
                              ? 'cursor-default ring-2 ring-amber-300/70 border-amber-400'
                              : 'cursor-pointer shadow-xs hover:shadow-md'
                          } flex items-center gap-3.5`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                            choice.iconBgClass || 'bg-amber-100/90 border border-amber-300'
                          } p-1.5`}>
                            {hasSticker ? (
                              <img
                                src={sticker}
                                alt={choice.label}
                                className="w-9 h-9 object-contain drop-shadow-xs select-none pointer-events-none"
                                onError={() => {
                                  setImgErrors((prev) => ({ ...prev, [choice.id]: true }));
                                }}
                              />
                            ) : (
                              <Icon className={`w-5 h-5 ${choice.iconColorClass || 'text-amber-900'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className={`text-sm font-black ${choice.colorClass || 'text-[#2D241E]'} flex items-center gap-1.5`}>
                              <span>{choice.label}</span>
                              {isPriority && (
                                <span className="shrink-0 text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300/80 shadow-2xs">
                                  Priority
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#7A4D05] font-semibold mt-0.5 leading-snug truncate">
                              {choice.sublabel}
                            </div>
                          </div>
                          {!isCustomizing && (
                            <div className="w-8 h-8 rounded-full bg-amber-100/90 border border-amber-300 flex items-center justify-center text-amber-900 group-hover:text-amber-950 group-hover:bg-amber-200 group-hover:scale-110 transition-all shrink-0 shadow-2xs">
                              <Send className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>

                        {/* Delete button in customize mode */}
                        {isCustomizing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAlert(choice.id);
                            }}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer z-10"
                            title={`Remove "${choice.label}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* + Add Alert Card Tile in customize mode */}
                  {isCustomizing && (
                    <button
                      type="button"
                      onClick={() => setShowAddAlertModal(true)}
                      className="p-3.5 rounded-2xl border-2 border-dashed border-amber-400/90 bg-amber-50/70 hover:bg-amber-100 text-amber-950 flex items-center justify-center gap-2.5 font-black text-xs transition cursor-pointer active:scale-95 min-h-[76px] shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-amber-900" />
                      </div>
                      <span>Add New 1-Tap Alert</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ADD 1-TAP ALERT MODAL OVERLAY */}
              {showAddAlertModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                  <div className="w-full max-w-md rounded-3xl bg-white p-5 border-2 border-amber-300 shadow-2xl space-y-4 text-slate-800">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Add New 1-Tap Alert</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Create a custom instant alert button for your child</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddAlertModal(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Alert Title
                        </label>
                        <input
                          type="text"
                          value={newAlertLabel}
                          onChange={(e) => setNewAlertLabel(e.target.value)}
                          placeholder="e.g. Need Quiet Space, Medicine Time, Tired"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-slate-900 font-bold outline-hidden focus:ring-2 focus:ring-amber-300"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Description / Sublabel
                        </label>
                        <input
                          type="text"
                          value={newAlertSublabel}
                          onChange={(e) => setNewAlertSublabel(e.target.value)}
                          placeholder="e.g. Please come to the sensory quiet room with me"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-slate-900 font-medium outline-hidden focus:ring-2 focus:ring-amber-300"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Emergency Priority</span>
                          <span className="text-[11px] text-slate-500 font-medium">Highlights with golden Priority tag</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewAlertPriority(!newAlertPriority)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                            newAlertPriority
                              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {newAlertPriority ? 'Priority' : 'Normal'}
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Select Icon / Sticker
                        </label>
                        <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1">
                          {ALERT_ICON_OPTIONS.map((opt) => {
                            const isSelected = newAlertIconId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setNewAlertIconId(opt.id)}
                                className={`p-1.5 rounded-xl border-2 flex flex-col items-center justify-center transition active:scale-95 cursor-pointer ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-100/90 shadow-2xs ring-2 ring-amber-300'
                                    : 'border-stone-200 bg-white hover:bg-stone-50'
                                }`}
                                title={opt.label}
                              >
                                <img
                                  src={opt.stickerSrc}
                                  alt=""
                                  className="w-7 h-7 object-contain drop-shadow-2xs select-none pointer-events-none"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddAlertModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newAlertLabel.trim()}
                        onClick={() => handleSaveNewAlert()}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-black text-xs shadow-xs active:scale-95 transition cursor-pointer border border-amber-600"
                      >
                        Save 1-Tap Alert
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Text / Message Composer */}
              <div className="pt-2 border-t-2 border-amber-200/80">
                <form onSubmit={handleSendCustomMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Or type a custom note to caregiver..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white border-2 border-amber-200/90 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-300 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs border border-amber-500 transition"
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

        {/* Prominent Non-Emergency Safety Disclaimer */}
        <div className="mt-3 px-3.5 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[#7A4D05] text-[11px] leading-relaxed flex items-start gap-2 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#2D241E]">Safety Notice:</strong> BeeYou is an assistive communication companion and <strong>does not guarantee emergency delivery</strong>. Alerts rely on active network connectivity and may be delayed if the caregiver's device is asleep, offline, or set to Do Not Disturb. In a life-threatening or medical emergency, always speak to an adult nearby or call emergency services (911).
          </div>
        </div>

      </div>
    </div>
  );
};
