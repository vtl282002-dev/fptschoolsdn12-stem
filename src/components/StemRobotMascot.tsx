import React, { useState, useEffect, useRef } from 'react';

interface StemRobotMascotProps {
  size?: 'sm' | 'md' | 'lg';
  speechText?: string;
  mood?: 'happy' | 'thinking' | 'cheering' | 'scanner';
  className?: string;
  trackMouse?: boolean;
}

export const StemRobotMascot: React.FC<StemRobotMascotProps> = ({
  size = 'md',
  speechText,
  mood = 'happy',
  className = '',
  trackMouse = true
}) => {
  const sizeClasses = {
    sm: 'w-24 h-28',
    md: 'w-36 h-44',
    lg: 'w-48 h-56'
  };

  const robotRef = useRef<HTMLDivElement>(null);
  const [headRotation, setHeadRotation] = useState(0);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!trackMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate angle in degrees, clamped to -12deg to 12deg
      const angle = Math.max(-12, Math.min(12, deltaX / 35));
      setHeadRotation(angle);

      // Eye pupil offset
      const eyeX = Math.max(-5, Math.min(5, deltaX / 60));
      const eyeY = Math.max(-4, Math.min(4, deltaY / 60));
      setEyeOffset({ x: eyeX, y: eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trackMouse]);

  return (
    <div
      ref={robotRef}
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-300 ${className}`}
    >
      {/* Speech Bubble */}
      {speechText && (
        <div className="relative mb-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-950/95 via-slate-900/95 to-cyan-950/95 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.5)] backdrop-blur-md animate-bounce">
          <p className="text-xs sm:text-sm font-black text-cyan-200 tracking-wide text-center whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {speechText}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-cyan-950 border-r-2 border-b-2 border-cyan-400/80 rotate-45" />
        </div>
      )}

      {/* Robot SVG with Cyber Animations */}
      <div className={`relative ${sizeClasses[size]} drop-shadow-[0_10px_30px_rgba(6,182,212,0.45)]`}>
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B1528" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369A1" />
              <stop offset="50%" stopColor="#0C4A6E" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing Cyber Pedestal Base */}
          <g className="animate-pulse">
            <ellipse cx="100" cy="225" rx="75" ry="12" fill="url(#pedestalGrad)" stroke="#00F0FF" strokeWidth="2" opacity="0.8" />
            <ellipse cx="100" cy="225" rx="55" ry="7" fill="#00F0FF" opacity="0.4" filter="url(#glowFilter)" />
            <ellipse cx="100" cy="225" rx="35" ry="4" fill="#FFFFFF" opacity="0.6" />
          </g>

          {/* Floating Robot Group */}
          <g className="animate-[bounce_3.5s_ease-in-out_infinite]">
            {/* Left Arm (Waving) */}
            <g className="animate-[spin_4s_ease-in-out_infinite]" style={{ transformOrigin: '40px 145px' }}>
              <rect x="22" y="140" width="22" height="42" rx="11" fill="url(#bodyGrad)" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="33" cy="188" r="10" fill="#0284C7" stroke="#00F0FF" strokeWidth="2" />
            </g>

            {/* Right Arm */}
            <g>
              <rect x="156" y="140" width="22" height="42" rx="11" fill="url(#bodyGrad)" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="167" cy="188" r="10" fill="#0284C7" stroke="#00F0FF" strokeWidth="2" />
            </g>

            {/* Torso / Body */}
            <rect x="52" y="125" width="96" height="78" rx="36" fill="url(#bodyGrad)" stroke="#94A3B8" strokeWidth="2" />

            {/* STEM Badge on Chest */}
            <rect x="68" y="148" width="64" height="26" rx="13" fill="#0F172A" stroke="#00F0FF" strokeWidth="1.5" />
            <text
              x="100"
              y="166"
              fontFamily="'Arial Black', sans-serif"
              fontWeight="900"
              fontSize="14"
              letterSpacing="2"
              fill="url(#cyanGlowGrad)"
              textAnchor="middle"
              filter="url(#glowFilter)"
            >
              STEM
            </text>

            {/* Little glowing chest core */}
            <circle cx="100" cy="186" r="5" fill="#00F0FF" filter="url(#glowFilter)">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Head Neck Joint */}
            <rect x="88" y="112" width="24" height="18" rx="6" fill="#475569" />

            {/* Head Group with Mouse Cursor Tracking */}
            <g
              style={{
                transform: `rotate(${headRotation}deg)`,
                transformOrigin: '100px 75px',
                transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {/* Antenna on Top */}
              <line x1="100" y1="28" x2="100" y2="12" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="10" r="5" fill="#00F0FF" filter="url(#glowFilter)">
                <animate attributeName="r" values="4;6.5;4" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Ears / Headset Nodes with Glowing Rings */}
              <circle cx="32" cy="72" r="15" fill="#0369A1" stroke="#00F0FF" strokeWidth="2.5" />
              <circle cx="32" cy="72" r="8" fill="#00F0FF" opacity="0.8" filter="url(#glowFilter)" />
              <circle cx="168" cy="72" r="15" fill="#0369A1" stroke="#00F0FF" strokeWidth="2.5" />
              <circle cx="168" cy="72" r="8" fill="#00F0FF" opacity="0.8" filter="url(#glowFilter)" />

              {/* Head Chassis */}
              <rect x="40" y="28" width="120" height="90" rx="42" fill="url(#bodyGrad)" stroke="#94A3B8" strokeWidth="2.5" />

              {/* Shiny Glass Visor / Screen */}
              <rect x="50" y="38" width="100" height="70" rx="32" fill="url(#visorGrad)" stroke="#0284C7" strokeWidth="2" />

              {/* Visor Glass Reflection */}
              <path
                d="M 58 46 Q 100 38 142 46 Q 135 60 100 56 Q 65 52 58 46 Z"
                fill="#FFFFFF"
                opacity="0.18"
              />

              {/* Eyes with pupil offset following cursor */}
              <g
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                  transition: 'transform 0.08s ease-out'
                }}
              >
                {/* Glowing Eyes Based on Mood */}
                {mood === 'happy' && (
                  <g fill="#00F0FF" filter="url(#glowFilter)">
                    <path d="M 68 76 C 68 62, 86 62, 86 76" stroke="#00F0FF" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M 114 76 C 114 62, 132 62, 132 76" stroke="#00F0FF" strokeWidth="6" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {mood === 'cheering' && (
                  <g fill="#00F0FF" filter="url(#glowFilter)">
                    <polygon points="77,60 81,72 93,72 83,80 87,92 77,84 67,92 71,80 61,72 73,72" fill="#38BDF8" />
                    <polygon points="123,60 127,72 139,72 129,80 133,92 123,84 113,92 117,80 107,72 119,72" fill="#38BDF8" />
                  </g>
                )}

                {mood === 'scanner' && (
                  <g filter="url(#glowFilter)">
                    <circle cx="77" cy="74" r="10" stroke="#00F0FF" strokeWidth="3" fill="#082F49" />
                    <circle cx="77" cy="74" r="4" fill="#00F0FF" />
                    <circle cx="123" cy="74" r="10" stroke="#00F0FF" strokeWidth="3" fill="#082F49" />
                    <circle cx="123" cy="74" r="4" fill="#00F0FF" />
                    <line x1="58" y1="74" x2="142" y2="74" stroke="#F59E0B" strokeWidth="2" opacity="0.7">
                      <animate attributeName="y1" values="50;95;50" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="y2" values="50;95;50" dur="2s" repeatCount="indefinite" />
                    </line>
                  </g>
                )}

                {mood === 'thinking' && (
                  <g fill="#00F0FF" filter="url(#glowFilter)">
                    <ellipse cx="77" cy="68" rx="8" ry="11" fill="#00F0FF" />
                    <ellipse cx="123" cy="68" rx="8" ry="11" fill="#00F0FF" />
                    <circle cx="80" cy="65" r="3" fill="#FFFFFF" />
                    <circle cx="126" cy="65" r="3" fill="#FFFFFF" />
                  </g>
                )}

                {/* Cute Smile / Cheek Blush */}
                <circle cx="63" cy="88" r="5" fill="#38BDF8" opacity="0.4" filter="url(#glowFilter)" />
                <circle cx="137" cy="88" r="5" fill="#38BDF8" opacity="0.4" filter="url(#glowFilter)" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
