
import React, { useState, useEffect, useRef } from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import AnimatedDropdownClockDisplay from './AnimatedDropdownClockDisplay';
import MeltdownPhases from './clock/MeltdownPhases';

interface AnimatedDropdownClockProps {
  enableEasterEgg?: boolean;
}

const AnimatedDropdownClock = ({ enableEasterEgg = false }: AnimatedDropdownClockProps) => {
  const { getCurrentTime, getTimezoneAbbr, timezone } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [meltdownPhase, setMeltdownPhase] = useState(0);
  const [dashboardLocked, setDashboardLocked] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Show dropdown after component mounts
    setTimeout(() => setIsDropdownVisible(true), 500);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  const handleMouseEnter = () => {
    if (!enableEasterEgg) return;
    
    const timer = setTimeout(() => {
      console.log('🚨 SECTOR 7G REACTOR MELTDOWN INITIATED! 🚨');
      setShowMeltdown(true);
      setMeltdownPhase(1);
      
      // Start the meltdown sequence
      setTimeout(() => setMeltdownPhase(2), 2000);  // Escalate after 2s
      setTimeout(() => setMeltdownPhase(3), 4000);  // Critical after 4s
      setTimeout(() => {
        setMeltdownPhase(4); // Reactor doors close
        setDashboardLocked(true);
        
        // Start countdown
        let timeLeft = 10;
        const countdownInterval = setInterval(() => {
          timeLeft--;
          setCountdown(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            // Restore dashboard
            setShowMeltdown(false);
            setDashboardLocked(false);
            setMeltdownPhase(0);
            setCountdown(10);
          }
        }, 1000);
      }, 6000); // Doors close after 6s
      
    }, 15000); // 15 seconds hover trigger
    
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

  // Block all interactions when dashboard is locked
  useEffect(() => {
    if (dashboardLocked) {
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.pointerEvents = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.userSelect = '';
    };
  }, [dashboardLocked]);

  return (
    <>
      {/* Epic Nuclear Meltdown Animation System */}
      {showMeltdown && enableEasterEgg && (
        <MeltdownPhases 
          meltdownPhase={meltdownPhase}
          dashboardLocked={dashboardLocked}
          countdown={countdown}
        />
      )}

      {/* Animated Glass Dropdown Clock */}
      <div 
        className={`fixed top-0 right-6 z-40 transition-all duration-700 ease-out ${
          isDropdownVisible ? 'translate-y-6' : '-translate-y-full'
        } ${dashboardLocked ? 'pointer-events-none opacity-50' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`backdrop-blur-md rounded-b-xl p-4 border border-t-0 shadow-2xl ${
          showMeltdown 
            ? 'bg-red-900/30 border-red-500/40' 
            : 'bg-black/20 border-white/20'
        }`}>
          <AnimatedDropdownClockDisplay
            currentTime={currentTime}
            formatDate={formatDate}
            getTimezoneAbbr={getTimezoneAbbr}
            showMeltdown={showMeltdown}
            timezone={timezone}
          />
        </div>
      </div>

      {/* Custom Keyframes for Shake Effect */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) translateY(0); }
          10% { transform: translateX(-2px) translateY(-1px); }
          20% { transform: translateX(2px) translateY(1px); }
          30% { transform: translateX(-1px) translateY(-2px); }
          40% { transform: translateX(1px) translateY(2px); }
          50% { transform: translateX(-2px) translateY(1px); }
          60% { transform: translateX(2px) translateY(-1px); }
          70% { transform: translateX(-1px) translateY(2px); }
          80% { transform: translateX(1px) translateY(-2px); }
          90% { transform: translateX(-2px) translateY(-1px); }
        }
      `}</style>
    </>
  );
};

export default AnimatedDropdownClock;
