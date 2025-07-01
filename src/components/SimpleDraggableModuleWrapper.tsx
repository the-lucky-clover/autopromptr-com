
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';

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
      className={`bg-white/10 backdrop-blur-sm border-white/20 rounded-xl transition-all duration-300 ${className} ${isDragging ? 'z-50' : ''}`}
    >
      <div 
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl border-b border-white/10 px-4 py-3 cursor-move"
        {...attributes}
        {...listeners}
      >
        <span className="text-sm text-white font-medium">{title}</span>
      </div>
      
      <div className="p-5 overflow-hidden">
        {children}
      </div>
    </Card>
  );
};

export default SimpleDraggableModuleWrapper;
