import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../services/translator';
import {
  FidgetBubblesSticker,
  BreathingCloudSticker,
  DecisionWheelSticker,
  CountdownTimerSticker,
  ThermometerSticker,
  MusicSensorySticker,
  EyeSeeSticker,
  TurtlePondReedsSticker,
  TurtlePottedFernSticker,
  TurtlePondFidgetBubblesSticker,
  TurtleSandTimerSticker,
  TurtleWoodenWheelSticker,
  TurtleBambooThermometerSticker,
} from './icons/JournalStickers';
import { playChime } from '../utils/audio';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';
import {
  ToolkitCustomizerModal,
  DEFAULT_TOOLKIT_CARDS,
  ToolCardConfig,
  ToolCardId,
} from './ToolkitCustomizerModal';
import { CaregiverLockShield } from './CaregiverLockShield';

type ToolCategory = 'all' | 'calm' | 'play' | 'focus' | 'sos';

export const ToolsView: React.FC = () => {
  const {
    settings,
    activeTheme,
    userAgeGroup,
    setShowFidgetModal,
    setShowDecisionWheelModal,
    setShowPieTimerModal,
    setShowFivePointModal,
    openCopingToolkit,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);
  const isColorCoded = settings?.colorCodedActionCards === true;
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';

  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  const [toolsConfig, setToolsConfig] = useState<ToolCardConfig[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_toolkit_cards_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = DEFAULT_TOOLKIT_CARDS.filter((d) => !existingIds.has(d.id));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return DEFAULT_TOOLKIT_CARDS;
  });

  const handleUpdateConfig = (newConfig: ToolCardConfig[]) => {
    setToolsConfig(newConfig);
    try {
      localStorage.setItem('beeyou_toolkit_cards_config_v1', JSON.stringify(newConfig));
    } catch {}
  };

  const handleResetConfig = () => {
    setToolsConfig(DEFAULT_TOOLKIT_CARDS);
    try {
      localStorage.setItem('beeyou_toolkit_cards_config_v1', JSON.stringify(DEFAULT_TOOLKIT_CARDS));
    } catch {}
  };

  const toolDefinitions: Record<
    ToolCardId,
    {
      id: ToolCardId;
      category: ToolCategory;
      title: string;
      desc: string;
      badge: string;
      badgeClass: string;
      color: string;
      Sticker: React.FC<{ className?: string }>;
      action: () => void;
    }
  > = {
    fidgets: {
      id: 'fidgets',
      category: 'play',
      title: 'Digital Fidget Toys',
      desc: 'Tactile bubble popping with haptics, sensory sand ripples, and smooth marble rolling.',
      badge: 'Fidget & Play',
      badgeClass: isFrogTheme
        ? 'bg-lime-100 text-lime-800 border-lime-300'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      color: isFrogTheme
        ? 'border-2 border-lime-400/90 bg-lime-50/50 hover:bg-lime-50/90 text-lime-950'
        : 'border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950',
      Sticker: isTurtleTheme ? TurtlePondFidgetBubblesSticker : FidgetBubblesSticker,
      action: () => setShowFidgetModal(true),
    },
    breathing: {
      id: 'breathing',
      category: 'calm',
      title: 'Deep Sensory Breathing',
      desc: 'Visual breathing pacers (box breathing, flower breath, 4-7-8) with gentle audio chimes.',
      badge: 'Breathing Pacer',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      color: 'border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/80 text-teal-950',
      Sticker: isTurtleTheme ? TurtlePottedFernSticker : BreathingCloudSticker,
      action: () => openCopingToolkit('breathing'),
    },
    'pie-timer': {
      id: 'pie-timer',
      category: 'focus',
      title: 'Visual Countdown Timer',
      desc: 'Tactile circular Time Timer countdown clock to clearly visualize remaining time and transitions.',
      badge: 'Visual Clock',
      badgeClass: isFrogTheme
        ? 'bg-lime-100 text-lime-800 border-lime-300'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      color: isFrogTheme
        ? 'border-2 border-lime-400/90 bg-lime-50/50 hover:bg-lime-50/90 text-lime-950'
        : isDinoTheme
        ? 'border-2 border-green-300/80 bg-green-50/40 hover:bg-green-50/80 text-green-950'
        : isTurtleTheme
        ? 'border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950'
        : 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      Sticker: isTurtleTheme ? TurtleSandTimerSticker : CountdownTimerSticker,
      action: () => setShowPieTimerModal(true),
    },
    grounding: {
      id: 'grounding',
      category: 'calm',
      title: '5-4-3-2-1 Grounding',
      desc: 'Guided countdown exercise to reconnect with surroundings during anxiety or sensory overwhelm.',
      badge: 'Sensory Grounding',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      color: 'border-2 border-cyan-300/80 bg-cyan-50/40 hover:bg-cyan-50/80 text-cyan-950',
      Sticker: EyeSeeSticker,
      action: () => openCopingToolkit('grounding'),
    },
    'ambient-sounds': {
      id: 'ambient-sounds',
      category: 'calm',
      title: 'Soothing Ambient Sounds',
      desc: 'Multi-track ambient soundscape mixer (gentle rain, ocean waves, forest birds, white noise).',
      badge: 'Soundscapes',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      color: 'border-2 border-indigo-300/80 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-950',
      Sticker: isTurtleTheme ? TurtlePondReedsSticker : MusicSensorySticker,
      action: () => openCopingToolkit('sound'),
    },
    'decision-wheel': {
      id: 'decision-wheel',
      category: 'play',
      title: 'Decision Wheel Spinner',
      desc: 'Break choice paralysis and make fun, easy decisions with an animated spinning wheel.',
      badge: 'Choice Spinner',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/80 text-purple-950',
      Sticker: isTurtleTheme ? TurtleWoodenWheelSticker : DecisionWheelSticker,
      action: () => setShowDecisionWheelModal(true),
    },
    'five-point-scale': {
      id: 'five-point-scale',
      category: 'sos',
      title: 'Incredible 5-Point Scale',
      desc: 'Emotional thermometer with 5 color-coded levels and personalized coping actions.',
      badge: 'Emotion Scale',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      color: 'border-2 border-blue-300/80 bg-blue-50/40 hover:bg-blue-50/80 text-blue-950',
      Sticker: isTurtleTheme ? TurtleBambooThermometerSticker : ThermometerSticker,
      action: () => setShowFivePointModal(true),
    },
  };

  const orderedCards = toolsConfig
    .filter((c) => c.enabled)
    .map((c) => toolDefinitions[c.id])
    .filter(Boolean);

  const filteredCards = selectedCategory === 'all'
    ? orderedCards
    : orderedCards.filter((c) => c.category === selectedCategory);

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'calm', label: 'Calm & Reset' },
    { id: 'play', label: 'Sensory Play' },
    { id: 'focus', label: 'Time & Focus' },
    { id: 'sos', label: 'Emotion & SOS' },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 pb-28 space-y-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {userAgeGroup === 'adult' ? t('Toolkit') : t('Tools')}
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              {orderedCards.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
            {t('Fidget toys, calm breathing pacers, visual countdown timers, and decision tools.')}
          </p>
        </div>

        <CaregiverLockShield
          title="Toolkit Customization"
          onUnlocked={() => setShowCustomizer(true)}
        >
          <button
            type="button"
            onClick={() => setShowCustomizer(true)}
            className="px-3.5 py-2 min-h-[40px] rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer transition-all border border-amber-500/80 shrink-0 self-start sm:self-auto"
            title={t('Customize and reorder tools')}
          >
            <SlidersHorizontal className="w-4 h-4 opacity-80" aria-hidden="true" />
            <span>{t('Customize')}</span>
          </button>
        </CaregiverLockShield>
      </header>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label={t('Tool Categories')}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all'
            ? orderedCards.length
            : orderedCards.filter((c) => c.category === cat.id).length;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[42px] flex items-center gap-1.5 active:scale-95 border-2 focus-visible:ring-4 ${
                isFrogTheme
                  ? 'focus-visible:ring-lime-500/70'
                  : isDinoTheme
                  ? 'focus-visible:ring-green-500/70'
                  : isTurtleTheme
                  ? 'focus-visible:ring-emerald-500/70'
                  : 'focus-visible:ring-amber-500/70'
              } focus-visible:outline-none ${
                isSelected
                  ? isFrogTheme
                    ? 'bg-lime-700 text-white border-lime-700 shadow-sm'
                    : isDinoTheme
                    ? 'bg-green-700 text-white border-green-700 shadow-sm'
                    : isTurtleTheme
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{t(cat.label)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Cards Grid or Empty State */}
      {orderedCards.length === 0 ? (
        <div className="p-8 text-center rounded-3xl border-2 border-dashed border-stone-300 bg-stone-50/70 space-y-3 my-4">
          <p className="font-black text-slate-800 text-base">
            {t('All tools are currently hidden.')}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {t('Tap customize to choose the sensory, focus, and calming tools you need.')}
          </p>
          <button
            type="button"
            onClick={() => {
              handleUpdateConfig(DEFAULT_TOOLKIT_CARDS);
              playChime('star');
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            {t('Show All Tools')}
          </button>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="p-8 text-center rounded-3xl border-2 border-dashed border-stone-300 bg-stone-50/70 space-y-3 my-4">
          <p className="font-black text-slate-800 text-base">
            {t('No tools in this category are enabled.')}
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition-all cursor-pointer"
          >
            {t('View All Enabled Tools')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {filteredCards.map((tool) => {
            const Sticker = tool.Sticker;
            const cardClass = isColorCoded
              ? tool.color
              : `${themeStyles.card} !p-4 sm:!p-5 !rounded-3xl`;
            const badgeClass = isColorCoded
              ? tool.badgeClass
              : themeStyles.adventureTag;
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`w-full text-left p-4 sm:p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(245,184,101,0.18)] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-between gap-4 group focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${cardClass}`}
              >
                <div className="min-w-0 flex-1">
                  <span className={badgeClass}>{t(tool.badge)}</span>
                  <h3
                    className={`font-black text-sm sm:text-base leading-snug transition-colors ${
                      isColorCoded ? 'text-slate-900 group-hover:text-slate-950' : themeStyles.headerText
                    }`}
                  >
                    {t(tool.title)}
                  </h3>
                  <p
                    className={`text-xs font-medium leading-relaxed mt-1 line-clamp-2 ${
                      isColorCoded ? 'opacity-80' : themeStyles.headerSubtext
                    }`}
                  >
                    {t(tool.desc)}
                  </p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-108 transition-transform">
                  <Sticker className="w-full h-full object-contain" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Toolkit Customizer Modal */}
      <ToolkitCustomizerModal
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        cardsConfig={toolsConfig}
        onChange={handleUpdateConfig}
        onReset={handleResetConfig}
      />
    </div>
  );
};
