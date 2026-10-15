import React, { useState, useEffect } from 'react';
import { 
  Star, 
  HelpCircle, 
  CheckCircle2, 
  GraduationCap, 
  Compass, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';
import { LanguageDropdown } from '../LanguageDropdown';
import { AacCoreSticker } from '../icons/JournalStickers';

interface AACExperiencePromptModalProps {
  isOpen: boolean;
  onSelectKnowledgeable: () => void;
  onSelectNewToAAC: () => void;
  onClose?: () => void;
}

export const AACExperiencePromptModal: React.FC<AACExperiencePromptModalProps> = ({
  isOpen,
  onSelectKnowledgeable,
  onSelectNewToAAC,
  onClose,
}) => {
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick(prev => prev + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-prompt-title"
      aria-describedby="aac-prompt-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-amber-950/45 backdrop-blur-sm animate-in fade-in duration-200 select-none text-slate-800"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border-3 border-amber-300 rounded-3xl shadow-[0_20px_50px_rgba(217,119,6,0.22)] p-5 sm:p-7 space-y-5 animate-in zoom-in-95">
        
        {/* Language selector in top corner */}
        <div className="flex justify-end items-center mb-1">
          <LanguageDropdown />
        </div>

        {/* Top Decorative Mascot / Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            <AacCoreSticker className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider">
            {t('AAC Speech Board')}
          </span>
          <h2
            id="aac-prompt-title"
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
          >
            {t('Do you already know how AAC works?')}
          </h2>
          <p
            id="aac-prompt-description"
            className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed"
          >
            {t('BeeYou provides a clinical visual speech matrix. Tell us your experience level so we can give you the best start:')}
          </p>
        </div>

        {/* Prominent Caregiver Reassurance Notice */}
        <div 
          role="note"
          aria-label="Caregiver instructions notice"
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200/90 text-amber-950 text-xs font-semibold flex items-start gap-3 shadow-xs"
        >
          <div className="p-2 rounded-xl bg-amber-200 text-amber-800 shrink-0">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 leading-snug">
            <span className="font-black text-amber-900 block text-xs">
              {t('Instructions Always Available')}
            </span>
            <p className="text-amber-900/90 text-[11px] sm:text-xs font-medium">
              {t('Instructions for using the AAC will always be available in the Caregiver App (tap the Help icon anytime in the top header).')}
            </p>
          </div>
        </div>

        {/* Two Choice Action Cards */}
        <div className="space-y-3 pt-1">
          {/* Choice 1: No, I'm new (Trigger interactive tour) */}
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onSelectNewToAAC();
            }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-left flex items-center justify-between gap-3 shadow-[0_5px_0_0_#b45309,0_8px_16px_rgba(217,119,6,0.25)] active:translate-y-1 active:shadow-xs transition-all cursor-pointer group focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-label="No, I am new to AAC. Show me how it works with the interactive tour."
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="block font-black text-sm sm:text-base text-white tracking-tight">
                  {t("No, I'm New — Show Me How It Works")}
                </span>
                <span className="block text-[11px] sm:text-xs text-amber-100 font-medium">
                  {t('Takes 45s • Interactive 6-step cause & effect tour')}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-black shrink-0 hidden sm:inline">
              {t('Start Tour')} ➜
            </span>
          </button>

          {/* Choice 2: Yes, I know how AAC works (Jump directly to full matrix) */}
          <button
            type="button"
            onClick={() => {
              playChime('complete');
              onSelectKnowledgeable();
            }}
            className="w-full p-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-amber-400 text-stone-800 text-left flex items-center justify-between gap-3 shadow-[0_4px_0_0_#d6d3d1,0_6px_14px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-xs transition-all cursor-pointer group focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            aria-label="Yes, I know how AAC works. Take me straight to the full AAC board."
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-amber-700" aria-hidden="true" />
              </div>
              <div>
                <span className="block font-black text-sm sm:text-base text-stone-900 tracking-tight">
                  {t('Yes, I Know — Open Full AAC Board')}
                </span>
                <span className="block text-[11px] sm:text-xs text-stone-500 font-medium">
                  {t('Skip the tour • Jump straight into the full vocabulary matrix')}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black shrink-0 hidden sm:inline">
              {t('Full Board')}
            </span>
          </button>
        </div>

        {/* Optional Skip/Close Button if user wants to close without choosing */}
        {onClose && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-400 hover:text-stone-600 font-bold underline transition-colors cursor-pointer"
            >
              {t('Remind me later')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
