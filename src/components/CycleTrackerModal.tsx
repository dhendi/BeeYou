import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Sparkles,
  Heart,
  X,
  Plus,
  Trash2,
  Clock,
  Volume2,
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Droplet,
  Zap,
  Moon,
  Smile,
  Activity
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { FlowIntensity, CycleSymptom, CycleDailyLog } from '../types';

export const CycleTrackerModal: React.FC = () => {
  const {
    cycleSettings,
    updateCycleSettings,
    cycleLogs,
    logCycleDay,
    deleteCycleLog,
    showCycleTrackerModal,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
    speak,
    announce,
    childProfile,
    userAgeGroup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'settings'>('log');

  // Daily Log Form State
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<CycleSymptom[]>([]);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [moodSummary, setMoodSummary] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Settings Edit State
  const [editCycleLen, setEditCycleLen] = useState<number>(cycleSettings?.averageCycleLength || 28);
  const [editPeriodLen, setEditPeriodLen] = useState<number>(cycleSettings?.averagePeriodLength || 5);
  const [editStartDate, setEditStartDate] = useState<string>(cycleSettings?.lastPeriodStartDate || '');
  const [editDiscreet, setEditDiscreet] = useState<boolean>(cycleSettings?.discreetMode || false);
  const [editSensoryTrack, setEditSensoryTrack] = useState<boolean>(cycleSettings?.trackSensoryAmplification ?? true);

  if (!showCycleTrackerModal) return null;

  const cycleInfo = getCyclePhaseInfo();

  const flowOptions: { id: FlowIntensity; label: string; emoji: string; color: string }[] = [
    { id: 'none', label: 'No Flow', emoji: '⚪', color: 'border-slate-200 text-slate-700 bg-white' },
    { id: 'spotting', label: 'Spotting', emoji: '💧', color: 'border-rose-200 text-rose-700 bg-rose-50' },
    { id: 'light', label: 'Light', emoji: '🌸', color: 'border-rose-300 text-rose-800 bg-rose-100' },
    { id: 'medium', label: 'Medium', emoji: '🩸', color: 'border-rose-400 text-rose-900 bg-rose-200' },
    { id: 'heavy', label: 'Heavy', emoji: '🔴', color: 'border-rose-600 text-rose-950 bg-rose-300' },
  ];

  const physicalSymptoms: { id: CycleSymptom; label: string; emoji: string }[] = [
    { id: 'cramps', label: 'Pelvic Cramps', emoji: '😣' },
    { id: 'headache', label: 'Headache / Migraine', emoji: '🤕' },
    { id: 'fatigue', label: 'Physical Exhaustion', emoji: '🥱' },
    { id: 'bloating', label: 'Abdominal Bloating', emoji: '🎈' },
    { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '🌸' },
    { id: 'backache', label: 'Lower Backache', emoji: '⚡' },
    { id: 'nausea', label: 'Nausea / GI Upset', emoji: '🤢' },
    { id: 'acne', label: 'Skin Breakouts', emoji: '✨' },
    { id: 'joint_muscle_pain', label: 'Joint & Muscle Aches', emoji: '🦴' },
  ];

  const neuroSymptoms: { id: CycleSymptom; label: string; emoji: string }[] = [
    { id: 'sensory_amplification', label: 'Heightened Sensory Sensitivity', emoji: '🔊' },
    { id: 'sensory_overload', label: 'Rapid Sensory Overload', emoji: '🌊' },
    { id: 'executive_dysfunction_dip', label: 'Executive Functioning Dip', emoji: '🌀' },
    { id: 'brain_fog', label: 'Brain Fog & Memory Lag', emoji: '🌫️' },
    { id: 'rejection_sensitivity', label: 'Rejection Sensitivity (RSD)', emoji: '💔' },
    { id: 'mood_swings_irritability', label: 'Irritability / Low Patience', emoji: '⚡' },
    { id: 'insomnia_restless_sleep', label: 'Restless Sleep / Vivid Dreams', emoji: '🌙' },
    { id: 'cravings_comfort_food', label: 'Sensory Comfort Cravings', emoji: '🍫' },
  ];

  const toggleSymptom = (s: CycleSymptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handlePeriodStartToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    updateCycleSettings({ lastPeriodStartDate: todayStr });
    logCycleDay({
      date: todayStr,
      flow: 'medium',
      symptoms: ['cramps'],
      painLevel: 4,
      energyLevel: 2,
      moodSummary: 'Period started',
      notes: 'Logged period start today.',
    });
    playChime('star');
    announce('Period start recorded. Take good care of your body today.');
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    logCycleDay({
      date: logDate,
      flow,
      symptoms: selectedSymptoms,
      painLevel,
      energyLevel,
      moodSummary: moodSummary.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setActiveTab('history');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCycleSettings({
      averageCycleLength: Math.max(20, editCycleLen),
      averagePeriodLength: Math.max(2, editPeriodLen),
      lastPeriodStartDate: editStartDate,
      discreetMode: editDiscreet,
      trackSensoryAmplification: editSensoryTrack,
    });
    playChime('tap');
    setActiveTab('log');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border-2 border-rose-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-xs">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  {cycleSettings.discreetMode ? 'Wellness Rhythm' : 'Cycle & Hormonal Health'}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {childProfile.name}'s Tracker
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                {cycleSettings.discreetMode ? 'Body Rhythm & Sensory Tracker' : 'Menstrual Cycle Tracker'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCycleTrackerModal(false);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Hero Banner */}
        <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-pink-50 p-4 sm:p-5 border-b border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                Day {cycleInfo.currentCycleDay} of {cycleSettings.averageCycleLength}
              </span>
              <span className="text-xs font-bold text-rose-900">
                {cycleInfo.phaseLabel}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-snug">
              {cycleInfo.phaseDescription}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900 bg-white/80 px-2.5 py-1 rounded-xl border border-purple-200 w-fit mt-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Sensory tip: {cycleInfo.sensoryInsight}</span>
            </div>
          </div>

          {/* Quick period start button */}
          <div className="flex flex-col sm:items-end gap-1 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePeriodStartToday}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5 fill-rose-200" />
              <span>Period Started Today</span>
            </button>
            <span className="text-[10px] font-bold text-slate-500">
              Next expected: {cycleInfo.nextPeriodDate} ({cycleInfo.daysUntilNextPeriod} days)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('log');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Log Symptoms</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Cycle History ({cycleLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Cycle Settings</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: DAILY LOGGING */}
          {activeTab === 'log' && (
            <form onSubmit={handleSaveDailyLog} className="space-y-5">
              {/* Date & Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    Menstrual Flow
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {flowOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFlow(opt.id)}
                        className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          flow === opt.id
                            ? `${opt.color} ring-2 ring-rose-500 font-black shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        <span className="text-lg block leading-none">{opt.emoji}</span>
                        <span className="text-[10px] mt-1 block truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pain & Energy Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Cramp / Pain Scale</span>
                    <span className="font-black text-rose-700">{painLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>None (0)</span>
                    <span>Mild (3)</span>
                    <span>Moderate (6)</span>
                    <span>Severe (10)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Energy Level</span>
                    <span className="font-black text-amber-700">
                      {['Drained 🔋', 'Low 🪫', 'Steady ⚡', 'High 🚀', 'Overcharged 💥'][energyLevel - 1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Low</span>
                    <span>Balanced</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Physical Symptoms */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  Physical Symptoms
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {physicalSymptoms.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym.id);
                    return (
                      <button
                        type="button"
                        key={sym.id}
                        onClick={() => toggleSymptom(sym.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{sym.emoji}</span>
                        <span>{sym.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neurodivergent / Sensory & Cognitive Symptoms */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-black text-purple-900 uppercase tracking-wider block">
                    Neurodivergent & Sensory Hormonal Signals
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Autism / ADHD Lens
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {neuroSymptoms.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym.id);
                    return (
                      <button
                        type="button"
                        key={sym.id}
                        onClick={() => toggleSymptom(sym.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 text-purple-900 border border-purple-300 font-black shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{sym.emoji}</span>
                        <span>{sym.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  Notes & Self-Care Observation
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Used heating pad, took warm shower, avoided bright fluorescent lights today."
                  className="w-full p-3 rounded-2xl bg-white border border-slate-300 font-medium text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-md shadow-rose-200 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-rose-200" />
                  <span>Save Cycle Log</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {cycleLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="font-semibold text-sm">No cycle logs recorded yet.</p>
                  <p className="text-xs mt-1">Log today's flow and symptoms to start seeing patterns.</p>
                </div>
              ) : (
                cycleLogs.map((log) => {
                  const flowObj = flowOptions.find((f) => f.id === log.flow);
                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{log.date}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${flowObj?.color || ''}`}>
                            {flowObj?.emoji} {flowObj?.label}
                          </span>
                          {log.painLevel > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              Pain {log.painLevel}/10
                            </span>
                          )}
                        </div>

                        {log.notes && (
                          <p className="text-xs text-slate-600 font-medium">"{log.notes}"</p>
                        )}

                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.symptoms.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200"
                            >
                              {s.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this log entry?')) {
                            deleteCycleLog(log.id);
                          }
                        }}
                        className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 cursor-pointer self-end sm:self-center"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Adjusting your cycle parameters personalizes future phase and period predictions.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Average Cycle Length (Days)
                </label>
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={editCycleLen}
                  onChange={(e) => setEditCycleLen(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Typical cycle length is 28 days (usually 21–35 days).
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Average Period Duration (Days)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={editPeriodLen}
                  onChange={(e) => setEditPeriodLen(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Last Period Start Date
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSensoryTrack}
                    onChange={(e) => setEditSensoryTrack(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Track Neurodivergent & Sensory Amplification in Luteal Phase
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDiscreet}
                    onChange={(e) => setEditDiscreet(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Discreet Mode (Uses "Wellness Rhythm" and subtle icons for privacy)
                  </span>
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            🔒 Completely private & saved locally on your device
          </span>

          <button
            type="button"
            onClick={() => {
              setShowCycleTrackerModal(false);
              playChime('tap');
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
