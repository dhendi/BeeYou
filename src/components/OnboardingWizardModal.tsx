import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserAgeGroup, 
  EnabledFeatures, 
  getDefaultFeaturesForAge
} from '../types';
import { playChime, speakText } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  User, 
  X
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

const COMMUNICATION_STYLES = [
  { id: 'aac_tiles', label: 'AAC Picture Board & Speech Engine', emoji: '🗣️', desc: 'Symbol board with voice speech (Enables Communicate Tab)', needsAac: true },
  { id: 'verbal_speech', label: 'Speaks Verbally / No AAC Board', emoji: '💬', desc: 'User speaks verbally — hides Communicate tab and AAC tiles', needsAac: false },
  { id: 'visual_routines', label: 'Visual Schedules & Time Timers', emoji: '📅', desc: 'Focus on routines and visual timers (Hides Communicate Tab)', needsAac: false },
  { id: 'calm_pacer', label: 'Sensory Breaks & Calming Tools', emoji: '🫁', desc: 'Sensory regulation & calming tools (Hides Communicate Tab)', needsAac: false },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
}) => {
  const {
    childProfile,
    updateChildProfile,
    settings,
    updateSettings,
    themes,
    setTheme,
    setUserAgeGroup,
    userAgeGroup: currentContextAge,
    enabledFeatures: contextFeatures,
    updateEnabledFeatures,
    childView,
    setChildView,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 3;

  // Wizard local form state
  const [selectedAge, setSelectedAge] = useState<UserAgeGroup>(childProfile.ageGroup || currentContextAge || 'kid');
  const [role, setRole] = useState<'self' | 'caregiver_managing'>(() => {
    if (childProfile.userRole) return childProfile.userRole;
    return (childProfile.ageGroup === 'adult' || currentContextAge === 'adult') ? 'self' : 'caregiver_managing';
  });
  const [name, setName] = useState<string>(childProfile.name || (selectedAge === 'adult' ? 'Alex' : 'Leo'));
  const [pronouns, setPronouns] = useState<string>(childProfile.pronouns || 'they/them');
  const [commStyle, setCommStyle] = useState<string>('aac_tiles');
  
  // Features state
  const [features, setFeatures] = useState<EnabledFeatures>(() => {
    return contextFeatures || getDefaultFeaturesForAge(selectedAge);
  });

  // When selected age changes, update recommended features and role
  const handleAgeChange = (newAge: UserAgeGroup) => {
    setSelectedAge(newAge);
    if (newAge === 'kid' || newAge === 'teen') {
      setRole('caregiver_managing');
    } else {
      setRole('self');
    }
    playChime('tap');
    
    // Suggest default features for this age
    const newDefaults = getDefaultFeaturesForAge(newAge);
    setFeatures(newDefaults);
  };

  const toggleFeatureKey = (key: keyof EnabledFeatures) => {
    playChime('tap');
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApplyPreset = (presetAge: UserAgeGroup) => {
    playChime('star');
    setFeatures(getDefaultFeaturesForAge(presetAge));
  };

  const handleFinish = () => {
    // 1. Update Profile
    updateChildProfile({
      name: name.trim() || (selectedAge === 'adult' ? 'User' : 'Friend'),
      pronouns: pronouns.trim(),
      ageGroup: selectedAge,
      userRole: role,
      interests: childProfile.interests || [],
      onboardingCompleted: true,
    });

    // 2. Update Context Age Group & Features
    if (setUserAgeGroup) setUserAgeGroup(selectedAge);
    if (updateEnabledFeatures) updateEnabledFeatures(features);

    // 3. Update Settings
    updateSettings({
      onboardingCompleted: true,
      features: features,
    });
    try {
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_user_age_group', selectedAge);
      localStorage.setItem('beeyou_enabled_features', JSON.stringify(features));
    } catch (e) {}

    // 4. Equip default theme
    const defaultThemeId = selectedAge === 'adult' ? 'theme-executive' : selectedAge === 'teen' ? 'theme-lofi' : 'theme-classic';
    setTheme(defaultThemeId);

    // 5. If AAC was disabled, reset view to home
    if (!features.aacCommunication && childView === 'aac' && setChildView) {
      setChildView('home');
    }

    // 6. Celebration
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    playChime('complete');

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden text-slate-800">
        
        {/* WIZARD HEADER */}
        <div className="bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/30 text-white">
                  Welcome to BeeYou
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Step {step} of {totalSteps}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                {step === 1 && 'Who is using BeeYou?'}
                {step === 2 && 'Your Profile & Communication'}
                {step === 3 && 'Choose Your Tools & Features'}
              </h2>
            </div>
          </div>

          {canDismiss && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="w-full bg-slate-100 h-2 flex shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 transition-all duration-300 ${
                s <= step ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* WIZARD BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STEP 1: AGE GROUP & ROLE */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  BeeYou adapts its visuals, wording, and tools to fit you perfectly. Choose an experience to start with (you can always customize any feature later):
                </p>
              </div>

              {/* Age Group Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kid */}
                <button
                  type="button"
                  onClick={() => handleAgeChange('kid')}
                  className={`p-4 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAge === 'kid'
                      ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🧒</span>
                    {selectedAge === 'kid' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-black text-slate-900 text-base">Kids</h3>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Ages 3–11
                    </span>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Cheerful colors, friendly dino & frog mascots, star stickers, and simple First/Then cards.
                    </p>
                  </div>
                </button>

                {/* Teen */}
                <button
                  type="button"
                  onClick={() => handleAgeChange('teen')}
                  className={`p-4 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAge === 'teen'
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-400'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🎧</span>
                    {selectedAge === 'teen' && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-black text-slate-900 text-base">Teens</h3>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Ages 12–17
                    </span>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Lo-Fi and cyberpunk styles, focused visual countdowns, independence habits, and zero baby talk.
                    </p>
                  </div>
                </button>

                {/* Adult */}
                <button
                  type="button"
                  onClick={() => handleAgeChange('adult')}
                  className={`p-4 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAge === 'adult'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">💼</span>
                    {selectedAge === 'adult' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-black text-slate-900 text-base">Adults</h3>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Ages 18+
                    </span>
                    <p className="text-xs text-slate-600 mt-2 font-medium">
                      Executive function tools, dignified AAC boards, discreet calm styling, OLED dark mode, and therapy logs.
                    </p>
                  </div>
                </button>
              </div>

              {/* Who is configuring? */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
                  Who is filling this out?
                </label>
                
                {selectedAge === 'adult' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('self');
                        playChime('tap');
                      }}
                      className={`p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer ${
                        role === 'self'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>I am setting this up for myself</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('caregiver_managing');
                        playChime('tap');
                      }}
                      className={`p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer ${
                        role === 'caregiver_managing'
                          ? 'border-rose-500 bg-rose-50 text-rose-950 font-black'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>I am a caregiver or support assistant</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/80 text-rose-950 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-slate-900">Parent or Caregiver Setup</span>
                      <p className="text-[11px] text-rose-800 font-medium leading-tight mt-0.5">
                        {selectedAge === 'kid' ? 'Kids' : 'Teens'} profiles must be set up and managed by a parent, guardian, or therapist.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE & COMMUNICATION */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">
                    {selectedAge === 'adult' ? 'Your Name:' : "Child or User's Name:"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedAge === 'adult' ? 'Alex' : 'Leo'}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 font-bold text-base focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">
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
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                          pronouns === p
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-black'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1.5">
                    What does the user need most?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COMMUNICATION_STYLES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCommStyle(c.id);
                          setFeatures(prev => ({
                            ...prev,
                            aacCommunication: c.needsAac,
                          }));
                          playChime('tap');
                        }}
                        className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                          commStyle === c.id
                            ? 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-400'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.emoji}</span>
                          <span className="text-xs font-black text-slate-800">{c.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">{c.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Explicit AAC device inclusion / removal card */}
                  <div className="mt-3 p-3.5 rounded-2xl border-2 bg-slate-50 border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{features.aacCommunication ? '🗣️' : '🚫'}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          {features.aacCommunication ? 'AAC Communicate Tab: ENABLED' : 'AAC Communicate Tab: REMOVED'}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {features.aacCommunication
                            ? 'The "Communicate" tab will appear on the navigation bar.'
                            : 'The "Communicate" tab is hidden from the navigation bar.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFeatureKey('aacCommunication');
                        if (features.aacCommunication) {
                          setCommStyle('verbal_speech');
                        } else {
                          setCommStyle('aac_tiles');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                        features.aacCommunication
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 font-black'
                          : 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-black shadow-2xs'
                      }`}
                    >
                      {features.aacCommunication ? 'Remove AAC' : 'Enable AAC'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CURATED TOOLS & FEATURES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Curated Features for {selectedAge.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    You can toggle any feature on or off. Adults can have stickers; kids can have a minimal layout!
                  </p>
                </div>

                {/* Preset shortcuts */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('kid')}
                    className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] cursor-pointer"
                  >
                    Kids
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('teen')}
                    className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-[10px] cursor-pointer"
                  >
                    Teens
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('adult')}
                    className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] cursor-pointer"
                  >
                    Adults
                  </button>
                </div>
              </div>

              {/* Feature Grid / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* AAC Symbol Board */}
                <div 
                  onClick={() => toggleFeatureKey('aacCommunication')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.aacCommunication ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🗣️</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">AAC Symbol & Voice Board</h4>
                      <p className="text-[11px] text-slate-500">Motor-planned picture tiles with speech</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.aacCommunication}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Visual Countdown Timer */}
                <div 
                  onClick={() => toggleFeatureKey('visualCountdownTimer')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.visualCountdownTimer ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Visual Countdown Timer</h4>
                      <p className="text-[11px] text-slate-500">Smooth visual time ring for tasks</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.visualCountdownTimer}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* First / Then Schedules */}
                <div 
                  onClick={() => toggleFeatureKey('firstThenSchedules')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.firstThenSchedules ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">First / Then Schedules</h4>
                      <p className="text-[11px] text-slate-500">Visual next-step breakdown</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.firstThenSchedules}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Stars & Digital Stickers */}
                <div 
                  onClick={() => toggleFeatureKey('starsAndRewards')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.starsAndRewards ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Stars & Digital Stickers</h4>
                      <p className="text-[11px] text-slate-500">Routine reward coins & badges</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.starsAndRewards}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Playful Mascot Companion */}
                <div 
                  onClick={() => toggleFeatureKey('mascotCompanion')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.mascotCompanion ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🦕</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Playful Mascot Companion</h4>
                      <p className="text-[11px] text-slate-500">Rex / Hopper greetings & cheers</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.mascotCompanion}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Daily Mood & Recollection Log */}
                <div 
                  onClick={() => toggleFeatureKey('dailyMoodRecollection')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.dailyMoodRecollection ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🌙</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Evening Mood & Therapy Log</h4>
                      <p className="text-[11px] text-slate-500">Daily check-in & therapist export</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.dailyMoodRecollection}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Sensory Breathing Pacer */}
                <div 
                  onClick={() => toggleFeatureKey('sensoryBreathingPacer')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.sensoryBreathingPacer ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🫁</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Sensory Breathing & Coping</h4>
                      <p className="text-[11px] text-slate-500">Visual breath circle & calm tools</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.sensoryBreathingPacer}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Emergency Caregiver Alert SOS */}
                <div 
                  onClick={() => toggleFeatureKey('emergencyAlertSOS')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.emergencyAlertSOS ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Caregiver Alert SOS Button</h4>
                      <p className="text-[11px] text-slate-500">One-tap help & school alerts</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.emergencyAlertSOS}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Social Stories */}
                <div 
                  onClick={() => toggleFeatureKey('socialStories')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.socialStories ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📖</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Social Stories Preparation</h4>
                      <p className="text-[11px] text-slate-500">Pre-event stories for parties & visits</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.socialStories}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>

                {/* Discreet Minimal Mode */}
                <div 
                  onClick={() => toggleFeatureKey('discreetMode')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    features.discreetMode ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🕶️</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Discreet Minimal Mode</h4>
                      <p className="text-[11px] text-slate-500">Clean text layout, reduced animations</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={features.discreetMode}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* WIZARD FOOTER CONTROLS */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setStep(s => s - 1);
                playChime('tap');
              }}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                setStep(s => s + 1);
                playChime('tap');
              }}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-200 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>🚀 Launch BeeYou</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
