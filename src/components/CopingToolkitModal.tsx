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
import { RoutineStickerIcon } from './icons/JournalStickers';

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
    {
      step: 5,
      title: 'Look Around: 5 things you can see',
      prompt: 'Notice colors, shapes, or lights in the room.',
      stickerSrc: '/assets/stickers/eye_see.png',
      fallbackIcon: Eye,
    },
    {
      step: 4,
      title: 'Touch Gently: 4 things you can feel',
      prompt: 'Touch your soft clothes, the cool floor, or your comfort toy.',
      stickerSrc: '/assets/stickers/teddy_bear.png',
      fallbackIcon: Hand,
    },
    {
      step: 3,
      title: 'Listen Closely: 3 things you can hear',
      prompt: 'Listen to the quiet hum, birds outside, or your own breath.',
      stickerSrc: '/assets/stickers/teen_headphones.png',
      fallbackIcon: Volume2,
    },
    {
      step: 2,
      title: 'Smell: 2 scents around you',
      prompt: 'Take a soft breath through your nose.',
      stickerSrc: '/assets/stickers/calm_wind.png',
      fallbackIcon: Wind,
    },
    {
      step: 1,
      title: 'Taste / Sip: 1 cool sip of water',
      prompt: 'Take a gentle swallow or relax your jaw.',
      stickerSrc: '/assets/stickers/drink_water.png',
      fallbackIcon: Droplets,
    },
  ];

  const toolHeaderConfig: Record<string, { title: string; subtitle: string; icon: any; stickerSrc?: string }> = {
    sound: {
      title: 'Sensory Room Soundscapes',
      subtitle: 'Procedural acoustic masking & soothing sensory frequencies',
      icon: Volume2,
      stickerSrc: '/assets/stickers/music_sensory.png',
    },
    breathing: {
      title: 'Sensory Breathing Pacer',
      subtitle: 'Follow the gentle bubble to pause, breathe, and reset',
      icon: Wind,
      stickerSrc: '/assets/stickers/breathing_cloud.png',
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      subtitle: 'Sensory countdown to reset during overwhelm',
      icon: Eye,
      stickerSrc: '/assets/stickers/eye_see.png',
    },
    timer: {
      title: 'Break Timer',
      subtitle: 'Gentle visual timer to pause and reset',
      icon: Timer,
      stickerSrc: '/assets/stickers/timer_clock.png',
    },
    strategies: {
      title: 'Calming Coping Strategies',
      subtitle: 'Personalized regulation and comfort strategies',
      icon: Heart,
      stickerSrc: '/assets/stickers/fav_love_heart.png',
    },
  };

  const headerInfo = toolHeaderConfig[activeTab] || {
    title: 'Calm & Coping Toolkit',
    subtitle: 'Safe space to pause, breathe, and reset',
    icon: Star,
  };
  const HeaderIcon = headerInfo.icon;

  const quickNeeds = [
    { text: 'I want a glass of water.', stickerSrc: '/assets/stickers/drink_water.png', fallbackIcon: Droplets },
    { text: 'Can I have a hug?', stickerSrc: '/assets/stickers/fav_love_heart.png', fallbackIcon: Heart },
    { text: 'I want to sit quietly.', stickerSrc: '/assets/stickers/fav_quiet_break.png', fallbackIcon: VolumeX },
    { text: 'I want my comfort item.', stickerSrc: '/assets/stickers/teddy_bear.png', fallbackIcon: Star },
    { text: 'Can we go home?', stickerSrc: '/assets/stickers/home_house.png', fallbackIcon: Home },
  ];

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
        className={`bg-[#FFFDF7] dark:bg-slate-900 w-full ${activeTab === 'sound' ? 'max-w-4xl' : 'max-w-lg'} max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-500/60 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Theme Signature Amber Gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
              {headerInfo.stickerSrc ? (
                <img
                  src={headerInfo.stickerSrc}
                  alt={headerInfo.title}
                  className="w-9 h-9 object-contain drop-shadow-xs select-none pointer-events-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const iconElem = e.currentTarget.parentElement?.querySelector('.header-fallback-icon') as HTMLElement;
                    if (iconElem) iconElem.style.display = 'block';
                  }}
                />
              ) : null}
              <HeaderIcon className={`w-6 h-6 text-white header-fallback-icon ${headerInfo.stickerSrc ? 'hidden' : 'block'}`} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-2xs">{t(headerInfo.title)}</h2>
              <p className="text-xs text-amber-100 font-medium">{t(headerInfo.subtitle)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              stopSoundscape();
              setShowCopingToolkit(false);
            }}
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-2xl bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center backdrop-blur-xs focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Selector - only shown when not on sound tool */}
        {activeTab !== 'sound' && (
          <div className="flex border-b-2 border-amber-200/80 bg-[#FFF9EE] p-2 gap-2 overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'breathing', label: 'Deep Breathing', stickerSrc: '/assets/stickers/breathing_cloud.png', icon: Wind },
              { id: 'strategies', label: 'Calm Tools', stickerSrc: '/assets/stickers/fav_love_heart.png', icon: Heart },
              { id: 'timer', label: 'Break Timer', stickerSrc: '/assets/stickers/timer_clock.png', icon: Timer },
              { id: 'grounding', label: '5-4-3-2-1', stickerSrc: '/assets/stickers/eye_see.png', icon: Eye },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playChime('tap');
                    selectTab(tab.id as any);
                  }}
                  className={`py-2 px-3 sm:px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                      : 'bg-white/80 hover:bg-amber-100/70 text-slate-700 border border-amber-200/70'
                  }`}
                >
                  <img
                    src={tab.stickerSrc}
                    alt={tab.label}
                    className="w-5 h-5 object-contain select-none pointer-events-none drop-shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const icon = e.currentTarget.parentElement?.querySelector('.tab-fallback-icon');
                      if (icon) (icon as HTMLElement).style.display = 'block';
                    }}
                  />
                  <TabIcon className="w-4 h-4 shrink-0 tab-fallback-icon hidden" />
                  <span>{t(tab.label)}</span>
                </button>
              );
            })}
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
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-300 flex items-center justify-center shadow-lg transition-transform duration-1000 ease-in-out border-4 border-white ring-8 ring-amber-200/50"
                style={{ transform: `scale(${breatheScale})` }}
              >
                <div className="w-34 h-34 rounded-full bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-amber-950 shadow-inner">
                  <img
                    src="/assets/stickers/calm_wind.png"
                    alt="Breathe"
                    className="w-10 h-10 object-contain drop-shadow-2xs select-none pointer-events-none mb-1 animate-pulse"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-black text-sm sm:text-base tracking-tight leading-tight text-center text-amber-950">
                    {getBreathePhaseText(breathePhase)}
                  </span>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-xs sm:text-sm mt-6 max-w-xs text-center leading-relaxed">
                {t('Follow the gentle bubble. Breathe in slowly through your nose, hold, and breathe out like blowing a dandelion.')}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setShowEditCalmModal(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black border-2 border-amber-200/90 flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-800" />
                  <span>{t('Customize Pace')} ({inhaleSec}s - {holdSec}s - {exhaleSec}s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setBreathingAudioEnabled((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black border-2 flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    breathingAudioEnabled
                      ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border-amber-600 shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200/90'
                  }`}
                  aria-label={breathingAudioEnabled ? t('Mute chime cue') : t('Enable chime cue')}
                >
                  {breathingAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-950" /> : <VolumeX className="w-3.5 h-3.5 text-amber-800" />}
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
                  <h3 className="text-sm sm:text-base font-black text-[#2D241E]">{t('Calming Coping Strategies')}</h3>
                  <p className="text-xs text-[#7A4D05] font-semibold">{t('Pick a comforting activity to regulate your nervous system')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setShowEditCalmModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black border-2 border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-800" />
                  <span>{t('Customize')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {calmStrategies.map((strat) => (
                  <div
                    key={strat.id}
                    className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border-2 border-amber-200/80 hover:border-amber-300 transition-all flex flex-col justify-between gap-2.5 shadow-2xs group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-11 h-11 p-1 rounded-2xl bg-[#FFF2D4] border border-[#FED676] shadow-2xs group-hover:scale-105 transition shrink-0 flex items-center justify-center">
                        <RoutineStickerIcon emoji={strat.emoji} title={strat.title} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-black text-slate-800 truncate">{t(strat.title)}</p>
                          {strat.durationMin && (
                            <span className="text-[10px] font-black text-amber-950 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-md shrink-0">
                              {strat.durationMin}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight font-medium">
                          {t(strat.instruction)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-100">
                      <button
                        onClick={() => {
                          speak(strat.instruction ? t(strat.instruction) : t(strat.title));
                          playChime('tap');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t('Read')}</span>
                      </button>
                      {strat.durationMin && (
                        <button
                          onClick={() => {
                            startBreakTimer(strat.durationMin || 3);
                            selectTab('timer');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Timer className="w-3.5 h-3.5 text-white" />
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
              <div className="text-5xl sm:text-6xl font-black text-[#2D241E] my-4 font-mono tracking-wider drop-shadow-2xs">
                {Math.floor(timerSecondsLeft / 60)}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs bg-amber-100/80 h-4 rounded-full overflow-hidden mb-6 border-2 border-amber-300 shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 h-full transition-all duration-1000 rounded-full"
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
                    className={`px-4 py-2 rounded-2xl font-black text-sm border-2 transition-all cursor-pointer active:scale-95 ${
                      timerMinutes === mins && isTimerRunning
                        ? 'bg-[#FED676] text-[#2D241E] border-amber-400 shadow-xs ring-2 ring-amber-300'
                        : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200/90'
                    }`}
                  >
                    {mins} {t('min')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    playChime('tap');
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  className={`px-6 py-2.5 rounded-2xl font-black text-sm shadow-[0_3px_0_0_#B45309] transition-all active:translate-y-0.5 active:shadow-none cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white'
                  }`}
                >
                  {isTimerRunning ? t('Pause Timer') : t('Start Timer')}
                </button>
                <button
                  onClick={() => {
                    playChime('tap');
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(timerMinutes * 60);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-sm border-2 border-amber-200/90 cursor-pointer active:scale-95"
                >
                  {t('Reset')}
                </button>
              </div>

              {/* Quick shortcut to open Full Visual Pie Clock */}
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setShowPieTimerModal(true);
                }}
                className="mt-6 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FFF2D4] hover:bg-[#FED676]/60 border-2 border-[#FED676] text-amber-950 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <img src="/assets/stickers/timer_clock.png" alt="Pie Clock" className="w-5 h-5 object-contain drop-shadow-2xs select-none" />
                <span>{t('Open Full Pie Clock')}</span>
              </button>
            </div>
          )}

          {/* TAB 3: GROUNDING */}
          {activeTab === 'grounding' && (
            <div className="w-full max-w-md flex flex-col items-center mx-auto text-center py-2">
              <div className="w-20 h-20 rounded-3xl bg-[#FFF2D4] border-2 border-[#FED676] flex items-center justify-center p-2 mb-3 shadow-xs">
                {groundingItems[groundingStep].stickerSrc ? (
                  <img
                    src={groundingItems[groundingStep].stickerSrc}
                    alt={groundingItems[groundingStep].title}
                    className="w-14 h-14 object-contain drop-shadow-xs select-none pointer-events-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const iconElem = e.currentTarget.parentElement?.querySelector('.grounding-fallback-icon') as HTMLElement;
                      if (iconElem) iconElem.style.display = 'block';
                    }}
                  />
                ) : null}
                {React.createElement(groundingItems[groundingStep].fallbackIcon, {
                  className: `w-10 h-10 text-amber-800 grounding-fallback-icon ${groundingItems[groundingStep].stickerSrc ? 'hidden' : 'block'}`
                })}
              </div>
              <h3 className="text-lg font-black text-[#2D241E] mb-1">
                {t(groundingItems[groundingStep].title)}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mb-6 max-w-sm leading-relaxed">
                {t(groundingItems[groundingStep].prompt)}
              </p>

              <div className="flex items-center gap-2.5 mb-6">
                {groundingItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playChime('tap');
                      setGroundingStep(idx);
                    }}
                    className={`w-9 h-9 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      groundingStep === idx
                        ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {item.step}
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
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
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
          <div className="bg-[#FFF9EE] p-3 sm:p-4 border-t-2 border-amber-200/80">
            <div className="text-[11px] font-black text-amber-950 uppercase tracking-wider mb-2 text-center">
              {t('Things you can ask for right now:')}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickNeeds.map((need, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Speak phrase: ${need.text}`}
                  onClick={() => {
                    speak(t(need.text));
                    playChime('tap');
                  }}
                  className="px-3.5 py-2 min-h-[48px] rounded-2xl bg-white hover:bg-amber-100/70 border-2 border-amber-200/90 text-[#2D241E] font-black text-xs sm:text-sm shadow-2xs hover:shadow-xs hover:border-amber-400 active:scale-95 cursor-pointer flex items-center gap-2.5 transition-all focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  <img
                    src={need.stickerSrc}
                    alt={need.text}
                    className="w-6 h-6 object-contain drop-shadow-2xs shrink-0 select-none pointer-events-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const icon = e.currentTarget.parentElement?.querySelector('.need-fallback-icon');
                      if (icon) (icon as HTMLElement).style.display = 'block';
                    }}
                  />
                  <need.fallbackIcon className="w-4 h-4 text-amber-700 shrink-0 need-fallback-icon hidden" aria-hidden="true" />
                  <span>{t(need.text)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
