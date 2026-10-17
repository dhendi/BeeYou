import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialStory, SocialStoryPage } from '../../types';
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
  BookOpen,
  Check,
  Smile,
  Volume2,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

export interface CreateSocialStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStory?: SocialStory | null;
}

const PRESET_STORY_CATEGORIES = [
  'Changes & Flexibility',
  'Feelings & Calming',
  'School & Friends',
  'Community & Outings',
  'Body & Health',
  'Other'
];

const QUICK_STARTER_STORIES = [
  {
    title: 'Taking Turns on the Playground',
    category: 'School & Friends',
    emoji: '🛝',
    pages: [
      {
        pageNumber: 1,
        text: 'At the playground, there are lots of fun things like swings, slides, and climbing bars.',
        emoji: '🎠',
      },
      {
        pageNumber: 2,
        text: 'Sometimes a friend is already playing on the swing I want. That is okay.',
        emoji: '🤝',
      },
      {
        pageNumber: 3,
        text: 'I can wait calmly. I can count slowly to 10 or say: "Can I have a turn next please?"',
        emoji: '⏳',
      },
      {
        pageNumber: 4,
        text: 'When my friend finishes, it will be my turn! Everyone gets a turn to play and smile.',
        emoji: '⭐',
      },
    ],
    keyTakeaways: [
      'Waiting for a turn helps everyone share happily.',
      'I can politely ask for the next turn.',
      'My turn will come soon.'
    ],
    suggestedPhrases: [
      'Can I have a turn next?',
      'My turn please?',
      'Thank you for sharing!',
      'I will wait over here.'
    ]
  },
  {
    title: 'When It Gets Too Loud',
    category: 'Feelings & Calming',
    emoji: '🎧',
    pages: [
      {
        pageNumber: 1,
        text: 'Sometimes places can get very loud. There might be sirens, barking dogs, or lots of voices talking at once.',
        emoji: '📢',
      },
      {
        pageNumber: 2,
        text: 'Loud sounds might hurt my ears or make my body feel tense or worried. That is completely normal.',
        emoji: '⚡',
      },
      {
        pageNumber: 3,
        text: 'I can put on my soft noise-cancelling headphones or cover my ears gently with my hands.',
        emoji: '🎧',
      },
      {
        pageNumber: 4,
        text: 'I can take three slow bee-breaths: smell the flower in, buzz the bee breath out.',
        emoji: '🧘',
      },
      {
        pageNumber: 5,
        text: 'I can ask my grown-up: "Can we go to a quieter spot?" I am safe and cared for.',
        emoji: '❤️',
      },
    ],
    keyTakeaways: [
      'Loud noises can feel overwhelming, and that is okay.',
      'Headphones and deep breathing help my body feel calm.',
      'I can always ask for a quieter space.'
    ],
    suggestedPhrases: [
      'Too loud for me.',
      'I need my headphones.',
      'Can we go somewhere quiet?',
      'I need a 2-minute break.'
    ]
  },
  {
    title: 'Trying a New Food',
    category: 'Body & Health',
    emoji: '🥗',
    pages: [
      {
        pageNumber: 1,
        text: 'Mealtime is a chance to give our body energy. Sometimes there is a food on my plate that looks new.',
        emoji: '🍽️',
      },
      {
        pageNumber: 2,
        text: 'A new food might look, smell, or feel different. I do not have to eat a big bite right away.',
        emoji: '👀',
      },
      {
        pageNumber: 3,
        text: 'I can look at it, smell it, or touch it with my fork first. Being curious is brave!',
        emoji: '🌿',
      },
      {
        pageNumber: 4,
        text: 'If I want, I can take a tiny mouse nibble. If I don\'t like it, I can politely say: "No thank you, maybe later."',
        emoji: '🐭',
      },
      {
        pageNumber: 5,
        text: 'I am proud of myself for exploring new things at my own pace!',
        emoji: '🌟',
      },
    ],
    keyTakeaways: [
      'I do not have to eat big bites of new foods.',
      'Looking, smelling, or taking a tiny nibble is very brave.',
      'I can politely say "No thank you" anytime.'
    ],
    suggestedPhrases: [
      'What does this taste like?',
      'Can I try a tiny bite?',
      'No thank you, maybe later.',
      'I need a sip of water.'
    ]
  }
];

