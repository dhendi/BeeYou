import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';
import { 
  Calendar, 
  MessageSquare, 
  ShieldAlert, 
  Smartphone, 
  Timer, 
  Heart, 
  Smile, 
  Sparkles, 
  Pill, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Volume2, 
  Play, 
  ArrowRight, 
  Lock, 
  Eye, 
  HelpCircle, 
  Activity, 
  Check, 
  RotateCcw, 
  Info,
  ChevronRight,
  ExternalLink,
  Flame,
  Search,
  Bell
} from 'lucide-react';
import { BeeMascot } from './BeeYouLogo';

export type GuideFeatureId = 
  | 'all'
  | 'routines'
  | 'aac'
  | 'alerts'
  | 'pairing'
  | 'pie_timer'
  | 'fidgets'
  | 'five_point'
  | 'spoon_budget'
  | 'medications'
  | 'passport'
  | 'feature_toggles';

interface CaregiverFeatureWalkthroughProps {
  onNavigateTab?: (tab: string) => void;
}

export const CaregiverFeatureWalkthrough: React.FC<CaregiverFeatureWalkthroughProps> = ({
  onNavigateTab
}) => {
  const {
    setShowFivePointModal,
    setShowPieTimerModal,
    setShowFidgetModal,
    setShowSpoonModal,
    setShowPassportModal,
    setShowToolsHubModal,
    setShowCaregiverModal,
    setShowAccessibilityModal,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<GuideFeatureId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const featuresList = [
    {
      id: 'routines',
      title: 'Visual Schedules & Step-by-Step Routines',
      badge: 'Core Routine',
      icon: '📅',
      summary: 'Break morning, school, and bedtime into bite-sized visual steps with icons, timers, and sticker unlocks so users never feel overwhelmed.',
      steps: [
        { step: 1, title: 'Open Routines Tab', desc: 'In Caregiver Dashboard tap "Routines", or in user app tap "My Day".', clickTarget: 'Tap "Routines" or "My Day"' },
        { step: 2, title: 'Choose or Add Routine', desc: 'Select Morning Routine, School, Bedtime, or tap "+ New Routine".', clickTarget: 'Select Morning Routine' },
        { step: 3, title: 'Customize Steps & Timers', desc: 'Add steps like "Brush teeth 🪥" with 2m duration and optional voice prompts.', clickTarget: 'Add Step & Set Timer' },
        { step: 4, title: 'Complete & Celebrate', desc: 'User taps checkmarks to finish steps and unlocks a celebratory mascot sticker!', clickTarget: 'Tap Checkmark ✓' },
      ],
      mockupType: 'routine',
      actionLabel: 'Open Routines Builder',
      actionTab: 'routines',
    },
    {
      id: 'aac',
      title: 'Mulberry AAC & Offline Speech Talker',
      badge: 'Communication',
      icon: '🗣️',
      summary: 'High-clarity picture tiles with a consistent motor layout and instant on-device text-to-speech that works 100% offline.',
      steps: [
        { step: 1, title: 'Open Communicate Screen', desc: 'Tap "Communicate" in the bottom navigation to open the AAC board.', clickTarget: 'Tap "Communicate"' },
        { step: 2, title: 'Browse Category Tabs', desc: 'Select Favorites, Food, Activities, Feelings, or search for any word.', clickTarget: 'Select Category (e.g. Food)' },
        { step: 3, title: 'Build Sentence Strip', desc: 'Tap tiles (e.g. "I want" + "Apple") to line them up in the top sentence strip.', clickTarget: 'Tap Symbol Tile' },
        { step: 4, title: 'Speak Aloud 🔊', desc: 'Tap the sentence strip or the Speak button to read the sentence with natural audio.', clickTarget: 'Tap "Speak 🔊"' },
        { step: 5, title: 'Add Custom Photos', desc: 'In Caregiver Hub -> "AAC", upload photos of family members, pets, or classroom items.', clickTarget: 'Tap "Add Custom Word"' },
      ],
      mockupType: 'aac',
      actionLabel: 'Open AAC Vocabulary Hub',
      actionTab: 'aac',
    },
    {
      id: 'alerts',
      title: '1-Tap Help Alerts & Caregiver Reassurance',
      badge: 'Safety & Support',
      icon: '🆘',
      summary: 'A stress-free communication lifeline. When words are difficult, a single tap notifies the caregiver, who replies with spoken reassurance.',
      steps: [
        { step: 1, title: 'User Taps "I Need Help"', desc: 'Dependent taps the floating SOS button or chooses an alert (Overwhelmed, Need Break).', clickTarget: 'Tap "🆘 I Need Help"' },
        { step: 2, title: 'Caregiver Receives Alert', desc: 'Your caregiver dashboard or phone receives an instant alert banner: "Leo needs help".', clickTarget: 'Caregiver sees notification' },
        { step: 3, title: 'Send 1-Tap Response', desc: 'Tap a reassuring reply button: "❤️ I\'m here", "🚗 On my way", or "👍 Okay".', clickTarget: 'Tap "❤️ I\'m here"' },
        { step: 4, title: 'Spoken Reassurance', desc: 'The dependent device plays a soft chime and automatically speaks your message aloud.', clickTarget: 'Device speaks message' },
      ],
      mockupType: 'alert',
      actionLabel: 'Open Live Caregiver Link',
      actionTab: 'caregiver',
    },
    {
      id: 'pairing',
      title: 'Two-Way Device Pairing & QR Link',
      badge: 'Easy Setup',
      icon: '📱',
      summary: 'Connect a child\'s iPad or phone to your caregiver account in seconds without passwords, emails, or complex account setups.',
      steps: [
        { step: 1, title: 'Open Pairing on Child Device', desc: 'On the child\'s tablet, tap "Connect Caregiver" to generate a 6-character code (e.g. K7P4-92) or QR code.', clickTarget: 'Tap "Connect Caregiver"' },
        { step: 2, title: 'Enter Code in Caregiver Hub', desc: 'In your Caregiver Dashboard, tap "Add Someone I Support" and enter the 6-character code.', clickTarget: 'Enter Code "K7P4-92"' },
        { step: 3, title: 'Instant Secure Link', desc: 'Both devices link immediately. The temporary code expires automatically.', clickTarget: 'Tap "Connect Device"' },
      ],
      mockupType: 'pairing',
      actionLabel: 'Open Device Pairing Hub',
      actionTab: 'caregiver',
    },
    {
      id: 'pie_timer',
      title: 'Visual Pie Clock & Focus Disks',
      badge: 'Executive Function',
      icon: '⏱️',
      summary: 'Visual time passage countdown disk inspired by Time Timer. Eliminates time blindness and transition anxiety without loud alarms.',
      steps: [
        { step: 1, title: 'Open Pie Timer', desc: 'Launch from Tools Hub -> Visual Pie Clock or tap timer on any routine activity.', clickTarget: 'Tap "Visual Pie Clock"' },
        { step: 2, title: 'Set Duration', desc: 'Select 2m, 5m, 15m, or drag the radial disk to set any custom duration.', clickTarget: 'Drag Disk to 10m' },
        { step: 3, title: 'Watch Disk Shrink', desc: 'The colored slice disappears clockwise as time elapses, showing remaining time visually.', clickTarget: 'Tap "Start Timer"' },
        { step: 4, title: 'Gentle Sensory Chime', desc: 'Plays a soothing star chime when time is up. Sound can be muted for silent sensory needs.', clickTarget: 'Gentle Completion' },
      ],
      mockupType: 'pie_timer',
      actionLabel: 'Try Visual Pie Timer Live',
      modalLauncher: 'pie_timer',
    },
    {
      id: 'fidgets',
      title: 'Digital Fidget Corner & Sensory Regulation',
      badge: 'Sensory Tools',
      icon: '🧸',
      summary: 'Tactile interactive fidget toys (Pop-It Bubbles, Sand Ripples, Marble Roll, Box Breathing) with soothing haptic vibration feedback.',
      steps: [
        { step: 1, title: 'Open Tools Hub', desc: 'Tap "Tools" in bottom navigation and select "Digital Fidget Corner".', clickTarget: 'Tap "Digital Fidget Corner"' },
        { step: 2, title: 'Pick a Toy', desc: 'Switch between Bubble Pop, Kinetic Sand, Smooth Marble Roll, and Breathing Pacer.', clickTarget: 'Select "Bubble Pop"' },
        { step: 3, title: 'Tactile Interaction', desc: 'Pop bubbles with satisfying tactile haptics or follow the 4-4-4 box breathing pacer.', clickTarget: 'Tap Bubbles / Breathe' },
      ],
      mockupType: 'fidgets',
      actionLabel: 'Open Fidget Toys Live',
      modalLauncher: 'fidgets',
    },
    {
      id: 'five_point',
      title: 'Incredible 5-Point Emotion Thermometer',
      badge: 'Emotional Regulation',
      icon: '🌡️',
      summary: 'Visual regulation scale that helps users recognize their body state (1 = Calm to 5 = Overwhelmed) and access targeted coping actions.',
      steps: [
        { step: 1, title: 'Open 5-Point Scale', desc: 'Tap the thermometer icon on Home or in the Tools Hub.', clickTarget: 'Tap "5-Point Scale"' },
        { step: 2, title: 'Identify Body Level', desc: 'Tap Level 1 (Calm), Level 2 (Wiggly), Level 3 (Uneasy), Level 4 (Very Upset), or Level 5 (Overwhelmed).', clickTarget: 'Select Level (1–5)' },
        { step: 3, title: 'Use Suggested Action', desc: 'Tap recommended coping actions: "Take 2 deep breaths", "Squeeze fidget", or "Quiet space".', clickTarget: 'Tap Coping Action' },
      ],
      mockupType: 'five_point',
      actionLabel: 'Try 5-Point Scale Live',
      modalLauncher: 'five_point',
    },
    {
      id: 'spoon_budget',
      title: 'Spoon Theory Energy Budget',
      badge: 'Wellness & Stamina',
      icon: '🥄',
      summary: 'Stamina budgeting tool for autistic & neurodivergent minds to pace daily energy, track spoons, and prevent sensory burnout.',
      steps: [
        { step: 1, title: 'Check Morning Spoons', desc: 'Check in with starting spoons (e.g. 12 spoons) based on sleep and baseline energy.', clickTarget: 'Set Daily Spoons' },
        { step: 2, title: 'Log Activity Costs', desc: 'Log tasks (Grocery store: -3 spoons, Homework: -2 spoons) to visualize stamina depletion.', clickTarget: 'Log Task Cost' },
        { step: 3, title: 'Recharge & Rest', desc: 'Add restorative activities (+2 spoons for quiet reading) to manage pacing safely.', clickTarget: 'Log Rest Recharge' },
      ],
      mockupType: 'spoon',
      actionLabel: 'Try Spoon Budget Live',
      modalLauncher: 'spoon',
    },
    {
      id: 'medications',
      title: 'Medication Reminders & Pill Restock Hub',
      badge: 'Health & Routine',
      icon: '💊',
      summary: 'Scheduled dose reminders, pill count tracking, and refill alerts to manage prescriptions with zero stress.',
      steps: [
        { step: 1, title: 'Add Medication in Caregiver Hub', desc: 'In Caregiver Dashboard, tap "Medications" tab and click "+ Add New Medication".', clickTarget: 'Tap "+ Add Medication"' },
        { step: 2, title: 'Set Times & Supply Count', desc: 'Enter name, dosage, scheduled times (8:00 AM), and current bottle supply (30 pills).', clickTarget: 'Enter Dose & Times' },
        { step: 3, title: 'Log Taken Doses', desc: 'When the user takes their medication, they tap "Taken ✓". Pill count decreases automatically.', clickTarget: 'Tap "Mark Taken"' },
      ],
      mockupType: 'medication',
      actionLabel: 'Open Medications Tab',
      actionTab: 'medications',
    },
    {
      id: 'passport',
      title: '1-Page Communication Support Passport',
      badge: 'Advocacy & Support',
      icon: '📋',
      summary: 'A printable 1-page summary of communication style, sensory triggers, and calming aids to give to teachers, dentists, and doctors.',
      steps: [
        { step: 1, title: 'Open Passport Builder', desc: 'In Tools Hub, select "Communication Passport" to open the editor.', clickTarget: 'Tap "Communication Passport"' },
        { step: 2, title: 'Fill Sensory Needs', desc: 'List sensory triggers (loud sounds), what helps (quiet room, fidgets), and emergency contacts.', clickTarget: 'Edit Preferences' },
        { step: 3, title: 'Print or Export PDF', desc: 'Tap "Print / Save PDF" to generate a clean 1-page document ready for appointments.', clickTarget: 'Tap "Print / Export PDF"' },
      ],
      mockupType: 'passport',
      actionLabel: 'Try Passport Live',
      modalLauncher: 'passport',
    },
    {
      id: 'feature_toggles',
      title: 'Granular Feature Switchboard (Customize UI)',
      badge: 'Simplicity',
      icon: '🎛️',
      summary: 'Turn off features that the user does not need to ensure the app stays completely clutter-free, accessible, and simple on the surface.',
      steps: [
        { step: 1, title: 'Open Features Tab', desc: 'In Caregiver Dashboard, tap "Settings" or "Features" tab.', clickTarget: 'Tap "Features" Tab' },
        { step: 2, title: 'Toggle Categories On/Off', desc: 'Switch on/off Communication, Routines, Sensory Tools, or Health with single clicks.', clickTarget: 'Toggle Feature Switches' },
        { step: 3, title: 'Instant Clean UI', desc: 'The user navigation immediately updates to display only the tools that matter to them.', clickTarget: 'App adapts instantly' },
      ],
      mockupType: 'toggles',
      actionLabel: 'Open Settings & Features Tab',
      actionTab: 'settings',
    },
  ];

  const filteredFeatures = featuresList.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.id === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunchModal = (launcher: string) => {
    playChime('tap');
    if (launcher === 'five_point') setShowFivePointModal(true);
    else if (launcher === 'pie_timer') setShowPieTimerModal(true);
    else if (launcher === 'fidgets') setShowFidgetModal(true);
    else if (launcher === 'spoon') setShowSpoonModal(true);
    else if (launcher === 'passport') setShowPassportModal(true);
    else if (launcher === 'tools') setShowToolsHubModal(true);
    else if (launcher === 'accessibility') setShowAccessibilityModal(true);
  };

  return (
    <div className="space-y-6">
      {/* GUIDE HEADER & SEARCH */}
      <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-indigo-500/10 p-5 sm:p-6 rounded-3xl border-2 border-amber-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
              📖
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Visual Step-by-Step Feature Walkthrough
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Easy-to-understand visual guides with screenshots and click instructions for all BeeYou tools.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black self-start sm:self-auto">
            11 Interactive Guides
          </span>
        </div>

        {/* SEARCH & QUICK FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search instructions (e.g. routine, AAC, timer, pairing, alerts)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              playChime('tap');
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all shrink-0"
          >
            Reset Filters
          </button>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {[
            { id: 'all', label: '🌟 All Features' },
            { id: 'routines', label: '📅 Routines' },
            { id: 'aac', label: '🗣️ AAC & Speech' },
            { id: 'alerts', label: '🆘 Help Alerts' },
            { id: 'pairing', label: '📱 Device Pairing' },
            { id: 'pie_timer', label: '⏱️ Pie Timers' },
            { id: 'fidgets', label: '🧸 Fidget Corner' },
            { id: 'five_point', label: '🌡️ 5-Point Scale' },
            { id: 'spoon_budget', label: '🥄 Spoon Budget' },
            { id: 'medications', label: '💊 Medications' },
            { id: 'passport', label: '📋 Passport' },
            { id: 'feature_toggles', label: '🎛️ Feature Toggles' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id as GuideFeatureId);
                playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURE CARDS LIST WITH SCREENSHOTS & INSTRUCTIONS */}
      <div className="space-y-6">
        {filteredFeatures.map((item) => (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-5 hover:border-amber-300 transition-all"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-2xs">
                  {item.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base sm:text-lg text-slate-900">{item.title}</h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{item.summary}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                {item.actionTab && onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab(item.actionTab!);
                      playChime('tap');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.modalLauncher && (
                  <button
                    type="button"
                    onClick={() => handleLaunchModal(item.modalLauncher!)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{item.actionLabel}</span>
                  </button>
                )}
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT: INSTRUCTIONS (LEFT) & SIMULATED SCREENSHOT (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: STEP BY STEP INSTRUCTIONS */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  <span>How to do it (Step by Step)</span>
                </div>

                <div className="space-y-2.5">
                  {item.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:bg-amber-50/50 hover:border-amber-200 transition-all"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {s.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-black text-xs text-slate-900">{s.title}</h5>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md shrink-0">
                            👉 {s.clickTarget}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: VISUAL SCREENSHOT / SIMULATION MOCKUP */}
              <div className="lg:col-span-5 bg-slate-950 rounded-3xl p-3 sm:p-4 border-2 border-slate-800 text-white shadow-md space-y-3">
                {/* Device Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-300 ml-1">BeeYou Visual Preview</span>
                  </div>
                  <span className="font-bold text-amber-400">Live Simulation</span>
                </div>

                {/* VISUAL MOCKUP FOR ROUTINES */}
                {item.mockupType === 'routine' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-amber-300">☀️ Morning Routine</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">Step 2 of 4</span>
                      </div>
                      
                      <div className="p-2.5 rounded-xl bg-white text-slate-900 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🪥</span>
                          <div>
                            <span className="font-black text-xs block">Brush teeth</span>
                            <span className="text-[10px] text-slate-500">2 min countdown</span>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1">
                            ✓ Done
                          </span>
                          <span className="absolute -bottom-5 -right-1 text-[9px] font-black text-amber-300 whitespace-nowrap">
                            👉 Tap here to finish
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 flex items-center justify-between opacity-75">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👕</span>
                          <span className="font-bold text-xs">Get dressed</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Next step</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR AAC */}
                {item.mockupType === 'aac' && (
                  <div className="space-y-2 text-xs">
                    {/* Sentence Bar */}
                    <div className="p-2 rounded-xl bg-slate-900 border border-sky-400/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="px-2 py-1 rounded-lg bg-white text-slate-900 font-black text-[10px] flex items-center gap-1">
                          🍎 Apple
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-white text-slate-900 font-black text-[10px] flex items-center gap-1">
                          😋 Please
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] shrink-0 animate-pulse">
                        🔊 Speak
                      </span>
                    </div>

                    {/* AAC Grid Tiles */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { emoji: '🙋', label: 'I want' },
                        { emoji: '🍎', label: 'Apple' },
                        { emoji: '💧', label: 'Water' },
                        { emoji: '🧸', label: 'Play' },
                        { emoji: '🛑', label: 'Stop' },
                        { emoji: '❤️', label: 'Help' },
                      ].map((tile, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white text-slate-900 flex flex-col items-center justify-center text-center shadow-xs">
                          <span className="text-lg">{tile.emoji}</span>
                          <span className="text-[10px] font-black leading-tight mt-0.5">{tile.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[10px] font-bold text-sky-300">
                      👉 Tap any tile to add to speech bar
                    </div>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR ALERTS */}
                {item.mockupType === 'alert' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/60 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🆘</span>
                        <span className="font-black text-rose-200 text-xs">Active Alert: "Leo needs help"</span>
                      </div>
                      <p className="text-[11px] text-rose-300">Tap a reassuring response to send back instantly:</p>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <span className="p-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] text-center cursor-pointer shadow-xs">
                          ❤️ I'm here
                        </span>
                        <span className="p-1.5 rounded-lg bg-sky-500 text-white font-bold text-[10px] text-center cursor-pointer shadow-xs">
                          🚗 On my way
                        </span>
                      </div>
                    </div>
                    <div className="text-center text-[10px] font-bold text-amber-300">
                      👉 1 tap sends spoken reassurance to the child's screen
                    </div>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR PAIRING */}
                {item.mockupType === 'pairing' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-400/40 text-center space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Child iPad Pairing Code</span>
                    <div className="p-2 rounded-xl bg-white text-slate-900 font-mono font-black text-lg tracking-widest">
                      K7P4-92
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Type this code into Caregiver Dashboard to pair in 3 seconds.
                    </p>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR PIE TIMER */}
                {item.mockupType === 'pie_timer' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-amber-400/40 text-center space-y-2">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-amber-400/20 mx-auto flex items-center justify-center font-black text-base text-amber-300">
                      04:30
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 block">
                      Visual pie slice shrinks clockwise smoothly
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black inline-block">
                      👉 Non-pressuring visual timer
                    </span>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR SENSORY FIDGETS */}
                {item.mockupType === 'fidgets' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-400/40 space-y-2">
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {['🫧 Pop', '🏖️ Sand', '🔮 Marble', '🫁 Pacer'].map((f, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-800 text-white font-bold text-[10px]">
                          {f}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-300 text-center">
                      Gentle vibration haptics & calming sensory reset.
                    </p>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR 5-POINT SCALE */}
                {item.mockupType === 'five_point' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-yellow-400/40 space-y-1.5">
                    <div className="flex gap-1 justify-between">
                      {['😊 1', '🙂 2', '😐 3', '😟 4', '🌋 5'].map((lvl, i) => (
                        <span key={i} className="p-1 rounded-lg bg-slate-800 text-white font-bold text-[10px] flex-1 text-center">
                          {lvl}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-300 text-center">
                      Instant body feelings + 1-tap coping action strategies.
                    </p>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR SPOON BUDGET */}
                {item.mockupType === 'spoon' && (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-purple-400/40 text-center space-y-1.5">
                    <div className="flex justify-center gap-1 text-lg">
                      <span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span>
                    </div>
                    <span className="text-xs font-black text-purple-300 block">10 Spoons Remaining</span>
                    <p className="text-[10px] text-slate-400">Budget stamina to prevent sensory burnout.</p>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR MEDICATION */}
                {item.mockupType === 'medication' && (
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-blue-400/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-300">💊 Daily Vitamins (10mg)</span>
                      <span className="text-[10px] text-slate-400">8:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>Bottle Supply: 24 pills left</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">Mark Taken ✓</span>
                    </div>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR PASSPORT */}
                {item.mockupType === 'passport' && (
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-1 text-xs">
                    <span className="font-black text-amber-300 text-[11px] block">📋 Communication Passport (1-Page)</span>
                    <p className="text-[10px] text-slate-300">• "I use AAC to communicate. Please give me time."</p>
                    <p className="text-[10px] text-slate-300">• Triggers: Loud sirens, bright sudden lights.</p>
                  </div>
                )}

                {/* VISUAL MOCKUP FOR TOGGLES */}
                {item.mockupType === 'toggles' && (
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>🗣️ Communication</span>
                      <span className="text-emerald-400 font-bold">ON</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>📅 Routines</span>
                      <span className="text-emerald-400 font-bold">ON</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>🧸 Sensory Tools</span>
                      <span className="text-emerald-400 font-bold">ON</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
