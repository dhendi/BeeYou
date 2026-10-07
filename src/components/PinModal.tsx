import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, KeyRound, Check, Users } from 'lucide-react';
import { playChime } from '../utils/audio';

export const PinModal: React.FC = () => {
  const { showPinModal, setShowPinModal, setIsParentMode, settings, setShowFamilyAuthModal } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!showPinModal) return null;

  const handleDigit = (digit: string) => {
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
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
            localStorage.setItem('beeyou_active_device_view', 'caregiver');
            window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
          }
        } else {
          setError(true);
          playChime('clear');
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((p) => p.slice(0, -1));
    playChime('tap');
  };

  const handleBypass = () => {
    setIsParentMode(true);
    setShowPinModal(false);
    setPinInput('');
    playChime('star');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
      localStorage.setItem('beeyou_active_device_view', 'caregiver');
      window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in duration-200"
      onClick={() => setShowPinModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-slate-200 flex flex-col items-center text-center max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
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

        {error && (
          <p className="text-xs font-bold text-rose-600 mb-3 animate-in fade-in">
            Incorrect PIN. Default is {settings.pin}.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
            <button
              key={k}
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
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-lg active:scale-90 transition-all border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Helper Note / Quick Bypass */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">Default PIN: {settings.pin}</span>
          <button
            onClick={handleBypass}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
          >
            Direct Access
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
    </div>
  );
};
