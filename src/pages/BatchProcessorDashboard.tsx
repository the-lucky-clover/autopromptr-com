
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardBatchManager } from "@/components/DashboardBatchManager";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";

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
            <UnifiedDashboardWelcomeModule
              title="Batch Processor"
              subtitle="Create, manage, and execute automated prompt batches across multiple AI platforms."
              clockColor="#F59E0B"
              showPersonalizedGreeting={false}
            />
            
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
