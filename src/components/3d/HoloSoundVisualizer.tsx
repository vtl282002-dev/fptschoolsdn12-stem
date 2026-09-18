import React from 'react';

interface HoloSoundVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  barsCount?: number;
}

export const HoloSoundVisualizer: React.FC<HoloSoundVisualizerProps> = ({
  isPlaying = true,
  className = '',
  barsCount = 18
}) => {
  return (
    <div className={`flex items-center gap-1 h-6 select-none pointer-events-none ${className}`}>
      {Array.from({ length: barsCount }).map((_, i) => {
        const delay = (i % 6) * 0.12;
        const baseHeight = 25 + Math.sin(i * 0.6) * 20;

        return (
          <div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-cyan-500 via-sky-400 to-amber-300 transition-all"
            style={{
              height: isPlaying ? `${baseHeight}%` : '20%',
              animation: isPlaying ? `audioWave 1.2s ease-in-out ${delay}s infinite alternate` : 'none',
              boxShadow: '0 0 6px rgba(6, 182, 212, 0.6)'
            }}
          />
        );
      })}

      <style>{`
        @keyframes audioWave {
          0% { height: 15%; opacity: 0.5; }
          50% { height: 85%; opacity: 1; }
          100% { height: 35%; opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
