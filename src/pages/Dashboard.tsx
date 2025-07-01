
import React, { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import SystemReliabilityScore from "@/components/SystemReliabilityScore";
import AnalyticsModule from "@/components/AnalyticsModule";
import ConsoleMonitorModule from "@/components/ConsoleMonitorModule";
import RecentActivity from "@/components/RecentActivity";
import PsychedelicZapIcon from "@/components/PsychedelicZapIcon";
import { Card, CardContent } from "@/components/ui/card";

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

  // Filter out batch manager and extractor modules for overview
  const overviewModules = visibleModules.filter(module => 
    module.id !== 'batch-processor' && 
    module.id !== 'batch-extractor'
  );

  const renderModuleContent = (moduleId: string, componentName: string, isMinimized: boolean) => {
    switch (componentName) {
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

      case 'AnalyticsModule':
        return <AnalyticsModule isCompact={isMinimized} />;

      case 'ConsoleMonitorModule':
        return <ConsoleMonitorModule isCompact={isMinimized} />;
      
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
            {/* Welcome Banner with Psychedelic Zap Icon */}
            <Card className="m-6 mb-4 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      👋 Welcome to AutoPromptr 😊
                    </h1>
                    <p className="text-purple-200 text-lg">
                      Your intelligent batch processing dashboard - manage, monitor, and optimize your AI workflows
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-6">
                    <PsychedelicZapIcon />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Three Column Layout */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-6">
                  {overviewModules.map((module) => 
                    renderModuleContent(module.id, module.component, false)
                  )}
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-4">
                  <RecentActivity />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
