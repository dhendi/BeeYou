import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Award, ArrowRight, X, BookOpen } from 'lucide-react';
import { playChime } from '../utils/audio';
import { RoutineStickerIcon, TurtleLotusTrophySticker } from './icons/JournalStickers';

export const RoutineStickerCelebrationModal: React.FC = () => {
  const {
    newlyAwardedSticker,
    dismissStickerCelebration,
    updateChildProfile,
    setChildView,
    activeTheme,
  } = useApp();

  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';

  if (!newlyAwardedSticker) return null;

  const handleWearSticker = () => {
    updateChildProfile({
      activeSticker: newlyAwardedSticker.emoji,
    });
    playChime('star');
    dismissStickerCelebration();
  };

  const handleGoToScrapbook = () => {
    dismissStickerCelebration();
    setChildView('scrapbook');
    playChime('star');
  };

  const handleGoToRewards = () => {
    dismissStickerCelebration();
    setChildView('rewards');
    playChime('tap');
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md rounded-3xl border-4 shadow-2xl p-6 text-center space-y-4 overflow-y-auto max-h-[calc(100dvh-1.5rem)] ${
        isTurtleTheme
          ? 'bg-gradient-to-b from-emerald-50 via-white to-teal-50 border-emerald-300'
          : isDinoTheme
            ? 'bg-gradient-to-b from-green-50 via-white to-amber-50 border-green-400'
            : 'bg-gradient-to-b from-amber-50 via-white to-sky-50 border-amber-300'
      }`}>
        {/* Decorative background glow */}
        <div className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
          isTurtleTheme ? 'bg-emerald-300/30' : isDinoTheme ? 'bg-green-300/30' : 'bg-amber-300/30'
        }`} />
        <div className={`absolute -bottom-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
          isTurtleTheme ? 'bg-teal-300/30' : isDinoTheme ? 'bg-amber-300/30' : 'bg-sky-300/30'
        }`} />

        {/* Close X */}
        <button
          type="button"
          aria-label="Close routine celebration modal"
          onClick={dismissStickerCelebration}
          className={`absolute top-4 right-4 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center focus-visible:ring-4 focus-visible:outline-none ${
            isTurtleTheme ? 'focus-visible:ring-emerald-500/70' : isDinoTheme ? 'focus-visible:ring-green-500/70' : 'focus-visible:ring-amber-500/70'
          }`}
          title="Close"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Celebration Header */}
        <div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider mb-2 border ${
            isTurtleTheme
              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
              : isDinoTheme
                ? 'bg-green-100 border-green-300 text-green-900'
                : 'bg-amber-100 border-amber-300 text-amber-900'
          }`}>
            {isTurtleTheme ? (
              <TurtleLotusTrophySticker className="w-4 h-4 object-contain inline-block" />
            ) : isDinoTheme ? (
              <span className="text-base select-none leading-none">🦖</span>
            ) : (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            )}
            <span>{isTurtleTheme ? 'Sanctuary Milestone!' : isDinoTheme ? 'Jurassic Milestone!' : 'Routine Completed!'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
            {isTurtleTheme ? 'Sanctuary Sticker Earned! 🐢' : isDinoTheme ? 'Prehistoric Sticker Earned! 🦖' : 'You Earned a Sticker! 🎉'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Great perseverance finishing your <strong>{newlyAwardedSticker.routineTitle}</strong>!
          </p>
        </div>

        {/* Big Gleaming Digital Sticker Card */}
        <div className={`relative mx-auto w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 border-white shadow-lg flex items-center justify-center ring-4 my-2 ${
          isTurtleTheme
            ? 'bg-gradient-to-tr from-emerald-200 via-teal-100 to-emerald-100 ring-emerald-300/50'
            : isDinoTheme
              ? 'bg-gradient-to-tr from-green-200 via-emerald-100 to-amber-100 ring-green-300/50'
              : 'bg-gradient-to-tr from-amber-200 via-yellow-100 to-sky-100 ring-amber-300/50'
        }`}>
          <RoutineStickerIcon
            emoji={newlyAwardedSticker.emoji}
            title={newlyAwardedSticker.stickerName}
            size={92}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain animate-bounce select-none drop-shadow-md"
          />
          <div className={`absolute -bottom-2.5 px-3 py-0.5 rounded-full text-white font-black text-[11px] shadow-sm flex items-center gap-1 ${
            isTurtleTheme ? 'bg-emerald-600' : isDinoTheme ? 'bg-green-600' : 'bg-amber-500'
          }`}>
            <Star className="w-3 h-3 text-white" />
            <span>New Sticker!</span>
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
            onClick={handleGoToScrapbook}
            className={`w-full py-3.5 px-4 font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isTurtleTheme
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                : isDinoTheme
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-white shadow-green-300/50'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isTurtleTheme || isDinoTheme ? 'text-white' : 'text-amber-900'}`} />
            <span>Place in Sticker Scrapbook</span>
          </button>

          <button
            onClick={handleWearSticker}
            className={`w-full py-2.5 px-4 font-bold text-xs sm:text-sm rounded-2xl border-2 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isTurtleTheme
                ? 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-200 hover:border-emerald-300'
                : isDinoTheme
                  ? 'bg-white hover:bg-green-50 text-green-950 border-green-200 hover:border-green-300'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-300'
            }`}
          >
            <span>Wear as Profile Flair</span>
            <RoutineStickerIcon
              emoji={newlyAwardedSticker.emoji}
              title={newlyAwardedSticker.stickerName}
              size={20}
              className="w-5 h-5 object-contain"
            />
          </button>

          <button
            onClick={handleGoToRewards}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Rewards Album</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
