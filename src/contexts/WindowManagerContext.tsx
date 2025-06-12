
import React, { useState, ReactNode } from 'react';

interface WindowState {
  id: string;
  title: string;
  isMinimized: boolean;
  isClosed: boolean;
  isFocused: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

interface WindowManagerContextType {
  windows: WindowState[];
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  registerWindow: (window: WindowState) => void;
  unregisterWindow: (id: string) => void;
}

export const WindowManagerContext = React.createContext<WindowManagerContextType | null>(null);

export const WindowManagerProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id 
        ? { ...w, isFocused: true, zIndex: nextZIndex }
        : { ...w, isFocused: false }
    ));
    setNextZIndex(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized, isFocused: false } : w
    ));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isClosed: true, isFocused: false } : w
    ));
  };

  const registerWindow = (window: WindowState) => {
    setWindows(prev => [...prev.filter(w => w.id !== window.id), window]);
  };

  const unregisterWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  return (
    <WindowManagerContext.Provider value={{
      windows,
      focusWindow,
      minimizeWindow,
      closeWindow,
      registerWindow,
      unregisterWindow
    }}>
      {children}
    </WindowManagerContext.Provider>
  );
};

export type { WindowState, WindowManagerContextType };
