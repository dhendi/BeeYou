import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Sparkles,
  Layers
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { MyDayView } from './MyDayView';
import { AdventuresView } from './AdventuresView';
import { SkillsView } from './SkillsView';

export const MyRoutineView: React.FC = () => {
  const {
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

  const [activeSubTab, setActiveSubTab] = useState<'schedules' | 'adventures' | 'skills'>(() => {
    if (activeAdventureId) return 'adventures';
    if (activeSkillId) return 'skills';
    return 'schedules';
  });

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-2 sm:px-4 py-2 pb-24 space-y-3">
      {/* Top Banner: Quick Tools (Plans Changed, Timer, Morning Brief) */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
        {/* Segmented Routine Sub-tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('schedules');
              setActiveAdventureId(null);
              setActiveSkillId(null);
              playChime('tap');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'schedules'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedules</span>
          </button>

          {enabledFeatures?.socialStories !== false && (
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('adventures');
                setActiveSkillId(null);
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeSubTab === 'adventures'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{userAgeGroup === 'adult' ? 'Guides' : userAgeGroup === 'teen' ? 'Scenarios' : 'Adventures'}</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeSubTab === 'skills'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Life Skills</span>
            </button>
          )}
        </div>

        {/* Quick Actions (Plans Changed, Timer, Brief) */}
        <div className="flex items-center gap-1.5">
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
            <span className="hidden sm:inline">Plans Changed</span>
            <span className="sm:hidden">Plans</span>
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
            <span className="hidden sm:inline">Timer</span>
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
            <span className="hidden sm:inline">Brief</span>
          </button>
        </div>
      </div>

      {/* Subtab Content Area */}
      <div className="flex-1">
        {activeSubTab === 'schedules' && <MyDayView />}
        {activeSubTab === 'adventures' && <AdventuresView />}
        {activeSubTab === 'skills' && <SkillsView />}
      </div>
    </div>
  );
};
