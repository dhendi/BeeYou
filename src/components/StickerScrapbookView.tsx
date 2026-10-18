import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  SCRAPBOOK_STICKER_CATALOG, 
  ScrapbookCatalogItem 
} from '../data/scrapbookCatalog';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';
import { 
  RotateCw, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  Award, 
  Star, 
  BookOpen, 
  Check, 
  X,
  Layers,
  Eye,
  RefreshCw,
  Printer
} from 'lucide-react';

export type ScrapbookTheme = 'bedroom' | 'park' | 'starry' | 'kraft';

export interface PlacedSticker {
  id: string;
  catalogId: string;
  emoji: string;
  title: string;
  src?: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  rotation: number; // degrees (-45 to 45)
  sizeMultiplier: number; // 0.8, 1.0, 1.3
}

export interface ScrapbookPageData {
  id: number;
  title: string;
  theme: ScrapbookTheme;
  stickers: PlacedSticker[];
}

export const SCRAPBOOK_STORAGE_KEY = 'beeyou_sticker_scrapbook_pages_v1';
const STORAGE_KEY = SCRAPBOOK_STORAGE_KEY;

export const DEFAULT_SCRAPBOOK_PAGES: ScrapbookPageData[] = [
  {
    id: 1,
    title: 'Morning Sun & Cozy Breakfast',
    theme: 'bedroom',
    stickers: [
      {
        id: 'init-1',
        catalogId: 'stk-morning-sun',
        emoji: '🌅',
        title: 'Morning Superstar',
        src: '/assets/stickers/morning_sunrise.webp',
        x: 22,
        y: 28,
        rotation: -6,
        sizeMultiplier: 1.1,
      },
      {
        id: 'init-2',
        catalogId: 'stk-pancakes',
        emoji: '🥞',
        title: 'Fluffy Pancakes',
        src: '/assets/stickers/pancakes_breakfast.webp',
        x: 68,
        y: 62,
        rotation: 4,
        sizeMultiplier: 1.0,
      },
      {
        id: 'init-3',
        catalogId: 'stk-sparkle-chomper',
        emoji: '🪥',
        title: 'Sparkle Chomper',
        src: '/assets/stickers/toothbrush.webp',
        x: 32,
        y: 68,
        rotation: 8,
        sizeMultiplier: 0.95,
      },
    ],
  },
  {
    id: 2,
    title: 'Sunny Park & Dino Play',
    theme: 'park',
    stickers: [
      {
        id: 'init-4',
        catalogId: 'stk-dino-rex',
        emoji: '🦖',
        title: 'Friendly Dino Rex',
        src: '/assets/stickers/dino_rex.webp',
        x: 48,
        y: 45,
        rotation: 0,
        sizeMultiplier: 1.25,
      },
    ],
  },
  {
    id: 3,
    title: 'Sweet Dreams Under the Stars',
    theme: 'starry',
    stickers: [
      {
        id: 'init-5',
        catalogId: 'stk-starry-dreamer',
        emoji: '🌙',
        title: 'Starry Dreamer',
        src: '/assets/stickers/evening_moon.webp',
        x: 50,
        y: 35,
        rotation: -4,
        sizeMultiplier: 1.2,
      },
    ],
  },
];
const DEFAULT_PAGES = DEFAULT_SCRAPBOOK_PAGES;

export const SCRAPBOOK_THEME_CONFIG: Record<
  ScrapbookTheme,
  {
    name: string;
    bgClass: string;
    pageBorder: string;
    description: string;
    icon: string;
  }
