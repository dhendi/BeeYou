import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { playChime } from '../utils/audio';

/**
 * Companion pet. Grows as the child earns stars (lifetime total, so spending
 * stars never shrinks it). There is deliberately no health, hunger, sickness
 * or loss: the pet only ever grows and cheers the child on.
 */

const SPECIES: { id: string; label: string; stages: [string, string, string] }[] = [
  { id: 'dragon', label: 'Dragon', stages: ['🥚', '🐲', '🐉'] },
  { id: 'cat', label: 'Cat', stages: ['🥚', '🐱', '🐈'] },
  { id: 'dog', label: 'Dog', stages: ['🥚', '🐶', '🐕'] },
  { id: 'bunny', label: 'Bunny', stages: ['🥚', '🐰', '🐇'] },
  { id: 'bird', label: 'Bird', stages: ['🥚', '🐣', '🦜'] },
];

/** Stars needed to reach each level (level 1 starts at 0). */
const STARS_PER_LEVEL = 10;
const MAX_LEVEL = 30;

const CHEERS = [
  'You are doing great!',
  'I am proud of you!',
  'We make a great team!',
  'Every star counts!',
  'Take your time. I am here!',
];

function stageFor(level: number): 0 | 1 | 2 {
  if (level < 2) return 0;
  if (level < 6) return 1;
  return 2;
}

export const CompanionPet: React.FC = () => {
  const { worldState, updateCompanion, speak } = useApp();
  const [picking, setPicking] = useState(false);
  const [cheer, setCheer] = useState<string | null>(null);

  const lifetime = worldState.lifetimeStars ?? worldState.stars;
  const level = Math.min(MAX_LEVEL, Math.floor(lifetime / STARS_PER_LEVEL) + 1);
  const intoLevel = level >= MAX_LEVEL ? STARS_PER_LEVEL : lifetime % STARS_PER_LEVEL;
  const species = SPECIES.find((s) => s.id === worldState.petSpecies);
  const name = worldState.petName?.trim() || 'Buddy';

  if (!species || picking) {
    return (
      <section className="bg-white border-2 border-amber-300 rounded-3xl p-4 shadow-sm" aria-label="Choose a companion">
        <h2 className="font-black text-xl text-slate-900">🥚 Choose your companion</h2>
        <p className="text-sm text-slate-700 mb-3">Your pet grows as you earn stars. It never gets sick or sad.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SPECIES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                updateCompanion({ petSpecies: s.id });
                setPicking(false);
                playChime('star');
              }}
              className="min-h-[88px] rounded-2xl border-2 border-amber-300 bg-amber-50 font-black text-slate-900 active:scale-95"
            >
              <span className="text-4xl block" aria-hidden="true">{s.stages[2]}</span>
              {s.label}
            </button>
          ))}
        </div>
        {species && (
          <button onClick={() => setPicking(false)} className="mt-3 min-h-[44px] px-4 rounded-xl bg-slate-100 font-bold">
            Keep {species.label}
          </button>
        )}
      </section>
    );
  }

  const stage = stageFor(level);
  const pct = Math.round((intoLevel / STARS_PER_LEVEL) * 100);

  return (
    <section className="bg-gradient-to-br from-amber-50 to-sky-50 border-2 border-amber-300 rounded-3xl p-4 shadow-sm" aria-label="Your companion">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            const msg = CHEERS[Math.floor(Math.random() * CHEERS.length)];
            setCheer(msg);
            playChime('star');
            speak(`${name} says: ${msg}`);
            window.setTimeout(() => setCheer(null), 3500);
          }}
          className="text-7xl leading-none w-24 h-24 shrink-0 rounded-full bg-white border-4 border-amber-300 active:scale-95 transition"
          aria-label={`Tap ${name} to hear a cheer`}
        >
          {species.stages[stage]}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-black text-xl text-slate-900 truncate">{name}</h2>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-sm">Level {level}</span>
          </div>
          <div
            className="h-4 rounded-full bg-white border border-amber-300 overflow-hidden mt-2"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress to next level"
          >
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-700 mt-1 font-semibold">
            {level >= MAX_LEVEL
              ? 'Max level! Amazing!'
              : `${STARS_PER_LEVEL - intoLevel} more ⭐ to level ${level + 1}`}
          </p>
        </div>
      </div>
      {cheer && <p className="mt-3 text-center font-black text-amber-900" role="status">💬 {cheer}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            const next = window.prompt('Name your companion', worldState.petName || '');
            if (next !== null) updateCompanion({ petName: next.trim().slice(0, 20) });
          }}
          className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-slate-300 font-bold text-sm"
        >
          ✏️ Rename
        </button>
        <button
          onClick={() => setPicking(true)}
          className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-slate-300 font-bold text-sm"
        >
          🔄 Change pet
        </button>
      </div>
    </section>
  );
};
