import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  FolderPlus, 
  Camera, 
  Volume2, 
  Type, 
  EyeOff, 
  Hand, 
  RotateCcw, 
  ArrowRight, 
  Check, 
  Star,
  ChevronRight,
  Sliders,
  Shield,
  MousePointer,
  Timer,
  Lightbulb,
  Mail,
  Copy
} from 'lucide-react';
import { DwellMode, STORAGE_KEYS, CaregiverHelpTopicId } from '../../types/aac';
import { playChime, speakText } from '../../utils/audio';
import { LegalModal } from '../LegalModals';

interface CaregiverHelpHubProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayTour: () => void;
  onTriggerSpotlight?: (selector: string) => void;
}

interface TopicDetail {
  id: CaregiverHelpTopicId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  summary: string;
  steps: string[];
  targetSelector?: string;
}

const TOPICS: TopicDetail[] = [
  {
    id: 'create_folder',
    title: 'How to Create a Folder',
    icon: FolderPlus,
    badge: 'Organization',
    summary: 'Organize related vocabulary (e.g. Lunch, Playground, Sensory) to keep grids uncluttered.',
    steps: [
      'Navigate to the category or screen where you want the new folder.',
      'Tap the Caregiver Shield icon or long-press the edit button to unlock editing.',
      'Tap "+ Add Folder", choose a friendly icon, and name it.',
      'The folder creates a sub-grid while keeping the "Home" breadcrumb pinned on top.',
    ],
    targetSelector: '[data-tour="aac-categories"]',
  },
  {
    id: 'add_photo_tile',
    title: 'How to Add a Photo Tile',
    icon: Camera,
    badge: 'Personalization',
    summary: 'Snap real photos of your child\'s favorite comfort items, family members, or snacks.',
    steps: [
      'Tap "+ Add Word / Tile" inside any folder or grid section.',
      'Choose "Camera" to take a photo or "Upload" from your device library.',
      'BeeYou\'s AI background remover automatically isolates the subject into a clean clay tile.',
      'Assign the spoken phrase (e.g. "My blue blanket") and tap Save.',
    ],
    targetSelector: '[data-tour="aac-symbols"]',
  },
  {
    id: 'custom_words_tts',
    title: 'Custom Words & Phonetic TTS',
    icon: Volume2,
    badge: 'Voice Tuning',
    summary: 'Fine-tune phonetic spellings so unique family nicknames or non-English words sound authentic.',
    steps: [
      'In the Tile Editor, look for the "Phonetic Pronunciation" field under the word label.',
      'Type how the word sounds phonetically (e.g., label: "Reyansh", phonetic: "Ray-ahn-sh").',
      'Tap the speaker icon to preview the pronunciation in real-time.',
      'Optionally record your own family member\'s voice for personal emotional comfort.',
    ],
    targetSelector: '[data-tour="aac-word-editor"]',
  },
  {
    id: 'grammar_forms',
    title: 'Grammar Forms (Hold-to-Conjugate)',
    icon: Type,
    badge: 'Language Growth',
    summary: 'Teach tense agreement and natural morphology without adding dozens of duplicate buttons.',
    steps: [
      'Action words (verbs) support hold-to-expand morphology.',
      'Press and hold any verb (e.g., "EAT") for 0.4 seconds.',
      'A popover appears showing past tense ("Ate"), present participle ("Eating"), and 3rd person ("Eats").',
      'Tapping the desired form inserts that exact tense into the sentence strip.',
    ],
    targetSelector: '[data-tour="aac-grammar"]',
  },
  {
    id: 'mask_dim_tiles',
    title: 'How to Mask / Dim Tiles',
    icon: EyeOff,
    badge: 'Sensory Pacing',
    summary: 'Temporarily hide advanced words to reduce cognitive load while preserving motor memory positions.',
    steps: [
      'Unlock the board with your Caregiver PIN (default: 1234).',
      'Tap the "Mask / Dim Tiles" tool in the board settings menu.',
      'Tap any buttons you wish to dim or hide for this session.',
      'Crucially, other buttons will NOT shift or reorganize, keeping muscle memory protected!',
    ],
    targetSelector: '[data-tour="aac-masking"]',
  },
  {
    id: 'touch_ergonomics',
    title: 'Touch Ergonomics (Dwell & Release)',
    icon: Hand,
    badge: 'Motor Accommodations',
    summary: 'Accommodate tremors, involuntary spasms, or resting hands with specialized touch modes.',
    steps: [
      'Direct Touch: Activates the instant finger touches the glass (standard).',
      'Dwell Mode: Requires resting on the button for 0.5s–1.5s with visual fill timer.',
      'Touch on Release: Only speaks when the finger lifts, ideal for dragging or resting palms.',
      'Test your preferred mode on the interactive touch pad below!',
    ],
    targetSelector: '[data-tour="aac-ergonomics"]',
  },
];

