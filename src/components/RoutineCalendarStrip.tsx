import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Sparkles, 
  Lock, 
  Unlock, 
  Check, 
  BookOpen, 
  Edit3, 
  CalendarDays,
  Settings,
  Sun,
  Moon,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { Routine } from '../types';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { CaregiverLockShield } from './CaregiverLockShield';

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
    if (!routine.assignedDays || routine.assignedDays.length === 0) {
      return true; // default: runs every day
    }
    return routine.assignedDays.includes(dayIndex);
  };

  const selectedDayIndex = selectedDate.getDay();
  const routinesForSelectedDay = routines.filter((r) => isRoutineOnDay(r, selectedDayIndex));

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
    <div className="bg-[#FCF9F2] border border-[#EBE3D5] rounded-[28px] p-3.5 sm:p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-3.5 animate-in fade-in">
      {/* 1. Header Bar: Month, Navigation & Parent Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EBE3D5]">
        {/* Month & Week Navigation */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
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
                  className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black hover:bg-amber-200 transition-all cursor-pointer"
                >
                  {t('Today')}
                </button>
              )}
            </div>
            <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
              {t('Schedule & Routine Calendar')}
            </p>
          </div>
        </div>

        {/* Action Controls: Week Nav, Templates, Parent Mode */}
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
              <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Templates Library button */}
          <button
            type="button"
            onClick={() => {
              onOpenTemplatesLibrary();
              playChime('tap');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#F5EFE6] hover:bg-white text-stone-800 border border-[#E8DFC2] font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Browse pre-built routine templates library"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">{t('Templates Library')}</span>
            <span className="sm:hidden">{t('Templates')}</span>
          </button>

          {/* New Custom Routine */}
          <button
            type="button"
            onClick={() => {
              onOpenCustomizer();
              playChime('tap');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#F5B865] hover:bg-[#EEAC53] text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 border border-[#E2A44E]"
            title="Create a new routine from scratch"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('New Routine')}</span>
          </button>

          {/* Parent Edit Mode Toggle */}
          {isAdult ? (
            <button
              type="button"
              onClick={() => {
                setIsParentMode(!isParentMode);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border ${
                isParentMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-[#F5EFE6] hover:bg-white text-stone-800 border-[#E8DFC2]'
              }`}
            >
              {isParentMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-stone-500" />}
              <span>{isParentMode ? t('Parent Mode Active') : t('Parent Controls')}</span>
            </button>
          ) : isParentMode ? (
            <button
              type="button"
              onClick={() => {
                setIsParentMode(false);
                playChime('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{t('Parent Mode Active')}</span>
            </button>
          ) : (
            <CaregiverLockShield
              title={t('Caregiver PIN: Schedule & Calendar')}
              onUnlocked={() => {
                setIsParentMode(true);
                playChime('complete');
              }}
            >
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#F5EFE6] hover:bg-white text-stone-800 border border-[#E8DFC2] font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Enter 4-digit caregiver PIN to edit schedule"
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>{t('Parent Edit')}</span>
              </button>
            </CaregiverLockShield>
          )}
        </div>
      </div>

      {/* 2. Seven-Day Interactive Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysOfWeek.map((dayDate) => {
          const isSelected = isSameDay(dayDate, selectedDate);
          const isToday = isSameDay(dayDate, today);
          const dayIndex = dayDate.getDay();
          const scheduledForDay = routines.filter((r) => isRoutineOnDay(r, dayIndex));

          return (
            <button
              key={dayDate.toISOString()}
              type="button"
              onClick={() => {
                onSelectDate(dayDate);
                playChime('tap');
              }}
              className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-amber-400 scale-102'
                  : isToday
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-[#F5EFE6] hover:bg-white text-stone-800 border-[#E8DFC2] shadow-2xs'
              }`}
            >
              {/* Day name */}
              <span
                className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                  isSelected ? 'text-amber-300' : isToday ? 'text-amber-800' : 'text-stone-500'
                }`}
              >
                {dayNamesShort[dayIndex]}
              </span>

              {/* Date number */}
              <span className="text-base sm:text-lg font-black my-0.5 leading-none">
                {dayDate.getDate()}
              </span>

              {/* Routine emoji dots / count */}
              <div className="flex items-center justify-center gap-0.5 h-5 overflow-hidden">
                {scheduledForDay.length > 0 ? (
                  scheduledForDay.slice(0, 3).map((r) => (
                    <span key={r.id} className="text-xs" title={r.title}>
                      {r.emoji}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-stone-400 font-bold">•</span>
                )}
                {scheduledForDay.length > 3 && (
                  <span className="text-[9px] font-black opacity-80">+{scheduledForDay.length - 3}</span>
                )}
              </div>

              {/* Is Today Pill */}
              {isToday && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[8px] font-black mt-0.5 tracking-tight">
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Selected Day Summary & Quick Manager */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-[#EBE3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider">
              {t('Schedule For')}:
            </span>
            <span className="text-sm font-black text-stone-900">
              {selectedDayFormatted}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">
              {routinesForSelectedDay.length} {t('Routines')}
            </span>
          </div>

          {/* Active routine chips on this day */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {routinesForSelectedDay.map((r) => (
              <span
                key={r.id}
                className="px-2 py-0.5 rounded-lg bg-[#F5EFE6] text-stone-800 border border-[#E8DFC2] text-xs font-bold flex items-center gap-1"
              >
                <span>{r.emoji}</span>
                <span>{t(r.title)}</span>
                {r.time && <span className="text-[10px] text-stone-500">({r.time})</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Parent Manage Days Toggle */}
        {isParentMode && (
          <button
            type="button"
            onClick={() => {
              setShowDayManager(!showDayManager);
              playChime('tap');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showDayManager ? t('Close Day Manager') : t('Manage Routines for This Day')}</span>
          </button>
        )}
      </div>

      {/* 4. Parent Day Manager Drawer (When Unlocked) */}
      {isParentMode && showDayManager && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div>
              <h4 className="font-black text-amber-950 text-xs sm:text-sm">
                {t('Assign Routines to')} {dayNamesShort[selectedDayIndex]} ({selectedDayFormatted})
              </h4>
              <p className="text-[11px] font-semibold text-amber-800">
                {t('Check the routines that should run on this day of the week.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDayManager(false)}
              className="text-amber-800 hover:text-amber-950 font-black text-xs cursor-pointer"
            >
              {t('Done')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routines.map((routine) => {
              const isActiveToday = isRoutineOnDay(routine, selectedDayIndex);
              const currentDays = routine.assignedDays || [0, 1, 2, 3, 4, 5, 6];

              return (
                <div
                  key={routine.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActiveToday
                      ? 'bg-white border-amber-300 text-stone-900 shadow-2xs'
                      : 'bg-white/60 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{routine.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{t(routine.title)}</div>
                      <div className="text-[10px] text-stone-500">{routine.time || 'Flexible'}</div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      let nextDays: number[];
                      if (isActiveToday) {
                        // Remove today
                        nextDays = currentDays.filter((d) => d !== selectedDayIndex);
                      } else {
                        // Add today
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
                    {isActiveToday ? t('Active Today') : t('Off Today')}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-amber-200 flex-wrap text-xs font-bold text-amber-900">
            <span>{t('Quick Presets')}:</span>
            <button
              type="button"
              onClick={() => {
                // Set all routines active today
                routines.forEach((r) => {
                  const currentDays = r.assignedDays || [0, 1, 2, 3, 4, 5, 6];
                  onUpdateRoutineDays(r.id, Array.from(new Set([...currentDays, selectedDayIndex])));
                });
                playChime('complete');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-stone-800 cursor-pointer"
            >
              {t('All Routines Active Today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
