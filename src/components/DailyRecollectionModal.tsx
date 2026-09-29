import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Smile, 
  Zap, 
  AlertTriangle, 
  Trophy, 
  Moon, 
  MessageSquare,
  HelpCircle,
  Users,
  Mic
} from 'lucide-react';
import { 
  DAY_RATING_OPTIONS, 
  ENERGY_OPTIONS, 
  CHALLENGE_OPTIONS, 
  WIN_OPTIONS, 
  SLEEP_OPTIONS,
  DayRating,
  EnergyLevelType,
  ChallengeType,
  WinType,
  SleepQualityType
} from '../data/recollectionData';
import { EMOTIONS } from '../data/defaultData';
import { EmotionType } from '../types';
import { playChime } from '../utils/audio';
import { ThemedEmotionFace } from './ThemedEmotionFace';

export const DailyRecollectionModal: React.FC = () => {
  const {
    showRecollectionModal,
    setShowRecollectionModal,
    addDailyRecollection,
    dailyRecollections,
    childProfile,
    speak,
    activeTheme,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const existingToday = dailyRecollections.find((r) => r.date === todayStr);

  const [submittedBy, setSubmittedBy] = useState<'child' | 'parent' | 'together'>(
    existingToday?.submittedBy || 'together'
  );
  const [overallDay, setOverallDay] = useState<DayRating>(
    existingToday?.overallDay || 'good'
  );
  const [energyLevel, setEnergyLevel] = useState<EnergyLevelType>(
    existingToday?.energyLevel || 'calm'
  );
  const [primaryFeeling, setPrimaryFeeling] = useState<EmotionType>(
    existingToday?.primaryFeeling || 'happy'
  );
  const [mainChallenge, setMainChallenge] = useState<ChallengeType>(
    existingToday?.mainChallenge || 'none'
  );
  const [bestWin, setBestWin] = useState<WinType>(
    existingToday?.bestWin || 'routine_success'
  );
  const [sleepQuality, setSleepQuality] = useState<SleepQualityType>(
    existingToday?.sleepQuality || 'slept_well'
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    existingToday?.additionalNotes || ''
  );
  const [useDropdownMode, setUseDropdownMode] = useState<boolean>(false);

  if (!showRecollectionModal) return null;

  const handleSave = () => {
    addDailyRecollection({
      date: todayStr,
      submittedBy,
      overallDay,
      energyLevel,
      primaryFeeling,
      mainChallenge,
      bestWin,
      sleepQuality,
      additionalNotes: additionalNotes.trim() || undefined,
      starsAwarded: 3,
    });
    setShowRecollectionModal(false);
  };

  const handleSpeechPrompt = (text: string) => {
    speak(text);
    playChime('tap');
  };

  const quickNoteChips = [
    'Loved the playground & swings 🛝',
    'Finished routine without frustration ⏰',
    'Got overwhelmed when it was too loud 🎧',
    'Took 3 deep calm breaths 🌬️',
    'Enjoyed quiet reading time 📖',
    'Tried a new food at dinner 🥦',
    'Speech/OT session went wonderfully 🌟',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-amber-300 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER (Anchored) */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 dark:from-slate-800 dark:to-slate-850 border-b-2 border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl select-none">🌙</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded-full">
                  Evening Check-In
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Daily Mood & Recollection Chart
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseDropdownMode(!useDropdownMode)}
              className="text-[11px] font-bold text-amber-800 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer hidden sm:inline-block"
              title="Toggle between button cards and dropdown view"
            >
              {useDropdownMode ? '🗂️ Card Mode' : '📋 Quick Selectors'}
            </button>

            <button
              onClick={() => setShowRecollectionModal(false)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          {/* Who is answering selector */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Who is filling out today's reflection?</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSubmittedBy('child')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  submittedBy === 'child'
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200'
                }`}
              >
                🧒 {childProfile.name}
              </button>
              <button
                type="button"
                onClick={() => setSubmittedBy('together')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  submittedBy === 'together'
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200'
                }`}
              >
                🤝 Together
              </button>
              <button
                type="button"
                onClick={() => setSubmittedBy('parent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  submittedBy === 'parent'
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200'
                }`}
              >
                🧑‍🍼 Parent
              </button>
            </div>
          </div>

          {/* QUESTION 1: HOW WAS TODAY OVERALL? */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>1. How was today overall?</span>
                <button
                  type="button"
                  onClick={() => handleSpeechPrompt('How was today overall?')}
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  title="Speak question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </label>
              <span className="text-[11px] font-bold text-slate-400">Required</span>
            </div>

            {useDropdownMode ? (
              <select
                value={overallDay}
                onChange={(e) => setOverallDay(e.target.value as DayRating)}
                className="w-full p-3 rounded-2xl border-2 border-slate-200 bg-white font-bold text-sm text-slate-800 focus:border-amber-400 outline-hidden"
              >
                {DAY_RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DAY_RATING_OPTIONS.map((opt) => {
                  const isSelected = overallDay === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setOverallDay(opt.value);
                        playChime('tap');
                        speak(opt.label);
                      }}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-amber-400 ring-3 ring-amber-300 font-black shadow-md scale-102'
                          : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700'
                      }`}
                      style={{ backgroundColor: isSelected ? opt.bgColor : undefined }}
                    >
                      <span className="text-3xl mb-1 select-none">{opt.emoji}</span>
                      <span className="text-xs font-black leading-tight" style={{ color: isSelected ? opt.color : undefined }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* QUESTION 2: ENERGY LEVEL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>2. Energy Level</span>
                <button
                  type="button"
                  onClick={() => handleSpeechPrompt('How was your energy level today?')}
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  title="Speak question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </label>
              <span className="text-[11px] font-medium text-slate-400">Regulation & fatigue</span>
            </div>

            {useDropdownMode ? (
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyLevelType)}
                className="w-full p-3 rounded-2xl border-2 border-slate-200 bg-white font-bold text-sm text-slate-800 focus:border-amber-400 outline-hidden"
              >
                {ENERGY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ENERGY_OPTIONS.map((opt) => {
                  const isSelected = energyLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setEnergyLevel(opt.value);
                        playChime('tap');
                        speak(opt.label);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-200 bg-sky-50 dark:bg-sky-950/40 font-black shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 bg-white dark:bg-slate-800 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl select-none">{opt.emoji}</span>
                        <span className="text-xs font-black">{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* QUESTION 3: PRIMARY FEELING */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>3. Biggest Feeling Today</span>
                <button
                  type="button"
                  onClick={() => handleSpeechPrompt('What was your main feeling today?')}
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  title="Speak question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </label>
              <span className="text-[11px] font-medium text-slate-400">Emotional tone</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EMOTIONS.slice(0, 6).map((emo) => {
                const isSelected = primaryFeeling === emo.id;
                return (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() => {
                      setPrimaryFeeling(emo.id);
                      playChime('tap');
                      speak(emo.label);
                    }}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-rose-400 ring-2 ring-rose-200 font-black shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                    style={{ backgroundColor: isSelected ? emo.bgColor : undefined }}
                  >
                    <ThemedEmotionFace
                      emotionId={emo.id}
                      theme={activeTheme}
                      className="w-10 h-10 mb-1 transition-transform hover:scale-110"
                    />
                    <span className="text-[11px] font-bold truncate max-w-full" style={{ color: emo.color }}>
                      {emo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION 4: MAIN CHALLENGE OR SENSORY TRIGGER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>4. What was the biggest challenge?</span>
                <button
                  type="button"
                  onClick={() => handleSpeechPrompt('What was the biggest challenge or sensory trigger today?')}
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  title="Speak question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </label>
              <span className="text-[11px] font-medium text-slate-400">Important for therapy</span>
            </div>

            <select
              value={mainChallenge}
              onChange={(e) => setMainChallenge(e.target.value as ChallengeType)}
              className="w-full p-3 rounded-2xl border-2 border-slate-200 bg-white dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100 focus:border-amber-400 outline-hidden"
            >
              {CHALLENGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label} — {opt.description}
                </option>
              ))}
            </select>
          </div>

          {/* QUESTION 5: TODAY'S BEST WIN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>5. Today's Best Win & Celebration</span>
                <button
                  type="button"
                  onClick={() => handleSpeechPrompt('What went awesome today?')}
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  title="Speak question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </label>
              <span className="text-[11px] font-medium text-emerald-600 font-bold">Positive reinforcement</span>
            </div>

            <select
              value={bestWin}
              onChange={(e) => setBestWin(e.target.value as WinType)}
              className="w-full p-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-sm text-slate-800 dark:text-slate-100 focus:border-emerald-400 outline-hidden"
            >
              {WIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label} — {opt.description}
                </option>
              ))}
            </select>
          </div>

          {/* OPTIONAL QUESTION: SLEEP QUALITY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sleep Quality (Last Night):</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SLEEP_OPTIONS.map((opt) => {
                const isSelected = sleepQuality === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSleepQuality(opt.value);
                      playChime('tap');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mr-1">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADDITIONAL NOTES & THERAPIST MEMO */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Anything else to say? (Notes for family or therapist)</span>
              </label>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>

            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Loved the sensory swing at therapy. Had a tough transition at lunch, but used headphones. Took deep breaths nicely."
              className="w-full p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-hidden resize-none"
            />

            {/* Quick helper chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 self-center">Tap to insert:</span>
              {quickNoteChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAdditionalNotes((prev) => (prev ? `${prev} ${chip}` : chip));
                    playChime('tap');
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER WITH SAVE + STAR REWARD */}
        <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span>Earns +3 Stars upon saving! ⭐⭐⭐</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowRecollectionModal(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Complete Reflection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
