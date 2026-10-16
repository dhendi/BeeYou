import React, { useEffect, useState, useRef } from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
  wallpaperUrl?: string;
}

interface ZoomState {
  zoomFactor: number;
  pinchLeft: number;
  pinchTop: number;
}

/**
 * Common standard display scales (Windows / macOS / Android / iOS).
 * Snapping to these values ensures true native device pixel ratio detection
 * without being skewed by fractional browser window borders.
 */
const COMMON_NATIVE_SCALES = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0];

function snapToStandardDpr(val: number): number {
  for (const s of COMMON_NATIVE_SCALES) {
    if (Math.abs(val - s) < 0.08) {
      return s;
    }
  }
  return val;
}

/**
 * useViewportZoom — Detects both desktop page zoom (Ctrl +/- / Cmd +/-)
 * and mobile/tablet pinch-to-zoom (VisualViewport scale) to counter-scale
 * fixed background layers so wallpapers remain at true 1:1 physical screen scale.
 */
function useViewportZoom(): ZoomState {
  const [zoomState, setZoomState] = useState<ZoomState>({
    zoomFactor: 1,
    pinchLeft: 0,
    pinchTop: 0,
  });

  const baseDprRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouchMobile =
      'ontouchstart' in window &&
      (window.matchMedia('(max-width: 1024px)').matches || navigator.maxTouchPoints > 1);

    // Compute or retrieve baseline DPR
    if (baseDprRef.current === null) {
      const currentDpr = window.devicePixelRatio || 1;
      const stored = sessionStorage.getItem('beeyou_native_dpr');
      if (stored && !isNaN(Number(stored)) && Number(stored) > 0.4) {
        baseDprRef.current = Number(stored);
      } else {
        if (isTouchMobile) {
          baseDprRef.current = currentDpr;
        } else {
          // On desktop, estimate whether browser was already zoomed on initial load
          const estZoom =
            window.outerWidth > 0 && window.innerWidth > 0
              ? window.outerWidth / window.innerWidth
              : 1;
          const rawNative = estZoom > 0.4 && estZoom < 4.0 ? currentDpr / estZoom : currentDpr;
          const snapped = snapToStandardDpr(rawNative);
          baseDprRef.current = snapped;
        }
        try {
          sessionStorage.setItem('beeyou_native_dpr', String(baseDprRef.current));
        } catch {}
      }
    }

    const calculateCurrentZoom = (): ZoomState => {
      const currentDpr = window.devicePixelRatio || 1;
      const baseDpr = baseDprRef.current || currentDpr;

      // 1. Desktop full-page zoom factor (Ctrl +/-)
      const rawPageZoom = isTouchMobile ? 1 : baseDpr > 0 ? currentDpr / baseDpr : 1;
      const pageZoom = Math.max(0.33, Math.min(4.0, rawPageZoom));

      // 2. Pinch zoom factor and pan offsets (mobile/touch gestures)
      const vv = window.visualViewport;
      const pinchScale = vv ? vv.scale : 1;
      const pinchLeft = vv && pinchScale > 1.01 ? vv.offsetLeft : 0;
      const pinchTop = vv && pinchScale > 1.01 ? vv.offsetTop : 0;

      // Combined zoom level
      const total = Math.max(0.25, Math.min(5.0, pageZoom * pinchScale));

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
        const next = calculateCurrentZoom();
        setZoomState((prev) => {
          if (
            Math.abs(prev.zoomFactor - next.zoomFactor) > 0.005 ||
            Math.abs(prev.pinchLeft - next.pinchLeft) > 1 ||
            Math.abs(prev.pinchTop - next.pinchTop) > 1
          ) {
            return next;
          }
          return prev;
        });
      });
    };

    // Listen to window resize and orientation changes
    window.addEventListener('resize', handleUpdate, { passive: true });

    // Listen to visual viewport pinch and pan changes
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', handleUpdate, { passive: true });
      vv.addEventListener('scroll', handleUpdate, { passive: true });
    }

    // Listen to resolution media queries (triggers immediately on Ctrl +/- in Chrome/Firefox/Safari)
    let mqList: MediaQueryList | null = null;
    const updateResolutionListener = () => {
      if (mqList) {
        mqList.removeEventListener('change', onResolutionChange);
      }
      try {
        mqList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        mqList.addEventListener('change', onResolutionChange);
      } catch {}
    };

    const onResolutionChange = () => {
      handleUpdate();
      updateResolutionListener();
    };

    updateResolutionListener();
    handleUpdate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleUpdate);
      if (vv) {
        vv.removeEventListener('resize', handleUpdate);
        vv.removeEventListener('scroll', handleUpdate);
      }
      if (mqList) {
        mqList.removeEventListener('change', onResolutionChange);
      }
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
 * 1. 4K Ultra-HD resolution asset with crisp, anti-aliased honeycombs and clouds.
 * 2. Invariant Physical Scale: When zooming in (browser zoom or pinch zoom),
 *    the background counter-scales dynamically so it stays razor-sharp and NEVER zooms in.
 */
export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  pattern,
  wallpaperUrl,
  className = '',
}) => {
  const isDefaultOrHoneycomb =
    pattern === 'honeycomb_clouds' || (!wallpaperUrl && (!pattern || pattern === 'none'));
  
  // Prefer ultra-high-definition WebP asset (4096x2284), with fallback to JPG
  const effectiveWallpaper =
    wallpaperUrl ||
    (isDefaultOrHoneycomb
      ? '/assets/wallpapers/default_honey_theme_bg.webp'
      : undefined);

  const zoomState = useViewportZoom();

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
      style={{ backgroundColor: '#FEF9F1' }}
    >
      {effectiveWallpaper ? (
        <div
          className="absolute pointer-events-none select-none will-change-transform"
          style={{
            top: '50%',
            left: '50%',
            width: `${100 * zoomState.zoomFactor}%`,
            height: `${100 * zoomState.zoomFactor}%`,
            minWidth: `${100 * zoomState.zoomFactor}%`,
            minHeight: `${100 * zoomState.zoomFactor}%`,
            transform: `translate(calc(-50% + ${zoomState.pinchLeft}px), calc(-50% + ${zoomState.pinchTop}px)) scale(${1 / zoomState.zoomFactor})`,
            transformOrigin: 'center center',
            backgroundImage: `url('${effectiveWallpaper}'), url('/assets/wallpapers/default_honey_theme_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : null}

      {/* Subtle ambient lighting overlay to ensure clean card readability and low glare */}
      <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-black/[0.02] pointer-events-none" />
    </div>
  );
};
