import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WORLD_ITEMS_CATALOG } from '../data/defaultData';
import { ChildAvatar } from './ChildAvatar';
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
  Trophy
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { Rewards } from './Rewards';

export const MyWorldView: React.FC = () => {
  const {
    worldState,
    setCurrentRoom,
    buyWorldItem,
    placeWorldItem,
    avatar,
    updateAvatar,
    speak,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'world' | 'avatar' | 'shop' | 'rewards'>('world');
  const [petFeedback, setPetFeedback] = useState<string | null>(null);

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

  const handleInteractWithItem = (itemCatalogId: string, itemName: string) => {
    playChime('tap');
    if (itemCatalogId.includes('puppy')) {
      setPetFeedback('The puppy wags its tail happily and rolls over! 🐶 Woof!');
      speak('The puppy wags its tail!');
    } else if (itemCatalogId.includes('kitten')) {
      setPetFeedback('The fluffy kitten purrs softly in your lap! 🐱 Purr...');
      speak('The kitten purrs softly.');
    } else if (itemCatalogId.includes('bunny')) {
      setPetFeedback('The bunny hops and wiggles its little nose! 🐰 Munch!');
      speak('The bunny wiggles its nose.');
    } else if (itemCatalogId.includes('trampoline')) {
      setPetFeedback('Boing! Boing! You bounce high with big smiles! 🤸');
      playChime('star');
      speak('Boing! Boing! Fun bounce!');
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
            <div className="flex-1 flex flex-wrap items-center justify-around gap-4 p-4">
              {roomPlacedItems.map((placed) => {
                const item = WORLD_ITEMS_CATALOG.find((i) => i.id === placed.itemId);
                if (!item) return null;

                return (
                  <button
                    key={placed.id}
                    onClick={() => handleInteractWithItem(item.id, item.name)}
                    className="flex flex-col items-center justify-center p-3 rounded-3xl bg-white/80 hover:bg-white border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer group"
                  >
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                    <span className="text-xs font-black text-slate-800 mt-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}

              {/* Child Avatar in the Room */}
              <div className="flex flex-col items-center justify-center">
                <div className="animate-bounce duration-1000">
                  <ChildAvatar config={avatar} size="lg" />
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/90 text-slate-800 shadow-xs border mt-1">
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{item.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
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
