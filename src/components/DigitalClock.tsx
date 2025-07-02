
import React, { useState, useEffect } from 'react';
import { Radiation } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

interface DigitalClockProps {
  clockColor?: string;
  showReactorStatus?: boolean;
  showTimezone?: boolean;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'dashboard';
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

  // Get time without seconds for dashboard display
  const getTimeWithoutSeconds = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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
    if (size === 'dashboard') {
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      const date = now.getDate();
      const year = now.getFullYear();
      return `${day} ${month} ${date}, ${year}`;
    } else {
      const day = now.toLocaleDateString('en-US', { weekday: 'short' });
      const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${day} ${date}`;
    }
  };

  const getTimezoneDisplay = () => {
    const now = new Date();
    const timezoneName = now.toLocaleDateString('en-US', { 
      timeZone: timezone, 
      timeZoneName: 'long' 
    }).split(', ')[1];
    
    const offsetMinutes = now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;
    
    return `${timezoneName} (${offsetString})`;
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
    },
    dashboard: {
      time: 'text-4xl font-orbitron font-bold tracking-wider',
      date: 'text-lg',
      status: 'text-base',
      icon: 'w-5 h-5',
      timezone: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  if (size === 'dashboard') {
    return (
      <div className={`flex flex-col items-end space-y-3 text-right ${className}`}>
        {/* Date Display - Top */}
        {showDate && (
          <div 
            className={`text-green-400 font-semibold ${sizes.date} tracking-wide`}
            style={{ 
              textShadow: '0 0 10px rgba(34, 197, 94, 0.7), 0 0 20px rgba(34, 197, 94, 0.4)' 
            }}
          >
            {formatDate()}
          </div>
        )}

        {/* Time Display with Scan Lines */}
        <div className="relative">
          <div 
            className={`text-green-400 ${sizes.time} tabular-nums font-bold relative z-10 scan-line-glow`} 
            style={{ 
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
              textShadow: '0 0 16px rgba(34, 197, 94, 0.9), 0 0 32px rgba(34, 197, 94, 0.5), 0 0 48px rgba(34, 197, 94, 0.3)',
              letterSpacing: '0.2em'
            }}
          >
            {getTimeWithoutSeconds()}
          </div>
          {/* Scan line effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line"></div>
          </div>
        </div>

        {/* Timezone Display */}
        {showTimezone && (
          <div 
            className={`text-green-400 font-medium ${sizeClasses.dashboard.timezone} tracking-wide`}
            style={{ 
              textShadow: '0 0 8px rgba(34, 197, 94, 0.6), 0 0 16px rgba(34, 197, 94, 0.3)' 
            }}
          >
            {getTimezoneDisplay()}
          </div>
        )}
      </div>
    );
  }

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
