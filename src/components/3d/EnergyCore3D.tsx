import React, { useMemo } from 'react';

interface EnergyCore3DProps {
  score: number;
  requiredScore: number;
  maxScore?: number;
  isBursting?: boolean;
}

export const EnergyCore3D: React.FC<EnergyCore3DProps> = ({
  score,
  requiredScore,
  maxScore = 100,
  isBursting = false
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  const isCompleted = score >= requiredScore;

  // Visual energy tiers
  const energyTier = useMemo(() => {
    if (isCompleted || percent >= 100) return 'burst';
    if (percent >= 90) return 'critical';
    if (percent >= 70) return 'high';
    if (percent >= 30) return 'medium';
    return 'low';
  }, [percent, isCompleted]);

  // Stroke circle parameters
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Colors & Glow based on energy tier
  const glowStyle = useMemo(() => {
    switch (energyTier) {
      case 'burst':
        return 'shadow-[0_0_40px_rgba(34,211,238,0.9),0_0_70px_rgba(245,158,11,0.7)] border-cyan-300';
      case 'critical':
        return 'shadow-[0_0_30px_rgba(6,182,212,0.8)] border-cyan-400 animate-pulse';
      case 'high':
        return 'shadow-[0_0_22px_rgba(6,182,212,0.6)] border-cyan-500';
      case 'medium':
        return 'shadow-[0_0_15px_rgba(6,182,212,0.4)] border-cyan-600/70';
      default:
        return 'shadow-[0_0_10px_rgba(6,182,212,0.2)] border-slate-700';
    }
  }, [energyTier]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 3D Core Container */}
      <div className={`relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-300 ${glowStyle}`}>
        {/* SVG Concentric Rings */}
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <defs>
            {/* Linear Progress Gradient */}
            <linearGradient id="coreProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor={isCompleted ? '#f59e0b' : '#22d3ee'} />
            </linearGradient>

            {/* Core Radial Atmosphere */}
            <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Backdrop Disc */}
          <circle cx="80" cy="80" r="68" fill="url(#coreAura)" />

          {/* RING 1: Background Track */}
          <circle
            cx="80"
            cy="80"
            r={normalizedRadius}
            stroke="#1e293b"
            strokeWidth={stroke}
            fill="transparent"
          />

          {/* RING 1: Active Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={normalizedRadius}
            stroke="url(#coreProgressGrad)"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.18s ease-out' }}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#ringGlow)"
          />

          {/* RING 2: Rotating Technology Ring with tick marks (Outer) */}
          <circle
            cx="80"
            cy="80"
            r="75"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            strokeOpacity="0.45"
            fill="transparent"
            className="animate-spin-clockwise"
          />

          {/* RING 3: Particle / Notch Technology Ring (Inner) */}
          <circle
            cx="80"
            cy="80"
            r="54"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="2 12"
            strokeOpacity="0.5"
            fill="transparent"
            className="animate-spin-counter"
          />
        </svg>

        {/* Orbiting Energy Spark / Light Streak along ring */}
        {percent > 0 && (
          <div
            className="absolute w-full h-full pointer-events-none"
            style={{
              transform: `rotate(${(percent / 100) * 360 - 90}deg)`,
              transition: 'transform 0.18s ease-out'
            }}
          >
            <div
              className="absolute top-1 left-1/2 -ml-2.5 w-5 h-5 rounded-full bg-white blur-[1px] shadow-[0_0_12px_#38bdf8,0_0_24px_#22d3ee] flex items-center justify-center"
              style={{ animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-200" />
            </div>
          </div>
        )}

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className={`font-black text-4xl tracking-tighter leading-none transition-all duration-200 ${
              isCompleted
                ? 'text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.8)] scale-110'
                : percent >= 70
                ? 'text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                : 'text-slate-100'
            }`}
          >
            {Math.round(score)}
          </span>
          <span className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider">
            /{maxScore}
          </span>
        </div>

        {/* Energy Burst Flash Overlay */}
        {(isBursting || isCompleted) && (
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md animate-ping pointer-events-none" />
        )}
      </div>

      <style>{`
        .animate-spin-clockwise {
          animation: spinClockwise 24s linear infinite;
          transform-origin: center;
        }
        .animate-spin-counter {
          animation: spinCounter 16s linear infinite;
          transform-origin: center;
        }
        @keyframes spinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinCounter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};
