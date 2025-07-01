
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';

const EnhancedRealTimeClock = () => {
  const { getCurrentTime, getTimezoneAbbr } = useTimezone();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentTime());
    };

    updateTime(); // Update immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [getCurrentTime]);

  return (
    <div className="flex items-center justify-end space-x-2 text-white/90">
      <Clock className="w-4 h-4" />
      <div className="text-right">
        <div className="text-lg font-mono font-medium leading-tight">
          {currentTime}
        </div>
        <div className="text-xs text-white/70 font-medium">
          {getTimezoneAbbr()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedRealTimeClock;
