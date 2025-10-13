
import React from 'react';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface StaticDashboardLayoutProps {
  visibleModules: DashboardModule[];
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const StaticDashboardLayout = React.memo(({ visibleModules, renderModuleContent }: StaticDashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      {/* All modules rendered full-width in order */}
      {visibleModules
        .sort((a, b) => a.order - b.order)
        .map((module, index) => (
          <div 
            key={module.id} 
            className="w-full stagger-fade-in magnetic-hover hover-glow awwward-transition transform-gpu will-change-transform [backface-visibility:hidden]"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {renderModuleContent(module.id, module.component)}
          </div>
        ))}
    </div>
  );
});

StaticDashboardLayout.displayName = 'StaticDashboardLayout';

export default StaticDashboardLayout;
