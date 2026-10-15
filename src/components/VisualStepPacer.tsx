import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  ChevronRight, 
  Plus, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Wind,
  Clock,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { Routine, VisualScheduleStep } from '../types';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

export interface VisualStepPacerProps {
  routine: Routine;
  stepIndex: number;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  isWaitingForNext: boolean;
  onTogglePlayPause: () => void;
  onAdvanceStep: (markDone?: boolean) => void;
  onAddGraceTime: (seconds: number) => void;
  onStartWhenReady: () => void;
  onClose: () => void;
  onSelectStepIndex?: (index: number) => void;
}

export const VisualStepPacer: React.FC<VisualStepPacerProps> = ({
  routine,
  stepIndex,
  secondsLeft,
  totalSeconds,
  isRunning,
  isWaitingForNext,
  onTogglePlayPause,
  onAdvanceStep,
  onAddGraceTime,
  onStartWhenReady,
  onClose,
  onSelectStepIndex,
}) => {
  // Pacer mode: 'pie' (Time-Timer Visual Clock) | 'bubbles' (Calm Floating Bubbles Sandglass)
  const [pacerStyle, setPacerStyle] = useState<'pie' | 'bubbles'>('pie');

  // Fullscreen / Countertop Mode (for bathroom counter / bedside display)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sensory Breathing Break Mode
  const [isBreathingBreak, setIsBreathingBreak] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  // Transition alerts tracking
  const warned2MinRef = useRef(false);
  const warned30SecRef = useRef(false);

  // Reset alert flags when step changes
  useEffect(() => {
    warned2MinRef.current = false;
    warned30SecRef.current = false;
  }, [stepIndex, routine.id]);

  // Handle gentle sensory transition warnings
  useEffect(() => {
    if (!isRunning || isWaitingForNext) return;

    // 2-minute gentle transition warning
    if (secondsLeft === 120 && !warned2MinRef.current) {
      warned2MinRef.current = true;
      playChime('tap');
    }

    // 30-second gentle transition warning
    if (secondsLeft === 30 && !warned30SecRef.current) {
      warned30SecRef.current = true;
      playChime('star');
    }
  }, [secondsLeft, isRunning, isWaitingForNext]);

  // Breathing pacer loop
  useEffect(() => {
    if (!isBreathingBreak) return;

    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev <= 1) {
          setBreathPhase((currentPhase) => {
            if (currentPhase === 'inhale') {
              playChime('tap');
              return 'hold';
            }
            if (currentPhase === 'hold') {
              playChime('breathe');
              return 'exhale';
            }
            playChime('tap');
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingBreak]);

  const activeStep: VisualScheduleStep | undefined = routine.steps[stepIndex];
  const isStepDone = Boolean(activeStep?.completed);

  // Calculation for progress percentage (0.0 to 1.0)
  const safeTotal = Math.max(1, totalSeconds);
  const pct = Math.max(0, Math.min(1, secondsLeft / safeTotal));

  // Time formatting (mm:ss)
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // SVG Geometry for Pie Clock (300 x 300 viewBox)
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const rWedge = 120;
  const rHub = 48;

  // Remaining wedge math: sweeps clockwise from 12 o'clock
  const elapsedAngle = (1 - pct) * 2 * Math.PI;
  const xStart = cx + rWedge * Math.sin(elapsedAngle);
  const yStart = cy - rWedge * Math.cos(elapsedAngle);
  const largeArc = pct > 0.5 ? 1 : 0;

  // Hand tip coordinates
  const needleX = cx + (rWedge + 4) * Math.sin(elapsedAngle);
  const needleY = cy - (rWedge + 4) * Math.cos(elapsedAngle);

  // Dynamic Sensory Color based on remaining time percentage
  const getPieColor = () => {
    if (secondsLeft === 0) return '#10B981'; // Green complete
    if (pct > 0.5) return '#10B981'; // Emerald calm
    if (pct > 0.2) return '#F59E0B'; // Amber warm attention
    return '#F43F5E'; // Soft rose attention
  };

  const currentColor = getPieColor();

  // Gentle transition banner message
  const getTransitionMessage = () => {
    if (secondsLeft === 0) {
      return { text: t('Step complete! Great job! ✨'), tone: 'emerald' };
    }
    if (secondsLeft <= 30) {
      return { text: t('Almost time to switch! Finishing up ✨'), tone: 'amber' };
    }
    if (secondsLeft <= 120) {
      return { text: t('2 minutes left — you are doing wonderful! 💛'), tone: 'blue' };
    }
    return null;
  };

  const transitionBanner = getTransitionMessage();

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-xl text-white flex flex-col p-4 sm:p-8 justify-between overflow-y-auto animate-in fade-in'
          : 'bg-[#181C24] text-white p-4 sm:p-6 rounded-[2.5rem] shadow-xl border border-stone-800 relative overflow-hidden animate-in fade-in slide-in-from-top-4'
      }`}
    >
      {/* Decorative ambient background glows */}
      <div 
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentColor }}
      />
      <div 
        className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentColor }}
      />

      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex items-center justify-between gap-3 relative z-10 border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <RoutineStickerIcon
              emoji={routine.emoji || '⭐'}
              title={routine.title}
              size={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
              {routine.title} • {t('Step')} {stepIndex + 1} of {routine.steps.length}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-1.5">
              <span>{activeStep?.title || t('In Progress')}</span>
              {isStepDone && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  ✓ {t('Completed')}
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Style toggle (Pie vs Bubbles) */}
          <div className="flex items-center bg-stone-900/90 border border-stone-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setPacerStyle('pie');
                playChime('tap');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pacerStyle === 'pie' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="Time-Timer visual clock"
            >
              ⏱️ {t('Clock')}
            </button>
            <button
              type="button"
              onClick={() => {
                setPacerStyle('bubbles');
                playChime('tap');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pacerStyle === 'bubbles' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="Calming floating sandglass bubbles"
            >
              🫧 {t('Bubbles')}
            </button>
          </div>

          {/* Fullscreen / Countertop button */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen Countertop Mode')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title={t('Close Timer')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SENSORY TRANSITION BANNER (When 2m or 30s remaining) */}
      {transitionBanner && !isWaitingForNext && (
        <div
          className={`my-3 py-2 px-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 relative z-10 ${
            transitionBanner.tone === 'emerald'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : transitionBanner.tone === 'amber'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 animate-pulse'
              : 'bg-sky-500/20 border-sky-500/40 text-sky-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{transitionBanner.text}</span>
        </div>
      )}

      {/* 3. MAIN PACER VISUAL BODY */}
      <div className="my-auto py-4 flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 relative z-10">
        {/* Left Side: Step Hand-Drawn Icon & Instructions */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
          <div className="relative mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400/20 via-yellow-200/10 to-stone-800 border-2 border-stone-700 flex items-center justify-center p-3 shadow-lg">
              <RoutineStickerIcon
                emoji={activeStep?.emoji}
                title={activeStep?.title}
                size={80}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md select-none"
              />
            </div>
            {isStepDone && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-slate-900">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {activeStep?.title}
          </h2>
          {activeStep?.instruction && (
            <p className="text-xs sm:text-sm text-stone-300 font-medium mt-1 leading-snug">
              {activeStep.instruction}
            </p>
          )}
          {activeStep?.sensoryNote && (
            <div className="mt-2.5 py-1 px-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
              <span>💡</span>
              <span>{activeStep.sensoryNote}</span>
            </div>
          )}
        </div>

        {/* Center: The Visual Timer (Pie or Bubbles) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          {/* A. VISUAL PIE CLOCK */}
          {pacerStyle === 'pie' && (
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-full transform drop-shadow-xl"
                aria-label={`Visual timer: ${timeFormatted} remaining`}
              >
                {/* Outer bezel ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={140}
                  fill="#1E232A"
                  stroke="#2D333B"
                  strokeWidth="6"
                />

                {/* Clock face background */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rWedge}
                  fill="#12161C"
                  stroke="#2D333B"
                  strokeWidth="1.5"
                />

                {/* Shrinking Time Wedge (sweeps clockwise) */}
                {pct > 0 && pct < 1 ? (
                  <path
                    d={`M ${cx} ${cy} L ${cx} ${cy - rWedge} A ${rWedge} ${rWedge} 0 ${largeArc} 1 ${xStart} ${yStart} Z`}
                    fill={currentColor}
                    opacity="0.9"
                  />
                ) : pct >= 1 ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={rWedge}
                    fill={currentColor}
                    opacity="0.9"
                  />
                ) : null}

                {/* Clock Dial Minute Tick Marks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = cx + (rWedge - 10) * Math.sin(angle);
                  const y1 = cy - (rWedge - 10) * Math.cos(angle);
                  const x2 = cx + (rWedge - 2) * Math.sin(angle);
                  const y2 = cy - (rWedge - 2) * Math.cos(angle);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#4E5561"
                      strokeWidth={i % 3 === 0 ? '3' : '1.5'}
                    />
                  );
                })}

                {/* Sweeping Hand Needle */}
                {pct > 0 && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={needleX}
                    y2={needleY}
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Center Hub */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rHub}
                  fill="#1E232A"
                  stroke="#38404B"
                  strokeWidth="3"
                  className="shadow-inner"
                />
              </svg>

              {/* Digital Time Inside Center Hub */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                <span className="font-black text-2xl sm:text-3xl text-white tracking-tight drop-shadow-xs">
                  {timeFormatted}
                </span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {isRunning ? t('Remaining') : isWaitingForNext ? t('Ready') : t('Paused')}
                </span>
              </div>
            </div>
          )}

          {/* B. CALM FLOATING BUBBLES SANDGLASS PACER */}
          {pacerStyle === 'bubbles' && (
            <div className="relative w-48 h-56 sm:w-56 sm:h-64 bg-stone-900 rounded-3xl border-3 border-stone-700 p-4 flex flex-col justify-between overflow-hidden shadow-xl">
              {/* Liquid Level rising/dropping */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-700 opacity-30"
                style={{
                  height: `${pct * 100}%`,
                  backgroundColor: currentColor,
                }}
              />

              {/* Animated Floating Bubbles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute w-5 h-5 rounded-full bg-white/20 border border-white/40 animate-bounce"
                  style={{ left: '25%', bottom: '20%', animationDuration: '3s' }}
                />
                <div
                  className="absolute w-7 h-7 rounded-full bg-white/25 border border-white/40 animate-pulse"
                  style={{ left: '60%', bottom: '45%', animationDuration: '2.5s' }}
                />
                <div
                  className="absolute w-4 h-4 rounded-full bg-white/30 border border-white/50"
                  style={{ left: '40%', bottom: '65%' }}
                />
              </div>

              {/* Header Label */}
              <div className="relative z-10 flex items-center justify-between text-xs font-black text-stone-400">
                <span>🫧 {t('Sandglass')}</span>
                <span>{Math.round(pct * 100)}%</span>
              </div>

              {/* Center Digital Display */}
              <div className="relative z-10 text-center my-auto">
                <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
                  {timeFormatted}
                </div>
                <div className="text-xs font-bold text-amber-300 mt-1">
                  {isRunning ? t('Relaxing & pacing...') : t('Paused')}
                </div>
              </div>

              {/* Progress bar baseline */}
              <div className="relative z-10 w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct * 100}%`,
                    backgroundColor: currentColor,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SENSORY BREATHING BREAK (Optional One-Tap Chill Pacer) */}
      {isBreathingBreak && (
        <div className="my-3 p-4 rounded-3xl bg-sky-950/80 border-2 border-sky-400/40 text-center space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4" />
              <span>{t('Sensory Breathing Break')}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsBreathingBreak(false);
                playChime('tap');
              }}
              className="text-xs text-stone-400 hover:text-white underline cursor-pointer"
            >
              {t('Back to Timer')}
            </button>
          </div>

          {/* Animated Expanding Breathing Circle */}
          <div className="py-2 flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 shadow-lg ${
                breathPhase === 'inhale'
                  ? 'bg-sky-400 scale-125 ring-8 ring-sky-300/30'
                  : breathPhase === 'hold'
                  ? 'bg-indigo-400 scale-125 ring-8 ring-indigo-300/30'
                  : 'bg-emerald-400 scale-90 ring-4 ring-emerald-300/20'
              }`}
            >
              <span className="text-3xl font-black text-slate-950">{breathCount}</span>
            </div>
            <span className="text-sm font-black text-white capitalize mt-3 tracking-wide">
              {breathPhase === 'inhale'
                ? t('🌬️ Breathe in gently...')
                : breathPhase === 'hold'
                ? t('✨ Hold softly...')
                : t('🍃 Breathe out slowly...')}
            </span>
          </div>
        </div>
      )}

      {/* 5. ACTION CONTROLS & NEURODIVERGENT GRACE BUTTONS */}
      <div className="relative z-10 pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Grace Time & Take a Breath Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* +1 Minute Grace Button */}
          <button
            type="button"
            onClick={() => onAddGraceTime(60)}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Add 1 more minute with zero pressure"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('+1m Grace')}</span>
          </button>

          {/* +2 Minutes Grace Button */}
          <button
            type="button"
            onClick={() => onAddGraceTime(120)}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Add 2 more minutes"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('+2m Grace')}</span>
          </button>

          {/* Take a Breath Button */}
          <button
            type="button"
            onClick={() => {
              if (isRunning) onTogglePlayPause(); // pause timer while breathing
              setIsBreathingBreak(!isBreathingBreak);
              playChime('breathe');
            }}
            className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isBreathingBreak
                ? 'bg-sky-500 text-slate-950 font-black'
                : 'bg-stone-900 hover:bg-stone-800 text-sky-300 hover:text-white border border-stone-700'
            }`}
            title="Pause and take a calm sensory breath"
          >
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('Take a Breath')}</span>
          </button>
        </div>

        {/* Right: Primary Step Play / Pause / Done Advance */}
        <div className="flex items-center gap-2.5">
          {isWaitingForNext ? (
            <button
              type="button"
              onClick={onStartWhenReady}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>{t('Start When Ready')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onTogglePlayPause}
              className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 border border-stone-700 shadow-md transition-all cursor-pointer active:scale-95"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>{t('Pause')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t('Resume')}</span>
                </>
              )}
            </button>
          )}

          {/* Mark Step Done & Advance */}
          <button
            type="button"
            onClick={() => onAdvanceStep(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {stepIndex + 1 < routine.steps.length
                ? t('Step Done → Next')
                : t('Finish Routine 🎉')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
