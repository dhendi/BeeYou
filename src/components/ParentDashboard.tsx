import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Crown,
  AlertTriangle,
  Check,
  LayoutDashboard,
  ShieldAlert,
  HelpCircle,
  Calendar,
  Pill,
  BarChart3,
  BookOpen,
  HeartPulse,
  Heart,
  MessageSquare,
  Volume2,
  Database,
  Compass,
  CheckCircle2,
  User,
  Palette,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { CaregiverAlert, PredefinedCaregiverResponseId, CaregiverChildStatus } from '../types';
import { CoachMarksOverlay, CoachMarkStep } from './CoachMarksOverlay';

const CAREGIVER_COACH_STEPS: CoachMarkStep[] = [
  {
    targetSelector: '[data-tour="caregiver-live-card"]',
    title: '1. Live Child Status & Mood',
    instruction: "Shows your child's real-time device connection, current emotion, completed daily habits, and active 6-digit sync code.",
    mascotHint: 'Always see what your child is doing! 📡',
  },
  {
    targetSelector: '[data-tour="caregiver-quick-actions"]',
    title: '2. Instant Pairing & Family Login',
    instruction: "Scan your child's QR code with your camera or log in with your shared family email to link devices instantly.",
    mascotHint: 'Connects devices in seconds! 📱',
  },
  {
    targetSelector: '[data-tour="caregiver-alert-center"]',
    title: '3. Real-Time Safety & SOS Inbox',
    instruction: 'When your child asks for help, requests a break, or triggers an SOS, live emergency cards appear here with 1-tap responses.',
    mascotHint: 'Tap "I\'m On My Way" to reassure your child! 🛡️',
  },
  {
    targetSelector: '[data-tour="caregiver-nudges-grid"]',
    title: '4. Spoken Nudges & Spoken Messages',
    instruction: "Tap any quick button (5-Min Warning, Meal Time, Medicine Time, Proud of You) or type a custom message to speak aloud on your child's tablet.",
    mascotHint: "Sends voice announcements straight to child's tablet! 💬",
  },
  {
    targetSelector: '[data-tour="caregiver-tab-routines"]',
    title: '5. Visual Routine Templates',
    instruction: 'Create morning, bedtime, school, and First/Then schedules with step timers and reward stickers to build daily independence.',
    mascotHint: 'Make daily routines easy and visual! 📅',
  },
  {
    targetSelector: '[data-tour="caregiver-tab-medications"]',
    title: '6. Medication & Refill Reminders',
    instruction: 'Set daily pill dosages and reminder times. Automatic alerts warn you before refills run out.',
    mascotHint: 'Never miss a dose or prescription! 💊',
  },
  {
    targetSelector: '[data-tour="caregiver-tab-plans-changed"]',
    title: '7. Plans Changed Alert System',
    instruction: 'When daily schedules change unexpectedly, broadcast a calm visual announcement to your child to eliminate transition stress.',
    mascotHint: 'Calms sudden unexpected schedule changes! ⚠️',
  },
  {
    targetSelector: '[data-tour="caregiver-tab-aac"]',
    title: '8. AAC Symbol Studio',
    instruction: 'Personalize communication boards using 3,400+ clinical Mulberry symbols, family photos, custom voices, and categories.',
    mascotHint: "Give your child their unique voice! 🗣️",
  },
  {
    targetSelector: '[data-tour="caregiver-tab-recollection"]',
    title: '9. Mood & Therapist Reports',
    instruction: 'Review daily mood trends, sensory patterns, and export easy summary charts for therapists and pediatricians.',
    mascotHint: 'Great for doctor & therapy visits! 📊',
  },
  {
    targetSelector: '[data-tour="caregiver-tab-settings"]',
    title: '10. PIN Security & Preferences',
    instruction: 'Protect caregiver controls with your custom 4-digit PIN lock and configure notification preferences.',
    mascotHint: 'Keeps caregiver settings safe & private! 🔒',
  },
];
import {
  getPairingCode,
  subscribeToCloudChannel,
  sendCaregiverMessage,
  acknowledgeCaregiverAlert,
  onCaregiverAlert,
  onChildStatusUpdate,
  fetchCaregiverSession,
  claimPairingSession,
  extractPairingCodeFromScan,
  getAlertHistory,
  clearAlertHistory,
  sendTestCaregiverAlert
} from '../services/caregiverSync';
import { resolveEmergencyAlert } from '../services/familySync';
import { setActiveDeviceView } from '../services/authService';

