import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../services/translator';
import { playChime } from '../../utils/audio';

interface CaregiverCycleSummaryTabProps {
  onShowNotification?: (msg: string) => void;
  onStartTour?: () => void;
  setActiveTab?: (tab: any) => void;
}

export const CaregiverCycleSummaryTab: React.FC<CaregiverCycleSummaryTabProps> = ({
  onShowNotification,
  onStartTour,
  setActiveTab,
}) => {
  const {
    childProfile,
    getCyclePhaseInfo,
    cycleSettings,
    cycleLogs,
    enabledFeatures,
    isPremium,
    triggerUpgrade,
  } = useApp();

  const [copiedReport, setCopiedReport] = useState(false);
  const cycleInfo = getCyclePhaseInfo ? getCyclePhaseInfo() : null;
  const childName = childProfile.name || 'Child';

  const generateCycleClinicalSummary = (): string => {
    const lines: string[] = [
      `==================================================`,
      `BEEYOU HORMONAL CYCLE & SENSORY RHYTHM REPORT`,
      `Child: ${childName} | Date Generated: ${new Date().toLocaleDateString()}`,
      `==================================================\n`,
    ];

    if (!cycleInfo) {
      lines.push(`No active cycle tracking data configured.`);
      return lines.join('\n');
    }

    lines.push(
      `1. CURRENT CYCLE PHASE & TIMELINE:`,
      `- Current Cycle Day: Day ${cycleInfo.currentCycleDay} of ${cycleSettings?.averageCycleLength || 28} days`,
      `- Active Phase: ${cycleInfo.phaseLabel}`,
      `- Phase Overview: ${cycleInfo.phaseDescription}`,
      `- Estimated Next Period: ${cycleInfo.daysUntilNextPeriod > 0 ? `In ${cycleInfo.daysUntilNextPeriod} days` : 'Active / expected today'}\n`,

      `2. SENSORY & NEURODIVERGENT REGULATION IMPACT:`,
      `- Clinical Insight: ${cycleInfo.sensoryInsight}\n`,

      `3. RECENT SYMPTOM & FLOW HISTORY:`,
    );

    if (!cycleLogs || cycleLogs.length === 0) {
      lines.push(`- No daily symptom logs recorded yet.`);
    } else {
      const recent = [...cycleLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
      recent.forEach((log) => {
        const dateStr = new Date(log.date).toLocaleDateString();
        const symptomsStr = log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None logged';
        const flowStr = log.flow ? `Flow: ${log.flow}` : 'No flow';
        const notesStr = log.notes ? ` | Notes: "${log.notes}"` : '';
        lines.push(`- [${dateStr}] ${flowStr} | Symptoms: ${symptomsStr}${notesStr}`);
      });
    }

    lines.push(
      `\n==================================================`,
      `Report generated via BeeYou Caregiver Hub.`
    );

    return lines.join('\n');
  };

  const handleCopyCycleReport = async () => {
    playChime('tap');
    const text = generateCycleClinicalSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReport(true);
      playChime('complete');
      if (onShowNotification) {
        onShowNotification(t('Cycle summary copied to clipboard!'));
      }
      setTimeout(() => setCopiedReport(false), 3500);
    } catch {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Sub-navigation Switcher between Medication Summary and Cycle Summary */}
      <div className="inline-flex rounded-2xl bg-stone-100 p-1.5 border border-stone-200">
        <button
          type="button"
          onClick={() => {
            if (setActiveTab) setActiveTab('health-summary');
            playChime('tap');
          }}
          className="px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer text-slate-600 hover:text-slate-900"
        >
          <span>{t('Medication Summary')}</span>
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded-xl text-xs font-black transition bg-white text-rose-900 shadow-xs border border-rose-200 cursor-default"
        >
          <span>{t('Cycle & Hormonal Rhythm')}</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('Cycle & Hormonal Rhythm Summary')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
              {cycleInfo ? `${t('Day')} ${cycleInfo.currentCycleDay} • ${cycleInfo.phaseLabel}` : t('Not Configured')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('Hormonal phases, cycle tracking history, sensory sensitivity patterns, and symptom logs for')} {childName}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyCycleReport}
            className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-sm transition active:scale-95 ${
              copiedReport 
                ? 'bg-emerald-600 text-white' 
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <span>{copiedReport ? t('Copied Report!') : t('Copy Cycle Report')}</span>
          </button>

          {onStartTour && (
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                onStartTour();
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs border border-stone-200"
            >
              <span>{t('Guide')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Dedicated Cycle KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Phase */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Current Phase')}</span>
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

        {/* Next Period */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Next Period')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {cycleInfo && cycleInfo.daysUntilNextPeriod > 0 ? cycleInfo.daysUntilNextPeriod : '0'}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {cycleInfo && cycleInfo.daysUntilNextPeriod > 0 ? t('days away') : t('due/active')}
            </span>
          </div>
        </div>

        {/* Typical Length */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Cycle Duration')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {cycleSettings?.averageCycleLength || 28}
            </span>
            <span className="text-xs text-slate-500 font-bold">{t('days')}</span>
          </div>
        </div>

        {/* Logged Symptoms */}
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Logged Symptoms')}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {cycleLogs?.length || 0}
            </span>
            <span className="text-xs text-slate-500 font-bold">{t('entries')}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PHASE OVERVIEW & REGULATION INSIGHT */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900">{t('Active Phase & Hormonal Rhythm')}</h3>
            <p className="text-xs text-slate-500 font-medium">{t('Track biological shifts and sensory regulation needs across each phase')}</p>
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
              <div className="text-rose-900 font-black text-sm">
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
              <div className="text-amber-900 font-black text-sm">
                <span>{t('Sensory & Regulation Insight')}</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                {cycleInfo.sensoryInsight}
              </p>
              
              <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-950 font-bold">
                <span>{t('Helpful Caregiver Strategy')}: {t('Offer lower sensory lighting, reduced acoustic noise, and flexible transition breaks if fatigue occurs.')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <p className="text-sm font-bold text-slate-700">{t('No cycle settings configured.')}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Cycle and hormonal tracking can be enabled on the child tablet under Me > Cycle & Hormonal Rhythm.')}
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: CYCLE SYMPTOM & FLOW HISTORY LOG */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900">{t('Recent Symptom & Flow History')}</h3>
            <p className="text-xs text-slate-500 font-medium">{t('Time-stamped audit of logged physical and emotional symptoms')}</p>
          </div>
        </div>

        {!cycleLogs || cycleLogs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <p className="text-sm font-bold text-slate-700">{t('No cycle symptom logs recorded yet.')}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('When symptoms, flow, or physical feelings are logged on the child device, they will appear here automatically.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {cycleLogs.slice().reverse().map((log) => {
              const logDate = new Date(log.date);
              const symptoms = log.symptoms || [];

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center font-black text-rose-800 text-xs shrink-0">
                      {logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">
                          {logDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        {log.flow && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200 capitalize">
                            {t('Flow')}: {log.flow}
                          </span>
                        )}
                      </div>
                      {symptoms.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {symptoms.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white border border-stone-200 text-slate-700">
                              {s.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      {log.notes && (
                        <p className="text-xs text-slate-600 font-medium mt-1.5 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: CLINICAL CYCLE REPORT PREVIEW */}
      <section className="bg-stone-50 rounded-3xl p-5 border-2 border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">
              {t('Preview: Formatted Hormonal Rhythm Report')}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyCycleReport}
            className="text-xs font-black text-rose-700 hover:text-rose-800 cursor-pointer"
          >
            <span>{t('Copy Entire Report')}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-white border border-stone-200 text-[11px] font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {generateCycleClinicalSummary()}
        </pre>
      </section>
    </div>
  );
};
