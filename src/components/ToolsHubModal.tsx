import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sparkles, 
  Heart, 
  Wind, 
  Timer, 
  Volume2, 
  ShieldAlert, 
  BookOpen, 
  Pill, 
  HeartPulse, 
  ArrowRight,
  Palette
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const ToolsHubModal: React.FC = () => {
  const {
    showToolsHubModal,
    setShowToolsHubModal,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPassportModal,
    setShowSpoonModal,
    setShowPieTimerModal,
    setShowDecisionWheelModal,
    setShowFidgetModal,
    setShowCopingToolkit,
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
      emoji: '🌡️',
      badge: 'Regulation',
      bg: 'from-emerald-50 to-green-100/70 border-emerald-300 text-emerald-950',
      action: () => openTool(() => setShowFivePointModal(true)),
    },
    {
      id: 'pie-timer',
      category: 'sensory',
      title: 'Visual Pie Clock',
      desc: 'Time Timer visual countdown disk',
      emoji: '⏰',
      badge: 'Time',
      bg: 'from-sky-50 to-cyan-100/70 border-sky-300 text-sky-950',
      action: () => openTool(() => setShowPieTimerModal(true)),
    },
    {
      id: 'wheel',
      category: 'sensory',
      title: 'Decision Wheel',
      desc: 'Spin to break choice paralysis',
      emoji: '🎡',
      badge: 'Decide',
      bg: 'from-indigo-50 to-purple-100/70 border-indigo-300 text-indigo-950',
      action: () => openTool(() => setShowDecisionWheelModal(true)),
    },
    {
      id: 'fidgets',
      category: 'sensory',
      title: 'Digital Fidget Toys',
      desc: 'Bubble pop, water sand ripples & marble',
      emoji: '🫧',
      badge: 'Stimming',
      bg: 'from-purple-50 to-pink-100/70 border-purple-300 text-purple-950',
      action: () => openTool(() => setShowFidgetModal(true)),
    },
    {
      id: 'coping',
      category: 'sensory',
      title: 'Calm Room & Breathing',
      desc: 'Box breathing, 17 soundscapes & grounding',
      emoji: '🛋️',
      badge: 'Breathe',
      bg: 'from-teal-50 to-emerald-100/70 border-teal-300 text-teal-950',
      action: () => openTool(() => setShowCopingToolkit(true)),
    },
    {
      id: 'emergency',
      category: 'sensory',
      title: 'Emergency Sensory Mode',
      desc: 'Instant dim screen & emergency speech cards',
      emoji: '🚨',
      badge: 'Crisis / SOS',
      bg: 'from-rose-50 to-red-100/80 border-rose-300 text-rose-950',
      action: () => openTool(() => activateEmergencyMode()),
    },

    // ── Wellness & Energy ──
    {
      id: 'spoons',
      category: 'wellness',
      title: 'Spoon Theory Budget',
      desc: todaySpoons
        ? `${todaySpoons.totalSpoons - todaySpoons.usedSpoons} spoons remaining today`
        : 'Morning check-in & stamina tracker',
      emoji: '🥄',
      badge: todaySpoons ? `${todaySpoons.totalSpoons - todaySpoons.usedSpoons} Spoons` : 'Energy',
      bg: 'from-amber-50 to-yellow-100/70 border-amber-300 text-amber-950',
      action: () => openTool(() => setShowSpoonModal(true)),
    },
    ...(enabledFeatures?.medicationReminders !== false
      ? [
          {
            id: 'meds',
            category: 'wellness',
            title: 'Medication Reminders',
            desc: pendingMeds.length > 0 ? `${pendingMeds.length} pending doses` : 'All caught up for today!',
            emoji: '💊',
            badge: `${medications.length} Meds`,
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
            emoji: '📖',
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
            emoji: cycleSettings.discreetMode ? '🌿' : '🌸',
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
      emoji: '🪪',
      badge: 'Printable',
      bg: 'from-slate-50 to-slate-100 border-slate-300 text-slate-900',
      action: () => openTool(() => setShowPassportModal(true)),
    },
    {
      id: 'aboutme',
      category: 'support',
      title: 'About Me Emergency ID',
      desc: 'Caregiver contact details & medical info',
      emoji: '🆔',
      badge: 'ID Card',
      bg: 'from-blue-50 to-indigo-100/70 border-blue-300 text-blue-950',
      action: () => openTool(() => setShowAboutMeModal(true)),
    },
    {
      id: 'accessibility',
      category: 'support',
      title: 'Accessibility & Sensory Hub',
      desc: 'Color coding, sound effects, spoken voice & feature toggles',
      emoji: '♿',
      badge: 'Preferences',
      bg: 'from-sky-50 to-indigo-100/70 border-indigo-300 text-indigo-950',
      action: () => openTool(() => setShowAccessibilityModal(true)),
    },
    {
      id: 'theme',
      category: 'support',
      title: 'Themes & Companion Studio',
      desc: 'Change theme palette, sounds & mascot',
      emoji: '🎨',
      badge: 'Themes',
      bg: 'from-violet-50 to-purple-100/70 border-violet-300 text-violet-950',
      action: () => openTool(() => setShowThemeModal(true)),
    },
  ];

  // Tools tied to a feature toggle disappear when that feature is switched off.
  const TOOL_GATE: Record<string, 'sensoryBreathingPacer' | 'visualCountdownTimer' | 'emergencyAlertSOS'> = {
    scale: 'sensoryBreathingPacer',
    fidgets: 'sensoryBreathingPacer',
    coping: 'sensoryBreathingPacer',
    'pie-timer': 'visualCountdownTimer',
    emergency: 'emergencyAlertSOS',
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
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={() => setShowToolsHubModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-2 border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              🧰
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                BeeYou Tools Hub
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sensory regulation, executive function & wellness tools
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowToolsHubModal(false)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'all' as const, label: 'All Tools', emoji: '✨' },
            { id: 'sensory' as const, label: 'Calm & Regulate', emoji: '🫧' },
            { id: 'wellness' as const, label: 'Health & Energy', emoji: '🥄' },
            { id: 'support' as const, label: 'Support & Profile', emoji: '🪪' },
          ].filter((cat) => cat.id === 'all' || availableTools.some((t) => t.category === cat.id)).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Category description */}
        {activeCategory !== 'all' && (
          <p className="px-5 pt-3 text-xs text-slate-600 font-medium">{CATEGORY_BLURB[activeCategory]}</p>
        )}

        {/* Tools Grid - Single Clean Neutral Color for Low Stimulation */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTools.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-600 font-medium py-6">
              Nothing here right now. You can turn tools on in Accessibility &amp; Sensory Hub.
            </p>
          )}
          {filteredTools.map((tool) => (
            <button
              type="button"
              key={tool.id}
              onClick={tool.action}
              className="min-h-[64px] text-left p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-11 h-11 rounded-2xl bg-slate-100 text-2xl flex items-center justify-center border border-slate-200/80 shrink-0 shadow-2xs" aria-hidden="true">
                  {tool.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                      {tool.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {tool.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-snug">
                    {tool.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Tap any tool to open • You can also pin your favorites to the Home screen
          </p>
        </div>
      </div>
    </div>
  );
};
