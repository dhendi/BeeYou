import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  AlertTriangle, 
  Calendar, 
  MessageSquare, 
  Compass, 
  CheckCircle2, 
  User, 
  Bot, 
  Settings as SettingsIcon, 
  Volume2, 
  Image as ImageIcon,
  Check,
  Eye,
  Clock,
  Info,
  Mic,
  Sliders,
  Heart,
  Database,
  WifiOff,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Edit3,
  BookOpen,
  Layers,
  BarChart3,
  Palette,
  Pill,
  X,
  HeartPulse,
  Lock,
} from 'lucide-react';
import { MOOD_META, TRIGGER_META, COPING_META } from '../data/defaultData';
import { playChime, getAvailableVoices, rateVoiceNaturalness, isVoiceFluid, speakText, getBestSystemVoice, stopSpeaking as haltSpeaking } from '../utils/audio';
import { 
  AACCategory, 
  LifeAdventure, 
  Routine, 
  RoutineTemplate, 
  UserAgeGroup, 
  EnabledFeatures, 
  getDefaultFeaturesForAge,
  DEFAULT_KID_FEATURES,
  DEFAULT_TEEN_FEATURES,
  DEFAULT_ADULT_FEATURES,
  MedicationReminder,
  MedicationFrequency,
} from '../types';
import { CaregiverLivePortal } from './CaregiverLivePortal';
import { PWAInstallButton } from './PWAInstallButton';
import { RoutineTemplatesLibrary } from './RoutineTemplatesLibrary';
import { RoutineCustomizerModal } from './RoutineCustomizerModal';
import { DailyRecollectionChart } from './DailyRecollectionChart';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import { verifyOfflineIntegrity, indexOfflineData } from '../utils/offlineStorage';

import { getPairingCode } from '../services/caregiverSync';

