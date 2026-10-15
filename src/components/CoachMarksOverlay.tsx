import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ArrowRight, ArrowLeft, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { playChime } from '../utils/audio';

export interface CoachMarkStep {
  targetSelector: string;
  title: string;
  instruction: string;
  mascotHint?: string;
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  actionHint?: string;
}

interface CoachMarksOverlayProps {
  isActive: boolean;
  steps: CoachMarkStep[];
  onComplete: () => void;
  onSkip: () => void;
  tourName?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const CoachMarksOverlay: React.FC<CoachMarksOverlayProps> = ({
  isActive,
  steps,
  onComplete,
  onSkip,
  tourName = 'BeeYou Live Guide',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number; arrowDir: 'up' | 'down' | 'none' }>({
    top: 16,
    left: 16,
    arrowDir: 'up',
  });
  const [hasClickedTarget, setHasClickedTarget] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const currentStep = steps[currentStepIndex];

  // Update target rect calculation with safe viewport bounds and smart placement
  const updateTargetRect = useCallback(() => {
    if (!isActive || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cardWidth = Math.min(360, windowWidth - 24);

    // Measure actual rendered wrapper height if available
    const wrapperEl = wrapperRef.current;
    const measuredHeight = wrapperEl ? wrapperEl.offsetHeight : 340;
    const arrowHeight = 40; // Arrow circle + spacing
    const totalHeightNeeded = measuredHeight + arrowHeight;

    if (el) {
      const rect = el.getBoundingClientRect();
      const padding = 6;
      const targetBox: Rect = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: Math.min(windowWidth, rect.width + padding * 2),
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: Math.min(windowWidth, rect.right + padding),
      };
      setTargetRect(targetBox);

      // Center horizontally relative to target, clamped securely inside screen bounds
      let left = targetBox.left + (targetBox.width / 2) - (cardWidth / 2);
      left = Math.max(12, Math.min(left, windowWidth - cardWidth - 12));

      // Calculate vertical space above and below the target
      const spaceBelow = windowHeight - targetBox.bottom;
      const spaceAbove = targetBox.top;

      let top = 16;
      let arrowDir: 'up' | 'down' | 'none' = 'none';

      // 1. If ample space below target: place below, arrow points UP
      if (spaceBelow >= totalHeightNeeded + 20) {
        top = targetBox.bottom + 12;
        arrowDir = 'up';
      }
      // 2. If ample space above target: place above, arrow points DOWN
      else if (spaceAbove >= totalHeightNeeded + 20) {
        top = targetBox.top - measuredHeight - arrowHeight - 12;
        arrowDir = 'down';
      }
      // 3. Constrained viewport (e.g. mobile or centered element): pick side with most space
      else if (spaceBelow >= spaceAbove) {
        const canFitArrow = spaceBelow >= measuredHeight + arrowHeight + 16;
        arrowDir = canFitArrow ? 'up' : 'none';
        top = targetBox.bottom + 8;
        top = Math.min(top, windowHeight - measuredHeight - (arrowDir === 'up' ? arrowHeight : 0) - 16);
        top = Math.max(12, top);
      } else {
        const canFitArrow = spaceAbove >= measuredHeight + arrowHeight + 16;
        arrowDir = canFitArrow ? 'down' : 'none';
        top = targetBox.top - measuredHeight - (arrowDir === 'down' ? arrowHeight + 8 : 8);
        top = Math.max(12, top);
        top = Math.min(top, windowHeight - measuredHeight - 16);
      }

      // Hard clamp top so card NEVER falls off-screen
      const effectiveCardTotalHeight = measuredHeight + (arrowDir !== 'none' ? arrowHeight : 0);
      top = Math.max(12, Math.min(top, windowHeight - effectiveCardTotalHeight - 16));

      // If card ends up overlapping target, hide arrow to avoid visual clutter
      if (top < targetBox.bottom && top + effectiveCardTotalHeight > targetBox.top) {
        arrowDir = 'none';
      }

      setCardPosition({ top, left, arrowDir });
    } else {
      // Graceful centered fallback if target is not currently in DOM
      setTargetRect(null);
      setCardPosition({
        top: Math.max(16, (windowHeight - measuredHeight) / 2),
        left: Math.max(12, (windowWidth - cardWidth) / 2),
        arrowDir: 'none',
      });
    }
  }, [isActive, currentStep]);

  // Observe card resize to re-clamp accurately if content changes height
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      updateTargetRect();
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [updateTargetRect, currentStepIndex]);

  // Smoothly scroll target into view smartly once when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    setHasClickedTarget(false);

    const scrollToElement = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const neededHeight = 360;

        const spaceBelowNow = windowHeight - rect.bottom;
        const spaceAboveNow = rect.top;

        // If already visible with ample space above or below, avoid scrolling
        if (rect.top >= 20 && rect.bottom <= windowHeight - 20 && (spaceBelowNow >= neededHeight || spaceAboveNow >= neededHeight)) {
          updateTargetRect();
          return;
        }

