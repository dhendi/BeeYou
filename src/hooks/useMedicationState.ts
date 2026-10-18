import { useState, useEffect } from 'react';
import { MedicationReminder, MedicationDoseLog } from '../types';
import { INITIAL_MEDICATIONS, INITIAL_MEDICATION_LOGS } from '../data/defaultData';
import { playChime } from '../utils/audio';

interface UseMedicationStateProps {
  isPremium: boolean;
  soundEffects: boolean;
  triggerUpgrade: (reason?: string) => void;
  awardStars?: (amount: number) => void;
  announce: (text: string) => void;
}

export function useMedicationState({
  isPremium,
  soundEffects,
  triggerUpgrade,
  announce,
}: UseMedicationStateProps) {
  const [medications, setMedications] = useState<MedicationReminder[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_medications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          return parsed.map((m: MedicationReminder) => {
            if (m.lastTakenDate !== todayStr) {
              return { ...m, takenTimesToday: [], lastTakenDate: todayStr };
            }
            return m;
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_medications:', e);
    }
    return INITIAL_MEDICATIONS;
  });

  const [medicationLogs, setMedicationLogs] = useState<MedicationDoseLog[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_medication_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const MOCK_IDS = new Set(['log-1', 'log-2']);
          const clean = parsed.filter((item: any) => item && item.id && !MOCK_IDS.has(item.id));
          if (clean.length !== parsed.length) {
            localStorage.setItem('beeyou_medication_logs', JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_medication_logs:', e);
    }
    return INITIAL_MEDICATION_LOGS;
  });

  const [showMedicationModal, setShowMedicationModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_medications', JSON.stringify(medications));
    } catch (e) {}
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_medication_logs', JSON.stringify(medicationLogs));
    } catch (e) {}
  }, [medicationLogs]);

  const addMedication = (med: Omit<MedicationReminder, 'id' | 'takenTimesToday'>) => {
    if (!isPremium && medications.length >= 1) {
      triggerUpgrade(
        'BeeYou Basic includes 1 medication reminder. Upgrade to BeeYou Premium for unlimited medications, pill inventory tracking, and refill alerts!'
      );
      return;
    }
    const newMed: MedicationReminder = {
      ...med,
      id: `med-${Date.now()}`,
      takenTimesToday: [],
      lastTakenDate: new Date().toISOString().split('T')[0],
    };
    setMedications((prev) => [...prev, newMed]);
    if (soundEffects) playChime('tap');
  };

  const updateMedication = (id: string, updates: Partial<MedicationReminder>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (soundEffects) playChime('tap');
  };

  const takeMedicationDose = (medId: string, time?: string) => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const targetTime =
      time ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const targetMed = medications.find((m) => m.id === medId);
    if (!targetMed) return;

    const newQuantity = Math.max(0, targetMed.totalQuantity - targetMed.dosage);
    const updatedTaken = targetMed.takenTimesToday.includes(targetTime)
      ? targetMed.takenTimesToday
      : [...targetMed.takenTimesToday, targetTime];

    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              totalQuantity: newQuantity,
              takenTimesToday: updatedTaken,
              lastTakenDate: todayDateStr,
            }
          : m
      )
    );

    const newLog: MedicationDoseLog = {
      id: `log-${Date.now()}`,
      medicationId: targetMed.id,
      medicationName: targetMed.name,
      timestamp: new Date().toISOString(),
      doseQuantity: targetMed.dosage,
      doseUnit: targetMed.unit,
      doseTime: targetTime,
      status: 'taken',
      notes: `Taken as scheduled. Remaining: ${newQuantity} ${targetMed.unit}`,
    };
    setMedicationLogs((prev) => [newLog, ...prev]);

    if (soundEffects) playChime('complete');
    announce(`Great job taking your ${targetMed.name}!`);
  };

  const undoMedicationDose = (medId: string, time?: string) => {
    const targetMed = medications.find((m) => m.id === medId);
    if (!targetMed) return;

    const restoredQuantity = targetMed.totalQuantity + targetMed.dosage;
    const updatedTaken = time
      ? targetMed.takenTimesToday.filter((t) => t !== time)
      : targetMed.takenTimesToday.slice(0, -1);

    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              totalQuantity: restoredQuantity,
              takenTimesToday: updatedTaken,
            }
          : m
      )
    );

    setMedicationLogs((prev) => {
      const idx = prev.findIndex((l) => l.medicationId === medId);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
    if (soundEffects) playChime('tap');
  };

  const restockMedication = (medId: string, addedCount: number) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? { ...m, totalQuantity: Math.max(0, m.totalQuantity + addedCount) }
          : m
      )
    );
    if (soundEffects) playChime('star');
  };

  return {
    medications,
    setMedications,
    medicationLogs,
    showMedicationModal,
    setShowMedicationModal,
    addMedication,
    updateMedication,
    deleteMedication,
    takeMedicationDose,
    undoMedicationDose,
    restockMedication,
  };
}