export const ParentDashboard: React.FC = () => {
  const {
    setIsParentMode,
    childProfile,
    updateChildProfile,
    plansChanged,
    activatePlansChanged,
    dismissPlansChanged,
    setShowPlansChangedModal,
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    aacItems,
    addAacItem,
    deleteAacItem,
    quickPhrases,
    addQuickPhrase,
    deleteQuickPhrase,
    adventures,
    addAdventure,
    skills,
    addSkill,
    socialStories,
    addSocialStory,
    habits,
    settings,
    updateSettings,
    speak,
    offlineVoices,
    resetToDefaults,
    userAgeGroup,
    setUserAgeGroup,
    enabledFeatures,
    updateEnabledFeatures,
    toggleFeature,
    reopenOnboarding,
    setShowAboutMeModal,
    medications,
    medicationLogs,
    addMedication,
    updateMedication,
    deleteMedication,
    restockMedication,
    moodJournalEntries,
    deleteMoodJournalEntry,
    setShowMoodJournalModal,
    cycleSettings,
    updateCycleSettings,
    cycleLogs,
    deleteCycleLog,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
  } = useApp();

  const cyclePhaseInfo = getCyclePhaseInfo();

  type TabType = 
    | 'caregiver'
    | 'medications'
    | 'mood-journal'
    | 'cycle-tracker'
    | 'recollection'
    | 'offline'
    | 'plans-changed'
    | 'routines'
    | 'aac'
    | 'voice'
    | 'adventures'
    | 'skills'
    | 'profile'
    | 'themes'
    | 'ai'
    | 'settings';

  const [activeTab, setActiveTab] = useState<TabType>('routines');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- VOICE TESTING TOOL STATE ---
  const [voiceTestText, setVoiceTestText] = useState('I want pizza please.');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [voiceLangFilter, setVoiceLangFilter] = useState<'all' | 'current'>('current');
  const [onlyFluidVoices, setOnlyFluidVoices] = useState(false);
  const [auditioningVoiceURI, setAuditioningVoiceURI] = useState<string | null>(null);

  // --- OFFLINE & CAREGIVER STATE ---
  const [offlineDiagnostics, setOfflineDiagnostics] = useState<any>(null);
  const [reindexingOffline, setReindexingOffline] = useState(false);

  const runOfflineDiagnostics = async () => {
    const res = await verifyOfflineIntegrity();
    setOfflineDiagnostics(res);
  };

  const handleManualReindex = async () => {
    setReindexingOffline(true);
    playChime('tap');
    try {
      await indexOfflineData({
        aacItems,
        routines,
        socialStories,
        skills,
        habits,
        childName: childProfile.name,
      });
      await runOfflineDiagnostics();
      showNotification('All AAC tiles, schedules & stories successfully re-indexed into offline database!');
    } catch (e) {
      console.error(e);
    } finally {
      setReindexingOffline(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    playChime('star');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // --- 1. PLANS CHANGED STATE FOR EDITING ---
  const [pcActive, setPcActive] = useState(plansChanged.active);
  const [pcOriginal, setPcOriginal] = useState(plansChanged.originalPlanTitle);
  const [pcReason, setPcReason] = useState(plansChanged.reason);
  const [pcNewTitle, setPcNewTitle] = useState(plansChanged.newPlanTitle);
  const [pcCalming, setPcCalming] = useState(plansChanged.calmingMessage);
  const [pcSteps, setPcSteps] = useState(plansChanged.newSteps);
  const [pcPhrases, setPcPhrases] = useState(plansChanged.relevantPhrases);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepEmoji, setNewStepEmoji] = useState('⭐');
  const [newStepTime, setNewStepTime] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');

  const handleSavePlansChanged = () => {
    activatePlansChanged({
      active: pcActive,
      originalPlanTitle: pcOriginal,
      reason: pcReason,
      newPlanTitle: pcNewTitle,
      calmingMessage: pcCalming,
      newSteps: pcSteps,
      relevantPhrases: pcPhrases,
    });
    showNotification('Plans Changed configuration updated successfully!');
  };

  const handleApplyPreset = (preset: 'dentist' | 'rain' | 'school') => {
    if (preset === 'dentist') {
      setPcOriginal('Dentist Appointment at 2:00 PM');
      setPcReason('The dental clinic is closed today because the doctor is sick.');
      setPcNewTitle('Picnic Lunch & Park Swings');
      setPcCalming('It is completely normal to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.');
      setPcSteps([
        { title: 'Favorite pizza or mac & cheese at home', emoji: '🍕', time: '12:30 PM' },
        { title: 'Play on the swings at the sunny park', emoji: '🛝', time: '1:30 PM' },
        { title: 'Drawing and cozy world building', emoji: '🎨', time: '3:00 PM' },
      ]);
      setPcPhrases([
        'Why did it change?',
        "I'm upset about this.",
        "I don't like this change.",
        'What happens now?',
        'Can we go home?',
        'Tell me what happened.',
        'I need a quiet break.',
      ]);
    } else if (preset === 'rain') {
      setPcOriginal('Trip to the Outdoor Zoo');
      setPcReason('Heavy rain and thunder outside made it unsafe to walk in the zoo.');
      setPcNewTitle('Indoor Blanket Fort & Movie Afternoon');
      setPcCalming('Rainy days can be frustrating when we wanted to go outside. We will build a super cozy indoor fort and have warm cocoa!');
      setPcSteps([
        { title: 'Build living room blanket fort with pillows', emoji: '⛺', time: '11:00 AM' },
        { title: 'Warm cocoa and crackers snack', emoji: '☕', time: '12:00 PM' },
        { title: 'Watch favorite animal movie inside the fort', emoji: '🎬', time: '1:00 PM' },
      ]);
      setPcPhrases([
        'I wanted to see the animals.',
        'Is the rain loud?',
        'Can we go another day?',
        'I want to build the fort now.',
      ]);
    } else if (preset === 'school') {
      setPcOriginal('Full School Day until 3:00 PM');
      setPcReason('School had an unexpected early dismissal today.');
      setPcNewTitle('Early Afternoon at Home');
      setPcCalming('School finished early today. Mom/Dad picked you up and we have extra cozy time at home.');
      setPcSteps([
        { title: 'Ride car home and unpack backpack', emoji: '🚗', time: '12:30 PM' },
        { title: 'Quiet sensory break with favorite toy', emoji: '🛋️', time: '1:00 PM' },
        { title: 'Free tablet and train play', emoji: '🚂', time: '2:00 PM' },
      ]);
      setPcPhrases([
        'Why did school finish early?',
        'Where is my teacher?',
        'Are my friends okay?',
        'I am glad to be home.',
      ]);
    }
    setPcActive(true);
    showNotification('Preset applied! Remember to click "Save & Activate".');
  };

  // --- 2. AAC WORD BUILDER STATE (Journey 2: Chicken Nuggets) ---
  const [newWordLabel, setNewWordLabel] = useState('');
  const [newWordSpeech, setNewWordSpeech] = useState('');
  const [newWordCategory, setNewWordCategory] = useState<AACCategory>('food');
  const [newWordEmoji, setNewWordEmoji] = useState('🍗');
  const [newWordPhotoUrl, setNewWordPhotoUrl] = useState('');
  const [newWordColorType, setNewWordColorType] = useState<any>('noun');

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordLabel.trim()) return;

    addAacItem({
      label: newWordLabel.trim(),
      speechText: newWordSpeech.trim() || newWordLabel.trim(),
      category: newWordCategory,
      emoji: newWordEmoji || '✨',
      photoUrl: newWordPhotoUrl.trim() || undefined,
      colorType: newWordColorType,
    });

    showNotification(`"${newWordLabel}" added to ${newWordCategory} vocabulary!`);
    setNewWordLabel('');
    setNewWordSpeech('');
    setNewWordPhotoUrl('');
  };

  // Preset quick addition for Journey 2
  const handleQuickAddChickenNuggets = () => {
    addAacItem({
      label: 'Chicken Nuggets',
      speechText: 'Chicken nuggets',
      category: 'food',
      emoji: '🍗',
      colorType: 'noun',
    });
    showNotification('"Chicken Nuggets" added to Food vocabulary!');
  };

  // --- 3. NEW ROUTINE STATE ---
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineCategory, setNewRoutineCategory] = useState<any>('morning');
  const [newRoutineEmoji, setNewRoutineEmoji] = useState('🌅');
  const [newRoutineTime, setNewRoutineTime] = useState('8:00 AM');
  const [newFirstTask, setNewFirstTask] = useState('Brush teeth');
  const [newThenTask, setNewThenTask] = useState('Tablet time');

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim()) return;

    addRoutine({
      title: newRoutineTitle.trim(),
      category: newRoutineCategory,
      emoji: newRoutineEmoji,
      time: newRoutineTime,
      firstThen: {
        first: newFirstTask,
        firstEmoji: '🪥',
        then: newThenTask,
        thenEmoji: '📱',
        completedFirst: false,
        completedThen: false,
      },
      steps: [
        { id: `st-${Date.now()}-1`, title: 'Get ready', instruction: 'Start calmly', durationMin: 5, completed: false, emoji: '✨' },
        { id: `st-${Date.now()}-2`, title: newFirstTask, instruction: 'Complete first task', durationMin: 5, completed: false, emoji: '🪥' },
        { id: `st-${Date.now()}-3`, title: 'Check in with caregiver', instruction: 'Show completed work', durationMin: 2, completed: false, emoji: '👍' },
        { id: `st-${Date.now()}-4`, title: newThenTask, instruction: 'Enjoy reward activity', durationMin: 15, completed: false, emoji: '📱' },
      ],
    });

    showNotification(`Routine "${newRoutineTitle}" created with First/Then!`);
    setNewRoutineTitle('');
  };

  // --- ROUTINE TEMPLATES & CUSTOMIZER MODAL STATE ---
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [customizingRoutine, setCustomizingRoutine] = useState<Partial<Routine> | null>(null);
  const [routinesSubView, setRoutinesSubView] = useState<'library' | 'active' | 'create'>('library');

  const handleQuickImportTemplate = (template: RoutineTemplate) => {
    addRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
      firstThen: template.firstThen ? {
        first: template.firstThen.first,
        firstEmoji: template.firstThen.firstEmoji,
        then: template.firstThen.then,
        thenEmoji: template.firstThen.thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: template.steps.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st.title,
        instruction: st.instruction,
        durationMin: st.durationMin,
        completed: false,
        emoji: st.emoji,
        sensoryNote: st.sensoryNote,
        communicationShortcutPhrases: st.communicationShortcutPhrases,
      })),
    });
    showNotification(`Imported "${template.title}" template into active routines!`);
  };

  const handleCustomizeTemplate = (template: RoutineTemplate) => {
    setCustomizingRoutine({
      title: template.title,
      category: template.category,
      emoji: template.emoji,
      time: template.time,
      firstThen: template.firstThen ? {
        first: template.firstThen.first,
        firstEmoji: template.firstThen.firstEmoji,
        then: template.firstThen.then,
        thenEmoji: template.firstThen.thenEmoji,
        completedFirst: false,
        completedThen: false,
      } : undefined,
      steps: template.steps.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st.title,
        instruction: st.instruction,
        durationMin: st.durationMin,
        completed: false,
        emoji: st.emoji,
        sensoryNote: st.sensoryNote,
        communicationShortcutPhrases: st.communicationShortcutPhrases,
      })),
    });
    setCustomizerModalOpen(true);
  };

  const handleEditActiveRoutine = (routine: Routine) => {
    setCustomizingRoutine(routine);
    setCustomizerModalOpen(true);
  };

  const handleDuplicateRoutine = (routine: Routine) => {
    addRoutine({
      title: `${routine.title} (Copy)`,
      category: routine.category,
      emoji: routine.emoji,
      time: routine.time,
      firstThen: routine.firstThen ? { ...routine.firstThen, completedFirst: false, completedThen: false } : undefined,
      steps: routine.steps.map((s, idx) => ({ ...s, id: `dup-${Date.now()}-${idx}`, completed: false })),
    });
    showNotification(`Duplicated "${routine.title}"!`);
  };

  const handleSaveCustomizedRoutine = (routineData: Omit<Routine, 'id'>, existingId?: string) => {
    if (existingId) {
      updateRoutine({
        id: existingId,
        ...routineData,
      });
      showNotification(`Routine "${routineData.title}" updated successfully!`);
    } else {
      addRoutine(routineData);
      showNotification(`Routine "${routineData.title}" saved to schedule!`);
    }
  };

  // --- 4. AI ASSISTANT GENERATION WITH GEMINI ---
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<'adventure' | 'routine' | 'social-story'>('adventure');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiDraft(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: aiType,
          prompt: aiPrompt,
          childContext: {
            name: childProfile.name,
            interests: childProfile.interests,
            dislikes: childProfile.dislikes,
            sensoryNotes: childProfile.sensoryNotes,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setAiDraft(data.result);
      playChime('complete');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Could not connect to AI service. Ensure GEMINI_API_KEY is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApproveDraft = () => {
    if (!aiDraft) return;

    if (aiType === 'adventure') {
      addAdventure({
        title: aiDraft.title || 'New Adventure',
        category: aiDraft.category || 'Preparation',
        emoji: aiDraft.icon || '🚀',
        summary: aiDraft.summary || 'A preparation guide created by caregiver & AI.',
        steps: (aiDraft.steps || []).map((s: any, idx: number) => ({
          order: idx + 1,
          title: s.title || `Step ${idx + 1}`,
          description: s.description || '',
          emoji: s.icon || '✨',
        })),
        sensoryPreview: aiDraft.sensoryPreview || {},
        thingsICanSay: aiDraft.thingsICanSay || ['I need a break.', 'Stop please.'],
        thingsICanAskFor: aiDraft.thingsICanAskFor || ['Can I hold my comfort toy?'],
        whatHappensAfter: aiDraft.whatHappensAfter || 'We head home and relax.',
      });
      showNotification('AI Adventure approved and added to Child Adventures!');
    } else if (aiType === 'routine') {
      addRoutine({
        title: aiDraft.title || 'New Routine',
        category: aiDraft.category || 'custom',
        emoji: aiDraft.icon || '📅',
        steps: (aiDraft.steps || []).map((s: any, idx: number) => ({
          id: `step-${Date.now()}-${idx}`,
          title: s.title,
          instruction: s.instruction,
          durationMin: s.durationMin || 5,
          completed: false,
          emoji: s.icon || '⭐',
        })),
        firstThen: aiDraft.firstThen ? {
          first: aiDraft.firstThen.first,
          firstEmoji: '🪥',
          then: aiDraft.firstThen.then,
          thenEmoji: '📱',
          completedFirst: false,
          completedThen: false,
        } : undefined,
      });
      showNotification('AI Routine approved and added to Visual Schedules!');
    } else if (aiType === 'social-story') {
      addSocialStory({
        title: aiDraft.title || 'New Story',
        emoji: aiDraft.icon || '📖',
        pages: (aiDraft.pages || []).map((p: any, idx: number) => ({
          pageNumber: idx + 1,
          text: p.text,
          emoji: p.icon || '🌈',
        })),
        keyTakeaways: aiDraft.keyTakeaways || [],
        suggestedPhrases: aiDraft.suggestedPhrases || [],
      });
      showNotification('AI Social Story approved and added to Stories!');
    }

    setAiDraft(null);
    setAiPrompt('');
  };

  // --- MEDICATIONS MANAGEMENT STATE ---
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medTotalQuantity, setMedTotalQuantity] = useState<number>(30);
  const [medDosage, setMedDosage] = useState<number>(1);
  const [medUnit, setMedUnit] = useState('pill');
  const [medFrequency, setMedFrequency] = useState<MedicationFrequency>('daily');
  const [medTimes, setMedTimes] = useState<string[]>(['08:00']);
  const [medInstructions, setMedInstructions] = useState('');
  const [medEmoji, setMedEmoji] = useState('💊');
  const [medRefillThreshold, setMedRefillThreshold] = useState<number>(5);
  const [medActive, setMedActive] = useState<boolean>(true);

  // Quick Restock dialog state in dashboard
  const [quickRestockId, setQuickRestockId] = useState<string | null>(null);
  const [quickRestockAmount, setQuickRestockAmount] = useState<number>(30);

  const handleOpenAddMed = () => {
    setEditingMedId(null);
    setMedName('');
    setMedTotalQuantity(30);
    setMedDosage(1);
    setMedUnit('pill');
    setMedFrequency('daily');
    setMedTimes(['08:00']);
    setMedInstructions('');
    setMedEmoji('💊');
    setMedRefillThreshold(5);
    setMedActive(true);
    setShowMedForm(true);
  };

  const handleOpenEditMed = (m: MedicationReminder) => {
    setEditingMedId(m.id);
    setMedName(m.name);
    setMedTotalQuantity(m.totalQuantity);
    setMedDosage(m.dosage);
    setMedUnit(m.unit || 'pill');
    setMedFrequency(m.frequency);
    setMedTimes(m.times.length > 0 ? [...m.times] : ['08:00']);
    setMedInstructions(m.instructions || '');
    setMedEmoji(m.emoji || '💊');
    setMedRefillThreshold(m.refillThreshold || 5);
    setMedActive(m.active);
    setShowMedForm(true);
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    if (editingMedId) {
      updateMedication(editingMedId, {
        name: medName.trim(),
        totalQuantity: Math.max(0, Number(medTotalQuantity)),
        dosage: Math.max(0.1, Number(medDosage)),
        unit: medUnit,
        frequency: medFrequency,
        times: medTimes,
        instructions: medInstructions.trim() || undefined,
        emoji: medEmoji,
        refillThreshold: Math.max(1, Number(medRefillThreshold)),
        active: medActive,
      });
      showNotification(`"${medName}" updated successfully!`);
    } else {
      addMedication({
        name: medName.trim(),
        totalQuantity: Math.max(0, Number(medTotalQuantity)),
        dosage: Math.max(0.1, Number(medDosage)),
        unit: medUnit,
        frequency: medFrequency,
        times: medTimes,
        instructions: medInstructions.trim() || undefined,
        emoji: medEmoji,
        refillThreshold: Math.max(1, Number(medRefillThreshold)),
        active: medActive,
      });
      showNotification(`"${medName}" added to medications!`);
    }
    setShowMedForm(false);
    setEditingMedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Caregiver Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsParentMode(false);
              playChime('tap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Child App</span>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <span>Parent & Caregiver Hub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Lumina Support
              </span>
            </h1>
            <p className="text-xs text-slate-400">Child: {childProfile.name} • Private & Secure</p>
          </div>
        </div>

        {/* Quick Plans Changed Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPcActive(!pcActive);
              activatePlansChanged({ active: !pcActive });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              plansChanged.active
                ? 'bg-amber-400 text-amber-950 animate-pulse ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Plans Changed: {plansChanged.active ? 'ACTIVE' : 'Off'}</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Layout: Sidebar Tabs + Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row p-3 sm:p-6 gap-5">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-3xl p-3 border-2 border-slate-200 shadow-xs flex md:flex-col gap-1 overflow-x-auto shrink-0">
          {[
            { id: 'routines', label: 'Routine Templates Library', emoji: '✨', icon: Calendar, badge: 'Library' },
            { 
              id: 'medications', 
              label: 'Medication Reminders', 
              emoji: '💊', 
              icon: Pill, 
              badge: medications.some((m) => m.totalQuantity <= m.refillThreshold) ? 'Low Stock' : `${medications.length} Meds` 
            },
            { id: 'recollection', label: 'Daily Mood & Therapist Summary', emoji: '📊', icon: BarChart3, badge: 'Therapy' },
            { 
              id: 'mood-journal', 
              label: 'Mood & Reflection Journal', 
              emoji: '📖', 
              icon: BookOpen, 
              badge: `${moodJournalEntries.length} Entries` 
            },
            { 
              id: 'cycle-tracker', 
              label: 'Cycle & Hormonal Rhythm', 
              emoji: '🌸', 
              icon: HeartPulse, 
              badge: `Day ${cyclePhaseInfo.currentCycleDay}` 
            },
            { id: 'caregiver', label: 'Live Caregiver Link', emoji: '❤️', icon: Heart, badge: 'Live' },
            { id: 'plans-changed', label: 'Plans Changed', emoji: '🔄', icon: AlertTriangle, badge: plansChanged.active ? 'Active' : undefined },
            { id: 'aac', label: 'AAC & Vocabulary', emoji: '🗣️', icon: MessageSquare },
            { id: 'voice', label: 'Voice Testing Tool', emoji: '🎙️', icon: Volume2 },
            { id: 'offline', label: 'Offline & PWA Storage', emoji: '💾', icon: Database },
            { id: 'adventures', label: 'Life Adventures', emoji: '🚀', icon: Compass },
            { id: 'skills', label: 'Life Skills', emoji: '⭐', icon: CheckCircle2 },
            { id: 'profile', label: 'Child Profile', emoji: '👤', icon: User },
            { id: 'themes', label: 'Themes & Studio', emoji: '🎨', icon: Palette, badge: 'Studio' },
            { id: 'ai', label: 'AI Helper (Gemini)', emoji: '🤖', icon: Bot },
            { id: 'settings', label: 'Settings & PIN', emoji: '⚙️', icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playChime('tap');
              }}
              className={`flex items-center justify-between p-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  tab.id === 'routines' ? 'bg-sky-400 text-sky-950' : 'bg-amber-400 text-amber-950'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-xs overflow-y-auto">
          {/* Quick Access to Routine Templates Library if on another tab */}
          {activeTab !== 'routines' && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-2 border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs text-xl">
                  ✨
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Pre-Built Routine Templates Library</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 text-[10px] font-black uppercase tracking-wide">
                      Morning • School Day • Bedtime
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Quickly import clinically designed, sensory-friendly routines and customize First/Then rewards for {childProfile.name}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('routines');
                  setRoutinesSubView('library');
                  playChime('tap');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <span>Browse Templates</span>
                <span>→</span>
              </button>
            </div>
          )}
          {/* TAB: MEDICATION REMINDERS & SUPPLY MANAGEMENT */}
          {activeTab === 'medications' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">💊</span>
                    <span>Medication Reminders & Supply Hub</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure medications, scheduled dose times, dosages, and keep track of remaining pill supply for {childProfile.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddMed}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Medication</span>
                </button>
              </div>

              {/* Add / Edit Medication Form */}
              {showMedForm && (
                <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/70 border-2 border-indigo-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3">
                    <h3 className="font-black text-sm sm:text-base text-indigo-950 flex items-center gap-2">
                      <span className="text-xl">{medEmoji}</span>
                      <span>{editingMedId ? 'Edit Medication Reminder' : 'Add New Medication Reminder'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowMedForm(false)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveMedication} className="space-y-4">
                    {/* 1. Medication Name & Emoji */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          1. Medication Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="e.g. Morning Multivitamin Gummy, Asthma Inhaler"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          Icon / Emoji
                        </label>
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          {['💊', '🍬', '🫁', '💧', '🧴', '🩹'].map((em) => (
                            <button
                              type="button"
                              key={em}
                              onClick={() => setMedEmoji(em)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                                medEmoji === em
                                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                                  : 'bg-white hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. How many they have (Stock inventory) & Low Threshold */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          2. How Many They Have (Total Quantity in Stock) *
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            required
                            value={medTotalQuantity}
                            onChange={(e) => setMedTotalQuantity(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-500 shrink-0">
                            {medUnit || 'units'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Decrements automatically each time a dose is taken.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          Low Supply Alert Threshold
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={medRefillThreshold}
                            onChange={(e) => setMedRefillThreshold(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-slate-500 shrink-0">
                            alert when remaining count is low
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Alerts caregiver when supply falls to or below this count.
                        </span>
                      </div>
                    </div>

                    {/* 3. How often they should take it (Frequency) */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        3. How Often Should They Take It (Frequency) *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'daily', label: 'Once a Day', defaultTimes: ['08:00'] },
                          { id: 'twice_daily', label: 'Twice a Day', defaultTimes: ['08:00', '20:00'] },
                          { id: 'three_daily', label: '3 Times a Day', defaultTimes: ['08:00', '13:00', '19:00'] },
                          { id: 'as_needed', label: 'As Needed (PRN)', defaultTimes: [] },
                        ].map((freq) => (
                          <button
                            type="button"
                            key={freq.id}
                            onClick={() => {
                              setMedFrequency(freq.id as MedicationFrequency);
                              if (freq.defaultTimes.length > 0) {
                                setMedTimes(freq.defaultTimes);
                              }
                            }}
                            className={`p-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
                              medFrequency === freq.id
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. What time they should take them (Times) */}
                    {medFrequency !== 'as_needed' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-black text-slate-700">
                            4. What Time Should They Take Them (Dose Times) *
                          </label>
                          <button
                            type="button"
                            onClick={() => setMedTimes([...medTimes, '12:00'])}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Time Slot</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {medTimes.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="time"
                                value={t}
                                onChange={(e) => {
                                  const updated = [...medTimes];
                                  updated[idx] = e.target.value;
                                  setMedTimes(updated);
                                }}
                                className="font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                              />
                              {medTimes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMedTimes(medTimes.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                  title="Remove time"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. How many they should take (Dosage & Unit) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          5. How Many Should They Take (Dosage Amount) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          max="100"
                          required
                          value={medDosage}
                          onChange={(e) => setMedDosage(Number(e.target.value))}
                          placeholder="e.g. 1, 2"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">
                          Unit Form
                        </label>
                        <select
                          value={medUnit}
                          onChange={(e) => setMedUnit(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pill">pill(s)</option>
                          <option value="tablet">tablet(s)</option>
                          <option value="gummy">gummy / chewable(s)</option>
                          <option value="puffs">puff(s) / spray</option>
                          <option value="dropper">dropper / drops</option>
                          <option value="spoonful">spoonful / ml</option>
                          <option value="patch">patch</option>
                        </select>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Special Instructions & Guidance (Optional)
                      </label>
                      <input
                        type="text"
                        value={medInstructions}
                        onChange={(e) => setMedInstructions(e.target.value)}
                        placeholder="e.g. Take with breakfast and a glass of water; Shake well before use"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-medium text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMedForm(false);
                          setEditingMedId(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingMedId ? 'Update Medication' : 'Save Medication'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Medication Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Configured Medications ({medications.length})
                  </h3>
                </div>

                {medications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                    <p className="font-semibold text-sm">No medications configured yet.</p>
                    <p className="text-xs mt-1">Click "Add New Medication" above to set up reminders and stock tracking.</p>
                  </div>
                ) : (
                  medications.map((med) => {
                    const isLow = med.totalQuantity <= med.refillThreshold;
                    return (
                      <div
                        key={med.id}
                        className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isLow
                            ? 'bg-amber-50/70 border-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* Left: Info */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                            {med.emoji || '💊'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-base text-slate-900 leading-tight">
                                {med.name}
                              </h4>
                              {isLow && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Low Supply!</span>
                                </span>
                              )}
                              {!med.active && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                                  Paused
                                </span>
                              )}
                            </div>

                            {/* Details Row: Dosage, Frequency, Times */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                              <span className="font-bold text-indigo-700">
                                Dose: {med.dosage} {med.unit}
                              </span>
                              <span>•</span>
                              <span className="font-medium capitalize">
                                Frequency: {med.frequency.replace('_', ' ')}
                              </span>
                              {med.times.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-bold text-slate-700">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{med.times.map((t) => {
                                      const [h, m] = t.split(':').map(Number);
                                      if (isNaN(h)) return t;
                                      return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                                    }).join(', ')}</span>
                                  </span>
                                </>
                              )}
                            </div>

                            {med.instructions && (
                              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                                {med.instructions}
                              </p>
                            )}

                            {/* Stock Inventory Tracker */}
                            <div className="flex items-center gap-3 mt-2.5">
                              <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isLow ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.max(5, (med.totalQuantity / (med.refillThreshold * 4)) * 100))}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-black text-slate-800">
                                {med.totalQuantity} {med.unit} remaining
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                          {/* Restock Buttons */}
                          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                restockMedication(med.id, 10);
                                showNotification(`Added +10 to ${med.name} supply!`);
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:shadow-2xs cursor-pointer transition-all"
                              title="Add 10"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                restockMedication(med.id, 30);
                                showNotification(`Added +30 (1 month) to ${med.name} supply!`);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-all"
                              title="Add 30 (1 month supply)"
                            >
                              +30
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuickRestockId(med.id);
                                setQuickRestockAmount(30);
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-white cursor-pointer transition-all"
                              title="Custom Refill Amount"
                            >
                              Refill
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditMed(med)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-all"
                            title="Edit Medication"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete reminder for "${med.name}"?`)) {
                                deleteMedication(med.id);
                                showNotification(`"${med.name}" removed.`);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer transition-all"
                            title="Delete Medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Restock Dialog if open */}
              {quickRestockId && (
                <div className="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-2xl animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-xs font-black text-indigo-900 shrink-0">
                      Add supply to {medications.find((m) => m.id === quickRestockId)?.name}:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={quickRestockAmount}
                      onChange={(e) => setQuickRestockAmount(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-xl border border-indigo-300 font-black text-center text-sm bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (quickRestockId && quickRestockAmount > 0) {
                            restockMedication(quickRestockId, quickRestockAmount);
                            const med = medications.find((m) => m.id === quickRestockId);
                            showNotification(`Added +${quickRestockAmount} ${med?.unit || 'units'} to supply!`);
                            setQuickRestockId(null);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        Add to Supply
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickRestockId(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Medication Adherence History Log */}
              <div className="mt-8 border-t border-slate-200 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Dose History & Adherence Record
                    </h3>
                    <p className="text-xs text-slate-500">
                      Exportable logs for pediatrician checkups, occupational therapy, and routine review.
                    </p>
                  </div>
                </div>

                {medicationLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                    No dose logs recorded yet. Once doses are taken, they will appear here.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Medication</th>
                            <th className="py-2.5 px-4">Dosage Taken</th>
                            <th className="py-2.5 px-4">Scheduled Time</th>
                            <th className="py-2.5 px-4">Date & Time</th>
                            <th className="py-2.5 px-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {medicationLogs.slice(0, 30).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <span>{log.medicationName}</span>
                              </td>
                              <td className="py-2.5 px-4">
                                {log.doseQuantity} {log.doseUnit || 'dose'}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                                {log.doseTime}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">
                                {new Date(log.timestamp).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500">
                                {log.notes || 'Taken'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DAILY MOOD & THERAPIST RECOLLECTION SUMMARY */}
          {activeTab === 'recollection' && (
            <div className="space-y-6">
              <DailyRecollectionChart isParentPortal={true} />
            </div>
          )}

          {/* TAB: MOOD JOURNAL & SELF-REFLECTION (TEENS TO ADULTS) */}
          {activeTab === 'mood-journal' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    <span>Mood Journal & Self-Reflection Hub</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Designed for teens and adults. Tracks emotional intensity, energy levels, sensory distress, triggers, and neurodivergent coping strategies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoodJournalModal(true);
                    playChime('tap');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Mood Journal Studio</span>
                </button>
              </div>

              {/* Feature Active / Inactive Banner */}
              {enabledFeatures?.moodJournal === false && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-amber-900">
                        Mood Journal is currently turned off for this profile.
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Enable it in Feature Controls to display in the user's header and feelings tab.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleFeature('moodJournal');
                      playChime('star');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Enable Feature
                  </button>
                </div>
              )}

              {/* Statistics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-purple-700 block">Total Reflections</span>
                  <span className="text-2xl font-black text-purple-950 mt-1 block">{moodJournalEntries.length}</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Private Entries</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {moodJournalEntries.filter((e) => e.isPrivate).length}
                  </span>
                </div>
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-sky-700 block">Average Energy</span>
                  <span className="text-2xl font-black text-sky-950 mt-1 block">
                    {moodJournalEntries.length > 0
                      ? (moodJournalEntries.reduce((acc, e) => acc + e.energyLevel, 0) / moodJournalEntries.length).toFixed(1)
                      : '-'}
                    /10
                  </span>
                </div>
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-rose-700 block">Avg Sensory Load</span>
                  <span className="text-2xl font-black text-rose-950 mt-1 block">
                    {moodJournalEntries.length > 0
                      ? (moodJournalEntries.reduce((acc, e) => acc + e.sensoryDistress, 0) / moodJournalEntries.length).toFixed(1)
                      : '-'}
                    /10
                  </span>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Logged Reflections History
                </h3>

                {moodJournalEntries.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2">
                    <span className="text-3xl block">📖</span>
                    <p className="text-xs font-bold text-slate-600">No reflections logged yet</p>
                    <p className="text-[11px] text-slate-400">
                      When the user reflects on their emotions and sensory experiences, entries will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {moodJournalEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-purple-200 transition-colors shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1.5 rounded-xl bg-purple-50">
                              {MOOD_META[entry.primaryMood]?.emoji || '💭'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-sm">
                                  {MOOD_META[entry.primaryMood]?.label || entry.primaryMood}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                  Intensity: {entry.moodIntensity}/10
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                                  Energy: {entry.energyLevel}/5
                                </span>
                                {entry.sensoryDistress > 50 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                    Sensory: {entry.sensoryDistress}%
                                  </span>
                                )}
                                {entry.isPrivate && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5">
                                    <Lock className="w-3 h-3" /> Private
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                deleteMoodJournalEntry(entry.id);
                                playChime('tap');
                              }}
                              className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-2 rounded-xl cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {(entry.journalText || entry.gratitudeOrWin) && (
                          <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700">
                            {entry.gratitudeOrWin && (
                              <p className="font-bold text-purple-900 text-[11px] mb-0.5">
                                Anchor: "{entry.gratitudeOrWin}"
                              </p>
                            )}
                            <p className="whitespace-pre-line">{entry.journalText}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {entry.triggers.map((t) => (
                            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              {TRIGGER_META[t] ? `${TRIGGER_META[t].emoji} ${TRIGGER_META[t].label}` : `⚡ ${t}`}
                            </span>
                          ))}
                          {entry.copingStrategies.map((c) => (
                            <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200">
                              {COPING_META[c] ? `${COPING_META[c].emoji} ${COPING_META[c].label}` : `🛠️ ${c}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CYCLE TRACKER & HORMONAL RHYTHM (TEENS TO ADULTS) */}
          {activeTab === 'cycle-tracker' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">{cycleSettings.discreetMode ? '🌿' : '🌸'}</span>
                    <span>{cycleSettings.discreetMode ? 'Wellness & Hormonal Rhythm Hub' : 'Menstrual Cycle & Sensory Wellness Hub'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Designed for teens and adults. Calculates cycle phases, predicts upcoming periods, and correlates sensory sensitivity & executive function with hormonal shifts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCycleTrackerModal(true);
                    playChime('tap');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Cycle Studio & Log Day</span>
                </button>
              </div>

              {/* Feature Active / Inactive Banner */}
              {enabledFeatures?.cycleTracker === false && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-amber-900">
                        Cycle Tracker is currently turned off for this profile.
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Enable it in Feature Controls to display in the user's header and feelings tab.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggleFeature('cycleTracker');
                      playChime('star');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Enable Feature
                  </button>
                </div>
              )}

              {/* Cycle Settings Card */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Cycle Configuration & Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Average Cycle Length (Days):
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={45}
                      value={cycleSettings.averageCycleLength}
                      onChange={(e) => updateCycleSettings({ averageCycleLength: parseInt(e.target.value) || 28 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Average Period Length (Days):
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={cycleSettings.averagePeriodLength}
                      onChange={(e) => updateCycleSettings({ averagePeriodLength: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Last Period Start Date:
                    </label>
                    <input
                      type="date"
                      value={cycleSettings.lastPeriodStartDate || ''}
                      onChange={(e) => updateCycleSettings({ lastPeriodStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Discreet Mode</span>
                    <span className="text-[11px] text-slate-500">
                      Replaces terms like "Menstrual Period" with "Wellness Rhythm" and uses subtle icons.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cycleSettings.discreetMode}
                    onChange={(e) => updateCycleSettings({ discreetMode: e.target.checked })}
                    className="w-5 h-5 text-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl p-2.5 rounded-2xl bg-white shadow-2xs">
                    {cycleSettings.discreetMode ? '🌿' : '🌸'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md">
                        Day {cyclePhaseInfo.currentCycleDay} of {cycleSettings.averageCycleLength}
                      </span>
                      <span className="text-xs font-bold text-rose-950">
                        {cyclePhaseInfo.phaseLabel}
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 font-medium mt-1">
                      {cyclePhaseInfo.sensoryInsight}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 font-medium block">Days Until Next Period</span>
                  <span className="text-2xl font-black text-rose-950">{cyclePhaseInfo.daysUntilNextPeriod} Days</span>
                </div>
              </div>

              {/* Daily Logs Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Daily Logs & Symptom History
                </h3>

                {cycleLogs.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2">
                    <span className="text-3xl block">🌸</span>
                    <p className="text-xs font-bold text-slate-600">No cycle logs recorded yet</p>
                    <p className="text-[11px] text-slate-400">
                      When symptoms or flow are logged, history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Flow</th>
                          <th className="py-3 px-4">Discomfort</th>
                          <th className="py-3 px-4">Energy</th>
                          <th className="py-3 px-4">Symptoms</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cycleLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 font-bold text-slate-900">{log.date}</td>
                            <td className="py-3 px-4 capitalize text-rose-700 font-bold">{log.flow || '-'}</td>
                            <td className="py-3 px-4">{log.painLevel !== undefined ? `${log.painLevel}/10` : '-'}</td>
                            <td className="py-3 px-4">{log.energyLevel !== undefined ? `${log.energyLevel}/5` : '-'}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {log.symptoms.length > 0 ? log.symptoms.join(', ') : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteCycleLog(log.id);
                                  playChime('tap');
                                }}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Delete log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 0A: CAREGIVER LIVE LINK & REMOTE MONITOR */}
          {activeTab === 'caregiver' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    <span>Caregiver Live Link & Remote Monitor</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    See what {childProfile.name} is doing or feeling in real-time, even when you're away at work or in another room.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/?caregiver=true&code=${getPairingCode()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Remote Portal in New Window</span>
                  </a>
                </div>
              </div>

              {/* Pairing Code Card */}
              <div className="p-5 rounded-3xl bg-linear-to-r from-rose-50 via-purple-50 to-indigo-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-rose-700 uppercase tracking-wider block mb-1">
                    Your Child's Remote Pairing Code
                  </span>
                  <div className="text-3xl font-black tracking-wider text-slate-900 font-mono">
                    {getPairingCode()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Open this portal from any phone, laptop, or tablet using this code or the direct link.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?caregiver=true&code=${getPairingCode()}`;
                    navigator.clipboard?.writeText(url);
                    showNotification('Caregiver portal link copied to clipboard!');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Direct Portal URL</span>
                </button>
              </div>

              {/* Embedded Live Companion Portal View */}
              <div className="rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs">
                <CaregiverLivePortal initialCode={getPairingCode()} />
              </div>
            </div>
          )}

          {/* TAB 0B: OFFLINE & PWA STORAGE DIAGNOSTICS */}
          {activeTab === 'offline' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-indigo-600" />
                    <span>Offline Functionality & Storage Indexing</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Critical AAC speech, visual schedules, and social story data remain 100% accessible without internet.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualReindex}
                    disabled={reindexingOffline}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>{reindexingOffline ? 'Indexing Cache...' : 'Verify & Re-Index Offline Storage'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Offline Readiness: Fully Protected & Cached</h3>
                    <p className="text-xs text-emerald-700">
                      Service worker active with precached assets and dual-indexed local database.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
                  100% Offline Ready
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                    AAC Tiles Indexed
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {aacItems.length} Tiles
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Stored in IndexedDB 'aac_items' store with motor index preserved.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                    Routines & Schedules
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {routines.length} Routines
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    All visual steps, times, and First/Then sequences cached locally.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                    Social Stories & Scripts
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {socialStories.length} Stories
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Complete illustrated pages and reassurance scripts saved offline.
                  </p>
                </div>
              </div>

              {/* Install PWA Component Card */}
              <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Install Lumina as Standalone Progressive Web App</span>
                  </h3>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Installs directly to tablet or phone home screen with native app launch and zero browser distractions.
                  </p>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <PWAInstallButton variant="pill" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PLANS CHANGED SYSTEM */}
          {activeTab === 'plans-changed' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>Plans Changed System</span>
                    {pcActive && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Active on Child Screen
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Prepare your child for unexpected schedule disruptions with calm explanations and reassuring alternatives.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPlansChangedModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Child Modal</span>
                  </button>
                  <button
                    onClick={handleSavePlansChanged}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Update</span>
                  </button>
                </div>
              </div>

              {/* Status Toggle Card */}
              <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-amber-950 text-sm">
                    Activate "Plans Changed" Alert for Child
                  </h4>
                  <p className="text-xs text-amber-800 font-medium">
                    When active, a calm notification card and contextual phrases appear in the child's app.
                  </p>
                </div>
                <button
                  onClick={() => setPcActive(!pcActive)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                    pcActive ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      pcActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Quick Presets for Instant One-Tap Setup */}
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Presets (1-Tap Setup):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleApplyPreset('dentist')}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer"
                  >
                    <span className="text-2xl mb-1 block">🦷</span>
                    <span className="font-black text-xs text-slate-800 block">Dentist/Doctor Closed</span>
                    <span className="text-[11px] text-slate-500">Pizza lunch & playground instead</span>
                  </button>
                  <button
                    onClick={() => handleApplyPreset('rain')}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer"
                  >
                    <span className="text-2xl mb-1 block">🌧️</span>
                    <span className="font-black text-xs text-slate-800 block">Rainy Day / Trip Cancelled</span>
                    <span className="text-[11px] text-slate-500">Blanket fort & cozy movie</span>
                  </button>
                  <button
                    onClick={() => handleApplyPreset('school')}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer"
                  >
                    <span className="text-2xl mb-1 block">🏫</span>
                    <span className="font-black text-xs text-slate-800 block">School Early Dismissal</span>
                    <span className="text-[11px] text-slate-500">Pick up early & quiet afternoon</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      Original Plan (What is being replaced):
                    </label>
                    <input
                      type="text"
                      value={pcOriginal}
                      onChange={(e) => setPcOriginal(e.target.value)}
                      placeholder="e.g. Dentist appointment at 2:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      New Plan Title:
                    </label>
                    <input
                      type="text"
                      value={pcNewTitle}
                      onChange={(e) => setPcNewTitle(e.target.value)}
                      placeholder="e.g. Lunch & Park Swings"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Calm Explanation (Why it changed):
                  </label>
                  <input
                    type="text"
                    value={pcReason}
                    onChange={(e) => setPcReason(e.target.value)}
                    placeholder="e.g. The dental clinic is closed today because the doctor is sick."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Reassuring Message for Child:
                  </label>
                  <textarea
                    rows={2}
                    value={pcCalming}
                    onChange={(e) => setPcCalming(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                {/* Step-by-Step New Schedule */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2">
                    New Plan Steps:
                  </label>
                  <div className="space-y-2 mb-3">
                    {pcSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-2xl">{step.emoji}</span>
                        <span className="flex-1 font-bold text-xs sm:text-sm text-slate-800">
                          {step.title}
                        </span>
                        {step.time && (
                          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {step.time}
                          </span>
                        )}
                        <button
                          onClick={() => setPcSteps(pcSteps.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Step Form */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100 rounded-2xl">
                    <input
                      type="text"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      placeholder="Step name (e.g. Draw pictures at home)"
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={newStepEmoji}
                      onChange={(e) => setNewStepEmoji(e.target.value)}
                      placeholder="Emoji"
                      className="w-16 px-2 py-2 text-center rounded-xl bg-white border border-slate-300 text-sm"
                    />
                    <input
                      type="text"
                      value={newStepTime}
                      onChange={(e) => setNewStepTime(e.target.value)}
                      placeholder="Time (optional)"
                      className="w-28 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                    />
                    <button
                      onClick={() => {
                        if (newStepTitle.trim()) {
                          setPcSteps([
                            ...pcSteps,
                            { title: newStepTitle.trim(), emoji: newStepEmoji || '⭐', time: newStepTime.trim() || undefined },
                          ]);
                          setNewStepTitle('');
                          setNewStepTime('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>
                </div>

                {/* Relevant Communication Phrases */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2">
                    Child Communication Phrases for this Change:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pcPhrases.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-center gap-2"
                      >
                        <span>💬 {phrase}</span>
                        <button
                          onClick={() => setPcPhrases(pcPhrases.filter((_, i) => i !== idx))}
                          className="text-amber-700 hover:text-rose-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPhraseInput}
                      onChange={(e) => setNewPhraseInput(e.target.value)}
                      placeholder="Add custom phrase (e.g. Can I have my dinosaur?)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                    />
                    <button
                      onClick={() => {
                        if (newPhraseInput.trim()) {
                          setPcPhrases([...pcPhrases, newPhraseInput.trim()]);
                          setNewPhraseInput('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                    >
                      Add Phrase
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      dismissPlansChanged();
                      setPcActive(false);
                      showNotification('Plans Changed deactivated.');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Clear & Deactivate
                  </button>
                  <button
                    onClick={handleSavePlansChanged}
                    className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Activate Plans Changed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTINES & MY DAY (First/Then sequences) */}
          {activeTab === 'routines' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>Visual Schedules & Routines</span>
                    <span className="text-xs font-black text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                      First / Then Motor Planning
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Build predictable morning, school, bedtime, or appointment routines with visual sequencing.
                  </p>
                </div>

                {/* Sub-view switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
                  <button
                    onClick={() => {
                      setRoutinesSubView('library');
                      playChime('tap');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      routinesSubView === 'library'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Template Library</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoutinesSubView('active');
                      playChime('tap');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      routinesSubView === 'active'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>Active Routines ({routines.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoutinesSubView('create');
                      playChime('tap');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      routinesSubView === 'create'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                    <span>Create Custom</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: ROUTINE TEMPLATES LIBRARY */}
              {routinesSubView === 'library' && (
                <div className="space-y-6">
                  <RoutineTemplatesLibrary
                    onQuickImport={handleQuickImportTemplate}
                    onCustomizeTemplate={handleCustomizeTemplate}
                    existingRoutineTitles={routines.map((r) => r.title)}
                  />

                  {/* Quick Shortcut to Active Routines */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      <div>
                        <span className="text-xs font-black text-slate-800 block">
                          Looking for active child routines?
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {routines.length} routines currently in {childProfile.name}'s daily schedule.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setRoutinesSubView('active')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      View Active Routines →
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: ACTIVE ROUTINES LIST */}
              {routinesSubView === 'active' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Active Child Routines ({routines.length}):
                    </span>
                    <button
                      onClick={() => setRoutinesSubView('library')}
                      className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Browse Template Library</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {routines.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 sm:p-5 bg-white border-2 border-slate-200 hover:border-sky-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <span className="text-3xl sm:text-4xl p-2 bg-sky-50 rounded-2xl border border-sky-100 shrink-0">
                            {r.emoji}
                          </span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                {r.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold capitalize">
                                {r.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                              <span className="flex items-center gap-1 text-slate-700">
                                <Clock className="w-3 h-3 text-sky-600" />
                                {r.time || 'Flexible'}
                              </span>
                              <span>•</span>
                              <span>{r.steps.length} visual steps</span>
                              {r.firstThen && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                                    First {r.firstThen.first} → Then {r.firstThen.then}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleEditActiveRoutine(r)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                            title="Customize steps, times, and rewards"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                            <span>Customize</span>
                          </button>

                          <button
                            onClick={() => handleDuplicateRoutine(r)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition cursor-pointer"
                            title="Duplicate routine"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete routine "${r.title}"?`)) {
                                deleteRoutine(r.id);
                                showNotification(`Routine "${r.title}" deleted.`);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete routine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {routines.length === 0 && (
                      <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 space-y-3">
                        <span className="text-3xl">📅</span>
                        <h4 className="font-black text-slate-800 text-sm">No active routines yet</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Import from our pre-built library of Morning, School Day, and Bedtime templates to get started quickly.
                        </p>
                        <button
                          onClick={() => setRoutinesSubView('library')}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Browse Template Library</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 3: CREATE CUSTOM FROM SCRATCH */}
              {routinesSubView === 'create' && (
                <form onSubmit={handleCreateRoutine} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-sky-600" />
                      <span>Create New Routine with First / Then</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setRoutinesSubView('library')}
                      className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                    >
                      Or import a pre-built template →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Routine Title:</label>
                      <input
                        type="text"
                        value={newRoutineTitle}
                        onChange={(e) => setNewRoutineTitle(e.target.value)}
                        placeholder="e.g. Weekend Park Routine"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Time:</label>
                      <input
                        type="text"
                        value={newRoutineTime}
                        onChange={(e) => setNewRoutineTime(e.target.value)}
                        placeholder="e.g. 9:00 AM"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Icon Emoji:</label>
                      <input
                        type="text"
                        value={newRoutineEmoji}
                        onChange={(e) => setNewRoutineEmoji(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                    <div>
                      <label className="text-xs font-black text-sky-800 block mb-1">FIRST task:</label>
                      <input
                        type="text"
                        value={newFirstTask}
                        onChange={(e) => setNewFirstTask(e.target.value)}
                        placeholder="e.g. Brush teeth"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-purple-800 block mb-1">THEN reward/next task:</label>
                      <input
                        type="text"
                        value={newThenTask}
                        onChange={(e) => setNewThenTask(e.target.value)}
                        placeholder="e.g. Tablet time (15m)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs cursor-pointer shadow-xs"
                    >
                      Create Routine
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoutinesSubView('active')}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      View Active Routines
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: AAC & VOCABULARY (Journey 2: Add Chicken Nuggets!) */}
          {activeTab === 'aac' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">AAC Vocabulary Manager</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Add custom words, family photos, and quick phrases. Fixed motor planning ensures vocabulary stays predictable.
                  </p>
                </div>

                {/* 1-Tap Chicken Nuggets Test Button for Journey 2 */}
                <button
                  onClick={handleQuickAddChickenNuggets}
                  className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs flex items-center gap-1.5 border border-orange-300 shadow-xs cursor-pointer"
                >
                  <span>🍗 1-Tap Add "Chicken Nuggets"</span>
                </button>
              </div>

              {/* Add Custom Word Form */}
              <form onSubmit={handleAddCustomWord} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>Add New Vocabulary Item</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Word Label:</label>
                    <input
                      type="text"
                      value={newWordLabel}
                      onChange={(e) => setNewWordLabel(e.target.value)}
                      placeholder="e.g. Chicken Nuggets"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Speech Text (spoken aloud):</label>
                    <input
                      type="text"
                      value={newWordSpeech}
                      onChange={(e) => setNewWordSpeech(e.target.value)}
                      placeholder="e.g. Chicken nuggets please"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Category:</label>
                    <select
                      value={newWordCategory}
                      onChange={(e) => setNewWordCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    >
                      <option value="food">Food 🍕</option>
                      <option value="drinks">Drinks 🧃</option>
                      <option value="activities">Play & Fun 🎮</option>
                      <option value="places">Places 🏠</option>
                      <option value="people">People 👥</option>
                      <option value="feelings">Feelings 💛</option>
                      <option value="sensory">Sensory 🎧</option>
                      <option value="actions">Actions 🏃</option>
                      <option value="core">Core Words ⭐</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Emoji Icon:</label>
                    <input
                      type="text"
                      value={newWordEmoji}
                      onChange={(e) => setNewWordEmoji(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Photo URL (Optional):</label>
                    <input
                      type="text"
                      value={newWordPhotoUrl}
                      onChange={(e) => setNewWordPhotoUrl(e.target.value)}
                      placeholder="https://... or real photo"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Color Key:</label>
                    <select
                      value={newWordColorType}
                      onChange={(e) => setNewWordColorType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    >
                      <option value="noun">Noun (Orange)</option>
                      <option value="verb">Verb (Green)</option>
                      <option value="subject">Subject/Pronoun (Yellow)</option>
                      <option value="adjective">Adjective (Blue)</option>
                      <option value="emergency">Emergency/Stop (Red)</option>
                      <option value="social">Social (Purple)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer"
                >
                  Add to Child's AAC
                </button>
              </form>

              {/* Voice & Speech Controls */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <span>Fluid Human Voice & Speech Settings</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Offline Ready
                  </span>
                </div>

                {/* Voice Persona Selector */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    Human Voice Persona:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { id: 'Kore', name: 'Kore', desc: 'Warm, gentle & empathetic', emoji: '🌸', badge: 'Recommended' },
                      { id: 'Puck', name: 'Puck', desc: 'Bright, cheerful & playful', emoji: '☀️' },
                      { id: 'Zephyr', name: 'Zephyr', desc: 'Soft, calm & soothing', emoji: '🍃' },
                      { id: 'system', name: 'On-Device Natural', desc: 'Device neural voice (offline)', emoji: '📱' },
                    ].map((persona) => {
                      const isSelected = (settings.voicePersona || 'Kore') === persona.id;
                      return (
                        <button
                          key={persona.id}
                          type="button"
                          onClick={() => {
                            updateSettings({ voicePersona: persona.id as any });
                            playChime('tap');
                          }}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400 text-indigo-950 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{persona.emoji}</span>
                            {persona.badge && (
                              <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                {persona.badge}
                              </span>
                            )}
                          </div>
                          <span className="font-black text-xs block">{persona.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium block leading-tight">
                            {persona.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Pacing / Rate: {settings.voiceRate.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.75"
                      max="1.25"
                      step="0.02"
                      value={settings.voiceRate}
                      onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">0.96x sounds most natural</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Natural Pitch: {settings.voicePitch.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.9"
                      max="1.15"
                      step="0.02"
                      value={settings.voicePitch}
                      onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">1.0 preserves human resonance</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Language:</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="fil">Filipino</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => speak('Hello! I am ready to talk, play, and explore with you today.')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Audition Fluid Voice</span>
                  </button>
                  <span className="text-xs text-slate-500">
                    Active: <strong>{settings.voicePersona === 'system' ? (settings.selectedVoiceURI || 'Auto-Selected Best Fluid System Voice') : (settings.voicePersona || 'Kore')}</strong>
                  </span>
                </div>

                {/* DETECTED SYSTEM VOICES LIST (window.speechSynthesis.getVoices()) */}
                <div className="pt-4 border-t border-slate-200 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Detected System Voices on this Device ({offlineVoices.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Querying <code>window.speechSynthesis.getVoices()</code>. Non-robotic voices with fluid natural human prosody are automatically ranked at the top.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ selectedVoiceURI: '', voicePersona: 'system' });
                        showNotification('Set to auto-prioritize the most fluid system voice on this device.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Auto-Pick Best Fluid Voice
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-white">
                    {offlineVoices.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">
                        Detecting device speech synthesis voices... (Click Audition to initialize)
                      </p>
                    ) : (
                      offlineVoices.slice(0, 20).map((voice) => {
                        const isFluid = isVoiceFluid(voice);
                        const score = rateVoiceNaturalness(voice);
                        const isSelected = settings.selectedVoiceURI === voice.voiceURI;

                        return (
                          <div
                            key={voice.voiceURI}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300'
                                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-800 truncate block">
                                  {voice.name}
                                </span>
                                {isFluid && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                                    🌟 Fluid Human Voice
                                  </span>
                                )}
                                {voice.localService && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 shrink-0">
                                    Offline
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                Lang: {voice.lang} • Naturalness Score: {score}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  speakText(`Hello, I am ${voice.name}. I sound clear and friendly!`, {
                                    voiceURI: voice.voiceURI,
                                    preferOfflineOnly: true,
                                    rate: settings.voiceRate,
                                    pitch: settings.voicePitch,
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Test this specific voice"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Audition</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateSettings({
                                    selectedVoiceURI: voice.voiceURI,
                                    voicePersona: 'system',
                                  });
                                  showNotification(`Voice set to "${voice.name}"!`);
                                }}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Use'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOICE SETTINGS & TESTING TOOL */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <span>Voice Settings & Testing Tool</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Test and compare all available system voices on this device with real AAC phrases to choose the most natural, fluid voice for your child.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const best = getBestSystemVoice(settings.language);
                      if (best) {
                        updateSettings({ selectedVoiceURI: best.voiceURI, voicePersona: 'system' });
                        showNotification(`Auto-selected "${best.name}" (Highest Naturalness Rating)!`);
                      } else {
                        updateSettings({ selectedVoiceURI: '', voicePersona: 'system' });
                        showNotification('Set to auto-prioritize most fluid voice.');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Pick Most Natural Voice</span>
                  </button>
                </div>
              </div>

              {/* 1. CURRENTLY ACTIVE VOICE CARD */}
              <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-2 border-indigo-200 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Active AAC Vocalizer
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Offline Ready
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span>{settings.selectedVoiceURI ? (offlineVoices.find(v => v.voiceURI === settings.selectedVoiceURI)?.name || settings.selectedVoiceURI) : (settings.voicePersona ? `Neural Voice (${settings.voicePersona})` : 'Auto-Selected Best Natural Voice')}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Pacing: <strong>{settings.voiceRate.toFixed(2)}x</strong> • Natural Pitch: <strong>{settings.voicePitch.toFixed(2)}</strong> • Language: <strong>{settings.language.toUpperCase()}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        speak('I want pizza please.');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Test Active Voice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => haltSpeaking()}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. INTERACTIVE TESTING SANDBOX */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-sky-600" />
                    <span>Interactive Phrase Testing Sandbox</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Type any word or pick a preset</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Phrase to Test:
                  </label>
                  <input
                    type="text"
                    value={voiceTestText}
                    onChange={(e) => setVoiceTestText(e.target.value)}
                    placeholder="Type words to test (e.g. I want pizza please)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Presets:</span>
                  {[
                    'I want pizza please.',
                    'I need a break.',
                    'Can you help me please?',
                    'Good morning, how are you today?',
                    'I am happy and ready to play.',
                    'Something hurts.',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVoiceTestText(preset);
                        playChime('tap');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Sliders: Pacing and Pitch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Pacing / Speed: {settings.voiceRate.toFixed(2)}x</span>
                      <span className="text-[10px] text-slate-400 font-normal">0.96x is conversational</span>
                    </div>
                    <input
                      type="range"
                      min="0.75"
                      max="1.25"
                      step="0.02"
                      value={settings.voiceRate}
                      onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Natural Pitch: {settings.voicePitch.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">1.0 avoids metallic pitch</span>
                    </div>
                    <input
                      type="range"
                      min="0.9"
                      max="1.15"
                      step="0.02"
                      value={settings.voicePitch}
                      onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ALL AVAILABLE SYSTEM VOICES ON THIS DEVICE (with 'Test' button) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      All Available System Voices ({offlineVoices.length} Found)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click the <strong>"Test"</strong> button on any voice to audition how it sounds with your test phrase.
                    </p>
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={voiceSearchQuery}
                      onChange={(e) => setVoiceSearchQuery(e.target.value)}
                      placeholder="Search voice name..."
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold w-40"
                    />

                    <button
                      type="button"
                      onClick={() => setOnlyFluidVoices(!onlyFluidVoices)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        onlyFluidVoices
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🌟 Natural / Fluid Only
                    </button>
                  </div>
                </div>

                {/* Voice list cards */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {offlineVoices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      Querying system voices from device... (If none appear, click Test to initialize browser speech)
                    </div>
                  ) : (
                    offlineVoices
                      .filter((v) => {
                        if (voiceSearchQuery.trim()) {
                          return v.name.toLowerCase().includes(voiceSearchQuery.toLowerCase());
                        }
                        if (onlyFluidVoices) {
                          return isVoiceFluid(v);
                        }
                        return true;
                      })
                      .map((voice) => {
                        const isFluid = isVoiceFluid(voice);
                        const score = rateVoiceNaturalness(voice);
                        const isSelected = settings.selectedVoiceURI === voice.voiceURI;
                        const isAuditioning = auditioningVoiceURI === voice.voiceURI;

                        return (
                          <div
                            key={voice.voiceURI}
                            className={`p-3.5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-black text-sm text-slate-800">
                                  {voice.name}
                                </span>
                                {isFluid ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    🌟 Fluid Human Voice
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                    Standard Voice
                                  </span>
                                )}
                                {voice.localService && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                    100% Offline
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                Language: <strong>{voice.lang}</strong> • Naturalness Rating: <strong>{score}</strong>
                              </span>
                            </div>

                            {/* Action Buttons: TEST and SELECT */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Dedicated TEST button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAuditioningVoiceURI(voice.voiceURI);
                                  speakText(voiceTestText, {
                                    voiceURI: voice.voiceURI,
                                    preferOfflineOnly: true,
                                    rate: settings.voiceRate,
                                    pitch: settings.voicePitch,
                                  });
                                  setTimeout(() => setAuditioningVoiceURI(null), 3000);
                                }}
                                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                                  isAuditioning
                                    ? 'bg-amber-400 text-amber-950 animate-pulse ring-2 ring-amber-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                }`}
                                title={`Test ${voice.name}`}
                              >
                                <Volume2 className="w-4 h-4 text-indigo-600" />
                                <span>{isAuditioning ? 'Playing...' : 'Test'}</span>
                              </button>

                              {/* SELECT FOR AAC button */}
                              <button
                                type="button"
                                onClick={() => {
                                  updateSettings({
                                    selectedVoiceURI: voice.voiceURI,
                                    voicePersona: 'system',
                                  });
                                  showNotification(`Voice "${voice.name}" selected for child's AAC!`);
                                }}
                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <span>Select for AAC</span>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIFE ADVENTURES & CONTEXTUAL PHRASES */}
          {activeTab === 'adventures' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Life Adventures & Contextual AAC</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Prepare for real-world situations with sensory guides and automatic contextual phrase suggestions.
                </p>
              </div>

              <div className="space-y-3">
                {adventures.map((adv) => (
                  <div key={adv.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{adv.emoji}</span>
                        <div>
                          <h4 className="font-black text-slate-800 text-base">{adv.title}</h4>
                          <span className="text-xs text-emerald-700 font-bold">{adv.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{adv.steps.length} steps</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                        Contextual AAC Phrases surfaced during this adventure:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {adv.thingsICanSay.map((phrase, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900 font-bold text-xs">
                            💬 {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Independence Missions & Skills</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Break down everyday routines like tooth brushing and dressing into rewarding micro-missions.
                </p>
              </div>

              <div className="space-y-3">
                {skills.map((sk) => (
                  <div key={sk.id} className="p-4 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{sk.emoji}</span>
                      <div>
                        <h4 className="font-black text-slate-800">{sk.title}</h4>
                        <span className="text-xs text-purple-700 font-bold">{sk.steps.length} steps • +{sk.starsReward} Stars</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Completed {sk.completedTimes} times</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CHILD PROFILE & PERSONALIZATION */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Profile & Emergency Identification</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Personalize the experience, sensory preferences, and emergency contacts.
                </p>
              </div>

              {/* ABOUT ME & EMERGENCY ID BADGE CARD */}
              <div className="bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 rounded-3xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner border border-white/30">
                    🪪
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/30 text-white inline-block mb-1">
                      Digital ID & Advocacy Badge
                    </span>
                    <h3 className="text-lg font-black leading-tight">
                      About Me & Emergency ID Card
                    </h3>
                    <p className="text-xs text-white/90 font-medium">
                      Conditions, sensory sensitivities, communication tips, and emergency contacts.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAboutMeModal(true);
                    playChime('tap');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 shrink-0 flex items-center gap-2"
                >
                  <span>🪪 Open Digital ID Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Child's Name:</label>
                  <input
                    type="text"
                    value={childProfile.name}
                    onChange={(e) => updateChildProfile({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">Pronouns:</label>
                  <input
                    type="text"
                    value={childProfile.pronouns || ''}
                    onChange={(e) => updateChildProfile({ pronouns: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Favorite Interests (comma separated):</label>
                <input
                  type="text"
                  value={childProfile.interests.join(', ')}
                  onChange={(e) =>
                    updateChildProfile({
                      interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Comfort Items:</label>
                <input
                  type="text"
                  value={childProfile.comfortItems.join(', ')}
                  onChange={(e) =>
                    updateChildProfile({
                      comfortItems: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Sensory Notes (Sound & Noise):</label>
                <input
                  type="text"
                  value={childProfile.sensoryNotes.sound}
                  onChange={(e) =>
                    updateChildProfile({
                      sensoryNotes: { ...childProfile.sensoryNotes, sound: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm"
                />
              </div>

              <button
                onClick={() => showNotification('Child profile updated!')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer shadow-xs"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* TAB 7: AI ASSISTANT (Powered by Gemini) - Journey 7 */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span>AI Preparation Assistant (Gemini)</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Describe an upcoming event or routine. AI creates a draft which you review and approve before your child sees it.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'adventure', label: 'Life Adventure 🚀' },
                    { id: 'routine', label: 'Visual Routine 📅' },
                    { id: 'social-story', label: 'Social Story 📖' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setAiType(type.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                        aiType === type.id
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. My child is going to a birthday party tomorrow. He doesn't like loud noises and doesn't know the other children well. Create a step-by-step preparation with sensory tips and phrases he can say."
                  className="w-full p-3 rounded-2xl border-2 border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Uses Gemini 3.8 Flash via secure server proxy. You always review before saving.
                  </span>
                  <button
                    onClick={handleGenerateAI}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                      aiLoading || !aiPrompt.trim()
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{aiLoading ? 'Drafting...' : 'Generate Draft'}</span>
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-700">
                  {aiError}
                </div>
              )}

              {/* DRAFT REVIEW BOX */}
              {aiDraft && (
                <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-3xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                      AI Generated Draft (Review & Approve)
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Ready for Review
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                      <span>{aiDraft.icon || '⭐'}</span>
                      <span>{aiDraft.title}</span>
                    </h3>
                    {aiDraft.summary && (
                      <p className="text-xs text-indigo-900 font-medium mt-1">{aiDraft.summary}</p>
                    )}
                  </div>

                  {aiDraft.steps && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-indigo-950 block">Steps:</span>
                      {aiDraft.steps.map((st: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-indigo-200 text-xs flex items-center gap-2">
                          <span className="font-bold text-indigo-800">{idx + 1}.</span>
                          <span className="font-bold text-slate-800">{st.title}</span>
                          {st.description && <span className="text-slate-500">— {st.description}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiDraft.thingsICanSay && (
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block mb-1">Phrases:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiDraft.thingsICanSay.map((ph: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded bg-white border border-indigo-200 text-xs font-bold text-indigo-900">
                            💬 {ph}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-200">
                    <button
                      onClick={() => setAiDraft(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Discard Draft
                    </button>
                    <button
                      onClick={handleApproveDraft}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Add to Child App</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SETTINGS & PIN */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Settings & Security</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Protect parent controls and configure device preferences.
                </p>
              </div>

              {/* AGE EXPERIENCE & SETUP WIZARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-800">Age Experience Mode</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Controls terminology, visual tone, and recommended feature layouts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      reopenOnboarding();
                      setIsParentMode(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>✨ Relaunch Onboarding Setup Wizard</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'kid', label: 'Kids (3–11)', emoji: '🧒', desc: 'Mascots, stars, stickers, First/Then' },
                    { id: 'teen', label: 'Teens (12–17)', emoji: '🎧', desc: 'Modern lofi/cyber, countdowns, independence' },
                    { id: 'adult', label: 'Adults (18+)', emoji: '💼', desc: 'Executive function, discreet AAC, zero clutter' },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setUserAgeGroup(a.id as UserAgeGroup);
                        playChime('tap');
                      }}
                      className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        userAgeGroup === a.id
                          ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-300'
                          : 'border-slate-200 hover:bg-white bg-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{a.emoji}</span>
                        <span className="text-xs font-black text-slate-800">{a.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* MODULAR FEATURES MATRIX */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-800">Modular Feature Controls</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Turn any feature on or off. Adults can use stickers/mascots, and kids can have a minimal layout.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        updateEnabledFeatures(DEFAULT_KID_FEATURES);
                        playChime('star');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                    >
                      Kid
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateEnabledFeatures(DEFAULT_TEEN_FEATURES);
                        playChime('star');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs cursor-pointer"
                    >
                      Teen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateEnabledFeatures(DEFAULT_ADULT_FEATURES);
                        playChime('star');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs cursor-pointer"
                    >
                      Adult
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'aacCommunication', label: 'AAC Symbol & Speech Board', emoji: '🗣️', desc: 'Motor-planned AAC tiles with voice' },
                    { key: 'visualCountdownTimer', label: 'Visual Countdown Timer', emoji: '⏱️', desc: 'Activity countdown ring for routines' },
                    { key: 'firstThenSchedules', label: 'First / Then Routine Cards', emoji: '📋', desc: 'Clear step-by-step guidance' },
                    { key: 'starsAndRewards', label: 'Stars & Digital Routine Stickers', emoji: '⭐', desc: 'Gamification reward coins & badges' },
                    { key: 'mascotCompanion', label: 'Playful Mascot Companion', emoji: '🦕', desc: 'Rex/Hopper cheer greetings & banner' },
                    { key: 'dailyMoodRecollection', label: 'Daily Mood & Therapy Log', emoji: '🌙', desc: 'Evening reflection & therapist chart' },
                    { key: 'medicationReminders', label: 'Medication & Health Reminders', emoji: '💊', desc: 'Schedule doses, inventory & refill alerts' },
                    { key: 'moodJournal', label: 'Mood Journal & Self-Reflection (Teens & Adults)', emoji: '📖', desc: 'Nuanced emotions, sensory load & coping strategies' },
                    { key: 'cycleTracker', label: 'Cycle & Hormonal Rhythm Tracker (Teens & Adults)', emoji: '🌸', desc: 'Cycle phases, PMDD sensory shifts & discreet wellness' },
                    { key: 'sensoryBreathingPacer', label: 'Sensory Breathing Pacer', emoji: '🫁', desc: 'Coping toolkit & breath circle' },
                    { key: 'emergencyAlertSOS', label: 'Caregiver Alert SOS Button', emoji: '🚨', desc: 'One-tap emergency & emotion broadcast' },
                    { key: 'socialStories', label: 'Social Stories Preparation', emoji: '📖', desc: 'Scenarios for outings and changes' },
                    { key: 'lifeSkills', label: 'Step-by-Step Life Skills', emoji: '🛠️', desc: 'Task analysis breakdowns for independence' },
                    { key: 'discreetMode', label: 'Discreet Minimal Mode', emoji: '🕶️', desc: 'Text-focused layout, minimal clutter' },
                  ].map((feat) => {
                    const isChecked = enabledFeatures ? (enabledFeatures as any)[feat.key] !== false : true;
                    return (
                      <div
                        key={feat.key}
                        onClick={() => {
                          toggleFeature(feat.key as any);
                          playChime('tap');
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          isChecked ? 'border-amber-400 bg-white shadow-2xs' : 'border-slate-200 bg-slate-100/70 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{feat.emoji}</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">{feat.label}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{feat.desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-amber-500 rounded cursor-pointer pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="max-w-xs">
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Parent Lock PIN:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={settings.pin}
                  onChange={(e) => updateSettings({ pin: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-black text-center text-lg tracking-widest"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Default: 1234</span>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    Play cheerful auditory chimes on taps & completions
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSpeakSentence}
                    onChange={(e) => updateSettings({ autoSpeakSentence: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    Speak word immediately upon tap (Immediate feedback)
                  </span>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (window.confirm('Reset all app data to factory defaults?')) {
                      resetToDefaults();
                      showNotification('App reset to initial defaults.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 cursor-pointer"
                >
                  Reset App State to Initial Sample Data
                </button>
              </div>
            </div>
          )}

          {/* TAB: THEMES & CUSTOMIZATION STUDIO */}
          {activeTab === 'themes' && (
            <ThemeShopAndStudio />
          )}
        </main>
      </div>

      {/* Routine Customizer Modal */}
      <RoutineCustomizerModal
        isOpen={customizerModalOpen}
        onClose={() => {
          setCustomizerModalOpen(false);
          setCustomizingRoutine(null);
        }}
        initialRoutine={customizingRoutine}
        onSave={handleSaveCustomizedRoutine}
      />
    </div>
  );
};
