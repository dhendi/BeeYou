import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, Volume2, VolumeX, Heart } from 'lucide-react';
import { playSoundscape, stopSoundscape, setSoundscapeVolume } from '../utils/audio';
import { SoundscapeId } from '../types';

const EMERGENCY_AAC_CARDS = [
  { text: 'I cannot speak right now.', emoji: '🤐', color: '#1e40af' },
  { text: 'Please give me space.', emoji: '🙏', color: '#7c3aed' },
  { text: 'Dim the lights.', emoji: '💡', color: '#92400e' },
  { text: 'Call my caregiver.', emoji: '📞', color: '#991b1b' },
];

const SOUNDSCAPE_OPTIONS: { id: SoundscapeId; label: string; emoji: string }[] = [
  { id: 'brown_noise', label: 'Brown Noise', emoji: '🌫️' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'white_noise', label: 'White Noise', emoji: '📻' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
];

export const EmergencySensoryModal: React.FC = () => {
  const {
    showEmergencyModal,
    deactivateEmergencyMode,
    emergencyMode,
    setEmergencyMode,
    speak,
    setShowCaregiverAlertModal,
    childProfile,
  } = useApp();

  const [soundOn, setSoundOn] = useState(false);
  const [spokenCard, setSpokenCard] = useState<string | null>(null);
  const audioStartedRef = useRef(false);

  useEffect(() => {
    if (!showEmergencyModal) {
      stopSoundscape();
      audioStartedRef.current = false;
      setSoundOn(false);
      return;
    }
    // Auto-start preferred soundscape
    const sc = emergencyMode.preferredSoundscape || 'brown_noise';
    const vol = emergencyMode.preferredSoundscapeVolume ?? 0.06;
    playSoundscape(sc);
    setSoundscapeVolume(vol);
    setSoundOn(true);
    audioStartedRef.current = true;
  }, [showEmergencyModal]);

  const handleClose = () => {
    stopSoundscape();
    deactivateEmergencyMode();
  };

  const handleCard = (text: string) => {
    speak(text);
    setSpokenCard(text);
    setTimeout(() => setSpokenCard(null), 2000);
  };

  const toggleSound = () => {
    if (soundOn) {
      stopSoundscape();
      setSoundOn(false);
    } else {
      const sc = emergencyMode.preferredSoundscape || 'brown_noise';
      playSoundscape(sc);
      setSoundscapeVolume(emergencyMode.preferredSoundscapeVolume ?? 0.06);
      setSoundOn(true);
    }
  };

  if (!showEmergencyModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Emergency Sensory Mode</p>
            <h2 className="text-lg font-black text-white">I need help right now</h2>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm font-medium text-center mb-6 max-w-xs">
        Tap a card to speak it aloud. The room will dim and a calming sound will play.
      </p>

      {/* 4 Large Emergency AAC Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
        {EMERGENCY_AAC_CARDS.map((card) => (
          <button
            key={card.text}
            onClick={() => handleCard(card.text)}
            className="relative rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 border-2 border-white/10 hover:border-white/30"
            style={{ backgroundColor: card.color + '33', borderColor: spokenCard === card.text ? '#ffffff80' : undefined }}
          >
            {spokenCard === card.text && (
              <div className="absolute inset-0 rounded-3xl bg-white/10 animate-pulse pointer-events-none" />
            )}
            <span className="text-5xl sm:text-6xl">{card.emoji}</span>
            <p className="text-white font-black text-sm sm:text-base text-center leading-tight">
              {card.text}
            </p>
          </button>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border ${
            soundOn ? 'bg-indigo-800 border-indigo-600 text-indigo-200' : 'bg-gray-800 border-gray-600 text-gray-300'
          }`}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundOn ? 'Sound On' : 'Sound Off'}</span>
        </button>

        {/* Soundscape picker */}
        <select
          value={emergencyMode.preferredSoundscape || 'brown_noise'}
          onChange={(e) => {
            const sc = e.target.value as SoundscapeId;
            setEmergencyMode({ preferredSoundscape: sc });
            if (soundOn) {
              stopSoundscape();
              playSoundscape(sc);
              setSoundscapeVolume(emergencyMode.preferredSoundscapeVolume ?? 0.06);
            }
          }}
          className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-2xl px-3 py-2.5 font-bold cursor-pointer"
        >
          {SOUNDSCAPE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
          ))}
        </select>

        {/* Caregiver ping */}
        <button
          onClick={() => setShowCaregiverAlertModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-800 border border-rose-600 text-rose-200 font-bold text-sm cursor-pointer transition-all active:scale-95"
        >
          <Heart className="w-4 h-4 fill-rose-300" />
          <span>Ping Caregiver</span>
        </button>
      </div>

      {/* Safe exit hint */}
      <p className="mt-6 text-gray-600 text-xs text-center">
        Press the ✕ button or take some deep breaths when you feel ready.
      </p>
    </div>
  );
};
