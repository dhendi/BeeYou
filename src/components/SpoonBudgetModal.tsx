import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, CheckCircle2, Flame, Battery, BatteryLow, BatteryMedium } from 'lucide-react';
import { playChime } from '../utils/audio';
import { SpoonCost, SpoonBudgetEntry } from '../types';

const TASK_PRESETS: Array<{ label: string; emoji: string; cost: SpoonCost }> = [
  { label: 'Getting dressed', emoji: '👗', cost: 1 },
  { label: 'Eating a meal', emoji: '🍽️', cost: 1 },
  { label: 'Showering / hygiene', emoji: '🚿', cost: 2 },
  { label: 'School / work', emoji: '📚', cost: 3 },
  { label: 'Social interaction', emoji: '👥', cost: 3 },
  { label: 'Doctor / dentist', emoji: '🏥', cost: 3 },
  { label: 'Short errand', emoji: '🛒', cost: 2 },
  { label: 'Exercise', emoji: '🏃', cost: 2 },
  { label: 'Cooking', emoji: '🍳', cost: 2 },
  { label: 'Commuting', emoji: '🚗', cost: 2 },
  { label: 'Rest / nap', emoji: '😴', cost: 1 },
  { label: 'Phone call', emoji: '📞', cost: 2 },
];

function getBatteryColor(remaining: number, total: number) {
  const pct = total > 0 ? remaining / total : 0;
  if (pct > 0.6) return 'text-green-500';
  if (pct > 0.3) return 'text-amber-500';
  return 'text-red-500';
}

