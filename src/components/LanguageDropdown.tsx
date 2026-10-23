import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t, setLanguage } from '../services/translator';

import { AppLanguage } from '../types';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  flag: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'French (France)', nativeName: 'Français (France)' },
  { code: 'fr_ca', label: 'FR-CA', flag: '🇨🇦', name: 'French (Canada)', nativeName: 'Français (Canada)' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', label: 'EL', flag: '🇬🇷', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'ru', label: 'RU', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
  { code: 'vi', label: 'VI', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'zh', label: 'ZH', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', label: 'JA', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', label: 'KO', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
];

interface LanguageDropdownProps {
  buttonClassName?: string;
  className?: string;
  align?: 'left' | 'right' | 'auto';
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  buttonClassName,
  className = '',
  align = 'auto',
}) => {
  const { settings, updateSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [menuPlacement, setMenuPlacement] = useState<{
    left?: number | string;
    right?: number | string;
    transformOrigin?: string;
  }>({
    left: align === 'right' ? undefined : 0,
    right: align === 'right' ? 0 : undefined,
    transformOrigin: align === 'right' ? 'top right' : 'top left',
  });

  const calculatePosition = () => {
    if (typeof window === 'undefined') return;
    const triggerEl = dropdownRef.current;
    if (!triggerEl) return;

    if (align === 'left') {
      setMenuPlacement({ left: 0, right: undefined, transformOrigin: 'top left' });
      return;
    }
    if (align === 'right') {
      setMenuPlacement({ left: undefined, right: 0, transformOrigin: 'top right' });
      return;
    }

    const rect = triggerEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const menuWidth = 240;
    const margin = 8;

    const overflowLeftIfRightAligned = rect.right - menuWidth < margin;
    const overflowRightIfLeftAligned = rect.left + menuWidth > viewportWidth - margin;

    if (overflowLeftIfRightAligned && !overflowRightIfLeftAligned) {
      setMenuPlacement({ left: 0, right: undefined, transformOrigin: 'top left' });
    } else if (overflowRightIfLeftAligned && !overflowLeftIfRightAligned) {
      setMenuPlacement({ left: undefined, right: 0, transformOrigin: 'top right' });
    } else if (overflowLeftIfRightAligned && overflowRightIfLeftAligned) {
      let targetViewportLeft = rect.left;
      if (targetViewportLeft + menuWidth > viewportWidth - margin) {
        targetViewportLeft = Math.max(margin, viewportWidth - margin - menuWidth);
      }
      if (targetViewportLeft < margin) {
        targetViewportLeft = margin;
      }
      const relativeLeft = targetViewportLeft - rect.left;
      setMenuPlacement({
        left: relativeLeft,
        right: undefined,
        transformOrigin: relativeLeft < 0 ? 'top right' : 'top left',
      });
    } else {
      const isRightHalf = rect.left + rect.width / 2 > viewportWidth / 2;
      if (isRightHalf) {
        setMenuPlacement({ left: undefined, right: 0, transformOrigin: 'top right' });
      } else {
        setMenuPlacement({ left: 0, right: undefined, transformOrigin: 'top left' });
      }
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === settings.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      calculatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isOpen, align]);

  const handleSelectLanguage = async (code: LanguageOption['code']) => {
    playChime('tap');
    setIsOpen(false);
    await setLanguage(code);
    updateSettings({ language: code });
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    playChime('tap');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left shrink-0 ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        data-testid="language-dropdown-trigger"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('Select Language')}
        className={
          buttonClassName ||
          'flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[10px] sm:text-xs border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0'
        }
        title={t('Select Language')}
      >
        <span className="text-xs sm:text-sm leading-none select-none" aria-hidden="true">
          {currentLang.flag}
        </span>
        <span className="font-black text-amber-950 tracking-wide">
          {currentLang.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-900 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{
            left: menuPlacement.left !== undefined ? menuPlacement.left : undefined,
            right: menuPlacement.right !== undefined ? menuPlacement.right : undefined,
            transformOrigin: menuPlacement.transformOrigin || 'top left',
          }}
          className="absolute top-full mt-1.5 w-56 sm:w-60 max-w-[calc(100vw-1rem)] rounded-2xl bg-white shadow-xl border border-amber-200/90 z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900/60 border-b border-amber-100 mb-1">
            <Globe className="w-3 h-3 text-amber-700/70" />
            <span>{t('Language')}</span>
          </div>

          {/* Options list */}
          <div className="space-y-0.5 max-h-80 overflow-y-auto overscroll-contain">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  data-testid={`lang-option-${lang.code}`}
                  role="menuitem"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100/90 text-amber-950 font-black shadow-2xs border border-amber-300/80'
                      : 'hover:bg-amber-50/80 text-stone-700 hover:text-stone-900 font-bold border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none shrink-0" aria-hidden="true">
                      {lang.flag}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black truncate text-stone-900 leading-tight">
                        {lang.nativeName}
                      </span>
                      {lang.name !== lang.nativeName && (
                        <span className="text-[10px] text-stone-500 font-semibold truncate leading-none mt-0.5">
                          {lang.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-amber-200/80 text-amber-950'
                          : 'bg-stone-100 text-stone-600 border border-stone-200/60'
                      }`}
                    >
                      {lang.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
