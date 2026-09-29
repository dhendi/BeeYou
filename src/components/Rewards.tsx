import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { REWARD_BADGES, PROFILE_STICKERS, CHARACTER_TITLES, ROUTINE_STICKER_REWARDS } from '../data/rewardsData';
import { RewardBadge, ProfileSticker } from '../types';
import { ChildAvatar } from './ChildAvatar';
import { 
  Trophy, 
  Sparkles, 
  Star, 
  Check, 
  Lock, 
  Volume2, 
  Filter, 
  User, 
  Smile, 
  Heart, 
  ChevronRight, 
  Award, 
  Layers, 
  ArrowRight,
  BookOpen,
  Palette
} from 'lucide-react';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import confetti from 'canvas-confetti';
import { playChime, speakText } from '../utils/audio';

export const Rewards: React.FC = () => {
  const {
    worldState,
    childProfile,
    updateChildProfile,
    avatar,
    routines,
    skills,
    emotionHistory,
    setChildView,
    earnedStickers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'badges' | 'stickers' | 'profile' | 'themes'>('badges');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'in-progress'>('all');
  const [selectedBadge, setSelectedBadge] = useState<RewardBadge | null>(null);

  // Dynamic progress calculation based on real task completions
  const totalCompletedRoutineSteps = routines.reduce(
    (acc, r) => acc + r.steps.filter((s) => s.completed).length,
    0
  );
  const totalCompletedSkills = skills.reduce(
    (acc, s) => acc + (s.completedTimes || 0),
    0
  );
  const totalEmotionLogs = emotionHistory.length;

  // Enhance default badges with live progress
  const dynamicBadges: RewardBadge[] = REWARD_BADGES.map((b) => {
    let current = b.currentCount;
    let unlocked = b.isUnlocked;

    if (b.id === 'badge-routine') {
      current = Math.max(current, totalCompletedRoutineSteps);
      unlocked = current >= b.targetCount;
    } else if (b.id === 'badge-allstar') {
      current = Math.max(current, worldState.stars);
      unlocked = current >= b.targetCount;
    } else if (b.id === 'badge-feelings') {
      current = Math.max(current, totalEmotionLogs > 0 ? 1 : 0);
      unlocked = current >= b.targetCount;
    } else if (b.id === 'badge-dino') {
      current = Math.max(current, totalCompletedRoutineSteps + totalCompletedSkills);
      unlocked = current >= b.targetCount;
    }

    return {
      ...b,
      currentCount: current,
      isUnlocked: unlocked,
    };
  });

  const earnedCount = dynamicBadges.filter((b) => b.isUnlocked).length;
  const totalBadges = dynamicBadges.length;
  const percentComplete = Math.round((earnedCount / totalBadges) * 100);

  // Filtered badges
  const filteredBadges = dynamicBadges.filter((b) => {
    if (badgeFilter === 'earned') return b.isUnlocked;
    if (badgeFilter === 'in-progress') return !b.isUnlocked;
    return true;
  });

  // Check if a sticker is unlocked
  const isStickerUnlocked = (sticker: ProfileSticker): boolean => {
    if (sticker.badgeIdRequired) {
      const requiredBadge = dynamicBadges.find((b) => b.id === sticker.badgeIdRequired);
      return requiredBadge ? requiredBadge.isUnlocked : false;
    }
    if (sticker.starsRequired) {
      return worldState.stars >= sticker.starsRequired;
    }
    return true;
  };

  const handleInspectBadge = (badge: RewardBadge) => {
    setSelectedBadge(badge);
    playChime(badge.isUnlocked ? 'star' : 'tap');
    if (badge.isUnlocked) {
      speakText(`${badge.title} badge earned! ${badge.description}`);
    } else {
      speakText(`${badge.title}. Progress: ${badge.currentCount} of ${badge.targetCount}. ${badge.description}`);
    }
  };

  const handleEquipSticker = (sticker: ProfileSticker) => {
    if (!isStickerUnlocked(sticker)) {
      playChime('tap');
      speakText(`This sticker unlocks by earning the ${sticker.description} badge.`);
      return;
    }

    updateChildProfile({
      activeSticker: sticker.emoji,
    });

    playChime('star');
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#38bdf8', '#a855f7'],
      });
    } catch (e) {
      // fallback
    }

    speakText(`Equipped ${sticker.name} to your profile!`);
  };

  const handleSelectTitle = (title: string) => {
    updateChildProfile({
      activeTitle: title,
    });
    playChime('tap');
    speakText(`You are now: ${title} ${childProfile.name}!`);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-4xl mx-auto w-full px-3 sm:px-4 py-2 space-y-4">
      {/* 1. HERO REWARDS BANNER & STATS */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 border-3 border-amber-300 rounded-3xl p-5 sm:p-6 text-amber-950 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/80 p-1 flex items-center justify-center shadow-md shrink-0">
              <span className="text-4xl sm:text-5xl animate-bounce">🏆</span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-950/15 px-2.5 py-0.5 rounded-full">
                  Achievement Showcase
                </span>
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  {earnedCount} of {totalBadges} Badges
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
                {childProfile.name}'s Rewards
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/80 font-medium mt-0.5">
                Celebrate every step, routine, and achievement at your own pace!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Star Bank */}
            <div className="bg-white/85 px-4 py-2.5 rounded-2xl border border-amber-300/80 shadow-xs flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900/70 block">
                  Stars Bank
                </span>
                <span className="text-base sm:text-lg font-black text-amber-950 leading-none">
                  {worldState.stars} Coins
                </span>
              </div>
            </div>

            {/* Read Aloud Summary */}
            <button
              type="button"
              onClick={() => {
                playChime('star');
                speakText(
                  `Great work, ${childProfile.name}! You have earned ${earnedCount} badges and ${worldState.stars} shining star coins.`
                );
              }}
              className="p-3 rounded-2xl bg-white/80 hover:bg-white text-amber-950 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Hear achievement summary"
              aria-label="Hear achievement summary"
            >
              <Volume2 className="w-5 h-5 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4 pt-4 border-t border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-1.5">
            <span>Overall Badge Completion</span>
            <span>{percentComplete}%</span>
          </div>
          <div className="w-full bg-amber-950/15 h-3 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. REWARDS NAVIGATION TABS */}
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border-2 border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('badges');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Badges Wall ({earnedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('stickers');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'stickers'
              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sticker Album ({earnedStickers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Card</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('themes');
            playChime('tap');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'themes'
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Themes & Studio 🎨</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: BADGES WALL */}
      {activeTab === 'badges' && (
        <div className="space-y-3">
          {/* Badge Filter Controls */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Badge Collection</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'earned', label: 'Earned' },
                { id: 'in-progress', label: 'In Progress' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setBadgeFilter(f.id as any);
                    playChime('tap');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    badgeFilter === f.id
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBadges.map((badge) => {
              const isSelected = selectedBadge?.id === badge.id;
              const progressFraction = Math.min(1, badge.currentCount / badge.targetCount);

              return (
                <div
                  key={badge.id}
                  onClick={() => handleInspectBadge(badge)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer active:scale-98 relative overflow-hidden flex flex-col justify-between ${
                    badge.isUnlocked
                      ? isSelected
                        ? 'bg-amber-50/90 border-amber-500 ring-3 ring-amber-300 shadow-md'
                        : 'bg-white hover:bg-amber-50/40 border-amber-200 shadow-xs'
                      : isSelected
                      ? 'bg-slate-50 border-slate-400 ring-2 ring-slate-300'
                      : 'bg-white/80 hover:bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  {/* Status Ribbon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 ${
                        badge.isUnlocked
                          ? 'bg-gradient-to-br from-amber-100 to-yellow-200 border border-amber-300'
                          : 'bg-slate-100 border border-slate-200 grayscale'
                      }`}
                    >
                      {badge.emoji}
                    </div>

                    <div className="flex flex-col items-end">
                      {badge.isUnlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-600 stroke-3" />
                          <span>Earned</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>In Progress</span>
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>+{badge.rewardStars} Stars</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-base leading-tight">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress Tracker */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-black text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {badge.currentCount} / {badge.targetCount}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${progressFraction * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Badge Detail Inspection Card (If Selected) */}
          {selectedBadge && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <span className="text-5xl">{selectedBadge.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-amber-950">
                      {selectedBadge.title}
                    </h3>
                    {selectedBadge.isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Unlocked!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        {selectedBadge.currentCount} of {selectedBadge.targetCount} completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900 font-medium mt-0.5">
                    {selectedBadge.description}
                  </p>
                  {selectedBadge.unlockedStickerId && (
                    <span className="text-[11px] font-bold text-indigo-700 block mt-1">
                      🎁 Rewards: Unlocks matching sticker in your Profile Flair!
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('stickers');
                  playChime('tap');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <span>View Stickers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL STICKERS ALBUM & PROFILE FLAIR */}
      {activeTab === 'stickers' && (
        <div className="space-y-6">
          {/* 1. EARNED ROUTINE DIGITAL STICKERS (Sticker Book) */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-purple-50/70 border-3 border-indigo-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
                  📖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-indigo-950">
                      Routine Stickers Album
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-black text-[11px]">
                      {earnedStickers.length} Earned
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800 font-medium">
                    Earned by completing scheduled routines in <strong>My Day</strong>!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChildView('my-day')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <span>Go to My Day</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Earned Routine Stickers Grid */}
            {earnedStickers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {earnedStickers.map((sticker) => {
                  const isEquipped = childProfile.activeSticker === sticker.emoji;

                  return (
                    <div
                      key={sticker.id}
                      onClick={() => handleEquipSticker({
                        id: sticker.id,
                        name: sticker.stickerName,
                        emoji: sticker.emoji,
                        description: sticker.description,
                      })}
                      className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 relative ${
                        isEquipped
                          ? 'bg-white border-indigo-500 ring-4 ring-indigo-200 shadow-md'
                          : 'bg-white hover:bg-indigo-50/50 border-indigo-200/80 shadow-xs'
                      }`}
                    >
                      {isEquipped && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white shadow-2xs">
                          Active
                        </span>
                      )}

                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 to-indigo-100 border border-indigo-100 flex items-center justify-center text-4xl shadow-xs my-2">
                        {sticker.emoji}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-black text-xs sm:text-sm text-slate-800">
                          {sticker.stickerName}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                          {sticker.routineTitle}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1 line-clamp-2">
                          {sticker.description}
                        </p>
                      </div>

                      <div className="mt-2.5 w-full space-y-1">
                        <span className="text-[10px] font-semibold text-amber-700 block">
                          ⭐ +{sticker.starsAwarded} Stars • {sticker.earnedAt}
                        </span>
                        <button
                          type="button"
                          className={`w-full py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900'
                          }`}
                        >
                          {isEquipped ? '✓ Wearing' : 'Wear on Profile'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-indigo-100 text-slate-500">
                <span className="text-3xl block mb-1">🌟</span>
                <p className="font-bold text-sm text-slate-700">No Routine Stickers Yet!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all the steps of any routine in My Day to unlock your first digital sticker!
                </p>
              </div>
            )}
          </div>

          {/* 2. ROUTINE STICKERS TO DISCOVER */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Routine Stickers to Unlock in My Day</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Follow your daily routines to collect these shiny stickers!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ROUTINE_STICKER_REWARDS.filter(
                (def) => !earnedStickers.some((es) => es.stickerName === def.stickerName)
              ).map((lockedDef) => (
                <div
                  key={lockedDef.routineId}
                  onClick={() => setChildView('my-day')}
                  className="p-3 bg-slate-50 hover:bg-sky-50/60 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-300 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-200/80 text-2xl flex items-center justify-center shrink-0 grayscale opacity-75">
                    {lockedDef.emoji}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <span className="font-black text-xs text-slate-800 block truncate">
                      {lockedDef.stickerName}
                    </span>
                    <span className="text-[10px] text-sky-700 font-bold block">
                      Finish {lockedDef.routineTitlePattern.toUpperCase()} Routine
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                      Rewards: +{lockedDef.starsAward} Stars 🌟
                    </span>
                  </div>
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. PROFILE FLAIR & BADGE STICKERS */}
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>General Flair & Collectible Stickers</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Badges and star coins unlock special flair items.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PROFILE_STICKERS.map((sticker) => {
                const unlocked = isStickerUnlocked(sticker);
                const isEquipped = childProfile.activeSticker === sticker.emoji;

                return (
                  <div
                    key={sticker.id}
                    onClick={() => handleEquipSticker(sticker)}
                    className={`p-3.5 rounded-3xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 relative ${
                      isEquipped
                        ? 'bg-indigo-50 border-indigo-500 ring-3 ring-indigo-300 shadow-sm'
                        : unlocked
                        ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 opacity-70'
                    }`}
                  >
                    {isEquipped && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white shadow-2xs">
                        Active
                      </span>
                    )}

                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-4xl shadow-xs my-2">
                      {sticker.emoji}
                    </div>

                    <div>
                      <h5 className="font-black text-xs sm:text-sm text-slate-800">
                        {sticker.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 line-clamp-2">
                        {sticker.description}
                      </p>
                    </div>

                    <div className="mt-2.5 w-full">
                      {unlocked ? (
                        <button
                          type="button"
                          className={`w-full py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900'
                          }`}
                        >
                          {isEquipped ? 'Equipped' : 'Wear on Profile'}
                        </button>
                      ) : (
                        <span className="w-full py-1.5 rounded-xl font-bold text-[10px] text-slate-400 bg-slate-100 flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Character Title Customizer */}
          <div className="bg-slate-50 rounded-3xl p-5 border-2 border-slate-200 space-y-3">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Choose Your Character Title</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Pick a friendly title that reflects your superpower!
            </p>

            <div className="flex flex-wrap gap-2">
              {CHARACTER_TITLES.map((title) => {
                const isSelected = (childProfile.activeTitle || 'Star Explorer') === title;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSelectTitle(title)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                        : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE CARD PREVIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span>My Customized Profile</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Here is your official Lumina ID card with your active stickers, avatar, and special comfort items.
            </p>
          </div>

          {/* Official Child Identity Showcase Card */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Background shimmer */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center shadow-lg border-2 border-white/30">
                  <ChildAvatar config={avatar} size="lg" />
                </div>
                {/* Active Sticker Flair Badge on Avatar */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-md border-2 border-white">
                  {childProfile.activeSticker || '☀️'}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {childProfile.activeTitle || 'Star Explorer'}
                  </span>
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-400" />
                    {worldState.stars} Stars
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {childProfile.name}
                </h3>

                <p className="text-xs sm:text-sm text-white/80 font-medium">
                  Communication style: {childProfile.communicationPreference}
                </p>

                {/* Highlights: Comfort items & Favorites */}
                <div className="pt-3 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
                  {childProfile.comfortItems.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-xs font-semibold text-white/90 border border-white/20"
                    >
                      🛡️ {item}
                    </span>
                  ))}
                  {childProfile.favoriteFoods.slice(0, 2).map((food, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-xs font-semibold text-white/90 border border-white/20"
                    >
                      🍕 {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Customize Avatar in My World */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="font-black text-slate-800 text-sm">
                Want to change your hairstyle, skin tone, or headphones?
              </h4>
              <p className="text-xs text-slate-500">
                You can customize your avatar's accessories, wheelchair, and glasses in My World!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setChildView('my-world');
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <span>Customize Avatar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: THEMES & STUDIO */}
      {activeTab === 'themes' && (
        <ThemeShopAndStudio />
      )}
    </div>
  );
};
