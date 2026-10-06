import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicationReminder, MedicationFrequency } from '../../types';
import {
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Clock,
  Crown,
  Edit3,
  X
} from 'lucide-react';

interface CaregiverMedicationsTabProps {
  onShowNotification: (msg: string) => void;
}

export const CaregiverMedicationsTab: React.FC<CaregiverMedicationsTabProps> = ({ onShowNotification }) => {
  const {
    childProfile,
    medications,
    medicationLogs,
    addMedication,
    updateMedication,
    deleteMedication,
    restockMedication,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const [showMedForm, setShowMedForm] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [medEmoji, setMedEmoji] = useState('💊');
  const [medDosage, setMedDosage] = useState<number>(1);
  const [medUnit, setMedUnit] = useState('pill');
  const [medFrequency, setMedFrequency] = useState<MedicationFrequency>('daily');
  const [medTimes, setMedTimes] = useState<string[]>(['08:00']);
  const [medTotalQuantity, setMedTotalQuantity] = useState<number>(30);
  const [medRefillThreshold, setMedRefillThreshold] = useState<number>(5);
  const [medInstructions, setMedInstructions] = useState('');
  const [quickRestockId, setQuickRestockId] = useState<string | null>(null);
  const [quickRestockAmount, setQuickRestockAmount] = useState<number>(30);

  const handleOpenAddMed = () => {
    if (!isPremium && medications.length >= 1) {
      triggerUpgrade('Medication Reminders: Free tier is limited to 1 active medication. Upgrade to BeeYou Premium for unlimited medications and stock alerts!');
      return;
    }
    setEditingMedId(null);
    setMedName('');
    setMedEmoji('💊');
    setMedDosage(1);
    setMedUnit('pill');
    setMedFrequency('daily');
    setMedTimes(['08:00']);
    setMedTotalQuantity(30);
    setMedRefillThreshold(5);
    setMedInstructions('');
    setShowMedForm(true);
  };

  const handleOpenEditMed = (med: MedicationReminder) => {
    setEditingMedId(med.id);
    setMedName(med.name);
    setMedEmoji(med.emoji || '💊');
    setMedDosage(med.dosage);
    setMedUnit(med.unit);
    setMedFrequency(med.frequency);
    setMedTimes(med.times.length > 0 ? med.times : ['08:00']);
    setMedTotalQuantity(med.totalQuantity);
    setMedRefillThreshold(med.refillThreshold);
    setMedInstructions(med.instructions || '');
    setShowMedForm(true);
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    if (editingMedId) {
      updateMedication(editingMedId, {
        name: medName.trim(),
        emoji: medEmoji,
        dosage: medDosage,
        unit: medUnit,
        frequency: medFrequency,
        times: medFrequency === 'as_needed' ? [] : medTimes,
        totalQuantity: medTotalQuantity,
        refillThreshold: medRefillThreshold,
        instructions: medInstructions.trim(),
      });
      onShowNotification(`Updated ${medName.trim()} settings.`);
    } else {
      addMedication({
        name: medName.trim(),
        emoji: medEmoji,
        dosage: medDosage,
        unit: medUnit,
        frequency: medFrequency,
        times: medFrequency === 'as_needed' ? [] : medTimes,
        totalQuantity: medTotalQuantity,
        refillThreshold: medRefillThreshold,
        instructions: medInstructions.trim(),
        active: true,
      });
      onShowNotification(`Added ${medName.trim()} reminder.`);
    }

    setShowMedForm(false);
    setEditingMedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span>Medication Reminders & Supply Hub</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure medications, scheduled dose times, dosages, and keep track of remaining pill supply for {childProfile.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddMed}
          className={`px-4 py-2 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0 ${
            !isPremium && medications.length >= 1
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {!isPremium && medications.length >= 1 ? (
            <>
              <Crown className="w-4 h-4 text-amber-200" />
              <span>Upgrade for More Meds</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add New Medication</span>
            </>
          )}
        </button>
      </div>

      {/* 1-Medication Basic Plan Limit Banner */}
      {!isPremium && medications.length >= 1 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 text-xl shadow-xs">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Basic Plan Limit (1/1 Medication)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">Free Tier</span>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-0.5">
                You are using your 1 included medication reminder. Upgrade to BeeYou Premium ($12.99/mo with a 30-day free trial) for unlimited medications, stock tracking, and refill alerts.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerUpgrade('Medication Reminders: The Basic plan includes 1 medication reminder. Upgrade to BeeYou Premium for unlimited medications, stock tracking, and refill alerts!')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span>Start 30-Day Free Trial</span>
          </button>
        </div>
      )}

      {/* Add / Edit Medication Form */}
      {showMedForm && (
        <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/70 border-2 border-indigo-200 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3">
            <h3 className="font-black text-sm sm:text-base text-indigo-950 flex items-center gap-2">
              <span className="text-xl">{medEmoji}</span>
              <span>{editingMedId ? 'Edit Medication Reminder' : 'Add New Medication Reminder'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowMedForm(false)}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveMedication} className="space-y-4">
            {/* 1. Medication Name & Emoji */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  1. Medication Name *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Morning Multivitamin Gummy, Asthma Inhaler"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Icon / Emoji
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['💊', '🍬', '🫁', '💧', '🧴', '🩹'].map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setMedEmoji(em)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                        medEmoji === em
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                          : 'bg-white hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Stock inventory & Low Threshold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  2. How Many They Have (Total Quantity in Stock) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    required
                    value={medTotalQuantity}
                    onChange={(e) => setMedTotalQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {medUnit || 'units'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Decrements automatically each time a dose is taken.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Low Supply Alert Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={medRefillThreshold}
                    onChange={(e) => setMedRefillThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    alert when remaining count is low
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Alerts caregiver when supply falls to or below this count.
                </span>
              </div>
            </div>

            {/* 3. Frequency */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                3. How Often Should They Take It (Frequency) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'daily', label: 'Once a Day', defaultTimes: ['08:00'] },
                  { id: 'twice_daily', label: 'Twice a Day', defaultTimes: ['08:00', '20:00'] },
                  { id: 'three_daily', label: '3 Times a Day', defaultTimes: ['08:00', '13:00', '19:00'] },
                  { id: 'as_needed', label: 'As Needed (PRN)', defaultTimes: [] },
                ].map((freq) => (
                  <button
                    type="button"
                    key={freq.id}
                    onClick={() => {
                      setMedFrequency(freq.id as MedicationFrequency);
                      if (freq.defaultTimes.length > 0) {
                        setMedTimes(freq.defaultTimes);
                      }
                    }}
                    className={`p-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
                      medFrequency === freq.id
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Times */}
            {medFrequency !== 'as_needed' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black text-slate-700">
                    4. What Time Should They Take Them (Dose Times) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setMedTimes([...medTimes, '12:00'])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Time Slot</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {medTimes.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={t}
                        onChange={(e) => {
                          const updated = [...medTimes];
                          updated[idx] = e.target.value;
                          setMedTimes(updated);
                        }}
                        className="font-bold text-sm text-slate-800 bg-transparent focus:outline-none"
                      />
                      {medTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMedTimes(medTimes.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                          title="Remove time"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Dosage & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  5. How Many Should They Take (Dosage Amount) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max="100"
                  required
                  value={medDosage}
                  onChange={(e) => setMedDosage(Number(e.target.value))}
                  placeholder="e.g. 1, 2"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Unit Form
                </label>
                <select
                  value={medUnit}
                  onChange={(e) => setMedUnit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pill">pill(s)</option>
                  <option value="tablet">tablet(s)</option>
                  <option value="gummy">gummy / chewable(s)</option>
                  <option value="puffs">puff(s) / spray</option>
                  <option value="dropper">dropper / drops</option>
                  <option value="spoonful">spoonful / ml</option>
                  <option value="patch">patch</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                Special Instructions & Guidance (Optional)
              </label>
              <input
                type="text"
                value={medInstructions}
                onChange={(e) => setMedInstructions(e.target.value)}
                placeholder="e.g. Take with breakfast and a glass of water; Shake well before use"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-medium text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200/60">
              <button
                type="button"
                onClick={() => {
                  setShowMedForm(false);
                  setEditingMedId(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingMedId ? 'Update Medication' : 'Save Medication'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medication Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Configured Medications ({medications.length})
          </h3>
        </div>

        {medications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="font-semibold text-sm">No medications configured yet.</p>
            <p className="text-xs mt-1">Click "Add New Medication" above to set up reminders and stock tracking.</p>
          </div>
        ) : (
          medications.map((med) => {
            const isLow = med.totalQuantity <= med.refillThreshold;
            return (
              <div
                key={med.id}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isLow
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {med.emoji || '💊'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-base text-slate-900 leading-tight">
                        {med.name}
                      </h4>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Supply!</span>
                        </span>
                      )}
                      {!med.active && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                          Paused
                        </span>
                      )}
                    </div>

                    {/* Details Row: Dosage, Frequency, Times */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                      <span className="font-bold text-indigo-700">
                        Dose: {med.dosage} {med.unit}
                      </span>
                      <span>•</span>
                      <span className="font-medium capitalize">
                        Frequency: {med.frequency.replace('_', ' ')}
                      </span>
                      {med.times.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{med.times.map((t) => {
                              const [h, m] = t.split(':').map(Number);
                              if (isNaN(h)) return t;
                              return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                            }).join(', ')}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                        {med.instructions}
                      </p>
                    )}

                    {/* Stock Inventory Tracker */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
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
                        {med.totalQuantity} {med.unit} remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {/* Restock Buttons */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        restockMedication(med.id, 10);
                        onShowNotification(`Added +10 to ${med.name} supply!`);
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:shadow-2xs cursor-pointer transition-all"
                      title="Add 10"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        restockMedication(med.id, 30);
                        onShowNotification(`Added +30 (1 month) to ${med.name} supply!`);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-all"
                      title="Add 30 (1 month supply)"
                    >
                      +30
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickRestockId(med.id);
                        setQuickRestockAmount(30);
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-white cursor-pointer transition-all"
                      title="Custom Refill Amount"
                    >
                      Refill
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditMed(med)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-all"
                    title="Edit Medication"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete reminder for "${med.name}"?`)) {
                        deleteMedication(med.id);
                        onShowNotification(`"${med.name}" removed.`);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer transition-all"
                    title="Delete Medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Restock Dialog */}
      {quickRestockId && (
        <div className="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-2xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-black text-indigo-900 shrink-0">
              Add supply to {medications.find((m) => m.id === quickRestockId)?.name}:
            </span>
            <input
              type="number"
              min="1"
              max="1000"
              value={quickRestockAmount}
              onChange={(e) => setQuickRestockAmount(Number(e.target.value))}
              className="w-24 px-3 py-1.5 rounded-xl border border-indigo-300 font-black text-center text-sm bg-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (quickRestockId && quickRestockAmount > 0) {
                    restockMedication(quickRestockId, quickRestockAmount);
                    const med = medications.find((m) => m.id === quickRestockId);
                    onShowNotification(`Added +${quickRestockAmount} ${med?.unit || 'units'} to supply!`);
                    setQuickRestockId(null);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
              >
                Add to Supply
              </button>
              <button
                type="button"
                onClick={() => setQuickRestockId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medication Adherence History Log */}
      <div className="mt-8 border-t border-slate-200 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Dose History & Adherence Record
            </h3>
            <p className="text-xs text-slate-500">
              Exportable logs for pediatrician checkups, occupational therapy, and routine review.
            </p>
          </div>
        </div>

        {medicationLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
            No dose logs recorded yet. Once doses are taken, they will appear here.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Medication</th>
                    <th className="py-2.5 px-4">Dosage Taken</th>
                    <th className="py-2.5 px-4">Scheduled Time</th>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {medicationLogs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>{log.medicationName}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        {log.doseQuantity} {log.doseUnit || 'dose'}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                        {log.doseTime}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {log.notes || 'Taken'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
