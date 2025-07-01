
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealTimeClockProps {
  use24Hour?: boolean;
}

const RealTimeClock = ({ use24Hour = true }: RealTimeClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    if (use24Hour) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  };

  const getTimezone = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map common timezones to readable names
    const timezoneMap: { [key: string]: string } = {
      'America/New_York': 'Eastern',
      'America/Chicago': 'Central', 
      'America/Denver': 'Mountain',
      'America/Los_Angeles': 'Pacific',
      'America/Phoenix': 'Mountain',
      'America/Anchorage': 'Alaska',
      'Pacific/Honolulu': 'Hawaii',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'Europe/Berlin': 'CET',
      'Asia/Tokyo': 'JST',
      'Asia/Shanghai': 'CST',
      'Australia/Sydney': 'AEDT'
    };
    
    return timezoneMap[timezone] || timezone.split('/')[1]?.replace('_', ' ') || 'Local';
  };

  return (
    <div className="flex items-center space-x-2 text-gray-700">
      <Clock className="h-3 w-3" />
      <div className="flex flex-col text-xs text-right">
        <span className="font-mono font-medium">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-gray-500">
          {getTimezone()}
        </span>
      </div>
    </div>
  );
};

export default RealTimeClock;
