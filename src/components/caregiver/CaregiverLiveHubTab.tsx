import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Camera, 
  Smartphone, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  Clock, 
  Utensils, 
  Pill, 
  Car, 
  Wind, 
  Sparkles, 
  RotateCcw, 
  MessageCircle,
  Bell
} from 'lucide-react';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';
import { 
  getPairingCode, 
  sendCaregiverMessage, 
  acknowledgeCaregiverAlert,
  sendTestCaregiverAlert,
  getAlertHistory,
  resolveCaregiverAlert
} from '../../services/caregiverSync';
import { resolveEmergencyAlert } from '../../services/familySync';
import { CaregiverAlert } from '../../types';

interface CaregiverLiveHubTabProps {
  activeAlerts: CaregiverAlert[];
  setActiveAlerts: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  liveChildStatus: any;
  setAlertHistoryList: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  setShowFamilyAuthModal: (show: boolean) => void;
  setShowCameraScanner: (show: boolean) => void;
  setActiveTab: (tab: any) => void;
  showNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverLiveHubTab: React.FC<CaregiverLiveHubTabProps> = ({
  activeAlerts,
  setActiveAlerts,
  liveChildStatus,
  setAlertHistoryList,
  setShowFamilyAuthModal,
  setShowCameraScanner,
  setActiveTab,
  showNotification,
  onStartTour,
}) => {
  const { childProfile, connectionStatus, currentMood, habits, activeTheme } = useApp();
  const [customMsgText, setCustomMsgText] = useState('');

  const handleResolveAlert = (alertId: string) => {
    resolveEmergencyAlert(alertId, getPairingCode());
    resolveCaregiverAlert(getPairingCode(), alertId);
    acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', 'Resolved by Caregiver', 'im_here', alertId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setAlertHistoryList(getAlertHistory());
    showNotification('Alert marked as resolved.');
    playChime('tap');
  };

  const handleAcknowledgeAlert = (alertId: string, replyText: string, replyId?: any) => {
    acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', replyText, replyId, alertId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setAlertHistoryList(getAlertHistory());
    showNotification(`Sent reassurance reply: "${replyText}"`);
    playChime('star');
  };

  const handleSendQuickNudge = (title: string, text: string, emoji: string) => {
    sendCaregiverMessage(getPairingCode(), 'Caregiver', text, emoji);
    showNotification(`Sent nudge to child: "${title}"`);
    playChime('tap');
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsgText.trim()) return;
    sendCaregiverMessage(getPairingCode(), 'Caregiver', customMsgText.trim(), '💬');
    showNotification(`Sent message: "${customMsgText.trim()}"`);
    setCustomMsgText('');
    playChime('tap');
  };

