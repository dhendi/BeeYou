import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Star, Radio, Plus, X, MessageSquare, Send, Trash2, RotateCcw, SlidersHorizontal, Bell, Check, Smartphone, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';
import { getQuickRepliesForAlert } from '../../utils/alertResponses';
import { 
  getPairingCode, 
  acknowledgeCaregiverAlert,
  sendCaregiverMessage,
  sendTestCaregiverAlert,
  clearAlertHistory,
  resolveCaregiverAlert
} from '../../services/caregiverSync';
import { resolveEmergencyAlert } from '../../services/familySync';
import { CaregiverAlert } from '../../types';
import { ALERT_ICON_OPTIONS, getIconForAlert, getStickerForAlert } from '../CaregiverAlertModal';
import { DEFAULT_HELP_ALERT_PRESETS } from '../../data/defaultData';
import { 
  pushNotificationService, 
  getStoredLockScreenPrivacyMode, 
  setStoredLockScreenPrivacyMode 
} from '../../services/pushNotificationService';

interface CaregiverAlertsTabProps {
  activeAlerts: CaregiverAlert[];
  setActiveAlerts: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  alertHistoryList: CaregiverAlert[];
  setAlertHistoryList: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  setActiveTab: (tab: any) => void;
  showNotification: (msg: string) => void;
  onStartTour?: () => void;
  onOpenAlertPopup?: (alert: CaregiverAlert) => void;
}

