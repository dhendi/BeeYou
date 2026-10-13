import { useState, useEffect } from 'react';
import {
  DashboardWidgetConfig,
  DashboardWidgetId,
  HelpAlertPreset,
  CaregiverResponsePreset,
  CalmCopingStrategy,
  BreathingPacerConfig,
  UserAgeGroup,
} from '../types';
import {
  DEFAULT_HELP_ALERT_PRESETS,
  DEFAULT_CAREGIVER_RESPONSES,
  DEFAULT_CALM_STRATEGIES,
  DEFAULT_BREATHING_PACER_CONFIG,
} from '../data/defaultData';
import { DEFAULT_DASHBOARD_WIDGETS, AGE_DEFAULT_WIDGETS } from '../data/navigation';
import { playChime } from '../utils/audio';

interface UseCustomToolsStateProps {
  userAgeGroup: UserAgeGroup;
  soundEffects: boolean;
}

export function useCustomToolsState({ userAgeGroup, soundEffects }: UseCustomToolsStateProps) {
  const getDefaultDashboardWidgets = (age: UserAgeGroup): DashboardWidgetConfig[] => {
    const key = (age || 'kid') as keyof typeof AGE_DEFAULT_WIDGETS;
    const enabledIds = AGE_DEFAULT_WIDGETS[key] ?? AGE_DEFAULT_WIDGETS.kid;
    const on = new Set<DashboardWidgetId>(enabledIds);

    const base = DEFAULT_DASHBOARD_WIDGETS.map((w: DashboardWidgetConfig) => ({
      ...w,
      enabled: on.has(w.id),
    }));

    const order = AGE_DEFAULT_WIDGETS[key] ?? AGE_DEFAULT_WIDGETS.kid;
    return [
      ...order
        .map((id: DashboardWidgetId) => base.find((w: DashboardWidgetConfig) => w.id === id))
        .filter((w): w is DashboardWidgetConfig => !!w),
      ...base.filter((w: DashboardWidgetConfig) => !on.has(w.id)),
    ];
  };

  const [dashboardWidgets, setDashboardWidgetsState] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_dashboard_widgets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = DEFAULT_DASHBOARD_WIDGETS.filter((d: DashboardWidgetConfig) => !existingIds.has(d.id));
          const combined = [...parsed, ...missing];
          if (combined.some((w) => w.enabled)) {
            return combined;
          }
        }
      }
    } catch (e) {}
    return getDefaultDashboardWidgets(userAgeGroup);
  });

  const [showDashboardCustomizer, setShowDashboardCustomizer] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_dashboard_widgets_v3', JSON.stringify(dashboardWidgets));
    } catch (e) {}
  }, [dashboardWidgets]);

  useEffect(() => {
    try {
      if (localStorage.getItem('beeyou_dashboard_customized') !== 'true') {
        setDashboardWidgetsState(getDefaultDashboardWidgets(userAgeGroup));
      }
    } catch (e) {}
  }, [userAgeGroup]);

  const markDashboardCustomized = (value: boolean) => {
    try {
      if (value) localStorage.setItem('beeyou_dashboard_customized', 'true');
      else localStorage.removeItem('beeyou_dashboard_customized');
    } catch (e) {}
  };

  const setDashboardWidgets = (widgets: DashboardWidgetConfig[]) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState(widgets);
  };

  const toggleDashboardWidget = (id: DashboardWidgetId) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const reorderDashboardWidgets = (fromIndex: number, toIndex: number) => {
    markDashboardCustomized(true);
    setDashboardWidgetsState((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const resetDashboardWidgets = () => {
    markDashboardCustomized(false);
    setDashboardWidgetsState(getDefaultDashboardWidgets(userAgeGroup));
  };

  // Help Alerts & Caregiver Responses
  const [helpAlertPresets, setHelpAlertPresets] = useState<HelpAlertPreset[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_help_alert_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_HELP_ALERT_PRESETS;
  });

  const [caregiverResponses, setCaregiverResponses] = useState<CaregiverResponsePreset[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_caregiver_responses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CAREGIVER_RESPONSES;
  });

  const [showEditAlertsModal, setShowEditAlertsModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_help_alert_presets', JSON.stringify(helpAlertPresets));
    } catch (e) {}
  }, [helpAlertPresets]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_caregiver_responses', JSON.stringify(caregiverResponses));
    } catch (e) {}
  }, [caregiverResponses]);

  const addHelpAlertPreset = (preset: Omit<HelpAlertPreset, 'id'>) => {
    const newPreset: HelpAlertPreset = {
      ...preset,
      id: `alert-custom-${Date.now()}`,
      isCustom: true,
    };
    setHelpAlertPresets((prev) => [...prev, newPreset]);
    if (soundEffects) playChime('complete');
  };

  const updateHelpAlertPreset = (id: string, updates: Partial<HelpAlertPreset>) => {
    setHelpAlertPresets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteHelpAlertPreset = (id: string) => {
    setHelpAlertPresets((prev) => prev.filter((a) => a.id !== id));
  };

  const resetHelpAlertPresets = () => {
    setHelpAlertPresets(DEFAULT_HELP_ALERT_PRESETS);
  };

  const addCaregiverResponse = (resp: Omit<CaregiverResponsePreset, 'id'>) => {
    const newResp: CaregiverResponsePreset = {
      ...resp,
      id: `resp-custom-${Date.now()}`,
      isCustom: true,
    };
    setCaregiverResponses((prev) => [...prev, newResp]);
    if (soundEffects) playChime('complete');
  };

  const updateCaregiverResponse = (id: string, updates: Partial<CaregiverResponsePreset>) => {
    setCaregiverResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteCaregiverResponse = (id: string) => {
    setCaregiverResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const resetCaregiverResponses = () => {
    setCaregiverResponses(DEFAULT_CAREGIVER_RESPONSES);
  };

  // Calm Strategies & Breathing Pacer
  const [calmStrategies, setCalmStrategies] = useState<CalmCopingStrategy[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_calm_strategies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CALM_STRATEGIES;
  });

  const [breathingConfig, setBreathingConfig] = useState<BreathingPacerConfig>(() => {
    try {
      const saved = localStorage.getItem('beeyou_breathing_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.inhaleSec) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BREATHING_PACER_CONFIG;
  });

  const [showEditCalmModal, setShowEditCalmModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_calm_strategies', JSON.stringify(calmStrategies));
    } catch (e) {}
  }, [calmStrategies]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_breathing_config', JSON.stringify(breathingConfig));
    } catch (e) {}
  }, [breathingConfig]);

  const addCalmStrategy = (strategy: Omit<CalmCopingStrategy, 'id'>) => {
    const newStrat: CalmCopingStrategy = {
      ...strategy,
      id: `calm-custom-${Date.now()}`,
      isCustom: true,
    };
    setCalmStrategies((prev) => [...prev, newStrat]);
    if (soundEffects) playChime('complete');
  };

  const updateCalmStrategy = (id: string, updates: Partial<CalmCopingStrategy>) => {
    setCalmStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteCalmStrategy = (id: string) => {
    setCalmStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  const resetCalmStrategies = () => {
    setCalmStrategies(DEFAULT_CALM_STRATEGIES);
  };

  const updateBreathingConfig = (config: Partial<BreathingPacerConfig>) => {
    setBreathingConfig((prev) => ({ ...prev, ...config }));
  };

  const resetBreathingConfig = () => {
    setBreathingConfig(DEFAULT_BREATHING_PACER_CONFIG);
  };

  return {
    dashboardWidgets,
    setDashboardWidgets,
    toggleDashboardWidget,
    reorderDashboardWidgets,
    resetDashboardWidgets,
    showDashboardCustomizer,
    setShowDashboardCustomizer,

    helpAlertPresets,
    addHelpAlertPreset,
    updateHelpAlertPreset,
    deleteHelpAlertPreset,
    resetHelpAlertPresets,

    caregiverResponses,
    addCaregiverResponse,
    updateCaregiverResponse,
    deleteCaregiverResponse,
    resetCaregiverResponses,

    showEditAlertsModal,
    setShowEditAlertsModal,

    calmStrategies,
    addCalmStrategy,
    updateCalmStrategy,
    deleteCalmStrategy,
    resetCalmStrategies,

    breathingConfig,
    updateBreathingConfig,
    resetBreathingConfig,

    showEditCalmModal,
    setShowEditCalmModal,
  };
}
