/**
 * 🧠 DeepSeek Code Generation Agent
 * Default code generation provider for CEO Bot
 * Supports 70+ programming languages with cost optimization
 */

import { captureException, captureMessage } from '@/lib/sentry';
import { CEOBot, AgentCapability } from '@/lib/agents/ceo-bot';
import { getDeepSeekConfig } from '@/lib/config-deepseek';

export interface CodeGenerationRequest {
  language: string;
  task: string;
  context?: string;
  constraints?: {
    maxLength?: number;
    style?: 'concise' | 'verbose' | 'documented';
    framework?: string;
  };
}

export interface CodeGenerationResponse {
  code: string;
  language: string;
  quality: number; // 0-100
  tokensUsed: number;
  cost: number; // in cents
  executionTime: number; // in ms
  cacheHit: boolean;
}

/**
 * Cache for frequently generated code
 */
class CodeGenerationCache {
  private cache: Map<string, CodeGenerationResponse> = new Map();
  private maxSize = 1000;

  private getKey(req: CodeGenerationRequest): string {
    return `${req.language}:${req.task}:${req.constraints?.framework || ''}`.toLowerCase();
  }

  get(req: CodeGenerationRequest): CodeGenerationResponse | null {
    return this.cache.get(this.getKey(req)) || null;
  }

  set(req: CodeGenerationRequest, res: CodeGenerationResponse): void {
    const key = this.getKey(req);
    
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, res);
  }

  clear(): void {
    this.cache.clear();
  }

  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

/**
 * DeepSeek Code Agent - Provides code generation capabilities
 */
export class DeepSeekCodeAgent {
  private static instance: DeepSeekCodeAgent;
  private config = getDeepSeekConfig();
  private cache = new CodeGenerationCache();
  private ceoBoot = CEOBot.getInstance();

  private constructor() {
    this.registerWithCEO();
  }

  static getInstance(): DeepSeekCodeAgent {
    if (!DeepSeekCodeAgent.instance) {
      DeepSeekCodeAgent.instance = new DeepSeekCodeAgent();
    }
    return DeepSeekCodeAgent.instance;
  }

  /**
   * Register this agent's capabilities with CEO Bot
   */
  private registerWithCEO(): void {
    const capability: AgentCapability = {
      id: 'deepseek-coder-33b',
      name: 'DeepSeek Coder 33B',
      category: 'code',
      description: 'State-of-the-art open-source code generation - 70+ languages, 16K context',
      costPerCall: 50, // 50 cents per call (estimated)
      trustScore: 95,
      successRate: 92,
      maxContextTokens: 16000,
      specializations: [
        'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp',
        'ruby', 'go', 'rust', 'php', 'sql', 'html', 'css', 'swift',
        'kotlin', 'scala', 'r', 'matlab', 'lua', 'haskell', 'prolog',
        'elixir', 'erlang', 'clojure', 'racket', 'scheme',
      ],
    };

    this.ceoBoot.registerAgent(capability);
    captureMessage('DeepSeek Code Agent registered with CEO Bot', 'info');
  }

  /**
   * Generate code using DeepSeek
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      // Step 1: Check cache first
      const cached = this.cache.get(request);
      if (cached) {
        captureMessage(`Cache hit for ${request.language} code generation`, 'debug');
        return { ...cached, cacheHit: true };
      }

      // Step 2: Validate API configuration
      if (!this.config.apiKey) {
        throw new Error('DeepSeek API key not configured');
      }

      // Step 3: Build prompt
      const prompt = this.buildPrompt(request);

      // Step 4: Call DeepSeek API
      const startTime = Date.now();
      const response = await this.callDeepSeekAPI(prompt, request.language);
      const executionTime = Date.now() - startTime;

      // Step 5: Parse and validate response
      const result: CodeGenerationResponse = {
        code: response.code,
        language: request.language,
        quality: response.quality,
        tokensUsed: response.tokensUsed,
        cost: this.estimateCost(response.tokensUsed),
        executionTime,
        cacheHit: false,
      };

      // Step 6: Cache result
      this.cache.set(request, result);

      // Step 7: Record with CEO for learning
      this.ceoBoot.recordOutcome('deepseek-coder-33b', true, response.quality);

      return result;
    } catch (error) {
      captureException(error);
      throw error;
    }
  }

  /**
   * Build optimized prompt for DeepSeek
   */
  private buildPrompt(request: CodeGenerationRequest): string {
    const parts: string[] = [];

    parts.push(`Language: ${request.language}`);
    
    if (request.constraints?.style) {
      parts.push(`Style: ${request.constraints.style}`);
    }

    if (request.constraints?.framework) {
      parts.push(`Framework: ${request.constraints.framework}`);
    }

    if (request.context) {
      parts.push(`Context:\n${request.context}`);
    }

    parts.push(`Task:\n${request.task}`);

    if (request.constraints?.maxLength) {
      parts.push(`Maximum length: ${request.constraints.maxLength} characters`);
    }

    parts.push('Generate only the code without explanations.');

    return parts.join('\n\n');
  }

  /**
   * Call DeepSeek API (mock implementation for now)
   */
  private async callDeepSeekAPI(
    prompt: string,
    language: string
  ): Promise<{ code: string; quality: number; tokensUsed: number }> {
    // TODO: Integrate actual DeepSeek API call
    // For now, return mock response
    
    captureMessage(`DeepSeek API called for ${language}`, 'debug');

    return {
      code: `// Generated ${language} code\n// TODO: Implement actual DeepSeek API integration`,
      quality: 85,
      tokensUsed: Math.min(prompt.length / 4, 8000),
    };
  }

  /**
   * Estimate cost based on tokens
   */
  private estimateCost(tokens: number): number {
    // DeepSeek pricing: approximately $0.0001 per token
    // 50 cents per call as baseline
    return Math.max(50, Math.floor(tokens * 0.01));
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.stats();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton
export const deepseekAgent = DeepSeekCodeAgent.getInstance();

export default DeepSeekCodeAgent;
