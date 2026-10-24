import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Heart, 
  Trash2, 
  Maximize2, 
  Mic, 
  MessageSquare 
} from 'lucide-react';
import { FavoriteSentence, AACItem } from '../../types';
import { getFavoriteSentenceSticker } from '../../data/defaultData';
import { playChime, playAudioUrl } from '../../utils/audio';
import { t } from '../../services/translator';

export interface AACFavoritesViewProps {
  favoriteSentences: FavoriteSentence[];
  speak: (text: string) => void;
  recordSentenceSpoken: (text: string, emoji?: string) => void;
  addToSentence: (item: AACItem) => void;
  addFavoriteSentence: (fav: Omit<FavoriteSentence, 'id' | 'usageCount'> & { usageCount?: number }) => void;
  deleteFavoriteSentence: (id: string) => void;
  togglePinFavoriteSentence: (id: string) => void;
  setInspectingSentence: (sentence: FavoriteSentence | null) => void;
  handleSentencePressStart: (sentence: FavoriteSentence) => void;
  handleSentencePressEnd: () => void;
  isSentenceLongPressRef: React.MutableRefObject<boolean>;
}

const ICON_PRESETS = [
  { id: 'play', sticker: '/assets/stickers/fav_lego.webp', label: 'Play' },
  { id: 'bath', sticker: '/assets/stickers/fav_bath.webp', label: 'Bath' },
  { id: 'snack', sticker: '/assets/stickers/fav_sandwich.webp', label: 'Snack' },
  { id: 'water', sticker: '/assets/stickers/fav_water.webp', label: 'Water' },
  { id: 'quiet', sticker: '/assets/stickers/fav_quiet_break.webp', label: 'Quiet' },
  { id: 'help', sticker: '/assets/stickers/fav_help_sos.webp', label: 'Help' },
  { id: 'outside', sticker: '/assets/stickers/fav_outside.webp', label: 'Outside' },
  { id: 'love', sticker: '/assets/stickers/fav_love_heart.webp', label: 'Love' },
  { id: 'rest', sticker: '/assets/stickers/fav_rest_tired.webp', label: 'Rest' },
  { id: 'music', sticker: '/assets/stickers/fav_music.webp', label: 'Music' },
  { id: 'stop', sticker: '/assets/stickers/fav_stop.webp', label: 'Stop' },
  { id: 'happy', sticker: '/assets/stickers/fav_happy.webp', label: 'Happy' },
  { id: 'home', sticker: '/assets/stickers/home_house.webp', label: 'Home' },
  { id: 'done', sticker: '/assets/stickers/task_done.webp', label: 'Done' },
];

