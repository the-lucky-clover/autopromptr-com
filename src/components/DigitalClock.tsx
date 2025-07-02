
import React, { useState, useEffect } from 'react';
import { Radiation } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

interface DigitalClockProps {
  clockColor?: string;
  showReactorStatus?: boolean;
  showTimezone?: boolean;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DigitalClock: React.FC<DigitalClockProps> = ({
  clockColor = "#10B981",
  showReactorStatus = true,
  showTimezone = true,
  showDate = true,
  size = 'md',
  className = ''
}) => {
  const { getCurrentTime, getTimezoneAbbr, timezone } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  const formatDate = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${day} ${date}`;
  };

  const sizeClasses = {
    sm: {
      time: 'text-sm',
      date: 'text-xs',
      status: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      time: 'text-lg',
      date: 'text-sm',
      status: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      time: 'text-xl',
      date: 'text-base',
      status: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Time Display */}
      <div className={`text-white/90 font-light tracking-wide ${sizes.time}`}>
        {currentTime} {showTimezone && getTimezoneAbbr()}
      </div>
      
      {/* Date Display */}
      {showDate && (
        <div className={`text-white/60 font-light ${sizes.date}`}>
          {formatDate()}
        </div>
      )}

      {/* Reactor Status */}
      {showReactorStatus && (
        <div className={`flex items-center gap-2 text-white/70 ${sizes.status}`}>
          <Radiation 
            className={`text-green-400 ${sizes.icon}`}
            style={{ 
              filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))',
              animation: 'pulse 2s infinite' 
            }} 
          />
          <span 
            className="text-green-400 font-medium" 
            style={{ 
              textShadow: '0 0 8px rgba(34, 197, 94, 0.4)' 
            }}
          >
            Sector 7-G • Reactor: Stable
          </span>
        </div>
      )}
    </div>
  );
};

export default DigitalClock;
