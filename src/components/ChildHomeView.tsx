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
import { t } from '../services/translator';

export const ChildHomeView: React.FC = () => {
  const {
    settings,
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
      label: 'My',
      speechText: 'My',
      emoji: '🤲',
      symbolId: 'personal_passport',
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
      label: 'More',
      speechText: 'More',
      emoji: '➕',
      symbolId: 'more',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'adjective' as const,
      category: 'core' as const,
    },
  ];

  const handleTactileTileClick = (tile: typeof TACTILE_AAC_TILES[0]) => {
    const label = t(tile.label);
    const speech = t(tile.speechText) !== tile.speechText ? t(tile.speechText) : label;
    playChime('tap');
    addToSentence({
      id: tile.id,
      label,
      speechText: speech,
      emoji: tile.emoji,
      symbolId: tile.symbolId,
      category: tile.category,
      colorType: tile.colorType,
      motorIndex: 0,
    });
    // Only speak here if autoSpeakSentence is disabled, avoiding double speech
    if (!settings.autoSpeakSentence) {
      speak(speech);
    }
  };

  const isWidgetEnabled = (id: string) => {
    return dashboardWidgets?.some((w) => w.id === id && w.enabled) ?? false;
  };

  const enabledWidgets = dashboardWidgets.filter(
    (w) => w.enabled && isWidgetAvailable(w.id, enabledFeatures)
  );

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-7xl mx-auto w-full px-2 sm:px-4 py-2 space-y-4 select-none">
      
      {/* ── TOP PROMINENT HEADER & DASHBOARD CONTROL BAR ── */}
      <div className="bg-[#FCF9F2] border-2 border-[#E0D8CB] rounded-3xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Friendly Greeting & Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div 
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className="w-11 h-11 rounded-2xl bg-[#F5EFE6] border-2 border-[#E0D8CB] text-2xl flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
            title="About Me ID Card"
          >
            🐝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#2D241E] leading-tight">
                {t('Hi')}, {childProfile.name}!
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#EFE9DF] text-[#6B5E52] border border-[#E0D8CB] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F5B865]" />
                {worldState.stars} {t('Coins')}
              </span>
            </div>
            <p className="text-xs text-[#7A6C60] font-semibold">
              {t('You can be yourself here')} • {t("Today's Dashboard")}
            </p>
          </div>
        </div>

        {/* Right: PROMINENT EDIT DASHBOARD & QUICK ACTION BUTTONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* 🌟 PROMINENT CUSTOMIZE DASHBOARD BUTTON */}
          <button
            onClick={() => {
              setShowDashboardCustomizer(true);
              playChime('tap');
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] border-2 border-[#E2A44E] font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_3px_10px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all shrink-0"
            title="Customize and reorder dashboard widgets"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#4A2F0F]" />
            <span>{t('Customize Dashboard')} ✏️</span>
          </button>

          {/* Quick Tools Hub Button */}
          <button
            onClick={() => {
              setShowToolsHubModal(true);
              playChime('tap');
            }}
            className="p-2.5 rounded-2xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] border-2 border-[#E0D8CB] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer shrink-0"
            title="Open Tools Hub"
          >
            <span className="text-base">🧰</span>
          </button>

          {/* Morning Brief (if enabled) */}
          {enabledFeatures?.morningBrief !== false && (
            <button
              onClick={() => {
                setShowMorningBrief(true);
                playChime('tap');
              }}
              className="p-2.5 rounded-2xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] border-2 border-[#E0D8CB] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer shrink-0"
              title="Open Morning Brief"
            >
              <Sun className="w-4 h-4 text-[#E2A44E]" />
            </button>
          )}

          {/* Caregiver Alert / Connect */}
          <button
            onClick={() => {
              setShowCaregiverModal(true);
              playChime('tap');
            }}
            className="p-2.5 rounded-2xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] border-2 border-[#E0D8CB] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer shrink-0"
            title="Caregiver Pairing & Connect"
          >
            <Heart className="w-4 h-4 text-[#D57B7B]" />
          </button>
        </div>
      </div>

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

      {/* 2. MAIN WORKSPACE: 2-Column with Silicone AAC Tray OR Full-Width Bento Grid */}
      {(() => {
        const isAacActive = enabledFeatures?.aacCommunication !== false && isWidgetEnabled('quick_aac');

        const renderWidgetCard = (widget: (typeof enabledWidgets)[0], isFullWidth = false) => {
          switch (widget.id) {
            case 'mascot_companion':
              return (
                <div 
                  key={widget.id}
                  className={`p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 ${
                    isFullWidth ? 'col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div 
                      onClick={() => {
                        setShowAboutMeModal(true);
                        playChime('tap');
                      }}
                      className="w-12 h-12 rounded-2xl bg-[#F5EFE6] text-[#4A2F0F] border-2 border-[#E0D8CB] font-black text-xl flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                      title="About Me ID Card"
                    >
                      🐝
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#2D241E] tracking-tight leading-none">
                        {t('Hi')}, {childProfile.name}! 🐝
                      </h2>
                      <p className="text-xs text-[#7A6C60] font-bold mt-1">
                        {t('You can be yourself here')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDashboardCustomizer(true);
                      playChime('tap');
                    }}
                    className="p-2.5 rounded-2xl bg-[#F5EFE6] hover:bg-white text-[#4A2F0F] transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-[#E0D8CB] shrink-0 active:scale-95"
                    title="Edit & customize dashboard layout"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              );

            case 'quick_aac':
              return !isAacActive ? (
                <div key={widget.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 col-span-1">
                  <button
                    onClick={() => {
                      setChildView('aac');
                      playChime('tap');
                    }}
                    className="py-3.5 px-3 rounded-[24px] bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-[#E2A44E]"
                  >
                    <span>💬</span>
                    <span>{t('Talk')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCopingToolkit(true);
                      playChime('tap');
                    }}
                    className="py-3.5 px-3 rounded-[24px] bg-[#99C2A2] hover:bg-[#85AE8E] text-[#1C3E25] font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(153,194,162,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-[#85AE8E]"
                  >
                    <span>🛋️</span>
                    <span>{t('Calm down')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCaregiverAlertModal(true);
                      playChime('tap');
                    }}
                    className="py-3.5 px-3 rounded-[24px] bg-[#E68E8E] hover:bg-[#D57B7B] text-[#4A1616] font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(230,142,142,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-[#D57B7B]"
                  >
                    <span>🆘</span>
                    <span>{t('I need help')}</span>
                  </button>
                </div>
              ) : null;

            case 'routine_schedule':
              return currentRoutine ? (
                <div 
                  key={widget.id} 
                  className={`p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] space-y-3 ${
                    isFullWidth ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#8C7E72]">
                      {t("Today's Schedule")} • {t(currentRoutine.title)}
                    </span>
                    <button
                      onClick={() => setChildView('my-day')}
                      className="text-xs font-black text-[#4A2F0F] hover:text-[#2D241E] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('Open Schedule')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-2xl bg-[#F5EFE6] border border-[#E0D8CB] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">🪥</span>
                        <span className="font-black text-xs sm:text-sm text-[#2D241E] truncate">
                          {currentRoutine.firstThen?.first ? `${t('First')}: ${t(currentRoutine.firstThen.first)}` : `${t('First')}: ${t('Brush teeth')}`}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-[#C4E7D4] text-[#1C3E25] font-black text-xs flex items-center justify-center shrink-0 border border-[#99C2A2]">
                        ✓
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F5EFE6] border border-[#E0D8CB] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">📱</span>
                        <span className="font-black text-xs sm:text-sm text-[#2D241E] truncate">
                          {currentRoutine.firstThen?.then ? `${t('Then')}: ${t(currentRoutine.firstThen.then)}` : `${t('Then')}: ${t('Tablet time (15 min)')}`}
                        </span>
                      </div>
                      <span className="w-6 h-6 rounded-full bg-[#EAE2D5] text-[#8C7E72] font-black text-xs flex items-center justify-center shrink-0 border border-[#D8CEBA]">
                        ○
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;

            case 'pie_timer':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowPieTimerModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FDE293] hover:bg-[#FCD876] border-2 border-[#E2A44E] text-[#4A2F0F] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(253,226,147,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#FCF9F2] rounded-2xl border border-[#E2A44E] shrink-0">⏰</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Visual Pie Clock')}</div>
                      <div className="text-[11px] font-semibold text-[#8B571A]">{t('Time Timer analog visual countdown disk')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8B571A] shrink-0" />
                </button>
              );

            case 'five_point_scale':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowFivePointModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#C4E7D4] hover:bg-[#B2DEC5] border-2 border-[#85AE8E] text-[#1C3E25] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(196,231,212,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#FCF9F2] rounded-2xl border border-[#85AE8E] shrink-0">🌡️</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('5-Point Emotional Scale')}</div>
                      <div className="text-[11px] font-semibold text-[#2C5A37]">{t('Thermometer & calming regulation tools')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#2C5A37] shrink-0" />
                </button>
              );

            case 'fidget_toys':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowFidgetModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#F6C0C0] hover:bg-[#EEADAD] border-2 border-[#D57B7B] text-[#4A1616] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(246,192,192,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#FCF9F2] rounded-2xl border border-[#D57B7B] shrink-0">🫧</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Fidget Corner & Stimming')}</div>
                      <div className="text-[11px] font-semibold text-[#8B3434]">{t('Bubble pop, sand ripple & marble')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8B3434] shrink-0" />
                </button>
              );

            case 'decision_wheel':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowDecisionWheelModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#D7D4F0] hover:bg-[#CBC8E8] border-2 border-[#B8B4DC] text-[#2C2954] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(215,212,240,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#FCF9F2] rounded-2xl border border-[#B8B4DC] shrink-0">🎡</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Decision Wheel')}</div>
                      <div className="text-[11px] font-semibold text-[#51488C]">{t('Spin to break choice paralysis')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#51488C] shrink-0" />
                </button>
              );

            case 'medication_tracker':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowMedicationModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">💊</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Medication Reminders')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">{medications.length} {t('active prescriptions')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              );

            case 'spoon_budget':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowSpoonModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">🥄</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Spoon Energy Budget')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">
                        {todaySpoonEntry ? `${todaySpoonEntry.totalSpoons - todaySpoonEntry.usedSpoons} ${t('spoons left today')}` : t('Track energy & prevent burnout')}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              );

            case 'mood_journal':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowMoodJournalModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">📖</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Mood Journal & Triggers')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">{moodJournalEntries.length} {t('reflections recorded')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              );

            case 'cycle_tracker':
              return isTeenOrAdult ? (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowCycleTrackerModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">💗</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Cycle & Rhythm Tracker')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">
                        {cycleSettings.discreetMode ? t('Body rhythm tracking') : `${t('Day')} ${cyclePhaseInfo?.currentCycleDay || 1}`}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              ) : null;

            case 'communication_passport':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowPassportModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">🪪</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Communication Passport')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">{t('1-page summary for teachers & dentists')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              );

            case 'adventure_spotlight':
              return todaysAdventure ? (
                <div
                  key={widget.id}
                  onClick={() => setChildView('adventures')}
                  className="p-4 rounded-3xl bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] flex items-center justify-between gap-3 cursor-pointer active:scale-98 transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-[#F5EFE6] border border-[#E0D8CB] rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      {todaysAdventure.emoji}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#A76318] bg-[#FDE293] border border-[#E2A44E] px-2 py-0.5 rounded-lg">
                        {t('Life Adventure Prep')}
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-[#2D241E] mt-0.5">
                        {t(todaysAdventure.title)}
                      </h4>
                      <p className="text-xs text-[#7A6C60] font-semibold">
                        {t('Walkthrough, sensory guide & confidence tips.')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8C7E72] shrink-0" />
                </div>
              ) : null;

            case 'evening_reflection':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowRecollectionModal(true);
                    playChime('tap');
                  }}
                  className="w-full p-3.5 sm:p-4 rounded-[26px] bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-[#2D241E] font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.03),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:scale-95 cursor-pointer transition-all col-span-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shrink-0">🌙</span>
                    <div className="text-left">
                      <div className="leading-tight font-black text-sm">{t('Evening Reflection & Journal')}</div>
                      <div className="text-[11px] font-semibold text-[#7A6C60]">{t('Reflect on your day & celebrate wins')}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8C7E72] shrink-0" />
                </button>
              );

            default:
              return null;
          }
        };

        if (isAacActive) {
          // ── 2-COLUMN VIEW WITH TACTILE AAC BOARD ──
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column (60% on Desktop/Tablet): Tactile Silicone AAC Board */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                      {t('AAC Sensory Board • Tap to Speak')}
                    </span>
                  </div>
                  <button
                    onClick={() => setChildView('aac')}
                    className="text-xs font-black text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-stone-200/60 hover:bg-stone-200 px-3 py-1 rounded-xl transition-all"
                  >
                    <span>{t('Full Vocabulary Board')}</span>
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
                          <div className="flex-1 w-full flex items-center justify-center p-1 group-hover:scale-105 transition-transform relative">
                            <img
                              src={resolveAacImageUrl(tile)}
                              alt=""
                              className="w-full h-full object-contain max-h-16 sm:max-h-20 pointer-events-none drop-shadow-2xs"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <span className="hidden text-3xl sm:text-4xl items-center justify-center select-none">
                              {tile.emoji}
                            </span>
                          </div>
                          <span className="font-extrabold text-xs sm:text-sm text-stone-800 tracking-tight text-center leading-tight">
                            {t(tile.label)}
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
                    <span>{t('Instant Voice Output is active. Tap any tile above to speak aloud.')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column (40% on Desktop/Tablet): Dynamic Customizable Bento Column */}
              <div className="lg:col-span-5 flex flex-col space-y-3.5">
                {enabledWidgets.filter((w) => w.id !== 'quick_aac').map((w) => renderWidgetCard(w, false))}

                <button
                  onClick={() => {
                    setShowDashboardCustomizer(true);
                    playChime('tap');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#EFE9DF] hover:bg-[#E5DFD4] text-[#6B5E52] hover:text-[#2D241E] border-2 border-dashed border-[#D8CEBA] font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 mt-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>＋ {t('Customize / Reorder Dashboard Widgets')}</span>
                </button>
              </div>
            </div>
          );
        }

        // ── FULL-WIDTH BENTO GRID (AAC Disabled / Removed) ──
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              {enabledWidgets.map((w) => renderWidgetCard(w, true))}
            </div>

            <button
              onClick={() => {
                setShowDashboardCustomizer(true);
                playChime('tap');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#EFE9DF] hover:bg-[#E5DFD4] text-[#6B5E52] hover:text-[#2D241E] border-2 border-dashed border-[#D8CEBA] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>＋ Customize / Reorder Dashboard Widgets</span>
            </button>
          </div>
        );
      })()}

    </div>
  );
};
