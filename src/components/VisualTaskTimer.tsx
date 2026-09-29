import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Minus,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, speakText } from '../utils/audio';

export interface TaskTimerPreset {
  id: string;
  title: string;
  emoji: string;
  durationSeconds: number;
  color: string;
  calmMessage: string;
}

export const DEFAULT_TASK_PRESETS: TaskTimerPreset[] = [
  {
    id: 'teeth',
    title: 'Brush Teeth',
    emoji: '🪥',
    durationSeconds: 120, // 2 minutes
    color: '#0284c7', // Sky 600
    calmMessage: 'Gentle circles on top, bottom, and tongue. Take your time!',
  },
  {
    id: 'quiet',
    title: 'Quiet Time',
    emoji: '🧘',
    durationSeconds: 300, // 5 minutes
    color: '#8b5cf6', // Purple 500
    calmMessage: 'Cozy, peaceful resting time. Breathe softly and relax.',
  },
  {
    id: 'cleanup',
    title: 'Clean Up Toys',
    emoji: '🧸',
    durationSeconds: 180, // 3 minutes
    color: '#10b981', // Emerald 500
    calmMessage: 'One toy into the bin at a time. Slow and steady!',
  },
  {
    id: 'dressed',
    title: 'Get Dressed',
    emoji: '👕',
    durationSeconds: 240, // 4 minutes
    color: '#f59e0b', // Amber 500
    calmMessage: 'Shirt, pants, and socks. You can do this at your own pace.',
  },
  {
    id: 'hands',
    title: 'Wash Hands',
    emoji: '🧼',
    durationSeconds: 40, // 40 seconds
    color: '#06b6d4', // Cyan 500
    calmMessage: 'Warm water, bubbly soap, front and back of hands.',
  },
  {
    id: 'reading',
    title: 'Reading / Story',
    emoji: '📖',
    durationSeconds: 600, // 10 minutes
    color: '#ec4899', // Pink 500
    calmMessage: 'Enjoy pictures, stories, and cozy imagination.',
  },
];

interface VisualTaskTimerProps {
  initialTask?: {
    title: string;
    emoji?: string;
    durationSeconds?: number;
    stepId?: string;
    autoStart?: boolean;
  };
  onCompleteStep?: (stepId?: string) => void;
  onClose?: () => void;
}

