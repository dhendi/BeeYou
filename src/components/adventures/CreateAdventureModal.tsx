import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LifeAdventure, AdventureStep } from '../../types';
import { t } from '../../services/translator';
import { playChime } from '../../utils/audio';
import { RoutineStickerIcon } from '../icons/JournalStickers';
import { IconLibraryModal } from '../common/IconLibraryModal';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Volume2,
  Ear,
  Eye,
  Hand,
  Clock,
  Compass,
  Smile,
  Check,
  RotateCcw
} from 'lucide-react';

export interface CreateAdventureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdventure?: LifeAdventure | null;
}

const PRESET_CATEGORIES = [
  'Community',
  'Health & Care',
  'School',
  'Home',
  'Travel',
  'Recreation',
  'Social',
  'Other'
];

const QUICK_STARTER_ADVENTURES = [
  {
    title: 'Visiting the Public Library',
    category: 'Community',
    emoji: '📚',
    summary: 'Browsing quiet bookshelves, picking favorite books, and checking out with our library card.',
    steps: [
      { order: 1, title: 'Enter quietly with walking feet', description: 'Hold grown-up\'s hand and use our indoor whisper voice.', emoji: '🚪', sensoryTip: 'Soft whispers, turning pages, carpeted quiet floors.' },
      { order: 2, title: 'Explore the children\'s book area', description: 'Gently look at picture books and choose 2 or 3 favorites.', emoji: '📖' },
      { order: 3, title: 'Wait at checkout desk', description: 'Stand calmly while the librarian scans our book barcodes.', emoji: '💳', sensoryTip: 'Friendly quiet beeps as each book is scanned.' },
      { order: 4, title: 'Pack books in our tote bag', description: 'Carefully zip our bag and say thank you to the librarian.', emoji: '🎒' },
    ],
    thingsICanSay: ['Can I read this book?', 'I need a quiet break.', 'Where is the bathroom?', 'All done.'],
    thingsICanAskFor: ['Can I hold the library card?', 'Can we sit in the cozy reading corner?'],
    whatHappensAfter: 'We walk home safely and snuggle up to read our new story together!',
    sensoryPreview: {
      sound: 'Whisper-quiet atmosphere with soft page rustling.',
      light: 'Warm natural light from large reading windows.',
      people: 'A few quiet readers and a friendly librarian.',
      waiting: 'Waiting in line at checkout for 1-2 minutes.',
    }
  },
  {
    title: 'Trip to the Playground & Park',
    category: 'Recreation',
    emoji: '🛝',
    summary: 'Playing on the slides and swings, taking turns with friends, and drinking fresh water.',
    steps: [
      { order: 1, title: 'Walk to the playground', description: 'Look both ways and stay on the path until we reach the park gate.', emoji: '👟' },
      { order: 2, title: 'Pick our first play area', description: 'Choose whether we want to climb, slide, or swing first.', emoji: '🛝' },
      { order: 3, title: 'Take turns with friends', description: 'If someone is on the swing, count to 10 or ask: "Can I have a turn next?"', emoji: '🤝' },
      { order: 4, title: 'Drink water and rest in shade', description: 'Sit on the park bench for a quick sip of cool water.', emoji: '🥤' },
      { order: 5, title: 'Pack up and say goodbye to park', description: 'Wash our hands or use wipes, then head back home happily.', emoji: '🏡' },
    ],
    thingsICanSay: ['My turn please?', 'Can we play on the swings?', 'I am thirsty.', 'I need to sit down.'],
    thingsICanAskFor: ['Can you push me on the swing?', 'Can I hold my water bottle?'],
    whatHappensAfter: 'We head home, wash our hands, and enjoy a relaxing quiet playtime!',
    sensoryPreview: {
      sound: 'Children laughing, birds chirping, gentle breeze.',
      light: 'Bright outdoor sunshine. Sunglasses or a sunhat can help.',
      touch: 'Smooth plastic slides, cool metal chains on swings, soft woodchips underfoot.',
    }
  },
  {
    title: 'Supermarket Grocery Run',
    category: 'Community',
    emoji: '🛒',
    summary: 'Navigating grocery shopping: getting a cart, finding items, waiting in line, and paying.',
    steps: [
      { order: 1, title: 'Grab a shopping cart or basket', description: 'Pick a clean cart near the entrance and stay close to our grown-up.', emoji: '🛒' },
      { order: 2, title: 'Check our grocery list', description: 'Look at the items we need to find today.', emoji: '📋' },
      { order: 3, title: 'Walk down the aisles', description: 'Look for healthy snacks and help put items into the cart.', emoji: '🍎', sensoryTip: 'Aisles are colorful with many labels and cool refrigerator fans.' },
      { order: 4, title: 'Wait in checkout line', description: 'Stand calmly while the cashier scans our items.', emoji: '🛋️', sensoryTip: 'Rhythmic beeping sounds at the scanner.' },
      { order: 5, title: 'Carry a bag home', description: 'Help carry a light grocery bag feeling proud of our teamwork!', emoji: '🏡' },
    ],
    thingsICanSay: ['Can I hold the list?', 'Too loud.', 'I need a break.', 'All done.'],
    thingsICanAskFor: ['Can I wear my headphones?', 'Can I help carry the basket?'],
    whatHappensAfter: 'We unpack groceries at home and enjoy a yummy snack together!',
    sensoryPreview: {
      sound: 'Beeping barcode scanners, cart wheels rolling, background music.',
      light: 'Bright overhead fluorescent supermarket lighting.',
      people: 'Other shoppers and cashiers at the front register.',
      waiting: 'Waiting in line at the register for 2-4 minutes.',
    }
  }
];

