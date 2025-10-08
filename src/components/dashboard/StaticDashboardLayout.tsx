
import React from 'react';
import { DashboardModule } from '@/hooks/useDashboardModules';

interface StaticDashboardLayoutProps {
  visibleModules: DashboardModule[];
  renderModuleContent: (moduleId: string, componentName: string) => React.ReactNode;
}

const StaticDashboardLayout = ({ visibleModules, renderModuleContent }: StaticDashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      {/* Console Monitor & Dashboard Stats (500px height) */}
      <div className="dashboard-grid-row-lg">
        {visibleModules
          .filter(m => m.id === 'console-monitor' || m.id === 'dashboard-stats')
          .map((module, index) => (
            <div 
              key={module.id} 
              className="stagger-fade-in magnetic-hover hover-glow awwward-transition"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {renderModuleContent(module.id, module.component)}
            </div>
          ))}
      </div>

      {/* System Logs & Analytics (500px height) */}
      <div className="dashboard-grid-row-lg">
        {visibleModules
          .filter(m => m.id === 'system-logs' || m.id === 'analytics')
          .map((module, index) => (
            <div 
              key={module.id} 
              className="stagger-fade-in magnetic-hover hover-glow awwward-transition"
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
            >
              {renderModuleContent(module.id, module.component)}
            </div>
          ))}
      </div>

      {/* Subscription & Quick Actions (400px height) */}
      <div className="dashboard-grid-row-lg">
        {visibleModules
          .filter(m => m.id === 'subscription' || m.id === 'quick-actions')
          .map((module, index) => (
            <div 
              key={module.id} 
              className="stagger-fade-in magnetic-hover hover-glow awwward-transition"
              style={{ animationDelay: `${(index + 4) * 0.1}s` }}
            >
              {renderModuleContent(module.id, module.component)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default StaticDashboardLayout;
