import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Shield, KeyRound, X, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { verifyPin } from '../utils/security';
import { saveSecureCaregiverPin } from '../services/authService';

interface CaregiverLockShieldProps {
  children: React.ReactNode;
  /**
   * Action title to display when unlocking (e.g. "Language Settings", "Dashboard Customization")
   */
  title?: string;
  /**
   * Optional callback when unlocked. If not provided, the default action of child will execute.
   */
  onUnlocked?: () => void;
  className?: string;
  /**
   * Optional custom badge or lock icon overlay
   */
  showLockBadge?: boolean;
}

export const CaregiverLockShield: React.FC<CaregiverLockShieldProps> = ({
  children,
  title = 'Settings & Controls',
  onUnlocked,
  className = '',
  showLockBadge = true,
}) => {
  const { settings, userPersona } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pinError, setPinError] = useState(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  const HOLD_DURATION_MS = 3000;

  const triggerSuccess = () => {
    playChime('complete');
    setIsHolding(false);
    setHoldProgress(0);
    setShowPinModal(false);
    setPinInput('');
    if (onUnlocked) {
      onUnlocked();
    }
  };

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(progress);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      triggerSuccess();
    }, HOLD_DURATION_MS);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleClickCapture = (e: React.MouseEvent) => {
    // Intercept normal clicks and prompt for PIN modal if user simply clicks
    e.stopPropagation();
    e.preventDefault();
    playChime('tap');
    setShowPinModal(true);
  };

  const handlePinDigit = async (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      playChime('tap');
      setPinError(false);

      if (next.length === 4) {
        const correctPin = settings?.pin || '1234';
        const { valid, shouldUpgrade, upgradedHash } = await verifyPin(next, correctPin);
        if (valid) {
          if (shouldUpgrade && upgradedHash) {
            saveSecureCaregiverPin(upgradedHash).catch(() => {});
            try {
              const raw = localStorage.getItem('beeyou_settings');
              const s = raw ? JSON.parse(raw) : {};
              delete s.pin;
              localStorage.setItem('beeyou_settings', JSON.stringify(s));
            } catch {}
          }
          triggerSuccess();
        } else {
          setPinError(true);
          playChime('clear');
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  return (
    <>
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        onClickCapture={handleClickCapture}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        title={`${title} (Long-press 3s or tap to enter PIN)`}
      >
        {children}

        {/* Lock Shield Badge */}
        {showLockBadge && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white text-white flex items-center justify-center shadow-xs pointer-events-none z-10">
            <Lock className="w-2.5 h-2.5 text-amber-300" />
          </div>
        )}

        {/* Real-time Hold Progress Ring Overlay */}
        {isHolding && (
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 backdrop-blur-2xs flex flex-col items-center justify-center pointer-events-none border-2 border-amber-500 z-20 animate-in fade-in">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mb-1" />
            <span className="text-[10px] font-black text-amber-950 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
              Hold {Math.max(0, Math.ceil((HOLD_DURATION_MS - (holdProgress / 100) * HOLD_DURATION_MS) / 1000))}s
            </span>
          </div>
        )}
      </div>

      {/* 4-Digit PIN Modal */}
      {showPinModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setShowPinModal(false);
            setPinInput('');
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-xs w-full p-6 text-slate-800 shadow-2xl border-2 border-amber-200 text-center relative my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowPinModal(false);
                setPinInput('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3 border border-amber-200 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {userPersona === 'child' ? 'Caregiver Shield' : 'Protected Setting'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4 leading-snug">
              Hold button for 3 seconds or enter your 4-digit PIN to access {title}.
            </p>

            {/* PIN Dots Indicator */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = pinInput.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-amber-500 scale-110 shadow-xs'
                        : 'bg-stone-200 border border-stone-300'
                    } ${pinError ? 'bg-rose-500 animate-shake' : ''}`}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  type="button"
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="h-12 rounded-2xl bg-stone-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-lg transition active:scale-95 border border-stone-200/80 shadow-2xs cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-2xl bg-stone-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-black text-lg transition active:scale-95 border border-stone-200/80 shadow-2xs cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                className="h-12 rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-600 font-bold text-xs transition active:scale-95 border border-stone-200/80 shadow-2xs cursor-pointer flex items-center justify-center"
              >
                DEL
              </button>
            </div>

            {/* Bypass / Hint info */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Tip: 3s long-press bypasses PIN</span>
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
