/**
 * BeeYou Dedicated User / Child Tablet Application
 * Features AAC speech, visual schedules (My Day), Life Skills, Adventures, Feelings check-in, and instant SOS alerts.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppProvider, useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { ChildHeader } from './ChildHeader';
import { t } from '../services/translator';
import { ChildNavBar } from './ChildNavBar';
import { ChildHomeView } from './ChildHomeView';
import { QuickPhrasesDrawer } from './QuickPhrasesDrawer';
import { PinModal } from './PinModal';
import { CaregiverMessageToast } from './CaregiverMessageToast';
import { OfflineIndicator } from './OfflineIndicator';
import { ThemeWallpaperArt } from './ThemeWallpaperArt';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './ConnectionFeedbackModal';
import { setActiveDeviceView } from '../services/authService';
import { setPairingCode, subscribeToCloudChannel, onDevicePairingEvent } from '../services/caregiverSync';
import { SensoryEmergencyButton } from './SensoryEmergencyButton';
import { SensorySafeModeOverlay } from './SensorySafeModeOverlay';
import { useModalBackHandler } from '../services/modalBackHandler';
import { useMobileHardwareBack } from '../hooks/useMobileHardwareBack';

// Lazy-loaded child views
const AACView = lazy(() => import('./AACView').then((m) => ({ default: m.AACView })));
const CommunicateView = lazy(() => import('./CommunicateView').then((m) => ({ default: m.CommunicateView })));
const MeView = lazy(() => import('./MeView').then((m) => ({ default: m.MeView })));
const MyRoutineView = lazy(() => import('./MyRoutineView').then((m) => ({ default: m.MyRoutineView })));
const MyDayView = lazy(() => import('./MyDayView').then((m) => ({ default: m.MyDayView })));
const ToolsView = lazy(() => import('./ToolsView').then((m) => ({ default: m.ToolsView })));
const AdventuresView = lazy(() => import('./AdventuresView').then((m) => ({ default: m.AdventuresView })));
const SkillsView = lazy(() => import('./SkillsView').then((m) => ({ default: m.SkillsView })));
const FeelingsView = lazy(() => import('./FeelingsView').then((m) => ({ default: m.FeelingsView })));

// Lazy-loaded child tools and modals
const OnboardingModal = lazy(() => import('./onboarding/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const CaregiverHelpHub = lazy(() => import('./caregiver/CaregiverHelpHub').then(m => ({ default: m.CaregiverHelpHub })));
const AACExperiencePromptModal = lazy(() => import('./onboarding/AACExperiencePromptModal').then(m => ({ default: m.AACExperiencePromptModal })));
const AdaptiveOnboardingFlow = lazy(() => import('./AdaptiveOnboardingFlow').then(m => ({ default: m.AdaptiveOnboardingFlow })));
const CopingToolkitModal = lazy(() => import('./CopingToolkitModal').then(m => ({ default: m.CopingToolkitModal })));
const PlansChangedModal = lazy(() => import('./PlansChangedModal').then(m => ({ default: m.PlansChangedModal })));
const MorningBriefModal = lazy(() => import('./MorningBriefModal').then(m => ({ default: m.MorningBriefModal })));
const ConnectCaregiverModal = lazy(() => import('./ConnectCaregiverModal').then(m => ({ default: m.ConnectCaregiverModal })));
const CaregiverAlertModal = lazy(() => import('./CaregiverAlertModal').then(m => ({ default: m.CaregiverAlertModal })));
const RoutineStickerCelebrationModal = lazy(() => import('./RoutineStickerCelebrationModal').then(m => ({ default: m.RoutineStickerCelebrationModal })));
const AboutMeIDModal = lazy(() => import('./AboutMeIDModal').then(m => ({ default: m.AboutMeIDModal })));
const MedicationRemindersModal = lazy(() => import('./MedicationRemindersModal').then(m => ({ default: m.MedicationRemindersModal })));
const MoodJournalModal = lazy(() => import('./MoodJournalModal').then(m => ({ default: m.MoodJournalModal })));
const CycleTrackerModal = lazy(() => import('./CycleTrackerModal').then(m => ({ default: m.CycleTrackerModal })));
const DailyRecollectionModal = lazy(() => import('./DailyRecollectionModal').then(m => ({ default: m.DailyRecollectionModal })));
const EmergencySensoryModal = lazy(() => import('./EmergencySensoryModal').then(m => ({ default: m.EmergencySensoryModal })));
const FivePointScaleModal = lazy(() => import('./FivePointScaleModal').then(m => ({ default: m.FivePointScaleModal })));
const DecisionWheelModal = lazy(() => import('./DecisionWheelModal').then(m => ({ default: m.DecisionWheelModal })));
const CommunicationPassportModal = lazy(() => import('./CommunicationPassportModal').then(m => ({ default: m.CommunicationPassportModal })));
const SpoonBudgetModal = lazy(() => import('./SpoonBudgetModal').then(m => ({ default: m.SpoonBudgetModal })));
const PieTimerModal = lazy(() => import('./PieTimerModal').then(m => ({ default: m.PieTimerModal })));
const DigitalFidgetModal = lazy(() => import('./DigitalFidgetModal').then(m => ({ default: m.DigitalFidgetModal })));
const AacKeyboardModal = lazy(() => import('./AacKeyboardModal').then(m => ({ default: m.AacKeyboardModal })));
const AccessibilityPreferencesModal = lazy(() => import('./AccessibilityPreferencesModal').then(m => ({ default: m.AccessibilityPreferencesModal })));
const DashboardCustomizerModal = lazy(() => import('./DashboardCustomizerModal').then(m => ({ default: m.DashboardCustomizerModal })));
const EditAlertsModal = lazy(() => import('./EditAlertsModal').then(m => ({ default: m.EditAlertsModal })));
const EditCalmModal = lazy(() => import('./EditCalmModal').then(m => ({ default: m.EditCalmModal })));
const FamilyAuthModal = lazy(() => import('./FamilyAuthModal').then(m => ({ default: m.FamilyAuthModal })));
const ParentDashboard = lazy(() => import('./ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const Rewards = lazy(() => import('./Rewards').then(m => ({ default: m.Rewards })));
const StickerScrapbookView = lazy(() => import('./StickerScrapbookView').then(m => ({ default: m.StickerScrapbookView })));
const PrintScheduleModal = lazy(() => import('./PrintScheduleModal').then(m => ({ default: m.PrintScheduleModal })));
const ThemeCustomizerModal = lazy(() => import('./ThemeCustomizerModal').then(m => ({ default: m.ThemeCustomizerModal })));
const PaywallModal = lazy(() => import('./PaywallModal').then(m => ({ default: m.PaywallModal })));

const ChildAppContent: React.FC = () => {
  const { 
    childView, 
    setChildView,
    showCaregiverModal, 
    setShowCaregiverModal,
    showFamilyAuthModal,
    setShowFamilyAuthModal,
    showCaregiverAlertModal,
    setShowCaregiverAlertModal,
    activeTheme,
    showOnboardingModal,
    setShowOnboardingModal,
    enabledFeatures,
    showAboutMeModal,
    setShowAboutMeModal,
    showRecollectionModal,
    setShowRecollectionModal,
    showCycleTrackerModal,
    setShowCycleTrackerModal,
    showCopingToolkit,
    showPlansChangedModal,
    showMorningBrief,
    newlyAwardedSticker,
    showPrintScheduleModal,
    showThemeModal,
    showMedicationModal,
    showMoodJournalModal,
    showEmergencyModal,
    showFivePointModal,
    showDecisionWheelModal,
    showPassportModal,
    showSpoonModal,
    showPieTimerModal,
    showFidgetModal,
    showAacKeyboardModal,
    showAccessibilityModal,
    showDashboardCustomizer,
    showEditAlertsModal,
    showEditCalmModal,
    showPaywallModal,
    setShowPaywallModal,
    paywallTriggerReason,
    settings,
    isParentMode,
    isSafeModeActive,
  } = useApp();

  // Prefetch high-priority views during idle browser time
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./AACView');
      import('./CommunicateView');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const [globalFeedbackState, setGlobalFeedbackState] = useState<ConnectionFeedbackState | null>(null);
  const [pieTimerMounted, setPieTimerMounted] = useState(false);
  useEffect(() => {
    if (showPieTimerModal) setPieTimerMounted(true);
  }, [showPieTimerModal]);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  // 6-Step Gradual Interactive AAC Onboarding Tour State (Only triggered when clicking AAC / requested, never automatically upon signup)
  const [showInteractiveOnboarding, setShowInteractiveOnboarding] = useState<boolean>(false);

  const isAacEnabled = 
    enabledFeatures?.aacCommunication !== false && 
    enabledFeatures?.aac !== false && 
    settings?.features?.aacCommunication !== false && 
    settings?.features?.aac !== false;

  useEffect(() => {
    if (!isAacEnabled && (childView === 'aac' || childView === 'communicate')) {
      setChildView('home');
    }
  }, [isAacEnabled, childView, setChildView]);

  // First-Time AAC Experience Knowledge Prompt Modal State ("Do you know how AAC works?")
  const [showAacExperiencePrompt, setShowAacExperiencePrompt] = useState<boolean>(false);

  // Companion Caregiver Help Hub Modal State
  const [showCaregiverHelpHub, setShowCaregiverHelpHub] = useState<boolean>(false);

  // Hardware Back Button (Android Capacitor) & Keyboard Escape Handler
  useMobileHardwareBack({
    onNavigateBack: () => {
      if (childView !== 'home') {
        setChildView('home');
        return true;
      }
      return false;
    },
  });

  useModalBackHandler(showCaregiverHelpHub, () => setShowCaregiverHelpHub(false));
  useModalBackHandler(showInteractiveOnboarding, () => setShowInteractiveOnboarding(false));
  useModalBackHandler(showAacExperiencePrompt, () => setShowAacExperiencePrompt(false));
  useModalBackHandler(showCaregiverModal, () => setShowCaregiverModal(false));
  useModalBackHandler(showCaregiverAlertModal, () => setShowCaregiverAlertModal(false));
  useModalBackHandler(showPaywallModal, () => setShowPaywallModal(false));
  useModalBackHandler(showOnboardingModal, () => setShowOnboardingModal(false));
  useModalBackHandler(showAboutMeModal, () => setShowAboutMeModal(false));
  useModalBackHandler(showRecollectionModal, () => setShowRecollectionModal(false));
  useModalBackHandler(showCycleTrackerModal, () => setShowCycleTrackerModal(false));
  useModalBackHandler(!!globalFeedbackState, () => setGlobalFeedbackState(null));

  useEffect(() => {
    const handleOpenHelpHub = () => setShowCaregiverHelpHub(true);
    const handleStartTour = () => setShowInteractiveOnboarding(true);
    const handleOpenAacPrompt = () => setShowAacExperiencePrompt(true);

    window.addEventListener('beeyou_open_caregiver_help_hub', handleOpenHelpHub);
    window.addEventListener('beeyou_replay_onboarding_tour', handleStartTour);
    window.addEventListener('beeyou_start_onboarding_tour', handleStartTour);
    window.addEventListener('beeyou_open_aac_prompt', handleOpenAacPrompt);
    return () => {
      window.removeEventListener('beeyou_open_caregiver_help_hub', handleOpenHelpHub);
      window.removeEventListener('beeyou_replay_onboarding_tour', handleStartTour);
      window.removeEventListener('beeyou_start_onboarding_tour', handleStartTour);
      window.removeEventListener('beeyou_open_aac_prompt', handleOpenAacPrompt);
    };
  }, []);

  // When navigating to the AAC view for the very first time, show the "Do you know how AAC works?" prompt
  useEffect(() => {
    if (childView === 'aac') {
      try {
        const promptDone = localStorage.getItem('beeyou_aac_prompt_completed');
        if (promptDone !== 'true') {
          setShowAacExperiencePrompt(true);
        }
      } catch {}
    }
  }, [childView]);

  useEffect(() => {
    if (sessionStorage.getItem('beeyou_active_device_view') !== 'caregiver') {
      setActiveDeviceView('child');
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) {
        const cleanCode = codeParam.trim().toUpperCase();
        setPairingCode(cleanCode);
        subscribeToCloudChannel(cleanCode);
      }
    }

    const unsubPair = onDevicePairingEvent((evt) => {
      if (evt.type === 'DEVICE_PAIRED') {
        const caregiverName = evt.session?.caregiverName || 'Caregiver';

        setGlobalFeedbackState({
          isOpen: true,
          type: 'success',
          role: 'child_device',
          peerName: caregiverName,
          pairingCode: evt.pairingCode,
        });
      }
    });

    return () => unsubPair();
  }, []);

  // When tab changes, reset scroll smoothly to top
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [childView]);

  if (isSafeModeActive) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-black overflow-hidden relative select-none touch-none">
        <SensorySafeModeOverlay />
      </div>
    );
  }

  const a11yClasses = [
    settings.highContrast ? 'beeyou-high-contrast' : '',
    settings.textSize === 'large' ? 'beeyou-text-large' : settings.textSize === 'extra_large' ? 'beeyou-text-xl' : '',
    settings.dyslexiaFont ? 'beeyou-dyslexia-font' : '',
    settings.largeButtonMode ? 'beeyou-large-targets' : '',
  ].filter(Boolean).join(' ');

  return (
    <div 
      data-high-contrast={settings.highContrast ? 'true' : 'false'}
      data-text-size={settings.textSize || 'standard'}
      data-reduce-motion={settings.reduceMotion ? 'true' : 'false'}
      className={`w-full ${isParentMode ? 'min-h-screen bg-slate-950 text-slate-100' : `h-[100dvh] max-h-[100dvh] ${activeTheme?.palette?.appBg || 'bg-amber-50/40'} ${a11yClasses} text-slate-800 flex flex-col`} font-sans selection:bg-amber-200 overflow-hidden relative transition-colors duration-500`}
    >
      {isParentMode ? (
        <Suspense fallback={<div className="h-screen w-screen bg-slate-950" />}>
          <ParentDashboard />
          <CaregiverMessageToast />
          <OfflineIndicator />
        </Suspense>
      ) : (
        <>
          {/* Theme Art Layer */}
          <ThemeWallpaperArt
            themeId={activeTheme?.id}
            pattern={activeTheme?.wallpaperPattern}
            category={activeTheme?.category}
            wallpaperUrl={activeTheme?.palette?.wallpaperUrl}
            reduceMotion={settings.reduceMotion}
          />

          {/* Child Top Header */}
          <header className="shrink-0 z-30 relative">
            <ChildHeader />
          </header>

          {/* Main Content View Switcher */}
          <main 
            ref={mainScrollRef} 
            className={`flex-1 ${childView === 'aac' ? 'overflow-hidden flex flex-col p-1 sm:p-2' : 'overflow-y-auto p-2 sm:p-4'} overscroll-contain relative z-10`}
          >
            <Suspense fallback={null}>
              {childView === 'home' && <ChildHomeView />}
              {childView === 'aac' && <AACView />}
              {childView === 'communicate' && <CommunicateView />}
              {childView === 'me' && <MeView />}
              {childView === 'my-routine' && <MyRoutineView />}
              {childView === 'tools' && <ToolsView />}
              {childView === 'my-day' && <MyDayView />}
              {childView === 'adventures' && <AdventuresView />}
              {childView === 'skills' && <SkillsView />}
              {childView === 'feelings' && <FeelingsView />}
              {childView === 'rewards' && <Rewards />}
              {childView === 'scrapbook' && <StickerScrapbookView />}
            </Suspense>
          </main>

          {/* Persistent High-Contrast Sensory Emergency Button (only if user explicitly turned it on) */}
          {enabledFeatures?.emergencyAlertSOS === true && (
            <SensoryEmergencyButton />
          )}

          {/* Navigation Footer */}
          <footer className="shrink-0 z-20">
            <ChildNavBar />
          </footer>

          {/* Real-time Caregiver Message Toast */}
          <CaregiverMessageToast />

          {/* Offline Status & Diagnostic Indicator */}
          <OfflineIndicator />
        </>
      )}

      {/* Global Modals & Drawers */}
      <QuickPhrasesDrawer />
      <PinModal />

      <Suspense fallback={null}>
        {showCopingToolkit && <CopingToolkitModal />}
        {showPlansChangedModal && <PlansChangedModal />}
        {showMorningBrief && <MorningBriefModal />}
        {showCaregiverModal && (
          <ConnectCaregiverModal 
            isOpen={showCaregiverModal} 
            onClose={() => setShowCaregiverModal(false)} 
            initialTab="enter_code"
          />
        )}
        {showCaregiverAlertModal && (
          <CaregiverAlertModal
            isOpen={showCaregiverAlertModal}
            onClose={() => setShowCaregiverAlertModal(false)}
          />
        )}
        {newlyAwardedSticker && <RoutineStickerCelebrationModal />}
        {showPrintScheduleModal && <PrintScheduleModal />}
        {showThemeModal && <ThemeCustomizerModal />}

        {/* First-Time AAC Experience Knowledge Prompt Modal ("Do you know how AAC works?") */}
        {showAacExperiencePrompt && (
          <AACExperiencePromptModal
            isOpen={showAacExperiencePrompt}
            onSelectKnowledgeable={() => {
              try {
                localStorage.setItem('beeyou_aac_prompt_completed', 'true');
                localStorage.setItem('beeyou_aac_experience_known', 'yes');
                localStorage.setItem('beeyou_grid_stage', '3');
                window.dispatchEvent(new CustomEvent('beeyou_grid_stage_change', { detail: { stage: 3 } }));
              } catch {}
              setShowAacExperiencePrompt(false);
            }}
            onSelectNewToAAC={() => {
              try {
                localStorage.setItem('beeyou_aac_prompt_completed', 'true');
                localStorage.setItem('beeyou_aac_experience_known', 'no');
              } catch {}
              setShowAacExperiencePrompt(false);
              setShowInteractiveOnboarding(true);
            }}
            onClose={() => setShowAacExperiencePrompt(false)}
          />
        )}

        {/* 6-Step Gradual Interactive AAC Onboarding Tour */}
        {showInteractiveOnboarding && (
          <OnboardingModal
            isOpen={showInteractiveOnboarding}
            onClose={() => setShowInteractiveOnboarding(false)}
          />
        )}

        {/* Companion Caregiver Help Hub Drawer / Modal */}
        {showCaregiverHelpHub && (
          <CaregiverHelpHub
            isOpen={showCaregiverHelpHub}
            onClose={() => setShowCaregiverHelpHub(false)}
            onReplayTour={() => setShowInteractiveOnboarding(true)}
          />
        )}

        {/* 4-Step Adaptive Setup Onboarding Flow */}
        {showOnboardingModal && (
          <AdaptiveOnboardingFlow
            isOpen={showOnboardingModal}
            onClose={() => setShowOnboardingModal(false)}
            canDismiss={true}
          />
        )}

        {/* About Me & Emergency ID Card Modal */}
        {showAboutMeModal && (
          <AboutMeIDModal
            isOpen={showAboutMeModal}
            onClose={() => setShowAboutMeModal(false)}
          />
        )}

        {/* Medication & Health Reminders Modal */}
        {showMedicationModal && <MedicationRemindersModal />}

        {/* Teen & Adult Deep Mood Reflection Journal Modal */}
        {showMoodJournalModal && <MoodJournalModal />}

        {/* Cycle & Hormonal Rhythm Tracker Modal */}
        {showCycleTrackerModal && <CycleTrackerModal />}

        {/* Daily Mood & Recollection Check-in Modal */}
        {showRecollectionModal && <DailyRecollectionModal />}

        {/* Emergency Sensory Red Button Modal */}
        {showEmergencyModal && <EmergencySensoryModal />}

        {/* Incredible 5-Point Scale Modal */}
        {showFivePointModal && <FivePointScaleModal />}

        {/* Decision Wheel Modal */}
        {showDecisionWheelModal && <DecisionWheelModal />}

        {/* Communication Passport Modal */}
        {showPassportModal && <CommunicationPassportModal />}

        {/* Spoon Theory Energy Budget Modal */}
        {showSpoonModal && <SpoonBudgetModal />}

        {/* Visual Pie Clock (Time Timer) Modal */}
        {(showPieTimerModal || pieTimerMounted) && <PieTimerModal />}

        {/* Digital Sensory Fidget Toys Modal */}
        {showFidgetModal && <DigitalFidgetModal />}

        {/* Dyslexia-Friendly AAC Keyboard Modal */}
        {showAacKeyboardModal && <AacKeyboardModal />}

        {/* Accessibility & Sensory Preferences Hub Modal */}
        {showAccessibilityModal && <AccessibilityPreferencesModal />}

        {/* Editable Dashboard Customizer Modal */}
        {showDashboardCustomizer && <DashboardCustomizerModal />}

        {/* Editable Help Alerts & Caregiver Responses Customizer Modal */}
        {showEditAlertsModal && <EditAlertsModal />}

        {/* Editable Calm Tools & Breathing Pacer Customizer Modal */}
        {showEditCalmModal && <EditCalmModal />}

        {/* Global Connection Feedback Modal */}
        {globalFeedbackState && (
          <ConnectionFeedbackModal
            state={globalFeedbackState}
            onClose={() => setGlobalFeedbackState(null)}
            onOpenCamera={() => setShowCaregiverModal(true)}
          />
        )}

        {/* BeeYou Plus Paywall & Subscription Modal */}
        {showPaywallModal && (
          <PaywallModal
            isOpen={showPaywallModal}
            onClose={() => setShowPaywallModal(false)}
            reason={paywallTriggerReason}
          />
        )}

        {/* Shared Family Email & Demo Modal */}
        {showFamilyAuthModal && (
          <FamilyAuthModal
            isOpen={showFamilyAuthModal}
            onClose={() => setShowFamilyAuthModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
};

export const ChildApp: React.FC = () => {
  return (
    <AppProvider initialRole="child">
      <ChildAppContent />
    </AppProvider>
  );
};
