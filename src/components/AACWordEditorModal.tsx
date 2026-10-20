import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AACItem, AACCategory } from '../types';
import { useModalBackHandler } from '../services/modalBackHandler';
import { 
  X, 
  Heart, 
  Star, 
  Volume2, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Link, 
  RefreshCw,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Palette,
  PenTool,
  Eraser,
  Undo2,
  Search,
  Check,
  AlertCircle,
  Smile
} from 'lucide-react';
import { playChime, playAudioUrl, speakText } from '../utils/audio';
import { AACSymbolPickerModal } from './AACSymbolPickerModal';
import { t } from '../services/translator';

interface AACWordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: AACItem | null;
  onSave: (item: Omit<AACItem, 'id' | 'motorIndex'> & { 
    id?: string; 
    isFavorite?: boolean;
    audioDataUrl?: string;
    audioRecordedBy?: string;
    audioRecordedAt?: string;
    customDrawingUrl?: string;
  }) => void;
  onDelete?: (id: string) => void;
  defaultCategory?: AACCategory | 'all';
  existingItems?: AACItem[];
  isPremium?: boolean;
  triggerUpgrade?: (reason?: string) => void;
}

const CATEGORY_OPTIONS: { id: AACCategory; label: string; iconSrc: string }[] = [
  { id: 'favorites', label: 'Favorites', iconSrc: '/assets/stickers/aac_favorites.webp' },
  { id: 'core', label: 'Core Words', iconSrc: '/assets/stickers/aac_core.webp' },
  { id: 'food', label: 'Food', iconSrc: '/assets/stickers/aac_food.webp' },
  { id: 'drinks', label: 'Drinks', iconSrc: '/assets/stickers/aac_drinks.webp' },
  { id: 'activities', label: 'Play & Fun', iconSrc: '/assets/stickers/aac_activities.webp' },
  { id: 'places', label: 'Places', iconSrc: '/assets/stickers/aac_places.webp' },
  { id: 'people', label: 'People', iconSrc: '/assets/stickers/aac_people.webp' },
  { id: 'feelings', label: 'Feelings', iconSrc: '/assets/stickers/aac_feelings.webp' },
  { id: 'sensory', label: 'Sensory', iconSrc: '/assets/stickers/aac_sensory.webp' },
  { id: 'personal', label: 'Personal', iconSrc: '/assets/stickers/toothbrush.webp' },
];

const COLOR_TYPE_OPTIONS: { id: AACItem['colorType']; label: string; desc: string; bg: string }[] = [
  { id: 'subject', label: 'Yellow (People / Pronouns)', desc: 'Who is speaking or acting', bg: 'bg-[#FEF08A] border-2 border-[#EAB308] text-yellow-950' },
  { id: 'verb', label: 'Green (Verbs / Actions)', desc: 'Actions, wanting, doing', bg: 'bg-[#BBF7D0] border-2 border-[#22C55E] text-emerald-950' },
  { id: 'noun', label: 'Orange (Nouns / Objects)', desc: 'Things, food, places, toys', bg: 'bg-[#FED7AA] border-2 border-[#F97316] text-orange-950' },
  { id: 'adjective', label: 'Blue (Descriptors / Adjectives)', desc: 'More, done, colors, sizes', bg: 'bg-[#BAE6FD] border-2 border-[#0284C7] text-sky-950' },
  { id: 'social', label: 'Pink / Purple (Social / Phrases)', desc: 'Yes, please, thank you, greetings', bg: 'bg-[#FBCFE8] border-2 border-[#DB2777] text-pink-950' },
  { id: 'emergency', label: 'Red (Emergency / Urgent)', desc: 'Stop, help, hurt, urgent needs', bg: 'bg-rose-100 border-2 border-rose-500 text-rose-950' },
];

