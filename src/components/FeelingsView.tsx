import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMOTIONS, MOOD_META, COPING_META } from '../data/defaultData';
import { EmotionType } from '../types';
import { ThemedEmotionFace } from './ThemedEmotionFace';
import { 
  Wind, 
  CheckCircle2, 
  Smile,
  BarChart3,
  BookOpen,
  HeartPulse,
  Plus,
  Volume2
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { DailyRecollectionChart } from './DailyRecollectionChart';

export const FeelingsView: React.FC = () => {
  const {
    currentMood,
    recordEmotion,
    speak,
    announce,
    setShowCopingToolkit,
    dailyRecollections,
    activeTheme,
    avatar,
    userAgeGroup,
    enabledFeatures,
    moodJournalEntries,
    setShowMoodJournalModal,
    cycleSettings,
    cycleLogs,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
    setShowFivePointModal,
  } = useApp();

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const showMoodJournalTab = isTeenOrAdult && enabledFeatures?.moodJournal !== false;
  const showCycleTab = isTeenOrAdult && enabledFeatures?.cycleTracker !== false;
  const cyclePhaseInfo = isTeenOrAdult ? getCyclePhaseInfo() : null;

  const [activeSubTab, setActiveSubTab] = useState<'check-in' | 'journal' | 'cycle' | 'recollection'>('check-in');
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
    announce(`I feel ${label}.`);
  };

  const getCheckInSummary = () => {
    if (!selectedEmotion) return '';
    const emotionObj = EMOTIONS.find((e) => e.id === selectedEmotion);
    return `I feel ${emotionObj?.label}. ${
      selectedReason ? `Because ${selectedReason.toLowerCase()}. ` : ''
    }${selectedNeed ? `Right now, ${selectedNeed.toLowerCase()}.` : ''}`;
  };

  const handleCompleteCheckIn = () => {
    if (!selectedEmotion) return;
    recordEmotion(selectedEmotion, selectedReason || undefined, selectedNeed || undefined);
    setSavedCheckIn(true);
    playChime('star');

    const summary = getCheckInSummary();
    announce(summary);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* ── TOP CLEAN NAVIGATION BAR ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('check-in');
            playChime('tap');
          }}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'check-in'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
          }`}
        >
          <Smile className="w-4 h-4 text-amber-500" />
          <span>Feelings</span>
        </button>

        {showMoodJournalTab && (
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('journal');
              playChime('tap');
            }}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'journal'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Journal ({moodJournalEntries.length})</span>
          </button>
        )}

        {showCycleTab && (
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('cycle');
              playChime('tap');
            }}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'cycle'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-pink-600" />
            <span>
              {cycleSettings.discreetMode ? 'Rhythm' : `Day ${cyclePhaseInfo?.currentCycleDay || 1}`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('recollection');
            playChime('tap');
          }}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'recollection'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <span>Reflections ({dailyRecollections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowFivePointModal(true);
            playChime('tap');
          }}
          className="min-w-[100px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
          title="Open 5-Point Emotional Scale"
        >
          <span>🌡️</span>
          <span>Scale</span>
        </button>
      </div>

      {activeSubTab === 'recollection' ? (
        <DailyRecollectionChart />
      ) : activeSubTab === 'journal' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Mood Journal 📖
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-xl">
                Track emotional intensity, sensory load, and helpful coping tools.
              </p>
            </div>
            <button
              onClick={() => {
                setShowMoodJournalModal(true);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>

          <div className="space-y-3">
            {moodJournalEntries.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                <span className="text-3xl block">📝</span>
                <h4 className="font-bold text-slate-700 text-sm">No reflections written yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Take a calm moment to explore how your body and thoughts feel right now.
                </p>
              </div>
            ) : (
              moodJournalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-50">
                        {MOOD_META[entry.primaryMood]?.emoji || '💭'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {MOOD_META[entry.primaryMood]?.label || entry.primaryMood}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Intensity: {entry.moodIntensity}/10
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(entry.timestamp).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(entry.notes || entry.journalText) && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      {entry.notes || entry.journalText}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeSubTab === 'cycle' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {cycleSettings.discreetMode ? 'Wellness Rhythm' : 'Cycle Tracker'} 🌸
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-xl">
                {cyclePhaseInfo?.phaseDescription || 'Log physical and sensory symptoms anytime.'}
              </p>
            </div>

            <button
              onClick={() => {
                setShowCycleTrackerModal(true);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Log Entry</span>
            </button>
          </div>

          <div className="space-y-3">
            {cycleLogs.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                <span className="text-3xl block">🌸</span>
                <h4 className="font-bold text-slate-700 text-sm">No cycle logs recorded yet</h4>
              </div>
            ) : (
              cycleLogs.slice(0, 14).map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-800">{log.date}</span>
                    {log.flow && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 capitalize">
                        {log.flow}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── CLEAN, CALM FEELINGS HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                How are you feeling?
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your feeling to share how you feel and find calming tools.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowCopingToolkit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>Calm Tools</span>
              </button>
            </div>
          </div>

          {/* ── 11 EMOTION CARDS (CLEAN MATTE GRID) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {EMOTIONS.map((emo) => {
              const isSelected = selectedEmotion === emo.id;
              return (
                <button
                  key={emo.id}
                  onClick={() => handleSelectEmotion(emo.id, emo.label)}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-300 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <ThemedEmotionFace
                    emotionId={emo.id}
                    theme={activeTheme}
                    skinTone={avatar.skinTone}
                    className="w-14 h-14 sm:w-16 sm:h-16 mb-1.5 transition-transform hover:scale-105"
                  />
                  <span
                    className="font-bold text-xs sm:text-sm tracking-tight text-center leading-tight"
                    style={{ color: emo.color }}
                  >
                    {emo.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── 2. WHAT HAPPENED? (Clean, Calm Follow-up) ── */}
          {selectedEmotion && (
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                What happened? (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reasons.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedReason(selectedReason === r.text ? null : r.text);
                      playChime('tap');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      selectedReason === r.text
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-black'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <span>{r.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. WHAT DO I NEED? ── */}
          {selectedEmotion && (
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                What would help you right now?
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
                    className={`p-2.5 rounded-xl border text-left font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      selectedNeed === n.text
                        ? 'bg-teal-50 border-teal-300 text-teal-950 font-black'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{n.emoji}</span>
                    <span className="flex-1">{n.text}</span>
                    {n.action === 'toolkit' && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                        Toolkit
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. SAVE & CONFIRM CHECK-IN ── */}
          {selectedEmotion && (
            <div className="pt-2 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full max-w-md">
                <button
                  onClick={handleCompleteCheckIn}
                  className="flex-1 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Check-In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const summary = getCheckInSummary();
                    if (summary) speak(summary);
                  }}
                  className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Speak check-in aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

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
