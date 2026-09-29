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

  return (
    <div
      className={`relative ${sizeMap[size]} flex items-center justify-center select-none ${className}`}
      aria-label="Child avatar"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        {/* ── 0. BACKGROUND AURA / FRAME ── */}
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

        {/* ── 1. MOBILITY AID: WHEELCHAIR FRAME (Behind body) ── */}
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

        {/* ── 2. THEMED HOODIE BACK / ASTRONAUT HELMET BACK ── */}
        {clothing === 'dino_hoodie' && (
          <g>
            {/* Dino Golden Spikes on Hood Rim */}
            <polygon points="50,12 46,20 54,20" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="36,17 33,24 41,24" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="64,17 59,24 67,24" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            {/* Green Dino Hood Back Volume */}
            <circle cx="50" cy="42" r="28" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          </g>
        )}

        {clothing === 'sailor_hoodie' && (
          <g>
            {/* Navy Sailor Hood Volume */}
            <circle cx="50" cy="42" r="27" fill="#1e3a8a" stroke="#172554" strokeWidth="2.5" />
            {/* White sailor cap top */}
            <rect x="36" y="14" width="28" height="8" rx="3" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="42" y="16" width="16" height="3" fill="#1e3a8a" />
          </g>
        )}

        {clothing === 'turtle_hoodie' && (
          <g>
            {/* Emerald Shell Hood */}
            <circle cx="50" cy="42" r="28" fill="#059669" stroke="#064e3b" strokeWidth="2.5" />
            {/* Shell Scutes on top */}
            <path d="M 40 18 Q 50 14 60 18 Q 50 21 40 18 Z" fill="#34d399" />
          </g>
        )}

        {clothing === 'frog_hoodie' && (
          <g>
            {/* Frog Bulbous Eyes on Top */}
            <circle cx="34" cy="18" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="66" cy="18" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="34" cy="17" r="4.5" fill="#ffffff" />
            <circle cx="66" cy="17" r="4.5" fill="#ffffff" />
            <circle cx="35" cy="17" r="2" fill="#14532d" />
            <circle cx="67" cy="17" r="2" fill="#14532d" />
            {/* Frog Hood Volume */}
            <circle cx="50" cy="42" r="27" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          </g>
        )}

        {clothing === 'space_suit' && (
          <g>
            {/* Astronaut Comms Antenna */}
            <line x1="68" y1="18" x2="74" y2="8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <circle cx="75" cy="8" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            {/* White Helmet Base */}
            <circle cx="50" cy="42" r="28" fill="#f8fafc" stroke="#475569" strokeWidth="2.5" />
            {/* Cyan Visor Rim Ring */}
            <circle cx="50" cy="42" r="24" fill="none" stroke="#38bdf8" strokeWidth="2" />
          </g>
        )}

        {clothing === 'hoodie' && (
          <g>
            {/* Classic Hoodie Back */}
            <circle cx="50" cy="42" r="27" fill={config.shirtColor} stroke="#334155" strokeWidth="2.5" />
          </g>
        )}

        {/* ── 3. BODY / SHIRT ── */}
        <path
          d="M 30 65 Q 50 58 70 65 L 75 92 Q 50 96 25 92 Z"
          fill={config.shirtColor}
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Overalls Straps & Brass Buttons */}
        {clothing === 'overalls' && (
          <g>
            {/* Denim Overalls Center */}
            <path d="M 36 67 L 64 67 L 66 94 L 34 94 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
            {/* Straps */}
            <rect x="34" y="65" width="7" height="22" fill="#1d4ed8" />
            <rect x="59" y="65" width="7" height="22" fill="#1d4ed8" />
            {/* Buttons */}
            <circle cx="37.5" cy="74" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="62.5" cy="74" r="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* Sailor Collar & Anchor */}
        {clothing === 'sailor_hoodie' && (
          <g>
            {/* White sailor flap */}
            <path d="M 32 66 L 68 66 L 58 78 L 42 78 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
            <line x1="38" y1="72" x2="62" y2="72" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* Golden anchor on chest */}
            <circle cx="50" cy="83" r="2" fill="none" stroke="#facc15" strokeWidth="1.5" />
            <line x1="50" y1="84" x2="50" y2="90" stroke="#facc15" strokeWidth="1.5" />
            <path d="M 46 88 Q 50 91 54 88" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* Dino Hoodie Teeth along Neckline & Yellow Drawstrings */}
        {clothing === 'dino_hoodie' && (
          <g>
            <polygon points="44,60 46,64 48,60" fill="#ffffff" />
            <polygon points="52,60 54,64 56,60" fill="#ffffff" />
            {/* Yellow drawstrings */}
            <line x1="42" y1="64" x2="42" y2="74" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="64" x2="58" y2="74" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Astronaut Chest Controls */}
        {clothing === 'space_suit' && (
          <g>
            <rect x="42" y="72" width="16" height="12" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <circle cx="46" cy="76" r="1.5" fill="#38bdf8" />
            <circle cx="50" cy="76" r="1.5" fill="#4ade80" />
            <circle cx="54" cy="76" r="1.5" fill="#f87171" />
            <rect x="45" y="80" width="10" height="2" fill="#64748b" />
          </g>
        )}

        {/* Casual Hoodie Drawstrings */}
        {clothing === 'hoodie' && (
          <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
            <line x1="44" y1="64" x2="44" y2="75" />
            <line x1="56" y1="64" x2="56" y2="75" />
          </g>
        )}

        {/* ── 4. NECK & HEAD ── */}
        <rect x="44" y="50" width="12" height="15" rx="3" fill={config.skinTone} />

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

        {/* Hearing Aids */}
        {hasHearingAids && (
          <g>
            <path d="M 25 38 Q 23 35 25 33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="26" cy="33" r="2.5" fill="#f59e0b" />
            <path d="M 75 38 Q 77 35 75 33" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="74" cy="33" r="2.5" fill="#f59e0b" />
          </g>
        )}

        {/* Cochlear Implants */}
        {hasCochlear && (
          <g>
            <circle cx="76" cy="28" r="4.5" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="76" cy="28" r="2" fill="#38bdf8" />
            <path d="M 76 32 Q 78 37 75 40" fill="none" stroke="#475569" strokeWidth="1.5" />
          </g>
        )}

        {/* ── 5. HAIR STYLES ── */}
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
            <circle cx="21" cy="30" r="9" stroke="#334155" strokeWidth="1.5" />
            <circle cx="79" cy="30" r="9" stroke="#334155" strokeWidth="1.5" />
            {/* Cute pink hair ties */}
            <circle cx="27" cy="34" r="3" fill="#f43f5e" />
            <circle cx="73" cy="34" r="3" fill="#f43f5e" />
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
            {/* Hair bands at bottom */}
            <circle cx="27.5" cy="60" r="2.5" fill="#facc15" stroke="none" />
            <circle cx="72.5" cy="60" r="2.5" fill="#facc15" stroke="none" />
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

        {config.hairStyle === 'afro' && (
          <g fill={config.hairColor} stroke="#334155" strokeWidth="1.5">
            <circle cx="33" cy="22" r="10" />
            <circle cx="50" cy="18" r="11" />
            <circle cx="67" cy="22" r="10" />
            <circle cx="26" cy="32" r="9" />
            <circle cx="74" cy="32" r="9" />
          </g>
        )}

        {config.hairStyle === 'bob' && (
          <g fill={config.hairColor} stroke="#334155" strokeWidth="2">
            <path d="M 26 36 Q 50 18 74 36 L 75 48 Q 72 52 68 46 L 68 36 Q 50 30 32 36 L 32 46 Q 28 52 25 48 Z" />
          </g>
        )}

        {config.hairStyle === 'ponytail' && (
          <g fill={config.hairColor}>
            <path d="M 28 36 Q 50 18 72 36 Q 50 24 28 36 Z" stroke="#334155" strokeWidth="2" />
            {/* High side curved ponytail */}
            <path d="M 68 28 Q 85 20 82 38 Q 75 42 70 32 Z" stroke="#334155" strokeWidth="2" />
            <circle cx="69" cy="30" r="3" fill="#f43f5e" />
          </g>
        )}

        {config.hairStyle === 'buzz' && (
          <path
            d="M 28 35 Q 50 23 72 35 Z"
            fill={config.hairColor}
            opacity="0.9"
          />
        )}

        {/* ── 6. CAP & BEANIE ── */}
        {hasCap && (
          <g>
            <path d="M 28 32 Q 50 18 72 32 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <ellipse cx="60" cy="32" rx="18" ry="4" fill="#dc2626" />
          </g>
        )}

        {hasBeanie && (
          <g>
            <path d="M 27 34 Q 50 14 73 34 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
            <rect x="25" y="32" width="50" height="6" rx="2" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
            <circle cx="50" cy="14" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* ── 7. EYES & EXPRESSIONS ── */}
        {expression === 'happy' && (
          <g>
            <circle cx="42" cy="42" r="3" fill="#1e293b" />
            <circle cx="43" cy="41" r="1" fill="#ffffff" />
            <circle cx="58" cy="42" r="3" fill="#1e293b" />
            <circle cx="59" cy="41" r="1" fill="#ffffff" />
            <path d="M 38 36 Q 42 34 46 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 54 36 Q 58 34 62 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 44 49 Q 50 56 56 49" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {expression === 'smile' && (
          <g>
            <circle cx="42" cy="42" r="3" fill="#1e293b" />
            <circle cx="43" cy="41" r="1" fill="#ffffff" />
            <circle cx="58" cy="42" r="3" fill="#1e293b" />
            <circle cx="59" cy="41" r="1" fill="#ffffff" />
            <path d="M 38 36 Q 42 35 46 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 54 36 Q 58 35 62 36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 45 50 Q 50 54 55 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {expression === 'excited' && (
          <g>
            {/* Golden Star Eyes (★ ★) */}
            <polygon points="42,38 43,41 46,41 44,43 45,46 42,44 39,46 40,43 38,41 41,41" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <polygon points="58,38 59,41 62,41 60,43 61,46 58,44 55,46 56,43 54,41 57,41" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <path d="M 38 34 Q 42 32 46 34" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 54 34 Q 58 32 62 34" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Laughing happy cheering mouth */}
            <path d="M 43 48 Q 50 58 57 48 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />
            <path d="M 46 53 Q 50 56 54 53" fill="#fda4af" />
          </g>
        )}

        {expression === 'calm' && (
          <g>
            {/* Peaceful curved eyes (^_^) */}
            <path d="M 39 42 Q 42 39 45 42" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 55 42 Q 58 39 61 42" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 38 35 Q 42 34 46 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 54 35 Q 58 34 62 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 45 50 Q 50 53 55 50" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {expression === 'wink' && (
          <g>
            {/* Left open eye, right wink */}
            <circle cx="42" cy="42" r="3" fill="#1e293b" />
            <circle cx="43" cy="41" r="1" fill="#ffffff" />
            <path d="M 55 42 Q 58 39 61 42" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 38 35 Q 42 33 46 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 54 35 Q 58 33 62 35" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 44 49 Q 50 56 56 49" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="36" cy="47" r="3.5" fill="#fca5a5" opacity="0.65" />
        <circle cx="64" cy="47" r="3.5" fill="#fca5a5" opacity="0.65" />

        {/* ── 8. GLASSES & SUNGLASSES ── */}
        {hasGlasses && (
          <g stroke="#2563eb" strokeWidth="2" fill="rgba(219, 234, 254, 0.4)">
            <circle cx="42" cy="42" r="7" />
            <circle cx="58" cy="42" r="7" />
            <line x1="49" y1="42" x2="51" y2="42" stroke="#2563eb" strokeWidth="2" />
            <line x1="28" y1="41" x2="35" y2="41" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="65" y1="41" x2="72" y2="41" stroke="#2563eb" strokeWidth="1.5" />
          </g>
        )}

        {hasSunglasses && (
          <g fill="#0f172a" stroke="#020617" strokeWidth="1.5">
            <rect x="34" y="36" width="15" height="12" rx="3" />
            <rect x="51" y="36" width="15" height="12" rx="3" />
            <line x1="48" y1="40" x2="52" y2="40" stroke="#0f172a" strokeWidth="2.5" />
            {/* White glare lines */}
            <line x1="36" y1="39" x2="40" y2="45" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <line x1="53" y1="39" x2="57" y2="45" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
          </g>
        )}

        {/* ── 9. SENSORY HEADPHONES ── */}
        {hasHeadphones && (
          <g>
            {/* Headband */}
            <path
              d="M 24 40 A 28 28 0 0 1 76 40"
              fill="none"
              stroke={headphoneColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Ear Cups */}
            <rect x="20" y="32" width="8" height="18" rx="4" fill={headphoneColor} stroke="#0369a1" strokeWidth="1.5" />
            <rect x="21" y="35" width="3" height="12" rx="1.5" fill="#bae6fd" />
            <rect x="72" y="32" width="8" height="18" rx="4" fill={headphoneColor} stroke="#0369a1" strokeWidth="1.5" />
            <rect x="76" y="35" width="3" height="12" rx="1.5" fill="#bae6fd" />
          </g>
        )}

        {/* ── 10. COMPANION ITEM IN HAND ── */}
        {config.companionDevice === 'aac_tablet' && (
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

        {config.companionDevice === 'comfort_plush' && (
          <g transform="translate(14, 68)">
            {/* Cute plush dinosaur */}
            <circle cx="10" cy="14" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="12" cy="7" r="5" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="14" cy="6" r="1" fill="#1e293b" />
            <polygon points="10,2 8,5 11,5" fill="#facc15" />
            <ellipse cx="6" cy="18" rx="3" ry="5" fill="#16a34a" />
          </g>
        )}

        {config.companionDevice === 'squishy_fidget' && (
          <g transform="translate(18, 70)">
            {/* Pop-it circular fidget */}
            <circle cx="10" cy="10" r="10" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="3" fill="#facc15" />
            <circle cx="14" cy="6" r="3" fill="#4ade80" />
            <circle cx="6" cy="14" r="3" fill="#38bdf8" />
            <circle cx="14" cy="14" r="3" fill="#c084fc" />
          </g>
        )}

        {config.companionDevice === 'star_wand' && (
          <g transform="translate(18, 66)">
            {/* Wand shaft */}
            <line x1="2" y1="26" x2="14" y2="6" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
            {/* Star head */}
            <polygon points="14,2 16,5 19,5 17,7 18,10 14,8 11,10 12,7 9,5 13,5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          </g>
        )}

        {/* ── 11. MOBILITY AIDS (Foreground components: Walker, Cane, Service Dog) ── */}
        {config.mobilityAid === 'stroller_walker' && (
          <g stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 24 62 L 24 94 M 76 62 L 76 94" />
            <path d="M 20 62 L 80 62" stroke="#38bdf8" strokeWidth="4" />
            <circle cx="24" cy="95" r="3" fill="#334155" stroke="none" />
            <circle cx="76" cy="95" r="3" fill="#334155" stroke="none" />
          </g>
        )}

        {config.mobilityAid === 'cane' && (
          <path d="M 76 56 L 82 92 M 76 56 Q 78 50 82 52" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        )}

        {config.mobilityAid === 'service_dog' && (
          <g transform="translate(62, 60) scale(0.38)">
            {/* Golden service dog */}
            <ellipse cx="40" cy="45" rx="20" ry="16" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <circle cx="55" cy="30" r="14" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <ellipse cx="62" cy="32" rx="4" ry="7" fill="#b45309" />
            {/* Red service vest */}
            <path d="M 28 35 Q 40 30 52 35 L 50 50 Q 38 52 26 48 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
            <text x="32" y="44" fontSize="7" fontWeight="bold" fill="#ffffff">AID</text>
            {/* Eye and nose */}
            <circle cx="62" cy="27" r="2" fill="#1e293b" />
            <circle cx="68" cy="32" r="2.5" fill="#1e293b" />
            {/* Legs */}
            <rect x="25" y="55" width="6" height="15" rx="3" fill="#f59e0b" />
            <rect x="45" y="55" width="6" height="15" rx="3" fill="#f59e0b" />
          </g>
        )}
      </svg>
    </div>
  );
};
