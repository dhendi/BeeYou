import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { t, getLanguage } from '../services/translator';
import { 
  X, 
  Printer, 
  Download, 
  CheckSquare, 
  Scissors, 
  ArrowRight, 
  BookOpen, 
  Palette, 
  Star, 
  Clock, 
  Check, 
  Layers,
  Sun,
  Smile
} from 'lucide-react';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { 
  ScrapbookPageData, 
  SCRAPBOOK_STORAGE_KEY, 
  DEFAULT_SCRAPBOOK_PAGES, 
  SCRAPBOOK_THEME_CONFIG,
  ScrapbookTheme
} from './StickerScrapbookView';
import { Routine, VisualScheduleStep } from '../types';

export const PrintScheduleModal: React.FC = () => {
  const {
    showPrintScheduleModal,
    setShowPrintScheduleModal,
    printScheduleConfig,
    routines,
    childProfile,
    settings,
  } = useApp();

  // Re-render when language changes
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handleLangChange = () => setLangTick((n) => n + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  const activeLang = settings?.language || getLanguage() || 'en';
  const dateLocale = activeLang === 'en' ? 'en-US' : (activeLang === 'fr_ca' ? 'fr-CA' : activeLang);

  if (!showPrintScheduleModal) return null;

  // Active print mode: 'checklist' | 'cards' | 'first-then' | 'scrapbook'
  const [activeMode, setActiveMode] = useState<'checklist' | 'cards' | 'first-then' | 'scrapbook'>(
    printScheduleConfig.mode || 'checklist'
  );

  // Selected routine ID to print
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(() => {
    if (printScheduleConfig.routineId) return printScheduleConfig.routineId;
    return routines[0]?.id || 'routine-morning';
  });

  // Selected scrapbook page index
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(
    printScheduleConfig.pageIndex ?? 0
  );

  // Color mode: 'color' vs 'bw' (ink saver)
  const [colorMode, setColorMode] = useState<'color' | 'bw'>('color');

  // PECS card layout: 'standard' (6 cards/page) vs 'compact' (8 cards/page)
  const [cardDensity, setCardDensity] = useState<'standard' | 'compact'>('standard');

  // Checklist checkmark style
  const [checkStyle, setCheckStyle] = useState<'circle' | 'square' | 'star'>('circle');

  // First-Then custom step indices
  const [firstStepIndex, setFirstStepIndex] = useState<number>(0);
  const [thenStepIndex, setThenStepIndex] = useState<number>(1);

  // Include Holding Board in PECS mode
  const [includeHolderBoard, setIncludeHolderBoard] = useState<boolean>(true);

  // Load scrapbook pages
  const [scrapbookPages, setScrapbookPages] = useState<ScrapbookPageData[]>(() => {
    try {
      const saved = localStorage.getItem(SCRAPBOOK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SCRAPBOOK_PAGES;
  });

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];
  const activeScrapbookPage = scrapbookPages[selectedPageIndex] || scrapbookPages[0];

  const printableRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setShowPrintScheduleModal(false);
    playChime('tap');
  };

  const handlePrint = () => {
    playChime('star');
    // Ensure all images and layouts are committed before opening print dialog
    setTimeout(() => {
      window.print();
    }, 60);
  };

  // Instant PNG download using HTML SVG foreignObject rasterization
  const handleDownloadImage = async () => {
    if (!printableRef.current) return;
    playChime('complete');

    try {
      const el = printableRef.current;
      const width = el.offsetWidth || 800;
      const height = el.offsetHeight || 1100;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;

      const wrapper = document.createElement('div');
      wrapper.appendChild(clone);

      const html = wrapper.innerHTML;
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; width:${width}px; height:${height}px;">
              ${html}
            </div>
          </foreignObject>
        </svg>
      `;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2; // high res
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          const titleSlug = (selectedRoutine?.title || 'schedule').toLowerCase().replace(/\s+/g, '-');
          downloadLink.download = `beeyou-${activeMode}-${titleSlug}.png`;
          downloadLink.href = pngUrl;
          downloadLink.click();
        }
        URL.revokeObjectURL(blobURL);
      };
      img.onerror = () => {
        // Fallback to window.print if foreignObject cross-origin restricts canvas
        window.print();
        URL.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    } catch {
      window.print();
    }
  };

  const childName = childProfile.name?.trim() || t('Child');
  const theme = SCRAPBOOK_THEME_CONFIG[activeScrapbookPage?.theme || 'bedroom'] || SCRAPBOOK_THEME_CONFIG.bedroom;

  return (
    <div 
      id="beeyou-print-modal-backdrop"
      className="print-schedule-root fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200"
    >
      {/* TOP CONTROLS & SETTINGS TOOLBAR (Hidden during physical print) */}
      <header className="no-print bg-white border-b border-stone-200 shadow-sm p-3 sm:p-4 shrink-0 z-10 flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg sm:text-xl shadow-xs shrink-0">
              🖨️
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-stone-900 leading-tight truncate">
                {t('Print & Export Visual Schedules')}
              </h2>
              <p className="text-xs text-stone-500 font-medium hidden sm:block truncate">
                {t('Physical schedules, PECS cards & scrapbook posters for home, school, or fridge!')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{t('Print Now')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              title={t('Download as PNG image')}
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">{t('Save PNG')}</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title={t('Close print preview')}
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-mode Tabs & Customization Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2 border-t border-stone-100">
          {/* Format Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto max-w-full shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveMode('checklist');
                playChime('tap');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'checklist'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('Checklist Strip')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('cards');
                playChime('tap');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'cards'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('PECS Flashcards')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('first-then');
                playChime('tap');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'first-then'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('First - Then Board')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('scrapbook');
                playChime('tap');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'scrapbook'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>{t('Scrapbook Poster')}</span>
            </button>
          </div>

          {/* Contextual Options */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Routine selector (for checklist, cards, first-then) */}
            {activeMode !== 'scrapbook' && (
              <select
                aria-label={t('Select routine to print')}
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:ring-2 focus:ring-amber-400 max-w-[200px] truncate"
              >
                {routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {t(r.title)} ({r.steps.length} {t('steps')})
                  </option>
                ))}
              </select>
            )}

            {/* Scrapbook page selector */}
            {activeMode === 'scrapbook' && (
              <select
                aria-label={t('Select scrapbook page to print')}
                value={selectedPageIndex}
                onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                className="bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:ring-2 focus:ring-amber-400 max-w-[200px] truncate"
              >
                {scrapbookPages.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {t('Page')} {idx + 1}: {t(p.title)} ({p.stickers.length} {t('stickers')})
                  </option>
                ))}
              </select>
            )}

            {/* Color Mode Toggle (Color vs Ink-Saver Grayscale) */}
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setColorMode('color')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  colorMode === 'color' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-500'
                }`}
                title={t('Full color palette')}
              >
                🎨 {t('Color')}
              </button>
              <button
                type="button"
                onClick={() => setColorMode('bw')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  colorMode === 'bw' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
                title={t('Ink-saver black and white for cheap printing')}
              >
                🖤 {t('Ink-Saver B&W')}
              </button>
            </div>

            {/* Card Density Toggle (when in PECS mode) */}
            {activeMode === 'cards' && (
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setCardDensity('standard')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    cardDensity === 'standard' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                  title={t('6 Large Cards per page')}
                >
                  6 {t('Cards')}
                </button>
                <button
                  type="button"
                  onClick={() => setCardDensity('compact')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    cardDensity === 'compact' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                  title={t('8 Pocket Cards per page')}
                >
                  8 {t('Cards')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* PRINTABLE PREVIEW CANVAS (The exact sheet that gets printed) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-stone-900/50">
        <div
          ref={printableRef}
          id="beeyou-printable-document"
          className={`printable-document w-full max-w-[850px] min-h-[1050px] mx-auto my-2 sm:my-6 bg-white text-stone-900 p-6 sm:p-10 pb-12 sm:pb-14 shadow-2xl rounded-2xl border border-stone-300 relative transition-all ${
            colorMode === 'bw' ? 'grayscale contrast-125' : ''
          }`}
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {/* ============================================================== */}
          {/* 1. CHECKLIST STRIP FORMAT */}
          {/* ============================================================== */}
          {activeMode === 'checklist' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b-4 border-amber-400 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shrink-0">
                    <RoutineStickerIcon
                      emoji={selectedRoutine.emoji || '⭐'}
                      title={selectedRoutine.title}
                      size={44}
                      className="w-11 h-11 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block">
                      {t("{childName}'s Visual Daily Schedule").replace('{childName}', childName)}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                      {t(selectedRoutine.title)}
                    </h1>
                    <p className="text-xs text-stone-500 font-medium">
                      {t('Scheduled for')}: <strong>{t(selectedRoutine.time || 'Daily')}</strong> • {t('One step at a time!')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                    {t('BeeYou Daily Schedule')}
                  </div>
                  <div className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 mt-1">
                    {selectedRoutine.steps.length} {t('Steps Total')}
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="divide-y-2 divide-stone-100">
                {selectedRoutine.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="py-3.5 flex items-center justify-between gap-4 print-avoid-break"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Step Number Circle */}
                      <span className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-300 font-black text-xs text-stone-700 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center shrink-0 p-1">
                        <RoutineStickerIcon
                          emoji={step.emoji || '⭐'}
                          title={step.title}
                          size={38}
                          className="w-9 h-9 object-contain"
                        />
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                          {t(step.title)}
                        </h3>
                        {step.instruction && (
                          <p className="text-xs text-stone-500 font-medium mt-0.5 leading-snug">
                            {t(step.instruction)}
                          </p>
                        )}
                        {step.sensoryNote && (
                          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                            💡 {t('Sensory tip')}: {t(step.sensoryNote)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side: Duration + Physical Checkbox Box */}
                    <div className="flex items-center gap-4 shrink-0">
                      {step.durationMin && (
                        <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{step.durationMin}{t('m')}</span>
                        </span>
                      )}

                      {/* Large dry-erase checkbox for laminating */}
                      <div className="w-8 h-8 rounded-xl border-3 border-stone-400 bg-white flex items-center justify-center hover:border-amber-500 transition-colors">
                        <span className="text-stone-200 text-xs font-bold">✓</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completion Reward & Footer */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-stone-300 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <span className="text-xs font-black text-stone-900 block">
                      {t('When all steps are completed:')}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {t('Great perseverance! Celebrate with your caregiver or add a sticker to your Scrapbook.')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-stone-400">
                  <span>{t('Parent / Teacher Notes:')} ______________________</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. PECS FLASHCARDS FORMAT (Cut along dashed lines) */}
          {/* ============================================================== */}
          {activeMode === 'cards' && (
            <div className="space-y-6">
              {/* Cutting Instructions Banner */}
              <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2">
                <div className="flex items-center gap-2 text-stone-600 text-xs font-bold">
                  <Scissors className="w-4 h-4 text-stone-400" />
                  <span>
                    ✂️ {t('Cut along dashed lines. Laminate and add a Velcro dot to the top circle.')}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  {t(selectedRoutine.title)} • {selectedRoutine.steps.length} {t('Cards')}
                </span>
              </div>

              {/* Grid of PECS Cards */}
              <div
                className={`grid gap-4 ${
                  cardDensity === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {selectedRoutine.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="border-2 border-dashed border-stone-400 rounded-3xl p-4 flex flex-col items-center justify-between text-center bg-white min-h-[170px] relative shadow-2xs print-avoid-break"
                  >
                    {/* Velcro Dot Target Marker */}
                    <div className="w-4 h-4 rounded-full border border-stone-300 bg-stone-100 flex items-center justify-center text-[7px] text-stone-400 font-bold mb-1">
                      ◎
                    </div>

                    {/* Step Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-50 to-yellow-50 border border-stone-200 flex items-center justify-center p-2 shadow-xs my-1">
                      <RoutineStickerIcon
                        emoji={step.emoji || '⭐'}
                        title={step.title}
                        size={52}
                        className="w-13 h-13 object-contain drop-shadow-2xs"
                      />
                    </div>

                    {/* Step Title & Duration */}
                    <div className="w-full">
                      <span className="font-black text-xs sm:text-sm text-stone-900 block leading-tight truncate">
                        {t(step.title)}
                      </span>
                      {step.durationMin && (
                        <span className="text-[10px] font-bold text-stone-400 block mt-0.5">
                          ⏱️ {step.durationMin} {t('min')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Schedule Holder Board Strip */}
              {includeHolderBoard && (
                <div className="mt-8 pt-6 border-t-3 border-stone-300 print-avoid-break">
                  <div className="flex items-center justify-between text-xs font-black text-stone-500 mb-2 uppercase tracking-wider">
                    <span>✂️ {t('Cut-Out Daily Schedule Holder Board (Attach Velcro strip below)')}</span>
                    <span>{t('BeeYou PECS Board')}</span>
                  </div>

                  <div className="border-3 border-stone-800 rounded-3xl p-4 bg-stone-50 grid grid-cols-2 gap-4">
                    {/* Left: TO DO */}
                    <div className="bg-amber-100/70 border-2 border-dashed border-amber-400 rounded-2xl p-4 text-center min-h-[110px] flex flex-col justify-between">
                      <span className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span>📌 {t('TO DO')}</span>
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-500 bg-white flex items-center justify-center text-[9px] text-amber-600 font-bold">
                          {t('Velcro')}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-500 bg-white flex items-center justify-center text-[9px] text-amber-600 font-bold">
                          {t('Velcro')}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-500 bg-white flex items-center justify-center text-[9px] text-amber-600 font-bold">
                          {t('Velcro')}
                        </div>
                      </div>
                    </div>

                    {/* Right: ALL DONE */}
                    <div className="bg-emerald-100/70 border-2 border-dashed border-emerald-400 rounded-2xl p-4 text-center min-h-[110px] flex flex-col justify-between">
                      <span className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span>🎉 {t('ALL DONE!')}</span>
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 bg-white flex items-center justify-center text-[9px] text-emerald-600 font-bold">
                          {t('Velcro')}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 bg-white flex items-center justify-center text-[9px] text-emerald-600 font-bold">
                          {t('Velcro')}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 bg-white flex items-center justify-center text-[9px] text-emerald-600 font-bold">
                          {t('Velcro')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. FIRST - THEN VISUAL AID BOARD */}
          {/* ============================================================== */}
          {activeMode === 'first-then' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-stone-200 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 block">
                  {t("{childName}'s Visual Pacer").replace('{childName}', childName)}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                  {t('FIRST ➔ THEN Visual Guide')}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {t('Complete step 1 first, then enjoy the rewarding step 2!')}
                </p>
              </div>

              {/* Selector Bar in Preview (Hidden during print) */}
              <div className="no-print bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700">1. {t('First Activity:')}</span>
                  <select
                    aria-label={t('Select first activity')}
                    value={firstStepIndex}
                    onChange={(e) => setFirstStepIndex(Number(e.target.value))}
                    className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                  >
                    {selectedRoutine.steps.map((s, i) => (
                      <option key={i} value={i}>
                        {t(s.title)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sky-700">2. {t('Then Activity:')}</span>
                  <select
                    aria-label={t('Select then activity')}
                    value={thenStepIndex}
                    onChange={(e) => setThenStepIndex(Number(e.target.value))}
                    className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs"
                  >
                    {selectedRoutine.steps.map((s, i) => (
                      <option key={i} value={i}>
                        {t(s.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Large Printable First-Then Card Pair */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* FIRST Card */}
                {(() => {
                  const step1 = selectedRoutine.steps[firstStepIndex] || selectedRoutine.steps[0];
                  return (
                    <div className="border-4 border-emerald-500 rounded-3xl p-6 bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-center flex flex-col items-center justify-between min-h-[300px] shadow-md">
                      <span className="px-5 py-1.5 rounded-full bg-emerald-600 text-white font-black text-base uppercase tracking-wider shadow-xs">
                        {t('1. FIRST')}
                      </span>

                      <div className="w-28 h-28 rounded-3xl bg-white border-2 border-emerald-200 flex items-center justify-center p-3 shadow-md my-4">
                        <RoutineStickerIcon
                          emoji={step1.emoji || '⭐'}
                          title={step1.title}
                          size={88}
                          className="w-22 h-22 object-contain"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                          {t(step1.title)}
                        </h3>
                        {step1.instruction && (
                          <p className="text-xs text-stone-600 font-semibold mt-1">
                            {t(step1.instruction)}
                          </p>
                        )}
                        {step1.durationMin && (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mt-2">
                            ⏱️ {step1.durationMin} {t('Minutes')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* THEN Card */}
                {(() => {
                  const step2 = selectedRoutine.steps[thenStepIndex] || selectedRoutine.steps[1] || selectedRoutine.steps[0];
                  return (
                    <div className="border-4 border-sky-500 rounded-3xl p-6 bg-gradient-to-b from-sky-50 via-white to-sky-50 text-center flex flex-col items-center justify-between min-h-[300px] shadow-md">
                      <span className="px-5 py-1.5 rounded-full bg-sky-600 text-white font-black text-base uppercase tracking-wider shadow-xs">
                        {t('2. THEN')}
                      </span>

                      <div className="w-28 h-28 rounded-3xl bg-white border-2 border-sky-200 flex items-center justify-center p-3 shadow-md my-4">
                        <RoutineStickerIcon
                          emoji={step2.emoji || '⭐'}
                          title={step2.title}
                          size={88}
                          className="w-22 h-22 object-contain"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                          {t(step2.title)}
                        </h3>
                        {step2.instruction && (
                          <p className="text-xs text-stone-600 font-semibold mt-1">
                            {t(step2.instruction)}
                          </p>
                        )}
                        <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full inline-block mt-2">
                          🎉 {t('Reward / Next Activity!')}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Encouragement Footer */}
              <div className="pt-4 text-center border-t-2 border-stone-200">
                <p className="text-xs font-bold text-stone-500">
                  {t('Tip: Laminate this board and attach Velcro coins to swap First and Then activities daily!')}
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. STICKER SCRAPBOOK POSTER */}
          {/* ============================================================== */}
          {activeMode === 'scrapbook' && (
            <div className="space-y-4">
              {/* Scrapbook Header Frame */}
              <div className="flex items-center justify-between border-b-2 border-amber-300 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                      {t(activeScrapbookPage.title || 'My Sticker Scrapbook')}
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      {t('Artist:')} <strong>{childName}</strong> • {t('Theme:')} {t(theme.name)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                    {t('Page')} {selectedPageIndex + 1} {t('of')} {scrapbookPages.length}
                  </span>
                  <div className="text-[10px] text-stone-400 font-bold mt-1">
                    {t('BeeYou Routine Rewards Album')}
                  </div>
                </div>
              </div>

              {/* Scrapbook Canvas Poster */}
              <div
                className={`relative w-full aspect-[4/3] rounded-3xl border-4 ${theme.pageBorder} ${theme.bgClass} shadow-inner overflow-hidden p-6`}
              >
                {/* Placed Stickers */}
                {activeScrapbookPage.stickers.map((stk) => {
                  const sizeBase = 72;
                  const finalSize = sizeBase * (stk.sizeMultiplier || 1);

                  return (
                    <div
                      key={stk.id}
                      className="absolute select-none pointer-events-none drop-shadow-md"
                      style={{
                        left: `${stk.x}%`,
                        top: `${stk.y}%`,
                        transform: `translate(-50%, -50%) rotate(${stk.rotation || 0}deg)`,
                      }}
                    >
                      <RoutineStickerIcon
                        emoji={stk.emoji}
                        title={stk.title}
                        size={finalSize}
                        className="object-contain"
                      />
                    </div>
                  );
                })}

                {/* Empty page state notice */}
                {activeScrapbookPage.stickers.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                    <Star className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm font-bold">{t('This page is waiting for your stickers!')}</span>
                  </div>
                )}
              </div>

              {/* Poster Certificate Ribbon */}
              <div className="border-t-2 border-dashed border-stone-200 pt-3 flex items-center justify-between text-xs text-stone-500 font-bold">
                <span>⭐ {t('Official Routine Sticker Album Collection')}</span>
                <span>{t('Date')}: {new Date().toLocaleDateString(dateLocale)}</span>
              </div>
            </div>
          )}

          {/* Subtle Watermark Logo on Lower Right */}
          <div 
            aria-hidden="true" 
            className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex items-center gap-1.5 opacity-30 select-none pointer-events-none print:opacity-35"
          >
            <img 
              src="/logo.png" 
              alt="BeeYou" 
              className="h-6 sm:h-7.5 w-auto object-contain" 
            />
          </div>
        </div>
      </main>
    </div>
  );
};
