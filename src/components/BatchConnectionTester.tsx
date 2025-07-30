import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { ConnectionDiagnostics } from '@/services/connectionDiagnostics';
import { useToast } from '@/hooks/use-toast';

export const BatchConnectionTester = () => {
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { toast } = useToast();

  const runConnectionTest = async () => {
    if (testing) return;
    
    setTesting(true);
    try {
      console.log('🔍 Running connection diagnostics...');
      const diagnostics = new ConnectionDiagnostics();
      const result = await diagnostics.runComprehensiveTest();
      
      setLastTestResult(result);
      
      if (result.overallSuccess) {
        toast({
          title: 'Connection Test Passed',
          description: 'Backend is ready for automation',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Connection Issues Detected',
          description: 'Check the details below for guidance',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Unable to complete connection test',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Connection Diagnostics
        </CardTitle>
        <CardDescription className="text-purple-200">
          Test your connection to the automation backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runConnectionTest} 
          disabled={testing}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {testing ? 'Testing Connection...' : 'Test Backend Connection'}
        </Button>

        {lastTestResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={lastTestResult.overallSuccess ? 'default' : 'destructive'}>
                {lastTestResult.overallSuccess ? 'Connected' : 'Connection Issues'}
              </Badge>
              <span className="text-sm text-gray-400">
                Backend: {lastTestResult.configuredUrl}
              </span>
            </div>

            {lastTestResult.endpointResults?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Endpoint Tests:</h4>
                {lastTestResult.endpointResults.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      <span className="text-sm text-white">{result.endpoint}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {result.success ? `${result.latency}ms` : result.error}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lastTestResult.recommendations?.length > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Recommendations:</strong>
                  <ul className="mt-2 space-y-1">
                    {lastTestResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm">• {rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <div>Network: {lastTestResult.networkEnvironment?.isOnline ? 'Online' : 'Offline'}</div>
              <div>Connection Type: {lastTestResult.networkEnvironment?.networkType}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchConnectionTester;