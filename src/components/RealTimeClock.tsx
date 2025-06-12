
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());
  const [showSeparators, setShowSeparators] = useState(true);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const flashInterval = setInterval(() => {
      setShowSeparators(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(flashInterval);
    };
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const separator = showSeparators ? ':' : ' ';
    
    return `${hours}${separator}${minutes}${separator}${seconds}`;
  };

  const getTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] || 
           new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
  };

  return (
    <div className="flex items-center space-x-2 text-purple-200">
      <Clock className="h-3 w-3" />
      <div className="flex flex-col text-xs">
        <span className="font-mono font-medium">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-purple-300">
          {getTimezone()}
        </span>
      </div>
    </div>
  );
};

export default RealTimeClock;
