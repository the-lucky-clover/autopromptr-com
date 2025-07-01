
import { useState, useCallback } from 'react';

export type ConsoleLogType = 'info' | 'error' | 'warning';

export interface ConsoleLog {
  timestamp: string;
  type: ConsoleLogType;
  message: string;
}

export const useConsoleOutput = (initialLogs: string[] = []) => {
  const [consoleOutput, setConsoleOutput] = useState<ConsoleLog[]>(
    initialLogs.map(log => ({
      timestamp: new Date().toLocaleTimeString(),
      type: 'info' as ConsoleLogType,
      message: log
    }))
  );

  const addConsoleLog = useCallback((message: string, type: ConsoleLogType = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: ConsoleLog = { timestamp, type, message };
    
    setConsoleOutput(prev => [...prev.slice(-8), newLog]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleOutput([]);
  }, []);

  return {
    consoleOutput,
    addConsoleLog,
    clearConsole
  };
};
