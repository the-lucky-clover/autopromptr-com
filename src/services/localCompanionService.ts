import { Batch } from '@/types/batch';

export interface LocalCompanionInfo {
  available: boolean;
  url: string;
  version?: string;
  platform?: string;
  tools?: LocalTool[];
}

export interface LocalTool {
  name: string;
  path: string;
  available: boolean;
}

export class LocalCompanionService {
  private companionUrl = 'http://localhost:3001';
  private isAvailable = false;

  async checkCompanionAvailability(): Promise<LocalCompanionInfo> {
    try {
      const response = await fetch(`${this.companionUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.isAvailable = true;
        
        // Also get available tools
        const tools = await this.getAvailableTools();
        
        return {
          available: true,
          url: this.companionUrl,
          version: data.version,
          platform: data.platform,
          tools
        };
      }
    } catch (error) {
      console.log('Local companion not available:', error.message);
    }

    this.isAvailable = false;
    return {
      available: false,
      url: this.companionUrl,
      tools: []
    };
  }

  async getAvailableTools(): Promise<LocalTool[]> {
    if (!this.isAvailable) return [];

    try {
      const response = await fetch(`${this.companionUrl}/detect-tools`);
      const data = await response.json();
      return data.success ? data.tools : [];
    } catch (error) {
      console.error('Failed to get available tools:', error);
      return [];
    }
  }

  async sendPromptsToLocalTool(
    prompts: string[], 
    targetTool: string, 
    metadata?: any
  ): Promise<{ success: boolean; results?: any; error?: string }> {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'Local companion app is not running. Please start the AutoPromptr Companion app.'
      };
    }

    try {
      const response = await fetch(`${this.companionUrl}/receive-prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompts,
          targetTool,
          metadata: {
            ...metadata,
            source: 'web-platform',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send prompts to local tool:', error);
      return {
        success: false,
        error: `Failed to communicate with local companion: ${error.message}`
      };
    }
  }

  async sendBatchToLocalTool(
    batch: Batch,
    targetTool: string
  ): Promise<{ success: boolean; results?: any; error?: string }> {
    const prompts = batch.prompts && Array.isArray(batch.prompts) 
      ? batch.prompts.map(p => typeof p === 'string' ? p : p.text || '')
      : [typeof batch.prompts === 'string' ? batch.prompts : ''];

    return this.sendPromptsToLocalTool(prompts, targetTool, {
      batchId: batch.id,
      targetUrl: batch.targetUrl,
      platform: batch.platform,
      settings: batch.settings
    });
  }

  async enhancePrompt(
    prompt: string, 
    context?: string
  ): Promise<{ success: boolean; enhancedPrompt?: string; error?: string }> {
    if (!this.isAvailable) {
      return {
        success: false,
        error: 'Local companion app is not running'
      };
    }

    try {
      const response = await fetch(`${this.companionUrl}/enhance-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, context })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: `Failed to enhance prompt: ${error.message}`
      };
    }
  }

  isCompanionAvailable(): boolean {
    return this.isAvailable;
  }

  getCompanionUrl(): string {
    return this.companionUrl;
  }
}

// Singleton instance
export const localCompanionService = new LocalCompanionService();