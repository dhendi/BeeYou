import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  RotateCcw,
  Activity
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { SpoonCost, SpoonBudgetEntry } from '../types';
import { t } from '../services/translator';

interface TaskPreset {
  label: string;
  stickerSrc: string;
  cost: SpoonCost;
}

const TASK_PRESETS: TaskPreset[] = [
  { label: 'Getting dressed', stickerSrc: '/assets/stickers/clothes_dressed.png', cost: 1 },
  { label: 'Eating a meal', stickerSrc: '/assets/stickers/cutlery_meal.png', cost: 1 },
  { label: 'Showering / hygiene', stickerSrc: '/assets/stickers/shower_wash.png', cost: 2 },
  { label: 'School / work', stickerSrc: '/assets/stickers/school_building.png', cost: 3 },
  { label: 'Social interaction', stickerSrc: '/assets/stickers/aac_people.png', cost: 3 },
  { label: 'Doctor / dentist', stickerSrc: '/assets/stickers/adventure_doctor_checkup.png', cost: 3 },
  { label: 'Short errand', stickerSrc: '/assets/stickers/shopping_cart.png', cost: 2 },
  { label: 'Exercise', stickerSrc: '/assets/stickers/sneaker_shoes.png', cost: 2 },
  { label: 'Cooking', stickerSrc: '/assets/stickers/cooking_pot.png', cost: 2 },
  { label: 'Commuting', stickerSrc: '/assets/stickers/car_ride.png', cost: 2 },
  { label: 'Rest / nap', stickerSrc: '/assets/stickers/bedtime_sleep.png', cost: 1 },
  { label: 'Phone call', stickerSrc: '/assets/stickers/caregiver_phone.png', cost: 2 },
];

function getBatteryColor(remaining: number, total: number) {
  const pct = total > 0 ? remaining / total : 0;
  if (pct > 0.6) return 'text-emerald-600';
  if (pct > 0.3) return 'text-amber-600';
  return 'text-rose-600';
}

