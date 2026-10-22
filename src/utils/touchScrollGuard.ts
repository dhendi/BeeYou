import React, { useRef, useCallback, useEffect } from 'react';

/**
 * Global Touch Scroll Guard
 * 
 * Prevents accidental button clicks, tile speech, and modal openings
 * when the user is scrolling or dragging across elements on mobile/touch screens.
 * 
 * Standard mobile touch slop is 8px. Any movement exceeding 8px is classified
 * as a scroll gesture. Synthetic clicks emitted by mobile WebViews within 280ms
 * of a scroll gesture or scroll event are suppressed.
 */

let globalLastScrollTime = 0;
let globalTouchStart: { x: number; y: number } | null = null;
let globalIsScrolling = false;
let globalResetTimer: ReturnType<typeof setTimeout> | null = null;
let isInitialized = false;

// Registry for callbacks that cancel pending long-press timers when a scroll begins
const scrollCancelCallbacks = new Set<() => void>();

export function registerScrollCancel(cb: () => void): () => void {
  scrollCancelCallbacks.add(cb);
  return () => {
    scrollCancelCallbacks.delete(cb);
  };
}

function notifyScrollStarted() {
  scrollCancelCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore callback errors
    }
  });
}

export function isGlobalScrollActive(): boolean {
  return globalIsScrolling || (Date.now() - globalLastScrollTime < 280);
}

export function markScrollActivity() {
  globalIsScrolling = true;
  globalLastScrollTime = Date.now();
  notifyScrollStarted();
}

/**
 * Initializes window-level touch and scroll capture listeners once.
 */
export function initGlobalTouchScrollGuard() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  // 1. Track touch start location globally
  window.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        globalTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      globalIsScrolling = false;
      if (globalResetTimer) {
        clearTimeout(globalResetTimer);
        globalResetTimer = null;
      }
    },
    { capture: true, passive: true }
  );

  // 2. Detect touch drag exceeding 8px slop threshold
  window.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (globalTouchStart && e.touches && e.touches[0]) {
        const dx = Math.abs(e.touches[0].clientX - globalTouchStart.x);
        const dy = Math.abs(e.touches[0].clientY - globalTouchStart.y);
        if (dx > 8 || dy > 8) {
          globalIsScrolling = true;
          globalLastScrollTime = Date.now();
          notifyScrollStarted();
        }
      }
    },
    { capture: true, passive: true }
  );

  // 3. Handle touch end / cancel
  const handleTouchEnd = () => {
    if (globalIsScrolling) {
      globalLastScrollTime = Date.now();
      // Keep globalIsScrolling true briefly so any synthetic click right at touchend is caught
      globalResetTimer = setTimeout(() => {
        globalIsScrolling = false;
        globalResetTimer = null;
      }, 80);
    }
    globalTouchStart = null;
  };

  window.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { capture: true, passive: true });

  // 4. Capture any scroll events on window or scrollable containers
  window.addEventListener(
    'scroll',
    () => {
      globalLastScrollTime = Date.now();
      notifyScrollStarted();
    },
    { capture: true, passive: true }
  );

  // 5. Intercept synthetic click events in capture phase if user was scrolling
  window.addEventListener(
    'click',
    (e: MouseEvent) => {
      if (isGlobalScrollActive()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    },
    { capture: true }
  );
}

// Auto-initialize when running in browser
if (typeof window !== 'undefined') {
  initGlobalTouchScrollGuard();
}

/**
 * Hook for components that need localized touch-scroll guarding
 * and long-press cancellation.
 */
export function useTouchScrollGuard<T extends HTMLElement = HTMLElement>(
  onClick?: (e: React.MouseEvent<T>) => void,
  onLongPressCancel?: () => void
) {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // Register long-press cancel callback with global scroll coordinator
  useEffect(() => {
    if (!onLongPressCancel) return;
    return registerScrollCancel(onLongPressCancel);
  }, [onLongPressCancel]);

  const onTouchStart = useCallback((e: React.TouchEvent<T>) => {
    if (e.touches && e.touches[0]) {
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    isScrollRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<T>) => {
    if (startPosRef.current && e.touches && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - startPosRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - startPosRef.current.y);
      if (dx > 8 || dy > 8) {
        isScrollRef.current = true;
        lastScrollTimeRef.current = Date.now();
        markScrollActivity();
        onLongPressCancel?.();
      }
    }
  }, [onLongPressCancel]);

  const onTouchEnd = useCallback(() => {
    if (isScrollRef.current) {
      lastScrollTimeRef.current = Date.now();
    }
    startPosRef.current = null;
    onLongPressCancel?.();
  }, [onLongPressCancel]);

  const handleClick = useCallback((e: React.MouseEvent<T>) => {
    if (
      isScrollRef.current ||
      Date.now() - lastScrollTimeRef.current < 280 ||
      isGlobalScrollActive()
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  }, [onClick]);

  const shouldBlockClick = useCallback(() => {
    return (
      isScrollRef.current ||
      Date.now() - lastScrollTimeRef.current < 280 ||
      isGlobalScrollActive()
    );
  }, []);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onClick: handleClick,
    shouldBlockClick,
    isScrollGesture: isScrollRef,
  };
}
