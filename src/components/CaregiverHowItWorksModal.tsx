import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  Timer, 
  ShieldAlert, 
  Smartphone, 
  Heart, 
  Volume2, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Search,
  Play,
  RotateCcw,
  Bell,
  VolumeX,
  Vibrate,
  Eye,
  Info,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';
import { CaregiverFeatureWalkthrough } from './CaregiverFeatureWalkthrough';

export type HelpTopic = 
  | 'all'
  | 'what_is_beeyou'
  | 'visual_walkthrough'
  | 'quick_start'
  | 'who_is_it_for'
  | 'does_my_child_need'
  | 'aac_guide'
  | 'schedules'
  | 'timers'
  | 'alerts'
  | 'device_connection'
  | 'notifications'
  | 'sample_demo';

export interface CaregiverHowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: HelpTopic;
}

export type ContextualHelpModalProps = CaregiverHowItWorksModalProps;

export const CaregiverHowItWorksModal: React.FC<CaregiverHowItWorksModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'what_is_beeyou',
}) => {
  const [activeTopic, setActiveTopic] = useState<HelpTopic>(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Routine Interactive Sandbox State
  const [sampleSteps, setSampleSteps] = useState([
    { id: '1', title: 'Wake up & stretch', emoji: '☀️', duration: 2, completed: false },
    { id: '2', title: 'Brush teeth', emoji: '🪥', duration: 2, completed: false },
    { id: '3', title: 'Get dressed', emoji: '👕', duration: 5, completed: false },
    { id: '4', title: 'Eat breakfast', emoji: '🥞', duration: 15, completed: false },
    { id: '5', title: 'Pack backpack', emoji: '🎒', duration: 3, completed: false },
  ]);
  const [sampleTimerActive, setSampleTimerActive] = useState(false);
  const [sampleTimerSec, setSampleTimerSec] = useState(120);

  // Sync initial topic when opening
  React.useEffect(() => {
    if (isOpen && initialTopic) {
      setActiveTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  // Sample timer ticker
  React.useEffect(() => {
    let interval: any = null;
    if (sampleTimerActive && sampleTimerSec > 0) {
      interval = setInterval(() => {
        setSampleTimerSec((prev) => prev - 1);
      }, 1000);
    } else if (sampleTimerSec === 0 && sampleTimerActive) {
      setSampleTimerActive(false);
      playChime('complete');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sampleTimerActive, sampleTimerSec]);

  if (!isOpen) return null;

  const topics: Array<{
    id: HelpTopic;
    title: string;
    icon: any;
    badge?: string;
  }> = [
    { id: 'what_is_beeyou', title: 'What is BeeYou?', icon: Sparkles },
    { id: 'visual_walkthrough', title: 'Step-by-Step Feature Visuals & Screenshots', icon: BookOpen, badge: 'Visuals & Clicks' },
    { id: 'quick_start', title: '5-Step Quick Start Guide', icon: UserCheck, badge: 'Caregiver' },
    { id: 'who_is_it_for', title: 'Who is BeeYou for?', icon: Heart },
    { id: 'does_my_child_need', title: 'Does the person I support need BeeYou?', icon: HelpCircle },
    { id: 'aac_guide', title: 'How to use AAC & Communication', icon: MessageSquare, badge: 'AAC' },
    { id: 'schedules', title: 'How do Schedules work?', icon: Calendar },
    { id: 'timers', title: 'How do Timers work?', icon: Timer },
    { id: 'alerts', title: 'How do Help Alerts work?', icon: ShieldAlert },
    { id: 'device_connection', title: 'How to Connect Devices', icon: Smartphone },
    { id: 'notifications', title: 'Alert & Sound Settings', icon: Bell },
    { id: 'sample_demo', title: 'Try Sample Routine (Demo)', icon: Play, badge: 'Interactive' },
  ];

  const filteredTopics = searchQuery.trim() === ''
    ? topics
    : topics.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleToggleSampleStep = (id: string) => {
    playChime('tap');
    setSampleSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleResetSample = () => {
    playChime('tap');
    setSampleSteps((prev) => prev.map((s) => ({ ...s, completed: false })));
    setSampleTimerActive(false);
    setSampleTimerSec(120);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-guide-title"
      className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF8F5] dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] h-full sm:h-auto flex flex-col shadow-2xl border-2 border-amber-200/90 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <BeeMascot size="sm" pose="reading" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Help & Guide
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  How BeeYou Works
                </span>
              </div>
              <h2 id="help-guide-title" className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Simple Guide for Users, Caregivers & Teachers
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g., routines, alerts, timers, pairing)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* MAIN BODY: 2 COLUMN (SIDEBAR + CONTENT) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 bg-slate-50/80 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setActiveTopic(topic.id);
                    playChime('tap');
                  }}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-950' : 'text-amber-600'}`} />
                    <span className="truncate">{topic.title}</span>
                  </div>
                  {topic.badge && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                      isSelected ? 'bg-amber-950/20 text-amber-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {topic.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-850">
            
            {/* TOPIC: VISUAL FEATURE WALKTHROUGH & SCREENSHOTS */}
            {activeTopic === 'visual_walkthrough' && (
              <div className="space-y-4 animate-in fade-in">
                <CaregiverFeatureWalkthrough onNavigateTab={() => {
                  onClose();
                }} />
              </div>
            )}

            {/* TOPIC 1: WHAT IS BEEYOU? */}
            {activeTopic === 'what_is_beeyou' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
                  <span className="text-3xl shrink-0">🐝</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
                      Welcome to BeeYou
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 font-medium mt-0.5">
                      BeeYou helps organize your day, follow routines, communicate, and ask for help.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    The 4 Core Pillars
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">☀️</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">1. Visual Schedules</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Follow 1 activity at a time without whole-day overwhelm.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">⏱️</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">2. Visual Timers</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Gentle disk countdowns make transitions predictable and calm.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">💬</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">3. AAC Talker</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Speak with symbols, words, and phrases 100% offline.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🆘</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">4. 1-Tap Help Alerts</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Instant message to caregiver with reassuring voice replies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                      "You can be yourself here."
                    </span>
                    <span className="text-xs text-slate-500">— Safe, warm, and pressure-free.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TOPIC 2: 5-STEP QUICK START GUIDE */}
            {activeTopic === 'quick_start' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Get Started in 5 Simple Steps
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Caregivers and teachers can set up BeeYou in under 2 minutes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { step: '1', title: "Create Profile", desc: 'Enter name and pick age group (Kids, Teens, Adults).', emoji: '👤' },
                    { step: '2', title: "Pair Device (Optional)", desc: 'Scan QR or enter 6-character code (e.g. K7P4-92).', emoji: '🔗' },
                    { step: '3', title: "Add Morning Routine", desc: 'Add 3–5 steps: Wake up, Brush teeth, Get dressed, Breakfast.', emoji: '☀️' },
                    { step: '4', title: "Add Visual Timers", desc: 'Attach countdown timers to transition activities.', emoji: '⏱️' },
                    { step: '5', title: "Test Help Alerts", desc: 'Verify notifications and test 1-tap reassuring replies.', emoji: '🆘' },
                  ].map((item) => (
                    <div key={item.step} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.emoji}</span>
                          <span>{item.title}</span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium truncate sm:whitespace-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-950 dark:text-emerald-200 text-xs font-medium">
                  💡 <strong>Ready to go:</strong> Once these 5 steps are set, the app is ready for daily use!
                </div>
              </div>
            )}

            {/* TOPIC 3: WHO IS IT FOR? */}
            {activeTopic === 'who_is_it_for' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Who is BeeYou For?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inclusive of anyone who benefits from visual structure and accessible communication.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-2xl">🧒</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Children</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Cozy visuals, friendly bee mascot, and First/Then rewards.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-2xl">🎧</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Teens</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Calm styling, focus countdowns, and independence habits.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-2xl">💼</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Adults</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Executive function tools, discreet calm modes, and self-directed routines.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Key Supported Needs:
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 font-medium">
                    <li>People who benefit from visual schedules and step-by-step routines.</li>
                    <li>People who use AAC or find speaking difficult when stressed or tired.</li>
                    <li>People with autism, ADHD, sensory sensitivities, or executive function differences.</li>
                    <li>People who need an easy 1-tap way to alert a trusted person when overwhelmed.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOPIC 4: DOES MY CHILD NEED BEEYOU? */}
            {activeTopic === 'does_my_child_need' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Does the person I support need BeeYou?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Helpful checklist to identify if visual routines and tools are a good fit:
                  </p>
                </div>

                <div className="space-y-1.5">
                  {[
                    'Benefits from visual schedules rather than spoken instructions alone',
                    'Frequently asks "What are we doing next?"',
                    'Finds transitions between activities or places abrupt or stressful',
                    'Benefits from predictable morning and bedtime routines',
                    'Needs visual step-by-step prompts to finish tasks',
                    'Struggles to speak verbally when overwhelmed or overstimulated',
                    'Benefits from visual countdown timers to see time elapse',
                    'Wants an easy, non-intimidating way to ask for help',
                  ].map((sign, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{sign}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 text-xs font-medium">
                  ℹ️ <strong>Note:</strong> BeeYou is a daily support tool for autonomy and calm. It does not replace medical or therapy services.
                </div>
              </div>
            )}

            {/* TOPIC 5: HOW DO SCHEDULES WORK? */}
            {activeTopic === 'schedules' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    How Visual Schedules Work
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Turns daily routines into clear, bite-sized visual steps.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1">
                    "One Step at a Time"
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Highlights the <strong>NOW</strong> activity and clearly shows what comes <strong>NEXT</strong> to avoid overwhelm.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                    <span className="text-xl">🪥</span>
                    <div>
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">Visual Icon</span>
                      <span className="text-[10px] text-slate-500">Fast recognition</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">Step Timer</span>
                      <span className="text-[10px] text-slate-500">Shows remaining time</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <div>
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">Tap Done</span>
                      <span className="text-[10px] text-slate-500">Satisfying checkmark</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2">
                    <span className="text-xl">➡️</span>
                    <div>
                      <span className="font-bold text-xs block text-slate-900 dark:text-white">Next Activity</span>
                      <span className="text-[10px] text-slate-500">Always predictable</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 block">First → Then Boards:</span>
                  <span className="text-slate-600 dark:text-slate-400">Connect a task with a reward (e.g. <em>First: Brush teeth 🪥 → Then: Tablet time 📱</em>).</span>
                </div>
              </div>
            )}

            {/* TOPIC: HOW TO USE AAC & SPEECH COMMUNICATION */}
            {activeTopic === 'aac_guide' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    How AAC & Speech Works
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Motor-stable symbol board with instant on-device speech that works 100% offline.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">🗣️</span>
                      <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">1. Instant Symbol Speech</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Tap any tile to speak immediately. Fixed motor positions build reliable muscle memory.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">📝</span>
                      <h4 className="font-bold text-xs text-sky-950 dark:text-sky-200">2. Sentence Strip</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Selected tiles line up in sequence. Tap <strong>Speak 🔊</strong> to read the complete sentence aloud.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">🎨</span>
                      <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200">3. Custom Photos & Words</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Upload photos of family, pets, snacks, and school items in Caregiver Hub → AAC.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">⌨️</span>
                      <h4 className="font-bold text-xs text-purple-950 dark:text-purple-200">4. Quick Phrases & Keyboard</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Instant emergency phrases and large-button keyboard for emerging writers.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                  📴 <strong>100% Offline & Private:</strong> All speech runs on-device. No internet or external servers required.
                </div>
              </div>
            )}

            {/* TOPIC 6: HOW DO TIMERS WORK? */}
            {activeTopic === 'timers' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    How Visual Timers Work
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provides a gentle, non-pressuring visual countdown of passing time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-2xl">🥧</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Pie Clock Visual</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Colored disk shrinks clockwise. Easy to understand without reading numbers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-2xl">🧘</span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">Sensory-Safe Chimes</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Soft star chimes or silent visual flash. Never uses harsh or loud alarms.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-950 dark:text-amber-200">
                  ⏱️ <strong>Quick Action:</strong> Tap <strong>Start Timer</strong> directly on any routine step card!
                </div>
              </div>
            )}

            {/* TOPIC 7: HOW DO HELP ALERTS WORK? */}
            {activeTopic === 'alerts' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    How Help Alerts Work
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Safe 1-tap communication lifeline between dependent and caregiver.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5">
                    <span className="text-xl shrink-0">🆘</span>
                    <div>
                      <h4 className="font-black text-xs text-rose-950 dark:text-rose-200">1. User Taps Alert</h4>
                      <p className="text-xs text-rose-900 dark:text-rose-300 font-medium mt-0.5">
                        Selects: <em>Need Help</em>, <em>Overwhelmed</em>, <em>Need a Break</em>, <em>Want to Talk</em>, or <em>I'm Okay</em>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5">
                    <span className="text-xl shrink-0">📱</span>
                    <div>
                      <h4 className="font-black text-xs text-amber-950 dark:text-amber-200">2. Caregiver Notified</h4>
                      <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-0.5">
                        Instant notification banner appears on caregiver device: <em>"Leo needs help."</em>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">❤️</span>
                      <h4 className="font-black text-xs text-emerald-950 dark:text-emerald-200">3. 1-Tap Reassuring Response</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {['❤️ I\'m here', '🚗 Coming', '👍 Okay', '⏳ In a few mins'].map((resp) => (
                        <span key={resp} className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-emerald-300 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 text-center">
                          {resp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  🔒 <strong>Privacy:</strong> No in-app open chat. Native 📞 Call and 💬 SMS buttons open phone apps if needed.
                </div>
              </div>
            )}

            {/* TOPIC 8: DEVICE CONNECTION */}
            {activeTopic === 'device_connection' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Connecting Devices (Two-Way Pairing)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect an iPad, tablet, or phone in seconds.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-0.5">
                      Flow A: Child Device First
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Tap <strong>Connect Caregiver</strong> on child's tablet for a 6-character code (e.g. <code>K7P4-92</code>) or QR. Enter code into Caregiver Hub.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200 mb-0.5">
                      Flow B: Caregiver First
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      In Caregiver Hub, tap <strong>Add Someone I Support</strong>, generate code, and enter it on the child tablet.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  🛡️ <strong>Independent Adults:</strong> Caregiver linking is 100% optional. Adults can use BeeYou independently.
                </div>
              </div>
            )}

            {/* TOPIC 9: NOTIFICATIONS & SENSORY SOUNDS */}
            {activeTopic === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Notification & Sound Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize alerts to match individual sensory preferences.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-2.5">
                    <Eye className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Visual Alerts</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Clean banners and color cues.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-2.5">
                    <Volume2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sound Effects</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Gentle chimes or complete silence.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-2.5">
                    <Vibrate className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Vibration</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tactile buzz on mobile devices.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-2.5">
                    <Volume2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Voice Alerts</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Speaks replies & step updates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  ⚙️ <strong>Where to change:</strong> Adjust anytime in <strong>Sensory Preferences</strong> or <strong>Parent Dashboard &gt; Settings</strong>.
                </div>
              </div>
            )}

            {/* TOPIC 10: SAMPLE DEMO SANDBOX */}
            {activeTopic === 'sample_demo' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Try a Sample Morning Routine
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Test how visual schedules and timers feel without changing your real account.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSample}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample</span>
                  </button>
                </div>

                {/* Sample Timer Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-2 border-amber-300/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪥</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                        Interactive Step Timer
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        Brush teeth (2 min)
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-amber-950 dark:text-amber-300 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-amber-200">
                      {Math.floor(sampleTimerSec / 60)}:{(sampleTimerSec % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => {
                        setSampleTimerActive(!sampleTimerActive);
                        playChime('tap');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer shadow-xs ${
                        sampleTimerActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {sampleTimerActive ? 'Pause' : 'Start Timer'}
                    </button>
                  </div>
                </div>

                {/* Sample Steps Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Sample Schedule Steps (Tap to check off)
                  </span>
                  {sampleSteps.map((step) => (
                    <div
                      key={step.id}
                      onClick={() => handleToggleSampleStep(step.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        step.completed
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 line-through opacity-80'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-white border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{step.emoji}</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {step.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          {step.duration}m
                        </span>
                        <span className="text-sm">
                          {step.completed ? '✅' : '⬜'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {sampleSteps.every((s) => s.completed) && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500 text-white text-center font-black text-xs animate-in zoom-in-95">
                    🎉 Great job! You completed all steps in the sample routine!
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            BeeYou • All-in-one personalized daily support
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 ml-auto"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
