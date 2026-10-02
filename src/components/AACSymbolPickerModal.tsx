import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Sparkles, 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  BookOpen, 
  Layers, 
  Volume2, 
  AlertCircle,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
  Palette
} from 'lucide-react';
import { 
  AacSymbolItem, 
  searchArasaacPictograms, 
  CURATED_AAC_SYMBOLS, 
  INDUSTRY_AAC_PACKS, 
  IndustryAacPack 
} from '../services/arasaacService';
import { AACCategory, AACItem } from '../types';
import { playChime, speakText } from '../utils/audio';

interface AACSymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: {
    photoUrl: string;
    label: string;
    speechText?: string;
    emoji?: string;
    arasaacId?: number;
    category?: AACCategory;
    colorType?: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  }) => void;
  initialQuery?: string;
  initialColorType?: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  activeCategory?: AACCategory;
  onImportPack?: (pack: IndustryAacPack) => void;
  onUpgradeAll?: () => void;
}

export const AACSymbolPickerModal: React.FC<AACSymbolPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  initialQuery = '',
  initialColorType = 'noun',
  activeCategory = 'core',
  onImportPack,
  onUpgradeAll,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'packs' | 'upload' | 'guide'>('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<AacSymbolItem[]>(CURATED_AAC_SYMBOLS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<AacSymbolItem | null>(null);
  const [upgradedAll, setUpgradedAll] = useState(false);
  
  // Quick 1-Tap Add Mode
  const [quickAddMode, setQuickAddMode] = useState<boolean>(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom button builder state within modal
  const [customLabel, setCustomLabel] = useState(initialQuery || '');
  const [customSpeech, setCustomSpeech] = useState(initialQuery || '');
  const [customColor, setCustomColor] = useState<'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency'>(initialColorType);
  const [customCategory, setCustomCategory] = useState<AACCategory>(activeCategory || 'food');
  const [importedPackId, setImportedPackId] = useState<string | null>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Quick search keywords
  const QUICK_KEYWORDS = [
    'want', 'help', 'stop', 'more', 'water', 'eat', 'drink', 'toilet', 'happy', 'tired', 'break', 'ipad', 'hug', 'play'
  ];

  const CATEGORY_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'core', label: 'Core / Daily' },
    { id: 'food', label: 'Food & Drinks' },
    { id: 'actions', label: 'Actions' },
    { id: 'feelings', label: 'Feelings & Sensory' },
    { id: 'social', label: 'Social & Fun' },
    { id: 'places', label: 'Places' },
  ];

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setCustomLabel(initialQuery);
      setCustomSpeech(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) {
      setSearchResults(CURATED_AAC_SYMBOLS);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchArasaacPictograms(q);
      setSearchResults(results.length > 0 ? results : CURATED_AAC_SYMBOLS);
    } catch (e) {
      console.warn('Search error', e);
      setSearchResults(CURATED_AAC_SYMBOLS);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedResults = searchResults.filter((sym) => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'core') return sym.category === 'core' || sym.category === 'personal';
    if (selectedCategoryFilter === 'food') return sym.category === 'food' || sym.category === 'drinks';
    if (selectedCategoryFilter === 'actions') return sym.category === 'actions';
    if (selectedCategoryFilter === 'feelings') return sym.category === 'feelings' || sym.category === 'sensory';
    if (selectedCategoryFilter === 'social') return sym.category === 'social' || sym.category === 'activities';
    if (selectedCategoryFilter === 'places') return sym.category === 'places';
    return true;
  });

  const handleSelect = (symbol: AacSymbolItem) => {
    setSelectedSymbol(symbol);
    setCustomLabel(symbol.label);
    setCustomSpeech(symbol.label);
    if (symbol.colorType) setCustomColor(symbol.colorType);
    if (symbol.category) setCustomCategory(symbol.category);
    playChime('tap');
  };

  const handleQuickAdd = (symbol: AacSymbolItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetCat = customCategory || activeCategory || symbol.category || 'core';
    const targetColor = symbol.colorType || customColor || 'noun';
    
    const arasaacNum = typeof symbol.id === 'number' ? symbol.id : (typeof symbol.id === 'string' && /^\d+$/.test(symbol.id) ? parseInt(symbol.id) : undefined);

    onSelectSymbol({
      photoUrl: symbol.imageUrl,
      label: symbol.label,
      speechText: symbol.label,
      emoji: '🖼️',
      arasaacId: arasaacNum,
      category: targetCat,
      colorType: targetColor,
    });

    setAddedIds((prev) => new Set(prev).add(String(symbol.id)));
    setToastMessage(`Added "${symbol.label}" directly to your AAC board!`);
    playChime('star');

    // Auto clear toast after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirmSelection = () => {
    if (!selectedSymbol) return;
    playChime('star');
    const arasaacNum = typeof selectedSymbol.id === 'number' ? selectedSymbol.id : (typeof selectedSymbol.id === 'string' && /^\d+$/.test(selectedSymbol.id) ? parseInt(selectedSymbol.id) : undefined);

    onSelectSymbol({
      photoUrl: selectedSymbol.imageUrl,
      label: customLabel.trim() || selectedSymbol.label,
      speechText: customSpeech.trim() || customLabel.trim() || selectedSymbol.label,
      emoji: '🖼️',
      arasaacId: arasaacNum,
      category: customCategory,
      colorType: customColor,
    });
    setAddedIds((prev) => new Set(prev).add(String(selectedSymbol.id)));
    setToastMessage(`Added "${customLabel.trim() || selectedSymbol.label}" to your AAC board!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 Data URL for 100% offline persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const customSymbol: AacSymbolItem = {
        id: `upload-${Date.now()}`,
        label: file.name.split('.')[0] || 'My Photo',
        imageUrl: dataUrl,
        category: customCategory,
        colorType: customColor,
        source: 'custom',
      };
      setSelectedSymbol(customSymbol);
      setCustomLabel(file.name.split('.')[0] || 'My Photo');
      setCustomSpeech(file.name.split('.')[0] || 'My Photo');
      playChime('star');
    };
    reader.readAsDataURL(file);
  };

  const getColorStyles = (color: typeof customColor) => {
    switch (color) {
      case 'subject': return 'bg-amber-100 border-amber-400 text-amber-950 ring-amber-300';
      case 'verb': return 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-emerald-300';
      case 'noun': return 'bg-orange-100 border-orange-400 text-orange-950 ring-orange-300';
      case 'adjective': return 'bg-sky-100 border-sky-400 text-sky-950 ring-sky-300';
      case 'social': return 'bg-purple-100 border-purple-400 text-purple-950 ring-purple-300';
      case 'emergency': return 'bg-rose-100 border-rose-400 text-rose-950 ring-rose-300';
      default: return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Online AAC Symbol & Button Tools"
      className="fixed inset-0 z-[9999] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white border-2 border-indigo-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Online AAC Symbol Tools
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  ARASAAC & Clinical Standards
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                AAC Button & Logo Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUpgradeAll && (
              <button
                type="button"
                onClick={() => {
                  onUpgradeAll();
                  setUpgradedAll(true);
                  playChime('complete');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Apply official ARASAAC clinical pictograms to all AAC buttons in Lumina"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{upgradedAll ? 'Symbols Upgraded ✓' : 'Upgrade All to ARASAAC'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                playChime('tap');
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              setActiveTab('search');
              playChime('tap');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'search'
                ? 'bg-white border-slate-200 border-b-white text-indigo-700 font-black shadow-2xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-500" />
            <span>Search 35,000+ Pictograms (ARASAAC)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('packs');
              playChime('tap');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'packs'
                ? 'bg-white border-slate-200 border-b-white text-indigo-700 font-black shadow-2xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Industry Standard Button Packs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              playChime('tap');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-white border-slate-200 border-b-white text-indigo-700 font-black shadow-2xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Upload Real Photos (Camera / File)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('guide');
              playChime('tap');
            }}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-white border-slate-200 border-b-white text-indigo-700 font-black shadow-2xs -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>What Other Apps Use</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: ARASAAC SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Bar with Live Clear */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    placeholder="Search 35,000+ clinical pictograms in real-time (e.g. water, pizza, iPad, help)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs sm:text-sm font-medium outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        handleSearch('');
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-all cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Category:</span>
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter(cat.id);
                      playChime('tap');
                    }}
                    className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Keywords Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Popular AAC:</span>
                {QUICK_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setSearchQuery(kw);
                      handleSearch(kw);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 font-semibold transition-all cursor-pointer capitalize"
                  >
                    {kw}
                  </button>
                ))}
              </div>

              {/* 1-Tap Quick Add Mode Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                    <span>Instant 1-Tap Add</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    Tap any picture to add it to your AAC board immediately!
                  </span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Target Folder:</span>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as AACCategory)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 font-bold text-xs text-slate-800 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="core">⭐ Core Board</option>
                    <option value="food">🍕 Food</option>
                    <option value="drinks">🧃 Drinks</option>
                    <option value="activities">🎮 Play & Fun</option>
                    <option value="places">🏠 Places</option>
                    <option value="people">👥 People</option>
                    <option value="feelings">💛 Feelings</option>
                    <option value="sensory">🎧 Sensory</option>
                  </select>
                </div>
              </div>

              {/* Toast Notification Banner */}
              {toastMessage && (
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl flex items-center justify-between text-xs font-black shadow-md animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>{toastMessage}</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    {addedIds.size} Added
                  </span>
                </div>
              )}

              {/* Search Results Grid */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    {isSearching ? 'Searching ARASAAC clinical library...' : `Results (${displayedResults.length})`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {quickAddMode ? '⚡ Tap any tile to add right away' : 'Tap to customize & add'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-72 sm:max-h-80 overflow-y-auto p-1">
                  {displayedResults.map((sym) => {
                    const isAdded = addedIds.has(sym.id);
                    const isSelected = selectedSymbol?.id === sym.id;
                    return (
                      <div
                        key={sym.id}
                        onClick={() => {
                          if (quickAddMode) {
                            handleQuickAdd(sym);
                          } else {
                            handleSelect(sym);
                          }
                        }}
                        className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between gap-1.5 bg-white transition-all cursor-pointer text-center relative group select-none ${
                          isAdded
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-300'
                            : isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-sm bg-indigo-50/30'
                            : 'border-slate-200 hover:border-indigo-400 hover:shadow-xs hover:bg-slate-50'
                        }`}
                      >
                        {/* Pictogram Image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-1">
                          <img
                            src={sym.imageUrl}
                            alt={sym.label}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Label */}
                        <span className="text-[11px] font-black text-slate-800 truncate w-full leading-tight">
                          {sym.label}
                        </span>

                        {/* 1-Tap Quick Add Action Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(sym, e)}
                          className={`w-full py-1 px-1.5 rounded-xl font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white shadow-2xs active:scale-95'
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-800 hover:text-white border border-indigo-200 shadow-2xs active:scale-95'
                          }`}
                          title={`Add "${sym.label}" immediately to ${customCategory}`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added ✓</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-indigo-500 group-hover:text-white" />
                              <span>+ Add Word</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDUSTRY STANDARD PACKS */}
          {activeTab === 'packs' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                💡 <strong>Pre-Built AAC Standard Packs:</strong> These bundles are structured using the clinical vocabulary systems found in market leaders like <strong>TouchChat</strong>, <strong>LAMP Words for Life</strong>, and <strong>Proloquo2Go</strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INDUSTRY_AAC_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{pack.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {pack.badge}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm">
                        {pack.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                        {pack.description}
                      </p>
                      <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        Used by: {pack.usedBy}
                      </div>

                      {/* Mini preview of symbols in pack */}
                      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        {pack.items.slice(0, 4).map((it, idx) => (
                          <div key={idx} className="p-1 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                            <img src={it.photoUrl} alt="" className="w-8 h-8 object-contain" />
                            <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center mt-0.5">
                              {it.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500">
                        {pack.items.length} words
                      </span>
                      {onImportPack && (
                        <button
                          type="button"
                          onClick={() => {
                            onImportPack(pack);
                            setImportedPackId(pack.id);
                            playChime('complete');
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                            importedPackId === pack.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                          }`}
                        >
                          {importedPackId === pack.id ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{importedPackId === pack.id ? 'Imported!' : 'Import Pack'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REAL PHOTO UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                📸 <strong>Speech-Language Pathologist Tip (Real Photo Modeling):</strong> For many children, real photos of their actual cup, favorite blanket, mom, dad, pet dog, or bedroom are significantly easier to recognize than drawings.
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-800 text-base">
                  Upload Real Photo from Phone or Computer
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Supports JPEG, PNG, WebP. Photos are stored securely in local browser storage for 100% offline access.
                </p>

                <label className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo File / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATIONAL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <h3 className="font-black text-sm mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>The Worldwide Standard AAC Symbol Systems</span>
                </h3>
                <p>
                  Here is what top communication apps, schools, and speech therapy clinics use across the globe:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">1. ARASAAC (Integrated in Lumina)</h4>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Open Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Created by the Government of Aragon. Used by open AAC apps (Cboard, AsTeRICS, LetMeTalk) and public healthcare across Europe and the Americas. Over 35,000+ standardized clinical pictograms.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">2. SymbolStix (n2y)</h4>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Proprietary</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Stick-figure illustrations with lively expressions. Used in <strong>TouchChat</strong> and <strong>Proloquo2Go</strong>. Requires private enterprise licensing.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">3. Boardmaker PCS (Tobii Dynavox)</h4>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Proprietary</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Picture Communication Symbols (classic egg-head characters). Used in <strong>TD Snap</strong> and special education classrooms worldwide.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm">4. Modified Fitzgerald Key Color System</h4>
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Color Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    The color standard supported in Lumina: Yellow (Pronouns/People), Green (Verbs), Orange (Nouns), Blue (Adjectives), Purple (Social), Red (Emergency/Stop).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LIVE BUTTON PREVIEW & FITZGERALD KEY COLOR PICKER */}
          {selectedSymbol && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Selected Button Live Preview</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Fitzgerald Color Coded
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Visual AAC Tile Preview */}
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-3 flex flex-col items-center justify-between p-2 shadow-md shrink-0 transition-all ${getColorStyles(
                    customColor
                  )}`}
                >
                  <div className="flex-1 w-full flex items-center justify-center p-1">
                    <img
                      src={selectedSymbol.imageUrl}
                      alt={customLabel}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="font-black text-xs sm:text-sm tracking-tight text-center truncate w-full">
                    {customLabel || selectedSymbol.label}
                  </span>
                </div>

                {/* Button Customization Controls */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Button Label:
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Spoken Phrase:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customSpeech}
                        onChange={(e) => setCustomSpeech(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => speakText(customSpeech || customLabel)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 cursor-pointer"
                        title="Audition speech"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Color Coding (Fitzgerald):
                    </label>
                    <select
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none"
                    >
                      <option value="noun">Noun (Orange)</option>
                      <option value="verb">Verb (Green)</option>
                      <option value="subject">Subject/Person (Yellow)</option>
                      <option value="adjective">Adjective (Blue)</option>
                      <option value="social">Social/Polite (Purple)</option>
                      <option value="emergency">Emergency/Stop (Red)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Category Tab:
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none"
                    >
                      <option value="core">Core Words ⭐</option>
                      <option value="food">Food 🍕</option>
                      <option value="drinks">Drinks 🧃</option>
                      <option value="activities">Play & Fun 🎮</option>
                      <option value="feelings">Feelings 💛</option>
                      <option value="sensory">Sensory 🎧</option>
                      <option value="places">Places 🏠</option>
                      <option value="people">People 👥</option>
                      <option value="actions">Actions 🏃</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            {addedIds.size > 0 ? (
              <span className="text-emerald-700 font-black flex items-center gap-1.5 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{addedIds.size} word{addedIds.size > 1 ? 's' : ''} added to your AAC board!</span>
              </span>
            ) : selectedSymbol ? (
              <span className="text-indigo-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: "{customLabel || selectedSymbol.label}"</span>
              </span>
            ) : (
              <span>Tap any symbol or "+ Add Word" to add immediately</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                addedIds.size > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {addedIds.size > 0 ? '✓ Done / View on AAC Board' : 'Close'}
            </button>
            
            {selectedSymbol && (
              <button
                type="button"
                onClick={() => {
                  handleConfirmSelection();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Add "{customLabel || selectedSymbol.label}" & Close</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
