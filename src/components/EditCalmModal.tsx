import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Wind, 
  Heart, 
  Star, 
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
import { t } from '../services/translator';

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
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-6 py-4.5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center p-1.5 shadow-2xs">
              <img src="/assets/stickers/breathing_cloud.webp" alt="Calm Tools" className="w-8 h-8 object-contain drop-shadow-xs" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-100">Customization</p>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Customize Calm Down Tools</h2>
            </div>
          </div>
          <button
            onClick={() => {
              playChime('tap');
              setShowEditCalmModal(false);
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 sm:gap-2 px-3 sm:px-6 pt-3 pb-2.5 border-b-2 border-amber-200/80 bg-[#FFF9EE] overflow-x-auto no-scrollbar">
          {[
            { id: 'pacer' as const, label: 'Breathing Pacer Timings', icon: Wind },
            { id: 'strategies' as const, label: 'Coping Strategies Catalog', icon: Heart, count: calmStrategies.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); playChime('tap'); }}
                className={`min-w-0 flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95 text-center leading-tight ${
                  isTabActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-white/80 hover:bg-amber-100/70 text-slate-700 border border-amber-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate sm:overflow-visible break-words max-w-full">{t(tab.label)}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isTabActive ? 'bg-amber-700/60 text-white' : 'bg-amber-100 text-amber-950'
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
                <p className="text-xs font-bold text-slate-600">
                  Select a clinical breathing pattern or customize the exact second intervals
                </p>
                <button
                  onClick={() => { resetBreathingConfig(); playChime('complete'); }}
                  className="text-xs text-amber-900 hover:text-amber-950 flex items-center gap-1 font-bold cursor-pointer"
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
                          ? 'bg-[#FFF2D4] border-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300'
                          : 'bg-white border-amber-200/80 hover:border-amber-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{preset.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-800 font-bold" />}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">{preset.desc}</p>
                      <div className="flex gap-2 mt-2 text-[10px] font-mono font-bold text-amber-800">
                        <span>Inhale: {preset.inhale}s</span>
                        <span>Hold: {preset.hold}s</span>
                        <span>Exhale: {preset.exhale}s</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Interval Sliders */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-4">
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">Custom Second Timers</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Inhale */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Inhale</span>
                      <span className="text-amber-800 font-mono font-black">{breathingConfig.inhaleSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={breathingConfig.inhaleSec}
                      onChange={(e) => updateBreathingConfig({ inhaleSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Hold */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Hold</span>
                      <span className="text-amber-800 font-mono font-black">{breathingConfig.holdSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={breathingConfig.holdSec}
                      onChange={(e) => updateBreathingConfig({ holdSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Exhale */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Exhale</span>
                      <span className="text-amber-800 font-mono font-black">{breathingConfig.exhaleSec}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={breathingConfig.exhaleSec}
                      onChange={(e) => updateBreathingConfig({ exhaleSec: Number(e.target.value), pattern: 'custom' })}
                      className="w-full accent-amber-500"
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
                <p className="text-xs font-bold text-slate-600">
                  Manage personal calm strategies displayed in the Coping Toolkit
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { resetCalmStrategies(); playChime('complete'); }}
                    className="text-xs text-amber-900 hover:text-amber-950 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => {
                      playChime('tap');
                      setShowAddStrategyForm(!showAddStrategyForm);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Strategy
                  </button>
                </div>
              </div>

              {/* Add New Strategy Form */}
              {showAddStrategyForm && (
                <div className="p-4 rounded-2xl bg-[#FFF2D4]/70 border-2 border-amber-300 space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">New Calm Coping Strategy</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Strategy Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Squeeze Squishy Dino"
                        value={newStrategy.title}
                        onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-amber-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        placeholder="e.g. 🦕, 🎧, 🧊, 🧘"
                        value={newStrategy.emoji}
                        onChange={(e) => setNewStrategy({ ...newStrategy, emoji: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-amber-500 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Gentle Instructions / Prompts</label>
                      <input
                        type="text"
                        placeholder="e.g. Hold the dinosaur across lap and take 3 deep belly breaths"
                        value={newStrategy.instruction}
                        onChange={(e) => setNewStrategy({ ...newStrategy, instruction: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-amber-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddStrategyForm(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewStrategy}
                      disabled={!newStrategy.title.trim()}
                      className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 disabled:opacity-50 text-white cursor-pointer shadow-xs"
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
                    className="p-3.5 rounded-2xl bg-white border-2 border-amber-200/80 hover:border-amber-300 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-2xl bg-[#FFF2D4] border border-[#FED676] flex-shrink-0">{strat.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 truncate">{strat.title}</p>
                          {strat.isCustom && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-black">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate font-medium">{strat.instruction}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          speak(strat.instruction || strat.title);
                          playChime('tap');
                        }}
                        className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-center cursor-pointer active:scale-95"
                        title="Read instruction"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteCalmStrategy(strat.id);
                          playChime('tap');
                        }}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer active:scale-95"
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
        <div className="px-6 py-4 bg-[#FFF9EE] border-t-2 border-amber-200/80 flex items-center justify-between">
          <p className="text-xs text-amber-900 font-medium">Settings are saved automatically to your device.</p>
          <button
            onClick={() => {
              playChime('tap');
              setShowEditCalmModal(false);
            }}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-black text-xs sm:text-sm cursor-pointer shadow-xs active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
