import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChildAvatar } from './ChildAvatar';
import { 
  Coffee, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  AlertCircle,
  ShieldAlert,
  Crown,
  LayoutGrid
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
    setShowCaregiverAlertModal,
    plansChanged,
    setShowPlansChangedModal,
    speak,
    setChildView,
    activeTheme,
    enabledFeatures,
    userAgeGroup,
    setShowAboutMeModal,
    setShowAvatarCreator,
    subscription,
    isPremium,
    triggerUpgrade,
    getTrialDaysRemaining,
    setShowToolsHubModal,
  } = useApp();

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

  const handleNeedBreak = () => {
    speak('I need a break.');
    setShowCopingToolkit(true);
  };

  return (
    <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-100'} backdrop-blur px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-300`}>
      {/* Left: Avatar + Greeting + Time + Core Status Badges */}
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

          {/* Clean minimal status pills */}
          <div className="flex items-center gap-1.5 mt-1">
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

      {/* Right: Consolidated Action Buttons (5 Clean Buttons Total) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Combined Tools Hub Modal Opener */}
        <button
          onClick={() => {
            setShowToolsHubModal(true);
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm cursor-pointer shadow-indigo-200"
          title="Open Lumina Tools Hub — Sensory regulation, executive function & wellness"
        >
          <LayoutGrid className="w-4 h-4 text-white" />
          <span>Tools 🧰</span>
        </button>

        {/* 2. Quick Break Button */}
        <button
          onClick={handleNeedBreak}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-200 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="I need a break"
        >
          <Coffee className="w-4 h-4 text-teal-600" />
          <span className="hidden sm:inline">Break</span>
        </button>

        {/* 3. Quick Chat Button */}
        <button
          onClick={() => setShowQuickPhrasesDrawer(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-2 border-indigo-200 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Quick phrases"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span className="hidden md:inline">Quick Chat</span>
        </button>

        {/* 4. Easy Emotion Alert Button */}
        {enabledFeatures?.emergencyAlertSOS !== false && (
          <button
            onClick={() => {
              setShowCaregiverAlertModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm active:scale-95 transition-all shadow-sm shadow-rose-200 cursor-pointer animate-pulse ring-2 ring-rose-400/50"
            title="Easy Alert Button - Send your emotion or ask for help"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Alert 🚨</span>
            <span className="sm:hidden">SOS</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* 5. Parent / Settings Lock Switch */}
        <button
          onClick={() => setShowPinModal(true)}
          className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs active:scale-95 transition-all flex items-center gap-1 border border-slate-200 ml-0.5 cursor-pointer"
          title={userAgeGroup === 'adult' ? 'Settings & Personal Hub (Protected by PIN)' : 'Parent & Caregiver Dashboard (Protected by PIN)'}
        >
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">
            {userAgeGroup === 'adult' ? 'Settings' : 'Grown-Up'}
          </span>
        </button>
      </div>
    </header>
  );
};
