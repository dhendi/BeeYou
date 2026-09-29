import React, { useState } from 'react';
import { playEntitySound } from '../utils/audio';

export interface AnimatedWorldItemProps {
  itemId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onInteract?: (itemId: string) => void;
  reduceMotion?: boolean;
  className?: string;
  showFloorShadow?: boolean;
}

export const AnimatedWorldItem: React.FC<AnimatedWorldItemProps> = ({
  itemId,
  size = 'md',
  interactive = true,
  onInteract,
  reduceMotion = false,
  className = '',
  showFloorShadow = false,
}) => {
  const [isReacting, setIsReacting] = useState(false);
  const [particles, setParticles] = useState<{ id: number; symbol: string; x: number; y: number }[]>([]);

  const sizeDimensions = {
    sm: { width: 56, height: 56, wrapper: 'w-14 h-14' },
    md: { width: 84, height: 84, wrapper: 'w-21 h-21' },
    lg: { width: 130, height: 130, wrapper: 'w-32 h-32 sm:w-36 sm:h-36' },
    xl: { width: 180, height: 180, wrapper: 'w-44 h-44 sm:w-48 sm:h-48' },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();

    setIsReacting(true);
    playEntitySound(itemId);

    // Particle burst based on item type
    let symbol = '✨';
    if (itemId.includes('puppy')) symbol = '❤️';
    else if (itemId.includes('kitten')) symbol = '🎵';
    else if (itemId.includes('bunny')) symbol = '🥕';
    else if (itemId.includes('turtle')) symbol = '🌿';
    else if (itemId.includes('train')) symbol = '💨';
    else if (itemId.includes('aquarium')) symbol = '🫧';
    else if (itemId.includes('beanbag')) symbol = '💤';
    else if (itemId.includes('plant')) symbol = '🌻';
    else if (itemId.includes('trampoline')) symbol = '⭐';

    const newParticles = [
      { id: Date.now() + 1, symbol, x: -14, y: -25 },
      { id: Date.now() + 2, symbol, x: 0, y: -38 },
      { id: Date.now() + 3, symbol, x: 16, y: -28 },
    ];
    setParticles(newParticles);

    if (onInteract) {
      onInteract(itemId);
    }

    setTimeout(() => {
      setIsReacting(false);
    }, 800);

    setTimeout(() => {
      setParticles([]);
    }, 1200);
  };

  // Render SVG Character / Entity
  const renderEntitySvg = () => {
    switch (itemId) {
      case 'wi-puppy':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes puppyTail {
                0%, 100% { transform: rotate(-18deg); }
                50% { transform: rotate(24deg); }
              }
              @keyframes puppyTailFast {
                0%, 100% { transform: rotate(-35deg); }
                50% { transform: rotate(35deg); }
              }
              @keyframes puppyEarLeft {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-6deg); }
              }
              @keyframes puppyEarRight {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(6deg); }
              }
              @keyframes puppyBlink {
                0%, 94%, 98%, 100% { transform: scaleY(1); }
                96% { transform: scaleY(0.1); }
              }
              @keyframes puppyPant {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.3); }
              }
              @keyframes puppyBreathe {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
              }
            `}</style>
            <g
              style={{
                animation: reduceMotion
                  ? 'none'
                  : isReacting
                  ? 'puppyBreathe 0.4s ease-in-out infinite'
                  : 'puppyBreathe 2s ease-in-out infinite',
              }}
            >
              {/* Wagging Tail */}
              <g
                style={{
                  transformOrigin: '28px 78px',
                  animation: reduceMotion
                    ? 'none'
                    : isReacting
                    ? 'puppyTailFast 0.15s ease-in-out infinite'
                    : 'puppyTail 0.8s ease-in-out infinite',
                }}
              >
                <path
                  d="M 28 78 Q 12 65 16 48 Q 24 55 28 78 Z"
                  fill="#b45309"
                  stroke="#78350f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="48" r="4.5" fill="#fde68a" />
              </g>

              {/* Puppy Body */}
              <ellipse cx="60" cy="80" rx="34" ry="26" fill="#d97706" stroke="#78350f" strokeWidth="3" />
              {/* Cream tummy patch */}
              <ellipse cx="60" cy="82" rx="20" ry="16" fill="#fef3c7" />

              {/* Paws */}
              <ellipse cx="40" cy="100" rx="9" ry="7" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" />
              <ellipse cx="80" cy="100" rx="9" ry="7" fill="#fef3c7" stroke="#78350f" strokeWidth="2.5" />
              <line x1="37" y1="102" x2="37" y2="105" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <line x1="43" y1="102" x2="43" y2="105" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <line x1="77" y1="102" x2="77" y2="105" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <line x1="83" y1="102" x2="83" y2="105" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

              {/* Collar & Golden Tag */}
              <path d="M 42 62 Q 60 70 78 62" stroke="#ef4444" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <circle cx="60" cy="68" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />

              {/* Puppy Head */}
              <circle cx="60" cy="44" r="26" fill="#d97706" stroke="#78350f" strokeWidth="3" />
              {/* Eye patch over left eye */}
              <ellipse cx="48" cy="40" rx="11" ry="13" fill="#b45309" transform="rotate(-6 48 40)" />

              {/* Left Floppy Ear */}
              <g
                style={{
                  transformOrigin: '38px 26px',
                  animation: reduceMotion ? 'none' : 'puppyEarLeft 1.8s ease-in-out infinite',
                }}
              >
                <path
                  d="M 38 26 C 20 28 14 48 24 64 C 30 68 38 52 38 26 Z"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="2.5"
                />
              </g>

              {/* Right Floppy Ear */}
              <g
                style={{
                  transformOrigin: '82px 26px',
                  animation: reduceMotion ? 'none' : 'puppyEarRight 1.8s ease-in-out infinite',
                }}
              >
                <path
                  d="M 82 26 C 100 28 106 48 96 64 C 90 68 82 52 82 26 Z"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="2.5"
                />
              </g>

              {/* Cream Muzzle */}
              <ellipse cx="60" cy="50" rx="14" ry="11" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />

              {/* Cute Nose */}
              <path d="M 55 44 Q 60 42 65 44 Q 60 51 55 44 Z" fill="#1e293b" />
              <circle cx="58" cy="44" r="1.2" fill="#ffffff" />

              {/* Panting Pink Tongue */}
              <path
                d="M 57 54 C 57 60 63 60 63 54 Z"
                fill="#f43f5e"
                stroke="#e11d48"
                strokeWidth="1.2"
                style={{
                  transformOrigin: '60px 54px',
                  animation: reduceMotion ? 'none' : 'puppyPant 0.7s ease-in-out infinite',
                }}
              />

              {/* Blinking Eyes */}
              <g style={{ transformOrigin: '60px 40px', animation: reduceMotion ? 'none' : 'puppyBlink 3.6s infinite' }}>
                <circle cx="48" cy="40" r="4" fill="#1e293b" />
                <circle cx="46.5" cy="38.5" r="1.5" fill="#ffffff" />
                <circle cx="72" cy="40" r="4" fill="#1e293b" />
                <circle cx="70.5" cy="38.5" r="1.5" fill="#ffffff" />
              </g>

              {/* Rosy Cheeks */}
              <circle cx="42" cy="48" r="3.5" fill="#fb7185" opacity="0.6" />
              <circle cx="78" cy="48" r="3.5" fill="#fb7185" opacity="0.6" />
            </g>
          </svg>
        );

      case 'wi-kitten':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes catTail {
                0%, 100% { transform: rotate(-14deg); }
                50% { transform: rotate(18deg); }
              }
              @keyframes catEarTwitch {
                0%, 90%, 100% { transform: rotate(0deg); }
                95% { transform: rotate(-7deg); }
              }
              @keyframes catPurr {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.025); }
              }
            `}</style>
            <g
              style={{
                transformOrigin: '60px 70px',
                animation: reduceMotion ? 'none' : 'catPurr 2.2s ease-in-out infinite',
              }}
            >
              {/* Swishing Tail */}
              <g
                style={{
                  transformOrigin: '92px 82px',
                  animation: reduceMotion ? 'none' : 'catTail 1.6s ease-in-out infinite',
                }}
              >
                <path
                  d="M 90 82 C 108 78 114 55 106 42 C 102 38 98 42 101 48 C 106 58 98 72 88 80 Z"
                  fill="#f97316"
                  stroke="#c2410c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Cat Body */}
              <ellipse cx="60" cy="80" rx="30" ry="24" fill="#fb923c" stroke="#c2410c" strokeWidth="3" />
              <ellipse cx="60" cy="82" rx="16" ry="15" fill="#fff7ed" />

              {/* Front Paws */}
              <ellipse cx="44" cy="98" rx="8" ry="6" fill="#fff7ed" stroke="#c2410c" strokeWidth="2.5" />
              <ellipse cx="76" cy="98" rx="8" ry="6" fill="#fff7ed" stroke="#c2410c" strokeWidth="2.5" />

              {/* Cat Head */}
              <circle cx="60" cy="46" r="24" fill="#fb923c" stroke="#c2410c" strokeWidth="3" />

              {/* Pointy Ears with Pink Inner */}
              <g
                style={{
                  transformOrigin: '40px 30px',
                  animation: reduceMotion ? 'none' : 'catEarTwitch 3s infinite',
                }}
              >
                <polygon points="36,36 30,14 48,26" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
                <polygon points="36,33 33,18 45,26" fill="#fbcfe8" />
              </g>

              <g style={{ transformOrigin: '80px 30px' }}>
                <polygon points="84,36 90,14 72,26" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
                <polygon points="84,33 87,18 75,26" fill="#fbcfe8" />
              </g>

              {/* Muzzle */}
              <ellipse cx="55" cy="52" rx="6" ry="5" fill="#fff7ed" />
              <ellipse cx="65" cy="52" rx="6" ry="5" fill="#fff7ed" />
              {/* Nose */}
              <polygon points="57,48 63,48 60,52" fill="#ec4899" />

              {/* Happy squinty purring eyes */}
              <path d="M 45 42 Q 50 37 55 42" stroke="#7c2d12" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 65 42 Q 70 37 75 42" stroke="#7c2d12" strokeWidth="2.8" strokeLinecap="round" fill="none" />

              {/* Whiskers */}
              <line x1="30" y1="48" x2="48" y2="50" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="30" y1="54" x2="48" y2="53" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="90" y1="48" x2="72" y2="50" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="90" y1="54" x2="72" y2="53" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />

              {/* Blushing cheeks */}
              <circle cx="42" cy="48" r="3" fill="#f43f5e" opacity="0.5" />
              <circle cx="78" cy="48" r="3" fill="#f43f5e" opacity="0.5" />
            </g>
          </svg>
        );

      case 'wi-bunny':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes bunnyEarLeft {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-5deg); }
              }
              @keyframes bunnyEarRight {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(6deg); }
              }
              @keyframes bunnyNoseWiggle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-1.5px); }
              }
              @keyframes bunnyHop {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
              }
            `}</style>
            <g
              style={{
                animation: reduceMotion ? 'none' : 'bunnyHop 1.8s ease-in-out infinite',
              }}
            >
              {/* Fluffy tail */}
              <circle cx="28" cy="84" r="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

              {/* Bunny Body */}
              <ellipse cx="60" cy="80" rx="30" ry="24" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
              {/* Paws */}
              <ellipse cx="44" cy="98" rx="8" ry="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" />
              <ellipse cx="76" cy="98" rx="8" ry="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" />

              {/* Left Long Ear */}
              <g
                style={{
                  transformOrigin: '46px 36px',
                  animation: reduceMotion ? 'none' : 'bunnyEarLeft 2s ease-in-out infinite',
                }}
              >
                <path
                  d="M 42 36 C 36 20 38 6 48 8 C 58 10 54 24 50 36 Z"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                />
                <path d="M 44 32 C 40 22 41 12 47 13 C 53 14 51 24 48 32 Z" fill="#fbcfe8" />
              </g>

              {/* Right Long Ear */}
              <g
                style={{
                  transformOrigin: '74px 36px',
                  animation: reduceMotion ? 'none' : 'bunnyEarRight 2s ease-in-out infinite',
                }}
              >
                <path
                  d="M 70 36 C 66 24 62 10 72 8 C 82 6 84 20 78 36 Z"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                />
                <path d="M 72 32 C 69 24 67 14 73 13 C 79 12 80 22 76 32 Z" fill="#fbcfe8" />
              </g>

              {/* Bunny Head */}
              <circle cx="60" cy="48" r="23" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />

              {/* Eyes */}
              <ellipse cx="48" cy="44" rx="3.5" ry="5" fill="#475569" />
              <circle cx="47" cy="42" r="1.3" fill="#ffffff" />
              <ellipse cx="72" cy="44" rx="3.5" ry="5" fill="#475569" />
              <circle cx="71" cy="42" r="1.3" fill="#ffffff" />

              {/* Sniffing Pink Nose */}
              <g
                style={{
                  animation: reduceMotion ? 'none' : 'bunnyNoseWiggle 0.4s ease-in-out infinite',
                }}
              >
                <polygon points="57,52 63,52 60,55" fill="#f43f5e" />
                <path d="M 60 55 L 60 58 M 57 58 Q 60 60 63 58" stroke="#64748b" strokeWidth="1.5" fill="none" />
              </g>

              {/* Whiskers */}
              <line x1="36" y1="52" x2="52" y2="54" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="36" y1="57" x2="52" y2="56" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="84" y1="52" x2="68" y2="54" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="84" y1="57" x2="68" y2="56" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

              {/* Cheeks */}
              <circle cx="44" cy="50" r="3" fill="#f43f5e" opacity="0.4" />
              <circle cx="76" cy="50" r="3" fill="#f43f5e" opacity="0.4" />
            </g>
          </svg>
        );

      case 'wi-turtle':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes turtleZen {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.04); }
              }
              @keyframes turtleHead {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(3px); }
              }
            `}</style>
            <g
              style={{
                transformOrigin: '60px 65px',
                animation: reduceMotion ? 'none' : 'turtleZen 4s ease-in-out infinite',
              }}
            >
              {/* Back Shell Legs */}
              <ellipse cx="36" cy="85" rx="8" ry="6" fill="#10b981" stroke="#047857" strokeWidth="2.5" />
              <ellipse cx="84" cy="85" rx="8" ry="6" fill="#10b981" stroke="#047857" strokeWidth="2.5" />
              <ellipse cx="36" cy="52" rx="8" ry="6" fill="#10b981" stroke="#047857" strokeWidth="2.5" />

              {/* Turtle Tail */}
              <polygon points="26,70 18,72 26,74" fill="#10b981" stroke="#047857" strokeWidth="2" />

              {/* Turtle Domed Shell */}
              <ellipse cx="58" cy="68" rx="34" ry="26" fill="#059669" stroke="#065f46" strokeWidth="3.5" />
              <ellipse cx="58" cy="68" rx="30" ry="22" fill="#10b981" />

              {/* Golden Shell Hexagonal Plates */}
              <polygon points="58,54 68,60 68,72 58,78 48,72 48,60" fill="#34d399" stroke="#065f46" strokeWidth="2" />
              <line x1="58" y1="54" x2="58" y2="46" stroke="#065f46" strokeWidth="2" />
              <line x1="68" y1="60" x2="78" y2="56" stroke="#065f46" strokeWidth="2" />
              <line x1="68" y1="72" x2="78" y2="76" stroke="#065f46" strokeWidth="2" />
              <line x1="58" y1="78" x2="58" y2="86" stroke="#065f46" strokeWidth="2" />
              <line x1="48" y1="72" x2="38" y2="76" stroke="#065f46" strokeWidth="2" />
              <line x1="48" y1="60" x2="38" y2="56" stroke="#065f46" strokeWidth="2" />

              {/* Front Right Leg */}
              <ellipse cx="84" cy="52" rx="9" ry="6" fill="#10b981" stroke="#047857" strokeWidth="2.5" />

              {/* Turtle Head extending calmly */}
              <g
                style={{
                  animation: reduceMotion ? 'none' : 'turtleHead 3.5s ease-in-out infinite',
                }}
              >
                <circle cx="94" cy="62" r="14" fill="#34d399" stroke="#047857" strokeWidth="2.5" />
                {/* Gentle smiling eye */}
                <ellipse cx="98" cy="59" rx="2.5" ry="3.5" fill="#064e3b" />
                <circle cx="97" cy="58" r="1" fill="#ffffff" />
                <path d="M 97 67 Q 102 67 104 65" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
                <circle cx="93" cy="66" r="2.5" fill="#fb7185" opacity="0.5" />
              </g>
            </g>
          </svg>
        );

      case 'wi-nightlight':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes starRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes beamPulse {
                0%, 100% { opacity: 0.55; transform: scaleY(1); }
                50% { opacity: 0.85; transform: scaleY(1.05); }
              }
              @keyframes starSparkle {
                0%, 100% { transform: scale(0.9); opacity: 0.7; }
                50% { transform: scale(1.2); opacity: 1; }
              }
            `}</style>
            {/* Projected Cosmic Light Beam */}
            <defs>
              <linearGradient id="cosmicBeam" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <polygon
              points="60,68 15,10 105,10"
              fill="url(#cosmicBeam)"
              style={{
                transformOrigin: '60px 68px',
                animation: reduceMotion ? 'none' : 'beamPulse 2.8s ease-in-out infinite',
              }}
            />

            {/* Orbiting Stars & Moon */}
            <g
              style={{
                transformOrigin: '60px 30px',
                animation: reduceMotion ? 'none' : 'starRotate 10s linear infinite',
              }}
            >
              {/* Crescent Moon */}
              <path
                d="M 60 12 A 8 8 0 0 0 54 24 A 10 10 0 0 1 60 12 Z"
                fill="#fde047"
                stroke="#eab308"
                strokeWidth="1"
              />
              {/* Stars */}
              <polygon points="34,22 36,27 41,27 37,30 39,35 34,32 30,35 32,30 27,27 33,27" fill="#fbbf24" />
              <polygon points="86,22 88,26 92,26 89,29 90,33 86,30 82,33 84,29 80,26 84,26" fill="#38bdf8" />
              <polygon points="46,40 47,43 50,43 48,45 49,48 46,46 43,48 44,45 42,43 45,43" fill="#ec4899" />
              <polygon points="74,38 75,41 78,41 76,43 77,46 74,44 71,46 72,43 70,41 73,41" fill="#a855f7" />
            </g>

            {/* Projector Base */}
            <ellipse cx="60" cy="98" rx="28" ry="10" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="52" y="82" width="16" height="16" rx="4" fill="#64748b" stroke="#334155" strokeWidth="2" />
            {/* Glowing Projector Dome */}
            <circle cx="60" cy="72" r="18" fill="#4f46e5" stroke="#3730a3" strokeWidth="3" />
            <circle cx="60" cy="72" r="13" fill="#818cf8" />
            <circle cx="56" cy="68" r="4" fill="#ffffff" opacity="0.7" />
          </svg>
        );

      case 'wi-tent':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes fairyGlow {
                0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 1px #fbbf24); }
                50% { opacity: 1; filter: drop-shadow(0 0 4px #f59e0b); }
              }
              @keyframes tentFlap {
                0%, 100% { transform: scaleX(1); }
                50% { transform: scaleX(0.96); }
              }
            `}</style>
            {/* Crossed wooden poles */}
            <line x1="30" y1="110" x2="72" y2="15" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <line x1="90" y1="110" x2="48" y2="15" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />

            {/* Tent Fabric Body */}
            <polygon points="60,26 18,102 102,102" fill="#047857" stroke="#065f46" strokeWidth="3" />

            {/* Cozy Warm Glow Inside Tent */}
            <polygon points="60,34 36,102 84,102" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
            <polygon points="60,42 45,102 75,102" fill="#fde047" opacity="0.9" />

            {/* Draped Curtains */}
            <path
              d="M 60 34 Q 40 70 32 102"
              stroke="#065f46"
              strokeWidth="3.5"
              fill="none"
              style={{
                transformOrigin: '60px 34px',
                animation: reduceMotion ? 'none' : 'tentFlap 3s ease-in-out infinite',
              }}
            />
            <path
              d="M 60 34 Q 80 70 88 102"
              stroke="#065f46"
              strokeWidth="3.5"
              fill="none"
              style={{
                transformOrigin: '60px 34px',
                animation: reduceMotion ? 'none' : 'tentFlap 3s ease-in-out infinite',
              }}
            />

            {/* String of Fairy Lights along the ridge */}
            <path d="M 22 100 Q 42 60 60 26 Q 78 60 98 100" stroke="#475569" strokeWidth="1.5" fill="none" />
            {[
              { cx: 30, cy: 82, fill: '#fbbf24' },
              { cx: 42, cy: 58, fill: '#38bdf8' },
              { cx: 54, cy: 36, fill: '#f43f5e' },
              { cx: 66, cy: 36, fill: '#a855f7' },
              { cx: 78, cy: 58, fill: '#34d399' },
              { cx: 90, cy: 82, fill: '#fbbf24' },
            ].map((light, idx) => (
              <circle
                key={idx}
                cx={light.cx}
                cy={light.cy}
                r="3.5"
                fill={light.fill}
                style={{
                  animation: reduceMotion ? 'none' : `fairyGlow 1.5s ease-in-out infinite ${idx * 0.25}s`,
                }}
              />
            ))}
          </svg>
        );

      case 'wi-trainset':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes steamRise1 {
                0% { transform: translate(0, 0) scale(0.6); opacity: 0.9; }
                100% { transform: translate(-10px, -24px) scale(1.3); opacity: 0; }
              }
              @keyframes steamRise2 {
                0% { transform: translate(0, 0) scale(0.5); opacity: 0.9; }
                100% { transform: translate(-14px, -32px) scale(1.5); opacity: 0; }
              }
              @keyframes trainChug {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(2.5px); }
              }
            `}</style>
            {/* Wooden Railway Tracks */}
            <path d="M 8 102 L 112 102" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M 8 108 L 112 108" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            {[18, 36, 54, 72, 90, 104].map((tx) => (
              <rect key={tx} x={tx} y="98" width="5" height="14" rx="1.5" fill="#78350f" />
            ))}

            <g
              style={{
                animation: reduceMotion ? 'none' : 'trainChug 0.6s ease-in-out infinite',
              }}
            >
              {/* Steam Puffs */}
              <circle
                cx="38"
                cy="44"
                r="7"
                fill="#e2e8f0"
                style={{
                  animation: reduceMotion ? 'none' : 'steamRise1 1.4s ease-out infinite',
                }}
              />
              <circle
                cx="34"
                cy="36"
                r="9"
                fill="#f1f5f9"
                style={{
                  animation: reduceMotion ? 'none' : 'steamRise2 1.4s ease-out infinite 0.7s',
                }}
              />

              {/* Locomotive Boiler (Black) */}
              <rect x="30" y="58" width="46" height="28" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
              {/* Smokestack */}
              <polygon points="35,58 33,46 43,46 41,58" fill="#475569" stroke="#0f172a" strokeWidth="2" />
              {/* Golden Dome */}
              <ellipse cx="62" cy="56" rx="6" ry="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />

              {/* Red Train Cab */}
              <rect x="74" y="44" width="32" height="42" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
              {/* Cab Roof */}
              <path d="M 70 44 L 110 44" stroke="#991b1b" strokeWidth="5" strokeLinecap="round" />
              {/* Cab Window */}
              <rect x="80" y="50" width="14" height="14" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />

              {/* Cowcatcher Grill in Front */}
              <polygon points="30,86 16,98 30,98" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />

              {/* Train Wheels */}
              {[
                { cx: 42, cy: 92, r: 10 },
                { cx: 66, cy: 92, r: 10 },
                { cx: 92, cy: 90, r: 12 },
              ].map((wheel, idx) => (
                <g key={idx}>
                  <circle
                    cx={wheel.cx}
                    cy={wheel.cy}
                    r={wheel.r}
                    fill="#475569"
                    stroke="#0f172a"
                    strokeWidth="2.5"
                  />
                  <circle cx={wheel.cx} cy={wheel.cy} r="4" fill="#fbbf24" />
                </g>
              ))}
            </g>
          </svg>
        );

      case 'wi-plant':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes plantSway {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
              }
              @keyframes leafWiggle {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(8deg); }
              }
            `}</style>
            {/* Terracotta Pot */}
            <polygon points="42,82 78,82 72,110 48,110" fill="#ea580c" stroke="#9a3412" strokeWidth="2.5" />
            <rect x="38" y="78" width="44" height="7" rx="2" fill="#c2410c" stroke="#9a3412" strokeWidth="2" />

            <g
              style={{
                transformOrigin: '60px 80px',
                animation: reduceMotion ? 'none' : 'plantSway 3s ease-in-out infinite',
              }}
            >
              {/* Green Stem */}
              <path d="M 60 80 Q 56 55 60 38" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" fill="none" />

              {/* Leaves */}
              <path
                d="M 58 64 C 40 60 38 72 56 68 Z"
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="2"
                style={{
                  transformOrigin: '58px 66px',
                  animation: reduceMotion ? 'none' : 'leafWiggle 2.5s ease-in-out infinite',
                }}
              />
              <path
                d="M 60 54 C 78 50 80 62 62 58 Z"
                fill="#22c55e"
                stroke="#15803d"
                strokeWidth="2"
                style={{
                  transformOrigin: '60px 56px',
                  animation: reduceMotion ? 'none' : 'leafWiggle 2.5s ease-in-out infinite 0.5s',
                }}
              />

              {/* Sunflower Golden Petals */}
              <g transform="translate(60, 34)">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-22"
                    rx="6"
                    ry="11"
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth="1.5"
                    transform={`rotate(${deg})`}
                  />
                ))}
                {/* Flower Center with Smiling Face */}
                <circle cx="0" cy="0" r="16" fill="#78350f" stroke="#451a03" strokeWidth="2.5" />
                {/* Eyes */}
                <circle cx="-6" cy="-2" r="2.5" fill="#fef08a" />
                <circle cx="6" cy="-2" r="2.5" fill="#fef08a" />
                {/* Smile */}
                <path d="M -6 4 Q 0 9 6 4" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Rosy Cheeks */}
                <circle cx="-10" cy="3" r="2" fill="#fb7185" />
                <circle cx="10" cy="3" r="2" fill="#fb7185" />
              </g>
            </g>
          </svg>
        );

      case 'wi-beanbag':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes beanbagSquish {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02, 0.98); }
              }
            `}</style>
            <g
              style={{
                transformOrigin: '60px 85px',
                animation: reduceMotion ? 'none' : 'beanbagSquish 3s ease-in-out infinite',
              }}
            >
              {/* Cozy Beanbag Shape */}
              <path
                d="M 22 92 C 16 68 28 42 54 40 C 66 40 76 44 86 48 C 104 56 108 78 98 94 C 90 106 32 106 22 92 Z"
                fill="#4f46e5"
                stroke="#3730a3"
                strokeWidth="3.5"
              />
              {/* Top Stitching Knob */}
              <circle cx="56" cy="40" r="4.5" fill="#818cf8" stroke="#3730a3" strokeWidth="2" />

              {/* Segment seams */}
              <path d="M 56 42 Q 38 65 30 92" stroke="#3730a3" strokeWidth="2.5" fill="none" />
              <path d="M 56 42 Q 62 68 64 96" stroke="#3730a3" strokeWidth="2.5" fill="none" />
              <path d="M 56 42 Q 82 66 90 92" stroke="#3730a3" strokeWidth="2.5" fill="none" />

              {/* Plush center sitting dip highlight */}
              <ellipse cx="62" cy="74" rx="20" ry="12" fill="#6366f1" opacity="0.6" />
              <ellipse cx="60" cy="72" rx="14" ry="7" fill="#818cf8" opacity="0.4" />
            </g>
          </svg>
        );

      case 'wi-aquarium':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes fishSwimA {
                0%, 100% { transform: translate(0, 0) scaleX(1); }
                48% { transform: translate(32px, -4px) scaleX(1); }
                50% { transform: translate(32px, -4px) scaleX(-1); }
                98% { transform: translate(0, 0) scaleX(-1); }
              }
              @keyframes fishSwimB {
                0%, 100% { transform: translate(0, 0) scaleX(-1); }
                48% { transform: translate(-28px, 6px) scaleX(-1); }
                50% { transform: translate(-28px, 6px) scaleX(1); }
                98% { transform: translate(0, 0) scaleX(1); }
              }
              @keyframes aqBubble {
                0% { transform: translateY(0); opacity: 0.8; }
                100% { transform: translateY(-40px); opacity: 0; }
              }
            `}</style>
            {/* Aquarium Tank Outer Glass */}
            <rect x="18" y="34" width="84" height="66" rx="14" fill="#0891b2" fillOpacity="0.15" stroke="#0e7490" strokeWidth="3" />
            {/* Water Fill */}
            <rect x="21" y="42" width="78" height="55" rx="10" fill="#06b6d4" fillOpacity="0.4" />

            {/* Sandy Bottom */}
            <path d="M 21 86 Q 40 82 60 86 Q 80 90 99 86 L 99 97 L 21 97 Z" fill="#fde68a" />

            {/* Aquatic Plants */}
            <path d="M 28 88 Q 34 68 26 52 Q 32 66 30 88" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 90 88 Q 84 64 92 50 Q 86 68 88 88" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Bubbles */}
            {[
              { cx: 48, cy: 82, r: 2.5, delay: '0s' },
              { cx: 52, cy: 76, r: 3.5, delay: '0.6s' },
              { cx: 49, cy: 70, r: 2, delay: '1.2s' },
            ].map((b, idx) => (
              <circle
                key={idx}
                cx={b.cx}
                cy={b.cy}
                r={b.r}
                fill="#ffffff"
                opacity="0.8"
                style={{
                  animation: reduceMotion ? 'none' : `aqBubble 2s ease-in infinite ${b.delay}`,
                }}
              />
            ))}

            {/* Orange Clownfish */}
            <g
              style={{
                transformOrigin: '45px 58px',
                animation: reduceMotion ? 'none' : 'fishSwimA 5s ease-in-out infinite',
              }}
            >
              <ellipse cx="45" cy="58" rx="8" ry="5" fill="#f97316" />
              <polygon points="37,58 32,54 32,62" fill="#f97316" />
              <line x1="44" y1="53" x2="44" y2="63" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="49" cy="57" r="1" fill="#ffffff" />
            </g>

            {/* Neon Blue Tetra */}
            <g
              style={{
                transformOrigin: '72px 70px',
                animation: reduceMotion ? 'none' : 'fishSwimB 4.2s ease-in-out infinite',
              }}
            >
              <ellipse cx="72" cy="70" rx="6" ry="3.5" fill="#0284c7" />
              <polygon points="78,70 82,67 82,73" fill="#0284c7" />
              <line x1="68" y1="70" x2="74" y2="70" stroke="#f43f5e" strokeWidth="1.5" />
            </g>

            {/* Tank Lid */}
            <rect x="15" y="32" width="90" height="7" rx="3" fill="#1e293b" />
          </svg>
        );

      case 'wi-trampoline':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes trampBounce {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.92); }
              }
            `}</style>
            <g
              style={{
                transformOrigin: '60px 85px',
                animation: reduceMotion ? 'none' : 'trampBounce 1.4s ease-in-out infinite',
              }}
            >
              {/* Steel Legs */}
              <line x1="28" y1="76" x2="24" y2="104" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="50" y1="80" x2="48" y2="106" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="70" y1="80" x2="72" y2="106" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="92" y1="76" x2="96" y2="104" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />

              {/* Outer Safety Rim Pad (Teal) */}
              <ellipse cx="60" cy="74" rx="46" ry="16" fill="#0d9488" stroke="#0f766e" strokeWidth="3" />
              {/* Bouncy Spring Bed (Dark Indigo) */}
              <ellipse cx="60" cy="74" rx="36" ry="11" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />
              {/* Spring indicators */}
              <ellipse cx="60" cy="74" rx="32" ry="8" fill="#312e81" opacity="0.4" />
            </g>
          </svg>
        );

      case 'wi-rug':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible select-none drop-shadow-sm">
            <style>{`
              @keyframes rainbowShimmer {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; filter: drop-shadow(0 0 6px #f472b6); }
              }
            `}</style>
            <g
              style={{
                animation: reduceMotion ? 'none' : 'rainbowShimmer 3.5s ease-in-out infinite',
              }}
            >
              {/* Fluffy Cloud Base */}
              <ellipse cx="60" cy="75" rx="50" ry="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
              <circle cx="34" cy="72" r="16" fill="#ffffff" />
              <circle cx="86" cy="72" r="16" fill="#ffffff" />

              {/* Pastel Rainbow Arcs */}
              <ellipse cx="60" cy="74" rx="40" ry="18" fill="none" stroke="#f43f5e" strokeWidth="5" />
              <ellipse cx="60" cy="74" rx="34" ry="15" fill="none" stroke="#fb923c" strokeWidth="5" />
              <ellipse cx="60" cy="74" rx="28" ry="12" fill="none" stroke="#facc15" strokeWidth="5" />
              <ellipse cx="60" cy="74" rx="22" ry="9" fill="none" stroke="#4ade80" strokeWidth="5" />
              <ellipse cx="60" cy="74" rx="16" ry="6" fill="none" stroke="#38bdf8" strokeWidth="5" />
              <ellipse cx="60" cy="74" rx="10" ry="4" fill="none" stroke="#a855f7" strokeWidth="4" />
            </g>
          </svg>
        );

      default:
        return (
          <div className="flex items-center justify-center w-full h-full text-4xl select-none">
            ✨
          </div>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        sizeDimensions.wrapper
      } ${interactive ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
      style={{
        transform: isReacting ? 'scale(1.12) translateY(-6px)' : undefined,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Floating Interactive Reaction Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-xl pointer-events-none z-30 animate-out fade-out duration-1000 fill-mode-forwards"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`,
            animation: 'particleFloat 0.9s ease-out forwards',
          }}
        >
          {p.symbol}
        </span>
      ))}

      {/* Main Animated Vector Entity */}
      <div className="w-full h-full relative z-10">{renderEntitySvg()}</div>

      {/* Optional Soft Floor Shadow */}
      {showFloorShadow && (
        <div
          className="absolute -bottom-2 w-3/4 h-3 bg-black/15 rounded-full blur-[2px] pointer-events-none z-0"
          style={{
            transform: isReacting ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.25s ease',
          }}
        />
      )}
    </div>
  );
};
