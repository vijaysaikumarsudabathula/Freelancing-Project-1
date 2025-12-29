
import React from 'react';
import { Language } from '../types';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
  // Added lang to fix TypeScript error in App.tsx
  lang?: Language;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showText = true, light = false, lang }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-auto drop-shadow-sm">
        {/* Leaf Vortex */}
        <g transform="translate(50, 45)">
          {[0, 120, 240].map((rotation, i) => (
            <g key={i} transform={`rotate(${rotation})`}>
              <path 
                d="M0,-5 C15,-5 35,-15 35,-35 C35,-15 15,0 0,0 Z" 
                fill={i === 0 ? "#108242" : i === 1 ? "#A4C639" : "#6DA32D"} 
                transform="translate(0, 5)"
              />
              <path 
                d="M0,-5 C10,-5 25,-10 25,-25 C25,-10 10,0 0,0 Z" 
                fill="white" 
                opacity="0.2"
                transform="translate(2, 7) scale(0.8)"
              />
            </g>
          ))}
          {/* Center 'D' */}
          <text 
            x="0" 
            y="7" 
            textAnchor="middle" 
            className="font-black" 
            style={{ 
              fontSize: '24px', 
              fill: '#A4C639', 
              fontFamily: 'sans-serif' 
            }}
          >
            D
          </text>
        </g>
      </svg>
      {showText && (
        <div className="mt-1 text-center flex flex-col items-center">
          <span 
            className={`font-black text-xl tracking-wider ${light ? 'text-white' : 'text-[#108242]'}`} 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            DEEPTHI
          </span>
          <span 
            className={`font-bold text-[9px] tracking-[0.5em] -mt-1 ${light ? 'text-white/70' : 'text-[#A4C639]'}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ENTERPRISES
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
