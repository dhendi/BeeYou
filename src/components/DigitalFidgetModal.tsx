import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Radio, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  Disc, 
  Star, 
  Heart, 
  Grid, 
  Layers,
  CircleDot
} from 'lucide-react';
import { playChime } from '../utils/audio';

// ── Web Audio Synthesizer for Realistic Tactile Feedback ───────────────────────
class FidgetAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop(pitchModifier = 1.0, enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const now = this.ctx.currentTime;
      const freq = (420 + Math.random() * 120) * pitchModifier;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  playSwitch(type: 'blue' | 'brown' | 'red' | 'relay', enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'blue') {
        // High crisp tactile click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'brown') {
        // Muted thud click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'red') {
        // Soft linear bounce
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else {
        // Mechanical heavy toggle relay
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch (e) {}
  }

  playSpinnerTick(enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }
}

const audioEngine = new FidgetAudioEngine();

const triggerHaptic = (ms = 25, enabled = true) => {
  if (enabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {}
  }
};

// ── TOY 1: Multi-Shape Pop-It Bubble Wrap ─────────────────────────────────────
type PopShape = 'grid' | 'heart' | 'star' | 'honeycomb';

const SHAPE_PATTERNS: Record<PopShape, number[][]> = {
  grid: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  heart: [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  star: [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
  ],
  honeycomb: [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
  ],
};

const ROW_COLORS = [
  'from-rose-400 to-rose-500 border-rose-300 text-rose-950',
  'from-amber-400 to-amber-500 border-amber-300 text-amber-950',
  'from-yellow-400 to-yellow-500 border-yellow-300 text-yellow-950',
  'from-emerald-400 to-emerald-500 border-emerald-300 text-emerald-950',
  'from-sky-400 to-sky-500 border-sky-300 text-sky-950',
  'from-purple-400 to-purple-500 border-purple-300 text-purple-950',
  'from-pink-400 to-pink-500 border-pink-300 text-pink-950',
];

interface PopItProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const PopItToy: React.FC<PopItProps> = ({ soundEnabled, hapticEnabled }) => {
  const [shape, setShape] = useState<PopShape>('grid');
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [totalPopCount, setTotalPopCount] = useState<number>(0);

  const pattern = SHAPE_PATTERNS[shape];
  let totalBubbles = 0;
  pattern.forEach((row) => row.forEach((cell) => { if (cell === 1) totalBubbles++; }));

  const handlePop = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const isPopped = popped.has(key);
    
    // Toggle pop state (can pop back and forth like real silicone pop-it!)
    setPopped((prev) => {
      const next = new Set(prev);
      if (isPopped) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    setTotalPopCount((prev) => prev + 1);
    const pitch = 0.8 + ((r + c) * 0.08);
    audioEngine.playPop(pitch, soundEnabled);
    triggerHaptic(20, hapticEnabled);
  };

  const handleFlipReset = () => {
    setPopped(new Set());
    if (soundEnabled) playChime('complete');
    triggerHaptic(40, hapticEnabled);
  };

  const handlePopAll = () => {
    const all = new Set<string>();
    pattern.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) all.add(`${r}-${c}`);
      });
    });
    setPopped(all);
    if (soundEnabled) playChime('star');
    triggerHaptic(60, hapticEnabled);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Shape Selector & Stats */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'grid' as const, label: 'Grid', icon: Grid },
            { id: 'heart' as const, label: 'Heart', icon: Heart },
            { id: 'star' as const, label: 'Star', icon: Star },
            { id: 'honeycomb' as const, label: 'Hex', icon: Layers },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setShape(s.id); setPopped(new Set()); triggerHaptic(15, hapticEnabled); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  shape === s.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pops</p>
          <p className="text-sm font-black text-indigo-600">{popped.size} / {totalBubbles}</p>
        </div>
      </div>

      {/* Pop-It Silicone Tray */}
      <div className="p-4 rounded-3xl bg-slate-200/80 border-4 border-slate-300/80 shadow-inner flex flex-col items-center justify-center gap-2 max-w-full overflow-hidden">
        {pattern.map((row, r) => (
          <div key={r} className="flex gap-2">
            {row.map((cell, c) => {
              if (cell === 0) {
                return <div key={c} className="w-10 h-10 sm:w-11 sm:h-11" />;
              }
              const key = `${r}-${c}`;
              const isPopped = popped.has(key);
              const colorClass = ROW_COLORS[r % ROW_COLORS.length];

              return (
                <button
                  key={c}
                  onClick={() => handlePop(r, c)}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center border-2 ${
                    isPopped
                      ? 'bg-slate-300/90 border-slate-400 shadow-inner scale-90 opacity-70'
                      : `bg-gradient-to-b ${colorClass} shadow-md hover:scale-105 active:scale-95 active:shadow-none`
                  }`}
                  style={{
                    boxShadow: isPopped 
                      ? 'inset 0 3px 5px rgba(0,0,0,0.25)' 
                      : '0 4px 6px rgba(0,0,0,0.15), inset 0 2px 2px rgba(255,255,255,0.6)'
                  }}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-all ${
                    isPopped ? 'bg-slate-400/60 scale-75' : 'bg-white/40'
                  }`} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={handleFlipReset}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Flip & Reset</span>
        </button>
        <button
          onClick={handlePopAll}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pop All</span>
        </button>
      </div>
    </div>
  );
};

// ── TOY 2: Mechanical Keyboard Switches & Tactile Clickers ────────────────────
interface KeyboardToyProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const MechanicalClickerToy: React.FC<KeyboardToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [clickCount, setClickCount] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keys = [
    { id: 'blue-1', label: 'Blue Clicky', switchType: 'blue' as const, sub: 'Loud & Crisp 🔊', color: 'border-blue-400 bg-blue-50 text-blue-900', led: 'bg-blue-400' },
    { id: 'brown-1', label: 'Brown Tactile', switchType: 'brown' as const, sub: 'Soft Bump 🎧', color: 'border-amber-500 bg-amber-50 text-amber-900', led: 'bg-amber-400' },
    { id: 'red-1', label: 'Red Linear', switchType: 'red' as const, sub: 'Smooth Bounce ☁️', color: 'border-rose-400 bg-rose-50 text-rose-900', led: 'bg-rose-400' },
    { id: 'relay-1', label: 'Relay Clicker', switchType: 'relay' as const, sub: 'Industrial Snap ⚡', color: 'border-emerald-500 bg-emerald-50 text-emerald-900', led: 'bg-emerald-400' },
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
        <p className="text-xs font-bold text-slate-500">Press mechanical key switches</p>
        <p className="text-xs font-black text-indigo-600">{clickCount} clicks</p>
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
              <span className="font-black text-sm">{k.label}</span>
              <span className="text-[11px] font-medium opacity-75 mt-0.5">{k.sub}</span>
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
        <span>⌨️ Big Spacebar Clicker</span>
      </button>
    </div>
  );
};

// ── TOY 3: Realistic Physics Fidget Spinner ───────────────────────────────────
interface SpinnerToyProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const PhysicsFidgetSpinnerToy: React.FC<SpinnerToyProps> = ({ soundEnabled, hapticEnabled }) => {
  const [angle, setAngle] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [maxRpm, setMaxRpm] = useState(0);
  const [spinnerSkin, setSpinnerSkin] = useState<'rainbow' | 'bee' | 'midnight'>('bee');
  
  const velocityRef = useRef(0);
  const lastAngleRef = useRef(0);
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
            { id: 'bee' as const, label: 'Bee 🐝' },
            { id: 'rainbow' as const, label: 'Neon 🌈' },
            { id: 'midnight' as const, label: 'Galaxy 🌌' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { setSpinnerSkin(s.id); triggerHaptic(15, hapticEnabled); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                spinnerSkin === s.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</p>
          <p className="text-sm font-black text-amber-500">{rpm} RPM <span className="text-[10px] text-slate-400">(Max: {maxRpm})</span></p>
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
            <span className="text-base">{spinnerSkin === 'bee' ? '🐝' : '✨'}</span>
          </div>
        </div>
      </div>

      {/* Quick Flick Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          onClick={() => flickSpeed(-35)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          ↺ Flick Left
        </button>
        <button
          onClick={() => { velocityRef.current = 0; }}
          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
        >
          Stop
        </button>
        <button
          onClick={() => flickSpeed(35)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          Flick Right ↻
        </button>
      </div>
    </div>
  );
};

// ── TOY 4: Infinite Light Switch & Toggle Board ───────────────────────────────
interface ToggleBoardProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const ToggleSwitchBoardToy: React.FC<ToggleBoardProps> = ({ soundEnabled, hapticEnabled }) => {
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
        <p className="text-xs font-bold text-slate-500">Satisfying switches, latches & relays</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Zap className="w-3 h-3" /> Relay active
        </span>
      </div>

      <div className="w-full max-w-sm p-4 rounded-3xl bg-slate-800 border-4 border-slate-700 shadow-2xl flex flex-col gap-4 text-white">
        {/* Master Rocker Switch with Glow */}
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">Master Circuit</p>
            <p className="text-[10px] text-slate-400">Main illuminated rocker</p>
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
              {switches.mainPower ? 'ON' : 'OFF'}
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
                <span className="text-lg">{isOn ? '⬆️' : '⬇️'}</span>
              </button>
            );
          })}
        </div>

        {/* Smooth Stepless Slider */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-300">
            <span>Sensory Frequency Slider</span>
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

// ── TOY 5: Squishy Slime & Stress Ball ─────────────────────────────────────────
interface SlimeProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const SquishySlimeToy: React.FC<SlimeProps> = ({ soundEnabled, hapticEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchPosRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: 140, y: 110, isDown: false });
  const blobShapeRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }>({
    x: 140,
    y: 110,
    vx: 0,
    vy: 0,
    radius: 55,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const b = blobShapeRef.current;
      const t = touchPosRef.current;

      // Soft spring elasticity
      if (t.isDown) {
        b.vx += (t.x - b.x) * 0.15;
        b.vy += (t.y - b.y) * 0.15;
      } else {
        b.vx += (140 - b.x) * 0.08;
        b.vy += (110 - b.y) * 0.08;
      }
      b.vx *= 0.85;
      b.vy *= 0.85;
      b.x += b.vx;
      b.y += b.vy;

      // Draw Squishy Blob
      const grad = ctx.createRadialGradient(b.x - 12, b.y - 14, 8, b.x, b.y, b.radius);
      grad.addColorStop(0, '#f472b6');
      grad.addColorStop(0.5, '#c084fc');
      grad.addColorStop(1, '#818cf8');

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + (t.isDown ? 12 : 0), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(192, 132, 252, 0.4)';
      ctx.shadowBlur = 18;
      ctx.fill();

      // Specular shine
      ctx.beginPath();
      ctx.ellipse(b.x - 18, b.y - 18, 14, 7, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.shadowBlur = 0;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    touchPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isDown: true,
    };
    audioEngine.playPop(1.4, soundEnabled);
    triggerHaptic(25, hapticEnabled);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchPosRef.current.isDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    touchPosRef.current.x = e.clientX - rect.left;
    touchPosRef.current.y = e.clientY - rect.top;
  };

  const handlePointerUp = () => {
    touchPosRef.current.isDown = false;
    audioEngine.playPop(1.1, soundEnabled);
    triggerHaptic(30, hapticEnabled);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-xs font-bold text-slate-500">Touch, drag & squish the stress blob</p>
      <canvas
        ref={canvasRef}
        width={280}
        height={220}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="rounded-3xl bg-slate-900 border-4 border-slate-700 shadow-xl cursor-pointer touch-none"
      />
    </div>
  );
};

// ── TOY 6: Calming Starlight Particle Swirl ───────────────────────────────────
interface StarlightProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const CalmingStarlightToy: React.FC<StarlightProps> = ({ soundEnabled, hapticEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number }>>([]);
  const pointerRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: 140, y: 100, isDown: false });

  useEffect(() => {
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#4ade80'];
    particlesRef.current = Array.from({ length: 45 }, () => ({
      x: Math.random() * 280,
      y: Math.random() * 200,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 2,
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const p = pointerRef.current;

      particlesRef.current.forEach((pt) => {
        if (p.isDown) {
          const dx = p.x - pt.x;
          const dy = p.y - pt.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          pt.vx += (dx / dist) * 0.4;
          pt.vy += (dy / dist) * 0.4;
        }

        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.96;
        pt.vy *= 0.96;

        if (pt.x < 0) pt.x = canvas.width;
        if (pt.x > canvas.width) pt.x = 0;
        if (pt.y < 0) pt.y = canvas.height;
        if (pt.y > canvas.height) pt.y = 0;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isDown: true,
    };
    audioEngine.playSpinnerTick(soundEnabled);
    triggerHaptic(15, hapticEnabled);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.isDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
  };

  const handlePointerUp = () => {
    pointerRef.current.isDown = false;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-xs font-bold text-slate-500">Touch and guide calming cosmic starlight particles</p>
      <canvas
        ref={canvasRef}
        width={280}
        height={220}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl cursor-pointer touch-none"
      />
    </div>
  );
};

// ── TOY 7: Tactile Fidget Cube & Worry Stone ───────────────────────────────────
interface FidgetCubeProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const FidgetCubeWorryStoneToy: React.FC<FidgetCubeProps> = ({ soundEnabled, hapticEnabled }) => {
  const [rubCount, setRubCount] = useState(0);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);

  const handleRub = () => {
    setRubCount((p) => p + 1);
    audioEngine.playSpinnerTick(soundEnabled);
    triggerHaptic(15, hapticEnabled);
  };

  const handleButtonClick = (idx: number, isSilent: boolean) => {
    setActiveBtn(idx);
    if (!isSilent) {
      audioEngine.playSwitch('blue', soundEnabled);
      triggerHaptic(30, hapticEnabled);
    } else {
      triggerHaptic(15, hapticEnabled);
    }
    setTimeout(() => setActiveBtn(null), 100);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center justify-between w-full px-2">
        <p className="text-xs font-bold text-slate-500">Tactile pad & soothing worry stone</p>
        <span className="text-xs font-bold text-indigo-600">{rubCount} smooth strokes</span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {/* 5-Button Die Pad */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5-Click Die</p>
          <div className="grid grid-cols-3 gap-2 w-full p-2 bg-slate-200/60 rounded-xl">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isSilent = idx >= 3; // 2 silent, 3 clicky
              const isPressed = activeBtn === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleButtonClick(idx, isSilent)}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold ${
                    isPressed
                      ? 'scale-90 bg-indigo-600 border-indigo-700 text-white'
                      : isSilent
                      ? 'bg-slate-300 border-slate-400 text-slate-600'
                      : 'bg-white border-slate-300 text-slate-800 shadow-sm'
                  }`}
                >
                  {isSilent ? '🤫' : '🔊'}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500">3 clicky, 2 silent</span>
        </div>

        {/* Smooth Worry Stone Groove */}
        <div
          onPointerDown={handleRub}
          onPointerMove={(e) => { if (e.buttons === 1) handleRub(); }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 text-white flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all select-none touch-none"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Worry Stone</p>
          <div className="w-16 h-12 rounded-full bg-slate-800 border-2 border-slate-600 shadow-inner flex items-center justify-center">
            <div className="w-8 h-6 rounded-full bg-slate-700/60 shadow-inner" />
          </div>
          <span className="text-[10px] text-slate-300 mt-2">Rub thumb gently</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Modal Component ──────────────────────────────────────────────────────
type FidgetCategory = 'pop' | 'switches' | 'spinner' | 'toggles' | 'slime' | 'starlight' | 'cube';

export const DigitalFidgetModal: React.FC = () => {
  const { showFidgetModal, setShowFidgetModal, settings, updateSettings } = useApp();
  const [activeFidget, setActiveFidget] = useState<FidgetCategory>('pop');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  if (!showFidgetModal) return null;

  const categories = [
    { id: 'pop' as const, label: 'Pop-It', emoji: '🫧', desc: 'Silicone shapes' },
    { id: 'switches' as const, label: 'Clickers', emoji: '⌨️', desc: 'Key switches' },
    { id: 'spinner' as const, label: 'Spinner', emoji: '🌀', desc: 'Physics RPM' },
    { id: 'toggles' as const, label: 'Switches', emoji: '⚡', desc: 'Relays & sliders' },
    { id: 'slime' as const, label: 'Slime', emoji: '🟣', desc: 'Squishy stress ball' },
    { id: 'starlight' as const, label: 'Starlight', emoji: '🌌', desc: 'Calm galaxy flow' },
    { id: 'cube' as const, label: 'Worry Stone', emoji: '🪨', desc: 'Fidget cube pad' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/60 backdrop-blur-md overflow-y-auto p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Tappy-Style Sensory Hub</p>
            <h2 className="text-xl font-black text-slate-800">Tactile Fidget Toys 🧸</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled((p) => !p);
                if (navigator.vibrate) navigator.vibrate(20);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                soundEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Haptic Toggle */}
            <button
              onClick={() => {
                setHapticEnabled((p) => !p);
                if (!hapticEnabled && navigator.vibrate) navigator.vibrate(30);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                hapticEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
              }`}
              title={hapticEnabled ? 'Disable vibration' : 'Enable vibration'}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setShowFidgetModal(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sensory Category Selector Carousel */}
        <div className="flex gap-2 px-4 py-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveFidget(c.id);
                audioEngine.playSwitch('red', soundEnabled);
                triggerHaptic(15, hapticEnabled);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeFidget === c.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Active Fidget Playground */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center min-h-[320px]">
          {activeFidget === 'pop' && <PopItToy soundEnabled={soundEnabled} hapticEnabled={hapticEnabled} />}
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
