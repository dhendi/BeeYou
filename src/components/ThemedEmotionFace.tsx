/**
 * ThemedEmotionFace — Character in Themed Hoodie & Themed Background Badge
 *
 * User specification:
 * "Instead of them being anatomically something, they should just wear a hat
 *  or a hoodie of the theme and a background of the theme as well."
 *
 * Architecture:
 * 1. ThemedBackgroundBadge: Circular/squircle scene with thematic landscape/elements
 *    - Dinosaur: Prehistoric sunset, lush Jurassic ferns & warm sky
 *    - Turtle: Serene turquoise water, bubbles, sea kelp & gentle ocean floor
 *    - Frog: Sunny lily pad pond, lotus petal & gentle water ripples
 *    - Ocean: Deep sea blue, rolling waves, marine bubbles & starfish
 *    - Space: Galaxy starfield, crescent moon, nebula & telemetry
 *    - Train: Locomotive railway, wooden crossties & puffing steam clouds
 *    - Classic / Others: Soft glowing multi-tone gradient badge with sparkle burst
 *
 * 2. Character in Themed Hoodie / Hat:
 *    - Dinosaur: Leafy green hoodie with dorsal crest spikes, baby dino teeth framing the face!
 *    - Turtle: Emerald hoodie with hex shell pattern & flipper drawstrings
 *    - Frog: Bright frog hoodie with iconic bulbous top frog-eyes & pale throat lining
 *    - Ocean: Marine sailor hood with navy stripes, anchor emblem & wave collar
 *    - Space: Astronaut spacesuit helmet/hood with side comms & cyan LED
 *    - Train: Tailored conductor cap with gold train wheel badge & uniform collar
 *    - Classic: Cozy stylish hoodie with tailored drawstrings
 *
 * 3. 11 Vivid, Empathetic Emotional Expressions:
 *    - happy, calm, excited, tired, worried, sad, angry, frustrated, overwhelmed, scared, confused
 */

import React from 'react';
import { AppTheme } from '../data/themesData';

export type EmotionId =
  | 'happy'
  | 'calm'
  | 'excited'
  | 'tired'
  | 'worried'
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'overwhelmed'
  | 'scared'
  | 'confused';

