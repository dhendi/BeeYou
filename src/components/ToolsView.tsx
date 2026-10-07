import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smile, 
  Wind, 
  Sparkles, 
  Clock, 
  Play,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

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
      emoji: '🫧',
      icon: Smile,
      badge: 'Fidget & Play',
      color: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950',
      iconColor: 'bg-emerald-500 text-white',
      action: () => {
        setShowFidgetModal(true);
        playChime('tap');
      },
    },
    {
      id: 'breathing',
      title: 'Calm Sensory Breathing',
      desc: 'Visual breathing pacers (box breathing, flower breath) and soothing audio soundscapes.',
      emoji: '🌬️',
      icon: Wind,
      badge: 'Calm Down',
      color: 'border-teal-300 bg-teal-50/70 hover:bg-teal-100/70 text-teal-950',
      iconColor: 'bg-teal-500 text-white',
      action: () => {
        setShowCopingToolkit(true);
        playChime('tap');
      },
    },
    {
      id: 'decision-wheel',
      title: 'Decision Wheel Spinner',
      desc: 'Break choice paralysis and make fun, easy decisions with an animated spin wheel.',
      emoji: '🎡',
      icon: Sparkles,
      badge: 'Choice Spinner',
      color: 'border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 text-purple-950',
      iconColor: 'bg-purple-500 text-white',
      action: () => {
        setShowDecisionWheelModal(true);
        playChime('tap');
      },
    },
    {
      id: 'pie-timer',
      title: 'Visual Countdown Timer',
      desc: 'Circular pie timer to clearly visualize time remaining for activities and transitions.',
      emoji: '⏱️',
      icon: Clock,
      badge: 'Visual Clock',
      color: 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950',
      iconColor: 'bg-amber-500 text-white',
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
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={tool.action}
              className={`p-4 rounded-3xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-xs flex flex-col justify-between ${tool.color}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${tool.iconColor}`}>
                    <Icon className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight">{t(tool.title)}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {t(tool.badge)}
                    </span>
                  </div>
                </div>
                <span className="text-xl" aria-hidden="true">{tool.emoji}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                {t(tool.desc)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
