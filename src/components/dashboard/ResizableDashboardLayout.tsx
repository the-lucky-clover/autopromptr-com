import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface ResizableDashboardLayoutProps {
  children: React.ReactNode;
}

const FIXED_SIDEBAR_WIDTH = 306;

export const ResizableDashboardLayout = ({ children }: ResizableDashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <div 
            style={{ width: `${FIXED_SIDEBAR_WIDTH}px` }}
            className="relative"
          >
            <AppSidebar width={FIXED_SIDEBAR_WIDTH} />
          </div>
          
          {/* Fixed visual separator */}
          <div className="w-px bg-border" />
        </div>
        
        <SidebarInset className="flex-1 relative">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};