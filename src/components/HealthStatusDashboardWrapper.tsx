
import React, { useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import HealthStatusDashboard from './HealthStatusDashboard';

interface HealthStatusDashboardWrapperProps {
  isCompact?: boolean;
}

const HealthStatusDashboardWrapper = React.memo(({ isCompact = false }: HealthStatusDashboardWrapperProps) => {
  const { user, isEmailVerified } = useAuth();
  const location = useLocation();

  // Development mode detection - memoized to prevent re-calculations
  const isDevelopment = useMemo(() => process.env.NODE_ENV === 'development', []);
  
  // Memoized route checking to prevent unnecessary re-calculations
  const isDashboardRoute = useMemo(() => 
    location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/'),
    [location.pathname]
  );

  // Memoized render condition to prevent unnecessary re-evaluations
  const shouldRender = useMemo(() => 
    user && isEmailVerified && isDashboardRoute,
    [user, isEmailVerified, isDashboardRoute]
  );

  // Move all logging to useEffect to prevent render loop flooding
  useEffect(() => {
    if (isDevelopment) {
      console.log('HealthStatusDashboardWrapper: Route evaluation', {
        pathname: location.pathname,
        isDashboardRoute,
        hasUser: !!user,
        isEmailVerified,
        shouldRender
      });
    }
  }, [isDevelopment, location.pathname, isDashboardRoute, user, isEmailVerified, shouldRender]);

  useEffect(() => {
    if (isDevelopment && shouldRender) {
      console.log('HealthStatusDashboardWrapper: Rendering HealthStatusDashboard for authenticated dashboard user');
    }
  }, [isDevelopment, shouldRender]);

  useEffect(() => {
    if (isDevelopment && !shouldRender) {
      console.log('HealthStatusDashboardWrapper: Skipping render - conditions not met');
    }
  }, [isDevelopment, shouldRender]);

  // Early return - don't render anything if not authenticated or not on dashboard
  if (!shouldRender) {
    return null;
  }
  
  // Only render the actual component when all conditions are met
  return <HealthStatusDashboard isCompact={isCompact} />;
});

HealthStatusDashboardWrapper.displayName = 'HealthStatusDashboardWrapper';

export default HealthStatusDashboardWrapper;
