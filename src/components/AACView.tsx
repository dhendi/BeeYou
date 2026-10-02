import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AACCategory, AACItem } from '../types';
import { getThemedAacEmoji } from '../data/themesData';
import { AACTileArt } from './AACTileArt';
import { resolveAacImageUrl } from '../services/arasaacService';
import { AACSymbolPickerModal } from './AACSymbolPickerModal';
import { AACWordEditorModal } from './AACWordEditorModal';
import { 
  Volume2, 
  Trash2, 
  Delete, 
  BookmarkPlus, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Palette,
  Keyboard,
  MapPin,
  Globe,
  X,
  Heart,
  Plus,
  Edit3,
  Zap,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const AACView: React.FC = () => {
  const {
    aacItems,
    sentence,
    addToSentence,
    speakSentence,
    clearSentence,
    removeLastFromSentence,
    saveSentenceAsQuickPhrase,
    settings,
    updateSettings,
    plansChanged,
    adventures,
    speak,
    isSpeaking,
    stopSpeaking,
    isOffline,
    activeTheme,
    setShowThemeModal,
    aacActiveScene,
    setAacActiveScene,
    setShowAacKeyboardModal,
    addAacItem,
    updateAacItem,
    toggleAacFavorite,
    deleteAacItem,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<AACCategory | 'all'>('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<AACItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [instantSpeakMode, setInstantSpeakMode] = useState(false);
  const [isSentenceBarCollapsed, setIsSentenceBarCollapsed] = useState(false);

  // Contextual phrases detection
  const isDentistDay = true;
  const dentistAdventure = adventures.find((a) => a.id === 'adv-dentist');

  const categories: { id: AACCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'favorites', label: 'Favorites', emoji: '❤️' },
    { id: 'core', label: 'Core Words', emoji: '⭐' },
    { id: 'all', label: 'All Words', emoji: '🌐' },
    { id: 'food', label: 'Food', emoji: '🍕' },
    { id: 'drinks', label: 'Drinks', emoji: '🧃' },
    { id: 'activities', label: 'Play & Fun', emoji: '🎮' },
    { id: 'places', label: 'Places', emoji: '🏠' },
    { id: 'people', label: 'People', emoji: '👥' },
    { id: 'feelings', label: 'Feelings', emoji: '💛' },
    { id: 'sensory', label: 'Sensory', emoji: '🎧' },
  ];

  // Filter items while keeping consistent motor planning order (sorted by motorIndex)
  const filteredItems = aacItems
    .filter((item) => {
      if (searchQuery.trim()) {
        return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (activeCategory === 'favorites') {
        return item.isFavorite === true || item.category === 'favorites';
      }
      if (activeCategory === 'all') return true;
      if (activeCategory === 'core') return item.category === 'core';
      return item.category === activeCategory;
    })
    .sort((a, b) => a.motorIndex - b.motorIndex);

  // Styling based on AAC Button Color Mode: Fitzgerald Key (default) vs Theme Tinted vs High Contrast White vs Neutral Monochrome
  const getColorStyles = (colorType: AACItem['colorType']) => {
    const mode = settings.aacButtonColorMode || 'fitzgerald';

    if (settings.colorCodingEnabled === false || mode === 'neutral_monochrome') {
      if (colorType === 'emergency') {
        return 'bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300 ring-rose-400 font-bold';
      }
      return 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 ring-slate-300';
    }

    if (mode === 'theme') {
      if (colorType === 'emergency') {
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300 ring-rose-400 font-black';
      }
      const primaryLight = activeTheme?.palette?.primaryLight || 'bg-slate-50';
      const primaryBorder = activeTheme?.palette?.primaryBorder || 'border-slate-300';
      const textAccent = activeTheme?.palette?.textAccent || 'text-slate-950';
      return `${primaryLight} hover:brightness-95 ${textAccent} ${primaryBorder} ring-slate-400`;
    }

    if (mode === 'high_contrast_white') {
      if (colorType === 'emergency') {
        return 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-rose-600 font-black';
      }
      return 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-900';
    }

    // Default: Soft Low-Sensory Fitzgerald Key standard
    switch (colorType) {
      case 'subject':
        return 'bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-200/90 ring-amber-300';
      case 'verb':
        return 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border-emerald-200/90 ring-emerald-300';
      case 'noun':
        return 'bg-orange-50 hover:bg-orange-100/80 text-orange-950 border-orange-200/90 ring-orange-300';
      case 'adjective':
        return 'bg-sky-50 hover:bg-sky-100/80 text-sky-950 border-sky-200/90 ring-sky-300';
      case 'social':
        return 'bg-purple-50 hover:bg-purple-100/80 text-purple-950 border-purple-200/90 ring-purple-300';
      case 'emergency':
        return 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300 ring-rose-400 font-black';
      default:
        return 'bg-slate-50 hover:bg-slate-100/80 text-slate-900 border-slate-200 ring-slate-300';
    }
  };

  // Context Scene Switcher data with comprehensive situational vocabulary
  const AAC_SCENES: Array<{ 
    id: string; 
    label: string; 
    emoji: string; 
    description: string;
    phrases: string[]; 
    items: AACItem[];
  }> = [
    {
      id: 'doctor',
      label: 'Doctor / Clinic',
      emoji: '🏥',
      description: 'Hospital, doctor visits, symptoms, body parts, and comfort',
      phrases: [
        'This hurts right here.',
        'I am scared and need comfort.',
        'Please be gentle with me.',
        'Can my caregiver stay with me?',
        'I need a sensory break.',
        'I do not want a shot.',
        'My tummy hurts.',
        'I have a headache.',
        'I need to use the restroom.',
        'How much longer will this take?'
      ],
      items: [
        { id: 'sc-doc-1', label: 'Doctor', speechText: 'Doctor', emoji: '👩‍⚕️', category: 'people', colorType: 'subject', motorIndex: 1 },
        { id: 'sc-doc-2', label: 'Nurse', speechText: 'Nurse', emoji: '👨‍⚕️', category: 'people', colorType: 'subject', motorIndex: 2 },
        { id: 'sc-doc-3', label: 'Mom / Dad', speechText: 'I want my caregiver with me', emoji: '👩', category: 'people', colorType: 'subject', motorIndex: 3 },
        { id: 'sc-doc-4', label: 'Hurt / Pain', speechText: 'This hurts', emoji: '🤕', category: 'feelings', colorType: 'emergency', motorIndex: 4 },
        { id: 'sc-doc-5', label: 'Tummy', speechText: 'My tummy hurts', emoji: '🤰', category: 'feelings', colorType: 'noun', motorIndex: 5 },
        { id: 'sc-doc-6', label: 'Head', speechText: 'My head hurts', emoji: '💆', category: 'feelings', colorType: 'noun', motorIndex: 6 },
        { id: 'sc-doc-7', label: 'Throat', speechText: 'My throat hurts', emoji: '😮', category: 'feelings', colorType: 'noun', motorIndex: 7 },
        { id: 'sc-doc-8', label: 'Ear', speechText: 'My ear hurts', emoji: '👂', category: 'feelings', colorType: 'noun', motorIndex: 8 },
        { id: 'sc-doc-9', label: 'Stethoscope', speechText: 'Listen to my heart with stethoscope', emoji: '🩺', category: 'personal', colorType: 'noun', motorIndex: 9 },
        { id: 'sc-doc-10', label: 'Medicine', speechText: 'I need my medicine', emoji: '💊', category: 'personal', colorType: 'noun', motorIndex: 10 },
        { id: 'sc-doc-11', label: 'Bandage', speechText: 'I need a bandaid bandage', emoji: '🩹', category: 'personal', colorType: 'noun', motorIndex: 11 },
        { id: 'sc-doc-12', label: 'Shot / Vaccine', speechText: 'I am worried about getting a shot', emoji: '💉', category: 'personal', colorType: 'emergency', motorIndex: 12 },
        { id: 'sc-doc-13', label: 'Hot / Fever', speechText: 'I feel hot and have a fever', emoji: '🌡️', category: 'feelings', colorType: 'adjective', motorIndex: 13 },
        { id: 'sc-doc-14', label: 'Cold / Chills', speechText: 'I feel cold and shivering', emoji: '🥶', category: 'feelings', colorType: 'adjective', motorIndex: 14 },
        { id: 'sc-doc-15', label: 'Scared', speechText: 'I feel scared', emoji: '😨', category: 'feelings', colorType: 'emergency', motorIndex: 15 },
        { id: 'sc-doc-16', label: 'Gentle Please', speechText: 'Please be gentle', emoji: '🤲', category: 'core', colorType: 'social', motorIndex: 16 },
        { id: 'sc-doc-17', label: 'Breathe', speechText: 'Take a deep breath', emoji: '🫁', category: 'actions', colorType: 'verb', motorIndex: 17 },
        { id: 'sc-doc-18', label: 'Open Mouth', speechText: 'Open mouth wide', emoji: '👄', category: 'actions', colorType: 'verb', motorIndex: 18 },
        { id: 'sc-doc-19', label: 'Need a Break', speechText: 'I need to pause and take a break', emoji: '🧘', category: 'sensory', colorType: 'emergency', motorIndex: 19 },
        { id: 'sc-doc-20', label: 'Restroom', speechText: 'I need to use the bathroom', emoji: '🚽', category: 'places', colorType: 'noun', motorIndex: 20 },
        { id: 'sc-doc-21', label: 'Help', speechText: 'Please help me', emoji: '🆘', category: 'core', colorType: 'emergency', motorIndex: 21 },
        { id: 'sc-doc-22', label: 'All Done', speechText: 'Are we all done now?', emoji: '✅', category: 'core', colorType: 'adjective', motorIndex: 22 },
        { id: 'sc-doc-23', label: 'Water', speechText: 'Can I have a sip of water', emoji: '💧', category: 'drinks', colorType: 'noun', motorIndex: 23 },
        { id: 'sc-doc-24', label: 'Thank You', speechText: 'Thank you doctor', emoji: '🙏', category: 'core', colorType: 'social', motorIndex: 24 },
      ]
    },
    {
      id: 'school',
      label: 'School',
      emoji: '🏫',
      description: 'Classroom tools, learning tasks, teachers, and recess',
      phrases: [
        'I need help with my work.',
        'I do not understand.',
        'May I go to the restroom?',
        'I need a sensory quiet break.',
        'Can you please repeat that?',
        'It is my turn now.',
        'Can I have a drink of water?',
        'I am finished with my task.',
        'The classroom is too loud.',
        'I am ready for recess.'
      ],
      items: [
        { id: 'sc-sch-1', label: 'Teacher', speechText: 'Teacher', emoji: '🧑‍🏫', category: 'people', colorType: 'subject', motorIndex: 1 },
        { id: 'sc-sch-2', label: 'Friend', speechText: 'My friend and classmate', emoji: '🤝', category: 'people', colorType: 'subject', motorIndex: 2 },
        { id: 'sc-sch-3', label: 'Help Me', speechText: 'I need help please', emoji: '🆘', category: 'core', colorType: 'emergency', motorIndex: 3 },
        { id: 'sc-sch-4', label: 'Raise Hand', speechText: 'I am raising my hand with an answer', emoji: '🙋', category: 'actions', colorType: 'verb', motorIndex: 4 },
        { id: 'sc-sch-5', label: 'Read', speechText: 'Read a book', emoji: '📖', category: 'activities', colorType: 'verb', motorIndex: 5 },
        { id: 'sc-sch-6', label: 'Write', speechText: 'Write with pencil', emoji: '✏️', category: 'activities', colorType: 'verb', motorIndex: 6 },
        { id: 'sc-sch-7', label: 'Draw / Color', speechText: 'Draw and color pictures', emoji: '🖍️', category: 'activities', colorType: 'verb', motorIndex: 7 },
        { id: 'sc-sch-8', label: 'Scissors', speechText: 'Cut paper with scissors', emoji: '✂️', category: 'activities', colorType: 'noun', motorIndex: 8 },
        { id: 'sc-sch-9', label: 'Book', speechText: 'School book', emoji: '📚', category: 'activities', colorType: 'noun', motorIndex: 9 },
        { id: 'sc-sch-10', label: 'Desk', speechText: 'Sit at my desk', emoji: '🪑', category: 'places', colorType: 'noun', motorIndex: 10 },
        { id: 'sc-sch-11', label: 'Backpack', speechText: 'My school backpack', emoji: '🎒', category: 'personal', colorType: 'noun', motorIndex: 11 },
        { id: 'sc-sch-12', label: 'iPad / Tablet', speechText: 'Use my tablet device', emoji: '📱', category: 'activities', colorType: 'noun', motorIndex: 12 },
        { id: 'sc-sch-13', label: 'Circle Time', speechText: 'Circle time on rug', emoji: '⭕', category: 'activities', colorType: 'noun', motorIndex: 13 },
        { id: 'sc-sch-14', label: 'Recess', speechText: 'Recess play outside', emoji: '🛝', category: 'activities', colorType: 'verb', motorIndex: 14 },
        { id: 'sc-sch-15', label: 'Lunch / Snack', speechText: 'Time for lunch and snack', emoji: '🥪', category: 'food', colorType: 'noun', motorIndex: 15 },
        { id: 'sc-sch-16', label: 'Water', speechText: 'Water fountain drink', emoji: '💧', category: 'drinks', colorType: 'noun', motorIndex: 16 },
        { id: 'sc-sch-17', label: 'Quiet Please', speechText: 'Please keep it quiet', emoji: '🤫', category: 'sensory', colorType: 'social', motorIndex: 17 },
        { id: 'sc-sch-18', label: 'My Turn', speechText: 'It is my turn', emoji: '👉', category: 'core', colorType: 'social', motorIndex: 18 },
        { id: 'sc-sch-19', label: 'Your Turn', speechText: 'It is your turn', emoji: '👈', category: 'core', colorType: 'social', motorIndex: 19 },
        { id: 'sc-sch-20', label: 'Sensory Break', speechText: 'I need a sensory headphone break', emoji: '🎧', category: 'sensory', colorType: 'emergency', motorIndex: 20 },
        { id: 'sc-sch-21', label: 'Restroom', speechText: 'May I go to the bathroom', emoji: '🚽', category: 'places', colorType: 'noun', motorIndex: 21 },
        { id: 'sc-sch-22', label: 'Finished', speechText: 'I am all finished with my work', emoji: '✅', category: 'core', colorType: 'adjective', motorIndex: 22 },
        { id: 'sc-sch-23', label: 'Good Job', speechText: 'Good job!', emoji: '⭐', category: 'core', colorType: 'social', motorIndex: 23 },
        { id: 'sc-sch-24', label: 'Go Home', speechText: 'Time to go home on the bus', emoji: '🚌', category: 'places', colorType: 'noun', motorIndex: 24 },
      ]
    },
    {
      id: 'restaurant',
      label: 'Restaurant',
      emoji: '🍽️',
      description: 'Ordering food, drinks, and dining out vocabulary',
      phrases: [
        'Can I have the menu please?',
        'I would like pizza.',
        'Can I have water with ice?',
        'This food is delicious.',
        'I need a break.',
        'Can we sit somewhere quieter?',
        'I need to use the restroom.',
        'Can I have the check please?',
        'Thank you for the food.',
        'I am all done eating.'
      ],
      items: [
        { id: 'sc-rest-1', label: 'I Want', speechText: 'I want', emoji: '🙋', category: 'actions', colorType: 'subject', motorIndex: 1 },
        { id: 'sc-rest-2', label: 'Order', speechText: 'I would like to order', emoji: '🗣️', category: 'actions', colorType: 'verb', motorIndex: 2 },
        { id: 'sc-rest-3', label: 'Eat', speechText: 'Eat food', emoji: '🍽️', category: 'actions', colorType: 'verb', motorIndex: 3 },
        { id: 'sc-rest-4', label: 'Drink', speechText: 'Drink', emoji: '🥤', category: 'drinks', colorType: 'verb', motorIndex: 4 },
        { id: 'sc-rest-5', label: 'Water', speechText: 'Can I have water please', emoji: '💧', category: 'drinks', colorType: 'noun', motorIndex: 5 },
        { id: 'sc-rest-6', label: 'Juice', speechText: 'Can I have juice', emoji: '🧃', category: 'drinks', colorType: 'noun', motorIndex: 6 },
        { id: 'sc-rest-7', label: 'Menu', speechText: 'Can I see the menu', emoji: '📜', category: 'food', colorType: 'noun', motorIndex: 7 },
        { id: 'sc-rest-8', label: 'Pizza', speechText: 'I want pizza', emoji: '🍕', category: 'food', colorType: 'noun', motorIndex: 8 },
        { id: 'sc-rest-9', label: 'Burger', speechText: 'I want a burger', emoji: '🍔', category: 'food', colorType: 'noun', motorIndex: 9 },
        { id: 'sc-rest-10', label: 'Fries', speechText: 'I want french fries', emoji: '🍟', category: 'food', colorType: 'noun', motorIndex: 10 },
        { id: 'sc-rest-11', label: 'Nuggets', speechText: 'I want chicken nuggets', emoji: '🍗', category: 'food', colorType: 'noun', motorIndex: 11 },
        { id: 'sc-rest-12', label: 'Pasta', speechText: 'I want pasta noodles', emoji: '🍝', category: 'food', colorType: 'noun', motorIndex: 12 },
        { id: 'sc-rest-13', label: 'Ice Cream', speechText: 'I want ice cream dessert', emoji: '🍨', category: 'food', colorType: 'noun', motorIndex: 13 },
        { id: 'sc-rest-14', label: 'Fork & Spoon', speechText: 'I need a fork and spoon', emoji: '🍴', category: 'food', colorType: 'noun', motorIndex: 14 },
        { id: 'sc-rest-15', label: 'Napkin', speechText: 'I need a napkin', emoji: '🧻', category: 'personal', colorType: 'noun', motorIndex: 15 },
        { id: 'sc-rest-16', label: 'Bill / Check', speechText: 'Can we get the check please', emoji: '🧾', category: 'personal', colorType: 'noun', motorIndex: 16 },
        { id: 'sc-rest-17', label: 'Yummy', speechText: 'This is yummy and delicious', emoji: '😋', category: 'feelings', colorType: 'adjective', motorIndex: 17 },
        { id: 'sc-rest-18', label: 'More Please', speechText: 'Can I have more please', emoji: '🤲', category: 'core', colorType: 'social', motorIndex: 18 },
        { id: 'sc-rest-19', label: 'Thank You', speechText: 'Thank you very much', emoji: '🙏', category: 'core', colorType: 'social', motorIndex: 19 },
        { id: 'sc-rest-20', label: 'All Done', speechText: 'I am all done eating', emoji: '✋', category: 'core', colorType: 'adjective', motorIndex: 20 },
        { id: 'sc-rest-21', label: 'Too Loud', speechText: 'It is too loud in here', emoji: '🔊', category: 'sensory', colorType: 'emergency', motorIndex: 21 },
        { id: 'sc-rest-22', label: 'Restroom', speechText: 'I need to use the restroom', emoji: '🚽', category: 'places', colorType: 'noun', motorIndex: 22 },
        { id: 'sc-rest-23', label: 'Take Home Box', speechText: 'Can we take this home in a box', emoji: '🥡', category: 'food', colorType: 'noun', motorIndex: 23 },
        { id: 'sc-rest-24', label: 'Go Home', speechText: 'I am ready to go home', emoji: '🏠', category: 'places', colorType: 'verb', motorIndex: 24 },
      ]
    },
    {
      id: 'car',
      label: 'Car Trip',
      emoji: '🚗',
      description: 'Vehicle controls, comfort, motion sickness, and stops',
      phrases: [
        'Are we there yet?',
        'I need to stop for the bathroom.',
        'I feel sick to my tummy.',
        'Can we turn on music?',
        'Can you open the window?',
        'It is too hot in the car.',
        'It is too cold in the car.',
        'How much longer will it take?',
        'Can I have a snack?',
        'I am tired and want to sleep.'
      ],
      items: [
        { id: 'sc-car-1', label: 'Seatbelt', speechText: 'Buckle my seatbelt', emoji: '💺', category: 'personal', colorType: 'noun', motorIndex: 1 },
        { id: 'sc-car-2', label: 'Window', speechText: 'Open the car window', emoji: '🪟', category: 'personal', colorType: 'noun', motorIndex: 2 },
        { id: 'sc-car-3', label: 'Music', speechText: 'Play my favorite music', emoji: '🎵', category: 'activities', colorType: 'noun', motorIndex: 3 },
        { id: 'sc-car-4', label: 'Drive', speechText: 'Drive the car', emoji: '🚗', category: 'actions', colorType: 'noun', motorIndex: 4 },
        { id: 'sc-car-5', label: 'Stop', speechText: 'Please stop the car', emoji: '🛑', category: 'core', colorType: 'emergency', motorIndex: 5 },
        { id: 'sc-car-6', label: 'Go', speechText: 'Keep going', emoji: '🟢', category: 'core', colorType: 'verb', motorIndex: 6 },
        { id: 'sc-car-7', label: 'Are We There?', speechText: 'Are we there yet?', emoji: '🗺️', category: 'core', colorType: 'social', motorIndex: 7 },
        { id: 'sc-car-8', label: 'Cold Air', speechText: 'Turn on the cold air AC', emoji: '❄️', category: 'sensory', colorType: 'verb', motorIndex: 8 },
        { id: 'sc-car-9', label: 'Heater', speechText: 'Turn on the warm heater', emoji: '🔥', category: 'sensory', colorType: 'verb', motorIndex: 9 },
        { id: 'sc-car-10', label: 'Snack', speechText: 'Can I have a car snack', emoji: '🥨', category: 'food', colorType: 'noun', motorIndex: 10 },
        { id: 'sc-car-11', label: 'Water', speechText: 'Can I have my water bottle', emoji: '💧', category: 'drinks', colorType: 'noun', motorIndex: 11 },
        { id: 'sc-car-12', label: 'Car Sick', speechText: 'I feel nauseous and car sick', emoji: '🤢', category: 'feelings', colorType: 'emergency', motorIndex: 12 },
        { id: 'sc-car-13', label: 'Bathroom Stop', speechText: 'I need a restroom stop right away', emoji: '🚻', category: 'places', colorType: 'emergency', motorIndex: 13 },
        { id: 'sc-car-14', label: 'Headphones', speechText: 'I want my headphones', emoji: '🎧', category: 'sensory', colorType: 'noun', motorIndex: 14 },
        { id: 'sc-car-15', label: 'Look Outside', speechText: 'Look out the window', emoji: '👀', category: 'actions', colorType: 'verb', motorIndex: 15 },
        { id: 'sc-car-16', label: 'Sleep / Nap', speechText: 'I am taking a nap', emoji: '😴', category: 'feelings', colorType: 'verb', motorIndex: 16 },
        { id: 'sc-car-17', label: 'Too Long', speechText: 'This drive is taking too long', emoji: '⏳', category: 'feelings', colorType: 'adjective', motorIndex: 17 },
        { id: 'sc-car-18', label: 'Happy', speechText: 'I am enjoying the drive', emoji: '😊', category: 'feelings', colorType: 'adjective', motorIndex: 18 },
        { id: 'sc-car-19', label: 'Arrived', speechText: 'We arrived! We are here!', emoji: '🏁', category: 'places', colorType: 'adjective', motorIndex: 19 },
        { id: 'sc-car-20', label: 'Open Door', speechText: 'Please open my car door', emoji: '🚪', category: 'actions', colorType: 'verb', motorIndex: 20 },
        { id: 'sc-car-21', label: 'Park', speechText: 'Park the car', emoji: '🅿️', category: 'places', colorType: 'verb', motorIndex: 21 },
        { id: 'sc-car-22', label: 'Too Bumpy', speechText: 'The road is too bumpy', emoji: '📳', category: 'sensory', colorType: 'adjective', motorIndex: 22 },
        { id: 'sc-car-23', label: 'Tablet / Video', speechText: 'Can I watch a video on tablet', emoji: '📱', category: 'activities', colorType: 'noun', motorIndex: 23 },
        { id: 'sc-car-24', label: 'Thank You', speechText: 'Thank you for driving', emoji: '🙏', category: 'core', colorType: 'social', motorIndex: 24 },
      ]
    },
    {
      id: 'playground',
      label: 'Playground',
      emoji: '🛝',
      description: 'Outdoor play equipment, turn taking, friends, and safety',
      phrases: [
        'Can I play on the slide?',
        'Can you push me on the swing?',
        'It is my turn now.',
        'Stop that please, I do not like it.',
        'I fell down and need help.',
        'Can I have a drink of water?',
        'I am hot from playing.',
        'Let us play tag together.',
        'I am ready to go home.',
        'This is so much fun!'
      ],
      items: [
        { id: 'sc-play-1', label: 'Slide', speechText: 'Go down the slide', emoji: '🛝', category: 'activities', colorType: 'noun', motorIndex: 1 },
        { id: 'sc-play-2', label: 'Swing', speechText: 'Push me on the swing', emoji: '🎪', category: 'activities', colorType: 'noun', motorIndex: 2 },
        { id: 'sc-play-3', label: 'Sandbox', speechText: 'Play in the sandbox', emoji: '🏖️', category: 'activities', colorType: 'noun', motorIndex: 3 },
        { id: 'sc-play-4', label: 'Climb', speechText: 'Climb the playground ladder', emoji: '🧗', category: 'activities', colorType: 'verb', motorIndex: 4 },
        { id: 'sc-play-5', label: 'Run', speechText: 'Run around the grass', emoji: '🏃', category: 'actions', colorType: 'verb', motorIndex: 5 },
        { id: 'sc-play-6', label: 'Ball', speechText: 'Throw and catch the ball', emoji: '⚽', category: 'activities', colorType: 'noun', motorIndex: 6 },
        { id: 'sc-play-7', label: 'Tag Game', speechText: 'Let us play tag chase', emoji: '🏃‍♂️', category: 'activities', colorType: 'verb', motorIndex: 7 },
        { id: 'sc-play-8', label: 'My Turn', speechText: 'It is my turn to play', emoji: '🙋', category: 'core', colorType: 'social', motorIndex: 8 },
        { id: 'sc-play-9', label: 'Your Turn', speechText: 'It is your turn to go', emoji: '👉', category: 'core', colorType: 'social', motorIndex: 9 },
        { id: 'sc-play-10', label: 'Push Me', speechText: 'Please push me higher', emoji: '🤲', category: 'actions', colorType: 'verb', motorIndex: 10 },
        { id: 'sc-play-11', label: 'High Up', speechText: 'So high up in the air', emoji: '⬆️', category: 'core', colorType: 'adjective', motorIndex: 11 },
        { id: 'sc-play-12', label: 'Fast', speechText: 'Going super fast', emoji: '⏩', category: 'core', colorType: 'adjective', motorIndex: 12 },
        { id: 'sc-play-13', label: 'Careful', speechText: 'Be careful and safe', emoji: '⚠️', category: 'core', colorType: 'emergency', motorIndex: 13 },
        { id: 'sc-play-14', label: 'Water Break', speechText: 'I need a water break', emoji: '💧', category: 'drinks', colorType: 'noun', motorIndex: 14 },
        { id: 'sc-play-15', label: 'Snack', speechText: 'Time for park snack', emoji: '🍎', category: 'food', colorType: 'noun', motorIndex: 15 },
        { id: 'sc-play-16', label: 'Hot Sun', speechText: 'It is very sunny and hot', emoji: '☀️', category: 'sensory', colorType: 'adjective', motorIndex: 16 },
        { id: 'sc-play-17', label: 'Hurt / Fell', speechText: 'I fell down and hurt myself', emoji: '🤕', category: 'feelings', colorType: 'emergency', motorIndex: 17 },
        { id: 'sc-play-18', label: 'Help Please', speechText: 'Help me please', emoji: '🛟', category: 'core', colorType: 'emergency', motorIndex: 18 },
        { id: 'sc-play-19', label: 'Friends', speechText: 'Playing with my friends', emoji: '👥', category: 'people', colorType: 'subject', motorIndex: 19 },
        { id: 'sc-play-20', label: 'Go Home', speechText: 'I am ready to go home now', emoji: '🏠', category: 'places', colorType: 'verb', motorIndex: 20 },
        { id: 'sc-play-21', label: 'Sit Down', speechText: 'Sit on the park bench', emoji: '🪑', category: 'actions', colorType: 'verb', motorIndex: 21 },
        { id: 'sc-play-22', label: 'Fun!', speechText: 'This is so much fun!', emoji: '🎉', category: 'feelings', colorType: 'social', motorIndex: 22 },
        { id: 'sc-play-23', label: 'Restroom', speechText: 'I need the park bathroom', emoji: '🚽', category: 'places', colorType: 'noun', motorIndex: 23 },
        { id: 'sc-play-24', label: 'All Done', speechText: 'All done playing', emoji: '✅', category: 'core', colorType: 'adjective', motorIndex: 24 },
      ]
    },
    {
      id: 'store',
      label: 'Store',
      emoji: '🛒',
      description: 'Grocery shopping, buying items, paying, and waiting',
      phrases: [
        'Can I push the shopping cart?',
        'Can we buy this please?',
        'I want to look at the toys.',
        'It is too crowded and loud.',
        'How much does this cost?',
        'Can I hold the basket?',
        'I am tired of waiting in line.',
        'I need to use the restroom.',
        'Can I help scan the items?',
        'Are we ready to pay and leave?'
      ],
      items: [
        { id: 'sc-sto-1', label: 'Shopping Cart', speechText: 'Push the shopping cart', emoji: '🛒', category: 'personal', colorType: 'noun', motorIndex: 1 },
        { id: 'sc-sto-2', label: 'Buy / Pay', speechText: 'Buy and pay for items', emoji: '💳', category: 'actions', colorType: 'verb', motorIndex: 2 },
        { id: 'sc-sto-3', label: 'Money', speechText: 'Pay with money', emoji: '💵', category: 'personal', colorType: 'noun', motorIndex: 3 },
        { id: 'sc-sto-4', label: 'Snacks', speechText: 'I want to pick a snack', emoji: '🍪', category: 'food', colorType: 'noun', motorIndex: 4 },
        { id: 'sc-sto-5', label: 'Fruit / Apples', speechText: 'Fresh fruit and apples', emoji: '🍎', category: 'food', colorType: 'noun', motorIndex: 5 },
        { id: 'sc-sto-6', label: 'Milk', speechText: 'Get milk from the dairy fridge', emoji: '🥛', category: 'drinks', colorType: 'noun', motorIndex: 6 },
        { id: 'sc-sto-7', label: 'Bread', speechText: 'Loaf of bread', emoji: '🍞', category: 'food', colorType: 'noun', motorIndex: 7 },
        { id: 'sc-sto-8', label: 'Toy', speechText: 'Can I look at the toy aisle?', emoji: '🧸', category: 'activities', colorType: 'noun', motorIndex: 8 },
        { id: 'sc-sto-9', label: 'Look / See', speechText: 'Look at the shelves', emoji: '👀', category: 'actions', colorType: 'verb', motorIndex: 9 },
        { id: 'sc-sto-10', label: 'Hold Item', speechText: 'Can I hold this item in my hands?', emoji: '🤲', category: 'actions', colorType: 'verb', motorIndex: 10 },
        { id: 'sc-sto-11', label: 'Can I Have?', speechText: 'Can I please have this?', emoji: '🙋', category: 'core', colorType: 'social', motorIndex: 11 },
        { id: 'sc-sto-12', label: 'Too Crowded', speechText: 'The store is too crowded and overwhelming', emoji: '👥', category: 'sensory', colorType: 'emergency', motorIndex: 12 },
        { id: 'sc-sto-13', label: 'Wait in Line', speechText: 'Waiting patiently in checkout line', emoji: '⏳', category: 'actions', colorType: 'verb', motorIndex: 13 },
        { id: 'sc-sto-14', label: 'Bag', speechText: 'Put items in the grocery bag', emoji: '🛍️', category: 'personal', colorType: 'noun', motorIndex: 14 },
        { id: 'sc-sto-15', label: 'Help', speechText: 'Need help finding something', emoji: '🆘', category: 'core', colorType: 'emergency', motorIndex: 15 },
        { id: 'sc-sto-16', label: 'Restroom', speechText: 'Where is the store restroom?', emoji: '🚽', category: 'places', colorType: 'noun', motorIndex: 16 },
        { id: 'sc-sto-17', label: 'All Done', speechText: 'We are all finished shopping', emoji: '✅', category: 'core', colorType: 'adjective', motorIndex: 17 },
        { id: 'sc-sto-18', label: 'Leave Store', speechText: 'Walk out to the car', emoji: '🚪', category: 'places', colorType: 'verb', motorIndex: 18 },
        { id: 'sc-sto-19', label: 'Cashier', speechText: 'Say hello to the store cashier', emoji: '🧑‍💼', category: 'people', colorType: 'subject', motorIndex: 19 },
        { id: 'sc-sto-20', label: 'Thank You', speechText: 'Thank you and have a nice day', emoji: '🙏', category: 'core', colorType: 'social', motorIndex: 20 },
      ]
    },
  ];

  const activeSceneData = aacActiveScene ? AAC_SCENES.find((s) => s.id === aacActiveScene) : null;

  const displayedItems = activeSceneData
    ? (searchQuery.trim()
        ? activeSceneData.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.speechText.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activeSceneData.items)
    : filteredItems;

  const gridColsClass = settings.largeButtonMode
    ? 'grid-cols-3 sm:grid-cols-4'
    : settings.gridColumns === 3
    ? 'grid-cols-3 sm:grid-cols-4'
    : settings.gridColumns === 6
    ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
    : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6';

  const handleTileClick = (item: AACItem) => {
    if (isEditMode) {
      setEditingItem(item);
      setShowWordEditor(true);
      return;
    }
    if (instantSpeakMode) {
      speak(item.speechText || item.label);
    } else {
      addToSentence(item);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-1 sm:px-3 min-h-0 overflow-hidden">
      
      {/* TOP PINNED CONTROLS PANEL (Never hidden, never overlapping, always accessible) */}
      <div className="shrink-0 space-y-1.5 pb-1.5 z-20">
        
        {/* 1. CONTEXT SCENE SWITCHER & KEYBOARD */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Scene:
          </span>
          {aacActiveScene && (
            <button
              onClick={() => setAacActiveScene(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          {AAC_SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setAacActiveScene(aacActiveScene === scene.id ? null : scene.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                aacActiveScene === scene.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{scene.emoji}</span>
              <span>{scene.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowAacKeyboardModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer shrink-0 hover:bg-amber-100 transition-all ml-auto"
            title="Open Dyslexia-Friendly Typing Keyboard"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Type</span>
          </button>
        </div>

        {/* Scene phrases strip (when scene active) */}
        {activeSceneData && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <span>{activeSceneData.emoji}</span>
              <span>{activeSceneData.label} — Quick Phrases</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {activeSceneData.phrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-950 font-bold text-xs border border-indigo-200 shadow-2xs shrink-0 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. SENTENCE BUILDER STRIP */}
        {!isSentenceBarCollapsed && (
          <section
            aria-label="Sentence builder"
            className="w-full bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-300 shadow-xs p-2 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              {/* Sentence Display Area */}
              <div className="flex-1 min-w-0 min-h-[52px] sm:min-h-[58px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                {sentence.length === 0 ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium px-2 select-none truncate">
                    {instantSpeakMode ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Zap className="w-4 h-4" /> Instant Speak is ON — tap any word to hear aloud
                      </span>
                    ) : (
                      <span>Tap words below to build a sentence...</span>
                    )}
                  </div>
                ) : (
                  sentence.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border shadow-xs animate-in fade-in zoom-in-95 duration-150 select-none shrink-0 ${getColorStyles(
                        item.colorType
                      )}`}
                    >
                      <img
                        src={resolveAacImageUrl(item)}
                        alt={item.label}
                        className="w-6 h-6 object-contain rounded shrink-0 pointer-events-none"
                      />
                      <span className="font-bold text-xs sm:text-sm tracking-tight">{item.label}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Controls: Backspace, Clear, Speak, Save, Collapse */}
              <div className="flex items-center gap-1 shrink-0">
                {sentence.length > 0 && (
                  <>
                    <button
                      onClick={removeLastFromSentence}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer"
                      title="Remove last word"
                      aria-label="Backspace"
                    >
                      <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={clearSentence}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 transition-all cursor-pointer"
                      title="Clear sentence"
                      aria-label="Clear all"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={saveSentenceAsQuickPhrase}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 transition-all cursor-pointer hidden sm:block"
                      title="Save to quick phrases"
                    >
                      <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 bg-rose-500 hover:bg-rose-600 text-white animate-pulse cursor-pointer"
                    title="Stop speaking"
                  >
                    <div className="flex items-center gap-0.5 mr-0.5">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>STOP</span>
                  </button>
                ) : (
                  <button
                    onClick={speakSentence}
                    disabled={sentence.length === 0}
                    className={`flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer ${
                      sentence.length > 0
                        ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 ring-2 ring-amber-500 animate-pulse'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>SPEAK</span>
                  </button>
                )}

                <button
                  onClick={() => setIsSentenceBarCollapsed(true)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer hidden md:block"
                  title="Minimize sentence bar"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Minimized Sentence Bar Restorer */}
        {isSentenceBarCollapsed && (
          <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span>💬 Sentence Bar Minimized</span>
              {instantSpeakMode && <span className="text-amber-600 font-black">(⚡ Instant Speak is Active)</span>}
            </span>
            <button
              onClick={() => setIsSentenceBarCollapsed(false)}
              className="flex items-center gap-1 text-amber-700 hover:underline cursor-pointer"
            >
              <span>Show Bar</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. CONTEXTUAL AAC STRIP */}
        {plansChanged.active ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Context Words: Plans Changed</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {plansChanged.relevantPhrases.slice(0, 5).map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs shrink-0 active:scale-95 cursor-pointer"
                >
                  💬 {phrase}
                </button>
              ))}
            </div>
          </div>
        ) : isDentistDay && dentistAdventure ? (
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Dentist Visit Helper Phrases</span>
              </span>
              <span className="text-[10px] text-teal-700 font-medium">Tap to speak instantly</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {dentistAdventure.thingsICanSay.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => speak(phrase)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-950 font-bold text-xs border border-teal-300 shadow-2xs shrink-0 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>🦷</span>
                  <span>{phrase}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* 4. CATEGORY PILLS & VOCABULARY TOOLBAR */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
          {/* Category Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setAacActiveScene(null);
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                  playChime('tap');
                }}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  !activeSceneData && activeCategory === cat.id
                    ? cat.id === 'favorites'
                      ? 'bg-rose-500 text-white shadow-xs ring-2 ring-rose-600 font-black'
                      : 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-800 font-black'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Customization Actions: Add Word, Edit Mode, Instant Speak Toggle, Online Tools */}
          <div className="flex items-center gap-1 shrink-0 ml-auto flex-wrap">
            
            {/* Add Word Button */}
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setShowWordEditor(true);
              }}
              className="px-2 py-1 rounded-xl text-xs font-black border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Add a custom word or favorite phrase"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Word</span>
            </button>

            {/* Edit Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsEditMode(!isEditMode);
                playChime('tap');
              }}
              className={`px-2 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                isEditMode
                  ? 'bg-indigo-600 text-white border-indigo-700 font-black shadow-xs ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle Edit Mode to customize words or set favorites"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEditMode ? 'Done' : 'Edit'}</span>
            </button>

            {/* Instant Speak Mode */}
            <button
              type="button"
              onClick={() => {
                setInstantSpeakMode(!instantSpeakMode);
                playChime('tap');
              }}
              className={`px-2 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                instantSpeakMode
                  ? 'bg-amber-400 text-amber-950 border-amber-500 font-black shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Instant Speak Mode: Tap any tile to speak it aloud immediately"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Instant</span>
            </button>

            {/* Online AAC Tools */}
            <button
              type="button"
              onClick={() => setShowSymbolPicker(true)}
              className="px-2 py-1 rounded-xl text-xs font-black border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs hidden md:flex"
              title="Online AAC Symbols & Real Photos (ARASAAC Library)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Symbols</span>
            </button>

            {/* Theme customizer button */}
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className="px-2 py-1 rounded-xl text-xs font-black border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Change theme or mascot"
            >
              <span className="text-sm">{activeTheme.mascotEmoji}</span>
            </button>

          </div>
        </div>

        {/* Edit Mode Notice Banner */}
        {isEditMode && (
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-2 flex items-center justify-between text-indigo-950 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold">
                <strong>Edit Mode:</strong> Tap ❤️ on any tile to toggle Favorites, or ✏️ to customize.
              </span>
            </div>
            <button
              onClick={() => setIsEditMode(false)}
              className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* 5. SCROLLABLE MOTOR-PLANNING VOCABULARY GRID */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-0.5 pb-20 scrollbar-thin">
        {/* Active Scene Banner */}
        {activeSceneData && (
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs mb-2 mt-1 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl p-1 bg-white/20 rounded-xl">{activeSceneData.emoji}</span>
              <div>
                <div className="font-black text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  <span>{activeSceneData.label} Scene</span>
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                    {displayedItems.length} Custom Words
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 font-medium mt-0.5">
                  {activeSceneData.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAacActiveScene(null);
                playChime('tap');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 ml-2"
              title="Return to Core Words"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Categories</span>
            </button>
          </div>
        )}

        <main
          className={`grid ${gridColsClass} gap-1.5 sm:gap-2 mt-1 pb-10`}
          aria-label="Vocabulary grid"
        >
        {displayedItems.map((item) => {
          const hasThemedArt = activeTheme && !['classic', 'minimal', 'executive', 'dark', 'cyber'].includes(activeTheme.category) && (settings.aacButtonColorMode || 'fitzgerald') !== 'high_contrast_white';
          return (
            <div
              key={item.id}
              className="relative group aspect-square"
            >
              <button
                type="button"
                onClick={() => handleTileClick(item)}
                className={`w-full h-full flex flex-col items-center p-1.5 sm:p-2 ${
                  activeTheme?.aacStyling?.tileBorderRadius || 'rounded-2xl'
                } ${
                  activeTheme?.aacStyling?.tileBorderWidth || 'border-2'
                } shadow-sm transition-all active:scale-92 cursor-pointer relative overflow-hidden ${
                  hasThemedArt ? 'border-opacity-60' : ''
                } ${getColorStyles(item.colorType)}`}
              >
                {/* Themed SVG art layer */}
                {hasThemedArt && activeTheme && (
                  <AACTileArt
                    theme={activeTheme}
                    colorType={item.colorType}
                    label={item.label}
                  />
                )}

                {/* ARASAAC Clinical Pictogram Area */}
                <div className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 p-1">
                  <img
                    src={resolveAacImageUrl(item)}
                    alt={item.label}
                    className="w-full h-full object-contain rounded-lg pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 font-black tracking-tight text-center leading-none select-none drop-shadow-sm w-full mt-1 ${
                    settings.largeButtonMode ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'
                  }`}
                >
                  {item.label}
                </span>
              </button>

              {/* Heart (Favorite) Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAacFavorite(item.id);
                }}
                className={`absolute top-1 right-1 z-20 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                  item.isFavorite
                    ? 'bg-rose-500 text-white scale-100 hover:scale-110'
                    : isEditMode
                    ? 'bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200'
                    : 'opacity-0 group-hover:opacity-100 bg-white/80 text-slate-400 hover:text-rose-500'
                }`}
                title={item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-3 h-3 ${item.isFavorite ? 'fill-white text-white' : ''}`} />
              </button>

              {/* Edit Word Button (Pencil) */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(item);
                    setShowWordEditor(true);
                  }}
                  className="absolute top-1 left-1 z-20 p-1.5 rounded-full bg-indigo-600 text-white hover:scale-110 transition-transform cursor-pointer shadow-xs"
                  title="Edit word details"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </main>

      {/* Empty State / Helpful Prompts */}
      {displayedItems.length === 0 && (
        <div className="text-center py-10 px-4 bg-white rounded-3xl border-2 border-dashed border-slate-300 mt-4 text-slate-600 max-w-md mx-auto">
          {activeCategory === 'favorites' ? (
            <div className="space-y-3">
              <span className="text-4xl block">❤️</span>
              <h3 className="font-black text-slate-900 text-base">No Favorite Words Yet</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tap the heart on any word to pin it here, or create your own custom favorite phrases!
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setShowWordEditor(true);
                }}
                className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Favorite Word</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-bold text-base">No words found in this category.</p>
              <p className="text-xs text-slate-400">
                You can add new words anytime using the "Add Word" button or Online AAC Tools!
              </p>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Word & Favorite Phrase Editor Modal */}
      <AACWordEditorModal
        isOpen={showWordEditor}
        onClose={() => {
          setShowWordEditor(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        defaultCategory={activeCategory}
        onSave={(wordData) => {
          if (editingItem) {
            updateAacItem({
              ...editingItem,
              ...wordData,
              id: editingItem.id,
              motorIndex: editingItem.motorIndex,
            });
          } else {
            addAacItem(wordData);
          }
        }}
        onDelete={(id) => {
          deleteAacItem(id);
        }}
      />

      {/* Online AAC Symbol & Button Studio Modal */}
      <AACSymbolPickerModal
        isOpen={showSymbolPicker}
        onClose={() => setShowSymbolPicker(false)}
        onSelectSymbol={(sym) => {
          addAacItem({
            label: sym.label,
            speechText: sym.speechText || sym.label,
            photoUrl: sym.photoUrl,
            emoji: sym.emoji || '✨',
            category: sym.category || 'food',
            colorType: sym.colorType || 'noun',
            isFavorite: true,
          });
        }}
        onImportPack={(pack) => {
          importAacPack(pack.items);
        }}
        onUpgradeAll={upgradeAllAacToClinicalSymbols}
      />
    </div>
  );
};
