/**
 * ThemedEmotionFace — Custom SVG emotion faces adapted to the active theme.
 *
 * In classic mode: a round smiley-style face with distinct expressions.
 * With a theme active: the same face wears a themed hat / accessory or
 * transforms into the theme's character (dino head, turtle shell, frog face, etc.)
 *
 * Supported emotions: happy, calm, excited, tired, worried, sad, angry,
 *   frustrated, overwhelmed, scared, confused
 */
import React from 'react';
import { AppTheme } from '../data/themesData';

export type EmotionId =
  | 'happy' | 'calm' | 'excited' | 'tired' | 'worried'
  | 'sad' | 'angry' | 'frustrated' | 'overwhelmed' | 'scared' | 'confused';

interface ThemedEmotionFaceProps {
  emotionId: EmotionId | string;
  theme?: AppTheme | null;
  /** CSS size class pair e.g. "w-12 h-12" */
  className?: string;
}

// ─── Shared SVG wrapper ────────────────────────────────────────────────────────
const Face: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={label} role="img">
    {label && <title>{label}</title>}
    {children}
  </svg>
);

// ─── Expression parts (reusable) ──────────────────────────────────────────────

// Mouth shapes
const MouthHappy = () => <path d="M22 40 Q32 50 42 40" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
const MouthSmile = () => <path d="M24 39 Q32 45 40 39" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
const MouthBig = () => (
  <>
    <path d="M20 38 Q32 52 44 38" fill="#dc2626" />
    <path d="M20 38 Q32 52 44 38" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
  </>
);
const MouthFlat = () => <path d="M24 40 L40 40" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />;
const MouthSad = () => <path d="M22 44 Q32 36 42 44" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
const MouthFrown = () => <path d="M20 46 Q32 36 44 46" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />;
const MouthAngry = () => (
  <path d="M22 44 Q32 38 42 44" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
);
const MouthWobbly = () => (
  <path d="M22 42 Q26 38 30 42 Q34 46 38 42 Q40 40 42 42" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
);

// Eye shapes
const EyesNormal = ({ y = 26 }: { y?: number }) => (
  <>
    <circle cx="24" cy={y} r="3.5" fill="#1e293b" />
    <circle cx="40" cy={y} r="3.5" fill="#1e293b" />
    <circle cx="25.5" cy={y - 1.5} r="1.2" fill="white" />
    <circle cx="41.5" cy={y - 1.5} r="1.2" fill="white" />
  </>
);
const EyesHappy = () => (
  <>
    <path d="M20 25 Q24 21 28 25" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M36 25 Q40 21 44 25" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </>
);
const EyesClosed = () => (
  <>
    <path d="M21 26 Q24 30 27 26" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M37 26 Q40 30 43 26" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </>
);
const EyesStars = () => (
  <>
    {[24, 40].map((cx, i) => (
      <g key={i}>
        <path d={`M${cx} ${22} L${cx + 1} ${25} L${cx + 3.5} ${25} L${cx + 1.5} ${27} L${cx + 2.5} ${30} L${cx} ${28} L${cx - 2.5} ${30} L${cx - 1.5} ${27} L${cx - 3.5} ${25} L${cx - 1} ${25} Z`}
          fill="#fbbf24" />
      </g>
    ))}
  </>
);
const EyesTired = () => (
  <>
    <circle cx="24" cy="27" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="27" r="3.5" fill="#1e293b" />
    <path d="M20 25 Q24 22 28 25" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M36 25 Q40 22 44 25" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
  </>
);
const EyesWorried = () => (
  <>
    <circle cx="24" cy="27" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="27" r="3.5" fill="#1e293b" />
    {/* Furrowed brow */}
    <path d="M20 22 Q24 18 28 20" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M36 20 Q40 18 44 22" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </>
);
const EyesSad = () => (
  <>
    <circle cx="24" cy="28" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="28" r="3.5" fill="#1e293b" />
    {/* Teardrop */}
    <path d="M26 32 Q27 38 25 40 Q23 38 26 32 Z" fill="#60a5fa" />
  </>
);
const EyesAngry = () => (
  <>
    <circle cx="24" cy="28" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="28" r="3.5" fill="#1e293b" />
    {/* Angry brow slash */}
    <path d="M20 22 Q24 25 28 22" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M36 22 Q40 25 44 22" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
  </>
);
const EyesOverwhelmed = () => (
  <>
    <circle cx="24" cy="27" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="27" r="3.5" fill="#1e293b" />
    {/* Spiral swirl on one eye */}
    <path d="M24 24 Q27 24 27 27 Q27 30 24 30 Q22 30 22 28 Q22 27 23 27" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>
);
const EyesScared = () => (
  <>
    <circle cx="24" cy="26" r="5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="40" cy="26" r="5" fill="white" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="24" cy="27" r="2.5" fill="#1e293b" />
    <circle cx="40" cy="27" r="2.5" fill="#1e293b" />
  </>
);
const EyesConfused = () => (
  <>
    <circle cx="24" cy="27" r="3.5" fill="#1e293b" />
    <circle cx="40" cy="27" r="3.5" fill="#1e293b" />
    {/* One raised brow */}
    <path d="M36 21 Q40 18 44 21" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Question swirl */}
    <text x="43" y="18" fontSize="8" fill="#f59e0b" fontWeight="bold" fontFamily="sans-serif">?</text>
  </>
);

