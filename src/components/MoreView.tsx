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
          desc: 'Change how Lumina looks',
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
          desc: 'Choose what Lumina helps you with',
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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">More</h1>
        <p className="text-sm text-slate-600 font-medium">
          Everything else in Lumina. Turn sections on or off in Accessibility &amp; features.
        </p>
      </header>

      <button
        onClick={() => {
          setShowToolsHubModal(true);
          playChime('tap');
        }}
        className="w-full min-h-[64px] rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-950 font-black text-base flex items-center justify-center gap-2 active:scale-98"
      >
        <span aria-hidden="true">🧰</span> Open Tools
      </button>

      {visibleSections.map((section) => (
        <section key={section.id} aria-labelledby={`more-${section.id}`}>
          <h2 id={`more-${section.id}`} className="text-sm font-black uppercase tracking-wide text-slate-500 mb-2">
            <span aria-hidden="true">{section.emoji}</span> {section.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playChime('tap');
                  item.onOpen();
                }}
                className="min-h-[72px] p-4 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50 text-left flex items-center gap-3 active:scale-98 transition"
              >
                <span className="text-3xl shrink-0" aria-hidden="true">{item.emoji}</span>
                <span className="min-w-0">
                  <span className="block font-black text-slate-900 text-base">{item.title}</span>
                  <span className="block text-xs text-slate-600 font-medium">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
