import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  Wind, 
  Volume2, 
  Calendar, 
  Star, 
  ArrowRight, 
  X, 
  Check, 
  Heart, 
  Smile, 
  Compass,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { playChime, speakText } from '../utils/audio';
import { EmotionType } from '../types';
import { t, getLanguage } from '../services/translator';
import { 
  fetchLiveWeather, 
  LiveWeatherData, 
  DEFAULT_WEATHER_DATA,
  TemperatureUnit,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  getTemperatureDescription,
  formatTemperatureDisplay,
  getSensoryTip
} from '../utils/weather';
import { 
  MoodHappySticker, 
  MoodCalmSticker, 
  MoodExcitedSticker, 
  MoodSleepySticker, 
  MoodUnsureSticker,
  RoutineStickerIcon,
  AlarmClockSticker,
  OutdoorSunSticker,
  EveningMoonSticker
} from './icons/JournalStickers';

const MOOD_OPTIONS: { id: EmotionType; label: string; Sticker: React.FC<{ className?: string }>; response: string }[] = [
  { id: 'happy', label: 'Happy', Sticker: MoodHappySticker, response: 'Wonderful! We are glad you feel happy today.' },
  { id: 'calm', label: 'Calm', Sticker: MoodCalmSticker, response: 'Peaceful and steady. A great way to start.' },
  { id: 'excited', label: 'Excited', Sticker: MoodExcitedSticker, response: 'So much energy! Lots of fun things to explore.' },
  { id: 'tired', label: 'Sleepy', Sticker: MoodSleepySticker, response: 'Take it slow and gentle right now. No rush.' },
  { id: 'worried', label: 'Unsure', Sticker: MoodUnsureSticker, response: 'You are safe. We will do each step together.' },
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
    setChildView,
    settings,
    updateSettings,
  } = useApp();

  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    return settings?.temperatureUnit || (localStorage.getItem('beeyou_temperature_unit') as TemperatureUnit) || 'F';
  });
  const [isEditingTemp, setIsEditingTemp] = useState<boolean>(false);
  const [tempInputValue, setTempInputValue] = useState<string>('');

  const [weatherData, setWeatherData] = useState<LiveWeatherData>(() => ({
    ...DEFAULT_WEATHER_DATA,
    tempDisplay: formatTemperatureDisplay(
      DEFAULT_WEATHER_DATA.tempF,
      settings?.temperatureUnit || (localStorage.getItem('beeyou_temperature_unit') as TemperatureUnit) || 'F'
    ),
  }));
  const [isRefreshingWeather, setIsRefreshingWeather] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<EmotionType | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);

  // Re-render when language changes
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handleLangChange = () => setLangTick((n) => n + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  // Keep tempUnit in sync if settings update externally
  useEffect(() => {
    if (settings?.temperatureUnit && settings.temperatureUnit !== tempUnit) {
      setTempUnit(settings.temperatureUnit);
      setWeatherData((prev) => ({
        ...prev,
        tempDisplay: formatTemperatureDisplay(prev.tempF, settings.temperatureUnit!),
      }));
    }
  }, [settings?.temperatureUnit]);

  // Sync live weather when brief opens
  const loadWeather = async (force: boolean = false) => {
    setIsRefreshingWeather(true);
    try {
      if (force) {
        localStorage.removeItem('beeyou_live_weather_cache');
      }
      const data = await fetchLiveWeather(tempUnit);
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather sync fallback', err);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  const handleUnitChange = (newUnit: TemperatureUnit) => {
    if (newUnit === tempUnit) return;
    setTempUnit(newUnit);
    playChime('tap');
    try {
      localStorage.setItem('beeyou_temperature_unit', newUnit);
    } catch {}
    if (updateSettings) {
      updateSettings({ temperatureUnit: newUnit });
    }
    setWeatherData((prev) => ({
      ...prev,
      tempDisplay: formatTemperatureDisplay(prev.tempF, newUnit),
    }));
  };

  const handleSaveCustomTemp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempInputValue);
    if (isNaN(val)) {
      setIsEditingTemp(false);
      return;
    }

    playChime('tap');
    let newTempF = Math.round(val);
    if (tempUnit === 'C') {
      newTempF = celsiusToFahrenheit(val);
    }

    const newTempC = fahrenheitToCelsius(newTempF);
    const newDisplay = formatTemperatureDisplay(newTempF, tempUnit);
    const newSensoryTip = getSensoryTip(newTempF, weatherData.weatherCode ?? 0, weatherData.windMph);

    setWeatherData((prev) => {
      const updated: LiveWeatherData = {
        ...prev,
        tempF: newTempF,
        tempC: newTempC,
        tempDisplay: newDisplay,
        sensoryTip: newSensoryTip,
      };
      try {
        localStorage.setItem(
          'beeyou_live_weather_cache',
          JSON.stringify({ timestamp: Date.now(), data: updated })
        );
      } catch {}
      return updated;
    });

    setIsEditingTemp(false);
  };

  useEffect(() => {
    if (showMorningBrief) {
      loadWeather();
    }
  }, [showMorningBrief]);

  // Today's Date formatted warmly
  // Today's Date formatted warmly in active locale
  const activeLang = settings?.language || getLanguage() || 'en';
  const dateLocale = activeLang === 'en' ? 'en-US' : (activeLang === 'fr_ca' ? 'fr-CA' : activeLang);
  const todayFormatted = new Intl.DateTimeFormat(dateLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Determine Greeting, Badges, and Icons dynamically based on time of day
  const currentHour = new Date().getHours();
  let greetingKey = 'Good morning';
  let timeBadgeKey = 'Daily Morning Brief';
  let feelingQuestionKey = 'How are you feeling this morning? (Optional)';
  let checkInLabelKey = 'Morning Check-In';

  if (currentHour >= 5 && currentHour < 12) {
    greetingKey = 'Good morning';
    timeBadgeKey = 'Daily Morning Brief';
    feelingQuestionKey = 'How are you feeling this morning? (Optional)';
    checkInLabelKey = 'Morning Check-In';
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingKey = 'Good afternoon';
    timeBadgeKey = 'Daily Afternoon Brief';
    feelingQuestionKey = 'How are you feeling this afternoon? (Optional)';
    checkInLabelKey = 'Afternoon Check-In';
  } else if (currentHour >= 17 && currentHour < 21) {
    greetingKey = 'Good evening';
    timeBadgeKey = 'Daily Evening Brief';
    feelingQuestionKey = 'How are you feeling this evening? (Optional)';
    checkInLabelKey = 'Evening Check-In';
  } else {
    // Late night / early hours (9:00 PM - 4:59 AM)
    greetingKey = 'Good evening';
    timeBadgeKey = 'Daily Evening Brief';
    feelingQuestionKey = 'How are you feeling tonight? (Optional)';
    checkInLabelKey = 'Evening Check-In';
  }

  const renderTimeHeaderIcon = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return <AlarmClockSticker size={28} className="w-7 h-7 drop-shadow-xs" />;
    } else if (currentHour >= 12 && currentHour < 17) {
      return <OutdoorSunSticker size={28} className="w-7 h-7 drop-shadow-xs" />;
    } else {
      return <EveningMoonSticker size={28} className="w-7 h-7 drop-shadow-xs" />;
    }
  };

  // Gracefully format greeting with child's name if present (avoids "Good morning, !")
  const childName = childProfile?.name?.trim();
  const greetingTitle = childName ? `${t(greetingKey)}, ${childName}!` : `${t(greetingKey)}!`;

  // Find key scheduled activity of today
  const keyRoutine = routines[0];
  const firstThen = keyRoutine?.firstThen;
  const keyAdventure = adventures[0];

  const keyActivityTitle = firstThen
    ? `${t(firstThen.first)} → ${t('then')} ${t(firstThen.then)}`
    : t(keyAdventure?.title || keyRoutine?.title || 'Play & explore routines');
  const keySingleEmoji = firstThen?.firstEmoji || keyRoutine?.emoji || keyAdventure?.emoji || '⭐';
  const keySingleTitle = firstThen?.first ? t(firstThen.first) : (keyRoutine?.title ? t(keyRoutine.title) : (keyAdventure?.title ? t(keyAdventure.title) : ''));
  const keyActivityTime = keyRoutine?.time || '10:00 AM';

  const handleHearBrief = () => {
    playChime('speak');
    const tempValue = tempUnit === 'C' ? fahrenheitToCelsius(weatherData.tempF) : weatherData.tempF;
    const tempUnitWord = tempUnit === 'C' ? t('degrees Celsius') : t('degrees Fahrenheit');
    const tempDesc = t(getTemperatureDescription(weatherData.tempF));
    const briefText = `${greetingTitle} ${t('Today is')} ${todayFormatted}. ${t('The weather is')} ${t(weatherData.condition)} ${t('at')} ${tempValue} ${tempUnitWord}, ${tempDesc}. ${t('Comfort tip:')} ${t(weatherData.sensoryTip)}. ${t("Today's key activity is")} ${keyActivityTitle}. ${t('Have a gentle, wonderful day!')}`;
    speakText(briefText);
  };

  const handleSelectMood = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood.id);
    setMoodFeedback(t(mood.response));
    recordEmotion(mood.id, t(checkInLabelKey));
    playChime('star');
    speakText(`${t('Recorded')}: ${t('Feeling')} ${t(mood.label)}. ${t(mood.response)}`);
  };

  const handleStartDay = () => {
    playChime('complete');

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
      aria-label={t(timeBadgeKey)}
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white border-3 border-amber-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-4 sm:p-6 text-amber-950 relative flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              {renderTimeHeaderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/15 text-amber-950 px-2 py-0.5 rounded-full">
                  {t(timeBadgeKey)}
                </span>
                <span className="text-xs font-bold text-amber-900/80">
                  {todayFormatted}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
                {greetingTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHearBrief}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/80 hover:bg-white text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title={t('Read Aloud')}
              aria-label={t('Read Aloud')}
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{t('Read Aloud')}</span>
            </button>

            <button
              onClick={() => {
                setShowMorningBrief(false);
                playChime('tap');
              }}
              className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-amber-950 transition-all cursor-pointer"
              aria-label={`Close ${t(timeBadgeKey).toLowerCase()}`}
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
                  {t("Today's Weather & Sensory Comfort")}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {t('Live Sync')}
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
                <span>{isRefreshingWeather ? t('Syncing...') : weatherData.locationName}</span>
              </button>
            </div>

            {/* Live Weather Card - Non-editable */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${weatherData.bgGradient} border-2 border-amber-200/80 flex items-start gap-3.5 transition-all shadow-xs`}>
              <div className="shrink-0 mt-0.5 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                {weatherData.stickerSrc ? (
                  <img
                    src={weatherData.stickerSrc}
                    alt={t(weatherData.condition)}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain select-none pointer-events-none drop-shadow-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl">
                    {weatherData.emoji}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                      {t(weatherData.condition)}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {weatherData.locationName} • {t('Updated')} {weatherData.lastUpdated}
                    </p>
                  </div>

                  {/* Interactive Editable Temperature Pill (Fahrenheit <-> Celsius) */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow-2xs border border-amber-200/90 hover:border-amber-400 transition-all self-start sm:self-center shrink-0">
                    {isEditingTemp ? (
                      <form onSubmit={handleSaveCustomTemp} className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          value={tempInputValue}
                          onChange={(e) => setTempInputValue(e.target.value)}
                          className="w-14 px-1.5 py-0.5 text-xs font-black text-center bg-amber-50 border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          autoFocus
                          min={tempUnit === 'C' ? -40 : -40}
                          max={tempUnit === 'C' ? 60 : 140}
                        />
                        <span className="text-[11px] font-black text-slate-600">°{tempUnit}</span>
                        <button
                          type="submit"
                          className="p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                          title={t('Save temperature')}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingTemp(false)}
                          className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer active:scale-95"
                          title={t('Cancel')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const currentVal = tempUnit === 'C' ? fahrenheitToCelsius(weatherData.tempF) : weatherData.tempF;
                          setTempInputValue(String(currentVal));
                          setIsEditingTemp(true);
                        }}
                        className="group flex items-center gap-1 text-xs font-black text-slate-800 hover:text-amber-900 cursor-pointer transition-colors"
                        title={t('Click to edit temperature value')}
                      >
                        <span>
                          {tempUnit === 'C' ? `${fahrenheitToCelsius(weatherData.tempF)}°C` : `${weatherData.tempF}°F`} • {t(getTemperatureDescription(weatherData.tempF))}
                        </span>
                        <Edit2 className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-600 opacity-60 group-hover:opacity-100 transition-all" />
                      </button>
                    )}

                    <span className="w-px h-3.5 bg-slate-200" />

                    {/* F to C Unit Switcher */}
                    <div className="flex items-center bg-slate-100/90 rounded-full p-0.5 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => handleUnitChange('F')}
                        className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                          tempUnit === 'F'
                            ? 'bg-amber-400 text-amber-950 shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-800 font-bold'
                        }`}
                        title="Switch to Fahrenheit (°F)"
                        aria-label="Fahrenheit"
                      >
                        °F
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange('C')}
                        className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                          tempUnit === 'C'
                            ? 'bg-amber-400 text-amber-950 shadow-2xs font-black'
                            : 'text-slate-500 hover:text-slate-800 font-bold'
                        }`}
                        title="Switch to Celsius (°C)"
                        aria-label="Celsius"
                      >
                        °C
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 p-2 rounded-xl bg-white/80 border border-amber-100/80">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    💡 <strong className="text-amber-950 font-bold">{t('Sensory Comfort Tip:')}</strong> {t(weatherData.sensoryTip)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ONE KEY SCHEDULED ACTIVITY */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              {t('Key Activity for Today')}
            </span>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-yellow-50/60 to-amber-50/70 border-2 border-amber-200/90 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-white/90 border-2 border-amber-200/90 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
                  <RoutineStickerIcon emoji={keySingleEmoji} title={keySingleTitle} className="w-10 h-10 object-contain drop-shadow-2xs" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                      {keyActivityTime}
                    </span>
                    <span className="text-xs text-amber-950 font-bold">
                      {t('Main Focus')}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base mt-0.5 leading-snug">
                    {keyActivityTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {t('Clear, calm steps prepared so you know exactly what is happening.')}
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
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>{t('View')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. OPTIONAL MOOD EMOJI SELECTION */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{t(feelingQuestionKey)}</span>
              </span>
              {selectedMood && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {t('Recorded!')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                const Sticker = mood.Sticker;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => handleSelectMood(mood)}
                    className={`p-2 sm:p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 group ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300 text-amber-950 shadow-xs'
                        : 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-200 text-slate-800'
                    }`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sticker className="w-full h-full object-contain drop-shadow-2xs" />
                    </div>
                    <span className="font-black text-[11px] text-center">{t(mood.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Gentle Mood Feedback Response */}
            {moodFeedback && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-xs text-amber-950 animate-in fade-in">
                <Smile className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{t(moodFeedback)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Daily Check-In & Start Button */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{t(checkInLabelKey)}</span>
          </div>

          <button
            type="button"
            onClick={handleStartDay}
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <span>{currentHour >= 17 ? t('Ready for Tonight!') : t('Ready for Today!')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
