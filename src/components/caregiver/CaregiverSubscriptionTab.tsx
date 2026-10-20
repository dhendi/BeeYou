import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { 
  getStoredEmailVerificationStatus, 
  checkEmailVerificationStatus 
} from '../../services/authService';
import { SUBSCRIPTION_PRICES } from '../../services/subscriptionService';

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
    isRestoring,
    setBillingCycle,
    getTrialDaysRemaining,
    startFreeTrial,
    cancelSubscription,
    setSubscriptionTier,
    restorePurchases,
    purchaseSubscription,
    setShowEmailVerificationModal,
  } = useApp();

  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState<string | null>(null);

  const handleRestore = async () => {
    playChime('tap');
    try {
      const res = await restorePurchases();
      showNotification(res.message);
      if (res.restored) {
        playChime('star');
      } else {
        playChime('tap');
      }
    } catch {
      showNotification('Unable to restore purchases. Please check your connection.');
      playChime('alert');
    }
  };

  const handleSimulatedTest = async (
    scenario: 'success' | 'payment_declined' | 'user_cancelled' | 'network_interrupted' | 'parental_approval_pending'
  ) => {
    setDiagnosticStatus(`Testing scenario: ${scenario}...`);
    const res = await purchaseSubscription(subscription.billingCycle || 'monthly', scenario);
    if (res.success) {
      setDiagnosticStatus('Purchase succeeded! Premium features unlocked and entitlement signed.');
      showNotification('BeeYou Premium unlocked successfully!');
      playChime('star');
    } else {
      setDiagnosticStatus(`Handled gracefully: [${res.errorCode}] ${res.error}`);
      showNotification(res.error || 'Payment was not completed.');
      playChime('alert');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t("BeeYou Membership & Plans")}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs">
              {subscription.billingCycle === 'yearly' ? '$89.99 / yr' : '$9.99 / mo'}
            </span>
            {subscription.billingCycle === 'yearly' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Save 25% (Best Value)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t("Transparent, neurodiversity-affirming pricing with a 15-day free trial. Start with $0 today and cancel anytime.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Restore Purchases Button (Mandatory for App Store & Google Play) */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Restore purchases made with your Apple ID or Google Play Account"
          >
            <span>{isRestoring ? 'Restoring...' : 'Restore Purchases'}</span>
          </button>

          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>{t("How This Works")}</span>
            </button>
          )}

          {/* Live Tier Status Pill */}
          <div data-tour="subscription-tier-card" className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t("Current Plan:")}</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              isPremium 
                ? 'bg-amber-400 text-amber-950 shadow-xs' 
                : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}>
              {isPremium ? (
                subscription.status === 'trial' 
                  ? `15d Trial (${getTrialDaysRemaining()}d left)` 
                  : subscription.status === 'grace_period'
                    ? 'Grace Period'
                    : `Premium (${subscription.billingCycle})`
              ) : (
                subscription.status === 'cancelled'
                  ? 'Cancelled'
                  : subscription.status === 'expired'
                    ? 'Expired'
                    : subscription.status === 'refunded'
                      ? 'Refunded'
                      : subscription.status === 'revoked'
                        ? 'Revoked'
                        : 'BeeYou Basic (Free)'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Status Notifications */}
      {subscription.status === 'grace_period' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex items-start gap-3">
          <div className="text-amber-600"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide">
              Payment Retry in Progress (Grace Period)
            </h4>
            <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-0.5">
              Your app store could not process the recent renewal. Your BeeYou Premium features remain fully active for 16 days while your app store retries the payment method. Please check your Apple ID or Google Play payment method.
            </p>
          </div>
        </div>
      )}

      {subscription.status === 'cancelled' && subscription.expiresAt && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-700 flex items-start gap-3">
          <div className="text-sky-600"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <h4 className="text-xs font-black text-sky-950 dark:text-sky-200 uppercase tracking-wide">
              Subscription Cancelled
            </h4>
            <p className="text-xs text-sky-900 dark:text-sky-300 font-medium mt-0.5">
              Your subscription has been cancelled and will not auto-renew. You retain full access to all BeeYou Premium features until {new Date(subscription.expiresAt).toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}

      {(subscription.status === 'refunded' || subscription.status === 'revoked') && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700 flex items-start gap-3">
          <div className="text-rose-600"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <h4 className="text-xs font-black text-rose-950 dark:text-rose-200 uppercase tracking-wide">
              Subscription {subscription.status === 'refunded' ? 'Refunded' : 'Revoked'}
            </h4>
            <p className="text-xs text-rose-900 dark:text-rose-300 font-medium mt-0.5">
              {subscription.cancellationReason || 'This subscription has been refunded or revoked. Your account is on the Basic plan.'}
            </p>
          </div>
        </div>
      )}

      {/* Billing Switcher (Monthly vs Yearly) */}
      <div data-tour="subscription-billing-toggle" className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-lg mx-auto border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
        <button
          type="button"
          onClick={() => {
            setBillingCycle('monthly');
            playChime('tap');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs transition-all cursor-pointer text-center ${
            subscription.billingCycle === 'monthly'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>{t("Monthly • $9.99/mo")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBillingCycle('yearly');
            playChime('tap');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subscription.billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <span>{t("Yearly • $89.99/yr")}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
            subscription.billingCycle === 'yearly' ? 'bg-amber-300 text-amber-950' : 'bg-emerald-200 text-emerald-950'
          }`}>
            Save 25%
          </span>
        </button>
      </div>

      {/* HERO CURRENT STATUS CARD */}
      <div className={`p-6 sm:p-7 rounded-3xl border-2 relative overflow-hidden shadow-sm ${
        isPremium
          ? 'bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-purple-500/10 border-amber-300/80 dark:border-amber-600/40'
          : 'bg-gradient-to-br from-slate-100 via-indigo-50/50 to-sky-50/50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isPremium 
                  ? 'bg-amber-400 text-amber-950' 
                  : 'bg-slate-800 dark:bg-slate-700 text-white'
              }`}>
                {isPremium 
                  ? (subscription.status === 'trial' ? '15-Day Free Trial Active' : `BeeYou Premium Member (${subscription.billingCycle})`)
                  : 'BeeYou Basic (Free Plan)'
                }
              </span>
              {isPremium && subscription.status === 'trial' && (
                <span className="text-xs font-black text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  {getTrialDaysRemaining()} Days Remaining
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isPremium 
                ? (subscription.status === 'trial' ? 'Full BeeYou Premium Trial is Active' : 'BeeYou Premium Membership')
                : 'You Are Currently on the Basic Plan'
              }
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {isPremium
                ? 'Your family has full, unrestricted access to all 30+ sensory soundscapes & frequencies, unlimited visual routines & First-Then boards, medication refill tracking, therapist IEP summaries, and cloud caregiver sync.'
                : `Basic gives you Day 1 essential AAC communication, 2 active visual routines, 1 medication tracker, and 5 calming sounds. Upgrade to BeeYou Premium for ${subscription.billingCycle === 'yearly' ? '$89.99/year (~$7.50/mo)' : '$9.99/month'} ($0 today with a 15-day free trial) to unlock the full clinical suite.`
              }
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>{t("No ads or tracking ever")}</span>
              <span>•</span>
              <span>{t("Cancel anytime in 1 tap")}</span>
              <span>•</span>
              <span>100% offline-ready & private</span>
            </div>
          </div>

          <div data-tour="subscription-trial-button" className="shrink-0 w-full md:w-auto">
            {isPremium ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    cancelSubscription();
                    showNotification('Subscription plan cancelled.');
                    playChime('clear');
                  }}
                  className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs cursor-pointer shadow-2xs"
                >
                  {t("Cancel Membership")}
                </button>
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="w-full md:w-auto px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    const isVerified = getStoredEmailVerificationStatus();
                    if (!isVerified) {
                      const liveCheck = await checkEmailVerificationStatus();
                      if (!liveCheck.isVerified) {
                        setShowEmailVerificationModal(true);
                        return;
                      }
                    }
                    startFreeTrial();
                    showNotification('Started 15-Day Free Trial with BeeYou Premium!');
                    playChime('star');
                  }}
                  className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition"
                >
                  <span>{t("Start 15-Day Free Trial ($0)")}</span>
                </button>
                {!getStoredEmailVerificationStatus() && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold text-center md:text-right">
                    Email verification unlocks 15-day free Premium trial
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apple App Store (Guideline 3.1.2) & Google Play Mandatory Renewal Terms & Cancellation Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            Subscription Terms & Auto-Renewal Policy (StoreKit & Google Play Compliance)
          </span>
        </div>
        <p className="leading-relaxed">
          • <strong>Billing & Auto-Renewal:</strong> Payment will be charged to your Apple ID Account or Google Play Account upon purchase confirmation. Subscription automatically renews at <strong>${subscription.billingCycle === 'yearly' ? `${SUBSCRIPTION_PRICES.yearly}/year` : `${SUBSCRIPTION_PRICES.monthly}/month`}</strong> unless auto-renew is turned off at least 24 hours prior to the end of the current billing cycle.
        </p>
        <p className="leading-relaxed">
          • <strong>Renewal Charge:</strong> Your account will be charged for renewal within 24 hours prior to the end of the current period, identifying the recurring fee.
        </p>
        <p className="leading-relaxed">
          • <strong>Cancellation & Management:</strong> You can manage or cancel your subscription at any time in your device settings. Any unused portion of a free trial period is forfeited upon subscription purchase.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 font-bold text-amber-800 dark:text-amber-400">
          <a 
            href="https://apps.apple.com/account/subscriptions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline flex items-center gap-1"
          >
            <span>Manage Apple Subscriptions ↗</span>
          </a>
          <a 
            href="https://play.google.com/store/account/subscriptions" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline flex items-center gap-1"
          >
            <span>Manage Google Play Subscriptions ↗</span>
          </a>
          <button 
            type="button" 
            onClick={handleRestore}
            className="hover:underline cursor-pointer"
          >
            Restore In-App Purchases
          </button>
        </div>
      </div>

      {/* Pre-Launch Payment Diagnostic & Simulation Suite (Checklist Item 7 Verification) */}
      <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <button
          type="button"
          onClick={() => setDiagnosticOpen(!diagnosticOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Pre-Launch Payment QA & Interruption Simulator
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
              Audit Item 7 Tested
            </span>
          </div>
          <span className="text-xs text-slate-400 font-bold">{diagnosticOpen ? 'Hide' : 'Expand'}</span>
        </button>

        {diagnosticOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Test how BeeYou handles failed charges, user cancellations, and network dropouts gracefully without double-charging or corrupting state:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubscriptionTier('basic');
                  showNotification('Switched to Free Basic Plan for testing.');
                  setDiagnosticStatus('Current plan switched to BeeYou Basic (Free Tier).');
                  playChime('clear');
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left cursor-pointer"
              >
                Switch to Free Plan (Test Basic)
              </button>
              <button
                type="button"
                onClick={() => {
                  startFreeTrial();
                  showNotification('Switched to BeeYou Plus Trial for testing.');
                  setDiagnosticStatus('Current plan switched to BeeYou Plus (15-Day Trial).');
                  playChime('star');
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-left cursor-pointer"
              >
                Switch to BeeYou Plus (Test Trial)
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedTest('success')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left cursor-pointer"
              >
                ✓ Test Successful Purchase ($9.99)
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedTest('payment_declined')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left cursor-pointer"
              >
                ✕ Test Payment Declined
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedTest('user_cancelled')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-left cursor-pointer"
              >
                ⊘ Test User Cancelled Modal
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedTest('network_interrupted')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-left cursor-pointer"
              >
                Test Network Interruption
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedTest('parental_approval_pending')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-left cursor-pointer"
              >
                Test Ask-to-Buy Approval
              </button>
            </div>
            {diagnosticStatus && (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                {diagnosticStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
