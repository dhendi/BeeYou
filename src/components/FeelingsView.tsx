import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EMOTIONS, MOOD_META, TRIGGER_META, COPING_META } from '../data/defaultData';
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
  BarChart3,
  BookOpen,
  HeartPulse,
  Lock,
  Plus,
  Crown
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
    userAgeGroup,
    enabledFeatures,
    moodJournalEntries,
    setShowMoodJournalModal,
    cycleSettings,
    cycleLogs,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
    isPremium,
    triggerUpgrade,
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
      <div className="flex items-center gap-1.5 p-1 bg-rose-100/60 dark:bg-slate-800 rounded-2xl border border-rose-200 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('check-in');
            playChime('tap');
          }}
          className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'check-in'
              ? 'bg-white dark:bg-slate-700 text-rose-950 dark:text-white shadow-xs'
              : 'text-rose-800 hover:text-rose-950 dark:text-slate-300'
          }`}
        >
          <Smile className="w-4 h-4 text-rose-500" />
          <span>Emotion Check-In</span>
        </button>

        {showMoodJournalTab && (
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('journal');
              playChime('tap');
            }}
            className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'journal'
                ? 'bg-white dark:bg-slate-700 text-purple-950 dark:text-white shadow-xs'
                : 'text-purple-800 hover:text-purple-950 dark:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Mood Journal ({moodJournalEntries.length})</span>
          </button>
        )}

        {showCycleTab && (
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('cycle');
              playChime('tap');
            }}
            className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'cycle'
                ? 'bg-white dark:bg-slate-700 text-pink-950 dark:text-white shadow-xs'
                : 'text-pink-800 hover:text-pink-950 dark:text-slate-300'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-pink-600" />
            <span>
              {cycleSettings.discreetMode ? 'Wellness Rhythm' : `Cycle Day ${cyclePhaseInfo?.currentCycleDay || 1}`}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('recollection');
            playChime('tap');
          }}
          className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'recollection'
              ? 'bg-white dark:bg-slate-700 text-amber-950 dark:text-white shadow-xs'
              : 'text-amber-800 hover:text-amber-950 dark:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span>Daily Recollection ({dailyRecollections.length})</span>
        </button>
      </div>

      {activeSubTab === 'recollection' ? (
        <DailyRecollectionChart />
      ) : activeSubTab === 'journal' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-indigo-100 border-2 border-purple-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-200/80 px-2.5 py-0.5 rounded-full">
                  Teens & Adults
                </span>
                <span className="text-xs text-purple-900 font-bold">Deep Emotional & Sensory Reflection</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-950">
                Your Mood Journal 📖
              </h2>
              <p className="text-xs sm:text-sm text-purple-800 font-medium mt-1 max-w-xl">
                Track intensity, energy, sensory distress, triggers, and the coping tools that actually help your neurotype.
              </p>
            </div>
            <button
              onClick={() => {
                setShowMoodJournalModal(true);
                playChime('tap');
              }}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Write Reflection (+3 ⭐)</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Reflections</span>
              <span className="text-xl font-black text-purple-900">{moodJournalEntries.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Latest Emotion</span>
              <span className="text-sm font-black text-purple-900 flex items-center gap-1.5 truncate mt-1">
                {moodJournalEntries[0] ? `${MOOD_META[moodJournalEntries[0].primaryMood]?.emoji || '🌱'} ${MOOD_META[moodJournalEntries[0].primaryMood]?.label || 'None'}` : 'None yet'}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Latest Intensity</span>
              <span className="text-xl font-black text-purple-900">
                {moodJournalEntries[0] ? `${moodJournalEntries[0].moodIntensity}/10` : '-'}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Sensory Distress</span>
              <span className="text-xl font-black text-purple-900">
                {moodJournalEntries[0] ? `${moodJournalEntries[0].sensoryDistress}%` : '-'}
              </span>
            </div>
          </div>

          {/* Entries Feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Reflection Log & Insights
            </h3>

            {moodJournalEntries.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-purple-200 text-center space-y-3">
                <span className="text-4xl block">📝</span>
                <h4 className="font-bold text-slate-700">No reflections written yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Take a calm moment to explore how your body and thoughts feel right now.
                </p>
                <button
                  onClick={() => setShowMoodJournalModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start First Journal Entry</span>
                </button>
              </div>
            ) : (
              moodJournalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-5 shadow-xs space-y-3 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-purple-50">
                        {MOOD_META[entry.primaryMood]?.emoji || '💭'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-900 text-base">
                            {MOOD_META[entry.primaryMood]?.label || entry.primaryMood}
                          </h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Intensity: {entry.moodIntensity}/10
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            Energy: {entry.energyLevel}/5
                          </span>
                          {entry.sensoryDistress > 50 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              Sensory Load: {entry.sensoryDistress}%
                            </span>
                          )}
                          {entry.isPrivate && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5">
                              <Lock className="w-3 h-3" /> Private
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">
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

                    <button
                      onClick={() => setShowMoodJournalModal(true)}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2.5 py-1 rounded-lg hover:bg-purple-50 cursor-pointer"
                    >
                      View / Edit
                    </button>
                  </div>

                  {(entry.journalText || entry.gratitudeOrWin) && (
                    <div className="bg-slate-50/80 rounded-2xl p-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {entry.gratitudeOrWin && (
                        <p className="text-[11px] font-bold text-purple-800 mb-1">
                          Anchor: "{entry.gratitudeOrWin}"
                        </p>
                      )}
                      <p className="whitespace-pre-line">{entry.journalText}</p>
                    </div>
                  )}

                  {/* Triggers & Coping Tools Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {entry.triggers.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {TRIGGER_META[t] ? `${TRIGGER_META[t].emoji} ${TRIGGER_META[t].label}` : `⚡ ${t}`}
                      </span>
                    ))}
                    {entry.copingStrategies.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200"
                      >
                        {COPING_META[c] ? `${COPING_META[c].emoji} ${COPING_META[c].label}` : `🛠️ ${c}`}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeSubTab === 'cycle' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Cycle Tracker Header */}
          <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-amber-100 border-2 border-rose-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl p-3 rounded-2xl bg-white shadow-2xs">
                {cycleSettings.discreetMode ? '🌿' : '🌸'}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2.5 py-0.5 rounded-full">
                    {cycleSettings.discreetMode ? 'Wellness Rhythm' : `Day ${cyclePhaseInfo?.currentCycleDay || 1} of ${cycleSettings.averageCycleLength}`}
                  </span>
                  <span className="text-xs text-rose-950 font-bold">
                    {cyclePhaseInfo?.phaseLabel}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-rose-950">
                  {cycleSettings.discreetMode ? 'Hormonal & Sensory Rhythm Tracker' : 'Menstrual Cycle & Sensory Wellness'}
                </h2>
                <p className="text-xs sm:text-sm text-rose-800 font-medium mt-1 max-w-xl">
                  {cyclePhaseInfo?.phaseDescription}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCycleTrackerModal(true);
                playChime('tap');
              }}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Log Flow & Symptoms (+2 ⭐)</span>
            </button>
          </div>

          {/* Neurodivergent Insight Card */}
          {cyclePhaseInfo?.sensoryInsight && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h3 className="font-black text-amber-950 text-sm sm:text-base">
                  Neurodivergent Sensory & Executive Function Notice
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                {cyclePhaseInfo.sensoryInsight}
              </p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Cycle Length</span>
              <span className="text-xl font-black text-rose-950">{cycleSettings.averageCycleLength} Days</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Days Until Next</span>
              <span className="text-xl font-black text-rose-950">{cyclePhaseInfo?.daysUntilNextPeriod || 0} Days</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Logs</span>
              <span className="text-xl font-black text-rose-950">{cycleLogs.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Period Length</span>
              <span className="text-xl font-black text-rose-950">{cycleSettings.averagePeriodLength} Days</span>
            </div>
          </div>

          {/* Daily Logs History */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Recent Cycle Logs
            </h3>

            {cycleLogs.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-rose-200 text-center space-y-3">
                <span className="text-4xl block">🌸</span>
                <h4 className="font-bold text-slate-700">No cycle logs recorded yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Log when your period starts or record physical and sensory symptoms anytime.
                </p>
                <button
                  onClick={() => setShowCycleTrackerModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Symptoms & Flow</span>
                </button>
              </div>
            ) : (
              cycleLogs.slice(0, 14).map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-5 shadow-xs space-y-2.5 hover:border-rose-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-slate-800">
                        {log.date}
                      </span>
                      {log.flow && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 capitalize">
                          Flow: {log.flow}
                        </span>
                      )}
                      {log.painLevel !== undefined && log.painLevel > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Discomfort: {log.painLevel}/10
                        </span>
                      )}
                      {log.energyLevel !== undefined && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Energy: {log.energyLevel}/5
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setShowCycleTrackerModal(true)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      Update
                    </button>
                  </div>

                  {log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {log.symptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                        >
                          • {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl font-medium">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
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

          {/* Teen/Adult Deeper Reflection Bar */}
          {isTeenOrAdult && (showMoodJournalTab || showCycleTab) && (
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✨</span>
                <div>
                  <span className="text-xs font-black text-purple-950 uppercase tracking-wider block">
                    Looking for deeper reflection?
                  </span>
                  <p className="text-xs text-purple-900 font-medium">
                    Unpack nuanced emotions, energy levels, sensory triggers, or track your cycle rhythms.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {showMoodJournalTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('journal');
                      playChime('tap');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    📖 Mood Journal
                  </button>
                )}
                {showCycleTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('cycle');
                      playChime('tap');
                    }}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    🌸 {cycleSettings.discreetMode ? 'Wellness Rhythm' : 'Cycle Tracker'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. EMOTION GRID */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                1. Choose your feeling:
              </h3>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarCreator(true);
                    playChime('tap');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-900 bg-amber-300 hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
                  title="Open Full Avatar Studio"
                >
                  <span>🎨</span>
                  <span>Avatar Studio</span>
                  {!isPremium && <Crown className="w-3.5 h-3.5 text-amber-900" />}
                </button>
              </div>
            </div>

            {/* ── NONBINARY AVATAR QUICK CONTROLS: HAIRSTYLE, HAIR COLOR & SKIN TONE ── */}
            {!isPremium ? (
              <div 
                onClick={() => triggerUpgrade('Unlock Full Avatar Customizer Studio (Hairstyles, Colors & Accessories)')}
                className="bg-purple-50/80 dark:bg-purple-950/40 p-3 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-xs mb-3 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-400 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-purple-950 dark:text-purple-200 block">
                      Avatar Customizer Studio (Premium)
                    </span>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300">
                      Hairstyles, colors, and adaptive gear are locked on Basic. Tap to start 30-day free trial.
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-black shadow-xs shrink-0">
                  Unlock
                </span>
              </div>
            ) : (
            <div className="bg-slate-50 dark:bg-slate-800/90 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs mb-3 space-y-2.5">
              {/* Row 1: Changeable Hairstyle */}
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                  <span>✂️</span>
                  <span>Hairstyle:</span>
                </span>
                {[
                  { id: 'short', label: 'Short', icon: '🧒' },
                  { id: 'curly', label: 'Curly', icon: '🌀' },
                  { id: 'afro', label: 'Afro Puffs', icon: '👑' },
                  { id: 'spiky', label: 'Spiky', icon: '⚡' },
                  { id: 'braids', label: 'Braids', icon: '🪢' },
                  { id: 'ponytail', label: 'Ponytail', icon: '🐎' },
                  { id: 'bob', label: 'Bob', icon: '🎀' },
                  { id: 'pigtails', label: 'Pigtails', icon: '👧' },
                ].map((hs) => {
                  const isCurrent = avatar.hairStyle === hs.id;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => {
                        updateAvatar({ hairStyle: hs.id as any });
                        playChime('tap');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-600'
                      }`}
                      title={`Select ${hs.label}`}
                    >
                      <span className="text-sm">{hs.icon}</span>
                      <span>{hs.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Changeable Hair Color & Skin Tone */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex-wrap">
                {/* Hair Color Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    <span>💇</span>
                    <span>Hair:</span>
                  </span>
                  {[
                    { color: '#18181b', name: 'Jet Black' },
                    { color: '#451a03', name: 'Dark Brown' },
                    { color: '#78350f', name: 'Chestnut' },
                    { color: '#d97706', name: 'Caramel' },
                    { color: '#facc15', name: 'Golden Blonde' },
                    { color: '#ef4444', name: 'Auburn Red' },
                    { color: '#ec4899', name: 'Pastel Pink' },
                    { color: '#3b82f6', name: 'Sky Blue' },
                    { color: '#10b981', name: 'Emerald Green' },
                    { color: '#a855f7', name: 'Lavender' },
                  ].map((hc) => {
                    const isCurrent = avatar.hairColor === hc.color;
                    return (
                      <button
                        key={hc.color}
                        type="button"
                        onClick={() => {
                          updateAvatar({ hairColor: hc.color });
                          playChime('tap');
                        }}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border-2 transition-transform cursor-pointer shrink-0 flex items-center justify-center relative ${
                          isCurrent
                            ? 'scale-115 border-indigo-600 ring-2 ring-indigo-300 z-10 shadow-xs'
                            : 'border-white dark:border-slate-600 hover:scale-110'
                        }`}
                        style={{ backgroundColor: hc.color }}
                        title={`Hair color: ${hc.name}`}
                      >
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white drop-shadow-xs" />
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Hair Color Input */}
                  <label
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border-2 cursor-pointer shrink-0 flex items-center justify-center relative transition-transform hover:scale-110 bg-gradient-to-tr from-pink-400 via-amber-300 to-indigo-400 ${
                      ![
                        '#18181b', '#451a03', '#78350f', '#d97706', '#facc15',
                        '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#a855f7',
                      ].includes(avatar.hairColor)
                        ? 'scale-115 border-indigo-600 ring-2 ring-indigo-300 z-10 shadow-xs'
                        : 'border-dashed border-slate-300'
                    }`}
                    title="Choose any custom hair color"
                  >
                    <input
                      type="color"
                      value={avatar.hairColor || '#451a03'}
                      onChange={(e) => updateAvatar({ hairColor: e.target.value })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-xs">🎨</span>
                  </label>
                </div>

                {/* Skin Color Swatches */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    <span>🧴</span>
                    <span>Skin:</span>
                  </span>
                  {[
                    { color: '#fef3c7', name: 'Porcelain' },
                    { color: '#fed7aa', name: 'Peach' },
                    { color: '#fcd34d', name: 'Warm Gold' },
                    { color: '#f59e0b', name: 'Golden Amber' },
                    { color: '#d97706', name: 'Honey Bronze' },
                    { color: '#a16207', name: 'Almond' },
                    { color: '#92400e', name: 'Chestnut' },
                    { color: '#5a2e12', name: 'Espresso' },
                  ].map((st) => {
                    const isCurrent = avatar.skinTone === st.color;
                    return (
                      <button
                        key={st.color}
                        type="button"
                        onClick={() => {
                          updateAvatar({ skinTone: st.color });
                          playChime('tap');
                        }}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl border-2 transition-transform cursor-pointer shrink-0 flex items-center justify-center relative ${
                          isCurrent
                            ? 'scale-115 border-indigo-600 ring-2 ring-indigo-300 z-10 shadow-xs'
                            : 'border-white dark:border-slate-600 hover:scale-110'
                        }`}
                        style={{ backgroundColor: st.color }}
                        title={`Skin tone: ${st.name}`}
                      >
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900 drop-shadow-xs" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            )}

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
                      hairStyle={avatar.hairStyle}
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

