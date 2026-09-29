import React from 'react';
import { AppTheme } from '../data/themesData';
import { AACItem } from '../types';

interface AACTileArtProps {
  theme: AppTheme;
  colorType: AACItem['colorType'];
  label: string;
}

// ─── COLOUR-TYPE tint palette (keeps Fitzgerald contrast legible) ────────────
const tintByColor: Record<string, { bg: string; border: string; text: string }> = {
  subject:   { bg: '#fef3c7', border: '#fbbf24', text: '#78350f' },
  verb:      { bg: '#d1fae5', border: '#34d399', text: '#064e3b' },
  noun:      { bg: '#ffedd5', border: '#fb923c', text: '#7c2d12' },
  adjective: { bg: '#e0f2fe', border: '#38bdf8', text: '#0c4a6e' },
  social:    { bg: '#ede9fe', border: '#a78bfa', text: '#3b0764' },
  emergency: { bg: '#ffe4e6', border: '#fb7185', text: '#881337' },
  _default:  { bg: '#f1f5f9', border: '#94a3b8', text: '#0f172a' },
};

function getTint(colorType: string) {
  return tintByColor[colorType] ?? tintByColor['_default'];
}

// ────────────────────────────────────────────────────────────────────────────
// THEME ART SVGs
// Each returns an <svg> or <g> fragment (absolute-positioned behind content)
// ────────────────────────────────────────────────────────────────────────────

const TurtleArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Underwater gradient */}
      <defs>
        <linearGradient id={`tg-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} stopOpacity="1" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.7" />
        </linearGradient>
        <pattern id={`hex-${colorType}`} x="0" y="0" width="18" height="21" patternUnits="userSpaceOnUse">
          {/* Hexagon shell cell */}
          <polygon points="9,1 17,5.5 17,15.5 9,20 1,15.5 1,5.5"
            fill="none" stroke={border} strokeWidth="1.2" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#tg-${colorType})`} />
      <rect width="100" height="100" fill={`url(#hex-${colorType})`} />
      {/* Mini swimming turtle */}
      <g transform="translate(62,18) rotate(-12)">
        <ellipse cx="0" cy="0" rx="9" ry="6" fill="#059669" opacity="0.55" />
        <circle cx="0" cy="-4" r="3.5" fill="#047857" opacity="0.55" />
        <ellipse cx="-8" cy="1" rx="3" ry="1.5" fill="#059669" opacity="0.4" transform="rotate(-20)" />
        <ellipse cx="8" cy="1" rx="3" ry="1.5" fill="#059669" opacity="0.4" transform="rotate(20)" />
      </g>
      {/* Seagrass */}
      <path d="M8,100 Q10,80 7,65 Q9,50 8,35" stroke="#34d399" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M12,100 Q15,82 13,68 Q16,55 14,42" stroke="#6ee7b7" strokeWidth="1.2" fill="none" opacity="0.35" />
      {/* Bubble */}
      <circle cx="88" cy="72" r="3" fill="none" stroke="#a7f3d0" strokeWidth="1" opacity="0.5" />
      <circle cx="82" cy="55" r="2" fill="none" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.45" />
    </svg>
  );
};

