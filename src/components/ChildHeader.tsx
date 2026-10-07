import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Sparkles, 
  AlertCircle,
  Crown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { setActiveDeviceView } from '../services/authService';

export const ChildHeader: React.FC = () => {
  const {
    childProfile,
    worldState,
    setShowPinModal,
    setIsParentMode,
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
  } = useApp();

  return (
    <header className={`${activeTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-200/60'} backdrop-blur-md px-2.5 sm:px-5 py-2 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-300`}>
      {/* Left: Monogram Badge + Name + Stars */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button 
          type="button"
          onClick={() => {
            setShowAboutMeModal(true);
            playChime('tap');
          }}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center border border-amber-300 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          title="About Me ID Card"
          aria-label="About Me ID Card"
        >
          {childProfile.name ? childProfile.name.charAt(0).toUpperCase() : 'B'}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 
            onClick={() => {
              setShowAboutMeModal(true);
              playChime('tap');
            }}
            className="text-sm sm:text-base font-extrabold text-[#1E293B] tracking-tight leading-none truncate cursor-pointer hover:text-[#D97706] transition-colors"
            title="About Me ID Card"
          >
            {childProfile.name}
          </h1>
        </div>
      </div>

      {/* Center: Plans Changed Alert Indicator (if active) */}
      {plansChanged.active && (
        <button
          onClick={() => setShowPlansChangedModal(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">Plans Changed</span>
        </button>
      )}

      {/* Right: Streamlined Compact Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Compact Live Connection Indicator Pill */}
        <button
          type="button"
          onClick={() => {
            setShowCaregiverModal(true);
            playChime('tap');
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] sm:text-xs font-black border transition-all cursor-pointer shadow-2xs active:scale-95 ${
            isCaregiverConnected
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
          }`}
          title={isCaregiverConnected ? `Caregiver Online (${connectionStatus.peerName || 'Caregiver'})` : 'Tap to link with Caregiver'}
        >
          {isCaregiverConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
              <Wifi className="w-3 h-3 text-white shrink-0" />
              <span className="hidden sm:inline">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="hidden sm:inline">Link</span>
            </>
          )}
        </button>

        {/* Compact PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Switch to Caregiver Hub */}
        <button
          type="button"
          onClick={() => {
            playChime('tap');
            setIsParentMode(true);
            setActiveDeviceView('caregiver');
            try {
              sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
              localStorage.setItem('beeyou_active_device_view', 'caregiver');
            } catch {}
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] sm:text-xs active:scale-95 transition-all cursor-pointer shadow-xs border border-amber-600"
          title="Open Caregiver Hub"
        >
          <Crown className="w-3 h-3" />
          <span>Hub</span>
        </button>

        {/* PIN / Lock */}
        <button
          onClick={() => setShowPinModal(true)}
          className="p-1.5 sm:p-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 text-stone-600 font-bold text-xs active:scale-95 transition-all flex items-center border border-stone-200 cursor-pointer shadow-2xs"
          title={userAgeGroup === 'adult' ? 'Settings (Protected by PIN)' : 'Caregiver PIN Lock'}
        >
          <Lock className="w-3 h-3 text-stone-500" />
        </button>
      </div>
    </header>
  );
};
