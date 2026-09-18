import React, { useState } from 'react';
import { Search, Brain, Lightbulb, Cog, ChevronRight, Sparkles, Globe, FlaskConical } from 'lucide-react';
import { audioManager } from '../../services/AudioManager';

interface HoloCyberConsole3DProps {
  className?: string;
}

export const HoloCyberConsole3D: React.FC<HoloCyberConsole3DProps> = ({ className = '' }) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const skills = [
    {
      id: 'quan-sat',
      title: 'QUAN SÁT',
      subtitle: 'Nhận biết đặc điểm',
      icon: <Search className="w-5 h-5 text-white" />,
      gradient: 'linear-gradient(135deg, #0066FF 0%, #0088FF 45%, #00B4D8 100%)',
      borderColor: 'rgba(56, 189, 248, 0.85)',
      glowColor: 'rgba(0, 136, 255, 0.55)',
      shadowDeep: '#0047AB',
      tag: 'Cảm biến camera AI'
    },
    {
      id: 'logic',
      title: 'TƯ DUY LOGIC',
      subtitle: 'Phân tích và suy luận',
      icon: <Brain className="w-5 h-5 text-white" />,
      gradient: 'linear-gradient(135deg, #7928CA 0%, #9333EA 50%, #A855F7 100%)',
      borderColor: 'rgba(192, 132, 252, 0.85)',
      glowColor: 'rgba(147, 51, 234, 0.55)',
      shadowDeep: '#581C87',
      tag: 'Phân tích biểu cảm'
    },
    {
      id: 'sang-tao',
      title: 'SÁNG TẠO',
      subtitle: 'Đưa ra ý tưởng mới',
      icon: <Lightbulb className="w-5 h-5 text-white" />,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EA580C 100%)',
      borderColor: 'rgba(252, 211, 77, 0.85)',
      glowColor: 'rgba(245, 158, 11, 0.55)',
      shadowDeep: '#9A3412',
      tag: 'Khám phá bí ẩn'
    },
    {
      id: 'thuc-hanh',
      title: 'THỰC HÀNH',
      subtitle: 'Áp dụng kiến thức',
      icon: <Cog className="w-5 h-5 text-white" />,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
      borderColor: 'rgba(110, 231, 183, 0.85)',
      glowColor: 'rgba(16, 185, 129, 0.55)',
      shadowDeep: '#064E3B',
      tag: 'Ghép tranh tương tác'
    }
  ];

  const handleCardClick = (skillId: string) => {
    audioManager.playClick();
    setActiveSkill((prev) => (prev === skillId ? null : skillId));
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. TOP 3D HOLOGRAPHIC PROJECTION PLATFORM & BOY FACE (Image 1) */}
      <div className="relative w-72 h-64 flex flex-col items-center justify-end">
        {/* Holographic light cone / cylinder projection beam */}
        <div
          className="absolute inset-x-8 bottom-4 top-2 pointer-events-none opacity-40 blur-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 240, 255, 0.35) 85%, rgba(0, 240, 255, 0.7) 100%)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
          }}
        />

        {/* HUD Target Reticle Rings rotating around Boy Face */}
        <div
          className="absolute top-4 w-44 h-44 rounded-full border border-dashed border-cyan-400/50 pointer-events-none"
          style={{ animation: 'spin 12s linear infinite' }}
        />
        <div
          className="absolute top-7 w-38 h-38 rounded-full border border-cyan-300/30 pointer-events-none"
          style={{ animation: 'spin 8s linear infinite reverse' }}
        />

        {/* 4 Corner HUD targeting brackets: [   ] */}
        <div className="absolute top-2 left-10 w-4 h-4 border-t-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute top-2 right-10 w-4 h-4 border-t-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-16 left-10 w-4 h-4 border-b-2 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-16 right-10 w-4 h-4 border-b-2 border-r-2 border-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />

        {/* 3D Hologram Anime Boy Face */}
        <div className="relative z-10 w-36 h-40 flex flex-col items-center justify-center drop-shadow-[0_0_20px_rgba(0,240,255,0.75)]">
          <svg viewBox="0 0 120 130" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE0D3" />
                <stop offset="100%" stopColor="#FDC5B2" />
              </linearGradient>
              <linearGradient id="visorGlass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                <stop offset="50%" stopColor="rgba(0, 240, 255, 0.2)" />
                <stop offset="100%" stopColor="rgba(3, 105, 161, 0.5)" />
              </linearGradient>
              <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#090D16" />
              </linearGradient>
            </defs>

            {/* Back Hair */}
            <path
              d="M 22 55 C 18 20, 102 20, 98 55 C 92 32, 70 28, 60 38 C 50 28, 28 32, 22 55 Z"
              fill="url(#hairGrad)"
            />

            {/* Face Shape */}
            <path
              d="M 30 45 C 30 78, 42 104, 60 104 C 78 104, 90 78, 90 45 C 80 42, 40 42, 30 45 Z"
              fill="url(#skinGrad)"
            />

            {/* Front Hair Bangs with Cyber Highlight */}
            <path
              d="M 26 42 C 34 32, 48 30, 54 38 C 60 30, 78 28, 94 40 C 90 32, 75 22, 60 22 C 42 22, 30 30, 26 42 Z"
              fill="#1E293B"
            />
            {/* Hair gloss stroke */}
            <path
              d="M 40 28 Q 50 24 64 28"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Glowing Cyber Glasses / Smart Visor (Image 1) */}
            <rect
              x="25"
              y="44"
              width="70"
              height="26"
              rx="12"
              fill="url(#visorGlass)"
              stroke="#00F0FF"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_#00F0FF]"
            />
            {/* Visor bridge */}
            <path d="M 57 52 L 63 52" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />

            {/* Specular reflex on visor */}
            <path
              d="M 30 48 L 44 48 L 38 66 L 28 66 Z"
              fill="rgba(255, 255, 255, 0.45)"
            />
            <path
              d="M 48 48 L 54 48 L 50 66 L 44 66 Z"
              fill="rgba(255, 255, 255, 0.25)"
            />

            {/* Friendly Anime Eyes behind visor with highlights */}
            <ellipse cx="44" cy="57" rx="5" ry="6.5" fill="#0F172A" />
            <circle cx="46" cy="54" r="2.2" fill="#FFFFFF" />
            <circle cx="43" cy="59" r="1.1" fill="#38BDF8" />

            <ellipse cx="76" cy="57" rx="5" ry="6.5" fill="#0F172A" />
            <circle cx="78" cy="54" r="2.2" fill="#FFFFFF" />
            <circle cx="75" cy="59" r="1.1" fill="#38BDF8" />

            {/* Cute Rosy Blushing Cheeks (Image 1) */}
            <circle cx="34" cy="74" r="5" fill="#F43F5E" opacity="0.65" />
            <circle cx="86" cy="74" r="5" fill="#F43F5E" opacity="0.65" />

            {/* Cheerful Red Smiling Mouth (Image 1) */}
            <path
              d="M 52 82 Q 60 92 68 82"
              stroke="#E11D48"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cyber Nose dot */}
            <circle cx="60" cy="72" r="1.5" fill="#FB7185" />
          </svg>

          {/* Sweeping Laser Scanner Beam across face */}
          <div
            className="absolute left-2 right-2 h-0.5 bg-cyan-300 shadow-[0_0_12px_#00f0ff] pointer-events-none opacity-80"
            style={{ animation: 'laserScan 2.5s ease-in-out infinite alternate' }}
          />
        </div>

        {/* 3D Holographic Cylinder Base Platform (Image 1) */}
        <div className="relative w-56 h-10 flex items-center justify-center">
          {/* Base Rim */}
          <div
            className="w-full h-full rounded-full border-2 border-cyan-400 bg-gradient-to-b from-[#00F0FF]/30 via-slate-900 to-[#020b1c] shadow-[0_0_25px_rgba(0,240,255,0.7),inset_0_2px_8px_rgba(255,255,255,0.4)] flex items-center justify-center"
          >
            <div className="w-48 h-6 rounded-full border border-cyan-300/60 bg-cyan-500/20 shadow-inner flex items-center justify-center">
              <div className="w-36 h-3 rounded-full bg-cyan-400 blur-[2px] opacity-70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE CYBER PODIUM WITH 4 GLOWING BUTTONS (Image 1) */}
      <div
        className="relative w-80 sm:w-88 rounded-[32px] p-3 sm:p-4 bg-gradient-to-b from-slate-900/95 via-[#071329]/98 to-[#030914] border-2 border-cyan-400/80 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,240,255,0.35)] -mt-4 z-20 flex flex-col items-center"
      >
        {/* Top 4 Yellow Status LED Indicator Lights (Image 1) */}
        <div className="flex items-center gap-4 py-1.5 mb-2">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]"
              style={{ animation: `pulse 1.8s ease-in-out ${idx * 0.25}s infinite` }}
            />
          ))}
        </div>

        {/* 4 STACKED 3D ACTION BUTTONS (Image 1) */}
        <div className="w-full space-y-2.5">
          {skills.map((skill) => {
            const isSelected = activeSkill === skill.id;
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleCardClick(skill.id)}
                className={`
                  group relative w-full flex items-center justify-between px-3.5 py-3 rounded-2xl
                  border-2 text-left cursor-pointer transition-all duration-200 outline-none
                  transform hover:-translate-y-0.5 active:translate-y-1
                `}
                style={{
                  background: skill.gradient,
                  borderColor: skill.borderColor,
                  boxShadow: isSelected
                    ? `0 2px 0 ${skill.shadowDeep}, 0 0 28px ${skill.glowColor}, inset 0 2px 4px rgba(255,255,255,0.7)`
                    : `0 5px 0 ${skill.shadowDeep}, 0 8px 18px ${skill.glowColor}, inset 0 2px 4px rgba(255,255,255,0.4)`
                }}
              >
                {/* Top glossy reflex line */}
                <span className="absolute top-1 left-4 right-4 h-2 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                {/* Left: Square Icon Badge */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/40 backdrop-blur-sm shadow-inner flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {skill.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-black text-white tracking-wide drop-shadow-sm leading-tight">
                      {skill.title}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-white/90 leading-tight">
                      {skill.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right: Chevron Arrow */}
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Mini Active Skill Description Pill */}
        {activeSkill && (
          <div className="mt-3 w-full p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-400/50 text-center animate-in fade-in zoom-in-95 duration-150">
            <span className="text-xs font-bold text-cyan-200">
              💡 {skills.find((s) => s.id === activeSkill)?.tag}
            </span>
          </div>
        )}
      </div>

      {/* 3. FLOOR PLATFORM WITH CONCENTRIC BLUE NEON RINGS & FOOTER BADGE (Image 1) */}
      <div className="relative w-full max-w-sm mt-3 flex flex-col items-center">
        {/* Floor Neon Oval Rings */}
        <div className="w-72 h-8 rounded-full border border-cyan-400/60 shadow-[0_0_20px_#00F0FF] opacity-75" />
        <div className="w-56 h-5 rounded-full border border-cyan-300/40 -mt-6 opacity-60" />

        {/* Slogan Pill Badge (Image 1: — STEM • KHÁM PHÁ • SÁNG TẠO • VƯƠN XA —) */}
        <div className="mt-2 px-4 py-1 rounded-full bg-slate-900/80 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
          <span className="text-cyan-400">—</span>
          <span>STEM</span>
          <span className="text-cyan-400">•</span>
          <span>KHÁM PHÁ</span>
          <span className="text-cyan-400">•</span>
          <span>SÁNG TẠO</span>
          <span className="text-cyan-400">•</span>
          <span>VƯƠN XA</span>
          <span className="text-cyan-400">—</span>
        </div>
      </div>
    </div>
  );
};
