
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
  { id: 'system-reliability', title: 'System Reliability Score', component: 'SystemReliabilityScore', state: 'full', order: 1, isVisible: true },
  { id: 'system-logs', title: 'System Logs', component: 'SystemLogsPanel', state: 'full', order: 2, isVisible: true },
  { id: 'backend-health', title: 'Backend Health', component: 'HealthStatusDashboard', state: 'full', order: 3, isVisible: true },
  { id: 'quick-actions', title: 'Quick Actions', component: 'DashboardQuickActions', state: 'full', order: 4, isVisible: true },
  { id: 'subscription', title: 'Subscription', component: 'DashboardSubscription', state: 'full', order: 5, isVisible: true },
  { id: 'stats-cards', title: 'Statistics', component: 'DashboardStatsModule', state: 'full', order: 6, isVisible: true },
];

export const useDashboardModules = () => {
  const [modules, setModules] = useState<DashboardModule[]>(() => {
    const saved = localStorage.getItem('dashboard-modules');
    return saved ? JSON.parse(saved) : defaultModules;
  });

  const saveModules = useCallback((newModules: DashboardModule[]) => {
    setModules(newModules);
    localStorage.setItem('dashboard-modules', JSON.stringify(newModules));
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
    const modulesWithOrder = reorderedModules.map((module, index) => ({
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
    .sort((a, b) => a.order - b.order);

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
