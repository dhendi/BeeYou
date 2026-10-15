import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Star,
  BookOpen,
  Plus,
  Check,
  CalendarDays
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { MyDayView } from './MyDayView';
import { AdventuresView } from './AdventuresView';
import { SkillsView } from './SkillsView';
import { RoutineCalendarStrip } from './RoutineCalendarStrip';
import { RoutineTemplatesLibrary } from './RoutineTemplatesLibrary';
import { RoutineCustomizerModal } from './RoutineCustomizerModal';
import { Routine, RoutineTemplate } from '../types';
import { getCurrentTimeRoutine } from '../utils/routineTimeHelper';
import { t } from '../services/translator';

export const MyRoutineView: React.FC = () => {
  const {
    routines,
    addRoutine,
    updateRoutine,
    plansChanged,
    setShowPlansChangedModal,
    setShowPieTimerModal,
    setShowMorningBrief,
    enabledFeatures,
    userAgeGroup,
    activeAdventureId,
    activeSkillId,
    setActiveAdventureId,
    setActiveSkillId,
  } = useApp();

  const isAdult = userAgeGroup === 'adult';

  // Subtab: 'schedules' (Daily Schedule with Calendar) | 'templates' (Pre-Built Routine Library) | 'adventures' | 'skills'
  const [activeSubTab, setActiveSubTab] = useState<'schedules' | 'templates' | 'adventures' | 'skills'>(() => {
    if (activeAdventureId) return 'adventures';
    if (activeSkillId) return 'skills';
    return 'schedules';
  });

  // Calendar selected date (defaults to today)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  
  // Currently active selected routine ID (automatically selected according to current time of day)
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => {
    const timeMatch = getCurrentTimeRoutine(routines, new Date());
    return timeMatch?.id || (routines[0]?.id ?? 'routine-morning');
  });

  // Automatically keep selected routine in sync with current time of day and selected calendar date
  React.useEffect(() => {
    const isToday = selectedCalendarDate.toDateString() === new Date().toDateString();
    const targetDate = isToday ? new Date() : selectedCalendarDate;
    const timeMatch = getCurrentTimeRoutine(routines, targetDate);
    if (timeMatch) {
      setSelectedRoutineId(timeMatch.id);
    }
  }, [selectedCalendarDate, routines]);

  // Parent edit mode unlocked state
  const [isParentMode, setIsParentMode] = useState<boolean>(false);

  // Customizer modal state
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizingRoutine, setCustomizingRoutine] = useState<Partial<Routine> | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Quick 1-Tap Import from Pre-Built Templates Library
  const handleQuickImportTemplate = (template: RoutineTemplate) => {
    const newRoutine = addRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
      assignedDays: template.assignedDays || [0, 1, 2, 3, 4, 5, 6],
      firstThen: template.firstThen ? {
        first: template.firstThen.first,
        firstEmoji: template.firstThen.firstEmoji,
        then: template.firstThen.then,
        thenEmoji: template.firstThen.thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: template.steps.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st.title,
        instruction: st.instruction,
        durationMin: st.durationMin,
        completed: false,
        emoji: st.emoji,
        sensoryNote: st.sensoryNote,
        communicationShortcutPhrases: st.communicationShortcutPhrases,
      })),
    });

    setSelectedRoutineId(newRoutine.id);
    playChime('complete');
    showToast(`✨ ${t('Imported')} "${template.title}" ${t('into your routines!')}`);
    setActiveSubTab('schedules');
  };

  // Customize a template before saving
  const handleCustomizeTemplate = (template: RoutineTemplate) => {
    setCustomizingRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
      assignedDays: template.assignedDays || [0, 1, 2, 3, 4, 5, 6],
      firstThen: template.firstThen ? {
        first: template.firstThen.first,
        firstEmoji: template.firstThen.firstEmoji,
        then: template.firstThen.then,
        thenEmoji: template.firstThen.thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: template.steps.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st.title,
        instruction: st.instruction,
        durationMin: st.durationMin,
        completed: false,
        emoji: st.emoji,
        sensoryNote: st.sensoryNote,
      })),
    });
    setCustomizerOpen(true);
    playChime('tap');
  };

  // Save routine from Customizer modal (either add new or update existing)
  const handleSaveCustomizedRoutine = (routineData: Omit<Routine, 'id'>, existingId?: string) => {
    if (existingId) {
      updateRoutine({
        ...routineData,
        id: existingId,
      });
      setSelectedRoutineId(existingId);
      showToast(`✅ ${t('Updated')} "${routineData.title}"!`);
    } else {
      const created = addRoutine(routineData);
      setSelectedRoutineId(created.id);
      showToast(`🎉 ${t('Created')} "${routineData.title}"!`);
    }
    setCustomizerOpen(false);
    playChime('complete');
    setActiveSubTab('schedules');
  };

  // Update routine assigned days from calendar
  const handleUpdateRoutineDays = (routineId: string, days: number[]) => {
    const existing = routines.find((r) => r.id === routineId);
    if (!existing) return;
    updateRoutine({
      ...existing,
      assignedDays: days,
    });
  };

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 pb-24 space-y-3.5">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-400 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Sub-tabs and Quick Tools */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Segmented Routine Sub-tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('schedules');
              setActiveAdventureId(null);
              setActiveSkillId(null);
              playChime('tap');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'schedules'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{t('Schedules & Calendar')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('templates');
              setActiveAdventureId(null);
              setActiveSkillId(null);
              playChime('tap');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'templates'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('Templates Library')}</span>
          </button>

          {enabledFeatures?.socialStories !== false && (
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('adventures');
                setActiveSkillId(null);
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeSubTab === 'adventures'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{userAgeGroup === 'adult' ? t('Guides') : userAgeGroup === 'teen' ? t('Scenarios') : t('Adventures')}</span>
            </button>
          )}

          {enabledFeatures?.lifeSkills !== false && (
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('skills');
                setActiveAdventureId(null);
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeSubTab === 'skills'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('Life Skills')}</span>
            </button>
          )}
        </div>

        {/* Quick Actions (Plans Changed, Timer, Brief) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowPlansChangedModal(true);
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
              plansChanged.active
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Plans Changed transition tool"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{t('Plans Changed')}</span>
            <span className="sm:hidden">{t('Plans')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPieTimerModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all cursor-pointer active:scale-95"
            title="Visual Countdown Timer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">{t('Timer')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMorningBrief(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all cursor-pointer active:scale-95"
            title="Morning Briefing"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{t('Brief')}</span>
          </button>
        </div>
      </div>

      {/* Subtab Content Area */}
      <div className="flex-1 space-y-4">
        {activeSubTab === 'schedules' && (
          <div className="space-y-4">
            {/* 1. CALENDAR ON TOP OF ROUTINE SCHEDULE */}
            <RoutineCalendarStrip
              selectedDate={selectedCalendarDate}
              onSelectDate={(date) => setSelectedCalendarDate(date)}
              routines={routines}
              onOpenTemplatesLibrary={() => setActiveSubTab('templates')}
              onOpenCustomizer={(initial) => {
                setCustomizingRoutine(initial || null);
                setCustomizerOpen(true);
              }}
              onUpdateRoutineDays={handleUpdateRoutineDays}
              isParentMode={isParentMode}
              setIsParentMode={setIsParentMode}
              isAdult={isAdult}
            />

            {/* 2. ACTIVE SCHEDULE & STEPS VIEW */}
            <MyDayView
              selectedCalendarDate={selectedCalendarDate}
              selectedRoutineId={selectedRoutineId}
              onSelectRoutineId={setSelectedRoutineId}
              onOpenTemplatesLibrary={() => setActiveSubTab('templates')}
              onOpenCustomizer={(initial) => {
                setCustomizingRoutine(initial || null);
                setCustomizerOpen(true);
              }}
            />
          </div>
        )}

        {/* PRE-BUILT ROUTINE TEMPLATES LIBRARY */}
        {activeSubTab === 'templates' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 p-3 sm:p-4 rounded-2xl">
              <div>
                <h3 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>{t('Pre-Built Routine Templates Library')}</span>
                </h3>
                <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                  {t('Click "1-Tap Import" to add any routine directly to your schedule, or "Customize" to tailor steps.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('schedules');
                  playChime('tap');
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/70 text-amber-950 border border-amber-300 font-black text-xs transition-all cursor-pointer shadow-2xs"
              >
                ← {t('Back to Schedule')}
              </button>
            </div>

            <RoutineTemplatesLibrary
              onQuickImport={handleQuickImportTemplate}
              onCustomizeTemplate={handleCustomizeTemplate}
              existingRoutineTitles={routines.map((r) => r.title)}
            />
          </div>
        )}

        {activeSubTab === 'adventures' && <AdventuresView />}
        {activeSubTab === 'skills' && <SkillsView />}
      </div>

      {/* Routine Customizer Modal */}
      <RoutineCustomizerModal
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        initialRoutine={customizingRoutine}
        onSave={handleSaveCustomizedRoutine}
      />
    </div>
  );
};
