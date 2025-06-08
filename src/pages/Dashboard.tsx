
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ConnectionStatus } from "@/components/ConnectionStatus";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import DashboardQuickActions from "@/components/DashboardQuickActions";
import DashboardBackendMonitoring from "@/components/DashboardBackendMonitoring";
import DashboardSubscription from "@/components/DashboardSubscription";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import DraggableModule from "@/components/DraggableModule";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalPrompts: 0
  });

  const [batches, setBatches] = useState<any[]>([]);
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

  const hasActiveBatch = batches.some(batch => batch.status === 'running');

  const renderModule = (moduleId: string) => {
    switch (moduleId) {
      case 'batch-processor':
        return (
          <DraggableModule id="batch-processor" title="Batch Processor" className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base md:text-lg">Batch Processor</CardTitle>
                <CardDescription className="text-purple-200 text-xs md:text-sm">
                  Create and manage your prompt batches
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-4 lg:p-6">
                <DashboardBatchManager onStatsUpdate={handleStatsUpdate} />
              </CardContent>
            </Card>
          </DraggableModule>
        );
      
      case 'backend-health':
        return (
          <DraggableModule id="backend-health" title="Backend Health" className="lg:col-span-1">
            <DashboardBackendMonitoring />
          </DraggableModule>
        );
      
      case 'system-logs':
        return (
          <DraggableModule id="system-logs" title="System Logs" className="lg:col-span-3">
            <SystemLogsPanel batches={batches} hasActiveBatch={hasActiveBatch} />
          </DraggableModule>
        );
      
      case 'quick-actions':
        return (
          <DraggableModule id="quick-actions" title="Quick Actions" className="lg:col-span-1">
            <DashboardQuickActions />
          </DraggableModule>
        );
      
      case 'subscription':
        return (
          <DraggableModule id="subscription" title="Subscription" className="lg:col-span-1">
            <DashboardSubscription />
          </DraggableModule>
        );
      
      case 'stats-cards':
        return (
          <DraggableModule id="stats-cards" title="Statistics" className="lg:col-span-3">
            <DashboardStatsModule stats={stats} />
          </DraggableModule>
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <AppSidebar />
        <main className="flex-1 p-3 md:p-6 lg:p-8 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white truncate">Welcome back!</h1>
                <p className="text-purple-200 text-xs md:text-sm lg:text-base">Here's what's happening with your prompt batches today.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={resetLayout}
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

          {/* Draggable Dashboard Modules */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={layout.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {layout
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} className={item.span || ''}>
                      {renderModule(item.id)}
                    </div>
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
