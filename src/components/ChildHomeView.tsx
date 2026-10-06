import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Calendar, 
  Compass, 
  CheckCircle2, 
  Smile, 
  Home, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Volume2,
  Wind,
  Sun,
  Heart,
  ShieldAlert,
  Moon,
  Pill,
  BookOpen,
  HeartPulse,
  SlidersHorizontal,
  LayoutGrid,
  Check,
  Clock,
  Palette,
  Shield,
  Zap,
  HelpCircle
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { resolveAacImageUrl } from '../services/symbolService';
import { DashboardWidgetId, AACItem } from '../types';
import { isWidgetAvailable } from '../data/navigation';
import { ContextualHelpButton } from './ContextualHelpButton';

export const ChildHomeView: React.FC = () => {
  const {
    childProfile,
    worldState,
    setChildView,
    plansChanged,
    setShowPlansChangedModal,
    showMorningBrief,
    setShowMorningBrief,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    setShowRecollectionModal,
    routines,
    adventures,
    quickPhrases,
    speak,
    setShowCopingToolkit,
    activeTheme,
    setShowThemeModal,
    enabledFeatures,
    userAgeGroup,
    setShowAboutMeModal,
    medications,
    takeMedicationDose,
    setShowMedicationModal,
    moodJournalEntries,
    setShowMoodJournalModal,
    cycleSettings,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPassportModal,
    setShowSpoonModal,
    setShowPieTimerModal,
    setShowDecisionWheelModal,
    setShowFidgetModal,
    setShowToolsHubModal,
    getTodaySpoonEntry,
    dashboardWidgets,
    setShowDashboardCustomizer,
    addToSentence,
  } = useApp();

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const cyclePhaseInfo = isTeenOrAdult ? getCyclePhaseInfo() : null;
  const latestMoodEntry = moodJournalEntries[0];
  const todaySpoonEntry = getTodaySpoonEntry();

  const currentRoutine = routines[0];
  const nextStep = currentRoutine?.steps.find((s) => !s.completed);
  const todaysAdventure = adventures[0];

  // 9 Core Tactile AAC Tiles for the Left Physical Board (Matching Graphic Mockup)
  const TACTILE_AAC_TILES = [
    {
      id: 'tactile-food',
      label: 'Food',
      speechText: 'I want food to eat',
      emoji: '🍕',
      symbolId: 'food',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'food' as const,
    },
    {
      id: 'tactile-drinks',
      label: 'Drinks',
      speechText: 'I want something to drink',
      emoji: '🧃',
      symbolId: 'drink',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'drinks' as const,
    },
    {
      id: 'tactile-play',
      label: 'Play',
      speechText: 'I want to play and have fun',
      emoji: '🎮',
      symbolId: 'play_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'activities' as const,
    },
    {
      id: 'tactile-places',
      label: 'Places',
      speechText: 'I want to go somewhere',
      emoji: '🏠',
      symbolId: 'house',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'places' as const,
    },
    {
      id: 'tactile-feelings',
      label: 'Feelings',
      speechText: 'I want to share my feelings',
      emoji: '💛',
      symbolId: 'happy_man',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'feelings' as const,
    },
    {
      id: 'tactile-mine',
      label: 'My/Mine',
      speechText: 'This is mine',
      emoji: '🤲',
      symbolId: 'mine',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'subject' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-want',
      label: 'Want',
      speechText: 'I want this',
      emoji: '🤲',
      symbolId: 'want_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'verb' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-help',
      label: 'Help',
      speechText: 'Please help me',
      emoji: '🛟',
      symbolId: 'help_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'emergency' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-more',
      label: 'More / All Done',
      speechText: 'More please, or all done',
      emoji: '➕',
      symbolId: 'more',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'adjective' as const,
      category: 'core' as const,
    },
  ];

  const handleTactileTileClick = (tile: typeof TACTILE_AAC_TILES[0]) => {
    speak(tile.speechText);
    playChime('tap');
    addToSentence({
      id: tile.id,
      label: tile.label,
      speechText: tile.speechText,
      emoji: tile.emoji,
      symbolId: tile.symbolId,
      category: tile.category,
      colorType: tile.colorType,
      motorIndex: 0,
    });
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 space-y-4 select-none">
      
      {/* 1. PLANS CHANGED BANNER (If Active) */}
      {plansChanged.active && (
        <div
          onClick={() => setShowPlansChangedModal(true)}
          className="bg-amber-100/95 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce">🔄</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider">
                  Plans Changed
                </span>
                <span className="text-xs font-bold text-amber-900">Tap to see calm plan</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                New Plan: {plansChanged.newPlanTitle}
              </h2>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-700 shrink-0" />
        </div>
      )}

      {/* 2. MAIN 2-COLUMN TACTILE WORKSPACE (Matching Image Graphic) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* ── LEFT COLUMN (60% on Desktop/Tablet): Tactile Silicone AAC Board OR Visual Schedule Hub if AAC is Off ── */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {enabledFeatures?.aacCommunication !== false ? (
            <>
              {/* Header Bar for AAC Board */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                    AAC Sensory Board • Tap to Speak
                  </span>
                </div>
                <button
                  onClick={() => setChildView('aac')}
                  className="text-xs font-black text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-stone-200/60 hover:bg-stone-200 px-3 py-1 rounded-xl transition-all"
                >
                  <span>Full Vocabulary Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recessed Silicone Tray Base */}
              <div className="p-3 sm:p-5 rounded-[32px] bg-[#EFE9DF] border border-[#E0D8CB] shadow-[inset_0_3px_8px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {TACTILE_AAC_TILES.map((tile) => (
                    <div 
                      key={tile.id}
                      className="aspect-square rounded-[24px] bg-[#E4DDD0] p-1 shadow-[inset_0_2px_5px_rgba(0,0,0,0.12)] flex items-center justify-center"
                    >
                      <button
                        type="button"
                        onClick={() => handleTactileTileClick(tile)}
                        className="w-full h-full rounded-[22px] bg-[#FCF9F2] hover:bg-white text-stone-900 flex flex-col items-center justify-between p-2.5 sm:p-3 transition-all cursor-pointer shadow-[0_5px_12px_rgba(0,0,0,0.06),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.18)] active:scale-95 border border-[#EBE3D5] group"
                        title={`Speak "${tile.label}"`}
                      >
                        {/* Mulberry Symbol Image */}
                        <div className="flex-1 w-full flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                          <img
                            src={resolveAacImageUrl(tile)}
                            alt={tile.label}
                            className="w-full h-full object-contain max-h-16 sm:max-h-20 pointer-events-none drop-shadow-2xs"
                            loading="lazy"
                          />
                        </div>

                        {/* Button Label */}
                        <span className="font-extrabold text-xs sm:text-sm text-stone-800 tracking-tight text-center leading-tight">
                          {tile.label}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Speak Sentence Strip Preview */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EFE9DF]/80 border border-[#E0D8CB] text-xs text-stone-600 font-bold">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Instant Voice Output is active. Tap any tile above to speak aloud.</span>
                </div>
              </div>
            </>
          ) : (
            /* NON-AAC FALLBACK: Interactive Daily Schedule & Life Rhythm Stepper Hub */
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                    Visual Schedule & Daily Rhythm Stepper
                  </span>
                </div>
                <button
                  onClick={() => setChildView('my-day')}
                  className="text-xs font-black text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-stone-200/60 hover:bg-stone-200 px-3 py-1 rounded-xl transition-all"
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Interactive Routine Stepper Card */}
              {currentRoutine && (
                <div className="p-4 sm:p-6 rounded-[32px] bg-[#FCF9F2] border border-[#EBE3D5] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-[#EFE9DF] border border-[#E0D8CB] shadow-2xs">
                        {currentRoutine.emoji}
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          Active Routine
                        </span>
                        <h3 className="font-black text-base sm:text-lg text-stone-900 mt-0.5">
                          {currentRoutine.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setChildView('my-day')}
                      className="px-4 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Start Routine →
                    </button>
                  </div>

                  {/* Routine Step Cards */}
                  <div className="space-y-2.5">
                    {currentRoutine.steps.slice(0, 4).map((step, idx) => (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          step.completed
                            ? 'bg-[#F0F7F2] border-emerald-300/80 text-emerald-950'
                            : 'bg-[#F5EFE6] border-[#E8DFC2] text-stone-900 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-white/90 border border-stone-200 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="text-xl shrink-0">{step.emoji}</span>
                          <span className="font-black text-xs sm:text-sm truncate">{step.title}</span>
                        </div>

                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          step.completed ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-400'
                        }`}>
                          {step.completed ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Adventure Spotlight Card */}
              {todaysAdventure && (
                <div
                  onClick={() => setChildView('adventures')}
                  className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border border-[#EBE3D5] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-[#EFE9DF] border border-[#E0D8CB] flex items-center justify-center text-2xl shrink-0 shadow-xs">
                      {todaysAdventure.emoji}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                        Life Adventure Prep
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-stone-900 mt-0.5">
                        {todaysAdventure.title}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        Walkthrough, sensory guide & confidence tips.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 shrink-0" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (40% on Desktop/Tablet): Companion Bento Hub ── */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* 1. Top Greeting Bento Card */}
          <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border border-[#EBE3D5] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div 
                onClick={() => {
                  setShowAboutMeModal(true);
                  playChime('tap');
                }}
                className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-black text-xl flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                title="About Me ID Card"
              >
                🐝
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-none">
                  Hi, {childProfile.name}! 🐝
                </h2>
                <p className="text-xs text-stone-500 font-bold mt-1">
                  You can be yourself here
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDashboardCustomizer(true);
                playChime('tap');
              }}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer shadow-2xs border border-stone-200 shrink-0"
              title="Customize Layout"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Three Chunky Pillowed Action Thumb Pads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Talk Button (Honey Amber) */}
            <button
              onClick={() => {
                setChildView('aac');
                playChime('tap');
              }}
              className="py-3.5 px-3 rounded-[24px] bg-[#F5B865] hover:bg-[#EEAC53] text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,184,101,0.35),inset_0_1.5px_0_rgba(255,255,255,0.6)] active:scale-95 cursor-pointer transition-all border border-[#E2A44E]"
            >
              <span>💬</span>
              <span>Talk</span>
            </button>

            {/* Calm Down Button (Matcha Green) */}
            <button
              onClick={() => {
                setShowCopingToolkit(true);
                playChime('tap');
              }}
              className="py-3.5 px-3 rounded-[24px] bg-[#99C2A2] hover:bg-[#8BB594] text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(153,194,162,0.35),inset_0_1.5px_0_rgba(255,255,255,0.6)] active:scale-95 cursor-pointer transition-all border border-[#85AE8E]"
            >
              <span>🛋️</span>
              <span>Calm down</span>
            </button>

            {/* Need Help Button (Warm Rose) */}
            <button
              onClick={() => {
                setShowCaregiverAlertModal(true);
                playChime('tap');
              }}
              className="py-3.5 px-3 rounded-[24px] bg-[#E68E8E] hover:bg-[#DD7F7F] text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(230,142,142,0.35),inset_0_1.5px_0_rgba(255,255,255,0.6)] active:scale-95 cursor-pointer transition-all border border-[#D57B7B]"
            >
              <span>🆘</span>
              <span>I need help</span>
            </button>
          </div>

          {/* 3. First / Then Visual Routine Card */}
          {currentRoutine && (
            <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border border-[#EBE3D5] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Today's Schedule • {currentRoutine.title}
                </span>
                <button
                  onClick={() => setChildView('my-day')}
                  className="text-xs font-black text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {/* FIRST Step */}
                <div className="p-3 rounded-2xl bg-[#F5EFE6] border border-[#E8DFC2] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">🪥</span>
                    <span className="font-black text-xs sm:text-sm text-stone-900 truncate">
                      {currentRoutine.firstThen?.first ? `First: ${currentRoutine.firstThen.first}` : 'First: Brush teeth'}
                    </span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0">
                    ✓
                  </span>
                </div>

                {/* THEN Step */}
                <div className="p-3 rounded-2xl bg-[#F5EFE6] border border-[#E8DFC2] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">📱</span>
                    <span className="font-black text-xs sm:text-sm text-stone-900 truncate">
                      {currentRoutine.firstThen?.then ? `Then: ${currentRoutine.firstThen.then}` : 'Then: Tablet time (15 min)'}
                    </span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 font-black text-xs flex items-center justify-center shrink-0">
                    ○
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. 2x2 Regulation & Executive Tools Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Visual Pie Clock */}
            <button
              onClick={() => {
                setShowPieTimerModal(true);
                playChime('tap');
              }}
              className="p-3.5 rounded-[24px] bg-[#FDE293]/90 hover:bg-[#FDE293] border border-[#F6D06F] text-stone-900 font-black text-xs sm:text-sm flex flex-col items-start justify-between gap-2 shadow-[0_3px_10px_rgba(253,226,147,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-95 cursor-pointer transition-all"
            >
              <span className="text-2xl">⏰</span>
              <div className="text-left">
                <div className="leading-tight">Visual Pie Clock</div>
                <div className="text-[10px] font-bold text-stone-600 mt-0.5">Analog disk timer</div>
              </div>
            </button>

            {/* 5-Point Scale */}
            <button
              onClick={() => {
                setShowFivePointModal(true);
                playChime('tap');
              }}
              className="p-3.5 rounded-[24px] bg-[#C4E7D4]/90 hover:bg-[#C4E7D4] border border-[#AAD6BE] text-stone-900 font-black text-xs sm:text-sm flex flex-col items-start justify-between gap-2 shadow-[0_3px_10px_rgba(196,231,212,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-95 cursor-pointer transition-all"
            >
              <span className="text-2xl">🌡️</span>
              <div className="text-left">
                <div className="leading-tight">5-Point Scale</div>
                <div className="text-[10px] font-bold text-stone-600 mt-0.5">Check regulation</div>
              </div>
            </button>

            {/* Fidget Corner */}
            <button
              onClick={() => {
                setShowFidgetModal(true);
                playChime('tap');
              }}
              className="p-3.5 rounded-[24px] bg-[#F6C0C0]/90 hover:bg-[#F6C0C0] border border-[#EAA4A4] text-stone-900 font-black text-xs sm:text-sm flex flex-col items-start justify-between gap-2 shadow-[0_3px_10px_rgba(246,192,192,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-95 cursor-pointer transition-all"
            >
              <span className="text-2xl">🫧</span>
              <div className="text-left">
                <div className="leading-tight">Fidget Corner</div>
                <div className="text-[10px] font-bold text-stone-600 mt-0.5">Bubble pop & sand</div>
              </div>
            </button>

            {/* Themes & Studio */}
            <button
              onClick={() => {
                setShowThemeModal(true);
                playChime('tap');
              }}
              className="p-3.5 rounded-[24px] bg-[#D7D4F0]/90 hover:bg-[#D7D4F0] border border-[#BFBAE6] text-stone-900 font-black text-xs sm:text-sm flex flex-col items-start justify-between gap-2 shadow-[0_3px_10px_rgba(215,212,240,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-95 cursor-pointer transition-all"
            >
              <span className="text-2xl">🎨</span>
              <div className="text-left">
                <div className="leading-tight">Themes & Studio</div>
                <div className="text-[10px] font-bold text-stone-600 mt-0.5">Switch look anytime</div>
              </div>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
