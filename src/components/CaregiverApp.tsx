/**
 * BeeYou Dedicated Caregiver Controller Application
 * Completely isolated from Child device routines, AAC motor inputs, and audio engines.
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { RoleSwitcherBar } from './RoleSwitcherBar';
import { setPairingCode, subscribeToCloudChannel } from '../services/caregiverSync';
import { setActiveDeviceView } from '../services/authService';

const ParentDashboard = lazy(() => import('./ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const SubscriptionModal = lazy(() => import('./SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const ConnectCaregiverModal = lazy(() => import('./ConnectCaregiverModal').then(m => ({ default: m.ConnectCaregiverModal })));
const OnboardingWizardModal = lazy(() => import('./OnboardingWizardModal').then(m => ({ default: m.OnboardingWizardModal })));
const FamilyAuthModal = lazy(() => import('./FamilyAuthModal').then(m => ({ default: m.FamilyAuthModal })));

const CaregiverAppContent: React.FC = () => {
  const {
    showCaregiverModal,
    setShowCaregiverModal,
    showOnboardingModal,
    setShowOnboardingModal,
    showFamilyAuthModal,
    setShowFamilyAuthModal,
  } = useApp();

  useEffect(() => {
    setActiveDeviceView('caregiver');
    try {
      localStorage.setItem('beeyou_user_role', 'caregiver');
      sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
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
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-amber-400 font-bold text-lg">
          Loading Caregiver Controller Hub...
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
        <RoleSwitcherBar />
      </Suspense>
    </div>
  );
};

export const CaregiverApp: React.FC = () => {
  return (
    <AppProvider initialRole="caregiver">
      <CaregiverAppContent />
    </AppProvider>
  );
};
