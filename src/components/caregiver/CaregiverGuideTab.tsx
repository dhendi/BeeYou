import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { CaregiverFeatureWalkthrough } from '../CaregiverFeatureWalkthrough';

interface CaregiverGuideTabProps {
  onNavigateTab: (tab: any) => void;
  onStartTour?: () => void;
}

export const CaregiverGuideTab: React.FC<CaregiverGuideTabProps> = ({ onNavigateTab, onStartTour }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
            💡
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>How BeeYou Works</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950">
                Caregiver & Educator Guide
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Clear, step-by-step guidance on visual routines, timers, help alerts, and device connection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onStartTour) {
                onStartTour();
              } else {
                onNavigateTab('home');
              }
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch In-Place Feature Tour</span>
          </button>
        </div>
      </div>

      {/* 5-STEP QUICK START */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/10 border-2 border-amber-300 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-widest">
            Quick Start in 5 Steps
          </span>
          <span className="text-xs font-bold text-amber-900">
            Set up in 2 minutes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">1</span>
            <h4 className="font-black text-xs text-slate-900">1. Set Up Profile</h4>
            <p className="text-[11px] text-slate-600">Enter name and select age group (Kids, Teens, Adults).</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">2</span>
            <h4 className="font-black text-xs text-slate-900">2. Pair Device (Optional)</h4>
            <p className="text-[11px] text-slate-600">Use a short 6-char code (e.g. K7P4-92) or scan QR to link.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">3</span>
            <h4 className="font-black text-xs text-slate-900">3. Create Morning Routine</h4>
            <p className="text-[11px] text-slate-600">Add 3-5 simple activities: Wake up, Brush teeth, Breakfast.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">4</span>
            <h4 className="font-black text-xs text-slate-900">4. Add Visual Timers</h4>
            <p className="text-[11px] text-slate-600">Add 2m or 5m countdowns to make transitions predictable.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-1 sm:col-span-2 lg:col-span-2">
            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">5</span>
            <h4 className="font-black text-xs text-slate-900">5. Set Up Emergency & Help Alerts</h4>
            <p className="text-[11px] text-slate-600">Ensure notifications are enabled and test sending predefined 1-tap alerts.</p>
          </div>
        </div>
      </div>

      {/* DOES THE PERSON I SUPPORT NEED BEEYOU? */}
      <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span>Does BeeYou seem right for the person I support?</span>
        </h3>
        <p className="text-xs text-slate-600">
          BeeYou may be especially helpful if the person you support:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            'Benefits from visual schedules rather than spoken reminders alone',
            'Finds transitions between activities or places abrupt or stressful',
            'Asks "What are we doing next?" frequently',
            'Benefits from predictable morning and bedtime routines',
            'Needs gentle reminders to complete multi-step tasks',
            'Has difficulty communicating verbally when overwhelmed or overstimulated',
            'Loves visual countdown timers to know how long an activity takes',
            'Wants an easy, non-threatening way to alert a trusted person for help',
          ].map((sign, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 font-medium">{sign}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed font-medium">
          ℹ️ <strong>Support Tool Note:</strong> BeeYou is a daily support tool designed to foster calm, structure, and independence. It does not replace professional therapy, medical care, or individualized education services.
        </div>
      </div>

      {/* INTERACTIVE STEP-BY-STEP VISUAL FEATURE WALKTHROUGH */}
      <CaregiverFeatureWalkthrough onNavigateTab={onNavigateTab} />
    </div>
  );
};
