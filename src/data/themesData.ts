import { AACItem } from '../types';

export interface ThemePalette {
  primary: string;           // Hex color, e.g. '#16a34a'
  primaryBg: string;         // Tailwind class e.g. 'bg-emerald-500'
  primaryHover: string;      // Tailwind class e.g. 'hover:bg-emerald-600'
  primaryLight: string;      // Tailwind class e.g. 'bg-emerald-50'
  primaryBorder: string;     // Tailwind class e.g. 'border-emerald-300'
  textAccent: string;        // Tailwind class e.g. 'text-emerald-950'
  badgeBg: string;           // Tailwind class e.g. 'bg-emerald-200'
  appBg: string;             // Tailwind background gradient
  headerBg: string;          // Header background class
  navActiveBg: string;       // Bottom nav active item class
  cardBg?: string;           // Card surface styling class
  cardInnerBg?: string;      // Inner nested container styling class
  designStyle?: 'glassmorphism' | 'neumorphism' | 'twilight' | 'standard';
  wallpaperUrl?: string;     // URL for background wallpaper image
}

export type WallpaperPattern = 
  | 'turtle_shell'
  | 'dino_footprints' 
  | 'lily_pads' 
  | 'railroad' 
  | 'cosmic_stars' 
  | 'bubbles' 
  | 'sparkles' 
  | 'ocean_waves'
  | 'zen_botanical'
  | 'honeycomb_clouds'
  | 'none';

export interface AppTheme {
  id: string;
  name: string;
  category: 'turtle' | 'dinosaur' | 'frog' | 'train' | 'space' | 'ocean' | 'nature' | 'racing' | 'fantasy' | 'custom' | 'classic';
  emoji: string;
  mascotName: string;
  mascotEmoji: string;
  greetingMessage: string;
  description: string;
  costStars: number;
  isUnlocked: boolean;
  isCustom?: boolean;
  targetAudience?: 'kid' | 'teen' | 'adult' | 'all';

  palette: ThemePalette;
  wallpaperPattern: WallpaperPattern;

  aacStyling: {
    tileBorderRadius: 'rounded-2xl' | 'rounded-3xl' | 'rounded-xl';
    tileBorderWidth: 'border-2' | 'border-3';
  };

  soundTheme: 'turtle' | 'dino' | 'frog' | 'train' | 'space' | 'magic' | 'classic';
}

