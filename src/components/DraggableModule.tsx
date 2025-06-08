
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface DraggableModuleProps {
  id: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

const DraggableModule = ({ id, children, className = '', title }: DraggableModuleProps) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className} ${isDragging ? 'z-50 opacity-75' : ''}`}
      {...attributes}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20"
        title={`Drag to reposition ${title || 'module'}`}
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>
      {children}
    </div>
  );
};

export default DraggableModule;
