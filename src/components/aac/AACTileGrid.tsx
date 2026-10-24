import React from 'react';
import { Folder, Lightbulb, Heart, Edit3, Mic } from 'lucide-react';
import { AACCategory, AACItem } from '../../types';
import { GridStage, AACButtonSize } from '../../types/aac';
import { AccessibleTile } from '../common/AccessibleTile';
import { resolveAacImageUrl } from '../../services/symbolService';
import { getWordInflections, WordInflection } from '../../utils/aacInflections';
import { getGrammaticalCategoryLabel } from '../../utils/aacHelpers';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';
import {
  TRAIN_FOLDER_STICKERS,
  SPACE_FOLDER_STICKERS,
  TURTLE_FOLDER_STICKERS,
  DINO_FOLDER_STICKERS,
  FROG_FOLDER_STICKERS,
  OCEAN_FOLDER_STICKERS,
  FAIRYTALE_FOLDER_STICKERS,
  RACING_FOLDER_STICKERS,
} from '../../data/aacThemeStickers';

export const FOLDER_TILES: Array<{
  id: string;
  category: AACCategory;
  label: string;
  stickerSrc: string;
  symbolId: string;
  arasaacId?: number;
  colorType: 'noun' | 'subject' | 'social';
  description: string;
}> = [
  { id: 'folder-food', category: 'food', label: 'Food', stickerSrc: '/assets/stickers/aac_food.webp', symbolId: 'food', colorType: 'noun', description: 'Meals, snacks & treats' },
  { id: 'folder-drinks', category: 'drinks', label: 'Drinks', stickerSrc: '/assets/stickers/aac_drinks.webp', symbolId: 'drink', colorType: 'noun', description: 'Water, juice & milk' },
  { id: 'folder-activities', category: 'activities', label: 'Play & Fun', stickerSrc: '/assets/stickers/aac_activities.webp', symbolId: 'play_,_to', colorType: 'noun', description: 'Games, toys & hobbies' },
  { id: 'folder-places', category: 'places', label: 'Places', stickerSrc: '/assets/stickers/aac_places.webp', symbolId: 'house', colorType: 'noun', description: 'Home, school & park' },
  { id: 'folder-people', category: 'people', label: 'People', stickerSrc: '/assets/stickers/aac_people.webp', symbolId: 'good_person', colorType: 'subject', description: 'Family, friends & helpers' },
  { id: 'folder-feelings', category: 'feelings', label: 'Feelings', stickerSrc: '/assets/stickers/aac_feelings.webp', symbolId: 'happy_man', colorType: 'noun', description: 'Emotions & how I feel' },
  { id: 'folder-sensory', category: 'sensory', label: 'Sensory', stickerSrc: '/assets/stickers/aac_sensory.webp', symbolId: 'sensory_room', colorType: 'noun', description: 'Sensory needs & regulation' },
];

export interface AACTileGridProps {
  activeCategory: AACCategory | 'all' | 'favorite_sentences';
  gridStage: GridStage;
  searchQuery: string;
  activeSceneData?: any;
  displayedItems: AACItem[];
  maskedItemIds: string[];
  isMaskingMode: boolean;
  isEditMode: boolean;
  buttonSize: AACButtonSize;
  gridColsClass: string;
  buttonSizeStyles: any;
  themeCategory?: string;
  themeId?: string;
  aacStyling?: any;
  aacButtonColorMode?: string;
  onSelectCategory: (category: AACCategory) => void;
  onTileClick: (item: AACItem) => void;
  onLongPressStart: (item: AACItem) => void;
  onLongPressEnd: () => void;
  onOpenInflections: (item: AACItem, inflections: WordInflection[]) => void;
  onToggleFavorite: (id: string) => void;
  onEditItem: (item: AACItem) => void;
  getColorStyles: (colorType: AACItem['colorType']) => string;
}

