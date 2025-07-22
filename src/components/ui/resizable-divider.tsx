import React from 'react';
import { cn } from '@/lib/utils';

interface ResizableDividerProps {
  onMouseDown: () => void;
  isResizing: boolean;
  className?: string;
}

export const ResizableDivider = ({ 
  onMouseDown, 
  isResizing, 
  className 
}: ResizableDividerProps) => {
  return (
    <div
      className={cn(
        "relative group cursor-col-resize select-none",
        className
      )}
      onMouseDown={onMouseDown}
    >
      {/* Invisible wider hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
      
      {/* Visible divider line */}
      <div 
        className={cn(
          "w-0.5 h-full bg-gray-600 transition-all duration-200",
          "group-hover:bg-blue-400 group-hover:w-1",
          isResizing && "bg-blue-500 w-1"
        )}
      />
      
      {/* Resize indicator */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "w-1 h-8 bg-gray-500 rounded-full opacity-0 transition-opacity duration-200",
          "group-hover:opacity-100",
          isResizing && "opacity-100 bg-blue-500"
        )}
      />
    </div>
  );
};