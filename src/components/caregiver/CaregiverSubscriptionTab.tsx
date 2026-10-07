import React from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { Crown, Check } from 'lucide-react';
import { playChime } from '../../utils/audio';

interface CaregiverSubscriptionTabProps {
  showNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverSubscriptionTab: React.FC<CaregiverSubscriptionTabProps> = ({ 
  showNotification,
  onStartTour,
}) => {
  const {
    subscription,
    isPremium,
    setBillingCycle,
    setSubscriptionTier,
    getTrialDaysRemaining,
    startFreeTrial,
    cancelSubscription,
  } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">👑</span>
            <h2 className="text-xl font-black text-slate-900">
              {t("BeeYou Membership &amp; Plans")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs">
              {subscription.billingCycle === 'yearly' ? '$129.99 / yr' : '$12.99 / mo'}
            </span>
            {subscription.billingCycle === 'yearly' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                2 Months Free (Save 17%)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t("Transparent, neurodiversity-affirming pricing with a 30-day free trial. Start with $0 today and cancel anytime.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("💡 How This Works")}</span>
            </button>
          )}
          {/* Live Tier Status Pill */}
          <div data-tour="subscription-tier-card" className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-bold text-slate-600">{t("Current Plan:")}</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              isPremium 
                ? 'bg-amber-400 text-amber-950 shadow-xs' 
                : 'bg-slate-300 text-slate-800'
            }`}>
              {isPremium ? (subscription.status === 'trial' ? `30d Trial (${getTrialDaysRemaining()}d left)` : `Premium (${subscription.billingCycle})`) : 'BeeYou Basic (Free)'}
            </span>
          </div>
        </div>
      </div>

      {/* Billing Switcher (Monthly vs Yearly) */}
      <div data-tour="subscription-billing-toggle" className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto border border-slate-200 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setBillingCycle('monthly');
            playChime('tap');
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer text-center ${
            subscription.billingCycle === 'monthly'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{t("Monthly • >2.99/mo")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBillingCycle('yearly');
            playChime('tap');
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subscription.billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{t("Yearly • >29.99/yr")}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
            subscription.billingCycle === 'yearly' ? 'bg-amber-300 text-amber-950' : 'bg-emerald-200 text-emerald-950'
          }`}>
            2 Mo Free
          </span>
        </button>
      </div>

      {/* HERO CURRENT STATUS CARD */}
      <div className={`p-6 sm:p-7 rounded-3xl border-2 relative overflow-hidden shadow-sm ${
        isPremium
          ? 'bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-purple-500/10 border-amber-300/80'
          : 'bg-gradient-to-br from-slate-100 via-indigo-50/50 to-sky-50/50 border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isPremium 
                  ? 'bg-amber-400 text-amber-950' 
                  : 'bg-slate-800 text-white'
              }`}>
                {isPremium 
                  ? (subscription.status === 'trial' ? '✨ 30-Day Free Trial Active' : `👑 BeeYou Premium Member (${subscription.billingCycle})`)
                  : '🌱 BeeYou Basic (Free Plan)'
                }
              </span>
              {isPremium && subscription.status === 'trial' && (
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {getTrialDaysRemaining()} Days Remaining
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isPremium 
                ? (subscription.status === 'trial' ? 'Full BeeYou Premium Trial is Active' : 'BeeYou Premium Membership')
                : 'You Are Currently on the Basic Plan'
              }
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isPremium
                ? 'Your family has full, unrestricted access to all 17 sensory soundscapes, unlimited visual routines & First-Then boards, medication refill tracking, therapist IEP summaries, avatar customizer, and cloud caregiver sync.'
                : `Basic gives you Day 1 essential AAC communication, 1 active visual routine, 1 medication tracker, and 2 calming sounds. Upgrade to BeeYou Premium for ${subscription.billingCycle === 'yearly' ? '$129.99/year (Free 2 months • $10.83/mo)' : '$12.99/month'} ($0 today with a 30-day free trial) to unlock the full clinical suite.`
              }
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {t("No ads or tracking ever")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {t("Cancel anytime in 1 tap")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                100% offline-ready &amp; private
              </span>
            </div>
          </div>

          <div data-tour="subscription-trial-button" className="shrink-0 w-full md:w-auto">
            {isPremium ? (
              <button
                type="button"
                onClick={() => {
                  cancelSubscription();
                  showNotification('Subscription plan cancelled.');
                  playChime('clear');
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer shadow-2xs"
              >
                {t("Cancel Membership")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  startFreeTrial();
                  showNotification('Started 30-Day Free Trial with BeeYou Premium!');
                  playChime('star');
                }}
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>{t("Start 30-Day Free Trial ($0)")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
