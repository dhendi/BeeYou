import React, { useEffect, useState, useRef } from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
  wallpaperUrl?: string;
}

/**
 * useViewportZoom — Clean, reliable zoom detector.
 * Tracks desktop page zoom (Ctrl +/- / Cmd +/-) via relative devicePixelRatio
 * and mobile/tablet pinch-to-zoom via VisualViewport scale.
 */
function useViewportZoom(): number {
  const [zoomFactor, setZoomFactor] = useState(1);
  const baseDprRef = useRef<number>(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Establish baseline devicePixelRatio for this session
    const currentDpr = window.devicePixelRatio || 1;
    const storedBase = sessionStorage.getItem('beeyou_baseline_dpr');
    if (storedBase && !isNaN(Number(storedBase)) && Number(storedBase) > 0.4) {
      baseDprRef.current = Number(storedBase);
    } else {
      baseDprRef.current = currentDpr;
      try {
        sessionStorage.setItem('beeyou_baseline_dpr', String(currentDpr));
      } catch {}
    }

    const computeZoom = () => {
      const dpr = window.devicePixelRatio || 1;
      const base = baseDprRef.current || 1;
      const pageZoom = base > 0 ? dpr / base : 1;
      const pinchZoom = window.visualViewport?.scale || 1;
      const total = Math.max(0.33, Math.min(4.0, pageZoom * pinchZoom));
      return Math.round(total * 1000) / 1000;
    };

    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = computeZoom();
        setZoomFactor((prev) => (Math.abs(prev - next) > 0.005 ? next : prev));
      });
    };

    window.addEventListener('resize', handleUpdate, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleUpdate, { passive: true });
      vv.addEventListener('scroll', handleUpdate, { passive: true });
    }

    let mqList: MediaQueryList | null = null;
    const updateMq = () => {
      if (mqList) mqList.removeEventListener('change', onMqChange);
      try {
        mqList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        mqList.addEventListener('change', onMqChange);
      } catch {}
    };

    const onMqChange = () => {
      handleUpdate();
      updateMq();
    };

    updateMq();
    handleUpdate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleUpdate);
      if (vv) {
        vv.removeEventListener('resize', handleUpdate);
        vv.removeEventListener('scroll', handleUpdate);
      }
      if (mqList) mqList.removeEventListener('change', onMqChange);
    };
  }, []);

  return zoomFactor;
}

/**
 * ThemeWallpaperArt — Ultra-Calm Low-Sensory Ambient Background Layer
 * Designed specifically to eliminate peripheral visual noise, motion fatigue,
 * and cognitive clutter for neurodivergent and sensory-sensitive users.
 *
 * Features:
 * 1. Clean, authentic Japanese oat-milk paper artwork with delicate doodle honeycombs, clouds, and stars.
 * 2. High-definition seamless repeating wallpaper: avoids stretching blur on 1080p, 1440p, 4K, and Retina displays.
 * 3. Invariant zoom scaling: When zooming in (browser zoom Ctrl +/- or pinch zoom),
 *    the background size dynamically counter-scales so the wallpaper remains at true 1:1 physical scale and does not zoom in.
 */
export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  pattern,
  wallpaperUrl,
  className = '',
}) => {
  const isDefaultOrHoneycomb =
    pattern === 'honeycomb_clouds' || (!wallpaperUrl && (!pattern || pattern === 'none'));

  const effectiveWallpaper =
    wallpaperUrl ||
    (isDefaultOrHoneycomb
      ? '/assets/wallpapers/default_honey_theme_bg.webp'
      : undefined);

  const zoomFactor = useViewportZoom();

  // Native tile dimensions of the clean artwork
  const tileWidth = 1024;
  const tileHeight = 571;

  // Counter-scale tile size so background elements never magnify on zoom
  const computedTileSize = `${Math.round((tileWidth / zoomFactor) * 10) / 10}px ${Math.round((tileHeight / zoomFactor) * 10) / 10}px`;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      style={
        effectiveWallpaper
          ? {
              backgroundColor: '#FEF9F1',
              backgroundImage: `url('${effectiveWallpaper}')`,
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center center',
              backgroundSize: computedTileSize,
            }
          : { backgroundColor: '#FEF9F1' }
      }
    >
      {/* Subtle ambient lighting overlay to ensure clean card readability and low glare */}
      <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/[0.02] pointer-events-none" />
    </div>
  );
};
