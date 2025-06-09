
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
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      
      {/* Large gear - positioned at bottom left */}
      <g className="animate-[spin_8s_linear_infinite]" style={{ transformOrigin: '13px 23px' }}>
        {/* Large gear teeth - 8 teeth evenly spaced */}
        <path 
          d="M13 12 L15 12 L15 14 L13 14 Z
             M18.5 14.5 L20.5 14.5 L20.5 16.5 L18.5 16.5 Z
             M22 20 L24 20 L24 22 L22 22 Z
             M20.5 25.5 L20.5 27.5 L18.5 27.5 L18.5 25.5 Z
             M13 30 L15 30 L15 32 L13 32 Z
             M7.5 27.5 L7.5 25.5 L5.5 25.5 L5.5 27.5 Z
             M4 22 L2 22 L2 20 L4 20 Z
             M5.5 16.5 L7.5 16.5 L7.5 14.5 L5.5 14.5 Z"
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Large gear main circle */}
        <circle 
          cx="13" 
          cy="23" 
          r="9" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Large gear inner circle */}
        <circle 
          cx="13" 
          cy="23" 
          r="4" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Large gear center hub */}
        <circle 
          cx="13" 
          cy="23" 
          r="1.5" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="url(#gearGradient)"
          opacity="0.3"
        />
      </g>
      
      {/* Small gear - positioned at top right, 45 degrees offset */}
      <g className="animate-[spin_-12s_linear_infinite]" style={{ transformOrigin: '26px 13px' }}>
        {/* Small gear teeth - 6 teeth evenly spaced */}
        <path 
          d="M26 7 L27.5 7 L27.5 8.5 L26 8.5 Z
             M29.5 9.5 L31 9.5 L31 11 L29.5 11 Z
             M32 13 L33.5 13 L33.5 14.5 L32 14.5 Z
             M31 16.5 L31 18 L29.5 18 L29.5 16.5 Z
             M26 19 L27.5 19 L27.5 20.5 L26 20.5 Z
             M22.5 18 L22.5 16.5 L21 16.5 L21 18 Z
             M20 14.5 L18.5 14.5 L18.5 13 L20 13 Z
             L21 11 L22.5 11 L22.5 9.5 L21 9.5 Z"
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Small gear main circle */}
        <circle 
          cx="26" 
          cy="13" 
          r="6" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Small gear inner circle */}
        <circle 
          cx="26" 
          cy="13" 
          r="2.5" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Small gear center hub */}
        <circle 
          cx="26" 
          cy="13" 
          r="1" 
          stroke="url(#gearGradient)" 
          strokeWidth={strokeWidth}
          fill="url(#gearGradient)"
          opacity="0.3"
        />
      </g>
    </svg>
  );
};

export default ClockworkGears;
