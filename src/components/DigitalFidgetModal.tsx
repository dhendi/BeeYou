import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';
import { playChime } from '../utils/audio';

// ── Bubble Pop ──────────────────────────────────────────────────────────────
const ROWS = 6;
const COLS = 6;

const BubblePop: React.FC = () => {
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [popAnimating, setPopAnimating] = useState<Set<string>>(new Set());

  const handlePop = (key: string) => {
    if (popped.has(key)) return;
    playChime('tap');
    setPopAnimating((p) => new Set([...p, key]));
    setTimeout(() => {
      setPopped((p) => new Set([...p, key]));
      setPopAnimating((p) => { const s = new Set(p); s.delete(key); return s; });
    }, 200);
    // Haptic
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const allPopped = popped.size === ROWS * COLS;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-bold text-slate-500">{popped.size}/{ROWS * COLS} bubbles popped</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const key = `b-${i}`;
          const isPop = popped.has(key);
          const isAnim = popAnimating.has(key);
          return (
            <button
              key={key}
              onClick={() => handlePop(key)}
              className={`w-11 h-11 rounded-full transition-all cursor-pointer border-2 ${
                isAnim ? 'scale-50 opacity-30' : isPop ? 'bg-slate-100 border-dashed border-slate-300 scale-90 opacity-50' : 'bg-indigo-200 border-indigo-300 hover:bg-indigo-300 hover:scale-105 active:scale-95 shadow-sm'
              }`}
            />
          );
        })}
      </div>
      {allPopped && (
        <button
          onClick={() => { setPopped(new Set()); setPopAnimating(new Set()); playChime('complete'); }}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer hover:bg-indigo-700"
        >
          🎉 All done! Pop again?
        </button>
      )}
    </div>
  );
};

// ── Water Ripple / Sand Garden ───────────────────────────────────────────────
const WaterRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; alpha: number }>>([]);
  const animRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sand background
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    grad.addColorStop(0, '#fde68a');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ripples
    ripplesRef.current = ripplesRef.current
      .map((rip) => ({ ...rip, r: rip.r + 2, alpha: rip.alpha - 0.015 }))
      .filter((rip) => rip.alpha > 0);

    ripplesRef.current.forEach((rip) => {
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${rip.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    ripplesRef.current.push({ x: clientX - rect.left, y: clientY - rect.top, r: 4, alpha: 0.8 });
    if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold text-slate-500">Touch the sand to create calming ripples</p>
      <canvas
        ref={canvasRef}
        width={280}
        height={200}
        className="rounded-3xl cursor-pointer shadow-md"
        onMouseDown={handleTouch}
        onMouseMove={(e) => { if (e.buttons === 1) handleTouch(e); }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
      />
    </div>
  );
};

// ── Marble Maze (simplified tilt + touch) ────────────────────────────────────
const MarbleMaze: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marbleRef = useRef({ x: 140, y: 140, vx: 0, vy: 0 });
  const animRef = useRef<number | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      tiltRef.current = { x: (e.gamma || 0) / 45, y: (e.beta || 0) / 45 };
    };
    window.addEventListener('deviceorientation', handleOrientation);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      // Physics
      const m = marbleRef.current;
      m.vx += tiltRef.current.x * 0.3;
      m.vy += tiltRef.current.y * 0.3;
      m.vx *= 0.96;
      m.vy *= 0.96;
      m.x = Math.max(14, Math.min(W - 14, m.x + m.vx));
      m.y = Math.max(14, Math.min(H - 14, m.y + m.vy));

      // Marble
      const g = ctx.createRadialGradient(m.x - 4, m.y - 4, 2, m.x, m.y, 14);
      g.addColorStop(0, '#a78bfa');
      g.addColorStop(1, '#6d28d9');
      ctx.beginPath();
      ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = (e.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
    const relY = (e.clientY - rect.top - canvas.height / 2) / (canvas.height / 2);
    tiltRef.current = { x: relX * 2, y: relY * 2 };
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold text-slate-500">
        {window.DeviceOrientationEvent ? 'Tilt your device or move the mouse' : 'Move your mouse to roll the marble'}
      </p>
      <canvas
        ref={canvasRef}
        width={280}
        height={200}
        className="rounded-3xl shadow-md cursor-none border-2 border-slate-200"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { tiltRef.current = { x: 0, y: 0 }; }}
      />
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export const DigitalFidgetModal: React.FC = () => {
  const { showFidgetModal, setShowFidgetModal } = useApp();
  const [activeFidget, setActiveFidget] = useState<'bubbles' | 'sand' | 'marble'>('bubbles');

  if (!showFidgetModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sensory Fidget Corner</p>
          <h2 className="text-xl font-black text-slate-800">Digital Fidget Toys 🧸</h2>
        </div>
        <button
          onClick={() => setShowFidgetModal(false)}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="flex-1 px-4 py-5 max-w-md mx-auto w-full flex flex-col gap-5">
        {/* Fidget Picker */}
        <div className="flex gap-2">
          {[
            { id: 'bubbles' as const, label: 'Bubble Pop', emoji: '🫧' },
            { id: 'sand' as const, label: 'Sand Garden', emoji: '🏖️' },
            { id: 'marble' as const, label: 'Marble Roll', emoji: '🔮' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setActiveFidget(f.id); playChime('tap'); }}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 text-xs font-bold cursor-pointer transition-all ${
                activeFidget === f.id
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xl">{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Active fidget */}
        <div className="flex-1 flex items-start justify-center pt-2">
          {activeFidget === 'bubbles' && <BubblePop />}
          {activeFidget === 'sand' && <WaterRipple />}
          {activeFidget === 'marble' && <MarbleMaze />}
        </div>
      </div>
    </div>
  );
};
