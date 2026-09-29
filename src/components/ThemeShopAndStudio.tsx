import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppTheme, ThemePalette, WallpaperPattern } from '../types';
import { 
  Sparkles, 
  Check, 
  Lock, 
  Plus, 
  Palette, 
  ShoppingBag, 
  Volume2, 
  Trash2, 
  Edit3, 
  Star, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { playChime, speakText } from '../utils/audio';

// Pre-packaged color presets for custom theme builder
const PALETTE_PRESETS: { name: string; icon: string; palette: ThemePalette }[] = [
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
    name: 'Sunset Amber',
    icon: '🦁',
    palette: {
      primary: '#d97706',
      primaryBg: 'bg-amber-500',
      primaryHover: 'hover:bg-amber-600',
      primaryLight: 'bg-amber-50/90',
      primaryBorder: 'border-amber-300',
      textAccent: 'text-amber-950',
      badgeBg: 'bg-amber-200',
      appBg: 'bg-amber-50/40',
      headerBg: 'bg-white/95 border-amber-100',
      navActiveBg: 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
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
];

// Quick mascot choices for kids & parents
const POPULAR_MASCOTS = [
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
  { emoji: '🍕', name: 'Pizza', sound: 'classic' as const },
  { emoji: '⭐', name: 'Star', sound: 'magic' as const },
];

interface ThemeShopAndStudioProps {
  onClose?: () => void;
  defaultMode?: 'shop' | 'studio';
}

export const ThemeShopAndStudio: React.FC<ThemeShopAndStudioProps> = ({
  onClose,
  defaultMode = 'shop',
}) => {
  const {
    themes,
    activeThemeId,
    activeTheme,
    setTheme,
    buyTheme,
    createCustomTheme,
    deleteCustomTheme,
    worldState,
    childProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shop' | 'studio'>(defaultMode);

  // --- STUDIO BUILDER FORM STATE ---
  const [customName, setCustomName] = useState('My Super Theme');
  const [customMascot, setCustomMascot] = useState('🦖');
  const [customMascotName, setCustomMascotName] = useState('Rexy');
  const [customGreeting, setCustomGreeting] = useState('Roar! Let’s have an awesome day!');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperPattern>('dino_footprints');
  const [selectedBorderRadius, setSelectedBorderRadius] = useState<'rounded-2xl' | 'rounded-3xl' | 'rounded-xl'>('rounded-3xl');
  const [selectedSoundTheme, setSelectedSoundTheme] = useState<'dino' | 'frog' | 'train' | 'space' | 'magic' | 'classic'>('dino');

  // Custom AAC button icons mapping
  const [customWordIcons, setCustomWordIcons] = useState<Record<string, string>>({
    'I want': '🦖',
    'Help': '🌋',
    'Play': '🦕',
    'Eat': '🌿',
    'Water': '💧',
  });

  const handleCustomWordChange = (word: string, icon: string) => {
    setCustomWordIcons((prev) => ({
      ...prev,
      [word]: icon,
    }));
  };

  const handleSaveCustomTheme = () => {
    if (!customName.trim()) {
      speakText('Please give your theme a name!');
      return;
    }

    const newTheme = createCustomTheme({
      name: customName.trim(),
      category: 'custom',
      emoji: customMascot,
      mascotName: customMascotName.trim() || 'My Buddy',
      mascotEmoji: customMascot,
      greetingMessage: customGreeting.trim() || `Welcome to ${customName}!`,
      description: `Custom theme created with ${customMascot} and love!`,
      costStars: 0,
      palette: PALETTE_PRESETS[selectedPaletteIndex].palette,
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
  };

  const handleReadTheme = (theme: AppTheme) => {
    playChime('tap');
    speakText(`${theme.name} theme. Mascot: ${theme.mascotName}. ${theme.description}`);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* 1. Header Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-600 rounded-3xl p-4 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🎨</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Themes & Customization Studio
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl font-medium">
              Transform Lumina to match your child's passions! Choose ready-made themes like 🦖 <strong>Dinosaurs</strong> or 🐸 <strong>Frogs</strong>, or create your own custom theme with favorite colors, mascots, and customized AAC buttons!
            </p>
          </div>

          {/* Star Wallet */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shrink-0 self-start sm:self-auto">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span className="text-sm font-black tracking-wide">
              {worldState.stars} Star Coins
            </span>
          </div>
        </div>

        {/* Tab Buttons: Ready-Made Store vs Custom Studio */}
        <div className="mt-5 flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('shop');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ready-Made Themes ({themes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('studio');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>Create Custom Theme ✨</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: READY-MADE THEMES SHOP */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          {/* Currently Active Theme Highlight */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl sm:text-5xl p-2 rounded-2xl bg-amber-100/70 border border-amber-200">
                {activeTheme.mascotEmoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Theme
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Mascot: {activeTheme.mascotName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
                  {activeTheme.name}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  "{activeTheme.greetingMessage}"
                </p>
              </div>
            </div>

            {/* Preview of Themed AAC Buttons */}
            {activeTheme.aacStyling?.customWordEmojis && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400 mr-1">AAC Emojis:</span>
                {Object.entries(activeTheme.aacStyling.customWordEmojis).slice(0, 4).map(([word, icon]) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <span>{icon}</span>
                    <span className="text-[10px]">{word}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grid of All Themes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {themes.map((theme) => {
              const isEquipped = theme.id === activeThemeId;
              const canAfford = worldState.stars >= theme.costStars;

              return (
                <div
                  key={theme.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isEquipped
                      ? 'border-emerald-500 ring-2 ring-emerald-300'
                      : theme.isUnlocked
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-200 opacity-95'
                  }`}
                >
                  <div>
                    {/* Top Row: Mascot & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
                          {theme.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-slate-800 text-base sm:text-lg">
                              {theme.name}
                            </h4>
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
                          title="Listen to theme info"
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

                    {/* Preview Color Swatch and Sample AAC Emojis */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Theme Palette & Pattern:</span>
                        <span className="capitalize">{theme.wallpaperPattern.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: theme.palette.primary }}
                          title={`Primary color ${theme.palette.primary}`}
                        />
                        <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-200">
                          <div
                            className="h-full w-full rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${theme.palette.primary}, #fef08a, #38bdf8)`,
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

                  {/* Action Buttons: Equip or Unlock */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isEquipped ? (
                      <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Currently Equipped</span>
                      </div>
                    ) : theme.isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => setTheme(theme.id)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Equip Theme</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => buyTheme(theme.id)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>
                          {canAfford
                            ? `Unlock for ⭐ ${theme.costStars} Stars`
                            : `Need ${theme.costStars - worldState.stars} more ⭐ (Cost: ${theme.costStars})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB: CREATE CUSTOM THEME STUDIO */}
      {activeTab === 'studio' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              <span>Theme Studio: Build Your Child's Dream World</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Customize colors, pick any mascot, and personalize AAC buttons so communication feels exciting and deeply personal!
            </p>
          </div>

          {/* Studio Step 1: Mascot & Name */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              1. Choose Mascot & Theme Name
            </label>

            {/* Quick Mascot Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {POPULAR_MASCOTS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setCustomMascot(m.emoji);
                    setCustomMascotName(m.name);
                    setSelectedSoundTheme(m.sound);
                    playChime('tap');
                  }}
                  className={`p-2.5 rounded-2xl text-2xl shrink-0 border-2 transition-all cursor-pointer ${
                    customMascot === m.emoji
                      ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-sm'
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
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Dinosaur Land, Frog Valley"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Emoji</label>
                <input
                  type="text"
                  value={customMascot}
                  onChange={(e) => setCustomMascot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-emerald-500 focus:outline-hidden text-center text-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Name</label>
                <input
                  type="text"
                  value={customMascotName}
                  onChange={(e) => setCustomMascotName(e.target.value)}
                  placeholder="e.g. Barnaby"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Greeting Phrase</label>
              <input
                type="text"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder="e.g. Roar! Welcome back, hero!"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Studio Step 2: Color Palette */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              2. Pick App Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PALETTE_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setSelectedPaletteIndex(idx);
                    playChime('tap');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    selectedPaletteIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full shrink-0 border-2 border-white shadow-2xs"
                    style={{ backgroundColor: p.palette.primary }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-800 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.icon} Accent</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Studio Step 3: Wallpaper Pattern */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              3. Background Pattern
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'dino_footprints', label: '🦖 Dino Tracks' },
                { id: 'lily_pads', label: '🐸 Lily Pads' },
                { id: 'cosmic_stars', label: '⭐ Cosmic Stars' },
                { id: 'bubbles', label: '🫧 Bubbles' },
                { id: 'railroad', label: '🚂 Railroad' },
                { id: 'sparkles', label: '✨ Sparkles' },
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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-2xs'
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
                4. Customize AAC Communication Buttons
              </label>
              <span className="text-[11px] font-bold text-emerald-700">
                Kid's favorite icons on tiles!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { word: 'I want', defaultIcon: '🦖', label: 'I want' },
                { word: 'Help', defaultIcon: '🌋', label: 'Help' },
                { word: 'Play', defaultIcon: '🦕', label: 'Play' },
                { word: 'Eat', defaultIcon: '🌿', label: 'Eat' },
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
                    className="w-full text-center text-xl py-1 rounded-xl border border-slate-200 bg-white font-bold focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Studio Step 5: Live Interactive Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                5. Live Theme Preview
              </label>
            </div>

            <div
              className={`p-4 rounded-3xl border-2 border-slate-300 shadow-inner ${PALETTE_PRESETS[selectedPaletteIndex].palette.appBg}`}
            >
              {/* Header Mockup */}
              <div
                className={`p-3 rounded-2xl mb-3 flex items-center justify-between shadow-xs ${PALETTE_PRESETS[selectedPaletteIndex].palette.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{customMascot}</span>
                  <div>
                    <h5 className="font-black text-xs leading-none">
                      {customName} Preview
                    </h5>
                    <span className="text-[10px] opacity-80">
                      Mascot: {customMascotName}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/40 text-[10px] font-bold">
                  ⭐ 25 Stars
                </span>
              </div>

              {/* Greeting Mockup */}
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white/50 mb-3">
                <p className="text-xs font-bold text-slate-800">
                  {customMascot} {customMascotName}: "{customGreeting}"
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
                      {customWordIcons[tile.word] || customMascot}
                    </span>
                    <span className="text-[10px] font-black">{tile.word}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save & Equip Theme Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCustomTheme}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Equip Theme!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
