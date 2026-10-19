import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Lock, Users, AlertCircle, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { playChime } from '../utils/audio';
import { useModalBackHandler } from '../services/modalBackHandler';
import { 
  getStoredFamilyAccount, 
  sendAccountPasswordResetEmail, 
  updateCaregiverPin,
  verifyPin,
  getPinRateLimitStatus,
  saveSecureCaregiverPin,
  auth
} from '../services/authService';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const PinModal: React.FC = () => {
  const { showPinModal, setShowPinModal, setIsParentMode, settings, setShowFamilyAuthModal } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Recovery views: 'keypad' | 'forgot_options' | 'password_verify' | 'set_new_pin' | 'email_sent'
  const [view, setView] = useState<'keypad' | 'forgot_options' | 'password_verify' | 'set_new_pin' | 'email_sent'>('keypad');
  const [passwordInput, setPasswordInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  useModalBackHandler(showPinModal, () => {
    handleCloseModal();
  });

  // Switch to set_new_pin if user recently requested an email PIN/password reset or load existing lockout
  useEffect(() => {
    if (showPinModal) {
      try {
        const rateStatus = getPinRateLimitStatus();
        if (rateStatus.isLocked && rateStatus.remainingLockoutSeconds > 0) {
          setCooldownSeconds(rateStatus.remainingLockoutSeconds);
          setError(true);
        }
        if (localStorage.getItem('beeyou_pending_pin_reset') === 'true') {
          setView('set_new_pin');
        }
      } catch {}
    }
  }, [showPinModal]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!showPinModal) return null;

  const handleCloseModal = () => {
    setShowPinModal(false);
    setPinInput('');
    setError(false);
    setView('keypad');
    setPasswordInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setRecoveryError(null);
    setRecoverySuccess(null);
  };

  const handleDigit = async (digit: string) => {
    if (cooldownSeconds > 0) return;

    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      playChime('tap');
      setError(false);

      if (next.length === 4) {
        const result = await verifyPin(next, settings.pin);
        if (result.isLocked) {
          setError(true);
          playChime('clear');
          setCooldownSeconds(result.remainingLockoutSeconds || 30);
          setTimeout(() => setPinInput(''), 600);
          return;
        }

        if (result.valid) {
          if (result.shouldUpgrade && result.upgradedHash) {
            saveSecureCaregiverPin(result.upgradedHash).catch(() => {});
            try {
              const raw = localStorage.getItem('beeyou_settings');
              const s = raw ? JSON.parse(raw) : {};
              delete s.pin;
              localStorage.setItem('beeyou_settings', JSON.stringify(s));
            } catch {}
          }
          playChime('complete');
          setIsParentMode(true);
          handleCloseModal();
          setFailedAttempts(0);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
            localStorage.setItem('beeyou_active_device_view', 'caregiver');
            window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
          }
        } else {
          setError(true);
          playChime('clear');
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);

          if (result.remainingLockoutSeconds && result.remainingLockoutSeconds > 0) {
            setCooldownSeconds(result.remainingLockoutSeconds);
          } else if (nextAttempts >= 5) {
            setCooldownSeconds(30);
          }

          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (cooldownSeconds > 0) return;
    setPinInput((p) => p.slice(0, -1));
    playChime('tap');
  };

  // Verify account password to allow resetting PIN directly on device
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const account = getStoredFamilyAccount();
    const email = account?.email || '';

    if (!email) {
      setRecoveryError('No active account found. Please sign in with your family credentials.');
      return;
    }
    if (!passwordInput) {
      setRecoveryError('Please enter your account password.');
      return;
    }

    try {
      setRecoveryLoading(true);
      setRecoveryError(null);
      await signInWithEmailAndPassword(auth, email, passwordInput);
      setRecoveryLoading(false);
      setView('set_new_pin');
      playChime('tap');
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError('Incorrect password. If you forgot your password, you can request an email reset link.');
      playChime('clear');
    }
  };

  // Save the new 4-digit PIN
  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setRecoveryError('PIN must be exactly 4 digits (numbers only).');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setRecoveryError('The two PIN entries do not match. Please re-enter.');
      return;
    }

    const ok = await updateCaregiverPin(newPinInput);
    if (ok) {
      try {
        localStorage.removeItem('beeyou_pending_pin_reset');
        playChime('complete');
      } catch {}
      setIsParentMode(true);
      handleCloseModal();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
        localStorage.setItem('beeyou_active_device_view', 'caregiver');
        window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
      }
    } else {
      setRecoveryError('Could not save PIN. Please try again.');
    }
  };

  // Send PIN & Password reset link to email
  const handleSendEmailReset = async () => {
    const account = getStoredFamilyAccount();
    const email = account?.email || '';

    if (!email) {
      setShowPinModal(false);
      setShowFamilyAuthModal(true);
      return;
    }

    try {
      setRecoveryLoading(true);
      setRecoveryError(null);
      const res = await sendAccountPasswordResetEmail(email);
      setRecoveryLoading(false);

      if (res.success) {
        try {
          localStorage.setItem('beeyou_pending_pin_reset', 'true');
          playChime('complete');
        } catch {}
        setView('email_sent');
      } else {
        setRecoveryError(res.message);
      }
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError(err?.message || 'Failed to send reset link. Please check your network.');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-slate-200 flex flex-col items-center text-center my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* VIEW 1: STANDARD KEYPAD */}
        {view === 'keypad' && (
          <div className="w-full flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-slate-700" />
            </div>

            <h3 className="text-xl font-black text-slate-800">Caregiver Access</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter 4-digit PIN to open Parent Dashboard
            </p>

            {/* PIN Dots */}
            <div className="flex items-center gap-3 my-6">
              {[0, 1, 2, 3].map((idx) => {
                const hasValue = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      error
                        ? 'border-rose-500 bg-rose-500 animate-shake'
                        : hasValue
                        ? 'border-indigo-600 bg-indigo-600 scale-110'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error / Cooldown Feedback */}
            {cooldownSeconds > 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Too many attempts. Please wait {cooldownSeconds}s.</span>
              </div>
            ) : error ? (
              <p className="text-xs font-bold text-rose-600 mb-3 animate-in fade-in">
                Incorrect PIN. Please try again.
              </p>
            ) : null}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={cooldownSeconds > 0}
                  onClick={() => {
                    if (k === 'C') {
                      setPinInput('');
                      playChime('tap');
                    } else if (k === '⌫') {
                      handleBackspace();
                    } else {
                      handleDigit(k);
                    }
                  }}
                  className={`h-12 rounded-2xl font-black text-lg transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                    cooldownSeconds > 0
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 active:scale-90 border-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Forgot PIN Link */}
            <div className="flex items-center justify-center w-full pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setView('forgot_options')}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer transition"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Family Account / Login section */}
            <div className="w-full mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setShowFamilyAuthModal(true);
                  playChime('tap');
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-all"
              >
                <span>Family Account Login &amp; Sync</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: FORGOT PIN OPTIONS */}
        {view === 'forgot_options' && (
          <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Reset Caregiver PIN</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose how you would like to verify and reset your PIN:
              </p>
            </div>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold w-full text-left">
                {recoveryError}
              </div>
            )}

            <div className="w-full space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRecoveryError(null);
                  setView('password_verify');
                  playChime('tap');
                }}
                className="w-full p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-left shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="block font-black text-sm">Verify with Account Password</span>
                  <span className="block text-[11px] text-indigo-100 font-normal mt-0.5">
                    Fastest: Enter your password to choose a new PIN right now.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSendEmailReset}
                disabled={recoveryLoading}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-200 font-bold text-xs text-left shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <div>
                  <span className="block font-black text-sm">Send Reset Link to Email</span>
                  <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                    Forgot password too? Receive an email link to reset both.
                  </span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setView('keypad');
                setRecoveryError(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer pt-2"
            >
              Back to PIN Keypad
            </button>
          </div>
        )}

        {/* VIEW 3: VERIFY PASSWORD */}
        {view === 'password_verify' && (
          <form onSubmit={handleVerifyPassword} className="w-full flex flex-col items-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Enter Account Password</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Verify your master family account password to set a new PIN.
              </p>
            </div>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold w-full text-left">
                {recoveryError}
              </div>
            )}

            <div className="w-full text-left">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                Family Password:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 bg-slate-50 font-bold text-sm focus:border-indigo-500 outline-none"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={recoveryLoading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              {recoveryLoading ? 'Verifying...' : 'Verify & Set New PIN'}
            </button>

            <button
              type="button"
              onClick={() => {
                setView('forgot_options');
                setRecoveryError(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Back
            </button>
          </form>
        )}

        {/* VIEW 4: SET NEW PIN */}
        {view === 'set_new_pin' && (
          <form onSubmit={handleSaveNewPin} className="w-full flex flex-col items-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Choose New 4-Digit PIN</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Enter a new 4-digit PIN for Caregiver Mode.
              </p>
            </div>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold w-full text-left">
                {recoveryError}
              </div>
            )}

            <div className="w-full space-y-3 text-left">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  New 4-Digit PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-300 bg-slate-50 font-mono text-center tracking-widest text-lg font-black focus:border-emerald-500 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  Confirm New PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-300 bg-slate-50 font-mono text-center tracking-widest text-lg font-black focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Save New PIN &amp; Open Caregiver Hub
            </button>
          </form>
        )}

        {/* VIEW 5: RESET EMAIL SENT */}
        {view === 'email_sent' && (
          <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Reset Link Sent!</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                We sent a secure password reset link to your email. Check your inbox and click the link to update your credentials.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2">
                When you sign back in, you will be prompted to choose your new 4-digit PIN!
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Back to App
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
