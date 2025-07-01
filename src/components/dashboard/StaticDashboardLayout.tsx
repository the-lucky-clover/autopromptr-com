
import React from 'react';
import StaticModuleWrapper from '@/components/StaticModuleWrapper';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface StaticDashboardLayoutProps {
  visibleModules: DashboardModule[];
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const StaticDashboardLayout = ({
  visibleModules,
  renderModuleContent,
}: StaticDashboardLayoutProps) => {
  const sortedModules = visibleModules.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedModules.map((module) => (
        <StaticModuleWrapper
          key={module.id}
          title={module.title}
        >
          {renderModuleContent(module.id, module.component)}
        </StaticModuleWrapper>
      ))}
    </div>
  );
};

export default StaticDashboardLayout;
