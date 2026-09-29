/**
 * AACWordIcon — Custom SVG art for every AAC word, theme-adaptive.
 *
 * Each word gets a unique, clear illustration. When a theme is active the
 * color palette and a small thematic character accent shift to match.
 * Illustrations are designed to be legible at 32–48 px (text-2xl / text-4xl
 * equivalent), so they work in both normal and large-button modes.
 */
import React from 'react';
import { AppTheme } from '../data/themesData';

interface AACWordIconProps {
  /** Exact label from AACItem */
  label: string;
  /** Fitzgerald color type */
  colorType: string;
  /** Active theme (optional — falls back to default palette) */
  theme?: AppTheme | null;
  /** CSS class for width/height (e.g. "w-10 h-10") */
  className?: string;
}

// ─── Theme accent colour helper ───────────────────────────────────────────────
function themeAccent(cat?: string): { main: string; light: string; dark: string } {
  switch (cat) {
    case 'turtle':    return { main: '#059669', light: '#a7f3d0', dark: '#065f46' };
    case 'dinosaur':  return { main: '#a16207', light: '#fef08a', dark: '#78350f' };
    case 'frog':      return { main: '#16a34a', light: '#bbf7d0', dark: '#14532d' };
    case 'space':     return { main: '#6d28d9', light: '#ddd6fe', dark: '#2e1065' };
    case 'train':     return { main: '#dc2626', light: '#fecaca', dark: '#7f1d1d' };
    case 'ocean':     return { main: '#0284c7', light: '#bae6fd', dark: '#0c4a6e' };
    case 'nature':    return { main: '#15803d', light: '#bbf7d0', dark: '#14532d' };
    case 'fantasy':   return { main: '#9333ea', light: '#f3e8ff', dark: '#581c87' };
    case 'lofi':      return { main: '#db2777', light: '#fce7f3', dark: '#831843' };
    default:          return { main: '#475569', light: '#f1f5f9', dark: '#1e293b' };
  }
}

// ─── SVG wrapper ──────────────────────────────────────────────────────────────
const Svg: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <svg
    viewBox="0 0 48 48"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label={title}
    role="img"
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// WORD ICONS — one per label (case-insensitive match in export below)
// ═══════════════════════════════════════════════════════════════════════════════

// ── SUBJECTS ──────────────────────────────────────────────────────────────────

const IconIMe: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="I / Me">
    {/* Person pointing to self */}
    <circle cx="24" cy="13" r="7" fill={a.main} />
    <path d="M10 40 Q10 28 24 28 Q38 28 38 40" fill={a.main} />
    {/* Pointing arrow inward */}
    <path d="M24 22 L24 32" stroke={a.light} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="24" cy="35" r="2.5" fill={a.light} />
  </Svg>
);

const IconYou: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="You">
    {/* Finger pointing right/outward */}
    <circle cx="24" cy="13" r="7" fill={a.main} opacity="0.7" />
    <path d="M10 40 Q10 28 24 28 Q38 28 38 40" fill={a.main} opacity="0.7" />
    {/* Arrow pointing away */}
    <path d="M26 24 L38 24" stroke={a.dark} strokeWidth="3" strokeLinecap="round"/>
    <path d="M34 20 L38 24 L34 28" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </Svg>
);

const IconWe: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="We">
    <circle cx="16" cy="13" r="6" fill={a.main} />
    <circle cx="32" cy="13" r="6" fill={a.dark} />
    <path d="M4 40 Q4 28 16 28 Q22 28 24 30 Q26 28 32 28 Q44 28 44 40" fill={a.main} />
    {/* Heart joining them */}
    <path d="M20 36 Q24 32 28 36 Q28 40 24 43 Q20 40 20 36 Z" fill={a.light} />
  </Svg>
);

const IconMyMine: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="My / Mine">
    <circle cx="24" cy="13" r="7" fill={a.main} />
    <path d="M10 40 Q10 28 24 28 Q38 28 38 40" fill={a.main} />
    {/* Star badge = ownership */}
    <path d="M24 32 L25.5 36 L30 36 L26.5 38.5 L28 43 L24 40.5 L20 43 L21.5 38.5 L18 36 L22.5 36 Z" fill="#fbbf24" />
  </Svg>
);

// ── VERBS ─────────────────────────────────────────────────────────────────────

const IconWant: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Want">
    {/* Open hands reaching */}
    <path d="M8 30 Q8 20 16 18 L16 35 Q12 35 8 30 Z" fill={a.main} />
    <path d="M40 30 Q40 20 32 18 L32 35 Q36 35 40 30 Z" fill={a.main} />
    <path d="M16 18 L16 35 L32 35 L32 18 Q24 14 16 18 Z" fill={a.light} />
    {/* Star above = desire */}
    <path d="M24 6 L25.2 10 L29 10 L26 12.5 L27 16 L24 13.5 L21 16 L22 12.5 L19 10 L22.8 10 Z" fill="#fbbf24" />
  </Svg>
);

const IconNeed: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Need">
    {/* Exclamation in rounded rect */}
    <rect x="8" y="6" width="32" height="36" rx="8" fill={a.main} />
    <rect x="21" y="12" width="6" height="18" rx="3" fill="white" />
    <circle cx="24" cy="36" r="3" fill="white" />
  </Svg>
);

const IconLike: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Like">
    {/* Thumbs up */}
    <path d="M14 22 Q14 14 20 14 L22 14 L22 8 Q22 5 25 5 Q28 5 28 8 L28 20 L36 20 Q39 20 39 24 L39 34 Q39 38 36 38 L16 38 Q13 38 13 35 L13 28 Q13 22 14 22 Z"
      fill={a.main} />
    <rect x="7" y="22" width="8" height="16" rx="3" fill={a.dark} />
  </Svg>
);

