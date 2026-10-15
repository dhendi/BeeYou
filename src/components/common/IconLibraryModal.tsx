import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, Check } from 'lucide-react';
import { RoutineStickerIcon } from '../icons/JournalStickers';
import { playChime } from '../../utils/audio';

export interface LibraryIconItem {
  id: string;
  emoji: string;
  label: string;
  category: 'fun' | 'calm' | 'food' | 'daily';
  keywords: string[];
}

export const ICON_LIBRARY: LibraryIconItem[] = [
  // Fun & Play
  { id: 'art', emoji: '🎨', label: 'Art & Crafts', category: 'fun', keywords: ['art', 'draw', 'paint', 'craft', 'color'] },
  { id: 'toys', emoji: '🧸', label: 'Toys & Teddy', category: 'fun', keywords: ['toy', 'teddy', 'play', 'bear', 'stuffed'] },
  { id: 'puzzle', emoji: '🧩', label: 'Puzzle & Blocks', category: 'fun', keywords: ['puzzle', 'fidget', 'block', 'lego', 'build'] },
  { id: 'playground', emoji: '🛝', label: 'Playground', category: 'fun', keywords: ['playground', 'swing', 'slide', 'park', 'recess'] },
  { id: 'tablet', emoji: '📱', label: 'Tablet & iPad', category: 'fun', keywords: ['tablet', 'ipad', 'screen', 'device', 'game'] },
  { id: 'games', emoji: '🎮', label: 'Video Games', category: 'fun', keywords: ['game', 'controller', 'playstation', 'nintendo', 'gaming'] },
  { id: 'music', emoji: '🎵', label: 'Music & Audio', category: 'fun', keywords: ['music', 'song', 'listen', 'sound', 'melody'] },
  { id: 'reading', emoji: '📖', label: 'Story & Books', category: 'fun', keywords: ['book', 'read', 'story', 'literature'] },
  { id: 'science', emoji: '🔬', label: 'Science Flask', category: 'fun', keywords: ['science', 'flask', 'experiment', 'lab', 'explore'] },
  { id: 'trophy', emoji: '🏆', label: 'Reward Trophy', category: 'fun', keywords: ['trophy', 'reward', 'win', 'prize', 'success'] },
  { id: 'balloons', emoji: '🎈', label: 'Celebration', category: 'fun', keywords: ['party', 'balloon', 'fun', 'celebrate'] },

  // Calm & Sensory
  { id: 'quiet', emoji: '🛋️', label: 'Quiet Break', category: 'calm', keywords: ['break', 'quiet', 'couch', 'relax', 'fort', 'chill', 'sofa'] },
  { id: 'bubbles', emoji: '🫧', label: 'Fidget Bubbles', category: 'calm', keywords: ['fidget', 'bubble', 'sensory', 'squishy', 'pop'] },
  { id: 'headphones', emoji: '🎧', label: 'Headphones', category: 'calm', keywords: ['headphone', 'audio', 'earmuffs', 'calm', 'decompress'] },
  { id: 'sparkles', emoji: '✨', label: 'Mindful Calm', category: 'calm', keywords: ['sparkle', 'magic', 'mindful', 'reset', 'star'] },
  { id: 'breathe', emoji: '🌬️', label: 'Deep Breathing', category: 'calm', keywords: ['breathe', 'wind', 'air', 'inhale', 'exhale'] },
  { id: 'rest', emoji: '🌙', label: 'Evening Rest', category: 'calm', keywords: ['rest', 'night', 'moon', 'relax', 'bedtime'] },
  { id: 'bed', emoji: '🛏️', label: 'Bed & Nap', category: 'calm', keywords: ['sleep', 'nap', 'bed', 'blanket', 'lie down'] },
  { id: 'bath', emoji: '🛁', label: 'Warm Bath', category: 'calm', keywords: ['bath', 'tub', 'water', 'bubbles', 'relax'] },
  { id: 'pet', emoji: '🐕', label: 'Pet Snuggle', category: 'calm', keywords: ['pet', 'dog', 'puppy', 'cat', 'snuggle', 'animal'] },
  { id: 'heart', emoji: '❤️', label: 'Gentle Comfort', category: 'calm', keywords: ['heart', 'love', 'comfort', 'care', 'safe'] },

  // Food & Drinks
  { id: 'pizza', emoji: '🍕', label: 'Pizza Lunch', category: 'food', keywords: ['pizza', 'lunch', 'slice', 'dinner'] },
  { id: 'pancakes', emoji: '🥞', label: 'Pancakes', category: 'food', keywords: ['pancake', 'breakfast', 'syrup', 'fluffy'] },
  { id: 'sandwich', emoji: '🥪', label: 'Sandwich Meal', category: 'food', keywords: ['sandwich', 'lunch', 'bread', 'meal'] },
  { id: 'apple', emoji: '🍎', label: 'Apple Snack', category: 'food', keywords: ['apple', 'fruit', 'snack', 'healthy'] },
  { id: 'candy', emoji: '🍬', label: 'Treat / Candy', category: 'food', keywords: ['candy', 'sweet', 'treat', 'gummy'] },
  { id: 'meal', emoji: '🍽️', label: 'Dinner Plate', category: 'food', keywords: ['dinner', 'plate', 'meal', 'food', 'fork', 'spoon'] },
  { id: 'drink', emoji: '🥤', label: 'Drink Cup', category: 'food', keywords: ['drink', 'cup', 'juice', 'soda', 'straw'] },
  { id: 'water', emoji: '💧', label: 'Drink Water', category: 'food', keywords: ['water', 'hydrate', 'thirst', 'drop'] },
  { id: 'cocoa', emoji: '☕', label: 'Warm Cocoa', category: 'food', keywords: ['cocoa', 'hot chocolate', 'tea', 'warm drink'] },

  // Daily & Places
  { id: 'wakeup', emoji: '⏰', label: 'Wake Up Clock', category: 'daily', keywords: ['wake', 'alarm', 'clock', 'morning', 'time'] },
  { id: 'teeth', emoji: '🪥', label: 'Brush Teeth', category: 'daily', keywords: ['teeth', 'brush', 'toothbrush', 'paste'] },
  { id: 'clothes', emoji: '👕', label: 'Get Dressed', category: 'daily', keywords: ['clothes', 'dress', 'shirt', 'pants'] },
  { id: 'wash', emoji: '🧼', label: 'Wash Hands', category: 'daily', keywords: ['wash', 'soap', 'clean', 'hands', 'sink'] },
  { id: 'shower', emoji: '🚿', label: 'Shower Wash', category: 'daily', keywords: ['shower', 'clean', 'water', 'wash'] },
  { id: 'shoes', emoji: '👟', label: 'Put on Shoes', category: 'daily', keywords: ['shoe', 'sneaker', 'feet', 'outside'] },
  { id: 'backpack', emoji: '🎒', label: 'Backpack', category: 'daily', keywords: ['backpack', 'bag', 'school', 'pack'] },
  { id: 'school', emoji: '🏫', label: 'School Building', category: 'daily', keywords: ['school', 'class', 'classroom', 'building'] },
  { id: 'bus', emoji: '🚌', label: 'School Bus', category: 'daily', keywords: ['bus', 'ride', 'travel', 'commute'] },
  { id: 'car', emoji: '🚗', label: 'Car Ride', category: 'daily', keywords: ['car', 'drive', 'trip', 'travel', 'ride'] },
  { id: 'dentist', emoji: '🦷', label: 'Dentist Visit', category: 'daily', keywords: ['dentist', 'dental', 'teeth', 'clinic'] },
  { id: 'doctor', emoji: '🩺', label: 'Doctor Visit', category: 'daily', keywords: ['doctor', 'checkup', 'stethoscope', 'health'] },
  { id: 'haircut', emoji: '✂️', label: 'Haircut', category: 'daily', keywords: ['haircut', 'scissors', 'barber', 'salon'] },
  { id: 'birthday', emoji: '🎂', label: 'Birthday Party', category: 'daily', keywords: ['birthday', 'party', 'cake', 'celebrate'] },
  { id: 'plans_change', emoji: '🔄', label: 'Change of Plans', category: 'daily', keywords: ['change', 'switch', 'routine', 'plans'] },
  { id: 'sunshine', emoji: '☀️', label: 'Outdoor Sun', category: 'daily', keywords: ['sun', 'outside', 'weather', 'walk'] },
  { id: 'rain', emoji: '🌧️', label: 'Rainy Weather', category: 'daily', keywords: ['rain', 'weather', 'cloud', 'storm'] },
  { id: 'folder', emoji: '📁', label: 'Folder / Binder', category: 'daily', keywords: ['folder', 'binder', 'homework', 'papers'] },
  { id: 'writing', emoji: '✏️', label: 'Writing Class', category: 'daily', keywords: ['pencil', 'write', 'draw', 'homework', 'math'] },
  { id: 'meds', emoji: '💊', label: 'Medication', category: 'daily', keywords: ['medicine', 'medication', 'pill', 'vitamin', 'health'] },
  { id: 'inhaler', emoji: '🫁', label: 'Inhaler / Lungs', category: 'daily', keywords: ['inhaler', 'lungs', 'breathe', 'puff', 'asthma'] },

  // Adventures & Community
  { id: 'cart', emoji: '🛒', label: 'Supermarket / Grocery', category: 'daily', keywords: ['grocery', 'supermarket', 'store', 'shop', 'cart', 'market', 'shopping', 'buy'] },
  { id: 'plane', emoji: '✈️', label: 'Airplane / Airport', category: 'daily', keywords: ['plane', 'airplane', 'airport', 'flight', 'travel', 'trip', 'flying'] },
  { id: 'train', emoji: '🚆', label: 'Train / Subway', category: 'daily', keywords: ['train', 'subway', 'metro', 'station', 'transit', 'ride'] },
  { id: 'zoo', emoji: '🦁', label: 'Zoo & Animals', category: 'fun', keywords: ['zoo', 'animal', 'lion', 'safari', 'wildlife', 'pets'] },
  { id: 'library', emoji: '📚', label: 'Library & Reading', category: 'daily', keywords: ['library', 'books', 'quiet', 'borrow', 'study', 'read'] },
  { id: 'cinema', emoji: '🍿', label: 'Movie Theater', category: 'fun', keywords: ['movie', 'theater', 'cinema', 'popcorn', 'film', 'show'] },
  { id: 'swim', emoji: '🏊', label: 'Swimming Pool', category: 'fun', keywords: ['swim', 'pool', 'swimming', 'water', 'splash'] },
  { id: 'beach', emoji: '🏖️', label: 'Beach & Ocean', category: 'fun', keywords: ['beach', 'sand', 'ocean', 'sea', 'vacation', 'waves'] },
  { id: 'camp', emoji: '⛺', label: 'Camping & Tent', category: 'fun', keywords: ['camp', 'camping', 'tent', 'outdoors', 'nature', 'fire'] },
  { id: 'bowling', emoji: '🎳', label: 'Bowling Alley', category: 'fun', keywords: ['bowling', 'pins', 'ball', 'strike', 'game'] },
  { id: 'ferris', emoji: '🎡', label: 'Amusement Park', category: 'fun', keywords: ['amusement', 'carnival', 'ferris', 'wheel', 'fair', 'rides', 'park'] },
  { id: 'museum', emoji: '🏛️', label: 'Museum Visit', category: 'fun', keywords: ['museum', 'art', 'history', 'exhibit', 'tour'] },
  { id: 'park', emoji: '🌳', label: 'Park & Nature Walk', category: 'fun', keywords: ['park', 'tree', 'walk', 'nature', 'outside', 'trail'] },
  { id: 'post', emoji: '✉️', label: 'Post Office & Mail', category: 'daily', keywords: ['mail', 'post', 'letter', 'package', 'stamp'] },
  { id: 'hotel', emoji: '🏨', label: 'Hotel & Vacation Stay', category: 'daily', keywords: ['hotel', 'motel', 'vacation', 'stay', 'trip', 'travel'] },

  // Favorite Phrases & Requests
  { id: 'lego', emoji: '🧱', label: 'Lego / Building Blocks', category: 'fun', keywords: ['lego', 'brick', 'block', 'toy', 'build', 'play'] },
  { id: 'stop', emoji: '🛑', label: 'Stop Sign / Pause', category: 'calm', keywords: ['stop', 'halt', 'pause', 'wait', 'no', 'red'] },
  { id: 'sos_badge', emoji: '🆘', label: 'SOS / Help Please', category: 'calm', keywords: ['help', 'sos', 'assist', 'need', 'emergency'] },
  { id: 'tree_outside', emoji: '🌳', label: 'Go Outside / Tree', category: 'fun', keywords: ['outside', 'tree', 'nature', 'park', 'outdoor'] },
  { id: 'tired_rest', emoji: '😴', label: 'Tired / Rest', category: 'calm', keywords: ['tired', 'rest', 'sleep', 'bed', 'nap', 'sleepy'] },
  { id: 'happy_smile', emoji: '😊', label: 'I Am Happy', category: 'calm', keywords: ['happy', 'smile', 'joy', 'good', 'cheerful'] },
];

