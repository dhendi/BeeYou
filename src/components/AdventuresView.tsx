import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LifeAdventure, SocialStory } from '../types';
import { 
  Compass, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Volume2, 
  Ear, 
  Wind,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { RoutineStickerIcon } from './icons/JournalStickers';
import { t } from '../services/translator';
import { getThemeWidgetStyles } from '../utils/themeWidgetHelper';
import { CreateAdventureModal } from './adventures/CreateAdventureModal';
import { CreateSocialStoryModal } from './adventures/CreateSocialStoryModal';

const getAdventureSticker = (id: string): string | undefined => {
  if (id === 'adv-dentist') return '/assets/stickers/adventure_dentist.png';
  if (id === 'adv-restaurant') return '/assets/stickers/adventure_restaurant.png';
  if (id === 'adv-haircut') return '/assets/stickers/adventure_haircut_salon.png';
  if (id === 'adv-doctor') return '/assets/stickers/adventure_doctor_checkup.png';
  if (id === 'adv-pool') return '/assets/stickers/adventure_swimming_pool.png';
  if (id === 'adv-cinema') return '/assets/stickers/adventure_movie_cinema.png';
  if (id === 'adv-bowling') return '/assets/stickers/adventure_bowling_alley.png';
  if (id === 'adv-camping') return '/assets/stickers/adventure_camping_tent.png';
  if (id === 'adv-museum') return '/assets/stickers/adventure_museum_visit.png';
  return undefined;
};

const getStorySticker = (id: string): string | undefined => {
  if (id === 'story-plans-change') return '/assets/stickers/story_plans_change.png';
  if (id === 'story-birthday') return '/assets/stickers/story_birthday.png';
  if (id === 'story-sharing') return '/assets/stickers/story_sharing.png';
  return undefined;
};

export const AdventuresView: React.FC = () => {
  const {
    settings,
    adventures,
    socialStories,
    activeAdventureId,
    setActiveAdventureId,
    activeStoryId,
    setActiveStoryId,
    speak,
    announce,
    completeAdventure,
    deleteAdventure,
    deleteSocialStory,
    setChildView,
    activeTheme,
  } = useApp();

  const themeStyles = getThemeWidgetStyles(activeTheme);
  const isColorCoded = settings?.colorCodedActionCards === true;

  const [activeTab, setActiveTab] = useState<'adventures' | 'stories'>('adventures');
  const [adventureSubTab, setAdventureSubTab] = useState<'steps' | 'sensory' | 'say' | 'practice'>('steps');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Social story page state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Practice mode message
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  // Custom Creation / Edit Modal States
  const [isAdventureModalOpen, setIsAdventureModalOpen] = useState(false);
  const [editingAdventure, setEditingAdventure] = useState<LifeAdventure | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SocialStory | null>(null);

  const [deletingItem, setDeletingItem] = useState<{
    type: 'adventure' | 'story';
    id: string;
    title: string;
  } | null>(null);

  const selectedAdventure = adventures.find((a) => a.id === activeAdventureId);
  const selectedStory = socialStories.find((s) => s.id === activeStoryId);

  // If a story is open
  if (selectedStory) {
    const page = selectedStory.pages[currentPageIndex] || selectedStory.pages[0];
    const isLastPage = currentPageIndex === selectedStory.pages.length - 1;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-3xl mx-auto w-full px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              setActiveStoryId(null);
              setCurrentPageIndex(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Stories')}</span>
          </button>

          {selectedStory.isCustom && (
            <button
              onClick={() => {
                setEditingStory(selectedStory);
                setIsStoryModalOpen(true);
                playChime('tap');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('Edit Story')}</span>
            </button>
          )}
        </div>

        <div className={`bg-white rounded-3xl border-3 ${activeTheme?.palette?.primaryBorder || 'border-amber-300/80'} shadow-md p-6 sm:p-8 flex flex-col items-center text-center`}>
          <div className="flex items-center gap-2 mb-2">
            <RoutineStickerIcon
              emoji={selectedStory.stickerSrc || getStorySticker(selectedStory.id) || selectedStory.emoji}
              title={selectedStory.title}
              className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
            />
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">{t(selectedStory.title)}</h2>
          </div>

          <div className={`text-xs font-bold ${activeTheme?.palette?.textAccent || 'text-amber-950'} mb-6 ${activeTheme?.palette?.badgeBg || 'bg-amber-100 border border-amber-300/60'} px-3 py-1 rounded-full`}>
            {t('Page')} {currentPageIndex + 1} {t('of')} {selectedStory.pages.length}
          </div>

          <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex items-center justify-center p-4 mb-6 shadow-inner`}>
            <RoutineStickerIcon emoji={page.emoji} className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
          </div>

          <p className="text-base sm:text-xl font-bold text-slate-800 max-w-lg leading-relaxed mb-6">
            {t(page.text)}
          </p>

          <button
            onClick={() => speak(t(page.text))}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold text-xs sm:text-sm active:scale-95 transition-all mb-8 cursor-pointer`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('Read Page Aloud')}</span>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full max-w-sm gap-4">
            <button
              onClick={() => {
                if (currentPageIndex > 0) {
                  setCurrentPageIndex((p) => p - 1);
                  playChime('tap');
                }
              }}
              disabled={currentPageIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                currentPageIndex === 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('Previous')}</span>
            </button>

            <button
              onClick={() => {
                if (!isLastPage) {
                  setCurrentPageIndex((p) => p + 1);
                  playChime('tap');
                } else {
                  playChime('star');
                  announce(t('Story complete! Great reading!'));
                  setActiveStoryId(null);
                  setCurrentPageIndex(0);
                }
              }}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white shadow-md active:scale-95 transition-all cursor-pointer`}
            >
              <span>{isLastPage ? t('All Done! ⭐') : t('Next Page')}</span>
              {!isLastPage && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If an adventure is open
  if (selectedAdventure) {
    const step = selectedAdventure.steps[currentStepIndex] || selectedAdventure.steps[0];
    const isLastStep = currentStepIndex === selectedAdventure.steps.length - 1;

    return (
      <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
        {/* Back Button & Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveAdventureId(null);
              setCurrentStepIndex(0);
              setPracticeFeedback(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('All Adventures')}</span>
          </button>

          <span className={`text-xs font-bold ${activeTheme?.palette?.textAccent || 'text-amber-900'} ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-300/80'} px-3 py-1 rounded-full`}>
            {t(selectedAdventure.category)}
          </span>
        </div>

        {/* Adventure Header Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className={`w-20 h-20 rounded-3xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} flex items-center justify-center p-2 shrink-0 shadow-xs`}>
            <RoutineStickerIcon
              emoji={selectedAdventure.stickerSrc || getAdventureSticker(selectedAdventure.id) || selectedAdventure.emoji}
              title={selectedAdventure.title}
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              {t(selectedAdventure.title)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-snug">
              {t(selectedAdventure.summary)}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                onClick={() => speak(t(selectedAdventure.summary))}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('Hear Overview')}</span>
              </button>
              <button
                onClick={() => setChildView('aac')}
                className={`px-3 py-1 rounded-xl ${activeTheme?.palette?.badgeBg || 'bg-amber-100'} hover:opacity-90 ${activeTheme?.palette?.textAccent || 'text-amber-900'} font-bold text-xs flex items-center gap-1.5 cursor-pointer`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('Open Context AAC')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation: Steps, Sensory Preview, What I Can Say, Practice */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-xs gap-1 overflow-x-auto">
          <button
            onClick={() => setAdventureSubTab('steps')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'steps'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🚶 {t('Walkthrough')} ({selectedAdventure.steps.length})</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('sensory')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'sensory'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🎧 {t('Sensory Preview')}</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('say')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'say'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🗣️ {t('Things I Can Say')}</span>
          </button>
          <button
            onClick={() => setAdventureSubTab('practice')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              adventureSubTab === 'practice'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>⭐ {t('Practice Mode')}</span>
          </button>
        </div>

        {/* SUB-TAB 1: INTERACTIVE STEP WALKTHROUGH */}
        {adventureSubTab === 'steps' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-7 shadow-sm flex flex-col items-center text-center">
            <div className={`text-xs font-black uppercase tracking-wider ${activeTheme?.palette?.textAccent || 'text-amber-900'} ${activeTheme?.palette?.primaryLight || 'bg-amber-100'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-300/80'} px-3 py-1 rounded-full mb-4`}>
              {t('Step')} {currentStepIndex + 1} {t('of')} {selectedAdventure.steps.length}
            </div>

            <div className={`w-28 h-28 rounded-3xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-200/80'} flex items-center justify-center p-3 mb-4 shadow-inner`}>
              <RoutineStickerIcon emoji={step.emoji} className="w-20 h-20 object-contain" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2">
              {t(step.title)}
            </h3>

            {step.description && (
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md leading-relaxed mb-4">
                {t(step.description)}
              </p>
            )}

            {step.sensoryTip && (
              <div className={`${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} rounded-xl px-3 py-2 text-xs font-semibold ${activeTheme?.palette?.textAccent || 'text-amber-900'} max-w-sm mb-6 flex items-center gap-2 text-left`}>
                <Ear className={`w-4 h-4 ${activeTheme?.palette?.textAccent || 'text-amber-600'} shrink-0`} />
                <span>{t(step.sensoryTip)}</span>
              </div>
            )}

            <button
              onClick={() => speak(`${t(step.title)}.${step.description ? ` ${t(step.description)}` : ''}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all mb-6 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t('Hear Step')}</span>
            </button>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between w-full max-w-md gap-3">
              <button
                onClick={() => {
                  if (currentStepIndex > 0) {
                    setCurrentStepIndex((p) => p - 1);
                    playChime('tap');
                  }
                }}
                disabled={currentStepIndex === 0}
                className={`flex-1 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  currentStepIndex === 0
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 active:scale-95'
                }`}
              >
                {t('Previous Step')}
              </button>

              <button
                onClick={() => {
                  if (!isLastStep) {
                    setCurrentStepIndex((p) => p + 1);
                    playChime('tap');
                  } else {
                    completeAdventure(selectedAdventure.id);
                  }
                }}
                className={`flex-1 py-2.5 rounded-2xl font-black text-xs sm:text-sm ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} hover:opacity-90 text-white shadow-md active:scale-95 transition-all cursor-pointer`}
              >
                {isLastStep ? t('Complete Adventure! ⭐') : `${t('Next Step')} →`}
              </button>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: INDIVIDUALIZED SENSORY PREVIEW */}
        {adventureSubTab === 'sensory' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">
                <span>{t('Sensory Guide for')} {t(selectedAdventure.title)}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('Know what sensations to expect so there are no surprises.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedAdventure.sensoryPreview.sound && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
                  <span className="font-bold text-xs text-sky-950 block">{t('Sound')}</span>
                  <p className="text-xs text-sky-900 mt-0.5 font-medium leading-relaxed">
                    {t(selectedAdventure.sensoryPreview.sound)}
                  </p>
                </div>
              )}

              {selectedAdventure.sensoryPreview.light && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                  <span className="font-bold text-xs text-amber-950 block">{t('Lighting')}</span>
                  <p className="text-xs text-amber-900 mt-0.5 font-medium leading-relaxed">
                    {t(selectedAdventure.sensoryPreview.light)}
                  </p>
                </div>
              )}

              {selectedAdventure.sensoryPreview.touch && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
                  <span className="font-bold text-xs text-rose-950 block">{t('Touch & Clothing')}</span>
                  <p className="text-xs text-rose-900 mt-0.5 font-medium leading-relaxed">
                    {t(selectedAdventure.sensoryPreview.touch)}
                  </p>
                </div>
              )}

              {selectedAdventure.sensoryPreview.waiting && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5">
                  <span className="font-bold text-xs text-purple-950 block">{t('Waiting Time')}</span>
                  <p className="text-xs text-purple-900 mt-0.5 font-medium leading-relaxed">
                    {t(selectedAdventure.sensoryPreview.waiting)}
                  </p>
                </div>
              )}

              {selectedAdventure.sensoryPreview.people && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5">
                  <span className="font-bold text-xs text-teal-950 block">{t('People & Faces')}</span>
                  <p className="text-xs text-teal-900 mt-0.5 font-medium leading-relaxed">
                    {t(selectedAdventure.sensoryPreview.people)}
                  </p>
                </div>
              )}
            </div>

            <div className={`${activeTheme?.palette?.primaryLight || 'bg-amber-50/70'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} rounded-2xl p-4 mt-2`}>
              <span className={`text-xs font-black ${activeTheme?.palette?.textAccent || 'text-amber-900'} uppercase tracking-wider block mb-1`}>
                {t('What Happens Afterward:')}
              </span>
              <p className={`text-xs sm:text-sm ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold leading-relaxed`}>
                {t(selectedAdventure.whatHappensAfter)}
              </p>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: THINGS I CAN SAY & ASK FOR */}
        {adventureSubTab === 'say' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                {t('Things I Can Say (Tap to Speak):')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedAdventure.thingsICanSay.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => speak(t(phrase))}
                    className={`flex items-center p-3 rounded-2xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer text-left`}
                  >
                    <span>{t(phrase)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">
                {t('Things I Can Ask For:')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedAdventure.thingsICanAskFor.map((ask, idx) => (
                  <button
                    key={idx}
                    onClick={() => speak(t(ask))}
                    className="flex items-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-950 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xs cursor-pointer text-left"
                  >
                    <span>{t(ask)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: PRACTICE SIMULATION MODE */}
        {adventureSubTab === 'practice' && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-7 shadow-sm flex flex-col items-center text-center">
            <span className="text-4xl mb-2">🎭</span>
            <h3 className="text-lg font-black text-slate-800">{t('Practice Conversation')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mt-1 mb-6">
              {t('Practice asking for a break or saying stop. See how friendly people respond when you speak your mind!')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mb-6">
              {[
                {
                  text: 'I need a break.',
                  emoji: '🛋️',
                  response: 'Of course! We will stop right now and take a 2-minute pause. You are doing fantastic.',
                },
                {
                  text: 'That hurts.',
                  emoji: '🩹',
                  response: 'Thank you for telling me! I will stop right away and be super gentle.',
                },
                {
                  text: 'Please stop.',
                  emoji: '🛑',
                  response: 'I hear you. Hands off completely. We can wait until you are ready.',
                },
                {
                  text: 'Can I have my sunglasses?',
                  emoji: '🕶️',
                  response: 'Sure thing! Putting sunglasses on right now to protect your eyes from the bright light.',
                },
              ].map((practice, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    speak(t(practice.text));
                    setPracticeFeedback(t(practice.response));
                    playChime('tap');
                    setTimeout(() => {
                      speak(t(practice.response));
                    }, 1200);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} hover:opacity-90 border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-200'} ${activeTheme?.palette?.textAccent || 'text-amber-950'} font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer text-left`}
                >
                  <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                    <RoutineStickerIcon emoji={practice.emoji} className="w-7 h-7 object-contain" />
                  </div>
                  <span>{t('Say')}: "{t(practice.text)}"</span>
                </button>
              ))}
            </div>

            {practiceFeedback && (
              <div className={`w-full max-w-lg ${activeTheme?.palette?.primaryLight || 'bg-amber-50/80'} border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} rounded-2xl p-4 animate-in fade-in zoom-in-95`}>
                <span className={`text-[11px] font-black uppercase tracking-wider ${activeTheme?.palette?.textAccent || 'text-amber-900'} block mb-1`}>
                  {t('How caregiver/doctor responds:')}
                </span>
                <p className={`text-sm font-bold ${activeTheme?.palette?.textAccent || 'text-amber-950'} leading-relaxed`}>
                  "{practiceFeedback}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // MAIN ADVENTURES / STORIES LIST
  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* Tab Switcher & Quick Add Button Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 border border-slate-200 bg-white rounded-2xl p-1 shadow-xs gap-1">
          <button
            onClick={() => setActiveTab('adventures')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'adventures'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('Life Adventures')} ({adventures.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stories'
                ? `${activeTheme?.palette?.primaryBg || 'bg-amber-500'} text-white shadow-sm`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('Social Stories')} ({socialStories.length})</span>
          </button>
        </div>

        {/* Header Action Button */}
        {activeTab === 'adventures' ? (
          <button
            type="button"
            onClick={() => {
              setEditingAdventure(null);
              setIsAdventureModalOpen(true);
              playChime('tap');
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('Add Adventure')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingStory(null);
              setIsStoryModalOpen(true);
              playChime('tap');
            }}
            className={`px-4 py-2.5 rounded-2xl ${activeTheme?.palette?.primaryBg || 'bg-amber-500'} ${activeTheme?.palette?.primaryHover || 'hover:bg-amber-600'} text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer shrink-0`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('Add Social Story')}</span>
          </button>
        )}
      </div>

      {activeTab === 'adventures' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Create Custom Adventure Card */}
          <button
            type="button"
            onClick={() => {
              setEditingAdventure(null);
              setIsAdventureModalOpen(true);
              playChime('tap');
            }}
            className="w-full text-left rounded-3xl p-4 sm:p-5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/60 transition-all active:scale-98 cursor-pointer flex items-center gap-3.5 group"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 bg-white border-2 border-amber-300 group-hover:scale-105 transition shadow-2xs text-amber-600">
              <Plus className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block bg-amber-200/80 text-amber-950 mb-1">
                {t('Custom')}
              </span>
              <h3 className="font-black text-amber-950 text-base sm:text-lg leading-snug">
                + {t('Add Your Own Adventure')}
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                {t('Create personalized steps, sensory tips, and helpful AAC phrases for any outing.')}
              </p>
            </div>
          </button>

          {adventures.map((adventure) => {
            const cardClass = isColorCoded
              ? 'bg-white hover:bg-emerald-50/40 border-2 border-slate-200 hover:border-emerald-300'
              : `${themeStyles.card} !p-4 sm:!p-5 !rounded-3xl`;
            const iconBoxClass = isColorCoded
              ? 'w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs bg-emerald-50 border border-emerald-200'
              : `w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'}`;
            const badgeClass = isColorCoded
              ? 'text-emerald-700 bg-emerald-50'
              : themeStyles.adventureTag;
            const subtextClass = isColorCoded ? 'text-emerald-700' : (activeTheme?.palette?.textAccent || 'text-amber-900');

            return (
              <div
                key={adventure.id}
                className={`relative group ${cardClass} flex flex-col justify-between`}
              >
                <button
                  type="button"
                  aria-label={`Adventure: ${t(adventure.title)}. ${adventure.steps.length} steps. ${t(adventure.summary)}`}
                  onClick={() => {
                    setActiveAdventureId(adventure.id);
                    setAdventureSubTab('steps');
                    setCurrentStepIndex(0);
                    playChime('tap');
                  }}
                  className="w-full text-left cursor-pointer flex items-start gap-3.5 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                >
                  <div className={iconBoxClass} aria-hidden="true">
                    <RoutineStickerIcon
                      emoji={adventure.stickerSrc || getAdventureSticker(adventure.id) || adventure.emoji}
                      title={adventure.title}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${badgeClass}`}>
                        {t(adventure.category)}
                      </span>
                      {adventure.isCustom && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          {t('Custom')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 leading-snug">
                      {t(adventure.title)}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {t(adventure.summary)}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-400">
                      <span className="text-slate-600 font-bold">{adventure.steps.length} {t('steps')}</span>
                      <span>•</span>
                      <span className={subtextClass}>{t('Sensory guide')}</span>
                      {adventure.completedCount ? (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-black">
                            ⭐ {t('Done')} {adventure.completedCount}x
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </button>

                {adventure.isCustom && (
                  <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdventure(adventure);
                        setIsAdventureModalOpen(true);
                        playChime('tap');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title={t('Edit Adventure')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('Edit')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem({ type: 'adventure', id: adventure.id, title: adventure.title })}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title={t('Delete Adventure')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Delete')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Create Custom Story Card */}
          <button
            type="button"
            onClick={() => {
              setEditingStory(null);
              setIsStoryModalOpen(true);
              playChime('tap');
            }}
            className={`w-full text-left rounded-3xl p-4 sm:p-5 border-2 border-dashed ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} hover:border-amber-500 ${activeTheme?.palette?.primaryLight || 'bg-amber-50/50'} hover:opacity-90 transition-all active:scale-98 cursor-pointer flex items-center gap-3.5 group`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 bg-white border-2 ${activeTheme?.palette?.primaryBorder || 'border-amber-300'} group-hover:scale-105 transition shadow-2xs ${activeTheme?.palette?.textAccent || 'text-amber-600'}`}>
              <Plus className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${activeTheme?.palette?.badgeBg || 'bg-amber-200/80 text-amber-950'} mb-1`}>
                {t('Custom')}
              </span>
              <h3 className={`font-black ${activeTheme?.palette?.textAccent || 'text-amber-950'} text-base sm:text-lg leading-snug`}>
                + {t('Add Your Own Social Story')}
              </h3>
              <p className={`text-xs ${activeTheme?.palette?.textAccent || 'text-amber-800'} font-medium mt-0.5`}>
                {t('Write illustrated pages with comforting scripts, calming visuals, and takeaways.')}
              </p>
            </div>
          </button>

          {socialStories.map((story) => {
            const cardClass = isColorCoded
              ? 'bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
              : `${themeStyles.card} !p-4 sm:!p-5 !rounded-3xl`;
            const iconBoxClass = isColorCoded
              ? 'w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs bg-slate-50 border border-slate-200'
              : `w-16 h-16 rounded-2xl flex items-center justify-center p-1.5 shrink-0 shadow-2xs ${activeTheme?.palette?.primaryLight || 'bg-amber-50'} border ${activeTheme?.palette?.primaryBorder || 'border-amber-200'}`;
            const badgeClass = isColorCoded
              ? 'text-slate-700 bg-slate-100 border border-slate-200'
              : themeStyles.adventureTag;
            const subtextClass = isColorCoded ? 'text-slate-600' : (activeTheme?.palette?.textAccent || 'text-amber-900');

            return (
              <div
                key={story.id}
                className={`relative group ${cardClass} flex flex-col justify-between`}
              >
                <button
                  type="button"
                  aria-label={`Social Story: ${t(story.title)}. ${story.pages.length} pages.`}
                  onClick={() => {
                    setActiveStoryId(story.id);
                    setCurrentPageIndex(0);
                    playChime('tap');
                  }}
                  className="w-full text-left cursor-pointer flex items-start gap-3.5 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none"
                >
                  <div className={iconBoxClass} aria-hidden="true">
                    <RoutineStickerIcon
                      emoji={story.stickerSrc || getStorySticker(story.id) || story.emoji}
                      title={story.title}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block ${badgeClass}`}>
                        {story.category ? t(story.category) : t('Social Story')}
                      </span>
                      {story.isCustom && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${activeTheme?.palette?.badgeBg || 'bg-amber-100 text-amber-900 border border-amber-200'}`}>
                          {t('Custom')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 leading-snug">
                      {t(story.title)}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {story.summary ? t(story.summary) : `${story.pages.length} ${t('illustrated pages • Calm & predictable expectations')}`}
                    </p>
                    <div className={`mt-3 text-xs font-bold flex items-center gap-1 ${subtextClass}`}>
                      <span>{t('Read story')}</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </button>

                {story.isCustom && (
                  <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStory(story);
                        setIsStoryModalOpen(true);
                        playChime('tap');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title={t('Edit Social Story')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('Edit')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem({ type: 'story', id: story.id, title: story.title })}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title={t('Delete Social Story')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Delete')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ADVENTURE MODAL */}
      {isAdventureModalOpen && (
        <CreateAdventureModal
          isOpen={isAdventureModalOpen}
          onClose={() => {
            setIsAdventureModalOpen(false);
            setEditingAdventure(null);
          }}
          initialAdventure={editingAdventure}
        />
      )}

      {/* CREATE / EDIT SOCIAL STORY MODAL */}
      {isStoryModalOpen && (
        <CreateSocialStoryModal
          isOpen={isStoryModalOpen}
          onClose={() => {
            setIsStoryModalOpen(false);
            setEditingStory(null);
          }}
          initialStory={editingStory}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              {deletingItem.type === 'adventure' ? t('Delete Adventure?') : t('Delete Social Story?')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5">
              "{deletingItem.title}" {t('will be permanently removed.')}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingItem.type === 'adventure') {
                    deleteAdventure(deletingItem.id);
                  } else {
                    deleteSocialStory(deletingItem.id);
                  }
                  setDeletingItem(null);
                  playChime('clear');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-sm cursor-pointer"
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
