import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserAgeGroup, 
  EnabledFeatures, 
  getDefaultFeaturesForAge,
  UserAccountRole
} from '../types';
import { playChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  User, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  Timer, 
  Sliders, 
  HelpCircle,
  Play,
  Sun,
  BookOpen
} from 'lucide-react';
import { BeeMascot } from './BeeYouLogo';
import { CaregiverHowItWorksModal } from './CaregiverHowItWorksModal';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
}) => {
  const {
    childProfile,
    updateChildProfile,
    updateSettings,
    setTheme,
    setUserAgeGroup,
    setUserRole,
    userAgeGroup: currentContextAge,
    enabledFeatures: contextFeatures,
    updateEnabledFeatures,
    setChildView,
    setIsParentMode,
    setShowCaregiverModal,
  } = useApp();

  // Mode: 'user' (Child/Teen/Adult) or 'caregiver'
  const [onboardingMode, setOnboardingMode] = useState<'user' | 'caregiver'>('user');
  const [step, setStep] = useState<number>(1);
  const [showFirstActionPrompt, setShowFirstActionPrompt] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // User Profile Form State
  const [selectedAge, setSelectedAge] = useState<UserAgeGroup>(childProfile.ageGroup || currentContextAge || 'kid');
  const [role, setRole] = useState<'self' | 'caregiver_managing'>(() => {
    if (childProfile.userRole) return childProfile.userRole;
    return (childProfile.ageGroup === 'adult' || currentContextAge === 'adult') ? 'self' : 'caregiver_managing';
  });
  const [name, setName] = useState<string>(childProfile.name || (selectedAge === 'adult' ? 'Alex' : 'Leo'));
  const [pronouns, setPronouns] = useState<string>(childProfile.pronouns || 'they/them');
  
  // Features state
  const [features, setFeatures] = useState<EnabledFeatures>(() => {
    return contextFeatures || getDefaultFeaturesForAge(selectedAge);
  });

  const totalUserSteps = 5;
  const totalCaregiverSteps = 3;

  const handleAgeSelect = (newAge: UserAgeGroup) => {
    setSelectedAge(newAge);
    if (newAge === 'kid' || newAge === 'teen') {
      setRole('caregiver_managing');
    } else {
      setRole('self');
    }
    playChime('tap');
    setFeatures(getDefaultFeaturesForAge(newAge));
  };

  const handleFinishOnboarding = (actionAfter?: 'morning_routine' | 'home' | 'caregiver_setup') => {
    // 1. Calculate user role
    const calculatedRole: UserAccountRole = onboardingMode === 'caregiver'
      ? 'caregiver'
      : (selectedAge === 'adult'
          ? (role === 'self' ? 'independent_adult' : 'caregiver')
          : (selectedAge === 'teen' ? 'teen_dependent' : 'child_dependent'));

    // 2. Save profile
    updateChildProfile({
      name: name.trim() || (selectedAge === 'adult' ? 'Alex' : 'Leo'),
      pronouns: pronouns.trim(),
      ageGroup: selectedAge,
      userRole: role,
      interests: childProfile.interests || ['Visual schedules', 'Calm routines'],
      onboardingCompleted: true,
    });

    // 3. Update global context
    if (setUserAgeGroup) setUserAgeGroup(selectedAge);
    if (setUserRole) setUserRole(calculatedRole);
    if (updateEnabledFeatures) updateEnabledFeatures(features);

    // 4. Update settings
    updateSettings({
      onboardingCompleted: true,
      features: features,
    });

    try {
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_user_age_group', selectedAge);
      localStorage.setItem('beeyou_user_role', calculatedRole);
      localStorage.setItem('beeyou_enabled_features', JSON.stringify(features));
    } catch (e) {}

    // 5. Default Theme
    const defaultThemeId = selectedAge === 'adult' ? 'theme-executive' : selectedAge === 'teen' ? 'theme-lofi' : 'theme-classic';
    setTheme(defaultThemeId);

    // 6. Celebration & Routing
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.5 } });
    playChime('complete');

    onClose();

    if (actionAfter === 'morning_routine') {
      if (setChildView) setChildView('my-day');
    } else if (actionAfter === 'caregiver_setup') {
      if (setShowCaregiverModal) setShowCaregiverModal(true);
    } else {
      if (setChildView) setChildView('home');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
          
          {/* TOP HEADER */}
          <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shadow-inner">
                <BeeMascot size="sm" pose={step === 1 ? 'waving' : step === 3 ? 'flying' : 'celebrating'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Welcome to BeeYou
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Step {step} of {onboardingMode === 'caregiver' ? totalCaregiverSteps : totalUserSteps}
                  </span>
                </div>
                <h2 id="onboarding-title" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                  {onboardingMode === 'caregiver' ? 'Caregiver & Supporter Setup' : 'Your Friendly Visual Companion'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Open How It Works Guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How It Works</span>
              </button>

              {canDismiss && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  aria-label="Close onboarding"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* STEP PROGRESS BAR */}
          <div className="w-full bg-amber-100/60 dark:bg-slate-800 h-1.5 flex shrink-0">
            {Array.from({ length: onboardingMode === 'caregiver' ? totalCaregiverSteps : totalUserSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-all duration-300 ${
                  i + 1 <= step ? 'bg-amber-500' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* ONBOARDING BODY CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* ══════════════════════════════════════════════════════
                STANDARD USER ONBOARDING FLOW
            ══════════════════════════════════════════════════════ */}
            {onboardingMode === 'user' && (
              <>
                {/* SCREEN 1: WELCOME */}
                {step === 1 && (
                  <div className="space-y-6 text-center py-4 animate-in fade-in">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/50 border-2 border-amber-300 flex items-center justify-center shadow-md">
                      <BeeMascot size="lg" pose="waving" />
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome to BeeYou
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        BeeYou helps you organize your day, follow routines, communicate how you feel, and ask for help when you need it.
                      </p>
                      <div className="pt-2">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold text-xs">
                          🐝 "You can be yourself here."
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          playChime('tap');
                        }}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOnboardingMode('caregiver');
                          setStep(1);
                          playChime('tap');
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>I am a caregiver / teacher</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: WHO IS BEEYOU FOR? */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Who is BeeYou for?
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        BeeYou is designed for anyone who benefits from visual schedules, predictable routines, communication supports, and gentle timers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Kids */}
                      <button
                        type="button"
                        onClick={() => handleAgeSelect('kid')}
                        className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedAge === 'kid' && role !== 'self'
                            ? 'border-amber-400 bg-amber-50/90 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">🧒</span>
                          {selectedAge === 'kid' && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">Kids</h4>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Ages 3–11
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                            Warm colors, cozy bee mascot, star celebrations, and First/Then cards.
                          </p>
                        </div>
                      </button>

                      {/* Teens */}
                      <button
                        type="button"
                        onClick={() => handleAgeSelect('teen')}
                        className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedAge === 'teen'
                            ? 'border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">🎧</span>
                          {selectedAge === 'teen' && (
                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">Teens</h4>
                          <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Ages 12–17
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                            Lo-fi calm visuals, focused countdowns, independent routines, zero baby talk.
                          </p>
                        </div>
                      </button>

                      {/* Adults */}
                      <button
                        type="button"
                        onClick={() => handleAgeSelect('adult')}
                        className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedAge === 'adult'
                            ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">💼</span>
                          {selectedAge === 'adult' && (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">Adults</h4>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Ages 18+
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                            Executive space, clean minimal theme, discreet calm mode, optional support contact.
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Who is configuring note */}
                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3">
                      <span>💡 You can always change age presets or customize individual features later.</span>
                    </div>
                  </div>
                )}

                {/* SCREEN 3: START WITH YOUR DAY */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Start with your day
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        Follow one activity at a time instead of thinking about the whole day at once.
                      </p>
                    </div>

                    {/* Visual Schedule Example */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-2 border-amber-300/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">☀️</span>
                          <span className="font-black text-sm text-amber-950 dark:text-amber-200">
                            Example: Morning Routine
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                          Step-by-Step
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { title: 'Wake up & stretch', emoji: '☀️', time: '2m' },
                          { title: 'Brush teeth', emoji: '🪥', time: '2m' },
                          { title: 'Get dressed', emoji: '👕', time: '5m' },
                          { title: 'Eat breakfast', emoji: '🥞', time: '15m' },
                          { title: 'Pack bag & go', emoji: '🎒', time: '5m' },
                        ].map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xl">{item.emoji}</span>
                              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                {item.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                              {item.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Each activity has large icons, clear timers, and shows what comes next so transitions stay calm.
                    </p>
                  </div>
                )}

                {/* SCREEN 4: NEED HELP? (ALERTS) */}
                {step === 4 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Need help? Simple Alerts
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        If you are connected to a caregiver or support person, you can send them a simple alert when you need help.
                      </p>
                    </div>

                    {/* Visual Demo of Alert and Response */}
                    <div className="p-4 sm:p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                      {/* Step 1: Child sends */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          1. You tap one button:
                        </span>
                        <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 font-black text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🆘</span>
                            <span>I NEED HELP</span>
                          </div>
                          <span className="text-xs font-bold text-rose-700">1-Tap Alert</span>
                        </div>
                      </div>

                      {/* Step 2: Caregiver receives */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          2. Caregiver receives:
                        </span>
                        <div className="p-3 rounded-2xl bg-slate-900 text-white font-medium text-xs sm:text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔔</span>
                            <span>"{name || 'Alex'} needs help right now."</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full">
                            Instant
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Caregiver responds */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          3. Caregiver sends a reassuring response:
                        </span>
                        <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-black text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">❤️</span>
                            <span>I'm here</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-700">Read aloud automatically</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Zero complicated text messaging or phone apps. Clear, predictable reassurance when words are hard.
                    </p>
                  </div>
                )}

                {/* SCREEN 5: MAKE BEEYOU WORK FOR YOU */}
                {step === 5 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Make BeeYou work for you
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        Personalize your name and preferences. You can adjust routines, timers, sounds, and features at any time.
                      </p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                          {selectedAge === 'adult' ? 'Your Name:' : "Child or User's Name:"}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={selectedAge === 'adult' ? 'Alex' : 'Leo'}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                          Pronouns (optional):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['they/them', 'he/him', 'she/her', 'any pronouns'].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPronouns(p);
                                playChime('tap');
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                pronouns === p
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-black'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-950 dark:text-amber-200 text-xs font-medium">
                      🎉 <strong>You're all set!</strong> Tap below to start your personalized BeeYou experience.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════
                CAREGIVER DEDICATED ONBOARDING FLOW
            ══════════════════════════════════════════════════════ */}
            {onboardingMode === 'caregiver' && (
              <>
                {/* CAREGIVER SCREEN 1 */}
                {step === 1 && (
                  <div className="space-y-6 text-center py-4 animate-in fade-in">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-300 flex items-center justify-center shadow-md">
                      <Heart className="w-10 h-10 text-rose-600 fill-rose-500" />
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome, Caregiver & Educator
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        BeeYou helps the person you support follow routines, understand what is coming next, communicate how they feel, and ask for help.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto text-left space-y-1.5 font-medium">
                      <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                        What you can do:
                      </div>
                      <div>• Set up visual morning & evening routines</div>
                      <div>• Connect an iPad or phone with a simple 6-character code</div>
                      <div>• Receive 1-tap alerts and send instant reassuring responses</div>
                    </div>
                  </div>
                )}

                {/* CAREGIVER SCREEN 2 */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Your Caregiver Role
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        You can manage routines, customize visual activities, and choose which notifications you receive.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Customize Routines</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Add, reorder, or edit steps with icons, timers, and sensory notes.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Receive Instant Help Alerts</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Receive notifications when they need help and reply with 1 tap.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                        <Sliders className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Feature Toggles & Privacy</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Turn off any features they do not need to keep the screen simple.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAREGIVER SCREEN 3 */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        Let's Get Started!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        Choose your next step. You can link a device now or try a sample routine first:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleFinishOnboarding('caregiver_setup')}
                        className="p-4 rounded-3xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-left cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="text-3xl">👤</span>
                        <h4 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-200 mt-2">
                          Add Someone I Support
                        </h4>
                        <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-1 font-medium">
                          Set up their profile or pair their iPad / phone with a pairing code.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowGuideModal(true);
                          playChime('tap');
                        }}
                        className="p-4 rounded-3xl border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-left cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <span className="text-3xl">🎮</span>
                        <h4 className="font-black text-sm sm:text-base text-indigo-950 dark:text-indigo-200 mt-2">
                          Try Sample Routine Demo
                        </h4>
                        <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 mt-1 font-medium">
                          Interact with a live morning routine and timer in our interactive sandbox.
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setStep(step - 1);
                  playChime('tap');
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div>
                {onboardingMode === 'caregiver' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingMode('user');
                      setStep(1);
                      playChime('tap');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
                  >
                    Switch to User Mode
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {onboardingMode === 'user' && step < totalUserSteps && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(step + 1);
                    playChime('tap');
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onboardingMode === 'user' && step === totalUserSteps && (
                <button
                  type="button"
                  onClick={() => setShowFirstActionPrompt(true)}
                  className="px-7 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all animate-pulse"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Using BeeYou 🎉</span>
                </button>
              )}

              {onboardingMode === 'caregiver' && step < totalCaregiverSteps && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(step + 1);
                    playChime('tap');
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onboardingMode === 'caregiver' && step === totalCaregiverSteps && (
                <button
                  type="button"
                  onClick={() => handleFinishOnboarding('caregiver_setup')}
                  className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span>Open Caregiver Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* POST-ONBOARDING FIRST ACTION MODAL */}
      {showFirstActionPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 text-center border-2 border-amber-300 dark:border-amber-800 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 mx-auto flex items-center justify-center text-3xl">
              ☀️
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Let's create your first routine!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Starting with a morning routine makes everyday transitions smooth and predictable.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowFirstActionPrompt(false);
                  handleFinishOnboarding('morning_routine');
                }}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sun className="w-4 h-4" />
                <span>Create Morning Routine</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFirstActionPrompt(false);
                  handleFinishOnboarding('home');
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                I'll do this later (Go to Home)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW IT WORKS / GUIDE MODAL */}
      <CaregiverHowItWorksModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialTopic="what_is_beeyou"
      />
    </>
  );
};
