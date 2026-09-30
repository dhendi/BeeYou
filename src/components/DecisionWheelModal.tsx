import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { X, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { playChime } from '../utils/audio';
import { DecisionWheelOption } from '../types';

const SPIN_SOUNDS = ['🎉', '✨', '🎊', '🌟'];

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export const DecisionWheelModal: React.FC = () => {
  const {
    showDecisionWheelModal,
    setShowDecisionWheelModal,
    decisionWheelConfig,
    updateDecisionWheelConfig,
    speak,
  } = useApp();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<DecisionWheelOption | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const animRef = useRef<number | null>(null);
  const startAngleRef = useRef(0);
  const totalSpinRef = useRef(0);

  const options = decisionWheelConfig.options;
  const count = options.length;
  const cx = 130, cy = 130, r = 115;

  const spin = useCallback(() => {
    if (spinning || count < 2) return;
    setWinner(null);
    setSpinning(true);
    playChime('star');

    const extraSpins = 5 + Math.random() * 5; // 5-10 full spins
    const finalAngle = rotation + extraSpins * 360 + Math.random() * 360;
    totalSpinRef.current = finalAngle;
    startAngleRef.current = rotation;

    const duration = 3000 + Math.random() * 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startAngleRef.current + (totalSpinRef.current - startAngleRef.current) * eased;
      setRotation(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(totalSpinRef.current);
        setSpinning(false);

        // Determine winner
        const normalizedAngle = ((360 - (totalSpinRef.current % 360)) + 360 + 90) % 360;
        const slice = 360 / count;
        const winnerIdx = Math.floor(normalizedAngle / slice) % count;
        const winnerOption = options[winnerIdx];
        setWinner(winnerOption);
        speak(`The wheel chose: ${winnerOption.label}!`);
        playChime('complete');
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, [spinning, count, rotation, options, speak]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const addOption = () => {
    if (!newLabel.trim()) return;
    const colors = ['#818cf8', '#34d399', '#fb923c', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#6ee7b7'];
    const newOpt: DecisionWheelOption = {
      id: `opt-${Date.now()}`,
      label: newLabel.trim(),
      emoji: newEmoji,
      color: colors[options.length % colors.length],
    };
    updateDecisionWheelConfig({ options: [...options, newOpt] });
    setNewLabel('');
    setNewEmoji('⭐');
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    updateDecisionWheelConfig({ options: options.filter((o) => o.id !== id) });
  };

  if (!showDecisionWheelModal) return null;

  const sliceAngle = (2 * Math.PI) / count;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 bg-white border-b border-slate-100 z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choice Paralysis Helper</p>
          <h2 className="text-xl font-black text-slate-800">Decision Wheel 🎡</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              editMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={() => setShowDecisionWheelModal(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col items-center gap-5 max-w-md mx-auto w-full">
        {/* SVG Wheel */}
        <div className="relative">
          <svg
            width={260}
            height={260}
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'none' : 'transform 0.3s ease' }}
          >
            {options.map((opt, i) => {
              const startA = sliceAngle * i - Math.PI / 2;
              const endA = startA + sliceAngle;
              const mid = startA + sliceAngle / 2;
              const large = count === 1 ? 1 : 0;
              const p1 = polarToXY(cx, cy, r, startA);
              const p2 = polarToXY(cx, cy, r, endA);
              const textPos = polarToXY(cx, cy, r * 0.62, mid);

              return (
                <g key={opt.id}>
                  <path
                    d={count === 1
                      ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 -${r * 2} 0`
                      : `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`
                    }
                    fill={opt.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={count > 5 ? 14 : 16}
                    fill="white"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  >
                    {opt.emoji}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={20} fill="white" stroke="#e2e8f0" strokeWidth={3} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={16}>🎯</text>
          </svg>
          {/* Pointer arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
            <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '22px solid #ef4444' }} />
          </div>
        </div>

        {/* Winner reveal */}
        {winner && !spinning && (
          <div className="text-center px-5 py-4 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 w-full">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">The wheel chose!</p>
            <p className="text-4xl mb-1">{winner.emoji}</p>
            <h3 className="text-2xl font-black text-slate-800">{winner.label}</h3>
          </div>
        )}

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={spinning || count < 2}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl shadow-lg shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition-all"
        >
          {spinning ? '🌀 Spinning...' : '🎡 Spin the Wheel!'}
        </button>

        {/* Reset winner */}
        {winner && !spinning && (
          <button
            onClick={() => { setWinner(null); setRotation(0); }}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Spin again</span>
          </button>
        )}

        {/* Edit mode */}
        {editMode && (
          <div className="w-full space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Edit Options</p>
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xl">{opt.emoji}</span>
                <span className="flex-1 font-bold text-sm text-slate-700">{opt.label}</span>
                <button
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= 2}
                  className="text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-14 text-center border border-slate-300 rounded-xl px-2 py-2 text-lg"
                placeholder="🎯"
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add option..."
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium"
                onKeyDown={(e) => e.key === 'Enter' && addOption()}
              />
              <button
                onClick={addOption}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
