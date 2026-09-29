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
}

export type WallpaperPattern = 
  | 'dino_footprints' 
  | 'lily_pads' 
  | 'railroad' 
  | 'cosmic_stars' 
  | 'bubbles' 
  | 'sparkles' 
  | 'none';

export interface AppTheme {
  id: string;
  name: string;
  category: 'dinosaur' | 'frog' | 'train' | 'space' | 'ocean' | 'nature' | 'racing' | 'fantasy' | 'custom' | 'classic';
  emoji: string;
  mascotName: string;
  mascotEmoji: string;
  greetingMessage: string;
  description: string;
  costStars: number;
  isUnlocked: boolean;
  isCustom?: boolean;

  palette: ThemePalette;
  wallpaperPattern: WallpaperPattern;

  aacStyling: {
    tileBorderRadius: 'rounded-2xl' | 'rounded-3xl' | 'rounded-xl';
    tileBorderWidth: 'border-2' | 'border-3';
    customWordEmojis?: Record<string, string>;
  };

  soundTheme: 'dino' | 'frog' | 'train' | 'space' | 'magic' | 'classic';
}

export const PRESET_THEMES: AppTheme[] = [
  // 1. DINOSAUR THEME (Requested specifically by user)
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
      primary: '#16a34a',
      primaryBg: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryLight: 'bg-emerald-50/80',
      primaryBorder: 'border-emerald-400',
      textAccent: 'text-emerald-950',
      badgeBg: 'bg-emerald-200',
      appBg: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100',
      headerBg: 'bg-emerald-100/90 border-emerald-300',
      navActiveBg: 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-600',
    },
    wallpaperPattern: 'dino_footprints',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
      customWordEmojis: {
        'I want': '🦖',
        'Help': '🌋',
        'Play': '🦕',
        'Eat': '🌿',
        'Water': '💧',
        'Stop': '🛑',
        'Like': '👍',
        'Break': '🏕️',
        'Good': '🌟',
      },
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
    costStars: 5,
    isUnlocked: true, // Unlocked for immediate enjoyment!
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
    },
    wallpaperPattern: 'lily_pads',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
      customWordEmojis: {
        'I want': '🐸',
        'Help': '🛟',
        'Play': '🪷',
        'Eat': '🪰',
        'Water': '💧',
        'Jump': '🦗',
        'Break': '🛋️',
        'Good': '✨',
      },
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
    costStars: 8,
    isUnlocked: false,
    palette: {
      primary: '#0284c7',
      primaryBg: 'bg-sky-600',
      primaryHover: 'hover:bg-sky-700',
      primaryLight: 'bg-sky-50/80',
      primaryBorder: 'border-sky-400',
      textAccent: 'text-sky-950',
      badgeBg: 'bg-sky-200',
      appBg: 'bg-gradient-to-b from-sky-50 via-slate-50 to-amber-50',
      headerBg: 'bg-sky-100/90 border-sky-300',
      navActiveBg: 'bg-sky-500 text-white shadow-md ring-2 ring-sky-600',
    },
    wallpaperPattern: 'railroad',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🚂',
        'Help': '🚨',
        'Play': '🚃',
        'Stop': '🛑',
        'Go': '🟢',
      },
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
    costStars: 10,
    isUnlocked: false,
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
    },
    wallpaperPattern: 'cosmic_stars',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🚀',
        'Help': '🛸',
        'Play': '🪐',
        'Break': '🌙',
      },
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
    costStars: 8,
    isUnlocked: false,
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
    },
    wallpaperPattern: 'bubbles',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🐬',
        'Water': '🌊',
        'Play': '🐢',
      },
    },
    soundTheme: 'classic',
  },

  // 6. RAINBOW MEADOW (Classic Lumina)
  {
    id: 'theme-classic',
    name: 'Rainbow Meadow',
    category: 'classic',
    emoji: '🌈',
    mascotName: 'Leo the Lion',
    mascotEmoji: '🦁',
    greetingMessage: 'Bright sunny skies for a cheerful, friendly day!',
    description: 'Warm sunny amber, gentle clouds, and uplifting pastel colors.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#d97706',
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-600',
      primaryLight: 'bg-amber-50',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-200',
      appBg: 'bg-amber-50/40',
      headerBg: 'bg-white/95 border-amber-100',
      navActiveBg: 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
    },
    wallpaperPattern: 'sparkles',
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
    costStars: 10,
    isUnlocked: false,
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
      customWordEmojis: {
        'I want': '🏎️',
        'Help': '🏁',
        'Go': '🟢',
        'Stop': '🛑',
      },
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
    costStars: 10,
    isUnlocked: false,
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
    },
    wallpaperPattern: 'sparkles',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🦄',
        'Help': '🪄',
        'Play': '🏰',
      },
    },
    soundTheme: 'magic',
  },
];

/**
 * Returns the customized emoji for an AAC item based on the active theme
 */
export function getThemedAacEmoji(item: AACItem, theme?: AppTheme): string {
  if (!theme || !theme.aacStyling?.customWordEmojis) {
    return item.emoji;
  }
  const override = theme.aacStyling.customWordEmojis[item.label];
  return override || item.emoji;
}
