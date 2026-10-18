import React from 'react';
import { useApp } from '../context/AppContext';
import { X, RotateCcw, Palette } from 'lucide-react';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import { playChime } from '../utils/audio';
import { getThemeCustomizerHeaderStyles } from '../utils/themeWidgetHelper';

export const ThemeCustomizerModal: React.FC = () => {
  const { showThemeModal, setShowThemeModal, activeThemeId, activeTheme, setTheme } = useApp();

  if (!showThemeModal) return null;

  const headerStyles = getThemeCustomizerHeaderStyles(activeTheme);

  const handleClose = () => {
    setShowThemeModal(false);
    playChime('tap');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className={`bg-slate-50 w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 ${headerStyles.modalBorder} animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Top Bar */}
        <div className={`${headerStyles.topBarGradient} px-4 sm:px-6 py-3 border-b ${headerStyles.topBarBorder} flex items-center justify-between shrink-0 transition-all duration-300`}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/80 shadow-xs flex items-center justify-center">
              <Palette className="w-5 h-5 text-amber-600" />
            </span>
            <div>
              <h2 id="theme-modal-title" className={`font-black ${headerStyles.topBarText} text-base sm:text-lg leading-tight`}>
                BeeYou Themes & Customizer
              </h2>
              <p className={`text-xs ${headerStyles.topBarSubtext} font-medium`}>
                Pick ready-made themes or customize & edit any theme's colors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeThemeId !== 'theme-classic' && (
              <button
                type="button"
                onClick={() => {
                  setTheme('theme-classic');
                  playChime('tap');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white text-slate-900 font-black text-xs flex items-center gap-1.5 border border-white/60 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Reset to default BeeYou yellow theme"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Reset to Default</span>
                <span className="sm:hidden">Default</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/30 hover:bg-white/60 text-current transition-colors cursor-pointer"
              aria-label="Close themes modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <ThemeShopAndStudio onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};
