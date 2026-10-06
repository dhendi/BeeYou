import React from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

interface MoreItem {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  show: boolean;
  onOpen: () => void;
}

interface MoreSection {
  id: string;
  title: string;
  emoji: string;
  items: MoreItem[];
}

/**
 * "More" hub: everything that does not need a permanent bottom-nav slot.
 * Items are filtered by the existing enabledFeatures / userAgeGroup state,
 * and empty sections are hidden, so users only see what they have turned on.
 */
export const MoreView: React.FC = () => {
  const {
    setChildView,
    setActiveAdventureId,
    setActiveSkillId,
    setActiveStoryId,
    enabledFeatures,
    userAgeGroup,
    setShowMedicationModal,
    setShowMoodJournalModal,
    setShowCycleTrackerModal,
    setShowRecollectionModal,
    setShowCaregiverModal,
    setShowCaregiverAlertModal,
    setShowPinModal,
    setShowAboutMeModal,
    setShowThemeModal,
    setShowAccessibilityModal,
    setShowToolsHubModal,
  } = useApp();

  const on = (key: keyof NonNullable<typeof enabledFeatures>) => enabledFeatures?.[key] !== false;
  const teenOrAdult = userAgeGroup === 'teen' || userAgeGroup === 'adult';

  const go = (view: 'adventures' | 'skills' | 'feelings' | 'rewards' | 'my-world') => () => {
    setActiveAdventureId(null);
    setActiveSkillId(null);
    setActiveStoryId(null);
    setChildView(view);
  };

  const sections: MoreSection[] = [
    {
      id: 'skills',
      title: 'Skills & Stories',
      emoji: '🚀',
      items: [
        {
          id: 'adventures',
          title: userAgeGroup === 'adult' ? 'Guides' : userAgeGroup === 'teen' ? 'Scenarios' : 'Adventures',
          desc: 'Get ready for new places and social situations',
          emoji: '🧭',
          show: on('socialStories') || on('lifeSkills'),
          onOpen: go('adventures'),
        },
        {
          id: 'skills',
          title: 'Life skills',
          desc: 'Step-by-step help with everyday skills',
          emoji: '🧺',
          show: on('lifeSkills'),
          onOpen: go('skills'),
        },
      ],
    },
    {
      id: 'feelings',
      title: 'Feelings & Wellness',
      emoji: '💛',
      items: [
        {
          id: 'feelings',
          title: userAgeGroup === 'adult' ? 'Reflection' : userAgeGroup === 'teen' ? 'Mood' : 'Feelings',
          desc: 'Check in with how you feel',
          emoji: '💛',
          show: on('dailyMoodRecollection') || on('sensoryBreathingPacer'),
          onOpen: go('feelings'),
        },
        {
          id: 'mood-journal',
          title: 'Mood journal',
          desc: 'Write down feelings and triggers',
          emoji: '📖',
          show: teenOrAdult && on('moodJournal'),
          onOpen: () => setShowMoodJournalModal(true),
        },
        {
          id: 'evening',
          title: 'Evening reflection',
          desc: 'Look back on your day',
          emoji: '🌙',
          show: on('dailyMoodRecollection'),
          onOpen: () => setShowRecollectionModal(true),
        },
      ],
    },
    {
      id: 'health',
      title: 'Health',
      emoji: '💊',
      items: [
        {
          id: 'medication',
          title: 'Medication',
          desc: 'Reminders and supply tracking',
          emoji: '💊',
          show: on('medicationReminders'),
          onOpen: () => setShowMedicationModal(true),
        },
        {
          id: 'cycle',
          title: 'Cycle & rhythm',
          desc: 'Body and sensory rhythm tracking',
          emoji: '🌸',
          show: teenOrAdult && on('cycleTracker'),
          onOpen: () => setShowCycleTrackerModal(true),
        },
      ],
    },
    {
      id: 'caregiver',
      title: 'Caregiver',
      emoji: '🤝',
      items: [
        {
          id: 'alert',
          title: 'Ask for help',
          desc: 'Send a message to a trusted person',
          emoji: '🚨',
          show: on('emergencyAlertSOS'),
          onOpen: () => setShowCaregiverAlertModal(true),
        },
        {
          id: 'connect',
          title: 'Connect caregiver',
          desc: 'Link a parent, teacher or helper',
          emoji: '🔗',
          show: true,
          onOpen: () => setShowCaregiverModal(true),
        },
        {
          id: 'parent',
          title: 'Parent dashboard',
          desc: 'Adult settings (PIN protected)',
          emoji: '🔒',
          show: true,
          onOpen: () => setShowPinModal(true),
        },
      ],
    },
    {
      id: 'personal',
      title: 'Personal',
      emoji: '🎨',
      items: [
        {
          id: 'rewards',
          title: 'Rewards',
          desc: 'Stars, badges and stickers',
          emoji: '⭐',
          show: on('starsAndRewards'),
          onOpen: go('rewards'),
        },
        {
          id: 'my-world',
          title: 'My World',
          desc: 'Decorate your own space',
          emoji: '🏡',
          show: on('starsAndRewards'),
          onOpen: go('my-world'),
        },
        {
          id: 'themes',
          title: 'Themes & avatar',
          desc: 'Change how BeeYou looks',
          emoji: '🎨',
          show: true,
          onOpen: () => setShowThemeModal(true),
        },
        {
          id: 'about',
          title: 'About me',
          desc: 'Your ID card and information',
          emoji: '🪪',
          show: true,
          onOpen: () => setShowAboutMeModal(true),
        },
        {
          id: 'access',
          title: 'Accessibility & features',
          desc: 'Choose what BeeYou helps you with',
          emoji: '♿',
          show: true,
          onOpen: () => setShowAccessibilityModal(true),
        },
      ],
    },
  ];

  const visibleSections = sections
    .map((s) => ({ ...s, items: s.items.filter((i) => i.show) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-5">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2D241E]">More</h1>
        <p className="text-xs sm:text-sm text-[#7A6C60] font-semibold">
          Everything else in BeeYou. Turn sections on or off in Accessibility &amp; features.
        </p>
      </header>

      <button
        onClick={() => {
          setShowToolsHubModal(true);
          playChime('tap');
        }}
        className="w-full min-h-[60px] rounded-3xl bg-[#F5B865] hover:bg-[#EDA548] border-2 border-[#E2A44E] text-[#4A2F0F] font-black text-base flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer transition-all shadow-[0_4px_14px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)]"
      >
        <span aria-hidden="true" className="text-2xl">🧰</span>
        <span>Open Tools Hub</span>
      </button>

      {visibleSections.map((section) => (
        <section key={section.id} aria-labelledby={`more-${section.id}`}>
          <h2 id={`more-${section.id}`} className="text-xs font-black uppercase tracking-wider text-[#8C7E72] mb-2.5 flex items-center gap-1.5">
            <span aria-hidden="true">{section.emoji}</span>
            <span>{section.title}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playChime('tap');
                  item.onOpen();
                }}
                className="min-h-[76px] p-4 rounded-3xl bg-[#FCF9F2] hover:bg-white border-2 border-[#E0D8CB] text-left flex items-center gap-3.5 active:scale-98 transition-all cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.04),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)]"
              >
                <span className="w-12 h-12 rounded-2xl bg-[#F5EFE6] text-3xl flex items-center justify-center border border-[#E0D8CB] shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block font-black text-[#2D241E] text-base leading-snug">{item.title}</span>
                  <span className="block text-xs text-[#7A6C60] font-semibold mt-0.5 leading-normal">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
