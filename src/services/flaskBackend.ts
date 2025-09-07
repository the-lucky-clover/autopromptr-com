export interface FlaskBatchJob {
  id: string;
  name: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'stopped' | 'partial_success' | 'error';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  tasks: FlaskBatchTask[];
}

export interface FlaskBatchTask {
  id: string;
  prompt: string;
  target_platform: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
}

export interface FlaskBackendConfig {
  baseUrl: string;
  timeout?: number;
}

export class FlaskBackendClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: FlaskBackendConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
  }

  async createBatch(
    name: string, 
    prompts: Array<{text: string; platform?: string}>,
    description?: string
  ): Promise<{job_id: string; status: string; message: string}> {
    const response = await this.makeRequest('/api/batch/create', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description || '',
        prompts: prompts.map(p => ({
          text: p.text,
          platform: p.platform || 'lovable'
        }))
      })
    });

    return response;
  }

  async runBatch(jobId: string): Promise<{message: string; job_id: string; status: string}> {
    const response = await this.makeRequest(`/api/batch/run/${jobId}`, {
      method: 'POST'
    });

    return response;
  }

  async getBatchStatus(jobId: string): Promise<{
    job: FlaskBatchJob;
    progress: BatchProgress;
  }> {
    const response = await this.makeRequest(`/api/batch/status/${jobId}`);
    return response;
  }

  async stopBatch(jobId: string): Promise<{status: string; job_id: string}> {
    const response = await this.makeRequest(`/api/batch/stop/${jobId}`, {
      method: 'POST'
    });

    return response;
  }

  async listBatches(): Promise<{
    active_jobs: FlaskBatchJob[];
    job_history: FlaskBatchJob[];
  }> {
    const response = await this.makeRequest('/api/batch/list');
    return response;
  }

  async testGemini(prompt?: string): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    const response = await this.makeRequest('/api/gemini/test', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt || 'Hello, this is a test prompt for Gemini AI.'
      })
    });

    return response;
  }

  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
    services?: any;
  }> {
    const response = await this.makeRequest('/health');
    return response;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
}

// Default client instance
export const flaskBackend = new FlaskBackendClient({
  baseUrl: 'http://localhost:5000' // Direct URL since env variables are not supported
});