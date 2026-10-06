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
  Shield
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { resolveAacImageUrl } from '../services/symbolService';
import { DashboardWidgetId } from '../types';
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

  // Card theme surface classes
  const cardStyle = activeTheme?.palette?.cardBg || 'bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.03)]';
  const innerCardStyle = activeTheme?.palette?.cardInnerBg || 'bg-white/80 border border-white/90 shadow-2xs';

  // Core AAC Folders for Home Screen Quick Access (Image 1 Style)
  const HOME_AAC_TILES = [
    { id: 'folder-food', label: 'Food', emoji: '🍕', symbolId: 'food', bg: 'bg-amber-50/90 hover:bg-amber-100 border-amber-200/80 text-amber-950', category: 'food' },
    { id: 'folder-drinks', label: 'Drinks', emoji: '🧃', symbolId: 'drink', bg: 'bg-orange-50/90 hover:bg-orange-100 border-orange-200/80 text-orange-950', category: 'drinks' },
    { id: 'folder-activities', label: 'Play & Fun', emoji: '🎮', symbolId: 'play_,_to', bg: 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/80 text-emerald-950', category: 'activities' },
    { id: 'folder-places', label: 'Places', emoji: '🏠', symbolId: 'house', bg: 'bg-sky-50/90 hover:bg-sky-100 border-sky-200/80 text-sky-950', category: 'places' },
    { id: 'folder-people', label: 'People', emoji: '👥', symbolId: 'good_person', bg: 'bg-indigo-50/90 hover:bg-indigo-100 border-indigo-200/80 text-indigo-950', category: 'people' },
    { id: 'folder-feelings', label: 'Feelings', emoji: '💛', symbolId: 'happy_man', bg: 'bg-rose-50/90 hover:bg-rose-100 border-rose-200/80 text-rose-950', category: 'feelings' },
    { id: 'tile-mine', label: 'My / Mine', emoji: '🤲', symbolId: 'mine', bg: 'bg-purple-50/90 hover:bg-purple-100 border-purple-200/80 text-purple-950', category: 'core' },
    { id: 'tile-want', label: 'Want', emoji: '🤲', symbolId: 'want_,_to', bg: 'bg-teal-50/90 hover:bg-teal-100 border-teal-200/80 text-teal-950', category: 'core' },
  ];

  // ── Modular Widget Renderers ──

  const renderMascotCompanion = () => (
    <div 
      key="mascot_companion"
      onClick={() => {
        setShowThemeModal(true);
        playChime('star');
      }}
      className={`rounded-3xl p-4 sm:p-5 ${cardStyle} transition-all hover:scale-[1.01] cursor-pointer active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-3xl shrink-0 border border-white/80 shadow-xs">
          {activeTheme.mascotEmoji}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200/60">
              {activeTheme.name}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {activeTheme.mascotName}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-800 mt-1">
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
        className="px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-bold text-xs border border-white/90 shadow-2xs shrink-0 cursor-pointer hidden sm:flex items-center gap-1.5"
      >
        <span>🎨 Themes & Studio</span>
      </button>
    </div>
  );

  const renderRoutineSchedule = () => {
    if (!currentRoutine) return null;
    return (
      <div key="routine_schedule" className={`rounded-3xl p-4 sm:p-5 ${cardStyle} space-y-3.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-2xl bg-white/80 border border-white/90 shadow-2xs">{currentRoutine.emoji}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Today's Schedule
              </span>
              <h3 className="font-black text-slate-800 text-base sm:text-lg">
                {currentRoutine.title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setChildView('my-day')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-xl border border-white/80 transition-all"
          >
            <span>Open Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* First / Then quick strip */}
        {currentRoutine.firstThen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className={`p-3.5 rounded-2xl ${innerCardStyle} flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{currentRoutine.firstThen.firstEmoji}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">First</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 truncate block">
                    {currentRoutine.firstThen.first}
                  </span>
                </div>
              </div>
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-bold shadow-2xs">
                ✓
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl ${innerCardStyle} flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{currentRoutine.firstThen.thenEmoji}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Then</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 truncate block">
                    {currentRoutine.firstThen.then}
                  </span>
                </div>
              </div>
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs shrink-0 font-bold shadow-2xs">
                ○
              </span>
            </div>
          </div>
        )}

        {/* Up Next Step */}
        {nextStep && (
          <div className={`p-3.5 rounded-2xl ${innerCardStyle} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl">{nextStep.emoji}</span>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Up Next</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">{nextStep.title}</span>
              </div>
            </div>
            <button
              onClick={() => setChildView('my-day')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl shrink-0 border border-rose-200/80 shadow-xs">🌡️</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200/60">
              Regulation Tool
            </span>
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Incredible 5-Point Scale
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            1 (Relaxed) to 5 (Meltdown). Tap to check in.
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0 border border-amber-200/80 shadow-xs">🥄</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/60">
              Energy Budget
            </span>
            {todaySpoonEntry && (
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                {todaySpoonEntry.totalSpoons - todaySpoonEntry.usedSpoons} Spoons Left
              </span>
            )}
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Spoon Theory Stamina Budget
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl shrink-0 border border-sky-200/80 shadow-xs">⏰</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200/60">
              Visual Time
            </span>
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Time Pie Clock (Time Timer)
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0 border border-indigo-200/80 shadow-xs">🎡</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/60">
              Choice Helper
            </span>
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Decision Wheel Spinner
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Stuck in choice paralysis? Spin the wheel to decide.
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 border border-purple-200/80 shadow-xs">🫧</span>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200/60">
              Discreet Stimming
            </span>
          </div>
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Digital Fidget Corner
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Silicone bubble pops, calming water ripples & marble maze.
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
        className={`rounded-3xl p-4 sm:p-5 ${cardStyle} space-y-3 cursor-pointer hover:scale-[1.01] transition`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs">💊</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Health & Medications
              </span>
              <h3 className="font-black text-slate-900 text-base">
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
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-xl border border-white/80"
          >
            <span>Manage Meds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.slice(0, 2).map((med) => (
              <div key={med.id} className={`p-3 rounded-2xl ${innerCardStyle} flex items-center justify-between gap-2`}>
                <span className="font-black text-xs text-slate-900">{med.name} ({med.dosage})</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextDue = med.times.find((t) => !med.takenTimesToday.includes(t)) || 'Now';
                    takeMedicationDose(med.id, nextDue);
                    playChime('complete');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-2xs cursor-pointer active:scale-95"
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
        className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] transition cursor-pointer flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0 border border-teal-200/80 shadow-xs">📖</span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200/60">
              Reflection & Journal
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
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
        className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] transition cursor-pointer flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl shrink-0 border border-pink-200/80 shadow-xs">
            {cycleSettings.discreetMode ? '🌿' : '🌸'}
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200/60">
              {cycleSettings.discreetMode ? 'Wellness Rhythm' : `Cycle Day ${cyclePhaseInfo.currentCycleDay}`}
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] transition cursor-pointer flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 border border-purple-200/80 shadow-xs">🪪</span>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200/60">
            Emergency Passport
          </span>
          <h3 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
            "How to Support Me" Passport
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Communication preferences, sensory triggers & emergency contacts.
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
        className={`p-4 sm:p-5 rounded-3xl ${cardStyle} hover:scale-[1.01] flex items-center justify-between cursor-pointer transition-all active:scale-98`}
      >
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0 border border-indigo-200/80 shadow-xs">{todaysAdventure.emoji}</span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/60">
              Life Adventure
            </span>
            <h3 className="font-black text-slate-900 text-base sm:text-lg mt-0.5">
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
      className={`p-4 rounded-3xl ${cardStyle} hover:scale-[1.01] transition cursor-pointer flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200/80 shadow-xs">🌙</span>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md border border-slate-300/60">
            Evening Check-In
          </span>
          <h3 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
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
    <div key="quick_aac" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
          Quick Communication
        </span>
        <button
          onClick={() => setChildView('aac')}
          className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-xl border border-white/80 transition-all"
        >
          <span>Open Full AAC Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { text: 'I want pizza.', emoji: '🍕', bg: 'bg-amber-100/70 hover:bg-amber-100 text-amber-950 border-amber-200/80' },
          { text: 'I need help.', emoji: '🆘', bg: 'bg-rose-100/70 hover:bg-rose-100 text-rose-950 border-rose-200/80' },
          { text: 'I need a break.', emoji: '🛋️', bg: 'bg-sky-100/70 hover:bg-sky-100 text-sky-950 border-sky-200/80' },
          { text: "What's next?", emoji: '❓', bg: 'bg-purple-100/70 hover:bg-purple-100 text-purple-950 border-purple-200/80' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              speak(item.text);
              if (item.text.includes('break')) {
                setShowCopingToolkit(true);
              }
              playChime('tap');
            }}
            className={`p-3.5 rounded-2xl border ${item.bg} backdrop-blur-md font-black text-xs sm:text-sm text-left flex items-center gap-2.5 shadow-2xs transition-all active:scale-95 cursor-pointer`}
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
          className="bg-amber-100/90 backdrop-blur-md hover:bg-amber-200 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-98 animate-in fade-in"
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

      {/* 2. WELCOME HERO & EDITABLE DASHBOARD BUTTON (Image 1 Header) */}
      <div className={`rounded-3xl p-4 sm:p-5 ${cardStyle} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 font-black text-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 shadow-xs"
            title="About Me ID Card"
          >
            {childProfile.name.charAt(0).toUpperCase() || '🐝'}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Hi, {childProfile.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {userAgeGroup === 'adult'
                ? 'Your personalized daily executive space • You can be yourself here'
                : 'Here is your plan and tools for today'}
            </p>
          </div>
        </div>

        {/* Action bar: Customize Dashboard & How It Works Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          <ContextualHelpButton topic="all" label="How It Works 💡" variant="pill" />
          <button
            onClick={() => {
              setShowDashboardCustomizer(true);
              playChime('tap');
            }}
            className="px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-white/90 transition-all"
            title="Add, remove, or rearrange widgets on your dashboard"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <span>Customize Dashboard ✏️</span>
          </button>
        </div>
      </div>

      {/* 2b. QUICK HELP TRIAD: Talk, Calm Down, Ask for Help (Image 1 Style) */}
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
              className="min-h-[82px] rounded-3xl bg-amber-100/75 hover:bg-amber-100/90 border border-amber-200/90 text-amber-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs transition-all backdrop-blur-md"
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
              className="min-h-[82px] rounded-3xl bg-sky-100/75 hover:bg-sky-100/90 border border-sky-200/90 text-sky-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs transition-all backdrop-blur-md"
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
              className="min-h-[82px] rounded-3xl bg-rose-100/75 hover:bg-rose-100/90 border border-rose-200/90 text-rose-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs transition-all backdrop-blur-md"
            >
              <span className="text-2xl" aria-hidden="true">🆘</span>
              I need help
            </button>
          )}
        </div>
      )}

      {/* 2c. AAC VISUAL BOARD PREVIEW (Image 1 Style Grid) */}
      {enabledFeatures?.aacCommunication !== false && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              AAC Board
            </span>
            <button
              onClick={() => setChildView('aac')}
              className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-xl border border-white/80 transition-all"
            >
              <span>Explore All Words</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {HOME_AAC_TILES.slice(0, 6).map((tile) => (
              <button
                key={tile.id}
                onClick={() => {
                  setChildView('aac');
                  playChime('tap');
                }}
                className={`p-2.5 rounded-3xl border ${tile.bg} backdrop-blur-md flex flex-col items-center justify-between aspect-square shadow-xs hover:scale-[1.03] active:scale-95 cursor-pointer transition-all`}
              >
                <div className="flex-1 w-full flex items-center justify-center p-1">
                  <img
                    src={resolveAacImageUrl(tile)}
                    alt={tile.label}
                    className="w-full h-full object-contain max-h-12 pointer-events-none"
                    loading="lazy"
                  />
                </div>
                <span className="font-black text-xs tracking-tight text-center mt-1">
                  {tile.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2d. TOOLS HUB BENTO GRID (Image 1 Bottom Section) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Lumina Tools Hub
          </span>
          <button
            onClick={() => setShowToolsHubModal(true)}
            className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-xl border border-white/80 transition-all"
          >
            <span>All Tools ({8})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Incredible 5-Point Scale', emoji: '🌡️', bg: 'bg-rose-100/70 hover:bg-rose-100 text-rose-950 border-rose-200/80', action: () => setShowFivePointModal(true) },
            { label: 'Time Pie Clock', emoji: '⏰', bg: 'bg-amber-100/70 hover:bg-amber-100 text-amber-950 border-amber-200/80', action: () => setShowPieTimerModal(true) },
            { label: 'Medication Reminders', emoji: '💊', bg: 'bg-sky-100/70 hover:bg-sky-100 text-sky-950 border-sky-200/80', action: () => setShowMedicationModal(true) },
            { label: 'About Me Emergency ID', emoji: '🪪', bg: 'bg-purple-100/70 hover:bg-purple-100 text-purple-950 border-purple-200/80', action: () => setShowAboutMeModal(true) },
            { label: 'Digital Fidget Toys', emoji: '🫧', bg: 'bg-indigo-100/70 hover:bg-indigo-100 text-indigo-950 border-indigo-200/80', action: () => setShowFidgetModal(true) },
            { label: 'Spoon Theory Budget', emoji: '🥄', bg: 'bg-amber-100/70 hover:bg-amber-100 text-amber-950 border-amber-200/80', action: () => setShowSpoonModal(true) },
            { label: 'Themes & Studio', emoji: '🎨', bg: 'bg-pink-100/70 hover:bg-pink-100 text-pink-950 border-pink-200/80', action: () => setShowThemeModal(true) },
            { label: 'Decision Spinner Wheel', emoji: '🎡', bg: 'bg-slate-100/80 hover:bg-slate-100 text-slate-950 border-slate-200/80', action: () => setShowDecisionWheelModal(true) },
          ].map((tool, idx) => (
            <button
              key={idx}
              onClick={() => {
                tool.action();
                playChime('tap');
              }}
              className={`p-3 rounded-2xl border ${tool.bg} backdrop-blur-md font-black text-xs text-left flex items-center gap-2 shadow-2xs hover:scale-[1.02] active:scale-95 cursor-pointer transition-all`}
            >
              <span className="text-xl shrink-0">{tool.emoji}</span>
              <span className="leading-tight truncate">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. DYNAMICALLY ORDERED CUSTOM WIDGETS (Routines, Mascot, Habits, etc.) */}
      {dashboardWidgets.map((widget) => {
        if (!widget.enabled || !isWidgetAvailable(widget.id, enabledFeatures)) return null;
        // Skip duplicate widgets already showcased in the premier hero layout above
        if (widget.id === 'quick_aac') return null;
        const renderer = widgetRenderMap[widget.id];
        return renderer ? renderer() : null;
      })}
    </div>
  );
};