// Modular Caregiver Tabs
import { CaregiverLiveHubTab } from './caregiver/CaregiverLiveHubTab';
import { CaregiverAlertsTab } from './caregiver/CaregiverAlertsTab';
import { CaregiverSubscriptionTab } from './caregiver/CaregiverSubscriptionTab';
import { CaregiverGuideTab } from './caregiver/CaregiverGuideTab';
import { CaregiverMedicationsTab } from './caregiver/CaregiverMedicationsTab';
import { CaregiverMoodJournalTab } from './caregiver/CaregiverMoodJournalTab';
import { CaregiverCycleTrackerTab } from './caregiver/CaregiverCycleTrackerTab';
import { CaregiverDeviceLinkTab } from './caregiver/CaregiverDeviceLinkTab';
import { CaregiverOfflineTab } from './caregiver/CaregiverOfflineTab';
import { CaregiverPlansChangedTab } from './caregiver/CaregiverPlansChangedTab';
import { CaregiverRoutinesTab } from './caregiver/CaregiverRoutinesTab';
import { CaregiverAacStudioTab } from './caregiver/CaregiverAacStudioTab';
import { CaregiverVoiceTab } from './caregiver/CaregiverVoiceTab';
import { CaregiverAdventuresTab } from './caregiver/CaregiverAdventuresTab';
import { CaregiverSkillsTab } from './caregiver/CaregiverSkillsTab';
import { CaregiverProfileTab } from './caregiver/CaregiverProfileTab';
import { CaregiverSettingsTab } from './caregiver/CaregiverSettingsTab';

// Shared Components
import { DailyRecollectionChart } from './DailyRecollectionChart';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import { CameraQRScannerModal } from './CameraQRScannerModal';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './ConnectionFeedbackModal';
import { FamilyAuthModal } from './FamilyAuthModal';

