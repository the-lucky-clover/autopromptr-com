
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
          
          {/* Big Glowing Safety Yellow Radioactive Symbol */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Radiation 
                className="w-32 h-32 text-yellow-400 animate-spin"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.8)) drop-shadow(0 0 40px rgba(250, 204, 21, 0.6))',
                  animation: 'spin 2s linear infinite, pulse 1s ease-in-out infinite alternate'
                }}
              />
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-yellow-400 animate-ping opacity-60" />
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-yellow-400/20 animate-pulse" />
            </div>
          </div>
          
          {/* Emergency Alert Banner */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-900/95 backdrop-blur-sm border-2 border-red-500 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-300 animate-bounce" />
              <div>
                <p className="text-red-300 font-mono text-2xl font-bold">
                  ⚠️ REACTOR EMERGENCY ⚠️
                </p>
                <p className="text-red-400 font-mono text-lg mt-1">
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
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-16 rounded-b-full animate-pulse"
                style={{
                  backgroundColor: i % 2 === 0 ? '#ef4444' : '#facc15',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.4s',
                  filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.6))'
                }}
              />
            ))}
          </div>
          
          {/* Screen Shake Effect */}
          <div 
            className="absolute inset-0"
            style={{
              animation: 'shake 0.3s ease-in-out infinite'
            }}
          >
            {/* Warning Messages */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 backdrop-blur-sm border-2 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-yellow-300 animate-spin" />
                <p className="text-yellow-200 font-mono text-lg font-bold">
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
            className="absolute inset-0 bg-gradient-to-r from-red-600/40 via-yellow-600/40 to-red-600/40 animate-pulse"
            style={{
              animation: 'pulse 0.2s ease-in-out infinite alternate'
            }}
          />
          
          {/* Critical Warning */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-red-900/95 backdrop-blur-sm border-2 border-red-400 rounded-lg p-6 animate-bounce">
            <div className="text-center">
              <ShieldAlert className="w-12 h-12 text-red-300 mx-auto mb-2 animate-spin" />
              <p className="text-red-200 font-mono text-xl font-bold">
                🚨 REACTOR MELTDOWN IMMINENT 🚨
              </p>
              <p className="text-red-300 font-mono text-sm mt-2">
                CORE TEMPERATURE EXCEEDING SAFE LIMITS
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase 4: Reactor Doors Close */}
      {meltdownPhase >= 4 && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm">
          {/* Reactor Door Animation */}
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
            <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-yellow-400 via-red-500 to-yellow-400 transform -translate-x-1/2 animate-pulse opacity-80" />
          </div>
          
          {/* Dashboard Lockout Message */}
          {dashboardLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="bg-red-900/90 backdrop-blur-sm border-2 border-red-500 rounded-xl p-8 max-w-md">
                <ShieldAlert className="w-16 h-16 text-red-300 mx-auto mb-4 animate-pulse" />
                <h2 className="text-red-200 font-mono text-2xl font-bold mb-4">
                  SYSTEM LOCKED
                </h2>
                <p className="text-red-300 font-mono text-lg mb-4">
                  REACTOR EMERGENCY IN PROGRESS
                </p>
                <div className="text-yellow-400 font-mono text-3xl font-bold animate-pulse">
                  {countdown}
                </div>
                <p className="text-red-400 font-mono text-sm mt-2">
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
