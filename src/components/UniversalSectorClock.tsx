
import React, { useState, useEffect } from 'react';
import { useTimezone } from '@/hooks/useTimezone';
import { useLocation } from 'react-router-dom';

const UniversalSectorClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Don't render clock on landing page
  if (location.pathname === '/') {
    return null;
  }

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

  return (
    <div 
      className={`fixed top-6 left-6 z-50 transition-all duration-400 ease-out pointer-events-none select-none ${
        isHovered ? 'transform perspective-800 -rotate-x-3 translate-y-2 scale-102' : ''
      }`}
      style={{
        fontFamily: 'Monaco, "Lucida Console", "Courier New", monospace',
        fontSize: '13px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textShadow: '0 0 8px rgba(0, 255, 65, 0.6), 0 0 16px rgba(0, 255, 65, 0.3)',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <div className="text-green-400" style={{ color: '#00ff41' }}>
        SECTOR 7-G • REACTOR: STABLE
      </div>
      <div className="text-green-300 mt-1" style={{ color: '#00dd33' }}>
        {currentTime} {getTimezoneAbbr()}
      </div>
    </div>
  );
};

export default UniversalSectorClock;
