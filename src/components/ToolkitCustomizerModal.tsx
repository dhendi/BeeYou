import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { useModalBackHandler } from '../services/modalBackHandler';
import {
  FidgetBubblesSticker,
  BreathingCloudSticker,
  CountdownTimerSticker,
  EyeSeeSticker,
  MusicSensorySticker,
  DecisionWheelSticker,
  ThermometerSticker,
  TurtlePondFidgetBubblesSticker,
  TurtlePottedFernSticker,
  TurtleSandTimerSticker,
  TurtlePondReedsSticker,
  TurtleWoodenWheelSticker,
  TurtleBambooThermometerSticker,
} from './icons/JournalStickers';

export type ToolCardId =
  | 'fidgets'
  | 'breathing'
  | 'pie-timer'
  | 'grounding'
  | 'ambient-sounds'
  | 'decision-wheel'
  | 'five-point-scale';

export interface ToolCardConfig {
  id: ToolCardId;
  enabled: boolean;
}

export const DEFAULT_TOOLKIT_CARDS: ToolCardConfig[] = [
  { id: 'fidgets', enabled: true },
  { id: 'breathing', enabled: true },
  { id: 'pie-timer', enabled: true },
  { id: 'grounding', enabled: true },
  { id: 'ambient-sounds', enabled: true },
  { id: 'decision-wheel', enabled: true },
  { id: 'five-point-scale', enabled: true },
];

type ToolFilterCategory = 'all' | 'calm' | 'play' | 'focus' | 'sos';

interface ToolkitCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardsConfig: ToolCardConfig[];
  onChange: (configs: ToolCardConfig[]) => void;
  onReset: () => void;
}

