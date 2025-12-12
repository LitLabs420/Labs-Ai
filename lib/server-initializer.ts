/**
 * 🚀 Server Initialization System
 * Handles all startup tasks, API validation, and service initialization
 */

import './config';
import { initializeApp as initializeFirebase } from 'firebase/app';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { captureMessage } from './sentry';

/**
 * Service initialization status
 */
export interface InitializationStatus {
  timestamp: Date;
  firebase: { initialized: boolean; error?: string };
  googleAI: { initialized: boolean; error?: string };
  openAI: { initialized: boolean; error?: string };
  stripe: { initialized: boolean; error?: string };
  nats: { initialized: boolean; error?: string };
  redis: { initialized: boolean; error?: string };
  email: { initialized: boolean; error?: string };
  allHealthy: boolean;
}

class ServerInitializer {
  private static instance: ServerInitializer;
  private initialized = false;
  private initializationStatus: InitializationStatus = {
    timestamp: new Date(),
    firebase: { initialized: false },
    googleAI: { initialized: false },
    openAI: { initialized: false },
    stripe: { initialized: false },
    nats: { initialized: false },
    redis: { initialized: false },
    email: { initialized: false },
    allHealthy: false,
  };

  private googleAI: GoogleGenerativeAI | null = null;
  private openAIClient: OpenAI | null = null;

  /**
   * Singleton pattern
   */
  static getInstance(): ServerInitializer {
    if (!ServerInitializer.instance) {
      ServerInitializer.instance = new ServerInitializer();
    }
    return ServerInitializer.instance;
  }

  /**
   * Initialize all services on startup
   */
  async initialize(): Promise<InitializationStatus> {
    if (this.initialized) {
      console.log('✅ Server already initialized');
      return this.initializationStatus;
    }

    console.log('\n🚀 Starting LitLabs Server Initialization...\n');
    
    const config = getConfig();
    
    // Run all initialization tasks in parallel
    await Promise.all([
      this.initializeFirebase(config),
      this.initializeGoogleAI(config),
      this.initializeOpenAI(config),
      this.initializeStripe(config),
      this.initializeNATS(config),
      this.initializeRedis(config),
      this.initializeEmail(config),
    ]);

    // Determine overall health
    const services = Object.entries(this.initializationStatus)
      .filter(([key]) => key !== 'timestamp' && key !== 'allHealthy')
      .map(([_, status]) => status as any);

    const criticalServices = ['firebase', 'googleAI', 'stripe'];
    const allCriticalHealthy = criticalServices.every(
      service => this.initializationStatus[service as keyof Omit<InitializationStatus, 'timestamp' | 'allHealthy'>].initialized
    );

    this.initializationStatus.allHealthy = allCriticalServices && allCriticalHealthy;
    this.initializationStatus.timestamp = new Date();

    this.logInitializationStatus();

    this.initialized = true;
    return this.initializationStatus;
  }

  /**
   * Initialize Firebase
   */
  private async initializeFirebase(config: any): Promise<void> {
    try {
      // Firebase initialization is handled by the client/admin libraries
      // Just verify configuration is present
      if (!config.firebase.projectId || !config.firebase.apiKey) {
        throw new Error('Firebase configuration incomplete');
      }

      this.initializationStatus.firebase.initialized = true;
      console.log('✅ Firebase initialized');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.firebase.error = msg;
      console.error('❌ Firebase initialization failed:', msg);
      captureException(error, 'firebase_init_error');
    }
  }

