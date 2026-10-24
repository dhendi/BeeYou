import React from 'react';
import { 
  Zap, 
  Lightbulb, 
  Delete, 
  Trash2, 
  BookmarkPlus, 
  Volume2, 
  Loader2, 
  Keyboard, 
  ChevronUp, 
  ChevronDown,
  Mic
} from 'lucide-react';
import { AACItem } from '../../types';
import { resolveAacImageUrl } from '../../services/symbolService';
import { autocorrectAacGrammar } from '../../utils/aacGrammar';
import { t } from '../../services/translator';

export interface AACSentenceStripProps {
  sentence: AACItem[];
  isSentenceBarCollapsed: boolean;
  setIsSentenceBarCollapsed: (collapsed: boolean) => void;
  instantSpeakMode: boolean;
  isSpeaking: boolean;
  isPreparingSpeech: boolean;
  onSpeak: () => void;
  onStopSpeaking: () => void;
  onRemoveLast: () => void;
  onClear: () => void;
  onSaveQuickPhrase: () => void;
  onOpenKeyboard: () => void;
  getColorStyles: (colorType: AACItem['colorType']) => string;
  themeCategory?: string;
  themeId?: string;
  language: string;
}

export const AACSentenceStrip: React.FC<AACSentenceStripProps> = ({
  sentence,
  isSentenceBarCollapsed,
  setIsSentenceBarCollapsed,
  instantSpeakMode,
  isSpeaking,
  isPreparingSpeech,
  onSpeak,
  onStopSpeaking,
  onRemoveLast,
  onClear,
  onSaveQuickPhrase,
  onOpenKeyboard,
  getColorStyles,
  themeCategory,
  themeId,
  language,
}) => {
  const isTurtleTheme = themeCategory === 'turtle' || themeId === 'theme-turtle';
  const isDinoTheme = themeCategory === 'dinosaur' || themeId === 'theme-dino';
  const isFrogTheme = themeCategory === 'frog' || themeId === 'theme-frog';
  const isFairytaleTheme = themeCategory === 'fairytale';
  const isRacingTheme = themeCategory === 'racing';
  const isOceanTheme = themeCategory === 'ocean';
  const isTrainTheme = themeCategory === 'train';
  const isSpaceTheme = themeCategory === 'space';

  if (isSentenceBarCollapsed) {
    return (
      <div className="flex items-center justify-between bg-[#FCF9F2] border-2 border-[#E0D8CB] rounded-2xl px-3.5 py-2 text-xs font-bold text-[#6B5E52] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <span className="flex items-center gap-2">
          <img
            src="/assets/stickers/aac_sentences.webp"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 object-contain pointer-events-none drop-shadow-2xs select-none"
          />
          <span>{t('Sentence Bar Minimized')}</span>
          {instantSpeakMode && <span className="text-[#A76318] font-black">({t('Instant Speak is Active')})</span>}
        </span>
        <button
          onClick={() => setIsSentenceBarCollapsed(false)}
          className="flex items-center gap-1 text-[#8B571A] hover:underline cursor-pointer font-black"
        >
          <span>{t('Show Bar')}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <section
      data-tour="aac-sentence-strip"
      aria-label="Sentence builder"
      className={`w-full ${
        isFrogTheme
          ? 'bg-lime-50/70 border-lime-300/80'
          : isDinoTheme
          ? 'bg-green-50/70 border-green-300/80'
          : isTurtleTheme
          ? 'bg-emerald-50/70 border-emerald-300/80'
          : isFairytaleTheme
          ? 'bg-pink-50/70 border-pink-300/80'
          : isRacingTheme
          ? 'bg-zinc-100/90 border-zinc-300/90'
          : isOceanTheme
          ? 'bg-cyan-50/70 border-cyan-300/80'
          : isTrainTheme
          ? 'bg-sky-50/70 border-sky-300/80'
          : isSpaceTheme
          ? 'bg-purple-50/70 border-purple-300/80'
          : 'bg-[#FCF9F2] border-[#E0D8CB]'
      } rounded-3xl border-2 shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-2.5 animate-in fade-in duration-150`}
    >
      <div className="flex items-center gap-2">
        {/* Sentence Display Area (Debossed Silicone Slot) */}
        <button 
          type="button"
          onClick={sentence.length > 0 ? onSpeak : undefined}
          aria-label={sentence.length > 0 ? `Speak sentence: ${autocorrectAacGrammar(sentence, language)}` : 'Sentence builder. Tap words below to build sentence'}
          className={`flex-1 min-w-0 min-h-[56px] sm:min-h-[62px] ${
            isFrogTheme
              ? 'bg-lime-100/50 border-lime-300/60'
              : isDinoTheme
              ? 'bg-green-100/50 border-green-300/60'
              : isTurtleTheme
              ? 'bg-emerald-100/50 border-emerald-300/60'
              : isFairytaleTheme
              ? 'bg-pink-100/50 border-pink-300/60'
              : isRacingTheme
              ? 'bg-zinc-200/60 border-zinc-300/80'
              : isOceanTheme
              ? 'bg-cyan-100/50 border-cyan-300/60'
              : isTrainTheme
              ? 'bg-sky-100/50 border-sky-300/60'
              : isSpaceTheme
              ? 'bg-purple-100/50 border-purple-300/60'
              : 'bg-[#EFE9DF] border-[#E0D8CB]'
          } border-2 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shadow-[inset_0_2px_5px_rgba(0,0,0,0.07)] transition-colors text-left focus-visible:ring-4 focus-visible:outline-none ${
            sentence.length > 0
              ? isFrogTheme
                ? 'cursor-pointer hover:bg-lime-100/70'
                : isDinoTheme
                ? 'cursor-pointer hover:bg-green-100/70'
                : isTurtleTheme
                ? 'cursor-pointer hover:bg-emerald-100/70'
                : 'cursor-pointer hover:bg-[#EAE3D7]'
              : ''
          }`}
          title={sentence.length > 0 ? "Tap message window to speak sentence aloud" : undefined}
        >
          {sentence.length === 0 ? (
            <div className={`flex items-center gap-2 ${isFrogTheme ? 'text-lime-800/70' : isDinoTheme ? 'text-green-800/70' : isTurtleTheme ? 'text-emerald-800/70' : 'text-[#8C7E72]'} text-xs sm:text-sm font-semibold px-2 select-none truncate`}>
              {instantSpeakMode ? (
                <span className={`${isFrogTheme ? 'text-lime-800' : isDinoTheme ? 'text-green-800' : isTurtleTheme ? 'text-emerald-800' : 'text-[#A76318]'} font-bold flex items-center gap-1`}>
                  <Zap className="w-4 h-4" /> {t('Instant Speak is ON — tap any word to hear aloud')}
                </span>
              ) : (
                <span className="truncate">{t('Tap words below to build a sentence...')}</span>
              )}
            </div>
          ) : (
            <>
              {sentence.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] animate-in fade-in zoom-in-95 duration-150 select-none shrink-0 ${getColorStyles(
                    item.colorType
                  )}`}
                >
                  <img
                    src={resolveAacImageUrl(item)}
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6 object-contain rounded shrink-0 pointer-events-none"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'inline';
                      }
                    }}
                  />
                  <span className="font-bold text-xs sm:text-sm tracking-tight">{item.label}</span>
                  {item.audioDataUrl && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs" title={`Recorded by ${item.audioRecordedBy || 'Voice'}`}>
                      <Mic className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              ))}
              {sentence.length > 1 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isFrogTheme
                    ? 'bg-lime-500/15 border-lime-300 text-lime-950'
                    : isDinoTheme
                    ? 'bg-green-500/15 border-green-300 text-green-950'
                    : isTurtleTheme
                    ? 'bg-emerald-500/15 border-emerald-300 text-emerald-950'
                    : 'bg-amber-500/15 border-amber-300 text-amber-950'
                } border font-black text-xs shrink-0 animate-in fade-in select-none`}>
                  <Lightbulb className={`w-3.5 h-3.5 ${isFrogTheme ? 'text-lime-700' : isDinoTheme ? 'text-green-700' : isTurtleTheme ? 'text-emerald-700' : 'text-amber-600'} shrink-0`} />
                  <span>&quot;{autocorrectAacGrammar(sentence, language)}&quot;</span>
                </div>
              )}
            </>
          )}
        </button>

        {/* Controls: Backspace, Clear, Speak, Save, Collapse */}
        <div className="flex items-center gap-1.5 shrink-0">
          {sentence.length > 0 && (
            <>
              <button
                onClick={onRemoveLast}
                className={`p-2.5 rounded-2xl ${
                  isFrogTheme
                    ? 'bg-lime-100/70 hover:bg-lime-100 text-lime-900 border-lime-300'
                    : isDinoTheme
                    ? 'bg-green-100/70 hover:bg-green-100 text-green-900 border-green-300'
                    : isTurtleTheme
                    ? 'bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-[#F5EFE6] hover:bg-[#EAE2D5] text-[#5D5045] border-[#E0D8CB]'
                } border shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer`}
                title="Remove last word"
                aria-label="Backspace"
              >
                <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onClear}
                className="p-2.5 rounded-2xl bg-[#FBEAE9] hover:bg-[#F6D6D4] text-[#9E3636] border border-[#EAC2C0] shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer"
                title="Clear sentence"
                aria-label="Clear all"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={onSaveQuickPhrase}
                className={`p-2.5 rounded-2xl ${
                  isFrogTheme
                    ? 'bg-lime-100/50 hover:bg-lime-100 text-lime-950 border-lime-300'
                    : isDinoTheme
                    ? 'bg-green-100/50 hover:bg-green-100 text-green-950 border-green-300'
                    : isTurtleTheme
                    ? 'bg-emerald-100/50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                    : 'bg-[#EEF2F6] hover:bg-[#DDE5ED] text-[#334E68] border-[#CBD2D9]'
                } border shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer hidden sm:block focus-visible:ring-4 focus-visible:outline-none`}
                title="Save to quick phrases"
                aria-label="Save current sentence to quick phrases"
              >
                <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            </>
          )}

          {isSpeaking ? (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm shadow-[0_4px_12px_rgba(230,142,142,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.7)] transition-all active:scale-95 bg-[#E68E8E] hover:bg-[#D57B7B] text-[#4A1616] border-2 border-[#D57B7B] animate-pulse cursor-pointer"
              title="Stop speaking"
            >
              <div className="flex items-center gap-0.5 mr-0.5">
                <span className="w-1.5 h-3.5 bg-[#4A1616] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-4.5 bg-[#4A1616] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-2.5 bg-[#4A1616] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{t('STOP')}</span>
            </button>
          ) : isPreparingSpeech ? (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm shadow-[0_4px_12px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.7)] transition-all active:scale-95 bg-amber-200 hover:bg-amber-300 text-amber-950 border-2 border-amber-400 animate-pulse cursor-pointer"
              title="Cancel speech preparation"
            >
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-amber-900" />
              <span>{t('PREPARING...')}</span>
            </button>
          ) : (
            <button
              onClick={onSpeak}
              disabled={sentence.length === 0}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer ${
                sentence.length > 0
                  ? isFrogTheme
                    ? 'bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-700 shadow-[0_4px_12px_rgba(101,163,13,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)]'
                    : isDinoTheme
                    ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-700 shadow-[0_4px_12px_rgba(22,163,74,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)]'
                    : isTurtleTheme
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)]'
                    : 'bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] border-2 border-[#E2A44E] shadow-[0_4px_12px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)]'
                  : isFrogTheme
                  ? 'bg-lime-100/60 text-lime-800/50 border border-lime-200 cursor-not-allowed'
                  : isDinoTheme
                  ? 'bg-green-100/60 text-green-800/50 border border-green-200 cursor-not-allowed'
                  : isTurtleTheme
                  ? 'bg-emerald-100/60 text-emerald-800/50 border border-emerald-200 cursor-not-allowed'
                  : 'bg-[#EAE4D9] text-[#A89C8F] border border-[#DCD3C4] cursor-not-allowed'
              }`}
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t('SPEAK')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenKeyboard}
            className="p-2.5 rounded-2xl bg-[#EEF2F6] hover:bg-[#DDE5ED] text-[#334E68] border border-[#CBD2D9] shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Type with Dyslexia-Friendly AAC Keyboard"
            aria-label="Open AAC Keyboard"
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>

          <button
            onClick={() => setIsSentenceBarCollapsed(true)}
            className="p-2 rounded-2xl bg-[#F5EFE6] hover:bg-[#EAE2D5] text-[#7A6C60] border border-[#E0D8CB] transition-all cursor-pointer hidden md:block"
            title="Minimize sentence bar"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
