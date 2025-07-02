
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
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'paused' | 'draft';
  createdAt: Date;
  platform?: string;
  errorMessage?: string;
  settings?: {
    waitForIdle: boolean;
    maxRetries: number;
    automationDelay?: number;
    elementTimeout?: number;
    debugLevel?: 'minimal' | 'standard' | 'detailed' | 'verbose';
    isLocalPath?: boolean;
    localAIAssistant?: 'cursor' | 'windsurf' | 'github-copilot' | 'bolt-diy' | 'roocode';
    promptEnhancement?: boolean;
    targetUrlOverride?: string;
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

// New types for AutoPromptr Backend Integration
export interface AutoPromptrBackendRequest {
  batch: {
    id: string;
    prompt: string;
    targetUrl?: string;
  };
  platform: string;
  wait_for_idle?: boolean;
  max_retries?: number;
}

export interface AutoPromptrBackendResponse {
  batchId: string;
  status: 'completed' | 'failed';
  result: {
    success: boolean;
    action: string;
    prompt: string;
    method: string;
    timestamp: string;
    details: string;
  };
  screenshot: string; // Base64 encoded PNG image
  processedAt: string;
  platform: string;
  error?: string;
}
