import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, Save, Trash2, Plus } from 'lucide-react';

interface CaregiverPlansChangedTabProps {
  onShowNotification: (msg: string) => void;
}

export const CaregiverPlansChangedTab: React.FC<CaregiverPlansChangedTabProps> = ({ onShowNotification }) => {
  const {
    plansChanged,
    activatePlansChanged,
    dismissPlansChanged,
    setShowPlansChangedModal,
  } = useApp();

  const [pcActive, setPcActive] = useState(plansChanged.active);
  const [pcOriginal, setPcOriginal] = useState(plansChanged.originalPlanTitle);
  const [pcReason, setPcReason] = useState(plansChanged.reason);
  const [pcNewTitle, setPcNewTitle] = useState(plansChanged.newPlanTitle);
  const [pcCalming, setPcCalming] = useState(plansChanged.calmingMessage);
  const [pcSteps, setPcSteps] = useState(plansChanged.newSteps);
  const [pcPhrases, setPcPhrases] = useState(plansChanged.relevantPhrases);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepEmoji, setNewStepEmoji] = useState('⭐');
  const [newStepTime, setNewStepTime] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');

  const handleSavePlansChanged = () => {
    activatePlansChanged({
      active: pcActive,
      originalPlanTitle: pcOriginal,
      reason: pcReason,
      newPlanTitle: pcNewTitle,
      calmingMessage: pcCalming,
      newSteps: pcSteps,
      relevantPhrases: pcPhrases,
    });
    onShowNotification('Plans Changed configuration updated successfully!');
  };

  const handleApplyPreset = (preset: 'dentist' | 'rain' | 'school') => {
    if (preset === 'dentist') {
      setPcOriginal('Dentist Appointment at 2:00 PM');
      setPcReason('The dental clinic is closed today because the doctor is sick.');
      setPcNewTitle('Picnic Lunch & Park Swings');
      setPcCalming('It is completely normal to feel surprised or upset when plans change. Take a slow breath. You are safe, and here is our new calm plan.');
      setPcSteps([
        { title: 'Favorite pizza or mac & cheese at home', emoji: '🍕', time: '12:30 PM' },
        { title: 'Play on the swings at the sunny park', emoji: '🛝', time: '1:30 PM' },
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
        { title: 'Build living room blanket fort with pillows', emoji: '⛺', time: '11:00 AM' },
        { title: 'Warm cocoa and crackers snack', emoji: '☕', time: '12:00 PM' },
        { title: 'Watch favorite animal movie inside the fort', emoji: '🎬', time: '1:00 PM' },
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
        { title: 'Quiet sensory break with favorite toy', emoji: '🛋️', time: '1:00 PM' },
        { title: 'Free tablet and train play', emoji: '🚂', time: '2:00 PM' },
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
            <span>Plans Changed System</span>
            {pcActive && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                Active on Child Screen
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Prepare your child for unexpected schedule disruptions with calm explanations and reassuring alternatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlansChangedModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Child Modal</span>
          </button>
          <button
            onClick={handleSavePlansChanged}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Update</span>
          </button>
        </div>
      </div>

      {/* Status Toggle Card */}
      <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h4 className="font-black text-amber-950 text-sm">
            Activate "Plans Changed" Alert for Child
          </h4>
          <p className="text-xs text-amber-800 font-medium">
            When active, a calm notification card and contextual phrases appear in the child's app.
          </p>
        </div>
        <button
          onClick={() => setPcActive(!pcActive)}
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
      <div>
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
          Quick Presets (1-Tap Setup):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleApplyPreset('dentist')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all cursor-pointer"
          >
            <span className="text-2xl mb-1 block">🦷</span>
            <span className="font-black text-xs text-slate-800 block">Dentist/Doctor Closed</span>
            <span className="text-[11px] text-slate-500">Pizza lunch & playground instead</span>
          </button>
          <button
            onClick={() => handleApplyPreset('rain')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer"
          >
            <span className="text-2xl mb-1 block">🌧️</span>
            <span className="font-black text-xs text-slate-800 block">Rainy Day / Trip Cancelled</span>
            <span className="text-[11px] text-slate-500">Blanket fort & cozy movie</span>
          </button>
          <button
            onClick={() => handleApplyPreset('school')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer"
          >
            <span className="text-2xl mb-1 block">🏫</span>
            <span className="font-black text-xs text-slate-800 block">School Early Dismissal</span>
            <span className="text-[11px] text-slate-500">Pick up early & quiet afternoon</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              Original Plan (What is being replaced):
            </label>
            <input
              type="text"
              value={pcOriginal}
              onChange={(e) => setPcOriginal(e.target.value)}
              placeholder="e.g. Dentist appointment at 2:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">
              New Plan Title:
            </label>
            <input
              type="text"
              value={pcNewTitle}
              onChange={(e) => setPcNewTitle(e.target.value)}
              placeholder="e.g. Lunch & Park Swings"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">
            Calm Explanation (Why it changed):
          </label>
          <input
            type="text"
            value={pcReason}
            onChange={(e) => setPcReason(e.target.value)}
            placeholder="e.g. The dental clinic is closed today because the doctor is sick."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700 block mb-1">
            Reassuring Message for Child:
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
            New Plan Steps:
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
                <span className="text-2xl">{step.emoji}</span>
                <span className="flex-1 font-bold text-xs sm:text-sm text-slate-800">
                  {step.title}
                </span>
                {step.time && (
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {step.time}
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
              placeholder="Step name (e.g. Draw pictures at home)"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
            />
            <input
              type="text"
              value={newStepEmoji}
              onChange={(e) => setNewStepEmoji(e.target.value)}
              placeholder="Emoji"
              className="w-16 px-2 py-2 text-center rounded-xl bg-white border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={newStepTime}
              onChange={(e) => setNewStepTime(e.target.value)}
              placeholder="Time (optional)"
              className="w-28 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
            />
            <button
              onClick={() => {
                if (newStepTitle.trim()) {
                  setPcSteps([
                    ...pcSteps,
                    { title: newStepTitle.trim(), emoji: newStepEmoji || '⭐', time: newStepTime.trim() || undefined },
                  ]);
                  setNewStepTitle('');
                  setNewStepTime('');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

        {/* Relevant Communication Phrases */}
        <div>
          <label className="text-xs font-black text-slate-700 block mb-2">
            Child Communication Phrases for this Change:
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {pcPhrases.map((phrase, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-center gap-2"
              >
                <span>💬 {phrase}</span>
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
              placeholder="Add custom phrase (e.g. Can I have my dinosaur?)"
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
              Add Phrase
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              dismissPlansChanged();
              setPcActive(false);
              onShowNotification('Plans Changed deactivated.');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Clear & Deactivate
          </button>
          <button
            onClick={handleSavePlansChanged}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Activate Plans Changed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