  /**
   * Initialize Google Generative AI (Gemini)
   */
  private async initializeGoogleAI(config: any): Promise<void> {
    try {
      if (!config.google.generativeAI) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
      }

      this.googleAI = new GoogleGenerativeAI(config.google.generativeAI);

      // Test the API connection
      const model = this.googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('Test');

      this.initializationStatus.googleAI.initialized = true;
      console.log('✅ Google Generative AI (Gemini) initialized');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.googleAI.error = msg;
      console.error('❌ Google AI initialization failed:', msg);
      captureException(error, 'google_ai_init_error');
    }
  }

  /**
   * Initialize OpenAI (ChatGPT, GPT-4)
   */
  private async initializeOpenAI(config: any): Promise<void> {
    try {
      if (!config.openai.apiKey) {
        console.warn('⚠️  OpenAI not configured (optional)');
        return;
      }

      this.openAIClient = new OpenAI({
        apiKey: config.openai.apiKey,
        organization: config.openai.orgId,
      });

      // Test the API connection
      await this.openAIClient.models.list();

      this.initializationStatus.openAI.initialized = true;
      console.log('✅ OpenAI (ChatGPT/GPT-4) initialized');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.openAI.error = msg;
      console.warn('⚠️  OpenAI initialization failed (optional):', msg);
    }
  }

  /**
   * Initialize Stripe
   */
  private async initializeStripe(config: any): Promise<void> {
    try {
      if (!config.stripe.secret || !config.stripe.publishable) {
        throw new Error('Stripe keys not configured');
      }

      // Stripe initialization is handled by getStripe() in lib/stripe.ts
      // Just verify configuration
      if (!config.stripe.prices.pro || !config.stripe.prices.starter) {
        console.warn('⚠️  Some Stripe price IDs not configured');
      }

      this.initializationStatus.stripe.initialized = true;
      console.log('✅ Stripe initialized');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.stripe.error = msg;
      console.error('❌ Stripe initialization failed:', msg);
      captureException(error, 'stripe_init_error');
    }
  }

  /**
   * Initialize NATS (Message Queue)
   */
  private async initializeNATS(config: any): Promise<void> {
    try {
      if (!config.messaging.nats.url) {
        console.warn('⚠️  NATS not configured (optional)');
        return;
      }

      // NATS connection is lazy-initialized when needed
      console.log('✅ NATS configured (lazy initialization)');
      this.initializationStatus.nats.initialized = true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.nats.error = msg;
      console.warn('⚠️  NATS configuration incomplete:', msg);
    }
  }

  /**
   * Initialize Redis (Cache/Rate Limiting)
   */
  private async initializeRedis(config: any): Promise<void> {
    try {
      if (!config.messaging.redis.url) {
        console.warn('⚠️  Redis not configured (optional)');
        return;
      }

      // Redis connection is lazy-initialized when needed
      console.log('✅ Redis configured (lazy initialization)');
      this.initializationStatus.redis.initialized = true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.redis.error = msg;
      console.warn('⚠️  Redis configuration incomplete:', msg);
    }
  }

  /**
   * Initialize Email Service (Resend)
   */
  private async initializeEmail(config: any): Promise<void> {
    try {
      if (!config.communications.resend.apiKey) {
        console.warn('⚠️  Email (Resend) not configured (optional)');
        return;
      }

      this.initializationStatus.email.initialized = true;
      console.log('✅ Email service (Resend) configured');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.initializationStatus.email.error = msg;
      console.warn('⚠️  Email service initialization failed:', msg);
    }
  }

  /**
   * Log initialization status
   */
  private logInitializationStatus(): void {
    console.log('\n📊 INITIALIZATION STATUS REPORT');
    console.log('================================\n');

    const status = this.initializationStatus;
    const formatStatus = (s: any) => s.initialized ? '✅' : `❌ ${s.error || 'Not configured'}`;

    console.log(`Firebase:    ${formatStatus(status.firebase)}`);
    console.log(`Google AI:   ${formatStatus(status.googleAI)}`);
    console.log(`OpenAI:      ${formatStatus(status.openAI)}`);
    console.log(`Stripe:      ${formatStatus(status.stripe)}`);
    console.log(`NATS:        ${formatStatus(status.nats)}`);
    console.log(`Redis:       ${formatStatus(status.redis)}`);
    console.log(`Email:       ${formatStatus(status.email)}`);

    console.log('\n' + (status.allHealthy 
      ? '🟢 ALL CRITICAL SERVICES INITIALIZED' 
      : '🔴 SOME CRITICAL SERVICES FAILED'));
    console.log('================================\n');

    if (status.allHealthy) {
      captureMessage('Server initialization successful', 'info');
    }
  }

  /**
   * Get Google AI instance
   */
  getGoogleAI(): GoogleGenerativeAI | null {
    return this.googleAI;
  }

  /**
   * Get OpenAI instance
   */
  getOpenAI(): OpenAI | null {
    return this.openAIClient;
  }

  /**
   * Get initialization status
   */
  getStatus(): InitializationStatus {
    return this.initializationStatus;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<InitializationStatus> {
    return this.initializationStatus;
  }
}

// Export singleton
export const Initializer = ServerInitializer.getInstance();

/**
 * Initialize on demand
 */
export async function initializeServer(): Promise<InitializationStatus> {
  return Initializer.initialize();
}

/**
 * Get initialized AI clients
 */
export function getAIClients() {
  return {
    google: Initializer.getGoogleAI(),
    openai: Initializer.getOpenAI(),
  };
}

export default Initializer;
