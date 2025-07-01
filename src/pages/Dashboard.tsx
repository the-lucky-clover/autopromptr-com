
import React, { useState, useCallback, useEffect } from 'react';
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
import PromptIcon from "@/components/PromptIcon";
import VideoBackground from "@/components/VideoBackground";
import OverviewDashboardLayout from "@/components/dashboard/OverviewDashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import ErrorBoundary from "@/components/ErrorBoundary";

const Dashboard = () => {
  const { visibleModules, updateModuleState, reorderModules } = useDashboardModules();
  
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });
  
  const [batches, setBatches] = useState<any[]>([]);
  const [videoSettings, setVideoSettings] = useState({
    enabled: false,
    videoUrl: '',
    showAttribution: true
  });

  // Load video settings
  useEffect(() => {
    const saved = localStorage.getItem('videoBackgroundSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setVideoSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse video settings:', error);
      }
    }
  }, []);

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

  const renderModuleContent = (moduleId: string, componentName: string) => {
    try {
      switch (componentName) {
        case 'HealthStatusDashboard':
          return <HealthStatusDashboardWrapper isCompact={false} />;
        
        case 'SystemLogsPanel':
          return <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} isCompact={false} />;
        
        case 'DashboardSubscription':
          return <DashboardSubscription isCompact={false} />;
        
        case 'DashboardStatsModule':
          return <DashboardStatsModule stats={stats} isCompact={false} />;

        case 'SystemReliabilityScore':
          return <SystemReliabilityScore isCompact={false} />;

        case 'AnalyticsModule':
          return <AnalyticsModule isCompact={false} />;

        case 'ConsoleMonitorModule':
          return <ConsoleMonitorModule isCompact={false} />;
        
        default:
          return <div>Module content not found</div>;
      }
    } catch (error) {
      console.error(`Error rendering module ${moduleId}:`, error);
      return <div className="text-red-400">Error loading module</div>;
    }
  };

  return (
    <div className="min-h-screen relative">
      <VideoBackground
        enabled={videoSettings.enabled}
        videoUrl={videoSettings.videoUrl}
        showAttribution={videoSettings.showAttribution}
      />
      
      <div 
        className="min-h-screen relative z-10"
        style={{ 
          background: videoSettings.enabled 
            ? 'transparent' 
            : 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' 
        }}
      >
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <ErrorBoundary>
                <DashboardHeader />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <Card className={`m-6 mb-4 ${
                  videoSettings.enabled 
                    ? 'bg-black/40 backdrop-blur-md border-white/30' 
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                } rounded-xl`}>
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
                        <PromptIcon size="large" id="dashboard-welcome" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ErrorBoundary>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <ErrorBoundary>
                      <OverviewDashboardLayout
                        visibleModules={overviewModules}
                        reorderModules={reorderModules}
                        renderModuleContent={renderModuleContent}
                      />
                    </ErrorBoundary>
                  </div>

                  <div className="lg:col-span-4">
                    <ErrorBoundary>
                      <RecentActivity />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Dashboard;
