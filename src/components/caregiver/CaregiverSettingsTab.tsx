import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAgeGroup, DEFAULT_KID_FEATURES, DEFAULT_TEEN_FEATURES, DEFAULT_ADULT_FEATURES } from '../../types';
import { playChime } from '../../utils/audio';
import { Palette, FileJson, Download, Upload } from 'lucide-react';

interface CaregiverSettingsTabProps {
  onShowNotification: (msg: string) => void;
}

export const CaregiverSettingsTab: React.FC<CaregiverSettingsTabProps> = ({ onShowNotification }) => {
  const {
    setIsParentMode,
    settings,
    updateSettings,
    resetToDefaults,
    userAgeGroup,
    setUserAgeGroup,
    enabledFeatures,
    updateEnabledFeatures,
    toggleFeature,
    reopenOnboarding,
    exportProfileBackup,
    importProfileBackup,
    setShowEditAlertsModal,
    setShowEditCalmModal,
  } = useApp();

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
          onShowNotification('Profile backup successfully imported and restored!');
        } else {
          onShowNotification('Import failed: Invalid backup file format.');
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
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
                onShowNotification('Backup exported successfully!');
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
              onShowNotification('App reset to initial defaults.');
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 cursor-pointer"
        >
          Reset App State to Initial Sample Data
        </button>
      </div>
    </div>
  );
};
