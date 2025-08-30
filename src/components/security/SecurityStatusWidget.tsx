import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SecurityHeaders } from '@/services/security/securityHeaders';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityStatus {
  headersInitialized: boolean;
  isHttps: boolean;
  hasServiceWorker: boolean;
  validation: {
    valid: boolean;
    missing: string[];
    issues: string[];
  };
}

export const SecurityStatusWidget = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const { isAdmin } = useUserRole();

  useEffect(() => {
    if (isAdmin) {
      const status = SecurityHeaders.getSecurityStatus();
      setSecurityStatus(status);
    }
  }, [isAdmin]);

  if (!isAdmin || !securityStatus) {
    return null;
  }

  const getOverallStatus = () => {
    if (!securityStatus.validation.valid || !securityStatus.isHttps) {
      return 'critical';
    }
    if (securityStatus.validation.issues.length > 0) {
      return 'warning';
    }
    return 'secure';
  };

  const overallStatus = getOverallStatus();

  const statusColors = {
    secure: 'text-emerald-600',
    warning: 'text-amber-600',
    critical: 'text-red-600'
  };

  const StatusIcon = {
    secure: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle
  }[overallStatus];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Status</span>
          <Badge variant={overallStatus === 'secure' ? 'default' : 'destructive'}>
            <StatusIcon className={`h-3 w-3 mr-1 ${statusColors[overallStatus]}`} />
            {overallStatus === 'secure' ? 'Secure' : overallStatus === 'warning' ? 'Warning' : 'Critical'}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Security Headers</span>
            <span className={securityStatus.headersInitialized ? 'text-emerald-600' : 'text-red-600'}>
              {securityStatus.headersInitialized ? '✓' : '✗'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">HTTPS</span>
            <span className={securityStatus.isHttps ? 'text-emerald-600' : 'text-red-600'}>
              {securityStatus.isHttps ? '✓' : '✗'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Worker</span>
            <span className={securityStatus.hasServiceWorker ? 'text-emerald-600' : 'text-amber-600'}>
              {securityStatus.hasServiceWorker ? '✓' : '○'}
            </span>
          </div>
        </div>

        {securityStatus.validation.missing.length > 0 && (
          <div className="text-xs">
            <div className="text-red-600 font-medium">Missing Headers:</div>
            <div className="text-muted-foreground">
              {securityStatus.validation.missing.join(', ')}
            </div>
          </div>
        )}

        {securityStatus.validation.issues.length > 0 && (
          <div className="text-xs">
            <div className="text-amber-600 font-medium">Issues:</div>
            <div className="text-muted-foreground">
              {securityStatus.validation.issues.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};