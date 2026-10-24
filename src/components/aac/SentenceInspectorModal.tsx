import React from 'react';
import { 
  X, 
  Volume2, 
  MessageSquare, 
  Heart, 
  Trash2, 
  Zap 
} from 'lucide-react';
import { FavoriteSentence, AACItem } from '../../types';
import { getFavoriteSentenceSticker } from '../../data/defaultData';
import { playChime } from '../../utils/audio';
import { t } from '../../services/translator';

export interface SentenceInspectorModalProps {
  inspectingSentence: FavoriteSentence | null;
  onClose: () => void;
  onSpeakSentence: (sentence: FavoriteSentence) => void;
  onAddToSentenceBar: (item: AACItem) => void;
  onTogglePin: (id: string) => void;
  onDeleteSentence: (id: string) => void;
  language: string;
}

export const SentenceInspectorModal: React.FC<SentenceInspectorModalProps> = ({
  inspectingSentence,
  onClose,
  onSpeakSentence,
  onAddToSentenceBar,
  onTogglePin,
  onDeleteSentence,
  language,
}) => {
  if (!inspectingSentence) return null;

  const stickerPath = inspectingSentence.stickerSrc || getFavoriteSentenceSticker(inspectingSentence);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Sentence Details')}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full border-3 border-amber-300 shadow-2xl space-y-5 text-center relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-all"
          title={t('Close')}
          aria-label={t('Close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto p-2 bg-amber-50 dark:bg-amber-950/40 rounded-3xl border-2 border-amber-200 flex items-center justify-center shadow-xs">
          {stickerPath ? (
            <img
              src={stickerPath}
              alt=""
              className="w-full h-full object-contain drop-shadow-xs pointer-events-none select-none"
            />
          ) : (
            <MessageSquare className="w-10 h-10 text-amber-500" />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>
              {t('Spoken')} {inspectingSentence.usageCount || 1} {inspectingSentence.usageCount === 1 ? t('time') : t('times')}
            </span>
          </span>
          {inspectingSentence.isParentPinned && (
            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200 text-xs font-black flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{t('Pinned Favorite')}</span>
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border-2 border-amber-200/80 shadow-inner">
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed select-text tracking-tight">
            &ldquo;{t(inspectingSentence.text)}&rdquo;
          </p>
          {language !== 'en' && inspectingSentence.text.toLowerCase() !== t(inspectingSentence.text).toLowerCase() && (
            <p className="text-xs font-bold text-slate-500 mt-2">
              {t('Original (EN)')}: &ldquo;{inspectingSentence.text}&rdquo;
            </p>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onSpeakSentence(inspectingSentence);
              playChime('speak');
            }}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Volume2 className="w-5 h-5" />
            <span>{t('Speak Sentence Aloud')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const spoken = t(inspectingSentence.speechText || inspectingSentence.text);
              onAddToSentenceBar({
                id: `fav-${Date.now()}`,
                label: t(inspectingSentence.text),
                originalLabel: inspectingSentence.text,
                speechText: spoken,
                emoji: inspectingSentence.emoji || '',
                photoUrl: inspectingSentence.stickerSrc || getFavoriteSentenceSticker(inspectingSentence),
                category: 'favorites',
                colorType: 'social',
                motorIndex: 0,
                audioDataUrl: inspectingSentence.audioDataUrl,
                audioRecordedBy: inspectingSentence.audioRecordedBy,
              });
              playChime('star');
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('Add to Sentence Bar')}</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onTogglePin(inspectingSentence.id)}
              className={`flex-1 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                inspectingSentence.isParentPinned
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${inspectingSentence.isParentPinned ? 'fill-amber-500 text-amber-600' : ''}`} />
              <span>{inspectingSentence.isParentPinned ? t('Pinned') : t('Pin to Top')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteSentence(inspectingSentence.id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('Delete')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
