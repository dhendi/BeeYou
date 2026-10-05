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
  LayoutGrid
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { MOOD_META } from '../data/defaultData';
import { DashboardWidgetId } from '../types';
import { isWidgetAvailable } from '../data/navigation';

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
    getTodaySpoonEntry,
    dashboardWidgets,
    setShowDashboardCustomizer,
  } = useApp();

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const cyclePhaseInfo = isTeenOrAdult ? getCyclePhaseInfo() : null;
  const latestMoodEntry = moodJournalEntries[0];
  const todaySpoonEntry = getTodaySpoonEntry();

  const currentRoutine = routines[0];
  const nextStep = currentRoutine?.steps.find((s) => !s.completed);
  const todaysAdventure = adventures[0];

  // ── Modular Widget Renderers ──

  const renderMascotCompanion = () => (
    <div 
      key="mascot_companion"
      onClick={() => {
        setShowThemeModal(true);
        playChime('star');
      }}
      className="rounded-3xl p-4 sm:p-5 border border-slate-200/90 bg-white hover:bg-slate-50/80 shadow-2xs transition-all hover:shadow-xs cursor-pointer active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">
          {activeTheme.mascotEmoji}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/60">
              {activeTheme.name}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {activeTheme.mascotName}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
            "{activeTheme.greetingMessage}"
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowThemeModal(true);
          playChime('tap');
        }}
        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs shrink-0 cursor-pointer hidden sm:flex items-center gap-1"
      >
        <span>🎨 Themes</span>
      </button>
    </div>
  );

  const renderRoutineSchedule = () => {
    if (!currentRoutine) return null;
    return (
      <div key="routine_schedule" className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentRoutine.emoji}</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Today's Schedule
              </span>
              <h3 className="font-bold text-slate-800 text-base">
                {currentRoutine.title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setChildView('my-day')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* First / Then quick strip */}
        {currentRoutine.firstThen && (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <span className="text-xl shrink-0">{currentRoutine.firstThen.firstEmoji}</span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">First</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {currentRoutine.firstThen.first}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <span className="text-xl shrink-0">{currentRoutine.firstThen.thenEmoji}</span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Then</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {currentRoutine.firstThen.then}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Up Next Step */}
        {nextStep && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{nextStep.emoji}</span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Up Next</span>
                <span className="text-xs font-bold text-slate-900 truncate block">{nextStep.title}</span>
              </div>
            </div>
            <button
              onClick={() => setChildView('my-day')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs active:scale-95"
            >
              Start Step
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFivePointScale = () => (
    <div
      key="five_point_scale"
      onClick={() => {
        setShowFivePointModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🌡️</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Regulation Tool
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Incredible 5-Point Scale
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Where are you right now? 1 (Relaxed) to 5 (Meltdown). Tap to check in.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderSpoonBudget = () => (
    <div
      key="spoon_budget"
      onClick={() => {
        setShowSpoonModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🥄</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Energy & Fatigue Pacing
            </span>
            {todaySpoonEntry && (
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                {todaySpoonEntry.totalSpoons - todaySpoonEntry.usedSpoons} Spoons Left
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Spoon Theory Energy Budget
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Track daily stamina, plan activities, and prevent burnout.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderPieTimer = () => (
    <div
      key="pie_timer"
      onClick={() => {
        setShowPieTimerModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">⏰</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Time Awareness
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Visual Pie Clock (Time Timer)
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Analog visual disk that shows time physically disappearing.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderDecisionWheel = () => (
    <div
      key="decision_wheel"
      onClick={() => {
        setShowDecisionWheelModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🎡</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Choice Helper
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Decision Wheel Spinner
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Stuck in choice paralysis? Spin the wheel to decide snacks, activities or breaks.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderFidgetToys = () => (
    <div
      key="fidget_toys"
      onClick={() => {
        setShowFidgetModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🫧</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Discreet Stimming
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Digital Fidget Corner
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Silent sensory regulation: silicone bubble pops, calming water sand ripples & marble maze.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderMedicationTracker = () => {
    if (enabledFeatures?.medicationReminders === false || medications.length === 0) return null;
    const pending = medications.filter(
      (m) => m.active && m.frequency !== 'as_needed' && m.times.some((t) => !m.takenTimesToday.includes(t))
    );

    return (
      <div
        key="medication_tracker"
        onClick={() => {
          setShowMedicationModal(true);
          playChime('tap');
        }}
        className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3 cursor-pointer hover:border-slate-300 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-1.5 bg-slate-100 rounded-xl border border-slate-200/60">💊</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Health & Medications
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {pending.length > 0 ? `${pending.length} Doses Due Today` : 'All Meds Taken! ✨'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMedicationModal(true);
              playChime('tap');
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Manage Meds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pending.length > 0 && (
          <div className="space-y-1.5">
            {pending.slice(0, 2).map((med) => (
              <div key={med.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900">{med.name} ({med.dosage})</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextDue = med.times.find((t) => !med.takenTimesToday.includes(t)) || 'Now';
                    takeMedicationDose(med.id, nextDue);
                    playChime('complete');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-bold text-[11px] shadow-2xs cursor-pointer active:scale-95"
                >
                  Take Dose ✓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMoodJournal = () => {
    if (!isTeenOrAdult || enabledFeatures?.moodJournal === false) return null;
    return (
      <div
        key="mood_journal"
        onClick={() => {
          setShowMoodJournalModal(true);
          playChime('tap');
        }}
        className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">📖</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Self-Reflection & Triggers
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
              Deep Mood Journal
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {latestMoodEntry ? `Latest: ${latestMoodEntry.moodIntensity}/10 - "${latestMoodEntry.journalText || 'Logged'}"` : 'Reflect on sensory overload, energy and triggers.'}
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    );
  };

  const renderCycleTracker = () => {
    if (!isTeenOrAdult || enabledFeatures?.cycleTracker === false || !cyclePhaseInfo) return null;
    return (
      <div
        key="cycle_tracker"
        onClick={() => {
          setShowCycleTrackerModal(true);
          playChime('tap');
        }}
        className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">
            {cycleSettings.discreetMode ? '🌿' : '🌸'}
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              {cycleSettings.discreetMode ? 'Wellness Rhythm' : `Cycle Day ${cyclePhaseInfo.currentCycleDay}`}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
              Sensory Tolerance & Rhythm
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Track sensory thresholds, fatigue and hormonal changes.
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    );
  };

  const renderCommunicationPassport = () => (
    <div
      key="communication_passport"
      onClick={() => {
        setShowPassportModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🪪</span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            Printable Support Sheet
          </span>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
            "How to Support Me" Passport
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            1-page guide covering communication preferences, sensory triggers & comfort items.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderAdventureSpotlight = () => {
    if (!todaysAdventure) return null;
    return (
      <div
        key="adventure_spotlight"
        onClick={() => setChildView('adventures')}
        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer transition-all active:scale-98"
      >
        <div className="flex items-center gap-3.5">
          <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">{todaysAdventure.emoji}</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              Preparation Adventure
            </span>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-0.5">
              {todaysAdventure.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Step-by-step walkthrough, sensory guide, and practice words.
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    );
  };

  const renderEveningReflection = () => (
    <div
      key="evening_reflection"
      onClick={() => {
        setShowRecollectionModal(true);
        playChime('tap');
      }}
      className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-2xs">🌙</span>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            Evening Check-In
          </span>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
            Daily Mood Recollection
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Log today's emotional weather and celebrate daily wins.
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );

  const renderQuickAAC = () => (
    <div key="quick_aac" className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Communication:
        </span>
        <button
          onClick={() => setChildView('aac')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <span>Open Full AAC Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { text: 'I want pizza.', emoji: '🍕' },
          { text: 'I need help.', emoji: '🆘' },
          { text: 'I need a break.', emoji: '🛋️' },
          { text: "What's next?", emoji: '❓' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              speak(item.text);
              if (item.text.includes('break')) {
                setShowCopingToolkit(true);
              }
            }}
            className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="leading-tight">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const widgetRenderMap: Record<DashboardWidgetId, () => React.ReactNode> = {
    mascot_companion: renderMascotCompanion,
    routine_schedule: renderRoutineSchedule,
    five_point_scale: renderFivePointScale,
    spoon_budget: renderSpoonBudget,
    pie_timer: renderPieTimer,
    decision_wheel: renderDecisionWheel,
    fidget_toys: renderFidgetToys,
    medication_tracker: renderMedicationTracker,
    mood_journal: renderMoodJournal,
    cycle_tracker: renderCycleTracker,
    communication_passport: renderCommunicationPassport,
    adventure_spotlight: renderAdventureSpotlight,
    evening_reflection: renderEveningReflection,
    quick_aac: renderQuickAAC,
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* 1. PLANS CHANGED ALERT BANNER (If Active) */}
      {plansChanged.active && (
        <div
          onClick={() => setShowPlansChangedModal(true)}
          className="bg-amber-100 hover:bg-amber-200 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98 animate-in fade-in"
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

      {/* 2. WELCOME HERO & EDITABLE DASHBOARD BUTTON */}
      <div className="bg-white border border-amber-200/60 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300/80 text-amber-950 font-black text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 shadow-2xs"
            title="About Me ID Card"
          >
            {childProfile.name.charAt(0).toUpperCase() || '🐝'}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight leading-tight">
              Hi, {childProfile.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              {userAgeGroup === 'adult'
                ? 'Your personalized daily executive space • You can be yourself here'
                : 'Here is your space for today • You can be yourself here'}
            </p>
          </div>
        </div>

        {/* Action bar: Customize Dashboard Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setShowDashboardCustomizer(true);
              playChime('tap');
            }}
            className="px-3.5 py-2 rounded-2xl bg-[#FAF8F5] hover:bg-amber-50 text-stone-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-200/80 transition-all"
            title="Add, remove, or rearrange widgets on your dashboard"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-700" />
            <span>Customize Dashboard ✏️</span>
          </button>
        </div>
      </div>

      {/* 2b. QUICK HELP: talk, calm down, ask for help (respects feature toggles) */}
      {(enabledFeatures?.aacCommunication !== false ||
        enabledFeatures?.sensoryBreathingPacer !== false ||
        enabledFeatures?.emergencyAlertSOS !== false) && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3" role="group" aria-label="Quick help">
          {enabledFeatures?.aacCommunication !== false && (
            <button
              onClick={() => {
                setChildView('aac');
                playChime('tap');
              }}
              className="min-h-[76px] rounded-3xl bg-amber-50/90 hover:bg-amber-100 border-2 border-amber-300/90 text-amber-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs transition-all"
            >
              <span className="text-2xl" aria-hidden="true">💬</span>
              Talk
            </button>
          )}
          {enabledFeatures?.sensoryBreathingPacer !== false && (
            <button
              onClick={() => {
                setShowCopingToolkit(true);
                playChime('tap');
              }}
              className="min-h-[76px] rounded-3xl bg-[#E8F0EB] hover:bg-[#DCEAE1] border-2 border-[#82A792]/50 text-[#2F5233] font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs transition-all"
            >
              <span className="text-2xl" aria-hidden="true">🛋️</span>
              Calm down
            </button>
          )}
          {enabledFeatures?.emergencyAlertSOS !== false && (
            <button
              onClick={() => {
                setShowCaregiverAlertModal(true);
                playChime('tap');
              }}
              className="min-h-[76px] rounded-3xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-2xs transition-all"
            >
              <span className="text-2xl" aria-hidden="true">🆘</span>
              I need help
            </button>
          )}
        </div>
      )}

      {/* 3. DYNAMICALLY ORDERED CUSTOM WIDGETS (hidden when their feature is switched off) */}
      {dashboardWidgets.map((widget) => {
        if (!widget.enabled || !isWidgetAvailable(widget.id, enabledFeatures)) return null;
        const renderer = widgetRenderMap[widget.id];
        return renderer ? renderer() : null;
      })}
    </div>
  );
};
