
import React, { useState, useEffect, useRef } from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import { useLocation } from 'react-router-dom';

const UniversalSectorClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isHovered, setIsHovered] = useState(false);
  const [isDirectHover, setIsDirectHover] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const location = useLocation();
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Don't render clock on landing page
  if (location.pathname === '/') {
    return null;
  }

  // Initialize audio
  useEffect(() => {
    // Create klaxon sound using Web Audio API as fallback
    const createKlaxonSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
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

  // Handle direct hover timer
  useEffect(() => {
    if (isDirectHover) {
      hoverIntervalRef.current = setInterval(() => {
        setHoverTimer(prev => {
          const newTimer = prev + 0.1;
          if (newTimer >= 13) {
            setShowEasterEgg(true);
            if (audioRef.current) {
              try {
                audioRef.current.play();
              } catch (e) {
                console.log('Audio play failed:', e);
              }
            }
            setTimeout(() => {
              setShowEasterEgg(false);
              setHoverTimer(0);
            }, 5000);
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
    <div 
      className={`fixed top-6 right-20 z-50 transition-all duration-400 ease-out pointer-events-auto select-none cursor-pointer ${
        isHovered ? 'transform perspective-800 -rotate-x-3 translate-y-2 scale-102' : ''
      } ${
        showEasterEgg ? 'animate-pulse scale-110 rotate-12' : ''
      }`}
      style={{
        fontFamily: 'Monaco, "Lucida Console", "Courier New", monospace',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textShadow: showEasterEgg 
          ? '0 0 12px rgba(255, 0, 255, 0.8), 0 0 24px rgba(0, 255, 255, 0.6)' 
          : '0 0 8px rgba(0, 255, 65, 0.6), 0 0 16px rgba(0, 255, 65, 0.3)',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="text-green-400 text-right text-xs opacity-70" 
        style={{ 
          color: showEasterEgg ? '#ff00ff' : '#00dd33',
          fontSize: '11px'
        }}
      >
        {showEasterEgg ? 'REACTOR: PARTY MODE! 🎉' : 'SECTOR 7-G • REACTOR: STABLE'}
      </div>
      <div 
        className="text-green-300 mt-1 text-right font-bold" 
        style={{ 
          color: showEasterEgg ? '#00ffff' : '#00ff41',
          fontSize: '18px'
        }}
      >
        {currentTime} {getTimezoneAbbr()}
      </div>
      <div 
        className="text-green-300 text-right text-sm font-medium" 
        style={{ 
          color: showEasterEgg ? '#ffff00' : '#00dd33',
          fontSize: '14px'
        }}
      >
        {dayName} {monthName} {dayNumber}
      </div>
      {showEasterEgg && (
        <div 
          className="absolute -top-8 right-0 animate-bounce text-center"
          style={{
            background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
          }}
        >
          WOO HOO! 🎊
        </div>
      )}
    </div>
  );
};

export default UniversalSectorClock;
