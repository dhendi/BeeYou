import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Wind, 
  Heart, 
  Sparkles, 
  Clock, 
  Volume2, 
  Sliders,
  Check,
  Smile,
  Shield,
  Activity
} from 'lucide-react';
import { CalmCopingStrategy, BreathingPacerConfig } from '../types';
import { playChime } from '../utils/audio';

export const EditCalmModal: React.FC = () => {
  const {
    showEditCalmModal,
    setShowEditCalmModal,
    calmStrategies,
    addCalmStrategy,
    updateCalmStrategy,
    deleteCalmStrategy,
    resetCalmStrategies,
    breathingConfig,
    updateBreathingConfig,
    resetBreathingConfig,
    speak,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pacer' | 'strategies'>('pacer');

  // New calm strategy form state
  const [newStrategy, setNewStrategy] = useState<Omit<CalmCopingStrategy, 'id'>>({
    title: '',
    instruction: '',
    emoji: '🧘',
    category: 'sensory',
    durationMin: 3,
  });
  const [showAddStrategyForm, setShowAddStrategyForm] = useState(false);

  if (!showEditCalmModal) return null;

  const handleSaveNewStrategy = () => {
    if (!newStrategy.title.trim()) return;
    addCalmStrategy({
      ...newStrategy,
      instruction: newStrategy.instruction.trim() || newStrategy.title,
    });
    setNewStrategy({
      title: '',
      instruction: '',
      emoji: '🧘',
      category: 'sensory',
      durationMin: 3,
    });
    setShowAddStrategyForm(false);
  };

  const pacerPresets = [
    { id: 'box_4_4_4_4' as const, name: 'Box Breathing (4-4-4-4)', inhale: 4, hold: 4, exhale: 4, pause: 4, desc: 'Balance & stress reduction' },
    { id: 'relax_4_7_8' as const, name: 'Relaxing 4-7-8', inhale: 4, hold: 7, exhale: 8, pause: 1, desc: 'Deep calm & sleep readiness' },
    { id: 'calm_4_2_6' as const, name: 'Calming Flow 4-2-6', inhale: 4, hold: 2, exhale: 6, pause: 1, desc: 'Quick sensory de-escalation' },
    { id: 'gentle_3_3_3' as const, name: 'Gentle Pacer 3-3-3', inhale: 3, hold: 3, exhale: 3, pause: 1, desc: 'Easy for younger children' },
  ];

  return (
    <div className="fixed inset-0 z-[220] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customization</p>
              <h2 className="text-xl font-black text-slate-800">Customize Calm Down Tools 🫁</h2>
            </div>
          </div>
          <button
            onClick={() => setShowEditCalmModal(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          {[
            { id: 'pacer' as const, label: 'Breathing Pacer Timings', icon: Wind },
            { id: 'strategies' as const, label: 'Coping Strategies Catalog', icon: Heart, count: calmStrategies.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); playChime('tap'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: BREATHING PACER SETTINGS */}
          {activeTab === 'pacer' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Select a clinical breathing pattern or customize the exact second intervals
                </p>
                <button
                  onClick={() => { resetBreathingConfig(); playChime('complete'); }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Pacer
                </button>
              </div>

              {/* Preset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pacerPresets.map((preset) => {
                  const isSelected = 
                    breathingConfig.inhaleSec === preset.inhale &&
                    breathingConfig.holdSec === preset.hold &&
                    breathingConfig.exhaleSec === preset.exhale &&
                    (breathingConfig.pauseSec ?? 1) === preset.pause;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateBreathingConfig({
                          pattern: preset.id,
                          inhaleSec: preset.inhale,
                          holdSec: preset.hold,
                          exhaleSec: preset.exhale,
                          pauseSec: preset.pause,
                        });
                        playChime('tap');
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{preset.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-teal-600 font-bold" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                      <div className="flex gap-2 mt-2 text-[10px] font-mono font-bold text-teal-700">
                        <span>Inhale: {preset.inhale}s</span>
                        <span>Hold: {preset.hold}s</span>
                        <span>Exhale: {preset.exhale}s</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Interval Sliders */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Custom Second Timers</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Inhale */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Inhale</span>
                      <span className="text-teal-600 font-mono">{breathingConfig.inhaleSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={breathingConfig.inhaleSec}
                      onChange={(e) => updateBreathingConfig({ inhaleSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  {/* Hold */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Hold</span>
                      <span className="text-teal-600 font-mono">{breathingConfig.holdSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={breathingConfig.holdSec}
                      onChange={(e) => updateBreathingConfig({ holdSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  {/* Exhale */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Exhale</span>
                      <span className="text-teal-600 font-mono">{breathingConfig.exhaleSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={breathingConfig.exhaleSec}
                      onChange={(e) => updateBreathingConfig({ exhaleSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-teal-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COPING STRATEGIES CATALOG */}
          {activeTab === 'strategies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Manage personal calm strategies displayed in the Coping Toolkit
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { resetCalmStrategies(); playChime('complete'); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setShowAddStrategyForm(!showAddStrategyForm)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Strategy
                  </button>
                </div>
              </div>

              {/* Add New Strategy Form */}
              {showAddStrategyForm && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-black text-teal-900 uppercase tracking-wider">New Calm Coping Strategy</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Strategy Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Squeeze Squishy Dino"
                        value={newStrategy.title}
                        onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        placeholder="e.g. 🦕, 🎧, 🧊, 🧘"
                        value={newStrategy.emoji}
                        onChange={(e) => setNewStrategy({ ...newStrategy, emoji: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-teal-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Gentle Instructions / Prompts</label>
                      <input
                        type="text"
                        placeholder="e.g. Hold the dinosaur across lap and take 3 deep belly breaths"
                        value={newStrategy.instruction}
                        onChange={(e) => setNewStrategy({ ...newStrategy, instruction: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-teal-600"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddStrategyForm(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewStrategy}
                      disabled={!newStrategy.title.trim()}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white cursor-pointer"
                    >
                      Save Strategy
                    </button>
                  </div>
                </div>
              )}

              {/* Strategy List */}
              <div className="space-y-2.5">
                {calmStrategies.map((strat) => (
                  <div
                    key={strat.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 flex-shrink-0">{strat.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 truncate">{strat.title}</p>
                          {strat.isCustom && (
                            <span className="px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-700 text-[10px] font-black">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{strat.instruction}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => speak(strat.instruction || strat.title)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                        title="Read instruction"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCalmStrategy(strat.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                        title="Delete strategy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Settings are saved automatically to your device.</p>
          <button
            onClick={() => setShowEditCalmModal(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
