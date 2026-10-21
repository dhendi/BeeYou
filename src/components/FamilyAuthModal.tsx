import React, { useState } from 'react';
import { 
  X, 
  RefreshCw 
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from './LanguageDropdown';
import { AppLanguage } from '../types';
import { 
  loginWithSharedEmail, 
  loginWithGoogle,
  registerSharedFamilyAccount, 
  launchDemoMode, 
  DEMO_FAMILY_ACCOUNT,
  getStoredFamilyAccount,
  logoutFamilyAccount,
  deleteFamilyAccount,
  AccountDeletionResult,
  DeletionStepResult,
  setActiveDeviceView,
  sendAccountPasswordResetEmail,
  sanitizeAuthErrorMessage,
  FamilyAccount
} from '../services/authService';
import { 
  setPairingCode, 
  subscribeToCloudChannel, 
  sendHeartbeat 
} from '../services/caregiverSync';
import { BeeMascot } from './BeeYouLogo';
import { LegalModal } from './LegalModals';
import { AacVoiceLoadingScreen } from './common/AacVoiceLoadingScreen';

interface FamilyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'demo' | 'login' | 'register' | 'forgot_password';
}

export const FamilyAuthModal: React.FC<FamilyAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'demo',
}) => {
  const {
    updateChildProfile,
    setUserRole,
    setUserAgeGroup,
    setIsParentMode,
    setLinkedDeviceCode,
    setShowCaregiverModal,
    setShowPinModal,
    speak,
    settings,
    updateSettings,
    subscription,
    setShowOnboardingModal,
    setSubscriptionTier,
    updateEnabledFeatures,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register' | 'forgot_password'>(initialTab);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);
  const [currentAccount, setCurrentAccount] = useState<FamilyAccount | null>(() => getStoredFamilyAccount());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginDeviceRole, setLoginDeviceRole] = useState<'child' | 'caregiver'>('caregiver');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot password & PIN recovery state
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBackupEmail, setRegBackupEmail] = useState('');
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverRole, setRegCaregiverRole] = useState('Parent');
  const [regChildName, setRegChildName] = useState('');
  const [regChildAgeGroup, setRegChildAgeGroup] = useState<'kid' | 'teen' | 'adult'>('kid');
  const [regLanguage, setRegLanguage] = useState<AppLanguage>(() => settings?.language || 'en');
  const [regPin, setRegPin] = useState('1234');
  const [regNeedsAac, setRegNeedsAac] = useState<boolean>(true);
  const [showAacLoadingScreen, setShowAacLoadingScreen] = useState<boolean>(false);
  const [pendingAccountContext, setPendingAccountContext] = useState<{ account: FamilyAccount; asRole: 'child' | 'caregiver' } | null>(null);
  const [regParentalConsent, setRegParentalConsent] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyAccountToContext = (account: FamilyAccount, asRole: 'child' | 'caregiver') => {
    try {
      const code = account.familyCode || '';
      setPairingCode(code);
      if (code) {
        subscribeToCloudChannel(code);
      }

      if (setLinkedDeviceCode) {
        setLinkedDeviceCode(code);
      }

      // Mark onboarding as fully completed upon authenticated family account login/registration
      try {
        localStorage.setItem('beeyou_onboarding_completed', 'true');
        sessionStorage.removeItem('beeyou_onboarding_current_step');
        sessionStorage.removeItem('beeyou_onboarding_name');
        sessionStorage.removeItem('beeyou_onboarding_persona');
        sessionStorage.removeItem('beeyou_onboarding_pairing');
      } catch {}
      if (setShowOnboardingModal) {
        setShowOnboardingModal(false);
      }

      if (asRole === 'caregiver') {
        setActiveDeviceView('caregiver');
        try {
          localStorage.setItem('beeyou_user_role', 'caregiver');
          localStorage.setItem('beeyou_active_device_view', 'caregiver');
        } catch {}
        if (setUserRole) setUserRole('caregiver');
        if (setSubscriptionTier) {
          if (account.subscriptionTier === 'free' || account.subscriptionTier === 'basic') {
            setSubscriptionTier('basic');
            updateSettings({ voicePersona: 'system' });
          } else {
            setSubscriptionTier('premium');
          }
        }
        updateChildProfile({
          name: account.childProfile.name,
          ageGroup: account.childProfile.ageGroup,
          userRole: 'caregiver_managing',
        });
        setSuccessMessage(`Caregiver active! Linked with ${account.childProfile.name} (Code: ${account.familyCode}). Opening Caregiver Link...`);
        try {
          speak(`You are connected to ${account.childProfile.name}`);
        } catch {}

        sendHeartbeat({
          role: 'caregiver',
          name: account.caregiverName || 'Caregiver',
          pairingCode: code,
        });
      } else {
        setActiveDeviceView('child');
        try {
          localStorage.setItem('beeyou_user_role', 'child_dependent');
          localStorage.setItem('beeyou_active_device_view', 'child');
        } catch {}
        setIsParentMode(false);
        if (setUserRole) setUserRole('child_dependent');
        if (setSubscriptionTier) {
          if (account.subscriptionTier === 'free' || account.subscriptionTier === 'basic') {
            setSubscriptionTier('basic');
            updateSettings({ voicePersona: 'system' });
          } else {
            setSubscriptionTier('premium');
          }
        }
        if (setUserAgeGroup) setUserAgeGroup(account.childProfile.ageGroup);
        updateChildProfile({
          name: account.childProfile.name,
          ageGroup: account.childProfile.ageGroup,
          userRole: 'self',
        });
        setSuccessMessage(`Logged in! Connected to ${account.caregiverName || 'Caregiver'}.`);
        try {
          speak(`${account.caregiverName || 'Caregiver'} is connected to your device`);
        } catch {}

        sendHeartbeat({
          role: 'child_device',
          name: account.childProfile.name || 'Child',
          pairingCode: code,
        });
      }

      try {
        playChime('complete');
      } catch {}

      onClose();
      const safeCode = account.familyCode || '';
      if (typeof window !== 'undefined') {
        if (asRole === 'caregiver') {
          window.history.replaceState(null, '', `/?role=caregiver&code=${encodeURIComponent(safeCode)}`);
          window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
        } else {
          window.history.replaceState(null, '', `/?role=child&code=${encodeURIComponent(safeCode)}`);
          window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'child' } }));
        }
      }
      if (typeof window !== 'undefined' && localStorage.getItem('beeyou_pending_pin_reset') === 'true') {
        setShowPinModal(true);
      }
    } catch (err) {
      console.error('Failed to apply account context:', err);
      onClose();
    }
  };

  const handleLaunchDemo = async (role: 'child' | 'caregiver') => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      const { account } = await launchDemoMode(role);
      setLoginLoading(false);
      applyAccountToContext(account, role);
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(sanitizeAuthErrorMessage(err));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError(null);
      const res = await loginWithGoogle();
      setLoginLoading(false);
      if (res.success && res.account) {
        applyAccountToContext(res.account, loginDeviceRole);
      } else {
        setLoginError(res.message || 'Google sign-in was not completed.');
      }
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(sanitizeAuthErrorMessage(err));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!loginEmail.trim()) {
        setLoginError('Please enter your family account email address.');
        return;
      }
      if (!loginPassword) {
        setLoginError('Please enter your account password.');
        return;
      }

      setLoginLoading(true);
      setLoginError(null);

      const res = await loginWithSharedEmail(loginEmail, loginPassword);
      setLoginLoading(false);

      if (res.success && res.account) {
        applyAccountToContext(res.account, loginDeviceRole);
      } else {
        setLoginError(res.message || 'Login failed. Please verify email and password.');
        try {
          playChime('tap');
        } catch {}
      }
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(sanitizeAuthErrorMessage(err));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!regPassword || regPassword.length < 8) {
        setRegError('Please choose a password with at least 8 characters to secure your family space.');
        return;
      }

      if (!regParentalConsent) {
        setRegError('Verified Parental Consent (COPPA / GDPR-K) is required to register and manage a child profile.');
        return;
      }

      setRegLoading(true);
      setRegError(null);

      if (updateSettings) {
        updateSettings({ language: regLanguage });
      }

      if (updateEnabledFeatures) {
        updateEnabledFeatures({
          aacCommunication: regNeedsAac,
          aac: regNeedsAac,
        });
      }
      try {
        localStorage.setItem('beeyou_aac_enabled', String(regNeedsAac));
      } catch {}

      const res = await registerSharedFamilyAccount({
        email: regEmail,
        password: regPassword,
        backupEmail: regBackupEmail,
        caregiverName: regCaregiverName,
        caregiverRole: regCaregiverRole,
        childName: regChildName,
        childAgeGroup: regChildAgeGroup,
        pin: regPin,
      });
      setRegLoading(false);

      if (res.success && res.account) {
        if (regNeedsAac) {
          setPendingAccountContext({ account: res.account, asRole: 'caregiver' });
          setShowAacLoadingScreen(true);
        } else {
          applyAccountToContext(res.account, 'caregiver');
        }
      } else {
        setRegError(res.message || 'Registration failed. Please check fields.');
        try {
          playChime('tap');
        } catch {}
      }
    } catch (err: any) {
      setRegLoading(false);
      setRegError(sanitizeAuthErrorMessage(err));
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setForgotError('Please enter your primary email or registered backup email.');
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError(null);
      setForgotSuccess(null);
      const res = await sendAccountPasswordResetEmail(forgotInput);
      setForgotLoading(false);
      if (res.success) {
        setForgotSuccess(res.message);
        try {
          localStorage.setItem('beeyou_pending_pin_reset', 'true');
          playChime('complete');
        } catch {}
      } else {
        setForgotError(res.message);
        try {
          playChime('tap');
        } catch {}
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError(sanitizeAuthErrorMessage(err));
    }
  };


  const handleLogout = async () => {
    try {
      await logoutFamilyAccount();
      setCurrentAccount(null);
      setSuccessMessage('Logged out of Shared Family Account.');
      try {
        playChime('tap');
      } catch {}
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 500);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('action') === 'delete-account' ||
        params.get('delete') === 'true' ||
        window.location.pathname === '/delete-account'
      );
    }
    return false;
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteResult, setDeleteResult] = useState<AccountDeletionResult | null>(null);
  const [acknowledgedSubNotice, setAcknowledgedSubNotice] = useState(false);

  const hasActiveSubscription = Boolean(
    subscription && (
      subscription.tier === 'premium' ||
      subscription.status === 'active' ||
      subscription.status === 'trial'
    )
  );

  const handleExecuteDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      setDeleteResult(null);

      const res = await deleteFamilyAccount(deletePassword);
      setDeleteLoading(false);
      setDeleteResult(res);

      if (res.success) {
        playChime('clear');
        setCurrentAccount(null);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1800);
      } else {
        setDeleteError(res.message);
        playChime('clear');
      }
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteError(err?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-[#FAF8F5] dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* TOP HEADER */}
        <div className="pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] px-4 sm:px-6 pb-4 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <BeeMascot size="xs" pose="celebrating" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Shared Family Account
                </span>
                <span className="text-xs text-amber-200 font-bold">
                  1 Email Links Both Devices
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                Connect Parent Phone &amp; Child Tablet
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB SELECTOR */}
        <div className="p-2 sm:px-6 bg-amber-100/60 dark:bg-slate-800 border-b border-amber-200/80 dark:border-slate-700 flex shrink-0 text-xs font-bold">
          <div className="w-full max-w-2xl mx-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('demo');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                activeTab === 'demo'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
            >
              <span>1-Click Demo Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
            >
              <span>Sign In with Email</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                activeTab === 'register'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs font-black'
                  : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
            >
              <span>Create New Family</span>
            </button>

            {activeTab === 'forgot_password' && (
              <button
                type="button"
                className="flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center bg-indigo-700 text-white shadow-xs font-black"
              >
                <span>Recover Account</span>
              </button>
            )}
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
          <div className="max-w-2xl mx-auto space-y-5">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg animate-in zoom-in-95">
              <p className="font-black text-white">{successMessage}</p>
              <p className="text-xs text-emerald-100 mt-0.5">Connecting and loading your environment...</p>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO ACCOUNT (TESTING PLAYGROUND) */}
          {activeTab === 'demo' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-indigo-50 dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                      Ready-to-Test Demo Account
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
                    Sync Code: BEE-DEMO
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Test Live Connectivity Instantly
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                    Test real-time routines, visual schedules, AAC speech buttons, and instant alerts with our preconfigured testing playground.
                  </p>
                </div>

                {/* Pre-filled Account Card */}
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Demo Email</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">demo@beeyou.app</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Demo Password</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">beeyou2026</span>
                  </div>
                </div>

                {/* 2 Big Launch Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLaunchDemo('child')}
                    disabled={loginLoading}
                    className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-left shadow-md transition cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-amber-600/60 px-2.5 py-1 rounded-full text-amber-100 font-bold">
                        Tablet Mode
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black tracking-tight">
                        Launch Demo as Child
                      </h4>
                      <p className="text-xs text-amber-100 mt-0.5 font-normal leading-snug">
                        Opens visual routines, AAC symbol talker &amp; SOS button linked to Caregiver.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-amber-950">
                      <span>Open Child View</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchDemo('caregiver')}
                    disabled={loginLoading}
                    className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-left shadow-md transition cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-indigo-700/60 px-2.5 py-1 rounded-full text-indigo-100 font-bold">
                        Caregiver Hub
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black tracking-tight">
                        Launch Demo as Caregiver
                      </h4>
                      <p className="text-xs text-indigo-100 mt-0.5 font-normal leading-snug">
                        Opens Live Command Hub to send 1-tap nudges &amp; receive child alerts.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-indigo-200">
                      <span>Open Caregiver Hub</span>
                    </div>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  <strong>Tip:</strong> Open BeeYou in a second window or phone and launch both to watch them sync live in real-time!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN WITH EXISTING EMAIL */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Sign in to Your Family Space
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Use the same shared email on both phone and tablet to link them automatically.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Family Email:
                  </label>
                  <div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. family@gmail.com"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                      Password (or PIN):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot_password');
                        setForgotInput(loginEmail);
                        setForgotError(null);
                        setForgotSuccess(null);
                        playChime('tap');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Select Device Role */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                    How are you using this device?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginDeviceRole('child')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        loginDeviceRole === 'child'
                          ? 'border-amber-500 bg-amber-50 dark:bg-slate-700 font-bold text-amber-950 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700 opacity-70'
                      }`}
                    >
                      <span className="text-xs font-black block">Child's Tablet</span>
                      <span className="text-[10px] text-slate-500 block">Schedules &amp; AAC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginDeviceRole('caregiver')}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                        loginDeviceRole === 'caregiver'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-700 font-bold text-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 opacity-70'
                      }`}
                    >
                      <span className="text-xs font-black block">Caregiver Phone</span>
                      <span className="text-[10px] text-slate-500 block">Alerts &amp; Hub</span>
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={(e) => {
                    if (loginEmail.trim()) {
                      handleLoginSubmit(e);
                    }
                  }}
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loginLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Sign In &amp; Sync Device</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider">or quick sign-in</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loginLoading}
                  className="w-full py-3 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs border-2 border-stone-300 dark:border-slate-600 shadow-2xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex flex-col items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('demo@beeyou.app');
                      setLoginPassword('beeyou2026');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Fill Demo Credentials (demo@beeyou.app)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot_password');
                      setForgotInput(loginEmail);
                      setForgotError(null);
                      setForgotSuccess(null);
                      playChime('tap');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-indigo-600 underline cursor-pointer"
                  >
                    Forgot primary email, password, or PIN?
                  </button>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                    Protected by BeeYou&apos;s{' '}
                    <button
                      type="button"
                      onClick={() => setLegalModalTab('privacy')}
                      className="underline text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 cursor-pointer"
                    >
                      Privacy Policy (COPPA)
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => setLegalModalTab('terms')}
                      className="underline text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 cursor-pointer"
                    >
                      Terms of Service
                    </button>.
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: REGISTER NEW FAMILY ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Create Your Shared Family Space
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Set up your secured family account. Both devices will link automatically.
                  </p>
                </div>

                {/* Google Sign In Shortcut in Register */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={regLoading}
                  className="w-full py-3 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs border-2 border-stone-300 dark:border-slate-600 shadow-2xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Quick Sign Up with Google</span>
                </button>

                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider">or create with email</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Family Email *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. family@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Account Password *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Backup Recovery Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={regBackupEmail}
                    onChange={(e) => setRegBackupEmail(e.target.value)}
                    placeholder="e.g. secondary@gmail.com or spouse@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Used to safely recover your family space if you ever forget your primary email address.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Caregiver Name *
                    </label>
                    <input
                      type="text"
                      value={regCaregiverName}
                      onChange={(e) => setRegCaregiverName(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Child's Name *
                    </label>
                    <input
                      type="text"
                      value={regChildName}
                      onChange={(e) => setRegChildName(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Caregiver Role
                    </label>
                    <input
                      type="text"
                      value={regCaregiverRole}
                      onChange={(e) => setRegCaregiverRole(e.target.value)}
                      placeholder="Parent / Caregiver"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Child Age Group
                    </label>
                    <select
                      value={regChildAgeGroup}
                      onChange={(e) => setRegChildAgeGroup(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                    >
                      <option value="kid">Kid (Ages 4-11)</option>
                      <option value="teen">Teen (Ages 12-17)</option>
                      <option value="adult">Adult (18+)</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Language Picker */}
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-700/50 border border-amber-200 dark:border-slate-600">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200 block mb-1.5">
                    <span>App &amp; AAC Language / Idioma / Langue *</span>
                  </label>
                  <select
                    value={regLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value as AppLanguage;
                      setRegLanguage(newLang);
                      if (updateSettings) {
                        updateSettings({ language: newLang });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-slate-500 bg-white dark:bg-slate-900 font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} — {lang.nativeName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Sets the voice, AAC tiles, and app navigation to your family's language.
                  </p>
                </div>

                {/* AAC Communication Choice Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-700/50 border border-amber-200 dark:border-slate-600 space-y-2.5">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200 block">
                      Does the person using this app need AAC (Speech Board &amp; Voices)? *
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Choose whether to include the speech communication board and voice engine.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRegNeedsAac(true);
                        try { playChime('tap'); } catch {}
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer relative ${
                        regNeedsAac
                          ? 'border-amber-500 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-amber-400/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl shrink-0 p-1 bg-amber-100 dark:bg-amber-950/60 rounded-xl">🗣️</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              Yes, Include AAC
                            </span>
                            {regNeedsAac && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                            Speech board, symbol talker &amp; voice engine for non-speaking users. Pre-loads voices upfront.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegNeedsAac(false);
                        try { playChime('tap'); } catch {}
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer relative ${
                        !regNeedsAac
                          ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-indigo-400/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl shrink-0 p-1 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl">🚀</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              No, Skip AAC
                            </span>
                            {!regNeedsAac && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                            Lighter app with faster load time. AAC can be turned on anytime in Caregiver Settings.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Caregiver PIN (to protect settings):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs tracking-widest font-mono"
                  />
                </div>

                {/* Verified Parental Consent & COPPA Compliance Checkbox */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={regParentalConsent}
                      onChange={(e) => setRegParentalConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      required
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                        Verified Parental Consent &amp; Safety Compliance (COPPA / GDPR-K) *
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        I declare that I am the parent, legal guardian, or authorized caregiver (18+), and I grant verified consent for this child profile and encrypted family sync in compliance with Apple Kids Category and Google Play Families guidelines.
                      </p>
                    </div>
                  </label>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {regLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Create Shared Family Account</span>
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-medium pt-1">
                  By creating a family space, you agree to BeeYou&apos;s{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('terms')}
                    className="underline text-amber-700 dark:text-amber-400 font-bold hover:text-amber-900 cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('privacy')}
                    className="underline text-amber-700 dark:text-amber-400 font-bold hover:text-amber-900 cursor-pointer"
                  >
                    Privacy Policy (COPPA)
                  </button>.
                </p>
              </div>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD / ACCOUNT & PIN RECOVERY */}
          {activeTab === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Recover Family Account &amp; PIN
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    Enter your primary family email or your registered backup recovery email. We will send you a secure link to reset your password and choose a new Caregiver PIN.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Primary or Backup Recovery Email:
                  </label>
                  <input
                    type="email"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="e.g. family@gmail.com or secondary@gmail.com"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:border-indigo-500 outline-none"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Forgot your primary email? Enter your backup email and we will locate your family space.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold space-y-1">
                    <p className="font-black text-emerald-950">Reset Link Dispatched</p>
                    <p className="font-normal text-emerald-800 leading-snug">{forgotSuccess}</p>
                    <p className="font-normal text-emerald-700 text-[11px] pt-1">
                      Check your inbox or spam folder. When you click the link and sign back in, you will be prompted to set a new 4-digit PIN!
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {forgotLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Send Password &amp; PIN Reset Link</span>
                </button>

                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotError(null);
                      setForgotSuccess(null);
                      playChime('tap');
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* HIGHLIGHT: ADVANTAGES OF HAVING A SHARED FAMILY EMAIL */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 dark:bg-slate-800 border-2 border-emerald-300 dark:border-slate-700 space-y-3">
            <div className="text-emerald-950 dark:text-emerald-200 font-black text-sm">
              Advantages of Having a Shared Family Email:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Only 1 Email Needed:</strong> Children do not need their own email or password.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Permanent Device Sync:</strong> No QR codes or expiring codes required. Log in once to stay linked.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Cloud Routine Backup:</strong> Schedules, photo tiles &amp; AAC voices are safely backed up in the cloud.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Real-Time Help SOS:</strong> Instant 1-tap alerts stream to the caregiver's phone from school or therapy.
                </p>
              </div>
            </div>
          </div>

          {/* If already signed in */}
          {currentAccount && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span>Signed in as <strong>{currentAccount.email}</strong> ({currentAccount.familyCode})</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Device is actively synced to your shared family space.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setDeletePassword('');
                      setDeleteError(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900 transition cursor-pointer"
                  >
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>

              {showDeleteModal && (
                <form onSubmit={handleExecuteDeleteAccount} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 space-y-3 animate-in fade-in">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🗑️</span>
                      <span className="text-xs font-black uppercase tracking-wider block text-rose-900 dark:text-rose-200">
                        Permanently Delete Account & All Data (Apple Guideline 5.1.1v)
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium mt-1 leading-relaxed">
                      This will permanently delete your family login credentials, uploaded custom icons and media, cloud databases, backend server sessions, and wipe all local storage from this device. <strong>This action cannot be undone.</strong>
                    </p>
                  </div>

                  {/* Active Subscription & Billing Obligations Notice */}
                  {hasActiveSubscription && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-base shrink-0">⚠️</span>
                        <div className="space-y-1 text-xs">
                          <p className="font-black text-amber-900 dark:text-amber-200">
                            Active Subscription / Free Trial Notice
                          </p>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                            Deleting your account immediately terminates your BeeYou in-app membership. However, subscriptions purchased via Apple App Store or Google Play Billing must be cancelled directly in your device store settings to prevent ongoing recurring billing by Apple or Google.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href="https://apps.apple.com/account/subscriptions"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-400 dark:border-amber-700 text-[11px] font-bold text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-slate-700 transition"
                            >
                              <span>🍎 Manage Apple Subscriptions</span>
                            </a>
                            <a
                              href="https://play.google.com/store/account/subscriptions"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-400 dark:border-amber-700 text-[11px] font-bold text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-slate-700 transition"
                            >
                              <span>▶️ Manage Google Play Subscriptions</span>
                            </a>
                          </div>
                          <label className="flex items-center gap-2 pt-1.5 cursor-pointer text-[11px] font-bold text-amber-950 dark:text-amber-200">
                            <input
                              type="checkbox"
                              checked={acknowledgedSubNotice}
                              onChange={(e) => setAcknowledgedSubNotice(e.target.checked)}
                              className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <span>I acknowledge and have reviewed my app store subscription obligations.</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-rose-900 dark:text-rose-200 block">
                      Confirm Account Password:
                    </label>
                    <input
                      type="password"
                      required
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter account password to confirm permanent deletion"
                      className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-rose-500"
                    />
                  </div>

                  {deleteError && (
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800">
                      {deleteError}
                    </p>
                  )}

                  {/* Deletion Step-by-Step Audit Results */}
                  {deleteResult && deleteResult.steps && deleteResult.steps.length > 0 && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="font-black text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Deletion Lifecycle Progress
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          deleteResult.success 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {deleteResult.success ? 'Purge Complete' : 'Action Required'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {deleteResult.steps.map((st, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              {st.status === 'completed' && <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>}
                              {st.status === 'failed' && <span className="text-rose-600 dark:text-rose-400 font-black">✗</span>}
                              {st.status === 'skipped' && <span className="text-slate-400 font-bold">—</span>}
                              <span className={st.status === 'failed' ? 'font-bold text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                                {st.label}
                              </span>
                            </div>
                            {st.details && (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {st.details}
                              </span>
                            )}
                            {st.error && (
                              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold text-right shrink-0 max-w-[200px]">
                                {st.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {deleteResult.partialFailure && deleteResult.actionRequired && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-[11px] space-y-1">
                          <p className="font-bold flex items-center gap-1 text-amber-900 dark:text-amber-100">
                            <span>⚠️</span> Action Required to Complete Deletion:
                          </p>
                          <p className="leading-relaxed font-medium">
                            {deleteResult.actionRequired}
                          </p>
                        </div>
                      )}

                      {deleteResult.success && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold text-center">
                          ✓ All family cloud data, server sessions, and local storage permanently wiped. Resetting device in a moment...
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={deleteLoading || (hasActiveSubscription && !acknowledgedSubNotice)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                    >
                      <span>
                        {deleteLoading 
                          ? 'Purging Records...' 
                          : (deleteResult?.partialFailure ? 'Retry Remaining Steps' : 'Yes, Permanently Delete Account')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteResult(null);
                        setDeleteError(null);
                      }}
                      disabled={deleteLoading}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          </div>
        </div>

      </div>

      {legalModalTab && (
        <LegalModal
          isOpen={Boolean(legalModalTab)}
          onClose={() => setLegalModalTab(null)}
          initialTab={legalModalTab}
        />
      )}

      {showAacLoadingScreen && (
        <AacVoiceLoadingScreen
          isOpen={showAacLoadingScreen}
          onComplete={() => {
            setShowAacLoadingScreen(false);
            if (pendingAccountContext) {
              applyAccountToContext(pendingAccountContext.account, pendingAccountContext.asRole);
              setPendingAccountContext(null);
            }
          }}
          persona={settings?.voicePersona || 'puck'}
          language={regLanguage || settings?.language || 'en'}
        />
      )}
    </div>
  );
};
