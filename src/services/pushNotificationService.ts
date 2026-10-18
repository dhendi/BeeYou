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
      // Note: Calling requestPermission outside user gesture is blocked by browsers,
      // so if permission is not granted, we silently return here
      return;
    }

    const isEmergency = payload.priority === 'emergency' || payload.priority === 'high';
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
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/pwa-192x192.png',
      tag: payload.tag || 'beeyou-alert-' + Date.now(),
      vibrate: vibrationPattern as any,
      requireInteraction: isEmergency, // Stays on screen until caregiver interacts
      silent: false,
      data: {
        url: typeof window !== 'undefined' ? window.location.origin + '/?role=caregiver' : '/',
        ...payload.data
      },
      actions: payload.actions || [
        { action: 'im_here', title: "I'm Here" },
        { action: 'on_my_way', title: 'On My Way' }
      ]
    };

    // Try service worker registration first for background persistence
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(payload.title, notificationOptions);
          return;
        }
      } catch (err) {
        console.warn('Service worker showNotification fallback to window Notification:', err);
      }
    }

    // Fallback to standard window Notification
    try {
      const windowOptions: any = { ...notificationOptions };
      // Standard window Notification does not support actions array in desktop browsers
      delete windowOptions.actions;
      new Notification(payload.title, windowOptions);
    } catch (err) {
      console.warn('Native notification fallback failed:', err);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
