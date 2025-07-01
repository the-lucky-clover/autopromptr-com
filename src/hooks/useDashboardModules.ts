import { useState, useCallback } from 'react';

export type ModuleState = 'full' | 'minimized' | 'closed';

export interface DashboardModule {
  id: string;
  title: string;
  component: string;
  state: ModuleState;
  order: number;
  isVisible: boolean;
}

const defaultModules: DashboardModule[] = [
  { id: 'batch-processor', title: 'Batch Processor', component: 'DashboardBatchManager', state: 'full', order: 0, isVisible: true },
  { id: 'batch-extractor', title: 'Batch Extractor', component: 'BatchExtractorModule', state: 'full', order: 1, isVisible: true },
  { id: 'analytics', title: 'System Overview', component: 'AnalyticsModule', state: 'full', order: 2, isVisible: true },
  { id: 'system-reliability', title: 'System Reliability Score', component: 'SystemReliabilityScore', state: 'full', order: 3, isVisible: true },
  { id: 'console-monitor', title: 'Console Monitor', component: 'ConsoleMonitorModule', state: 'full', order: 4, isVisible: true },
  { id: 'system-logs', title: 'System Diagnostics & Logs', component: 'SystemLogsPanel', state: 'full', order: 5, isVisible: true },
  { id: 'backend-health', title: 'Backend Health', component: 'HealthStatusDashboard', state: 'full', order: 6, isVisible: true },
  { id: 'subscription', title: 'Subscription', component: 'DashboardSubscription', state: 'full', order: 7, isVisible: true },
  { id: 'stats-cards', title: 'Statistics', component: 'DashboardStatsModule', state: 'full', order: 8, isVisible: true },
];

export const useDashboardModules = () => {
  const [modules, setModules] = useState<DashboardModule[]>(() => {
    const saved = localStorage.getItem('dashboard-modules');
    if (saved) {
      try {
        const parsedModules = JSON.parse(saved);
        // Filter out QuickActions permanently and ensure all default modules exist
        const filteredModules = parsedModules.filter((m: DashboardModule) => m.id !== 'quick-actions');
        const moduleIds = filteredModules.map((m: DashboardModule) => m.id);
        const missingModules = defaultModules.filter(dm => !moduleIds.includes(dm.id));
        
        if (missingModules.length > 0) {
          // Add missing modules to the saved modules
          const combinedModules = [...filteredModules, ...missingModules];
          // Ensure batch-processor is always first by reordering
          return combinedModules.sort((a, b) => {
            if (a.id === 'batch-processor') return -1;
            if (b.id === 'batch-processor') return 1;
            return a.order - b.order;
          });
        }
        
        // Ensure batch-processor is always first in saved modules
        return filteredModules.sort((a, b) => {
          if (a.id === 'batch-processor') return -1;
          if (b.id === 'batch-processor') return 1;
          return a.order - b.order;
        });
      } catch (error) {
        console.error('Error parsing saved modules, using defaults:', error);
        return defaultModules;
      }
    }
    return defaultModules;
  });

  const saveModules = useCallback((newModules: DashboardModule[]) => {
    // Always filter out QuickActions before saving
    const filteredModules = newModules.filter(m => m.id !== 'quick-actions');
    // Ensure batch-processor is always first when saving
    const reorderedModules = filteredModules.sort((a, b) => {
      if (a.id === 'batch-processor') return -1;
      if (b.id === 'batch-processor') return 1;
      return a.order - b.order;
    });
    setModules(reorderedModules);
    localStorage.setItem('dashboard-modules', JSON.stringify(reorderedModules));
  }, []);

  const updateModuleState = useCallback((moduleId: string, newState: ModuleState) => {
    const newModules = modules.map(module =>
      module.id === moduleId 
        ? { ...module, state: newState, isVisible: newState !== 'closed' }
        : module
    );
    saveModules(newModules);
  }, [modules, saveModules]);

  const reorderModules = useCallback((reorderedModules: DashboardModule[]) => {
    // Prevent batch-processor from being moved from first position
    const batchProcessor = reorderedModules.find(m => m.id === 'batch-processor');
    const otherModules = reorderedModules.filter(m => m.id !== 'batch-processor');
    
    const finalModules = batchProcessor ? [batchProcessor, ...otherModules] : reorderedModules;
    const modulesWithOrder = finalModules.map((module, index) => ({
      ...module,
      order: index
    }));
    saveModules(modulesWithOrder);
  }, [saveModules]);

  const toggleModuleVisibility = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const newState = module.isVisible ? 'closed' : 'full';
      updateModuleState(moduleId, newState);
    }
  }, [modules, updateModuleState]);

  const resetLayout = useCallback(() => {
    saveModules(defaultModules);
  }, [saveModules]);

  const visibleModules = modules
    .filter(module => module.isVisible)
    .sort((a, b) => {
      // Always keep batch-processor first
      if (a.id === 'batch-processor') return -1;
      if (b.id === 'batch-processor') return 1;
      return a.order - b.order;
    });

  const closedModules = modules.filter(module => !module.isVisible);

  return {
    modules,
    visibleModules,
    closedModules,
    updateModuleState,
    reorderModules,
    toggleModuleVisibility,
    resetLayout
  };
};
