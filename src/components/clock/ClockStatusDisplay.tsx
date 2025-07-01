
import React from 'react';

interface ClockStatusDisplayProps {
  currentTime: string;
  getTimezoneAbbr: () => string;
  showMeltdown: boolean;
}

const ClockStatusDisplay = ({ currentTime, getTimezoneAbbr, showMeltdown }: ClockStatusDisplayProps) => {
  // Get current date info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = now.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = now.getDate();

  return (
    <>
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
    </>
  );
};

export default ClockStatusDisplay;