const IconGo: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Go">
    {/* Running figure */}
    <circle cx="32" cy="8" r="5" fill={a.main} />
    <path d="M32 13 L28 26 L18 32" stroke={a.main} strokeWidth="4" strokeLinecap="round" />
    <path d="M28 26 L22 36" stroke={a.main} strokeWidth="4" strokeLinecap="round" />
    <path d="M32 13 L38 24 L44 28" stroke={a.main} strokeWidth="3.5" strokeLinecap="round" />
    {/* Arrow motion lines */}
    <path d="M4 24 L14 24" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2"/>
    <path d="M6 30 L14 30" stroke={a.dark} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2"/>
  </Svg>
);

const IconSee: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="See / Look">
    {/* Eye */}
    <path d="M6 24 Q24 8 42 24 Q24 40 6 24 Z" fill={a.light} stroke={a.main} strokeWidth="2"/>
    <circle cx="24" cy="24" r="8" fill={a.main} />
    <circle cx="24" cy="24" r="4" fill={a.dark} />
    <circle cx="26" cy="22" r="2" fill="white" />
  </Svg>
);

const IconFeel: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Feel">
    {/* Heart with pulse line */}
    <path d="M24 40 Q8 30 8 20 Q8 12 16 12 Q20 12 24 17 Q28 12 32 12 Q40 12 40 20 Q40 30 24 40 Z"
      fill={a.main} />
    <path d="M10 24 L16 24 L19 18 L23 30 L27 22 L30 26 L34 24 L38 24"
      stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconEat: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Eat">
    {/* Fork and plate */}
    <circle cx="24" cy="28" r="14" fill={a.light} stroke={a.main} strokeWidth="2.5" />
    {/* Fork */}
    <path d="M18 8 L18 20" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M15 8 L15 14 Q15 16 18 16" stroke={a.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M21 8 L21 14 Q21 16 18 16" stroke={a.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Food on plate */}
    <ellipse cx="24" cy="28" rx="7" ry="5" fill={a.main} opacity="0.7" />
  </Svg>
);

const IconDrink: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Drink">
    {/* Cup with straw */}
    <path d="M12 16 L14 42 L34 42 L36 16 Z" fill={a.light} stroke={a.main} strokeWidth="2" />
    <rect x="12" y="13" width="24" height="6" rx="3" fill={a.main} />
    {/* liquid level */}
    <path d="M14 30 L34 30 L33.5 42 L14.5 42 Z" fill={a.main} opacity="0.4" />
    {/* straw */}
    <rect x="27" y="6" width="3.5" height="22" rx="1.5" fill={a.dark} />
  </Svg>
);

const IconPlay: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Play">
    {/* Play-button triangle inside circle */}
    <circle cx="24" cy="24" r="18" fill={a.main} />
    <path d="M18 14 L38 24 L18 34 Z" fill="white" />
  </Svg>
);

const IconHelp: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Help">
    {/* Two hands handshake */}
    <path d="M4 24 Q4 16 12 16 L20 20 L28 16 Q32 14 34 18 L44 24 Q40 32 34 30 L26 26 L18 30 Q12 32 4 24 Z"
      fill={a.main} />
    <path d="M20 20 L26 26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="4" fill={a.dark} />
    <circle cx="36" cy="16" r="4" fill={a.dark} />
  </Svg>
);

const IconStop: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Stop">
    {/* Stop-sign octagon */}
    <path d="M16 6 L32 6 L42 16 L42 32 L32 42 L16 42 L6 32 L6 16 Z" fill="#dc2626" />
    <rect x="21" y="14" width="6" height="14" rx="3" fill="white" />
    <circle cx="24" cy="33" r="3" fill="white" />
  </Svg>
);

const IconWait: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Wait">
    {/* Hourglass */}
    <path d="M12 6 L36 6 L36 8 Q36 20 24 24 Q36 28 36 40 L36 42 L12 42 L12 40 Q12 28 24 24 Q12 20 12 8 Z"
      fill={a.main} />
    {/* Sand top half */}
    <path d="M14 8 Q14 18 24 22 Q14 18 14 8 Z" fill={a.light} opacity="0.6" />
    {/* Sand bottom */}
    <ellipse cx="24" cy="39" rx="8" ry="3" fill="#fbbf24" />
    {/* Hand gesture */}
    <path d="M36 18 L44 18" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M36 24 L44 24" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

// ── CORE MODIFIERS ────────────────────────────────────────────────────────────

const IconMore: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="More">
    {/* + sign bold */}
    <rect x="20" y="8" width="8" height="32" rx="4" fill={a.main} />
    <rect x="8" y="20" width="32" height="8" rx="4" fill={a.main} />
  </Svg>
);

const IconAllDone: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="All Done">
    {/* Checkmark in circle */}
    <circle cx="24" cy="24" r="18" fill={a.main} />
    <path d="M12 24 L20 33 L36 15" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const IconDontNot: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Don't / Not">
    {/* X in circle */}
    <circle cx="24" cy="24" r="18" fill="#f87171" />
    <path d="M14 14 L34 34" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M34 14 L14 34" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
  </Svg>
);

const IconYes: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Yes">
    <circle cx="24" cy="24" r="18" fill="#22c55e" />
    <path d="M12 24 L20 33 L36 15" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const IconNo: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="No">
    <circle cx="24" cy="24" r="18" fill="#ef4444" />
    <path d="M14 14 L34 34" stroke="white" strokeWidth="5" strokeLinecap="round" />
    <path d="M34 14 L14 34" stroke="white" strokeWidth="5" strokeLinecap="round" />
  </Svg>
);

