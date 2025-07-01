
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import { useAuth } from "@/hooks/useAuth";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import AnalyticsModule from "@/components/AnalyticsModule";
import ConsoleMonitorModule from "@/components/ConsoleMonitorModule";
import RecentActivity from "@/components/RecentActivity";
import VideoBackground from "@/components/VideoBackground";
import StaticDashboardLayout from "@/components/dashboard/StaticDashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardWelcomeCard from "@/components/dashboard/DashboardWelcomeCard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useDashboardVideoSettings } from "@/hooks/useDashboardVideoSettings";
import { useDashboardGreeting } from "@/hooks/useDashboardGreeting";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const { user } = useAuth();
  const { visibleModules } = useDashboardModules();
  const { videoSettings } = useDashboardVideoSettings(user);
  const { currentGreeting } = useDashboardGreeting(user);
  const { stats, batches, hasActiveBatch, handleStatsUpdate, handleBatchesUpdate } = useDashboardStats();

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

        case 'AnalyticsModule':
          return <AnalyticsModule isCompact={false} />;

        case 'ConsoleMonitorModule':
          return <ConsoleMonitorModule isCompact={false} />;
        
        default:
          return <div className="text-gray-500">Module content not found</div>;
      }
    } catch (error) {
      console.error(`Error rendering module ${moduleId}:`, error);
      return <div className="text-red-600">Error loading module</div>;
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50">
      <VideoBackground
        enabled={videoSettings.enabled}
        videoUrl={videoSettings.videoUrl}
        showAttribution={videoSettings.showAttribution}
        opacity={videoSettings.opacity}
        blendMode={videoSettings.blendMode}
      />
      
      <div 
        className="min-h-screen relative z-10"
        style={{ 
          background: videoSettings.enabled 
            ? 'transparent' 
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' 
        }}
      >
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 relative">
              <ErrorBoundary>
                <DashboardHeader />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <DashboardWelcomeCard 
                  currentGreeting={currentGreeting}
                  stats={stats}
                  videoSettings={videoSettings}
                />
              </ErrorBoundary>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <ErrorBoundary>
                      <StaticDashboardLayout
                        visibleModules={overviewModules}
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
