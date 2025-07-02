import React, { useState, useEffect } from 'react';

interface AnalogueDropdownClockProps {
  enableEasterEgg?: boolean;
  clockColor?: string;
}

const AnalogueDropdownClock: React.FC<AnalogueDropdownClockProps> = ({
  enableEasterEgg = false,
  clockColor = '#10B981'
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime(); // Set immediately
    const timer = setInterval(updateTime, 50); // smoother animation
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  const secondAngle = seconds * 6 + milliseconds * 0.006;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds * (0.5 / 60);

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
          style={{ filter: `drop-shadow(0 0 8px ${clockColor}40)` }}
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
          y2="30"
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
          y2="20"
          stroke={clockColor}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 50 50)`}
        />

        {/* Second hand */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="12"
          stroke="#ef4444"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${secondAngle} 50 50)`}
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="3" fill={clockColor} />
      </svg>
    </div>
  );
};

export default AnalogueDropdownClock;
