import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  HelpCircle,
  Volume2
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const PlansChangedModal: React.FC = () => {
  const {
    showPlansChangedModal,
    setShowPlansChangedModal,
    plansChanged,
    dismissPlansChanged,
    speak,
    setShowCopingToolkit,
  } = useApp();

  if (!showPlansChangedModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={() => setShowPlansChangedModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-4 border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-100 px-5 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🔄</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">Plans Changed</h2>
              <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                It is okay to feel surprised. Here is what is happening next.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPlansChangedModal(false)}
            className="p-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* 1. Comparison Card: Old Plan vs What Changed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Old Plan */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">
                Original Plan
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-700 text-base">
                <span className="line-through">{plansChanged.originalPlanTitle}</span>
              </div>
            </div>

            {/* Why it changed */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mb-1">
                What Happened
              </span>
              <p className="font-bold text-amber-950 text-sm leading-snug">
                {plansChanged.reason}
              </p>
            </div>
          </div>

          {/* 2. Empathetic Calming Message */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <Heart className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sky-950 text-sm">You are safe</h4>
              <p className="text-xs sm:text-sm text-sky-900 mt-0.5 leading-relaxed font-medium">
                {plansChanged.calmingMessage}
              </p>
            </div>
          </div>

          {/* 3. The NEW PLAN */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Our New Plan: {plansChanged.newPlanTitle}
              </h3>
            </div>

            <div className="space-y-2">
              {plansChanged.newSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl shadow-xs"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-2xl">{step.emoji}</span>
                  <div className="flex-1">
                    <span className="font-black text-slate-800 text-sm sm:text-base block">
                      {step.title}
                    </span>
                    {step.time && (
                      <span className="text-xs font-bold text-emerald-700">{step.time}</span>
                    )}
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Relevant Communication / Express How I Feel */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Things you can say right now (tap to speak):
            </span>
            <div className="flex flex-wrap gap-2">
              {plansChanged.relevantPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span>{phrase}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              setShowPlansChangedModal(false);
              setShowCopingToolkit(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            I need a calm break first 🛋️
          </button>

          <button
            onClick={() => {
              setShowPlansChangedModal(false);
              playChime('tap');
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            I understand our new plan! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
