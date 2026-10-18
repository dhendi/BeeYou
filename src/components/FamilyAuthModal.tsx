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
  setActiveDeviceView,
  FamilyAccount
} from '../services/authService';
import { 
  setPairingCode, 
  subscribeToCloudChannel, 
  sendHeartbeat 
} from '../services/caregiverSync';
import { BeeMascot } from './BeeYouLogo';

interface FamilyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'demo' | 'login' | 'register';
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
    speak,
    settings,
    updateSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>(initialTab);
  const [currentAccount, setCurrentAccount] = useState<FamilyAccount | null>(() => getStoredFamilyAccount());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('demo@beeyou.app');
  const [loginPassword, setLoginPassword] = useState('beeyou2026');
  const [loginDeviceRole, setLoginDeviceRole] = useState<'child' | 'caregiver'>('caregiver');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverRole, setRegCaregiverRole] = useState('Parent');
  const [regChildName, setRegChildName] = useState('');
  const [regChildAgeGroup, setRegChildAgeGroup] = useState<'kid' | 'teen' | 'adult'>('kid');
  const [regLanguage, setRegLanguage] = useState<AppLanguage>(() => settings?.language || 'en');
  const [regPin, setRegPin] = useState('1234');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyAccountToContext = (account: FamilyAccount, asRole: 'child' | 'caregiver') => {
    try {
      const code = account.familyCode || 'BEE-DEMO';
      setPairingCode(code);
      subscribeToCloudChannel(code);

      if (setLinkedDeviceCode) {
        setLinkedDeviceCode(code);
      }

      if (asRole === 'caregiver') {
        setActiveDeviceView('caregiver');
        try {
          localStorage.setItem('beeyou_user_role', 'caregiver');
          localStorage.setItem('beeyou_active_device_view', 'caregiver');
        } catch {}
        setIsParentMode(true);
        if (setUserRole) setUserRole('caregiver');
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
      setTimeout(() => {
        const safeCode = account.familyCode || 'BEE-DEMO';
        if (asRole === 'caregiver') {
          setActiveDeviceView('caregiver');
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/?role=caregiver&code=${encodeURIComponent(safeCode)}`);
            window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
          }
        } else {
          setActiveDeviceView('child');
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/?role=child&code=${encodeURIComponent(safeCode)}`);
            window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'child' } }));
          }
        }
        onClose();
      }, 200);
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
      setLoginError(err?.message || 'Could not launch demo mode. Please try again.');
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
      setLoginError(err?.message || 'Google sign-in error occurred.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError(null);

      const res = await loginWithSharedEmail(loginEmail, loginPassword);
      setLoginLoading(false);

      if (res.success && res.account) {
        applyAccountToContext(res.account, loginDeviceRole);
      } else {
        setLoginError(res.message || 'Login failed. Please verify email.');
        try {
          playChime('tap');
        } catch {}
      }
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(err?.message || 'Login failed unexpectedly. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!regPassword || regPassword.length < 6) {
        setRegError('Please choose a password with at least 6 characters to secure your family space.');
        return;
      }

      setRegLoading(true);
      setRegError(null);

      if (updateSettings) {
        updateSettings({ language: regLanguage });
      }

      const res = await registerSharedFamilyAccount({
        email: regEmail,
        password: regPassword,
        caregiverName: regCaregiverName,
        caregiverRole: regCaregiverRole,
        childName: regChildName,
        childAgeGroup: regChildAgeGroup,
        pin: regPin,
      });
      setRegLoading(false);

      if (res.success && res.account) {
        applyAccountToContext(res.account, 'caregiver');
      } else {
        setRegError(res.message || 'Registration failed. Please check fields.');
        try {
          playChime('tap');
        } catch {}
      }
    } catch (err: any) {
      setRegLoading(false);
      setRegError(err?.message || 'Registration failed unexpectedly. Please try again.');
    }
  };


  const handleLogout = () => {
    try {
      logoutFamilyAccount();
      setCurrentAccount(null);
      setSuccessMessage('Logged out of Shared Family Account.');
      try {
        playChime('tap');
      } catch {}
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300 dark:border-slate-800 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
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
        <div className="p-2 bg-amber-100/60 dark:bg-slate-800 border-b border-amber-200/80 dark:border-slate-700 flex gap-1 shrink-0 text-xs font-bold">
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
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
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
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Password (or PIN):
                  </label>
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

                <div className="flex items-center justify-center pt-1">
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
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>
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
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span>Signed in as <strong>{currentAccount.email}</strong> ({currentAccount.familyCode})</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
