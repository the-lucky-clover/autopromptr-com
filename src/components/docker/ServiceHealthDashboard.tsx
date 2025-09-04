import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { dockerApiClient } from '@/services/dockerApiClient';

interface ServiceStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'error';
  data?: any;
  error?: string;
}

export function ServiceHealthDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const healthResults = await dockerApiClient.checkServicesHealth();
      const mappedResults: ServiceStatus[] = healthResults.map(result => ({
        service: result.service,
        status: (result.status === 'healthy' || result.status === 'unhealthy' || result.status === 'error') 
          ? result.status 
          : 'error',
        data: 'data' in result ? result.data : undefined,
        error: 'error' in result ? result.error : undefined
      }));
      setServices(mappedResults);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check service health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'unhealthy':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Docker Services Health</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <h4 className="font-medium capitalize">{service.service} Service</h4>
                  {service.error && (
                    <p className="text-sm text-muted-foreground">{service.error}</p>
                  )}
                  {service.data && (
                    <p className="text-xs text-muted-foreground">
                      {JSON.stringify(service.data, null, 2)}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getStatusVariant(service.status)}>
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
        
        {lastChecked && (
          <p className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}