import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pill, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Droplet,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { t } from '../../services/translator';
import { playChime } from '../../utils/audio';

interface CaregiverHealthSummaryTabProps {
  onShowNotification?: (msg: string) => void;
  onStartTour?: () => void;
}

export const CaregiverHealthSummaryTab: React.FC<CaregiverHealthSummaryTabProps> = ({
  onShowNotification,
  onStartTour
}) => {
  const {
    medications,
    medicationLogs,
    childProfile,
    getCyclePhaseInfo,
    cycleSettings,
    cycleLogs,
    enabledFeatures,
    activeTheme,
    isPremium,
    triggerUpgrade
  } = useApp();

  const cycleInfo = getCyclePhaseInfo ? getCyclePhaseInfo() : null;

  // Compute medication refill metrics
  const activeMeds = medications.filter((m) => m.active);
  const lowStockMeds = activeMeds.filter((m) => m.totalQuantity <= m.refillThreshold);
  
  // Compute today's dose compliance
  const totalDosesScheduledToday = activeMeds.reduce((acc, m) => acc + (m.times?.length || 1), 0);
  const totalDosesTakenToday = activeMeds.reduce((acc, m) => acc + (m.takenTimesToday?.length || 0), 0);
  const complianceRate = totalDosesScheduledToday > 0 
    ? Math.round((totalDosesTakenToday / totalDosesScheduledToday) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-rose-600" />
              <span>{t('Health & Medication Summary')}</span>
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
            {t('Read-only medical adherence snapshot, prescription refill alerts, and hormonal rhythms for')} {childProfile.name || 'Child'}.
          </p>
        </div>

        {onStartTour && (
          <button
            type="button"
            onClick={() => {
              playChime('tap');
              onStartTour();
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition border border-amber-300 shrink-0 self-start sm:self-auto"
          >
            <span>{t('Guide')}</span>
          </button>
        )}
      </div>

      {/* Low Supply Alert Banner if any prescription needs refill */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/90 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
            </div>
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

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Meds */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Active Meds')}</span>
            <Pill className="w-4 h-4 text-slate-400" />
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
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
            <AlertCircle className={`w-4 h-4 ${lowStockMeds.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${lowStockMeds.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {lowStockMeds.length}
            </span>
            <span className="text-xs text-slate-500 font-bold">{t('due soon')}</span>
          </div>
        </div>

        {/* Cycle Rhythm */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Cycle Rhythm')}</span>
            <Droplet className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-700">
              {cycleInfo ? `${t('Day')} ${cycleInfo.currentCycleDay}` : '--'}
            </span>
            <span className="text-xs text-slate-500 font-bold truncate">
              {cycleInfo?.phaseLabel || t('Not set')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: MEDICATION SUPPLY & DOSE SCHEDULE */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">{t('Medication Adherence & Refill Status')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('Real-time remaining pill inventory and scheduled doses')}</p>
            </div>
          </div>
        </div>

        {activeMeds.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
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
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                              isTaken
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-white text-slate-600 border border-stone-200'
                            }`}
                          >
                            {isTaken ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
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

      {/* SECTION 2: CYCLE & HORMONAL RHYTHM SUMMARY */}
      {enabledFeatures?.cycleTracker !== false && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">{t('Cycle & Hormonal Rhythm Summary')}</h3>
                <p className="text-xs text-slate-500 font-medium">{t('Track sensory shifts and energy rhythms across the cycle')}</p>
              </div>
            </div>

            {cycleInfo && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                {t('Day')} {cycleInfo.currentCycleDay} • {cycleInfo.phaseLabel}
              </span>
            )}
          </div>

          {cycleInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Phase Overview Card */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border-2 border-rose-200/80">
                <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  <span>{t('Active Phase')}: {cycleInfo.phaseLabel}</span>
                </div>
                <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                  {cycleInfo.phaseDescription}
                </p>
                <div className="mt-3 pt-3 border-t border-rose-200/60 text-xs text-rose-950 font-bold">
                  {cycleInfo.daysUntilNextPeriod > 0 
                    ? `${cycleInfo.daysUntilNextPeriod} ${t('days until estimated next period')}` 
                    : t('Period expected or currently active today')}
                </div>
              </div>

              {/* Sensory & Energy Insights */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200/80 md:col-span-2">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>{t('Sensory & Regulation Insight')}</span>
                </div>
                <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                  {cycleInfo.sensoryInsight}
                </p>
                
                {/* Recent Logged Symptoms */}
                {cycleLogs && cycleLogs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-black text-amber-950 text-[11px] uppercase tracking-wider">
                      {t('Recent Notes')}:
                    </span>
                    {cycleLogs.slice(-3).map((log) => (
                      <span key={log.id} className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-slate-700 text-[11px] font-bold">
                        {new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}: {log.symptoms?.join(', ') || log.flow || 'Normal'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
              <Droplet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">{t('No cycle settings configured.')}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t('Cycle and hormonal tracking can be enabled on the child tablet under Me > Cycle & Hormonal Rhythm.')}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
