import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Timer, 
  CheckCircle2, 
  Circle, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Plus, 
  Clock, 
  Star,
  Settings,
  HelpCircle,
  Eye,
  Check
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';
import { useApp } from '../context/AppContext';

export interface InteractiveMyDayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenParentRoutines?: () => void;
}

export const InteractiveMyDayGuideModal: React.FC<InteractiveMyDayGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenParentRoutines,
}) => {
  const { isParentMode, setIsParentMode } = useApp();
  const [activeTab, setActiveTab] = useState<'routines' | 'timers' | 'first_then' | 'caregiver_builder'>('routines');

  // Interactive Demo 1: Routine steps checklist
  const [demoSteps, setDemoSteps] = useState([
    { id: '1', title: 'Wake up & stretch', emoji: '☀️', done: false, duration: 2 },
    { id: '2', title: 'Brush teeth', emoji: '🪥', done: false, duration: 2 },
    { id: '3', title: 'Eat breakfast', emoji: '🥞', done: false, duration: 15 },
  ]);

  // Interactive Demo 2: Timer
  const [demoTimerSeconds, setDemoTimerSeconds] = useState(60);
  const [demoTimerRunning, setDemoTimerRunning] = useState(false);

  // Interactive Demo 3: First-Then
  const [demoFirstDone, setDemoFirstDone] = useState(false);
  const [demoThenDone, setDemoThenDone] = useState(false);

  // Timer interval
  React.useEffect(() => {
    let interval: any = null;
    if (demoTimerRunning && demoTimerSeconds > 0) {
      interval = setInterval(() => {
        setDemoTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (demoTimerSeconds === 0 && demoTimerRunning) {
      setDemoTimerRunning(false);
      playChime('complete');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [demoTimerRunning, demoTimerSeconds]);

  if (!isOpen) return null;

  const handleToggleDemoStep = (id: string) => {
    playChime('tap');
    setDemoSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const handleResetDemoSteps = () => {
    playChime('clear');
    setDemoSteps((prev) => prev.map((s) => ({ ...s, done: false })));
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="myday-guide-title"
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800 dark:text-slate-100"
    >
      <div className="bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] h-full sm:h-auto flex flex-col shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <BeeMascot size="sm" pose="reading" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Interactive Guide
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  My Day & Visual Schedules
                </span>
              </div>
              <h2 id="myday-guide-title" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                How My Day & Schedules Work
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'routines', label: '☀️ Following Routines', emoji: '📅' },
            { id: 'timers', label: '⏱️ Visual Timers', emoji: '⏳' },
            { id: 'first_then', label: '✨ First → Then', emoji: '🎯' },
            { id: 'caregiver_builder', label: '⚙️ Creating Routines', emoji: '📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playChime('tap');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-slate-850">
          
          {/* TAB 1: FOLLOWING ROUTINES */}
          {activeTab === 'routines' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  How to Follow Your Routine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow one step at a time and earn celebratory stickers!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">One at a Time Focus</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Highlights the current active task and shows what comes next to eliminate overwhelm.
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎉</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Completion Rewards</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Finishing all steps unlocks a collectible mascot sticker and celebratory confetti!
                  </p>
                </div>
              </div>

              {/* Interactive Steps Demo */}
              <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-slate-800 border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
                    Interactive Demo: Tap steps to check off
                  </span>
                  <button
                    onClick={handleResetDemoSteps}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {demoSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => handleToggleDemoStep(step.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        step.done
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 line-through opacity-85'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{step.emoji}</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {step.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {step.duration}m
                        </span>
                        {step.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-200 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {demoSteps.every((s) => s.done) && (
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-xs text-center animate-in zoom-in-95">
                    🎉 Awesome! You completed all steps in the routine!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL TIMERS */}
          {activeTab === 'timers' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  How Visual Timers Work
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual countdowns make time easy to understand without numbers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🥧</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Pie Clock Countdown</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    The colored disk shrinks clockwise as time passes, showing remaining time visually.
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔔</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Sensory-Safe Star Chimes</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Soft, peaceful chimes or silent visual flash. No harsh, startling alarm buzzers.
                  </p>
                </div>
              </div>

              {/* Interactive Timer Demo */}
              <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-slate-800 border-2 border-amber-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-400/20 flex items-center justify-center font-mono font-black text-sm text-amber-950 dark:text-amber-200">
                    {Math.floor(demoTimerSeconds / 60)}:{(demoTimerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      Sample Activity Timer (1 min)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tap Start to watch the countdown in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDemoTimerRunning(!demoTimerRunning);
                      playChime('tap');
                    }}
                    className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all ${
                      demoTimerRunning ? 'bg-rose-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {demoTimerRunning ? 'Pause' : 'Start Timer'}
                  </button>
                  <button
                    onClick={() => {
                      setDemoTimerRunning(false);
                      setDemoTimerSeconds(60);
                      playChime('clear');
                    }}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIRST -> THEN BOARDS */}
          {activeTab === 'first_then' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  First → Then Boards
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect a required task with an exciting reward to build motivation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                💡 <strong>How it works:</strong> Complete the <strong>FIRST</strong> task, and then enjoy the <strong>THEN</strong> reward!
              </div>

              {/* Interactive First/Then Card Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setDemoFirstDone(!demoFirstDone);
                    playChime('tap');
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-left cursor-pointer transition-all ${
                    demoFirstDone
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span className="text-2xl">🪥</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">First</span>
                      <span className="font-black text-xs">Brush teeth</span>
                    </div>
                  </div>
                  {demoFirstDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-200" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setDemoThenDone(!demoThenDone);
                    playChime('tap');
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-left cursor-pointer transition-all ${
                    demoThenDone
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">2</span>
                    <span className="text-2xl">📱</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Then</span>
                      <span className="font-black text-xs">Tablet time (15 min)</span>
                    </div>
                  </div>
                  {demoThenDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-200" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CAREGIVER BUILDER */}
          {activeTab === 'caregiver_builder' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Creating & Editing Routines
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Caregivers and teachers can customize schedules anytime in the dashboard.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Open Caregiver Dashboard</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Tap <strong>Caregiver</strong> in bottom navigation, enter PIN (default: <code>1234</code>), and click <strong>Routines</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Import from Templates Library</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Choose pre-built templates for Morning, School Day, Bedtime, or Doctor visits with 1 click.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Customize Steps & Timers</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Add emojis, set step durations in minutes, and configure First/Then visual rewards.
                    </p>
                  </div>
                </div>
              </div>

              {onOpenParentRoutines && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenParentRoutines();
                    playChime('tap');
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Routines Builder in Caregiver Hub</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            BeeYou Routines • Predictable, step-by-step visual support
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 ml-auto"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
