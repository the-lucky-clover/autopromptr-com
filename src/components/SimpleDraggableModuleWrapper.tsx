
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';

interface SimpleDraggableModuleWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SimpleDraggableModuleWrapper = ({
  id,
  title,
  children,
  className = ''
}: SimpleDraggableModuleWrapperProps) => {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-white/10 backdrop-blur-sm border-white/20 rounded-xl transition-all duration-300 ${className} ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none"
          >
            <GripHorizontal className="w-4 h-4 text-purple-300 hover:text-purple-100 transition-colors" />
          </div>
          <span className="text-sm text-white font-medium">{title}</span>
        </div>
      </div>
      
      <div className="p-5 overflow-hidden">
        {children}
      </div>
    </Card>
  );
};

export default SimpleDraggableModuleWrapper;
