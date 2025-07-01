
import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import BatchProcessorControlBar from "@/components/BatchProcessorControlBar";
import YourBatchesModule from "@/components/YourBatchesModule";
import DashboardWelcomeModule from "@/components/dashboard/DashboardWelcomeModule";
import UniversalSectorClock from "@/components/UniversalSectorClock";

const BatchProcessorDashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });
  
  const [batches, setBatches] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStatsUpdate = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  const handleBatchesUpdate = useCallback((newBatches: any[]) => {
    setBatches(newBatches);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleNewBatch = useCallback(() => {
    if (window.dashboardNewBatchHandler) {
      window.dashboardNewBatchHandler();
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <UniversalSectorClock />
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <DashboardWelcomeModule 
              title="Automation" 
              subtitle="Batch Automation Dashboard - Manage and execute your prompt batches"
            />
            
            <div className="p-8 space-y-8">
              {/* Batch Controls Module */}
              <BatchProcessorControlBar 
                onRefresh={handleRefresh}
                onNewBatch={handleNewBatch}
              />
              
              {/* Your Batches Module */}
              <YourBatchesModule 
                onStatsUpdate={handleStatsUpdate} 
                onBatchesUpdate={handleBatchesUpdate}
                onNewBatchRequest={handleNewBatch}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <FloatingConsoleButton />
    </div>
  );
};

export default BatchProcessorDashboard;
