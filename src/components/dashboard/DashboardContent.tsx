
import React from 'react';
import { useDashboardModules } from '@/hooks/useDashboardModules';
import CleanDashboardWelcomeCard from './CleanDashboardWelcomeCard';
import StaticDashboardLayout from './StaticDashboardLayout';
import AnimatedDropdownClock from '@/components/AnimatedDropdownClock';

const DashboardContent = () => {
  const { visibleModules } = useDashboardModules();

  const renderModuleContent = (moduleId: string, componentName: string) => {
    // This would be implemented based on your module components
    return <div>Module content for {componentName}</div>;
  };

  return (
    <>
      <AnimatedDropdownClock enableEasterEgg={true} />
      <div className="space-y-6">
        <CleanDashboardWelcomeCard />
        <StaticDashboardLayout 
          visibleModules={visibleModules}
          renderModuleContent={renderModuleContent}
        />
      </div>
    </>
  );
};

export default DashboardContent;
