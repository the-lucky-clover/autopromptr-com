
import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import BatchProcessorControlBar from "@/components/BatchProcessorControlBar";
import AnimatedDropdownClock from "@/components/AnimatedDropdownClock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    // Call the dashboard's new batch handler
    if (window.dashboardNewBatchHandler) {
      window.dashboardNewBatchHandler();
    }
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
              
              {/* Single New Batch Button */}
              <Button
                onClick={handleNewBatch}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-medium shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Batch
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Control Bar - removed onNewBatch prop since we handle it in header */}
              <BatchProcessorControlBar 
                onRefresh={handleRefresh}
              />
              
              {/* Batch Manager */}
              <div className="max-w-full">
                <DashboardBatchManager 
                  onStatsUpdate={handleStatsUpdate} 
                  onBatchesUpdate={handleBatchesUpdate}
                  isCompact={false}
                  onNewBatchRequest={handleNewBatch}
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
