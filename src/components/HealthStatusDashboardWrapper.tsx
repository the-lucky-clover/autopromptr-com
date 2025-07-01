
import React from 'react';
import ServerStatusConsole from './health/ServerStatusConsole';

interface HealthStatusDashboardWrapperProps {
  isCompact?: boolean;
}

const HealthStatusDashboardWrapper = ({ isCompact = false }: HealthStatusDashboardWrapperProps) => {
  return <ServerStatusConsole isCompact={isCompact} />;
};

export default HealthStatusDashboardWrapper;