export const PRESET_THEMES: AppTheme[] = [
  // 1. WISE TURTLE THEME (Requested specifically by user)
  {
    id: 'theme-turtle',
    name: 'Wise Turtle Sanctuary',
    category: 'turtle',
    emoji: '🐢',
    mascotName: 'Shelly the Wise Turtle',
    mascotEmoji: '🐢',
    greetingMessage: 'Slow, steady, and peaceful! Welcome to your calm turtle sanctuary!',
    description: 'Calming turquoise waters, sacred geometric shell patterns, and gentle swimming turtles for deep relaxed focus.',
    costStars: 0, // Unlocked by default so kid or adult can pick turtles right away!
    isUnlocked: true,
    palette: {
      primary: '#059669',
      primaryBg: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryLight: 'bg-emerald-50/90',
      primaryBorder: 'border-emerald-400',
      textAccent: 'text-emerald-950',
      badgeBg: 'bg-emerald-200',
      appBg: 'bg-gradient-to-b from-teal-50 via-emerald-50/50 to-green-100',
      headerBg: 'bg-emerald-100/90 border-emerald-300',
      navActiveBg: 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400',
      wallpaperUrl: '/assets/wallpapers/turtle_sanctuary_bg.webp',
    },
    wallpaperPattern: 'turtle_shell',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
    },
    soundTheme: 'turtle',
  },

  // 2. DINOSAUR THEME (Requested specifically by user)
  {
    id: 'theme-dino',
    name: 'Dino Kingdom',
    category: 'dinosaur',
    emoji: '🦖',
    mascotName: 'Rex the T-Rex',
    mascotEmoji: '🦖',
    greetingMessage: 'Roar! Welcome to your prehistoric dinosaur kingdom!',
    description: 'Ancient Jurassic jungle, giant footprints, and friendly T-Rex & Triceratops companions.',
    costStars: 0, // Unlocked by default so kid can jump right into dinos!
    isUnlocked: true,
    palette: {
      primary: '#c26433',
      primaryBg: 'bg-amber-700',
      primaryHover: 'hover:bg-amber-800',
      primaryLight: 'bg-amber-50/80',
      primaryBorder: 'border-amber-400',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-200',
      appBg: 'bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-stone-100',
      headerBg: 'bg-amber-100/90 border-amber-300',
      navActiveBg: 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600',
      wallpaperUrl: '/assets/wallpapers/dino_kingdom_bg.webp',
    },
    wallpaperPattern: 'dino_footprints',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
    },
    soundTheme: 'dino',
  },

  // 2. FROGS THEME (Requested specifically by user)
  {
    id: 'theme-frog',
    name: 'Ribbit Pond',
    category: 'frog',
    emoji: '🐸',
    mascotName: 'Hoppy the Tree Frog',
    mascotEmoji: '🐸',
    greetingMessage: 'Ribbit ribbit! Welcome to the peaceful lily pad pond!',
    description: 'Calming fresh pond water, vibrant bouncy tree frogs, and floating lily pads.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#65a30d',
      primaryBg: 'bg-lime-600',
      primaryHover: 'hover:bg-lime-700',
      primaryLight: 'bg-lime-50/80',
      primaryBorder: 'border-lime-400',
      textAccent: 'text-lime-950',
      badgeBg: 'bg-lime-200',
      appBg: 'bg-gradient-to-b from-lime-50 via-emerald-50 to-teal-50',
      headerBg: 'bg-lime-100/90 border-lime-300',
      navActiveBg: 'bg-lime-500 text-white shadow-md ring-2 ring-lime-600',
      wallpaperUrl: '/assets/wallpapers/ribbit_pond_bg.webp',
    },
    wallpaperPattern: 'lily_pads',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
    },
    soundTheme: 'frog',
  },

  // 3. TRAINS THEME
  {
    id: 'theme-trains',
    name: 'Steam Express',
    category: 'train',
    emoji: '🚂',
    mascotName: 'Conductor Leo',
    mascotEmoji: '🚂',
    greetingMessage: 'All aboard! Full steam ahead on our daily schedule!',
    description: 'Chugga-chugga tracks, shiny steam locomotives, and brass conductor bells.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#1e3a8a',
      primaryBg: 'bg-blue-900',
      primaryHover: 'hover:bg-blue-950',
      primaryLight: 'bg-slate-50/80',
      primaryBorder: 'border-blue-300',
      textAccent: 'text-blue-950',
      badgeBg: 'bg-blue-100',
      appBg: 'bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100',
      headerBg: 'bg-blue-50/90 border-blue-200',
      navActiveBg: 'bg-blue-900 text-white shadow-md ring-2 ring-blue-700',
      wallpaperUrl: '/assets/wallpapers/steam_express_bg.webp',
    },
    wallpaperPattern: 'railroad',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'train',
  },

  // 4. COSMIC SPACE THEME
  {
    id: 'theme-space',
    name: 'Cosmic Explorer',
    category: 'space',
    emoji: '🚀',
    mascotName: 'Orion the Astro-Pup',
    mascotEmoji: '🚀',
    greetingMessage: '3.. 2.. 1.. Blastoff! Ready for an interstellar space mission!',
    description: 'Stardust galaxies, glowing nebulae, planetary rings, and flying rocket ships.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#7c3aed',
      primaryBg: 'bg-purple-600',
      primaryHover: 'hover:bg-purple-700',
      primaryLight: 'bg-purple-50/80',
      primaryBorder: 'border-purple-400',
      textAccent: 'text-purple-950',
      badgeBg: 'bg-purple-200',
      appBg: 'bg-gradient-to-b from-indigo-50 via-purple-50 to-slate-100',
      headerBg: 'bg-purple-100/90 border-purple-300',
      navActiveBg: 'bg-purple-500 text-white shadow-md ring-2 ring-purple-600',
      wallpaperUrl: '/assets/wallpapers/cosmic_voyager_bg.webp',
    },
    wallpaperPattern: 'cosmic_stars',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'space',
  },

  // 5. OCEAN WONDER THEME
  {
    id: 'theme-ocean',
    name: 'Ocean Splash',
    category: 'ocean',
    emoji: '🐬',
    mascotName: 'Splash the Dolphin',
    mascotEmoji: '🐬',
    greetingMessage: 'Splash! Smooth waters and cheerful calm ocean waves!',
    description: 'Deep ocean coral, playful sea turtles, dancing dolphins, and seafoam bubbles.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#0891b2',
      primaryBg: 'bg-cyan-600',
      primaryHover: 'hover:bg-cyan-700',
      primaryLight: 'bg-cyan-50/80',
      primaryBorder: 'border-cyan-400',
      textAccent: 'text-cyan-950',
      badgeBg: 'bg-cyan-200',
      appBg: 'bg-gradient-to-b from-cyan-50 via-teal-50 to-blue-50',
      headerBg: 'bg-cyan-100/90 border-cyan-300',
      navActiveBg: 'bg-cyan-500 text-white shadow-md ring-2 ring-cyan-600',
      wallpaperUrl: '/assets/wallpapers/ocean_splash_bg.webp',
    },
    wallpaperPattern: 'bubbles',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'classic',
  },

  // 6. TACTILE SILICONE & OAT MILK BENTO (Signature Default System)
  {
    id: 'theme-classic',
    name: 'Tactile Silicone & Oat Milk',
    category: 'classic',
    emoji: '🐝',
    mascotName: 'Barnaby the Cozy Bee',
    mascotEmoji: '🐝',
    greetingMessage: 'Welcome to your sensory space! You can be yourself here.',
    description: 'Warm Japanese oat milk canvas, tactile debossed silicone trays, and ergonomic pillowed action pads.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'all',
    palette: {
      primary: '#d97706',
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-600',
      primaryLight: 'bg-amber-50/80 text-amber-950',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-950 border border-amber-300',
      appBg: 'bg-[#FEF9F1] text-amber-950',
      headerBg: 'bg-amber-50/90 backdrop-blur-md border-b border-amber-300/80 shadow-2xs',
      navActiveBg: 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400',
      cardBg: 'bg-white/80 border-2 border-amber-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]',
      cardInnerBg: 'bg-amber-100/70 border border-amber-300/80 shadow-2xs',
      designStyle: 'neumorphism',
      wallpaperUrl: '/assets/wallpapers/default_honey_theme_bg.webp',
    },
    wallpaperPattern: 'honeycomb_clouds',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'classic',
  },

  // 7. SPEEDWAY RACING
  {
    id: 'theme-racing',
    name: 'Turbo Speedway',
    category: 'racing',
    emoji: '🏎️',
    mascotName: 'Turbo Rex',
    mascotEmoji: '🏎️',
    greetingMessage: 'Vroom! Green flag is out — ready to zoom through today!',
    description: 'High-speed racecars, checkered finish lines, and turbo boost power.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#dc2626',
      primaryBg: 'bg-red-600',
      primaryHover: 'hover:bg-red-700',
      primaryLight: 'bg-red-50/80',
      primaryBorder: 'border-red-400',
      textAccent: 'text-red-950',
      badgeBg: 'bg-red-200',
      appBg: 'bg-gradient-to-b from-red-50 via-amber-50 to-slate-100',
      headerBg: 'bg-red-100/90 border-red-300',
      navActiveBg: 'bg-red-500 text-white shadow-md ring-2 ring-red-600',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-3',
    },
    soundTheme: 'train',
  },

  // 8. ENCHANTED FAIRYTALE
  {
    id: 'theme-fantasy',
    name: 'Magic Fairytale',
    category: 'fantasy',
    emoji: '🦄',
    mascotName: 'Stardust Unicorn',
    mascotEmoji: '🦄',
    greetingMessage: 'Sparkle and wonder fill your gentle, happy day!',
    description: 'Whimsical pastel unicorns, fairy dust, and calm lavender gardens.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#db2777',
      primaryBg: 'bg-pink-600',
      primaryHover: 'hover:bg-pink-700',
      primaryLight: 'bg-pink-50/80',
      primaryBorder: 'border-pink-300',
      textAccent: 'text-pink-950',
      badgeBg: 'bg-pink-200',
      appBg: 'bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50',
      headerBg: 'bg-pink-100/90 border-pink-300',
      navActiveBg: 'bg-pink-400 text-white shadow-md ring-2 ring-pink-500',
      wallpaperUrl: '/assets/wallpapers/magic_fairytale_bg.webp',
    },
    wallpaperPattern: 'sparkles',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'magic',
  },
];

