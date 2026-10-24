import React, { useRef, useEffect } from 'react';
import { t } from '../../services/translator';
import { audioEngine, triggerHaptic, FidgetToyProps } from './FidgetAudioEngine';

export const SquishySlimeToy: React.FC<FidgetToyProps> = ({ soundEnabled, hapticEnabled }) => {
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
      const tPos = touchPosRef.current;

      // Soft spring elasticity
      if (tPos.isDown) {
        b.vx += (tPos.x - b.x) * 0.15;
        b.vy += (tPos.y - b.y) * 0.15;
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
      ctx.arc(b.x, b.y, b.radius + (tPos.isDown ? 12 : 0), 0, Math.PI * 2);
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
