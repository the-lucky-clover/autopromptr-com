import { useState, useCallback, useEffect } from 'react';

interface UseResizableSidebarProps {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey?: string;
}

export const useResizableSidebar = ({
  minWidth = 200,
  maxWidth = 400,
  defaultWidth = 256, // 64 * 4 (w-64 equivalent)
  storageKey = 'sidebar-width'
}: UseResizableSidebarProps = {}) => {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const width = parseInt(stored, 10);
        if (width >= minWidth && width <= maxWidth) {
          return width;
        }
      }
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((clientX: number, sidebarRef: React.RefObject<HTMLElement>) => {
    if (!sidebarRef.current || !isResizing) return;

    const rect = sidebarRef.current.getBoundingClientRect();
    const newWidth = clientX - rect.left;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing, minWidth, maxWidth]);

  // Save to localStorage when width changes
  useEffect(() => {
    localStorage.setItem(storageKey, sidebarWidth.toString());
  }, [sidebarWidth, storageKey]);

  // Handle mouse events
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      // This will be handled by the component with the sidebar ref
    };

    const handleMouseUp = () => {
      stopResize();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, stopResize]);

  return {
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    startResize,
    stopResize,
    resize,
    minWidth,
    maxWidth
  };
};