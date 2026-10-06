import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AACItem, AACCategory } from '../../types';
import { INDUSTRY_AAC_PACKS } from '../../services/symbolService';
import { AACSymbolPickerModal } from '../AACSymbolPickerModal';
import { optimizeImageFile } from '../../utils/mediaOptimizer';
import { playChime, rateVoiceNaturalness, isVoiceFluid, speakText } from '../../utils/audio';
import {
  Sparkles,
  Search,
  Palette,
  Plus,
  Upload,
  Layers,
  Trash2,
  Volume2
} from 'lucide-react';

interface CaregiverAacStudioTabProps {
  onShowNotification: (msg: string) => void;
}

export const CaregiverAacStudioTab: React.FC<CaregiverAacStudioTabProps> = ({ onShowNotification }) => {
  const {
    aacItems,
    addAacItem,
    updateAacItem,
    deleteAacItem,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
    settings,
    updateSettings,
    speak,
    offlineVoices,
  } = useApp();

  const [newWordLabel, setNewWordLabel] = useState('');
  const [newWordSpeech, setNewWordSpeech] = useState('');
  const [newWordCategory, setNewWordCategory] = useState<AACCategory>('food');
  const [newWordEmoji, setNewWordEmoji] = useState('🍗');
  const [newWordPhotoUrl, setNewWordPhotoUrl] = useState('');
  const [newWordColorType, setNewWordColorType] = useState<any>('noun');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [editingAacItem, setEditingAacItem] = useState<AACItem | null>(null);
  const parentAacFileInputRef = useRef<HTMLInputElement>(null);

  const handleParentAacPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await optimizeImageFile(file, { maxWidth: 360, maxHeight: 360, quality: 0.82 });
      setNewWordPhotoUrl(optimized);
      onShowNotification('Photo optimized & compressed for AAC button!');
    } catch (err) {
      console.warn('Photo upload failed:', err);
    }
  };

  const handlePickSymbol = (symbol: {
    photoUrl: string;
    label: string;
    speechText?: string;
    emoji?: string;
    category?: AACCategory;
    colorType?: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  }) => {
    if (editingAacItem) {
      updateAacItem({
        ...editingAacItem,
        label: symbol.label,
        speechText: symbol.speechText || symbol.label,
        photoUrl: symbol.photoUrl,
        emoji: symbol.emoji || editingAacItem.emoji,
        colorType: symbol.colorType || editingAacItem.colorType,
        category: symbol.category || editingAacItem.category,
      });
      onShowNotification(`Updated symbol for "${symbol.label}"!`);
      setEditingAacItem(null);
    } else {
      setNewWordLabel(symbol.label);
      setNewWordSpeech(symbol.speechText || symbol.label);
      setNewWordPhotoUrl(symbol.photoUrl);
      if (symbol.emoji) setNewWordEmoji(symbol.emoji);
      if (symbol.category) setNewWordCategory(symbol.category);
      if (symbol.colorType) setNewWordColorType(symbol.colorType);
      onShowNotification(`Selected symbol for "${symbol.label}"!`);
    }
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordLabel.trim()) return;

    addAacItem({
      label: newWordLabel.trim(),
      speechText: newWordSpeech.trim() || newWordLabel.trim(),
      category: newWordCategory,
      emoji: newWordEmoji || '✨',
      photoUrl: newWordPhotoUrl.trim() || undefined,
      colorType: newWordColorType,
    });

    onShowNotification(`"${newWordLabel}" added to ${newWordCategory} vocabulary!`);
    setNewWordLabel('');
    setNewWordSpeech('');
    setNewWordPhotoUrl('');
  };

  const handleQuickAddChickenNuggets = () => {
    addAacItem({
      label: 'Chicken Nuggets',
      speechText: 'Chicken nuggets',
      category: 'food',
      emoji: '🍗',
      colorType: 'noun',
    });
    onShowNotification('"Chicken Nuggets" added to Food vocabulary!');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">AAC Vocabulary Manager</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add custom words, family photos, and quick phrases. Fixed motor planning ensures vocabulary stays predictable.
          </p>
        </div>

        {/* 1-Tap Chicken Nuggets Test Button */}
        <button
          type="button"
          onClick={handleQuickAddChickenNuggets}
          className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs flex items-center gap-1.5 border border-orange-300 shadow-xs cursor-pointer"
        >
          <span>🍗 1-Tap Add "Chicken Nuggets"</span>
        </button>
      </div>

      {/* ONLINE AAC SYMBOL STUDIO HERO BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🌐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                Clinical Standard
              </span>
              <span className="text-xs text-indigo-200 font-bold">
                3,400+ Mulberry Symbols (CC BY-SA)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black mt-0.5">
              Online AAC Symbol & Logo Studio
            </h3>
            <p className="text-xs text-indigo-100 font-medium max-w-xl">
              Access official Mulberry Symbols (CC BY-SA Straight Street / Paxtoncrafts Charitable Trust) crafted for AAC devices, or upload real photos from your camera for photo modeling.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              upgradeAllAacToClinicalSymbols();
              onShowNotification('Upgraded all AAC buttons to official Mulberry Symbols!');
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Convert all AAC buttons to Mulberry symbols"
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>Apply Mulberry to All Buttons</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingAacItem(null);
              setShowSymbolPicker(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-900 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Search className="w-4 h-4 text-indigo-600" />
            <span>Browse Online Symbols</span>
          </button>
        </div>
      </div>

      {/* Tile Color Scheme Quick Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-slate-800">Button Background Color Mode</h4>
            <p className="text-[11px] text-slate-500 font-medium">Controls the background coloring of all AAC tiles across the app.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'fitzgerald', label: '🌈 Clinical Colors (Default)', title: 'Fitzgerald Key: yellow, green, orange, blue, purple' },
            { id: 'theme', label: '🎭 Theme Colors', title: 'Matches the active theme palette' },
            { id: 'high_contrast_white', label: '⚪ White High-Contrast', title: 'Pure white with bold borders' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                updateSettings({ aacButtonColorMode: m.id as any });
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                (settings.aacButtonColorMode || 'fitzgerald') === m.id
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={m.title}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Word Form */}
      <form onSubmit={handleAddCustomWord} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Create Custom AAC Button</span>
          </h3>

          {newWordPhotoUrl && (
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>Symbol Attached ✓</span>
            </span>
          )}
        </div>

        {/* Symbol Preview Bar */}
        {newWordPhotoUrl && (
          <div className="p-3 bg-white rounded-2xl border-2 border-indigo-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                <img src={newWordPhotoUrl} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {newWordLabel || 'Selected Symbol'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-xs">
                  {newWordPhotoUrl.startsWith('data:') ? 'Custom Photo Upload' : 'Mulberry Symbol (CC BY-SA)'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNewWordPhotoUrl('')}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
            >
              Clear Symbol
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Word Label:</label>
            <input
              type="text"
              value={newWordLabel}
              onChange={(e) => setNewWordLabel(e.target.value)}
              placeholder="e.g. Chicken Nuggets"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Speech Text (spoken aloud):</label>
            <input
              type="text"
              value={newWordSpeech}
              onChange={(e) => setNewWordSpeech(e.target.value)}
              placeholder="e.g. Chicken nuggets please"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Category:</label>
            <select
              value={newWordCategory}
              onChange={(e) => setNewWordCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
            >
              <option value="food">Food 🍕</option>
              <option value="drinks">Drinks 🧃</option>
              <option value="activities">Play & Fun 🎮</option>
              <option value="places">Places 🏠</option>
              <option value="people">People 👥</option>
              <option value="feelings">Feelings 💛</option>
              <option value="sensory">Sensory 🎧</option>
              <option value="actions">Actions 🏃</option>
              <option value="core">Core Words ⭐</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Emoji Icon (Fallback):</label>
            <input
              type="text"
              value={newWordEmoji}
              onChange={(e) => setNewWordEmoji(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-center"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Color Key (Fitzgerald):</label>
            <select
              value={newWordColorType}
              onChange={(e) => setNewWordColorType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
            >
              <option value="noun">Noun (Orange)</option>
              <option value="verb">Verb (Green)</option>
              <option value="subject">Subject/Pronoun (Yellow)</option>
              <option value="adjective">Adjective (Blue)</option>
              <option value="emergency">Emergency/Stop (Red)</option>
              <option value="social">Social (Purple)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <input
              ref={parentAacFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleParentAacPhotoUpload}
            />
            <button
              type="button"
              onClick={() => parentAacFileInputRef.current?.click()}
              className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              title="Upload a photo from your camera or computer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingAacItem(null);
                setShowSymbolPicker(true);
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{newWordPhotoUrl ? 'Change' : 'Online'}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Child's AAC Board</span>
        </button>
      </form>

      {/* INDUSTRY STANDARD AAC PACKS */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Pre-Built AAC Standard Packs (TouchChat & LAMP Systems)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Instantly import clinically validated vocabulary collections used in speech therapy and special ed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INDUSTRY_AAC_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{pack.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {pack.badge}
                  </span>
                </div>
                <h4 className="font-black text-xs text-slate-900">{pack.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{pack.subtitle}</p>
                <p className="text-[9px] text-indigo-600 font-bold mt-1.5">Used by: {pack.usedBy}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  importAacPack(pack.items);
                  onShowNotification(`Imported "${pack.title}" (${pack.items.length} words)!`);
                }}
                className="mt-3 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Import {pack.items.length} Words</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE AAC VOCABULARY BUTTONS */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>Active Vocabulary Buttons ({aacItems.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Click "Change Symbol" on any button to swap its logo with an online Mulberry symbol or personal photo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-1">
          {aacItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-between gap-1.5 text-center group hover:border-indigo-300 transition-all"
            >
              <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.label} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-2xl">{item.emoji}</span>
                )}
              </div>

              <div className="w-full">
                <div className="font-black text-xs text-slate-900 truncate">{item.label}</div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 capitalize">
                  {item.colorType}
                </span>
              </div>

              <div className="flex items-center gap-1 w-full pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAacItem(item);
                    setShowSymbolPicker(true);
                  }}
                  className="flex-1 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] cursor-pointer"
                  title="Change symbol for this button"
                >
                  Change Symbol
                </button>
                {item.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteAacItem(item.id);
                      onShowNotification(`Deleted "${item.label}" from AAC.`);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete custom word"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice & Speech Controls */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Fluid Human Voice & Speech Settings</span>
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Offline Ready
          </span>
        </div>

        {/* Voice Persona Selector */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-1.5">
            Human Voice Persona:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { id: 'Kore', name: 'Kore', desc: 'Warm, gentle & empathetic', emoji: '🌸', badge: 'Recommended' },
              { id: 'Puck', name: 'Puck', desc: 'Bright, cheerful & playful', emoji: '☀️' },
              { id: 'Zephyr', name: 'Zephyr', desc: 'Soft, calm & soothing', emoji: '🍃' },
              { id: 'system', name: 'On-Device Natural', desc: 'Device neural voice (offline)', emoji: '📱' },
            ].map((persona) => {
              const isSelected = (settings.voicePersona || 'Kore') === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ voicePersona: persona.id as any });
                    playChime('tap');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400 text-indigo-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{persona.emoji}</span>
                    {persona.badge && (
                      <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                        {persona.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-xs block">{persona.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                    {persona.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Pacing / Rate: {settings.voiceRate.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.02"
              value={settings.voiceRate}
              onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">0.96x sounds most natural</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Natural Pitch: {settings.voicePitch.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.9"
              max="1.15"
              step="0.02"
              value={settings.voicePitch}
              onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">1.0 preserves human resonance</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Language:</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="fil">Filipino</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => speak('Hello! I am ready to talk, play, and explore with you today.')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>Audition Fluid Voice</span>
          </button>
          <span className="text-xs text-slate-500">
            Active: <strong>{settings.voicePersona === 'system' ? (settings.selectedVoiceURI || 'Auto-Selected Best Fluid System Voice') : (settings.voicePersona || 'Kore')}</strong>
          </span>
        </div>

        {/* DETECTED SYSTEM VOICES LIST */}
        <div className="pt-4 border-t border-slate-200 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Detected System Voices on this Device ({offlineVoices.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Querying <code>window.speechSynthesis.getVoices()</code>. Non-robotic voices with fluid natural human prosody are automatically ranked at the top.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateSettings({ selectedVoiceURI: '', voicePersona: 'system' });
                onShowNotification('Set to auto-prioritize the most fluid system voice on this device.');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
            >
              Auto-Pick Best Fluid Voice
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-white">
            {offlineVoices.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 text-center">
                Detecting device speech synthesis voices... (Click Audition to initialize)
              </p>
            ) : (
              offlineVoices.slice(0, 20).map((voice) => {
                const isFluid = isVoiceFluid(voice);
                const score = rateVoiceNaturalness(voice);
                const isSelected = settings.selectedVoiceURI === voice.voiceURI;

                return (
                  <div
                    key={voice.voiceURI}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-800 truncate block">
                          {voice.name}
                        </span>
                        {isFluid && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                            🌟 Fluid Human Voice
                          </span>
                        )}
                        {voice.localService && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 shrink-0">
                            Offline
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Lang: {voice.lang} • Naturalness Score: {score}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          speakText(`Hello, I am ${voice.name}. I sound clear and friendly!`, {
                            voiceURI: voice.voiceURI,
                            preferOfflineOnly: true,
                            rate: settings.voiceRate,
                            pitch: settings.voicePitch,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        title="Test this specific voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Audition</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateSettings({
                            selectedVoiceURI: voice.voiceURI,
                            voicePersona: 'system',
                          });
                          onShowNotification(`Voice set to "${voice.name}"!`);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AAC Symbol Picker Modal */}
      {showSymbolPicker && (
        <AACSymbolPickerModal
          isOpen={showSymbolPicker}
          onClose={() => {
            setShowSymbolPicker(false);
            setEditingAacItem(null);
          }}
          onSelectSymbol={handlePickSymbol}
          initialSearch={editingAacItem ? editingAacItem.label : newWordLabel}
        />
      )}
    </div>
  );
};
