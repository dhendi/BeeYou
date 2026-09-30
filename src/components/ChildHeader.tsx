import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChildAvatar } from './ChildAvatar';
import { 
  HeartHandshake, 
  Coffee, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  AlertCircle,
  Volume2,
  Heart,
  ShieldAlert,
  Crown
} from 'lucide-react';

import { playChime } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

export const ChildHeader: React.FC = () => {
  const {
    childProfile,
    avatar,
    worldState,
    setShowPinModal,
    setShowQuickPhrasesDrawer,
    setShowCopingToolkit,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    plansChanged,
    setShowPlansChangedModal,
    speak,
    setChildView,
    activeTheme,
    setShowThemeModal,
    enabledFeatures,
    userAgeGroup,
    setShowAboutMeModal,
    setShowAvatarCreator,
    medications,
    setShowMedicationModal,
    setShowMoodJournalModal,
    setShowCycleTrackerModal,
    cycleSettings,
    getCyclePhaseInfo,
    subscription,
    isPremium,
    triggerUpgrade,
    getTrialDaysRemaining,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPassportModal,
    setShowSpoonModal,
    setShowPieTimerModal,
    setShowDecisionWheelModal,
    setShowFidgetModal,
  } = useApp();

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const cyclePhaseInfo = getCyclePhaseInfo();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNeedHelp = () => {
    speak('Please help me.');
  };

  const handleNeedBreak = () => {
    speak('I need a break.');
    setShowCopingToolkit(true);
  };

  return (
    <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-100'} backdrop-blur px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-300`}>
      {/* Left: Avatar + Greeting + Time */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative group">
          <button 
            type="button"
            onClick={() => {
              setShowAvatarCreator(true);
              playChime('tap');
            }}
            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 block"
            title="Open Avatar Creator Studio 🎨"
            aria-label="Open Avatar Creator"
          >
            <ChildAvatar config={avatar} size="sm" />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-500 text-amber-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
              🎨
            </span>
          </button>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 
              onClick={() => {
                setShowAboutMeModal(true);
                playChime('tap');
              }}
              className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none cursor-pointer hover:underline"
              title="Show About Me ID Card"
            >
              {childProfile.name}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {currentTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {enabledFeatures?.starsAndRewards !== false && (
              <button
                type="button"
                onClick={() => {
                  setChildView('rewards');
                  playChime('star');
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 cursor-pointer transition-all active:scale-95"
                title="View earned rewards & badges"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span><strong className="text-amber-900">{worldState.stars}</strong> Stars</span>
              </button>
            )}

            {/* Lumina Subscription / Trial Status Pill */}
            <button
              type="button"
              onClick={() => {
                triggerUpgrade();
                playChime('tap');
              }}
              className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border cursor-pointer transition-all active:scale-95 shadow-2xs ${
                isPremium
                  ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                  : 'bg-gradient-to-r from-amber-100 to-purple-100 text-purple-950 border-amber-300 hover:from-amber-200 hover:to-purple-200'
              }`}
              title="Lumina Premium Membership ($12.99/mo, 30-day free trial)"
            >
              <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>
                {subscription.status === 'trial'
                  ? `Trial (${getTrialDaysRemaining()}d)`
                  : isPremium
                  ? 'Premium'
                  : '30d Free'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowThemeModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-emerald-900 bg-white/80 hover:bg-white px-2 py-0.5 rounded-full border border-emerald-300 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Change theme & icons"
            >
              <span>{activeTheme.mascotEmoji}</span>
              <span className="hidden xs:inline">{activeTheme.name}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAboutMeModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Quick About Me & Emergency ID Card"
            >
              <span>🪪</span>
              <span className="hidden sm:inline">About Me</span>
            </button>

            {enabledFeatures?.medicationReminders !== false && (
              <button
                type="button"
                onClick={() => {
                  setShowMedicationModal(true);
                  playChime('tap');
                }}
                className="relative flex items-center gap-1 text-[11px] font-black text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Medication Reminders & Supply"
              >
                <span>💊</span>
                <span className="hidden sm:inline">Meds</span>
                {medications.some((m) => m.totalQuantity <= m.refillThreshold) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Low supply alert" />
                )}
              </button>
            )}

            {isTeenOrAdult && enabledFeatures?.moodJournal !== false && (
              <button
                type="button"
                onClick={() => {
                  setShowMoodJournalModal(true);
                  playChime('tap');
                }}
                className="flex items-center gap-1 text-[11px] font-black text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Mood Journal & Self-Reflection"
              >
                <span>📖</span>
                <span className="hidden sm:inline">Journal</span>
              </button>
            )}

            {isTeenOrAdult && enabledFeatures?.cycleTracker !== false && (
              <button
                type="button"
                onClick={() => {
                  setShowCycleTrackerModal(true);
                  playChime('tap');
                }}
                className="flex items-center gap-1 text-[11px] font-black text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
                title={cycleSettings.discreetMode ? "Wellness Rhythm Tracker" : "Cycle Tracker"}
              >
                <span>{cycleSettings.discreetMode ? '🌿' : '🌸'}</span>
                <span className="hidden sm:inline">
                  {cycleSettings.discreetMode ? 'Rhythm' : `Day ${cyclePhaseInfo.currentCycleDay}`}
                </span>
              </button>
            )}

            {/* Spoon Budget */}
            <button
              type="button"
              onClick={() => {
                setShowSpoonModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Spoon Theory Daily Energy Budget"
            >
              <span>🥄</span>
              <span className="hidden sm:inline">Spoons</span>
            </button>

            {/* Pie Clock */}
            <button
              type="button"
              onClick={() => {
                setShowPieTimerModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Visual Pie Clock / Time Timer"
            >
              <span>⏰</span>
              <span className="hidden sm:inline">Timer</span>
            </button>

            {/* 5-Point Scale */}
            <button
              type="button"
              onClick={() => {
                setShowFivePointModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Incredible 5-Point Scale"
            >
              <span>🌡️</span>
              <span className="hidden sm:inline">Scale</span>
            </button>

            {/* Decision Wheel */}
            <button
              type="button"
              onClick={() => {
                setShowDecisionWheelModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Decision Wheel Spinner"
            >
              <span>🎡</span>
              <span className="hidden sm:inline">Wheel</span>
            </button>

            {/* Fidget Toys */}
            <button
              type="button"
              onClick={() => {
                setShowFidgetModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Sensory Fidget Toys"
            >
              <span>🫧</span>
              <span className="hidden sm:inline">Fidgets</span>
            </button>

            {/* Communication Passport */}
            <button
              type="button"
              onClick={() => {
                setShowPassportModal(true);
                playChime('tap');
              }}
              className="flex items-center gap-1 text-[11px] font-black text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="How to Support Me - Communication Passport"
            >
              <span>🪪</span>
              <span className="hidden sm:inline">Passport</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center: Plans Changed Indicator (if active) */}
      {plansChanged.active && (
        <button
          onClick={() => setShowPlansChangedModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm animate-pulse cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Plans Changed: {plansChanged.newPlanTitle}</span>
        </button>
      )}

      {/* Right: Quick Action Buttons + Parent Lock */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Break Button */}
        <button
          onClick={handleNeedBreak}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-200 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="I need a break"
        >
          <Coffee className="w-4 h-4 text-teal-600" />
          <span className="hidden sm:inline">Break</span>
        </button>

        {/* Quick Help Button */}
        <button
          onClick={handleNeedHelp}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="I need help"
        >
          <HeartHandshake className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Help</span>
        </button>

        {/* Quick Phrases Drawer Toggle */}
        <button
          onClick={() => setShowQuickPhrasesDrawer(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-2 border-indigo-200 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Quick phrases"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">Quick Chat</span>
        </button>

        {/* Caregiver Connect Button */}
        <button
          onClick={() => {
            setShowCaregiverModal(true);
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Connect with Caregiver - Share how I am doing"
        >
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span className="hidden md:inline">Caregiver</span>
        </button>

        {/* Emergency Sensory Red Button (Feature 1) */}
        <button
          onClick={() => {
            activateEmergencyMode();
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm cursor-pointer border border-red-500 animate-pulse ring-2 ring-red-400/50"
          title="Emergency Sensory Red Button: Instant dark sensory mode + large emergency AAC cards"
        >
          <span className="text-sm">🚨</span>
          <span className="hidden xl:inline">Calm Room</span>
        </button>

        {/* Easy Emotion Alert Button */}
        {enabledFeatures?.emergencyAlertSOS !== false && (
          <button
            onClick={() => {
              setShowCaregiverAlertModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm shadow-rose-200 cursor-pointer animate-pulse ring-2 ring-rose-400/50"
            title="Easy Alert Button - Send your emotion or ask for help at school or therapy"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Alert 🚨</span>
            <span className="sm:hidden">SOS</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Parent / Settings Lock Switch */}
        <button
          onClick={() => setShowPinModal(true)}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs active:scale-95 transition-all flex items-center gap-1 border border-slate-200 ml-1 cursor-pointer"
          title={userAgeGroup === 'adult' ? 'Settings & Personal Hub (Protected by PIN)' : 'Parent & Caregiver Dashboard (Protected by PIN)'}
        >
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">
            {userAgeGroup === 'adult' ? 'Settings' : userAgeGroup === 'teen' ? 'Settings' : 'Grown-Up'}
          </span>
        </button>
      </div>
    </header>
  );
};
