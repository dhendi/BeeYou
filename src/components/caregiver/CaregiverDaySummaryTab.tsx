import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2 } from 'lucide-react';
import { t } from '../../services/translator';
import { playChime } from '../../utils/audio';
import { getAlertHistory } from '../../services/caregiverSync';
import { DailyRecollectionEntry, MoodJournalEntry } from '../../types';

interface CaregiverDaySummaryTabProps {
  onShowNotification?: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverDaySummaryTab: React.FC<CaregiverDaySummaryTabProps> = ({
  onShowNotification,
  onStartTour,
}) => {
  const {
    childProfile,
    dailyRecollections,
    setShowRecollectionModal,
    deleteDailyRecollection,
    clearAllDailyRecollections,
    moodJournalEntries,
    routines,
    habits,
    earnedStickers,
    currentMood,
    medications,
    getCyclePhaseInfo,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const habitsCompletedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const stars = earnedStickers.length;
  const completedRoutinesCount = routines.filter((r) => r.steps.length > 0 && r.steps.every((s) => s.completed)).length;

  const [copiedReport, setCopiedReport] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'7days' | '30days' | 'all'>('7days');

  // Compute 7-day limit vs Unlimited for Premium
  const sortedRecollections = useMemo(() => {
    return [...dailyRecollections].sort((a, b) => b.timestamp - a.timestamp);
  }, [dailyRecollections]);

  const displayedRecollections = useMemo(() => {
    if (!isPremium || filterPeriod === '7days') {
      return sortedRecollections.slice(0, 7);
    }
    if (filterPeriod === '30days') {
      return sortedRecollections.slice(0, 30);
    }
    return sortedRecollections;
  }, [sortedRecollections, isPremium, filterPeriod]);

  // Formatted Therapist Summary Generator (100% Free of unicode emojis)
  const generateTherapistSummary = () => {
    const alertsHistory = getAlertHistory();
    const cycle = getCyclePhaseInfo ? getCyclePhaseInfo() : null;
    const childName = childProfile.name || 'Child';
    const entriesToSummarize = displayedRecollections;
    const totalDays = entriesToSummarize.length;

    const greatOrGoodCount = entriesToSummarize.filter(
      (e) => e.overallDay === 'great' || e.overallDay === 'good'
    ).length;
    const difficultCount = entriesToSummarize.filter(
      (e) => e.overallDay === 'difficult' || e.overallDay === 'very_hard'
    ).length;
    const positiveRatio = totalDays > 0 ? Math.round((greatOrGoodCount / totalDays) * 100) : 100;

    // Routine & Habit Completion Rate
    const routineStats = routines.length > 0
      ? `${completedRoutinesCount}/${routines.length} routines completed today (${Math.round((completedRoutinesCount / routines.length) * 100)}%)`
      : 'Routines logged on child device';

    // Top challenges & triggers
    const challengeCounts: Record<string, number> = {};
    entriesToSummarize.forEach((e) => {
      if (e.mainChallenge && e.mainChallenge !== 'none') {
        challengeCounts[e.mainChallenge] = (challengeCounts[e.mainChallenge] || 0) + 1;
      }
    });

    // Top wins
    const winCounts: Record<string, number> = {};
    entriesToSummarize.forEach((e) => {
      if (e.bestWin) {
        winCounts[e.bestWin] = (winCounts[e.bestWin] || 0) + 1;
      }
    });

    const lines: string[] = [
      `==================================================`,
      `BEEYOU CLINICAL & THERAPY DAY-TO-DAY SUMMARY`,
      `Child: ${childName} | Date Generated: ${new Date().toLocaleDateString()}`,
      `Period: ${isPremium && filterPeriod === 'all' ? 'All Time History' : 'Past 7 Days'} | Days Recorded: ${totalDays}`,
      `Positive Regulation Days: ${positiveRatio}% (${greatOrGoodCount}/${totalDays})`,
      `Difficult / Sensory Challenge Days: ${difficultCount}/${totalDays}`,
      `==================================================\n`,

      `1. ROUTINE & HABIT ADHERENCE:`,
      `- Current Daily Routine Adherence: ${routineStats}`,
      `- Daily Habits Completed: ${habitsCompletedToday}/${totalHabits || 4}`,
      `- Reinforcement Stars Earned: ${stars}\n`,

      `2. MOOD & SENSORY REGULATION PATTERNS:`,
      `- Energy States: ${entriesToSummarize.filter(e => e.energyLevel === 'calm').length} Calm/Regulated, ${entriesToSummarize.filter(e => e.energyLevel === 'high').length} High/Seeking, ${entriesToSummarize.filter(e => e.energyLevel === 'overstimulated').length} Overstimulated, ${entriesToSummarize.filter(e => e.energyLevel === 'low').length} Low/Tired`,
      `- Sleep Quality: ${entriesToSummarize.filter(e => e.sleepQuality === 'slept_well').length} Slept well, ${entriesToSummarize.filter(e => e.sleepQuality === 'restless').length} Restless / Fragmented`,
      `- Recent Mood Entries Logged: ${moodJournalEntries.length} reflection entry(ies)\n`,

      `3. REPORTED SENSORY TRIGGERS & CHALLENGES:`,
    ];

    if (Object.keys(challengeCounts).length === 0) {
      lines.push(`- No persistent triggers recorded during this period`);
    } else {
      Object.entries(challengeCounts).forEach(([trig, count]) => {
        lines.push(`- ${trig.replace(/_/g, ' ')}: ${count} time(s)`);
      });
    }

    lines.push(`\n4. TOP SUCCESSFUL COPING STRATEGIES & WINS:`);
    if (Object.keys(winCounts).length === 0) {
      lines.push(`- Steady progress maintained across visual schedule`);
    } else {
      Object.entries(winCounts).forEach(([win, count]) => {
        lines.push(`- ${win.replace(/_/g, ' ')}: ${count} time(s)`);
      });
    }

    // Urgent Alerts Summary
    lines.push(`\n5. URGENT SOS & SENSORY ALERTS:`);
    const recentAlerts = alertsHistory.slice(0, 5);
    if (recentAlerts.length === 0) {
      lines.push(`- 0 emergency overload alerts triggered (safe and regulated)`);
    } else {
      recentAlerts.forEach((a) => {
        lines.push(`- [${new Date(a.timestamp).toLocaleDateString()}] ${a.label} (${a.location || 'Shared location'}) - Status: ${a.status || 'Resolved'}`);
      });
    }

    // Medication Adherence
    lines.push(`\n6. MEDICATION & PRESCRIPTION ADHERENCE:`);
    const activeMeds = medications.filter(m => m.active);
    if (activeMeds.length > 0) {
      lines.push(`- Active Prescriptions: ${activeMeds.map(m => `${m.name} (${m.dosage})`).join(', ')}`);
    } else {
      lines.push(`- No active prescription medications logged`);
    }

    // Hormonal Cycle & Sensory Insights
    if (cycle) {
      lines.push(`\n7. HORMONAL CYCLE & SENSORY RHYTHMS:`);
      lines.push(`- Current Cycle Rhythm: Day ${cycle.currentCycleDay} (${cycle.phaseLabel})`);
      lines.push(`- Sensory & Regulation Impact: ${cycle.sensoryInsight}`);
    }

    // 8. Day-by-Day Reflections & Clinical Notes
    lines.push(`\n8. DAY-BY-DAY REFLECTIONS & CLINICAL NOTES:`);
    if (entriesToSummarize.length === 0) {
      lines.push(`- No daily reflections recorded yet for this period.`);
    } else {
      entriesToSummarize.forEach((e) => {
        const dateStr = new Date(e.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const note = e.additionalNotes || e.notes || 'No notes logged';
        const rating = (e.overallDay || 'neutral').replace(/_/g, ' ');
        const energy = e.energyLevel || 'calm';
        lines.push(`- [${dateStr}] Overall: ${rating} | Energy: ${energy} | Note: "${note}"`);
      });
    }

    lines.push(`\n==================================================`);
    lines.push(`Report generated via BeeYou Caregiver Hub.`);

    return lines.join('\n');
  };

  const handleCopyTherapistSummary = async () => {
    playChime('tap');
    const summaryText = generateTherapistSummary();
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedReport(true);
      playChime('complete');
      if (onShowNotification) {
        onShowNotification(t('Therapist summary copied to clipboard!'));
      }
      setTimeout(() => setCopiedReport(false), 3500);
    } catch {
      // Fallback
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              <span>{t('Day-to-Day Summary & Mood Hub')}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              {isPremium ? t('Unlimited History') : t('Past 7 Days')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('Daily schedule progress, emotional reflections, and 1-tap therapist clinical report.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              setShowRecollectionModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center cursor-pointer shadow-sm transition active:scale-95"
          >
            <span>{t('Log Daily Reflection')}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyTherapistSummary}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center cursor-pointer shadow-sm transition active:scale-95 ${
              copiedReport 
                ? 'bg-emerald-600 text-white' 
                : 'bg-stone-800 hover:bg-stone-900 text-white'
            }`}
          >
            <span>{copiedReport ? t('Copied Report!') : t('Copy Therapist Summary')}</span>
          </button>

          {onStartTour && (
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onStartTour();
              }}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs border border-stone-200"
            >
              <span>{t('Guide')}</span>
            </button>
          )}
        </div>
      </div>

      {/* TODAY'S LIVE SNAPSHOT CARD */}
      <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-3xl p-5 border-2 border-amber-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-sm text-amber-950 uppercase tracking-wider">
            <span>{t("Today's Snapshot for")} {childProfile.name || 'Child'}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('Habits Done')}</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {habitsCompletedToday} / {totalHabits || 4}
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('Routines Finished')}</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {completedRoutinesCount} / {routines.length || 1}
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('Stars Earned')}</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
              {stars}
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('Current Mood')}</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 capitalize truncate">
              {currentMood || t('Calm')}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & HISTORY CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('Viewing')}:</span>
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setFilterPeriod('7days');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filterPeriod === '7days' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('Past 7 Days')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isPremium) {
                  triggerUpgrade(t('Unlock 30-day and unlimited clinical history with BeeYou Premium!'));
                  return;
                }
                setFilterPeriod('30days');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filterPeriod === '30days' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('Past 30 Days')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isPremium) {
                  triggerUpgrade(t('Unlock unlimited history archives with BeeYou Premium!'));
                  return;
                }
                setFilterPeriod('all');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-lg transition ${
                filterPeriod === 'all' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('All History')}</span>
            </button>
          </div>

          {displayedRecollections.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('Are you sure you want to remove all reflection entries? This will delete all saved data.'))) {
                  clearAllDailyRecollections();
                  if (onShowNotification) onShowNotification(t('Reflection history removed.'));
                }
              }}
              className="px-3 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-200 cursor-pointer"
            >
              {t('Remove All')}
            </button>
          )}
        </div>

        {!isPremium && (
          <button
            type="button"
            onClick={() => triggerUpgrade(t('Upgrade to BeeYou Premium for unlimited therapy logs and IEP export reports.'))}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('Regular plan: Past 7 days only. Tap for unlimited.')}</span>
          </button>
        )}
      </div>

      {/* TIMELINE LIST OF DAY-TO-DAY ENTRIES */}
      <section className="space-y-3.5">
        {displayedRecollections.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border-2 border-stone-200/80 shadow-xs">
            <p className="text-sm font-bold text-slate-700">{t('No daily reflections recorded yet.')}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Evening reflections, mood check-ins, and sensory wins recorded on the tablet will appear here automatically.')}
            </p>
          </div>
        ) : (
          displayedRecollections.map((entry) => {
            const entryDate = new Date(entry.date);
            const isToday = new Date().toDateString() === entryDate.toDateString();

            const ratingClass = 
              entry.overallDay === 'great' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
              entry.overallDay === 'good' ? 'bg-blue-100 text-blue-900 border-blue-300' :
              entry.overallDay === 'okay' ? 'bg-stone-100 text-stone-800 border-stone-300' :
              entry.overallDay === 'difficult' ? 'bg-amber-100 text-amber-900 border-amber-300' :
              'bg-rose-100 text-rose-900 border-rose-300';

            return (
              <div
                key={entry.id}
                className="bg-white rounded-3xl p-5 border-2 border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-amber-800 text-xs">
                      {entryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <span className="font-black text-sm text-slate-900">
                        {isToday ? t('Today') : entryDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t('Energy')}: {entry.energyLevel || 'Calm'} • {t('Sleep')}: {entry.sleepQuality === 'slept_well' ? t('Slept well') : t('Restless')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border capitalize ${ratingClass}`}>
                      {entry.overallDay.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteDailyRecollection(entry.id);
                        if (onShowNotification) onShowNotification(t('Entry deleted'));
                      }}
                      title={t('Delete reflection')}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Wins & Challenges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {entry.bestWin && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
                      <span className="font-black uppercase tracking-wider text-[10px] text-emerald-700 block mb-0.5">
                        {t('Highlights & Win')}:
                      </span>
                      <span>{entry.bestWin.replace(/_/g, ' ')}</span>
                    </div>
                  )}

                  {entry.mainChallenge && entry.mainChallenge !== 'none' && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950">
                      <span className="font-black uppercase tracking-wider text-[10px] text-amber-700 block mb-0.5">
                        {t('Sensory / Transition Challenge')}:
                      </span>
                      <span>{entry.mainChallenge.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Personal Notes / Reflection */}
                {Boolean(entry.additionalNotes || entry.notes) && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-700 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">
                      {t('Caregiver / Child Reflection')}:
                    </span>
                    "{entry.additionalNotes || entry.notes}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* QUICK PREVIEW OF THERAPIST SUMMARY */}
      <section className="bg-stone-50 rounded-3xl p-5 border-2 border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">
              {t('Preview: Formatted Therapist Clinical Report')}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyTherapistSummary}
            className="text-xs font-black text-amber-700 hover:text-amber-800 cursor-pointer"
          >
            <span>{t('Copy Entire Report')}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-white border border-stone-200 text-[11px] font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {generateTherapistSummary()}
        </pre>
      </section>
    </div>
  );
};
