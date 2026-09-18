import React from 'react';

export const StemRobotBookStack: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. FLOATING HOLOGRAPHIC STEM HUD SIGN (Image 1) */}
      <div className="mb-3 w-40 p-3 rounded-2xl bg-[#061e46]/85 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.45)] backdrop-blur-md text-left relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/20 blur-sm rounded-bl-xl" />

        <div className="text-base font-black text-cyan-300 tracking-wider mb-1 drop-shadow-[0_0_8px_#00F0FF]">
          STEM
        </div>

        <div className="space-y-1 text-xs font-bold text-cyan-100/90">
          <div className="flex items-center justify-between">
            <span>Science</span>
            <span className="text-cyan-400 font-mono">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Technology</span>
            <span className="text-cyan-400 font-mono">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Engineering</span>
            <span className="text-cyan-400 font-mono">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Mathematics</span>
            <span className="text-cyan-400 font-mono">—</span>
          </div>
        </div>
      </div>

      {/* 2. CUTE WHITE CHIBI ROBOT WITH WAVING ARM & STEM BADGE (Image 1) */}
      <div className="relative w-32 h-32 -mb-2 z-10 drop-shadow-[0_8px_20px_rgba(0,240,255,0.45)]">
        <svg viewBox="0 0 140 140" className="w-full h-full" fill="none">
          {/* Head Body */}
          <rect x="25" y="16" width="90" height="66" rx="33" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />

          {/* Cyan Glowing Visor Screen */}
          <rect x="36" y="24" width="68" height="48" rx="22" fill="#030C1E" stroke="#0284C7" strokeWidth="2" />

          {/* Happy Arched Eyes (^) (^) */}
          <path d="M 47 48 Q 55 36 63 48" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 77 48 Q 85 36 93 48" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Headset Ears */}
          <circle cx="20" cy="49" r="10" fill="#0284C7" stroke="#00F0FF" strokeWidth="2" />
          <circle cx="20" cy="49" r="5" fill="#00F0FF" />
          <circle cx="120" cy="49" r="10" fill="#0284C7" stroke="#00F0FF" strokeWidth="2" />
          <circle cx="120" cy="49" r="5" fill="#00F0FF" />

          {/* Head Antenna */}
          <line x1="70" y1="16" x2="70" y2="4" stroke="#94A3B8" strokeWidth="3" />
          <circle cx="70" cy="4" r="5" fill="#00F0FF" className="animate-pulse" />

          {/* Torso */}
          <path d="M 40 82 L 100 82 L 92 115 L 48 115 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />

          {/* STEM Colorful Badge on Chest (Image 1) */}
          <rect x="52" y="88" width="36" height="15" rx="5" fill="#0F172A" />
          <text x="56" y="99" fill="#F43F5E" fontSize="9" fontWeight="900">S</text>
          <text x="64" y="99" fill="#10B981" fontSize="9" fontWeight="900">T</text>
          <text x="71" y="99" fill="#38BDF8" fontSize="9" fontWeight="900">E</text>
          <text x="78" y="99" fill="#F59E0B" fontSize="9" fontWeight="900">M</text>

          {/* Waving Arm on Left (Image 1) */}
          <g style={{ transformOrigin: '28px 86px', animation: 'wave 2s ease-in-out infinite alternate' }}>
            <path d="M 38 86 C 22 84, 14 70, 10 56" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
            <circle cx="10" cy="54" r="6" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Right Arm resting */}
          <path d="M 100 88 C 112 94, 118 104, 115 112" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
          <circle cx="115" cy="112" r="5" fill="#0284C7" />
        </svg>
      </div>

      {/* 3. STACK OF 4 COLORFUL TEXTBOOKS (Image 1) */}
      <div className="flex flex-col items-center w-48 shadow-2xl relative z-0">
        {/* Book 1: SCIENCE (Red/Orange) */}
        <div
          className="w-full py-1.5 px-4 rounded-t-lg text-white font-black text-xs text-center border-b border-red-700 shadow-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 50%, #B91C1C 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.3)'
          }}
        >
          SCIENCE
        </div>

        {/* Book 2: TECHNOLOGY (Green) */}
        <div
          className="w-[104%] py-1.5 px-4 text-white font-black text-xs text-center border-b border-emerald-700 shadow-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #047857 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.3)'
          }}
        >
          TECHNOLOGY
        </div>

        {/* Book 3: ENGINEERING (Blue) */}
        <div
          className="w-[108%] py-1.5 px-4 text-white font-black text-xs text-center border-b border-blue-700 shadow-md flex items-center justify-center"
          style={{
            background: 'linear-gradient(90deg, #1D4ED8 0%, #2563EB 50%, #1E40AF 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.3)'
          }}
        >
          ENGINEERING
        </div>

        {/* Book 4: MATHEMATICS (Purple/Indigo) */}
        <div
          className="w-[112%] py-2 px-4 rounded-b-lg text-white font-black text-xs text-center shadow-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(90deg, #4338CA 0%, #6366F1 50%, #3730A3 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 5px 12px rgba(0,0,0,0.5)'
          }}
        >
          MATHEMATICS
        </div>
      </div>
    </div>
  );
};
