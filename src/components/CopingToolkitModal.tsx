import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Wind, 
  Timer, 
  Volume2, 
  VolumeX, 
  Heart, 
  Eye, 
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Lock,
  Crown,
  Play,
  Square,
  Sliders,
  Layers,
  Trash2,
  Plus,
  Clock
} from 'lucide-react';
import { 
  playChime, 
  playSoundscape, 
  stopSoundscape, 
  setSoundscapeVolume, 
  getSavedSoundscapeVolume,
  subscribeToSoundscapes, 
  getActiveSoundscapes, 
  isSoundscapeActive,
  SOUNDSCAPES_CATALOG 
} from '../utils/audio';
import { SoundscapeId } from '../types';
import { t } from '../services/translator';

export const CopingToolkitModal: React.FC = () => {
  const {
    showCopingToolkit,
    setShowCopingToolkit,
    speak,
    announce,
    childProfile,
    isPremium,
    triggerUpgrade,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPieTimerModal,
    setShowFidgetModal,
    breathingConfig,
    calmStrategies,
    setShowEditCalmModal,
    copingToolkitTab,
    setCopingToolkitTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound'>(
    copingToolkitTab || 'breathing'
  );

  useEffect(() => {
    if (copingToolkitTab && showCopingToolkit) {
      setActiveTab(copingToolkitTab);
    }
  }, [copingToolkitTab, showCopingToolkit]);

  // Breathing state
  const [breathePhase, setBreathePhase] = useState<'Inhale...' | 'Hold...' | 'Exhale...' | 'Rest...' | string>('Inhale...');
  const [breatheScale, setBreatheScale] = useState(1);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(3);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Multi-track combinable soundscape state with persistent volume memory
  const [activeSoundIds, setActiveSoundIds] = useState<SoundscapeId[]>(() => getActiveSoundscapes());
  const [soundVolumes, setSoundVolumes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    SOUNDSCAPES_CATALOG.forEach((s) => {
      map[s.id] = getSavedSoundscapeVolume(s.id);
    });
    return map;
  });
  const [soundFilter, setSoundFilter] = useState<'all' | 'nature' | 'noise' | 'focus' | 'special_interest' | 'ambient'>('all');

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);

  // Strategy category filter
  const [strategyFilter, setStrategyFilter] = useState<string>('all');

  // Subscribe to live multi-track soundscape changes
  useEffect(() => {
    const unsub = subscribeToSoundscapes((ids) => {
      setActiveSoundIds(ids);
      setSoundVolumes((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          next[id] = getSavedSoundscapeVolume(id);
        });
        return next;
      });
    });
    return () => unsub();
  }, []);

  const inhaleSec = breathingConfig?.inhaleSec || 4;
  const holdSec = breathingConfig?.holdSec || 3;
  const exhaleSec = breathingConfig?.exhaleSec || 4;
  const pauseSec = breathingConfig?.pauseSec ?? 1;

  // Breathing loop
  useEffect(() => {
    if (!showCopingToolkit || activeTab !== 'breathing') return;

    let isSubscribed = true;
    const cycle = async () => {
      while (isSubscribed) {
        setBreathePhase(`Inhale (${inhaleSec}s)`);
        setBreatheScale(1.4);
        playChime('breathe');
        await new Promise((r) => setTimeout(r, inhaleSec * 1000));
        if (!isSubscribed) break;

        if (holdSec > 0) {
          setBreathePhase(`Hold gently (${holdSec}s)`);
          await new Promise((r) => setTimeout(r, holdSec * 1000));
          if (!isSubscribed) break;
        }

        setBreathePhase(`Exhale softly (${exhaleSec}s)`);
        setBreatheScale(1.0);
        await new Promise((r) => setTimeout(r, exhaleSec * 1000));
        if (!isSubscribed) break;

        if (pauseSec > 0) {
          setBreathePhase(`Rest (${pauseSec}s)`);
          await new Promise((r) => setTimeout(r, pauseSec * 1000));
          if (!isSubscribed) break;
        }
      }
    };
    cycle();

    return () => {
      isSubscribed = false;
    };
  }, [showCopingToolkit, activeTab, inhaleSec, holdSec, exhaleSec, pauseSec]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime('complete');
      announce('Break timer is complete. Great job taking care of yourself.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Clean up soundscapes on unmount
  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  const selectTab = (tab: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound') => {
    setActiveTab(tab);
    setCopingToolkitTab(tab);
  };

  if (!showCopingToolkit) return null;

  const startBreakTimer = (mins: number) => {
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerRunning(true);
    playChime('tap');
  };

  const getBreathePhaseText = (phase: string) => {
    if (phase.startsWith('Inhale')) return `${t('Inhale')} (${inhaleSec}s)`;
    if (phase.startsWith('Hold')) return `${t('Hold gently')} (${holdSec}s)`;
    if (phase.startsWith('Exhale')) return `${t('Exhale softly')} (${exhaleSec}s)`;
    if (phase.startsWith('Rest')) return `${t('Rest')} (${pauseSec}s)`;
    return t(phase);
  };

  const groundingItems = [
    { title: 'Look Around: 5 things you can see', emoji: '👀', prompt: 'Notice colors, shapes, or lights in the room.' },
    { title: 'Touch Gently: 4 things you can feel', emoji: '🤲', prompt: 'Touch your soft clothes, the cool floor, or your comfort toy.' },
    { title: 'Listen Closely: 3 things you can hear', emoji: '👂', prompt: 'Listen to the quiet hum, birds outside, or your own breath.' },
    { title: 'Smell: 2 scents around you', emoji: '👃', prompt: 'Take a soft breath through your nose.' },
    { title: 'Taste / Sip: 1 cool sip of water', emoji: '💧', prompt: 'Take a gentle swallow or relax your jaw.' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in duration-200"
      onClick={() => setShowCopingToolkit(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col shadow-2xl overflow-hidden border-4 border-teal-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-teal-50 border-b border-teal-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🛋️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-teal-950">{t('Calm & Coping Toolkit')}</h2>
              <p className="text-xs text-teal-700 font-medium">{t('Safe space to pause, breathe, and reset')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSoundscape();
              setShowCopingToolkit(false);
            }}
            className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            aria-label="Close calm and coping toolkit"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => selectTab('breathing')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
              activeTab === 'breathing'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wind className="w-4 h-4 shrink-0" />
            <span>{t('Deep Breathing')}</span>
          </button>
          <button
            onClick={() => selectTab('strategies')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
              activeTab === 'strategies'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>{t('Calm Tools')}</span>
          </button>
          <button
            onClick={() => selectTab('timer')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
              activeTab === 'timer'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Timer className="w-4 h-4 shrink-0" />
            <span>{t('Break Timer')}</span>
          </button>
          <button
            onClick={() => selectTab('grounding')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
              activeTab === 'grounding'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>{t('5-4-3-2-1')}</span>
          </button>
          <button
            onClick={() => selectTab('sound')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
              activeTab === 'sound'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{t('Sounds')}</span>
          </button>
        </div>

        {/* Quick Tools Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50/70 border-b border-teal-100 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-teal-800 shrink-0">{t('More Tools:')}</span>
          <button
            onClick={() => {
              setShowFidgetModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
          >
            <span>🫧</span>
            <span>{t('Digital Fidgets')}</span>
          </button>
          <button
            onClick={() => {
              setShowPieTimerModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
          >
            <span>⏰</span>
            <span>{t('Pie Clock')}</span>
          </button>
          <button
            onClick={() => {
              setShowFivePointModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
          >
            <span>🌡️</span>
            <span>{t('5-Point Scale')}</span>
          </button>
          <button
            onClick={() => {
              setShowCopingToolkit(false);
              activateEmergencyMode();
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-black text-xs hover:bg-red-700 transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap active:scale-95"
          >
            <span>🚨</span>
            <span>{t('Emergency Mode')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col ${
          activeTab === 'breathing' ? 'items-center justify-center text-center' : 'items-stretch justify-start text-left'
        }`}>
          {/* TAB 1: BREATHING */}
          {activeTab === 'breathing' && (
            <div className="flex flex-col items-center justify-center py-4 w-full">
              <div
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-teal-300 via-cyan-200 to-sky-300 flex items-center justify-center shadow-lg transition-transform duration-1000 ease-in-out border-4 border-white"
                style={{ transform: `scale(${breatheScale})` }}
              >
                <div className="w-32 h-32 rounded-full bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-teal-900 shadow-inner">
                  <Wind className="w-8 h-8 text-teal-600 mb-1" />
                  <span className="font-black text-sm sm:text-base tracking-tight leading-tight">
                    {getBreathePhaseText(breathePhase)}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 font-medium text-xs sm:text-sm mt-6 max-w-xs">
                {t('Follow the gentle bubble. Breathe in slowly through your nose, hold, and breathe out like blowing a dandelion.')}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCalmModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t('Customize Pace')} ({inhaleSec}s - {holdSec}s - {exhaleSec}s)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: CALM TOOLS & COPING STRATEGIES */}
          {activeTab === 'strategies' && (
            <div className="w-full flex flex-col gap-3.5 text-left animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">{t('Calming Coping Strategies')}</h3>
                  <p className="text-[11px] text-slate-500">{t('Pick a comforting activity to regulate your nervous system')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditCalmModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{t('Customize')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {calmStrategies.map((strat) => (
                  <div
                    key={strat.id}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all flex flex-col justify-between gap-2 shadow-xs group"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-white shadow-xs group-hover:scale-110 transition shrink-0">
                        {strat.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-800 truncate">{t(strat.title)}</p>
                          {strat.durationMin && (
                            <span className="text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded-md">
                              {strat.durationMin}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">
                          {t(strat.instruction)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          speak(strat.instruction ? t(strat.instruction) : t(strat.title));
                          playChime('tap');
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-teal-600" />
                        <span>{t('Read')}</span>
                      </button>
                      {strat.durationMin && (
                        <button
                          onClick={() => {
                            startBreakTimer(strat.durationMin || 3);
                            setActiveTab('timer');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Timer className="w-3 h-3" />
                          <span>{t('Start')} {strat.durationMin}m {t('Timer')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL BREAK TIMER */}
          {activeTab === 'timer' && (
            <div className="w-full flex flex-col items-center">
              <div className="text-5xl sm:text-6xl font-black text-slate-800 my-4 font-mono tracking-wider">
                {Math.floor(timerSecondsLeft / 60)}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs bg-slate-200 h-4 rounded-full overflow-hidden mb-6 border border-slate-300">
                <div
                  className="bg-teal-500 h-full transition-all duration-1000 rounded-full"
                  style={{
                    width: `${((timerMinutes * 60 - timerSecondsLeft) / (timerMinutes * 60)) * 100}%`,
                  }}
                />
              </div>

              {/* Timer presets */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 3, 5, 10].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => startBreakTimer(mins)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer ${
                      timerMinutes === mins && isTimerRunning
                        ? 'bg-teal-500 text-white border-teal-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {mins} {t('min')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isTimerRunning ? t('Pause Timer') : t('Start Timer')}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(timerMinutes * 60);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  {t('Reset')}
                </button>
              </div>

              {/* Quick shortcut to open Full Visual Pie Clock */}
              <button
                type="button"
                onClick={() => setShowPieTimerModal(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Clock className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>{t('Open Full Pie Clock')} ⏰</span>
              </button>
            </div>
          )}

          {/* TAB 3: GROUNDING */}
          {activeTab === 'grounding' && (
            <div className="w-full max-w-md flex flex-col items-center">
              <span className="text-5xl mb-2">{groundingItems[groundingStep].emoji}</span>
              <h3 className="text-lg font-black text-slate-800 mb-1">
                {t(groundingItems[groundingStep].title)}
              </h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                {t(groundingItems[groundingStep].prompt)}
              </p>

              <div className="flex items-center gap-2 mb-6">
                {groundingItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGroundingStep(idx)}
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      groundingStep === idx
                        ? 'bg-teal-600 text-white ring-2 ring-teal-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {5 - idx}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (groundingStep < groundingItems.length - 1) {
                    setGroundingStep((p) => p + 1);
                    playChime('tap');
                  } else {
                    playChime('complete');
                    announce('Grounding exercise complete. You are doing great.');
                    setGroundingStep(0);
                  }
                }}
                className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {groundingStep < groundingItems.length - 1 ? t('Next Step') : t('All Finished!')}
              </button>
            </div>
          )}

          {/* TAB 4: SENSORY ROOM SOUNDSCAPES */}
          {activeTab === 'sound' && (
            <div className="w-full flex flex-col items-stretch py-1 text-left">
              {/* Header Info */}
              <div className="w-full mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span>{t('Sensory Room Soundscapes')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                      {activeSoundIds.length === 0 
                        ? t('Offline Audio') 
                        : activeSoundIds.length === 1 
                        ? t('1 Active Sound') 
                        : `${activeSoundIds.length} ${t('Active Sounds Combined')}`}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Procedural acoustic masking & soothing sensory frequencies. 100% offline.')}
                  </p>
                </div>

                {activeSoundIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => stopSoundscape()}
                    aria-label={t('Stop All Sounds')}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>{t('Stop All')}</span>
                  </button>
                )}
              </div>

              {/* Free vs Premium Notice if Basic */}
              {!isPremium && (
                <div className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-200 mb-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span className="text-amber-900 font-medium">
                      {t('2 basic sounds included free. 27 specialized sensory soundscapes and combinable sound mixing unlock with BeeYou Premium.')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerUpgrade('Unlock All 29 Soundscapes & Layered Sound Mixing')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                  >
                    {t('15-Day Free Trial')}
                  </button>
                </div>
              )}

              {/* Combinable Multi-Track Sound Mixer Drawer */}
              {activeSoundIds.length > 0 && (
                <div className="w-full p-3 sm:p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 mb-3.5 flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-700" aria-hidden="true" />
                      <h4 className="text-xs sm:text-sm font-black text-teal-950">
                        {t('Active Sound Mix')}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-teal-200 text-teal-900">
                        {activeSoundIds.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-700 font-medium hidden sm:inline">
                      {t('Adjust volumes individually or combine multiple layers')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSoundIds.map((id) => {
                      const item = SOUNDSCAPES_CATALOG.find((s) => s.id === id);
                      if (!item) return null;
                      const vol = soundVolumes[id] ?? 0.5;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-teal-100 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Volume2 className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{t(item.name)}</p>
                              <span className="text-[10px] font-bold text-teal-700">
                                {t('Vol')}: {Math.round(vol * 100)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="range"
                              min="0.01"
                              max="1.0"
                              step="0.01"
                              value={vol}
                              aria-label={`${t(item.name)} ${t('Volume')}`}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setSoundVolumes((prev) => ({ ...prev, [id]: val }));
                                setSoundscapeVolume(val, id);
                              }}
                              className="w-18 sm:w-24 accent-teal-600 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => stopSoundscape(id)}
                              aria-label={`${t('Stop')} ${t(item.name)}`}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Soundscape Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 w-full shrink-0">
                {[
                  { id: 'all', label: 'All Sounds (29)' },
                  { id: 'nature', label: 'Nature' },
                  { id: 'noise', label: 'Noise & Masking' },
                  { id: 'focus', label: 'Focus & Study' },
                  { id: 'ambient', label: 'Ambience & Zen' },
                  { id: 'special_interest', label: 'Trains & Fantasy' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSoundFilter(cat.id as any);
                      playChime('tap');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 flex items-center ${
                      soundFilter === cat.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t(cat.label)}</span>
                  </button>
                ))}
              </div>

              {/* Soundscape Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pb-4">
                {SOUNDSCAPES_CATALOG.filter(
                  (item) => soundFilter === 'all' || item.category === soundFilter
                ).map((item) => {
                  const isPlaying = activeSoundIds.includes(item.id);
                  const isLocked = item.isPremium && !isPremium;
                  const vol = soundVolumes[item.id] ?? 0.5;

                  if (isPlaying) {
                    return (
                      <div
                        key={item.id}
                        className="w-full text-left p-4 rounded-2xl border-2 transition-all border-teal-500 bg-teal-50/90 shadow-md ring-2 ring-teal-300 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-slate-800 text-sm leading-snug">
                              {t(item.name)}
                            </h4>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-600 text-white shrink-0 flex items-center gap-1">
                              <Volume2 className="w-3 h-3 animate-pulse" aria-hidden="true" />
                              <span>{t('Playing')}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isPremium ? (
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5" aria-hidden="true" />
                                <span>{t('Premium')}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                                {t('Free')}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-medium">
                              {item.tags.map((tg) => t(tg)).join(' • ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                            {t(item.description)}
                          </p>
                        </div>

                        {/* Direct adjustable volume slider on card */}
                        <div className="space-y-2 pt-2 border-t border-teal-200">
                          <div className="flex items-center justify-between gap-2 bg-white/95 px-3 py-1.5 rounded-xl border border-teal-200">
                            <span className="text-xs font-bold text-teal-900 flex items-center gap-1 shrink-0">
                              <Sliders className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                              <span>{t('Vol')}: {Math.round(vol * 100)}%</span>
                            </span>
                            <input
                              type="range"
                              min="0.01"
                              max="1.0"
                              step="0.01"
                              value={vol}
                              aria-label={`${t(item.name)} ${t('Volume')}`}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setSoundVolumes((prev) => ({ ...prev, [item.id]: val }));
                                setSoundscapeVolume(val, item.id);
                              }}
                              className="w-full max-w-[130px] accent-teal-600 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => stopSoundscape(item.id)}
                              aria-label={`${t('Stop')} ${t(item.name)}`}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 text-xs font-black shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                              <span>{t('Stop')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isLocked
                          ? 'border-slate-200 bg-slate-50/70 hover:border-amber-300'
                          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-slate-800 text-sm leading-snug">
                            {t(item.name)}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isPremium ? (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 flex items-center gap-0.5 shrink-0">
                              <Crown className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>{t('Premium')}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                              {t('Free')}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.tags.map((tg) => t(tg)).join(' • ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                          {t(item.description)}
                        </p>
                      </div>

                      {/* Card Footer Action Button */}
                      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        {isLocked ? (
                          <button
                            type="button"
                            onClick={() => triggerUpgrade(`Unlock ${item.name} & Full Sensory Room Library`)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1.5 text-xs font-black transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{t('Unlock')}</span>
                          </button>
                        ) : isPremium && activeSoundIds.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => playSoundscape(item.id, vol, true)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs font-black shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{t('Add to Mix')}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => playSoundscape(item.id, vol, isPremium)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 text-xs font-black transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                            <span>{t('Play')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Communication Strip */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            {t('Things you can ask for right now:')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { text: 'I want a glass of water.', emoji: '💧' },
              { text: 'Can I have a hug?', emoji: '🤗' },
              { text: 'I want to sit quietly.', emoji: '🤫' },
              { text: 'I want my comfort item.', emoji: '🦕' },
              { text: 'Can we go home?', emoji: '🏠' },
            ].map((need, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Speak phrase: ${need.text}`}
                onClick={() => speak(t(need.text))}
                className="px-3 py-1.5 min-h-[48px] rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
              >
                <span aria-hidden="true">{need.emoji}</span>
                <span>{t(need.text)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
