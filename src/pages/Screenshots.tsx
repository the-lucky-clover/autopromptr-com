
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import ScreenshotCapture from '@/components/ScreenshotCapture';
import ScreenshotGallery from '@/components/ScreenshotGallery';

const Screenshots = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-3 md:p-6 lg:p-8 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white truncate">Screenshots</h1>
                <p className="text-purple-200 text-xs md:text-sm lg:text-base">Capture and manage screenshots by session</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <ScreenshotCapture />
            <ScreenshotGallery />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Screenshots;
