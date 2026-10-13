import { useState, useEffect } from 'react';
import { AppTheme } from '../types';
import { PRESET_THEMES } from '../data/themesData';
import { playChime } from '../utils/audio';

interface UseThemeStateProps {
  isPremium: boolean;
  stars: number;
  soundEffects: boolean;
  spokenAnnouncements: boolean;
  triggerUpgrade: (reason?: string) => void;
  deductStars: (amount: number) => void;
  speak: (text: string) => Promise<void>;
}

export function useThemeState({
  isPremium,
  stars,
  soundEffects,
  spokenAnnouncements,
  triggerUpgrade,
  deductStars,
  speak,
}: UseThemeStateProps) {
  const [themes, setThemes] = useState<AppTheme[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_themes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customThemes = parsed.filter((p: AppTheme) => p.isCustom);
          const presets = PRESET_THEMES.map((preset) => {
            const found = parsed.find((p: AppTheme) => p.id === preset.id);
            return found ? { ...preset, isUnlocked: found.isUnlocked } : preset;
          });
          return [...presets, ...customThemes];
        }
      }
    } catch (e) {
      console.error('Failed to parse beeyou_themes:', e);
    }
    return PRESET_THEMES;
  });

  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('beeyou_active_theme_id');
      if (saved) return saved;
    } catch (e) {}
    return 'theme-classic';
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_themes', JSON.stringify(themes));
    } catch (e) {}
  }, [themes]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_active_theme_id', activeThemeId);
    } catch (e) {}
  }, [activeThemeId]);

  useEffect(() => {
    if (!isPremium && activeThemeId !== 'theme-classic') {
      setActiveThemeId('theme-classic');
    }
  }, [isPremium, activeThemeId]);

  const activeTheme = !isPremium
    ? themes.find((t) => t.id === 'theme-classic') || PRESET_THEMES.find((t) => t.id === 'theme-classic') || themes[0]
    : themes.find((t) => t.id === activeThemeId) || themes[0] || PRESET_THEMES[0];

  const setTheme = (id: string) => {
    if (!isPremium && id !== 'theme-classic') {
      triggerUpgrade('Themes are a BeeYou Premium feature! Start your 15-day free trial to unlock all themes.');
      return;
    }
    const target = themes.find((t) => t.id === id);
    if (target && target.isUnlocked) {
      setActiveThemeId(id);
    }
  };

  const buyTheme = (themeId: string): boolean => {
    if (!isPremium) {
      triggerUpgrade('Themes are a BeeYou Premium feature! Start your 15-day free trial to unlock all themes.');
      return false;
    }
    const target = themes.find((t) => t.id === themeId);
    if (!target) return false;
    if (target.isUnlocked) {
      setTheme(themeId);
      return true;
    }
    if (stars < target.costStars) {
      if (soundEffects) playChime('tap');
      speak(`Need ${target.costStars - stars} more stars to unlock ${target.name}!`);
      return false;
    }

    deductStars(target.costStars);

    setThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, isUnlocked: true } : t))
    );

    setActiveThemeId(themeId);
    if (soundEffects) playChime('star');
    if (spokenAnnouncements) {
      speak(`Hooray! You unlocked and equipped the ${target.name} theme!`);
    }
    return true;
  };

  const createCustomTheme = (themeData: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>): AppTheme => {
    if (!isPremium) {
      triggerUpgrade('Custom Theme Studio is a BeeYou Premium feature! Start your 15-day free trial.');
      throw new Error('Premium required for custom themes');
    }
    const newTheme: AppTheme = {
      ...themeData,
      id: `custom-theme-${Date.now()}`,
      isCustom: true,
      isUnlocked: true,
      costStars: 0,
    };
    setThemes((prev) => [...prev, newTheme]);
    setActiveThemeId(newTheme.id);
    if (soundEffects) playChime('complete');
    if (spokenAnnouncements) {
      speak(`Awesome! Created your custom theme ${newTheme.name}!`);
    }
    return newTheme;
  };

  const updateCustomTheme = (id: string, updates: Partial<AppTheme>) => {
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteCustomTheme = (id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
    if (activeThemeId === id) {
      setActiveThemeId('theme-classic');
    }
    if (soundEffects) playChime('clear');
  };

  return {
    themes,
    activeThemeId,
    activeTheme,
    showThemeModal,
    setShowThemeModal,
    setTheme,
    buyTheme,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
  };
}
