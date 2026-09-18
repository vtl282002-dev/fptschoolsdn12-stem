import React from 'react';

interface HoloGeometricShapes3DProps {
  type?: 'atom' | 'gyro' | 'cube' | 'dna';
  size?: number;
  className?: string;
  color?: string;
}

export const HoloGeometricShapes3D: React.FC<HoloGeometricShapes3DProps> = ({
  type = 'atom',
  size = 56,
  className = '',
  color = '#00F0FF'
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, perspective: '600px' }}
    >
      {type === 'atom' && (
        <div className="w-full h-full relative flex items-center justify-center animate-spin-slow">
          {/* Core nucleus */}
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
          />
          <div
            className="w-3.5 h-3.5 rounded-full absolute"
            style={{ backgroundColor: '#ffffff', boxShadow: `0 0 12px ${color}` }}
          />

          {/* Electron orbit 1 */}
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-80"
            style={{
              borderColor: color,
              transform: 'rotateX(70deg) rotateY(15deg)',
              boxShadow: `0 0 10px ${color}40`
            }}
          />
          {/* Electron orbit 2 */}
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-80"
            style={{
              borderColor: '#38bdf8',
              transform: 'rotateX(70deg) rotateY(75deg)',
              boxShadow: `0 0 10px #38bdf840`
            }}
          />
          {/* Electron orbit 3 */}
          <div
            className="absolute inset-0 rounded-full border border-dashed opacity-80"
            style={{
              borderColor: '#a855f7',
              transform: 'rotateX(70deg) rotateY(135deg)',
              boxShadow: `0 0 10px #a855f740`
            }}
          />
        </div>
      )}

      {type === 'gyro' && (
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Ring 1 */}
          <div
            className="absolute inset-1 rounded-full border-2 animate-[spin_8s_linear_infinite]"
            style={{
              borderColor: color,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              boxShadow: `0 0 12px ${color}60`
            }}
          />
          {/* Ring 2 */}
          <div
            className="absolute inset-2.5 rounded-full border-2 animate-[spin_5s_linear_infinite_reverse]"
            style={{
              borderColor: '#38bdf8',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              transform: 'rotateX(60deg)'
            }}
          />
          {/* Center core */}
          <div
            className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse"
          />
        </div>
      )}

      {type === 'cube' && (
        <svg viewBox="0 0 64 64" className="w-full h-full animate-[spin_12s_linear_infinite]">
          <g stroke={color} strokeWidth="1.8" fill="none" opacity="0.85">
            {/* Front face */}
            <polygon points="20,16 44,16 44,40 20,40" stroke="#38bdf8" />
            {/* Back face */}
            <polygon points="28,24 52,24 52,48 28,48" stroke="#0284c7" strokeDasharray="3 2" />
            {/* Connecting edges */}
            <line x1="20" y1="16" x2="28" y2="24" stroke={color} />
            <line x1="44" y1="16" x2="52" y2="24" stroke={color} />
            <line x1="44" y1="40" x2="52" y2="48" stroke={color} />
            <line x1="20" y1="40" x2="28" y2="48" stroke={color} />
          </g>
          {/* Nodes */}
          <circle cx="20" cy="16" r="2.5" fill={color} />
          <circle cx="44" cy="16" r="2.5" fill={color} />
          <circle cx="44" cy="40" r="2.5" fill={color} />
          <circle cx="20" cy="40" r="2.5" fill={color} />
          <circle cx="52" cy="24" r="2" fill="#38bdf8" />
          <circle cx="52" cy="48" r="2" fill="#38bdf8" />
        </svg>
      )}

      {type === 'dna' && (
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="flex items-center gap-1.5 h-full py-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-b from-cyan-400 via-sky-300 to-indigo-500 rounded-full"
                style={{
                  height: `${35 + Math.sin(i * 0.9) * 25}%`,
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) ${i * 0.15}s infinite`,
                  boxShadow: `0 0 8px ${color}80`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
