import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Heart, 
  X, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Info,
  Layers,
  Crown,
  Share2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { 
  loginWithSharedEmail, 
  registerSharedFamilyAccount, 
  launchDemoMode, 
  DEMO_FAMILY_ACCOUNT,
  getStoredFamilyAccount,
  logoutFamilyAccount,
  FamilyAccount
} from '../services/authService';
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
    speak,
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
  const [regCaregiverName, setRegCaregiverName] = useState('Mom');
  const [regCaregiverRole, setRegCaregiverRole] = useState('Parent');
  const [regChildName, setRegChildName] = useState('Leo');
  const [regChildAgeGroup, setRegChildAgeGroup] = useState<'kid' | 'teen' | 'adult'>('kid');
  const [regPin, setRegPin] = useState('1234');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const applyAccountToContext = (account: FamilyAccount, asRole: 'child' | 'caregiver') => {
    try {
      if (setLinkedDeviceCode) {
        setLinkedDeviceCode(account.familyCode);
      }

      if (asRole === 'caregiver') {
        setIsParentMode(true);
        if (setUserRole) setUserRole('caregiver');
        updateChildProfile({
          name: account.childProfile.name,
          ageGroup: account.childProfile.ageGroup,
          userRole: 'caregiver_managing',
        });
        setSuccessMessage(`Logged into Family Account as ${account.caregiverName}! Switched to Caregiver Hub.`);
        try {
          speak(`Logged in as caregiver. Connected to ${account.childProfile.name}.`);
        } catch {}
      } else {
        setIsParentMode(false);
        if (setUserRole) setUserRole('child_dependent');
        if (setUserAgeGroup) setUserAgeGroup(account.childProfile.ageGroup);
        updateChildProfile({
          name: account.childProfile.name,
          ageGroup: account.childProfile.ageGroup,
          userRole: 'self',
        });
        setSuccessMessage(`Logged into Family Account as ${account.childProfile.name}! Switched to Child Tablet.`);
        try {
          speak(`Welcome back ${account.childProfile.name}. Connected to ${account.caregiverName}.`);
        } catch {}
      }

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      } catch {}
      try {
        playChime('complete');
      } catch {}
      setCurrentAccount(account);

      setTimeout(() => {
        onClose();
      }, 1200);
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
      setRegLoading(true);
      setRegError(null);

      const res = await registerSharedFamilyAccount({
        email: regEmail,
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
                <span className="text-xs text-amber-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1 Email Links Both Devices</span>
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
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-amber-500 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>⚡ 1-Click Demo Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Sign In with Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs font-black'
                : 'bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Create New Family</span>
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm flex items-center gap-3 shadow-lg animate-in zoom-in-95">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-100" />
              <div className="flex-1">
                <p className="font-black text-white">{successMessage}</p>
                <p className="text-xs text-emerald-100 mt-0.5">Connecting and loading your environment...</p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 1: 1-CLICK DEMO ACCOUNT (TESTING PLAYGROUND)
          ══════════════════════════════════════════════════════ */}
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
                    We’ve prepared a complete sample family (<strong>Leo</strong>, 10 yrs old, and <strong>Sarah (Mom)</strong>) with routines, visual schedules, AAC speech buttons, and real-time alerts.
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
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                        🧒
                      </div>
                      <span className="text-xs bg-amber-600/60 px-2 py-0.5 rounded-full text-amber-100">
                        Tablet Mode
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black tracking-tight">
                        Launch Demo as Child (Leo)
                      </h4>
                      <p className="text-xs text-amber-100 mt-0.5 font-normal leading-snug">
                        Opens visual routines, AAC symbol talker &amp; SOS button linked to Mom.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-950 group-hover:translate-x-1 transition-transform">
                      <span>Open Child View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchDemo('caregiver')}
                    disabled={loginLoading}
                    className="p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-left shadow-md transition cursor-pointer flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                        👩‍👦
                      </div>
                      <span className="text-xs bg-indigo-700/60 px-2 py-0.5 rounded-full text-indigo-100">
                        Caregiver Hub
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black tracking-tight">
                        Launch Demo as Caregiver (Mom)
                      </h4>
                      <p className="text-xs text-indigo-100 mt-0.5 font-normal leading-snug">
                        Opens Live Command Hub to send 1-tap nudges &amp; receive Leo's alerts.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-200 group-hover:translate-x-1 transition-transform">
                      <span>Open Caregiver Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center italic">
                  💡 <strong>Tip:</strong> Open BeeYou in a second window or phone and launch both to watch them sync live in real-time!
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: SIGN IN WITH EXISTING EMAIL
          ══════════════════════════════════════════════════════ */}
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
                  <div className="relative">
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. family@gmail.com"
                      className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:border-amber-500 outline-none"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Password (or PIN):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pl-10 rounded-2xl border-2 border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:border-amber-500 outline-none"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition cursor-pointer ${
                        loginDeviceRole === 'child'
                          ? 'border-amber-500 bg-amber-50 dark:bg-slate-700 font-bold text-amber-950 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700 opacity-70'
                      }`}
                    >
                      <span className="text-xl">🧒</span>
                      <div>
                        <span className="text-xs font-black block">Child's Tablet</span>
                        <span className="text-[10px] text-slate-500 block">Schedules &amp; AAC</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginDeviceRole('caregiver')}
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition cursor-pointer ${
                        loginDeviceRole === 'caregiver'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-slate-700 font-bold text-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 opacity-70'
                      }`}
                    >
                      <span className="text-xl">👩‍👦</span>
                      <div>
                        <span className="text-xs font-black block">Caregiver Phone</span>
                        <span className="text-[10px] text-slate-500 block">Alerts &amp; Hub</span>
                      </div>
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    ⚠️ {loginError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('demo@beeyou.app');
                      setLoginPassword('beeyou2026');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    ⚡ Fill Demo Credentials (demo@beeyou.app)
                  </button>
                </div>

                <button
                  type="submit"
                  onClick={(e) => {
                    // Ensures click also submits even if inside non-standard form container
                    if (loginEmail.trim()) {
                      handleLoginSubmit(e);
                    }
                  }}
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Sign In &amp; Sync Device</span>
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: REGISTER NEW FAMILY ACCOUNT
          ══════════════════════════════════════════════════════ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Create Your Shared Family Space
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Only 1 shared email is needed. Both devices will link automatically.
                  </p>
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
                      placeholder="e.g. smithfamily@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Caregiver Name *
                    </label>
                    <input
                      type="text"
                      value={regCaregiverName}
                      onChange={(e) => setRegCaregiverName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Child's Name *
                    </label>
                    <input
                      type="text"
                      value={regChildName}
                      onChange={(e) => setRegChildName(e.target.value)}
                      placeholder="e.g. Leo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs"
                      required
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
                    ⚠️ {regError}
                  </div>
                )}

                <button
                  type="submit"
                  onClick={(e) => {
                    if (regEmail.trim()) {
                      handleRegisterSubmit(e);
                    }
                  }}
                  disabled={regLoading}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {regLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  <span>Create Shared Family Account 🎉</span>
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════
              HIGHLIGHT: ADVANTAGES OF HAVING A SHARED FAMILY EMAIL
          ══════════════════════════════════════════════════════ */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 dark:bg-slate-800 border-2 border-emerald-300 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-black text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>🌟 Advantages of Having a Shared Family Email:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-black shrink-0">✓</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Only 1 Email Needed:</strong> Children do not need their own email or password.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-black shrink-0">✓</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Permanent Device Sync:</strong> No QR codes or expiring codes required. Log in once to stay linked.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-black shrink-0">✓</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Cloud Routine Backup:</strong> Schedules, photo tiles &amp; AAC voices are safely backed up in the cloud.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-black shrink-0">✓</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Real-Time Help SOS:</strong> Instant 1-tap alerts stream to the caregiver's phone from school or therapy.
                </p>
              </div>
            </div>
          </div>

          {/* If already signed in */}
          {currentAccount && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
