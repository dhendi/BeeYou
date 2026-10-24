import React from 'react';
import { X, ExternalLink, Leaf } from 'lucide-react';
import { playChime } from '../../utils/audio';
import { MULBERRY_ATTRIBUTION } from '../../services/symbolService';
import { t } from '../../services/translator';

export interface MulberryAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExternalLink: (target: { url: string; title: string }) => void;
}

export const MulberryAttributionModal: React.FC<MulberryAttributionModalProps> = ({
  isOpen,
  onClose,
  onOpenExternalLink,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-emerald-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t('Mulberry Symbols Attribution')}</h3>
              <span className="text-xs font-bold text-emerald-700">{t('Open AAC Standard (CC BY-SA)')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              playChime('tap');
            }}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            aria-label={t('Close attribution modal')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 font-medium text-emerald-950">
            {MULBERRY_ATTRIBUTION.notice}
          </p>
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="font-bold text-slate-800">{t('License Information:')}</div>
            <div className="text-slate-600">
              Mulberry Symbols are licensed under the Creative Commons Attribution-ShareAlike 2.0 / 4.0 License. They are free to use, share, adapt, and incorporate into commercial and non-commercial assistive technology applications.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onOpenExternalLink({
                  url: MULBERRY_ATTRIBUTION.url,
                  title: 'MulberrySymbols.org',
                });
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>MulberrySymbols.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onOpenExternalLink({
                  url: MULBERRY_ATTRIBUTION.licenseUrl,
                  title: 'Creative Commons CC BY-SA License',
                });
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t('View CC BY-SA License')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              playChime('tap');
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer"
          >
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
