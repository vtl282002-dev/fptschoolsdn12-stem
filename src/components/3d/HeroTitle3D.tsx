import React, { useEffect, useRef } from 'react';

export const HeroTitle3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const leftPuzzleRef = useRef<HTMLDivElement>(null);
  const rightPuzzleRef = useRef<HTMLDivElement>(null);
  const leftSparkleRef = useRef<HTMLDivElement>(null);
  const rightSparkleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;

        const titleRotateX = -y * 1.2;
        const titleRotateY = x * 1.6;

        if (titleGroupRef.current) {
          titleGroupRef.current.style.transform = `rotateX(${titleRotateX.toFixed(2)}deg) rotateY(${titleRotateY.toFixed(2)}deg)`;
        }

        if (leftPuzzleRef.current) {
          const px = x * 14;
          const py = y * 10;
          leftPuzzleRef.current.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 45px) rotate(-14deg)`;
        }

        if (rightPuzzleRef.current) {
          const px = x * -16;
          const py = y * -12;
          rightPuzzleRef.current.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 50px) rotate(16deg)`;
        }

        if (leftSparkleRef.current) {
          leftSparkleRef.current.style.transform = `translate3d(${(x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 20px)`;
        }

        if (rightSparkleRef.current) {
          rightSparkleRef.current.style.transform = `translate3d(${(-x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 20px)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center text-center select-none mb-3 sm:mb-4 w-full max-w-4xl mx-auto px-2 pointer-events-none"
      style={{
        perspective: '1200px'
      }}
    >
      {/* ================= 10. ENERGY GLOW BEHIND ================= */}
      {/* Gold glow behind Line 1 */}
      <div
        className="absolute -top-4 w-[540px] max-w-[85vw] h-28 rounded-full pointer-events-none blur-3xl opacity-45 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(255, 179, 0, 0.75) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 75%)'
        }}
      />
      {/* Cyan glow behind Line 2 */}
      <div
        className="absolute top-12 w-[600px] max-w-[90vw] h-32 rounded-full pointer-events-none blur-3xl opacity-50 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.75) 0%, rgba(3, 105, 161, 0.35) 50%, transparent 75%)'
        }}
      />

      {/* ================= 5. BADGE: THỬ THÁCH STEM (Appears first) ================= */}
      <div
        className="relative z-20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-950/95 via-[#082860]/95 to-blue-950/95 border border-cyan-400 text-cyan-300 text-xs sm:text-sm font-extrabold tracking-widest uppercase mb-1.5 sm:mb-2 shadow-[0_0_18px_rgba(0,240,255,0.5),inset_0_1px_4px_rgba(255,255,255,0.4)] transition-transform animate-[fade-in_0.4s_ease-out]"
      >
        <span className="text-amber-300 text-xs animate-pulse">★</span>
        <span className="bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent font-black drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
          THỬ THÁCH STEM
        </span>
        <span className="text-amber-300 text-xs animate-pulse">★</span>
      </div>

      {/* ================= 7. GENTLE FLOAT & 9. PARALLAX CONTAINER ================= */}
      <div
        ref={titleGroupRef}
        className="relative z-10 flex flex-col items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'gentleTitleFloat 5s ease-in-out infinite'
        }}
      >
        {/* ================= 8. 3D DECORATIVE PUZZLE PIECES (Matching image.png) ================= */}
        {/* Left Cyan 3D Jigsaw Piece (Glossy Cyan Bevel with Glow) */}
        <div
          ref={leftPuzzleRef}
          className="absolute -left-10 sm:-left-16 md:-left-20 lg:-left-24 top-8 sm:top-10 z-20 pointer-events-none transition-transform duration-200 ease-out"
          style={{
            transform: 'translate3d(0px, 0px, 45px) rotate(-14deg)',
            filter: 'drop-shadow(0 14px 28px rgba(0, 240, 255, 0.65)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.85))'
          }}
        >
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 animate-[jigsawPulse_4s_ease-in-out_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="puzzleCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E0F7FA" />
                  <stop offset="25%" stopColor="#26C6DA" />
                  <stop offset="70%" stopColor="#0097A7" />
                  <stop offset="100%" stopColor="#006064" />
                </linearGradient>
                <linearGradient id="puzzleCyanSide" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00838F" />
                  <stop offset="100%" stopColor="#004D40" />
                </linearGradient>
              </defs>
              {/* 3D Extrusion Side (Bevel Thickness) */}
              <path
                d="M 20 25 L 45 25 C 45 13, 55 13, 55 25 L 80 25 L 80 50 C 92 50, 92 60, 80 60 L 80 85 L 55 85 C 55 97, 45 97, 45 85 L 20 85 L 20 60 C 8 60, 8 50, 20 50 Z"
                fill="url(#puzzleCyanSide)"
                transform="translate(0, 5)"
              />
              {/* Top Face */}
              <path
                d="M 20 20 L 45 20 C 45 8, 55 8, 55 20 L 80 20 L 80 45 C 92 45, 92 55, 80 55 L 80 80 L 55 80 C 55 92, 45 92, 45 80 L 20 80 L 20 55 C 8 55, 8 45, 20 45 Z"
                fill="url(#puzzleCyanGrad)"
                stroke="#B2EBF2"
                strokeWidth="2.5"
              />
              {/* Glossy Top Glare */}
              <path
                d="M 24 24 L 45 24 C 47 16, 53 16, 55 24 L 76 24 L 76 45 C 84 47, 84 53, 76 55"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 text-cyan-200 text-xs animate-ping">✦</span>
          </div>
        </div>

        {/* Right Gold 3D Jigsaw Piece (Glossy Amber Bevel with Glow) */}
        <div
          ref={rightPuzzleRef}
          className="absolute -right-10 sm:-right-16 md:-right-20 lg:-right-24 top-9 sm:top-11 z-20 pointer-events-none transition-transform duration-200 ease-out"
          style={{
            transform: 'translate3d(0px, 0px, 50px) rotate(16deg)',
            filter: 'drop-shadow(0 14px 28px rgba(255, 179, 0, 0.7)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.85))'
          }}
        >
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 animate-[jigsawPulse_4.5s_ease-in-out_infinite_reverse]">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="puzzleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9C4" />
                  <stop offset="25%" stopColor="#FFD54F" />
                  <stop offset="70%" stopColor="#FFA000" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>
                <linearGradient id="puzzleGoldSide" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C67100" />
                  <stop offset="100%" stopColor="#8C3B00" />
                </linearGradient>
              </defs>
              {/* 3D Extrusion Side (Bevel Thickness) */}
              <path
                d="M 20 25 L 80 25 L 80 50 C 68 50, 68 60, 80 60 L 80 85 L 55 85 C 55 97, 45 97, 45 85 L 20 85 L 20 60 C 32 60, 32 50, 20 50 Z"
                fill="url(#puzzleGoldSide)"
                transform="translate(0, 5)"
              />
              {/* Top Face */}
              <path
                d="M 20 20 L 80 20 L 80 45 C 68 45, 68 55, 80 55 L 80 80 L 55 80 C 55 92, 45 92, 45 80 L 20 80 L 20 45 C 32 45, 32 55, 20 55 Z"
                fill="url(#puzzleGoldGrad)"
                stroke="#FFFDE7"
                strokeWidth="2.5"
              />
              {/* Glossy Highlight Curve */}
              <path
                d="M 24 24 L 76 24 L 76 44 C 70 46, 70 52, 76 54"
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-1.5 -left-1.5 text-yellow-200 text-xs animate-ping">✦</span>
          </div>
        </div>

        {/* Ambient Sparkles */}
        <div
          ref={leftSparkleRef}
          className="absolute -top-3 left-1/4 opacity-75 pointer-events-none transition-transform duration-300"
          style={{ transform: 'translate3d(0px, 0px, 20px)' }}
        >
          <span className="text-yellow-300 text-sm animate-pulse">✦</span>
        </div>
        <div
          ref={rightSparkleRef}
          className="absolute -top-2 right-1/4 opacity-75 pointer-events-none transition-transform duration-300"
          style={{ transform: 'translate3d(0px, 0px, 20px)' }}
        >
          <span className="text-cyan-300 text-sm animate-pulse">✦</span>
        </div>

        {/* ================= 2. DÒNG 1: THỬ THÁCH KHUÔN MẶT (GOLD 3D) ================= */}
        <div
          className="relative inline-block tracking-tight text-center animate-[titleEntranceLine1_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          style={{
            fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Inter', sans-serif",
            lineHeight: 1.02
          }}
        >
          {/* Base Layer: Crisp Solid 3D Extrusion & Ambient Occlusion */}
          <h1
            className="font-black tracking-tight"
            style={{
              fontSize: 'clamp(36px, 4vw, 64px)',
              color: '#FFE082',
              textShadow: `
                0 1px 0 #FFD54F,
                0 2px 0 #FFCA28,
                0 3px 0 #FFA000,
                0 4px 0 #FF8F00,
                0 5px 0 #F57C00,
                0 6px 0 #E65100,
                0 7px 0 #C67100,
                0 8px 1px rgba(0,0,0,0.65),
                0 12px 18px rgba(0,0,0,0.75),
                0 0 32px rgba(255, 179, 0, 0.7)
              `
            }}
          >
            Thử thách khuôn mặt
          </h1>

          {/* Overlaid Glossy Gradient Face with Specular Highlight */}
          <div
            aria-hidden="true"
            className="absolute inset-0 font-black tracking-tight pointer-events-none select-none"
            style={{
              fontSize: 'clamp(36px, 4vw, 64px)',
              lineHeight: 1.02,
              backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9C4 20%, #FFD54F 50%, #FFA000 80%, #FF6F00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Thử thách khuôn mặt
          </div>

          {/* 6. Light Sweep reflection across Line 1 (Every 5s) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div
              className="w-full h-full animate-[lightSweepTitle_5s_ease-in-out_infinite]"
              style={{
                background: 'linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.5) 50%, transparent 65%)',
                mixBlendMode: 'overlay'
              }}
            />
          </div>
        </div>

        {/* ================= 3. DÒNG 2: GHÉP TRANH BÍ ẨN (CYAN/BLUE 3D) ================= */}
        <div
          className="relative inline-block tracking-tight text-center -mt-1 sm:-mt-1.5 animate-[titleEntranceLine2_0.6s_cubic-bezier(0.16,1,0.3,1)_0.12s_forwards] opacity-0"
          style={{
            fontFamily: "'Montserrat', 'Be Vietnam Pro', 'Inter', sans-serif",
            lineHeight: 1.02
          }}
        >
          {/* Base Layer: Crisp Solid 3D Extrusion & Ambient Occlusion */}
          <h2
            className="font-black tracking-tight"
            style={{
              fontSize: 'clamp(32px, 3.4vw, 56px)',
              color: '#E0F7FA',
              textShadow: `
                0 1px 0 #80DEEA,
                0 2px 0 #4DD0E1,
                0 3px 0 #26C6DA,
                0 4px 0 #00ACC1,
                0 5px 0 #0097A7,
                0 6px 0 #0284C7,
                0 7px 0 #0369A1,
                0 8px 1px rgba(0,0,0,0.65),
                0 12px 18px rgba(0,0,0,0.75),
                0 0 32px rgba(0, 240, 255, 0.8)
              `
            }}
          >
            Ghép tranh bí ẩn
          </h2>

          {/* Overlaid Glossy Gradient Face with Specular Highlight */}
          <div
            aria-hidden="true"
            className="absolute inset-0 font-black tracking-tight pointer-events-none select-none"
            style={{
              fontSize: 'clamp(32px, 3.4vw, 56px)',
              lineHeight: 1.02,
              backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #E0F7FA 20%, #80DEEA 45%, #00E5FF 75%, #0284C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ghép tranh bí ẩn
          </div>

          {/* 6. Light Sweep reflection across Line 2 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div
              className="w-full h-full animate-[lightSweepTitle_5s_ease-in-out_infinite_0.35s]"
              style={{
                background: 'linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.5) 50%, transparent 65%)',
                mixBlendMode: 'overlay'
              }}
            />
          </div>
        </div>

        {/* ================= 11. HOLOGRAPHIC ENERGY LINE (No slogan) ================= */}
        <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md mt-2 sm:mt-2.5">
          {/* Left pulse beam */}
          <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-cyan-300 opacity-70 shadow-[0_0_8px_#00F0FF]" />

          {/* Center Holographic Diamond Prism */}
          <div className="mx-2.5 flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rotate-45 border border-cyan-300 bg-cyan-950 shadow-[0_0_10px_#00F0FF] animate-pulse" />
            <div className="absolute w-1 h-1 rounded-full bg-yellow-300" />
          </div>

          {/* Right pulse beam */}
          <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-cyan-400 to-cyan-300 opacity-70 shadow-[0_0_8px_#00F0FF]" />
        </div>
      </div>
    </div>
  );
};