interface ThemedEmotionFaceProps {
  emotionId: EmotionId | string;
  theme?: AppTheme | null;
  /** CSS size class e.g. "w-16 h-16" */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. THEMED BACKGROUND BADGES (72x72 viewport)
// ─────────────────────────────────────────────────────────────────────────────
const ThemedBackgroundBadge: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          <defs>
            <linearGradient id="bgDino" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
          {/* Badge boundary circle */}
          <circle cx="36" cy="36" r="33" fill="url(#bgDino)" stroke="#16a34a" strokeWidth="2.5" />
          {/* Jurassic fern fronds in background */}
          <path d="M 6 42 Q 16 32 20 20 Q 22 28 14 42 Z" fill="#15803d" opacity="0.35" />
          <path d="M 66 42 Q 56 32 52 20 Q 50 28 58 42 Z" fill="#15803d" opacity="0.35" />
          {/* Distant prehistoric sun glow */}
          <circle cx="36" cy="18" r="10" fill="#fde047" opacity="0.45" />
          {/* Tiny footprint watermark */}
          <ellipse cx="20" cy="54" rx="2.5" ry="3.5" fill="#ca8a04" opacity="0.25" />
          <ellipse cx="52" cy="54" rx="2.5" ry="3.5" fill="#ca8a04" opacity="0.25" />
        </g>
      );

    case 'turtle':
      return (
        <g>
          <defs>
            <linearGradient id="bgTurtle" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ccfbf1" />
              <stop offset="60%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgTurtle)" stroke="#0f766e" strokeWidth="2.5" />
          {/* Serene ocean water caustics */}
          <path d="M 12 18 Q 24 14 36 18 Q 48 22 60 18" stroke="#ffffff" strokeWidth="1.8" opacity="0.55" fill="none" strokeLinecap="round" />
          <path d="M 10 26 Q 22 22 36 26 Q 50 30 62 26" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" fill="none" strokeLinecap="round" />
          {/* Swaying kelp fronds */}
          <path d="M 14 62 Q 10 46 16 36 Q 14 48 18 62 Z" fill="#047857" opacity="0.35" />
          <path d="M 58 62 Q 62 46 56 36 Q 58 48 54 62 Z" fill="#047857" opacity="0.35" />
          {/* Tiny rising bubbles */}
          <circle cx="20" cy="24" r="2" fill="#ffffff" opacity="0.6" />
          <circle cx="54" cy="20" r="2.5" fill="#ffffff" opacity="0.6" />
          <circle cx="50" cy="12" r="1.5" fill="#ffffff" opacity="0.5" />
        </g>
      );

    case 'frog':
      return (
        <g>
          <defs>
            <linearGradient id="bgFrog" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#dcfce7" />
              <stop offset="60%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgFrog)" stroke="#15803d" strokeWidth="2.5" />
          {/* Gentle water ripples */}
          <ellipse cx="36" cy="56" rx="26" ry="7" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="36" cy="56" rx="18" ry="4.5" fill="none" stroke="#22c55e" strokeWidth="1.2" opacity="0.3" />
          {/* Floating pink water lotus petals */}
          <circle cx="16" cy="22" r="3" fill="#f472b6" opacity="0.4" />
          <circle cx="56" cy="22" r="3" fill="#f472b6" opacity="0.4" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          <defs>
            <linearGradient id="bgOcean" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgOcean)" stroke="#0369a1" strokeWidth="2.5" />
          {/* Rolling sea waves in backdrop */}
          <path d="M 6 52 Q 18 44 30 50 Q 42 56 54 48 Q 62 44 66 50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none" />
          {/* Marine bubbles & tiny starfish */}
          <circle cx="16" cy="20" r="2.2" fill="#ffffff" opacity="0.6" />
          <circle cx="56" cy="18" r="2.8" fill="#ffffff" opacity="0.6" />
          <circle cx="52" cy="28" r="1.5" fill="#ffffff" opacity="0.5" />
          <polygon points="18,60 19,62 21,62 19.5,63 20,65 18,64 16,65 16.5,63 15,62 17,62" fill="#fb923c" opacity="0.6" />
        </g>
      );

    case 'space':
      return (
        <g>
          <defs>
            <radialGradient id="bgSpace" cx="36" cy="30" r="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="70%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgSpace)" stroke="#6366f1" strokeWidth="2.5" />
          {/* Twinkling star field */}
          <circle cx="16" cy="18" r="1.2" fill="#ffffff" />
          <circle cx="22" cy="12" r="1.8" fill="#fde047" />
          <circle cx="50" cy="14" r="1.2" fill="#ffffff" />
          <circle cx="56" cy="22" r="1.8" fill="#fde047" />
          <circle cx="14" cy="50" r="1" fill="#ffffff" />
          <circle cx="58" cy="52" r="1" fill="#ffffff" />
          {/* Golden 4-point star burst */}
          <polygon points="36,6 37,9 40,9 38,11 39,14 36,12 33,14 34,11 32,9 35,9" fill="#facc15" opacity="0.7" />
          {/* Faint distant ringed planet */}
          <ellipse cx="20" cy="28" rx="4" ry="4" fill="#a855f7" opacity="0.5" />
          <ellipse cx="20" cy="28" rx="7" ry="1.8" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.5" transform="rotate(-20 20 28)" />
        </g>
      );

    case 'train':
      return (
        <g>
          <defs>
            <linearGradient id="bgTrain" x1="0" y1="0" x2="0" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="60%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgTrain)" stroke="#c2410c" strokeWidth="2.5" />
          {/* Train track ties at bottom */}
          <line x1="12" y1="62" x2="60" y2="62" stroke="#78350f" strokeWidth="3" opacity="0.5" />
          <line x1="18" y1="58" x2="18" y2="66" stroke="#78350f" strokeWidth="2" opacity="0.5" />
          <line x1="28" y1="58" x2="28" y2="66" stroke="#78350f" strokeWidth="2" opacity="0.5" />
          <line x1="44" y1="58" x2="44" y2="66" stroke="#78350f" strokeWidth="2" opacity="0.5" />
          <line x1="54" y1="58" x2="54" y2="66" stroke="#78350f" strokeWidth="2" opacity="0.5" />
          {/* Puffing locomotive steam clouds */}
          <circle cx="18" cy="18" r="5" fill="#ffffff" opacity="0.45" />
          <circle cx="24" cy="14" r="6" fill="#ffffff" opacity="0.4" />
          <circle cx="52" cy="16" r="5.5" fill="#ffffff" opacity="0.45" />
        </g>
      );

    default:
      return (
        <g>
          <defs>
            <radialGradient id="bgClassic" cx="36" cy="24" r="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          <circle cx="36" cy="36" r="33" fill="url(#bgClassic)" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="16" cy="20" r="1.5" fill="#ffffff" opacity="0.7" />
          <circle cx="56" cy="20" r="1.5" fill="#ffffff" opacity="0.7" />
        </g>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. THEMED HOODIE / HAT LAYERS
// ─────────────────────────────────────────────────────────────────────────────

/** Hood back layer (renders behind the character's face) */
const ThemedHoodieBack: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          {/* Dorsal crest spikes on top of the dino hood */}
          <g fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round">
            <polygon points="26,14 30,5 34,14" />
            <polygon points="34,12 39,2 44,12" />
            <polygon points="44,14 48,6 52,15" />
          </g>
          {/* Outer green dino hood volume */}
          <path
            d="M 16 38 C 14 20, 58 20, 56 38 C 56 54, 16 54, 16 38 Z"
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="3"
          />
        </g>
      );

    case 'turtle':
      return (
        <g>
          {/* Outer turtle shell hood volume */}
          <circle cx="36" cy="38" r="23" fill="#047857" stroke="#065f46" strokeWidth="3" />
          {/* Hexagonal shell scute pattern lines */}
          <path
            d="M 36 16 L 44 21 L 44 31 L 36 36 L 28 31 L 28 21 Z"
            fill="none"
            stroke="#34d399"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>
      );

    case 'frog':
      return (
        <g>
          {/* Two prominent frog eye domes on top of the hood */}
          <circle cx="23" cy="18" r="10" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          <circle cx="49" cy="18" r="10" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          <circle cx="23" cy="18" r="5" fill="#ffffff" />
          <circle cx="23" cy="18" r="2.5" fill="#14532d" />
          <circle cx="49" cy="18" r="5" fill="#ffffff" />
          <circle cx="49" cy="18" r="2.5" fill="#14532d" />
          {/* Outer frog hood volume */}
          <circle cx="36" cy="38" r="22" fill="#22c55e" stroke="#15803d" strokeWidth="3" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          {/* Sailor cap crown on top of hood */}
          <path d="M 24 16 Q 36 8 48 16 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          <circle cx="36" cy="38" r="22" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
        </g>
      );

    case 'space':
      return (
        <g>
          {/* Comms antenna on top right */}
          <line x1="50" y1="16" x2="58" y2="7" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="59" cy="6" r="2.5" fill="#a855f7" />
          {/* Outer astronaut helmet shell */}
          <circle cx="36" cy="38" r="24" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
          {/* Comms ear pods */}
          <rect x="9" y="30" width="5" height="14" rx="2.5" fill="#6366f1" />
          <rect x="58" y="30" width="5" height="14" rx="2.5" fill="#6366f1" />
        </g>
      );

    case 'train':
      return (
        <g>
          {/* Conductor cap crown */}
          <rect x="22" y="10" width="28" height="12" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <circle cx="36" cy="38" r="22" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
        </g>
      );

    default:
      return (
        <g>
          {/* Classic cozy hoodie back */}
          <circle cx="36" cy="38" r="22" fill="#ea580c" stroke="#c2410c" strokeWidth="3" />
        </g>
      );
  }
};

