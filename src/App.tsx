/**
 * BeeYou: Everyday Companion & Communication App
 * Designed for children and caregivers.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { playChime } from './utils/audio';
import { ChildHeader } from './components/ChildHeader';
import { ChildNavBar } from './components/ChildNavBar';
import { ChildHomeView } from './components/ChildHomeView';
import { AACView } from './components/AACView';
import { MyDayView } from './components/MyDayView';
import { AdventuresView } from './components/AdventuresView';
import { SkillsView } from './components/SkillsView';
import { FeelingsView } from './components/FeelingsView';
import { MyWorldView } from './components/MyWorldView';
import { MoreView } from './components/MoreView';
import { Rewards } from './components/Rewards';
import { QuickPhrasesDrawer } from './components/QuickPhrasesDrawer';
import { PinModal } from './components/PinModal';
import { CaregiverMessageToast } from './components/CaregiverMessageToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ThemeWallpaperArt } from './components/ThemeWallpaperArt';
import { setPairingCode, subscribeToCloudChannel, onDevicePairingEvent } from './services/caregiverSync';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './components/ConnectionFeedbackModal';

// Lazy-loaded secondary components & heavy portals for bundle optimization
const ParentDashboard = lazy(() => import('./components/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const CaregiverLivePortal = lazy(() => import('./components/CaregiverLivePortal').then(m => ({ default: m.CaregiverLivePortal })));
const CopingToolkitModal = lazy(() => import('./components/CopingToolkitModal').then(m => ({ default: m.CopingToolkitModal })));
const PlansChangedModal = lazy(() => import('./components/PlansChangedModal').then(m => ({ default: m.PlansChangedModal })));
const MorningBriefModal = lazy(() => import('./components/MorningBriefModal').then(m => ({ default: m.MorningBriefModal })));
const ConnectCaregiverModal = lazy(() => import('./components/ConnectCaregiverModal').then(m => ({ default: m.ConnectCaregiverModal })));
const CaregiverAlertModal = lazy(() => import('./components/CaregiverAlertModal').then(m => ({ default: m.CaregiverAlertModal })));
const RoutineStickerCelebrationModal = lazy(() => import('./components/RoutineStickerCelebrationModal').then(m => ({ default: m.RoutineStickerCelebrationModal })));
const DailyRecollectionModal = lazy(() => import('./components/DailyRecollectionModal').then(m => ({ default: m.DailyRecollectionModal })));
const ThemeCustomizerModal = lazy(() => import('./components/ThemeCustomizerModal').then(m => ({ default: m.ThemeCustomizerModal })));
const OnboardingWizardModal = lazy(() => import('./components/OnboardingWizardModal').then(m => ({ default: m.OnboardingWizardModal })));
const AboutMeIDModal = lazy(() => import('./components/AboutMeIDModal').then(m => ({ default: m.AboutMeIDModal })));
const MedicationRemindersModal = lazy(() => import('./components/MedicationRemindersModal').then(m => ({ default: m.MedicationRemindersModal })));
const MoodJournalModal = lazy(() => import('./components/MoodJournalModal').then(m => ({ default: m.MoodJournalModal })));
const CycleTrackerModal = lazy(() => import('./components/CycleTrackerModal').then(m => ({ default: m.CycleTrackerModal })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const EmergencySensoryModal = lazy(() => import('./components/EmergencySensoryModal').then(m => ({ default: m.EmergencySensoryModal })));
const FivePointScaleModal = lazy(() => import('./components/FivePointScaleModal').then(m => ({ default: m.FivePointScaleModal })));
const DecisionWheelModal = lazy(() => import('./components/DecisionWheelModal').then(m => ({ default: m.DecisionWheelModal })));
const CommunicationPassportModal = lazy(() => import('./components/CommunicationPassportModal').then(m => ({ default: m.CommunicationPassportModal })));
const SpoonBudgetModal = lazy(() => import('./components/SpoonBudgetModal').then(m => ({ default: m.SpoonBudgetModal })));
const PieTimerModal = lazy(() => import('./components/PieTimerModal').then(m => ({ default: m.PieTimerModal })));
const DigitalFidgetModal = lazy(() => import('./components/DigitalFidgetModal').then(m => ({ default: m.DigitalFidgetModal })));
const AacKeyboardModal = lazy(() => import('./components/AacKeyboardModal').then(m => ({ default: m.AacKeyboardModal })));
const ToolsHubModal = lazy(() => import('./components/ToolsHubModal').then(m => ({ default: m.ToolsHubModal })));
const AccessibilityPreferencesModal = lazy(() => import('./components/AccessibilityPreferencesModal').then(m => ({ default: m.AccessibilityPreferencesModal })));
const DashboardCustomizerModal = lazy(() => import('./components/DashboardCustomizerModal').then(m => ({ default: m.DashboardCustomizerModal })));
const EditAlertsModal = lazy(() => import('./components/EditAlertsModal').then(m => ({ default: m.EditAlertsModal })));
const EditCalmModal = lazy(() => import('./components/EditCalmModal').then(m => ({ default: m.EditCalmModal })));
const FamilyAuthModal = lazy(() => import('./components/FamilyAuthModal').then(m => ({ default: m.FamilyAuthModal })));

const AppContent: React.FC = () => {
  const { 
    childView, 
    isParentMode, 
    userRole,
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
  } = useApp();
  const [isCaregiverRoute, setIsCaregiverRoute] = useState(false);
  const [globalFeedbackState, setGlobalFeedbackState] = useState<ConnectionFeedbackState | null>(null);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isCaregiver = params.get('caregiver') === 'true';
      setIsCaregiverRoute(isCaregiver);
      const codeParam = params.get('code');
      if (codeParam) {
        const cleanCode = codeParam.trim().toUpperCase();
        setPairingCode(cleanCode);
        subscribeToCloudChannel(cleanCode);
      }
    }

    const unsubPair = onDevicePairingEvent((evt) => {
      if (evt.type === 'DEVICE_PAIRED') {
        const isCaregiverUser = userRole === 'caregiver';
        const caregiverName = evt.session?.caregiverName || 'Caregiver';
        const childName = evt.session?.childName || 'Child';

        setGlobalFeedbackState({
          isOpen: true,
          type: 'success',
          role: isCaregiverUser ? 'caregiver' : 'child_device',
          peerName: isCaregiverUser ? childName : caregiverName,
          pairingCode: evt.pairingCode,
        });
      }
    });

    return () => unsubPair();
  }, [userRole]);

  // When tab changes, reset scroll smoothly to top so content never feels jumped or cut off
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [childView]);

  if (isCaregiverRoute) {
    return (
      <Suspense fallback={null}>
        <CaregiverLivePortal 
          onBackToApp={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('caregiver');
            window.location.href = url.pathname;
          }} 
        />
      </Suspense>
    );
  }

  if (isParentMode || userRole === 'caregiver') {
    return (
      <Suspense fallback={null}>
        <ParentDashboard />
        <SubscriptionModal />
        <ConnectCaregiverModal 
          isOpen={showCaregiverModal} 
          onClose={() => setShowCaregiverModal(false)} 
          initialTab={userRole === 'caregiver' ? 'enter_code' : 'pair_code'}
        />
        <OnboardingWizardModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          canDismiss={true}
        />
      </Suspense>
    );
  }

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full ${activeTheme?.palette?.appBg || 'bg-amber-50/40'} text-slate-800 flex flex-col font-sans selection:bg-amber-200 overflow-hidden relative transition-colors duration-500`}>
      {/* Dynamic Theme Custom Wallpaper & Art Layer */}
      <ThemeWallpaperArt
        pattern={activeTheme?.wallpaperPattern}
        category={activeTheme?.category}
        reduceMotion={settings.reduceMotion}
      />

      {/* Child Top Header (anchored, does not shift) */}
      <header className="shrink-0 z-30 relative">
        <ChildHeader />
      </header>

      {/* Main Content View Switcher (scrolls inside itself) */}
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

      {/* Easy Floating Caregiver Alert / SOS Button: Anchored above bottom bar */}
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

      {/* Primary Navigation Bar (anchored bottom footer, never jumps on tab switch) */}
      <footer className="shrink-0 z-20">
        <ChildNavBar />
      </footer>

      {/* Real-time Caregiver Message Toast */}
      <CaregiverMessageToast />

      {/* Offline Status & Diagnostic Indicator */}
      <OfflineIndicator />

      {/* Global Modals & Drawers with Lazy Suspense Boundaries */}
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

        {/* First-Run Onboarding Setup Wizard */}
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
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
