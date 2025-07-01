
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import HealthStatusDashboard from './HealthStatusDashboard';

interface HealthStatusDashboardWrapperProps {
  isCompact?: boolean;
}

const HealthStatusDashboardWrapper = ({ isCompact = false }: HealthStatusDashboardWrapperProps) => {
  // Mock health status for the header
  const healthStatus = 'healthy'; // This would come from actual health check
  
  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (healthStatus) {
      case 'healthy': return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Warning</Badge>;
      case 'error': return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Error</Badge>;
      default: return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {getStatusIcon()}
            Backend Health
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <HealthStatusDashboard isCompact={isCompact} />
      </CardContent>
    </Card>
  );
};

export default HealthStatusDashboardWrapper;
