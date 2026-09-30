import React from 'react';
import { useApp } from '../context/AppContext';
import { ChildAvatar } from './ChildAvatar';
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
  Pill
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const ChildHomeView: React.FC = () => {
  const {
    childProfile,
    avatar,
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
    setShowAvatarCreator,
    medications,
    takeMedicationDose,
    setShowMedicationModal,
  } = useApp();


  const currentRoutine = routines[0];
  const nextStep = currentRoutine?.steps.find((s) => !s.completed);
  const todaysAdventure = adventures[0]; // Dentist Adventure

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

      {/* 2. WELCOME HERO WITH CHILD AVATAR & CURRENT MOOD */}
      <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-2 border-amber-200/80 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative group shrink-0">
            <div
              onClick={() => {
                setShowAvatarCreator(true);
                playChime('tap');
              }}
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title="Open Avatar Creator Studio 🎨"
            >
              <ChildAvatar config={avatar} size="lg" />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white cursor-pointer">
                <span>🎨</span>
                <span className="hidden sm:inline">Avatar</span>
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                Welcome Back
              </span>
              {enabledFeatures?.starsAndRewards !== false && (
                <button
                  type="button"
                  onClick={() => {
                    setChildView('rewards');
                    playChime('star');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300/80 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
                  title="View earned badges & rewards"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{worldState.stars} Stars • 🏆 Rewards</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 truncate">
              {userAgeGroup === 'adult' ? `Welcome back, ${childProfile.name} 👋` : `Hi, ${childProfile.name}! 👋`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">
              {userAgeGroup === 'adult'
                ? 'Your personal executive assistant & communication hub'
                : userAgeGroup === 'teen'
                ? 'Your daily focus, communication & independence space'
                : 'Your safe, friendly everyday companion'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto lg:justify-end">
          {enabledFeatures?.emergencyAlertSOS !== false && (
            <button
              onClick={() => {
                setShowCaregiverAlertModal(true);
                playChime('tap');
              }}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse shrink-0"
              title="Easy Alert to Caregiver - Send your feeling or ask for help"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Alert Caregiver 🚨</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowCaregiverModal(true);
              playChime('tap');
            }}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-rose-200 shrink-0"
            title="Connect with Caregiver"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Caregiver</span>
          </button>

          <button
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-indigo-200 shrink-0"
            title="View and show About Me ID Card"
          >
            <span>🪪</span>
            <span>About Me ID</span>
          </button>

          <button
            onClick={() => {
              setShowMorningBrief(true);
              playChime('tap');
            }}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300 shrink-0"
            title="View today's Morning Brief"
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Morning Brief</span>
          </button>

          <button
            onClick={() => {
              setShowRecollectionModal(true);
              playChime('tap');
            }}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border border-indigo-200 shrink-0"
            title="Log today's mood and recollection chart"
          >
            <Moon className="w-4 h-4 text-indigo-600" />
            <span>Evening Reflection 🌙</span>
          </button>

          <button
            onClick={() => {
              speak(`Hello! I am ${childProfile.name}.`);
              playChime('star');
            }}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span>Say Hello!</span>
          </button>
        </div>
      </div>

      {/* 2.5 THEMED COMPANION & MOTIVATION BANNER */}
      {enabledFeatures?.mascotCompanion !== false ? (
        <div 
          onClick={() => {
            setShowThemeModal(true);
            playChime('star');
          }}
          className={`rounded-3xl p-4 sm:p-5 border-2 shadow-xs transition-all hover:shadow-md cursor-pointer active:scale-98 flex items-center justify-between gap-3 ${activeTheme.palette.primaryLight} ${activeTheme.palette.primaryBorder}`}
        >
          <div className="flex items-center gap-3.5">
            <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-white/90 shadow-2xs shrink-0">
              {activeTheme.mascotEmoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activeTheme.palette.badgeBg} ${activeTheme.palette.textAccent}`}>
                  {activeTheme.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {activeTheme.mascotName}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">
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
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs shrink-0 cursor-pointer hidden sm:flex items-center gap-1"
          >
            <span>🎨 Themes</span>
          </button>
        </div>
      ) : (
        <div 
          onClick={() => {
            setShowThemeModal(true);
            playChime('tap');
          }}
          className={`rounded-2xl p-3.5 sm:p-4 border shadow-xs transition-all hover:shadow-sm cursor-pointer flex items-center justify-between gap-3 ${activeTheme.palette.primaryLight} ${activeTheme.palette.primaryBorder}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl p-2 rounded-xl bg-white/90 shadow-2xs">
              {activeTheme.mascotEmoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activeTheme.palette.badgeBg} ${activeTheme.palette.textAccent}`}>
                  {activeTheme.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">Personal Theme Active</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
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
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🎨 Change Theme</span>
          </button>
        </div>
      )}

      {/* 3. CURRENT SCHEDULE & FIRST/THEN SNAPSHOT */}
      {currentRoutine && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentRoutine.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Today's Schedule
                </span>
                <h3 className="font-black text-slate-800 text-base">
                  {currentRoutine.title}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setChildView('my-day')}
              className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Open My Day</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* First / Then quick strip */}
          {currentRoutine.firstThen && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-2.5">
                <span className="text-2xl">{currentRoutine.firstThen.firstEmoji}</span>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-sky-800 block">First</span>
                  <span className="font-bold text-xs sm:text-sm text-sky-950 truncate block">
                    {currentRoutine.firstThen.first}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-2.5">
                <span className="text-2xl">{currentRoutine.firstThen.thenEmoji}</span>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-purple-800 block">Then</span>
                  <span className="font-bold text-xs sm:text-sm text-purple-950 truncate block">
                    {currentRoutine.firstThen.then}
                  </span>
                </div>
              </div>
            </div>
          )}

          {nextStep && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Up next:</span>
                <span className="text-lg">{nextStep.emoji}</span>
                <span className="font-black text-slate-800">{nextStep.title}</span>
              </div>
              <button
                onClick={() => setChildView('my-day')}
                className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-bold text-[11px] cursor-pointer"
              >
                Go
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3.5. MEDICATION & HEALTH REMINDERS SNAPSHOT */}
      {enabledFeatures?.medicationReminders !== false && medications.length > 0 && (() => {
        const pendingMeds = medications.filter(
          (m) => m.active && m.frequency !== 'as_needed' && m.times.some((t) => !m.takenTimesToday.includes(t))
        );
        const nextDueMed = pendingMeds[0] || medications[0];
        const nextTime = nextDueMed?.times.find((t) => !nextDueMed.takenTimesToday.includes(t)) || nextDueMed?.times[0] || 'As needed';
        const isAllTaken = pendingMeds.length === 0 && medications.some((m) => m.frequency !== 'as_needed');

        return (
          <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-indigo-50 rounded-3xl border-2 border-teal-200/90 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💊</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                      Medication Reminders
                    </span>
                    {medications.some((m) => m.totalQuantity <= m.refillThreshold) && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        Low Supply!
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 text-base mt-0.5">
                    {isAllTaken ? 'All doses complete for today! 🎉' : `Next: ${nextDueMed?.name}`}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMedicationModal(true);
                  playChime('tap');
                }}
                className="text-xs font-black text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs"
              >
                <span>View All Meds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Card */}
            {!isAllTaken && nextDueMed && (
              <div className="bg-white/90 rounded-2xl p-3 sm:p-3.5 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{nextDueMed.emoji || '💊'}</span>
                  <div>
                    <h4 className="font-black text-sm text-slate-800 leading-tight">
                      {nextDueMed.name}
                    </h4>
                    <p className="text-xs font-bold text-teal-800 mt-0.5">
                      Take {nextDueMed.dosage} {nextDueMed.unit} • Time: {nextTime}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Supply: {nextDueMed.totalQuantity} {nextDueMed.unit} remaining
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => takeMedicationDose(nextDueMed.id, nextTime)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto shrink-0"
                >
                  <Pill className="w-4 h-4" />
                  <span>Take Dose (+1 ⭐)</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. TODAY'S ADVENTURE PREPARATION SPOTLIGHT */}
      {todaysAdventure && (
        <div
          onClick={() => setChildView('adventures')}
          className="bg-emerald-50/80 hover:bg-emerald-100/60 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-3.5">
            <span className="text-4xl">{todaysAdventure.emoji}</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                Preparation Adventure
              </span>
              <h3 className="font-black text-emerald-950 text-base sm:text-lg mt-0.5">
                {todaysAdventure.title}
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                Step-by-step walkthrough, sensory guide, and practice words.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0" />
        </div>
      )}

      {/* 5. FAST COMMUNICATION TILES (Journey 1: Immediate Pizza Speech!) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
            Quick Communication:
          </span>
          <button
            onClick={() => setChildView('aac')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full AAC Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { text: 'I want pizza.', emoji: '🍕', color: 'bg-orange-50 border-orange-300 text-orange-950' },
            { text: 'I need help.', emoji: '🆘', color: 'bg-rose-50 border-rose-300 text-rose-950' },
            { text: 'I need a break.', emoji: '🛋️', color: 'bg-teal-50 border-teal-300 text-teal-950' },
            { text: "What's next?", emoji: '❓', color: 'bg-sky-50 border-sky-300 text-sky-950' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                speak(item.text);
                if (item.text.includes('break')) {
                  setShowCopingToolkit(true);
                }
              }}
              className={`p-3.5 rounded-2xl border-2 font-black text-xs sm:text-sm text-left flex items-center gap-2.5 shadow-xs transition-all active:scale-95 cursor-pointer ${item.color}`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="leading-tight">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
