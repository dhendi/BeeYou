import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  Smile, 
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { Routine, VisualScheduleStep } from '../types';
import { playChime } from '../utils/audio';

interface RoutineCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoutine: Partial<Routine> | null;
  onSave: (routineData: Omit<Routine, 'id'>, existingId?: string) => void;
}

const COMMON_EMOJIS = ['🌅', '🏫', '🌙', '🎒', '🦷', '🧩', '🛒', '🥞', '🧸', '🚿', '🪥', '👕', '🥪', '🛝', '📖', '✨', '👟', '🚌'];

export const RoutineCustomizerModal: React.FC<RoutineCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialRoutine,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'morning' | 'school' | 'after-school' | 'bedtime' | 'appointment' | 'custom'>('morning');
  const [emoji, setEmoji] = useState('🌅');
  const [time, setTime] = useState('8:00 AM');
  
  // First/Then
  const [firstTask, setFirstTask] = useState('Brush teeth');
  const [firstEmoji, setFirstEmoji] = useState('🪥');
  const [thenTask, setThenTask] = useState('Tablet time');
  const [thenEmoji, setThenEmoji] = useState('📱');
  
  // Steps
  const [steps, setSteps] = useState<VisualScheduleStep[]>([]);
  
  // New step input
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepInstruction, setNewStepInstruction] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(5);
  const [newStepEmoji, setNewStepEmoji] = useState('✨');
  const [newStepSensoryNote, setNewStepSensoryNote] = useState('');

  useEffect(() => {
    if (initialRoutine) {
      setTitle(initialRoutine.title || '');
      setCategory(initialRoutine.category || 'morning');
      setEmoji(initialRoutine.emoji || '🌅');
      setTime(initialRoutine.time || '8:00 AM');
      
      if (initialRoutine.firstThen) {
        setFirstTask(initialRoutine.firstThen.first || '');
        setFirstEmoji(initialRoutine.firstThen.firstEmoji || '🪥');
        setThenTask(initialRoutine.firstThen.then || '');
        setThenEmoji(initialRoutine.firstThen.thenEmoji || '📱');
      } else {
        setFirstTask('');
        setFirstEmoji('🪥');
        setThenTask('');
        setThenEmoji('📱');
      }

      if (initialRoutine.steps && initialRoutine.steps.length > 0) {
        setSteps(initialRoutine.steps.map(s => ({ ...s })));
      } else {
        setSteps([
          { id: `step-${Date.now()}-1`, title: 'Get ready', instruction: 'Start calmly', durationMin: 5, completed: false, emoji: '✨' },
          { id: `step-${Date.now()}-2`, title: 'Complete first task', instruction: 'Finish current step', durationMin: 10, completed: false, emoji: '👍' },
        ]);
      }
    }
  }, [initialRoutine]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: VisualScheduleStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newStepTitle.trim(),
      instruction: newStepInstruction.trim() || undefined,
      durationMin: Number(newStepDuration) || 5,
      completed: false,
      emoji: newStepEmoji || '✨',
      sensoryNote: newStepSensoryNote.trim() || undefined,
    };
    setSteps([...steps, newStep]);
    setNewStepTitle('');
    setNewStepInstruction('');
    setNewStepSensoryNote('');
    playChime('tap');
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    playChime('clear');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) return;
    const newSteps = [...steps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    setSteps(newSteps);
    playChime('tap');
  };

  const handleUpdateStepTitle = (index: number, newTitle: string) => {
    const updated = [...steps];
    updated[index].title = newTitle;
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const routinePayload: Omit<Routine, 'id'> = {
      title: title.trim(),
      category,
      emoji,
      time: time.trim() || undefined,
      firstThen: firstTask.trim() && thenTask.trim() ? {
        first: firstTask.trim(),
        firstEmoji,
        then: thenTask.trim(),
        thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: steps.length > 0 ? steps : [
        { id: `step-${Date.now()}`, title: 'First step', completed: false, emoji: '✨' }
      ],
    };

    onSave(routinePayload, initialRoutine?.id);
    playChime('star');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-sky-200 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-sky-50 rounded-2xl border border-sky-100">{emoji}</span>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {initialRoutine?.id ? 'Customize Active Routine' : 'Customize & Import Routine'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tailor step sequences, duration, and rewards specifically for your child.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-slate-700 block mb-1">Routine Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calm Morning Routine"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
              >
                <option value="morning">Morning</option>
                <option value="school">School Day</option>
                <option value="after-school">After-School</option>
                <option value="bedtime">Bedtime</option>
                <option value="appointment">Appointment</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 7:30 AM"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
              />
            </div>

            {/* Quick Emoji Bar */}
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Pick Icon Emoji:</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {COMMON_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                      emoji === em ? 'bg-sky-500 text-white scale-110 shadow-xs' : 'bg-white hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* First / Then Sequencing */}
          <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                First / Then Visual Sequence
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                High motivation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-indigo-200">
                <span className="text-[11px] font-black uppercase text-indigo-700 block mb-1">
                  1. FIRST (Demand / Task):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={firstEmoji}
                    onChange={(e) => setFirstEmoji(e.target.value)}
                    className="w-10 text-center px-1 py-1.5 rounded-lg border border-slate-300 font-bold text-sm"
                  />
                  <input
                    type="text"
                    value={firstTask}
                    onChange={(e) => setFirstTask(e.target.value)}
                    placeholder="e.g. Put on clothes & brush teeth"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="text-[11px] font-black uppercase text-purple-700 block mb-1">
                  2. THEN (Reward / Motivation):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={thenEmoji}
                    onChange={(e) => setThenEmoji(e.target.value)}
                    className="w-10 text-center px-1 py-1.5 rounded-lg border border-slate-300 font-bold text-sm"
                  />
                  <input
                    type="text"
                    value={thenTask}
                    onChange={(e) => setThenTask(e.target.value)}
                    placeholder="e.g. 15 min tablet or favorite music"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Step-by-Step Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>Visual Steps ({steps.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Children check off each step on their visual schedule.
                </p>
              </div>
            </div>

            {/* List of existing steps */}
            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group hover:border-sky-300 transition"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xl shrink-0">{st.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => handleUpdateStepTitle(idx, e.target.value)}
                        className="w-full bg-transparent font-bold text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-sky-400 rounded-sm px-1 py-0.5"
                      />
                      {st.sensoryNote && (
                        <p className="text-[10px] text-teal-700 italic truncate px-1">
                          💡 Sensory tip: {st.sensoryNote}
                        </p>
                      )}
                    </div>
                    {st.durationMin && (
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {st.durationMin}m
                      </span>
                    )}
                  </div>

                  {/* Actions: Move up/down, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, 'down')}
                      disabled={idx === steps.length - 1}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Step Card */}
            <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black text-sky-900 block">Add Step:</span>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <input
                  type="text"
                  value={newStepEmoji}
                  onChange={(e) => setNewStepEmoji(e.target.value)}
                  placeholder="Emoji"
                  className="sm:col-span-1 px-2 py-1.5 text-center rounded-xl bg-white border border-slate-300 text-sm font-bold"
                />
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Step title (e.g. Put shoes on)"
                  className="sm:col-span-3 px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newStepDuration}
                  onChange={(e) => setNewStepDuration(Number(e.target.value))}
                  placeholder="Min"
                  className="sm:col-span-1 px-2 py-1.5 text-center rounded-xl bg-white border border-slate-300 font-bold text-xs"
                  title="Duration in minutes"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="sm:col-span-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
              <input
                type="text"
                value={newStepSensoryNote}
                onChange={(e) => setNewStepSensoryNote(e.target.value)}
                placeholder="Optional sensory or regulation tip (e.g. Tagless shirt, dim lighting)"
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-[11px]"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{initialRoutine?.id ? 'Save Routine Changes' : 'Import to Child Schedules'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
