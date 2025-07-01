
import React from 'react';

interface ClockDisplayProps {
  currentTime: string;
  formatDate: () => string;
  getTimezoneAbbr: () => string;
  showMeltdown: boolean;
  timezone: string;
}

const ClockDisplay = ({ currentTime, formatDate, getTimezoneAbbr, showMeltdown, timezone }: ClockDisplayProps) => {
  const getTimezoneFullName = () => {
    const timezoneMap: { [key: string]: { name: string; offset: string } } = {
      'America/Los_Angeles': { name: 'Pacific', offset: 'UTC-8/-7' },
      'America/Denver': { name: 'Mountain', offset: 'UTC-7/-6' },
      'America/Chicago': { name: 'Central', offset: 'UTC-6/-5' },
      'America/New_York': { name: 'Eastern', offset: 'UTC-5/-4' },
      'UTC': { name: 'UTC', offset: 'UTC+0' },
      'Europe/London': { name: 'GMT', offset: 'UTC+0/+1' },
      'Asia/Tokyo': { name: 'Japan', offset: 'UTC+9' },
    };
    
    return timezoneMap[timezone] || { name: 'Pacific', offset: 'UTC-8/-7' };
  };

  const timezoneInfo = getTimezoneFullName();

  return (
    <div className="flex items-center space-x-3 text-white">
      <div className="text-left">
        <div className={`text-xs font-sans uppercase tracking-wider font-semibold ${
          showMeltdown ? 'text-red-400/80 animate-pulse' : 'text-yellow-400/80'
        }`}>
          SECTOR 7-G • {showMeltdown ? 'REACTOR CRITICAL' : 'REACTOR STABLE'}
        </div>
        <div className="font-sans font-medium leading-tight text-sm text-white/90" style={{ fontFamily: 'monospace', minWidth: '140px' }}>
          {formatDate()} • {currentTime}
        </div>
        <div className="text-xs font-sans text-white/60 mt-1">
          {timezoneInfo.name} ({timezoneInfo.offset})
        </div>
      </div>
    </div>
  );
};

export default ClockDisplay;
