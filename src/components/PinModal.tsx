import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Lock, Users, AlertCircle } from 'lucide-react';
import { playChime } from '../utils/audio';
import { useModalBackHandler } from '../services/modalBackHandler';

export const PinModal: React.FC = () => {
  const { showPinModal, setShowPinModal, setIsParentMode, settings, setShowFamilyAuthModal } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useModalBackHandler(showPinModal, () => {
    setShowPinModal(false);
    setPinInput('');
    setError(false);
  });

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!showPinModal) return null;

  const handleDigit = (digit: string) => {
    if (cooldownSeconds > 0) return;

    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      playChime('tap');
      setError(false);

      if (next.length === 4) {
        if (next === settings.pin) {
          playChime('complete');
          setIsParentMode(true);
          setShowPinModal(false);
          setPinInput('');
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

          if (nextAttempts >= 5) {
            setCooldownSeconds(30);
            setFailedAttempts(0);
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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setShowPinModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-slate-200 flex flex-col items-center text-center my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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

        {/* Secure Recovery Option */}
        <div className="flex items-center justify-center w-full pt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => {
              setShowPinModal(false);
              setShowFamilyAuthModal(true);
              playChime('tap');
            }}
            className="text-slate-500 hover:text-indigo-600 font-bold underline cursor-pointer transition"
          >
            Forgot PIN? Sign in with Family Password
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
            className="w-full py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>Family Account Login &amp; Sync</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
