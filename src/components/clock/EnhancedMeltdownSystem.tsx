
import React, { useState, useEffect } from 'react';
import { Radiation, AlertTriangle, ShieldAlert } from 'lucide-react';

interface EnhancedMeltdownSystemProps {
  isActive: boolean;
  onComplete: () => void;
}

const EnhancedMeltdownSystem: React.FC<EnhancedMeltdownSystemProps> = ({
  isActive,
  onComplete
}) => {
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      setCountdown(15);
      return;
    }

    // Enhanced meltdown sequence with slower timing
    const sequence = [
      { delay: 0, phase: 1 }, // Initial warning
      { delay: 4000, phase: 2 }, // Escalation
      { delay: 8000, phase: 3 }, // Critical
      { delay: 12000, phase: 4 }, // Reactor doors
    ];

    const timers = sequence.map(({ delay, phase: targetPhase }) =>
      setTimeout(() => setPhase(targetPhase), delay)
    );

    // Countdown and cleanup
    const countdownTimer = setTimeout(() => {
      let timeLeft = 15;
      const countdownInterval = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          onComplete();
        }
      }, 1000);
    }, 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(countdownTimer);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <>
      {/* Phase 1: Initial Warning */}
      {phase >= 1 && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div 
            className="absolute inset-0 bg-red-600/20 transition-opacity duration-1000"
            style={{ animation: 'pulse 1s ease-in-out infinite alternate' }}
          />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Radiation 
              className="w-48 h-48 text-yellow-400 transition-all duration-2000"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(250, 204, 21, 0.9))',
                animation: 'spin 3s linear infinite, pulse 2s ease-in-out infinite alternate'
              }}
            />
          </div>
          
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-900/95 backdrop-blur-sm border-2 border-red-500 rounded-xl p-8 transition-all duration-1000">
            <div className="flex items-center gap-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-300 animate-bounce" />
              <div>
                <h1 className="text-red-200 font-mono text-4xl font-bold mb-2">
                  ⚠️ REACTOR EMERGENCY ⚠️
                </h1>
                <p className="text-red-400 font-mono text-xl">
                  Springfield Nuclear Power Plant - Sector 7G
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-300 animate-bounce" />
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 2: Escalation */}
      {phase >= 2 && (
        <div className="fixed inset-0 z-[9998] pointer-events-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-yellow-600/30 to-red-600/30 transition-all duration-2000"
            style={{ animation: 'pulse 0.8s ease-in-out infinite alternate' }}
          />
          
          <div className="absolute top-0 left-0 right-0 flex justify-center space-x-12">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="w-10 h-24 rounded-b-full transition-all duration-2000"
                style={{
                  backgroundColor: i % 2 === 0 ? '#ef4444' : '#facc15',
                  animation: `pulse 0.6s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.2}s`,
                  filter: 'drop-shadow(0 8px 20px rgba(239, 68, 68, 0.8))'
                }}
              />
            ))}
          </div>
          
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-yellow-900/95 backdrop-blur-sm border-2 border-yellow-500 rounded-xl p-6 transition-all duration-2000">
            <div className="flex items-center gap-4 text-center">
              <ShieldAlert className="w-8 h-8 text-yellow-300 animate-spin" />
              <p className="text-yellow-200 font-mono text-2xl font-bold">
                CONTAINMENT SYSTEMS FAILING
              </p>
              <ShieldAlert className="w-8 h-8 text-yellow-300 animate-spin" />
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 3: Critical Alert */}
      {phase >= 3 && (
        <div className="fixed inset-0 z-[9997] pointer-events-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-red-600/40 via-yellow-600/40 to-red-600/40 transition-all duration-2000"
            style={{ animation: 'pulse 0.4s ease-in-out infinite alternate' }}
          />
          
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-red-900/98 backdrop-blur-sm border-2 border-red-400 rounded-xl p-10 transition-all duration-2000 animate-bounce">
            <div className="text-center">
              <Radiation className="w-20 h-20 text-red-300 mx-auto mb-6 animate-spin" />
              <h1 className="text-red-200 font-mono text-5xl font-bold mb-4 animate-pulse">
                🚨 ALERT DANGER ALERT 🚨
              </h1>
              <p className="text-red-300 font-mono text-3xl mb-4 animate-pulse">
                MELTDOWN IMMINENT
              </p>
              <p className="text-red-400 font-mono text-xl">
                CORE TEMPERATURE CRITICAL
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 4: Full Lockdown */}
      {phase >= 4 && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            {/* Reactor Door Animation */}
            <div 
              className="absolute top-0 left-0 w-1/2 h-full bg-cover bg-center transition-transform duration-3000 ease-out"
              style={{
                backgroundImage: `url('/lovable-uploads/2b1b9825-ba4e-4e5f-9c56-26dc0f6ee911.png')`,
                backgroundPosition: 'left center',
                transform: 'translateX(0)',
              }}
            />
            
            <div 
              className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center transition-transform duration-3000 ease-out"
              style={{
                backgroundImage: `url('/lovable-uploads/2b1b9825-ba4e-4e5f-9c56-26dc0f6ee911.png')`,
                backgroundPosition: 'right center',
                transform: 'translateX(0)',
              }}
            />
            
            <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-yellow-400 via-red-500 to-yellow-400 transform -translate-x-1/2 animate-pulse opacity-90" />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="bg-red-900/95 backdrop-blur-sm border-2 border-red-500 rounded-xl p-12 max-w-lg">
              <Radiation 
                className="w-24 h-24 text-yellow-400 mx-auto mb-8"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(250, 204, 21, 0.9))',
                  animation: 'spin 2s linear infinite, pulse 1s ease-in-out infinite alternate'
                }}
              />
              <h2 className="text-red-200 font-mono text-4xl font-bold mb-6 animate-pulse">
                SYSTEM LOCKED
              </h2>
              <p className="text-red-300 font-mono text-2xl mb-6 animate-pulse">
                REACTOR EMERGENCY IN PROGRESS
              </p>
              <div className="text-yellow-400 font-mono text-6xl font-bold animate-pulse mb-6">
                {countdown}
              </div>
              <p className="text-red-400 font-mono text-xl animate-pulse">
                Containment protocol active...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedMeltdownSystem;
