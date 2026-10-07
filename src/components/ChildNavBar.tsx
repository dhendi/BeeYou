import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home,
  Volume2,
  MessageSquare, 
  Heart,
  CalendarDays, 
  LayoutGrid
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

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
  } = useApp();

  const isAacEnabled = 
    enabledFeatures?.aacCommunication !== false && 
    enabledFeatures?.aac !== false && 
    settings?.features?.aacCommunication !== false && 
    settings?.features?.aac !== false;

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
      label: 'AAC',
      emoji: '🗣️',
      icon: Volume2,
      activeBg: 'bg-sky-600 text-white shadow-md ring-2 ring-sky-300',
      show: isAacEnabled,
    },
    {
      id: 'communicate',
      label: 'Communicate',
      emoji: '💬',
      icon: MessageSquare,
      activeBg: 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300',
      show: true,
    },
    {
      id: 'me',
      label: 'Me',
      emoji: '💛',
      icon: Heart,
      activeBg: 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300',
      show: true,
    },
    {
      id: 'my-routine',
      label: userAgeGroup === 'adult' ? 'Schedule' : 'My Routine',
      emoji: '📅',
      icon: CalendarDays,
      activeBg: 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300',
      show: true,
    },
    {
      id: 'tools',
      label: userAgeGroup === 'adult' ? 'Toolkit' : 'Tools',
      emoji: '🧰',
      icon: LayoutGrid,
      activeBg: 'bg-slate-800 text-white shadow-md ring-2 ring-stone-400',
      show: true,
    },
  ];

  const navItems = allNavItems.filter(item => item.show);

  const handleNav = (item: any) => {
    setActiveAdventureId(null);
    setActiveSkillId(null);
    setActiveStoryId(null);
    setChildView(item.id);
    playChime('tap');
  };

  const isItemActive = (itemId: string) => {
    if (childView === itemId) return true;
    if (itemId === 'my-routine' && (childView === 'my-day' || childView === 'adventures' || childView === 'skills')) return true;
    if (itemId === 'me' && (childView === 'feelings')) return true;
    return false;
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-2xl border-t border-white/80 px-2 sm:px-4 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] select-none transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item.id);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? item.activeBg || 'bg-[#2D241E] text-white shadow-md font-black'
                  : 'bg-white/60 text-stone-600 hover:bg-white/90 border border-white/70 hover:text-stone-900 font-bold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
              </div>
              <span className="text-[10px] sm:text-xs font-black tracking-tight mt-0.5 truncate max-w-full">
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

