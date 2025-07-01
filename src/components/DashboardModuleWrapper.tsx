
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
        return `${base} w-full h-80`;
      default:
        return base;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${getModuleClasses()} ${className} ${isDragging ? 'z-50' : ''}`}
    >
      {/* Module Header */}
      <div className={`flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10 ${
        state === 'minimized' ? 'px-3 py-2' : 'px-4 py-3'
      }`}>
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none"
          >
            <GripHorizontal className={`text-purple-300 hover:text-purple-100 transition-colors ${
              state === 'minimized' ? 'w-3 h-3' : 'w-4 h-4'
            }`} />
          </div>
          <span className={`text-white font-medium ${
            state === 'minimized' ? 'text-xs' : 'text-sm'
          }`}>{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors ${
              state === 'minimized' ? 'w-5 h-5' : 'w-7 h-7'
            }`}
            onClick={handleMinimize}
          >
            <Minimize2 className={state === 'minimized' ? 'w-2 h-2' : 'w-3 h-3'} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`p-0 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors ${
              state === 'minimized' ? 'w-5 h-5' : 'w-7 h-7'
            }`}
            onClick={handleClose}
          >
            <X className={state === 'minimized' ? 'w-2 h-2' : 'w-3 h-3'} />
          </Button>
        </div>
      </div>
      
      {/* Module Content */}
      <div className={`overflow-hidden ${
        state === 'minimized' ? 'p-3 h-[calc(100%-3rem)]' : 'p-5'
      }`}>
        {children}
      </div>
    </Card>
  );
};

export default DashboardModuleWrapper;
