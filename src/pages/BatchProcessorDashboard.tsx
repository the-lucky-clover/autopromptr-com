
import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import BatchProcessorControlBar from "@/components/BatchProcessorControlBar";
import AnimatedDropdownClock from "@/components/AnimatedDropdownClock";

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
    // This will be handled by the DashboardBatchManager
    console.log('New batch requested from control bar');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <AnimatedDropdownClock enableEasterEgg={false} />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Batch Processor</h1>
                <p className="text-purple-200">Manage and execute your prompt batches</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Big Beautiful Control Bar */}
              <BatchProcessorControlBar 
                onRefresh={handleRefresh}
                onNewBatch={handleNewBatch}
              />
              
              {/* Batch Manager */}
              <div className="max-w-full">
                <DashboardBatchManager 
                  onStatsUpdate={handleStatsUpdate} 
                  onBatchesUpdate={handleBatchesUpdate}
                  isCompact={false}
                  key={refreshTrigger}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <FloatingConsoleButton />
    </div>
  );
};

export default BatchProcessorDashboard;
