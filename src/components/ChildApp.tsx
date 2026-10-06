/**
 * BeeYou Dedicated User / Child Tablet Application
 * Features AAC speech, visual schedules (My Day), Life Skills, Adventures, Feelings check-in, and instant SOS alerts.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppProvider, useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { ChildHeader } from './ChildHeader';
import { ChildNavBar } from './ChildNavBar';
import { ChildHomeView } from './ChildHomeView';
import { AACView } from './AACView';
import { MyDayView } from './MyDayView';
import { AdventuresView } from './AdventuresView';
import { SkillsView } from './SkillsView';
import { FeelingsView } from './FeelingsView';
import { MyWorldView } from './MyWorldView';
import { MoreView } from './MoreView';
import { Rewards } from './Rewards';
import { QuickPhrasesDrawer } from './QuickPhrasesDrawer';
import { PinModal } from './PinModal';
import { CaregiverMessageToast } from './CaregiverMessageToast';
import { OfflineIndicator } from './OfflineIndicator';
import { ThemeWallpaperArt } from './ThemeWallpaperArt';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './ConnectionFeedbackModal';
import { RoleSwitcherBar } from './RoleSwitcherBar';
import { setActiveDeviceView } from '../services/authService';
import { setPairingCode, subscribeToCloudChannel, onDevicePairingEvent } from '../services/caregiverSync';

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
const CaregiverHowItWorksModal = lazy(() => import('./CaregiverHowItWorksModal').then(m => ({ default: m.CaregiverHowItWorksModal })));

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
  } = useApp();

  const [globalFeedbackState, setGlobalFeedbackState] = useState<ConnectionFeedbackState | null>(null);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveDeviceView('child');
    try {
      localStorage.setItem('beeyou_user_role', 'child_dependent');
      sessionStorage.setItem('beeyou_active_device_view', 'child');
    } catch {}

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
          <OnboardingWizardModal
            isOpen={showOnboardingModal}
            onClose={() => setShowOnboardingModal(false)}
            canDismiss={true}
          />
          <FamilyAuthModal
            isOpen={showFamilyAuthModal}
            onClose={() => setShowFamilyAuthModal(false)}
          />
          <ThemeCustomizerModal />
          <CaregiverHowItWorksModal />
          <CaregiverMessageToast />
          <OfflineIndicator />
        </Suspense>
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
        {childView === 'my-day' && <MyDayView />}
        {childView === 'adventures' && <AdventuresView />}
        {childView === 'skills' && <SkillsView />}
        {childView === 'feelings' && <FeelingsView />}
        {childView === 'my-world' && <MyWorldView />}
        {childView === 'rewards' && <Rewards />}
        {childView === 'more' && <MoreView />}
      </main>

      {/* Floating SOS / Alert Caregiver Button */}
      {enabledFeatures?.emergencyAlertSOS !== false && (
        <div className="absolute bottom-20 right-3 sm:right-5 z-30 pointer-events-none">
          <button
            onClick={() => {
              setShowCaregiverAlertModal(true);
              playChime('tap');
            }}
            className="pointer-events-auto group flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-400/50 border-2 border-white ring-4 ring-rose-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
            title="Easy Alert Button: Send emotions or ask caregiver for help at school or therapy"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-wide">Alert Caregiver 🚨</span>
          </button>
        </div>
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

        {/* Onboarding Setup Wizard */}
        <OnboardingWizardModal
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

        {/* Role Switcher & Testing Hub */}
        <RoleSwitcherBar />
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
