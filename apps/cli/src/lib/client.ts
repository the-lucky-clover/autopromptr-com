import axios, { AxiosInstance } from 'axios';

export interface BatchJob {
  job_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  created_at: string;
  updated_at: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  tasks: Array<{
    id: string;
    prompt: string;
    status: string;
    result?: any;
    error?: string;
  }>;
}

export class AutoPromptClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:5000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  async createBatch(name: string, prompts: string[], description?: string, target?: string) {
    const response = await this.client.post('/api/batches', {
      name,
      description,
      prompts: prompts.map(prompt => ({ text: prompt, platform: target }))
    });
    return response.data;
  }

  async runBatch(jobId: string) {
    const response = await this.client.post(`/api/batches/${jobId}/run`);
    return response.data;
  }

  async getBatchStatus(jobId: string) {
    const response = await this.client.get(`/api/batches/${jobId}/status`);
    return response.data;
  }

  async stopBatch(jobId: string) {
    const response = await this.client.post(`/api/batches/${jobId}/stop`);
    return response.data;
  }

  async listBatches() {
    const response = await this.client.get('/api/batches');
    return response.data;
  }

  async testGemini(prompt: string = 'Hello, this is a test prompt') {
    const response = await this.client.post('/api/test/gemini', { prompt });
    return response.data;
  }
}

export const client = new AutoPromptClient();