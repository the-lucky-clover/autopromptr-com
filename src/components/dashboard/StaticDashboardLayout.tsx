
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
        <div
          key={module.id}
          className="bg-gray-900/50 backdrop-blur-sm border-white/20 rounded-xl border"
        >
          {/* Module Header - Consistent with Recent Activity */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              {module.title}
            </h3>
          </div>
          
          {/* Module Content */}
          <div className="px-6 pb-6">
            {renderModuleContent(module.id, module.component)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaticDashboardLayout;
