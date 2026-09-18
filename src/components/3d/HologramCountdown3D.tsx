import React from 'react';

interface HologramCountdown3DProps {
  count: number | null; // 3, 2, 1, or 0 (0 = BẮT ĐẦU!)
}

export const HologramCountdown3D: React.FC<HologramCountdown3DProps> = ({ count }) => {
  if (count === null) return null;

  const isStart = count === 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 select-none overflow-hidden">
      {/* Background Hologram Rings & Waves */}
      <div className="relative flex items-center justify-center">
        {/* Shockwave expanding circle */}
        <div
          key={`shockwave-${count}`}
          className="absolute w-48 h-48 rounded-full border-2 border-cyan-300 animate-hologram-wave opacity-0"
        />
        <div
          key={`shockwave-inner-${count}`}
          className="absolute w-32 h-32 rounded-full border border-blue-400 opacity-0"
          style={{ animation: 'hologramWave 0.8s ease-out 0.1s forwards' }}
        />

        {/* 3D Holographic Cylinder Base Light */}
        <div className="absolute -bottom-16 w-56 h-14 rounded-full bg-cyan-500/25 blur-xl transform rotate-x-60" />

        {/* Rotating Tech Reticle */}
        <div className="absolute w-64 h-64 rounded-full border border-dashed border-cyan-400/40" style={{ animation: 'spin 6s linear infinite' }} />
        <div className="absolute w-52 h-52 rounded-full border border-cyan-300/30" style={{ animation: 'spin 4s linear infinite reverse' }} />

        {/* Central 3D Text Display */}
        <div
          key={`text-${count}`}
          className="relative z-10 flex items-center justify-center animate-hologram-pop"
        >
          {isStart ? (
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-pulse">
                BẮT ĐẦU!
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-300 mt-1 uppercase">
                AI SCANNING ACTIVATED
              </span>
            </div>
          ) : (
            <div className="relative">
              <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.95)]">
                {count}
              </span>
              {/* Secondary 3D depth shadow */}
              <span
                className="absolute inset-0 text-8xl sm:text-9xl font-black text-cyan-600/30 blur-sm pointer-events-none -z-10"
                style={{ transform: 'translate(4px, 4px)' }}
              >
                {count}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes hologramPop {
          0% {
            opacity: 0;
            transform: scale(1.7) rotateY(15deg) translateZ(50px);
            filter: blur(8px) brightness(2);
          }
          60% {
            opacity: 1;
            transform: scale(0.95) rotateY(-4deg) translateZ(0);
            filter: blur(0px) brightness(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateY(0deg) translateZ(0);
            filter: blur(0px) brightness(1);
          }
        }
        @keyframes hologramWave {
          0% {
            transform: scale(0.4);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .animate-hologram-pop {
          animation: hologramPop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
        }
        .animate-hologram-wave {
          animation: hologramWave 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
