import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  RotateCcw,
  Volume2,
  Calendar,
  Grid,
  FileText,
  HeartHandshake,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BillingCycle } from '../types';
import { SUBSCRIPTION_PRICES } from '../services/subscriptionService';
import { t } from '../services/translator';
import { playChime } from '../utils/audio';

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const {
    subscription,
    startFreeTrial,
    restorePurchases,
    isRestoring,
    setBillingCycle,
    setSubscriptionTier,
  } = useApp();

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(
    subscription.billingCycle || 'monthly'
  );
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartTrial = () => {
    setBillingCycle(selectedCycle);
    startFreeTrial(selectedCycle);
    playChime('star');
    onClose();
  };

  const handleContinueFree = () => {
    setSubscriptionTier('basic');
    playChime('tap');
    onClose();
  };

  const handleRestore = async () => {
    playChime('tap');
    const result = await restorePurchases();
    if (result.restored) {
      playChime('complete');
      setRestoreFeedback(t('Purchases restored successfully!'));
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setRestoreFeedback(result.message || t('No active subscriptions found to restore.'));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#FCFAF5] dark:bg-slate-900 rounded-3xl border-2 border-amber-300/80 dark:border-amber-600/40 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative p-5 sm:p-6 pb-4 bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-transparent dark:from-amber-950/40 dark:via-slate-900 border-b border-amber-200/60 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 flex items-center justify-center shadow-md border border-amber-300">
              <Crown className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  BeeYou Plus
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                  15-Day Free Trial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {reason || t('Unlock the complete neurodiversity-affirming toolkit for your child and family.')}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
          
          {/* Plan Comparison: Free Basic vs BeeYou Plus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Free Plan Card */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                    {t('BeeYou Basic')}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {t('Free Forever')}
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t('Full AAC board (custom words, photos & symbols)')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t('Default device speech engine')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t('1 Active visual routine & 1 medication reminder')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t('2 Basic soundscapes (Rain & Ocean)')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plus Card */}
            <div className="p-3 rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/30 dark:to-slate-800 border-2 border-amber-400 dark:border-amber-600/80 shadow-xs relative flex flex-col justify-between">
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white text-[8px] font-black uppercase tracking-wider shadow-2xs">
                {t('All Features Included')}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-black text-amber-950 dark:text-amber-100 text-xs sm:text-sm">
                    {t('BeeYou Plus')}
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-800 dark:text-slate-100">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong>{t('All 20+ Expressive Neural Voices')}</strong></span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong>{t('Unlimited Visual Routines')}</strong> {t('& First-Then')}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong>{t('Caregiver Live Sync & Silent SOS')}</strong></span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong>{t('All 17 Soundscapes')}</strong> {t('& Theme Studio')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Options Selector */}
          <div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Monthly */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCycle('monthly');
                  playChime('tap');
                }}
                className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                  selectedCycle === 'monthly'
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-xs ring-1 ring-amber-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {t('Monthly')}
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    ${SUBSCRIPTION_PRICES.monthly}
                    <span className="text-[10px] text-slate-500 font-normal"> /mo</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                  {t('15d trial')}
                </span>
              </button>

              {/* Yearly */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCycle('yearly');
                  playChime('tap');
                }}
                className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all relative flex items-center justify-between ${
                  selectedCycle === 'yearly'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      {t('Yearly')}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider">
                      Save 25%
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    ${SUBSCRIPTION_PRICES.yearly}
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold"> (~$7.50/mo)</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                  {t('15d trial')}
                </span>
              </button>
            </div>
          </div>

          {/* Guarantees Banner */}
          <div className="py-2 px-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 flex items-center justify-around gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('15 Days Free Trial')}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('Cancel anytime in settings')}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('Private & offline-ready')}</span>
            </span>
          </div>

          {restoreFeedback && (
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold text-center">
              {restoreFeedback}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 pt-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleContinueFree}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-black cursor-pointer transition text-center"
            >
              {t('Continue with Free Basic Plan')}
            </button>

            <button
              type="button"
              onClick={handleStartTrial}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition"
            >
              <span>{t('Start 15-Day Free Trial ($0 Today)')}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleRestore}
              disabled={isRestoring}
              className="hover:text-slate-800 dark:hover:text-slate-200 font-bold underline cursor-pointer"
            >
              {isRestoring ? t('Restoring purchases...') : t('Restore Purchases')}
            </button>
            <span>{t('App Store & Google Play Subscription Terms Apply')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
