
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BatchExtractorPageContent from "@/components/batch-extractor/BatchExtractorPageContent";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";

const BatchExtractorDashboard = () => {
  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            <UnifiedDashboardWelcomeModule
              title="Batch Extractor"
              subtitle="Extract and convert large text content into organized prompt batches for automated processing."
              clockColor="#06B6D4"
              showPersonalizedGreeting={false}
            />
            
            <div className="px-6">
              <div className="text-center py-8">
                <p className="text-gray-400">Batch Extractor functionality coming soon...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default BatchExtractorDashboard;
