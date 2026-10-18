import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../services/translator';
import { playChime } from '../../utils/audio';

interface CaregiverHealthSummaryTabProps {
  onShowNotification?: (msg: string) => void;
  onStartTour?: () => void;
  setActiveTab?: (tab: any) => void;
}

export const CaregiverHealthSummaryTab: React.FC<CaregiverHealthSummaryTabProps> = ({
  onShowNotification,
  onStartTour,
  setActiveTab,
}) => {
  const {
    medications,
    medicationLogs,
    childProfile,
  } = useApp();

  // Compute medication refill metrics
  const activeMeds = medications.filter((m) => m.active);
  const lowStockMeds = activeMeds.filter((m) => m.totalQuantity <= m.refillThreshold);
  
  // Compute today's dose compliance
  const totalDosesScheduledToday = activeMeds.reduce((acc, m) => acc + (m.times?.length || 1), 0);
  const totalDosesTakenToday = activeMeds.reduce((acc, m) => acc + (m.takenTimesToday?.length || 0), 0);
  const complianceRate = totalDosesScheduledToday > 0 
    ? Math.round((totalDosesTakenToday / totalDosesScheduledToday) * 100) 
    : 100;

  // Filter today's administration logs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = (medicationLogs || []).filter((l) => l.timestamp?.startsWith(todayStr));

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Sub-navigation Switcher between Medication Summary and Cycle Summary */}
      <div className="inline-flex rounded-2xl bg-stone-100 p-1.5 border border-stone-200">
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-xs font-black transition bg-white text-indigo-900 shadow-xs border border-indigo-200 cursor-default"
        >
          <span>{t('Medication Summary')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (setActiveTab) setActiveTab('cycle-summary');
            playChime('tap');
          }}
          className="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer text-slate-600 hover:text-slate-900"
        >
          <span>{t('Cycle & Hormonal Rhythm')}</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('Medication Summary')}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              lowStockMeds.length > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {lowStockMeds.length > 0 
                ? `${lowStockMeds.length} ${t('Refills Needed')}` 
                : t('Supplies Healthy')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('Read-only medical adherence snapshot, scheduled doses, and prescription refill alerts for')} {childProfile.name || 'Child'}.
          </p>
        </div>

        {onStartTour && (
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onStartTour();
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300 shrink-0 self-start sm:self-auto"
          >
            <span>{t('Guide')}</span>
          </button>
        )}
      </div>

      {/* Low Supply Alert Banner if any prescription needs refill */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-3">
            <div>
              <p className="text-sm font-black text-amber-950">
                {t('Prescription Refill Alert')} ({lowStockMeds.length} {t('low')})
              </p>
              <p className="text-xs text-amber-900 mt-0.5">
                {lowStockMeds.map(m => `${m.name} (${m.totalQuantity} remaining)`).join(', ')}. {t('Please contact your pharmacy to refill.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Dedicated Medication KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Meds */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Active Meds')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeMeds.length}</span>
            <span className="text-xs text-slate-500 font-bold">{t('tracked')}</span>
          </div>
        </div>

        {/* Today's Compliance */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Today Taken')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{totalDosesTakenToday}/{totalDosesScheduledToday}</span>
            <span className="text-xs text-slate-500 font-bold">({complianceRate}%)</span>
          </div>
        </div>

        {/* Refills Needed */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Refill Alert')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${lowStockMeds.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {lowStockMeds.length}
            </span>
            <span className="text-xs text-slate-500 font-bold">{t('due soon')}</span>
          </div>
        </div>

        {/* Dose Schedule */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Scheduled Doses')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalDosesScheduledToday}
            </span>
            <span className="text-xs text-slate-500 font-bold">{t('doses today')}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: MEDICATION SUPPLY & DOSE SCHEDULE */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900">{t('Medication Adherence & Refill Status')}</h3>
            <p className="text-xs text-slate-500 font-medium">{t('Real-time remaining pill inventory and scheduled doses')}</p>
          </div>
        </div>

        {activeMeds.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <p className="text-sm font-bold text-slate-700">{t('No active medications tracked.')}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Medications and dose reminders can be configured on the child tablet under the Health Reminders section.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {activeMeds.map((med) => {
              const isLow = med.totalQuantity <= med.refillThreshold;
              const times = med.times || ['08:00 AM'];
              const takenTimes = med.takenTimesToday || [];
              const percentLeft = Math.min(100, Math.round((med.totalQuantity / Math.max(med.totalQuantity, med.refillThreshold * 3)) * 100));

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isLow 
                      ? 'border-amber-300 bg-amber-50/40 shadow-2xs' 
                      : 'border-stone-200 bg-stone-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-slate-900">{med.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-200 text-slate-700">
                          {med.dosage}
                        </span>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {med.instructions}
                        </p>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shrink-0 ${
                      isLow 
                        ? 'bg-amber-400 text-amber-950 border border-amber-500' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isLow ? t('Refill Needed Soon') : t('In Stock')}
                    </span>
                  </div>

                  {/* Supply Counter */}
                  <div className="mt-3.5 pt-3 border-t border-stone-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-600">{t('Remaining Supply')}:</span>
                      <span className={isLow ? 'text-amber-800 font-black' : 'text-slate-800'}>
                        {med.totalQuantity} {t('units left')} (threshold: {med.refillThreshold})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentLeft}%` }}
                      />
                    </div>
                  </div>

                  {/* Today's Dose Checklist */}
                  <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      {t("Today's Schedule")}:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {times.map((tStr) => {
                        const isTaken = takenTimes.includes(tStr);
                        return (
                          <span
                            key={tStr}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isTaken
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-black'
                                : 'bg-white text-slate-600 border border-stone-200'
                            }`}
                          >
                            <span>{tStr}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: TODAY'S ADMINISTRATION HISTORY */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900">{t("Today's Administration Log")}</h3>
            <p className="text-xs text-slate-500 font-medium">{t("Confirmed dose administrations recorded for today")}</p>
          </div>
        </div>

        {todayLogs.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <p className="text-xs font-bold text-slate-600">{t("No doses confirmed taken yet today.")}</p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{log.medicationName}</span>
                </div>
                <span className="text-slate-500 font-bold">{log.doseTime}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
