import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Coffee, 
  Lock, 
  Sparkles, 
  AlertCircle,
  ShieldAlert,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

export const ChildHeader: React.FC = () => {
  const {
    childProfile,
    worldState,
    setShowPinModal,
    setShowCopingToolkit,
    setShowCaregiverAlertModal,
    plansChanged,
    setShowPlansChangedModal,
    setChildView,
    activeTheme,
    enabledFeatures,
    userAgeGroup,
    setShowAboutMeModal,
    setShowToolsHubModal,
    setShowAccessibilityModal,
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
    playChime('tap');
    setShowCopingToolkit(true);
  };

  return (
    <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-slate-200/80'} backdrop-blur px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-300`}>
      {/* Left: Monogram Badge + Name + Time + Clean Star Count */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button 
          type="button"
          onClick={() => {
            setShowAboutMeModal(true);
            playChime('tap');
          }}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-black text-xs sm:text-sm flex items-center justify-center border border-indigo-200 shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
          title="About Me ID Card"
          aria-label="About Me ID Card"
        >
          {childProfile.name.charAt(0).toUpperCase() || '✨'}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 
              onClick={() => {
                setShowAboutMeModal(true);
                playChime('tap');
              }}
              className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-none cursor-pointer hover:text-indigo-600 transition-colors"
              title="About Me ID Card"
            >
              {childProfile.name}
            </h1>
            <span className="text-[11px] font-semibold text-slate-400">
              {currentTime}
            </span>
          </div>

          {enabledFeatures?.starsAndRewards !== false && (
            <button
              type="button"
              onClick={() => {
                setChildView('rewards');
                playChime('star');
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 mt-0.5 cursor-pointer transition-colors w-fit"
              title="View earned rewards"
            >
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{worldState.stars} Stars</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Plans Changed Indicator (if active) */}
      {plansChanged.active && (
        <button
          onClick={() => setShowPlansChangedModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Plans Changed: {plansChanged.newPlanTitle}</span>
        </button>
      )}

      {/* Right: Consolidated, Clean Action Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 1. Tools Hub */}
        <button
          onClick={() => {
            setShowToolsHubModal(true);
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all cursor-pointer border border-slate-200"
          title="Tools Hub"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
          <span>Tools</span>
        </button>

        {/* 1b. Accessibility & Sensory Preferences */}
        <button
          onClick={() => {
            setShowAccessibilityModal(true);
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs active:scale-95 transition-all cursor-pointer border border-indigo-200"
          title="Accessibility & Sensory Preferences (Colors, Sounds, Features)"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Sensory</span>
        </button>

        {/* 2. Break / Calming */}
        <button
          onClick={handleNeedBreak}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          title="Need a Break"
        >
          <Coffee className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">Break</span>
        </button>

        {/* 3. Emergency SOS Alert */}
        {enabledFeatures?.emergencyAlertSOS !== false && (
          <button
            onClick={() => {
              setShowCaregiverAlertModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Send Alert to Caregiver"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Alert</span>
            <span className="sm:hidden">SOS</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* 4. Parent / Settings Lock */}
        <button
          onClick={() => setShowPinModal(true)}
          className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs active:scale-95 transition-all flex items-center gap-1 border border-slate-200 cursor-pointer"
          title={userAgeGroup === 'adult' ? 'Settings (Protected by PIN)' : 'Caregiver Dashboard (Protected by PIN)'}
        >
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline">
            {userAgeGroup === 'adult' ? 'Settings' : 'Caregiver'}
          </span>
        </button>
      </div>
    </header>
  );
};
