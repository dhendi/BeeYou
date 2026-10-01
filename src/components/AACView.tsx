import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AACCategory, AACItem } from '../types';
import { getThemedAacEmoji } from '../data/themesData';
import { AACTileArt } from './AACTileArt';
import { AACWordIcon } from './AACWordIcon';
import { AACSymbolPickerModal } from './AACSymbolPickerModal';
import { 
  Volume2, 
  Trash2, 
  Delete, 
  BookmarkPlus, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Palette,
  Keyboard,
  MapPin,
  Globe,
  X
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const AACView: React.FC = () => {
  const {
    aacItems,
    sentence,
    addToSentence,
    speakSentence,
    clearSentence,
    removeLastFromSentence,
    saveSentenceAsQuickPhrase,
    settings,
    updateSettings,
    plansChanged,
    adventures,
    speak,
    isSpeaking,
    stopSpeaking,
    isOffline,
    activeTheme,
    setShowThemeModal,
    aacActiveScene,
    setAacActiveScene,
    setShowAacKeyboardModal,
    addAacItem,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<AACCategory | 'all'>('core');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  // Contextual phrases detection
  // If plans changed is active, or if there's an upcoming adventure (like Dentist today)
  const isDentistDay = true; // Active context for Dentist adventure
  const dentistAdventure = adventures.find((a) => a.id === 'adv-dentist');

  const categories: { id: AACCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'core', label: 'Core Words', emoji: '⭐' },
    { id: 'all', label: 'All Words', emoji: '🌐' },
    { id: 'food', label: 'Food', emoji: '🍕' },
    { id: 'drinks', label: 'Drinks', emoji: '🧃' },
    { id: 'activities', label: 'Play & Fun', emoji: '🎮' },
    { id: 'places', label: 'Places', emoji: '🏠' },
    { id: 'people', label: 'People', emoji: '👥' },
    { id: 'feelings', label: 'Feelings', emoji: '💛' },
    { id: 'sensory', label: 'Sensory', emoji: '🎧' },
  ];

  // Filter items while keeping consistent motor planning order (sorted by motorIndex)
  const filteredItems = aacItems
    .filter((item) => {
      if (searchQuery.trim()) {
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (activeCategory === 'all') return true;
      if (activeCategory === 'core') return item.category === 'core';
      return item.category === activeCategory;
    })
    .sort((a, b) => a.motorIndex - b.motorIndex);

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
      // Emergency buttons always stay high-visibility red for safety
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

    // Default: Soft Low-Sensory Fitzgerald Key standard (solid, soothing pastel backgrounds)
    switch (colorType) {
      case 'subject':
        return 'bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-200/90 ring-amber-300';
      case 'verb':
        return 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200/90 ring-emerald-300';
      case 'noun':
        return 'bg-orange-50 hover:bg-orange-100/80 text-orange-950 border-orange-200/90 ring-orange-300';
      case 'adjective':
        return 'bg-sky-50 hover:bg-sky-100/80 text-sky-950 border-sky-200/90 ring-sky-300';
      case 'social':
        return 'bg-purple-50 hover:bg-purple-100/80 text-purple-950 border-purple-200/90 ring-purple-300';
      case 'emergency':
        return 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300 ring-rose-400 font-black';
      default:
        return 'bg-slate-50 hover:bg-slate-100/80 text-slate-900 border-slate-200 ring-slate-300';
    }
  };

  // Context Scene Switcher data
  const AAC_SCENES: Array<{ id: string; label: string; emoji: string; phrases: string[] }> = [
    {
      id: 'restaurant', label: 'Restaurant', emoji: '🍽️',
      phrases: ['Can I have the menu?', 'I would like pizza.', 'Can I have water?', 'The food is good.', 'I need a break.', 'Can we go now?', 'This is too loud.', 'I feel sick.', 'Can we sit somewhere quieter?', 'I need to use the restroom.', 'Thank you.', 'I am done eating.'],
    },
    {
      id: 'doctor', label: 'Doctor', emoji: '🏥',
      phrases: ['This hurts here.', 'I feel sick.', 'I am scared.', 'Please be gentle.', 'Can my caregiver stay with me?', 'I need a break.', 'How much longer?', 'I do not want a shot.', 'I need to use the restroom.', 'I feel dizzy.', 'My tummy hurts.', 'I have trouble with loud noises.'],
    },
    {
      id: 'school', label: 'School', emoji: '🏫',
      phrases: ['I need help.', 'I do not understand.', 'I need a break.', 'Can I go outside?', 'I am done.', 'I feel overwhelmed.', 'The noise is too much.', 'I need quiet.', 'I need to use the restroom.', 'I am ready.', 'I like this activity.', 'Can you repeat that?'],
    },
    {
      id: 'car', label: 'Car Trip', emoji: '🚗',
      phrases: ['Are we there yet?', 'I need a break.', 'I feel sick.', 'Can we stop?', 'I am hungry.', 'I need to use the restroom.', 'I am comfortable.', 'Can we play music?', 'I do not like this song.', 'I am bored.', 'How much longer?', 'I am cold.'],
    },
    {
      id: 'playground', label: 'Playground', emoji: '🛝',
      phrases: ['Can I play with you?', 'This is fun!', 'I need a turn.', 'Stop that please.', 'I need help.', 'I want to go home.', 'I feel overwhelmed.', 'Can we do something quieter?', 'I am thirsty.', 'I fell down.', 'I need a break.', 'That hurt.'],
    },
  ];

  const activeSceneData = aacActiveScene ? AAC_SCENES.find((s) => s.id === aacActiveScene) : null;

  // Scene-filtered items (when a scene is active, show all + scene phrases at top)
  const displayedItems = activeSceneData
    ? aacItems.filter((item) => item.category === 'core').slice(0, 24)
    : filteredItems;

  const gridColsClass = settings.largeButtonMode
    ? 'grid-cols-3 sm:grid-cols-4'
    : settings.gridColumns === 3
    ? 'grid-cols-3 sm:grid-cols-4'
    : settings.gridColumns === 6
    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
    : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6';

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* 1. SENTENCE BUILDER STRIP */}
      <section
        aria-label="Sentence builder"
        className="sticky top-14 z-20 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-300 shadow-md p-2 sm:p-3 my-2"
      >
        <div className="flex items-center gap-2">
          {/* Sentence Display Area */}
          <div className="flex-1 min-h-[58px] sm:min-h-[66px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            {sentence.length === 0 ? (
              <span className="text-slate-400 text-sm sm:text-base font-medium px-2 select-none">
                Tap words below to build a sentence...
              </span>
            ) : (
              sentence.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border shadow-xs animate-in fade-in zoom-in-95 duration-150 select-none shrink-0 ${getColorStyles(
                    item.colorType
                  )}`}
                >
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt="" className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <span className="text-xl leading-none">{getThemedAacEmoji(item, activeTheme)}</span>
                  )}
                  <span className="font-bold text-xs sm:text-sm tracking-tight">{item.label}</span>
                </div>
              ))
            )}
          </div>

          {/* Controls: Backspace, Clear, Speak, Save */}
          <div className="flex items-center gap-1 shrink-0">
            {sentence.length > 0 && (
              <>
                <button
                  onClick={removeLastFromSentence}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer"
                  title="Remove last word"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
                <button
                  onClick={clearSentence}
                  className="p-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 transition-all cursor-pointer"
                  title="Clear sentence"
                  aria-label="Clear all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={saveSentenceAsQuickPhrase}
                  className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 transition-all cursor-pointer hidden sm:block"
                  title="Save to quick phrases"
                >
                  <BookmarkPlus className="w-5 h-5" />
                </button>
              </>
            )}

            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-sm sm:text-base shadow-sm transition-all active:scale-95 bg-rose-500 hover:bg-rose-600 text-white animate-pulse cursor-pointer"
                title="Stop speaking"
              >
                <div className="flex items-center gap-0.5 mr-0.5">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>STOP</span>
              </button>
            ) : (
              <button
                onClick={speakSentence}
                disabled={sentence.length === 0}
                className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-sm sm:text-base shadow-sm transition-all active:scale-95 cursor-pointer ${
                  sentence.length > 0
                    ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 ring-2 ring-amber-500 animate-pulse'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>SPEAK</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 1.5. CONTEXT SCENE SWITCHER (New Feature) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Scene:
        </span>
        {aacActiveScene && (
          <button
            onClick={() => setAacActiveScene(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
        {AAC_SCENES.map((scene) => (
          <button
            key={scene.id}
            onClick={() => setAacActiveScene(aacActiveScene === scene.id ? null : scene.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              aacActiveScene === scene.id
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{scene.emoji}</span>
            <span>{scene.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowAacKeyboardModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer shrink-0 hover:bg-amber-100 transition-all ml-auto"
          title="Open Dyslexia-Friendly Typing Keyboard"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Type</span>
        </button>
      </div>

      {/* Scene phrases strip (when scene active) */}
      {activeSceneData && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <span>{activeSceneData.emoji}</span>
            <span>{activeSceneData.label} — Quick Phrases</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {activeSceneData.phrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => speak(phrase)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-950 font-bold text-xs border border-indigo-200 shadow-xs shrink-0 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. CONTEXTUAL AAC STRIP (Intelligent & Motor-Safe) */}
      {/* If Plans Changed is active, surface Plans Changed phrases */}
      {plansChanged.active ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-2.5 mb-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Context Words: Plans Changed</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {plansChanged.relevantPhrases.slice(0, 5).map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => speak(phrase)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-xs shrink-0 active:scale-95 cursor-pointer"
              >
                💬 {phrase}
              </button>
            ))}
          </div>
        </div>
      ) : isDentistDay && dentistAdventure ? (
        // Contextual phrases for Dentist adventure
        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-2.5 mb-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Dentist Visit Helper Phrases</span>
            </span>
            <span className="text-[10px] text-teal-700 font-medium">Tap to speak instantly</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {dentistAdventure.thingsICanSay.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => speak(phrase)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-100 text-teal-950 font-bold text-xs border border-teal-300 shadow-xs shrink-0 active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>🦷</span>
                <span>{phrase}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* 3. CATEGORY PILLS & VIEW CONTROLS */}
      <div className="flex items-center justify-between gap-2 my-1 overflow-x-auto py-1 scrollbar-thin">
        <div className="flex items-center gap-1.5 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Theme switcher, Online AAC Tools, and accessibility quick toggles */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowSymbolPicker(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-black border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Online AAC Symbols, Logos & Buttons Tools (ARASAAC Library & Real Photos)"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Online AAC Tools</span>
            <span className="sm:hidden">Symbols</span>
          </button>

          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-black border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Change theme or customize AAC icons"
          >
            <span className="text-sm">{activeTheme.mascotEmoji}</span>
            <span className="hidden sm:inline font-bold">{activeTheme.name}</span>
          </button>

          {/* Button Color Scheme Quick Toggle */}
          <button
            type="button"
            onClick={() => {
              const modes: Array<'fitzgerald' | 'theme' | 'high_contrast_white'> = ['fitzgerald', 'theme', 'high_contrast_white'];
              const current = settings.aacButtonColorMode || 'fitzgerald';
              const nextIndex = (modes.indexOf(current) + 1) % modes.length;
              const next = modes[nextIndex];
              updateSettings({ aacButtonColorMode: next });
              playChime('tap');
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              (settings.aacButtonColorMode || 'fitzgerald') === 'theme'
                ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs font-black'
                : (settings.aacButtonColorMode || 'fitzgerald') === 'high_contrast_white'
                ? 'bg-slate-900 text-white border-slate-950 shadow-2xs font-black'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={`Current button style: ${(settings.aacButtonColorMode || 'fitzgerald') === 'theme' ? 'Theme Colors' : (settings.aacButtonColorMode || 'fitzgerald') === 'high_contrast_white' ? 'White High-Contrast' : 'Clinical Fitzgerald Key'}. Tap to toggle.`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {(settings.aacButtonColorMode || 'fitzgerald') === 'theme'
                ? 'Theme Tiles'
                : (settings.aacButtonColorMode || 'fitzgerald') === 'high_contrast_white'
                ? 'White Tiles'
                : 'Clinical Colors'}
            </span>
          </button>

          <button
            onClick={() =>
              updateSettings({ largeButtonMode: !settings.largeButtonMode })
            }
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              settings.largeButtonMode
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Large Button Mode"
          >
            Big Buttons
          </button>
        </div>
      </div>

      {/* 4. MOTOR-PLANNING PREDICTABLE VOCABULARY GRID */}
      <main
        className={`grid ${gridColsClass} gap-1.5 sm:gap-2 mt-1`}
        aria-label="Vocabulary grid"
      >
        {filteredItems.map((item) => {
          const hasThemedArt = activeTheme && !['classic', 'minimal', 'executive', 'dark', 'cyber'].includes(activeTheme.category) && (settings.aacButtonColorMode || 'fitzgerald') !== 'high_contrast_white';
          return (
          <button
            key={item.id}
            onClick={() => addToSentence(item)}
            className={`flex flex-col items-center aspect-square p-1.5 sm:p-2 ${
              activeTheme?.aacStyling?.tileBorderRadius || 'rounded-2xl'
            } ${
              activeTheme?.aacStyling?.tileBorderWidth || 'border-2'
            } shadow-sm transition-all active:scale-92 cursor-pointer relative overflow-hidden group ${
              hasThemedArt ? 'border-opacity-60' : ''
            } ${getColorStyles(item.colorType)}`}
          >
            {/* Themed SVG art layer — sits behind content */}
            {hasThemedArt && activeTheme && (
              <AACTileArt
                theme={activeTheme}
                colorType={item.colorType}
                label={item.label}
              />
            )}

            {/* Icon area — fills all available vertical space */}
            <div className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95">
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.label}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <AACWordIcon
                  label={item.label}
                  colorType={item.colorType}
                  theme={activeTheme}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Label — pinned at the bottom, always visible */}
            <span
              className={`relative z-10 font-black tracking-tight text-center leading-none select-none drop-shadow-sm w-full mt-1 ${
                settings.largeButtonMode ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'
              }`}
            >
              {item.label}
            </span>
          </button>
          );
        })}
      </main>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mt-4">
          <p className="font-bold text-base">No words found in this category.</p>
          <p className="text-xs text-slate-400 mt-1">Parents can add new words anytime in the Parent Dashboard or via Online AAC Tools!</p>
        </div>
      )}

      {/* Online AAC Symbol & Button Studio Modal */}
      <AACSymbolPickerModal
        isOpen={showSymbolPicker}
        onClose={() => setShowSymbolPicker(false)}
        onSelectSymbol={(sym) => {
          addAacItem({
            label: sym.label,
            speechText: sym.speechText || sym.label,
            photoUrl: sym.photoUrl,
            emoji: sym.emoji || '✨',
            category: sym.category || 'food',
            colorType: sym.colorType || 'noun',
          });
        }}
        onImportPack={(pack) => {
          importAacPack(pack.items);
        }}
        onUpgradeAll={upgradeAllAacToClinicalSymbols}
      />
    </div>
  );
};
