
import React from 'react';

interface ClockDisplayProps {
  time: Date;
  meltdownPhase: number;
  clockColor: string;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ time, meltdownPhase, clockColor }) => {
  const getIntensity = () => {
    const baseIntensity = 0.3;
    const phaseIntensity = meltdownPhase * 0.2;
    return Math.min(baseIntensity + phaseIntensity, 1);
  };

  const getGlowStyle = () => {
    const intensity = getIntensity();
    return {
      boxShadow: `0 0 ${20 + meltdownPhase * 10}px ${clockColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
      filter: `brightness(${1 + intensity})`,
    };
  };

  return (
    <div 
      className="w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-300"
      style={{
        borderColor: clockColor,
        backgroundColor: `${clockColor}20`,
        ...getGlowStyle()
      }}
    >
      <div 
        className="text-lg font-mono font-bold tracking-wider transition-all duration-300"
        style={{ 
          color: clockColor,
          textShadow: `0 0 10px ${clockColor}80`
        }}
      >
        {time.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default ClockDisplay;
