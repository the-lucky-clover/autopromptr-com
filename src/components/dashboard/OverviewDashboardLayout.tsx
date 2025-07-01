
import React from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SimpleDraggableModuleWrapper from '@/components/SimpleDraggableModuleWrapper';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface OverviewDashboardLayoutProps {
  visibleModules: DashboardModule[];
  reorderModules: (activeId: string, overId: string) => void;
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const OverviewDashboardLayout = ({
  visibleModules,
  reorderModules,
  renderModuleContent,
}: OverviewDashboardLayoutProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderModules(active.id as string, over.id as string);
    }
  };

  const sortedModules = visibleModules.sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedModules.map(module => module.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {sortedModules.map((module) => (
            <SimpleDraggableModuleWrapper
              key={module.id}
              id={module.id}
              title={module.title}
            >
              {renderModuleContent(module.id, module.component)}
            </SimpleDraggableModuleWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default OverviewDashboardLayout;
