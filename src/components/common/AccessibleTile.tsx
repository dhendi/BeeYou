import React from 'react';
import { useTouchScrollGuard } from '../../utils/touchScrollGuard';

export type AccessibleTileVariant = 'aac' | 'routine' | 'emergency' | 'action' | 'custom';

export interface AccessibleTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AccessibleTileVariant;
  label: string;
  speechText?: string;
  completed?: boolean;
  category?: string; // Optional grammatical or domain category (e.g. 'Noun', 'Verb', 'Social')
  children?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  minTouchTarget?: 'standard' | 'tablet';
  ariaLabel?: string;
}

/**
 * AccessibleTile: Semantic, high-contrast, touch-optimized tile primitive
 * satisfying Apple App Store Accessibility Nutrition Label standards (VoiceOver,
 * Dynamic Type, Voice Control, WCAG AA, and Reduced Motion).
 */
export const AccessibleTile = React.forwardRef<HTMLButtonElement, AccessibleTileProps>(
  (
    {
      variant = 'custom',
      label,
      speechText,
      completed,
      category,
      children,
      icon,
      badge,
      active,
      minTouchTarget = 'tablet',
      className = '',
      ariaLabel,
      'aria-label': propAriaLabel,
      disabled,
      onClick,
      ...rest
    },
    ref
  ) => {
    // 1. Enforce explicit Apple VoiceOver & TalkBack aria-label logic
    let computedAriaLabel = propAriaLabel || ariaLabel;
    if (!computedAriaLabel) {
      if (variant === 'aac') {
        const spoken = speechText || label;
        const categorySuffix = category ? ` [${category}]` : '';
        computedAriaLabel = `Speak phrase: ${spoken}${categorySuffix}`;
      } else if (variant === 'routine') {
        computedAriaLabel = `Routine task: ${label}.${completed ? 'Completed' : 'Not completed'}`;
      } else if (variant === 'emergency') {
        computedAriaLabel = `Emergency alert: ${label}`;
      } else {
        computedAriaLabel = label;
      }
    }

    // 2. Minimum touch targets (48x48px on standard, 56x56px on tablet)
    const touchTargetClass =
      minTouchTarget === 'tablet'
        ? 'min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px]'
        : 'min-w-[48px] min-h-[48px]';

    const scrollGuard = useTouchScrollGuard(onClick);

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={scrollGuard.onClick}
        onTouchStart={(e) => {
          scrollGuard.onTouchStart(e);
          rest.onTouchStart?.(e);
        }}
        onTouchMove={(e) => {
          scrollGuard.onTouchMove(e);
          rest.onTouchMove?.(e);
        }}
        onTouchEnd={(e) => {
          scrollGuard.onTouchEnd();
          rest.onTouchEnd?.(e);
        }}
        aria-label={computedAriaLabel}
        aria-pressed={variant === 'routine' ? completed : active}
        className={`${touchTargetClass} touch-manipulation relative flex items-center justify-center font-bold text-center select-none cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...rest}
      >
        {children ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center p-2 w-full h-full gap-1">
            {icon && (
              <span aria-hidden="true" className="shrink-0 pointer-events-none">
                {icon}
              </span>
            )}
            <span className="text-xs sm:text-sm font-black truncate max-w-full leading-tight">
              {label}
            </span>
            {category && (
              <span
                aria-hidden="true"
                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/10 text-slate-700 pointer-events-none"
              >
                {category}
              </span>
            )}
          </div>
        )}
        {badge}
      </button>
    );
  }
);

AccessibleTile.displayName = 'AccessibleTile';
