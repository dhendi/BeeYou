/**
 * BeeYou Production Subscription State Machine & Stripe Webhook Lifecycle
 * Handles edge cases that break naive payment integrations:
 * - Payment failures (invoice.payment_failed)
 * - Subscription cancellations & period-end expirations
 * - Past due grace periods (ensuring children never lose emergency AAC tools during billing retries)
 * - Stripe webhook event processing schema
 */

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'grace_period';

export interface SubscriptionState {
  customerId?: string;
  subscriptionId?: string;
  status: SubscriptionStatus;
  planId: 'monthly' | 'yearly';
  currentPeriodEnd: number; // UTC timestamp ms
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt?: number;
  lastPaymentError?: string;
  retryCount: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: 
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_succeeded'
    | 'invoice.payment_failed'
    | 'invoice.payment_action_required';
  data: {
    object: any;
  };
}

/**
 * Evaluates whether premium features are accessible, accounting for offline grace periods
 */
export function hasActiveSubscriptionAccess(sub: SubscriptionState): boolean {
  const now = Date.now();

  // Active or trialing
  if (sub.status === 'active' || sub.status === 'trialing') {
    return true;
  }

  // If past due, give a 7-day grace period so child is never locked out of vital communication
  if (sub.status === 'past_due' || sub.status === 'grace_period') {
    if (sub.gracePeriodEndsAt && now < sub.gracePeriodEndsAt) {
      return true;
    }
  }

  // If canceled but paid period has not yet expired
  if (sub.cancelAtPeriodEnd && now < sub.currentPeriodEnd) {
    return true;
  }

  return false;
}

/**
 * Pure state transition reducer for Stripe webhook events
 */
export function reduceSubscriptionWebhookEvent(
  currentState: SubscriptionState,
  event: StripeWebhookEvent
): SubscriptionState {
  const now = Date.now();
  const obj = event.data.object;

  switch (event.type) {
    case 'invoice.payment_succeeded':
      return {
        ...currentState,
        status: 'active',
        currentPeriodEnd: (obj.lines?.data?.[0]?.period?.end || 0) * 1000 || now + 30 * 24 * 3600 * 1000,
        lastPaymentError: undefined,
        retryCount: 0,
        gracePeriodEndsAt: undefined,
      };

    case 'invoice.payment_failed':
      return {
        ...currentState,
        status: 'past_due',
        lastPaymentError: obj.last_payment_error?.message || 'Payment method failed',
        retryCount: (currentState.retryCount || 0) + 1,
        // Grant a 7-day grace period from first failure
        gracePeriodEndsAt: currentState.gracePeriodEndsAt || now + 7 * 24 * 3600 * 1000,
      };

    case 'customer.subscription.updated':
      return {
        ...currentState,
        status: obj.status as SubscriptionStatus,
        cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
        currentPeriodEnd: (obj.current_period_end || 0) * 1000,
      };

    case 'customer.subscription.deleted':
      return {
        ...currentState,
        status: 'canceled',
        cancelAtPeriodEnd: false,
      };

    default:
      return currentState;
  }
}
