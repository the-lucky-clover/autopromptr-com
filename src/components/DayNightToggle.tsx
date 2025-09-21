import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DayNightToggle = () => {
  const [isDayMode, setIsDayMode] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 6) % 360); // Rotate 6 degrees every interval
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const toggleMode = () => {
    setIsDayMode(!isDayMode);
  };

  return (
    <div className="fixed top-20 left-4 z-30 animate-fade-in delay-700">
      {/* Transparent window frame */}
      <div className="
        bg-card/20 
        backdrop-blur-md 
        border border-border/30 
        rounded-xl 
        p-3 
        shadow-elegant
        skeuomorphic-card
        w-16 h-16
        flex items-center justify-center
        hover:bg-card/30
        transition-all duration-300
        hover:shadow-glow-sm
      ">
        {/* Rotating toggle wheel */}
        <div 
          className="relative w-10 h-10 cursor-pointer"
          onClick={toggleMode}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Day/Night indicator wheel */}
          <div className="
            absolute inset-0 
            rounded-full 
            bg-gradient-to-br from-yellow-400/80 to-blue-600/80
            shadow-inner
            border border-white/20
            transition-all duration-500
            hover:scale-110
          ">
            {/* Sun/Moon icon overlay */}
            <div className="
              absolute inset-0 
              flex items-center justify-center
              transition-all duration-300
            ">
              {isDayMode ? (
                <Sun className="w-5 h-5 text-yellow-100 animate-pulse" />
              ) : (
                <Moon className="w-5 h-5 text-blue-100 animate-pulse" />
              )}
            </div>
            
            {/* Rotating inner wheel */}
            <div className="
              absolute top-1 left-1 
              w-2 h-2 
              bg-white/60 
              rounded-full 
              shadow-md
              animate-pulse
            " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayNightToggle;