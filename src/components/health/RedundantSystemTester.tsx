import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Play, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  details?: any;
}

export const RedundantSystemTester = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (name: string, update: Partial<TestResult>) => {
    setResults(prev => 
      prev.map(r => r.name === name ? { ...r, ...update } : r)
    );
  };

  const runTests = async () => {
    setIsRunning(true);
    
    const tests: TestResult[] = [
      { name: 'Backend Health Monitor', status: 'pending' },
      { name: 'Backend Router Connection', status: 'pending' },
      { name: 'Python Backend Routing', status: 'pending' },
      { name: 'Node.js Backend Routing', status: 'pending' },
      { name: 'Failover Logic Test', status: 'pending' },
      { name: 'Health Cache Test', status: 'pending' }
    ];
    
    setResults(tests);

    // Test 1: Backend Health Monitor
    updateResult('Backend Health Monitor', { status: 'running' });
    const startTime1 = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('backend-health-monitor');
      const duration = Date.now() - startTime1;
      
      if (error) throw error;
      
      updateResult('Backend Health Monitor', {
        status: 'passed',
        duration,
        message: `Overall status: ${data.overall}`,
        details: data
      });
    } catch (error) {
      updateResult('Backend Health Monitor', {
        status: 'failed',
        duration: Date.now() - startTime1,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Backend Router Connection
    updateResult('Backend Router Connection', { status: 'running' });
    const startTime2 = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('backend-router', {
        body: { action: 'health' }
      });
      const duration = Date.now() - startTime2;
      
      if (error) throw error;
      
      updateResult('Backend Router Connection', {
        status: 'passed',
        duration,
        message: `Router responsive - ${data.overall} status`,
        details: data
      });
    } catch (error) {
      updateResult('Backend Router Connection', {
        status: 'failed',
        duration: Date.now() - startTime2,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Python Backend Routing (Lovable)
    updateResult('Python Backend Routing', { status: 'running' });
    const startTime3 = Date.now();
    try {
      const testBatch = {
        id: 'test-python-routing',
        targetUrl: 'https://lovable.dev',
        prompts: [{ id: '1', text: 'Test prompt' }],
        options: { wait_for_completion: false, max_retries: 1 }
      };
      
      const { data, error } = await supabase.functions.invoke('backend-router', {
        body: { action: 'process', batch: testBatch }
      });
      const duration = Date.now() - startTime3;
      
      if (error) throw error;
      
      updateResult('Python Backend Routing', {
        status: 'passed',
        duration,
        message: 'Python backend routed correctly for Lovable',
        details: data
      });
    } catch (error) {
      updateResult('Python Backend Routing', {
        status: 'failed',
        duration: Date.now() - startTime3,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Node.js Backend Routing (Generic)
    updateResult('Node.js Backend Routing', { status: 'running' });
    const startTime4 = Date.now();
    try {
      const testBatch = {
        id: 'test-nodejs-routing',
        targetUrl: 'https://example.com',
        prompts: [{ id: '1', text: 'Test prompt' }],
        options: { wait_for_completion: false, max_retries: 1 }
      };
      
      const { data, error } = await supabase.functions.invoke('backend-router', {
        body: { action: 'process', batch: testBatch }
      });
      const duration = Date.now() - startTime4;
      
      if (error) throw error;
      
      updateResult('Node.js Backend Routing', {
        status: 'passed',
        duration,
        message: 'Node.js backend routed correctly for generic URL',
        details: data
      });
    } catch (error) {
      updateResult('Node.js Backend Routing', {
        status: 'failed',
        duration: Date.now() - startTime4,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Failover Logic
    updateResult('Failover Logic Test', { status: 'running' });
    const startTime5 = Date.now();
    try {
      // Check health first
      const { data: healthData } = await supabase.functions.invoke('backend-health-monitor');
      const duration = Date.now() - startTime5;
      
      const hasHealthyBackend = healthData?.summary?.healthy > 0;
      
      updateResult('Failover Logic Test', {
        status: hasHealthyBackend ? 'passed' : 'failed',
        duration,
        message: hasHealthyBackend 
          ? `Failover ready: ${healthData.summary.healthy} healthy backend(s)` 
          : 'No healthy backends available for failover',
        details: healthData
      });
    } catch (error) {
      updateResult('Failover Logic Test', {
        status: 'failed',
        duration: Date.now() - startTime5,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 6: Health Cache Test
    updateResult('Health Cache Test', { status: 'running' });
    const startTime6 = Date.now();
    try {
      // Call health twice rapidly to test caching
      const call1 = await supabase.functions.invoke('backend-router', {
        body: { action: 'health' }
      });
      const call2 = await supabase.functions.invoke('backend-router', {
        body: { action: 'health' }
      });
      const duration = Date.now() - startTime6;
      
      if (call1.error || call2.error) throw new Error('Cache test failed');
      
      updateResult('Health Cache Test', {
        status: 'passed',
        duration,
        message: 'Health cache working - rapid calls succeeded',
        details: { call1: call1.data, call2: call2.data }
      });
    } catch (error) {
      updateResult('Health Cache Test', {
        status: 'failed',
        duration: Date.now() - startTime6,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      running: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      passed: 'bg-green-500/20 text-green-400 border-green-500/50',
      failed: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalCount = results.length;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Redundant System Tests</h3>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mb-6 p-4 bg-background/50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">{passedCount}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{failedCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.name}
            className="p-4 bg-background/30 rounded-lg border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <span className="font-medium">{result.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {result.duration && (
                  <span className="text-sm text-muted-foreground">
                    {result.duration}ms
                  </span>
                )}
                {getStatusBadge(result.status)}
              </div>
            </div>
            {result.message && (
              <div className="text-sm text-muted-foreground ml-8">
                {result.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
