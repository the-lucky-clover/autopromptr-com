
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';

interface CleanDraggableModuleWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CleanDraggableModuleWrapper = ({
  id,
  title,
  children,
  className = ''
}: CleanDraggableModuleWrapperProps) => {
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
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-gray-100/90 backdrop-blur-sm border-gray-200/50 rounded-xl transition-all duration-300 hover:shadow-lg group ${className} ${
        isDragging ? 'z-50 shadow-2xl rotate-2' : ''
      }`}
    >
      {/* Clean Header with Invisible Floating Dragbar */}
      <div className="relative px-6 py-4 border-b border-gray-200/30">
        {/* Invisible Floating Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-move opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center bg-blue-500/10 rounded-t-xl"
        >
          <GripHorizontal className="w-5 h-5 text-blue-600/60" />
        </div>
        
        {/* Module Title */}
        <h3 className="text-lg font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-700">
          {title}
        </h3>
      </div>
      
      {/* Module Content */}
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
};

export default CleanDraggableModuleWrapper;