/**
 * Returns the customized emoji for an AAC item based on the active theme
 */
export function getThemedAacEmoji(item: AACItem, theme?: AppTheme): string {
  if (!theme) return item.emoji;

  // Dynamic theme-wide visual adaptation across all AAC tiles (strict exact matching only)
  const l = item.label.toLowerCase().trim();

  if (theme.category === 'turtle') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🐢';
  } else if (theme.category === 'dinosaur') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🦖';
  } else if (theme.category === 'frog') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🐸';
  } else if (theme.category === 'train') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🚂';
  } else if (theme.category === 'space') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🚀';
  } else if (theme.category === 'ocean') {
    if (l === 'i / me' || l === 'i' || l === 'me') return '🐬';
  }

  return item.emoji || '💬';
}

/**
 * Filters themes by age group (kid, teen, adult) while allowing access to all if desired
 */
export function getThemesForAgeGroup(ageGroup: 'kid' | 'teen' | 'adult', allThemes: AppTheme[]): AppTheme[] {
  return allThemes.filter((t) => {
    if (!t.targetAudience || t.targetAudience === 'all') return true;
    return t.targetAudience === ageGroup;
  });
}

/**
 * Suggests an optimal starting theme based on user age group and their special interests
 */
export function suggestThemeForUser(ageGroup: 'kid' | 'teen' | 'adult', interests: string[]): string {
  const lower = interests.map((i) => i.toLowerCase());

  if (ageGroup === 'kid') {
    if (lower.some((i) => i.includes('turtle') || i.includes('tortoise') || i.includes('reptile'))) return 'theme-turtle';
    if (lower.some((i) => i.includes('dino') || i.includes('jurassic'))) return 'theme-dino';
    if (lower.some((i) => i.includes('frog') || i.includes('pond') || i.includes('amphibian'))) return 'theme-frog';
    if (lower.some((i) => i.includes('train') || i.includes('rail') || i.includes('locomotive'))) return 'theme-trains';
    if (lower.some((i) => i.includes('space') || i.includes('star') || i.includes('rocket') || i.includes('planet'))) return 'theme-space';
    if (lower.some((i) => i.includes('car') || i.includes('race') || i.includes('speed') || i.includes('vehicle'))) return 'theme-racing';
    if (lower.some((i) => i.includes('unicorn') || i.includes('magic') || i.includes('fairy') || i.includes('princess'))) return 'theme-fantasy';
    if (lower.some((i) => i.includes('ocean') || i.includes('dolphin') || i.includes('fish') || i.includes('water'))) return 'theme-ocean';
    return 'theme-turtle';
  } else if (ageGroup === 'teen') {
    if (lower.some((i) => i.includes('turtle') || i.includes('sea'))) return 'theme-turtle';
    if (lower.some((i) => i.includes('dino') || i.includes('jurassic'))) return 'theme-dino';
    if (lower.some((i) => i.includes('frog') || i.includes('pond'))) return 'theme-frog';
    if (lower.some((i) => i.includes('space') || i.includes('galaxy') || i.includes('astronomy'))) return 'theme-space';
    if (lower.some((i) => i.includes('train') || i.includes('rail'))) return 'theme-trains';
    return 'theme-turtle';
  } else {
    // Adult
    if (lower.some((i) => i.includes('turtle') || i.includes('sea') || i.includes('nature') || i.includes('calm'))) return 'theme-turtle';
    if (lower.some((i) => i.includes('frog') || i.includes('pond'))) return 'theme-frog';
    if (lower.some((i) => i.includes('dino') || i.includes('jurassic'))) return 'theme-dino';
    return 'theme-classic';
  }
}

