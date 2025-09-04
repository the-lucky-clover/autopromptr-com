import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Batch } from '@/types/batch';

export function useDockerAutomation() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const automationUrl = import.meta.env.VITE_AUTOMATION_URL || 'http://localhost:3000';

  const createSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${automationUrl}/browser/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserType: 'chromium', headless: true })
      });
      
      const result = await response.json();
      setSessionId(result.sessionId);
      
      toast({
        title: "Browser session created",
        description: "Ready for automation"
      });
      
      return result.sessionId;
    } catch (error) {
      toast({
        title: "Failed to create session",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [automationUrl, toast]);

  const runUniversalBatch = useCallback(async (batch: Batch) => {
    if (!sessionId) {
      await createSession();
    }

    try {
      setLoading(true);
      
      // Detect platform first
      const detectResponse = await fetch(`${automationUrl}/platform/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, url: batch.targetUrl })
      });
      
      const detection = await detectResponse.json();
      
      if (!detection.platform) {
        throw new Error('Could not detect platform for automation');
      }

      // Run batch through agents service
      const agentsUrl = import.meta.env.VITE_AGENTS_URL || 'http://localhost:3001';
      const batchResponse = await fetch(`${agentsUrl}/batch/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          batchId: batch.id,
          platform: detection.platform,
          prompts: batch.prompts 
        })
      });
      
      const result = await batchResponse.json();
      
      toast({
        title: "Batch completed",
        description: `Successfully automated ${batch.prompts.length} prompts on ${detection.platform.display_name}`
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Automation failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId, automationUrl, createSession, toast]);

  return {
    loading,
    sessionId,
    createSession,
    runUniversalBatch
  };
}