export const AACFavoritesView: React.FC<AACFavoritesViewProps> = ({
  favoriteSentences,
  speak,
  recordSentenceSpoken,
  addToSentence,
  addFavoriteSentence,
  deleteFavoriteSentence,
  togglePinFavoriteSentence,
  setInspectingSentence,
  handleSentencePressStart,
  handleSentencePressEnd,
  isSentenceLongPressRef,
}) => {
  const [showAddSentenceForm, setShowAddSentenceForm] = useState(false);
  const [newFavSentenceText, setNewFavSentenceText] = useState('');
  const [selectedPresetSticker, setSelectedPresetSticker] = useState(ICON_PRESETS[0].sticker);

  const handleSaveSentence = () => {
    if (!newFavSentenceText.trim()) return;
    addFavoriteSentence({
      text: newFavSentenceText.trim(),
      speechText: newFavSentenceText.trim(),
      emoji: '',
      stickerSrc: selectedPresetSticker,
      isParentPinned: true,
    });
    setNewFavSentenceText('');
    setShowAddSentenceForm(false);
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in">
      {/* Header banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/10 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shadow-xs shrink-0 p-1 border border-amber-200">
            <img src="/assets/stickers/aac_sentences.webp" alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{t('Favorite Sentences & Frequent Phrases')}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                {favoriteSentences.length} {t('Saved')}
              </span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              {t('Tap any sentence to speak it aloud. Phrases used most frequently automatically rise to the top!')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setShowAddSentenceForm(!showAddSentenceForm);
              playChime('tap');
            }}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddSentenceForm ? t('Close Form') : t('+ Add Favorite Sentence')}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      {showAddSentenceForm && (
        <div className="p-4 rounded-3xl bg-white border-2 border-amber-300 space-y-3 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span>{t('Add Custom Favorite Sentence')}</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddSentenceForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 mr-1">{t('Icon:')}</span>
              {ICON_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPresetSticker(preset.sticker);
                    playChime('tap');
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center p-1 cursor-pointer transition-all shrink-0 ${
                    selectedPresetSticker === preset.sticker ? 'bg-amber-400 scale-110 shadow-xs' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={preset.label}
                >
                  <img src={preset.sticker} alt={preset.label} className="w-full h-full object-contain pointer-events-none drop-shadow-2xs" />
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newFavSentenceText}
                onChange={(e) => setNewFavSentenceText(e.target.value)}
                placeholder={t('e.g. I want to play lego, I want to take a bath...')}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold focus:border-amber-500 focus:bg-white outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSentence();
                }}
              />

              <button
                type="button"
                onClick={handleSaveSentence}
                disabled={!newFavSentenceText.trim()}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                  newFavSentenceText.trim()
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{t('Save Sentence')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Favorite Sentences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...favoriteSentences]
          .sort((a, b) => {
            if (a.isParentPinned && !b.isParentPinned) return -1;
            if (!a.isParentPinned && b.isParentPinned) return 1;
            return (b.usageCount || 0) - (a.usageCount || 0);
          })
          .map((fav) => (
            <div
              key={fav.id}
              className={`p-3.5 sm:p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 shadow-xs hover:border-amber-400 group bg-white dark:bg-slate-850 ${
                fav.isParentPinned ? 'border-amber-300/90 bg-amber-50/20' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <button
                type="button"
                onMouseDown={() => handleSentencePressStart(fav)}
                onMouseUp={handleSentencePressEnd}
                onMouseLeave={handleSentencePressEnd}
                onTouchStart={() => handleSentencePressStart(fav)}
                onTouchEnd={handleSentencePressEnd}
                onTouchCancel={handleSentencePressEnd}
                onClick={() => {
                  if (isSentenceLongPressRef.current) {
                    isSentenceLongPressRef.current = false;
                    return;
                  }
                  const spoken = t(fav.speechText || fav.text);
                  if (fav.audioDataUrl) {
                    playAudioUrl(fav.audioDataUrl, spoken);
                  } else {
                    speak(spoken);
                  }
                  recordSentenceSpoken(fav.text, fav.emoji);
                  playChime('speak');
                  addToSentence({
                    id: `fav-${Date.now()}`,
                    label: t(fav.text),
                    originalLabel: fav.text,
                    speechText: spoken,
                    emoji: fav.emoji || '',
                    photoUrl: fav.stickerSrc || getFavoriteSentenceSticker(fav),
                    category: 'favorites',
                    colorType: 'social',
                    motorIndex: 0,
                    audioDataUrl: fav.audioDataUrl,
                    audioRecordedBy: fav.audioRecordedBy,
                  });
                }}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none rounded-xl"
                title={t(fav.speechText || fav.text)}
                aria-label={`Speak favorite phrase: ${t(fav.speechText || fav.text)}`}
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                  {(() => {
                    const stickerPath = fav.stickerSrc || getFavoriteSentenceSticker(fav);
                    if (stickerPath) {
                      return (
                        <img
                          src={stickerPath}
                          alt={fav.text}
                          className="w-full h-full object-contain drop-shadow-2xs select-none pointer-events-none"
                        />
                      );
                    }
                    return <MessageSquare className="w-7 h-7 text-amber-500" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug select-none">
                    {t(fav.text)}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium flex-wrap">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] shrink-0">
                      {fav.usageCount || 1}x {t('spoken')}
                    </span>
                    {fav.audioDataUrl && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px] flex items-center gap-1 shrink-0">
                        <Mic className="w-3 h-3 text-purple-700" />
                        <span>{fav.audioRecordedBy || 'Voice'}</span>
                      </span>
                    )}
                    {fav.isParentPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1 shrink-0">
                        <img src="/assets/stickers/aac_core.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>{t('Pinned')}</span>
                      </span>
                    )}
                    <span className="text-slate-400 hidden sm:inline">• {t('Tap to speak')}</span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingSentence(fav);
                    playChime('tap');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
                  title="Show full sentence"
                  aria-label="Show full sentence"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinFavoriteSentence(fav.id);
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    fav.isParentPinned
                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={fav.isParentPinned ? 'Unpin sentence' : 'Pin sentence to top'}
                  aria-label={fav.isParentPinned ? 'Unpin sentence' : 'Pin sentence to top'}
                >
                  <Heart className={`w-4 h-4 ${fav.isParentPinned ? 'fill-amber-400 text-amber-600' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFavoriteSentence(fav.id);
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                  title="Delete sentence"
                  aria-label="Delete sentence"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