const IconBreak: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Break">
    {/* Cozy couch */}
    <rect x="6" y="22" width="36" height="18" rx="6" fill={a.main} />
    <rect x="4" y="16" width="40" height="10" rx="5" fill={a.dark} />
    <rect x="4" y="28" width="8" height="14" rx="4" fill={a.dark} />
    <rect x="36" y="28" width="8" height="14" rx="4" fill={a.dark} />
    {/* Zzz = rest */}
    <text x="16" y="16" fontSize="10" fill={a.light} fontWeight="bold" fontFamily="sans-serif">Zzz</text>
  </Svg>
);

const IconPlease: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Please">
    {/* Praying/please hands */}
    <path d="M14 34 Q10 28 10 20 Q10 10 18 10 Q20 10 22 12 L24 20 L22 34 Z" fill={a.main} />
    <path d="M34 34 Q38 28 38 20 Q38 10 30 10 Q28 10 26 12 L24 20 L26 34 Z" fill={a.main} />
    <path d="M22 34 L26 34 L24 40 Z" fill={a.dark} />
    {/* Star sparkle */}
    <path d="M24 5 L24.8 7.5 L27.5 7.5 L25.3 9 L26.2 11.5 L24 10 L21.8 11.5 L22.7 9 L20.5 7.5 L23.2 7.5 Z" fill="#fbbf24" />
  </Svg>
);

const IconWhatNext: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="What Next?">
    {/* Question mark */}
    <circle cx="24" cy="24" r="18" fill={a.light} stroke={a.main} strokeWidth="2.5" />
    <path d="M16 18 Q16 10 24 10 Q32 10 32 18 Q32 23 24 26" stroke={a.main} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <circle cx="24" cy="33" r="3" fill={a.main} />
    {/* Arrow */}
    <path d="M32 38 L40 38" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M37 34 L41 38 L37 42" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// ── FOOD ──────────────────────────────────────────────────────────────────────

const IconPizza: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Pizza">
    <path d="M24 6 L44 40 L4 40 Z" fill="#f97316" />
    <path d="M24 6 L44 40 L4 40 Z" fill="#f59e0b" opacity="0.5" />
    {/* Crust */}
    <path d="M4 40 Q24 46 44 40" stroke="#a16207" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Sauce */}
    <circle cx="20" cy="32" r="3.5" fill="#dc2626" />
    <circle cx="28" cy="26" r="3" fill="#dc2626" />
    <circle cx="24" cy="36" r="2.5" fill="#dc2626" />
    {/* Cheese melts */}
    <path d="M16 36 Q20 34 24 36 Q28 38 32 36" stroke="#fef08a" strokeWidth="2" fill="none" />
  </Svg>
);

const IconMacCheese: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Mac & Cheese">
    {/* Bowl */}
    <path d="M8 28 Q8 44 24 44 Q40 44 40 28 Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
    <path d="M6 26 L42 26" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Noodle swirls */}
    <path d="M16 32 Q18 28 20 32 Q22 36 24 32 Q26 28 28 32 Q30 36 32 32" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M14 38 Q16 34 18 38 Q20 42 22 38 Q24 34 26 38" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Steam */}
    <path d="M18 20 Q19 16 18 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M24 18 Q25 14 24 10" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconApple: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Apple">
    <path d="M24 14 Q12 14 10 26 Q8 38 24 44 Q40 38 38 26 Q36 14 24 14 Z" fill="#dc2626" />
    {/* Shine */}
    <ellipse cx="18" cy="22" rx="4" ry="3" fill="white" opacity="0.4" transform="rotate(-30,18,22)" />
    {/* Stem */}
    <path d="M24 14 Q24 8 28 6" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Leaf */}
    <path d="M28 6 Q34 4 32 12 Q28 10 28 6 Z" fill="#16a34a" />
  </Svg>
);

const IconSandwich: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Sandwich">
    {/* Top bread */}
    <path d="M8 18 Q8 10 24 10 Q40 10 40 18 L40 22 L8 22 Z" fill="#f59e0b" />
    {/* Lettuce */}
    <path d="M8 22 Q16 20 24 22 Q32 20 40 22 L40 24 L8 24 Z" fill="#22c55e" />
    {/* Cheese */}
    <rect x="8" y="24" width="32" height="3" fill="#fbbf24" />
    {/* Meat */}
    <path d="M8 27 Q24 30 40 27 L40 31 L8 31 Z" fill="#dc2626" opacity="0.7" />
    {/* Bottom bread */}
    <path d="M8 31 L40 31 Q40 36 24 38 Q8 36 8 31 Z" fill="#d97706" />
  </Svg>
);

const IconBanana: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Banana">
    <path d="M12 36 Q10 20 20 12 Q28 6 36 10 Q30 12 26 18 Q22 26 20 36 Q16 40 12 36 Z"
      fill="#fbbf24" />
    <path d="M20 12 Q28 6 36 10" stroke="#a16207" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* shine */}
    <path d="M14 28 Q15 22 18 18" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
  </Svg>
);

const IconCrackers: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Crackers">
    {/* Square cracker stack */}
    <rect x="10" y="30" width="28" height="10" rx="2" fill="#d97706" />
    <rect x="10" y="20" width="28" height="11" rx="2" fill="#f59e0b" />
    <rect x="10" y="10" width="28" height="11" rx="2" fill="#fbbf24" />
    {/* Holes */}
    <circle cx="20" cy="15" r="2" fill="#d97706" />
    <circle cx="28" cy="15" r="2" fill="#d97706" />
    <circle cx="24" cy="25" r="2" fill="#d97706" />
    <circle cx="18" cy="25" r="2" fill="#d97706" />
    <circle cx="30" cy="25" r="2" fill="#d97706" />
  </Svg>
);

