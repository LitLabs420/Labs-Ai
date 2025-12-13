/**
 * 🚀 DeepSeek Configuration
 * Extends APIKeyConfig with DeepSeek API support.
 * CEO Bot uses DeepSeek as the default code generation engine.
 */

export interface DeepSeekConfig {
  deepseek: {
    apiKey: string;
    baseUrl: string;
    models: {
      coder: string; // deepseek-coder-33b-instruct (default for code)
      chat: string;  // deepseek-chat (for reasoning)
      reasoning: string; // deepseek-reasoner (for complex logic)
    };
    defaultModel: 'coder' | 'chat' | 'reasoning';
  };
}

/**
 * Validate and get DeepSeek configuration
 */
export function getDeepSeekConfig(): DeepSeekConfig['deepseek'] {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ DEEPSEEK_API_KEY not configured - DeepSeek features disabled');
  }

  return {
    apiKey: apiKey || '',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    models: {
      coder: process.env.DEEPSEEK_CODER_MODEL || 'deepseek-coder-33b-instruct',
      chat: process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-chat',
      reasoning: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
    },
    defaultModel: (process.env.DEEPSEEK_DEFAULT_MODEL as any) || 'coder',
  };
}

export default getDeepSeekConfig;
