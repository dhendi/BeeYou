import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AACCategory, AACItem, FavoriteSentence } from '../types';
import { AAC_SCENES } from '../data/aacScenesData';
import {
  QuickChatModal,
  MulberryAttributionModal,
  SentenceInspectorModal,
  GrammarInflectionsModal,
  AACSentenceStrip,
  AACFavoritesView,
  AACTileGrid,
  AACToolbar,
} from './aac';
const AACSymbolPickerModal = React.lazy(() => import('./AACSymbolPickerModal').then((m) => ({ default: m.AACSymbolPickerModal })));
const AACWordEditorModal = React.lazy(() => import('./AACWordEditorModal').then((m) => ({ default: m.AACWordEditorModal })));
const AACGuideModal = React.lazy(() => import('./AACGuideModal').then((m) => ({ default: m.AACGuideModal })));
import { CoachMarksOverlay, CoachMarkStep } from './CoachMarksOverlay';
import { getWordInflections, WordInflection } from '../utils/aacInflections';
import { t } from '../services/translator';
import { ParentalGateModal } from './common/ParentalGateModal';
import { GridStage, DwellMode, AACButtonSize, STORAGE_KEYS } from '../types/aac';

import { getGrammaticalCategoryLabel } from '../utils/aacHelpers';
import { registerScrollCancel } from '../utils/touchScrollGuard';
import { prewarmPhrases } from '../utils/audio/speech';
import { isVoicePackLoaded } from '../services/aacPreloadService';
import { preloadPiperVoice } from '../services/piperTtsService';
export { getGrammaticalCategoryLabel };


const AAC_COACH_STEPS: CoachMarkStep[] = [
  {
    targetSelector: '[data-tour="aac-categories"]',
    title: '1. Vocabulary Categories',
    instruction: 'Tap category folders like Food, Drinks, Play, or Favorite Sentences to browse words.',
    mascotHint: 'Click any folder above or tap Next!',
  },
  {
    targetSelector: '[data-tour="aac-sentence-strip"]',
    title: '2. Sentence Builder Strip',
    instruction: 'Words you tap appear here. Tap SPEAK to hear your entire sentence spoken aloud with high quality voice output!',
    mascotHint: 'Tap SPEAK to talk with your voice!',
  },
  {
    targetSelector: '[data-tour="aac-quickchat"]',
    title: '3. Quick Chat Expressions',
    instruction: 'Tap Quick Chat to instantly say common phrases (Yes, No, Help, Thank You) without clearing your sentence.',
    mascotHint: 'Click for instant everyday phrases!',
  },
  {
    targetSelector: '[data-tour="aac-symbols"]',
    title: '4. Clinical Symbols Studio',
    instruction: 'Tap Symbols to search and add thousands of research-backed AAC symbols from the Mulberry Library.',
    mascotHint: 'Add new words anytime!',
  },
];
import { AlertTriangle, X } from 'lucide-react';
import { playChime, playAudioUrl } from '../utils/audio';


