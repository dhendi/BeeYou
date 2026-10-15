import React, { useState } from 'react';
import { 
  Square, 
  Volume2, 
  X, 
  Moon, 
  Sun,
  Sparkles,
  Trees,
  PawPrint,
  Building2,
  Headphones
} from 'lucide-react';
import { 
  playSoundscape, 
  stopSoundscape, 
  setSoundscapeVolume, 
  getSavedSoundscapeVolume 
} from '../../utils/audio';
import { SoundscapeId } from '../../types';
import { t } from '../../services/translator';

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
  { id: 'all', label: 'All', icon: Sparkles },
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
    category: 'ambiance',
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
    id: 'rain',
    name: 'Rain',
    category: 'ambiance',
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
    category: 'ambiance',
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
    id: 'ocean',
    name: 'Ocean',
    category: 'ambiance',
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
    id: 'beach',
    name: 'Beach',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="6" cy="6" r="2.5" fill={active ? 'currentColor' : 'none'} />
        <path d="M2 17c3-1.5 6 1.5 9 0s6-1.5 9 0" />
        <path d="M2 20c3-1.5 6 1.5 9 0s6-1.5 9 0" />
        <path d="M17 6a4 4 0 0 0-7.5 0c0 1 1.5 1.5 3.5 1.5s4-.5 4-1.5z" />
        <path d="M13 7.5v8" />
      </svg>
    ),
  },
  {
    id: 'forest',
    name: 'Walking In Woods',
    category: 'ambiance',
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
    id: 'fireplace',
    name: 'Fireplace',
    category: 'ambiance',
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
    id: 'wind_chimes',
    name: 'Winds',
    category: 'ambiance',
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
    id: 'thunderstorm',
    name: 'Thunderstorm',
    category: 'ambiance',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M6 12a4 4 0 0 1 0-8 5 5 0 0 1 9.7-1.3A4 4 0 0 1 19 10a3 3 0 0 1-1 2H6z" />
        <polygon points="13 12 10 17 13 17 11 22 17 15 14 15 16 12" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'underwater',
    name: 'Underwater',
    category: 'ambiance',
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

  // ── ANIMALS ──
  {
    id: 'puppy',
    name: 'Playful Puppy',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M10 5.5C8 3 5 4 4 6c-1 2 .5 5 2 6.5" />
        <path d="M14 5.5C16 3 19 4 20 6c1 2-.5 5-2 6.5" />
        <path d="M6 12.5C6 17 9 20 12 20s6-3 6-7.5c0-3.5-2.5-6.5-6-6.5s-6 3-6 6.5z" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
        <path d="M11 16c.5.5 1.5.5 2 0" />
        <ellipse cx="12" cy="14.5" rx="1.5" ry="1" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'kitten',
    name: 'Gentle Kitten',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M5 10V5l5 3a7.5 7.5 0 0 1 4 0l5-3v5c0 5-3.5 7.5-7 7.5S5 15 5 10z" />
        <circle cx="9" cy="11.5" r="1" fill="currentColor" />
        <circle cx="15" cy="11.5" r="1" fill="currentColor" />
        <path d="M12 13.5l-1 1h2l-1-1z" fill={active ? 'currentColor' : 'none'} />
        <path d="M7 12.5l-2-.5" />
        <path d="M7 14l-2 .5" />
        <path d="M17 12.5l2-.5" />
        <path d="M17 14l2 .5" />
      </svg>
    ),
  },
  {
    id: 'cat_purr',
    name: 'Purring Cat',
    category: 'animal',
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
  {
    id: 'morning_birds',
    name: 'Birds',
    category: 'animal',
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
    id: 'crickets',
    name: 'Crickets',
    category: 'animal',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <ellipse cx="12" cy="13" rx="4.5" ry="3" />
        <circle cx="7" cy="11.5" r="1.8" />
        <path d="M6 10L3 6" />
        <path d="M7 10L5 5" />
        <path d="M14 11l4-5" />
        <path d="M16 13l4-2" />
        <path d="M10 16l-1 4" />
        <path d="M14 16l1 4" />
        <path d="M19 6c1 1 1 2 0 3" />
      </svg>
    ),
  },
  {
    id: 'counting_sheep',
    name: 'Counting Sheep',
    category: 'animal',
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

  // ── CITY & TRAVEL ──
  {
    id: 'cafe',
    name: 'Coffee Shop',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z" />
        <path d="M4 10a2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0 2 2 0 0 1 3.2 0" />
        <path d="M10 5a1.5 1.5 0 0 1 3 0v2h-3V5z" />
        <path d="M13 6h1a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-1" />
        <path d="M10 14h4v7h-4z" />
      </svg>
    ),
  },
  {
    id: 'city',
    name: 'City',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M3 21h18" />
        <path d="M5 21V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v12" />
        <path d="M11 21V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16" />
        <path d="M17 21v-8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8" />
        <circle cx="8" cy="12" r="0.8" fill="currentColor" />
        <circle cx="8" cy="15" r="0.8" fill="currentColor" />
        <circle cx="14" cy="8" r="0.8" fill="currentColor" />
        <circle cx="14" cy="12" r="0.8" fill="currentColor" />
        <circle cx="14" cy="16" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'train_tracks',
    name: 'Train Tracks',
    category: 'city',
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
    id: 'train_chug',
    name: 'Steam Train',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <rect x="2" y="8" width="13" height="9" rx="1" />
        <path d="M15 11h4a2 2 0 0 1 2 2v4h-6v-6z" />
        <circle cx="6" cy="18" r="1.8" />
        <circle cx="11" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
        <path d="M5 8V4h3v4" />
        <path d="M2 21h20" />
      </svg>
    ),
  },
  {
    id: 'driving',
    name: 'Car Ride',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 16l1.8-6.2a2 2 0 0 1 1.9-1.4h8.6a2 2 0 0 1 1.9 1.4L20 16" />
        <path d="M3 16h18v3H3z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    id: 'clock_tick',
    name: 'Clock Tick',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    id: 'library',
    name: 'Quiet Library',
    category: 'city',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
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
    id: 'white_noise',
    name: 'White Noise',
    category: 'focus',
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
    id: 'green_noise',
    name: 'Green Noise',
    category: 'focus',
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
    id: 'space_drone',
    name: 'Eternity',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 12c-2-3-4-4.5-6.5-4.5A4.5 4.5 0 0 0 1 12a4.5 4.5 0 0 0 4.5 4.5c2.5 0 4.5-1.5 6.5-4.5 2 3 4 4.5 6.5 4.5A4.5 4.5 0 0 0 23 12a4.5 4.5 0 0 0-4.5-4.5c-2.5 0-4.5 1.5-6.5 4.5z" />
      </svg>
    ),
  },
  {
    id: 'night_time',
    name: 'Night',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 9 9 0 1 0 20.5 14.5z" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'sleep_affirmations',
    name: 'Sleep Affirmations',
    category: 'focus',
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
    id: 'hypnotic_words',
    name: 'Hypnotic Words',
    category: 'focus',
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
    id: 'elvish_whispers',
    name: 'Elvish Whispers',
    category: 'focus',
    type: 'blue',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 12c3-4 6-4 8-1 2-3 5-3 8 1-3 3-5 5-8 5s-5-2-8-5z" />
        <path d="M6 12c3 2 5 2 6 2s3 0 6-2" />
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
  {
    id: 'box_fan',
    name: 'Box Fan',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="12" cy="12" r="6" />
        <path d="M12 12c-1.5-2-1.5-4 0-5" />
        <path d="M12 12c2-1.5 4-1.5 5 0" />
        <path d="M12 12c1.5 2 1.5 4 0 5" />
        <path d="M12 12c-2 1.5-4 1.5-5 0" />
      </svg>
    ),
  },
  {
    id: 'tibetan_bowl',
    name: 'Singing Bowl',
    category: 'focus',
    type: 'wood',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 11a8 8 0 0 0 16 0V8H4v3z" />
        <path d="M9 19h6" />
        <path d="M12 19v2" />
        <path d="M3 8h18" />
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
}

export const SoundChimeGrid: React.FC<SoundChimeGridProps> = ({
  activeSoundIds,
  soundVolumes,
  onVolumeChange,
  isPremium = true,
}) => {
  // Theme state: defaults to false (cozy warm cream as selected by user), with night toggle option
  const [isNightMode, setIsNightMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SoundGroup>('all');

  const toggleSound = (id: SoundscapeId) => {
    if (activeSoundIds.includes(id)) {
      stopSoundscape(id);
    } else {
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
