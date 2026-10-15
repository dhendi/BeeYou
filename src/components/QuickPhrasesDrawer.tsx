import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Volume2, 
  Lightbulb, 
  MessageSquare,
  Coffee,
  LifeBuoy,
  ThumbsDown,
  Octagon,
  Home,
  Utensils,
  Moon,
  Bandage,
  Smile,
  Clock,
  HelpCircle
} from 'lucide-react';

const getPhraseIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('break') || lower.includes('quiet') || lower.includes('calm')) return Coffee;
  if (lower.includes('help')) return LifeBuoy;
  if (lower.includes("don't like") || lower.includes('dislike')) return ThumbsDown;
  if (lower.includes('stop')) return Octagon;
  if (lower.includes('home')) return Home;
  if (lower.includes('hungry') || lower.includes('food') || lower.includes('eat') || lower.includes('snack')) return Utensils;
  if (lower.includes('tired') || lower.includes('sleep') || lower.includes('rest')) return Moon;
  if (lower.includes('hurt') || lower.includes('pain') || lower.includes('sick')) return Bandage;
  if (lower.includes('okay') || lower.includes('good') || lower.includes('fine')) return Smile;
  if (lower.includes('wait') || lower.includes('not right now') || lower.includes('later')) return Clock;
  if (lower.includes("what's next") || lower.includes('what next') || lower.includes('?')) return HelpCircle;
  return MessageSquare;
};

export const QuickPhrasesDrawer: React.FC = () => {
  const {
    showQuickPhrasesDrawer,
    setShowQuickPhrasesDrawer,
    quickPhrases,
    speak,
    setShowCopingToolkit,
  } = useApp();

  if (!showQuickPhrasesDrawer) return null;

  const handlePhraseClick = (text: string) => {
    speak(text);
    if (text.toLowerCase().includes('break')) {
      setShowCopingToolkit(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowQuickPhrasesDrawer(false)}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border-2 border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Quick Phrases</h2>
              <p className="text-xs text-slate-500 font-medium">One-tap speaking for fast communication</p>
            </div>
          </div>
          <button
            onClick={() => setShowQuickPhrasesDrawer(false)}
            className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phrases Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickPhrases.map((phrase) => {
            const isEmergency = phrase.isEmergency;
            const Icon = getPhraseIcon(phrase.text);
            return (
              <button
                key={phrase.id}
                onClick={() => handlePhraseClick(phrase.text)}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all active:scale-95 shadow-xs cursor-pointer ${
                  isEmergency
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-950'
                    : 'bg-indigo-50/60 hover:bg-indigo-100 border-indigo-200 text-indigo-950'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isEmergency ? 'bg-rose-200/80 text-rose-700' : 'bg-indigo-200/80 text-indigo-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex-1 font-black leading-snug">{phrase.text}</span>
                <Volume2 className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Tap any phrase to speak immediately.</span>
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Customizable by parent
          </span>
        </div>
      </div>
    </div>
  );
};