// Cheek blush
const Blush = ({ color = '#fca5a5' }: { color?: string }) => (
  <>
    <ellipse cx="18" cy="36" rx="5" ry="3" fill={color} opacity="0.5" />
    <ellipse cx="46" cy="36" rx="5" ry="3" fill={color} opacity="0.5" />
  </>
);

// ─── THEME HATS / CHARACTER OVERLAYS ─────────────────────────────────────────

// Dino hat — little dino crest/spikes on top of the head
const DinoHat = () => (
  <g>
    {/* Spikes */}
    <path d="M22 14 Q23 6 24 10 Q25 4 26 10 Q27 6 28 10 Q30 4 32 10 Q34 6 36 10 Q37 6 38 14"
      fill="#16a34a" stroke="#14532d" strokeWidth="1" />
    {/* Band */}
    <rect x="18" y="13" width="28" height="5" rx="2.5" fill="#15803d" opacity="0.6" />
  </g>
);

// Turtle hat — shell dome on head
const TurtleHat = () => (
  <g>
    {/* Shell dome */}
    <path d="M18 16 Q32 4 46 16 Q46 22 32 22 Q18 22 18 16 Z" fill="#059669" />
    {/* Hex pattern */}
    <path d="M32 6 Q38 8 42 14 Q38 14 32 14 Q26 14 22 14 Q26 8 32 6 Z" fill="#047857" opacity="0.4" />
    <path d="M26 14 Q32 10 38 14" stroke="#d1fae5" strokeWidth="1" fill="none" opacity="0.5" />
    {/* Rim */}
    <path d="M18 16 Q32 20 46 16" stroke="#065f46" strokeWidth="1.5" fill="none" />
  </g>
);

// Frog hat — lily pad with flower
const FrogHat = () => (
  <g>
    {/* Lily pad */}
    <ellipse cx="32" cy="14" rx="16" ry="8" fill="#16a34a" />
    <path d="M32 14 L32 6" stroke="#15803d" strokeWidth="1.5" opacity="0.5" />
    {/* Flower */}
    <circle cx="32" cy="7" r="4" fill="#f9a8d4" />
    {[0,60,120,180,240,300].map((d,i) => (
      <ellipse key={i} cx={32+Math.cos(d*Math.PI/180)*5.5} cy={7+Math.sin(d*Math.PI/180)*5.5}
        rx="2.5" ry="2" fill="#fda4af" transform={`rotate(${d},${32+Math.cos(d*Math.PI/180)*5.5},${7+Math.sin(d*Math.PI/180)*5.5})`} />
    ))}
  </g>
);

// Space helmet — astronaut bubble
const SpaceHelmet = () => (
  <g>
    {/* Helmet rim */}
    <ellipse cx="32" cy="32" rx="20" ry="22" fill="none" stroke="#6d28d9" strokeWidth="3" opacity="0.5" />
    {/* Visor tint */}
    <path d="M18 20 Q32 14 46 20 Q48 28 32 30 Q16 28 18 20 Z" fill="#6d28d9" opacity="0.12" />
    {/* Stars through visor */}
    <circle cx="28" cy="18" r="1" fill="#fbbf24" opacity="0.6" />
    <circle cx="38" cy="16" r="0.8" fill="white" opacity="0.6" />
    <circle cx="34" cy="22" r="1" fill="white" opacity="0.5" />
    {/* Side bolts */}
    <circle cx="13" cy="30" r="2.5" fill="#8b5cf6" />
    <circle cx="51" cy="30" r="2.5" fill="#8b5cf6" />
  </g>
);

