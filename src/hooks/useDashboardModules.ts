import { useState, useEffect } from 'react';

export interface DashboardModule {
  id: string;
  name: string;
  component: string;
  isVisible: boolean;
  isMinimized: boolean;
  order: number;
  isLocked?: boolean;
}

const defaultModules: DashboardModule[] = [
  {
    id: 'health-status',
    name: 'Backend Health',
    component: 'HealthStatusDashboard',
    isVisible: true,
    isMinimized: false,
    order: 0,
  },
  {
    id: 'system-logs',
    name: 'System Logs',
    component: 'SystemLogsPanel',
    isVisible: true,
    isMinimized: false,
    order: 1,
  },
  {
    id: 'subscription',
    name: 'Subscription',
    component: 'DashboardSubscription',
    isVisible: true,
    isMinimized: false,
    order: 2,
  },
  {
    id: 'stats',
    name: 'Statistics',
    component: 'DashboardStatsModule',
    isVisible: true,
    isMinimized: false,
    order: 3,
  },
  {
    id: 'reliability',
    name: 'System Reliability',
    component: 'SystemReliabilityScore',
    isVisible: true,
    isMinimized: false,
    order: 4,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    component: 'AnalyticsModule',
    isVisible: true,
    isMinimized: false,
    order: 5,
  },
  {
    id: 'console-monitor',
    name: 'Console Monitor',
    component: 'ConsoleMonitorModule',
    isVisible: true,
    isMinimized: false,
    order: 6,
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
