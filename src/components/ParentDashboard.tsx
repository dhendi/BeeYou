import React, { useState, useEffect, useRef } from 'react';
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
  Crown,
  Search,
  Upload,
  FileJson,
  HelpCircle,
  ArrowRight,
  Send,
  Bell,
  Activity,
  Smartphone,
  Radio,
  ShieldAlert,
  Camera,
  Mail,
  Zap
} from 'lucide-react';
import { CaregiverHowItWorksModal, HelpTopic } from './CaregiverHowItWorksModal';
import { CaregiverFeatureWalkthrough } from './CaregiverFeatureWalkthrough';
import { ContextualHelpButton } from './ContextualHelpButton';
import { MOOD_META, TRIGGER_META, COPING_META } from '../data/defaultData';
import { playChime, getAvailableVoices, rateVoiceNaturalness, isVoiceFluid, speakText, getBestSystemVoice, stopSpeaking as haltSpeaking } from '../utils/audio';
import { 
  AACItem,
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
  CaregiverAlert,
  PredefinedCaregiverResponseId,
  CaregiverChildStatus
} from '../types';
import { CaregiverLivePortal } from './CaregiverLivePortal';
import { PWAInstallButton } from './PWAInstallButton';
import { RoutineTemplatesLibrary } from './RoutineTemplatesLibrary';
import { RoutineCustomizerModal } from './RoutineCustomizerModal';
import { DailyRecollectionChart } from './DailyRecollectionChart';
import { ThemeShopAndStudio } from './ThemeShopAndStudio';
import { verifyOfflineIntegrity, indexOfflineData } from '../utils/offlineStorage';
import { AACSymbolPickerModal } from './AACSymbolPickerModal';
import { INDUSTRY_AAC_PACKS, IndustryAacPack } from '../services/symbolService';
import { QRCodeView } from './QRCodeView';
import { CameraQRScannerModal } from './CameraQRScannerModal';
import { ConnectionFeedbackModal, ConnectionFeedbackState } from './ConnectionFeedbackModal';
import { FamilyAuthModal } from './FamilyAuthModal';
import { getActiveDeviceView } from '../services/authService';

import { 
  getPairingCode, 
  subscribeToCloudChannel,
  sendCaregiverMessage, 
  acknowledgeCaregiverAlert, 
  onCaregiverAlert,
  onChildStatusUpdate,
  fetchCaregiverSession,
  claimPairingSession,
  extractPairingCodeFromScan,
  getAlertHistory,
  saveAlertToHistory,
  clearAlertHistory,
  sendTestCaregiverAlert
} from '../services/caregiverSync';

