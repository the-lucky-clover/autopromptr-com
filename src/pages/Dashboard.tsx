
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ModuleRestorePanel from "@/components/ModuleRestorePanel";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });

  const [batches, setBatches] = useState<any[]>([]);
  
  const {
    visibleModules,
    closedModules,
    updateModuleState,
    reorderModules,
    toggleModuleVisibility,
    resetLayout
  } = useDashboardModules();

  const handleStatsUpdate = (newStats: typeof stats) => {
    setStats(newStats);
  };

  const handleBatchesUpdate = (newBatches: any[]) => {
    setBatches(newBatches);
  };

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  const { renderModuleContent } = DashboardContent({
    visibleModules,
    stats,
    batches,
    hasActiveBatch,
    onStatsUpdate: handleStatsUpdate,
    onBatchesUpdate: handleBatchesUpdate
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <div className="shadow-2xl">
          <AppSidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <DashboardHeader />

          <DashboardLayout
            visibleModules={visibleModules}
            updateModuleState={updateModuleState}
            reorderModules={reorderModules}
            resetLayout={resetLayout}
            renderModuleContent={renderModuleContent}
          />

          {/* Module Restore Panel - Moved to Bottom */}
          <div className="mt-8">
            <ModuleRestorePanel
              closedModules={closedModules}
              onRestoreModule={toggleModuleVisibility}
              onResetLayout={resetLayout}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
