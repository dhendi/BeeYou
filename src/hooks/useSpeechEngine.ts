import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import {
  speakText,
  playChime,
  stopSpeaking as haltSpeaking,
  subscribeToSpeechState,
  subscribeToVoiceUpdates,
  getOfflineCapableVoices,
  prewarmCoreAudioVocabulary,
} from '../utils/audio';
import { t, setLanguage, getLanguage, translateDynamic } from '../services/translator';
import { getVoicePersonaById } from '../data/voicePersonasData';

interface UseSpeechEngineProps {
  settings: AppSettings;
  isPremium?: boolean;
  onLanguageChanged?: () => void;
}

export function useSpeechEngine({ settings, isPremium, onLanguageChanged }: UseSpeechEngineProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [offlineVoices, setOfflineVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const unsubSpeech = subscribeToSpeechState((speaking, text) => {
      setIsSpeaking(speaking);
      setSpeakingText(text);
    });

    const unsubVoices = subscribeToVoiceUpdates(() => {
      setOfflineVoices(getOfflineCapableVoices(settings.language));
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineVoices(getOfflineCapableVoices(settings.language));
    setLanguage(settings.language || 'en').then(() => {
      if (onLanguageChanged) onLanguageChanged();
    });

    return () => {
      unsubSpeech();
      unsubVoices();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.language]);

  useEffect(() => {
    const persona = settings.voicePersona || 'amy';
    prewarmCoreAudioVocabulary(persona, settings.language || 'en');
  }, [settings.voicePersona, settings.language]);

  const speak = async (
    text: string,
    options?: {
      force?: boolean;
      voicePersona?: string;
      previewAudio?: boolean;
      voiceURI?: string;
      sentenceWords?: string[];
      gestureTime?: number;
    }
  ) => {
    if (settings.soundEffects && options?.previewAudio) playChime('speak');
    const personaToUse = options?.voicePersona || settings.voicePersona || 'amy';
    const personaObj = getVoicePersonaById(personaToUse);
    const personaLang = (personaObj.language && personaObj.language !== 'all') ? personaObj.language : undefined;
    const currentActiveLang = (options?.previewAudio && personaLang)
      ? personaLang
      : ((settings.language && settings.language !== 'en') ? settings.language : (getLanguage() || settings.language || 'en'));

    let spoken = text;
    if (!options?.previewAudio) {
      spoken = t(text);
      if (currentActiveLang && currentActiveLang !== 'en' && spoken === text && text.trim().length > 0) {
        try {
          spoken = await translateDynamic(text);
        } catch {}
      }
    }

    await speakText(spoken, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceURI: options?.voiceURI || (personaToUse === 'system' ? settings.selectedVoiceURI : undefined),
      voicePersona: personaToUse,
      lang: currentActiveLang,
      force: options?.force,
      previewAudio: options?.previewAudio,
      sentenceWords: (currentActiveLang && currentActiveLang !== 'en') ? undefined : options?.sentenceWords,
      gestureTime: options?.gestureTime,
    });
  };

  const announce = async (text: string, options?: { force?: boolean }) => {
    if (!settings.spokenAnnouncements) return;
    await speak(text, options);
  };

  const stopSpeaking = () => {
    haltSpeaking();
  };

  return {
    isSpeaking,
    speakingText,
    isOffline,
    offlineVoices,
    speak,
    announce,
    stopSpeaking,
  };
}
