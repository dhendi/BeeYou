import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';
import { getQuickRepliesForAlert } from '../../utils/alertResponses';
import { 
  getPairingCode, 
  acknowledgeCaregiverAlert,
  sendTestCaregiverAlert,
  clearAlertHistory,
  resolveCaregiverAlert
} from '../../services/caregiverSync';
import { resolveEmergencyAlert } from '../../services/familySync';
import { CaregiverAlert } from '../../types';

interface CaregiverAlertsTabProps {
  activeAlerts: CaregiverAlert[];
  setActiveAlerts: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  alertHistoryList: CaregiverAlert[];
  setAlertHistoryList: React.Dispatch<React.SetStateAction<CaregiverAlert[]>>;
  setActiveTab: (tab: any) => void;
  showNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverAlertsTab: React.FC<CaregiverAlertsTabProps> = ({
  activeAlerts,
  setActiveAlerts,
  alertHistoryList,
  setAlertHistoryList,
  setActiveTab,
  showNotification,
  onStartTour,
}) => {
  const { childProfile, connectionStatus } = useApp();

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
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showNotification(`${t('Sent reassurance reply:')} "${replyText}"`);
    playChime('star');
  };

  const handleTriggerTestAlert = () => {
    sendTestCaregiverAlert(getPairingCode(), childProfile.name || 'Child');
    showNotification(t('Test alert dispatched to this hub!'));
    playChime('tap');
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>{t('Live Alerts & SOS Inbox')}</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              activeAlerts.length > 0 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeAlerts.length > 0 ? `${activeAlerts.length} ${t('Active Alert')}` : `🟢 ${t('Safe & Clear')}`}
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
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300"
              title={t('Tour this section')}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('How This Works (Tour)')}</span>
            </button>
          )}
          <button
            type="button"
            data-tour="alerts-test-button"
            onClick={handleTriggerTestAlert}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>{t('Send Test Alert 🚨')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              playChime('tap');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Home')}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Connectivity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
            📡
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
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h4 className="text-sm font-black text-slate-800">{t('No active alerts right now')}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('When')} {childProfile.name} {t('taps the Help or Sensory Overload button on their tablet, it will instantly sound a chime and show up here with 1-tap reply options.')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerTestAlert}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
              >
                <span>{t('Test Alert Simulation 🚨')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-3xl shrink-0">
                      {alert.emoji || '🚨'}
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
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black cursor-pointer shadow-2xs"
                    >
                      {t('Resolve ✓')}
                    </button>
                  </div>
                </div>

                {/* Quick responses */}
                <div className="pt-3 border-t border-rose-200/80 space-y-2">
                  <span className="text-xs font-black text-rose-950 block">
                    {t('Send Immediate Reassurance to')} {alert.childName}{t("'s Screen:")}
                  </span>
                  <div data-tour="alerts-quick-reply-buttons" className="flex items-center gap-2 flex-wrap">
                    {getQuickRepliesForAlert(alert, t).map((reply) => (
                      <button
                        key={reply.id}
                        type="button"
                        onClick={() => handleAcknowledgeAlert(alert.id, reply.text, reply.id)}
                        className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5 transition ${reply.className}`}
                      >
                        <span>{reply.label}</span>
                      </button>
                    ))}
                  </div>
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
                  <span className="text-2xl">{item.emoji || '🚨'}</span>
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
                  <span className="text-[10px] font-bold text-emerald-600">{t('Archived ✓')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
