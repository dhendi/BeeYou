import React, { useState, useEffect } from 'react';
import { 
  Square, 
  Volume2, 
  X, 
  Moon, 
  Sun,
  LayoutGrid,
  Trees,
  PawPrint,
  Building2,
  Headphones,
  Waves,
  Flame,
  CloudRain,
  Sunset,
  Palmtree,
  Wind,
  CloudLightning,
  Fish,
  Cat,
  Bird,
  Bug,
  Coffee,
  Train,
  Car,
  Clock,
  BookOpen,
  AudioLines,
  AudioWaveform,
  Activity,
  Infinity,
  MessageSquareHeart,
  Fan
} from 'lucide-react';
import { 
  playSoundscape, 
  stopSoundscape, 
  setSoundscapeVolume, 
  getSavedSoundscapeVolume,
  preloadSoundscapes
} from '../../utils/audio';
import { SoundscapeId } from '../../types';
import { t } from '../../services/translator';
import { triggerHaptic } from '../../services/haptics';

export type SoundGroup = 'all' | 'ambiance' | 'city' | 'animal' | 'focus';

export interface HoneycombSoundDef {
  id: SoundscapeId;
  name: string;
  category: 'ambiance' | 'city' | 'animal' | 'focus';
  type: 'wood' | 'frequency' | 'blue';
  freqHz?: string;
  icon: (active: boolean) => React.ReactNode;
}

export type ChimeSoundDef = HoneycombSoundDef;

export const SOUND_CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'ambiance', label: 'Ambiance', icon: Trees },
  { id: 'animal', label: 'Animal', icon: PawPrint },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'focus', label: 'Focus & Sleep', icon: Headphones },
] as const;

