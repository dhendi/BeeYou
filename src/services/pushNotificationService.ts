/**
 * BeeYou Web Push & Background Service Worker Notification Service
 * Ensures Caregiver emergency alerts (SOS, Overwhelmed, Need Break) trigger instant native vibration & visual chimes
 * even when the browser is backgrounded or the phone screen is locked.
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: any;
  priority?: 'high' | 'normal' | 'emergency';
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

export interface DeviceReliabilityReport {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isStandalonePwa: boolean;
  isServiceWorkerActive: boolean;
  isVibrationSupported: boolean;
  platform: 'ios' | 'android' | 'desktop';
  reliabilityRating: 'optimal' | 'moderate' | 'limited';
  recommendations: string[];
  disclaimer: string;
}

export type CaregiverPushNotificationPayload = PushNotificationPayload;

export const LOCK_SCREEN_PRIVACY_STORAGE_KEY = 'beeyou_lock_screen_privacy_mode';

export function getStoredLockScreenPrivacyMode(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(LOCK_SCREEN_PRIVACY_STORAGE_KEY);
    if (saved !== null) return saved === 'true';
  } catch {}
  return true; // Defaults to TRUE to safeguard child privacy on lock screens
}

export function setStoredLockScreenPrivacyMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCK_SCREEN_PRIVACY_STORAGE_KEY, String(enabled));
  } catch {}
}

/**
 * Sanitizes a notification to mask sensitive personal child information
 * (e.g. meltdown causes, private medical notes, specific prescription drug names)
 * when displayed on lock screens or public notification banners.
 */
export function sanitizeNotificationForLockScreen(
  payload: PushNotificationPayload,
  protectPrivacy: boolean = getStoredLockScreenPrivacyMode()
): PushNotificationPayload {
  if (!protectPrivacy) {
    return payload;
  }

  const rawTitle = payload.title || 'BeeYou';
  const rawBody = payload.body || '';

  let sanitizedTitle = 'BeeYou Alert';
  let sanitizedBody = 'New message from your child. Tap to view securely in BeeYou.';

  const lowerTitle = rawTitle.toLowerCase();
  const lowerBody = rawBody.toLowerCase();

  // Check alert category or context (Distress/Emergency takes highest priority)
  if (
    payload.priority === 'emergency' ||
    lowerTitle.includes('sos') ||
    lowerTitle.includes('urgent') ||
    lowerTitle.includes('overwhelm') ||
    lowerTitle.includes('meltdown') ||
    lowerTitle.includes('support') ||
    lowerBody.includes('overwhelm') ||
    lowerBody.includes('meltdown') ||
    lowerBody.includes('support')
  ) {
    sanitizedTitle = 'BeeYou Family Alert';
    sanitizedBody = 'Your child needs your support or attention. Tap to respond securely in BeeYou.';
  } else if (
    lowerTitle.includes('medication') ||
    lowerBody.includes('medication') ||
    lowerBody.includes('dose') ||
    lowerBody.includes('refill')
  ) {
    sanitizedTitle = 'BeeYou Health Reminder';
    sanitizedBody = 'Scheduled routine reminder. Tap to view securely in app.';
  } else if (lowerTitle.includes('test') || lowerBody.includes('test')) {
    sanitizedTitle = 'BeeYou: Notification Test';
    sanitizedBody = 'Sound & notification delivery confirmed.';
  }

  return {
    ...payload,
    title: sanitizedTitle,
    body: sanitizedBody,
    data: {
      ...payload.data,
      isLockScreenMasked: true,
      originalTitle: rawTitle,
      originalBody: rawBody,
    },
  };
}

