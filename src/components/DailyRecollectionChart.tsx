import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Sparkles, 
  Smile, 
  Zap, 
  AlertTriangle, 
  Trophy, 
  Moon, 
  Copy, 
  Check, 
  PlusCircle, 
  Trash2, 
  FileText, 
  TrendingUp, 
  HelpCircle,
  Share2,
  Crown
} from 'lucide-react';
import { 
  DAY_RATING_OPTIONS, 
  ENERGY_OPTIONS, 
  CHALLENGE_OPTIONS, 
  WIN_OPTIONS, 
  SLEEP_OPTIONS,
  generateTherapistSummaryText,
  DailyRecollectionEntry
} from '../data/recollectionData';
import { EMOTIONS } from '../data/defaultData';
import { playChime } from '../utils/audio';
import { ThemedEmotionFace } from './ThemedEmotionFace';

export const DailyRecollectionChart: React.FC<{ isParentPortal?: boolean; onStartTour?: () => void }> = ({ 
  isParentPortal = false,
  onStartTour,
}) => {
  const {
    dailyRecollections,
    setShowRecollectionModal,
    deleteDailyRecollection,
    childProfile,
    activeTheme,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'7' | '14' | 'all'>('7');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = dailyRecollections.some((r) => r.date === todayStr);

  // Filter entries
  const sortedEntries = [...dailyRecollections].sort((a, b) => b.timestamp - a.timestamp);
  const filteredEntries = sortedEntries.filter((e) => {
    if (dateFilter === 'all') return true;
    const daysAgoLimit = parseInt(dateFilter, 10);
    const timeLimit = Date.now() - daysAgoLimit * 86400000;
    return e.timestamp >= timeLimit;
  });

  // Calculate metrics
  const totalLogged = filteredEntries.length;
  const positiveDays = filteredEntries.filter(
    (e) => e.overallDay === 'great' || e.overallDay === 'good'
  ).length;
  const positivePercentage = totalLogged > 0 ? Math.round((positiveDays / totalLogged) * 100) : 0;

  const handleCopyReport = () => {
    if (!isPremium) {
      triggerUpgrade('Therapist Clinical Summaries & IEP reports are a BeeYou Premium feature! Start your 30-day free trial.');
      return;
    }
    const text = generateTherapistSummaryText(filteredEntries, childProfile.name);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedReport(true);
      playChime('star');
      setTimeout(() => setCopiedReport(false), 3000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. HERO & ACTION BAR */}
      <div data-tour="recollection-chart-card" className="bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 dark:from-slate-800 dark:to-slate-850 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
              End-of-Day Recollection Chart
            </span>
            <span className="text-xs font-bold text-amber-900">
              {totalLogged} Days Recorded
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {childProfile.name}'s Day-to-Day Summary
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Daily mood trends, energy regulation, and quick summaries for parents & therapists.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-black text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>💡 How This Works</span>
            </button>
          )}
          <button
            onClick={() => {
              setShowRecollectionModal(true);
              playChime('tap');
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
              loggedToday
                ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 animate-pulse'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            <span>{loggedToday ? "Edit Today's Log 📝" : "Log Today's Reflection ⭐"}</span>
          </button>
        </div>
      </div>

      {/* 2. CLINICAL OVERVIEW TILES */}
      <div data-tour="recollection-metrics-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-emerald-200 shadow-xs">
          <span className="text-[10px] font-black uppercase text-emerald-700 block">
            Positive Mood Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-300">
              {positivePercentage}%
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              ({positiveDays}/{totalLogged} days)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Great or Good overall days
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-sky-200 shadow-xs">
          <span className="text-[10px] font-black uppercase text-sky-700 block">
            Energy Stability
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-sky-950 dark:text-sky-300">
              {filteredEntries.filter((e) => e.energyLevel === 'calm').length}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">days calm</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Regulated & engaged
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 shadow-xs">
          <span className="text-[10px] font-black uppercase text-amber-800 block">
            Top Challenge
          </span>
          <div className="flex items-center gap-1.5 mt-1 truncate">
            <span className="text-xl">🔄</span>
            <span className="text-xs font-black text-amber-950 dark:text-amber-300 truncate">
              Plan / Routine Change
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Sensory & transitions
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-purple-200 shadow-xs">
          <span className="text-[10px] font-black uppercase text-purple-700 block">
            Top Win Strategy
          </span>
          <div className="flex items-center gap-1.5 mt-1 truncate">
            <span className="text-xl">⏰</span>
            <span className="text-xs font-black text-purple-950 dark:text-purple-300 truncate">
              Smooth Routines
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Visual timer & structure
          </span>
        </div>
      </div>

      {/* 3. THERAPIST SUMMARY REPORT CARD (Ready to Copy/Share) */}
      <div data-tour="recollection-export-btn" className="bg-slate-50 dark:bg-slate-850 rounded-3xl border-2 border-slate-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                Therapist Clinical Summary
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Structured overview prepared for Speech, OT, PT, BCBA, or Pediatrician
              </p>
            </div>
          </div>

          {!isPremium ? (
            <button
              onClick={() => triggerUpgrade('Therapist Clinical Summaries & IEP reports are a BeeYou Premium feature! Start your 30-day free trial.')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>Unlock Therapist Summary (30d Trial)</span>
            </button>
          ) : (
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReport ? 'Report Copied to Clipboard! ✓' : 'Copy Therapist Summary'}</span>
            </button>
          )}
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
          {generateTherapistSummaryText(filteredEntries.slice(0, 7), childProfile.name)}
        </div>
      </div>

      {/* 4. DAY-BY-DAY RECOLLECTION TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Day-by-Day Historical Log</span>
          </h4>

          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDateFilter('7')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                dateFilter === '7' ? 'bg-white shadow-xs text-amber-700 font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => {
                if (!isPremium) {
                  triggerUpgrade('14-day & 30-day Journal History is a BeeYou Premium feature! Start your 30-day free trial.');
                  return;
                }
                setDateFilter('14');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                dateFilter === '14' ? 'bg-white shadow-xs text-amber-700 font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>14 Days</span>
              {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
            </button>
            <button
              onClick={() => {
                if (!isPremium) {
                  triggerUpgrade('Unlimited Journal & Mood History is a BeeYou Premium feature! Start your 30-day free trial.');
                  return;
                }
                setDateFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                dateFilter === 'all' ? 'bg-white shadow-xs text-amber-700 font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>All</span>
              {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
            </button>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">No recollection entries in this period.</p>
            <button
              onClick={() => setShowRecollectionModal(true)}
              className="mt-3 px-4 py-2 bg-amber-400 text-amber-950 font-black text-xs rounded-xl shadow-xs"
            >
              Log Today's Reflection Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEntries.map((entry) => {
              const rating = DAY_RATING_OPTIONS.find((r) => r.value === entry.overallDay);
              const energy = ENERGY_OPTIONS.find((e) => e.value === entry.energyLevel);
              const challenge = CHALLENGE_OPTIONS.find((c) => c.value === entry.mainChallenge);
              const win = WIN_OPTIONS.find((w) => w.value === entry.bestWin);
              const emotion = EMOTIONS.find((e) => e.id === entry.primaryFeeling);
              const sleep = SLEEP_OPTIONS.find((s) => s.value === entry.sleepQuality);

              return (
                <div
                  key={entry.id}
                  className="p-3.5 sm:p-4 rounded-3xl border-2 border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800 shadow-xs transition-all space-y-2.5"
                >
                  {/* Top Bar: Date, Day Rating Emoji & Submitter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl select-none">{rating?.emoji || '📅'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full font-black text-[10px]"
                            style={{ backgroundColor: rating?.bgColor, color: rating?.color }}
                          >
                            {rating?.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Answered {entry.submittedBy === 'child' ? 'by Kid 🧒' : entry.submittedBy === 'parent' ? 'by Caregiver 🧑‍🍼' : 'Together 🤝'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isParentPortal && (
                        <button
                          onClick={() => deleteDailyRecollection(entry.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pills row: Energy, Primary Emotion, Win, Challenge, Sleep */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200">
                      <span>{energy?.emoji}</span>
                      <span>{energy?.label}</span>
                    </span>

                    {emotion && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border"
                        style={{ backgroundColor: emotion.bgColor, color: emotion.color, borderColor: emotion.color + '40' }}
                      >
                        <ThemedEmotionFace
                          emotionId={emotion.id}
                          theme={activeTheme}
                          className="w-6 h-6 flex-shrink-0"
                        />
                        <span>{emotion.label}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                      <span>{win?.emoji}</span>
                      <span>Win: {win?.label}</span>
                    </span>

                    {entry.mainChallenge !== 'none' && challenge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200">
                        <span>{challenge.emoji}</span>
                        <span>Trigger: {challenge.label}</span>
                      </span>
                    )}

                    {sleep && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px]">
                        <span>{sleep.emoji}</span>
                        <span>{sleep.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Additional notes quote box */}
                  {entry.additionalNotes && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 text-xs text-slate-700 dark:text-slate-300 font-medium italic">
                      "{entry.additionalNotes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