const IconCookie: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Cookie">
    <circle cx="24" cy="24" r="17" fill="#d97706" />
    <circle cx="24" cy="24" r="15" fill="#f59e0b" />
    {/* Chocolate chips */}
    <ellipse cx="18" cy="20" rx="3" ry="2.5" fill="#78350f" transform="rotate(-15,18,20)" />
    <ellipse cx="30" cy="18" rx="3" ry="2.5" fill="#78350f" transform="rotate(10,30,18)" />
    <ellipse cx="16" cy="30" rx="2.5" ry="2" fill="#78350f" transform="rotate(-10,16,30)" />
    <ellipse cx="28" cy="30" rx="3" ry="2.5" fill="#78350f" transform="rotate(20,28,30)" />
    <ellipse cx="22" cy="26" rx="2" ry="2" fill="#78350f" />
  </Svg>
);

const IconStrawberries: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Strawberries">
    {/* Berry */}
    <path d="M24 40 Q12 32 12 22 Q12 12 24 12 Q36 12 36 22 Q36 32 24 40 Z" fill="#dc2626" />
    {/* Seeds */}
    {[[19,20],[25,18],[30,22],[20,28],[28,28],[24,24]].map(([x,y],i) => (
      <ellipse key={i} cx={x} cy={y} rx="1.2" ry="0.8" fill="#fef2f2" opacity="0.8" transform={`rotate(${i*30},${x},${y})`} />
    ))}
    {/* Leaf crown */}
    <path d="M24 12 Q22 6 18 8 Q22 10 22 12" fill="#16a34a" />
    <path d="M24 12 Q24 4 28 6 Q26 10 24 12" fill="#16a34a" />
    <path d="M24 12 Q20 6 24 4 Q26 8 24 12" fill="#22c55e" />
  </Svg>
);

// ── DRINKS ────────────────────────────────────────────────────────────────────

const IconWater: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Water">
    {/* Water drop */}
    <path d="M24 6 Q36 20 36 28 Q36 38 24 42 Q12 38 12 28 Q12 20 24 6 Z" fill="#38bdf8" />
    {/* Shine */}
    <path d="M18 24 Q20 18 24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
  </Svg>
);

const IconAppleJuice: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Apple Juice">
    {/* Juice box */}
    <rect x="12" y="14" width="24" height="28" rx="4" fill="#fbbf24" />
    <rect x="12" y="14" width="24" height="8" rx="4" fill="#f59e0b" />
    {/* Straw */}
    <path d="M28 8 L28 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
    {/* Label apple */}
    <circle cx="24" cy="30" r="6" fill="#dc2626" />
    <path d="M24 24 Q25 21 27 22" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconMilk: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Milk">
    {/* Milk carton */}
    <path d="M14 18 L34 18 L34 42 L14 42 Z" fill="white" stroke="#94a3b8" strokeWidth="2" />
    <path d="M14 18 L18 10 L30 10 L34 18 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
    {/* Liquid */}
    <rect x="16" y="28" width="16" height="12" rx="1" fill="#bae6fd" opacity="0.5" />
    {/* Label */}
    <rect x="17" y="20" width="14" height="7" rx="2" fill="#dbeafe" />
    <circle cx="24" cy="23.5" r="2.5" fill="#3b82f6" opacity="0.7" />
  </Svg>
);

const IconSmoothie: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Smoothie">
    {/* Cup */}
    <path d="M12 16 L15 44 L33 44 L36 16 Z" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />
    <rect x="12" y="13" width="24" height="6" rx="3" fill="#f9a8d4" />
    {/* Smoothie layers */}
    <path d="M14.5 30 L33.5 30 L32.5 38 L15.5 38 Z" fill="#f472b6" opacity="0.5" />
    <path d="M15 24 L33 24 L32.5 30 L15.5 30 Z" fill="#fb7185" opacity="0.4" />
    {/* Straw */}
    <rect x="27" y="6" width="3.5" height="24" rx="1.5" fill="#a855f7" />
    {/* Fruit garnish */}
    <circle cx="30" cy="5" r="3.5" fill="#dc2626" />
  </Svg>
);

// ── ACTIVITIES ────────────────────────────────────────────────────────────────

const IconTablet: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Tablet / iPad">
    <rect x="8" y="4" width="32" height="40" rx="5" fill="#1e293b" />
    <rect x="11" y="8" width="26" height="30" rx="3" fill="#38bdf8" opacity="0.8" />
    <circle cx="24" cy="42" r="1.5" fill="#475569" />
    {/* App icons grid */}
    {[[15,12],[24,12],[33,12],[15,21],[24,21],[33,21]].map(([x,y],i) => (
      <rect key={i} x={x-3} y={y-3} width="6" height="6" rx="1.5" fill="white" opacity="0.7" />
    ))}
  </Svg>
);

const IconPlayground: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Playground">
    {/* Slide */}
    <rect x="30" y="8" width="4" height="24" rx="2" fill={a.dark} />
    <path d="M34 32 L44 42 L40 44 L30 34 Z" fill={a.main} />
    {/* Swing set */}
    <path d="M6 8 L18 8" stroke={a.dark} strokeWidth="3" strokeLinecap="round" />
    <path d="M8 8 L10 24" stroke={a.dark} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8 L14 24" stroke={a.dark} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 8 L6 30" stroke={a.dark} strokeWidth="3" strokeLinecap="round" />
    <path d="M18 8 L18 30" stroke={a.dark} strokeWidth="3" strokeLinecap="round" />
    <rect x="8" y="24" width="8" height="3" rx="1.5" fill={a.main} />
    {/* Ground */}
    <path d="M4 44 L44 44" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const IconReadBook: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Read Book">
    {/* Open book */}
    <path d="M6 10 Q6 8 8 8 L22 10 L22 40 L8 38 Q6 38 6 36 Z" fill={a.light} stroke={a.main} strokeWidth="1.5" />
    <path d="M42 10 Q42 8 40 8 L26 10 L26 40 L40 38 Q42 38 42 36 Z" fill={a.light} stroke={a.main} strokeWidth="1.5" />
    <path d="M22 10 L26 10 L26 40 L22 40 Z" fill={a.main} />
    {/* Lines of text */}
    {[14,18,22,26,30].map(y => (
      <path key={y} d={`M10 ${y} L20 ${y}`} stroke={a.dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    ))}
    {[14,18,22,26,30].map(y => (
      <path key={y+100} d={`M28 ${y} L38 ${y}`} stroke={a.dark} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    ))}
  </Svg>
);

