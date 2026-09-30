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
  Sliders
} from 'lucide-react';
import { 
  playChime, 
  playSoundscape, 
  stopSoundscape, 
  setSoundscapeVolume, 
  subscribeToSoundscape, 
  getActiveSoundscape, 
  SOUNDSCAPES_CATALOG 
} from '../utils/audio';
import { SoundscapeId } from '../types';

export const CopingToolkitModal: React.FC = () => {
  const {
    showCopingToolkit,
    setShowCopingToolkit,
    speak,
    childProfile,
    isPremium,
    triggerUpgrade,
    activateEmergencyMode,
    setShowFivePointModal,
    setShowPieTimerModal,
    setShowFidgetModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'breathing' | 'timer' | 'grounding' | 'sound'>('breathing');

  // Breathing state
  const [breathePhase, setBreathePhase] = useState<'Inhale...' | 'Hold...' | 'Exhale...'>('Inhale...');
  const [breatheScale, setBreatheScale] = useState(1);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(3);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Soundscape state
  const [activeSoundId, setActiveSoundId] = useState<SoundscapeId | null>(() => getActiveSoundscape());
  const [soundVolume, setSoundVolume] = useState<number>(0.40);
  const [soundFilter, setSoundFilter] = useState<'all' | 'nature' | 'noise' | 'focus' | 'special_interest' | 'ambient'>('all');

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);

  // Subscribe to live soundscape changes
  useEffect(() => {
    const unsub = subscribeToSoundscape((id) => {
      setActiveSoundId(id);
    });
    return () => unsub();
  }, []);

  // Breathing loop
  useEffect(() => {
    if (!showCopingToolkit || activeTab !== 'breathing') return;

    let isSubscribed = true;
    const cycle = async () => {
      while (isSubscribed) {
        setBreathePhase('Inhale...');
        setBreatheScale(1.4);
        playChime('breathe');
        await new Promise((r) => setTimeout(r, 4000));
        if (!isSubscribed) break;

        setBreathePhase('Hold...');
        await new Promise((r) => setTimeout(r, 3000));
        if (!isSubscribed) break;

        setBreathePhase('Exhale...');
        setBreatheScale(1.0);
        await new Promise((r) => setTimeout(r, 4000));
        if (!isSubscribed) break;

        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    cycle();

    return () => {
      isSubscribed = false;
    };
  }, [showCopingToolkit, activeTab]);

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
      speak('Break timer is complete. Great job taking care of yourself.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Clean up soundscapes on unmount
  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  if (!showCopingToolkit) return null;

  const startBreakTimer = (mins: number) => {
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerRunning(true);
    playChime('tap');
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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={() => setShowCopingToolkit(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-4 border-teal-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-teal-50 border-b border-teal-100">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🛋️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-teal-950">Calm & Coping Toolkit</h2>
              <p className="text-xs text-teal-700 font-medium">Safe space to pause, breathe, and reset</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSoundscape();
              setShowCopingToolkit(false);
            }}
            className="p-2 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 active:scale-95 transition-all cursor-pointer"
            aria-label="Close toolkit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'breathing'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Deep Breathing</span>
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'timer'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Break Timer</span>
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'grounding'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>5-4-3-2-1 Grounding</span>
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sound'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Sensory Sounds</span>
          </button>
        </div>

        {/* Quick Tools Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-teal-50/50 border-b border-teal-100 overflow-x-auto">
          <span className="text-[10px] font-black uppercase text-teal-800 shrink-0">More Tools:</span>
          <button
            onClick={() => {
              setShowFidgetModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0"
          >
            <span>🫧</span>
            <span>Digital Fidgets</span>
          </button>
          <button
            onClick={() => {
              setShowPieTimerModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0"
          >
            <span>⏰</span>
            <span>Pie Clock</span>
          </button>
          <button
            onClick={() => {
              setShowFivePointModal(true);
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-all cursor-pointer shrink-0"
          >
            <span>🌡️</span>
            <span>5-Point Scale</span>
          </button>
          <button
            onClick={() => {
              setShowCopingToolkit(false);
              activateEmergencyMode();
              playChime('tap');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs hover:bg-red-700 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <span>🚨</span>
            <span>Emergency Mode</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          {/* TAB 1: BREATHING */}
          {activeTab === 'breathing' && (
            <div className="flex flex-col items-center justify-center py-4 w-full">
              <div
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-teal-300 via-cyan-200 to-sky-300 flex items-center justify-center shadow-lg transition-transform duration-1000 ease-in-out border-4 border-white"
                style={{ transform: `scale(${breatheScale})` }}
              >
                <div className="w-32 h-32 rounded-full bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-teal-900 shadow-inner">
                  <Wind className="w-8 h-8 text-teal-600 mb-1" />
                  <span className="font-black text-lg sm:text-xl tracking-tight">
                    {breathePhase}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 font-medium text-sm mt-8 max-w-xs">
                Follow the gentle bubble. Breathe in slowly through your nose, hold, and breathe out like blowing a dandelion.
              </p>
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
                    {mins} min
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
                  {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(timerMinutes * 60);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GROUNDING */}
          {activeTab === 'grounding' && (
            <div className="w-full max-w-md flex flex-col items-center">
              <span className="text-5xl mb-2">{groundingItems[groundingStep].emoji}</span>
              <h3 className="text-lg font-black text-slate-800 mb-1">
                {groundingItems[groundingStep].title}
              </h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                {groundingItems[groundingStep].prompt}
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
                    speak('Grounding exercise complete. You are doing great.');
                    setGroundingStep(0);
                  }
                }}
                className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {groundingStep < groundingItems.length - 1 ? 'Next Step' : 'All Finished!'}
              </button>
            </div>
          )}

          {/* TAB 4: SENSORY ROOM SOUNDSCAPES */}
          {activeTab === 'sound' && (
            <div className="w-full flex flex-col items-center py-1 text-left">
              {/* Header Info */}
              <div className="w-full mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span>Sensory Room Soundscapes</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                      {activeSoundId ? '1 Active' : 'Offline Audio'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Procedural acoustic masking & soothing sensory frequencies. 100% offline.
                  </p>
                </div>

                {activeSoundId && (
                  <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                    <span className="text-xs font-bold text-teal-800">Vol: {Math.round(soundVolume * 100)}%</span>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSoundVolume(val);
                        setSoundscapeVolume(val);
                      }}
                      className="w-20 accent-teal-600 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        stopSoundscape();
                        playChime('tap');
                      }}
                      className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>

              {/* Free vs Premium Notice if Basic */}
              {!isPremium && (
                <div className="w-full p-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-amber-900 font-medium">
                      2 basic sounds included free. 15 specialized sensory soundscapes unlock with <strong>Lumina Premium</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerUpgrade('Unlock All 17 Sensory Room Ambient Soundscapes')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs"
                  >
                    30-Day Free Trial
                  </button>
                </div>
              )}

              {/* Soundscape Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 w-full shrink-0">
                {[
                  { id: 'all', label: 'All Sounds (16)', emoji: '✨' },
                  { id: 'nature', label: 'Nature', emoji: '🌿' },
                  { id: 'noise', label: 'Noise & Masking', emoji: '📻' },
                  { id: 'focus', label: 'Focus & Travel', emoji: '🚗' },
                  { id: 'special_interest', label: 'Trains & Fantasy', emoji: '🚂' },
                  { id: 'ambient', label: 'Ambience', emoji: '🏙️' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSoundFilter(cat.id as any);
                      playChime('tap');
                    }}
                    className={`px-2.5 py-1 rounded-xl font-black text-[11px] transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      soundFilter === cat.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Soundscape Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-h-[50vh] overflow-y-auto pr-1">
                {SOUNDSCAPES_CATALOG.filter(
                  (item) => soundFilter === 'all' || item.category === soundFilter
                ).map((item) => {
                  const isPlaying = activeSoundId === item.id;
                  const isLocked = item.isPremium && !isPremium;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isLocked) {
                          triggerUpgrade(`Unlock ${item.name} & Full Sensory Room Library`);
                          return;
                        }
                        if (isPlaying) {
                          stopSoundscape();
                          playChime('tap');
                        } else {
                          playSoundscape(item.id, soundVolume);
                          playChime('tap');
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isPlaying
                          ? 'border-teal-500 bg-teal-50/80 shadow-md ring-2 ring-teal-300'
                          : isLocked
                          ? 'border-slate-200 bg-slate-50/60 opacity-85 hover:border-amber-300'
                          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                            {item.emoji}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-black text-slate-800 text-xs sm:text-sm">
                                {item.name}
                              </h4>
                              {item.isPremium ? (
                                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>Premium</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                                  Free
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block line-clamp-1">
                              {item.tags.join(' • ')}
                            </span>
                          </div>
                        </div>

                        {/* Action status pill */}
                        <div>
                          {isLocked ? (
                            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800 flex items-center gap-1 text-[11px] font-bold">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : isPlaying ? (
                            <span className="px-2 py-1 rounded-xl bg-teal-600 text-white flex items-center gap-1 text-[11px] font-black animate-pulse">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Playing</span>
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-bold">
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {item.description}
                      </p>
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
            Things you can ask for right now:
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
                onClick={() => speak(need.text)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{need.emoji}</span>
                <span>{need.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
