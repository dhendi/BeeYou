import React, { useState, useMemo } from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { LifeAdventure, AdventureStep } from '../../types';
import {
  Lightbulb,
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
  Ear,
  Hand,
  Clock,
  Users,
  Compass,
  Check,
  Volume2,
  HelpCircle,
  Footprints,
  RotateCcw
} from 'lucide-react';
import { playChime } from '../../utils/audio';
import { RoutineStickerIcon } from '../icons/JournalStickers';
import { IconLibraryModal } from '../common/IconLibraryModal';

const getAdventureSticker = (id: string): string | undefined => {
  if (id === 'adv-dentist') return '/assets/stickers/adventure_dentist.png';
  if (id === 'adv-restaurant') return '/assets/stickers/adventure_restaurant.png';
  if (id === 'adv-haircut') return '/assets/stickers/adventure_haircut.png';
  if (id === 'adv-doctor') return '/assets/stickers/adventure_doctor.png';
  return undefined;
};

const PRESET_CATEGORIES = [
  'Health & Care',
  'Community',
  'School',
  'Home',
  'Travel',
  'Recreation',
  'Social',
];

const QUICK_PHRASE_SUGGESTIONS = [
  'I need a break.',
  'Stop please.',
  'Too loud.',
  'Can I help?',
  'All done.',
  'I want to leave.',
  'Need bathroom.',
  'Can we wait?',
  'That hurts.',
  'I am overwhelmed.',
];

const QUICK_REQUEST_SUGGESTIONS = [
  'Can I wear my headphones?',
  'Can I hold my fidget toy?',
  'Can you tell me what is next?',
  'Can we take a 1-minute pause?',
  'Can I sit down?',
  'Can I have a drink of water?',
];

const ADVENTURE_TEMPLATES = [
  {
    title: 'Supermarket Grocery Run',
    category: 'Community',
    emoji: '🛒',
    summary: 'Navigating grocery shopping: getting a cart, finding items, waiting in line, and paying.',
    steps: [
      { order: 1, title: 'Grab a shopping cart', description: 'Pick a clean cart or basket near the entrance.', emoji: '🛒' },
      { order: 2, title: 'Check our grocery list', description: 'Look at what we need to find today.', emoji: '📋' },
      { order: 3, title: 'Walk down the aisles', description: 'Stay close to our grown-up while finding items.', emoji: '🍎', sensoryTip: 'Aisles may be bright with many colors.' },
      { order: 4, title: 'Wait in checkout line', description: 'Stand calmly while the cashier scans our items.', emoji: '🛋️', sensoryTip: 'Cash register makes rhythmic beeping sounds.' },
      { order: 5, title: 'Help pack bags & head home', description: 'Carry a bag to the car feeling accomplished!', emoji: '🏡' },
    ],
    sensoryPreview: {
      sound: 'Beeping barcode scanners, wheels rolling, and background chatter.',
      light: 'Bright fluorescent supermarket lighting.',
      people: 'Shoppers with carts and cashiers at checkout.',
      waiting: 'Waiting in the checkout queue for 3-5 minutes.',
      touch: 'Cold freezer doors, smooth shopping cart handle.',
    },
    thingsICanSay: ['Can I carry a basket?', 'Too noisy.', 'I need a break.', 'All done.'],
    thingsICanAskFor: ['Can I hold the shopping list?', 'Can I wear my headphones?', 'Can we sit in the car?'],
    whatHappensAfter: 'We unpack groceries at home and enjoy a yummy snack together!',
  },
  {
    title: 'Airport & Airplane Flight',
    category: 'Travel',
    emoji: '✈️',
    summary: 'From ticketing and security lines to boarding the plane and listening to the engines.',
    steps: [
      { order: 1, title: 'Arrive at the airport', description: 'Roll our luggage into the departure terminal.', emoji: '🧳' },
      { order: 2, title: 'Check in bags & get tickets', description: 'Hand over large bags and get boarding passes.', emoji: '🎫' },
      { order: 3, title: 'Airport security checkpoint', description: 'Shoes in bins, walk through the scanner calmly.', emoji: '🛡️', sensoryTip: 'Beeps and conveyor belt sounds.' },
      { order: 4, title: 'Wait at our gate', description: 'Sit comfortably, read books, or listen to music.', emoji: '🛋️' },
      { order: 5, title: 'Board the plane & buckle seatbelt', description: 'Walk down the jetway and find our row.', emoji: '✈️', sensoryTip: 'Cabin air feels cool and fresh.' },
      { order: 6, title: 'Takeoff & relaxing in flight', description: 'Engines rumble and we lift into the sky!', emoji: '☁️' },
    ],
    sensoryPreview: {
      sound: 'Engine hum, PA chime announcements, and wheel luggage clatter.',
      light: 'Large glass terminal windows, airplane cabin reading lights.',
      people: 'Crowds of travelers, flight attendants in uniform.',
      waiting: 'Waiting at the gate for 30-45 minutes before boarding.',
      movement: 'Gentle rumble during takeoff and landing.',
    },
    thingsICanSay: ['My ears feel funny.', 'Can I have water?', 'Are we there yet?', 'I need my headphones.'],
    thingsICanAskFor: ['Can I chew gum for ear pressure?', 'Can I hold my blanket?', 'Can we read a story?'],
    whatHappensAfter: 'We arrive at our destination and celebrate a safe, exciting journey!',
  },
  {
    title: 'Public Library Visit',
    category: 'Community',
    emoji: '📚',
    summary: 'Browsing bookshelves, using quiet library voices, and checking out favorite books.',
    steps: [
      { order: 1, title: 'Enter using quiet feet', description: 'Walk in and remember our gentle library voice.', emoji: '🤫' },
      { order: 2, title: 'Browse children book section', description: 'Look at book covers and pick 2-3 favorites.', emoji: '📖' },
      { order: 3, title: 'Sit in the cozy reading corner', description: 'Flip through pages on soft pillows or rugs.', emoji: '🛋️' },
      { order: 4, title: 'Self-checkout scanner', description: 'Scan our library card and beep each book barcode.', emoji: '⭐' },
      { order: 5, title: 'Pack books into backpack', description: 'Zip up and head home for storytime!', emoji: '🎒' },
    ],
    sensoryPreview: {
      sound: 'Very calm and quiet. Gentle whispering, page turning, and scanner beeps.',
      light: 'Warm natural light from library reading windows.',
      people: 'Friendly librarians and other readers reading quietly.',
      waiting: 'Short 1-2 minute wait at the checkout station.',
      touch: 'Smooth paper pages, soft beanbag chairs.',
    },
    thingsICanSay: ['Look at this book!', 'Can I check this out?', 'I want to read here.', 'Where is the bathroom?'],
    thingsICanAskFor: ['Can you help me find dinosaur books?', 'Can we check out 3 books?'],
    whatHappensAfter: 'We take our new books home and read them together in our cozy fort!',
  },
];

