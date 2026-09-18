import React from 'react';

interface StemRobotMascotProps {
  speechText?: string;
  badgeSubtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StemRobotMascot: React.FC<StemRobotMascotProps> = ({
  speechText,
  badgeSubtitle = 'CÔNG NGHỆ KIẾN TẠO TƯƠNG LAI',
  size = 'md',
  className = ''
}) => {
  const scaleClass = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-110' : 'scale-100';

  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${scaleClass} ${className}`}>
      {/* Speech Bubble if present */}
      {speechText && (
        <div className="mb-2 relative z-20" style={{ animation: 'bounce 3s infinite' }}>
          <div className="bg-gradient-to-r from-cyan-900/90 to-blue-900/90 border border-cyan-400/60 text-cyan-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-[0_0_18px_rgba(6,182,212,0.45)] backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {speechText}
          </div>
          {/* Bubble Tail */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-500/80 mx-auto" />
        </div>
      )}

      {/* 3D Robot Figure */}
      <div className="relative w-36 h-40 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(6,182,212,0.4)] animate-float-slow">
        <svg viewBox="0 0 160 180" className="w-full h-full">
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="blueAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#091833" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>

            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Antenna with glowing beacon */}
          <line x1="80" y1="36" x2="80" y2="12" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="10" r="7" fill="url(#blueAccent)" filter="url(#cyanGlow)" />
          <circle cx="80" cy="10" r="3" fill="#ffffff" />

          {/* Earphones / Side Accents */}
          <rect x="14" y="52" width="12" height="28" rx="6" fill="url(#blueAccent)" />
          <ellipse cx="20" cy="66" rx="3" ry="8" fill="#38bdf8" filter="url(#cyanGlow)" />
          <rect x="134" y="52" width="12" height="28" rx="6" fill="url(#blueAccent)" />
          <ellipse cx="140" cy="66" rx="3" ry="8" fill="#38bdf8" filter="url(#cyanGlow)" />

          {/* Head */}
          <rect x="24" y="32" width="112" height="74" rx="34" fill="url(#bodyGrad)" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Face Screen */}
          <rect x="36" y="44" width="88" height="52" rx="22" fill="url(#screenGrad)" stroke="#0ea5e9" strokeWidth="1.5" />

          {/* Cheerful Digital Eyes (Happy Smiling Arcs) */}
          <g filter="url(#cyanGlow)">
            {/* Left Eye: Happy Arc */}
            <path
              d="M 52 70 Q 60 54 68 70"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Right Eye: Happy Arc */}
            <path
              d="M 92 70 Q 100 54 108 70"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Subtle Rosy Cheeks */}
            <ellipse cx="48" cy="80" rx="4" ry="2" fill="#38bdf8" opacity="0.6" />
            <ellipse cx="112" cy="80" rx="4" ry="2" fill="#38bdf8" opacity="0.6" />
          </g>

          {/* Neck Joint */}
          <rect x="70" y="104" width="20" height="8" rx="4" fill="#64748b" />

          {/* Robot Body */}
          <rect x="44" y="110" width="72" height="52" rx="24" fill="url(#bodyGrad)" stroke="#38bdf8" strokeWidth="2" />

          {/* Chest Badge with STEM text */}
          <rect x="56" y="122" width="48" height="22" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text
            x="80"
            y="138"
            fill="#38bdf8"
            fontSize="12"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="1.5"
            textAnchor="middle"
            filter="url(#cyanGlow)"
          >
            STEM
          </text>

          {/* Left Hand (Waving / Resting) */}
          <g transform="rotate(-15 38 122)">
            <rect x="22" y="116" width="16" height="34" rx="8" fill="url(#bodyGrad)" />
            <circle cx="30" cy="154" r="8" fill="url(#blueAccent)" />
          </g>

          {/* Right Hand (Thumbs Up / Cheering) */}
          <g transform="rotate(25 122 122)">
            <rect x="122" y="112" width="16" height="34" rx="8" fill="url(#bodyGrad)" />
            <circle cx="130" cy="150" r="8" fill="url(#blueAccent)" />
            {/* Thumb */}
            <rect x="134" y="142" width="8" height="12" rx="4" fill="#38bdf8" />
          </g>
        </svg>
      </div>

      {/* 3D Glowing Cyber Pedestal (Base Platform) */}
      <div className="relative w-44 h-12 -mt-4 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 bg-gradient-to-b from-cyan-950/80 to-slate-950/90 shadow-[0_0_24px_rgba(6,182,212,0.4)] transform rotate-x-60" />
        {/* Core Glowing Disk */}
        <div className="absolute inset-2 rounded-full bg-cyan-500/20 blur-sm transform rotate-x-60" />
        {/* Concentric Tech Line */}
        <div className="absolute inset-4 rounded-full border border-cyan-300/30 transform rotate-x-60" />
      </div>

      {/* Futuristic Banner Plaque */}
      {badgeSubtitle && (
        <div className="mt-1 px-3 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase whitespace-nowrap">
          {badgeSubtitle}
        </div>
      )}

      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(-4px); }
          100% { transform: translateY(4px); }
        }
        .animate-float-slow {
          animation: floatSlow 3.2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};
