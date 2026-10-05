import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AvatarConfig } from '../types';
import { ChildAvatar } from './ChildAvatar';
import { playChime, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  Dices, 
  Volume2, 
  Check, 
  RotateCcw, 
  Smile, 
  Scissors, 
  Shirt, 
  Headphones, 
  HeartHandshake, 
  Smartphone, 
  Flame, 
  Palette,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface AvatarCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreatorTab = 'face' | 'hair' | 'outfit' | 'sensory' | 'mobility' | 'items' | 'aura' | 'presets';

export const AvatarCreatorModal: React.FC<AvatarCreatorModalProps> = ({ isOpen, onClose }) => {
  const { avatar, updateAvatar, childProfile, updateChildProfile } = useApp();

  const [activeTab, setActiveTab] = useState<CreatorTab>('face');
  const [draft, setDraft] = useState<AvatarConfig>(avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(avatar);
      setSavedSuccess(false);
    }
  }, [isOpen, avatar]);

  if (!isOpen) return null;

  const updateDraft = (partial: Partial<AvatarConfig>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    playChime('tap');
  };

  const handleRandomize = () => {
    const skinTones = ['#fde047', '#fcd34d', '#f59e0b', '#d97706', '#92400e', '#5a2e12', '#fed7aa'];
    const hairStyles: AvatarConfig['hairStyle'][] = [
      'curly', 'short', 'pigtails', 'spiky', 'braids', 'wavy', 'afro', 'bob', 'ponytail', 'buzz'
    ];
    const hairColors = ['#18181b', '#451a03', '#78350f', '#d97706', '#ef4444', '#3b82f6', '#ec4899', '#10b981'];
    const shirtColors = ['#38bdf8', '#34d399', '#f87171', '#fbbf24', '#a855f7', '#f43f5e', '#6366f1', '#14b8a6'];
    const clothingStyles: AvatarConfig['clothingStyle'][] = [
      'tshirt', 'hoodie', 'dino_hoodie', 'sailor_hoodie', 'turtle_hoodie', 'frog_hoodie', 'space_suit', 'overalls'
    ];
    const expressions: AvatarConfig['expression'][] = ['happy', 'smile', 'excited', 'calm', 'wink'];
    const accessories: AvatarConfig['accessory'][] = [
      'sensory_headphones', 'glasses', 'sunglasses', 'hearing_aids', 'cap', 'beanie', 'none'
    ];
    const mobilityAids: AvatarConfig['mobilityAid'][] = ['none', 'wheelchair', 'service_dog', 'cane', 'stroller_walker'];
    const companionDevices: AvatarConfig['companionDevice'][] = [
      'aac_tablet', 'comfort_plush', 'squishy_fidget', 'star_wand', 'none'
    ];
    const frames: AvatarConfig['avatarFrame'][] = ['none', 'stars', 'bubbles', 'rainbow', 'space'];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const randomized: AvatarConfig = {
      skinTone: pick(skinTones),
      hairStyle: pick(hairStyles),
      hairColor: pick(hairColors),
      shirtColor: pick(shirtColors),
      pantsColor: '#6366f1',
      clothingStyle: pick(clothingStyles),
      expression: pick(expressions),
      accessory: pick(accessories),
      accessoryColor: pick(['#0284c7', '#ec4899', '#10b981', '#6366f1']),
      mobilityAid: pick(mobilityAids),
      companionDevice: pick(companionDevices),
      avatarFrame: pick(frames),
      gender: 'neutral',
    };

    setDraft(randomized);
    playChime('star');
  };

  const handleSpeakPreview = () => {
    playChime('tap');
    const childName = childProfile.name || 'Leo';
    speakText(`Hi! My name is ${childName}, and this is my avatar!`);
  };

  const handleReset = () => {
    setDraft(avatar);
    playChime('tap');
  };

  const handleSave = () => {
    updateAvatar(draft);

    setSavedSuccess(true);
    playChime('complete');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    speakText('Avatar saved successfully! Looking great!');

    setTimeout(() => {
      onClose();
    }, 900);
  };

  // Preset Starters
  const presets: { id: string; name: string; desc: string; icon: string; config: AvatarConfig }[] = [
    {
      id: 'dino_explorer',
      name: 'Dino Adventurer',
      desc: 'Dino hoodie with dorsal spikes, AAC tablet & stars',
      icon: '🦕',
      config: {
        skinTone: '#fcd34d',
        hairStyle: 'spiky',
        hairColor: '#451a03',
        shirtColor: '#22c55e',
        pantsColor: '#15803d',
        clothingStyle: 'dino_hoodie',
        expression: 'excited',
        gender: 'neutral',
        accessory: 'sensory_headphones',
        accessoryColor: '#0284c7',
        mobilityAid: 'none',
        companionDevice: 'aac_tablet',
        avatarFrame: 'stars',
      },
    },
    {
      id: 'dino_pigtails',
      name: 'Dino Explorer',
      desc: 'Twin pigtails, dino spikes hoodie & plushie',
      icon: '🦖',
      config: {
        skinTone: '#fed7aa',
        hairStyle: 'pigtails',
        hairColor: '#78350f',
        shirtColor: '#16a34a',
        pantsColor: '#15803d',
        clothingStyle: 'dino_hoodie',
        expression: 'happy',
        gender: 'neutral',
        accessory: 'none',
        mobilityAid: 'none',
        companionDevice: 'comfort_plush',
        avatarFrame: 'bubbles',
      },
    },
    {
      id: 'sailor_captain',
      name: 'Captain Ocean Sailor',
      desc: 'Navy sailor hoodie, cap, anchor & service puppy',
      icon: '⚓',
      config: {
        skinTone: '#fde047',
        hairStyle: 'short',
        hairColor: '#18181b',
        shirtColor: '#1e3a8a',
        pantsColor: '#172554',
        clothingStyle: 'sailor_hoodie',
        expression: 'smile',
        gender: 'neutral',
        accessory: 'cap',
        mobilityAid: 'service_dog',
        companionDevice: 'aac_tablet',
        avatarFrame: 'bubbles',
      },
    },
    {
      id: 'cosmic_cadet',
      name: 'Cosmic Cadet',
      desc: 'Spacesuit helmet with antenna, galaxy orbit frame',
      icon: '🚀',
      config: {
        skinTone: '#fcd34d',
        hairStyle: 'afro',
        hairColor: '#18181b',
        shirtColor: '#f8fafc',
        pantsColor: '#334155',
        clothingStyle: 'space_suit',
        expression: 'wink',
        gender: 'neutral',
        accessory: 'hearing_aids',
        mobilityAid: 'none',
        companionDevice: 'star_wand',
        avatarFrame: 'space',
      },
    },
    {
      id: 'wheelchair_champion',
      name: 'Super Athlete',
      desc: 'Wheelchair champion with cool shades & star aura',
      icon: '🧑‍🦽',
      config: {
        skinTone: '#d97706',
        hairStyle: 'curly',
        hairColor: '#18181b',
        shirtColor: '#ea580c',
        pantsColor: '#9a3412',
        clothingStyle: 'hoodie',
        expression: 'excited',
        gender: 'neutral',
        accessory: 'sunglasses',
        mobilityAid: 'wheelchair',
        companionDevice: 'aac_tablet',
        avatarFrame: 'stars',
      },
    },
    {
      id: 'zen_artist',
      name: 'Calm Creator',
      desc: 'Cute bob bangs, sensory headphones & rainbow aura',
      icon: '🎨',
      config: {
        skinTone: '#fed7aa',
        hairStyle: 'bob',
        hairColor: '#ec4899',
        shirtColor: '#a855f7',
        pantsColor: '#7e22ce',
        clothingStyle: 'overalls',
        expression: 'calm',
        gender: 'neutral',
        accessory: 'sensory_headphones',
        accessoryColor: '#ec4899',
        mobilityAid: 'none',
        companionDevice: 'squishy_fidget',
        avatarFrame: 'rainbow',
      },
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Avatar Creator Studio"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border-4 border-amber-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)]">
        
        {/* HEADER BAR */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-xl">
              🎨
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-950 leading-tight">
                Avatar Creator Studio
              </h2>
              <p className="text-xs font-bold text-amber-900/80">
                Design your hero, express yourself, and feel proud!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-amber-950 font-black text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Surprise me with a random combination!"
            >
              <Dices className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Surprise Me!</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-amber-200/80 hover:bg-amber-200 text-amber-950 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close Avatar Creator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMNS (Left: Live Avatar Stage | Right: Customization Controls) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
          
          {/* LEFT: LIVE AVATAR STAGE */}
          <div className="md:w-72 lg:w-80 bg-gradient-to-b from-sky-50 via-indigo-50 to-amber-50 dark:from-slate-800 dark:to-slate-850 p-5 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 shrink-0">
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                Live Preview
              </span>

              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 flex items-center gap-1 cursor-pointer"
                title="Reset to current avatar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Avatar Stage Circle with subtle breathing glow */}
            <div className="my-auto py-4 flex flex-col items-center">
              <div className="relative p-6 rounded-full bg-white/80 dark:bg-slate-700/80 shadow-lg border-4 border-amber-200 dark:border-amber-400/30 transition-transform duration-300 hover:scale-105">
                <ChildAvatar config={draft} size="2xl" />
              </div>

              {/* Name Tag */}
              <div className="mt-3 px-4 py-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span className="font-black text-sm text-slate-800 dark:text-white">
                  {childProfile.name || 'Leo'}&apos;s Character
                </span>
              </div>
            </div>

            {/* Interactive Voice Action */}
            <div className="w-full space-y-2 mt-2">
              <button
                type="button"
                onClick={handleSpeakPreview}
                className="w-full py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear My Avatar Speak 🗣️</span>
              </button>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION CONTROLS */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
            
            {/* TABS NAVIGATION */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: 'face', label: 'Face & Style', icon: '😊' },
                { id: 'hair', label: 'Hair & Color', icon: '💇' },
                { id: 'outfit', label: 'Outfits & Hoodies', icon: '👕' },
                { id: 'sensory', label: 'Sensory Aids', icon: '🎧' },
                { id: 'mobility', label: 'Mobility & Friends', icon: '🧑‍🦽' },
                { id: 'items', label: 'In-Hand Items', icon: '📱' },
                { id: 'aura', label: 'Aura & Frame', icon: '✨' },
                { id: 'presets', label: 'Quick Starters', icon: '🌟' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as CreatorTab);
                    playChime('tap');
                  }}
                  className={`px-3 py-2 rounded-xl font-black text-xs whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-950 dark:text-white shadow-xs border border-indigo-200 dark:border-slate-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS (Scrollable) */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">

              {/* ──────────────── TAB 1: FACE & STYLE ──────────────── */}
              {activeTab === 'face' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Expression */}
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Facial Expression:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'happy', label: 'Happy', emoji: '😊' },
                        { id: 'smile', label: 'Cheerful', emoji: '😄' },
                        { id: 'excited', label: 'Star Eyes', emoji: '🤩' },
                        { id: 'calm', label: 'Peaceful', emoji: '😌' },
                        { id: 'wink', label: 'Playful Wink', emoji: '😉' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ expression: item.id as any })}
                          className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            (draft.expression || 'happy') === item.id
                              ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skin Tone */}
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Skin Tone:
                    </label>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {[
                        { color: '#fef3c7', name: 'Porcelain' },
                        { color: '#fed7aa', name: 'Peach' },
                        { color: '#fcd34d', name: 'Warm Gold' },
                        { color: '#f59e0b', name: 'Golden Amber' },
                        { color: '#d97706', name: 'Honey Bronze' },
                        { color: '#a16207', name: 'Almond' },
                        { color: '#92400e', name: 'Rich Chestnut' },
                        { color: '#5a2e12', name: 'Espresso' },
                      ].map((t) => (
                        <button
                          key={t.color}
                          type="button"
                          onClick={() => {
                            updateDraft({ skinTone: t.color });
                            playChime('tap');
                          }}
                          className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex items-center justify-center shrink-0 ${
                            draft.skinTone === t.color ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: t.color }}
                          title={t.name}
                        >
                          {draft.skinTone === t.color && <Check className="w-5 h-5 text-slate-900 drop-shadow-xs" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color Customization */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                        Hair Color:
                      </label>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: draft.hairColor || '#451a03' }}
                        />
                        <span>{draft.hairColor}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                      {[
                        { color: '#18181b', name: 'Jet Black' },
                        { color: '#451a03', name: 'Espresso Brown' },
                        { color: '#78350f', name: 'Chestnut' },
                        { color: '#d97706', name: 'Caramel' },
                        { color: '#facc15', name: 'Golden Blonde' },
                        { color: '#ef4444', name: 'Auburn Red' },
                        { color: '#ec4899', name: 'Pastel Pink' },
                        { color: '#3b82f6', name: 'Sky Blue' },
                        { color: '#10b981', name: 'Emerald Green' },
                        { color: '#a855f7', name: 'Lavender' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => {
                            updateDraft({ hairColor: c.color });
                            playChime('tap');
                          }}
                          className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex items-center justify-center shrink-0 ${
                            draft.hairColor === c.color ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        >
                          {draft.hairColor === c.color && <Check className="w-5 h-5 text-white drop-shadow-sm" />}
                        </button>
                      ))}

                      {/* Custom Hair Color Input */}
                      <label
                        className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex flex-col items-center justify-center shrink-0 relative bg-gradient-to-tr from-pink-400 via-amber-300 to-indigo-400 ${
                          ![
                            '#18181b', '#451a03', '#78350f', '#d97706', '#facc15',
                            '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#a855f7',
                          ].includes(draft.hairColor)
                            ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md'
                            : 'border-slate-300'
                        }`}
                        title="Pick any custom hair color"
                      >
                        <input
                          type="color"
                          value={draft.hairColor || '#451a03'}
                          onChange={(e) => updateDraft({ hairColor: e.target.value })}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <span className="text-xs">🎨</span>
                        <span className="text-[7px] font-black text-white drop-shadow-xs uppercase">Custom</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 2: HAIR & COLOR ──────────────── */}
              {activeTab === 'hair' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Hair Style */}
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Hair Style:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'curly', label: 'Curly', icon: '🌀' },
                        { id: 'short', label: 'Short', icon: '💇‍♂️' },
                        { id: 'pigtails', label: 'Pigtails', icon: '👧' },
                        { id: 'spiky', label: 'Spiky', icon: '⚡' },
                        { id: 'braids', label: 'Braids', icon: '🪢' },
                        { id: 'wavy', label: 'Wavy', icon: '🌊' },
                        { id: 'afro', label: 'Afro Puffs', icon: '👑' },
                        { id: 'bob', label: 'Cute Bob', icon: '🎀' },
                        { id: 'ponytail', label: 'Ponytail', icon: '🐎' },
                        { id: 'buzz', label: 'Buzz Cut', icon: '✨' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ hairStyle: item.id as any })}
                          className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            draft.hairStyle === item.id
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                        Hair Color:
                      </label>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: draft.hairColor || '#451a03' }}
                        />
                        <span>{draft.hairColor}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {[
                        { color: '#18181b', name: 'Jet Black' },
                        { color: '#451a03', name: 'Espresso Brown' },
                        { color: '#78350f', name: 'Chestnut' },
                        { color: '#d97706', name: 'Caramel' },
                        { color: '#facc15', name: 'Golden Blonde' },
                        { color: '#ef4444', name: 'Auburn Red' },
                        { color: '#ec4899', name: 'Pastel Pink' },
                        { color: '#3b82f6', name: 'Sky Blue' },
                        { color: '#10b981', name: 'Emerald Green' },
                        { color: '#a855f7', name: 'Lavender' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => {
                            updateDraft({ hairColor: c.color });
                            playChime('tap');
                          }}
                          className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex items-center justify-center shrink-0 ${
                            draft.hairColor === c.color ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        >
                          {draft.hairColor === c.color && <Check className="w-5 h-5 text-white drop-shadow-sm" />}
                        </button>
                      ))}

                      {/* Custom Hair Color Input */}
                      <label
                        className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex flex-col items-center justify-center shrink-0 relative bg-gradient-to-tr from-pink-400 via-amber-300 to-indigo-400 ${
                          ![
                            '#18181b', '#451a03', '#78350f', '#d97706', '#facc15',
                            '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#a855f7',
                          ].includes(draft.hairColor)
                            ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md'
                            : 'border-slate-300'
                        }`}
                        title="Pick any custom hair color"
                      >
                        <input
                          type="color"
                          value={draft.hairColor || '#451a03'}
                          onChange={(e) => updateDraft({ hairColor: e.target.value })}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <span className="text-xs">🎨</span>
                        <span className="text-[7px] font-black text-white drop-shadow-xs uppercase">Custom</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 3: OUTFITS & THEMED HOODIES ──────────────── */}
              {activeTab === 'outfit' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Clothing & Themed Hoodies */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block">
                        Clothing & Themed Hoodies:
                      </label>
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Theme Hoodies Included!
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'dino_hoodie', label: 'Dino Spikes Hoodie', icon: '🦕', desc: 'Golden spikes & dino teeth!' },
                        { id: 'sailor_hoodie', label: 'Sailor Hoodie', icon: '⚓', desc: 'Navy collar & gold anchor!' },
                        { id: 'turtle_hoodie', label: 'Turtle Shell Hoodie', icon: '🐢', desc: 'Emerald hood & shell scutes!' },
                        { id: 'frog_hoodie', label: 'Tree Frog Hoodie', icon: '🐸', desc: 'Two bulbous frog eyes on top!' },
                        { id: 'space_suit', label: 'Astronaut Spacesuit', icon: '🚀', desc: 'Comms antenna & cyan visor!' },
                        { id: 'hoodie', label: 'Cozy Hoodie', icon: '🧥', desc: 'Casual everyday hoodie' },
                        { id: 'overalls', label: 'Denim Overalls', icon: '👖', desc: 'Classic overalls & straps' },
                        { id: 'tshirt', label: 'Classic T-Shirt', icon: '👕', desc: 'Simple comfortable shirt' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ clothingStyle: item.id as any })}
                          className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            (draft.clothingStyle || 'tshirt') === item.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{item.icon}</span>
                            {(draft.clothingStyle || 'tshirt') === item.id && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs block leading-tight">{item.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shirt Color */}
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Outfit Color:
                    </label>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {[
                        { color: '#38bdf8', name: 'Sky Blue' },
                        { color: '#34d399', name: 'Mint Emerald' },
                        { color: '#22c55e', name: 'Dino Green' },
                        { color: '#fbbf24', name: 'Golden Yellow' },
                        { color: '#f97316', name: 'Sunset Orange' },
                        { color: '#f87171', name: 'Coral Red' },
                        { color: '#ec4899', name: 'Berry Pink' },
                        { color: '#a855f7', name: 'Cosmic Purple' },
                        { color: '#1e3a8a', name: 'Navy Blue' },
                        { color: '#334155', name: 'Slate Gray' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => updateDraft({ shirtColor: c.color })}
                          className={`w-11 h-11 rounded-2xl border-3 transition-transform cursor-pointer flex items-center justify-center shrink-0 ${
                            draft.shirtColor === c.color ? 'scale-115 ring-3 ring-indigo-500 border-white shadow-md' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        >
                          {draft.shirtColor === c.color && <Check className="w-5 h-5 text-white drop-shadow-sm" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 4: SENSORY AIDS & ACCESSORIES ──────────────── */}
              {activeTab === 'sensory' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Sensory Aids & Headwear:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'sensory_headphones', label: 'Sensory Headphones', icon: '🎧', desc: 'Over-ear noise cancelling' },
                        { id: 'glasses', label: 'Round Glasses', icon: '👓', desc: 'Clear circular frames' },
                        { id: 'sunglasses', label: 'Cool Shades', icon: '🕶️', desc: 'Dark glare protection' },
                        { id: 'hearing_aids', label: 'Hearing Aids', icon: '🦻', desc: 'Behind-the-ear amplifiers' },
                        { id: 'cochlear', label: 'Cochlear Implant', icon: '🦻', desc: 'Sound processor & magnet' },
                        { id: 'cap', label: 'Baseball Cap', icon: '🧢', desc: 'Sun brim cap' },
                        { id: 'beanie', label: 'Knit Beanie', icon: '🧶', desc: 'Cozy folded winter cap' },
                        { id: 'none', label: 'None', icon: '❌', desc: 'No headwear/aids' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ accessory: item.id as any })}
                          className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            draft.accessory === item.id
                              ? 'bg-sky-50 border-sky-500 text-sky-950 dark:bg-sky-950/40 dark:text-sky-200 ring-2 ring-sky-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{item.icon}</span>
                            {draft.accessory === item.id && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                          </div>
                          <div>
                            <span className="font-black text-xs block leading-tight">{item.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Headphone Accent Color */}
                  {draft.accessory === 'sensory_headphones' && (
                    <div className="p-3.5 bg-sky-50 dark:bg-slate-800 rounded-2xl border border-sky-200 dark:border-slate-700">
                      <label className="text-xs font-black uppercase text-sky-900 dark:text-sky-300 block mb-2">
                        Headphone Color:
                      </label>
                      <div className="flex items-center gap-2.5">
                        {[
                          { color: '#0284c7', name: 'Sky Blue' },
                          { color: '#ec4899', name: 'Pastel Pink' },
                          { color: '#10b981', name: 'Neon Green' },
                          { color: '#8b5cf6', name: 'Violet' },
                          { color: '#334155', name: 'Matte Slate' },
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => updateDraft({ accessoryColor: c.color })}
                            className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer ${
                              (draft.accessoryColor || '#0284c7') === c.color ? 'scale-115 ring-2 ring-sky-500 border-white' : 'border-slate-300'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── TAB 5: MOBILITY & FRIENDS ──────────────── */}
              {activeTab === 'mobility' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Mobility Aids & Companions:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'none', label: 'Standing / Walking Posture', icon: '🚶', desc: 'Standard standing character pose' },
                        { id: 'wheelchair', label: 'Custom Wheelchair', icon: '🧑‍🦽', desc: 'Wheelchair with spoke wheels & back support' },
                        { id: 'service_dog', label: 'Service Puppy Friend', icon: '🐕', desc: 'Golden companion dog with official red vest' },
                        { id: 'stroller_walker', label: 'Support Walker', icon: '🦼', desc: 'Pediatric support walker with wheels' },
                        { id: 'cane', label: 'Mobility Cane', icon: '🦯', desc: 'Walking support cane' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ mobilityAid: item.id as any })}
                          className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                            (draft.mobilityAid || 'none') === item.id
                              ? 'bg-teal-50 border-teal-500 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200 ring-2 ring-teal-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-3xl shrink-0">{item.icon}</span>
                          <div className="flex-1">
                            <span className="font-black text-xs sm:text-sm block">{item.label}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                          {(draft.mobilityAid || 'none') === item.id && (
                            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 6: IN-HAND ITEMS ──────────────── */}
              {activeTab === 'items' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Item Held in Hand:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'aac_tablet', label: 'AAC Speech Tablet', icon: '📱', desc: 'Glowing picture communication grid' },
                        { id: 'comfort_plush', label: 'Comfort Dino Plush', icon: '🦕', desc: 'Weighted sensory dinosaur plush' },
                        { id: 'squishy_fidget', label: 'Pop-It Fidget', icon: '🟢', desc: 'Colorful sensory stress popper' },
                        { id: 'star_wand', label: 'Magical Star Wand', icon: '⭐', desc: 'Golden glowing star wand' },
                        { id: 'none', label: 'Empty Hands', icon: '✋', desc: 'No held companion item' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ companionDevice: item.id as any })}
                          className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            (draft.companionDevice || 'none') === item.id
                              ? 'bg-amber-50 border-amber-500 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 ring-2 ring-amber-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{item.icon}</span>
                            {(draft.companionDevice || 'none') === item.id && (
                              <CheckCircle2 className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs block leading-tight">{item.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 7: AURA & FRAME ──────────────── */}
              {activeTab === 'aura' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-2">
                      Magic Aura / Floating Frame:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'stars', label: 'Golden Sparkles', icon: '✨', desc: 'Twinkling golden magic stars' },
                        { id: 'bubbles', label: 'Ocean Bubbles', icon: '🫧', desc: 'Floating translucent bubbles' },
                        { id: 'rainbow', label: 'Rainbow Arc', icon: '🌈', desc: 'Gentle pastel rainbow arch' },
                        { id: 'space', label: 'Cosmic Galaxy', icon: '🪐', desc: 'Orbit ring and planetary dust' },
                        { id: 'none', label: 'Clean / None', icon: '⭕', desc: 'No floating frame particles' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft({ avatarFrame: item.id as any })}
                          className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                            (draft.avatarFrame || 'none') === item.id
                              ? 'bg-purple-50 border-purple-500 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 ring-2 ring-purple-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-2xl">{item.icon}</span>
                            {(draft.avatarFrame || 'none') === item.id && (
                              <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs block leading-tight">{item.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 8: QUICK STARTERS ──────────────── */}
              {activeTab === 'presets' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Tap any preset character to instantly apply a full head-to-toe look! You can still fine-tune everything.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDraft(p.config);
                          playChime('star');
                        }}
                        className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-800 dark:border-slate-700 text-left flex items-center gap-3 transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        <span className="text-3xl shrink-0">{p.icon}</span>
                        <div className="flex-1">
                          <span className="font-black text-sm text-slate-800 dark:text-white block">{p.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{p.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Saved! ✨</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Save & Apply Avatar</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
