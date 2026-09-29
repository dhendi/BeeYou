import React from 'react';
import { WallpaperPattern, AppTheme } from '../types';

export interface ThemeWallpaperArtProps {
  pattern?: WallpaperPattern;
  category?: AppTheme['category'];
  reduceMotion?: boolean;
  className?: string;
}

export const ThemeWallpaperArt: React.FC<ThemeWallpaperArtProps> = ({
  pattern = 'none',
  category,
  reduceMotion = false,
  className = '',
}) => {
  // Determine effective pattern from either explicit pattern or theme category
  const effectivePattern: WallpaperPattern =
    pattern !== 'none'
      ? pattern
      : category === 'turtle'
      ? 'turtle_shell'
      : category === 'dinosaur'
      ? 'dino_footprints'
      : category === 'frog'
      ? 'lily_pads'
      : category === 'train'
      ? 'railroad'
      : category === 'space'
      ? 'cosmic_stars'
      : category === 'ocean'
      ? 'bubbles'
      : category === 'nature' || category === 'executive'
      ? 'zen_botanical'
      : category === 'lofi' || category === 'fantasy'
      ? 'sparkles'
      : 'none';

  if (effectivePattern === 'none') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 transition-opacity duration-700 ${className}`}
    >
      {/* 1. TURTLE SHELL & OCEAN LAGOON ART */}
      {effectivePattern === 'turtle_shell' && (
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full opacity-20 sm:opacity-25"
        >
          <style>{`
            @keyframes turtleSwim1 {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              50% { transform: translate(30px, -20px) rotate(3deg); }
            }
            @keyframes turtleSwim2 {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              50% { transform: translate(-25px, 15px) rotate(-3deg); }
            }
            @keyframes oceanRipple {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.7; }
            }
            @keyframes bubbleDrift {
              0% { transform: translateY(0); opacity: 0.6; }
              100% { transform: translateY(-80px); opacity: 0; }
            }
          `}</style>

          {/* Calming Water Ripple Arcs */}
          <g stroke="#059669" strokeWidth="2.5" fill="none" opacity="0.4" style={{ animation: reduceMotion ? 'none' : 'oceanRipple 6s ease-in-out infinite' }}>
            <circle cx="200" cy="250" r="120" strokeDasharray="16 8" />
            <circle cx="200" cy="250" r="180" strokeDasharray="12 12" />
            <circle cx="800" cy="650" r="140" strokeDasharray="16 8" />
            <circle cx="800" cy="650" r="220" strokeDasharray="12 12" />
          </g>

          {/* Large Friendly Sea Turtle in Upper Right */}
          <g
            style={{
              transformOrigin: '780px 220px',
              animation: reduceMotion ? 'none' : 'turtleSwim1 10s ease-in-out infinite',
            }}
          >
            {/* Flippers */}
            <ellipse cx="710" cy="180" rx="35" ry="14" fill="#10b981" transform="rotate(-35 710 180)" />
            <ellipse cx="850" cy="180" rx="35" ry="14" fill="#10b981" transform="rotate(35 850 180)" />
            <ellipse cx="720" cy="270" rx="28" ry="12" fill="#10b981" transform="rotate(-20 720 270)" />
            <ellipse cx="840" cy="270" rx="28" ry="12" fill="#10b981" transform="rotate(20 840 270)" />
            {/* Head */}
            <circle cx="780" cy="130" r="22" fill="#34d399" stroke="#047857" strokeWidth="3" />
            <circle cx="773" cy="125" r="3" fill="#064e3b" />
            <circle cx="787" cy="125" r="3" fill="#064e3b" />
            {/* Shell with Geometric Hexagons */}
            <ellipse cx="780" cy="225" rx="65" ry="55" fill="#059669" stroke="#065f46" strokeWidth="4" />
            <polygon points="780,185 805,200 805,230 780,245 755,230 755,200" fill="#10b981" stroke="#064e3b" strokeWidth="2.5" />
            <polygon points="780,245 805,260 805,280 780,290 755,280 755,260" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
            <polygon points="805,200 835,210 835,240 805,230" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
            <polygon points="755,200 725,210 725,240 755,230" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
          </g>

          {/* Baby Swimming Turtle in Lower Left */}
          <g
            style={{
              transformOrigin: '220px 750px',
              animation: reduceMotion ? 'none' : 'turtleSwim2 8s ease-in-out infinite',
            }}
          >
            {/* Flippers */}
            <ellipse cx="170" cy="720" rx="22" ry="9" fill="#10b981" transform="rotate(-30 170 720)" />
            <ellipse cx="270" cy="720" rx="22" ry="9" fill="#10b981" transform="rotate(30 270 720)" />
            <ellipse cx="180" cy="780" rx="18" ry="8" fill="#10b981" transform="rotate(-15 180 780)" />
            <ellipse cx="260" cy="780" rx="18" ry="8" fill="#10b981" transform="rotate(15 260 780)" />
            {/* Head */}
            <circle cx="220" cy="690" r="15" fill="#34d399" stroke="#047857" strokeWidth="2" />
            {/* Shell */}
            <ellipse cx="220" cy="750" rx="42" ry="36" fill="#059669" stroke="#065f46" strokeWidth="3" />
            <polygon points="220,725 238,735 238,755 220,765 202,755 202,735" fill="#10b981" stroke="#064e3b" strokeWidth="2" />
          </g>

          {/* Sacred Turtle Shell Hexagonal Grid Watermark in Center */}
          <g stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.3">
            {[350, 450, 550, 650].map((cx) =>
              [380, 480, 580].map((cy) => (
                <polygon
                  key={`${cx}-${cy}`}
                  points={`${cx},${cy - 25} ${cx + 22},${cy - 12} ${cx + 22},${cy + 12} ${cx},${cy + 25} ${cx - 22},${cy + 12} ${cx - 22},${cy - 12}`}
                />
              ))
            )}
          </g>

          {/* Sea Kelp / Plants Silhouettes in Corners */}
          <path d="M 60 1000 Q 90 850 40 700 Q 100 800 70 1000" fill="#047857" opacity="0.4" />
          <path d="M 120 1000 Q 160 880 110 760 Q 180 860 140 1000" fill="#10b981" opacity="0.3" />
          <path d="M 940 1000 Q 910 840 960 700 Q 890 820 920 1000" fill="#047857" opacity="0.4" />

          {/* Floating Sea Bubbles */}
          {[
            { cx: 280, cy: 300, r: 8 },
            { cx: 310, cy: 260, r: 5 },
            { cx: 720, cy: 620, r: 10 },
            { cx: 740, cy: 580, r: 6 },
            { cx: 500, cy: 820, r: 9 },
          ].map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
          ))}
        </svg>
      )}

      {/* 2. DINOSAUR FOOTPRINTS & JURASSIC JUNGLE */}
      {effectivePattern === 'dino_footprints' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-18 sm:opacity-22">
          {/* Ferns in top left & bottom right */}
          <g fill="#15803d">
            <path d="M 0 0 C 120 40 180 140 220 260 C 140 220 40 120 0 0 Z" />
            <path d="M 0 60 C 100 120 140 200 160 300 C 100 240 30 160 0 60 Z" opacity="0.7" />
            <path d="M 1000 1000 C 880 960 820 860 780 740 C 860 780 960 880 1000 1000 Z" />
          </g>

          {/* Three-toed Dinosaur Footprint Steps across the background */}
          {[
            { cx: 200, cy: 400, rot: 25 },
            { cx: 350, cy: 320, rot: 35 },
            { cx: 520, cy: 260, rot: 20 },
            { cx: 680, cy: 220, rot: 30 },
            { cx: 820, cy: 380, rot: 80 },
            { cx: 760, cy: 550, rot: 130 },
            { cx: 650, cy: 700, rot: 160 },
            { cx: 480, cy: 780, rot: 190 },
            { cx: 320, cy: 820, rot: 210 },
          ].map((fp, i) => (
            <g
              key={i}
              transform={`translate(${fp.cx}, ${fp.cy}) rotate(${fp.rot})`}
              fill="#16a34a"
              opacity="0.35"
            >
              {/* Heel pad */}
              <ellipse cx="0" cy="15" rx="14" ry="18" />
              {/* Left Claw */}
              <path d="M -8 10 C -22 -5 -18 -25 -14 -32 C -10 -22 0 -2 0 5 Z" />
              {/* Center Claw */}
              <path d="M 0 5 C 0 -15 0 -38 0 -45 C 5 -35 8 -15 0 5 Z" />
              {/* Right Claw */}
              <path d="M 8 10 C 22 -5 18 -25 14 -32 C 10 -22 0 -2 0 5 Z" />
            </g>
          ))}

          {/* Distant Flying Pterodactyl */}
          <path
            d="M 620 120 Q 640 100 670 115 Q 640 130 635 145 Q 630 130 600 115 Q 630 100 620 120 Z"
            fill="#15803d"
            opacity="0.3"
          />
        </svg>
      )}

      {/* 3. LILY PADS & RIBBIT POND ART */}
      {effectivePattern === 'lily_pads' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-20 sm:opacity-25">
          {/* Water Ripples */}
          <circle cx="300" cy="300" r="140" fill="none" stroke="#65a30d" strokeWidth="2" strokeDasharray="10 8" opacity="0.3" />
          <circle cx="700" cy="700" r="180" fill="none" stroke="#65a30d" strokeWidth="2" strokeDasharray="12 10" opacity="0.3" />

          {/* Lily Pads with characteristic V-notch cutout */}
          {[
            { cx: 250, cy: 220, r: 75, rot: 40 },
            { cx: 780, cy: 320, r: 90, rot: -60 },
            { cx: 320, cy: 680, r: 85, rot: 120 },
            { cx: 720, cy: 750, r: 70, rot: -140 },
            { cx: 500, cy: 480, r: 60, rot: 15 },
          ].map((pad, idx) => (
            <g key={idx} transform={`translate(${pad.cx}, ${pad.cy}) rotate(${pad.rot})`}>
              {/* Pad Leaf */}
              <path
                d={`M 0 0 L ${pad.r * 0.9} ${pad.r * 0.4} A ${pad.r} ${pad.r} 0 1 0 ${pad.r * 0.9} ${-pad.r * 0.4} Z`}
                fill="#84cc16"
                stroke="#4d7c0f"
                strokeWidth="3"
                opacity="0.4"
              />
              {/* Radial leaf veins */}
              <line x1="0" y1="0" x2={-pad.r * 0.7} y2={-pad.r * 0.5} stroke="#4d7c0f" strokeWidth="1.5" opacity="0.5" />
              <line x1="0" y1="0" x2={-pad.r * 0.8} y2="0" stroke="#4d7c0f" strokeWidth="1.5" opacity="0.5" />
              <line x1="0" y1="0" x2={-pad.r * 0.7} y2={pad.r * 0.5} stroke="#4d7c0f" strokeWidth="1.5" opacity="0.5" />
              {/* Pink Lotus Blossom on Pad */}
              {idx % 2 === 0 && (
                <g transform="translate(15, -15)">
                  <ellipse cx="0" cy="0" rx="9" ry="14" fill="#f472b6" opacity="0.8" />
                  <ellipse cx="-8" cy="2" rx="7" ry="12" fill="#f472b6" transform="rotate(-25 -8 2)" opacity="0.8" />
                  <ellipse cx="8" cy="2" rx="7" ry="12" fill="#f472b6" transform="rotate(25 8 2)" opacity="0.8" />
                  <circle cx="0" cy="4" r="4" fill="#facc15" />
                </g>
              )}
            </g>
          ))}

          {/* Cute Little Frog Silhouette */}
          <g transform="translate(780, 290) scale(0.6)" fill="#4d7c0f" opacity="0.5">
            <circle cx="0" cy="0" r="22" />
            <circle cx="-14" cy="-18" r="8" />
            <circle cx="14" cy="-18" r="8" />
            <ellipse cx="-26" cy="14" rx="14" ry="8" />
            <ellipse cx="26" cy="14" rx="14" ry="8" />
          </g>
        </svg>
      )}

      {/* 4. RAILROAD & STEAM TRAIN TRACKS */}
      {effectivePattern === 'railroad' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-18 sm:opacity-22">
          {/* Curved Railway Track across Lower Screen */}
          <path d="M -50 820 C 300 820 450 680 1050 680" stroke="#64748b" strokeWidth="5" fill="none" />
          <path d="M -50 840 C 300 840 450 700 1050 700" stroke="#64748b" strokeWidth="5" fill="none" />
          {/* Wooden Ties */}
          {[50, 150, 250, 350, 450, 550, 650, 750, 850, 950].map((x) => (
            <rect key={x} x={x} y={x < 400 ? 810 : 670} width="8" height="40" fill="#78350f" opacity="0.4" rx="2" />
          ))}

          {/* Drifting Steam Puffs */}
          {[
            { cx: 200, cy: 150, r: 35 },
            { cx: 260, cy: 130, r: 45 },
            { cx: 330, cy: 140, r: 38 },
            { cx: 750, cy: 220, r: 40 },
            { cx: 810, cy: 200, r: 50 },
          ].map((sp, i) => (
            <circle key={i} cx={sp.cx} cy={sp.cy} r={sp.r} fill="#0284c7" opacity="0.25" />
          ))}
        </svg>
      )}

      {/* 5. COSMIC STARS & GALAXY ART */}
      {effectivePattern === 'cosmic_stars' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-25 sm:opacity-30">
          {/* Crescent Moon */}
          <path
            d="M 850 150 A 60 60 0 0 0 800 240 A 70 70 0 0 1 850 150 Z"
            fill="#facc15"
            opacity="0.6"
          />

          {/* Saturn Ringed Planet */}
          <g transform="translate(180, 220)">
            <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="#a855f7" strokeWidth="5" transform="rotate(-20)" />
            <circle cx="0" cy="0" r="24" fill="#7c3aed" opacity="0.7" />
          </g>

          {/* Twinkling 4-point Stars */}
          {[
            { cx: 120, cy: 450, s: 18 },
            { cx: 340, cy: 180, s: 24 },
            { cx: 480, cy: 320, s: 16 },
            { cx: 620, cy: 140, s: 22 },
            { cx: 720, cy: 420, s: 18 },
            { cx: 880, cy: 520, s: 26 },
            { cx: 250, cy: 750, s: 20 },
            { cx: 580, cy: 820, s: 22 },
            { cx: 820, cy: 780, s: 18 },
          ].map((st, i) => (
            <g key={i} transform={`translate(${st.cx}, ${st.cy})`} fill="#c084fc">
              <path d={`M 0 ${-st.s} Q 0 0 ${st.s} 0 Q 0 0 0 ${st.s} Q 0 0 ${-st.s} 0 Q 0 0 0 ${-st.s} Z`} />
            </g>
          ))}

          {/* Tiny Rocket Ship */}
          <g transform="translate(720, 680) rotate(-45) scale(0.7)" fill="#38bdf8" opacity="0.5">
            <ellipse cx="0" cy="0" rx="14" ry="32" />
            <polygon points="-14,15 -28,30 -14,25" fill="#f43f5e" />
            <polygon points="14,15 28,30 14,25" fill="#f43f5e" />
            <circle cx="0" cy="-6" r="6" fill="#ffffff" />
          </g>
        </svg>
      )}

      {/* 6. OCEAN BUBBLES & DOLPHIN ART */}
      {(effectivePattern === 'bubbles' || effectivePattern === 'ocean_waves') && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-20 sm:opacity-25">
          {/* Wave Lines */}
          <path d="M 0 350 Q 250 300 500 350 T 1000 350" fill="none" stroke="#0891b2" strokeWidth="3" opacity="0.4" />
          <path d="M 0 650 Q 250 600 500 650 T 1000 650" fill="none" stroke="#0891b2" strokeWidth="3" opacity="0.4" />

          {/* Playful Swimming Dolphin */}
          <g transform="translate(740, 240) scale(0.8)" fill="#0284c7" opacity="0.5">
            <path d="M -50 20 C -20 -30 40 -35 80 0 C 60 5 40 20 20 25 C -10 30 -30 25 -50 20 Z" />
            <polygon points="10,-28 25,-55 35,-25" />
            <polygon points="-50,20 -70,5 -65,22" />
            <polygon points="-50,20 -75,32 -62,25" />
          </g>

          {/* Bubble Columns */}
          {[
            { cx: 180, cy: 300, r: 12 },
            { cx: 190, cy: 260, r: 8 },
            { cx: 175, cy: 220, r: 15 },
            { cx: 820, cy: 620, r: 14 },
            { cx: 835, cy: 570, r: 9 },
            { cx: 815, cy: 530, r: 16 },
          ].map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#67e8f9" stroke="#0891b2" strokeWidth="2" opacity="0.4" />
          ))}
        </svg>
      )}

      {/* 7. ZEN BOTANICAL / SAGE NATURE ART */}
      {effectivePattern === 'zen_botanical' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-18 sm:opacity-22">
          {/* Elegant Monstera Leaf */}
          <g transform="translate(140, 220) scale(0.9)" fill="#059669" opacity="0.4">
            <path d="M 0 -80 C 60 -60 100 0 80 80 C 40 100 -40 100 -80 80 C -100 0 -60 -60 0 -80 Z" />
            <path d="M 0 -70 L 0 90" stroke="#ecfdf5" strokeWidth="4" />
          </g>

          {/* Zen concentric circle ripples */}
          <circle cx="820" cy="780" r="120" fill="none" stroke="#047857" strokeWidth="2" strokeDasharray="10 8" opacity="0.4" />
          <circle cx="820" cy="780" r="160" fill="none" stroke="#047857" strokeWidth="2" strokeDasharray="12 10" opacity="0.3" />
        </svg>
      )}

      {/* 8. SPARKLES & LO-FI DREAMS */}
      {effectivePattern === 'sparkles' && (
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-22 sm:opacity-26">
          {/* Musical Eighth Notes */}
          {[
            { cx: 220, cy: 200, scale: 0.9 },
            { cx: 780, cy: 300, scale: 1.1 },
            { cx: 340, cy: 750, scale: 0.8 },
            { cx: 820, cy: 720, scale: 1.0 },
          ].map((note, i) => (
            <g key={i} transform={`translate(${note.cx}, ${note.cy}) scale(${note.scale})`} fill="#a855f7" opacity="0.45">
              <ellipse cx="0" cy="14" rx="10" ry="7" transform="rotate(-20)" />
              <line x1="8" y1="12" x2="8" y2="-18" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
              <path d="M 8 -18 Q 20 -15 22 -6" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ))}

          {/* Sparkles */}
          {[
            { cx: 160, cy: 420, s: 18 },
            { cx: 480, cy: 160, s: 22 },
            { cx: 620, cy: 450, s: 16 },
            { cx: 860, cy: 520, s: 20 },
            { cx: 520, cy: 820, s: 24 },
          ].map((sp, i) => (
            <g key={i} transform={`translate(${sp.cx}, ${sp.cy})`} fill="#ec4899" opacity="0.45">
              <path d={`M 0 ${-sp.s} Q 0 0 ${sp.s} 0 Q 0 0 0 ${sp.s} Q 0 0 ${-sp.s} 0 Q 0 0 0 ${-sp.s} Z`} />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};