interface CaregiverAdventuresTabProps {
  onShowNotification?: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverAdventuresTab: React.FC<CaregiverAdventuresTabProps> = ({
  onShowNotification,
  onStartTour,
}) => {
  const { adventures, addAdventure, updateAdventure, deleteAdventure, speak } = useApp();

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Expanded card tracking (set of adventure IDs)
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAdventureId, setEditingAdventureId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Community');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formEmoji, setFormEmoji] = useState('🌟');
  const [formSummary, setFormSummary] = useState('');
  const [formSteps, setFormSteps] = useState<AdventureStep[]>([]);
  const [formPhrases, setFormPhrases] = useState<string[]>([]);
  const [formRequests, setFormRequests] = useState<string[]>([]);
  const [formWhatAfter, setFormWhatAfter] = useState('');
  const [formSensorySound, setFormSensorySound] = useState('');
  const [formSensoryLight, setFormSensoryLight] = useState('');
  const [formSensoryPeople, setFormSensoryPeople] = useState('');
  const [formSensoryWaiting, setFormSensoryWaiting] = useState('');
  const [formSensoryTouch, setFormSensoryTouch] = useState('');

  // Inline Step addition inside editor
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepEmoji, setNewStepEmoji] = useState('👣');
  const [newStepSensory, setNewStepSensory] = useState('');

  // Inline Phrase / Request addition inside editor
  const [newPhraseInput, setNewPhraseInput] = useState('');
  const [newRequestInput, setNewRequestInput] = useState('');

  // Direct Inline Step add for an expanded card
  const [inlineCardStepInput, setInlineCardStepInput] = useState<{ [advId: string]: string }>({});
  const [inlineCardPhraseInput, setInlineCardPhraseInput] = useState<{ [advId: string]: string }>({});

  // Icon Library Modal State
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<'adventure' | 'newStep' | number>('adventure');

