
import { useState, useEffect, useRef } from 'react';

interface UseClockHoverProps {
  onMeltdownStart: () => void;
}

export const useClockHover = ({ onMeltdownStart }: UseClockHoverProps) => {
  const [isDirectHover, setIsDirectHover] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(0);
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle direct hover timer for meltdown sequence
  useEffect(() => {
    if (isDirectHover) {
      hoverIntervalRef.current = setInterval(() => {
        setHoverTimer(prev => {
          const newTimer = prev + 0.1;
          if (newTimer >= 13) {
            onMeltdownStart();
            return 0;
          }
          return newTimer;
        });
      }, 100);
    } else {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
      setHoverTimer(0);
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [isDirectHover, onMeltdownStart]);

  const handleMouseEnter = () => {
    setIsDirectHover(true);
  };

  const handleMouseLeave = () => {
    setIsDirectHover(false);
  };

  return {
    handleMouseEnter,
    handleMouseLeave,
    hoverTimer
  };
};
