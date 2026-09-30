import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  RotateCcw, 
  Sparkles, 
  SlidersHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { DashboardWidgetId } from '../types';

export const DashboardCustomizerModal: React.FC = () => {
  const {
    showDashboardCustomizer,
    setShowDashboardCustomizer,
    dashboardWidgets,
    toggleDashboardWidget,
    reorderDashboardWidgets,
    resetDashboardWidgets,
    setDashboardWidgets,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'sensory' | 'wellness' | 'support'>('all');

  if (!showDashboardCustomizer) return null;

  const enabledCount = dashboardWidgets.filter((w) => w.enabled).length;

  const handleToggle = (id: DashboardWidgetId) => {
    toggleDashboardWidget(id);
    playChime('tap');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashboardWidgets.length) return;
    reorderDashboardWidgets(index, targetIndex);
    playChime('tap');
  };

  const handleEnableAll = () => {
    setDashboardWidgets(dashboardWidgets.map((w) => ({ ...w, enabled: true })));
    playChime('star');
  };

  const handleMinimalMode = () => {
    // Only keep essential schedule, companion and quick phrases
    setDashboardWidgets(
      dashboardWidgets.map((w) => ({
        ...w,
        enabled: ['mascot_companion', 'routine_schedule', 'quick_aac'].includes(w.id),
      }))
    );
    playChime('clear');
  };

  const filteredWidgets = activeCategory === 'all'
    ? dashboardWidgets
    : dashboardWidgets.filter((w) => w.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={() => setShowDashboardCustomizer(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-4 border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white rounded-2xl border border-amber-200 shadow-2xs">
              ✏️
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Customize Your Dashboard
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Choose which features appear and rearrange their order
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDashboardCustomizer(false)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets and active count bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-slate-600">
            Active: <strong className="text-amber-800">{enabledCount}</strong> of {dashboardWidgets.length} widgets
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMinimalMode}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-all cursor-pointer"
            >
              Minimal
            </button>
            <button
              onClick={handleEnableAll}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-all cursor-pointer"
            >
              Show All
            </button>
            <button
              onClick={() => {
                resetDashboardWidgets();
                playChime('star');
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Reset to default layout"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-200 overflow-x-auto bg-white">
          {[
            { id: 'all' as const, label: 'All', emoji: '✨' },
            { id: 'core' as const, label: 'Core & Schedule', emoji: '📅' },
            { id: 'sensory' as const, label: 'Sensory & Regulation', emoji: '🫧' },
            { id: 'wellness' as const, label: 'Health & Energy', emoji: '🥄' },
            { id: 'support' as const, label: 'Support', emoji: '🪪' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-amber-950 font-black shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Reorderable Widgets List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredWidgets.map((widget) => {
            const actualIndex = dashboardWidgets.findIndex((w) => w.id === widget.id);
            return (
              <div
                key={widget.id}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  widget.enabled
                    ? 'bg-white border-amber-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(widget.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                      widget.enabled
                        ? 'bg-amber-400 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <span className="text-2xl p-1.5 bg-slate-100 rounded-xl shrink-0">
                    {widget.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {widget.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {widget.description}
                    </p>
                  </div>
                </div>

                {/* Right: Reorder arrows & Toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(actualIndex, 'up')}
                    disabled={actualIndex === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 cursor-pointer"
                    title="Move up on dashboard"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(actualIndex, 'down')}
                    disabled={actualIndex === dashboardWidgets.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 cursor-pointer"
                    title="Move down on dashboard"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(widget.id)}
                    className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ml-1 ${
                      widget.enabled
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={widget.enabled ? 'Enabled' : 'Disabled'}
                  >
                    {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setShowDashboardCustomizer(false);
              playChime('complete');
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-sm transition-all cursor-pointer text-center"
          >
            Done Editing Dashboard ✓
          </button>
        </div>
      </div>
    </div>
  );
};
