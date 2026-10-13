import { useState, useEffect } from 'react';
import { SubscriptionInfo, SubscriptionTier, BillingCycle } from '../types';

export function useSubscriptionState() {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    try {
      const saved = localStorage.getItem('beeyou_subscription');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.tier === 'basic' || parsed.tier === 'premium')) {
          if (parsed.status === 'trial' && parsed.trialEndDate) {
            const end = new Date(parsed.trialEndDate).getTime();
            if (Date.now() > end) {
              return {
                ...parsed,
                tier: 'basic',
                status: 'expired',
                weeklyPrice: 2.99,
                monthlyPrice: 8.99,
                yearlyPrice: 89.99,
                trialDays: 15,
              };
            }
          }
          return {
            ...parsed,
            weeklyPrice: 2.99,
            monthlyPrice: 8.99,
            yearlyPrice: 89.99,
            trialDays: 15,
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_subscription:', e);
    }
    return {
      tier: 'basic',
      status: 'basic',
      billingCycle: 'monthly',
      weeklyPrice: 2.99,
      monthlyPrice: 8.99,
      yearlyPrice: 89.99,
      trialDays: 15,
      autoRenew: true,
    };
  });

  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallTriggerReason, setPaywallTriggerReason] = useState<string>(
    'Unlock all BeeYou Premium features'
  );

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_subscription', JSON.stringify(subscription));
    } catch (e) {}
  }, [subscription]);

  const isPremium =
    subscription.tier === 'premium' ||
    subscription.status === 'trial' ||
    subscription.status === 'active';

  const triggerUpgrade = (reason?: string) => {
    if (reason) setPaywallTriggerReason(reason);
    setShowPaywallModal(true);
  };

  const startFreeTrial = (cycle?: BillingCycle) => {
    const chosenCycle = cycle || subscription.billingCycle || 'monthly';
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    setSubscription({
      tier: 'premium',
      status: 'trial',
      billingCycle: chosenCycle,
      trialStartDate: startDate.toISOString(),
      trialEndDate: endDate.toISOString(),
      weeklyPrice: 2.99,
      monthlyPrice: 8.99,
      yearlyPrice: 89.99,
      trialDays: 15,
      autoRenew: true,
    });
    setShowPaywallModal(false);
  };

  const activateSubscription = (cycle?: BillingCycle) => {
    setSubscription((prev) => ({
      ...prev,
      tier: 'premium',
      status: 'active',
      billingCycle: cycle || prev.billingCycle || 'monthly',
      weeklyPrice: 2.99,
      monthlyPrice: 8.99,
      yearlyPrice: 89.99,
      trialDays: 15,
    }));
    setShowPaywallModal(false);
  };

  const cancelSubscription = () => {
    setSubscription({
      tier: 'basic',
      status: 'basic',
      billingCycle: 'monthly',
      weeklyPrice: 2.99,
      monthlyPrice: 8.99,
      yearlyPrice: 89.99,
      trialDays: 15,
      autoRenew: false,
    });
  };

  const setBillingCycle = (cycle: BillingCycle) => {
    setSubscription((prev) => ({
      ...prev,
      billingCycle: cycle,
    }));
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    if (tier === 'premium') {
      startFreeTrial();
    } else {
      cancelSubscription();
    }
  };

  const getTrialDaysRemaining = (): number => {
    if (subscription.status !== 'trial' || !subscription.trialEndDate) return 0;
    const diff = new Date(subscription.trialEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    subscription,
    isPremium,
    showPaywallModal,
    setShowPaywallModal,
    paywallTriggerReason,
    triggerUpgrade,
    startFreeTrial,
    activateSubscription,
    cancelSubscription,
    setBillingCycle,
    setSubscriptionTier,
    getTrialDaysRemaining,
  };
}