export const CaregiverAlertsTab: React.FC<CaregiverAlertsTabProps> = ({
  activeAlerts,
  setActiveAlerts,
  alertHistoryList,
  setAlertHistoryList,
  setActiveTab,
  showNotification,
  onStartTour,
  onOpenAlertPopup,
}) => {
  const { 
    childProfile, 
    connectionStatus,
    caregiverResponses,
    addCaregiverResponse,
    deleteCaregiverResponse,
    helpAlertPresets,
    addHelpAlertPreset,
    deleteHelpAlertPreset,
    resetHelpAlertPresets
  } = useApp();

  const [typedAlertReplies, setTypedAlertReplies] = useState<Record<string, string>>({});
  const [showAddQuickReplyForAlertId, setShowAddQuickReplyForAlertId] = useState<string | null>(null);
  const [newReplyLabel, setNewReplyLabel] = useState('');
  const [newReplyText, setNewReplyText] = useState('');

  // Child 1-Tap Alerts Manager State
  const [showAddChildAlertModal, setShowAddChildAlertModal] = useState(false);
  const [newChildAlertLabel, setNewChildAlertLabel] = useState('');
  const [newChildAlertSublabel, setNewChildAlertSublabel] = useState('');
  const [newChildAlertPriority, setNewChildAlertPriority] = useState(false);
  const [newChildAlertIconId, setNewChildAlertIconId] = useState('need_help');

  const childQuickAlerts = helpAlertPresets && helpAlertPresets.length > 0 ? helpAlertPresets : DEFAULT_HELP_ALERT_PRESETS;
  const [deviceNotificationStatus, setDeviceNotificationStatus] = useState<string>(() => pushNotificationService.getPermissionStatus());
  const [isLockScreenPrivacy, setIsLockScreenPrivacy] = useState<boolean>(() => getStoredLockScreenPrivacyMode());

  const handleRequestDeviceNotifications = async () => {
    const granted = await pushNotificationService.requestPermission();
    setDeviceNotificationStatus(pushNotificationService.getPermissionStatus());
    if (granted) {
      showNotification(t('Device notifications enabled! Push alerts & sound are active.'));
      playChime('star');
      await pushNotificationService.sendTestNotification(childProfile.name || 'Child');
    } else {
      showNotification(t('Permission was not granted. Please check browser notification settings.'));
    }
  };

  const [delayedSeconds, setDelayedSeconds] = useState<number | null>(null);

  const handleTestLockScreenAlert = () => {
    showNotification(t('Lock your screen now! Test alert will fire in 5 seconds.'));
    playChime('tap');
    pushNotificationService.scheduleDelayedAlert(
      5,
      {
        title: `BeeYou Alert: Lock-Screen Test (${childProfile.name || 'Child'})`,
        body: t('Success! This alert woke your device screen with sound & vibration.'),
        priority: 'emergency',
        tag: 'beeyou-lock-test-' + Date.now(),
      },
      (sec) => {
        setDelayedSeconds(sec > 0 ? sec : null);
      }
    );
  };

  const handleTestDeviceAlert = async () => {
    showNotification(t('Sending test device notification...'));
    playChime('alert');
    await pushNotificationService.sendTestNotification(childProfile.name || 'Child');
  };

  const handleResolveAlert = (alertId: string) => {
    resolveEmergencyAlert(alertId, getPairingCode());
    resolveCaregiverAlert(getPairingCode(), alertId);
    acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', 'Resolved by Caregiver', 'im_here', alertId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showNotification(t('Alert marked as resolved.'));
    playChime('tap');
  };

  const handleAcknowledgeAlert = (alertId: string, replyText: string, replyId?: any) => {
    acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', replyText, replyId, alertId);
    sendCaregiverMessage(getPairingCode(), replyText, 'Caregiver', '');
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showNotification(`${t('Sent reassurance reply:')} "${replyText}"`);
    playChime('star');
  };

  const handleTriggerTestAlert = async () => {
    const testAlert = await sendTestCaregiverAlert(getPairingCode(), childProfile.name || 'Child');
    setActiveAlerts((prev) => [testAlert, ...prev]);
    pushNotificationService.triggerAlertNotification({
      title: `BeeYou Alert: Test from ${childProfile.name || 'Child'}`,
      body: `${testAlert.label}: ${testAlert.note}`,
      priority: 'emergency',
      tag: 'beeyou-alert-' + testAlert.id,
    });
    showNotification(t('Test alert dispatched to this hub!'));
    playChime('alert');
    if (onOpenAlertPopup) {
      onOpenAlertPopup(testAlert);
    }
  };

  const handleClearAlertHistory = () => {
    clearAlertHistory();
    setAlertHistoryList([]);
    showNotification(t('Alert history cleared.'));
    playChime('clear');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('Live Alerts & SOS Inbox')}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              activeAlerts.length > 0 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeAlerts.length > 0 ? `${activeAlerts.length} ${t('Active Alert')}` : t('Safe & Clear')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('Receive urgent sensory overload notices, help requests, and instant check-ins from')} {childProfile.name} {t('in real time.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onStartTour();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300"
              title={t('Tour this section')}
            >
              <span>{t('How This Works (Tour)')}</span>
            </button>
          )}
          <button
            type="button"
            data-tour="alerts-test-button"
            onClick={handleTriggerTestAlert}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs active:scale-95 transition"
          >
            <span>{t('Send Test Alert')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              playChime('tap');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
          >
            <span>{t('Back to Home')}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Connectivity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-slate-900 block">
              {t('Connection Channel:')} <span className="font-mono text-indigo-700">{getPairingCode()}</span>
            </span>
            <span className="text-slate-600 font-medium">
              {t('Status:')} {connectionStatus.isConnected ? `${t('Connected Live')} (${connectionStatus.peerName || t('Child Device')})` : t('Listening on cloud channel (ready for child alerts)')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${connectionStatus.isConnected ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-900'}`}>
            {connectionStatus.isConnected ? `● ${t('Connected')}` : t('Waiting on Child Ping')}
          </span>
        </div>
      </div>

      {/* Device Notifications Status & Permission Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs ${
        deviceNotificationStatus === 'granted'
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
            deviceNotificationStatus === 'granted'
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500 text-amber-950'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm block">
                {deviceNotificationStatus === 'granted'
                  ? t('Device Notifications & Sound: Active')
                  : t('Device Notifications & Sound: Action Needed')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                deviceNotificationStatus === 'granted'
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {deviceNotificationStatus === 'granted' ? t('Enabled') : t('Enable Now')}
              </span>
            </div>
            <p className="text-slate-600 font-medium mt-0.5">
              {deviceNotificationStatus === 'granted'
                ? `${t('Device notifications and chimes are active. To test background wake-up on locked screens, use the 5-second test below.')}`
                : `${t('Enable device push notifications and chime alerts so you can receive check-in alerts from')} ${childProfile.name}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {deviceNotificationStatus === 'granted' ? (
            <>
              <button
                type="button"
                onClick={handleTestDeviceAlert}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs cursor-pointer transition active:scale-95 shadow-2xs"
              >
                <span>{t('Test Now')}</span>
              </button>
              <button
                type="button"
                onClick={handleTestLockScreenAlert}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer transition active:scale-95 shadow-2xs flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{delayedSeconds !== null ? `${t('Lock Screen')} (${delayedSeconds}s)...` : t('Test Lock Screen (5s)')}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleRequestDeviceNotifications}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs cursor-pointer transition active:scale-95 shadow-xs border border-amber-600"
            >
              <span>{t('Enable Device Notifications')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Lock Screen Privacy Mode Card (Item 5: Protect Sensitive Previews) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {t("Lock Screen Notification Privacy Mode")}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isLockScreenPrivacy 
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {isLockScreenPrivacy ? t("Protected") : t("Off")}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                {t("Protects your child's dignity and health privacy by masking sensitive details (such as specific medication names and meltdown reasons) on lock screen previews.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextVal = !isLockScreenPrivacy;
                setIsLockScreenPrivacy(nextVal);
                setStoredLockScreenPrivacyMode(nextVal);
                playChime('tap');
                showNotification(nextVal ? t("Lock screen privacy enabled: sensitive details will be masked.") : t("Lock screen privacy disabled."));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                isLockScreenPrivacy 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              <span>{isLockScreenPrivacy ? t("Privacy Active") : t("Enable Privacy")}</span>
            </button>
          </div>
        </div>

        {/* Live Preview Display */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">{t("Lock Screen Preview:")}</span>
          <span className="italic">
            {isLockScreenPrivacy 
              ? '"BeeYou Family Alert: Assistance requested. Tap to respond securely."'
              : `"${childProfile.name || 'Child'}: Sensory Overwhelmed - Needs Break"`
            }
          </span>
        </div>
      </div>

      {/* Alert Dependability Notice & Guidelines Card */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{t('Alert Dependability & Emergency Disclaimer')}</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed font-medium">
          {t('BeeYou is an assistive communication companion and ')}<strong>{t('does not guarantee emergency notification delivery')}</strong>. {t('Notifications rely on device network access and operating system settings. Alerts cannot be guaranteed if the phone is asleep, offline, in deep battery saver mode, or set to Do Not Disturb. For critical life-safety emergencies, always maintain an in-person safety plan.')}
        </p>
        <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-amber-900">
          <span className="bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg">
            <strong>iOS tip:</strong> Add to Home Screen (PWA) &amp; exempt from Focus modes
          </span>
          <span className="bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg">
            <strong>Android tip:</strong> Set Battery Optimization to "Unrestricted"
          </span>
        </div>
      </div>

      {/* 1. Active Alerts Section */}
      <div data-tour="alerts-active-card" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <span>{t('Active Urgent Alerts')}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeAlerts.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {activeAlerts.length}
            </span>
          </h3>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
            <h4 className="text-sm font-black text-slate-800">{t('No active alerts right now')}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('When')} {childProfile.name} {t('taps the Help or Sensory Overload button on their tablet, it will instantly sound a chime and show up here with 1-tap reply options.')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerTestAlert}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-xs active:scale-95 transition"
              >
                <span>{t('Test Alert Simulation')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center p-1 shrink-0">
                      <img src="/assets/stickers/alert_sos_shield.webp" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{alert.label}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                          {t('Urgent')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {t('Sent by:')} <strong>{alert.childName}</strong> • {alert.location ? `${t('Location:')} ${alert.location}` : t('Location unknown')}
                        {alert.note && !alert.note.toLowerCase().includes('location') ? ` • "${alert.note}"` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {onOpenAlertPopup && (
                      <button
                        type="button"
                        onClick={() => onOpenAlertPopup(alert)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition"
                      >
                        <span>{t('Reply in Pop-Up')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black cursor-pointer shadow-2xs"
                    >
                      {t('Resolve')}
                    </button>
                  </div>
                </div>

                {/* Quick responses & Custom Quick Replies */}
                <div className="pt-3 border-t border-rose-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black text-rose-950 block">
                      {t('Send Immediate Reassurance to')} {alert.childName || childProfile.name}{t("'s Screen:")}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddQuickReplyForAlertId(showAddQuickReplyForAlertId === alert.id ? null : alert.id);
                        setNewReplyLabel('');
                        setNewReplyText('');
                      }}
                      className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t("Add quick reply")}</span>
                    </button>
                  </div>

                  <div data-tour="alerts-quick-reply-buttons" className="flex items-center gap-2 flex-wrap">
                    {/* Contextual quick replies */}
                    {getQuickRepliesForAlert(alert, t).map((reply) => {
                      const cleanLabel = reply.label.replace(/^[🚗❤️💖⏳🌟🎉👏👍 ]+/, '');
                      return (
                        <button
                          key={reply.id}
                          type="button"
                          onClick={() => handleAcknowledgeAlert(alert.id, reply.text, reply.id)}
                          className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center transition ${reply.className}`}
                        >
                          <span>{cleanLabel || reply.label}</span>
                        </button>
                      );
                    })}

                    {/* Custom quick replies */}
                    {caregiverResponses.filter((r) => r.isCustom).map((customResp) => (
                      <div key={customResp.id} className="inline-flex items-center bg-white hover:bg-amber-50 border border-amber-300 rounded-xl shadow-2xs overflow-hidden transition">
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeAlert(alert.id, customResp.text, customResp.id)}
                          className="px-3.5 py-2 font-black text-xs text-amber-950 flex items-center justify-center cursor-pointer active:scale-95"
                          title={customResp.text}
                        >
                          <span>{customResp.label}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCaregiverResponse(customResp.id);
                            showNotification(t("Quick reply removed."));
                          }}
                          className="px-2 py-2 text-amber-600 hover:text-rose-600 hover:bg-rose-50 border-l border-amber-200 cursor-pointer transition"
                          title={t("Delete quick reply")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Inline Add Quick Reply Panel */}
                  {showAddQuickReplyForAlertId === alert.id && (
                    <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t("New Custom Quick Reply")}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddQuickReplyForAlertId(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            {t("Button Short Label")}
                          </label>
                          <input
                            type="text"
                            value={newReplyLabel}
                            onChange={(e) => setNewReplyLabel(e.target.value)}
                            placeholder={t("e.g. 10 Minutes, On The Porch")}
                            className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            {t("Spoken Message (Sent to Child)")}
                          </label>
                          <input
                            type="text"
                            value={newReplyText}
                            onChange={(e) => setNewReplyText(e.target.value)}
                            placeholder={t("e.g. I am 10 minutes away, stay calm.")}
                            className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddQuickReplyForAlertId(null)}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                        >
                          {t("Cancel")}
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
                            showNotification(t("New quick reply added."));
                            setNewReplyLabel('');
                            setNewReplyText('');
                            setShowAddQuickReplyForAlertId(null);
                            playChime('complete');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black shadow-2xs active:scale-95 transition cursor-pointer"
                        >
                          {t("Save Quick Reply")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Direct Type Area */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = typedAlertReplies[alert.id]?.trim();
                      if (!text) return;
                      handleAcknowledgeAlert(alert.id, text, 'custom_typed');
                      setTypedAlertReplies((prev) => {
                        const next = { ...prev };
                        delete next[alert.id];
                        return next;
                      });
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-rose-200/70"
                  >
                    <input
                      type="text"
                      value={typedAlertReplies[alert.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTypedAlertReplies((prev) => ({ ...prev, [alert.id]: val }));
                      }}
                      placeholder={`${t("Type a reply to")} ${alert.childName || childProfile.name || 'Child'}...`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-rose-200 bg-white focus:bg-white text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-rose-300 font-medium transition"
                    />
                    <button
                      type="submit"
                      disabled={!typedAlertReplies[alert.id]?.trim()}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black cursor-pointer shadow-2xs active:scale-95 transition shrink-0"
                    >
                      <span>{t("Send Reply")}</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Alert History Log Section */}
      <div data-tour="alerts-history-list" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>{t('Alert History & Audit Log')}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {alertHistoryList.length} {t('Total')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('All received alerts are permanently archived here for clinical and caregiver review.')}
            </p>
          </div>

          {alertHistoryList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAlertHistory}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition"
            >
              {t('Clear History')}
            </button>
          )}
        </div>

        {alertHistoryList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
            {t('No alert history recorded yet.')}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {alertHistoryList.map((item, idx) => (
              <div key={item.id || idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{item.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        {item.location || 'Device'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.childName} • {item.note || 'Help alert'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-slate-400 text-[11px] block">
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">{t('Archived')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Child's 1-Tap Alert Buttons Manager */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>{t("Child's 1-Tap Alert Buttons")}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                {childQuickAlerts.length} {t('Active on Screen')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t("These are the instant 1-tap buttons on")} {childProfile.name}{t("'s screen. You can add custom buttons or remove ones they don't need.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetHelpAlertPresets();
                showNotification(t("Default alerts restored."));
                playChime('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition active:scale-95"
              title={t("Restore 8 default alerts")}
            >
              <span>{t("Reset Defaults")}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddChildAlertModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition"
            >
              <span>{t("Add 1-Tap Alert")}</span>
            </button>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {childQuickAlerts.map((item) => {
            const Icon = getIconForAlert(item.iconName, item.id);
            const sticker = getStickerForAlert(item);
            const isPriority = item.priority === 'high';
            return (
              <div key={item.id} className="relative p-3 rounded-2xl bg-white border-2 border-stone-200/90 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 p-1">
                  {sticker ? (
                    <img src={sticker} alt="" className="w-8 h-8 object-contain drop-shadow-2xs select-none pointer-events-none" />
                  ) : (
                    <Icon className="w-5 h-5 text-amber-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">{item.label}</span>
                    {isPriority && (
                      <span className="shrink-0 text-[8px] font-black uppercase px-1 py-0.5 rounded-full bg-amber-200 text-amber-950">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{item.sublabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    deleteHelpAlertPreset(item.id);
                    showNotification(t("1-Tap alert removed."));
                    playChime('clear');
                  }}
                  className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title={t("Remove this alert from child screen")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal to add alert from caregiver hub */}
        {showAddChildAlertModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 border-2 border-amber-300 shadow-2xl space-y-4 text-slate-800">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{t("Add New 1-Tap Alert")}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{t("Create an instant button for")} {childProfile.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddChildAlertModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t("Alert Title")}
                  </label>
                  <input
                    type="text"
                    value={newChildAlertLabel}
                    onChange={(e) => setNewChildAlertLabel(e.target.value)}
                    placeholder="e.g. Need Quiet Space, Medicine Time, Tired"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-slate-900 font-bold outline-hidden focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t("Description / Sublabel")}
                  </label>
                  <input
                    type="text"
                    value={newChildAlertSublabel}
                    onChange={(e) => setNewChildAlertSublabel(e.target.value)}
                    placeholder="e.g. Please come to the sensory quiet room with me"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-slate-900 font-medium outline-hidden focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{t("Emergency Priority")}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{t("Highlights with golden Priority tag")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewChildAlertPriority(!newChildAlertPriority)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                      newChildAlertPriority
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {newChildAlertPriority ? t('Priority') : t('Normal')}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("Select Icon / Sticker")}
                  </label>
                  <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1">
                    {ALERT_ICON_OPTIONS.map((opt) => {
                      const isSelected = newChildAlertIconId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setNewChildAlertIconId(opt.id)}
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
                  onClick={() => setShowAddChildAlertModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  disabled={!newChildAlertLabel.trim()}
                  onClick={() => {
                    if (!newChildAlertLabel.trim()) return;
                    const selectedIconOption = ALERT_ICON_OPTIONS.find((o) => o.id === newChildAlertIconId) || ALERT_ICON_OPTIONS[0];
                    addHelpAlertPreset({
                      label: newChildAlertLabel.trim(),
                      sublabel: newChildAlertSublabel.trim() || newChildAlertLabel.trim(),
                      emoji: '',
                      stickerSrc: selectedIconOption.stickerSrc,
                      iconName: selectedIconOption.id,
                      colorClass: 'text-[#2D241E]',
                      borderClass: 'border-[#FED676] hover:border-amber-400 bg-[#FEF9EE] hover:bg-[#FDF3DE]',
                      ttsAnnouncement: `I sent an alert: ${newChildAlertLabel.trim()}`,
                      priority: newChildAlertPriority ? 'high' : 'medium',
                      isCustom: true,
                    });
                    setNewChildAlertLabel('');
                    setNewChildAlertSublabel('');
                    setNewChildAlertPriority(false);
                    setShowAddChildAlertModal(false);
                    showNotification(t("New 1-tap alert added to child screen."));
                    playChime('complete');
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-black text-xs shadow-xs active:scale-95 transition cursor-pointer border border-amber-600"
                >
                  {t("Save 1-Tap Alert")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