export const SOUND_HONEYCOMB_CATALOG: HoneycombSoundDef[] = [
  // ── AMBIANCE & NATURE ──
  {
    id: 'stream',
    name: 'River',
    category: 'ambiance',
    type: 'wood',
    icon: () => <Waves className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <Flame
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.25}
      />
    ),
  },
  {
    id: 'rain',
    name: 'Rain',
    category: 'ambiance',
    type: 'wood',
    icon: () => <CloudRain className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'rain_roof',
    name: 'Rain On Roof',
    category: 'ambiance',
    type: 'wood',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        <path d="M7 3l-1.5 2.5" />
        <path d="M12 1.5v2" />
        <path d="M17 3l1.5 2.5" />
      </svg>
    ),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'ambiance',
    type: 'wood',
    icon: () => <Sunset className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'beach',
    name: 'Beach',
    category: 'ambiance',
    type: 'wood',
    icon: () => <Palmtree className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 21h18" />
        <path d="M5 21V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v15" />
        <path d="M2 5h20" />
        <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
        <path d="M12 13c-.8 1-1.2 1.8-1.2 2.6a1.2 1.2 0 0 0 2.4 0c0-.8-.4-1.6-1.2-2.6z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.4} />
      </svg>
    ),
  },
  {
    id: 'wind_chimes',
    name: 'Winds',
    category: 'ambiance',
    type: 'wood',
    icon: () => <Wind className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <CloudLightning
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.25}
      />
    ),
  },
  {
    id: 'underwater',
    name: 'Underwater',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <div className="relative flex items-center justify-center">
        <Fish
          className="w-7 h-7 sm:w-8 sm:h-8"
          strokeWidth={2}
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={0.25}
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute -top-1 -right-1 w-3.5 h-3.5 opacity-80 pointer-events-none">
          <circle cx="16" cy="4" r="1.5" />
          <circle cx="19" cy="8" r="1" />
        </svg>
      </div>
    ),
  },

  // ── ANIMALS ──
  {
    id: 'kitten',
    name: 'Gentle Kitten',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <Cat
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'cat_purr',
    name: 'Purring Cat',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <div className="relative flex items-center justify-center">
        <Cat
          className="w-7 h-7 sm:w-8 sm:h-8"
          strokeWidth={2}
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={0.2}
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="absolute -top-1 -right-1 w-3.5 h-3.5 opacity-85 pointer-events-none">
          <path d="M14 6a4 4 0 0 1 0 6" />
          <path d="M17 4a7 7 0 0 1 0 10" />
        </svg>
      </div>
    ),
  },
  {
    id: 'morning_birds',
    name: 'Birds',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <Bird
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'crickets',
    name: 'Crickets',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <Bug
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },

  // ── CITY & TRAVEL ──
  {
    id: 'cafe',
    name: 'Coffee Shop',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <Coffee
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'city',
    name: 'City',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <Building2
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'train_tracks',
    name: 'Train Tracks',
    category: 'city',
    type: 'wood',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M9 3l-4 18" />
        <path d="M15 3l4 18" />
        <path d="M8 6h8" />
        <path d="M7 10h10" />
        <path d="M6 14h12" />
        <path d="M5 18h14" />
      </svg>
    ),
  },
  {
    id: 'train_chug',
    name: 'Steam Train',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <Train
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'driving',
    name: 'Car Ride',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <Car
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },
  {
    id: 'clock_tick',
    name: 'Clock Tick',
    category: 'city',
    type: 'wood',
    icon: () => <Clock className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'library',
    name: 'Quiet Library',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <BookOpen
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.2}
      />
    ),
  },

  // ── FOCUS & SLEEP ──
  {
    id: 'focus_20hz',
    name: 'Focus',
    category: 'focus',
    type: 'frequency',
    freqHz: '20',
    icon: () => null,
  },
  {
    id: 'anxiety_396hz',
    name: 'Anxiety Healer',
    category: 'focus',
    type: 'frequency',
    freqHz: '396',
    icon: () => null,
  },
  {
    id: 'release_528hz',
    name: 'Emotional Release',
    category: 'focus',
    type: 'frequency',
    freqHz: '528',
    icon: () => null,
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    category: 'focus',
    type: 'wood',
    icon: () => <AudioLines className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />,
  },
  {
    id: 'white_noise',
    name: 'White Noise',
    category: 'focus',
    type: 'wood',
    icon: () => <AudioWaveform className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />,
  },
  {
    id: 'green_noise',
    name: 'Green Noise',
    category: 'focus',
    type: 'wood',
    icon: () => <Activity className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />,
  },
  {
    id: 'space_drone',
    name: 'Eternity',
    category: 'focus',
    type: 'wood',
    icon: () => <Infinity className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.4} />,
  },
  {
    id: 'night_time',
    name: 'Night',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <Moon
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.3}
      />
    ),
  },
  {
    id: 'sleep_affirmations',
    name: 'Sleep Affirmations',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <MessageSquareHeart
        className="w-7 h-7 sm:w-8 sm:h-8"
        strokeWidth={2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={0.3}
      />
    ),
  },
  {
    id: 'hypnotic_words',
    name: 'Hypnotic Words',
    category: 'focus',
    type: 'wood',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 12a1 1 0 0 1 1 1c0 1.1-.9 2-2 2a3 3 0 0 1-3-3c0-2.2 1.8-4 4-4a5 5 0 0 1 5 5c0 3.3-2.7 6-6 6a7 7 0 0 1-7-7c0-4.4 3.6-8 8-8" />
      </svg>
    ),
  },
  {
    id: 'bubble_wrap',
    name: 'Bubble Wrap',
    category: 'focus',
    type: 'blue',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8" cy="8" r="2.2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.3} />
        <circle cx="16" cy="8" r="2.2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.3} />
        <circle cx="12" cy="12" r="2.4" fill={active ? 'currentColor' : 'none'} fillOpacity={0.4} />
        <circle cx="8" cy="16" r="2.2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.3} />
        <circle cx="16" cy="16" r="2.2" fill={active ? 'currentColor' : 'none'} fillOpacity={0.3} />
      </svg>
    ),
  },
  {
    id: 'box_fan',
    name: 'Box Fan',
    category: 'focus',
    type: 'wood',
    icon: () => <Fan className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />,
  },
  {
    id: 'tibetan_bowl',
    name: 'Singing Bowl',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 11c0 5 3.6 8 8 8s8-3 8-8H4z" fill={active ? 'currentColor' : 'none'} fillOpacity={0.2} />
        <ellipse cx="12" cy="11" rx="8" ry="2" />
        <path d="M9 19h6" />
        <path d="M9 6a3.5 3.5 0 0 1 6 0" />
        <path d="M7 3.5a6.5 6.5 0 0 1 10 0" />
      </svg>
    ),
  },
];

export const SOUND_CHIME_CATALOG = SOUND_HONEYCOMB_CATALOG;