export const AACTileGrid: React.FC<AACTileGridProps> = ({
  activeCategory,
  gridStage,
  searchQuery,
  activeSceneData,
  displayedItems,
  maskedItemIds,
  isMaskingMode,
  isEditMode,
  buttonSize,
  gridColsClass,
  buttonSizeStyles,
  themeCategory,
  themeId,
  aacStyling,
  aacButtonColorMode,
  onSelectCategory,
  onTileClick,
  onLongPressStart,
  onLongPressEnd,
  onOpenInflections,
  onToggleFavorite,
  onEditItem,
  getColorStyles,
}) => {
  const isTurtleTheme = themeCategory === 'turtle' || themeId === 'theme-turtle';
  const isDinoTheme = themeCategory === 'dinosaur' || themeId === 'theme-dino';
  const isFrogTheme = themeCategory === 'frog' || themeId === 'theme-frog';
  const isFairytaleTheme = themeCategory === 'fantasy' || themeId === 'theme-fantasy';
  const isRacingTheme = themeCategory === 'racing' || themeId === 'theme-racing';
  const isOceanTheme = themeCategory === 'ocean' || themeId === 'theme-ocean';
  const isTrainTheme = themeCategory === 'train' || themeId === 'theme-trains';
  const isSpaceTheme = themeCategory === 'space' || themeId === 'theme-space';

  return (
    <main
      className={`grid ${gridColsClass} ${
        buttonSize === 'small' ? 'gap-1.5 sm:gap-2.5' : buttonSize === 'large' ? 'gap-3.5 sm:gap-5' : 'gap-2.5 sm:gap-3.5'
      } pb-10 ${
        isFrogTheme
          ? 'bg-lime-100/50 border-lime-300/70'
          : isDinoTheme
          ? 'bg-green-100/50 border-green-300/70'
          : isTurtleTheme
          ? 'bg-emerald-100/50 border-emerald-300/70'
          : isFairytaleTheme
          ? 'bg-pink-100/50 border-pink-300/70'
          : isRacingTheme
          ? 'bg-zinc-200/50 border-zinc-400/70'
          : isOceanTheme
          ? 'bg-cyan-100/50 border-cyan-300/70'
          : isTrainTheme
          ? 'bg-sky-100/50 border-sky-300/70'
          : isSpaceTheme
          ? 'bg-purple-100/50 border-purple-300/70'
          : 'bg-[#EFE9DF] border-[#E0D8CB]'
      } ${
        buttonSize === 'small' ? 'p-2 sm:p-3' : buttonSize === 'large' ? 'p-3.5 sm:p-6' : 'p-2.5 sm:p-4'
      } rounded-3xl border-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] transition-all`}
      aria-label="Vocabulary grid"
    >
      {/* FOLDER TILES (Rendered at top of Core View only for Full version) */}
      {activeCategory === 'core' && gridStage === 3 && !searchQuery && !activeSceneData && FOLDER_TILES.map((folder) => {
        const stickerSrc = isFairytaleTheme && FAIRYTALE_FOLDER_STICKERS[folder.id]
          ? FAIRYTALE_FOLDER_STICKERS[folder.id]
          : isRacingTheme && RACING_FOLDER_STICKERS[folder.id]
          ? RACING_FOLDER_STICKERS[folder.id]
          : isOceanTheme && OCEAN_FOLDER_STICKERS[folder.id]
          ? OCEAN_FOLDER_STICKERS[folder.id]
          : isSpaceTheme && SPACE_FOLDER_STICKERS[folder.id]
          ? SPACE_FOLDER_STICKERS[folder.id]
          : isTrainTheme && TRAIN_FOLDER_STICKERS[folder.id]
          ? TRAIN_FOLDER_STICKERS[folder.id]
          : isFrogTheme && FROG_FOLDER_STICKERS[folder.id]
          ? FROG_FOLDER_STICKERS[folder.id]
          : isDinoTheme && DINO_FOLDER_STICKERS[folder.id]
          ? DINO_FOLDER_STICKERS[folder.id]
          : isTurtleTheme && TURTLE_FOLDER_STICKERS[folder.id]
          ? TURTLE_FOLDER_STICKERS[folder.id]
          : (folder.stickerSrc || resolveAacImageUrl(folder));

        return (
          <div key={folder.id} className="relative group aspect-square">
            <button
              type="button"
              onClick={() => {
                onSelectCategory(folder.category);
                playChime('tap');
              }}
              className={`w-full h-full flex flex-col items-center ${buttonSizeStyles.folderPadding} rounded-2xl border-2 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] transition-all active:scale-92 cursor-pointer relative overflow-hidden touch-manipulation ${
                isFrogTheme
                  ? 'bg-lime-50/80 hover:bg-lime-50 border-lime-300 text-lime-950 shadow-[0_4px_10px_rgba(101,163,13,0.08)]'
                  : isDinoTheme
                  ? 'bg-green-50/80 hover:bg-green-50 border-green-300 text-green-950 shadow-[0_4px_10px_rgba(22,163,74,0.08)]'
                  : isTurtleTheme
                  ? 'bg-emerald-50/80 hover:bg-emerald-50 border-emerald-300 text-emerald-950 shadow-[0_4px_10px_rgba(5,150,105,0.08)]'
                  : isFairytaleTheme
                  ? 'bg-pink-50/80 hover:bg-pink-50 border-pink-300 text-pink-950 shadow-[0_4px_10px_rgba(219,39,119,0.08)]'
                  : isRacingTheme
                  ? 'bg-zinc-100 hover:bg-white border-zinc-300 text-zinc-950 shadow-[0_4px_10px_rgba(0,0,0,0.08)]'
                  : isOceanTheme
                  ? 'bg-cyan-50/80 hover:bg-cyan-50 border-cyan-300 text-cyan-950 shadow-[0_4px_10px_rgba(8,145,178,0.08)]'
                  : 'bg-[#FCF9F2] hover:bg-white border-[#D8CEBA] text-[#2D241E]'
              }`}
            >
              {/* Folder Top-Right Corner Tab / Badge */}
              <div className={`absolute ${buttonSizeStyles.folderBadge} z-20 ${
                isFrogTheme
                  ? 'bg-lime-800 text-white'
                  : isDinoTheme
                  ? 'bg-green-800 text-white'
                  : isTurtleTheme
                  ? 'bg-emerald-800 text-white'
                  : isFairytaleTheme
                  ? 'bg-pink-800 text-white'
                  : isRacingTheme
                  ? 'bg-zinc-900 text-white'
                  : isOceanTheme
                  ? 'bg-cyan-800 text-white'
                  : 'bg-[#4A3E34] text-white'
              } font-black flex items-center shadow-2xs pointer-events-none`}>
                <Folder className={`${buttonSizeStyles.folderBadgeIcon} fill-white shrink-0`} />
                <span>{t('Folder')}</span>
              </div>

              {/* Symbol Area */}
              <div className={`relative z-10 flex-1 min-h-0 w-full flex items-center justify-center transition-transform group-hover:scale-105 ${buttonSizeStyles.folderSymbolArea}`}>
                <img
                  src={stickerSrc}
                  alt={folder.label}
                  className="w-full h-full object-contain rounded-lg pointer-events-none"
                  loading="lazy"
                />
              </div>

              {/* Label */}
              <span className={`relative z-10 font-black tracking-tight text-center leading-none select-none ${
                isFrogTheme
                  ? 'text-lime-950'
                  : isDinoTheme
                  ? 'text-green-950'
                  : isTurtleTheme
                  ? 'text-emerald-950'
                  : 'text-[#2D241E]'
              } drop-shadow-xs w-full mt-1 ${buttonSizeStyles.folderFont}`}>
                {t(folder.label)}
              </span>
            </button>
          </div>
        );
      })}

      {/* MAIN VOCABULARY TILES */}
      {displayedItems.map((item) => {
        const isMasked = maskedItemIds.includes(item.id);
        const inflections = getWordInflections(item.label, item.colorType);
        const hasInflections = inflections.length > 1;
        const hasThemedArt = themeCategory && themeCategory !== 'classic' && (aacButtonColorMode || 'fitzgerald') !== 'high_contrast_white';

        // When masked and not in masking mode, render as a fixed blank placeholder (Debossed well)
        if (isMasked && !isMaskingMode) {
          return (
            <div
              key={item.id}
              className="relative aspect-square rounded-2xl border-2 border-dashed border-[#D8CEBA] bg-[#E5DFD4]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] select-none"
              aria-hidden="true"
            />
          );
        }

        return (
          <div
            key={item.id}
            className={`relative group aspect-square ${isMasked ? 'opacity-40 grayscale ring-2 ring-[#99C2A2] rounded-2xl' : ''}`}
            onMouseDown={() => onLongPressStart(item)}
            onMouseUp={onLongPressEnd}
            onMouseLeave={onLongPressEnd}
            onTouchStart={() => onLongPressStart(item)}
            onTouchMove={onLongPressEnd}
            onTouchEnd={onLongPressEnd}
            onTouchCancel={onLongPressEnd}
          >
            <AccessibleTile
              variant="aac"
              label={t(item.label)}
              speechText={item.speechText ? t(item.speechText) : undefined}
              category={getGrammaticalCategoryLabel(item.colorType)}
              onClick={() => onTileClick(item)}
              className={`w-full h-full flex flex-col items-center ${buttonSizeStyles.tilePadding} ${
                aacStyling?.tileBorderRadius || 'rounded-2xl'
              } ${
                aacStyling?.tileBorderWidth || 'border-2'
              } shadow-[0_4px_10px_rgba(0,0,0,0.04),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] transition-all active:scale-92 cursor-pointer relative overflow-hidden ${
                hasThemedArt ? 'border-opacity-60' : ''
              } ${getColorStyles(item.colorType)}`}
            >
              {/* Mulberry Symbol Area */}
              <div className={`relative z-10 flex-1 min-h-0 w-full flex items-center justify-center transition-transform group-hover:scale-105 ${buttonSizeStyles.symbolArea}`}>
                <img
                  src={resolveAacImageUrl(item)}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-contain rounded-lg pointer-events-none"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              </div>

              {/* Label */}
              <span
                className={`relative z-10 font-black tracking-tight text-center leading-none select-none text-[#2D241E] drop-shadow-xs w-full mt-1 ${buttonSizeStyles.labelFont}`}
              >
                {t(item.label)}
              </span>

              {/* Fitzgerald Key Category Tag (Differentiate Without Color Alone) */}
              <span
                aria-hidden="true"
                className={`relative z-10 ${buttonSizeStyles.categoryTag} font-black uppercase tracking-wider rounded-md bg-black/10 text-slate-800 pointer-events-none mt-0.5`}
              >
                {getGrammaticalCategoryLabel(item.colorType)}
              </span>
            </AccessibleTile>

            {/* Grammar Inflections Trigger Button (Proloquo2Go grammar popup indicator) */}
            {hasInflections && !isMaskingMode && !isEditMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInflections(item, inflections);
                  playChime('tap');
                }}
                className="absolute top-1 left-1 z-20 p-1 rounded-md bg-white/90 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs text-[9px] font-black flex items-center gap-0.5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                title="Grammar forms (+ed, -ing, plurals)"
              >
                <Lightbulb className="w-2.5 h-2.5 text-amber-600" />
              </button>
            )}

            {/* Heart (Favorite) Toggle Button */}
            {!isMaskingMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                className={`absolute top-1 right-1 z-20 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                  item.isFavorite
                    ? 'bg-rose-500 text-white scale-100 hover:scale-110'
                    : isEditMode
                    ? 'bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200'
                    : 'opacity-0 group-hover:opacity-100 bg-white/80 text-slate-400 hover:text-rose-500'
                }`}
                title={item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-3 h-3 ${item.isFavorite ? 'fill-white text-white' : ''}`} />
              </button>
            )}

            {/* Edit Word Button (Pencil) */}
            {isEditMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                className="absolute top-1 left-1 z-20 p-1.5 rounded-full bg-indigo-600 text-white hover:scale-110 transition-transform cursor-pointer shadow-xs"
                title="Edit word details"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}

            {/* Recorded Voice Badge */}
            {item.audioDataUrl && (
              <div
                className="absolute bottom-1 right-1 z-20 px-1.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[8px] font-black flex items-center gap-0.5 shadow-2xs pointer-events-none"
                title={`Recorded voice: ${item.audioRecordedBy || 'Voice'}`}
              >
                <Mic className="w-2 h-2" />
                <span className="hidden sm:inline">{item.audioRecordedBy || 'Voice'}</span>
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
};
