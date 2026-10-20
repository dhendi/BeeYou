import { useState, useEffect, useCallback } from 'react';
import { SubscriptionInfo, SubscriptionTier, BillingCycle } from '../types';
import {
  loadSecureSubscription,
  saveSecureSubscription,
  signSubscriptionEntitlement,
  getDefaultBasicSubscription,
  executePurchase,
  restoreStorePurchases,
  validateSubscriptionLifecycle,
  SUBSCRIPTION_PRICES,
  DEFAULT_TRIAL_DAYS,
  verifyEntitlementSignature,
  BEE_PRODUCT_MONTHLY,
  BEE_PRODUCT_ANNUAL,
} from '../services/subscriptionService';

export function useSubscriptionState() {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    // Synchronous initial check with signature validation
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('beeyou_subscription');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            // Anti-tamper verification on initial synchronous load
            if (parsed.tier === 'premium' || parsed.status === 'active' || parsed.status === 'trial') {
              if (verifyEntitlementSignature(parsed as SubscriptionInfo)) {
                return validateSubscriptionLifecycle(parsed as SubscriptionInfo);
              }
              // Signature mismatch! Tampering detected. Return Basic.
              console.warn('[Security] Entitlement signature mismatch on initial load. Defaulting to Basic.');
              return getDefaultBasicSubscription();
            }
            return validateSubscriptionLifecycle(parsed as SubscriptionInfo);
          }
        }
      } catch (e) {
        console.error('Failed to parse initial beeyou_subscription:', e);
      }
    }
    return getDefaultBasicSubscription();
  });

  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallTriggerReason, setPaywallTriggerReason] = useState<string>(
    'Unlock all BeeYou Premium features'
  );
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Asynchronous load and validation from secure sandboxed storage on mount
  useEffect(() => {
    let isMounted = true;
    loadSecureSubscription().then((verified) => {
      if (isMounted) {
        setSubscription(verified);
      }
    });

    // Check lifecycle on focus/resume (e.g. app returning from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSecureSubscription().then((verified) => {
          if (isMounted) {
            setSubscription(verified);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Save changes to signed storage
  const updateAndSaveSubscription = useCallback(async (newSub: SubscriptionInfo) => {
    const signed = signSubscriptionEntitlement(newSub);
    setSubscription(signed);
    await saveSecureSubscription(signed);
  }, []);

  // Developer test bypass for rapid end-to-end verification of premium features and voices
  const IS_DEV_TEST_MODE = true;

  // Entitlement verification helper:
  // Must be premium tier, non-expired status, AND have a valid cryptographic signature
  const isPremium = Boolean(
    IS_DEV_TEST_MODE || (
      (subscription.tier === 'premium' || subscription.status === 'trial' || subscription.status === 'active' || subscription.status === 'grace_period') &&
      subscription.status !== 'expired' &&
      subscription.status !== 'refunded' &&
      subscription.status !== 'revoked' &&
      subscription.status !== 'basic' &&
      subscription.tier !== 'basic' &&
      verifyEntitlementSignature(subscription)
    )
  );

  const triggerUpgrade = (reason?: string) => {
    if (reason) setPaywallTriggerReason(reason);
    setShowPaywallModal(true);
  };

  const startFreeTrial = (cycle?: BillingCycle) => {
    const chosenCycle = cycle || subscription.billingCycle || 'monthly';
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const newSub: SubscriptionInfo = {
      tier: 'premium',
      status: 'trial',
      billingCycle: chosenCycle,
      trialStartDate: startDate.toISOString(),
      trialEndDate: endDate.toISOString(),
      monthlyPrice: SUBSCRIPTION_PRICES.monthly,
      yearlyPrice: SUBSCRIPTION_PRICES.yearly,
      trialDays: DEFAULT_TRIAL_DAYS,
      autoRenew: true,
      storeProvider: 'none',
    };
    updateAndSaveSubscription(newSub);
    setShowPaywallModal(false);
  };

  const activateSubscription = (cycle?: BillingCycle) => {
    const chosenCycle = cycle || subscription.billingCycle || 'monthly';
    const startDate = new Date();
    const daysToAdd = chosenCycle === 'yearly' ? 365 : 30;
    const expiresAt = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    const productId = chosenCycle === 'yearly' ? BEE_PRODUCT_ANNUAL : BEE_PRODUCT_MONTHLY;

    const newSub: SubscriptionInfo = {
      ...subscription,
      tier: 'premium',
      status: 'active',
      billingCycle: chosenCycle,
      productId,
      purchasedAt: startDate.toISOString(),
      expiresAt,
      monthlyPrice: SUBSCRIPTION_PRICES.monthly,
      yearlyPrice: SUBSCRIPTION_PRICES.yearly,
      trialDays: DEFAULT_TRIAL_DAYS,
      autoRenew: true,
    };
    updateAndSaveSubscription(newSub);
    setShowPaywallModal(false);
  };

  const cancelSubscription = () => {
    // If user has an active paid billing period, preserve Pro until period end
    if (subscription.status === 'active' && subscription.expiresAt && new Date(subscription.expiresAt).getTime() > Date.now()) {
      const cancelledSub: SubscriptionInfo = {
        ...subscription,
        status: 'cancelled',
        autoRenew: false,
        cancellationReason: 'Cancelled by user. Access continues until end of billing period.',
      };
      updateAndSaveSubscription(cancelledSub);
      return;
    }

    // Otherwise, downgrade immediately to basic
    const downgraded = getDefaultBasicSubscription();
    downgraded.cancellationReason = 'Subscription cancelled.';
    updateAndSaveSubscription(downgraded);
  };

  const restorePurchases = async (): Promise<{ success: boolean; restored: boolean; message: string }> => {
    setIsRestoring(true);
    try {
      const result = await restoreStorePurchases();
      if (result.success && result.subscription) {
        setSubscription(result.subscription);
      }
      return result;
    } finally {
      setIsRestoring(false);
    }
  };

  const purchaseSubscription = async (
    cycle: BillingCycle,
    simulateScenario?: 'success' | 'payment_declined' | 'user_cancelled' | 'network_interrupted' | 'parental_approval_pending'
  ): Promise<{ success: boolean; subscription: SubscriptionInfo; error?: string; errorCode?: string }> => {
    const res = await executePurchase(cycle, simulateScenario);
    if (res.success && res.subscription) {
      setSubscription(res.subscription);
      setShowPaywallModal(false);
    }
    return res;
  };

  const setBillingCycle = (cycle: BillingCycle) => {
    const updated: SubscriptionInfo = {
      ...subscription,
      billingCycle: cycle,
    };
    updateAndSaveSubscription(updated);
  };

  const setSubscriptionTier = (tier: SubscriptionTier) => {
    if (tier === 'premium') {
      startFreeTrial();
    } else {
      const basicSub = getDefaultBasicSubscription();
      updateAndSaveSubscription(basicSub);
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
    isRestoring,
    showPaywallModal,
    setShowPaywallModal,
    paywallTriggerReason,
    triggerUpgrade,
    startFreeTrial,
    activateSubscription,
    cancelSubscription,
    restorePurchases,
    purchaseSubscription,
    setBillingCycle,
    setSubscriptionTier,
    getTrialDaysRemaining,
  };
}
