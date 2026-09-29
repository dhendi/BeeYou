import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Star, Award, ArrowRight, X } from 'lucide-react';
import { playChime } from '../utils/audio';

export const RoutineStickerCelebrationModal: React.FC = () => {
  const {
    newlyAwardedSticker,
    dismissStickerCelebration,
    updateChildProfile,
    setChildView,
  } = useApp();

  if (!newlyAwardedSticker) return null;

  const handleWearSticker = () => {
    updateChildProfile({
      activeSticker: newlyAwardedSticker.emoji,
    });
    playChime('star');
    dismissStickerCelebration();
  };

  const handleGoToRewards = () => {
    dismissStickerCelebration();
    setChildView('rewards');
    playChime('tap');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-sky-50 rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center space-y-4 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-sky-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Close X */}
        <button
          onClick={dismissStickerCelebration}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Routine Completed!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
            You Earned a Sticker! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Great perseverance finishing your <strong>{newlyAwardedSticker.routineTitle}</strong>!
          </p>
        </div>

        {/* Big Gleaming Digital Sticker Card */}
        <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-amber-200 via-yellow-100 to-sky-100 border-4 border-white shadow-lg flex items-center justify-center ring-4 ring-amber-300/50 my-2">
          <span className="text-6xl sm:text-7xl animate-bounce select-none">
            {newlyAwardedSticker.emoji}
          </span>
          <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-amber-500 text-white font-black text-[11px] shadow-sm flex items-center gap-1">
            <Star className="w-3 h-3 fill-white text-white" />
            <span>+{newlyAwardedSticker.starsAwarded} Stars</span>
          </div>
        </div>

        {/* Sticker Info */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            {newlyAwardedSticker.stickerName}
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-1 leading-snug">
            {newlyAwardedSticker.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleWearSticker}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm rounded-2xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Wear as Profile Flair</span>
            <span>{newlyAwardedSticker.emoji}</span>
          </button>

          <button
            onClick={handleGoToRewards}
            className="w-full py-2.5 px-4 bg-white hover:bg-sky-50 text-sky-800 border-2 border-sky-200 hover:border-sky-300 font-black text-xs sm:text-sm rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Award className="w-4 h-4 text-sky-600" />
            <span>View in Sticker Album</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
