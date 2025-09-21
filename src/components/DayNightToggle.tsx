import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const DayNightToggle = () => {
  const [isDayMode, setIsDayMode] = useState(true);
  const [rotation, setRotation] = useState(0);

  const toggleMode = () => {
    setIsDayMode(!isDayMode);
    setRotation(prev => prev + 180); // Rotate 180 degrees on each click
  };

  return (
    <div className="
      bg-card/20 
      backdrop-blur-md 
      border border-border/30 
      rounded-lg 
      p-2 
      shadow-elegant
      skeuomorphic-card
      w-10 h-10
      flex items-center justify-center
      hover:bg-card/30
      transition-all duration-300
      hover:shadow-glow-sm
    ">
      {/* Rotating toggle wheel */}
      <div 
        className="relative w-6 h-6 cursor-pointer"
        onClick={toggleMode}
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease-in-out' }}
      >
        {/* Day/Night indicator wheel */}
        <div className="
          absolute inset-0 
          rounded-full 
          bg-gradient-to-br from-yellow-400/80 to-blue-600/80
          shadow-inner
          border border-white/20
          transition-all duration-300
          hover:scale-110
        ">
          {/* Sun/Moon icon overlay */}
          <div className="
            absolute inset-0 
            flex items-center justify-center
            transition-all duration-300
          ">
            {isDayMode ? (
              <Sun className="w-3 h-3 text-yellow-100" />
            ) : (
              <Moon className="w-3 h-3 text-blue-100" />
            )}
          </div>
          
          {/* Rotating inner wheel */}
          <div className="
            absolute top-0.5 left-0.5 
            w-1 h-1 
            bg-white/60 
            rounded-full 
            shadow-sm
          " />
        </div>
      </div>
    </div>
  );
};

export default DayNightToggle;