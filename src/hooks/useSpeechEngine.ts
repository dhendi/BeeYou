import { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import {
  speakText,
  playChime,
  stopSpeaking as haltSpeaking,
  subscribeToSpeechState,
  subscribeToVoiceUpdates,
  getOfflineCapableVoices,
} from '../utils/audio';
import { t, setLanguage } from '../services/translator';

interface UseSpeechEngineProps {
  settings: AppSettings;
  onLanguageChanged?: () => void;
}

export function useSpeechEngine({ settings, onLanguageChanged }: UseSpeechEngineProps) {
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

  const speak = async (text: string, options?: { force?: boolean; voicePersona?: string }) => {
    if (settings.soundEffects) playChime('speak');
    const spoken = t(text);
    await speakText(spoken, {
      rate: settings.voiceRate,
      pitch: settings.voicePitch,
      voiceURI: settings.selectedVoiceURI,
      voicePersona: options?.voicePersona || settings.voicePersona || 'puck',
      lang: settings.language,
      force: options?.force,
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
