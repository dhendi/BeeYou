import React, { useState } from 'react';
import { 
  Square, 
  Volume2, 
  X, 
  Sliders, 
  Moon, 
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  playSoundscape, 
  stopSoundscape, 
  setSoundscapeVolume, 
  getSavedSoundscapeVolume 
} from '../../utils/audio';
import { SoundscapeId } from '../../types';
import { t } from '../../services/translator';

interface ChimeSoundDef {
  id: SoundscapeId;
  name: string;
  type: 'wood' | 'frequency' | 'blue';
  freqHz?: string;
  icon: (active: boolean) => React.ReactNode;
}

export const SOUND_CHIME_CATALOG: ChimeSoundDef[] = [
  // ── ROW 1 ──
  {
    id: 'stream',
    name: 'River',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 8c3-2 6 2 9 0s6-2 9 0" />
        <path d="M3 13c3-2 6 2 9 0s6-2 9 0" />
        <path d="M3 18c3-2 6 2 9 0s6-2 9 0" />
      </svg>
    ),
  },
  {
    id: 'campfire',
    name: 'Campfire',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 3c-1.5 3-4 5-4 8a4 4 0 0 0 8 0c0-2-1-4-2-5" />
        <path d="M12 12c-.8 1-1.5 2-1.5 3a1.5 1.5 0 0 0 3 0c0-1-.5-2-1.5-3z" fill={active ? 'currentColor' : 'none'} />
        <path d="M6 20l12-3" />
        <path d="M18 20L6 17" />
      </svg>
    ),
  },
  {
    id: 'cafe',
    name: 'Coffee Shop',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z" />
        <path d="M4 10a2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0" />
        <path d="M10 5a1.5 1.5 0 0 1 3 0v2h-3V5z" />
        <path d="M13 6h1a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-1" />
        <path d="M10 14h4v7h-4z" />
      </svg>
    ),
  },
  {
    id: 'forest',
    name: 'Walking In Woods',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M5 19l2-6 3 1.5 1.5 4.5-6.5 0z" />
        <path d="M10 19h3.5c1 0 1.5-.8 1.5-1.5v-2l-2.5-.8-2.5.8v3.5z" />
        <path d="M17 7l-2.5 4h1.5l-2.5 4h6.5l-2.5-4h1.5z" />
        <path d="M16 15v4" />
      </svg>
    ),
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 12h2" />
        <path d="M7 9v6" />
        <path d="M10 6v12" />
        <path d="M13 4v16" />
        <path d="M16 7v10" />
        <path d="M19 10v4" />
        <path d="M22 12h1" />
      </svg>
    ),
  },
  {
    id: 'focus_20hz',
    name: 'Focus',
    type: 'frequency',
    freqHz: '20',
    icon: () => null,
  },
  {
    id: 'hypnotic_words',
    name: 'Hypnotic Words',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 2v7" />
        <circle cx="12" cy="14" r="5" />
        <path d="M12 11.5a2.5 2.5 0 0 1 2.5 2.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5" />
        <path d="M4 14a8 8 0 0 1 2-5" />
        <path d="M20 14a8 8 0 0 0-2-5" />
      </svg>
    ),
  },
  {
    id: 'cat_purr',
    name: 'Purring Cat',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 11V6l4 3a8 8 0 0 1 8 0l4-3v5c0 5-3.5 8-8 8s-8-3-8-8z" />
        <path d="M9 13h.01" strokeWidth="3" />
        <path d="M15 13h.01" strokeWidth="3" />
        <path d="M12 15l-1 1h2l-1-1z" fill={active ? 'currentColor' : 'none'} />
        <path d="M7 14l-3-1" />
        <path d="M7 16l-3 1" />
        <path d="M17 14l3-1" />
        <path d="M17 16l3 1" />
      </svg>
    ),
  },

  // ── ROW 2 ──
  {
    id: 'night_time',
    name: 'Night',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 9 9 0 1 0 20.5 14.5z" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'morning_birds',
    name: 'Birds',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 17l4-2c2 1 5 1 7-1l5-4-3-1 2-2-4 1c-4-2-9 1-9 5l-2 4z" />
        <circle cx="16" cy="10" r="1" fill="currentColor" />
        <path d="M9 18v3" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'rain',
    name: 'Rain',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M6 13a4 4 0 0 1 0-8 5 5 0 0 1 9.7-1.3A4 4 0 0 1 19 11a3 3 0 0 1-1 2H6z" />
        <path d="M8 15l-1 4" />
        <path d="M12 15l-1 4" />
        <path d="M16 15l-1 4" />
      </svg>
    ),
  },
  {
    id: 'rain_roof',
    name: 'Rain On Roof',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
        <path d="M6 4l-2 3" />
        <path d="M11 2l-2 3" />
        <path d="M18 4l-2 3" />
      </svg>
    ),
  },
  {
    id: 'white_noise',
    name: 'White Noise',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 11v2" />
        <path d="M7 8v8" />
        <path d="M10 5v14" />
        <path d="M13 3v18" />
        <path d="M16 6v12" />
        <path d="M19 9v6" />
        <path d="M22 11v2" />
      </svg>
    ),
  },
  {
    id: 'anxiety_396hz',
    name: 'Anxiety Healer',
    type: 'frequency',
    freqHz: '396',
    icon: () => null,
  },
  {
    id: 'sleep_affirmations',
    name: 'Sleep Affirmations',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 19l2.5-1.5H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12z" />
        <path d="M12 9c-1-1.2-2.5-1.2-3.2-.2-.7 1-.3 2.2 1.2 3.4l2 1.8 2-1.8c1.5-1.2 1.9-2.4 1.2-3.4-.7-1-2.2-1-3.2.2z" fill={active ? 'currentColor' : 'none'} />
        <path d="M18 5l.5-1 .5 1 1 .5-1 .5-.5 1-.5-1-1-.5z" />
      </svg>
    ),
  },
  {
    id: 'elvish_whispers',
    name: 'Elvish Whispers',
    type: 'blue',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 12c3-4 6-4 8-1 2-3 5-3 8 1-3 3-5 5-8 5s-5-2-8-5z" />
        <path d="M6 12c3 2 5 2 6 2s3 0 6-2" />
      </svg>
    ),
  },

  // ── ROW 3 ──
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="16" cy="7" r="3" fill={active ? 'currentColor' : 'none'} />
        <path d="M16 2v1" />
        <path d="M21 7h-1" />
        <path d="M19.5 3.5l-.7.7" />
        <path d="M3 15c2.5-1.5 5 1.5 7.5 0s5-1.5 7.5 0" />
        <path d="M3 19c2.5-1.5 5 1.5 7.5 0s5-1.5 7.5 0" />
      </svg>
    ),
  },
  {
    id: 'space_drone',
    name: 'Eternity',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 12c-2-3-4-4.5-6.5-4.5A4.5 4.5 0 0 0 1 12a4.5 4.5 0 0 0 4.5 4.5c2.5 0 4.5-1.5 6.5-4.5 2 3 4 4.5 6.5 4.5A4.5 4.5 0 0 0 23 12a4.5 4.5 0 0 0-4.5-4.5c-2.5 0-4.5 1.5-6.5 4.5z" />
      </svg>
    ),
  },
  {
    id: 'underwater',
    name: 'Underwater',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2z" />
        <path d="M10 11a2 2 0 0 1 4 0" />
        <path d="M19 6l2-2v8a3 3 0 0 1-3 3" />
        <circle cx="7" cy="4" r="1" />
        <circle cx="10" cy="3" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'wind_chimes',
    name: 'Winds',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 8h12a3 3 0 1 0-3-3" />
        <path d="M3 13h15a3 3 0 1 1-3 3" />
        <path d="M3 18h7a2 2 0 1 0-2-2" />
      </svg>
    ),
  },
  {
    id: 'green_noise',
    name: 'Green Noise',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 12h2" />
        <path d="M6 10v4" />
        <path d="M9 7v10" />
        <path d="M12 4v16" />
        <path d="M15 7v10" />
        <path d="M18 10v4" />
        <path d="M21 12h1" />
      </svg>
    ),
  },
  {
    id: 'release_528hz',
    name: 'Emotional Release',
    type: 'frequency',
    freqHz: '528',
    icon: () => null,
  },
  {
    id: 'counting_sheep',
    name: 'Counting Sheep',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="9" r="2.5" />
        <circle cx="9" cy="11" r="2.5" />
        <circle cx="15" cy="11" r="2.5" />
        <circle cx="12" cy="13" r="2.5" />
        <ellipse cx="6.5" cy="11" rx="1.5" ry="2" />
        <path d="M5 19v-4" />
        <path d="M12 19v-4" />
        <path d="M19 19v-4" />
        <path d="M3 16h18" />
        <path d="M3 18h18" />
      </svg>
    ),
  },
  {
    id: 'bubble_wrap',
    name: 'Bubble Wrap',
    type: 'blue',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
        <circle cx="8" cy="11" r="1.5" fill={active ? 'currentColor' : 'none'} />
        <circle cx="12" cy="11" r="1.5" fill={active ? 'currentColor' : 'none'} />
        <circle cx="16" cy="11" r="1.5" fill={active ? 'currentColor' : 'none'} />
        <circle cx="8" cy="15" r="1.5" fill={active ? 'currentColor' : 'none'} />
        <circle cx="12" cy="15" r="1.5" fill={active ? 'currentColor' : 'none'} />
        <circle cx="16" cy="15" r="1.5" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },

  // ── ROW 4 (Additional Favorites) ──
  {
    id: 'train_tracks',
    name: 'Train Tracks',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M7 3l-3 18" />
        <path d="M17 3l3 18" />
        <path d="M5 8h14" />
        <path d="M4.5 13h15" />
        <path d="M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 4h18v17H3V4z" />
        <path d="M6 8h12v13H6V8z" />
        <path d="M12 13c-1 1-1.5 2-1.5 3a1.5 1.5 0 0 0 3 0c0-1-.5-2-1.5-3z" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'clock_tick',
    name: 'Clock Tick',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M6 12a4 4 0 0 1 0-8 5 5 0 0 1 9.7-1.3A4 4 0 0 1 19 10a3 3 0 0 1-1 2H6z" />
        <polygon points="13 12 10 17 13 17 11 22 17 15 14 15 16 12" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
];

