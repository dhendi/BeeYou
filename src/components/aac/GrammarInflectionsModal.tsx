import React from 'react';
import { X } from 'lucide-react';
import { AACItem } from '../../types';
import { WordInflection } from '../../utils/aacInflections';
import { resolveAacImageUrl } from '../../services/symbolService';
import { t } from '../../services/translator';

export interface GrammarInflectionsModalProps {
  target: { item: AACItem; inflections: WordInflection[] } | null;
  onClose: () => void;
  onSelectInflection: (inflection: WordInflection) => void;
}

export const GrammarInflectionsModal: React.FC<GrammarInflectionsModalProps> = ({
  target,
  onClose,
  onSelectInflection,
}) => {
  if (!target) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={t('Grammar Forms')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border-4 border-amber-300 space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2.5">
            <img
              src={resolveAacImageUrl(target.item)}
              alt=""
              className="w-8 h-8 object-contain rounded-lg"
            />
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {t('Grammar Forms')}: {t(target.item.label)}
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {t('Pick a variation to speak or insert')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {target.inflections.map((inf, idx) => (
            <button
              key={idx}
              onClick={() => onSelectInflection(inf)}
              className="p-3 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between"
            >
              <span className="font-black text-slate-900 text-sm">{inf.label}</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">
                {inf.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
