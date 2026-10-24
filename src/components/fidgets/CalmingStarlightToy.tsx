import React, { useRef, useEffect } from 'react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const CalmingStarlightToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
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
