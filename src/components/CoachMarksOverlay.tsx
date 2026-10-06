import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
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
    top: 0,
    left: 0,
    arrowDir: 'up',
  });
  const [hasClickedTarget, setHasClickedTarget] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Update target rect calculation without triggering scrolling
  const updateTargetRect = useCallback(() => {
    if (!isActive || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      const padding = 8;
      const targetBox: Rect = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding,
      };
      setTargetRect(targetBox);

      // Compute smart card placement
      const cardWidth = Math.min(360, window.innerWidth - 32);
      const cardHeight = 220;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Center horizontally relative to target, clamped to screen
      let left = targetBox.left + targetBox.width / 2 - cardWidth / 2;
      left = Math.max(16, Math.min(left, windowWidth - cardWidth - 16));

      // Prefer placing below if space allows, otherwise place above
      const spaceBelow = windowHeight - targetBox.bottom;
      const spaceAbove = targetBox.top;

      let top = 0;
      let arrowDir: 'up' | 'down' = 'up';

      if (spaceBelow >= cardHeight + 20) {
        // Place below target, arrow points UP
        top = targetBox.bottom + 16;
        arrowDir = 'up';
      } else if (spaceAbove >= cardHeight + 20) {
        // Place above target, arrow points DOWN
        top = Math.max(16, targetBox.top - cardHeight - 16);
        arrowDir = 'down';
      } else {
        // Overlay inside available center space
        top = Math.max(16, Math.min(targetBox.bottom + 10, windowHeight - cardHeight - 20));
        arrowDir = spaceBelow > spaceAbove ? 'up' : 'down';
      }

      setCardPosition({ top, left, arrowDir });
    } else {
      // Fallback if target element not found in DOM
      setTargetRect(null);
      setCardPosition({
        top: window.innerHeight / 2 - 100,
        left: Math.max(16, window.innerWidth / 2 - 180),
        arrowDir: 'none',
      });
    }
  }, [isActive, currentStep]);

  const rafRef = useRef<number | null>(null);

  // Smoothly scroll target into view ONLY once when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    setHasClickedTarget(false);

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (el) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } catch {
        // Fallback for older browsers
        el.scrollIntoView();
      }
    }

    // Initial position measurement after DOM settles
    const timeoutId = setTimeout(() => {
      updateTargetRect();
    }, 100);

    return () => clearTimeout(timeoutId);
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
        style={{
          position: 'absolute',
          top: cardPosition.top,
          left: cardPosition.left,
          width: Math.min(360, window.innerWidth - 32),
        }}
        className="z-[10000] flex flex-col items-center animate-in zoom-in-95 duration-200"
      >
        {/* Animated Arrow pointing UP towards target */}
        {cardPosition.arrowDir === 'up' && (
          <div className="flex flex-col items-center mb-1 animate-bounce">
            <div className="w-9 h-9 rounded-full bg-amber-400 border-2 border-white text-amber-950 flex items-center justify-center shadow-lg">
              <ArrowUp className="w-5 h-5 stroke-[3]" />
            </div>
          </div>
        )}

        {/* Coach Mark Card Content */}
        <div className="w-full bg-white dark:bg-slate-900 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-2xl relative space-y-3">
          {/* Header with Mascot & Step Counter */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-xs shrink-0 font-black">
                🐝
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {tourName} • Step {currentStepIndex + 1} of {steps.length}
                </span>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
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
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Instruction */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentStep.instruction}
            </p>

            {/* Mascot Tip / Speech Bubble */}
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
              <span className="text-lg shrink-0">👉</span>
              <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                {currentStep.mascotHint || 'Click the highlighted button on screen or tap Next!'}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Back, Next, Skip */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition active:scale-95"
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
                className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                Skip
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish Guide 🎉' : 'Next Step 👉'}</span>
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
          <div className="flex flex-col items-center mt-1 animate-bounce">
            <div className="w-9 h-9 rounded-full bg-amber-400 border-2 border-white text-amber-950 flex items-center justify-center shadow-lg">
              <ArrowDown className="w-5 h-5 stroke-[3]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
