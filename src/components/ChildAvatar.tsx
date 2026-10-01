import React from 'react';
import { AvatarConfig } from '../types';

interface ChildAvatarProps {
  config: AvatarConfig;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showDetails?: boolean;
  className?: string;
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({
  config,
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48 sm:w-56 sm:h-56',
  };

  const isWheelchair = config.mobilityAid === 'wheelchair';
  const hasHeadphones = config.accessory === 'sensory_headphones';
  const hasGlasses = config.accessory === 'glasses';
  const hasSunglasses = config.accessory === 'sunglasses';
  const hasHearingAids = config.accessory === 'hearing_aids';
  const hasCochlear = config.accessory === 'cochlear';
  const hasCap = config.accessory === 'cap';
  const hasBeanie = config.accessory === 'beanie';

  const clothing = config.clothingStyle || 'tshirt';
  const expression = config.expression || 'happy';
  const headphoneColor = config.accessoryColor || '#0284c7';
  const skinTone = config.skinTone || '#fed7aa';
  const hairColor = config.hairColor || '#451a03';
  const shirtColor = config.shirtColor || '#38bdf8';

  return (
    <div
      className={`relative ${sizeMap[size]} flex items-center justify-center select-none ${className}`}
      aria-label="Child avatar"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        <defs>
          {/* Subtle soft gradients for depth */}
          <linearGradient id="skinGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="hairSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ── 0. BACKGROUND FRAME / AURA ── */}
        {config.avatarFrame === 'stars' && (
          <g fill="#facc15">
            <polygon points="12,18 14,22 18,22 15,25 16,29 12,26 8,29 9,25 6,22 10,22" transform="scale(0.8) translate(3, 3)" />
            <polygon points="12,18 14,22 18,22 15,25 16,29 12,26 8,29 9,25 6,22 10,22" transform="scale(0.7) translate(110, 8)" />
            <polygon points="12,18 14,22 18,22 15,25 16,29 12,26 8,29 9,25 6,22 10,22" transform="scale(0.6) translate(10, 110)" />
            <circle cx="86" cy="74" r="2.5" fill="#fde047" />
          </g>
        )}

        {config.avatarFrame === 'bubbles' && (
          <g fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="1">
            <circle cx="15" cy="24" r="6" />
            <circle cx="85" cy="20" r="5" />
            <circle cx="12" cy="74" r="4" />
            <circle cx="88" cy="68" r="7" />
          </g>
        )}

        {config.avatarFrame === 'rainbow' && (
          <g fill="none" strokeWidth="2.5" opacity="0.85">
            <path d="M 12 36 A 44 44 0 0 1 88 36" stroke="#f87171" />
            <path d="M 15 38 A 40 40 0 0 1 85 38" stroke="#fbbf24" />
            <path d="M 18 40 A 36 36 0 0 1 82 40" stroke="#34d399" />
            <path d="M 21 42 A 32 32 0 0 1 79 42" stroke="#60a5fa" />
          </g>
        )}

        {config.avatarFrame === 'space' && (
          <g>
            <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(-20, 50, 50)" />
            <circle cx="86" cy="28" r="3" fill="#facc15" />
            <circle cx="12" cy="65" r="2.5" fill="#38bdf8" />
            <circle cx="84" cy="76" r="2" fill="#c084fc" />
          </g>
        )}

        {/* ── 1. WHEELCHAIR FRAME (Back Layer) ── */}
        {isWheelchair && (
          <g>
            <circle cx="50" cy="66" r="30" fill="#f1f5f9" stroke="#475569" strokeWidth="3" />
            <circle cx="50" cy="66" r="22" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="22" y1="66" x2="78" y2="66" stroke="#64748b" strokeWidth="2" />
            <line x1="50" y1="38" x2="50" y2="94" stroke="#64748b" strokeWidth="2" />
            <path d="M 32 38 L 32 70 L 68 70" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* ── 2. HOODIE BACK / HELMET BACK LAYER ── */}
        {clothing === 'dino_hoodie' && (
          <g>
            <polygon points="50,10 46,18 54,18" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="36,15 33,23 41,23" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="64,15 59,23 67,23" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <circle cx="50" cy="40" r="27" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          </g>
        )}

        {clothing === 'sailor_hoodie' && (
          <g>
            <circle cx="50" cy="40" r="26" fill="#1e3a8a" stroke="#172554" strokeWidth="2.5" />
            <rect x="36" y="14" width="28" height="8" rx="3" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="42" y="16" width="16" height="3" fill="#1e3a8a" />
          </g>
        )}

        {clothing === 'turtle_hoodie' && (
          <g>
            <circle cx="50" cy="40" r="27" fill="#059669" stroke="#064e3b" strokeWidth="2.5" />
            <path d="M 40 16 Q 50 12 60 16 Q 50 19 40 16 Z" fill="#34d399" />
          </g>
        )}

        {clothing === 'frog_hoodie' && (
          <g>
            <circle cx="34" cy="16" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="66" cy="16" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="34" cy="15" r="4" fill="#ffffff" />
            <circle cx="66" cy="15" r="4" fill="#ffffff" />
            <circle cx="35" cy="15" r="2" fill="#14532d" />
            <circle cx="67" cy="15" r="2" fill="#14532d" />
            <circle cx="50" cy="40" r="26" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          </g>
        )}

        {clothing === 'space_suit' && (
          <g>
            <line x1="68" y1="16" x2="74" y2="7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="75" cy="7" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="50" cy="40" r="27" fill="#f8fafc" stroke="#475569" strokeWidth="2.5" />
            <circle cx="50" cy="40" r="23" fill="none" stroke="#38bdf8" strokeWidth="2" />
          </g>
        )}

        {clothing === 'hoodie' && (
          <circle cx="50" cy="40" r="26" fill={shirtColor} stroke="#334155" strokeWidth="2.5" />
        )}

        {/* ── 3. NATURAL HUMAN SHOULDERS & BODY ── */}
        {/* Torso & Shoulders */}
        <path
          d="M 24 96 C 24 74, 34 65, 50 65 C 66 65, 76 74, 76 96 Z"
          fill={shirtColor}
          stroke="#1e293b"
          strokeWidth="2.5"
        />

        {/* Collar / Neckline depth */}
        <path
          d="M 42 66 C 45 71, 55 71, 58 66 Z"
          fill="#0f172a"
          opacity="0.18"
        />

        {/* Overalls */}
        {clothing === 'overalls' && (
          <g>
            <path d="M 33 72 L 67 72 L 70 96 L 30 96 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="33" y="66" width="7" height="24" rx="2" fill="#1d4ed8" />
            <rect x="60" y="66" width="7" height="24" rx="2" fill="#1d4ed8" />
            <circle cx="36.5" cy="74" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="63.5" cy="74" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* Sailor Scarf & Anchor */}
        {clothing === 'sailor_hoodie' && (
          <g>
            <path d="M 32 67 L 68 67 L 58 79 L 42 79 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
            <line x1="38" y1="73" x2="62" y2="73" stroke="#1e3a8a" strokeWidth="1.5" />
            <circle cx="50" cy="84" r="2" fill="none" stroke="#facc15" strokeWidth="1.5" />
            <line x1="50" y1="85" x2="50" y2="91" stroke="#facc15" strokeWidth="1.5" />
            <path d="M 46 89 Q 50 92 54 89" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* Dino Hoodie Teeth */}
        {clothing === 'dino_hoodie' && (
          <g fill="#ffffff">
            <polygon points="43,62 45,66 47,62" />
            <polygon points="49,62 51,66 53,62" />
            <polygon points="55,62 57,66 59,62" />
            <line x1="42" y1="66" x2="42" y2="76" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="66" x2="58" y2="76" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Space Suit Control Chest Box */}
        {clothing === 'space_suit' && (
          <g>
            <rect x="42" y="73" width="16" height="12" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <circle cx="46" cy="77" r="1.5" fill="#38bdf8" />
            <circle cx="50" cy="77" r="1.5" fill="#4ade80" />
            <circle cx="54" cy="77" r="1.5" fill="#f87171" />
            <rect x="45" y="81" width="10" height="2" fill="#64748b" />
          </g>
        )}

        {/* Casual Hoodie Drawstrings */}
        {clothing === 'hoodie' && (
          <g stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round">
            <line x1="44" y1="65" x2="44" y2="76" />
            <line x1="56" y1="65" x2="56" y2="76" />
            <circle cx="44" cy="76" r="1" fill="#94a3b8" />
            <circle cx="56" cy="76" r="1" fill="#94a3b8" />
          </g>
        )}

        {/* ── 4. NECK & HEAD (Human Proportions) ── */}
        {/* Human Neck */}
        <path
          d="M 43 48 L 43 66 C 47 69, 53 69, 57 66 L 57 48 Z"
          fill={skinTone}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Shadow under chin */}
        <path
          d="M 43 49 C 47 55, 53 55, 57 49 Z"
          fill="#000000"
          opacity="0.14"
        />

        {/* Human Head: Soft contoured jawline & rounded chin */}
        <path
          d="M 30 36 C 30 18, 70 18, 70 36 C 70 48, 64 58, 50 59 C 36 58, 30 48, 30 36 Z"
          fill={skinTone}
          stroke="#1e293b"
          strokeWidth="2.2"
        />

        {/* Human Ears with Inner Helix */}
        <g>
          {/* Left Ear */}
          <path d="M 30 33 C 25 33, 25 43, 30 43 Z" fill={skinTone} stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 28 36 C 26 36, 26 40, 28 40" fill="none" stroke="#000000" opacity="0.2" strokeWidth="1.2" />

          {/* Right Ear */}
          <path d="M 70 33 C 75 33, 75 43, 70 43 Z" fill={skinTone} stroke="#1e293b" strokeWidth="1.8" />
          <path d="M 72 36 C 74 36, 74 40, 72 40" fill="none" stroke="#000000" opacity="0.2" strokeWidth="1.2" />
        </g>

        {/* Hearing Aids */}
        {hasHearingAids && (
          <g>
            <path d="M 25 34 C 23 30, 26 27, 28 27" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="27" r="2.5" fill="#f59e0b" />
            <path d="M 75 34 C 77 30, 74 27, 72 27" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="72" cy="27" r="2.5" fill="#f59e0b" />
          </g>
        )}

        {/* Cochlear Implants */}
        {hasCochlear && (
          <g>
            <circle cx="74" cy="26" r="4.5" fill="#334155" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="74" cy="26" r="2" fill="#38bdf8" />
            <path d="M 74 30 Q 76 34 73 37" fill="none" stroke="#334155" strokeWidth="1.5" />
          </g>
        )}

        {/* ── 5. NATURAL HUMAN HAIR STYLES ── */}
        {/* Short Styled Crop */}
        {config.hairStyle === 'short' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.8">
            <path d="M 28 34 C 27 16, 73 16, 72 34 C 70 24, 62 20, 50 20 C 38 20, 30 24, 28 34 Z" />
            {/* Front layered bangs */}
            <path d="M 30 30 C 35 24, 46 25, 48 29 C 50 25, 62 24, 69 31 C 66 22, 54 19, 30 30 Z" />
            {/* Sideburns */}
            <path d="M 29 32 L 29 39 L 32 36 Z" />
            <path d="M 71 32 L 71 39 L 68 36 Z" />
          </g>
        )}

        {/* Voluminous Curls */}
        {config.hairStyle === 'curly' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.5">
            <circle cx="34" cy="22" r="7.5" />
            <circle cx="45" cy="18" r="8" />
            <circle cx="56" cy="18" r="8" />
            <circle cx="66" cy="22" r="7.5" />
            <circle cx="27" cy="29" r="6.5" />
            <circle cx="73" cy="29" r="6.5" />
            <circle cx="28" cy="37" r="5.5" />
            <circle cx="72" cy="37" r="5.5" />
            {/* Forehead curl bangs */}
            <path d="M 34 26 C 38 21, 46 22, 48 27 C 52 22, 60 23, 65 27 C 58 20, 42 20, 34 26 Z" />
          </g>
        )}

        {/* Afro Puffs */}
        {config.hairStyle === 'afro' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.5">
            {/* Left Puff */}
            <circle cx="28" cy="20" r="11" />
            <circle cx="24" cy="24" r="8" />
            {/* Right Puff */}
            <circle cx="72" cy="20" r="11" />
            <circle cx="76" cy="24" r="8" />
            {/* Cute Gold Ribbon ties */}
            <rect x="33" y="24" width="3.5" height="5" rx="1.5" fill="#f59e0b" stroke="none" />
            <rect x="63.5" y="24" width="3.5" height="5" rx="1.5" fill="#f59e0b" stroke="none" />
            {/* Head contour hair */}
            <path d="M 30 33 C 30 18, 70 18, 70 33 C 65 24, 35 24, 30 33 Z" />
          </g>
        )}

        {/* Twin Pigtails with Ribbons */}
        {config.hairStyle === 'pigtails' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.8">
            {/* Left Tail */}
            <path d="M 28 28 C 16 26, 14 42, 23 46 C 26 42, 27 34, 28 28 Z" />
            {/* Right Tail */}
            <path d="M 72 28 C 84 26, 86 42, 77 46 C 74 42, 73 34, 72 28 Z" />
            {/* Cute Red Ribbon Ties */}
            <circle cx="27" cy="29" r="3" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
            <circle cx="73" cy="29" r="3" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
            {/* Hair Crown & Bangs */}
            <path d="M 29 33 C 28 17, 72 17, 71 33 C 65 25, 35 25, 29 33 Z" />
            <path d="M 32 30 C 40 25, 47 26, 50 30 C 53 26, 60 25, 68 30 C 60 22, 40 22, 32 30 Z" />
          </g>
        )}

