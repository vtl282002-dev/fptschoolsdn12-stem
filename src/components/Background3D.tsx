import React, { useEffect, useState, useRef } from 'react';

interface Background3DProps {
  reducedMotion?: boolean;
}

export const Background3D: React.FC<Background3DProps> = ({ reducedMotion = false }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const nx = (e.clientX / innerWidth) * 2 - 1;
        const ny = (e.clientY / innerHeight) * 2 - 1;
        setMousePos({ x: nx, y: ny });
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Subtle Parallax offsets
  const pCity = { x: mousePos.x * 6, y: mousePos.y * 4 };
  const pArches = { x: mousePos.x * 12, y: mousePos.y * 8 };
  const pParticles = { x: mousePos.x * 18, y: mousePos.y * 12 };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ================= LAYER 1: VIBRANT ROYAL BLUE SCI-FI AMBIENCE (Matching image.png) ================= */}
      {/* Rich sapphire & royal blue base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061838] via-[#09295e] to-[#04122c]" />

      {/* Atmospheric Overhead Sky & Cyan Light Beams */}
      <div className="absolute inset-0">
        {/* Top Center Radiant Cyan-Blue Glow */}
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full bg-gradient-to-b from-cyan-400/25 via-blue-500/20 to-transparent blur-2xl sm:blur-[110px]" />
        
        {/* Left Electric Cyan Light Aura */}
        <div className="absolute top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full bg-cyan-400/20 blur-2xl sm:blur-[130px]" />

        {/* Right Electric Blue Light Aura */}
        <div className="absolute top-[20%] -right-[10%] w-[650px] h-[650px] rounded-full bg-blue-500/20 blur-2xl sm:blur-[130px]" />

        {/* Center Floor Cyan Light Pool */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-cyan-400/20 blur-2xl sm:blur-[90px]" />
      </div>

      {/* ================= LAYER 2: CITY SKYLINE & PANORAMIC GLASS WINDOWS (Matching image.png) ================= */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out opacity-85"
        style={{
          transform: `translate3d(${pCity.x}px, ${pCity.y}px, 0)`
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" fill="none">
          <defs>
            {/* Sky gradient outside the windows */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#041b44" />
              <stop offset="50%" stopColor="#0a3c82" />
              <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.9" />
            </linearGradient>

            {/* City Building Gradients */}
            <linearGradient id="towerGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="towerGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.2" />
            </linearGradient>

            {/* Neon Cyan Arch Glow */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Floor Stage Radial Gradient */}
            <radialGradient id="stageRings" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#0284C7" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#082f49" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Distant Futuristic City Skyline seen through windows */}
          <g opacity="0.45">
            {/* Distant Spire 1 */}
            <polygon points="260,700 280,380 290,380 310,700" fill="url(#towerGrad1)" />
            <line x1="285" y1="380" x2="285" y2="330" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="285" cy="330" r="3" fill="#f59e0b" />

            {/* Futuristic Tower 2 */}
            <polygon points="350,700 370,440 430,440 450,700" fill="url(#towerGrad2)" />
            {/* Window lights */}
            <line x1="380" y1="460" x2="420" y2="460" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="380" y1="500" x2="420" y2="500" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="380" y1="540" x2="420" y2="540" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Distant Spire Center-Left */}
            <polygon points="500,700 520,320 530,320 550,700" fill="url(#towerGrad1)" />
            <line x1="525" y1="320" x2="525" y2="270" stroke="#00F0FF" strokeWidth="2" />
            <circle cx="525" cy="270" r="3.5" fill="#00F0FF" />

            {/* Skyscraper Center */}
            <polygon points="900,700 920,410 980,410 1000,700" fill="url(#towerGrad2)" opacity="0.4" />

            {/* Distant Spire Center-Right */}
            <polygon points="1350,700 1370,350 1380,350 1400,700" fill="url(#towerGrad1)" />
            <line x1="1375" y1="350" x2="1375" y2="290" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="1375" cy="290" r="3.5" fill="#f59e0b" />

            {/* Futuristic Tower Right */}
            <polygon points="1460,700 1480,420 1540,420 1560,700" fill="url(#towerGrad2)" />
            <polygon points="1600,700 1620,380 1660,380 1680,700" fill="url(#towerGrad1)" />
          </g>

          {/* Panoramic Curved Glass Window Mullions (Matching image.png curved room architecture) */}
          <g opacity="0.4">
            {/* Left Curved Window Pillar */}
            <path
              d="M 120 0 Q 380 500 420 1080"
              stroke="#38BDF8"
              strokeWidth="5"
              fill="none"
              filter="url(#neonGlow)"
            />
            <path
              d="M 140 0 Q 400 500 440 1080"
              stroke="#0369A1"
              strokeWidth="12"
              fill="none"
              opacity="0.6"
            />

            {/* Right Curved Window Pillar */}
            <path
              d="M 1800 0 Q 1540 500 1500 1080"
              stroke="#38BDF8"
              strokeWidth="5"
              fill="none"
              filter="url(#neonGlow)"
            />
            <path
              d="M 1780 0 Q 1520 500 1480 1080"
              stroke="#0369A1"
              strokeWidth="12"
              fill="none"
              opacity="0.6"
            />

            {/* Outer Window Arches */}
            <path
              d="M 0 350 Q 960 120 1920 350"
              stroke="#00F0FF"
              strokeWidth="3"
              fill="none"
              opacity="0.35"
              filter="url(#neonGlow)"
            />
            <path
              d="M 0 450 Q 960 220 1920 450"
              stroke="#0284C7"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </g>
        </svg>
      </div>

      {/* ================= LAYER 3: CEILING ARCHES & NEON CYAN ACCENTS (Matching image.png) ================= */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${pArches.x}px, ${pArches.y}px, 0)`
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" fill="none">
          {/* Top Dramatic Sweeping Neon Ceiling Arch matching image.png */}
          <path
            d="M 250 -40 Q 960 180 1670 -40"
            stroke="#00F0FF"
            strokeWidth="5"
            fill="none"
            filter="url(#neonGlow)"
            opacity="0.85"
          />
          <path
            d="M 280 -40 Q 960 160 1640 -40"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.9"
          />
          <path
            d="M 350 -40 Q 960 230 1570 -40"
            stroke="#38BDF8"
            strokeWidth="2.5"
            fill="none"
            opacity="0.6"
          />

          {/* Star Sparkles along the ceiling arches */}
          <g fill="#FFFFFF">
            <circle cx="500" cy="70" r="3" className="animate-ping" opacity="0.75" />
            <circle cx="960" cy="110" r="4" className="animate-pulse" opacity="0.9" />
            <circle cx="1420" cy="70" r="3" className="animate-ping" opacity="0.75" />
          </g>

          {/* Horizontal Tech Horizon Railing / Balcony (at y=680) */}
          <line x1="0" y1="720" x2="1920" y2="720" stroke="#0284C7" strokeWidth="4" opacity="0.5" />
          <line x1="0" y1="730" x2="1920" y2="730" stroke="#00F0FF" strokeWidth="1.5" opacity="0.7" />
          <line x1="0" y1="745" x2="1920" y2="745" stroke="#0369A1" strokeWidth="8" opacity="0.4" />
        </svg>
      </div>

      {/* ================= LAYER 4: THE ILLUMINATED CIRCULAR FLOOR STAGE (Matching image.png) ================= */}
      <div className="absolute inset-x-0 bottom-0 h-[380px] pointer-events-none flex flex-col items-center justify-end overflow-visible">
        {/* Glossy floor reflection gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020b1e] via-[#051838]/80 to-transparent" />

        {/* Circular Illuminated Stage SVG */}
        <svg
          viewBox="0 0 1200 320"
          className="w-full max-w-[1100px] h-auto overflow-visible drop-shadow-[0_0_35px_rgba(0,240,255,0.45)]"
        >
          <defs>
            <linearGradient id="stageRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#00F0FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#00F0FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="ringCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Stage Platform Base 3D Step */}
          <path
            d="M 180 200 C 180 280, 1020 280, 1020 200 L 1000 225 C 1000 300, 200 300, 200 225 Z"
            fill="#031b3e"
            stroke="#0284C7"
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Main Outer Glowing Ring */}
          <ellipse
            cx="600"
            cy="195"
            rx="460"
            ry="90"
            fill="#051c44"
            stroke="url(#stageRimGrad)"
            strokeWidth="5"
            filter="url(#neonGlow)"
          />

          {/* Middle Concentric Ring */}
          <ellipse
            cx="600"
            cy="195"
            rx="380"
            ry="72"
            fill="#062456"
            stroke="#00F0FF"
            strokeWidth="2.5"
            opacity="0.85"
          />

          {/* Inner Concentric Ring with Tick Marks */}
          <ellipse
            cx="600"
            cy="195"
            rx="290"
            ry="54"
            fill="#0a3272"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="14 6"
            opacity="0.9"
          />

          {/* Radial Technical Tick Marks */}
          <ellipse
            cx="600"
            cy="195"
            rx="200"
            ry="36"
            fill="#0c3c88"
            stroke="#00F0FF"
            strokeWidth="2"
            opacity="0.95"
          />

          {/* Glowing Smiley in the center of the ring matching image.png! */}
          <g>
            {/* Center soft blue glow circle */}
            <ellipse cx="600" cy="195" rx="80" ry="16" fill="#00F0FF" opacity="0.3" className="animate-pulse" />
            {/* Curved Smile Eyes */}
            <path d="M 575 192 Q 585 186 595 192" stroke="#00F0FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 605 192 Q 615 186 625 192" stroke="#00F0FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Smile Mouth */}
            <path d="M 586 198 Q 600 206 614 198" stroke="#00F0FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>

          {/* The Exact Text from image.png along the curved rim:
              "— NHỮNG MẢNH GHÉP TẠO NÊN ĐIỀU KỲ DIỆU —" */}
          <text
            x="600"
            y="262"
            fontFamily="'Montserrat', 'Arial', sans-serif"
            fontWeight="700"
            fontSize="14"
            letterSpacing="6"
            fill="#38BDF8"
            textAnchor="middle"
            filter="drop-shadow(0 0 10px #00F0FF)"
            opacity="0.95"
          >
            — NHỮNG MẢNH GHÉP TẠO NÊN ĐIỀU KỲ DIỆU —
          </text>
        </svg>
      </div>

      {/* ================= LAYER 5: FLOATING PARTICLES & GOLDEN SPARKLES ================= */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${pParticles.x}px, ${pParticles.y}px, 0)`
        }}
      >
        {/* Floating golden and cyan sparkles */}
        {[
          { top: '15%', left: '22%', size: 5, color: '#FCD34D', delay: '0s' },
          { top: '25%', left: '76%', size: 6, color: '#00F0FF', delay: '1s' },
          { top: '40%', left: '12%', size: 4, color: '#38BDF8', delay: '2s' },
          { top: '55%', left: '88%', size: 5, color: '#FCD34D', delay: '0.5s' },
          { top: '70%', left: '25%', size: 6, color: '#00F0FF', delay: '1.5s' },
          { top: '30%', left: '50%', size: 4, color: '#FFFFFF', delay: '2.5s' },
        ].map((s, idx) => (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              boxShadow: `0 0 12px ${s.color}`,
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) ${s.delay} infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
};