/** Hood front layer (rim framing the face, dino teeth, drawstrings, shoulders) */
const ThemedHoodieFront: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          {/* Baby Dino white teeth lining the top rim of the hood */}
          <polygon points="25,23 27,28 29,23" fill="#ffffff" stroke="#15803d" strokeWidth="0.8" />
          <polygon points="31,22 33,27 35,22" fill="#ffffff" stroke="#15803d" strokeWidth="0.8" />
          <polygon points="37,22 39,27 41,22" fill="#ffffff" stroke="#15803d" strokeWidth="0.8" />
          <polygon points="43,23 45,28 47,23" fill="#ffffff" stroke="#15803d" strokeWidth="0.8" />

          {/* Pale inner lining framing the face */}
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#4ade80" strokeWidth="3" />

          {/* Hoodie shoulders & collar at bottom */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#16a34a" stroke="#15803d" strokeWidth="2.5" />
          {/* Yellow hoodie drawstrings */}
          <path d="M 28 53 L 27 63" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="27" cy="63.5" r="1.8" fill="#facc15" />
          <path d="M 44 53 L 45 63" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="45" cy="63.5" r="1.8" fill="#facc15" />
        </g>
      );

    case 'turtle':
      return (
        <g>
          {/* Inner mint hood rim */}
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#6ee7b7" strokeWidth="3" />
          {/* Turtle shell collar */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#047857" stroke="#065f46" strokeWidth="2.5" />
          <path d="M 28 53 L 27 63" stroke="#a7f3d0" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="27" cy="63.5" r="2" fill="#34d399" />
          <path d="M 44 53 L 45 63" stroke="#a7f3d0" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="45" cy="63.5" r="2" fill="#34d399" />
        </g>
      );

    case 'frog':
      return (
        <g>
          {/* Inner mint frog lining */}
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#86efac" strokeWidth="3" />
          {/* Pale throat collar */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
          <ellipse cx="36" cy="58" rx="8" ry="4" fill="#dcfce7" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          {/* Sailor cap brim */}
          <ellipse cx="36" cy="20" rx="18" ry="3.5" fill="#ffffff" stroke="#0369a1" strokeWidth="1.8" />
          {/* Embroidered gold anchor on cap */}
          <circle cx="36" cy="14" r="1.5" fill="#facc15" />
          <line x1="36" y1="14" x2="36" y2="19" stroke="#facc15" strokeWidth="1.2" />
          <path d="M 33 17 Q 36 19 39 17" stroke="#facc15" strokeWidth="1.2" fill="none" />
          {/* Inner hood rim */}
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#7dd3fc" strokeWidth="3" />
          {/* Sailor neckerchief collar */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
          <polygon points="36,54 32,64 36,61 40,64" fill="#ffffff" />
        </g>
      );

    case 'space':
      return (
        <g>
          {/* Helmet reflective curved glass rim */}
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#6366f1" strokeWidth="3" />
          <path d="M 23 28 Q 36 21 49 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none" />
          {/* Spacesuit collar at bottom */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
          <circle cx="36" cy="56" r="2.5" fill="#38bdf8" />
        </g>
      );

    case 'train':
      return (
        <g>
          {/* Conductor cap brim */}
          <path d="M 18 22 Q 36 17 54 22 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
          {/* Golden locomotive badge */}
          <circle cx="36" cy="16" r="3.5" fill="#facc15" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#f97316" strokeWidth="3" />
          {/* Uniform jacket collar */}
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
          {/* Whistle */}
          <rect x="34" y="54" width="4" height="7" rx="1.5" fill="#facc15" />
        </g>
      );

    default:
      return (
        <g>
          <ellipse cx="36" cy="39" rx="17.5" ry="17.5" fill="none" stroke="#fdba74" strokeWidth="3" />
          <path d="M 16 57 C 22 51, 50 51, 56 57 C 58 64, 14 64, 16 57 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2.5" />
          <path d="M 28 53 L 27 63" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 44 53 L 45 63" stroke="#fed7aa" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPRESSIVE CHARACTER FACE (Warm child avatar showing 11 distinct emotions)
// ─────────────────────────────────────────────────────────────────────────────
const CharacterFaceWithEmotion: React.FC<{ emotion: string }> = ({ emotion }) => {
  return (
    <g>
      <defs>
        <radialGradient id="charFaceSkin" cx="36" cy="34" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="60%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fdba74" />
        </radialGradient>
      </defs>

      {/* Base face skin */}
      <circle cx="36" cy="39" r="16.5" fill="url(#charFaceSkin)" />

      {/* Cute ears */}
      <circle cx="19" cy="39" r="3.5" fill="#fed7aa" stroke="#f97316" strokeWidth="1" />
      <circle cx="53" cy="39" r="3.5" fill="#fed7aa" stroke="#f97316" strokeWidth="1" />

      {/* Rosy blushing cheeks */}
      <circle cx="25" cy="43" r="3.5" fill="#f43f5e" opacity="0.35" />
      <circle cx="47" cy="43" r="3.5" fill="#f43f5e" opacity="0.35" />

      {/* ────────────────── 11 SPECIFIC EMOTIONS ────────────────── */}

      {/* 1. HAPPY */}
      {emotion === 'happy' && (
        <g>
          {/* Sparkling curved happy eyes */}
          <path d="M 26 34 Q 30 28 34 34" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 38 34 Q 42 28 46 34" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Open warm beaming smile with pink tongue */}
          <path d="M 28 41 Q 36 53 44 41 Z" fill="#991b1b" stroke="#451a03" strokeWidth="1.8" />
          <path d="M 31 47 Q 36 50 41 47" fill="#f43f5e" />
        </g>
      )}

      {/* 2. CALM */}
      {emotion === 'calm' && (
        <g>
          {/* Peaceful closed curved eyes */}
          <path d="M 26 36 Q 30 40 34 36" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 38 36 Q 42 40 46 36" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Serene soft smile */}
          <path d="M 31 44 Q 36 48 41 44" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 3. EXCITED */}
      {emotion === 'excited' && (
        <g>
          {/* Golden star eyes */}
          <polygon points="30,28 31.5,31 35,31 32,33 33,36 30,34 27,36 28,33 25,31 28.5,31" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
          <polygon points="42,28 43.5,31 47,31 44,33 45,36 42,34 39,36 40,33 37,31 40.5,31" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
          {/* Big cheering open mouth */}
          <path d="M 27 40 Q 36 55 45 40 Z" fill="#991b1b" stroke="#451a03" strokeWidth="2" />
          <path d="M 30 47 Q 36 51 42 47" fill="#f43f5e" />
          {/* Sparkles */}
          <polygon points="17,14 18,16 20,16 18.5,17 19,19 17,18 15,19 15.5,17 14,16 16,16" fill="#facc15" />
          <polygon points="55,14 56,16 58,16 56.5,17 57,19 55,18 53,19 53.5,17 52,16 54,16" fill="#facc15" />
        </g>
      )}

      {/* 4. TIRED */}
      {emotion === 'tired' && (
        <g>
          {/* Heavy droopy eyelids */}
          <ellipse cx="29" cy="35" rx="3.5" ry="2" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="29" cy="36" r="1.5" fill="#451a03" />
          <ellipse cx="43" cy="35" rx="3.5" ry="2" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="43" cy="36" r="1.5" fill="#451a03" />
          {/* Big yawn */}
          <ellipse cx="36" cy="45" rx="4.5" ry="5.5" fill="#7f1d1d" stroke="#451a03" strokeWidth="1.8" />
          <text x="51" y="24" fontSize="9" fontWeight="bold" fill="#64748b" fontFamily="sans-serif">Z</text>
        </g>
      )}

      {/* 5. WORRIED */}
      {emotion === 'worried' && (
        <g>
          {/* Inward raised anxious brows */}
          <path d="M 25 30 Q 29 27 33 30" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 39 30 Q 43 27 47 30" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="29" cy="35" r="3" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="29" cy="35" r="1.8" fill="#451a03" />
          <circle cx="43" cy="35" r="3" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="43" cy="35" r="1.8" fill="#451a03" />
          {/* Wavy mouth */}
          <path d="M 30 45 Q 33 42 36 45 Q 39 48 42 45" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Sweat drop on cheek */}
          <path d="M 48 33 C 49 30 52 33 52 35 C 52 37 48 37 48 35 Z" fill="#38bdf8" />
        </g>
      )}

      {/* 6. SAD */}
      {emotion === 'sad' && (
        <g>
          {/* Downcast eyes */}
          <circle cx="29" cy="36" r="3" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="29" cy="37.2" r="1.8" fill="#451a03" />
          <circle cx="43" cy="36" r="3" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="43" cy="37.2" r="1.8" fill="#451a03" />
          {/* Downturned lip */}
          <path d="M 30 47 Q 36 41 42 47" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Big glossy blue teardrop */}
          <path d="M 44 38 C 42 43 41 47 44 49 C 47 49 48 45 46 40 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
        </g>
      )}

      {/* 7. ANGRY */}
      {emotion === 'angry' && (
        <g>
          {/* Fierce angled brows */}
          <path d="M 25 31 L 34 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M 47 31 L 38 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="37" r="2.8" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="29" cy="37" r="1.5" fill="#7f1d1d" />
          <circle cx="43" cy="37" r="2.8" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="43" cy="37" r="1.5" fill="#7f1d1d" />
          {/* Firm straight scowl */}
          <path d="M 30 46 L 42 46" stroke="#7f1d1d" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}

      {/* 8. FRUSTRATED */}
      {emotion === 'frustrated' && (
        <g>
          {/* Squeezed shut "> <" eyes */}
          <path d="M 26 33 L 30 36 L 26 39" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M 46 33 L 42 36 L 46 39" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          {/* Clamped teeth */}
          <path d="M 30 46 L 42 46" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 32 44 L 33 48 L 35 44 L 37 48 L 39 44 L 40 48" stroke="#451a03" strokeWidth="1.2" fill="none" />
          {/* Frustration stress mark above forehead */}
          <path d="M 31 16 L 33 13 L 36 17 L 39 13 L 41 16" stroke="#dc2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* 9. OVERWHELMED */}
      {emotion === 'overwhelmed' && (
        <g stroke="#6b21a8" strokeWidth="1.8" fill="none" strokeLinecap="round">
          {/* Hypnotic dizzy spirals */}
          <path d="M 29 36 A 3 3 0 1 0 29 38 A 1.5 1.5 0 1 0 29 37" />
          <path d="M 43 36 A 3 3 0 1 0 43 38 A 1.5 1.5 0 1 0 43 37" />
          <ellipse cx="36" cy="46" rx="4" ry="4.5" fill="#701a75" stroke="#451a03" strokeWidth="1.5" />
        </g>
      )}

      {/* 10. SCARED */}
      {emotion === 'scared' && (
        <g>
          {/* Pale startled face overlay */}
          <circle cx="36" cy="39" r="16.5" fill="#e0e7ff" opacity="0.35" />
          {/* Startled wide eyes */}
          <circle cx="28" cy="36" r="4.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="36" r="1.5" fill="#451a03" />
          <circle cx="44" cy="36" r="4.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="44" cy="36" r="1.5" fill="#451a03" />
          {/* Shivering mouth */}
          <path d="M 31 46 Q 36 43 41 46 Q 36 48 31 46 Z" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          {/* Tremor marks */}
          <path d="M 20 40 Q 18 43 20 46" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 52 40 Q 54 43 52 46" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* 11. CONFUSED */}
      {emotion === 'confused' && (
        <g>
          {/* One eye wide, one squinted */}
          <circle cx="29" cy="36" r="3.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="29" cy="36" r="2" fill="#451a03" />
          <ellipse cx="43" cy="36.5" rx="3" ry="1.8" fill="#ffffff" stroke="#451a03" strokeWidth="1.2" />
          <circle cx="43" cy="36.5" r="1.2" fill="#451a03" />
          {/* Raised brow on left */}
          <path d="M 25 31 Q 29 27 33 30" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Sideways puzzled mouth */}
          <path d="M 31 45 Q 36 42 41 46" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Big yellow question mark */}
          <text x="49" y="24" fontSize="13" fontWeight="900" fill="#f59e0b" fontFamily="sans-serif">?</text>
        </g>
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PUBLIC COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const ThemedEmotionFace: React.FC<ThemedEmotionFaceProps> = ({
  emotionId,
  theme,
  className = 'w-16 h-16',
}) => {
  const normalizedId = emotionId.toLowerCase().trim();
  const category = theme?.category;
  const label = emotionId.charAt(0).toUpperCase() + emotionId.slice(1);

  return (
    <span
      className={`${className} inline-flex items-center justify-center select-none flex-shrink-0 drop-shadow-sm`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 72 72"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={label}
        role="img"
        className="overflow-visible"
      >
        <title>{label}</title>

        {/* 1. Theme-Specific Background Badge (Sky, Ocean, Galaxy, Lilypad, Railway) */}
        <ThemedBackgroundBadge category={category} />

        {/* 2. Themed Hoodie Back Layer (Surrounds Head) */}
        <ThemedHoodieBack category={category} />

        {/* 3. Character Face with 11 Empathetic Expressions */}
        <CharacterFaceWithEmotion emotion={normalizedId} />

        {/* 4. Themed Hoodie Front Layer (Dino Teeth/Spikes, Frog Eyes, Shell Rim, Collar, Drawstrings) */}
        <ThemedHoodieFront category={category} />
      </svg>
    </span>
  );
};
