
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SimpleDraggableModuleWrapper from "@/components/SimpleDraggableModuleWrapper";
import { DashboardModule } from '@/hooks/useDashboardModules';

interface OverviewDashboardLayoutProps {
  visibleModules: DashboardModule[];
  reorderModules: (modules: DashboardModule[]) => void;
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const OverviewDashboardLayout = ({
  visibleModules,
  reorderModules,
  renderModuleContent
}: OverviewDashboardLayoutProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleModules.findIndex(module => module.id === active.id);
      const newIndex = visibleModules.findIndex(module => module.id === over.id);
      
      const reorderedModules = arrayMove(visibleModules, oldIndex, newIndex);
      reorderModules(reorderedModules);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleModules.map(m => m.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {visibleModules.map((module) => (
            <div key={module.id} className="shadow-2xl">
              <SimpleDraggableModuleWrapper
                id={module.id}
                title={module.title}
              >
                {renderModuleContent(module.id, module.component)}
              </SimpleDraggableModuleWrapper>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default OverviewDashboardLayout;
