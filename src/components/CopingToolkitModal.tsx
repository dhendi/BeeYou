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
  Star,
  CheckCircle2,
  Sliders,
  Clock,
  Hand,
  Droplets,
  Home
} from 'lucide-react';
import { 
  playChime, 
  stopSoundscape, 
  getSavedSoundscapeVolume,
  subscribeToSoundscapes, 
  getActiveSoundscapes, 
  SOUNDSCAPES_CATALOG 
} from '../utils/audio';
import { SoundscapeId } from '../types';
import { t } from '../services/translator';
import { SoundChimeGrid } from './soundscapes/SoundChimeGrid';

export const CopingToolkitModal: React.FC = () => {
  const {
    showCopingToolkit,
    setShowCopingToolkit,
    speak,
    announce,
    childProfile,
    isPremium,
    triggerUpgrade,
    setShowPieTimerModal,
    breathingConfig,
    calmStrategies,
    setShowEditCalmModal,
    copingToolkitTab,
    setCopingToolkitTab,
    settings,
  } = useApp();

  const activeTab: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound' = copingToolkitTab || 'breathing';

  // Breathing state
  const [breathePhase, setBreathePhase] = useState<'Inhale...' | 'Hold...' | 'Exhale...' | 'Rest...' | string>('Inhale...');
  const [breatheScale, setBreatheScale] = useState(1);
  const [breathingAudioEnabled, setBreathingAudioEnabled] = useState(false);

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
        if (settings?.soundEffects && breathingAudioEnabled) {
          playChime('breathe');
        }
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
  }, [showCopingToolkit, activeTab, inhaleSec, holdSec, exhaleSec, pauseSec, settings?.soundEffects, breathingAudioEnabled]);

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

  // Stop soundscapes whenever modal is closed or unmounted
  useEffect(() => {
    if (!showCopingToolkit) {
      stopSoundscape();
    }
    return () => {
      stopSoundscape();
    };
  }, [showCopingToolkit]);

  const selectTab = (tab: 'breathing' | 'strategies' | 'timer' | 'grounding' | 'sound') => {
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
    { title: 'Look Around: 5 things you can see', icon: Eye, prompt: 'Notice colors, shapes, or lights in the room.' },
    { title: 'Touch Gently: 4 things you can feel', icon: Hand, prompt: 'Touch your soft clothes, the cool floor, or your comfort toy.' },
    { title: 'Listen Closely: 3 things you can hear', icon: Volume2, prompt: 'Listen to the quiet hum, birds outside, or your own breath.' },
    { title: 'Smell: 2 scents around you', icon: Wind, prompt: 'Take a soft breath through your nose.' },
    { title: 'Taste / Sip: 1 cool sip of water', icon: Droplets, prompt: 'Take a gentle swallow or relax your jaw.' },
  ];

  const toolHeaderConfig: Record<string, { title: string; subtitle: string; icon: any }> = {
    sound: {
      title: 'Sensory Room Soundscapes',
      subtitle: 'Procedural acoustic masking & soothing sensory frequencies',
      icon: Volume2,
    },
    breathing: {
      title: 'Sensory Breathing Pacer',
      subtitle: 'Follow the gentle bubble to pause, breathe, and reset',
      icon: Wind,
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      subtitle: 'Sensory countdown to reset during overwhelm',
      icon: Eye,
    },
    timer: {
      title: 'Break Timer',
      subtitle: 'Gentle visual timer to pause and reset',
      icon: Timer,
    },
    strategies: {
      title: 'Calming Coping Strategies',
      subtitle: 'Personalized regulation and comfort strategies',
      icon: Heart,
    },
  };

  const headerInfo = toolHeaderConfig[activeTab] || {
    title: 'Calm & Coping Toolkit',
    subtitle: 'Safe space to pause, breathe, and reset',
    icon: Star,
  };
  const HeaderIcon = headerInfo.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(headerInfo.title)}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        stopSoundscape();
        setShowCopingToolkit(false);
      }}
    >
      <div
        className={`bg-white dark:bg-slate-900 w-full ${activeTab === 'sound' ? 'max-w-4xl' : 'max-w-lg'} max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-teal-50 border-b border-teal-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/80 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 shadow-2xs">
              <HeaderIcon className="w-5 h-5 text-teal-700" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-teal-950">{t(headerInfo.title)}</h2>
              <p className="text-xs text-teal-700 font-medium">{t(headerInfo.subtitle)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopSoundscape();
              setShowCopingToolkit(false);
            }}
            className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Selector - only shown when not on sound tool */}
        {activeTab !== 'sound' && (
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
          </div>
        )}

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
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCalmModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t('Customize Pace')} ({inhaleSec}s - {holdSec}s - {exhaleSec}s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBreathingAudioEnabled((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    breathingAudioEnabled
                      ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
                  }`}
                  aria-label={breathingAudioEnabled ? t('Mute chime cue') : t('Enable chime cue')}
                >
                  {breathingAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{breathingAudioEnabled ? t('Chime Sound: On') : t('Chime Sound: Off')}</span>
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
                            selectTab('timer');
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
                <span>{t('Open Full Pie Clock')}</span>
              </button>
            </div>
          )}

          {/* TAB 3: GROUNDING */}
          {activeTab === 'grounding' && (
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-teal-100 border-2 border-teal-300 text-teal-800 flex items-center justify-center mb-3 shadow-xs">
                {React.createElement(groundingItems[groundingStep].icon, { className: 'w-8 h-8 text-teal-700' })}
              </div>
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
            <div className="w-full flex flex-col items-stretch py-1 text-left animate-in fade-in duration-200">
              <SoundChimeGrid
                activeSoundIds={activeSoundIds}
                soundVolumes={soundVolumes}
                onVolumeChange={(id, val) => {
                  setSoundVolumes((prev) => ({ ...prev, [id]: val }));
                }}
                isPremium={isPremium}
              />
            </div>
          )}
        </div>

        {/* Quick Communication Strip - hidden on dedicated sound tool */}
        {activeTab !== 'sound' && (
          <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              {t('Things you can ask for right now:')}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { text: 'I want a glass of water.', icon: Droplets },
                { text: 'Can I have a hug?', icon: Heart },
                { text: 'I want to sit quietly.', icon: VolumeX },
                { text: 'I want my comfort item.', icon: Star },
                { text: 'Can we go home?', icon: Home },
              ].map((need, idx) => {
                const IconComp = need.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Speak phrase: ${need.text}`}
                    onClick={() => speak(t(need.text))}
                    className="px-3 py-1.5 min-h-[48px] rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs active:scale-95 cursor-pointer flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                  >
                    <IconComp className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                    <span>{t(need.text)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