export const CreateSocialStoryModal: React.FC<CreateSocialStoryModalProps> = ({
  isOpen,
  onClose,
  initialStory
}) => {
  const { addSocialStory, updateSocialStory, activeTheme } = useApp();

  const isEditing = !!initialStory;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Feelings & Calming');
  const [emoji, setEmoji] = useState('📖');
  const [summary, setSummary] = useState('');
  const [pages, setPages] = useState<SocialStoryPage[]>([]);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>([]);

  // Active form tab
  const [activeTab, setActiveTab] = useState<'basics' | 'pages' | 'takeaways'>('basics');

  // Input states
  const [newTakeawayInput, setNewTakeawayInput] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');

  // Icon Library Modal
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<'story' | number>('story');

  useEffect(() => {
    if (initialStory) {
      setTitle(initialStory.title || '');
      setCategory(initialStory.category || 'Feelings & Calming');
      setEmoji(initialStory.emoji || '📖');
      setSummary(initialStory.summary || '');
      setPages(
        initialStory.pages && initialStory.pages.length > 0
          ? initialStory.pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }))
          : [
              { pageNumber: 1, text: 'First page of my story.', emoji: '📖' },
              { pageNumber: 2, text: 'Second page of my story.', emoji: '🌟' },
            ]
      );
      setKeyTakeaways([...(initialStory.keyTakeaways || [])]);
      setSuggestedPhrases([...(initialStory.suggestedPhrases || [])]);
    } else {
      setTitle('');
      setCategory('Changes & Flexibility');
      setEmoji('📖');
      setSummary('');
      setPages([
        {
          pageNumber: 1,
          text: 'Sometimes we have a plan, and everything feels comfortable and familiar.',
          emoji: '📅',
        },
        {
          pageNumber: 2,
          text: 'When something unexpected happens, I can take three calm, slow breaths.',
          emoji: '🧘',
        },
        {
          pageNumber: 3,
          text: 'I can ask my grown-up for help: "What is our new plan?" Together, we are safe.',
          emoji: '🤝',
        },
      ]);
      setKeyTakeaways([
        'All feelings are normal and okay.',
        'Taking deep breaths helps my body feel calm.',
        'My caregiver is here to help me through new situations.'
      ]);
      setSuggestedPhrases([
        'I need a moment.',
        'What happens now?',
        'Can I have a hug?',
        'I am safe.'
      ]);
    }
    setActiveTab('basics');
  }, [initialStory, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof QUICK_STARTER_STORIES[0]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setEmoji(tmpl.emoji);
    setSummary('');
    setPages(tmpl.pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
    setKeyTakeaways([...tmpl.keyTakeaways]);
    setSuggestedPhrases([...tmpl.suggestedPhrases]);
    playChime('tap');
  };

  const handleAddPage = () => {
    setPages((prev) => [
      ...prev,
      {
        pageNumber: prev.length + 1,
        text: '',
        emoji: '⭐',
      },
    ]);
    playChime('tap');
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) =>
      prev.filter((_, idx) => idx !== index).map((p, idx) => ({ ...p, pageNumber: idx + 1 }))
    );
    playChime('tap');
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPages(updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 })));
    playChime('tap');
  };

  const handlePageChange = (index: number, field: keyof SocialStoryPage, value: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleAddTakeaway = () => {
    if (!newTakeawayInput.trim()) return;
    setKeyTakeaways((prev) => [...prev, newTakeawayInput.trim()]);
    setNewTakeawayInput('');
    playChime('tap');
  };

  const handleRemoveTakeaway = (idx: number) => {
    setKeyTakeaways((prev) => prev.filter((_, i) => i !== idx));
    playChime('tap');
  };

  const handleAddPhrase = () => {
    if (!newPhraseInput.trim()) return;
    setSuggestedPhrases((prev) => [...prev, newPhraseInput.trim()]);
    setNewPhraseInput('');
    playChime('tap');
  };

  const handleRemovePhrase = (idx: number) => {
    setSuggestedPhrases((prev) => prev.filter((_, i) => i !== idx));
    playChime('tap');
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert(t('Please enter a title for this social story.'));
      return;
    }
    const validPages = pages.filter((p) => p.text.trim().length > 0);
    if (validPages.length === 0) {
      alert(t('Please write text for at least one page of your story.'));
      return;
    }

    if (isEditing && initialStory) {
      const updated: SocialStory = {
        ...initialStory,
        title: title.trim(),
        category,
        emoji,
        summary: summary.trim(),
        pages: validPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
        keyTakeaways,
        suggestedPhrases,
        isCustom: true,
      };
      updateSocialStory(updated);
    } else {
      const newStory: Omit<SocialStory, 'id'> = {
        title: title.trim(),
        category,
        emoji,
        summary: summary.trim(),
        pages: validPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
        keyTakeaways,
        suggestedPhrases,
        isCustom: true,
      };
      addSocialStory(newStory);
    }

    playChime('star');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-3 ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex flex-col max-h-[92vh] overflow-hidden`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${activeTheme?.palette?.primaryBorder || 'border-amber-100'} flex items-center justify-between ${activeTheme?.palette?.primaryLight || 'bg-amber-50/70'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex items-center justify-center text-xl shadow-2xs`}>
              <RoutineStickerIcon emoji={emoji} title={title || 'Social Story'} className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isEditing ? t('Edit Social Story') : t('Create New Social Story')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('Write illustrated story pages with predictable scripts and calming takeaways')}
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
                ? `bg-white ${activeTheme?.palette?.textAccent || 'text-amber-900'} border-t-2 border-x-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {t('Story Basics')}
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pages'
                ? `bg-white ${activeTheme?.palette?.textAccent || 'text-amber-900'} border-t-2 border-x-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {t('Illustrated Pages')} ({pages.length})
          </button>
          <button
            onClick={() => setActiveTab('takeaways')}
            className={`px-4 py-2 rounded-t-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'takeaways'
                ? `bg-white ${activeTheme?.palette?.textAccent || 'text-amber-900'} border-t-2 border-x-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {t('Key Takeaways & AAC')}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-5">
              {!isEditing && (
                <div className={`${activeTheme?.palette?.primaryLight || 'bg-amber-50/80'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} rounded-2xl p-3.5`}>
                  <div className={`flex items-center gap-1.5 text-xs font-black ${activeTheme?.palette?.textAccent || 'text-amber-900'} mb-2 uppercase tracking-wider`}>
                    <Lightbulb className={`w-4 h-4 ${activeTheme?.palette?.textAccent || 'text-amber-600'}`} />
                    <span>{t('Need inspiration? Choose a starter story:')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {QUICK_STARTER_STORIES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className={`text-left p-2.5 rounded-xl bg-white hover:opacity-90 border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} transition text-xs font-bold text-slate-800 shadow-2xs active:scale-98 cursor-pointer flex items-center gap-2`}
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
                      setIconPickerTarget('story');
                      setIsIconPickerOpen(true);
                    }}
                    className={`w-20 h-20 rounded-2xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} hover:opacity-90 flex flex-col items-center justify-center p-2 shadow-2xs transition active:scale-95 cursor-pointer group`}
                    title={t('Click to change sticker or emoji')}
                  >
                    <RoutineStickerIcon emoji={emoji} title={title || 'Icon'} className="w-12 h-12 object-contain" />
                    <span className={`text-[10px] font-bold ${activeTheme?.palette?.textAccent || 'text-amber-700'} mt-0.5 group-hover:underline`}>
                      {t('Change')}
                    </span>
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      {t('Story Title')} *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('e.g. Taking Turns on the Swing, Riding the School Bus...')}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      {t('Category / Topic')}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800 bg-white"
                    >
                      {PRESET_STORY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {t(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Summary */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {t('Optional Story Summary')}
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('A short note about what situation this story helps prepare for')}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-medium text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {t('Story Pages (Read Step-by-Step)')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Write gentle, predictable first-person sentences for each storybook page.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPage}
                  className={`px-3 py-1.5 rounded-xl ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-900'} font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add Page')}</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {pages.map((page, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-100'} ${activeTheme?.palette?.primaryLight || 'bg-amber-50/40'} flex flex-col gap-3`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white font-black text-xs`}>
                          {t('Page')} {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIconPickerTarget(idx);
                            setIsIconPickerOpen(true);
                          }}
                          className={`w-10 h-10 rounded-xl bg-white border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} hover:opacity-90 flex items-center justify-center shadow-2xs transition cursor-pointer`}
                          title={t('Change page icon')}
                        >
                          <RoutineStickerIcon emoji={page.emoji} className="w-7 h-7 object-contain" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMovePage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          title={t('Move page earlier')}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePage(idx, 'down')}
                          disabled={idx === pages.length - 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          title={t('Move page later')}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePage(idx)}
                          disabled={pages.length <= 1}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 disabled:opacity-30 cursor-pointer"
                          title={t('Delete page')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={page.text}
                        onChange={(e) => handlePageChange(idx, 'text', e.target.value)}
                        placeholder={t('Write what happens on this page (e.g. "When a plan changes, my body might feel surprised. That is okay.")')}
                        className={`w-full px-3.5 py-2.5 rounded-xl border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800 bg-white leading-relaxed`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TAKEAWAYS & AAC */}
          {activeTab === 'takeaways' && (
            <div className="space-y-5">
              {/* Key Takeaways */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>{t('Key Takeaways & Lessons')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Summary points to review with the child at the end of the story.')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTakeawayInput}
                    onChange={(e) => setNewTakeawayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTakeaway();
                      }
                    }}
                    placeholder={t('e.g. "Taking deep breaths helps my body feel calm."')}
                    className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className={`px-4 py-2 rounded-xl ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white font-black text-xs transition active:scale-95 cursor-pointer`}
                  >
                    {t('Add')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {keyTakeaways.map((takeaway, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${activeTheme?.palette?.badgeBg || 'bg-amber-50'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold text-xs`}
                    >
                      <span>✓ {takeaway}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTakeaway(idx)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested AAC Phrases */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className={`w-4 h-4 ${activeTheme?.palette?.textAccent || 'text-amber-600'}`} />
                    <span>{t('Suggested Spoken AAC Phrases')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('Phrases the child can practice saying during this situation.')}
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
                    placeholder={t('e.g. "Can I have a turn next?", "I need a quiet break."')}
                    className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-xs font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhrase}
                    className={`px-4 py-2 rounded-xl ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white font-black text-xs transition active:scale-95 cursor-pointer`}
                  >
                    {t('Add')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedPhrases.map((phrase, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${activeTheme?.palette?.badgeBg || 'bg-amber-100/80'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold text-xs`}
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
            className={`px-6 py-2 rounded-xl ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer`}
          >
            <Check className="w-4 h-4" />
            <span>{isEditing ? t('Save Changes') : t('Create Story')}</span>
          </button>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <IconLibraryModal
          isOpen={isIconPickerOpen}
          onClose={() => setIsIconPickerOpen(false)}
          onSelectIcon={(selectedEmoji) => {
            if (iconPickerTarget === 'story') {
              setEmoji(selectedEmoji);
            } else if (typeof iconPickerTarget === 'number') {
              handlePageChange(iconPickerTarget, 'emoji', selectedEmoji);
            }
            setIsIconPickerOpen(false);
          }}
          selectedEmoji={
            iconPickerTarget === 'story'
              ? emoji
              : typeof iconPickerTarget === 'number'
              ? pages[iconPickerTarget]?.emoji
              : undefined
          }
          title={t('Select Icon or Sticker')}
        />
      )}
    </div>
  );
};
