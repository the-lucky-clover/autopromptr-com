
import React from 'react';

interface ClockStatusDisplayProps {
  time: Date;
  meltdownPhase: number;
  clockColor: string;
}

const ClockStatusDisplay: React.FC<ClockStatusDisplayProps> = ({ 
  time, 
  meltdownPhase, 
  clockColor 
}) => {
  const getStatusText = () => {
    const phases = [
      'OPERATIONAL',
      'ELEVATED',
      'CRITICAL',
      'MELTDOWN'
    ];
    return phases[meltdownPhase] || 'OPERATIONAL';
  };

  const getStatusColor = () => {
    if (meltdownPhase === 0) return clockColor;
    if (meltdownPhase === 1) return '#F59E0B';
    if (meltdownPhase === 2) return '#EF4444';
    return '#DC2626';
  };

  return (
    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
      <div 
        className="text-xs font-mono tracking-widest transition-all duration-300"
        style={{ 
          color: getStatusColor(),
          textShadow: `0 0 5px ${getStatusColor()}80`
        }}
      >
        {getStatusText()}
      </div>
    </div>
  );
};

export default ClockStatusDisplay;
