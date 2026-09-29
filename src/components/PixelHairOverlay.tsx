/**
 * PixelHairOverlay.tsx — Modular 16-Bit Retro Pixel Art Hairstyle Overlay System
 *
 * Provides authentic pixel-sharp hair layers for:
 * - curly: Bouncy curl ringlets across forehead and cheek tufts
 * - afro: Two cloud-textured afro puffs flanking the hood
 * - spiky: Sharp cool adventurer spikes along hood rim
 * - braids: Interlocking woven chevron plaits with golden beads
 * - ponytail: High bouncy ponytail plume with colorful hair scrunchie
 * - bob: Sleek straight fringe and chin-length framing strands
 */

import React from 'react';

export type HairstyleId =
  | 'short'
  | 'pigtails'
  | 'curly'
  | 'afro'
  | 'spiky'
  | 'braids'
  | 'ponytail'
  | 'bob';

export interface PixelHairOverlayProps {
  hairStyle?: HairstyleId | string;
  hairColor?: string;
  className?: string;
}

/** Compute harmonious highlight and shadow shades from a base hex color */
function getHairShades(hex: string = '#451a03') {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  const num = parseInt(clean, 16) || 0x451a03;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // Highlight (+35% lightness, slight warm sheen)
  const hr = Math.min(255, Math.round(r * 1.35 + 24));
  const hg = Math.min(255, Math.round(g * 1.35 + 18));
  const hb = Math.min(255, Math.round(b * 1.35 + 12));

  // Shadow (-35% lightness)
  const sr = Math.max(12, Math.round(r * 0.65));
  const sg = Math.max(12, Math.round(g * 0.65));
  const sb = Math.max(12, Math.round(b * 0.65));

  // Deep outline (-65% lightness)
  const or = Math.max(6, Math.round(r * 0.35));
  const og = Math.max(6, Math.round(g * 0.35));
  const ob = Math.max(6, Math.round(b * 0.35));

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return {
    base: hex,
    highlight: `#${toHex(hr)}${toHex(hg)}${toHex(hb)}`,
    shadow: `#${toHex(sr)}${toHex(sg)}${toHex(sb)}`,
    outline: `#${toHex(or)}${toHex(og)}${toHex(ob)}`,
  };
}

