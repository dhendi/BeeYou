import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowLeft,
  ArrowRight,
  X,
  UploadCloud,
  Image as ImageIcon,
  Layers,
  HelpCircle,
  Smile,
  Headphones,
  Briefcase
} from 'lucide-react';
import { playChime, speakText } from '../utils/audio';
import { PRESET_THEMES, getThemeIcon } from '../data/themesData';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { getThemeCustomizerHeaderStyles } from '../utils/themeWidgetHelper';
import { useModalBackHandler } from '../services/modalBackHandler';
import { ThemeWallpaperArt } from './ThemeWallpaperArt';
import { ChildHeader } from './ChildHeader';
import { ChildHomeView } from './ChildHomeView';
import { ChildNavBar } from './ChildNavBar';

// Pre-packaged color presets for theme customizer
const PALETTE_PRESETS: { name: string; palette: ThemePalette }[] = [
  {
    name: 'BeeYou Honey Amber',
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
    name: 'Turbo Speedway Black',
    palette: {
      primary: '#000000',
      primaryBg: 'bg-zinc-900',
      primaryHover: 'hover:bg-black',
      primaryLight: 'bg-zinc-100/90',
      primaryBorder: 'border-zinc-400',
      textAccent: 'text-zinc-950',
      badgeBg: 'bg-zinc-200',
      appBg: 'bg-gradient-to-b from-zinc-100 via-stone-50 to-slate-100',
      headerBg: 'bg-zinc-100/95 border-zinc-300',
      navActiveBg: 'bg-zinc-900 text-white shadow-md ring-2 ring-zinc-700',
    },
  },
  {
    name: 'Calm Sky Blue',
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

// Quick mascot choices - 12 distinct mascots, each with its own unique sticker icon
export interface PopularMascot {
  emoji: string;
  name: string;
  sound: 'classic' | 'turtle' | 'dino' | 'frog' | 'train' | 'space' | 'magic';
  icon: string;
}

const POPULAR_MASCOTS: PopularMascot[] = [
  { emoji: '🐝', name: 'Busy Bee', sound: 'classic', icon: '/assets/stickers/bee_mascot.webp' },
  { emoji: '🐢', name: 'Wise Turtle', sound: 'turtle', icon: '/assets/stickers/turtle_mascot.webp' },
  { emoji: '🦖', name: 'T-Rex', sound: 'dino', icon: '/assets/stickers/dino_rex.webp' },
  { emoji: '🐸', name: 'Tree Frog', sound: 'frog', icon: '/assets/stickers/frog_mascot.webp' },
  { emoji: '🚂', name: 'Steam Train', sound: 'train', icon: '/assets/stickers/train_mascot.webp' },
  { emoji: '🚀', name: 'Cosmic Astro', sound: 'space', icon: '/assets/stickers/space_mascot.webp' },
  { emoji: '🐬', name: 'Splash Dolphin', sound: 'classic', icon: '/assets/stickers/ocean_mascot.webp' },
  { emoji: '🦄', name: 'Stardust Unicorn', sound: 'magic', icon: '/assets/stickers/fairytale_mascot.webp' },
  { emoji: '🏎️', name: 'Turbo Racer', sound: 'train', icon: '/assets/stickers/racing_mascot.webp' },
  { emoji: '🐶', name: 'Station Pup', sound: 'classic', icon: '/assets/stickers/train_station_dog.webp' },
  { emoji: '🦁', name: 'Brave Lion', sound: 'classic', icon: '/assets/stickers/open_mouth_lion.webp' },
  { emoji: '🧸', name: 'Cozy Teddy', sound: 'classic', icon: '/assets/stickers/teddy_bear.webp' },
];

export interface WallpaperPatternOption {
  id: WallpaperPattern;
  label: string;
  icon: string;
}

export const WALLPAPER_PATTERN_OPTIONS: WallpaperPatternOption[] = [
  { id: 'honeycomb_clouds', label: 'Honeycomb & Clouds', icon: '/assets/stickers/bee_mascot.webp' },
  { id: 'sparkles', label: 'Calm Star', icon: '/assets/stickers/fairytale_star_gold.webp' },
  { id: 'turtle_shell', label: 'Turtle Shell', icon: '/assets/stickers/turtle_mascot.webp' },
  { id: 'dino_footprints', label: 'Dino Tracks', icon: '/assets/stickers/dino_rex.webp' },
  { id: 'lily_pads', label: 'Lily Pads', icon: '/assets/stickers/frog_mascot.webp' },
  { id: 'cosmic_stars', label: 'Cosmic Stars', icon: '/assets/stickers/space_mascot.webp' },
  { id: 'bubbles', label: 'Bubbles', icon: '/assets/stickers/ocean_mascot.webp' },
  { id: 'railroad', label: 'Railroad', icon: '/assets/stickers/train_mascot.webp' },
  { id: 'ocean_waves', label: 'Ocean Waves', icon: '/assets/stickers/ocean_ocean_wave.webp' },
  { id: 'racing', label: 'Speedway Track', icon: '/assets/stickers/racing_mascot.webp' },
  { id: 'zen_botanical', label: 'Zen Leaves', icon: '/assets/stickers/autumn_leaf.webp' },
  { id: 'none', label: 'Clean Solid', icon: '/assets/stickers/soap_wash_hands.webp' },
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
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shop' | 'studio'>(() => (!isPremium && defaultMode === 'studio' ? 'shop' : defaultMode));
  const [ageFilter, setAgeFilter] = useState<'all' | 'kid' | 'teen' | 'adult' | 'custom'>('all');

  // Ensure basic plan users cannot access or stay on studio tab
  useEffect(() => {
    if (!isPremium && activeTab === 'studio') {
      setActiveTab('shop');
    }
  }, [isPremium, activeTab]);

  // Currently editing theme ID (null means creating a new theme)
  const [targetEditingThemeId, setTargetEditingThemeId] = useState<string | null>(contextEditingThemeId || null);

  // --- STUDIO & EDITOR FORM STATE ---
  const [themeName, setThemeName] = useState('My Custom Theme');
  const [mascotEmoji, setMascotEmoji] = useState('🐝');
  const [mascotName, setMascotName] = useState('Bee');
  const [mascotIcon, setMascotIcon] = useState('/assets/stickers/bee_mascot.webp');
  const [greetingMessage, setGreetingMessage] = useState('Welcome back! Let us explore together!');
  const [themeDescription, setThemeDescription] = useState('A warm, personalized theme crafted with love.');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#d97706');
  const [useCustomHex, setUseCustomHex] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperPattern>('sparkles');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBorderRadius, setSelectedBorderRadius] = useState<'rounded-2xl' | 'rounded-3xl' | 'rounded-xl'>('rounded-3xl');
  const [selectedSoundTheme, setSelectedSoundTheme] = useState<'turtle' | 'dino' | 'frog' | 'train' | 'space' | 'magic' | 'classic'>('classic');

  // Full-Screen Live Homepage Preview State
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  useModalBackHandler(showFullScreenPreview, () => setShowFullScreenPreview(false), 50);

  const getEffectivePalette = (): ThemePalette => {
    if (useCustomHex) {
      return buildCustomPalette(customPrimaryColor);
    }
    return PALETTE_PRESETS[selectedPaletteIndex]?.palette || PALETTE_PRESETS[0].palette;
  };

  const previewTheme: AppTheme = {
    id: targetEditingThemeId || 'preview-custom-theme',
    name: themeName.trim() || 'My Custom Theme',
    category: (targetEditingThemeId ? themes.find((t) => t.id === targetEditingThemeId)?.category : 'custom') || 'custom',
    emoji: mascotEmoji,
    icon: mascotIcon || undefined,
    mascotName: mascotName.trim() || 'Buddy',
    mascotEmoji: mascotEmoji,
    mascotIcon: mascotIcon || undefined,
    greetingMessage: greetingMessage.trim() || `Welcome to ${themeName}!`,
    description: themeDescription.trim() || `Custom theme styled with ${mascotEmoji}.`,
    costStars: 0,
    isUnlocked: true,
    palette: {
      ...getEffectivePalette(),
      wallpaperUrl: customWallpaperUrl || undefined,
    },
    wallpaperPattern: customWallpaperUrl ? 'custom' : selectedWallpaper,
    aacStyling: {
      tileBorderRadius: selectedBorderRadius,
      tileBorderWidth: 'border-3',
    },
    soundTheme: selectedSoundTheme,
  };

  // Handle external editingThemeId from context if passed
  useEffect(() => {
    if (contextEditingThemeId) {
      if (!isPremium) {
        triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
        setContextEditingThemeId(null);
        return;
      }
      handleOpenThemeEditor(contextEditingThemeId);
    }
  }, [contextEditingThemeId, isPremium]);

  // Load a theme into the editor
  const handleOpenThemeEditor = (themeId: string) => {
    if (!isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    const target = themes.find((t) => t.id === themeId);
    if (!target) return;

    setTargetEditingThemeId(target.id);
    setThemeName(target.name);
    setMascotEmoji(target.mascotEmoji || target.emoji || '🐝');
    setMascotName(target.mascotName || 'Buddy');
    setMascotIcon(getThemeIcon(target) || target.icon || target.mascotIcon || '');
    setGreetingMessage(target.greetingMessage || 'Welcome back!');
    setThemeDescription(target.description || '');
    setSelectedWallpaper(target.wallpaperPattern || 'none');
    setCustomWallpaperUrl(
      target.palette?.wallpaperUrl &&
      (target.palette.wallpaperUrl.startsWith('data:') || target.palette.wallpaperUrl.startsWith('blob:') || target.wallpaperPattern === 'custom')
        ? target.palette.wallpaperUrl
        : null
    );
    setSelectedBorderRadius(target.aacStyling?.tileBorderRadius || 'rounded-3xl');
    setSelectedSoundTheme(target.soundTheme || 'classic');

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
    if (!isPremium) {
      triggerUpgrade('Custom Theme Studio is a BeeYou Plus feature! Start your 15-day free trial to craft your own themes.');
      return;
    }
    setTargetEditingThemeId(null);
    setContextEditingThemeId(null);
    setThemeName('My Custom Theme');
    setMascotEmoji('🐝');
    setMascotName('Bee');
    setMascotIcon('/assets/stickers/bee_mascot.webp');
    setGreetingMessage('Welcome back! Let us explore together!');
    setThemeDescription('A warm, personalized theme crafted with love.');
    setSelectedPaletteIndex(0);
    setUseCustomHex(false);
    setCustomPrimaryColor('#d97706');
    setSelectedWallpaper('sparkles');
    setCustomWallpaperUrl(null);
    setSelectedSoundTheme('classic');
    setActiveTab('studio');
    playChime('tap');
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      triggerUpgrade('Custom wallpaper photo upload is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      speakText('Please choose an image file like PNG or JPEG');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Automatically compress & resize large photos using canvas to stay well within localStorage limits
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setCustomWallpaperUrl(compressed);
          setSelectedWallpaper('custom');
          playChime('star');
          speakText('Wallpaper uploaded!');
        } else {
          setCustomWallpaperUrl(dataUrl);
          setSelectedWallpaper('custom');
          playChime('star');
          speakText('Wallpaper uploaded!');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveTheme = () => {
    if (!isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }

    if (!themeName.trim()) {
      speakText('Please give your theme a name!');
      return;
    }

    const basePalette = getEffectivePalette();
    const effectivePalette: ThemePalette = {
      ...basePalette,
      wallpaperUrl: customWallpaperUrl || undefined,
    };

    if (targetEditingThemeId) {
      // EDIT EXISTING THEME
      updateTheme(targetEditingThemeId, {
        name: themeName.trim(),
        emoji: mascotEmoji,
        icon: mascotIcon || undefined,
        mascotName: mascotName.trim() || 'Buddy',
        mascotEmoji: mascotEmoji,
        mascotIcon: mascotIcon || undefined,
        greetingMessage: greetingMessage.trim() || `Welcome to ${themeName}!`,
        description: themeDescription.trim() || `Theme styled with ${mascotEmoji} and warmth.`,
        palette: effectivePalette,
        wallpaperPattern: customWallpaperUrl ? 'custom' : selectedWallpaper,
        aacStyling: {
          tileBorderRadius: selectedBorderRadius,
          tileBorderWidth: 'border-3',
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
        icon: mascotIcon || undefined,
        mascotName: mascotName.trim() || 'Buddy',
        mascotEmoji: mascotEmoji,
        mascotIcon: mascotIcon || undefined,
        greetingMessage: greetingMessage.trim() || `Welcome to ${themeName}!`,
        description: themeDescription.trim() || `Custom theme styled with ${mascotEmoji}.`,
        costStars: 0,
        palette: effectivePalette,
        wallpaperPattern: customWallpaperUrl ? 'custom' : selectedWallpaper,
        aacStyling: {
          tileBorderRadius: selectedBorderRadius,
          tileBorderWidth: 'border-3',
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
  const headerStyles = getThemeCustomizerHeaderStyles(activeTheme);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto space-y-4">
      {/* 1. Header Banner & Mode Switcher */}
      <div className={`${headerStyles.bannerGradient} rounded-3xl p-4 sm:p-6 shadow-md border-2 ${headerStyles.bannerBorder} transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-amber-600">
                <Palette className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${headerStyles.bannerText}`}>
                Themes & Visual Customizer
              </h2>
            </div>
            <p className={`text-xs sm:text-sm ${headerStyles.bannerSubtext} mt-1 max-w-xl font-semibold leading-relaxed`}>
              Transform BeeYou to match passions and sensory needs! Pick ready-made themes (like <strong>Bee Classic</strong> or <strong>Wise Turtle</strong>), or edit and create your own themes with custom colors and mascots.
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
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Tour</span>
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
                  ? 'bg-black/15 text-current border border-white/40 ring-1 ring-white/20 cursor-default'
                  : 'bg-white text-slate-900 hover:bg-slate-50 border border-white/60'
              }`}
              title="Reset BeeYou to default honey yellow theme"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${activeThemeId === 'theme-classic' ? 'text-current opacity-80' : 'text-slate-600'}`} />
              <span>Default Theme</span>
              {activeThemeId === 'theme-classic' && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>

            {/* Premium Status Pill */}
            {isPremium ? (
              <div className="flex items-center gap-1.5 bg-white/30 px-3.5 py-2 rounded-2xl border border-white/50 shrink-0 text-current">
                <Crown className="w-4 h-4 fill-amber-300 text-amber-300 drop-shadow-2xs" />
                <span className="text-xs font-black tracking-wide">
                  All Unlocked
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => triggerUpgrade('Unlock all 14+ themes and the custom Theme Studio with BeeYou Premium!')}
                className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-white px-3.5 py-2 rounded-2xl border border-white/40 shrink-0 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>15-Day Free Trial</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons: Themes Catalog vs Theme Studio / Editor */}
        <div className={`mt-5 flex items-center gap-2 ${headerStyles.tabContainerBg} p-1.5 rounded-2xl`}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('shop');
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? headerStyles.activeTabStyle
                : headerStyles.inactiveTabStyle
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ready-Made Themes ({themes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isPremium) {
                triggerUpgrade('Custom Theme Studio is a BeeYou Plus feature! Start your 15-day free trial to craft your own themes.');
                return;
              }
              if (targetEditingThemeId) {
                setActiveTab('studio');
              } else {
                handleStartCreateNewTheme();
              }
              playChime('tap');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'studio'
                ? headerStyles.activeTabStyle
                : headerStyles.inactiveTabStyle
            }`}
          >
            {targetEditingThemeId ? (
              <>
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>Editing: {themeName}</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase shadow-2xs">
                    Plus
                  </span>
                )}
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 text-amber-700" />
                <span>Create & Edit Theme</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase shadow-2xs">
                    Plus
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB: READY-MADE THEMES SHOP */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          {/* Currently Active Theme Highlight */}
          <div className={`bg-white rounded-3xl p-4 sm:p-5 border-2 ${headerStyles.equippedCardBorder} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <span className={`w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl ${headerStyles.equippedBadgeBg} shrink-0 flex items-center justify-center overflow-hidden`}>
                <img
                  src={getThemeIcon(activeTheme) || '/assets/stickers/bee_mascot.webp'}
                  alt={activeTheme.mascotName}
                  className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow-2xs select-none pointer-events-none"
                />
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
                onClick={() => {
                  if (!isPremium) {
                    triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
                    return;
                  }
                  handleOpenThemeEditor(activeTheme.id);
                }}
                className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 border border-amber-300 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Edit this theme's colors, mascot, or greetings"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Theme</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase shadow-2xs ml-0.5">
                    Plus
                  </span>
                )}
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
                  <img src="/assets/stickers/bee_mascot.webp" alt="Bee" className="w-4 h-4 object-contain shrink-0" />
                  <span>Default Theme Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Age Group & Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-500 mr-1">Filter Themes:</span>
              {[
                { id: 'all', label: 'All Themes', icon: Layers },
                { id: 'kid', label: 'Kids (3–11)', icon: Smile },
                { id: 'teen', label: 'Teens (12–17)', icon: Headphones },
                { id: 'adult', label: 'Adults (18+)', icon: Briefcase },
                { id: 'custom', label: 'Custom Creations', icon: Palette },
              ].map((f) => {
                const IconComp = f.icon;
                return (
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
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleStartCreateNewTheme}
              className="px-3.5 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>+ Create New Theme</span>
              {!isPremium && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-amber-950 text-[9px] font-black uppercase shadow-2xs">
                  Plus
                </span>
              )}
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
                        <div className="w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl bg-amber-50 border border-amber-200 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                          <img
                            src={getThemeIcon(theme) || '/assets/stickers/bee_mascot.webp'}
                            alt={theme.mascotName || theme.name}
                            className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-2xs select-none pointer-events-none"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-slate-800 text-base sm:text-lg">
                              {theme.name}
                            </h4>
                            {theme.id === 'theme-classic' ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                Default (Free)
                              </span>
                            ) : !isPremium ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black flex items-center gap-1 shadow-2xs">
                                Plus
                              </span>
                            ) : theme.isCustom ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                Custom
                              </span>
                            ) : null}
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


                    </div>
                  </div>

                  {/* Action Buttons: Equip & Edit */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPremium) {
                          triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
                          return;
                        }
                        handleOpenThemeEditor(theme.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="Edit this theme"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                      {!isPremium && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase shadow-2xs ml-0.5">
                          Plus
                        </span>
                      )}
                    </button>

                    {isEquipped ? (
                      <div className="py-2 px-3.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (theme.id !== 'theme-classic' && !isPremium) {
                            triggerUpgrade('Themed worlds (Wise Turtle, Dino Kingdom, Ribbit Pond, etc.) are a BeeYou Plus feature! Start your 15-day free trial.');
                            return;
                          }
                          setTheme(theme.id);
                        }}
                        className={`py-2 px-4 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 ${
                          theme.id !== 'theme-classic' && !isPremium
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {theme.id !== 'theme-classic' && !isPremium ? (
                          <>
                            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Unlock Theme</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase shadow-2xs">
                              Plus
                            </span>
                          </>
                        ) : (
                          <>
                            <Star className="w-3.5 h-3.5" />
                            <span>Equip Theme</span>
                          </>
                        )}
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
      {activeTab === 'studio' && !isPremium && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
            <Palette className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800">Theme Studio is a BeeYou Plus Feature</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
              Start your 15-day free trial to customize theme colors, create custom companion mascots, and upload personal wallpapers.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Browse Ready-Made Themes
            </button>
            <button
              type="button"
              onClick={() => triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.')}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              Start 15-Day Free Trial
            </button>
          </div>
        </div>
      )}

      {activeTab === 'studio' && isPremium && (
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
              {POPULAR_MASCOTS.map((m) => {
                const isSelected = (mascotIcon && mascotIcon === m.icon) || (!mascotIcon && mascotEmoji === m.emoji);
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setMascotEmoji(m.emoji);
                      setMascotName(m.name);
                      setMascotIcon(m.icon);
                      setSelectedSoundTheme(m.sound);
                      playChime('tap');
                    }}
                    className={`p-2 rounded-2xl w-12 h-12 shrink-0 border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 scale-105 shadow-sm ring-2 ring-amber-400/40'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                    title={m.name}
                  >
                    <img
                      src={m.icon}
                      alt={m.name}
                      className="w-7 h-7 object-contain drop-shadow-2xs select-none pointer-events-none"
                    />
                  </button>
                );
              })}
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
                <label className="text-xs font-bold text-slate-600 block mb-1">Selected Mascot</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 border-slate-200 bg-slate-50 min-h-[46px]">
                  <img
                    src={mascotIcon || '/assets/stickers/bee_mascot.webp'}
                    alt={mascotName}
                    className="w-7 h-7 object-contain drop-shadow-2xs shrink-0 select-none pointer-events-none"
                  />
                  <span className="text-xs font-bold text-slate-700 truncate">{mascotName || 'Mascot'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Mascot Name</label>
                <input
                  type="text"
                  value={mascotName}
                  onChange={(e) => setMascotName(e.target.value)}
                  placeholder="e.g. Honey Bee"
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
                  className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    !useCustomHex && selectedPaletteIndex === idx
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-2xs"
                    style={{ backgroundColor: p.palette.primary }}
                  />
                  <span className="text-xs font-black text-slate-800 truncate leading-snug">{p.name}</span>
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                3. Background Wallpaper Pattern
              </label>
              {customWallpaperUrl && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Custom Photo Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {WALLPAPER_PATTERN_OPTIONS.map((wp) => {
                const isSelected = selectedWallpaper === wp.id && !customWallpaperUrl;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => {
                      setCustomWallpaperUrl(null);
                      setSelectedWallpaper(wp.id);
                      playChime('tap');
                    }}
                    className={`py-2 px-2.5 rounded-xl border-2 flex items-center gap-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs font-black ring-2 ring-amber-300/60'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs p-0.5">
                      <img src={wp.icon} alt={wp.label} className="w-full h-full object-contain pointer-events-none select-none" />
                    </div>
                    <span className="text-xs truncate">{wp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Wallpaper Upload Box */}
            <div className={`mt-3 p-3.5 rounded-2xl border-2 transition-all ${
              customWallpaperUrl
                ? 'border-amber-400 bg-amber-50/70 shadow-2xs'
                : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-amber-400 hover:bg-amber-50/40'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleWallpaperUpload}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {customWallpaperUrl ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xs shrink-0 bg-white">
                      <img
                        src={customWallpaperUrl}
                        alt="Uploaded wallpaper preview"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-amber-600 shadow-2xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h5 className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      <span>{customWallpaperUrl ? 'Custom Wallpaper Uploaded' : 'Upload Your Own Wallpaper'}</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {customWallpaperUrl
                        ? 'Your custom photo or art is set as the background.'
                        : 'Choose a personal photo, calming artwork, or sensory picture from your device.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {customWallpaperUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomWallpaperUrl(null);
                        setSelectedWallpaper('honeycomb_clouds');
                        playChime('clear');
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                      title="Remove uploaded wallpaper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{customWallpaperUrl ? 'Replace Photo' : 'Upload Photo / Art'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Step 4: Live Real-Time Preview Trigger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                4. Live Theme Preview
              </label>
              <span className="text-[11px] font-bold text-amber-700">
                Full-screen interactive view
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowFullScreenPreview(true);
                playChime('tap');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:via-amber-500 hover:to-yellow-500 text-amber-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border-2 border-amber-300 group"
            >
              <div className="p-2 rounded-xl bg-white/40 group-hover:bg-white/60 transition-colors shadow-2xs">
                <Eye className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="tracking-wide">Click here for live preview</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
            </button>
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

      {/* FULL SCREEN HOMEPAGE LIVE PREVIEW MODAL */}
      {showFullScreenPreview && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full Screen Live Theme Preview"
          className={`fixed inset-0 z-[200] flex flex-col ${previewTheme.palette?.appBg || 'bg-amber-50/40'} text-slate-800 font-sans selection:bg-amber-200 overflow-hidden animate-in fade-in duration-200`}
        >
          {/* Wallpaper Layer */}
          <ThemeWallpaperArt
            themeId={previewTheme.id}
            pattern={previewTheme.wallpaperPattern}
            category={previewTheme.category}
            wallpaperUrl={previewTheme.palette?.wallpaperUrl}
            reduceMotion={settings?.reduceMotion}
            className="!z-0"
          />

          {/* Floating Top Control Bar */}
          <div className="shrink-0 z-40 bg-slate-900/95 text-white backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-3 shadow-xl">
            {/* Left: Exit preview button & Live Theme Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setShowFullScreenPreview(false);
                  playChime('tap');
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 active:scale-95 shrink-0"
                title="Exit live preview and return to editor"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit Preview</span>
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                  <img
                    src={previewTheme.icon || getThemeIcon(previewTheme) || '/assets/stickers/bee_mascot.webp'}
                    alt={previewTheme.name}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider hidden sm:inline-block">
                      Live Preview
                    </span>
                    <h3 className="font-black text-xs sm:text-sm text-white truncate">
                      {previewTheme.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-white/70 truncate hidden md:block">
                    Mascot: {previewTheme.mascotName} • "{previewTheme.greetingMessage}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Save & Equip + Exit X */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleSaveTheme();
                  setShowFullScreenPreview(false);
                }}
                className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-amber-300"
                title="Save and equip this theme"
              >
                <Star className="w-4 h-4 fill-amber-950" />
                <span>Save & Equip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFullScreenPreview(false);
                  playChime('tap');
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Child Top Header with Preview Theme */}
          <header className="shrink-0 z-30 relative">
            <ChildHeader previewTheme={previewTheme} />
          </header>

          {/* Homepage Content with Preview Theme */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain relative z-10">
            <ChildHomeView previewTheme={previewTheme} />
          </main>

          {/* Child Navigation Footer with Preview Theme */}
          <footer className="shrink-0 z-20">
            <ChildNavBar previewTheme={previewTheme} />
          </footer>
        </div>,
        document.body
      )}
    </div>
  );
};