interface SoundChimeGridProps {
  activeSoundIds: SoundscapeId[];
  soundVolumes: Record<string, number>;
  onVolumeChange: (id: SoundscapeId, volume: number) => void;
  isPremium?: boolean;
}

export const SoundChimeGrid: React.FC<SoundChimeGridProps> = ({
  activeSoundIds,
  soundVolumes,
  onVolumeChange,
  isPremium = true,
}) => {
  // Theme state: defaults to false (cozy warm cream as selected by user), with night toggle option
  const [isNightMode, setIsNightMode] = useState(false);
  const [showMixDrawer, setShowMixDrawer] = useState(true);

  const toggleSound = (id: SoundscapeId) => {
    if (activeSoundIds.includes(id)) {
      stopSoundscape(id);
    } else {
      const vol = soundVolumes[id] ?? getSavedSoundscapeVolume(id);
      playSoundscape(id, vol, isPremium);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl transition-colors duration-500 overflow-hidden flex flex-col p-4 sm:p-6 ${
        isNightMode 
          ? 'bg-[#151226] text-white shadow-2xl border border-indigo-900/40' 
          : 'bg-[#FCF9F2] text-slate-800 border-2 border-[#E9E1D2] shadow-inner'
      }`}
    >
      {/* Subtle Ambient Night Sky Toggle */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-900/10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30">
            {activeSoundIds.length === 0
              ? t('Tap any chime to play')
              : activeSoundIds.length === 1
              ? t('1 Chime Playing')
              : `${activeSoundIds.length} ${t('Chimes Blended')}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            aria-label={isNightMode ? 'Switch to Warm Cream Day' : 'Switch to Midnight Sky'}
            className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white/70 dark:bg-white/10 hover:bg-white/90 border border-amber-900/15 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            {isNightMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('Daylight')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{t('Night Sky')}</span>
              </>
            )}
          </button>

          {activeSoundIds.length > 0 && (
            <button
              type="button"
              onClick={() => stopSoundscape()}
              aria-label={t('Stop All Sounds')}
              className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{t('Stop All')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── THE CHIME TILES GRID ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6 justify-items-center py-2 pb-24 sm:pb-28">
        {SOUND_CHIME_CATALOG.map((item) => {
          const isPlaying = activeSoundIds.includes(item.id);

          return (
            <div key={item.id} className="flex flex-col items-center group w-full max-w-[88px]">
              {/* Subtle Hanging Cord & Eyelet */}
              <div className="flex flex-col items-center mb-0.5 pointer-events-none">
                <div 
                  className={`w-[1px] h-3 transition-colors ${
                    isPlaying 
                      ? 'bg-amber-400 dark:bg-amber-300' 
                      : isNightMode 
                      ? 'bg-white/20' 
                      : 'bg-amber-900/20'
                  }`} 
                />
                <div 
                  className={`w-1.5 h-1.5 rounded-full transition-colors -mt-0.5 ${
                    isPlaying 
                      ? 'bg-amber-400 dark:bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.9)]' 
                      : isNightMode 
                      ? 'bg-white/30' 
                      : 'bg-amber-900/30'
                  }`} 
                />
              </div>

              {/* The Chime Tile Button */}
              <button
                type="button"
                onClick={() => toggleSound(item.id)}
                aria-label={`${item.name} sound chime. ${isPlaying ? 'Currently playing' : 'Tap to play'}`}
                aria-pressed={isPlaying}
                className={`relative w-17 h-17 sm:w-19 sm:h-19 rounded-[24px] sm:rounded-[26px] flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 transform active:scale-92 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
                  isPlaying
                    ? item.type === 'frequency'
                      ? 'bg-[#0E2238] border-2 border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.8),0_0_45px_rgba(6,182,212,0.4)] scale-105'
                      : item.type === 'blue'
                      ? 'bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE] border-2 border-sky-300 text-sky-950 shadow-[0_0_24px_rgba(147,197,253,0.8),0_0_45px_rgba(59,130,246,0.35)] scale-105'
                      : 'bg-gradient-to-b from-[#FFFDF7] via-[#FFF8E7] to-[#FCEEC8] border-2 border-amber-300 text-amber-950 shadow-[0_0_24px_rgba(251,191,36,0.8),0_0_50px_rgba(245,158,11,0.35)] scale-105'
                    : item.type === 'frequency'
                    ? isNightMode
                      ? 'bg-[#152033] hover:bg-[#1E2E48] border-2 border-cyan-500/30 text-cyan-300 shadow-[0_4px_10px_rgba(0,0,0,0.25)] hover:scale-102'
                      : 'bg-[#1E293B] hover:bg-[#2C3B53] border-2 border-cyan-600/40 text-cyan-200 shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:scale-102'
                    : item.type === 'blue'
                    ? isNightMode
                      ? 'bg-[#2A374F] hover:bg-[#344563] border-2 border-[#41557A] text-sky-200 shadow-[0_4px_10px_rgba(0,0,0,0.25)] hover:scale-102'
                      : 'bg-[#DCE5F2] hover:bg-[#CFDCED] border-2 border-[#BAC9DE] text-[#24354D] shadow-[0_3px_8px_rgba(36,53,77,0.08)] hover:scale-102'
                    : isNightMode
                    ? 'bg-[#2D241C] hover:bg-[#3B3026] border-2 border-[#574637] text-[#EADBB8] shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-102'
                    : 'bg-[#EFE4CF] hover:bg-[#E7DABE] border-2 border-[#D9C7A8] text-[#5A4325] shadow-[0_3px_8px_rgba(90,67,37,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:scale-102'
                }`}
              >
                {/* Active Inner Glow Aura Ring */}
                {isPlaying && (
                  <span 
                    className="absolute inset-0 rounded-[24px] sm:rounded-[26px] animate-pulse pointer-events-none opacity-40 ring-2 ring-amber-300/60" 
                    aria-hidden="true" 
                  />
                )}

                {/* Content: Frequency Pill or Vector Icon */}
                {item.type === 'frequency' ? (
                  <div className="flex flex-col items-center justify-center leading-none select-none">
                    <span className="text-sm sm:text-base font-black tracking-tight">{item.freqHz}</span>
                    <span className="text-[9px] font-bold opacity-75 mt-0.5">Hz</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {item.icon(isPlaying)}
                  </div>
                )}
              </button>

              {/* Clean Name At Bottom */}
              <span 
                className={`mt-2 text-center text-xs sm:text-[13px] leading-tight transition-colors line-clamp-2 px-0.5 select-none ${
                  isPlaying 
                    ? isNightMode
                      ? 'font-black text-amber-200 drop-shadow-[0_1px_2px_rgba(251,191,36,0.4)]'
                      : 'font-black text-amber-950'
                    : isNightMode 
                    ? 'font-medium text-slate-300 group-hover:text-white' 
                    : 'font-semibold text-slate-700 group-hover:text-slate-950'
                }`}
              >
                {t(item.name)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── MINIMAL FLOATING BOTTOM MIX DRAWER ── */}
      {activeSoundIds.length > 0 && (
        <div className="sticky bottom-2 inset-x-0 w-full max-w-xl mx-auto z-20 mt-auto animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/95 dark:bg-[#1E1B33]/95 backdrop-blur-md rounded-2xl border-2 border-amber-300/80 dark:border-amber-400/30 p-3 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {t('Active Sound Mix')} ({activeSoundIds.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMixDrawer(!showMixDrawer)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showMixDrawer ? t('Hide Sliders') : t('Adjust Volumes')}</span>
                  {showMixDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => stopSoundscape()}
                  className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{t('Stop')}</span>
                </button>
              </div>
            </div>

            {/* Individual Sound Sliders (Collapsible) */}
            {showMixDrawer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/10">
                {activeSoundIds.map((id) => {
                  const item = SOUND_CHIME_CATALOG.find((s) => s.id === id);
                  const vol = soundVolumes[id] ?? getSavedSoundscapeVolume(id);

                  return (
                    <div 
                      key={id}
                      className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/10"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t(item?.name || id)}
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">
                          {Math.round(vol * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="range"
                          min="0.01"
                          max="1.0"
                          step="0.01"
                          value={vol}
                          aria-label={`${t(item?.name || id)} ${t('Volume')}`}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onVolumeChange(id, val);
                            setSoundscapeVolume(val, id);
                          }}
                          className="w-18 sm:w-22 accent-teal-600 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => stopSoundscape(id)}
                          aria-label={`${t('Stop')} ${t(item?.name || id)}`}
                          className="w-6 h-6 rounded-lg bg-slate-200/60 dark:bg-white/10 hover:bg-rose-100 hover:text-rose-600 text-slate-500 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