export const SpoonBudgetModal: React.FC = () => {
  const {
    showSpoonModal,
    setShowSpoonModal,
    spoonEntries: _spoonEntries,
    addSpoonEntry,
    updateSpoonEntry,
    getTodaySpoonEntry,
    announce,
    activeTheme,
  } = useApp();

  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';

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
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in fade-in duration-200"
      onClick={() => setShowSpoonModal(false)}
    >
      <div
        className={`bg-white w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border-2 ${
          isFrogTheme
            ? 'border-lime-400'
            : isTurtleTheme
            ? 'border-emerald-300'
            : isDinoTheme
            ? 'border-green-400'
            : 'border-amber-300'
        } overflow-hidden flex flex-col animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${
          isFrogTheme
            ? 'bg-gradient-to-r from-lime-600 via-emerald-700 to-teal-800'
            : isTurtleTheme
            ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800'
            : isDinoTheme
              ? 'bg-gradient-to-r from-green-700 via-emerald-800 to-amber-900'
              : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500'
        } p-4 sm:p-5 text-white flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center p-1 shadow-inner border border-white/30 shrink-0">
              {isFrogTheme ? (
                <span className="text-2xl select-none leading-none">🐸</span>
              ) : isDinoTheme ? (
                <span className="text-2xl select-none leading-none">🦖</span>
              ) : (
                <img
                  src={isTurtleTheme ? '/assets/stickers/turtle_bamboo_spoons.png' : '/assets/stickers/spoons_energy.png'}
                  alt="Spoons"
                  className="w-8 h-8 object-contain drop-shadow-2xs select-none pointer-events-none"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  {isFrogTheme ? t('Ribbit Pond') : isTurtleTheme ? t('Turtle Sanctuary') : isDinoTheme ? t('Dino Kingdom') : t('Spoon Theory')}
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {t('Stamina & Energy')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {t('Daily Energy Budget')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label={t('Close daily energy budget modal')}
            onClick={() => {
              setShowSpoonModal(false);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {phase === 'checkin' && !todayEntry && (
            <div className="space-y-6">
              <div className={`rounded-2xl ${
                isFrogTheme
                  ? 'bg-gradient-to-br from-lime-50 via-emerald-50/60 to-teal-50 border-lime-300'
                  : isTurtleTheme
                  ? 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50 border-emerald-300'
                  : isDinoTheme
                    ? 'bg-gradient-to-br from-green-50 via-emerald-50/60 to-amber-50 border-green-300'
                    : 'bg-gradient-to-br from-amber-50 via-yellow-50/60 to-amber-50 border-amber-300'
              } border-2 p-5 shadow-2xs`}>
                <p className={`text-xs font-black uppercase tracking-wider ${
                  isFrogTheme ? 'text-lime-800' : isTurtleTheme ? 'text-emerald-800' : isDinoTheme ? 'text-green-800' : 'text-amber-800'
                } mb-1`}>{t('Morning Check-in')}</p>
                <h3 className="text-xl font-black text-slate-900 mb-1">{t('How many spoons do you have today?')}</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
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
                    onClick={() => {
                      playChime('tap');
                      setSelectedSpoons(n);
                    }}
                    className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl text-lg font-black border-2 transition-all cursor-pointer focus-visible:ring-4 ${
                      isFrogTheme ? 'focus-visible:ring-lime-400' : isTurtleTheme ? 'focus-visible:ring-emerald-400' : isDinoTheme ? 'focus-visible:ring-green-400' : 'focus-visible:ring-amber-400'
                    } focus-visible:outline-none ${
                      selectedSpoons === n
                        ? isFrogTheme
                          ? 'bg-lime-600 border-lime-700 text-white shadow-md scale-110'
                          : isTurtleTheme
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-md scale-110'
                          : isDinoTheme
                            ? 'bg-green-600 border-green-700 text-white shadow-md scale-110'
                            : 'bg-amber-500 border-amber-600 text-white shadow-md scale-110'
                        : isFrogTheme
                        ? 'bg-lime-50 border-lime-200 text-lime-950 hover:bg-lime-100'
                        : isTurtleTheme
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                        : isDinoTheme
                        ? 'bg-green-50 border-green-200 text-green-950 hover:bg-green-100'
                        : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto py-2" aria-hidden="true">
                  {Array.from({ length: selectedSpoons }).map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${
                      isFrogTheme
                        ? 'bg-lime-100 border-lime-300 text-lime-950'
                        : isTurtleTheme
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                        : isDinoTheme
                          ? 'bg-green-100 border-green-300 text-green-950'
                          : 'bg-amber-100 border-amber-300 text-amber-950'
                    } border font-black text-xs flex items-center justify-center shadow-2xs`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className={`text-xs sm:text-sm font-black ${
                  isFrogTheme ? 'text-lime-950' : isTurtleTheme ? 'text-emerald-950' : isDinoTheme ? 'text-green-950' : 'text-amber-950'
                }`}>
                  {selectedSpoons <= 3 ? t('Low day — be gentle with yourself.') :
                   selectedSpoons <= 6 ? t('Moderate — pick activities carefully.') :
                   selectedSpoons <= 9 ? t('Pretty good day!') :
                   t('Feeling great! Make the most of it.')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartDay}
                className={`w-full min-h-[52px] py-4 rounded-2xl ${
                  isFrogTheme
                    ? 'bg-lime-600 hover:bg-lime-700 text-white shadow-lime-200'
                    : isTurtleTheme
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : isDinoTheme
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                } font-black text-base sm:text-lg shadow-md cursor-pointer active:scale-95 transition-all focus-visible:ring-4 ${
                  isFrogTheme ? 'focus-visible:ring-lime-400' : isTurtleTheme ? 'focus-visible:ring-emerald-400' : isDinoTheme ? 'focus-visible:ring-green-400' : 'focus-visible:ring-amber-400'
                } focus-visible:outline-none`}
              >
                {t('Start My Day with')} {selectedSpoons} {t('Spoons')}
              </button>
            </div>
          )}

          {(phase === 'tracker' || todayEntry) && current && (
            <div className="space-y-4">
              {/* Energy Bar */}
              <div className={`rounded-2xl border-2 ${
                isFrogTheme
                  ? 'border-lime-200/90 bg-gradient-to-br from-lime-50/80 via-emerald-50/50 to-teal-50/60'
                  : isTurtleTheme
                  ? 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-emerald-50/80'
                  : isDinoTheme
                    ? 'border-green-200/90 bg-gradient-to-br from-green-50/80 via-emerald-50/50 to-amber-50/60'
                    : 'border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-amber-50/80'
              } p-4 shadow-2xs`} role="region" aria-label="Energy budget summary">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${
                      isFrogTheme ? 'text-lime-900' : isTurtleTheme ? 'text-emerald-900' : isDinoTheme ? 'text-green-900' : 'text-amber-900'
                    } block`}>{t('Energy Remaining')}</span>
                    <span className={`text-xs font-black ${
                      isFrogTheme ? 'text-lime-950' : isTurtleTheme ? 'text-emerald-950' : isDinoTheme ? 'text-green-950' : 'text-amber-950'
                    } flex items-center gap-1.5 mt-0.5`}>
                      <span className={`w-2 h-2 rounded-full ${pct > 60 ? 'bg-emerald-500 animate-pulse' : pct > 30 ? 'bg-amber-500' : remaining > 0 ? 'bg-rose-500' : 'bg-rose-700'}`} />
                      {pct > 60 ? t('High Energy') : pct > 30 ? t('Moderate Energy') : remaining > 0 ? t('Low Energy') : t('Empty / Rest Needed')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-2xl ${getBatteryColor(remaining, current.totalSpoons)}`}>
                      {remaining} <span className={`text-base ${
                        isFrogTheme ? 'text-lime-900/60' : isTurtleTheme ? 'text-emerald-900/60' : isDinoTheme ? 'text-green-900/60' : 'text-amber-900/60'
                      } font-bold`}>/ {current.totalSpoons}</span>
                    </span>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                      isFrogTheme ? 'text-lime-900/70' : isTurtleTheme ? 'text-emerald-900/70' : isDinoTheme ? 'text-green-900/70' : 'text-amber-900/70'
                    }`}>
                      {remaining} {t('Spoons Remaining')}
                    </p>
                  </div>
                </div>
                <div className={`h-3.5 ${
                  isFrogTheme
                    ? 'bg-lime-100/90 border-lime-200/60'
                    : isTurtleTheme
                    ? 'bg-emerald-100/90 border-emerald-200/60'
                    : isDinoTheme
                      ? 'bg-green-100/90 border-green-200/60'
                      : 'bg-amber-100/90 border-amber-200/60'
                } rounded-full p-0.5 border overflow-hidden`} role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={current.totalSpoons} aria-label={`${remaining} spoons out of ${current.totalSpoons} remaining`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {remaining === 0 && (
                  <p className="mt-2 text-xs font-bold text-rose-600 text-center">
                    {t("You've used all your spoons. Time to rest!")}
                  </p>
                )}
              </div>

              {/* Quick-add presets */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2.5">{t('Add an Activity')}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TASK_PRESETS.map((task) => (
                    <button
                      key={task.label}
                      type="button"
                      aria-label={`Add activity: ${task.label}, cost ${task.cost} spoon${task.cost > 1 ? 's' : ''}`}
                      onClick={() => handleAddTask(task)}
                      disabled={remaining === 0}
                      className="flex items-center gap-3 p-2.5 sm:p-3 min-h-[54px] rounded-2xl bg-white border-2 border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/40 text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-2xs group focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#FFF2D4] border border-[#FED676] flex items-center justify-center p-1.5 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={task.stickerSrc}
                          alt={task.label}
                          className="w-8 h-8 object-contain drop-shadow-2xs select-none pointer-events-none"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-black text-slate-800 leading-tight truncate">{t(task.label)}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="font-black px-1.5 py-0.2 rounded-md bg-amber-100/90 text-amber-950 border border-amber-200/80">
                            {task.cost}
                          </span>
                          <span>{task.cost === 1 ? t('spoon') : t('spoons')}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              {current.activityLog.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2">{t("Today's Log")}</p>
                  <div className="space-y-2">
                    {current.activityLog.map((item, idx) => {
                      const matchedPreset = TASK_PRESETS.find((p) => p.label === item.label);
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-white border-2 border-amber-200/70 shadow-2xs">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF2D4] border border-[#FED676] flex items-center justify-center p-1 shrink-0">
                            {matchedPreset ? (
                              <img
                                src={matchedPreset.stickerSrc}
                                alt={item.label}
                                className="w-7 h-7 object-contain drop-shadow-2xs select-none pointer-events-none"
                              />
                            ) : (
                              <Activity className="w-4 h-4 text-amber-800" aria-hidden="true" />
                            )}
                          </div>
                          <span className="flex-1 text-xs sm:text-sm font-black text-slate-800 truncate">{t(item.label)}</span>
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300" aria-label={`Cost: ${item.cost} spoons`}>
                            {item.cost} {item.cost === 1 ? t('spoon') : t('spoons')}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove activity ${item.label}`}
                            onClick={() => handleRemoveTask(idx)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer ml-1 active:scale-95"
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
                onClick={() => { 
                  playChime('tap');
                  setPhase('checkin'); 
                }}
                className="w-full min-h-[48px] py-3 rounded-2xl border-2 border-amber-200/90 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-sm cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                <RotateCcw className="w-4 h-4 text-amber-800" aria-hidden="true" />
                <span>{t('Reset & Start a New Check-in')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