export const ParentDashboard: React.FC = () => {
  const {
    setIsParentMode,
    userRole,
    childProfile,
    updateChildProfile,
    caregiverPermissions,
    worldState,
    currentMood,
    connectionStatus,
    isCaregiverConnected,
    setShowCaregiverModal,
    showFamilyAuthModal,
    setShowFamilyAuthModal,
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
    updateAacItem,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
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
    subscription,
    isPremium,
    startFreeTrial,
    cancelSubscription,
    setSubscriptionTier,
    setBillingCycle,
    triggerUpgrade,
    exportProfileBackup,
    importProfileBackup,
    setShowEditAlertsModal,
    setShowEditCalmModal,
    getTrialDaysRemaining,
  } = useApp();

  const isCaregiverOnly = userRole === 'caregiver' || getActiveDeviceView() === 'caregiver' || childProfile.userRole === 'caregiver_managing';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProfileBackup(content);
        if (success) {
          showNotification('Profile backup successfully imported and restored!');
        } else {
          showNotification('Import failed: Invalid backup file format.');
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const cyclePhaseInfo = getCyclePhaseInfo();

  type TabType = 
    | 'home'
    | 'alerts'
    | 'subscription'
    | 'guide'
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
    | 'settings';

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dashboardScrollRef = useRef<HTMLDivElement>(null);

  // Caregiver Live Homepage & Remote Dispatcher State
  const [customMsgText, setCustomMsgText] = useState('');
  const [customMsgEmoji, setCustomMsgEmoji] = useState('❤️');
  const [activeAlerts, setActiveAlerts] = useState<CaregiverAlert[]>(() => {
    try {
      const raw = localStorage.getItem('beeyou_active_caregiver_alert');
      if (raw) return [JSON.parse(raw)];
    } catch {}
    return [];
  });
  const [alertHistoryList, setAlertHistoryList] = useState<CaregiverAlert[]>(() => getAlertHistory());
  const [liveChildStatus, setLiveChildStatus] = useState<CaregiverChildStatus | null>(null);

  useEffect(() => {
    const code = getPairingCode();
    subscribeToCloudChannel(code);

    const refreshSession = () => {
      fetchCaregiverSession(code).then((session) => {
        if (session) {
          setLiveChildStatus(session);
          if (session.activeAlert && session.activeAlert.status === 'active') {
            const current = session.activeAlert;
            setActiveAlerts((prev) => [
              current,
              ...prev.filter((a) => a.id !== current.id),
            ]);
            setAlertHistoryList(getAlertHistory());
          }
        }
      });
    };

    refreshSession();
    const pollInterval = setInterval(refreshSession, 2000);

    const unsubAlert = onCaregiverAlert((alert) => {
      setActiveAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
      setAlertHistoryList(getAlertHistory());
      playChime('star');
      showNotification(`🚨 Incoming Alert from ${alert.childName}: ${alert.label}`);
    });
    const unsubStatus = onChildStatusUpdate((status) => {
      setLiveChildStatus(status);
    });
    return () => {
      unsubAlert();
      unsubStatus();
      clearInterval(pollInterval);
    };
  }, []);

  const handleSendQuickNudge = async (title: string, text: string, emoji: string) => {
    await sendCaregiverMessage(getPairingCode(), text, 'Caregiver', emoji);
    showNotification(`Sent "${title}" alert to ${childProfile.name}'s device!`);
    playChime('tap');
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsgText.trim()) return;
    await sendCaregiverMessage(getPairingCode(), customMsgText.trim(), 'Caregiver', customMsgEmoji);
    showNotification(`Sent note to ${childProfile.name}'s device!`);
    setCustomMsgText('');
    playChime('tap');
  };

  const handleAcknowledgeAlert = async (alertId: string, responseMessage: string, responseId?: PredefinedCaregiverResponseId) => {
    await acknowledgeCaregiverAlert(getPairingCode(), 'Caregiver', responseMessage, responseId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification(`Sent response: "${responseMessage}" to child!`);
    playChime('star');
  };

  const handleTriggerTestAlert = async () => {
    const testAlert = await sendTestCaregiverAlert(childProfile.name || 'Leo');
    setActiveAlerts((prev) => [testAlert, ...prev.filter((a) => a.id !== testAlert.id)]);
    setAlertHistoryList(getAlertHistory());
    playChime('complete');
    showNotification(`🚨 Test alert triggered successfully for ${childProfile.name}!`);
  };

  const handleClearAlertHistory = () => {
    clearAlertHistory();
    setAlertHistoryList([]);
    showNotification('Alert history cleared.');
    playChime('tap');
  };

  const handleResolveAlert = (alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    try {
      localStorage.removeItem('beeyou_active_caregiver_alert');
    } catch {}
    setAlertHistoryList(getAlertHistory());
    showNotification('Alert marked as resolved and safely archived.');
    playChime('tap');
  };

  // Camera QR Scanner Modal State
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  // Connection Feedback State
  const [feedbackState, setFeedbackState] = useState<ConnectionFeedbackState | null>(null);

  const handleScanCaregiverQR = async (scanned: string) => {
    const cleanCode = extractPairingCodeFromScan(scanned);
    if (!cleanCode) return;

    const res = await claimPairingSession({
      pairingCode: cleanCode,
      claimerRole: 'caregiver',
      childName: childProfile.name || 'Leo',
      caregiverName: 'Caregiver',
      permissions: caregiverPermissions,
    });

    if (res.success) {
      setFeedbackState({
        isOpen: true,
        type: 'success',
        role: 'caregiver',
        peerName: childProfile.name || 'Child',
        pairingCode: cleanCode,
      });
      speakText(`You are connected to ${childProfile.name || 'your child'}`);
      showNotification(`🎉 Successfully connected to ${childProfile.name}'s device!`);
    } else {
      setFeedbackState({
        isOpen: true,
        type: 'failure',
        role: 'caregiver',
        peerName: childProfile.name || 'Child',
        errorMessage: res.message,
        pairingCode: cleanCode,
      });
    }
  };

  // Smoothly scroll back to top of page when changing tabs
  useEffect(() => {
    if (dashboardScrollRef.current) {
      dashboardScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

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
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [editingAacItem, setEditingAacItem] = useState<AACItem | null>(null);
  const parentAacFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleParentAacPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            width = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setNewWordPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setNewWordPhotoUrl(event.target?.result as string);
        }
        showNotification('Photo uploaded and compressed for AAC button!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePickSymbol = (symbol: {
    photoUrl: string;
    label: string;
    speechText?: string;
    emoji?: string;
    category?: AACCategory;
    colorType?: 'subject' | 'verb' | 'noun' | 'adjective' | 'social' | 'emergency';
  }) => {
    if (editingAacItem) {
      updateAacItem({
        ...editingAacItem,
        label: symbol.label,
        speechText: symbol.speechText || symbol.label,
        photoUrl: symbol.photoUrl,
        emoji: symbol.emoji || editingAacItem.emoji,
        colorType: symbol.colorType || editingAacItem.colorType,
        category: symbol.category || editingAacItem.category,
      });
      showNotification(`Updated symbol for "${symbol.label}"!`);
      setEditingAacItem(null);
    } else {
      setNewWordLabel(symbol.label);
      setNewWordSpeech(symbol.speechText || symbol.label);
      setNewWordPhotoUrl(symbol.photoUrl);
      if (symbol.emoji) setNewWordEmoji(symbol.emoji);
      if (symbol.category) setNewWordCategory(symbol.category);
      if (symbol.colorType) setNewWordColorType(symbol.colorType);
      showNotification(`Selected symbol for "${symbol.label}"!`);
    }
  };

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

    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }

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
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
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
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
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
    if (!isPremium && routines.length >= 1) {
      triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
      return;
    }
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
      if (!isPremium && routines.length >= 1) {
        triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
        return;
      }
      addRoutine(routineData);
      showNotification(`Routine "${routineData.title}" saved to schedule!`);
    }
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
    if (!isPremium && medications.length >= 1) {
      triggerUpgrade('Medication Reminders: The Basic plan includes 1 medication reminder. Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited medications, stock tracking, and refill alerts!');
      return;
    }
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
    <div 
      ref={dashboardScrollRef}
      className="h-[100dvh] max-h-[100dvh] w-full overflow-y-auto overscroll-contain bg-slate-100 flex flex-col text-slate-800"
    >
      {/* Top Caregiver Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {!isCaregiverOnly ? (
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
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black shadow-2xs">
              <span>👑 Caregiver View</span>
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <span>Parent & Caregiver Hub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                BeeYou Support
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
        <aside className="w-full md:w-64 bg-white rounded-3xl p-3 border-2 border-slate-200 shadow-xs flex md:flex-col gap-1 overflow-x-auto shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto">
          {[
            { 
              id: 'home', 
              label: 'Caregiver Live Hub', 
              emoji: '🏠', 
              icon: Sparkles, 
              badge: connectionStatus.isConnected ? 'Live 🟢' : (activeAlerts.length > 0 ? `${activeAlerts.length} Alert` : 'Home') 
            },
            { 
              id: 'alerts', 
              label: 'Live Alerts & SOS Inbox', 
              emoji: '🚨', 
              icon: ShieldAlert, 
              badge: activeAlerts.length > 0 ? `${activeAlerts.length} Active` : 'Safe 🟢' 
            },
            { 
              id: 'subscription', 
              label: 'Membership & Plan', 
              emoji: '👑', 
              icon: Crown, 
              badge: isPremium ? (subscription.status === 'trial' ? `${getTrialDaysRemaining()}d Trial` : 'Premium ✓') : '30d Free' 
            },
            { 
              id: 'guide', 
              label: 'How BeeYou Works', 
              emoji: '💡', 
              icon: HelpCircle, 
              badge: 'Guide' 
            },
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
        <main className="flex-1 min-w-0 bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-xs">
          {/* Quick Access to Routine Templates Library if on another tab */}
          {activeTab !== 'routines' && activeTab !== 'subscription' && (
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

          {/* TAB: CAREGIVER LIVE HUB HOMEPAGE */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in pb-10">
              {/* 1. HERO LIVE CONNECTION & CHILD SNAPSHOT CARD */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-indigo-500/15 border-2 border-amber-300/80 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/30 border-2 border-amber-400/50 flex items-center justify-center text-3xl shadow-inner shrink-0">
                      🐝
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          {childProfile.name}'s Caregiver Command Hub
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                          connectionStatus.isConnected 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : 'bg-amber-200 text-amber-950'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${connectionStatus.isConnected ? 'bg-white animate-pulse' : 'bg-amber-600'}`} />
                          <span>{connectionStatus.isConnected ? `Connected: ${connectionStatus.peerName || 'Child Device'}` : 'Waiting for Device Connection'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Send instant nudges & alerts, receive real-time SOS notifications, and manage routines and speech support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFamilyAuthModal(true);
                        playChime('tap');
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                      title="Shared Family Email & 1-Click Demo Testing"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Family Email &amp; Demo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCameraScanner(true);
                        playChime('tap');
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                      title="Open device camera to scan pairing QR code"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Child QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('caregiver');
                        playChime('tap');
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>Pairing & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('guide');
                        playChime('tap');
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-300" />
                      <span>How It Works</span>
                    </button>
                  </div>
                </div>

                {/* Live Snapshot Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-amber-200/60 text-xs">
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Mood</span>
                    <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5 capitalize">
                      <span>{currentMood === 'happy' ? '😊' : currentMood === 'calm' ? '😌' : currentMood === 'overwhelmed' ? '😫' : currentMood === 'sad' ? '😢' : '✨'}</span>
                      <span>{currentMood || 'Happy'}</span>
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current View</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block truncate">
                      {liveChildStatus?.currentActivity || 'BeeYou Active'}
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Habits Done</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1">
                      <span>⭐</span>
                      <span>{habits.filter(h => h.completedToday).length} / {habits.length} Done</span>
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pairing Code</span>
                    <span className="text-sm font-black text-indigo-700 font-mono mt-0.5 block">
                      {getPairingCode()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. REAL-TIME SAFETY & ALERT CENTER */}
              <div className="space-y-3">
                {activeAlerts.length > 0 ? (
                  <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-3 animate-in fade-in ring-2 ring-rose-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                        </span>
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <span>🚨 Live Emergency Alert from {childProfile.name}</span>
                      </div>
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                        Action Required
                      </span>
                    </div>

                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl shrink-0 font-bold">
                              {alert.emoji || '🚨'}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900">{alert.label}</h4>
                              <p className="text-xs text-slate-500 font-medium">
                                {alert.note || 'Help requested'} {alert.location ? `• Location: ${alert.location}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleResolveAlert(alert.id)}
                              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-lg transition"
                              title="Dismiss / Mark Resolved"
                            >
                              Resolve ✓
                            </button>
                          </div>
                        </div>

                        {/* Quick 1-tap Caregiver Responses */}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Quick Reply:</span>
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAlert(alert.id, "I'm on my way! 🚗", 'coming')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer active:scale-95 shadow-2xs"
                          >
                            🚗 I'm On My Way
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAlert(alert.id, "I'm here for you ❤️ Take a deep breath.", 'im_here')}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer active:scale-95 shadow-2xs"
                          >
                            ❤️ I'm Here For You
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcknowledgeAlert(alert.id, "Give me 5 minutes, finish what you're doing ⏳", 'give_minutes')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
                          >
                            ⏳ 5 Minutes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-emerald-950">
                            Real-Time Safety &amp; Alert Center: All Clear
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                            Active Listening
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                          {connectionStatus.isConnected
                            ? `Connected to ${childProfile.name}'s device (${getPairingCode()}). Any urgent SOS or sensory alert will appear and sound here instantly.`
                            : `Listening on code ${getPairingCode()}. Ready to receive instant help calls from ${childProfile.name}.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleTriggerTestAlert}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
                        title="Simulate receiving an alert immediately"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-300" />
                        <span>Send Test Alert 🚨</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('alerts');
                          playChime('tap');
                        }}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100/50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition"
                      >
                        <Bell className="w-4 h-4 text-emerald-600" />
                        <span>Alert Inbox &amp; Log</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. REMOTE ALERT & NUDGE DISPATCHER (CAREGIVER -> CHILD TABLET) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Send className="w-5 h-5 text-indigo-600" />
                      <span>Send Instant Alert or Message to {childProfile.name}'s Tablet</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Triggers an immediate spoken toast and visual alert card on the child's screen in real time.
                    </p>
                  </div>
                </div>

                {/* 1-Tap Quick Nudges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { title: '5-Min Warning', text: '5 minutes until we leave or change activity! ⏳', emoji: '⏳', bg: 'hover:bg-amber-50 border-amber-200' },
                    { title: 'Meal / Snack Time', text: 'Time for food or snack! 🍽️', emoji: '🍽️', bg: 'hover:bg-emerald-50 border-emerald-200' },
                    { title: 'Medicine Time', text: 'Time to take your scheduled medicine 💊', emoji: '💊', bg: 'hover:bg-rose-50 border-rose-200' },
                    { title: "I'm On My Way", text: "Caregiver is on the way to pick you up 🚗", emoji: '🚗', bg: 'hover:bg-indigo-50 border-indigo-200' },
                    { title: 'Calm Breathing', text: "Let's take 3 slow, deep breaths together 🫁", emoji: '🫁', bg: 'hover:bg-sky-50 border-sky-200' },
                    { title: 'Proud of You', text: 'Super proud of you! You are doing awesome ⭐', emoji: '⭐', bg: 'hover:bg-purple-50 border-purple-200' },
                    { title: 'Plans Changed', text: 'Quick reminder: Our plans changed a little today 🔄', emoji: '🔄', bg: 'hover:bg-amber-50 border-amber-200' },
                    { title: 'Check In', text: 'How are you feeling right now? Tap your feelings! 😊', emoji: '💬', bg: 'hover:bg-blue-50 border-blue-200' },
                  ].map((nudge, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendQuickNudge(nudge.title, nudge.text, nudge.emoji)}
                      className={`p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer flex flex-col justify-between gap-1 shadow-2xs ${nudge.bg}`}
                    >
                      <div className="text-2xl">{nudge.emoji}</div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{nudge.title}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{nudge.text}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Message Composer */}
                <form onSubmit={handleSendCustomMessage} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 shrink-0 border border-slate-200">
                    {['❤️', '⭐', '🚗', '💊', '🍎', '👏'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCustomMsgEmoji(em)}
                        className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                          customMsgEmoji === em ? 'bg-white shadow-xs scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={customMsgText}
                    onChange={(e) => setCustomMsgText(e.target.value)}
                    placeholder={`Type custom message to display on ${childProfile.name}'s tablet...`}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-xs sm:text-sm font-medium"
                  />

                  <button
                    type="submit"
                    disabled={!customMsgText.trim()}
                    className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition shrink-0"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Send to Tablet</span>
                  </button>
                </form>
              </div>

              {/* 4. CAREGIVER HUB QUICK ACCESS GRID */}
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Caregiver Hub Features & Management</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    Quick Access
                  </span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { tab: 'alerts', title: 'Live Alerts & SOS Inbox', desc: 'Real-time emergency signals & response log', emoji: '🚨', color: 'from-rose-500/10 to-red-500/10 border-rose-300' },
                    { tab: 'routines', title: 'Routines & My Day', desc: 'Visual schedules & First-Then boards', emoji: '✨', color: 'from-sky-500/10 to-indigo-500/10 border-sky-200' },
                    { tab: 'aac', title: 'AAC & Vocabulary', desc: 'Manage core words & speech cards', emoji: '🗣️', color: 'from-amber-500/10 to-orange-500/10 border-amber-200' },
                    { tab: 'plans-changed', title: 'Plans Changed', desc: 'Trigger calm unexpected plan changes', emoji: '🔄', color: 'from-rose-500/10 to-amber-500/10 border-rose-200' },
                    { tab: 'medications', title: 'Medication Tracker', desc: 'Dosages, logs & low refill stock', emoji: '💊', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200' },
                    { tab: 'recollection', title: 'Daily Therapist Summary', desc: 'Export mood & daily progress reports', emoji: '📊', color: 'from-purple-500/10 to-indigo-500/10 border-purple-200' },
                    { tab: 'themes', title: 'Themes & Studio', desc: 'Wallpapers, high contrast & fonts', emoji: '🎨', color: 'from-pink-500/10 to-rose-500/10 border-pink-200' },
                    { tab: 'caregiver', title: 'Device Link & QR', desc: 'Scan QR code & manage pairing', emoji: '📱', color: 'from-indigo-500/10 to-sky-500/10 border-indigo-200' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.tab as any);
                        playChime('tap');
                      }}
                      className={`p-4 rounded-3xl bg-gradient-to-br ${item.color} border-2 text-left hover:shadow-md transition active:scale-95 cursor-pointer flex flex-col justify-between gap-3`}
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE ALERTS & SOS INBOX */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-in fade-in pb-10">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                      <span>Live Alerts &amp; SOS Inbox</span>
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      activeAlerts.length > 0 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alert` : '🟢 Safe & Clear'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Receive urgent sensory overload notices, help requests, and instant check-ins from {childProfile.name} in real time.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTriggerTestAlert}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    <span>Send Test Alert 🚨</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('home');
                      playChime('tap');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Connectivity Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    📡
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">
                      Connection Channel: <span className="font-mono text-indigo-700">{getPairingCode()}</span>
                    </span>
                    <span className="text-slate-600 font-medium">
                      Status: {connectionStatus.isConnected ? `Connected Live (${connectionStatus.peerName || 'Child Device'})` : 'Listening on cloud channel (ready for child alerts)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${connectionStatus.isConnected ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-900'}`}>
                    {connectionStatus.isConnected ? '● Connected' : 'Waiting on Child Ping'}
                  </span>
                </div>
              </div>

              {/* 1. Active Alerts Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Active Urgent Alerts</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      activeAlerts.length > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {activeAlerts.length}
                    </span>
                  </h3>
                </div>

                {activeAlerts.length === 0 ? (
                  <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                      ✓
                    </div>
                    <h4 className="text-sm font-black text-slate-800">No active alerts right now</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      When {childProfile.name} taps the Help or Sensory Overload button on their tablet, it will instantly sound a chime and show up here with 1-tap reply options.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTriggerTestAlert}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                      >
                        <span>Test Alert Simulation 🚨</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-3xl shrink-0">
                              {alert.emoji || '🚨'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-slate-900">{alert.label}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                                  Urgent
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium mt-0.5">
                                Sent by: <strong>{alert.childName}</strong> • {alert.location ? `Location: ${alert.location}` : 'Location unknown'} {alert.note ? `• "${alert.note}"` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black cursor-pointer shadow-2xs"
                            >
                              Resolve ✓
                            </button>
                          </div>
                        </div>

                        {/* Quick responses */}
                        <div className="pt-3 border-t border-rose-200/80 space-y-2">
                          <span className="text-xs font-black text-rose-950 block">
                            Send Immediate Reassurance to {alert.childName}'s Screen:
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeAlert(alert.id, "I'm on my way! 🚗", 'coming')}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5"
                            >
                              <span>🚗 I'm On My Way</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeAlert(alert.id, "I'm here for you ❤️ Take a deep breath.", 'im_here')}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5"
                            >
                              <span>❤️ I'm Here For You</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeAlert(alert.id, "Give me 5 minutes, finish what you're doing ⏳", 'give_minutes')}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5"
                            >
                              <span>⏳ 5 Minutes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeAlert(alert.id, "You are safe. Sit down and take a slow sip of water 💧", 'safe')}
                              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5"
                            >
                              <span>💧 You Are Safe</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Alert History Log Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Alert History &amp; Audit Log</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        {alertHistoryList.length} Total
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      All received alerts are permanently archived here for clinical and caregiver review.
                    </p>
                  </div>

                  {alertHistoryList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAlertHistory}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {alertHistoryList.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                    No alert history recorded yet.
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                    {alertHistoryList.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji || '🚨'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900">{item.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                {item.location || 'Device'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.childName} • {item.note || 'Help alert'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-slate-400 text-[11px] block">
                            {new Date(item.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">Archived ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Emergency Support Guide & Direct Dial */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>How Real-Time Alerts Work in BeeYou</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-900 block">1. Instant Child Trigger</span>
                    <p className="text-slate-500">
                      When child taps "Help", "Need Break", or "Sensory Overload", the alert is pushed via Server-Sent Events with fallback polling.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-900 block">2. Caregiver Sound &amp; Push</span>
                    <p className="text-slate-500">
                      Caregiver device plays an audible alert tone, triggers browser notifications, and shows the glowing red response bar.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-900 block">3. Two-Way Spoken Reply</span>
                    <p className="text-slate-500">
                      Tapping a quick response immediately speaks the caregiver's message aloud on the child's tablet so they know help is on the way.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBERSHIP & SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-8 animate-in fade-in pb-10">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">👑</span>
                    <h2 className="text-xl font-black text-slate-900">
                      BeeYou Membership & Plans
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs">
                      {subscription.billingCycle === 'yearly' ? '$129.99 / yr' : '$12.99 / mo'}
                    </span>
                    {subscription.billingCycle === 'yearly' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        2 Months Free (Save 17%)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Transparent, neurodiversity-affirming pricing with a 30-day free trial. Start with $0 today and cancel anytime.
                  </p>
                </div>

                {/* Live Tier Status Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Current Plan:</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    isPremium 
                      ? 'bg-amber-400 text-amber-950 shadow-xs' 
                      : 'bg-slate-300 text-slate-800'
                  }`}>
                    {isPremium ? (subscription.status === 'trial' ? `30d Trial (${getTrialDaysRemaining()}d left)` : `Premium (${subscription.billingCycle})`) : 'BeeYou Basic (Free)'}
                  </span>
                </div>
              </div>

              {/* Billing Switcher (Monthly vs Yearly) */}
              <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-2xl max-w-md mx-auto border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle('monthly');
                    playChime('tap');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer text-center ${
                    subscription.billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Monthly • $12.99/mo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle('yearly');
                    playChime('tap');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    subscription.billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Yearly • $129.99/yr</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    subscription.billingCycle === 'yearly' ? 'bg-amber-300 text-amber-950' : 'bg-emerald-200 text-emerald-950'
                  }`}>
                    2 Mo Free
                  </span>
                </button>
              </div>

              {/* HERO CURRENT STATUS CARD */}
              <div className={`p-6 sm:p-7 rounded-3xl border-2 relative overflow-hidden shadow-sm ${
                isPremium
                  ? 'bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-purple-500/10 border-amber-300/80'
                  : 'bg-gradient-to-br from-slate-100 via-indigo-50/50 to-sky-50/50 border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        isPremium 
                          ? 'bg-amber-400 text-amber-950' 
                          : 'bg-slate-800 text-white'
                      }`}>
                        {isPremium 
                          ? (subscription.status === 'trial' ? '✨ 30-Day Free Trial Active' : `👑 BeeYou Premium Member (${subscription.billingCycle})`)
                          : '🌱 BeeYou Basic (Free Plan)'
                        }
                      </span>
                      {isPremium && subscription.status === 'trial' && (
                        <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {getTrialDaysRemaining()} Days Remaining
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {isPremium 
                        ? (subscription.status === 'trial' ? 'Full BeeYou Premium Trial is Active' : 'BeeYou Premium Membership')
                        : 'You Are Currently on the Basic Plan'
                      }
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {isPremium
                        ? 'Your family has full, unrestricted access to all 17 sensory soundscapes, unlimited visual routines & First-Then boards, medication refill tracking, therapist IEP summaries, avatar customizer, and cloud caregiver sync.'
                        : `Basic gives you Day 1 essential AAC communication, 1 active visual routine, 1 medication tracker, and 2 calming sounds. Upgrade to BeeYou Premium for ${subscription.billingCycle === 'yearly' ? '$129.99/year (Free 2 months • $10.83/mo)' : '$12.99/month'} ($0 today with a 30-day free trial) to unlock the full clinical suite.`
                      }
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        No ads or tracking ever
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Cancel anytime in 1 tap
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        100% offline-ready & private
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
                    {!isPremium ? (
                      <button
                        onClick={() => {
                          startFreeTrial(subscription.billingCycle);
                          playChime('star');
                          setSuccessMessage(`🎉 30-Day Free Trial activated on the ${subscription.billingCycle} plan! All premium features are unlocked.`);
                          setTimeout(() => setSuccessMessage(null), 5000);
                        }}
                        className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>Start 30-Day Free Trial</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          cancelSubscription();
                          playChime('tap');
                          setSuccessMessage('Subscription reverted to BeeYou Basic.');
                          setTimeout(() => setSuccessMessage(null), 4000);
                        }}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer active:scale-95 transition-all text-center"
                      >
                        Cancel Subscription / Revert to Basic
                      </button>
                    )}

                    <div className="text-center md:text-right text-[11px] font-bold text-slate-500">
                      {!isPremium 
                        ? (subscription.billingCycle === 'yearly' ? '$129.99 / yr after trial (2 Mo Free) • $0 today' : '$12.99 / mo after trial • $0 today')
                        : (subscription.billingCycle === 'yearly' ? '$129.99 / yr • Auto-renews yearly' : '$12.99 / mo • Auto-renews monthly')
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* SUCCESS TOAST MESSAGE */}
              {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FEATURE COMPARISON MATRIX */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Feature Comparison: Basic vs. Premium</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      Side-by-side
                    </span>
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-3xl border-2 border-slate-200 shadow-xs bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-black text-slate-600 uppercase tracking-wider w-1/3">
                          Clinical & Daily Feature
                        </th>
                        <th className="p-4 text-xs font-black text-slate-600 uppercase tracking-wider w-1/3">
                          <div className="flex items-center gap-1.5">
                            <span>BeeYou Basic</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black">
                              Free
                            </span>
                          </div>
                        </th>
                        <th className="p-4 text-xs font-black text-amber-900 uppercase tracking-wider w-1/3 bg-amber-50/50">
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span>BeeYou Premium</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs">
                              $12.99 / mo
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {/* Row 1: AAC */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🗣️</span>
                            <span>AAC Speech Communication</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          36 Essential Core Tiles (everyday words)
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            Unlimited tiles, custom photo/voice uploads, quick phrases & motor planning
                          </span>
                        </td>
                      </tr>

                      {/* Row 2: Routines */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <span>Visual Schedules & Routines</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="font-semibold text-slate-700">1 Active Routine</span> ("Routines 1 is good enough")
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            Unlimited routines, Morning/School/Bedtime templates, First-Then visual rewards & step countdown timers
                          </span>
                        </td>
                      </tr>

                      {/* Row 3: Medications */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">💊</span>
                            <span>Medication Reminders & Supply</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="font-semibold text-slate-700">1 Active Medication</span> reminder
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            Unlimited medications, live pill supply count, dose logs & low-refill alerts
                          </span>
                        </td>
                      </tr>

                      {/* Row 4: Sensory Room */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎧</span>
                            <span>Sensory Room Soundscapes</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          2 Calming Sounds (Warm Rain, Ocean Waves)
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            All 17 procedural soundscapes (Rain, Ocean, Brown Noise, Stream, Crickets, Space Drone, Wind Chimes, Steam Train, Train Tracks, Car Ride, City Rain, Night Starlight, White Noise, Beach Waves, Pine Forest, Cozy Fireplace, Medieval Castle & Bard Hall)
                          </span>
                        </td>
                      </tr>

                      {/* Row 5: Avatar Customizer */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">👤</span>
                            <span>Avatar Customizer Studio</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          Default Avatar (fixed, editing locked)
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            Full Customizer Studio: 12+ hairstyles, outfits, glasses, hearing aids, sensory headphones & skin tones
                          </span>
                        </td>
                      </tr>

                      {/* Row 6: Themes */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🎨</span>
                            <span>Sensory Themes & Custom Studio</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          Classic Neutral Theme
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            All 9 sensory themes (Dinosaur, Oceanic, Turtle, Forest, Space, Train, Racing, Fantasy) + Custom Theme Studio
                          </span>
                        </td>
                      </tr>

                      {/* Row 7: Daily Recollection / Therapist */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📊</span>
                            <span>Therapist & IEP Summaries</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          7-day basic mood history view
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            1-Click Exportable Reports for Speech-Language Pathologists, OTs, & IEP School Meetings
                          </span>
                        </td>
                      </tr>

                      {/* Row 8: Caregiver Link */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">❤️</span>
                            <span>Caregiver Live Sync & Safety</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          Single offline device
                        </td>
                        <td className="p-4 font-bold text-indigo-950 bg-amber-50/30">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            Multi-device real-time sync, remote routine updates & instant sensory crisis push alerts
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK DEMO / TESTING MODE TOGGLE BAR */}
              <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Instant Subscription Switcher (Testing & Evaluation)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    Switch states instantly to test free vs. premium behaviors
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setSubscriptionTier('basic');
                      playChime('tap');
                      setSuccessMessage('Switched to BeeYou Basic (Free Plan).');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      subscription.tier === 'basic'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Simulate Basic Tier (Free)
                  </button>

                  <button
                    onClick={() => {
                      setBillingCycle('monthly');
                      startFreeTrial('monthly');
                      playChime('star');
                      setSuccessMessage('🎉 Started 30-Day Free Trial (Monthly - $12.99/mo after trial)!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      subscription.tier === 'premium' && subscription.status === 'trial' && subscription.billingCycle === 'monthly'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    Simulate 30d Trial (Monthly)
                  </button>

                  <button
                    onClick={() => {
                      setBillingCycle('yearly');
                      startFreeTrial('yearly');
                      playChime('star');
                      setSuccessMessage('🎉 Started 30-Day Free Trial (Yearly - 2 Mo Free / $129.99/yr)!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      subscription.tier === 'premium' && subscription.status === 'trial' && subscription.billingCycle === 'yearly'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    Simulate 30d Trial (Yearly - 2 Mo Free)
                  </button>

                  <button
                    onClick={() => {
                      setBillingCycle('monthly');
                      setSubscriptionTier('premium');
                      playChime('star');
                      setSuccessMessage('Activated BeeYou Premium ($12.99 / mo)!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      subscription.tier === 'premium' && subscription.status === 'active' && subscription.billingCycle === 'monthly'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-indigo-300 text-indigo-900 hover:bg-indigo-50'
                    }`}
                  >
                    Simulate Premium Monthly ($12.99/mo)
                  </button>

                  <button
                    onClick={() => {
                      setBillingCycle('yearly');
                      setSubscriptionTier('premium');
                      playChime('star');
                      setSuccessMessage('Activated BeeYou Premium Yearly ($129.99 / yr - 2 Mo Free)!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                      subscription.tier === 'premium' && subscription.status === 'active' && subscription.billingCycle === 'yearly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white border border-purple-300 text-purple-900 hover:bg-purple-50'
                    }`}
                  >
                    Simulate Premium Yearly ($129.99/yr)
                  </button>
                </div>
              </div>

              {/* FAMILY VALUES & GUARANTEE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    🛡️
                  </div>
                  <h4 className="text-xs font-black text-indigo-950">Clinical Privacy First</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Local-first storage compliant with clinical data privacy. No advertising, tracking, or selling child data.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <h4 className="text-xs font-black text-emerald-950">30-Day Free Trial</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Test the complete clinical suite with your child risk-free for 30 full days. $0 charged at sign-up.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                    🔄
                  </div>
                  <h4 className="text-xs font-black text-purple-950">1-Tap Cancellation</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Cancel anytime directly from this dashboard without tricky questions, phone calls, or penalty fees.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOW BEEYOU WORKS & CAREGIVER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-in fade-in pb-10">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                    💡
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <span>How BeeYou Works</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950">
                        Caregiver & Educator Guide
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Clear, step-by-step guidance on visual routines, timers, help alerts, and device connection.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ContextualHelpButton topic="all" label="Open Interactive Guide" variant="pill" />
                </div>
              </div>

              {/* 5-STEP QUICK START */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/10 border-2 border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-widest">
                    Quick Start in 5 Steps
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Set up in 2 minutes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="font-black text-xs text-slate-900">1. Set Up Profile</h4>
                    <p className="text-[11px] text-slate-600">Enter name and select age group (Kids, Teens, Adults).</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="font-black text-xs text-slate-900">2. Pair Device (Optional)</h4>
                    <p className="text-[11px] text-slate-600">Use a short 6-char code (e.g. K7P4-92) or scan QR to link.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="font-black text-xs text-slate-900">3. Create Morning Routine</h4>
                    <p className="text-[11px] text-slate-600">Add 3-5 simple activities: Wake up, Brush teeth, Breakfast.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="font-black text-xs text-slate-900">4. Add Visual Timers</h4>
                    <p className="text-[11px] text-slate-600">Add 2m or 5m countdowns to make transitions predictable.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1 sm:col-span-2 lg:col-span-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">5</span>
                    <h4 className="font-black text-xs text-slate-900">5. Set Up Emergency & Help Alerts</h4>
                    <p className="text-[11px] text-slate-600">Ensure notifications are enabled and test sending predefined 1-tap alerts.</p>
                  </div>
                </div>
              </div>

              {/* DOES THE PERSON I SUPPORT NEED BEEYOU? */}
              <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Does BeeYou seem right for the person I support?</span>
                </h3>
                <p className="text-xs text-slate-600">
                  BeeYou may be especially helpful if the person you support:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Benefits from visual schedules rather than spoken reminders alone',
                    'Finds transitions between activities or places abrupt or stressful',
                    'Asks "What are we doing next?" frequently',
                    'Benefits from predictable morning and bedtime routines',
                    'Needs gentle reminders to complete multi-step tasks',
                    'Has difficulty communicating verbally when overwhelmed or overstimulated',
                    'Loves visual countdown timers to know how long an activity takes',
                    'Wants an easy, non-threatening way to alert a trusted person for help',
                  ].map((sign, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{sign}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed font-medium">
                  ℹ️ <strong>Support Tool Note:</strong> BeeYou is a daily support tool designed to foster calm, structure, and independence. It does not replace professional therapy, medical care, or individualized education services.
                </div>
              </div>

              {/* INTERACTIVE STEP-BY-STEP VISUAL FEATURE WALKTHROUGH */}
              <CaregiverFeatureWalkthrough onNavigateTab={(tab) => {
                setActiveTab(tab as TabType);
              }} />
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
                  className={`px-4 py-2 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0 ${
                    !isPremium && medications.length >= 1
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {!isPremium && medications.length >= 1 ? (
                    <>
                      <Crown className="w-4 h-4 text-amber-200" />
                      <span>Upgrade for More Meds</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add New Medication</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1-Medication Basic Plan Limit Banner */}
              {!isPremium && medications.length >= 1 && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-xl shadow-xs">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Basic Plan Limit (1/1 Medication)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">Free Tier</span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium mt-0.5">
                        You are using your 1 included medication reminder. Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited medications, stock tracking, and refill alerts.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerUpgrade('Medication Reminders: The Basic plan includes 1 medication reminder. Upgrade to BeeYou Premium for unlimited medications, stock tracking, and refill alerts!')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-200" />
                    <span>Start 30-Day Free Trial</span>
                  </button>
                </div>
              )}

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

              {/* Pairing Code Card with Crisp Live QR Code */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-purple-50 to-indigo-50 border-2 border-rose-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rose-700 uppercase tracking-wider block">
                      Child's Remote Pairing Code
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      connectionStatus.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {connectionStatus.isConnected ? '🟢 Live Connected' : '⚪ Ready to Pair'}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black tracking-widest text-slate-900 font-mono select-all">
                    {getPairingCode()}
                  </div>
                  
                  <p className="text-xs text-slate-600 font-medium">
                    Scan this QR code with your phone camera or enter the 6-letter code to link instantly.
                  </p>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCameraScanner(true);
                        playChime('tap');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
                      title="Open device camera to scan pairing QR code"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan QR with Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/?caregiver=true&code=${getPairingCode()}`;
                        navigator.clipboard?.writeText(url);
                        showNotification('Caregiver portal link copied to clipboard!');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Direct Portal URL</span>
                    </button>

                    <a
                      href={`/?caregiver=true&code=${getPairingCode()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Portal In New Tab</span>
                    </a>
                  </div>
                </div>

                {/* Live High-Contrast Scannable QR Code */}
                <div className="p-4 bg-white rounded-3xl border-2 border-rose-200 shadow-sm flex flex-col items-center gap-2 shrink-0">
                  <QRCodeView 
                    value={getPairingCode()} 
                    size={180} 
                    title={`Pair with ${childProfile.name}`}
                    subtitle="Scan with phone camera"
                  />
                </div>
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
                    <span>Install BeeYou as Standalone Progressive Web App</span>
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
                      if (!isPremium && routines.length >= 1) {
                        triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!');
                        return;
                      }
                      setRoutinesSubView('create');
                      playChime('tap');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      routinesSubView === 'create'
                        ? 'bg-white text-sky-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {!isPremium && routines.length >= 1 ? (
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span>Create Custom</span>
                  </button>
                </div>
              </div>

              {/* 1-Routine Basic Plan Limit Banner */}
              {!isPremium && routines.length >= 1 && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-xl shadow-xs">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Basic Plan Limit (1/1 Routine)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">Free Tier</span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium mt-0.5">
                        The Basic plan includes 1 active visual routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines, templates, and First-Then boards.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerUpgrade('Routines: The Basic plan includes 1 routine ("Routines 1 is good enough"). Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited routines and First-Then boards!')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-200" />
                    <span>Start 30-Day Free Trial</span>
                  </button>
                </div>
              )}

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
                  type="button"
                  onClick={handleQuickAddChickenNuggets}
                  className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs flex items-center gap-1.5 border border-orange-300 shadow-xs cursor-pointer"
                >
                  <span>🍗 1-Tap Add "Chicken Nuggets"</span>
                </button>
              </div>

              {/* ONLINE AAC SYMBOL STUDIO HERO BANNER */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    🌐
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                        Clinical Standard
                      </span>
                      <span className="text-xs text-indigo-200 font-bold">
                        3,400+ Mulberry Symbols (CC BY-SA)
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black mt-0.5">
                      Online AAC Symbol & Logo Studio
                    </h3>
                    <p className="text-xs text-indigo-100 font-medium max-w-xl">
                      Access official Mulberry Symbols (CC BY-SA Straight Street / Paxtoncrafts Charitable Trust) crafted for AAC devices, or upload real photos from your camera for photo modeling.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      upgradeAllAacToClinicalSymbols();
                      showNotification('Upgraded all AAC buttons to official Mulberry Symbols!');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    title="Convert all AAC buttons to Mulberry symbols"
                  >
                    <Sparkles className="w-4 h-4 text-amber-950" />
                    <span>Apply Mulberry to All Buttons</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAacItem(null);
                      setShowSymbolPicker(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-900 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Search className="w-4 h-4 text-indigo-600" />
                    <span>Browse Online Symbols</span>
                  </button>
                </div>
              </div>

              {/* Tile Color Scheme Quick Selector in AAC Manager */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Button Background Color Mode</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Controls the background coloring of all AAC tiles across the app.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'fitzgerald', label: '🌈 Clinical Colors (Default)', title: 'Fitzgerald Key: yellow, green, orange, blue, purple' },
                    { id: 'theme', label: '🎭 Theme Colors', title: 'Matches the active theme palette' },
                    { id: 'high_contrast_white', label: '⚪ White High-Contrast', title: 'Pure white with bold borders' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        updateSettings({ aacButtonColorMode: m.id as any });
                        playChime('tap');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        (settings.aacButtonColorMode || 'fitzgerald') === m.id
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={m.title}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Word Form */}
              <form onSubmit={handleAddCustomWord} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>Create Custom AAC Button</span>
                  </h3>

                  {newWordPhotoUrl && (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>Symbol Attached ✓</span>
                    </span>
                  )}
                </div>

                {/* Symbol Preview Bar if chosen */}
                {newWordPhotoUrl && (
                  <div className="p-3 bg-white rounded-2xl border-2 border-indigo-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                        <img src={newWordPhotoUrl} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {newWordLabel || 'Selected Symbol'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">
                          {newWordPhotoUrl.startsWith('data:') ? 'Custom Photo Upload' : 'Mulberry Symbol (CC BY-SA)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewWordPhotoUrl('')}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    >
                      Clear Symbol
                    </button>
                  </div>
                )}

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
                    <label className="text-xs font-bold text-slate-600 block mb-1">Emoji Icon (Fallback):</label>
                    <input
                      type="text"
                      value={newWordEmoji}
                      onChange={(e) => setNewWordEmoji(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Color Key (Fitzgerald):</label>
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

                  <div className="flex items-end gap-2">
                    <input
                      ref={parentAacFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleParentAacPhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => parentAacFileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      title="Upload a photo from your camera or computer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAacItem(null);
                        setShowSymbolPicker(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{newWordPhotoUrl ? 'Change' : 'Online'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Child's AAC Board</span>
                </button>
              </form>

              {/* INDUSTRY STANDARD AAC PACKS */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Pre-Built AAC Standard Packs (TouchChat & LAMP Systems)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Instantly import clinically validated vocabulary collections used in speech therapy and special ed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {INDUSTRY_AAC_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{pack.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            {pack.badge}
                          </span>
                        </div>
                        <h4 className="font-black text-xs text-slate-900">{pack.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{pack.subtitle}</p>
                        <p className="text-[9px] text-indigo-600 font-bold mt-1.5">Used by: {pack.usedBy}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          importAacPack(pack.items);
                          showNotification(`Imported "${pack.title}" (${pack.items.length} words)!`);
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Import {pack.items.length} Words</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVE AAC VOCABULARY BUTTONS (CUSTOMIZE / CHANGE LOGO) */}
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      <span>Active Vocabulary Buttons ({aacItems.length})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Click "Change Symbol" on any button to swap its logo with an online Mulberry symbol or personal photo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-1">
                  {aacItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-between gap-1.5 text-center group hover:border-indigo-300 transition-all"
                    >
                      <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt={item.label} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-2xl">{item.emoji}</span>
                        )}
                      </div>

                      <div className="w-full">
                        <div className="font-black text-xs text-slate-900 truncate">{item.label}</div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 capitalize">
                          {item.colorType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 w-full pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAacItem(item);
                            setShowSymbolPicker(true);
                          }}
                          className="flex-1 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] cursor-pointer"
                          title="Change symbol for this button"
                        >
                          Change Symbol
                        </button>
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteAacItem(item.id);
                              showNotification(`Deleted "${item.label}" from AAC.`);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete custom word"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

              {/* ACCESSIBILITY & AAC BUTTON DISPLAY OPTIONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      <span>AAC Tile Colors & Accessibility</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure communication tile colors and fine-motor touch options.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    Clinical Standard Available
                  </span>
                </div>

                {/* AAC Button Background Modes */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Tile Background Color Scheme:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Fitzgerald Key */}
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ aacButtonColorMode: 'fitzgerald' });
                        playChime('tap');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                        (settings.aacButtonColorMode || 'fitzgerald') === 'fitzgerald'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-300 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">🌈</span>
                          {(settings.aacButtonColorMode || 'fitzgerald') === 'fitzgerald' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Active (Default)
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mt-2">
                          Fitzgerald Key (Clinical)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                          Color-codes tiles by speech grammar (Yellow = People, Green = Actions, Orange = Objects, Blue = Descriptors). Recommended by SLPs for visual scanning & motor planning.
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-300" title="Yellow" />
                        <span className="w-3.5 h-3.5 rounded bg-emerald-200 border border-emerald-300" title="Green" />
                        <span className="w-3.5 h-3.5 rounded bg-orange-200 border border-orange-300" title="Orange" />
                        <span className="w-3.5 h-3.5 rounded bg-sky-200 border border-sky-300" title="Blue" />
                        <span className="w-3.5 h-3.5 rounded bg-purple-200 border border-purple-300" title="Purple" />
                      </div>
                    </button>

                    {/* Option 2: Theme Tinted */}
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ aacButtonColorMode: 'theme' });
                        playChime('tap');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                        settings.aacButtonColorMode === 'theme'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-300 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">🎭</span>
                          {settings.aacButtonColorMode === 'theme' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mt-2">
                          Theme-Tinted Palette
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                          Adapts button backgrounds to match the equipped theme colors (e.g. emerald greens for turtles, sunny ambers for Leo). Great for older teens or adults seeking a unified look.
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                        <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                        <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 ml-1">Theme matching</span>
                      </div>
                    </button>

                    {/* Option 3: High Contrast White */}
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ aacButtonColorMode: 'high_contrast_white' });
                        playChime('tap');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                        settings.aacButtonColorMode === 'high_contrast_white'
                          ? 'border-indigo-600 bg-white ring-2 ring-indigo-300 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">⚪</span>
                          {settings.aacButtonColorMode === 'high_contrast_white' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mt-2">
                          High-Contrast White
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                          Pure white buttons with high-contrast dark borders. Eliminates background colors for communicators with visual sensitivities or CVI.
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                        <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                        <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                        <span className="text-[10px] font-bold text-slate-600 ml-1">High contrast</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* AAC Button Size & Grid Density Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                      AAC Button Size & Grid Density:
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Make buttons bigger for easier tapping and fine-motor needs, or smaller to fit more words on screen.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { cols: 2 as const, label: 'Jumbo', desc: 'Largest touch targets (2 cols)', icon: '🔍' },
                      { cols: 3 as const, label: 'Large', desc: 'Enlarged buttons (3 cols)', icon: '📐' },
                      { cols: 4 as const, label: 'Standard', desc: 'Balanced grid (4-5 cols)', icon: '⚖️' },
                      { cols: 6 as const, label: 'Compact', desc: 'High density (6-7 cols)', icon: '📱' },
                    ].map((preset) => {
                      const isSelected = (settings.gridColumns || 4) === preset.cols;
                      return (
                        <button
                          key={preset.cols}
                          type="button"
                          onClick={() => {
                            updateSettings({
                              gridColumns: preset.cols,
                              largeButtonMode: preset.cols <= 3,
                            });
                            playChime('tap');
                          }}
                          className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-white ring-2 ring-indigo-300 shadow-xs'
                              : 'border-slate-200 bg-white/70 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{preset.icon}</span>
                            {isSelected && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <h5 className="font-black text-xs text-slate-900">{preset.label}</h5>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{preset.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Motor & Touch Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🔲</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Extra-Large Label Text</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Enlarge text under AAC pictograms.</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.largeButtonMode}
                      onChange={(e) => updateSettings({ largeButtonMode: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </label>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">⏱️</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Touch Hold Delay</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Accidental touch / tremor protection.</p>
                      </div>
                    </div>
                    <select
                      value={settings.touchHoldDelayMs || 0}
                      onChange={(e) => updateSettings({ touchHoldDelayMs: parseInt(e.target.value) })}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-slate-50 text-slate-800"
                    >
                      <option value={0}>Instant (0 ms)</option>
                      <option value={200}>Light (200 ms)</option>
                      <option value={400}>Medium (400 ms)</option>
                    </select>
                  </div>
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

                {/* Alert Notification Channels & Customizers */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Alert & Help Customizer
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowEditAlertsModal(true)}
                      className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>⚙️ Edit Alert Buttons & Replies</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.visualAlerts ?? true}
                        onChange={(e) => updateSettings({ visualAlerts: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Visual on-screen banners</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundAlerts ?? true}
                        onChange={(e) => updateSettings({ soundAlerts: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Sound chimes on alert</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.vibrationAlerts ?? true}
                        onChange={(e) => updateSettings({ vibrationAlerts: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Vibration haptics</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.spokenAlerts ?? false}
                        onChange={(e) => updateSettings({ spokenAlerts: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Read responses aloud (TTS)</span>
                    </label>
                  </div>
                </div>

                {/* Calm Tools Customizer */}
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
                      Calm Down Tools & Breathing Pacer
                    </h4>
                    <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                      Customize second-by-second breathing timings (Box 4-4-4-4, 4-7-8) and manage personal coping strategies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditCalmModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  >
                    <span>🫁 Edit Calm Tools</span>
                  </button>
                </div>
              </div>

              {/* BACKUP & RESTORE DATA SECTION */}
              <div className="pt-6 border-t border-slate-200">
                <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        Profile Backup & Data Portability
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Offline Safe
                        </span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Export all personalized AAC symbols, voice setups, routines, skills, adventures, medication logs, and cycle data into a single offline backup file. Transfer or restore anytime across devices.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-indigo-100/80">
                    <button
                      type="button"
                      onClick={() => {
                        exportProfileBackup();
                        showNotification('Backup exported successfully!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export Backup (JSON)
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 font-bold text-xs shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-600" />
                      Restore from Backup File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleBackupUpload}
                      className="hidden"
                    />
                  </div>
                </div>
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

      {/* Online AAC Symbol & Button Studio Modal */}
      <AACSymbolPickerModal
        isOpen={showSymbolPicker}
        onClose={() => {
          setShowSymbolPicker(false);
          setEditingAacItem(null);
        }}
        initialQuery={editingAacItem ? editingAacItem.label : newWordLabel}
        initialColorType={editingAacItem ? editingAacItem.colorType : newWordColorType}
        onSelectSymbol={handlePickSymbol}
        onImportPack={(pack) => {
          importAacPack(pack.items);
          showNotification(`Imported "${pack.title}" (${pack.items.length} words)!`);
        }}
        onUpgradeAll={() => {
          upgradeAllAacToClinicalSymbols();
          showNotification('Upgraded all AAC buttons to official Mulberry Symbols!');
        }}
      />

      {/* In-App Live Camera QR Scanner */}
      <CameraQRScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={handleScanCaregiverQR}
        title="Scan Child Device QR Code"
        subtitle="Point camera at the QR code on the child's phone or tablet"
      />

      {/* Connection Feedback Modal (Success / Failure) */}
      <ConnectionFeedbackModal
        state={feedbackState}
        onClose={() => setFeedbackState(null)}
        onOpenCamera={() => setShowCameraScanner(true)}
      />

      {/* Shared Family Email & 1-Click Demo Modal */}
      <FamilyAuthModal
        isOpen={showFamilyAuthModal}
        onClose={() => setShowFamilyAuthModal(false)}
      />
    </div>
  );
};
