
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GripHorizontal, Minimize2, X } from 'lucide-react';
import { ModuleState } from '@/hooks/useDashboardModules';

interface DashboardModuleWrapperProps {
  id: string;
  title: string;
  state: ModuleState;
  onStateChange: (newState: ModuleState) => void;
  children: React.ReactNode;
  className?: string;
}

const DashboardModuleWrapper = ({
  id,
  title,
  state,
  onStateChange,
  children,
  className = ''
}: DashboardModuleWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMinimize = () => {
    onStateChange(state === 'minimized' ? 'full' : 'minimized');
  };

  const handleClose = () => {
    onStateChange('closed');
  };

  const getModuleClasses = () => {
    const base = 'bg-white/10 backdrop-blur-sm border-white/20 rounded-xl transition-all duration-300';
    
    switch (state) {
      case 'full':
        return `${base} w-full`;
      case 'minimized':
        return `${base} w-full lg:w-[calc(50%-0.5rem)] h-64`;
      default:
        return base;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${getModuleClasses()} ${className} ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      {/* Module Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none"
          >
            <GripHorizontal className="w-4 h-4 text-purple-300 hover:text-purple-100 transition-colors" />
          </div>
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
            onClick={handleMinimize}
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Module Content */}
      <div className={`${state === 'minimized' ? 'p-3' : 'p-5'} overflow-hidden`}>
        {children}
      </div>
    </Card>
  );
};

export default DashboardModuleWrapper;
