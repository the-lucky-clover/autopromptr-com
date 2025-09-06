import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBatchAutomation } from '@/hooks/useBatchAutomation';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';

export const BatchAutomationTest = () => {
  const [testRunning, setTestRunning] = useState(false);
  const { runBatch, status, loading, error } = useBatchAutomation();
  const { toast } = useToast();

  const testBatch = async () => {
    setTestRunning(true);
    
    // Create a simple test batch
    const testBatchData: Batch = {
      id: 'test-' + Date.now(),
      name: 'Gradient Animation Test',
      targetUrl: window.location.origin,
      description: 'Testing animated gradient for hero word "supercharge"',
      prompts: [
        {
          id: 'prompt-1',
          text: 'Implement animated gradient fill in hero headline word "supercharge" only - add a dynamic rainbow gradient that shifts colors smoothly while keeping other text static',
          order: 1
        }
      ],
      status: 'pending',
      createdAt: new Date()
    };

    try {
      console.log('Testing batch automation with:', testBatchData);
      const result = await runBatch(testBatchData, 'web', { 
        waitForIdle: true, 
        maxRetries: 1 
      });
      
      console.log('Batch automation test result:', result);
      
      toast({
        title: "Test Successful",
        description: "AI automation system is working correctly!",
        variant: "default"
      });
    } catch (err) {
      console.error('Batch automation test failed:', err);
      
      toast({
        title: "Test Failed",
        description: `AI automation test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AI Automation Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testBatch}
          disabled={testRunning || loading}
          className="w-full"
        >
          {testRunning || loading ? 'Testing...' : 'Test AI Automation'}
        </Button>
        
        {status && (
          <div className="text-sm">
            <p><strong>Status:</strong> {status.status}</p>
            <p><strong>Platform:</strong> {status.platform}</p>
            <p><strong>Progress:</strong> {status.progress.percentage}%</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          This tests the AI prompt queue processing system to verify it's working correctly.
        </div>
      </CardContent>
    </Card>
  );
};