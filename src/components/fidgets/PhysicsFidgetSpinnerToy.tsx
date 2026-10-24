import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const PhysicsFidgetSpinnerToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [angle, setAngle] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [maxRpm, setMaxRpm] = useState(0);
  const [spinnerSkin, setSpinnerSkin] = useState<'rainbow' | 'bee' | 'midnight'>('bee');
  
  const velocityRef = useRef(0);
  const lastTickAngleRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragCenterRef = useRef<{ cx: number; cy: number }>({ cx: 0, cy: 0 });
  const lastPointerAngleRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const loop = () => {
      if (!isDraggingRef.current) {
        // Friction damping
        velocityRef.current *= 0.985;
        if (Math.abs(velocityRef.current) < 0.05) velocityRef.current = 0;
        
        if (velocityRef.current !== 0) {
          setAngle((prev) => {
            const next = prev + velocityRef.current;
            // Tick sound on full blade pass
            if (Math.abs(next - lastTickAngleRef.current) >= 120) {
              lastTickAngleRef.current = next;
              audioEngine.playSpinnerTick(soundEnabled);
              triggerHaptic(10, hapticEnabled);
            }
            return next;
          });
        }
      }

      // Calculate approximate RPM
      const currentRpm = Math.round((Math.abs(velocityRef.current) * 60) / 360 * 30);
      setRpm(currentRpm);
      if (currentRpm > maxRpm) setMaxRpm(currentRpm);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [soundEnabled, hapticEnabled, maxRpm]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragCenterRef.current = { cx, cy };
    
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    lastPointerAngleRef.current = (rad * 180) / Math.PI;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const { cx, cy } = dragCenterRef.current;
    const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
    const curAngle = (rad * 180) / Math.PI;
    
    let diff = curAngle - lastPointerAngleRef.current;
    // Fix wrap-around jumps
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const now = Date.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    velocityRef.current = (diff / dt) * 16; // scaled velocity

    setAngle((prev) => prev + diff);
    lastPointerAngleRef.current = curAngle;
    lastTimeRef.current = now;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const flickSpeed = (speed: number) => {
    velocityRef.current = speed;
    audioEngine.playSpinnerTick(soundEnabled);
    triggerHaptic(30, hapticEnabled);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* RPM Meter & Skin Selector */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'bee' as const, label: 'Honey' },
            { id: 'rainbow' as const, label: 'Neon' },
            { id: 'midnight' as const, label: 'Galaxy' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { setSpinnerSkin(s.id); triggerHaptic(15, hapticEnabled); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                spinnerSkin === s.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t(s.label)}
            </button>
          ))}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Speed')}</p>
          <p className="text-sm font-black text-amber-500">{rpm} RPM <span className="text-[10px] text-slate-400">({t('Max')}: {maxRpm})</span></p>
        </div>
      </div>

      {/* Interactive Spinner Surface */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-64 h-64 rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none relative shadow-inner"
      >
        {/* Revolving Spinner Arms */}
        <div
          style={{ transform: `rotate(${angle}deg)` }}
          className="w-48 h-48 relative flex items-center justify-center pointer-events-none transition-none"
        >
          {/* 3 Blades */}
          {[0, 120, 240].map((deg) => (
            <div
              key={deg}
              style={{ transform: `rotate(${deg}deg) translateY(-42px)` }}
              className="absolute flex flex-col items-center"
            >
              <div
                className={`w-14 h-14 rounded-full border-4 flex items-center justify-center shadow-lg ${
                  spinnerSkin === 'bee'
                    ? 'bg-amber-400 border-amber-500 text-amber-950'
                    : spinnerSkin === 'rainbow'
                    ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 border-white text-white'
                    : 'bg-indigo-900 border-indigo-700 text-indigo-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white/70 border border-slate-400 shadow-inner flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                </div>
              </div>
            </div>
          ))}

          {/* Central Bearing Core */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 border-4 border-slate-500 shadow-xl flex items-center justify-center z-10">
            <div className="w-4 h-4 rounded-full bg-slate-700 shadow-inner" />
          </div>
        </div>
      </div>

      {/* Quick Flick Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={() => flickSpeed(-35)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Flick Left')}</span>
        </button>
        <button
          onClick={() => { velocityRef.current = 0; }}
          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
        >
          {t('Stop')}
        </button>
        <button
          onClick={() => flickSpeed(35)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <span>{t('Flick Right')}</span>
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
