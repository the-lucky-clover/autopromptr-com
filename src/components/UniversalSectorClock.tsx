
import React, { useState, useEffect, useRef } from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import { useLocation } from 'react-router-dom';
import MeltdownPhases from './clock/MeltdownPhases';

const UniversalSectorClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isHovered, setIsHovered] = useState(false);
  const [isDirectHover, setIsDirectHover] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(0);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [meltdownPhase, setMeltdownPhase] = useState(0);
  const [dashboardLocked, setDashboardLocked] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const location = useLocation();
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Don't render clock on landing page
  if (location.pathname === '/') {
    return null;
  }

  // Initialize klaxon audio
  useEffect(() => {
    const createKlaxonSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create klaxon-style alarm sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    };

    audioRef.current = { play: createKlaxonSound } as any;
  }, []);

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

  // Handle direct hover timer for meltdown sequence
  useEffect(() => {
    if (isDirectHover) {
      hoverIntervalRef.current = setInterval(() => {
        setHoverTimer(prev => {
          const newTimer = prev + 0.1;
          if (newTimer >= 13) {
            console.log('🚨 SECTOR 7G REACTOR MELTDOWN INITIATED! 🚨');
            setShowMeltdown(true);
            setMeltdownPhase(1);
            
            // Play klaxon alarm
            if (audioRef.current) {
              try {
                audioRef.current.play();
              } catch (e) {
                console.log('Audio play failed:', e);
              }
            }
            
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
            
            return 0;
          }
          return newTimer;
        });
      }, 100);
    } else {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
      setHoverTimer(0);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [isDirectHover]);

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

  const handleMouseEnter = () => {
    setIsDirectHover(true);
  };

  const handleMouseLeave = () => {
    setIsDirectHover(false);
  };

  // Get current date info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = now.getDate();

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
        <div 
          className="text-green-400 text-right text-xs opacity-70" 
          style={{ 
            color: showMeltdown ? '#ff00ff' : '#00dd33',
            fontSize: '11px'
          }}
        >
          {showMeltdown ? 'REACTOR: MELTDOWN! 🚨' : 'SECTOR 7-G • REACTOR: STABLE'}
        </div>
        <div 
          className="text-green-300 mt-1 text-right font-bold" 
          style={{ 
            color: showMeltdown ? '#00ffff' : '#00ff41',
            fontSize: '20px'
          }}
        >
          {currentTime} {getTimezoneAbbr()}
        </div>
        <div 
          className="text-green-300 text-right text-sm font-medium" 
          style={{ 
            color: showMeltdown ? '#ffff00' : '#00dd33',
            fontSize: '16px'
          }}
        >
          {dayName} {monthName} {dayNumber}
        </div>
      </div>
    </>
  );
};

export default UniversalSectorClock;
