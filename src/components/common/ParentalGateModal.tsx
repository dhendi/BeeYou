import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, ExternalLink, KeyRound } from 'lucide-react';
import { useModalBackHandler } from '../../services/modalBackHandler';
import { playChime } from '../../utils/audio';
import { useApp } from '../../context/AppContext';
import { verifyPin } from '../../services/authService';

export interface ParentalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetUrlTitle?: string;
  targetUrl?: string;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetUrlTitle = 'External Website',
  targetUrl,
}) => {
  const { settings } = useApp();
  const [mode, setMode] = useState<'math' | 'pin'>('math');
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(8);
  const [mathAnswer, setMathAnswer] = useState('');
  const [pinAnswer, setPinAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate a random adult challenge whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 6) + 6; // 6 to 11
      const b = Math.floor(Math.random() * 6) + 5; // 5 to 10
      setNum1(a);
      setNum2(b);
      setMathAnswer('');
      setPinAnswer('');
      setErrorMsg(null);
      setMode('math');
    }
  }, [isOpen]);

  useModalBackHandler(isOpen, () => {
    onClose();
  });

  if (!isOpen) return null;

  const handleMathSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const expected = num1 * num2;
    if (parseInt(mathAnswer.trim(), 10) === expected) {
      playChime('chime');
      onSuccess();
      onClose();
    } else {
      playChime('tap');
      setErrorMsg('Incorrect answer. Please try again.');
      setMathAnswer('');
      // regenerate numbers on mistake
      setNum1(Math.floor(Math.random() * 6) + 6);
      setNum2(Math.floor(Math.random() * 6) + 5);
    }
  };

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinAnswer.length < 4) {
      setErrorMsg('PIN must be 4 digits.');
      return;
    }
    const { valid } = await verifyPin(pinAnswer, settings.pin);
    if (valid) {
      playChime('chime');
      onSuccess();
      onClose();
    } else {
      playChime('tap');
      setErrorMsg('Incorrect PIN. Please try again.');
      setPinAnswer('');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300 dark:border-slate-800 flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white block w-fit">
                Parental Gate (Grown-Ups Only)
              </span>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5 tracking-tight">
                Adult Verification Required
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
            }}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            In compliance with child privacy safety standards, an adult must confirm before leaving the BeeYou app to visit <strong>{targetUrlTitle}</strong>.
          </p>

          {targetUrl && (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono truncate flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{targetUrl}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {mode === 'math' ? (
            <form onSubmit={handleMathSubmit} className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border-2 border-amber-200 dark:border-slate-700 text-center space-y-2">
                <span className="text-xs uppercase font-black text-amber-800 dark:text-amber-400 tracking-wider">
                  Solve to Continue:
                </span>
                <div className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">
                  What is {num1} × {num2}?
                </div>
              </div>

              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                placeholder="Enter answer"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                className="w-full text-center text-lg font-black tracking-widest py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-slate-700 focus:border-amber-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  <span>Continue to Website</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setMode('pin');
                    setErrorMsg(null);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  title="Use PIN instead"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Use PIN</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-700 text-center space-y-2">
                <span className="text-xs uppercase font-black text-indigo-800 dark:text-indigo-400 tracking-wider">
                  Enter 4-Digit Caregiver PIN:
                </span>
              </div>

              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinAnswer}
                onChange={(e) => setPinAnswer(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-2xl font-black tracking-widest py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-slate-700 focus:border-indigo-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  <span>Verify PIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setMode('math');
                    setErrorMsg(null);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  <span>Use Math Question</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-amber-50 dark:bg-slate-800/80 border-t border-amber-200 dark:border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <span>Stay in BeeYou</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
