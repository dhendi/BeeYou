import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

const PRESETS = [
  { minutes: 2, seconds: 120 },
  { minutes: 5, seconds: 300 },
  { minutes: 10, seconds: 600 },
  { minutes: 15, seconds: 900 },
  { minutes: 20, seconds: 1200 },
  { minutes: 30, seconds: 1800 },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export const PieTimerModal: React.FC = () => {
  const { showPieTimerModal, setShowPieTimerModal, announce } = useApp();

  const [, setLangVersion] = useState(0);
  useEffect(() => {
    const handleLangChanged = () => setLangVersion((v) => v + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChanged);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChanged);
  }, []);

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
    const tVal = newTotal ?? totalSeconds;
    setTotalSeconds(tVal);
    setSecondsLeft(tVal);
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
          announce(t('Time is up!'));
          return 0;
        }
        // Pulse warnings
        if (prev === 61 || prev === 11) playChime('breathe');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, announce]);

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
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="pie-timer-title"
      className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {t('Visual Time Timer')}
          </p>
          <h2 id="pie-timer-title" className="text-xl font-black text-slate-800">
            {t('Pie Clock')} ⏰
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { setShowPieTimerModal(false); setIsRunning(false); }}
          aria-label={t('Close Pie Clock')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
        >
          <X className="w-5 h-5 text-slate-600" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col items-center gap-6 max-w-md mx-auto w-full">
        {/* Pie SVG */}
        <div className={`relative ${isFinished ? 'animate-bounce' : ''}`}>
          <svg width={size} height={size} role="img" aria-label={`${t('Pie Clock')}: ${isFinished ? t('Done!') : formatTime(secondsLeft)}`}>
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
                {t('Done!')}
              </text>
            )}
            {/* Rim */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={4} />
          </svg>
          {/* Pulse ring for warnings */}
          {secondsLeft <= 60 && isRunning && (
            <div
              className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30 pointer-events-none"
              style={{ borderRadius: '50%' }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => resetTimer(totalSeconds)}
            aria-label={t('Reset Timer')}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
          >
            <RotateCcw className="w-5 h-5 text-slate-600" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={secondsLeft === 0 && !isFinished}
            aria-label={isRunning ? t('Pause Timer') : t('Start Timer')}
            className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            style={{ backgroundColor: getColor() }}
          >
            {isRunning
              ? <Pause className="w-8 h-8 text-white" aria-hidden="true" />
              : <Play className="w-8 h-8 text-white" aria-hidden="true" />}
          </button>
          {isFinished && (
            <button
              type="button"
              onClick={() => resetTimer()}
              aria-label={t('Reset Timer')}
              className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              <RotateCcw className="w-5 h-5 text-green-700" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Manual adjust */}
        {!isRunning && !isFinished && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => { const n = Math.max(60, totalSeconds - 60); resetTimer(n); }}
              aria-label={t('Decrease time by 1 minute')}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              <Minus className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </button>
            <span className="font-black text-slate-700 text-lg min-w-[80px] text-center" aria-live="polite">
              {formatTime(totalSeconds)}
            </span>
            <button
              type="button"
              onClick={() => { const n = Math.min(3600, totalSeconds + 60); resetTimer(n); }}
              aria-label={t('Increase time by 1 minute')}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            >
              <Plus className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Quick presets */}
        {!isRunning && (
          <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label={t('Preset Timers')}>
            {PRESETS.map((p) => {
              const isSelected = totalSeconds === p.seconds && !isFinished;
              return (
                <button
                  type="button"
                  key={p.seconds}
                  onClick={() => resetTimer(p.seconds)}
                  aria-pressed={isSelected}
                  aria-label={`${p.minutes} ${t('min')}`}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-bold border-2 cursor-pointer transition-all min-h-[48px] focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {p.minutes} {t('min')}
                </button>
              );
            })}
          </div>
        )}

        {/* Color key */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
            <span>{t('Plenty of time')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
            <span>{t('Getting close')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
            <span>{t('Almost done')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
