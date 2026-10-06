import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home,
  MessageSquare, 
  CalendarDays, 
  LayoutGrid,
  MoreHorizontal
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { isMoreView } from '../data/navigation';

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
      activeBg: activeTheme?.palette?.navActiveBg || 'bg-[#D97706] text-white shadow-md ring-2 ring-amber-400',
      show: true,
    },
    {
      id: 'aac',
      label: 'Communicate',
      emoji: activeTheme?.mascotEmoji || '🗣️',
      icon: MessageSquare,
      activeBg: activeTheme?.palette?.navActiveBg || 'bg-[#D97706] text-white shadow-md ring-2 ring-amber-400',
      show: (enabledFeatures?.aacCommunication !== false) && (settings?.features?.aacCommunication !== false),
    },
    {
      id: 'my-day',
      label: userAgeGroup === 'adult' ? 'Schedule' : 'My Day',
      emoji: '📅',
      icon: CalendarDays,
      activeBg: 'bg-[#5B8266] text-white shadow-md ring-2 ring-[#82A792]',
      show: true,
    },
    {
      id: 'tools',
      label: userAgeGroup === 'adult' ? 'Toolkit' : 'Tools',
      emoji: '🧰',
      icon: LayoutGrid,
      activeBg: 'bg-[#1E293B] text-white shadow-md ring-2 ring-stone-400',
      show: true,
      action: () => setShowToolsHubModal(true),
    },
    {
      id: 'more',
      label: 'More',
      emoji: '✨',
      icon: MoreHorizontal,
      activeBg: 'bg-[#5B8266] text-white shadow-md ring-2 ring-[#82A792]',
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
    <nav className="w-full bg-white/75 backdrop-blur-2xl border-t border-white/80 px-2 sm:px-6 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] select-none transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-around gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const isActive = item.id === 'more' ? isMoreView(childView) : childView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? item.activeBg || 'bg-[#2D241E] text-white shadow-md shadow-stone-400/20 font-black'
                  : 'bg-white/60 text-stone-600 hover:bg-white/90 border border-white/70 hover:text-stone-900 font-bold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
                <Icon className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.4]" />
              </div>
              <span className="text-[11px] sm:text-xs font-black tracking-tight mt-0.5 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

