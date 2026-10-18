import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  X, 
  Send, 
  Car, 
  Heart, 
  Clock, 
  Check, 
  CheckCircle2, 
  MapPin, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { CaregiverAlert, CaregiverResponsePreset } from '../../types';
import { getQuickRepliesForAlert } from '../../utils/alertResponses';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';

interface CaregiverIncomingAlertModalProps {
  isOpen: boolean;
  alert: CaregiverAlert | null;
  childName: string;
  customResponses?: CaregiverResponsePreset[];
  onClose: () => void;
  onResolve: (alertId: string) => void;
  onReply: (alertId: string, replyText: string, replyId?: string) => Promise<void> | void;
}

export const CaregiverIncomingAlertModal: React.FC<CaregiverIncomingAlertModalProps> = ({
  isOpen,
  alert,
  childName,
  customResponses = [],
  onClose,
  onResolve,
  onReply,
}) => {
  const [typedReply, setTypedReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Play audio chime and sensory alert sound when pop up opens
  useEffect(() => {
    if (isOpen && alert) {
      playChime('alert');
      setSentConfirmation(null);
      setTypedReply('');
      // Focus the text input for immediate typing if desired
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, alert?.id]);

  if (!isOpen || !alert) return null;

  const displayName = childName || alert.childName || 'Child';
  const quickReplies = getQuickRepliesForAlert(alert, t);

  // Merge contextual default quick replies with caregiver's custom saved replies
  const allQuickReplies = [
    ...quickReplies,
    ...customResponses
      .filter((r) => !quickReplies.some((q) => q.id === r.id))
      .map((r) => ({
        id: r.id,
        label: r.label,
        text: r.text,
        className: 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300',
        iconSrc: undefined,
      })),
  ];

  const handleSendQuick = async (reply: { id: string; text: string; label: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    playChime('star');
    try {
      await onReply(alert.id, reply.text, reply.id);
      setSentConfirmation(reply.text);
      setTimeout(() => {
        onClose();
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = typedReply.trim();
    if (!clean || isSubmitting) return;

    setIsSubmitting(true);
    playChime('star');
    try {
      await onReply(alert.id, clean, 'custom_typed');
      setSentConfirmation(clean);
      setTypedReply('');
      setTimeout(() => {
        onClose();
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveAlert = () => {
    playChime('tap');
    onResolve(alert.id);
    onClose();
  };

  const formattedTime = alert.timestamp 
    ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-alert-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 sm:border-3 border-rose-400 ring-8 ring-rose-500/20 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
      >
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  {t('Live Urgent Alert')}
                </span>
                <span className="text-xs font-mono text-rose-100 font-bold">
                  {formattedTime}
                </span>
              </div>
              <h2 id="incoming-alert-modal-title" className="text-lg sm:text-xl font-black truncate text-white mt-0.5">
                {displayName} {t('Needs Support')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert pop up"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
            title={t('Dismiss pop-up')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Sent Confirmation State */}
          {sentConfirmation ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex items-center gap-3 animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                  {t('Reassurance Sent to')} {displayName}'s {t('Screen!')}
                </span>
                <p className="text-sm font-bold text-emerald-900 truncate">
                  "{sentConfirmation}"
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Alert Message Card */}
              <div className="p-4 rounded-2xl bg-rose-50/80 border-2 border-rose-200 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-rose-950">
                      "{alert.label}"
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                      {t('Urgent')}
                    </span>
                  </div>
                  {alert.location && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-rose-800 border border-rose-200 text-xs font-bold">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t('At')} {alert.location}</span>
                    </div>
                  )}
                </div>

                {alert.note && (
                  <p className="text-xs sm:text-sm text-slate-700 font-medium bg-white/70 p-2.5 rounded-xl border border-rose-100">
                    {alert.note}
                  </p>
                )}
              </div>

              {/* 1. Quick Reply Action Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  {t('Tap 1-Tap Quick Reply to')} {displayName}:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allQuickReplies.slice(0, 6).map((reply) => {
                    const cleanLabel = reply.label.replace(/^[🚗❤️💖⏳🌟🎉👏👍 ]+/, '');
                    const isComing = reply.id === 'coming';
                    const isHere = reply.id === 'im_here';
                    const isWait = reply.id === 'give_minutes';

                    return (
                      <button
                        key={reply.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSendQuick(reply)}
                        className={`p-2.5 rounded-xl font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 transition text-center disabled:opacity-50 ${
                          isComing
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : isHere
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : isWait
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isComing ? (
                          <Car className="w-3.5 h-3.5 shrink-0" />
                        ) : isHere ? (
                          <Heart className="w-3.5 h-3.5 shrink-0" />
                        ) : isWait ? (
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{cleanLabel || reply.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Type Custom Reply Area */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor="caregiver-custom-reply-input" className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('Or Type Your Own Reply:')}</span>
                </label>
                <form onSubmit={handleSendCustomText} className="flex gap-2">
                  <input
                    id="caregiver-custom-reply-input"
                    ref={inputRef}
                    type="text"
                    value={typedReply}
                    onChange={(e) => setTypedReply(e.target.value)}
                    placeholder={`${t('Type a personal reassurance message to')} ${displayName}...`}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-300 transition"
                  />
                  <button
                    type="submit"
                    disabled={!typedReply.trim() || isSubmitting}
                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition border border-amber-600 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('Send')}</span>
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResolveAlert}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black cursor-pointer shadow-2xs active:scale-95 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t('Resolve & Clear ✓')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              {t('Dismiss to Inbox')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