export const AACView: React.FC = () => {
  const {
    aacItems,
    sentence,
    addToSentence,
    speakSentence,
    clearSentence,
    removeLastFromSentence,
    saveSentenceAsQuickPhrase,
    favoriteSentences,
    addFavoriteSentence,
    deleteFavoriteSentence,
    togglePinFavoriteSentence,
    recordSentenceSpoken,
    showAacGuideModal,
    setShowAacGuideModal,
    settings,
    plansChanged,
    adventures,
    speak,
    isSpeaking,
    isPreparingSpeech,
    stopSpeaking,
    activeTheme,
    aacActiveScene,
    setAacActiveScene,
    setShowAacKeyboardModal,
    addAacItem,
    updateAacItem,
    toggleAacFavorite,
    deleteAacItem,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
    isPremium,
    triggerUpgrade,
    triggerVoicePreload,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<AACCategory | 'all' | 'favorite_sentences'>('core');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<AACItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [instantSpeakMode, setInstantSpeakMode] = useState(false);
  const [isSentenceBarCollapsed, setIsSentenceBarCollapsed] = useState(false);
  const [isCoachMarksActive, setIsCoachMarksActive] = useState(false);

  // Gradual Onboarding Grid Stage State (1 = 4 tiles, 2 = 12 tiles, 3 = full grid)
  const [gridStage, setGridStage] = useState<GridStage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRID_STAGE);
      if (saved === '1' || saved === '2' || saved === '3') return Number(saved) as GridStage;
    } catch {}
    return 3;
  });

  // Touch Ergonomics Dwell Mode
  const [dwellMode, setDwellMode] = useState<DwellMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DWELL_MODE);
      if (saved === 'dwell' || saved === 'release' || saved === 'direct') return saved;
    } catch {}
    return 'direct';
  });

  // Standard AAC Button Density / Size (small | medium | large)
  const [buttonSize, setButtonSize] = useState<AACButtonSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUTTON_SIZE);
      if (saved === 'small' || saved === 'medium' || saved === 'large') return saved as AACButtonSize;
    } catch {}
    return 'medium';
  });

  const handleSetButtonSize = (size: AACButtonSize) => {
    setButtonSize(size);
    try {
      localStorage.setItem(STORAGE_KEYS.BUTTON_SIZE, size);
      window.dispatchEvent(new CustomEvent('beeyou_aac_button_size_change', { detail: { size } }));
    } catch {}
    playChime('tap');
  };

  useEffect(() => {
    const handleStageChange = (e: any) => {
      if (e?.detail?.stage) setGridStage(e.detail.stage);
    };
    const handleDwellChange = (e: any) => {
      if (e?.detail?.mode) setDwellMode(e.detail.mode);
    };
    const handleButtonSizeChange = (e: any) => {
      if (e?.detail?.size) setButtonSize(e.detail.size);
    };

    window.addEventListener('beeyou_grid_stage_change', handleStageChange);
    window.addEventListener('beeyou_dwell_mode_change', handleDwellChange);
    window.addEventListener('beeyou_aac_button_size_change', handleButtonSizeChange);
    return () => {
      window.removeEventListener('beeyou_grid_stage_change', handleStageChange);
      window.removeEventListener('beeyou_dwell_mode_change', handleDwellChange);
      window.removeEventListener('beeyou_aac_button_size_change', handleButtonSizeChange);
    };
  }, []);

  // Pre-warm high-frequency core communication vocabulary for 0ms offline audio playback
  useEffect(() => {
    const p = !isPremium ? 'system' : (settings?.voicePersona || 'system');
    const l = settings?.language || 'en';
    if (!isVoicePackLoaded(p, l)) {
      triggerVoicePreload(p, l);
    } else if (p !== 'system') {
      preloadPiperVoice(p, l).catch(() => {});
    }
  }, [settings?.voicePersona, settings?.language, isPremium]);


  // Proloquo2Go Features State
  const [showQuickChatDrawer, setShowQuickChatDrawer] = useState(false);
  const [isMaskingMode, setIsMaskingMode] = useState(false);
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [parentalGateTarget, setParentalGateTarget] = useState<{ url: string; title: string } | null>(null);
  const [inflectionTarget, setInflectionTarget] = useState<{ item: AACItem; inflections: WordInflection[] } | null>(null);

  const [maskedItemIds, setMaskedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_aac_masked_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const longPressTimerRef = useRef<any>(null);
  const isTileLongPressRef = useRef<boolean>(false);
  const [inspectingSentence, setInspectingSentence] = useState<FavoriteSentence | null>(null);
  const longPressSentenceTimerRef = useRef<any>(null);
  const isSentenceLongPressRef = useRef<boolean>(false);

  const handleSentencePressStart = (fav: FavoriteSentence) => {
    isSentenceLongPressRef.current = false;
    if (longPressSentenceTimerRef.current) {
      clearTimeout(longPressSentenceTimerRef.current);
    }
    longPressSentenceTimerRef.current = setTimeout(() => {
      isSentenceLongPressRef.current = true;
      playChime('star');
      setInspectingSentence(fav);
    }, 400);
  };

  const handleSentencePressEnd = () => {
    if (longPressSentenceTimerRef.current) {
      clearTimeout(longPressSentenceTimerRef.current);
      longPressSentenceTimerRef.current = null;
    }
  };

  const toggleMaskItem = (id: string) => {
    setMaskedItemIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('beeyou_aac_masked_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    playChime('tap');
  };

  // Contextual phrases detection
  const isDentistDay = true;
  const dentistAdventure = adventures.find((a) => a.id === 'adv-dentist');

  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';
  const isTrainTheme = activeTheme?.category === 'train' || activeTheme?.id === 'theme-trains';
  const isSpaceTheme = activeTheme?.category === 'space' || activeTheme?.id === 'theme-space';
  const isOceanTheme = activeTheme?.category === 'ocean' || activeTheme?.id === 'theme-ocean';
  const isFairytaleTheme = activeTheme?.category === 'fantasy' || activeTheme?.id === 'theme-fantasy';
  const isRacingTheme = activeTheme?.category === 'racing' || activeTheme?.id === 'theme-racing';



  const categories: { id: AACCategory | 'all' | 'favorite_sentences'; label: string; iconSrc: string }[] = [
    { id: 'core', label: t('Core Board'), iconSrc: '/assets/stickers/aac_core.webp' },
    { id: 'favorite_sentences', label: t('Favorite Sentences'), iconSrc: '/assets/stickers/aac_sentences.webp' },
    { id: 'favorites', label: t('Favorites'), iconSrc: '/assets/stickers/aac_favorites.webp' },
    { id: 'food', label: t('Food'), iconSrc: '/assets/stickers/aac_food.webp' },
    { id: 'drinks', label: t('Drinks'), iconSrc: '/assets/stickers/aac_drinks.webp' },
    { id: 'activities', label: t('Play & Fun'), iconSrc: '/assets/stickers/aac_activities.webp' },
    { id: 'places', label: t('Places'), iconSrc: '/assets/stickers/aac_places.webp' },
    { id: 'people', label: t('People'), iconSrc: '/assets/stickers/aac_people.webp' },
    { id: 'feelings', label: t('Feelings'), iconSrc: '/assets/stickers/aac_feelings.webp' },
    { id: 'sensory', label: t('Sensory'), iconSrc: '/assets/stickers/aac_sensory.webp' },
    { id: 'all', label: t('All Words'), iconSrc: '/assets/stickers/aac_all_words.webp' },
  ];

  // Filter items while keeping consistent motor planning order (sorted by motorIndex)
  const filteredItems = aacItems
    .filter((item) => {
      if (searchQuery.trim()) {
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (activeCategory === 'favorites') {
        return item.isFavorite === true || item.category === 'favorites';
      }
      if (activeCategory === 'all') return true;
      if (activeCategory === 'core') return item.category === 'core';
      return item.category === activeCategory;
    })
    .sort((a, b) => a.motorIndex - b.motorIndex);

  // Predictive Pre-warming: Silently fetch audio for tiles visible on screen so clicks are 0ms instant
  useEffect(() => {
    if (filteredItems && filteredItems.length > 0) {
      prewarmPhrases(
        filteredItems.map((i) => (i.speechText && t(i.speechText) !== i.speechText ? t(i.speechText) : t(i.label))),
        !isPremium ? 'system' : (settings?.voicePersona || 'system'),
        settings?.language || 'en'
      );
    }
  }, [activeCategory, filteredItems?.length, settings?.voicePersona, settings?.language, isPremium]);

  // Styling based on AAC Button Color Mode: Fitzgerald Key (default) vs Theme Tinted vs High Contrast White vs Neutral Monochrome
  const getColorStyles = (colorType: AACItem['colorType']) => {
    const mode = settings.aacButtonColorMode || 'fitzgerald';

    if (settings.colorCodingEnabled === false || mode === 'neutral_monochrome') {
      if (colorType === 'emergency') {
        return 'bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300 ring-rose-400 font-bold';
      }
      return 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 ring-slate-300';
    }

    if (mode === 'theme') {
      if (colorType === 'emergency') {
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300 ring-rose-400 font-black';
      }
      const primaryLight = activeTheme?.palette?.primaryLight || 'bg-slate-50';
      const primaryBorder = activeTheme?.palette?.primaryBorder || 'border-slate-300';
      const textAccent = activeTheme?.palette?.textAccent || 'text-slate-950';
      return `${primaryLight} hover:brightness-95 ${textAccent} ${primaryBorder} ring-slate-400`;
    }

    if (mode === 'high_contrast_white') {
      if (colorType === 'emergency') {
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-rose-600 font-black';
      }
      return 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-900';
    }

    // Standardized Modified Fitzgerald Key Styling:
    // Nouns: Soft Orange (#FED7AA / border #F97316)
    // Verbs: Soft Green (#BBF7D0 / border #22C55E)
    // Descriptors/Adjectives: Soft Blue (#BAE6FD / border #0284C7)
    // People/Pronouns: Soft Yellow (#FEF08A / border #EAB308)
    // Social/Phrases: Soft Pink/Purple (#FBCFE8 / border #DB2777)
    switch (colorType) {
      case 'subject':
        return 'bg-[#FEF08A] hover:bg-[#FDE047] text-yellow-950 border-2 border-[#EAB308] ring-yellow-400 shadow-xs font-semibold';
      case 'verb':
        return 'bg-[#BBF7D0] hover:bg-[#86EFAC] text-emerald-950 border-2 border-[#22C55E] ring-emerald-400 shadow-xs font-semibold';
      case 'noun':
        return 'bg-[#FED7AA] hover:bg-[#FDBA74] text-orange-950 border-2 border-[#F97316] ring-orange-400 shadow-xs font-semibold';
      case 'adjective':
        return 'bg-[#BAE6FD] hover:bg-[#7DD3FC] text-sky-950 border-2 border-[#0284C7] ring-sky-400 shadow-xs font-semibold';
      case 'social':
        return 'bg-[#FBCFE8] hover:bg-[#F472B6] text-pink-950 border-2 border-[#DB2777] ring-pink-400 shadow-xs font-semibold';
      case 'emergency':
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-rose-500 ring-rose-400 font-black shadow-xs';
      default:
        return 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-2 border-slate-300 ring-slate-300 font-semibold';
    }
  };

  const activeSceneData = aacActiveScene ? AAC_SCENES.find((s) => s.id === aacActiveScene) : null;

  const displayedItems = activeSceneData
    ? (searchQuery.trim()
        ? activeSceneData.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.speechText || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activeSceneData.items)
    : (() => {
        if (activeCategory === 'core' && !searchQuery.trim()) {
          if (gridStage === 1) {
            // Stage 1: 4 oversized Cause & Effect tiles (WANT, MORE, STOP, HELP)
            const stage1Ids = ['want', 'more', 'stop', 'help'];
            const stage1Items = filteredItems.filter((i) => stage1Ids.includes(i.id.toLowerCase()));
            return stage1Items.length >= 4 ? stage1Items : filteredItems.slice(0, 4);
          }
          if (gridStage === 2) {
            // Stage 2: 12 motor planning expansion words
            const stage2Ids = ['want', 'more', 'go', 'like', 'stop', 'help', 'yes', 'no', 'me', 'you', 'eat', 'play'];
            const stage2Items = filteredItems.filter((i) => stage2Ids.includes(i.id.toLowerCase()));
            return stage2Items.length >= 8 ? stage2Items : filteredItems.slice(0, 12);
          }
        }
        return filteredItems;
      })();

  // Standardized AAC Button Density: small, medium, and large maintain identical sizes across 4, 12, and Full stages
  const gridColsClass = (() => {
    if (buttonSize === 'large') {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full';
    }
    if (buttonSize === 'small') {
      return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 w-full';
    }
    // 'medium' (default balanced AAC standard)
    return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 w-full';
  })();

  const buttonSizeStyles = (() => {
    switch (buttonSize) {
      case 'small':
        return {
          tilePadding: 'p-1 sm:p-1.5',
          folderPadding: 'p-1 sm:p-1.5',
          folderBadge: 'top-1 right-1 text-[7.5px] sm:text-[8px] px-1 py-0.5 rounded gap-0.5',
          folderBadgeIcon: 'w-2 h-2',
          folderSymbolArea: 'pt-3.5 sm:pt-4 pb-0.5 px-0.5',
          labelFont: 'text-[9px] sm:text-[10px] md:text-[11px]',
          folderFont: 'text-[9px] sm:text-[10px]',
          categoryTag: 'text-[7px] px-1 py-0.2',
        };
      case 'large':
        return {
          tilePadding: 'p-3 sm:p-4 md:p-5',
          folderPadding: 'p-3 sm:p-4 md:p-5',
          folderBadge: 'top-2 right-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-md gap-1',
          folderBadgeIcon: 'w-3 h-3',
          folderSymbolArea: 'pt-5 sm:pt-6 pb-1 px-1',
          labelFont: 'text-sm sm:text-base md:text-lg lg:text-xl font-black',
          folderFont: 'text-xs sm:text-base md:text-lg font-black',
          categoryTag: 'text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 font-black',
        };
      case 'medium':
      default:
        return {
          tilePadding: 'p-2',
          folderPadding: 'p-2',
          folderBadge: 'top-1.5 right-1.5 text-[8.5px] sm:text-[9px] px-1.5 py-0.5 rounded-md gap-0.5',
          folderBadgeIcon: 'w-2.5 h-2.5',
          folderSymbolArea: 'pt-4 sm:pt-4.5 pb-0.5 px-1',
          labelFont: 'text-[10px] sm:text-xs',
          folderFont: 'text-[11px] sm:text-xs',
          categoryTag: 'text-[8px] px-1.5 py-0.5',
        };
    }
  })();

  const handleTileClick = (item: AACItem) => {
    // If a long press was triggered, suppress the subsequent click event to prevent inserting the base uninflected word
    if (isTileLongPressRef.current) {
      isTileLongPressRef.current = false;
      return;
    }

    const gestureTime = performance.now();
    if (isMaskingMode) {
      toggleMaskItem(item.id);
      return;
    }
    if (isEditMode) {
      setEditingItem(item);
      setShowWordEditor(true);
      return;
    }
    const speech = (item.speechText && t(item.speechText) !== item.speechText)
      ? t(item.speechText)
      : t(item.label);
    if (instantSpeakMode) {
      if (item.audioDataUrl) {
        playAudioUrl(item.audioDataUrl, speech);
      } else {
        speak(speech, { gestureTime });
      }
      if (settings.soundEffects) playChime('tap');
    } else {
      addToSentence({ ...item, originalLabel: item.originalLabel || item.label, label: t(item.label), speechText: speech }, { gestureTime });
    }
  };

  const handleLongPressStart = (item: AACItem) => {
    isTileLongPressRef.current = false;
    const inflections = getWordInflections(item.label, item.colorType);
    if (inflections.length > 1) {
      longPressTimerRef.current = setTimeout(() => {
        isTileLongPressRef.current = true;
        setInflectionTarget({ item, inflections });
        playChime('star');
      }, 450);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Safety fallback: reset long press guard after touch release window
    setTimeout(() => {
      isTileLongPressRef.current = false;
    }, 150);
  };

  useEffect(() => {
    return registerScrollCancel(() => {
      handleLongPressEnd();
    });
  }, []);

  const handleSelectInflection = (inf: WordInflection) => {
    if (!inflectionTarget) return;
    const gestureTime = performance.now();
    const modifiedItem: AACItem = {
      ...inflectionTarget.item,
      label: inf.label,
      speechText: inf.speechText,
    };
    if (instantSpeakMode) {
      speak(inf.speechText || inf.label, { gestureTime });
    } else {
      addToSentence(modifiedItem, { gestureTime });
    }
    playChime('tap');
    setInflectionTarget(null);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative w-full px-1.5 sm:px-3 py-1">
      {/* TOP CONTROLS & HEADER */}
      <div className="space-y-1.5 shrink-0 z-20">
        
        {/* 1. SITUATIONAL SCENE PHRASES (If Active) */}
        {activeSceneData && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <span className="px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-900 font-extrabold text-[10px] uppercase tracking-wide">Scene</span>
              <span>{activeSceneData.label} — Quick Phrases</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {activeSceneData.phrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-950 font-bold text-xs border border-indigo-200 shadow-2xs shrink-0 active:scale-95 cursor-pointer whitespace-nowrap touch-manipulation"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. SENTENCE BUILDER STRIP (Message Window) */}
        <AACSentenceStrip
          sentence={sentence}
          isSentenceBarCollapsed={isSentenceBarCollapsed}
          setIsSentenceBarCollapsed={setIsSentenceBarCollapsed}
          instantSpeakMode={instantSpeakMode}
          isSpeaking={isSpeaking}
          isPreparingSpeech={isPreparingSpeech}
          onSpeak={() => speakSentence(performance.now())}
          onStopSpeaking={stopSpeaking}
          onRemoveLast={removeLastFromSentence}
          onClear={clearSentence}
          onSaveQuickPhrase={saveSentenceAsQuickPhrase}
          onOpenKeyboard={() => {
            setShowAacKeyboardModal(true);
            playChime('tap');
          }}
          getColorStyles={getColorStyles}
          themeCategory={activeTheme?.category}
          themeId={activeTheme?.id}
          language={settings.language}
        />

        {/* 3. CONTEXTUAL AAC STRIP (Plans changed / Dentist visit) */}
        {plansChanged.active ? (
          <div className="bg-[#FFF4E5] border-2 border-[#F0CA86] rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A4B13]">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <span>Context Words: Plans Changed</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {plansChanged.relevantPhrases.slice(0, 5).map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-3 py-1.5 rounded-xl bg-[#FCF9F2] hover:bg-white text-[#4A2F0F] font-bold text-xs border border-[#E0D8CB] shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)] shrink-0 active:scale-95 cursor-pointer flex items-center gap-1.5 touch-manipulation"
                >
                  <img
                    src="/assets/stickers/aac_sentences.webp"
                    alt=""
                    aria-hidden="true"
                    className="w-3.5 h-3.5 object-contain pointer-events-none drop-shadow-2xs select-none"
                  />
                  <span>{phrase}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <AACToolbar
          categories={categories}
          activeCategory={activeCategory}
          gridStage={gridStage}
          searchQuery={searchQuery}
          activeSceneData={activeSceneData}
          displayedItemsCount={displayedItems.length}
          isMaskingMode={isMaskingMode}
          isEditMode={isEditMode}
          instantSpeakMode={instantSpeakMode}
          buttonSize={buttonSize}
          themeCategory={activeTheme?.category}
          themeId={activeTheme?.id}
          onSelectCategory={(catId) => {
            setAacActiveScene(null);
            setActiveCategory(catId);
            setSearchQuery('');
          }}
          onOpenQuickChat={() => setShowQuickChatDrawer(true)}
          onToggleMaskingMode={() => setIsMaskingMode(!isMaskingMode)}
          onToggleInstantSpeakMode={() => setInstantSpeakMode(!instantSpeakMode)}
          onAddWord={() => {
            setEditingItem(null);
            setShowWordEditor(true);
          }}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onOpenSymbols={() => setShowSymbolPicker(true)}
          onOpenAttribution={() => setShowAttributionModal(true)}
          onOpenGuide={() => setIsCoachMarksActive(true)}
          onChangeButtonSize={handleSetButtonSize}
          onChangeGridStage={(stage) => {
            setGridStage(stage);
            if (stage !== 3 && !['core', 'favorite_sentences', 'favorites'].includes(activeCategory)) {
              setActiveCategory('core');
            }
            try {
              localStorage.setItem(STORAGE_KEYS.GRID_STAGE, stage.toString());
            } catch {}
          }}
          playChime={playChime}
        />
      </div>

      {/* 6. SCROLLABLE MOTOR-PLANNING VOCABULARY GRID */}
      <div
        onScroll={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
        className="flex-1 overflow-y-auto min-h-0 pr-0.5 pb-20 scrollbar-thin mt-1"
      >
        
        {/* Active Scene Banner */}
        {activeSceneData && (
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs mb-2 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs uppercase tracking-wider">{activeSceneData.label.slice(0, 2)}</span>
              <div>
                <div className="font-black text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  <span>{activeSceneData.label} Scene</span>
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                    {displayedItems.length} Custom Words
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 font-medium mt-0.5">
                  {activeSceneData.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAacActiveScene(null);
                playChime('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 ml-2"
              title="Return to Core Words"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Core</span>
            </button>
          </div>
        )}

        {/* FAVORITE SENTENCES VIEW */}
        {activeCategory === 'favorite_sentences' && !activeSceneData ? (
          <AACFavoritesView
            favoriteSentences={favoriteSentences}
            speak={speak}
            recordSentenceSpoken={recordSentenceSpoken}
            addToSentence={addToSentence}
            addFavoriteSentence={addFavoriteSentence}
            deleteFavoriteSentence={deleteFavoriteSentence}
            togglePinFavoriteSentence={togglePinFavoriteSentence}
            setInspectingSentence={setInspectingSentence}
            handleSentencePressStart={handleSentencePressStart}
            handleSentencePressEnd={handleSentencePressEnd}
            isSentenceLongPressRef={isSentenceLongPressRef}
          />
        ) : (
        <AACTileGrid
            activeCategory={activeCategory}
            gridStage={gridStage}
            searchQuery={searchQuery}
            activeSceneData={activeSceneData}
            displayedItems={displayedItems}
            maskedItemIds={maskedItemIds}
            isMaskingMode={isMaskingMode}
            isEditMode={isEditMode}
            buttonSize={buttonSize}
            gridColsClass={gridColsClass}
            buttonSizeStyles={buttonSizeStyles}
            themeCategory={activeTheme?.category}
            themeId={activeTheme?.id}
            aacStyling={activeTheme?.aacStyling}
            aacButtonColorMode={settings.aacButtonColorMode}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              playChime('tap');
            }}
            onTileClick={handleTileClick}
            onLongPressStart={handleLongPressStart}
            onLongPressEnd={handleLongPressEnd}
            onOpenInflections={(item, inflections) => setInflectionTarget({ item, inflections })}
            onToggleFavorite={toggleAacFavorite}
            onEditItem={(item) => {
              setEditingItem(item);
              setShowWordEditor(true);
            }}
            getColorStyles={getColorStyles}
          />
        )}
      </div>

      {/* GRAMMAR INFLECTIONS POPUP */}
      <GrammarInflectionsModal
        target={inflectionTarget}
        onClose={() => setInflectionTarget(null)}
        onSelectInflection={handleSelectInflection}
      />

      {/* QUICK-CHAT DRAWER */}
      <QuickChatModal
        isOpen={showQuickChatDrawer}
        onClose={() => setShowQuickChatDrawer(false)}
        onSpeakPhrase={(phraseText) => {
          speak(phraseText);
          playChime('tap');
        }}
      />

      {/* Word & Favorite Phrase Editor Modal */}
      {showWordEditor && (
        <React.Suspense fallback={null}>
          <AACWordEditorModal
            isOpen={showWordEditor}
            onClose={() => {
              setShowWordEditor(false);
              setEditingItem(null);
            }}
            editingItem={editingItem}
            defaultCategory={activeCategory}
            existingItems={aacItems}
            onSave={(wordData) => {
              if (editingItem) {
                updateAacItem({
                  ...editingItem,
                  ...wordData,
                  id: editingItem.id,
                  motorIndex: editingItem.motorIndex,
                });
              } else {
                addAacItem(wordData);
              }
            }}
            onDelete={(id) => {
              deleteAacItem(id);
            }}
          />
        </React.Suspense>
      )}

      {/* Online AAC Symbol & Button Studio Modal */}
      {showSymbolPicker && (
        <React.Suspense fallback={null}>
          <AACSymbolPickerModal
            isOpen={showSymbolPicker}
            onClose={() => setShowSymbolPicker(false)}
            activeCategory={activeCategory === 'all' || activeCategory === 'favorites' ? 'core' : activeCategory}
            existingItems={aacItems}
            onSelectSymbol={(sym) => {
              addAacItem({
                label: sym.label,
                speechText: sym.speechText || sym.label,
                photoUrl: sym.photoUrl,
                symbolId: sym.symbolId,
                symbolSource: sym.symbolSource || 'mulberry',
                arasaacId: sym.arasaacId,
                emoji: sym.emoji || '',
                category: sym.category || (activeCategory === 'all' || activeCategory === 'favorites' ? 'core' : activeCategory),
                colorType: sym.colorType || 'noun',
                isFavorite: true,
              });
            }}
            onImportPack={(pack) => {
              importAacPack(pack.items);
            }}
            onUpgradeAll={upgradeAllAacToClinicalSymbols}
          />
        </React.Suspense>
      )}

      {/* Mulberry Symbols Licensing & Attribution Modal */}
      <MulberryAttributionModal
        isOpen={showAttributionModal}
        onClose={() => setShowAttributionModal(false)}
        onOpenExternalLink={(target) => setParentalGateTarget(target)}
      />

      {/* Live Interactive AAC Coach Marks Walkthrough */}
      <CoachMarksOverlay
        isActive={isCoachMarksActive}
        steps={AAC_COACH_STEPS}
        tourName="BeeYou AAC Voice Guide"
        onComplete={() => setIsCoachMarksActive(false)}
        onSkip={() => setIsCoachMarksActive(false)}
      />

      {/* Full Sentence Inspector Modal */}
      <SentenceInspectorModal
        inspectingSentence={inspectingSentence}
        onClose={() => setInspectingSentence(null)}
        onSpeakSentence={(fav) => {
          const spoken = t(fav.speechText || fav.text);
          if (fav.audioDataUrl) {
            playAudioUrl(fav.audioDataUrl, spoken);
          } else {
            speak(spoken);
          }
          recordSentenceSpoken(fav.text, fav.emoji);
          playChime('speak');
        }}
        onAddToSentenceBar={addToSentence}
        onTogglePin={(id) => {
          togglePinFavoriteSentence(id);
          setInspectingSentence((prev) => prev ? { ...prev, isParentPinned: !prev.isParentPinned } : null);
        }}
        onDeleteSentence={(id) => {
          deleteFavoriteSentence(id);
          setInspectingSentence(null);
        }}
        language={settings.language}
      />

      {/* AAC Guide / How-To Modal */}
      {showAacGuideModal && (
        <React.Suspense fallback={null}>
          <AACGuideModal
            isOpen={showAacGuideModal}
            onClose={() => setShowAacGuideModal(false)}
          />
        </React.Suspense>
      )}

      {/* Parental Gate for External Link Protection */}
      {parentalGateTarget && (
        <ParentalGateModal
          isOpen={!!parentalGateTarget}
          onClose={() => setParentalGateTarget(null)}
          onSuccess={() => {
            window.open(parentalGateTarget.url, '_blank', 'noopener,noreferrer');
          }}
          targetUrlTitle={parentalGateTarget.title}
          targetUrl={parentalGateTarget.url}
        />
      )}
    </div>
  );
};
