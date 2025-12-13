/**
 * 🔐 Centralized Configuration Management
 * Validates all API keys and environment variables on startup
 * Provides type-safe access to all configuration values
 */

export interface APIKeyConfig {
  google: {
    generativeAI: string;
    cloud: {
      projectId: string;
      bigqueryDataset: string;
      storageBucket: string;
    };
  };
  openai: {
    apiKey: string;
    orgId?: string;
  };
  stripe: {
    publishable: string;
    secret: string;
    webhookSecret: string;
    prices: {
      free?: string;
      starter: string;
      creator: string;
      pro: string;
      agency: string;
      enterprise: string;
    };
  };
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    databaseUrl: string;
    storageBucket: string;
    admin: {
      projectId: string;
      privateKey: string;
      clientEmail: string;
    };
  };
  communications: {
    whatsapp: {
      accountId: string;
      apiToken: string;
      phoneNumberId: string;
    };
    resend: {
      apiKey: string;
    };
    twilio: {
      accountSid: string;
      authToken: string;
      fromPhone: string;
    };
  };
  messaging: {
    nats: {
      url: string;
      user?: string;
      password?: string;
    };
    redis: {
      url: string;
      password?: string;
    };
  };
  security: {
    internalWebhookSecret: string;
    jwtSecret: string;
    encryptionKey: string;
    recaptcha: {
      siteKey: string;
      secretKey: string;
    };
  };
  monitoring: {
    sentry: {
      dsn: string;
      env: string;
    };
  };
  app: {
    apiUrl: string;
    baseUrl: string;
    appUrl: string;
    env: 'development' | 'production' | 'test';
  };
}

/**
 * Configuration validator - checks all required env vars
 */
function validateConfig(): APIKeyConfig {
  const errors: string[] = [];

  // Check critical API keys
  const requiredKeys = [
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_API_KEY',
  ];

  for (const key of requiredKeys) {
    if (!process.env[key]) {
      errors.push(`Missing critical environment variable: ${key}`);
    }
  }

  // Validate API key formats
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('Invalid STRIPE_SECRET_KEY format (should start with sk_)');
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('Invalid STRIPE_PUBLISHABLE_KEY format (should start with pk_)');
  }

  if (errors.length > 0) {
    console.error('🚨 Configuration Validation Errors:');
    errors.forEach(err => console.error(`  ❌ ${err}`));
    throw new Error(`Configuration validation failed: ${errors.join('; ')}`);
  }

  const config: APIKeyConfig = {
    google: {
      generativeAI: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
      cloud: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        bigqueryDataset: process.env.GOOGLE_CLOUD_BIGQUERY_DATASET || 'litlabs_analytics',
        storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '',
      },
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      orgId: process.env.NEXT_PUBLIC_OPENAI_ORG_ID,
    },
    stripe: {
      publishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secret: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      prices: {
        free: process.env.NEXT_PUBLIC_STRIPE_PRICE_FREE,
        starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '',
        creator: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR || '',
        pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
        agency: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || '',
        enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '',
      },
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      databaseUrl: process.env.FIREBASE_DATABASE_URL || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      admin: {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY || '',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
      },
    },
    communications: {
      whatsapp: {
        accountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
        apiToken: process.env.WHATSAPP_BUSINESS_API_TOKEN || '',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      },
      resend: {
        apiKey: process.env.RESEND_API_KEY || '',
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromPhone: process.env.TWILIO_FROM_PHONE || '',
      },
    },
    messaging: {
      nats: {
        url: process.env.NATS_URL || 'nats://localhost:4222',
        user: process.env.NATS_USER,
        password: process.env.NATS_PASSWORD,
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
      },
    },
    security: {
      internalWebhookSecret: process.env.INTERNAL_WEBHOOK_SECRET || '',
      jwtSecret: process.env.JWT_SECRET || '',
      encryptionKey: process.env.ENCRYPTION_KEY || '',
      recaptcha: {
        siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
        secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
      },
    },
    monitoring: {
      sentry: {
        dsn: process.env.SENTRY_DSN || '',
        env: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',
      },
    },
    app: {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      env: (process.env.NODE_ENV as any) || 'development',
    },
  };

  return config;
}

// Initialize configuration once
let configInstance: APIKeyConfig | null = null;

/**
 * Get validated configuration (lazy load)
 */
export function getConfig(): APIKeyConfig {
  if (!configInstance) {
    configInstance = validateConfig();
  }
  return configInstance;
}

/**
 * Force reload configuration (useful for testing)
 */
export function reloadConfig(): APIKeyConfig {
  configInstance = null;
  return getConfig();
}

/**
 * Check if a specific API is configured
 */
export function isAPIConfigured(apiName: keyof APIKeyConfig): boolean {
  const config = getConfig();
  const apiConfig = config[apiName];
  
  if (typeof apiConfig === 'object' && apiConfig !== null) {
    const values = Object.values(apiConfig);
    return values.some(v => {
      if (typeof v === 'object') {
        return Object.values(v).some(val => val && String(val).length > 0);
      }
      return v && String(v).length > 0;
    });
  }
  
  return false;
}

/**
 * Log configuration status
 */
export function logConfigStatus(): void {
  // const config = getConfig(); // unused
  
  console.log('\n🔍 Configuration Status:');
  console.log('========================\n');
  
  const apis: (keyof APIKeyConfig)[] = [
    'google',
    'openai',
    'stripe',
    'firebase',
    'communications',
    'messaging',
    'security',
    'monitoring',
  ];
  
  for (const api of apis) {
    const status = isAPIConfigured(api) ? '✅' : '⚠️';
    console.log(`${status} ${api.toUpperCase()}`);
  }
  
  console.log('\n========================\n');
}

// Export a singleton instance getter
export const Config = {
  get: getConfig,
  reload: reloadConfig,
  isConfigured: isAPIConfigured,
  logStatus: logConfigStatus,
};

export default getConfig;
