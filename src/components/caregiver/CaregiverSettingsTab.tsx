import React, { useRef } from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { UserAgeGroup, DEFAULT_KID_FEATURES, DEFAULT_TEEN_FEATURES, DEFAULT_ADULT_FEATURES } from '../../types';
import { playChime } from '../../utils/audio';
import { 
  FileJson, 
  Download, 
  Upload, 
  Check,
  Lightbulb,
  Star,
  Wind,
  Settings as SettingsIcon
} from 'lucide-react';

interface CaregiverSettingsTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverSettingsTab: React.FC<CaregiverSettingsTabProps> = ({ 
  onShowNotification,
  onStartTour,
}) => {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t("Settings & Security")}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Protect parent controls and configure device preferences.")}
          </p>
        </div>
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t("How This Works")}</span>
          </button>
        )}
      </div>

      {/* AGE EXPERIENCE & SETUP WIZARD */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-800">{t("Age Experience Mode")}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("Controls terminology, visual tone, and recommended feature layouts.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              reopenOnboarding();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Star className="w-3.5 h-3.5" />
            <span>{t("Relaunch Onboarding Setup Wizard")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'kid', label: 'Kids (3–11)', sticker: '/assets/stickers/child_persona.png', desc: 'Mascots, routine stickers, First/Then' },
            { id: 'teen', label: 'Teens (12–17)', sticker: '/assets/stickers/teen_headphones.png', desc: 'Modern lofi/cyber, countdowns, independence' },
            { id: 'adult', label: 'Adults (18+)', sticker: '/assets/stickers/adult_briefcase.png', desc: 'Executive function, discreet AAC, zero clutter' },
          ].map((a) => {
            const isSelected = userAgeGroup === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setUserAgeGroup(a.id as UserAgeGroup);
                  playChime('tap');
                }}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                    : 'border-slate-200 hover:bg-white bg-white/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={a.sticker} alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                  </div>
                  <span className="text-xs font-black text-slate-800">{a.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{a.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULAR FEATURES MATRIX */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-800">{t("Modular Feature Controls")}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("Turn any feature on or off. Adults can use stickers/mascots, and kids can have a minimal layout.")}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">{t("Presets:")}</span>
            <button
              type="button"
              onClick={() => {
                updateEnabledFeatures(DEFAULT_KID_FEATURES);
                playChime('star');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
            >
              {t("Kid")}
            </button>
            <button
              type="button"
              onClick={() => {
                updateEnabledFeatures(DEFAULT_TEEN_FEATURES);
                playChime('star');
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-xs cursor-pointer"
            >
              {t("Teen")}
            </button>
            <button
              type="button"
              onClick={() => {
                updateEnabledFeatures(DEFAULT_ADULT_FEATURES);
                playChime('star');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs cursor-pointer"
            >
              {t("Adult")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { key: 'aacCommunication', label: 'AAC Symbol & Speech Board', sticker: '/assets/stickers/speech_bubble.png', desc: 'Motor-planned AAC tiles with voice' },
            { key: 'visualCountdownTimer', label: 'Visual Countdown Timer', sticker: '/assets/stickers/timer_clock.png', desc: 'Activity countdown ring for routines' },
            { key: 'firstThenSchedules', label: 'First / Then Routine Cards', sticker: '/assets/stickers/clipboard_shutdown.png', desc: 'Clear step-by-step guidance' },
            { key: 'starsAndRewards', label: 'Badges & Digital Routine Stickers', sticker: '/assets/stickers/reward_trophy.png', desc: 'Achievement celebration & badges' },
            { key: 'mascotCompanion', label: 'Playful Mascot Companion', sticker: '/assets/stickers/bee_mascot.png', desc: 'Rex/Hopper cheer greetings & banner' },
            { key: 'dailyMoodRecollection', label: 'Daily Mood & Therapy Log', sticker: '/assets/stickers/evening_moon.png', desc: 'Evening reflection & therapist chart' },
            { key: 'medicationReminders', label: 'Medication & Health Reminders', sticker: '/assets/stickers/pill_capsule.png', desc: 'Schedule doses, inventory & refill alerts' },
            { key: 'moodJournal', label: 'Mood Journal & Self-Reflection (Teens & Adults)', sticker: '/assets/stickers/passport_book.png', desc: 'Nuanced emotions, sensory load & coping strategies' },
            { key: 'cycleTracker', label: 'Cycle & Hormonal Rhythm Tracker (Teens & Adults)', sticker: '/assets/stickers/circular_arrow.png', desc: 'Cycle phases, PMDD sensory shifts & discreet wellness' },
            { key: 'sensoryBreathingPacer', label: 'Sensory Breathing Pacer', sticker: '/assets/stickers/calm_wind.png', desc: 'Coping toolkit & breath circle' },
            { key: 'emergencyAlertSOS', label: 'Caregiver Alert SOS Button', sticker: '/assets/stickers/alert_sos_shield.png', desc: 'One-tap emergency & emotion broadcast' },
            { key: 'socialStories', label: 'Social Stories Preparation', sticker: '/assets/stickers/story_sharing.png', desc: 'Scenarios for outings and changes' },
            { key: 'lifeSkills', label: 'Step-by-Step Life Skills', sticker: '/assets/stickers/clothes_dressed.png', desc: 'Task analysis breakdowns for independence' },
            { key: 'discreetMode', label: 'Discreet Minimal Mode', sticker: '/assets/stickers/quiet_voice.png', desc: 'Text-focused layout, minimal clutter' },
          ].map((feat) => {
            const isChecked = enabledFeatures ? (enabledFeatures as any)[feat.key] !== false : true;
            return (
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                aria-label={`${feat.label}: ${isChecked ? 'Enabled' : 'Disabled'}. ${feat.desc}`}
                key={feat.key}
                onClick={() => {
                  toggleFeature(feat.key as any);
                  playChime('tap');
                }}
                className={`w-full text-left p-3 min-h-[48px] rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-amber-500/70 focus-visible:outline-none ${
                  isChecked ? 'border-amber-400 bg-white shadow-2xs' : 'border-slate-200 bg-slate-100/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl p-0.5 flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? 'bg-amber-50 border border-amber-200 shadow-2xs'
                        : 'bg-slate-200/80 border border-slate-300 grayscale opacity-60'
                    }`}
                    aria-hidden="true"
                  >
                    <img src={feat.sticker} alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{feat.label}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{feat.desc}</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    isChecked ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-300'
                  }`}
                  aria-hidden="true"
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACCESSIBILITY & AAC BUTTON DISPLAY OPTIONS */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300/80 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                <img src="/assets/stickers/art_crafts.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
              </div>
              <span>{t("AAC Tile Colors & Accessibility")}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t("Configure communication tile colors and fine-motor touch options.")}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            {t("Clinical Standard Available")}
          </span>
        </div>

        {/* AAC Button Background Modes */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
            {t("Tile Background Color Scheme:")}
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
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/assets/stickers/art_crafts.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                  </div>
                  {(settings.aacButtonColorMode || 'fitzgerald') === 'fitzgerald' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {t("Active (Default)")}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-2">
                  {t("Fitzgerald Key (Clinical)")}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                  {t("Color-codes tiles by speech grammar (Yellow = People, Green = Actions, Orange = Objects, Blue = Descriptors). Recommended by SLPs for visual scanning & motor planning.")}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-300" title={t("Yellow")} />
                <span className="w-3.5 h-3.5 rounded bg-emerald-200 border border-emerald-300" title={t("Green")} />
                <span className="w-3.5 h-3.5 rounded bg-orange-200 border border-orange-300" title={t("Orange")} />
                <span className="w-3.5 h-3.5 rounded bg-sky-200 border border-sky-300" title={t("Blue")} />
                <span className="w-3.5 h-3.5 rounded bg-purple-200 border border-purple-300" title={t("Purple")} />
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
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/assets/stickers/star_gold.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                  </div>
                  {settings.aacButtonColorMode === 'theme' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {t("Active")}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-2">
                  {t("Theme-Tinted Palette")}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                  {t("Adapts button backgrounds to match the equipped theme colors (e.g. emerald greens for turtles, sunny ambers for Leo). Great for older teens or adults seeking a unified look.")}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 ml-1">{t("Theme matching")}</span>
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
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/assets/stickers/sensory_bright_lights.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                  </div>
                  {settings.aacButtonColorMode === 'high_contrast_white' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {t("Active")}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-slate-900 mt-2">
                  {t("High-Contrast White")}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-snug">
                  {t("Pure white buttons with high-contrast dark borders. Eliminates background colors for communicators with visual sensitivities or CVI.")}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                <span className="w-3.5 h-3.5 rounded bg-white border-2 border-slate-900" />
                <span className="text-[10px] font-bold text-slate-600 ml-1">{t("High contrast")}</span>
              </div>
            </button>
          </div>
        </div>

        {/* AAC Button Size & Grid Density Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              {t("AAC Button Size & Grid Density:")}
            </label>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("Make buttons bigger for easier tapping and fine-motor needs, or smaller to fit more words on screen.")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { cols: 2 as const, label: 'Jumbo', desc: 'Largest touch targets (2 cols)', sticker: '/assets/stickers/fidget_bubbles.png' },
              { cols: 3 as const, label: 'Large', desc: 'Enlarged buttons (3 cols)', sticker: '/assets/stickers/fav_lego.png' },
              { cols: 4 as const, label: 'Standard', desc: 'Balanced grid (4-5 cols)', sticker: '/assets/stickers/jigsaw_puzzle.png' },
              { cols: 6 as const, label: 'Compact', desc: 'High density (6-7 cols)', sticker: '/assets/stickers/tablet_ipad.png' },
            ].map((preset) => {
              const isSelected = (settings.gridColumns || 4) === preset.cols;
              return (
                <button
                  key={preset.cols}
                  type="button"
                  onClick={() => {
                    const mappedSize = preset.cols <= 3 ? 'large' : preset.cols >= 6 ? 'small' : 'medium';
                    updateSettings({
                      gridColumns: preset.cols,
                      largeButtonMode: preset.cols <= 3,
                    });
                    try {
                      localStorage.setItem('beeyou_aac_button_size', mappedSize);
                      window.dispatchEvent(new CustomEvent('beeyou_aac_button_size_change', { detail: { size: mappedSize } }));
                    } catch {}
                    playChime('tap');
                  }}
                  className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                      <img src={preset.sticker} alt="" className="w-full h-full object-contain drop-shadow-2xs" />
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        {t("Active")}
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

        {/* Additional Motor & Visual Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* Color-Coded Action Cards Toggle */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                <img src="/assets/stickers/art_crafts.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">{t("Color-Coded Action Cards")}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">{t("Show multi-colored cards instead of unified yellow (Tools, Me, Communicate).")}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.colorCodedActionCards || false}
              onChange={(e) => updateSettings({ colorCodedActionCards: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                <img src="/assets/stickers/routine_writing_journal.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">{t("Extra-Large Label Text")}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{t("Enlarge text under AAC pictograms.")}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.largeButtonMode}
              onChange={(e) => updateSettings({ largeButtonMode: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                <img src="/assets/stickers/wall_clock.png" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">{t("Touch Hold Delay")}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{t("Accidental touch / tremor protection.")}</p>
              </div>
            </div>
            <select
              value={settings.touchHoldDelayMs || 0}
              onChange={(e) => updateSettings({ touchHoldDelayMs: parseInt(e.target.value) })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-slate-50 text-slate-800"
            >
              <option value={0}>{t("Instant (0 ms)")}</option>
              <option value={200}>{t("Light (200 ms)")}</option>
              <option value={400}>{t("Medium (400 ms)")}</option>
            </select>
          </div>
        </div>
      </div>

      <div data-tour="settings-pin-card" className="max-w-xs">
        <label className="text-xs font-black text-slate-700 block mb-1">
          {t("Parent Lock PIN:")}
        </label>
        <input
          type="text"
          maxLength={4}
          value={settings.pin}
          onChange={(e) => updateSettings({ pin: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-black text-center text-lg tracking-widest"
        />
        <span className="text-[11px] text-slate-400 mt-1 block">{t("Default: 1234")}</span>
      </div>

      <div data-tour="settings-notifications-card" className="space-y-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.soundEffects}
            onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-700">
            {t("Play cheerful auditory chimes on taps & completions")}
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
            {t("Speak word immediately upon tap (Immediate feedback)")}
          </span>
        </label>

        {/* Alert Notification Channels & Customizers */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {t("Alert & Help Customizer")}
            </h4>
            <button
              type="button"
              onClick={() => setShowEditAlertsModal(true)}
              className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{t("Edit Alert Buttons & Replies")}</span>
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
              <span>{t("Visual on-screen banners")}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundAlerts ?? true}
                onChange={(e) => updateSettings({ soundAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>{t("Sound chimes on alert")}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrationAlerts ?? true}
                onChange={(e) => updateSettings({ vibrationAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>{t("Vibration haptics")}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.spokenAlerts ?? false}
                onChange={(e) => updateSettings({ spokenAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>{t("Read responses aloud (TTS)")}</span>
            </label>
          </div>
        </div>

        {/* Calm Tools Customizer */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">
              {t("Calm Down Tools & Breathing Pacer")}
            </h4>
            <p className="text-[11px] text-teal-700 font-medium mt-0.5">
              {t("Customize second-by-second breathing timings (Box 4-4-4-4, 4-7-8) and manage personal coping strategies.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEditCalmModal(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>{t("Edit Calm Tools")}</span>
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
                {t("Profile Backup & Data Portability")}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t("Offline Safe")}
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {t("Export all personalized AAC symbols, voice setups, routines, skills, adventures, medication logs, and cycle data into a single offline backup file. Transfer or restore anytime across devices.")}
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
              {t("Export Backup (JSON)")}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-200 font-bold text-xs shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              {t("Restore from Backup File")}
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
          {t("Reset App State to Initial Sample Data")}
        </button>
      </div>
    </div>
  );
};
