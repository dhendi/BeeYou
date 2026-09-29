import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyHabit } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Flame, 
  Volume2, 
  Trash2, 
  X, 
  Heart, 
  Droplets,
  RotateCcw,
  Star
} from 'lucide-react';
import { playChime, speakText } from '../utils/audio';

export const DailyHabitsModule: React.FC = () => {
  const {
    habits,
    toggleHabit,
    incrementHabitCount,
    addHabit,
    deleteHabit,
    childProfile,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New habit form state
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const [newCategory, setNewCategory] = useState<DailyHabit['category']>('organization');
  const [newTarget, setNewTarget] = useState<number>(1);
  const [newEncouragement, setNewEncouragement] = useState('Great job taking care of your day!');

  const completedTodayCount = habits.filter((h) => h.completedToday).length;
  const totalHabitsCount = habits.length;
  const progressRatio = totalHabitsCount > 0 ? (completedTodayCount / totalHabitsCount) * 100 : 0;

  const filteredHabits = habits.filter((h) => {
    if (activeCategory === 'all') return true;
    return h.category === activeCategory;
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      emoji: newEmoji || '⭐',
      category: newCategory,
      targetTimesPerDay: newTarget || 1,
      timesCompletedToday: 0,
      encouragement: newEncouragement.trim() || 'Awesome job!',
    });

    setNewTitle('');
    setShowAddModal(false);
    playChime('star');
    speakText(`Added new daily habit: ${newTitle}`);
  };

  return (
    <div className="space-y-4">
      {/* 1. DAILY HABITS HEADER SUMMARY */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl sm:text-4xl shadow-sm shrink-0">
              🌿
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Recurring Daily Tasks
                </span>
                <span className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  +1 Star per Habit
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 leading-tight">
                {childProfile.name}'s Daily Habits
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-0.5">
                Gentle, anytime tasks to practice independence throughout your day.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                playChime('star');
                speakText(
                  `You have completed ${completedTodayCount} of ${totalHabitsCount} daily habits today. Wonderful work, ${childProfile.name}!`
                );
              }}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              title="Hear habit progress"
              aria-label="Hear habit progress"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
                playChime('tap');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
            <span>Completed Today</span>
            <span>
              {completedTodayCount} of {totalHabitsCount} Done ({Math.round(progressRatio)}%)
            </span>
          </div>
          <div className="w-full bg-white/25 h-3 rounded-full overflow-hidden">
            <div
              className="bg-amber-300 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: 'all', label: 'All Habits', emoji: '🌟' },
          { id: 'health', label: 'Health & Body', emoji: '💧' },
          { id: 'organization', label: 'Organization & Space', emoji: '👟' },
          { id: 'self-care', label: 'Self-Care', emoji: '🧘' },
          { id: 'kindness', label: 'Kindness & Home', emoji: '🪴' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              playChime('tap');
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeCategory === cat.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. HABIT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredHabits.map((habit) => {
          const isDone = habit.completedToday;
          const isMultiCount = (habit.targetTimesPerDay || 1) > 1;
          const currentCount = habit.timesCompletedToday || 0;
          const targetCount = habit.targetTimesPerDay || 1;

          return (
            <div
              key={habit.id}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs ${
                      isDone
                        ? 'bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {habit.emoji}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {habit.category}
                      </span>
                      {habit.streakDays > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{habit.streakDays}d streak</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`font-black text-sm sm:text-base mt-0.5 leading-snug ${isDone ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {habit.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">
                      {habit.encouragement}
                    </p>
                  </div>
                </div>

                {/* Delete button if custom */}
                {habit.isCustom && (
                  <button
                    type="button"
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Strip: Tap to Complete or Multi-Count Tapper */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                {isMultiCount ? (
                  /* Multi-Count Progress (e.g. Drink Water: 2/4) */
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-500" />
                      <span className="text-xs font-black text-slate-700">
                        {currentCount} of {targetCount} Done
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => incrementHabitCount(habit.id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-500 hover:bg-sky-600 text-white'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Target Met! ⭐</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1 {habit.title.includes('Water') ? 'Cup' : 'Time'}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Standard 1-Tap Toggle */
                  <button
                    type="button"
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                      isDone
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done Today! ⭐</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-slate-400" />
                        <span>Mark Done for Today</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL: ADD CUSTOM DAILY HABIT */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border-2 border-slate-200 shadow-xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{newEmoji}</span>
                <h3 className="font-black text-slate-800 text-base">Add New Daily Habit</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Habit Name:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Put shoes on rack, water plant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emoji Icon:</label>
                  <div className="flex items-center gap-1.5">
                    {['👟', '💧', '🧥', '🎒', '🧺', '🪴', '🍎', '🧸'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewEmoji(em)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg cursor-pointer ${
                          newEmoji === em ? 'bg-teal-100 ring-2 ring-teal-500' : 'hover:bg-slate-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs bg-white outline-none"
                  >
                    <option value="organization">Organization</option>
                    <option value="health">Health & Body</option>
                    <option value="self-care">Self-Care</option>
                    <option value="kindness">Kindness & Home</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Encouraging Message:
                </label>
                <input
                  type="text"
                  value={newEncouragement}
                  onChange={(e) => setNewEncouragement(e.target.value)}
                  placeholder="e.g. Neatly put away and ready for tomorrow!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-xs outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