const IconDrawing: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Drawing">
    {/* Crayon */}
    <rect x="20" y="6" width="10" height="30" rx="4" fill={a.main} />
    <path d="M20 36 L25 44 L30 36 Z" fill={a.dark} />
    <rect x="20" y="6" width="10" height="6" rx="4" fill={a.light} />
    {/* Color stroke marks */}
    <path d="M6 36 Q14 30 20 36" stroke="#f87171" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M6 40 Q14 34 22 40" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M8 44 Q16 38 24 44" stroke="#34d399" strokeWidth="3" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconMusic: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Music">
    {/* Music note pair */}
    <path d="M18 34 Q18 22 24 18 L30 14 L30 28 Q30 36 24 38 Q18 38 18 34 Z" fill={a.main} />
    <rect x="24" y="18" width="12" height="2.5" rx="1" fill={a.main} />
    <ellipse cx="30" cy="28" rx="5" ry="3.5" fill={a.dark} transform="rotate(-10,30,28)" />
    {/* Musical sparks */}
    <path d="M36 10 L37.5 14 L42 14 L38.5 17 L40 21 L36 18 L32 21 L33.5 17 L30 14 L34.5 14 Z"
      fill="#fbbf24" opacity="0.7" transform="scale(0.7) translate(22,4)" />
  </Svg>
);

const IconBlocks: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Blocks / LEGO">
    {/* 3D block stack */}
    {/* Block 1 - front face */}
    <rect x="8" y="26" width="18" height="16" rx="2" fill={a.main} />
    <rect x="26" y="26" width="16" height="16" rx="2" fill={a.dark} />
    {/* Top face */}
    <path d="M8 26 L17 18 L42 18 L42 26 L26 26 L17 26 Z" fill={a.light} />
    <path d="M26 26 L34 18 L42 18 L42 26 Z" fill={a.light} opacity="0.5" />
    {/* Studs */}
    <circle cx="15" cy="22" r="3" fill={a.main} opacity="0.5" />
    <circle cx="25" cy="22" r="3" fill={a.main} opacity="0.5" />
    <circle cx="35" cy="22" r="3" fill={a.main} opacity="0.5" />
  </Svg>
);

const IconPuzzles: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Puzzles">
    {/* Two puzzle pieces */}
    <path d="M8 10 L22 10 Q22 6 26 6 Q30 6 30 10 L38 10 L38 22 Q42 22 42 26 Q42 30 38 30 L38 40 L8 40 L8 30 Q4 30 4 26 Q4 22 8 22 Z"
      fill={a.light} stroke={a.main} strokeWidth="2" />
    {/* Dividing lines */}
    <path d="M8 26 L38 26" stroke={a.main} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
    <path d="M24 10 L24 40" stroke={a.main} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
  </Svg>
);

const IconOutside: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Outside / Walk">
    {/* Tree */}
    <path d="M24 6 L36 26 L28 26 L32 38 L16 38 L20 26 L12 26 Z" fill="#16a34a" />
    <rect x="21" y="38" width="6" height="6" rx="1.5" fill="#78350f" />
    {/* Sun */}
    <circle cx="38" cy="12" r="5" fill="#fbbf24" />
    {[0,45,90,135,180,225,270,315].map((d,i) => (
      <path key={i}
        d={`M${38+Math.cos(d*Math.PI/180)*7} ${12+Math.sin(d*Math.PI/180)*7} L${38+Math.cos(d*Math.PI/180)*10} ${12+Math.sin(d*Math.PI/180)*10}`}
        stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    ))}
  </Svg>
);

// ── PLACES ────────────────────────────────────────────────────────────────────

const IconHome: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Home">
    {/* House */}
    <path d="M6 26 L24 8 L42 26 L38 26 L38 42 L10 42 L10 26 Z" fill={a.main} />
    <path d="M6 26 L24 8 L42 26" fill="none" stroke={a.dark} strokeWidth="2.5" strokeLinejoin="round" />
    {/* Door */}
    <rect x="20" y="32" width="8" height="10" rx="2" fill={a.dark} />
    <circle cx="27" cy="37" r="1" fill={a.light} />
    {/* Window */}
    <rect x="10" y="28" width="8" height="8" rx="2" fill="#bae6fd" />
    <rect x="30" y="28" width="8" height="8" rx="2" fill="#bae6fd" />
  </Svg>
);

const IconSchool: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="School">
    <rect x="6" y="18" width="36" height="26" rx="2" fill={a.main} />
    <path d="M4 20 L24 8 L44 20 Z" fill={a.dark} />
    {/* Flag */}
    <rect x="22" y="2" width="2" height="10" rx="1" fill={a.dark} />
    <path d="M24 4 L32 7 L24 10 Z" fill="#ef4444" />
    {/* Windows */}
    {[[10,24],[20,24],[30,24],[10,34],[30,34]].map(([x,y],i) => (
      <rect key={i} x={x} y={y} width="8" height="7" rx="1.5" fill="#bae6fd" />
    ))}
    {/* Door */}
    <rect x="20" y="34" width="8" height="10" rx="1.5" fill="#78350f" />
  </Svg>
);

