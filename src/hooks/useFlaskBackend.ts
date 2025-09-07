import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { FlaskBackendClient, FlaskBatchJob, BatchProgress } from '@/services/flaskBackend';

interface UseFlaskBackendConfig {
  baseUrl?: string;
  autoConnect?: boolean;
}

export function useFlaskBackend(config: UseFlaskBackendConfig = {}) {
  const [client] = useState(() => new FlaskBackendClient({
    baseUrl: config.baseUrl || 'http://localhost:5000' // Direct URL since env variables are not supported
  }));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, operation: string) => {
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide better error messages for common connection issues
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
      errorMessage = 'Flask backend is not running. Please start the backend service on localhost:5000';
    } else if (errorMessage.includes('Network request failed')) {
      errorMessage = 'Network error - check if the Flask backend is accessible';
    } else if (errorMessage.includes('Request timeout')) {
      errorMessage = 'Backend request timed out - the service may be overloaded';
    }
    
    setError(errorMessage);
    
    toast({
      title: `${operation} Failed`,
      description: errorMessage,
      variant: "destructive"
    });
    
    console.error(`Flask Backend ${operation} error:`, error);
  }, [toast]);

  const testConnection = useCallback(async () => {
    setLoading(true);
    clearError();
    
    try {
      const health = await client.healthCheck();
      setConnected(health.status === 'healthy');
      
      if (health.status === 'healthy') {
        toast({
          title: "Connection Successful",
          description: "Flask backend is healthy and ready"
        });
      }
      
      return health;
    } catch (error) {
      setConnected(false);
      handleError(error, 'Connection Test');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, toast, clearError, handleError]);

  const createBatch = useCallback(async (
    name: string,
    prompts: Array<{text: string; platform?: string}>,
    description?: string
  ) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await client.createBatch(name, prompts, description);
      
      toast({
        title: "Batch Created",
        description: `Batch "${name}" created with ID: ${result.job_id}`
      });
      
      return result;
    } catch (error) {
      handleError(error, 'Create Batch');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, toast, clearError, handleError]);

  const runBatch = useCallback(async (jobId: string) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await client.runBatch(jobId);
      
      toast({
        title: "Batch Started",
        description: `Batch processing started for job ${jobId}`
      });
      
      return result;
    } catch (error) {
      handleError(error, 'Run Batch');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, toast, clearError, handleError]);

  const getBatchStatus = useCallback(async (jobId: string) => {
    try {
      return await client.getBatchStatus(jobId);
    } catch (error) {
      handleError(error, 'Get Batch Status');
      throw error;
    }
  }, [client, handleError]);

  const stopBatch = useCallback(async (jobId: string) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await client.stopBatch(jobId);
      
      toast({
        title: "Batch Stopped",
        description: `Batch ${jobId} has been stopped`
      });
      
      return result;
    } catch (error) {
      handleError(error, 'Stop Batch');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, toast, clearError, handleError]);

  const listBatches = useCallback(async () => {
    setLoading(true);
    clearError();
    
    try {
      return await client.listBatches();
    } catch (error) {
      handleError(error, 'List Batches');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, clearError, handleError]);

  const testGemini = useCallback(async (prompt?: string) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await client.testGemini(prompt);
      
      if (result.success) {
        toast({
          title: "Gemini Test Successful",
          description: "Gemini AI is working correctly"
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, 'Test Gemini');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, toast, clearError, handleError]);

  return {
    // State
    loading,
    error,
    connected,
    
    // Actions
    testConnection,
    createBatch,
    runBatch,
    getBatchStatus,
    stopBatch,
    listBatches,
    testGemini,
    clearError,
    
    // Client instance
    client
  };
}