import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  HelpCircle,
  Volume2,
  RotateCcw,
  Edit3,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  Eye,
  Save,
  ChevronDown
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { IconLibraryModal } from './common/IconLibraryModal';
import { t } from '../services/translator';

const REASON_PRESETS = [
  { label: 'Clinic/Place closed', icon: '🏥', reason: 'The dental clinic/place had to close unexpectedly today.' },
  { label: 'Rain / Bad weather', icon: '🌧️', reason: 'Heavy rain and stormy weather made outdoor plans unsafe today.' },
  { label: 'Early school dismissal', icon: '🏫', reason: 'School had an unexpected early dismissal today.' },
  { label: 'Feeling tired/unwell', icon: '🤒', reason: 'Our bodies need a calm rest and recovery day today.' },
  { label: 'Delayed / Rescheduled', icon: '⏰', reason: 'The original appointment was postponed to another day.' },
  { label: 'Traffic / Car issue', icon: '🚗', reason: 'Unexpected travel delays meant we could not make it in time.' },
];

const REPLACEMENT_PRESETS = [
  {
    title: 'Picnic Lunch & Park Afternoon',
    steps: [
      { title: 'Favorite pizza lunch at home', emoji: '🍕', time: '12:30 PM' },
      { title: 'Play at the sunny playground swings', emoji: '🛝', time: '1:30 PM' },
      { title: 'Drawing and cozy world building', emoji: '🎨', time: '3:00 PM' },
    ],
    calming: 'It is okay to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.',
    phrases: ['Why did it change?', "I'm upset about this.", 'What happens now?', 'Can we go home?', 'I need a quiet break.'],
  },
  {
    title: 'Indoor Blanket Fort & Cozy Movie',
    steps: [
      { title: 'Build living room blanket fort with pillows', emoji: '🛋️', time: '1:00 PM' },
      { title: 'Warm cocoa and crackers snack', emoji: '☕', time: '1:45 PM' },
      { title: 'Watch favorite animal movie in fort', emoji: '🧸', time: '2:15 PM' },
    ],
    calming: 'Staying inside can be super relaxing! We have blankets, warm snacks, and our favorite movie ready.',
    phrases: ['I want to build the fort now.', 'Can we have popcorn?', 'Can we go another day?', 'I like our fort.'],
  },
  {
    title: 'Quiet Sensory Break & Free Play',
    steps: [
      { title: 'Dim lights and put on comfy headphones', emoji: '🎧', time: 'Now' },
      { title: 'Play with fidgets and squishy toys', emoji: '🫧', time: '15 mins' },
      { title: 'Free tablet time and building blocks', emoji: '📱', time: 'Later' },
    ],
    calming: 'Take as much quiet time as you need. No rushing, no pressure.',
    phrases: ['I need quiet time.', 'Can I wear my headphones?', 'I want to be alone for a bit.', 'Thank you for understanding.'],
  },
];

const QUICK_EMOJIS = ['🍕', '🛝', '🎨', '🛋️', '🧸', '☕', '🎧', '📱', '📚', '🫧', '🚗', '🍎', '🧩', '🪥', '🥪', '✨'];

