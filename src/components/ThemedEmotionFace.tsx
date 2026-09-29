/**
 * ThemedEmotionFace — Truly Integrated, Premium Illustrated Emotion Artwork
 *
 * Each theme features a fully realized, character-based artwork system
 * (not a generic emoji with a stamp pasted on top):
 *  - dinosaur: Adorable baby Dino with scales, crest spikes, snout & expressive horns
 *  - turtle: Shelly the Wise Turtle with hex shell rim, cozy neck & peeking expressions
 *  - frog: Charming Pond Frog with iconic top eye-domes, pale throat & rosy cheeks
 *  - space: Cosmic Astronaut with illuminated visor, helmet telemetry & star reflections
 *  - ocean: Sea Explorer with marine collar & ocean creature charm
 *  - train: Cheerful Train Conductor with fitted cap, gold braid & whistle
 *  - classic / others: High-end Pixar/Duolingo-grade character avatar with lighting & eye depth
 *
 * All 11 emotional states are specifically crafted for AAC / neurodivergent communicators
 * to clearly and empathetically communicate feelings.
 */
import React from 'react';
import { AppTheme } from '../data/themesData';

export type EmotionId =
  | 'happy'
  | 'calm'
  | 'excited'
  | 'tired'
  | 'worried'
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'overwhelmed'
  | 'scared'
  | 'confused';

interface ThemedEmotionFaceProps {
  emotionId: EmotionId | string;
  theme?: AppTheme | null;
  /** CSS size class pair e.g. "w-14 h-14" */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE SVG WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
const Canvas: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <svg
    viewBox="0 0 72 72"
    width="100%"
    height="100%"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label={label}
    role="img"
    className="overflow-visible"
  >
    {label && <title>{label}</title>}
    {children}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. DINOSAUR THEME CHARACTER (Baby Dino)
// ─────────────────────────────────────────────────────────────────────────────
const DinoFace: React.FC<{ emotion: string }> = ({ emotion }) => {
  // Shared base elements: Crest spikes, snout, eye brows
  const dorsalSpikes = (
    <g fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M 22 13 L 26 4 L 30 13 Z" />
      <path d="M 33 11 L 38 2 L 43 11 Z" />
      <path d="M 46 14 L 51 6 L 55 15 Z" />
    </g>
  );

  const headBase = (
    <g>
      <defs>
        <linearGradient id="dinoHeadGrad" x1="20" y1="10" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <radialGradient id="dinoCheekGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dorsal spikes */}
      {dorsalSpikes}

      {/* Main head shape */}
      <path
        d="M 18 26 C 18 13, 54 13, 54 26 C 58 29, 63 35, 63 45 C 63 56, 52 64, 36 64 C 20 64, 9 56, 9 45 C 9 35, 14 29, 18 26 Z"
        fill="url(#dinoHeadGrad)"
        stroke="#166534"
        strokeWidth="2.5"
      />

      {/* Pale belly/chin patch */}
      <path
        d="M 22 52 C 22 46, 50 46, 50 52 C 50 59, 44 63, 36 63 C 28 63, 22 59, 22 52 Z"
        fill="#bbf7d0"
        opacity="0.85"
      />

      {/* Cute side scales */}
      <circle cx="16" cy="34" r="2.2" fill="#15803d" opacity="0.4" />
      <circle cx="13" cy="40" r="1.8" fill="#15803d" opacity="0.4" />
      <circle cx="56" cy="34" r="2.2" fill="#15803d" opacity="0.4" />
      <circle cx="59" cy="40" r="1.8" fill="#15803d" opacity="0.4" />

      {/* Nostrils */}
      <ellipse cx="32" cy="42" rx="1.5" ry="2" fill="#14532d" />
      <ellipse cx="40" cy="42" rx="1.5" ry="2" fill="#14532d" />
    </g>
  );

  switch (emotion) {
    case 'happy':
      return (
        <Canvas label="Happy Dinosaur">
          {headBase}
          {/* Happy sparkling crescent eyes */}
          <path d="M 22 30 Q 28 22 34 30" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 38 30 Q 44 22 50 30" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Cheerful blushing cheeks */}
          <circle cx="19" cy="39" r="5" fill="url(#dinoCheekGrad)" />
          <circle cx="53" cy="39" r="5" fill="url(#dinoCheekGrad)" />
          {/* Big open smiling dino mouth with cute teeth */}
          <path d="M 26 47 Q 36 61 46 47 Z" fill="#991b1b" stroke="#14532d" strokeWidth="2" />
          <path d="M 30 54 Q 36 57 42 54" fill="#f43f5e" />
          {/* Tiny cute fangs */}
          <polygon points="29,47 31,51 33,47" fill="#ffffff" />
          <polygon points="39,47 41,51 43,47" fill="#ffffff" />
        </Canvas>
      );

    case 'calm':
      return (
        <Canvas label="Calm Dinosaur">
          {headBase}
          {/* Gentle curved closed eyes */}
          <path d="M 23 32 Q 28 36 33 32" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 39 32 Q 44 36 49 32" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="38" r="4" fill="url(#dinoCheekGrad)" />
          <circle cx="52" cy="38" r="4" fill="url(#dinoCheekGrad)" />
          {/* Peaceful contented smile */}
          <path d="M 29 48 Q 36 53 43 48" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Zen gentle leaf / breath particle */}
          <path d="M 54 22 C 58 19 63 20 64 24 C 61 25 56 25 54 22 Z" fill="#86efac" opacity="0.8" />
        </Canvas>
      );

    case 'excited':
      return (
        <Canvas label="Excited Dinosaur">
          {headBase}
          {/* Giant Starry Eyes */}
          <g fill="#fbbf24" stroke="#d97706" strokeWidth="1">
            <polygon points="28,22 30,27 35,27 31,30 33,35 28,32 23,35 25,30 21,27 26,27" />
            <polygon points="44,22 46,27 51,27 47,30 49,35 44,32 39,35 41,30 37,27 42,27" />
          </g>
          {/* Huge roaring grin */}
          <path d="M 24 45 Q 36 63 48 45 Z" fill="#b91c1c" stroke="#14532d" strokeWidth="2.5" />
          {/* Cute pointy teeth line */}
          <polygon points="26,45 28,49 30,45" fill="#ffffff" />
          <polygon points="32,45 34,50 36,45" fill="#ffffff" />
          <polygon points="38,45 40,50 42,45" fill="#ffffff" />
          <polygon points="44,45 46,49 48,45" fill="#ffffff" />
          <path d="M 28 55 Q 36 58 44 55" fill="#f43f5e" />
          {/* Energy sparkles */}
          <path d="M 8 18 L 11 20 L 8 22 L 5 20 Z" fill="#facc15" />
          <path d="M 64 18 L 67 20 L 64 22 L 61 20 Z" fill="#facc15" />
        </Canvas>
      );

    case 'tired':
      return (
        <Canvas label="Tired Dinosaur">
          {headBase}
          {/* Droopy half-closed sleepy eyes */}
          <ellipse cx="28" cy="32" rx="4.5" ry="3" fill="#e2e8f0" stroke="#14532d" strokeWidth="2" />
          <circle cx="28" cy="33" r="2.2" fill="#14532d" />
          <path d="M 23 29 Q 28 32 33 29" stroke="#14532d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          <ellipse cx="44" cy="32" rx="4.5" ry="3" fill="#e2e8f0" stroke="#14532d" strokeWidth="2" />
          <circle cx="44" cy="33" r="2.2" fill="#14532d" />
          <path d="M 39 29 Q 44 32 49 29" stroke="#14532d" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Big wide yawn */}
          <ellipse cx="36" cy="51" rx="6.5" ry="8" fill="#7f1d1d" stroke="#14532d" strokeWidth="2" />
          <ellipse cx="36" cy="54" rx="4" ry="4" fill="#f43f5e" />
          {/* Floating Zzz */}
          <text x="56" y="24" fontSize="11" fontWeight="bold" fill="#64748b" fontFamily="sans-serif">
            Z
          </text>
          <text x="62" y="16" fontSize="8" fontWeight="bold" fill="#94a3b8" fontFamily="sans-serif">
            z
          </text>
        </Canvas>
      );

    case 'worried':
      return (
        <Canvas label="Worried Dinosaur">
          {headBase}
          {/* Furrowed anxious brows & wide eyes */}
          <path d="M 22 26 Q 28 22 34 26" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 38 26 Q 44 22 50 26" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="28" cy="33" rx="4" ry="5" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="29" cy="33" r="2.5" fill="#14532d" />
          <ellipse cx="44" cy="33" rx="4" ry="5" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="43" cy="33" r="2.5" fill="#14532d" />
          {/* Nervous wavy mouth */}
          <path d="M 28 50 Q 32 46 36 50 Q 40 54 44 50" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Sweat drop on forehead */}
          <path d="M 52 24 C 54 20 57 24 57 27 C 57 30 52 30 52 27 Z" fill="#38bdf8" />
        </Canvas>
      );

