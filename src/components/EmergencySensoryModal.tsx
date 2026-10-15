import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, Volume2, VolumeX, Heart, MicOff, Hand, Moon, PhoneCall } from 'lucide-react';
import { playSoundscape, stopSoundscape, setSoundscapeVolume } from '../utils/audio';
import { SoundscapeId } from '../types';
import { AccessibleTile } from './common/AccessibleTile';
import { t } from '../services/translator';

const EMERGENCY_AAC_CARDS = [
  { text: 'I cannot speak right now.', icon: MicOff, color: '#1e40af' },
  { text: 'Please give me space.', icon: Hand, color: '#7c3aed' },
  { text: 'Dim the lights.', icon: Moon, color: '#92400e' },
  { text: 'Call my caregiver.', icon: PhoneCall, color: '#991b1b' },
];

const SOUNDSCAPE_OPTIONS: { id: SoundscapeId; label: string }[] = [
  { id: 'brown_noise', label: 'Brown Noise' },
  { id: 'rain', label: 'Rain' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'fireplace', label: 'Cozy Fireplace' },
  { id: 'white_noise', label: 'White Noise' },
  { id: 'forest', label: 'Forest' },
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
    // Do not autoplay sound on open; keep silent until user explicitly turns sound on
    stopSoundscape();
    setSoundOn(false);
    audioStartedRef.current = false;
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Emergency Sensory Mode')}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-gray-950 w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border-2 border-red-500/40 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">{t('Emergency Sensory Mode')}</p>
              <h2 className="text-lg font-black text-white">{t('I need help right now')}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('Close emergency sensory mode')}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95 focus-visible:ring-4 focus-visible:ring-amber-500/70"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col items-center">
          <p className="text-gray-400 text-sm font-medium text-center mb-5 max-w-xs">
            {t('Tap a card to speak it aloud. The room will dim and a calming sound will play.')}
          </p>

          {/* 4 Large Emergency AAC Cards */}
          <div className="grid grid-cols-2 gap-3.5 w-full mb-6">
            {EMERGENCY_AAC_CARDS.map((card) => {
              const IconComp = card.icon;
              return (
                <AccessibleTile
                  key={card.text}
                  variant="emergency"
                  label={card.text}
                  onClick={() => handleCard(card.text)}
                  className="relative rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 border-2 border-white/10 hover:border-white/30"
                  style={{ backgroundColor: card.color + '33', borderColor: spokenCard === card.text ? '#ffffff80' : undefined }}
                >
                  {spokenCard === card.text && (
                    <div className="absolute inset-0 rounded-3xl bg-white/10 animate-pulse pointer-events-none" />
                  )}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <IconComp className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
                  </div>
                  <p className="text-white font-black text-sm sm:text-base text-center leading-tight">
                    {card.text}
                  </p>
                </AccessibleTile>
              );
            })}
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
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
                <option key={s.id} value={s.id}>{s.label}</option>
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
          <p className="mt-5 text-gray-500 text-xs text-center">
            {t('Press the Close button or take some deep breaths when you feel ready.')}
          </p>
        </div>
      </div>
    </div>
  );
};
