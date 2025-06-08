
import { useState, useEffect } from 'react';

export interface ModuleLayout {
  id: string;
  order: number;
  gridArea?: string;
  span?: string;
}

const DEFAULT_LAYOUT: ModuleLayout[] = [
  { id: 'batch-processor', order: 0, gridArea: 'batch', span: 'lg:col-span-2' },
  { id: 'backend-health', order: 1, gridArea: 'health', span: 'lg:col-span-1' },
  { id: 'system-logs', order: 2, gridArea: 'logs', span: 'lg:col-span-3' },
  { id: 'quick-actions', order: 3, gridArea: 'actions', span: 'lg:col-span-1' },
  { id: 'subscription', order: 4, gridArea: 'subscription', span: 'lg:col-span-1' },
  { id: 'stats-cards', order: 5, gridArea: 'stats', span: 'lg:col-span-3' },
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

  const reorderModules = (activeId: string, overId: string) => {
    setLayout((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) return items;

      const newItems = [...items];
      const [reorderedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, reorderedItem);

      // Update order values
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

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
    reorderModules,
    resetLayout,
  };
};