const POPULAR_EMOJIS = [
  '❤️', '⭐', '🙋', '👉', '🤲', '❗', '👍', '🚶', '👀', '🍽️', '🥤', '🎲', '🆘', '🛑',
  '🍕', '🧀', '🍎', '🥪', '🍌', '🍪', '🍓', '💧', '🧃', '🥛', '📱', '🛝', '📖', '🖍️',
  '🎵', '🧱', '🧩', '🌳', '🏠', '🏫', '🌲', '🦷', '🩺', '🚗', '👩', '👨', '🧑‍🏫', '🤝',
  '🔊', '☀️', '🎧', '🛏️', '🤫', '🧸', '😊', '😢', '😌', '🥱', '😠', '😨', '🤕', '🚽',
  '🌻', '💬', '🎉', '💡', '🌈', '🫂', '🧘', '😴', '💊', '🧃', '🥪', '🍦', '🎈', '🎨'
];

const SPEAKER_PRESETS = [
  { id: 'Mom', label: '👩 Mom' },
  { id: 'Dad', label: '👨 Dad' },
  { id: 'Caregiver', label: '🤝 Caregiver' },
  { id: 'Child', label: '⭐ Child' },
  { id: 'Custom', label: '✏️ Custom' },
];

const DRAW_PALETTE = [
  { id: '#1E293B', label: 'Charcoal' },
  { id: '#0284C7', label: 'Sky Blue' },
  { id: '#16A34A', label: 'Grass Green' },
  { id: '#EAB308', label: 'Sunshine' },
  { id: '#EA580C', label: 'Warm Orange' },
  { id: '#E11D48', label: 'Coral Rose' },
  { id: '#9333EA', label: 'Lavender' },
  { id: '#DB2777', label: 'Pink' },
];

