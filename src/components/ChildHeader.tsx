import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Star, AlertCircle, Crown, Wifi, WifiOff, HelpCircle, SlidersHorizontal } from 'lucide-react';
import { playChime } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { setActiveDeviceView } from '../services/authService';
import { t } from '../services/translator';

import { LanguageDropdown } from './LanguageDropdown';
import { CaregiverLockShield } from './CaregiverLockShield';
import { AppTheme } from '../types';

export interface ChildHeaderProps {
  previewTheme?: AppTheme;
}

export const ChildHeader: React.FC<ChildHeaderProps> = ({ previewTheme }) => {
  const {
    settings,
    updateSettings,
    childProfile,
    setShowPinModal,
    setIsParentMode,
    setShowCaregiverModal,
    connectionStatus,
    isCaregiverConnected,
    plansChanged,
    setShowPlansChangedModal,
    setShowAccessibilityModal,
    setChildView,
    activeTheme,
    enabledFeatures,
    userAgeGroup,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const effectiveTheme = previewTheme || activeTheme;

  return (
    <header className={`${effectiveTheme?.palette?.headerBg || 'bg-white/95 border-b border-amber-200/60'} backdrop-blur-md px-2.5 sm:px-5 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pb-2 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-300`}>
      {/* Left: Child Name */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <h1 className="text-sm sm:text-base font-extrabold text-[#1E293B] tracking-tight leading-none truncate">
          {childProfile.name}
        </h1>
      </div>

      {/* Center: Plans Changed Alert Indicator (if active) */}
      {plansChanged.active && (
        <button
          onClick={() => setShowPlansChangedModal(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">{t('Plans Changed')}</span>
        </button>
      )}

      {/* Right: Streamlined Compact Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageDropdown />

          {/* Compact Live Connection Indicator Pill */}
          <button
            type="button"
            onClick={() => {
              if (!isPremium) {
                triggerUpgrade('Caregiver Remote Live Sync & Portal is a BeeYou Plus feature! Start your 15-day free trial.');
                return;
              }
              setShowCaregiverModal(true);
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] sm:text-xs font-black border transition-all cursor-pointer shadow-2xs active:scale-95 ${
              isCaregiverConnected
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
            }`}
            title={isCaregiverConnected ? `${t('Live')} (${connectionStatus.peerName || 'Caregiver'})` : t('Link')}
          >
            {isCaregiverConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                <Wifi className="w-3 h-3 text-white shrink-0" />
                <span className="hidden sm:inline">{t('Live')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="hidden sm:inline">{t('Link')}</span>
              </>
            )}
          </button>

          {/* Persistent Caregiver Help Hub Trigger (Subtle Bee Button) */}
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              window.dispatchEvent(new CustomEvent('beeyou_open_caregiver_help_hub'));
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl ${effectiveTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 ${effectiveTheme?.palette?.textAccent || 'text-amber-950'} font-black text-[10px] sm:text-xs border ${effectiveTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs active:scale-95 transition-all cursor-pointer`}
            title="Caregiver Help Hub (Quick Guides & Ergonomics)"
            aria-label="Caregiver Help Hub"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span className={`hidden sm:inline font-bold ${effectiveTheme?.palette?.textAccent || 'text-amber-800'}`}>{t('Help')}</span>
          </button>

          {/* Sensory & Accessibility Preferences Hub Button */}
          <button
            type="button"
            onClick={() => {
              setShowAccessibilityModal(true);
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl ${effectiveTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 ${effectiveTheme?.palette?.textAccent || 'text-amber-950'} font-black text-[10px] sm:text-xs border ${effectiveTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs active:scale-95 transition-all cursor-pointer`}
            title={t('Sensory & Accessibility Preferences')}
            aria-label="Sensory & Accessibility Preferences"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span className={`hidden sm:inline font-bold ${effectiveTheme?.palette?.textAccent || 'text-amber-800'}`}>{t('Sensory')}</span>
          </button>
        </div>

        {/* Compact PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Switch to Caregiver Hub */}
        <button
          type="button"
          onClick={() => {
            playChime('tap');
            setActiveDeviceView('caregiver');
            try {
              sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
              localStorage.setItem('beeyou_active_device_view', 'caregiver');
            } catch {}
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
            }
          }}
          className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl ${effectiveTheme?.palette?.primaryBg || 'bg-amber-500'} ${effectiveTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white font-black text-[11px] sm:text-xs active:scale-95 transition-all cursor-pointer shadow-xs border ${effectiveTheme?.palette?.primaryBorder || 'border-amber-600'}`}
          title="Open Caregiver Hub"
        >
          <Crown className="w-3 h-3" />
          <span>{t('Hub')}</span>
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
