
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { AutoPromtprError } from '../autoPromptr';

export class LangChainClient {
  private model: ChatOpenAI;

  constructor(options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }) {
    try {
      this.model = new ChatOpenAI({
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 1000,
        modelName: options?.model || 'gpt-3.5-turbo',
        openAIApiKey: process.env.OPENAI_API_KEY
      });
    } catch (error) {
      throw new AutoPromtprError(
        'Failed to initialize LangChain client',
        'LANGCHAIN_INIT_ERROR',
        500,
        false
      );
    }
  }

  async processPrompt(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      console.log('🔄 Processing prompt with LangChain...');
      
      if (options) {
        // Update model parameters if options provided
        this.model.temperature = options.temperature || this.model.temperature;
        this.model.maxTokens = options.maxTokens || this.model.maxTokens;
      }

      const parser = new StringOutputParser();
      const chain = this.model.pipe(parser);
      
      const result = await chain.invoke(prompt);
      
      console.log('✅ LangChain prompt processed successfully');
      return result;

    } catch (error) {
      console.error('💥 LangChain prompt processing failed:', error);
      
      throw new AutoPromtprError(
        'LangChain prompt processing failed',
        'LANGCHAIN_PROMPT_ERROR',
        500,
        true
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResult = await this.processPrompt('Test connection');
      return testResult.length > 0;
    } catch (error) {
      console.error('LangChain connection test failed:', error);
      return false;
    }
  }
}
