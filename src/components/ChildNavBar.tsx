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
import { AppTheme } from '../types';

export interface ChildNavBarProps {
  previewTheme?: AppTheme;
}

export const ChildNavBar: React.FC<ChildNavBarProps> = ({ previewTheme }) => {
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

  const effectiveTheme = previewTheme || activeTheme;

  const isAacEnabled = 
    enabledFeatures?.aacCommunication !== false && 
    enabledFeatures?.aac !== false && 
    settings?.features?.aacCommunication !== false && 
    settings?.features?.aac !== false;

  const getActiveColor = (itemId: string): string => {
    if (userAgeGroup === 'adult') {
      return 'text-blue-600 dark:text-blue-400';
    }
    switch (itemId) {
      case 'home':
        return effectiveTheme?.palette?.textAccent?.replace('text-', 'text-') || 'text-amber-600 dark:text-amber-400';
      case 'aac':
        return 'text-sky-600 dark:text-sky-400';
      case 'communicate':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'me':
        return 'text-rose-500 dark:text-rose-400';
      case 'my-routine':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'tools':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const allNavItems = [
    {
      id: 'home',
      label: userAgeGroup === 'adult' ? 'Dashboard' : 'Home',
      icon: Home,
      show: true,
    },
    {
      id: 'aac',
      label: 'AAC',
      icon: Volume2,
      show: isAacEnabled,
    },
    {
      id: 'communicate',
      label: 'Communicate',
      icon: MessageSquare,
      show: isAacEnabled,
    },
    {
      id: 'me',
      label: 'Me',
      icon: Heart,
      show: true,
    },
    {
      id: 'my-routine',
      label: userAgeGroup === 'adult' ? 'Schedule' : 'My Routine',
      icon: CalendarDays,
      show: true,
    },
    {
      id: 'tools',
      label: userAgeGroup === 'adult' ? 'Toolkit' : 'Tools',
      icon: LayoutGrid,
      show: true,
    },
  ];

  const navItems = allNavItems.filter((item) => item.show);

  const handleNav = (item: any) => {
    if (previewTheme) {
      playChime('tap');
      return;
    }
    setActiveAdventureId(null);
    setActiveSkillId(null);
    setActiveStoryId(null);
    setChildView(item.id);
    playChime('tap');

    if (item.id === 'aac') {
      try {
        const promptDone = localStorage.getItem('beeyou_aac_prompt_completed');
        if (promptDone !== 'true') {
          window.dispatchEvent(new CustomEvent('beeyou_open_aac_prompt'));
        }
      } catch {}
    }
  };

  const isItemActive = (itemId: string) => {
    if (childView === itemId) return true;
    if (itemId === 'my-routine' && (childView === 'my-day' || childView === 'adventures' || childView === 'skills')) return true;
    if (itemId === 'me' && (childView === 'feelings')) return true;
    return false;
  };

  return (
    <nav className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 px-2 sm:px-4 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item.id);
          const Icon = item.icon;
          const activeColor = getActiveColor(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 bg-transparent transition-all active:scale-95 cursor-pointer"
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] transition-colors ${
                  isActive ? activeColor : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              />
              <span
                className={`text-[10px] sm:text-xs tracking-tight mt-1 truncate max-w-full transition-colors ${
                  isActive
                    ? `${activeColor} font-black`
                    : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                {t(item.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
