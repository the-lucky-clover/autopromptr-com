
import React from 'react';

interface ClockHoverHandlerProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  isHovered: boolean;
  meltdownPhase: number;
  children: React.ReactNode;
}

const ClockHoverHandler: React.FC<ClockHoverHandlerProps> = ({
  onMouseEnter,
  onMouseLeave,
  onClick,
  isHovered,
  meltdownPhase,
  children
}) => {
  return (
    <div
      className="cursor-pointer select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ClockHoverHandler;
