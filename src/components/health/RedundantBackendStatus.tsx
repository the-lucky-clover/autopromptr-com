import { useBackendHealth } from '@/hooks/useBackendHealth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Server } from 'lucide-react';

export const RedundantBackendStatus = () => {
  const { healthData, isLoading, error, refetch } = useBackendHealth(true, 30000);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'unhealthy':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Redundant Backend Status</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {healthData && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
            <span className="font-medium">Overall System Status</span>
            <Badge className={getStatusColor(healthData.overall)}>
              {healthData.overall.toUpperCase()}
            </Badge>
          </div>

          {/* Backend Details */}
          <div className="space-y-3">
            {Object.entries(healthData.backends).map(([key, backend]) => (
              <div
                key={key}
                className="p-4 bg-background/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(backend.status)}
                    <span className="font-medium capitalize">{key} Backend</span>
                  </div>
                  <Badge className={getStatusColor(backend.status)}>
                    {backend.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Response Time: {backend.responseTime}ms</div>
                  <div className="truncate">URL: {backend.url}</div>
                  {backend.error && (
                    <div className="text-destructive">Error: {backend.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {healthData.summary.healthy}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {healthData.summary.degraded}
              </div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {healthData.summary.unhealthy}
              </div>
              <div className="text-sm text-muted-foreground">Unhealthy</div>
            </div>
          </div>

          {/* Recommendations */}
          {healthData.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="font-medium text-sm mb-2">Recommendations:</div>
              <ul className="text-sm space-y-1">
                {healthData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
