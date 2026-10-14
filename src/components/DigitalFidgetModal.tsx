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
  CircleDot,
  Keyboard,
  RotateCw,
  Waves,
  Box
} from 'lucide-react';
import { playChime } from '../utils/audio';
import { t } from '../services/translator';

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

  playPopIt(isPoppingIn = true, pitchModifier = 1.0, enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. High-frequency silicone dome snap transient (physical buckling click)
      const snapLen = 0.007;
      const snapBuf = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * snapLen)), this.ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapData.length; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapData.length * 0.22));
      }
      const snapSource = this.ctx.createBufferSource();
      snapSource.buffer = snapBuf;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime((isPoppingIn ? 2600 : 1900) * pitchModifier, now);
      snapFilter.Q.setValueAtTime(3.8, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(isPoppingIn ? 0.4 : 0.25, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapLen);

      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapSource.start(now);

      // 2. Resonant air cavity "plop/thock" (Helmholtz dome displacement)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      const startFreq = (isPoppingIn ? 440 : 340) * pitchModifier + (Math.random() * 20 - 10);
      const endFreq = (isPoppingIn ? 240 : 170) * pitchModifier;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.045);

      oscGain.gain.setValueAtTime(isPoppingIn ? 0.45 : 0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      const cavityFilter = this.ctx.createBiquadFilter();
      cavityFilter.type = 'lowpass';
      cavityFilter.frequency.setValueAtTime(1300 * pitchModifier, now);

      osc.connect(cavityFilter);
      cavityFilter.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);

      // 3. Tactile sub-bass thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime((isPoppingIn ? 130 : 105) * pitchModifier, now);
      subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

      subGain.gain.setValueAtTime(0.28, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.045);
    } catch (e) {}
  }

  playBubbleWrap(pitchModifier = 1.0, enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Explosive air burst rupture (transient noise burst)
      const burstLen = 0.024;
      const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * burstLen));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.16));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const burstSource = this.ctx.createBufferSource();
      burstSource.buffer = buffer;

      const burstFilter = this.ctx.createBiquadFilter();
      burstFilter.type = 'bandpass';
      burstFilter.frequency.setValueAtTime((4200 + Math.random() * 600) * pitchModifier, now);
      burstFilter.Q.setValueAtTime(2.5, now);

      const burstGain = this.ctx.createGain();
      burstGain.gain.setValueAtTime(0.55, now);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + burstLen);

      burstSource.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(this.ctx.destination);
      burstSource.start(now);

      // 2. Rapid acoustic air decompression pop
      const airOsc = this.ctx.createOscillator();
      const airGain = this.ctx.createGain();
      airOsc.type = 'triangle';
      const airFreq = (1200 + Math.random() * 200) * pitchModifier;
      airOsc.frequency.setValueAtTime(airFreq, now);
      airOsc.frequency.exponentialRampToValueAtTime(260 * pitchModifier, now + 0.016);

      airGain.gain.setValueAtTime(0.45, now);
      airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      airOsc.connect(airGain);
      airGain.connect(this.ctx.destination);
      airOsc.start(now);
      airOsc.stop(now + 0.022);

      // 3. Post-pop plastic crinkle micro-crackles (realistic plastic relaxation)
      const crinkleCount = 2 + Math.floor(Math.random() * 2);
      for (let c = 0; c < crinkleCount; c++) {
        const crinkleDelay = 0.007 + (c * 0.007) + (Math.random() * 0.004);
        const crinkleLen = 0.005;
        const cBuffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * crinkleLen)), this.ctx.sampleRate);
        const cData = cBuffer.getChannelData(0);
        for (let j = 0; j < cData.length; j++) {
          cData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (cData.length * 0.2));
        }
        const cSource = this.ctx.createBufferSource();
        cSource.buffer = cBuffer;

        const cFilter = this.ctx.createBiquadFilter();
        cFilter.type = 'highpass';
        cFilter.frequency.setValueAtTime(3400 + Math.random() * 800, now + crinkleDelay);

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0.18 + Math.random() * 0.08, now + crinkleDelay);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + crinkleDelay + crinkleLen);

        cSource.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(this.ctx.destination);
        cSource.start(now + crinkleDelay);
      }
    } catch (e) {}
  }

  playPlasticUnroll(enabled = true) {
    if (!enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const len = 0.14;
      const buf = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * len)), this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3600, now);
      filter.Q.setValueAtTime(1.8, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + len);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
    } catch (e) {}
  }

  playPop(pitchModifier = 1.0, enabled = true) {
    this.playPopIt(true, pitchModifier, enabled);
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
    const poppingIn = !isPopped;
    
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
    const pitch = 0.92 + ((r + c) * 0.03) + (Math.random() * 0.04 - 0.02);
    audioEngine.playPopIt(poppingIn, pitch, soundEnabled);
    triggerHaptic(poppingIn ? 24 : 16, hapticEnabled);
  };

  const handleFlipReset = () => {
    setPopped(new Set());
    audioEngine.playPopIt(false, 0.8, soundEnabled);
    triggerHaptic(35, hapticEnabled);
  };

  const handlePopAll = () => {
    const all = new Set<string>();
    const unpopped: { r: number; c: number }[] = [];
    pattern.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) {
          all.add(`${r}-${c}`);
          if (!popped.has(`${r}-${c}`)) unpopped.push({ r, c });
        }
      });
    });
    setPopped(all);
    setTotalPopCount((prev) => prev + unpopped.length);
    unpopped.forEach((item, idx) => {
      setTimeout(() => {
        audioEngine.playPopIt(true, 0.9 + ((item.r + item.c) * 0.03), soundEnabled);
        triggerHaptic(14, hapticEnabled);
      }, idx * 28);
    });
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
                <span>{t(s.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Pops')}</p>
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
          <span>{t('Flip & Reset')}</span>
        </button>
        <button
          onClick={handlePopAll}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Pop All')}</span>
        </button>
      </div>
    </div>
  );
};

