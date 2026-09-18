import React, { useEffect, useRef, useState, useMemo } from 'react';

interface SpaceBackground3DProps {
  reducedMotion?: boolean;
}

export const SpaceBackground3D: React.FC<SpaceBackground3DProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth mouse parallax
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // Floating STEM objects positions and types
  const floatingObjects = useMemo(() => [
    { type: 'atom', x: 8, y: 18, size: 54, depth: 0.8, delay: 0 },
    { type: 'gear', x: 88, y: 15, size: 48, depth: 0.6, delay: 1.5 },
    { type: 'planet', x: 82, y: 72, size: 64, depth: 0.9, delay: 0.8 },
    { type: 'puzzle', x: 12, y: 80, size: 44, depth: 0.7, delay: 2.2 },
    { type: 'rocket', x: 92, y: 45, size: 42, depth: 1.1, delay: 3 },
    { type: 'flask', x: 6, y: 52, size: 40, depth: 0.5, delay: 1.2 },
  ], []);

  // Precomputed dust particles for Layer 5
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 96 + 2}%`,
      top: `${(i * 23) % 94 + 3}%`,
      size: (i % 3) + 2,
      duration: 6 + (i % 5) * 2,
      delay: (i % 7) * 0.8,
      opacity: 0.25 + (i % 4) * 0.15
    }));
  }, []);

  const parallax = (depth: number, rotate = false) => {
    if (reducedMotion) return {};
    const moveX = mousePos.x * depth * 28;
    const moveY = mousePos.y * depth * 28;
    const rotX = rotate ? -mousePos.y * depth * 6 : 0;
    const rotY = rotate ? mousePos.x * depth * 6 : 0;
    return {
      transform: `translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
      transformStyle: 'preserve-3d' as const,
      transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)'
    };
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* LAYER 1: Deep Navy Background */}
      <div className="absolute inset-0 bg-[#060a17]" />

      {/* LAYER 2: Radial Glow & Ambient Light */}
      <div
        className="absolute inset-0 opacity-60"
        style={parallax(0.15)}
      >
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/20 blur-[130px]" style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-950/40 blur-[140px]" style={{ animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div className="absolute top-[40%] left-[35%] w-[45vw] h-[35vw] rounded-full bg-indigo-950/25 blur-[120px]" />
      </div>

      {/* LAYER 3: 3D Technology Grid (Perspective Planes) */}
      <div
        className="absolute inset-0 opacity-20"
        style={parallax(0.3)}
      >
        {/* Floor 3D Grid */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[42vh] origin-bottom"
          style={{
            transform: 'rotateX(68deg)',
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 85%)'
          }}
        />

        {/* Ceiling 3D Grid */}
        <div
          className="absolute top-0 left-0 right-0 h-[30vh] origin-top"
          style={{
            transform: 'rotateX(-72deg)',
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '54px 54px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 80%)'
          }}
        />
      </div>

      {/* LAYER 4: Tech Circuit Lines with animated glowing nodes */}
      <div
        className="absolute inset-0 opacity-30"
        style={parallax(0.5)}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            <filter id="circuitGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Left Circuit Pattern */}
          <path
            d="M 30 180 L 120 180 L 170 230 L 170 420 L 220 470 L 220 620"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />
          <circle cx="30" cy="180" r="4" fill="#06b6d4" filter="url(#circuitGlow)" />
          <circle cx="170" cy="420" r="3" fill="#38bdf8" />
          <circle cx="220" cy="620" r="5" fill="#06b6d4" filter="url(#circuitGlow)" />

          {/* Right Circuit Pattern */}
          <path
            d="M 97% 120 L 88% 120 L 82% 180 L 82% 380 L 76% 440 L 76% 700"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="1.5"
            strokeDasharray="10 8"
          />
          <circle cx="97%" cy="120" r="4" fill="#06b6d4" filter="url(#circuitGlow)" />
          <circle cx="82%" cy="180" r="3" fill="#38bdf8" />
          <circle cx="76%" cy="700" r="5" fill="#06b6d4" filter="url(#circuitGlow)" />
        </svg>
      </div>

      {/* LAYER 5: Particle / Energy Dust */}
      <div
        className="absolute inset-0"
        style={parallax(0.7)}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-400 pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 3}px #22d3ee`,
              animation: reducedMotion ? 'none' : `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* LAYER 6: Floating 3D STEM Objects with 3D Tilt */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={parallax(1.0, true)}
      >
        {floatingObjects.map((obj, index) => (
          <div
            key={index}
            className="absolute transition-transform duration-300 pointer-events-none"
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              width: `${obj.size}px`,
              height: `${obj.size}px`,
              filter: `drop-shadow(0 8px 18px rgba(6, 182, 212, 0.35)) blur(${obj.depth < 0.7 ? '1px' : '0px'})`,
              animation: reducedMotion ? 'none' : `stemFloat ${4 + obj.delay * 1.5}s ease-in-out ${obj.delay}s infinite alternate`
            }}
          >
            {/* ATOM */}
            {obj.type === 'atom' && (
              <svg viewBox="0 0 64 64" className="w-full h-full animate-spin-slow opacity-75">
                <circle cx="32" cy="32" r="6" fill="#38bdf8" />
                <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#06b6d4" strokeWidth="2" transform="rotate(30 32 32)" strokeDasharray="3 2" />
                <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(90 32 32)" strokeDasharray="3 2" />
                <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#818cf8" strokeWidth="2" transform="rotate(150 32 32)" strokeDasharray="3 2" />
              </svg>
            )}

            {/* GEAR */}
            {obj.type === 'gear' && (
              <svg viewBox="0 0 64 64" className="w-full h-full animate-spin-very-slow opacity-60">
                <circle cx="32" cy="32" r="14" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="9 6" />
                <circle cx="32" cy="32" r="6" fill="#0284c7" />
              </svg>
            )}

            {/* PLANET */}
            {obj.type === 'planet' && (
              <svg viewBox="0 0 64 64" className="w-full h-full opacity-70">
                <defs>
                  <radialGradient id="planetGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0c4a6e" />
                  </radialGradient>
                </defs>
                <circle cx="32" cy="32" r="18" fill="url(#planetGrad)" />
                <ellipse cx="32" cy="32" rx="28" ry="8" fill="none" stroke="#38bdf8" strokeWidth="3" transform="rotate(-25 32 32)" opacity="0.85" />
              </svg>
            )}

            {/* PUZZLE PIECE */}
            {obj.type === 'puzzle' && (
              <div className="w-full h-full flex items-center justify-center text-3xl opacity-75 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] transform -rotate-12">
                🧩
              </div>
            )}

            {/* ROCKET */}
            {obj.type === 'rocket' && (
              <div className="w-full h-full flex items-center justify-center text-3xl opacity-80 drop-shadow-[0_6px_16px_rgba(56,189,248,0.6)] transform rotate-45">
                🚀
              </div>
            )}

            {/* FLASK */}
            {obj.type === 'flask' && (
              <div className="w-full h-full flex items-center justify-center text-3xl opacity-70 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]">
                🧪
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-16px) translateX(8px); }
          100% { transform: translateY(-30px) translateX(-6px); }
        }
        @keyframes stemFloat {
          0% { transform: translateY(-6px) rotate(-3deg); }
          100% { transform: translateY(6px) rotate(3deg); }
        }
        .animate-spin-slow {
          animation: spin 16s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin 32s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
