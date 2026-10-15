import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Calendar, 
  Compass, 
  CheckCircle2, 
  Smile, 
  Home, 
  Star, 
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
import {
  FidgetBubblesSticker,
  CountdownTimerSticker,
  ToothbrushSticker,
  ReadingBookSticker,
  SpoonSticker,
  MedicationSticker,
  IdCardSticker,
  ThermometerSticker,
  DecisionWheelSticker,
  MoodJournalSticker,
  BeeMascotSticker,
  QuickPhrasesSticker,
  FavQuietBreakSticker,
  FavHelpSosSticker,
  PlansChangeStorySticker,
  RoutineStickerIcon,
  OutdoorSunSticker,
} from './icons/JournalStickers';
import { getCurrentTimeRoutine } from '../utils/routineTimeHelper';
import { CaregiverLockShield } from './CaregiverLockShield';
import { getPersonaLabel, getPersonaTokens } from '../utils/personaHelpers';
import { t } from '../services/translator';
import { AccessibleTile } from './common/AccessibleTile';
import { getGrammaticalCategoryLabel } from './AACView';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';

export const ChildHomeView: React.FC = () => {
  const {
    settings,
    childProfile,
    setChildView,
    plansChanged,
    setShowPlansChangedModal,
    showMorningBrief,
    setShowMorningBrief,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    routines,
    adventures,
    quickPhrases,
    speak,
    setShowCopingToolkit,
    activeTheme,
    setShowThemeModal,
    enabledFeatures,
    userAgeGroup,
    userPersona,
    setShowAboutMeModal,
    medications,
    takeMedicationDose,
    setShowMedicationModal,
    moodJournalEntries,
    setShowMoodJournalModal,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPassportModal,
    setShowSpoonModal,
    setShowPieTimerModal,
    setShowDecisionWheelModal,
    setShowFidgetModal,
    getTodaySpoonEntry,
    dashboardWidgets,
    setShowDashboardCustomizer,
    updateRoutine,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const latestMoodEntry = moodJournalEntries[0];
  const todaySpoonEntry = getTodaySpoonEntry();

  const currentRoutine = getCurrentTimeRoutine(routines) || routines[0];
  const nextStep = currentRoutine?.steps.find((s) => !s.completed);
  const todaysAdventure = adventures[0];

  // 9 Core Tactile AAC Communication Phrases for the Home Board
  const TACTILE_AAC_TILES = [
    {
      id: 'tactile-food',
      label: 'I want food',
      speechText: 'I want food to eat',
      emoji: '🍕',
      symbolId: 'food',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'food' as const,
    },
    {
      id: 'tactile-drinks',
      label: 'I want a drink',
      speechText: 'I want something to drink',
      emoji: '🧃',
      symbolId: 'drink',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'drinks' as const,
    },
    {
      id: 'tactile-play',
      label: 'I want to play',
      speechText: 'I want to play and have fun',
      emoji: '🎮',
      symbolId: 'play_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'activities' as const,
    },
    {
      id: 'tactile-places',
      label: 'Go somewhere',
      speechText: 'I want to go somewhere',
      emoji: '🏠',
      symbolId: 'house',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'places' as const,
    },
    {
      id: 'tactile-feelings',
      label: 'How I feel',
      speechText: 'I want to share my feelings',
      emoji: '💛',
      symbolId: 'happy_man',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'noun' as const,
      category: 'feelings' as const,
    },
    {
      id: 'tactile-break',
      label: 'I need a break',
      speechText: 'I need a break please',
      emoji: '🛋️',
      symbolId: 'break_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'subject' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-want',
      label: 'I want this',
      speechText: 'I want this please',
      emoji: '🤲',
      symbolId: 'want_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'verb' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-help',
      label: 'I need help',
      speechText: 'Please help me',
      emoji: '🛟',
      symbolId: 'help_,_to',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'emergency' as const,
      category: 'core' as const,
    },
    {
      id: 'tactile-stop',
      label: 'Please stop',
      speechText: 'Please stop',
      emoji: '🛑',
      symbolId: 'backstop',
      bgTone: 'bg-[#FCF9F2]',
      colorType: 'adjective' as const,
      category: 'core' as const,
    },
  ];

  const [lastSpokenPhrase, setLastSpokenPhrase] = useState<string | null>(null);

  const handleTactileTileClick = (tile: typeof TACTILE_AAC_TILES[0]) => {
    const speech = t(tile.speechText || tile.label);
    setLastSpokenPhrase(speech);
    playChime('tap');
    // Immediately speak the communicative phrase aloud on the spot with force override
    speak(speech, { force: true });
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
      <div className={`${themeStyles.headerBar} rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3`}>
        {/* Left: Friendly Greeting & Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            aria-label="Open About Me ID card"
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className={`w-12 h-12 rounded-2xl ${themeStyles.headerButton} flex items-center justify-center p-1.5 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none`}
            title="About Me ID Card"
          >
            <IdCardSticker className="w-full h-full object-contain" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-black ${themeStyles.headerText} leading-tight`}>
                {t('Hi')}, {childProfile.name}!
              </h2>
            </div>
            <p className={`text-xs ${themeStyles.headerSubtext} font-semibold`}>
              {getPersonaLabel(userPersona, 'dashboardGreetingSubtitle')}
            </p>
          </div>
        </div>

        {/* Right: PROMINENT EDIT DASHBOARD & QUICK ACTION BUTTONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* 🌟 PROMINENT CUSTOMIZE DASHBOARD BUTTON (Admin Clutter Shield Protected) */}
          <CaregiverLockShield
            title="Dashboard Customization"
            onUnlocked={() => {
              setShowDashboardCustomizer(true);
            }}
          >
            <button
              type="button"
              aria-label="Customize and reorder dashboard widgets"
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500/80 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer transition-all shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
              title="Customize and reorder dashboard widgets (Protected)"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-950" aria-hidden="true" />
              <span>{t('Customize Dashboard')}</span>
            </button>
          </CaregiverLockShield>

          {/* Quick Tools Tab Button */}
          <button
            type="button"
            aria-label="Open Sensory Tools"
            onClick={() => {
              setChildView('tools');
              playChime('tap');
            }}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl ${themeStyles.headerButton} shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none`}
            title="Open Sensory Tools"
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Morning Brief (if enabled) */}
          {enabledFeatures?.morningBrief !== false && (
            <button
              type="button"
              aria-label="Open Morning Brief"
              onClick={() => {
                setShowMorningBrief(true);
                playChime('tap');
              }}
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl ${themeStyles.headerButton} shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none`}
              title="Open Morning Brief"
            >
              <OutdoorSunSticker size={20} className="w-5 h-5 drop-shadow-2xs" />
            </button>
          )}

          {/* Themes & Visual Customizer */}
          <button
            type="button"
            aria-label="Open Themes & Visual Style"
            onClick={() => {
              setShowThemeModal(true);
              playChime('tap');
            }}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl ${themeStyles.headerButton} shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none`}
            title="Themes & Visual Customizer"
          >
            <Palette className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </button>

          {/* Caregiver Alert / Connect */}
          <button
            type="button"
            aria-label="Caregiver Pairing and Connect"
            onClick={() => {
              setShowCaregiverModal(true);
              playChime('tap');
            }}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl ${themeStyles.headerButton} shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none`}
            title="Caregiver Pairing & Connect"
          >
            <Heart className="w-4 h-4 text-rose-500" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 1. PLANS CHANGED BANNER (If Active) */}
      {plansChanged.active && (
        <button
          type="button"
          aria-label={`Plans changed. New Plan: ${t(plansChanged.newPlanTitle)}. Tap to see calm plan.`}
          onClick={() => setShowPlansChangedModal(true)}
          className="w-full text-left bg-amber-100/95 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98 animate-in fade-in focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
        >
          <div className="flex items-center gap-3">
            <PlansChangeStorySticker size={42} className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider">
                  {t('Plans Changed')}
                </span>
                <span className="text-xs font-bold text-amber-900">{t('Tap to see calm plan')}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                {t('New Plan')}: {t(plansChanged.newPlanTitle)}
              </h2>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-700 shrink-0" aria-hidden="true" />
        </button>
      )}

      {/* 2. MAIN WORKSPACE: 2-Column with Silicone AAC Tray OR Full-Width Bento Grid */}
      {(() => {
        const isAacActive = enabledFeatures?.aacCommunication !== false && isWidgetEnabled('quick_aac');

        const renderWidgetCard = (widget: (typeof enabledWidgets)[0], isFullWidth = false) => {
          switch (widget.id) {
            case 'mascot_companion': {
              const displayName = childProfile.name?.trim() ? childProfile.name.trim() : null;
              return (
                <div 
                  key={widget.id}
                  className={`${themeStyles.mascotBanner} flex items-center justify-between gap-3 transition-all ${
                    isFullWidth ? 'col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className={themeStyles.mascotBadge}
                      aria-hidden="true"
                    >
                      {activeTheme?.mascotEmoji || '🐝'}
                    </div>
                    <div className="min-w-0">
                      <h2 className={`text-xl sm:text-2xl font-black ${themeStyles.headerText} tracking-tight leading-none truncate`}>
                        {displayName ? `${t('Hi')}, ${displayName}!` : `${t('Welcome to BeeYou')}!`} {activeTheme?.mascotEmoji || '🐝'}
                      </h2>
                      <p className={`text-xs ${themeStyles.headerSubtext} font-semibold mt-1 truncate`}>
                        {activeTheme?.greetingMessage ? t(activeTheme.greetingMessage) : t("Let's have a calm, wonderful day!")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Edit and customize dashboard layout"
                    onClick={() => {
                      setShowDashboardCustomizer(true);
                      playChime('tap');
                    }}
                    className={themeStyles.mascotButton}
                    title="Edit & customize dashboard layout"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            case 'quick_aac':
              return !isAacActive ? (
                <div key={widget.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 col-span-1">
                  <button
                    onClick={() => {
                      setChildView('aac');
                      playChime('tap');
                    }}
                    className={themeStyles.quickAacTalk}
                  >
                    <QuickPhrasesSticker size={24} className="w-6 h-6 shrink-0 drop-shadow-xs" />
                    <span>{t('Talk')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCopingToolkit(true);
                      playChime('tap');
                    }}
                    className={themeStyles.quickAacCalm}
                  >
                    <FavQuietBreakSticker size={24} className="w-6 h-6 shrink-0 drop-shadow-xs" />
                    <span>{t('Calm down')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCaregiverAlertModal(true);
                      playChime('tap');
                    }}
                    className={themeStyles.quickAacHelp}
                  >
                    <FavHelpSosSticker size={24} className="w-6 h-6 shrink-0 drop-shadow-xs" />
                    <span>{t('I need help')}</span>
                  </button>
                </div>
              ) : null;

            case 'routine_schedule':
              return currentRoutine ? (
                <div 
                  key={widget.id} 
                  className={`${themeStyles.scheduleContainer} space-y-3 ${
                    isFullWidth ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={themeStyles.scheduleHeader}>
                      {t("Today's Schedule")} • {t(currentRoutine.title)}
                    </span>
                    <button
                      onClick={() => setChildView('my-day')}
                      className={themeStyles.scheduleLink}
                    >
                      <span>{t('Open Schedule')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentRoutine.firstThen) {
                          const updated = {
                            ...currentRoutine,
                            firstThen: {
                              ...currentRoutine.firstThen,
                              completedFirst: !currentRoutine.firstThen.completedFirst,
                            },
                          };
                          updateRoutine(updated);
                          playChime(updated.firstThen.completedFirst ? 'star' : 'tap');
                        }
                      }}
                      className={themeStyles.firstStep}
                    >
                      <div className="min-w-0 flex-1">
                        <span className={`font-bold text-xs sm:text-sm truncate block ${themeStyles.headerText} ${currentRoutine.firstThen?.completedFirst ? 'line-through opacity-70' : ''}`}>
                          {currentRoutine.firstThen?.first ? `${t('First')}: ${t(currentRoutine.firstThen.first)}` : `${t('First')}: ${t(currentRoutine.steps[0]?.title || 'Start routine')}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={themeStyles.stepIconBox}>
                          <RoutineStickerIcon emoji={currentRoutine.firstThen?.firstEmoji || currentRoutine.steps[0]?.emoji} title={currentRoutine.firstThen?.first || currentRoutine.steps[0]?.title} size={20} className="w-full h-full object-contain" />
                        </div>
                        <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                          currentRoutine.firstThen?.completedFirst
                            ? themeStyles.stepCheckActive
                            : themeStyles.stepCheckInactive
                        }`}>
                          {currentRoutine.firstThen?.completedFirst ? '✓' : '○'}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentRoutine.firstThen) {
                          const updated = {
                            ...currentRoutine,
                            firstThen: {
                              ...currentRoutine.firstThen,
                              completedThen: !currentRoutine.firstThen.completedThen,
                            },
                          };
                          updateRoutine(updated);
                          playChime(updated.firstThen.completedThen ? 'star' : 'tap');
                        }
                      }}
                      className={themeStyles.thenStep}
                    >
                      <div className="min-w-0 flex-1">
                        <span className={`font-bold text-xs sm:text-sm truncate block ${themeStyles.headerText} ${currentRoutine.firstThen?.completedThen ? 'line-through opacity-70' : ''}`}>
                          {currentRoutine.firstThen?.then ? `${t('Then')}: ${t(currentRoutine.firstThen.then)}` : `${t('Then')}: ${t(currentRoutine.steps[1]?.title || 'Next step')}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={themeStyles.stepIconBox}>
                          <RoutineStickerIcon emoji={currentRoutine.firstThen?.thenEmoji || currentRoutine.steps[1]?.emoji} title={currentRoutine.firstThen?.then || currentRoutine.steps[1]?.title} size={20} className="w-full h-full object-contain" />
                        </div>
                        <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                          currentRoutine.firstThen?.completedThen
                            ? themeStyles.stepCheckActive
                            : themeStyles.stepCheckInactive
                        }`}>
                          {currentRoutine.firstThen?.completedThen ? '✓' : '○'}
                        </span>
                      </div>
                    </button>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Visual Pie Clock')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {t('Time Timer analog visual countdown disk')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <CountdownTimerSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('5-Point Emotional Scale')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {t('Thermometer & calming regulation tools')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <ThermometerSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Fidget Corner & Stimming')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {t('Bubble pop, sand ripple & marble')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <FidgetBubblesSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Decision Wheel')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {t('Spin to break choice paralysis')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <DecisionWheelSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Medication Reminders')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {medications.length} {t('active prescriptions')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <MedicationSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Spoon Energy Budget')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {todaySpoonEntry ? `${todaySpoonEntry.totalSpoons - todaySpoonEntry.usedSpoons} ${t('spoons left today')}` : t('Track energy & prevent burnout')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <SpoonSticker className="w-full h-full object-contain" />
                  </div>
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
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Mood Journal & Triggers')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {moodJournalEntries.length} {t('reflections recorded')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <MoodJournalSticker className="w-full h-full object-contain" />
                  </div>
                </button>
              );

            case 'communication_passport':
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setShowPassportModal(true);
                    playChime('tap');
                  }}
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t('Communication Passport')}
                    </div>
                    <div className={`text-xs ${themeStyles.headerSubtext} font-medium leading-snug mt-0.5 truncate`}>
                      {t('1-page summary for teachers & dentists')}
                    </div>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                    <IdCardSticker className="w-full h-full object-contain" />
                  </div>
                </button>
              );

            case 'adventure_spotlight':
              return todaysAdventure ? (
                <button
                  type="button"
                  key={widget.id}
                  aria-label={`Life adventure prep: ${t(todaysAdventure.title)}`}
                  onClick={() => setChildView('adventures')}
                  className={themeStyles.card}
                >
                  <div className="min-w-0 flex-1">
                    <span className={themeStyles.adventureTag}>
                      {t('Life Adventure Prep')}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base leading-snug truncate">
                      {t(todaysAdventure.title)}
                    </h4>
                    <p className={`text-xs ${themeStyles.headerSubtext} font-medium truncate mt-0.5`}>
                      {t('Walkthrough, sensory guide & confidence tips.')}
                    </p>
                  </div>
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform p-1">
                    {todaysAdventure.stickerSrc ? (
                      <img src={todaysAdventure.stickerSrc} alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                    ) : (
                      <span aria-hidden="true" className="text-2xl">{todaysAdventure.emoji}</span>
                    )}
                  </div>
                </button>
              ) : null;

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
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900/80">
                      {t('AAC Sensory Board • Tap to Speak')}
                    </span>
                  </div>
                  <button
                    onClick={() => setChildView('aac')}
                    className={`text-xs font-black flex items-center gap-1 cursor-pointer px-3 py-1 rounded-xl transition-all ${themeStyles.headerButton}`}
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
                        <AccessibleTile
                          variant="aac"
                          label={t(tile.label)}
                          speechText={t(tile.speechText || tile.label)}
                          category={getGrammaticalCategoryLabel(tile.colorType)}
                          onClick={() => handleTactileTileClick(tile)}
                          className="w-full h-full rounded-[22px] bg-[#FCF9F2] hover:bg-white text-stone-900 flex flex-col items-center justify-between p-2.5 sm:p-3 transition-all cursor-pointer shadow-[0_5px_12px_rgba(0,0,0,0.06),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.18)] active:scale-95 border border-[#EBE3D5] group"
                          title={t(tile.speechText || tile.label)}
                        >
                          <div className="flex-1 w-full flex items-center justify-center p-1 group-hover:scale-105 transition-transform relative pointer-events-none">
                            <img
                              src={resolveAacImageUrl(tile)}
                              alt=""
                              aria-hidden="true"
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
                            <span aria-hidden="true" className="hidden text-3xl sm:text-4xl items-center justify-center select-none pointer-events-none">
                              {tile.emoji}
                            </span>
                          </div>
                          <span className="font-extrabold text-xs sm:text-sm text-stone-800 tracking-tight text-center leading-tight">
                            {t(tile.label)}
                          </span>
                          <span aria-hidden="true" className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/5 text-stone-600 mt-0.5">
                            {getGrammaticalCategoryLabel(tile.colorType)}
                          </span>
                        </AccessibleTile>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Speak Feedback Strip */}
                <div className={themeStyles.feedbackStrip}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Zap className="w-4 h-4 shrink-0 opacity-80" />
                    {lastSpokenPhrase ? (
                      <span className="font-extrabold flex items-center gap-1.5 truncate">
                        <span className="opacity-70 font-semibold">{t('Spoke')}:</span> &ldquo;{lastSpokenPhrase}&rdquo;
                      </span>
                    ) : (
                      <span>{t('Instant Voice Output is active. Tap any tile above to speak aloud.')}</span>
                    )}
                  </div>
                  {lastSpokenPhrase && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('tap');
                        speak(lastSpokenPhrase, { force: true });
                      }}
                      className={`text-[11px] font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer shrink-0 ml-2 ${themeStyles.headerButton}`}
                      title={t('Repeat phrase')}
                    >
                      🔁 {t('Repeat')}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column (40% on Desktop/Tablet): Dynamic Customizable Bento Column */}
              <div className="lg:col-span-5 flex flex-col space-y-3.5">
                {enabledWidgets.filter((w) => w.id !== 'quick_aac').map((w) => renderWidgetCard(w, false))}

                <CaregiverLockShield
                  title="Dashboard Customization"
                  onUnlocked={() => setShowDashboardCustomizer(true)}
                  className="w-full"
                >
                  <button
                    type="button"
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs mt-1 ${themeStyles.dashedButton}`}
                  >
                    <SlidersHorizontal className={themeStyles.dashedIcon} />
                    <span>＋ {t('Customize / Reorder Dashboard Widgets')}</span>
                  </button>
                </CaregiverLockShield>
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

            <CaregiverLockShield
              title="Dashboard Customization"
              onUnlocked={() => setShowDashboardCustomizer(true)}
              className="w-full"
            >
              <button
                type="button"
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs ${themeStyles.dashedButton}`}
              >
                <SlidersHorizontal className={themeStyles.dashedIcon} />
                <span>＋ {t('Customize / Reorder Dashboard Widgets')}</span>
              </button>
            </CaregiverLockShield>
          </div>
        );
      })()}

    </div>
  );
};
