import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

export interface LanguageOption {
  code: 'en' | 'fil' | 'es' | 'fr' | 'ja';
  label: string;
  flag: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'fil', label: 'FIL', flag: '🇵🇭', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'fr', label: 'FR', flag: '🇨🇦', name: 'French', nativeName: 'Français' },
  { code: 'ja', label: 'JA', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
];

interface LanguageDropdownProps {
  buttonClassName?: string;
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  buttonClassName,
  className = '',
}) => {
  const { settings, updateSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === settings.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) return;

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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: LanguageOption['code']) => {
    updateSettings({ language: code });
    playChime('tap');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left shrink-0 ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          playChime('tap');
        }}
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
          className="absolute right-0 top-full mt-1.5 w-48 sm:w-52 rounded-2xl bg-white shadow-xl border border-amber-200/90 z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          {/* Header indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900/60 border-b border-amber-100 mb-1">
            <Globe className="w-3 h-3 text-amber-700/70" />
            <span>{t('Language')}</span>
          </div>

          {/* Options list */}
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
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