export interface IconLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (emoji: string, label: string) => void;
  selectedEmoji?: string;
  title?: string;
}

export const IconLibraryModal: React.FC<IconLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  selectedEmoji,
  title = 'BeeYou Icon Library',
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'fun' | 'calm' | 'food' | 'daily'>('all');
  const [customInput, setCustomInput] = useState('');

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ICON_LIBRARY.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q)) ||
        item.emoji.includes(q)
      );
    });
  }, [search, activeTab]);

  if (!isOpen) return null;

  const handlePick = (emoji: string, label: string) => {
    playChime('tap');
    onSelectIcon(emoji, label);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handlePick(customInput.trim(), 'Custom icon');
      setCustomInput('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in fade-in"
    >
      <div className="bg-white border-3 border-amber-300 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-4 sm:p-5 text-amber-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-xl shrink-0">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black leading-tight">
                {title}
              </h3>
              <p className="text-xs font-semibold text-amber-900/80 mt-0.5">
                Pick a matching sticker icon for this activity step
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/50 hover:bg-white/80 text-amber-950 transition-all cursor-pointer"
            aria-label="Close icon library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-amber-50/40 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons (e.g. pizza, art, quiet, brush, car)..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'all', label: 'All Icons' },
              { id: 'fun', label: 'Fun & Play' },
              { id: 'calm', label: 'Calm & Rest' },
              { id: 'food', label: 'Food & Drinks' },
              { id: 'daily', label: 'Daily & Places' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    playChime('tap');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'bg-white hover:bg-amber-100/60 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Icons */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredIcons.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-bold text-sm">No icons found matching "{search}"</p>
              <p className="text-xs mt-1">Try a different keyword or enter a custom emoji below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filteredIcons.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePick(item.emoji, item.label)}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 group ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 text-amber-950 shadow-xs'
                        : 'bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-300 text-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <RoutineStickerIcon
                        emoji={item.emoji}
                        title={item.label}
                        className="w-10 h-10 object-contain drop-shadow-2xs"
                      />
                    </div>
                    <span className="font-bold text-[11px] leading-tight line-clamp-2 mt-1">
                      {item.label}
                    </span>
                    {isSelected && (
                      <span className="mt-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Custom Emoji or Text Fallback */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <form onSubmit={handleApplyCustom} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-slate-500 shrink-0">
              Custom icon:
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. ⭐ or 🚀"
              className="w-24 px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
            >
              Apply
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer ml-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
