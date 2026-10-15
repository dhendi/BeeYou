import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticFeedbackType = 
  | 'light'       // Gentle tap (AAC tile tap, sound toggle, subtle UI click)
  | 'medium'      // Distinct click (modals, sub-tabs)
  | 'selection'   // Slider scrub, volume tick, picker step
  | 'success'     // Routine complete, star reward, milestone celebration
  | 'warning'     // Alert notification, timer alert
  | 'error';      // Validation error

let cachedHapticsEnabled: boolean | null = null;

/**
 * Update the in-memory cache of the user's haptics preference.
 */
export function setHapticsEnabled(enabled: boolean): void {
  cachedHapticsEnabled = enabled;
}

/**
 * Checks whether sensory haptics are enabled.
 * Defaults strictly to FALSE per user preference.
 */
export function isHapticsEnabled(): boolean {
  if (cachedHapticsEnabled !== null) {
    return cachedHapticsEnabled;
  }
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('beeyou_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.settings?.hapticsEnabled === 'boolean') {
        cachedHapticsEnabled = parsed.settings.hapticsEnabled;
        return parsed.settings.hapticsEnabled;
      }
    }
  } catch (e) {}
  return false;
}

/**
 * Trigger sensory tactile haptic feedback.
 * If haptics are disabled and `force` is not set, this is a zero-latency no-op.
 */
export async function triggerHaptic(
  type: HapticFeedbackType = 'light',
  force = false
): Promise<void> {
  const enabled = force || isHapticsEnabled();
  if (!enabled) return;

  // 1. Primary: Native Capacitor Haptics (iOS Taptic Engine & Android Vibration Motor)
  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionChanged();
        return;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        return;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        return;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        return;
      case 'light':
      default:
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
    }
  } catch {
    // Native plugin unavailable (e.g. running in standard browser/PWA)
  }

  // 2. Fallback: Browser Web Vibration API (Android Chrome & compatible mobile browsers)
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'selection':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([25, 40, 35]);
          break;
        case 'warning':
          navigator.vibrate([35, 40, 35]);
          break;
        case 'error':
          navigator.vibrate([40, 50, 40, 50, 40]);
          break;
        case 'light':
        default:
          navigator.vibrate(15);
          break;
      }
    }
  } catch {
    // Silent fail if vibration is blocked or unsupported
  }
}