export const CaregiverHelpHub: React.FC<CaregiverHelpHubProps> = ({
  isOpen,
  onClose,
  onReplayTour,
  onTriggerSpotlight,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<CaregiverHelpTopicId>('create_folder');
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Dwell mode state
  const [dwellMode, setDwellMode] = useState<DwellMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DWELL_MODE);
      if (saved === 'dwell' || saved === 'release' || saved === 'direct') return saved;
    } catch {}
    return 'direct';
  });

  // Interactive Touch Ergonomics Sandbox
  const [testPadStatus, setTestPadStatus] = useState<string>('Touch to test');
  const [dwellProgress, setDwellProgress] = useState<number>(0);
  const dwellTimerRef = React.useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      playChime('tap');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];

  const handleSelectDwellMode = (mode: DwellMode) => {
    setDwellMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.DWELL_MODE, mode);
      window.dispatchEvent(new CustomEvent('beeyou_dwell_mode_change', { detail: { mode } }));
    } catch {}
    playChime('tap');
  };

  // Test pad handlers for Dwell and Release modes
  const handleTestPadPointerDown = () => {
    if (dwellMode === 'direct') {
      setTestPadStatus('Direct Touch Activated!');
      playChime('star');
      speakText('Direct Touch');
    } else if (dwellMode === 'dwell') {
      setTestPadStatus('Dwelling... hold steady');
      setDwellProgress(0);
      const startTime = Date.now();
      const duration = 1000; // 1 second dwell
      dwellTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));
        setDwellProgress(progress);
        if (progress >= 100) {
          clearInterval(dwellTimerRef.current);
          setTestPadStatus('Dwell Complete!');
          playChime('complete');
          speakText('Dwell activated');
        }
      }, 50);
    } else if (dwellMode === 'release') {
      setTestPadStatus('Holding... (Lift finger to trigger)');
    }
  };

  const handleTestPadPointerUp = () => {
    if (dwellMode === 'dwell') {
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
      if (dwellProgress < 100) {
        setTestPadStatus('Lifted too soon. Try again.');
        setDwellProgress(0);
      }
    } else if (dwellMode === 'release') {
      setTestPadStatus('Touch Released!');
      playChime('complete');
      speakText('Touch on release');
    }
  };

  const handleSpotlightClick = () => {
    if (currentTopic.targetSelector && onTriggerSpotlight) {
      onTriggerSpotlight(currentTopic.targetSelector);
      onClose();
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-hub-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 select-none text-slate-800"
    >
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-[#FAF8F5] border-3 border-amber-300 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-100 shadow-xs">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="caregiver-hub-title" className="text-base sm:text-lg font-black tracking-tight">
                  Caregiver Help Hub
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                  Quick Guides
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Quick 15-second visual reminders whenever you need them.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
            title="Close Caregiver Hub"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: TOPIC SELECTION LIST */}
          <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-amber-200/80 bg-white/60 p-3 sm:p-4 overflow-y-auto space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 px-2 block mb-2">
              Interactive Topics
            </span>

            {TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopicId;
              const TopicIcon = topic.icon;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    setSelectedTopicId(topic.id);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-black shadow-xs'
                      : 'bg-white hover:bg-amber-50/50 border-stone-200/80 text-stone-700 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                      <TopicIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm truncate leading-tight">
                        {topic.title}
                      </div>
                      <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">
                        {topic.badge}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-700 translate-x-0.5' : 'text-stone-400'}`} />
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: TOPIC DETAIL CARD & DEMO */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FAF8F5]">
            
            {/* Topic Header & Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <currentTopic.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {currentTopic.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {currentTopic.summary}
                </p>
              </div>

              {currentTopic.targetSelector && onTriggerSpotlight && (
                <button
                  type="button"
                  onClick={handleSpotlightClick}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs flex items-center gap-1 border border-amber-300 shadow-2xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>Show in App</span>
                </button>
              )}
            </div>

            {/* Step-by-Step Guidance Box */}
            <div className="p-4 rounded-3xl bg-white border-2 border-amber-200/90 shadow-2xs space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                15-Second Action Guide
              </span>
              <div className="space-y-2.5">
                {currentTopic.steps.map((st, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                      {st}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SPECIAL INTERACTIVE DEMO: TOUCH ERGONOMICS SANDBOX */}
            {currentTopic.id === 'touch_ergonomics' && (
              <div className="p-4 rounded-3xl bg-amber-100/60 border-2 border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Touch Mode Configuration
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-300">
                    Active: {dwellMode}
                  </span>
                </div>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'direct' as const, label: 'Direct Touch', desc: 'Instant touch' },
                    { id: 'dwell' as const, label: 'Dwell Time', desc: 'Hold 1 sec' },
                    { id: 'release' as const, label: 'On Release', desc: 'Triggers on lift' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectDwellMode(m.id)}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        dwellMode === m.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102 font-black'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 font-bold'
                      }`}
                    >
                      <div className="text-xs font-black">{m.label}</div>
                      <div className={`text-[10px] mt-0.5 ${dwellMode === m.id ? 'text-amber-100' : 'text-stone-400'}`}>
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Live Interactive Test Pad */}
                <div className="p-4 bg-white rounded-2xl border border-amber-200 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-extrabold text-stone-500">
                    Interactive Touch Test Pad:
                  </span>

                  <button
                    type="button"
                    onPointerDown={handleTestPadPointerDown}
                    onPointerUp={handleTestPadPointerUp}
                    className="relative w-full max-w-xs h-20 rounded-3xl border-3 border-amber-400 bg-gradient-to-b from-white to-amber-50 text-amber-950 font-black text-sm flex items-center justify-center shadow-[0_6px_0_0_#D97706,0_10px_20px_rgba(217,119,6,0.15)] active:translate-y-1 active:shadow-[0_2px_0_0_#D97706] cursor-pointer transition-all overflow-hidden"
                  >
                    {/* Dwell Progress Bar Fill */}
                    {dwellMode === 'dwell' && (
                      <div 
                        className="absolute left-0 inset-y-0 bg-emerald-400/40 transition-all pointer-events-none"
                        style={{ width: `${dwellProgress}%` }}
                      />
                    )}
                    <span className="relative z-10">{testPadStatus}</span>
                  </button>

                  <span className="text-[10px] text-stone-400 font-medium">
                    {dwellMode === 'dwell' ? 'Hold finger down until green fill completes' : dwellMode === 'release' ? 'Press down and release' : 'Tap once for instant audio'}
                  </span>
                </div>
              </div>
            )}

            {/* Pro-Tip Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-950 font-bold">
              <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                All configurations are saved immediately to your browser and sync to connected caregiver tablets.
              </span>
            </div>

            {/* Customer Support & Contact Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                    Customer Support &amp; Feedback
                  </h4>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 font-medium">
                    Need help, encounter an issue, or want to request a feature? We respond within 24 hours.
                  </p>
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-300 text-xs mt-0.5 inline-block">
                    support@beeyou.app
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href="mailto:support@beeyou.app?subject=BeeYou%20Support%20Request"
                  onClick={() => playChime('tap')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Support</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    playChime('star');
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText('support@beeyou.app').catch(() => {});
                    }
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2500);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  title="Copy support email address"
                  aria-label="Copy support email address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER ACTION BAR */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-amber-50 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                setLegalTab('privacy');
              }}
              className="font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
            >
              <span>Privacy Policy (COPPA)</span>
            </button>
            <span className="text-amber-300">•</span>
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                setLegalTab('terms');
              }}
              className="font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
            >
              <span>Terms of Service</span>
            </button>
            <span className="text-amber-300">•</span>
            <a
              href="mailto:support@beeyou.app"
              onClick={() => playChime('tap')}
              className="font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
            >
              <span>support@beeyou.app</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onClose();
              onReplayTour();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all ml-auto"
          >
            <span>Replay Onboarding Tour</span>
          </button>
        </div>

      </div>

      {legalTab && (
        <LegalModal
          isOpen={Boolean(legalTab)}
          onClose={() => setLegalTab(null)}
          initialTab={legalTab}
        />
      )}
    </div>
  );
};
