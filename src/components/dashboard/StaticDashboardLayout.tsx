
import React from 'react';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface StaticDashboardLayoutProps {
  visibleModules: DashboardModule[];
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const StaticDashboardLayout = ({ visibleModules, renderModuleContent }: StaticDashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      {visibleModules.map((module) => (
        <div key={module.id}>
          {renderModuleContent(module.id, module.component)}
        </div>
      ))}
    </div>
  );
};

export default StaticDashboardLayout;
