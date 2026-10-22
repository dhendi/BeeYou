import { useState, useEffect } from 'react';
import { AACItem, QuickPhrase, FavoriteSentence } from '../types';
import {
  DEFAULT_AAC_ITEMS,
  DEFAULT_QUICK_PHRASES,
  DEFAULT_FAVORITE_SENTENCES,
  getFavoriteSentenceSticker,
} from '../data/defaultData';
import { playChime, playAudioUrl } from '../utils/audio';
import {
  autocorrectAacGrammar,
  normalizeAacSentenceToEnglish,
  sanitizeAndMigrateFavoriteSentences,
} from '../utils/aacGrammar';
import { resolveAacImageUrl } from '../services/symbolService';
import { syncChildStatusToCaregiver } from '../services/caregiverSync';

interface UseAacCommunicationProps {
  language: string;
  soundEffects: boolean;
  autoSpeakSentence: boolean;
  childName: string;
  currentMood: string | null;
  speak: (text: string, options?: { force?: boolean; voicePersona?: string; previewAudio?: boolean; voiceURI?: string; sentenceWords?: string[]; gestureTime?: number }) => Promise<void>;
}

export function useAacCommunication({
  language,
  soundEffects,
  autoSpeakSentence,
  childName,
  currentMood,
  speak,
}: UseAacCommunicationProps) {
  const [showAacGuideModal, setShowAacGuideModal] = useState<boolean>(false);
  const [showAacKeyboardModal, setShowAacKeyboardModal] = useState<boolean>(false);
  const [aacActiveScene, setAacActiveScene] = useState<string | null>(null);

  const [aacItems, setAacItems] = useState<AACItem[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_aac_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_AAC_ITEMS;
  });

  const [sentence, setSentence] = useState<AACItem[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<QuickPhrase[]>(DEFAULT_QUICK_PHRASES);
  const [favoriteSentences, setFavoriteSentences] = useState<FavoriteSentence[]>(() => {
    try {
      const saved = localStorage.getItem('beeyou_favorite_sentences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeAndMigrateFavoriteSentences(
            parsed.map((fav: FavoriteSentence) => ({
              ...fav,
              stickerSrc: fav.stickerSrc || getFavoriteSentenceSticker(fav),
            }))
          );
          try {
            localStorage.setItem('beeyou_favorite_sentences', JSON.stringify(sanitized));
          } catch {}
          return sanitized;
        }
      }
    } catch (e) {}
    return DEFAULT_FAVORITE_SENTENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_aac_items', JSON.stringify(aacItems));
    } catch (e) {}
  }, [aacItems]);

  useEffect(() => {
    try {
      localStorage.setItem('beeyou_favorite_sentences', JSON.stringify(favoriteSentences));
    } catch (e) {}
  }, [favoriteSentences]);

  const addToSentence = (item: AACItem, options?: { gestureTime?: number }) => {
    if (soundEffects) playChime('tap');
    const safeItem: AACItem = {
      ...item,
      originalLabel: item.originalLabel || item.label,
    };
    setSentence((prev) => {
      const updated = [...prev, safeItem];
      if (updated.length >= 2 && updated[0].label.trim().toUpperCase() === 'ME') {
        const nextWord = (updated[1].speechText || updated[1].label).trim().toLowerCase();
        const actionVerbs = [
          'go', 'look', 'see', 'watch', 'want', 'need', 'like', 'love', 'eat', 'drink',
          'play', 'feel', 'help', 'sleep', 'read', 'draw', 'tired', 'happy', 'ready', 'sick', 'hurt',
        ];
        if (actionVerbs.includes(nextWord)) {
          updated[0] = {
            ...updated[0],
            label: 'I',
            speechText: 'I',
            originalLabel: 'I',
          };
        }
      }
      return updated;
    });
    if (autoSpeakSentence) {
      if (item.audioDataUrl) {
        playAudioUrl(item.audioDataUrl, item.speechText || item.label);
      } else {
        speak(item.speechText || item.label, { gestureTime: options?.gestureTime });
      }
    }
  };

  const recordSentenceSpoken = (text: string, emoji?: string) => {
    const rawClean = text.trim();
    if (!rawClean) return;
    const cleanText = normalizeAacSentenceToEnglish(rawClean);
    if (!cleanText) return;

    setFavoriteSentences((prev) => {
      const existingIdx = prev.findIndex((s) => s.text.toLowerCase() === cleanText.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          usageCount: (updated[existingIdx].usageCount || 0) + 1,
          lastUsedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newFav: FavoriteSentence = {
          id: `fav-used-${Date.now()}`,
          text: cleanText,
          speechText: cleanText,
          emoji: emoji || '💬',
          stickerSrc: getFavoriteSentenceSticker({ emoji: emoji || '💬', text: cleanText }),
          usageCount: 1,
          lastUsedAt: new Date().toISOString(),
          isCustom: true,
          category: 'favorites',
        };
        return [...prev, newFav];
      }
    });
  };

  const addFavoriteSentence = (
    fav: Omit<FavoriteSentence, 'id' | 'usageCount'> & { usageCount?: number }
  ) => {
    const cleanText = fav.text.trim();
    if (!cleanText) return;
    setFavoriteSentences((prev) => {
      const existingIdx = prev.findIndex((s) => s.text.toLowerCase() === cleanText.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          usageCount: (updated[existingIdx].usageCount || 0) + 1,
          isParentPinned:
            fav.isParentPinned !== undefined ? fav.isParentPinned : updated[existingIdx].isParentPinned,
          emoji: fav.emoji || updated[existingIdx].emoji,
          stickerSrc: fav.stickerSrc || getFavoriteSentenceSticker(fav) || updated[existingIdx].stickerSrc,
          speechText: fav.speechText || updated[existingIdx].speechText,
          lastUsedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        const newFav: FavoriteSentence = {
          id: `fav-custom-${Date.now()}`,
          text: cleanText,
          speechText: fav.speechText || cleanText,
          emoji: fav.emoji || '💬',
          stickerSrc: fav.stickerSrc || getFavoriteSentenceSticker(fav),
          usageCount: fav.usageCount || 1,
          isParentPinned: fav.isParentPinned !== undefined ? fav.isParentPinned : true,
          isCustom: true,
          lastUsedAt: new Date().toISOString(),
          category: fav.category || 'favorites',
        };
        return [newFav, ...prev];
      }
    });
    if (soundEffects) playChime('star');
  };

  const deleteFavoriteSentence = (id: string) => {
    setFavoriteSentences((prev) => prev.filter((f) => f.id !== id));
    if (soundEffects) playChime('clear');
  };

  const togglePinFavoriteSentence = (id: string) => {
    setFavoriteSentences((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isParentPinned: !f.isParentPinned } : f))
    );
    if (soundEffects) playChime('tap');
  };

  const speakSentence = async (gestureTime?: number) => {
    if (sentence.length === 0) return;
    // If single tile with recorded voice, prioritize playing the authentic caregiver recording
    if (sentence.length === 1 && sentence[0].audioDataUrl) {
      const singleSpoken = sentence[0].speechText || sentence[0].label;
      const canonicalSingle = sentence[0].originalLabel || sentence[0].label;
      recordSentenceSpoken(canonicalSingle, sentence[0].emoji);
      void syncChildStatusToCaregiver({
        childName: childName || 'Child',
        lastAacSentence: singleSpoken,
        currentMood: currentMood as any,
      }).catch(() => {});
      await playAudioUrl(sentence[0].audioDataUrl, singleSpoken);
      return;
    }
    const fullText = autocorrectAacGrammar(sentence, language);
    // Always compute the canonical English sentence for cross-lingual persistence and accurate recording:
    const englishTokens = sentence.map((item) => item.originalLabel || item.label);
    const englishSentence = autocorrectAacGrammar(englishTokens, 'en');

    recordSentenceSpoken(englishSentence, sentence[0]?.emoji);
    void syncChildStatusToCaregiver({
      childName: childName || 'Child',
      lastAacSentence: fullText,
      currentMood: currentMood as any,
    }).catch(() => {});
    const sentenceWords = sentence.map((item) => (item.speechText || item.label));
    await speak(fullText, { sentenceWords, gestureTime });
  };

  const clearSentence = () => {
    if (soundEffects) playChime('clear');
    setSentence([]);
  };

  const removeLastFromSentence = () => {
    if (soundEffects) playChime('tap');
    setSentence((prev) => prev.slice(0, -1));
  };

  const saveSentenceAsQuickPhrase = () => {
    if (sentence.length === 0) return;
    const localizedText = autocorrectAacGrammar(sentence, language);
    const englishTokens = sentence.map((item) => item.originalLabel || item.label);
    const englishText = autocorrectAacGrammar(englishTokens, 'en');

    addFavoriteSentence({
      text: englishText, // Store canonical English key so it dynamically translates into any language
      speechText: englishText,
      emoji: sentence[0]?.emoji || '💬',
      isParentPinned: true,
      audioDataUrl: sentence.length === 1 ? sentence[0].audioDataUrl : undefined,
      audioRecordedBy: sentence.length === 1 ? sentence[0].audioRecordedBy : undefined,
    });
    const newQP: QuickPhrase = {
      id: `qp-custom-${Date.now()}`,
      text: localizedText,
      emoji: sentence[0]?.emoji || '💬',
      isCustom: true,
      audioDataUrl: sentence.length === 1 ? sentence[0].audioDataUrl : undefined,
      audioRecordedBy: sentence.length === 1 ? sentence[0].audioRecordedBy : undefined,
    };
    setQuickPhrases((prev) => [newQP, ...prev]);
    if (soundEffects) playChime('star');
  };

  const addAacItem = (
    item: Omit<AACItem, 'id' | 'motorIndex'> & { id?: string; isFavorite?: boolean }
  ) => {
    const cleanLabel = (item.label || '').trim().toLowerCase();

    setAacItems((prev) => {
      const existingIdx = prev.findIndex((i) => (i.label || '').trim().toLowerCase() === cleanLabel);
      if (existingIdx !== -1) {
        return prev.map((it, idx) =>
          idx === existingIdx
            ? {
                ...it,
                speechText: item.speechText || it.speechText,
                emoji: item.emoji || it.emoji,
                photoUrl: item.photoUrl !== undefined ? item.photoUrl : it.photoUrl,
                symbolId: item.symbolId !== undefined ? item.symbolId : it.symbolId,
                symbolSource: item.symbolSource !== undefined ? item.symbolSource : it.symbolSource,
                arasaacId: item.arasaacId !== undefined ? item.arasaacId : it.arasaacId,
                category: item.category || it.category,
                colorType: item.colorType || it.colorType,
                isFavorite: item.isFavorite !== undefined ? item.isFavorite : it.isFavorite,
                audioDataUrl: item.audioDataUrl !== undefined ? item.audioDataUrl : it.audioDataUrl,
                audioRecordedBy: item.audioRecordedBy !== undefined ? item.audioRecordedBy : it.audioRecordedBy,
                audioRecordedAt: item.audioRecordedAt !== undefined ? item.audioRecordedAt : it.audioRecordedAt,
                customDrawingUrl: item.customDrawingUrl !== undefined ? item.customDrawingUrl : it.customDrawingUrl,
              }
            : it
        );
      }

      const newItem: AACItem = {
        id: item.id || `aac-${Date.now()}`,
        label: item.label,
        speechText: item.speechText || item.label,
        emoji: item.emoji || '',
        photoUrl: item.photoUrl,
        symbolId: item.symbolId,
        symbolSource: item.symbolSource || (item.photoUrl ? 'custom' : 'mulberry'),
        arasaacId: item.arasaacId,
        category: item.category,
        colorType: item.colorType,
        motorIndex: prev.length,
        isCustom: true,
        isFavorite: item.isFavorite !== undefined ? item.isFavorite : item.category === 'favorites',
        audioDataUrl: item.audioDataUrl,
        audioRecordedBy: item.audioRecordedBy,
        audioRecordedAt: item.audioRecordedAt,
        customDrawingUrl: item.customDrawingUrl,
      };
      return [...prev, newItem];
    });

    if (soundEffects) playChime('star');
  };

  const updateAacItem = (updated: AACItem) => {
    setAacItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (soundEffects) playChime('tap');
  };

  const toggleAacFavorite = (id: string) => {
    setAacItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (soundEffects) playChime('star');
  };

  const importAacPack = (items: Array<Omit<AACItem, 'id' | 'motorIndex'>>) => {
    setAacItems((prev) => {
      const existingLabels = new Set(prev.map((i) => i.label.toLowerCase()));
      const newItems: AACItem[] = [];
      let nextIndex = prev.length;

      for (const item of items) {
        if (!existingLabels.has(item.label.toLowerCase())) {
          newItems.push({
            id: `aac-pack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: item.label,
            speechText: item.speechText || item.label,
            emoji: item.emoji || '',
            photoUrl: item.photoUrl,
            category: item.category,
            colorType: item.colorType,
            motorIndex: nextIndex++,
            isCustom: true,
          });
          existingLabels.add(item.label.toLowerCase());
        }
      }
      return [...prev, ...newItems];
    });
    if (soundEffects) playChime('complete');
  };

  const upgradeAllAacToClinicalSymbols = () => {
    const defaultLabelMap = new Map(
      DEFAULT_AAC_ITEMS.map((item) => [item.label.toLowerCase().trim(), item.photoUrl])
    );
    const defaultIdMap = new Map(DEFAULT_AAC_ITEMS.map((item) => [item.id, item.photoUrl]));

    setAacItems((prev) =>
      prev.map((item) => {
        if (item.photoUrl?.startsWith('data:image')) return item;
        const verifiedPhoto =
          defaultIdMap.get(item.id) ||
          defaultLabelMap.get((item.label || '').toLowerCase().trim()) ||
          resolveAacImageUrl(item);
        return { ...item, photoUrl: verifiedPhoto };
      })
    );
    if (soundEffects) playChime('complete');
  };

  const deleteAacItem = (id: string) => {
    setAacItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuickPhrase = (phrase: Omit<QuickPhrase, 'id'>) => {
    const newQP: QuickPhrase = {
      id: `qp-custom-${Date.now()}`,
      ...phrase,
      isCustom: true,
    };
    setQuickPhrases((prev) => [newQP, ...prev]);
    if (soundEffects) playChime('star');
  };

  const deleteQuickPhrase = (id: string) => {
    setQuickPhrases((prev) => prev.filter((qp) => qp.id !== id));
  };

  return {
    aacItems,
    setAacItems,
    sentence,
    quickPhrases,
    setQuickPhrases,
    favoriteSentences,
    showAacGuideModal,
    setShowAacGuideModal,
    showAacKeyboardModal,
    setShowAacKeyboardModal,
    aacActiveScene,
    setAacActiveScene,
    addToSentence,
    speakSentence,
    clearSentence,
    removeLastFromSentence,
    saveSentenceAsQuickPhrase,
    recordSentenceSpoken,
    addFavoriteSentence,
    deleteFavoriteSentence,
    togglePinFavoriteSentence,
    addAacItem,
    updateAacItem,
    toggleAacFavorite,
    importAacPack,
    upgradeAllAacToClinicalSymbols,
    deleteAacItem,
    addQuickPhrase,
    deleteQuickPhrase,
  };
}
