import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Coffee, 
  Lock, 
  Sparkles, 
  AlertCircle,
  ShieldAlert,
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
    setShowCaregiverModal,
    connectionStatus,
    isCaregiverConnected,
    plansChanged,
    setShowPlansChangedModal,
    setChildView,
    activeTheme,
    enabledFeatures,
    userAgeGroup,
    setShowAboutMeModal,
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
    <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-200/60'} backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-300`}>
      {/* Left: Monogram Badge + Name + Time + Clean Star Count */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button 
          type="button"
          onClick={() => {
            setShowAboutMeModal(true);
            playChime('tap');
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 hover:bg-amber-200/80 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center border-2 border-amber-300/80 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          title="About Me ID Card"
          aria-label="About Me ID Card"
        >
          {childProfile.name.charAt(0).toUpperCase() || '🐝'}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 
              onClick={() => {
                setShowAboutMeModal(true);
                playChime('tap');
              }}
              className="text-sm sm:text-base font-extrabold text-[#1E293B] tracking-tight leading-none cursor-pointer hover:text-[#D97706] transition-colors"
              title="About Me ID Card"
            >
              {childProfile.name}
            </h1>
            <span className="text-[11px] font-semibold text-stone-500">
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
              className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 mt-0.5 cursor-pointer transition-colors w-fit"
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
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Plans Changed: {plansChanged.newPlanTitle}</span>
        </button>
      )}

      {/* Right: Consolidated, Clean Action Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Caregiver Live Connection Status Indicator Pill */}
        <button
          type="button"
          onClick={() => {
            setShowCaregiverModal(true);
            playChime('tap');
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] font-extrabold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
            isCaregiverConnected
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
          }`}
          title={isCaregiverConnected ? `🟢 Caregiver Online (${connectionStatus.peerName || 'Caregiver'})` : '⚪ Tap to link with Caregiver Phone/Tablet'}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isCaregiverConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
          <span className="hidden sm:inline">
            {isCaregiverConnected ? 'Caregiver Live' : 'Link Caregiver'}
          </span>
        </button>

        {/* 1. Accessibility Preferences */}
        <button
          onClick={() => {
            setShowAccessibilityModal(true);
            playChime('tap');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-[#FAF8F5] hover:bg-amber-50 text-[#1E293B] font-bold text-xs active:scale-95 transition-all cursor-pointer border border-amber-200/80 shadow-2xs"
          title="Accessibility Preferences (Colors, Sounds, Features)"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">Accessibility</span>
        </button>

        {/* 2. Break / Calming */}
        <button
          onClick={handleNeedBreak}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-[#E8F0EB] hover:bg-[#DCEAE1] text-[#2F5233] border border-[#82A792]/40 font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
          title="Need a Break"
        >
          <Coffee className="w-3.5 h-3.5 text-[#5B8266]" />
          <span className="hidden sm:inline">Break</span>
        </button>

        {/* 3. Emergency SOS Alert */}
        {enabledFeatures?.emergencyAlertSOS !== false && (
          <button
            onClick={() => {
              setShowCaregiverAlertModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
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
          className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 font-bold text-xs active:scale-95 transition-all flex items-center gap-1 border border-stone-200 cursor-pointer shadow-2xs"
          title={userAgeGroup === 'adult' ? 'Settings (Protected by PIN)' : 'Caregiver Dashboard (Protected by PIN)'}
        >
          <Lock className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden lg:inline">
            {userAgeGroup === 'adult' ? 'Settings' : 'Caregiver'}
          </span>
        </button>
      </div>
    </header>
  );
};
