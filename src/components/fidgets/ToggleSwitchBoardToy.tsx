import React, { useState } from 'react';
import { Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const ToggleSwitchBoardToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [switches, setSwitches] = useState({
    mainPower: true,
    sw1: false,
    sw2: true,
    sw3: false,
    sw4: true,
    sliderVal: 50,
  });

  const toggleSwitch = (key: keyof typeof switches) => {
    setSwitches((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      audioEngine.playSwitch('relay', soundEnabled);
      triggerHaptic(30, hapticEnabled);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full px-2">
        <p className="text-xs font-bold text-slate-500">{t('Satisfying switches, latches & relays')}</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Zap className="w-3 h-3" /> {t('Relay active')}
        </span>
      </div>

      <div className="w-full max-w-sm p-4 rounded-3xl bg-slate-800 border-4 border-slate-700 shadow-2xl flex flex-col gap-4 text-white">
        {/* Master Rocker Switch with Glow */}
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">{t('Master Circuit')}</p>
            <p className="text-[10px] text-slate-400">{t('Main illuminated rocker')}</p>
          </div>
          <button
            onClick={() => toggleSwitch('mainPower')}
            className={`w-16 h-9 rounded-xl p-1 transition-all cursor-pointer flex items-center border-2 ${
              switches.mainPower
                ? 'bg-emerald-500 border-emerald-400 justify-end shadow-lg shadow-emerald-500/30'
                : 'bg-slate-700 border-slate-600 justify-start'
            }`}
          >
            <div className={`w-6 h-7 rounded-lg bg-white shadow-md flex items-center justify-center font-bold text-[9px] ${
              switches.mainPower ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {switches.mainPower ? t('ON') : t('OFF')}
            </div>
          </button>
        </div>

        {/* 4 Heavy Toggle Switches */}
        <div className="grid grid-cols-4 gap-2">
          {(['sw1', 'sw2', 'sw3', 'sw4'] as const).map((id, idx) => {
            const isOn = switches[id];
            return (
              <button
                key={id}
                onClick={() => toggleSwitch(id)}
                className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  isOn
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isOn ? 'bg-amber-400 shadow-md shadow-amber-400 scale-110' : 'bg-slate-700'
                }`} />
                <span className="text-[10px] font-mono font-bold">SW-{idx + 1}</span>
                <span className="text-sm p-1 rounded-md bg-slate-800">
                  {isOn ? <ArrowUp className="w-4 h-4 text-emerald-400" /> : <ArrowDown className="w-4 h-4 text-slate-400" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Smooth Stepless Slider */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-300">
            <span>{t('Sensory Frequency Slider')}</span>
            <span className="text-amber-400 font-mono">{switches.sliderVal}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={switches.sliderVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSwitches((p) => ({ ...p, sliderVal: val }));
              audioEngine.playSpinnerTick(soundEnabled);
              triggerHaptic(10, hapticEnabled);
            }}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
