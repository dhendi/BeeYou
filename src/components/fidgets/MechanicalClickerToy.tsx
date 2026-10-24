import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const MechanicalClickerToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [clickCount, setClickCount] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keys = [
    { id: 'blue-1', label: 'Blue Clicky', switchType: 'blue' as const, sub: 'Loud & Crisp', color: 'border-blue-400 bg-blue-50 text-blue-900', led: 'bg-blue-400' },
    { id: 'brown-1', label: 'Brown Tactile', switchType: 'brown' as const, sub: 'Soft Bump', color: 'border-amber-500 bg-amber-50 text-amber-900', led: 'bg-amber-400' },
    { id: 'red-1', label: 'Red Linear', switchType: 'red' as const, sub: 'Smooth Bounce', color: 'border-rose-400 bg-rose-50 text-rose-900', led: 'bg-rose-400' },
    { id: 'relay-1', label: 'Relay Clicker', switchType: 'relay' as const, sub: 'Industrial Snap', color: 'border-emerald-500 bg-emerald-50 text-emerald-900', led: 'bg-emerald-400' },
  ];

  const handleClick = (k: typeof keys[0]) => {
    setActiveKey(k.id);
    setClickCount((p) => p + 1);
    audioEngine.playSwitch(k.switchType, soundEnabled);
    triggerHaptic(k.switchType === 'blue' ? 35 : 20, hapticEnabled);
    setTimeout(() => setActiveKey(null), 120);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full px-2">
        <p className="text-xs font-bold text-slate-500">{t('Press mechanical key switches')}</p>
        <p className="text-xs font-black text-indigo-600">{clickCount} {t('clicks')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 w-full max-w-sm">
        {keys.map((k) => {
          const isPressed = activeKey === k.id;
          return (
            <button
              key={k.id}
              onClick={() => handleClick(k)}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${k.color} ${
                isPressed ? 'translate-y-1.5 shadow-inner' : 'shadow-lg hover:-translate-y-0.5'
              }`}
              style={{
                boxShadow: isPressed
                  ? 'inset 0 4px 6px rgba(0,0,0,0.2)'
                  : '0 8px 0 rgba(0,0,0,0.12), 0 10px 14px rgba(0,0,0,0.08)',
              }}
            >
              <div className={`w-2 h-2 rounded-full mb-2 transition-all ${k.led} ${isPressed ? 'ring-4 ring-white/80 scale-125' : 'opacity-60'}`} />
              <span className="font-black text-sm">{t(k.label)}</span>
              <span className="text-[11px] font-medium opacity-75 mt-0.5">{t(k.sub)}</span>
            </button>
          );
        })}
      </div>

      {/* Big Spacebar Thud Clicker */}
      <button
        onClick={() => {
          setActiveKey('spacebar');
          setClickCount((p) => p + 1);
          audioEngine.playSwitch('brown', soundEnabled);
          triggerHaptic(40, hapticEnabled);
          setTimeout(() => setActiveKey(null), 140);
        }}
        className={`w-full max-w-sm py-4 rounded-2xl border-2 border-indigo-400 bg-indigo-50 text-indigo-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeKey === 'spacebar' ? 'translate-y-1.5 shadow-inner' : 'shadow-lg hover:-translate-y-0.5'
        }`}
        style={{
          boxShadow: activeKey === 'spacebar'
            ? 'inset 0 4px 6px rgba(0,0,0,0.2)'
            : '0 8px 0 rgba(99,102,241,0.3), 0 10px 14px rgba(0,0,0,0.08)',
        }}
      >
        <Keyboard className="w-5 h-5 text-indigo-700" aria-hidden="true" />
        <span>{t('Big Spacebar Clicker')}</span>
      </button>
    </div>
  );
};