export const ToolkitCustomizerModal: React.FC<ToolkitCustomizerModalProps> = ({
  isOpen,
  onClose,
  cardsConfig,
  onChange,
  onReset,
}) => {
  const { activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';

  const [activeCategory, setActiveCategory] = useState<ToolFilterCategory>('all');

  useModalBackHandler(isOpen, onClose);

  if (!isOpen) return null;

  const toolMetaMap: Record<
    ToolCardId,
    {
      title: string;
      desc: string;
      badge: string;
      category: 'calm' | 'play' | 'focus' | 'sos';
      Sticker: React.FC<{ className?: string }>;
    }
  > = {
    fidgets: {
      title: 'Digital Fidget Toys',
      desc: 'Tactile bubble popping with haptics, sensory sand ripples, and smooth marble rolling.',
      badge: 'Fidget & Play',
      category: 'play',
      Sticker: isTurtleTheme ? TurtlePondFidgetBubblesSticker : FidgetBubblesSticker,
    },
    breathing: {
      title: 'Deep Sensory Breathing',
      desc: 'Visual breathing pacers (box breathing, flower breath, 4-7-8) with gentle audio chimes.',
      badge: 'Breathing Pacer',
      category: 'calm',
      Sticker: isTurtleTheme ? TurtlePottedFernSticker : BreathingCloudSticker,
    },
    'pie-timer': {
      title: 'Visual Countdown Timer',
      desc: 'Tactile circular Time Timer countdown clock to clearly visualize remaining time.',
      badge: 'Visual Clock',
      category: 'focus',
      Sticker: isTurtleTheme ? TurtleSandTimerSticker : CountdownTimerSticker,
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      desc: 'Guided countdown exercise to reconnect with surroundings during anxiety or overwhelm.',
      badge: 'Sensory Grounding',
      category: 'calm',
      Sticker: EyeSeeSticker,
    },
    'ambient-sounds': {
      title: 'Soothing Ambient Sounds',
      desc: 'Multi-track ambient soundscape mixer (gentle rain, ocean waves, birds, white noise).',
      badge: 'Soundscapes',
      category: 'calm',
      Sticker: isTurtleTheme ? TurtlePondReedsSticker : MusicSensorySticker,
    },
    'decision-wheel': {
      title: 'Decision Wheel Spinner',
      desc: 'Break choice paralysis and make fun, easy decisions with an animated spinning wheel.',
      badge: 'Choice Spinner',
      category: 'play',
      Sticker: isTurtleTheme ? TurtleWoodenWheelSticker : DecisionWheelSticker,
    },
    'five-point-scale': {
      title: 'Incredible 5-Point Scale',
      desc: 'Emotional thermometer with 5 color-coded levels and personalized coping actions.',
      badge: 'Emotion Scale',
      category: 'sos',
      Sticker: isTurtleTheme ? TurtleBambooThermometerSticker : ThermometerSticker,
    },
  };

  const handleToggle = (id: ToolCardId) => {
    const updated = cardsConfig.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    onChange(updated);
    playChime('tap');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cardsConfig.length) return;
    const updated = [...cardsConfig];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
    playChime('tap');
  };

  const handleEnableAll = () => {
    const updated = cardsConfig.map((c) => ({ ...c, enabled: true }));
    onChange(updated);
    playChime('star');
  };

  const handleMinimal = () => {
    const minimalIds: ToolCardId[] = ['fidgets', 'breathing', 'pie-timer'];
    const updated = cardsConfig.map((c) => ({
      ...c,
      enabled: minimalIds.includes(c.id),
    }));
    onChange(updated);
    playChime('clear');
  };

  const enabledCount = cardsConfig.filter((c) => c.enabled).length;

  const filteredCards = activeCategory === 'all'
    ? cardsConfig
    : cardsConfig.filter((c) => toolMetaMap[c.id]?.category === activeCategory);

  const categories: { id: ToolFilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'calm', label: 'Calm & Reset' },
    { id: 'play', label: 'Sensory Play' },
    { id: 'focus', label: 'Time & Focus' },
    { id: 'sos', label: 'Emotion & SOS' },
  ];

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="toolkit-customizer-title"
    >
      <div
        className="bg-[#FAF7F2] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-[#E0D8CB] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#FCF9F2] border-b-2 border-[#E0D8CB]">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-[#5D5045]" />
            </span>
            <div>
              <h2 id="toolkit-customizer-title" className="text-lg sm:text-xl font-black text-[#2D241E] leading-tight">
                {t('Customize Toolkit')}
              </h2>
              <p className="text-xs text-[#7A6C60] font-medium">
                {t('Choose which tools appear and rearrange their order')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] transition-all cursor-pointer border border-[#E0D8CB] shadow-[0_2px_4px_rgba(0,0,0,0.03)]"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets & Counter */}
        <div className="px-5 py-2.5 bg-[#EFE9DF] border-b border-[#E0D8CB] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#6B5E52]">
            {t('Showing')}: <strong className="text-[#A76318]">{enabledCount}</strong> {t('of')} {cardsConfig.length} {t('tools')}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMinimal}
              className="px-3 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#5D5045] font-black transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
            >
              {t('Essential')}
            </button>
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#5D5045] font-black transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
            >
              {t('Show All')}
            </button>
            <button
              type="button"
              onClick={() => {
                onReset();
                playChime('star');
              }}
              className="px-2.5 py-1 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#7A6C60] font-black transition-all cursor-pointer flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
              title={t('Reset to default')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8C7E72]" />
              <span>{t('Reset')}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E0D8CB] overflow-x-auto bg-[#FCF9F2]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#F5B865] text-[#4A2F0F] border border-[#E2A44E] shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                  : 'bg-[#F5EFE6] hover:bg-white text-[#6B5E52] border border-[#E0D8CB]'
              }`}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>

        {/* Reorderable Tools List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredCards.map((tool) => {
            const actualIndex = cardsConfig.findIndex((c) => c.id === tool.id);
            const meta = toolMetaMap[tool.id];
            if (!meta) return null;
            const Sticker = meta.Sticker;

            return (
              <div
                key={tool.id}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  tool.enabled
                    ? 'bg-[#FCF9F2] border-[#E0D8CB] shadow-[0_3px_8px_rgba(0,0,0,0.04),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)]'
                    : 'bg-[#F5EFE6]/60 border-[#E8DFC2] opacity-60'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(tool.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border-2 ${
                      tool.enabled
                        ? 'bg-[#F5B865] border-[#E2A44E] text-[#4A2F0F] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                        : 'bg-[#FCF9F2] border-[#D8CEBA] text-transparent'
                    }`}
                    aria-label={tool.enabled ? t('Disable') : t('Enable')}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="w-11 h-11 p-1 bg-[#F5EFE6] border border-[#E0D8CB] rounded-xl shrink-0 flex items-center justify-center">
                    <Sticker className="w-8 h-8 object-contain" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-sm text-[#2D241E] truncate">
                        {t(meta.title)}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-stone-200/80 text-stone-700">
                        {t(meta.badge)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A6C60] font-semibold truncate mt-0.5">
                      {t(meta.desc)}
                    </p>
                  </div>
                </div>

                {/* Right: Reorder arrows & Eye Toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(actualIndex, 'up')}
                    disabled={actualIndex === 0}
                    className="p-1.5 rounded-xl text-[#7A6C60] hover:text-[#2D241E] disabled:opacity-20 hover:bg-[#F5EFE6] border border-transparent hover:border-[#E0D8CB] cursor-pointer"
                    title={t('Move up')}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(actualIndex, 'down')}
                    disabled={actualIndex === cardsConfig.length - 1}
                    className="p-1.5 rounded-xl text-[#7A6C60] hover:text-[#2D241E] disabled:opacity-20 hover:bg-[#F5EFE6] border border-transparent hover:border-[#E0D8CB] cursor-pointer"
                    title={t('Move down')}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(tool.id)}
                    className={`p-1.5 rounded-xl font-black text-xs cursor-pointer ml-1 border ${
                      tool.enabled
                        ? 'text-[#1C3E25] bg-[#C4E7D4] hover:bg-[#B2DEC5] border-[#99C2A2]'
                        : 'text-[#8C7E72] bg-[#F5EFE6] hover:bg-[#EAE2D5] border-[#E0D8CB]'
                    }`}
                    title={tool.enabled ? t('Enabled') : t('Disabled')}
                  >
                    {tool.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FCF9F2] border-t-2 border-[#E0D8CB] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              playChime('complete');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] border-2 border-[#E2A44E] font-black text-sm shadow-[0_4px_14px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] transition-all cursor-pointer text-center active:scale-95"
          >
            {t('Done Editing Toolkit')} ✓
          </button>
        </div>
      </div>
    </div>
  );
};
