import React, { useRef, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ResizableDivider } from "@/components/ui/resizable-divider";
import { useResizableSidebar } from "@/hooks/useResizableSidebar";

interface ResizableDashboardLayoutProps {
  children: React.ReactNode;
}

export const ResizableDashboardLayout = ({ children }: ResizableDashboardLayoutProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    sidebarWidth,
    isResizing,
    startResize,
    resize
  } = useResizableSidebar({
    minWidth: 200,
    maxWidth: 400,
    defaultWidth: 306 // 256 + 50 for the expansion requested
  });

  // Handle mouse move during resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      resize(e.clientX, sidebarRef);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isResizing, resize]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <div 
            ref={sidebarRef}
            style={{ width: `${sidebarWidth}px` }}
            className="relative"
          >
            <AppSidebar width={sidebarWidth} />
          </div>
          
          {/* Draggable divider */}
          <ResizableDivider
            onMouseDown={startResize}
            isResizing={isResizing}
            className="z-20"
          />
        </div>
        
        <SidebarInset className="flex-1 relative">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};