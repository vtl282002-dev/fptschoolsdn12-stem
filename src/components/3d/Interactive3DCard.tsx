import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  perspective?: number;
  scaleOnHover?: number;
  preserve3d?: boolean;
  disabled?: boolean;
  borderGlow?: boolean;
  elevationZ?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Interactive3DCard = forwardRef<HTMLDivElement, Interactive3DCardProps>(({
  children,
  className = '',
  glowColor = 'rgba(6, 182, 212, 0.28)',
  maxTilt = 6,
  perspective = 1000,
  scaleOnHover = 1.01,
  preserve3d = true,
  disabled = false,
  borderGlow = true,
  elevationZ = 12,
  style,
  onClick
}, ref) => {
  const localCardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rainbowRef = useRef<HTMLDivElement>(null);
  const borderGlowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => localCardRef.current!);

  // Clean up any pending RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !localCardRef.current) return;
    
    // Use client coordinates & bounding rect
    const card = localCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX; // -1 to 1
    const percentY = (y - centerY) / centerY; // -1 to 1

    const rotateX = percentY * -maxTilt;
    const rotateY = percentX * maxTilt;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!card) return;
      card.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${elevationZ}px) scale(${scaleOnHover})`;
      
      if (glareRef.current) {
        glareRef.current.style.opacity = '1';
        glareRef.current.style.background = `radial-gradient(circle 380px at ${x}px ${y}px, ${glowColor}, rgba(56, 189, 248, 0.08) 45%, transparent 75%)`;
      }

      if (rainbowRef.current) {
        rainbowRef.current.style.opacity = '0.3';
        rainbowRef.current.style.background = `linear-gradient(${percentX * 45 + 135}deg, rgba(6, 182, 212, 0.25) 0%, rgba(168, 85, 247, 0.18) 50%, rgba(245, 158, 11, 0.2) 100%)`;
      }

      if (borderGlowRef.current && borderGlow) {
        borderGlowRef.current.style.opacity = '1';
        borderGlowRef.current.style.boxShadow = `
          inset ${(percentX * -10).toFixed(1)}px ${(percentY * -10).toFixed(1)}px 25px -5px ${glowColor},
          0 ${(percentY * 15).toFixed(1)}px 40px -10px rgba(6, 182, 212, 0.45)
        `;
      }
    });
  };

  const handleMouseEnter = () => {
    if (disabled || !localCardRef.current) return;
    localCardRef.current.style.transition = 'transform 0.1s ease-out';
    if (contentRef.current && preserve3d) {
      contentRef.current.style.transform = `translateZ(${elevationZ}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!localCardRef.current) return;
    
    localCardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
    localCardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)`;

    if (glareRef.current) glareRef.current.style.opacity = '0';
    if (rainbowRef.current) rainbowRef.current.style.opacity = '0';
    if (borderGlowRef.current) borderGlowRef.current.style.opacity = '0';
    if (contentRef.current) contentRef.current.style.transform = 'translateZ(0px)';
  };

  return (
    <div
      ref={localCardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transformStyle: preserve3d ? 'preserve-3d' : undefined,
        willChange: 'transform'
      }}
      className={`group relative rounded-3xl overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* Dynamic Specular / Hologram Glare moving with mouse (Direct DOM, No State) */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-0 transition-opacity duration-200"
      />

      {/* Holographic Prismatic Rainbow Sheen on angle */}
      <div
        ref={rainbowRef}
        className="absolute inset-0 pointer-events-none z-10 opacity-0 mix-blend-color-dodge transition-opacity duration-300"
      />

      {/* Dynamic Cyber Border Glow targeting the nearest edge */}
      {borderGlow && (
        <div
          ref={borderGlowRef}
          className="absolute inset-0 rounded-3xl pointer-events-none z-30 opacity-0 transition-opacity duration-200"
        />
      )}

      {/* Cyber Corner Decors with animated glow */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/70 m-2.5 rounded-tl-sm pointer-events-none z-30 transition-all duration-200 group-hover:scale-110 group-hover:border-cyan-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/70 m-2.5 rounded-tr-sm pointer-events-none z-30 transition-all duration-200 group-hover:scale-110 group-hover:border-cyan-300" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/70 m-2.5 rounded-bl-sm pointer-events-none z-30 transition-all duration-200 group-hover:scale-110 group-hover:border-cyan-300" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/70 m-2.5 rounded-br-sm pointer-events-none z-30 transition-all duration-200 group-hover:scale-110 group-hover:border-cyan-300" />

      {/* Subtle scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-15"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(6, 182, 212, 0.15) 3px, rgba(6, 182, 212, 0.15) 4px)'
        }}
      />

      {/* Card Content with 3D Depth */}
      <div
        ref={contentRef}
        className="relative z-40 w-full h-full pointer-events-auto"
        style={{
          transformStyle: preserve3d ? 'preserve-3d' : undefined,
          transition: 'transform 0.15s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
});

Interactive3DCard.displayName = 'Interactive3DCard';
