import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMOTIONS } from '../data/defaultData';
import { EmotionType } from '../types';
import { ThemedEmotionFace } from './ThemedEmotionFace';
import { 
  Heart, 
  Sparkles, 
  Wind, 
  Coffee, 
  Volume2, 
  CheckCircle2, 
  ArrowRight,
  SmilePlus,
  Calendar,
  Smile,
  BarChart3
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { DailyRecollectionChart } from './DailyRecollectionChart';

export const FeelingsView: React.FC = () => {
  const {
    currentMood,
    recordEmotion,
    speak,
    setShowCopingToolkit,
    setShowRecollectionModal,
    dailyRecollections,
    activeTheme,
    childProfile,
    updateChildProfile,
    avatar,
    updateAvatar,
    setShowAvatarCreator,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'check-in' | 'recollection'>('check-in');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(currentMood);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [savedCheckIn, setSavedCheckIn] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = dailyRecollections.some((r) => r.date === todayStr);


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
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4 sm:space-y-5">
      {/* SUB-TAB NAVIGATOR */}
      <div className="flex items-center gap-1.5 p-1 bg-rose-100/60 dark:bg-slate-800 rounded-2xl border border-rose-200 shrink-0">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('check-in');
            playChime('tap');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'check-in'
              ? 'bg-white dark:bg-slate-700 text-rose-950 dark:text-white shadow-xs'
              : 'text-rose-800 hover:text-rose-950 dark:text-slate-300'
          }`}
        >
          <Smile className="w-4 h-4 text-rose-500" />
          <span>Quick Emotion Check-In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('recollection');
            playChime('tap');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'recollection'
              ? 'bg-white dark:bg-slate-700 text-amber-950 dark:text-white shadow-xs'
              : 'text-amber-800 hover:text-amber-950 dark:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span>Daily Recollection & History ({dailyRecollections.length})</span>
        </button>
      </div>

      {activeSubTab === 'recollection' ? (
        <DailyRecollectionChart />
      ) : (
        <>
          {/* End-of-Day Recollection Prompt Banner */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl select-none">🌙</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full">
                    Daily Reflection
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {loggedToday ? "Today's reflection completed! ✓" : "End-of-day journal"}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base mt-0.5">
                  {loggedToday ? "Review or update today's reflection" : "How was today? Fill out your daily recollection chart"}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRecollectionModal(true);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-amber-300" />
              <span>{loggedToday ? 'Edit Reflection' : 'Open Reflection Chart (+3 ⭐)'}</span>
            </button>
          </div>

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
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                1. Choose your feeling:
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Boy / Girl Character Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      updateChildProfile({ characterGender: 'boy' });
                      playChime('tap');
                    }}
                    className={`px-2.5 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      (childProfile?.characterGender || 'boy') === 'boy'
                        ? 'bg-blue-600 text-white shadow-xs scale-102'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300'
                    }`}
                    aria-label="Boy character version"
                  >
                    <span>👦</span>
                    <span>Boy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateChildProfile({ characterGender: 'girl' });
                      playChime('tap');
                    }}
                    className={`px-2.5 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      childProfile?.characterGender === 'girl'
                        ? 'bg-pink-600 text-white shadow-xs scale-102'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300'
                    }`}
                    aria-label="Girl character version"
                  >
                    <span>👧</span>
                    <span>Girl</span>
                  </button>
                </div>

                {/* Skin & Hair Representation Presets */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-x-auto">
                  {[
                    { id: 'default', label: 'Classic', skin: '#fcd34d', hair: '#451a03', icon: '🌟' },
                    { id: 'african', label: 'African', skin: '#5a2e12', hair: '#18181b', icon: '🌍' },
                    { id: 'asian', label: 'Asian', skin: '#fef3c7', hair: '#18181b', icon: '🌏' },
                    { id: 'blonde', label: 'Blonde', skin: '#fed7aa', hair: '#facc15', icon: '☀️' },
                    { id: 'olive', label: 'Tan', skin: '#d97706', hair: '#27272a', icon: '🌿' },
                    { id: 'redhead', label: 'Redhead', skin: '#fef3c7', hair: '#ea580c', icon: '🍁' },
                  ].map((preset) => {
                    const isSelected = avatar.skinTone === preset.skin && avatar.hairColor === preset.hair;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          updateAvatar({ skinTone: preset.skin, hairColor: preset.hair });
                          playChime('tap');
                        }}
                        className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-white/60'
                        }`}
                        title={`${preset.label} representation`}
                      >
                        <span className="text-xs">{preset.icon}</span>
                        <span className="hidden sm:inline">{preset.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarCreator(true);
                      playChime('tap');
                    }}
                    className="px-2 py-1 rounded-xl text-xs font-black text-amber-900 bg-amber-300 hover:bg-amber-400 flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
                    title="Open Full Avatar Studio"
                  >
                    <span>🎨</span>
                    <span>Studio</span>
                  </button>
                </div>
              </div>
            </div>

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
                    <ThemedEmotionFace
                      emotionId={emo.id}
                      theme={activeTheme}
                      gender={childProfile?.characterGender || 'boy'}
                      skinTone={avatar.skinTone}
                      hairColor={avatar.hairColor}
                      className="w-16 h-16 sm:w-20 sm:h-20 mb-2 transition-transform hover:scale-110 drop-shadow-sm"
                    />
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
        </>
      )}
    </div>
  );
};

