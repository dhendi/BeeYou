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
      summary: 'Break daily tasks into visual step-by-step cards with countdowns and sticker rewards.',
      steps: [
        { step: 1, title: 'Open Routines', desc: 'Tap "Routines" in Caregiver Dashboard or "My Day" in user app.', clickTarget: 'Tap "Routines"' },
        { step: 2, title: 'Pick a Routine', desc: 'Select Morning, Bedtime, or tap "+ New Routine".', clickTarget: 'Select Routine' },
        { step: 3, title: 'Add Steps & Timers', desc: 'Add activities like "Brush teeth 🪥" with 2m countdown timer.', clickTarget: 'Add Step' },
        { step: 4, title: 'Complete & Celebrate', desc: 'Tap checkmarks to finish steps and unlock mascot celebration stickers.', clickTarget: 'Tap Checkmark ✓' },
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
      summary: 'High-clarity picture tiles with consistent motor layout and 100% offline speech.',
      steps: [
        { step: 1, title: 'Open AAC Talker', desc: 'Tap "Communicate" in bottom navigation to open the speech board.', clickTarget: 'Tap "Communicate"' },
        { step: 2, title: 'Pick Category', desc: 'Select Food, Activities, Feelings, or search for any word.', clickTarget: 'Select Category' },
        { step: 3, title: 'Build Sentence', desc: 'Tap symbol tiles to queue words in the top sentence strip.', clickTarget: 'Tap Tile' },
        { step: 4, title: 'Speak Aloud 🔊', desc: 'Tap "Speak 🔊" to read the full sentence with natural audio.', clickTarget: 'Tap "Speak 🔊"' },
        { step: 5, title: 'Add Custom Photos', desc: 'In Caregiver Hub → AAC, upload photos of family, pets, or classroom items.', clickTarget: 'Tap "+ Add Word"' },
      ],
      mockupType: 'aac',
      actionLabel: 'Open AAC Vocabulary Hub',
      actionTab: 'aac',
    },
    {
      id: 'alerts',
      title: '1-Tap Help Alerts & Reassurance',
      badge: 'Safety & Support',
      icon: '🆘',
      summary: '1-tap lifeline for dependents to request help and receive spoken caregiver reassurance.',
      steps: [
        { step: 1, title: 'User Taps Alert', desc: 'Dependent taps floating SOS or chooses Overwhelmed / Need Break.', clickTarget: 'Tap "🆘 Need Help"' },
        { step: 2, title: 'Caregiver Notified', desc: 'Caregiver sees an instant notification banner: "Leo needs help".', clickTarget: 'Alert Banner' },
        { step: 3, title: 'Send 1-Tap Reply', desc: 'Tap quick reply: "❤️ I\'m here", "🚗 Coming", or "👍 Okay".', clickTarget: 'Tap "❤️ I\'m here"' },
        { step: 4, title: 'Spoken Reassurance', desc: 'Dependent device chimes softly and speaks caregiver reply aloud.', clickTarget: 'Speaks Message' },
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
      summary: 'Connect a child tablet to caregiver account in seconds via 6-digit code or QR.',
      steps: [
        { step: 1, title: 'Show Code on Child Tablet', desc: 'On child tablet, tap "Connect Caregiver" to generate 6-char code or QR.', clickTarget: 'Tap "Connect"' },
        { step: 2, title: 'Enter in Caregiver Hub', desc: 'In Caregiver Dashboard, enter the 6-character code (e.g. K7P4-92).', clickTarget: 'Enter Code' },
        { step: 3, title: 'Linked Instantly', desc: 'Devices link immediately with no passwords or emails required.', clickTarget: 'Connected ✓' },
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
      summary: 'Visual disk countdown that eliminates time blindness without loud alarms.',
      steps: [
        { step: 1, title: 'Open Pie Timer', desc: 'Launch from Tools Hub or tap timer on any routine activity card.', clickTarget: 'Tap "Pie Timer"' },
        { step: 2, title: 'Set Duration', desc: 'Choose a quick preset (2m, 5m, 15m) or drag the visual disk.', clickTarget: 'Set Duration' },
        { step: 3, title: 'Watch Disk Shrink', desc: 'Colored slice vanishes clockwise as time elapses.', clickTarget: 'Tap "Start"' },
        { step: 4, title: 'Gentle Sensory Chime', desc: 'Plays soft star chime or flashes visually when time is up.', clickTarget: 'Gentle Completion' },
      ],
      mockupType: 'pie_timer',
      actionLabel: 'Try Visual Pie Timer Live',
      modalLauncher: 'pie_timer',
    },
    {
      id: 'fidgets',
      title: 'Digital Fidget Corner & Sensory Reset',
      badge: 'Sensory Tools',
      icon: '🧸',
      summary: 'Calming interactive toys (Bubble Pop, Sand, Marble Roll, Box Breathing) with haptics.',
      steps: [
        { step: 1, title: 'Open Fidgets Hub', desc: 'Go to Tools Hub → "Digital Fidget Corner".', clickTarget: 'Tap "Fidgets"' },
        { step: 2, title: 'Pick a Toy', desc: 'Switch between Bubble Pop, Kinetic Sand, Marble Roll, and Breathing Pacer.', clickTarget: 'Pick a Toy' },
        { step: 3, title: 'Relax & Reset', desc: 'Interact with soothing tactile vibration feedback and calm rhythms.', clickTarget: 'Pop & Breathe' },
      ],
      mockupType: 'fidgets',
      actionLabel: 'Open Fidget Toys Live',
      modalLauncher: 'fidgets',
    },
    {
      id: 'five_point',
      title: '5-Point Emotion Thermometer',
      badge: 'Emotional Regulation',
      icon: '🌡️',
      summary: 'Visual 1–5 scale to identify body state and access immediate coping strategies.',
      steps: [
        { step: 1, title: 'Open 5-Point Scale', desc: 'Tap the thermometer icon on Home or in Tools Hub.', clickTarget: 'Tap "5-Point Scale"' },
        { step: 2, title: 'Identify Body Level', desc: 'Select 1 (Calm), 2 (Wiggly), 3 (Uneasy), 4 (Upset), or 5 (Overwhelmed).', clickTarget: 'Select Level (1–5)' },
        { step: 3, title: 'Use Coping Action', desc: 'Tap suggested action: deep breaths, fidget toy, or quiet break.', clickTarget: 'Tap Action' },
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
      summary: 'Daily stamina pacing tool to track energy spoons and prevent sensory burnout.',
      steps: [
        { step: 1, title: 'Set Base Spoons', desc: 'Start the day with base spoons (e.g. 12 spoons) based on rest.', clickTarget: 'Set Base Spoons' },
        { step: 2, title: 'Log Task Costs', desc: 'Log tasks (Store: -3, Homework: -2) to see remaining stamina.', clickTarget: 'Log Task Cost' },
        { step: 3, title: 'Rest & Recharge', desc: 'Add restorative activities (+2 spoons for quiet time) to stay balanced.', clickTarget: 'Log Rest' },
      ],
      mockupType: 'spoon',
      actionLabel: 'Try Spoon Budget Live',
      modalLauncher: 'spoon',
    },
    {
      id: 'medications',
      title: 'Medication Reminders & Supply Hub',
      badge: 'Health & Routine',
      icon: '💊',
      summary: 'Scheduled dose reminders, supply count tracking, and low-refill alerts.',
      steps: [
        { step: 1, title: 'Add Medication', desc: 'In Caregiver Dashboard → Medications, tap "+ Add Medication".', clickTarget: 'Tap "+ Add Med"' },
        { step: 2, title: 'Set Dose & Schedule', desc: 'Enter dosage, times (e.g. 8:00 AM), and total pill count (30 pills).', clickTarget: 'Set Schedule' },
        { step: 3, title: 'Mark Taken', desc: 'Tap "Taken ✓" when taken to decrement bottle supply automatically.', clickTarget: 'Tap "Mark Taken"' },
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
      summary: 'Printable 1-page summary of communication, sensory triggers, and calming tips.',
      steps: [
        { step: 1, title: 'Open Passport Editor', desc: 'Select "Communication Passport" in Tools Hub.', clickTarget: 'Open Passport' },
        { step: 2, title: 'Fill Needs & Triggers', desc: 'List communication style, sensory triggers, and emergency contacts.', clickTarget: 'Fill Details' },
        { step: 3, title: 'Print or Save PDF', desc: 'Tap "Print / Save PDF" to generate 1-page sheet for teachers & doctors.', clickTarget: 'Save PDF' },
      ],
      mockupType: 'passport',
      actionLabel: 'Try Passport Live',
      modalLauncher: 'passport',
    },
    {
      id: 'feature_toggles',
      title: 'Granular Feature Switchboard',
      badge: 'Simplicity',
      icon: '🎛️',
      summary: 'Turn off unused features so the interface stays simple, uncluttered, and focused.',
      steps: [
        { step: 1, title: 'Open Features Tab', desc: 'In Caregiver Dashboard, tap "Settings" or "Features" tab.', clickTarget: 'Tap "Features"' },
        { step: 2, title: 'Toggle Switches', desc: 'Turn on/off Communication, Routines, Sensory Tools, or Health with 1 click.', clickTarget: 'Toggle Switches' },
        { step: 3, title: 'Instant Clean UI', desc: 'App navigation updates immediately to show only enabled tools.', clickTarget: 'Instant Update' },
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