/**
 * Resizes and compresses image to ~320px for optimized offline storage
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
  existingItems = [],
  isPremium,
  triggerUpgrade,
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
  
  // Visual Mode Tabs
  const [visualTab, setVisualTab] = useState<'photo' | 'draw' | 'symbol' | 'emoji'>('photo');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  // Caregiver Voice Recording State
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [audioRecordedBy, setAudioRecordedBy] = useState<string>('Mom');
  const [customSpeaker, setCustomSpeaker] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  // Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState('#1E293B');
  const [brushSize, setBrushSize] = useState<number | 'eraser'>(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [hasDrawnSomething, setHasDrawnSomething] = useState(false);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (editingItem) {
      setLabel(editingItem.label || '');
      setSpeechText(editingItem.speechText || editingItem.label || '');
      setEmoji(editingItem.emoji || '💬');
      setPhotoUrl(editingItem.photoUrl);
      setCategory(editingItem.category || 'favorites');
      setColorType(editingItem.colorType || 'noun');
      setIsFavorite(editingItem.isFavorite !== false);
      setAudioDataUrl(editingItem.audioDataUrl);
      setAudioRecordedBy(editingItem.audioRecordedBy || 'Mom');
      if (editingItem.audioRecordedBy && !SPEAKER_PRESETS.some(s => s.id === editingItem.audioRecordedBy)) {
        setCustomSpeaker(editingItem.audioRecordedBy);
      }
      if (editingItem.photoUrl) {
        setVisualTab('photo');
      } else {
        setVisualTab('emoji');
      }
    } else {
      setLabel('');
      setSpeechText('');
      setEmoji('❤️');
      setPhotoUrl(undefined);
      const initialCat = (defaultCategory && defaultCategory !== 'all') ? defaultCategory : 'favorites';
      setCategory(initialCat);
      setColorType(initialCat === 'core' ? 'verb' : initialCat === 'feelings' ? 'adjective' : 'noun');
      setIsFavorite(true);
      setAudioDataUrl(undefined);
      setAudioRecordedBy('Mom');
      setVisualTab('photo');
    }
    setShowUrlInput(false);
    setTempUrl('');
    setIsRecording(false);
    setRecordingSeconds(0);
    setMicError(null);
  }, [editingItem, defaultCategory, isOpen]);

  // Clean up audio streams and timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // ─── Drawing Canvas Setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (visualTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Save blank initial state
        setCanvasHistory([canvas.toDataURL()]);
      }
    }
  }, [visualTab]);

  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    setCanvasHistory((prev) => [...prev.slice(-15), dataUrl]);
    setHasDrawnSomething(true);
  };

  const handleCanvasStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushSize === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    setIsDrawing(true);
  };

  const handleCanvasMove = (clientX: number, clientY: number) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const handleUndoDrawing = () => {
    if (canvasHistory.length <= 1 || !canvasRef.current) return;
    const newHistory = [...canvasHistory];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    setCanvasHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx && previousState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = previousState;
    }
    playChime('tap');
  };

  const handleClearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([canvas.toDataURL()]);
    setHasDrawnSomething(false);
    playChime('clear');
  };

  const handleApplyDrawingAsTile = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoUrl(dataUrl);
    playChime('star');
  };

  // ─── Caregiver Voice Recording ──────────────────────────────────────────────
  const handleStartRecording = async () => {
    if (isPremium === false && triggerUpgrade) {
      triggerUpgrade('Recording custom caregiver voice clips for AAC tiles is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Audio recording is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Volume Visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (e) {
        console.warn('Audio analyser not available:', e);
      }

      audioChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? { mimeType: 'audio/mp4' }
        : undefined;

      const mr = new MediaRecorder(stream, options);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioDataUrl(base64);
          playChime('complete');
        };
        reader.readAsDataURL(blob);

        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setMicVolumeLevel(0);
      };

      mediaRecorderRef.current = mr;
      mr.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      playChime('tap');

      // Timer with 15s limit
      const startTime = Date.now();
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingSeconds(elapsed);
        if (elapsed >= 15) {
          handleStopRecording();
        }
      }, 250);

    } catch (err: any) {
      console.warn('Microphone access denied:', err);
      setMicError('Microphone permission denied. Please allow microphone access in your browser settings.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handlePlayVoicePreview = () => {
    if (!audioDataUrl) return;
    if (isPlayingAudio) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(audioDataUrl);
    audioPreviewRef.current = audio;
    setIsPlayingAudio(true);
    audio.play().catch(() => setIsPlayingAudio(false));
    audio.onended = () => {
      setIsPlayingAudio(false);
      audioPreviewRef.current = null;
    };
  };

  const handleDeleteVoice = () => {
    if (isPlayingAudio && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setAudioDataUrl(undefined);
    setIsPlayingAudio(false);
    playChime('clear');
  };

  // Test sound for tile (plays recorded voice if exists, otherwise TTS)
  const handleTestTileSound = async () => {
    if (audioDataUrl) {
      await playAudioUrl(audioDataUrl, label || 'Test');
    } else {
      const speech = speechText.trim() || label.trim() || 'BeeYou AAC';
      await speakText(speech);
    }
  };

  // ─── Image Upload & Link ───────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPremium === false && triggerUpgrade) {
      triggerUpgrade('Custom photos for AAC tiles are a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
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

  const handleSelectSymbol = (sym: {
    photoUrl: string;
    label: string;
    speechText?: string;
    emoji?: string;
    category?: AACCategory;
    colorType?: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  }) => {
    setPhotoUrl(sym.photoUrl);
    if (!label.trim()) setLabel(sym.label);
    if (!speechText.trim()) setSpeechText(sym.speechText || sym.label);
    if (sym.emoji) setEmoji(sym.emoji);
    if (sym.colorType) setColorType(sym.colorType);
    if (sym.category) setCategory(sym.category);
    setShowSymbolPicker(false);
    playChime('star');
  };

  // ─── Form Submission ────────────────────────────────────────────────────────
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const finalSpeaker = audioRecordedBy === 'Custom' 
      ? (customSpeaker.trim() || 'Caregiver') 
      : audioRecordedBy;

    onSave({
      id: editingItem?.id,
      label: label.trim(),
      speechText: speechText.trim() || label.trim(),
      emoji: emoji.trim() || '💬',
      photoUrl: photoUrl,
      category: category,
      colorType: colorType,
      isFavorite: isFavorite,
      audioDataUrl: audioDataUrl,
      audioRecordedBy: audioDataUrl ? finalSpeaker : undefined,
      audioRecordedAt: audioDataUrl ? new Date().toISOString() : undefined,
    });

    playChime('star');
    onClose();
  };

  useModalBackHandler(isOpen, onClose, 20);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] my-auto flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden text-slate-800">
        
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-white/20 rounded-2xl backdrop-blur-xs shadow-inner">
              {editingItem ? '✏️' : '🎙️'}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black leading-tight tracking-tight">
                {editingItem ? t('Edit AAC Button & Voice') : t('AAC Custom Tile Creator & Voice Studio')}
              </h2>
              <p className="text-xs text-white/90 font-medium">
                {t('Upload photos, sketch custom doodles, and record familiar caregiver voices')}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close word editor modal"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center justify-center active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* Live Button Preview Card with Sound Test */}
          <div className="bg-gradient-to-b from-amber-50/60 to-rose-50/40 p-4 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-between w-28 h-28 shadow-md transition-all relative overflow-hidden shrink-0 ${
                colorType === 'subject' ? 'bg-[#FEF08A] border-2 border-[#EAB308] text-yellow-950' :
                colorType === 'verb' ? 'bg-[#BBF7D0] border-2 border-[#22C55E] text-emerald-950' :
                colorType === 'noun' ? 'bg-[#FED7AA] border-2 border-[#F97316] text-orange-950' :
                colorType === 'adjective' ? 'bg-[#BAE6FD] border-2 border-[#0284C7] text-sky-950' :
                colorType === 'social' ? 'bg-[#FBCFE8] border-2 border-[#DB2777] text-pink-950' :
                'bg-rose-100 border-2 border-rose-500 text-rose-950'
              }`}>
                {/* Image or Emoji Display */}
                <div className="flex-1 w-full min-h-0 flex items-center justify-center p-0.5">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={label || 'Preview'}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl leading-none select-none">{emoji || '💬'}</span>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs font-black text-center truncate max-w-full w-full leading-tight mt-1">
                  {label || t('Word Preview')}
                </span>

                {/* Favorite Heart */}
                {isFavorite && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                    ❤️
                  </div>
                )}

                {/* Recorded Voice Badge */}
                {audioDataUrl && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[8px] font-black flex items-center gap-0.5 shadow-xs">
                    <Mic className="w-2 h-2" />
                    <span>{audioRecordedBy === 'Custom' ? (customSpeaker || 'Voice') : audioRecordedBy}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  {t('Live Button Preview')}
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-1">
                  {label || t('Untitled Word')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {speechText ? `"${speechText}"` : t('Tap test to hear how it speaks aloud')}
                </p>
                {audioDataUrl ? (
                  <div className="mt-1 text-xs text-purple-700 font-bold flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-purple-600" />
                    <span>{t('Personalized Voice Attached')} ({audioRecordedBy})</span>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t('Standard Text-to-Speech Engine')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Sound Button */}
            <button
              type="button"
              onClick={handleTestTileSound}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-100 text-amber-950 border-2 border-amber-300 font-black text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title={t('Test hearing the voice for this button')}
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>{t('Test Sound 🔊')}</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 🎙️ CAREGIVER VOICE RECORDING STUDIO                                */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="p-4 bg-purple-50/80 border-2 border-purple-200 rounded-3xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                    {t('Caregiver Voice Studio')}
                  </h4>
                  <p className="text-[11px] text-purple-900/80 font-medium">
                    {t('Record Mom, Dad, or your child\'s voice for emotional grounding')}
                  </p>
                </div>
              </div>

              {audioDataUrl && (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-purple-700" />
                  <span>{t('Voice Ready')}</span>
                </span>
              )}
            </div>

            {/* Speaker Tag Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-purple-900 block">
                {t('Who is speaking this word?')}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SPEAKER_PRESETS.map((spk) => (
                  <button
                    key={spk.id}
                    type="button"
                    onClick={() => {
                      setAudioRecordedBy(spk.id);
                      playChime('tap');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      audioRecordedBy === spk.id
                        ? 'bg-purple-600 text-white shadow-xs font-black'
                        : 'bg-white hover:bg-purple-100/70 text-purple-900 border border-purple-200'
                    }`}
                  >
                    {t(spk.label)}
                  </button>
                ))}
              </div>

              {audioRecordedBy === 'Custom' && (
                <input
                  type="text"
                  value={customSpeaker}
                  onChange={(e) => setCustomSpeaker(e.target.value)}
                  placeholder={t('e.g. Grandma, Big Sister, Teacher')}
                  className="mt-1 px-3 py-1.5 rounded-xl border border-purple-300 text-xs bg-white w-full max-w-xs font-medium outline-none focus:ring-2 focus:ring-purple-400"
                />
              )}
            </div>

            {/* Mic Error Alert */}
            {micError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{micError}</span>
              </div>
            )}

            {/* Recording Controls */}
            {isRecording ? (
              <div className="p-4 bg-white rounded-2xl border-2 border-rose-400 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
                  <div>
                    <div className="text-xs font-black text-rose-950 flex items-center gap-2">
                      <span>{t('Recording Voice...')}</span>
                      <span className="font-mono text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                        0:{String(recordingSeconds).padStart(2, '0')} / 0:15
                      </span>
                    </div>
                    {/* Animated Volume Waveform Meter */}
                    <div className="flex items-center gap-1 mt-1.5 h-3">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                          style={{
                            height: `${Math.max(4, Math.min(16, (micVolumeLevel * ((i % 3) + 1)) / 10))}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>{t('Finish Recording')}</span>
                </button>
              </div>
            ) : audioDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayVoicePreview}
                    className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition"
                    title={isPlayingAudio ? t('Stop Playing') : t('Listen to recording')}
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-black text-purple-950">
                      {t('Voice Clip Recorded')}
                    </div>
                    <div className="text-[11px] text-purple-700 font-medium">
                      {t('Speaker')}: {audioRecordedBy === 'Custom' ? (customSpeaker || 'Custom') : audioRecordedBy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('Re-record')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteVoice}
                    className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('Delete')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-purple-100/70 border-2 border-dashed border-purple-300 text-purple-950 font-black text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-purple-600" />
                <span>{t('Tap to Record Caregiver Voice (Up to 15s)')}</span>
              </button>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 🎨 VISUAL SELECTION STUDIO                                        */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>{t('Button Icon & Visual Art')}</span>
              </span>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('Reset Image')}</span>
                </button>
              )}
            </div>

            {/* Visual Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
              {[
                { id: 'photo', label: '📷 Real Photo', icon: Camera },
                { id: 'draw', label: '🎨 Draw Doodle', icon: PenTool },
                { id: 'symbol', label: '🔍 Mulberry Symbols', icon: Search },
                { id: 'emoji', label: '😀 Emoji', icon: Smile },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setVisualTab(tab.id as any);
                      playChime('tap');
                    }}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      visualTab === tab.id
                        ? 'bg-white text-indigo-950 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Photo / Camera */}
            {visualTab === 'photo' && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <p className="text-[11px] text-slate-600 font-medium">
                  {t('Upload a real photo of your child\'s favorite food, cup, blanket, toy, or family member!')}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? t('Uploading...') : t('Upload from Files')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('Take Camera Photo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>{t('Web URL')}</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="url"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder="https://example.com/picture.jpg"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                    >
                      {t('Apply')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Canvas Drawing Pad */}
            {visualTab === 'draw' && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <p className="text-[11px] text-slate-600 font-medium">
                  {t('Sketch a custom symbol or sign. Your child or family can draw their own symbols!')}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Canvas */}
                  <div className="relative border-2 border-slate-300 rounded-2xl overflow-hidden shadow-inner bg-white touch-none">
                    <canvas
                      ref={canvasRef}
                      width={220}
                      height={220}
                      className="cursor-crosshair w-[220px] h-[220px]"
                      onMouseDown={(e) => handleCanvasStart(e.clientX, e.clientY)}
                      onMouseMove={(e) => handleCanvasMove(e.clientX, e.clientY)}
                      onMouseUp={handleCanvasEnd}
                      onMouseLeave={handleCanvasEnd}
                      onTouchStart={(e) => {
                        const t = e.touches[0];
                        if (t) handleCanvasStart(t.clientX, t.clientY);
                      }}
                      onTouchMove={(e) => {
                        const t = e.touches[0];
                        if (t) handleCanvasMove(t.clientX, t.clientY);
                      }}
                      onTouchEnd={handleCanvasEnd}
                    />
                  </div>

                  {/* Drawing Tools */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Color Swatches */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        {t('Ink Color')}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {DRAW_PALETTE.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              setBrushColor(color.id);
                              if (brushSize === 'eraser') setBrushSize(6);
                              playChime('tap');
                            }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                              brushColor === color.id && brushSize !== 'eraser'
                                ? 'scale-125 border-slate-900 shadow-xs'
                                : 'border-white hover:scale-110'
                            }`}
                            style={{ backgroundColor: color.id }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Brush Sizes */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        {t('Brush Size')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[
                          { size: 3, label: 'Fine' },
                          { size: 6, label: 'Med' },
                          { size: 14, label: 'Bold' },
                        ].map((b) => (
                          <button
                            key={b.size}
                            type="button"
                            onClick={() => {
                              setBrushSize(b.size);
                              playChime('tap');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              brushSize === b.size
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            setBrushSize('eraser');
                            playChime('tap');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
                            brushSize === 'eraser'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <Eraser className="w-3 h-3" />
                          <span>{t('Eraser')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Canvas Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={handleUndoDrawing}
                        disabled={canvasHistory.length <= 1}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                        title={t('Undo stroke')}
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{t('Undo')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearDrawing}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Clear')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyDrawingAsTile}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('Use Drawing ✓')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Mulberry Symbols Studio Trigger */}
            {visualTab === 'symbol' && (
              <div className="space-y-3 pt-1 animate-in fade-in">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-black text-indigo-950">
                      {t('Search 3,400+ Clinical Mulberry Symbols')}
                    </h5>
                    <p className="text-[11px] text-indigo-800/80 font-medium">
                      {t('Open-source standardized symbols designed specifically for motor-memory AAC communication')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSymbolPicker(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t('Browse Symbols')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Emoji Picker */}
            {visualTab === 'emoji' && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    maxLength={4}
                    className="w-14 text-center text-2xl py-1.5 rounded-xl border-2 border-slate-300 font-bold focus:border-amber-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    {t('Type any emoji or pick from popular presets:')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white rounded-2xl border border-slate-200">
                  {POPULAR_EMOJIS.map((em, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setEmoji(em)}
                      className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                        emoji === em ? 'bg-amber-300 ring-2 ring-amber-500 shadow-xs' : 'bg-slate-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Word Label Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                {t('Word or Phrase Label *')}
              </label>
              {!editingItem && label.trim() && existingItems.some((i) => (i.label || '').trim().toLowerCase() === label.trim().toLowerCase()) && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  ⚠️ {t('Word already exists (will update)')}
                </span>
              )}
            </div>
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
              placeholder={t('e.g., Water, Grandma, My Headphones, Chicken Nuggets')}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          {/* Spoken Text (TTS Speech Pronunciation) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1 flex items-center justify-between">
              <span>{t('Pronunciation / Speech Text')}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t('Defaults to Label')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                placeholder={t('e.g., I would like chicken nuggets please')}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-medium text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
              <Volume2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              {t('Category Folder')}
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
                  <img src={cat.iconSrc} alt="" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
                  <span className="truncate">{t(cat.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Coding (Fitzgerald Grammar Type) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              {t('Grammar Color Key (Fitzgerald System)')}
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
                  <span className="text-xs font-bold block">{t(col.label)}</span>
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
                <span className="text-sm">{t('Show in Child Favorites')}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-300">
                {isFavorite ? `⭐ ${t('Favorited')}` : t('Standard')}
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
                <span>{t('Delete')}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                {editingItem ? t('Save Changes') : t('Save AAC Button & Voice')}
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Online Mulberry Symbol Picker Modal */}
      {showSymbolPicker && (
        <AACSymbolPickerModal
          isOpen={showSymbolPicker}
          onClose={() => setShowSymbolPicker(false)}
          onSelectSymbol={handleSelectSymbol}
          initialSearch={label}
          activeCategory={category}
        />
      )}
    </div>,
    document.body
  );
};