class PushNotificationService {
  private isSupported: boolean = false;
  private hasPermission: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.isSupported = true;
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  /**
   * Check if notifications are allowed
   */
  isPermissionGranted(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Assess device notification reliability & background wake-up readiness
   */
  getReliabilityReport(): DeviceReliabilityReport {
    if (typeof window === 'undefined') {
      return {
        isSupported: false,
        permission: 'unsupported',
        isStandalonePwa: false,
        isServiceWorkerActive: false,
        isVibrationSupported: false,
        platform: 'desktop',
        reliabilityRating: 'limited',
        recommendations: ['Running in non-browser environment'],
        disclaimer: 'IMPORTANT: Notification delivery cannot be guaranteed if the phone is powered off, in deep sleep/Do Not Disturb, or offline. Never use BeeYou as a sole emergency or 911 dispatch system.',
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    const hasSw = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    const hasVibrate = 'vibrate' in navigator;
    const permission = this.getPermissionStatus();

    const recommendations: string[] = [];
    let rating: 'optimal' | 'moderate' | 'limited' = 'optimal';

    if (permission !== 'granted') {
      rating = 'limited';
      recommendations.push('Notification permissions are not granted. Enable notifications in browser settings.');
    }

    if (isIOS) {
      if (!isStandalone) {
        rating = 'limited';
        recommendations.push(
          'On iOS, Safari requires adding BeeYou to the Home Screen ("Share" -> "Add to Home Screen") for Web Push and background alerts to function.'
        );
      }
      recommendations.push(
        'Check iOS Focus / Do Not Disturb modes to ensure BeeYou is in the "Allowed Notifications" list.'
      );
    } else if (isAndroid) {
      recommendations.push(
        'For reliable alerts when the screen is locked, ensure Android Battery Optimization is set to "Unrestricted" for BeeYou.'
      );
    }

    if (!hasSw) {
      if (rating === 'optimal') rating = 'moderate';
      recommendations.push('Service worker is caching. Keep tab active or install app to ensure background wakes.');
    }

    return {
      isSupported: this.isSupported,
      permission,
      isStandalonePwa: isStandalone,
      isServiceWorkerActive: hasSw,
      isVibrationSupported: hasVibrate,
      platform,
      reliabilityRating: rating,
      recommendations,
      disclaimer:
        'IMPORTANT: Notification delivery cannot be guaranteed if the phone is powered off, in deep sleep/Do Not Disturb, or offline. Never use BeeYou as a sole emergency or 911 dispatch system.',
    };
  }

  /**
   * Schedules a delayed notification to allow testing background wake-up and locked screen alerts
   */
  scheduleDelayedAlert(
    seconds: number = 5,
    payload?: PushNotificationPayload,
    onTick?: (secRemaining: number) => void
  ): () => void {
    let remaining = seconds;
    if (onTick) onTick(remaining);

    const intervalId = setInterval(() => {
      remaining -= 1;
      if (onTick) onTick(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    const timeoutId = setTimeout(async () => {
      clearInterval(intervalId);
      await this.triggerAlertNotification(
        payload || {
          title: 'BeeYou Alert: Lock-Screen Test',
          body: 'Success! Your device woke up and displayed this background alert.',
          priority: 'emergency',
          tag: 'beeyou-lock-test-' + Date.now(),
        }
      );
    }, seconds * 1000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }

  /**
   * Sends a test alert notification to verify device sound, banner, and vibration
   */
  async sendTestNotification(childName = 'Child'): Promise<boolean> {
    if (!this.isSupported) return false;
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    await this.triggerAlertNotification({
      title: `BeeYou Alert: Test from ${childName}`,
      body: `Sound & push notifications are working on this device!`,
      priority: 'high',
      tag: 'beeyou-test-' + Date.now(),
    });
    return true;
  }

  /**
   * Dispatches a high-priority native notification with vibration pattern
   */
  async triggerAlertNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.isSupported) return;

    if (Notification.permission !== 'granted') {
      return;
    }

    const safePayload = sanitizeNotificationForLockScreen(payload);
    const isEmergency = safePayload.priority === 'emergency' || safePayload.priority === 'high';
    const vibrationPattern = isEmergency 
      ? [300, 100, 300, 100, 500, 150, 500] 
      : [150, 75, 150];

    // Trigger physical hardware vibration if available on mobile/tablet
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(vibrationPattern);
      } catch {}
    }

    const notificationOptions: any = {
      body: safePayload.body,
      icon: safePayload.icon || '/pwa-192x192.png',
      badge: safePayload.badge || '/pwa-192x192.png',
      tag: safePayload.tag || 'beeyou-alert-' + Date.now(),
      vibrate: vibrationPattern as any,
      requireInteraction: isEmergency, // Stays on screen until caregiver interacts
      silent: false,
      data: {
        url: typeof window !== 'undefined' ? window.location.origin + '/?role=caregiver' : '/',
        ...safePayload.data
      },
      actions: safePayload.actions || [
        { action: 'im_here', title: "I'm Here" },
        { action: 'on_my_way', title: 'On My Way' }
      ]
    };

    // Try service worker registration first for background persistence
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(safePayload.title, notificationOptions);
          return;
        }
      } catch (err) {
        console.warn('Service worker showNotification fallback to window Notification:', err);
      }
    }

    // Fallback to standard window Notification
    try {
      const windowOptions: any = { ...notificationOptions };
      delete windowOptions.actions;
      new Notification(safePayload.title, windowOptions);
    } catch (err) {
      console.warn('Native notification fallback failed:', err);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
