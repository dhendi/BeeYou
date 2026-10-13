import React from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import {
  FidgetBubblesSticker,
  BreathingCloudSticker,
  DecisionWheelSticker,
  CountdownTimerSticker,
} from './icons/JournalStickers';

export const ToolsView: React.FC = () => {
  const {
    setShowFidgetModal,
    setShowCopingToolkit,
    setShowDecisionWheelModal,
    setShowPieTimerModal,
  } = useApp();

  const toolCards = [
    {
      id: 'fidgets',
      title: 'Digital Fidget Toys',
      desc: 'Tactile bubble popping with haptics, sensory sand ripples, and smooth marble rolling.',
      badge: 'Fidget & Play',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      color: 'border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950',
      stickerBox: 'bg-white border-emerald-200/90 shadow-2xs',
      Sticker: FidgetBubblesSticker,
      action: () => {
        setShowFidgetModal(true);
        playChime('tap');
      },
    },
    {
      id: 'breathing',
      title: 'Calm Sensory Breathing',
      desc: 'Visual breathing pacers (box breathing, flower breath) and soothing audio soundscapes.',
      badge: 'Calm Down',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      color: 'border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/80 text-teal-950',
      stickerBox: 'bg-white border-teal-200/90 shadow-2xs',
      Sticker: BreathingCloudSticker,
      action: () => {
        setShowCopingToolkit(true);
        playChime('tap');
      },
    },
    {
      id: 'decision-wheel',
      title: 'Decision Wheel Spinner',
      desc: 'Break choice paralysis and make fun, easy decisions with an animated spin wheel.',
      badge: 'Choice Spinner',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/80 text-purple-950',
      stickerBox: 'bg-white border-purple-200/90 shadow-2xs',
      Sticker: DecisionWheelSticker,
      action: () => {
        setShowDecisionWheelModal(true);
        playChime('tap');
      },
    },
    {
      id: 'pie-timer',
      title: 'Visual Countdown Timer',
      desc: 'Circular pie timer to clearly visualize time remaining for activities and transitions.',
      badge: 'Visual Clock',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      stickerBox: 'bg-white border-amber-200/90 shadow-2xs',
      Sticker: CountdownTimerSticker,
      action: () => {
        setShowPieTimerModal(true);
        playChime('tap');
      },
    },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-3 sm:px-5 py-3 pb-24 space-y-4">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('Tools')} 🧰
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
          {t('Fidget toys, calm breathing pacers, visual countdown timers, and decision tools.')}
        </p>
      </header>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {toolCards.map((tool) => {
          const Sticker = tool.Sticker;
          return (
            <button
              key={tool.id}
              onClick={tool.action}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-between gap-4 group ${tool.color}`}
            >
              <div className="min-w-0 flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block mb-1 ${tool.badgeClass}`}>
                  {t(tool.badge)}
                </span>
                <h3 className="font-bold text-sm sm:text-base leading-snug truncate">
                  {t(tool.title)}
                </h3>
                <p className="text-xs opacity-75 font-medium leading-snug mt-0.5 line-clamp-1">
                  {t(tool.desc)}
                </p>
              </div>
              <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                <Sticker className="w-full h-full object-contain" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
