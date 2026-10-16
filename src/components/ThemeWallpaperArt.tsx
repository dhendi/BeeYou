import React from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
  wallpaperUrl?: string;
}

/**
 * ThemeWallpaperArt — Ultra-Calm Low-Sensory Ambient Background Layer
 * Designed specifically to eliminate peripheral visual noise, motion fatigue,
 * and cognitive clutter for neurodivergent and sensory-sensitive users.
 */
export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  pattern,
  wallpaperUrl,
  className = '',
}) => {
  // If a specific wallpaperUrl is set, or if the signature honeycomb_clouds pattern is active
  // or if no pattern is specified (the default theme), display the cozy signature wallpaper.
  const isDefaultOrHoneycomb = pattern === 'honeycomb_clouds' || (!wallpaperUrl && (!pattern || pattern === 'none'));
  const effectiveWallpaper = wallpaperUrl || (isDefaultOrHoneycomb ? '/assets/wallpapers/default_honey_theme_bg.jpg' : undefined);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      style={
        effectiveWallpaper
          ? {
              backgroundImage: `url('${effectiveWallpaper}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#FEF9F1',
            }
          : undefined
      }
    >
      {/* Subtle ambient lighting overlay to ensure clean card readability and low glare */}
      <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/[0.02] pointer-events-none" />
    </div>
  );
};