        // Align element to maximize remaining space for the coach mark card
        const isLowerHalf = rect.top > windowHeight / 2;
        try {
          el.scrollIntoView({
            behavior: 'smooth',
            block: isLowerHalf ? 'end' : 'start',
            inline: 'nearest',
          });
        } catch {
          el.scrollIntoView();
        }
      }
      updateTargetRect();
    };

    scrollToElement();

    // Staggered retries in case tab is animating or re-rendering
    const t1 = setTimeout(scrollToElement, 120);
    const t2 = setTimeout(scrollToElement, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, currentStepIndex, currentStep, updateTargetRect]);

  // Throttled scroll and resize listeners using requestAnimationFrame
  useEffect(() => {
    if (!isActive) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    const handleThrottledUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        updateTargetRect();
        rafRef.current = null;
      });
    };

    window.addEventListener('resize', handleThrottledUpdate, { passive: true });
    window.addEventListener('scroll', handleThrottledUpdate, { passive: true, capture: true });

    return () => {
      window.removeEventListener('resize', handleThrottledUpdate);
      window.removeEventListener('scroll', handleThrottledUpdate, { capture: true });
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, updateTargetRect]);

  const handleNext = () => {
    playChime('tap');
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      playChime('star');
      onComplete();
    }
  };

  const handlePrev = () => {
    playChime('tap');
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    // If user clicks directly on the spotlighted area
    playChime('star');
    setHasClickedTarget(true);

    // Auto-advance after brief visual confirmation
    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, 450);
  };

  if (!isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden animate-in fade-in duration-200 select-none">
      {/* 1. DARK SPOTLIGHT BACKDROP WITH TRANSPARENT CUTOUT */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ width: '100vw', height: '100vh' }}
        onClick={(e) => {
          // If clicking background outside target, prevent closing accidentally
          e.stopPropagation();
        }}
      >
        <defs>
          <mask id="coachmark-mask">
            {/* White background = fully opaque backdrop */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = transparent hole for the spotlighted element */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="20"
                ry="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask="url(#coachmark-mask)"
        />
      </svg>

      {/* 2. SPOTLIGHT GLOWING RING OVER TARGET */}
      {targetRect && (
        <div
          onClick={handleTargetClick}
          style={{
            position: 'absolute',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          className={`rounded-2xl border-4 border-amber-400 ring-4 ring-amber-300/80 shadow-[0_0_35px_rgba(245,158,11,0.9)] cursor-pointer transition-all ${
            hasClickedTarget ? 'scale-105 bg-amber-400/20 ring-8' : 'animate-pulse hover:scale-[1.02]'
          }`}
          title="Click here to interact and proceed!"
        >
          {/* Pulsing Target Click Badge */}
          <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
            <span>👇 Click here</span>
          </div>
        </div>
      )}

      {/* 3. FLOATING INSTRUCTION CARD & POINTER ARROW */}
      <div
        ref={wrapperRef}
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          width: Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 24 : 336),
          maxHeight: `calc(100dvh - ${Math.max(12, cardPosition.top)}px - 16px)`,
        }}
        className="z-[10000] flex flex-col items-center animate-in zoom-in-95 duration-200"
      >
        {/* Animated Arrow pointing UP towards target */}
        {cardPosition.arrowDir === 'up' && (
          <div className="flex flex-col items-center mb-1 shrink-0 animate-bounce">
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white text-amber-950 flex items-center justify-center shadow-lg">
              <ArrowUp className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        )}

        {/* Coach Mark Card Content */}
        <div className="w-full max-h-full flex flex-col bg-white dark:bg-slate-900 border-3 border-amber-400 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Header with Mascot & Step Counter (Pinned shrink-0) */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg shadow-xs shrink-0 font-black">
                🐝
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {tourName} • Step {currentStepIndex + 1} of {steps.length}
                </span>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onSkip();
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              title="Close Tutorial"
              aria-label="Close tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Instruction (Scrollable body if viewport is constrained) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 min-h-0 bg-white dark:bg-slate-900">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentStep.instruction}
            </p>

            {/* Mascot Tip / Speech Bubble */}
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
              <span className="text-base shrink-0">👉</span>
              <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                {currentStep.mascotHint || 'Click the highlighted button on screen or tap Next!'}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Back, Next, Skip (Pinned shrink-0 Footer) */}
          <div className="shrink-0 flex items-center justify-between p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90">
            <div className="flex items-center gap-1.5">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  onSkip();
                }}
                className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Skip
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish Guide' : 'Next Step 👉'}</span>
              {currentStepIndex === steps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Animated Arrow pointing DOWN towards target */}
        {cardPosition.arrowDir === 'down' && (
          <div className="flex flex-col items-center mt-1 shrink-0 animate-bounce">
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white text-amber-950 flex items-center justify-center shadow-lg">
              <ArrowDown className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
