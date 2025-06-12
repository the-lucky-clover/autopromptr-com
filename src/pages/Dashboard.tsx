
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import DashboardQuickActions from "@/components/DashboardQuickActions";
import DashboardSubscription from "@/components/DashboardSubscription";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboard from "@/components/HealthStatusDashboard";
import { WindowManagerProvider, WindowFrame } from "@/components/WindowManager";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });

  const [batches, setBatches] = useState<any[]>([]);
  const [openModules, setOpenModules] = useState({
    'batch-processor': true,
    'backend-health': true,
    'system-logs': true,
    'quick-actions': true,
    'subscription': true,
    'stats-cards': true,
  });

  const { layout } = useDashboardLayout();

  const handleStatsUpdate = (newStats: typeof stats) => {
    setStats(newStats);
  };

  const handleBatchesUpdate = (newBatches: any[]) => {
    setBatches(newBatches);
  };

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  const renderModuleContent = (moduleId: string) => {
    switch (moduleId) {
      case 'batch-processor':
        return (
          <DashboardBatchManager 
            onStatsUpdate={handleStatsUpdate} 
            onBatchesUpdate={handleBatchesUpdate}
          />
        );
      
      case 'backend-health':
        return <HealthStatusDashboard />;
      
      case 'system-logs':
        return <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} />;
      
      case 'quick-actions':
        return <DashboardQuickActions />;
      
      case 'subscription':
        return <DashboardSubscription />;
      
      case 'stats-cards':
        return <DashboardStatsModule stats={stats} />;
      
      default:
        return <div>Module content not found</div>;
    }
  };

  const getModuleTitle = (moduleId: string) => {
    switch (moduleId) {
      case 'batch-processor': return 'Batch Processor';
      case 'backend-health': return 'Backend Health';
      case 'system-logs': return 'System Logs';
      case 'quick-actions': return 'Quick Actions';
      case 'subscription': return 'Subscription';
      case 'stats-cards': return 'Statistics';
      default: return 'Module';
    }
  };

  return (
    <WindowManagerProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
          <AppSidebar />
          <main className="flex-1 p-4 lg:p-6 min-w-0">
            {/* Header with improved spacing */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 min-w-0">
                <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-xl lg:text-2xl font-semibold text-white truncate">Desktop Dashboard</h1>
                  <p className="text-purple-200 text-sm lg:text-base mt-1">Advanced window management with taskbar controls</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ConnectionStatus />
              </div>
            </div>

            {/* Fixed Column Layout with improved spacing */}
            <div className="space-y-4">
              {/* Batch Processor - Full width, better spacing */}
              {openModules['batch-processor'] && (
                <div className="w-full">
                  <WindowFrame
                    windowId="batch-processor"
                    title={getModuleTitle('batch-processor')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl w-full"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'batch-processor': false }))}
                  >
                    {renderModuleContent('batch-processor')}
                  </WindowFrame>
                </div>
              )}

              {/* System Logs - Full width, consistent spacing */}
              {openModules['system-logs'] && (
                <div className="w-full">
                  <WindowFrame
                    windowId="system-logs"
                    title={getModuleTitle('system-logs')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl w-full"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'system-logs': false }))}
                  >
                    {renderModuleContent('system-logs')}
                  </WindowFrame>
                </div>
              )}

              {/* Backend Health - Full width, compact */}
              {openModules['backend-health'] && (
                <div className="w-full">
                  <WindowFrame
                    windowId="backend-health"
                    title={getModuleTitle('backend-health')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl w-full"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'backend-health': false }))}
                  >
                    {renderModuleContent('backend-health')}
                  </WindowFrame>
                </div>
              )}

              {/* Bottom row - Better spacing in grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {openModules['quick-actions'] && (
                  <WindowFrame
                    windowId="quick-actions"
                    title={getModuleTitle('quick-actions')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'quick-actions': false }))}
                  >
                    {renderModuleContent('quick-actions')}
                  </WindowFrame>
                )}

                {openModules['subscription'] && (
                  <WindowFrame
                    windowId="subscription"
                    title={getModuleTitle('subscription')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'subscription': false }))}
                  >
                    {renderModuleContent('subscription')}
                  </WindowFrame>
                )}

                {openModules['stats-cards'] && (
                  <WindowFrame
                    windowId="stats-cards"
                    title={getModuleTitle('stats-cards')}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
                    onClose={() => setOpenModules(prev => ({ ...prev, 'stats-cards': false }))}
                  >
                    {renderModuleContent('stats-cards')}
                  </WindowFrame>
                )}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </WindowManagerProvider>
  );
};

export default Dashboard;
