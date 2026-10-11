import React from 'react';

export type MascotPose = 
  | 'cozy' 
  | 'waving' 
  | 'happy' 
  | 'gentle' 
  | 'listening' 
  | 'sleepy' 
  | 'celebrating'
  | 'flying'
  | 'thinking'
  | 'reading'
  | 'talking';

interface BeeMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  pose?: MascotPose;
  className?: string;
  animate?: boolean;
}

/**
 * Cozy, friendly, modern Bee mascot for BeeYou.
 * Safe, gentle, supportive, and non-clinical.
 */
export const BeeMascot: React.FC<BeeMascotProps> = ({
  size = 'md',
  pose = 'cozy',
  className = '',
  animate = false,
}) => {
  const getDimensions = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 44;
      case 'lg': return 64;
      case 'xl': return 96;
      case '2xl': return 128;
      default: return 44;
    }
  };

  const dim = getDimensions();

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${animate ? 'hover:scale-105 transition-transform duration-300' : ''} ${className}`}
      aria-label="BeeYou Cozy Bee Mascot"
      role="img"
    >
      <defs>
        {/* Soft Honey Golden Gradient */}
        <linearGradient id="beeHoneyBody" x1="20" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBD365" />
          <stop offset="60%" stopColor="#F3B33D" />
          <stop offset="100%" stopColor="#DF9420" />
        </linearGradient>

        {/* Soft Wings Gradient */}
        <linearGradient id="beeWings" x1="30" y1="10" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.7" />
        </linearGradient>

        {/* Gentle Warm Glow */}
        <filter id="cozyGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#D97706" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Back Wing */}
      <ellipse
        cx="74"
        cy="34"
        rx="18"
        ry="25"
        transform="rotate(26 74 34)"
        fill="url(#beeWings)"
        stroke="#CBD5E1"
        strokeWidth="2"
      />

      {/* Front Wing */}
      <ellipse
        cx="52"
        cy="30"
        rx="20"
        ry="27"
        transform="rotate(-18 52 30)"
        fill="url(#beeWings)"
        stroke="#94A3B8"
        strokeWidth="2"
      />

      {/* Main Oval Body with Honey Glow */}
      <g filter="url(#cozyGlow)">
        <ellipse cx="60" cy="68" rx="38" ry="32" fill="url(#beeHoneyBody)" />
      </g>

      {/* Soft Navy Charcoal Stripes (Rounded & Warm) */}
      <path
        d="M50 37.5C54 36.5 66 36.5 70 37.5C72 45 74 57 73 66C72 75 70 87 68 98C64 99.5 56 99.5 52 98C50 87 48 75 47 66C46 57 48 45 50 37.5Z"
        fill="#1E293B"
        opacity="0.88"
      />
      <path
        d="M74 41C77 43 83 47 85 51C89 60 90 73 87 83C85 87 81 90 78 92C80 83 81 72 80 64C79 56 77 48 74 41Z"
        fill="#1E293B"
        opacity="0.88"
      />

      {/* Cozy Stinger (Small, soft rounded bead) */}
      <path
        d="M22 68C22 66 18 67 16 68C18 69 22 70 22 68Z"
        fill="#1E293B"
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Antennas with Cute Round Tips */}
      <path
        d="M78 40C83 33 89 25 93 25"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="94" cy="24" r="4" fill="#D97706" stroke="#1E293B" strokeWidth="2" />

      <path
        d="M68 38C70 29 74 20 78 18"
        stroke="#1E293B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="79" cy="17" r="4" fill="#D97706" stroke="#1E293B" strokeWidth="2" />

      {/* Gentle Friendly Eyes (Vary by Pose) */}
      {pose === 'sleepy' ? (
        <>
          <path d="M78 64C81 67 86 67 89 64" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 64C63 67 68 67 71 64" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : pose === 'happy' || pose === 'celebrating' ? (
        <>
          <path d="M78 63C81 59 86 59 89 63" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 63C63 59 68 59 71 63" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Calm, cozy open eyes */}
          <ellipse cx="82" cy="62" rx="4" ry="5.5" fill="#1E293B" />
          <circle cx="84" cy="60" r="1.5" fill="#FFFFFF" />
          <ellipse cx="64" cy="62" rx="4" ry="5.5" fill="#1E293B" />
          <circle cx="66" cy="60" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Gentle Cozy Smile */}
      <path
        d="M70 73C73 76 77 76 80 73"
        stroke="#1E293B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Soft Rosy Cheeks */}
      <circle cx="89" cy="69" r="4.5" fill="#F472B6" opacity="0.4" />
      <circle cx="58" cy="69" r="4.5" fill="#F472B6" opacity="0.4" />

      {/* Small sparkle for celebrating/happy */}
      {(pose === 'celebrating' || pose === 'happy') && (
        <path
          d="M102 36L104 41L109 43L104 45L102 50L100 45L95 43L100 41L102 36Z"
          fill="#F59E0B"
        />
      )}
    </svg>
  );
};

interface BeeYouLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMascot?: boolean;
  mascotPose?: MascotPose;
  showTagline?: boolean;
  dark?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Official BeeYou Logo:
 * Renders the brand logo artwork (script "BeeYou" wordmark + flying bee) from /logo.png.
 * `showMascot` / `mascotPose` are kept for API compatibility — the bee is part of the artwork.
 */
export const BeeYouLogo: React.FC<BeeYouLogoProps> = ({
  size = 'md',
  showTagline = false,
  dark = false,
  className = '',
  onClick,
}) => {
  const heights: Record<NonNullable<BeeYouLogoProps['size']>, string> = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24 sm:h-28',
  };
  const taglineSize = size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[10px]' : 'text-xs sm:text-sm';

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      <span className={dark ? 'bg-white/95 rounded-2xl px-2.5 py-1 shadow-sm' : ''}>
        <img
          src="/logo.png"
          alt="BeeYou"
          draggable={false}
          className={`${heights[size]} w-auto object-contain`}
        />
      </span>
      {showTagline && (
        <span className={`${taglineSize} font-medium tracking-wide text-slate-500 dark:text-slate-300 mt-1`}>
          You can be yourself here.
        </span>
      )}
    </div>
  );
};