export const PixelHairOverlay: React.FC<PixelHairOverlayProps> = ({
  hairStyle = 'short',
  hairColor = '#451a03',
  className = 'absolute inset-0 w-full h-full pointer-events-none',
}) => {
  // Short and pigtails use native sprite art without extra overlay
  if (hairStyle === 'short' || hairStyle === 'pigtails') {
    return null;
  }

  const shades = getHairShades(hairColor);
  const { base, highlight, shadow, outline } = shades;

  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* ──────────────── 1. CURLY / WAVY (🌀) ──────────────── */}
      {hairStyle === 'curly' && (
        <g id="curly-hair">
          {/* Forehead curl bumps */}
          <rect x="94" y="92" width="16" height="12" rx="4" fill={base} />
          <rect x="98" y="88" width="10" height="6" fill={highlight} />
          <rect x="94" y="102" width="16" height="4" fill={shadow} />

          <rect x="114" y="94" width="18" height="14" rx="4" fill={base} />
          <rect x="118" y="90" width="10" height="6" fill={highlight} />
          <rect x="114" y="106" width="18" height="4" fill={shadow} />

          <rect x="136" y="92" width="18" height="14" rx="4" fill={base} />
          <rect x="140" y="88" width="10" height="6" fill={highlight} />
          <rect x="136" y="104" width="18" height="4" fill={shadow} />

          <rect x="158" y="94" width="16" height="12" rx="4" fill={base} />
          <rect x="162" y="90" width="10" height="6" fill={highlight} />
          <rect x="158" y="104" width="16" height="4" fill={shadow} />

          {/* Left Side Bouncy Curls (3 stacked bouncy spirals) */}
          <rect x="44" y="132" width="28" height="20" rx="6" fill={base} />
          <rect x="48" y="134" width="14" height="8" rx="3" fill={highlight} />
          <rect x="44" y="150" width="28" height="4" fill={shadow} />

          <rect x="36" y="150" width="30" height="22" rx="6" fill={base} />
          <rect x="40" y="152" width="14" height="8" rx="3" fill={highlight} />
          <rect x="36" y="170" width="30" height="4" fill={shadow} />

          <rect x="42" y="170" width="26" height="22" rx="6" fill={base} />
          <rect x="46" y="172" width="12" height="8" rx="3" fill={highlight} />
          <rect x="42" y="190" width="26" height="4" fill={shadow} />

          {/* Right Side Bouncy Curls (3 stacked bouncy spirals) */}
          <rect x="184" y="132" width="28" height="20" rx="6" fill={base} />
          <rect x="194" y="134" width="14" height="8" rx="3" fill={highlight} />
          <rect x="184" y="150" width="28" height="4" fill={shadow} />

          <rect x="190" y="150" width="30" height="22" rx="6" fill={base} />
          <rect x="202" y="152" width="14" height="8" rx="3" fill={highlight} />
          <rect x="190" y="170" width="30" height="4" fill={shadow} />

          <rect x="188" y="170" width="26" height="22" rx="6" fill={base} />
          <rect x="198" y="172" width="12" height="8" rx="3" fill={highlight} />
          <rect x="188" y="190" width="26" height="4" fill={shadow} />
        </g>
      )}

      {/* ──────────────── 2. AFRO / PUFFS (👑) ──────────────── */}
      {hairStyle === 'afro' && (
        <g id="afro-puffs">
          {/* Left Afro Puff (Fluffy textured cloud crown) */}
          {/* Outline / base shadow */}
          <rect x="22" y="120" width="56" height="66" rx="20" fill={outline} />
          <rect x="26" y="124" width="48" height="58" rx="16" fill={base} />
          {/* Cloud bumps & highlights */}
          <rect x="28" y="128" width="20" height="16" rx="8" fill={highlight} />
          <rect x="42" y="122" width="24" height="18" rx="8" fill={highlight} />
          <rect x="26" y="146" width="16" height="20" rx="8" fill={shadow} />
          <rect x="52" y="152" width="20" height="22" rx="8" fill={shadow} />
          <rect x="32" y="168" width="36" height="12" rx="6" fill={shadow} />

          {/* Right Afro Puff (Fluffy textured cloud crown) */}
          <rect x="178" y="120" width="56" height="66" rx="20" fill={outline} />
          <rect x="182" y="124" width="48" height="58" rx="16" fill={base} />
          {/* Cloud bumps & highlights */}
          <rect x="190" y="122" width="24" height="18" rx="8" fill={highlight} />
          <rect x="208" y="128" width="20" height="16" rx="8" fill={highlight} />
          <rect x="184" y="152" width="20" height="22" rx="8" fill={shadow} />
          <rect x="214" y="146" width="16" height="20" rx="8" fill={shadow} />
          <rect x="188" y="168" width="36" height="12" rx="6" fill={shadow} />
        </g>
      )}

      {/* ──────────────── 3. SPIKY HAIR (⚡) ──────────────── */}
      {hairStyle === 'spiky' && (
        <g id="spiky-hair">
          {/* Forehead sharp spikes peeking below hood rim */}
          {/* Left spike */}
          <polygon points="90,86 102,86 96,116" fill={base} />
          <polygon points="90,86 96,86 94,112" fill={highlight} />
          <polygon points="96,86 102,86 96,116" fill={shadow} />

          {/* Mid-left spike */}
          <polygon points="108,82 124,82 116,124" fill={base} />
          <polygon points="108,82 116,82 114,120" fill={highlight} />
          <polygon points="116,82 124,82 116,124" fill={shadow} />

          {/* Center spike */}
          <polygon points="128,80 146,80 137,128" fill={base} />
          <polygon points="128,80 137,80 135,124" fill={highlight} />
          <polygon points="137,80 146,80 137,128" fill={shadow} />

          {/* Mid-right spike */}
          <polygon points="150,82 166,82 158,124" fill={base} />
          <polygon points="150,82 158,82 156,120" fill={highlight} />
          <polygon points="158,82 166,82 158,124" fill={shadow} />

          {/* Right spike */}
          <polygon points="170,86 182,86 176,116" fill={base} />
          <polygon points="170,86 176,86 174,112" fill={highlight} />
          <polygon points="176,86 182,86 176,116" fill={shadow} />

          {/* Cool side flare spikes sticking out beside the cheeks */}
          <polygon points="56,140 76,144 48,162" fill={base} />
          <polygon points="56,140 76,144 58,154" fill={highlight} />
          <polygon points="50,160 76,164 42,182" fill={base} />
          <polygon points="50,160 76,164 50,174" fill={highlight} />

          <polygon points="200,140 180,144 208,162" fill={base} />
          <polygon points="200,140 180,144 198,154" fill={highlight} />
          <polygon points="206,160 180,164 214,182" fill={base} />
          <polygon points="206,160 180,164 206,174" fill={highlight} />
        </g>
      )}

      {/* ──────────────── 4. BRAIDS / CORNROWS (🪢) ──────────────── */}
      {hairStyle === 'braids' && (
        <g id="braids-hair">
          {/* Left Woven Braid Plait */}
          <g>
            {/* Segment 1 */}
            <rect x="52" y="132" width="18" height="14" rx="4" fill={base} />
            <line x1="52" y1="134" x2="70" y2="144" stroke={highlight} strokeWidth="3" />
            <line x1="70" y1="134" x2="52" y2="144" stroke={shadow} strokeWidth="2" />

            {/* Segment 2 */}
            <rect x="50" y="144" width="20" height="16" rx="4" fill={base} />
            <line x1="50" y1="146" x2="70" y2="158" stroke={highlight} strokeWidth="3" />
            <line x1="70" y1="146" x2="50" y2="158" stroke={shadow} strokeWidth="2" />

            {/* Segment 3 */}
            <rect x="50" y="158" width="20" height="16" rx="4" fill={base} />
            <line x1="50" y1="160" x2="70" y2="172" stroke={highlight} strokeWidth="3" />
            <line x1="70" y1="160" x2="50" y2="172" stroke={shadow} strokeWidth="2" />

            {/* Segment 4 */}
            <rect x="52" y="172" width="18" height="16" rx="4" fill={base} />
            <line x1="52" y1="174" x2="70" y2="186" stroke={highlight} strokeWidth="3" />
            <line x1="70" y1="174" x2="52" y2="186" stroke={shadow} strokeWidth="2" />

            {/* Segment 5 */}
            <rect x="54" y="186" width="16" height="16" rx="4" fill={base} />
            <line x1="54" y1="188" x2="70" y2="200" stroke={highlight} strokeWidth="3" />
            <line x1="70" y1="188" x2="54" y2="200" stroke={shadow} strokeWidth="2" />

            {/* Golden Braid Bead Tie */}
            <rect x="50" y="200" width="20" height="12" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="54" y="202" width="6" height="4" fill="#fef08a" />

            {/* Tassel tip */}
            <polygon points="56,212 64,212 60,226" fill={base} />
          </g>

          {/* Right Woven Braid Plait */}
          <g>
            {/* Segment 1 */}
            <rect x="186" y="132" width="18" height="14" rx="4" fill={base} />
            <line x1="186" y1="134" x2="204" y2="144" stroke={highlight} strokeWidth="3" />
            <line x1="204" y1="134" x2="186" y2="144" stroke={shadow} strokeWidth="2" />

            {/* Segment 2 */}
            <rect x="186" y="144" width="20" height="16" rx="4" fill={base} />
            <line x1="186" y1="146" x2="206" y2="158" stroke={highlight} strokeWidth="3" />
            <line x1="206" y1="146" x2="186" y2="158" stroke={shadow} strokeWidth="2" />

            {/* Segment 3 */}
            <rect x="186" y="158" width="20" height="16" rx="4" fill={base} />
            <line x1="186" y1="160" x2="206" y2="172" stroke={highlight} strokeWidth="3" />
            <line x1="206" y1="160" x2="186" y2="172" stroke={shadow} strokeWidth="2" />

            {/* Segment 4 */}
            <rect x="186" y="172" width="18" height="16" rx="4" fill={base} />
            <line x1="186" y1="174" x2="204" y2="186" stroke={highlight} strokeWidth="3" />
            <line x1="204" y1="174" x2="186" y2="186" stroke={shadow} strokeWidth="2" />

            {/* Segment 5 */}
            <rect x="186" y="186" width="16" height="16" rx="4" fill={base} />
            <line x1="186" y1="188" x2="202" y2="200" stroke={highlight} strokeWidth="3" />
            <line x1="202" y1="188" x2="186" y2="200" stroke={shadow} strokeWidth="2" />

            {/* Golden Braid Bead Tie */}
            <rect x="186" y="200" width="20" height="12" rx="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="190" y="202" width="6" height="4" fill="#fef08a" />

            {/* Tassel tip */}
            <polygon points="192,212 200,212 196,226" fill={base} />
          </g>
        </g>
      )}

      {/* ──────────────── 5. HIGH PONYTAIL / BUN (🐎) ──────────────── */}
      {hairStyle === 'ponytail' && (
        <g id="ponytail-hair">
          {/* Cute Hair Tie / Scrunchie */}
          <rect x="182" y="82" width="18" height="18" rx="6" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
          <circle cx="191" cy="91" r="3" fill="#fda4af" />

          {/* Sweeping Ponytail plume curving out and downwards */}
          <path
            d="M 194 88 C 220 70, 246 95, 238 132 C 234 150, 218 162, 210 168 C 218 152, 222 136, 216 118 C 210 102, 196 98, 194 88 Z"
            fill={base}
            stroke={outline}
            strokeWidth="2.5"
          />
          {/* Ponytail highlight plume */}
          <path
            d="M 200 86 C 220 76, 236 96, 232 120 C 228 106, 216 94, 200 86 Z"
            fill={highlight}
          />
          {/* Ponytail underside shadow */}
          <path
            d="M 216 118 C 222 136, 218 152, 210 168 C 216 156, 222 140, 216 118 Z"
            fill={shadow}
          />
        </g>
      )}

      {/* ──────────────── 6. SLEEK BOB / BANGS (🎀) ──────────────── */}
      {hairStyle === 'bob' && (
        <g id="bob-hair">
          {/* Sleek straight fringe across forehead */}
          <rect x="88" y="88" width="80" height="24" rx="4" fill={base} />
          <rect x="92" y="90" width="72" height="6" fill={highlight} />
          <rect x="88" y="108" width="80" height="4" fill={shadow} />

          {/* Sleek straight left side framing cheek */}
          <rect x="54" y="116" width="26" height="74" rx="8" fill={base} />
          <rect x="58" y="120" width="10" height="50" rx="4" fill={highlight} />
          <rect x="54" y="184" width="26" height="6" rx="3" fill={shadow} />

          {/* Sleek straight right side framing cheek */}
          <rect x="176" y="116" width="26" height="74" rx="8" fill={base} />
          <rect x="188" y="120" width="10" height="50" rx="4" fill={highlight} />
          <rect x="176" y="184" width="26" height="6" rx="3" fill={shadow} />
        </g>
      )}
    </svg>
  );
};
