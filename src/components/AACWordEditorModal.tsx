import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AACItem, AACCategory } from '../types';
import { X, Heart, Sparkles, Volume2, Trash2, Upload, Image as ImageIcon, Camera, Link, RefreshCw } from 'lucide-react';
import { playChime } from '../utils/audio';

interface AACWordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: AACItem | null;
  onSave: (item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string; isFavorite?: boolean }) => void;
  onDelete?: (id: string) => void;
  defaultCategory?: AACCategory | 'all';
}

const CATEGORY_OPTIONS: { id: AACCategory; label: string; emoji: string }[] = [
  { id: 'favorites', label: 'Favorites', emoji: '❤️' },
  { id: 'core', label: 'Core Words', emoji: '⭐' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'drinks', label: 'Drinks', emoji: '🧃' },
  { id: 'activities', label: 'Play & Fun', emoji: '🎮' },
  { id: 'places', label: 'Places', emoji: '🏠' },
  { id: 'people', label: 'People', emoji: '👥' },
  { id: 'feelings', label: 'Feelings', emoji: '💛' },
  { id: 'sensory', label: 'Sensory', emoji: '🎧' },
  { id: 'personal', label: 'Personal', emoji: '🪥' },
];

const COLOR_TYPE_OPTIONS: { id: AACItem['colorType']; label: string; desc: string; bg: string }[] = [
  { id: 'subject', label: 'Yellow (Subject / People)', desc: 'Who is speaking or acting', bg: 'bg-amber-100 border-amber-400 text-amber-950' },
  { id: 'verb', label: 'Green (Verb / Action)', desc: 'Actions, wanting, doing', bg: 'bg-emerald-100 border-emerald-400 text-emerald-950' },
  { id: 'noun', label: 'Orange (Noun / Object)', desc: 'Things, food, places, toys', bg: 'bg-orange-100 border-orange-400 text-orange-950' },
  { id: 'adjective', label: 'Blue (Adjective / Describing)', desc: 'More, done, colors, sizes', bg: 'bg-sky-100 border-sky-400 text-sky-950' },
  { id: 'social', label: 'Purple (Social / Phrases)', desc: 'Yes, please, thank you, greetings', bg: 'bg-purple-100 border-purple-400 text-purple-950' },
  { id: 'emergency', label: 'Red (Emergency / Urgent)', desc: 'Stop, help, hurt, urgent needs', bg: 'bg-rose-100 border-rose-400 text-rose-950' },
];

const POPULAR_EMOJIS = [
  '❤️', '⭐', '🙋', '👉', '🤲', '❗', '👍', '🚶', '👀', '🍽️', '🥤', '🎲', '🆘', '🛑',
  '🍕', '🧀', '🍎', '🥪', '🍌', '🍪', '🍓', '💧', '🧃', '🥛', '📱', '🛝', '📖', '🖍️',
  '🎵', '🧱', '🧩', '🌳', '🏠', '🏫', '🌲', '🦷', '🩺', '🚗', '👩', '👨', '🧑‍🏫', '🤝',
  '🔊', '☀️', '🎧', '🛏️', '🤫', '🧸', '😊', '😢', '😌', '🥱', '😠', '😨', '🤕', '🚽',
  '✨', '💬', '🎉', '💡', '🌈', '🫂', '🧘', '😴', '💊', '🧃', '🥪', '🍦', '🎈', '🎨'
];

