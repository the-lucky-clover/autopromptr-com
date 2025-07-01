
import React from 'react';
import { Terminal } from 'lucide-react';
import { ConsoleLog } from '@/hooks/useConsoleOutput';

interface ConsoleOutputDisplayProps {
  consoleOutput: ConsoleLog[];
}

const ConsoleOutputDisplay = ({ consoleOutput }: ConsoleOutputDisplayProps) => {
  return (
    <div className="bg-black/50 rounded-lg p-4 border border-white/10">
      <div className="flex items-center space-x-2 mb-3">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-mono text-sm">Protected Health Monitor</span>
      </div>
      
      <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
        {consoleOutput.map((log, index) => (
          <div 
            key={index} 
            className={`${
              log.type === 'error' ? 'text-red-300' : 
              log.type === 'warning' ? 'text-yellow-300' : 
              'text-green-300'
            }`}
          >
            [{log.timestamp}] {log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : '✅'} {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsoleOutputDisplay;
