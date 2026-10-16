import { AppTheme } from '../types';

export interface ThemeWidgetStyles {
  // Base card styling for tool widgets
  card: string;
  // Outer container for schedule
  scheduleContainer: string;
  scheduleHeader: string;
  scheduleLink: string;
  // First/Then step items
  firstStep: string;
  thenStep: string;
  stepIconBox: string;
  stepCheckActive: string;
  stepCheckInactive: string;
  // Mascot companion banner
  mascotBanner: string;
  mascotBadge: string;
  mascotButton: string;
  // Top header bar
  headerBar: string;
  headerButton: string;
  headerText: string;
  headerSubtext: string;
  // Bottom customize / reorder button
  dashedButton: string;
  dashedIcon: string;
  // Adventure spotlight
  adventureTag: string;
  // Quick AAC buttons
  quickAacTalk: string;
  quickAacCalm: string;
  quickAacHelp: string;
  // Silicone tray strip
  feedbackStrip: string;
}

/**
 * Returns dynamic theme widget styles based on the active theme.
 * Defaults to the signature sunny yellow / amber Bee theme ('theme-classic').
 */
export function getThemeWidgetStyles(theme?: AppTheme | null): ThemeWidgetStyles {
  const themeId = theme?.id || 'theme-classic';
  const category = theme?.category || 'classic';

  // 1. TURTLE SANCTUARY (Emerald / Teal)
  if (themeId === 'theme-turtle' || category === 'turtle') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(5,150,105,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-emerald-300/80 bg-emerald-50/40 text-emerald-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-emerald-900/80',
      scheduleLink: 'text-xs font-bold text-emerald-900 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-emerald-100/70 hover:bg-emerald-100 border-2 border-emerald-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border-2 border-emerald-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-emerald-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-emerald-400 text-emerald-950 border-emerald-500 font-black',
      stepCheckInactive: 'bg-white text-emerald-400 border-emerald-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50/60 text-emerald-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-emerald-100 text-emerald-950 border-2 border-emerald-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-emerald-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-emerald-500/70 focus-visible:outline-none',
      headerBar: 'bg-emerald-50/40 border-2 border-emerald-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-emerald-100/70 hover:bg-emerald-200 text-emerald-950 border border-emerald-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-emerald-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-emerald-950 leading-tight',
      headerSubtext: 'text-xs text-emerald-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 hover:text-emerald-950 border-2 border-dashed border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-emerald-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-emerald-200/90 hover:bg-emerald-300 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(5,150,105,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-emerald-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(5,150,105,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-emerald-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(5,150,105,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-emerald-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300/80 text-xs text-emerald-900 font-bold transition-all',
    };
  }

  // 2. DINOSAUR KINGDOM (Jungle Green / Amber)
  if (themeId === 'theme-dino' || category === 'dinosaur') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-green-300/80 bg-green-50/40 hover:bg-green-50/80 text-green-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(22,163,74,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-green-300/80 bg-green-50/40 text-green-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-green-900/80',
      scheduleLink: 'text-xs font-bold text-green-900 hover:text-green-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-green-100/70 hover:bg-green-100 border-2 border-green-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-green-50 hover:bg-green-100/70 border-2 border-green-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-green-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-green-400 text-green-950 border-green-500 font-black',
      stepCheckInactive: 'bg-white text-green-400 border-green-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-green-300/80 bg-green-50/40 hover:bg-green-50/60 text-green-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-green-100 text-green-950 border-2 border-green-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-green-100 hover:bg-green-200 text-green-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-green-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-green-500/70 focus-visible:outline-none',
      headerBar: 'bg-green-50/40 border-2 border-green-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-green-100/70 hover:bg-green-200 text-green-950 border border-green-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-green-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-green-950 leading-tight',
      headerSubtext: 'text-xs text-green-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-green-50/50 hover:bg-green-100/70 text-green-900 hover:text-green-950 border-2 border-dashed border-green-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-green-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100 border border-green-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-green-200/90 hover:bg-green-300 text-green-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(22,163,74,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-green-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-green-100 hover:bg-green-200 text-green-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(22,163,74,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-green-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-green-100 hover:bg-green-200 text-green-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(22,163,74,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-green-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-green-50/70 border border-green-300/80 text-xs text-green-900 font-bold transition-all',
    };
  }

  // 3. FROG POND (Lime / Green)
  if (themeId === 'theme-frog' || category === 'frog') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-lime-300/80 bg-lime-50/40 hover:bg-lime-50/80 text-lime-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(101,163,13,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-lime-300/80 bg-lime-50/40 text-lime-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-lime-900/80',
      scheduleLink: 'text-xs font-bold text-lime-900 hover:text-lime-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-lime-100/70 hover:bg-lime-100 border-2 border-lime-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-lime-50 hover:bg-lime-100/70 border-2 border-lime-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-lime-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-lime-400 text-lime-950 border-lime-500 font-black',
      stepCheckInactive: 'bg-white text-lime-400 border-lime-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-lime-300/80 bg-lime-50/40 hover:bg-lime-50/60 text-lime-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-lime-100 text-lime-950 border-2 border-lime-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-lime-100 hover:bg-lime-200 text-lime-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-lime-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-lime-500/70 focus-visible:outline-none',
      headerBar: 'bg-lime-50/40 border-2 border-lime-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-lime-100/70 hover:bg-lime-200 text-lime-950 border border-lime-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-lime-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-lime-950 leading-tight',
      headerSubtext: 'text-xs text-lime-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-lime-50/50 hover:bg-lime-100/70 text-lime-900 hover:text-lime-950 border-2 border-dashed border-lime-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-lime-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-100 border border-lime-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-lime-200/90 hover:bg-lime-300 text-lime-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(101,163,13,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-lime-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-lime-100 hover:bg-lime-200 text-lime-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(101,163,13,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-lime-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-lime-100 hover:bg-lime-200 text-lime-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(101,163,13,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-lime-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-lime-50/70 border border-lime-300/80 text-xs text-lime-900 font-bold transition-all',
    };
  }

  // 4. STEAM TRAINS (Sky / Steel Blue)
  if (themeId === 'theme-trains' || category === 'train') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-sky-300/80 bg-sky-50/40 hover:bg-sky-50/80 text-sky-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(2,132,199,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-sky-300/80 bg-sky-50/40 text-sky-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-sky-900/80',
      scheduleLink: 'text-xs font-bold text-sky-900 hover:text-sky-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-sky-100/70 hover:bg-sky-100 border-2 border-sky-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 border-2 border-sky-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-sky-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-sky-400 text-sky-950 border-sky-500 font-black',
      stepCheckInactive: 'bg-white text-sky-400 border-sky-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-sky-300/80 bg-sky-50/40 hover:bg-sky-50/60 text-sky-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-sky-100 text-sky-950 border-2 border-sky-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-sky-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-sky-500/70 focus-visible:outline-none',
      headerBar: 'bg-sky-50/40 border-2 border-sky-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-sky-100/70 hover:bg-sky-200 text-sky-950 border border-sky-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-sky-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-sky-950 leading-tight',
      headerSubtext: 'text-xs text-sky-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-sky-50/50 hover:bg-sky-100/70 text-sky-900 hover:text-sky-950 border-2 border-dashed border-sky-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-sky-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-sky-200/90 hover:bg-sky-300 text-sky-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(2,132,199,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-sky-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(2,132,199,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-sky-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-sky-100 hover:bg-sky-200 text-sky-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(2,132,199,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-sky-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-sky-50/70 border border-sky-300/80 text-xs text-sky-900 font-bold transition-all',
    };
  }

  // 5. COSMIC SPACE (Purple / Cosmic Violet)
  if (themeId === 'theme-space' || category === 'space') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/80 text-purple-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(124,58,237,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-purple-300/80 bg-purple-50/40 text-purple-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-purple-900/80',
      scheduleLink: 'text-xs font-bold text-purple-900 hover:text-purple-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-purple-100/70 hover:bg-purple-100 border-2 border-purple-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-purple-50 hover:bg-purple-100/70 border-2 border-purple-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-purple-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-purple-400 text-purple-950 border-purple-500 font-black',
      stepCheckInactive: 'bg-white text-purple-400 border-purple-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-purple-300/80 bg-purple-50/40 hover:bg-purple-50/60 text-purple-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-purple-100 text-purple-950 border-2 border-purple-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-purple-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-purple-500/70 focus-visible:outline-none',
      headerBar: 'bg-purple-50/40 border-2 border-purple-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-purple-100/70 hover:bg-purple-200 text-purple-950 border border-purple-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-purple-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-purple-950 leading-tight',
      headerSubtext: 'text-xs text-purple-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 hover:text-purple-950 border-2 border-dashed border-purple-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-purple-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-purple-200/90 hover:bg-purple-300 text-purple-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(124,58,237,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-purple-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-purple-100 hover:bg-purple-200 text-purple-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(124,58,237,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-purple-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-purple-100 hover:bg-purple-200 text-purple-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(124,58,237,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-purple-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 border border-purple-300/80 text-xs text-purple-900 font-bold transition-all',
    };
  }

  // 6. OCEAN SPLASH (Cyan / Aquamarine)
  if (themeId === 'theme-ocean' || category === 'ocean') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-cyan-300/80 bg-cyan-50/40 hover:bg-cyan-50/80 text-cyan-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(8,145,178,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-cyan-300/80 bg-cyan-50/40 text-cyan-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-cyan-900/80',
      scheduleLink: 'text-xs font-bold text-cyan-900 hover:text-cyan-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-cyan-100/70 hover:bg-cyan-100 border-2 border-cyan-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100/70 border-2 border-cyan-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-cyan-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-cyan-400 text-cyan-950 border-cyan-500 font-black',
      stepCheckInactive: 'bg-white text-cyan-400 border-cyan-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-cyan-300/80 bg-cyan-50/40 hover:bg-cyan-50/60 text-cyan-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-cyan-100 text-cyan-950 border-2 border-cyan-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-cyan-100 hover:bg-cyan-200 text-cyan-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-cyan-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-cyan-500/70 focus-visible:outline-none',
      headerBar: 'bg-cyan-50/40 border-2 border-cyan-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-cyan-100/70 hover:bg-cyan-200 text-cyan-950 border border-cyan-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-cyan-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-cyan-950 leading-tight',
      headerSubtext: 'text-xs text-cyan-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-cyan-50/50 hover:bg-cyan-100/70 text-cyan-900 hover:text-cyan-950 border-2 border-dashed border-cyan-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-cyan-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-100 border border-cyan-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-cyan-200/90 hover:bg-cyan-300 text-cyan-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(8,145,178,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(8,145,178,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(8,145,178,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-cyan-50/70 border border-cyan-300/80 text-xs text-cyan-900 font-bold transition-all',
    };
  }

  // 7. TURBO SPEEDWAY (Red / Crimson)
  if (themeId === 'theme-racing' || category === 'racing') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-red-300/80 bg-red-50/40 hover:bg-red-50/80 text-red-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(220,38,38,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-red-300/80 bg-red-50/40 text-red-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-red-900/80',
      scheduleLink: 'text-xs font-bold text-red-900 hover:text-red-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-red-100/70 hover:bg-red-100 border-2 border-red-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-red-50 hover:bg-red-100/70 border-2 border-red-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-red-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-red-400 text-red-950 border-red-500 font-black',
      stepCheckInactive: 'bg-white text-red-400 border-red-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-red-300/80 bg-red-50/40 hover:bg-red-50/60 text-red-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-red-100 text-red-950 border-2 border-red-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-red-100 hover:bg-red-200 text-red-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-red-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-red-500/70 focus-visible:outline-none',
      headerBar: 'bg-red-50/40 border-2 border-red-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-red-100/70 hover:bg-red-200 text-red-950 border border-red-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-red-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-red-950 leading-tight',
      headerSubtext: 'text-xs text-red-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-red-50/50 hover:bg-red-100/70 text-red-900 hover:text-red-950 border-2 border-dashed border-red-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-red-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-red-200/90 hover:bg-red-300 text-red-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(220,38,38,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-red-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-red-100 hover:bg-red-200 text-red-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(220,38,38,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-red-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-red-100 hover:bg-red-200 text-red-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(220,38,38,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-red-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-red-50/70 border border-red-300/80 text-xs text-red-900 font-bold transition-all',
    };
  }

  // 8. MAGIC FAIRYTALE (Pink / Rose)
  if (themeId === 'theme-fantasy' || category === 'fantasy') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-pink-300/80 bg-pink-50/40 hover:bg-pink-50/80 text-pink-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(219,39,119,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-pink-300/80 bg-pink-50/40 text-pink-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-pink-900/80',
      scheduleLink: 'text-xs font-bold text-pink-900 hover:text-pink-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-pink-100/70 hover:bg-pink-100 border-2 border-pink-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-pink-50 hover:bg-pink-100/70 border-2 border-pink-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-pink-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-pink-400 text-pink-950 border-pink-500 font-black',
      stepCheckInactive: 'bg-white text-pink-400 border-pink-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-pink-300/80 bg-pink-50/40 hover:bg-pink-50/60 text-pink-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-pink-100 text-pink-950 border-2 border-pink-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-pink-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-pink-500/70 focus-visible:outline-none',
      headerBar: 'bg-pink-50/40 border-2 border-pink-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-pink-100/70 hover:bg-pink-200 text-pink-950 border border-pink-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-pink-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-pink-950 leading-tight',
      headerSubtext: 'text-xs text-pink-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-pink-50/50 hover:bg-pink-100/70 text-pink-900 hover:text-pink-950 border-2 border-dashed border-pink-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-pink-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-pink-800 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-pink-200/90 hover:bg-pink-300 text-pink-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(219,39,119,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-pink-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-pink-100 hover:bg-pink-200 text-pink-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(219,39,119,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-pink-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-pink-100 hover:bg-pink-200 text-pink-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(219,39,119,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-pink-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-pink-50/70 border border-pink-300/80 text-xs text-pink-900 font-bold transition-all',
    };
  }

  // 9. LO-FI STUDY & CHILL (Deep Violet / Twilight)
  if (themeId === 'theme-lofi' || category === 'lofi') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-violet-800/80 bg-violet-950/40 hover:bg-violet-950/70 text-violet-100 shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_14px_rgba(139,92,246,0.15)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-violet-800/80 bg-violet-950/40 text-violet-100 shadow-[0_2px_8px_rgba(0,0,0,0.2)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-violet-300',
      scheduleLink: 'text-xs font-bold text-violet-300 hover:text-violet-100 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-violet-900/60 hover:bg-violet-900/80 border-2 border-violet-700/80 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-violet-100',
      thenStep: 'w-full p-3 rounded-xl bg-violet-950/70 hover:bg-violet-900/60 border-2 border-violet-800/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-violet-200',
      stepIconBox: 'w-7 h-7 rounded-lg bg-violet-900/80 border border-violet-600 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-violet-500 text-white border-violet-400 font-black',
      stepCheckInactive: 'bg-violet-950 text-violet-500 border-violet-700',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-violet-800/80 bg-violet-950/40 hover:bg-violet-950/60 text-violet-100 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-violet-900/80 text-violet-100 border-2 border-violet-600 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-violet-900/70 hover:bg-violet-800 text-violet-100 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-2 border-violet-700 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-violet-500/70 focus-visible:outline-none',
      headerBar: 'bg-violet-950/50 border-2 border-violet-800/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 text-violet-100',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-violet-900/70 hover:bg-violet-800 text-violet-100 border border-violet-700 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-violet-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-violet-100 leading-tight',
      headerSubtext: 'text-xs text-violet-300 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-violet-950/50 hover:bg-violet-900/60 text-violet-200 hover:text-violet-100 border-2 border-dashed border-violet-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-violet-300',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-violet-200 bg-violet-900/80 border border-violet-700 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(139,92,246,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-violet-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-violet-800 hover:bg-violet-700 text-violet-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(139,92,246,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-violet-600',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-violet-800 hover:bg-violet-700 text-violet-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(139,92,246,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-violet-600',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-violet-950/70 border border-violet-700 text-xs text-violet-200 font-bold transition-all',
    };
  }

  // 10. CYBER NEON (Electric Cyan / Synth Dark)
  if (themeId === 'theme-cyber' || category === 'cyber') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-cyan-600/80 bg-slate-900/80 hover:bg-slate-900 text-cyan-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_14px_rgba(6,182,212,0.2)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-cyan-600/80 bg-slate-900/80 text-cyan-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-cyan-300',
      scheduleLink: 'text-xs font-bold text-cyan-300 hover:text-cyan-100 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border-2 border-cyan-500/80 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-cyan-100',
      thenStep: 'w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border-2 border-cyan-600/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-cyan-200',
      stepIconBox: 'w-7 h-7 rounded-lg bg-slate-800 border border-cyan-400 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-cyan-500 text-slate-950 border-cyan-300 font-black',
      stepCheckInactive: 'bg-slate-950 text-cyan-500 border-cyan-700',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-cyan-600/80 bg-slate-900/80 hover:bg-slate-900 text-cyan-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-cyan-950 text-cyan-300 border-2 border-cyan-500 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-cyan-600 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-cyan-500/70 focus-visible:outline-none',
      headerBar: 'bg-slate-900/80 border-2 border-cyan-600/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 text-cyan-100',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-600 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-cyan-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-cyan-100 leading-tight',
      headerSubtext: 'text-xs text-cyan-300 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-cyan-200 hover:text-cyan-100 border-2 border-dashed border-cyan-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-cyan-300',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-cyan-200 bg-cyan-950 border border-cyan-500 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(6,182,212,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-300',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(6,182,212,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-600',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-cyan-950 hover:bg-cyan-900 text-cyan-200 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(6,182,212,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-cyan-600',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-cyan-600 text-xs text-cyan-200 font-bold transition-all',
    };
  }

  // 11. EXECUTIVE SAGE (Teal / Sage)
  if (themeId === 'theme-sage' || category === 'executive') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/80 text-teal-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(15,118,110,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-teal-300/80 bg-teal-50/40 text-teal-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-teal-900/80',
      scheduleLink: 'text-xs font-bold text-teal-900 hover:text-teal-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-teal-100/70 hover:bg-teal-100 border-2 border-teal-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100/70 border-2 border-teal-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-teal-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-teal-500 text-white border-teal-600 font-black',
      stepCheckInactive: 'bg-white text-teal-500 border-teal-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-teal-300/80 bg-teal-50/40 hover:bg-teal-50/60 text-teal-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-teal-100 text-teal-950 border-2 border-teal-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-teal-100 hover:bg-teal-200 text-teal-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-teal-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-teal-500/70 focus-visible:outline-none',
      headerBar: 'bg-teal-50/40 border-2 border-teal-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-teal-100/70 hover:bg-teal-200 text-teal-950 border border-teal-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-teal-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-teal-950 leading-tight',
      headerSubtext: 'text-xs text-teal-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-teal-50/50 hover:bg-teal-100/70 text-teal-900 hover:text-teal-950 border-2 border-dashed border-teal-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-teal-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-teal-200/90 hover:bg-teal-300 text-teal-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(15,118,110,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-teal-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-teal-100 hover:bg-teal-200 text-teal-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(15,118,110,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-teal-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-teal-100 hover:bg-teal-200 text-teal-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(15,118,110,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-teal-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-300/80 text-xs text-teal-900 font-bold transition-all',
    };
  }

  // 12. ESPRESSO MINIMAL (Warm Roasted Caramel / Dark Amber)
  if (themeId === 'theme-espresso') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-amber-700/60 bg-amber-900/10 hover:bg-amber-900/15 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(120,53,15,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-amber-700/60 bg-amber-900/10 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-amber-900',
      scheduleLink: 'text-xs font-bold text-amber-900 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-700/60 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-stone-900',
      thenStep: 'w-full p-3 rounded-xl bg-stone-100 hover:bg-amber-100 border-2 border-amber-700/50 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-stone-900',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-amber-700 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-amber-800 text-white border-amber-900 font-black',
      stepCheckInactive: 'bg-white text-amber-700 border-amber-500',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-amber-700/60 bg-amber-900/10 hover:bg-amber-900/15 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-amber-100 text-stone-900 border-2 border-amber-700 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-amber-100 hover:bg-amber-200 text-stone-900 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-amber-700 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-700/70 focus-visible:outline-none',
      headerBar: 'bg-amber-900/10 border-2 border-amber-700/60 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-900',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-900 border border-amber-700/60 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-700/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-stone-900 leading-tight',
      headerSubtext: 'text-xs text-amber-900 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-stone-900 border-2 border-dashed border-amber-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-amber-800',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-amber-950 bg-amber-100 border border-amber-700 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-amber-800 hover:bg-amber-700 text-amber-50 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(120,53,15,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-amber-900',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-stone-900 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(120,53,15,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-amber-700',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-stone-900 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(120,53,15,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-amber-700',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-stone-100 border border-amber-700 text-xs text-stone-900 font-bold transition-all',
    };
  }

  // 13. TWILIGHT LOW-SENSORY DARK (Deep Slate / Night Sky)
  if (themeId === 'theme-twilight' || (category === 'dark' && themeId !== 'theme-midnight')) {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 hover:bg-slate-800/90 text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_14px_rgba(56,189,248,0.12)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-slate-700 bg-slate-800/60 text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-sky-300',
      scheduleLink: 'text-xs font-bold text-sky-300 hover:text-sky-100 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-slate-100',
      thenStep: 'w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/70 border-2 border-slate-700 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-slate-200',
      stepIconBox: 'w-7 h-7 rounded-lg bg-slate-700 border border-slate-500 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-sky-500 text-slate-950 border-sky-400 font-black',
      stepCheckInactive: 'bg-slate-900 text-sky-400 border-slate-600',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-slate-700 bg-slate-800/60 hover:bg-slate-800/80 text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-slate-700 text-slate-100 border-2 border-slate-600 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-100 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-2 border-slate-600 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-sky-500/70 focus-visible:outline-none',
      headerBar: 'bg-slate-800/60 border-2 border-slate-700 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-100',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-sky-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-slate-100 leading-tight',
      headerSubtext: 'text-xs text-sky-300 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-slate-800/60 hover:bg-slate-750 text-slate-200 hover:text-slate-100 border-2 border-dashed border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-sky-400',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-sky-200 bg-slate-700 border border-slate-600 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(56,189,248,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-sky-300',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-slate-700 hover:bg-slate-650 text-slate-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(56,189,248,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-slate-600',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-slate-700 hover:bg-slate-650 text-slate-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(56,189,248,0.25)] active:scale-95 cursor-pointer transition-all border-2 border-slate-600',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-bold transition-all',
    };
  }

  // 14. MIDNIGHT SENSORY OLED (Pure Pitch Black / High Contrast)
  if (themeId === 'theme-midnight') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_14px_rgba(255,255,255,0.05)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-zinc-800 bg-zinc-900/80 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.5)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-zinc-400',
      scheduleLink: 'text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border-2 border-zinc-700 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-zinc-100',
      thenStep: 'w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-zinc-200',
      stepIconBox: 'w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-600 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-zinc-200 text-black border-white font-black',
      stepCheckInactive: 'bg-black text-zinc-500 border-zinc-700',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-zinc-800 text-zinc-100 border-2 border-zinc-700 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.4)] border-2 border-zinc-700 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-zinc-400/70 focus-visible:outline-none',
      headerBar: 'bg-zinc-900/80 border-2 border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-100',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-zinc-400/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-zinc-100 leading-tight',
      headerSubtext: 'text-xs text-zinc-400 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-2 border-dashed border-zinc-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-zinc-400',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-zinc-200 hover:bg-white text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.15)] active:scale-95 cursor-pointer transition-all border-2 border-white',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-95 cursor-pointer transition-all border-2 border-zinc-700',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-95 cursor-pointer transition-all border-2 border-zinc-700',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-bold transition-all',
    };
  }

  // 15. SKATE PARK (Sunset Orange)
  if (themeId === 'theme-skate' || category === 'skate') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-orange-300/80 bg-orange-50/40 hover:bg-orange-50/80 text-orange-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(234,88,12,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-orange-300/80 bg-orange-50/40 text-orange-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-orange-900/80',
      scheduleLink: 'text-xs font-bold text-orange-900 hover:text-orange-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-orange-100/70 hover:bg-orange-100 border-2 border-orange-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-orange-50 hover:bg-orange-100/70 border-2 border-orange-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-orange-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-orange-500 text-white border-orange-600 font-black',
      stepCheckInactive: 'bg-white text-orange-500 border-orange-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-orange-300/80 bg-orange-50/40 hover:bg-orange-50/60 text-orange-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-orange-100 text-orange-950 border-2 border-orange-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-orange-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-orange-500/70 focus-visible:outline-none',
      headerBar: 'bg-orange-50/40 border-2 border-orange-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-orange-100/70 hover:bg-orange-200 text-orange-950 border border-orange-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-orange-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-orange-950 leading-tight',
      headerSubtext: 'text-xs text-orange-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-orange-50/50 hover:bg-orange-100/70 text-orange-900 hover:text-orange-950 border-2 border-dashed border-orange-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-orange-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-orange-500 hover:bg-orange-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(234,88,12,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-orange-300',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(234,88,12,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-orange-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(234,88,12,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-orange-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 border border-orange-300/80 text-xs text-orange-900 font-bold transition-all',
    };
  }

  // 16. SOFT SILICONE & CLAY (Neutral Clay / Oat Milk)
  if (themeId === 'theme-silicone' || category === 'minimal') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-stone-300/80 bg-stone-100/60 hover:bg-stone-100/90 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-stone-300/80 bg-stone-100/60 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-stone-700',
      scheduleLink: 'text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-stone-200/70 hover:bg-stone-200 border-2 border-stone-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-stone-900',
      thenStep: 'w-full p-3 rounded-xl bg-stone-100 hover:bg-stone-200/70 border-2 border-stone-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer text-stone-900',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-stone-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-stone-700 text-white border-stone-800 font-black',
      stepCheckInactive: 'bg-white text-stone-400 border-stone-300',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-stone-300/80 bg-stone-100/60 hover:bg-stone-100/80 text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-stone-200 text-stone-900 border-2 border-stone-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-900 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-stone-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-stone-500/70 focus-visible:outline-none',
      headerBar: 'bg-stone-100/60 border-2 border-stone-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-900',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 border border-stone-300 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-stone-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-stone-900 leading-tight',
      headerSubtext: 'text-xs text-stone-600 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-stone-100/60 hover:bg-stone-200/70 text-stone-700 hover:text-stone-900 border-2 border-dashed border-stone-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-stone-700',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-stone-800 bg-stone-200 border border-stone-300 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-stone-300 hover:bg-stone-400 text-stone-900 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-stone-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-stone-200 hover:bg-stone-300 text-stone-900 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-stone-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-stone-200 hover:bg-stone-300 text-stone-900 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-stone-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-stone-100/90 border border-stone-300 text-xs text-stone-700 font-bold transition-all',
    };
  }

  // 17. SIGNATURE DEFAULT BEE THEME (Tactile Silicone & Oat Milk / Cozy Bee) - 100% Sunny Amber / Yellow!
  // This is the default for theme-classic and any unrecognized theme.
  return {
    card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(245,184,101,0.18)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
    scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 text-amber-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
    scheduleHeader: 'text-xs font-black uppercase tracking-wider text-amber-900/80',
    scheduleLink: 'text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer transition-colors',
    firstStep: 'w-full p-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 border-2 border-amber-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
    thenStep: 'w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border-2 border-amber-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
    stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-amber-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
    stepCheckActive: 'bg-amber-400 text-amber-950 border-amber-500 font-black',
    stepCheckInactive: 'bg-white text-amber-400 border-amber-300',
    mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/60 text-amber-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
    mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-amber-100 text-amber-950 border-2 border-amber-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
    mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-amber-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none',
    headerBar: 'bg-amber-50/40 border-2 border-amber-300/80 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
    headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-amber-100/70 hover:bg-amber-200 text-amber-950 border border-amber-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none',
    headerText: 'text-base sm:text-lg font-black text-amber-950 leading-tight',
    headerSubtext: 'text-xs text-amber-900/80 font-semibold',
    dashedButton: 'w-full py-3 px-4 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 hover:text-amber-950 border-2 border-dashed border-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
    dashedIcon: 'w-3.5 h-3.5 text-amber-900',
    adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md inline-block mb-1',
    quickAacTalk: 'py-3 px-3 rounded-[24px] bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,184,101,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-400',
    quickAacCalm: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,184,101,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-300',
    quickAacHelp: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,184,101,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-300',
    feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-300/80 text-xs text-amber-900 font-bold transition-all',
  };
}

