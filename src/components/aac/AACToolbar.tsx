import React from 'react';
import {
  Home as HomeIcon,
  MessageCircle,
  Eye,
  EyeOff,
  Zap,
  Plus,
  Edit3,
  Globe,
  Info,
  HelpCircle,
} from 'lucide-react';
import { AACCategory } from '../../types';
import { GridStage, AACButtonSize, STORAGE_KEYS } from '../../types/aac';
import { t } from '../../services/translator';
import { playChime as playAudioChime } from '../../utils/audio';
import {
  TRAIN_CATEGORY_ICONS,
  SPACE_CATEGORY_ICONS,
  TURTLE_CATEGORY_ICONS,
  DINO_CATEGORY_ICONS,
  FROG_CATEGORY_ICONS,
  OCEAN_CATEGORY_ICONS,
  FAIRYTALE_CATEGORY_ICONS,
  RACING_CATEGORY_ICONS,
} from '../../data/aacThemeStickers';

export interface CategoryTabItem {
  id: AACCategory | 'all' | 'favorite_sentences';
  label: string;
  iconSrc: string;
}

export interface AACToolbarProps {
  categories: CategoryTabItem[];
  activeCategory: AACCategory | 'all' | 'favorite_sentences';
  gridStage: GridStage;
  searchQuery: string;
  activeSceneData: any;
  displayedItemsCount: number;
  isMaskingMode: boolean;
  isEditMode: boolean;
  instantSpeakMode: boolean;
  buttonSize: AACButtonSize;
  themeCategory?: string;
  themeId?: string;
  onSelectCategory: (catId: AACCategory | 'all' | 'favorite_sentences') => void;
  onOpenQuickChat: () => void;
  onToggleMaskingMode: () => void;
  onToggleInstantSpeakMode: () => void;
  onAddWord: () => void;
  onToggleEditMode: () => void;
  onOpenSymbols: () => void;
  onOpenAttribution: () => void;
  onOpenGuide: () => void;
  onChangeButtonSize: (size: AACButtonSize) => void;
  onChangeGridStage: (stage: GridStage) => void;
  playChime: typeof playAudioChime;
}

