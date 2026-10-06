import React from 'react';
import { useApp } from '../../context/AppContext';
import { playChime } from '../../utils/audio';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface CaregiverCycleTrackerTabProps {
  onStartTour?: () => void;
}

export const CaregiverCycleTrackerTab: React.FC<CaregiverCycleTrackerTabProps> = ({ onStartTour }) => {
  const {
    enabledFeatures,
    toggleFeature,
    cycleSettings,
    updateCycleSettings,
    cycleLogs,
    deleteCycleLog,
    setShowCycleTrackerModal,
    getCyclePhaseInfo,
  } = useApp();

  const cyclePhaseInfo = getCyclePhaseInfo();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-2xl">{cycleSettings.discreetMode ? '🌿' : '🌸'}</span>
            <span>{cycleSettings.discreetMode ? 'Wellness & Hormonal Rhythm Hub' : 'Menstrual Cycle & Sensory Wellness Hub'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Designed for teens and adults. Calculates cycle phases, predicts upcoming periods, and correlates sensory sensitivity & executive function with hormonal shifts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>💡 How This Works</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowCycleTrackerModal(true);
              playChime('tap');
            }}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open Cycle Studio & Log Day</span>
          </button>
        </div>
      </div>

      {/* Feature Active / Inactive Banner */}
      {enabledFeatures?.cycleTracker === false && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-900">
                Cycle Tracker is currently turned off for this profile.
              </p>
              <p className="text-[11px] text-amber-800">
                Enable it in Feature Controls to display in the user's header and feelings tab.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleFeature('cycleTracker');
              playChime('star');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer"
          >
            Enable Feature
          </button>
        </div>
      )}

      {/* Cycle Settings Card */}
      <div data-tour="cycle-symptoms-forecast" className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Cycle Configuration & Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Average Cycle Length (Days):
            </label>
            <input
              type="number"
              min={20}
              max={45}
              value={cycleSettings.averageCycleLength}
              onChange={(e) => updateCycleSettings({ averageCycleLength: parseInt(e.target.value) || 28 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Average Period Length (Days):
            </label>
            <input
              type="number"
              min={2}
              max={10}
              value={cycleSettings.averagePeriodLength}
              onChange={(e) => updateCycleSettings({ averagePeriodLength: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Last Period Start Date:
            </label>
            <input
              type="date"
              value={cycleSettings.lastPeriodStartDate || ''}
              onChange={(e) => updateCycleSettings({ lastPeriodStartDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Discreet Mode</span>
            <span className="text-[11px] text-slate-500">
              Replaces terms like "Menstrual Period" with "Wellness Rhythm" and uses subtle icons.
            </span>
          </div>
          <input
            type="checkbox"
            checked={cycleSettings.discreetMode}
            onChange={(e) => updateCycleSettings({ discreetMode: e.target.checked })}
            className="w-5 h-5 text-rose-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Status Banner */}
      <div data-tour="cycle-phase-card" className="p-5 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="text-4xl p-2.5 rounded-2xl bg-white shadow-2xs">
            {cycleSettings.discreetMode ? '🌿' : '🌸'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md">
                Day {cyclePhaseInfo.currentCycleDay} of {cycleSettings.averageCycleLength}
              </span>
              <span className="text-xs font-bold text-rose-950">
                {cyclePhaseInfo.phaseLabel}
              </span>
            </div>
            <p className="text-xs text-rose-900 font-medium mt-1">
              {cyclePhaseInfo.sensoryInsight}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-500 font-medium block">Days Until Next Period</span>
          <span className="text-2xl font-black text-rose-950">{cyclePhaseInfo.daysUntilNextPeriod} Days</span>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Daily Logs & Symptom History
        </h3>

        {cycleLogs.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2">
            <span className="text-3xl block">🌸</span>
            <p className="text-xs font-bold text-slate-600">No cycle logs recorded yet</p>
            <p className="text-[11px] text-slate-400">
              When symptoms or flow are logged, history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Flow</th>
                  <th className="py-3 px-4">Discomfort</th>
                  <th className="py-3 px-4">Energy</th>
                  <th className="py-3 px-4">Symptoms</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{log.date}</td>
                    <td className="py-3 px-4 capitalize text-rose-700 font-bold">{log.flow || '-'}</td>
                    <td className="py-3 px-4">{log.painLevel !== undefined ? `${log.painLevel}/10` : '-'}</td>
                    <td className="py-3 px-4">{log.energyLevel !== undefined ? `${log.energyLevel}/5` : '-'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.symptoms.length > 0 ? log.symptoms.join(', ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          deleteCycleLog(log.id);
                          playChime('tap');
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
