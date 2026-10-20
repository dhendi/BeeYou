import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Users, 
  QrCode, 
  Star, 
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
  Smartphone,
  Globe,
  Crown,
  Headphones,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserPersona, EnabledFeatures, getDefaultFeaturesForAge, BillingCycle } from '../types';
import { getPersonaLabel, getPersonaTokens, personaToAgeGroup } from '../utils/personaHelpers';
import { QRCodeView } from './QRCodeView';
import { getPairingCode } from '../services/caregiverSync';
import { playChime } from '../utils/audio';
import { LanguageDropdown } from './LanguageDropdown';
import { t } from '../services/translator';
import {
  LanguageGlobeSticker,
  ChildPersonaSticker,
  TeenHeadphonesSticker,
  AdultBriefcaseSticker,
  CaregiverPhoneSticker,
  ScheduleCalendarSticker,
  TrialCrownSticker,
  QuickPhrasesSticker,
  SpoonSticker,
  ShieldSosSticker,
  TabletIpadSticker,
  FidgetBubblesSticker,
  ConnectHeartSticker,
} from './icons/JournalStickers';
import { AacVoiceLoadingScreen } from './common/AacVoiceLoadingScreen';

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
    settings,
    startFreeTrial,
    setSubscriptionTier,
    setShowEmailVerificationModal,
  } = useApp();

  const ONBOARDING_STEP_KEY = 'beeyou_onboarding_current_step';
  const ONBOARDING_NAME_KEY = 'beeyou_onboarding_name';
  const ONBOARDING_PERSONA_KEY = 'beeyou_onboarding_persona';
  const ONBOARDING_PAIRING_KEY = 'beeyou_onboarding_pairing';

  const [step, setStepState] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1 && num <= 5) return num;
      }
    } catch {}
    return 1;
  });

  const setStep = (valOrFn: number | ((prev: number) => number)) => {
    setStepState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        sessionStorage.setItem(ONBOARDING_STEP_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const totalSteps = 5;

  const [selectedPersona, setSelectedPersonaState] = useState<UserPersona>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_PERSONA_KEY) as UserPersona;
      if (saved === 'child' || saved === 'teen' || saved === 'adult') return saved;
    } catch {}
    return userPersona || 'child';
  });

  const setSelectedPersona = (persona: UserPersona) => {
    setSelectedPersonaState(persona);
    try {
      sessionStorage.setItem(ONBOARDING_PERSONA_KEY, persona);
    } catch {}
  };

  const [pairingMode, setPairingModeState] = useState<PairingMode>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_PAIRING_KEY) as PairingMode;
      if (saved === 'caregiver_hub' || saved === 'standalone') return saved;
    } catch {}
    return 'caregiver_hub';
  });

  const setPairingMode = (mode: PairingMode) => {
    setPairingModeState(mode);
    try {
      sessionStorage.setItem(ONBOARDING_PAIRING_KEY, mode);
    } catch {}
  };

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('yearly');
  
  // Real-time re-render listener when language is changed
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const handleLangChange = () => setForceUpdate((v) => v + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  // Step 2 Form State (Child / User Name)
  const [name, setNameState] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_NAME_KEY);
      if (saved !== null && saved !== undefined && saved !== '') return saved;
    } catch {}
    if (childProfile.name && !['Leo','Alex','Jordan','Sarah (Mom)','Mom'].includes(childProfile.name)) return childProfile.name;
    return '';
  });

  const setName = (newName: string) => {
    setNameState(newName);
    try {
      sessionStorage.setItem(ONBOARDING_NAME_KEY, newName);
    } catch {}
  };

  // Only reset if transitioning from closed (false) to open (true) AND no step was in progress
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
      if (!saved) {
        setStep(1);
        setSelectedPersona(userPersona || 'child');
        if (childProfile.name && !['Leo','Alex','Jordan','Sarah (Mom)','Mom'].includes(childProfile.name)) {
          setName(childProfile.name);
        }
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, userPersona, childProfile.name]);

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

  const [showAacLoadingScreen, setShowAacLoadingScreen] = useState<boolean>(false);
  const [pendingTrialChoice, setPendingTrialChoice] = useState<boolean>(false);

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
      aacCommunication: prev.aacCommunication !== undefined ? prev.aacCommunication : true,
      aac: prev.aac !== undefined ? prev.aac : true,
      firstThenSchedules: true,
    }));
  };

  const toggleFeature = (key: keyof EnabledFeatures) => {
    playChime('tap');
    setFeaturesState((prev) => {
      const nextVal = !prev[key];
      if (key === 'aacCommunication') {
        return {
          ...prev,
          aacCommunication: nextVal,
          aac: nextVal,
        };
      }
      return {
        ...prev,
        [key]: nextVal,
      };
    });
  };

  const handleNext = () => {
    playChime('tap');
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      handleComplete(false);
    }
  };

  const handleBack = () => {
    playChime('tap');
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const finalizeOnboarding = (withTrial = false) => {
    if (withTrial) {
      startFreeTrial(selectedCycle);
    } else {
      setSubscriptionTier('basic');
    }

    // 1. Commit persona & profile to state
    setUserPersona(selectedPersona);
    updateChildProfile({
      name: name.trim(),
      pronouns: '',
      ageGroup: personaToAgeGroup(selectedPersona),
    });

    // 2. Commit modular features
    updateEnabledFeatures(featuresState);
    try {
      localStorage.setItem('beeyou_aac_enabled', String(featuresState.aacCommunication !== false && featuresState.aac !== false));
    } catch {}

    // 3. Set active theme
    const tokens = getPersonaTokens(selectedPersona);
    setTheme(selectedThemeId || tokens.suggestedThemeId);

    // 4. Set pairing code
    if (currentPairingCode) {
      setLinkedDeviceCode(currentPairingCode);
    }

    // 5. Mark onboarding as complete in localStorage and clear session keys
    try {
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_user_persona', selectedPersona);
      localStorage.setItem('beeyou_pairing_mode', pairingMode);
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      sessionStorage.removeItem(ONBOARDING_NAME_KEY);
      sessionStorage.removeItem(ONBOARDING_PERSONA_KEY);
      sessionStorage.removeItem(ONBOARDING_PAIRING_KEY);
    } catch {}

    onClose();
  };

  const handleComplete = async (withTrial = false) => {
    playChime('star');

    if (featuresState.aacCommunication !== false && featuresState.aac !== false) {
      setPendingTrialChoice(withTrial);
      setShowAacLoadingScreen(true);
    } else {
      finalizeOnboarding(withTrial);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      sessionStorage.removeItem(ONBOARDING_NAME_KEY);
      sessionStorage.removeItem(ONBOARDING_PERSONA_KEY);
      sessionStorage.removeItem(ONBOARDING_PAIRING_KEY);
    } catch {}
    onClose();
  };

  if (!isOpen) return null;

  const currentTokens = getPersonaTokens(selectedPersona);
  const nameLabel = getPersonaLabel(selectedPersona, 'nameLabel');
  const namePlaceholder = getPersonaLabel(selectedPersona, 'namePlaceholder');

  return (
    <div 
      className="fixed inset-0 z-[8000] bg-[#FAF7EE] dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Adaptive Setup Onboarding"
    >
      <div 
        className="w-full h-full flex flex-col overflow-hidden max-w-3xl mx-auto"
      >
        {/* Top Header & Step Indicator */}
        <div className="pt-[calc(env(safe-area-inset-top,0px)+1rem)] px-5 sm:px-8 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('Step')} {step} {t('of')} {totalSteps} • {step === 1 && t('Welcome to BeeYou')}
                {step === 2 && t('Role & Persona')}
                {step === 3 && t('Identity & Dynamic Profile')}
                {step === 4 && t('Modular Toolkit Customization')}
                {step === 5 && t('BeeYou Plus & Free Trial')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {canDismiss && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  aria-label="Dismiss setup"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* ════════════════ STEP 1: WELCOME TO BEEYOU ════════════════ */}
          {step === 1 && (
            <div className="space-y-6 text-center py-2 sm:py-4 animate-in fade-in">
              <div className="mx-auto w-fit rounded-3xl bg-white px-6 py-4">
                <img src="/logo.png" alt="BeeYou" className="h-20 sm:h-28 w-auto object-contain" draggable={false} />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('Welcome to BeeYou')}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t('BeeYou is an all-in-one supportive space for neurodivergent minds—bringing together visual routines, AAC picture communication, gentle sensory regulation, and flexible tools tailored to you.')}
                </p>
              </div>

              {/* 4 Feature Highlights with NEW Sticker Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-xl mx-auto text-left">
                {/* Visual Routines */}
                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-1">
                    <ScheduleCalendarSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">{t('Visual Routines')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('Step-by-step clarity')}</p>
                  </div>
                </div>

                {/* Mulberry AAC */}
                <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mb-1">
                    <QuickPhrasesSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">{t('Mulberry AAC')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('Picture talker & TTS')}</p>
                  </div>
                </div>

                {/* Sensory Tools */}
                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-1">
                    <FidgetBubblesSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">{t('Sensory Tools')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('Fidgets & pacers')}</p>
                  </div>
                </div>

                {/* Caregiver Link */}
                <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-1">
                    <CaregiverPhoneSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">{t('Caregiver Link')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{t('Easy 2-way pairing')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: ROLE & PERSONA ════════════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('Who will be using BeeYou?')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {t('We adapt colors, language, and sensory tools to match your exact developmental needs.')}
                </p>
              </div>

              {/* Language Selection Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border-2 border-amber-300 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <LanguageGlobeSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {t('Preferred Language / Idioma')}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                      {t('AAC tiles, spoken speech, and interactive tours will be in this language.')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <LanguageDropdown />
                </div>
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
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mb-2">
                      <ChildPersonaSticker className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      {t('Child (Ages 3–11)')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('Warm honey palette, claymorphism cards, friendly bee mascot, playful icons.')}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-3 uppercase tracking-wider">
                    {t('Playful & Gentle')}
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
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center mb-2">
                      <TeenHeadphonesSticker className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      {t('Teen (Ages 12–17)')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('Lo-fi muted aesthetic, minimal shadows, quick sensory resets, zero juvenile illustrations.')}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-3 uppercase tracking-wider">
                    {t('Lo-Fi & Discreet')}
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
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center mb-2">
                      <AdultBriefcaseSticker className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-2">
                      {t('Adult (Ages 18+)')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t('High-efficiency Executive Minimal UI, Spoon Theory energy budget, medication tracker, passport.')}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-3 uppercase tracking-wider">
                    {t('Executive Minimal')}
                  </span>
                </button>
              </div>

              {/* Pairing Mode Selection */}
              <div className="pt-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {t('Device Pairing Mode')}
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
                    <CaregiverPhoneSticker className="w-7 h-7 shrink-0 -mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">{t('Pair with Caregiver Hub')}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {t('Sync routines, live location, and receive silent SOS alerts remotely.')}
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
                    <TabletIpadSticker className="w-7 h-7 shrink-0 -mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">{t('Standalone Mode')}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {t('Self-directed autonomous use directly on this tablet device.')}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 3: IDENTITY & DYNAMIC FIELDS ════════════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedPersona === 'child' ? t('Tell us about your child') : t('What is your identity?')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {selectedPersona === 'child' 
                    ? t('We will customize voice, greeting tags, and communication tiles.')
                    : t('Personalize your greetings, voice tags, and communication passport.')}
                </p>
              </div>

              {/* Persona-Aware Dynamic Name Field */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t(nameLabel)}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t(namePlaceholder)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 4: MODULAR TOOLKIT CUSTOMIZATION ════════════════ */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('Modular Toolkit Customization')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {t('Toggle on only what you need to prevent sensory clutter and cognitive overload.')}
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. AAC Grid */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-start gap-3.5 pr-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
                      <QuickPhrasesSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('AAC Communication Grid')}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('High-contrast speech tiles categorized with the Fitzgerald Key.')}
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
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                      <ScheduleCalendarSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('Visual Schedules & First-Then')}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('Step-by-step visual routines and pie timer transitions.')}
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
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center shrink-0">
                      <SpoonSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('Spoon Theory Energy Budget')}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('1–5 scale daily energy pacing for executive task management.')}
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
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                      <ShieldSosSticker className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t('Sensory Safe Mode & Overload Shield')}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('High-contrast red emergency button with 4 survival tactile tiles.')}
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

          {/* ════════════════ STEP 5: SUBSCRIPTION & 15-DAY FREE TRIAL ════════════════ */}
          {step === 5 && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in">
              <div className="text-center space-y-1.5 sm:space-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto shadow-sm border border-amber-300 dark:border-amber-700">
                  <TrialCrownSticker className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('Start Your 15-Day Free Trial')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                  {t('Unlock full independence tools, authentic voice output, unlimited visual routines, and clinical reports.')}
                </p>
              </div>

              {/* Plan Choice Cards (Monthly / Yearly) - 2 columns on mobile & tablet */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {/* Monthly */}
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setSelectedCycle('monthly');
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition cursor-pointer relative ${
                    selectedCycle === 'monthly'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="absolute -top-2.5 right-1.5 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {t('Monthly')}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5 sm:mb-1">
                      {t('Monthly Plan')}
                    </span>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">$9.99</div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">/{t('month')}</span>
                  </div>
                  <div className="mt-2 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-tight">
                    {t('15 days free trial')}
                  </div>
                </button>

                {/* Yearly */}
                <button
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setSelectedCycle('yearly');
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition cursor-pointer relative ${
                    selectedCycle === 'yearly'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-400/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="absolute -top-2.5 right-1.5 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {t('Save 25%')}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5 sm:mb-1">
                      {t('Yearly Plan')}
                    </span>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">$89.99</div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">~$7.50/{t('month')}</span>
                  </div>
                  <div className="mt-2 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                    {t('15 days free trial')}
                  </div>
                </button>
              </div>

              {/* Side-by-side Plan Comparison: Free vs Premium - 2 columns on both mobile & tablet */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3.5 pt-0.5 sm:pt-1">
                {/* Free Plan Card */}
                <div className="p-2.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 sm:mb-1.5">
                      <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {t('BeeYou Basic')}
                      </h4>
                      <span className="self-start sm:self-auto px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                        {t('Free Forever')}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2 sm:mb-3 leading-snug">
                      {t('Basic starter tools with strict limits:')}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{t('Full AAC board (all words, photos & symbols)')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{t('Default free device speech engine')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{t('1 routine & 1 medication reminder only')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{t('2 basic soundscapes (Rain & Ocean)')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                        <span className="text-slate-400 dark:text-slate-500 line-through">{t('Expressive Neural AI Voices')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                        <span className="text-slate-400 dark:text-slate-500 line-through">{t('Clinical therapist IEP reports')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                        <span className="text-slate-400 dark:text-slate-500 line-through">{t('Caregiver live sync & remote alerts')}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Premium Plan Card (High Value Highlight) */}
                <div className="p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-800/80 border-2 border-amber-400 dark:border-amber-600/80 ring-2 ring-amber-300/40 shadow-sm relative flex flex-col justify-between">
                  <div className="absolute -top-2.5 right-1.5 sm:right-3 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {t('Everything Included')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <h4 className="font-black text-amber-950 dark:text-amber-100 text-xs sm:text-sm">
                        {t('BeeYou Plus (Trial)')}
                      </h4>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-amber-900/80 dark:text-amber-300/80 font-medium mb-2 sm:mb-3 leading-snug">
                      {t('Full freedom, zero limits & clinical superpowers:')}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-slate-800 dark:text-slate-200">
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('All 20+ Expressive Neural AI Voices')}</strong></span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('Unlimited Visual Routines')}</strong> {t('& First-Then')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('All 17 Soundscapes')}</strong> {t('& Custom Theme Studio')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('Therapist IEP PDF')}</strong> {t('progress reports')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('Caregiver Portal')}</strong>: {t('Live sync & silent SOS')}</span>
                      </li>
                      <li className="flex items-start gap-1 sm:gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-3" />
                        <span><strong>{t('Priority Offline Mode')}</strong> &amp; {t('family profiles')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Guarantees / Features included */}
              <div className="p-2.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span>{t('Zero charge today • 15 days 100% free trial')}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 font-bold">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span>{t('Cancel anytime in settings with 1 tap before trial ends')}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-5 sm:px-8 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Back')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
            >
              <span>{step === 1 ? t('Get Started') : t('Continue')}</span>
              <ArrowRight className="w-4 h-4 stroke-3" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleComplete(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold cursor-pointer transition"
              >
                {t('Continue with Free Plan')}
              </button>
              <button
                type="button"
                onClick={() => handleComplete(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition active:scale-95"
              >
                <span>{t('Start 15-Day Free Trial')}</span>
                <ArrowRight className="w-4 h-4 stroke-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showAacLoadingScreen && (
        <AacVoiceLoadingScreen
          isOpen={showAacLoadingScreen}
          onComplete={() => {
            setShowAacLoadingScreen(false);
            finalizeOnboarding(pendingTrialChoice);
          }}
          persona={settings?.voicePersona || 'puck'}
          language={settings?.language || 'en'}
        />
      )}
    </div>
  );
};
