
import React, { useState, useEffect } from 'react';
import { Clock, Radiation } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

const EnhancedRealTimeClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [meltdownAudio, setMeltdownAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      console.log('🚨 SECTOR 7G MELTDOWN INITIATED! 🚨');
      setShowMeltdown(true);
      
      // Play meltdown sound effect (placeholder - you'd add actual audio file)
      try {
        const audio = new Audio('/sounds/nuclear-alarm.mp3'); // You'd need to add this file
        audio.play().catch(() => console.log('Audio playback failed - file not found'));
        setMeltdownAudio(audio);
      } catch (error) {
        console.log('Audio not available');
      }
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowMeltdown(false);
        if (meltdownAudio) {
          meltdownAudio.pause();
        }
      }, 5000);
    }, 10000);
    
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  const formatDate = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${day} ${date}`;
  };

  return (
    <>
      {/* Meltdown Overlay */}
      {showMeltdown && (
        <>
          {/* Screen Flash */}
          <div className="fixed inset-0 z-[9999] bg-red-600 opacity-50 animate-pulse pointer-events-none" />
          
          {/* Animated Sirens */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9998] flex space-x-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-16 bg-red-500 rounded-b-full animate-spin shadow-lg shadow-red-500/50"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.5s'
                }}
              />
            ))}
          </div>
          
          {/* Meltdown Warning */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9998] bg-red-900/90 backdrop-blur-sm border-2 border-red-500 rounded-lg p-4 animate-pulse">
            <p className="text-red-300 font-mono text-lg font-bold text-center">
              ⚠️ SECTOR 7G REACTOR MELTDOWN ⚠️
            </p>
            <p className="text-red-400 font-mono text-sm text-center mt-1">
              Springfield Nuclear Power Plant
            </p>
          </div>
        </>
      )}

      {/* Enhanced Clock */}
      <div 
        className="flex items-center space-x-2 text-white/90 cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Hover for 10 seconds for Sector 7G surprise..."
      >
        <Radiation className="w-4 h-4 text-yellow-400 animate-pulse" />
        <div className="text-right">
          <div 
            className="font-mono font-bold leading-tight tracking-wider text-sm"
            style={{
              fontFamily: '"Courier New", "Lucida Console", monospace',
              textShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
              filter: 'contrast(1.2)'
            }}
          >
            {formatDate()} • {currentTime} {getTimezoneAbbr()}
          </div>
          <div className="text-xs text-white/60 font-mono text-center">
            SECTOR 7G
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedRealTimeClock;
