import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  Heart, 
  Wind, 
  Timer, 
  Volume2, 
  ShieldAlert, 
  BookOpen, 
  Pill, 
  HeartPulse, 
  ArrowRight,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import {
  FidgetBubblesSticker,
  CountdownTimerSticker,
  BreathingCloudSticker,
  DecisionWheelSticker,
  SpoonSticker,
  MedicationSticker,
  MoodJournalSticker,
  IdCardSticker,
  ThermometerSticker,
  ConnectHeartSticker,
  EveningMoonSticker,
  ReadingBookSticker,
  RepeatLoopSticker,
  MusicSensorySticker,
  ArtCraftsSticker,
  AccessibilityHubSticker,
} from './icons/JournalStickers';

export const ToolsHubModal: React.FC = () => {
  const {
    showToolsHubModal,
    setShowToolsHubModal,
    setShowFivePointModal,
    setShowPassportModal,
    setShowSpoonModal,
    setShowPieTimerModal,
    setShowDecisionWheelModal,
    setShowFidgetModal,
    setShowCopingToolkit,
    openCopingToolkit,
    setShowAboutMeModal,
    setShowThemeModal,
    setShowMedicationModal,
    setShowMoodJournalModal,
    setShowCycleTrackerModal,
    setShowAccessibilityModal,
    userAgeGroup,
    enabledFeatures,
    getTodaySpoonEntry,
    medications,
    cycleSettings,
    getCyclePhaseInfo,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'sensory' | 'wellness' | 'support'>('all');

  if (!showToolsHubModal) return null;

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const todaySpoons = getTodaySpoonEntry();
  const pendingMeds = medications.filter(
    (m) => m.active && m.frequency !== 'as_needed' && m.times.some((t) => !m.takenTimesToday.includes(t))
  );

  const openTool = (opener: () => void) => {
    setShowToolsHubModal(false);
    playChime('tap');
    opener();
  };

  const tools = [
    // ── Sensory & Regulation ──
    {
      id: 'scale',
      category: 'sensory',
      title: 'Incredible 5-Point Scale',
      desc: 'Emotional thermometer & coping actions',
      badge: 'Regulation',
      bg: 'from-emerald-50 to-green-100/70 border-emerald-300 text-emerald-950',
      action: () => openTool(() => setShowFivePointModal(true)),
    },
    {
      id: 'pie-timer',
      category: 'sensory',
      title: 'Visual Pie Clock',
      desc: 'Time Timer visual countdown disk',
      badge: 'Time',
      bg: 'from-sky-50 to-cyan-100/70 border-sky-300 text-sky-950',
      action: () => openTool(() => setShowPieTimerModal(true)),
    },
    {
      id: 'wheel',
      category: 'sensory',
      title: 'Decision Wheel',
      desc: 'Spin to break choice paralysis',
      badge: 'Decide',
      bg: 'from-indigo-50 to-purple-100/70 border-indigo-300 text-indigo-950',
      action: () => openTool(() => setShowDecisionWheelModal(true)),
    },
    {
      id: 'fidgets',
      category: 'sensory',
      title: 'Digital Fidget Toys',
      desc: 'Bubble pop, water sand ripples & marble',
      badge: 'Stimming',
      bg: 'from-purple-50 to-pink-100/70 border-purple-300 text-purple-950',
      action: () => openTool(() => setShowFidgetModal(true)),
    },
    {
      id: 'breathing',
      category: 'sensory',
      title: 'Deep Sensory Breathing',
      desc: 'Box breathing, flower breath & 4-7-8 pacers',
      badge: 'Breathe',
      bg: 'from-teal-50 to-emerald-100/70 border-teal-300 text-teal-950',
      action: () => openTool(() => openCopingToolkit('breathing')),
    },
    {
      id: 'grounding',
      category: 'sensory',
      title: '5-4-3-2-1 Grounding',
      desc: 'Sensory countdown to reset during overwhelm',
      badge: 'Grounding',
      bg: 'from-cyan-50 to-sky-100/70 border-cyan-300 text-cyan-950',
      action: () => openTool(() => openCopingToolkit('grounding')),
    },
    {
      id: 'sounds',
      category: 'sensory',
      title: 'Soothing Ambient Sounds',
      desc: '30+ gentle multi-track audio soundscapes & frequencies',
      badge: 'Soundscapes',
      bg: 'from-indigo-50 to-violet-100/70 border-indigo-300 text-indigo-950',
      action: () => openTool(() => openCopingToolkit('sound')),
    },

    // ── Wellness & Energy ──
    {
      id: 'spoons',
      category: 'wellness',
      title: 'Spoon Theory Budget',
      desc: todaySpoons
        ? `${todaySpoons.totalSpoons - todaySpoons.usedSpoons} ${t('spoons remaining today')}`
        : 'Morning check-in & stamina tracker',
      badge: todaySpoons ? `${todaySpoons.totalSpoons - todaySpoons.usedSpoons} ${t('Spoons')}` : 'Energy',
      bg: 'from-amber-50 to-yellow-100/70 border-amber-300 text-amber-950',
      action: () => openTool(() => setShowSpoonModal(true)),
    },
    ...(enabledFeatures?.medicationReminders !== false
      ? [
          {
            id: 'meds',
            category: 'wellness',
            title: 'Medication Reminders',
            desc: pendingMeds.length > 0 ? `${pendingMeds.length} ${t('pending doses')}` : 'All caught up for today!',
            badge: `${medications.length} ${t('Meds')}`,
            bg: 'from-teal-50 to-cyan-100/70 border-teal-300 text-teal-950',
            action: () => openTool(() => setShowMedicationModal(true)),
          },
        ]
      : []),
    ...(isTeenOrAdult && enabledFeatures?.moodJournal !== false
      ? [
          {
            id: 'journal',
            category: 'wellness',
            title: 'Mood Journal',
            desc: 'Reflect on sensory overload & triggers',
            badge: 'Reflection',
            bg: 'from-purple-50 to-indigo-100/70 border-purple-300 text-purple-950',
            action: () => openTool(() => setShowMoodJournalModal(true)),
          },
        ]
      : []),
    ...(isTeenOrAdult && enabledFeatures?.cycleTracker !== false
      ? [
          {
            id: 'cycle',
            category: 'wellness',
            title: cycleSettings.discreetMode ? 'Wellness Rhythm' : 'Cycle & Sensory Rhythm',
            desc: 'Sensory tolerance & hormonal wellness tracking',
            badge: 'Rhythm',
            bg: 'from-pink-50 to-rose-100/70 border-pink-300 text-pink-950',
            action: () => openTool(() => setShowCycleTrackerModal(true)),
          },
        ]
      : []),

    // ── Support & Profile ──
    {
      id: 'passport',
      category: 'support',
      title: 'Communication Passport',
      desc: '1-page printable summary for teachers & dentists',
      badge: 'Printable',
      bg: 'from-slate-50 to-slate-100 border-slate-300 text-slate-900',
      action: () => openTool(() => setShowPassportModal(true)),
    },
    {
      id: 'aboutme',
      category: 'support',
      title: 'About Me Emergency ID',
      desc: 'Caregiver contact details & medical info',
      badge: 'ID Card',
      bg: 'from-blue-50 to-indigo-100/70 border-blue-300 text-blue-950',
      action: () => openTool(() => setShowAboutMeModal(true)),
    },
    {
      id: 'accessibility',
      category: 'support',
      title: 'Accessibility & Sensory Hub',
      desc: 'Color coding, sound effects, spoken voice & feature toggles',
      badge: 'Preferences',
      bg: 'from-sky-50 to-indigo-100/70 border-indigo-300 text-indigo-950',
      action: () => openTool(() => setShowAccessibilityModal(true)),
    },
    {
      id: 'theme',
      category: 'support',
      title: 'Themes & Companion Studio',
      desc: 'Change theme palette, sounds & mascot',
      badge: 'Themes',
      bg: 'from-violet-50 to-purple-100/70 border-violet-300 text-violet-950',
      action: () => openTool(() => setShowThemeModal(true)),
    },
  ];

  // Tools tied to a feature toggle disappear when that feature is switched off.
  const TOOL_GATE: Record<string, 'sensoryBreathingPacer' | 'visualCountdownTimer' | 'emergencyAlertSOS'> = {
    scale: 'sensoryBreathingPacer',
    fidgets: 'sensoryBreathingPacer',
    breathing: 'sensoryBreathingPacer',
    grounding: 'sensoryBreathingPacer',
    sounds: 'sensoryBreathingPacer',
    'pie-timer': 'visualCountdownTimer',
  };
  const CATEGORY_BLURB: Record<'sensory' | 'wellness' | 'support', string> = {
    sensory: 'Calm down, reset and make choices when things feel like too much.',
    wellness: 'Track energy, mood, medication and your body.',
    support: 'Help others understand you, plus your look and settings.',
  };

  const availableTools = tools.filter((t) => {
    const gate = TOOL_GATE[t.id];
    return !gate || enabledFeatures?.[gate] !== false;
  });
  const filteredTools = activeCategory === 'all'
    ? availableTools
    : availableTools.filter((t) => t.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in duration-200"
      onClick={() => setShowToolsHubModal(false)}
    >
      <div
        className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col shadow-2xl overflow-hidden border-2 border-[#E0D8CB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#FCF9F2] border-b-2 border-[#E0D8CB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5EFE6] border border-[#E0D8CB] flex items-center justify-center text-[#2D241E] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
              <SlidersHorizontal className="w-5 h-5 text-amber-700" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2D241E] leading-tight">
                {t('BeeYou Tools Hub')}
              </h2>
              <p className="text-xs text-[#7A6C60] font-medium">
                {t('Sensory regulation, executive function & wellness tools')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowToolsHubModal(false)}
            className="p-2 rounded-xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] transition-all cursor-pointer border border-[#E0D8CB] shadow-[0_2px_4px_rgba(0,0,0,0.03)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills (Debossed Silicone Rail) */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EFE9DF] border-b border-[#E0D8CB] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-x-auto">
          {[
            { id: 'all' as const, label: 'All Tools' },
            { id: 'sensory' as const, label: 'Calm & Regulate' },
            { id: 'wellness' as const, label: 'Health & Energy' },
            { id: 'support' as const, label: 'Support & Profile' },
          ].filter((cat) => cat.id === 'all' || availableTools.some((t) => t.category === cat.id)).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#FCF9F2] text-[#2D241E] border border-[#E0D8CB] shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0.5px_rgba(255,255,255,0.9)]'
                  : 'text-[#6B5E52] hover:text-[#2D241E]'
              }`}
            >
              <span>{t(cat.label)}</span>
            </button>
          ))}
        </div>

        {/* Category description */}
        {activeCategory !== 'all' && (
          <p className="px-5 pt-3 text-xs text-[#7A6C60] font-medium">{t(CATEGORY_BLURB[activeCategory])}</p>
        )}

        {/* Tools Grid - Tactile Bento Tiles */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTools.length === 0 && (
            <p className="col-span-full text-center text-sm text-[#7A6C60] font-medium py-6">
              {t('Nothing here right now. You can turn tools on in Accessibility & Sensory Hub.')}
            </p>
          )}
          {filteredTools.map((tool) => {
            const Sticker =
              tool.id === 'scale'
                ? ThermometerSticker
                : tool.id === 'timer' || tool.id === 'pie-timer'
                ? CountdownTimerSticker
                : tool.id === 'wheel'
                ? DecisionWheelSticker
                : tool.id === 'fidgets'
                ? FidgetBubblesSticker
                : tool.id === 'breathing' || tool.id === 'coping'
                ? BreathingCloudSticker
                : tool.id === 'grounding'
                ? ConnectHeartSticker
                : tool.id === 'sounds'
                ? MusicSensorySticker
                : tool.id === 'spoons'
                ? SpoonSticker
                : tool.id === 'meds'
                ? MedicationSticker
                : tool.id === 'journal'
                ? MoodJournalSticker
                : tool.id === 'cycle'
                ? RepeatLoopSticker
                : tool.id === 'passport'
                ? ReadingBookSticker
                : tool.id === 'aboutme'
                ? IdCardSticker
                : tool.id === 'accessibility'
                ? AccessibilityHubSticker
                : tool.id === 'theme'
                ? ArtCraftsSticker
                : tool.id === 'recollection'
                ? EveningMoonSticker
                : FidgetBubblesSticker;

            return (
              <button
                type="button"
                key={tool.id}
                onClick={tool.action}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 bg-gradient-to-br shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between gap-3 group ${tool.bg}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-current opacity-85">
                      {t(tool.badge)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug truncate">
                    {t(tool.title)}
                  </h4>
                  <p className="text-[11px] sm:text-xs opacity-75 font-medium leading-snug mt-0.5 line-clamp-1">
                    {t(tool.desc)}
                  </p>
                </div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                  <Sticker className="w-full h-full object-contain" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FCF9F2] border-t-2 border-[#E0D8CB] text-center">
          <p className="text-[11px] text-[#8C7E72] font-semibold">
            {t('Tap any tool to open • You can also pin your favorites to the Home screen')}
          </p>
        </div>
      </div>
    </div>
  );
};
