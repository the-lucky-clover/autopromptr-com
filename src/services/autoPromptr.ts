
import { useState, useEffect } from 'react';

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://autopromptr-backend.onrender.com'  // Your actual Render.com backend URL
  : 'http://localhost:3001';

// API Service Class
export class AutoPromptr {
  private apiBaseUrl: string;

  constructor(apiBaseUrl = API_BASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Get supported platforms
  async getPlatforms() {
    const response = await fetch(`${this.apiBaseUrl}/api/platforms`);
    if (!response.ok) throw new Error('Failed to fetch platforms');
    return response.json();
  }

  // Start batch processing
  async runBatch(batchId: string, platform: string, options: { delay?: number; maxRetries?: number } = {}) {
    console.log('Starting batch with:', { batchId, platform, options });
    console.log('Backend URL:', this.apiBaseUrl);
    
    const response = await fetch(`${this.apiBaseUrl}/api/run-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch_id: batchId,
        platform: platform,
        delay_between_prompts: options.delay || 5000,
        max_retries: options.maxRetries || 3
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error response:', error);
      throw new Error(error.error || 'Failed to start batch');
    }
    
    return response.json();
  }

  // Stop batch processing
  async stopBatch(batchId: string) {
    const response = await fetch(`${this.apiBaseUrl}/api/stop-batch/${batchId}`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to stop batch');
    return response.json();
  }

  // Get batch status and progress
  async getBatchStatus(batchId: string) {
    const response = await fetch(`${this.apiBaseUrl}/api/batch-status/${batchId}`);
    if (!response.ok) throw new Error('Failed to get batch status');
    return response.json();
  }

  // Get detailed batch results
  async getBatchResults(batchId: string) {
    const response = await fetch(`${this.apiBaseUrl}/api/batch-results/${batchId}`);
    if (!response.ok) throw new Error('Failed to get batch results');
    return response.json();
  }

  // Health check
  async healthCheck() {
    console.log('Checking backend health at:', this.apiBaseUrl);
    const response = await fetch(`${this.apiBaseUrl}/health`);
    if (!response.ok) throw new Error('Backend is not healthy');
    return response.json();
  }
}

// React Hook for batch automation
export function useBatchAutomation(batchId?: string) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPromptr] = useState(new AutoPromptr());

  // Poll for status updates
  useEffect(() => {
    if (!batchId) return;

    const pollStatus = async () => {
      try {
        const statusData = await autoPromptr.getBatchStatus(batchId);
        setStatus(statusData);
        
        // Stop polling if batch is completed or failed
        if (['completed', 'failed', 'stopped'].includes(statusData.status)) {
          return;
        }
        
        // Continue polling every 5 seconds
        setTimeout(pollStatus, 5000);
      } catch (err) {
        console.error('Status polling error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    pollStatus();
  }, [batchId, autoPromptr]);

  const runBatch = async (platform: string, options?: { delay?: number; maxRetries?: number }) => {
    if (!batchId) throw new Error('No batch ID provided');
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Running batch:', batchId, 'on platform:', platform);
      const result = await autoPromptr.runBatch(batchId, platform, options);
      console.log('Batch run result:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Run batch error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopBatch = async () => {
    if (!batchId) throw new Error('No batch ID provided');
    
    try {
      await autoPromptr.stopBatch(batchId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    runBatch,
    stopBatch,
    autoPromptr
  };
}
