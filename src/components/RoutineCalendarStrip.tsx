import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Plus, 
  Lock, 
  Unlock, 
  Check, 
  Settings,
  CalendarDays
} from 'lucide-react';
import { Routine } from '../types';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { useApp } from '../context/AppContext';
import { CaregiverLockShield } from './CaregiverLockShield';
import { RoutineStickerIcon } from './icons/JournalStickers';

interface RoutineCalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  routines: Routine[];
  onOpenTemplatesLibrary: () => void;
  onOpenCustomizer: (initial?: Partial<Routine>) => void;
  onUpdateRoutineDays: (routineId: string, days: number[]) => void;
  isParentMode: boolean;
  setIsParentMode: (val: boolean) => void;
  isAdult: boolean;
}

export const RoutineCalendarStrip: React.FC<RoutineCalendarStripProps> = ({
  selectedDate,
  onSelectDate,
  routines,
  onOpenTemplatesLibrary,
  onOpenCustomizer,
  onUpdateRoutineDays,
  isParentMode,
  setIsParentMode,
  isAdult,
}) => {
  const { activeTheme, isPremium, triggerUpgrade } = useApp();
  // Current week offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);
  const [showDayManager, setShowDayManager] = useState(false);

  // Compute 7 days for the displayed week based on weekOffset
  const getDaysOfWeek = (offset: number) => {
    const today = new Date();
    // Normalize to current week start (Sunday = 0)
    const currentDayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDayOfWeek + offset * 7);
    sunday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const daysOfWeek = getDaysOfWeek(weekOffset);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper to check if a routine is active on a specific day of week (0..6)
  const isRoutineOnDay = (routine: Routine, dayIndex: number) => {
    if (routine.assignedDays === undefined) {
      return true; // default: runs every day if not explicitly configured
    }
    return routine.assignedDays.includes(dayIndex);
  };

  const selectedDayIndex = selectedDate.getDay();

  // Month and Year string for header (e.g. "October 2026")
  const monthYearString = daysOfWeek[0].toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const selectedDayFormatted = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#FCF9F2] border border-[#EBE3D5] rounded-[24px] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 animate-in fade-in">
      {/* 1. Header Bar: Month, Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EBE3D5]">
        {/* Month & Week Navigation */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white flex items-center justify-center font-black shadow-xs shrink-0`}>
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-stone-900 text-sm sm:text-base leading-none">
              {monthYearString}
            </h3>
            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => {
                  setWeekOffset(0);
                  onSelectDate(new Date());
                  playChime('tap');
                }}
                className={`px-2 py-0.5 rounded-full ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} ${activeTheme?.palette?.textAccent || 'text-amber-900'} text-[10px] font-black hover:opacity-80 transition-all cursor-pointer`}
              >
                {t('Today')}
              </button>
            )}
          </div>
        </div>

        {/* Action Controls: Week Nav, Templates, New Routine, Day Manager */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Previous / Next Week */}
          <div className="flex items-center bg-[#F5EFE6] rounded-xl border border-[#E8DFC2] p-0.5">
            <button
              type="button"
              onClick={() => {
                setWeekOffset((prev) => prev - 1);
                playChime('tap');
              }}
              className="p-1 rounded-lg hover:bg-white text-stone-700 transition-all cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset((prev) => prev + 1);
                playChime('tap');
              }}
              className="p-1 rounded-lg hover:bg-white text-stone-700 transition-all cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Templates Library button */}
          <button
            type="button"
            onClick={() => {
              onOpenTemplatesLibrary();
              playChime('tap');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#F5EFE6] hover:bg-white text-stone-800 border border-[#E8DFC2] font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Browse pre-built routine templates library"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">{t('Templates')}</span>
          </button>

          {/* New Custom Routine */}
          <button
            type="button"
            onClick={() => {
              if (!isPremium && routines.length >= 2) {
                triggerUpgrade('Free plan includes 2 active visual routines. Upgrade to BeeYou Plus for unlimited routines, schedules, and First-Then boards!');
                return;
              }
              onOpenCustomizer();
              playChime('tap');
            }}
            className={`px-2.5 py-1.5 rounded-xl ${activeTheme?.palette?.primaryBg ? `${activeTheme.palette.primaryBg} text-white hover:opacity-90` : 'bg-[#F5B865] hover:bg-[#EEAC53] text-stone-950'} font-black text-xs flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95 border ${activeTheme?.palette?.primaryBorder || 'border-[#E2A44E]'}`}
            title="Create a new routine from scratch"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('New')}</span>
            {!isPremium && routines.length >= 2 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-wider shadow-2xs ml-0.5">
                Plus
              </span>
            )}
          </button>

          {/* Parent Edit / Manage Days Mode Toggle */}
          {isAdult ? (
            <button
              type="button"
              onClick={() => {
                setShowDayManager(!showDayManager);
                playChime('tap');
              }}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border ${
                showDayManager
                  ? `${activeTheme?.palette?.primaryBg || 'bg-amber-600'} hover:opacity-90 text-white ${activeTheme?.palette?.primaryBorder || 'border-amber-600'}`
                  : 'bg-[#F5EFE6] hover:bg-white text-stone-800 border-[#E8DFC2]'
              }`}
              title="Manage which routines run on this day"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showDayManager ? t('Close Editor') : t('Edit Days')}</span>
            </button>
          ) : isParentMode ? (
            <button
              type="button"
              onClick={() => {
                setShowDayManager(!showDayManager);
                playChime('tap');
              }}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border ${
                showDayManager
                  ? `${activeTheme?.palette?.primaryBg || 'bg-amber-600'} hover:opacity-90 text-white ${activeTheme?.palette?.primaryBorder || 'border-amber-600'}`
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{showDayManager ? t('Close Editor') : t('Edit Days')}</span>
            </button>
          ) : (
            <CaregiverLockShield
              title={t('Caregiver PIN: Schedule & Calendar')}
              onUnlocked={() => {
                setIsParentMode(true);
                setShowDayManager(true);
                playChime('complete');
              }}
            >
              <button
                type="button"
                className="px-2.5 py-1.5 rounded-xl bg-[#F5EFE6] hover:bg-white text-stone-800 border border-[#E8DFC2] font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Enter 4-digit caregiver PIN to edit schedule"
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">{t('Edit Days')}</span>
              </button>
            </CaregiverLockShield>
          )}
        </div>
      </div>

      {/* 2. Sleek Seven-Day Interactive Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysOfWeek.map((dayDate) => {
          const isSelected = isSameDay(dayDate, selectedDate);
          const isToday = isSameDay(dayDate, today);
          const dayIndex = dayDate.getDay();
          const count = routines.filter((r) => isRoutineOnDay(r, dayIndex)).length;

          const selectedDayTextColor = activeTheme?.palette?.primaryBorder
            ? activeTheme.palette.primaryBorder.replace('border-', 'text-').replace('-400', '-300').replace('-500', '-300')
            : 'text-amber-300';

          return (
            <button
              key={dayDate.toISOString()}
              type="button"
              onClick={() => {
                onSelectDate(dayDate);
                playChime('tap');
              }}
              className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border min-h-[58px] sm:min-h-[64px] ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 scale-[1.02]'
                  : isToday
                  ? `${activeTheme?.palette?.primaryLight || 'bg-amber-100'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-950'} ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs`
                  : 'bg-[#F5EFE6] hover:bg-white text-stone-800 border-[#E8DFC2] shadow-2xs'
              }`}
              style={{
                borderColor: isSelected ? (activeTheme?.palette?.primary || '#f59e0b') : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${activeTheme?.palette?.primary || '#f59e0b'}` : undefined,
              }}
            >
              {/* Day name */}
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isSelected ? selectedDayTextColor : isToday ? (activeTheme?.palette?.textAccent || 'text-amber-800') : 'text-stone-500'
                }`}
              >
                {dayNamesShort[dayIndex]}
              </span>

              {/* Date number */}
              <span className="text-sm sm:text-base font-black my-0.5 leading-none">
                {dayDate.getDate()}
              </span>

              {/* Minimalist dot indicator */}
              <div className="flex items-center justify-center gap-1 text-[9px] font-bold">
                {isToday ? (
                  <span className={`px-1.5 py-0.2 rounded-full ${activeTheme?.palette?.primaryBg || 'bg-amber-400'} text-white font-black text-[7px] tracking-tight`}>
                    TODAY
                  </span>
                ) : count > 0 ? (
                  <span className={`text-[9px] font-bold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {count} {count === 1 ? 'task' : 'tasks'}
                  </span>
                ) : (
                  <span className="text-stone-300 text-[10px]">•</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Collapsible Day Manager Drawer (When Unlocked) */}
      {(isParentMode || isAdult) && showDayManager && (
        <div className={`p-3.5 sm:p-4 rounded-2xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50/80'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} space-y-3 animate-in fade-in mt-2`}>
          <div className={`flex items-center justify-between pb-2 border-b ${activeTheme?.palette?.primaryBorder || 'border-amber-200'}`}>
            <div>
              <h4 className={`font-black ${activeTheme?.palette?.textAccent || 'text-amber-950'} text-xs sm:text-sm`}>
                {t('Assign Routines to')} {dayNamesShort[selectedDayIndex]} ({selectedDayFormatted})
              </h4>
              <p className={`text-[11px] font-semibold ${activeTheme?.palette?.textAccent ? 'opacity-80' : 'text-amber-800'}`}>
                {t('Check the routines that should run on this day of the week.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDayManager(false)}
              className={`${activeTheme?.palette?.textAccent || 'text-amber-800'} hover:opacity-80 font-black text-xs cursor-pointer px-2 py-1 bg-white rounded-lg border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'}`}
            >
              {t('Done')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routines.map((routine) => {
              const isActiveToday = isRoutineOnDay(routine, selectedDayIndex);
              const currentDays = routine.assignedDays !== undefined ? routine.assignedDays : [0, 1, 2, 3, 4, 5, 6];

              return (
                <div
                  key={routine.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActiveToday
                      ? `bg-white ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} text-stone-900 shadow-2xs`
                      : 'bg-white/60 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <RoutineStickerIcon emoji={routine.emoji} title={routine.title} className="w-5 h-5 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{t(routine.title)}</div>
                      <div className="text-[10px] text-stone-500">{routine.time || 'Flexible'}</div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPremium && !routines.slice(0, 2).some(r => r.id === routine.id)) {
                        triggerUpgrade('Free plan includes 2 active visual routines. Upgrade to BeeYou Plus for unlimited routines and First-Then schedules!');
                        return;
                      }
                      let nextDays: number[];
                      if (isActiveToday) {
                        nextDays = currentDays.filter((d) => d !== selectedDayIndex);
                      } else {
                        nextDays = Array.from(new Set([...currentDays, selectedDayIndex]));
                      }
                      onUpdateRoutineDays(routine.id, nextDays);
                      playChime('tap');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isActiveToday
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    {isActiveToday ? t('Active') : t('Off')}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Preset */}
          <div className={`flex items-center gap-2 pt-2 border-t ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex-wrap text-xs font-bold ${activeTheme?.palette?.textAccent || 'text-amber-900'}`}>
            <span>{t('Quick Presets')}:</span>
            <button
              type="button"
              onClick={() => {
                if (!isPremium) {
                  triggerUpgrade('Free plan includes 2 active visual routines. Upgrade to BeeYou Plus for unlimited routines and First-Then schedules!');
                  return;
                }
                routines.forEach((r) => {
                  const currentDays = r.assignedDays || [0, 1, 2, 3, 4, 5, 6];
                  onUpdateRoutineDays(r.id, Array.from(new Set([...currentDays, selectedDayIndex])));
                });
                playChime('complete');
              }}
              className={`px-2.5 py-1 rounded-lg bg-white border ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} hover:opacity-90 text-stone-800 cursor-pointer`}
            >
              {t('All Active Today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
