import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useApp } from '../context/AppContext';

// Caregiver portal lazy-loaded modals
const PlansChangedModal = lazy(() => import('./PlansChangedModal').then(m => ({ default: m.PlansChangedModal })));
const AboutMeIDModal = lazy(() => import('./AboutMeIDModal').then(m => ({ default: m.AboutMeIDModal })));
const DailyRecollectionModal = lazy(() => import('./DailyRecollectionModal').then(m => ({ default: m.DailyRecollectionModal })));
const AccessibilityPreferencesModal = lazy(() => import('./AccessibilityPreferencesModal').then(m => ({ default: m.AccessibilityPreferencesModal })));
import { ChevronDown, Mic } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { getQuickRepliesForAlert } from '../utils/alertResponses';
import { CaregiverAlert, PredefinedCaregiverResponseId, CaregiverChildStatus } from '../types';
import { CoachMarksOverlay, CoachMarkStep } from './CoachMarksOverlay';
import { CaregiverTourDirectoryModal } from './CaregiverTourDirectoryModal';
import { SECTION_TOURS, TourSectionId } from '../data/caregiverTourData';
import { VOICE_PERSONAS, getVoicePersonaById, getVoicePersonasForLanguage } from '../data/voicePersonasData';

import { LanguageDropdown } from './LanguageDropdown';
import {
  getPairingCode,
  subscribeToCloudChannel,
  sendCaregiverMessage,
  onCaregiverMessage,
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
import { pushNotificationService } from '../services/pushNotificationService';
import { triggerHaptic } from '../services/haptics';

// Modular Caregiver Tabs
import { CaregiverLiveHubTab } from './caregiver/CaregiverLiveHubTab';
import { CaregiverAlertsTab } from './caregiver/CaregiverAlertsTab';
import { CaregiverDeviceLinkTab } from './caregiver/CaregiverDeviceLinkTab';
import { CaregiverPlansChangedTab } from './caregiver/CaregiverPlansChangedTab';
import { CaregiverHealthSummaryTab } from './caregiver/CaregiverHealthSummaryTab';
import { CaregiverCycleSummaryTab } from './caregiver/CaregiverCycleSummaryTab';
import { CaregiverDaySummaryTab } from './caregiver/CaregiverDaySummaryTab';
import { CaregiverSubscriptionTab } from './caregiver/CaregiverSubscriptionTab';
import { CaregiverResourcesTab } from './caregiver/CaregiverResourcesTab';
import { CaregiverVoiceStudioTab } from './caregiver/CaregiverVoiceStudioTab';
import { CaregiverIncomingAlertModal } from './caregiver/CaregiverIncomingAlertModal';

// Shared Components
import { FamilyAuthModal } from './FamilyAuthModal';
import { EmailVerificationModal } from './EmailVerificationModal';
import { getStoredFamilyAccount, getStoredEmailVerificationStatus } from '../services/authService';

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
    showEmailVerificationModal,
    setShowEmailVerificationModal,
    plansChanged,
    activatePlansChanged,
    medications,
    moodJournalEntries,
    subscription,
    isPremium,
    getTrialDaysRemaining,
    startFreeTrial,
    settings,
    updateSettings,
    showAboutMeModal,
    setShowAboutMeModal,
    getCyclePhaseInfo,
    caregiverResponses,
    setDailyRecollections,
    showAccessibilityModal,
    setShowAccessibilityModal,
    speak,
  } = useApp();

  type TabType =
    | 'home'
    | 'alerts'
    | 'caregiver'
    | 'plans-changed'
    | 'health-summary'
    | 'cycle-summary'
    | 'day-summary'
    | 'resources'
    | 'voice-studio'
    | 'subscription';

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<'all' | 'kids' | 'teens' | 'caring' | 'pro'>('all');
  const cyclePhaseInfo = getCyclePhaseInfo ? getCyclePhaseInfo() : { currentCycleDay: 1 };
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCaregiverTour, setShowCaregiverTour] = useState(false);
  const [showTourDirectoryModal, setShowTourDirectoryModal] = useState(false);
  const [activeTourSteps, setActiveTourSteps] = useState<CoachMarkStep[]>(() => SECTION_TOURS.fullApp.steps);
  const [currentTourName, setCurrentTourName] = useState<string>('Caregiver App Overview');
  const dashboardScrollRef = useRef<HTMLDivElement>(null);

  const [, setLangVersion] = useState(0);
  useEffect(() => {
    const handleLangChanged = () => setLangVersion((v) => v + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChanged);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChanged);
  }, []);

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
  const [incomingChildReply, setIncomingChildReply] = useState<{
    senderName: string;
    text: string;
    timestamp: string;
  } | null>(null);

  // Incoming Alert Pop-Up Modal & Device Push Notification State
  // Only pops up when a live incoming alert arrives in real time
  const [popupAlert, setPopupAlert] = useState<CaregiverAlert | null>(null);
  const [dismissedPopupAlertIds, setDismissedPopupAlertIds] = useState<Set<string>>(() => new Set());
  const dismissedPopupAlertIdsRef = useRef(dismissedPopupAlertIds);
  dismissedPopupAlertIdsRef.current = dismissedPopupAlertIds;
  const [deviceNotificationStatus, setDeviceNotificationStatus] = useState<string>(() => pushNotificationService.getPermissionStatus());

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
    setDeviceNotificationStatus(pushNotificationService.getPermissionStatus());

    const refreshSession = () => {
      fetchCaregiverSession(code).then((session) => {
        if (session) {
          setLiveChildStatus(session);
          if (session.dailyRecollections && Array.isArray(session.dailyRecollections) && session.dailyRecollections.length > 0) {
            setDailyRecollections(session.dailyRecollections);
          }
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

        // Immediately show the pop-up modal on screen!
        setPopupAlert(fullAlert);
        playChime('alert');
        triggerHaptic('warning', true);

        // Fire native device push notification with vibration & sound
        pushNotificationService.triggerAlertNotification({
          title: `BeeYou Alert: ${fullAlert.childName || childProfile.name || 'Child'}`,
          body: `${fullAlert.label}: ${fullAlert.note || 'Help requested'}${fullAlert.location ? ` • At ${fullAlert.location}` : ''}`,
          priority: 'emergency',
          tag: 'beeyou-alert-' + fullAlert.id,
        });

        showNotification(`Incoming Alert from ${alert.childName || childProfile.name || 'Child'}: ${alert.label}`);
      }
    });

    const unsubResolve = onCaregiverAlertResolve((alertId) => {
      setActiveAlerts((prev) => prev.filter((a) => !alertId || a.id !== alertId));
      setAlertHistoryList(getAlertHistory());
    });

    const unsubStatus = onChildStatusUpdate((status) => {
      setLiveChildStatus(status);
      if (status.dailyRecollections && Array.isArray(status.dailyRecollections) && status.dailyRecollections.length > 0) {
        setDailyRecollections(status.dailyRecollections);
      }
    });

    const seenMsgKeys = new Set<string>();
    const unsubMessage = onCaregiverMessage((msg) => {
      if (!msg || !msg.text) return;
      const rawSender = msg.senderName || childProfile.name || 'Child';
      const rawText = msg.text || '';
      const isFromChild = msg.senderRole === 'child' || (
        rawSender.trim().toLowerCase() !== 'caregiver' &&
        rawSender.trim().toLowerCase() !== 'parent'
      );

      if (isFromChild) {
        const msgKey = `${rawSender}:${rawText}:${msg.timestamp || ''}`;
        if (seenMsgKeys.has(msgKey)) return;
        seenMsgKeys.add(msgKey);

        const cleanText = rawText
          .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
          .replace(/\s+/g, ' ')
          .trim();

        setIncomingChildReply({
          senderName: rawSender,
          text: cleanText,
          timestamp: msg.timestamp || new Date().toISOString(),
        });
        showNotification(`${rawSender} replied: "${cleanText}"`);
        playChime('star');
      }
    });

    return () => {
      unsubAlert();
      unsubResolve();
      unsubStatus();
      unsubMessage();
      clearInterval(pollInterval);
    };
  }, []);

  const handleSendQuickNudge = async (title: string, text: string, emoji: string) => {
    await sendCaregiverMessage(getPairingCode(), text, 'Caregiver', emoji);
    showNotification(`Sent "${title}" alert to ${childProfile.name || 'Child'}'s device!`);
    playChime('tap');
  };

  const handleAcknowledgeAlert = async (alertId: string, responseMessage: string, responseId?: PredefinedCaregiverResponseId) => {
    await acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', responseMessage, responseId, alertId);
    await sendCaregiverMessage(getPairingCode(), responseMessage, 'Caregiver', '');
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setPopupAlert((prev) => (prev?.id === alertId ? null : prev));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification(`Sent response: "${responseMessage}" to child!`);
    playChime('star');
  };

  const handleTriggerTestAlert = async () => {
    const testAlert = await sendTestCaregiverAlert(getPairingCode(), childProfile.name || 'Child');
    setActiveAlerts((prev) => [testAlert, ...prev.filter((a) => a.id !== testAlert.id)]);
    setAlertHistoryList(getAlertHistory());
    setPopupAlert(testAlert);
    playChime('alert');
    triggerHaptic('warning', true);
    pushNotificationService.triggerAlertNotification({
      title: `BeeYou Alert: Test from ${childProfile.name || 'Child'}`,
      body: `${testAlert.label}: ${testAlert.note}`,
      priority: 'emergency',
      tag: 'beeyou-alert-' + testAlert.id,
    });
    showNotification(`Test alert triggered! Check pop-up and device notification.`);
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
    acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', 'Resolved by Caregiver', 'im_here', alertId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setPopupAlert((prev) => (prev?.id === alertId ? null : prev));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification(t('Alert marked as resolved.'));
    playChime('tap');
  };

  const handleEnableDeviceNotifications = async () => {
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

  const handleTestDeviceNotification = async () => {
    showNotification(t('Sending test notification to this device...'));
    playChime('alert');
    await pushNotificationService.sendTestNotification(childProfile.name || 'Child');
  };

  useEffect(() => {
    if (dashboardScrollRef.current) {
      dashboardScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const navGroups: {
    id: string;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    items: Array<{
      id: TabType;
      label: string;
      badge?: string;
    }>;
  }[] = [
    {
      id: 'live',
      title: 'Live & Safety',
      items: [
        {
          id: 'home',
          label: 'Caregiver Live Hub',
          badge: connectionStatus.isConnected ? t('Live') : (activeAlerts.length > 0 ? `${activeAlerts.length} ${t('Alert')}` : undefined),
        },
        {
          id: 'alerts',
          label: 'Live Alerts & SOS Inbox',
          badge: activeAlerts.length > 0 ? `${activeAlerts.length} ${t('Active')}` : undefined,
        },
        {
          id: 'caregiver',
          label: 'Live Caregiver Link',
          badge: connectionStatus.isConnected ? t('Paired') : t('Pair'),
        },
        {
          id: 'plans-changed',
          label: 'Plans Changed Mode',
          badge: plansChanged.active ? t('Active') : undefined,
        },
      ],
    },
    {
      id: 'summaries',
      title: 'Summaries & Health',
      items: [
        {
          id: 'health-summary',
          label: 'Medication Summary',
          badge: medications.some((m) => m.totalQuantity <= m.refillThreshold) ? t('Refill') : undefined,
        },
        {
          id: 'cycle-summary',
          label: 'Cycle Summary',
          badge: cyclePhaseInfo?.currentCycleDay ? `Day ${cyclePhaseInfo.currentCycleDay}` : undefined,
        },
        {
          id: 'day-summary',
          label: 'Day-to-Day Summary',
          badge: isPremium ? t('Clinical') : t('7 Days'),
        },
      ],
    },
    {
      id: 'resources',
      title: 'Community & Resources',
      items: [
        {
          id: 'resources',
          label: 'Regional Resources',
          badge: t('Directory'),
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences & Voices',
      items: [
        {
          id: 'voice-studio',
          label: 'Voice Studio & Preferences',
          badge: isPremium ? `${getVoicePersonasForLanguage(settings.language).length} ${t('Voices')}` : `1 ${t('Voice')}`,
        },
      ],
    },
    {
      id: 'account',
      title: 'Account & Plan',
      items: [
        {
          id: 'subscription',
          label: 'Membership & Plan',
          badge: isPremium ? (subscription.status === 'trial' ? `${getTrialDaysRemaining()} ${t('d Trial')}` : t('Premium')) : t('Free Plan'),
        },
      ],
    },
  ];

  const currentNavGroup = navGroups.find((g) => g.items.some((item) => item.id === activeTab)) || navGroups[0];
  const currentNavItem = navGroups.flatMap((g) => g.items).find((item) => item.id === activeTab) || navGroups[0].items[0];

  return (
    <div
      ref={dashboardScrollRef}
      className="h-[100dvh] max-h-[100dvh] w-full overflow-y-auto overscroll-contain bg-transparent flex flex-col text-slate-800 transition-colors duration-300"
    >
      {/* Top Caregiver Header */}
      <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-200/60'} backdrop-blur-md text-slate-900 px-3 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.625rem)] pb-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs border-b border-stone-200/70 transition-colors duration-300`}>
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
            <span className="hidden sm:inline">{t('Return to Child')}</span>
            <span className="sm:hidden">{t('Back')}</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">
              {t('Caregiver Hub')}
            </h1>
            {childProfile.name?.trim() && (
              <span className="text-xs text-slate-500 font-medium truncate hidden sm:inline">
                • {childProfile.name.trim()}
              </span>
            )}
          </div>
        </div>

        {/* Right: Device Alerts, Feature Guide & Plans Changed Status */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Device Push Notifications Toggle / Test Pill */}
          {deviceNotificationStatus === 'granted' ? (
            <button
              type="button"
              onClick={handleTestDeviceNotification}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              title={t('Device notifications are enabled. Tap to test vibration and sound.')}
            >
              <span className="hidden sm:inline">{t('Alerts Active')}</span>
              <span className="sm:hidden">{t('Alerts')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnableDeviceNotifications}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs animate-pulse"
              title={t('Enable sound and notification alerts on this device')}
            >
              <span className="hidden sm:inline">{t('Enable Device Alerts')}</span>
              <span className="sm:hidden">{t('Alerts')}</span>
            </button>
          )}

          {/* Language Dropdown Choices */}
          <LanguageDropdown align="left" />

          {/* Sensory Preferences & 20-Voice Studio Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('voice-studio');
              playChime('tap');
            }}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1.5 border ${
              activeTab === 'voice-studio'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
            }`}
            title={t('Sensory, Accessibility & Voice Studio')}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('Voice Studio & Sensory')}</span>
            <span className="sm:hidden">{t('Voices')}</span>
          </button>

          <button
            type="button"
            onClick={handleStartTour}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-950 dark:text-amber-100 text-xs font-black transition-all active:scale-95 cursor-pointer border border-amber-300/80 shadow-2xs"
            title={t('Launch Interactive In-Place Coachmark Tour')}
          >
            <span className="hidden sm:inline">{t('Feature Tour (Guide)')}</span>
            <span className="sm:hidden">{t('Guide')}</span>
          </button>

          {plansChanged.active && (
            <button
              onClick={() => {
                activatePlansChanged({ active: false });
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500 text-white animate-pulse shadow-xs cursor-pointer"
              title={t('Plans Changed is active for child. Tap to turn off.')}
            >
              <span className="text-[11px]">{t('Plans Changed Active')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Unverified Email Notice for Trial & Premium Access */}
      {(() => {
        const storedAcc = getStoredFamilyAccount();
        const isVerified = getStoredEmailVerificationStatus();
        if (storedAcc && !storedAcc.isDemoAccount && !isVerified) {
          return (
            <div className="bg-amber-500/15 border-b border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 px-4 py-2.5 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span>
                  {t('Verify your email')} (<strong>{storedAcc.email}</strong>) {t("so you can try the 15-day free Premium trial whenever you're ready.")}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEmailVerificationModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>{t('Verify Email')}</span>
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-in fade-in">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Layout: Sidebar Tabs / Mobile Dropdown + Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row p-2.5 sm:p-6 gap-3 sm:gap-5">
        {/* Mobile Navigation: 4 Domain Quick Tabs + Categorized Select Dropdown */}
        <div className="md:hidden flex flex-col gap-2 w-full bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border-2 border-stone-200/80 shadow-xs">
          {/* 4 Domain Filter Pills */}
          <div className="grid grid-cols-3 gap-1.5">
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
                  className={`flex items-center justify-center py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isGroupActive
                      ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className="text-xs leading-tight truncate max-w-full font-bold">
                    {t(group.title)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categorized Dropdown Selector */}
          <div className="relative flex items-center">
            <select
              aria-label="Select Caregiver Section"
              value={activeTab}
              onChange={(e) => {
                const newTab = e.target.value as TabType;
                setActiveTab(newTab);
                playChime('tap');
              }}
              className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 focus:bg-white text-slate-900 font-black text-xs sm:text-sm rounded-xl border-2 border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 outline-none transition-all appearance-none cursor-pointer"
            >
              {currentNavGroup.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.label)} {item.badge ? `(${t(item.badge)})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Desktop Categorized Sidebar */}
        <aside className="hidden md:flex md:w-64 bg-white/95 backdrop-blur-md rounded-3xl p-3 border-2 border-stone-200/80 shadow-xs flex-col gap-4 shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto">
          {navGroups.map((group) => {
            return (
              <div key={group.id} className="flex flex-col gap-1">
                <div className="px-2 py-1 text-[11px] font-black tracking-wider uppercase text-slate-600 dark:text-slate-400">
                  <span>{t(group.title)}</span>
                </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      data-tour={`caregiver-tab-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        playChime('tap');
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs font-black`
                          : `hover:${activeTheme?.palette?.primaryLight || 'hover:bg-amber-50'} text-slate-700`
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{t(item.label)}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                            isActive
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
          );
        })}
      </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-7 border-2 border-stone-200/80 shadow-xs">

          {/* INCOMING CHILD REPLY BANNER (Instant notification when child replies or sends a note) */}
          {incomingChildReply && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-md flex items-center justify-between gap-4 animate-in slide-in-from-top-2 ring-2 ring-amber-200">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t('Reply from')} {incomingChildReply.senderName || childProfile.name || 'Child'}</span>
                </div>
                <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5 break-words">
                  "{incomingChildReply.text}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIncomingChildReply(null);
                  playChime('tap');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
                title={t('Dismiss')}
              >
                <span>{t('Got it')}</span>
              </button>
            </div>
          )}

          {/* URGENT LIVE ALERT PERSISTENT BANNER (Visible on all tabs) */}
          {activeAlerts.length > 0 && activeTab !== 'alerts' && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in ring-2 ring-rose-200">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <span className="flex h-3.5 w-3.5 relative shrink-0 mt-0.5 sm:mt-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-rose-950 text-sm flex items-center gap-2 flex-wrap">
                    <span>{t('Live Emergency Alert from')} {activeAlerts[0].childName || childProfile.name}:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-200 text-rose-900 font-extrabold text-xs">
                      <span>{t(activeAlerts[0].label)}</span>
                    </span>
                  </div>
                  <div className="text-xs text-rose-700 font-medium mt-0.5 break-words">
                    {activeAlerts[0].location ? `${t('Location:')} ${t(activeAlerts[0].location)} • ` : ''}
                    {t(activeAlerts[0].note || 'Child requested immediate support.')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap shrink-0">
                {getQuickRepliesForAlert(activeAlerts[0], t).slice(0, 2).map((reply) => {
                  const cleanLabel = reply.label.replace(/^[🚗❤️💖⏳🌟🎉👏👍 ]+/, '');
                  return (
                    <button
                      key={reply.id}
                      type="button"
                      onClick={() => handleAcknowledgeAlert(activeAlerts[0].id, reply.text, reply.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition flex items-center justify-center ${reply.className}`}
                    >
                      <span>{cleanLabel || reply.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setPopupAlert(activeAlerts[0]);
                    playChime('tap');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center cursor-pointer transition whitespace-nowrap active:scale-95"
                >
                  <span>{t('Reply in Pop-Up')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('alerts');
                    playChime('tap');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap active:scale-95"
                >
                  <span>{t("Open Alerts Inbox")}</span>
                  <span>→</span>
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
              onOpenAlertPopup={(alert) => setPopupAlert(alert)}
            />
          )}

          {/* TAB: SUBSCRIPTION, BILLING & LIFECYCLE MANAGEMENT */}
          {activeTab === 'subscription' && (
            <CaregiverSubscriptionTab 
              showNotification={showNotification}
              onStartTour={() => handleStartSectionTour('subscription')}
            />
          )}

          {/* TAB: CAREGIVER LIVE LINK & REMOTE MONITOR */}
          {activeTab === 'caregiver' && (
            <CaregiverDeviceLinkTab
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('pairing')}
            />
          )}

          {/* TAB: PLANS CHANGED SYSTEM */}
          {activeTab === 'plans-changed' && (
            <CaregiverPlansChangedTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('plansChanged')}
            />
          )}

          {/* TAB: HEALTH & MEDICATION REFILL SUMMARY */}
          {activeTab === 'health-summary' && (
            <CaregiverHealthSummaryTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('healthSummary')}
              setActiveTab={(tab: any) => setActiveTab(tab)}
            />
          )}

          {/* TAB: CYCLE & HORMONAL RHYTHM SUMMARY */}
          {activeTab === 'cycle-summary' && (
            <CaregiverCycleSummaryTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('healthSummary')}
              setActiveTab={(tab: any) => setActiveTab(tab)}
            />
          )}

          {/* TAB: DAY-TO-DAY SUMMARY & THERAPIST REPORT */}
          {activeTab === 'day-summary' && (
            <CaregiverDaySummaryTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('daySummary')}
            />
          )}

          {/* TAB: CAREGIVER & REGIONAL RESOURCES */}
          {activeTab === 'resources' && (
            <CaregiverResourcesTab 
              onShowNotification={showNotification}
              onStartTour={() => handleStartSectionTour('resources')}
            />
          )}

          {/* TAB: VOICE STUDIO & SENSORY PREFERENCES */}
          {activeTab === 'voice-studio' && (
            <CaregiverVoiceStudioTab 
              onShowNotification={showNotification}
            />
          )}
        </main>
      </div>

      {/* Live Incoming Alert Pop-Up Modal with Quick & Custom Reply */}
      <CaregiverIncomingAlertModal
        isOpen={!!popupAlert}
        alert={popupAlert}
        childName={popupAlert?.childName || childProfile.name || 'Child'}
        customResponses={caregiverResponses}
        onClose={() => {
          if (popupAlert) {
            setDismissedPopupAlertIds((prev) => new Set(prev).add(popupAlert.id));
          }
          setPopupAlert(null);
        }}
        onResolve={(alertId) => {
          handleResolveAlert(alertId);
          setPopupAlert(null);
        }}
        onReply={async (alertId, text, responseId) => {
          await handleAcknowledgeAlert(alertId, text, responseId as any);
          setPopupAlert(null);
        }}
      />

      {/* Shared Family Email & 1-Click Demo Modal */}
      <FamilyAuthModal
        isOpen={showFamilyAuthModal}
        onClose={() => setShowFamilyAuthModal(false)}
      />

      {/* Email Verification Modal for 15-Day Free Trial & Premium */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        onVerified={() => {
          startFreeTrial();
          showNotification('Email verified! Your 15-day free trial has started.');
        }}
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

      {/* Caregiver Portal Modals */}
      <Suspense fallback={null}>
        <PlansChangedModal />
        <AboutMeIDModal
          isOpen={showAboutMeModal}
          onClose={() => setShowAboutMeModal(false)}
        />
        <DailyRecollectionModal />
        {showAccessibilityModal && (
          <AccessibilityPreferencesModal />
        )}
      </Suspense>
    </div>
  );
};
