
// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://autopromptr-backend.onrender.com'  // Replace with your Render.com URL
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
    const response = await fetch(`${this.apiBaseUrl}/health`);
    if (!response.ok) throw new Error('Backend is not healthy');
    return response.json();
  }
}
