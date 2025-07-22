
import React from 'react';
import { ResizableDashboardLayout } from "@/components/dashboard/ResizableDashboardLayout";
import { DashboardBatchManager } from "@/components/DashboardBatchManager";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";
import MobileDashboardNavbar from "@/components/dashboard/MobileDashboardNavbar";

const BatchProcessorDashboard = () => {
  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      {/* Mobile Navigation */}
      <MobileDashboardNavbar />
      
      <ResizableDashboardLayout>
        <UnifiedDashboardWelcomeModule
          title="Batch Processor"
          subtitle="Create, manage, and execute automated prompt batches across multiple AI platforms."
          clockColor="#F59E0B"
          showPersonalizedGreeting={false}
        />
        
        <div className="px-4 md:px-6">
          <DashboardBatchManager />
        </div>
      </ResizableDashboardLayout>
    </div>
  );
};

export default BatchProcessorDashboard;
