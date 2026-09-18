import React from 'react';

interface FptSchoolsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FptSchoolsLogo: React.FC<FptSchoolsLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-9 w-auto',
    md: 'h-13 sm:h-14 w-auto',
    lg: 'h-16 sm:h-18 w-auto'
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 180"
        className={`${sizeClasses[size]} drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* FPT 3 Iconic Shapes - Perfectly Centered at X = 210 */}
        <g transform="translate(0, 8)">
          {/* Blue F Block (Left) */}
          <g transform="skewX(-16)">
            <rect x="112" y="16" width="56" height="86" rx="14" fill="#0066B3" />
            <text
              x="140"
              y="78"
              fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
              fontWeight="900"
              fontStyle="italic"
              fontSize="62"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              F
            </text>
          </g>

          {/* Orange P Block (Middle, Taller) */}
          <g transform="skewX(-16)">
            <rect x="182" y="4" width="56" height="110" rx="14" fill="#F37021" />
            <text
              x="210"
              y="85"
              fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
              fontWeight="900"
              fontStyle="italic"
              fontSize="62"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              P
            </text>
          </g>

          {/* Green T Block (Right) */}
          <g transform="skewX(-16)">
            <rect x="252" y="16" width="56" height="86" rx="14" fill="#009B49" />
            <text
              x="280"
              y="78"
              fontFamily="'Montserrat', 'Be Vietnam Pro', sans-serif"
              fontWeight="900"
              fontStyle="italic"
              fontSize="62"
              fill="#FFFFFF"
              textAnchor="middle"
            >
              T
            </text>
          </g>

          {/* Registered trademark symbol ® below green block */}
          <circle cx="316" cy="120" r="7" stroke="#0066B3" strokeWidth="1.8" fill="none" />
          <text
            x="316"
            y="124"
            fontFamily="'Montserrat', sans-serif"
            fontWeight="bold"
            fontSize="9"
            fill="#0066B3"
            textAnchor="middle"
          >
            R
          </text>
        </g>

        {/* Wordmark: FPT SCHOOLS in authentic orange slab-serif, centered at X = 210 */}
        <text
          x="210"
          y="166"
          fontFamily="'Roboto Slab', 'Rockwell', 'Clarendon', serif"
          fontWeight="900"
          fontSize="44"
          letterSpacing="2"
          fill="#F37021"
          textAnchor="middle"
        >
          FPT SCHOOLS
        </text>
      </svg>
    </div>
  );
};