// ── TOY: Bubble Wrap Packaging Sheet ──────────────────────────────────────────
type BubbleWrapSize = 'regular' | 'jumbo';

const BUBBLE_WRAP_CONFIG = {
  regular: { rows: 6, cols: 6, bubbleClass: 'w-10 h-10 sm:w-11 sm:h-11', pitchBase: 1.0 },
  jumbo: { rows: 4, cols: 4, bubbleClass: 'w-14 h-14 sm:w-16 sm:h-16', pitchBase: 0.78 },
};

interface BubbleWrapProps {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

const BubbleWrapToy: React.FC<BubbleWrapProps> = ({ soundEnabled, hapticEnabled }) => {
  const [sizeMode, setSizeMode] = useState<BubbleWrapSize>('regular');
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [totalSessionPops, setTotalSessionPops] = useState<number>(0);

  const cfg = BUBBLE_WRAP_CONFIG[sizeMode];
  const totalInSheet = cfg.rows * cfg.cols;

  const handlePop = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (popped.has(key)) {
      // Re-pop / crinkle sound if already popped
      audioEngine.playBubbleWrap(1.3, soundEnabled);
      triggerHaptic(15, hapticEnabled);
      return;
    }

    setPopped((prev) => new Set(prev).add(key));
    setTotalSessionPops((prev) => prev + 1);

    const pitchVar = cfg.pitchBase + ((r * cfg.cols + c) % 5) * 0.04 + (Math.random() * 0.08 - 0.04);
    audioEngine.playBubbleWrap(pitchVar, soundEnabled);
    triggerHaptic(sizeMode === 'jumbo' ? 38 : 24, hapticEnabled);
  };

  const handleFreshSheet = () => {
    setPopped(new Set());
    audioEngine.playPlasticUnroll(soundEnabled);
    triggerHaptic(30, hapticEnabled);
  };