const IconPark: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Park">
    {/* Bench */}
    <rect x="10" y="28" width="28" height="4" rx="2" fill="#a16207" />
    <rect x="12" y="32" width="4" height="8" rx="2" fill="#78350f" />
    <rect x="32" y="32" width="4" height="8" rx="2" fill="#78350f" />
    <rect x="10" y="24" width="28" height="3" rx="1.5" fill="#d97706" />
    {/* Trees */}
    <circle cx="10" cy="18" r="8" fill="#16a34a" />
    <rect x="8" y="24" width="4" height="8" rx="1.5" fill="#78350f" />
    <circle cx="38" cy="20" r="7" fill="#22c55e" />
    <rect x="36" y="25" width="4" height="7" rx="1.5" fill="#78350f" />
    {/* Path */}
    <path d="M20 44 Q24 42 28 44" stroke="#e2e8f0" strokeWidth="2.5" fill="none" strokeDasharray="2 2" />
  </Svg>
);

const IconDentist: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Dentist">
    {/* Tooth */}
    <path d="M16 8 Q10 8 10 16 Q10 28 14 38 Q16 44 20 44 Q24 44 24 38 Q24 44 28 44 Q32 44 34 38 Q38 28 38 16 Q38 8 32 8 Q28 8 28 12 Q24 16 20 12 Q20 8 16 8 Z"
      fill="white" stroke="#94a3b8" strokeWidth="2" />
    {/* Shine */}
    <path d="M16 14 Q18 10 22 12" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Mirror tool */}
    <circle cx="38" cy="12" r="5" fill={a.light} stroke={a.main} strokeWidth="2" />
    <path d="M42 8 L44 6" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const IconDoctor: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Doctor">
    {/* Stethoscope */}
    <circle cx="30" cy="12" r="6" fill="none" stroke={a.main} strokeWidth="3" />
    <circle cx="30" cy="12" r="3" fill={a.main} opacity="0.5" />
    <path d="M24 12 Q14 12 14 22 Q14 34 24 34" stroke={a.main} strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="36" r="6" fill={a.main} />
    <path d="M21 36 L27 36 M24 33 L24 39" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const IconRestaurant: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Restaurant">
    {/* Cloche / dome */}
    <path d="M8 28 Q8 14 24 14 Q40 14 40 28 Z" fill={a.light} stroke={a.main} strokeWidth="2" />
    <rect x="6" y="28" width="36" height="4" rx="2" fill={a.main} />
    {/* Handle */}
    <circle cx="24" cy="14" r="4" fill={a.main} />
    {/* Fork & knife */}
    <path d="M10 34 L10 44" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M38 34 L38 44" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const IconStore: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Store">
    {/* Cart */}
    <path d="M4 8 L8 8 L14 30 L38 30 L42 14 L14 14 L12 8 Z" fill="none" stroke={a.main} strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="18" cy="36" r="4" fill={a.main} />
    <circle cx="34" cy="36" r="4" fill={a.main} />
    {/* Items */}
    <rect x="16" y="16" width="6" height="12" rx="2" fill={a.light} />
    <rect x="24" y="16" width="6" height="12" rx="2" fill={a.light} />
  </Svg>
);

const IconCarBus: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Car / Bus">
    {/* Car body */}
    <path d="M4 30 L8 18 Q10 14 16 14 L32 14 Q38 14 40 18 L44 30 L44 38 L4 38 Z" fill={a.main} />
    <path d="M10 18 L14 14 L34 14 L38 18 Z" fill={a.light} opacity="0.7" />
    {/* Windows */}
    <rect x="12" y="18" width="10" height="10" rx="2" fill="#bae6fd" opacity="0.8" />
    <rect x="26" y="18" width="10" height="10" rx="2" fill="#bae6fd" opacity="0.8" />
    {/* Wheels */}
    <circle cx="12" cy="38" r="6" fill="#1e293b" />
    <circle cx="36" cy="38" r="6" fill="#1e293b" />
    <circle cx="12" cy="38" r="3" fill="#94a3b8" />
    <circle cx="36" cy="38" r="3" fill="#94a3b8" />
  </Svg>
);

// ── PEOPLE ────────────────────────────────────────────────────────────────────

const PersonBase: React.FC<{ skinFill: string; hairFill: string; shirtFill: string; extra?: React.ReactNode }> = ({ skinFill, hairFill, shirtFill, extra }) => (
  <>
    <circle cx="24" cy="14" r="9" fill={skinFill} />
    {/* Hair */}
    <path d="M15 12 Q15 4 24 5 Q33 4 33 12 Q30 8 24 8 Q18 8 15 12 Z" fill={hairFill} />
    {/* Body */}
    <path d="M12 42 Q12 30 24 30 Q36 30 36 42 Z" fill={shirtFill} />
    {extra}
  </>
);

const IconMom: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Mom">
    <PersonBase skinFill="#fcd34d" hairFill="#92400e" shirtFill="#f9a8d4"
      extra={
        <>
          {/* Long hair */}
          <path d="M15 16 Q12 26 14 34" stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M33 16 Q36 26 34 34" stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Heart */}
          <path d="M20 36 Q24 32 28 36 Q28 40 24 42 Q20 40 20 36 Z" fill="#f43f5e" opacity="0.6" />
        </>
      }
    />
  </Svg>
);

