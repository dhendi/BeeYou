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
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { getQuickRepliesForAlert } from '../utils/alertResponses';
import { CaregiverAlert, PredefinedCaregiverResponseId, CaregiverChildStatus } from '../types';
import { CoachMarksOverlay, CoachMarkStep } from './CoachMarksOverlay';
import { CaregiverTourDirectoryModal } from './CaregiverTourDirectoryModal';
import { SECTION_TOURS, TourSectionId } from '../data/caregiverTourData';

import { LanguageDropdown } from './LanguageDropdown';
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
  sendTestCaregiverAlert,
  resolveCaregiverAlert,
  onCaregiverAlertResolve
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
    settings,
    updateSettings,
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
  const [showTourDirectoryModal, setShowTourDirectoryModal] = useState(false);
  const [activeTourSteps, setActiveTourSteps] = useState<CoachMarkStep[]>(() => SECTION_TOURS.fullApp.steps);
  const [currentTourName, setCurrentTourName] = useState<string>('Caregiver App Overview');
  const dashboardScrollRef = useRef<HTMLDivElement>(null);

  const handleOpenTourDirectory = () => {
    setShowTourDirectoryModal(true);
    playChime('tap');
  };

  const handleStartFullTour = () => {
    setShowTourDirectoryModal(false);
    setActiveTab('home');
    setActiveTourSteps(SECTION_TOURS.fullApp.steps);
    setCurrentTourName(SECTION_TOURS.fullApp.title);
    setShowCaregiverTour(true);
    playChime('tap');
  };

  const handleStartSectionTour = (sectionId: TourSectionId) => {
    const section = SECTION_TOURS[sectionId];
    if (section) {
      setShowTourDirectoryModal(false);
      setActiveTab(section.tabId as TabType);
      setActiveTourSteps(section.steps);
      setCurrentTourName(section.title);
      setShowCaregiverTour(true);
      playChime('tap');
    }
  };

  const handleStartTour = () => {
    handleOpenTourDirectory();
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

    const seenAlertChimes = new Set<string>();

    const unsubAlert = onCaregiverAlert((alert) => {
      if (alert) {
        const alertKey = `${alert.id || alert.label}:${alert.status || 'active'}`;
        if (seenAlertChimes.has(alertKey)) return;
        seenAlertChimes.add(alertKey);

        const fullAlert: CaregiverAlert = {
          ...alert,
          status: alert.status || 'active',
          timestamp: alert.timestamp || new Date().toISOString(),
        };
        setActiveAlerts((prev) => deduplicateAlerts([fullAlert, ...prev]));
        setAlertHistoryList(getAlertHistory());
        showNotification(`🚨 Incoming Alert from ${alert.childName || 'Leo'}: ${alert.label}`);
      }
    });

    const unsubResolve = onCaregiverAlertResolve((alertId) => {
      setActiveAlerts((prev) => prev.filter((a) => !alertId || a.id !== alertId));
      setAlertHistoryList(getAlertHistory());
    });

    const unsubStatus = onChildStatusUpdate((status) => {
      setLiveChildStatus(status);
    });
    return () => {
      unsubAlert();
      unsubResolve();
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
    await acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', responseMessage, responseId, alertId);
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
    resolveCaregiverAlert(getPairingCode(), alertId);
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

  const cyclePhaseInfo = getCyclePhaseInfo ? getCyclePhaseInfo() : { currentCycleDay: 1 };

  const navGroups: {
    id: string;
    title: string;
    emoji: string;
    items: Array<{
      id: TabType;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
    }>;
  }[] = [
    {
      id: 'live',
      title: 'Live & Safety',
      emoji: '📡',
      items: [
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
          id: 'caregiver',
          label: 'Live Caregiver Link',
          icon: Heart,
          badge: connectionStatus.isConnected ? 'Paired' : 'Pair',
        },
        {
          id: 'plans-changed',
          label: 'Plans Changed Mode',
          icon: AlertTriangle,
          badge: plansChanged.active ? 'Active' : undefined,
        },
      ],
    },
    {
      id: 'routines',
      title: 'Routines & Health',
      emoji: '📅',
      items: [
        {
          id: 'routines',
          label: 'Routine Library',
          icon: Calendar,
          badge: 'Library',
        },
        {
          id: 'medications',
          label: 'Medication Reminders',
          icon: Pill,
          badge: medications.some((m) => m.totalQuantity <= m.refillThreshold) ? 'Low Stock' : undefined,
        },
        {
          id: 'recollection',
          label: 'Daily Mood Summary',
          icon: BarChart3,
          badge: 'Therapy',
        },
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
      ],
    },
    {
      id: 'skills',
      title: 'Speech & Skills',
      emoji: '🗣️',
      items: [
        {
          id: 'aac',
          label: 'AAC & Vocabulary Studio',
          icon: MessageSquare,
        },
        {
          id: 'voice',
          label: 'Custom Voice Testing Tool',
          icon: Volume2,
        },
        {
          id: 'adventures',
          label: 'Life Adventures & Roleplay',
          icon: Compass,
        },
        {
          id: 'skills',
          label: 'Life Skills & Tasks',
          icon: CheckCircle2,
        },
      ],
    },
    {
      id: 'system',
      title: 'Setup & System',
      emoji: '⚙️',
      items: [
        {
          id: 'profile',
          label: 'Child Profile & Persona',
          icon: User,
        },
        {
          id: 'themes',
          label: 'Themes & Studio',
          icon: Palette,
          badge: 'Studio',
        },
        {
          id: 'offline',
          label: 'Offline & Storage Sync',
          icon: Database,
        },
        {
          id: 'settings',
          label: 'Settings & Parent PIN',
          icon: SettingsIcon,
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
      ],
    },
  ];

  const currentNavGroup = navGroups.find((g) => g.items.some((item) => item.id === activeTab)) || navGroups[0];
  const currentNavItem = navGroups.flatMap((g) => g.items).find((item) => item.id === activeTab) || navGroups[0].items[0];
  const CurrentIcon = currentNavItem.icon;

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
            title={t('Return to Child View')}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{t('Return to Child')}</span>
            <span className="sm:hidden">{t('Back')}</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">
              {t('Caregiver Hub')}
            </h1>
            <span className="text-xs text-slate-500 font-medium truncate hidden sm:inline">
              • {childProfile.name}
            </span>
          </div>
        </div>

        {/* Right: Feature Guide & Plans Changed Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Dropdown Choices */}
          <LanguageDropdown />

          <button
            type="button"
            onClick={handleStartTour}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-950 dark:text-amber-100 text-xs font-black transition-all active:scale-95 cursor-pointer border border-amber-300/80 shadow-2xs"
            title={t('Launch Interactive In-Place Coachmark Tour')}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{t('Feature Tour (Guide)')}</span>
            <span className="sm:hidden">{t('Guide')}</span>
          </button>

          {plansChanged.active && (
            <button
              onClick={() => {
                activatePlansChanged({ active: false });
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 bg-amber-500 text-white animate-pulse shadow-xs cursor-pointer"
              title={t('Plans Changed is active for child. Tap to turn off.')}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px]">{t('Plans Changed Active')}</span>
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

      {/* Main Layout: Sidebar Tabs / Mobile Dropdown + Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row p-2.5 sm:p-6 gap-3 sm:gap-5">
        {/* Mobile Navigation: 4 Domain Quick Tabs + Categorized Select Dropdown */}
        <div className="md:hidden flex flex-col gap-2 w-full bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border-2 border-stone-200/80 shadow-xs">
          {/* 4 Domain Filter Pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {navGroups.map((group) => {
              const isGroupActive = currentNavGroup.id === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    if (!group.items.some((item) => item.id === activeTab)) {
                      setActiveTab(group.items[0].id);
                      playChime('tap');
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isGroupActive
                      ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className="text-base leading-tight">{group.emoji}</span>
                  <span className="text-[10px] leading-tight truncate max-w-full font-bold mt-0.5">
                    {group.id === 'live' ? t('Live') : group.id === 'routines' ? t('Routines') : group.id === 'skills' ? t('Skills') : t('Setup')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categorized Dropdown Selector */}
          <div className="relative flex items-center">
            <div className={`absolute left-3 pointer-events-none w-6 h-6 rounded-lg flex items-center justify-center ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} ${activeTheme?.palette?.textAccent || 'text-amber-900'}`}>
              <CurrentIcon className="w-3.5 h-3.5 stroke-[2.4]" />
            </div>
            <select
              aria-label="Select Caregiver Section"
              value={activeTab}
              onChange={(e) => {
                const newTab = e.target.value as TabType;
                if (newTab === 'guide') {
                  handleStartTour();
                } else {
                  setActiveTab(newTab);
                  playChime('tap');
                }
              }}
              className="w-full pl-11 pr-9 py-2.5 bg-stone-50 hover:bg-stone-100 focus:bg-white text-slate-900 font-black text-xs sm:text-sm rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 outline-none transition-all appearance-none cursor-pointer"
            >
              {navGroups.map((group) => (
                <optgroup key={group.id} label={`${group.emoji} ${t(group.title)}`}>
                  {group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {t(item.label)} {item.badge ? `(${t(item.badge)})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Desktop Categorized Sidebar */}
        <aside className="hidden md:flex md:w-64 bg-white/95 backdrop-blur-md rounded-3xl p-3 border-2 border-stone-200/80 shadow-xs flex-col gap-4 shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <div className="px-2 py-1 flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">
                <span>{group.emoji}</span>
                <span>{t(group.title)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      data-tour={`caregiver-tab-${item.id}`}
                      onClick={() => {
                        if (item.id === 'guide') {
                          handleStartTour();
                          return;
                        }
                        setActiveTab(item.id);
                        playChime('tap');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs font-black`
                          : `hover:${activeTheme?.palette?.primaryLight || 'hover:bg-amber-50'} text-slate-700`
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : `${activeTheme?.palette?.primaryLight || 'bg-amber-50'} ${activeTheme?.palette?.textAccent || 'text-amber-900'}`
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 stroke-[2.4]" />
                        </div>
                        <span className="truncate">{t(item.label)}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                            item.id === 'routines'
                              ? 'bg-sky-100 text-sky-950 border border-sky-200'
                              : isActive
                              ? 'bg-white/25 text-white'
                              : `${activeTheme?.palette?.badgeBg || 'bg-amber-200'} ${activeTheme?.palette?.textAccent || 'text-amber-950'}`
                          }`}
                        >
                          {t(item.badge)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-7 border-2 border-stone-200/80 shadow-xs">

          {/* URGENT LIVE ALERT PERSISTENT BANNER (Visible on all tabs) */}
          {activeAlerts.length > 0 && activeTab !== 'alerts' && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in ring-2 ring-rose-200">
              <div className="flex items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
                </span>
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <div className="font-black text-rose-950 text-sm flex items-center gap-2 flex-wrap">
                    <span>🚨 {t('Live Emergency Alert from')} {activeAlerts[0].childName || childProfile.name}:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-200 text-rose-900 font-extrabold text-xs">
                      {activeAlerts[0].emoji || '🚨'} {activeAlerts[0].label}
                    </span>
                  </div>
                  <div className="text-xs text-rose-700 font-medium mt-0.5">
                    {activeAlerts[0].location ? `${t('Location:')} ${activeAlerts[0].location} • ` : ''}
                    {activeAlerts[0].note || t('Child requested immediate support.')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                {getQuickRepliesForAlert(activeAlerts[0], t).slice(0, 2).map((reply) => (
                  <button
                    key={reply.id}
                    type="button"
                    onClick={() => handleAcknowledgeAlert(activeAlerts[0].id, reply.text, reply.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition flex items-center gap-1.5 ${reply.className}`}
                  >
                    <span>{reply.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('alerts');
                    playChime('tap');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer transition"
                >
                  {t("Open Alerts Inbox")} →
                </button>
              </div>
            </div>
          )}

          {/* TAB: CAREGIVER LIVE HUB HOMEPAGE */}
          {activeTab === 'home' && (
            <CaregiverLiveHubTab
              activeAlerts={activeAlerts}
              setActiveAlerts={setActiveAlerts}
              liveChildStatus={liveChildStatus}
              setAlertHistoryList={setAlertHistoryList}
              setShowFamilyAuthModal={setShowFamilyAuthModal}
              setShowCameraScanner={setShowCameraScanner}
              setActiveTab={(tab: any) => setActiveTab(tab)}
              showNotification={showNotification}
              onStartTour={() => handleStartSectionTour('liveStatus')}
            />
          )}

          {/* TAB: LIVE ALERTS & SOS INBOX */}
          {activeTab === 'alerts' && (
            <CaregiverAlertsTab
              activeAlerts={activeAlerts}
              setActiveAlerts={setActiveAlerts}
              alertHistoryList={alertHistoryList}
              setAlertHistoryList={setAlertHistoryList}
              setActiveTab={(tab: any) => setActiveTab(tab)}
              showNotification={showNotification}
              onStartTour={() => handleStartSectionTour('alerts')}
            />
          )}

          {/* TAB: SUBSCRIPTION, BILLING & LIFECYCLE MANAGEMENT */}
          {activeTab === 'subscription' && (
            <CaregiverSubscriptionTab 
              showNotification={showNotification}
              onStartTour={() => handleStartSectionTour('subscription')}
            />
          )}

          {/* TAB: HOW BEEYOU WORKS & CAREGIVER GUIDE */}
          {activeTab === 'guide' && (
            <CaregiverGuideTab
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onStartTour={handleOpenTourDirectory}
            />
          )}

          {/* TAB: MEDICATION REMINDERS & SUPPLY MANAGEMENT */}
          {activeTab === 'medications' && (
            <CaregiverMedicationsTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('medications')}
            />
          )}

          {/* TAB: DAILY MOOD & THERAPIST RECOLLECTION SUMMARY */}
          {activeTab === 'recollection' && (
            <div className="space-y-6">
              <DailyRecollectionChart 
                isParentPortal={true}
                onStartTour={() => handleStartSectionTour('recollection')}
              />
            </div>
          )}

          {/* TAB: MOOD JOURNAL & SELF-REFLECTION */}
          {activeTab === 'mood-journal' && (
            <CaregiverMoodJournalTab 
              onStartTour={() => handleStartSectionTour('moodJournal')}
            />
          )}

          {/* TAB: CYCLE TRACKER & HORMONAL RHYTHM */}
          {activeTab === 'cycle-tracker' && (
            <CaregiverCycleTrackerTab 
              onStartTour={() => handleStartSectionTour('cycleTracker')}
            />
          )}

          {/* TAB: CAREGIVER LIVE LINK & REMOTE MONITOR */}
          {activeTab === 'caregiver' && (
            <CaregiverDeviceLinkTab
              onShowNotification={showNotification}
              onOpenScanner={() => setShowCameraScanner(true)}
              onStartTour={() => handleStartSectionTour('pairing')}
            />
          )}

          {/* TAB: OFFLINE & PWA STORAGE DIAGNOSTICS */}
          {activeTab === 'offline' && (
            <CaregiverOfflineTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('offline')}
            />
          )}

          {/* TAB: PLANS CHANGED SYSTEM */}
          {activeTab === 'plans-changed' && (
            <CaregiverPlansChangedTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('plansChanged')}
            />
          )}

          {/* TAB: ROUTINES & MY DAY */}
          {activeTab === 'routines' && (
            <CaregiverRoutinesTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('routines')}
            />
          )}

          {/* TAB: AAC & VOCABULARY */}
          {activeTab === 'aac' && (
            <CaregiverAacStudioTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('aac')}
            />
          )}

          {/* TAB: VOICE SETTINGS & TESTING TOOL */}
          {activeTab === 'voice' && (
            <CaregiverVoiceTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('voice')}
            />
          )}

          {/* TAB: LIFE ADVENTURES & CONTEXTUAL PHRASES */}
          {activeTab === 'adventures' && (
            <CaregiverAdventuresTab 
              onStartTour={() => handleStartSectionTour('adventures')}
            />
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <CaregiverSkillsTab 
              onStartTour={() => handleStartSectionTour('skills')}
            />
          )}

          {/* TAB: CHILD PROFILE & PERSONALIZATION */}
          {activeTab === 'profile' && (
            <CaregiverProfileTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('profile')}
            />
          )}

          {/* TAB: SETTINGS & PIN */}
          {activeTab === 'settings' && (
            <CaregiverSettingsTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('settings')}
            />
          )}

          {/* TAB: THEMES & CUSTOMIZATION STUDIO */}
          {activeTab === 'themes' && (
            <ThemeShopAndStudio 
              onStartTour={() => handleStartSectionTour('themes')}
            />
          )}
        </main>
      </div>

      {/* In-App Live Camera QR Scanner */}
      <CameraQRScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={handleScanCaregiverQR}
        title={t("Scan Child Device QR Code")}
        subtitle={t("Point camera at the QR code on the child's phone or tablet")}
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

      {/* Interactive Section Tour Directory Modal */}
      <CaregiverTourDirectoryModal
        isOpen={showTourDirectoryModal}
        onClose={() => setShowTourDirectoryModal(false)}
        onStartFullTour={handleStartFullTour}
        onSelectSection={handleStartSectionTour}
      />

      {/* Interactive Caregiver CoachMarks Feature Tour */}
      <CoachMarksOverlay
        isActive={showCaregiverTour}
        steps={activeTourSteps}
        onComplete={() => setShowCaregiverTour(false)}
        onSkip={() => setShowCaregiverTour(false)}
        tourName={currentTourName}
      />
    </div>
  );
};