  const handlePopAll = () => {
    const all = new Set<string>();
    const unpopped: { r: number; c: number }[] = [];
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const k = `${r}-${c}`;
        all.add(k);
        if (!popped.has(k)) unpopped.push({ r, c });
      }
    }
    setPopped(all);
    setTotalSessionPops((prev) => prev + unpopped.length);

    // Cascading rapid firecracker pops
    unpopped.forEach((item, idx) => {
      setTimeout(() => {
        const pitch = cfg.pitchBase + (Math.random() * 0.3 - 0.15);
        audioEngine.playBubbleWrap(pitch, soundEnabled);
        triggerHaptic(15, hapticEnabled);
      }, idx * 28);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Size Selector & Stats */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setSizeMode('regular'); setPopped(new Set()); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sizeMode === 'regular'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('Classic')}
          </button>
          <button
            type="button"
            onClick={() => { setSizeMode('jumbo'); setPopped(new Set()); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              sizeMode === 'jumbo'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('Jumbo')}
          </button>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Popped')}</p>
          <p className="text-sm font-black text-sky-600 dark:text-sky-400">
            {popped.size} / {totalInSheet}
            <span className="text-[11px] font-semibold text-slate-400 ml-1.5">({totalSessionPops} {t('total')})</span>
          </p>
        </div>
      </div>

      {/* Bubble Wrap Translucent Packaging Sheet */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-sky-50/80 dark:bg-sky-950/40 border-2 border-sky-200/90 dark:border-sky-800/80 shadow-inner flex flex-col items-center justify-center gap-2 max-w-full overflow-hidden backdrop-blur-xs select-none">
        {Array.from({ length: cfg.rows }, (_, r) => (
          <div key={r} className="flex gap-2">
            {Array.from({ length: cfg.cols }, (_, c) => {
              const key = `${r}-${c}`;
              const isPopped = popped.has(key);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handlePop(r, c)}
                  aria-label={`Bubble ${r + 1}, ${c + 1} ${isPopped ? 'Popped' : 'Unpopped'}`}
                  className={`${cfg.bubbleClass} rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center relative active:scale-90 ${
                    isPopped
                      ? 'bg-sky-900/10 dark:bg-slate-800/60 border border-dashed border-sky-300/60 shadow-inner scale-90 opacity-60'
                      : 'bg-gradient-to-br from-white/95 via-sky-100/80 to-sky-200/60 border border-white/90 ring-2 ring-sky-300/60 shadow-[0_4px_8px_rgba(56,189,248,0.25),inset_0_2px_3px_rgba(255,255,255,0.9)] hover:scale-105'
                  }`}
                >
                  {isPopped ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400/30 border border-sky-400/50" />
                  ) : (
                    <>
                      {/* Top-left specular highlight gleam */}
                      <div className="absolute top-1 left-1.5 w-3 h-1.5 rounded-full bg-white/95 rotate-[-30deg] pointer-events-none" />
                      {/* Inner air ring */}
                      <div className="w-4 h-4 rounded-full border border-sky-300/40 pointer-events-none" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <button
          type="button"
          onClick={handleFreshSheet}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Fresh Sheet')}</span>
        </button>
        <button
          type="button"
          onClick={handlePopAll}
          className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('Pop All')}</span>
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
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          ↺ {t('Flick Left')}
        </button>
        <button
          onClick={() => { velocityRef.current = 0; }}
          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
        >
          {t('Stop')}
        </button>
        <button
          onClick={() => flickSpeed(35)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          {t('Flick Right')} ↻
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
                <span className="text-lg">{isOn ? '⬆️' : '⬇️'}</span>
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
      <p className="text-xs font-bold text-slate-500">{t('Touch, drag & squish the stress blob')}</p>
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
      <p className="text-xs font-bold text-slate-500">{t('Touch and guide calming cosmic starlight particles')}</p>
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
        <p className="text-xs font-bold text-slate-500">{t('Tactile pad & soothing worry stone')}</p>
        <span className="text-xs font-bold text-indigo-600">{rubCount} {t('smooth strokes')}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {/* 5-Button Die Pad */}
        <div className="p-3.5 rounded-2xl bg-slate-100 border-2 border-slate-200 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('5-Click Die')}</p>
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
                  {/* Click button */}
                  <span className={`w-2 h-2 rounded-full ${isSilent ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500">{t('3 clicky, 2 silent')}</span>
        </div>

        {/* Smooth Worry Stone Groove */}
        <div
          onPointerDown={handleRub}
          onPointerMove={(e) => { if (e.buttons === 1) handleRub(); }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 text-white flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all select-none touch-none"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('Worry Stone')}</p>
          <div className="w-16 h-12 rounded-full bg-slate-800 border-2 border-slate-600 shadow-inner flex items-center justify-center">
            <div className="w-8 h-6 rounded-full bg-slate-700/60 shadow-inner" />
          </div>
          <span className="text-[10px] text-slate-300 mt-2">{t('Rub thumb gently')}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Modal Component ──────────────────────────────────────────────────────
type FidgetCategory = 'pop' | 'bubblewrap' | 'switches' | 'spinner' | 'toggles' | 'slime' | 'starlight' | 'cube';

export const DigitalFidgetModal: React.FC = () => {
  const { showFidgetModal, setShowFidgetModal, settings, updateSettings } = useApp();
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
    { id: 'starlight' as const, label: 'Starlight', icon: Sparkles, desc: 'Calm galaxy flow' },
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
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t('Tappy-Style Sensory Hub')}</p>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{t('Tactile Fidget Toys')}</h2>
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
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
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
