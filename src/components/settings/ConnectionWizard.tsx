
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Wifi } from 'lucide-react';
import { ConnectionDiagnostics, ConnectionTestResult } from '@/services/connectionDiagnostics';
import { useToast } from '@/hooks/use-toast';

export const ConnectionWizard = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const runConnectionTest = async () => {
    setIsTestingConnection(true);
    setTestResults(null);
    
    try {
      const diagnostics = new ConnectionDiagnostics();
      const results = await diagnostics.runComprehensiveTest();
      setTestResults(results);
      
      if (results.overallSuccess) {
        toast({
          title: "Connection test successful",
          description: "Backend connectivity verified successfully.",
        });
      } else {
        toast({
          title: "Connection test failed",
          description: results.recommendations.join(', '),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Connection test error",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>Connection Wizard</span>
        </CardTitle>
        <CardDescription className="text-purple-200">
          Test and diagnose backend connectivity issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <Button 
            onClick={runConnectionTest}
            disabled={isTestingConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Run Connection Test'
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Overall Status</h4>
              <Badge variant={testResults.overallSuccess ? 'default' : 'destructive'}>
                {testResults.overallSuccess ? 'Connected' : 'Failed'}
              </Badge>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white text-sm mb-2">
                <strong>Configured URL:</strong> {testResults.configuredUrl}
              </p>
              <p className="text-white text-sm">
                <strong>Network:</strong> {testResults.networkEnvironment.isOnline ? 'Online' : 'Offline'} 
                ({testResults.networkEnvironment.networkType})
              </p>
            </div>

            <div>
              <h5 className="text-white font-medium mb-2">Endpoint Tests</h5>
              <div className="space-y-2">
                {testResults.endpointResults.map((result: ConnectionTestResult, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.success)}
                      <span className="text-white text-sm">{result.endpoint}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xs">{result.responseTime}ms</span>
                      {result.error && (
                        <p className="text-red-300 text-xs">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testResults.recommendations.length > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <h5 className="text-yellow-300 font-medium mb-2">Recommendations</h5>
                <ul className="text-yellow-200 text-sm space-y-1">
                  {testResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {testResults.networkEnvironment.hasAdBlocker && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-300 text-sm">
                  <strong>Ad Blocker Detected:</strong> This may interfere with backend requests. 
                  Consider whitelisting this domain.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
