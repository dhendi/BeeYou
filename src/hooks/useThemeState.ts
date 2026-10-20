import { useState, useEffect } from 'react';
import { AppTheme } from '../types';
import { PRESET_THEMES } from '../data/themesData';
import { playChime } from '../utils/audio';
import { preloadThemeStickers } from '../utils/stickerPreloader';

interface UseThemeStateProps {
  isPremium: boolean;
  soundEffects: boolean;
  spokenAnnouncements: boolean;
  triggerUpgrade: (reason?: string) => void;
  speak: (text: string) => Promise<void>;
  stars?: number;
  deductStars?: (amount: number) => void;
}

export function useThemeState({
  isPremium,
  soundEffects,
  spokenAnnouncements,
  triggerUpgrade,
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

  // All preset themes (Honey, Turtle, Dino, Frog, Train, Space, etc.) are fully unlocked!
  // Custom user-created studio themes require premium.
  const resolvedThemes = themes.map((t) => ({
    ...t,
    isUnlocked: t.isCustom ? isPremium : true,
    costStars: 0,
  }));

  const activeTheme = resolvedThemes.find((t) => t.id === activeThemeId) || resolvedThemes[0] || PRESET_THEMES[0];

  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && activeTheme) {
        document.documentElement.dataset.themeId = activeTheme.id;
        document.documentElement.dataset.themeCategory = activeTheme.category || '';
      }
      if (typeof window !== 'undefined' && activeTheme) {
        window.dispatchEvent(
          new CustomEvent('beeyou-theme-change', {
            detail: { id: activeTheme.id, category: activeTheme.category },
          })
        );
      }
    } catch (e) {}
  }, [activeTheme]);

  const setTheme = (id: string) => {
    const target = resolvedThemes.find((t) => t.id === id);
    if (target?.isCustom && !isPremium) {
      triggerUpgrade('Custom themes are a BeeYou Premium feature! Start your 15-day free trial to unlock custom theme studio.');
      return;
    }
    if (target) {
      setActiveThemeId(id);
      preloadThemeStickers(id);
      if (soundEffects) playChime('tap');
    }
  };

  const buyTheme = (themeId: string): boolean => {
    const target = resolvedThemes.find((t) => t.id === themeId);
    if (target?.isCustom && !isPremium) {
      triggerUpgrade('Custom themes are a BeeYou Premium feature! Start your 15-day free trial to unlock custom theme studio.');
      return false;
    }
    setActiveThemeId(themeId);
    if (soundEffects) playChime('complete');
    if (spokenAnnouncements && target) {
      speak(`Hooray! You equipped the ${target.name} theme!`);
    }
    return true;
  };

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);

  const setEditingThemeIdSafe = (id: string | null) => {
    if (id && !isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    setEditingThemeId(id);
  };

  const createCustomTheme = (themeData: Omit<AppTheme, 'id' | 'isCustom' | 'isUnlocked'>): AppTheme => {
    if (!isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
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

  const updateTheme = (id: string, updates: Partial<AppTheme>) => {
    if (!isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    setThemes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    if (soundEffects) playChime('complete');
    if (spokenAnnouncements && updates.name) {
      speak(`Saved updates to ${updates.name} theme!`);
    }
  };

  const resetThemeToPreset = (id: string) => {
    if (!isPremium) {
      triggerUpgrade('Theme Studio and custom theme editing is a BeeYou Plus feature! Start your 15-day free trial.');
      return;
    }
    const original = PRESET_THEMES.find((p) => p.id === id);
    if (original) {
      setThemes((prev) => prev.map((t) => (t.id === id ? { ...original } : t)));
      if (soundEffects) playChime('tap');
    }
  };

  const deleteCustomTheme = (id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
    if (activeThemeId === id) {
      setActiveThemeId('theme-classic');
    }
    if (soundEffects) playChime('clear');
  };

  return {
    themes: resolvedThemes,
    activeThemeId,
    activeTheme,
    setTheme,
    buyTheme,
    createCustomTheme,
    updateCustomTheme: updateTheme,
    updateTheme,
    resetThemeToPreset,
    deleteCustomTheme,
    showThemeModal,
    setShowThemeModal,
    editingThemeId,
    setEditingThemeId: setEditingThemeIdSafe,
  };
}
