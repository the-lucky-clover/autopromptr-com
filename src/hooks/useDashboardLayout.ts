
import { useState, useEffect } from 'react';

export interface ModuleLayout {
  id: string;
  order: number;
  visible: boolean;
}

const DEFAULT_LAYOUT: ModuleLayout[] = [
  { id: 'batch-processor', order: 0, visible: true },
  { id: 'system-logs', order: 1, visible: true },
  { id: 'backend-health', order: 2, visible: true },
  { id: 'quick-actions', order: 3, visible: true },
  { id: 'subscription', order: 4, visible: true },
  { id: 'stats-cards', order: 5, visible: true },
];

const STORAGE_KEY = 'dashboard-layout';

export const useDashboardLayout = () => {
  const [layout, setLayout] = useState<ModuleLayout[]>(DEFAULT_LAYOUT);

  // Load layout from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        setLayout(parsedLayout);
      } catch (error) {
        console.error('Failed to parse saved layout:', error);
      }
    }
  }, []);

  // Save layout to localStorage whenever it changes
  const updateLayout = (newLayout: ModuleLayout[]) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  };

  const toggleModuleVisibility = (moduleId: string) => {
    setLayout((items) => {
      const updatedItems = items.map(item =>
        item.id === moduleId ? { ...item, visible: !item.visible } : item
      );
      updateLayout(updatedItems);
      return updatedItems;
    });
  };

  const resetLayout = () => {
    updateLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    layout,
    toggleModuleVisibility,
    resetLayout,
  };
};
