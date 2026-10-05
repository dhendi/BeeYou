import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Sparkles,
  Heart,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Filter,
  BarChart2,
  Zap,
  Battery,
  AlertCircle
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { MoodJournalEmotion, MoodTriggerCategory, CopingStrategyUsed, MoodJournalEntry } from '../types';

export const MoodJournalModal: React.FC = () => {
  const {
    moodJournalEntries,
    addMoodJournalEntry,
    deleteMoodJournalEntry,
    showMoodJournalModal,
    setShowMoodJournalModal,
    speak,
    childProfile,
    userAgeGroup,
    cycleSettings,
    getCyclePhaseInfo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'insights'>('new');
  const [selectedMood, setSelectedMood] = useState<MoodJournalEmotion>('reflective');
  const [intensity, setIntensity] = useState<number>(6);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [sensoryDistress, setSensoryDistress] = useState<number>(30);
  const [selectedTriggers, setSelectedTriggers] = useState<MoodTriggerCategory[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<CopingStrategyUsed[]>(['quiet_sensory_break']);
  const [journalText, setJournalText] = useState<string>('');
  const [gratitudeOrWin, setGratitudeOrWin] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [filterMood, setFilterMood] = useState<string>('all');

  if (!showMoodJournalModal) return null;

  // Emotion Definitions
  interface MoodOption {
    id: MoodJournalEmotion;
    label: string;
    emoji: string;
    category: 'positive' | 'reflective' | 'heavy' | 'restless';
    bg: string;
    text: string;
  }

  const moodOptions: MoodOption[] = [
    // Positive / Grounded
    { id: 'peaceful', label: 'Peaceful', emoji: '😌', category: 'positive', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
    { id: 'content', label: 'Content', emoji: '😊', category: 'positive', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-800' },
    { id: 'inspired', label: 'Inspired', emoji: '✨', category: 'positive', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
    { id: 'energized', label: 'Energized', emoji: '⚡', category: 'positive', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' },
    { id: 'confident', label: 'Confident', emoji: '🦁', category: 'positive', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800' },
    { id: 'grateful', label: 'Grateful', emoji: '🙏', category: 'positive', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
    { id: 'focused', label: 'Focused', emoji: '🎯', category: 'positive', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800' },

    // Reflective / Nuanced
    { id: 'reflective', label: 'Reflective', emoji: '💭', category: 'reflective', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800' },
    { id: 'melancholic', label: 'Melancholic', emoji: '🍂', category: 'reflective', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900' },
    { id: 'sensitive', label: 'Sensitive', emoji: '🌾', category: 'reflective', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
    { id: 'spacey', label: 'Spacey', emoji: '🪐', category: 'reflective', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800' },

    // Heavy / Overwhelmed
    { id: 'anxious', label: 'Anxious', emoji: '😟', category: 'heavy', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800' },
    { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊', category: 'heavy', bg: 'bg-violet-50 border-violet-200', text: 'text-violet-800' },
    { id: 'irritable', label: 'Irritable', emoji: '⚡', category: 'heavy', bg: 'bg-red-50 border-red-200', text: 'text-red-800' },
    { id: 'exhausted', label: 'Burnt Out', emoji: '🔋', category: 'heavy', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
    { id: 'sad', label: 'Sad', emoji: '🌧️', category: 'heavy', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
    { id: 'lonely', label: 'Lonely', emoji: '🕯️', category: 'heavy', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800' },
    { id: 'frustrated', label: 'Frustrated', emoji: '😤', category: 'heavy', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800' },
  ];

  const triggerOptions: { id: MoodTriggerCategory; label: string; emoji: string }[] = [
    { id: 'sensory_overload', label: 'Sensory Overload', emoji: '🤯' },
    { id: 'bright_lights', label: 'Bright Lights', emoji: '💡' },
    { id: 'loud_noise', label: 'Loud Noises', emoji: '🔊' },
    { id: 'social_masking', label: 'Social Masking Fatigue', emoji: '🎭' },
    { id: 'social_battery_empty', label: 'Social Battery Drained', emoji: '🪫' },
    { id: 'conflict', label: 'Conflict / Misunderstanding', emoji: '⚡' },
    { id: 'school_work_stress', label: 'School / Work Demands', emoji: '💼' },
    { id: 'routine_change', label: 'Unexpected Plan Change', emoji: '🔄' },
    { id: 'lack_of_sleep', label: 'Poor Sleep / Insomnia', emoji: '🥱' },
    { id: 'hormonal_cycle', label: 'Hormonal / Cycle Shift', emoji: '🌸' },
    { id: 'executive_dysfunction', label: 'Task Paralysis / Brain Fog', emoji: '🌀' },
    { id: 'physical_pain', label: 'Physical Discomfort / Pain', emoji: '🩹' },
    { id: 'hunger_dehydration', label: 'Hunger / Low Hydration', emoji: '💧' },
  ];

  const copingOptions: { id: CopingStrategyUsed; label: string; emoji: string }[] = [
    { id: 'quiet_sensory_break', label: 'Quiet Sensory Break', emoji: '🛋️' },
    { id: 'noise_cancelling_headphones', label: 'Noise-Cancelling Headphones', emoji: '🎧' },
    { id: 'deep_breathing', label: 'Deep Breathing / Pacer', emoji: '🫁' },
    { id: 'stimming_fidgeting', label: 'Stimming & Fidgeting', emoji: '🌀' },
    { id: 'weighted_blanket', label: 'Weighted Blanket / Pressure', emoji: '🦕' },
    { id: 'journaling', label: 'Writing & Journaling', emoji: '✍️' },
    { id: 'listening_to_music', label: 'Comfort Music / Lofi', emoji: '🎵' },
    { id: 'walk_in_nature', label: 'Walk / Fresh Air', emoji: '🌲' },
    { id: 'talking_to_someone', label: 'Vent to Safe Person', emoji: '💬' },
    { id: 'gaming_special_interest', label: 'Special Interest / Hobby', emoji: '🎮' },
    { id: 'nap_rest', label: 'Rest / Power Nap', emoji: '💤' },
    { id: 'hydration_snack', label: 'Water & Comfort Snack', emoji: '🍎' },
  ];

  const toggleTrigger = (trig: MoodTriggerCategory) => {
    setSelectedTriggers((prev) =>
      prev.includes(trig) ? prev.filter((t) => t !== trig) : [...prev, trig]
    );
  };

  const toggleCoping = (cop: CopingStrategyUsed) => {
    setSelectedCoping((prev) =>
      prev.includes(cop) ? prev.filter((c) => c !== cop) : [...prev, cop]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    addMoodJournalEntry({
      date: dateStr,
      time: timeStr,
      primaryMood: selectedMood,
      moodIntensity: intensity,
      energyLevel,
      sensoryDistress,
      triggers: selectedTriggers,
      copingStrategies: selectedCoping,
      journalText: journalText.trim(),
      gratitudeOrWin: gratitudeOrWin.trim() || undefined,
      isPrivate,
    });

    setJournalText('');
    setGratitudeOrWin('');
    setActiveTab('history');
  };

  const handleSpeakPrompt = (text: string) => {
    speak(text);
  };

  const cycleInfo = cycleSettings?.enabled ? getCyclePhaseInfo() : null;

  // Filtered entries
  const filteredEntries = moodJournalEntries.filter((e) => {
    if (filterMood === 'all') return true;
    return e.primaryMood === filterMood;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col border-2 border-indigo-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-xs">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  {userAgeGroup === 'adult' ? 'Personal Journal' : 'Teen Reflection'}
                </span>
                {cycleInfo && (
                  <span className="text-[10px] font-bold bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                    Cycle Day {cycleInfo.currentCycleDay} • {cycleInfo.phaseLabel.split(' ')[0]}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                Mood & Emotional Journal
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowMoodJournalModal(false);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('new');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Past Entries ({moodJournalEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('insights');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Mood Patterns</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: NEW ENTRY */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Mood Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Primary Emotional State</span>
                    <span className="text-purple-600">*</span>
                  </label>
                  <span className="text-xs font-bold text-slate-500">
                    Selected: {moodOptions.find((m) => m.id === selectedMood)?.label} {moodOptions.find((m) => m.id === selectedMood)?.emoji}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {moodOptions.map((opt) => {
                    const isSelected = selectedMood === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setSelectedMood(opt.id);
                          playChime('tap');
                        }}
                        className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          isSelected
                            ? `${opt.bg} ring-2 ring-indigo-500 scale-102 shadow-xs font-black`
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs truncate w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Intensity & Sensory Distress Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Intensity */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Mood Intensity</span>
                    <span className="font-black text-indigo-700">{intensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Intense</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Internal Energy</span>
                    <span className="font-black text-amber-700">
                      {['Drained 🔋', 'Low 🪫', 'Steady ⚡', 'High 🚀', 'Overcharged 💥'][energyLevel - 1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Drained</span>
                    <span>Balanced</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Sensory Distress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Sensory Load</span>
                    <span className="font-black text-rose-700">{sensoryDistress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sensoryDistress}
                    onChange={(e) => setSensoryDistress(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Calm</span>
                    <span>Sensitive</span>
                    <span>Overload</span>
                  </div>
                </div>
              </div>

              {/* 3. Triggers & Influences */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  2. Triggers & Influences (Tap all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {triggerOptions.map((trig) => {
                    const isSelected = selectedTriggers.includes(trig.id);
                    return (
                      <button
                        type="button"
                        key={trig.id}
                        onClick={() => toggleTrigger(trig.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{trig.emoji}</span>
                        <span>{trig.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Coping Strategies Used */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  3. Self-Care & Coping Tools (What helped regulate your system?)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {copingOptions.map((cop) => {
                    const isSelected = selectedCoping.includes(cop.id);
                    return (
                      <button
                        type="button"
                        key={cop.id}
                        onClick={() => toggleCoping(cop.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-100 text-teal-900 border border-teal-300 shadow-2xs font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{cop.emoji}</span>
                        <span>{cop.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Freeform Journal Writing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    4. Freeform Thoughts & Reflection
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setJournalText((prev) =>
                          prev ? `${prev}\n\nRight now, my body needs:` : 'Right now, my body needs: '
                        )
                      }
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      + Prompt Starter
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Write freely... How did your day feel? Did anything trigger sensory overwhelm or masking fatigue? What does your nervous system need right now?"
                  className="w-full p-3.5 rounded-2xl bg-white border border-slate-300 font-medium text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* 6. Positive Anchor / Gratitude */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  5. Positive Anchor / Win of the Day (Optional)
                </label>
                <input
                  type="text"
                  value={gratitudeOrWin}
                  onChange={(e) => setGratitudeOrWin(e.target.value)}
                  placeholder="e.g. Took a sensory break before melting down, enjoyed my favorite song"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-medium text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private Entry</span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm shadow-md shadow-indigo-200 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-indigo-200" />
                  <span>Save Journal Entry</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PAST REFLECTIONS */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Filter Row */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-500">Filter:</span>
                  <select
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-300 font-bold text-xs"
                  >
                    <option value="all">All Moods</option>
                    {moodOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-slate-500 font-semibold">
                  Showing {filteredEntries.length} of {moodJournalEntries.length} entries
                </span>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <p className="font-semibold text-sm">No journal entries found.</p>
                  <p className="text-xs mt-1">Tap "New Reflection" to log your first mood entry.</p>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const moodObj = moodOptions.find((m) => m.id === entry.primaryMood);
                  return (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-3"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-2xl bg-slate-50 border border-slate-100">
                            {moodObj?.emoji || '💭'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-base text-slate-900">
                                {moodObj?.label || entry.primaryMood}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                                Intensity {entry.moodIntensity}/10
                              </span>
                              {entry.isPrivate && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                  <Lock className="w-3 h-3" />
                                  <span>Private</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {entry.date} at {entry.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {entry.journalText && (
                            <button
                              type="button"
                              onClick={() => handleSpeakPrompt(entry.journalText)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Listen to reflection"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this journal entry?')) {
                                deleteMoodJournalEntry(entry.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Journal text */}
                      {entry.journalText && (
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 whitespace-pre-line">
                          {entry.journalText}
                        </p>
                      )}

                      {/* Gratitude / Win */}
                      {entry.gratitudeOrWin && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-300 shrink-0" />
                          <span>Win / Anchor: {entry.gratitudeOrWin}</span>
                        </div>
                      )}

                      {/* Tags row */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {entry.triggers.map((t) => {
                          const trigObj = triggerOptions.find((o) => o.id === t);
                          return (
                            <span
                              key={t}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200"
                            >
                              {trigObj?.emoji} {trigObj?.label || t}
                            </span>
                          );
                        })}

                        {entry.copingStrategies.map((c) => {
                          const copObj = copingOptions.find((o) => o.id === c);
                          return (
                            <span
                              key={c}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                            >
                              {copObj?.emoji} {copObj?.label || c}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: MOOD PATTERNS & INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                <h4 className="font-black text-sm text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Neurodivergent Pattern Insights</span>
                </h4>
                <p className="text-xs text-indigo-800 mt-1">
                  Understanding what drains your nervous system and what restores your sensory battery is key to sustainable independence.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block">Total Entries</span>
                  <span className="text-2xl font-black text-slate-800">{moodJournalEntries.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block">Avg Intensity</span>
                  <span className="text-2xl font-black text-indigo-700">
                    {moodJournalEntries.length > 0
                      ? (
                          moodJournalEntries.reduce((acc, e) => acc + e.moodIntensity, 0) /
                          moodJournalEntries.length
                        ).toFixed(1)
                      : '0'}
                    /10
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block">Avg Sensory Load</span>
                  <span className="text-2xl font-black text-rose-700">
                    {moodJournalEntries.length > 0
                      ? Math.round(
                          moodJournalEntries.reduce((acc, e) => acc + (e.sensoryDistress || 30), 0) /
                            moodJournalEntries.length
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block">Top Restorer</span>
                  <span className="text-xs font-black text-teal-800 mt-1 block truncate">
                    🎧 Headphones
                  </span>
                </div>
              </div>

              {/* Frequent Triggers Analysis */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Top Sensory & Environmental Triggers
                </h5>
                <div className="space-y-1.5">
                  {triggerOptions.slice(0, 5).map((trig) => {
                    const count = moodJournalEntries.filter((e) => e.triggers.includes(trig.id)).length;
                    const percent = moodJournalEntries.length > 0 ? (count / moodJournalEntries.length) * 100 : 0;
                    return (
                      <div key={trig.id} className="space-y-0.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{trig.emoji} {trig.label}</span>
                          <span>{count} times ({Math.round(percent)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            🔒 Private & stored locally on this device
          </span>

          <button
            type="button"
            onClick={() => {
              setShowMoodJournalModal(false);
              playChime('tap');
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
