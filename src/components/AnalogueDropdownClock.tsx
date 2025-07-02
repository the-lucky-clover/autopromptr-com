
import React, { useState, useEffect } from 'react';

interface AnalogueDropdownClockProps {
  enableEasterEgg?: boolean;
  clockColor?: string;
}

const AnalogueDropdownClock: React.FC<AnalogueDropdownClockProps> = ({ 
  enableEasterEgg = false, 
  clockColor = "#10B981" 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 100); // Update more frequently for smooth seconds hand

    return () => clearInterval(timer);
  }, []);

  // Get current local time (which should be Pacific time based on user's system)
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate angles with smooth seconds hand
  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = minutes * 6;
  const secondAngle = (seconds * 6) + (milliseconds * 0.006); // Smooth sweeping motion

  return (
    <div className="relative">
      <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Clock face */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="transparent"
          stroke={clockColor}
          strokeWidth="2"
          className="drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
        />
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="5"
            x2="50"
            y2="15"
            stroke={clockColor}
            strokeWidth="2"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        
        {/* Hour hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="25"
          stroke={clockColor}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 50 50)`}
        />
        
        {/* Minute hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke={clockColor}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 50 50)`}
        />
        
        {/* Seconds hand - sweeping motion */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="#ef4444"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${secondAngle} 50 50)`}
          style={{ 
            transition: milliseconds < 50 ? 'none' : 'transform 0.1s ease-out' 
          }}
        />
        
        {/* Center dot */}
        <circle cx="50" cy="50" r="3" fill={clockColor} />
      </svg>
    </div>
  );
};

export default AnalogueDropdownClock;
