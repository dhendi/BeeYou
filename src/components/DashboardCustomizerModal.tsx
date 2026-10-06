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
import { isWidgetAvailable, MINIMAL_WIDGETS } from '../data/navigation';

export const DashboardCustomizerModal: React.FC = () => {
  const {
    showDashboardCustomizer,
    setShowDashboardCustomizer,
    dashboardWidgets,
    toggleDashboardWidget,
    reorderDashboardWidgets,
    resetDashboardWidgets,
    setDashboardWidgets,
    enabledFeatures,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'sensory' | 'wellness' | 'support'>('all');

  if (!showDashboardCustomizer) return null;


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

  const available = (id: DashboardWidgetId) => isWidgetAvailable(id, enabledFeatures);
  const visibleWidgets = dashboardWidgets.filter((w) => available(w.id));
  const hiddenByFeatures = dashboardWidgets.length - visibleWidgets.length;

  const handleEnableAll = () => {
    setDashboardWidgets(dashboardWidgets.map((w) => ({ ...w, enabled: available(w.id) })));
    playChime('star');
  };

  const handleMinimalMode = () => {
    // Just the day plan and quick communication.
    setDashboardWidgets(
      dashboardWidgets.map((w) => ({
        ...w,
        enabled: MINIMAL_WIDGETS.includes(w.id),
      }))
    );
    playChime('clear');
  };

  const filteredWidgets = activeCategory === 'all'
    ? visibleWidgets
    : visibleWidgets.filter((w) => w.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={() => setShowDashboardCustomizer(false)}
    >
      <div
        className="bg-[#FAF7F2] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-[#E0D8CB]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#FCF9F2] border-b-2 border-[#E0D8CB]">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#F5EFE6] rounded-2xl border border-[#E0D8CB] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
              ✏️
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2D241E] leading-tight">
                Customize Your Dashboard
              </h2>
              <p className="text-xs text-[#7A6C60] font-medium">
                Choose which features appear and rearrange their order
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDashboardCustomizer(false)}
            className="p-2 rounded-xl bg-[#FCF9F2] hover:bg-white text-[#6B5E52] hover:text-[#2D241E] transition-all cursor-pointer border border-[#E0D8CB] shadow-[0_2px_4px_rgba(0,0,0,0.03)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets and active count bar */}
        <div className="px-5 py-2.5 bg-[#EFE9DF] border-b border-[#E0D8CB] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#6B5E52]">
            Showing: <strong className="text-[#A76318]">{visibleWidgets.filter((w) => w.enabled).length}</strong> of {visibleWidgets.length} widgets
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMinimalMode}
              className="px-3 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#5D5045] font-black transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
              title="Just your day plan and quick communication"
            >
              Minimal
            </button>
            <button
              onClick={handleEnableAll}
              className="px-3 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#5D5045] font-black transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
            >
              Show All
            </button>
            <button
              onClick={() => {
                resetDashboardWidgets();
                playChime('star');
              }}
              className="px-2.5 py-1 min-h-[36px] rounded-xl bg-[#FCF9F2] border border-[#E0D8CB] hover:bg-white text-[#7A6C60] font-black transition-all cursor-pointer flex items-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0.5px_rgba(255,255,255,0.9)]"
              title="Reset to default layout"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8C7E72]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E0D8CB] overflow-x-auto bg-[#FCF9F2]">
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
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#F5B865] text-[#4A2F0F] border border-[#E2A44E] shadow-[0_2px_6px_rgba(0,0,0,0.05),inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                  : 'bg-[#F5EFE6] hover:bg-white text-[#6B5E52] border border-[#E0D8CB]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Reorderable Widgets List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {hiddenByFeatures > 0 && (
            <p className="text-xs text-[#7A6C60] bg-[#F5EFE6] border border-[#E0D8CB] rounded-2xl p-3 font-semibold">
              {hiddenByFeatures} widget{hiddenByFeatures === 1 ? ' is' : 's are'} hidden because that part of BeeYou is turned off.
              You can turn it back on in More &gt; Accessibility &amp; features.
            </p>
          )}
          {filteredWidgets.map((widget) => {
            const actualIndex = dashboardWidgets.findIndex((w) => w.id === widget.id);
            return (
              <div
                key={widget.id}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  widget.enabled
                    ? 'bg-[#FCF9F2] border-[#E0D8CB] shadow-[0_3px_8px_rgba(0,0,0,0.04),inset_0_1.5px_0.5px_rgba(255,255,255,0.9)]'
                    : 'bg-[#F5EFE6]/60 border-[#E8DFC2] opacity-60'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(widget.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border-2 ${
                      widget.enabled
                        ? 'bg-[#F5B865] border-[#E2A44E] text-[#4A2F0F] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.8)]'
                        : 'bg-[#FCF9F2] border-[#D8CEBA] text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <span className="text-2xl p-1.5 bg-[#F5EFE6] border border-[#E0D8CB] rounded-xl shrink-0">
                    {widget.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-sm text-[#2D241E] truncate">
                      {widget.title}
                    </h4>
                    <p className="text-[11px] text-[#7A6C60] font-semibold truncate">
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
                    className="p-1.5 rounded-xl text-[#7A6C60] hover:text-[#2D241E] disabled:opacity-20 hover:bg-[#F5EFE6] border border-transparent hover:border-[#E0D8CB] cursor-pointer"
                    title="Move up on dashboard"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(actualIndex, 'down')}
                    disabled={actualIndex === dashboardWidgets.length - 1}
                    className="p-1.5 rounded-xl text-[#7A6C60] hover:text-[#2D241E] disabled:opacity-20 hover:bg-[#F5EFE6] border border-transparent hover:border-[#E0D8CB] cursor-pointer"
                    title="Move down on dashboard"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(widget.id)}
                    className={`p-1.5 rounded-xl font-black text-xs cursor-pointer ml-1 border ${
                      widget.enabled
                        ? 'text-[#1C3E25] bg-[#C4E7D4] hover:bg-[#B2DEC5] border-[#99C2A2]'
                        : 'text-[#8C7E72] bg-[#F5EFE6] hover:bg-[#EAE2D5] border-[#E0D8CB]'
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
        <div className="p-4 bg-[#FCF9F2] border-t-2 border-[#E0D8CB] flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setShowDashboardCustomizer(false);
              playChime('complete');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F5B865] hover:bg-[#EDA548] text-[#4A2F0F] border-2 border-[#E2A44E] font-black text-sm shadow-[0_4px_14px_rgba(245,184,101,0.35),inset_0_1.5px_0.5px_rgba(255,255,255,0.8)] transition-all cursor-pointer text-center active:scale-95"
          >
            Done Editing Dashboard ✓
          </button>
        </div>
      </div>
    </div>
  );
};
