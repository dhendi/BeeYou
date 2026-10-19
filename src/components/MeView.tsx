import React from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';
import {
  ThermometerSticker,
  MedicationSticker,
  ReadingBookSticker,
  ConnectHeartSticker,
  SpoonSticker,
  TurtleBambooSpoonsSticker,
  EveningMoonSticker,
} from './icons/JournalStickers';

export const MeView: React.FC = () => {
  const {
    settings,
    userAgeGroup,
    enabledFeatures,
    medications,
    moodJournalEntries,
    dailyRecollections,
    getCyclePhaseInfo,
    getTodaySpoonEntry,
    setShowFivePointModal,
    setShowMedicationModal,
    setShowMoodJournalModal,
    setShowCycleTrackerModal,
    setShowSpoonModal,
    setShowRecollectionModal,
    activeTheme,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);
  const isColorCoded = settings?.colorCodedActionCards === true;
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isTeenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';
  const cycleInfo = getCyclePhaseInfo ? getCyclePhaseInfo() : null;
  const todaySpoon = getTodaySpoonEntry();
  const nextMed = medications.find((m) => m.active);

  const meCards = [
    {
      id: 'feelings',
      title: 'Feelings & Thermometer',
      desc: 'Check in on your emotions, sensory energy, and find coping tools on the 5-point scale.',
      badge: 'Regulation',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      color: 'border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950',
      stickerBox: 'bg-white border-amber-200/90 shadow-2xs',
      Sticker: ThermometerSticker,
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
      badge: 'Health & Doses',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      color: 'border-2 border-blue-300/80 bg-blue-50/40 hover:bg-blue-50/80 text-blue-950',
      stickerBox: 'bg-white border-blue-200/90 shadow-2xs',
      Sticker: MedicationSticker,
      show: enabledFeatures?.medicationReminders !== false,
      action: () => {
        setShowMedicationModal(true);
        playChime('tap');
      },
    },
    {
      id: 'evening-reflection',
      title: 'Evening Reflection & Wins',
      desc: dailyRecollections.length > 0 
        ? `${dailyRecollections.length} days recorded. Log your evening review, sensory triggers, and therapist summary.`
        : 'Look back on the highlights of your day, sensory wins, and generate therapist summaries.',
      badge: 'Therapy & Daily Review',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      color: 'border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/80 text-teal-950',
      stickerBox: 'bg-white border-teal-200/90 shadow-2xs',
      Sticker: EveningMoonSticker,
      show: enabledFeatures?.dailyMoodRecollection !== false,
      action: () => {
        setShowRecollectionModal(true);
        playChime('tap');
      },
    },
    {
      id: 'cycle-tracker',
      title: 'Cycle & Hormonal Rhythm',
      desc: cycleInfo 
        ? `Day ${cycleInfo.currentCycleDay} • ${cycleInfo.phaseLabel}. Track sensory & energy rhythms.`
        : 'Track your hormonal cycle and sensory sensitivity changes.',
      badge: 'Sensory Rhythm',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      color: 'border-2 border-rose-300/80 bg-rose-50/40 hover:bg-rose-50/80 text-rose-950',
      stickerBox: 'bg-white border-rose-200/90 shadow-2xs',
      Sticker: ConnectHeartSticker,
      show: true,
      action: () => {
        setShowCycleTrackerModal(true);
        playChime('tap');
      },
    },
    {
      id: 'mood-journal',
      title: 'Mood & Trigger Journal',
      desc: `${moodJournalEntries.length} entries recorded. Track triggers, reflections, and patterns.`,
      badge: 'Reflective Log',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      color: 'border-2 border-indigo-300/80 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-950',
      stickerBox: 'bg-white border-indigo-200/90 shadow-2xs',
      Sticker: ReadingBookSticker,
      show: isTeenOrAdult && enabledFeatures?.moodJournal !== false,
      action: () => {
        setShowMoodJournalModal(true);
        playChime('tap');
      },
    },
    {
      id: 'spoon-budget',
      title: 'Spoon Theory Stamina Budget',
      desc: todaySpoon 
        ? `${Math.max(0, todaySpoon.totalSpoons - todaySpoon.usedSpoons)} of ${todaySpoon.totalSpoons} spoons remaining today.`
        : 'Track daily physical and social energy spoons to pace yourself and prevent burnout.',
      badge: 'Energy Tracker',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      color: 'border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/80 text-purple-950',
      stickerBox: 'bg-white border-purple-200/90 shadow-2xs',
      Sticker: isTurtleTheme ? TurtleBambooSpoonsSticker : SpoonSticker,
      show: true,
      action: () => {
        setShowSpoonModal(true);
        playChime('tap');
      },
    },
  ].filter(c => c.show);

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-3 sm:px-5 py-3 pb-24 space-y-4">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('Me')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
          {t('Feelings, health reminders, energy tracking, and personal reflections.')}
        </p>
      </header>

      {/* Grid of Personal & Wellness Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {meCards.map((card) => {
          const Sticker = card.Sticker;
          const cardClass = isColorCoded
            ? card.color
            : `${themeStyles.card} !p-4 sm:!p-5 !rounded-2xl`;
          const badgeClass = isColorCoded
            ? card.badgeClass
            : themeStyles.adventureTag;

          return (
            <button
              key={card.id}
              onClick={card.action}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl active:scale-[0.98] cursor-pointer transition-all flex items-center justify-between gap-4 group ${cardClass}`}
            >
              <div className="min-w-0 flex-1">
                <span className={badgeClass}>
                  {t(card.badge)}
                </span>
                <h3 className={`font-bold text-sm sm:text-base leading-snug truncate ${isColorCoded ? 'text-slate-900' : themeStyles.headerText}`}>
                  {t(card.title)}
                </h3>
                <p className={`text-xs font-medium leading-snug mt-0.5 line-clamp-1 ${isColorCoded ? 'opacity-75 text-slate-600' : themeStyles.headerSubtext}`}>
                  {t(card.desc)}
                </p>
              </div>
              <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center shrink-0 p-0.5 group-hover:scale-110 transition-transform">
                <Sticker className="w-full h-full object-contain" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