const IconDad: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Dad">
    <PersonBase skinFill="#fbbf24" hairFill="#78350f" shirtFill="#3b82f6"
      extra={
        <>
          {/* Tie */}
          <path d="M22 30 L24 36 L26 30 L25 28 L23 28 Z" fill="#dc2626" />
          {/* Stubble */}
          <path d="M18 20 Q20 22 24 22 Q28 22 30 20" stroke="#a16207" strokeWidth="1.5" fill="none" opacity="0.5" />
        </>
      }
    />
  </Svg>
);

const IconTeacher: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Teacher">
    <PersonBase skinFill="#fde68a" hairFill="#1e293b" shirtFill="#a78bfa"
      extra={
        <>
          {/* Chalkboard pointer */}
          <path d="M34 18 L44 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="44" cy="10" r="2" fill="#ef4444" />
          {/* Book */}
          <rect x="12" y="32" width="12" height="8" rx="2" fill="#fbbf24" />
          <path d="M18 32 L18 40" stroke="#d97706" strokeWidth="1.5" />
        </>
      }
    />
  </Svg>
);

const IconFriend: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Friend">
    {/* Two small figures side by side */}
    <circle cx="16" cy="12" r="7" fill="#fbbf24" />
    <path d="M6 38 Q6 28 16 28 Q22 28 24 32 Q26 28 32 28 Q42 28 42 38 Z" fill={a.main} />
    <circle cx="32" cy="12" r="7" fill="#fcd34d" />
    {/* Hands joined */}
    <path d="M22 28 Q24 26 26 28" stroke={a.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Smile marks */}
    <path d="M12 14 Q16 18 20 14" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M28 14 Q32 18 36 14" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

// ── SENSORY ───────────────────────────────────────────────────────────────────

const IconTooLoud: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Too Loud">
    {/* Sound wave blast */}
    <path d="M8 18 Q8 12 14 12 L18 18 L18 30 L14 36 Q8 36 8 30 Z" fill="#ef4444" />
    <path d="M18 20 Q24 16 24 24 Q24 32 18 28" fill="#f97316" />
    {[0,1,2].map(i => (
      <path key={i}
        d={`M${24+i*5} ${24-(8-i*2)} Q${26+i*5} 24 ${24+i*5} ${24+(8-i*2)}`}
        stroke="#ef4444" strokeWidth={3-i*0.5} fill="none" strokeLinecap="round"
        opacity={1-i*0.2} />
    ))}
    {/* Hands over ears indicator */}
    <path d="M4 22 Q2 24 4 26" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconTooBright: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Too Bright">
    <circle cx="24" cy="24" r="10" fill="#fbbf24" />
    {[0,45,90,135,180,225,270,315].map((d,i) => (
      <path key={i}
        d={`M${24+Math.cos(d*Math.PI/180)*12} ${24+Math.sin(d*Math.PI/180)*12} L${24+Math.cos(d*Math.PI/180)*18} ${24+Math.sin(d*Math.PI/180)*18}`}
        stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
    ))}
    {/* Squinting eye */}
    <path d="M14 38 Q20 34 26 38" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M14 38 Q20 42 26 38" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
  </Svg>
);

const IconHeadphones: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Headphones">
    {/* Arc */}
    <path d="M8 26 Q8 8 24 8 Q40 8 40 26" stroke={a.main} strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* Ear cups */}
    <rect x="4" y="24" width="10" height="14" rx="5" fill={a.dark} />
    <rect x="34" y="24" width="10" height="14" rx="5" fill={a.dark} />
    <rect x="6" y="26" width="6" height="10" rx="3" fill={a.main} />
    <rect x="36" y="26" width="6" height="10" rx="3" fill={a.main} />
  </Svg>
);

const IconWeightedBlanket: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Weighted Blanket">
    {/* Blanket folded */}
    <path d="M6 14 L42 14 L42 38 Q42 44 36 44 L12 44 Q6 44 6 38 Z" fill={a.main} />
    {/* Folded top */}
    <path d="M6 14 L42 14 L38 22 L10 22 Z" fill={a.light} />
    {/* Weight dots pattern */}
    {[[14,28],[20,28],[26,28],[32,28],[14,36],[20,36],[26,36],[32,36]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="2.5" fill={a.dark} opacity="0.4" />
    ))}
    {/* Stars on blanket */}
    <path d="M24 18 L25 21 L28 21 L26 23 L27 26 L24 24 L21 26 L22 23 L20 21 L23 21 Z"
      fill="#fbbf24" opacity="0.7" />
  </Svg>
);

const IconQuietRoom: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Quiet Room">
    {/* Room outline */}
    <rect x="6" y="8" width="36" height="32" rx="4" fill={a.light} stroke={a.main} strokeWidth="2" />
    {/* Cozy light */}
    <circle cx="24" cy="22" r="6" fill="#fbbf24" opacity="0.5" />
    {/* Shushing lips */}
    <path d="M18 36 Q24 40 30 36" stroke={a.main} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Finger shush */}
    <path d="M30 30 L30 26" stroke={a.dark} strokeWidth="2.5" strokeLinecap="round" />
    {/* Zzzs */}
    <text x="10" y="20" fontSize="7" fill={a.main} fontFamily="sans-serif" fontWeight="bold" opacity="0.6">z</text>
    <text x="8" y="15" fontSize="5" fill={a.main} fontFamily="sans-serif" fontWeight="bold" opacity="0.5">z</text>
  </Svg>
);