/**
 * BeeYou Honeycomb Pod Background Shape
 * Smooth, 6-sided rounded hexagonal cell with warm honey nectar lighting when active
 */
const HoneycombPodShape: React.FC<{
  id: string;
  isPlaying: boolean;
  type: 'wood' | 'frequency' | 'blue';
  isNightMode: boolean;
}> = ({ id, isPlaying, type, isNightMode }) => {
  return (
    <svg
      viewBox="0 0 80 88"
      className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
      fill="none"
    >
      <defs>
        {/* Honey Nectar Warm Glow (Active Wood / Standard) */}
        <linearGradient id={`grad-honey-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="35%" stopColor="#FEE685" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Electric Cyan Glow (Active Frequency) */}
        <linearGradient id={`grad-cyan-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Soft Sky Blue Glow (Active Special / Whispers) */}
        <linearGradient id={`grad-blue-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="45%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Symmetrical 6-sided rounded hexagon path */}
      <path
        d="M 34 7 Q 40 4 46 7 L 71 20 Q 76 23 76 29 L 76 59 Q 76 65 71 68 L 46 81 Q 40 84 34 81 L 9 68 Q 4 65 4 59 L 4 29 Q 4 23 9 20 Z"
        fill={
          isPlaying
            ? type === 'frequency'
              ? `url(#grad-cyan-${id})`
              : type === 'blue'
              ? `url(#grad-blue-${id})`
              : `url(#grad-honey-${id})`
            : isNightMode
            ? type === 'frequency'
              ? '#152033'
              : type === 'blue'
              ? '#232D42'
              : '#231C2D'
            : type === 'frequency'
            ? '#1E293B'
            : type === 'blue'
            ? '#E2ECF8'
            : '#FAF3E7'
        }
        stroke={
          isPlaying
            ? type === 'frequency'
              ? '#38BDF8'
              : type === 'blue'
              ? '#3B82F6'
              : '#D97706'
            : isNightMode
            ? type === 'frequency'
              ? 'rgba(56, 189, 248, 0.4)'
              : type === 'blue'
              ? 'rgba(147, 197, 253, 0.3)'
              : 'rgba(255, 255, 255, 0.14)'
            : type === 'frequency'
            ? '#0284C7'
            : type === 'blue'
            ? '#BACEE8'
            : '#DECCAF'
        }
        strokeWidth={isPlaying ? 2.6 : 1.8}
        className="transition-colors duration-300"
      />
    </svg>
  );
};

interface SoundChimeGridProps {
  activeSoundIds: SoundscapeId[];
  soundVolumes: Record<string, number>;
  onVolumeChange: (id: SoundscapeId, volume: number) => void;
  isPremium?: boolean;
  onTriggerUpgrade?: (reason?: string) => void;
}

export const FREE_SOUNDSCAPE_IDS: SoundscapeId[] = ['rain', 'stream'];

export const SoundChimeGrid: React.FC<SoundChimeGridProps> = ({
  activeSoundIds,
  soundVolumes,
  onVolumeChange,
  isPremium = true,
  onTriggerUpgrade,
}) => {
  // Theme state: defaults to false (cozy warm cream as selected by user), with night toggle option
  const [isNightMode, setIsNightMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SoundGroup>('all');

  // Preload soundscape buffers in background for zero-latency, gapless looping
  useEffect(() => {
    preloadSoundscapes();
  }, []);

  const toggleSound = (id: SoundscapeId) => {
    triggerHaptic('light');
    if (activeSoundIds.includes(id)) {
      stopSoundscape(id);
    } else {
      if (!isPremium && !FREE_SOUNDSCAPE_IDS.includes(id)) {
        if (onTriggerUpgrade) {
          onTriggerUpgrade('Unlock all 17 sensory room soundscapes, soothing frequencies, and ambient noise with BeeYou Plus!');
        }
        return;
      }
      const vol = soundVolumes[id] ?? getSavedSoundscapeVolume(id);
      playSoundscape(id, vol, isPremium);
    }
  };

  const getCategoryCount = (catId: SoundGroup) => {
    if (catId === 'all') return SOUND_HONEYCOMB_CATALOG.length;
    return SOUND_HONEYCOMB_CATALOG.filter((s) => s.category === catId).length;
  };

  const displayedSounds = selectedCategory === 'all'
    ? SOUND_HONEYCOMB_CATALOG
    : SOUND_HONEYCOMB_CATALOG.filter((s) => s.category === selectedCategory);

  return (
    <div
      className={`relative w-full rounded-3xl transition-colors duration-500 overflow-hidden flex flex-col p-4 sm:p-6 ${
        isNightMode 
          ? 'bg-[#151226] text-white shadow-2xl border border-indigo-900/40' 
          : 'bg-[#FCF9F2] text-slate-800 border-2 border-[#E9E1D2] shadow-inner'
      }`}
    >
      {/* ── TOP SOUND MIXER & CONTROLS ── */}
      {activeSoundIds.length === 0 ? (
        /* Idle Top Bar: Calm status + Day/Night Sky toggle */
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-900/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 flex items-center justify-center text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                {t('Sensory Honeycomb Soundscapes')}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('Tap any pod below to blend & mix ambient sounds')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              aria-label={isNightMode ? 'Switch to Warm Cream Day' : 'Switch to Midnight Sky'}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-amber-900/15 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-2xs"
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
          </div>
        </div>
      ) : (
        /* Active Top Sound Mixer Console */
        <div className="mb-5 rounded-2xl p-3 sm:p-4 transition-all duration-300 border-2 bg-amber-500/10 dark:bg-white/5 border-amber-400/50 dark:border-amber-400/30 shadow-md">
          {/* Mixer Console Header */}
          <div className="flex items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-amber-900/10 dark:border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <div className="flex items-baseline gap-1.5 truncate">
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase text-amber-950 dark:text-amber-200">
                  {t('Top Sound Mixer')}
                </h3>
                <span className="text-[11px] font-bold text-amber-800/80 dark:text-amber-300/80">
                  ({activeSoundIds.length} {activeSoundIds.length === 1 ? t('sound playing') : t('sounds blended')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setIsNightMode(!isNightMode)}
                aria-label={isNightMode ? 'Switch to Warm Cream Day' : 'Switch to Midnight Sky'}
                className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-amber-900/15 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-2xs"
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

              {/* Stop All Button */}
              <button
                type="button"
                onClick={() => stopSoundscape()}
                aria-label={t('Stop All Sounds')}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{t('Stop All')}</span>
              </button>
            </div>
          </div>

          {/* Active Sound Volume Channel Strips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeSoundIds.map((id) => {
              const item = SOUND_HONEYCOMB_CATALOG.find((s) => s.id === id);
              const vol = soundVolumes[id] ?? getSavedSoundscapeVolume(id);

              return (
                <div
                  key={id}
                  className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-white/90 dark:bg-[#1E1933] border border-amber-200/90 dark:border-white/10 shadow-2xs transition-all hover:border-amber-400"
                >
                  {/* Mini Sound Indicator */}
                  <div className="w-8 h-8 rounded-lg bg-amber-100/90 dark:bg-amber-400/15 flex items-center justify-center text-amber-900 dark:text-amber-300 shrink-0 border border-amber-300/40">
                    {item?.type === 'frequency' ? (
                      <span className="text-[10px] font-black">{item.freqHz}Hz</span>
                    ) : item?.icon ? (
                      <div className="scale-65 origin-center">{item.icon(true)}</div>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Sound Name & Volume Slider */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs leading-tight mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate pr-1">
                        {t(item?.name || id)}
                      </span>
                      <span className="font-mono text-[11px] font-black text-amber-700 dark:text-amber-300 shrink-0">
                        {Math.round(vol * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.01"
                      value={vol}
                      aria-label={`${t(item?.name || id)} ${t('Volume')}`}
                      onInput={(e) => {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        onVolumeChange(id, val);
                        setSoundscapeVolume(val, id);
                      }}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onVolumeChange(id, val);
                        setSoundscapeVolume(val, id);
                      }}
                      className="w-full accent-amber-600 dark:accent-amber-400 cursor-pointer h-3 py-1 bg-amber-200/70 dark:bg-white/15 rounded-lg touch-pan-x"
                    />
                  </div>

                  {/* Individual Stop / Remove Button */}
                  <button
                    type="button"
                    onClick={() => stopSoundscape(id)}
                    aria-label={`${t('Stop')} ${t(item?.name || id)}`}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CATEGORY GROUP TABS (All, Ambiance, City, Animal, Focus) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 shrink-0 border-b border-amber-900/10 dark:border-white/10">
        {SOUND_CATEGORIES.map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const count = getCategoryCount(tab.id);
          const IconComp = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400/60 font-black scale-102'
                  : isNightMode
                  ? 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                  : 'bg-amber-900/5 text-slate-700 hover:bg-amber-900/10 hover:text-slate-900 border border-amber-900/10'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-950' : isNightMode ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>{t(tab.label)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  isSelected
                    ? 'bg-amber-950/20 text-amber-950'
                    : isNightMode
                    ? 'bg-white/10 text-slate-400'
                    : 'bg-amber-900/10 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── THE HONEYCOMB PODS GRID (Zero cords, zero chimes) ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-5 justify-items-center py-2 pb-6">
        {displayedSounds.map((item) => {
          const isPlaying = activeSoundIds.includes(item.id);

          return (
            <div key={item.id} className="flex flex-col items-center group w-full max-w-[88px]">
              {/* Tactile Honeycomb Pod Button */}
              <button
                type="button"
                onClick={() => toggleSound(item.id)}
                aria-label={`${item.name} sound pod. ${isPlaying ? 'Currently playing' : 'Tap to play'}`}
                aria-pressed={isPlaying}
                className={`relative w-[70px] h-[78px] sm:w-[76px] sm:h-[84px] flex items-center justify-center p-2 cursor-pointer transition-all duration-300 transform active:scale-92 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
                  isPlaying
                    ? item.type === 'frequency'
                      ? 'drop-shadow-[0_0_14px_rgba(56,189,248,0.7)] text-[#082F49] scale-105'
                      : item.type === 'blue'
                      ? 'drop-shadow-[0_0_14px_rgba(59,130,246,0.6)] text-[#1E3A8A] scale-105'
                      : 'drop-shadow-[0_0_16px_rgba(245,158,11,0.65)] text-[#451A03] scale-105'
                    : item.type === 'frequency'
                    ? isNightMode
                      ? 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] text-cyan-300 hover:scale-103'
                      : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] text-cyan-200 hover:scale-103'
                    : item.type === 'blue'
                    ? isNightMode
                      ? 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] text-sky-200 hover:scale-103'
                      : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)] text-[#2B4365] hover:scale-103'
                    : isNightMode
                    ? 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] text-[#D8CFE8] hover:text-white hover:scale-103'
                    : 'drop-shadow-[0_2px_4px_rgba(120,94,58,0.08)] text-[#6B512F] hover:text-[#451A03] hover:scale-103'
                }`}
              >
                {!isPremium && !FREE_SOUNDSCAPE_IDS.includes(item.id) && (
                  <span className="absolute top-1 right-1 z-20 px-1 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[8px] font-black uppercase tracking-wider shadow-2xs">
                    Plus
                  </span>
                )}
                {/* Honeycomb Pod Background Shape */}
                <HoneycombPodShape
                  id={item.id}
                  isPlaying={isPlaying}
                  type={item.type}
                  isNightMode={isNightMode}
                />

                {/* Content: Frequency Number or Vector Icon */}
                <div className="relative z-10 flex items-center justify-center pointer-events-none">
                  {item.type === 'frequency' ? (
                    <div className="flex flex-col items-center justify-center leading-none select-none">
                      <span className="text-sm sm:text-base font-black tracking-tight">{item.freqHz}</span>
                      <span className="text-[9px] font-bold opacity-85 mt-0.5">Hz</span>
                    </div>
                  ) : (
                    item.icon(isPlaying)
                  )}
                </div>
              </button>

              {/* Just Icon & Name At Bottom */}
              <span 
                className={`mt-1.5 text-center text-xs sm:text-[13px] leading-tight transition-colors line-clamp-2 px-1 select-none max-w-[82px] sm:max-w-[90px] ${
                  isPlaying 
                    ? isNightMode
                      ? 'font-black text-amber-300 drop-shadow-[0_1px_3px_rgba(251,191,36,0.5)]'
                      : 'font-black text-amber-950'
                    : isNightMode 
                    ? 'font-semibold text-slate-300 group-hover:text-white' 
                    : 'font-bold text-slate-700 group-hover:text-slate-950'
                }`}
              >
                {t(item.name)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
