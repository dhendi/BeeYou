import React, { useState } from 'react';
import { X, RefreshCw, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  getStoredFamilyAccount, 
  checkEmailVerificationStatus, 
  sendAccountVerificationEmail 
} from '../services/authService';
import { playChime } from '../utils/audio';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
}) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (!isOpen) return null;

  const account = getStoredFamilyAccount();
  const email = account?.email || 'your email';

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      setFeedback(null);
      const res = await checkEmailVerificationStatus();
      setChecking(false);

      if (res.isVerified) {
        try {
          playChime('complete');
        } catch {}
        setFeedback({
          type: 'success',
          message: 'Email verified successfully! 15-Day Free Trial unlocked.',
        });
        setTimeout(() => {
          if (onVerified) {
            onVerified();
          }
          onClose();
        }, 1200);
      } else {
        try {
          playChime('tap');
        } catch {}
        setFeedback({
          type: 'info',
          message: 'Email not verified yet. Please click the link inside the email we sent you, then tap Check Verification again.',
        });
      }
    } catch (err: any) {
      setChecking(false);
      setFeedback({
        type: 'error',
        message: err?.message || 'Could not verify status. Please check your network connection.',
      });
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setFeedback(null);
      const res = await sendAccountVerificationEmail();
      setResending(false);

      if (res.success) {
        try {
          playChime('complete');
        } catch {}
        setFeedback({
          type: 'success',
          message: res.message,
        });
      } else {
        try {
          playChime('tap');
        } catch {}
        setFeedback({
          type: 'error',
          message: res.message,
        });
      }
    } catch (err: any) {
      setResending(false);
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to send verification email. Please try again later.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Verify Your Email
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Enable 15-Day Free Premium Trial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Your account is currently active on <strong>BeeYou Basic</strong>. You can continue using essential AAC speech, visual routines, and calming tools freely.
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Verify your email address so you can try the 15-day free Premium trial whenever you're ready:
          </p>

          {/* Email badge */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono font-bold text-slate-900 dark:text-white">
            <span className="truncate">{email}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] font-sans font-black uppercase tracking-wider shrink-0">
              Unverified
            </span>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {checking && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Check Verification Status</span>
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-stone-200 dark:border-slate-700 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {resending && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Resend Verification Link</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
            >
              <span>Continue with Basic (Free) Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
