import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORLD_ITEMS_CATALOG } from '../data/defaultData';
import { ChildAvatar } from './ChildAvatar';
import { AnimatedWorldItem } from './AnimatedWorldItem';
import { 
  Sparkles, 
  ShoppingBag, 
  UserCheck, 
  Home, 
  Trees, 
  Gamepad2, 
  Check, 
  Lock, 
  Heart,
  Volume2,
  Trophy,
  Trash2,
  Smile,
  Zap,
  Info
} from 'lucide-react';
import { playChime, playEntitySound } from '../utils/audio';
import { Rewards } from './Rewards';

export const MyWorldView: React.FC = () => {
  const {
    worldState,
    setCurrentRoom,
    buyWorldItem,
    placeWorldItem,
    removePlacedItem,
    avatar,
    updateAvatar,
    speak,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'world' | 'avatar' | 'shop' | 'rewards'>('world');
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
        speak('The puppy eats a yummy biscuit! Good boy!');
      } else if (actionType === 'play') {
        setPetFeedback('You throw the tennis ball! The puppy zooms across the room and brings it back! 🎾 Woof!');
        speak('The puppy fetches the ball and wags its tail!');
      } else {
        setPetFeedback('The puppy wags its tail happily, rolls over, and gives you sweet puppy kisses! 🐶 Woof!');
        speak('The puppy wags its tail happily!');
      }
    } else if (itemCatalogId.includes('kitten')) {
      if (actionType === 'feed') {
        setPetFeedback('The kitten licks up some warm milk and purrs softly! 🥛 Purr...');
        speak('The kitten drinks warm milk and purrs!');
      } else if (actionType === 'play') {
        setPetFeedback('The kitten playfully swats at a yarn ball with little paws! 🧶 Pounce!');
        speak('The kitten swats at yarn!');
      } else {
        setPetFeedback('The fluffy kitten purrs softly in your lap and stretches out cozy paws! 🐱 Purr...');
        speak('The kitten purrs softly and cuddles close.');
      }
    } else if (itemCatalogId.includes('bunny')) {
      if (actionType === 'feed') {
        setPetFeedback('Crunch munch! The calm bunny nibbles on a crisp golden carrot! 🥕');
        speak('The bunny crunches a sweet carrot!');
      } else {
        setPetFeedback('The velvety bunny hops joyfully and wiggles its little pink nose! 🐰 Hop hop!');
        speak('The bunny hops and wiggles its nose.');
      }
    } else if (itemCatalogId.includes('turtle')) {
      setPetFeedback('The wise turtle breathes slowly and peacefully. Inhale... and exhale. 🐢 Calming breaths...');
      speak('The wise turtle reminds us: Take a deep, peaceful breath.');
    } else if (itemCatalogId.includes('train')) {
      setPetFeedback('Choo choo! The wooden steam train chugs along the railway with happy steam puffs! 🚂 Toot!');
      speak('Choo choo! The train chugs along the tracks.');
    } else if (itemCatalogId.includes('tent')) {
      setPetFeedback('You step inside the cozy sensory hideaway tent. Soft fairy lights twinkle peacefully. ⛺ Quiet sanctuary.');
      speak('A peaceful hideaway with glowing fairy lights.');
    } else if (itemCatalogId.includes('projector') || itemCatalogId.includes('nightlight')) {
      setPetFeedback('The star projector swirls constellations and shooting stars across the room! ✨ Starlight dream.');
      speak('Stars and galaxies spin across the ceiling.');
    } else if (itemCatalogId.includes('trampoline')) {
      setPetFeedback('Boing! Boing! You bounce high on the rebounder with big happy smiles! 🤸 Springy fun!');
      speak('Boing! Boing! Fun bounce!');
    } else if (itemCatalogId.includes('aquarium')) {
      setPetFeedback('Neon fish glide through bubbling aqua water and hide behind swaying sea grass! 🐠 Bubble bubble.');
      speak('The fish swim peacefully in bubbling water.');
    } else if (itemCatalogId.includes('plant')) {
      setPetFeedback('The sunflower friend sways in the warm sunshine and beams a bright smile at you! 🌻 Warmth.');
      speak('The sunflower friend sways and smiles.');
    } else if (itemCatalogId.includes('beanbag')) {
      setPetFeedback('Squelch! You sink into the ultra-squishy beanbag for a wonderful restful break. 🛋️ Ahhh.');
      speak('You sink into the cozy beanbag.');
    } else {
      setPetFeedback(`You enjoy your ${itemName}!`);
      speak(`I love my ${itemName}.`);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* World Top Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-xs gap-2">
        <div className="flex items-center gap-1">
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
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🎨 My Avatar</span>
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
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 font-black text-xs sm:text-sm text-amber-900 shrink-0">
          <Sparkles className="w-4 h-4 fill-amber-400 text-amber-600" />
          <span>{worldState.stars} Stars</span>
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
                <span>{r.emoji}</span>
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
                              <span>🐾</span>
                              <span>Pet</span>
                            </button>
                            <button
                              onClick={() => handleInteractWithItem(item.id, item.name, 'feed')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Feed a treat"
                            >
                              <span>🦴</span>
                              <span>Feed</span>
                            </button>
                            <button
                              onClick={() => handleInteractWithItem(item.id, item.name, 'play')}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title="Play fetch"
                            >
                              <span>🎾</span>
                              <span>Play</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleInteractWithItem(item.id, item.name)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                          >
                            <span>✨</span>
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
                    <div
                      onClick={() => {
                        setSelectedPlacedId(isSelected ? null : placed.id);
                        handleInteractWithItem(item.id, item.name);
                      }}
                      className="cursor-pointer active:scale-95 transition-all group-hover:scale-105"
                      title={`Tap ${item.name} to interact`}
                    >
                      <AnimatedWorldItem
                        itemId={item.id}
                        size="lg"
                        interactive={true}
                        showFloorShadow={true}
                        reduceMotion={settings.reduceMotion}
                        onInteract={() => handleInteractWithItem(item.id, item.name)}
                      />
                    </div>

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

              {/* Child Avatar in the Room */}
              <div className="flex flex-col items-center justify-end">
                <div className="animate-bounce duration-1000">
                  <ChildAvatar config={avatar} size="lg" />
                </div>
                <div className="w-16 h-2.5 bg-black/15 rounded-full blur-[2px] mt-1" />
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/90 text-slate-800 shadow-xs border mt-1">
                  You
                </span>
              </div>
            </div>

            {/* Floor / Ground line */}
            <div className="w-full bg-amber-900/10 rounded-2xl p-2.5 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Tap your pets or items to interact!</span>
              <button
                onClick={() => setActiveTab('shop')}
                className="text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Add new furniture or pets</span>
                <Sparkles className="w-3.5 h-3.5" />
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

      {/* TAB 2: AVATAR BUILDER */}
      {activeTab === 'avatar' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
            <div className="bg-sky-50 border-2 border-sky-100 p-4 rounded-3xl shadow-inner flex flex-col items-center">
              <ChildAvatar config={avatar} size="xl" />
              <span className="text-xs font-bold text-sky-800 mt-2">Your Character</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black text-slate-800">Customize Your Avatar</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Choose what looks and feels most like you! Disabilities and aids like hearing aids, headphones, and wheelchairs are normal, wonderful parts of life.
              </p>
            </div>
          </div>

          {/* 1. Skin Tone */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Skin Tone
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {['#fde047', '#fcd34d', '#f59e0b', '#d97706', '#92400e', '#5a2e12'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => updateAvatar({ skinTone: tone })}
                  className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                    avatar.skinTone === tone ? 'scale-120 ring-3 ring-teal-500 border-white' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: tone }}
                />
              ))}
            </div>
          </div>

          {/* 2. Hair Style */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Hair Style
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'curly', label: 'Curly' },
                { id: 'short', label: 'Short' },
                { id: 'pigtails', label: 'Pigtails' },
                { id: 'spiky', label: 'Spiky' },
                { id: 'braids', label: 'Braids' },
                { id: 'wavy', label: 'Wavy' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateAvatar({ hairStyle: style.id as any })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    avatar.hairStyle === style.id
                      ? 'bg-teal-600 text-white border-teal-700'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hair Color */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Hair Color
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {['#18181b', '#451a03', '#78350f', '#d97706', '#ef4444', '#3b82f6'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateAvatar({ hairColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    avatar.hairColor === color ? 'scale-120 ring-3 ring-teal-500 border-white' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 4. Accessories & Hearing / Sensory Aids */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Sensory Aids & Accessories
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'sensory_headphones', label: 'Sensory Headphones 🎧' },
                { id: 'glasses', label: 'Glasses 👓' },
                { id: 'hearing_aids', label: 'Hearing Aids 🦻' },
                { id: 'cap', label: 'Cool Cap 🧢' },
                { id: 'none', label: 'None' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => updateAvatar({ accessory: acc.id as any })}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left transition-all cursor-pointer ${
                    avatar.accessory === acc.id
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Mobility Aids */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Mobility & Posture
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Standing 🚶' },
                { id: 'wheelchair', label: 'Wheelchair 🧑‍🦽' },
              ].map((aid) => (
                <button
                  key={aid.id}
                  onClick={() => updateAvatar({ mobilityAid: aid.id as any })}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left transition-all cursor-pointer ${
                    avatar.mobilityAid === aid.id
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {aid.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Communication & Companion Device */}
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
              Companion Item in Hand
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'aac_tablet', label: 'AAC Tablet 📱' },
                { id: 'none', label: 'None' },
              ].map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => updateAvatar({ companionDevice: dev.id as any })}
                  className={`p-2.5 rounded-xl font-bold text-xs border text-left transition-all cursor-pointer ${
                    avatar.companionDevice === dev.id
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {dev.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REWARD SHOP */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                Lumina Reward Catalog
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                Spend stars you earned from finishing daily routines and skills!
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-sm shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>{worldState.stars} Available</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {WORLD_ITEMS_CATALOG.map((item) => {
              const isUnlocked = worldState.unlockedItemIds.includes(item.id);
              const isPlacedInCurrentRoom = worldState.placedItems.some(
                (p) => p.itemId === item.id && p.room === worldState.currentRoom
              );
              const canAfford = worldState.stars >= item.costStars;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-20 h-20 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl p-1.5 flex items-center justify-center border border-slate-200/80 shadow-inner group hover:border-teal-300 transition-colors cursor-pointer"
                        title="Tap to preview animation and sounds"
                      >
                        <AnimatedWorldItem
                          itemId={item.id}
                          size="md"
                          interactive={true}
                          reduceMotion={settings.reduceMotion}
                        />
                      </div>
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
                    <span className="flex items-center gap-1 font-black text-xs text-amber-700">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {item.costStars} Stars
                    </span>

                    {isUnlocked ? (
                      isPlacedInCurrentRoom ? (
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
                          className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer active:scale-95"
                        >
                          Place in Room
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => buyWorldItem(item.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                          canAfford
                            ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Unlock</span>
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