const DinoArt: React.FC<{ colorType: string; label: string }> = ({ colorType, label }) => {
  const { bg, border } = getTint(colorType);
  // Pick dino silhouette based on word role
  const isVerb = colorType === 'verb';
  const isSubject = colorType === 'subject';
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`dg-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#dg-${colorType})`} />

      {/* Fossil circle texture */}
      <circle cx="75" cy="20" r="12" fill="none" stroke={border} strokeWidth="1" opacity="0.25" />
      <circle cx="75" cy="20" r="7" fill="none" stroke={border} strokeWidth="0.8" opacity="0.2" />
      <circle cx="75" cy="20" r="3" fill={border} opacity="0.18" />

      {/* Fern frond top-left */}
      <path d="M5,25 Q8,15 12,20 Q9,12 14,16" stroke="#86efac" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M5,25 Q3,15 7,20 Q4,12 8,16" stroke="#86efac" strokeWidth="1.2" fill="none" opacity="0.4" />

      {/* T-Rex silhouette (verbs/actions) or footprint (others) */}
      {isVerb ? (
        // Simplified T-Rex
        <g transform="translate(18,55) scale(0.75)" opacity="0.42">
          <path d="M10,30 Q10,15 22,12 Q30,10 32,18 Q34,10 40,15 Q38,22 32,22 Q36,30 30,38 Q24,45 18,40 Q8,45 6,38 Z"
            fill="#a16207" />
          <circle cx="34" cy="14" r="3" fill="#a16207" />
          {/* tiny teeth */}
          <path d="M30,22 L32,25 L34,22" fill="#fef9c3" opacity="0.8" />
        </g>
      ) : isSubject ? (
        // Brontosaurus silhouette
        <g transform="translate(8,60) scale(0.7)" opacity="0.38">
          <ellipse cx="28" cy="20" rx="22" ry="10" fill="#a16207" />
          {/* long neck */}
          <path d="M48,20 Q58,10 55,2 Q52,-2 50,2 Q48,8 45,15" fill="#a16207" stroke="#a16207" strokeWidth="6" strokeLinecap="round" />
          {/* legs */}
          <rect x="14" y="28" width="5" height="12" rx="2" fill="#92400e" />
          <rect x="28" y="28" width="5" height="12" rx="2" fill="#92400e" />
        </g>
      ) : (
        // Three-toed footprint
        <g transform="translate(22,58)" opacity="0.3">
          <ellipse cx="14" cy="14" rx="9" ry="11" fill="#a16207" />
          <ellipse cx="14" cy="4" rx="3" ry="5" fill="#a16207" />
          <ellipse cx="5" cy="8" rx="3" ry="5" fill="#a16207" transform="rotate(-25,5,8)" />
          <ellipse cx="23" cy="8" rx="3" ry="5" fill="#a16207" transform="rotate(25,23,8)" />
        </g>
      )}

      {/* Pterodactyl silhouette top-right */}
      <g transform="translate(70,10) scale(0.5)" opacity="0.25">
        <path d="M0,15 Q10,5 20,0 Q15,10 25,12 Q15,14 20,22 Q10,18 0,25 Q5,18 0,15 Z" fill="#92400e" />
      </g>
    </svg>
  );
};

const FrogArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`fg-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#fg-${colorType})`} />
      {/* Lily pad */}
      <circle cx="68" cy="72" r="18" fill="#16a34a" opacity="0.25" />
      <path d="M68,72 L68,54" stroke="#15803d" strokeWidth="1.2" opacity="0.3" />
      {/* Ripple rings */}
      <circle cx="68" cy="72" r="22" fill="none" stroke={border} strokeWidth="0.8" opacity="0.2" />
      <circle cx="68" cy="72" r="28" fill="none" stroke={border} strokeWidth="0.6" opacity="0.15" />
      {/* Small lotus flower */}
      <circle cx="68" cy="60" r="4" fill="#f9a8d4" opacity="0.5" />
      <circle cx="64" cy="63" r="3" fill="#f9a8d4" opacity="0.4" />
      <circle cx="72" cy="63" r="3" fill="#f9a8d4" opacity="0.4" />
      {/* Small frog silhouette */}
      <g transform="translate(10,60) scale(0.6)" opacity="0.35">
        <ellipse cx="20" cy="18" rx="14" ry="10" fill="#16a34a" />
        <circle cx="10" cy="12" r="5" fill="#15803d" />
        <circle cx="30" cy="12" r="5" fill="#15803d" />
        <circle cx="10" cy="11" r="2.5" fill="#f0fdf4" />
        <circle cx="30" cy="11" r="2.5" fill="#f0fdf4" />
        {/* Legs */}
        <path d="M6,24 Q0,30 4,36 Q10,32 12,26" fill="#16a34a" />
        <path d="M34,24 Q40,30 36,36 Q30,32 28,26" fill="#16a34a" />
      </g>
      {/* Water drip lines */}
      <circle cx="15" cy="18" r="2.5" fill="none" stroke={border} strokeWidth="0.8" opacity="0.3" />
      <circle cx="20" cy="28" r="1.5" fill="none" stroke={border} strokeWidth="0.7" opacity="0.25" />
    </svg>
  );
};

const SpaceArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`sg-${colorType}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#sg-${colorType})`} />
      {/* Stars */}
      {[[12,18],[40,8],[75,14],[88,40],[22,55],[55,35],[90,70],[10,80],[65,88],[35,78],[80,25]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.4 + (i % 4) * 0.1} />
      ))}
      {/* 4-point star */}
      <path d="M50,12 L51.5,17 L56,17 L52.5,20 L54,25 L50,22 L46,25 L47.5,20 L44,17 L48.5,17 Z"
        fill="#fde68a" opacity="0.5" transform="translate(25,5) scale(0.7)" />
      {/* Saturn */}
      <g transform="translate(70,22)">
        <ellipse cx="0" cy="0" rx="10" ry="7" fill={border} opacity="0.35" />
        <ellipse cx="0" cy="0" rx="15" ry="4" fill="none" stroke={border} strokeWidth="1.5" opacity="0.4" />
      </g>
      {/* Rocket */}
      <g transform="translate(12,60) rotate(-30) scale(0.55)" opacity="0.5">
        <path d="M10,30 Q10,10 20,0 Q30,10 30,30 Z" fill="#e2e8f0" />
        <rect x="14" y="25" width="12" height="8" rx="2" fill="#94a3b8" />
        <path d="M10,30 L5,40 L14,35 Z" fill="#fb923c" />
        <path d="M30,30 L35,40 L26,35 Z" fill="#fb923c" />
        <circle cx="20" cy="14" r="4" fill="#7dd3fc" opacity="0.8" />
      </g>
      {/* Nebula cloud */}
      <ellipse cx="55" cy="75" rx="22" ry="10" fill={border} opacity="0.08" />
    </svg>
  );
};

const TrainArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`tng-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.5" />
        </linearGradient>
        {/* Wood plank pattern */}
        <pattern id={`plank-${colorType}`} x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
          <rect width="20" height="12" fill={bg} />
          <rect width="20" height="1" y="11" fill={border} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#tng-${colorType})`} />
      <rect width="100" height="100" fill={`url(#plank-${colorType})`} />
      {/* Rail tracks at bottom */}
      <rect x="0" y="82" width="100" height="3" rx="1.5" fill="#78716c" opacity="0.35" />
      <rect x="0" y="88" width="100" height="3" rx="1.5" fill="#78716c" opacity="0.35" />
      {[5,20,35,50,65,80,95].map((x, i) => (
        <rect key={i} x={x-3} y="80" width="6" height="14" rx="1" fill="#a8a29e" opacity="0.3" />
      ))}
      {/* Mini train engine */}
      <g transform="translate(12,55) scale(0.65)" opacity="0.5">
        <rect x="0" y="10" width="40" height="22" rx="4" fill="#dc2626" />
        <rect x="30" y="4" width="14" height="18" rx="3" fill="#b91c1c" />
        <rect x="32" y="0" width="6" height="8" rx="3" fill="#6b7280" />
        {/* wheels */}
        <circle cx="10" cy="32" r="6" fill="#374151" />
        <circle cx="30" cy="32" r="6" fill="#374151" />
        <circle cx="10" cy="32" r="3" fill="#6b7280" />
        <circle cx="30" cy="32" r="3" fill="#6b7280" />
        {/* window */}
        <rect x="4" y="14" width="12" height="10" rx="2" fill="#bfdbfe" opacity="0.8" />
      </g>
      {/* Steam puffs */}
      <circle cx="30" cy="35" r="4" fill="white" opacity="0.35" />
      <circle cx="37" cy="28" r="5" fill="white" opacity="0.25" />
      <circle cx="46" cy="24" r="6" fill="white" opacity="0.18" />
    </svg>
  );
};

const OceanArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`og-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#og-${colorType})`} />
      {/* Wave lines */}
      <path d="M0,65 Q25,58 50,65 Q75,72 100,65" stroke={border} strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M0,75 Q25,68 50,75 Q75,82 100,75" stroke={border} strokeWidth="1.2" fill="none" opacity="0.25" />
      {/* Dolphin silhouette */}
      <g transform="translate(55,32) rotate(20) scale(0.8)" opacity="0.35">
        <path d="M0,10 Q15,0 30,5 Q38,8 35,18 Q30,25 18,22 Q8,22 0,15 Z" fill="#0369a1" />
        <path d="M30,5 Q40,0 45,8 Q40,12 35,18" fill="#0369a1" />
        <path d="M0,15 Q-5,20 0,28 Q5,22 0,15 Z" fill="#0369a1" />
      </g>
      {/* Bubbles */}
      {[[15,40],[20,55],[80,48],[85,30],[30,25]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%2===0?2.5:1.8} fill="none" stroke={border} strokeWidth="0.8" opacity="0.35" />
      ))}
      {/* Starfish */}
      <g transform="translate(75,78) scale(0.6)" opacity="0.35">
        <path d="M10,0 L12,8 L20,8 L14,13 L16,21 L10,16 L4,21 L6,13 L0,8 L8,8 Z" fill="#fb923c" />
      </g>
    </svg>
  );
};

const NatureArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ng-${colorType}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#ng-${colorType})`} />
      {/* Monstera leaf */}
      <g transform="translate(55,15) scale(0.8)" opacity="0.3">
        <path d="M20,0 Q35,5 40,20 Q45,35 35,45 Q25,50 15,42 Q5,35 8,20 Q10,8 20,0 Z" fill="#16a34a" />
        <path d="M20,0 L20,50" stroke="#dcfce7" strokeWidth="1.5" opacity="0.6" />
        <path d="M10,15 Q20,12 32,18" stroke="#dcfce7" strokeWidth="1" opacity="0.5" fill="none" />
        <path d="M8,28 Q20,24 36,30" stroke="#dcfce7" strokeWidth="1" opacity="0.5" fill="none" />
        {/* Leaf cutouts */}
        <ellipse cx="13" cy="22" rx="4" ry="6" fill={bg} opacity="0.7" transform="rotate(-20,13,22)" />
        <ellipse cx="28" cy="22" rx="4" ry="6" fill={bg} opacity="0.7" transform="rotate(20,28,22)" />
      </g>
      {/* Small flowers */}
      {[[12,70],[20,80],[30,72]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle cx="0" cy="0" r="3" fill="#fde68a" opacity="0.5" />
          {[0,60,120,180,240,300].map((deg,j) => (
            <ellipse key={j} cx={Math.cos(deg*Math.PI/180)*5} cy={Math.sin(deg*Math.PI/180)*5}
              rx="2.5" ry="1.8" fill={border} opacity="0.4" transform={`rotate(${deg})`} />
          ))}
        </g>
      ))}
      {/* Stem */}
      <path d="M5,100 Q8,80 12,70" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
};

const SparkleArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`spg-${colorType}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor="#fae8ff" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#spg-${colorType})`} />
      {/* 4-point sparkle stars */}
      {[[15,20,8],[80,15,6],[55,65,10],[20,75,7],[88,70,5],[45,30,5]].map(([x,y,s],i) => (
        <path key={i}
          d={`M${x},${y-s} L${x+s*0.3},${y-s*0.3} L${x+s},${y} L${x+s*0.3},${y+s*0.3} L${x},${y+s} L${x-s*0.3},${y+s*0.3} L${x-s},${y} L${x-s*0.3},${y-s*0.3} Z`}
          fill={border} opacity={0.25 + i * 0.05} />
      ))}
      {/* Music notes */}
      <g transform="translate(62,48) scale(0.6)" opacity="0.3">
        <path d="M0,20 Q0,5 10,0 L10,15 Q10,28 0,28 Z" fill={border} />
        <rect x="10" y="0" width="2" height="18" fill={border} />
        <ellipse cx="20" cy="20" rx="6" ry="4" fill={border} />
        <path d="M20,20 Q20,5 30,0 L30,15 Q30,28 20,28 Z" fill={border} />
        <rect x="30" y="0" width="2" height="18" fill={border} />
        <rect x="10" y="0" width="22" height="2" fill={border} />
      </g>
      {/* Rainbow arc */}
      {[10,8,6].map((r, i) => (
        <path key={i}
          d={`M5,${80+i*4} Q50,${30+i*6} 95,${80+i*4}`}
          fill="none" stroke={['#f87171','#fb923c','#fbbf24'][i]} strokeWidth="2.5" opacity={0.18-i*0.02} />
      ))}
    </svg>
  );
};

const DefaultArt: React.FC<{ colorType: string }> = ({ colorType }) => {
  const { bg, border } = getTint(colorType);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`def-${colorType}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={bg} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#def-${colorType})`} />
      {/* Subtle dot grid */}
      {[15,35,55,75,95].flatMap((x, xi) =>
        [15,35,55,75,95].map((y, yi) => (
          <circle key={`${xi}-${yi}`} cx={x} cy={y} r="1.2" fill={border} opacity="0.2" />
        ))
      )}
    </svg>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ────────────────────────────────────────────────────────────────────────────

export const AACTileArt: React.FC<AACTileArtProps> = ({ theme, colorType, label }) => {
  const cat = theme.category;

  switch (cat) {
    case 'turtle':
      return <TurtleArt colorType={colorType} />;
    case 'dinosaur':
      return <DinoArt colorType={colorType} label={label} />;
    case 'frog':
      return <FrogArt colorType={colorType} />;
    case 'space':
      return <SpaceArt colorType={colorType} />;
    case 'train':
      return <TrainArt colorType={colorType} />;
    case 'ocean':
      return <OceanArt colorType={colorType} />;
    case 'nature':
    case 'fantasy':
      return <NatureArt colorType={colorType} />;
    case 'lofi':
    case 'skate':
    case 'racing':
      return <SparkleArt colorType={colorType} />;
    case 'classic':
    case 'minimal':
    case 'executive':
    default:
      return <DefaultArt colorType={colorType} />;
  }
};
