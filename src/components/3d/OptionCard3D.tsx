import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { audioManager } from '../../services/AudioManager';

interface OptionCard3DProps {
  optKey: 'A' | 'B' | 'C' | 'D';
  optText: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  isDisabled: boolean;
  onSelect: (key: 'A' | 'B' | 'C' | 'D') => void;
  onConfirm?: () => void;
  resultState: 'answering' | 'correct' | 'wrong';
}

export const OptionCard3D: React.FC<OptionCard3DProps> = ({
  optKey,
  optText,
  isSelected,
  isCorrect,
  isDisabled,
  onSelect,
  onConfirm,
  resultState
}) => {
  // Key badge color themes for A, B, C, D
  const badgeThemes = {
    A: {
      border: 'border-cyan-400',
      bg: 'bg-cyan-950/90',
      text: 'text-cyan-300',
      glow: '#06b6d4',
      ring: 'ring-cyan-400/40',
      highlight: 'from-cyan-500/25 via-blue-600/10 to-transparent'
    },
    B: {
      border: 'border-sky-400',
      bg: 'bg-sky-950/90',
      text: 'text-sky-300',
      glow: '#38bdf8',
      ring: 'ring-sky-400/40',
      highlight: 'from-sky-500/25 via-indigo-600/10 to-transparent'
    },
    C: {
      border: 'border-amber-400',
      bg: 'bg-amber-950/90',
      text: 'text-amber-300',
      glow: '#f59e0b',
      ring: 'ring-amber-400/40',
      highlight: 'from-amber-500/25 via-yellow-600/10 to-transparent'
    },
    D: {
      border: 'border-purple-400',
      bg: 'bg-purple-950/90',
      text: 'text-purple-300',
      glow: '#c084fc',
      ring: 'ring-purple-400/40',
      highlight: 'from-purple-500/25 via-pink-600/10 to-transparent'
    }
  };

  const theme = badgeThemes[optKey];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    onSelect(optKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    onSelect(optKey);
    if (onConfirm) {
      onConfirm();
    }
  };

  // State-specific styling
  let containerStyle =
    'bg-gradient-to-r from-slate-900/95 via-slate-850/90 to-slate-900/95 border-slate-700/80 text-slate-100 hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(6,182,212,0.35)] hover:-translate-y-1 shadow-[0_6px_0_#0f172a] active:translate-y-0.5 active:shadow-[0_2px_0_#0f172a]';

  if (resultState === 'answering') {
    if (isSelected) {
      containerStyle =
        'bg-gradient-to-r from-amber-950/98 via-yellow-950/95 to-amber-950/98 border-amber-300 text-amber-50 shadow-[0_0_40px_rgba(245,158,11,0.7),0_8px_0_#78350f] -translate-y-1 ring-4 ring-amber-400/50';
    }
  } else if (resultState === 'correct') {
    if (isCorrect) {
      containerStyle =
        'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-emerald-300 text-emerald-50 shadow-[0_0_45px_rgba(16,185,129,0.8),0_8px_0_#064e3b] -translate-y-1 ring-4 ring-emerald-400';
    } else {
      containerStyle = 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-30 shadow-none';
    }
  } else if (resultState === 'wrong') {
    if (isSelected) {
      containerStyle =
        'bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-red-400 text-red-50 shadow-[0_0_45px_rgba(239,68,68,0.8),0_8px_0_#7f1d1d] animate-spring-shake ring-4 ring-red-500';
    } else if (isCorrect) {
      containerStyle =
        'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.5)]';
    } else {
      containerStyle = 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-30 shadow-none';
    }
  }

  return (
    <button
      type="button"
      id={`option-card-${optKey}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      disabled={isDisabled}
      onMouseEnter={() => {
        if (!isDisabled) audioManager.playHover?.();
      }}
      className={`group relative w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl border-2 text-left font-bold flex items-center justify-between gap-3 sm:gap-4 cursor-pointer disabled:cursor-default min-h-[64px] sm:min-h-[70px] overflow-hidden select-none transition-all duration-200 z-20 ${containerStyle}`}
    >
      {/* Dynamic Glow Accent when Selected */}
      {isSelected && resultState === 'answering' && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 pointer-events-none animate-pulse" />
      )}

      {/* Cyber circuitry watermark decoration */}
      <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 pointer-events-none select-none w-28 h-28 transform translate-x-4 translate-y-4 transition-opacity">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-cyan-300" fill="none" strokeWidth="2">
          <path d="M 10 90 L 50 90 L 70 70 L 90 70" />
          <circle cx="90" cy="70" r="4" fill="#06b6d4" />
          <path d="M 30 90 L 50 70 L 80 70" />
        </svg>
      </div>

      {/* Holographic light sweep effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
        <div className="w-[120%] h-[200%] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -rotate-45 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {/* Left Area: 3D Key Badge (A, B, C, D) + Option Text */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 z-20">
        {/* 3D Key Badge (A, B, C, D) */}
        <div
          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md border-2 ${
            isSelected
              ? 'bg-gradient-to-b from-[#FFE57F] via-[#FFC107] to-[#FF8F00] text-slate-950 border-[#FFE082] shadow-[0_0_20px_#FFC107]'
              : `${theme.bg} ${theme.border} ${theme.text}`
          }`}
          style={{
            boxShadow: isSelected
              ? '0 0 20px #FFC107, inset 0 2px 4px rgba(255,255,255,0.7)'
              : `0 0 12px ${theme.glow}45, inset 0 1px 3px rgba(255,255,255,0.25)`
          }}
        >
          <span>{optKey}</span>
          {/* Subtle top glare reflection */}
          <span className="absolute top-1 left-1.5 right-1.5 h-1/3 rounded-full bg-white/35 pointer-events-none" />
        </div>

        {/* Option Text (17-19px, bold, high contrast) */}
        <div className="flex-1 min-w-0 pr-1">
          <span className="text-[16px] sm:text-[18px] leading-snug font-bold tracking-tight text-slate-100 group-hover:text-white transition-colors block drop-shadow-sm">
            {optText}
          </span>
        </div>
      </div>

      {/* Right State Icon / Radio Indicator Badge */}
      <div className="z-20 shrink-0 flex items-center justify-center pl-1">
        {resultState === 'answering' && (
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all border-2 ${
              isSelected
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_#f59e0b] scale-105'
                : 'bg-slate-950/80 border-slate-700/80 text-transparent group-hover:border-cyan-400/70'
            }`}
          >
            {isSelected ? (
              <Check className="w-4 h-4 stroke-[3.5]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
            )}
          </div>
        )}

        {resultState === 'correct' && isCorrect && (
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_#10b981] animate-bounce border-2 border-emerald-200">
            <Check className="w-5 h-5 stroke-[3.5]" />
          </span>
        )}

        {resultState === 'wrong' && isSelected && (
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_#ef4444] animate-spring-shake border-2 border-red-300">
            <X className="w-5 h-5 stroke-[3.5]" />
          </span>
        )}
      </div>
    </button>
  );
};

