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
import { t, setLanguage } from '../services/translator';

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
    const persona = isPremium === false ? 'system' : (settings.voicePersona || 'system');
    prewarmCoreAudioVocabulary(persona, settings.language || 'en');
  }, [settings.voicePersona, settings.language, isPremium]);

  const speak = async (
    text: string,
    options?: {
      force?: boolean;
      voicePersona?: string;
      previewAudio?: boolean;
      voiceURI?: string;
      sentenceWords?: string[];
    }
  ) => {
    if (settings.soundEffects) playChime('speak');
    const spoken = t(text);
    let personaToUse = options?.voicePersona || settings.voicePersona || 'system';
    // If user is on Free tier, restrict speech strictly to on-device system voice
    // (Only explicit audition previews with previewAudio === true may play a 2-second snippet)
    if (isPremium === false && personaToUse !== 'system' && !options?.previewAudio) {
      personaToUse = 'system';
    }
    await speakText(spoken, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceURI: options?.voiceURI || (personaToUse === 'system' ? settings.selectedVoiceURI : undefined),
      voicePersona: personaToUse,
      lang: settings.language,
      force: options?.force,
      previewAudio: options?.previewAudio,
      sentenceWords: (settings.language && settings.language !== 'en') ? undefined : options?.sentenceWords,
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
