
import React, { useState, useEffect } from 'react';
import ClockDisplay from './EnhancedClockDisplay';
import ClockStatusDisplay from './EnhancedClockStatusDisplay';
import ClockHoverHandler from './ClockHoverHandler';
import ClockAudio from './ClockAudio';
import MeltdownPhases from './MeltdownPhases';

interface UniversalSectorClockProps {
  clockColor?: string;
}

const UniversalSectorClock: React.FC<UniversalSectorClockProps> = ({ 
  clockColor = "#10B981" 
}) => {
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const [meltdownPhase, setMeltdownPhase] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (meltdownPhase < 3) {
      setMeltdownPhase(prev => prev + 1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => {
      if (!isHovered) {
        setMeltdownPhase(0);
      }
    }, 2000);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const getMeltdownColor = () => {
    const phases = [
      clockColor, // Use provided color for phase 0
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#DC2626'  // Dark red
    ];
    return phases[meltdownPhase] || clockColor;
  };

  return (
    <div className="relative">
      <ClockHoverHandler
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleAudio}
        isHovered={isHovered}
        meltdownPhase={meltdownPhase}
      >
        <div className="relative w-32 h-32">
          <ClockDisplay 
            time={time} 
            meltdownPhase={meltdownPhase}
            clockColor={getMeltdownColor()}
          />
          <ClockStatusDisplay 
            time={time}
            meltdownPhase={meltdownPhase}
            clockColor={getMeltdownColor()}
          />
        </div>
      </ClockHoverHandler>
      
      <MeltdownPhases 
        meltdownPhase={meltdownPhase}
        dashboardLocked={false}
        countdown={10}
      />
      <ClockAudio enabled={audioEnabled && isHovered} />
    </div>
  );
};

export default UniversalSectorClock;
