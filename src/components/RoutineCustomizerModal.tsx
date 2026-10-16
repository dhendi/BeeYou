import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Star, 
  Smile, 
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Info,
  Mic,
  MicOff,
  Play,
  Square,
  ListTree,
  Search,
  Palette,
  Sparkles
} from 'lucide-react';
import { Routine, VisualScheduleStep } from '../types';
import { playChime } from '../utils/audio';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { TURTLE_SANCTUARY_ICONS } from '../data/themedIconsData';
import { useApp } from '../context/AppContext';
import { IconLibraryModal } from './common/IconLibraryModal';

interface RoutineCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoutine: Partial<Routine> | null;
  onSave: (routineData: Omit<Routine, 'id'>, existingId?: string) => void;
}

const COMMON_EMOJIS = [
  '🌅', '🏫', '🌙', '🎒', '🛏️', '💧', '🐕', '🎵', '☀️', 
  '📓', '🎨', '🏆', '🛁', '🦷', '🧩', '🛒', '🥞', '🧸', 
  '🚿', '🪥', '👕', '🥪', '🛝', '📖', '⭐', '👟', '🚌'
];

export const RoutineCustomizerModal: React.FC<RoutineCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialRoutine,
  onSave,
}) => {
  const { activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Routine['category']>('morning');
  const [emoji, setEmoji] = useState('🌅');
  const [time, setTime] = useState('8:00 AM');
  
  // Themed icon filter tab: 'turtle' | 'classic' | 'all'
  const [iconFilterTab, setIconFilterTab] = useState<'turtle' | 'classic' | 'all'>('turtle');

  // Full Icon Library Modal State
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<'routine' | 'first' | 'then' | 'newStep' | number | null>(null);
  
  // First/Then
  const [firstTask, setFirstTask] = useState('Brush teeth');
  const [firstEmoji, setFirstEmoji] = useState('🪥');
  const [thenTask, setThenTask] = useState('Tablet time');
  const [thenEmoji, setThenEmoji] = useState('📱');
  
  // Steps
  const [steps, setSteps] = useState<VisualScheduleStep[]>([]);
  
  // New step input
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepInstruction, setNewStepInstruction] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(5);
  const [newStepEmoji, setNewStepEmoji] = useState('⭐');
  const [newStepSensoryNote, setNewStepSensoryNote] = useState('');

  // Voice Recording per step (all hooks must be declared at the top level)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingStepIdx, setRecordingStepIdx] = useState<number | null>(null);
  const [playingStepIdx, setPlayingStepIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialRoutine) {
      setTitle(initialRoutine.title || '');
      setCategory(initialRoutine.category || 'morning');
      setEmoji(initialRoutine.emoji || '🌅');
      setTime(initialRoutine.time || '8:00 AM');
      
      if (initialRoutine.firstThen) {
        setFirstTask(initialRoutine.firstThen.first || '');
        setFirstEmoji(initialRoutine.firstThen.firstEmoji || '🪥');
        setThenTask(initialRoutine.firstThen.then || '');
        setThenEmoji(initialRoutine.firstThen.thenEmoji || '📱');
      } else {
        setFirstTask('');
        setFirstEmoji('🪥');
        setThenTask('');
        setThenEmoji('📱');
      }

      if (initialRoutine.steps && initialRoutine.steps.length > 0) {
        setSteps(initialRoutine.steps.map(s => ({ ...s })));
      } else {
        setSteps([
          { id: `step-${Date.now()}-1`, title: 'Get ready', instruction: 'Start calmly', durationMin: 5, completed: false, emoji: '⭐' },
          { id: `step-${Date.now()}-2`, title: 'Complete first task', instruction: 'Finish current step', durationMin: 10, completed: false, emoji: '👍' },
        ]);
      }
    } else {
      // Default template when creating a brand new routine from scratch
      setTitle('');
      setCategory(isTurtleTheme ? 'morning' : 'school');
      setEmoji(isTurtleTheme ? '/assets/stickers/turtle_mascot.png' : '🎒');
      setTime('8:30 AM');
      setFirstTask(isTurtleTheme ? 'Mindful arrival & settle in' : 'Unpack backpack');
      setFirstEmoji(isTurtleTheme ? '/assets/stickers/turtle_welcome_sign.png' : '🎒');
      setThenTask(isTurtleTheme ? 'Quiet break by lily pond' : 'Free play & break');
      setThenEmoji(isTurtleTheme ? '/assets/stickers/turtle_lily_pads.png' : '🛝');
      setNewStepEmoji(isTurtleTheme ? '/assets/stickers/turtle_tracks.png' : '⭐');
      setSteps(
        isTurtleTheme
          ? [
              { id: `step-${Date.now()}-1`, title: 'Arrive calmly & welcome day', instruction: 'Take a deep breath and settle into space', durationMin: 5, completed: false, emoji: '/assets/stickers/turtle_welcome_sign.png' },
              { id: `step-${Date.now()}-2`, title: 'Drink cool fresh water', instruction: 'Hydrate body and stretch gently', durationMin: 5, completed: false, emoji: '/assets/stickers/turtle_leaf_water_drop.png' },
              { id: `step-${Date.now()}-3`, title: 'Steady focus learning session', instruction: 'One step at a time at your own comfortable pace', durationMin: 20, completed: false, emoji: '/assets/stickers/turtle_sprouting_seedling.png' },
              { id: `step-${Date.now()}-4`, title: 'Quiet break on lily pads', instruction: 'Rest eyes and recharge your sensory battery', durationMin: 15, completed: false, emoji: '/assets/stickers/turtle_lily_pads.png' },
              { id: `step-${Date.now()}-5`, title: 'Pack up & celebrate steady progress', instruction: 'Slow and steady wins the race!', durationMin: 5, completed: false, emoji: '/assets/stickers/turtle_mascot.png' },
            ]
          : [
              { id: `step-${Date.now()}-1`, title: 'Arrive & unpack cubby', instruction: 'Hang up jacket and put lunchbox in bin', durationMin: 5, completed: false, emoji: '🎒' },
              { id: `step-${Date.now()}-2`, title: 'Morning circle & greeting', instruction: 'Sit calmly with classmates', durationMin: 15, completed: false, emoji: '⭕' },
              { id: `step-${Date.now()}-3`, title: 'Learning activity', instruction: 'Focus on today tasks step by step', durationMin: 25, completed: false, emoji: '📖' },
              { id: `step-${Date.now()}-4`, title: 'Recess & snack time', instruction: 'Take a break, move around, and enjoy a healthy snack', durationMin: 20, completed: false, emoji: '🛝' },
              { id: `step-${Date.now()}-5`, title: 'Pack bag & celebrate all done', instruction: 'Zip backpack, line up calmly', durationMin: 5, completed: false, emoji: '👟' },
            ]
      );
    }
    setIconFilterTab(isTurtleTheme ? 'turtle' : 'classic');
  }, [initialRoutine, isOpen, isTurtleTheme]);

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: VisualScheduleStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newStepTitle.trim(),
      instruction: newStepInstruction.trim() || undefined,
      durationMin: Number(newStepDuration) || 5,
      completed: false,
      emoji: newStepEmoji || '✨',
      sensoryNote: newStepSensoryNote.trim() || undefined,
    };
    setSteps([...steps, newStep]);
    setNewStepTitle('');
    setNewStepInstruction('');
    setNewStepSensoryNote('');
    playChime('tap');
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    playChime('clear');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) return;
    const newSteps = [...steps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    setSteps(newSteps);
    playChime('tap');
  };

  const handleUpdateStepTitle = (index: number, newTitle: string) => {
    const updated = [...steps];
    updated[index].title = newTitle;
    setSteps(updated);
  };

  // ─── Magic Task Breakdown ───────────────────────────────────────────────────
  const MICRO_STEP_TEMPLATES: Record<string, Array<{ title: string; emoji: string }>> = {
    default: [
      { title: 'Get everything ready', emoji: '🎒' },
      { title: 'Start the task', emoji: '▶️' },
      { title: 'Do the middle part', emoji: '⚙️' },
      { title: 'Check your work', emoji: '✅' },
      { title: 'All done — put things away', emoji: '📦' },
    ],
    brush: [
      { title: 'Get toothbrush & paste', emoji: '🪥' },
      { title: 'Wet brush', emoji: '💧' },
      { title: 'Brush top teeth', emoji: '😬' },
      { title: 'Brush bottom teeth', emoji: '😬' },
      { title: 'Rinse and spit', emoji: '🚿' },
    ],
    dress: [
      { title: 'Pick out clothes', emoji: '👕' },
      { title: 'Put on underwear', emoji: '🩲' },
      { title: 'Put on shirt', emoji: '👚' },
      { title: 'Put on pants / skirt', emoji: '👖' },
      { title: 'Put on socks and shoes', emoji: '🧦' },
    ],
    eat: [
      { title: 'Sit at the table', emoji: '🪑' },
      { title: 'Get your food and drink', emoji: '🍽️' },
      { title: 'Take small bites', emoji: '🥄' },
      { title: 'Drink some water', emoji: '💧' },
      { title: 'Clean up when done', emoji: '🧹' },
    ],
    shower: [
      { title: 'Get towel and clothes ready', emoji: '🛁' },
      { title: 'Adjust water temperature', emoji: '🌡️' },
      { title: 'Wash hair with shampoo', emoji: '🧴' },
      { title: 'Wash body with soap', emoji: '🧼' },
      { title: 'Rinse off and dry', emoji: '🚿' },
    ],
  };

  const handleBreakdown = (stepIdx: number) => {
    const stepTitle = steps[stepIdx].title.toLowerCase();
    let template = MICRO_STEP_TEMPLATES.default;
    if (stepTitle.includes('brush') || stepTitle.includes('teeth')) template = MICRO_STEP_TEMPLATES.brush;
    else if (stepTitle.includes('dress') || stepTitle.includes('cloth') || stepTitle.includes('wear')) template = MICRO_STEP_TEMPLATES.dress;
    else if (stepTitle.includes('eat') || stepTitle.includes('breakfast') || stepTitle.includes('lunch') || stepTitle.includes('dinner') || stepTitle.includes('snack')) template = MICRO_STEP_TEMPLATES.eat;
    else if (stepTitle.includes('shower') || stepTitle.includes('bath') || stepTitle.includes('wash')) template = MICRO_STEP_TEMPLATES.shower;

    const microSteps = template.map((t, i) => ({
      id: `micro-${Date.now()}-${i}`,
      title: t.title,
      emoji: t.emoji,
      completed: false,
    }));

    const updated = [...steps];
    updated[stepIdx] = { ...updated[stepIdx], microSteps };
    setSteps(updated);
    playChime('complete');
  };

  const handleRemoveMicroSteps = (stepIdx: number) => {
    const updated = [...steps];
    updated[stepIdx] = { ...updated[stepIdx], microSteps: undefined };
    setSteps(updated);
    playChime('clear');
  };

  // ─── Voice Recording per step handlers ─────────────────────────────────────

  const handleStartRecord = async (stepIdx: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const updated = [...steps];
          updated[stepIdx] = { ...updated[stepIdx], audioDataUrl: dataUrl };
          setSteps(updated);
          stream.getTracks().forEach((t) => t.stop());
          setRecordingStepIdx(null);
          playChime('complete');
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecordingStepIdx(stepIdx);
      // Auto-stop after 10 seconds
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 10000);
    } catch (err) {
      alert('Microphone access denied. Please allow microphone permission.');
    }
  };

  const handleStopRecord = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePlayAudio = (stepIdx: number) => {
    const url = steps[stepIdx].audioDataUrl;
    if (!url) return;
    if (audioRef.current) { audioRef.current.pause(); }
    audioRef.current = new Audio(url);
    audioRef.current.play();
    setPlayingStepIdx(stepIdx);
    audioRef.current.onended = () => setPlayingStepIdx(null);
  };

  const handleDeleteAudio = (stepIdx: number) => {
    const updated = [...steps];
    updated[stepIdx] = { ...updated[stepIdx], audioDataUrl: undefined };
    setSteps(updated);
    playChime('clear');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const routinePayload: Omit<Routine, 'id'> = {
      title: title.trim(),
      category,
      emoji,
      time: time.trim() || undefined,
      assignedDays: initialRoutine?.assignedDays || [0, 1, 2, 3, 4, 5, 6],
      firstThen: firstTask.trim() && thenTask.trim() ? {
        first: firstTask.trim(),
        firstEmoji,
        then: thenTask.trim(),
        thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: steps.length > 0 ? steps : [
        { id: `step-${Date.now()}`, title: 'First step', completed: false, emoji: '⭐' }
      ],
    };

    onSave(routinePayload, initialRoutine?.id);
    playChime('star');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-sky-200 text-slate-800 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 p-1.5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-center shrink-0">
              <RoutineStickerIcon emoji={emoji} title={title} className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {initialRoutine?.id ? 'Customize Active Routine' : 'Customize & Import Routine'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tailor step sequences, duration, and rewards specifically for your child.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close routine customizer modal"
            onClick={onClose}
            className="w-10 h-10 min-w-[48px] min-h-[48px] rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="text-xs font-black text-slate-700 block mb-1">Routine Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calm Morning Routine"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
              >
                <option value="morning">Morning</option>
                <option value="school">School Day</option>
                <option value="study">Study & Class</option>
                <option value="work">Workday</option>
                <option value="after-school">After-School</option>
                <option value="evening">Evening</option>
                <option value="bedtime">Bedtime</option>
                <option value="appointment">Appointment</option>
                <option value="special">Special / Plan Changed</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 7:30 AM"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-900"
              />
            </div>

            {/* Quick Icon Bar */}
            <div className="sm:col-span-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[11px] font-bold text-slate-500 block">Pick an icon:</label>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Category Filter Pills */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIconFilterTab('turtle');
                        playChime('tap');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        iconFilterTab === 'turtle'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-emerald-800'
                      }`}
                    >
                      <span>🐢</span>
                      <span>Turtle Sanctuary ({TURTLE_SANCTUARY_ICONS.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIconFilterTab('classic');
                        playChime('tap');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        iconFilterTab === 'classic'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-amber-800'
                      }`}
                    >
                      Classic ({COMMON_EMOJIS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIconFilterTab('all');
                        playChime('tap');
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        iconFilterTab === 'all'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                  </div>

                  {/* Full Library Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerTarget('routine');
                      setShowIconLibrary(true);
                      playChime('tap');
                    }}
                    className={`px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 ${isTurtleTheme ? 'text-emerald-800 border-emerald-300 hover:bg-emerald-50' : 'text-slate-600 border-slate-200'} border text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-2xs`}
                    title="Browse complete icon library"
                  >
                    <Search className={`w-3 h-3 ${isTurtleTheme ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>More...</span>
                  </button>
                </div>
              </div>

              {/* 1. Turtle Sanctuary Icons Grid (Visible when tab is 'turtle' or 'all', or when turtle theme is chosen) */}
              {(iconFilterTab === 'turtle' || iconFilterTab === 'all' || isTurtleTheme) && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span className="text-sm">🐢</span>
                      Wise Turtle Sanctuary Themed Icons
                      <span className="text-[10px] font-normal text-emerald-700">({TURTLE_SANCTUARY_ICONS.length})</span>
                    </span>
                    {isTurtleTheme && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded-full">
                        Active Theme
                      </span>
                    )}
                  </div>
                  <div className="max-h-44 sm:max-h-52 overflow-y-auto overscroll-contain pr-1 rounded-xl">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                      {TURTLE_SANCTUARY_ICONS.map((tIcon) => {
                        const isSelected = emoji === tIcon.value;
                        return (
                          <button
                            key={tIcon.id}
                            type="button"
                            onClick={() => {
                              setEmoji(tIcon.value);
                              playChime('tap');
                            }}
                            title={tIcon.label}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-200 ring-2 ring-emerald-600 scale-105 shadow-xs border border-emerald-400'
                                : 'bg-white hover:bg-emerald-100/70 border border-emerald-200 hover:scale-105'
                            }`}
                          >
                            <RoutineStickerIcon emoji={tIcon.value} title={tIcon.label} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Classic Icons (Visible when tab is 'classic' or 'all') */}
              {(iconFilterTab === 'classic' || iconFilterTab === 'all') && (
                <div className="space-y-1">
                  {(iconFilterTab === 'all' || isTurtleTheme) && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Standard Routine Icons:
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {COMMON_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          setEmoji(em);
                          playChime('tap');
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all p-1 cursor-pointer ${
                          emoji === em
                            ? 'bg-sky-100 ring-2 ring-sky-500 scale-105 shadow-xs'
                            : 'bg-white hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <RoutineStickerIcon emoji={em} className="w-6 h-6 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* First / Then Sequencing */}
          <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-indigo-950 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-indigo-600" />
                First / Then Visual Sequence
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                High motivation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-indigo-200">
                <span className="text-[11px] font-black uppercase text-indigo-700 block mb-1">
                  1. FIRST (Demand / Task):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerTarget('first');
                      setShowIconLibrary(true);
                      playChime('tap');
                    }}
                    className="w-9 h-9 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs hover:scale-105"
                    title="Tap to change First Task icon"
                  >
                    <RoutineStickerIcon emoji={firstEmoji} title={firstTask} className="w-6 h-6 object-contain" />
                  </button>
                  <input
                    type="text"
                    value={firstTask}
                    onChange={(e) => setFirstTask(e.target.value)}
                    placeholder="e.g. Put on clothes & brush teeth"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="text-[11px] font-black uppercase text-purple-700 block mb-1">
                  2. THEN (Reward / Motivation):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerTarget('then');
                      setShowIconLibrary(true);
                      playChime('tap');
                    }}
                    className="w-9 h-9 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs hover:scale-105"
                    title="Tap to change Then Task icon"
                  >
                    <RoutineStickerIcon emoji={thenEmoji} title={thenTask} className="w-6 h-6 object-contain" />
                  </button>
                  <input
                    type="text"
                    value={thenTask}
                    onChange={(e) => setThenTask(e.target.value)}
                    placeholder="e.g. 15 min tablet or favorite music"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Step-by-Step Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>Visual Steps ({steps.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Children check off each step on their visual schedule.
                </p>
              </div>
            </div>

            {/* List of existing steps */}
            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 group hover:border-sky-300 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIconPickerTarget(idx);
                          setShowIconLibrary(true);
                          playChime('tap');
                        }}
                        className="w-8 h-8 flex items-center justify-center shrink-0 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 hover:border-sky-400 p-0.5 shadow-2xs cursor-pointer transition-all hover:scale-105"
                        title="Tap to change step icon"
                      >
                        <RoutineStickerIcon emoji={st.emoji} title={st.title} className="w-7 h-7 object-contain" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleUpdateStepTitle(idx, e.target.value)}
                          className="w-full bg-transparent font-bold text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-sky-400 rounded-sm px-1 py-0.5"
                        />
                        {st.sensoryNote && (
                          <p className="text-[10px] text-teal-700 italic truncate px-1">
                            💡 Sensory tip: {st.sensoryNote}
                          </p>
                        )}
                      </div>
                      {st.durationMin && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {st.durationMin}m
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => handleMoveStep(idx, 'up')} disabled={idx === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer" title="Move up">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleMoveStep(idx, 'down')} disabled={idx === steps.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer" title="Move down">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {/* Micro-steps Breakdown */}
                      <button type="button"
                        aria-label={st.microSteps ? 'Remove micro-steps' : 'Break step into micro-steps'}
                        onClick={() => st.microSteps ? handleRemoveMicroSteps(idx) : handleBreakdown(idx)}
                        className={`p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${st.microSteps ? 'text-purple-600 hover:text-red-500' : 'text-slate-400 hover:text-purple-600'}`}
                        title={st.microSteps ? 'Remove micro-steps' : 'Break this into micro-steps'}>
                        <ListTree className="w-4 h-4" aria-hidden="true" />
                      </button>
                      {/* 🎤 Voice Recording */}
                      {!st.audioDataUrl ? (
                        recordingStepIdx === idx ? (
                          <button type="button"
                            aria-label="Stop recording voice clip"
                            onClick={handleStopRecord}
                            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-red-500 animate-pulse cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none" title="Stop recording">
                            <Square className="w-4 h-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <button type="button"
                            aria-label="Record voice clip for this step"
                            onClick={() => handleStartRecord(idx)}
                            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-slate-400 hover:text-rose-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none" title="Record voice clip for this step">
                            <Mic className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <button type="button" onClick={() => handlePlayAudio(idx)}
                            className={`p-1 rounded-md cursor-pointer ${playingStepIdx === idx ? 'text-green-600 animate-pulse' : 'text-green-500 hover:text-green-700'}`} title="Play voice clip">
                            <Play className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteAudio(idx)}
                            className="p-1 rounded-md text-slate-300 hover:text-red-400 cursor-pointer" title="Delete voice clip">
                            <MicOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <button type="button" onClick={() => handleRemoveStep(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer" title="Delete step">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Micro-steps breakdown */}
                  {st.microSteps && st.microSteps.length > 0 && (
                    <div className="pl-8 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Micro-steps:</p>
                      {st.microSteps.map((ms) => (
                        <div key={ms.id} className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5">
                          <RoutineStickerIcon emoji={ms.emoji} title={ms.title} className="w-4 h-4 shrink-0 object-contain" />
                          <span className="text-[11px] font-bold text-purple-800">{ms.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Voice clip indicator */}
                  {st.audioDataUrl && (
                    <div className="pl-8">
                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <Mic className="w-3 h-3" /> Parent voice clip recorded ✓
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Step Card */}
            <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-black text-sky-900 block">Add Step:</span>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <div className="sm:col-span-1 flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerTarget('newStep');
                      setShowIconLibrary(true);
                      playChime('tap');
                    }}
                    className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    title="Tap to choose step icon from library"
                  >
                    <RoutineStickerIcon emoji={newStepEmoji} title={newStepTitle} className="w-5 h-5 shrink-0 object-contain" />
                  </button>
                  <input
                    type="text"
                    value={newStepEmoji}
                    onChange={(e) => setNewStepEmoji(e.target.value)}
                    placeholder="Icon"
                    className="w-full text-center text-xs font-bold bg-transparent outline-none"
                    title="Icon or emoji"
                  />
                </div>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Step title (e.g. Put shoes on)"
                  className="sm:col-span-3 px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newStepDuration}
                  onChange={(e) => setNewStepDuration(Number(e.target.value))}
                  placeholder="Min"
                  className="sm:col-span-1 px-2 py-1.5 text-center rounded-xl bg-white border border-slate-300 font-bold text-xs"
                  title="Duration in minutes"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="sm:col-span-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
              <input
                type="text"
                value={newStepSensoryNote}
                onChange={(e) => setNewStepSensoryNote(e.target.value)}
                placeholder="Optional sensory or regulation tip (e.g. Tagless shirt, dim lighting)"
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-[11px]"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{initialRoutine?.id ? 'Save Routine Changes' : 'Import to Child Schedules'}</span>
          </button>
        </div>
      </div>

      {/* Full Icon Library Modal */}
      <IconLibraryModal
        isOpen={showIconLibrary}
        onClose={() => {
          setShowIconLibrary(false);
          setIconPickerTarget(null);
        }}
        initialTab={isTurtleTheme ? 'turtle' : 'all'}
        selectedEmoji={
          iconPickerTarget === 'routine'
            ? emoji
            : iconPickerTarget === 'first'
            ? firstEmoji
            : iconPickerTarget === 'then'
            ? thenEmoji
            : iconPickerTarget === 'newStep'
            ? newStepEmoji
            : typeof iconPickerTarget === 'number'
            ? steps[iconPickerTarget]?.emoji
            : undefined
        }
        onSelectIcon={(chosenEmoji) => {
          if (iconPickerTarget === 'routine') {
            setEmoji(chosenEmoji);
          } else if (iconPickerTarget === 'first') {
            setFirstEmoji(chosenEmoji);
          } else if (iconPickerTarget === 'then') {
            setThenEmoji(chosenEmoji);
          } else if (iconPickerTarget === 'newStep') {
            setNewStepEmoji(chosenEmoji);
          } else if (typeof iconPickerTarget === 'number') {
            const updated = [...steps];
            updated[iconPickerTarget] = { ...updated[iconPickerTarget], emoji: chosenEmoji };
            setSteps(updated);
          }
          setShowIconLibrary(false);
          setIconPickerTarget(null);
        }}
      />
    </div>
  );
};
