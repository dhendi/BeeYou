import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trash2
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

  const [activeTab, setActiveTab] = useState<'summary' | 'log' | 'history' | 'settings'>('summary');

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

  useEffect(() => {
    if (cycleSettings) {
      setEditCycleLen(cycleSettings.averageCycleLength || 28);
      setEditPeriodLen(cycleSettings.averagePeriodLength || 5);
      setEditStartDate(cycleSettings.lastPeriodStartDate || '');
      setEditDiscreet(cycleSettings.discreetMode || false);
      setEditSensoryTrack(cycleSettings.trackSensoryAmplification ?? true);
    }
  }, [cycleSettings, showCycleTrackerModal]);

  if (!showCycleTrackerModal) return null;

  const cycleInfo = getCyclePhaseInfo();

  const flowOptions: { id: FlowIntensity; label: string; color: string }[] = [
    { id: 'none', label: 'No Flow', color: 'border-slate-200 text-slate-700 bg-white' },
    { id: 'spotting', label: 'Spotting', color: 'border-rose-200 text-rose-700 bg-rose-50' },
    { id: 'light', label: 'Light', color: 'border-rose-300 text-rose-800 bg-rose-100' },
    { id: 'medium', label: 'Medium', color: 'border-rose-400 text-rose-900 bg-rose-200' },
    { id: 'heavy', label: 'Heavy', color: 'border-rose-600 text-rose-950 bg-rose-300' },
  ];

  const physicalSymptoms: { id: CycleSymptom; label: string }[] = [
    { id: 'cramps', label: 'Pelvic Cramps' },
    { id: 'headache', label: 'Headache / Migraine' },
    { id: 'fatigue', label: 'Physical Exhaustion' },
    { id: 'bloating', label: 'Abdominal Bloating' },
    { id: 'breast_tenderness', label: 'Breast Tenderness' },
    { id: 'backache', label: 'Lower Backache' },
    { id: 'nausea', label: 'Nausea / GI Upset' },
    { id: 'acne', label: 'Skin Breakouts' },
    { id: 'joint_muscle_pain', label: 'Joint & Muscle Aches' },
  ];

  const neuroSymptoms: { id: CycleSymptom; label: string }[] = [
    { id: 'sensory_amplification', label: 'Heightened Sensory Sensitivity' },
    { id: 'sensory_overload', label: 'Rapid Sensory Overload' },
    { id: 'executive_dysfunction_dip', label: 'Executive Functioning Dip' },
    { id: 'brain_fog', label: 'Brain Fog & Memory Lag' },
    { id: 'rejection_sensitivity', label: 'Rejection Sensitivity (RSD)' },
    { id: 'mood_swings_irritability', label: 'Irritability / Low Patience' },
    { id: 'insomnia_restless_sleep', label: 'Restless Sleep / Vivid Dreams' },
    { id: 'cravings_comfort_food', label: 'Sensory Comfort Cravings' },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col border-2 border-rose-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                {cycleSettings.discreetMode ? 'Wellness Rhythm' : 'Cycle & Hormonal Health'}
              </span>
              <span className="text-xs text-white/80 font-medium">
                {childProfile.name ? `${childProfile.name}'s ` : ''}Tracker
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
              {cycleSettings.discreetMode ? 'Body Rhythm & Sensory Tracker' : 'Menstrual Cycle Tracker'}
            </h2>
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

            <div className="text-[11px] font-bold text-purple-900 bg-white/80 px-2.5 py-1 rounded-xl border border-purple-200 w-fit mt-1">
              <span>Sensory tip: {cycleInfo.sensoryInsight}</span>
            </div>
          </div>

          {/* Quick period start button */}
          <div className="flex flex-col sm:items-end gap-1 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePeriodStartToday}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer transition-all"
            >
              <span>Period Started Today</span>
            </button>
            <span className="text-[10px] font-bold text-slate-500">
              Next expected: {cycleInfo.nextPeriodDate} ({cycleInfo.daysUntilNextPeriod} days)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('summary');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>Summary & Rhythm</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('log');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'log'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>Log Symptoms</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>Cycle History ({cycleLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>Cycle Settings</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 0: SUMMARY & RHYTHM */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {/* Progress Bar & Phase Timeline */}
              <div className="bg-white rounded-2xl border-2 border-rose-100 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                      Current Cycle Progress
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Day {cycleInfo.currentCycleDay} of {cycleSettings.averageCycleLength} • {cycleInfo.phaseLabel}
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                    Next period expected: <span className="text-rose-700 font-black">{cycleInfo.nextPeriodDate}</span> ({cycleInfo.daysUntilNextPeriod} days)
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(4, Math.round((cycleInfo.currentCycleDay / cycleSettings.averageCycleLength) * 100)))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1.5 px-0.5">
                    <span>Day 1 (Period)</span>
                    <span>Day 14 (Ovulation)</span>
                    <span>Day {cycleSettings.averageCycleLength} (Full Cycle)</span>
                  </div>
                </div>

                {/* 4 Phases Visual Track */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    {
                      phase: 'menstrual',
                      title: 'Menstrual',
                      range: `Days 1–${cycleSettings.averagePeriodLength}`,
                      focus: 'Rest & Reset',
                      color: 'border-rose-400 bg-rose-50 text-rose-950',
                    },
                    {
                      phase: 'follicular',
                      title: 'Follicular',
                      range: `Days ${cycleSettings.averagePeriodLength + 1}–13`,
                      focus: 'Energy & Creativity',
                      color: 'border-emerald-300 bg-emerald-50 text-emerald-950',
                    },
                    {
                      phase: 'ovulatory',
                      title: 'Ovulatory',
                      range: 'Days 14–16',
                      focus: 'Peak Stamina',
                      color: 'border-amber-300 bg-amber-50 text-amber-950',
                    },
                    {
                      phase: 'luteal',
                      title: 'Luteal',
                      range: `Days 17–${cycleSettings.averageCycleLength}`,
                      focus: 'Sensory Care & Pacing',
                      color: 'border-purple-300 bg-purple-50 text-purple-950',
                    },
                  ].map((p) => {
                    const isCurrent = cycleInfo.currentPhase === p.phase;
                    return (
                      <div
                        key={p.phase}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          isCurrent
                            ? `${p.color} ring-2 ring-rose-500 shadow-xs font-black`
                            : 'bg-slate-50/70 border-slate-200 text-slate-600 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">{p.title}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold opacity-80">{p.range}</p>
                        <p className="text-[10px] font-semibold mt-1 truncate">{p.focus}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sensory & Neurodivergent Guidance */}
              <div className="bg-purple-50/80 rounded-2xl border-2 border-purple-200 p-4 sm:p-5 shadow-xs space-y-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                    Neurodivergent & Sensory Hormonal Guidance
                  </h4>
                  <p className="text-[11px] font-bold text-purple-700">
                    How your nervous system interacts with this cycle phase
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-purple-100">
                  {cycleInfo.sensoryInsight}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-950 block mb-0.5">Recommended Sensory Accommodations:</span>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      {cycleInfo.currentPhase === 'luteal' && (
                        <>
                          <li>Keep noise-cancelling headphones within arm's reach</li>
                          <li>Lower overhead fluorescent lighting / use soft amber lamps</li>
                          <li>Plan quiet buffer time between high-demand tasks</li>
                        </>
                      )}
                      {cycleInfo.currentPhase === 'menstrual' && (
                        <>
                          <li>Prioritize physical rest, weighted blankets, and heat packs</li>
                          <li>Comfort meals, gentle hydration, and loose-fitting clothing</li>
                          <li>Give yourself permission to pause non-essential chores</li>
                        </>
                      )}
                      {cycleInfo.currentPhase === 'follicular' && (
                        <>
                          <li>Great window for exploring new topics or visual projects</li>
                          <li>Cognitive stamina and verbal flow are at a monthly high</li>
                          <li>Balanced sensory tolerance for social or outdoor outings</li>
                        </>
                      )}
                      {cycleInfo.currentPhase === 'ovulatory' && (
                        <>
                          <li>High social motivation and quick verbal expression</li>
                          <li>Take scheduled mindful pauses to prevent sudden burnout</li>
                          <li>Stay hydrated and maintain stable sensory routines</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-950 block mb-0.5">Cycle Parameters:</span>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span>Average Cycle Length:</span>
                        <span className="font-black text-slate-900">{cycleSettings.averageCycleLength} days</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span>Average Period Duration:</span>
                        <span className="font-black text-slate-900">{cycleSettings.averagePeriodLength} days</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-100">
                        <span>Last Period Start:</span>
                        <span className="font-black text-slate-900">{cycleSettings.lastPeriodStartDate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Total Days Logged:</span>
                        <span className="font-black text-slate-900">{cycleLogs.length} logs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Log Card & Quick Action */}
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayLog = cycleLogs.find((l) => l.date === todayStr);

                return (
                  <div className="bg-rose-50/70 rounded-2xl border-2 border-rose-200 p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-rose-900">
                            Today's Daily Log ({todayStr})
                          </span>
                          {todayLog ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              Logged Today
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                              Not Logged Yet
                            </span>
                          )}
                        </div>

                        {todayLog ? (
                          <div className="text-xs text-slate-700 space-y-1 pt-1">
                            <p className="font-bold">
                              Flow: <span className="capitalize font-black text-rose-800">{todayLog.flow}</span> • Pain Level: <span className="font-black text-rose-800">{todayLog.painLevel}/10</span> • Energy: <span className="font-black text-amber-800">{todayLog.energyLevel}/5</span>
                            </p>
                            {todayLog.symptoms.length > 0 && (
                              <p className="text-[11px] text-slate-600">
                                Symptoms: {todayLog.symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}
                              </p>
                            )}
                            {todayLog.notes && (
                              <p className="text-[11px] italic text-slate-600">"{todayLog.notes}"</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600">
                            Keep your hormonal rhythms up to date by tracking today's flow, energy, cramps, and sensory symptoms.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setLogDate(todayStr);
                            setActiveTab('log');
                            playChime('tap');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer transition-all"
                        >
                          <span>{todayLog ? 'Edit Today\'s Log' : 'Log Today\'s Symptoms'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('history');
                            playChime('tap');
                          }}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-all"
                        >
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

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
                        className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          flow === opt.id
                            ? `${opt.color} ring-2 ring-rose-500 font-black shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        <span className="text-xs font-black block truncate">{opt.label}</span>
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
                    <span className="font-black text-amber-700 inline-flex items-center gap-1.5">
                      {['Drained', 'Low', 'Steady', 'High', 'Overcharged'][energyLevel - 1]}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 font-bold">{energyLevel}/5</span>
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
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-rose-600' : 'bg-slate-300'}`} />
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
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-600' : 'bg-slate-300'}`} />
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
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-md shadow-rose-200 cursor-pointer transition-all"
                >
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
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-flex items-center ${flowObj?.color || ''}`}>
                            {flowObj?.label}
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
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950">
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
            <span>Completely private & saved locally on your device</span>
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
