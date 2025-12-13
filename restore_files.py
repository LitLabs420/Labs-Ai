import os

config_deepseek_content = r"""/**
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
"""

server_initializer_content = r"""/**
 * 🚀 Server Initialization System.
 * Initializes all critical services on application startup.
 * Includes Firebase, Google AI, OpenAI, AND DeepSeek.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { getConfig } from './config';
import { getDeepSeekConfig } from './config-deepseek';
import { captureMessage, captureException } from './sentry';

/**
 * Initialization status for each service
 */
export interface InitializationStatus {
  status: 'initialized' | 'partial' | 'failed';
  timestamp: Date;
  services: {
    firebase: boolean;
    googleAI: boolean;
    openai: boolean;
    deepseek: boolean;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Server Initializer - Singleton pattern for service initialization
 */
class ServerInitializer {
  private static instance: ServerInitializer;
  private status: InitializationStatus | null = null;
  private googleAI: GoogleGenerativeAI | null = null;
  private openai: OpenAI | null = null;
  private deepseekClient: OpenAI | null = null;

  private constructor() {}

  /**
   * Get or create singleton instance
   */
  static getInstance(): ServerInitializer {
    if (!ServerInitializer.instance) {
      ServerInitializer.instance = new ServerInitializer();
    }
    return ServerInitializer.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<InitializationStatus> {
    if (this.status) {
      return this.status;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const services = {
      firebase: false,
      googleAI: false,
      openai: false,
      deepseek: false,
    };

    try {
      // Initialize Google Generative AI
      try {
        const config = getConfig();
        if (config.google.generativeAI) {
          this.googleAI = new GoogleGenerativeAI(config.google.generativeAI);
          services.googleAI = true;
          captureMessage('Google Generative AI initialized', 'info');
        } else {
          warnings.push('Google Generative AI API key not configured');
        }
      } catch (error) {
        errors.push(
          `Google Generative AI initialization failed: ${error instanceof Error ? error.message : String(error)}`
        );
        captureException(error);
      }

      // Initialize OpenAI
      try {
        const config = getConfig();
        if (config.openai.apiKey) {
          this.openai = new OpenAI({
            apiKey: config.openai.apiKey,
            organization: config.openai.orgId,
          });
          services.openai = true;
          captureMessage('OpenAI initialized', 'info');
        } else {
          warnings.push('OpenAI API key not configured');
        }
      } catch (error) {
        errors.push(
          `OpenAI initialization failed: ${error instanceof Error ? error.message : String(error)}`
        );
        captureException(error);
      }

      // Initialize DeepSeek
      try {
        const deepseekConfig = getDeepSeekConfig();
        if (deepseekConfig.apiKey) {
          // Initialize DeepSeek client using OpenAI SDK (compatible)
          this.deepseekClient = new OpenAI({
            apiKey: deepseekConfig.apiKey,
            baseURL: deepseekConfig.baseUrl,
          });
          services.deepseek = true;
          captureMessage('DeepSeek initialized as default code generation provider', 'info');
        } else {
          warnings.push('DeepSeek API key not configured - code generation will fallback to Google AI');
        }
      } catch (error) {
        errors.push(
          `DeepSeek initialization failed: ${error instanceof Error ? error.message : String(error)}`
        );
        captureException(error);
      }

      // Firebase is initialized via environment config (admin SDK)
      // Verify it's accessible
      try {
        const config = getConfig();
        if (config.firebase.admin.projectId && config.firebase.admin.privateKey) {
          services.firebase = true;
          captureMessage('Firebase Admin SDK configured', 'info');
        } else {
          warnings.push('Firebase Admin SDK not fully configured');
        }
      } catch (error) {
        errors.push(
          `Firebase configuration check failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // Build status
      const allServicesInitialized = Object.values(services).every(v => v);
      const someServicesInitialized = Object.values(services).some(v => v);

      this.status = {
        status: allServicesInitialized ? 'initialized' : someServicesInitialized ? 'partial' : 'failed',
        timestamp: new Date(),
        services,
        errors,
        warnings,
      };

      // Log initialization results
      this.logInitializationStatus();

      return this.status;
    } catch (error) {
      captureException(error);
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  getStatus(): InitializationStatus {
    if (!this.status) {
      throw new Error('Server not initialized. Call initialize() first.');
    }
    return this.status;
  }

  /**
   * Get AI clients
   */
  getAIClients() {
    return {
      googleAI: this.googleAI,
      openai: this.openai,
      deepseek: this.deepseekClient,
    };
  }

  /**
   * Get specific AI client
   */
  getAIClient(provider: 'google' | 'openai' | 'deepseek') {
    switch (provider) {
      case 'google':
        return this.googleAI;
      case 'openai':
        return this.openai;
      case 'deepseek':
        return this.deepseekClient;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  /**
   * Check if a service is available
   */
  isServiceAvailable(service: keyof InitializationStatus['services']): boolean {
    if (!this.status) {
      throw new Error('Server not initialized');
    }
    return this.status.services[service];
  }

  /**
   * Log initialization status
   */
  private logInitializationStatus(): void {
    if (!this.status) return;

    console.log('\n🚀 Server Initialization Status');
    console.log('================================\n');

    console.log(`Status: ${this.status.status.toUpperCase()}`);
    console.log(`Timestamp: ${this.status.timestamp.toISOString()}\n`);

    console.log('Services:');
    const { services } = this.status;
    console.log(`  ${services.firebase ? '✅' : '❌'} Firebase Admin SDK`);
    console.log(`  ${services.googleAI ? '✅' : '❌'} Google Generative AI`);
    console.log(`  ${services.openai ? '✅' : '❌'} OpenAI`);
    console.log(`  ${services.deepseek ? '✅' : '❌'} DeepSeek (Default Code Generation)`);

    if (this.status.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.status.warnings.forEach(w => console.log(`  - ${w}`));
    }

    if (this.status.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.status.errors.forEach(e => console.log(`  - ${e}`));
    }

    console.log('\n================================\n');
  }

  /**
   * Force reinitialize (useful for testing)
   */
  reset(): void {
    this.status = null;
    this.googleAI = null;
    this.openai = null;
    this.deepseekClient = null;
  }
}

// Export singleton instance
export const Initializer = ServerInitializer.getInstance();

/**
 * Initialize server on module load (if in Node environment)
 */
export async function initializeServer(): Promise<InitializationStatus> {
  const initializer = ServerInitializer.getInstance();
  return await initializer.initialize();
}

/**
 * Get AI clients
 */
export function getAIClients() {
  const initializer = ServerInitializer.getInstance();
  return initializer.getAIClients();
}

export default ServerInitializer;
"""

with open('lib/config-deepseek.ts', 'w', encoding='utf-8') as f:
    f.write(config_deepseek_content)

with open('lib/server-initializer.ts', 'w', encoding='utf-8') as f:
    f.write(server_initializer_content)

print("Files restored successfully.")