> = {
  bedroom: {
    name: 'Cozy Bedroom Desk',
    bgClass: 'bg-gradient-to-b from-amber-50 via-orange-50/40 to-yellow-50/70',
    pageBorder: 'border-amber-200/80',
    description: 'Warm morning light, wooden desk & gentle sunrise breeze',
    icon: '🌅',
  },
  park: {
    name: 'Sunny Park Meadow',
    bgClass: 'bg-gradient-to-b from-sky-50 via-emerald-50/40 to-lime-50/60',
    pageBorder: 'border-emerald-200/80',
    description: 'Fresh green meadow, playground fun & open sky',
    icon: '🌳',
  },
  starry: {
    name: 'Midnight Starry Sky',
    bgClass: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white',
    pageBorder: 'border-indigo-500/40',
    description: 'Quiet starry cosmos with gentle celestial glow',
    icon: '🌌',
  },
  kraft: {
    name: 'Kraft Paper Journal',
    bgClass: 'bg-[#F5EEDB] text-slate-800',
    pageBorder: 'border-[#DFCBB5]',
    description: 'Authentic handmade planner with washi tape borders',
    icon: '📜',
  },
};
const THEME_CONFIG = SCRAPBOOK_THEME_CONFIG;

export const StickerScrapbookView: React.FC = () => {
  const { earnedStickers, childProfile, openPrintSchedule } = useApp();

  // Load pages from localStorage or fallback
  const [pages, setPages] = useState<ScrapbookPageData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PAGES;
  });

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerCategory, setDrawerCategory] = useState<'all' | 'routine' | 'daily' | 'adventures' | 'calm'>('all');
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [celebrateStickerId, setCelebrateStickerId] = useState<string | null>(null);

  // Dragging state
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStickerIdRef = useRef<string | null>(null);
  const dragStartOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  const activePage = pages[activePageIndex] || pages[0];

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch {}
  }, [pages]);

  // Merge catalog with earned routine stickers
  const fullCatalog = SCRAPBOOK_STICKER_CATALOG;

  // Filter drawer items
  const filteredCatalog = fullCatalog.filter((item) => {
    if (drawerCategory === 'all') return true;
    return item.category === drawerCategory;
  });

  // Add sticker to current canvas
  const handleAddSticker = (item: ScrapbookCatalogItem) => {
    // Generate gentle random offset near center
    const randomOffset = (Math.random() - 0.5) * 20;
    const randomRotation = (Math.random() - 0.5) * 16;

    const newSticker: PlacedSticker = {
      id: `placed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      catalogId: item.id,
      emoji: item.emoji,
      title: item.title,
      src: item.src,
      x: Math.max(15, Math.min(80, 50 + randomOffset)),
      y: Math.max(15, Math.min(80, 50 + randomOffset)),
      rotation: Math.round(randomRotation),
      sizeMultiplier: 1.0,
    };

    setPages((prev) =>
      prev.map((page, idx) =>
        idx === activePageIndex
          ? { ...page, stickers: [...page.stickers, newSticker] }
          : page
      )
    );

    setSelectedStickerId(newSticker.id);
    playChime('star');

    // Trigger brief celebration animation
    setCelebrateStickerId(newSticker.id);
    setTimeout(() => setCelebrateStickerId(null), 1200);
  };

  // Remove sticker from page
  const handleRemoveSticker = (stickerId: string) => {
    setPages((prev) =>
      prev.map((page, idx) =>
        idx === activePageIndex
          ? { ...page, stickers: page.stickers.filter((s) => s.id !== stickerId) }
          : page
      )
    );
    if (selectedStickerId === stickerId) {
      setSelectedStickerId(null);
    }
    playChime('clear');
  };

  // Rotate selected sticker
  const handleRotateSticker = (stickerId: string) => {
    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          stickers: page.stickers.map((s) => {
            if (s.id !== stickerId) return s;
            let nextRot = s.rotation + 15;
            if (nextRot > 35) nextRot = -35;
            return { ...s, rotation: nextRot };
          }),
        };
      })
    );
    playChime('tap');
  };

  // Resize selected sticker (cycles: 0.8 -> 1.0 -> 1.3 -> 0.8)
  const handleResizeSticker = (stickerId: string) => {
    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          stickers: page.stickers.map((s) => {
            if (s.id !== stickerId) return s;
            let nextSize = 1.0;
            if (s.sizeMultiplier < 0.9) nextSize = 1.0;
            else if (s.sizeMultiplier >= 0.9 && s.sizeMultiplier < 1.2) nextSize = 1.3;
            else nextSize = 0.8;
            return { ...s, sizeMultiplier: nextSize };
          }),
        };
      })
    );
    playChime('tap');
  };

  // Trigger star cheer effect
  const handleCelebrateSticker = (stickerId: string) => {
    setCelebrateStickerId(stickerId);
    playChime('star');
    setTimeout(() => setCelebrateStickerId(null), 1200);
  };

  // Switch Theme for current page
  const handleChangeTheme = (theme: ScrapbookTheme) => {
    setPages((prev) =>
      prev.map((page, idx) =>
        idx === activePageIndex ? { ...page, theme } : page
      )
    );
    playChime('tap');
  };

  // Pointer drag handling for placed stickers
  const handlePointerDown = (e: React.PointerEvent, sticker: PlacedSticker) => {
    e.stopPropagation();
    setSelectedStickerId(sticker.id);
    isDraggingRef.current = true;
    dragStickerIdRef.current = sticker.id;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;
      dragStartOffsetRef.current = {
        offsetX: clickXPercent - sticker.x,
        offsetY: clickYPercent - sticker.y,
      };
    }

    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStickerIdRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const currentYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    let targetX = currentXPercent - dragStartOffsetRef.current.offsetX;
    let targetY = currentYPercent - dragStartOffsetRef.current.offsetY;

    // Constrain inside page boundary
    targetX = Math.max(5, Math.min(95, targetX));
    targetY = Math.max(5, Math.min(95, targetY));

    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          stickers: page.stickers.map((s) =>
            s.id === dragStickerIdRef.current
              ? { ...s, x: Math.round(targetX * 10) / 10, y: Math.round(targetY * 10) / 10 }
              : s
          ),
        };
      })
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStickerIdRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Clear all stickers on current page
  const handleClearCurrentPage = () => {
    if (activePage.stickers.length === 0) return;
    if (window.confirm('Clear all stickers from this scrapbook page?')) {
      setPages((prev) =>
        prev.map((page, idx) =>
          idx === activePageIndex ? { ...page, stickers: [] } : page
        )
      );
      setSelectedStickerId(null);
      playChime('clear');
    }
  };

  const themeConfig = THEME_CONFIG[activePage.theme] || THEME_CONFIG.bedroom;

  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto pb-20 select-none animate-in fade-in duration-200">
      {/* 1. TOP HEADER & SCRAPBOOK CONTROLS */}
      {!isPresentMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-sm border-2 border-amber-200/80 rounded-3xl p-3.5 sm:p-4 mb-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-2xl shadow-xs shrink-0">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  {childProfile.name ? `${childProfile.name}'s Sticker Scrapbook` : 'My Sticker Scrapbook'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] shadow-2xs">
                  {activePage.stickers.length} on page
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Peel, stick, rotate, and decorate your rewarding routine scenes!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            {/* Theme Picker Dropdown Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(Object.keys(THEME_CONFIG) as ScrapbookTheme[]).map((thm) => (
                <button
                  key={thm}
                  type="button"
                  title={THEME_CONFIG[thm].name}
                  onClick={() => handleChangeTheme(thm)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all cursor-pointer ${
                    activePage.theme === thm
                      ? 'bg-white shadow-xs scale-105 border border-amber-300'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {THEME_CONFIG[thm].icon}
                </button>
              ))}
            </div>

            {/* Present Poster Mode */}
            <button
              type="button"
              onClick={() => {
                setIsPresentMode(true);
                setSelectedStickerId(null);
                playChime('tap');
              }}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Poster</span>
            </button>

            {/* Print / Export Scrapbook Page */}
            <button
              type="button"
              onClick={() => {
                openPrintSchedule({ mode: 'scrapbook', pageIndex: activePageIndex });
                playChime('tap');
              }}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Print or export this scrapbook page"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>

            {/* Clear page */}
            {activePage.stickers.length > 0 && (
              <button
                type="button"
                onClick={handleClearCurrentPage}
                title="Clear all stickers from this page"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. PAGE NAVIGATION TABS */}
      {!isPresentMode && (
        <div className="flex items-center justify-between gap-2 px-1 mb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePageIndex(idx);
                  setSelectedStickerId(null);
                  playChime('tap');
                }}
                className={`px-3.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  activePageIndex === idx
                    ? 'bg-amber-500 text-white shadow-xs scale-102 ring-2 ring-amber-300'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <span>Page {p.id}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activePageIndex === idx ? 'bg-amber-600/70 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.stickers.length}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[11px] font-bold text-slate-500 hidden sm:block truncate">
            {themeConfig.name}
          </p>
        </div>
      )}

      {/* 3. SCRAPBOOK CANVAS BOARD */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => setSelectedStickerId(null)}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] min-h-[340px] sm:min-h-[440px] rounded-3xl border-4 ${themeConfig.pageBorder} ${themeConfig.bgClass} shadow-xl overflow-hidden touch-none transition-all duration-300`}
      >
        {/* Full Poster Exit Button */}
        {isPresentMode && (
          <button
            type="button"
            onClick={() => setIsPresentMode(false)}
            className="absolute top-4 right-4 z-40 px-3.5 py-2 rounded-2xl bg-white/90 text-slate-800 font-black text-xs shadow-md border border-slate-200 flex items-center gap-1.5 cursor-pointer hover:bg-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4 text-slate-600" />
            <span>Exit Poster View</span>
          </button>
        )}

        {/* Washi Tape Corner Accents for Kraft/Journal Theme */}
        {activePage.theme === 'kraft' && (
          <>
            <div className="absolute -top-3 -left-3 w-16 h-8 bg-amber-200/60 -rotate-45 border-y border-amber-300/60 pointer-events-none shadow-2xs" />
            <div className="absolute -top-3 -right-3 w-16 h-8 bg-sky-200/60 rotate-45 border-y border-sky-300/60 pointer-events-none shadow-2xs" />
            <div className="absolute -bottom-3 -left-3 w-16 h-8 bg-pink-200/60 rotate-45 border-y border-pink-300/60 pointer-events-none shadow-2xs" />
            <div className="absolute -bottom-3 -right-3 w-16 h-8 bg-emerald-200/60 -rotate-45 border-y border-emerald-300/60 pointer-events-none shadow-2xs" />
          </>
        )}

        {/* Thematic Ambient Elements */}
        {activePage.theme === 'starry' && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-8 left-12 text-yellow-200 text-sm animate-pulse">✦</div>
            <div className="absolute top-16 right-20 text-yellow-100 text-lg animate-pulse delay-300">★</div>
            <div className="absolute bottom-12 left-1/3 text-sky-200 text-xs animate-pulse delay-700">✦</div>
            <div className="absolute top-1/2 right-12 text-amber-200 text-sm animate-pulse delay-500">★</div>
          </div>
        )}

        {activePage.theme === 'bedroom' && (
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-amber-200/30 to-transparent pointer-events-none border-t border-amber-200/40" />
        )}

        {activePage.theme === 'park' && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-emerald-300/30 to-transparent pointer-events-none border-t border-emerald-300/40 rounded-b-3xl" />
        )}

        {/* Placed Stickers */}
        {activePage.stickers.map((sticker) => {
          const isSelected = selectedStickerId === sticker.id && !isPresentMode;
          const isCelebrating = celebrateStickerId === sticker.id;

          const baseSize = 64;
          const pixelSize = Math.round(baseSize * sticker.sizeMultiplier);

          return (
            <div
              key={sticker.id}
              onPointerDown={(e) => handlePointerDown(e, sticker)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStickerId(sticker.id);
                playChime('tap');
              }}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                width: pixelSize,
                height: pixelSize,
              }}
              className={`absolute select-none cursor-grab active:cursor-grabbing transition-transform touch-none group ${
                isSelected ? 'z-30' : 'z-20 hover:z-25'
              }`}
            >
              {/* Sticker Content */}
              <div
                className={`relative w-full h-full flex items-center justify-center p-1 rounded-2xl transition-all ${
                  isSelected
                    ? 'ring-3 ring-amber-400 bg-white/30 backdrop-blur-2xs shadow-xl scale-105'
                    : 'hover:scale-102 drop-shadow-md'
                }`}
              >
                {sticker.src ? (
                  <img
                    src={sticker.src}
                    alt={sticker.title}
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
                  />
                ) : (
                  <RoutineStickerIcon
                    emoji={sticker.emoji}
                    title={sticker.title}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
                  />
                )}

                {/* Star Cheer Burst Animation */}
                {isCelebrating && (
                  <div className="absolute -inset-3 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                    <span className="text-xl animate-ping absolute -top-1 -right-1">⭐</span>
                    <span className="text-lg animate-ping absolute -bottom-1 -left-1 delay-100">⭐</span>
                  </div>
                )}
              </div>

              {/* FLOATING ACTION TOOLBAR ON ACTIVE STICKER */}
              {isSelected && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-2xl shadow-xl border border-amber-300 z-50 animate-in fade-in zoom-in-90 duration-150"
                >
                  {/* Rotate */}
                  <button
                    type="button"
                    title="Rotate Sticker"
                    onClick={() => handleRotateSticker(sticker.id)}
                    className="w-7 h-7 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Resize */}
                  <button
                    type="button"
                    title="Change Size (Small / Regular / Large)"
                    onClick={() => handleResizeSticker(sticker.id)}
                    className="w-7 h-7 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  >
                    {sticker.sizeMultiplier > 1.1 ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Star Cheer */}
                  <button
                    type="button"
                    title="Star Cheer"
                    onClick={() => handleCelebrateSticker(sticker.id)}
                    className="w-7 h-7 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  {/* Peel Off / Delete */}
                  <button
                    type="button"
                    title="Peel Off Sticker"
                    onClick={() => handleRemoveSticker(sticker.id)}
                    className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty Canvas Hint */}
        {activePage.stickers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            <div className="w-16 h-16 rounded-3xl bg-white/70 backdrop-blur-xs flex items-center justify-center text-3xl shadow-sm mb-3">
              🎨
            </div>
            <p className="font-black text-sm text-slate-700">This scrapbook page is ready for stickers!</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Tap any sticker from your sticker box below to peel and place it on your scene.
            </p>
          </div>
        )}
      </div>

      {/* 4. STICKER TRAY / DRAWER (THE STICKER BOX) */}
      {!isPresentMode && (
        <div className="mt-3 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-amber-200/80 p-3 sm:p-4 shadow-sm space-y-2.5">
          {/* Drawer Header & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Sticker Box Drawer</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                (Tap to place on canvas)
              </span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {[
                { id: 'all', label: 'All Stickers' },
                { id: 'routine', label: '🏆 Routines' },
                { id: 'daily', label: '⭐ Daily Care' },
                { id: 'adventures', label: '🚀 Adventures' },
                { id: 'calm', label: '🌈 Comfort' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setDrawerCategory(cat.id as any);
                    playChime('tap');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
                    drawerCategory === cat.id
                      ? 'bg-amber-400 text-amber-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stickers Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddSticker(item)}
                title={`Place ${item.title}`}
                className="group p-2 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/70 hover:border-amber-400 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-92 shadow-2xs min-h-[64px]"
              >
                <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-9 h-9 object-contain drop-shadow-2xs select-none pointer-events-none"
                    />
                  ) : (
                    <RoutineStickerIcon
                      emoji={item.emoji}
                      title={item.title}
                      className="w-9 h-9 object-contain drop-shadow-2xs select-none pointer-events-none"
                    />
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-700 truncate w-full text-center leading-tight">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