        {/* High Swept Ponytail */}
        {config.hairStyle === 'ponytail' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.8">
            {/* High flowing ponytail */}
            <path d="M 66 22 C 84 14, 88 34, 78 40 C 74 34, 70 28, 66 22 Z" />
            <circle cx="67" cy="23" r="3" fill="#ec4899" stroke="#be185d" strokeWidth="1" />
            {/* Crown & Front Bangs */}
            <path d="M 29 34 C 28 17, 72 17, 71 34 C 65 24, 35 24, 29 34 Z" />
            <path d="M 31 31 C 38 25, 48 26, 52 30 C 56 26, 64 25, 69 31 C 60 22, 40 22, 31 31 Z" />
          </g>
        )}

        {/* Stylish Bob Cut */}
        {config.hairStyle === 'bob' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.8">
            <path d="M 27 34 C 26 16, 74 16, 73 34 L 75 48 C 73 53, 67 50, 67 44 L 67 34 C 50 26, 33 34, 33 44 C 33 50, 27 53, 25 48 Z" />
            <path d="M 32 29 C 40 25, 50 25, 53 28 C 56 25, 63 25, 68 29 C 60 22, 40 22, 32 29 Z" />
          </g>
        )}

        {/* Braids with Gold Beads */}
        {config.hairStyle === 'braids' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.6">
            <path d="M 29 33 C 28 17, 72 17, 71 33 C 65 24, 35 24, 29 33 Z" />
            {/* Hanging Braids */}
            <rect x="25" y="34" width="4.5" height="26" rx="2.2" />
            <rect x="70.5" y="34" width="4.5" height="26" rx="2.2" />
            {/* Golden Beads */}
            <circle cx="27.2" cy="58" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="72.8" cy="58" r="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* Soft Wavy Hair */}
        {config.hairStyle === 'wavy' && (
          <g fill={hairColor} stroke="#1e293b" strokeWidth="1.8">
            <path d="M 26 36 C 26 16, 74 16, 74 36 C 76 46, 71 54, 68 56 C 66 50, 68 42, 67 36 C 50 28, 33 36, 32 42 C 34 50, 32 56, 29 56 C 26 54, 24 46, 26 36 Z" />
            <path d="M 30 30 C 40 24, 60 24, 70 30 C 60 22, 40 22, 30 30 Z" />
          </g>
        )}

        {/* Spiky Anime Hair */}
        {config.hairStyle === 'spiky' && (
          <path
            d="M 28 34 L 34 20 L 41 26 L 50 15 L 59 26 L 66 20 L 72 34 C 65 26, 35 26, 28 34 Z"
            fill={hairColor}
            stroke="#1e293b"
            strokeWidth="1.8"
          />
        )}

        {/* Buzz Cut */}
        {config.hairStyle === 'buzz' && (
          <path
            d="M 29 33 C 28 18, 72 18, 71 33 Z"
            fill={hairColor}
            opacity="0.85"
          />
        )}

        {/* ── 6. HATS & CAPS ── */}
        {hasCap && (
          <g>
            <path d="M 28 30 C 28 16, 72 16, 72 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <ellipse cx="60" cy="30" rx="18" ry="4.5" fill="#dc2626" />
          </g>
        )}

        {hasBeanie && (
          <g>
            <path d="M 27 32 C 27 12, 73 12, 73 32 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
            <rect x="25" y="30" width="50" height="6" rx="2" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
            <circle cx="50" cy="12" r="4.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* ── 7. EXPRESSIVE HUMAN EYES & SMILE ── */}
        {/* Eyebrows matching hair color with expressive arch */}
        <g stroke={hairColor} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M 37 32 C 40 30, 44 31, 46 33" />
          <path d="M 54 33 C 56 31, 60 30, 63 32" />
        </g>

        {/* Eyes based on expression */}
        {expression === 'happy' && (
          <g>
            {/* Left Eye: Big, friendly, expressive human eye with catchlights */}
            <ellipse cx="42" cy="39" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="43.2" cy="37.5" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="41" r="0.8" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="58" cy="39" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="59.2" cy="37.5" r="1.5" fill="#ffffff" />
            <circle cx="57" cy="41" r="0.8" fill="#ffffff" />

            {/* Joyful Open Smile with Teeth & Tongue */}
            <path d="M 43 47 C 43 55, 57 55, 57 47 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
            <path d="M 44.5 47.5 C 47 49, 53 49, 55.5 47.5" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
            <path d="M 46 51 C 48 53.5, 52 53.5, 54 51 Z" fill="#fda4af" />
          </g>
        )}

        {expression === 'smile' && (
          <g>
            <ellipse cx="42" cy="39" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="43.2" cy="37.5" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="41" r="0.8" fill="#ffffff" />

            <ellipse cx="58" cy="39" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="59.2" cy="37.5" r="1.5" fill="#ffffff" />
            <circle cx="57" cy="41" r="0.8" fill="#ffffff" />

            {/* Gentle Warm Closed Smile */}
            <path d="M 44 48 C 47 52, 53 52, 56 48" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {expression === 'excited' && (
          <g>
            {/* Star Catchlights in Eyes */}
            <polygon points="42,35 43,38 46,38 44,40 45,43 42,41 39,43 40,40 38,38 41,38" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <polygon points="58,35 59,38 62,38 60,40 61,43 58,41 55,43 56,40 54,38 57,38" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Big Cheerful Laughing Mouth */}
            <path d="M 42 46 C 42 56, 58 56, 58 46 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
            <path d="M 44 46.5 C 47 48, 53 48, 56 46.5" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
            <path d="M 46 51 C 48 54, 52 54, 54 51 Z" fill="#fda4af" />
          </g>
        )}

        {expression === 'calm' && (
          <g>
            {/* Peaceful Happy Curved Eyes */}
            <path d="M 39 39 C 41 36, 45 36, 47 39" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 53 39 C 55 36, 59 36, 61 39" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 45 48 C 47 51, 53 51, 55 48" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {expression === 'wink' && (
          <g>
            {/* Open Left Eye */}
            <ellipse cx="42" cy="39" rx="3.8" ry="4.5" fill="#1e293b" />
            <circle cx="43.2" cy="37.5" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="41" r="0.8" fill="#ffffff" />
            {/* Winking Right Eye */}
            <path d="M 54 39 C 56 36, 60 36, 62 39" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 43 47 C 43 54, 57 54, 57 47 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
          </g>
        )}

        {/* Stylized Cute Button Nose */}
        <path d="M 49 42 C 50 44, 51 44, 51.5 42" stroke="#000000" opacity="0.25" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Soft Glowing Rosy Cheeks */}
        <circle cx="35" cy="44" r="3.8" fill="#f87171" opacity="0.4" />
        <circle cx="65" cy="44" r="3.8" fill="#f87171" opacity="0.4" />

        {/* ── 8. GLASSES & SUNGLASSES ── */}
        {hasGlasses && (
          <g stroke="#2563eb" strokeWidth="2" fill="rgba(219, 234, 254, 0.35)">
            <rect x="34" y="34" width="14" height="11" rx="4" />
            <rect x="52" y="34" width="14" height="11" rx="4" />
            <line x1="48" y1="39" x2="52" y2="39" stroke="#2563eb" strokeWidth="2" />
            <line x1="28" y1="38" x2="34" y2="38" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="66" y1="38" x2="72" y2="38" stroke="#2563eb" strokeWidth="1.5" />
          </g>
        )}

        {hasSunglasses && (
          <g fill="#0f172a" stroke="#020617" strokeWidth="1.5">
            <rect x="33" y="34" width="15" height="12" rx="3.5" />
            <rect x="52" y="34" width="15" height="12" rx="3.5" />
            <line x1="48" y1="38" x2="52" y2="38" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="36" y1="37" x2="40" y2="43" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <line x1="55" y1="37" x2="59" y2="43" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
          </g>
        )}

        {/* ── 9. ERGONOMIC SENSORY HEADPHONES ── */}
        {hasHeadphones && (
          <g>
            {/* Padded Headband Resting over Hair */}
            <path
              d="M 26 36 C 25 15, 75 15, 74 36"
              fill="none"
              stroke={headphoneColor}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Cushioned Ear Cups Wrapping Around Ears */}
            <rect x="22" y="29" width="7" height="17" rx="3.5" fill={headphoneColor} stroke="#0369a1" strokeWidth="1.5" />
            <rect x="24" y="32" width="2.5" height="11" rx="1.2" fill="#bae6fd" />
            <rect x="71" y="29" width="7" height="17" rx="3.5" fill={headphoneColor} stroke="#0369a1" strokeWidth="1.5" />
            <rect x="73.5" y="32" width="2.5" height="11" rx="1.2" fill="#bae6fd" />
          </g>
        )}

        {/* ── 10. COMPANIONS IN HAND ── */}
        {config.companionDevice === 'aac_tablet' && (
          <g transform="translate(16, 66)">
            <rect x="0" y="0" width="24" height="28" rx="3.5" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="2" y="2" width="20" height="24" rx="2.5" fill="#38bdf8" />
            <rect x="4" y="4" width="7" height="6" rx="1.5" fill="#fde047" />
            <rect x="13" y="4" width="7" height="6" rx="1.5" fill="#4ade80" />
            <rect x="4" y="12" width="7" height="6" rx="1.5" fill="#fb923c" />
            <rect x="13" y="12" width="7" height="6" rx="1.5" fill="#c084fc" />
          </g>
        )}

        {config.companionDevice === 'comfort_plush' && (
          <g transform="translate(14, 66)">
            <circle cx="10" cy="14" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="12" cy="7" r="5" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="14" cy="6" r="1" fill="#1e293b" />
            <polygon points="10,2 8,5 11,5" fill="#facc15" />
            <ellipse cx="6" cy="18" rx="3" ry="5" fill="#16a34a" />
          </g>
        )}

        {config.companionDevice === 'squishy_fidget' && (
          <g transform="translate(18, 68)">
            <circle cx="10" cy="10" r="10" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="3" fill="#facc15" />
            <circle cx="14" cy="6" r="3" fill="#4ade80" />
            <circle cx="6" cy="14" r="3" fill="#38bdf8" />
            <circle cx="14" cy="14" r="3" fill="#c084fc" />
          </g>
        )}

        {config.companionDevice === 'star_wand' && (
          <g transform="translate(18, 64)">
            <line x1="2" y1="26" x2="14" y2="6" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
            <polygon points="14,2 16,5 19,5 17,7 18,10 14,8 11,10 12,7 9,5 13,5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* ── 11. MOBILITY AIDS (Foreground: Walker, Cane, Service Dog) ── */}
        {config.mobilityAid === 'stroller_walker' && (
          <g stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 22 62 L 22 96 M 78 62 L 78 96" />
            <path d="M 18 62 L 82 62" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="22" cy="96" r="3.5" fill="#334155" stroke="none" />
            <circle cx="78" cy="96" r="3.5" fill="#334155" stroke="none" />
          </g>
        )}

        {config.mobilityAid === 'cane' && (
          <path d="M 76 56 L 82 94 M 76 56 Q 78 48 84 50" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        )}

        {config.mobilityAid === 'service_dog' && (
          <g transform="translate(62, 58) scale(0.4)">
            <ellipse cx="40" cy="45" rx="20" ry="16" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <circle cx="55" cy="30" r="14" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <ellipse cx="62" cy="32" rx="4" ry="7" fill="#b45309" />
            <path d="M 28 35 Q 40 30 52 35 L 50 50 Q 38 52 26 48 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <text x="32" y="44" fontSize="7" fontWeight="bold" fill="#ffffff">AID</text>
            <circle cx="62" cy="27" r="2" fill="#1e293b" />
            <circle cx="68" cy="32" r="2.5" fill="#1e293b" />
            <rect x="25" y="55" width="6" height="15" rx="3" fill="#f59e0b" />
            <rect x="45" y="55" width="6" height="15" rx="3" fill="#f59e0b" />
          </g>
        )}
      </svg>
    </div>
  );
};
