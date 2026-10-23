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
import { useApp } from '../../context/AppContext';

interface AACExperiencePromptModalProps {
  isOpen: boolean;
  onSelectKnowledgeable: () => void;
  onSelectNewToAAC: () => void;
  onClose?: () => void;
}

function getPromptModalThemeStyles(theme?: { category?: string; id?: string }) {
  const cat = theme?.category;
  const id = theme?.id;

  if (id === 'theme-turtle' || cat === 'turtle') {
    return {
      cardBorder: 'border-teal-400',
      shadow: 'shadow-[0_20px_50px_rgba(13,148,136,0.22)]',
      pillBadge: 'bg-teal-100 text-teal-900',
      reassuranceCard: 'bg-teal-50/90 border-2 border-teal-200/90 text-teal-950',
      reassuranceIcon: 'bg-teal-200 text-teal-800',
      reassuranceTitle: 'text-teal-900',
      reassuranceText: 'text-teal-900/90',
      btn1Bg: 'bg-gradient-to-r from-teal-600 via-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#0f766e,0_8px_16px_rgba(13,148,136,0.25)]',
      btn1Ring: 'focus-visible:ring-teal-400',
      btn1Sub: 'text-teal-100',
      btn2HoverBorder: 'hover:border-teal-400',
      btn2Ring: 'focus-visible:ring-teal-500/70',
      btn2IconBox: 'bg-teal-100 text-teal-800',
      btn2Icon: 'text-teal-700',
      btn2Badge: 'bg-teal-50 text-teal-900 border border-teal-200',
      remindHover: 'hover:text-teal-700',
    };
  }

  if (id === 'theme-dino' || cat === 'dinosaur') {
    return {
      cardBorder: 'border-emerald-400',
      shadow: 'shadow-[0_20px_50px_rgba(22,163,74,0.22)]',
      pillBadge: 'bg-emerald-100 text-emerald-900',
      reassuranceCard: 'bg-emerald-50/90 border-2 border-emerald-200/90 text-emerald-950',
      reassuranceIcon: 'bg-emerald-200 text-emerald-800',
      reassuranceTitle: 'text-emerald-900',
      reassuranceText: 'text-emerald-900/90',
      btn1Bg: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#15803d,0_8px_16px_rgba(22,163,74,0.25)]',
      btn1Ring: 'focus-visible:ring-emerald-400',
      btn1Sub: 'text-emerald-100',
      btn2HoverBorder: 'hover:border-emerald-400',
      btn2Ring: 'focus-visible:ring-emerald-500/70',
      btn2IconBox: 'bg-emerald-100 text-emerald-800',
      btn2Icon: 'text-emerald-700',
      btn2Badge: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
      remindHover: 'hover:text-emerald-700',
    };
  }

  if (id === 'theme-frog' || cat === 'frog') {
    return {
      cardBorder: 'border-lime-400',
      shadow: 'shadow-[0_20px_50px_rgba(101,163,13,0.22)]',
      pillBadge: 'bg-lime-100 text-lime-900',
      reassuranceCard: 'bg-lime-50/90 border-2 border-lime-200/90 text-lime-950',
      reassuranceIcon: 'bg-lime-200 text-lime-800',
      reassuranceTitle: 'text-lime-900',
      reassuranceText: 'text-lime-900/90',
      btn1Bg: 'bg-gradient-to-r from-lime-600 via-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#4d7c0f,0_8px_16px_rgba(101,163,13,0.25)]',
      btn1Ring: 'focus-visible:ring-lime-400',
      btn1Sub: 'text-lime-100',
      btn2HoverBorder: 'hover:border-lime-400',
      btn2Ring: 'focus-visible:ring-lime-500/70',
      btn2IconBox: 'bg-lime-100 text-lime-800',
      btn2Icon: 'text-lime-700',
      btn2Badge: 'bg-lime-50 text-lime-900 border border-lime-200',
      remindHover: 'hover:text-lime-700',
    };
  }

  if (id === 'theme-trains' || cat === 'train') {
    return {
      cardBorder: 'border-sky-300',
      shadow: 'shadow-[0_20px_50px_rgba(2,132,199,0.22)]',
      pillBadge: 'bg-sky-100 text-sky-900',
      reassuranceCard: 'bg-sky-50/90 border-2 border-sky-200/90 text-sky-950',
      reassuranceIcon: 'bg-sky-200 text-sky-800',
      reassuranceTitle: 'text-sky-900',
      reassuranceText: 'text-sky-900/90',
      btn1Bg: 'bg-gradient-to-r from-sky-600 via-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#0369a1,0_8px_16px_rgba(2,132,199,0.25)]',
      btn1Ring: 'focus-visible:ring-sky-400',
      btn1Sub: 'text-sky-100',
      btn2HoverBorder: 'hover:border-sky-400',
      btn2Ring: 'focus-visible:ring-sky-500/70',
      btn2IconBox: 'bg-sky-100 text-sky-800',
      btn2Icon: 'text-sky-700',
      btn2Badge: 'bg-sky-50 text-sky-900 border border-sky-200',
      remindHover: 'hover:text-sky-700',
    };
  }

  if (id === 'theme-space' || cat === 'space') {
    return {
      cardBorder: 'border-purple-300',
      shadow: 'shadow-[0_20px_50px_rgba(124,58,237,0.22)]',
      pillBadge: 'bg-purple-100 text-purple-900',
      reassuranceCard: 'bg-purple-50/90 border-2 border-purple-200/90 text-purple-950',
      reassuranceIcon: 'bg-purple-200 text-purple-800',
      reassuranceTitle: 'text-purple-900',
      reassuranceText: 'text-purple-900/90',
      btn1Bg: 'bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#6d28d9,0_8px_16px_rgba(124,58,237,0.25)]',
      btn1Ring: 'focus-visible:ring-purple-400',
      btn1Sub: 'text-purple-100',
      btn2HoverBorder: 'hover:border-purple-400',
      btn2Ring: 'focus-visible:ring-purple-500/70',
      btn2IconBox: 'bg-purple-100 text-purple-800',
      btn2Icon: 'text-purple-700',
      btn2Badge: 'bg-purple-50 text-purple-900 border border-purple-200',
      remindHover: 'hover:text-purple-700',
    };
  }

  if (id === 'theme-ocean' || cat === 'ocean') {
    return {
      cardBorder: 'border-cyan-300',
      shadow: 'shadow-[0_20px_50px_rgba(8,145,178,0.22)]',
      pillBadge: 'bg-cyan-100 text-cyan-900',
      reassuranceCard: 'bg-cyan-50/90 border-2 border-cyan-200/90 text-cyan-950',
      reassuranceIcon: 'bg-cyan-200 text-cyan-800',
      reassuranceTitle: 'text-cyan-900',
      reassuranceText: 'text-cyan-900/90',
      btn1Bg: 'bg-gradient-to-r from-cyan-600 via-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#0e7490,0_8px_16px_rgba(8,145,178,0.25)]',
      btn1Ring: 'focus-visible:ring-cyan-400',
      btn1Sub: 'text-cyan-100',
      btn2HoverBorder: 'hover:border-cyan-400',
      btn2Ring: 'focus-visible:ring-cyan-500/70',
      btn2IconBox: 'bg-cyan-100 text-cyan-800',
      btn2Icon: 'text-cyan-700',
      btn2Badge: 'bg-cyan-50 text-cyan-900 border border-cyan-200',
      remindHover: 'hover:text-cyan-700',
    };
  }

  if (id === 'theme-racing' || cat === 'racing') {
    return {
      cardBorder: 'border-zinc-400',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.25)]',
      pillBadge: 'bg-zinc-100 text-zinc-900',
      reassuranceCard: 'bg-zinc-50/90 border-2 border-zinc-200/90 text-zinc-950',
      reassuranceIcon: 'bg-zinc-200 text-zinc-800',
      reassuranceTitle: 'text-zinc-900',
      reassuranceText: 'text-zinc-800',
      btn1Bg: 'bg-gradient-to-r from-zinc-900 via-neutral-900 to-black hover:from-black hover:to-zinc-900',
      btn1Shadow: 'shadow-[0_5px_0_0_#09090b,0_8px_16px_rgba(0,0,0,0.3)]',
      btn1Ring: 'focus-visible:ring-zinc-400',
      btn1Sub: 'text-zinc-300',
      btn2HoverBorder: 'hover:border-zinc-400',
      btn2Ring: 'focus-visible:ring-zinc-500/70',
      btn2IconBox: 'bg-zinc-100 text-zinc-800',
      btn2Icon: 'text-zinc-700',
      btn2Badge: 'bg-zinc-50 text-zinc-900 border border-zinc-200',
      remindHover: 'hover:text-zinc-700',
    };
  }

  if (id === 'theme-fantasy' || cat === 'fantasy' || cat === 'magic') {
    return {
      cardBorder: 'border-pink-300',
      shadow: 'shadow-[0_20px_50px_rgba(219,39,119,0.22)]',
      pillBadge: 'bg-pink-100 text-pink-900',
      reassuranceCard: 'bg-pink-50/90 border-2 border-pink-200/90 text-pink-950',
      reassuranceIcon: 'bg-pink-200 text-pink-800',
      reassuranceTitle: 'text-pink-900',
      reassuranceText: 'text-pink-900/90',
      btn1Bg: 'bg-gradient-to-r from-pink-600 via-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700',
      btn1Shadow: 'shadow-[0_5px_0_0_#be185d,0_8px_16px_rgba(219,39,119,0.25)]',
      btn1Ring: 'focus-visible:ring-pink-400',
      btn1Sub: 'text-pink-100',
      btn2HoverBorder: 'hover:border-pink-400',
      btn2Ring: 'focus-visible:ring-pink-500/70',
      btn2IconBox: 'bg-pink-100 text-pink-800',
      btn2Icon: 'text-pink-700',
      btn2Badge: 'bg-pink-50 text-pink-900 border border-pink-200',
      remindHover: 'hover:text-pink-700',
    };
  }

  // Default Honey (Tactile Silicone & Oat Milk / Classic)
  return {
    cardBorder: 'border-amber-300',
    shadow: 'shadow-[0_20px_50px_rgba(217,119,6,0.22)]',
    pillBadge: 'bg-amber-100 text-amber-900',
    reassuranceCard: 'bg-amber-50/90 border-2 border-amber-200/90 text-amber-950',
    reassuranceIcon: 'bg-amber-200 text-amber-800',
    reassuranceTitle: 'text-amber-900',
    reassuranceText: 'text-amber-900/90',
    btn1Bg: 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    btn1Shadow: 'shadow-[0_5px_0_0_#b45309,0_8px_16px_rgba(217,119,6,0.25)]',
    btn1Ring: 'focus-visible:ring-amber-400',
    btn1Sub: 'text-amber-100',
    btn2HoverBorder: 'hover:border-amber-400',
    btn2Ring: 'focus-visible:ring-amber-500/70',
    btn2IconBox: 'bg-amber-100 text-amber-800',
    btn2Icon: 'text-amber-700',
    btn2Badge: 'bg-amber-50 text-amber-900 border border-amber-200',
    remindHover: 'hover:text-amber-700',
  };
}

