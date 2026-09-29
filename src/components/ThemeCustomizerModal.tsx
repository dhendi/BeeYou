import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Palette } from 'lucide-react';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import { playChime } from '../utils/audio';

export const ThemeCustomizerModal: React.FC = () => {
  const { showThemeModal, setShowThemeModal } = useApp();

  if (!showThemeModal) return null;

  const handleClose = () => {
    setShowThemeModal(false);
    playChime('tap');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className="bg-slate-50 w-full max-w-4xl max-h-[92dvh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Bar */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-lg">
              🎨
            </span>
            <div>
              <h2 id="theme-modal-title" className="font-black text-slate-800 text-base sm:text-lg leading-tight">
                Lumina Themes & Customizer
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pick ready-made themes or build your own special world
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            aria-label="Close themes modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <ThemeShopAndStudio onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};
