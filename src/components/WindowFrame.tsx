
import React, { useEffect, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Minimize2, 
  X, 
  GripHorizontal
} from 'lucide-react';
import { WindowManagerContext } from '@/contexts/WindowManagerContext';

interface WindowFrameProps {
  children: ReactNode;
  windowId: string;
  title: string;
  defaultPosition?: { x: number; y: number };
  onClose?: () => void;
  className?: string;
}

export const WindowFrame = ({ 
  children, 
  windowId, 
  title, 
  defaultPosition = { x: 0, y: 0 },
  onClose,
  className = ''
}: WindowFrameProps) => {
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
      {/* Window Header with improved spacing */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10">
        <div className="flex items-center space-x-3">
          <GripHorizontal className="w-4 h-4 text-purple-300 cursor-move" />
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-yellow-400 hover:bg-yellow-400/20 rounded-lg"
            onClick={() => minimizeWindow(windowId)}
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-red-400 hover:bg-red-400/20 rounded-lg"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Window Content with consistent padding */}
      <div className="p-5">
        {children}
      </div>
    </Card>
  );
};