function getAacPromptModalIcon(theme?: { category?: string; id?: string } | null): string {
  const cat = theme?.category;
  const id = theme?.id;
  if (id === 'theme-turtle' || cat === 'turtle') return '/assets/stickers/turtle_lily_pads.webp';
  if (id === 'theme-dino' || cat === 'dinosaur') return '/assets/stickers/dino_amber_star_core.webp';
  if (id === 'theme-frog' || cat === 'frog') return '/assets/stickers/frog_lotus_star_core.webp';
  if (id === 'theme-fantasy' || cat === 'fantasy' || cat === 'magic') return '/assets/stickers/fairytale_star_gold.webp';
  if (id === 'theme-space' || cat === 'space') return '/assets/stickers/space_star_gold.webp';
  if (id === 'theme-trains' || cat === 'train') return '/assets/stickers/train_star_gold.webp';
  if (id === 'theme-ocean' || cat === 'ocean') return '/assets/stickers/ocean_golden_starfish_badge.webp';
  if (id === 'theme-racing' || cat === 'racing') return '/assets/stickers/racing_star_gold.webp';
  return '/assets/stickers/aac_core.webp';
}

export const AACExperiencePromptModal: React.FC<AACExperiencePromptModalProps> = ({
  isOpen,
  onSelectKnowledgeable,
  onSelectNewToAAC,
  onClose,
}) => {
  const { activeTheme } = useApp();
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick(prev => prev + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  if (!isOpen) return null;

  const tStyles = getPromptModalThemeStyles(activeTheme);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aac-prompt-title"
      aria-describedby="aac-prompt-description"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 select-none text-slate-800"
    >
      <div className={`relative w-full max-w-lg bg-[#FAF8F5] border-3 ${tStyles.cardBorder} rounded-3xl ${tStyles.shadow} p-5 sm:p-7 space-y-5 animate-in zoom-in-95`}>
        
        {/* Language selector in top corner */}
        <div className="flex justify-end items-center mb-1">
          <LanguageDropdown align="right" />
        </div>

        {/* Top Decorative Mascot / Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            <img
              src={getAacPromptModalIcon(activeTheme)}
              alt={t('AAC Speech Board')}
              className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
            />
          </div>
          <span className={`inline-block px-3 py-1 rounded-full ${tStyles.pillBadge} font-black text-xs uppercase tracking-wider`}>
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
          className={`p-3.5 sm:p-4 rounded-2xl ${tStyles.reassuranceCard} text-xs font-semibold flex items-start gap-3 shadow-xs`}
        >
          <div className={`p-2 rounded-xl ${tStyles.reassuranceIcon} shrink-0`}>
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 leading-snug">
            <span className={`font-black ${tStyles.reassuranceTitle} block text-xs`}>
              {t('Instructions Always Available')}
            </span>
            <p className={`${tStyles.reassuranceText} text-[11px] sm:text-xs font-medium`}>
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
            className={`w-full p-4 rounded-2xl ${tStyles.btn1Bg} text-white text-left flex items-center justify-between gap-3 ${tStyles.btn1Shadow} active:translate-y-1 active:shadow-xs transition-all cursor-pointer group ${tStyles.btn1Ring} focus-visible:outline-none`}
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
                <span className={`block text-[11px] sm:text-xs ${tStyles.btn1Sub} font-medium`}>
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
            className={`w-full p-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 ${tStyles.btn2HoverBorder} text-stone-800 text-left flex items-center justify-between gap-3 shadow-[0_4px_0_0_#d6d3d1,0_6px_14px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-xs transition-all cursor-pointer group ${tStyles.btn2Ring} focus-visible:outline-none`}
            aria-label="Yes, I know how AAC works. Take me straight to the full AAC board."
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl ${tStyles.btn2IconBox} flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform`}>
                <CheckCircle2 className={`w-6 h-6 ${tStyles.btn2Icon}`} aria-hidden="true" />
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
            <span className={`px-2.5 py-1 rounded-xl ${tStyles.btn2Badge} text-xs font-black shrink-0 hidden sm:inline`}>
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
              className={`text-xs text-stone-400 ${tStyles.remindHover} font-bold underline transition-colors cursor-pointer`}
            >
              {t('Remind me later')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

