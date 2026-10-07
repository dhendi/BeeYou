import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Globe } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

export interface LanguageOption {
  code: 'en' | 'fil' | 'es' | 'fr' | 'ja';
  flag: string;
  name: string;
  nativeName: string;
  badge: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    flag: '🇺🇸',
    name: 'English',
    nativeName: 'English (US)',
    badge: 'EN'
  },
  {
    code: 'fil',
    flag: '🇵🇭',
    name: 'Filipino',
    nativeName: 'Wikang Filipino / Tagalog',
    badge: 'FIL'
  },
  {
    code: 'es',
    flag: '🇪🇸',
    name: 'Spanish',
    nativeName: 'Español',
    badge: 'ES'
  },
  {
    code: 'fr',
    flag: '🇨🇦',
    name: 'French (Canadian)',
    nativeName: 'Français (Canada / QC)',
    badge: 'FR'
  },
  {
    code: 'ja',
    flag: '🇯🇵',
    name: 'Japanese',
    nativeName: '日本語',
    badge: 'JA'
  }
];

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings } = useApp();

  if (!isOpen) return null;

  const handleSelectLanguage = (langCode: 'en' | 'fil' | 'es' | 'fr' | 'ja') => {
    updateSettings({ language: langCode });
    playChime('star');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border-2 border-stone-200 dark:border-stone-800 space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl shadow-inner">
              <Globe className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 id="language-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-stone-100">
                {t('Choose Language')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-stone-400 font-medium">
                {t('Select your preferred language')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Options List */}
        <div className="space-y-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = settings.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-98 cursor-pointer text-left ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-slate-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  <div>
                    <div className="font-black text-sm flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        {lang.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-stone-400 font-medium">
                      {lang.name}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border border-stone-300 dark:border-stone-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <p className="text-[11px] text-center text-slate-400 dark:text-stone-500 font-medium pt-1">
          {t('Instant zero-download speech and vocabulary translation')}
        </p>
      </div>
    </div>
  );
};
