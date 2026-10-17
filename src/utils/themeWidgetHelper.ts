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

  // 2. DINOSAUR KINGDOM (Earthy Terracotta & Orangy Dirt)
  if (themeId === 'theme-dino' || category === 'dinosaur') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 hover:bg-amber-50/80 text-amber-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(194,100,51,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 text-amber-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-amber-900/80',
      scheduleLink: 'text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 border-2 border-amber-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border-2 border-amber-300/70 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-amber-300 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-amber-500 text-amber-950 border-amber-600 font-black',
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
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(180,83,9,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(180,83,9,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(180,83,9,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-amber-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-300/80 text-xs text-amber-900 font-bold transition-all',
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

  // 4. STEAM TRAINS (Classic Navy Blue / Railroad Conductor)
  if (themeId === 'theme-trains' || category === 'train') {
    return {
      card: 'w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 border-blue-200/90 bg-blue-50/40 hover:bg-blue-50/80 text-blue-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(30,58,138,0.08)] active:scale-[0.98] cursor-pointer transition-all col-span-1 flex items-center justify-between gap-3 group',
      scheduleContainer: 'p-4 sm:p-5 rounded-2xl border-2 border-blue-200/90 bg-blue-50/40 text-blue-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3',
      scheduleHeader: 'text-xs font-black uppercase tracking-wider text-blue-950/80',
      scheduleLink: 'text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer transition-colors',
      firstStep: 'w-full p-3 rounded-xl bg-blue-100/70 hover:bg-blue-100 border-2 border-blue-300/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      thenStep: 'w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border-2 border-blue-200/80 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer',
      stepIconBox: 'w-7 h-7 rounded-lg bg-white border border-blue-200 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden',
      stepCheckActive: 'bg-blue-900 text-white border-blue-950 font-black',
      stepCheckInactive: 'bg-white text-blue-400 border-blue-200',
      mascotBanner: 'p-4 sm:p-5 rounded-[28px] border-2 border-blue-200/90 bg-blue-50/40 hover:bg-blue-50/60 text-blue-950 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 transition-all',
      mascotBadge: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl bg-blue-100 text-blue-950 border-2 border-blue-300 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 text-2xl select-none',
      mascotButton: 'p-2.5 min-w-[48px] min-h-[48px] rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-950 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.03)] border-2 border-blue-300 shrink-0 active:scale-95 flex items-center justify-center focus-visible:ring-4 focus-visible:ring-blue-500/70 focus-visible:outline-none',
      headerBar: 'bg-blue-50/40 border-2 border-blue-200/90 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3',
      headerButton: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-blue-100/70 hover:bg-blue-200 text-blue-950 border border-blue-300/80 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 focus-visible:ring-4 focus-visible:ring-blue-500/70 focus-visible:outline-none',
      headerText: 'text-base sm:text-lg font-black text-blue-950 leading-tight',
      headerSubtext: 'text-xs text-blue-900/80 font-semibold',
      dashedButton: 'w-full py-3 px-4 rounded-2xl bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 hover:text-blue-950 border-2 border-dashed border-blue-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-2xs',
      dashedIcon: 'w-3.5 h-3.5 text-blue-900',
      adventureTag: 'text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md inline-block mb-1',
      quickAacTalk: 'py-3 px-3 rounded-[24px] bg-blue-200/90 hover:bg-blue-300 text-blue-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(30,58,138,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-blue-400',
      quickAacCalm: 'py-3 px-3 rounded-[24px] bg-blue-100 hover:bg-blue-200 text-blue-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(30,58,138,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-blue-300',
      quickAacHelp: 'py-3 px-3 rounded-[24px] bg-blue-100 hover:bg-blue-200 text-blue-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(30,58,138,0.25),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] active:scale-95 cursor-pointer transition-all border-2 border-blue-300',
      feedbackStrip: 'flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-200/90 text-xs text-blue-900 font-bold transition-all',
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

  // 2. DINOSAUR KINGDOM (Warm Terracotta / Orangy Dirt)
  if (themeId === 'theme-dino' || category === 'dinosaur') {
    return {
      modalBorder: 'border-amber-400',
      topBarGradient: 'bg-gradient-to-r from-amber-700 via-orange-700 to-amber-600 text-white',
      topBarBorder: 'border-amber-500',
      topBarText: 'text-white',
      topBarSubtext: 'text-amber-100',
      bannerGradient: 'bg-gradient-to-r from-amber-700 via-orange-700 to-amber-600 text-white',
      bannerBorder: 'border-amber-500',
      bannerText: 'text-white',
      bannerSubtext: 'text-amber-100',
      tabContainerBg: 'bg-amber-950/25',
      activeTabStyle: 'bg-white text-amber-950 shadow-sm',
      inactiveTabStyle: 'text-amber-100 hover:bg-white/15',
      equippedCardBorder: 'border-amber-400',
      equippedBadgeBg: 'bg-amber-100/70 border-amber-300',
    };
  }

  // 3. FROG POND (Fresh Lime / Lily Pad Green)
  if (themeId === 'theme-frog' || category === 'frog') {
    return {
      modalBorder: 'border-lime-400',
      topBarGradient: 'bg-gradient-to-r from-lime-600 via-emerald-600 to-lime-500 text-white',
      topBarBorder: 'border-lime-500',
      topBarText: 'text-white',
      topBarSubtext: 'text-lime-100',
      bannerGradient: 'bg-gradient-to-r from-lime-600 via-emerald-600 to-lime-500 text-white',
      bannerBorder: 'border-lime-500',
      bannerText: 'text-white',
      bannerSubtext: 'text-lime-100',
      tabContainerBg: 'bg-lime-950/25',
      activeTabStyle: 'bg-white text-lime-950 shadow-sm',
      inactiveTabStyle: 'text-lime-100 hover:bg-white/15',
      equippedCardBorder: 'border-lime-300',
      equippedBadgeBg: 'bg-lime-100/70 border-lime-300',
    };
  }

  // 4. STEAM EXPRESS (Classic Navy Blue / Railroad Conductor)
  if (themeId === 'theme-trains' || category === 'train') {
    return {
      modalBorder: 'border-blue-400',
      topBarGradient: 'bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white',
      topBarBorder: 'border-blue-800',
      topBarText: 'text-white',
      topBarSubtext: 'text-blue-200',
      bannerGradient: 'bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white',
      bannerBorder: 'border-blue-700',
      bannerText: 'text-white',
      bannerSubtext: 'text-blue-200',
      tabContainerBg: 'bg-blue-950/40',
      activeTabStyle: 'bg-white text-blue-950 shadow-sm',
      inactiveTabStyle: 'text-blue-200 hover:bg-white/15',
      equippedCardBorder: 'border-blue-300',
      equippedBadgeBg: 'bg-blue-100/70 border-blue-300',
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
