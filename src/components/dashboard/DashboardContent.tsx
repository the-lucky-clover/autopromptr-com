
import React from 'react';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useDashboardModules } from '@/hooks/useDashboardModules';
import CleanDashboardWelcomeCard from './CleanDashboardWelcomeCard';
import { StaticDashboardLayout } from './StaticDashboardLayout';
import { OverviewDashboardLayout } from './OverviewDashboardLayout';

const DashboardContent = () => {
  const { layout } = useDashboardLayout();
  const { availableModules, isModuleEnabled } = useDashboardModules();

  // Always show the welcome card at the top for all layouts
  const welcomeModule = (
    <div key="welcome" className="col-span-full">
      <CleanDashboardWelcomeCard />
    </div>
  );

  if (layout === 'overview') {
    return (
      <div className="space-y-6">
        {welcomeModule}
        <OverviewDashboardLayout 
          availableModules={availableModules}
          isModuleEnabled={isModuleEnabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {welcomeModule}
      <StaticDashboardLayout 
        availableModules={availableModules}
        isModuleEnabled={isModuleEnabled}
      />
    </div>
  );
};

export default DashboardContent;
