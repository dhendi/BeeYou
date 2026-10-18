import React, { useState, useEffect } from 'react';
import { t } from '../../services/translator';
import { useApp } from '../../context/AppContext';
import { Eye, Save, Trash2, Plus, Star, MessageSquare } from 'lucide-react';
import { playChime } from '../../utils/audio';
import { RoutineStickerIcon } from '../icons/JournalStickers';
import { IconLibraryModal } from '../common/IconLibraryModal';
import { pushFamilyStateUpdate } from '../../services/familySync';

interface CaregiverPlansChangedTabProps {
  onShowNotification: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverPlansChangedTab: React.FC<CaregiverPlansChangedTabProps> = ({ onShowNotification, onStartTour }) => {
  const {
    plansChanged,
    activatePlansChanged,
    dismissPlansChanged,
    setShowPlansChangedModal,
    routines,
  } = useApp();

  const [pcActive, setPcActive] = useState(plansChanged.active);
  const [pcTargetRoutine, setPcTargetRoutine] = useState<string>(
    plansChanged.targetRoutineId
      ? plansChanged.targetStepId
        ? `${plansChanged.targetRoutineId}:::${plansChanged.targetStepId}`
        : plansChanged.targetRoutineId
      : 'custom'
  );
  const [pcOriginal, setPcOriginal] = useState(plansChanged.originalPlanTitle);
  const [pcReason, setPcReason] = useState(plansChanged.reason);
  const [pcNewTitle, setPcNewTitle] = useState(plansChanged.newPlanTitle);
  const [pcCalming, setPcCalming] = useState(plansChanged.calmingMessage);
  const [pcSteps, setPcSteps] = useState(plansChanged.newSteps);
  const [pcPhrases, setPcPhrases] = useState(plansChanged.relevantPhrases);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepEmoji, setNewStepEmoji] = useState('');
  const [newStepTime, setNewStepTime] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [pickingForStepIndex, setPickingForStepIndex] = useState<number | null>(null);