export const AACToolbar: React.FC<AACToolbarProps> = ({
  categories,
  activeCategory,
  gridStage,
  searchQuery,
  activeSceneData,
  displayedItemsCount,
  isMaskingMode,
  isEditMode,
  instantSpeakMode,
  buttonSize,
  themeCategory,
  themeId,
  onSelectCategory,
  onOpenQuickChat,
  onToggleMaskingMode,
  onToggleInstantSpeakMode,
  onAddWord,
  onToggleEditMode,
  onOpenSymbols,
  onOpenAttribution,
  onOpenGuide,
  onChangeButtonSize,
  onChangeGridStage,
  playChime,
}) => {
  const isFrogTheme = themeCategory === 'frog' || themeId === 'theme-frog';
  const isDinoTheme = themeCategory === 'dino' || themeId === 'theme-dino';
  const isTurtleTheme = themeCategory === 'turtle' || themeId === 'theme-turtle';
  const isFairytaleTheme = themeCategory === 'fairytale' || themeId === 'theme-fairytale';
  const isRacingTheme = themeCategory === 'racing' || themeId === 'theme-racing';
  const isOceanTheme = themeCategory === 'ocean' || themeId === 'theme-ocean';
  const isTrainTheme = themeCategory === 'train' || themeId === 'theme-train';
  const isSpaceTheme = themeCategory === 'space' || themeId === 'theme-space';

  const getCategoryIconSrc = (cat: CategoryTabItem): string => {
    if (isFairytaleTheme && FAIRYTALE_CATEGORY_ICONS[cat.id]) return FAIRYTALE_CATEGORY_ICONS[cat.id];
    if (isRacingTheme && RACING_CATEGORY_ICONS[cat.id]) return RACING_CATEGORY_ICONS[cat.id];
    if (isOceanTheme && OCEAN_CATEGORY_ICONS[cat.id]) return OCEAN_CATEGORY_ICONS[cat.id];
    if (isSpaceTheme && SPACE_CATEGORY_ICONS[cat.id]) return SPACE_CATEGORY_ICONS[cat.id];
    if (isTrainTheme && TRAIN_CATEGORY_ICONS[cat.id]) return TRAIN_CATEGORY_ICONS[cat.id];
    if (isFrogTheme && FROG_CATEGORY_ICONS[cat.id]) return FROG_CATEGORY_ICONS[cat.id];
    if (isDinoTheme && DINO_CATEGORY_ICONS[cat.id]) return DINO_CATEGORY_ICONS[cat.id];
    if (isTurtleTheme && TURTLE_CATEGORY_ICONS[cat.id]) return TURTLE_CATEGORY_ICONS[cat.id];
    return cat.iconSrc;
  };

  const getActiveTabStyle = (catId: string, isActive: boolean): string => {
    if (isActive) {
      if (isFrogTheme) {
        if (catId === 'core') return 'bg-lime-600 text-white border-2 border-lime-700 shadow-[0_4px_12px_rgba(101,163,13,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        if (catId === 'favorites') return 'bg-teal-600 text-white border-2 border-teal-700 shadow-[0_4px_12px_rgba(13,148,136,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-lime-800 text-white border-2 border-lime-900 shadow-[0_4px_12px_rgba(63,98,18,0.3)]';
      }
      if (isDinoTheme) {
        if (catId === 'core') return 'bg-green-600 text-white border-2 border-green-700 shadow-[0_4px_12px_rgba(22,163,74,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        if (catId === 'favorites') return 'bg-amber-600 text-white border-2 border-amber-700 shadow-[0_4px_12px_rgba(217,119,6,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-green-800 text-white border-2 border-green-900 shadow-[0_4px_12px_rgba(20,83,45,0.3)]';
      }
      if (isTurtleTheme) {
        if (catId === 'core') return 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        if (catId === 'favorites') return 'bg-emerald-700 text-white border-2 border-emerald-800 shadow-[0_4px_12px_rgba(4,120,87,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-emerald-800 text-white border-2 border-emerald-900 shadow-[0_4px_12px_rgba(6,78,59,0.3)]';
      }
      if (isFairytaleTheme) {
        if (catId === 'core') return 'bg-pink-600 text-white border-2 border-pink-700 shadow-[0_4px_12px_rgba(219,39,119,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        if (catId === 'favorites') return 'bg-rose-600 text-white border-2 border-rose-700 shadow-[0_4px_12px_rgba(225,29,72,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-pink-800 text-white border-2 border-pink-900 shadow-[0_4px_12px_rgba(157,23,77,0.3)]';
      }
      if (isRacingTheme) {
        if (catId === 'core') return 'bg-zinc-900 text-white border-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]';
        if (catId === 'favorites') return 'bg-red-700 text-white border-2 border-red-800 shadow-[0_4px_12px_rgba(185,28,28,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-zinc-800 text-white border-2 border-zinc-900 shadow-[0_4px_12px_rgba(24,24,27,0.4)]';
      }
      if (isOceanTheme) {
        if (catId === 'core') return 'bg-cyan-600 text-white border-2 border-cyan-700 shadow-[0_4px_12px_rgba(8,145,178,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        if (catId === 'favorites') return 'bg-teal-600 text-white border-2 border-teal-700 shadow-[0_4px_12px_rgba(13,148,136,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
        return 'bg-cyan-800 text-white border-2 border-cyan-900 shadow-[0_4px_12px_rgba(21,94,117,0.3)]';
      }
      if (catId === 'core') return 'bg-[#F5B865] text-[#4A2F0F] border-2 border-[#E2A44E] shadow-[0_4px_12px_rgba(245,184,101,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
      if (catId === 'favorites') return 'bg-[#E68E8E] text-[#4A1616] border-2 border-[#D57B7B] shadow-[0_4px_12px_rgba(230,142,142,0.4),inset_0_1px_1px_rgba(255,255,255,0.9)]';
      return 'bg-[#4A3E34] text-white border-2 border-[#382F27] shadow-[0_4px_12px_rgba(74,62,52,0.3)]';
    }

    if (isFrogTheme) return 'bg-lime-50/70 hover:bg-lime-50 text-lime-900 hover:text-lime-950 border-2 border-lime-200/80 hover:border-lime-300 shadow-2xs';
    if (isDinoTheme) return 'bg-green-50/70 hover:bg-green-50 text-green-900 hover:text-green-950 border-2 border-green-200/80 hover:border-green-300 shadow-2xs';
    if (isTurtleTheme) return 'bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900 hover:text-emerald-950 border-2 border-emerald-200/80 hover:border-emerald-300 shadow-2xs';
    if (isFairytaleTheme) return 'bg-pink-50/70 hover:bg-pink-50 text-pink-900 hover:text-pink-950 border-2 border-pink-200/80 hover:border-pink-300 shadow-2xs';
    if (isRacingTheme) return 'bg-zinc-100 hover:bg-white text-zinc-900 hover:text-black border-2 border-zinc-300 hover:border-zinc-400 shadow-2xs';
    if (isOceanTheme) return 'bg-cyan-50/70 hover:bg-cyan-50 text-cyan-900 hover:text-cyan-950 border-2 border-cyan-200/80 hover:border-cyan-300 shadow-2xs';
    return 'bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#3E342B] border-2 border-[#E0D8CB] hover:border-[#D1C6B5] shadow-2xs';
  };

  return (
    <>
      {/* 1. Category Breadcrumb Strip (If Inside A Category Folder) */}
      {activeCategory !== 'core' && activeCategory !== 'all' && activeCategory !== 'favorites' && !activeSceneData && (
        <div className="flex items-center justify-between bg-[#FCF9F2] border-2 border-[#E0D8CB] rounded-2xl px-3.5 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('core');
                playChime('tap');
              }}
              className="px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0.5px_rgba(255,255,255,0.8)] border border-[#E2A44E] active:scale-95 transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]"
            >
              <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Core Board</span>
            </button>
            <span className="text-[#C8BCAC] font-bold text-sm">/</span>
            <span className="font-black text-xs sm:text-sm text-[#3E342B] flex items-center gap-1.5">
              {categories.find((c) => c.id === activeCategory)?.iconSrc && (
                <img
                  src={categories.find((c) => c.id === activeCategory)?.iconSrc}
                  alt=""
                  aria-hidden="true"
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain pointer-events-none drop-shadow-2xs select-none"
                />
              )}
              <span className="truncate max-w-[140px] sm:max-w-none">
                {categories.find((c) => c.id === activeCategory)?.label}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#8C7E72] hidden sm:inline">
              {displayedItemsCount} words
            </span>
          </div>
        </div>
      )}

      {/* 2. Category Navigation Pills & Quick Action Tools */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1 scrollbar-thin">
        {/* Category Navigation Pills */}
        <div
          data-tour="aac-categories"
          className={`flex items-center gap-2 sm:gap-2.5 shrink-0 ${
            isFrogTheme
              ? 'bg-lime-100/70 border-lime-300/80'
              : isDinoTheme
              ? 'bg-green-100/70 border-green-300/80'
              : isTurtleTheme
              ? 'bg-emerald-100/70 border-emerald-300/80'
              : isFairytaleTheme
              ? 'bg-pink-100/70 border-pink-300/80'
              : isRacingTheme
              ? 'bg-zinc-200/80 border-zinc-400/80'
              : isOceanTheme
              ? 'bg-cyan-100/70 border-cyan-300/80'
              : isTrainTheme
              ? 'bg-sky-100/70 border-sky-300/80'
              : isSpaceTheme
              ? 'bg-purple-100/70 border-purple-300/80'
              : 'bg-[#EFE9DF] border-[#E0D8CB]'
          } p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-2 shadow-xs`}
        >
          {categories
            .filter((cat) => gridStage === 3 || ['core', 'favorite_sentences', 'favorites'].includes(cat.id))
            .map((cat) => {
              const iconSrc = getCategoryIconSrc(cat);
              const isActive = !activeSceneData && activeCategory === cat.id;
              const activeStyle = getActiveTabStyle(cat.id, isActive);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    playChime('tap');
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm min-h-[40px] sm:min-h-[48px] flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none active:scale-95 shrink-0 touch-manipulation ${activeStyle}`}
                >
                  <img
                    src={iconSrc}
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain pointer-events-none drop-shadow-2xs select-none shrink-0"
                    loading="eager"
                  />
                  <span className="whitespace-nowrap tracking-tight">{cat.label}</span>
                </button>
              );
            })}
        </div>

        {/* Clinical AAC Tools Toolbar */}
        <div className="flex items-center gap-2 shrink-0 ml-auto flex-wrap">
          {/* Quick-Chat Expressions Drawer Button */}
          <button
            data-tour="aac-quickchat"
            type="button"
            onClick={() => {
              onOpenQuickChat();
              playChime('tap');
            }}
            className="px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 border-[#B8B4DC] bg-[#D7D4F0] hover:bg-[#CBC8E8] text-[#2C2954] flex items-center gap-2 transition-all cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.8)] active:scale-95"
            title="Quick-Chat: Instant expressions that will not clear your sentence"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#51488C]" />
            <span className="whitespace-nowrap">{t('Quick Chat')}</span>
          </button>

          {/* Motor Masking Mode */}
          <button
            type="button"
            onClick={() => {
              onToggleMaskingMode();
              playChime('tap');
            }}
            className={`px-3 sm:px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isMaskingMode
                ? 'bg-[#99C2A2] text-[#1C3E25] border-[#85AE8E] shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                : 'bg-[#FCF9F2] text-[#6B5E52] border-[#E0D8CB] hover:bg-white'
            }`}
            title="Vocabulary Masking: Hide words while preserving exact motor planning coordinates"
          >
            {isMaskingMode ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="hidden sm:inline whitespace-nowrap">{isMaskingMode ? t('Masking ON') : t('Mask')}</span>
          </button>

          {/* Instant Speak Mode */}
          <button
            type="button"
            onClick={() => {
              onToggleInstantSpeakMode();
              playChime('tap');
            }}
            className={`px-3 sm:px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              instantSpeakMode
                ? 'bg-[#F5B865] text-[#4A2F0F] border-[#E2A44E] shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                : 'bg-[#FCF9F2] text-[#6B5E52] border-[#E0D8CB] hover:bg-white'
            }`}
            title="Instant Speak Mode: Tap any tile to speak it aloud immediately"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#A76318]" />
            <span className="hidden sm:inline whitespace-nowrap">{t('Instant')}</span>
          </button>

          {/* Add Word Button */}
          <button
            type="button"
            onClick={onAddWord}
            className="px-3 sm:px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 border-[#E2A44E] bg-[#FDE293] hover:bg-[#FCD876] text-[#4A2F0F] flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.8)] active:scale-95"
            title="Add a custom word or favorite phrase"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B571A]" />
            <span className="hidden sm:inline whitespace-nowrap">{t('Add Word')}</span>
          </button>

          {/* Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleEditMode();
              playChime('tap');
            }}
            className={`px-3 sm:px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isEditMode
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400'
                : 'bg-[#FCF9F2] text-[#6B5E52] border-[#E0D8CB] hover:bg-white'
            }`}
            title="Toggle Edit Mode to customize words or set favorites"
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline whitespace-nowrap">{isEditMode ? t('Done') : t('Edit')}</span>
          </button>

          {/* Mulberry Symbols Picker */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              data-tour="aac-symbols"
              type="button"
              onClick={() => {
                onOpenSymbols();
                playChime('tap');
              }}
              className="px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Add words from the Mulberry Symbols AAC library (CC BY-SA)"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              <span className="whitespace-nowrap">{t('Symbols')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenAttribution();
                playChime('tap');
              }}
              className="p-2.5 rounded-xl sm:rounded-2xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer min-h-[46px] sm:min-h-[52px] flex items-center justify-center border-2 border-transparent hover:border-indigo-200"
              title="Mulberry Symbols License & Attribution"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* AAC Guide Button */}
          <button
            type="button"
            onClick={() => {
              onOpenGuide();
              playChime('tap');
            }}
            className="px-3.5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black min-h-[46px] sm:min-h-[52px] border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Open Interactive AAC Coach Marks Guide"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
            <span className="whitespace-nowrap">{t('AAC Guide')}</span>
          </button>

          {/* Clinical AAC Button Size Selector (Small, Medium, Large) */}
          <div
            data-tour="aac-button-size"
            className="flex items-center gap-1 bg-[#EFE9DF] p-1 rounded-2xl border border-[#E0D8CB] shadow-2xs"
            role="group"
            aria-label="AAC Button Size Selection"
          >
            <span className="text-[10px] font-black uppercase text-stone-500 px-1 hidden md:inline">
              Size:
            </span>
            {[
              { size: 'small' as AACButtonSize, label: 'Small', short: 'S', title: 'Small buttons (High density: 6-8 cols)' },
              { size: 'medium' as AACButtonSize, label: 'Medium', short: 'M', title: 'Medium buttons (Standard balanced grid: 4-6 cols)' },
              { size: 'large' as AACButtonSize, label: 'Large', short: 'L', title: 'Large buttons (Oversized touch targets: 2-4 cols)' },
            ].map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => onChangeButtonSize(s.size)}
                className={`px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                  buttonSize === s.size
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
                title={s.title}
                aria-label={`${s.label} button size`}
                aria-pressed={buttonSize === s.size}
              >
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </button>
            ))}
          </div>

          {/* Stage Selector Pills (4 Tiles, 12 Tiles, Full Matrix) */}
          {activeCategory === 'core' && !searchQuery.trim() && (
            <div data-tour="aac-grid-stages" className="flex items-center gap-1 bg-[#EFE9DF] p-1 rounded-2xl border border-[#E0D8CB] shadow-2xs">
              <span className="text-[10px] font-black uppercase text-stone-500 px-1 hidden md:inline">
                Stage:
              </span>
              {[
                { stage: 1 as GridStage, label: '4' },
                { stage: 2 as GridStage, label: '12' },
                { stage: 3 as GridStage, label: 'Full' },
              ].map((s) => (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => onChangeGridStage(s.stage)}
                  className={`px-2 py-0.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                    gridStage === s.stage
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                  }`}
                  title={`Switch to Stage ${s.stage} (${s.label})`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Masking Mode Helper Banner */}
      {isMaskingMode && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-2 flex items-center justify-between text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">
              <strong>Vocabulary Masking:</strong> Tap any tile to hide/unhide it. Blank slots preserve motor planning!
            </span>
          </div>
          <button
            onClick={onToggleMaskingMode}
            className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </>
  );
};
