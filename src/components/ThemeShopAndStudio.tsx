import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppTheme, ThemePalette, WallpaperPattern } from '../types';
import { 
  Star, 
  Check, 
  Palette, 
  ShoppingBag, 
  Volume2, 
  Trash2, 
  Edit3, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { playChime, speakText } from '../utils/audio';
import { PRESET_THEMES } from '../data/themesData';

// Pre-packaged color presets for theme customizer
const PALETTE_PRESETS: { name: string; icon: string; palette: ThemePalette }[] = [
  {
    name: 'BeeYou Honey Amber',
    icon: '🐝',
    palette: {
      primary: '#d97706',
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-600',
      primaryLight: 'bg-amber-50/90',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-200',
      appBg: 'bg-gradient-to-b from-amber-50/80 via-yellow-50/50 to-orange-50/80',
      headerBg: 'bg-white/95 border-amber-200',
      navActiveBg: 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
    },
  },
  {
    name: 'Wise Turtle Emerald',
    icon: '🐢',
    palette: {
      primary: '#059669',
      primaryBg: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryLight: 'bg-emerald-50/90',
      primaryBorder: 'border-emerald-400',
      textAccent: 'text-emerald-950',
      badgeBg: 'bg-emerald-200',
      appBg: 'bg-gradient-to-b from-teal-50 via-emerald-50/50 to-green-100',
      headerBg: 'bg-emerald-100/95 border-emerald-300',
      navActiveBg: 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400',
    },
  },
  {
    name: 'Jurassic Green',
    icon: '🦖',
    palette: {
      primary: '#16a34a',
      primaryBg: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryLight: 'bg-emerald-50/90',
      primaryBorder: 'border-emerald-400',
      textAccent: 'text-emerald-950',
      badgeBg: 'bg-emerald-200',
      appBg: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100',
      headerBg: 'bg-emerald-100/95 border-emerald-300',
      navActiveBg: 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-600',
    },
  },
  {
    name: 'Lily Frog Lime',
    icon: '🐸',
    palette: {
      primary: '#65a30d',
      primaryBg: 'bg-lime-600',
      primaryHover: 'hover:bg-lime-700',
      primaryLight: 'bg-lime-50/90',
      primaryBorder: 'border-lime-400',
      textAccent: 'text-lime-950',
      badgeBg: 'bg-lime-200',
      appBg: 'bg-gradient-to-b from-lime-50 via-emerald-50 to-teal-50',
      headerBg: 'bg-lime-100/95 border-lime-300',
      navActiveBg: 'bg-lime-500 text-white shadow-md ring-2 ring-lime-600',
    },
  },
  {
    name: 'Cosmic Indigo',
    icon: '🚀',
    palette: {
      primary: '#7c3aed',
      primaryBg: 'bg-violet-600',
      primaryHover: 'hover:bg-violet-700',
      primaryLight: 'bg-violet-50/90',
      primaryBorder: 'border-violet-300',
      textAccent: 'text-violet-950',
      badgeBg: 'bg-violet-200',
      appBg: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100',
      headerBg: 'bg-slate-900/95 border-violet-800 text-white',
      navActiveBg: 'bg-violet-500 text-white shadow-md ring-2 ring-violet-400',
    },
  },
  {
    name: 'Ocean Lagoon',
    icon: '🐬',
    palette: {
      primary: '#0891b2',
      primaryBg: 'bg-cyan-600',
      primaryHover: 'hover:bg-cyan-700',
      primaryLight: 'bg-cyan-50/90',
      primaryBorder: 'border-cyan-300',
      textAccent: 'text-cyan-950',
      badgeBg: 'bg-cyan-200',
      appBg: 'bg-gradient-to-b from-cyan-50 via-teal-50 to-blue-100',
      headerBg: 'bg-cyan-100/95 border-cyan-300',
      navActiveBg: 'bg-cyan-500 text-white shadow-md ring-2 ring-cyan-600',
    },
  },
  {
    name: 'Berry Fairytale',
    icon: '🦄',
    palette: {
      primary: '#db2777',
      primaryBg: 'bg-pink-600',
      primaryHover: 'hover:bg-pink-700',
      primaryLight: 'bg-pink-50/90',
      primaryBorder: 'border-pink-300',
      textAccent: 'text-pink-950',
      badgeBg: 'bg-pink-200',
      appBg: 'bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50',
      headerBg: 'bg-pink-100/95 border-pink-300',
      navActiveBg: 'bg-pink-400 text-white shadow-md ring-2 ring-pink-500',
    },
  },
  {
    name: 'Turbo Speedway Red',
    icon: '🏎️',
    palette: {
      primary: '#dc2626',
      primaryBg: 'bg-red-600',
      primaryHover: 'hover:bg-red-700',
      primaryLight: 'bg-red-50/90',
      primaryBorder: 'border-red-400',
      textAccent: 'text-red-950',
      badgeBg: 'bg-red-200',
      appBg: 'bg-gradient-to-b from-red-50 via-amber-50 to-slate-100',
      headerBg: 'bg-red-100/95 border-red-300',
      navActiveBg: 'bg-red-500 text-white shadow-md ring-2 ring-red-600',
    },
  },
  {
    name: 'Calm Sky Blue',
    icon: '☁️',
    palette: {
      primary: '#0284c7',
      primaryBg: 'bg-sky-600',
      primaryHover: 'hover:bg-sky-700',
      primaryLight: 'bg-sky-50/90',
      primaryBorder: 'border-sky-300',
      textAccent: 'text-sky-950',
      badgeBg: 'bg-sky-200',
      appBg: 'bg-gradient-to-b from-sky-50 via-blue-50 to-slate-100',
      headerBg: 'bg-sky-100/95 border-sky-300',
      navActiveBg: 'bg-sky-500 text-white shadow-md ring-2 ring-sky-600',
    },
  },
  {
    name: 'Locomotive Gold',
    icon: '🚂',
    palette: {
      primary: '#b45309',
      primaryBg: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      primaryLight: 'bg-amber-50/90',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-200',
      appBg: 'bg-gradient-to-b from-stone-100 via-amber-50/60 to-yellow-100/80',
      headerBg: 'bg-stone-100/95 border-amber-300',
      navActiveBg: 'bg-amber-500 text-white shadow-md ring-2 ring-amber-600',
    },
  },
];

// Quick mascot choices
const POPULAR_MASCOTS = [
  { emoji: '🐝', name: 'Busy Bee', sound: 'classic' as const },
  { emoji: '🐢', name: 'Wise Turtle', sound: 'turtle' as const },
  { emoji: '🦖', name: 'T-Rex', sound: 'dino' as const },
  { emoji: '🦕', name: 'Brachiosaurus', sound: 'dino' as const },
  { emoji: '🐸', name: 'Tree Frog', sound: 'frog' as const },
  { emoji: '🚂', name: 'Steam Train', sound: 'train' as const },
  { emoji: '🚀', name: 'Rocket', sound: 'space' as const },
  { emoji: '🐬', name: 'Dolphin', sound: 'classic' as const },
  { emoji: '🦄', name: 'Unicorn', sound: 'magic' as const },
  { emoji: '🐶', name: 'Puppy', sound: 'classic' as const },
  { emoji: '🐱', name: 'Kitty', sound: 'classic' as const },
  { emoji: '🦁', name: 'Lion', sound: 'classic' as const },
  { emoji: '🏎️', name: 'Racecar', sound: 'train' as const },
  { emoji: '🤖', name: 'Robot', sound: 'space' as const },
  { emoji: '🦋', name: 'Butterfly', sound: 'magic' as const },
  { emoji: '⭐', name: 'Star', sound: 'magic' as const },
];

function buildCustomPalette(primaryHex: string): ThemePalette {
  return {
    primary: primaryHex,
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-600',
    primaryLight: 'bg-amber-50/90',
    primaryBorder: 'border-amber-300',
    textAccent: 'text-slate-900',
    badgeBg: 'bg-amber-200',
    appBg: 'bg-gradient-to-b from-amber-50/70 via-stone-50 to-orange-50/60',
    headerBg: 'bg-white/95 border-amber-200',
    navActiveBg: 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400',
  };
}

interface ThemeShopAndStudioProps {
  onClose?: () => void;
  defaultMode?: 'shop' | 'studio';
  onStartTour?: () => void;
}

export const ThemeShopAndStudio: React.FC<ThemeShopAndStudioProps> = ({
  onClose,
  defaultMode = 'shop',
  onStartTour,
}) => {
  const {
    themes,
    activeThemeId,
    activeTheme,
    setTheme,
    createCustomTheme,
    updateTheme,
    resetThemeToPreset,
    deleteCustomTheme,
    isPremium,
    triggerUpgrade,
    editingThemeId: contextEditingThemeId,
    setEditingThemeId: setContextEditingThemeId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shop' | 'studio'>(defaultMode);
  const [ageFilter, setAgeFilter] = useState<'all' | 'kid' | 'teen' | 'adult' | 'custom'>('all');

  // Currently editing theme ID (null means creating a new theme)
  const [targetEditingThemeId, setTargetEditingThemeId] = useState<string | null>(contextEditingThemeId || null);

  // --- STUDIO & EDITOR FORM STATE ---
  const [themeName, setThemeName] = useState('My Custom Theme');
  const [mascotEmoji, setMascotEmoji] = useState('🐝');
  const [mascotName, setMascotName] = useState('Bee');
  const [greetingMessage, setGreetingMessage] = useState('Welcome back! Let us explore together!');
  const [themeDescription, setThemeDescription] = useState('A warm, personalized theme crafted with love.');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#d97706');
  const [useCustomHex, setUseCustomHex] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperPattern>('sparkles');
  const [selectedBorderRadius, setSelectedBorderRadius] = useState<'rounded-2xl' | 'rounded-3xl' | 'rounded-xl'>('rounded-3xl');
  const [selectedSoundTheme, setSelectedSoundTheme] = useState<'turtle' | 'dino' | 'frog' | 'train' | 'space' | 'magic' | 'classic'>('classic');

  // AAC button icons mapping
  const [customWordIcons, setCustomWordIcons] = useState<Record<string, string>>({
    'I want': '🐝',
    'Help': '🛟',
    'Play': '🧩',
    'Eat': '🥪',
    'Water': '💧',
  });

  // Handle external editingThemeId from context if passed
  useEffect(() => {
    if (contextEditingThemeId) {
      handleOpenThemeEditor(contextEditingThemeId);
    }
  }, [contextEditingThemeId]);

  // Load a theme into the editor
  const handleOpenThemeEditor = (themeId: string) => {
    const target = themes.find((t) => t.id === themeId);
    if (!target) return;

    setTargetEditingThemeId(target.id);
    setThemeName(target.name);
    setMascotEmoji(target.mascotEmoji || target.emoji || '🐝');
    setMascotName(target.mascotName || 'Buddy');
    setGreetingMessage(target.greetingMessage || 'Welcome back!');
    setThemeDescription(target.description || '');
    setSelectedWallpaper(target.wallpaperPattern || 'none');
    setSelectedBorderRadius(target.aacStyling?.tileBorderRadius || 'rounded-3xl');
    setSelectedSoundTheme(target.soundTheme || 'classic');

    if (target.aacStyling?.customWordEmojis) {
      setCustomWordIcons({ ...target.aacStyling.customWordEmojis });
    }

    // Try finding matching palette index, else set custom hex
    const pIdx = PALETTE_PRESETS.findIndex((p) => p.palette.primary.toLowerCase() === target.palette.primary.toLowerCase());
    if (pIdx >= 0) {
      setSelectedPaletteIndex(pIdx);
      setUseCustomHex(false);
      setCustomPrimaryColor(target.palette.primary);
    } else {
      setUseCustomHex(true);
      setCustomPrimaryColor(target.palette.primary || '#d97706');
    }

    setActiveTab('studio');
    playChime('tap');
  };

  const handleStartCreateNewTheme = () => {
    setTargetEditingThemeId(null);
    setContextEditingThemeId(null);
    setThemeName('My Custom Theme');
    setMascotEmoji('🐝');
    setMascotName('Bee');
    setGreetingMessage('Welcome back! Let us explore together!');
    setThemeDescription('A warm, personalized theme crafted with love.');
    setSelectedPaletteIndex(0);
    setUseCustomHex(false);
    setCustomPrimaryColor('#d97706');
    setSelectedWallpaper('sparkles');
    setSelectedSoundTheme('classic');
    setActiveTab('studio');
    playChime('tap');
  };

  const handleCustomWordChange = (word: string, icon: string) => {
    setCustomWordIcons((prev) => ({
      ...prev,
      [word]: icon,
    }));
  };

  const getEffectivePalette = (): ThemePalette => {
    if (useCustomHex) {
      return buildCustomPalette(customPrimaryColor);
    }
    return PALETTE_PRESETS[selectedPaletteIndex]?.palette || PALETTE_PRESETS[0].palette;
  };

  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      speakText('Please give your theme a name!');
      return;
    }

    const effectivePalette = getEffectivePalette();

    if (targetEditingThemeId) {
      // EDIT EXISTING THEME
      updateTheme(targetEditingThemeId, {
        name: themeName.trim(),
        emoji: mascotEmoji,
        mascotName: mascotName.trim() || 'Buddy',
        mascotEmoji: mascotEmoji,
        greetingMessage: greetingMessage.trim() || `Welcome to ${themeName}!`,
        description: themeDescription.trim() || `Theme styled with ${mascotEmoji} and warmth.`,
        palette: effectivePalette,
        wallpaperPattern: selectedWallpaper,
        aacStyling: {
          tileBorderRadius: selectedBorderRadius,
          tileBorderWidth: 'border-3',
          customWordEmojis: customWordIcons,
        },
        soundTheme: selectedSoundTheme,
      });

      setTheme(targetEditingThemeId);
      playChime('star');
      speakText(`Theme ${themeName} updated!`);
      setActiveTab('shop');
      if (onClose) onClose();
    } else {
      // CREATE NEW THEME
      const newTheme = createCustomTheme({
        name: themeName.trim(),
        category: 'custom',
        emoji: mascotEmoji,
        mascotName: mascotName.trim() || 'Buddy',
        mascotEmoji: mascotEmoji,
        greetingMessage: greetingMessage.trim() || `Welcome to ${themeName}!`,
        description: themeDescription.trim() || `Custom theme styled with ${mascotEmoji}.`,
        costStars: 0,
        palette: effectivePalette,
        wallpaperPattern: selectedWallpaper,
        aacStyling: {
          tileBorderRadius: selectedBorderRadius,
          tileBorderWidth: 'border-3',
          customWordEmojis: customWordIcons,
        },
        soundTheme: selectedSoundTheme,
      });

      playChime('star');
      setActiveTab('shop');
      if (onClose) onClose();
    }
  };

  const handleReadTheme = (theme: AppTheme) => {
    playChime('tap');
    speakText(`${theme.name} theme. Mascot: ${theme.mascotName}. ${theme.description}`);
  };

  const filteredThemes = themes.filter((t) => {
    if (ageFilter === 'all') return true;
    if (ageFilter === 'custom') return t.isCustom;
    if (t.targetAudience === 'all') return true;
    return t.targetAudience === ageFilter;
  });

  const editingThemeObject = targetEditingThemeId ? themes.find((t) => t.id === targetEditingThemeId) : null;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* 1. Header Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-4 sm:p-6 text-amber-950 shadow-md border-2 border-amber-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl p-1.5 rounded-2xl bg-white/80 shadow-xs">🎨</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Themes & Visual Customizer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-950/80 mt-1 max-w-xl font-semibold leading-relaxed">
              Transform BeeYou to match passions and sensory needs! Pick ready-made themes (like 🐝 <strong>Bee Classic</strong> or 🐢 <strong>Wise Turtle</strong>), or edit and create your own themes with custom colors and mascots.
            </p>
          </div>

          {/* Action cluster: How This Works + Default Theme Button */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            {onStartTour && (
              <button
                type="button"
                onClick={onStartTour}
                className="px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-900 font-black text-xs flex items-center gap-1.5 border border-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>💡 Tour</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setTheme('theme-classic');
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95 ${
                activeThemeId === 'theme-classic'
                  ? 'bg-amber-950/20 text-amber-950 border border-amber-950/30 ring-1 ring-amber-950/20 cursor-default'
                  : 'bg-white text-amber-950 hover:bg-amber-50 border border-amber-300'
              }`}
              title="Reset BeeYou to default honey yellow theme"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${activeThemeId === 'theme-classic' ? 'text-amber-900' : 'text-amber-600'}`} />
              <span>Default Theme</span>
              {activeThemeId === 'theme-classic' && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>

            {/* Premium Status Pill */}
            {isPremium ? (
              <div className="flex items-center gap-1.5 bg-white/40 px-3.5 py-2 rounded-2xl border border-white/60 shrink-0 text-amber-950">
                <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span className="text-xs font-black tracking-wide">
                  All Unlocked
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => triggerUpgrade('Unlock all 14+ themes and the custom Theme Studio with BeeYou Premium!')}
                className="flex items-center gap-1.5 bg-amber-900 hover:bg-amber-950 text-white px-3.5 py-2 rounded-2xl border border-amber-800 shrink-0 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>15-Day Free Trial</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons: Themes Catalog vs Theme Studio / Editor */}
        <div className="mt-5 flex items-center gap-2 bg-amber-950/15 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('shop');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-950/80 hover:bg-white/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ready-Made Themes ({themes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (targetEditingThemeId) {
                setActiveTab('studio');
              } else {
                handleStartCreateNewTheme();
              }
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-950/80 hover:bg-white/20'
            }`}
          >
            {targetEditingThemeId ? (
              <>
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>Editing: {themeName}</span>
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 text-amber-700" />
                <span>Create & Edit Theme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB: READY-MADE THEMES SHOP */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          {/* Currently Active Theme Highlight */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-4xl sm:text-5xl p-2 rounded-2xl bg-amber-100/70 border border-amber-200 shrink-0">
                {activeTheme.mascotEmoji || activeTheme.emoji}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Theme
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Mascot: {activeTheme.mascotName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-0.5 truncate">
                  {activeTheme.name}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5 italic">
                  "{activeTheme.greetingMessage}"
                </p>
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenThemeEditor(activeTheme.id)}
                className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-amber-300 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Edit this theme's colors, mascot, or greetings"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Theme</span>
              </button>

              {activeThemeId !== 'theme-classic' ? (
                <button
                  type="button"
                  onClick={() => {
                    setTheme('theme-classic');
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Switch back to classic BeeYou default theme"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reset to Default</span>
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5">
                  <span>🐝 Default Theme Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Age Group & Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-500 mr-1">Filter Themes:</span>
              {[
                { id: 'all', label: 'All Themes', emoji: '🌟' },
                { id: 'kid', label: 'Kids (3–11)', emoji: '🧒' },
                { id: 'teen', label: 'Teens (12–17)', emoji: '🎧' },
                { id: 'adult', label: 'Adults (18+)', emoji: '💼' },
                { id: 'custom', label: 'Custom Creations', emoji: '⭐' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setAgeFilter(f.id as any);
                    playChime('tap');
                  }}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    ageFilter === f.id
                      ? 'bg-amber-500 text-white shadow-xs font-black'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleStartCreateNewTheme}
              className="px-3.5 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Create New Theme</span>
            </button>
          </div>

          {/* Grid of All Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredThemes.map((theme) => {
              const isEquipped = theme.id === activeThemeId;

              return (
                <div
                  key={theme.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isEquipped
                      ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/20'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Mascot & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-amber-50 border border-amber-200 shrink-0">
                          {theme.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-slate-800 text-base sm:text-lg">
                              {theme.name}
                            </h4>
                            {theme.id === 'theme-classic' && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                Default
                              </span>
                            )}
                            {theme.isCustom && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            Mascot: {theme.mascotName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleReadTheme(theme)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="Listen to theme description"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        {theme.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete custom theme "${theme.name}"?`)) {
                                deleteCustomTheme(theme.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete custom theme"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 font-medium mb-3">
                      {theme.description}
                    </p>

                    {/* Color Swatch & Pattern */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Palette & Pattern:</span>
                        <span className="capitalize">{theme.wallpaperPattern.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs shrink-0"
                          style={{ backgroundColor: theme.palette.primary }}
                          title={`Primary color ${theme.palette.primary}`}
                        />
                        <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-200">
                          <div
                            className="h-full w-full rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${theme.palette.primary}, #FED676, #38bdf8)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* AAC Preview Tiles */}
                      {theme.aacStyling?.customWordEmojis && (
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400">Sample AAC:</span>
                          {Object.entries(theme.aacStyling.customWordEmojis).slice(0, 3).map(([word, icon]) => (
                            <span
                              key={word}
                              className="text-[11px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200"
                            >
                              {icon} {word}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Equip & Edit */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenThemeEditor(theme.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="Edit this theme"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {isEquipped ? (
                      <div className="py-2 px-3.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTheme(theme.id)}
                        className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Equip Theme</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB: THEME STUDIO & EDITOR */}
      {activeTab === 'studio' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg sm:text-xl font-black text-slate-800">
                  {targetEditingThemeId ? `Edit Theme: ${themeName}` : "Theme Studio: Build Your Dream Theme"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Customize colors, mascots, greetings, and AAC button emojis. Changes apply immediately to the entire app!
              </p>
            </div>

            {targetEditingThemeId && (
              <button
                type="button"
                onClick={handleStartCreateNewTheme}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch to New Theme</span>
              </button>
            )}
          </div>

          {/* Studio Step 1: Mascot & Name */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              1. Theme Identity & Mascot
            </label>

            {/* Quick Mascot Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {POPULAR_MASCOTS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setMascotEmoji(m.emoji);
                    setMascotName(m.name);
                    setSelectedSoundTheme(m.sound);
                    playChime('tap');
                  }}
                  className={`p-2.5 rounded-2xl text-2xl shrink-0 border-2 transition-all cursor-pointer ${
                    mascotEmoji === m.emoji
                      ? 'border-amber-500 bg-amber-50 scale-105 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                  title={m.name}
                >
                  {m.emoji}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Theme Name</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="e.g. Honey Bee, Wise Turtle"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Emoji</label>
                <input
                  type="text"
                  value={mascotEmoji}
                  onChange={(e) => setMascotEmoji(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-amber-500 focus:outline-hidden text-center text-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Name</label>
                <input
                  type="text"
                  value={mascotName}
                  onChange={(e) => setMascotName(e.target.value)}
                  placeholder="e.g. Barnaby"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Greeting Phrase</label>
              <input
                type="text"
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                placeholder="e.g. Buzz! Welcome back, hero!"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Studio Step 2: Color Palette */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                2. App Color Palette
              </label>
              <span className="text-[11px] font-bold text-amber-700">
                Widgets adapt to these colors!
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PALETTE_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setSelectedPaletteIndex(idx);
                    setUseCustomHex(false);
                    setCustomPrimaryColor(p.palette.primary);
                    playChime('tap');
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2 ${
                    !useCustomHex && selectedPaletteIndex === idx
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-2xs"
                    style={{ backgroundColor: p.palette.primary }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-800 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.icon}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Color Picker Row */}
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-amber-950">Or choose custom primary color:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimaryColor}
                  onChange={(e) => {
                    setCustomPrimaryColor(e.target.value);
                    setUseCustomHex(true);
                  }}
                  className="w-9 h-9 rounded-xl border border-amber-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={customPrimaryColor}
                  onChange={(e) => {
                    setCustomPrimaryColor(e.target.value);
                    setUseCustomHex(true);
                  }}
                  placeholder="#D97706"
                  className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* Studio Step 3: Wallpaper Pattern */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              3. Background Wallpaper Pattern
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'sparkles', label: '⭐ Calm Star' },
                { id: 'turtle_shell', label: '🐢 Turtle Shell' },
                { id: 'dino_footprints', label: '🦖 Dino Tracks' },
                { id: 'lily_pads', label: '🐸 Lily Pads' },
                { id: 'cosmic_stars', label: '🚀 Cosmic Stars' },
                { id: 'bubbles', label: '🫧 Bubbles' },
                { id: 'railroad', label: '🚂 Railroad' },
                { id: 'ocean_waves', label: '🌊 Ocean Waves' },
                { id: 'zen_botanical', label: '🌿 Zen Leaves' },
                { id: 'none', label: '🧼 Clean Solid' },
              ].map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => {
                    setSelectedWallpaper(wp.id as WallpaperPattern);
                    playChime('tap');
                  }}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                    selectedWallpaper === wp.id
                      ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs font-black'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Step 4: Customizable AAC Button Emojis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                4. Customize AAC Communication Tiles
              </label>
              <span className="text-[11px] font-bold text-amber-800">
                Mascots on communication buttons!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { word: 'I want', defaultIcon: '🐝', label: 'I want' },
                { word: 'Help', defaultIcon: '🛟', label: 'Help' },
                { word: 'Play', defaultIcon: '🧩', label: 'Play' },
                { word: 'Eat', defaultIcon: '🥪', label: 'Eat' },
                { word: 'Water', defaultIcon: '💧', label: 'Water' },
              ].map((item) => (
                <div key={item.word} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-black text-slate-700 block mb-1">
                    "{item.word}" Tile
                  </span>
                  <input
                    type="text"
                    value={customWordIcons[item.word] || item.defaultIcon}
                    onChange={(e) => handleCustomWordChange(item.word, e.target.value)}
                    className="w-full text-center text-xl py-1 rounded-xl border border-slate-200 bg-white font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Studio Step 5: Live Real-Time Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                5. Live Theme Preview
              </label>
            </div>

            <div
              className={`p-4 rounded-3xl border-2 border-slate-300 shadow-inner ${getEffectivePalette().appBg}`}
            >
              {/* Header Mockup */}
              <div
                className={`p-3 rounded-2xl mb-3 flex items-center justify-between shadow-xs ${getEffectivePalette().headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{mascotEmoji}</span>
                  <div>
                    <h5 className="font-black text-xs leading-none">
                      {themeName} Preview
                    </h5>
                    <span className="text-[10px] opacity-80">
                      Mascot: {mascotName}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-bold text-slate-800">
                  Theme Preview
                </span>
              </div>

              {/* Greeting Mockup */}
              <div className="bg-white/85 backdrop-blur-xs p-3 rounded-2xl border border-white/60 mb-3 shadow-2xs">
                <p className="text-xs font-bold text-slate-800">
                  {mascotEmoji} {mascotName}: "{greetingMessage}"
                </p>
              </div>

              {/* Sample AAC Tiles Mockup */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { word: 'I want', bg: 'bg-amber-100 border-amber-300 text-amber-950' },
                  { word: 'Help', bg: 'bg-rose-100 border-rose-300 text-rose-950' },
                  { word: 'Play', bg: 'bg-emerald-100 border-emerald-300 text-emerald-950' },
                  { word: 'Eat', bg: 'bg-orange-100 border-orange-300 text-orange-950' },
                ].map((tile) => (
                  <div
                    key={tile.word}
                    className={`p-2 rounded-2xl border-2 text-center shadow-xs ${tile.bg}`}
                  >
                    <span className="text-2xl block mb-0.5">
                      {customWordIcons[tile.word] || mascotEmoji}
                    </span>
                    <span className="text-[10px] font-black">{tile.word}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save & Equip Theme Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              {targetEditingThemeId && editingThemeObject && !editingThemeObject.isCustom && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Reset "${editingThemeObject.name}" to factory default settings?`)) {
                      resetThemeToPreset(targetEditingThemeId);
                      handleOpenThemeEditor(targetEditingThemeId);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Factory Default</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('shop')}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTheme}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Star className="w-4 h-4" />
                <span>{targetEditingThemeId ? 'Save Changes & Equip!' : 'Save & Equip Theme!'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
