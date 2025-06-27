

import React, { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingConsoleButton } from "@/components/admin/FloatingConsoleButton";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import DashboardModuleWrapper from "@/components/DashboardModuleWrapper";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import SystemReliabilityScore from "@/components/SystemReliabilityScore";
import BatchExtractorModule from "@/components/BatchExtractorModule";
import AnalyticsModule from "@/components/AnalyticsModule";

const Dashboard = () => {
  const { visibleModules, updateModuleState } = useDashboardModules();
  
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });
  
  const [batches, setBatches] = useState<any[]>([]);

  const handleStatsUpdate = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  const handleBatchesUpdate = useCallback((newBatches: any[]) => {
    setBatches(newBatches);
  }, []);

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  const renderModuleContent = (moduleId: string, componentName: string, isMinimized: boolean) => {
    switch (componentName) {
      case 'DashboardBatchManager':
        return (
          <DashboardBatchManager 
            onStatsUpdate={handleStatsUpdate} 
            onBatchesUpdate={handleBatchesUpdate}
            isCompact={isMinimized}
          />
        );
      
      case 'HealthStatusDashboard':
        return <HealthStatusDashboardWrapper isCompact={isMinimized} />;
      
      case 'SystemLogsPanel':
        return <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} isCompact={isMinimized} />;
      
      case 'DashboardSubscription':
        return <DashboardSubscription isCompact={isMinimized} />;
      
      case 'DashboardStatsModule':
        return <DashboardStatsModule stats={stats} isCompact={isMinimized} />;

      case 'SystemReliabilityScore':
        return <SystemReliabilityScore isCompact={isMinimized} />;

      case 'BatchExtractorModule':
        return <BatchExtractorModule isCompact={isMinimized} />;

      case 'AnalyticsModule':
        return <AnalyticsModule isCompact={isMinimized} />;
      
      default:
        return <div>Module content not found</div>;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="p-6 space-y-6">
              {visibleModules.map((module) => (
                <DashboardModuleWrapper
                  key={module.id}
                  id={module.id}
                  title={module.title}
                  state={module.state}
                  onStateChange={(newState) => updateModuleState(module.id, newState)}
                >
                  {renderModuleContent(module.id, module.component, module.state === 'minimized')}
                </DashboardModuleWrapper>
              ))}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <FloatingConsoleButton />
    </div>
  );
};

export default Dashboard;

