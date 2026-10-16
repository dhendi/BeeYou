import React, { useEffect, useState, useRef } from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
  wallpaperUrl?: string;
}

interface ViewportZoomState {
  zoomFactor: number;
  pinchLeft: number;
  pinchTop: number;
}

/**
 * useViewportZoom — Clean, reliable zoom detector.
 * Tracks desktop page zoom (Ctrl +/- / Cmd +/-) via relative devicePixelRatio
 * and mobile/tablet pinch-to-zoom via VisualViewport scale.
 */
function useViewportZoom(): ViewportZoomState {
  const [zoomState, setZoomState] = useState<ViewportZoomState>({
    zoomFactor: 1,
    pinchLeft: 0,
    pinchTop: 0,
  });
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

    const computeZoom = (): ViewportZoomState => {
      const dpr = window.devicePixelRatio || 1;
      const base = baseDprRef.current || 1;
      const pageZoom = base > 0 ? dpr / base : 1;
      const vv = window.visualViewport;
      const pinchZoom = vv?.scale || 1;
      const pinchLeft = vv && pinchZoom > 1.01 ? vv.offsetLeft : 0;
      const pinchTop = vv && pinchZoom > 1.01 ? vv.offsetTop : 0;
      const total = Math.max(0.33, Math.min(4.0, pageZoom * pinchZoom));
      return {
        zoomFactor: Math.round(total * 1000) / 1000,
        pinchLeft: Math.round(pinchLeft),
        pinchTop: Math.round(pinchTop),
      };
    };

    let rafId: number;
    const handleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const next = computeZoom();
        setZoomState((prev) =>
          Math.abs(prev.zoomFactor - next.zoomFactor) > 0.005 ||
          Math.abs(prev.pinchLeft - next.pinchLeft) > 1 ||
          Math.abs(prev.pinchTop - next.pinchTop) > 1
            ? next
            : prev
        );
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

  return zoomState;
}

/**
 * ThemeWallpaperArt — Ultra-Calm Low-Sensory Ambient Background Layer
 * Designed specifically to eliminate peripheral visual noise, motion fatigue,
 * and cognitive clutter for neurodivergent and sensory-sensitive users.
 *
 * Features:
 * 1. Single Ultra-HD full-screen background (NO repeating tiles or vertical seams).
 * 2. 4K Ultra-HD resolution asset (4096x2284) with crisp, authentic hand-drawn watercolor details.
 * 3. Invariant zoom scaling: When zooming in (browser zoom Ctrl +/- or pinch zoom),
 *    the background dynamically counter-scales so the wallpaper does NOT zoom in.
 */
export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  pattern,
  category,
  wallpaperUrl,
  className = '',
}) => {
  // Check if Ribbit Pond is active (by wallpaperUrl, category, or pattern)
  const isRibbitPond =
    wallpaperUrl?.includes('frog') ||
    wallpaperUrl?.includes('ribbit') ||
    category === 'frog' ||
    pattern === 'lily_pads';

  // Check if Dino Kingdom is active (by wallpaperUrl, category, or pattern)
  const isDinoKingdom =
    wallpaperUrl?.includes('dino') ||
    category === 'dinosaur' ||
    pattern === 'dino_footprints';

  // Check if Turtle Sanctuary is active (by wallpaperUrl, category, or pattern)
  const isTurtleSanctuary =
    wallpaperUrl?.includes('turtle') ||
    category === 'turtle' ||
    pattern === 'turtle_shell';

  // Check if Default Honey Theme is active
  const isHoneyClassic =
    wallpaperUrl?.includes('honey') ||
    category === 'classic' ||
    pattern === 'honeycomb_clouds' ||
    (!wallpaperUrl && (!pattern || pattern === 'none') && !category);

  const effectiveWallpaper =
    wallpaperUrl ||
    (isRibbitPond
      ? '/assets/wallpapers/ribbit_pond_bg.webp'
      : isDinoKingdom
        ? '/assets/wallpapers/dino_kingdom_bg.webp'
        : isTurtleSanctuary
          ? '/assets/wallpapers/turtle_sanctuary_bg.webp'
          : isHoneyClassic
            ? '/assets/wallpapers/default_honey_theme_bg.webp'
            : undefined);

  const { zoomFactor, pinchLeft, pinchTop } = useViewportZoom();

  const bgColor = isRibbitPond ? '#FAF7EE' : isDinoKingdom ? '#FAF6EC' : isTurtleSanctuary ? '#FAF7EE' : '#FEF9F1';

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      style={effectiveWallpaper ? { backgroundColor: bgColor } : undefined}
    >
      {effectiveWallpaper && (
        <div
          className="absolute pointer-events-none select-none will-change-transform"
          style={{
            top: '50%',
            left: '50%',
            width: `${100 * zoomFactor}%`,
            height: `${100 * zoomFactor}%`,
            minWidth: `${100 * zoomFactor}%`,
            minHeight: `${100 * zoomFactor}%`,
            transform: `translate(calc(-50% + ${pinchLeft}px), calc(-50% + ${pinchTop}px)) scale(${1 / zoomFactor})`,
            transformOrigin: 'center center',
            backgroundImage: `url('${effectiveWallpaper}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Subtle ambient lighting overlay to ensure clean card readability and low glare */}
      <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/[0.02] pointer-events-none" />
    </div>
  );
};
