
import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import BatchProcessorControlBar from "@/components/BatchProcessorControlBar";
import YourBatchesModule from "@/components/YourBatchesModule";
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
            <div className="flex justify-between items-center p-8 border-b border-white/10">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">Automation</h1>
                <p className="text-purple-200 text-lg">Batch Automation Dashboard - Manage and execute your prompt batches</p>
              </div>
              
              <Button
                onClick={handleNewBatch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300 animate-glow"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Batch
              </Button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Batch Controls Module */}
              <BatchProcessorControlBar 
                onRefresh={handleRefresh}
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
