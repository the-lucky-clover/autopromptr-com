
import React, { useState, useEffect, useRef } from 'react';
import { useTimezone } from '@/hooks/useTimezone';

interface AnalogueClockComponentProps {
  onMeltdownTrigger?: () => void;
  isMeltdownAvailable?: boolean;
  clockColor?: string;
}

const AnalogueClockComponent: React.FC<AnalogueClockComponentProps> = ({
  onMeltdownTrigger,
  isMeltdownAvailable = true,
  clockColor = "#10B981"
}) => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update time every 16ms for smooth second hand
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    
    const interval = setInterval(updateTime, 16); // 60fps
    return () => clearInterval(interval);
  }, []);

  // Calculate hand positions
  const getHandPositions = () => {
    const seconds = currentTime.getSeconds() + currentTime.getMilliseconds() / 1000;
    const minutes = currentTime.getMinutes() + seconds / 60;
    const hours = (currentTime.getHours() % 12) + minutes / 60;

    return {
      secondAngle: (seconds * 6) - 90, // 6 degrees per second
      minuteAngle: (minutes * 6) - 90, // 6 degrees per minute
      hourAngle: (hours * 30) - 90 // 30 degrees per hour
    };
  };

  const { secondAngle, minuteAngle, hourAngle } = getHandPositions();

  const handleMouseEnter = () => {
    if (!isMeltdownAvailable) return;
    
    setIsHovering(true);
    setHoverProgress(0);
    
    // Progress timer (updates every 100ms)
    progressTimerRef.current = setInterval(() => {
      setHoverProgress(prev => {
        const newProgress = prev + (100 / 13000) * 100; // 13 seconds total
        return Math.min(newProgress, 100);
      });
    }, 100);
    
    // Meltdown trigger timer (13 seconds)
    hoverTimerRef.current = setTimeout(() => {
      onMeltdownTrigger?.();
      setHoverProgress(0);
    }, 13000);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverProgress(0);
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = () => {
    const day = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
    const date = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${day} ${date}`;
  };

  return (
    <div 
      className="relative cursor-pointer select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clock Face */}
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128" className="w-full h-full">
          {/* Outer Ring */}
          <circle 
            cx="64" 
            cy="64" 
            r="62" 
            fill="none" 
            stroke={clockColor}
            strokeWidth="2"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 8px ${clockColor}40)`
            }}
          />
          
          {/* Clock Face Background */}
          <circle 
            cx="64" 
            cy="64" 
            r="60" 
            fill={`${clockColor}15`}
            className="transition-all duration-300"
          />
          
          {/* Hour Markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - 90;
            const x1 = 64 + 50 * Math.cos(angle * Math.PI / 180);
            const y1 = 64 + 50 * Math.sin(angle * Math.PI / 180);
            const x2 = 64 + 45 * Math.cos(angle * Math.PI / 180);
            const y2 = 64 + 45 * Math.sin(angle * Math.PI / 180);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={clockColor}
                strokeWidth="2"
                className="transition-all duration-300"
              />
            );
          })}
          
          {/* Minute Markers */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 === 0) return null; // Skip hour markers
            const angle = (i * 6) - 90;
            const x1 = 64 + 50 * Math.cos(angle * Math.PI / 180);
            const y1 = 64 + 50 * Math.sin(angle * Math.PI / 180);
            const x2 = 64 + 48 * Math.cos(angle * Math.PI / 180);
            const y2 = 64 + 48 * Math.sin(angle * Math.PI / 180);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`${clockColor}80`}
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Hour Hand */}
          <line
            x1="64"
            y1="64"
            x2={64 + 25 * Math.cos(hourAngle * Math.PI / 180)}
            y2={64 + 25 * Math.sin(hourAngle * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 4px ${clockColor}60)`
            }}
          />
          
          {/* Minute Hand */}
          <line
            x1="64"
            y1="64"
            x2={64 + 35 * Math.cos(minuteAngle * Math.PI / 180)}
            y2={64 + 35 * Math.sin(minuteAngle * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 3px ${clockColor}60)`
            }}
          />
          
          {/* Second Hand - Sweeping */}
          <line
            x1="64"
            y1="64"
            x2={64 + 40 * Math.cos(secondAngle * Math.PI / 180)}
            y2={64 + 40 * Math.sin(secondAngle * Math.PI / 180)}
            stroke="#EF4444"
            strokeWidth="1"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 2px #EF444440)'
            }}
          />
          
          {/* Center Dot */}
          <circle 
            cx="64" 
            cy="64" 
            r="3" 
            fill={clockColor}
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 4px ${clockColor}80)`
            }}
          />
          
          {/* Hover Progress Ring */}
          {isHovering && isMeltdownAvailable && (
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeDasharray="364.42"
              strokeDashoffset={364.42 - (364.42 * hoverProgress / 100)}
              className="transition-all duration-100"
              style={{
                filter: 'drop-shadow(0 0 6px #F59E0B80)',
                transform: 'rotate(-90deg)',
                transformOrigin: '64px 64px'
              }}
            />
          )}
        </svg>
      </div>
      
      {/* Time Display */}
      <div className="absolute -bottom-16 right-0 text-right">
        <div className="text-lg font-mono font-bold text-white">
          {formatTime()}
        </div>
        <div className="text-sm text-gray-300">
          {formatDate()} • {getTimezoneAbbr()}
        </div>
        <div className="text-xs text-gray-400 mt-1 font-mono">
          Sector 7-G // Reactor: Stable
        </div>
      </div>
    </div>
  );
};

export default AnalogueClockComponent;