export const PlansChangedModal: React.FC = () => {
  const {
    showPlansChangedModal,
    setShowPlansChangedModal,
    plansChanged,
    activatePlansChanged,
    applyPlansChangedToRoutine,
    routines,
    speak,
    setShowCopingToolkit,
  } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form state
  const [selectedRoutineTarget, setSelectedRoutineTarget] = useState<string>('custom');
  const [originalTitle, setOriginalTitle] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [newPlanTitle, setNewPlanTitle] = useState<string>('');
  const [calmingMessage, setCalmingMessage] = useState<string>('');
  const [steps, setSteps] = useState<Array<{ title: string; emoji: string; time?: string }>>([]);
  const [phrases, setPhrases] = useState<string[]>([]);

  // Inputs for adding a step
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepEmoji, setNewStepEmoji] = useState<string>('✨');
  const [newStepTime, setNewStepTime] = useState<string>('');
  const [showIconLibrary, setShowIconLibrary] = useState<boolean>(false);
  const [pickingForStepIndex, setPickingForStepIndex] = useState<number | null>(null);

  // Input for adding a phrase
  const [newPhraseInput, setNewPhraseInput] = useState<string>('');

  // Initialize or reset form state when modal opens or plansChanged changes
  useEffect(() => {
    if (showPlansChangedModal) {
      setOriginalTitle(plansChanged.originalPlanTitle || 'Dentist Appointment at 2:00 PM');
      setReason(plansChanged.reason || 'The dental clinic had to close early today.');
      setNewPlanTitle(plansChanged.newPlanTitle || 'Picnic Lunch & Park Afternoon');
      setCalmingMessage(
        plansChanged.calmingMessage ||
          'It is okay to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.'
      );
      setSteps(
        plansChanged.newSteps && plansChanged.newSteps.length > 0
          ? [...plansChanged.newSteps]
          : [
              { title: 'Favorite pizza lunch at home', emoji: '🍕', time: '12:30 PM' },
              { title: 'Play at the sunny playground swings', emoji: '🛝', time: '1:30 PM' },
              { title: 'Drawing and cozy world building', emoji: '🎨', time: '3:00 PM' },
            ]
      );
      setPhrases(
        plansChanged.relevantPhrases && plansChanged.relevantPhrases.length > 0
          ? [...plansChanged.relevantPhrases]
          : ['Why did it change?', "I'm upset about this.", 'What happens now?', 'Can we go home?', 'I need a quiet break.']
      );

      if (plansChanged.targetRoutineId) {
        if (plansChanged.targetStepId) {
          setSelectedRoutineTarget(`${plansChanged.targetRoutineId}:::${plansChanged.targetStepId}`);
        } else {
          setSelectedRoutineTarget(plansChanged.targetRoutineId);
        }
      } else {
        setSelectedRoutineTarget('custom');
      }
    }
  }, [showPlansChangedModal, plansChanged]);

  if (!showPlansChangedModal) return null;

  const handleRoutineTargetChange = (val: string) => {
    setSelectedRoutineTarget(val);
    if (val === 'custom') {
      return;
    }
    if (val.includes(':::')) {
      const [rId, sId] = val.split(':::');
      const r = routines.find((item) => item.id === rId);
      const st = r?.steps.find((s) => s.id === sId);
      if (st && r) {
        setOriginalTitle(`${r.title}: ${st.title}${st.time ? ` (${st.time})` : ''}`);
      }
    } else {
      const r = routines.find((item) => item.id === val);
      if (r) {
        setOriginalTitle(`${r.title}${r.time ? ` (${r.time})` : ''}`);
      }
    }
  };

  const handleApplyPreset = (preset: typeof REPLACEMENT_PRESETS[0]) => {
    setNewPlanTitle(preset.title);
    setSteps([...preset.steps]);
    setCalmingMessage(preset.calming);
    setPhrases([...preset.phrases]);
    playChime('tap');
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    setSteps([
      ...steps,
      {
        title: newStepTitle.trim(),
        emoji: newStepEmoji || '✨',
        time: newStepTime.trim() || undefined,
      },
    ]);
    setNewStepTitle('');
    setNewStepTime('');
    playChime('tap');
  };

  const handleRemoveStep = (indexToRemove: number) => {
    setSteps(steps.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddPhrase = () => {
    if (!newPhraseInput.trim()) return;
    if (!phrases.includes(newPhraseInput.trim())) {
      setPhrases([...phrases, newPhraseInput.trim()]);
    }
    setNewPhraseInput('');
    playChime('tap');
  };

  const handleRemovePhrase = (phraseToRemove: string) => {
    setPhrases(phrases.filter((p) => p !== phraseToRemove));
  };

  const handleSaveAndApply = () => {
    let targetRoutineId: string | undefined = undefined;
    let targetStepId: string | undefined = undefined;

    if (selectedRoutineTarget !== 'custom') {
      if (selectedRoutineTarget.includes(':::')) {
        const [rId, sId] = selectedRoutineTarget.split(':::');
        targetRoutineId = rId;
        targetStepId = sId;
      } else {
        targetRoutineId = selectedRoutineTarget;
      }
    }

    const updatedData = {
      active: true,
      originalPlanTitle: originalTitle.trim() || 'Original Plan',
      reason: reason.trim() || 'Plans changed today.',
      newPlanTitle: newPlanTitle.trim() || 'Our New Plan',
      calmingMessage:
        calmingMessage.trim() ||
        'It is okay to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.',
      newSteps:
        steps.length > 0
          ? steps
          : [{ title: 'Quiet rest & relaxing at home', emoji: '✨', time: 'Now' }],
      relevantPhrases:
        phrases.length > 0 ? phrases : ['What happens now?', 'I need a quiet break.'],
      targetRoutineId,
      targetStepId,
    };

    activatePlansChanged(updatedData);
    setIsEditing(false);
    playChime('complete');
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] animate-in fade-in duration-200"
      onClick={() => setShowPlansChangedModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col shadow-2xl overflow-hidden border-4 border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-100 px-4 sm:px-6 py-4 border-b border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-900 shadow-2xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-amber-950 truncate">
                  {t('Plans Changed')}
                </h2>
                {isEditing && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0">
                    {t('Editing Mode')}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-amber-800 font-semibold truncate">
                {isEditing
                  ? t('Customize which routine changed and what should be the replacement.')
                  : t('It is okay to feel surprised. Here is what is happening next.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 border ${
                isEditing
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title={isEditing ? t('View Preview') : t('Edit Plan Change')}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('View Preview')}</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('Edit Plan')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPlansChangedModal(false)}
              className="p-2 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 active:scale-95 transition-all cursor-pointer"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {isEditing ? (
            /* ================= EDIT MODE ================= */
            <div className="space-y-6 animate-in fade-in">
              {/* STEP 1: WHICH PART OF THE ROUTINE CHANGED */}
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-black text-amber-950 text-sm sm:text-base">
                    {t('Which part of the routine changed?')}
                  </h3>
                </div>

                {/* Routine Dropdown Selector */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t("Select from today's routine or choose custom:")}</span>
                  </label>
                  <select
                    value={selectedRoutineTarget}
                    onChange={(e) => handleRoutineTargetChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-amber-200 font-bold text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-2xs"
                  >
                    <option value="custom">✍️ {t('Custom event / appointment (type manually)')}</option>
                    {routines.map((routine) => (
                      <optgroup key={routine.id} label={`${routine.emoji} ${routine.title}`}>
                        <option value={routine.id}>
                          {t('Entire Routine:')} {routine.title} {routine.time ? `(${routine.time})` : ''}
                        </option>
                        {routine.steps?.map((step) => (
                          <option key={step.id} value={`${routine.id}:::${step.id}`}>
                            &nbsp;&nbsp;↳ {t('Step:')} {step.emoji} {step.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Original Plan Title Input */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    {t('Original Plan (What is being replaced):')}
                  </label>
                  <input
                    type="text"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder={t('e.g. Dentist Appointment at 2:00 PM')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-2xs"
                  />
                </div>

                {/* Why it changed / Reason */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    {t('What happened / Why it changed:')}
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('e.g. The dental clinic had to close early today.')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-2xs"
                  />

                  {/* Quick Reason Chips */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-amber-900 mr-1">
                      {t('Quick reasons:')}
                    </span>
                    {REASON_PRESETS.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setReason(item.reason);
                          playChime('tap');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-amber-100/90 border border-amber-200 text-slate-800 text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span>{item.icon}</span>
                        <span>{t(item.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 2: WHAT SHOULD BE THE REPLACEMENT */}
              <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-black text-emerald-950 text-sm sm:text-base">
                      {t('What should be the replacement?')}
                    </h3>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-800 hidden sm:inline">
                    {t('Set the new calm schedule')}
                  </span>
                </div>

                {/* Quick 1-Tap Inspiration Presets */}
                <div>
                  <span className="text-xs font-black text-emerald-900 block mb-1.5">
                    {t('Quick replacement ideas (1-tap fill):')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {REPLACEMENT_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplyPreset(preset)}
                        className="p-2.5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all cursor-pointer shadow-2xs active:scale-95 flex items-start gap-2"
                      >
                        <span className="text-xl shrink-0">{preset.steps[0]?.emoji || '✨'}</span>
                        <div className="min-w-0">
                          <span className="font-black text-xs text-slate-900 block truncate">
                            {t(preset.title)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {preset.steps.length} {t('replacement steps')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* New Plan Title */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    {t('New Plan Title:')}
                  </label>
                  <input
                    type="text"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder={t('e.g. Picnic Lunch & Park Afternoon')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-400 outline-none shadow-2xs"
                  />
                </div>

                {/* Steps List Editor */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2">
                    {t('Replacement Steps:')}
                  </label>

                  <div className="space-y-2 mb-3">
                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-white border border-emerald-200 rounded-2xl shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setPickingForStepIndex(idx);
                            setShowIconLibrary(true);
                            playChime('tap');
                          }}
                          className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 transition-all cursor-pointer group"
                          title={t('Click to pick icon from library')}
                        >
                          <RoutineStickerIcon emoji={step.emoji} title={step.title} className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" />
                        </button>

                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[idx].title = e.target.value;
                            setSteps(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800"
                          placeholder={t('Step title')}
                        />

                        <input
                          type="text"
                          value={step.time || ''}
                          onChange={(e) => {
                            const updated = [...steps];
                            updated[idx].time = e.target.value || undefined;
                            setSteps(updated);
                          }}
                          className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 text-center shrink-0"
                          placeholder={t('Time')}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                          title={t('Delete step')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Step Row */}
                  <div className="p-3 bg-white/90 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                      {t('Add New Replacement Step:')}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Interactive Icon Library Picker Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPickingForStepIndex(null);
                          setShowIconLibrary(true);
                          playChime('tap');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 hover:border-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group shrink-0 active:scale-95"
                        title={t('Pick an icon from our icon library')}
                      >
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <RoutineStickerIcon emoji={newStepEmoji || '✨'} title="Selected icon" className="w-6 h-6 object-contain drop-shadow-2xs" />
                        </div>
                        <span className="text-xs font-black text-amber-950">
                          {t('Icon')}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
                      </button>

                      <input
                        type="text"
                        value={newStepTitle}
                        onChange={(e) => setNewStepTitle(e.target.value)}
                        placeholder={t('Step title (e.g. Draw favorite animal in fort)')}
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddStep();
                          }
                        }}
                      />
                      <input
                        type="text"
                        value={newStepTime}
                        onChange={(e) => setNewStepTime(e.target.value)}
                        placeholder={t('Time (optional)')}
                        className="w-28 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-600 shrink-0"
                      />
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('Add Step')}</span>
                      </button>
                    </div>

                    {/* Quick Emoji Picker Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-none">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-1">
                        {t('Quick icons:')}
                      </span>
                      {QUICK_EMOJIS.map((em, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setNewStepEmoji(em)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            newStepEmoji === em
                              ? 'bg-emerald-100 ring-2 ring-emerald-400'
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          {em}
                        </button>
                      ))}

                      {/* Browse full Icon Library button */}
                      <button
                        type="button"
                        onClick={() => {
                          setPickingForStepIndex(null);
                          setShowIconLibrary(true);
                          playChime('tap');
                        }}
                        className="text-[10px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-auto transition-all cursor-pointer border border-amber-300 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{t('Full Icon Library')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calming Message Textarea */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    {t('Reassuring Message for Child:')}
                  </label>
                  <textarea
                    rows={2}
                    value={calmingMessage}
                    onChange={(e) => setCalmingMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-medium text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-400 outline-none shadow-2xs"
                  />
                </div>

                {/* Child Communication Phrases */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {t('Things the child can tap to say:')}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {phrases.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>{phrase}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(phrase)}
                          className="text-emerald-700 hover:text-rose-600 cursor-pointer font-black text-sm ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPhraseInput}
                      onChange={(e) => setNewPhraseInput(e.target.value)}
                      placeholder={t('Add custom phrase (e.g. Can we go tomorrow?)')}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhrase();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddPhrase}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95"
                    >
                      {t('Add Phrase')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= VIEW MODE ================= */
            <div className="space-y-6 animate-in fade-in">
              {/* 1. Comparison Card: Old Plan vs What Changed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Old Plan */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      {t('Original Plan')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="opacity-70 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200/80 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title={t('Edit original plan')}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="text-[10px]">{t('Edit')}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-base">
                    <span className="line-through">{plansChanged.originalPlanTitle}</span>
                  </div>
                </div>

                {/* Why it changed */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-amber-700 uppercase tracking-wider block">
                      {t('What Happened')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="opacity-70 group-hover:opacity-100 p-1 rounded-md hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title={t('Edit reason')}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="text-[10px]">{t('Edit')}</span>
                    </button>
                  </div>
                  <p className="font-bold text-amber-950 text-sm leading-snug">
                    {plansChanged.reason}
                  </p>
                </div>
              </div>

              {/* 2. Empathetic Calming Message */}
              <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 flex items-start gap-3">
                <Heart className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sky-950 text-sm">{t('You are safe')}</h4>
                  <p className="text-xs sm:text-sm text-sky-900 mt-0.5 leading-relaxed font-medium">
                    {plansChanged.calmingMessage}
                  </p>
                </div>
              </div>

              {/* 3. The NEW PLAN */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base sm:text-lg font-black text-slate-800">
                      {t('Our New Plan:')} {plansChanged.newPlanTitle}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('Edit Replacement')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {plansChanged.newSteps?.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl shadow-xs"
                    >
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <RoutineStickerIcon
                        emoji={step.emoji}
                        title={step.title}
                        className="w-8 h-8 object-contain shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-black text-slate-800 text-sm sm:text-base block">
                          {t(step.title)}
                        </span>
                        {step.time && (
                          <span className="text-xs font-bold text-emerald-700">{step.time}</span>
                        )}
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Relevant Communication / Express How I Feel */}
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  {t('Things you can say right now (tap to speak):')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {plansChanged.relevantPhrases?.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => speak(phrase)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4 text-slate-500" />
                      <span>{phrase}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  playChime('tap');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                {t('Cancel')}
              </button>

              <button
                type="button"
                onClick={handleSaveAndApply}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save & Apply Replacement Plan')}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowPlansChangedModal(false);
                  setShowCopingToolkit(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                {t('I need a calm break first')} 🛋️
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    playChime('tap');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border border-amber-300"
                >
                  <Edit3 className="w-4 h-4 text-amber-800" />
                  <span>{t('Edit Plan Change')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    applyPlansChangedToRoutine();
                    setShowPlansChangedModal(false);
                    playChime('complete');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {t('I understand our new plan!')} 👍
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full Icon Library Modal */}
      <IconLibraryModal
        isOpen={showIconLibrary}
        onClose={() => {
          setShowIconLibrary(false);
          setPickingForStepIndex(null);
        }}
        selectedEmoji={pickingForStepIndex !== null ? steps[pickingForStepIndex]?.emoji : newStepEmoji}
        onSelectIcon={(emoji, _label) => {
          if (pickingForStepIndex !== null) {
            const updated = [...steps];
            updated[pickingForStepIndex] = { ...updated[pickingForStepIndex], emoji };
            setSteps(updated);
          } else {
            setNewStepEmoji(emoji);
          }
        }}
      />
    </div>
  );
};
