import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Routine, RoutineTemplate } from '../../types';
import { RoutineTemplatesLibrary } from '../RoutineTemplatesLibrary';
import { RoutineCustomizerModal } from '../RoutineCustomizerModal';
import { playChime } from '../../utils/audio';
import { BookOpen, Layers, Plus, Crown, Clock, Edit3, Copy, Trash2, Sparkles } from 'lucide-react';

interface CaregiverRoutinesTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverRoutinesTab: React.FC<CaregiverRoutinesTabProps> = ({ onShowNotification, onStartTour }) => {
  const {
    childProfile,
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const [routinesSubView, setRoutinesSubView] = useState<'library' | 'active' | 'create'>('library');
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [customizingRoutine, setCustomizingRoutine] = useState<Partial<Routine> | null>(null);

  // New routine state
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineCategory] = useState<'morning' | 'bedtime' | 'school' | 'hygiene' | 'chores' | 'flexible'>('morning');
  const [newRoutineEmoji, setNewRoutineEmoji] = useState('☀️');
  const [newRoutineTime, setNewRoutineTime] = useState('08:00 AM');
  const [newFirstTask, setNewFirstTask] = useState('Brush teeth & wash face');
  const [newThenTask, setNewThenTask] = useState('Watch favorite show (15m)');

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;

    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }

    addRoutine({
      title: newRoutineTitle.trim(),
      category: newRoutineCategory as any,
      emoji: newRoutineEmoji,
      time: newRoutineTime,
      firstThen: {
        first: newFirstTask,
        firstEmoji: '🪥',
        then: newThenTask,
        thenEmoji: '📱',
        completedFirst: false,
        completedThen: false,
      },
      steps: [
        { id: `st-${Date.now()}-1`, title: 'Get ready', instruction: 'Start calmly', durationMin: 5, completed: false, emoji: '✨' },
        { id: `st-${Date.now()}-2`, title: newFirstTask, instruction: 'Complete first task', durationMin: 5, completed: false, emoji: '🪥' },
        { id: `st-${Date.now()}-3`, title: 'Check in with caregiver', instruction: 'Show completed work', durationMin: 2, completed: false, emoji: '👍' },
        { id: `st-${Date.now()}-4`, title: newThenTask, instruction: 'Enjoy reward activity', durationMin: 15, completed: false, emoji: '📱' },
      ],
    });

    onShowNotification(`Routine "${newRoutineTitle}" created with First/Then!`);
    setNewRoutineTitle('');
  };

  const handleQuickImportTemplate = (template: RoutineTemplate) => {
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
    addRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
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
    onShowNotification(`Imported "${template.title}" template into active routines!`);
  };

  const handleCustomizeTemplate = (template: RoutineTemplate) => {
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
    setCustomizingRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
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
    setCustomizerModalOpen(true);
  };

  const handleEditActiveRoutine = (routine: Routine) => {
    setCustomizingRoutine(routine);
    setCustomizerModalOpen(true);
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
    addRoutine({
      title: `${routine.title} (Copy)`,
      category: routine.category,
      emoji: routine.emoji,
      time: routine.time,
      firstThen: routine.firstThen ? { ...routine.firstThen, completedFirst: false, completedThen: false } : undefined,
      steps: routine.steps.map((s, idx) => ({ ...s, id: `dup-${Date.now()}-${idx}`, completed: false })),
    });
    onShowNotification(`Duplicated "${routine.title}"!`);
  };

  const handleSaveCustomizedRoutine = (routineData: Omit<Routine, 'id'>, existingId?: string) => {
    if (existingId) {
      updateRoutine({
        id: existingId,
        ...routineData,
      });
      onShowNotification(`Routine "${routineData.title}" updated successfully!`);
    } else {
      addRoutine(routineData);
      onShowNotification(`Custom routine "${routineData.title}" saved!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Visual Schedules & Routines</span>
            <span className="text-xs font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
              First / Then Motor Planning
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Build predictable morning, school, bedtime, or appointment routines with visual sequencing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onStartTour();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300"
              title="Tour visual routines features"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>How This Works (Tour)</span>
            </button>
          )}

          {/* Sub-view switcher */}
          <div data-tour="routines-subtabs" className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => {
                setRoutinesSubView('library');
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                routinesSubView === 'library'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Template Library</span>
            </button>
            <button
              onClick={() => {
                setRoutinesSubView('active');
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                routinesSubView === 'active'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Active Routines ({routines.length})</span>
            </button>
            <button
              onClick={() => {
                if (!isPremium && routines.length >= 1) {
                  triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
                  return;
                }
                setRoutinesSubView('create');
                playChime('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                routinesSubView === 'create'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {!isPremium && routines.length >= 1 ? (
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>Create Custom</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Routine Basic Plan Limit Banner */}
      {!isPremium && routines.length >= 1 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-xl shadow-xs">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Basic Plan Limit (1/1 Routine)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">Free Tier</span>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-0.5">
                The Basic plan includes 1 active visual routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines, templates, and First-Then boards.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span>Start 30-Day Free Trial</span>
          </button>
        </div>
      )}

      {/* VIEW 1: ROUTINE TEMPLATES LIBRARY */}
      {routinesSubView === 'library' && (
        <div data-tour="routines-templates-list" className="space-y-6">
          <RoutineTemplatesLibrary
            onQuickImport={handleQuickImportTemplate}
            onCustomizeTemplate={handleCustomizeTemplate}
            existingRoutineTitles={routines.map((r) => r.title)}
          />

          {/* Quick Shortcut to Active Routines */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  Looking for active child routines?
                </span>
                <span className="text-[11px] text-slate-500">
                  {routines.length} routines currently in {childProfile.name}'s daily schedule.
                </span>
              </div>
            </div>
            <button
              onClick={() => setRoutinesSubView('active')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              View Active Routines →
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE ROUTINES LIST */}
      {routinesSubView === 'active' && (
        <div data-tour="routines-firstthen-card" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Active Child Routines ({routines.length}):
            </span>
            <button
              onClick={() => setRoutinesSubView('library')}
              className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Template Library</span>
            </button>
          </div>

          <div className="space-y-3">
            {routines.map((r) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 bg-white border-2 border-slate-200 hover:border-sky-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <span className="text-3xl sm:text-4xl p-2 bg-sky-50 rounded-2xl border border-sky-100 shrink-0">
                    {r.emoji}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        {r.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold capitalize">
                        {r.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3 h-3 text-sky-600" />
                        {r.time || 'Flexible'}
                      </span>
                      <span>•</span>
                      <span>{r.steps.length} visual steps</span>
                      {r.firstThen && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                            First {r.firstThen.first} → Then {r.firstThen.then}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleEditActiveRoutine(r)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Customize steps, times, and rewards"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateRoutine(r)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    title="Duplicate routine"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete routine "${r.title}"?`)) {
                        deleteRoutine(r.id);
                        onShowNotification(`Routine "${r.title}" deleted.`);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {routines.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 space-y-3">
                <span className="text-3xl">📅</span>
                <h4 className="font-black text-slate-800 text-sm">No active routines yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Import from our pre-built library of Morning, School Day, and Bedtime templates to get started quickly.
                </p>
                <button
                  onClick={() => setRoutinesSubView('library')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse Template Library</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CREATE CUSTOM FROM SCRATCH */}
      {routinesSubView === 'create' && (
        <form onSubmit={handleCreateRoutine} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Create New Routine with First / Then</span>
            </h3>
            <button
              type="button"
              onClick={() => setRoutinesSubView('library')}
              className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
            >
              Or import a pre-built template →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Routine Title:</label>
              <input
                type="text"
                value={newRoutineTitle}
                onChange={(e) => setNewRoutineTitle(e.target.value)}
                placeholder="e.g. Weekend Park Routine"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Time:</label>
              <input
                type="text"
                value={newRoutineTime}
                onChange={(e) => setNewRoutineTime(e.target.value)}
                placeholder="e.g. 9:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Icon Emoji:</label>
              <input
                type="text"
                value={newRoutineEmoji}
                onChange={(e) => setNewRoutineEmoji(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-black text-sky-800 block mb-1">FIRST task:</label>
              <input
                type="text"
                value={newFirstTask}
                onChange={(e) => setNewFirstTask(e.target.value)}
                placeholder="e.g. Brush teeth"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-black text-purple-800 block mb-1">THEN reward/next task:</label>
              <input
                type="text"
                value={newThenTask}
                onChange={(e) => setNewThenTask(e.target.value)}
                placeholder="e.g. Tablet time (15m)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              Create Routine
            </button>
            <button
              type="button"
              onClick={() => setRoutinesSubView('active')}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
            >
              View Active Routines
            </button>
          </div>
        </form>
      )}

      {/* Routine Customizer Modal */}
      {customizerModalOpen && customizingRoutine && (
        <RoutineCustomizerModal
          isOpen={customizerModalOpen}
          initialRoutine={customizingRoutine}
          onClose={() => {
            setCustomizerModalOpen(false);
            setCustomizingRoutine(null);
          }}
          onSave={handleSaveCustomizedRoutine}
        />
      )}
    </div>
  );
};
