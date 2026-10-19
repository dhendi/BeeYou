import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Volume2, 
  VolumeX, 
  Sliders, 
  Check, 
  Play, 
  Eye, 
  Sparkles, 
  Heart, 
  Star,
  SlidersHorizontal,
  Zap,
  RotateCcw
} from 'lucide-react';
import { playChime, prewarmCoreAudioVocabulary } from '../../utils/audio';
import { triggerHaptic, setHapticsEnabled } from '../../services/haptics';
import { VOICE_PERSONAS, VoicePersona, getVoicePersonaById } from '../../data/voicePersonasData';
import { t } from '../../services/translator';

interface CaregiverVoiceStudioTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverVoiceStudioTab: React.FC<CaregiverVoiceStudioTabProps> = ({
  onShowNotification,
  onStartTour,
}) => {
  const {
    settings,
    updateSettings,
    speak,
    setShowAccessibilityModal,
    activeTheme,
    enabledFeatures,
    updateEnabledFeatures,
  } = useApp();

  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<'all' | 'free' | 'kids' | 'teens' | 'caring' | 'pro'>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const activePersona = getVoicePersonaById(settings.voicePersona);
  const systemVoiceObj = VOICE_PERSONAS.find((p) => p.id === 'system') || VOICE_PERSONAS[0];

  const handleAudition = async (persona: VoicePersona) => {
    setPlayingVoiceId(persona.id);
    try {
      await speak(persona.previewText, {
        voicePersona: persona.id,
      });
    } catch {
      onShowNotification('Audio preview unavailable.');
    } finally {
      setPlayingVoiceId(null);
    }
  };

  const handleSelectVoice = (persona: VoicePersona) => {
    updateSettings({ voicePersona: persona.id });
    if (settings.soundEffects) playChime('star');
    triggerHaptic('light', true);
    onShowNotification(`Voice persona updated to ${persona.name}`);
  };

  const filteredPersonas = VOICE_PERSONAS.filter((p) => {
    if (voiceCategoryFilter === 'all') return true;
    if (voiceCategoryFilter === 'free') return p.category === 'system';
    if (voiceCategoryFilter === 'kids') return p.category === 'kids';
    if (voiceCategoryFilter === 'teens') return p.category === 'teens';
    if (voiceCategoryFilter === 'caring') return p.category === 'caring_women' || p.category === 'caring_men';
    if (voiceCategoryFilter === 'pro') return p.category === 'pro_women' || p.category === 'pro_men';
    return true;
  });

  const isAacActive = enabledFeatures?.aacCommunication !== false && enabledFeatures?.aac !== false;

  const handleToggleAac = () => {
    const next = !isAacActive;
    updateEnabledFeatures({
      aacCommunication: next,
      aac: next,
    });
    try {
      localStorage.setItem('beeyou_aac_enabled', String(next));
    } catch {}
    if (next) {
      prewarmCoreAudioVocabulary(settings.voicePersona || 'puck', settings.language || 'en');
      onShowNotification('AAC communication enabled! Speech voices pre-warmed for instant playback.');
    } else {
      onShowNotification('AAC communication turned off. Interface simplified for child device.');
    }
    if (settings.soundEffects) playChime('tap');
    triggerHaptic('light', true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/60 border-2 border-amber-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎙️</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('Voice Studio & Sensory Preferences')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black">
                {VOICE_PERSONAS.length} {t('Personas')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
              {t('Personalize your child or dependent\'s speech persona with soft childlike, teenage, maternal caring, and calm professional neural voices. All audio is instantly cached for zero lag and zero extra API cost.')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setShowAccessibilityModal(true);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-amber-950 font-black text-xs sm:text-sm border-2 border-amber-300 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>{t('Open Full Preferences Modal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AAC Feature Master Switch Banner */}
      <div className={`rounded-3xl border-2 p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isAacActive
          ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20'
          : 'bg-stone-50 border-stone-300 dark:bg-stone-900/40'
      }`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs border ${
            isAacActive ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-stone-200 border-stone-300 text-stone-600'
          }`}>
            {isAacActive ? '🗣️' : '🔇'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                {t('AAC Speech & Communication Board')}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isAacActive ? 'bg-emerald-200 text-emerald-950' : 'bg-stone-200 text-stone-700'
              }`}>
                {isAacActive ? t('Active') : t('Disabled / Hidden')}
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {isAacActive
                ? t('Speech communication tiles are visible on the child device. Turn off if not needed to lighten device load.')
                : t('Turned off. Speech tiles and voice pre-loading are removed from child device for lighter, faster operation.')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAac}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center justify-center gap-2 border ${
            isAacActive
              ? 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
          }`}
        >
          <span>{isAacActive ? t('Turn Off AAC (Simplify Device)') : t('Turn On AAC (Load Voices)')}</span>
        </button>
      </div>

      {/* Active Voice Spotlight Banner */}
      <div className="rounded-3xl bg-white border-2 border-amber-300/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
            {activePersona.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                {t('Current Active Speech Voice')}
              </span>
              <span className="text-xs font-bold text-stone-500 capitalize">
                • {activePersona.style}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
              {activePersona.name}
            </h3>
            <p className="text-xs text-stone-600 font-medium truncate max-w-md">
              {activePersona.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={playingVoiceId === activePersona.id}
            onClick={() => handleAudition(activePersona)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {playingVoiceId === activePersona.id ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>{t('Speaking...')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{t('Audition Sample')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Featured Free Default Voice Card */}
      <div className={`rounded-3xl border-2 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        (settings.voicePersona || 'system') === 'system'
          ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
          : 'bg-white border-emerald-300 hover:border-emerald-400'
      }`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
            📱
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-black">
                100% Free • Zero API Credits • Offline
              </span>
              {(settings.voicePersona || 'system') === 'system' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
                  ✓ Active Default Voice
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {t('Default Free Voice (System Native Speech)')}
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              {t('Uses your phone, tablet, or computer\'s built-in speech engine with 0ms delay, full offline reliability, and zero credit usage.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={playingVoiceId === 'system'}
            onClick={() => handleAudition(systemVoiceObj)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Volume2 className={`w-3.5 h-3.5 text-emerald-600 ${playingVoiceId === 'system' ? 'animate-bounce' : ''}`} />
            <span>{playingVoiceId === 'system' ? t('Speaking...') : t('Audition Free Voice')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectVoice(systemVoiceObj)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
              (settings.voicePersona || 'system') === 'system'
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
            }`}
          >
            {(settings.voicePersona || 'system') === 'system' ? t('Selected (Default Free)') : t('Use Free Voice')}
          </button>
        </div>
      </div>

      {/* 20 Neural Voices Grid Section */}
      <div className="rounded-3xl bg-white border-2 border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t('All Voices & Neural Personas')}</span>
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {t('Choose between the free standard on-device voice or 20 curated Gemini neural voices.')}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: `All (${VOICE_PERSONAS.length})` },
              { key: 'free', label: '📱 Free (On-Device)' },
              { key: 'kids', label: '🧸 Kids' },
              { key: 'teens', label: '🎧 Teens' },
              { key: 'caring', label: '💖 Caring' },
              { key: 'pro', label: '💼 Professional' },
            ].map((cat) => {
              const isSelected = voiceCategoryFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setVoiceCategoryFilter(cat.key as any);
                    playChime('tap');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {t(cat.label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredPersonas.map((persona) => {
            const isSelected = (settings.voicePersona || 'system') === persona.id;
            const isPlaying = playingVoiceId === persona.id;

            return (
              <div
                key={persona.id}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/60 shadow-xs'
                    : 'border-stone-200/90 bg-stone-50/40 hover:bg-white hover:border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0 p-1 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                        {persona.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {persona.name}
                          </h4>
                          {persona.category === 'system' && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-black text-emerald-950 shrink-0">
                              🆓 Free Voice
                            </span>
                          )}
                          {(persona.id === 'puck' || persona.tagline.includes('Recommended')) && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-black text-amber-900 shrink-0">
                              ⭐ Fav
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-stone-500 block truncate">
                          {persona.style}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 font-medium leading-relaxed mb-3">
                    {persona.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    disabled={isPlaying}
                    onClick={() => handleAudition(persona)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Volume2 className={`w-3.5 h-3.5 text-amber-600 ${isPlaying ? 'animate-bounce' : ''}`} />
                    <span>{isPlaying ? t('Playing...') : t('Audition')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectVoice(persona)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-amber-500 text-white border border-amber-600'
                        : 'bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 border border-stone-200'
                    }`}
                  >
                    {isSelected ? t('Selected') : t('Use Voice')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speech Pacing & Fine-Tuning */}
      <div className="rounded-3xl bg-white border-2 border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <span>{t('Speech Rate & Sensory Comfort')}</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {t('Fine-tune voice pacing and pitch for clear sensory comprehension and comfort.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Speed Slider */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                {t('Speech Rate (Speed)')}
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-amber-800">
                {(settings.voiceRate || 1.0).toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.voiceRate || 1.0}
              onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-bold text-stone-400">
              <span>0.7x ({t('Calm & Slow')})</span>
              <span>1.0x ({t('Standard')})</span>
              <span>1.3x ({t('Fast')})</span>
            </div>
          </div>

          {/* Voice Pitch Slider */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800">
                {t('Voice Tone (Pitch)')}
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-amber-800">
                {(settings.voicePitch || 1.0).toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.voicePitch || 1.0}
              onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-bold text-stone-400">
              <span>0.7x ({t('Deeper')})</span>
              <span>1.0x ({t('Standard')})</span>
              <span>1.3x ({t('Higher / Child')})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensory & Tactile Accessibility Quick Toggles */}
      <div className="rounded-3xl bg-white border-2 border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-500" />
            <span>{t('Sensory & Accessibility Controls')}</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            {t('Adjust tactile feedback, visual clarity, and audio chimes for neurodivergent sensory balance.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Sound Effects & Chimes */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('Sound Effects & Chimes')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Soft feedback on taps & stars')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Gentle Tactile Haptics */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('Tactile Vibration (Haptics)')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Gentle buzz on touch & buttons')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.hapticsEnabled ?? false}
                onChange={(e) => {
                  const en = e.target.checked;
                  updateSettings({ hapticsEnabled: en });
                  setHapticsEnabled(en);
                  if (en) triggerHaptic('light', true);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Spoken Announcements */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('Spoken Announcements')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Read routine steps aloud')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.spokenAnnouncements ?? false}
                onChange={(e) => updateSettings({ spokenAnnouncements: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Auto-Speak Tapped AAC Words */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('Auto-Speak AAC Words')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Instant speech on word card tap')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.autoSpeakSentence}
                onChange={(e) => updateSettings({ autoSpeakSentence: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* High Contrast Mode */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('High Contrast Text')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Sharp borders & distinct outlines')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Dyslexia-Friendly Typography */}
          <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {t('Dyslexia-Friendly Font')}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                {t('Weighted bottoms to prevent flips')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.dyslexiaFont || false}
                onChange={(e) => updateSettings({ dyslexiaFont: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
