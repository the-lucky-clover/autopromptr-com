
import React from 'react';

interface AnimatedDropdownClockDisplayProps {
  currentTime: string;
  formatDate: () => string;
  getTimezoneAbbr: () => string;
  showMeltdown: boolean;
  timezone: string;
}

const AnimatedDropdownClockDisplay: React.FC<AnimatedDropdownClockDisplayProps> = ({
  currentTime,
  formatDate,
  getTimezoneAbbr,
  showMeltdown,
  timezone
}) => {
  return (
    <div className="text-center">
      <div className={`text-3xl font-mono font-bold transition-colors duration-300 ${
        showMeltdown ? 'text-red-400 animate-pulse' : 'text-white'
      }`}>
        {currentTime}
      </div>
      <div className={`text-sm transition-colors duration-300 ${
        showMeltdown ? 'text-red-300' : 'text-gray-300'
      }`}>
        {formatDate()} • {getTimezoneAbbr()}
      </div>
      {showMeltdown && (
        <div className="text-xs text-red-500 mt-1 animate-pulse">
          🚨 SECTOR 7G ALERT 🚨
        </div>
      )}
    </div>
  );
};

export default AnimatedDropdownClockDisplay;
