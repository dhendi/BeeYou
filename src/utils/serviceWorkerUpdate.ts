/**
 * Service Worker Update & Controller Lifecycle Manager
 *
 * Ensures smooth PWA bundle updates without interrupting the initial user
 * experience or background neural voice model downloads.
 *
 * Key guarantees:
 * 1. First-install safety: Never reloads the page on initial service worker installation
 *    (when navigator.serviceWorker.controller was null on initial page load).
 * 2. Update responsiveness: Reloads the page when an existing installation activates
 *    a new service worker version via skipWaiting and clients.claim().
 * 3. Loop protection: Enforces a minimum interval between service-worker-triggered
 *    reloads using sessionStorage to prevent reload loops.
 */

export interface SwUpdateOptions {
  serviceWorker?: {
    controller: any;
    addEventListener?: (event: string, handler: (e?: any) => void) => void;
    removeEventListener?: (event: string, handler: (e?: any) => void) => void;
    getRegistrations?: () => Promise<any[]>;
  };
  reloadFn?: () => void;
  storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
}

export interface SwUpdateController {
  hadInitialController: boolean;
  onControllerChange: () => boolean;
}

export const SW_RELOAD_STORAGE_KEY = 'beeyou_sw_reload_ts';
export const SW_RELOAD_COOLDOWN_MS = 10000;

export function initServiceWorkerUpdates(options?: SwUpdateOptions): SwUpdateController | null {
  const sw =
    options?.serviceWorker ||
    (typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      ? navigator.serviceWorker
      : undefined);

  if (!sw) return null;

  const reload =
    options?.reloadFn ||
    (() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });

  const storage =
    options?.storage ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage : undefined);

  // Trigger background check for service worker updates
  if (typeof sw.getRegistrations === 'function') {
    sw.getRegistrations()
      .then((registrations) => {
        if (Array.isArray(registrations)) {
          for (const registration of registrations) {
            registration?.update?.().catch(() => {});
          }
        }
      })
      .catch(() => {});
  }

  // Record whether this page load was already controlled by a service worker.
  // On first visit (fresh install), controller is null/undefined.
  const hadInitialController = Boolean(sw.controller);
  let refreshing = false;

  const onControllerChange = (): boolean => {
    if (refreshing) return false;

    // First install: the page was loaded directly from the network.
    // Do NOT reload, as that aborts background Piper model downloads and restarts the app.
    if (!hadInitialController) {
      return false;
    }

    // Guard against reload loops
    if (storage) {
      try {
        const lastReload = storage.getItem(SW_RELOAD_STORAGE_KEY);
        const now = Date.now();
        if (lastReload && now - Number(lastReload) < SW_RELOAD_COOLDOWN_MS) {
          console.warn('[PWA] Suppressed rapid service worker reload loop');
          return false;
        }
        storage.setItem(SW_RELOAD_STORAGE_KEY, String(now));
      } catch {}
    }

    refreshing = true;
    reload();
    return true;
  };

  if (typeof sw.addEventListener === 'function') {
    sw.addEventListener('controllerchange', onControllerChange);
  }

  return { hadInitialController, onControllerChange };
}
