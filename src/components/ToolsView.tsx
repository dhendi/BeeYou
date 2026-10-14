import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import {
  FidgetBubblesSticker,
  BreathingCloudSticker,
  DecisionWheelSticker,
  CountdownTimerSticker,
  ShieldSosSticker,
  ThermometerSticker,
  MusicSensorySticker,
  CalmSparklesSticker,
  ConnectHeartSticker,
  SpoonSticker,
} from './icons/JournalStickers';

type ToolCategory = 'all' | 'calm' | 'play' | 'focus' | 'sos';

export const ToolsView: React.FC = () => {
  const {
    setShowFidgetModal,
    setShowDecisionWheelModal,
    setShowPieTimerModal,
    setShowFivePointModal,
    activateEmergencyMode,
    setShowSpoonModal,
    openCopingToolkit,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const categories: { id: ToolCategory; label: string; count?: number }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'calm', label: 'Calm & Reset' },
    { id: 'play', label: 'Sensory Play' },
    { id: 'focus', label: 'Time & Energy' },
    { id: 'sos', label: 'Emotion & SOS' },
  ];

  const toolCards = [
    // 🫧 Sensory Play
    {
      id: 'fidgets',
      category: 'play' as ToolCategory,
      title: 'Digital Fidget Toys',
      desc: 'Tactile bubble popping with haptics, sensory sand ripples, and smooth marble rolling.',
      badge: 'Fidget & Play',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      color: 'border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950',
      Sticker: FidgetBubblesSticker,
      action: () => {
        setShowFidgetModal(true);
        playChime('tap');
      },
    },

    // 🌬️ Calm & Reset: Deep Breathing
    {
      id: 'breathing',
      category: 'calm' as ToolCategory,
      title: 'Deep Sensory Breathing',
      desc: 'Visual breathing pacers (box breathing, flower breath, 4-7-8) with gentle audio chimes.',
      badge: 'Breathing Pacer',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      color: 'border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/80 text-teal-950',
      Sticker: BreathingCloudSticker,
      action: () => {
        openCopingToolkit('breathing');
        playChime('tap');
      },
    },

    // 💖 Calm & Reset: Coping Kit & Strategies
    {
      id: 'calm-strategies',
      category: 'calm' as ToolCategory,
      title: 'Calm Tools & Strategies',
      desc: 'Personalized sensory coping strategies, calm activities, and safe reset ideas.',
      badge: 'Coping Kit',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      color: 'border-2 border-rose-300/80 bg-rose-50/40 hover:bg-rose-50/80 text-rose-950',
      Sticker: CalmSparklesSticker,
      action: () => {
        openCopingToolkit('strategies');
        playChime('tap');
      },
    },

    // ⏱️ Time & Energy: Visual Countdown Timer (Pie Clock)
    {
      id: 'pie-timer',
      category: 'focus' as ToolCategory,
      title: 'Visual Countdown Timer',
      desc: 'Tactile circular Time Timer countdown clock to clearly visualize remaining time and transitions.',
      badge: 'Visual Clock',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      Sticker: CountdownTimerSticker,
      action: () => {
        setShowPieTimerModal(true);
        playChime('tap');
      },
    },

    // 👁️ Calm & Reset: 5-4-3-2-1 Sensory Grounding
    {
      id: 'grounding',
      category: 'calm' as ToolCategory,
      title: '5-4-3-2-1 Grounding',
      desc: 'Guided countdown exercise to reconnect with surroundings during anxiety or sensory overwhelm.',
      badge: 'Sensory Grounding',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      color: 'border-2 border-cyan-300/80 bg-cyan-50/40 hover:bg-cyan-50/80 text-cyan-950',
      Sticker: ConnectHeartSticker,
      action: () => {
        openCopingToolkit('grounding');
        playChime('tap');
      },
    },

    // 🎵 Calm & Reset: Soothing Ambient Sounds
    {
      id: 'ambient-sounds',
      category: 'calm' as ToolCategory,
      title: 'Soothing Ambient Sounds',
      desc: 'Multi-track ambient soundscape mixer (gentle rain, ocean waves, forest birds, white noise).',
      badge: 'Soundscapes',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      color: 'border-2 border-indigo-300/80 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-950',
      Sticker: MusicSensorySticker,
      action: () => {
        openCopingToolkit('sound');
        playChime('tap');
      },
    },

    // 🎡 Sensory Play: Decision Wheel
    {
      id: 'decision-wheel',
      category: 'play' as ToolCategory,
      title: 'Decision Wheel Spinner',
      desc: 'Break choice paralysis and make fun, easy decisions with an animated spinning wheel.',
      badge: 'Choice Spinner',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/80 text-purple-950',
      Sticker: DecisionWheelSticker,
      action: () => {
        setShowDecisionWheelModal(true);
        playChime('tap');
      },
    },

    // 🌡️ Emotion & SOS: Incredible 5-Point Scale
    {
      id: 'five-point-scale',
      category: 'sos' as ToolCategory,
      title: 'Incredible 5-Point Scale',
      desc: 'Emotional thermometer with 5 color-coded levels and personalized coping actions.',
      badge: 'Emotion Scale',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      color: 'border-2 border-blue-300/80 bg-blue-50/40 hover:bg-blue-50/80 text-blue-950',
      Sticker: ThermometerSticker,
      action: () => {
        setShowFivePointModal(true);
        playChime('tap');
      },
    },

    // 🚨 Emotion & SOS: Emergency Sensory Mode
    {
      id: 'emergency-mode',
      category: 'sos' as ToolCategory,
      title: 'Emergency Sensory Mode',
      desc: 'Instant low-stimulation shield, dimmed screen, and emergency help speech cards.',
      badge: 'Sensory SOS',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      color: 'border-2 border-red-300/80 bg-red-50/40 hover:bg-red-50/80 text-red-950',
      Sticker: ShieldSosSticker,
      action: () => {
        activateEmergencyMode();
        playChime('tap');
      },
    },

    // 🥄 Time & Energy: Spoon Theory Budget
    {
      id: 'spoon-budget',
      category: 'focus' as ToolCategory,
      title: 'Spoon Theory Stamina Budget',
      desc: 'Track daily physical and social energy spoons to pace yourself and prevent burnout.',
      badge: 'Energy Tracker',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      Sticker: SpoonSticker,
      action: () => {
        setShowSpoonModal(true);
        playChime('tap');
      },
    },
  ];

  const filteredCards = selectedCategory === 'all'
    ? toolCards
    : toolCards.filter((c) => c.category === selectedCategory);

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 pb-28 space-y-4">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('Tools')} 🧰
          </h1>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {toolCards.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold">
          {t('Fidget toys, calm breathing pacers, visual countdown timers, and decision tools.')}
        </p>
      </header>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label={t('Tool Categories')}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all'
            ? toolCards.length
            : toolCards.filter((c) => c.category === cat.id).length;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setSelectedCategory(cat.id);
                playChime('tap');
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[42px] flex items-center gap-1.5 active:scale-95 border-2 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
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

      {/* Tools Cards Grid (Each tool separated into its own card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {filteredCards.map((tool) => {
          const Sticker = tool.Sticker;
          return (
            <button
              key={tool.id}
              onClick={tool.action}
              className={`w-full text-left p-4 sm:p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-between gap-4 group focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${tool.color}`}
            >
              <div className="min-w-0 flex-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border inline-block mb-1.5 ${tool.badgeClass}`}>
                  {t(tool.badge)}
                </span>
                <h3 className="font-black text-sm sm:text-base leading-snug text-slate-900 group-hover:text-slate-950 transition-colors">
                  {t(tool.title)}
                </h3>
                <p className="text-xs opacity-80 font-medium leading-relaxed mt-1 line-clamp-2">
                  {t(tool.desc)}
                </p>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 p-1 group-hover:scale-108 transition-transform">
                <Sticker className="w-full h-full object-contain" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