  // Delete Confirmation Modal State
  const [deletingAdventure, setDeletingAdventure] = useState<LifeAdventure | null>(null);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    playChime('tap');
  };

  // Open Editor for Creating New Adventure
  const handleOpenCreateModal = (template?: typeof ADVENTURE_TEMPLATES[0]) => {
    setEditingAdventureId(null);
    if (template) {
      setFormTitle(template.title);
      setFormCategory(template.category);
      setFormCustomCategory('');
      setFormEmoji(template.emoji);
      setFormSummary(template.summary);
      setFormSteps(template.steps.map((s, idx) => ({ ...s, order: idx + 1 })));
      setFormPhrases([...template.thingsICanSay]);
      setFormRequests([...template.thingsICanAskFor]);
      setFormWhatAfter(template.whatHappensAfter);
      setFormSensorySound(template.sensoryPreview.sound || '');
      setFormSensoryLight(template.sensoryPreview.light || '');
      setFormSensoryPeople(template.sensoryPreview.people || '');
      setFormSensoryWaiting(template.sensoryPreview.waiting || '');
      setFormSensoryTouch(template.sensoryPreview.touch || '');
    } else {
      setFormTitle('');
      setFormCategory('Community');
      setFormCustomCategory('');
      setFormEmoji('🌟');
      setFormSummary('');
      setFormSteps([
        { order: 1, title: 'Get ready & depart', description: 'We pack what we need and head out.', emoji: '🚗' },
        { order: 2, title: 'Arrive calmly', description: 'Take a deep breath as we get there.', emoji: '📍' },
      ]);
      setFormPhrases(['I need a break.', 'Stop please.', 'All done.']);
      setFormRequests(['Can I wear my headphones?', 'Can I hold my fidget toy?']);
      setFormWhatAfter('We head home and celebrate with a relaxing reward!');
      setFormSensorySound('');
      setFormSensoryLight('');
      setFormSensoryPeople('');
      setFormSensoryWaiting('');
      setFormSensoryTouch('');
    }
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepEmoji('👣');
    setNewStepSensory('');
    setNewPhraseInput('');
    setNewRequestInput('');
    setIsEditorOpen(true);
    playChime('tap');
  };

  // Open Editor for Editing Existing Adventure
  const handleOpenEditModal = (adv: LifeAdventure) => {
    setEditingAdventureId(adv.id);
    setFormTitle(adv.title);
    if (PRESET_CATEGORIES.includes(adv.category)) {
      setFormCategory(adv.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('Other');
      setFormCustomCategory(adv.category);
    }
    setFormEmoji(adv.emoji || '🌟');
    setFormSummary(adv.summary || '');
    setFormSteps(adv.steps ? [...adv.steps] : []);
    setFormPhrases(adv.thingsICanSay ? [...adv.thingsICanSay] : []);
    setFormRequests(adv.thingsICanAskFor ? [...adv.thingsICanAskFor] : []);
    setFormWhatAfter(adv.whatHappensAfter || '');
    setFormSensorySound(adv.sensoryPreview?.sound || '');
    setFormSensoryLight(adv.sensoryPreview?.light || '');
    setFormSensoryPeople(adv.sensoryPreview?.people || '');
    setFormSensoryWaiting(adv.sensoryPreview?.waiting || '');
    setFormSensoryTouch(adv.sensoryPreview?.touch || '');
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepEmoji('👣');
    setNewStepSensory('');
    setNewPhraseInput('');
    setNewRequestInput('');
    setIsEditorOpen(true);
    playChime('tap');
  };

  // Duplicate Adventure
  const handleDuplicateAdventure = (adv: LifeAdventure) => {
    const duplicated: Omit<LifeAdventure, 'id'> = {
      title: `${adv.title} (Copy)`,
      category: adv.category,
      emoji: adv.emoji,
      stickerSrc: adv.stickerSrc,
      summary: adv.summary,
      steps: adv.steps.map((s, i) => ({ ...s, order: i + 1 })),
      sensoryPreview: { ...adv.sensoryPreview },
      thingsICanSay: [...adv.thingsICanSay],
      thingsICanAskFor: [...adv.thingsICanAskFor],
      whatHappensAfter: adv.whatHappensAfter,
      isCustom: true,
      completedCount: 0,
    };
    addAdventure(duplicated);
    playChime('star');
    onShowNotification?.(t(`Duplicated "${adv.title}"! Customize it below.`));
  };

  // Save Adventure (Create or Update)
  const handleSaveAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = formTitle.trim();
    if (!finalTitle) {
      alert(t('Please enter an adventure title'));
      return;
    }

    const finalCategory =
      formCategory === 'Other'
        ? formCustomCategory.trim() || 'Community'
        : formCategory;

    // Ensure at least 1 step exists
    const validSteps =
      formSteps.length > 0
        ? formSteps.map((s, idx) => ({ ...s, order: idx + 1 }))
        : [
            {
              order: 1,
              title: t('Arrive and prepare'),
              description: t('Take a moment to get settled.'),
              emoji: formEmoji || '👣',
            },
          ];

    const adventurePayload = {
      title: finalTitle,
      category: finalCategory,
      emoji: formEmoji || '🌟',
      summary: formSummary.trim() || t('An adventure to prepare for real-world situations with sensory confidence.'),
      steps: validSteps,
      sensoryPreview: {
        sound: formSensorySound.trim() || undefined,
        light: formSensoryLight.trim() || undefined,
        people: formSensoryPeople.trim() || undefined,
        waiting: formSensoryWaiting.trim() || undefined,
        touch: formSensoryTouch.trim() || undefined,
      },
      thingsICanSay: formPhrases.filter((p) => p.trim().length > 0),
      thingsICanAskFor: formRequests.filter((r) => r.trim().length > 0),
      whatHappensAfter:
        formWhatAfter.trim() ||
        t('Great job! We finish our adventure and celebrate with a favorite calm activity.'),
    };

    if (editingAdventureId) {
      const existing = adventures.find((a) => a.id === editingAdventureId);
      const updated: LifeAdventure = {
        ...existing,
        ...adventurePayload,
        id: editingAdventureId,
        isCustom: existing?.isCustom ?? true,
        completedCount: existing?.completedCount ?? 0,
      };
      updateAdventure(updated);
      onShowNotification?.(t(`Updated adventure "${finalTitle}"!`));
    } else {
      addAdventure({
        ...adventurePayload,
        isCustom: true,
        completedCount: 0,
      });
      onShowNotification?.(t(`Created new adventure "${finalTitle}"!`));
    }

    setIsEditorOpen(false);
    setEditingAdventureId(null);
    playChime('complete');
  };

  // Delete Adventure Confirmed
  const handleConfirmDelete = () => {
    if (!deletingAdventure) return;
    deleteAdventure(deletingAdventure.id);
    onShowNotification?.(t(`Deleted "${deletingAdventure.title}"`));
    setDeletingAdventure(null);
    playChime('clear');
  };

  // Add Step inside Editor
  const handleAddStepToEditor = () => {
    if (!newStepTitle.trim()) return;
    const newStep: AdventureStep = {
      order: formSteps.length + 1,
      title: newStepTitle.trim(),
      description: newStepDesc.trim() || undefined,
      emoji: newStepEmoji || '👣',
      sensoryTip: newStepSensory.trim() || undefined,
    };
    setFormSteps([...formSteps, newStep]);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepSensory('');
    setNewStepEmoji('👣');
    playChime('tap');
  };

  // Remove Step from Editor
  const handleRemoveStep = (index: number) => {
    setFormSteps(formSteps.filter((_, i) => i !== index));
    playChime('tap');
  };

  // Move Step Up/Down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formSteps.length) return;
    const updated = [...formSteps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormSteps(updated);
    playChime('tap');
  };

  // Add Phrase in Editor
  const handleAddPhraseToEditor = (phraseToAdd?: string) => {
    const text = (phraseToAdd || newPhraseInput).trim();
    if (!text) return;
    if (!formPhrases.includes(text)) {
      setFormPhrases([...formPhrases, text]);
    }
    if (!phraseToAdd) setNewPhraseInput('');
    playChime('tap');
  };

  // Add Request in Editor
  const handleAddRequestToEditor = (requestToAdd?: string) => {
    const text = (requestToAdd || newRequestInput).trim();
    if (!text) return;
    if (!formRequests.includes(text)) {
      setFormRequests([...formRequests, text]);
    }
    if (!requestToAdd) setNewRequestInput('');
    playChime('tap');
  };

  // Direct Inline Step add for an expanded card
  const handleQuickAddStepToCard = (adv: LifeAdventure) => {
    const title = (inlineCardStepInput[adv.id] || '').trim();
    if (!title) return;
    const updatedSteps: AdventureStep[] = [
      ...adv.steps,
      {
        order: adv.steps.length + 1,
        title,
        emoji: '👣',
      },
    ];
    updateAdventure({
      ...adv,
      steps: updatedSteps,
    });
    setInlineCardStepInput({ ...inlineCardStepInput, [adv.id]: '' });
    onShowNotification?.(t(`Added step "${title}" to ${adv.title}!`));
    playChime('tap');
  };

  // Direct Inline Phrase add for an expanded card
  const handleQuickAddPhraseToCard = (adv: LifeAdventure) => {
    const phrase = (inlineCardPhraseInput[adv.id] || '').trim();
    if (!phrase) return;
    if (!adv.thingsICanSay.includes(phrase)) {
      updateAdventure({
        ...adv,
        thingsICanSay: [...adv.thingsICanSay, phrase],
      });
      onShowNotification?.(t(`Added phrase to ${adv.title}!`));
    }
    setInlineCardPhraseInput({ ...inlineCardPhraseInput, [adv.id]: '' });
    playChime('tap');
  };

  // Open Icon Library Picker
  const handleOpenIconPicker = (target: 'adventure' | 'newStep' | number) => {
    setIconPickerTarget(target);
    setIsIconPickerOpen(true);
    playChime('tap');
  };

  // Icon Selected Callback
  const handleSelectIconFromLibrary = (emoji: string) => {
    if (iconPickerTarget === 'adventure') {
      setFormEmoji(emoji);
    } else if (iconPickerTarget === 'newStep') {
      setNewStepEmoji(emoji);
    } else if (typeof iconPickerTarget === 'number') {
      const updated = [...formSteps];
      if (updated[iconPickerTarget]) {
        updated[iconPickerTarget] = { ...updated[iconPickerTarget], emoji };
        setFormSteps(updated);
      }
    }
    setIsIconPickerOpen(false);
    playChime('complete');
  };

  // Filtered Adventures list
  const filteredAdventures = useMemo(() => {
    return adventures.filter((adv) => {
      const matchesCategory =
        selectedCategoryFilter === 'All'
          ? true
          : selectedCategoryFilter === 'Custom'
          ? adv.isCustom === true
          : adv.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = adv.title.toLowerCase().includes(q);
      const inCategory = adv.category.toLowerCase().includes(q);
      const inSummary = adv.summary?.toLowerCase().includes(q);
      const inPhrases = adv.thingsICanSay?.some((p) => p.toLowerCase().includes(q));
      const inSteps = adv.steps?.some((s) => s.title.toLowerCase().includes(q));

      return inTitle || inCategory || inSummary || inPhrases || inSteps;
    });
  }, [adventures, selectedCategoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{t("Life Adventures & Contextual AAC")}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px]">
              {adventures.length} {t("Adventures")}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Prepare for real-world situations with sensory guides, item steps, and automatic contextual phrase suggestions.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-teal-700" />
              <span>{t("How This Works")}</span>
            </button>
          )}

          {/* ADD NEW ADVENTURE BUTTON */}
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 border-2 border-amber-500 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t("Add New Adventure")}</span>
          </button>
        </div>
      </div>

      {/* QUICK TEMPLATES INSPIRATION BANNER */}
      <div className="bg-linear-to-r from-amber-50 via-teal-50/60 to-purple-50 border-2 border-amber-200/80 rounded-2xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {t("Quick-Start Starter Templates:")}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {t("One-click to customize & add")}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ADVENTURE_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenCreateModal(tmpl)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200/70 text-left transition-all hover:scale-[1.01] active:scale-95 shadow-2xs cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <RoutineStickerIcon emoji={tmpl.emoji} title={tmpl.title} className="w-7 h-7 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-black text-xs text-slate-800 block truncate group-hover:text-amber-950">
                  {tmpl.title}
                </span>
                <span className="text-[11px] font-bold text-teal-700 block">
                  {tmpl.steps.length} {t("steps")} • {tmpl.category}
                </span>
              </div>
              <Plus className="w-3.5 h-3.5 text-amber-700 opacity-60 group-hover:opacity-100 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTER ROW */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search adventures, phrases, or steps...")}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Health & Care', 'Community', 'Travel', 'Custom'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategoryFilter(cat);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold'
              }`}
            >
              {cat === 'Custom' ? `⭐ ${t("Custom")}` : t(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* ADVENTURES LIST */}
      <div data-tour="adventures-list-card" className="space-y-3">
        {filteredAdventures.length === 0 ? (
          <div className="p-8 bg-white border-2 border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-800">{t("No adventures found")}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {searchQuery
                  ? t("No matches for your search query. Try clearing filters.")
                  : t("Add your first custom adventure or start from one of our templates above.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("Create New Adventure")}</span>
            </button>
          </div>
        ) : (
          filteredAdventures.map((adv, i) => {
            const stickerPath = adv.stickerSrc || getAdventureSticker(adv.id);
            const isExpanded = expandedCardIds.has(adv.id);

            return (
              <div
                key={adv.id}
                className="p-4 sm:p-5 bg-white border-2 border-slate-200 hover:border-amber-300 rounded-2xl sm:rounded-3xl flex flex-col gap-3 transition-colors shadow-2xs"
              >
                {/* TOP HEADER OF CARD */}
                <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3.5">
                    {/* Adventure Icon */}
                    <div className="w-13 h-13 rounded-2xl bg-amber-50/70 border border-amber-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      {stickerPath ? (
                        <img
                          src={stickerPath}
                          alt={adv.title}
                          className="w-full h-full object-contain drop-shadow-2xs select-none pointer-events-none"
                        />
                      ) : (
                        <RoutineStickerIcon
                          emoji={adv.emoji}
                          title={adv.title}
                          className="w-10 h-10 object-contain drop-shadow-2xs"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-800 text-base sm:text-lg">{adv.title}</h4>
                        {adv.isCustom && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[10px] uppercase tracking-wider">
                            {t("Custom")}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-100">
                          {adv.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {adv.summary}
                      </p>
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {adv.steps.length} {t("steps")}
                    </span>

                    {/* EDIT BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(adv)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                      title={t("Edit this adventure")}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t("Edit")}</span>
                    </button>

                    {/* DUPLICATE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateAdventure(adv)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                      title={t("Duplicate / copy this adventure")}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t("Copy")}</span>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setDeletingAdventure(adv)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 font-bold text-xs transition active:scale-95 cursor-pointer"
                      title={t("Delete this adventure")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* EXPAND/COLLAPSE TOGGLE */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(adv.id)}
                      className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                        isExpanded ? 'bg-amber-100 text-amber-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={isExpanded ? t("Hide details") : t("Show steps and details")}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span className="text-xs font-black">{isExpanded ? t("Less") : t("Details")}</span>
                    </button>
                  </div>
                </div>

                {/* CONTEXTUAL AAC PHRASES PREVIEW (ALWAYS VISIBLE) */}
                <div
                  data-tour={i === 0 ? "adventures-phrases-card" : undefined}
                  className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-teal-700 shrink-0" />
                      <span>{t("Contextual AAC Phrases surfaced during this adventure:")}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {adv.thingsICanSay.length} {t("phrases")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {adv.thingsICanSay.map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => speak(phrase)}
                        className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        title={t("Tap to hear phrase")}
                      >
                        <Volume2 className="w-3 h-3 text-teal-700 shrink-0" />
                        <span>{phrase}</span>
                      </button>
                    ))}
                    {adv.thingsICanSay.length === 0 && (
                      <span className="text-xs text-slate-400 italic">
                        {t("No contextual phrases added yet.")}
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED SECTION: STEP-BY-STEP BREAKDOWN, SENSORY TIPS, REWARD */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                    {/* STEPS LIST */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                          <Footprints className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t("Step-by-Step Breakdown:")}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {adv.steps.length} {t("items")}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {adv.steps.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs"
                          >
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                              <RoutineStickerIcon emoji={st.emoji} title={st.title} className="w-6 h-6 object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-black text-slate-800 text-xs sm:text-sm block">
                                {st.title}
                              </span>
                              {st.description && (
                                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed font-medium">
                                  {st.description}
                                </p>
                              )}
                              {st.sensoryTip && (
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 w-fit">
                                  <Ear className="w-3 h-3 text-sky-600 shrink-0" />
                                  <span>{st.sensoryTip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* QUICK ADD STEP INLINE ON CARD */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={inlineCardStepInput[adv.id] || ''}
                          onChange={(e) =>
                            setInlineCardStepInput({
                              ...inlineCardStepInput,
                              [adv.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickAddStepToCard(adv);
                            }
                          }}
                          placeholder={t("Quick add new step (e.g. Put items on register)...")}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAddStepToCard(adv)}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t("Add Step")}</span>
                        </button>
                      </div>
                    </div>

                    {/* SENSORY GUIDE PREVIEW */}
                    {adv.sensoryPreview && (
                      <div>
                        <span className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
                          {t("Sensory Expectations:")}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {adv.sensoryPreview.sound && (
                            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2">
                              <Ear className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-sky-950 block">{t("Sound")}</span>
                                <p className="text-sky-900 font-medium text-[11px] leading-relaxed">
                                  {adv.sensoryPreview.sound}
                                </p>
                              </div>
                            </div>
                          )}
                          {adv.sensoryPreview.light && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                              <Eye className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-amber-950 block">{t("Lighting")}</span>
                                <p className="text-amber-900 font-medium text-[11px] leading-relaxed">
                                  {adv.sensoryPreview.light}
                                </p>
                              </div>
                            </div>
                          )}
                          {adv.sensoryPreview.people && (
                            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2">
                              <Users className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-teal-950 block">{t("People")}</span>
                                <p className="text-teal-900 font-medium text-[11px] leading-relaxed">
                                  {adv.sensoryPreview.people}
                                </p>
                              </div>
                            </div>
                          )}
                          {adv.sensoryPreview.waiting && (
                            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-2">
                              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-purple-950 block">{t("Waiting")}</span>
                                <p className="text-purple-900 font-medium text-[11px] leading-relaxed">
                                  {adv.sensoryPreview.waiting}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* THINGS I CAN ASK FOR */}
                    {adv.thingsICanAskFor && adv.thingsICanAskFor.length > 0 && (
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                        <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block mb-1">
                          {t("Things I Can Ask For:")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {adv.thingsICanAskFor.map((req, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs"
                            >
                              🙋 {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WHAT HAPPENS AFTER */}
                    {adv.whatHappensAfter && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-emerald-950 block">
                            {t("What Happens Afterward (Reassurance / Reward):")}
                          </span>
                          <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                            {adv.whatHappensAfter}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADVENTURE CREATOR / EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-3 border-amber-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-linear-to-r from-amber-50/80 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                  <RoutineStickerIcon emoji={formEmoji} title={formTitle || 'Adventure Icon'} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    {editingAdventureId ? t("Edit Life Adventure") : t("Create New Life Adventure")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("Customize steps, contextual AAC phrases, sensory tips, and rewards.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <form onSubmit={handleSaveAdventure} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* SECTION 1: BASICS */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">
                  {t("1. Adventure Details")}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      {t("Adventure Title:")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder={t("e.g. Going to the Grocery Store")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {/* Icon Picker Button */}
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      {t("Icon / Sticker:")}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenIconPicker('adventure')}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs group active:scale-95"
                    >
                      <RoutineStickerIcon emoji={formEmoji} title="Selected Icon" className="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-amber-950">{t("Change Icon")}</span>
                      <Star className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    {t("Category:")}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          formCategory === cat
                            ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormCategory('Other')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        formCategory === 'Other'
                          ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t("Custom...")}
                    </button>
                  </div>

                  {formCategory === 'Other' && (
                    <input
                      type="text"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder={t("Enter custom category name (e.g. Vacation, Sports, Hobbies)")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  )}
                </div>

                {/* Summary */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    {t("Summary / Overview:")}
                  </label>
                  <textarea
                    rows={2}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder={t("Short description of what happens during this adventure...")}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* SECTION 2: STEPS BREAKDOWN */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    {t("2. Step-by-Step Breakdown (Items)")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {formSteps.length} {t("steps")}
                  </span>
                </div>

                {/* List of current steps */}
                <div className="space-y-2">
                  {formSteps.map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 mt-1">
                        {sIdx + 1}
                      </span>

                      {/* Step Icon Picker button */}
                      <button
                        type="button"
                        onClick={() => handleOpenIconPicker(sIdx)}
                        className="w-8 h-8 rounded-xl bg-white hover:bg-amber-100/80 border border-slate-200 hover:border-amber-300 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer shadow-2xs group"
                        title={t("Click to change step icon")}
                      >
                        <RoutineStickerIcon emoji={st.emoji} title={st.title} className="w-6 h-6 object-contain group-hover:scale-105" />
                      </button>

                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                            setFormSteps(updated);
                          }}
                          placeholder={t("Step title")}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <input
                          type="text"
                          value={st.description || ''}
                          onChange={(e) => {
                            const updated = [...formSteps];
                            updated[sIdx] = { ...updated[sIdx], description: e.target.value };
                            setFormSteps(updated);
                          }}
                          placeholder={t("Description (optional)")}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-medium text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>

                      {/* Move & Delete */}
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => handleMoveStep(sIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === formSteps.length - 1}
                          onClick={() => handleMoveStep(sIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(sIdx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Step Row */}
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block">
                    {t("Add Next Step:")}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenIconPicker('newStep')}
                      className="w-9 h-9 rounded-xl bg-white border border-amber-300 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:bg-amber-100"
                      title={t("Pick step icon")}
                    >
                      <RoutineStickerIcon emoji={newStepEmoji} title="Step Icon" className="w-6 h-6 object-contain" />
                    </button>
                    <input
                      type="text"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      placeholder={t("Step name (e.g. Wait in line at counter)")}
                      className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-white border border-amber-200 font-bold text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                      type="text"
                      value={newStepDesc}
                      onChange={(e) => setNewStepDesc(e.target.value)}
                      placeholder={t("Instruction (optional)")}
                      className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddStepToEditor}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t("Add Step")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CONTEXTUAL AAC PHRASES */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">
                  {t("3. Contextual AAC Phrases ('Things I Can Say')")}
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  {t("These phrases automatically surface in the child's AAC board when playing or viewing this adventure.")}
                </p>

                {/* Current Phrases */}
                <div className="flex flex-wrap gap-1.5 min-h-8">
                  {formPhrases.map((phrase, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3 h-3 text-teal-700 shrink-0" />
                      <span>{phrase}</span>
                      <button
                        type="button"
                        onClick={() => setFormPhrases(formPhrases.filter((_, i) => i !== pIdx))}
                        className="text-teal-700 hover:text-rose-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formPhrases.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      {t("No phrases added yet.")}
                    </span>
                  )}
                </div>

                {/* Add Custom Phrase Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPhraseInput}
                    onChange={(e) => setNewPhraseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPhraseToEditor();
                      }
                    }}
                    placeholder={t("Add a custom phrase (e.g. Can you please wait?)...")}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPhraseToEditor()}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("Add")}</span>
                  </button>
                </div>

                {/* Quick Phrase Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    {t("Quick Suggestions (Click to add):")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PHRASE_SUGGESTIONS.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddPhraseToEditor(sug)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 font-bold text-[11px] transition cursor-pointer border border-transparent hover:border-teal-200"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: THINGS I CAN ASK FOR */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">
                  {t("4. Things I Can Ask For (Requests & Accommodation)")}
                </span>

                <div className="flex flex-wrap gap-1.5 min-h-8">
                  {formRequests.map((req, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>🙋 {req}</span>
                      <button
                        type="button"
                        onClick={() => setFormRequests(formRequests.filter((_, i) => i !== rIdx))}
                        className="text-amber-800 hover:text-rose-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formRequests.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      {t("No requests added yet.")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRequestInput}
                    onChange={(e) => setNewRequestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequestToEditor();
                      }
                    }}
                    placeholder={t("Add a request (e.g. Can I wear my sunglasses?)...")}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddRequestToEditor()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("Add")}</span>
                  </button>
                </div>

                {/* Quick Request Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    {t("Quick Suggestions (Click to add):")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REQUEST_SUGGESTIONS.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleAddRequestToEditor(sug)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-600 font-bold text-[11px] transition cursor-pointer border border-transparent hover:border-amber-200"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 5: SENSORY PREVIEW GUIDE */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">
                  {t("5. Sensory Guide (Optional Previews)")}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1 mb-1">
                      <Ear className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t("Sound Expectations:")}</span>
                    </label>
                    <input
                      type="text"
                      value={formSensorySound}
                      onChange={(e) => setFormSensorySound(e.target.value)}
                      placeholder={t("e.g. Loud register beeps and chatter")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1 mb-1">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("Lighting Expectations:")}</span>
                    </label>
                    <input
                      type="text"
                      value={formSensoryLight}
                      onChange={(e) => setFormSensoryLight(e.target.value)}
                      placeholder={t("e.g. Bright overhead fluorescent lights")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1 mb-1">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t("People / Crowds:")}</span>
                    </label>
                    <input
                      type="text"
                      value={formSensoryPeople}
                      onChange={(e) => setFormSensoryPeople(e.target.value)}
                      placeholder={t("e.g. Friendly cashier and shoppers")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{t("Waiting Time:")}</span>
                    </label>
                    <input
                      type="text"
                      value={formSensoryWaiting}
                      onChange={(e) => setFormSensoryWaiting(e.target.value)}
                      placeholder={t("e.g. Waiting 3-5 minutes in line")}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: WHAT HAPPENS AFTER */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">
                  {t("6. Reassurance & Reward (What Happens After)")}
                </span>
                <input
                  type="text"
                  value={formWhatAfter}
                  onChange={(e) => setFormWhatAfter(e.target.value)}
                  placeholder={t("e.g. We head home and enjoy a yummy snack together!")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingAdventureId ? t("Save Changes") : t("Create Adventure")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ICON LIBRARY MODAL */}
      <IconLibraryModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIconFromLibrary}
        selectedEmoji={
          iconPickerTarget === 'adventure'
            ? formEmoji
            : iconPickerTarget === 'newStep'
            ? newStepEmoji
            : typeof iconPickerTarget === 'number' && formSteps[iconPickerTarget]
            ? formSteps[iconPickerTarget].emoji
            : undefined
        }
        title={t("BeeYou Icon Library")}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAdventure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-2 border-rose-300 p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {t("Delete Adventure?")}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {t("Are you sure you want to delete")} <span className="font-black text-slate-800">"{deletingAdventure.title}"</span>? {t("This action cannot be undone.")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAdventure(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-xs active:scale-95 cursor-pointer"
              >
                {t("Yes, Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
