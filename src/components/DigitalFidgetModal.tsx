import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  ToggleLeft, 
  Star, 
  Grid, 
  CircleDot,
  Keyboard,
  RotateCw,
  Waves,
  Box
} from 'lucide-react';
import { t } from '../services/translator';
import { 
  TurtlePondFidgetBubblesSticker, 
  DinoRexSticker, 
  FrogMascotSticker 
} from './icons/JournalStickers';
import { 
  audioEngine, 
  triggerHaptic,
  PopItToy,
  BubbleWrapToy,
  MechanicalClickerToy,
  PhysicsFidgetSpinnerToy,
  ToggleSwitchBoardToy,
  SquishySlimeToy,
  CalmingStarlightToy,
  FidgetCubeWorryStoneToy
} from './fidgets';

export type FidgetCategory = 'pop' | 'bubblewrap' | 'switches' | 'spinner' | 'toggles' | 'slime' | 'starlight' | 'cube';

export const DigitalFidgetModal: React.FC = () => {
  const { showFidgetModal, setShowFidgetModal, activeTheme } = useApp();
  const isTurtleTheme = activeTheme?.category === 'turtle' || activeTheme?.id === 'theme-turtle';
  const isDinoTheme = activeTheme?.category === 'dinosaur' || activeTheme?.id === 'theme-dino';
  const isFrogTheme = activeTheme?.category === 'frog' || activeTheme?.id === 'theme-frog';
  const [activeFidget, setActiveFidget] = useState<FidgetCategory>('pop');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  const [, setLangVersion] = useState(0);
  useEffect(() => {
    const handleLangChanged = () => setLangVersion((v) => v + 1);
    window.addEventListener('beeyou_lang_changed', handleLangChanged);
    return () => window.removeEventListener('beeyou_lang_changed', handleLangChanged);
  }, []);

  if (!showFidgetModal) return null;

  const categories = [
    { id: 'pop' as const, label: 'Pop-It', icon: CircleDot, desc: 'Silicone shapes' },
    { id: 'bubblewrap' as const, label: 'Bubble Wrap', icon: Grid, desc: 'Crisp plastic sheets' },
    { id: 'switches' as const, label: 'Clickers', icon: Keyboard, desc: 'Key switches' },
    { id: 'spinner' as const, label: 'Spinner', icon: RotateCw, desc: 'Physics RPM' },
    { id: 'toggles' as const, label: 'Switches', icon: ToggleLeft, desc: 'Relays & sliders' },
    { id: 'slime' as const, label: 'Slime', icon: Waves, desc: 'Squishy stress ball' },
    { id: 'starlight' as const, label: 'Starlight', icon: Star, desc: 'Calm galaxy flow' },
    { id: 'cube' as const, label: 'Worry Stone', icon: Box, desc: 'Fidget cube pad' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Tactile Fidget Toys')}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setShowFidgetModal(false)}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[calc(100dvh-2.5rem)] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {isTurtleTheme && (
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                <TurtlePondFidgetBubblesSticker className="w-full h-full object-contain" />
              </div>
            )}
            {isDinoTheme && (
              <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                <DinoRexSticker className="w-full h-full object-contain" />
              </div>
            )}
            {isFrogTheme && (
              <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                <FrogMascotSticker className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                isFrogTheme ? 'text-lime-800' : isTurtleTheme ? 'text-emerald-800' : isDinoTheme ? 'text-green-800' : 'text-indigo-500'
              }`}>
                {isFrogTheme
                  ? t('Ribbit Pond Sensory Lily Pad')
                  : isTurtleTheme
                  ? t('Wise Turtle Sensory Pond')
                  : isDinoTheme
                    ? t('Dino Kingdom Sensory Excavation')
                    : t('Tappy-Style Sensory Hub')}
              </p>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{t('Tactile Fidget Toys')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled((p) => !p);
                if (navigator.vibrate) navigator.vibrate(20);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                soundEnabled ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
              title={soundEnabled ? t('Mute sound') : t('Unmute sound')}
              aria-label={soundEnabled ? t('Mute sound') : t('Unmute sound')}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Haptic Toggle */}
            <button
              onClick={() => {
                setHapticEnabled((p) => !p);
                if (!hapticEnabled && navigator.vibrate) navigator.vibrate(30);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                hapticEnabled ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
              title={hapticEnabled ? t('Disable vibration') : t('Enable vibration')}
              aria-label={hapticEnabled ? t('Disable vibration') : t('Enable vibration')}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setShowFidgetModal(false)}
              aria-label={t('Close')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sensory Category Selector Carousel */}
        <div className="flex gap-2 px-4 py-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {categories.map((c) => {
            const IconComp = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveFidget(c.id);
                  audioEngine.playSwitch('red', soundEnabled);
                  triggerHaptic(15, hapticEnabled);
                }}
                title={t(c.desc)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeFidget === c.id
                    ? isFrogTheme
                      ? 'bg-lime-600 border-lime-600 text-white shadow-sm'
                      : isDinoTheme
                      ? 'bg-green-600 border-green-600 text-white shadow-sm'
                      : isTurtleTheme
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{t(c.label)}</span>
              </button>
            );
          })}
        </div>

        {/* Active Fidget Playground */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center min-h-[320px] overflow-y-auto">
          {activeFidget === 'pop' && <PopItToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'bubblewrap' && <BubbleWrapToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'switches' && <MechanicalClickerToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'spinner' && <PhysicsFidgetSpinnerToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'toggles' && <ToggleSwitchBoardToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'slime' && <SquishySlimeToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'starlight' && <CalmingStarlightToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
          {activeFidget === 'cube' && <FidgetCubeWorryStoneToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
        </div>
      </div>
    </div>
  );
};