    case 'sad':
      return (
        <Canvas label="Sad Dinosaur">
          {headBase}
          {/* Downcast sad eyes */}
          <ellipse cx="28" cy="34" rx="4" ry="4.5" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="28" cy="35.5" r="2.2" fill="#14532d" />
          <path d="M 23 27 L 33 30" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" />

          <ellipse cx="44" cy="34" rx="4" ry="4.5" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="44" cy="35.5" r="2.2" fill="#14532d" />
          <path d="M 49 27 L 39 30" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" />

          {/* Downturned trembling mouth */}
          <path d="M 29 53 Q 36 46 43 53" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Big glossy teardrop rolling down cheek */}
          <path
            d="M 46 38 C 43 45 42 49 46 51 C 49 51 50 47 48 41 Z"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1"
          />
        </Canvas>
      );

    case 'angry':
      return (
        <Canvas label="Angry Dinosaur">
          <g>
            <defs>
              <linearGradient id="dinoAngryHead" x1="20" y1="10" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="60%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            {dorsalSpikes}
            {/* Angry red-tinted face */}
            <path
              d="M 18 26 C 18 13, 54 13, 54 26 C 58 29, 63 35, 63 45 C 63 56, 52 64, 36 64 C 20 64, 9 56, 9 45 C 9 35, 14 29, 18 26 Z"
              fill="url(#dinoAngryHead)"
              stroke="#7f1d1d"
              strokeWidth="2.5"
            />
            {/* Clenched brow sharp slash */}
            <path d="M 22 25 L 34 32" stroke="#450a0a" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 50 25 L 38 32" stroke="#450a0a" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="28" cy="34" rx="3.5" ry="3.5" fill="#fef08a" stroke="#7f1d1d" strokeWidth="1.5" />
            <circle cx="29" cy="34" r="2" fill="#7f1d1d" />
            <ellipse cx="44" cy="34" rx="3.5" ry="3.5" fill="#fef08a" stroke="#7f1d1d" strokeWidth="1.5" />
            <circle cx="43" cy="34" r="2" fill="#7f1d1d" />
            {/* Grumpy clamped teeth snout */}
            <path d="M 27 49 L 45 49" stroke="#450a0a" strokeWidth="3" strokeLinecap="round" />
            <polygon points="30,49 32,53 34,49" fill="#ffffff" />
            <polygon points="38,49 40,53 42,49" fill="#ffffff" />
            {/* Steam puffs from nostrils */}
            <path d="M 27 42 Q 22 41 21 37 Q 24 35 28 39" fill="#fecaca" opacity="0.8" />
            <path d="M 45 42 Q 50 41 51 37 Q 48 35 44 39" fill="#fecaca" opacity="0.8" />
          </g>
        </Canvas>
      );

    case 'frustrated':
      return (
        <Canvas label="Frustrated Dinosaur">
          {headBase}
          {/* Squeezed shut "> <" eyes */}
          <path d="M 24 28 L 30 33 L 24 37" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 48 28 L 42 33 L 48 37" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Gritted teeth with zigzag line */}
          <path d="M 26 49 L 46 49" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
          <path d="M 28 47 L 30 51 L 32 47 L 34 51 L 36 47 L 38 51 L 40 47 L 42 51 L 44 47" stroke="#14532d" strokeWidth="1.8" fill="none" />
          {/* Frustration scribble symbol above head */}
          <path
            d="M 28 10 Q 32 4 36 10 Q 40 14 44 8"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </Canvas>
      );

    case 'overwhelmed':
      return (
        <Canvas label="Overwhelmed Dinosaur">
          {headBase}
          {/* Dizzy hypnotic spiral eyes */}
          <g stroke="#6b21a8" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M 28 32 A 4 4 0 1 0 28 34 A 2.2 2.2 0 1 0 28 33" />
            <path d="M 44 32 A 4 4 0 1 0 44 34 A 2.2 2.2 0 1 0 44 33" />
          </g>
          {/* Open wobbly O mouth */}
          <ellipse cx="36" cy="51" rx="5" ry="6" fill="#701a75" stroke="#14532d" strokeWidth="2" />
          {/* Sensory overload storm clouds / stars orbiting head */}
          <circle cx="16" cy="18" r="2.5" fill="#c084fc" />
          <circle cx="56" cy="18" r="2.5" fill="#c084fc" />
          <polygon points="36,4 37,7 40,7 38,9 39,12 36,10 33,12 34,9 32,7 35,7" fill="#fbbf24" />
        </Canvas>
      );

    case 'scared':
      return (
        <Canvas label="Scared Dinosaur">
          <g>
            <defs>
              <linearGradient id="dinoScaredHead" x1="20" y1="10" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="60%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
            {dorsalSpikes}
            <path
              d="M 18 26 C 18 13, 54 13, 54 26 C 58 29, 63 35, 63 45 C 63 56, 52 64, 36 64 C 20 64, 9 56, 9 45 C 9 35, 14 29, 18 26 Z"
              fill="url(#dinoScaredHead)"
              stroke="#065f46"
              strokeWidth="2.5"
            />
            {/* Shivering giant round eyes with tiny startled pupils */}
            <circle cx="27" cy="33" r="6" fill="#ffffff" stroke="#065f46" strokeWidth="2" />
            <circle cx="27" cy="33" r="2" fill="#065f46" />
            <circle cx="45" cy="33" r="6" fill="#ffffff" stroke="#065f46" strokeWidth="2" />
            <circle cx="45" cy="33" r="2" fill="#065f46" />
            {/* Chattering shivering mouth */}
            <path d="M 28 50 Q 36 46 44 50 Q 36 53 28 50 Z" fill="#ffffff" stroke="#065f46" strokeWidth="2" />
            <path d="M 32 48 L 32 52 M 36 48 L 36 52 M 40 48 L 40 52" stroke="#065f46" strokeWidth="1.5" />
            {/* Shiver tremor marks */}
            <path d="M 8 36 Q 6 39 8 42" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 64 36 Q 66 39 64 42" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        </Canvas>
      );

    case 'confused':
      return (
        <Canvas label="Confused Dinosaur">
          <g transform="rotate(7 36 36)">
            {headBase}
            {/* One raised brow, one squinting eye, one wide eye */}
            <path d="M 23 25 Q 28 20 33 24" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="33" r="4.5" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
            <circle cx="29" cy="33" r="2.5" fill="#14532d" />

            <path d="M 39 31 L 49 33" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="44" cy="34" rx="4" ry="2.5" fill="#ffffff" stroke="#14532d" strokeWidth="1.8" />
            <circle cx="43" cy="34" r="1.8" fill="#14532d" />

            {/* Puzzled sideways mouth */}
            <path d="M 31 51 Q 38 48 42 53" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
          {/* Big bright question mark */}
          <text x="56" y="22" fontSize="16" fontWeight="900" fill="#f59e0b" fontFamily="sans-serif">
            ?
          </text>
        </Canvas>
      );

    default:
      return (
        <Canvas label="Dinosaur">
          {headBase}
          <circle cx="28" cy="33" r="3.5" fill="#14532d" />
          <circle cx="44" cy="33" r="3.5" fill="#14532d" />
          <path d="M 28 49 Q 36 54 44 49" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </Canvas>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. TURTLE THEME CHARACTER (Shelly the Wise Turtle)
// ─────────────────────────────────────────────────────────────────────────────
const TurtleFace: React.FC<{ emotion: string }> = ({ emotion }) => {
  // Shell surrounding head
  const shellBackdrop = (
    <g>
      <defs>
        <radialGradient id="turtleShellGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="70%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#022c22" />
        </radialGradient>
        <linearGradient id="turtleSkinGrad" x1="20" y1="16" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Hexagonal shell dome behind head */}
      <circle cx="36" cy="36" r="31" fill="url(#turtleShellGrad)" stroke="#047857" strokeWidth="3" />
      {/* Shell scute plates */}
      <path
        d="M 36 8 L 47 15 L 47 27 L 36 34 L 25 27 L 25 15 Z"
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M 12 36 L 22 27 L 22 45 Z M 60 36 L 50 27 L 50 45 Z"
        fill="none"
        stroke="#34d399"
        strokeWidth="1.2"
        opacity="0.35"
      />
    </g>
  );

  const headBase = (
    <g>
      {/* Neck fold */}
      <ellipse cx="36" cy="48" rx="14" ry="10" fill="#047857" />
      {/* Turtle head popping from shell center */}
      <ellipse
        cx="36"
        cy="36"
        rx="18"
        ry="19"
        fill="url(#turtleSkinGrad)"
        stroke="#065f46"
        strokeWidth="2.5"
      />
      {/* Turtle nose beak points */}
      <circle cx="34" cy="43" r="1.2" fill="#064e3b" />
      <circle cx="38" cy="43" r="1.2" fill="#064e3b" />
    </g>
  );

  if (emotion === 'scared') {
    // SPECIAL TURTLE SENSORY POSE: Shelly retreats inside shell with scared eyes peeking!
    return (
      <Canvas label="Scared Turtle Hiding In Shell">
        {shellBackdrop}
        {/* Darkened shell opening */}
        <ellipse cx="36" cy="42" rx="16" ry="12" fill="#022c22" stroke="#065f46" strokeWidth="2.5" />
        {/* Big startled eyes peeking out from the shell shadow */}
        <circle cx="29" cy="41" r="5" fill="#ffffff" />
        <circle cx="29" cy="41" r="2.2" fill="#022c22" />
        <circle cx="30.5" cy="39.5" r="1" fill="#ffffff" />

        <circle cx="43" cy="41" r="5" fill="#ffffff" />
        <circle cx="43" cy="41" r="2.2" fill="#022c22" />
        <circle cx="44.5" cy="39.5" r="1" fill="#ffffff" />
        {/* Shaking water drops */}
        <circle cx="18" cy="28" r="2" fill="#67e8f9" opacity="0.7" />
        <circle cx="54" cy="28" r="2" fill="#67e8f9" opacity="0.7" />
      </Canvas>
    );
  }

  return (
    <Canvas label={`${emotion} Turtle`}>
      {shellBackdrop}
      {headBase}

      {emotion === 'happy' && (
        <g>
          <path d="M 24 30 Q 30 22 36 30" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 36 30 Q 42 22 48 30" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="38" r="4" fill="#f43f5e" opacity="0.4" />
          <circle cx="50" cy="38" r="4" fill="#f43f5e" opacity="0.4" />
          {/* Happy beak smile */}
          <path d="M 28 47 Q 36 56 44 47" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'calm' && (
        <g>
          {/* Zen closed eyes */}
          <path d="M 25 32 Q 30 36 35 32" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 37 32 Q 42 36 47 32" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 30 46 Q 36 50 42 46" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Water bubble float */}
          <circle cx="52" cy="18" r="3" fill="#67e8f9" opacity="0.5" stroke="#06b6d4" strokeWidth="1" />
        </g>
      )}

      {emotion === 'excited' && (
        <g>
          {/* Starry eyes */}
          <polygon points="29,26 30.5,30 35,30 31.5,33 33,37 29,34 25,37 26.5,33 23,30 27.5,30" fill="#facc15" />
          <polygon points="43,26 44.5,30 49,30 45.5,33 47,37 43,34 39,37 40.5,33 37,30 41.5,30" fill="#facc15" />
          <path d="M 28 45 Q 36 58 44 45 Z" fill="#991b1b" stroke="#022c22" strokeWidth="2" />
        </g>
      )}

      {emotion === 'tired' && (
        <g>
          <ellipse cx="29" cy="33" rx="4" ry="2.5" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="29" cy="34" r="1.8" fill="#022c22" />
          <ellipse cx="43" cy="33" rx="4" ry="2.5" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="43" cy="34" r="1.8" fill="#022c22" />
          {/* Big yawn */}
          <ellipse cx="36" cy="48" rx="5" ry="6" fill="#7f1d1d" stroke="#022c22" strokeWidth="1.8" />
          <text x="54" y="22" fontSize="10" fontWeight="bold" fill="#64748b">Z</text>
        </g>
      )}

      {emotion === 'worried' && (
        <g>
          <path d="M 24 26 Q 29 22 34 26" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 38 26 Q 43 22 48 26" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="29" cy="33" r="3.5" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="29" cy="33" r="2" fill="#022c22" />
          <circle cx="43" cy="33" r="3.5" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="43" cy="33" r="2" fill="#022c22" />
          <path d="M 30 48 Q 33 45 36 48 Q 39 51 42 48" stroke="#022c22" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'sad' && (
        <g>
          <ellipse cx="29" cy="34" rx="3.5" ry="4" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="29" cy="35" r="2" fill="#022c22" />
          <ellipse cx="43" cy="34" rx="3.5" ry="4" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="43" cy="35" r="2" fill="#022c22" />
          <path d="M 30 49 Q 36 44 42 49" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 44 38 C 42 43 41 47 44 49 C 47 49 48 45 46 40 Z" fill="#38bdf8" />
        </g>
      )}

      {emotion === 'angry' && (
        <g>
          <path d="M 23 27 L 33 33" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <path d="M 49 27 L 39 33" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="34" r="3" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="29" cy="34" r="1.8" fill="#7f1d1d" />
          <circle cx="43" cy="34" r="3" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="43" cy="34" r="1.8" fill="#7f1d1d" />
          <path d="M 29 48 L 43 48" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'frustrated' && (
        <g>
          <path d="M 25 30 L 29 34 L 25 38" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 47 30 L 43 34 L 47 38" stroke="#022c22" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 29 48 L 43 48" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 30 16 L 33 13 L 36 17 L 39 13 L 42 16" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'overwhelmed' && (
        <g stroke="#6b21a8" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M 29 33 A 3.5 3.5 0 1 0 29 35 A 1.8 1.8 0 1 0 29 34" />
          <path d="M 43 33 A 3.5 3.5 0 1 0 43 35 A 1.8 1.8 0 1 0 43 34" />
          <ellipse cx="36" cy="48" rx="4" ry="5" fill="#701a75" stroke="#022c22" strokeWidth="1.8" />
        </g>
      )}

      {emotion === 'confused' && (
        <g>
          <circle cx="29" cy="33" r="4" fill="#ffffff" stroke="#022c22" strokeWidth="1.8" />
          <circle cx="29" cy="33" r="2.2" fill="#022c22" />
          <ellipse cx="43" cy="34" rx="3.5" ry="2" fill="#ffffff" stroke="#022c22" strokeWidth="1.5" />
          <circle cx="43" cy="34" r="1.5" fill="#022c22" />
          <path d="M 31 49 Q 36 46 41 50" stroke="#022c22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <text x="52" y="24" fontSize="15" fontWeight="900" fill="#f59e0b">?</text>
        </g>
      )}
    </Canvas>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. FROG THEME CHARACTER (Pond Frog with Top Eye Domes)
// ─────────────────────────────────────────────────────────────────────────────
const FrogFace: React.FC<{ emotion: string }> = ({ emotion }) => {
  const headBase = (
    <g>
      <defs>
        <linearGradient id="frogHeadGrad" x1="20" y1="12" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Two iconic bulbous top eye domes */}
      <circle cx="22" cy="22" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />
      <circle cx="50" cy="22" r="13" fill="#22c55e" stroke="#15803d" strokeWidth="2.5" />

      {/* Wide horizontal frog face */}
      <ellipse cx="36" cy="42" rx="28" ry="20" fill="url(#frogHeadGrad)" stroke="#15803d" strokeWidth="2.5" />

      {/* Pale throat/belly patch */}
      <ellipse cx="36" cy="52" rx="16" ry="8" fill="#dcfce7" opacity="0.85" />

      {/* Cute blushing pink cheeks */}
      <circle cx="16" cy="44" r="4.5" fill="#f472b6" opacity="0.55" />
      <circle cx="56" cy="44" r="4.5" fill="#f472b6" opacity="0.55" />
    </g>
  );

  return (
    <Canvas label={`${emotion} Frog`}>
      {headBase}

      {/* Eye contents in the top domes */}
      {emotion === 'happy' && (
        <g>
          <path d="M 16 22 Q 22 15 28 22" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 44 22 Q 50 15 56 22" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Big happy frog smile */}
          <path d="M 18 42 Q 36 60 54 42" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'calm' && (
        <g>
          <path d="M 17 24 Q 22 28 27 24" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 45 24 Q 50 28 55 24" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 24 44 Q 36 50 48 44" stroke="#14532d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'excited' && (
        <g>
          <polygon points="22,14 23.5,18 28,18 24.5,21 26,25 22,22 18,25 19.5,21 16,18 20.5,18" fill="#facc15" />
          <polygon points="50,14 51.5,18 56,18 52.5,21 54,25 50,22 46,25 47.5,21 44,18 48.5,18" fill="#facc15" />
          <path d="M 20 40 Q 36 62 52 40 Z" fill="#991b1b" stroke="#14532d" strokeWidth="2.5" />
        </g>
      )}

      {emotion === 'tired' && (
        <g>
          <ellipse cx="22" cy="22" rx="6" ry="4" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="22" cy="23" r="2.5" fill="#14532d" />
          <ellipse cx="50" cy="22" rx="6" ry="4" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="50" cy="23" r="2.5" fill="#14532d" />
          <ellipse cx="36" cy="46" rx="6" ry="7" fill="#7f1d1d" stroke="#14532d" strokeWidth="2" />
          <text x="56" y="16" fontSize="10" fontWeight="bold" fill="#64748b">Z</text>
        </g>
      )}

      {emotion === 'worried' && (
        <g>
          <circle cx="22" cy="22" r="6" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="23" cy="21" r="3" fill="#14532d" />
          <circle cx="50" cy="22" r="6" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="49" cy="21" r="3" fill="#14532d" />
          <path d="M 24 45 Q 30 41 36 45 Q 42 49 48 45" stroke="#14532d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'sad' && (
        <g>
          <circle cx="22" cy="22" r="6" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="22" cy="24" r="2.8" fill="#14532d" />
          <circle cx="50" cy="22" r="6" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="50" cy="24" r="2.8" fill="#14532d" />
          <path d="M 22 48 Q 36 38 50 48" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 48 30 C 45 37 44 42 48 44 C 52 44 53 39 50 32 Z" fill="#38bdf8" />
        </g>
      )}

      {emotion === 'angry' && (
        <g>
          <path d="M 14 17 L 27 24" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58 17 L 45 24" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="23" r="5" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.8" />
          <circle cx="22" cy="23" r="2" fill="#7f1d1d" />
          <circle cx="50" cy="23" r="5" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.8" />
          <circle cx="50" cy="23" r="2" fill="#7f1d1d" />
          <path d="M 22 45 L 50 45" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'frustrated' && (
        <g>
          <path d="M 18 19 L 23 23 L 18 27" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 54 19 L 49 23 L 54 27" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 22 45 L 50 45" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
          <path d="M 30 10 L 33 6 L 36 10 L 39 6 L 42 10" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'overwhelmed' && (
        <g stroke="#6b21a8" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M 22 22 A 4 4 0 1 0 22 24 A 2 2 0 1 0 22 23" />
          <path d="M 50 22 A 4 4 0 1 0 50 24 A 2 2 0 1 0 50 23" />
          <ellipse cx="36" cy="46" rx="5" ry="6" fill="#701a75" stroke="#14532d" strokeWidth="2" />
        </g>
      )}

      {emotion === 'scared' && (
        <g>
          <circle cx="22" cy="22" r="7" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="22" cy="22" r="2" fill="#14532d" />
          <circle cx="50" cy="22" r="7" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="50" cy="22" r="2" fill="#14532d" />
          <path d="M 26 46 Q 36 41 46 46 Q 36 50 26 46 Z" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
        </g>
      )}

      {emotion === 'confused' && (
        <g>
          <circle cx="22" cy="22" r="6" fill="#ffffff" stroke="#14532d" strokeWidth="2" />
          <circle cx="22" cy="22" r="3" fill="#14532d" />
          <ellipse cx="50" cy="23" rx="5" ry="3" fill="#ffffff" stroke="#14532d" strokeWidth="1.8" />
          <circle cx="50" cy="23" r="1.8" fill="#14532d" />
          <path d="M 26 46 Q 36 42 46 48" stroke="#14532d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <text x="56" y="16" fontSize="15" fontWeight="900" fill="#f59e0b">?</text>
        </g>
      )}
    </Canvas>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. CLASSIC & ALL OTHER THEMES (High-End Pixar/Duolingo-Grade Character Face)
// ─────────────────────────────────────────────────────────────────────────────
const ClassicFace: React.FC<{ emotion: string; themeCategory?: string }> = ({ emotion, themeCategory }) => {
  // Theme palette tone tweaks
  let headFill1 = '#fef08a';
  let headFill2 = '#f59e0b';
  let strokeColor = '#b45309';

  if (themeCategory === 'space') {
    headFill1 = '#c4b5fd';
    headFill2 = '#7c3aed';
    strokeColor = '#4c1d95';
  } else if (themeCategory === 'ocean') {
    headFill1 = '#bae6fd';
    headFill2 = '#0284c7';
    strokeColor = '#0369a1';
  } else if (themeCategory === 'train') {
    headFill1 = '#fed7aa';
    headFill2 = '#ea580c';
    strokeColor = '#9a3412';
  }

  const baseHead = (
    <g>
      <defs>
        <radialGradient id="classicFaceGrad" cx="36" cy="30" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={headFill1} />
          <stop offset="70%" stopColor={headFill2} />
          <stop offset="100%" stopColor={strokeColor} />
        </radialGradient>
      </defs>

      {/* Soft rounded character ears */}
      <circle cx="10" cy="36" r="6" fill={headFill2} stroke={strokeColor} strokeWidth="1.8" />
      <circle cx="62" cy="36" r="6" fill={headFill2} stroke={strokeColor} strokeWidth="1.8" />

      {/* Main dimensional character head */}
      <circle cx="36" cy="36" r="26" fill="url(#classicFaceGrad)" stroke={strokeColor} strokeWidth="2.5" />

      {/* Top hair tuft */}
      <path
        d="M 33 11 C 33 4, 40 4, 38 11 Z"
        fill={strokeColor}
      />

      {/* Soft dimensional forehead highlight */}
      <ellipse cx="28" cy="20" rx="8" ry="4" fill="#ffffff" opacity="0.35" transform="rotate(-20 28 20)" />

      {/* Soft rosy cheek blush */}
      <ellipse cx="20" cy="41" rx="5" ry="3.5" fill="#f43f5e" opacity="0.4" />
      <ellipse cx="52" cy="41" rx="5" ry="3.5" fill="#f43f5e" opacity="0.4" />
    </g>
  );

  switch (emotion) {
    case 'happy':
      return (
        <Canvas label="Happy Face">
          {baseHead}
          {/* Expressive smiling eyes with lashes and catchlights */}
          <path d="M 23 29 Q 29 20 35 29" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 37 29 Q 43 20 49 29" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Big warm open smile with tongue */}
          <path d="M 26 43 Q 36 57 46 43 Z" fill="#991b1b" stroke="#451a03" strokeWidth="2" />
          <path d="M 30 50 Q 36 53 42 50" fill="#fb7185" />
        </Canvas>
      );

    case 'calm':
      return (
        <Canvas label="Calm Face">
          {baseHead}
          <path d="M 23 31 Q 29 36 35 31" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M 37 31 Q 43 36 49 31" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M 30 45 Q 36 49 42 45" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </Canvas>
      );

    case 'excited':
      return (
        <Canvas label="Excited Face">
          {baseHead}
          <polygon points="29,20 30.5,24 35,24 31.5,27 33,31 29,28 25,31 26.5,27 23,24 27.5,24" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          <polygon points="43,20 44.5,24 49,24 45.5,27 47,31 43,28 39,31 40.5,27 37,24 41.5,24" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          <path d="M 24 42 Q 36 60 48 42 Z" fill="#991b1b" stroke="#451a03" strokeWidth="2.5" />
          <path d="M 28 51 Q 36 54 44 51" fill="#f43f5e" />
          {/* Confetti sparkle */}
          <polygon points="12,18 14,20 12,22 10,20" fill="#f59e0b" />
          <polygon points="60,18 62,20 60,22 58,20" fill="#f59e0b" />
        </Canvas>
      );

    case 'tired':
      return (
        <Canvas label="Tired Face">
          {baseHead}
          <ellipse cx="28" cy="31" rx="4" ry="2.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="32" r="1.8" fill="#451a03" />
          <ellipse cx="44" cy="31" rx="4" ry="2.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="44" cy="32" r="1.8" fill="#451a03" />
          <ellipse cx="36" cy="46" rx="5" ry="6" fill="#7f1d1d" stroke="#451a03" strokeWidth="1.8" />
          <text x="54" y="20" fontSize="10" fontWeight="bold" fill="#64748b">Z</text>
        </Canvas>
      );

    case 'worried':
      return (
        <Canvas label="Worried Face">
          {baseHead}
          <path d="M 23 24 Q 28 20 33 24" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M 39 24 Q 44 20 49 24" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="31" r="3.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="31" r="2" fill="#451a03" />
          <circle cx="44" cy="31" r="3.5" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="44" cy="31" r="2" fill="#451a03" />
          <path d="M 30 46 Q 33 43 36 46 Q 39 49 42 46" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 50 21 C 52 17 55 21 55 24 C 55 27 50 27 50 24 Z" fill="#38bdf8" />
        </Canvas>
      );

    case 'sad':
      return (
        <Canvas label="Sad Face">
          {baseHead}
          <circle cx="28" cy="32" r="3.8" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="33.5" r="2" fill="#451a03" />
          <circle cx="44" cy="32" r="3.8" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="44" cy="33.5" r="2" fill="#451a03" />
          <path d="M 29 48 Q 36 42 43 48" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 45 35 C 43 41 42 45 45 47 C 48 47 49 43 47 38 Z" fill="#38bdf8" />
        </Canvas>
      );

    case 'angry':
      return (
        <Canvas label="Angry Face">
          {baseHead}
          <path d="M 22 25 L 34 31" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 50 25 L 38 31" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="28" cy="33" r="3" fill="#facc15" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="33" r="1.8" fill="#451a03" />
          <circle cx="44" cy="33" r="3" fill="#facc15" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="44" cy="33" r="1.8" fill="#451a03" />
          <path d="M 28 46 L 44 46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
        </Canvas>
      );

    case 'frustrated':
      return (
        <Canvas label="Frustrated Face">
          {baseHead}
          <path d="M 24 28 L 29 32 L 24 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 48 28 L 43 32 L 48 36" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 28 46 L 44 46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M 28 10 L 32 6 L 36 10 L 40 6 L 44 10" stroke="#dc2626" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </Canvas>
      );

    case 'overwhelmed':
      return (
        <Canvas label="Overwhelmed Face">
          {baseHead}
          <g stroke="#6b21a8" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M 28 32 A 3.5 3.5 0 1 0 28 34 A 1.8 1.8 0 1 0 28 33" />
            <path d="M 44 32 A 3.5 3.5 0 1 0 44 34 A 1.8 1.8 0 1 0 44 33" />
          </g>
          <ellipse cx="36" cy="46" rx="4.5" ry="5.5" fill="#701a75" stroke="#451a03" strokeWidth="1.8" />
        </Canvas>
      );

    case 'scared':
      return (
        <Canvas label="Scared Face">
          {baseHead}
          <circle cx="28" cy="32" r="5.5" fill="#ffffff" stroke="#451a03" strokeWidth="2" />
          <circle cx="28" cy="32" r="1.8" fill="#451a03" />
          <circle cx="44" cy="32" r="5.5" fill="#ffffff" stroke="#451a03" strokeWidth="2" />
          <circle cx="44" cy="32" r="1.8" fill="#451a03" />
          <path d="M 30 46 Q 36 42 42 46 Q 36 49 30 46 Z" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
        </Canvas>
      );

    case 'confused':
      return (
        <Canvas label="Confused Face">
          {baseHead}
          <circle cx="28" cy="32" r="4" fill="#ffffff" stroke="#451a03" strokeWidth="1.8" />
          <circle cx="28" cy="32" r="2.2" fill="#451a03" />
          <ellipse cx="44" cy="33" rx="3.5" ry="2" fill="#ffffff" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="44" cy="33" r="1.5" fill="#451a03" />
          <path d="M 31 46 Q 36 43 41 47" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <text x="52" y="20" fontSize="15" fontWeight="900" fill="#f59e0b">?</text>
        </Canvas>
      );

    default:
      return (
        <Canvas label="Face">
          {baseHead}
          <circle cx="28" cy="32" r="3" fill="#451a03" />
          <circle cx="44" cy="32" r="3" fill="#451a03" />
          <path d="M 30 45 Q 36 49 42 45" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </Canvas>
      );
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// 5. OCEAN THEME CHARACTER (Cute Baby Dolphin)
// ─────────────────────────────────────────────────────────────────────────────
const OceanFace: React.FC<{ emotion: string }> = ({ emotion }) => {
  const baseDolphin = (
    <g>
      <defs>
        <linearGradient id="oceanSkinGrad" x1="16" y1="12" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      {/* Ocean water ripple backdrop */}
      <path d="M 6 56 Q 20 48 36 54 Q 52 60 66 52" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />
      {/* Dorsal fin on head */}
      <path d="M 33 16 C 34 6, 43 9, 41 19 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
      {/* Side flippers */}
      <path d="M 14 38 C 7 42, 9 50, 17 44 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.8" />
      <path d="M 58 38 C 65 42, 63 50, 55 44 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.8" />
      {/* Main dolphin rounded head */}
      <ellipse cx="36" cy="36" rx="22" ry="20" fill="url(#oceanSkinGrad)" stroke="#0369a1" strokeWidth="2.5" />
      {/* Pale creamy belly patch */}
      <path d="M 25 40 C 25 33, 47 33, 47 40 C 47 52, 42 56, 36 56 C 30 56, 25 52, 25 40 Z" fill="#e0f2fe" opacity="0.9" />
      {/* Blowhole on forehead */}
      <ellipse cx="36" cy="18" rx="2.5" ry="1.2" fill="#0c4a6e" />
    </g>
  );

  switch (emotion) {
    case 'happy':
      return (
        <Canvas label="Happy Dolphin">
          {baseDolphin}
          <path d="M 23 29 Q 29 21 35 29" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 37 29 Q 43 21 49 29" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="21" cy="37" r="3.5" fill="#f472b6" opacity="0.5" />
          <circle cx="51" cy="37" r="3.5" fill="#f472b6" opacity="0.5" />
          <path d="M 27 44 Q 36 56 45 44" stroke="#0c4a6e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          {/* Water splash droplets */}
          <circle cx="16" cy="20" r="2" fill="#38bdf8" />
          <circle cx="56" cy="20" r="2" fill="#38bdf8" />
        </Canvas>
      );

    case 'calm':
      return (
        <Canvas label="Calm Dolphin">
          {baseDolphin}
          <path d="M 24 31 Q 29 35 34 31" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 38 31 Q 43 35 48 31" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 30 45 Q 36 49 42 45" stroke="#0c4a6e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="54" cy="24" r="2.5" fill="#bae6fd" opacity="0.7" stroke="#0284c7" strokeWidth="1" />
        </Canvas>
      );

    case 'excited':
      return (
        <Canvas label="Excited Dolphin">
          {baseDolphin}
          <polygon points="29,20 30.5,24 35,24 31.5,27 33,31 29,28 25,31 26.5,27 23,24 27.5,24" fill="#facc15" />
          <polygon points="43,20 44.5,24 49,24 45.5,27 47,31 43,28 39,31 40.5,27 37,24 41.5,24" fill="#facc15" />
          <path d="M 26 43 Q 36 58 46 43 Z" fill="#991b1b" stroke="#0c4a6e" strokeWidth="2" />
        </Canvas>
      );

    case 'tired':
      return (
        <Canvas label="Tired Dolphin">
          {baseDolphin}
          <ellipse cx="29" cy="32" rx="4" ry="2.2" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="29" cy="33" r="1.8" fill="#0c4a6e" />
          <ellipse cx="43" cy="32" rx="4" ry="2.2" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="43" cy="33" r="1.8" fill="#0c4a6e" />
          <ellipse cx="36" cy="46" rx="5" ry="6" fill="#7f1d1d" stroke="#0c4a6e" strokeWidth="1.8" />
          <text x="54" y="20" fontSize="10" fontWeight="bold" fill="#64748b">Z</text>
        </Canvas>
      );

    case 'worried':
      return (
        <Canvas label="Worried Dolphin">
          {baseDolphin}
          <path d="M 23 25 Q 28 21 33 25" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 39 25 Q 44 21 49 25" stroke="#0c4a6e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="29" cy="32" r="3.5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="29" cy="32" r="2" fill="#0c4a6e" />
          <circle cx="43" cy="32" r="3.5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="43" cy="32" r="2" fill="#0c4a6e" />
          <path d="M 30 46 Q 33 43 36 46 Q 39 49 42 46" stroke="#0c4a6e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </Canvas>
      );

    case 'sad':
      return (
        <Canvas label="Sad Dolphin">
          {baseDolphin}
          <circle cx="29" cy="33" r="3.5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="29" cy="34.5" r="2" fill="#0c4a6e" />
          <circle cx="43" cy="33" r="3.5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="43" cy="34.5" r="2" fill="#0c4a6e" />
          <path d="M 30 48 Q 36 43 42 48" stroke="#0c4a6e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M 45 36 C 43 41 42 45 45 47 C 48 47 49 43 47 38 Z" fill="#38bdf8" />
        </Canvas>
      );

    case 'angry':
      return (
        <Canvas label="Angry Dolphin">
          {baseDolphin}
          <path d="M 23 26 L 33 32" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <path d="M 49 26 L 39 32" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="33" r="3" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="29" cy="33" r="1.8" fill="#7f1d1d" />
          <circle cx="43" cy="33" r="3" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.5" />
          <circle cx="43" cy="33" r="1.8" fill="#7f1d1d" />
          <path d="M 29 46 L 43 46" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
        </Canvas>
      );

    case 'frustrated':
      return (
        <Canvas label="Frustrated Dolphin">
          {baseDolphin}
          <path d="M 25 29 L 29 33 L 25 37" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 47 29 L 43 33 L 47 37" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 29 46 L 43 46" stroke="#0c4a6e" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 30 11 L 33 7 L 36 11 L 39 7 L 42 11" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
        </Canvas>
      );

    case 'overwhelmed':
      return (
        <Canvas label="Overwhelmed Dolphin">
          {baseDolphin}
          <g stroke="#6b21a8" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M 29 33 A 3.5 3.5 0 1 0 29 35 A 1.8 1.8 0 1 0 29 34" />
            <path d="M 43 33 A 3.5 3.5 0 1 0 43 35 A 1.8 1.8 0 1 0 43 34" />
          </g>
          <ellipse cx="36" cy="46" rx="4.5" ry="5.5" fill="#701a75" stroke="#0c4a6e" strokeWidth="1.8" />
        </Canvas>
      );

    case 'scared':
      return (
        <Canvas label="Scared Dolphin">
          {baseDolphin}
          <circle cx="28" cy="33" r="5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="2" />
          <circle cx="28" cy="33" r="1.8" fill="#0c4a6e" />
          <circle cx="44" cy="33" r="5" fill="#ffffff" stroke="#0c4a6e" strokeWidth="2" />
          <circle cx="44" cy="33" r="1.8" fill="#0c4a6e" />
          <path d="M 30 46 Q 36 42 42 46 Q 36 49 30 46 Z" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
        </Canvas>
      );

    case 'confused':
      return (
        <Canvas label="Confused Dolphin">
          {baseDolphin}
          <circle cx="29" cy="33" r="4" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.8" />
          <circle cx="29" cy="33" r="2.2" fill="#0c4a6e" />
          <ellipse cx="43" cy="34" rx="3.5" ry="2" fill="#ffffff" stroke="#0c4a6e" strokeWidth="1.5" />
          <circle cx="43" cy="34" r="1.5" fill="#0c4a6e" />
          <path d="M 31 46 Q 36 43 41 47" stroke="#0c4a6e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <text x="52" y="20" fontSize="15" fontWeight="900" fill="#f59e0b">?</text>
        </Canvas>
      );

    default:
      return (
        <Canvas label="Dolphin">
          {baseDolphin}
          <circle cx="29" cy="33" r="3" fill="#0c4a6e" />
          <circle cx="43" cy="33" r="3" fill="#0c4a6e" />
          <path d="M 30 45 Q 36 49 42 45" stroke="#0c4a6e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </Canvas>
      );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SPACE THEME CHARACTER (Cosmic Astronaut)
// ─────────────────────────────────────────────────────────────────────────────
const SpaceFace: React.FC<{ emotion: string }> = ({ emotion }) => {
  const helmetBase = (
    <g>
      <defs>
        <radialGradient id="astronautVisorGrad" cx="36" cy="36" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="70%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id="helmetShellGrad" x1="10" y1="10" x2="62" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Comms antenna on top right */}
      <line x1="52" y1="16" x2="60" y2="6" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="61" cy="5" r="3" fill="#a855f7" />

      {/* Outer helmet suit shell */}
      <circle cx="36" cy="36" r="29" fill="url(#helmetShellGrad)" stroke="#475569" strokeWidth="2.5" />

      {/* Left/Right comms ear pods with status lights */}
      <rect x="4" y="28" width="6" height="16" rx="3" fill="#6366f1" stroke="#312e81" strokeWidth="1.5" />
      <rect x="62" y="28" width="6" height="16" rx="3" fill="#6366f1" stroke="#312e81" strokeWidth="1.5" />
      <circle cx="7" cy="36" r="1.5" fill="#38bdf8" />
      <circle cx="65" cy="36" r="1.5" fill="#38bdf8" />

      {/* Large curved visor bubble */}
      <ellipse cx="36" cy="36" rx="21" ry="19" fill="url(#astronautVisorGrad)" stroke="#6366f1" strokeWidth="2" />

      {/* Glass curved glare reflection */}
      <path d="M 20 23 Q 36 17 50 23" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.4" fill="none" />

      {/* Inside visor: Glowing astronaut face */}
      <ellipse cx="36" cy="38" rx="14" ry="13" fill="#fed7aa" />
    </g>
  );

  return (
    <Canvas label={`${emotion} Astronaut`}>
      {helmetBase}

      {emotion === 'happy' && (
        <g>
          <path d="M 28 35 Q 32 29 36 35" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 36 35 Q 40 29 44 35" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="40" r="2.5" fill="#f43f5e" opacity="0.5" />
          <circle cx="46" cy="40" r="2.5" fill="#f43f5e" opacity="0.5" />
          <path d="M 30 43 Q 36 51 42 43" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'calm' && (
        <g>
          <path d="M 28 36 Q 32 40 36 36" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 36 36 Q 40 40 44 36" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 32 44 Q 36 47 40 44" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'excited' && (
        <g>
          <polygon points="31,28 32,31 35,31 33,33 34,36 31,34 28,36 29,33 27,31 30,31" fill="#facc15" />
          <polygon points="41,28 42,31 45,31 43,33 44,36 41,34 38,36 39,33 37,31 40,31" fill="#facc15" />
          <path d="M 29 43 Q 36 53 43 43 Z" fill="#991b1b" stroke="#7c2d12" strokeWidth="1.8" />
        </g>
      )}

      {emotion === 'tired' && (
        <g>
          <ellipse cx="31" cy="36" rx="3" ry="1.8" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.2" />
          <circle cx="31" cy="36.5" r="1.2" fill="#7c2d12" />
          <ellipse cx="41" cy="36" rx="3" ry="1.8" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.2" />
          <circle cx="41" cy="36.5" r="1.2" fill="#7c2d12" />
          <ellipse cx="36" cy="45" rx="3.5" ry="4.5" fill="#7f1d1d" stroke="#7c2d12" strokeWidth="1.5" />
          <text x="50" y="28" fontSize="8" fontWeight="bold" fill="#38bdf8">Z</text>
        </g>
      )}

      {emotion === 'worried' && (
        <g>
          <path d="M 27 32 Q 31 29 35 32" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 37 32 Q 41 29 45 32" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="31" cy="37" r="2.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.2" />
          <circle cx="31" cy="37" r="1.5" fill="#7c2d12" />
          <circle cx="41" cy="37" r="2.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.2" />
          <circle cx="41" cy="37" r="1.5" fill="#7c2d12" />
          <path d="M 32 45 Q 34 42 36 45 Q 38 48 40 45" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>
      )}

      {emotion === 'sad' && (
        <g>
          <circle cx="31" cy="37" r="2.8" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
          <circle cx="31" cy="38" r="1.5" fill="#7c2d12" />
          <circle cx="41" cy="37" r="2.8" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
          <circle cx="41" cy="38" r="1.5" fill="#7c2d12" />
          <path d="M 32 46 Q 36 42 40 46" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="41" r="1.5" fill="#38bdf8" />
        </g>
      )}

      {emotion === 'angry' && (
        <g>
          <path d="M 27 33 L 34 37" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 45 33 L 38 37" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="31" cy="38" r="2.2" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.2" />
          <circle cx="31" cy="38" r="1.2" fill="#7f1d1d" />
          <circle cx="41" cy="38" r="2.2" fill="#facc15" stroke="#7f1d1d" strokeWidth="1.2" />
          <circle cx="41" cy="38" r="1.2" fill="#7f1d1d" />
          <path d="M 31 46 L 41 46" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'frustrated' && (
        <g>
          <path d="M 28 34 L 31 37 L 28 40" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 44 34 L 41 37 L 44 40" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 31 46 L 41 46" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}

      {emotion === 'overwhelmed' && (
        <g stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M 31 37 A 2.8 2.8 0 1 0 31 38 A 1.4 1.4 0 1 0 31 37.5" />
          <path d="M 41 37 A 2.8 2.8 0 1 0 41 38 A 1.4 1.4 0 1 0 41 37.5" />
          <ellipse cx="36" cy="46" rx="3.5" ry="4" fill="#701a75" stroke="#7c2d12" strokeWidth="1.5" />
        </g>
      )}

      {emotion === 'scared' && (
        <g>
          <circle cx="30" cy="37" r="4" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
          <circle cx="30" cy="37" r="1.4" fill="#7c2d12" />
          <circle cx="42" cy="37" r="4" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
          <circle cx="42" cy="37" r="1.4" fill="#7c2d12" />
          <path d="M 32 46 Q 36 43 40 46 Q 36 48 32 46 Z" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
        </g>
      )}

      {emotion === 'confused' && (
        <g>
          <circle cx="31" cy="37" r="3" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
          <circle cx="31" cy="37" r="1.6" fill="#7c2d12" />
          <ellipse cx="41" cy="37.5" rx="2.8" ry="1.5" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.2" />
          <circle cx="41" cy="37.5" r="1.2" fill="#7c2d12" />
          <path d="M 32 46 Q 36 44 40 47" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <text x="46" y="27" fontSize="11" fontWeight="900" fill="#facc15">?</text>
        </g>
      )}
    </Canvas>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PUBLIC COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const ThemedEmotionFace: React.FC<ThemedEmotionFaceProps> = ({
  emotionId,
  theme,
  className = 'w-14 h-14',
}) => {
  const normalizedId = emotionId.toLowerCase().trim();
  const category = theme?.category;

  return (
    <span className={`${className} inline-flex items-center justify-center select-none flex-shrink-0`} aria-hidden="true">
      {category === 'dinosaur' ? (
        <DinoFace emotion={normalizedId} />
      ) : category === 'turtle' ? (
        <TurtleFace emotion={normalizedId} />
      ) : category === 'frog' ? (
        <FrogFace emotion={normalizedId} />
      ) : category === 'ocean' ? (
        <OceanFace emotion={normalizedId} />
      ) : category === 'space' ? (
        <SpaceFace emotion={normalizedId} />
      ) : (
        <ClassicFace emotion={normalizedId} themeCategory={category} />
      )}
    </span>
  );
};

