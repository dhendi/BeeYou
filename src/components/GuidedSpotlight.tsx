import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, X, Battery, MessageSquare, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

export const GuidedSpotlight: React.FC = () => {
  const { 
    userPersona, 
    showPostOnboardingSpotlight, 
    setShowPostOnboardingSpotlight, 
    setChildView,
    setShowSpoonModal
  } = useApp();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showPostOnboardingSpotlight) {
      // Gentle appearance delay after initial render
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [showPostOnboardingSpotlight]);

  if (!visible || !showPostOnboardingSpotlight) return null;

  const handleDismiss = () => {
    playChime('tap');
    setVisible(false);
    setShowPostOnboardingSpotlight(false);
    try {
      localStorage.setItem('beeyou_spotlight_dismissed', 'true');
    } catch {}
  };

  const handleAction = () => {
    playChime('star');
    if (userPersona === 'adult') {
      setShowSpoonModal(true);
    } else {
      setChildView('aac');
    }
    handleDismiss();
  };

  const isAdult = userPersona === 'adult';
  const spotlightActionTitle = isAdult ? 'Log your energy spoons' : 'Tap your first word';
  const spotlightActionDesc = isAdult
    ? 'Check in with your daily spoon budget to pace your energy and tasks.'
    : 'Open the communication board to speak words and build sentences with voice output.';
  const spotlightActionIcon = isAdult ? <Battery className="w-5 h-5 text-teal-400" /> : <MessageSquare className="w-5 h-5 text-amber-400" />;

  return (
    <div 
      className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div 
        className="bg-slate-900 border-2 border-white/20 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-white relative flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Welcome Spotlight"
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended First Step</span>
          </div>

          {/* High-Contrast Explicit Skip Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/20"
            aria-label="Skip spotlight guide"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Feature Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
            {spotlightActionIcon}
          </div>
          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              {spotlightActionTitle}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
              {spotlightActionDesc}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleAction}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <span>Let's Begin</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm active:scale-95 transition-all cursor-pointer border border-slate-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
