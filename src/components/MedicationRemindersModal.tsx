import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Pill,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Volume2,
  X,
  Sparkles,
  Package,
  History,
  Calendar,
  RotateCcw,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import { playChime } from '../utils/audio';

export const MedicationRemindersModal: React.FC = () => {
  const {
    medications,
    medicationLogs,
    showMedicationModal,
    setShowMedicationModal,
    takeMedicationDose,
    undoMedicationDose,
    restockMedication,
    setIsParentMode,
    speak,
    childProfile,
    userAgeGroup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'inventory' | 'history'>('schedule');
  const [restockMedId, setRestockMedId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(30);

  if (!showMedicationModal) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to format 24h string into friendly 12h format
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Helper to check frequency text
  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'Once a day';
      case 'twice_daily':
        return 'Twice a day';
      case 'three_daily':
        return '3 times a day';
      case 'as_needed':
        return 'As needed (PRN)';
      case 'weekly':
        return 'Weekly';
      case 'custom_days':
        return 'Specific days';
      default:
        return freq;
    }
  };

  // Flatten doses for today's schedule
  interface DoseItem {
    medId: string;
    medName: string;
    emoji: string;
    color?: string;
    time: string;
    dosage: number;
    unit: string;
    instructions?: string;
    totalQuantity: number;
    refillThreshold: number;
    isTaken: boolean;
    frequency: string;
  }

  const todayDoses: DoseItem[] = [];

  medications.forEach((med) => {
    if (!med.active) return;
    if (med.frequency === 'as_needed') {
      // Show as-needed entry
      const isTaken = med.takenTimesToday.length > 0;
      todayDoses.push({
        medId: med.id,
        medName: med.name,
        emoji: med.emoji || '💊',
        color: med.color,
        time: 'As needed',
        dosage: med.dosage,
        unit: med.unit,
        instructions: med.instructions,
        totalQuantity: med.totalQuantity,
        refillThreshold: med.refillThreshold,
        isTaken,
        frequency: med.frequency,
      });
    } else {
      // For each scheduled time
      med.times.forEach((t) => {
        const isTaken = med.takenTimesToday.includes(t);
        todayDoses.push({
          medId: med.id,
          medName: med.name,
          emoji: med.emoji || '💊',
          color: med.color,
          time: t,
          dosage: med.dosage,
          unit: med.unit,
          instructions: med.instructions,
          totalQuantity: med.totalQuantity,
          refillThreshold: med.refillThreshold,
          isTaken,
          frequency: med.frequency,
        });
      });
    }
  });

  // Sort scheduled doses by time (as needed at bottom)
  todayDoses.sort((a, b) => {
    if (a.time === 'As needed') return 1;
    if (b.time === 'As needed') return -1;
    return a.time.localeCompare(b.time);
  });

  const totalDosesCount = todayDoses.length;
  const takenDosesCount = todayDoses.filter((d) => d.isTaken).length;
  const lowSupplyMeds = medications.filter((m) => m.totalQuantity <= m.refillThreshold);

  const handleSpeakMed = (item: DoseItem) => {
    speak(`${item.medName}. Take ${item.dosage} ${item.unit}. ${item.instructions || ''}`);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockMedId && restockAmount > 0) {
      restockMedication(restockMedId, restockAmount);
      setRestockMedId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col border-2 border-indigo-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-xs">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  Health & Care
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {childProfile.name}'s Routine
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                Medication Reminders
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowMedicationModal(false);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Low Supply Alert Banner if any med is low */}
        {lowSupplyMeds.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold truncate">
                Low Supply Alert: {lowSupplyMeds.map((m) => `${m.name} (${m.totalQuantity} ${m.unit} left)`).join(', ')}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-black shrink-0 text-[11px] cursor-pointer"
            >
              Refill Stock
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('schedule');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Today's Doses</span>
            <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
              {takenDosesCount}/{totalDosesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('inventory');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Supply Inventory</span>
            {lowSupplyMeds.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              playChime('tap');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Dose Log</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: TODAY'S SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              {/* Progress Summary Card */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Today's Adherence
                  </h4>
                  <p className="text-sm sm:text-base font-black text-slate-800">
                    {takenDosesCount === totalDosesCount && totalDosesCount > 0
                      ? 'All doses taken today! Outstanding job! 🌟'
                      : `${takenDosesCount} of ${totalDosesCount} doses taken`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {totalDosesCount > 0 ? `${Math.round((takenDosesCount / totalDosesCount) * 100)}%` : '100%'}
                </div>
              </div>

              {todayDoses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-semibold text-sm">No active medications configured.</p>
                  <p className="text-xs mt-1">Configure medications in the Parent Dashboard.</p>
                </div>
              ) : (
                todayDoses.map((dose, index) => {
                  const isLow = dose.totalQuantity <= dose.refillThreshold;
                  return (
                    <div
                      key={`${dose.medId}-${dose.time}-${index}`}
                      className={`border-2 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        dose.isTaken
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                      }`}
                    >
                      {/* Left: Emoji + Med Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                          {dose.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black text-sm sm:text-base text-slate-800 leading-tight">
                              {dose.medName}
                            </h3>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{dose.time === 'As needed' ? 'As needed' : formatTime12h(dose.time)}</span>
                            </span>
                          </div>

                          <p className="text-xs font-bold text-indigo-700 mt-0.5">
                            Take {dose.dosage} {dose.unit}
                          </p>

                          {dose.instructions && (
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                              {dose.instructions}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isLow
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Package className="w-3 h-3" />
                              <span>
                                {dose.totalQuantity} {dose.unit} left
                                {isLow && ' (Low supply!)'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSpeakMed(dose)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-all active:scale-95"
                          title="Read instructions aloud"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {dose.isTaken ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Taken</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => undoMedicationDose(dose.medId, dose.time)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
                              title="Undo this dose"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => takeMedicationDose(dose.medId, dose.time)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Pill className="w-4 h-4" />
                            <span>Take Dose (+1 ⭐)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SUPPLY INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Supply inventory automatically counts down each time a dose is taken.
                  </span>
                </div>
              </div>

              {medications.map((med) => {
                const isLow = med.totalQuantity <= med.refillThreshold;
                return (
                  <div
                    key={med.id}
                    className={`border-2 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isLow ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                        {med.emoji || '💊'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm sm:text-base text-slate-800">
                            {med.name}
                          </h4>
                          {isLow && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                              Refill Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Frequency: {getFrequencyLabel(med.frequency)} • Dose: {med.dosage} {med.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 max-w-[200px] h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isLow ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(5, (med.totalQuantity / (med.refillThreshold * 4)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-800">
                            {med.totalQuantity} {med.unit} in stock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Restock Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => restockMedication(med.id, 10)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all active:scale-95"
                        title="Add 10"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => restockMedication(med.id, 30)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs cursor-pointer transition-all active:scale-95 border border-indigo-200"
                        title="Add 30 (1 month pack)"
                      >
                        +30 (1 Mo)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRestockMedId(med.id);
                          setRestockAmount(30);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
                      >
                        Custom Refill
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Custom Restock Dialog */}
              {restockMedId && (
                <div className="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-2xl animate-in fade-in">
                  <form onSubmit={handleRestockSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-xs font-black text-indigo-900 shrink-0">
                      Add supply to {medications.find((m) => m.id === restockMedId)?.name}:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-xl border border-indigo-300 font-black text-center text-sm bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        Add to Supply
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestockMedId(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOSE LOG HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                Adherence log recorded for doctor and therapy appointments.
              </div>

              {medicationLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                  No doses recorded yet.
                </div>
              ) : (
                medicationLogs.slice(0, 25).map((log) => {
                  const logDate = new Date(log.timestamp);
                  return (
                    <div
                      key={log.id}
                      className="border border-slate-200 rounded-xl p-3 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-black text-slate-800 truncate">
                            {log.medicationName}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Took {log.doseQuantity} {log.doseUnit || 'dose'} • {log.notes || 'Taken as scheduled'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-700 block">
                          {logDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {logDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowMedicationModal(false);
              setIsParentMode(true);
            }}
            className="text-xs font-black text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Configure Medications in Dashboard</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMedicationModal(false);
              playChime('tap');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
