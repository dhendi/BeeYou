import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  QrCode, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Sliders, 
  ShieldAlert, 
  Battery, 
  MessageSquare, 
  Calendar, 
  Palette, 
  X, 
  Heart,
  Smile,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserPersona, EnabledFeatures, getDefaultFeaturesForAge } from '../types';
import { getPersonaLabel, getPersonaTokens, personaToAgeGroup } from '../utils/personaHelpers';
import { QRCodeView } from './QRCodeView';
import { getPairingCode } from '../services/caregiverSync';
import { playChime } from '../utils/audio';
import confetti from 'canvas-confetti';

interface AdaptiveOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

export type PairingMode = 'standalone' | 'caregiver_hub';

export const AdaptiveOnboardingFlow: React.FC<AdaptiveOnboardingFlowProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
}) => {
  const {
    userPersona,
    setUserPersona,
    childProfile,
    updateChildProfile,
    enabledFeatures,
    updateEnabledFeatures,
    activeThemeId,
    setTheme,
    linkedDeviceCode,
    setLinkedDeviceCode,
    setShowPostOnboardingSpotlight,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(userPersona || 'child');
  const [pairingMode, setPairingMode] = useState<PairingMode>('caregiver_hub');
  
  // Step 2 Form State
  const [name, setName] = useState<string>(() => {
    if (childProfile.name) return childProfile.name;
    return selectedPersona === 'adult' ? 'Alex' : selectedPersona === 'teen' ? 'Jordan' : 'Leo';
  });
  const [pronouns, setPronouns] = useState<string>(childProfile.pronouns || 'they/them');
  const [customPronoun, setCustomPronoun] = useState<string>('');

  // Step 3 Modular Toolkit Customization State
  const [featuresState, setFeaturesState] = useState<EnabledFeatures>(() => ({
    ...getDefaultFeaturesForAge(personaToAgeGroup(userPersona || 'child')),
    ...enabledFeatures,
    emergencyAlertSOS: enabledFeatures?.emergencyAlertSOS === true,
  }));

  // Step 4 Theme Selection State
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    const tokens = getPersonaTokens(userPersona || 'child');
    return activeThemeId || tokens.suggestedThemeId;
  });

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [currentPairingCode, setCurrentPairingCode] = useState<string>(() => {
    return linkedDeviceCode || getPairingCode() || 'BEE-101';
  });

  useEffect(() => {
    if (isOpen) {
      const code = linkedDeviceCode || getPairingCode() || 'BEE-101';
      setCurrentPairingCode(code);
      if (userPersona) setSelectedPersona(userPersona);
    }
  }, [isOpen, linkedDeviceCode, userPersona]);

  // Adjust defaults when persona changes in Step 1
  const handlePersonaSelect = (persona: UserPersona) => {
    setSelectedPersona(persona);
    playChime('tap');
    const tokens = getPersonaTokens(persona);
    setSelectedThemeId(tokens.suggestedThemeId);
    
    // Default features tailored to persona
    const defaultFeats = getDefaultFeaturesForAge(personaToAgeGroup(persona));
    setFeaturesState((prev) => ({
      ...defaultFeats,
      ...prev,
      spoonBudget: persona === 'adult' || persona === 'teen' ? true : prev.spoonBudget,
      emergencyAlertSOS: prev.emergencyAlertSOS === true,
      aacCommunication: true,
      firstThenSchedules: true,
    }));

    if (!name || name === 'Leo' || name === 'Alex' || name === 'Jordan') {
      setName(persona === 'adult' ? 'Alex' : persona === 'teen' ? 'Jordan' : 'Leo');
    }
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    playChime('tap');
    setFeaturesState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentPairingCode);
      setCopiedCode(true);
      playChime('tap');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleNext = () => {
    playChime('tap');
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    playChime('tap');
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleComplete = () => {
    playChime('star');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });
    } catch {}

    // 1. Commit persona & profile to state
    setUserPersona(selectedPersona);
    updateChildProfile({
      name: name.trim() || (selectedPersona === 'adult' ? 'Alex' : 'Leo'),
      pronouns: customPronoun.trim() || pronouns,
      ageGroup: personaToAgeGroup(selectedPersona),
    });

    // 2. Commit modular features
    updateEnabledFeatures(featuresState);

    // 3. Set active theme
    setTheme(selectedThemeId);

    // 4. Set pairing code
    if (currentPairingCode) {
      setLinkedDeviceCode(currentPairingCode);
    }

    // 5. Mark onboarding as complete in localStorage
    try {
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_user_persona', selectedPersona);
      localStorage.setItem('beeyou_pairing_mode', pairingMode);
    } catch {}

    onClose();
  };

  if (!isOpen) return null;

  const currentTokens = getPersonaTokens(selectedPersona);
  const nameLabel = getPersonaLabel(selectedPersona, 'nameLabel');
  const namePlaceholder = getPersonaLabel(selectedPersona, 'namePlaceholder');

  return (
    <div 
      className="fixed inset-0 z-[8000] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Adaptive Setup Onboarding"
    >
      <div 
        className={`w-full max-w-2xl bg-white dark:bg-slate-900 ${currentTokens.cardRadius} shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto max-h-[92vh] transition-all`}
      >
        {/* Top Header & Step Indicator */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step {step} of 4 • {step === 1 && 'Role & Persona'}
                {step === 2 && 'Identity & Dynamic Profile'}
                {step === 3 && 'Modular Toolkit Customization'}
                {step === 4 && 'Space Personalization & Pairing'}
              </span>
            </div>

            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Dismiss setup"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* ════════════════ STEP 1: ROLE & PERSONA ════════════════ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Who will be using BeeYou?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  We adapt colors, language, and sensory tools to match your exact developmental needs.
                </p>
              </div>

              {/* Age Bracket / Persona Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Child Option */}
                <button
                  type="button"
                  onClick={() => handlePersonaSelect('child')}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedPersona === 'child'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  {selectedPersona === 'child' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  )}
                  <div>
                    <span className="text-3xl">🐝</span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      Child (Ages 3–11)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Warm honey palette, claymorphism cards, friendly bee mascot avatar, playful icons.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-3 uppercase tracking-wider">
                    Playful & Gentle
                  </span>
                </button>

                {/* Teen Option */}
                <button
                  type="button"
                  onClick={() => handlePersonaSelect('teen')}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedPersona === 'teen'
                      ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/30 ring-2 ring-violet-400/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  {selectedPersona === 'teen' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  )}
                  <div>
                    <span className="text-3xl">🎧</span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      Teen (Ages 12–17)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Lo-fi muted aesthetic, minimal shadows, quick sensory resets, zero juvenile illustrations.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-3 uppercase tracking-wider">
                    Lo-Fi & Discreet
                  </span>
                </button>

                {/* Adult Option */}
                <button
                  type="button"
                  onClick={() => handlePersonaSelect('adult')}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedPersona === 'adult'
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30 ring-2 ring-teal-400/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  {selectedPersona === 'adult' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  )}
                  <div>
                    <span className="text-3xl">💼</span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      Adult (Ages 18+)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      High-efficiency Executive Minimal UI, Spoon Theory energy budget, medication tracker, passport.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-3 uppercase tracking-wider">
                    Executive Minimal
                  </span>
                </button>
              </div>

              {/* Pairing Mode Selection */}
              <div className="pt-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Device Pairing Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPairingMode('caregiver_hub')}
                    className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                      pairingMode === 'caregiver_hub'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">Pair with Caregiver Hub</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        Sync routines, live location, and receive silent SOS alerts remotely.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPairingMode('standalone')}
                    className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                      pairingMode === 'standalone'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Heart className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">Standalone Mode</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        Self-directed autonomous use directly on this tablet device.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: IDENTITY & DYNAMIC FIELDS ════════════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedPersona === 'child' ? "Tell us about your child" : "What is your identity?"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {selectedPersona === 'child' 
                    ? "We will customize voice, greeting tags, and communication tiles."
                    : "Personalize your greetings, voice tags, and communication passport."}
                </p>
              </div>

              {/* Persona-Aware Dynamic Name Field */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {nameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={namePlaceholder}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                  />
                </div>
              </div>

              {/* Pronoun Preferences */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pronouns Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['they/them', 'she/her', 'he/him', 'other'].map((p) => {
                    const isSelected = pronouns === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          playChime('tap');
                          setPronouns(p);
                        }}
                        className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition cursor-pointer capitalize ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {pronouns === 'other' && (
                  <input
                    type="text"
                    value={customPronoun}
                    onChange={(e) => setCustomPronoun(e.target.value)}
                    placeholder="Enter custom pronouns (e.g. ze/zir)"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:border-amber-500 focus:outline-none mt-2"
                  />
                )}
              </div>
            </div>
          )}

          {/* ════════════════ STEP 3: MODULAR TOOLKIT CUSTOMIZATION ════════════════ */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Modular Toolkit Customization
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Toggle on only what you need to prevent sensory clutter and cognitive overload.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. AAC Grid */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-start gap-3.5 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        AAC Communication Grid
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        High-contrast speech tiles categorized with the Fitzgerald Key.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFeature('aacCommunication')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      featuresState.aacCommunication !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                        featuresState.aacCommunication !== false ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Visual Schedules */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-start gap-3.5 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Visual Schedules & First-Then
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Step-by-step visual routines and pie timer transitions.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFeature('firstThenSchedules')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      featuresState.firstThenSchedules !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                        featuresState.firstThenSchedules !== false ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Spoon Theory Energy Budget */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-start gap-3.5 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center shrink-0">
                      <Battery className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Spoon Theory Energy Budget
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        1–5 scale daily energy pacing for executive task management.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFeature('spoonBudget')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      featuresState.spoonBudget !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                        featuresState.spoonBudget !== false ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Sensory Safe Mode & Emergency SOS */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-start gap-3.5 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Sensory Safe Mode & Overload Shield
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        High-contrast red emergency button with 4 survival tactile tiles.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFeature('emergencyAlertSOS')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      featuresState.emergencyAlertSOS === true ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 ${
                        featuresState.emergencyAlertSOS === true ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 4: SPACE PERSONALIZATION & INSTANT PAIRING ════════════════ */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Space Personalization & Instant Pairing
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Select your sensory color theme and scan the real-time QR code to pair your device.
                </p>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Sensory Visual Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'theme-turtle', name: 'Wise Turtle', emoji: '🐢', color: 'from-emerald-400 to-teal-500' },
                    { id: 'theme-lofi', name: 'Lo-Fi Chill', emoji: '🎧', color: 'from-violet-500 to-indigo-600' },
                    { id: 'theme-sage', name: 'Executive Sage', emoji: '🌿', color: 'from-slate-600 to-teal-700' },
                  ].map((thm) => {
                    const isSelected = selectedThemeId === thm.id;
                    return (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => {
                          playChime('tap');
                          setSelectedThemeId(thm.id);
                        }}
                        className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition cursor-pointer relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-400/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-2xl">{thm.emoji}</span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {thm.name}
                        </span>
                        <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${thm.color} mt-1`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-Time QR Code Display for Instant Pairing */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 shrink-0">
                  <QRCodeView value={currentPairingCode} size={140} />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Instant Camera Scan</span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    Scan with Caregiver Phone
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Open your phone camera to pair with the Caregiver Hub instantly. No passwords or email required.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="font-mono font-black text-sm px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 tracking-wider">
                      {currentPairingCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                      title="Copy pairing code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-5 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
          >
            <span>{step === 4 ? 'Launch Dashboard 🚀' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4 stroke-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
