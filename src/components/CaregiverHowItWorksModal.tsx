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
  Info
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { BeeMascot } from './BeeYouLogo';

export type HelpTopic = 
  | 'all'
  | 'what_is_beeyou'
  | 'who_is_it_for'
  | 'does_my_child_need'
  | 'quick_start'
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
    { id: 'quick_start', title: '5-Step Quick Start Guide', icon: UserCheck, badge: 'Caregiver' },
    { id: 'who_is_it_for', title: 'Who is BeeYou for?', icon: Heart },
    { id: 'does_my_child_need', title: 'Does the person I support need BeeYou?', icon: HelpCircle },
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
            
            {/* TOPIC 1: WHAT IS BEEYOU? */}
            {activeTopic === 'what_is_beeyou' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
                  <span className="text-3xl shrink-0">🐝</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
                      Welcome to BeeYou
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-300/90 font-medium mt-1 leading-relaxed">
                      BeeYou helps you organize your day, follow routines, communicate how you feel, and ask for help when you need it.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                    The Four Core Pillars of BeeYou
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">☀️</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">1. Visual Schedules</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Follow one activity at a time without feeling overwhelmed by the entire day.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">⏱️</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">2. Visual Timers</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Gentle, visual countdowns make transitions predictable and calm.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">💬</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">3. AAC & Communication</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Speak with symbols, words, and quick phrases whenever words are hard.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🆘</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">4. Predefined Help Alerts</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        1-tap alert sends a message to your caregiver, with immediate reassuring response.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Brand Message
                  </h4>
                  <p className="text-sm font-black text-amber-900 dark:text-amber-300">
                    "You can be yourself here."
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    BeeYou is warm, supportive, and non-judgmental. There is zero pressure or baby talk.
                  </p>
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Caregivers and teachers can set up BeeYou in less than 2 minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { step: '1', title: "Create the person's profile", desc: 'Enter their name and choose their age group (Kids, Teens, or Adults).', emoji: '👤' },
                    { step: '2', title: "Connect their device (Optional)", desc: 'Use a short 6-character code (e.g. K7P4-92) or scan QR to pair an iPad or phone.', emoji: '🔗' },
                    { step: '3', title: "Start with a Morning Routine", desc: 'Add 3-5 simple activities: Wake up, Brush teeth, Get dressed, Eat breakfast.', emoji: '☀️' },
                    { step: '4', title: "Add timers where useful", desc: 'Attach a 2-minute timer to brushing teeth or getting shoes on.', emoji: '⏱️' },
                    { step: '5', title: "Set up help & contact alerts", desc: 'Verify your phone number for 1-tap alerts and test the predefined responses.', emoji: '🆘' },
                  ].map((item) => (
                    <div key={item.step} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <span>{item.title}</span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-950 dark:text-emerald-200 text-xs font-medium">
                  💡 <strong>Tip:</strong> Once these 5 steps are complete, the user can start using BeeYou right away! You can explore extra features (IEP summaries, soundscapes, themes) whenever you wish.
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    BeeYou is inclusive of anyone who benefits from visual routines, predictable steps, and accessible communication.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-3xl">🧒</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Children</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Cozy visuals, friendly bee mascot, star celebrations, and simple First/Then rewards.
                    </p>
                  </div>

                  <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-3xl">🎧</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Teens</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Calm and lo-fi styling, focused countdowns, independence habits, and zero baby talk.
                    </p>
                  </div>

                  <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-3xl">💼</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Adults</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Executive function tools, discreet calm modes, self-directed routines, and optional support contacts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Key Supported Needs
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 font-medium">
                    <li>People who benefit from visual schedules and clear step-by-step instructions.</li>
                    <li>People who use AAC (Augmentative and Alternative Communication) or find speaking difficult when stressed.</li>
                    <li>People with autism, ADHD, sensory sensitivities, or executive function differences.</li>
                    <li>People who want an easy, safe way to alert a trusted person when overwhelmed.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOPIC 4: DOES MY CHILD NEED BEEYOU? */}
            {activeTopic === 'does_my_child_need' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Does BeeYou seem right for the person I support?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Here are practical signs that visual routines and tools may be helpful:
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    'Benefits from visual schedules rather than spoken instructions alone',
                    'Has difficulty knowing what happens next or asks "What are we doing next?" frequently',
                    'Finds transitions between activities or locations stressful or abrupt',
                    'Benefits from predictable, repeatable morning and bedtime routines',
                    'Needs gentle visual reminders to complete multi-step tasks',
                    'Has difficulty communicating verbally when overwhelmed or experiencing sensory overload',
                    'Loves visual countdown timers to understand how long an activity takes',
                    'Wants an easy, non-intimidating way to ask a trusted person for help',
                  ].map((sign, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{sign}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Supportive Caregiver Note</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    BeeYou is a daily support tool created to promote autonomy, calm, and predictable connection. It does not replace professional medical care, therapy, specialized education, or individualized support services.
                  </p>
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Visual schedules turn a long, confusing day into clear, bite-sized steps.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2">
                    Core Schedule Principle: "One Step at a Time"
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Instead of worrying about the entire day at once, BeeYou highlights the <strong>NOW</strong> activity and shows what is <strong>NEXT</strong>.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    What each activity card includes:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2.5">
                      <span className="text-2xl">🪥</span>
                      <div>
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">Large Visual Icon</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Instantly recognizable</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2.5">
                      <span className="text-2xl">⏱️</span>
                      <div>
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">Optional Timer</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Shows how long it takes</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2.5">
                      <span className="text-2xl">✅</span>
                      <div>
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">Tap to Complete</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Clear satisfying checkmark</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2.5">
                      <span className="text-2xl">➡️</span>
                      <div>
                        <span className="font-bold text-xs block text-slate-900 dark:text-white">Clear Next Step</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Always know what is next</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="font-bold text-xs text-indigo-900 dark:text-indigo-300 block">First → Then Boards</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Connect an effort task with a motivating reward: (e.g. <em>First: Brush teeth 🪥 → Then: Tablet time 📱</em>).
                  </p>
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Visual timers provide a gentle, non-pressuring sense of passing time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-3xl">🥧</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Pie Clock Visual</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      The colored pie slice shrinks clockwise as time elapses. Easy to understand without reading numbers.
                    </p>
                  </div>

                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-3xl">🧘</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Sensory-Safe Chimes</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Never blares loud sirens. Uses soft star chimes or silent visual flash for sound-sensitive users.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-950 dark:text-amber-200">
                  ⏱️ <strong>Quick Action:</strong> You can start a timer on any schedule step by tapping the <strong>Start Timer</strong> button on that activity card!
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Simple, reliable communication between the user and their authorized support contact.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-200 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🆘</span>
                    <h4 className="font-black text-sm text-rose-950 dark:text-rose-200">
                      Step 1: User presses "I Need Help"
                    </h4>
                  </div>
                  <p className="text-xs text-rose-900 dark:text-rose-300 font-medium">
                    The user selects one of 5 predefined alerts (<em>I Need Help</em>, <em>I'm Overwhelmed</em>, <em>I Need a Break</em>, <em>I Want to Talk</em>, <em>I'm Okay</em>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📱</span>
                    <h4 className="font-black text-sm text-amber-950 dark:text-amber-200">
                      Step 2: Caregiver receives alert
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                    Caregiver sees the alert on their portal or device: <em>"Alex needs help."</em>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❤️</span>
                    <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                      Step 3: Caregiver taps a predefined response
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {['❤️ I\'m here', '🚗 I\'m coming', '👍 Okay', '⏳ Give me a few minutes'].map((resp) => (
                      <span key={resp} className="px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center">
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  🔒 <strong>Privacy & Simplicity:</strong> There is NO in-app open texting or chat. If phone or SMS is needed, native 📞 Call and 💬 SMS buttons open the phone's standard apps.
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
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Connect an iPad, tablet, or phone in either direction in seconds.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-1">
                      Flow A: Child / Dependent Device First
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      Tap <strong>Set up this device</strong> on the child's iPad. It generates a temporary 6-character code (e.g. <code>K7P4-92</code>) or QR code. The parent simply enters this code into their caregiver account.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200 mb-1">
                      Flow B: Caregiver First
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      Parent sets up their caregiver dashboard, taps <strong>Add Someone I Support</strong>, and generates a pairing code. The child device enters the code or scans the QR code to link immediately.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  🛡️ <strong>Independent Adults:</strong> Adults do not need a caregiver to use BeeYou. Caregiver linking is 100% optional.
                </div>
              </div>
            )}

            {/* TOPIC 9: NOTIFICATIONS & SENSORY SOUNDS */}
            {activeTopic === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Configuring Notification & Alert Settings
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Customize alerts to respect individual sensory sensitivities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                    <Eye className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Visual Alerts</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Clean banners and full-screen color-coded prompts.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sound Effects</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Gentle chimes. Can be toggled completely off for silence.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                    <Vibrate className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Vibration Haptics</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tactile buzz feedback on supported mobile devices.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Spoken Voice Alerts</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Speaks aloud caregiver responses and routine step updates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  ⚙️ <strong>Where to adjust:</strong> Go to <strong>Accessibility & Sensory Preferences</strong> or <strong>Parent Dashboard &gt; Settings</strong> at any time.
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
