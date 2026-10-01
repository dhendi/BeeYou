import React from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
}

/**
 * ThemeWallpaperArt — Ultra-Calm Low-Sensory Ambient Background Layer
 * Designed specifically to eliminate peripheral visual noise, motion fatigue,
 * and cognitive clutter for neurodivergent and sensory-sensitive users.
 */
export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  className = '',
}) => {
  // Return subtle static ambient background without distracting animated shapes
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 bg-radial from-white/40 via-transparent to-black/[0.02] ${className}`}
    />
  );
};
