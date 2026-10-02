import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Eye, 
  Volume2, 
  Sliders, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  Calendar, 
  MessageSquare, 
  Pill, 
  HeartPulse, 
  BookOpen, 
  Heart,
  Palette,
  VolumeX,
  Zap,
  Gauge
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { EnabledFeatures } from '../types';

export const AccessibilityPreferencesModal: React.FC = () => {
  const {
    showAccessibilityModal,
    setShowAccessibilityModal,
    settings,
    updateSettings,
    enabledFeatures,
    updateEnabledFeatures,
    speak,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'visuals' | 'audio' | 'features'>('visuals');

  if (!showAccessibilityModal) return null;

  const handleClose = () => {
    if (settings.soundEffects) playChime('tap');
    setShowAccessibilityModal(false);
  };

  const featureList: Array<{
    key: keyof EnabledFeatures;
    title: string;
    desc: string;
    emoji: string;
  }> = [
    {
      key: 'firstThenSchedules',
      title: 'First / Then Visual Schedules',
      desc: 'Step-by-step visual routines and task checklists',
      emoji: '📅',
    },
    {
      key: 'aacCommunication',
      title: 'AAC Picture & Word Communication',
      desc: 'Speech builder with customizable vocabulary tiles',
      emoji: '💬',
    },
    {
      key: 'starsAndRewards',
      title: 'Stars & Gamification Rewards',
      desc: 'Star coins, unlocks, and celebration stickers',
      emoji: '⭐',
    },
    {
      key: 'emergencyAlertSOS',
      title: 'Emergency SOS & Calm Room',
      desc: '1-tap caregiver alert and emergency dark sensory room',
      emoji: '🚨',
    },
    {
      key: 'sensoryBreathingPacer',
      title: 'Calming Toolkit & Breathing Pacer',
      desc: 'Guided deep breathing, soundscapes, and coping tools',
      emoji: '🛋️',
    },
    {
      key: 'medicationReminders',
      title: 'Medication & Health Reminders',
      desc: 'Scheduled dose alerts and supply inventory tracking',
      emoji: '💊',
    },
    {
      key: 'moodJournal',
      title: 'Mood Reflection Journal',
      desc: 'Nuanced emotion logging, energy tracking, and trigger notes',
      emoji: '📖',
    },
    {
      key: 'cycleTracker',
      title: 'Cycle & Sensory Wellness Rhythm',
      desc: 'Hormonal cycle tracking and neurodivergent sensory sensitivity insights',
      emoji: '🌸',
    },
    {
      key: 'dailyMoodRecollection',
      title: 'Daily Evening Reflection Chart',
      desc: 'End-of-day summary chart of emotions and daily wins',
      emoji: '🌙',
    },
    {
      key: 'socialStories',
      title: 'Preparation Adventures & Social Stories',
      desc: 'Step-by-step walkthroughs for dentist, haircut, school, etc.',
      emoji: '🚀',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90dvh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-lg shrink-0">
              ♿
            </span>
            <div>
              <h2 id="accessibility-modal-title" className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                Accessibility & Sensory Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Customize colors, sounds, speech narration, and visible tools
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-300/70 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visuals'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Colors & Visuals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <Volume2 className="w-4 h-4 text-teal-500" />
            <span>Sound & Speech</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Feature Toggles</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'visuals' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Color Coding Choice */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Color-Coded Cards & Tiles
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose whether buttons and categories have distinctive color tints or a clean, neutral monochrome look.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({
                        colorCodingEnabled: true,
                        aacButtonColorMode: 'fitzgerald',
                      });
                    }}
                    className={`p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      settings.colorCodingEnabled !== false && settings.aacButtonColorMode !== 'neutral_monochrome'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">🌈</span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block">Color-Coded</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Fitzgerald key colors (yellow for subjects, green for verbs, blue for feelings).
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({
                        colorCodingEnabled: false,
                        aacButtonColorMode: 'neutral_monochrome',
                      });
                    }}
                    className={`p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      settings.colorCodingEnabled === false || settings.aacButtonColorMode === 'neutral_monochrome'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">⚪</span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block">Neutral / Low-Stimulation</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Clean, uniform white & slate tiles without distracting color fills.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* High Contrast Borders */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    High-Contrast Outlines
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dark, crisp borders around buttons and cards for low-vision clarity.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Reduce Motion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Reduce Motion & Floating Animations
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Disables scale pulses, floating shapes, and moving transitions.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* AAC & UI Button Size / Grid Density Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span>AAC Button Size & Grid Density</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Make buttons bigger for easier tapping and fine-motor needs, or smaller to fit more words on a single screen.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { cols: 2, label: 'Jumbo', desc: 'Largest touch targets (2 cols)', icon: '🔍' },
                    { cols: 3, label: 'Large', desc: 'Enlarged buttons (3 cols)', icon: '📐' },
                    { cols: 4, label: 'Standard', desc: 'Balanced grid (4-5 cols)', icon: '⚖️' },
                    { cols: 6, label: 'Compact', desc: 'High density (6-7 cols)', icon: '📱' },
                  ].map((preset) => {
                    const isSelected = settings.gridColumns === preset.cols;
                    return (
                      <button
                        key={preset.cols}
                        type="button"
                        onClick={() => {
                          updateSettings({
                            gridColumns: preset.cols as 2 | 3 | 4 | 6 | 8,
                            largeButtonMode: preset.cols <= 3,
                          });
                          playChime('tap');
                        }}
                        className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-white shadow-xs font-black'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{preset.icon}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-xs block">{preset.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                            {preset.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Additional Text & Symbol Zoom Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Extra-Large Label Text
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Increases text font size on all vocabulary tiles
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.largeButtonMode}
                      onChange={(e) => updateSettings({ largeButtonMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sound Effects / Chimes Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Sound Effects & Chimes
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Play gentle chime feedback on tap, star awards, and task completion.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Spoken Announcements / Narrator Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Spoken Announcements ("Say What's Happening")
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically speak aloud step updates, check-ins, and reminders. Turn off for a silent, quiet visual experience.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.spokenAnnouncements ?? false}
                    onChange={(e) => updateSettings({ spokenAnnouncements: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Auto-Speak Tapped AAC Words */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Auto-Speak Tapped AAC Words
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Instantly voice each word as it is added to the sentence strip.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoSpeakSentence}
                    onChange={(e) => updateSettings({ autoSpeakSentence: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Voice Speed & Test Speech */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Speech Rate ({settings.voiceRate}x)
                  </h4>
                  <button
                    type="button"
                    onClick={() => speak('Hello! This is your Lumina communication voice.')}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Test Voice 🔊
                  </button>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.05"
                  value={settings.voiceRate}
                  onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="pb-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Choose Features on Lumina
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle off any sections or tools you don't use to keep your workspace simple and clean.
                </p>
              </div>

              <div className="space-y-2">
                {featureList.map((f) => {
                  const isEnabled = enabledFeatures?.[f.key] !== false;
                  return (
                    <div
                      key={f.key}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{f.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {f.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {f.desc}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => updateEnabledFeatures({ [f.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
