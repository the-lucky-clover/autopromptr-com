
import React from 'react';
import { Radiation, AlertTriangle, Shield, ShieldAlert, Zap } from 'lucide-react';

interface MeltdownPhasesProps {
  meltdownPhase: number;
  dashboardLocked: boolean;
  countdown: number;
}

const MeltdownPhases = ({ meltdownPhase, dashboardLocked, countdown }: MeltdownPhasesProps) => {
  return (
    <>
      {/* Phase 1: Initial Warning */}
      {meltdownPhase >= 1 && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Flashing Red Alert Background */}
          <div 
            className="absolute inset-0 bg-red-600/30 animate-pulse"
            style={{
              animation: 'pulse 0.5s ease-in-out infinite alternate'
            }}
          />
          
          {/* Giant Pulsing Radioactive Symbol */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Radiation 
                className="w-40 h-40 text-yellow-400"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(250, 204, 21, 0.9)) drop-shadow(0 0 60px rgba(250, 204, 21, 0.7))',
                  animation: 'spin 2s linear infinite, pulse 1s ease-in-out infinite alternate'
                }}
              />
              <div className="absolute inset-0 w-40 h-40 rounded-full border-4 border-yellow-400 animate-ping opacity-60" />
              <div className="absolute inset-0 w-40 h-40 rounded-full bg-yellow-400/20 animate-pulse" />
            </div>
          </div>
          
          {/* Emergency Alert Banner */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-900/95 backdrop-blur-sm border-2 border-red-500 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-300 animate-bounce" />
              <div>
                <p className="text-red-200 font-mono text-3xl font-bold">
                  ⚠️ REACTOR EMERGENCY ⚠️
                </p>
                <p className="text-red-400 font-mono text-xl mt-1">
                  Springfield Nuclear Power Plant - Sector 7G
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-300 animate-bounce" />
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 2: Escalation with Sirens */}
      {meltdownPhase >= 2 && (
        <div className="fixed inset-0 z-[9998] pointer-events-none">
          {/* Flashing Emergency Sirens */}
          <div className="absolute top-0 left-0 right-0 flex justify-center space-x-8">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-20 rounded-b-full animate-pulse"
                style={{
                  backgroundColor: i % 2 === 0 ? '#ef4444' : '#facc15',
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.3s',
                  filter: 'drop-shadow(0 6px 16px rgba(239, 68, 68, 0.8))'
                }}
              />
            ))}
          </div>
          
          {/* Screen Shake Effect */}
          <div 
            className="absolute inset-0"
            style={{
              animation: 'shake 0.2s ease-in-out infinite'
            }}
          >
            {/* Warning Messages */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 backdrop-blur-sm border-2 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-yellow-300 animate-spin" />
                <p className="text-yellow-200 font-mono text-xl font-bold">
                  CONTAINMENT SYSTEMS FAILING
                </p>
                <Zap className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 3: Critical Alert */}
      {meltdownPhase >= 3 && (
        <div className="fixed inset-0 z-[9997] pointer-events-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-red-600/50 via-yellow-600/50 to-red-600/50 animate-pulse"
            style={{
              animation: 'pulse 0.15s ease-in-out infinite alternate'
            }}
          />
          
          {/* ALERT DANGER ALERT MELTDOWN IMMINENT */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-red-900/95 backdrop-blur-sm border-2 border-red-400 rounded-lg p-8 animate-bounce">
            <div className="text-center">
              <ShieldAlert className="w-16 h-16 text-red-300 mx-auto mb-4 animate-spin" />
              <p className="text-red-200 font-mono text-4xl font-bold animate-pulse">
                🚨 ALERT DANGER ALERT 🚨
              </p>
              <p className="text-red-300 font-mono text-2xl mt-2 animate-pulse">
                MELTDOWN IMMINENT
              </p>
              <p className="text-red-400 font-mono text-lg mt-2">
                CORE TEMPERATURE CRITICAL
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 4: Reactor Doors Slam Shut */}
      {meltdownPhase >= 4 && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm">
          {/* Reactor Door Animation - Split panels slamming shut */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Left Door Half */}
            <div 
              className="absolute top-0 left-0 w-1/2 h-full bg-cover bg-center transition-transform duration-2000 ease-out"
              style={{
                backgroundImage: `url('/lovable-uploads/2b1b9825-ba4e-4e5f-9c56-26dc0f6ee911.png')`,
                backgroundPosition: 'left center',
                transform: meltdownPhase >= 4 ? 'translateX(0)' : 'translateX(-100%)',
                clipPath: 'inset(0 50% 0 0)'
              }}
            />
            
            {/* Right Door Half */}
            <div 
              className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center transition-transform duration-2000 ease-out"
              style={{
                backgroundImage: `url('/lovable-uploads/2b1b9825-ba4e-4e5f-9c56-26dc0f6ee911.png')`,
                backgroundPosition: 'right center',
                transform: meltdownPhase >= 4 ? 'translateX(0)' : 'translateX(100%)',
                clipPath: 'inset(0 0 0 50%)'
              }}
            />
            
            {/* Central Seam Light Effect */}
            <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-yellow-400 via-red-500 to-yellow-400 transform -translate-x-1/2 animate-pulse opacity-90" />
          </div>
          
          {/* Dashboard Lockout Message */}
          {dashboardLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="bg-red-900/90 backdrop-blur-sm border-2 border-red-500 rounded-xl p-8 max-w-md">
                <div className="relative mb-6">
                  <Radiation className="w-20 h-20 text-yellow-400 mx-auto animate-spin" style={{
                    filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.9)) drop-shadow(0 0 40px rgba(250, 204, 21, 0.6))',
                    animation: 'spin 1s linear infinite, pulse 0.5s ease-in-out infinite alternate'
                  }} />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-yellow-400 animate-ping opacity-60 mx-auto" />
                </div>
                <h2 className="text-red-200 font-mono text-3xl font-bold mb-4 animate-pulse">
                  SYSTEM LOCKED
                </h2>
                <p className="text-red-300 font-mono text-xl mb-4 animate-pulse">
                  REACTOR EMERGENCY IN PROGRESS
                </p>
                <div className="text-yellow-400 font-mono text-5xl font-bold animate-pulse mb-4">
                  {countdown}
                </div>
                <p className="text-red-400 font-mono text-lg animate-pulse">
                  Containment protocol active...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MeltdownPhases;