const IconFidget: React.FC<{ a: ReturnType<typeof themeAccent> }> = ({ a }) => (
  <Svg title="Squishy Fidget">
    {/* Squishy toy / star shape */}
    <path d="M24 6 Q28 12 34 10 Q32 16 38 18 Q32 22 36 28 Q30 26 28 32 Q24 28 20 32 Q18 26 12 28 Q16 22 10 18 Q16 16 14 10 Q20 12 24 6 Z"
      fill={a.main} />
    {/* Shine */}
    <circle cx="20" cy="16" r="3" fill="white" opacity="0.4" />
    {/* Squeeze marks */}
    <path d="M22 24 Q24 26 26 24" stroke={a.dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK — themed geometric icon for any unknown word
// ═══════════════════════════════════════════════════════════════════════════════

const IconFallback: React.FC<{ a: ReturnType<typeof themeAccent>; label: string }> = ({ a, label }) => (
  <Svg title={label}>
    <circle cx="24" cy="24" r="18" fill={a.light} stroke={a.main} strokeWidth="2.5" />
    <text
      x="24" y="29"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fontFamily="system-ui, sans-serif"
      fill={a.dark}
    >
      {label.slice(0, 2).toUpperCase()}
    </text>
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY — maps normalised label → component
// ═══════════════════════════════════════════════════════════════════════════════

type IconRenderer = (props: { a: ReturnType<typeof themeAccent>; label: string }) => React.ReactElement;

const ICON_MAP: Record<string, IconRenderer> = {
  'i / me':            ({ a }) => <IconIMe a={a} />,
  'you':               ({ a }) => <IconYou a={a} />,
  'we':                ({ a }) => <IconWe a={a} />,
  'my / mine':         ({ a }) => <IconMyMine a={a} />,
  'want':              ({ a }) => <IconWant a={a} />,
  'need':              ({ a }) => <IconNeed a={a} />,
  'like':              ({ a }) => <IconLike a={a} />,
  'go':                ({ a }) => <IconGo a={a} />,
  'see / look':        ({ a }) => <IconSee a={a} />,
  'feel':              ({ a }) => <IconFeel a={a} />,
  'eat':               ({ a }) => <IconEat a={a} />,
  'drink':             ({ a }) => <IconDrink a={a} />,
  'play':              ({ a }) => <IconPlay a={a} />,
  'help':              ({ a }) => <IconHelp a={a} />,
  'stop':              ({ a }) => <IconStop a={a} />,
  'wait':              ({ a }) => <IconWait a={a} />,
  'more':              ({ a }) => <IconMore a={a} />,
  'all done':          ({ a }) => <IconAllDone a={a} />,
  "don't / not":       ({ a }) => <IconDontNot a={a} />,
  'yes':               ({ a }) => <IconYes a={a} />,
  'no':                ({ a }) => <IconNo a={a} />,
  'break':             ({ a }) => <IconBreak a={a} />,
  'please':            ({ a }) => <IconPlease a={a} />,
  'what next?':        ({ a }) => <IconWhatNext a={a} />,
  'pizza':             ({ a }) => <IconPizza a={a} />,
  'mac & cheese':      ({ a }) => <IconMacCheese a={a} />,
  'apple':             ({ a }) => <IconApple a={a} />,
  'sandwich':          ({ a }) => <IconSandwich a={a} />,
  'banana':            ({ a }) => <IconBanana a={a} />,
  'crackers':          ({ a }) => <IconCrackers a={a} />,
  'cookie':            ({ a }) => <IconCookie a={a} />,
  'strawberries':      ({ a }) => <IconStrawberries a={a} />,
  'water':             ({ a }) => <IconWater a={a} />,
  'apple juice':       ({ a }) => <IconAppleJuice a={a} />,
  'milk':              ({ a }) => <IconMilk a={a} />,
  'smoothie':          ({ a }) => <IconSmoothie a={a} />,
  'tablet / ipad':     ({ a }) => <IconTablet a={a} />,
  'playground':        ({ a }) => <IconPlayground a={a} />,
  'read book':         ({ a }) => <IconReadBook a={a} />,
  'drawing':           ({ a }) => <IconDrawing a={a} />,
  'music':             ({ a }) => <IconMusic a={a} />,
  'blocks / lego':     ({ a }) => <IconBlocks a={a} />,
  'puzzles':           ({ a }) => <IconPuzzles a={a} />,
  'outside / walk':    ({ a }) => <IconOutside a={a} />,
  'home':              ({ a }) => <IconHome a={a} />,
  'school':            ({ a }) => <IconSchool a={a} />,
  'park':              ({ a }) => <IconPark a={a} />,
  'dentist':           ({ a }) => <IconDentist a={a} />,
  'doctor':            ({ a }) => <IconDoctor a={a} />,
  'restaurant':        ({ a }) => <IconRestaurant a={a} />,
  'store':             ({ a }) => <IconStore a={a} />,
  'car / bus':         ({ a }) => <IconCarBus a={a} />,
  'mom':               ({ a }) => <IconMom a={a} />,
  'dad':               ({ a }) => <IconDad a={a} />,
  'teacher':           ({ a }) => <IconTeacher a={a} />,
  'friend':            ({ a }) => <IconFriend a={a} />,
  'too loud':          ({ a }) => <IconTooLoud a={a} />,
  'too bright':        ({ a }) => <IconTooBright a={a} />,
  'headphones':        ({ a }) => <IconHeadphones a={a} />,
  'weighted blanket':  ({ a }) => <IconWeightedBlanket a={a} />,
  'quiet room':        ({ a }) => <IconQuietRoom a={a} />,
  'squishy fidget':    ({ a }) => <IconFidget a={a} />,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const AACWordIcon: React.FC<AACWordIconProps> = ({
  label,
  colorType,
  theme,
  className = 'w-10 h-10',
}) => {
  const accent = themeAccent(theme?.category);
  const key = label.toLowerCase().trim();
  const renderer = ICON_MAP[key];

  return (
    <span className={`${className} block drop-shadow-sm`} aria-hidden="true">
      {renderer ? renderer({ a: accent, label }) : <IconFallback a={accent} label={label} />}
    </span>
  );
};
