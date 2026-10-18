import React, { useState, Suspense, lazy } from 'react';
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
  CalendarDays,
  Printer
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { MyDayView } from './MyDayView';
const AdventuresView = lazy(() => import('./AdventuresView').then((m) => ({ default: m.AdventuresView })));
const SkillsView = lazy(() => import('./SkillsView').then((m) => ({ default: m.SkillsView })));
import { RoutineCalendarStrip } from './RoutineCalendarStrip';
import { RoutineTemplatesLibrary } from './RoutineTemplatesLibrary';
import { RoutineCustomizerModal } from './RoutineCustomizerModal';
import { Routine, RoutineTemplate } from '../types';
import { getCurrentTimeRoutine } from '../utils/routineTimeHelper';
import { t } from '../services/translator';
import { TurtleArchedBridgeSticker, DinoRexSticker } from './icons/JournalStickers';

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
    openPrintSchedule,
    activeTheme,
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
    showToast(`${t('Imported')} "${template.title}" ${t('into your routines!')}`);
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
      <div className={`flex items-center justify-between flex-wrap gap-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border ${activeTheme?.palette?.primaryBorder || 'border-stone-200'} shadow-2xs`}>
        {/* Segmented Routine Sub-tabs */}
        <div className={`flex items-center gap-1 ${activeTheme?.palette?.primaryLight || 'bg-stone-100'} p-1 rounded-xl overflow-x-auto scrollbar-none`}>
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
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                : `${activeTheme?.palette?.textAccent ? 'text-stone-700 hover:text-stone-900' : 'text-stone-600 hover:text-stone-900'}`
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
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                : `${activeTheme?.palette?.textAccent ? 'text-stone-700 hover:text-stone-900' : 'text-stone-600 hover:text-stone-900'}`
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
                  ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                  : `${activeTheme?.palette?.textAccent ? 'text-stone-700 hover:text-stone-900' : 'text-stone-600 hover:text-stone-900'}`
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
                  ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-xs`
                  : `${activeTheme?.palette?.textAccent ? 'text-stone-700 hover:text-stone-900' : 'text-stone-600 hover:text-stone-900'}`
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
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white ${activeTheme?.palette?.primaryBorder || 'border-amber-600'} animate-pulse shadow-xs`
                : `${activeTheme?.palette?.primaryLight || 'bg-stone-50'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-stone-700'} ${activeTheme?.palette?.primaryBorder || 'border-stone-200'}`
            }`}
            title="Plans Changed transition tool"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${plansChanged.active ? 'text-white' : activeTheme?.palette?.primaryBg?.replace('bg-', 'text-') || 'text-amber-500'}`} />
            <span className="hidden sm:inline">{t('Plans Changed')}</span>
            <span className="sm:hidden">{t('Plans')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPieTimerModal(true);
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black ${activeTheme?.palette?.primaryLight || 'bg-stone-50'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-stone-700'} border ${activeTheme?.palette?.primaryBorder || 'border-stone-200'} transition-all cursor-pointer active:scale-95`}
            title="Visual Countdown Timer"
          >
            <Clock className={`w-3.5 h-3.5 ${activeTheme?.palette?.primaryBg?.replace('bg-', 'text-') || 'text-indigo-500'}`} />
            <span className="hidden sm:inline">{t('Timer')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMorningBrief(true);
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black ${activeTheme?.palette?.primaryLight || 'bg-stone-50'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-stone-700'} border ${activeTheme?.palette?.primaryBorder || 'border-stone-200'} transition-all cursor-pointer active:scale-95`}
            title="Morning Briefing"
          >
            <Sun className={`w-3.5 h-3.5 ${activeTheme?.palette?.primaryBg?.replace('bg-', 'text-') || 'text-amber-500'}`} />
            <span className="hidden sm:inline">{t('Brief')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openPrintSchedule({ mode: 'checklist', routineId: selectedRoutineId });
              playChime('tap');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black ${activeTheme?.palette?.primaryLight || 'bg-stone-50'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-stone-700'} border ${activeTheme?.palette?.primaryBorder || 'border-stone-200'} transition-all cursor-pointer active:scale-95 shadow-2xs`}
            title="Print Visual Schedule or PECS Flashcards"
          >
            <Printer className={`w-3.5 h-3.5 ${activeTheme?.palette?.primaryBg?.replace('bg-', 'text-') || 'text-amber-600'}`} />
            <span className="hidden sm:inline">{t('Print')}</span>
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
            <div className={`flex items-center justify-between ${activeTheme?.palette?.primaryLight || 'bg-amber-50/70'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} p-3 sm:p-4 rounded-2xl`}>
              <div>
                <h3 className={`font-black ${activeTheme?.palette?.textAccent || 'text-amber-950'} text-sm sm:text-base flex items-center gap-1.5`}>
                  {activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle' ? (
                    <TurtleArchedBridgeSticker className="w-5 h-5 object-contain inline-block" />
                  ) : activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino' ? (
                    <DinoRexSticker className="w-5 h-5 object-contain inline-block" />
                  ) : activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog' ? (
                    <span className="text-base select-none leading-none">🐸</span>
                  ) : (
                    <BookOpen className="w-4 h-4 opacity-80" />
                  )}
                  <span>
                    {activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle'
                      ? 'Wise Turtle Sanctuary Routine Library'
                      : activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino'
                      ? 'Dino Kingdom Routine Library'
                      : activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog'
                      ? 'Ribbit Pond Routine Library'
                      : t('Pre-Built Routine Templates Library')}
                  </span>
                </h3>
                <p className={`text-xs ${activeTheme?.palette?.textAccent ? 'opacity-80' : 'text-amber-900/80'} font-medium mt-0.5`}>
                  {activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle'
                    ? 'Click "1-Tap Import" to add calm sanctuary flows directly to your schedule, or "Customize" to adjust steps.'
                    : activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino'
                    ? 'Click "1-Tap Import" to add prehistoric expedition routines to your schedule, or "Customize" to adjust steps.'
                    : activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog'
                    ? 'Click "1-Tap Import" to add fresh lily pad flows directly to your schedule, or "Customize" to adjust steps.'
                    : t('Click "1-Tap Import" to add any routine directly to your schedule, or "Customize" to tailor steps.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('schedules');
                  playChime('tap');
                }}
                className={`px-3 py-1.5 rounded-xl bg-white hover:bg-black/5 ${activeTheme?.palette?.textAccent || 'text-amber-950'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} font-black text-xs transition-all cursor-pointer shadow-2xs`}
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

        {activeSubTab === 'adventures' && (
          <Suspense fallback={<div className="p-8 text-center text-warm-stone animate-pulse">Loading...</div>}>
            <AdventuresView />
          </Suspense>
        )}
        {activeSubTab === 'skills' && (
          <Suspense fallback={<div className="p-8 text-center text-warm-stone animate-pulse">Loading...</div>}>
            <SkillsView />
          </Suspense>
        )}
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
