import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORLD_ITEMS_CATALOG } from '../data/defaultData';
import { AnimatedWorldItem } from './AnimatedWorldItem';
import { 
  Star, 
  ShoppingBag, 
  UserCheck, 
  Home, 
  Trees, 
  Gamepad2, 
  Check, 
  Heart, 
  Volume2, 
  Trophy, 
  Trash2, 
  Smile, 
  Zap, 
  Info, 
  Crown 
} from 'lucide-react';
import { playChime, playEntitySound } from '../utils/audio';
import { Rewards } from './Rewards';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { ChildAvatar } from './ChildAvatar';

export const MyWorldView: React.FC = () => {
  const {
    worldState,
    setCurrentRoom,
    buyWorldItem,
    placeWorldItem,
    removePlacedItem,
    speak,
    announce,
    settings,
    isPremium,
    triggerUpgrade,
    avatar,
    childProfile,
    setShowAvatarCreator,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'world' | 'shop' | 'rewards'>('world');
  const [petFeedback, setPetFeedback] = useState<string | null>(null);
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);

  // Placed items in the current room
  const roomPlacedItems = worldState.placedItems.filter(
    (item) => item.room === worldState.currentRoom
  );

  const rooms: { id: 'bedroom' | 'playroom' | 'yard'; label: string; emoji: string; bgClass: string }[] = [
    { id: 'bedroom', label: 'Cozy Bedroom', emoji: '🛏️', bgClass: 'from-amber-50 to-orange-100/70 border-amber-200' },
    { id: 'playroom', label: 'Playroom', emoji: '🧸', bgClass: 'from-sky-50 to-indigo-100/70 border-sky-200' },
    { id: 'yard', label: 'Sunny Yard', emoji: '🌳', bgClass: 'from-emerald-50 to-teal-100/70 border-emerald-200' },
  ];

  const currentRoomObj = rooms.find((r) => r.id === worldState.currentRoom) || rooms[0];

  const handleInteractWithItem = (itemCatalogId: string, itemName: string, actionType?: 'pet' | 'feed' | 'play') => {
    playEntitySound(itemCatalogId);

    if (itemCatalogId.includes('puppy')) {
      if (actionType === 'feed') {
        setPetFeedback('Crunch crunch! The puppy happily munches a bone biscuit! 🦴 Yum!');
        announce('The puppy eats a yummy biscuit! Good boy!');
      } else if (actionType === 'play') {
        setPetFeedback('You throw the tennis ball! The puppy zooms across the room and brings it back! 🎾 Woof!');
        announce('The puppy fetches the ball and wags its tail!');
      } else {
        setPetFeedback('The puppy wags its tail happily, rolls over, and gives you sweet puppy kisses! 🐶 Woof!');
        announce('The puppy wags its tail happily!');
      }
    } else if (itemCatalogId.includes('kitten')) {
      if (actionType === 'feed') {
        setPetFeedback('The kitten licks up some warm milk and purrs softly! 🥛 Purr...');
        announce('The kitten drinks warm milk and purrs!');
      } else if (actionType === 'play') {
        setPetFeedback('The kitten playfully swats at a yarn ball with little paws! 🧶 Pounce!');
        announce('The kitten swats at yarn!');
      } else {
        setPetFeedback('The fluffy kitten purrs softly in your lap and stretches out cozy paws! 🐱 Purr...');
        announce('The kitten purrs softly and cuddles close.');
      }
    } else if (itemCatalogId.includes('bunny')) {
      if (actionType === 'feed') {
        setPetFeedback('Crunch munch! The calm bunny nibbles on a crisp golden carrot! 🥕');
        announce('The bunny crunches a sweet carrot!');
      } else {
        setPetFeedback('The velvety bunny hops joyfully and wiggles its little pink nose! 🐰 Hop hop!');
        announce('The bunny hops and wiggles its nose.');
      }
    } else if (itemCatalogId.includes('turtle')) {
      setPetFeedback('The wise turtle breathes slowly and peacefully. Inhale... and exhale. 🐢 Calming breaths...');
      announce('The wise turtle reminds us: Take a deep, peaceful breath.');
    } else if (itemCatalogId.includes('train')) {
      setPetFeedback('Choo choo! The wooden steam train chugs along the railway with happy steam puffs! 🚂 Toot!');
      announce('Choo choo! The train chugs along the tracks.');
    } else if (itemCatalogId.includes('tent')) {
      setPetFeedback('You step inside the cozy sensory hideaway tent. Soft fairy lights twinkle peacefully. ⛺ Quiet sanctuary.');
      announce('A peaceful hideaway with glowing fairy lights.');
    } else if (itemCatalogId.includes('projector') || itemCatalogId.includes('nightlight')) {
      setPetFeedback('The star projector swirls constellations and shooting stars across the room! ✨ Starlight dream.');
      announce('Stars and galaxies spin across the ceiling.');
    } else if (itemCatalogId.includes('trampoline')) {
      setPetFeedback('Boing! Boing! You bounce high on the rebounder with big happy smiles! 🤸 Springy fun!');
      announce('Boing! Boing! Fun bounce!');
    } else if (itemCatalogId.includes('aquarium')) {
      setPetFeedback('Neon fish glide through bubbling aqua water and hide behind swaying sea grass! 🐠 Bubble bubble.');
      announce('The fish swim peacefully in bubbling water.');
    } else if (itemCatalogId.includes('plant')) {
      setPetFeedback('The sunflower friend sways in the warm sunshine and beams a bright smile at you! 🌻 Warmth.');
      announce('The sunflower friend sways and smiles.');
    } else if (itemCatalogId.includes('beanbag')) {
      setPetFeedback('Squelch! You sink into the ultra-squishy beanbag for a wonderful restful break. 🛋️ Ahhh.');
      announce('You sink into the cozy beanbag.');
    } else {
      setPetFeedback(`You enjoy your ${itemName}!`);
      announce(`I love my ${itemName}.`);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* World Top Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-xs gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab('world')}
            className={`px-3 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'world'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🏡 My Room</span>
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Reward Shop</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Badges</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAvatarCreator(true);
              playChime('tap');
            }}
            className="px-3 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 shadow-2xs"
            title="Open Avatar Creator Studio"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Avatar Studio</span>
          </button>
        </div>

        {/* Stars counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs sm:text-sm shadow-2xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{worldState.stars || 0}</span>
          <span className="text-[10px] text-amber-700 font-bold uppercase">Stars</span>
        </div>
      </div>

      {/* TAB 1: THE VIRTUAL ROOM WORLD */}
      {activeTab === 'world' && (
        <div className="space-y-4">
          {/* Room Selector */}
          <div className="flex items-center gap-2">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setCurrentRoom(r.id)}
                className={`flex-1 py-2 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                  worldState.currentRoom === r.id
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <RoutineStickerIcon emoji={r.emoji} title={r.label} size={22} className="w-5.5 h-5.5 object-contain" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Room Canvas */}
          <div
            className={`relative w-full h-[360px] sm:h-[420px] rounded-3xl bg-gradient-to-b ${currentRoomObj.bgClass} border-4 shadow-inner overflow-hidden p-6 flex flex-col justify-between`}
          >
            {/* Top Room Decor & Sky */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200">
                {currentRoomObj.label}
              </span>
              <span className="text-3xl select-none">✨ ☁️</span>
            </div>

            {/* Placed Items inside room */}
            <div className="flex-1 flex flex-wrap items-end justify-around gap-6 p-4 z-10 min-h-[220px]">
              {/* Child's Avatar standing proudly in their space */}
              <div 
                onClick={() => {
                  setShowAvatarCreator(true);
                  playChime('tap');
                }}
                className="relative flex flex-col items-center cursor-pointer group hover:scale-105 active:scale-95 transition-all shrink-0 z-20"
                title="Tap to customize your avatar in Avatar Studio"
              >
                <div className="relative">
                  <ChildAvatar config={avatar} size="lg" />
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black shadow-xs group-hover:scale-110 transition-transform">
                    Edit ✨
                  </span>
                </div>
                <span className="text-[11px] font-black text-slate-800 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-slate-200/90 shadow-2xs mt-1">
                  {childProfile.name}
                </span>
              </div>

              {roomPlacedItems.length === 0 && (
                <div className="text-center bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-dashed border-slate-300 mx-auto my-auto">
                  <p className="text-xs font-bold text-slate-600">Your room is waiting for your favorite companions!</p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="mt-2 px-3 py-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Open Shop to Add Pets & Toys ✨
                  </button>
                </div>
              )}

              {roomPlacedItems.map((placed) => {
                const item = WORLD_ITEMS_CATALOG.find((i) => i.id === placed.itemId);
                if (!item) return null;
                const isSelected = selectedPlacedId === placed.id;
                const isPet = item.category === 'pet';

                return (
                  <div
                    key={placed.id}
                    className="relative flex flex-col items-center justify-end group transition-all"
                  >
                    {/* Floating Pet / Item Action Toolbar */}
                    {isSelected && (
                      <div className="absolute -top-12 z-30 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-1 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                        {isPet ? (
                          <>
                            <button
                              onClick={() => handleInteractWithItem(item.id, item.name, 'pet')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Pet with gentle pats"
                            >
                              <RoutineStickerIcon emoji="🐾" title="Pet" size={16} className="w-4 h-4 object-contain" />
                              <span>Pet</span>
                            </button>
                            <button
                              onClick={() => handleInteractWithItem(item.id, item.name, 'feed')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Feed a treat"
                            >
                              <RoutineStickerIcon emoji="🦴" title="Feed" size={16} className="w-4 h-4 object-contain" />
                              <span>Feed</span>
                            </button>
                            <button
                              onClick={() => handleInteractWithItem(item.id, item.name, 'play')}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Play fetch"
                            >
                              <RoutineStickerIcon emoji="🎾" title="Play" size={16} className="w-4 h-4 object-contain" />
                              <span>Play</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleInteractWithItem(item.id, item.name)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                          >
                            <RoutineStickerIcon emoji="✨" title="Interact" size={16} className="w-4 h-4 object-contain" />
                            <span>Interact</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            removePlacedItem(placed.id);
                            setSelectedPlacedId(null);
                          }}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                          title="Put away in inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Real Animated Entity Component */}
                    <button
                      type="button"
                      aria-label={`Interact with ${item.name}`}
                      onClick={() => {
                        setSelectedPlacedId(isSelected ? null : placed.id);
                        handleInteractWithItem(item.id, item.name);
                      }}
                      className="cursor-pointer active:scale-95 transition-all group-hover:scale-105 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none rounded-2xl bg-transparent border-0 p-0"
                      title={`Tap ${item.name} to interact`}
                    >
                      <AnimatedWorldItem
                        itemId={item.id}
                        size="lg"
                        interactive={false}
                        showFloorShadow={true}
                        reduceMotion={settings.reduceMotion}
                        onInteract={() => handleInteractWithItem(item.id, item.name)}
                      />
                    </button>

                    {/* Interactive Name Pill */}
                    <button
                      onClick={() => setSelectedPlacedId(isSelected ? null : placed.id)}
                      className={`mt-2 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-300'
                          : 'bg-white/90 text-slate-800 border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      {item.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Floor / Ground line */}
            <div className="w-full bg-amber-900/10 rounded-2xl p-2.5 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Tap your pets or items to interact!</span>
              <button
                onClick={() => setActiveTab('shop')}
                className="text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Add new furniture or pets</span>
                <Star className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pet / Item Interaction Speech Bubble */}
          {petFeedback && (
            <div className="bg-white border-2 border-teal-300 rounded-2xl p-3.5 text-center shadow-sm animate-in fade-in flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-400 shrink-0" />
              <p className="text-sm font-black text-teal-950">{petFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROOM FURNITURE & PETS CATALOG */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                Room Furniture & Pets
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                Choose cozy furniture, sensory items, and pet companions to decorate your rooms!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {WORLD_ITEMS_CATALOG.map((item) => {
              const isPlacedInCurrentRoom = worldState.placedItems.some(
                (p) => p.itemId === item.id && p.room === worldState.currentRoom
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        aria-label={`Preview animation for ${item.name}`}
                        onClick={() => handleInteractWithItem(item.id, item.name)}
                        className="w-20 h-20 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-1.5 flex items-center justify-center border border-slate-200/80 shadow-inner group hover:border-teal-300 transition-colors cursor-pointer focus-visible:ring-4 focus-visible:ring-teal-400 focus-visible:outline-none"
                        title="Tap to preview animation and sounds"
                      >
                        <AnimatedWorldItem
                          itemId={item.id}
                          size="md"
                          interactive={false}
                          reduceMotion={settings.reduceMotion}
                        />
                      </button>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {item.category}
                        </span>
                        <span className="text-[9px] font-black text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          ✨ Tap to Test
                        </span>
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 text-sm sm:text-base">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Virtual Room Item
                    </span>

                    {isPlacedInCurrentRoom ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        In Room
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          placeWorldItem(item.id, worldState.currentRoom);
                          setActiveTab('world');
                        }}
                        className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all"
                      >
                        Place in Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: REWARDS & BADGES COMPONENT */}
      {activeTab === 'rewards' && <Rewards />}
    </div>
  );
};
