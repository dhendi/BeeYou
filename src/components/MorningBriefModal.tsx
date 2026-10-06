import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Volume2, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  X, 
  Check, 
  Heart, 
  Smile, 
  Compass,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime, speakText } from '../utils/audio';
import { EmotionType } from '../types';
import { fetchLiveWeather, LiveWeatherData, DEFAULT_WEATHER_DATA } from '../utils/weather';

const MOOD_OPTIONS: { id: EmotionType; label: string; emoji: string; response: string }[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', response: 'Wonderful! We are glad you feel happy today.' },
  { id: 'calm', label: 'Calm', emoji: '😌', response: 'Peaceful and steady. A great way to start.' },
  { id: 'excited', label: 'Excited', emoji: '🤩', response: 'So much energy! Lots of fun things to explore.' },
  { id: 'tired', label: 'Sleepy', emoji: '🥱', response: 'Take it slow and gentle this morning. No rush.' },
  { id: 'worried', label: 'Unsure', emoji: '😟', response: 'You are safe. We will do each step together.' },
];

export const MorningBriefModal: React.FC = () => {
  const {
    showMorningBrief,
    setShowMorningBrief,
    userRole,
    isParentMode,
    childProfile,
    routines,
    adventures,
    recordEmotion,
    awardStars,
    setChildView,
  } = useApp();

  const [weatherData, setWeatherData] = useState<LiveWeatherData>(DEFAULT_WEATHER_DATA);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<EmotionType | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);

  // Sync live weather when brief opens
  const loadWeather = async (force: boolean = false) => {
    setIsRefreshingWeather(true);
    try {
      if (force) {
        localStorage.removeItem('beeyou_live_weather_cache');
      }
      const data = await fetchLiveWeather();
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather sync fallback', err);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  useEffect(() => {
    if (showMorningBrief) {
      loadWeather();
    }
  }, [showMorningBrief]);

  // Today's Date formatted warmly
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Determine Greeting based on hour
  const currentHour = new Date().getHours();
  const greetingGreeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Find key scheduled activity of today
  const keyRoutine = routines[0];
  const firstThen = keyRoutine?.firstThen;
  const keyAdventure = adventures[0];

  const keyActivityTitle = firstThen
    ? `${firstThen.first} → then ${firstThen.then}`
    : keyAdventure?.title || keyRoutine?.title || 'Play & explore routines';
  const keyActivityEmoji = firstThen
    ? `${firstThen.firstEmoji} ${firstThen.thenEmoji}`
    : keyAdventure?.emoji || keyRoutine?.emoji || '⭐';
  const keyActivityTime = keyRoutine?.time || '10:00 AM';

  const handleHearBrief = () => {
    playChime('speak');
    const briefText = `${greetingGreeting}, ${childProfile.name}! Today is ${todayFormatted}. The weather is ${weatherData.condition} at ${weatherData.tempDisplay}. Comfort tip: ${weatherData.sensoryTip}. Today's key activity is ${keyActivityTitle}. Have a gentle, wonderful day!`;
    speakText(briefText);
  };

  const handleSelectMood = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood.id);
    setMoodFeedback(mood.response);
    recordEmotion(mood.id, 'Morning Check-In');
    playChime('star');
    speakText(`Recorded: Feeling ${mood.label}. ${mood.response}`);
  };

  const handleStartDay = () => {
    playChime('complete');
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#38bdf8', '#34d399', '#f472b6'],
      });
    } catch (e) {
      // fallback
    }

    // Award +1 morning login star!
    awardStars(1);

    // Save date in localStorage so it only opens once a day automatically
    try {
      localStorage.setItem('beeyou_last_brief_date', new Date().toDateString());
    } catch (e) {
      // ignore
    }

    setShowMorningBrief(false);
  };

  if (!showMorningBrief || userRole === 'caregiver' || isParentMode) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Morning Brief"
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white border-3 border-amber-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-4 sm:p-6 text-amber-950 relative flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-2xl shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/15 text-amber-950 px-2 py-0.5 rounded-full">
                  Daily Morning Brief
                </span>
                <span className="text-xs font-bold text-amber-900/80">
                  {todayFormatted}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
                {greetingGreeting}, {childProfile.name}! 🌅
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHearBrief}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/80 hover:bg-white text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Hear morning brief spoken aloud"
              aria-label="Hear morning brief"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Read Aloud</span>
            </button>

            <button
              onClick={() => {
                setShowMorningBrief(false);
                playChime('tap');
              }}
              className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-amber-950 transition-all cursor-pointer"
              aria-label="Close morning brief"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* 1. REAL-TIME NON-EDITABLE WEATHER & SENSORY COMFORT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Today's Weather & Sensory Comfort
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
              <button
                type="button"
                onClick={() => loadWeather(true)}
                disabled={isRefreshingWeather}
                title="Refresh live weather data"
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingWeather ? 'animate-spin text-amber-600' : ''}`} />
                <span>{isRefreshingWeather ? 'Syncing...' : weatherData.locationName}</span>
              </button>
            </div>

            {/* Live Weather Card - Non-editable */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${weatherData.bgGradient} border-2 border-amber-200/80 flex items-start gap-3.5 transition-all shadow-xs`}>
              <span className="text-4xl sm:text-5xl shrink-0 mt-0.5">
                {weatherData.emoji}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                      {weatherData.condition}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {weatherData.locationName} • Updated {weatherData.lastUpdated}
                    </p>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white/90 text-slate-800 shadow-2xs border border-slate-200/60">
                    {weatherData.tempDisplay}
                  </span>
                </div>
                <div className="mt-2.5 p-2 rounded-xl bg-white/80 border border-amber-100/80">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    💡 <strong className="text-amber-950 font-bold">Sensory Comfort Tip:</strong> {weatherData.sensoryTip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ONE KEY SCHEDULED ACTIVITY */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Key Activity for Today
            </span>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {keyActivityEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {keyActivityTime}
                    </span>
                    <span className="text-xs text-indigo-950 font-semibold">
                      Main Focus
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base mt-0.5">
                    {keyActivityTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Clear, calm steps prepared so you know exactly what is happening.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMorningBrief(false);
                  setChildView('my-day');
                  playChime('tap');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. OPTIONAL MOOD EMOJI SELECTION */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>How are you feeling this morning? (Optional)</span>
              </span>
              {selectedMood && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Recorded!
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => handleSelectMood(mood)}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 text-rose-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{mood.emoji}</span>
                    <span className="font-black text-[11px] text-center">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Gentle Mood Feedback Response */}
            {moodFeedback && (
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center gap-2 text-xs text-rose-950 animate-in fade-in">
                <Smile className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold">{moodFeedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Star Award & Start Button */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Earn 1 Morning Star Coin</span>
          </div>

          <button
            type="button"
            onClick={handleStartDay}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <span>Ready for Today!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
