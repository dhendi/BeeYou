import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMOTIONS } from '../data/defaultData';
import { EmotionType } from '../types';
import { 
  Heart, 
  Sparkles, 
  Wind, 
  Coffee, 
  Volume2, 
  CheckCircle2, 
  ArrowRight,
  SmilePlus
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const FeelingsView: React.FC = () => {
  const {
    currentMood,
    recordEmotion,
    speak,
    setShowCopingToolkit,
  } = useApp();

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(currentMood);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [savedCheckIn, setSavedCheckIn] = useState<boolean>(false);

  const reasons = [
    { text: 'A plan changed', emoji: '🔄' },
    { text: 'It got too loud', emoji: '🔊' },
    { text: 'My body feels tired', emoji: '🥱' },
    { text: 'Something hurts', emoji: '🩹' },
    { text: 'Too many people or lights', emoji: '☀️' },
    { text: 'I feel excited and full of energy', emoji: '⚡' },
    { text: 'Something felt unfair', emoji: '🛑' },
    { text: 'I am not sure why', emoji: '🤷' },
  ];

  const needs = [
    { text: 'I need a calm break', emoji: '🛋️', action: 'toolkit' },
    { text: 'I need some quiet time', emoji: '🤫', action: 'toolkit' },
    { text: 'I want a gentle hug', emoji: '🤗' },
    { text: 'I need a glass of water', emoji: '💧' },
    { text: 'I want my comfort item', emoji: '🦕' },
    { text: 'I want to talk about it', emoji: '💬' },
    { text: 'I need help from a grown-up', emoji: '🆘' },
    { text: 'I want to go home', emoji: '🏠' },
  ];

  const handleSelectEmotion = (emo: EmotionType, label: string) => {
    setSelectedEmotion(emo);
    setSavedCheckIn(false);
    playChime('tap');
    speak(`I feel ${label}.`);
  };

  const handleCompleteCheckIn = () => {
    if (!selectedEmotion) return;
    recordEmotion(selectedEmotion, selectedReason || undefined, selectedNeed || undefined);
    setSavedCheckIn(true);
    playChime('star');

    const emotionObj = EMOTIONS.find((e) => e.id === selectedEmotion);
    const summary = `I feel ${emotionObj?.label}. ${
      selectedReason ? `Because ${selectedReason.toLowerCase()}. ` : ''
    }${selectedNeed ? `Right now, ${selectedNeed.toLowerCase()}.` : ''}`;
    speak(summary);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-5">
      {/* Hero Banner with Coping Shortcut */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            Emotion Check-In
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-rose-950 mt-1.5">
            How does your body and mind feel?
          </h2>
          <p className="text-xs sm:text-sm text-rose-800 font-medium mt-1">
            All feelings are valid and okay. Share how you feel and what you need.
          </p>
        </div>

        <button
          onClick={() => setShowCopingToolkit(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Wind className="w-5 h-5" />
          <span>Open Calm Toolkit 🛋️</span>
        </button>
      </div>

      {/* 1. EMOTION GRID */}
      <div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2.5">
          1. Choose your feeling:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {EMOTIONS.map((emo) => {
            const isSelected = selectedEmotion === emo.id;
            return (
              <button
                key={emo.id}
                onClick={() => handleSelectEmotion(emo.id, emo.label)}
                className={`p-3.5 sm:p-4 rounded-3xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'ring-4 ring-rose-400 border-rose-500 scale-102 font-black shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ backgroundColor: isSelected ? emo.bgColor : '#ffffff' }}
              >
                <span className="text-4xl sm:text-5xl leading-none mb-1.5 select-none transition-transform hover:scale-110">
                  {emo.emoji}
                </span>
                <span
                  className="font-black text-xs sm:text-sm tracking-tight text-center leading-tight"
                  style={{ color: emo.color }}
                >
                  {emo.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. WHAT HAPPENED? (Optional follow-up) */}
      {selectedEmotion && (
        <div className="animate-in fade-in duration-200">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2.5">
            2. What happened? (Optional):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {reasons.map((r, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedReason(selectedReason === r.text ? null : r.text);
                  playChime('tap');
                }}
                className={`p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer ${
                  selectedReason === r.text
                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-black'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span>{r.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. WHAT DO I NEED? */}
      {selectedEmotion && (
        <div className="animate-in fade-in duration-200">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2.5">
            3. What would help you right now?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {needs.map((n, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedNeed(selectedNeed === n.text ? null : n.text);
                  playChime('tap');
                  if (n.action === 'toolkit') {
                    setShowCopingToolkit(true);
                  }
                }}
                className={`p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer ${
                  selectedNeed === n.text
                    ? 'bg-teal-100 border-teal-400 text-teal-950 font-black'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-2xl">{n.emoji}</span>
                <span className="flex-1">{n.text}</span>
                {n.action === 'toolkit' && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-200/80 px-2 py-0.5 rounded-full">
                    Tools
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SAVE CHECK-IN BUTTON */}
      {selectedEmotion && (
        <div className="pt-2 flex flex-col items-center">
          <button
            onClick={handleCompleteCheckIn}
            className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Save & Speak My Check-In</span>
          </button>

          {savedCheckIn && (
            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Check-in recorded! You are taking great care of yourself.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
