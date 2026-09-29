/**
 * Lumina: Everyday Companion & Communication App
 * Designed for children and caregivers.
 */

import React, { useState, useEffect } from 'react';
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
import { Rewards } from './components/Rewards';
import { ParentDashboard } from './components/ParentDashboard';
import { QuickPhrasesDrawer } from './components/QuickPhrasesDrawer';
import { CopingToolkitModal } from './components/CopingToolkitModal';
import { PlansChangedModal } from './components/PlansChangedModal';
import { PinModal } from './components/PinModal';
import { MorningBriefModal } from './components/MorningBriefModal';
import { ConnectCaregiverModal } from './components/ConnectCaregiverModal';
import { CaregiverAlertModal } from './components/CaregiverAlertModal';
import { CaregiverLivePortal } from './components/CaregiverLivePortal';
import { CaregiverMessageToast } from './components/CaregiverMessageToast';
import { OfflineIndicator } from './components/OfflineIndicator';

const AppContent: React.FC = () => {
  const { 
    childView, 
    isParentMode, 
    showCaregiverModal, 
    setShowCaregiverModal,
    showCaregiverAlertModal,
    setShowCaregiverAlertModal 
  } = useApp();
  const [isCaregiverRoute, setIsCaregiverRoute] = useState(false);
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsCaregiverRoute(params.get('caregiver') === 'true');
    }
  }, []);

  // When tab changes, reset scroll smoothly to top so content never feels jumped or cut off
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [childView]);

  if (isCaregiverRoute) {
    return (
      <CaregiverLivePortal 
        onBackToApp={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('caregiver');
          window.location.href = url.pathname;
        }} 
      />
    );
  }

  if (isParentMode) {
    return <ParentDashboard />;
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-amber-50/40 text-slate-800 flex flex-col font-sans selection:bg-amber-200 overflow-hidden relative">
      {/* Child Top Header (anchored, does not shift) */}
      <header className="shrink-0 z-30">
        <ChildHeader />
      </header>

      {/* Main Content View Switcher (scrolls inside itself) */}
      <main ref={mainScrollRef} className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-4">
        {childView === 'home' && <ChildHomeView />}
        {childView === 'aac' && <AACView />}
        {childView === 'my-day' && <MyDayView />}
        {childView === 'adventures' && <AdventuresView />}
        {childView === 'skills' && <SkillsView />}
        {childView === 'feelings' && <FeelingsView />}
        {childView === 'my-world' && <MyWorldView />}
        {childView === 'rewards' && <Rewards />}
      </main>

      {/* Easy Floating Caregiver Alert / SOS Button: Anchored above bottom bar */}
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

      {/* Primary Navigation Bar (anchored bottom footer, never jumps on tab switch) */}
      <footer className="shrink-0 z-20">
        <ChildNavBar />
      </footer>

      {/* Real-time Caregiver Message Toast */}
      <CaregiverMessageToast />

      {/* Offline Status & Diagnostic Indicator */}
      <OfflineIndicator />

      {/* Global Modals & Drawers */}
      <QuickPhrasesDrawer />
      <CopingToolkitModal />
      <PlansChangedModal />
      <PinModal />
      <MorningBriefModal />
      <ConnectCaregiverModal 
        isOpen={showCaregiverModal} 
        onClose={() => setShowCaregiverModal(false)} 
      />
      <CaregiverAlertModal
        isOpen={showCaregiverAlertModal}
        onClose={() => setShowCaregiverAlertModal(false)}
      />
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
