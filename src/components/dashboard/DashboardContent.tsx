
import React from 'react';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useDashboardModules } from '@/hooks/useDashboardModules';
import CleanDashboardWelcomeCard from './CleanDashboardWelcomeCard';
import StaticDashboardLayout from './StaticDashboardLayout';
import OverviewDashboardLayout from './OverviewDashboardLayout';

const DashboardContent = () => {
  const { layout } = useDashboardLayout();
  const { visibleModules } = useDashboardModules();

  // Always show the welcome card at the top for all layouts
  const welcomeModule = (
    <div key="welcome" className="col-span-full">
      <CleanDashboardWelcomeCard />
    </div>
  );

  const renderModuleContent = (moduleId: string, componentName: string) => {
    // This would be implemented based on your module components
    return <div>Module content for {componentName}</div>;
  };

  if (layout === 'overview') {
    return (
      <div className="space-y-6">
        {welcomeModule}
        <OverviewDashboardLayout 
          visibleModules={visibleModules}
          reorderModules={() => {}}
          renderModuleContent={renderModuleContent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {welcomeModule}
      <StaticDashboardLayout 
        visibleModules={visibleModules}
        renderModuleContent={renderModuleContent}
      />
    </div>
  );
};

export default DashboardContent;
