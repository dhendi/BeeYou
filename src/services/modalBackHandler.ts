import { useEffect } from 'react';

export type ModalDismissHandler = () => boolean | void;

interface BackHandlerEntry {
  id: string;
  priority: number;
  handler: ModalDismissHandler;
}

const backHandlers: BackHandlerEntry[] = [];

/**
 * Registers a modal or drawer dismiss handler. Higher priority handlers run first.
 */
export function pushBackHandler(id: string, handler: ModalDismissHandler, priority: number = 0): () => void {
  // Prune any existing entry with the same ID
  const existingIdx = backHandlers.findIndex((e) => e.id === id);
  if (existingIdx !== -1) {
    backHandlers.splice(existingIdx, 1);
  }

  backHandlers.push({ id, priority, handler });
  backHandlers.sort((a, b) => b.priority - a.priority);

  return () => {
    popBackHandler(id);
  };
}

/**
 * Unregisters a dismiss handler by its ID.
 */
export function popBackHandler(id: string): void {
  const idx = backHandlers.findIndex((e) => e.id === id);
  if (idx !== -1) {
    backHandlers.splice(idx, 1);
  }
}

/**
 * Triggers the top-most modal dismiss handler.
 * Returns true if a modal was dismissed, false if no modal was active.
 */
export function triggerBackAction(): boolean {
  if (backHandlers.length > 0) {
    const top = backHandlers.shift();
    if (top) {
      try {
        const result = top.handler();
        // If handler explicitly returned false, it refused dismissal
        if (result === false) {
          return false;
        }
        return true;
      } catch (e) {
        console.warn('[BackHandler] Error dismissing modal:', e);
        return true;
      }
    }
  }
  return false;
}

/**
 * React hook to effortlessly wire modal / dialog dismissal into Android back button & Escape key.
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void, priority: number = 10): void {
  useEffect(() => {
    if (!isOpen) return;
    const id = `modal-${Math.random().toString(36).substring(2, 9)}`;
    const unregister = pushBackHandler(id, onClose, priority);
    return unregister;
  }, [isOpen, onClose, priority]);
}
