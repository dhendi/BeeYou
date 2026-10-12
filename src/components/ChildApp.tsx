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
import { AACView } from './AACView';
import { CommunicateView } from './CommunicateView';
import { MeView } from './MeView';
import { MyRoutineView } from './MyRoutineView';
import { ToolsView } from './ToolsView';
import { MyDayView } from './MyDayView';
import { AdventuresView } from './AdventuresView';
import { SkillsView } from './SkillsView';
import { FeelingsView } from './FeelingsView';
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
import { AdaptiveOnboardingFlow } from './AdaptiveOnboardingFlow';
import { OnboardingModal } from './onboarding/OnboardingModal';
import { CaregiverHelpHub } from './caregiver/CaregiverHelpHub';
import { AACExperiencePromptModal } from './onboarding/AACExperiencePromptModal';

// Lazy-loaded child tools and modals
const CopingToolkitModal = lazy(() => import('./CopingToolkitModal').then(m => ({ default: m.CopingToolkitModal })));
const PlansChangedModal = lazy(() => import('./PlansChangedModal').then(m => ({ default: m.PlansChangedModal })));
const MorningBriefModal = lazy(() => import('./MorningBriefModal').then(m => ({ default: m.MorningBriefModal })));
const ConnectCaregiverModal = lazy(() => import('./ConnectCaregiverModal').then(m => ({ default: m.ConnectCaregiverModal })));
const CaregiverAlertModal = lazy(() => import('./CaregiverAlertModal').then(m => ({ default: m.CaregiverAlertModal })));
const RoutineStickerCelebrationModal = lazy(() => import('./RoutineStickerCelebrationModal').then(m => ({ default: m.RoutineStickerCelebrationModal })));
const DailyRecollectionModal = lazy(() => import('./DailyRecollectionModal').then(m => ({ default: m.DailyRecollectionModal })));
const ThemeCustomizerModal = lazy(() => import('./ThemeCustomizerModal').then(m => ({ default: m.ThemeCustomizerModal })));
const OnboardingWizardModal = lazy(() => import('./OnboardingWizardModal').then(m => ({ default: m.OnboardingWizardModal })));
const AboutMeIDModal = lazy(() => import('./AboutMeIDModal').then(m => ({ default: m.AboutMeIDModal })));
const MedicationRemindersModal = lazy(() => import('./MedicationRemindersModal').then(m => ({ default: m.MedicationRemindersModal })));
const MoodJournalModal = lazy(() => import('./MoodJournalModal').then(m => ({ default: m.MoodJournalModal })));
const CycleTrackerModal = lazy(() => import('./CycleTrackerModal').then(m => ({ default: m.CycleTrackerModal })));
const SubscriptionModal = lazy(() => import('./SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const EmergencySensoryModal = lazy(() => import('./EmergencySensoryModal').then(m => ({ default: m.EmergencySensoryModal })));
const FivePointScaleModal = lazy(() => import('./FivePointScaleModal').then(m => ({ default: m.FivePointScaleModal })));
const DecisionWheelModal = lazy(() => import('./DecisionWheelModal').then(m => ({ default: m.DecisionWheelModal })));
const CommunicationPassportModal = lazy(() => import('./CommunicationPassportModal').then(m => ({ default: m.CommunicationPassportModal })));
const SpoonBudgetModal = lazy(() => import('./SpoonBudgetModal').then(m => ({ default: m.SpoonBudgetModal })));
const PieTimerModal = lazy(() => import('./PieTimerModal').then(m => ({ default: m.PieTimerModal })));
const DigitalFidgetModal = lazy(() => import('./DigitalFidgetModal').then(m => ({ default: m.DigitalFidgetModal })));
const AacKeyboardModal = lazy(() => import('./AacKeyboardModal').then(m => ({ default: m.AacKeyboardModal })));
const ToolsHubModal = lazy(() => import('./ToolsHubModal').then(m => ({ default: m.ToolsHubModal })));
const AccessibilityPreferencesModal = lazy(() => import('./AccessibilityPreferencesModal').then(m => ({ default: m.AccessibilityPreferencesModal })));
const DashboardCustomizerModal = lazy(() => import('./DashboardCustomizerModal').then(m => ({ default: m.DashboardCustomizerModal })));
const EditAlertsModal = lazy(() => import('./EditAlertsModal').then(m => ({ default: m.EditAlertsModal })));
const EditCalmModal = lazy(() => import('./EditCalmModal').then(m => ({ default: m.EditCalmModal })));
const FamilyAuthModal = lazy(() => import('./FamilyAuthModal').then(m => ({ default: m.FamilyAuthModal })));
const ParentDashboard = lazy(() => import('./ParentDashboard').then(m => ({ default: m.ParentDashboard })));

const ChildAppContent: React.FC = () => {
  const { 
    childView, 
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
    settings,
    isParentMode,
    isSafeModeActive,
  } = useApp();

  const [globalFeedbackState, setGlobalFeedbackState] = useState<ConnectionFeedbackState | null>(null);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  // 6-Step Gradual Interactive AAC Onboarding Tour State (Only triggered when clicking AAC / requested, never automatically upon signup)
  const [showInteractiveOnboarding, setShowInteractiveOnboarding] = useState<boolean>(false);

  // First-Time AAC Experience Knowledge Prompt Modal State ("Do you know how AAC works?")
  const [showAacExperiencePrompt, setShowAacExperiencePrompt] = useState<boolean>(false);

  // Companion Caregiver Help Hub Modal State
  const [showCaregiverHelpHub, setShowCaregiverHelpHub] = useState<boolean>(false);

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

  if (isParentMode) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-amber-400 font-bold text-lg">
            Loading Caregiver Hub...
          </div>
        }>
          <ParentDashboard />
          <SubscriptionModal />
          <ConnectCaregiverModal 
            isOpen={showCaregiverModal} 
            onClose={() => setShowCaregiverModal(false)} 
            initialTab="enter_code"
          />
          <AdaptiveOnboardingFlow
            isOpen={showOnboardingModal}
            onClose={() => setShowOnboardingModal(false)}
            canDismiss={true}
          />
          <FamilyAuthModal
            isOpen={showFamilyAuthModal}
            onClose={() => setShowFamilyAuthModal(false)}
          />
          <ThemeCustomizerModal />
          <CaregiverMessageToast />
          <OfflineIndicator />
        </Suspense>
      </div>
    );
  }

  if (isSafeModeActive) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-black overflow-hidden relative select-none touch-none">
        <SensorySafeModeOverlay />
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full ${activeTheme?.palette?.appBg || 'bg-amber-50/40'} text-slate-800 flex flex-col font-sans selection:bg-amber-200 overflow-hidden relative transition-colors duration-500`}>
      {/* Theme Art Layer */}
      <ThemeWallpaperArt
        pattern={activeTheme?.wallpaperPattern}
        category={activeTheme?.category}
        reduceMotion={settings.reduceMotion}
      />

      {/* Child Top Header */}
      <header className="shrink-0 z-30 relative">
        <ChildHeader />
      </header>

      {/* Main Content View Switcher */}
      <main 
        ref={mainScrollRef} 
        className={`flex-1 ${childView === 'aac' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} overscroll-contain p-2 sm:p-4 relative z-10`}
      >
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

      {/* Global Modals & Drawers */}
      <QuickPhrasesDrawer />
      <PinModal />

      <Suspense fallback={null}>
        <CopingToolkitModal />
        <PlansChangedModal />
        <MorningBriefModal />
        <ConnectCaregiverModal 
          isOpen={showCaregiverModal} 
          onClose={() => setShowCaregiverModal(false)} 
        />
        <CaregiverAlertModal
          isOpen={showCaregiverAlertModal}
          onClose={() => setShowCaregiverAlertModal(false)}
        />
        <RoutineStickerCelebrationModal />
        <DailyRecollectionModal />
        <ThemeCustomizerModal />

        {/* First-Time AAC Experience Knowledge Prompt Modal ("Do you know how AAC works?") */}
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

        {/* 6-Step Gradual Interactive AAC Onboarding Tour */}
        <OnboardingModal
          isOpen={showInteractiveOnboarding}
          onClose={() => setShowInteractiveOnboarding(false)}
        />

        {/* Companion Caregiver Help Hub Drawer / Modal */}
        <CaregiverHelpHub
          isOpen={showCaregiverHelpHub}
          onClose={() => setShowCaregiverHelpHub(false)}
          onReplayTour={() => setShowInteractiveOnboarding(true)}
        />

        {/* 4-Step Adaptive Setup Onboarding Flow */}
        <AdaptiveOnboardingFlow
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          canDismiss={true}
        />

        {/* About Me & Emergency ID Card Modal */}
        <AboutMeIDModal
          isOpen={showAboutMeModal}
          onClose={() => setShowAboutMeModal(false)}
        />

        {/* Medication & Health Reminders Modal */}
        <MedicationRemindersModal />

        {/* Teen & Adult Deep Mood Reflection Journal Modal */}
        <MoodJournalModal />

        {/* Teen & Adult Cycle & Hormonal Wellness Rhythm Modal */}
        <CycleTrackerModal />

        {/* BeeYou Premium Subscription & Paywall Modal */}
        <SubscriptionModal />

        {/* Emergency Sensory Red Button Modal */}
        <EmergencySensoryModal />

        {/* Incredible 5-Point Scale Modal */}
        <FivePointScaleModal />

        {/* Decision Wheel Modal */}
        <DecisionWheelModal />

        {/* Communication Passport Modal */}
        <CommunicationPassportModal />

        {/* Spoon Theory Energy Budget Modal */}
        <SpoonBudgetModal />

        {/* Visual Pie Clock (Time Timer) Modal */}
        <PieTimerModal />

        {/* Digital Sensory Fidget Toys Modal */}
        <DigitalFidgetModal />

        {/* Dyslexia-Friendly AAC Keyboard Modal */}
        <AacKeyboardModal />

        {/* Consolidated Tools Hub Modal */}
        <ToolsHubModal />

        {/* Accessibility & Sensory Preferences Hub Modal */}
        <AccessibilityPreferencesModal />

        {/* Editable Dashboard Customizer Modal */}
        <DashboardCustomizerModal />

        {/* Editable Help Alerts & Caregiver Responses Customizer Modal */}
        <EditAlertsModal />

        {/* Editable Calm Tools & Breathing Pacer Customizer Modal */}
        <EditCalmModal />

        {/* Global Connection Feedback Modal */}
        <ConnectionFeedbackModal
          state={globalFeedbackState}
          onClose={() => setGlobalFeedbackState(null)}
          onOpenCamera={() => setShowCaregiverModal(true)}
        />

        {/* Shared Family Email & Demo Modal */}
        <FamilyAuthModal
          isOpen={showFamilyAuthModal}
          onClose={() => setShowFamilyAuthModal(false)}
        />
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