// Train conductor hat
const TrainHat = () => (
  <g>
    {/* Brim */}
    <rect x="14" y="18" width="36" height="4" rx="2" fill="#1e293b" />
    {/* Body */}
    <rect x="18" y="6" width="28" height="14" rx="4" fill="#dc2626" />
    {/* Stripe */}
    <rect x="18" y="14" width="28" height="3" fill="#fbbf24" opacity="0.8" />
    {/* Badge */}
    <circle cx="32" cy="11" r="4" fill="#fbbf24" />
    <text x="32" y="14" textAnchor="middle" fontSize="6" fill="#1e293b" fontWeight="bold" fontFamily="sans-serif">🚂</text>
  </g>
);

// Ocean hat — sailor cap with anchor
const OceanHat = () => (
  <g>
    {/* Brim */}
    <ellipse cx="32" cy="18" rx="18" ry="4" fill="#0ea5e9" />
    {/* Crown */}
    <path d="M14 18 Q14 8 32 8 Q50 8 50 18 Z" fill="#0284c7" />
    <path d="M14 18 Q14 8 32 8 Q50 8 50 18" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity="0.5" />
    {/* Anchor emblem */}
    <path d="M32 10 L32 16 M29 12 L35 12 M29 16 Q28 18 29 20 M35 16 Q36 18 35 20 M28 20 Q32 22 36 20"
      stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </g>
);

// Classic: no hat, just the base face
const NoHat = () => null;

// ─── FACE BASE ────────────────────────────────────────────────────────────────

interface FaceBaseProps {
  fill: string;
  stroke: string;
  eyes: React.ReactNode;
  mouth: React.ReactNode;
  extras?: React.ReactNode;
  hat: React.ReactNode;
  blushColor?: string;
  showBlush?: boolean;
}

const FaceBase: React.FC<FaceBaseProps> = ({ fill, stroke, eyes, mouth, extras, hat, blushColor, showBlush }) => (
  <>
    {/* Face circle */}
    <circle cx="32" cy="34" r="22" fill={fill} />
    <circle cx="32" cy="34" r="22" fill="none" stroke={stroke} strokeWidth="2" />
    {/* Shine */}
    <ellipse cx="25" cy="26" rx="5" ry="3.5" fill="white" opacity="0.25" transform="rotate(-20,25,26)" />
    {/* Eyes */}
    {eyes}
    {/* Blush */}
    {showBlush && <Blush color={blushColor} />}
    {/* Mouth */}
    {mouth}
    {/* Extras (tears, sweat, etc.) */}
    {extras}
    {/* Hat on top */}
    {hat}
  </>
);

// ─── THEME → hat selector ─────────────────────────────────────────────────────
function getHat(cat?: string) {
  switch (cat) {
    case 'dinosaur': return <DinoHat />;
    case 'turtle':   return <TurtleHat />;
    case 'frog':     return <FrogHat />;
    case 'space':    return <SpaceHelmet />;
    case 'train':    return <TrainHat />;
    case 'ocean':    return <OceanHat />;
    default:         return <NoHat />;
  }
}

// ─── EMOTION → face data ──────────────────────────────────────────────────────
interface EmotionFaceData {
  fill: string;
  stroke: string;
  eyes: React.ReactNode;
  mouth: React.ReactNode;
  extras?: React.ReactNode;
  showBlush?: boolean;
  blushColor?: string;
}

