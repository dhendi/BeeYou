import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Eye, 
  Volume2, 
  Sliders, 
  SlidersHorizontal,
  Check, 
  Star,
  VolumeX,
  Zap,
} from 'lucide-react';
import { playChime, prewarmCoreAudioVocabulary } from '../utils/audio';
import { triggerHaptic, setHapticsEnabled } from '../services/haptics';
import { EnabledFeatures } from '../types';
import { FEATURE_GROUPS } from '../data/navigation';
import { VOICE_PERSONAS, getVoicePersonaById } from '../data/voicePersonasData';

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
  const [voiceCategoryFilter, setVoiceCategoryFilter] = useState<'all' | 'free' | 'kids' | 'teens' | 'caring' | 'pro'>('all');

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
      title: 'Badges & Routine Stickers',
      desc: 'Achievement celebrations, stickers, and flair',
      emoji: '🏆',
    },
    {
      key: 'emergencyAlertSOS',
      title: 'Ask for help (caregiver alert)',
      desc: 'One-tap alert to a trusted person, plus the quiet sensory room',
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
      key: 'socialStories',
      title: 'Social stories & scenarios',
      desc: 'Step-by-step walkthroughs for dentist, haircut, school, etc.',
      emoji: '🚀',
    },
    {
      key: 'lifeSkills',
      title: 'Life skills',
      desc: 'Break everyday skills into small steps',
      emoji: '🧺',
    },
    {
      key: 'visualCountdownTimer',
      title: 'Visual timers',
      desc: 'Pie clock and countdown timers',
      emoji: '⏰',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F2] w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border-2 border-[#E0D8CB] animate-in zoom-in-95 duration-200 text-[#2D241E]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-[#E0D8CB] flex items-center justify-between shrink-0 bg-[#FCF9F2]">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#EFE9DF] text-[#4A2F0F] border border-[#E0D8CB] flex items-center justify-center text-xl shrink-0 shadow-2xs">
              ♿
            </span>
            <div>
              <h2 id="accessibility-modal-title" className="font-black text-[#2D241E] text-base sm:text-lg leading-tight">
                Accessibility & Sensory Preferences
              </h2>
              <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                Customize colors, sounds, voice narration, and visible tools
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 rounded-2xl bg-[#EFE9DF] hover:bg-[#E5DFD4] text-[#4A2F0F] transition-all cursor-pointer border border-[#E0D8CB] active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Navigation (Silicone Tray Style) */}
        <div className="px-6 pt-3 pb-2 bg-[#FCF9F2] border-b border-[#E0D8CB] shrink-0">
          <div className="flex items-center gap-2 p-1.5 bg-[#EFE9DF] rounded-2xl border border-[#E0D8CB]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('visuals');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'visuals'
                  ? 'bg-[#FCF9F2] text-[#2D241E] shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#E0D8CB]'
                  : 'text-[#7A6C60] hover:text-[#2D241E]'
              }`}
            >
              <Eye className="w-4 h-4 text-[#E28743]" />
              <span>Colors & Visuals</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('audio');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-[#FCF9F2] text-[#2D241E] shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#E0D8CB]'
                  : 'text-[#7A6C60] hover:text-[#2D241E]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#5B8E7D]" />
              <span>Sound & Voice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('features');
                playChime('tap');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-[#FCF9F2] text-[#2D241E] shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#E0D8CB]'
                  : 'text-[#7A6C60] hover:text-[#2D241E]'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#9B72AA]" />
              <span>Feature Toggles</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-[#FAF7F2]">
          {activeTab === 'visuals' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Color Coding Choice */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] space-y-3">
                <div>
                  <h3 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Color-Coded Cards & Tiles
                  </h3>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Choose whether buttons and categories have distinctive soft color tints or a neutral oat milk monochrome look.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({
                        colorCodingEnabled: true,
                        aacButtonColorMode: 'fitzgerald',
                      });
                      playChime('tap');
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      settings.colorCodingEnabled !== false && settings.aacButtonColorMode !== 'neutral_monochrome'
                        ? 'border-[#E2A44E] bg-[#FDF4E7] shadow-[0_3px_10px_rgba(226,164,78,0.15)] text-[#4A2F0F] font-black'
                        : 'border-[#E0D8CB] bg-[#FAF7F2] hover:bg-white text-[#6B5E52]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">🌈</span>
                    <div>
                      <span className="font-black text-xs sm:text-sm block">Color-Coded</span>
                      <span className="text-[11px] text-[#7A6C60] font-semibold block leading-tight mt-0.5">
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
                      playChime('tap');
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      settings.colorCodingEnabled === false || settings.aacButtonColorMode === 'neutral_monochrome'
                        ? 'border-[#E2A44E] bg-[#FDF4E7] shadow-[0_3px_10px_rgba(226,164,78,0.15)] text-[#4A2F0F] font-black'
                        : 'border-[#E0D8CB] bg-[#FAF7F2] hover:bg-white text-[#6B5E52]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">⚪</span>
                    <div>
                      <span className="font-black text-xs sm:text-sm block">Neutral / Low-Stimulation</span>
                      <span className="text-[11px] text-[#7A6C60] font-semibold block leading-tight mt-0.5">
                        Clean, uniform silicone oat milk tiles without bright color fills.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* High Contrast Outlines */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    High-Contrast Tactile Outlines
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Darker, bolder outlines around buttons and cards for low-vision clarity.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#E28743]"></div>
                </label>
              </div>

              {/* Reduce Motion */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Reduce Motion & Floating Animations
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Disables scale pulses, particle effects, and moving transitions for a steady visual space.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#E28743]"></div>
                </label>
              </div>

              {/* Color-Coded Action Cards */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Color-Coded Action Cards
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Show category pastel colors across Tools, Me, and Communicate action cards instead of the default theme yellow.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.colorCodedActionCards || false}
                    onChange={(e) => updateSettings({ colorCodedActionCards: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#E28743]"></div>
                </label>
              </div>

              {/* Text Scaling & Dynamic Type */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] space-y-3">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base flex items-center gap-1.5">
                    <span className="text-base">🔤</span>
                    <span>Text Size & Dynamic Scaling</span>
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Adjust text scaling for comfortable reading and visual clarity across all cards and schedules.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: 'standard', label: 'Standard', scale: '100%', desc: 'Default' },
                    { key: 'large', label: 'Large', scale: '112%', desc: '+12% Larger' },
                    { key: 'extra_large', label: 'Jumbo', scale: '125%', desc: '+25% Jumbo' },
                  ].map((sizeOpt) => {
                    const isSelected = (settings.textSize || 'standard') === sizeOpt.key;
                    return (
                      <button
                        key={sizeOpt.key}
                        type="button"
                        onClick={() => {
                          updateSettings({ textSize: sizeOpt.key as any });
                          try {
                            localStorage.setItem('beeyou_text_size', sizeOpt.key);
                          } catch {}
                          playChime('tap');
                        }}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E2A44E] bg-[#FDF4E7] text-[#4A2F0F] shadow-xs font-black'
                            : 'border-[#E0D8CB] bg-[#FAF7F2] hover:bg-white text-[#6B5E52]'
                        }`}
                      >
                        <span className="font-black text-xs sm:text-sm block">{sizeOpt.label}</span>
                        <span className="text-[10px] text-[#7A6C60] font-bold block mt-0.5">{sizeOpt.scale}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dyslexia-Friendly Typography */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Dyslexia-Friendly Letterforms
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    High-legibility typeface with weighted bottoms and distinct character shapes to prevent letter flipping.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.dyslexiaFont || false}
                    onChange={(e) => updateSettings({ dyslexiaFont: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#E28743]"></div>
                </label>
              </div>

              {/* AAC Button Size / Grid Density */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] space-y-3">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#E28743]" />
                    <span>AAC Button Size & Grid Density</span>
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Enlarge button targets for motor-friendly tapping or make them compact to fit more tiles.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { cols: 2, label: 'Jumbo', desc: 'Largest touch targets (2 cols)', icon: '🔍' },
                    { cols: 3, label: 'Large', desc: 'Enlarged buttons (3 cols)', icon: '📐' },
                    { cols: 4, label: 'Standard', desc: 'Balanced grid (4 cols)', icon: '⚖️' },
                    { cols: 6, label: 'Compact', desc: 'High density (6 cols)', icon: '📱' },
                  ].map((preset) => {
                    const isSelected = settings.gridColumns === preset.cols;
                    return (
                      <button
                        key={preset.cols}
                        type="button"
                        onClick={() => {
                          const mappedSize = preset.cols <= 3 ? 'large' : preset.cols >= 6 ? 'small' : 'medium';
                          updateSettings({
                            gridColumns: preset.cols as 2 | 3 | 4 | 6 | 8,
                            largeButtonMode: preset.cols <= 3,
                          });
                          try {
                            localStorage.setItem('beeyou_aac_button_size', mappedSize);
                            window.dispatchEvent(new CustomEvent('beeyou_aac_button_size_change', { detail: { size: mappedSize } }));
                          } catch {}
                          playChime('tap');
                        }}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E2A44E] bg-[#FDF4E7] text-[#4A2F0F] shadow-xs font-black'
                            : 'border-[#E0D8CB] bg-[#FAF7F2] hover:bg-white text-[#6B5E52]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{preset.icon}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#E2A44E] text-white flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="font-black text-xs block">{preset.label}</span>
                          <span className="text-[10px] text-[#7A6C60] font-semibold block leading-tight mt-0.5">
                            {preset.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weather Temperature Unit */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Weather Temperature Unit
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Display weather and sensory comfort tips in Fahrenheit (°F) or Celsius (°C).
                  </p>
                </div>
                <div className="flex items-center bg-[#EFE8DC] rounded-xl p-1 gap-1 text-xs font-black shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ temperatureUnit: 'F' });
                      try {
                        localStorage.setItem('beeyou_temperature_unit', 'F');
                      } catch {}
                      playChime('tap');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      (settings.temperatureUnit || 'F') === 'F' ? 'bg-[#FED676] text-amber-950 shadow-2xs font-black' : 'text-[#7A6C60] hover:text-[#2D241E]'
                    }`}
                  >
                    °F
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ temperatureUnit: 'C' });
                      try {
                        localStorage.setItem('beeyou_temperature_unit', 'C');
                      } catch {}
                      playChime('tap');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      settings.temperatureUnit === 'C' ? 'bg-[#FED676] text-amber-950 shadow-2xs font-black' : 'text-[#7A6C60] hover:text-[#2D241E]'
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sound Effects / Chimes */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Sound Effects & Chimes
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Play gentle tactile chime feedback on tap, star awards, and routine step completion.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#5B8E7D]"></div>
                </label>
              </div>

              {/* Gentle Tactile Haptics (Vibration) */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Gentle Tactile Haptics (Vibration)
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Soft sensory vibration feedback when tapping AAC cards, completing routine steps, and sliding sound volumes.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.hapticsEnabled ?? false}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      updateSettings({ hapticsEnabled: enabled });
                      setHapticsEnabled(enabled);
                      if (enabled) {
                        triggerHaptic('light', true);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#5B8E7D]"></div>
                </label>
              </div>

              {/* Spoken Announcements */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Spoken Announcements ("Say What's Happening")
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Speak aloud routine steps and timer updates. Turn off for a silent, quiet visual space.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.spokenAnnouncements ?? false}
                    onChange={(e) => updateSettings({ spokenAnnouncements: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#5B8E7D]"></div>
                </label>
              </div>

              {/* Auto-Speak Tapped AAC Words */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                    Auto-Speak Tapped AAC Words
                  </h4>
                  <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                    Instantly speak each vocabulary word aloud when tapped on the AAC sensory board.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoSpeakSentence}
                    onChange={(e) => updateSettings({ autoSpeakSentence: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#5B8E7D]"></div>
                </label>
              </div>

              {/* Voice Studio: 20 Curated Neural Personas & System Voice */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎙️</span>
                      <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                        Voice Studio ({VOICE_PERSONAS.length} Personas)
                      </h4>
                    </div>
                    <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                      Choose from 20 natural AI voices across kids, teens, caring caregivers, and professionals.
                    </p>
                  </div>

                  {/* Active Voice Pill */}
                  <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#FDF4E7] border border-[#E2A44E] text-[#4A2F0F] text-xs font-black flex items-center gap-1.5 shrink-0 shadow-2xs">
                    <span>Active:</span>
                    <span>{getVoicePersonaById(settings.voicePersona).emoji}</span>
                    <span className="truncate max-w-[130px]">{getVoicePersonaById(settings.voicePersona).name}</span>
                  </div>
                </div>

                {/* Category Filter Pills (Silicone Tray Style) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { key: 'all', label: 'All Voices (21)' },
                    { key: 'free', label: '📱 Free (On-Device)' },
                    { key: 'kids', label: '🧸 Kids & Children' },
                    { key: 'teens', label: '🎧 Teens & Youth' },
                    { key: 'caring', label: '💖 Caring & Warm' },
                    { key: 'pro', label: '💼 Professional' },
                  ].map((filter) => {
                    const isActive = voiceCategoryFilter === filter.key;
                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => {
                          setVoiceCategoryFilter(filter.key as any);
                          playChime('tap');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                          isActive
                            ? 'bg-[#E28743] border-[#C87332] text-white shadow-xs'
                            : 'bg-[#EFE9DF] border-[#E0D8CB] text-[#6B5E52] hover:bg-[#E5DFD4]'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* Voice Persona Cards List */}
                <div className="max-h-72 overflow-y-auto pr-1 space-y-2.5 rounded-2xl">
                  {VOICE_PERSONAS.filter((p) => {
                    if (voiceCategoryFilter === 'all') return true;
                    if (voiceCategoryFilter === 'free') return p.category === 'system';
                    if (voiceCategoryFilter === 'kids') return p.category === 'kids';
                    if (voiceCategoryFilter === 'teens') return p.category === 'teens';
                    if (voiceCategoryFilter === 'caring') return p.category === 'caring_women' || p.category === 'caring_men';
                    if (voiceCategoryFilter === 'pro') return p.category === 'pro_women' || p.category === 'pro_men';
                    return true;
                  }).map((persona) => {
                    const isSelected = (settings.voicePersona || 'system').toLowerCase() === persona.id.toLowerCase();
                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          updateSettings({ voicePersona: persona.id });
                          prewarmCoreAudioVocabulary(persona.id, settings.language || 'en');
                          playChime('tap');
                        }}
                        className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FDF4E7] border-[#E2A44E] shadow-xs'
                            : 'bg-white hover:bg-[#FAF7F2] border-[#E0D8CB]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 rounded-xl bg-[#EFE9DF] border border-[#E0D8CB] flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {persona.emoji}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-black text-[#2D241E] text-xs sm:text-sm">
                                {persona.label}
                              </h5>
                              {persona.category === 'system' && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-950 text-[9px] font-black">
                                  🆓 100% Free
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded-md bg-[#EFE9DF] text-[#7A6C60] text-[9px] font-bold">
                                {persona.categoryLabel}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#5B8E7D] text-white text-[9px] font-black">
                                  ✓ Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#7A6C60] font-semibold truncate mt-0.5">
                              {persona.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speak(persona.previewText, { voicePersona: persona.id, force: true });
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#EFE9DF] hover:bg-[#E2A44E] hover:text-white text-[#4A2F0F] text-xs font-black transition-all cursor-pointer border border-[#E0D8CB] active:scale-95 flex items-center gap-1 shadow-2xs"
                            title={`Audition ${persona.name}`}
                          >
                            <span>Audition</span>
                            <span>🔊</span>
                          </button>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#E2A44E] bg-[#E2A44E] text-white' : 'border-[#C8BFB3]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voice Speed & Test Speech */}
              <div className="p-4 sm:p-5 rounded-[28px] bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_3px_12px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-[#2D241E] text-sm sm:text-base">
                      Speech Rate ({settings.voiceRate.toFixed(2)}x)
                    </h4>
                    <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                      Adjust speech speed to be slower and clearer or faster (0.85x recommended).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak('Hello! This is your BeeYou communication voice.')}
                    className="px-3.5 py-2 bg-[#5B8E7D] hover:bg-[#4E7D6D] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
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
                  className="w-full accent-[#5B8E7D] cursor-pointer"
                />
              </div>

            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="pb-1">
                <h3 className="font-black text-[#2D241E] text-base sm:text-lg">
                  Choose what BeeYou helps you with
                </h3>
                <p className="text-xs text-[#7A6C60] font-semibold mt-0.5">
                  Switch off any tools you don't need. They will disappear from your home dashboard, shortcuts, and menus.
                  You can toggle them back on anytime.
                </p>
              </div>

              {FEATURE_GROUPS.map((group) => {
                const rows = group.keys
                  .map((k) => featureList.find((f) => f.key === k))
                  .filter((f): f is NonNullable<typeof f> => !!f);
                if (rows.length === 0) return null;
                return (
                  <section key={group.id} aria-labelledby={`fg-${group.id}`} className="space-y-2.5">
                    <div>
                      <h4 id={`fg-${group.id}`} className="font-black text-[#2D241E] text-sm sm:text-base flex items-center gap-1.5">
                        <span aria-hidden="true">{group.emoji}</span>
                        <span>{group.title}</span>
                      </h4>
                      <p className="text-[11px] text-[#7A6C60] font-semibold">{group.blurb}</p>
                    </div>

                    <div className="space-y-2">
                      {rows.map((f) => {
                        const isEnabled = enabledFeatures?.[f.key] !== false;
                        return (
                          <div
                            key={f.key}
                            className="p-3.5 sm:p-4 rounded-2xl bg-[#FCF9F2] border-2 border-[#E0D8CB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="text-2xl shrink-0 p-2 bg-[#F5EFE6] rounded-xl border border-[#E0D8CB]" aria-hidden="true">
                                {f.emoji}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-black text-[#2D241E] text-xs sm:text-sm">
                                  {f.title}
                                </h5>
                                <p className="text-[11px] text-[#7A6C60] font-semibold truncate">
                                  {f.desc}
                                </p>
                              </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <span className="sr-only">{f.title}</span>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => {
                                  updateEnabledFeatures({ [f.key]: e.target.checked });
                                  playChime('tap');
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-[#E0D8CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-xs peer-checked:bg-[#9B72AA]"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E0D8CB] flex items-center justify-end bg-[#FCF9F2] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-2xl bg-[#2D241E] hover:bg-[#1E1814] text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-md"
          >
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
};
