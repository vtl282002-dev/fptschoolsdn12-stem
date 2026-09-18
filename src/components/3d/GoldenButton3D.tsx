import React from 'react';

interface GoldenButton3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GoldenButton3D: React.FC<GoldenButton3DProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  size = 'md',
  icon
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-5 py-2.5 text-sm'
      : size === 'lg'
      ? 'px-9 py-4 text-lg sm:text-xl font-black'
      : 'px-7 py-3 text-base sm:text-lg font-extrabold';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2.5 rounded-full
        text-slate-950 uppercase tracking-wider select-none outline-none cursor-pointer
        transition-all duration-150 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses}
        ${className}
      `}
      style={{
        // 3D physics side depth & shadow
        background: 'linear-gradient(180deg, #fef08a 0%, #facc15 25%, #eab308 65%, #ca8a04 100%)',
        boxShadow: disabled
          ? 'none'
          : '0 6px 0 #854d0e, 0 10px 20px rgba(202, 138, 4, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.7)'
      }}
    >
      {/* Light sweep beam traversing surface every 3.5s */}
      <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <span
          className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent transform -rotate-45 animate-light-sweep"
        />
      </span>

      {/* Top Gloss Highlight */}
      <span className="absolute top-1 left-3 right-3 h-1/3 rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

      {/* Button Icon if present */}
      {icon && (
        <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      )}

      {/* Button Content */}
      <span className="relative z-10 font-black tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
        {children}
      </span>

      <style>{`
        @keyframes lightSweep {
          0% {
            transform: translateX(-150%) rotate(25deg);
          }
          30%, 100% {
            transform: translateX(180%) rotate(25deg);
          }
        }
        .animate-light-sweep {
          animation: lightSweep 4s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
};
