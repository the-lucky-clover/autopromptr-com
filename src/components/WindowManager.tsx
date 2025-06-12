
import React, { useState, useEffect, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Minimize2, 
  X, 
  GripHorizontal,
  Monitor
} from 'lucide-react';

interface WindowState {
  id: string;
  title: string;
  isMinimized: boolean;
  isClosed: boolean;
  isFocused: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

interface WindowManagerProps {
  children: ReactNode;
  windowId: string;
  title: string;
  defaultPosition?: { x: number; y: number };
  onClose?: () => void;
  className?: string;
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
      <Taskbar />
    </WindowManagerContext.Provider>
  );
};

const Taskbar = () => {
  const context = React.useContext(WindowManagerContext);
  if (!context) return null;

  const { windows, focusWindow, minimizeWindow } = context;
  const visibleWindows = windows.filter(w => !w.isClosed);

  if (visibleWindows.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[10000]">
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 shadow-2xl">
        <div className="flex items-center space-x-2">
          {visibleWindows.map(window => (
            <Button
              key={window.id}
              variant="ghost"
              size="sm"
              className={`text-white rounded-xl transition-all ${
                window.isFocused ? 'bg-purple-500/30 border border-purple-400/50' : 'hover:bg-white/10'
              } ${window.isMinimized ? 'opacity-60' : ''}`}
              onClick={() => {
                if (window.isMinimized) {
                  minimizeWindow(window.id);
                }
                focusWindow(window.id);
              }}
            >
              <Monitor className="w-4 h-4 mr-2" />
              <span className="text-xs max-w-24 truncate">{window.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WindowFrame = ({ 
  children, 
  windowId, 
  title, 
  defaultPosition = { x: 0, y: 0 },
  onClose,
  className = ''
}: WindowManagerProps) => {
  const context = React.useContext(WindowManagerContext);
  if (!context) return <div className={className}>{children}</div>;

  const { windows, focusWindow, minimizeWindow, closeWindow, registerWindow } = context;
  const window = windows.find(w => w.id === windowId);

  useEffect(() => {
    registerWindow({
      id: windowId,
      title,
      isMinimized: false,
      isClosed: false,
      isFocused: true,
      zIndex: 1000,
      position: defaultPosition
    });
  }, [windowId, title]);

  if (!window || window.isClosed) return null;

  const handleClose = () => {
    closeWindow(windowId);
    onClose?.();
  };

  return (
    <Card 
      className={`${className} transition-all duration-300 ${
        window.isMinimized ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
      } ${
        window.isFocused ? 'ring-2 ring-purple-500/50 shadow-2xl' : 'shadow-lg'
      }`}
      style={{ 
        zIndex: window.zIndex,
        transform: window.isMinimized ? 'scale(0)' : 'scale(1)'
      }}
      onClick={() => !window.isFocused && focusWindow(windowId)}
    >
      {/* Window Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10">
        <div className="flex items-center space-x-2">
          <GripHorizontal className="w-4 h-4 text-purple-300 cursor-move" />
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-yellow-400 hover:bg-yellow-400/20 rounded-lg"
            onClick={() => minimizeWindow(windowId)}
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-red-400 hover:bg-red-400/20 rounded-lg"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="p-4">
        {children}
      </div>
    </Card>
  );
};
