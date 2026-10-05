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
  | 'turtle_shell'
  | 'dino_footprints' 
  | 'lily_pads' 
  | 'railroad' 
  | 'cosmic_stars' 
  | 'bubbles' 
  | 'sparkles' 
  | 'ocean_waves'
  | 'zen_botanical'
  | 'none';

export interface AppTheme {
  id: string;
  name: string;
  category: 'turtle' | 'dinosaur' | 'frog' | 'train' | 'space' | 'ocean' | 'nature' | 'racing' | 'fantasy' | 'custom' | 'classic' | 'lofi' | 'cyber' | 'executive' | 'minimal' | 'dark' | 'skate';
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
    customWordEmojis?: Record<string, string>;
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
    },
    wallpaperPattern: 'turtle_shell',
    aacStyling: {
      tileBorderRadius: 'rounded-3xl',
      tileBorderWidth: 'border-3',
      customWordEmojis: {
        'I / Me': '🐢',
        'I': '🐢',
        'You': '👉',
        'We': '🐢👥',
        'My / Mine': '🐢🤲',
        'Want': '🤲',
        'Need': '❗',
        'Like': '💚',
        'Go': '🐢💨',
        'See / Look': '👀',
        'Feel': '💖',
        'Eat': '🥬',
        'Drink': '🌊',
        'Play': '🏝️',
        'Help': '🛟',
        'Stop': '🛑',
        'Wait': '⏳',
        'More': '➕',
        'All Done': '🏁',
        'Don\'t / Not': '❌',
        'Yes': '✅',
        'No': '⛔',
        'Break': '🧘',
        'Please': '🙏',
        'What Next?': '❓',
        'Water': '🌊',
        'Apple': '🍏',
        'Sandwich': '🥪',
        'Cookie': '🍪',
        'Milk': '🥛',
        'Good': '🐢✨',
        'Happy': '🐢💚',
      },
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

  // 6. BEEYOU HONEY SANCTUARY (Signature Brand Theme)
  {
    id: 'theme-classic',
    name: 'BeeYou Sanctuary',
    category: 'classic',
    emoji: '🐝',
    mascotName: 'Barnaby the Cozy Bee',
    mascotEmoji: '🐝',
    greetingMessage: 'You can be yourself here. Take your time and have a peaceful day.',
    description: 'Warm honey gold, soft sage accents, and a calming cream background.',
    costStars: 0,
    isUnlocked: true,
    palette: {
      primary: '#d97706',
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-600',
      primaryLight: 'bg-amber-50/90',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-900 border border-amber-200/80',
      appBg: 'bg-[#FAF8F5]',
      headerBg: 'bg-white/95 border-b border-amber-200/60 shadow-2xs',
      navActiveBg: 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400',
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

  // 9. LO-FI STUDY & CHILL (Teens / Young Adults)
  {
    id: 'theme-lofi',
    name: 'Lo-Fi Study & Chill',
    category: 'lofi',
    emoji: '🎧',
    mascotName: 'Lo-Fi Cat & Beats',
    mascotEmoji: '🎧',
    greetingMessage: 'Chill study beats and cozy calm focus for your daily rhythm.',
    description: 'Cozy aesthetic purple lamp glow, study playlists, and relaxed lo-fi energy.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'teen',
    palette: {
      primary: '#8b5cf6',
      primaryBg: 'bg-violet-600',
      primaryHover: 'hover:bg-violet-700',
      primaryLight: 'bg-violet-900/40 text-violet-100',
      primaryBorder: 'border-violet-700',
      textAccent: 'text-violet-200',
      badgeBg: 'bg-violet-800 text-violet-100',
      appBg: 'bg-gradient-to-b from-slate-950 via-purple-950 to-zinc-950 text-slate-100',
      headerBg: 'bg-slate-950/90 border-b border-purple-900/60 text-slate-100',
      navActiveBg: 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400',
    },
    wallpaperPattern: 'sparkles',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🎧',
        'Help': '🆘',
        'Play': '🎮',
        'Break': '☕',
      },
    },
    soundTheme: 'space',
  },

  // 10. CYBER NEON / GAMING (Teens)
  {
    id: 'theme-cyber',
    name: 'Cyber Neon',
    category: 'cyber',
    emoji: '⚡',
    mascotName: 'Glitch Runner',
    mascotEmoji: '⚡',
    greetingMessage: 'System online. Powering up today’s missions and goals.',
    description: 'Electric cyan and neon magenta grid, synthwave gaming dark mode.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'teen',
    palette: {
      primary: '#06b6d4',
      primaryBg: 'bg-cyan-600',
      primaryHover: 'hover:bg-cyan-700',
      primaryLight: 'bg-cyan-950/40 text-cyan-200',
      primaryBorder: 'border-cyan-500',
      textAccent: 'text-cyan-300',
      badgeBg: 'bg-cyan-900 text-cyan-200',
      appBg: 'bg-gradient-to-b from-slate-950 via-zinc-950 to-slate-900 text-slate-100',
      headerBg: 'bg-slate-950/95 border-b border-cyan-800 text-cyan-200',
      navActiveBg: 'bg-cyan-500 text-slate-950 shadow-md ring-2 ring-cyan-300',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '⚡',
        'Help': '🚨',
        'Play': '🕹️',
      },
    },
    soundTheme: 'space',
  },

  // 11. EXECUTIVE SAGE (Adults / Mindful Calm)
  {
    id: 'theme-sage',
    name: 'Executive Sage',
    category: 'executive',
    emoji: '🌿',
    mascotName: 'Mindful Sage',
    mascotEmoji: '🌿',
    greetingMessage: 'A calm, dignified space for executive clarity and peaceful focus.',
    description: 'Subtle matte sage green, warm stone cream, and minimalist typography.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'adult',
    palette: {
      primary: '#0f766e',
      primaryBg: 'bg-teal-700',
      primaryHover: 'hover:bg-teal-800',
      primaryLight: 'bg-teal-50/90 text-teal-950',
      primaryBorder: 'border-teal-300',
      textAccent: 'text-teal-950',
      badgeBg: 'bg-teal-100 text-teal-900',
      appBg: 'bg-gradient-to-b from-stone-50 via-teal-50/30 to-emerald-50/40 text-stone-900',
      headerBg: 'bg-white/95 border-b border-stone-200 text-stone-800',
      navActiveBg: 'bg-teal-800 text-white shadow-xs ring-1 ring-teal-900',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-xl',
      tileBorderWidth: 'border-2',
      customWordEmojis: {
        'I want': '🌿',
        'Help': '🤝',
        'Break': '☕',
      },
    },
    soundTheme: 'classic',
  },

  // 12. ESPRESSO MINIMAL (Adults / High-Functioning)
  {
    id: 'theme-espresso',
    name: 'Espresso Minimal',
    category: 'minimal',
    emoji: '☕',
    mascotName: 'Executive Calm',
    mascotEmoji: '☕',
    greetingMessage: 'Streamlined daily companion designed for executive function and ease.',
    description: 'Deep warm dark charcoal and rich roasted coffee amber tones.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'adult',
    palette: {
      primary: '#78350f',
      primaryBg: 'bg-amber-800',
      primaryHover: 'hover:bg-amber-900',
      primaryLight: 'bg-stone-100 text-stone-900',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-950',
      appBg: 'bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-200/50 text-stone-900',
      headerBg: 'bg-stone-900/95 border-b border-amber-900/40 text-amber-100',
      navActiveBg: 'bg-stone-800 text-amber-200 shadow-xs ring-1 ring-stone-900',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'classic',
  },

  // 13. MIDNIGHT SENSORY OLED (Sensory Sensitivity / Migraine / Dark Mode)
  {
    id: 'theme-midnight',
    name: 'Midnight OLED',
    category: 'dark',
    emoji: '🌙',
    mascotName: 'Low Sensory Night',
    mascotEmoji: '🌙',
    greetingMessage: 'Low sensory stimulation. Designed for light sensitivity & migraine prevention.',
    description: 'Pitch black background with gentle high-contrast text and zero visual clutter.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'all',
    palette: {
      primary: '#64748b',
      primaryBg: 'bg-slate-700',
      primaryHover: 'hover:bg-slate-600',
      primaryLight: 'bg-slate-900 text-slate-200',
      primaryBorder: 'border-slate-700',
      textAccent: 'text-slate-200',
      badgeBg: 'bg-slate-800 text-slate-200',
      appBg: 'bg-black text-slate-200',
      headerBg: 'bg-zinc-950 border-b border-zinc-800 text-slate-100',
      navActiveBg: 'bg-zinc-800 text-white shadow-xs ring-1 ring-zinc-700',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'classic',
  },

  // 14. STREET SKATE & SPORT (Teens / Kids)
  {
    id: 'theme-skate',
    name: 'Skate Park',
    category: 'skate',
    emoji: '🛹',
    mascotName: 'Skater Fox',
    mascotEmoji: '🛹',
    greetingMessage: 'Roll with the punches and kickflip through today’s checklist.',
    description: 'Urban asphalt slate, graffiti teal, and vibrant sunset orange accents.',
    costStars: 0,
    isUnlocked: true,
    targetAudience: 'teen',
    palette: {
      primary: '#ea580c',
      primaryBg: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-700',
      primaryLight: 'bg-orange-50 text-orange-950',
      primaryBorder: 'border-orange-300',
      textAccent: 'text-orange-950',
      badgeBg: 'bg-orange-200 text-orange-900',
      appBg: 'bg-gradient-to-b from-slate-100 via-orange-50/30 to-zinc-200 text-slate-900',
      headerBg: 'bg-white/95 border-b border-orange-200 text-slate-900',
      navActiveBg: 'bg-orange-600 text-white shadow-md ring-2 ring-orange-400',
    },
    wallpaperPattern: 'none',
    aacStyling: {
      tileBorderRadius: 'rounded-2xl',
      tileBorderWidth: 'border-2',
    },
    soundTheme: 'train',
  },
];

/**
 * Returns the customized emoji for an AAC item based on the active theme
 */
export function getThemedAacEmoji(item: AACItem, theme?: AppTheme): string {
  if (!theme) return item.emoji;

  // 1. Explicit word overrides in theme customWordEmojis
  if (theme.aacStyling?.customWordEmojis) {
    if (theme.aacStyling.customWordEmojis[item.label]) {
      return theme.aacStyling.customWordEmojis[item.label];
    }
    if (item.speechText && theme.aacStyling.customWordEmojis[item.speechText]) {
      return theme.aacStyling.customWordEmojis[item.speechText];
    }
    const labelLower = item.label.toLowerCase();
    for (const [key, val] of Object.entries(theme.aacStyling.customWordEmojis)) {
      if (key.toLowerCase() === labelLower) return val;
    }
  }

  // 2. Dynamic theme-wide visual adaptation across all AAC tiles (strict exact matching only)
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
    if (lower.some((i) => i.includes('music') || i.includes('lofi') || i.includes('chill') || i.includes('study') || i.includes('headphones'))) return 'theme-lofi';
    if (lower.some((i) => i.includes('game') || i.includes('gaming') || i.includes('tech') || i.includes('code') || i.includes('cyber'))) return 'theme-cyber';
    if (lower.some((i) => i.includes('skate') || i.includes('sport') || i.includes('board') || i.includes('outdoor'))) return 'theme-skate';
    if (lower.some((i) => i.includes('space') || i.includes('galaxy') || i.includes('astronomy'))) return 'theme-space';
    return 'theme-lofi';
  } else {
    // Adult
    if (lower.some((i) => i.includes('turtle') || i.includes('sea') || i.includes('nature') || i.includes('calm'))) return 'theme-turtle';
    if (lower.some((i) => i.includes('coffee') || i.includes('minimal') || i.includes('work') || i.includes('executive') || i.includes('focus'))) return 'theme-espresso';
    if (lower.some((i) => i.includes('dark') || i.includes('sensory') || i.includes('migraine') || i.includes('night') || i.includes('light'))) return 'theme-midnight';
    if (lower.some((i) => i.includes('nature') || i.includes('calm') || i.includes('sage') || i.includes('plant') || i.includes('mindful'))) return 'theme-sage';
    return 'theme-sage';
  }
}

