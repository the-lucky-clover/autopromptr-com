
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
      <div className="relative w-28 h-28 mb-6">
        <svg width="112" height="112" viewBox="0 0 112 112" className="w-full h-full">
          {/* Outer Ring */}
          <circle 
            cx="56" 
            cy="56" 
            r="54" 
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
            cx="56" 
            cy="56" 
            r="52" 
            fill={`${clockColor}15`}
            className="transition-all duration-300"
          />
          
          {/* Hour Markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - 90;
            const x1 = 56 + 44 * Math.cos(angle * Math.PI / 180);
            const y1 = 56 + 44 * Math.sin(angle * Math.PI / 180);
            const x2 = 56 + 38 * Math.cos(angle * Math.PI / 180);
            const y2 = 56 + 38 * Math.sin(angle * Math.PI / 180);
            
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
            const x1 = 56 + 44 * Math.cos(angle * Math.PI / 180);
            const y1 = 56 + 44 * Math.sin(angle * Math.PI / 180);
            const x2 = 56 + 42 * Math.cos(angle * Math.PI / 180);
            const y2 = 56 + 42 * Math.sin(angle * Math.PI / 180);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`${clockColor}60`}
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Hour Hand */}
          <line
            x1="56"
            y1="56"
            x2={56 + 22 * Math.cos(hourAngle * Math.PI / 180)}
            y2={56 + 22 * Math.sin(hourAngle * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 4px ${clockColor}60)`
            }}
          />
          
          {/* Minute Hand */}
          <line
            x1="56"
            y1="56"
            x2={56 + 30 * Math.cos(minuteAngle * Math.PI / 180)}
            y2={56 + 30 * Math.sin(minuteAngle * Math.PI / 180)}
            stroke={clockColor}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 3px ${clockColor}60)`
            }}
          />
          
          {/* Second Hand - Sweeping */}
          <line
            x1="56"
            y1="56"
            x2={56 + 35 * Math.cos(secondAngle * Math.PI / 180)}
            y2={56 + 35 * Math.sin(secondAngle * Math.PI / 180)}
            stroke="#EF4444"
            strokeWidth="1"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 2px #EF444440)'
            }}
          />
          
          {/* Center Dot */}
          <circle 
            cx="56" 
            cy="56" 
            r="2" 
            fill={clockColor}
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 4px ${clockColor}80)`
            }}
          />
          
          {/* Hover Progress Ring */}
          {isHovering && isMeltdownAvailable && (
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="314.16"
              strokeDashoffset={314.16 - (314.16 * hoverProgress / 100)}
              className="transition-all duration-100"
              style={{
                filter: 'drop-shadow(0 0 6px #F59E0B80)',
                transform: 'rotate(-90deg)',
                transformOrigin: '56px 56px'
              }}
            />
          )}
        </svg>
      </div>
      
      {/* Professional Time Display - Grid Aligned */}
      <div className="text-right space-y-2 min-w-[140px]">
        {/* Primary Time Information */}
        <div className="space-y-1">
          <div className="text-lg font-mono font-semibold text-white tracking-wide">
            {formatTime()}
          </div>
          <div className="text-sm text-gray-300 font-medium">
            {formatDate()} • {getTimezoneAbbr()}
          </div>
        </div>
        
        {/* Status Display with Professional Spacing */}
        <div className="pt-2 border-t border-gray-600/30">
          <div className="text-xs text-gray-400 font-mono leading-relaxed">
            <div className="text-gray-500">Sector 7-G</div>
            <div className="text-emerald-400 font-medium" style={{ 
              textShadow: '0 0 8px rgba(52, 211, 153, 0.4)' 
            }}>
              Reactor: Stable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogueClockComponent;
