import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smile, 
  Activity, 
  Pill, 
  BookOpen, 
  HeartPulse, 
  Moon, 
  Sparkles, 
  Flame,
  CheckCircle2,
  Clock,
  BatteryCharging
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

export const MeView: React.FC = () => {
  const {
    userAgeGroup,
    enabledFeatures,
    medications,
    moodJournalEntries,
    getCyclePhaseInfo,
    getTodaySpoonEntry,
    setShowFivePointModal,
    setShowMedicationModal,
    setShowMoodJournalModal,
    setShowCycleTrackerModal,
    setShowSpoonModal,
    setShowRecollectionModal,
    setChildView,
  } = useApp();

  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const cycleInfo = isTeenOrAdult ? getCyclePhaseInfo() : null;
  const todaySpoon = getTodaySpoonEntry();
  const nextMed = medications.find((m) => m.active);

  const meCards = [
    {
      id: 'feelings',
      title: 'Feelings & Thermometer',
      desc: 'Check in on your emotions, sensory energy, and find coping tools on the 5-point scale.',
      emoji: '💛',
      icon: Activity,
      badge: 'Regulation',
      color: 'border-yellow-300 bg-yellow-50/70 hover:bg-yellow-100/70 text-yellow-950',
      iconColor: 'bg-amber-500 text-white',
      show: true,
      action: () => {
        setShowFivePointModal(true);
        playChime('tap');
      },
    },
    {
      id: 'medications',
      title: 'Medications & Health',
      desc: nextMed 
        ? `${medications.filter(m => m.active).length} Active Reminders. Next: ${nextMed.name}`
        : 'Set dosage reminders, view schedules, and track your supply inventory.',
      emoji: '💊',
      icon: Pill,
      badge: 'Health & Doses',
      color: 'border-blue-300 bg-blue-50/70 hover:bg-blue-100/70 text-blue-950',
      iconColor: 'bg-blue-500 text-white',
      show: enabledFeatures?.medicationReminders !== false,
      action: () => {
        setShowMedicationModal(true);
        playChime('tap');
      },
    },
    {
      id: 'mood-journal',
      title: 'Mood & Trigger Journal',
      desc: `${moodJournalEntries.length} entries recorded. Track triggers, reflections, and patterns.`,
      emoji: '📖',
      icon: BookOpen,
      badge: 'Reflective Log',
      color: 'border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-950',
      iconColor: 'bg-indigo-500 text-white',
      show: isTeenOrAdult && enabledFeatures?.moodJournal !== false,
      action: () => {
        setShowMoodJournalModal(true);
        playChime('tap');
      },
    },
    {
      id: 'cycle-tracker',
      title: 'Cycle & Hormonal Rhythm',
      desc: cycleInfo 
        ? `Day ${cycleInfo.currentCycleDay} • ${cycleInfo.phaseLabel}. Track sensory & energy rhythms.`
        : 'Track your hormonal cycle and sensory sensitivity changes.',
      emoji: '🌸',
      icon: HeartPulse,
      badge: 'Sensory Rhythm',
      color: 'border-rose-300 bg-rose-50/70 hover:bg-rose-100/70 text-rose-950',
      iconColor: 'bg-rose-500 text-white',
      show: isTeenOrAdult && enabledFeatures?.cycleTracker !== false,
      action: () => {
        setShowCycleTrackerModal(true);
        playChime('tap');
      },
    },
    {
      id: 'spoon-budget',
      title: 'Spoon Energy Budget',
      desc: todaySpoon 
        ? `${Math.max(0, todaySpoon.totalSpoons - todaySpoon.usedSpoons)} of ${todaySpoon.totalSpoons} spoons remaining today.`
        : 'Check your morning stamina and manage energy costs for the day.',
      emoji: '🥄',
      icon: BatteryCharging,
      badge: 'Energy Tracker',
      color: 'border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 text-purple-950',
      iconColor: 'bg-purple-500 text-white',
      show: isTeenOrAdult,
      action: () => {
        setShowSpoonModal(true);
        playChime('tap');
      },
    },
    {
      id: 'evening-reflection',
      title: 'Evening Reflection & Wins',
      desc: 'Look back on the highlights of your day, sensory wins, and how you felt.',
      emoji: '🌙',
      icon: Moon,
      badge: 'Daily Review',
      color: 'border-teal-300 bg-teal-50/70 hover:bg-teal-100/70 text-teal-950',
      iconColor: 'bg-teal-500 text-white',
      show: enabledFeatures?.dailyMoodRecollection !== false,
      action: () => {
        setShowRecollectionModal(true);
        playChime('tap');
      },
    },
  ].filter(c => c.show);

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-3 sm:px-5 py-3 pb-24 space-y-4">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('Me')} 💛
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
          {t('Feelings, health reminders, energy tracking, and personal reflections.')}
        </p>
      </header>

      {/* Grid of Personal & Wellness Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {meCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.action}
              className={`p-4 rounded-3xl border-2 text-left transition-all active:scale-98 cursor-pointer shadow-xs flex flex-col justify-between ${card.color}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${card.iconColor}`}>
                    <Icon className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight">{t(card.title)}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {t(card.badge)}
                    </span>
                  </div>
                </div>
                <span className="text-xl" aria-hidden="true">{card.emoji}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                {t(card.desc)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
