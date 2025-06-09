
import React from 'react';
import { Cog } from 'lucide-react';

interface ClockworkGearsProps {
  className?: string;
  strokeWidth?: number;
}

const ClockworkGears: React.FC<ClockworkGearsProps> = ({ 
  className = "w-9 h-9", 
  strokeWidth = 1.5 
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      {/* Large gear - bottom left */}
      <div 
        className="absolute animate-[spin_12s_linear_infinite] z-10"
        style={{ 
          left: '2px',
          top: '8px',
        }}
      >
        <Cog 
          size={24}
          strokeWidth={strokeWidth}
          className="text-blue-400 drop-shadow-sm"
          style={{
            filter: 'url(#gearGradient)'
          }}
        />
      </div>
      
      {/* Small gear - top right, counter-rotating */}
      <div 
        className="absolute animate-[spin_-8s_linear_infinite] z-20"
        style={{ 
          right: '2px',
          top: '2px',
        }}
      >
        <Cog 
          size={16}
          strokeWidth={strokeWidth}
          className="text-purple-400 drop-shadow-sm"
          style={{
            filter: 'url(#gearGradientSmall)'
          }}
        />
      </div>

      {/* SVG definitions for gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="gearGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default ClockworkGears;