export const VisualTaskTimer: React.FC<VisualTaskTimerProps> = ({
  initialTask,
  onCompleteStep,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<TaskTimerPreset>(() => {
    if (initialTask) {
      const match = DEFAULT_TASK_PRESETS.find(
        (p) => p.title.toLowerCase() === initialTask.title.toLowerCase()
      );
      if (match) {
        return {
          ...match,
          durationSeconds: initialTask.durationSeconds || match.durationSeconds,
        };
      }
      return {
        id: 'custom',
        title: initialTask.title,
        emoji: initialTask.emoji || '⏳',
        durationSeconds: initialTask.durationSeconds || 120,
        color: '#6366f1',
        calmMessage: 'Take all the time you need. Slow and steady.',
      };
    }
    return DEFAULT_TASK_PRESETS[0];
  });

  const [totalSeconds, setTotalSeconds] = useState<number>(
    selectedPreset.durationSeconds
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    selectedPreset.durationSeconds
  );
  const [isRunning, setIsRunning] = useState<boolean>(Boolean(initialTask?.autoStart));
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Keep ref for tick interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When initialTask changes from outside, adopt it
  useEffect(() => {
    if (initialTask) {
      const match = DEFAULT_TASK_PRESETS.find(
        (p) => p.title.toLowerCase().includes(initialTask.title.toLowerCase())
      );
      const newDuration = initialTask.durationSeconds || (match ? match.durationSeconds : 120);
      const newPreset: TaskTimerPreset = match
        ? { ...match, durationSeconds: newDuration }
        : {
            id: 'custom',
            title: initialTask.title,
            emoji: initialTask.emoji || '⏳',
            durationSeconds: newDuration,
            color: '#6366f1',
            calmMessage: 'Take all the time you need. Gentle pace.',
          };
      setSelectedPreset(newPreset);
      setTotalSeconds(newDuration);
      setRemainingSeconds(newDuration);
      setIsRunning(Boolean(initialTask.autoStart));
      setIsCompleted(false);
      setIsExpanded(true);
    }
  }, [initialTask]);

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);

    if (soundEnabled) {
      playChime('complete');
      setTimeout(() => {
        playChime('star');
      }, 350);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24'],
      });
    } catch (e) {
      // Confetti fallback
    }

    if (soundEnabled) {
      speakText(`All done with ${selectedPreset.title}! Wonderful work!`);
    }

    if (onCompleteStep && initialTask?.stepId) {
      onCompleteStep(initialTask.stepId);
    }
  };

  const handleSelectPreset = (preset: TaskTimerPreset) => {
    setSelectedPreset(preset);
    setTotalSeconds(preset.durationSeconds);
    setRemainingSeconds(preset.durationSeconds);
    setIsRunning(false);
    setIsCompleted(false);
    playChime('tap');
  };

  const handleTogglePlay = () => {
    playChime('tap');
    if (isCompleted) {
      // Restart
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playChime('tap');
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    playChime('tap');
    setTotalSeconds((prev) => {
      const nextTotal = Math.max(30, Math.min(3600, prev + deltaSeconds));
      setRemainingSeconds((prevRem) => {
        const nextRem = Math.max(0, Math.min(nextTotal, prevRem + deltaSeconds));
        return nextRem;
      });
      return nextTotal;
    });
    setIsCompleted(false);
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Progress fraction (0 to 1, where 1 is full time left, 0 is done)
  // For classic visual countdown disk, we show the remaining portion smoothly disappearing.
  const progressRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/40 rounded-3xl border-3 border-sky-200 p-4 sm:p-5 shadow-sm transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-lg shadow-xs">
            {selectedPreset.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                Visual Countdown
              </span>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                Non-pressuring • At your pace
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
              {selectedPreset.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mute/Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playChime('tap');
            }}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
            title={soundEnabled ? 'Chime sound enabled' : 'Quiet silent mode'}
            aria-label={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
            title={isExpanded ? 'Collapse timer' : 'Expand timer'}
            aria-label={isExpanded ? 'Collapse timer' : 'Expand timer'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsed Mini Status View */}
      {!isExpanded && (
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-sky-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedPreset.emoji}</span>
            <div>
              <span className="font-black text-xs text-slate-800 block">
                {selectedPreset.title}
              </span>
              <span className="text-xs font-bold text-sky-600 font-mono">
                {formatTime(remainingSeconds)} remaining
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePlay}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer ${
                isRunning
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-sky-500 text-white hover:bg-sky-600'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Expanded Main Timer View */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Quick Task Presets Shelf */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Choose an Activity:
              </span>
              <span className="text-[11px] text-slate-400">Tap to switch</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {DEFAULT_TASK_PRESETS.map((preset) => {
                const isCurrent = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-2xl border-2 text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-0.5 block">{preset.emoji}</span>
                    <span className="font-bold text-[11px] leading-tight truncate w-full block">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {Math.round(preset.durationSeconds / 60)}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Disk and Countdown Display */}
          <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-around gap-6 shadow-xs">
            {/* Smooth SVG Visual Arc / Disk */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Visual Passage Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={isCompleted ? '#10b981' : selectedPreset.color}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-linear"
                />
              </svg>

              {/* Center Content Inside Disk */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                {isCompleted ? (
                  <div className="animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <span className="text-xs font-black text-emerald-700 mt-1 block">
                      All Done!
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tracking-tight">
                      {formatTime(remainingSeconds)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {isRunning ? 'Relaxing...' : remainingSeconds === totalSeconds ? 'Ready' : 'Paused'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Controls & Pacing Aids */}
            <div className="flex-1 max-w-sm flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              {/* Gentle Calming Advice Banner */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-start gap-2.5 w-full">
                <Heart className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-900 font-medium leading-relaxed">
                  {selectedPreset.calmMessage}
                </p>
              </div>

              {/* Main Play / Pause / Reset Actions */}
              <div className="flex items-center gap-2 w-full justify-center md:justify-start">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`px-6 py-3 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isRunning
                      ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 ring-2 ring-amber-300'
                      : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      <span>Start Again</span>
                    </>
                  ) : isRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Take a Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Gentle Timer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                  title="Reset to beginning"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Non-pressuring +1m / -1m adjusters */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500">Need more or less time?</span>
                <button
                  type="button"
                  onClick={() => handleAdjustTime(60)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                  title="Add 1 calm minute"
                >
                  <Plus className="w-3 h-3" />
                  <span>1 min</span>
                </button>
                {totalSeconds > 60 && (
                  <button
                    type="button"
                    onClick={() => handleAdjustTime(-60)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 cursor-pointer transition-all"
                    title="Subtract 1 minute"
                  >
                    <Minus className="w-3 h-3" />
                    <span>1 min</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
