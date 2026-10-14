import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Flame, 
  Battery, 
  BatteryLow, 
  BatteryMedium,
  RotateCcw,
  Shirt,
  Utensils,
  BookOpen,
  Users,
  HeartPulse,
  ShoppingBag,
  Activity,
  Car,
  Moon,
  Phone,
  Droplets,
  AlertCircle
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { SpoonCost, SpoonBudgetEntry } from '../types';
import { t } from '../services/translator';

const TASK_PRESETS: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; cost: SpoonCost }> = [
  { label: 'Getting dressed', icon: Shirt, cost: 1 },
  { label: 'Eating a meal', icon: Utensils, cost: 1 },
  { label: 'Showering / hygiene', icon: Droplets, cost: 2 },
  { label: 'School / work', icon: BookOpen, cost: 3 },
  { label: 'Social interaction', icon: Users, cost: 3 },
  { label: 'Doctor / dentist', icon: HeartPulse, cost: 3 },
  { label: 'Short errand', icon: ShoppingBag, cost: 2 },
  { label: 'Exercise', icon: Activity, cost: 2 },
  { label: 'Cooking', icon: Utensils, cost: 2 },
  { label: 'Commuting', icon: Car, cost: 2 },
  { label: 'Rest / nap', icon: Moon, cost: 1 },
  { label: 'Phone call', icon: Phone, cost: 2 },
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

  const handleAddTask = (task: typeof TASK_PRESETS[0]) => {
    if (!todayEntry) return;
    const newUsed = todayEntry.usedSpoons + task.cost;
    const newLog = [...todayEntry.activityLog, { label: task.label, cost: task.cost, emoji: '' }];
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Daily Energy Budget')}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowSpoonModal(false)}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Spoon Theory')}</p>
            <h2 className="text-xl font-black text-slate-800">{t('Daily Energy Budget')}</h2>
          </div>
          <button
            type="button"
            aria-label={t('Close daily energy budget modal')}
            onClick={() => setShowSpoonModal(false)}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer active:scale-95 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
          >
            <X className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">
        {phase === 'checkin' && !todayEntry && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">{t('Morning Check-in')}</p>
              <h3 className="text-xl font-black text-slate-800 mb-1">{t('How many spoons do you have today?')}</h3>
              <p className="text-sm text-slate-600 font-medium">
                {t('Spoons = units of energy. A full day = 12. A rough day might start with 5. Be honest with yourself.')}
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

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto py-2" aria-hidden="true">
                {Array.from({ length: selectedSpoons }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs flex items-center justify-center shadow-2xs">
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-600">
                {selectedSpoons <= 3 ? t('Low day — be gentle with yourself.') :
                 selectedSpoons <= 6 ? t('Moderate — pick activities carefully.') :
                 selectedSpoons <= 9 ? t('Pretty good day!') :
                 t('Feeling great! Make the most of it.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartDay}
              className="w-full min-h-[52px] py-4 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-md cursor-pointer active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              {t('Start My Day with')} {selectedSpoons} {t('Spoons')}
            </button>
          </div>
        )}

        {(phase === 'tracker' || todayEntry) && current && (
          <div className="space-y-5">
            {/* Energy Bar */}
            <div className="rounded-3xl border-2 border-slate-200 p-4 bg-slate-50" role="region" aria-label="Energy budget summary">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">{t('Energy Remaining')}</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : remaining > 0 ? 'bg-red-500' : 'bg-red-700'}`} />
                    {pct > 60 ? t('High Energy') : pct > 30 ? t('Moderate Energy') : remaining > 0 ? t('Low Energy') : t('Empty / Rest Needed')}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-black text-2xl ${getBatteryColor(remaining, current.totalSpoons)}`}>
                    {remaining} / {current.totalSpoons}
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {remaining} {t('Spoons Remaining')}
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
                  {t("You've used all your spoons. Time to rest!")}
                </p>
              )}
            </div>

            {/* Quick-add presets */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t('Add an Activity')}</p>
              <div className="grid grid-cols-2 gap-2">
                {TASK_PRESETS.map((task) => {
                  const IconComp = task.icon;
                  return (
                    <button
                      key={task.label}
                      type="button"
                      aria-label={`Add activity: ${task.label}, cost ${task.cost} spoon${task.cost > 1 ? 's' : ''}`}
                      onClick={() => handleAddTask(task)}
                      disabled={remaining === 0}
                      className="flex items-center gap-2.5 p-2.5 min-h-[48px] rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4 text-amber-800" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 leading-tight truncate">{t(task.label)}</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          <span className="font-black text-amber-700">{task.cost}</span> {task.cost === 1 ? t('spoon') : t('spoons')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Log */}
            {current.activityLog.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{t("Today's Log")}</p>
                <div className="space-y-2">
                  {current.activityLog.map((item, idx) => {
                    const matchedPreset = TASK_PRESETS.find((p) => p.label === item.label);
                    const IconComp = matchedPreset?.icon || Activity;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <IconComp className="w-4 h-4 text-slate-600" aria-hidden="true" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-slate-700 truncate">{t(item.label)}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200" aria-label={`Cost: ${item.cost} spoons`}>
                          {item.cost} {item.cost === 1 ? t('spoon') : t('spoons')}
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset for tomorrow */}
            <button
              type="button"
              onClick={() => { setPhase('checkin'); }}
              className="w-full min-h-[48px] py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>{t('Reset & Start a New Check-in')}</span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