  // Re-render when language changes
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const handleLangChange = () => setLangTick((n) => n + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChange);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChange);
  }, []);

  useEffect(() => {
    setPcActive(Boolean(plansChanged.active));
  }, [plansChanged.active]);

  const applyStateUpdate = (newActiveState: boolean) => {
    let targetRoutineId: string | undefined = undefined;
    let targetStepId: string | undefined = undefined;

    if (pcTargetRoutine !== 'custom') {
      if (pcTargetRoutine.includes(':::')) {
        const [rId, sId] = pcTargetRoutine.split(':::');
        targetRoutineId = rId;
        targetStepId = sId;
      } else {
        targetRoutineId = pcTargetRoutine;
      }
    }

    const payload = {
      active: newActiveState,
      originalPlanTitle: pcOriginal,
      reason: pcReason,
      newPlanTitle: pcNewTitle,
      calmingMessage: pcCalming,
      newSteps: pcSteps,
      relevantPhrases: pcPhrases,
      targetRoutineId,
      targetStepId,
    };

    activatePlansChanged(payload);
    pushFamilyStateUpdate({ plansChanged: payload });
  };

  const handleTogglePlansChanged = (newActive: boolean) => {
    setPcActive(newActive);
    applyStateUpdate(newActive);
    onShowNotification(
      newActive
        ? t('Plans Changed alert is now ACTIVE on the child screen!')
        : t('Plans Changed alert deactivated.')
    );
  };

  const handleSavePlansChanged = () => {
    applyStateUpdate(pcActive);
    onShowNotification(t('Plans Changed configuration saved & synced!'));
  };

  const handleApplyPreset = (preset: 'dentist' | 'rain' | 'school') => {
    if (preset === 'dentist') {
      setPcOriginal('Dentist Appointment at 2:00 PM');
      setPcReason('The dental clinic is closed today because the doctor is sick.');
      setPcNewTitle('Picnic Lunch & Park Swings');
      setPcCalming('It is completely normal to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.');
      setPcSteps([
        { title: 'Favorite pizza lunch at home', emoji: '🍕', time: '12:30 PM' },
        { title: 'Play at the sunny playground swings', emoji: '🛝', time: '1:30 PM' },
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
        { title: 'Build living room blanket fort with pillows', emoji: '🛋️', time: '11:00 AM' },
        { title: 'Warm cocoa and crackers snack', emoji: '☕', time: '12:00 PM' },
        { title: 'Watch favorite animal movie inside the fort', emoji: '🧸', time: '1:00 PM' },
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
        { title: 'Quiet sensory break with favorite toy', emoji: '🧸', time: '1:00 PM' },
        { title: 'Free tablet and train play', emoji: '📱', time: '2:00 PM' },
      ]);
      setPcPhrases([
        'Why did school finish early?',
        'Where is my teacher?',
        'Are my friends okay?',
        'I am glad to be home.',
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>{t("Plans Changed System")}</span>
            {pcActive && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                {t("Active on Child Screen")}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t("Prepare your child for unexpected schedule disruptions with calm explanations and reassuring alternatives.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onStartTour();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300"
              title={t("Tour this section")}
            >
              <Star className="w-4 h-4 text-amber-600" />
              <span>{t("How This Works (Tour)")}</span>
            </button>
          )}
          <button
            onClick={() => setShowPlansChangedModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t("Preview Child Modal")}</span>
          </button>
          <button
            onClick={handleSavePlansChanged}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t("Save & Update")}</span>
          </button>
        </div>
      </div>

      {/* Status Toggle Card */}
      <div data-tour="plans-changed-toggle-card" className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h4 className="font-black text-amber-950 text-sm">
            {t("Activate \"Plans Changed\" Alert for Child")}
          </h4>
          <p className="text-xs text-amber-800 font-medium">
            {t("When active, a calm notification card and contextual phrases appear in the child's app.")}
          </p>
        </div>
        <button
          onClick={() => handleTogglePlansChanged(!pcActive)}
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

      {/* Quick Presets */}
      <div data-tour="plans-changed-replacement-picker">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
          {t("Quick Presets (1-Tap Setup):")}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleApplyPreset('dentist')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center p-0.5 mb-1.5 shrink-0">
              <img src="/assets/stickers/stethoscope.webp" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-800 block">{t("Dentist/Doctor Closed")}</span>
              <span className="text-[11px] text-slate-500">{t("Pizza lunch & playground instead")}</span>
            </div>
          </button>
          <button
            onClick={() => handleApplyPreset('rain')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center p-0.5 mb-1.5 shrink-0">
              <img src="/assets/stickers/rain_cloud.webp" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-800 block">{t("Rainy Day / Trip Cancelled")}</span>
              <span className="text-[11px] text-slate-500">{t("Blanket fort & cozy movie")}</span>
            </div>
          </button>
          <button
            onClick={() => handleApplyPreset('school')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center p-0.5 mb-1.5 shrink-0">
              <img src="/assets/stickers/school_building.webp" alt="" className="w-full h-full object-contain drop-shadow-2xs" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-800 block">{t("School Early Dismissal")}</span>
              <span className="text-[11px] text-slate-500">{t("Pick up early & quiet afternoon")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div data-tour="plans-changed-message-input" className="space-y-4">
        {/* Routine Selector Dropdown */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <span>📅</span>
            <span>{t("Select which part of the routine changed (or type custom):")}</span>
          </label>
          <select
            value={pcTargetRoutine}
            onChange={(e) => {
              const val = e.target.value;
              setPcTargetRoutine(val);
              if (val && val !== 'custom') {
                if (val.includes(':::')) {
                  const [rId, sId] = val.split(':::');
                  const r = routines.find((item) => item.id === rId);
                  const st = r?.steps.find((s) => s.id === sId);
                  if (st && r) {
                    setPcOriginal(`${r.title}: ${st.title}${st.time ? ` (${st.time})` : ''}`);
                  }
                } else {
                  const r = routines.find((item) => item.id === val);
                  if (r) {
                    setPcOriginal(`${r.title}${r.time ? ` (${r.time})` : ''}`);
                  }
                }
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white cursor-pointer"
          >
            <option value="custom">✍️ {t("Custom event / appointment (type manually)")}</option>
            {routines.map((routine) => (
              <optgroup key={routine.id} label={`${routine.emoji} ${routine.title}`}>
                <option value={routine.id}>
                  {t("Entire Routine:")} {routine.title} {routine.time ? `(${routine.time})` : ''}
                </option>
                {routine.steps?.map((step) => (
                  <option key={step.id} value={`${routine.id}:::${step.id}`}>
                    &nbsp;&nbsp;↳ {t("Step:")} {step.emoji} {step.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              {t("Original Plan (What is being replaced):")}
            </label>
            <input
              type="text"
              value={pcOriginal}
              onChange={(e) => setPcOriginal(e.target.value)}
              placeholder={t("e.g. Dentist appointment at 2:00 PM")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              {t("New Plan Title:")}
            </label>
            <input
              type="text"
              value={pcNewTitle}
              onChange={(e) => setPcNewTitle(e.target.value)}
              placeholder={t("e.g. Lunch & Park Swings")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">
            {t("Calm Explanation (Why it changed):")}
          </label>
          <input
            type="text"
            value={pcReason}
            onChange={(e) => setPcReason(e.target.value)}
            placeholder={t("e.g. The dental clinic is closed today because the doctor is sick.")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">
            {t("Reassuring Message for Child:")}
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
            {t("New Plan Steps:")}
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
                <button
                  type="button"
                  onClick={() => {
                    setPickingForStepIndex(idx);
                    setShowIconLibrary(true);
                    playChime('tap');
                  }}
                  className="w-9 h-9 rounded-xl hover:bg-amber-100/80 flex items-center justify-center shrink-0 border border-transparent hover:border-amber-300 transition-all cursor-pointer group"
                  title={t("Click to pick icon from library")}
                >
                  <RoutineStickerIcon emoji={step.emoji} title={step.title} className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
                </button>
                <span className="flex-1 font-bold text-xs sm:text-sm text-slate-800">
                  {t(step.title)}
                </span>
                {step.time && (
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {t(step.time)}
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
              placeholder={t("Step name (e.g. Draw pictures at home)")}
              className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {/* Interactive Icon Library Picker Button */}
            <button
              type="button"
              onClick={() => {
                setPickingForStepIndex(null);
                setShowIconLibrary(true);
                playChime('tap');
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-300 hover:border-amber-400 flex items-center gap-2 transition-all cursor-pointer shadow-2xs group shrink-0 active:scale-95"
              title={t("Pick an icon from our icon library")}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {newStepEmoji ? (
                  <RoutineStickerIcon emoji={newStepEmoji} title="Selected icon" className="w-6 h-6 object-contain drop-shadow-2xs" />
                ) : (
                  <Plus className="w-4 h-4 text-amber-700" />
                )}
              </div>
              <span className="text-xs font-black text-amber-950">
                {t("Icon")}
              </span>
              <Star className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
            </button>
            <input
              type="text"
              value={newStepTime}
              onChange={(e) => setNewStepTime(e.target.value)}
              placeholder={t("Time (optional)")}
              className="w-28 px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => {
                if (newStepTitle.trim()) {
                  setPcSteps([
                    ...pcSteps,
                    { title: newStepTitle.trim(), emoji: newStepEmoji || '/assets/stickers/star_gold.webp', time: newStepTime.trim() || undefined },
                  ]);
                  setNewStepTitle('');
                  setNewStepTime('');
                  setNewStepEmoji('');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("Add Step")}</span>
            </button>
          </div>
        </div>

        {/* Relevant Communication Phrases */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-2">
            {t("Child Communication Phrases for this Change:")}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {pcPhrases.map((phrase, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-center gap-2"
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t(phrase)}</span>
                </span>
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
              placeholder={t("Add custom phrase (e.g. Can I have my dinosaur?)")}
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
              {t("Add Phrase")}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              dismissPlansChanged();
              setPcActive(false);
              onShowNotification(t('Plans Changed alert deactivated.'));
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            {t("Clear & Deactivate")}
          </button>
          <button
            onClick={handleSavePlansChanged}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t("Save & Activate Plans Changed")}</span>
          </button>
        </div>
      </div>

      {/* Icon Library Modal */}
      <IconLibraryModal
        isOpen={showIconLibrary}
        onClose={() => {
          setShowIconLibrary(false);
          setPickingForStepIndex(null);
        }}
        selectedEmoji={pickingForStepIndex !== null ? pcSteps[pickingForStepIndex]?.emoji : newStepEmoji}
        onSelectIcon={(emoji, _label) => {
          if (pickingForStepIndex !== null) {
            const updated = [...pcSteps];
            updated[pickingForStepIndex] = { ...updated[pickingForStepIndex], emoji };
            setPcSteps(updated);
          } else {
            setNewStepEmoji(emoji);
          }
        }}
      />
    </div>
  );
};
