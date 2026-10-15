import { useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { triggerBackAction } from '../services/modalBackHandler';

interface UseMobileHardwareBackOptions {
  /**
   * Called when no modal is open and the user presses Back.
   * Return true if navigation was handled (e.g., switched from 'aac' back to 'home').
   * Return false if already at root screen.
   */
  onNavigateBack?: () => boolean;
}

/**
 * Universal Mobile Hardware Back Button & Escape Key Controller.
 * Intercepts Android hardware/gesture back buttons (Capacitor) and Escape keys.
 * 1. Closes topmost active modal/drawer.
 * 2. If no modal is open, navigates back to 'home'.
 * 3. If already at 'home', cleanly minimizes the app to background instead of quitting.
 */
export function useMobileHardwareBack(options?: UseMobileHardwareBackOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Desktop & Bluetooth Keyboard Escape Key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const handledModal = triggerBackAction();
        if (handledModal) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (optionsRef.current?.onNavigateBack) {
          const handledNav = optionsRef.current.onNavigateBack();
          if (handledNav) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. Android Hardware Back Button (Capacitor Native Bridge)
    let listenerHandle: any = null;
    try {
      CapApp.addListener('backButton', async ({ canGoBack }) => {
        // Priority 1: Dismiss open modal or drawer
        const handledModal = triggerBackAction();
        if (handledModal) {
          return;
        }

        // Priority 2: Navigate back to home screen
        if (optionsRef.current?.onNavigateBack) {
          const handledNav = optionsRef.current.onNavigateBack();
          if (handledNav) {
            return;
          }
        }

        // Priority 3: At root view — minimize app cleanly to background
        try {
          await CapApp.minimizeApp();
        } catch {
          if (canGoBack) {
            window.history.back();
          }
        }
      })
        .then((handle) => {
          listenerHandle = handle;
        })
        .catch(() => {});
    } catch (e) {
      // Running in pure web browser without Capacitor native bridge
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (listenerHandle?.remove) {
        listenerHandle.remove();
      }
    };
  }, []);
}
