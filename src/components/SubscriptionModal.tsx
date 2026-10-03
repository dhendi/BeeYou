import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillingCycle } from '../types';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Clock, 
  RotateCcw,
  Crown,
  Volume2,
  Calendar,
  Pill,
  Palette,
  User,
  Share2,
  FileText,
  Lock
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const SubscriptionModal: React.FC = () => {
  const {
    showPaywallModal,
    setShowPaywallModal,
    paywallTriggerReason,
    subscription,
    isPremium,
    startFreeTrial,
    cancelSubscription,
    setSubscriptionTier,
    setBillingCycle,
    getTrialDaysRemaining,
  } = useApp();

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(subscription.billingCycle || 'yearly');

  if (!showPaywallModal) return null;

  const trialDaysLeft = getTrialDaysRemaining();

  const handleStartTrial = () => {
    startFreeTrial(selectedCycle);
  };

  const handleClose = () => {
    playChime('tap');
    setShowPaywallModal(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-4 border-amber-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 p-5 sm:p-6 text-white text-center shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-4 h-4 text-amber-200" />
            <span>Lumina Premium</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Unlock Full Independence & Calming Tools
          </h2>
          <p className="text-white/90 text-xs sm:text-sm font-medium mt-1 max-w-lg mx-auto">
            Give your child, teen, or client the complete communication toolkit with unlimited routines, soundscapes, and themes.
          </p>

          {/* Trigger Reason Highlight */}
          {paywallTriggerReason && (
            <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{paywallTriggerReason}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Billing Switcher (Monthly vs Yearly) */}
          <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedCycle('monthly');
                setBillingCycle('monthly');
                playChime('tap');
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer text-center ${
                selectedCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Monthly • $12.99/mo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCycle('yearly');
                setBillingCycle('yearly');
                playChime('tap');
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedCycle === 'yearly'
                  ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Yearly • $129.99/yr</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                selectedCycle === 'yearly' ? 'bg-amber-300 text-amber-950' : 'bg-emerald-200 text-emerald-950'
              }`}>
                2 Mo Free
              </span>
            </button>
          </div>

          {/* 30-Day Free Trial Guarantee Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-purple-50 to-indigo-50 border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black text-slate-900">
                    {selectedCycle === 'yearly' ? '$129.99 / year' : '$12.99 / month'}
                  </span>
                  {selectedCycle === 'yearly' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      $10.83/mo • 2 Months Free!
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                    30-Day Free Trial
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  <strong>$0.00 due today.</strong> Cancel anytime with one tap. Basic plan remains free forever.
                </p>
              </div>
            </div>

            {isPremium ? (
              <div className="shrink-0 text-center sm:text-right">
                <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-xs">
                  {subscription.status === 'trial' ? `Trial Active (${trialDaysLeft}d left)` : 'Premium Active ✓'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartTrial}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Start 30-Day Free Trial
              </button>
            )}
          </div>

          {/* Tier Comparison Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Basic Tier Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-slate-800 text-base">Lumina Basic</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black uppercase">
                    Free Forever
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Essential communication and structure available from Day 1 for everyone.
                </p>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>AAC:</strong> 36+ Core word communication board</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Visual Routines:</strong> 1 active daily routine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Medications:</strong> 1 active medication reminder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sensory Room:</strong> 2 soundscapes (Rain & Ocean)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Mood Journal:</strong> 7-day reflection history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Theme:</strong> Classic clean neutral theme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Avatar:</strong> Standard default avatar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Offline:</strong> 100% offline-ready</span>
                  </li>
                </ul>
              </div>

              {!isPremium && (
                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <span className="text-xs font-bold text-slate-500">Currently on Basic Plan</span>
                </div>
              )}
            </div>

            {/* Premium Tier Card */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-300 ring-2 ring-purple-200 flex flex-col justify-between relative shadow-sm">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-purple-950 text-base flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Lumina Premium</span>
                  </h3>
                  <span className="text-xs font-black text-purple-700">
                    {selectedCycle === 'yearly' ? '$129.99 / yr' : '$12.99 / mo'}
                  </span>
                </div>
                <p className="text-xs text-purple-800 font-medium mb-3">
                  Complete neurodivergent independence, rich sensory soundscapes, and themes.
                </p>

                <ul className="space-y-2 text-xs text-purple-950">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>AAC:</strong> Custom photos, voice recordings &amp; motor planning phrases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Visual Routines:</strong> Unlimited routines & First-Then boards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Medications:</strong> Unlimited medications, stock counts & refill alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Sensory Room:</strong> All 17 ambient soundscapes (Train tracks, car ride, city rain, night starlight, white noise, beach, pine forest, cozy fireplace, medieval castle, brown noise & more)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Themes:</strong> All 14+ themes + Custom Theme Studio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Avatar Studio:</strong> Full customization (hairstyles, colors, wheelchairs, sensory aids)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Therapist / IEP:</strong> Exportable clinical PDF summaries for SLPs & OTs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 stroke-[3]" />
                    <span><strong>Caregiver Sync:</strong> Real-time multi-device portal & safety alerts</span>
                  </li>
                </ul>
              </div>

              {isPremium ? (
                <div className="mt-4 pt-3 border-t border-purple-200 text-center">
                  <span className="text-xs font-black text-purple-700">✓ Your Premium Plan is Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTrial}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  Start 30-Day Free Trial
                </button>
              )}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
            <div className="p-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">30-Day Free Trial</span>
              <span className="text-[10px] text-slate-500">$0 due today</span>
            </div>
            <div className="p-2">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Cancel Anytime</span>
              <span className="text-[10px] text-slate-500">1 tap, no hassles</span>
            </div>
            <div className="p-2">
              <Heart className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Basic Always Free</span>
              <span className="text-[10px] text-slate-500">Day 1 accessibility</span>
            </div>
          </div>
        </div>

        {/* Footer with Dev / Quick Test Mode */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Quick Dev Switcher for Testing */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Quick Test Switcher:</span>
            <button
              type="button"
              onClick={() => {
                setSubscriptionTier(isPremium ? 'basic' : 'premium');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[11px] transition-colors cursor-pointer"
            >
              Switch to {isPremium ? 'Basic (Free)' : 'Premium (Trial)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isPremium ? (
              <button
                type="button"
                onClick={cancelSubscription}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
              >
                Cancel Subscription
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              {isPremium ? 'Done' : 'Continue with Basic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
