
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
      className={`relative ${className} ${isDragging ? 'z-50 opacity-75' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default DraggableModule;
