
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import BatchProcessorWelcomeCard from "@/components/dashboard/BatchProcessorWelcomeCard";
import AnalogueDropdownClock from "@/components/AnalogueDropdownClock";

const BatchProcessorDashboard = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            {/* Clock positioned in upper right corner */}
            <div className="fixed top-4 right-6 z-50">
              <AnalogueDropdownClock 
                enableEasterEgg={true} 
                clockColor="#F59E0B" 
              />
            </div>
            
            {/* Welcome card with video background */}
            <BatchProcessorWelcomeCard />
            
            <div className="px-6">
              <DashboardBatchManager />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default BatchProcessorDashboard;
