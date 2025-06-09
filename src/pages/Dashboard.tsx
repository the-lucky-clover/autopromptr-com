
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ConnectionStatus } from "@/components/ConnectionStatus";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import DashboardQuickActions from "@/components/DashboardQuickActions";
import DashboardSubscription from "@/components/DashboardSubscription";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboard from "@/components/HealthStatusDashboard";
import DraggableModule from "@/components/DraggableModule";
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

  const { layout, reorderModules, resetLayout } = useDashboardLayout();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleStatsUpdate = (newStats: typeof stats) => {
    setStats(newStats);
  };

  const handleBatchesUpdate = (newBatches: any[]) => {
    setBatches(newBatches);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderModules(String(active.id), String(over.id));
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const openModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: true
    }));
  };

  const resetDashboard = () => {
    resetLayout();
    setOpenModules({
      'batch-processor': true,
      'backend-health': true,
      'system-logs': true,
      'quick-actions': true,
      'subscription': true,
      'stats-cards': true,
    });
  };

  const hasActiveBatch = batches.some(batch => batch.status === 'running');
  const closedModules = Object.entries(openModules).filter(([_, isOpen]) => !isOpen);

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
          <main className="flex-1 p-3 md:p-6 lg:p-8 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white truncate">Desktop Dashboard</h1>
                  <p className="text-purple-200 text-xs md:text-sm lg:text-base">Advanced window management with taskbar controls</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={resetDashboard}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-purple-200 rounded-xl"
                  title="Reset dashboard layout"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <ConnectionStatus />
              </div>
            </div>

            {/* Closed Modules Launcher */}
            {closedModules.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Closed Modules</CardTitle>
                  <CardDescription className="text-purple-200 text-xs">
                    Click to reopen modules
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {closedModules.map(([moduleId]) => (
                      <Button
                        key={moduleId}
                        onClick={() => openModule(moduleId)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-purple-500/20 rounded-xl border border-purple-400/30"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {getModuleTitle(moduleId)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Window-based Dashboard Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {layout
                .filter(item => openModules[item.id])
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <WindowFrame
                    key={item.id}
                    windowId={item.id}
                    title={getModuleTitle(item.id)}
                    className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl"
                    onClose={() => toggleModule(item.id)}
                  >
                    {renderModuleContent(item.id)}
                  </WindowFrame>
                ))}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </WindowManagerProvider>
  );
};

export default Dashboard;