export const ParentDashboard: React.FC = () => {
  const {
    activeTheme,
    setIsParentMode,
    childProfile,
    caregiverPermissions,
    currentMood,
    connectionStatus,
    setShowCaregiverModal,
    showFamilyAuthModal,
    setShowFamilyAuthModal,
    plansChanged,
    activatePlansChanged,
    medications,
    moodJournalEntries,
    getCyclePhaseInfo,
    subscription,
    isPremium,
    getTrialDaysRemaining,
  } = useApp();

  type TabType =
    | 'home'
    | 'alerts'
    | 'subscription'
    | 'guide'
    | 'caregiver'
    | 'medications'
    | 'mood-journal'
    | 'cycle-tracker'
    | 'recollection'
    | 'offline'
    | 'plans-changed'
    | 'routines'
    | 'aac'
    | 'voice'
    | 'adventures'
    | 'skills'
    | 'profile'
    | 'themes'
    | 'settings';

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCaregiverTour, setShowCaregiverTour] = useState(false);
  const dashboardScrollRef = useRef<HTMLDivElement>(null);

  const handleStartTour = () => {
    setActiveTab('home');
    setShowCaregiverTour(true);
    playChime('tap');
  };

  // Live remote alerts & status
  const [activeAlerts, setActiveAlerts] = useState<CaregiverAlert[]>(() => {
    try {
      const raw = localStorage.getItem('beeyou_active_caregiver_alert');
      if (raw) return [JSON.parse(raw)];
    } catch {}
    return [];
  });
  const [alertHistoryList, setAlertHistoryList] = useState<CaregiverAlert[]>(() => getAlertHistory());
  const [liveChildStatus, setLiveChildStatus] = useState<CaregiverChildStatus | null>(null);

  const deduplicateAlerts = (alerts: CaregiverAlert[]): CaregiverAlert[] => {
    const seen = new Set<string>();
    const result: CaregiverAlert[] = [];
    for (const a of alerts) {
      if (!a || (a.status && a.status !== 'active')) continue;
      const timeKey = Math.floor(new Date(a.timestamp || Date.now()).getTime() / 6000);
      const contentKey = `${a.label || a.emotion || ''}-${timeKey}`;
      if (!seen.has(a.id) && !seen.has(contentKey)) {
        seen.add(a.id);
        seen.add(contentKey);
        result.push(a);
      }
    }
    return result;
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    playChime('star');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  useEffect(() => {
    const code = getPairingCode();
    subscribeToCloudChannel(code);

    const refreshSession = () => {
      fetchCaregiverSession(code).then((session) => {
        if (session) {
          setLiveChildStatus(session);
          if (session.activeAlert && (session.activeAlert.status === 'active' || !session.activeAlert.status)) {
            const current: CaregiverAlert = {
              ...session.activeAlert,
              status: session.activeAlert.status || 'active',
              timestamp: session.activeAlert.timestamp || new Date().toISOString(),
            };
            setActiveAlerts((prev) => deduplicateAlerts([current, ...prev]));
            setAlertHistoryList(getAlertHistory());
          }
        }
      });
    };

    refreshSession();
    const pollInterval = setInterval(refreshSession, 1500);

    const unsubAlert = onCaregiverAlert((alert) => {
      if (alert) {
        const fullAlert: CaregiverAlert = {
          ...alert,
          status: alert.status || 'active',
          timestamp: alert.timestamp || new Date().toISOString(),
        };
        setActiveAlerts((prev) => deduplicateAlerts([fullAlert, ...prev]));
        setAlertHistoryList(getAlertHistory());
        playChime('star');
        showNotification(`🚨 Incoming Alert from ${alert.childName || 'Leo'}: ${alert.label}`);
      }
    });
    const unsubStatus = onChildStatusUpdate((status) => {
      setLiveChildStatus(status);
    });
    return () => {
      unsubAlert();
      unsubStatus();
      clearInterval(pollInterval);
    };
  }, []);

  const handleSendQuickNudge = async (title: string, text: string, emoji: string) => {
    await sendCaregiverMessage(getPairingCode(), text, 'Caregiver', emoji);
    showNotification(`Sent "${title}" alert to ${childProfile.name}'s device!`);
    playChime('tap');
  };

  const handleAcknowledgeAlert = async (alertId: string, responseMessage: string, responseId?: PredefinedCaregiverResponseId) => {
    await acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', responseMessage, responseId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification(`Sent response: "${responseMessage}" to child!`);
    playChime('star');
  };

  const handleTriggerTestAlert = async () => {
    const testAlert = await sendTestCaregiverAlert(childProfile.name || 'Leo');
    setActiveAlerts((prev) => [testAlert, ...prev.filter((a) => a.id !== testAlert.id)]);
    setAlertHistoryList(getAlertHistory());
    playChime('complete');
    showNotification(`🚨 Test alert triggered successfully for ${childProfile.name}!`);
  };

  const handleClearAlertHistory = () => {
    clearAlertHistory();
    setAlertHistoryList([]);
    showNotification('Alert history cleared.');
    playChime('tap');
  };

  const handleResolveAlert = (alertId: string) => {
    resolveEmergencyAlert(alertId, getPairingCode());
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification('Alert marked as resolved and safely archived.');
    playChime('tap');
  };

  // Camera QR Scanner Modal State & Feedback State
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [feedbackState, setFeedbackState] = useState<ConnectionFeedbackState | null>(null);

  const handleScanCaregiverQR = async (scanned: string) => {
    const cleanCode = extractPairingCodeFromScan(scanned);
    if (!cleanCode) return;

    const res = await claimPairingSession({
      pairingCode: cleanCode,
      claimerRole: 'caregiver',
      childName: childProfile.name || 'Leo',
      caregiverName: 'Caregiver',
      permissions: caregiverPermissions,
    });

    if (res.success) {
      setFeedbackState({
        isOpen: true,
        type: 'success',
        role: 'caregiver',
        peerName: childProfile.name || 'Child',
        pairingCode: cleanCode,
      });
      showNotification(`🎉 Successfully connected to ${childProfile.name}'s device!`);
    } else {
      setFeedbackState({
        isOpen: true,
        type: 'failure',
        role: 'caregiver',
        peerName: childProfile.name || 'Child',
        errorMessage: res.message,
        pairingCode: cleanCode,
      });
    }
  };

  useEffect(() => {
    if (dashboardScrollRef.current) {
      dashboardScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const cyclePhaseInfo = getCyclePhaseInfo();

  return (
    <div
      ref={dashboardScrollRef}
      className={`h-[100dvh] max-h-[100dvh] w-full overflow-y-auto overscroll-contain ${activeTheme?.palette?.appBg || 'bg-[#FAF8F5]'} flex flex-col text-slate-800 transition-colors duration-300`}
    >
      {/* Top Caregiver Header */}
      <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-200/60'} backdrop-blur-md text-slate-900 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs border-b border-stone-200/70 transition-colors duration-300`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              setActiveDeviceView('child');
              setIsParentMode(false);
              playChime('tap');
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('beeyou_active_device_view', 'child');
                window.history.replaceState(null, '', window.location.pathname.replace(/^\/caregiver/, '') || '/');
                window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'child' } }));
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-stone-200 shadow-2xs shrink-0"
            title="Return to Child View"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Return to Child</span>
            <span className="sm:hidden">Child</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">
              Caregiver Hub
            </h1>
            <span className="text-xs text-slate-500 font-medium truncate hidden sm:inline">
              • {childProfile.name}
            </span>
          </div>
        </div>

        {/* Right: Feature Guide & Plans Changed Status */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartTour}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-950 dark:text-amber-100 text-xs font-black transition-all active:scale-95 cursor-pointer border border-amber-300/80 shadow-2xs"
            title="Launch Interactive In-Place Coachmark Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Feature Guide</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {plansChanged.active && (
            <button
              onClick={() => {
                activatePlansChanged({ active: false });
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 bg-amber-500 text-white animate-pulse shadow-xs cursor-pointer"
              title="Plans Changed is active for child. Tap to turn off."
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px]">Plans Changed Active</span>
            </button>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Layout: Sidebar Tabs + Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row p-2.5 sm:p-6 gap-4 sm:gap-5">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white/95 backdrop-blur-md rounded-3xl p-2.5 sm:p-3 border-2 border-stone-200/80 shadow-xs flex md:flex-col gap-1 overflow-x-auto shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto">
          {[
            {
              id: 'home',
              label: 'Caregiver Live Hub',
              icon: LayoutDashboard,
              badge: connectionStatus.isConnected ? 'Live' : (activeAlerts.length > 0 ? `${activeAlerts.length} Alert` : undefined),
            },
            {
              id: 'alerts',
              label: 'Live Alerts & SOS Inbox',
              icon: ShieldAlert,
              badge: activeAlerts.length > 0 ? `${activeAlerts.length} Active` : undefined,
            },
            {
              id: 'subscription',
              label: 'Membership & Plan',
              icon: Crown,
              badge: isPremium ? (subscription.status === 'trial' ? `${getTrialDaysRemaining()}d Trial` : 'Premium') : '30d Free',
            },
            {
              id: 'guide',
              label: 'Feature Tour (Guide)',
              icon: Sparkles,
              badge: 'Tour',
            },
            { id: 'routines', label: 'Routine Templates Library', icon: Calendar, badge: 'Library' },
            {
              id: 'medications',
              label: 'Medication Reminders',
              icon: Pill,
              badge: medications.some((m) => m.totalQuantity <= m.refillThreshold) ? 'Low Stock' : undefined,
            },
            { id: 'recollection', label: 'Daily Mood & Therapist Summary', icon: BarChart3, badge: 'Therapy' },
            {
              id: 'mood-journal',
              label: 'Mood & Reflection Journal',
              icon: BookOpen,
              badge: `${moodJournalEntries.length} Entries`,
            },
            {
              id: 'cycle-tracker',
              label: 'Cycle & Hormonal Rhythm',
              icon: HeartPulse,
              badge: `Day ${cyclePhaseInfo.currentCycleDay}`,
            },
            { id: 'caregiver', label: 'Live Caregiver Link', icon: Heart, badge: 'Live' },
            { id: 'plans-changed', label: 'Plans Changed', icon: AlertTriangle, badge: plansChanged.active ? 'Active' : undefined },
            { id: 'aac', label: 'AAC & Vocabulary', icon: MessageSquare },
            { id: 'voice', label: 'Voice Testing Tool', icon: Volume2 },
            { id: 'offline', label: 'Offline & PWA Storage', icon: Database },
            { id: 'adventures', label: 'Life Adventures', icon: Compass },
            { id: 'skills', label: 'Life Skills', icon: CheckCircle2 },
            { id: 'profile', label: 'Child Profile', icon: User },
            { id: 'themes', label: 'Themes & Studio', icon: Palette, badge: 'Studio' },
            { id: 'settings', label: 'Settings & PIN', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tour={`caregiver-tab-${tab.id}`}
                onClick={() => {
                  if (tab.id === 'guide') {
                    handleStartTour();
                    return;
                  }
                  setActiveTab(tab.id as any);
                  playChime('tap');
                }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-md ring-2 ring-amber-300/60`
                    : `hover:${activeTheme?.palette?.primaryLight || 'hover:bg-amber-50'} text-slate-700`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-white/20 text-white' : `${activeTheme?.palette?.primaryLight || 'bg-amber-50'} ${activeTheme?.palette?.textAccent || 'text-amber-900'}`
                  }`}>
                    <Icon className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    tab.id === 'routines'
                      ? 'bg-sky-100 text-sky-950 border border-sky-200'
                      : `${activeTheme?.palette?.badgeBg || 'bg-amber-200'} ${activeTheme?.palette?.textAccent || 'text-amber-950'}`
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-7 border-2 border-stone-200/80 shadow-xs">

          {/* TAB: CAREGIVER LIVE HUB HOMEPAGE */}
          {activeTab === 'home' && (
            <CaregiverLiveHubTab
              activeAlerts={activeAlerts}
              liveChildStatus={liveChildStatus}
              currentMood={currentMood}
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onSendQuickNudge={handleSendQuickNudge}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onTriggerTestAlert={handleTriggerTestAlert}
              onOpenCaregiverModal={() => setShowCaregiverModal(true)}
              onShowFamilyAuthModal={() => setShowFamilyAuthModal(true)}
              onShowNotification={showNotification}
              onStartTour={handleStartTour}
            />
          )}

          {/* TAB: LIVE ALERTS & SOS INBOX */}
          {activeTab === 'alerts' && (
            <CaregiverAlertsTab
              activeAlerts={activeAlerts}
              alertHistoryList={alertHistoryList}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onClearAlertHistory={handleClearAlertHistory}
              onTriggerTestAlert={handleTriggerTestAlert}
              onShowNotification={showNotification}
            />
          )}

          {/* TAB: SUBSCRIPTION, BILLING & LIFECYCLE MANAGEMENT */}
          {activeTab === 'subscription' && (
            <CaregiverSubscriptionTab onShowNotification={showNotification} />
          )}

          {/* TAB: HOW BEEYOU WORKS & CAREGIVER GUIDE */}
          {activeTab === 'guide' && (
            <CaregiverGuideTab
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onStartTour={handleStartTour}
            />
          )}

          {/* TAB: MEDICATION REMINDERS & SUPPLY MANAGEMENT */}
          {activeTab === 'medications' && (
            <CaregiverMedicationsTab onShowNotification={showNotification} />
          )}

          {/* TAB: DAILY MOOD & THERAPIST RECOLLECTION SUMMARY */}
          {activeTab === 'recollection' && (
            <div className="space-y-6">
              <DailyRecollectionChart isParentPortal={true} />
            </div>
          )}

          {/* TAB: MOOD JOURNAL & SELF-REFLECTION */}
          {activeTab === 'mood-journal' && (
            <CaregiverMoodJournalTab />
          )}

          {/* TAB: CYCLE TRACKER & HORMONAL RHYTHM */}
          {activeTab === 'cycle-tracker' && (
            <CaregiverCycleTrackerTab />
          )}

          {/* TAB: CAREGIVER LIVE LINK & REMOTE MONITOR */}
          {activeTab === 'caregiver' && (
            <CaregiverDeviceLinkTab
              onShowNotification={showNotification}
              onOpenScanner={() => setShowCameraScanner(true)}
            />
          )}

          {/* TAB: OFFLINE & PWA STORAGE DIAGNOSTICS */}
          {activeTab === 'offline' && (
            <CaregiverOfflineTab onShowNotification={showNotification} />
          )}

          {/* TAB: PLANS CHANGED SYSTEM */}
          {activeTab === 'plans-changed' && (
            <CaregiverPlansChangedTab onShowNotification={showNotification} />
          )}

          {/* TAB: ROUTINES & MY DAY */}
          {activeTab === 'routines' && (
            <CaregiverRoutinesTab onShowNotification={showNotification} />
          )}

          {/* TAB: AAC & VOCABULARY */}
          {activeTab === 'aac' && (
            <CaregiverAacStudioTab onShowNotification={showNotification} />
          )}

          {/* TAB: VOICE SETTINGS & TESTING TOOL */}
          {activeTab === 'voice' && (
            <CaregiverVoiceTab onShowNotification={showNotification} />
          )}

          {/* TAB: LIFE ADVENTURES & CONTEXTUAL PHRASES */}
          {activeTab === 'adventures' && (
            <CaregiverAdventuresTab />
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <CaregiverSkillsTab />
          )}

          {/* TAB: CHILD PROFILE & PERSONALIZATION */}
          {activeTab === 'profile' && (
            <CaregiverProfileTab onShowNotification={showNotification} />
          )}

          {/* TAB: SETTINGS & PIN */}
          {activeTab === 'settings' && (
            <CaregiverSettingsTab onShowNotification={showNotification} />
          )}

          {/* TAB: THEMES & CUSTOMIZATION STUDIO */}
          {activeTab === 'themes' && (
            <ThemeShopAndStudio />
          )}
        </main>
      </div>

      {/* In-App Live Camera QR Scanner */}
      <CameraQRScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={handleScanCaregiverQR}
        title="Scan Child Device QR Code"
        subtitle="Point camera at the QR code on the child's phone or tablet"
      />

      {/* Connection Feedback Modal (Success / Failure) */}
      <ConnectionFeedbackModal
        state={feedbackState}
        onClose={() => setFeedbackState(null)}
        onOpenCamera={() => setShowCameraScanner(true)}
      />

      {/* Shared Family Email & 1-Click Demo Modal */}
      <FamilyAuthModal
        isOpen={showFamilyAuthModal}
        onClose={() => setShowFamilyAuthModal(false)}
      />

      {/* Interactive Caregiver CoachMarks Feature Tour */}
      <CoachMarksOverlay
        isActive={showCaregiverTour}
        steps={CAREGIVER_COACH_STEPS}
        onComplete={() => setShowCaregiverTour(false)}
        onSkip={() => setShowCaregiverTour(false)}
        tourName="Caregiver Features Tour"
      />
    </div>
  );
};
