
// Control panel for managing the transition between systems
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getActiveConfig, CLOUDFLARE_CONFIG } from '@/services/cloudflare/config';
import { CloudflareAutoPromptr } from '@/services/cloudflare/workers/autoPromptr';
import { AutoPromptr } from '@/services/autoPromptr/client';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Zap, Settings, TestTube } from 'lucide-react';

export const MigrationControlPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();
  const config = getActiveConfig();

  const handleHealthCheck = async () => {
    setIsLoading(true);
    const results: any = { lovable: null, cloudflare: null };

    try {
      // Test Lovable system
      try {
        const lovableClient = new AutoPromptr();
        results.lovable = await lovableClient.healthCheck();
        results.lovable.status = 'healthy';
      } catch (error) {
        results.lovable = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test Cloudflare system
      try {
        const cloudflareClient = new CloudflareAutoPromptr();
        results.cloudflare = await cloudflareClient.healthCheck();
        results.cloudflare.status = 'healthy';
      } catch (error) {
        results.cloudflare = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      }

      setTestResults(results);
      
      toast({
        title: 'Health Check Complete',
        description: 'System connectivity tests completed',
      });

    } catch (error) {
      toast({
        title: 'Health Check Failed',
        description: 'Unable to complete connectivity tests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = (feature: string, enabled: boolean) => {
    // Store feature flags in localStorage for development/testing
    localStorage.setItem(`cf_feature_${feature}`, enabled.toString());
    
    toast({
      title: `Feature ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `${feature} has been ${enabled ? 'enabled' : 'disabled'}. Refresh to apply changes.`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Migration Control Panel
        </CardTitle>
        <CardDescription>
          Monitor and control the Cloudflare Workers backend system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Environment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Legacy System</span>
              <Badge variant={config.useLovable ? 'default' : 'secondary'}>
                {config.useLovable ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Legacy Render.com Flask backend (deprecated)
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-orange-600" />
              <span className="font-medium">Cloudflare System</span>
              <Badge variant={config.useCloudflare ? 'default' : 'secondary'}>
                {config.useCloudflare ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Cloudflare Pages + Workers + D1 backend services
            </p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <h3 className="font-medium">Feature Toggles</h3>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Use Cloudflare Workers</div>
              <div className="text-sm text-gray-600">Route API calls to Cloudflare Workers</div>
            </div>
            <Switch
              checked={CLOUDFLARE_CONFIG.FEATURES.USE_CF_WORKERS}
              onCheckedChange={(enabled) => toggleFeature('workers', enabled)}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Parallel Processing</div>
              <div className="text-sm text-gray-600">Run batches on both systems simultaneously</div>
            </div>
            <Switch
              checked={CLOUDFLARE_CONFIG.FEATURES.PARALLEL_PROCESSING}
              onCheckedChange={(enabled) => toggleFeature('parallel', enabled)}
            />
          </div>
        </div>

        {/* Health Check */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">System Health</h3>
            <Button
              onClick={handleHealthCheck}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isLoading ? 'Testing...' : 'Run Health Check'}
            </Button>
          </div>
          
          {testResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <AlertDescription>
                  <div className="font-medium mb-1">Lovable System</div>
                  <Badge variant={testResults.lovable.status === 'healthy' ? 'default' : 'destructive'}>
                    {testResults.lovable.status}
                  </Badge>
                  {testResults.lovable.error && (
                    <p className="text-sm mt-1 text-red-600">{testResults.lovable.error}</p>
                  )}
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <div className="font-medium mb-1">Cloudflare System</div>
                  <Badge variant={testResults.cloudflare.status === 'healthy' ? 'default' : 'destructive'}>
                    {testResults.cloudflare.status}
                  </Badge>
                  {testResults.cloudflare.error && (
                    <p className="text-sm mt-1 text-red-600">{testResults.cloudflare.error}</p>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Current Configuration */}
        <Alert>
          <AlertDescription>
            <div className="font-medium mb-2">Current Configuration</div>
            <div className="text-sm space-y-1">
              <div>Environment: <Badge variant="outline">{config.environment}</Badge></div>
              <div>API URL: <code className="text-xs bg-gray-100 px-1 rounded">{config.apiUrl}</code></div>
              <div>Lovable Active: {config.useLovable ? '✅' : '❌'}</div>
              <div>Cloudflare Active: {config.useCloudflare ? '✅' : '❌'}</div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
