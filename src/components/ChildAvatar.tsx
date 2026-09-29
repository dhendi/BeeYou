import React from 'react';
import { AvatarConfig } from '../types';

interface ChildAvatarProps {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({
  config,
  size = 'md',
  showDetails = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const isWheelchair = config.mobilityAid === 'wheelchair';
  const hasHeadphones = config.accessory === 'sensory_headphones';
  const hasGlasses = config.accessory === 'glasses';
  const hasHearingAids = config.accessory === 'hearing_aids' || config.accessory === 'cochlear';
  const hasCap = config.accessory === 'cap';
  const hasTablet = config.companionDevice === 'aac_tablet';

  return (
    <div
      className={`relative ${sizeMap[size]} flex items-center justify-center select-none`}
      aria-label="Child avatar"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        {/* Background circle / wheelchair frame */}
        {isWheelchair && (
          <g>
            <circle cx="50" cy="58" r="32" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
            <circle cx="50" cy="58" r="24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="20" y1="58" x2="80" y2="58" stroke="#64748b" strokeWidth="2" />
            <line x1="50" y1="28" x2="50" y2="88" stroke="#64748b" strokeWidth="2" />
            {/* Wheelchair back support */}
            <path d="M 32 30 L 32 60 L 68 60" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* Body / Shirt */}
        <path
          d="M 30 65 Q 50 58 70 65 L 75 92 Q 50 96 25 92 Z"
          fill={config.shirtColor}
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Neck */}
        <rect x="44" y="50" width="12" height="15" rx="3" fill={config.skinTone} />

        {/* Head */}
        <circle
          cx="50"
          cy="42"
          r="23"
          fill={config.skinTone}
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Ears */}
        <circle cx="27" cy="42" r="5" fill={config.skinTone} stroke="#334155" strokeWidth="1.5" />
        <circle cx="73" cy="42" r="5" fill={config.skinTone} stroke="#334155" strokeWidth="1.5" />

        {/* Hearing Aids / Cochlear */}
        {hasHearingAids && (
          <g>
            <path d="M 25 38 Q 23 35 25 33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="26" cy="33" r="2.5" fill="#f59e0b" />
            <path d="M 75 38 Q 77 35 75 33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="74" cy="33" r="2.5" fill="#f59e0b" />
          </g>
        )}

        {/* Hair */}
        {config.hairStyle === 'curly' && (
          <g fill={config.hairColor} stroke="#334155" strokeWidth="1">
            <circle cx="34" cy="24" r="8" />
            <circle cx="45" cy="21" r="8.5" />
            <circle cx="56" cy="21" r="8.5" />
            <circle cx="66" cy="25" r="8" />
            <circle cx="28" cy="32" r="7" />
            <circle cx="72" cy="32" r="7" />
          </g>
        )}
        {config.hairStyle === 'short' && (
          <path
            d="M 28 36 Q 50 16 72 36 Q 66 22 50 22 Q 34 22 28 36 Z"
            fill={config.hairColor}
            stroke="#334155"
            strokeWidth="2"
          />
        )}
        {config.hairStyle === 'pigtails' && (
          <g fill={config.hairColor}>
            <circle cx="22" cy="30" r="9" stroke="#334155" strokeWidth="1.5" />
            <circle cx="78" cy="30" r="9" stroke="#334155" strokeWidth="1.5" />
            <path d="M 30 35 Q 50 20 70 35 Q 50 24 30 35 Z" stroke="#334155" strokeWidth="2" />
          </g>
        )}
        {config.hairStyle === 'spiky' && (
          <path
            d="M 30 35 L 36 22 L 43 28 L 50 18 L 57 28 L 64 22 L 70 35 Q 50 24 30 35 Z"
            fill={config.hairColor}
            stroke="#334155"
            strokeWidth="2"
          />
        )}
        {config.hairStyle === 'braids' && (
          <g fill={config.hairColor} stroke="#334155" strokeWidth="1.5">
            <path d="M 30 35 Q 50 20 70 35 Q 50 24 30 35 Z" />
            <rect x="25" y="38" width="5" height="24" rx="2.5" />
            <rect x="70" y="38" width="5" height="24" rx="2.5" />
          </g>
        )}
        {config.hairStyle === 'wavy' && (
          <path
            d="M 26 40 Q 32 20 50 20 Q 68 20 74 40 Q 65 30 50 30 Q 35 30 26 40 Z"
            fill={config.hairColor}
            stroke="#334155"
            strokeWidth="2"
          />
        )}

        {/* Cap */}
        {hasCap && (
          <g>
            <path d="M 28 32 Q 50 18 72 32 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <ellipse cx="60" cy="32" rx="18" ry="4" fill="#dc2626" />
          </g>
        )}

        {/* Eyes (Gentle, friendly) */}
        <circle cx="42" cy="42" r="3" fill="#1e293b" />
        <circle cx="43" cy="41" r="1" fill="#ffffff" />
        <circle cx="58" cy="42" r="3" fill="#1e293b" />
        <circle cx="59" cy="41" r="1" fill="#ffffff" />

        {/* Eyebrows */}
        <path d="M 38 36 Q 42 34 46 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 54 36 Q 58 34 62 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Glasses */}
        {hasGlasses && (
          <g stroke="#2563eb" strokeWidth="2" fill="rgba(219, 234, 254, 0.4)">
            <circle cx="42" cy="42" r="7" />
            <circle cx="58" cy="42" r="7" />
            <line x1="49" y1="42" x2="51" y2="42" stroke="#2563eb" strokeWidth="2" />
            <line x1="28" y1="41" x2="35" y2="41" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="65" y1="41" x2="72" y2="41" stroke="#2563eb" strokeWidth="1.5" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="36" cy="47" r="3.5" fill="#fca5a5" opacity="0.6" />
        <circle cx="64" cy="47" r="3.5" fill="#fca5a5" opacity="0.6" />

        {/* Smile */}
        <path
          d="M 44 49 Q 50 56 56 49"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Sensory Headphones */}
        {hasHeadphones && (
          <g>
            {/* Headband */}
            <path
              d="M 24 40 A 28 28 0 0 1 76 40"
              fill="none"
              stroke="#0284c7"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Ear Cups */}
            <rect x="20" y="32" width="8" height="18" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <rect x="21" y="35" width="3" height="12" rx="1.5" fill="#38bdf8" />
            <rect x="72" y="32" width="8" height="18" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <rect x="76" y="35" width="3" height="12" rx="1.5" fill="#38bdf8" />
          </g>
        )}

        {/* Tablet in hand */}
        {hasTablet && (
          <g transform="translate(18, 68)">
            <rect x="0" y="0" width="22" height="26" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="2" y="2" width="18" height="22" rx="2" fill="#38bdf8" />
            {/* Mini colorful tiles on tablet */}
            <rect x="4" y="4" width="6" height="5" rx="1" fill="#fde047" />
            <rect x="12" y="4" width="6" height="5" rx="1" fill="#4ade80" />
            <rect x="4" y="11" width="6" height="5" rx="1" fill="#fb923c" />
            <rect x="12" y="11" width="6" height="5" rx="1" fill="#c084fc" />
          </g>
        )}
      </svg>
    </div>
  );
};