function getEmotionFace(id: string): EmotionFaceData {
  switch (id) {
    case 'happy':
      return {
        fill: '#fde68a',
        stroke: '#f59e0b',
        eyes: <EyesHappy />,
        mouth: <MouthHappy />,
        showBlush: true,
        blushColor: '#fca5a5',
      };
    case 'calm':
      return {
        fill: '#bfdbfe',
        stroke: '#60a5fa',
        eyes: <EyesClosed />,
        mouth: <MouthSmile />,
        showBlush: true,
        blushColor: '#a5f3fc',
      };
    case 'excited':
      return {
        fill: '#fcd34d',
        stroke: '#f59e0b',
        eyes: <EyesStars />,
        mouth: <MouthBig />,
        showBlush: true,
        blushColor: '#fca5a5',
        extras: (
          <>
            {/* Sparks */}
            {[[10,14],[54,12],[10,54],[54,52]].map(([x,y],i) => (
              <path key={i}
                d={`M${x} ${y} L${x+2} ${y-4} L${x+4} ${y} L${x} ${y+2} Z`}
                fill="#fbbf24" opacity="0.7" />
            ))}
          </>
        ),
      };
    case 'tired':
      return {
        fill: '#e2e8f0',
        stroke: '#94a3b8',
        eyes: <EyesTired />,
        mouth: <MouthFlat />,
        extras: (
          <text x="44" y="22" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">z</text>
        ),
      };
    case 'worried':
      return {
        fill: '#fef3c7',
        stroke: '#f59e0b',
        eyes: <EyesWorried />,
        mouth: <MouthWobbly />,
        extras: (
          <>
            {/* Sweat drop */}
            <path d="M46 30 Q48 34 46 36 Q44 34 46 30 Z" fill="#60a5fa" opacity="0.7" />
          </>
        ),
      };
    case 'sad':
      return {
        fill: '#dbeafe',
        stroke: '#3b82f6',
        eyes: <EyesSad />,
        mouth: <MouthSad />,
        extras: (
          <path d="M40 34 Q41 40 40 42 Q38 40 40 34 Z" fill="#60a5fa" opacity="0.7" />
        ),
      };
    case 'angry':
      return {
        fill: '#fecaca',
        stroke: '#ef4444',
        eyes: <EyesAngry />,
        mouth: <MouthAngry />,
        extras: (
          <>
            {/* Steam lines */}
            <path d="M10 20 Q12 16 14 20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M50 20 Q52 16 54 20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        ),
      };
    case 'frustrated':
      return {
        fill: '#f5d0fe',
        stroke: '#c026d3',
        eyes: <EyesAngry />,
        mouth: <MouthFrown />,
        extras: (
          <>
            {/* Zig-zag scribble on forehead = frustration */}
            <path d="M22 22 L26 18 L30 22 L34 18 L38 22 L42 18" stroke="#c026d3" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ),
      };
    case 'overwhelmed':
      return {
        fill: '#ddd6fe',
        stroke: '#7c3aed',
        eyes: <EyesOverwhelmed />,
        mouth: <MouthWobbly />,
        extras: (
          <>
            {/* Chaos lines around head */}
            {[[6,18],[58,18],[6,50],[58,50]].map(([x,y],i) => (
              <path key={i}
                d={`M${x} ${y} L${x + (i < 2 ? 6 : -6)} ${y - 4} L${x + (i < 2 ? 3 : -3)} ${y}`}
                stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />
            ))}
            {/* Storm cloud top */}
            <path d="M24 10 Q28 6 32 8 Q36 4 40 10 Q44 10 44 14 Q36 14 24 14 Q24 10 24 10 Z"
              fill="#94a3b8" opacity="0.4" />
          </>
        ),
      };
    case 'scared':
      return {
        fill: '#e0e7ff',
        stroke: '#4f46e5',
        eyes: <EyesScared />,
        mouth: <MouthFrown />,
        extras: (
          <>
            {/* Shaky lines */}
            <path d="M8 30 Q10 28 12 30 Q14 32 16 30" stroke="#4f46e5" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M48 30 Q50 28 52 30 Q54 32 56 30" stroke="#4f46e5" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          </>
        ),
      };
    case 'confused':
      return {
        fill: '#f8fafc',
        stroke: '#64748b',
        eyes: <EyesConfused />,
        mouth: <MouthWobbly />,
        extras: (
          <>
            {/* Thought bubble */}
            <circle cx="50" cy="14" r="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="55" cy="10" r="2.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="58" cy="7" r="1.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          </>
        ),
      };
    default:
      return {
        fill: '#fde68a',
        stroke: '#f59e0b',
        eyes: <EyesNormal />,
        mouth: <MouthSmile />,
      };
  }
}

// ─── PUBLIC COMPONENT ─────────────────────────────────────────────────────────

export const ThemedEmotionFace: React.FC<ThemedEmotionFaceProps> = ({
  emotionId,
  theme,
  className = 'w-12 h-12',
}) => {
  const fd = getEmotionFace(emotionId);
  const hat = getHat(theme?.category);
  const label = emotionId.charAt(0).toUpperCase() + emotionId.slice(1);

  return (
    <span className={`${className} flex-shrink-0 inline-block`} aria-hidden="true">
      <Face label={label}>
        <FaceBase
          fill={fd.fill}
          stroke={fd.stroke}
          eyes={fd.eyes}
          mouth={fd.mouth}
          extras={fd.extras}
          hat={hat}
          showBlush={fd.showBlush}
          blushColor={fd.blushColor}
        />
      </Face>
    </span>
  );
};