export interface ThemeCustomizerHeaderStyles {
  modalBorder: string;
  topBarGradient: string;
  topBarBorder: string;
  topBarText: string;
  topBarSubtext: string;
  bannerGradient: string;
  bannerBorder: string;
  bannerText: string;
  bannerSubtext: string;
  tabContainerBg: string;
  activeTabStyle: string;
  inactiveTabStyle: string;
  equippedCardBorder: string;
  equippedBadgeBg: string;
}

export function getThemeCustomizerHeaderStyles(theme?: AppTheme | null): ThemeCustomizerHeaderStyles {
  const themeId = theme?.id || 'theme-classic';
  const category = theme?.category || 'classic';

  // 1. TURTLE SANCTUARY (Emerald / Teal)
  if (themeId === 'theme-turtle' || category === 'turtle') {
    return {
      modalBorder: 'border-emerald-300',
      topBarGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white',
      topBarBorder: 'border-emerald-400',
      topBarText: 'text-white',
      topBarSubtext: 'text-emerald-100',
      bannerGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white',
      bannerBorder: 'border-emerald-400',
      bannerText: 'text-white',
      bannerSubtext: 'text-emerald-100',
      tabContainerBg: 'bg-emerald-950/25',
      activeTabStyle: 'bg-white text-emerald-950 shadow-sm',
      inactiveTabStyle: 'text-emerald-100 hover:bg-white/15',
      equippedCardBorder: 'border-emerald-300',
      equippedBadgeBg: 'bg-emerald-100/70 border-emerald-300',
    };
  }

  // 2. DINOSAUR KINGDOM (Jungle Green / Amber)
  if (themeId === 'theme-dino' || category === 'dinosaur') {
    return {
      modalBorder: 'border-green-400',
      topBarGradient: 'bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 text-white',
      topBarBorder: 'border-green-400',
      topBarText: 'text-white',
      topBarSubtext: 'text-green-100',
      bannerGradient: 'bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 text-white',
      bannerBorder: 'border-green-400',
      bannerText: 'text-white',
      bannerSubtext: 'text-green-100',
      tabContainerBg: 'bg-green-950/25',
      activeTabStyle: 'bg-white text-green-950 shadow-sm',
      inactiveTabStyle: 'text-green-100 hover:bg-white/15',
      equippedCardBorder: 'border-green-300',
      equippedBadgeBg: 'bg-green-100/70 border-green-300',
    };
  }

  // 3. COSMIC SPACE (Deep Indigo / Violet)
  if (themeId === 'theme-space' || category === 'space') {
    return {
      modalBorder: 'border-indigo-400',
      topBarGradient: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white',
      topBarBorder: 'border-indigo-700',
      topBarText: 'text-white',
      topBarSubtext: 'text-indigo-200',
      bannerGradient: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white',
      bannerBorder: 'border-indigo-600',
      bannerText: 'text-white',
      bannerSubtext: 'text-indigo-200',
      tabContainerBg: 'bg-slate-950/40',
      activeTabStyle: 'bg-white text-indigo-950 shadow-sm',
      inactiveTabStyle: 'text-indigo-200 hover:bg-white/15',
      equippedCardBorder: 'border-indigo-300',
      equippedBadgeBg: 'bg-indigo-100/70 border-indigo-300',
    };
  }

  // 4. OCEAN LAGOON (Cyan / Teal)
  if (themeId === 'theme-ocean' || category === 'ocean') {
    return {
      modalBorder: 'border-cyan-300',
      topBarGradient: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white',
      topBarBorder: 'border-cyan-400',
      topBarText: 'text-white',
      topBarSubtext: 'text-cyan-100',
      bannerGradient: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white',
      bannerBorder: 'border-cyan-400',
      bannerText: 'text-white',
      bannerSubtext: 'text-cyan-100',
      tabContainerBg: 'bg-cyan-950/25',
      activeTabStyle: 'bg-white text-cyan-950 shadow-sm',
      inactiveTabStyle: 'text-cyan-100 hover:bg-white/15',
      equippedCardBorder: 'border-cyan-300',
      equippedBadgeBg: 'bg-cyan-100/70 border-cyan-300',
    };
  }

  // 5. DEFAULT BEE CLASSIC (Sunny Amber / Yellow)
  return {
    modalBorder: 'border-amber-200',
    topBarGradient: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-amber-950',
    topBarBorder: 'border-amber-300/80',
    topBarText: 'text-amber-950',
    topBarSubtext: 'text-amber-900/80',
    bannerGradient: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950',
    bannerBorder: 'border-amber-300',
    bannerText: 'text-amber-950',
    bannerSubtext: 'text-amber-950/80',
    tabContainerBg: 'bg-amber-950/15',
    activeTabStyle: 'bg-white text-amber-950 shadow-sm',
    inactiveTabStyle: 'text-amber-950/80 hover:bg-white/20',
    equippedCardBorder: 'border-amber-200/90',
    equippedBadgeBg: 'bg-amber-100/70 border-amber-200',
  };
}
