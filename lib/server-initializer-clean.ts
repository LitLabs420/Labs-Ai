/**
 * 🚀 Server Initialization System
 * Handles all startup tasks, API validation, and service initialization
 * 
 * NOTE: OpenAI integration is disabled by default.
 */

import { getConfig } from './config';
import { GoogleGenerativeAI } from '@google/generative-ai';
// import OpenAI from 'openai'; // Disabled - package not installed
import { captureMessage, captureException } from './sentry';

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
  private openAIClient: any | null = null; // OpenAI disabled

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
    ]);

    // Determine overall health
    const criticalServices = ['firebase', 'googleAI', 'stripe'];
    const allCriticalHealthy = criticalServices.every(
      service => this.initializationStatus[service as keyof Omit<InitializationStatus, 'timestamp' | 'allHealthy'>].initialized
    );

    this.initializationStatus.allHealthy = allCriticalHealthy;
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
      const { initializeApp, getApps } = await import('firebase/app');

      if (!getApps().length) {
        initializeApp({
          apiKey: config.firebase.apiKey,
          authDomain: config.firebase.authDomain,
          projectId: config.firebase.projectId,
          storageBucket: config.firebase.storageBucket,
        });
      }

      this.initializationStatus.firebase = { initialized: true };
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      this.initializationStatus.firebase = {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      captureException(error, { context: 'firebase_init_error' });
      console.error('❌ Firebase initialization failed:', error);
    }
  }

  /**
   * Initialize Google Generative AI
   */
  private async initializeGoogleAI(config: any): Promise<void> {
    try {
      this.googleAI = new GoogleGenerativeAI(config.google.generativeAI);
      this.initializationStatus.googleAI = { initialized: true };
      console.log('✅ Google Generative AI initialized successfully');
    } catch (error) {
      this.initializationStatus.googleAI = {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      captureException(error, { context: 'google_ai_init_error' });
      console.error('❌ Google AI initialization failed:', error);
    }
  }

  /**
   * Initialize OpenAI (DISABLED - package not installed)
   */
  private async initializeOpenAI(config: any): Promise<void> {
    try {
      // OpenAI is disabled by default
      this.initializationStatus.openAI = { 
        initialized: false,
        error: 'OpenAI package not installed. Feature disabled.'
      };
      console.log('ℹ️  OpenAI initialization skipped (package not installed)');
      
      /* UNCOMMENT TO ENABLE:
      this.openAIClient = new OpenAI({
        apiKey: config.openai.apiKey,
        organization: config.openai.orgId,
      });
      this.initializationStatus.openAI = { initialized: true };
      console.log('✅ OpenAI initialized successfully');
      */
    } catch (error) {
      this.initializationStatus.openAI = {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      captureException(error, { context: 'openai_init_error' });
      console.error('❌ OpenAI initialization failed:', error);
    }
  }

  /**
   * Initialize Stripe
   */
  private async initializeStripe(config: any): Promise<void> {
    try {
      const Stripe = (await import('stripe')).default;
      new Stripe(config.stripe.secret);
      this.initializationStatus.stripe = { initialized: true };
      console.log('✅ Stripe initialized successfully');
    } catch (error) {
      this.initializationStatus.stripe = {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      captureException(error, { context: 'stripe_init_error' });
      console.error('❌ Stripe initialization failed:', error);
    }
  }

  /**
   * Log initialization status
   */
  private logInitializationStatus(): void {
    console.log('\n📊 Initialization Status Report:');
    console.log('================================');
    Object.entries(this.initializationStatus).forEach(([key, value]) => {
      if (key !== 'timestamp' && key !== 'allHealthy') {
        const service = value as { initialized: boolean; error?: string };
        const status = service.initialized ? '✅' : '❌';
        console.log(`${status} ${key}: ${service.initialized ? 'Healthy' : 'Failed'}`);
        if (service.error) {
          console.log(`   └─ Error: ${service.error}`);
        }
      }
    });
    console.log('================================');
    console.log(
      `🎉 Overall Status: ${this.initializationStatus.allHealthy ? 'ALL SYSTEMS HEALTHY ✅' : 'SOME SERVICES DEGRADED ⚠️'}\n`
    );

    if (this.initializationStatus.allHealthy) {
      captureMessage('Server initialization successful', 'info');
    }
  }

  /**
   * Get initialization status
   */
  getStatus(): InitializationStatus {
    return this.initializationStatus;
  }

  /**
   * Get AI clients
   */
  getGoogleAI(): GoogleGenerativeAI | null {
    return this.googleAI;
  }

  getOpenAI(): any | null {
    return this.openAIClient;
  }

  /**
   * Check if services are ready
   */
  isReady(): boolean {
    return this.initialized && this.initializationStatus.allHealthy;
  }
}

// Export singleton
export const Initializer = ServerInitializer.getInstance();

/**
 * Initialize server on startup
 */
export async function initializeServer(): Promise<InitializationStatus> {
  return Initializer.initialize();
}

export function getAIClients() {
  return {
    googleAI: Initializer.getGoogleAI(),
    openAI: Initializer.getOpenAI(),
  };
}

export default Initializer;
