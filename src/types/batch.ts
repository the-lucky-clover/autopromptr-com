
export interface TextPrompt {
  id: string;
  text: string;
  order: number;
}

export interface Batch {
  id: string;
  name: string;
  targetUrl: string;
  description?: string;
  prompts: TextPrompt[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'paused';
  createdAt: Date;
  platform?: string;
  errorMessage?: string; // Added error message support
  settings?: {
    waitForIdle: boolean;
    maxRetries: number;
    automationDelay?: number;
    elementTimeout?: number;
    debugLevel?: 'minimal' | 'standard' | 'detailed' | 'verbose';
  };
}

export interface Platform {
  id: string;
  name: string;
  type: string;
}

export interface BatchStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'stopped';
  platform: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
    failed: number;
    processing: number;
    pending: number;
  };
  recent_logs?: Array<{
    level: string;
    message: string;
  }>;
}

export interface BatchFormData {
  name: string;
  targetUrl: string;
  description: string;
  initialPrompt: string;
  platform: string;
  waitForIdle: boolean;
  maxRetries: number;
}
