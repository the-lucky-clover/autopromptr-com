
import React, { useState, useEffect } from 'react';
import AnalogueClockComponent from './clock/AnalogueClockComponent';
import EnhancedMeltdownSystem from './clock/EnhancedMeltdownSystem';

interface AnalogueDropdownClockProps {
  enableEasterEgg?: boolean;
  clockColor?: string;
}

const AnalogueDropdownClock: React.FC<AnalogueDropdownClockProps> = ({
  enableEasterEgg = false,
  clockColor = "#10B981"
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showMeltdown, setShowMeltdown] = useState(false);
  const [isMeltdownAvailable, setIsMeltdownAvailable] = useState(true);

  useEffect(() => {
    // Show dropdown after component mounts
    setTimeout(() => setIsDropdownVisible(true), 500);
    
    // Check cooldown status
    checkMeltdownCooldown();
  }, []);

  const checkMeltdownCooldown = () => {
    if (!enableEasterEgg) return;
    
    const lastMeltdown = localStorage.getItem('lastMeltdownTrigger');
    if (lastMeltdown) {
      const lastTriggerTime = new Date(lastMeltdown).getTime();
      const currentTime = new Date().getTime();
      const oneHourInMs = 60 * 60 * 1000;
      
      if (currentTime - lastTriggerTime < oneHourInMs) {
        setIsMeltdownAvailable(false);
        
        // Set timer to re-enable after cooldown
        const remainingTime = oneHourInMs - (currentTime - lastTriggerTime);
        setTimeout(() => {
          setIsMeltdownAvailable(true);
        }, remainingTime);
      }
    }
  };

  const handleMeltdownTrigger = () => {
    if (!enableEasterEgg || !isMeltdownAvailable) return;
    
    console.log('🚨 SECTOR 7G REACTOR MELTDOWN INITIATED! 🚨');
    setShowMeltdown(true);
    setIsMeltdownAvailable(false);
    
    // Store trigger time for cooldown
    localStorage.setItem('lastMeltdownTrigger', new Date().toISOString());
  };

  const handleMeltdownComplete = () => {
    setShowMeltdown(false);
    
    // Set one-hour cooldown
    setTimeout(() => {
      setIsMeltdownAvailable(true);
    }, 60 * 60 * 1000); // 1 hour
  };

  return (
    <>
      <EnhancedMeltdownSystem
        isActive={showMeltdown}
        onComplete={handleMeltdownComplete}
      />

      <div 
        className={`fixed top-0 right-6 z-40 transition-all duration-700 ease-out ${
          isDropdownVisible ? 'translate-y-6' : '-translate-y-full'
        } ${showMeltdown ? 'pointer-events-none opacity-30' : ''}`}
      >
        <div className={`backdrop-blur-md rounded-b-xl p-6 border border-t-0 shadow-2xl transition-all duration-300 ${
          showMeltdown 
            ? 'bg-red-900/40 border-red-500/60' 
            : 'bg-black/30 border-white/30'
        }`}>
          <AnalogueClockComponent
            onMeltdownTrigger={handleMeltdownTrigger}
            isMeltdownAvailable={isMeltdownAvailable && enableEasterEgg}
            clockColor={clockColor}
          />
        </div>
      </div>
    </>
  );
};

export default AnalogueDropdownClock;
