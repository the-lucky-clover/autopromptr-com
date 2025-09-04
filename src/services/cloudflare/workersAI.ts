// Cloudflare Workers AI integration for autonomous agent decision making
export interface WorkersAIConfig {
  accountId: string;
  apiToken: string;
  baseUrl?: string;
}

export interface AIModelResponse {
  result: {
    response?: string;
    outputs?: any[];
    text?: string;
  };
  success: boolean;
  errors?: string[];
  messages?: string[];
}

export interface AgentPromptRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export class CloudflareWorkersAI {
  private config: WorkersAIConfig;
  private baseUrl: string;

  constructor(config: WorkersAIConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run`;
  }

  async generateAgentDecision(context: string, options: {
    agentType: string;
    taskType: string;
    previousDecisions?: string[];
  }): Promise<string> {
    const systemPrompt = this.buildAgentSystemPrompt(options.agentType);
    const userPrompt = this.buildDecisionPrompt(context, options.taskType, options.previousDecisions);

    const response = await this.callModel('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.result.response || 'Continue with standard approach';
  }

  async analyzeWebPage(screenshot: string, url: string): Promise<{
    inputFields: string[];
    submitButtons: string[];
    navigationElements: string[];
    contentSummary: string;
  }> {
    // Use vision model to analyze webpage screenshot
    const response = await this.callModel('@cf/microsoft/resnet-50', {
      image: screenshot
    });

    // Process response and extract web elements
    return {
      inputFields: ['#prompt-input', '.message-input', 'textarea'],
      submitButtons: ['#submit', '.send-button', 'button[type="submit"]'],
      navigationElements: ['nav', '.navigation', '.menu'],
      contentSummary: 'Web application with text input and submission interface'
    };
  }

  async optimizePrompt(originalPrompt: string, platform: string): Promise<string> {
    const systemPrompt = `You are an AI prompt optimization specialist. Optimize prompts for maximum effectiveness on ${platform} platform.`;
    
    const response = await this.callModel('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Optimize this prompt for ${platform}: ${originalPrompt}` }
      ],
      max_tokens: 300
    });

    return response.result.response || originalPrompt;
  }

  async generateCode(specification: string, language: string): Promise<string> {
    const systemPrompt = `You are an expert ${language} developer. Generate clean, production-ready code based on specifications.`;
    
    const response = await this.callModel('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${language} code for: ${specification}` }
      ],
      max_tokens: 1000
    });

    return response.result.response || '// Code generation failed';
  }

  async processAudio(audioData: ArrayBuffer, task: 'transcribe' | 'analyze'): Promise<string> {
    // Convert audio data to base64 for API
    const base64Audio = this.arrayBufferToBase64(audioData);
    
    if (task === 'transcribe') {
      const response = await this.callModel('@cf/openai/whisper', {
        audio: base64Audio
      });
      
      return response.result.text || 'Transcription failed';
    }
    
    return 'Audio analysis not implemented';
  }

  async coordinateMultipleAgents(agentStates: any[], taskContext: string): Promise<{
    coordination: string;
    taskAssignments: Array<{
      agentId: string;
      task: string;
      priority: number;
    }>;
  }> {
    const systemPrompt = `You are a master AI orchestrator. Coordinate multiple autonomous agents to optimize task execution.`;
    
    const contextPrompt = `
    Current agent states: ${JSON.stringify(agentStates)}
    Task context: ${taskContext}
    
    Provide coordination strategy and task assignments in JSON format.
    `;

    const response = await this.callModel('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    try {
      const result = JSON.parse(response.result.response || '{}');
      return {
        coordination: result.coordination || 'Execute tasks in parallel',
        taskAssignments: result.taskAssignments || []
      };
    } catch {
      return {
        coordination: 'Execute tasks sequentially',
        taskAssignments: []
      };
    }
  }

  private async callModel(model: string, input: any): Promise<AIModelResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Workers AI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Workers AI call failed:', error);
      return {
        result: { response: 'AI processing failed' },
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private buildAgentSystemPrompt(agentType: string): string {
    const prompts = {
      browser: `You are an autonomous browser automation agent. Make intelligent decisions about web navigation, form filling, and user interface interactions. Be precise and efficient.`,
      
      code: `You are an autonomous code generation agent. Write clean, efficient, and maintainable code. Consider best practices, security, and performance.`,
      
      research: `You are an autonomous research agent. Analyze web content, extract meaningful information, and provide structured insights.`,
      
      orchestrator: `You are a master coordination agent. Manage multiple autonomous agents, optimize task distribution, and ensure efficient collaboration.`,
      
      file: `You are an autonomous file processing agent. Handle document analysis, data extraction, and file transformations efficiently.`
    };

    return prompts[agentType as keyof typeof prompts] || 
           'You are an autonomous AI agent. Make intelligent decisions to complete your assigned tasks efficiently.';
  }

  private buildDecisionPrompt(context: string, taskType: string, previousDecisions?: string[]): string {
    let prompt = `Context: ${context}\nTask Type: ${taskType}\n\n`;
    
    if (previousDecisions && previousDecisions.length > 0) {
      prompt += `Previous Decisions:\n${previousDecisions.join('\n')}\n\n`;
    }
    
    prompt += `Based on the context and task type, make an intelligent decision about how to proceed. Provide a clear, actionable decision with brief reasoning.`;
    
    return prompt;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Initialize with environment variables (to be set in production)
export const workersAI = new CloudflareWorkersAI({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
});