import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { playChime } from '../utils/audio';

const PRESETS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '30 min', seconds: 1800 },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const PieTimerModal: React.FC = () => {
  const { showPieTimerModal, setShowPieTimerModal, speak, announce } = useApp();

  const [totalSeconds, setTotalSeconds] = useState(300);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pct = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  // SVG pie
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const circumference = 2 * Math.PI * r;
  // Stroke dash for progress (count-down)
  const dash = pct * circumference;
  const gap = circumference - dash;

  const startTimer = useCallback(() => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);
    setIsFinished(false);
  }, [secondsLeft]);

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = (newTotal?: number) => {
    setIsRunning(false);
    setIsFinished(false);
    const t = newTotal ?? totalSeconds;
    setTotalSeconds(t);
    setSecondsLeft(t);
  };

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setIsFinished(true);
          playChime('complete');
          announce('Time is up!');
          return 0;
        }
        // Pulse warnings
        if (prev === 61 || prev === 11) playChime('breathe');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  // Pie color: green → amber → red as time runs out
  const getColor = () => {
    if (pct > 0.5) return '#22c55e'; // green
    if (pct > 0.2) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Arc path for filled pie
  const angle = (1 - pct) * 2 * Math.PI;
  const x1 = cx + r * Math.sin(0);
  const y1 = cy - r * Math.cos(0);
  const x2 = cx + r * Math.sin(angle);
  const y2 = cy - r * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;

  if (!showPieTimerModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Time Timer</p>
          <h2 className="text-xl font-black text-slate-800">Pie Clock ⏰</h2>
        </div>
        <button
          onClick={() => { setShowPieTimerModal(false); setIsRunning(false); }}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col items-center gap-6 max-w-md mx-auto w-full">
        {/* Pie SVG */}
        <div className={`relative ${isFinished ? 'animate-bounce' : ''}`}>
          <svg width={size} height={size}>
            {/* Background circle */}
            <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" />
            {/* Pie fill — remaining time */}
            {pct > 0 && pct < 1 && (
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={getColor()}
                style={{ transition: 'all 1s linear' }}
              />
            )}
            {pct >= 1 && <circle cx={cx} cy={cy} r={r} fill={getColor()} />}
            {/* Center text */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fontSize={isFinished ? 36 : 32}
              fontWeight="900"
              fill={isFinished ? '#ef4444' : '#1e293b'}
            >
              {isFinished ? '🎉' : formatTime(secondsLeft)}
            </text>
            {isFinished && (
              <text x={cx} y={cy + 24} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#ef4444">
                Done!
              </text>
            )}
            {/* Rim */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={4} />
          </svg>
          {/* Pulse ring for warnings */}
          {secondsLeft <= 60 && isRunning && (
            <div
              className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30"
              style={{ borderRadius: '50%' }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => resetTimer(totalSeconds)}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all"
          >
            <RotateCcw className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={secondsLeft === 0 && !isFinished}
            className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: getColor() }}
          >
            {isRunning
              ? <Pause className="w-8 h-8 text-white" />
              : <Play className="w-8 h-8 text-white" />}
          </button>
          {isFinished && (
            <button
              onClick={() => resetTimer()}
              className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center cursor-pointer transition-all"
            >
              <RotateCcw className="w-5 h-5 text-green-700" />
            </button>
          )}
        </div>

        {/* Manual adjust */}
        {!isRunning && !isFinished && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => { const n = Math.max(60, totalSeconds - 60); resetTimer(n); }}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-black text-slate-700 text-lg min-w-[80px] text-center">{formatTime(totalSeconds)}</span>
            <button
              onClick={() => { const n = Math.min(3600, totalSeconds + 60); resetTimer(n); }}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}

        {/* Quick presets */}
        {!isRunning && (
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => resetTimer(p.seconds)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 cursor-pointer transition-all ${
                  totalSeconds === p.seconds && !isFinished
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Color key */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Plenty of time</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Getting close</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Almost done</span>
        </div>
      </div>
    </div>
  );
};