/**
 * Resizes and compresses image to ~300px for optimized offline storage
 */
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            width = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const AACWordEditorModal: React.FC<AACWordEditorModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
  onDelete,
  defaultCategory,
}) => {
  const [label, setLabel] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<AACCategory>('favorites');
  const [colorType, setColorType] = useState<AACItem['colorType']>('noun');
  const [isFavorite, setIsFavorite] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setLabel(editingItem.label || '');
      setSpeechText(editingItem.speechText || editingItem.label || '');
      setEmoji(editingItem.emoji || '💬');
      setPhotoUrl(editingItem.photoUrl);
      setCategory(editingItem.category || 'favorites');
      setColorType(editingItem.colorType || 'noun');
      setIsFavorite(editingItem.isFavorite !== false);
    } else {
      setLabel('');
      setSpeechText('');
      setEmoji('❤️');
      setPhotoUrl(undefined);
      const initialCat = (defaultCategory && defaultCategory !== 'all') ? defaultCategory : 'favorites';
      setCategory(initialCat);
      setColorType(initialCat === 'core' ? 'verb' : initialCat === 'feelings' ? 'adjective' : 'noun');
      setIsFavorite(true);
    }
    setShowUrlInput(false);
    setTempUrl('');
  }, [editingItem, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await compressImage(file);
      setPhotoUrl(base64);
      playChime('star');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Could not process this image. Please try a different photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (tempUrl.trim()) {
      setPhotoUrl(tempUrl.trim());
      setShowUrlInput(false);
      setTempUrl('');
      playChime('tap');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSave({
      id: editingItem?.id,
      label: label.trim(),
      speechText: speechText.trim() || label.trim(),
      emoji: emoji.trim() || '💬',
      photoUrl: photoUrl,
      category: category,
      colorType: colorType,
      isFavorite: isFavorite,
    });

    playChime('star');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] my-auto flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden text-slate-800">
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 bg-white/20 rounded-xl">
              {editingItem ? '✏️' : '➕'}
            </span>
            <div>
              <h2 className="text-lg font-black leading-tight">
                {editingItem ? 'Edit Word / Phrase' : 'Add Custom AAC Button'}
              </h2>
              <p className="text-xs text-white/90 font-medium">
                Upload real photos, customize speech, emojis, and colors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Live Button Preview Tile */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between w-28 h-28 shadow-md transition-all relative overflow-hidden ${
              colorType === 'subject' ? 'bg-amber-50 border-amber-400 text-amber-950' :
              colorType === 'verb' ? 'bg-emerald-50 border-emerald-400 text-emerald-950' :
              colorType === 'noun' ? 'bg-orange-50 border-orange-400 text-orange-950' :
              colorType === 'adjective' ? 'bg-sky-50 border-sky-400 text-sky-950' :
              colorType === 'social' ? 'bg-purple-50 border-purple-400 text-purple-950' :
              'bg-rose-50 border-rose-400 text-rose-950'
            }`}>
              {/* Image or Emoji Display */}
              <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={label}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-4xl leading-none">{emoji || '💬'}</span>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-black text-center truncate max-w-full w-full leading-tight mt-1">
                {label || 'Word Preview'}
              </span>

              {isFavorite && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                  ❤️
                </div>
              )}
            </div>

            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl(undefined)}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Photo (Use Emoji/Icon)</span>
              </button>
            )}
          </div>

          {/* Photo & Image Upload Section (Real Photo Modeling) */}
          <div className="p-3 bg-indigo-50/70 border-2 border-dashed border-indigo-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Custom Image or Photo (Optional)</span>
              </span>
              {photoUrl && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Image Attached ✓
                </span>
              )}
            </div>

            <p className="text-[11px] text-indigo-900/80 font-medium">
              Upload a photo of your child's real cup, favorite toy, family member, or pet!
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload from Device / Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* Paste Image URL Input */}
            {showUrlInput && (
              <div className="flex items-center gap-1.5 pt-1 animate-in fade-in">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com/picture.jpg"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-300 text-xs bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Word Label Input */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">
              Word or Phrase Label *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!speechText || speechText === label) {
                  setSpeechText(e.target.value);
                }
              }}
              placeholder="e.g., Water, My Headphones, Chicken Nuggets"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          {/* Spoken Text (TTS Speech) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1 flex items-center justify-between">
              <span>What The Tablet Speaks Aloud</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                placeholder="e.g., I would like chicken nuggets please"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-medium text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
              <Volume2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Emoji Fallback Picker (When no photo attached) */}
          {!photoUrl && (
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">
                Choose Icon / Emoji
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="w-14 text-center text-2xl py-1 rounded-xl border-2 border-slate-300 font-bold focus:border-amber-500 outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">Type any emoji or pick below:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {POPULAR_EMOJIS.map((em, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setEmoji(em)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                      emoji === em ? 'bg-amber-300 ring-2 ring-amber-500 shadow-xs' : 'bg-white/60'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Coding (Fitzgerald Grammar Type) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              Grammar Color Key
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {COLOR_TYPE_OPTIONS.map((col) => (
                <button
                  type="button"
                  key={col.id}
                  onClick={() => setColorType(col.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${col.bg} ${
                    colorType === col.id ? 'ring-2 ring-slate-900 font-black shadow-xs' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="text-xs font-bold block">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                isFavorite
                  ? 'bg-rose-50 border-rose-400 text-rose-950 font-black'
                  : 'bg-slate-50 border-slate-200 text-slate-600 font-bold'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span className="text-sm">Add to Favorites Section</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-300">
                {isFavorite ? '⭐ Favorited' : 'Not in Favorites'}
              </span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            {editingItem && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${editingItem.label}"?`)) {
                    onDelete(editingItem.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                {editingItem ? 'Save Changes' : 'Add Button'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
