
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
import DashboardModuleWrapper from "@/components/DashboardModuleWrapper";
import DashboardEmptyModuleState from "@/components/DashboardEmptyModuleState";
import { DashboardModule } from '@/hooks/useDashboardModules';

interface DashboardLayoutProps {
  visibleModules: DashboardModule[];
  updateModuleState: (moduleId: string, newState: any) => void;
  reorderModules: (modules: DashboardModule[]) => void;
  resetLayout: () => void;
  renderModuleContent: (moduleId: string, componentName: string, isMinimized: boolean) => React.ReactNode;
}

const DashboardLayout = ({
  visibleModules,
  updateModuleState,
  reorderModules,
  resetLayout,
  renderModuleContent
}: DashboardLayoutProps) => {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleModules.map(m => m.id)}
        strategy={verticalListSortingStrategy}
      >
        {visibleModules.length === 0 ? (
          <DashboardEmptyModuleState onResetLayout={resetLayout} />
        ) : (
          renderModulesLayout()
        )}
      </SortableContext>
    </DndContext>
  );
};

export default DashboardLayout;