export const CreateAdventureModal: React.FC<CreateAdventureModalProps> = ({
  isOpen,
  onClose,
  initialAdventure
}) => {
  const { addAdventure, updateAdventure, activeTheme } = useApp();

  const isEditing = !!initialAdventure;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Community');
  const [customCategory, setCustomCategory] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [summary, setSummary] = useState('');
  const [steps, setSteps] = useState<AdventureStep[]>([]);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [requests, setRequests] = useState<string[]>([]);
  const [whatHappensAfter, setWhatHappensAfter] = useState('');

  // Sensory guide
  const [sensorySound, setSensorySound] = useState('');
  const [sensoryLight, setSensoryLight] = useState('');
  const [sensoryPeople, setSensoryPeople] = useState('');
  const [sensoryWaiting, setSensoryWaiting] = useState('');
  const [sensoryTouch, setSensoryTouch] = useState('');

  // Step inputs
  const [newPhraseInput, setNewPhraseInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basics' | 'steps' | 'phrases' | 'sensory'>('basics');

  // Icon Library Modal
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<'adventure' | number>('adventure');

  useEffect(() => {
    if (initialAdventure) {
      setTitle(initialAdventure.title || '');
      if (PRESET_CATEGORIES.includes(initialAdventure.category)) {
        setCategory(initialAdventure.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(initialAdventure.category || '');
      }
      setEmoji(initialAdventure.emoji || '🌟');
      setSummary(initialAdventure.summary || '');
      setSteps(
        initialAdventure.steps && initialAdventure.steps.length > 0
          ? initialAdventure.steps.map((s, idx) => ({ ...s, order: idx + 1 }))
          : [
              { order: 1, title: 'Get ready & depart', description: 'Pack what we need and head out calmly.', emoji: '🚗' },
              { order: 2, title: 'Arrive calmly', description: 'Take a deep breath and look around.', emoji: '📍' },
            ]
      );
      setPhrases([...(initialAdventure.thingsICanSay || [])]);
      setRequests([...(initialAdventure.thingsICanAskFor || [])]);
      setWhatHappensAfter(initialAdventure.whatHappensAfter || '');
      setSensorySound(initialAdventure.sensoryPreview?.sound || '');
      setSensoryLight(initialAdventure.sensoryPreview?.light || '');
      setSensoryPeople(initialAdventure.sensoryPreview?.people || '');
      setSensoryWaiting(initialAdventure.sensoryPreview?.waiting || '');
      setSensoryTouch(initialAdventure.sensoryPreview?.touch || '');
    } else {
      // Default clean template
      setTitle('');
      setCategory('Community');
      setCustomCategory('');
      setEmoji('🌟');
      setSummary('');
      setSteps([
        { order: 1, title: 'Get ready & depart', description: 'Pack what we need and head out calmly.', emoji: '🚗' },
        { order: 2, title: 'Arrive calmly & look around', description: 'Take a deep breath as we get there.', emoji: '📍' },
        { order: 3, title: 'Follow our steps together', description: 'Take our time and stay with our grown-up.', emoji: '🤝' },
        { order: 4, title: 'All done and return home', description: 'Celebrate completing our adventure!', emoji: '🏡' },
      ]);
      setPhrases(['I need a break.', 'Can I help?', 'Too loud.', 'All done.']);
      setRequests(['Can I wear my headphones?', 'Can I hold my fidget toy?']);
      setWhatHappensAfter('We head home and celebrate with a relaxing reward!');
      setSensorySound('');
      setSensoryLight('');
      setSensoryPeople('');
      setSensoryWaiting('');
      setSensoryTouch('');
    }
    setActiveTab('basics');
  }, [initialAdventure, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof QUICK_STARTER_ADVENTURES[0]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setCustomCategory('');
    setEmoji(tmpl.emoji);
    setSummary(tmpl.summary);
    setSteps(tmpl.steps.map((s, idx) => ({ ...s, order: idx + 1 })));
    setPhrases([...tmpl.thingsICanSay]);
    setRequests([...tmpl.thingsICanAskFor]);
    setWhatHappensAfter(tmpl.whatHappensAfter);
    setSensorySound(tmpl.sensoryPreview.sound || '');
    setSensoryLight(tmpl.sensoryPreview.light || '');
    setSensoryPeople(tmpl.sensoryPreview.people || '');
    setSensoryWaiting(tmpl.sensoryPreview.waiting || '');
    setSensoryTouch(tmpl.sensoryPreview.touch || '');
    playChime('tap');
  };

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        order: prev.length + 1,
        title: `Step ${prev.length + 1}`,
        description: 'Describe what to do in this step.',
        emoji: '👣',
      },
    ]);
    playChime('tap');
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) =>
      prev.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }))
    );
    playChime('tap');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSteps(updated.map((s, idx) => ({ ...s, order: idx + 1 })));
    playChime('tap');
  };

  const handleStepChange = (index: number, field: keyof AdventureStep, value: string) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  const handleAddPhrase = () => {
    if (!newPhraseInput.trim()) return;
    setPhrases((prev) => [...prev, newPhraseInput.trim()]);
    setNewPhraseInput('');
    playChime('tap');
  };

  const handleRemovePhrase = (idx: number) => {
    setPhrases((prev) => prev.filter((_, i) => i !== idx));
    playChime('tap');
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert(t('Please enter a title for this adventure.'));
      return;
    }
    if (steps.length === 0) {
      alert(t('Please add at least one step for this adventure.'));
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    const sensoryPreview: LifeAdventure['sensoryPreview'] = {};
    if (sensorySound.trim()) sensoryPreview.sound = sensorySound.trim();
    if (sensoryLight.trim()) sensoryPreview.light = sensoryLight.trim();
    if (sensoryPeople.trim()) sensoryPreview.people = sensoryPeople.trim();
    if (sensoryWaiting.trim()) sensoryPreview.waiting = sensoryWaiting.trim();
    if (sensoryTouch.trim()) sensoryPreview.touch = sensoryTouch.trim();

    if (isEditing && initialAdventure) {
      const updated: LifeAdventure = {
        ...initialAdventure,
        title: title.trim(),
        category: finalCategory,
        emoji,
        summary: summary.trim(),
        steps,
        thingsICanSay: phrases,
        thingsICanAskFor: requests,
        whatHappensAfter: whatHappensAfter.trim(),
        sensoryPreview,
        isCustom: true,
      };
      updateAdventure(updated);
    } else {
      const newAdv: Omit<LifeAdventure, 'id'> = {
        title: title.trim(),
        category: finalCategory,
        emoji,
        summary: summary.trim(),
        steps,
        thingsICanSay: phrases,
        thingsICanAskFor: requests,
        whatHappensAfter: whatHappensAfter.trim(),
        sensoryPreview,
        isCustom: true,
      };
      addAdventure(newAdv);
    }

    playChime('star');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-3 border-amber-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl shadow-2xs">
              <RoutineStickerIcon emoji={emoji} title={title || 'Adventure'} className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isEditing ? t('Edit Life Adventure') : t('Create New Life Adventure')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('Design visual steps, sensory expectations, and communication phrases')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basics'
                ? 'bg-white text-amber-900 border-t-2 border-x-2 border-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {t('Basics & Icon')}
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'bg-white text-amber-900 border-t-2 border-x-2 border-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {t('Steps')} ({steps.length})
          </button>
          <button
            onClick={() => setActiveTab('phrases')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'phrases'
                ? 'bg-white text-amber-900 border-t-2 border-x-2 border-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {t('Things I Can Say')} ({phrases.length})
          </button>
          <button
            onClick={() => setActiveTab('sensory')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sensory'
                ? 'bg-white text-amber-900 border-t-2 border-x-2 border-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {t('Sensory & After')}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-5">
              {!isEditing && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 mb-2 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{t('Need inspiration? Choose a quick starter:')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {QUICK_STARTER_ADVENTURES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="text-left p-2.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 transition text-xs font-bold text-slate-800 shadow-2xs active:scale-98 cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-lg">{tmpl.emoji}</span>
                        <span className="line-clamp-1">{tmpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Icon Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <label className="text-xs font-black text-slate-700">{t('Cover Icon')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerTarget('adventure');
                      setIsIconPickerOpen(true);
                    }}
                    className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-300 hover:border-amber-400 flex flex-col items-center justify-center p-2 shadow-2xs transition active:scale-95 cursor-pointer group"
                    title={t('Click to change sticker or emoji')}
                  >
                    <RoutineStickerIcon emoji={emoji} title={title || 'Icon'} className="w-12 h-12 object-contain" />
                    <span className="text-[10px] font-bold text-amber-700 mt-0.5 group-hover:underline">
                      {t('Change')}
                    </span>
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      {t('Adventure Title')} *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('e.g. Going to the Public Library, Visiting the Zoo...')}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black text-slate-700 block mb-1">
                        {t('Category')}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800 bg-white"
                      >
                        {PRESET_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(cat)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {category === 'Other' && (
                      <div>
                        <label className="text-xs font-black text-slate-700 block mb-1">
                          {t('Custom Category Name')}
                        </label>
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder={t('e.g. Nature, Outing')}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {t('Summary & What to Expect')}
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('A short warm overview of what this adventure is about and what will happen.')}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {t('Visual Step-by-Step Sequence')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Add sequential steps so the child knows exactly what comes next.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add Step')}</span>
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerTarget(idx);
                            setIsIconPickerOpen(true);
                          }}
                          className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-amber-400 flex items-center justify-center shadow-2xs transition cursor-pointer"
                          title={t('Change icon')}
                        >
                          <RoutineStickerIcon emoji={step.emoji} className="w-6 h-6 object-contain" />
                        </button>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                          placeholder={t('Step title')}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-black text-slate-800 bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === steps.length - 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          disabled={steps.length <= 1}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        placeholder={t('Description of what happens during this step')}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-700 bg-white"
                      />
                      <input
                        type="text"
                        value={step.sensoryTip || ''}
                        onChange={(e) => handleStepChange(idx, 'sensoryTip', e.target.value)}
                        placeholder={t('Optional sensory tip (e.g. loud sounds, bright lights)')}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-600 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PHRASES */}
          {activeTab === 'phrases' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {t('Contextual AAC Communication Phrases')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('Phrases the child can tap or speak aloud during this adventure.')}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPhraseInput}
                  onChange={(e) => setNewPhraseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPhrase();
                    }
                  }}
                  placeholder={t('Add a useful phrase (e.g. "I need a break.", "Can I hold this?")')}
                  className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddPhrase}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition active:scale-95 cursor-pointer"
                >
                  {t('Add')}
                </button>
              </div>

              {/* Phrase Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {phrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-950 font-bold text-xs"
                  >
                    <span>"{phrase}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhrase(idx)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="pt-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  {t('Quick Suggestions:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'I need a break.',
                    'Too loud.',
                    'Can I help?',
                    'Stop please.',
                    'Can I have a drink?',
                    'Where is the restroom?',
                    'All done.',
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!phrases.includes(sugg)) setPhrases((prev) => [...prev, sugg]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      + "{sugg}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SENSORY & AFTER */}
          {activeTab === 'sensory' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {t('Sensory Preview & Transition Home')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('Anticipate sounds, lights, waiting, and what comforting thing happens afterwards.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1">
                    <Ear className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Sounds to Expect')}</span>
                  </label>
                  <input
                    type="text"
                    value={sensorySound}
                    onChange={(e) => setSensorySound(e.target.value)}
                    placeholder={t('e.g. Whirring fans, barcode beeps, chatter')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Lights & Visuals')}</span>
                  </label>
                  <input
                    type="text"
                    value={sensoryLight}
                    onChange={(e) => setSensoryLight(e.target.value)}
                    placeholder={t('e.g. Bright fluorescent lights, sunglasses helpful')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Waiting Expectations')}</span>
                  </label>
                  <input
                    type="text"
                    value={sensoryWaiting}
                    onChange={(e) => setSensoryWaiting(e.target.value)}
                    placeholder={t('e.g. 2-5 minutes in line at the register')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1">
                    <Hand className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('Touch & Textures')}</span>
                  </label>
                  <input
                    type="text"
                    value={sensoryTouch}
                    onChange={(e) => setSensoryTouch(e.target.value)}
                    placeholder={t('e.g. Cold cart handle, smooth book pages')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {t('What Happens Afterwards (Comforting Reward)')}
                </label>
                <textarea
                  rows={2}
                  value={whatHappensAfter}
                  onChange={(e) => setWhatHappensAfter(e.target.value)}
                  placeholder={t('e.g. We head home safely and enjoy a calming snack together!')}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? t('Save Changes') : t('Create Adventure')}</span>
          </button>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <IconLibraryModal
          isOpen={isIconPickerOpen}
          onClose={() => setIsIconPickerOpen(false)}
          onSelectIcon={(selectedEmoji) => {
            if (iconPickerTarget === 'adventure') {
              setEmoji(selectedEmoji);
            } else if (typeof iconPickerTarget === 'number') {
              handleStepChange(iconPickerTarget, 'emoji', selectedEmoji);
            }
            setIsIconPickerOpen(false);
          }}
          selectedEmoji={
            iconPickerTarget === 'adventure'
              ? emoji
              : typeof iconPickerTarget === 'number'
              ? steps[iconPickerTarget]?.emoji
              : undefined
          }
          title={t('Select Icon or Sticker')}
        />
      )}
    </div>
  );
};
