
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import HealthStatusDashboard from './HealthStatusDashboard';

interface HealthStatusDashboardWrapperProps {
  isCompact?: boolean;
}

const HealthStatusDashboardWrapper = ({ isCompact = false }: HealthStatusDashboardWrapperProps) => {
  const { user, isEmailVerified } = useAuth();
  const location = useLocation();

  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Precise route checking - only allow specific dashboard routes
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  
  // Log the evaluation for debugging
  if (isDevelopment) {
    console.log('HealthStatusDashboardWrapper: Route evaluation', {
      pathname: location.pathname,
      isDashboardRoute,
      hasUser: !!user,
      isEmailVerified,
      shouldRender: user && isEmailVerified && isDashboardRoute
    });
  }

  // Early return - don't render anything if not authenticated or not on dashboard
  if (!user || !isEmailVerified || !isDashboardRoute) {
    if (isDevelopment) {
      console.log('HealthStatusDashboardWrapper: Skipping render - conditions not met');
    }
    return null;
  }

  if (isDevelopment) {
    console.log('HealthStatusDashboardWrapper: Rendering HealthStatusDashboard for authenticated dashboard user');
  }
  
  // Only render the actual component when all conditions are met
  return <HealthStatusDashboard isCompact={isCompact} />;
};

export default HealthStatusDashboardWrapper;