export const SpoonBudgetModal: React.FC = () => {
  const {
    showSpoonModal,
    setShowSpoonModal,
    spoonEntries,
    addSpoonEntry,
    updateSpoonEntry,
    getTodaySpoonEntry,
    speak,
    announce,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = getTodaySpoonEntry();
  const [phase, setPhase] = useState<'checkin' | 'tracker'>(todayEntry ? 'tracker' : 'checkin');
  const [selectedSpoons, setSelectedSpoons] = useState(todayEntry?.totalSpoons || 8);

  if (!showSpoonModal) return null;

  const handleStartDay = () => {
    const entry: Omit<SpoonBudgetEntry, 'id'> = {
      date: today,
      totalSpoons: selectedSpoons,
      usedSpoons: 0,
      activityLog: [],
    };
    addSpoonEntry(entry);
    setPhase('tracker');
    playChime('complete');
    announce(`You have ${selectedSpoons} spoons today. Use them wisely.`);
  };

  const handleAddTask = (task: { label: string; emoji: string; cost: SpoonCost }) => {
    if (!todayEntry) return;
    const newUsed = todayEntry.usedSpoons + task.cost;
    const newLog = [...todayEntry.activityLog, { label: task.label, cost: task.cost, emoji: task.emoji }];
    updateSpoonEntry(todayEntry.id, { usedSpoons: newUsed, activityLog: newLog });
    playChime('tap');
    const remaining = todayEntry.totalSpoons - newUsed;
    if (remaining <= 0) {
      announce('You have used all your spoons. Please rest and recover.');
    } else {
      announce(`${remaining} spoons remaining.`);
    }
  };

  const handleRemoveTask = (idx: number) => {
    if (!todayEntry) return;
    const removedCost = todayEntry.activityLog[idx].cost;
    const newLog = todayEntry.activityLog.filter((_, i) => i !== idx);
    updateSpoonEntry(todayEntry.id, {
      usedSpoons: Math.max(0, todayEntry.usedSpoons - removedCost),
      activityLog: newLog,
    });
    playChime('clear');
  };

  const current = getTodaySpoonEntry();
  const remaining = current ? Math.max(0, current.totalSpoons - current.usedSpoons) : 0;
  const pct = current ? Math.min(100, (remaining / current.totalSpoons) * 100) : 100;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spoon Theory</p>
          <h2 className="text-xl font-black text-slate-800">Daily Energy Budget 🥄</h2>
        </div>
        <button
          type="button"
          aria-label="Close daily energy budget modal"
          onClick={() => setShowSpoonModal(false)}
          className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
        >
          <X className="w-5 h-5 text-slate-600" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {phase === 'checkin' && !todayEntry && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Morning Check-in</p>
              <h3 className="text-xl font-black text-slate-800 mb-1">How many spoons do you have today?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Spoons = units of energy. A full day = 12. A rough day might start with 5. Be honest with yourself. 💛
              </p>
            </div>

            {/* Spoon picker */}
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Initial daily spoon count selector">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} spoons`}
                  aria-pressed={selectedSpoons === n}
                  onClick={() => setSelectedSpoons(n)}
                  className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl text-lg font-black border-2 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${
                    selectedSpoons === n
                      ? 'bg-amber-400 border-amber-500 text-white shadow-md scale-110'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="text-center space-y-2">
              <div className="text-5xl" aria-hidden="true">{'🥄'.repeat(Math.min(selectedSpoons, 8))}{selectedSpoons > 8 ? '...' : ''}</div>
              <p className="text-sm font-bold text-slate-600">
                {selectedSpoons <= 3 ? '😔 Low day — be gentle with yourself.' :
                 selectedSpoons <= 6 ? '😐 Moderate — pick activities carefully.' :
                 selectedSpoons <= 9 ? '🙂 Pretty good day!' :
                 '😊 Feeling great! Make the most of it.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartDay}
              className="w-full min-h-[52px] py-4 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-md cursor-pointer active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              Start My Day with {selectedSpoons} Spoons 🥄
            </button>
          </div>
        )}

        {(phase === 'tracker' || todayEntry) && current && (
          <div className="space-y-5">
            {/* Energy Bar */}
            <div className="rounded-3xl border-2 border-slate-200 p-4 bg-slate-50" role="region" aria-label="Energy budget summary">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">Energy Remaining</span>
                  <span className="text-xs font-bold text-slate-600">
                    {pct > 60 ? '🟢 High Energy' : pct > 30 ? '🟡 Moderate Energy' : remaining > 0 ? '🔴 Low Energy' : '⚠️ Empty / Rest Needed'}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-black text-2xl ${getBatteryColor(remaining, current.totalSpoons)}`}>
                    {remaining} / {current.totalSpoons} 🥄
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {remaining} Spoons Remaining
                  </p>
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={current.totalSpoons} aria-label={`${remaining} spoons out of ${current.totalSpoons} remaining`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct > 60 ? 'bg-green-400' : pct > 30 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {remaining === 0 && (
                <p className="mt-2 text-xs font-bold text-red-600 text-center">
                  You've used all your spoons. Time to rest! 🛋️
                </p>
              )}
            </div>

            {/* Quick-add presets */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Add an Activity</p>
              <div className="grid grid-cols-2 gap-2">
                {TASK_PRESETS.map((task) => (
                  <button
                    key={task.label}
                    type="button"
                    aria-label={`Add activity: ${task.label}, cost ${task.cost} spoon${task.cost > 1 ? 's' : ''}`}
                    onClick={() => handleAddTask(task)}
                    disabled={remaining === 0}
                    className="flex items-center gap-2 p-2.5 min-h-[48px] rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                  >
                    <span className="text-xl" aria-hidden="true">{task.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 leading-tight truncate">{task.label}</p>
                      <p className="text-[10px] font-bold text-slate-400">
                        <span aria-hidden="true">{'🥄'.repeat(task.cost)}</span> {task.cost} spoon{task.cost > 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            {current.activityLog.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Today's Log</p>
                <div className="space-y-2">
                  {current.activityLog.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200">
                      <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                      <span className="flex-1 text-sm font-bold text-slate-700">{item.label}</span>
                      <span className="text-xs font-bold text-slate-400" aria-label={`Cost: ${item.cost} spoons`}>
                        <span aria-hidden="true">{'🥄'.repeat(item.cost)}</span> ({item.cost})
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove activity ${item.label}`}
                        onClick={() => handleRemoveTask(idx)}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset for tomorrow */}
            <button
              type="button"
              onClick={() => { setPhase('checkin'); }}
              className="w-full min-h-[48px] py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              🔄 Reset & Start a New Check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
