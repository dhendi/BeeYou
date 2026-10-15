import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Volume2, 
  Lightbulb, 
  MessageSquare,
  ThumbsDown,
  Home,
  Bandage,
  Clock,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useModalBackHandler } from '../services/modalBackHandler';
import { getQuickPhraseSticker } from '../data/defaultData';
import { QuickPhrase } from '../types';

interface PhraseVisual {
  stickerSrc?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const getPhraseVisual = (phrase: QuickPhrase): PhraseVisual => {
  const sticker = getQuickPhraseSticker(phrase);
  if (sticker) {
    return { stickerSrc: sticker, Icon: MessageSquare };
  }

  const text = phrase.text.toLowerCase();
  if (text.includes("don't like") || text.includes('dislike')) {
    return { Icon: ThumbsDown };
  }
  if (text.includes('home') || text.includes('house')) {
    return { Icon: Home };
  }
  if (text.includes('hurt') || text.includes('pain') || text.includes('sick')) {
    return { Icon: Bandage };
  }
  if (text.includes('wait') || text.includes('not right now') || text.includes('later')) {
    return { Icon: Clock };
  }
  if (text.includes("what's next") || text.includes('what next') || text.includes('?')) {
    return { Icon: HelpCircle };
  }

  return { Icon: MessageSquare };
};

export const QuickPhrasesDrawer: React.FC = () => {
  const {
    showQuickPhrasesDrawer,
    setShowQuickPhrasesDrawer,
    quickPhrases,
    speak,
    setShowCopingToolkit,
    activeTheme,
  } = useApp();

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useModalBackHandler(showQuickPhrasesDrawer, () => setShowQuickPhrasesDrawer(false));

  if (!showQuickPhrasesDrawer) return null;

  const handlePhraseClick = (text: string) => {
    speak(text);
    if (text.toLowerCase().includes('break')) {
      setShowCopingToolkit(true);
    }
  };

  // Determine theme styling (default to warm honey yellow classic palette)
  const isClassicTheme = !activeTheme || activeTheme.id === 'theme-classic' || activeTheme.category === 'classic';
  const palette = activeTheme?.palette;

  const cardBgClass = isClassicTheme 
    ? 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-300/90 text-amber-950 hover:border-amber-400' 
    : `${palette?.primaryLight || 'bg-amber-50/70'} ${palette?.primaryBorder || 'border-amber-300'} ${palette?.textAccent || 'text-amber-950'}`;

  const iconBoxBgClass = isClassicTheme
    ? 'bg-amber-100/90 border-amber-300'
    : `${palette?.badgeBg || 'bg-amber-100/90'} ${palette?.primaryBorder || 'border-amber-300'}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowQuickPhrasesDrawer(false)}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border-2 border-amber-300/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Signature Theme Yellow */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-amber-200/90 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF2D4] border border-[#FED676] flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
              <img
                src="/assets/stickers/quick_phrases.png"
                alt="Quick Phrases"
                className="w-8 h-8 object-contain drop-shadow-xs select-none"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2D241E] leading-tight">Quick Phrases & Cards</h2>
              <p className="text-xs text-[#7A4D05] font-semibold">One-tap speaking for fast communication</p>
            </div>
          </div>
          <button
            onClick={() => setShowQuickPhrasesDrawer(false)}
            className="p-2.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-[#2D241E] border border-amber-300/80 shadow-xs active:scale-95 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-400"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phrases Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickPhrases.map((phrase) => {
            const isEmergency = phrase.isEmergency;
            const visual = getPhraseVisual(phrase);
            const hasSticker = visual.stickerSrc && !imgErrors[phrase.id];

            return (
              <button
                key={phrase.id}
                onClick={() => handlePhraseClick(phrase.text)}
                className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all active:scale-[0.98] shadow-xs cursor-pointer hover:shadow-md ${cardBgClass}`}
              >
                {/* Sticker / Icon Box */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs border group-hover:scale-105 transition-transform ${iconBoxBgClass}`}>
                  {hasSticker ? (
                    <img
                      src={visual.stickerSrc}
                      alt={phrase.text}
                      className="w-9 h-9 object-contain drop-shadow-xs select-none pointer-events-none"
                      onError={() => {
                        setImgErrors((prev) => ({ ...prev, [phrase.id]: true }));
                      }}
                    />
                  ) : (
                    <visual.Icon className="w-6 h-6 text-amber-900 group-hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Phrase Text & Priority Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black leading-snug line-clamp-2">
                      {phrase.text}
                    </span>
                    {isEmergency && (
                      <span className="shrink-0 text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300/80 shadow-2xs">
                        Priority
                      </span>
                    )}
                  </div>
                </div>

                {/* Speaker Icon */}
                <div className="w-8 h-8 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-800/70 group-hover:text-amber-950 group-hover:bg-amber-200/80 group-hover:scale-110 transition-all shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-5 py-3.5 bg-amber-50/80 border-t border-amber-200/80 flex items-center justify-between text-xs text-amber-900/80 font-semibold">
          <span>Tap any phrase to speak immediately.</span>
          <span className="text-[#7A4D05] font-bold flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-200/90">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            Customizable by caregiver
          </span>
        </div>
      </div>
    </div>
  );
};
