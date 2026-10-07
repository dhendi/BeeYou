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
  BookOpen,
  MessageSquare,
  Smile,
  ShieldCheck,
  Pill,
  FileText,
  Activity,
  Layers,
  Zap,
  Smartphone,
  Volume2,
  Check,
  Headphones,
  Briefcase,
  HeartHandshake
} from 'lucide-react';
import { BeeMascot } from './BeeYouLogo';
import { CaregiverHowItWorksModal } from './CaregiverHowItWorksModal';
import {
  registerSharedFamilyAccount,
  setActiveDeviceView,
  getDeterministicFamilyCode,
} from '../services/authService';

export type OnboardingPersona = 'kid' | 'teen' | 'adult' | 'caregiver';

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
    userRole,
    setUserRole,
    userAgeGroup: currentContextAge,
    enabledFeatures: contextFeatures,
    updateEnabledFeatures,
    setChildView,
    setIsParentMode,
    setShowCaregiverModal,
    setLinkedDeviceCode,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedPersona, setSelectedPersona] = useState<OnboardingPersona>(() => {
    if (childProfile.userRole === 'caregiver_managing' || userRole === 'caregiver') return 'caregiver';
    if (childProfile.ageGroup) return childProfile.ageGroup;
    if (currentContextAge) return currentContextAge;
    return 'kid';
  });

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // User Profile Form State
  const [name, setName] = useState<string>(childProfile.name || (selectedPersona === 'adult' ? 'Alex' : selectedPersona === 'caregiver' ? 'Sarah (Mom)' : 'Leo'));
  const [pronouns, setPronouns] = useState<string>(childProfile.pronouns || 'they/them');

  // Caregiver Registration Form State
  const [caregiverEmail, setCaregiverEmail] = useState<string>('demo@beeyou.app');
  const [caregiverChildName, setCaregiverChildName] = useState<string>('Leo');
  const [caregiverRoleTitle, setCaregiverRoleTitle] = useState<string>('Parent');
  
  // Features state
  const [features, setFeatures] = useState<EnabledFeatures>(() => {
    const base = contextFeatures || getDefaultFeaturesForAge(selectedPersona === 'caregiver' ? 'kid' : selectedPersona);
    return {
      ...base,
      aac: base.aacCommunication !== false && base.aac !== false,
      aacCommunication: base.aacCommunication !== false && base.aac !== false,
      routines: base.firstThenSchedules !== false && base.routines !== false,
      firstThenSchedules: base.firstThenSchedules !== false && base.routines !== false,
      caregiverMessaging: base.emergencyAlertSOS !== false && base.caregiverMessaging !== false,
      emergencyAlertSOS: base.emergencyAlertSOS !== false && base.caregiverMessaging !== false,
      sensoryTools: base.sensoryBreathingPacer !== false && base.sensoryTools !== false,
      sensoryBreathingPacer: base.sensoryBreathingPacer !== false && base.sensoryTools !== false,
      emotions: base.dailyMoodRecollection !== false && base.emotions !== false,
      dailyMoodRecollection: base.dailyMoodRecollection !== false && base.emotions !== false,
    };
  });

  const isCaregiver = selectedPersona === 'caregiver';
  const totalSteps = isCaregiver ? 4 : 5;

  const handlePersonaSelect = (persona: OnboardingPersona) => {
    setSelectedPersona(persona);
    playChime('tap');
    const ageForDefaults: UserAgeGroup = persona === 'caregiver' ? 'kid' : persona;
    const base = getDefaultFeaturesForAge(ageForDefaults);
    setFeatures({
      ...base,
      aac: base.aacCommunication !== false && base.aac !== false,
      aacCommunication: base.aacCommunication !== false && base.aac !== false,
      routines: base.firstThenSchedules !== false && base.routines !== false,
      firstThenSchedules: base.firstThenSchedules !== false && base.routines !== false,
      caregiverMessaging: base.emergencyAlertSOS !== false && base.caregiverMessaging !== false,
      emergencyAlertSOS: base.emergencyAlertSOS !== false && base.caregiverMessaging !== false,
      sensoryTools: base.sensoryBreathingPacer !== false && base.sensoryTools !== false,
      sensoryBreathingPacer: base.sensoryBreathingPacer !== false && base.sensoryTools !== false,
      emotions: base.dailyMoodRecollection !== false && base.emotions !== false,
      dailyMoodRecollection: base.dailyMoodRecollection !== false && base.emotions !== false,
    });
    if (persona === 'adult' && (name === 'Leo' || !name)) {
      setName('Alex');
    } else if (persona === 'caregiver' && (name === 'Leo' || !name)) {
      setName('Caregiver');
    }
    if (persona === 'caregiver' && step > 4) {
      setStep(4);
    }
  };

  const handleToggleFeature = (featureKey: keyof EnabledFeatures) => {
    playChime('tap');
    setFeatures((prev) => {
      const nextVal = !prev[featureKey];
      const updated = {
        ...prev,
        [featureKey]: nextVal,
      };
      if (featureKey === 'aac' || featureKey === 'aacCommunication') {
        updated.aac = nextVal;
        updated.aacCommunication = nextVal;
      }
      if (featureKey === 'routines' || featureKey === 'firstThenSchedules') {
        updated.routines = nextVal;
        updated.firstThenSchedules = nextVal;
      }
      if (featureKey === 'caregiverMessaging' || featureKey === 'emergencyAlertSOS') {
        updated.caregiverMessaging = nextVal;
        updated.emergencyAlertSOS = nextVal;
      }
      if (featureKey === 'sensoryTools' || featureKey === 'sensoryBreathingPacer') {
        updated.sensoryTools = nextVal;
        updated.sensoryBreathingPacer = nextVal;
      }
      if (featureKey === 'emotions' || featureKey === 'dailyMoodRecollection') {
        updated.emotions = nextVal;
        updated.dailyMoodRecollection = nextVal;
      }
      return updated;
    });
  };

  const handleFinishOnboarding = async (actionAfter?: 'morning_routine' | 'home' | 'caregiver_setup') => {
    // Caregiver Registration Flow
    if (selectedPersona === 'caregiver' || actionAfter === 'caregiver_setup') {
      const emailToUse = caregiverEmail.trim().toLowerCase() || 'demo@beeyou.app';
      const cName = name.trim() || 'Sarah (Mom)';
      const chName = caregiverChildName.trim() || 'Leo';
      let familyCode = getDeterministicFamilyCode(emailToUse);

      try {
        const regRes = await registerSharedFamilyAccount({
          email: emailToUse,
          caregiverName: cName,
          caregiverRole: caregiverRoleTitle || 'Parent',
          childName: chName,
          childAgeGroup: 'kid',
          pin: '1234',
        });
        if (regRes.success && regRes.account) {
          familyCode = regRes.account.familyCode;
        }
      } catch (err) {
        console.warn('Caregiver registration API failed, using deterministic code', err);
      }

      setActiveDeviceView('caregiver');
      try {
        localStorage.setItem('beeyou_onboarding_completed', 'true');
        localStorage.setItem('beeyou_user_role', 'caregiver');
        localStorage.setItem('beeyou_active_device_view', 'caregiver');
        sessionStorage.setItem('beeyou_user_role', 'caregiver');
        sessionStorage.setItem('beeyou_active_device_view', 'caregiver');
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/?role=caregiver&code=${encodeURIComponent(familyCode)}`);
          window.dispatchEvent(new CustomEvent('beeyou_role_change', { detail: { role: 'caregiver' } }));
        }
      } catch {}

      updateChildProfile({
        name: chName,
        pronouns: 'they/them',
        ageGroup: 'kid',
        userRole: 'caregiver_managing',
        interests: ['Visual schedules', 'Calm routines'],
        onboardingCompleted: true,
      });

      if (setUserRole) setUserRole('caregiver');
      if (setIsParentMode) setIsParentMode(true);
      if (setLinkedDeviceCode) setLinkedDeviceCode(familyCode);
      setTheme('theme-classic');

      confetti({ particleCount: 80, spread: 75, origin: { y: 0.5 } });
      playChime('complete');
      onClose();
      return;
    }

    // 1. Calculate user role & age group for standard personas
    let calculatedRole: UserAccountRole = 'child_dependent';
    let calculatedAge: UserAgeGroup = 'kid';

    if (selectedPersona === 'adult') {
      calculatedRole = 'independent_adult';
      calculatedAge = 'adult';
    } else if (selectedPersona === 'teen') {
      calculatedRole = 'teen_dependent';
      calculatedAge = 'teen';
    } else {
      calculatedRole = 'child_dependent';
      calculatedAge = 'kid';
    }

    // 2. Save profile
    updateChildProfile({
      name: name.trim() || (selectedPersona === 'adult' ? 'Alex' : 'Leo'),
      pronouns: pronouns.trim(),
      ageGroup: calculatedAge,
      userRole: 'self',
      interests: childProfile.interests || ['Visual schedules', 'Calm routines'],
      onboardingCompleted: true,
    });

    // 3. Update global context
    if (setUserAgeGroup) setUserAgeGroup(calculatedAge);
    if (setUserRole) setUserRole(calculatedRole);
    if (updateEnabledFeatures) updateEnabledFeatures(features);

    // 4. Update settings
    updateSettings({
      onboardingCompleted: true,
      features: features,
    });

    try {
      localStorage.setItem('beeyou_onboarding_completed', 'true');
      localStorage.setItem('beeyou_user_age_group', calculatedAge);
      localStorage.setItem('beeyou_user_role', calculatedRole);
      localStorage.setItem('beeyou_enabled_features', JSON.stringify(features));
    } catch (e) {}

    // 5. Set default Theme
    const defaultThemeId = selectedPersona === 'adult' 
      ? 'theme-executive' 
      : selectedPersona === 'teen' 
      ? 'theme-lofi' 
      : 'theme-classic';
    setTheme(defaultThemeId);

    // 6. Celebration & Routing
    confetti({ particleCount: 80, spread: 75, origin: { y: 0.5 } });
    playChime('complete');

    onClose();

    if (actionAfter === 'morning_routine') {
      if (setChildView) setChildView('my-day');
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
        className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
          
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
                    Step {step} of {totalSteps}
                  </span>
                </div>
                <h2 id="onboarding-title" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                  {step === 1 && 'Your Friendly Visual Companion'}
                  {step === 2 && 'Who will be using BeeYou?'}
                  {step === 3 && `What BeeYou is all about for ${selectedPersona === 'kid' ? 'Kids 🧒' : selectedPersona === 'teen' ? 'Teens 🎧' : selectedPersona === 'adult' ? 'Adults 💼' : 'Caregivers 💛'}`}
                  {step === 4 && (isCaregiver ? 'Personalize Caregiver Space' : 'Features You Can Have')}
                  {step === 5 && 'Personalize Your Space'}
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
            {Array.from({ length: totalSteps }).map((_, i) => (
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
                SCREEN 1: WELCOME
            ══════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-6 text-center py-3 animate-in fade-in">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/50 border-2 border-amber-300 flex items-center justify-center shadow-md">
                  <BeeMascot size="lg" pose="waving" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome to BeeYou
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    BeeYou is an all-in-one supportive space for neurodivergent minds—bringing together visual routines, AAC picture communication, gentle sensory regulation, and flexible tools tailored to you.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold text-xs">
                      🐝 "You can be yourself here."
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 max-w-xl mx-auto text-left">
                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">Visual Routines</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Step-by-step clarity</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-slate-800 border border-sky-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center mb-1">
                      <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">Mulberry AAC</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Picture talker & TTS</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-1">
                      <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">Sensory Tools</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Fidgets & pacers</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-1">
                      <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-1">Caregiver Link</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Easy 2-way pairing</p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      playChime('tap');
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SCREEN 2: WHO WILL BE USING BEEYOU?
            ══════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Who will be using BeeYou?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    Select who this app is for so we can personalize the features, visuals, and tools to fit your exact needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kids */}
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('kid')}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPersona === 'kid'
                        ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      {selectedPersona === 'kid' && (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-base">Kids</h4>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200 px-2 py-0.5 rounded-full">
                          Ages 3–11
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                        Warm colors, friendly bee mascot celebrations, picture routines, and fun collectible sticker rewards.
                      </p>
                    </div>
                  </button>

                  {/* Teens */}
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('teen')}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPersona === 'teen'
                        ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {selectedPersona === 'teen' && (
                        <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-base">Teens</h4>
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 dark:bg-indigo-900/60 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                          Ages 12–17
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                        Lo-fi calm visuals, visual pie countdowns, homework roadmaps, discreet fidgets, and zero baby talk.
                      </p>
                    </div>
                  </button>

                  {/* Adults */}
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('adult')}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPersona === 'adult'
                        ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {selectedPersona === 'adult' && (
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-base">Adults</h4>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                          Ages 18+
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                        Executive workspace, Spoon Theory energy budget, medication schedules, and 1-page health passport.
                      </p>
                    </div>
                  </button>

                  {/* Caregivers & Educators */}
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('caregiver')}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPersona === 'caregiver'
                        ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-md ring-2 ring-rose-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                        <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      {selectedPersona === 'caregiver' && (
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-base">Caregivers & Supporters</h4>
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-200 px-2 py-0.5 rounded-full">
                          Parents / Teachers
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                        Two-way device pairing, receive 1-tap alerts, send reassuring responses, and manage visual schedules.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Flexible Choice:</strong> You can switch personas, change age presets, or toggle individual features at any time in Settings.</span>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SCREEN 3: WHAT BEEYOU IS ALL ABOUT (TAILORED PERSONA)
            ══════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                {/* FOR KIDS */}
                {selectedPersona === 'kid' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                          Kids Experience
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        What BeeYou is all about for Kids
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        BeeYou creates a happy, predictable space that helps children understand their day and celebrate every little win.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">Visual Steps & Stickers</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Step-by-step visual cards (brush teeth, get dressed, eat snack). Completing routines earns sparkling collectible stickers!
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-sky-50/80 dark:bg-slate-800 border border-sky-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <h4 className="font-black text-sm text-sky-950 dark:text-sky-200">Mulberry AAC Picture Talker</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Tap clear picture tiles to speak instantly and build sentences out loud. Consistent motor layout builds fast muscle memory.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-emerald-50/80 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Smile className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-200">Calming Sensory Corner</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Pop bubbles with soothing haptics, squish relaxing ripples, and express emotions using the 5-point thermometer scale.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-rose-50/80 dark:bg-slate-800 border border-rose-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <h4 className="font-black text-sm text-rose-950 dark:text-rose-200">1-Tap Help Alerts</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          One big tap sends an alert to mom, dad, or teacher: "I need help" or "I need a break", without stressful typing.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* FOR TEENS */}
                {selectedPersona === 'teen' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-wider">
                          Teen Experience
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        What BeeYou is all about for Teens
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        Independence, focus, time awareness, and discreet regulation with a lo-fi visual theme and zero baby talk.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-200">Visual Pie Timers & Focus</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Non-pressuring visual countdown disks for homework, study blocks, and morning prep without stressful alarms.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-teal-50/80 dark:bg-slate-800 border border-teal-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                            <Headphones className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <h4 className="font-black text-sm text-teal-950 dark:text-teal-200">Discreet Sensory & Reset</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Tactile haptic bubble pop, smooth marble rolling, and box breathing pacers designed for quiet in-class use.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-purple-50/80 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-black text-sm text-purple-950 dark:text-purple-200">Quick Phrases & Typing AAC</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Fast communication tiles and on-screen keyboard shortcuts when verbal energy or social battery is drained.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">Life Skills & Checklists</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Step-by-step roadmaps for packing gym gear, studying, hygiene, and social situations without overwhelm.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* FOR ADULTS */}
                {selectedPersona === 'adult' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                          Adult Experience
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        What BeeYou is all about for Adults
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        An executive function space built for neurodivergent & autistic adults—managing stamina, health, and sensory wellness.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl bg-emerald-50/80 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-200">Spoon Theory Energy Budget</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Morning stamina check-in and stamina cost tracker to prevent burnout and budget sensory/social energy.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-blue-50/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="font-black text-sm text-blue-950 dark:text-blue-200">Medication & Cycle Tracking</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Scheduled prescription dose logs, refill reminders, and hormonal sensory sensitivity cycle tracking.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">Communication Passport</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          1-page summary of sensory triggers, communication style, and accommodation notes for doctors, dentists, or work.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-purple-50/80 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-black text-sm text-purple-950 dark:text-purple-200">Decision Wheel & Microsteps</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Break through executive dysfunction and choice paralysis with structured options and atomic breakdowns.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* FOR CAREGIVERS */}
                {selectedPersona === 'caregiver' && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                          Caregiver & Educator Portal
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        What BeeYou is all about for Caregivers
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        Effortless remote support, instant reassurance alerts, and visual routine customization.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl bg-rose-50/80 dark:bg-slate-800 border border-rose-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <h4 className="font-black text-sm text-rose-950 dark:text-rose-200">Two-Way Device Pairing</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Connect the dependent's iPad or tablet in seconds with a 6-character code—no email or password needed for the child.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">Real-Time Alerts & Replies</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Receive notifications when they need help and send 1-tap spoken reassurance replies ("I'm here", "On my way").
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-sky-50/80 dark:bg-slate-800 border border-sky-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </div>
                          <h4 className="font-black text-sm text-sky-950 dark:text-sky-200">Visual Schedules & Photos</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Create custom routines, upload personal family/school photos, and record voice guidance for routine steps.
                        </p>
                      </div>

                      <div className="p-4 rounded-3xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-200">Granular Feature Toggles</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                          Turn off unused feature categories so the child's screen remains clean, distraction-free, and calming.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SCREEN 4: FEATURES YOU CAN HAVE (INTERACTIVE TOGGLES)
                (Skipped for caregivers who only use the Caregiver Hub)
            ══════════════════════════════════════════════════════ */}
            {!isCaregiver && step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                      Tailored to You
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Features You Can Have
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    We’ve recommended the best tools for your profile. Tap any switch to enable or disable features anytime.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Visual Routines */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('routines')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      features.routines 
                        ? 'border-amber-400 bg-amber-50/70 dark:bg-slate-800' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Visual Schedules & Routines</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Step-by-step progress, timers, and First/Then boards</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      features.routines ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {features.routines ? '✓' : ''}
                    </div>
                  </button>

                  {/* AAC Communication */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('aac')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      features.aac 
                        ? 'border-sky-400 bg-sky-50/70 dark:bg-slate-800' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mulberry AAC Speech Talker</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Motor-stable symbol grid, sentence strip & offline voice</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      features.aac ? 'bg-sky-500 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {features.aac ? '✓' : ''}
                    </div>
                  </button>

                  {/* Sensory & Fidgets */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('sensoryTools')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      features.sensoryTools 
                        ? 'border-emerald-400 bg-emerald-50/70 dark:bg-slate-800' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Digital Fidget Toys & Regulation</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Bubble pop, sand ripple, marble roll & breathing pacers</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      features.sensoryTools ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {features.sensoryTools ? '✓' : ''}
                    </div>
                  </button>

                  {/* 5-Point Scale & Emotions */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('emotions')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      features.emotions 
                        ? 'border-yellow-400 bg-yellow-50/70 dark:bg-slate-800' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">5-Point Scale & Emotion Log</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Visual regulation thermometer and instant coping actions</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      features.emotions ? 'bg-yellow-500 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {features.emotions ? '✓' : ''}
                    </div>
                  </button>

                  {/* Caregiver Reassurance & Alerts */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeature('caregiverMessaging')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                      features.caregiverMessaging 
                        ? 'border-rose-400 bg-rose-50/70 dark:bg-slate-800' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">1-Tap Caregiver Help Alerts</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Predefined alert triggers and spoken reassurance replies</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      features.caregiverMessaging ? 'bg-rose-500 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {features.caregiverMessaging ? '✓' : ''}
                    </div>
                  </button>

                  {/* Wellness & Spoon Budget (Adults / All) */}
                  {selectedPersona === 'adult' && (
                    <button
                      type="button"
                      onClick={() => handleToggleFeature('spoonBudget')}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                        features.spoonBudget 
                          ? 'border-purple-400 bg-purple-50/70 dark:bg-slate-800' 
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Spoon Theory Energy Budget</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Morning energy check-in and stamina cost tracker</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        features.spoonBudget ? 'bg-purple-500 text-white' : 'bg-slate-300 text-slate-600'
                      }`}>
                        {features.spoonBudget ? '✓' : ''}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                FINAL SCREEN: CAREGIVER REGISTRATION & LINK
                (Step 4 for Caregivers)
            ══════════════════════════════════════════════════════ */}
            {isCaregiver && step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 text-[10px] font-black uppercase tracking-wider">
                      Caregiver Account Setup
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Register Caregiver Space &amp; Link Child
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                    Only 1 shared family email is needed. Both your phone and your child's tablet will link automatically!
                  </p>
                </div>

                {/* 1-Click Demo Pre-fill Banner */}
                <button
                  type="button"
                  onClick={() => {
                    setCaregiverEmail('demo@beeyou.app');
                    setName('Sarah (Mom)');
                    setCaregiverChildName('Leo');
                    playChime('tap');
                  }}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-amber-500/10 to-rose-500/10 border-2 border-indigo-300/80 hover:border-indigo-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 block">
                        Want to test right now? Use Demo Account
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                        Prefills demo@beeyou.app • Code: BEE-DEMO • Leo (Kid)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                    Use Demo <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </button>

                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                        Caregiver Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah (Mom)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                        Shared Family Email *
                      </label>
                      <input
                        type="email"
                        value={caregiverEmail}
                        onChange={(e) => setCaregiverEmail(e.target.value)}
                        placeholder="e.g. smithfamily@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                        Child's Name *
                      </label>
                      <input
                        type="text"
                        value={caregiverChildName}
                        onChange={(e) => setCaregiverChildName(e.target.value)}
                        placeholder="e.g. Leo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                        Caregiver Role
                      </label>
                      <input
                        type="text"
                        value={caregiverRoleTitle}
                        onChange={(e) => setCaregiverRoleTitle(e.target.value)}
                        placeholder="e.g. Mom, Dad, Teacher"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>How connectivity works:</strong> When you complete setup, you will immediately get a popup to connect to your child's device via camera QR scan or sync code (<code>{getDeterministicFamilyCode(caregiverEmail || 'demo@beeyou.app')}</code>).</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                FINAL SCREEN: PERSONALIZE YOUR SPACE
                (Step 5 for kids, teens, adults)
            ══════════════════════════════════════════════════════ */}
            {!isCaregiver && step === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Personalize Your Space
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    Set your preferred display name and pronouns. You can change themes, avatar styles, and sounds anytime.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      {selectedPersona === 'adult' ? 'Your Name:' : "Child or User's Name:"}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={selectedPersona === 'adult' ? 'Alex' : 'Leo'}
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
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">
                    <span>Theme Preset:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300 capitalize">
                      {selectedPersona === 'adult' ? 'Executive Minimal' : selectedPersona === 'teen' ? 'Lo-Fi Chill' : 'Classic Honey'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-950 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>You're ready!</strong> Tap below to launch your tailored BeeYou space.</span>
                </div>
              </div>
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
              <div />
            )}

            <div className="flex items-center gap-2">
              {step < totalSteps && (
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

              {step === totalSteps && (
                <button
                  type="button"
                  onClick={() => handleFinishOnboarding('home')}
                  className={`px-7 py-3 rounded-2xl text-white font-black text-sm shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all ${
                    isCaregiver 
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                      : 'bg-emerald-500 hover:bg-emerald-600 animate-pulse'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCaregiver ? 'Register & Link Device' : 'Start Using BeeYou'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* HOW IT WORKS / GUIDE MODAL */}
      <CaregiverHowItWorksModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialTopic="what_is_beeyou"
      />
    </>
  );
};
