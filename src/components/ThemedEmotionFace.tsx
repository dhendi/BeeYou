/**
 * ThemedEmotionFace — 16-Bit Retro Pixel Art Emotion Character System
 *
 * User specification:
 * "The hat doesn't look good. It's not notiecable. What if we try a different
 *  approach. What if it's not a vecor art but make it like a normal art, or a pixel art"
 * Selected direction: 16-Bit Retro Pixel Art (Stardew Valley / Pokemon aesthetic)
 *
 * Each icon is rendered on an authentic 32x32 pixel grid with shape-rendering="crispEdges":
 * 1. Themed Pixel Background:
 *    - Dinosaur: Prehistoric sky with jungle fern fronds
 *    - Ocean: Deep blue sea with pixel wave crests & bubbles
 *    - Turtle: Turquoise waters with kelp & shell tones
 *    - Frog: Lily pad pond with lotus blossom
 *    - Space: Dark cosmic starfield with twinkling stars & planet
 *    - Train: Railway tracks & locomotive steam puffs
 *    - Classic: Golden retro game badge with sparkle burst
 *
 * 2. Character in Oversized Themed Pixel Hoodie:
 *    - Dinosaur: Rich green hood, giant golden dorsal spikes, white dino teeth lining hood rim!
 *    - Ocean: Classic navy sailor hoodie, white sailor collar with navy stripe & golden anchor!
 *    - Turtle: Emerald hood with turtle shell scutes & mint drawstrings
 *    - Frog: Green hood with two big bulbous frog-eyes on top
 *    - Space: Spacesuit helmet with antenna, comms pods & visor frame
 *    - Train: Conductor cap with golden locomotive crest & whistle
 *    - Classic: Cozy colorful retro hoodie with drawstrings
 *
 * 3. 11 Vivid Pixel Expressions:
 *    - happy, calm, excited, tired, worried, sad, angry, frustrated, overwhelmed, scared, confused
 */

import React, { useState, useEffect } from 'react';
import { AppTheme } from '../data/themesData';
import { useApp } from '../context/AppContext';
import { getRecoloredEmotionImage, isDefaultPalette } from '../utils/avatarRecolor';

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

