import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import DashboardBatchManager from "@/components/DashboardBatchManager";
import DashboardStatsModule from "@/components/DashboardStatsModule";
import DashboardSubscription from "@/components/DashboardSubscription";
import SystemLogsPanel from "@/components/SystemLogsPanel";
import HealthStatusDashboardWrapper from "@/components/HealthStatusDashboardWrapper";
import SystemReliabilityScore from "@/components/SystemReliabilityScore";
import BatchExtractorModule from "@/components/BatchExtractorModule";
import AnalyticsModule from "@/components/AnalyticsModule";
import DashboardModuleWrapper from "@/components/DashboardModuleWrapper";
import ModuleRestorePanel from "@/components/ModuleRestorePanel";
import DashboardEmptyModuleState from "@/components/DashboardEmptyModuleState";
import { useDashboardModules } from "@/hooks/useDashboardModules";

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStatsUpdate = (newStats: typeof stats) => {
    setStats(newStats);
  };

  const handleBatchesUpdate = (newBatches: any[]) => {
    setBatches(newBatches);
  };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleModules.findIndex(module => module.id === active.id);
      const newIndex = visibleModules.findIndex(module => module.id === over.id);
      
      const reorderedModules = arrayMove(visibleModules, oldIndex, newIndex);
      reorderModules(reorderedModules);
    }
  };

  const renderModulesLayout = () => {
    const fullWidthModules = visibleModules.filter(module => module.state === 'full');
    const minimizedModules = visibleModules.filter(module => module.state === 'minimized');

    return (
      <div className="space-y-4">
        {/* Full-width modules */}
        {fullWidthModules.map((module) => (
          <div key={module.id} className="shadow-2xl">
            <DashboardModuleWrapper
              id={module.id}
              title={module.title}
              state={module.state}
              onStateChange={(newState) => updateModuleState(module.id, newState)}
            >
              {renderModuleContent(module.id, module.component, false)}
            </DashboardModuleWrapper>
          </div>
        ))}

        {/* Two-column layout for minimized modules */}
        {minimizedModules.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {minimizedModules.map((module) => (
              <div key={module.id} className="shadow-2xl">
                <DashboardModuleWrapper
                  id={module.id}
                  title={module.title}
                  state={module.state}
                  onStateChange={(newState) => updateModuleState(module.id, newState)}
                >
                  {renderModuleContent(module.id, module.component, true)}
                </DashboardModuleWrapper>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2A8C 50%, #4C3A9F 100%)' }}>
        <div className="shadow-2xl">
          <AppSidebar />
        </div>
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 min-w-0">
              <SidebarTrigger className="text-white hover:text-purple-200 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl font-semibold text-white truncate">Prompt Engineering Lab</h1>
                <p className="text-purple-200 text-sm lg:text-base mt-1">Transform ideas into reality with AI-powered automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus />
            </div>
          </div>

          {/* Dashboard Content */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleModules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {/* Main Dashboard Layout */}
              {visibleModules.length === 0 ? (
                <DashboardEmptyModuleState onResetLayout={resetLayout} />
              ) : (
                renderModulesLayout()
              )}
            </SortableContext>
          </DndContext>

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
