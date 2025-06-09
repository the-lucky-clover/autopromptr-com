
import React from 'react';

interface ClockworkGearsProps {
  className?: string;
  strokeWidth?: number;
}

const ClockworkGears: React.FC<ClockworkGearsProps> = ({ 
  className = "w-9 h-9", 
  strokeWidth = 1.5 
}) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      
      {/* Large gear (golden ratio: 1.618 times smaller gear) */}
      <g className="animate-[spin_8s_linear_infinite]" style={{ transformOrigin: '14px 18px' }}>
        {/* Gear teeth */}
        <path 
          d="M14 6 L16 6 L16 8 L14 8 Z
             M20 8 L22 8 L22 10 L20 10 Z
             M24 14 L26 14 L26 16 L24 16 Z
             M22 20 L22 22 L20 22 L20 20 Z
             M14 24 L16 24 L16 26 L14 26 Z
             M8 20 L8 22 L6 22 L6 20 Z
             M4 14 L6 14 L6 16 L4 16 Z
             M6 8 L8 8 L8 10 L6 10 Z"
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Main gear circle */}
        <circle 
          cx="14" 
          cy="18" 
          r="8" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Inner circle */}
        <circle 
          cx="14" 
          cy="18" 
          r="3" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
      </g>
      
      {/* Small gear (golden ratio smaller) */}
      <g className="animate-[spin_-5s_linear_infinite]" style={{ transformOrigin: '26px 12px' }}>
        {/* Small gear teeth */}
        <path 
          d="M26 7 L27 7 L27 8 L26 8 Z
             M29 9 L30 9 L30 10 L29 10 Z
             M31 12 L32 12 L32 13 L31 13 Z
             M29 15 L30 15 L30 16 L29 16 Z
             M26 17 L27 17 L27 18 L26 18 Z
             M23 15 L23 16 L22 16 L22 15 Z
             M21 12 L22 12 L22 13 L21 13 Z
             M23 9 L23 10 L22 10 L22 9 Z"
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Small gear circle */}
        <circle 
          cx="26" 
          cy="12" 
          r="5" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Small inner circle */}
        <circle 
          cx="26" 
          cy="12" 
          r="2" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
      </g>
      
      {/* Tiny accent gear (golden ratio smaller than small gear) */}
      <g className="animate-[spin_12s_linear_infinite]" style={{ transformOrigin: '8px 8px' }}>
        {/* Tiny gear teeth */}
        <path 
          d="M8 5 L9 5 L9 6 L8 6 Z
             M10 7 L11 7 L11 8 L10 8 Z
             M11 10 L11 11 L10 11 L10 10 Z
             M8 11 L9 11 L9 12 L8 12 Z
             M6 10 L6 11 L5 11 L5 10 Z
             M5 7 L5 8 L4 8 L4 7 Z"
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Tiny gear circle */}
        <circle 
          cx="8" 
          cy="8" 
          r="3" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Tiny inner circle */}
        <circle 
          cx="8" 
          cy="8" 
          r="1.2" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
      </g>
    </svg>
  );
};

export default ClockworkGears;