export interface ThemedEmotionFaceProps {
  emotionId: EmotionId | string;
  theme?: AppTheme | null;
  hairStyle?: string;
  gender?: 'boy' | 'girl' | 'neutral';
  skinTone?: string;
  hairColor?: string;
  /** CSS size class e.g. "w-16 h-16" */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
// Single pixel
const Px: React.FC<{ x: number | string; y: number | string; c: string; w?: number | string; h?: number | string }> = ({
  x,
  y,
  c,
  w = 1,
  h = 1,
}) => <rect x={x} y={y} width={w} height={h} fill={c} shapeRendering="crispEdges" />;

// ─────────────────────────────────────────────────────────────────────────────
// 1. THEMED PIXEL BACKGROUNDS (32x32 Grid)
// ─────────────────────────────────────────────────────────────────────────────
const PixelBackground: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          {/* Retro rounded corner background fill (warm prehistoric sky) */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#fef08a" shapeRendering="crispEdges" />
          <rect x="2" y="20" width="28" height="10" rx="3" fill="#86efac" opacity="0.75" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#15803d" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Background pixel fern fronds */}
          <Px x="4" y="16" c="#15803d" w="2" h="4" />
          <Px x="3" y="14" c="#15803d" w="2" h="2" />
          <Px x="5" y="12" c="#15803d" w="2" h="2" />
          <Px x="26" y="16" c="#15803d" w="2" h="4" />
          <Px x="27" y="14" c="#15803d" w="2" h="2" />
          <Px x="25" y="12" c="#15803d" w="2" h="2" />

          {/* Distant prehistoric sun dots */}
          <Px x="15" y="4" c="#fde047" w="2" h="2" />
          <Px x="6" y="6" c="#facc15" />
          <Px x="25" y="6" c="#facc15" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          {/* Deep ocean blue retro rounded background */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#bae6fd" shapeRendering="crispEdges" />
          <rect x="2" y="18" width="28" height="12" rx="3" fill="#38bdf8" opacity="0.6" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#0369a1" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Pixel wave crests */}
          <Px x="4" y="22" c="#ffffff" w="3" h="1" />
          <Px x="3" y="23" c="#ffffff" w="2" h="2" />
          <Px x="25" y="21" c="#ffffff" w="3" h="1" />
          <Px x="26" y="22" c="#ffffff" w="2" h="2" />

          {/* Floating air bubbles */}
          <Px x="5" y="9" c="#ffffff" w="2" h="2" />
          <Px x="26" y="8" c="#ffffff" w="2" h="2" />
          <Px x="24" y="13" c="#ffffff" />
          <Px x="7" y="14" c="#ffffff" />
        </g>
      );

    case 'turtle':
      return (
        <g>
          {/* Turquoise sea sanctuary background */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#ccfbf1" shapeRendering="crispEdges" />
          <rect x="2" y="20" width="28" height="10" rx="3" fill="#5eead4" opacity="0.6" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#0f766e" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Swaying pixel sea kelp */}
          <Px x="4" y="18" c="#047857" w="2" h="8" />
          <Px x="5" y="14" c="#047857" w="2" h="4" />
          <Px x="26" y="18" c="#047857" w="2" h="8" />
          <Px x="25" y="14" c="#047857" w="2" h="4" />

          {/* Ambient bubbles */}
          <Px x="6" y="8" c="#ffffff" w="2" h="2" />
          <Px x="25" y="8" c="#ffffff" w="2" h="2" />
        </g>
      );

    case 'frog':
      return (
        <g>
          {/* Lily pond background */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#dcfce7" shapeRendering="crispEdges" />
          <rect x="2" y="22" width="28" height="8" rx="3" fill="#86efac" opacity="0.6" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#15803d" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Pixel water lily pad base */}
          <Px x="6" y="26" c="#16a34a" w="20" h="3" />
          <Px x="4" y="12" c="#f472b6" w="2" h="2" />
          <Px x="26" y="12" c="#f472b6" w="2" h="2" />
        </g>
      );

    case 'space':
      return (
        <g>
          {/* Deep cosmic galaxy background */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#1e1b4b" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#6366f1" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Twinkling star field */}
          <Px x="5" y="7" c="#ffffff" w="2" h="2" />
          <Px x="6" y="6" c="#facc15" />
          <Px x="25" y="7" c="#ffffff" w="2" h="2" />
          <Px x="26" y="8" c="#facc15" />
          <Px x="4" y="22" c="#ffffff" />
          <Px x="27" y="23" c="#ffffff" />
          <Px x="15" y="4" c="#c084fc" w="2" h="2" />
        </g>
      );

    case 'train':
      return (
        <g>
          {/* Sunset railway background */}
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#fed7aa" shapeRendering="crispEdges" />
          <rect x="2" y="22" width="28" height="8" rx="3" fill="#fdba74" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#c2410c" strokeWidth="1.5" shapeRendering="crispEdges" />

          {/* Steam puffs & tracks */}
          <Px x="5" y="6" c="#ffffff" w="3" h="2" />
          <Px x="24" y="6" c="#ffffff" w="3" h="2" />
          <Px x="4" y="27" c="#78350f" w="24" h="2" />
        </g>
      );

    default:
      return (
        <g>
          <rect x="2" y="2" width="28" height="28" rx="5" fill="#fef08a" shapeRendering="crispEdges" />
          <rect x="2" y="2" width="28" height="28" rx="5" fill="none" stroke="#d97706" strokeWidth="1.5" shapeRendering="crispEdges" />
          <Px x="5" y="7" c="#facc15" w="2" h="2" />
          <Px x="25" y="7" c="#facc15" w="2" h="2" />
        </g>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. OVERSIZED THEMED PIXEL HOODIE / HAT
// ─────────────────────────────────────────────────────────────────────────────

/** Hoodie back & silhouette (behind face) */
const PixelHoodieBack: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          {/* GIANT DINO SPIKES on top of the hood (impossible to miss!) */}
          {/* Middle spike */}
          <Px x="15" y="2" c="#d97706" w="3" h="1" />
          <Px x="14" y="3" c="#fbbf24" w="5" h="2" />
          <Px x="14" y="3" c="#1e293b" w="1" h="2" />
          <Px x="18" y="3" c="#1e293b" w="1" h="2" />

          {/* Left spike */}
          <Px x="9" y="4" c="#d97706" w="3" h="1" />
          <Px x="8" y="5" c="#fbbf24" w="4" h="2" />

          {/* Right spike */}
          <Px x="21" y="4" c="#d97706" w="3" h="1" />
          <Px x="21" y="5" c="#fbbf24" w="4" h="2" />

          {/* Big Green Dino Hood volume */}
          <rect x="6" y="7" width="20" height="18" rx="5" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" shapeRendering="crispEdges" />
          {/* Shading pixels */}
          <Px x="7" y="8" c="#4ade80" w="4" h="2" />
          <Px x="7" y="10" c="#16a34a" w="2" h="6" />
          <Px x="23" y="10" c="#16a34a" w="2" h="6" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          {/* Sailor cap top crown & brim */}
          <rect x="9" y="4" width="14" height="4" rx="2" fill="#1e3a8a" stroke="#172554" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="11" y="5" c="#3b82f6" w="10" h="1" />

          {/* Blue Sailor Hoodie body */}
          <rect x="6" y="7" width="20" height="18" rx="5" fill="#1d4ed8" stroke="#172554" strokeWidth="1.5" shapeRendering="crispEdges" />
          <Px x="7" y="8" c="#60a5fa" w="4" h="2" />
          <Px x="7" y="10" c="#1e40af" w="2" h="6" />
          <Px x="23" y="10" c="#1e40af" w="2" h="6" />
        </g>
      );

    case 'turtle':
      return (
        <g>
          {/* Emerald Turtle Shell Hood */}
          <rect x="6" y="6" width="20" height="19" rx="6" fill="#059669" stroke="#064e3b" strokeWidth="1.5" shapeRendering="crispEdges" />
          {/* Turtle shell scutes on top of hood */}
          <Px x="13" y="7" c="#34d399" w="6" h="1" />
          <Px x="11" y="8" c="#34d399" w="10" h="1" />
          <Px x="15" y="9" c="#047857" w="2" h="2" />
        </g>
      );

    case 'frog':
      return (
        <g>
          {/* TWO GIANT FROG EYES ON TOP OF HOOD */}
          <rect x="8" y="3" width="5" height="5" rx="2" fill="#22c55e" stroke="#14532d" strokeWidth="1" shapeRendering="crispEdges" />
          <rect x="19" y="3" width="5" height="5" rx="2" fill="#22c55e" stroke="#14532d" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="10" y="4" c="#ffffff" w="2" h="2" />
          <Px x="11" y="5" c="#14532d" />
          <Px x="21" y="4" c="#ffffff" w="2" h="2" />
          <Px x="22" y="5" c="#14532d" />

          {/* Frog hood volume */}
          <rect x="6" y="7" width="20" height="18" rx="5" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" shapeRendering="crispEdges" />
        </g>
      );

    case 'space':
      return (
        <g>
          {/* Comms antenna */}
          <Px x="24" y="3" c="#a855f7" w="2" h="2" />
          <Px x="23" y="5" c="#6366f1" />
          {/* White Space Helmet hood */}
          <rect x="6" y="6" width="20" height="19" rx="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" shapeRendering="crispEdges" />
          {/* Side radio ear pods */}
          <rect x="4" y="12" width="2" height="6" rx="1" fill="#6366f1" shapeRendering="crispEdges" />
          <rect x="26" y="12" width="2" height="6" rx="1" fill="#6366f1" shapeRendering="crispEdges" />
          <Px x="4" y="14" c="#38bdf8" />
          <Px x="27" y="14" c="#38bdf8" />
        </g>
      );

    case 'train':
      return (
        <g>
          {/* Conductor Cap Crown */}
          <rect x="9" y="3" width="14" height="5" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1" shapeRendering="crispEdges" />
          {/* Train hood */}
          <rect x="6" y="7" width="20" height="18" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" shapeRendering="crispEdges" />
        </g>
      );

    default:
      return (
        <g>
          <rect x="6" y="7" width="20" height="18" rx="5" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" shapeRendering="crispEdges" />
        </g>
      );
  }
};

/** Hoodie front details (teeth, drawstrings, collars, emblem) */
const PixelHoodieFront: React.FC<{ category?: string }> = ({ category }) => {
  switch (category) {
    case 'dinosaur':
      return (
        <g>
          {/* WHITE DINO TEETH lining the hood rim (framing face!) */}
          <Px x="11" y="10" c="#ffffff" w="2" h="2" />
          <Px x="15" y="9" c="#ffffff" w="2" h="2" />
          <Px x="19" y="10" c="#ffffff" w="2" h="2" />
          <Px x="9" y="15" c="#ffffff" w="2" h="2" />
          <Px x="21" y="15" c="#ffffff" w="2" h="2" />

          {/* Green Hoodie Shoulders */}
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#16a34a" stroke="#15803d" strokeWidth="1" shapeRendering="crispEdges" />

          {/* Yellow Drawstrings */}
          <Px x="12" y="23" c="#facc15" w="1" h="5" />
          <Px x="12" y="28" c="#ca8a04" w="1" h="1" />
          <Px x="19" y="23" c="#facc15" w="1" h="5" />
          <Px x="19" y="28" c="#ca8a04" w="1" h="1" />
        </g>
      );

    case 'ocean':
      return (
        <g>
          {/* White sailor collar with navy stripe */}
          <rect x="7" y="23" width="18" height="7" rx="2" fill="#ffffff" stroke="#0369a1" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="8" y="25" c="#1d4ed8" w="16" h="1" />

          {/* GOLDEN PIXEL ANCHOR EMBLEM on chest (prominent & iconic!) */}
          <Px x="15" y="26" c="#facc15" w="2" h="1" />
          <Px x="15" y="27" c="#facc15" w="2" h="3" />
          <Px x="13" y="28" c="#facc15" w="6" h="1" />
          <Px x="13" y="29" c="#facc15" w="1" h="1" />
          <Px x="18" y="29" c="#facc15" w="1" h="1" />

          {/* Sailor hoodie shoulders */}
          <Px x="5" y="25" c="#1d4ed8" w="2" h="5" />
          <Px x="25" y="25" c="#1d4ed8" w="2" h="5" />
        </g>
      );

    case 'turtle':
      return (
        <g>
          {/* Mint inner lining */}
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#047857" stroke="#064e3b" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="12" y="23" c="#34d399" w="1" h="4" />
          <Px x="19" y="23" c="#34d399" w="1" h="4" />
        </g>
      );

    case 'frog':
      return (
        <g>
          {/* Pale throat patch & shoulders */}
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#22c55e" stroke="#15803d" strokeWidth="1" shapeRendering="crispEdges" />
          <rect x="13" y="24" width="6" height="4" fill="#dcfce7" shapeRendering="crispEdges" />
        </g>
      );

    case 'space':
      return (
        <g>
          {/* Reflective curved visor rim */}
          <Px x="10" y="10" c="#38bdf8" w="12" h="1" />
          <Px x="8" y="12" c="#38bdf8" w="1" h="4" />
          {/* Spacesuit collar & cyan chest light */}
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="15" y="25" c="#06b6d4" w="2" h="2" />
        </g>
      );

    case 'train':
      return (
        <g>
          {/* Black cap visor brim */}
          <rect x="9" y="7" width="14" height="2" fill="#0f172a" shapeRendering="crispEdges" />
          {/* Golden train badge */}
          <Px x="15" y="5" c="#facc15" w="2" h="2" />
          {/* Uniform jacket & whistle */}
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="15" y="24" c="#facc15" w="2" h="3" />
        </g>
      );

    default:
      return (
        <g>
          <rect x="6" y="24" width="20" height="6" rx="2" fill="#ea580c" stroke="#c2410c" strokeWidth="1" shapeRendering="crispEdges" />
          <Px x="12" y="23" c="#fed7aa" w="1" h="4" />
          <Px x="19" y="23" c="#fed7aa" w="1" h="4" />
        </g>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PIXEL CHARACTER FACE & 11 EMOTIONAL EXPRESSIONS
// ─────────────────────────────────────────────────────────────────────────────
const PixelFaceEmotion: React.FC<{
  emotion: string;
  hairStyle?: string;
  gender?: 'boy' | 'girl' | 'neutral';
  skinTone?: string;
  hairColor?: string;
}> = ({
  emotion,
  hairStyle = 'short',
  skinTone = '#fed7aa',
  hairColor = '#78350f',
}) => {
  return (
    <g>
      {/* Character Face Base (inside hoodie opening) */}
      <rect x="9" y="10" width="14" height="13" rx="3" fill={skinTone} shapeRendering="crispEdges" />

      {/* Hair peeking from under hoodie based on customizable hairStyle & hairColor */}
      {hairStyle === 'pigtails' && (
        <g>
          {/* Cute bangs */}
          <Px x="11" y="10" c={hairColor} w="4" h="2" />
          <Px x="17" y="10" c={hairColor} w="4" h="2" />
          {/* Twin pigtails tufts peeking on sides */}
          <Px x="7" y="13" c={hairColor} w="2" h="4" />
          <Px x="23" y="13" c={hairColor} w="2" h="4" />
        </g>
      )}

      {hairStyle === 'curly' && (
        <g>
          {/* Curly bumps across forehead and temples */}
          <Px x="10" y="9" c={hairColor} w="3" h="2" />
          <Px x="14" y="9" c={hairColor} w="4" h="2" />
          <Px x="19" y="9" c={hairColor} w="3" h="2" />
          <Px x="8" y="12" c={hairColor} w="2" h="3" />
          <Px x="22" y="12" c={hairColor} w="2" h="3" />
        </g>
      )}

      {hairStyle === 'spiky' && (
        <g>
          {/* Spiky cool peaks */}
          <Px x="11" y="9" c={hairColor} w="2" h="3" />
          <Px x="14" y="8" c={hairColor} w="2" h="4" />
          <Px x="17" y="8" c={hairColor} w="2" h="4" />
          <Px x="20" y="9" c={hairColor} w="2" h="3" />
        </g>
      )}

      {hairStyle === 'braids' && (
        <g>
          {/* Braided strands */}
          <Px x="11" y="10" c={hairColor} w="10" h="2" />
          <Px x="7" y="12" c={hairColor} w="2" h="2" />
          <Px x="8" y="14" c={hairColor} w="2" h="2" />
          <Px x="7" y="16" c={hairColor} w="2" h="2" />
          <Px x="23" y="12" c={hairColor} w="2" h="2" />
          <Px x="22" y="14" c={hairColor} w="2" h="2" />
          <Px x="23" y="16" c={hairColor} w="2" h="2" />
        </g>
      )}

      {hairStyle === 'afro' && (
        <g>
          {/* Fluffy rounded afro puffs */}
          <Px x="9" y="8" c={hairColor} w="14" h="3" />
          <Px x="7" y="10" c={hairColor} w="3" h="4" />
          <Px x="22" y="10" c={hairColor} w="3" h="4" />
        </g>
      )}

      {hairStyle === 'bob' && (
        <g>
          {/* Neat straight bangs and sleek sides */}
          <Px x="10" y="10" c={hairColor} w="12" h="2" />
          <Px x="8" y="12" c={hairColor} w="2" h="4" />
          <Px x="22" y="12" c={hairColor} w="2" h="4" />
        </g>
      )}

      {hairStyle === 'ponytail' && (
        <g>
          {/* Forehead bangs + high ponytail tuft */}
          <Px x="11" y="10" c={hairColor} w="10" h="2" />
          <Px x="21" y="8" c={hairColor} w="3" h="3" />
          <Px x="23" y="11" c={hairColor} w="2" h="3" />
        </g>
      )}

      {hairStyle === 'buzz' && (
        <g>
          {/* Minimal clean hairline */}
          <Px x="11" y="10" c={hairColor} w="10" h="1" />
        </g>
      )}

      {hairStyle === 'wavy' && (
        <g>
          {/* Soft wavy fringe */}
          <Px x="11" y="10" c={hairColor} w="3" h="2" />
          <Px x="15" y="11" c={hairColor} w="3" h="2" />
          <Px x="19" y="10" c={hairColor} w="3" h="2" />
        </g>
      )}

      {(!hairStyle || hairStyle === 'short') && (
        <g>
          {/* Cute classic tuft peeking from under hoodie */}
          <Px x="13" y="10" c={hairColor} w="2" h="3" />
          <Px x="15" y="11" c={hairColor} w="2" h="2" />
          <Px x="17" y="10" c={hairColor} w="2" h="3" />
        </g>
      )}

      {/* Rosy Pink Cheek Blush Dots */}
      <Px x="10" y="17" c="#fb7185" w="2" h="1" />
      <Px x="20" y="17" c="#fb7185" w="2" h="1" />

      {/* ────────────────── 11 PIXEL EMOTIONAL EXPRESSIONS ────────────────── */}

      {/* 1. HAPPY */}
      {emotion === 'happy' && (
        <g>
          {/* Sparkling anime pixel eyes */}
          <Px x="11" y="13" c="#1e293b" w="3" h="3" />
          <Px x="12" y="13" c="#ffffff" w="1" h="1" />
          <Px x="18" y="13" c="#1e293b" w="3" h="3" />
          <Px x="19" y="13" c="#ffffff" w="1" h="1" />
          {/* Big open happy pixel smile with pink tongue */}
          <Px x="13" y="18" c="#991b1b" w="6" h="3" />
          <Px x="14" y="19" c="#f43f5e" w="4" h="2" />
        </g>
      )}

      {/* 2. CALM */}
      {emotion === 'calm' && (
        <g>
          {/* Peaceful closed curved eye lines (^_^) */}
          <Px x="11" y="15" c="#1e293b" w="1" h="1" />
          <Px x="12" y="14" c="#1e293b" w="2" h="1" />
          <Px x="14" y="15" c="#1e293b" w="1" h="1" />

          <Px x="17" y="15" c="#1e293b" w="1" h="1" />
          <Px x="18" y="14" c="#1e293b" w="2" h="1" />
          <Px x="20" y="15" c="#1e293b" w="1" h="1" />
          {/* Peaceful soft smile */}
          <Px x="14" y="18" c="#1e293b" w="4" h="1" />
        </g>
      )}

      {/* 3. EXCITED */}
      {emotion === 'excited' && (
        <g>
          {/* GOLDEN STAR PIXEL EYES (★ ★) */}
          <Px x="12" y="13" c="#facc15" w="2" h="2" />
          <Px x="11" y="13" c="#facc15" />
          <Px x="14" y="13" c="#facc15" />
          <Px x="12" y="12" c="#facc15" />
          <Px x="12" y="15" c="#facc15" />

          <Px x="18" y="13" c="#facc15" w="2" h="2" />
          <Px x="17" y="13" c="#facc15" />
          <Px x="20" y="13" c="#facc15" />
          <Px x="18" y="12" c="#facc15" />
          <Px x="18" y="15" c="#facc15" />

          {/* Laughing cheering mouth */}
          <Px x="13" y="17" c="#991b1b" w="6" h="4" />
          <Px x="14" y="19" c="#f43f5e" w="4" h="2" />
          {/* Energy sparkles */}
          <Px x="7" y="4" c="#facc15" />
          <Px x="25" y="4" c="#facc15" />
        </g>
      )}

      {/* 4. TIRED */}
      {emotion === 'tired' && (
        <g>
          {/* Droopy half-closed sleepy eyes */}
          <Px x="11" y="14" c="#1e293b" w="3" h="1" />
          <Px x="12" y="15" c="#1e293b" w="2" h="1" />
          <Px x="18" y="14" c="#1e293b" w="3" h="1" />
          <Px x="18" y="15" c="#1e293b" w="2" h="1" />
          {/* Big yawn */}
          <Px x="14" y="17" c="#7f1d1d" w="4" h="4" />
          <Px x="15" y="19" c="#f43f5e" w="2" h="2" />
          {/* Sleepy Zzz */}
          <Px x="24" y="10" c="#64748b" w="2" h="1" />
          <Px x="25" y="11" c="#64748b" />
          <Px x="24" y="12" c="#64748b" w="2" h="1" />
        </g>
      )}

      {/* 5. WORRIED */}
      {emotion === 'worried' && (
        <g>
          {/* Anxious tilted brows */}
          <Px x="11" y="12" c="#1e293b" w="3" h="1" />
          <Px x="18" y="12" c="#1e293b" w="3" h="1" />
          {/* Nervous eyes */}
          <Px x="12" y="14" c="#1e293b" w="2" h="2" />
          <Px x="18" y="14" c="#1e293b" w="2" h="2" />
          {/* Wavy mouth */}
          <Px x="13" y="18" c="#1e293b" w="2" h="1" />
          <Px x="15" y="19" c="#1e293b" w="2" h="1" />
          <Px x="17" y="18" c="#1e293b" w="2" h="1" />
          {/* Sweat drop on cheek */}
          <Px x="21" y="13" c="#38bdf8" w="1" h="2" />
        </g>
      )}

      {/* 6. SAD */}
      {emotion === 'sad' && (
        <g>
          {/* Downcast eyes */}
          <Px x="11" y="14" c="#1e293b" w="3" h="2" />
          <Px x="18" y="14" c="#1e293b" w="3" h="2" />
          {/* Downturned mouth */}
          <Px x="13" y="19" c="#1e293b" w="1" h="1" />
          <Px x="14" y="18" c="#1e293b" w="4" h="1" />
          <Px x="18" y="19" c="#1e293b" w="1" h="1" />
          {/* Big blue teardrop rolling down */}
          <Px x="20" y="16" c="#38bdf8" w="1" h="3" />
          <Px x="20" y="19" c="#0284c7" w="1" h="1" />
        </g>
      )}

      {/* 7. ANGRY */}
      {emotion === 'angry' && (
        <g>
          {/* Sharp 45° angry brows */}
          <Px x="11" y="12" c="#7f1d1d" />
          <Px x="12" y="13" c="#7f1d1d" w="2" h="1" />
          <Px x="20" y="12" c="#7f1d1d" />
          <Px x="18" y="13" c="#7f1d1d" w="2" h="1" />
          {/* Fierce eyes with red tint */}
          <Px x="12" y="14" c="#b91c1c" w="2" h="2" />
          <Px x="18" y="14" c="#b91c1c" w="2" h="2" />
          {/* Scowl line */}
          <Px x="13" y="18" c="#7f1d1d" w="6" h="1" />
          {/* Steam puff */}
          <Px x="7" y="12" c="#fca5a5" w="2" h="2" />
        </g>
      )}

      {/* 8. FRUSTRATED */}
      {emotion === 'frustrated' && (
        <g>
          {/* Squeezed shut (> <) eyes */}
          <Px x="11" y="13" c="#1e293b" />
          <Px x="12" y="14" c="#1e293b" />
          <Px x="11" y="15" c="#1e293b" />

          <Px x="20" y="13" c="#1e293b" />
          <Px x="19" y="14" c="#1e293b" />
          <Px x="20" y="15" c="#1e293b" />
          {/* Clamped teeth */}
          <Px x="13" y="18" c="#1e293b" w="6" h="1" />
          <Px x="14" y="17" c="#ffffff" w="4" h="1" />
          {/* Red frustration stress mark */}
          <Px x="15" y="8" c="#dc2626" w="2" h="1" />
          <Px x="14" y="7" c="#dc2626" />
          <Px x="17" y="7" c="#dc2626" />
        </g>
      )}

      {/* 9. OVERWHELMED */}
      {emotion === 'overwhelmed' && (
        <g>
          {/* Hypnotic dizzy spiral eyes (@ @) */}
          <Px x="11" y="13" c="#7c3aed" w="3" h="1" />
          <Px x="13" y="14" c="#7c3aed" />
          <Px x="11" y="15" c="#7c3aed" w="2" h="1" />

          <Px x="18" y="13" c="#7c3aed" w="3" h="1" />
          <Px x="20" y="14" c="#7c3aed" />
          <Px x="18" y="15" c="#7c3aed" w="2" h="1" />
          {/* Wobbly O mouth */}
          <Px x="15" y="18" c="#701a75" w="2" h="2" />
        </g>
      )}

      {/* 10. SCARED */}
      {emotion === 'scared' && (
        <g>
          {/* Shivering wide pupils */}
          <Px x="11" y="13" c="#ffffff" w="3" h="3" />
          <Px x="12" y="14" c="#1e293b" />
          <Px x="18" y="13" c="#ffffff" w="3" h="3" />
          <Px x="19" y="14" c="#1e293b" />
          {/* Pale indigo flush */}
          <Px x="10" y="17" c="#818cf8" w="2" h="1" />
          <Px x="20" y="17" c="#818cf8" w="2" h="1" />
          {/* Chattering teeth */}
          <Px x="14" y="18" c="#ffffff" w="4" h="2" />
          <Px x="14" y="18" c="#1e293b" w="4" h="1" />
        </g>
      )}

      {/* 11. CONFUSED */}
      {emotion === 'confused' && (
        <g>
          {/* One eye wide, one squinted */}
          <Px x="11" y="13" c="#1e293b" w="3" h="3" />
          <Px x="12" y="13" c="#ffffff" />
          <Px x="18" y="14" c="#1e293b" w="3" h="1" />
          {/* Raised brow */}
          <Px x="11" y="11" c="#1e293b" w="3" h="1" />
          {/* Puzzled mouth */}
          <Px x="14" y="18" c="#1e293b" w="4" h="1" />
          {/* Golden question mark */}
          <Px x="23" y="10" c="#facc15" w="2" h="1" />
          <Px x="24" y="11" c="#facc15" />
          <Px x="23" y="12" c="#facc15" />
          <Px x="23" y="14" c="#facc15" />
        </g>
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PUBLIC COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const REAL_IMAGE_THEMES = new Set(['dinosaur', 'ocean', 'turtle', 'frog', 'space']);

export const ThemedEmotionFace: React.FC<ThemedEmotionFaceProps> = ({
  emotionId,
  theme,
  hairStyle,
  gender,
  skinTone,
  hairColor,
  className = 'w-16 h-16',
}) => {
  const { avatar } = useApp();

  const effectiveHairStyle = hairStyle ?? avatar?.hairStyle ?? 'short';
  const effectiveSkin = skinTone ?? avatar?.skinTone ?? '#fed7aa';
  const effectiveHair = hairColor ?? avatar?.hairColor ?? '#451a03';

  const normalizedId = emotionId.toLowerCase().trim();
  const category = theme?.category;
  const label = emotionId.charAt(0).toUpperCase() + emotionId.slice(1);
  const [imageFailed, setImageFailed] = useState(false);

  // Hairstyle determination:
  // Dedicated authentic pixel art sprite sets with identical onesie/outfit and changeable hair:
  let folder = category;
  if (category && REAL_IMAGE_THEMES.has(category)) {
    switch (effectiveHairStyle) {
      case 'curly':
      case 'wavy':
        folder = `${category}_curly`;
        break;
      case 'afro':
        folder = `${category}_afro`;
        break;
      case 'spiky':
        folder = `${category}_spiky`;
        break;
      case 'braids':
        folder = `${category}_braids`;
        break;
      case 'ponytail':
        folder = `${category}_ponytail`;
        break;
      case 'bob':
        folder = `${category}_bob`;
        break;
      case 'pigtails':
        folder = `${category}_pigtails`;
        break;
      case 'short':
      case 'buzz':
      default:
        folder = (gender === 'girl' && !hairStyle) ? `${category}_pigtails` : category;
        break;
    }
  }
  const baseSrc = `/assets/emotions/${folder}/${normalizedId}.png?v=10`;

  const hasRealImage = Boolean(category && REAL_IMAGE_THEMES.has(category) && !imageFailed);

  // Dynamically recolor skin & hair if user has customized them
  const [recoloredSrc, setRecoloredSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (isDefaultPalette(effectiveSkin, effectiveHair)) {
      setRecoloredSrc(null);
      return;
    }

    getRecoloredEmotionImage(baseSrc, effectiveSkin, effectiveHair).then((recolored) => {
      if (active) {
        setRecoloredSrc(recolored);
      }
    });

    return () => {
      active = false;
    };
  }, [baseSrc, effectiveSkin, effectiveHair]);

  const displaySrc =
    !isDefaultPalette(effectiveSkin, effectiveHair) && recoloredSrc
      ? recoloredSrc
      : baseSrc;

  return (
    <span
      className={`${className} inline-flex items-center justify-center select-none flex-shrink-0 drop-shadow-xs relative overflow-hidden`}
      aria-hidden="true"
    >
      {hasRealImage ? (
        <img
          key={`${folder}-${category}-${normalizedId}-${effectiveSkin}-${effectiveHair}`}
          src={displaySrc}
          alt={label}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain transition-transform hover:scale-105 active:scale-95"
          style={{ imageRendering: 'pixelated' }}
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={label}
          role="img"
          shapeRendering="crispEdges"
          className="overflow-visible"
          style={{ imageRendering: 'pixelated' }}
        >
          <title>{label}</title>

          {/* 1. Oversized Themed Pixel Hoodie Back (Dino Spikes, Sailor Hat, Frog Eyes, Shell) */}
          <PixelHoodieBack category={category} />

          {/* 2. Character Face with 11 Expressive Pixel Expressions & Chosen Hairstyle/Colors */}
          <PixelFaceEmotion
            emotion={normalizedId}
            hairStyle={effectiveHairStyle}
            skinTone={effectiveSkin}
            hairColor={effectiveHair}
          />

          {/* 3. Themed Pixel Hoodie Front (White Dino Teeth, Golden Anchor, Drawstrings, Collar) */}
          <PixelHoodieFront category={category} />
        </svg>
      )}
    </span>
  );
};

