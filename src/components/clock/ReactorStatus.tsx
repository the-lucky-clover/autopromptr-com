
import React from 'react';
import { Radiation } from 'lucide-react';

interface ReactorStatusProps {
  showMeltdown: boolean;
}

const ReactorStatus = ({ showMeltdown }: ReactorStatusProps) => {
  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div className="relative">
        <div className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center ${
          showMeltdown 
            ? 'bg-red-500/30 border-red-400/60 animate-bounce' 
            : 'bg-yellow-400/20 border-yellow-400/40 animate-pulse'
        }`}>
          <Radiation className={`w-5 h-5 ${
            showMeltdown 
              ? 'text-red-400 animate-spin' 
              : 'text-yellow-400'
          }`} style={{
            filter: showMeltdown 
              ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))'
              : 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))',
            animation: showMeltdown 
              ? 'spin 1s linear infinite, pulse 0.5s ease-in-out infinite alternate' 
              : 'pulse 2s ease-in-out infinite'
          }} />
        </div>
        
        {/* Enhanced Glow Effects */}
        <div className={`absolute inset-0 w-8 h-8 rounded-full ${
          showMeltdown ? 'bg-red-400/20 animate-ping' : 'bg-yellow-400/10 animate-ping'
        }`} />
        {showMeltdown && (
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-red-600/30 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default ReactorStatus;
