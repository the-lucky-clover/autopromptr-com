
import { useAuth } from '@/hooks/useAuth';
import HealthStatusDashboard from './HealthStatusDashboard';

interface HealthStatusDashboardWrapperProps {
  isCompact?: boolean;
}

const HealthStatusDashboardWrapper = ({ isCompact = false }: HealthStatusDashboardWrapperProps) => {
  const { user, isEmailVerified } = useAuth();

  // Early return - don't render anything if not authenticated or not on dashboard
  if (!user || !isEmailVerified || !window.location.pathname.includes('/dashboard')) {
    console.log('HealthStatusDashboardWrapper: Skipping render - not authenticated or not on dashboard');
    return null;
  }

  console.log('HealthStatusDashboardWrapper: Rendering HealthStatusDashboard for authenticated dashboard user');
  
  // Only render the actual component when all conditions are met
  return <HealthStatusDashboard isCompact={isCompact} />;
};

export default HealthStatusDashboardWrapper;
