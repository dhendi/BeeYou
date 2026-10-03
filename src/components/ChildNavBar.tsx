import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home,
  MessageSquare, 
  CalendarDays, 
  Compass, 
  Smile,
  LayoutGrid,
  Hand
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const ChildNavBar: React.FC = () => {
  const { 
    childView, 
    setChildView, 
    setActiveAdventureId, 
    setActiveSkillId, 
    setActiveStoryId,
    userAgeGroup,
    enabledFeatures,
    settings,
    activeTheme,
    setShowToolsHubModal,
  } = useApp();

  const allNavItems = [
    {
      id: 'home',
      label: userAgeGroup === 'adult' ? 'Dashboard' : 'Home',
      emoji: '🏠',
      icon: Home,
      color: 'hover:bg-amber-100 text-amber-900 border-amber-300',
      activeBg: activeTheme?.palette?.navActiveBg || 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
      show: true,
    },
    {
      id: 'aac',
      label: userAgeGroup === 'adult' ? 'AAC Speech' : userAgeGroup === 'teen' ? 'Voice / AAC' : 'Communicate',
      emoji: activeTheme?.mascotEmoji || '🗣️',
      icon: MessageSquare,
      color: 'hover:bg-amber-100 text-amber-900 border-amber-300',
      activeBg: activeTheme?.palette?.navActiveBg || 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
      show: (enabledFeatures?.aacCommunication !== false) && (settings?.features?.aacCommunication !== false),
    },
    {
      id: 'my-day',
      label: userAgeGroup === 'adult' ? 'Schedule' : 'My Day',
      emoji: '📅',
      icon: CalendarDays,
      color: 'hover:bg-sky-100 text-sky-900 border-sky-300',
      activeBg: 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-500',
      show: true,
    },
    {
      id: 'adventures',
      label: userAgeGroup === 'adult' ? 'Guides' : userAgeGroup === 'teen' ? 'Scenarios' : 'Adventures',
      emoji: userAgeGroup === 'adult' ? '🧭' : '🚀',
      icon: Compass,
      color: 'hover:bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBg: 'bg-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-500',
      show: (enabledFeatures?.socialStories !== false) || (enabledFeatures?.lifeSkills !== false),
    },
    {
      id: 'tools',
      label: userAgeGroup === 'adult' ? 'Toolkit' : 'Tools',
      emoji: '🧰',
      icon: LayoutGrid,
      color: 'hover:bg-purple-100 text-purple-900 border-purple-300',
      activeBg: 'bg-purple-500 text-white shadow-md ring-2 ring-purple-500',
      show: true,
      action: () => setShowToolsHubModal(true),
    },
    {
      id: 'feelings',
      label: userAgeGroup === 'adult' ? 'Reflection' : userAgeGroup === 'teen' ? 'Mood' : 'Feelings',
      emoji: userAgeGroup === 'adult' ? '🧘' : userAgeGroup === 'teen' ? '🎧' : '💛',
      icon: Smile,
      color: 'hover:bg-rose-100 text-rose-900 border-rose-300',
      activeBg: 'bg-rose-400 text-rose-950 shadow-md ring-2 ring-rose-500',
      show: enabledFeatures?.dailyMoodRecollection !== false || enabledFeatures?.sensoryBreathingPacer !== false,
    },
    {
      id: 'asl',
      label: 'ASL',
      emoji: '🤟',
      icon: Hand,
      color: 'hover:bg-purple-100 text-purple-900 border-purple-300',
      activeBg: 'bg-purple-400 text-purple-950 shadow-md ring-2 ring-purple-500',
      show: true,
    },
  ];

  const navItems = allNavItems.filter(item => item.show);

  const handleNav = (item: any) => {
    if (item.action) {
      item.action();
      playChime('tap');
      return;
    }
    // Clear sub-details when switching tabs
    setActiveAdventureId(null);
    setActiveSkillId(null);
    setActiveStoryId(null);
    setChildView(item.id);
    playChime('tap');
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 sm:px-6 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-lg select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = childView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? item.activeBg
                  : `bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200`
              }`}
            >
              <span className="text-xl sm:text-2xl leading-none transition-transform select-none">
                {item.emoji}
              </span>
              <span className="text-[11px] sm:text-xs font-black tracking-tight mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

