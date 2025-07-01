
import React, { useState, useEffect } from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import { useLocation } from 'react-router-dom';
import MeltdownPhases from './MeltdownPhases';
import ClockStatusDisplay from './ClockStatusDisplay';
import { useClockAudio } from './ClockAudio';
import { useClockHover } from './ClockHoverHandler';

const UniversalSectorClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isHovered, setIsHovered] = useState(false);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [meltdownPhase, setMeltdownPhase] = useState(0);
  const [dashboardLocked, setDashboardLocked] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const location = useLocation();
  const { playAlarm } = useClockAudio();

  // Don't render clock on landing page
  if (location.pathname === '/') {
    return null;
  }

  const handleMeltdownStart = () => {
    console.log('🚨 SECTOR 7G REACTOR MELTDOWN INITIATED! 🚨');
    setShowMeltdown(true);
    setMeltdownPhase(1);
    
    // Play klaxon alarm
    playAlarm();
    
    // Start the epic meltdown sequence
    setTimeout(() => setMeltdownPhase(2), 2000);  // Escalate after 2s
    setTimeout(() => setMeltdownPhase(3), 4000);  // Critical after 4s
    setTimeout(() => {
      setMeltdownPhase(4); // Reactor doors close
      setDashboardLocked(true);
      
      // Start 10-second countdown
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
  };

  const { handleMouseEnter, handleMouseLeave } = useClockHover({
    onMeltdownStart: handleMeltdownStart
  });

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [getCurrentTime]);

  useEffect(() => {
    const handleWelcomeHover = (event: CustomEvent) => {
      setIsHovered(event.detail.isHovered);
    };

    window.addEventListener('welcomeModuleHover', handleWelcomeHover as EventListener);
    return () => {
      window.removeEventListener('welcomeModuleHover', handleWelcomeHover as EventListener);
    };
  }, []);

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
      {showMeltdown && (
        <MeltdownPhases 
          meltdownPhase={meltdownPhase}
          dashboardLocked={dashboardLocked}
          countdown={countdown}
        />
      )}

      {/* Clock - Synchronized with welcome module hover transforms */}
      <div 
        className={`pointer-events-auto select-none cursor-pointer ${
          showMeltdown ? 'animate-pulse scale-110 rotate-12' : ''
        }`}
        style={{
          fontFamily: 'Monaco, "Lucida Console", "Courier New", monospace',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textShadow: showMeltdown 
            ? '0 0 12px rgba(255, 0, 255, 0.8), 0 0 24px rgba(0, 255, 255, 0.6)' 
            : '0 0 8px rgba(0, 255, 65, 0.6), 0 0 16px rgba(0, 255, 65, 0.3)',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))',
          // Synchronized with welcome module transforms - same easing and duration
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          // Match the welcome module's hover transform pattern
          transform: isHovered ? 'translateY(2px) scale(1.02)' : 'translateY(0) scale(1)',
          transformOrigin: 'center'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ClockStatusDisplay 
          currentTime={currentTime}
          getTimezoneAbbr={getTimezoneAbbr}
          showMeltdown={showMeltdown}
        />
      </div>
    </>
  );
};

export default UniversalSectorClock;