  const handleTriggerTestAlert = () => {
    sendTestCaregiverAlert(getPairingCode(), childProfile.name || 'Child');
    showNotification('Test alert dispatched to this hub!');
    playChime('tap');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* 1. HERO LIVE CONNECTION & CHILD SNAPSHOT CARD */}
      <div
        data-tour="caregiver-live-card"
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-indigo-500/15 border-2 border-amber-300/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/30 border-2 border-amber-400/50 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🐝
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {childProfile.name} {t("'s Caregiver Command Hub")}
                </h2>
                <span
                  data-tour="status-connection-badge"
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    connectionStatus.isConnected 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${connectionStatus.isConnected ? 'bg-white animate-pulse' : 'bg-amber-600'}`} />
                  <span>{connectionStatus.isConnected ? `${t("Connected:")} ${connectionStatus.peerName || t("Child Device")}` : t("Waiting for Device Connection")}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {t("Send instant nudges & alerts, receive real-time SOS notifications, and manage routines and speech support.")}
              </p>
            </div>
          </div>

          <div
            data-tour="caregiver-quick-actions"
            className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap"
          >
            <button
              type="button"
              onClick={() => {
                setShowFamilyAuthModal(true);
                playChime('tap');
              }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              title={t("Shared Family Email & 1-Click Demo Testing")}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{t("Family Email & Demo")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCameraScanner(true);
                playChime('tap');
              }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              title={t("Open device camera to scan pairing QR code")}
            >
              <Camera className="w-4 h-4" />
              <span>{t("Scan Child QR")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('caregiver');
                playChime('tap');
              }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>{t("Pairing & QR")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onStartTour) {
                  onStartTour();
                } else {
                  setActiveTab('guide');
                }
                playChime('tap');
              }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              title={t("Launch Interactive Coachmark Feature Tour")}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("Feature Tour")}</span>
            </button>
          </div>
        </div>

        {/* Live Snapshot Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-amber-200/60 text-xs">
          <div data-tour="status-mood-pill" className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Current Mood")}</span>
            <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5 capitalize">
              <span>{currentMood === 'happy' ? '😊' : currentMood === 'calm' ? '😌' : currentMood === 'overwhelmed' ? '😫' : currentMood === 'sad' ? '😢' : '✨'}</span>
              <span>{currentMood ? t(currentMood) : t("Happy")}</span>
            </span>
          </div>

          <div data-tour="status-activity-pill" className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Current View")}</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block truncate">
              {liveChildStatus?.currentActivity ? t(liveChildStatus.currentActivity) : t("BeeYou Active")}
            </span>
          </div>

          <div data-tour="status-habits-pill" className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Habits Done")}</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1">
              <span>⭐</span>
              <span>{habits.filter(h => h.completedToday).length} / {habits.length} {t("Done")}</span>
            </span>
          </div>

          <div data-tour="status-pairing-code-pill" className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Pairing Code")}</span>
            <span className="text-sm font-black text-indigo-700 font-mono mt-0.5 block">
              {getPairingCode()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME SAFETY & ALERT CENTER */}
      <div data-tour="caregiver-alert-center" className="space-y-3">
        {activeAlerts.length > 0 ? (
          <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-3 animate-in fade-in ring-2 ring-rose-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>{t("🚨 Live Emergency Alert from")} {childProfile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeAlerts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      activeAlerts.forEach((a) => {
                        resolveEmergencyAlert(a.id, getPairingCode());
                      });
                      acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', 'All resolved', 'im_here');
                      setActiveAlerts([]);
                      try { localStorage.removeItem('beeyou_active_caregiver_alert'); } catch {}
                      setAlertHistoryList(getAlertHistory());
                      showNotification(t('All active alerts marked resolved.'));
                      playChime('tap');
                    }}
                    className="text-xs font-bold text-rose-800 bg-rose-200 hover:bg-rose-300 px-2.5 py-1 rounded-full cursor-pointer transition active:scale-95"
                  >
                    {t("Resolve All")} ({activeAlerts.length}) ✓
                  </button>
                )}
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                  {t("Action Required")}
                </span>
              </div>
            </div>

            {activeAlerts.map((alert) => (
              <div key={alert.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl shrink-0 font-bold">
                      {alert.emoji || '🚨'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{alert.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {alert.location ? `${t("Location:") || 'Location:'} ${alert.location}` : (alert.note || t('Help requested'))}
                        {alert.note && !alert.note.toLowerCase().includes('location') ? ` • ${alert.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-lg transition"
                      title={t("Dismiss / Mark Resolved")}
                    >
                      {t("Resolve ✓")}
                    </button>
                  </div>
                </div>

                {/* Delivery & Pipeline Status Badge */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span>{t("Delivered to Hub • Pending Caregiver Response")}</span>
                  </div>
                  <span className="text-slate-400 font-medium">{t("Auto-synced")}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">{t("Quick Reply:")}</span>
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id, "I'm on my way! 🚗", 'coming')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-2xs cursor-pointer active:scale-95"
                  >
                    {t("🚗 I'm On My Way")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id, "I'm here for you ❤️ Take a deep breath.", 'im_here')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-2xs cursor-pointer active:scale-95"
                  >
                    {t("❤️ I'm Here For You")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id, "Give me 5 minutes, finish what you're doing ⏳", 'give_minutes')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    {t("⏳ 5 Minutes")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-emerald-950">
                    {t("Real-Time Safety & Alert Center: All Clear")}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                    {t("Active Listening")}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                  {connectionStatus.isConnected
                    ? `${t("Connected to")} ${childProfile.name} (${getPairingCode()}). ${t("Any urgent SOS or sensory alert will appear and sound here instantly.")}`
                    : `${t("Listening on code")} ${getPairingCode()}. ${t("Ready to receive instant help calls from")} ${childProfile.name}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTriggerTestAlert}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
                title={t("Simulate receiving an alert immediately")}
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>{t("Send Test Alert 🚨")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('alerts');
                  playChime('tap');
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100/50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
              >
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>{t("Alert Inbox & Log")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. REMOTE ALERT & NUDGE DISPATCHER (CAREGIVER -> CHILD TABLET) */}
      <div data-tour="caregiver-nudges-grid" className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <span>{t("Send Instant Alert or Message to")} {childProfile.name}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t("Triggers an immediate spoken toast and visual alert card on the child's screen in real time.")}
            </p>
          </div>
        </div>

        {/* 1-Tap Quick Nudges Grid */}
        <div data-tour="nudges-grid-buttons" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { title: t('5-Min Warning'), text: t('5 minutes until we leave or change activity!'), icon: Clock, iconColor: 'text-amber-700', iconBg: 'bg-amber-100 border-amber-200', bg: 'hover:bg-amber-50/70 border-amber-200' },
            { title: t('Meal / Snack Time'), text: t('Time for food or snack!'), icon: Utensils, iconColor: 'text-emerald-700', iconBg: 'bg-emerald-100 border-emerald-200', bg: 'hover:bg-emerald-50/70 border-emerald-200' },
            { title: t('Medicine Time'), text: t('Time to take your scheduled medicine'), icon: Pill, iconColor: 'text-rose-700', iconBg: 'bg-rose-100 border-rose-200', bg: 'hover:bg-rose-50/70 border-rose-200' },
            { title: t("I'm On My Way"), text: t("Caregiver is on the way to pick you up"), icon: Car, iconColor: 'text-indigo-700', iconBg: 'bg-indigo-100 border-indigo-200', bg: 'hover:bg-indigo-50/70 border-indigo-200' },
            { title: t('Calm Breathing'), text: t("Let's take 3 slow, deep breaths together"), icon: Wind, iconColor: 'text-sky-700', iconBg: 'bg-sky-100 border-sky-200', bg: 'hover:bg-sky-50/70 border-sky-200' },
            { title: t('Proud of You'), text: t('Super proud of you! You are doing awesome'), icon: Sparkles, iconColor: 'text-purple-700', iconBg: 'bg-purple-100 border-purple-200', bg: 'hover:bg-purple-50/70 border-purple-200' },
            { title: t('Plans Changed'), text: t('Quick reminder: Our plans changed a little today'), icon: RotateCcw, iconColor: 'text-amber-700', iconBg: 'bg-amber-100 border-amber-200', bg: 'hover:bg-amber-50/70 border-amber-200' },
            { title: t('Check In'), text: t('How are you feeling right now? Tap your feelings!'), icon: MessageCircle, iconColor: 'text-blue-700', iconBg: 'bg-blue-100 border-blue-200', bg: 'hover:bg-blue-50/70 border-blue-200' },
          ].map((nudge, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuickNudge(nudge.title, nudge.text, '')}
              className={`p-3.5 rounded-2xl border text-left transition active:scale-95 cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${nudge.bg}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${nudge.iconBg} ${nudge.iconColor} shadow-2xs`}>
                <nudge.icon className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">{nudge.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2 mt-0.5">{nudge.text}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Caregiver Message Input */}
        <form data-tour="nudges-custom-input" onSubmit={handleSendCustomMessage} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={customMsgText}
            onChange={(e) => setCustomMsgText(e.target.value)}
            placeholder={`${t("Type a custom spoken message to send to")} ${childProfile.name}${t("'s tablet...")}`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
          <button
            type="submit"
            disabled={!customMsgText.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t("Send Alert")}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
