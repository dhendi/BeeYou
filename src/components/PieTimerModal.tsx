import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX, Star, Clock } from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { TurtleSandTimerSticker } from './icons/JournalStickers';

const PRESETS = [
  { minutes: 1, seconds: 60 },
  { minutes: 2, seconds: 120 },
  { minutes: 3, seconds: 180 },
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
  const { showPieTimerModal, setShowPieTimerModal, announce, activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';

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
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Proportion of remaining time (0.0 to 1.0)
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;

  // Clock dial geometry (320 x 320 viewBox)
  const size = 320;
  const cx = size / 2; // 160
  const cy = size / 2; // 160
  const rBezel = 150;
  const rFace = 138;
  const rTicksOut = 134;
  const rTicksMajor = 120;
  const rTicksMinor = 126;
  const rNum = 108;
  const rWedge = 94;
  const rHub = 52;

  // Remaining time wedge math:
  // Elapsed angle sweeps clockwise from 12 o'clock (0 rad) to 2*PI rad
  // The needle sits at elapsedAngle and rotates CLOCKWISE as time counts down
  const elapsedAngle = (1 - pct) * 2 * Math.PI;
  const xStart = cx + rWedge * Math.sin(elapsedAngle);
  const yStart = cy - rWedge * Math.cos(elapsedAngle);
  const largeArc = pct > 0.5 ? 1 : 0;

  // Indicator hand tip coordinates (moving CLOCKWISE)
  const needleX = cx + (rWedge + 3) * Math.sin(elapsedAngle);
  const needleY = cy - (rWedge + 3) * Math.cos(elapsedAngle);
  const needleBaseX = cx + (rHub - 2) * Math.sin(elapsedAngle);
  const needleBaseY = cy - (rHub - 2) * Math.cos(elapsedAngle);

  // Status colors based on remaining percentage
  const getColor = useCallback(() => {
    if (isFinished) return isDinoTheme ? '#16a34a' : '#10b981'; // Green celebrate
    if (pct > 0.5) return isDinoTheme ? '#15803d' : '#059669'; // Emerald / Jurassic Green
    if (pct > 0.2) return isDinoTheme ? '#d97706' : isTurtleTheme ? '#0d9488' : '#f59e0b'; // Amber / Teal
    return '#ef4444'; // Red
  }, [isFinished, pct, isTurtleTheme, isDinoTheme]);

  const getGradientId = useCallback(() => {
    if (isFinished) return isDinoTheme ? 'url(#pie-grad-dino-green)' : 'url(#pie-grad-green)';
    if (pct > 0.5) return isDinoTheme ? 'url(#pie-grad-dino-green)' : 'url(#pie-grad-green)';
    if (pct > 0.2) return isDinoTheme ? 'url(#pie-grad-amber)' : isTurtleTheme ? 'url(#pie-grad-green)' : 'url(#pie-grad-amber)';
    return 'url(#pie-grad-red)';
  }, [isFinished, pct, isTurtleTheme, isDinoTheme]);

  const getPhaseKey = useCallback(() => {
    if (pct > 0.5) return 'plenty';
    if (pct > 0.2) return 'close';
    return 'done';
  }, [pct]);

  const startTimer = useCallback(() => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);
    setIsFinished(false);
    announce(`${t('Timer started')}. ${formatTime(secondsLeft)} ${t('remaining')}.`);
  }, [secondsLeft, announce]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    announce(t('Timer paused.'));
  }, [announce]);

  const resetTimer = useCallback((newTotal?: number) => {
    setIsRunning(false);
    setIsFinished(false);
    const tVal = newTotal ?? totalSeconds;
    setTotalSeconds(tVal);
    setSecondsLeft(tVal);
  }, [totalSeconds]);

  // Adjust time by delta minutes (+1m, -1m, +5m)
  const adjustMinutes = useCallback((deltaMinutes: number) => {
    if (isRunning) {
      setSecondsLeft((prev) => {
        const next = Math.max(10, Math.min(3600, prev + deltaMinutes * 60));
        if (next > totalSeconds) setTotalSeconds(next);
        return next;
      });
    } else {
      const nextTotal = Math.max(60, Math.min(3600, totalSeconds + deltaMinutes * 60));
      resetTimer(nextTotal);
    }
  }, [isRunning, totalSeconds, resetTimer]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setIsFinished(true);
          if (chimeEnabled) playChime('complete');
          announce(t('Time is up! Great job.'));
          return 0;
        }
        // Pulse warnings at 1 minute and 10 seconds
        if ((prev === 61 || prev === 11) && chimeEnabled) {
          playChime('breathe');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, chimeEnabled, announce]);

  // 60 tick marks around the perimeter
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const tickAngle = (i * 6 * Math.PI) / 180;
    const sinA = Math.sin(tickAngle);
    const cosA = Math.cos(tickAngle);
    const isMajor = i % 5 === 0;
    const isQuad = i % 15 === 0;
    const rIn = isQuad ? rTicksMajor - 3 : isMajor ? rTicksMajor : rTicksMinor;
    return {
      x1: cx + rIn * sinA,
      y1: cy - rIn * cosA,
      x2: cx + rTicksOut * sinA,
      y2: cy - rTicksOut * cosA,
      strokeWidth: isQuad ? 3 : isMajor ? 2 : 1,
      strokeColor: isQuad ? '#1e293b' : isMajor ? '#64748b' : '#cbd5e1',
      key: i,
    };
  });

  // 4 quadrant clock numbers (12, 3, 6, 9)
  const quadrantNumbers = [
    { val: '12', deg: 0 },
    { val: '3', deg: 90 },
    { val: '6', deg: 180 },
    { val: '9', deg: 270 },
  ].map((item) => {
    const numAngle = (item.deg * Math.PI) / 180;
    return {
      ...item,
      x: cx + rNum * Math.sin(numAngle),
      y: cy - rNum * Math.cos(numAngle) + 4.5,
    };
  });

  if (!showPieTimerModal) return null;

  const currentPhase = getPhaseKey();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pie-timer-title"
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        setShowPieTimerModal(false);
        setIsRunning(false);
      }}
    >
      {/* Main Clock Card */}
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${
              isTurtleTheme
                ? 'bg-emerald-50 border-emerald-300'
                : isDinoTheme
                  ? 'bg-green-100 border-green-400'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
            } border flex items-center justify-center p-1 shadow-xs`}>
              {isTurtleTheme ? (
                <TurtleSandTimerSticker className="w-full h-full object-contain" />
              ) : isDinoTheme ? (
                <span className="text-xl select-none leading-none">🦖</span>
              ) : (
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isTurtleTheme
                  ? t('Wise Turtle Sanctuary Timer')
                  : isDinoTheme
                    ? t('Dino Kingdom Jurassic Timer')
                    : t('Visual Time Timer')}
              </p>
              <h2 id="pie-timer-title" className="text-lg font-black text-slate-800 dark:text-slate-100">
                {t('Pie Clock')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPieTimerModal(false);
              setIsRunning(false);
            }}
            aria-label={t('Close Pie Clock')}
            className={`w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-all active:scale-95 focus-visible:ring-4 ${
              isTurtleTheme
                ? 'focus-visible:ring-emerald-500/70'
                : isDinoTheme
                  ? 'focus-visible:ring-green-500/70'
                  : 'focus-visible:ring-amber-500/70'
            } focus-visible:outline-none`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Clock Dial & Controls Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col items-center gap-6">
            {/* Visual Clock SVG */}
            <div className={`relative flex items-center justify-center ${isFinished ? 'animate-bounce' : ''}`}>
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label={`${t('Pie Clock')}: ${isFinished ? t('Done!') : formatTime(secondsLeft)}`}
                className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-lg select-none"
              >
                <defs>
                  {/* Center Hub Drop Shadow */}
                  <filter id="hub-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.12" floodColor="#0f172a" />
                  </filter>

                  {/* Wedge Glow / Soft Shadow */}
                  <filter id="wedge-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" floodColor="#000000" />
                  </filter>

                  {/* Emerald Gradient (> 50%) */}
                  <linearGradient id="pie-grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  {/* Dino Green Gradient */}
                  <linearGradient id="pie-grad-dino-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>

                  {/* Honey Amber Gradient (20% - 50%) */}
                  <linearGradient id="pie-grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Sunset Rose Gradient (< 20%) */}
                  <linearGradient id="pie-grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>

                  {/* Outer Bezel Gradient */}
                  <radialGradient id="bezel-metallic" cx="45%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="65%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </radialGradient>

                  {/* Dial Face Gradient */}
                  <radialGradient id="face-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f8fafc" />
                  </radialGradient>
                </defs>

                {/* Outer Bezel (Tactile casing ring) */}
                <circle cx={cx} cy={cy} r={rBezel} fill="url(#bezel-metallic)" stroke="#cbd5e1" strokeWidth={3} />
                <circle cx={cx} cy={cy} r={rBezel - 8} fill="none" stroke="#e2e8f0" strokeWidth={1.5} />

                {/* Clock Dial Face */}
                <circle cx={cx} cy={cy} r={rFace} fill="url(#face-grad)" stroke="#f1f5f9" strokeWidth={2} />

                {/* Unfilled Time Track (Soft recessed ring) */}
                <circle cx={cx} cy={cy} r={rWedge} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />

                {/* 60 Tick Marks */}
                {ticks.map((t) => (
                  <line
                    key={t.key}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.strokeColor}
                    strokeWidth={t.strokeWidth}
                    strokeLinecap="round"
                  />
                ))}

                {/* 4 Quadrant Numbers (12, 3, 6, 9) */}
                {quadrantNumbers.map((q) => (
                  <text
                    key={q.val}
                    x={q.x}
                    y={q.y}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"
                    fill="#334155"
                  >
                    {q.val}
                  </text>
                ))}

                {/* Countdown Pie Slice (Remaining Time) */}
                {pct >= 0.999 && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={rWedge}
                    fill={getGradientId()}
                    filter="url(#wedge-shadow)"
                  />
                )}
                {pct > 0.001 && pct < 0.999 && (
                  <path
                    d={`M ${cx} ${cy} L ${xStart} ${yStart} A ${rWedge} ${rWedge} 0 ${largeArc} 1 ${cx} ${cy - rWedge} Z`}
                    fill={getGradientId()}
                    filter="url(#wedge-shadow)"
                    style={{ transition: 'all 0.8s ease-out' }}
                  />
                )}

                {/* Indicator Needle / Pointer at Leading Edge (moving CLOCKWISE) */}
                {pct > 0.002 && (
                  <g>
                    <line
                      x1={needleBaseX}
                      y1={needleBaseY}
                      x2={needleX}
                      y2={needleY}
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={needleX}
                      cy={needleY}
                      r={4.5}
                      fill={getColor()}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="shadow-sm"
                    />
                  </g>
                )}

                {/* Center Hub (Floating Digital Readout Pod) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rHub}
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth={2.5}
                  filter="url(#hub-shadow)"
                />
                <circle cx={cx} cy={cy} r={rHub - 4} fill="none" stroke="#f8fafc" strokeWidth={1.5} />

                {/* Digital Time Text */}
                <text
                  x={cx}
                  y={cy - 5}
                  textAnchor="middle"
                  fontSize={isFinished ? 24 : 22}
                  fontWeight="900"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                  fill={isFinished ? '#10b981' : '#1e293b'}
                  letterSpacing="-0.5"
                >
                  {isFinished ? t('DONE!') : formatTime(secondsLeft)}
                </text>

                {/* Status Sub-Label */}
                <text
                  x={cx}
                  y={cy + 17}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fill={getColor()}
                  letterSpacing="0.8"
                >
                  {isFinished
                    ? t('Done!')
                    : isRunning
                    ? `${Math.round(pct * 100)}% ${t('left')}`
                    : secondsLeft === totalSeconds
                    ? t('READY')
                    : t('PAUSED')}
                </text>

                {/* Center Metallic Pivot Pin */}
                <circle cx={cx} cy={cy} r={4.5} fill="#94a3b8" stroke="#64748b" strokeWidth={1} />
                <circle cx={cx - 1.2} cy={cy - 1.2} r={1.5} fill="#ffffff" opacity="0.8" />
              </svg>

              {/* Pulsing warning halo when timer is running low (< 60s) */}
              {secondsLeft <= 60 && isRunning && (
                <div
                  className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-25 pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Primary Action Controls: Reset, Big Hero Play/Pause, Sound Toggle */}
            <div className="flex items-center justify-center gap-5 sm:gap-6 mt-1">
              {/* Reset Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => resetTimer(totalSeconds)}
                  aria-label={t('Reset Timer')}
                  title={t('Reset Timer')}
                  className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 shadow-sm flex items-center justify-center cursor-pointer transition-all active:translate-y-0.5 active:scale-95 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                >
                  <RotateCcw className="w-6 h-6" aria-hidden="true" />
                </button>
                <span className="text-[11px] font-bold text-slate-500">{t('Reset')}</span>
              </div>

              {/* Hero Play / Pause Button (Chunky, tactile 80px) */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={isRunning ? pauseTimer : startTimer}
                  disabled={secondsLeft === 0 && !isFinished}
                  aria-label={isRunning ? t('Pause Timer') : t('Start Timer')}
                  className="w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center cursor-pointer transition-all active:translate-y-1 active:shadow-md disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                  style={{
                    background: isRunning
                      ? pct > 0.5
                        ? isDinoTheme
                          ? 'linear-gradient(135deg, #22c55e, #15803d)'
                          : 'linear-gradient(135deg, #10b981, #059669)'
                        : pct > 0.2
                        ? isDinoTheme
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : isDinoTheme
                        ? 'linear-gradient(135deg, #16a34a, #15803d)'
                        : 'linear-gradient(135deg, #0d9488, #0f766e)',
                    boxShadow: `0 10px 25px -4px ${getColor()}66`,
                  }}
                >
                  {isRunning ? (
                    <Pause className="w-9 h-9 text-white fill-white" aria-hidden="true" />
                  ) : (
                    <Play className="w-9 h-9 text-white fill-white ml-1" aria-hidden="true" />
                  )}
                </button>
                <span className="text-xs font-black text-slate-700">
                  {isRunning ? t('Pause') : t('Start')}
                </span>
              </div>

              {/* Sound Chime Toggle */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setChimeEnabled(!chimeEnabled)}
                  aria-label={chimeEnabled ? t('Mute chime') : t('Enable chime')}
                  title={chimeEnabled ? t('Chime Sound: ON') : t('Chime Sound: MUTED')}
                  className={`w-14 h-14 rounded-2xl border-2 shadow-sm flex items-center justify-center cursor-pointer transition-all active:translate-y-0.5 active:scale-95 focus-visible:ring-4 ${
                    isDinoTheme ? 'focus-visible:ring-green-500/70' : 'focus-visible:ring-amber-500/70'
                  } focus-visible:outline-none ${
                    chimeEnabled
                      ? isDinoTheme
                        ? 'bg-green-50 hover:bg-green-100 border-green-300 text-green-700'
                        : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400'
                  }`}
                >
                  {chimeEnabled ? (
                    <Volume2 className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-6 h-6" aria-hidden="true" />
                  )}
                </button>
                <span className="text-[11px] font-bold text-slate-500">
                  {chimeEnabled ? t('Chime') : t('Mute')}
                </span>
              </div>
            </div>

            {/* Quick Adjust Stepper Pill */}
            <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-2xl p-1.5 w-full max-w-sm justify-between shadow-xs">
              <button
                type="button"
                onClick={() => adjustMinutes(-1)}
                aria-label={t('Decrease time by 1 minute')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>1m</span>
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {isRunning ? t('Remaining') : t('Total Time')}
                </span>
                <span className="font-black text-slate-800 text-sm font-mono" aria-live="polite">
                  {formatTime(isRunning ? secondsLeft : totalSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustMinutes(1)}
                  aria-label={t('Increase time by 1 minute')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>1m</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustMinutes(5)}
                  aria-label={t('Increase time by 5 minutes')}
                  className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>5m</span>
                </button>
              </div>
            </div>

            {/* Quick Presets Grid */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
                {t('Preset Timers')}
              </p>
              <div className="grid grid-cols-4 gap-2 w-full" role="group" aria-label={t('Preset Timers')}>
                {PRESETS.map((p) => {
                  const isSelected = totalSeconds === p.seconds && !isFinished;
                  return (
                    <button
                      type="button"
                      key={p.seconds}
                      onClick={() => resetTimer(p.seconds)}
                      aria-pressed={isSelected}
                      aria-label={`${p.minutes} ${t('min')}`}
                      className={`min-h-[46px] rounded-2xl text-sm font-black border-2 cursor-pointer transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Star className="w-3 h-3 text-amber-400 shrink-0" aria-hidden="true" />}
                      <span>{p.minutes}m</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Sensory Status Card */}
            <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-around text-xs font-bold gap-1 flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                  currentPhase === 'plenty'
                    ? 'bg-emerald-100/90 text-emerald-900 ring-2 ring-emerald-500/40 font-black shadow-xs'
                    : 'text-slate-500 opacity-70'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
                <span>{t('Plenty of time')}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                  currentPhase === 'close'
                    ? 'bg-amber-100/90 text-amber-900 ring-2 ring-amber-500/40 font-black shadow-xs'
                    : 'text-slate-500 opacity-70'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
                <span>{t('Getting close')}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                  currentPhase === 'done'
                    ? 'bg-rose-100/90 text-rose-900 ring-2 ring-rose-500/40 font-black shadow-xs'
                    : 'text-slate-500 opacity-70'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shrink-0 shadow-xs" aria-hidden="true" />
                <span>{t('Almost done')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
