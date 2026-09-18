import React from 'react';
import { Globe, FlaskConical } from 'lucide-react';

export const KienTaoFuturePanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. FLOATING HOLOGRAPHIC SLOGAN HUD SIGN (Image 1) */}
      <div className="mb-4 w-44 p-3 rounded-2xl bg-[#061e46]/85 border-2 border-cyan-400 shadow-[0_0_22px_rgba(0,240,255,0.45)] backdrop-blur-md text-left relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/20 blur-sm rounded-bl-xl" />

        <div className="flex flex-col gap-0.5 text-xs font-black text-cyan-200 tracking-wider drop-shadow-[0_0_8px_#00F0FF] leading-snug">
          <span>KIẾN TẠO</span>
          <span>TƯƠNG LAI</span>
          <span>TỪ NHỮNG</span>
          <span>Ý TƯỞNG</span>
          <span>HÔM NAY</span>
        </div>

        {/* Decorative cyber horizontal bar */}
        <div className="mt-2 h-0.5 w-12 bg-gradient-to-r from-cyan-400 to-transparent" />
      </div>

      {/* 2. 3D ROTATING EARTH GLOBE WITH ORBITAL RING (Image 1) */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-4">
        {/* Outer Orbital Ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/70 pointer-events-none"
          style={{
            transform: 'rotateX(72deg) rotateY(18deg)',
            boxShadow: '0 0 15px #00F0FF, inset 0 0 15px #00F0FF'
          }}
        />

        {/* Earth Globe Sphere */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-900 border border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.6),inset_0_0_12px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden relative">
          {/* Continent shapes simulation */}
          <div
            className="absolute inset-0 opacity-75"
            style={{
              backgroundImage: 'radial-gradient(circle at 35% 35%, #10B981 18%, transparent 22%), radial-gradient(circle at 70% 60%, #059669 22%, transparent 26%), radial-gradient(circle at 45% 75%, #34D399 15%, transparent 20%)',
              animation: 'spin 18s linear infinite'
            }}
          />
          {/* Atmosphere glow sheen */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-cyan-300/20 to-white/40 pointer-events-none" />
        </div>
      </div>

      {/* 3. CHEMISTRY FLASK / BEAKER WITH BUBBLING BLUE LIQUID (Image 1) */}
      <div className="relative w-24 h-24 flex items-center justify-center drop-shadow-[0_0_18px_rgba(0,240,255,0.5)]">
        <svg viewBox="0 0 80 90" className="w-20 h-22">
          {/* Beaker Glass Outline */}
          <path
            d="M 32 10 L 48 10 L 48 30 L 70 75 C 72 80, 68 84, 62 84 L 18 84 C 12 84, 8 80, 10 75 L 32 30 Z"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
          />
          {/* Beaker Lip */}
          <line x1="28" y1="10" x2="52" y2="10" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />

          {/* Glowing Blue Chemical Liquid */}
          <path
            d="M 23 48 Q 40 44 57 48 L 67 74 C 69 78, 66 82, 60 82 L 20 82 C 14 82, 11 78, 13 74 Z"
            fill="url(#liquidGrad)"
            opacity="0.85"
          />

          <defs>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Bubbles */}
          <circle cx="34" cy="65" r="2.5" fill="#E0F2FE" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="46" cy="55" r="2" fill="#E0F2FE" className="animate-ping" style={{ animationDuration: '1.6s' }} />
          <circle cx="40" cy="72" r="3" fill="#E0F2FE" className="animate-bounce" style={{ animationDuration: '2.4s' }} />
        </svg>

        {/* Outer Flask Glow */}
        <div className="absolute bottom-1 w-14 h-4 rounded-full bg-cyan-400/30 blur-sm pointer-events-none" />
      </div>
    </div>
  );
};
