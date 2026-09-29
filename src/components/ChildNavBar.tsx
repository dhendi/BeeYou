import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  CalendarDays, 
  Compass, 
  CheckCircle2, 
  Smile, 
  Home 
} from 'lucide-react';

export const ChildNavBar: React.FC = () => {
  const { childView, setChildView, setActiveAdventureId, setActiveSkillId, setActiveStoryId } = useApp();

  const navItems = [
    {
      id: 'aac',
      label: 'Communicate',
      emoji: '🗣️',
      icon: MessageSquare,
      color: 'hover:bg-amber-100 text-amber-900 border-amber-300',
      activeBg: 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500',
    },
    {
      id: 'my-day',
      label: 'My Day',
      emoji: '📅',
      icon: CalendarDays,
      color: 'hover:bg-sky-100 text-sky-900 border-sky-300',
      activeBg: 'bg-sky-400 text-sky-950 shadow-md ring-2 ring-sky-500',
    },
    {
      id: 'adventures',
      label: 'Adventures',
      emoji: '🚀',
      icon: Compass,
      color: 'hover:bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBg: 'bg-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-500',
    },
    {
      id: 'skills',
      label: 'Skills',
      emoji: '⭐',
      icon: CheckCircle2,
      color: 'hover:bg-purple-100 text-purple-900 border-purple-300',
      activeBg: 'bg-purple-400 text-purple-950 shadow-md ring-2 ring-purple-500',
    },
    {
      id: 'feelings',
      label: 'Feelings',
      emoji: '💛',
      icon: Smile,
      color: 'hover:bg-rose-100 text-rose-900 border-rose-300',
      activeBg: 'bg-rose-400 text-rose-950 shadow-md ring-2 ring-rose-500',
    },
    {
      id: 'my-world',
      label: 'My World',
      emoji: '🏡',
      icon: Home,
      color: 'hover:bg-teal-100 text-teal-900 border-teal-300',
      activeBg: 'bg-teal-400 text-teal-950 shadow-md ring-2 ring-teal-500',
    },
  ];

  const handleNav = (id: any) => {
    // Clear sub-details when switching tabs
    setActiveAdventureId(null);
    setActiveSkillId(null);
    setActiveStoryId(null);
    setChildView(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 sm:px-6 py-2 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = childView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-2xl transition-all active:scale-90 cursor-pointer ${
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
