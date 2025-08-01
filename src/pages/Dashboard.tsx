
import React from 'react';
import { ResizableDashboardLayout } from "@/components/dashboard/ResizableDashboardLayout";
import { useDashboardModules } from "@/hooks/useDashboardModules";
import { useAuth } from "@/hooks/useAuth";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import ServerStatusConsole from "@/components/health/ServerStatusConsole";
import DashboardSubscription from "@/components/DashboardSubscription";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import AnalyticsModule from "@/components/AnalyticsModule";
import ConsoleMonitorModule from "@/components/ConsoleMonitorModule";
import QuickActionsModule from "@/components/dashboard/QuickActionsModule";
import RecentActivity from "@/components/RecentActivity";
import StaticDashboardLayout from "@/components/dashboard/StaticDashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";
import ErrorBoundary from "@/components/ErrorBoundary";
import MobileDashboardNavbar from "@/components/dashboard/MobileDashboardNavbar";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const { user } = useAuth();
  const { visibleModules } = useDashboardModules();
  const { stats, batches, hasActiveBatch } = useDashboardStats();

  // Filter out batch manager and extractor modules for overview
  const overviewModules = visibleModules.filter(module => 
    module.id !== 'batch-processor' && 
    module.id !== 'batch-extractor'
  );

  const renderModuleContent = (moduleId: string, componentName: string) => {
    try {
      switch (componentName) {
        case 'HealthStatusDashboard':
          return <ServerStatusConsole isCompact={false} />;
        
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

        case 'QuickActionsModule':
          return <QuickActionsModule isCompact={false} />;
        
        default:
          return <div className="text-white/60">Module content not found</div>;
      }
    } catch (error) {
      console.error(`Error rendering module ${moduleId}:`, error);
      return <div className="text-red-400">Error loading module</div>;
    }
  };

  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      {/* Mobile Navigation */}
      <MobileDashboardNavbar />
      
      <ResizableDashboardLayout>
        <ErrorBoundary>
          <div className="animate-shimmer-delayed">
            <DashboardHeader />
          </div>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <div className="animate-shimmer">
            <UnifiedDashboardWelcomeModule
              title="AutoPromptr Dashboard"
              subtitle="Welcome to your automation command center. Monitor, manage, and optimize your AI-powered workflows."
              clockColor="#10B981"
              showPersonalizedGreeting={true}
            />
          </div>
        </ErrorBoundary>

        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-6">
            <div className="xl:col-span-3 animate-shimmer-delayed">
              <ErrorBoundary>
                <StaticDashboardLayout
                  visibleModules={overviewModules}
                  renderModuleContent={renderModuleContent}
                />
              </ErrorBoundary>
            </div>

            <div className="xl:col-span-2 animate-shimmer">
              <ErrorBoundary>
                <RecentActivity />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </ResizableDashboardLayout>
    </div>
  );
};

export default Dashboard;
