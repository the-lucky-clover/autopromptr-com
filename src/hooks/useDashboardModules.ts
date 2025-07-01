
import { useState, useEffect } from 'react';

export type ModuleState = 'full' | 'minimized' | 'closed';

export interface DashboardModule {
  id: string;
  name: string;
  title: string;
  component: string;
  isVisible: boolean;
  isMinimized: boolean;
  order: number;
  isLocked?: boolean;
  state: ModuleState;
}

const defaultModules: DashboardModule[] = [
  {
    id: 'health-status',
    name: 'Server Status',
    title: 'Server Status',
    component: 'HealthStatusDashboard',
    isVisible: true,
    isMinimized: false,
    order: 0,
    state: 'full',
  },
  {
    id: 'system-logs',
    name: 'System Logs',
    title: 'System Logs',
    component: 'SystemLogsPanel',
    isVisible: true,
    isMinimized: false,
    order: 1,
    state: 'full',
  },
  {
    id: 'subscription',
    name: 'Subscription',
    title: 'Subscription',
    component: 'DashboardSubscription',
    isVisible: true,
    isMinimized: false,
    order: 2,
    state: 'full',
  },
  {
    id: 'stats',
    name: 'Statistics',
    title: 'Statistics',
    component: 'DashboardStatsModule',
    isVisible: true,
    isMinimized: false,
    order: 3,
    state: 'full',
  },
  {
    id: 'reliability',
    name: 'System Reliability',
    title: 'System Reliability',
    component: 'SystemReliabilityScore',
    isVisible: true,
    isMinimized: false,
    order: 4,
    state: 'full',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    title: 'Analytics',
    component: 'AnalyticsModule',
    isVisible: true,
    isMinimized: false,
    order: 5,
    state: 'full',
  },
  {
    id: 'console-monitor',
    name: 'Console Monitor',
    title: 'Console Monitor',
    component: 'ConsoleMonitorModule',
    isVisible: true,
    isMinimized: false,
    order: 6,
    state: 'full',
  }
];

export const useDashboardModules = () => {
  const [modules, setModules] = useState<DashboardModule[]>(() => {
    const saved = localStorage.getItem('dashboard-modules');
    if (saved) {
      try {
        const parsedModules = JSON.parse(saved);
        // Ensure new modules are added to existing saved state
        const existingIds = parsedModules.map((m: DashboardModule) => m.id);
        const newModules = defaultModules.filter(m => !existingIds.includes(m.id));
        return [...parsedModules, ...newModules].sort((a, b) => a.order - b.order);
      } catch {
        return defaultModules;
      }
    }
    return defaultModules;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-modules', JSON.stringify(modules));
  }, [modules]);

  const updateModuleState = (id: string, updates: Partial<DashboardModule>) => {
    setModules(prev => 
      prev.map(module => 
        module.id === id ? { ...module, ...updates } : module
      )
    );
  };

  const resetToDefault = () => {
    setModules(defaultModules);
  };

  const reorderModules = (reorderedModules: DashboardModule[]) => {
    const modulesWithUpdatedOrder = reorderedModules.map((module, index) => ({
      ...module,
      order: index
    }));
    setModules(modulesWithUpdatedOrder);
  };

  const visibleModules = modules
    .filter(module => module.isVisible)
    .sort((a, b) => a.order - b.order);

  const hiddenModules = modules
    .filter(module => !module.isVisible)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    modules,
    visibleModules,
    hiddenModules,
    updateModuleState,
    resetToDefault,
    reorderModules
  };
};
