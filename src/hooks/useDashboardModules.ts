import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export type ModuleState = 'full' | 'minimized' | 'closed';

export interface DashboardModule {
  id: string;
  title: string;
  component: string;
  state: ModuleState;
  order: number;
  defaultVisible: boolean;
}

// UPDATED module order: Console Monitor positioned after System Health
const DEFAULT_MODULES: DashboardModule[] = [
  {
    id: 'health-status',
    title: 'System Health Status',
    component: 'HealthStatusDashboard',
    state: 'full',
    order: 0,
    defaultVisible: true
  },
  {
    id: 'console-monitor',
    title: 'Console Monitor',
    component: 'ConsoleMonitorModule',
    state: 'full',
    order: 1,
    defaultVisible: true
  },
  {
    id: 'dashboard-stats',
    title: 'Dashboard Statistics',
    component: 'DashboardStatsModule',
    state: 'full',
    order: 2,
    defaultVisible: true
  },
  {
    id: 'system-logs',
    title: 'System Logs',
    component: 'SystemLogsPanel',
    state: 'full',
    order: 3,
    defaultVisible: true
  },
  {
    id: 'analytics',
    title: 'Analytics Overview',
    component: 'AnalyticsModule',
    state: 'full',
    order: 4,
    defaultVisible: true
  },
  {
    id: 'subscription',
    title: 'Subscription Status',
    component: 'DashboardSubscription',
    state: 'full',
    order: 5,
    defaultVisible: true
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    component: 'QuickActionsModule',
    state: 'full',
    order: 6,
    defaultVisible: true
  }
];

export const useDashboardModules = () => {
  const [modules, setModules] = useState<DashboardModule[]>(DEFAULT_MODULES);

  const visibleModules = modules.filter(module => module.state !== 'closed');

  const updateModuleState = useCallback((moduleId: string, newState: ModuleState) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, state: newState }
          : module
      )
    );
  }, []);

  const reorderModules = useCallback((activeId: string, overId: string) => {
    // Add safety checks for undefined values
    if (!activeId || !overId) {
      console.warn('reorderModules: activeId or overId is undefined');
      return;
    }

    setModules(prev => {
      // Ensure prev is an array
      if (!Array.isArray(prev)) {
        console.warn('reorderModules: modules array is not valid');
        return DEFAULT_MODULES;
      }

      const oldIndex = prev.findIndex(module => module?.id === activeId);
      const newIndex = prev.findIndex(module => module?.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        try {
          const reordered = arrayMove(prev, oldIndex, newIndex);
          return reordered.map((module, index) => ({
            ...module,
            order: index
          }));
        } catch (error) {
          console.error('Error in arrayMove:', error);
          return prev;
        }
      }
      
      return prev;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setModules([...DEFAULT_MODULES]); // Create a new array reference
  }, []);

  const restoreModule = useCallback((moduleId: string) => {
    updateModuleState(moduleId, 'full');
  }, [updateModuleState]);

  const closedModules = modules.filter(module => module.state === 'closed');

  return {
    modules,
    visibleModules,
    closedModules,
    updateModuleState,
    reorderModules,
    resetToDefaults,
    restoreModule
  };
};