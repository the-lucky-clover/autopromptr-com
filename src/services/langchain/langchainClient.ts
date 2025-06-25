
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AutoPromtrError } from '../autoPromptr';

export interface LangChainConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

export class LangChainClient {
  private chatModel: ChatOpenAI;
  private config: Required<LangChainConfig>;

  constructor(config: LangChainConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'gpt-3.5-turbo',
      temperature: config.temperature || 0.7,
      maxRetries: config.maxRetries || 3
    };

    this.chatModel = new ChatOpenAI({
      openAIApiKey: this.config.apiKey,
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxRetries: this.config.maxRetries
    });
  }

  async processPrompt(prompt: string, targetUrl: string): Promise<string> {
    try {
      console.log(`🔗 LangChain processing prompt for: ${targetUrl}`);
      
      const messages = [
        new SystemMessage(`You are processing a prompt for the target URL: ${targetUrl}. Provide a structured response that acknowledges the prompt processing.`),
        new HumanMessage(prompt)
      ];

      const response = await this.chatModel.invoke(messages);
      
      console.log('✅ LangChain prompt processed successfully');
      return response.content as string;
      
    } catch (error) {
      console.error('❌ LangChain processing failed:', error);
      throw new AutoPromtrError(
        `LangChain processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LANGCHAIN_PROCESSING_FAILED',
        500,
        true
      );
    }
  }

  async checkTargetAvailability(targetUrl: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking target availability: ${targetUrl}`);
      
      const response = await fetch(targetUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const isAvailable = response.ok;
      console.log(`${isAvailable ? '✅' : '❌'} Target ${targetUrl} availability: ${isAvailable}`);
      
      return isAvailable;
    } catch (error) {
      console.warn(`⚠️ Target availability check failed for ${targetUrl}:`, error);
      return false;
    }
  }

  async waitForTargetAvailability(targetUrl: string, maxWaitTime: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds
    
    while (Date.now() - startTime < maxWaitTime) {
      const isAvailable = await this.checkTargetAvailability(targetUrl);
      
      if (isAvailable) {
        return true;
      }
      
      console.log(`⏳ Waiting for target availability... ${Math.round((Date.now() - startTime) / 1000)}s elapsed`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.warn(`⚠️ Target ${targetUrl} not available after ${maxWaitTime}ms`);
    return false;
  }
}
